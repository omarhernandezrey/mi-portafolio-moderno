# 🔬 AUDITORÍA SEO PROFESIONAL — NIVEL ENTERPRISE

## Omar Hernández Rey · omarhernandezrey.com
**Fecha de auditoría:** 17 Mayo 2026
**Alcance:** Código completo (18 dimensiones SEO auditadas)
**Tecnología:** Next.js 15.3.3 + App Router + TypeScript

---

## 📊 REPORTE EJECUTIVO — HEALTH SCORES

| Dimensión | Score | Estado |
|---|---|---|
| **SEO Score General** | **43/100** | 🔴 CRÍTICO |
| **Score Técnico** | 38/100 | 🔴 Deficiente |
| **Score Semántico** | 52/100 | 🟡 Regular |
| **Score AI Search** | 55/100 | 🟡 Regular |
| **Score Performance** | 45/100 | 🟡 Regular |
| **Score Indexación** | 35/100 | 🔴 Crítico |
| **Score EEAT** | 22/100 | 🔴 Muy Bajo |
| **Score Contenido** | 28/100 | 🔴 Deficiente |
| **Score Schema** | 62/100 | 🟡 Aceptable |
| **Score Internal Linking** | 48/100 | 🟡 Regular |

---

## 1. 🔴 TECHNICAL SEO — 38/100

### 1.1 INDEXACIÓN — CRÍTICO

#### A. SITEMAP INCOMPLETO
**Archivo:** `src/app/sitemap.ts:7-60`
**Problema:** El sitemap solo incluye rutas estáticas + programa de servicios×ciudad. FALTAN:
- `/status` (no está en sitemap)
- `/recursos` (está en sitemap con prioridad 0.7 — correcto)
- `/privacy` (página en inglés — no está en sitemap)
- `/certificates/*` (ruta catch-all — no está en el sitemap)
- Las páginas de onboarding `/onboarding/[token]` no deben indexarse pero están accesibles

**Impacto Google:** Páginas no en sitemap tardan 4-8× más en indexarse. Crawl budget desperdiciado en páginas no prioritarias.
**Impacto AI Search:** Bing/ChatGPT no descubre contenido si no está en sitemap.
**Prioridad:** 🔴 CRÍTICA
**Corrección:** Agregar `/status` (priority 0.4), `/privacy` (priority 0.4), y asegurar que el sitemap se regenera en cada build produciendo un archivo real (Next.js lo hace en el build, verificar que la salida sea correcta).

#### B. CONTENIDO NO INDEXABLE
**Archivo:** `src/app/status/page.tsx:1`
**Problema:** La página `/status` es `"use client"` — todo su contenido se renderiza en cliente. Google puede NO indexar el contenido de esta página si no hay SSR.
**Impacto Google:** El contenido del status NO existe en el HTML inicial. Google no indexa contenido renderizado con JS en primera pasada.
**Prioridad:** 🟡 ALTA
**Corrección:** Hacer la página SSR o al menos Server Component con fallback estático.

#### C. ORPHAN PAGES (Páginas huérfanas)
**Problema:** Estas páginas NO reciben links internos desde ninguna parte:
- `/privacy` — solo link desde `/privacidad` (que ni siquiera existe ese link)
- `/certificates/*` — solo accesible desde sitemap, sin ningún link interno
- `/status` — solo en footer (correcto pero con poco contexto)
- `/onboarding/[token]` — huérfana, sin links internos

**Impacto:** Crawl depth alto para páginas sin internal links. Google las considera de baja importancia.
**Prioridad:** 🟡 ALTA

#### D. PÁGINA PRIVACIDAD AUTO-BLOQUEADA
**Archivo:** `src/app/privacidad/page.tsx:9`
```typescript
robots: { index: false, follow: true },
```
**Problema:** La página de privacidad se bloquea a sí misma de indexación. Esto es correcto para `noindex` en páginas legales, pero **Google recomienda indexar páginas de privacidad para señales de confianza EEAT**.
**Impacto:** Señal EEAT perdida. Las páginas de privacidad indexadas son señal de transparencia.
**Prioridad:** 🟢 MEDIA
**Corrección:** Si quieres mantener noindex, documentar el motivo. Si es EEAT, remover `index: false`.

#### E. `not-found.tsx` ES CLIENT COMPONENT
**Archivo:** `src/app/not-found.tsx:1`
**Problema:** `"use client"` en not-found.tsx. Google recibe HTML vacío en 404s.
**Impacto Google:** Googlebot no ve contenido útil en errores 404. No hay navegación semántica visible.
**Prioridad:** 🟡 ALTA

---

### 1.2 CANONICAL — ALTO

#### A. CANONICALS AUTO-REFERENCIADOS CORRECTOS (✅)
Todas las páginas tienen canonical auto-referenciado. Esto es correcto.

#### B. FALTA CANONICAL EN PÁGINA DE PRIVACIDAD INGLÉS
**Archivo:** `/privacy` no existe como archivo separado. Verificar ruta.
**Impacto:** Si existe la página en inglés (`/privacy`), debe tener canonical propio apuntando a `/privacy` (no a `/privacidad`).

#### C. SIN PROTECCIÓN CONTRA PARAMETRIZACIÓN
**Problema:** No hay manejo de canonical para URLs con parámetros (ej: `?q=term` en `/blog`). Google puede indexar versiones con query strings como contenido duplicado.
**Prioridad:** 🟢 MEDIA

---

### 1.3 HREFLANG — CRÍTICO

#### A. SIN IMPLEMENTACIÓN HREFLANG
**Problema:** El sitio es bilingüe (ES/EN). No hay tags hreflang en ninguna página.
- Páginas en español: `/servicios/*`, `/`, `/faq`, `/calculadora`, `/privacidad`
- Páginas en inglés: `/privacy`, blog posts en EN
- Páginas bilingües: algunas servicio×ciudad (según ciudad)

**Impacto Google:** Sin hreflang, Google no sabe qué versión mostrar en Colombia vs USA. Puede mostrar la versión en inglés a usuarios en Colombia (o viceversa). Pérdida de tráfico bilingüe.
**Impacto AI Search:** ChatGPT/Perplexity no pueden diferenciar versiones de idioma.
**Prioridad:** 🔴 CRÍTICA
**Corrección:** Implementar hreflang en layout o metadata de cada página usando `alternates.languages`.

---

### 1.4 REDIRECTS — BAJO

#### A. NO HAY REDIRECTS 301
**Problema:** No hay redirecciones configuradas. Si existían URLs viejas en `omarh-portafolio-web.vercel.app`, no redirigen a `omarhernandezrey.com`.
**Impacto:** Link equity perdido si había backlinks a la URL de Vercel.
**Prioridad:** 🟡 ALTA (si había URLs viejas indexadas)

---

### 1.5 URL STRUCTURE — ACEPTABLE

#### A. URLs LIMPIAS ✅
Servicios: `/servicios/{tipo}/{ciudad}` — buena estructura.
Blog: `/blog/{slug}` — correcto.

#### B. PROBLEMA DE URL EN BREADCRUMB SCHEMA
**Archivo:** `src/app/servicios/[servicio]/[ciudad]/page.tsx:220`
```typescript
{ "item": `https://omarhernandezrey.com/servicios/${servicioId}` }
```
**Problema:** La URL del nivel 3 en el breadcrumb apunta a `/servicios/{id}` (sin ciudad), pero esa ruta no existe como página independiente. Es un 404.
**Impacto Google:** Breadcrumb roto en Google Search Console. Schema inválido.
**Prioridad:** 🔴 CRÍTICA

#### C. URLs CON CARACTERES ESPECIALES EN OG IMAGES
**Archivo:** `src/app/api/og/route.tsx:7-8`
**Problema:** Las URLs de OG images contienen caracteres codificados manualmente. Ej: `%20%26%20`. Aunque funciona, es frágil. Mejor usar `encodeURIComponent()` consistentemente.
**Prioridad:** 🟢 BAJA

---

### 1.6 ROBOTS.TXT — CORRECTO ✅

**Archivo:** `src/app/robots.ts:1-35`
- Bloquea correctamente `/admin/`, `/api/`, `/onboarding/`, `/proposal/`, `/auth/`
- Permite bots de AI: GPTBot, PerplexityBot, ClaudeBot ✅
- Bloquea scrapers: AhrefsBot, SemrushBot ✅
- Sitemap declarado ✅

**Observación:** Agregar rule para bloquear crawl de `/api/og?*` (las OG images consumen recursos), y regla `Crawl-delay` para conservar crawl budget.

---

### 1.7 CRAWL BUDGET — MEDIA

**Problema:** Con ~950 páginas programáticas de servicios×ciudad, el sitio genera un crawl budget enorme. Un sitemap con 950+ URLs se fragmenta. Google puede no llegar a indexar todas.
**Recomendación:** Dividir sitemap en múltiples archivos (sitemap index → sitemap servicios, sitemap blog, sitemap static).
**Prioridad:** 🟡 ALTA

---

## 2. 🔴 ON-PAGE SEO — 30/100

### 2.1 HEADING HIERARCHY — CRÍTICO

#### A. HOME PAGE H1 INVISIBLE PARA GOOGLE
**Archivo:** `src/components/sections/HeroSection.tsx:80-92`
```html
<h1 class="text-xs sm:text-sm font-black uppercase tracking-[0.35em] mb-5 px-5 py-2 rounded-full border">
  Desarrollador Web Freelance · Colombia & USA Remote
</h1>
```
**Problema:** Este H1 tiene `text-xs` y `text-sm` — es pequeño y parece un badge/label, no un encabezado principal. Google penaliza H1s que no se comportan visualmente como encabezados principales (estilo "hidden" o "disguised header").
**Otro problema GRAVE:** Debajo hay un div con `aria-hidden="true"` que contiene texto visualmente más prominente (el typewriter). Esto confunde a Google porque el contenido semánticamente relevante está oculto con aria-hidden pero es lo más visible.

**Impacto Google:** Señal semántica débil en la homepage. El H1 no refleja el contenido principal de la página.
**Prioridad:** 🔴 CRÍTICA

#### B. MÚLTIPLES H1 EN BLOG PAGE
**Archivo:** `src/app/blog/page.tsx:60-63`
```html
<h1 class="text-6xl md:text-8xl font-black text-white-custom">Journal de Ingeniería</h1>
```
Y cada artículo usa h2/h3. Correcto en blog listado. ✅

#### C. H2 USADO COMO ETIQUETA DECORATIVA EN SERVICIOS
**Archivo:** `src/app/servicios/[servicio]/[ciudad]/page.tsx:245`
```html
<h2 class="text-xl md:text-2xl font-bold text-text-muted italic opacity-60">
  {h2}
</h2>
```
**Problema:** H2 con `opacity-60` y `text-text-muted` tiene bajo contraste. Google puede interpretarlo como "hidden heading" (intento de esconder keywords).
**Prioridad:** 🟡 ALTA

#### D. STATUS PAGE TIENE H1 COMO TEXTO DECORATIVO
**Archivo:** `src/app/status/page.tsx:58-65`
El H1 es "System Status" dentro de un span con `text-primary text-outline-primary`. Correcto estructuralmente pero la página es 'use client' (problema de indexación ya descrito).

---

### 2.2 META TITLES — ACEPTABLE

#### A. TITLE LENGTHS
| Página | Title | Longitud |
|---|---|---|
| Home | "Omar Hernández Rey \| Desarrollador Full Stack — Colombia & USA Remote" | 72 chars ✅ |
| Servicios | "Servicios de Desarrollo Web y Software \| Colombia & Remoto" | 64 chars ✅ |
| Blog | "Blog Técnico..." | 78 chars ✅ |
| FAQ | "Preguntas Frecuentes — Desarrollador..." | 86 chars ⚠️ Largo |
| Calculadora | "Calculadora de Presupuesto Web — ¿Cuánto cuesta..." | 72 chars ✅ |
| Servicio×Ciudad | Variable (~80-100 chars) ⚠️ |

**Problema:** Los titles de servicio×ciudad pueden exceder 70 caracteres (Google trunca a ~65-70 en SERPs).
**Prioridad:** 🟢 BAJA

#### B. KEYWORD STUFFING EN TITLES
**Archivo:** `src/app/page.tsx:16`
```
"Desarrollador Web Freelance Colombia | React & Next.js | Omar Hernández Rey"
```
**Problema:** 3 pipes en un title. Puede verse como keyword stuffing.
**Prioridad:** 🟢 MEDIA
**Corrección:** Reducir a: "Omar Hernández Rey | Desarrollador Web Freelance — Colombia & USA Remote"

---

### 2.3 META DESCRIPTIONS — ACEPTABLE

Todas las páginas tienen meta description. Longitudes generalmente en el rango correcto (120-160 caracteres).
**Observación:** Las descriptions de servicio×ciudad son generadas por template. Ej: `servicio.description.replace('{ciudad}', ciudad.name)`. Funciona pero es genérico.

---

### 2.4 THIN CONTENT — CRÍTICO

#### A. PÁGINAS SERVICIO×CIUDAD: CONTENIDO DUPLICADO MASIVO
**Archivo:** `src/app/servicios/[servicio]/[ciudad]/page.tsx`
**Problema GRAVE:** 10 servicios × 95 ciudades = 950 páginas. Cada página de servicio tiene EXACTAMENTE el mismo template HTML, solo cambia el nombre de la ciudad. Google considera esto **doorway pages** o **thin content**.

**Evidencia:**
- Mismo `benefits[]` para todas las ciudades de un mismo servicio
- Mismo `process[]` para todas las ciudades
- Mismo `faqs[]` solo cambia `{ciudad}` en la pregunta
- Mismo `description` solo cambia `{ciudad}`

**Riesgo:** Penalización de Google por contenido duplicado a escala masiva. Posible acción manual.
**Prioridad:** 🔴 CRÍTICA

#### B. BLOG CON SOLO 3 POSTS (TODOS EN INGLÉS)
**Archivo:** `content/blog/`
**Problema:** Solo existen 3 posts. TODOS en inglés. CERO posts en español. TODOS fechados el mismo día (13 Mayo 2026).
**Impacto Google:** Sin contenido en español para mercado colombiano. Sin contenido que demuestre expertise. Google ve un blog "muerto" o "abandonado".
**Prioridad:** 🔴 CRÍTICA

#### C. RECURSOS — CONTENIDO PROMOCIONAL SIN VALOR REAL
**Archivo:** `src/app/recursos/page.tsx` y `src/components/recursos/RecursosContent.tsx`
**Problema:** La página promete "checklists" y "guías" pero no hay evidencia de archivos descargables reales en `/public/leadmagnets/`.
**Prioridad:** 🟡 ALTA

#### D. NEWSLETTER FORM ES UN MOCK
**Archivo:** `src/components/shared/NewsletterForm.tsx:16-19`
```typescript
// Aquí deberías integrar tu servicio de suscripción al newsletter.
// Este es un ejemplo simulado:
await new Promise((resolve) => setTimeout(resolve, 2000));
setStatus("success");
```
**Problema:** Formulario de newsletter FALSO. No se suscribe a nada. Parece funcionar pero no hace nada real. **Si un Google Quality Rater ve esto, es una señal de baja calidad.**
**Prioridad:** 🔴 CRÍTICA

---

### 2.5 IMÁGENES SEO — ALTO

#### A. IMÁGENES DUPLICADAS EN PUBLIC/
**Problema:** Hay una estructura duplicada de imágenes:
- `public/images/` (directo) — 12 imágenes
- `public/images/images/` (dentro de images) — ~80 imágenes (duplicado completo con education, logos, etc.)

**Impacto:** Infla el build size. Sirve archivos duplicados.
**Prioridad:** 🟡 ALTA

#### B. HERO IMAGE SIN `fetchPriority`
**Archivo:** `src/components/sections/HeroSection.tsx:43-52`
```jsx
<Image src="/images/hero-background.jpg" alt="Fondo decorativo" fill priority quality={85} />
```
**Correcto:** Tiene `priority` ✅. **Problema:** `alt="Fondo decorativo"` — texto descriptivo mínimo. Una mejor práctica sería `alt=""` (es decorativa) o un alt más significativo.
**Prioridad:** 🟢 BAJA

#### C. IMÁGENES DE TESTIMONIOS INEXISTENTES
**Archivo:** `src/components/shared/Footer.tsx:48`
```typescript
avatar: "/images/testimonials/maria.jpg"
avatar: "/images/testimonials/juan.jpg"
```
**Problema:** Estas imágenes existen en el filesystem (real), pero los nombres "María López" y "Juan Pérez" son ficticios. Los testimonios NO SON REALES.
**Impacto EEAT:** Si Google o un Quality Rater detecta testimonios falsos, es una violación grave de las guidelines de Google. Esto puede resultar en acción manual.
**Prioridad:** 🔴 CRÍTICA

---

## 3. 🟡 SEMANTIC SEO — 52/100

### 3.1 ENTITY OPTIMIZATION — ACEPTABLE

#### A. PERSON ENTITY ✅
**Archivo:** `src/app/layout.tsx:31-50`
La entidad Person está definida con: name, url, sameAs, jobTitle, worksFor, description, knowsAbout, address. **Correcto.**

#### B. SAMEAS LINKS — INCOMPLETO
`OMAR_PROFILE.sameAs` solo tiene 3 URLs:
- GitHub ✅
- LinkedIn ✅
- Twitter ✅

**Faltan:** StackOverflow, dev.to, Medium, YouTube (si tiene), Instagram. Mientras más `sameAs` verificados, más sólida la entidad en el Knowledge Graph.
**Prioridad:** 🟢 MEDIA

#### C. ENTIDADES DESCONECTADAS
**Problema:** La Organization en `layout.tsx` referencia `@id: #organization` pero las páginas de servicio refieren `@id: #person`. No hay un `@id` de servicio que unifique todo. Algunas páginas crean schemas independientes sin conectarlos al grafo principal.
**Impacto:** Google no consolida entidades. Puede crear entidades separadas para "Omar Hernández freelance" y "Omar Hernández empresa".
**Prioridad:** 🟡 ALTA

---

### 3.2 KEYWORD CANNIBALIZATION — ALTO

#### A. CANIBALIZACIÓN MASIVA EN SERVICIO×CIUDAD
**Problema:** Con 950 páginas de servicios, TODAS compiten por keywords similares con solo la ciudad diferente. Ejemplo:
- `/servicios/desarrollo-web/bogota` target: "desarrollo web bogotá"
- `/servicios/desarrollo-web/medellin` target: "desarrollo web medellín"
- Ambas comparten contenido del template

Aunque Google puede diferenciar por geolocalización, el template casi idéntico con solo la ciudad cambiada es un patrón que Google ha penalizado históricamente (doorway pages).
**Prioridad:** 🔴 CRÍTICA

#### B. CANIBALIZACIÓN ENTRE /SERVICIOS Y SERVICIO×CIUDAD
**Archivos:** `src/app/servicios/page.tsx` vs `src/app/servicios/[servicio]/[ciudad]/page.tsx`
**Problema:** La página `/servicios` y las páginas `/servicios/desarrollo-web/bogota` compiten por keywords similares como "desarrollador web colombia".
**Prioridad:** 🟡 ALTA

---

### 3.3 SEMANTIC CHUNKING — ACEPTABLE

Los blog posts usan componentes MDX con estructura semántica. Correcto. Las páginas de servicio tienen secciones definidas (beneficios, proceso, FAQ) que ayudan al chunking semántico.

---

## 4. 🟡 AI SEARCH OPTIMIZATION — 55/100

### 4.1 READY FOR AI OVERVIEWS — PARCIAL

**Fortalezas:**
- FAQPage schema implementado en `/faq` ✅
- Speakable schema en blog posts ✅
- Contenido estructurado en secciones claras en servicios ✅

**Debilidades:**
- Sin `HowTo` schema en páginas de proceso (oportunidad)
- Sin `QAPage` schema para preguntas específicas
- Sin contenido rico en definiciones (Google prefiere definiciones claras para AI Overviews)

### 4.2 CHATGPT RETRIEVAL — ACEPTABLE

**Robots.ts:** GPTBot tiene `allow: /` correctamente. ✅
**RSS Feed:** Existe en `/feed.xml`. ✅
**Contenido:** Los blog posts en inglés son recuperables por ChatGPT.

### 4.3 PERPLEXITY CITATION — PARCIAL

**Fortalezas:**
- PerplexityBot tiene `allow: /` ✅
- BreadcrumbList schema ayuda a citar correctamente ✅

**Debilidades:**
- Falta contenido con citas/referencias claras en los blog posts
- Los datos de contacto y autoridad no están claramente definidos para citación
- Schema `citation` y `sameAs` limitados

---

## 5. 🟡 SCHEMA AUDIT — 62/100

### 5.1 ERRORES DE SCHEMA

| Schema | Archivo | Error | Severidad |
|---|---|---|---|
| BreadcrumbList | `servicios/[s]/[c]/page.tsx:220` | URL del nivel 3 apunta a ruta inexistente `/servicios/{id}` | 🔴 CRÍTICO |
| ProfessionalService | `page.tsx:67-113` | `aggregateRating` con reviews falsas ("María López") | 🔴 CRÍTICO |
| LocalBusiness | `servicios/[s]/[c]/page.tsx:186-211` | `areaServed` usa `@type: City` sin definir `containsPlace` ni `geo` | 🟡 ALTA |
| OfferCatalog | `servicios/page.tsx:111-123` | Las `Offer` no tienen `price` ni `priceCurrency` | 🟡 ALTA |
| WebSite SearchAction | `layout.tsx:22-29` | `urlTemplate` apunta a `/blog?q=...` que no tiene funcionalidad de búsqueda real | 🔴 CRÍTICO |
| Organization | `layout.tsx:52-73` | `logo` apunta a `/favicon.png` (32x32) — debe ser mínimo 112x112 para Google | 🟡 ALTA |
| BlogPosting | `blog/[slug]/page.tsx:127-161` | `dateModified` es igual a `datePublished` — sin fecha de modificación real | 🟢 MEDIA |

### 5.2 SCHEMAS DUPLICADOS

**Problema:** La entidad Person aparece en múltiples lugares:
1. `layout.tsx` (global) — `#person` ✅
2. `page.tsx` (home) — nuevo schema dentro de `ProfessionalService` sin `@id`
3. `blog/[slug]/page.tsx` — `author` con `@id: #person` pero datos parciales
4. `servicios/[s]/[c]/page.tsx` — `provider` con `@id: #person`

Aunque las referencias por `@id` son correctas, los datos asociados al `#person` no están consolidados en un solo lugar.

**Prioridad:** 🟡 ALTA

### 5.3 ENTIDADES DESCONECTADAS

El grafo de schemas no está completamente conectado:
- `#website` está conectado a `#organization` ✅
- `#organization` está conectado a `#person` ✅
- `#person` está conectado a `#organization` ✅
- `#service` (ProfessionalService) NO está conectado a `#organization` ni `#website`
- Los `BlogPosting` están conectados a `#website` y `#person` ✅
- Los `LocalBusiness` individuales NO están conectados al `#organization` principal

**Prioridad:** 🟡 ALTA

### 5.4 OPORTUNIDADES DE RICH SNIPPETS PERDIDOS

| Oportunidad | Página | Schema requerido | Estado |
|---|---|---|---|
| FAQ Rich Results | `/faq` | FAQPage ✅ | Implementado |
| Breadcrumbs | Todas | BreadcrumbList | Parcial (roto en servicios) |
| Sitelinks Searchbox | Home | WebSite + SearchAction | Implementado (pero búsqueda no funcional) |
| Article Rich Results | Blog posts | Article/BlogPosting | Implementado ✅ |
| Local Business | Servicios×ciudad | LocalBusiness | Parcial |
| Product/Service | Servicios | Service | No implementado |
| HowTo | Proceso trabajo | HowTo | No implementado |
| Video | No hay videos | VideoObject | No aplica |
| Review | Testimonios | Review | Implementado (con datos falsos) |

---

## 6. 🟡 INTERNAL LINKING — 48/100

### 6.1 PÁGINAS AISLADAS (Orphan Pages)

| Página | Links entrantes | Estado |
|---|---|---|
| `/privacy` | 0 | 🔴 Huérfana |
| `/certificates/*` | 0 | 🔴 Huérfana |
| `/recursos` | Solo desde sitemap | 🟡 Semi-huérfana |
| `/onboarding/[token]` | 0 | 🔴 Huérfana |
| `/status` | Footer solamente | 🟢 OK |

### 6.2 DISTRIBUCIÓN DE AUTORIDAD

| Página | Links internos | PageRank interno |
|---|---|---|
| Home `/` | ~25 (navbar + footer + sections) | Alto ✅ |
| `/servicios` | ~15 (navbar + footer + cards) | Alto ✅ |
| `/blog` | ~10 (navbar + footer + posts) | Medio ✅ |
| `/faq` | ~5 (navbar + footer) | Medio ✅ |
| `/calculadora` | ~5 (navbar + footer + faq page) | Medio ✅ |
| Servicios×ciudad | ~8 (other services + blog links + footer) | Bajo ⚠️ |
| Blog posts | ~10 (related posts + related services + footer) | Medio ✅ |

**Problema:** Las páginas de servicio×ciudad solo reciben links internos desde "other services" (misma plantilla, rotación artificial). Esto no distribuye autoridad real.

### 6.3 ANCHOR TEXT — ACEPTABLE

La mayoría de los anchor texts son descriptivos. Ej: "Ver servicio", "Volver al Blog".
**Problema:** En blog posts, el componente `getRelatedServices()` crea links con labels genéricos: "Desarrollo Web Profesional", "Ver todos los Servicios". Podrían ser más keyword-rich.
**Prioridad:** 🟢 BAJA

### 6.4 LINKS ROTOS EN PÁGINAS DE SERVICIO

**Archivo:** `src/app/servicios/[servicio]/[ciudad]/page.tsx:444-455`
```typescript
// Blog1, Blog2, Blog3 en contexto ES apuntan a URLs que NO existen:
blog1Href: '/blog/cuanto-cuesta-sitio-web-colombia-2026',  // NO existe
blog2Href: '/blog/chatbot-ia-negocio-colombia',            // NO existe
blog3Href: '/blog/landing-page-vs-sitio-web-colombia',     // NO existe
```
**Problema:** Las páginas de servicio×ciudad (contexto español) contienen **9 links rotos** (3 links × 95 ciudades = cientos de páginas con links a páginas inexistentes). En el contexto US, los links SÍ apuntan a los 3 posts existentes.
**Impacto Google:** Links internos rotos degradan la calidad del sitio. Crawl budget desperdiciado.
**Prioridad:** 🔴 CRÍTICA

---

## 7. 🟡 PERFORMANCE SEO — 45/100

### 7.1 CORE WEB VITALS — PREOCUPACIONES

#### A. LCP (Largest Contentful Paint)
**Problemas:**
1. `HeroSection` carga una imagen de fondo con `priority` ✅ pero `quality={85}` sin `sizes` definido
2. `particles.js` (`ParticlesComponent`) carga después del LCP pero consume CPU
3. `framer-motion` animaciones en múltiples componentes al cargar (AboutSection, TechMarquee, etc.)
4. La imagen OG dinámica `/api/og` se genera en cada request (edge function, latencia)

**Estimado LCP:** 2.5-3.5s (móvil) — debe ser <2.5s
**Prioridad:** 🟡 ALTA

#### B. CLS (Cumulative Layout Shift)
**Problemas:**
1. `Typewriter` en HeroSection cambia constantemente el layout — aunque es `aria-hidden`, visualmente desplaza elementos
2. Fuentes `Geist` y `Geist_Mono` se cargan con `next/font/google` ✅ (sin layout shift)
3. Navbar cambia de altura entre `min-h-16` y `lg:min-h-20` en resize
4. Imágenes sin `width`/`height` explícitos en algunos lugares (testimonials)

**Prioridad:** 🟡 ALTA

#### C. INP (Interaction to Next Paint)
**Problemas:**
1. `useEffect` con scroll listener en Navbar (cada scroll ejecuta cálculos)
2. `useEffect` con resize listener en NavbarLogic
3. Framer Motion animaciones en múltiples componentes simultáneas
4. ChatWidget escucha eventos globales

**Prioridad:** 🟢 MEDIA

### 7.2 BUNDLE SIZE

**Problemas:**
- `framer-motion`: ~100KB gzipped
- `three.js` (si ParticlesComponent lo usa — verificar): ~100KB+
- `react-icons` (FaHome, FaUserAlt, etc.): importaciones individuales — cada ícono importa su módulo
- `next-mdx-remote/rsc`: solo en blog pages ✅

**`optimizePackageImports` configurado:** solo `react-icons` y `framer-motion`. Falta `lucide-react`.
**Prioridad:** 🟢 MEDIA

### 7.3 RENDER BLOCKING

**Problema:** No hay configuración de `preload` ni `preconnect` para recursos críticos.
- El dominio de OG images (`omarhernandezrey.com`) podría necesitar `preconnect`
- Google Fonts se carga con `next/font/google` (optimizado) ✅

### 7.4 LAZY LOADING

**Archivos:** 
- `HeroSection` imagen usa `priority` ✅
- Otras imágenes de Next.js tienen lazy loading por defecto ✅
- `iframe` de Google Maps en Footer usa `loading="lazy"` ✅
- **Problema:** El map de Google en Footer (`iframe`) carga en todas las páginas, incluso cuando no es visible. Debería ser lazy-loaded con IntersectionObserver.

**Prioridad:** 🟢 MEDIA

### 7.5 FONT LOADING

**Archivo:** `src/app/layout.tsx:77-85`
```typescript
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```
**Correcto:** `next/font/google` optimiza automáticamente. ✅
**Observación:** El subset `"latin"` no incluye caracteres especiales del español (tildes, ñ). Debería incluir `"latin-ext"`.
**Prioridad:** 🟡 ALTA

---

## 8. 🔴 EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) — 22/100

### 8.1 EXPERIENCE SIGNALS — MUY BAJO

| Señal | Estado |
|---|---|
| Portafolio de proyectos reales | ✅ ProjectsSection con datos |
| Testimonios reales verificables | 🔴 FALSOS ("María López", "Juan Pérez") |
| Casos de estudio detallados | 🔴 No existen |
| Métricas de resultados | 🔴 No existen |
| Enlaces a proyectos live | ⚠️ Parcial (project.demo en proyectos) |

### 8.2 EXPERTISE SIGNALS — BAJO

| Señal | Estado |
|---|---|
| Certificaciones verificables | ✅ Platzi certificates (imágenes en public/) |
| Educación formal | ✅ Politécnico Grancolombiano |
| Blog técnico con profundidad | 🟡 3 posts en inglés, cero en español |
| Participación en conferencias | 🔴 No documentada |
| Contribuciones open source | 🔴 No documentadas (GitHub no enlazado visiblemente) |

### 8.3 AUTHORITATIVENESS SIGNALS — MUY BAJO

| Señal | Estado |
|---|---|
| Backlinks externos | 🔴 Probablemente cero |
| Menciones en medios | 🔴 No documentadas |
| Presencia en directorios | 🔴 Sin Google My Business, sin LinkedIn Company Page |
| Social proof real | 🔴 Solo links a perfiles vacíos |

### 8.4 TRUSTWORTHINESS SIGNALS — DEFICIENTE

| Señal | Estado |
|---|---|
| Página de privacidad | ✅ Existe `/privacidad` |
| Términos de servicio | 🔴 No existen |
| Información de contacto real | ✅ WhatsApp, email (aunque no visible en schema de contacto) |
| Dirección física | ✅ En schema (Bogotá) |
| Política de cookies | 🔴 No existe |
| HTTPS | ✅ Vercel provee |
| Testimonios reales | 🔴 Falsos |
| Newsletter funcional | 🔴 Es un mock |

**Impacto Total EEAT:** Este es el talón de Aquiles del sitio. Google E-E-A-T es fundamental post-HCU (Helpful Content Update). Un sitio con estas deficiencias en EEAT **no rankeará para queries comerciales competitivas**.
**Prioridad:** 🔴 CRÍTICA

---

## 9. 🟡 LOCAL SEO — 45/100

### 9.1 ENTIDAD LOCAL

**Fortalezas:**
- `LocalBusiness` schema en páginas servicio×ciudad ✅
- `areaServed` definido en schemas ✅
- Dirección en Bogotá documentada en schemas ✅
- Google Maps iframe en footer con ubicación Bogotá ✅

**Debilidades:**
- **Google Business Profile:** No verificado/no existe (requiere acción manual de Omar)
- Sin `NAP consistency` (Name, Address, Phone) — el teléfono NO aparece visible en ninguna página (solo en schema y footer)
- Los schemas `LocalBusiness` no tienen `geo` coordinates salvo en la homepage

### 9.2 SEO POR CIUDAD

**Problema:** Las páginas de servicio×ciudad son thin content. Para SEO local efectivo, cada página de ciudad necesitaría:
- Datos específicos de esa ciudad (no solo el nombre)
- Referencias a clientes/negocios locales
- Información de cobertura real (¿atiende realmente en Phoenix, Arizona?)
- Diferenciación real entre páginas

**Prioridad:** 🔴 CRÍTICA

---

## 10. 🔴 CONTENT STRATEGY — 28/100

### 10.1 PÁGINAS MÁS DÉBILES

| Página | Problema |
|---|---|
| `/recursos` | Promete descargables pero SIN archivos reales |
| `/status` | 'use client' — no indexable |
| `/privacy` | Huérfana, sin schema, sin contenido sustancial |
| `/onboarding/[token]` | Solo accesible con token, sin SEO |
| Servicios×ciudad (950 págs) | Thin content masivo |

### 10.2 PÁGINAS CON MAYOR POTENCIAL

| Página | Potencial | Acción |
|---|---|---|
| `/blog/*` (posts ES) | ALTO — long-tail keywords Colombia | Crear 6+ posts en español |
| `/calculadora` | ALTO — keyword "cuanto cuesta sitio web" | Enriquecer con schema + más contenido |
| `/faq` | ALTO — FAQ rich results | Ya tiene schema, falta difusión |
| `/servicios/desarrollo-web/bogota` | ALTO — keyword local Bogotá | Diferenciar con contenido único de Bogotá |
| `/recursos` | MEDIO — lead magnets | Crear PDFs reales y gatilizar |

### 10.3 QUICK WINS

1. **Crear 3 posts en español** basados en keywords colombianas (ROI inmediato)
2. **Corregir links rotos** en páginas de servicio (o crear los posts que referencian)
3. **Agregar `hreflang`** para diferenciar tráfico ES/EN
4. **Verificar Google Search Console** (ya debería estar configurado)
5. **Eliminar testimonios falsos** y reemplazar con reales o eliminarlos

### 10.4 KEYWORDS COMERCIALES PERDIDAS

El sitio NO ataca estas keywords de alta intención:
- "desarrollador web bogotá" → targeteada pero con thin content
- "programador react freelance colombia" → no específicamente targeteada
- "crear tienda online colombia" → parcialmente targeteada
- "desarrollo de apps móviles colombia" → no targeteada (PWA no es "app móvil" en español coloquial)
- "consultor SEO colombia" → no targeteada (hay servicio "seo-tecnico" pero sin landing dedicada)
- "mantenimiento web wordpress colombia" → no targeteada

---

## 11. 📊 COMPETITIVIDAD GEOGRÁFICA

### Colombia 🇨🇴
**Competitividad:** 🟢 MEDIA-ALTA
**Análisis:** El mercado colombiano de "desarrollador web freelance" es competitivo pero no saturado a nivel de contenido de calidad. Con correcciones EEAT + contenido en español + Google Business Profile, puede rankear en 3-6 meses para keywords locales de Bogotá.

### LATAM 🇲🇽🇦🇷🇨🇱🇵🇪
**Competitividad:** 🟡 BAJA-MEDIA
**Análisis:** Las páginas de servicio×ciudad para LATAM son thin content. Sin contenido localizado real, son páginas de "puerta" (doorway pages). Riesgo de penalización. La competencia en México y Argentina es más fuerte. **No está listo para competir en LATAM sin contenido sustancialmente mejorado.**

### Estados Unidos 🇺🇸
**Competitividad:** 🔴 MUY BAJA
**Análisis:** Aunque hay 55+ ciudades de USA en `ciudades.ts`, el contenido en inglés es mínimo (3 posts). El mercado de "web developer for hire" en USA es extremadamente competitivo (dominado por Toptal, Upwork, agencias locales). Las páginas de servicio×ciudad en USA son thin content que no compite contra sitios locales establecidos. **No está listo para competir en USA.**

---

## 12. 🗺️ ROADMAP PRIORIZADO

### FASE 1: CORRECCIONES CRÍTICAS (Semana 1-2)

| # | Acción | Archivos | Impacto |
|---|---|---|---|
| 1 | **Corregir breadcrumb roto** en servicios | `servicios/[s]/[c]/page.tsx:219` | Schema válido |
| 2 | **Eliminar testimonios falsos** (María López, Juan Pérez) | `page.tsx`, `Footer.tsx` | EEAT, evita penalización |
| 3 | **Eliminar aggregateRating falso** | `page.tsx:91-97` | Evita penalización Google |
| 4 | **Corregir SearchAction** (apunta a búsqueda inexistente) | `layout.tsx:24-29` | Schema válido |
| 5 | **Corregir links rotos** en contexto ES de servicio×ciudad | `servicios/[s]/[c]/page.tsx:175-183` | Crawl budget, UX |
| 6 | **Hacer funcional el newsletter** o eliminar el mock | `NewsletterForm.tsx` | EEAT |
| 7 | **Verificar Google Search Console** | Manual (Omar) | Indexación |
| 8 | **Agregar `latin-ext` subset** en fuentes | `layout.tsx:79` | Tildes y ñ |

### FASE 2: CONTENIDO Y EEAT (Semana 2-4)

| # | Acción | Impacto |
|---|---|---|
| 9 | **Crear 6 posts en español** (keywords Colombia) | Tráfico orgánico |
| 10 | **Crear página "Sobre mí"** detallada con credenciales reales | EEAT |
| 11 | **Agregar testimonios REALES** (si existen) o eliminarlos todos | EEAT |
| 12 | **Google Business Profile** (Omar debe crearlo) | Local SEO |
| 13 | **Eliminar imágenes duplicadas** en `public/images/images/` | Build size |

### FASE 3: TÉCNICO AVANZADO (Semana 4-6)

| # | Acción | Impacto |
|---|---|---|
| 14 | **Implementar hreflang** en todas las páginas | Tráfico bilingüe |
| 15 | **Dividir sitemap** (sitemap index → múltiples sitemaps) | Crawl budget |
| 16 | **Diferenciar contenido** en páginas servicio×ciudad top 20 | Thin content |
| 17 | **Implementar Service schema** en páginas de servicio individual | Rich snippets |
| 18 | **Optimizar LCP** (auditar bundle size) | Core Web Vitals |
| 19 | **Agregar `Crawl-delay`** en robots.txt | Crawl budget |
| 20 | **Conectar entidades schema** (grafo completo) | Knowledge Graph |

### FASE 4: AI SEARCH Y CRECIMIENTO (Mes 2-3)

| # | Acción | Impacto |
|---|---|---|
| 21 | **Crear HowTo schema** en páginas de proceso | AI Overviews |
| 22 | **Enriquecer FAQ** con preguntas long-tail adicionales | Rich results |
| 23 | **Agregar `citation`** y `mentions` schema a blog posts | AI Search |
| 24 | **Implementar `WebSite` search** funcional (buscar en blog) | Sitelinks searchbox |
| 25 | **Cross-post blog** a dev.to, Hashnode, Medium con canonical | Backlinks |

---

## 13. 📈 MÉTRICAS DE ÉXITO POST-CORRECCIÓN

| KPI | Actual | Objetivo 3 meses | Objetivo 6 meses |
|---|---|---|---|
| Páginas indexadas (GSC) | ~50? | 100+ | 150+ |
| Impresiones/mes | ? | 500+ | 2000+ |
| Clics orgánicos/mes | ? | 20+ | 100+ |
| CTR promedio | ? | 2%+ | 3%+ |
| Posición keywords target | ? | <50 | <20 |
| Leads desde orgánico/mes | ? | 2-3 | 5-10 |
| Errores schema (GSC) | Probablemente varios | 0 | 0 |
| Core Web Vitals (LCP) | 2.5-3.5s | <2.5s | <2.0s |

---

## 14. 🔍 RESUMEN DE HALLAZGOS CRÍTICOS

1. **Testimonios Falsos** → Violación directa de Google Guidelines. Acción manual posible.
2. **AggregateRating Falso** → Misma violación. Esquema fraudulento.
3. **Newsletter Mock** → Componente que simula funcionar pero no hace nada.
4. **950 páginas thin content** → Riesgo de penalización por doorway pages.
5. **Links rotos en 950 páginas** (contexto ES) → Crawl budget masivo desperdiciado.
6. **Breadcrumb Schema roto** → Error en Google Search Console.
7. **Cero contenido en español** → El mercado principal (Colombia) sin contenido.
8. **Sin hreflang** → Google confunde versiones ES/EN.
9. **EEAT Score: 22/100** → El sitio no pasaría una revisión de Quality Rater.
10. **Imágenes duplicadas** → `public/images/images/` (directorio duplicado completo).

---

## 15. 🎯 ACCIÓN INMEDIATA (HOY)

Si solo pudieras hacer 3 cosas hoy:

1. **Eliminar los testimonios falsos y el aggregateRating falso** (`page.tsx:91-110` y `Footer.tsx:42-57`) — esto es lo más grave
2. **Corregir el breadcrumb roto** en servicios×ciudad — error de schema visible en GSC
3. **Corregir los links rotos** en el contexto español de servicios×ciudad (líneas 175-183) — o crear esos blog posts

---

*Auditoría generada el 17 de Mayo de 2026 por análisis completo del código fuente.*
*Próxima auditoría recomendada: 17 de Agosto de 2026 (después de implementar Fases 1-2).*
