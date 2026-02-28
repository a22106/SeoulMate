#!/usr/bin/env bash
# 기존 PostgreSQL에 seoulmate DB를 안전하게 생성하고 스키마를 적용한다.
# 다른 DB는 건드리지 않는다.
#
# 사용법:
#   DB_USER=seoulmate DB_PASSWORD=seoulmate_dev ./db/migrate.sh
#   또는 인자 없이 실행하면 기본값 사용

set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-seoulmate}"
DB_USER="${DB_USER:-seoulmate}"
DB_PASSWORD="${DB_PASSWORD:-seoulmate_dev}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

export PGPASSWORD="$DB_PASSWORD"

# 1) Role 생성 (없으면)
psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -tc \
  "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'" | grep -q 1 || \
  psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c \
  "CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';"

# 2) DB 생성 (없으면)
psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -tc \
  "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
  psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c \
  "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# 3) 스키마 적용 (IF NOT EXISTS로 멱등성 보장)
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/init.sql"

echo "Migration complete: $DB_NAME on $DB_HOST:$DB_PORT"
