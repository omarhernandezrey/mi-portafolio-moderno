#!/usr/bin/env bash
# === Sincroniza las variables de Vercel con .env.local — versión con criterio ===
#
# La versión anterior de este script subía TODO el .env.local a Vercel, sin
# distinguir runtime de herramientas locales: así llegaron a Vercel el PAT de
# GitHub, SUPABASE_DB_URL, el token del CLI de Supabase, etc. Esta versión:
#
#   1. Sube SOLO las variables que el runtime de la app lee (lista explícita),
#      a los tres entornos, con los valores locales (verificados con env:check).
#   2. BORRA de Vercel las claves muertas: nada del runtime las lee; scripts y
#      workflows corren en GitHub Actions con sus propios secretos.
#   3. Expande alias ($VAR) al cargar el entorno, salta las vacías (HASHNODE_*)
#      y excluye NEXT_PUBLIC_SITE_URL (el valor local es de desarrollo).
#
# Uso:
#   bash scripts/sync-vercel-env.sh --dry-run   # muestra el plan, no toca nada
#   bash scripts/sync-vercel-env.sh             # ejecuta de verdad
#
# Requiere CLI de Vercel autenticado: `vercel login`, o un VERCEL_TOKEN real en
# el entorno. Tras ejecutar: redeploy (push a main o botón Redeploy).
set -euo pipefail

[ -f .env.local ] || { echo "❌ No hay .env.local en la raíz."; exit 1; }

DRY=false
[ "${1:-}" = "--dry-run" ] && DRY=true

set -a; . ./.env.local; set +a

# El CLI debe usar la vinculación de .vercel/project.json. Si VERCEL_PROJECT_ID
# llega exportado (del .env o del entorno), el CLI exige VERCEL_ORG_ID y TODO
# falla — fue la causa del primer intento fallido. Y un VERCEL_TOKEN de
# plantilla (contiene corchetes) rompe el CLI aunque haya sesión de login.
unset VERCEL_PROJECT_ID VERCEL_TEAM_ID VERCEL_ORG_ID 2>/dev/null || true
if [ -n "${VERCEL_TOKEN:-}" ] && printf '%s' "$VERCEL_TOKEN" | grep -q '\['; then
  echo "⚠️  VERCEL_TOKEN del entorno parece plantilla: se ignora (se usará la sesión de vercel login)."
  unset VERCEL_TOKEN
fi

# Variables que el RUNTIME lee (src/config/env.ts y supabase server/middleware).
# NEXT_PUBLIC_SITE_URL queda fuera a propósito: el valor local es localhost.
SUBIR=(
  SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY
  ADMIN_ALLOWED_EMAILS CRON_SECRET NEWSLETTER_UNSUBSCRIBE_SECRET
  GITHUB_TOKEN
  TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID TELEGRAM_BOT_USERNAME TELEGRAM_WEBHOOK_SECRET
  RESEND_API_KEY NOTION_API_KEY NOTION_DATABASE_ID INDEXNOW_API_KEY
  NEXT_PUBLIC_WHATSAPP_NUMBER
  NEXT_PUBLIC_CALCOM_INTERVIEW_URL NEXT_PUBLIC_CALCOM_CONSULT_URL
  NEXT_PUBLIC_PAYMENT_PAYPAL_URL NEXT_PUBLIC_PAYMENT_WOMPI_URL NEXT_PUBLIC_PAYMENT_NEQUI_QR
  NEXT_PUBLIC_GSC_VERIFICATION NEXT_PUBLIC_BING_VERIFICATION
)

# Claves muertas en Vercel (auditoría 2026-11-17): el runtime no las lee.
BORRAR=(
  GITHUB_REPO GITHUB_PERSONAL_ACCESS_TOKEN
  SUPABASE_DB_PASSWORD SUPABASE_DB_URL SUPABASE_ACCESS_TOKEN SUPABASE_PROJECT_REF
  VERCEL_PROJECT_ID VERCEL_TEAM_ID VERCEL_OIDC_TOKEN
  DEV_TO_API_KEY
)

ENTORNOS=(production preview development)
FALLOS=0

echo "🗑️  Borrando claves muertas de Vercel…"
for key in "${BORRAR[@]}"; do
  for env in "${ENTORNOS[@]}"; do
    if $DRY; then
      echo "  [dry-run] vercel env rm $key $env"
    elif salida="$(vercel env rm "$key" "$env" --yes 2>&1)"; then
      echo "  ✖ $key ($env): borrada"
    elif printf '%s' "$salida" | grep -qi "not found\|was not found\|not.*exist"; then
      echo "  — $key ($env): no existía"
    else
      echo "  ❌ $key ($env): $(printf '%s' "$salida" | grep -m1 -i 'error' || echo 'fallo sin mensaje')"
      FALLOS=$((FALLOS + 1))
    fi
  done
done

echo "📤 Subiendo las variables de runtime (valores de .env.local)…"
for key in "${SUBIR[@]}"; do
  valor="${!key:-}"
  if [ -z "$valor" ]; then
    echo "  — $key: vacía en local, se salta"
    continue
  fi
  # El --force del CLI 59 devuelve éxito pero NO reemplaza filas antiguas
  # (quedaron valores de 214 días marcados como ✔ en el primer intento).
  # Borrar y recrear es determinista; la ventana sin variable no importa
  # porque el entorno solo se aplica al desplegar.
  if ! $DRY; then
    for env in "${ENTORNOS[@]}"; do
      vercel env rm "$key" "$env" --yes >/dev/null 2>&1 || true
    done
  fi
  for env in "${ENTORNOS[@]}"; do
    if $DRY; then
      echo "  [dry-run] vercel env add $key $env --force"
    elif salida="$(printf '%s' "$valor" | vercel env add "$key" "$env" --force 2>&1)"; then
      echo "  ✔ $key ($env)"
    else
      echo "  ❌ $key ($env): $(printf '%s' "$salida" | grep -m1 -i 'error' || echo 'fallo sin mensaje')"
      FALLOS=$((FALLOS + 1))
    fi
  done
done

if $DRY; then
  echo "✅ Ensayo terminado: nada se tocó."
elif [ "$FALLOS" -gt 0 ]; then
  echo "❌ Sincronización INCOMPLETA: $FALLOS operaciones fallaron (ver arriba). Nada de redeploy hasta corregirlo."
  exit 1
else
  echo "✅ Sincronización terminada sin fallos. Falta el redeploy para aplicarla (push a main o botón Redeploy)."
fi
