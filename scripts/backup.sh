#!/usr/bin/env bash
# Backup del database di produzione (dump compresso, rotazione 14 giorni).
# Uso:  DATABASE_URL=postgresql://... ./scripts/backup.sh [cartella_destinazione]
# Pianificabile via cron, es.:  0 3 * * *  /percorso/scripts/backup.sh /backups
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL non impostata}"
DEST="${1:-./backups}"
mkdir -p "$DEST"

STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$DEST/rider-$STAMP.sql.gz"

echo "Backup → $FILE"
pg_dump "$DATABASE_URL" | gzip > "$FILE"

# Rotazione: elimina i backup più vecchi di 14 giorni.
find "$DEST" -name 'rider-*.sql.gz' -mtime +14 -delete

echo "Fatto. Backup presenti:"
ls -1 "$DEST"/rider-*.sql.gz
