# Auditoría del chatbot — previa a migración a WhatsApp

Rama: `feature/whatsapp-button-remove-chatbot`
Fecha: 2026-08-28
Base: commit `0bc3557`

Objetivo: saber exactamente qué se rompe al quitar el chatbot y qué NO se puede tocar.

---

## 1. Archivos del chatbot (ruta → rol)

### UI
| Archivo | Rol |
|---|---|
| `src/components/shared/ChatWidget.tsx` | Widget completo: launcher flotante + ventana de chat (586 líneas) |
| `src/components/shared/OpenChatButton.tsx` | Botón que dispara `CustomEvent('chatbot-open')` para abrir el widget desde otras secciones |
| `src/services/chatService.ts` | Cliente `fetch('/api/chat')` — tipo `ChatResponse` + `sendChatMessage()` |
| `src/app/ClientProvider.tsx` | **Punto de montaje** (ver §2). No es del chatbot, pero lo monta. |

### API
| Archivo | Rol |
|---|---|
| `src/app/api/chat/route.ts` | Endpoint principal. Rate-limit, crea/lee `conversations` + `messages`, extrae contacto, cierre automático → inserta `leads`, notifica Telegram + Notion, llama al LLM |
| `src/app/api/chat/history/route.ts` | Devuelve últimos mensajes de una `conversation` para restaurar el widget al recargar |
| `src/app/api/chat/poll/route.ts` | Polling de mensajes nuevos (soporte a `human_takeover`) |
| `src/app/api/chat/re-engage/route.ts` | Mensaje de re-enganche si el visitante ya dio nombre |

### Librería `src/lib/chatbot/` — SOLO del chatbot
| Archivo | Rol |
|---|---|
| `llm.ts` | Orquestador multi-proveedor con failover (FASE 27) |
| `groq.ts` | Reexport deprecado → `llm.ts` |
| `systemPrompt.ts` | Construcción del prompt de sistema |
| `parser.ts` | `cleanReply`, `extractLead/Handoff/Calcom` + interfaces `Lead/Handoff/Calcom` (⚠️ `Lead` es compartido, ver §4) |
| `openings.ts` | Variantes A/B de saludo inicial |
| `rag.ts` | Búsqueda semántica de proyectos (HuggingFace + pgvector) |
| `calcom.ts` | Helpers de enlaces Cal.com (usado por `ChatWidget.tsx`) |
| `providers/*.ts` (20 archivos) | Wrappers de cada proveedor LLM (groq, nvidia×11, openrouter, cerebras, mistral, deepseek, cloudflare, ollama, huggingface, types) |
| `data/*.ts` (catalog, objections, persona, salesPlaybook, index) + `data/_omar_inputs.md` | Datos de venta del prompt |
| `eval/scenarios.ts` | Escenarios de evaluación |

### Scripts
| Archivo | Rol |
|---|---|
| `scripts/eval-chatbot.ts` | Eval del chatbot (`npm run eval:chatbot`) |
| `scripts/index-projects.ts` | Indexa proyectos para el RAG |
| `scripts/test-groq-key.ts` | Prueba manual de la key de Groq |

### Tests
`__tests__/integration/api-chat.test.ts`, `__tests__/unit/{parser,openings,systemPrompt,calcom}.test.ts`

### i18n
Namespace `chatbot` en `src/locales/es/common.json` y `src/locales/en/common.json` (title, status, placeholder, welcome, loading, error, handoff*, calendar*, ariaOpen/Close, quickActions.*). Consumido solo por `ChatWidget.tsx` y `OpenChatButton.tsx`.

---

## 2. Punto de montaje del widget (lo reutiliza el botón de WhatsApp)

`src/app/ClientProvider.tsx`:
```tsx
const ChatWidget = dynamic(() => import('@/components/shared/ChatWidget'), { ssr: false, loading: () => null });
// ...
<MotionConfig reducedMotion={isMobile ? 'always' : 'never'}>
  {children}
  <ChatWidget />
</MotionConfig>
```

Clases de posición dentro de `ChatWidget.tsx`:

| Elemento | Clases |
|---|---|
| Launcher (botón redondo) | `fixed bottom-6 right-6 z-[9999] h-14 w-14 ... sm:h-16 sm:w-16` |
| Ventana de chat | `fixed z-[9998] ... sm:bottom-24 sm:right-4 sm:h-[min(70dvh,520px)] sm:w-[clamp(320px,88vw,380px)] ... md:bottom-28 md:right-6 md:w-[380px]` |
| En móvil abierto | el launcher se oculta (`hidden sm:flex`), la ventana ocupa casi todo el viewport |

→ El botón de WhatsApp ocupa **`fixed bottom-6 right-6 z-[9999]`**; su menú de intenciones se ancla en **`bottom-24 right-4` / `md:bottom-28 md:right-6`**.

Breakpoint móvil del proyecto: `max-width: 768px` (usado en `ClientProvider.tsx`).
Analítica: `import { track } from '@vercel/analytics'` — el widget emite `track('chatbot_opened')` y `track('lead_created', { source: 'chatbot' })`. Mismo mecanismo que `ContactForm.tsx` (`track('contact_form_submitted')`).

---

## 3. Dependencias que quedan huérfanas al quitar el chatbot

### Paquetes npm (verificado con `rg` — sin otros consumidores)
| Paquete | Único uso |
|---|---|
| `groq-sdk` | `src/lib/chatbot/providers/groq.ts` + `scripts/test-groq-key.ts` |
| `@huggingface/inference` | `src/lib/chatbot/rag.ts` + `providers/huggingface.ts` |
| `nanoid` | `src/components/shared/ChatWidget.tsx` |

`@notionhq/client` **NO** es huérfano: `chatbot/notion.ts` lo usa y es compartido (§4).

### Variables de entorno solo del chatbot (LLM providers)
`GROQ_API_KEY`, `HF_TOKEN`, `OPENROUTER_API_KEY`, `CEREBRAS_API_KEY`, `MISTRAL_API_KEY`, `DEEPSEEK_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `LLM_PROVIDER_CHAIN`, y `NVIDIA_API_KEY` + `NVIDIA_{MISTRAL,KIMI,NEMOTRON,LLAMA4,MISTRAL_NEMOTRON,PHI4,GEMMA3,DRACARYS,SOLAR}_API_KEY`.

`GROQ_API_KEY` está marcada como **requerida** en el schema Zod de `src/config/env.ts` (`serverSchema`). Se quita del schema y de `.env.example`; se lista en el informe para que Omar las borre del panel de Vercel.

---

## 4. Código COMPARTIDO — NO se toca

| Archivo | Lo usa el chatbot… y también |
|---|---|
| `src/lib/chatbot/telegram.ts` | `notifyLead` (chat) — pero `notifyTelegram` lo usan ~15 rutas: payment/confirm, calculator, newsletter/send, onboarding/{contract,pago}, telegram/webhook, tickets, tickets/[id]/messages, cron/{daily-summary,cleanup-cold-leads,email-followup,database-cleanup,check-limits}, privacy/delete + scripts |
| `src/lib/chatbot/email.ts` | `sendContactNotification` (contactBridge), `sendNewsletterConfirmation/Edition` (newsletter), `sendFollowUpEmail/sendLeadMagnetFollowUp` (cron). El chat **no** lo importa. |
| `src/lib/chatbot/notion.ts` | `pushLeadToNotion` — también onboarding/pago y calculator |
| `src/lib/chatbot/contactBridge.ts` | Solo `/api/contact/bridge` (formulario de contacto tradicional). No es del chatbot. |
| `src/lib/chatbot/payments.ts` | Solo `src/app/onboarding/[token]/page.tsx`. No es del chatbot. |
| `src/lib/chatbot/parser.ts` → `interface Lead` | `contactBridge.ts` importa `Lead` de aquí. Al borrar `parser.ts` hay que **mover `Lead`** a un archivo neutral (p. ej. `src/lib/leads/types.ts`) y reapuntar `contactBridge.ts`. |
| Tabla `leads` | La crean también: formulario de contacto, calculadora, alta manual en `/admin/leads/new`. **NO se borra.** |
| Tabla `conversations` / `messages` | Solo chatbot, pero las leen crons (`daily-summary`, `database-cleanup`, `cleanup-cold-leads`). Se dejan las tablas y migraciones; se documenta que quedan sin escritura nueva. |

---

## 5. Consumidores del chatbot en el dashboard admin (aquí es donde se rompe el build)

| Ubicación | Qué lee | Acción al quitar el chatbot |
|---|---|---|
| `src/app/admin/(dashboard)/conversations/page.tsx` | Lista de `conversations` vía `/api/admin/conversations` | Eliminar página completa |
| `src/app/api/admin/conversations/route.ts` | `conversations` + `messages(count)` + `leads` | Eliminar ruta |
| `src/components/admin/AdminNav.tsx` (línea 34) | Icono `'/admin/conversations': MessageSquare` | Quitar entrada del mapa `NAV_ICONS` |
| `src/lib/admin/permissions.ts` | 3 entradas: `ADMIN_PATH_RULES` (línea 21), API rules (línea 47), `NAV_ITEMS` "Conversaciones" (línea 93) | Quitar las 3 |
| `src/app/admin/(dashboard)/page.tsx` (dashboard home) | `getStats()` cuenta `conversations` (`totalConvs`, `prevConvs`), calcula `conversionRate = leads/convs`, muestra StatCard "Conversaciones" + MetricItem "Conversaciones" en "Resumen del Mes" | Reescribir `getStats()` sin `conversations`; sustituir la StatCard "Conversaciones" por "Tickets Abiertos" y quitar la tarjeta "Tasa de Conversión" (queda sin sentido). Documentar. |
| `src/lib/admin/types.ts` (línea 40) | `conversation_id: string \| null` en tipo de lead | Se deja: el campo de la tabla `leads` sigue existiendo |

Analítica: Vercel Analytics no expone los eventos custom a la app, así que **no se puede** reemplazar el KPI "Conversaciones" por "clics de WhatsApp" dentro del dashboard. Se elimina el KPI; el clic de WhatsApp se registra solo como evento (`track('whatsapp_click', { intent, page })`) visible en el panel de Vercel Analytics.
