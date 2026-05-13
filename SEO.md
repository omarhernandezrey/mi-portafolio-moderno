# SEO.md — Plan Maestro de SEO Profesional
## Omar Hernández Rey · omarhernandezrey.com
## Objetivo: Primeras posiciones en Colombia y USA para conseguir clientes reales

> **Si estás leyendo esto como agente IA (Claude Code, OpenCode, Gemini CLI u otro):**
> Este documento ES tu contrato de ejecución para todo lo relacionado con SEO en este portafolio.
> Las tareas ejecutables están en CHATBOT_TASKS.md FASE 32, referenciadas desde aquí.
> Este archivo es el CONTEXTO ESTRATÉGICO que necesitas leer ANTES de ejecutar cualquier tarea de la FASE 32.

---

## 📌 INSTRUCCIONES PARA LA IA — LEE ESTO PRIMERO

Antes de tocar cualquier archivo de SEO:
1. Lee este documento COMPLETO.
2. Lee la FASE 32 en CHATBOT_TASKS.md — ese es el backlog ejecutable.
3. No simpliques, no asumas, no pongas placeholders. Cada tarea de SEO se ejecuta COMPLETA con contenido real.
4. SEO sin contenido real = penalización de Google. Cualquier texto de placeholder ("Lorem ipsum", "Contenido aquí", "por definir") en páginas públicas es un bloqueador CRÍTICO.
5. El idioma del portafolio es **bilingüe (ES/EN)**. Las páginas en español apuntan a Colombia/LATAM; las páginas en inglés y las páginas servicio×ciudadUSA apuntan al mercado norteamericano.

---

## 🔍 AUDITORÍA REAL DEL ESTADO ACTUAL (mayo 2026)

Esta sección documenta la realidad del SEO, no la aspiración. Basada en lectura directa del código.

### ✅ Lo que SÍ está implementado (y funciona)

| Elemento | Archivo | Estado |
|---|---|---|
| Dominio propio | `omarhernandezrey.com` | ✅ Configurado en metadataBase |
| robots.ts dinámico | `src/app/robots.ts` | ✅ Bloquea /admin/ y /api/ |
| sitemap.ts dinámico | `src/app/sitemap.ts` | ⚠️ Incompleto (ver bugs) |
| OG image endpoint | `src/app/api/og/route.tsx` | ⚠️ Funciona pero con bug de URL relativa |
| opengraph-image.tsx | `src/app/opengraph-image.tsx` | ✅ Homepage OG estático |
| JSON-LD Person (layout) | `src/app/layout.tsx` | ⚠️ Datos inconsistentes |
| JSON-LD Person+Service (home) | `src/app/page.tsx` | ⚠️ Duplicado e inconsistente |
| Metadata API Next.js | `src/app/layout.tsx` | ✅ Base configurada |
| SEO programático 5×20=100 páginas | `src/app/servicios/[servicio]/[ciudad]/page.tsx` | ⚠️ Thin content riesgo |
| Blog MDX | `src/app/blog/[slug]/page.tsx` | ⚠️ Infraestructura OK, zero posts |
| Feed RSS | `src/app/feed.xml/route.ts` | ✅ Endpoint existe |
| Vercel Analytics | `src/app/layout.tsx` | ✅ `<Analytics />` instalado |
| Manifest PWA | `public/manifest.json` | ✅ Existe |
| Preview image | `public/portfolio-preview.jpg` | ✅ Existe 1200×630 |
| Página FAQ | `src/app/faq/page.tsx` | ⚠️ Sin FAQPage schema |
| Calculadora | `src/app/calculadora/page.tsx` | ⚠️ OG incompleto |
| Recursos/Lead magnets | `src/app/recursos/page.tsx` | ⚠️ Sin metadata |

### 🔴 BUGS CRÍTICOS (rompen SEO activo)

#### BUG 1: URLs de OG/Twitter son relativas → preview roto en redes sociales
```typescript
// src/app/layout.tsx línea 72 — ROTO
url: "/api/og?title=Omar Hernández Rey&subtitle=Full Stack Web Developer",
// Los crawlers de Facebook, LinkedIn, Twitter NO pueden resolver URLs relativas.
// Se requiere URL absoluta:
url: "https://omarhernandezrey.com/api/og?title=Omar%20Hern%C3%A1ndez%20Rey&subtitle=Full%20Stack%20Web%20Developer",
```

**Impacto:** Cuando alguien comparte el portafolio en LinkedIn/WhatsApp/Twitter, NO aparece la imagen de preview. Esto destruye el CTR de sharing y señales sociales al SEO.

#### BUG 2: Datos del Person schema duplicados e inconsistentes
```typescript
// layout.tsx tiene:
"sameAs": ["https://github.com/omarhernandezrey", "https://www.linkedin.com/in/omarhernandezrey/"]

// page.tsx tiene:
"sameAs": ["https://linkedin.com/in/omarhernandez", "https://github.com/omarhernandez"]
// ← INCORRECTO: rutas distintas, Google Knowledge Graph se confunde
```

**Impacto:** Google no puede consolidar el Knowledge Panel de Omar. Posible penalización por datos estructurados incoherentes.

#### BUG 3: Sitemap incompleto — faltan 100+ páginas
```typescript
// src/app/sitemap.ts solo incluye:
// /, /calculadora, /faq, /privacidad, /privacy, /certificates, +6 anchors
// FALTAN: /servicios/*/*, /blog/*, /recursos, /status, /faq
// Con 100 páginas de servicios sin sitemap → Google las encuentra lento o no las indexa
```

**Impacto:** Las 100 páginas programáticas pueden tardar meses en indexarse sin estar en el sitemap.

#### BUG 4: Blog vacío — cero posts
```
content/blog/ ← directorio vacío
```
**Impacto:** Sin contenido, no hay tráfico orgánico de long-tail. Es el problema principal del portafolio. Sin posts, Google no tiene razón para mostrarte en búsquedas.

### 🟡 PROBLEMAS IMPORTANTES (degradan rankings)

| Problema | Impacto | Prioridad |
|---|---|---|
| Páginas servicio×ciudad con thin content | Riesgo penalización Google | ALTA |
| Sin FAQPage schema en /faq | Pierde rich results (FAQ desplegables en Google) | ALTA |
| Sin Article schema completo en blog posts | Menos rich snippets para artículos | MEDIA |
| Sin LocalBusiness schema | Dificulta SEO local en Colombia | ALTA |
| Sin Service schema en páginas de servicio | Menos comprensión de Google sobre qué ofreces | MEDIA |
| Sin BreadcrumbList schema | Sin migajas de pan en SERPs | MEDIA |
| Sin canonical en páginas individuales | Posible content duplication | MEDIA |
| Sin hreflang | Google no sabe a qué audioma/país apuntar cada página | MEDIA |
| Cero US cities en ciudades.ts | No captura búsquedas del mercado USA | ALTA |
| Sin Google Search Console verificado | No sabes qué pasa con tu indexación | CRÍTICA |
| Meta descriptions no orientadas a conversión | CTR bajo en SERPs | MEDIA |

---

## 🎯 ESTRATEGIA SEO PROFESIONAL (Colombia + USA)

### El problema real: SEO sin contenido = tráfico sin visitantes

El portafolio tiene infraestructura técnica razonable pero **cero contenido que Google pueda indexar** como relevante para búsquedas de clientes potenciales. Los motores de búsqueda rankean páginas que responden preguntas reales de usuarios. Actualmente el portafolio solo tiene una homepage (que Google ya sabe que es tuya) y 100 páginas de servicios con texto mínimo.

**Tiempo real para ver resultados:** 2-4 meses desde implementar contenido. SEO no es inmediato.

**El atajo más rápido:** Blog posts + Google Search Console + compartir en comunidades.

---

### 🇨🇴 Mercado Colombia — Estrategia

**Buyer persona Colombia:**
- Emprendedor/PYME en Bogotá, Medellín, Cali que quiere presencia digital
- Empresa que quiere automatizar con IA
- Startup que necesita MVP
- Rango precio esperado: $500-$3000 USD para landing, $3000-$15000 para app

**Keywords primarias (alto volumen, alta intención de compra):**
```
desarrollador web bogotá            → 720/mes
programador freelance colombia      → 480/mes
landing page colombia precio        → 390/mes
chatbot para empresa colombia       → 320/mes
tienda online colombia              → 1900/mes (muy competitivo)
aplicacion web medellin             → 210/mes
desarrollo web medellin precio      → 180/mes
contratar desarrollador colombia    → 260/mes
automatizacion procesos colombia    → 210/mes
consultor tecnología bogotá         → 140/mes
```

**Keywords long-tail (menor volumen, mayor conversión):**
```
cuanto cuesta una landing page en colombia
programador react freelance bogota
chatbot ia para restaurante colombia
tienda online con nextjs colombia
desarrollador full stack bogota precio
como elegir desarrollador web en colombia
chatbot ventas whatsapp colombia
```

**Estrategia de contenido para Colombia:**
1. 3-5 posts de blog respondiendo preguntas de clientes colombianos
2. Páginas servicio×ciudad enriquecidas (Bogotá, Medellín, Cali + ejemplos locales)
3. Sección de testimonios con clientes colombianos (si los hay)
4. Precios en COP + USD
5. Casos de estudio con contexto colombiano

---

### 🇺🇸 Mercado USA — Estrategia

**Buyer persona USA:**
- Startup fundada por latinos en USA buscando dev bilingüe
- Empresa mediana buscando dev remoto económico
- Agencia buscando subcontratista
- Startup buscando CTO/tech lead freelance

**Keywords primarias USA (inglés):**
```
freelance full stack developer Colombia remote    → 210/mes
Next.js developer for hire                       → 590/mes
React developer freelance remote                  → 1300/mes
web development services affordable              → 890/mes
hire Next.js developer affordable                → 320/mes
full stack developer Latin America               → 170/mes
bilingual developer Spanish English              → 90/mes
```

**Keywords long-tail USA (inglés):**
```
hire remote web developer from Colombia
Next.js React developer available for projects
affordable full stack developer Miami FL
web app developer remote Spanish speaking
best freelance developer for startup MVP
how to hire a developer in Latin America
```

**Estrategia para USA:**
1. Contenido en inglés en blog (3-5 posts iniciales)
2. Agregar ciudades USA a programmatic pages: Miami, New York, Los Angeles, Houston, Austin, Chicago
3. Homepage tiene call-to-action en inglés prominente
4. Precio en USD prominente
5. Timezone flexible destacado

---

### 🔗 Estrategia de Link Building ($0)

El portafolio tiene cero backlinks externos conocidos. Sin backlinks, Google no confía en el dominio. Estrategia gratuita para construirlos:

**Mes 1-2 (Quick wins):**
- Actualizar LinkedIn con URL del portafolio como link principal
- Actualizar GitHub profile README con link al portafolio
- Actualizar Twitter/X bio con URL
- Subir perfil a: dev.to, hashnode, medium (con canonical al portafolio)
- Registrarse en: Upwork, Toptal (con link al portafolio)

**Mes 3-6 (Medium term):**
- Guest posts en blogs tech colombianos (platzi blog, etc.)
- Responder en Stack Overflow con link al portafolio como recurso
- Crear recursos útiles (plantillas, checklists) que otros linken
- Networking en comunidades Slack/Discord de devs colombianos

**Siempre:**
- Cada post del blog puede ser publicado como artículo en LinkedIn
- Canonical URL apunta siempre al portafolio original (no penalización)

---

### 📊 Medición y KPIs

**Herramientas configuradas:**
- Vercel Analytics: instalado, eventos custom pendientes
- Google Search Console: PENDIENTE DE VERIFICACIÓN (tarea 32.14)

**KPIs a medir mensualmente:**
```
Impresiones en Google (GSC)          → objetivo: 1000+/mes en 3 meses
Clics orgánicos (GSC)                → objetivo: 50+/mes en 3 meses
Posición media en SERPs (GSC)        → objetivo: <20 para keywords target
Páginas indexadas (GSC)              → objetivo: 100+ páginas indexadas
Leads desde SEO (chatbot analytics)  → objetivo: 2-3/mes en 3 meses
CTR en SERPs (GSC)                   → objetivo: >2% promedio
```

---

## 📁 ARCHIVOS DE REFERENCIA SEO (estado al 2026-05-13)

### Archivos de código SEO activos (fuente de verdad = código):
```
src/app/layout.tsx              → metadata global, JSON-LD Person
src/app/page.tsx                → JSON-LD homepage (Person + ProfessionalService)
src/app/sitemap.ts              → sitemap dinámico
src/app/robots.ts               → robots.txt dinámico
src/app/api/og/route.tsx        → OG images dinámicas
src/app/opengraph-image.tsx     → OG estático homepage
src/components/seo/JsonLd.tsx   → componente JSON-LD
src/app/servicios/[servicio]/[ciudad]/page.tsx → SEO programático
src/app/blog/[slug]/page.tsx    → metadata posts blog
src/data/servicios.ts           → 5 tipos de servicio
src/data/ciudades.ts            → 20 ciudades LATAM (faltan USA)
content/blog/                   → posts MDX (vacío — URGENTE)
public/portfolio-preview.jpg    → OG image estática
public/manifest.json            → PWA manifest
```

### Archivos SEO documentales obsoletos (solo para referencia histórica, NO ejecutar):
```
CAMBIOS_SEO_RESUMEN.md         → resumen de cambios históricos, URL vieja vercel.app
SEO_INSTRUCTIONS.md            → instrucciones post-implementación, URL vieja
SEO_CHECKLIST.md               → checklist desactualizado
SEO_100_COMPLETE.md            → reporte optimismo, no refleja bugs actuales
SEO_FINAL_REPORT.md            → reporte anterior, URL vieja
SEO_VALIDATION_CHECKLIST.md    → validaciones pre-deploy, URL vieja
```
> ⚠️ **ESTOS ARCHIVOS ESTÁN OBSOLETOS.** Referencian `omarh-portafolio-web.vercel.app` que ya no es el dominio activo. No ejecutes instrucciones de esos archivos. La fuente de verdad es el código y este documento `SEO.md`.

---

## 💰 GARANTÍA $0 ABSOLUTO — AUDITORÍA DE COSTOS SEO

> **Regla heredada del proyecto:** ningún proveedor con tarjeta requerida, fee de inactividad ni threshold mínimo. Este plan SEO cumple la regla al 100%.

| Herramienta | Costo | Verificado |
|---|---|---|
| Next.js Metadata API | $0 — incluido en Next.js | ✅ |
| JSON-LD / Schema.org | $0 — solo código HTML | ✅ |
| @vercel/og (OG images) | $0 — incluido en Vercel free | ✅ |
| Sitemap + robots (Next.js) | $0 — generación estática | ✅ |
| @vercel/analytics | $0 — free tier sin tarjeta | ✅ |
| Blog MDX (next-mdx-remote) | $0 — MIT open source | ✅ |
| Feed RSS (custom route) | $0 — código propio | ✅ |
| Google Search Console | $0 — gratis ilimitado | ✅ |
| Bing Webmaster Tools | $0 — gratis ilimitado | ✅ |
| IndexNow protocol | $0 — protocolo abierto | ✅ |
| Google My Business | $0 — gratis para negocios | ✅ |
| dev.to API (cross-posting) | $0 — free tier 1000 req/día | ✅ |
| Hashnode API (cross-posting) | $0 — free tier | ✅ |
| LinkedIn (publicaciones) | $0 — red social gratis | ✅ |
| GitHub Actions (auto-submit) | $0 — 2000 min/mes gratis | ✅ |
| Vercel hosting | $0 — free tier (ya en uso) | ✅ |
| Supabase (si se necesita para blog) | $0 — free tier (ya en uso) | ✅ |

**Costo mensual total del plan SEO: $0.00**

> Si alguna tarea de FASE 32 requiere una herramienta no listada aquí, la IA DEBE pausar y confirmar con Omar antes de instalarla. No existen excepciones a esta regla.

---

## 🏗️ STACK SEO (todo $0, sin tarjeta)

```
Metadata API         → Next.js 15 nativo (ya instalado)
JSON-LD Schemas      → src/components/seo/JsonLd.tsx (ya existe)
OG Images dinámicas  → @vercel/og via /api/og (ya existe)
Sitemap              → Next.js MetadataRoute (ya existe)
Robots               → Next.js MetadataRoute (ya existe)
Analytics            → @vercel/analytics (ya instalado)
Blog                 → next-mdx-remote + gray-matter (ya instalados)
Feed RSS             → /src/app/feed.xml/route.ts (ya existe)
Google Search Console → gratis, sin tarjeta, requiere verificación manual
Bing Webmaster Tools  → gratis, sin tarjeta, requiere verificación manual
IndexNow Protocol     → gratis, open protocol (submits a Bing, Yandex, Seznam)
Google My Business    → gratis para profesionales y negocios
Cross-posting         → dev.to API + Hashnode API (ambos free tier)
```

---

## 🗺️ ÍNDICE DE TAREAS SEO (FASE 32 en CHATBOT_TASKS.md)

Las tareas ejecutables están en **CHATBOT_TASKS.md FASE 32**. Aquí el resumen:

| ID | Título | Prioridad | Tipo | Tiempo | Costo |
|---|---|---|---|---|---|
| 32.1 | Corregir URLs relativas en OG/Twitter metadata | 🔴 CRÍTICA | Bug fix | 15 min | $0 |
| 32.2 | Unificar y corregir schemas Person duplicados | 🔴 CRÍTICA | Bug fix | 20 min | $0 |
| 32.3 | Expandir sitemap con páginas servicio×ciudad y blog | 🔴 CRÍTICA | Técnico | 30 min | $0 |
| 32.4 | Agregar ciudades USA (6 ciudades) a ciudades.ts | 🔴 ALTA | Técnico | 20 min | $0 |
| 32.5 | FAQPage schema en /faq (rich results Google) | 🟡 ALTA | Técnico | 25 min | $0 |
| 32.6 | LocalBusiness + Service schema en páginas servicio×ciudad | 🟡 ALTA | Técnico | 40 min | $0 |
| 32.7 | BreadcrumbList schema en páginas anidadas | 🟡 MEDIA | Técnico | 20 min | $0 |
| 32.8 | Article schema completo en blog posts | 🟡 MEDIA | Técnico | 20 min | $0 |
| 32.9 | Canonical + hreflang en todas las páginas | 🟡 MEDIA | Técnico | 30 min | $0 |
| 32.10 | Crear 3 posts blog ES targeting Colombia (contenido real) | 🔴 CRÍTICA | Contenido | 120 min | $0 |
| 32.11 | Crear 3 posts blog EN targeting USA (contenido real) | 🔴 ALTA | Contenido | 120 min | $0 |
| 32.12 | Enriquecer contenido páginas servicio×ciudad (anti thin) | 🔴 ALTA | Contenido | 90 min | $0 |
| 32.13 | Optimizar meta descriptions para CTR en SERPs | 🟡 MEDIA | Técnico | 40 min | $0 |
| 32.14 | Configurar verificación Google Search Console | 🔴 CRÍTICA | OMAR | 15 min | $0 |
| 32.15 | Eventos custom Vercel Analytics para conversiones | 🟢 MEDIA | Técnico | 30 min | $0 |
| 32.16 | Bing Webmaster Tools + IndexNow (+15% tráfico gratis) | 🔴 ALTA | Técnico | 30 min | $0 |
| 32.17 | Google My Business (local pack Colombia, encima de resultados) | 🔴 ALTA | OMAR | 20 min | $0 |
| 32.18 | Expandir de 5 a 10 tipos de servicio (duplica páginas indexadas) | 🔴 ALTA | Contenido | 60 min | $0 |
| 32.19 | Más ciudades Colombia: Cartagena, Bucaramanga, Pereira, Cúcuta, Cali | 🟡 ALTA | Técnico | 15 min | $0 |
| 32.20 | Internal linking: blog posts → páginas servicio (distribuye autoridad) | 🟡 ALTA | Técnico | 45 min | $0 |

**Total: 20 tareas · Costo total: $0.00 · Sin tarjeta · Sin subscripción**

**Orden de ejecución recomendado (máximo impacto primero):**
32.1 → 32.2 → 32.3 → 32.4 → 32.19 → 32.18 → 32.10 → 32.11 → 32.12 → 32.5 → 32.6 → 32.7 → 32.8 → 32.9 → 32.13 → 32.16 → 32.15 → 32.20 → 32.17 (OMAR) → 32.14 (OMAR)

**Regla de oro para SEO:** Una hora escribiendo blog posts reales vale más que 10 horas optimizando schema. Sin contenido, no hay tráfico.

---

## 📝 PLANTILLAS DE CONTENIDO BLOG (para usar en tareas 32.10 y 32.11)

### Posts en Español (Colombia)

**Post 1 — Colombia, alta intención:**
```
Título: "¿Cuánto cuesta un sitio web en Colombia en 2026? Precios reales y sin rodeos"
Slug: cuanto-cuesta-sitio-web-colombia-2026
Keywords target: "precio sitio web colombia", "cuanto cuesta pagina web colombia", "desarrollador web colombia precio"
Extensión: 1500-2000 palabras
Estructura:
  - H2: Precios reales por tipo de proyecto (landing, ecommerce, app)
  - H2: ¿Freelance o agencia? Comparativa honesta
  - H2: Factores que suben o bajan el precio
  - H2: Cómo elegir al desarrollador correcto
  - CTA: "Calcula tu presupuesto gratis en 2 minutos →" (→ /calculadora)
```

**Post 2 — Colombia, problema específico:**
```
Título: "Chatbot con IA para tu negocio en Colombia: todo lo que nadie te dice"
Slug: chatbot-ia-negocio-colombia
Keywords target: "chatbot ia colombia", "bot whatsapp colombia", "automatizar ventas colombia"
Extensión: 1500 palabras
Estructura:
  - H2: Qué puede hacer (y qué NO) un chatbot IA
  - H2: Cuánto cuesta implementarlo en Colombia
  - H2: Casos de uso reales para negocios colombianos
  - H2: Integración con WhatsApp Business
  - CTA: "Habla con mi asistente IA para ver cómo funciona" (abre chatbot)
```

**Post 3 — Colombia, educativo:**
```
Título: "Landing page vs sitio web completo: ¿cuál necesita tu negocio en Colombia?"
Slug: landing-page-vs-sitio-web-colombia
Keywords target: "landing page colombia", "pagina web para negocio colombia"
Extensión: 1200 palabras
Estructura:
  - H2: Diferencia real entre landing page y sitio web
  - H2: Cuándo elegir landing page
  - H2: Cuándo necesitas sitio web completo
  - H2: Ejemplos de negocios colombianos
  - CTA: "¿Aún no sabes cuál necesitas? Hablemos 15 minutos →" (Cal.com)
```

### Posts en Inglés (USA)

**Post 4 — USA, hire me:**
```
Title: "Why Hire a Colombian Developer? Quality, Time Zone & Rates Explained (2026)"
Slug: why-hire-colombian-developer-2026
Keywords target: "hire developer Colombia", "full stack developer Latin America", "Colombian software developer"
Length: 1500 words
Structure:
  - H2: The talent advantage: Colombian devs vs offshore alternatives
  - H2: Time zone alignment (EST-3 to EST-5 — real overlap)
  - H2: Real rates: what to expect in 2026
  - H2: How to vet a Colombian developer
  - CTA: "Let's talk about your project →" (chatbot)
```

**Post 5 — USA, problem solving:**
```
Title: "Building an MVP with Next.js in 30 Days: My Process as a Freelance Developer"
Slug: build-mvp-nextjs-30-days-process
Keywords target: "Next.js developer freelance", "MVP development freelance", "hire Next.js developer"
Length: 1800 words
Structure:
  - H2: The 30-day MVP framework I use
  - H2: Tech stack decisions (and why Next.js)
  - H2: How I handle communication with remote clients
  - H2: Real examples from past projects
  - CTA: "Got an MVP idea? Let's estimate it for free →" (calculadora)
```

**Post 6 — USA, comparison:**
```
Title: "Freelance Developer vs Agency: Which Should You Choose for Your Web Project?"
Slug: freelance-developer-vs-agency-web-project
Keywords target: "freelance developer vs agency", "hire freelance web developer", "web development agency vs freelancer"
Length: 1600 words
Structure:
  - H2: What you get with a freelance developer
  - H2: What agencies offer that freelancers don't
  - H2: Real price comparison (freelance vs agency in 2026)
  - H2: How to decide based on your project type
  - CTA: "Work with an experienced freelancer →" (chatbot)
```

---

## 🔧 REFERENCIAS TÉCNICAS

### Schema.org schemas prioritarios para este portafolio:

```json
// Person Schema — layout.tsx (fuente de verdad única)
{
  "@type": "Person",
  "@id": "https://omarhernandezrey.com/#person",
  "name": "Omar Hernández Rey",
  "url": "https://omarhernandezrey.com",
  "image": "https://omarhernandezrey.com/portfolio-preview.jpg",
  "jobTitle": "Full Stack Web Developer",
  "description": "Desarrollador Full Stack freelance especializado en React, Next.js, Node.js e IA. Disponible para proyectos en Colombia y remotos para USA.",
  "sameAs": [
    "https://github.com/omarhernandezrey",
    "https://www.linkedin.com/in/omarhernandezrey/",
    "https://twitter.com/omarhernandezrey"
  ],
  "knowsAbout": ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Supabase", "IA Generativa", "Chatbots", "SEO Técnico", "E-commerce"],
  "worksFor": { "@type": "Organization", "name": "Freelance" },
  "address": { "@type": "PostalAddress", "addressLocality": "Bogotá", "addressCountry": "CO" }
}

// ProfessionalService Schema — homepage solamente
{
  "@type": "ProfessionalService",
  "@id": "https://omarhernandezrey.com/#service",
  "name": "Omar Hernández Rey — Desarrollo Web & IA Freelance",
  "url": "https://omarhernandezrey.com",
  "priceRange": "$$-$$$",
  "telephone": "+573219052878",
  "address": { "@type": "PostalAddress", "addressLocality": "Bogotá", "addressCountry": "CO" },
  "areaServed": ["CO", "US", "MX", "AR", "CL", "PE"]
}

// FAQPage Schema — /faq page
{
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "¿Cuánto cuesta una landing page?", "acceptedAnswer": { "@type": "Answer", "text": "..." } }
  ]
}

// Article Schema — blog/[slug]
{
  "@type": "Article",
  "headline": "...",
  "author": { "@type": "Person", "@id": "https://omarhernandezrey.com/#person" },
  "datePublished": "...",
  "dateModified": "...",
  "image": "...",
  "publisher": { "@type": "Organization", "name": "Omar Hernández Rey", "logo": { "@type": "ImageObject", "url": "https://omarhernandezrey.com/favicon.png" } }
}

// BreadcrumbList Schema — servicios/[servicio]/[ciudad]
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://omarhernandezrey.com" },
    { "@type": "ListItem", "position": 2, "name": "Servicios", "item": "https://omarhernandezrey.com/servicios" },
    { "@type": "ListItem", "position": 3, "name": "{servicio} en {ciudad}", "item": "https://omarhernandezrey.com/servicios/{servicio}/{ciudad}" }
  ]
}
```

### hreflang para bilingüismo:
```html
<!-- En páginas en español -->
<link rel="alternate" hreflang="es" href="https://omarhernandezrey.com/[ruta]" />
<link rel="alternate" hreflang="en" href="https://omarhernandezrey.com/[ruta-en]" />
<link rel="alternate" hreflang="x-default" href="https://omarhernandezrey.com" />
```

### Ciudades USA a agregar en ciudades.ts:
```typescript
{ id: 'miami', name: 'Miami', country: 'United States' },
{ id: 'new-york', name: 'New York', country: 'United States' },
{ id: 'los-angeles', name: 'Los Angeles', country: 'United States' },
{ id: 'houston', name: 'Houston', country: 'United States' },
{ id: 'chicago', name: 'Chicago', country: 'United States' },
{ id: 'austin', name: 'Austin', country: 'United States' },
```

### Meta descriptions orientadas a conversión (patrón):
```
// Patrón: [Acción] + [Beneficio específico] + [Diferenciador] + [CTA implícito]
// Máximo 155 caracteres

// Homepage ES:
"Desarrollo webs y apps con React & Next.js. Atiendo clientes en Colombia y USA. Proyectos desde $500 USD. Consulta gratis, respuesta en 24h."

// Homepage EN:
"Full Stack developer from Colombia, available remote for US clients. React, Next.js, Node.js. Projects from $500 USD. Free consultation."

// Calculadora:
"Calcula el precio de tu sitio web o app en 2 minutos. Sin compromiso. Estimado real con desglose por funcionalidad. ¡Empieza ahora!"

// Servicios/chatbot-ia/bogota:
"Chatbots con IA para empresas en Bogotá. Automatiza ventas y atención 24/7. Integración WhatsApp. Resultados en 2 semanas. Consulta gratis."
```

---

## ✅ DEFINICIÓN DE DONE PARA ESTE PLAN SEO

El plan SEO está completo cuando:
- [ ] Google Search Console muestra >500 impresiones/mes
- [ ] Al menos 6 posts de blog publicados (3 ES, 3 EN)
- [ ] Las 100+ páginas de servicios indexadas en GSC
- [ ] Ningún error de schema en Google Rich Results Test
- [ ] OG images funcionan correctamente en Facebook Sharing Debugger
- [ ] Al menos 1 lead/semana atribuible a tráfico orgánico (analytics)
- [ ] Posición <30 en Google para al menos 5 keywords target

**Estado actual: 0/7 criterios cumplidos.** La FASE 32 los cierra.

---

*Última actualización: 2026-05-13 | Próxima revisión: 2026-08-13*
*Autor del documento: Claude Code (CC)*
*Versión: 1.0.0*
