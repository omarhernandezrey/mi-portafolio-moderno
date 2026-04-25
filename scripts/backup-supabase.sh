#!/usr/bin/env bash
# Backup semanal de Supabase a repo privado de GitHub y Cloudflare R2.
# Pensado para correr en GitHub Actions, pero también local con los mismos env vars.
#
# Variables requeridas:
#   SUPABASE_DB_URL       Connection string Postgres directa (puerto 5432, NO el pooler 6543)
#   BACKUPS_REPO          owner/repo del repo privado de backups (ej: omarhernandezrey/omar-portafolio-backups)
#   BACKUPS_REPO_TOKEN    PAT de GitHub con scope `repo` (acceso de escritura al repo de backups)
#   TELEGRAM_BOT_TOKEN    Token del bot
#   TELEGRAM_CHAT_ID      Chat al que se notifica
#
# Variables opcionales (para R2):
#   CLOUDFLARE_ACCOUNT_ID
#   CLOUDFLARE_API_TOKEN
#   R2_BUCKET_NAME
#   BACKUP_PUBLIC_KEY     (age1...) Si se provee, el backup en R2 se encriptará.
#
# Salida: sube un archivo backups/supabase-YYYY-MM-DD.sql.gz al repo de backups
# y opcionalmente a Cloudflare R2, luego notifica por Telegram.

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
AGE_FILE="${GZ_FILE}.age"

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

# --- DESTINO 1: GitHub Private Repo ---
echo "▶️  Subiendo a GitHub (${BACKUPS_REPO})"
REPO_DIR="${WORKDIR}/repo"
git clone --depth=1 "https://x-access-token:${BACKUPS_REPO_TOKEN}@github.com/${BACKUPS_REPO}.git" "$REPO_DIR"

mkdir -p "${REPO_DIR}/backups"
cp "$GZ_FILE" "${REPO_DIR}/backups/"

cd "$REPO_DIR"
git config user.email "backup-bot@noreply.github.com"
git config user.name "backup-bot"
git add "backups/supabase-${DATE}.sql.gz"

HAS_CHANGES=true
if git diff --cached --quiet; then
  echo "ℹ️  No hay cambios en el dump (respecto al último en GitHub)."
  HAS_CHANGES=false
fi

if [ "$HAS_CHANGES" = true ]; then
  git commit -m "backup: supabase ${DATE} (${SIZE_MB} MB)"
  git push origin HEAD
fi

# --- DESTINO 2: Cloudflare R2 (Opcional) ---
if [ -n "${CLOUDFLARE_API_TOKEN:-}" ] && [ -n "${R2_BUCKET_NAME:-}" ]; then
  echo "▶️  Subiendo a Cloudflare R2 (${R2_BUCKET_NAME})"
  
  UPLOAD_TARGET="$GZ_FILE"
  
  if [ -n "${BACKUP_PUBLIC_KEY:-}" ]; then
    echo "🔒 Encriptando con age..."
    age -r "$BACKUP_PUBLIC_KEY" -o "$AGE_FILE" "$GZ_FILE"
    UPLOAD_TARGET="$AGE_FILE"
  fi
  
  # Usar wrangler para subir (asume CLOUDFLARE_API_TOKEN y CLOUDFLARE_ACCOUNT_ID definidos)
  export CLOUDFLARE_API_TOKEN
  export CLOUDFLARE_ACCOUNT_ID
  
  OBJECT_KEY="supabase/supabase-${DATE}.sql.gz"
  [ -n "${BACKUP_PUBLIC_KEY:-}" ] && OBJECT_KEY="${OBJECT_KEY}.age"
  
  npx wrangler r2 object put "${R2_BUCKET_NAME}/${OBJECT_KEY}" --file="$UPLOAD_TARGET"
  echo "✅ Subido a R2: ${OBJECT_KEY}"
  
  # Limpieza de backups antiguos en R2 (conservar últimos 12)
  # Nota: Se recomienda usar R2 Lifecycle Policies en el dashboard de Cloudflare para esto.
  # Pero aquí hacemos un intento básico de limpieza si wrangler está disponible.
  echo "🧹 Revisando retención en R2..."
  BACKUPS_LIST=$(npx wrangler r2 object list "$R2_BUCKET_NAME" --prefix "supabase/" --json | jq -r '.[].key' | sort -r)
  COUNT=0
  while read -r key; do
    [ -z "$key" ] && continue
    COUNT=$((COUNT + 1))
    if [ $COUNT -gt 12 ]; then
      echo "🗑️ Borrando backup antiguo: $key"
      npx wrangler r2 object delete "${R2_BUCKET_NAME}/${key}"
    fi
  done <<< "$BACKUPS_LIST"
fi

# Notificación final
MSG="💾 *Backup semanal OK* (\`${DATE}\`, ${SIZE_MB} MB)"
if [ "$HAS_CHANGES" = false ]; then
  MSG="${MSG} — sin cambios respecto al previo."
fi
notify_telegram "$MSG"

echo "✅ Proceso completado"
