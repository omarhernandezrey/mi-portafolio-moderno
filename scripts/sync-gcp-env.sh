#!/usr/bin/env bash
set -euo pipefail

# === Sync GCP Secret Manager ===
# Este script lee .env.local y sube cada variable a Google Cloud Secret Manager.
# Requiere: gcloud CLI instalado y logueado, y la API de Secret Manager habilitada.

PROJECT_ID="${1:-}"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Debes proporcionar el ID del proyecto de Google Cloud."
  echo "Uso: ./sync-gcp-env.sh <project-id>"
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "❌ Error: No se encontró el archivo .env.local en la raíz."
  exit 1
fi

echo "🚀 Iniciando sincronización de variables con GCP Secret Manager (Proyecto: $PROJECT_ID)..."

while IFS='=' read -r key value || [ -n "$key" ]; do
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  value="${value%\"}"; value="${value#\"}"
  
  echo "📤 Sincronizando secreto: $key..."
  
  if gcloud secrets describe "$key" --project="$PROJECT_ID" >/dev/null 2>&1; then
    printf "%s" "$value" | gcloud secrets versions add "$key" --data-file=- --project="$PROJECT_ID"
  else
    printf "%s" "$value" | gcloud secrets create "$key" --data-file=- --replication-policy=automatic --project="$PROJECT_ID"
  fi
done < .env.local

echo "✅ Variables sincronizadas exitosamente con GCP."
