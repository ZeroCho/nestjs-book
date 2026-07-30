# N-7. Nest 심화 — DI 스캐너 · 게이트웨이(웹소켓) · 이벤트 · 전역 등록

> 섹션 7에서는 AI 비서 앱을 만드는 데 필요한 것까지만 다뤘습니다.
> 이 노트는 그 너머 — **네스트가 내부에서 어떻게 돌아가는지**, 그리고 실시간 기능입니다.
> 몰라도 개발은 되지만, 알면 **에러 메시지가 읽히기 시작합니다.**

---

## 1. 프로바이더와 의존성 스캐너 — 네스트 부팅의 내부

### 왜 알아야 하나

이 에러, 네스트 쓰면 반드시 만납니다.

```
Nest can't resolve dependencies of the UserService (?).
Please make sure that the argument Repository at index [0]
is available in the UserModule context.
```

이게 무슨 말인지 알려면 네스트의 부팅 과정을 알아야 합니다.

### 부팅은 두 단계

```
1) 파악(Scan) 단계 → 2) 인스턴스화(Instantiate) 단계
```

**1단계 — 파악**

네스트가 `AppModule`부터 시작해서 트리를 훑습니다.

- `imports`를 따라가며 **모듈 그래프**를 만든다
- 각 모듈의 `providers`, `controllers`를 **컨테이너에 등록**한다
- 각 클래스의 생성자 파라미터 **타입 메타데이터**를 읽는다 (이게 `emitDecoratorMetadata`가 필요한 이유)
- 아직 아무것도 `new` 하지 않는다 — 목록만 만든다

**2단계 — 인스턴스화**

- 의존성 그래프를 **위상 정렬**한다 (의존이 없는 것부터)
- 순서대로 `new` 하면서 생성자에 이미 만들어둔 인스턴스를 **주입**한다
- 기본 스코프는 **싱글턴** — 앱 전체에서 인스턴스 하나를 공유

### 그래서 그 에러의 의미

```ts
@Injectable()
export class UserService {
  constructor(private repo: UserRepository) {}   // ← 이걸 주입해야 하는데
}
```

`UserRepository`가 다음 중 하나에 해당하면 에러가 납니다.

1. 어느 모듈의 `providers`에도 없다
2. 다른 모듈에 있는데 그 모듈이 **`exports` 하지 않았다**
3. `exports`는 했는데 **이쪽 모듈이 `imports` 하지 않았다**

**해결 체크리스트**

```ts
// 제공하는 쪽
@Module({
  providers: [UserRepository],
  exports: [UserRepository],      // ← ② 내보냈나?
})
export class UserModule {}

// 쓰는 쪽
@Module({
  imports: [UserModule],          // ← ③ 가져왔나?
  providers: [OrderService],
})
export class OrderModule {}
```

에러 메시지의 `(?)` 자리가 **해결 못 한 파라미터의 위치**입니다. `index [0]`이면 첫 번째 인자예요.

### 커스텀 프로바이더

```ts
@Module({
  providers: [
    // 1) 클래스 (기본)
    UserService,

    // 2) 값 주입
    { provide: 'CONFIG', useValue: { apiKey: 'xxx' } },

    // 3) 클래스 갈아끼우기 (테스트에서 유용)
    { provide: UserService, useClass: MockUserService },

    // 4) 팩토리 — 다른 의존성을 받아 동적으로 생성
    {
      provide: 'DB',
      useFactory: (config: ConfigService) => createDb(config.get('DB_URL')),
      inject: [ConfigService],
    },
  ],
})
```

문자열 토큰으로 등록한 건 `@Inject`로 받습니다.

```ts
constructor(@Inject('CONFIG') private config: Config) {}
```

### 스코프

| 스코프 | 인스턴스 | 언제 |
|---|---|---|
| `DEFAULT` | 앱 전체에 1개 (싱글턴) | 대부분 |
| `REQUEST` | 요청마다 새로 | 요청 정보를 서비스가 알아야 할 때 |
| `TRANSIENT` | 주입될 때마다 새로 | 상태를 공유하면 안 될 때 |

```ts
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {}
```

> ⚠️ `REQUEST` 스코프는 **성능 비용이 큽니다.** 그 서비스를 쓰는 상위 체인 전체가 요청마다 새로 만들어져요. 꼭 필요할 때만.

### 순환 의존성

A가 B를, B가 A를 필요로 하면 네스트가 순서를 정할 수 없습니다.

```ts
// 양쪽 모두에
@Injectable()
export class AService {
  constructor(
    @Inject(forwardRef(() => BService))
    private bService: BService,
  ) {}
}

// 모듈끼리도
@Module({
  imports: [forwardRef(() => BModule)],
})
```

> 다만 `forwardRef`는 **응급처치**입니다. 순환 의존성이 생겼다는 건 대개 설계가 잘못됐다는 신호예요.
> 공통 로직을 제3의 서비스로 빼는 게 정석입니다.

---

## 2. 게이트웨이 — 웹소켓으로 실시간 만들기

### 웹소켓이 왜 필요한가

지금까지의 http는 **클라이언트가 물어봐야 서버가 답하는** 구조였습니다.
그런데 채팅이나 알림은 **서버가 먼저 말을 걸어야** 하죠.

| 방식 | 방향 | 쓰임 |
|---|---|---|
| HTTP 폴링 | 클라 → 서버 반복 질문 | 비효율적 |
| **SSE** | 서버 → 클라 (단방향) | 알림, **AI 스트리밍** (8-3강) |
| **웹소켓** | 양방향 | 채팅, 게임, 협업 |

> 8-3강에서 웹소켓이 아니라 SSE를 쓴 이유가 이겁니다. AI 답변은 서버→클라 한 방향이면 충분하거든요.
> **도구는 필요한 만큼만.**

### 설치

```bash
npm i @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### 게이트웨이 작성

```ts
import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`접속: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`해제: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { room: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    // 특정 방에만 전송
    this.server.to(data.room).emit('message', {
      from: client.id,
      text: data.text,
    });
  }

  @SubscribeMessage('joinRoom')
  handleJoin(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.join(room);
    return { event: 'joined', data: room };   // 반환하면 그대로 응답
  }
}
```

모듈에 등록:

```ts
@Module({ providers: [ChatGateway] })
export class ChatModule {}
```

### 클라이언트

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io('http://localhost:3000');

  socket.on('connect', () => {
    socket.emit('joinRoom', 'room1');
  });

  socket.on('message', (data) => {
    console.log(data.from, data.text);
  });

  document.querySelector('#send').onclick = () => {
    socket.emit('message', { room: 'room1', text: '안녕하세요' });
  };
</script>
```

### 전송 범위

```ts
this.server.emit('e', data);              // 전체
this.server.to('room1').emit('e', data);  // 특정 방 전체
client.emit('e', data);                   // 이 클라이언트에게만
client.broadcast.emit('e', data);         // 나를 뺀 전체
```

### 클러스터 환경에서의 함정

pm2로 프로세스를 여러 개 띄우면(→ N-6), **프로세스마다 소켓 연결이 따로** 관리됩니다.
1번 프로세스에 붙은 사람이 보낸 메시지가 2번 프로세스에 붙은 사람에게 안 갑니다.

해결: **Redis 어댑터**로 프로세스 간 메시지를 중계합니다.

```bash
npm i @socket.io/redis-adapter redis
```

---

## 3. 이벤트 — 모듈 간 느슨한 결합

주문이 완료되면 이메일도 보내고, 포인트도 적립하고, 통계도 쌓아야 한다고 해봅시다.
`OrderService`가 이 셋을 다 호출하면 결합도가 높아집니다.

```bash
npm i @nestjs/event-emitter
```

```ts
// app.module.ts
@Module({ imports: [EventEmitterModule.forRoot()] })
```

**발행하는 쪽**

```ts
@Injectable()
export class OrderService {
  constructor(private eventEmitter: EventEmitter2) {}

  async create(dto: CreateOrderDto) {
    const order = await this.repo.save(dto);
    this.eventEmitter.emit('order.created', new OrderCreatedEvent(order));
    return order;   // 주문 로직은 여기서 끝. 나머지는 알아서.
  }
}
```

**구독하는 쪽**

```ts
@Injectable()
export class MailListener {
  @OnEvent('order.created')
  handle(event: OrderCreatedEvent) {
    // 메일 발송
  }
}

@Injectable()
export class PointListener {
  @OnEvent('order.created', { async: true })
  async handle(event: OrderCreatedEvent) {
    // 포인트 적립
  }
}
```

와일드카드도 됩니다: `@OnEvent('order.*')`

> ⚠️ 이 이벤트는 **같은 프로세스 안에서만** 동작하고, 실패해도 재시도가 없습니다.
> 진짜 중요한 작업(결제, 정산)은 **메시지 큐**(BullMQ, RabbitMQ, SQS)를 쓰세요.

---

## 4. 전역 등록

가드·인터셉터·필터·파이프를 매번 컨트롤러마다 붙이지 않고 앱 전체에 적용하는 방법.

### 방법 1 — `main.ts` (간단하지만 DI를 못 씀)

```ts
const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
app.useGlobalFilters(new HttpExceptionFilter());
app.useGlobalInterceptors(new LoggingInterceptor());
```

### 방법 2 — 모듈에 등록 (DI 사용 가능, 권장)

```ts
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_GUARD, useClass: AuthGuard },        // 이 안에서 다른 서비스 주입 OK
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
```

### 전역 가드를 걸었는데 로그인 페이지는 열어야 할 때

```ts
// 데코레이터 정의
export const Public = () => SetMetadata('isPublic', true);

// 가드에서 확인
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    // ... 실제 인증 검사
  }
}

// 사용
@Public()
@Post('login')
login() {}
```

### 전역 모듈

```ts
@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

이러면 다른 모듈이 `imports` 없이도 `ConfigService`를 씁니다.

> ⚠️ 남용하면 의존 관계가 안 보여서 유지보수가 어려워집니다. 진짜 전역적인 것(설정, 로거) 정도만.

---

## 5. 더 볼 것

- **공식 문서**: [docs.nestjs.com](https://docs.nestjs.com) — 한국어 번역도 있습니다
- **책**: 9.10 ~ 9.13절
- 이 노트에서 안 다룬 것: 마이크로서비스, GraphQL, CQRS, 테스팅 — 전부 공식 문서에 별도 챕터가 있습니다
