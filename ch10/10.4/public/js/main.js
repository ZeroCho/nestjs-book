class ChatApp {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.currentProvider = '';
    this.isLoading = false;
    this.abortController = null;
    this.providers = [];
    this.providerDisplayNames = {};

    this.elements = {
      chatForm: document.getElementById('chat-form'),
      messageInput: document.getElementById('message-input'),
      chatMessages: document.getElementById('chat-messages'),
      modelSelect: document.getElementById('model-select'),
      sendButton: document.querySelector('.send-button'),
      sidebar: document.getElementById('sidebar'),
      toggleSidebarBtn: document.getElementById('toggle-sidebar'),
    };

    this.init();
  }

  async init() {
    await this.loadProviders();
    this.attachEventListeners();

    this.createNewSession();
  }

  async loadProviders() {
    try {
      const response = await fetch('/api/chat/providers');
      const data = await response.json();

      this.providers = data.providers;
      this.providerDisplayNames = {};

      // 표시 이름 매핑 생성
      data.providers.forEach((provider) => {
        this.providerDisplayNames[provider.value] = provider.label;
      });

      // 기본 프로바이더 설정
      if (data.default) {
        this.currentProvider = data.default;
      }

      // 모델 선택 드롭다운 동적 생성
      this.elements.modelSelect.innerHTML = '';
      this.providers.forEach((provider) => {
        const option = document.createElement('option');
        option.value = provider.value;
        option.textContent = provider.label;
        if (provider.value === this.currentProvider) {
          option.selected = true;
        }
        this.elements.modelSelect.appendChild(option);
      });
    } catch (error) {
      console.error('프로바이더 목록을 불러오는 중 오류 발생:', error);
      // 기본값으로 폴백
      this.providers = [
        { value: 'openai', label: 'GPT-5' },
        { value: 'claude', label: 'Claude' },
        { value: 'gemini', label: 'Gemini' },
      ];
      this.providerDisplayNames = {
        openai: 'GPT-5',
        claude: 'Claude',
        gemini: 'Gemini',
      };
    }
  }

  attachEventListeners() {
    // 채팅 폼 제출 이벤트
    this.elements.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSendMessage();
    });

    // 모델 선택 변경 이벤트
    this.elements.modelSelect.addEventListener('change', (e) => {
      this.currentProvider = e.target.value;
      const displayName =
        this.providerDisplayNames[e.target.value] || e.target.value;
      this.addSystemMessage(`AI 모델이 ${displayName}로 변경되었습니다.`);
    });

    // 사이드바 토글 버튼 이벤트
    if (this.elements.toggleSidebarBtn) {
      this.elements.toggleSidebarBtn.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }
  }

  addSystemMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.textContent = content;
    messageDiv.style.cssText = `       background: #F3F4F6;
      color: #6B7280;
      text-align: center;
      font-size: 0.875rem;
      padding: 8px 12px;
      margin: 8px auto;
      max-width: 80%;
      border-radius: 8px;
    `;

    this.elements.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message ai typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    this.elements.chatMessages.appendChild(indicator);
    this.scrollToBottom();
    return indicator;
  }

  toggleSidebar() {
    if (this.elements.sidebar) {
      const isCollapsed = this.elements.sidebar.classList.contains('collapsed');
      const chatHeader = document.querySelector('.chat-header');

      if (isCollapsed) {
        // 사이드바 열기
        this.elements.sidebar.classList.remove('collapsed');
        this.elements.toggleSidebarBtn.textContent = '←';

        // 플로팅 토글 버튼 제거
        const floatToggle = document.querySelector('.sidebar-toggle-float');
        if (floatToggle) {
          floatToggle.remove();
        }
        document.querySelector('.chat-header').style.paddingLeft = '19px';
      } else {
        // 사이드바 닫기
        this.elements.sidebar.classList.add('collapsed');

        // 플로팅 토글 버튼 추가
        if (chatHeader && !chatHeader.querySelector('.sidebar-toggle-float')) {
          const floatToggle = document.createElement('button');
          floatToggle.className = 'sidebar-toggle-float';
          floatToggle.textContent = '→';
          floatToggle.addEventListener('click', () => {
            this.toggleSidebar();
          });
          chatHeader.appendChild(floatToggle);
        }
        document.querySelector('.chat-header').style.paddingLeft = '80px';
      }
    }
  }

  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatSessionId', sessionId);
    }
    return sessionId;
  }

  async handleSendMessage() {
    const message = this.elements.messageInput.value.trim();

    if (!message || this.isLoading) {
      return;
    }

    this.addMessage(message, 'user');
    this.elements.messageInput.value = '';

    this.setLoading(true);
    const typingIndicator = this.showTypingIndicator();

    this.abortController = new AbortController();

    try {
      await this.streamChatResponse(message);
      typingIndicator.remove();
    } catch (error) {
      typingIndicator.remove();

      if (error.name === 'AbortError') {
        this.addMessage('[스트리밍이 중단되었습니다]', 'ai');
      } else {
        this.addMessage('죄송합니다. 오류가 발생했습니다.', 'ai');
        console.error('Chat error:', error);
      }
    } finally {
      this.setLoading(false);
      this.abortController = null;
    }
  }

  async streamChatResponse(message) {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        provider: this.currentProvider,
        sessionId: this.sessionId,
      }),
      signal: this.abortController.signal,
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let messageDiv = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          if (data.chunk) {
            if (!messageDiv) {
              messageDiv = document.createElement('div');
              messageDiv.className = 'message ai';
              this.elements.chatMessages.appendChild(messageDiv);
            }

            fullResponse += data.chunk;
            messageDiv.innerHTML = marked.parse(fullResponse);
            this.scrollToBottom();
          }

          if (data.done) {
            break;
          }
        }
      }
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.elements.messageInput.disabled = loading;

    if (loading) {
      this.elements.sendButton.innerHTML = '중단';
      this.elements.sendButton.onclick = (e) => {
        e.preventDefault();
        this.abortStreaming();
      };
    } else {
      this.elements.sendButton.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke-width="2"/>
      </svg>
    `;
      this.elements.sendButton.onclick = null;
    }
  }

  createNewSession() {
    this.currentSession = {};
    this.elements.chatMessages.innerHTML = '';
    this.displayWelcomeMessage();
  }

  displayWelcomeMessage() {
    const welcomeMsg = '안녕하세요! 👋 무엇을 도와드릴까요?';
    this.addMessage(welcomeMsg, 'ai');
  }

  scrollToBottom() {
    this.elements.chatMessages.scrollTop =
      this.elements.chatMessages.scrollHeight;
  }

  abortStreaming() {
    if (this.abortController) {
      this.abortController.abort();
      this.showToast('스트리밍이 중단되었습니다.', 'info');
    }
  }

  addMessage(content, type = 'user', renderMarkdown = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    if (renderMarkdown && type === 'ai') {
      messageDiv.innerHTML = marked.parse(content);
    } else {
      messageDiv.textContent = content;
    }

    if (type === 'ai') {
      const wrapper = document.createElement('div');
      wrapper.className = 'message-wrapper';
      wrapper.appendChild(messageDiv);

      this.elements.chatMessages.appendChild(wrapper);
    } else {
      this.elements.chatMessages.appendChild(messageDiv);
    }
    this.scrollToBottom();
  }

  showToast(message, type = 'info') {
    // Toast 컨테이너 생성 또는 가져오기
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    // Toast 요소 생성
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Toast를 컨테이너에 추가
    toastContainer.appendChild(toast);

    // 애니메이션을 위해 약간의 지연 후 show 클래스 추가
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // 3초 후 자동 제거
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300); // 애니메이션 시간과 일치
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new ChatApp();
  window.chatApp = app;
});
