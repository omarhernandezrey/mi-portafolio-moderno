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

# Un VERCEL_TOKEN de plantilla (contiene corchetes) rompe el CLI aunque haya
# sesión de `vercel login`: se descarta con aviso.
if [ -n "${VERCEL_TOKEN:-}" ] && printf '%s' "$VERCEL_TOKEN" | grep -q '\['; then
  echo "⚠️  VERCEL_TOKEN del entorno parece plantilla: se ignora (se usará la sesión de vercel login)."
  unset VERCEL_TOKEN
fi

set -a; . ./.env.local; set +a

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

echo "🗑️  Borrando claves muertas de Vercel…"
for key in "${BORRAR[@]}"; do
  for env in "${ENTORNOS[@]}"; do
    if $DRY; then
      echo "  [dry-run] vercel env rm $key $env"
    else
      vercel env rm "$key" "$env" --yes 2>/dev/null \
        && echo "  ✖ $key ($env)" \
        || echo "  — $key ($env): no existía"
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
  for env in "${ENTORNOS[@]}"; do
    if $DRY; then
      echo "  [dry-run] vercel env add $key $env --force"
    else
      printf '%s' "$valor" | vercel env add "$key" "$env" --force >/dev/null \
        && echo "  ✔ $key ($env)" \
        || echo "  ❌ $key ($env): FALLO"
    fi
  done
done

if $DRY; then
  echo "✅ Ensayo terminado: nada se tocó."
else
  echo "✅ Sincronización terminada. Falta el redeploy para aplicarla (push a main o botón Redeploy)."
fi
