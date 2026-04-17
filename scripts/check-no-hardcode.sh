#!/usr/bin/env bash
# === Anti-Hardcoding Validator ===
# Falla si encuentra prácticas de desarrollo incorrectas en el chatbot.

set -e
ERR=0

echo "🔍 Iniciando auditoría anti-hardcoding..."

echo "→ Buscando colores hex hardcoded en el chatbot..."
# Buscamos patrones como #FFFFFF o #fff, pero permitimos el del favicon o similares si fuera necesario
if grep -rEn "#[0-9a-fA-F]{3,6}" src/components/shared/ChatWidget.tsx src/lib/chatbot/ 2>/dev/null; then
  echo "❌ Error: Se encontraron colores hexadecimales fijos. Usa var(--*-color) para coherencia con el tema."
  ERR=1
fi

echo "→ Buscando strings de UI sin internacionalización..."
# Buscamos strings largos con mayúscula inicial que no estén envueltos en t()
if grep -rEn '"[A-Z][a-záéíóú ]{8,}"' src/components/shared/ChatWidget.tsx | grep -v "t(" | grep -v "import"; then
  echo "❌ Error: Se encontraron textos de UI sin i18n. Usa el hook useTranslation."
  ERR=1
fi

echo "→ Buscando URLs o claves hardcoded..."
if grep -rEn "(AIza|AQ\.|sk-|https://[a-z]+\.supabase\.co)" src/ --exclude-dir=node_modules --exclude=env.ts --exclude="*Data.ts" --exclude=systemPrompt.ts; then
  echo "❌ Error: Se encontraron URLs o claves sensibles fijas. Usa src/config/env.ts."
  ERR=1
fi

echo "→ Buscando process.env fuera de config/env.ts..."
if grep -rEn "process\.env\." src/ --include="*.ts" --include="*.tsx" | grep -v "src/config/env.ts" | grep -v "scripts/"; then
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
