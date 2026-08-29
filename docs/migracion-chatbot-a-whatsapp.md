# Migración: chatbot → botón flotante de WhatsApp

Rama: `feature/whatsapp-button-remove-chatbot`
Base: `0bc3557`

## Qué reemplaza al chatbot

Un **botón flotante de WhatsApp** (`src/components/whatsapp/WhatsAppFloatingButton.tsx`) fijo en `bottom-6 right-6 z-[9999]` — el mismo sitio que ocupaba el launcher del chat. Al pulsarlo abre un **menú de 5 intenciones**:

| Intención | Abre |
|---|---|
| Cotizar un proyecto | WhatsApp con mensaje precargado |
| Consultar un servicio | WhatsApp con mensaje precargado |
| Tengo una oferta laboral | WhatsApp con mensaje precargado (reemplaza el flujo de reclutador del chatbot) |
| Soporte | WhatsApp con mensaje precargado |
| Agendar una llamada | **Cal.com** (`NEXT_PUBLIC_CALCOM_CONSULT_URL`); fallback a WhatsApp si no está configurada |

El mensaje se arma según la ruta actual (`getIntentTarget` en `src/config/whatsapp.ts`). Analítica: `track('whatsapp_click' | 'calcom_click', { intent, page })`.

Además, `WhatsAppCTA` (`src/components/whatsapp/WhatsAppCTA.tsx`) reemplaza al antiguo `<OpenChatButton>` en las 3 páginas de servicios — misma API (`message`, `className`, `children`), ahora un enlace `wa.me`.

Config centralizada en `src/config/whatsapp.ts` (número, `buildWhatsAppUrl()`, mensajes por ruta/intención). El número sale de `NEXT_PUBLIC_WHATSAPP_NUMBER` con `573219052878` como fallback.

## Qué se pierde (aceptado)

- **La conversación ya no vive en la app.** Ocurre dentro de WhatsApp. No hay transcripción, ni tabla `messages` creciendo, ni panel `/admin/conversations`.
- **El KPI "Conversaciones" y "Tasa de Conversión"** del dashboard admin desaparecen. Vercel Analytics no expone los eventos custom a la app, así que no se pueden sustituir por "clics de WhatsApp" dentro del panel propio. El clic se registra como evento `whatsapp_click` (`{ intent, page }`) visible **solo en el panel de Vercel Analytics**.
- **Captura automática de leads del chat.** El cierre automático que insertaba en `leads` + notificaba Telegram/Notion ya no existe. Los leads siguen entrando por: formulario de contacto, calculadora de presupuesto y alta manual en `/admin/leads/new`.
- **RAG, failover multi-proveedor LLM, A/B de saludos, playbook de ventas** — todo eliminado.

## Archivos eliminados

**UI:** `src/components/shared/ChatWidget.tsx`, `src/components/shared/OpenChatButton.tsx`, `src/services/chatService.ts`
**API:** `src/app/api/chat/` (route, history, poll, re-engage), `src/app/api/admin/conversations/route.ts`
**Admin:** `src/app/admin/(dashboard)/conversations/page.tsx`
**Librería:** `src/lib/chatbot/{llm,groq,systemPrompt,parser,openings,rag,calcom}.ts`, `src/lib/chatbot/providers/` (21), `src/lib/chatbot/data/` (menos `catalog.ts`, movido), `src/lib/chatbot/eval/`
**Scripts:** `eval-chatbot.ts`, `index-projects.ts`, `seed-rag.ts`, `test-groq-key.ts`, `check-quotas.ts`
**Tests:** `api-chat.test.ts`, `parser.test.ts`, `openings.test.ts`, `systemPrompt.test.ts`, `calcom.test.ts`

## Archivos movidos / editados de código compartido

| Archivo | Cambio |
|---|---|
| `src/lib/chatbot/data/catalog.ts` → `src/lib/services/catalog.ts` | Lo usa la calculadora (`src/lib/calculator/pricing.ts`), no era del chatbot |
| `src/lib/leads/types.ts` (nuevo) | Alberga `interface Lead` (vivía en `parser.ts`); lo usan `contactBridge.ts` y `notion.ts` |
| `src/lib/chatbot/telegram.ts` | Se quitó `notifyLead` + `NotifyLeadInput` + `escapeMd2` (solo los usaba el chat). Queda `notifyTelegram` |
| `src/lib/chatbot/{notion,contactBridge}.ts` | `import { Lead }` repuntado a `@/lib/leads/types` |
| `src/app/ClientProvider.tsx` | Monta `WhatsAppFloatingButton` en vez de `ChatWidget` |
| `src/app/[locale]/servicios/*` (3) | `OpenChatButton` → `WhatsAppCTA` |
| `src/lib/admin/permissions.ts` | Quitadas 3 entradas de `/admin/conversations` (path rule, API rule, NAV_ITEM) |
| `src/components/admin/AdminNav.tsx` | Quitado icono `MessageSquare` de `/admin/conversations` |
| `src/app/admin/(dashboard)/page.tsx` | `getStats()` sin `conversations`; StatCards "Conversaciones" y "Tasa de Conversión" → "Tickets Abiertos" y "Ventas Cerradas"; quitado MetricItem "Conversaciones" |
| `src/config/env.ts` | Quitados del schema Zod y de `serverEnv` los ~24 vars de proveedores LLM |
| `.env.example` | Quitadas las secciones Groq, HuggingFace y "FASE 27 multi-provider" |
| `jest.config.ts` | `collectCoverageFrom` reducido a `src/lib/chatbot/payments.ts` |
| `scripts/check-no-hardcode.sh` | Reapuntado de `ChatWidget.tsx` a `src/components/whatsapp/` |
| `package.json` | Fuera dep `groq-sdk`, `@huggingface/inference`, `nanoid` y script `eval:chatbot` |

## Base de datos — NO tocada

Las tablas `conversations` y `messages` **se conservan** con todos sus datos históricos y migraciones. Ya no reciben escrituras nuevas. Las siguen leyendo (sin romperse, con resultados vacíos con el tiempo) los crons `daily-summary`, `database-cleanup` y `cleanup-cold-leads`.

**Decisión pendiente de Omar:** mantener las tablas como legacy, exportarlas y archivarlas, o eliminarlas en una migración futura. No se hace aquí.

## Residuos justificados (no eliminados)

- `k6/load-test.js` referencia `/api/chat` — script de carga standalone, no está en CI ni en el build. Repuntarlo queda fuera del alcance de esta migración.
- `src/app/admin/(dashboard)/logs/page.tsx` tiene colores de badge para `openai`/`anthropic` — es el visor de la tabla `logs`; registros antiguos pueden referirlos. Sin dependencia de código del chatbot.
- `src/app/robots.ts` menciona `anthropic-ai` — regla para crawlers de IA, no relacionado.
- Documentos históricos de planificación (`CHATBOT_TASKS.md`, `CHATBOT_INTEGRATION_MAP.md`, `AUDITORIA_CHATBOT_TASKS.md`, etc.) se dejan como registro del proyecto.

## Acciones manuales para Omar

1. **Vercel — borrar variables de entorno** ya sin uso (Production + Preview + Development):
   `GROQ_API_KEY`, `HF_TOKEN`, `OPENROUTER_API_KEY`, `CEREBRAS_API_KEY`, `MISTRAL_API_KEY`, `DEEPSEEK_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `LLM_PROVIDER_CHAIN`, `NVIDIA_API_KEY`, `NVIDIA_MISTRAL_API_KEY`, `NVIDIA_KIMI_API_KEY`, `NVIDIA_NEMOTRON_API_KEY`, `NVIDIA_LLAMA4_API_KEY`, `NVIDIA_MISTRAL_NEMOTRON_API_KEY`, `NVIDIA_PHI4_API_KEY`, `NVIDIA_GEMMA3_API_KEY`, `NVIDIA_DRACARYS_API_KEY`, `NVIDIA_SOLAR_API_KEY`.
2. **Revocar** esas API keys en cada panel de proveedor (Groq, NVIDIA, OpenRouter, Cerebras, Mistral, DeepSeek, Cloudflare, HuggingFace).
3. Decidir el futuro de las tablas `conversations` / `messages`.
4. (Opcional) `pgvector` / la tabla de embeddings del RAG queda sin uso — misma decisión.
5. (Opcional) Actualizar `k6/load-test.js` y limpiar los docs históricos del chatbot.

## Rollback

```bash
git checkout main            # volver al estado previo
git branch -D feature/whatsapp-button-remove-chatbot   # descartar la rama
```
Commits de referencia en la rama:
- `59a40f3` docs auditoría
- `f85737e` feat botón WhatsApp
- (commit de eliminación del chatbot — ver `git log`)
