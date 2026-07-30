# N-2. MySQL · 워크벤치 설치 상세 (윈도 / 맥 / 리눅스)

> 영상(4-1)에서는 막히는 포인트 위주로 빠르게 넘어갑니다.
> 이 노트에 OS별 전체 과정과 **자주 나는 에러 해결법**을 정리해뒀습니다.
> 설치는 이 강의에서 제일 험난한 구간이에요. 여기서 좌절하는 분이 제일 많습니다.
> 막히면 에러 메시지를 그대로 AI에 붙여넣으세요 (→ N-1).

---

## 공통 — 설치 전에 알아둘 것

- **MySQL 서버**와 **워크벤치**는 다른 프로그램입니다.
  - MySQL 서버 = 실제 데이터베이스 (백그라운드에서 계속 돌아감)
  - 워크벤치 = 그걸 들여다보는 GUI 도구 (없어도 되지만 있으면 편함)
- 설치 중 정하는 **root 비밀번호는 반드시 메모**하세요. 까먹으면 재설치가 빠릅니다.
- 기본 포트는 **3306**입니다. 이미 뭔가 쓰고 있으면 충돌합니다.

---

## 윈도

### 설치

1. [dev.mysql.com/downloads/installer](https://dev.mysql.com/downloads/installer/) 에서 **MySQL Installer for Windows** 다운로드
   - `web-community` 버전이 용량이 작습니다 (설치 중에 받아옴)
2. Setup Type에서 **Developer Default** 선택 → 서버 + 워크벤치 + 기타 도구가 한 번에 설치됩니다
3. Check Requirements 단계에서 빠진 게 있으면 `Execute`로 자동 설치
4. **Type and Networking** → Config Type은 `Development Computer`, Port `3306` 그대로
5. **Authentication Method** → `Use Strong Password Encryption` (기본값) 선택
6. **Accounts and Roles** → root 비밀번호 설정 ← **여기서 정한 비밀번호를 메모**
7. **Windows Service** → `Start the MySQL Server at System Startup` 체크 유지
8. Apply Configuration → Execute

### 설치 확인

명령 프롬프트(cmd)에서:

```bat
mysql --version
```

`'mysql'은(는) 내부 또는 외부 명령... 이 아닙니다` 가 뜨면 **PATH 등록이 안 된 것**입니다.

### 윈도 PATH 등록

1. 시작 → `환경 변수` 검색 → **시스템 환경 변수 편집**
2. `환경 변수` 버튼 → 아래 `시스템 변수`에서 **Path** 선택 → 편집
3. `새로 만들기` → 아래 경로 추가 (버전에 따라 숫자가 다를 수 있음)
   ```
   C:\Program Files\MySQL\MySQL Server 8.0\bin
   ```
4. **cmd를 완전히 껐다가 새로 열기** ← 이거 안 하면 반영 안 됩니다

---

## 맥

### Homebrew로 설치 (권장)

```bash
# Homebrew가 없다면 먼저 설치
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install mysql
brew services start mysql      # 백그라운드 실행 + 부팅 시 자동 시작

# 초기 보안 설정 (root 비밀번호 지정)
mysql_secure_installation
```

`mysql_secure_installation`에서 물어보는 것들:

| 질문 | 권장 답 |
|---|---|
| VALIDATE PASSWORD component 사용? | `n` (학습용이면 비밀번호 규칙이 까다로워 불편) |
| New password | 원하는 비밀번호 ← **메모** |
| Remove anonymous users? | `y` |
| Disallow root login remotely? | `y` |
| Remove test database? | `y` |
| Reload privilege tables? | `y` |

### 워크벤치 설치

```bash
brew install --cask mysqlworkbench
```

또는 [dev.mysql.com/downloads/workbench](https://dev.mysql.com/downloads/workbench/) 에서 dmg 다운로드.

> **주의**: 워크벤치는 애플 실리콘(M1~) 네이티브 빌드가 늦게 나오는 편입니다.
> 설치가 꼬이면 워크벤치 없이 터미널 `mysql` 명령이나 VS Code 확장으로도 이 강의를 다 따라올 수 있습니다.

### dmg로 설치했다면 PATH 등록

```bash
echo 'export PATH="/usr/local/mysql/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 서버 상태 확인 / 제어

```bash
brew services list             # 상태 확인
brew services start mysql      # 시작
brew services stop mysql       # 중지
brew services restart mysql    # 재시작
```

---

## 리눅스 (우분투)

```bash
sudo apt update
sudo apt install mysql-server

sudo systemctl start mysql
sudo systemctl enable mysql    # 부팅 시 자동 시작
sudo systemctl status mysql    # 상태 확인

sudo mysql_secure_installation
```

우분투는 root가 기본적으로 `auth_socket` 방식이라 **비밀번호 대신 sudo로 접속**합니다.
비밀번호 방식으로 바꾸려면:

```bash
sudo mysql
```
```sql
ALTER USER 'root'@'localhost'
  IDENTIFIED WITH mysql_native_password BY '원하는비밀번호';
FLUSH PRIVILEGES;
EXIT;
```

---

## 워크벤치 커넥션 만들기

1. 워크벤치 실행 → **MySQL Connections** 옆 `＋`
2. 입력값

| 항목 | 값 |
|---|---|
| Connection Name | 아무거나 (`local` 등) |
| Hostname | `127.0.0.1` |
| Port | `3306` |
| Username | `root` |
| Password | `Store in Keychain/Vault` 눌러서 입력 |

3. **Test Connection** → 성공하면 OK

---

## 자주 나는 에러

### `Access denied for user 'root'@'localhost'`

비밀번호가 틀렸습니다. 기억이 안 나면 재설정:

**맥/리눅스**
```bash
# 서버 중지 후 권한 검사 없이 실행
brew services stop mysql              # (리눅스: sudo systemctl stop mysql)
mysqld_safe --skip-grant-tables &
mysql -u root
```
```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '새비밀번호';
```

**윈도**: MySQL Installer를 다시 실행 → `Reconfigure`로 비밀번호 재설정이 가장 빠릅니다.

### `Can't connect to MySQL server on '127.0.0.1'`

서버가 안 켜져 있습니다.

```bash
# 맥
brew services start mysql
# 리눅스
sudo systemctl start mysql
# 윈도: 서비스(services.msc) → MySQL80 → 시작
```

### 포트 3306이 이미 사용 중

```bash
# 맥/리눅스
lsof -i :3306
# 윈도
netstat -ano | findstr :3306
```

예전에 설치한 MySQL이나 Docker 컨테이너가 물고 있는 경우가 많습니다. 그걸 끄거나, 새 설치의 포트를 3307 등으로 바꾸세요. (포트를 바꿨다면 이후 강의의 연결 설정에서도 3307을 써야 합니다.)

### 워크벤치에서 `Public Key Retrieval is not allowed`

커넥션 편집 → **Advanced** 탭 → `Others` 칸에 추가:

```
useSSL=0
allowPublicKeyRetrieval=true
```

### 한글이 `???` 로 깨질 때

MySQL 8 기본 문자셋은 `utf8mb4`라 대개 괜찮지만, 문제가 있다면 DB 생성 시 명시:

```sql
CREATE DATABASE nodebird
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;
```

---

## 설치가 도저히 안 될 때 — 대안

학습 진도를 멈추는 게 제일 나쁩니다. 설치에서 하루 이상 막히면 이 중 하나로 넘어가세요.

1. **Docker** (도커가 이미 있다면 제일 깔끔)
   ```bash
   docker run --name mysql-course \
     -e MYSQL_ROOT_PASSWORD=1234 \
     -p 3306:3306 -d mysql:8
   ```
2. **클라우드 무료 티어** — PlanetScale, Aiven 등 MySQL 호환 무료 플랜
3. **워크벤치 없이 진행** — VS Code 확장(MySQL, Database Client) 또는 터미널 `mysql` 명령으로도 이 강의는 전부 따라올 수 있습니다
