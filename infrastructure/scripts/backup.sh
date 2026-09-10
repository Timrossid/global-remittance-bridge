#!/bin/bash
set -euo pipefail
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"
pg_dump -U remittance -h postgres payment_api | gzip > "$BACKUP_DIR/payment_api_$TIMESTAMP.sql.gz"
find "$BACKUP_DIR" -name "payment_api_*.sql.gz" -mtime +7 -delete
echo "Backup completed: payment_api_$TIMESTAMP.sql.gz"
