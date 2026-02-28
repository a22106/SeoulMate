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
- **Port**: `27361`
- **Database**: `seoulmate`
- **User**: `seoulmate`
- **Password**: `seoulmate_dev`

`backend/.env`:

```
DATABASE_URL=postgresql://seoulmate:seoulmate_dev@localhost:27361/seoulmate
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
