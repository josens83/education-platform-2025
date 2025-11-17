#!/bin/bash

# Database Backup Script for Education Platform
# 프로덕션 환경에서 PostgreSQL 데이터베이스를 백업합니다.
# 자동으로 오래된 백업을 정리하고, 백업 성공/실패를 로깅합니다.

set -e

# ==================================================
# 설정
# ==================================================

# 환경 변수에서 데이터베이스 설정 가져오기
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-education_platform}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD}

# 백업 디렉토리
BACKUP_DIR=${BACKUP_DIR:-/var/backups/education-platform}
LOG_FILE=${LOG_FILE:-$BACKUP_DIR/backup.log}

# 백업 보관 설정
KEEP_DAYS=${KEEP_DAYS:-30}  # 백업 보관 일수
KEEP_WEEKS=${KEEP_WEEKS:-8}  # 주간 백업 보관 주수
KEEP_MONTHS=${KEEP_MONTHS:-12}  # 월간 백업 보관 개월수

# 날짜 포맷
DATE=$(date +%Y%m%d_%H%M%S)
DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday
DAY_OF_MONTH=$(date +%d)

# ==================================================
# 함수
# ==================================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
}

# 백업 디렉토리 생성
setup_directories() {
    log "Setting up backup directories..."
    mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly}
    mkdir -p "$(dirname "$LOG_FILE")"
}

# 데이터베이스 백업 수행
perform_backup() {
    local backup_type=$1
    local backup_path=$2

    log "Starting $backup_type backup to: $backup_path"

    # PostgreSQL 비밀번호 설정 (환경 변수 사용)
    export PGPASSWORD=$DB_PASSWORD

    # pg_dump로 백업 수행
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --format=custom \
        --compress=9 \
        --file="$backup_path"; then

        local size=$(du -h "$backup_path" | cut -f1)
        log "✅ Backup completed successfully. Size: $size"
        return 0
    else
        error "❌ Backup failed!"
        return 1
    fi
}

# 오래된 백업 정리
cleanup_old_backups() {
    log "Cleaning up old backups..."

    # 일간 백업: 30일 이상 된 것 삭제
    find "$BACKUP_DIR/daily" -name "*.backup" -type f -mtime +$KEEP_DAYS -delete

    # 주간 백업: 8주 이상 된 것 삭제
    find "$BACKUP_DIR/weekly" -name "*.backup" -type f -mtime +$((KEEP_WEEKS * 7)) -delete

    # 월간 백업: 12개월 이상 된 것 삭제
    find "$BACKUP_DIR/monthly" -name "*.backup" -type f -mtime +$((KEEP_MONTHS * 30)) -delete

    log "Cleanup completed"
}

# 백업 통계 출력
show_backup_stats() {
    log "=== Backup Statistics ==="
    log "Daily backups: $(find "$BACKUP_DIR/daily" -name "*.backup" | wc -l)"
    log "Weekly backups: $(find "$BACKUP_DIR/weekly" -name "*.backup" | wc -l)"
    log "Monthly backups: $(find "$BACKUP_DIR/monthly" -name "*.backup" | wc -l)"
    log "Total disk usage: $(du -sh "$BACKUP_DIR" | cut -f1)"
    log "======================="
}

# S3 업로드 (선택적 - AWS CLI가 설치된 경우)
upload_to_s3() {
    local backup_path=$1

    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        log "Uploading backup to S3: $S3_BUCKET"

        if aws s3 cp "$backup_path" "s3://$S3_BUCKET/backups/$(basename "$backup_path")"; then
            log "✅ S3 upload successful"
        else
            error "❌ S3 upload failed"
        fi
    fi
}

# 백업 검증
verify_backup() {
    local backup_path=$1

    log "Verifying backup integrity..."

    export PGPASSWORD=$DB_PASSWORD

    if pg_restore --list "$backup_path" > /dev/null 2>&1; then
        log "✅ Backup integrity verified"
        return 0
    else
        error "❌ Backup verification failed!"
        return 1
    fi
}

# ==================================================
# 메인 로직
# ==================================================

main() {
    log "================================================"
    log "Starting database backup process"
    log "Database: $DB_NAME on $DB_HOST:$DB_PORT"
    log "================================================"

    # 백업 디렉토리 설정
    setup_directories

    # 백업 타입 결정
    BACKUP_TYPE="daily"
    BACKUP_SUBDIR="daily"

    # 월요일이면 주간 백업
    if [ "$DAY_OF_WEEK" -eq 1 ]; then
        BACKUP_TYPE="weekly"
        BACKUP_SUBDIR="weekly"
    fi

    # 매월 1일이면 월간 백업
    if [ "$DAY_OF_MONTH" -eq "01" ]; then
        BACKUP_TYPE="monthly"
        BACKUP_SUBDIR="monthly"
    fi

    # 백업 파일 경로
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_SUBDIR/${DB_NAME}_${BACKUP_TYPE}_${DATE}.backup"

    # 백업 수행
    if perform_backup "$BACKUP_TYPE" "$BACKUP_FILE"; then
        # 백업 검증
        if verify_backup "$BACKUP_FILE"; then
            # S3 업로드 (설정된 경우)
            upload_to_s3 "$BACKUP_FILE"

            # 오래된 백업 정리
            cleanup_old_backups

            # 통계 출력
            show_backup_stats

            log "✅ Backup process completed successfully"
            exit 0
        else
            error "Backup verification failed. Removing corrupted backup."
            rm -f "$BACKUP_FILE"
            exit 1
        fi
    else
        error "Backup process failed"
        exit 1
    fi
}

# 스크립트 실행
main
