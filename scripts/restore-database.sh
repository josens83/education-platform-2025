#!/bin/bash

# Database Restore Script for Education Platform
# PostgreSQL 백업 파일을 복원합니다.

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
LOG_FILE=${LOG_FILE:-$BACKUP_DIR/restore.log}

# ==================================================
# 함수
# ==================================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
}

# 사용법 출력
usage() {
    cat << EOF
Usage: $0 [OPTIONS] <backup-file>

Database Restore Script for Education Platform

OPTIONS:
    -h, --help          Show this help message
    -l, --list          List available backups
    -c, --clean         Drop and recreate database before restore
    -n, --dry-run       Show what would be restored without actually restoring

EXAMPLES:
    # List available backups
    $0 --list

    # Restore from specific backup
    $0 /var/backups/education-platform/daily/education_platform_daily_20250117_120000.backup

    # Clean restore (WARNING: This will delete all existing data!)
    $0 --clean /path/to/backup.backup

EOF
    exit 1
}

# 사용 가능한 백업 목록 출력
list_backups() {
    log "=== Available Backups ==="
    echo ""
    echo "Daily backups:"
    find "$BACKUP_DIR/daily" -name "*.backup" -type f -printf "%T@ %Tc %p\n" 2>/dev/null | sort -rn | head -10 | awk '{$1=""; print}'
    echo ""
    echo "Weekly backups:"
    find "$BACKUP_DIR/weekly" -name "*.backup" -type f -printf "%T@ %Tc %p\n" 2>/dev/null | sort -rn | head -5 | awk '{$1=""; print}'
    echo ""
    echo "Monthly backups:"
    find "$BACKUP_DIR/monthly" -name "*.backup" -type f -printf "%T@ %Tc %p\n" 2>/dev/null | sort -rn | awk '{$1=""; print}'
    exit 0
}

# 백업 파일 검증
verify_backup_file() {
    local backup_file=$1

    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi

    log "Verifying backup file: $backup_file"

    export PGPASSWORD=$DB_PASSWORD

    if pg_restore --list "$backup_file" > /dev/null 2>&1; then
        log "✅ Backup file is valid"
        return 0
    else
        error "❌ Backup file is corrupted or invalid"
        exit 1
    fi
}

# 데이터베이스 정리 (선택적)
clean_database() {
    log "WARNING: Dropping existing database..."
    read -p "Are you sure you want to drop the database? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log "Database drop cancelled"
        exit 0
    fi

    export PGPASSWORD=$DB_PASSWORD

    log "Dropping database: $DB_NAME"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" || true

    log "Creating database: $DB_NAME"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

    log "Database cleaned and recreated"
}

# 데이터베이스 복원
restore_database() {
    local backup_file=$1
    local dry_run=$2

    if [ "$dry_run" = "true" ]; then
        log "=== DRY RUN MODE ==="
        log "Would restore from: $backup_file"
        log "To database: $DB_NAME on $DB_HOST:$DB_PORT"
        log "=== END DRY RUN ==="
        return 0
    fi

    log "Starting database restore..."
    log "From: $backup_file"
    log "To: $DB_NAME on $DB_HOST:$DB_PORT"

    export PGPASSWORD=$DB_PASSWORD

    # pg_restore 수행
    # --clean: 복원 전 객체 삭제
    # --if-exists: 객체가 없어도 에러 발생하지 않음
    # --no-owner: 객체 소유자 복원하지 않음
    # --no-privileges: 권한 복원하지 않음
    if pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        --verbose \
        "$backup_file" 2>&1 | tee -a "$LOG_FILE"; then

        log "✅ Database restore completed successfully"
        return 0
    else
        error "❌ Database restore failed!"
        return 1
    fi
}

# 복원 후 검증
verify_restore() {
    log "Verifying restore..."

    export PGPASSWORD=$DB_PASSWORD

    # 테이블 수 확인
    local table_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

    log "Number of tables: $table_count"

    if [ "$table_count" -gt 0 ]; then
        log "✅ Restore verification passed"
        return 0
    else
        error "❌ Restore verification failed: No tables found"
        return 1
    fi
}

# ==================================================
# 메인 로직
# ==================================================

main() {
    local backup_file=""
    local clean=false
    local dry_run=false

    # 인자 파싱
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                ;;
            -l|--list)
                list_backups
                ;;
            -c|--clean)
                clean=true
                shift
                ;;
            -n|--dry-run)
                dry_run=true
                shift
                ;;
            *)
                backup_file="$1"
                shift
                ;;
        esac
    done

    # 백업 파일이 지정되지 않은 경우
    if [ -z "$backup_file" ]; then
        error "No backup file specified"
        usage
    fi

    log "================================================"
    log "Starting database restore process"
    log "Database: $DB_NAME on $DB_HOST:$DB_PORT"
    log "================================================"

    # 백업 파일 검증
    verify_backup_file "$backup_file"

    # 데이터베이스 정리 (옵션)
    if [ "$clean" = true ]; then
        clean_database
    fi

    # 데이터베이스 복원
    if restore_database "$backup_file" "$dry_run"; then
        if [ "$dry_run" = false ]; then
            # 복원 후 검증
            verify_restore

            log "✅ Restore process completed successfully"
            log "================================================"
            exit 0
        else
            exit 0
        fi
    else
        error "Restore process failed"
        exit 1
    fi
}

# 스크립트 실행
main "$@"
