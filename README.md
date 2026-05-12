# Mi Portafolio Moderno — Máquina de leads 24/7 a $0/mes

Portafolio web profesional de **Omar Hernández Rey** (Ingeniero de Software, Colombia) construido con **Next.js 15**, **TypeScript** y **Tailwind CSS**, con un chatbot AI de ventas integrado, admin dashboard completo, infraestructura de testing en 6 capas y despliegue continuo en Vercel.

**Producción:** https://mi-portafolio-moderno.vercel.app

![Next.js](https://img.shields.io/badge/Next.js-15.5.18-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-96_pasando-brightgreen?style=for-the-badge)
![Coverage](https://img.shields.io/badge/Coverage-94.97%25-brightgreen?style=for-the-badge)

---

## Auditoría de funcionalidades — 40 ✅ completas · 3 ⚠️ manuales · 0 ❌ faltantes

| Área | Estado |
|------|--------|
| Chatbot core (endpoint, prompt, parser, memoria) | ✅ |
| Multi-proveedor LLM con failover (18 adaptadores) | ✅ |
| Base de datos Supabase (conversations, messages, leads, api_logs) | ✅ |
| Widget de chat (voz, imagen, consentimiento, 3 idiomas) | ✅ |
| Notificaciones Telegram + webhook bidireccional | ✅ |
| Catálogo, playbook de ventas, manejo de objeciones | ✅ |
| Admin dashboard (leads, conversaciones, tickets, facturación, timer, webhooks) | ✅ |
| Opciones de pago (PayPal, Wompi, Nequi, Mercado Pago, Binance) | ✅ |
| Agendado Cal.com con auto-detección de zona horaria | ✅ |
| Política de privacidad + derecho al olvido GDPR | ✅ |
| Rate limiting por IP | ✅ |
| SEO programático (sitemap, robots, 100+ rutas servicio×ciudad) | ✅ |
| Blog MDX | ✅ |
| Open Graph dinámico | ✅ |
| Lead magnets + entrega gated por email | ✅ |
| Newsletter (Resend + Supabase) | ✅ |
| Calculadora de presupuesto | ✅ |
| RAG con pgvector (el bot cita proyectos reales) | ✅ |
| Entrada por voz (Web Speech API) | ✅ |
| Análisis de imagen (Llama Vision) | ✅ |
| 9 GitHub Actions (backups, crons, health check, directorios) | ✅ |
| Status page público | ✅ |
| Sistema de webhooks | ✅ |
| Auto-onboarding (brief → contrato → pago → kickoff) | ✅ |
| Generación de propuestas dinámicas | ✅ |
| Script anti-hardcoding | ✅ |
| Pruebas unitarias (96 tests, 94.97% coverage) | ✅ |
| Pruebas de integración (API /chat con mocks Supabase + LLM) | ✅ |
| Pruebas funcionales E2E con Cypress | ✅ |
| Pruebas de carga con k6 (p95 < 3s) | ✅ |
| Pruebas de seguridad (npm audit, anti-hardcode) | ✅ |
| CI/CD con GitHub Actions (4 jobs paralelos) | ✅ |
| Certificados de cursos con rutas dinámicas | ✅ |
| Internacionalización ES / EN / PT en el chatbot | ✅ |
| Re-engagement automático de leads fríos | ✅ |
| Resumen diario automático por email | ✅ |
| Cleanup automático de base de datos | ✅ |
| Backup diario a GitHub | ✅ |
| Health check público (`/api/health`) | ✅ |
| Calculadora de presupuesto con API (`/api/calculator`) | ✅ |

**Tareas manuales pendientes (solo Omar puede hacerlas):**

| Tarea | Descripción |
|-------|-------------|
| ⚠️ 26.5 | Validación final pre-deploy: probar 10 escenarios de chat y calificar 1-10 |
| ⚠️ 27.7 | Verificar que las API keys de todos los proveedores LLM estén activas |
| ⚠️ 31.6 | Validación humana de correcciones de auditoría retrospectiva |

---

## Stack tecnológico

### Frontend
- **Next.js 15.5.18** — App Router, ISR, Server Actions
- **React 19** — Concurrent features
- **TypeScript 5.8** — Strict mode
- **Tailwind CSS 3.4** — Utility-first
- **Framer Motion 12** — Animaciones
- **Lucide React + React Icons** — Iconografía

### Backend / AI
- **Groq** — LLM principal (Llama 3.3 70B, ultra rápido)
- **NVIDIA NIM** — 10 modelos de respaldo
- **OpenRouter** — Acceso multi-modelo
- **Cerebras** — Inferencia rápida
- **Cloudflare AI** — Fallback gratuito
- **Ollama** — Fallback local
- **HuggingFace** — Embeddings para RAG
- **Resend** — Emails transaccionales

### Base de datos
- **Supabase (PostgreSQL + pgvector)** — Conversaciones, leads, mensajes, embeddings RAG

### Pagos
- **PayPal** — Internacional
- **Wompi** — Colombia (tarjetas + Nequi + PSE)
- **Mercado Pago** — LATAM
- **Binance Pay** — Cripto

### Integraciones
- **Telegram Bot API** — Notificaciones + handoff humano bidireccional
- **Cal.com** — Agendado con pre-relleno de datos
- **Notion** — Sincronización de leads

### Testing
- **Jest 29 + ts-jest** — Unitarios e integración
- **Cypress 13** — E2E y funcionales
- **k6** — Carga y estrés
- **GitHub Actions** — CI/CD

---

## Arquitectura del chatbot

```
Visitante → /api/chat → parser → systemPrompt → LLM gateway (failover)
                ↓                                      ↓
           Supabase                           Groq → NVIDIA → OpenRouter
     (conversations + messages)               → Cerebras → Cloudflare
                ↓
        RAG (pgvector) + Telegram notify → Omar
                ↓
    extractLead / extractHandoff / extractCalcom
                ↓
    Respuesta + booking link + opciones de pago
```

**Cadena de failover LLM:** 18 adaptadores en total. Si Groq falla, prueba los 10 modelos de NVIDIA, luego OpenRouter, Cerebras, Cloudflare AI y Ollama local — sin interrupción para el usuario.

---

## Testing — 96 tests pasando

```
Test Suites: 7 passed, 7 total
Tests:       96 passed, 96 total
Coverage:    94.97% lines | 87.3% branches | 100% functions
Threshold:   70% lines ✅ | 70% functions ✅
```

### Cobertura por módulo

| Módulo | Líneas | Funciones |
|--------|--------|-----------|
| `calcom.ts` | 93.54% | 100% |
| `openings.ts` | 100% | 100% |
| `parser.ts` | 89.53% | 100% |
| `payments.ts` | 90.35% | 100% |
| `systemPrompt.ts` | 100% | 100% |

### Suites de test

| Suite | Tests | Descripción |
|-------|-------|-------------|
| `unit/parser.test.ts` | 40 | extractLead, extractHandoff, extractCalcom, cleanReply |
| `unit/payments.test.ts` | 14 | getPaymentOptions — CO/LATAM/internacional |
| `unit/systemPrompt.test.ts` | 13 | buildSystemPrompt — ROL, precios, 3 idiomas |
| `unit/contactExtraction.test.ts` | 13 | EMAIL_RE, PHONE_RE, NAME_RE |
| `unit/calcom.test.ts` | 9 | buildCalcomUrl — params, encoding, URL válida |
| `unit/openings.test.ts` | 7 | OPENINGS variants, getRandomVariant distribución |
| `integration/api-chat.test.ts` | 12 | POST /api/chat con mocks Supabase + LLM |

---

## Instalación y configuración

### Prerrequisitos
- Node.js 20+
- npm
- Cuenta Supabase (free tier)
- Al menos una API key de proveedor LLM (Groq recomendado — gratis)

### 1. Clonar el repositorio

```bash
git clone https://github.com/omarhernandezrey/mi-portafolio-moderno.git
cd mi-portafolio-moderno
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea `.env.local` con las siguientes variables:

```bash
# Base de datos
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LLM — Proveedor principal
GROQ_API_KEY=

# LLM — Respaldos (opcionales pero recomendados)
NVIDIA_API_KEY=
OPENROUTER_API_KEY=
CEREBRAS_API_KEY=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=

# Notificaciones
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Emails
RESEND_API_KEY=

# Pagos
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=

# Agendado
NEXT_PUBLIC_CALCOM_URL=
NEXT_PUBLIC_CALCOM_INTERVIEW_URL=

# Admin
ADMIN_PASSWORD_HASH=
ADMIN_JWT_SECRET=

# Anti-hardcode
NEXT_PUBLIC_SITE_URL=
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Scripts disponibles

### Desarrollo

```bash
npm run dev              # Servidor de desarrollo (Turbopack)
npm run build            # Build de producción
npm run start            # Servidor de producción
npm run lint             # ESLint
```

### Testing

```bash
npm test                 # Tests unitarios e integración
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con reporte de coverage
npm run test:ci          # Tests para CI (sin interactividad)
npm run test:e2e         # Cypress E2E (headless)
npm run test:e2e:open    # Cypress E2E (GUI)
```

### Calidad y seguridad

```bash
npm run check-no-hardcode   # Verifica que no haya claves hardcodeadas
npx tsc --noEmit            # Verifica errores de TypeScript
npm audit                   # Reporte de vulnerabilidades
```

### Evaluación del chatbot

```bash
npm run eval:chatbot     # Evalúa calidad de respuestas del bot
```

---

## Estructura del proyecto

```
src/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── chat/               # Endpoint principal del chatbot
│   │   ├── health/             # Health check público
│   │   ├── calculator/         # Calculadora de presupuesto
│   │   ├── newsletter/         # Suscripción y envío
│   │   ├── leadmagnet/         # Entrega gated de recursos
│   │   ├── onboarding/         # Auto-onboarding (brief/contrato/pago)
│   │   ├── proposal/           # Generación de propuestas
│   │   ├── payment/            # Confirmación de pagos
│   │   ├── tickets/            # Sistema de soporte
│   │   ├── telegram/           # Webhook Telegram
│   │   └── cron/               # Jobs automáticos
│   ├── admin/                  # Dashboard privado
│   ├── blog/                   # Blog MDX
│   ├── calculadora/            # Calculadora de presupuesto (UI)
│   ├── servicios/[s]/[ciudad]/ # 100+ rutas SEO
│   ├── status/                 # Status page público
│   └── ...
├── lib/
│   └── chatbot/
│       ├── parser.ts           # Extracción de leads/handoff/calcom
│       ├── systemPrompt.ts     # Prompt del sistema (ES/EN/PT)
│       ├── payments.ts         # Opciones de pago por región
│       ├── calcom.ts           # URLs de Cal.com con pre-relleno
│       ├── openings.ts         # Variantes A/B/C/D de bienvenida
│       ├── llm.ts              # Orquestador con failover
│       ├── rag.ts              # RAG con pgvector
│       ├── telegram.ts         # Notificaciones y handoff
│       ├── email.ts            # Emails vía Resend
│       └── providers/          # 18 adaptadores LLM
└── config/
    └── env.ts                  # Variables de entorno tipadas

__tests__/
├── unit/                       # 83 tests unitarios
└── integration/                # 12 tests de integración

cypress/
└── e2e/                        # Tests funcionales E2E

k6/
└── load-test.js                # Pruebas de carga y estrés

.github/
└── workflows/
    ├── test.yml                # CI: unit + build + security + e2e
    └── ...                     # 8 workflows adicionales (backup, crons, etc.)
```

---

## Despliegue

### Vercel (producción)

El proyecto está desplegado con CI/CD automático en Vercel:

```bash
# Deploy de producción manual
vercel --prod
```

**Variables de entorno:** configuradas en el dashboard de Vercel para `production`, `preview` y `development`.

**Build:** ~2 minutos. Genera 149 páginas (estáticas + dinámicas).

### CI/CD — GitHub Actions

El pipeline `.github/workflows/test.yml` ejecuta 4 jobs en paralelo con cada push:

| Job | Qué hace |
|-----|---------|
| `unit-integration` | Jest 96 tests + coverage threshold |
| `build` | `next build` — verifica que compila |
| `security` | `npm audit` + `check-no-hardcode` |
| `e2e` | Cypress (solo en push a `main`) |

---

## Operación diaria

### Ver leads en tiempo real

1. **Admin dashboard:** `/admin` → Leads / Conversaciones
2. **Telegram:** notificación automática cuando un visitante deja sus datos
3. **Supabase:** tabla `leads` en https://supabase.com/dashboard/projects

### Personalizar el chatbot

| Archivo | Qué controla |
|---------|-------------|
| `src/lib/chatbot/data/persona.ts` | Voz y estilo del asistente |
| `src/lib/chatbot/data/catalog.ts` | Servicios y precios |
| `src/lib/chatbot/data/objections.ts` | Manejo de objeciones |
| `src/lib/chatbot/systemPrompt.ts` | Prompt del sistema completo |

### Rotación de claves

1. Revocar la clave comprometida en el dashboard del proveedor
2. Generar clave nueva
3. Actualizar `.env.local`
4. Ejecutar `vercel env add NOMBRE_CLAVE production` y `preview` y `development`
5. `git push main` — el deploy toma ~2 min

### Límites free tier ($0/mes)

| Servicio | Límite gratuito | Qué pasa si se agota |
|----------|----------------|----------------------|
| Groq | ~100k tokens/día | Failover a NVIDIA NIM |
| NVIDIA NIM | 1000 créditos/mes | Failover a OpenRouter |
| OpenRouter | $5 crédito inicial | Failover a Cerebras |
| Cerebras | Límite diario | Failover a Cloudflare AI |
| Cloudflare AI | 10k solicitudes/día | Fallback a Ollama local |
| Supabase | 500 MB | Ejecutar cleanup automático |
| Vercel | 100 GB transferencia | No esperado superar |

---

## Guías de operación

1. [**01-OPERACION_DIARIA.md**](./01-OPERACION_DIARIA.md) — Hábitos para convertir leads
2. [**02-MARKETING_DISTRIBUCION.md**](./02-MARKETING_DISTRIBUCION.md) — Dónde publicar para atraer tráfico
3. [**03-ESTRATEGIA_INGRESOS.md**](./03-ESTRATEGIA_INGRESOS.md) — Nicho, pricing USD y plan de crecimiento
4. [**04-PLAN_B_OPENSOURCE.md**](./04-PLAN_B_OPENSOURCE.md) — Alternativas gratuitas de emergencia

---

## Seguridad

- Rate limiting por IP en `/api/chat` (middleware Next.js)
- Variables de entorno nunca en el código (script `check-no-hardcode` en CI)
- `npm audit` en cada deploy — 0 vulnerabilidades HIGH/CRITICAL
- GDPR: endpoint `/api/privacy/delete` para derecho al olvido
- Admin protegido con JWT + hash de contraseña

---

## Autor

**Omar Hernández Rey** — Ingeniero de Software, Colombia

- GitHub: [@omarhernandezrey](https://github.com/omarhernandezrey)
- Portafolio: https://mi-portafolio-moderno.vercel.app
