# Database Setup

SeoulMate는 PostgreSQL 16을 사용합니다.

## 로컬 개발 환경

Docker Compose로 로컬 PostgreSQL을 실행합니다.

```bash
# 프로젝트 루트에서
docker compose up -d

# 확인
docker compose exec postgres psql -U seoulmate -d seoulmate -c '\dt'
```

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `seoulmate`
- **User**: `seoulmate`
- **Password**: `seoulmate_dev`

`backend/.env`:

```
DATABASE_URL=postgresql://seoulmate:seoulmate_dev@localhost:5432/seoulmate
```

## Production 환경 (VM)

Production VM에는 외부에 공개되지 않은 PostgreSQL이 `localhost:5432`에서 운영 중입니다.

### SSH를 통한 마이그레이션

```bash
# 1) VM에 SSH 접속
ssh -i ~/.ssh/pius user@your-vm-host

# 2) seoulmate DB 생성 (기존 DB를 건드리지 않음)
sudo -u postgres psql -c "CREATE ROLE seoulmate WITH LOGIN PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE seoulmate OWNER seoulmate;"

# 3) 스키마 적용
psql -U seoulmate -d seoulmate -f db/init.sql

# 또는 migrate.sh 사용 (role + DB + 스키마를 한번에)
DB_PASSWORD=your_password ./db/migrate.sh
```

`backend/.env` (VM):

```
DATABASE_URL=postgresql://seoulmate:your_password@localhost:5432/seoulmate
```

### SSH 터널을 통한 직접 접근

VM의 PostgreSQL은 외부에 노출되지 않으므로, 로컬에서 접근하려면 SSH 터널이 필요합니다.

```bash
# 로컬 터미널에서 SSH 터널 생성
# 로컬 15432 → VM의 localhost:5432로 포워딩
ssh -i ~/.ssh/pius -L 15432:localhost:5432 -N user@your-vm-host
```

터널이 열린 상태에서:

```bash
# psql로 접속
psql -h localhost -p 15432 -U seoulmate -d seoulmate
```

### DBeaver에서 SSH 터널 접속

1. **New Database Connection** → PostgreSQL 선택
2. **SSH** 탭:
   - **Use SSH Tunnel**: 체크
   - **Host**: `your-vm-host`
   - **Port**: `22`
   - **Username**: VM SSH 유저
   - **Authentication Method**: `Public Key`
   - **Private Key**: `~/.ssh/pius` (pius.pub의 개인키 경로)
   - **Passphrase**: 키에 설정한 경우 입력
3. **Main** 탭:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `seoulmate`
   - **Username**: `seoulmate`
   - **Password**: production 비밀번호
4. **Test Connection** → 성공 확인 후 **Finish**

## 스키마 관리

현재 `db/init.sql`에서 직접 관리합니다. 모든 DDL에 `IF NOT EXISTS`를 사용하여 반복 실행해도 안전합니다.

```bash
# 스키마 변경 후 적용
psql -U seoulmate -d seoulmate -f db/init.sql
```

## VM 배포 환경 (Self-Hosted Runner)

### 1. GitHub Actions Self-Hosted Runner 설치

```bash
# VM에서 실행
mkdir actions-runner && cd actions-runner
# GitHub repo → Settings → Actions → Runners → New self-hosted runner 의 안내를 따름
./config.sh --url https://github.com/<owner>/<repo> --token <TOKEN>
sudo ./svc.sh install
sudo ./svc.sh start
```

Runner 사용자를 docker 그룹에 추가:

```bash
sudo usermod -aG docker $(whoami)
# 재로그인 필요
```

### 2. GitHub Secrets 설정

Repository → Settings → Secrets and variables → Actions에서 추가:

| Secret | 값 예시 |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio에서 발급 |
| `DATABASE_URL` | `postgresql://seoulmate:<pw>@host.docker.internal:5432/seoulmate` |

### 3. PostgreSQL Docker Bridge 허용

Docker 컨테이너에서 `host.docker.internal`로 접근하므로 Docker bridge 네트워크를 허용해야 합니다.

```bash
# Docker bridge 대역 확인
docker network inspect bridge | grep Subnet
# 보통 172.17.0.0/16

# pg_hba.conf에 추가
echo "host all seoulmate 172.17.0.0/16 md5" | sudo tee -a /etc/postgresql/16/main/pg_hba.conf

# postgresql.conf에서 listen_addresses 확인 (Docker bridge도 수신해야 함)
# listen_addresses = 'localhost,172.17.0.1'  또는  '*'

sudo systemctl reload postgresql
```

### 4. DB 마이그레이션

```bash
# VM에서 seoulmate DB가 없으면 생성
sudo -u postgres psql -c "CREATE ROLE seoulmate WITH LOGIN PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE seoulmate OWNER seoulmate;"

# 스키마 적용
psql -U seoulmate -d seoulmate -f db/init.sql
```
