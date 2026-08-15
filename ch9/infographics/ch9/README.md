# NestJS 9장 인포그래픽

총 60장: 챕터별 54장 + 공통 요약 6장.
모든 이미지는 16:9, 1920×1080 PNG입니다.

- [전체 콘택트시트](contact-sheet.png)
- [자산 명세](manifest.json)
- [생성·검증 계획](../../docs/superpowers/plans/2026-08-12-nestjs-chapter-9-infographics.md)
- [디자인 명세](../../docs/superpowers/specs/2026-08-12-nestjs-chapter-9-infographics-design.md)

## 시각 언어

- Module: 보라, Controller: 하늘색, Provider/Service: 초록
- Guard: 노랑, Pipe: 파랑, Interceptor: 분홍, Exception Filter: 빨강
- Database/외부 시스템: 회색, Event/WebSocket: 청록
- 실선: 실행 흐름, 점선: DI/설정, 물결선: Event/WebSocket, 빨간선: 예외

## 프롬프트 재현 규칙

각 이미지의 최종 프롬프트는 `manifest.json`의 `shared_prompt`에 해당 항목의 `objective`, `required_labels`, `flow`, `source_files`를 결합하고, 해당 챕터 코드에 없는 요소를 추가하지 않는 제약을 적용해 구성합니다.

## 이미지 목록

### 9.1

#### 1. Nest 애플리케이션의 기본 4요소

[이미지 열기](9.1/ch9-01-01-basic-app-anatomy.png)

- 목적: main.ts가 AppModule을 부트스트랩하고 AppModule이 Controller와 Service를 구성하는 관계를 설명한다.
- 흐름: main.ts → AppModule; AppModule 안에 AppController와 AppService
- 필수 라벨: main.ts · AppModule · AppController · AppService · NestFactory.create()
- 코드 근거: `9.1/node-cat/src/main.ts`, `9.1/node-cat/src/app.module.ts`, `9.1/node-cat/src/app.controller.ts`, `9.1/node-cat/src/app.service.ts`

#### 2. @Module 메타데이터 해부

[이미지 열기](9.1/ch9-01-02-module-metadata.png)

- 목적: AppModule의 imports, controllers, providers 슬롯 역할을 구분한다.
- 흐름: @Module 중심에서 세 메타데이터 영역으로 분기
- 필수 라벨: @Module · imports · controllers · providers · AppController · AppService
- 코드 근거: `9.1/node-cat/src/app.module.ts`

#### 3. GET / 요청과 생성자 DI

[이미지 열기](9.1/ch9-01-03-controller-service-di.png)

- 목적: 클라이언트 요청이 AppController를 거쳐 주입된 AppService로 전달되고 응답되는 흐름을 설명한다.
- 흐름: Client → AppController → AppService → Response; Controller와 Service 사이 dotted DI arrow
- 필수 라벨: GET / · AppController · constructor DI · AppService · Hello World!
- 코드 근거: `9.1/node-cat/src/app.controller.ts`, `9.1/node-cat/src/app.service.ts`

### 9.2

#### 1. AuthModule 추가 전후

[이미지 열기](9.2/ch9-02-01-module-separation.png)

- 목적: 단일 AppModule 구조가 기능 모듈을 imports하는 구조로 확장되는 변화를 비교한다.
- 흐름: 왼쪽 Before와 오른쪽 After 비교; AppModule → AuthModule 단방향 import
- 필수 라벨: Before 9.1 · After 9.2 · AppModule · imports: [AuthModule] · AuthModule
- 코드 근거: `9.1/node-cat/src/app.module.ts`, `9.2/node-cat/src/app.module.ts`, `9.2/node-cat/src/auth/auth.module.ts`

#### 2. AuthModule의 기능 경계

[이미지 열기](9.2/ch9-02-02-auth-module-boundary.png)

- 목적: AuthModule이 AuthController와 AuthService를 캡슐화하고 /auth 경로를 소유함을 설명한다.
- 흐름: AuthModule 경계 안에 Controller와 Service; Controller → Service
- 필수 라벨: AuthModule · AuthController · AuthService · /auth · controllers · providers
- 코드 근거: `9.2/node-cat/src/auth/auth.module.ts`, `9.2/node-cat/src/auth/auth.controller.ts`, `9.2/node-cat/src/auth/auth.service.ts`

### 9.3

#### 1. 인증 라우트와 Guard 매트릭스

[이미지 열기](9.3/ch9-03-01-route-guard-matrix.png)

- 목적: join, login, logout, kakao 라우트에 어떤 Guard가 적용되는지 표로 설명한다.
- 흐름: 라우트 행과 Guard 열의 명확한 매트릭스
- 필수 라벨: POST /auth/join · POST /auth/login · GET /auth/logout · GET /auth/kakao · IsNotLoggedInGuard · IsLoggedInGuard
- 코드 근거: `9.3/node-cat/src/auth/auth.controller.ts`

#### 2. Guard와 ExecutionContext

[이미지 열기](9.3/ch9-03-02-guard-execution-context.png)

- 목적: Guard가 HTTP Request를 얻고 isAuthenticated를 검사해 통과 또는 예외를 결정하는 과정을 설명한다.
- 흐름: canActivate → ExecutionContext → Request → true 또는 ForbiddenException
- 필수 라벨: canActivate() · ExecutionContext · switchToHttp() · Request · isAuthenticated() · ForbiddenException
- 코드 근거: `9.3/node-cat/src/auth/is-logged-in.guard.ts`

#### 3. 로그인 상태별 Guard 분기

[이미지 열기](9.3/ch9-03-03-auth-state-branch.png)

- 목적: 로그인 여부에 따라 두 Guard가 반대 결과를 내는 것을 대칭 구조로 보여준다.
- 흐름: 두 상태에서 두 Guard 결과를 교차 비교
- 필수 라벨: 로그인 상태 · 비로그인 상태 · IsLoggedInGuard · IsNotLoggedInGuard · 통과 · 차단
- 코드 근거: `9.3/node-cat/src/auth/is-logged-in.guard.ts`, `9.3/node-cat/src/auth/is-not-logged-in.guard.ts`

### 9.4

#### 1. Express 미들웨어 실행 순서

[이미지 열기](9.4/ch9-04-01-express-middleware-chain.png)

- 목적: main.ts에 등록된 Morgan, Cookie Parser, Session, Passport 초기화 순서를 설명한다.
- 흐름: Request → morgan → cookieParser → session → passport.initialize → passport.session → Router
- 필수 라벨: Request · morgan · cookieParser · session · passport.initialize · passport.session · Nest Router
- 코드 근거: `9.4/node-cat/src/main.ts`

#### 2. MiddlewareConsumer 적용 범위

[이미지 열기](9.4/ch9-04-02-middleware-consumer-routing.png)

- 목적: LoggerMiddleware의 apply, exclude, forRoutes가 만드는 선택적 적용 범위를 설명한다.
- 흐름: AuthController 라우트 대부분은 LoggerMiddleware 통과; 두 제외 경로는 우회
- 필수 라벨: apply(LoggerMiddleware) · exclude · auth/kakao · POST auth/login · forRoutes(AuthController)
- 코드 근거: `9.4/node-cat/src/app.module.ts`, `9.4/node-cat/src/logger/logger.middleware.ts`

#### 3. 전역 설정과 정적 파일 제공

[이미지 열기](9.4/ch9-04-03-global-config-static.png)

- 목적: ConfigModule의 전역 설정과 public, uploads 두 정적 디렉터리 매핑을 설명한다.
- 흐름: AppModule imports에서 ConfigModule과 두 ServeStaticModule로 분기
- 필수 라벨: ConfigModule · isGlobal: true · public · uploads · /img · ServeStaticModule
- 코드 근거: `9.4/node-cat/src/app.module.ts`

#### 4. 세션과 Passport 인증 기반

[이미지 열기](9.4/ch9-04-04-passport-session-flow.png)

- 목적: 쿠키, express-session, Passport가 요청의 인증 상태를 복원하는 기반 흐름을 설명한다.
- 흐름: Cookie → Session 조회 → Passport 세션 복원 → req.user
- 필수 라벨: Cookie · express-session · Session ID · passport.initialize · passport.session · req.user
- 코드 근거: `9.4/node-cat/src/main.ts`

### 9.5

#### 1. Drizzle와 Passport가 추가된 구조

[이미지 열기](9.5/ch9-05-01-expanded-architecture.png)

- 목적: AppModule, AuthModule, 글로벌 DrizzleModule과 외부 MySQL의 관계를 조감한다.
- 흐름: AppModule imports AuthModule and global DrizzleModule; Auth providers inject DRIZZLE; DRIZZLE connects MySQL
- 필수 라벨: AppModule · AuthModule · DrizzleModule · PassportModule · DRIZZLE · MySQL
- 코드 근거: `9.5/node-cat/src/app.module.ts`, `9.5/node-cat/src/auth/auth.module.ts`, `9.5/node-cat/src/drizzle/drizzle.module.ts`

#### 2. DrizzleModule.forRootAsync() 해부

[이미지 열기](9.5/ch9-05-02-dynamic-module-anatomy.png)

- 목적: 동적 모듈이 module, global, providers, exports를 런타임 구성으로 반환하는 구조를 설명한다.
- 흐름: forRootAsync 입력 → DynamicModule 객체의 네 영역
- 필수 라벨: forRootAsync() · DynamicModule · module · global · providers · exports: ['DRIZZLE']
- 코드 근거: `9.5/node-cat/src/drizzle/drizzle.module.ts`

#### 3. 비동기 설정 팩토리 흐름

[이미지 열기](9.5/ch9-05-03-async-config-factory.png)

- 목적: ConfigService 주입부터 DRIZZLE_MYSQL_CONFIG Provider 생성까지를 설명한다.
- 흐름: ConfigService dotted injection → useFactory → config object → DRIZZLE_MYSQL_CONFIG
- 필수 라벨: ConfigService · inject · useFactory · DB_PASSWORD · DRIZZLE_MYSQL_CONFIG
- 코드 근거: `9.5/node-cat/src/app.module.ts`, `9.5/node-cat/src/drizzle/drizzle.module.ts`

#### 4. 문자열 토큰 DRIZZLE 해결 과정

[이미지 열기](9.5/ch9-05-04-drizzle-token-resolution.png)

- 목적: 팩토리 Provider가 DrizzleMySqlService와 설정 토큰을 주입받아 DRIZZLE 토큰을 만드는 과정을 설명한다.
- 흐름: Service + config token → useFactory → DRIZZLE → consuming providers
- 필수 라벨: DrizzleMySqlService · DRIZZLE_MYSQL_CONFIG · useFactory · DRIZZLE · @Inject('DRIZZLE')
- 코드 근거: `9.5/node-cat/src/drizzle/drizzle.module.ts`, `9.5/node-cat/src/drizzle/drizzle.service.ts`

#### 5. AuthModule의 Passport Provider

[이미지 열기](9.5/ch9-05-05-passport-provider-graph.png)

- 목적: AuthService, LocalSerializer, LocalStrategy, KakaoStrategy와 PassportModule의 관계를 설명한다.
- 흐름: AuthModule 경계 안 imports와 providers를 분리한 graph
- 필수 라벨: AuthModule · PassportModule · AuthService · LocalSerializer · LocalStrategy · KakaoStrategy
- 코드 근거: `9.5/node-cat/src/auth/auth.module.ts`

#### 6. 로컬 로그인과 세션 직렬화

[이미지 열기](9.5/ch9-05-06-local-session-flow.png)

- 목적: LocalAuthGuard, LocalStrategy 검증, logIn, serializeUser, deserializeUser 흐름을 설명한다.
- 흐름: Login request → Guard → Strategy → bcrypt → logIn → serialize; later request Session → deserialize → user
- 필수 라벨: LocalAuthGuard · LocalStrategy · bcrypt.compare · logIn() · serializeUser · Session · deserializeUser
- 코드 근거: `9.5/node-cat/src/auth/local-auth.guard.ts`, `9.5/node-cat/src/auth/local.strategy.ts`, `9.5/node-cat/src/auth/local.serializer.ts`

#### 7. Kakao OAuth 인증 흐름

[이미지 열기](9.5/ch9-05-07-kakao-oauth-flow.png)

- 목적: Kakao 인증 요청, callback, 사용자 조회 또는 생성, 로그인 완료 흐름을 설명한다.
- 흐름: Browser → Kakao → callback → Strategy → DB lookup → existing or insert
- 필수 라벨: GET /auth/kakao · Kakao · callback · KakaoStrategy · DRIZZLE · 기존 사용자 · 신규 사용자
- 코드 근거: `9.5/node-cat/src/auth/auth.controller.ts`, `9.5/node-cat/src/auth/kakao.strategy.ts`

### 9.6

#### 1. PostModule과 실행 확장점 추가

[이미지 열기](9.6/ch9-06-01-expanded-architecture.png)

- 목적: PostModule, LoggerInterceptor, lifecycle hooks가 추가된 9.6 구조 변화를 보여준다.
- 흐름: 9.5 구조에 PostModule 및 실행 확장점이 추가됨
- 필수 라벨: AppModule · PostModule · PostController · PostService · LoggerInterceptor · Lifecycle Hooks
- 코드 근거: `9.6/node-cat/src/app.module.ts`, `9.6/node-cat/src/post/post.module.ts`, `9.6/node-cat/src/logger/logger.interceptor.ts`

#### 2. PostModule 내부 DI

[이미지 열기](9.6/ch9-06-02-post-module-di.png)

- 목적: PostController가 PostService를 생성자 주입받는 모듈 내부 구조를 설명한다.
- 흐름: PostModule contains Controller and Service; dotted DI arrow Controller → Service
- 필수 라벨: PostModule · PostController · PostService · controllers · providers · constructor DI
- 코드 근거: `9.6/node-cat/src/post/post.module.ts`, `9.6/node-cat/src/post/post.controller.ts`, `9.6/node-cat/src/post/post.service.ts`

#### 3. LoggerInterceptor의 양방향 흐름

[이미지 열기](9.6/ch9-06-03-logger-interceptor-flow.png)

- 목적: Interceptor가 핸들러 전후를 감싸고 응답을 data로 포장하거나 500 오류를 502로 바꾸는 과정을 설명한다.
- 흐름: Request inward through Interceptor to Controller; response outward through map; exception red reverse path through catchError
- 필수 라벨: Request · LoggerInterceptor · next.handle() · Controller · map: { data } · 500 → 502
- 코드 근거: `9.6/node-cat/src/logger/logger.interceptor.ts`, `9.6/node-cat/src/app.controller.ts`

#### 4. FileInterceptor 업로드 파이프라인

[이미지 열기](9.6/ch9-06-04-file-upload-pipeline.png)

- 목적: 로그인 Guard, FileInterceptor, Multer 제한, diskStorage를 거쳐 uploads에 저장되는 흐름을 설명한다.
- 흐름: Multipart request → Guard → FileInterceptor → limits → diskStorage → uploads
- 필수 라벨: POST /post/img · IsLoggedInGuard · FileInterceptor('img') · 5 MB · multer.diskStorage · uploads/
- 코드 근거: `9.6/node-cat/src/post/post.controller.ts`

#### 5. Nest 초기화 생명주기

[이미지 열기](9.6/ch9-06-05-lifecycle-hooks-timeline.png)

- 목적: Provider 생성자와 모듈 초기화·애플리케이션 부트스트랩 훅의 순서를 설명한다.
- 흐름: 시간축 constructor → onModuleInit → onApplicationBootstrap
- 필수 라벨: constructor · onModuleInit · onApplicationBootstrap · AppModule · AuthService
- 코드 근거: `9.6/node-cat/src/app.module.ts`, `9.6/node-cat/src/auth/auth.service.ts`, `9.6/node-cat/src/auth/circular.service.ts`

#### 6. forwardRef()로 순환 의존성 연결

[이미지 열기](9.6/ch9-06-06-forwardref-circular-di.png)

- 목적: AuthService와 CircularService의 양방향 의존성 문제와 forwardRef 지연 참조를 설명한다.
- 흐름: AuthService ↔ CircularService two-way dotted dependency with forwardRef on both directions
- 필수 라벨: AuthService · CircularService · 순환 의존성 · @Inject · forwardRef() · 지연 참조
- 코드 근거: `9.6/node-cat/src/auth/auth.service.ts`, `9.6/node-cat/src/auth/circular.service.ts`

### 9.7

#### 1. Nest 예외 계층

[이미지 열기](9.7/ch9-07-01-exception-hierarchy.png)

- 목적: HttpException과 NotFound, BadRequest, TooManyRequests 커스텀 예외의 상속 관계를 설명한다.
- 흐름: 상단 HttpException에서 하위 예외 카드로 계층 분기
- 필수 라벨: HttpException · NotFoundException · BadRequestException · TooManyRequestsException · 429
- 코드 근거: `9.7/node-cat/src/http/too-many-requests.exception.ts`, `9.7/node-cat/src/common/all-exceptions.filter.ts`

#### 2. 예외에서 응답까지

[이미지 열기](9.7/ch9-07-02-exception-response-flow.png)

- 목적: Controller 또는 Provider에서 발생한 예외가 Filter에 포착되어 HTML 또는 JSON 응답으로 바뀌는 과정을 설명한다.
- 흐름: Exception red reverse arrow → matching Filter → status/message → HTML or JSON
- 필수 라벨: Exception · ArgumentsHost · switchToHttp() · Exception Filter · HTML error · JSON response
- 코드 근거: `9.7/node-cat/src/common/all-exceptions.filter.ts`, `9.7/node-cat/src/http/http.filter.ts`

#### 3. APP_FILTER 전역 등록

[이미지 열기](9.7/ch9-07-03-app-filter-global-provider.png)

- 목적: AppModule의 Provider 토큰으로 AllExceptionsFilter를 애플리케이션 전체에 적용하는 구조를 설명한다.
- 흐름: AppModule providers → APP_FILTER token → AllExceptionsFilter → all routes
- 필수 라벨: AppModule · providers · APP_FILTER · useClass · AllExceptionsFilter · 전역 적용
- 코드 근거: `9.7/node-cat/src/app.module.ts`

#### 4. Filter의 포착 범위 비교

[이미지 열기](9.7/ch9-07-04-filter-catch-scope.png)

- 목적: @Catch() AllExceptionsFilter와 @Catch(HttpException) HttpFilter의 포착 범위 차이를 설명한다.
- 흐름: 넓은 전체 집합 안에 HttpException 부분집합을 표시
- 필수 라벨: @Catch() · AllExceptionsFilter · 모든 예외 · @Catch(HttpException) · HttpFilter · HTTP 예외만
- 코드 근거: `9.7/node-cat/src/common/all-exceptions.filter.ts`, `9.7/node-cat/src/http/http.filter.ts`

### 9.8

#### 1. UserModule과 렌더링 계층 추가

[이미지 열기](9.8/ch9-08-01-expanded-architecture.png)

- 목적: 9.8에서 UserModule, UserController, RenderInterceptor가 전체 구조에 추가된 변화를 보여준다.
- 흐름: AppModule imports UserModule; AppController wrapped by RenderInterceptor; controllers inject DRIZZLE
- 필수 라벨: AppModule · UserModule · UserController · AppController · RenderInterceptor · DRIZZLE
- 코드 근거: `9.8/node-cat/src/app.module.ts`, `9.8/node-cat/src/app.controller.ts`, `9.8/node-cat/src/user/user.module.ts`

#### 2. RenderInterceptor와 res.locals

[이미지 열기](9.8/ch9-08-02-render-interceptor-locals.png)

- 목적: 요청 사용자의 팔로우 정보를 뷰 공통 변수로 계산해 res.locals에 넣는 흐름을 설명한다.
- 흐름: Request user → Interceptor calculates locals → Controller → rendered View
- 필수 라벨: req.user · RenderInterceptor · res.locals.user · followerCount · followingCount · followingIdList · View
- 코드 근거: `9.8/node-cat/src/render/render.interceptor.ts`, `9.8/node-cat/src/app.controller.ts`

#### 3. 커스텀 @User() 데코레이터

[이미지 열기](9.8/ch9-08-03-user-param-decorator.png)

- 목적: createParamDecorator가 ExecutionContext에서 request.user 또는 특정 필드를 추출해 핸들러 인자로 제공하는 과정을 설명한다.
- 흐름: Decorator → ExecutionContext → Request → user or user[data] → handler argument
- 필수 라벨: @User() · createParamDecorator · ExecutionContext · Request · request.user · Handler Parameter
- 코드 근거: `9.8/node-cat/src/auth/user.decorator.ts`

#### 4. 사용자 팔로우 저장 흐름

[이미지 열기](9.8/ch9-08-04-follow-user-db-flow.png)

- 목적: 로그인 Guard, URL id, @User 사용자, DRIZZLE 조회와 follows 삽입 흐름을 설명한다.
- 흐름: Request → Guard → UserController combines id and current user → lookup → insert follows
- 필수 라벨: POST /user/:id/follow · IsLoggedInGuard · @Param('id') · @User() · users 조회 · follows INSERT
- 코드 근거: `9.8/node-cat/src/user/user.controller.ts`

### 9.9

#### 1. CreatePostDto 변환과 검증

[이미지 열기](9.9/ch9-09-01-dto-transform-validation.png)

- 목적: 폼 입력이 trim Transform을 거쳐 문자열·선택 규칙으로 검증되고 DTO가 되는 과정을 설명한다.
- 흐름: Raw body → Transform → class-validator → typed DTO → Controller
- 필수 라벨: Form Body · @Transform · trim() · @IsString · @IsOptional · CreatePostDto · ValidationPipe
- 코드 근거: `9.9/node-cat/src/post/dto/create-post.dto.ts`, `9.9/node-cat/src/post/post.controller.ts`

#### 2. ParseIntPipe 파라미터 변환

[이미지 열기](9.9/ch9-09-02-parse-int-pipe.png)

- 목적: 문자열 URL 파라미터가 핸들러 실행 전에 number로 변환되거나 오류가 되는 과정을 설명한다.
- 흐름: URL string → ParseIntPipe → success number or red exception path
- 필수 라벨: GET /post/:id · string · ParseIntPipe · number · getPost(id: number) · Bad Request
- 코드 근거: `9.9/node-cat/src/post/post.controller.ts`

#### 3. 게시글과 해시태그 저장

[이미지 열기](9.9/ch9-09-03-post-hashtag-persistence.png)

- 목적: 검증된 게시글 저장 후 해시태그를 추출·조회·생성하고 연결 테이블에 저장하는 흐름을 설명한다.
- 흐름: DTO → post insert → post id → tags map → existing or insert → junction table
- 필수 라벨: CreatePostDto · posts INSERT · LAST_INSERT_ID · #hashtag 추출 · hashtags · postsToHashtags
- 코드 근거: `9.9/node-cat/src/post/post.controller.ts`

### 9.10

#### 1. 회원가입 요청 파이프라인

[이미지 열기](9.10/ch9-10-01-join-request-pipeline.png)

- 목적: 비로그인 Guard와 ValidationPipe를 통과한 JoinDto가 Controller와 Service로 전달되는 순서를 설명한다.
- 흐름: Request → Guard → Pipe → Controller → Service → Redirect
- 필수 라벨: POST /auth/join · IsNotLoggedInGuard · ValidationPipe · JoinDto · AuthController · AuthService
- 코드 근거: `9.10/node-cat/src/auth/auth.controller.ts`, `9.10/node-cat/src/auth/dto/join.dto.ts`

#### 2. 비밀번호 해시와 사용자 저장

[이미지 열기](9.10/ch9-10-02-bcrypt-db-persistence.png)

- 목적: 중복 사용자 조회, bcrypt 비용 12 해시, users INSERT 흐름을 설명한다.
- 흐름: DTO → duplicate lookup → existing error or bcrypt hash → DB insert
- 필수 라벨: JoinDto · users SELECT · already_exist · bcrypt.hash · salt rounds: 12 · users INSERT
- 코드 근거: `9.10/node-cat/src/auth/auth.service.ts`

#### 3. Controller와 Service 책임 분리

[이미지 열기](9.10/ch9-10-03-controller-service-responsibilities.png)

- 목적: HTTP 입출력 책임과 회원가입 비즈니스·DB 책임을 나란히 비교한다.
- 흐름: 왼쪽 Controller HTTP responsibilities; 오른쪽 Service business/data responsibilities; constructor DI between
- 필수 라벨: AuthController · HTTP · Guard / Pipe · Redirect · AuthService · 중복 검사 · bcrypt · Database
- 코드 근거: `9.10/node-cat/src/auth/auth.controller.ts`, `9.10/node-cat/src/auth/auth.service.ts`

### 9.11

#### 1. HTTP와 WebSocket 공존 구조

[이미지 열기](9.11/ch9-11-01-http-websocket-architecture.png)

- 목적: Nest 애플리케이션에서 Controller 기반 HTTP와 Gateway 기반 WebSocket이 같은 서비스와 세션을 사용하는 구조를 설명한다.
- 흐름: HTTP branch → Controller; WS branch → Gateway; both use shared Provider and session basis
- 필수 라벨: HTTP Client · Controller · WebSocket Client · PostGateway · PostService · Session · Socket.IO
- 코드 근거: `9.11/node-cat/src/main.ts`, `9.11/node-cat/src/post/post.gateway.ts`, `9.11/node-cat/src/post/post.module.ts`

#### 2. SessionSocketIoAdapter 세션 연결

[이미지 열기](9.11/ch9-11-02-session-socket-adapter.png)

- 목적: Express sessionMiddleware를 Socket.IO server.use에 적용해 handshake request에 세션을 붙이는 과정을 설명한다.
- 흐름: main.ts creates middleware → adapter → Socket.IO server.use → socket.request.session
- 필수 라벨: sessionMiddleware · SessionSocketIoAdapter · server.use · Socket handshake · socket.request · session
- 코드 근거: `9.11/node-cat/src/main.ts`, `9.11/node-cat/src/auth/socket-io.adapter.ts`

#### 3. 하나의 Guard, 두 실행 컨텍스트

[이미지 열기](9.11/ch9-11-03-http-ws-guard.png)

- 목적: IsLoggedInGuard가 context.getType에 따라 HTTP Request와 WS Socket 세션을 다르게 검사하는 과정을 설명한다.
- 흐름: Guard decision splits HTTP and WS; each returns true or protocol-specific exception
- 필수 라벨: context.getType() · http · request.isAuthenticated() · ws · socket.request.session · WsException
- 코드 근거: `9.11/node-cat/src/auth/is-logged-in.guard.ts`

#### 4. PostGateway 연결 생명주기

[이미지 열기](9.11/ch9-11-04-gateway-lifecycle.png)

- 목적: 클라이언트 연결과 해제 시 Gateway 훅이 호출되는 흐름을 설명한다.
- 흐름: Client connect → handleConnection; later disconnect → handleDisconnect
- 필수 라벨: WebSocketGateway · Client · handleConnection · Connected · handleDisconnect · Disconnected
- 코드 근거: `9.11/node-cat/src/post/post.gateway.ts`

#### 5. createPost 이벤트와 Broadcast

[이미지 열기](9.11/ch9-11-05-createpost-broadcast.png)

- 목적: 인증된 createPost 메시지가 PostService를 호출하고 전체 newPost와 발신자 postCreated 응답으로 나뉘는 흐름을 설명한다.
- 흐름: Client message → Guard → Gateway → Service; success splits broadcast to all and ack to sender
- 필수 라벨: createPost · IsLoggedInGuard · PostGateway · PostService.create · server.emit('newPost') · client.emit('postCreated')
- 코드 근거: `9.11/node-cat/src/post/post.gateway.ts`, `9.11/node-cat/src/post/post.service.ts`

#### 6. Socket.IO Room 메시지 흐름

[이미지 열기](9.11/ch9-11-06-room-message-flow.png)

- 목적: joinRoom, leaveRoom, sendMessage가 Room 멤버십과 대상 전송을 어떻게 바꾸는지 설명한다.
- 흐름: Client joins teal room, sends message only to room, then leaves
- 필수 라벨: joinRoom · client.join(room) · leaveRoom · client.leave(room) · sendMessage · server.to(room).emit
- 코드 근거: `9.11/node-cat/src/post/post.gateway.ts`

### 9.12

#### 1. EventEmitter 기반 구조 추가

[이미지 열기](9.12/ch9-12-01-event-architecture.png)

- 목적: EventsModule과 EventEmitterModule이 AuthService, PostService, 세 Listener 서비스를 연결하는 구조를 설명한다.
- 흐름: Publishers emit to central event bus; bus fans out to listener providers
- 필수 라벨: EventEmitterModule · EventsModule · AuthService · PostService · NotificationService · LoggingService · AnalyticsService
- 코드 근거: `9.12/node-cat/src/app.module.ts`, `9.12/node-cat/src/events/events.module.ts`, `9.12/node-cat/src/auth/auth.service.ts`, `9.12/node-cat/src/post/post.service.ts`

#### 2. user.created 이벤트 흐름

[이미지 열기](9.12/ch9-12-02-user-created-event.png)

- 목적: 회원 저장 완료 후 AuthService가 user.created를 발행하고 Listener가 처리하는 흐름을 설명한다.
- 흐름: Join → DB insert → teal event emit → listener → welcome notification
- 필수 라벨: AuthService.join · users INSERT · emit('user.created') · EventEmitter2 · @OnEvent('user.created') · NotificationService
- 코드 근거: `9.12/node-cat/src/auth/auth.service.ts`, `9.12/node-cat/src/events/notification.service.ts`

#### 3. post.created 이벤트 흐름

[이미지 열기](9.12/ch9-12-03-post-created-event.png)

- 목적: 게시글과 해시태그 저장 완료 후 PostService가 post.created를 발행하는 흐름을 설명한다.
- 흐름: Post creation persistence → teal event → listener notification
- 필수 라벨: PostService.create · posts INSERT · hashtags · emit('post.created') · @OnEvent('post.created') · 팔로워 알림
- 코드 근거: `9.12/node-cat/src/post/post.service.ts`, `9.12/node-cat/src/events/notification.service.ts`

#### 4. 이벤트 Listener Fan-out

[이미지 열기](9.12/ch9-12-04-listener-fanout.png)

- 목적: 하나의 도메인 이벤트를 Notification, Logging, Analytics가 독립적으로 구독하는 확산 구조를 설명한다.
- 흐름: One central event fans out via three teal wave arrows
- 필수 라벨: Domain Event · EventEmitter2 · NotificationService · LoggingService · AnalyticsService · 독립 구독
- 코드 근거: `9.12/node-cat/src/events/events.module.ts`, `9.12/node-cat/src/events/notification.service.ts`, `9.12/node-cat/src/events/logging.service.ts`, `9.12/node-cat/src/events/analytics.service.ts`

#### 5. 직접 호출과 이벤트 방식 비교

[이미지 열기](9.12/ch9-12-05-coupling-comparison.png)

- 목적: Publisher가 여러 서비스를 직접 아는 구조와 이벤트 버스만 아는 구조의 결합도 차이를 비교한다.
- 흐름: Before dense direct arrows versus After one publisher-to-bus arrow and fan-out
- 필수 라벨: 직접 호출 · 높은 결합도 · EventEmitter · 낮은 결합도 · Publisher · Listeners
- 코드 근거: `9.12/node-cat/src/auth/auth.service.ts`, `9.12/node-cat/src/post/post.service.ts`, `9.12/node-cat/src/events/events.module.ts`

### 9.13

#### 1. 전역 기능 등록 두 가지 방법

[이미지 열기](9.13/ch9-13-01-global-registration-comparison.png)

- 목적: main.ts useGlobal 방식과 AppModule APP_* Provider 방식을 비교하고 실제 활성 상태를 구분한다.
- 흐름: 좌우 비교; APP_FILTER만 bright active, other APP_* and useGlobal examples dimmed as commented alternatives
- 필수 라벨: main.ts · useGlobal* · AppModule · APP_GUARD · APP_INTERCEPTOR · APP_PIPE · APP_FILTER 활성
- 코드 근거: `9.13/node-cat/src/main.ts`, `9.13/node-cat/src/app.module.ts`

#### 2. NestJS 전체 요청 생명주기

[이미지 열기](9.13/ch9-13-02-full-request-lifecycle.png)

- 목적: 미들웨어부터 Guard, Interceptor, Pipe, Controller, Service, 응답 Interceptor, Exception Filter까지의 순서를 설명한다.
- 흐름: Request left-to-right through components; Response right-to-left through Interceptor; red exception path to Filter
- 필수 라벨: Middleware · Guard · Interceptor (before) · Pipe · Controller · Service · Interceptor (after) · Exception Filter
- 코드 근거: `9.13/node-cat/src/main.ts`, `9.13/node-cat/src/app.module.ts`

#### 3. 전역 컴포넌트의 적용 범위

[이미지 열기](9.13/ch9-13-03-global-component-scope.png)

- 목적: 전역 Guard, Interceptor, Pipe, Filter가 모든 Controller 라우트를 감싸는 개념을 설명하되 코드 활성 상태를 구분한다.
- 흐름: Concentric global layers around all controllers; note only APP_FILTER active in this snapshot
- 필수 라벨: Global Scope · Guard · Interceptor · Pipe · Filter · All Controllers · 개념도
- 코드 근거: `9.13/node-cat/src/main.ts`, `9.13/node-cat/src/app.module.ts`

#### 4. 최종 AppModule 조감도

[이미지 열기](9.13/ch9-13-04-final-app-module.png)

- 목적: 최종 AppModule의 imports, controller, providers, lifecycle, middleware 설정을 한 화면에 정리한다.
- 흐름: AppModule center with separate imports, controllers, providers, hooks, middleware regions
- 필수 라벨: AppModule · imports · AppController · AppService · APP_FILTER · Lifecycle Hooks · LoggerMiddleware
- 코드 근거: `9.13/node-cat/src/app.module.ts`

### 공통 요약

#### 1. 9.1에서 9.13까지의 아키텍처 진화

[이미지 열기](common/ch9-common-01-architecture-evolution.png)

- 목적: 기본 앱에서 모듈, 인증, DB, 확장점, WebSocket, 이벤트로 성장한 순서를 타임라인으로 요약한다.
- 흐름: Left-to-right chapter timeline with major milestones and 9.13 global view at end
- 필수 라벨: 9.1 기본 구조 · 9.2 Module · 9.3 Guard · 9.5 DI + DB · 9.6 Interceptor · 9.7 Filter · 9.11 WebSocket · 9.12 Event
- 코드 근거: `9.1/node-cat/src`, `9.13/node-cat/src`

#### 2. 9.13 최종 모듈 관계도

[이미지 열기](common/ch9-common-02-final-module-map.png)

- 목적: AppModule이 import하는 기능·인프라 모듈과 각 Controller·Provider의 소속을 정확히 보여준다.
- 흐름: AppModule import tree; module containers show their own controllers/providers; no CircularService
- 필수 라벨: AppModule · AuthModule · PostModule · UserModule · EventsModule · DrizzleModule · EventEmitterModule · ConfigModule
- 코드 근거: `9.13/node-cat/src/app.module.ts`, `9.13/node-cat/src/auth/auth.module.ts`, `9.13/node-cat/src/post/post.module.ts`, `9.13/node-cat/src/user/user.module.ts`, `9.13/node-cat/src/events/events.module.ts`

#### 3. NestJS 의존성 주입 치트시트

[이미지 열기](common/ch9-common-03-di-cheatsheet.png)

- 목적: 클래스 생성자 주입, 문자열 토큰 주입, 팩토리 Provider 세 패턴을 나란히 비교한다.
- 흐름: Three-column comparison, each resolving from DI Container to consumer
- 필수 라벨: constructor DI · AppService · @Inject('DRIZZLE') · Custom Token · useFactory · inject · DI Container
- 코드 근거: `9.1/node-cat/src/app.controller.ts`, `9.5/node-cat/src/drizzle/drizzle.module.ts`, `9.5/node-cat/src/auth/local.strategy.ts`

#### 4. NestJS 요청 파이프라인 치트시트

[이미지 열기](common/ch9-common-04-request-pipeline-cheatsheet.png)

- 목적: 요청과 응답, 예외가 Middleware, Guard, Interceptor, Pipe, Controller, Filter를 지나는 방향을 기억하기 쉽게 정리한다.
- 흐름: Forward request, reverse response, red exception bypass to Filter
- 필수 라벨: Request · Middleware · Guard · Interceptor · Pipe · Controller · Response · Exception Filter
- 코드 근거: `9.13/node-cat/src/main.ts`, `9.13/node-cat/src/app.module.ts`

#### 5. NestJS 주요 데코레이터 지도

[이미지 열기](common/ch9-common-05-decorator-map.png)

- 목적: 모듈, 라우팅, DI, 실행 확장점, WebSocket, 이벤트 데코레이터를 역할별로 분류한다.
- 흐름: Central NestJS Decorators node branching to structure, DI, pipeline, realtime, event categories
- 필수 라벨: @Module · @Controller · @Injectable · @Inject · @UseGuards · @UseInterceptors · @Catch · @WebSocketGateway · @OnEvent
- 코드 근거: `9.13/node-cat/src`

#### 6. 최종 NodeCat 시스템 조감도

[이미지 열기](common/ch9-common-06-final-system-overview.png)

- 목적: 브라우저의 HTTP와 WebSocket 요청이 인증, Controller·Gateway, Service, DB, Event Listener로 흐르는 최종 시스템을 설명한다.
- 흐름: Browser splits HTTP and WebSocket, joins authenticated application core, reaches DB and event fan-out
- 필수 라벨: Browser · HTTP · WebSocket · Passport Session · Controllers · PostGateway · Services · DRIZZLE / MySQL · EventEmitter · Listeners
- 코드 근거: `9.13/node-cat/src`

## 검증

```powershell
& 'C:\Users\speak\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  infographics/ch9/tools/finalize.py `
  --manifest infographics/ch9/manifest.json `
  --root infographics/ch9 `
  --contact-sheet infographics/ch9/contact-sheet.png
```

성공 기준: `60/60 assets present`, `all assets: 1920x1080`.
