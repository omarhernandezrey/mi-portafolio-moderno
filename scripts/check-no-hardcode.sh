#!/usr/bin/env bash
# === Anti-Hardcoding Validator ===
# Falla si encuentra prácticas de desarrollo incorrectas.

set -e
ERR=0

echo "🔍 Iniciando auditoría anti-hardcoding..."

echo "→ Buscando colores hex hardcoded en librería compartida..."
# src/lib/chatbot/ contiene utilidades compartidas (telegram, email, notion...).
# email.ts usa HTML con colores inline a propósito.
if grep -rEn "#[0-9a-fA-F]{3,6}" src/lib/chatbot/ --exclude="email.ts" 2>/dev/null; then
  echo "❌ Error: Se encontraron colores hexadecimales fijos. Usa var(--*-color) para coherencia con el tema."
  ERR=1
fi

echo "→ Buscando strings de UI sin internacionalización en el botón de WhatsApp..."
if grep -rEn '"[A-Z][a-záéíóú ]{8,}"' src/components/whatsapp/ | grep -v "t(" | grep -v "import" | grep -v "aria-label"; then
  echo "❌ Error: Se encontraron textos de UI sin i18n. Usa el hook useTranslation."
  ERR=1
fi

echo "→ Buscando URLs o claves hardcoded..."
if grep -rEn "(AIza|\bAQ\.[A-Za-z0-9_-]{15,}|sk-|https://[a-z]+\.supabase\.co)" src/ --exclude-dir=node_modules --exclude=env.ts --exclude="*Data.ts"; then
  echo "❌ Error: Se encontraron URLs o claves sensibles fijas. Usa src/config/env.ts."
  ERR=1
fi

echo "→ Buscando process.env fuera de config/env.ts..."
if grep -rEn "process\.env\." src/ --include="*.ts" --include="*.tsx" | grep -v "src/config/env.ts" | grep -v "scripts/" | grep -v "src/lib/supabaseServer.ts" | grep -v "src/app/api/cron/daily-summary/route.ts" | grep -v "src/app/api/cron/cleanup-cold-leads/route.ts"; then
  echo "❌ Error: Acceso directo a process.env detectado. Importa serverEnv o clientEnv desde src/config/env.ts."
  ERR=1
fi

if [ $ERR -eq 0 ]; then
  echo "✅ Auditoría exitosa: No se detectó hardcoding."
  exit 0
else
  echo "🚨 Auditoría fallida: Corrige los errores arriba indicados."
  exit 1
fi
