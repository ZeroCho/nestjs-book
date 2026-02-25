import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';
import { AIMessage } from '../ai/interfaces/ai-provider.interface';

export interface ChatSession {
  id: string;
  messages: AIMessage[];
  createdAt: Date;
  lastActivity: Date;
}

@Injectable()
export class ChatService {
  private sessions: Map<string, ChatSession> = new Map();
  private maxHistoryLength: number;

  constructor(
    private aiService: AiService,
    private configService: ConfigService,
  ) {
    this.maxHistoryLength =
      this.configService.get<number>('app.maxHistoryLength') || 10;
  }

  getOrCreateSession(sessionId?: string): ChatSession {
    if (!sessionId) {
      sessionId = this.generateSessionId();
    }

    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        id: sessionId,
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date(),
      };
      this.sessions.set(sessionId, session);
    }

    return session;
  }

  addMessage(sessionId: string, message: AIMessage): void {
    const session = this.getOrCreateSession(sessionId);
    session.messages.push(message);
    session.lastActivity = new Date();

    // 히스토리 길이 제한
    if (session.messages.length > this.maxHistoryLength * 2) {
      session.messages = session.messages.slice(-this.maxHistoryLength * 2);
    }
  }

  getSessionMessages(sessionId: string): AIMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? [...session.messages] : [];
  }

  async *chatStream(
    sessionId: string,
    userMessage: string,
    provider?: string,
  ): AsyncIterable<string> {
    // 사용자 메시지 추가
    const userMsg: AIMessage = {
      role: 'user',
      content: userMessage,
    };
    this.addMessage(sessionId, userMsg);

    // AI 응답 스트리밍
    const messages = this.getSessionMessages(sessionId);
    let fullResponse = '';

    for await (const chunk of this.aiService.streamText(messages, provider)) {
      fullResponse += chunk;
      yield chunk;
    }

    // AI 응답 저장
    const assistantMsg: AIMessage = {
      role: 'assistant',
      content: fullResponse,
    };
    this.addMessage(sessionId, assistantMsg);
  }

  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
