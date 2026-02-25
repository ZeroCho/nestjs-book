# AI 비서 웹 애플리케이션

NestJS로 구축한 멀티 AI 비서 애플리케이션

## 기능

- OpenAI GPT, Anthropic Claude, Google Gemini 지원
- 실시간 스트리밍 채팅
- 세션 기반 대화 히스토리 관리
- Redis를 활용한 세션 저장소

## 설치

```bash
npm install
```

## 환경변수 설정

`.env` 파일을 생성하고 다음 정보를 입력하세요:

```env
PORT=3000
NODE_ENV=development

# AI API 키
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GEMINI_API_KEY=your-gemini-key

# 세션 및 Redis
SESSION_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Redis 실행

```bash
# Docker 사용 시
docker run -d -p 6379:6379 redis

# 로컬 설치 시
redis-server
```

## 실행

```bash
# 개발 모드
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

## 사용법

1. 브라우저에서 `http://localhost:3000` 접속
2. AI 프로바이더 선택 (OpenAI/Anthropic/Gemini)
3. 메시지 입력 후 전송
4. 실시간으로 AI 응답 확인

## 주요 API

- `GET /` - 메인 페이지
- `POST /chat/stream` - 스트리밍 채팅
- `POST /chat/clear` - 대화 히스토리 초기화

## 라이선스

MIT
