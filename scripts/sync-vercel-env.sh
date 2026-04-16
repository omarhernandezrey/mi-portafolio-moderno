#!/usr/bin/env bash
set -euo pipefail

# === Sync Vercel Env Vars ===
# Este script lee .env.local y sube cada variable a Vercel (Production + Preview)
# Requiere: Vercel CLI instalado y logueado (vercel login).

if [ ! -f .env.local ]; then
  echo "❌ Error: No se encontró el archivo .env.local en la raíz."
  exit 1
fi

echo "🚀 Iniciando sincronización de variables con Vercel..."

# Leer el archivo línea por línea
while IFS='=' read -r key value || [ -n "$key" ]; do
  # Ignorar comentarios y líneas vacías
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  
  # Limpiar comillas si existen
  value="${value%\"}"
  value="${value#\"}"
  
  echo "📤 Subiendo $key..."
  
  # Usar printf para manejar caracteres especiales en el valor
  printf "%s" "$value" | vercel env add "$key" production --force || true
  printf "%s" "$value" | vercel env add "$key" preview --force || true
  
done < .env.local

echo "✅ Variables sincronizadas exitosamente."
echo "💡 Recuerda ejecutar 'vercel deploy' para aplicar los cambios si es necesario."
