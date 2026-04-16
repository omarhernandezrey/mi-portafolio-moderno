# Scripts de Operación y DevOps

Este directorio contiene herramientas para facilitar la gestión del portafolio y su chatbot.

## Sincronización de Variables de Entorno

### Vercel (Hoy)
Para subir tus claves locales a Vercel de forma masiva:
```bash
./scripts/sync-vercel-env.sh
```
*Requiere:* Vercel CLI (`npm i -g vercel`) y haber iniciado sesión (`vercel login`).

### Google Cloud (Futuro)
Si decides migrar a Google Cloud Run o similar:
```bash
./scripts/sync-gcp-env.sh <tu-id-de-proyecto>
```
*Requiere:* gcloud CLI instalado y configurado.

## Seguridad
Nunca subas el archivo `.env.local` a Git. Estos scripts te ayudan a mantener tus claves en la nube de forma segura sin tener que escribirlas una por una en los dashboards.
