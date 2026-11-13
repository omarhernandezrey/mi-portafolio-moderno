# Plan Maestro — Dashboard como motor real del portafolio

> Propietario: Omar Hernández Rey · Repo: `omarhernandezrey/mi-portafolio-moderno`
> Creado: 2026-11-12 · Estado: **Fase 0 en curso**

Documento único de verdad. Toda tarea sale de aquí y se marca completada aquí.

---

## 1. Diagnóstico (análisis ejecutado sobre `main` @ `2dc023b`)

### 1.1 El problema de fondo

El panel en `/admin` es un **CRM de agencia freelance**: leads, tickets, facturas, suscriptores, cronómetro de horas, webhooks, feed y runbooks. Funciona y tiene datos reales en Supabase, pero **no gobierna el portafolio**. El portafolio público, en cambio, está **100 % hardcodeado en archivos TypeScript**:

| Contenido | Archivo | Registros |
|---|---|---|
| Proyectos | `src/lib/projectsData.ts` | **22** |
| Educación / certificados | `src/lib/educationData.ts` | **172** en 7 categorías (171 con certificado) |
| Certificados destacados | `src/lib/portfolio/source/badges.ts` (antes inline en `EducationSection.tsx`) | 7 |
| Skills | `src/lib/skillsData.ts` | 8 |
| Tecnologías (marquee) | `src/lib/portfolio/source/technologies.ts` (antes inline en `TechMarquee.tsx`) | 42 |
| Servicios | `src/lib/servicesData.ts` | 4 (+ 10 programáticos en `src/data/servicios.ts`) |
| Intereses / datos personales | `src/lib/portfolio/source/about.ts` (antes inline en `AboutSection.tsx`) | 4 + 3 |
| Experiencia (timeline) | `src/lib/portfolio/source/timeline.ts` (antes inline en `sobre-mi/page.tsx`) | 4 (es) + 4 (en) |

> **Corrección de cifras (T-05).** La primera versión de esta tabla decía 24 proyectos, 173 ítems de educación, 163 certificados, 15 insignias, 10 skills y 6 servicios. Esas cifras venían de un recuento sobre el texto de los archivos y eran **erróneas**: al importar los módulos y medir `.length`, e imprimir cada registro para confirmarlo, salen 22, 172, 171, 7, 8 y 4. El `interface` de cabecera y los objetos anidados inflan cualquier recuento hecho leyendo. Las cifras reales viven ahora en `CONTENIDO_ORIGINAL` (`src/lib/portfolio/types.ts`) y `__tests__/unit/portfolio-content-counts.test.ts` las compara **en vivo** contra los módulos, así que no pueden volver a desviarse en silencio. Detalle: el carrusel de insignias muestra 8 porque `EducationSection` antepone en runtime una entrada calculada (el curso más reciente de `educationData`); lo que se migra son las 7 de datos y la octava se sigue derivando.

Consecuencia: cada insignia, skill o proyecto nuevo exige programar y desplegar. Eso es exactamente lo que hay que eliminar.

**Duplicación detectada:** `/sobre-mi` repite educación, proyectos, skills, servicios y timeline en arrays propios inline. Si se migra solo `src/lib/*`, la home y `/sobre-mi` quedan desincronizadas. La migración debe unificar ambas fuentes.

### 1.2 Métricas y gráficas

- **No hay ninguna librería de gráficas instalada.** Las "gráficas" del dashboard son `<div>` con `style={{height:'%'}}` y un `Sparkline` artesanal en `src/components/admin/ui/StatCard.tsx`.
- **No existe integración con la API de GitHub.** Cero referencias a `api.github.com`, `octokit` o `GITHUB_TOKEN`.
- Observabilidad: solo `@vercel/analytics`. No hay Web Vitals reales, ni Speed Insights, ni tabla de eventos.
- Acceso verificado: el token de GitHub de esta sesión lee métricas reales (ej. este repo: TypeScript 1 662 904 B, MDX 402 134 B, CSS 56 792 B, Shell 25 094 B, PLpgSQL 16 311 B, JS 15 445 B). **La ingesta de métricas reales es viable hoy.**

### 1.3 Bot de Telegram — causa raíz del "siempre el mismo mensaje"

No hay mocks. Son tres fallos reales:

1. **Plantilla fija con ceros.** `src/app/api/cron/daily-summary/route.ts:97-104` arma siempre las mismas 6 líneas; sin leads el día anterior cae a los literales `'Sin pagos confirmados'` (L79) y `'N/A'` (L94) con `0 leads`. Mensaje byte-idéntico cada día a las 08:00 Colombia.
2. **`pendingCount` es acumulativo sin ventana temporal** (L42-45): cuenta todos los leads `new`/`cold` históricos, así que repite el mismo número indefinidamente.
3. **El webhook entrante está muerto.** `src/app/api/telegram/webhook/route.ts:25-29` devuelve 503 si `TELEGRAM_WEBHOOK_SECRET` está vacío, y esa variable **no está en el schema zod** de `src/config/env.ts` (solo tiene getter, L27): nadie avisa si falta. Por eso `/leads`, `/conv`, `/reply` no responden. Además el webhook contesta al `TELEGRAM_CHAT_ID` fijo en vez de al `chat.id` del update, y `notifyTelegram` falla en silencio con `console.warn` si faltan credenciales (`src/lib/chatbot/telegram.ts:7-10`).

### 1.4 Autenticación actual

Supabase Auth con **magic link / OTP por email** (sin contraseña) + defensa en 3 capas: `src/middleware.ts` → `src/app/admin/(dashboard)/layout.tsx` → `requireAdmin()` en cada handler. Roles `owner > assistant > viewer` en tabla `user_roles`, matriz única en `src/lib/admin/permissions.ts`.

Riesgos concretos encontrados:

- **`src/lib/admin/access.ts:17`: si `ADMIN_ALLOWED_EMAILS` está vacío, `isEmailAllowed()` devuelve `true`.** La allowlist se desactiva en silencio. *Severidad alta.*
- `src/lib/supabaseServer.ts` usa **service_role (bypass RLS)** en casi todos los handlers. `supabase/schema.sql:88` habilita RLS **sin crear políticas**: la seguridad depende por completo de la capa de aplicación.
- Endpoints nuevos bajo `/api/admin` heredan el mínimo por omisión (`viewer`/`assistant`).
- Sin MFA. Sin rate limiting propio en el login.
- El middleware consulta el rol a Supabase en cada request (latencia y coste), y repite `getUser()` en 3 capas.

### 1.5 Sistema de diseño (a respetar, no reinventar)

**La paleta no se toca.** No son hex en Tailwind: son punteros a variables CSS envueltos en `color-mix()`. Hay **10 paletas conmutables** definidas en `src/app/globals.css` (L195-536), seleccionadas por `PaletteToggle.tsx` añadiendo `palette2…palette10` al `<html>` y persistidas en `localStorage["paletteIndex"]`.

Paleta por defecto (`:root`, palette1):

```
--background-color:#0d131a   --secondary-background-color:#1c2731
--text-color:#e5e7eb         --muted-color:#b8bfca
--primary-color:#00cba9      --accent-color:#00a086
--card-bg-color:#1c2731      --white-color:#fff
```

El admin se blinda con `.admin-shell` (`globals.css:543`), que redefine sus propias variables para que `palette4` (la única clara) no rompa el contraste: `--admin-bg:#070c11`, `--admin-surface:#0b131a`, `--admin-raised:#101c26`, `--admin-line:#1e2c38`, `--admin-ink:#f1f6fa`, `--admin-muted:#8ea0b5`, `--admin-success:#34d399`, `--admin-warning:#fbbf24`, `--admin-danger:#fb7185`, `--admin-info:#60a5fa`.

> **REGLA DURA:** todo componente nuevo consume tokens (`primary`, `accent`, `card-bg`, `admin-*`). **Cero hex literales.** Un hex quemado rompe el cambio de paleta.

Tipografía: **Fraunces** (`--font-display`, serif, titulares), **Manrope** (`--font-body`), **JetBrains Mono** (`--font-mono`, kickers con `letter-spacing:.2em` + uppercase), cargadas con `next/font/google` en `src/app/layout.tsx:76-93`.

Lenguaje visual real (valores existentes, a continuar):
- Superficie oscura con doble radial-gradient fijo (primary 10 %, accent 7 %, alcance 32rem/28rem).
- Radios generosos: `rounded-full` (217 usos) > `rounded-2xl` (149) > `rounded-xl` (142); radio grande `rounded-[32px]`.
- Separador dominante: borde hairline teñido `border-primary/20` (63 usos), `border-primary/30` (43), `border-admin-line`.
- Glow por `blur-[80px]` sobre blobs `bg-primary/10`, no por `box-shadow`.
- Sombra difusa y negativa: `0_18px_45px_-32px_rgba(0,0,0,0.95)`.
- Estado siempre como tríada `text-X` + `border-X/20` + `bg-X/10`.
- Textura `.bg-grain` (SVG feTurbulence, opacity .05, `mix-blend-mode:overlay`) y `.bg-tech-grid` (64px animado).
- Foco accesible: `outline:2px solid color-mix(primary 75%)` + `outline-offset:2px`.

Primitivos ya existentes y reutilizables en `src/components/admin/ui/`: `AdminButton`, `AdminCard`, `StatCard`, `StatusBadge`, `PageHeader`, `Pagination`, `EmptyState`, `InfoItem`, `ChatBubble`.

Huecos a cubrir (Fase 0): `borderRadius` nombrado, escala de elevación, **paleta categórica de datos para gráficas (crítico: no existe)**, `fontSize` tokenizado por rol (metric/kpi/label), primitivos de formulario (Input, Select, Textarea, Checkbox), Tabs, Tooltip, Skeleton, Table/DataGrid, Dialog, y tokens de duración/easing.

Deuda menor detectada: `src/components/ui/Button.tsx` hardcodea `bg-blue-500` (fuera del sistema); 7 de las 10 paletas apuntan `--main-font-family` a fuentes que `next/font` nunca carga.

---

## 2. Restricciones críticas — violarlas invalida la tarea

1. **NO SE BORRA NADA.** Ni un proyecto, ni una insignia, ni un certificado, ni un módulo del CRM. Migrar ≠ eliminar. Todo contenido actual se traslada a la base de datos **verificando conteos exactos** contra `CONTENIDO_ORIGINAL`: 22 proyectos, 172 ítems de educación en 7 categorías (171 con certificado), 7 insignias destacadas, 8 skills, 4 servicios, 42 tecnologías, 4 hitos de timeline (×2 idiomas).
2. **EL VISOR DE PROYECTOS NO SE TOCA.** Es `src/components/shared/Card.tsx` (puro CSS + PNG + 3 iframes superpuestos; **no** es `src/components/DeviceFrame.tsx`, que está huérfano). Su geometría es artesanal: laptop `1570×1050 scale(0.15)` con offsets `top:20px/left:8px/right:4px/bottom:4px` sobre `/images/laptop.png`, tablet `1180×761 scale(0.13)`, móvil `334×640 scale(0.1)`, más una cadena de `scale-[0.63]…xl:1.3` acoplada a márgenes negativos. **Solo se le cambia la fuente de datos, nunca el markup ni el CSS.** Contrato de entrada intacto:
   ```ts
   { title: string; description: string; technologies: string[]; repository: string; demo: string; category?: string }
   ```
   Strings ya localizados, no `{es,en}`. El único campo que alimenta los 3 iframes es `demo`.
3. **LA PALETA SE RESPETA.** Ver §1.5. Solo tokens.
4. **Nada de diseño "de plantilla IA".** Composición, jerarquía y ritmo tipográfico hechos a mano, con el lenguaje visual del §1.5. Serif Fraunces en titulares, mono con tracking en kickers, hairlines teñidos, glow por blur.
5. **Mobile-first de verdad.** Se diseña y valida primero a 375 px, luego 475 (`xs`), luego `lg`. Desktop al final.
6. **Cero datos hardcodeados en el dashboard nuevo.** Si un número no viene de Supabase o de la API de GitHub, no se muestra.
7. **El `.env` real no está disponible** (solo en el PC Linux de Omar, no se sube a GitHub). Se trabaja contra `.env.example`; toda variable nueva se documenta ahí. Las pruebas con credenciales reales quedan marcadas como **pendientes de validación local**.
8. **Los iconos de tecnología hacen match literal** contra las ~105 claves de `src/config/technologyIcons.tsx`. Si la BD normaliza a slugs minúsculos, se pierden los iconos. Guardar el nombre tal cual.

---

## 3. Reglas de ejecución (ciclo obligatorio por tarea)

```
1. git checkout -b <tipo>/<slug-tarea>        # una rama por tarea
2. Implementar en commits pequeños y descriptivos
3. Validar — TODO debe pasar:
     npm run typecheck      → 0 errores
     npm run lint           → 0 errores
     npm test               → verde
     npm run build          → ver nota abajo
     revisión visual 375px  → captura o descripción
4. Solo si TODO pasa: marcar la tarea completada en este documento
5. git merge a main (fast-forward o merge commit) y push
6. Siguiente tarea
```

Si una validación falla, la tarea **sigue abierta**. No se marca completada ni se mergea.

> **Nota sobre `npm run build` en el entorno cloud.** `src/app/layout.tsx` carga Fraunces, Manrope y JetBrains Mono con `next/font/google`, que descarga las fuentes **en tiempo de build**. El entorno de trabajo en la nube tiene `fonts.googleapis.com` fuera de su allowlist (`CONNECT tunnel failed, 403`), así que el build falla ahí por red, no por código. Sustitutos usados en cada tarea:
> - `npx tailwindcss -i src/app/globals.css -o /tmp/out.css` → prueba que el CSS y los tokens compilan.
> - `npm run typecheck` + `npm run lint` + `npm test` → cubren el código.
> - **El build real lo valida Vercel** en cada push a `main`, y Omar en local donde sí tiene red y el `.env` verdadero.
> Ninguna tarea se declara completada afirmando un build que no se ejecutó.

---

## 4. Decisión pendiente de Omar

### D-1 · Autenticación: AWS Cognito vs. Supabase Auth endurecido

Omar pidió AWS. Antes de ejecutar algo irreversible, los números:

**Migrar a Cognito implica:** romper el vínculo `user_roles.id → auth.users(id)` del que dependen las políticas RLS y `admin_audit_logs.actor_id`; firmar JWT de Cognito con el secreto de Supabase para que `auth.uid()` siga funcionando (posible pero frágil); montar User Pool, App Client y dominio; coste AWS; y reescribir las 3 capas de auth más `/auth/callback`.

**Recomendación técnica:** quedarse en Supabase Auth y endurecerlo — **MFA TOTP** (soportado nativamente), contraseña o passkey además del magic link, rate limiting propio en el login, arreglo del bug de allowlist (§1.4), políticas RLS reales y caché de rol en el middleware. Resultado: auth moderna y completa, sin migración de riesgo y sin coste nuevo.

**Si Omar confirma AWS igualmente**, se ejecuta como fase aislada al final, con rama propia, Cognito + MFA y puente de JWT hacia Supabase, para no bloquear el resto.

Hasta tener respuesta: **se implementa el endurecimiento compatible con ambos caminos** (fix de allowlist, rate limiting, políticas RLS, auditoría). Ningún trabajo se pierde con cualquiera de las dos decisiones.

---

## 5. Backlog por fases

Leyenda: `[ ]` pendiente · `[~]` en curso · `[x]` completada y mergeada

### Fase 0 — Fundaciones de diseño y datos
- [x] **T-01** Tokens de dashboard: `borderRadius` nombrado (`field/chip/card/panel/canvas`), elevación (`e1..e4`, con `e3` canonizando la sombra que estaba suelta en `AdminCard`), `fontSize` por rol (`kicker/label/metric/metric-sm/section`, las métricas con `clamp()` para no desbordar a 375 px), duraciones (`fast/base/slow`), easings (`out-expo/in-out-soft`) y radios de glow (`glow-sm/md/lg`). Rama `feat/design-tokens`.
  *Validado:* typecheck 0 errores · lint limpio · 93 tests (33 nuevos en `__tests__/unit/design-tokens.test.ts`) · Tailwind compila y genera las 6 clases probadas · cero hex en el bloque de tokens · las 10 paletas verificadas por test.
- [x] **T-02** Paleta de datos: categórica `--chart-1..8`, secuencial `--chart-seq-1..7` (un solo tono, teal) y divergente `--chart-div-*` (teal ← gris neutro → magenta). Rama `feat/chart-palette`.
  *Decisión de diseño:* la paleta de datos es **la única parte del sistema con color fijo**, a propósito. Un color de serie derivado de `--primary-color` cambiaría con cada una de las 10 paletas y entonces no habría forma de garantizar que dos series sigan distinguiéndose: ni el contraste contra la superficie ni la separación bajo daltonismo sobreviven a un tono que se mueve. Los 8 tonos están calculados en OKLCH con **lightness alternada** (0.50–0.665) para que los pares vecinos se separen también en luminosidad, no solo en tono.
  *Validado:* los 6 chequeos pasan en superficie oscura (`#070c11`) **y** clara (`#fff`) — banda de lightness, piso de croma, CVD (peor par adyacente ΔE 8.4 deutan / 11.5 tritan), piso de visión normal (peor par ΔE 22.5), contraste ≥ 3:1. Rampa secuencial monótona en lightness con 0.8° de dispersión de tono; divergente simétrica con gris real en el centro (croma 0.032). Los colores de estado (`success/warning/danger/info`) quedan reservados y no se usan como serie. 114 tests verdes (21 nuevos), typecheck y lint limpios, CSS compila.
  *Pendiente al usarla:* en superficie clara `--chart-8` queda en 2.88:1 → ahí es obligatorio etiqueta visible o vista de tabla. Y `src/lib/charts/palette.ts` expone `assignSeriesColors`, que asigna en orden fijo y agrupa de la 9ª serie en adelante en «Otros» en vez de ciclar tonos.
- [x] **T-03** Primitivos faltantes, todos en `src/components/admin/ui/` con barrel en `index.ts`: `Field` (andamio compartido), `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Tabs` + `TabPanel`, `Tooltip`, `Skeleton` (+`SkeletonText`, `SkeletonStatCard`, `SkeletonRegion`), `Dialog` + `ConfirmDialog`, `DataTable`. Rama `feat/admin-primitives`.
  *Decisiones mobile-first, no cosméticas:*
  - Los controles van a **16px en móvil** (`text-base sm:text-sm`): por debajo de eso Safari en iOS hace zoom al enfocar y descoloca el formulario. Alto mínimo `min-h-11` (44px) de objetivo táctil.
  - `DataTable` **no usa tabla en móvil**. Una tabla de 6 columnas a 375 px solo permite scroll horizontal (esconde datos y pelea con el scroll de la página) o celdas ilegibles; aquí cada fila es una tarjeta con título, línea de apoyo y pares etiqueta/valor, y la `<table>` aparece desde `lg`. Los dos marcados salen de **una sola definición de columnas**, donde cada columna declara su papel en la tarjeta (`primary`/`meta`/`hidden`), así que no pueden desincronizarse.
  - `Dialog` entra como **hoja desde abajo** en móvil (ancho completo, esquinas superiores, `max-h-[90dvh]` para que la barra del navegador no recorte el pie) y se centra desde `sm`. En `ConfirmDialog` el botón de cancelar va primero en el DOM y la columna se invierte en móvil: un borrado no debe ser el botón más fácil de alcanzar con el pulgar.
  - `Tabs` scrollea horizontalmente con `snap` a 375 px en vez de romperse en dos líneas, y autodesplaza la activa a la vista. Teclado con activación manual (flechas, Home, End) para no disparar cargas al pasar de largo.
  - `Tooltip` abre con hover, foco **y toque**: en táctil no hay hover, y el `title` nativo deja la explicación inalcanzable desde el móvil.
  - `Select` es nativo a propósito (rueda del sistema en móvil); `Checkbox` conserva el `<input>` real bajo la marca dibujada (foco, barra espaciadora, autofill, formularios).
  - `Skeleton` respeta `prefers-reduced-motion`.
  *Dos defectos reales que encontraron los tests:* (1) `aria-describedby` apuntaba a la pista incluso cuando el error ya la había quitado del DOM — referencia colgante que deja al lector de pantalla sin nada que leer; (2) `scrollIntoView` sin comprobar rompía las pestañas en entornos que no lo implementan. Ambos corregidos en el componente, no silenciados en el test.
  *Validado:* typecheck 0 errores · lint limpio · **148 tests** (34 nuevos, de comportamiento y accesibilidad, no de clases CSS) · las 4 utilidades de riesgo (`min-h-11`, `pb-safe`, `z-80`, `rounded-t-panel`) verificadas contra el CSS compilado.

### Fase 1 — Modelo de datos del portafolio
- [x] **T-04** Migración `supabase/migrations/20261112_portfolio_content.sql` con 9 tablas: `portfolio_projects`, `portfolio_skills`, `portfolio_education_categories`, `portfolio_education_items`, `portfolio_badges`, `portfolio_services`, `portfolio_technologies`, `portfolio_timeline`, `portfolio_profile`. Tipos en `src/lib/portfolio/types.ts`. Rama `feat/portfolio-schema`.
  *Decisiones de modelado:*
  - Campos bilingües como `jsonb {"es":…,"en":…}` — es la forma que ya tenían los archivos, así que el adaptador puede reproducir el fallback a `es` de `getLocalizedProjectsData` sin inventar nada, y añadir un idioma no obliga a migrar columnas.
  - `position` explícito: el orden lo daba la posición en el array y eso se pierde al pasar a filas.
  - `slug` único: hoy `Card.tsx` usa el **título** como clave de React, y dos títulos iguales rompían el render.
  - `technologies text[]` con los nombres **tal cual**: los ~105 iconos de `technologyIcons.tsx` se resuelven por coincidencia literal de cadena; normalizar a slugs los borraría.
  - Los iconos que eran JSX (timeline y marquee usaban componentes de lucide) pasan a `icon_key`, una cadena que el código resuelve contra su registro. JSX no se persiste.
  - `percentage` de skills: de `"95%"` a entero 0..100 con `check`. El símbolo es presentación.
  - `demo_embeddable` + `demo_checked_at`: el visor incrusta `demo` en tres iframes y un sitio con `X-Frame-Options` deja el «computador» en blanco **sin error visible**; ahora se puede detectar y avisar en el panel en vez de publicar una tarjeta rota.
  - `certificate` (ruta en `public/`, las 163 actuales) **y** `certificate_url` (Storage o URL externa) — lo segundo es lo que permite añadir insignias desde el panel sin subir archivos al repo.
  - RLS con políticas **de verdad**, a diferencia de `schema.sql` (que habilita RLS sin crear ninguna): `anon` y `authenticated` solo leen lo publicado, y la ausencia de política de escritura es deliberada, así que solo `service_role` escribe.
  - `portfolio_profile` es la única tabla sin `position`: se lee por `section`, de una en una.
  *Validado contra un PostgreSQL 16.15 real, no solo revisado:* dos pasadas sin error (idempotente) · 9 tablas, 8 índices `(is_published, position)`, 9 triggers de `updated_at`, 9 políticas, RLS activo en las 9 · con el rol `anon`: ve 1 de 2 filas (oculta el borrador), su `INSERT` es rechazado por la política y su `UPDATE`/`DELETE` afectan 0 filas · el `check` de `percentage` rechaza 150 · `technologies` conserva `{Next.js,React}` sin normalizar · el trigger de `updated_at` dispara.
  *Guardarraíl:* `__tests__/unit/portfolio-schema.test.ts` parsea el SQL y compara columna por columna con los tipos TS. Ya encontró una deriva real durante la propia tarea (el tipo declaraba `position` en `portfolio_profile`, que la tabla no tiene). 169 tests verdes, typecheck y lint limpios.
- [~] **T-05** Trasladar el contenido actual **sin pérdida**. Partido en dos porque la extracción tiene valor por sí sola.
  - [x] **T-05a** Arrays inline → módulos de datos puros en `src/lib/portfolio/source/`: `badges.ts` (7), `technologies.ts` (42), `timeline.ts` (4+4), `about.ts` (4+3), más `icon-registry.tsx` con 52 claves y `resolveIcon()`. Rama `feat/portfolio-source-modules`.
    *Por qué hacía falta antes del seed:* el contenido estaba incrustado en componentes y, peor, con **iconos en JSX** (lucide y react-icons), que no son serializables. Ahora cada icono es una clave de cadena que el registro resuelve al mismo componente de antes; `PortfolioIconKey` es la unión literal de claves, así que un typo no compila. Los componentes renderizan exactamente lo mismo: solo cambia de dónde vienen los datos.
    *Hallazgos durante la extracción:* (1) el `year` del 4.º hito está traducido (`2025 - Presente` / `2025 - Present`) pero `portfolio_timeline.year` es `text` sin idioma — el seed debe decidir o pasarlo a jsonb; (2) el `icon` del timeline **nunca se renderizaba** (el punto es un `div`), así que pasarlo a clave no cambia un pixel; (3) `personalData` no guardaba texto sino claves i18n (`t("about.personalData.name")`), así que se conservaron las claves y no el texto, para no desincronizarlo de `locales/{es,en}/common.json`.
    *Validado:* typecheck 0 errores · lint limpio · **257 tests** (74 de la extracción + 14 de conteos en vivo).
    *Deuda preexistente detectada, ajena a esta tarea:* `npx tsc -p tsconfig.jest.json` arroja 816 errores (`jsx: "react"` sin `import React`), idénticos antes y después. Jest no usa ese config (va por `next/jest` + SWC), así que no afecta a los tests, pero está anotado en T-24.
  - [ ] **T-05b** Script de seed que inserta en Supabase y verifica conteos contra `CONTENIDO_ORIGINAL`, resolviendo la duplicación de `/sobre-mi`. Rama `feat/portfolio-seed`.
    *Aceptación:* conteos exactos (22/7/172/171/7/8/4/42/4); `features`, `highlights` y `architecture` en JSONB; nombres de tecnología sin normalizar; rutas de certificado preservadas tal cual. **Requiere credenciales reales de Supabase**, que hoy no están disponibles en el entorno (el `.env` vive solo en el PC de Omar): el script se escribe y se prueba contra el PostgreSQL local, y la carga real queda pendiente de validación.

### Fase 2 — El portafolio público lee de la base de datos
- [ ] **T-06** Capa de lectura con caché (`unstable_cache` / ISR) y **fallback a los archivos actuales** si la BD no responde. Rama `feat/portfolio-data-layer`.
  *Aceptación:* home y `/sobre-mi` idénticas píxel a píxel a hoy; sin degradación de LCP; fallback probado.
- [ ] **T-07** Conectar el visor de proyectos a la BD **sin tocar `Card.tsx`**. El adaptador replica `getLocalizedProjectsData` (fallback a `es`) y entrega el contrato del §2.2. Rama `feat/projects-from-db`.
  *Aceptación:* los 24 proyectos se ven igual; los 3 iframes cargan; interacción táctil intacta; test visual a 375 px y en desktop; validación de `demo` embebible con aviso en el dashboard si el sitio bloquea iframes.

### Fase 3 — Dashboard editable (el motor)
- [ ] **T-08** Rediseño del shell del dashboard **mobile-first**, con dos áreas: **Portafolio** (nuevo) y **Negocio** (el CRM actual, intacto). Rama `feat/dashboard-shell`.
  *Aceptación:* navegación usable con una mano a 375 px; los 12 ítems actuales siguen accesibles; `AdminNav` conserva focus-trap, Escape y `aria-expanded`.
- [ ] **T-09** Módulo **Proyectos**: CRUD + reordenar (drag o botones) + publicar/despublicar + vista previa. Rama `feat/module-projects`.
- [ ] **T-10** Módulo **Skills** (nombre, %, categoría, color, icono). Rama `feat/module-skills`.
- [ ] **T-11** Módulo **Educación e insignias**: categorías, ítems, subida de imagen a Supabase Storage **y** soporte de URL externa (requiere `remotePatterns` en `next.config.mjs`). Rama `feat/module-education`.
- [ ] **T-12** Módulo **Servicios, tecnologías, timeline y perfil/hero**. Rama `feat/module-content`.
  *Aceptación (T-09…T-12):* cada módulo crea, edita, elimina y reordena; el cambio se refleja en la home; test E2E del ciclo completo por módulo; el borrado pide confirmación y es recuperable (§Fase 5, T-18).

### Fase 4 — Métricas reales
- [ ] **T-13** Cliente de GitHub (`src/lib/github.ts`) + tabla `github_metrics` + cron `/api/cron/github-metrics` + workflow en `.github/workflows/`. Ingesta por repo: commits, líneas añadidas/eliminadas, lenguajes, stars, forks, PRs, actividad diaria, rachas. Rama `feat/github-metrics`.
  *Aceptación:* `GITHUB_TOKEN` en `.env.example` y en el schema de `src/config/env.ts`; respeta rate limit; **el dashboard lee de Supabase, nunca de la API en vivo** (carga instantánea); histórico acumulable.
- [ ] **T-14** Panel de métricas con **gráficas reales**: actividad diaria, mapa de calor de contribuciones con rachas, lenguajes por bytes, commits por repo, velocidad de entrega. Rama `feat/metrics-dashboard`.
  *Aceptación:* librería de gráficas elegida y justificada; cero datos de ejemplo; usa la paleta de T-02; legible a 375 px; accesible (no solo color).
- [ ] **T-15** Core Web Vitals reales (`web-vitals` → tabla de eventos) + embudo de visitas → vista de proyecto → descarga de CV → clic en contacto. Rama `feat/analytics-real`.

### Fase 5 — Bot de Telegram y confiabilidad
- [ ] **T-16** Arreglo real del bot: ventana temporal en `pendingCount`, **no enviar si no hay nada que reportar**, `TELEGRAM_WEBHOOK_SECRET` en el schema zod con error visible, responder al `chat.id` del update, fallo ruidoso en vez de `console.warn`. Rama `fix/telegram-bot`.
  *Aceptación:* test por tipo de notificación; prueba de "día sin actividad" → **no** se envía mensaje; comandos `/leads`, `/conv`, `/reply`, `/auto`, `/help` respondidos; validación final contra credenciales reales marcada como pendiente de Omar.
- [ ] **T-17** Notificaciones nuevas con sentido: proyecto publicado, racha de commits en riesgo, caída de Core Web Vitals, lead real entrante. Rama `feat/telegram-events`.
- [ ] **T-18** Historial de versiones y restauración de contenido + modo borrador con vista previa. Rama `feat/content-versioning`.

### Fase 6 — Seguridad
- [ ] **T-19** Endurecimiento compatible con D-1: fix del bug de allowlist (`access.ts:17`), rate limiting en login, políticas RLS reales, caché de rol en middleware, MFA TOTP, auditoría de toda acción del panel. Rama `feat/auth-hardening`.
- [ ] **T-20** *(condicional a D-1)* Migración a AWS Cognito con puente de JWT. Rama `feat/cognito-auth`.

### Fase 7 — Extras profesionales
- [ ] **T-21** Sync GitHub → proyectos: repo nuevo detectado se propone como proyecto con stack ya identificado. Rama `feat/github-sync`.
- [ ] **T-22** Modo reclutador: CV en PDF generado desde los datos reales + registro de visitas por empresa. Rama `feat/recruiter-mode`.
- [ ] **T-23** Tests de regresión visual para que ningún cambio del dashboard rompa el portafolio público. Rama `test/visual-regression`.
- [ ] **T-24** Deuda técnica: `src/components/ui/Button.tsx` fuera del sistema de diseño; fuentes inexistentes en 7 paletas; `src/data/` vs `src/lib/` sin criterio; `(dashboard)/page.tsx` con 864 líneas y ~16 queries; `DeviceFrame.tsx` huérfano (decidir: borrar o recuperar). Rama `chore/tech-debt`.

---

## 6. Registro de avance

| Fecha | Tarea | Rama | Validaciones | Estado |
|---|---|---|---|---|
| 2026-11-12 | Análisis completo | — | — | ✅ |
| 2026-11-12 | Plan maestro | `docs/plan-maestro-dashboard` | — | ✅ |
| 2026-11-12 | T-01 Tokens de diseño | `feat/design-tokens` | typecheck · lint · 93 tests · CSS compilado | ✅ |
| 2026-11-12 | T-02 Paleta de datos | `feat/chart-palette` | typecheck · lint · 114 tests · 6 chequeos de color en oscuro y claro | ✅ |
| 2026-11-12 | T-03 Primitivos UI | `feat/admin-primitives` | typecheck · lint · 148 tests · clases verificadas en CSS compilado | ✅ |
| 2026-11-12 | T-04 Esquema del portafolio | `feat/portfolio-schema` | migración ejecutada en PostgreSQL 16 real · RLS probada con rol anon · 169 tests |  ✅ |
| 2026-11-12 | T-05a Módulos de datos | `feat/portfolio-source-modules` | typecheck · lint · 257 tests · conteos medidos en vivo | ✅ |
