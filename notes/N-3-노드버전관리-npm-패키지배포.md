# N-3. 노드 버전 관리 · npm 명령어 · 패키지 배포

> 영상에서는 `npm init`, `npm i`, 그리고 SemVer의 `^`만 다뤘습니다.
> 나머지는 필요할 때 이 노트에서 찾아 쓰세요.

---

## 1. 노드 버전 관리

### 왜 필요한가

회사 프로젝트 A는 노드 18, 개인 프로젝트 B는 노드 22를 쓰는 상황이 실제로 흔합니다.
버전 관리 도구를 쓰면 **폴더마다 다른 노드 버전**을 쓸 수 있습니다.

### 맥 / 리눅스 — nvm

```bash
# 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# 터미널 재시작 후

nvm install --lts        # 최신 LTS 설치
nvm install 20           # 특정 버전 설치
nvm use 20               # 현재 터미널에서 20 사용
nvm alias default 22     # 기본 버전 지정
nvm ls                   # 설치된 버전 목록
nvm current              # 현재 버전
```

프로젝트 폴더에 `.nvmrc` 파일을 만들어 두면 팀원과 버전을 맞출 수 있습니다.

```bash
echo "22" > .nvmrc
nvm use          # .nvmrc를 읽어서 자동 전환
```

### 윈도 — nvm-windows

[github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases) 에서 `nvm-setup.exe` 설치.

```bat
nvm install lts
nvm install 20.11.0
nvm use 20.11.0
nvm list
```

> **주의**: 윈도용 nvm은 **관리자 권한 터미널**에서 실행해야 하고, 기존에 설치된 노드가 있으면 먼저 제거해야 충돌이 없습니다.

### 대안 — fnm (더 빠름)

```bash
brew install fnm         # 맥
fnm install 22
fnm use 22
```

---

## 2. npm 버전 업데이트

```bash
npm -v                   # 현재 버전
npm i -g npm@latest      # 최신으로
npm i -g npm@10          # 특정 메이저 버전으로
```

> 노드를 설치하면 npm이 딸려 오지만, npm만 따로 최신으로 올릴 수 있습니다.
> 다만 **노드 버전이 지원하지 않는 npm**을 올리면 깨질 수 있으니, 특별한 이유가 없으면 딸려 온 버전을 쓰세요.

---

## 3. npm 명령어 정리

### 설치 관련

```bash
npm i                    # package.json 기준 전체 설치
npm i express            # 일반 의존성 추가
npm i -D nodemon         # 개발용 의존성 (devDependencies)
npm i -g pm2             # 전역 설치
npm i express@4.18.2     # 특정 버전
npm i express@latest     # 최신 버전

npm ci                   # lock 파일 그대로 설치 (CI/배포용, 훨씬 빠르고 정확)
```

> `npm i`와 `npm ci`의 차이: `i`는 package.json을 보고 범위 내에서 최신을 가져올 수 있지만,
> `ci`는 **lock 파일에 박힌 버전 그대로** 설치합니다. 배포 서버에서는 `ci`를 쓰세요.

### 조회

```bash
npm ls                   # 설치된 패키지 트리
npm ls express           # 특정 패키지가 왜 깔렸는지 추적
npm outdated             # 업데이트 가능한 패키지 목록
npm view express         # 패키지 정보 (버전 목록, 의존성 등)
npm view express versions --json   # 배포된 전체 버전
```

### 제거 · 업데이트

```bash
npm uninstall express
npm update               # SemVer 범위 내에서 업데이트
npm update express
```

### 스크립트

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js",
    "build": "tsc"
  }
}
```

```bash
npm start                # start, test 등은 run 생략 가능
npm run dev              # 나머지는 run 필요
```

### 보안

```bash
npm audit                # 알려진 취약점 검사
npm audit fix            # 자동 수정 가능한 것 수정
npm audit fix --force    # 메이저 버전까지 올려서 수정 (깨질 수 있음, 주의)
```

### 캐시

```bash
npm cache clean --force
npm cache verify
```

---

## 4. SemVer(유의적 버전) 완전 정리

```
4  .  18  .  2
↑     ↑     ↑
major minor patch
```

| 자리 | 언제 올리나 | 호환성 |
|---|---|---|
| **major** | 기존 코드가 깨지는 변경 | ❌ 깨질 수 있음 |
| **minor** | 기능 추가 (기존 것은 그대로) | ✅ 호환 |
| **patch** | 버그 수정 | ✅ 호환 |

### 범위 지정자

| 표기 | 의미 | 허용 범위 |
|---|---|---|
| `^4.18.2` | major 고정 (**기본값**) | `4.18.2` ~ `4.x.x`, `5.0.0` ❌ |
| `~4.18.2` | minor 고정 | `4.18.2` ~ `4.18.x` |
| `4.18.2` | 정확히 이 버전만 | `4.18.2` |
| `*` 또는 `x` | 아무거나 | 위험 |
| `>=4.18.2 <5` | 직접 범위 지정 | 명시한 대로 |

> `^`가 기본인 이유: minor·patch는 호환된다는 게 SemVer의 약속이니까요.
> 다만 **약속일 뿐이라 안 지키는 패키지도 있습니다.** 그래서 lock 파일이 필요합니다.

### package-lock.json

- 실제로 설치된 **정확한 버전**을 기록합니다
- **반드시 깃에 커밋하세요** (node_modules는 커밋하지 않지만, lock은 합니다)
- 팀원 전원이 완전히 동일한 버전을 쓰게 해줍니다

---

## 5. 업그레이드 후 충돌이 났을 때

증상: 설치가 실패하거나, 되던 게 갑자기 안 되거나, `ERESOLVE` 에러.

**순서대로 시도하세요.**

```bash
# 1단계 — 가장 흔한 해결책
rm -rf node_modules package-lock.json
npm i

# 윈도라면
rmdir /s /q node_modules
del package-lock.json
npm i
```

```bash
# 2단계 — 캐시가 꼬였을 때
npm cache clean --force
rm -rf node_modules package-lock.json
npm i
```

```bash
# 3단계 — peer dependency 충돌 (ERESOLVE)
npm i --legacy-peer-deps
```

> `--legacy-peer-deps`는 **충돌을 무시**하는 것이지 해결하는 게 아닙니다.
> 임시방편으로 쓰고, 나중에 진짜 원인(어떤 패키지가 어떤 버전을 요구하는지)을 확인하세요.
> 에러 메시지에 그 정보가 다 나와 있습니다.

```bash
# 4단계 — 노드 버전 자체가 안 맞을 때
node -v                  # 패키지가 요구하는 버전인지 확인
nvm use 22
```

---

## 6. 내 패키지 npm에 배포하기

여러분 이름이 npm에 올라가는 경험, 생각보다 별거 아니고 재밌습니다.

### 1) 준비

```bash
mkdir my-first-package && cd my-first-package
npm init                 # name은 npm에 없는 고유한 이름이어야 함
```

`package.json` 핵심 필드:

```json
{
  "name": "zerocho-hello-util",
  "version": "1.0.0",
  "description": "간단한 인사말 유틸",
  "main": "index.js",
  "keywords": ["hello", "util"],
  "author": "your-name",
  "license": "MIT",
  "files": ["index.js", "README.md"]
}
```

- **name**: 이미 있으면 배포가 거부됩니다. [npmjs.com](https://www.npmjs.com)에서 미리 검색해보세요
- **files**: 배포에 포함할 파일. 지정 안 하면 `.npmignore`/`.gitignore` 규칙을 따릅니다
- **main**: `require('패키지명')` 했을 때 로드될 파일

### 2) 코드 작성

```js
// index.js
module.exports = function hello(name) {
  return `안녕하세요, ${name}님!`;
};
```

`README.md`도 같이 쓰세요. npm 페이지에 그대로 표시됩니다.

### 3) 배포

```bash
npm adduser              # 계정 생성 (또는 npm login)
npm whoami               # 로그인 확인

npm publish              # 배포!
```

### 4) 버전 올리고 재배포

**같은 버전은 다시 배포할 수 없습니다.** 반드시 버전을 올려야 합니다.

```bash
npm version patch        # 1.0.0 → 1.0.1
npm version minor        # 1.0.1 → 1.1.0
npm version major        # 1.1.0 → 2.0.0
npm publish
```

### 5) 배포 취소

```bash
npm unpublish 패키지명 --force     # 72시간 이내만 가능
npm deprecate 패키지명 "더 이상 관리하지 않습니다"   # 권장
```

> 배포 후 72시간이 지나면 삭제할 수 없습니다(생태계 보호). `deprecate`로 표시만 할 수 있어요.
> **연습용 패키지는 이름에 본인 아이디를 붙이거나, scoped 패키지(`@아이디/이름`)로 배포**하는 걸 권합니다.

### scoped 패키지로 배포하기

```bash
npm init --scope=@myid
npm publish --access public    # scoped는 기본이 private이라 이 옵션 필요
```
