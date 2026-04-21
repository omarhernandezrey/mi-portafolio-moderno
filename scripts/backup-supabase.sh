#!/usr/bin/env bash
# Backup semanal de Supabase a repo privado de GitHub.
# Pensado para correr en GitHub Actions, pero también local con los mismos env vars.
#
# Variables requeridas:
#   SUPABASE_DB_URL       Connection string Postgres directa (puerto 5432, NO el pooler 6543)
#   BACKUPS_REPO          owner/repo del repo privado de backups (ej: omarhernandezrey/omar-portafolio-backups)
#   BACKUPS_REPO_TOKEN    PAT de GitHub con scope `repo` (acceso de escritura al repo de backups)
#   TELEGRAM_BOT_TOKEN    Token del bot
#   TELEGRAM_CHAT_ID      Chat al que se notifica
#
# Salida: sube un archivo backups/supabase-YYYY-MM-DD.sql.gz al repo de backups
# y notifica por Telegram. Falla con exit code != 0 si pg_dump o el push fallan.

set -euo pipefail

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL no está definido}"
: "${BACKUPS_REPO:?BACKUPS_REPO no está definido}"
: "${BACKUPS_REPO_TOKEN:?BACKUPS_REPO_TOKEN no está definido}"
: "${TELEGRAM_BOT_TOKEN:?TELEGRAM_BOT_TOKEN no está definido}"
: "${TELEGRAM_CHAT_ID:?TELEGRAM_CHAT_ID no está definido}"

DATE="$(date -u +%Y-%m-%d)"
WORKDIR="$(mktemp -d)"
DUMP_FILE="${WORKDIR}/supabase-${DATE}.sql"
GZ_FILE="${DUMP_FILE}.gz"

cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

notify_telegram() {
  local text="$1"
  curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -H 'Content-Type: application/json' \
    --data "$(printf '{"chat_id":"%s","text":"%s","parse_mode":"Markdown"}' "$TELEGRAM_CHAT_ID" "$text")" \
    >/dev/null || echo "⚠️  Telegram falló (no fatal)"
}

on_error() {
  notify_telegram "🚨 *Backup semanal FALLÓ* (\`${DATE}\`). Revisar logs en GitHub Actions."
}
trap 'on_error; cleanup' ERR

echo "▶️  Dumping Supabase → ${DUMP_FILE}"
pg_dump \
  --no-owner \
  --no-privileges \
  --format=plain \
  --file="$DUMP_FILE" \
  "$SUPABASE_DB_URL"

echo "▶️  Comprimiendo dump"
gzip -9 "$DUMP_FILE"

SIZE_BYTES="$(stat -c '%s' "$GZ_FILE" 2>/dev/null || stat -f '%z' "$GZ_FILE")"
SIZE_MB="$(awk "BEGIN { printf \"%.2f\", ${SIZE_BYTES} / 1048576 }")"
echo "📦 Tamaño: ${SIZE_MB} MB"

echo "▶️  Clonando repo de backups"
REPO_DIR="${WORKDIR}/repo"
git clone --depth=1 "https://x-access-token:${BACKUPS_REPO_TOKEN}@github.com/${BACKUPS_REPO}.git" "$REPO_DIR"

mkdir -p "${REPO_DIR}/backups"
cp "$GZ_FILE" "${REPO_DIR}/backups/"

cd "$REPO_DIR"
git config user.email "backup-bot@noreply.github.com"
git config user.name "backup-bot"
git add "backups/supabase-${DATE}.sql.gz"

if git diff --cached --quiet; then
  echo "ℹ️  No hay cambios (backup idéntico al anterior). Skipping push."
  notify_telegram "💾 *Backup semanal OK* (\`${DATE}\`, ${SIZE_MB} MB) — sin cambios respecto al previo."
  exit 0
fi

git commit -m "backup: supabase ${DATE} (${SIZE_MB} MB)"
git push origin HEAD

notify_telegram "💾 *Backup semanal OK* (\`${DATE}\`, ${SIZE_MB} MB)"
echo "✅ Backup completado"
