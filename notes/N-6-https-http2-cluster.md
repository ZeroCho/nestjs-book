# N-6. https · http2 · cluster 직접 구현

> 실무에서는 이 셋을 직접 코딩할 일이 많지 않습니다.
> https는 보통 nginx나 로드밸런서가, cluster는 pm2가 대신 해주거든요 (→ 9-1강).
> 그래도 **원리를 알고 도구를 쓰는 것과 모르고 쓰는 건 다릅니다.**

---

## 1. https — 왜 필요한가

### http의 문제

http는 **평문**입니다. 중간에서 누구나 읽을 수 있어요.
로그인 폼에 입력한 비밀번호가 그대로 흘러갑니다. 공용 와이파이에서 특히 위험하죠.

https는 통신을 **암호화(TLS)** 합니다. 요즘은 선택이 아니라 필수예요.
브라우저가 http 사이트에 "안전하지 않음" 딱지를 붙이고, 일부 기능(위치 정보, 카메라, 서비스 워커)은 아예 https에서만 동작합니다.

### 인증서가 필요하다

암호화를 하려면 **인증서**가 있어야 합니다. 신뢰할 수 있는 기관(CA)이 "이 도메인은 진짜 이 사람 것이 맞다"고 보증해주는 파일이에요.

- **개발용**: 자체 서명(self-signed) 인증서 → 브라우저가 경고를 띄우지만 동작은 함
- **실서비스**: [Let's Encrypt](https://letsencrypt.org) 무료 인증서가 사실상 표준

### 자체 서명 인증서 만들기 (개발용)

```bash
openssl req -nodes -new -x509 \
  -keyout server.key -out server.cert -days 365
```

### 노드에서 https 서버 띄우기

```js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
};

https.createServer(options, (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>암호화된 연결</h1>');
}).listen(443);
```

익스프레스와 함께 쓸 때:

```js
const express = require('express');
const https = require('https');
const app = express();

app.get('/', (req, res) => res.send('hello'));

https.createServer(options, app).listen(443);
```

### http → https 리다이렉트

```js
const http = require('http');

http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80);
```

### 실무에서는 — 직접 안 합니다

대부분 이렇게 합니다.

```
사용자 ──https──> nginx / AWS ALB ──http──> 노드 서버(3000)
                  (여기서 인증서 처리)      (평문이지만 내부망이라 OK)
```

**이유**

- 인증서 갱신(90일마다)을 `certbot`이 자동으로 해줌
- 노드 프로세스를 재시작하지 않고 인증서를 교체할 수 있음
- 443 포트를 쓰려면 root 권한이 필요한데, 노드를 root로 돌리는 건 위험함

그래서 **9-2강 AWS 배포**에서도 노드는 평문으로 두고 앞단에서 https를 처리하는 구조를 씁니다.

---

## 2. http2 — 더 빠른 http

### 뭐가 다른가

| | HTTP/1.1 | HTTP/2 |
|---|---|---|
| 전송 형식 | 텍스트 | 바이너리 |
| 동시 요청 | 연결마다 순차 (HOL 블로킹) | **하나의 연결에서 다중화** |
| 헤더 | 매번 전부 전송 | 압축(HPACK) |
| 서버 푸시 | ❌ | ✅ (지금은 비권장) |

핵심은 **다중화(multiplexing)** 입니다. HTTP/1.1은 이미지 100개를 받으려면 연결을 여러 개 열고 순서를 기다려야 했는데, HTTP/2는 연결 하나로 동시에 주고받습니다.

### 노드에서

```js
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
});

server.on('stream', (stream, headers) => {
  stream.respond({
    'content-type': 'text/html; charset=utf-8',
    ':status': 200,
  });
  stream.end('<h1>HTTP/2</h1>');
});

server.listen(443);
```

> 브라우저는 **https 위에서만 http2를 지원**합니다. 그래서 `createSecureServer`를 씁니다.

### 익스프레스와 함께 쓰려면

익스프레스 4는 http2 API와 완전히 호환되지 않습니다. `spdy` 같은 호환 계층을 쓰거나, **역시 nginx가 http2를 처리하게 하는 게 일반적**입니다.

---

## 3. cluster — 코어를 다 쓰기

### 왜

노드는 프로세스 하나에서 JS를 한 스레드로 실행합니다. 서버 CPU가 8코어여도 **1코어만 쓰는** 셈이에요. 나머지 7개가 놀고 있습니다.

`cluster`는 **프로세스를 코어 수만큼 복제**해서 이 문제를 해결합니다.

### 직접 구현

```js
const cluster = require('cluster');
const os = require('os');
const http = require('http');

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`마스터 프로세스 ${process.pid} 시작`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();               // 워커 생성
  }

  // 워커가 죽으면 새로 띄우기 — 무중단의 기본
  cluster.on('exit', (worker, code, signal) => {
    console.log(`워커 ${worker.process.pid} 종료. 새로 띄웁니다.`);
    cluster.fork();
  });

} else {
  // 워커들이 실제 서버 역할
  http.createServer((req, res) => {
    res.end(`응답한 프로세스: ${process.pid}`);
  }).listen(8080);

  console.log(`워커 ${process.pid} 시작`);
}
```

여러 번 새로고침하면 **응답하는 PID가 바뀝니다.** 요청이 워커들에게 분산되는 거예요.

### 주의 — 메모리를 공유하지 않는다

프로세스가 완전히 분리되어 있어서, **한 워커의 변수는 다른 워커가 못 봅니다.**

```js
let count = 0;                    // ❌ 워커마다 따로 존재
app.get('/', (req, res) => res.end(String(++count)));
```

새로고침할 때마다 숫자가 뒤죽박죽이 됩니다. 그래서:

- **세션**을 메모리에 저장하면 안 됩니다 → Redis 같은 외부 저장소 필요 (9-1강의 `connect-redis`)
- 캐시·카운터도 마찬가지

이게 **클러스터를 쓰면 세션 저장소가 필요해지는 이유**입니다.

### 실무에서는 — pm2

위 코드를 직접 안 씁니다. pm2가 다 해줘요.

```bash
pm2 start app.js -i max      # 코어 수만큼 자동 생성
pm2 start app.js -i 4        # 4개만
pm2 reload app               # 무중단 재시작 ← 직접 구현하면 꽤 까다로움
pm2 monit                    # 실시간 모니터링
```

pm2가 추가로 해주는 것:

- 프로세스가 죽으면 자동 재시작
- 무중단 배포(reload)
- 로그 수집·회전
- 메모리 임계치 넘으면 재시작
- 서버 재부팅 시 자동 시작(`pm2 startup`, `pm2 save`)

> **결론**: cluster의 원리는 알아두고, 실제로는 pm2를 쓰세요. 9-1강에서 다룹니다.

---

## 4. cluster vs worker_threads — 헷갈리지 마세요

| | cluster | worker_threads |
|---|---|---|
| 단위 | 프로세스 | 스레드 |
| 메모리 | 완전 분리 | 분리(공유 가능) |
| 생성 비용 | 큼 | 작음 |
| 목적 | **트래픽 분산** | **CPU 계산 분산** |
| 예시 | 동시 접속자가 많다 | 이미지 리사이징이 느리다 |

→ worker_threads는 **N-4 노트** 참고
