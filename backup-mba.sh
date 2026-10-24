#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/mba-laundry"
BACKUP_DIR="/var/backups/mba-laundry"
LOG_FILE="${BACKUP_DIR}/backup.log"
DATE_TAG="$(date +%F_%H-%M-%S)"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

log() {
  echo "[$(date +'%F %T')] $1" | tee -a "$LOG_FILE"
}

notify_fail() {
  local message="$1"
  if [[ -n "${FONNTE_TOKEN:-}" && -n "${WA_ALERT_TARGET:-}" ]]; then
    curl -sS -X POST "https://api.fonnte.com/send" \
      -H "Authorization: ${FONNTE_TOKEN}" \
      -d "target=${WA_ALERT_TARGET}" \
      -d "message=${message}" >/dev/null || true
  fi
}

backup_mysql() {
  log "Start MySQL dump"
  mysqldump \
    --host="${MYSQL_HOST}" \
    --port="${MYSQL_PORT}" \
    --user="${MYSQL_USER}" \
    --password="${MYSQL_PASSWORD}" \
    --single-transaction \
    --quick \
    "${MYSQL_DATABASE}" \
    > "${BACKUP_DIR}/mysql_${DATE_TAG}.sql"
}

backup_uploads() {
  log "Archive uploads"
  tar -czf "${BACKUP_DIR}/uploads_${DATE_TAG}.tar.gz" -C "$APP_DIR" uploads
}

cleanup_old() {
  log "Cleanup backup older than ${RETENTION_DAYS} days"
  find "$BACKUP_DIR" -type f -mtime +"$RETENTION_DAYS" -delete
}

main() {
  if ! backup_mysql; then
    log "MySQL dump failed"
    notify_fail "Backup MBA Laundry gagal saat dump MySQL"
    exit 1
  fi

  if ! backup_uploads; then
    log "Uploads backup failed"
    notify_fail "Backup MBA Laundry gagal saat backup uploads"
    exit 1
  fi

  cleanup_old
  log "Backup completed"
}

main

