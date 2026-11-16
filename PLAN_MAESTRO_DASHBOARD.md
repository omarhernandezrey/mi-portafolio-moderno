# Plan Maestro — Dashboard como motor real del portafolio

> Propietario: Omar Hernández Rey · Repo: `omarhernandezrey/mi-portafolio-moderno`
> Creado: 2026-11-12 · Última revisión: 2026-11-14 · Estado: **Fases 0 y 1 hechas; T-06 hecha; siguiente tarea: T-07**

Documento único de verdad. Toda tarea sale de aquí y se marca completada aquí.

**Si eres un agente que retoma este trabajo, lee en este orden:** §0 (dónde está todo), §3 (cómo se trabaja aquí: es obligatorio, no orientativo), §2 (lo que no se puede romper) y luego la ficha de tu tarea en §5. `CLAUDE.md`, `PRODUCT.md` y `DESIGN.md` completan el contexto.

---

## 0. Estado actual y cómo retomar

### Hecho y en `main`

| Tarea | Resultado |
|---|---|
| Análisis | §1 de este documento |
| T-01 | Tokens de radio, elevación, tipografía por rol, movimiento y glow |
| T-02 | Paleta de datos verificada (`--chart-*`, `src/lib/charts/palette.ts`) |
| T-03 | 11 primitivos de UI mobile-first en `src/components/admin/ui/` |
| T-04 | Esquema de 9 tablas `portfolio_*` con RLS real, ejecutado en PostgreSQL 16 |
| T-05a | Contenido inline extraído a `src/lib/portfolio/source/` |
| T-05b | Seed generado, validado en PostgreSQL y cargado en Supabase: 8 de 9 tablas |
| T-05c | Los 172 ítems de educación cargados en Supabase; `.env.local` auditado por nombres (sin bloqueos); tipos regenerados; respaldo semanal roto detectado |
| T-06 | `src/lib/portfolio/repository.ts`: lectura de las 8 tablas de contenido con respaldo a los módulos de origen y caché por etiqueta. `sobre-mi/page.tsx` ya no repite proyectos/skills/educación a mano |
| D-2 | Restos rotos del chatbot limpiados sin borrar datos (`match_projects()`, extensión `vector` fuera de `public`) |
| Entorno | `npm run env:check`: auditoría del `.env` por nombres, sin valores. `.env.example` y el código coinciden, y un test lo mantiene |
| Skills | Impeccable y kpi-dashboard-design instaladas; `PRODUCT.md`, `DESIGN.md`, `CLAUDE.md` |

### En curso, en ramas ya subidas a `origin`

| Rama | Tarea | Qué contiene | Qué falta |
|---|---|---|---|
| `fix/telegram-bot` | T-16 | Un commit `wip`: `sendTelegramMessage` con `chatId` y resultado tipado en `src/lib/chatbot/telegram.ts`; `TELEGRAM_WEBHOOK_SECRET` en el schema de `src/config/env.ts`. Compila | `daily-summary`, webhook, adaptar llamadores y **todos** los tests. Ver ficha T-16 |

Antes de continuar una rama en curso: `git fetch origin && git checkout <rama> && git rebase origin/main`, y lee su diff completo (`git diff origin/main...HEAD`). No asumas qué hace: compruébalo.

### Orden de ejecución recomendado

`T-07 → T-16 → T-19 → T-13 → T-08 → T-09 → T-10 → T-11 → T-12 → T-14 → T-15 → T-17 → T-18 → T-21 → T-22 → T-23 → T-25 → T-24`. T-20 solo si Omar confirma D-1.

El orden no es arbitrario: T-06 y T-07 cierran la columna vertebral de datos; T-16 y T-19 son arreglos independientes y urgentes (un bot que miente y un fallo de seguridad); T-13 debe ir antes de T-14 porque las gráficas necesitan datos reales acumulados.

### Bloqueos que solo Omar puede resolver

| Bloqueo | Afecta a | Mientras tanto |
|---|---|---|
| ~~Credenciales de Supabase~~ · **Resuelto el 2026-11-14**: los conectores de Supabase y Vercel están activos | — | La base real es accesible: se aplican migraciones, se consulta y se cargan datos. El `.env` del PC de Omar sigue siendo el único sitio con las claves para `npm run dev` en local |
| Decisión D-1 (§4): proveedor de autenticación | T-20 | T-19 se ejecuta igual: sirve para ambos caminos |
| Aplicar migraciones | — | Ya no es un bloqueo: se aplican con el conector. Cada migración debe seguir siendo idempotente, estar validada antes en PostgreSQL local (§3.5), y el archivo del repositorio debe quedar idéntico a lo aplicado |
| **Borrar datos de la base** | D-2 (restos del chatbot) | No se borra nada sin respuesta explícita de Omar |
| **Respaldo semanal roto** desde el 2026-10-25: faltan `BACKUPS_REPO`, `BACKUPS_REPO_TOKEN`, `BACKUP_PUBLIC_KEY` y `R2_BUCKET_NAME` en GitHub Secrets (medido el 2026-11-16 con `gh secret list`) | Cualquier tarea que modifique o borre datos existentes | Las tareas que solo añaden (seed, tablas nuevas) siguen. Omar pone los secretos y se relanza el workflow |
| `VERCEL_TOKEN` en `.env.local` parece un valor de plantilla (el CLI de Vercel lo rechaza: contiene `[` `]`) | Cruce de nombres con las variables de Vercel | No se pudo hacer ese cruce en T-05c. Pendiente: Omar genera un token real en vercel.com/account/tokens |

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
- `src/lib/supabaseServer.ts` usa **service_role (bypass RLS)** en casi todos los handlers, y 14 de las 16 tablas antiguas tienen RLS **sin ninguna política**: la seguridad depende por completo de la capa de aplicación. Verificado contra la base real (§1.6).
- Endpoints nuevos bajo `/api/admin` heredan el mínimo por omisión (`viewer`/`assistant`).
- Sin MFA. Sin rate limiting propio en el login.
- El middleware consulta el rol a Supabase en cada request (latencia y coste), y repite `getUser()` en 3 capas.

### 1.6 Estado real de Supabase (auditado el 2026-11-14 con el conector)

Proyecto `ozftxfwkhomnbvicjtae`, región `sa-east-1`, PostgreSQL 17.6, `ACTIVE_HEALTHY`. Antes de esta auditoría el estado de la base era una suposición; esto es lo medido.

**El chatbot está muerto y dejó restos.** Omar retiró el chatbot porque no funcionaba, y el código ya no está (no existe ninguna ruta `/api/chat*`). Pero en la base quedó todo:

| Resto | Dato |
|---|---|
| `conversations` | 519 filas · de 2026-04-16 a **2026-08-29** · 0 en los últimos 30 días |
| `messages` | 2 000 filas · última 2026-08-29 |
| `api_logs` | 2 007 filas · última 2026-08-29 (el estimador de Supabase decía 164: es `reltuples`, no un conteo) |
| `match_projects()` | Existe y **está rota**: consulta `project_embeddings`, tabla que no existe |
| Extensión `vector` | Instalada en el esquema `public`; el linter la marca |

**De dónde vienen los 41 leads.** Los 41 tienen `conversation_id`, y la primera lectura de ese dato fue equivocada: no significa que todos vinieran del chatbot. `src/lib/chatbot/contactBridge.ts` crea una fila en `conversations` por cada envío del formulario y de la calculadora, aunque no haya habido ninguna conversación. Agrupando por `intent`:

| Origen (`conversations.intent`) | Conversaciones | Con lead | Última |
|---|---|---|---|
| Chatbot (`null`) | 522 | **34** | 2026-08-26 |
| Calculadora (`budget_calculator`) | 4 | **4** | 2026-07-17 |
| Formulario (`contact_form`) | 3 | **3** | 2026-08-29 |

Así que el CRM **no se quedó sin entrada**: el formulario y la calculadora siguen registrando leads en el código. Lo que se perdió es la vía que más aportaba, 34 de 41. El ritmo del formulario es de 3 en cuatro meses, de modo que el hueco desde el 29 de agosto no prueba por sí mismo que esté roto; queda por comprobar de punta a punta (ver T-25).

**Y para T-16.** El cron `daily-summary` cuenta como pendientes los leads en estado `new` o `cold`: hay **0 nuevos y 1 frío** (reparto completo: `followed_up:35, archived:4, cold:1, contacted:1`). Ahí está la prueba directa de por qué el mensaje diario es idéntico: `pendingCount` vale 1 y no se moverá. Confirma el diagnóstico de §1.3 con datos reales.

**RLS y permisos.** De las 16 tablas antiguas, solo `admin_audit_logs` y `user_roles` tienen política (una cada una); las otras 14 tienen RLS activo y **cero políticas**, que es fallo cerrado y por tanto seguro hoy, pero deja la autorización entera en manos de la aplicación. Además `anon` y `authenticated` tienen concedidos `INSERT`, `UPDATE`, `DELETE` y `TRUNCATE` sobre todas las tablas de `public`: es la concesión por defecto de Supabase y RLS frena las tres primeras, pero **`TRUNCATE` no pasa por RLS**. No es alcanzable con la clave anónima porque PostgREST no expone esa operación, así que no hay fuga abierta; es deuda de defensa en profundidad, anotada en T-19 para las tablas antiguas y ya revocada en las del portafolio.

**Avisos del linter de Supabase** (ninguno de nivel ERROR): 14 × `rls_enabled_no_policy` (INFO), 7 × `function_search_path_mutable` (WARN), `extension_in_public` por `vector` (WARN), 4 × función `SECURITY DEFINER` ejecutable por `anon`/`authenticated` (WARN, sobre `get_auth_role` y `handle_new_user_role`), y protección de contraseñas filtradas desactivada (WARN). Revisadas las dos funciones marcadas: `get_auth_role()` devuelve el rol de `auth.uid()`, que para `anon` es nulo, y `handle_new_user_role()` es una función de trigger que falla si se la llama directamente. **No hay fuga de datos por ahí**, pero conviene revocar su `EXECUTE` en T-19.

**Resto del inventario.** Historial de migraciones vacío (coherente con aplicarlas a mano). Storage: `contracts` y `invoices` privados, `feed-images` público; 5 objetos. 1 usuario en `auth.users`, con `hernandezreyomar@gmail.com` = `owner`. `feed_posts`: 101 filas, todas `published`, última 2026-10-13 — el feed sí se usa, y `src/lib/feed.ts` lo lee con `supabaseServer` (service_role), que es por lo que `/comunidad` funciona aunque la tabla no tenga política.

**Correcciones al análisis original.** La columna de rol se llama `role`, no `rol`. `project_embeddings` figuraba como tabla existente y no existe. Y las políticas de `webhooks`, `webhook_logs` y `admin_audit_logs` que el análisis daba por hechas: solo existe la de `admin_audit_logs`.

**Decisión pendiente de Omar: D-2 (§4).** Qué hacer con los restos del chatbot.

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

## 3. Manual de ejecución — cómo se trabaja en este proyecto

Este manual existe para que cualquier agente ejecute las tareas con el mismo estándar con el que se hicieron las fases 0 y 1. No describe un estilo: describe los hábitos que evitaron errores concretos en este mismo repositorio. Cada regla trae el incidente que la justifica.

### 3.1 Los hábitos

**1. Mide, no estimes.** Toda cifra que escribas —en código, en un test, en este plan, en un commit— sale de un comando que ejecutaste, no de leer un archivo ni de un resumen ajeno.
*Incidente:* el primer análisis contó a ojo 24 proyectos, 173 ítems de educación, 15 insignias, 10 skills y 6 servicios. Al importar los módulos y medir `.length` eran 22, 172, 7, 8 y 4. El plan entero garantizaba «no perder nada» contra una base falsa. *Práctica:* para contar registros, importa el módulo con `npx tsx` y mide; si dos métodos discrepan, imprime los registros y zanja.

**2. Verifica contra el sistema real, no contra tu lectura.** SQL se ejecuta en PostgreSQL; un color se pasa por el validador; una clase de Tailwind se busca en el CSS compilado; un endpoint se llama.
*Incidente:* la migración de T-04 se ejecutó dos veces en PostgreSQL 16 y las políticas se probaron entrando con el rol `anon`. Leerla no habría demostrado que RLS bloquea de verdad.

**3. Cuando un test falla, decide primero quién se equivoca: el código o el test.** Nunca aflojes un umbral, borres una aserción o añadas una excepción para que pase.
*Incidentes:* un test de `Tabs` falló porque `scrollIntoView` no existe en jsdom: se arregló el componente (comprobar que existe), porque tampoco existe en algunos webviews. Un test de `Input` reveló que `aria-describedby` apuntaba a un elemento ausente: defecto real de accesibilidad, corregido en el componente. En cambio, dos umbrales puestos a ojo en el test de paleta estaban mal: se midió el valor real y se corrigió el test, explicando por qué.

**4. Los tests comprueban comportamiento, no implementación.** Qué pasa al pulsar, qué se anuncia a un lector de pantalla, qué devuelve la función con entradas límite. No clases CSS ni estructura interna.

**5. Deja un guardarraíl donde algo puede desviarse en silencio.** Si dos cosas deben coincidir (SQL y tipos, cifra declarada y contenido real, paleta y su valor), escribe el test que las compara.
*Existentes:* `portfolio-schema.test.ts` (SQL ↔ tipos), `portfolio-content-counts.test.ts` (conteos en vivo), `palette-lock.test.ts` (valores de las diez paletas), `visor-lock.test.ts` (huella de `Card.tsx`), `design-tokens.test.ts`, `chart-palette.test.ts`.

**6. Lee antes de escribir.** Antes de crear un archivo, abre uno vecino y copia sus convenciones: nombres, idioma de los comentarios, cómo se importa, cómo se manejan errores. Antes de tocar una función, busca quién la llama (`grep -rn`).

**7. El alcance de la tarea es el alcance del cambio.** Si encuentras otro problema, anótalo en T-24 o en el registro; no lo arregles de paso. Un diff que hace dos cosas no se puede revisar ni revertir.

**8. Explica el porqué, no el qué.** Comentarios y mensajes de commit dicen la razón de la decisión y el fallo que evita. «Entero 0..100: el símbolo % es presentación» sirve; «guarda el porcentaje» no.

**9. Informa con honestidad lo que no verificaste.** Si algo no pudo probarse (sin credenciales, sin red), se escribe así, con el motivo y con qué se sustituyó. Jamás «debería funcionar». Una afirmación sin evidencia se redacta como pendiente.

**10. Lo irreversible o ambiguo se pregunta; lo demás se decide y se anota.** Ver §3.7.

### 3.2 Ciclo obligatorio de una tarea

```
 1. git fetch origin && git checkout main && git pull --ff-only
 2. git checkout -b <rama indicada en la ficha>
 3. Lee la ficha completa (§5) y los archivos que nombra. Reproduce el
    problema o mide el estado inicial ANTES de cambiar nada.
 4. Si la tarea toca interfaz: carga la skill impeccable (ver CLAUDE.md).
 5. Implementa en commits pequeños. Escribe el test junto al código.
 6. npm run verify                     ← debe terminar en «TODO EN VERDE»
 7. Comprueba uno por uno los criterios de aceptación de la ficha.
 8. Si tocó interfaz: revísala a 375 px, luego 475, luego ≥1024.
 9. Marca la tarea [x] en §5, añade su fila en §6 con la evidencia
    y actualiza §0. Va en el mismo commit o en uno final de la rama.
10. git checkout main && git merge --ff-only <rama> && git push origin main
11. gh run watch                       ← el build real corre en GitHub Actions
12. Si CI falla: se arregla en una rama nueva. No se sigue con otra tarea.
```

Una tarea a medias se deja en su rama, subida a `origin`, con un commit `wip(...)` que diga qué está hecho y qué falta, y con su fila en la tabla «En curso» de §0. Nunca se mergea a medias.

### 3.3 Definición de terminado

Una tarea está terminada solo si **todo** esto es cierto:

- [ ] `npm run verify` termina en «TODO EN VERDE».
- [ ] Cada criterio de aceptación de la ficha se comprobó y su resultado consta en §6.
- [ ] Hay tests nuevos que fallarían si se revirtiera el cambio.
- [ ] Ninguna restricción de §2 fue tocada.
- [ ] Lo no verificado está escrito como pendiente, con su motivo.
- [ ] §5, §6 y §0 de este documento reflejan el estado real.
- [ ] Tras el merge, el workflow «Test Suite» de GitHub Actions pasó (tests y build).

### 3.4 Evidencia en el registro (§6)

Cada fila de §6 dice qué se ejecutó y qué salió, con números. Bien: «migración ejecutada 2 veces en PostgreSQL 16 · 9 tablas · anon ve 1 de 2 filas · 169 tests». Mal: «validado», «funciona», «todo correcto».

### 3.5 Recetas del entorno

**`npm run build` sin red.** `next/font` descarga de `fonts.googleapis.com` al construir. En el entorno cloud ese dominio está bloqueado y el build falla por red, no por código. No lo arregles ni lo declares hecho: `npm run verify` cubre typecheck, lint, tests y la compilación de Tailwind, y el build real lo ejecuta GitHub Actions en cada push a `main` (`gh run watch`, o `gh run list --workflow "Test Suite" --limit 3`).

**PostgreSQL local para validar SQL** (los binarios del servidor están en `/usr/lib/postgresql/16/bin`; `initdb` no corre como root):

```bash
PGBIN=/usr/lib/postgresql/16/bin
id -u pgtest >/dev/null 2>&1 || useradd -m pgtest
mkdir -p /tmp/pgdata /tmp/pgrun && chown pgtest /tmp/pgdata /tmp/pgrun
su pgtest -c "$PGBIN/initdb -D /tmp/pgdata -A trust"
su pgtest -c "$PGBIN/pg_ctl -D /tmp/pgdata -o '-k /tmp/pgrun -p 5433 -c listen_addresses=' -l /tmp/pg.log start"
su pgtest -c "$PGBIN/createdb -h /tmp/pgrun -p 5433 portafolio"
# Supabase trae estos roles; en local hay que crearlos para probar RLS:
su pgtest -c "$PGBIN/psql -h /tmp/pgrun -p 5433 -d portafolio -c 'create role anon nologin; create role authenticated nologin;'"
# Ejecutar una migración (copia a /tmp: pgtest no lee el repo):
cp supabase/migrations/ARCHIVO.sql /tmp/m.sql && chmod 644 /tmp/m.sql
su pgtest -c "$PGBIN/psql -h /tmp/pgrun -p 5433 -d portafolio -v ON_ERROR_STOP=1 -f /tmp/m.sql"
```

Toda migración se ejecuta **dos veces** (idempotencia) y sus políticas se prueban con `set role anon;`.

**Contar o inspeccionar datos del repo:** `npx tsx --tsconfig tsconfig.json script.ts` con imports `@/lib/...`.

**API de GitHub:** `gh api ...` está autenticado como `omarhernandezrey`.

**Tests de componentes:** el entorno por defecto de Jest es `node`. Un test que renderiza React empieza con el docblock `/** @jest-environment jsdom */` e importa `@testing-library/jest-dom`.

**Verificar que una clase de Tailwind existe:** escribe un HTML de prueba con la clase y compílalo con `npx tailwindcss -i src/app/globals.css -o /tmp/x.css --content /tmp/prueba.html`; luego `grep` en el resultado.

**Paleta de datos:** no se eligen colores nuevos. Si alguna vez hiciera falta, se recalculan en OKLCH y se pasan por el validador de la skill `dataviz` en modo oscuro (`#070c11`) y claro; nunca a ojo.

### 3.6 Delegar en subagentes

Sirve para trabajo independiente y bien delimitado. Reglas, aprendidas aquí:

- **Cada subagente en su propio clon**, no en el mismo directorio: las ramas de git comparten árbol de trabajo. `git clone --shared <repo> /ruta/clon && ln -s <repo>/node_modules /ruta/clon/node_modules`.
- **Archivos disjuntos.** Si dos tareas tocan el mismo archivo (p. ej. `src/config/env.ts`), solo una lo edita; la otra lee `process.env` con un `TODO` y lo reporta.
- **El encargo incluye:** ruta exacta de trabajo, rama, diagnóstico ya hecho, qué debe quedar, reglas duras, tests obligatorios, validación y formato del informe. Y que **no** haga merge ni push.
- **No confíes en su informe: verifícalo.** Vuelve a correr los tests tú, y comprueba las cifras que afirme. El subagente de análisis fue quien dio los conteos erróneos; el de extracción fue quien detectó que las insignias eran 7.
- Pídele que reporte sorpresas y lo que no pudo hacer, en vez de forzarlo.

### 3.7 Cuándo parar y preguntar a Omar

Se pregunta, y se espera, solo si se cumple alguna:

- La acción no se puede deshacer con `git revert` (borrar datos reales, rotar credenciales, cambiar de proveedor de auth).
- Contradice `PRODUCT.md`, `DESIGN.md` o una restricción de §2.
- Hay dos lecturas razonables del encargo que llevan a trabajos distintos y costosos.
- Requiere un secreto o un acceso que no está en el entorno.

En cualquier otro caso se elige la opción más conservadora, se anota la decisión y su razón en la ficha o en el commit, y se sigue. No se pide permiso para lo que el plan ya ordena.

### 3.8 Commits

Mensaje en español: `tipo(ámbito): qué cambia`, un cuerpo que explique **por qué** y qué fallo evita, y una línea final `Validado: ...` con lo ejecutado. Un commit `wip(...)` lista lo hecho y lo pendiente. Nunca se commitea un `.env`, una clave ni `.claude/settings.local.json`.

### 3.9 Herramientas de diseño del proyecto

Instaladas y versionadas el 2026-11-14 (ver `CLAUDE.md` para cómo se usan):

- **Impeccable** (`.claude/skills/impeccable`, Apache 2.0, motor 0.1.24) con sus 4 agentes en `.claude/agents/`. Lee `PRODUCT.md` (verdad de producto) y `DESIGN.md` + `.impeccable/design.json` (sistema visual existente, norte creativo «El Taller del Ingeniero»). Hook de detección activado en `.impeccable/config.json`.
- **kpi-dashboard-design** (`.claude/skills/kpi-dashboard-design`, MIT), para T-14 y T-15.

Decisiones confirmadas por Omar ese día y recogidas en `PRODUCT.md`: el objetivo del portafolio es **que lo contraten** (el visitante clave es un reclutador o líder técnico), y el CRM actual se conserva como **área secundaria «Negocio»**.

Línea base del detector sobre `src/app/admin` y `src/components/admin` (2026-11-14): 0 antipatrones bloqueantes; **1 aviso real** (`side-tab`: `border-l-4` en `src/app/admin/(dashboard)/docs/[slug]/page.tsx:27`) y **224 notas** de tamaños de letra literales fuera de la escala (`text-[9px]`, `text-[10px]`, `text-[11px]`), incluidos algunos de los primitivos de T-03. Se corrigen dentro de T-08 y T-24, no como efecto lateral.

Las gráficas no figuran entre los colores declarados en `DESIGN.md` a propósito: declararlas apagaba la comprobación de violetas y cian «de plantilla» del detector, que interesa mantener activa para la interfaz. La paleta de datos sigue definida y verificada en `src/app/globals.css` y `src/lib/charts/palette.ts`.

---

## 4. Decisión pendiente de Omar

### D-1 · Autenticación: AWS Cognito vs. Supabase Auth endurecido

Omar pidió AWS. Antes de ejecutar algo irreversible, los números:

**Migrar a Cognito implica:** romper el vínculo `user_roles.id → auth.users(id)` del que dependen las políticas RLS y `admin_audit_logs.actor_id`; firmar JWT de Cognito con el secreto de Supabase para que `auth.uid()` siga funcionando (posible pero frágil); montar User Pool, App Client y dominio; coste AWS; y reescribir las 3 capas de auth más `/auth/callback`.

**Recomendación técnica:** quedarse en Supabase Auth y endurecerlo — **MFA TOTP** (soportado nativamente), contraseña o passkey además del magic link, rate limiting propio en el login, arreglo del bug de allowlist (§1.4), políticas RLS reales y caché de rol en el middleware. Resultado: auth moderna y completa, sin migración de riesgo y sin coste nuevo.

**Si Omar confirma AWS igualmente**, se ejecuta como fase aislada al final, con rama propia, Cognito + MFA y puente de JWT hacia Supabase, para no bloquear el resto.

Hasta tener respuesta: **se implementa el endurecimiento compatible con ambos caminos** (fix de allowlist, rate limiting, políticas RLS, auditoría). Ningún trabajo se pierde con cualquiera de las dos decisiones.

### D-2 · Qué hacer con los restos del chatbot retirado

El chatbot se retiró del código, pero su rastro sigue en la base (§1.6): 519 conversaciones, 2 000 mensajes, 2 007 registros de API, la función rota `match_projects()` y la extensión `vector` en `public`. Nada de eso se usa.

**Borrar datos es irreversible y §2 prohíbe eliminar contenido, así que no se toca sin respuesta de Omar.** Las opciones:

| Opción | Qué implica |
|---|---|
| **A. Conservar todo** | No se toca nada. El coste es ruido: ~4 500 filas muertas, avisos del linter y tablas que confunden a quien lea el esquema. Es lo que pasa hoy. |
| **B. Archivar y limpiar** | Exportar las tres tablas a JSON (entregado a Omar y guardado fuera de la base) y solo entonces vaciar `conversations`, `messages` y `api_logs`. Los 41 leads **se conservan siempre**: son contactos reales, aunque llegaran por el chatbot. Además se borra `match_projects()` y se mueve `vector` fuera de `public`. |
| **C. Limpiar solo lo roto** | Borrar `match_projects()` y mover la extensión; dejar los datos. Quita avisos del linter sin perder nada. |

**Recomendación: C ahora, B cuando Omar confirme.** C no destruye nada. Los leads no se tocan en ninguna opción.

**Resuelto el 2026-11-14 (opción C).** `match_projects()` borrada y la extensión `vector` movida de `public` a `extensions`. Ningún dato se tocó: conversations 519, messages 2 000, api_logs 2 007 y leads 41, igual que antes. El linter lo confirma: `extension_in_public` desapareció y las funciones con `search_path` mutable bajaron de 7 a 6. Las dos sentencias se aplicaron por separado porque el conector pide aprobación interactiva para un `drop`, y un lote grande agota el tiempo de espera: **conviene aplicar lo destructivo en una sentencia suelta.** Vaciar las tablas del chatbot (opción B) sigue sin hacerse y sin decidirse.

Sobre la entrada de leads, Omar eligió **reconectarla**: ver T-25.

---

## 5. Tareas

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
  *Aplicada en Supabase el 2026-11-14* (proyecto `ozftxfwkhomnbvicjtae`, PostgreSQL 17.6): 9 tablas, 9 políticas, 9 triggers, 8 índices, `year` como `jsonb`, función con `search_path` fijo y escritura revocada a `anon`/`authenticated`. Tipos generados desde la base real en `src/types/database.types.ts`.
  *Validado antes contra un PostgreSQL 16.15 local:* dos pasadas sin error (idempotente) · 9 tablas, 8 índices `(is_published, position)`, 9 triggers de `updated_at`, 9 políticas, RLS activo en las 9 · con el rol `anon`: ve 1 de 2 filas (oculta el borrador), su `INSERT` es rechazado por la política y su `UPDATE`/`DELETE` afectan 0 filas · el `check` de `percentage` rechaza 150 · `technologies` conserva `{Next.js,React}` sin normalizar · el trigger de `updated_at` dispara.
  *Guardarraíl:* `__tests__/unit/portfolio-schema.test.ts` parsea el SQL y compara columna por columna con los tipos TS. Ya encontró una deriva real durante la propia tarea (el tipo declaraba `position` en `portfolio_profile`, que la tabla no tiene). 169 tests verdes, typecheck y lint limpios.
- [~] **T-05** Trasladar el contenido actual **sin pérdida**. Partido en dos porque la extracción tiene valor por sí sola.
  - [x] **T-05a** Arrays inline → módulos de datos puros en `src/lib/portfolio/source/`: `badges.ts` (7), `technologies.ts` (42), `timeline.ts` (4+4), `about.ts` (4+3), más `icon-registry.tsx` con 52 claves y `resolveIcon()`. Rama `feat/portfolio-source-modules`.
    *Por qué hacía falta antes del seed:* el contenido estaba incrustado en componentes y, peor, con **iconos en JSX** (lucide y react-icons), que no son serializables. Ahora cada icono es una clave de cadena que el registro resuelve al mismo componente de antes; `PortfolioIconKey` es la unión literal de claves, así que un typo no compila. Los componentes renderizan exactamente lo mismo: solo cambia de dónde vienen los datos.
    *Hallazgos durante la extracción:* (1) el `year` del 4.º hito está traducido (`2025 - Presente` / `2025 - Present`) pero `portfolio_timeline.year` es `text` sin idioma — el seed debe decidir o pasarlo a jsonb; (2) el `icon` del timeline **nunca se renderizaba** (el punto es un `div`), así que pasarlo a clave no cambia un pixel; (3) `personalData` no guardaba texto sino claves i18n (`t("about.personalData.name")`), así que se conservaron las claves y no el texto, para no desincronizarlo de `locales/{es,en}/common.json`.
    *Validado:* typecheck 0 errores · lint limpio · **257 tests** (74 de la extracción + 14 de conteos en vivo).
    *Deuda preexistente detectada, ajena a esta tarea:* `npx tsc -p tsconfig.jest.json` arroja 816 errores (`jsx: "react"` sin `import React`), idénticos antes y después. Jest no usa ese config (va por `next/jest` + SWC), así que no afecta a los tests, pero está anotado en T-24.
  - [x] **T-05b** Seed del contenido, en `feat/portfolio-seed`. Generador puro + SQL idempotente, validado en PostgreSQL y cargado en Supabase. Ver su ficha para el detalle y el único paso que queda.
  - [x] **T-05c** Cierre en la máquina de Omar: cargar los 172 ítems de educación, dejar el `.env` coherente y comprobar el build real. Ver su ficha.

---

### Fichas de las tareas pendientes

Cada ficha es autosuficiente: contexto, pasos, trampas ya conocidas, criterios de aceptación comprobables y la evidencia que debe quedar en §6. Los pasos son el camino recomendado, no una camisa de fuerza; los criterios de aceptación y las restricciones de §2 sí son obligatorios.

#### T-05b · Seed del contenido a la base de datos
**Rama:** `feat/portfolio-seed` · **Depende de:** T-04, T-05a · **Estado:** `[x]` salvo una pegada pendiente (ver «Lo que queda»)

**Objetivo.** Trasladar todo el contenido de los módulos TypeScript a las tablas `portfolio_*` sin perder un registro ni un carácter, de forma repetible.

**Diseño decidido.** El seed **genera un archivo SQL** (`supabase/seed/portfolio_seed.sql`) que Omar pega en el SQL Editor, igual que las migraciones. Así no depende de credenciales y se puede validar entero en PostgreSQL local. Tres piezas:
1. `src/lib/portfolio/seed/build.ts`: funciones **puras** que transforman los módulos fuente en filas (`buildSeedRows()`), sin E/S. Es lo que se testea.
2. `src/lib/portfolio/seed/sql.ts`: convierte filas en `insert ... on conflict (...) do update`, escapando literales y serializando `jsonb` y `text[]`.
3. `scripts/seed-portfolio.ts` (+ `npm run seed:portfolio`): escribe el `.sql`.

**Fuentes** (todas se importan, ninguna se transcribe): `src/lib/projectsData.ts`, `skillsData.ts`, `educationData.ts`, `servicesData.ts` y `src/lib/portfolio/source/{badges,technologies,timeline,about}.ts`.

**Transformaciones.**
- `slug`: derivado del texto en español, minúsculas, sin tildes, guiones; **con desambiguación determinista** (sufijo `-2`, `-3`…) porque entre 172 ítems de educación habrá colisiones. Las insignias ya traen `id`: úsalo como slug.
- `position`: el índice en el array original (para ítems de educación, índice dentro de su categoría).
- `percentage`: `"95%"` → `95`.
- Educación: `title`, `institution`, `duration`, `description` vienen unas veces como `{es,en}` y otras como cadena plana; normaliza la cadena plana a `{es: x, en: x}`.
- Timeline: hay dos arrays (`timelineEs`, `timelineEn`) alineados por índice; se funden en una fila con `year`, `title`, `description` bilingües e `icon_key`.
- Servicios: `priceRange` → `price_min`, `price_max`, `price_currency`.
- Tecnologías: `iconKey` → `icon_key`; conflicto por `name`.
- `interestsData` y `personalData` → dos filas de `portfolio_profile` (`section`: `interests`, `personal_data`). `personalData` guarda **claves i18n**, no texto: se conservan como claves.
- `technologies` de cada proyecto: el array tal cual, sin normalizar.

**Trampas.**
- No leas los archivos de datos para contar o copiar: impórtalos (hábito 1).
- `on conflict` debe usar la clave única real de cada tabla (`slug`, `name` en tecnologías, `section` en perfil); los ítems de educación necesitan el `id` de su categoría: resuélvelo en SQL con un `select` por slug de categoría, no con un UUID inventado en TypeScript.
- Las comillas simples dentro de los textos rompen el SQL si no se escapan. Prueba con un texto que las contenga.

**Aceptación.**
- [ ] Test unitario: `buildSeedRows()` produce exactamente los conteos de `CONTENIDO_ORIGINAL` (22 / 7 / 172 / 171 con certificado / 7 / 8 / 4 / 42 / 4).
- [ ] Test unitario: todos los slugs son únicos dentro de su tabla; el generador es determinista (dos ejecuciones, misma salida).
- [ ] El `.sql` generado corre en PostgreSQL local sobre la migración de T-04, y `select count(*)` de cada tabla coincide con los conteos.
- [ ] Corre **dos veces** y los conteos no cambian (idempotente).
- [ ] **Ida y vuelta:** se leen las filas de proyectos de la base local y, reconstruidas a la forma original, son idénticas (`deep equal`) a `projectsData`. Lo mismo para skills y servicios. Esta es la prueba real de «no se perdió nada».
- [ ] Con `set role anon` se leen las mismas cantidades (todo se publica por defecto).

**Resultado (2026-11-14).**

Implementado tal como se diseñó: `src/lib/portfolio/seed/build.ts` (puro, sin E/S), `src/lib/portfolio/seed/sql.ts` (generación de SQL) y `scripts/seed-portfolio.ts` (`npm run seed:portfolio`), que escribe `supabase/seed/portfolio_seed.sql` (176 KiB) y **falla si los conteos no cuadran** con `CONTENIDO_ORIGINAL` en vez de escribir un seed incompleto.

Validado en PostgreSQL 16 local: migración + seed **dos veces** sin error, con conteos exactos tras ambas pasadas (22 / 8 / 7 / 172 / 171 con certificado / 7 / 4 / 42 / 4 / 2 de perfil). RLS probada: con un proyecto en borrador, `anon` ve 21 de 22 y su `insert` lo rechaza la política.

**Ida y vuelta sin pérdida.** Se leyeron las filas de la base y se reconstruyó la forma original: proyectos, skills, servicios y los 172 ítems de educación resultan **idénticos** a `projectsData`, `skillsData`, `servicesData` y `educationData`. Un detalle que apareció aquí y conviene recordar: **`jsonb` de PostgreSQL no conserva el orden de las claves**, así que `{es,en}` vuelve como `{en,es}`. El dato es el mismo y el código accede por nombre, pero una comparación con `JSON.stringify` da falso negativo: la verificación tiene que ser canónica.

**Cargado en Supabase real:** 8 de las 9 tablas (22 proyectos, 8 skills, 7 categorías, 7 insignias, 4 servicios, 42 tecnologías, 4 hitos, 2 secciones de perfil). Verificado en la base: los 22 proyectos conservan su stack sin normalizar y el año del 4.º hito sigue bilingüe.

**Lo que queda: una sola pegada.** Los 172 ítems de educación son 130 KiB de SQL, demasiado para moverlos por esta conversación sin gastar contexto a lo tonto. Están en `supabase/seed/portfolio_seed_educacion.sql`, listos para pegar en el SQL Editor de Supabase. El archivo se validó en PostgreSQL local sobre la migración y las categorías ya cargadas: **172 ítems, 171 con certificado, 0 sin categoría, idempotente en dos pasadas**. Requiere que `portfolio_education_categories` esté poblada, y en la base real ya lo está. Alternativa equivalente: pegar `portfolio_seed.sql` completo, que al ser todo `on conflict do update` simplemente reescribe con los mismos valores lo ya cargado.

**Nota de proceso.** Al cargar las tablas en Supabase se omitieron los servicios en el primer lote y la verificación posterior lo detectó (`servicios 0`). Se corrigió en el acto. Es el argumento del hábito 2 del §3: la comprobación después de escribir no es ceremonia.

#### T-05c · Cierre de la carga y entorno coherente
**Rama:** `chore/t05c-cierre-entorno` · **Depende de:** T-05b · **Dónde:** en la máquina de Omar, no en la nube · **Estado:** `[x]`

**Por qué existe.** Quedan tres cosas que el entorno en la nube no puede hacer: mover 130 KiB de SQL a la base, leer el `.env` real y ejecutar `npm run build` (ahí `fonts.googleapis.com` está bloqueado). Omar además avisa de que su `.env` no corresponde con lo que existe hoy: sobrevivió al chatbot retirado y quizá a otro proyecto de Supabase. Construir T-06 en adelante sobre un entorno dudoso es perder el tiempo.

**Regla de esta tarea: del `.env` solo salen nombres.** No se hace `cat`, `grep` con valores, `echo $VAR` ni `printenv`. No se pega un valor en el chat, en un commit, en un log ni en este documento. La herramienta es `npm run env:check`, que imprime nombres y veredictos y está probada para no filtrar valores (`__tests__/unit/env-audit.test.ts`).

**Paso 1 · Cargar los ítems de educación.** El archivo es `supabase/seed/portfolio_seed_educacion.sql` (idempotente, resuelve `category_id` por slug; las 7 categorías ya están en la base). Por orden de preferencia:
1. Si hay conector de Supabase en la sesión: ejecutarlo con él.
2. Si el `.env` trae `SUPABASE_DB_URL` (conexión directa, puerto 5432) y hay `psql`: `set -a; . ./.env.local; set +a; psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/seed/portfolio_seed_educacion.sql`. La orden usa la variable sin mostrarla.
3. Si no: un script con `@supabase/supabase-js` y la `service_role` que haga `upsert` de las filas de `construirEducacion()` (`src/lib/portfolio/seed/build.ts`), resolviendo antes `slug → id` de las categorías.
4. Último recurso: Omar pega el archivo en el SQL Editor de Supabase.

Después, **medir en la base** (hábito 2): `portfolio_education_items` = 172, con certificado = 171, sin categoría = 0, y los conteos por categoría iguales a los de `educationData`. Ejecutar la carga una segunda vez y comprobar que los números no cambian.

**Paso 2 · Auditar el entorno.** `npm run env:check`. Lo que ya se sabe del repositorio (medido el 2026-11-14):
- El código lee 28 variables y `.env.example` documenta exactamente esas; un test lo mantiene así.
- Obligatorias según `src/config/env.ts`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `CRON_SECRET` (≥ 10 caracteres).
- Ningún archivo lee ya `GROQ_API_KEY`, `ADMIN_PASSWORD` ni `ADMIN_SECRET` ni ninguna clave de LLM: son restos del chatbot y del acceso antiguo por contraseña. Si aparecen en «nada las lee», son candidatas a retirar.
- El proyecto correcto de Supabase es `ozftxfwkhomnbvicjtae`. El informe dice si la URL apunta ahí y si cada clave es del tipo y del proyecto que su nombre indica (lee el `ref` y el `role` del JWT, sin mostrarlo).
- `TELEGRAM_WEBHOOK_SECRET` hace falta para que el webhook entrante deje de responder 503 (T-16). Si falta, se anota para T-16; el valor lo genera Omar.

Con el informe delante:
1. Copia de seguridad antes de tocar nada: `cp .env.local .env.local.bak-$(date +%Y%m%d)` (el patrón `.env*` de `.gitignore` ya la excluye; comprobar con `git status`).
2. **Bloqueos** (obligatoria sin valor, URL o clave de otro proyecto, clave intercambiada o caducada): se le explican a Omar por nombre y él pone el valor correcto desde el panel de Supabase o de Telegram. El agente no inventa ni «arregla» valores.
3. **Sobrantes**: se le listan a Omar y, con su visto bueno, se comentan con `# retirada 2026-11: nada la lee` en vez de borrarlas. Un `.env` no tiene historial de git.
4. **Faltantes opcionales** (Notion, Resend, Dev.to, Hashnode, pagos, verificaciones SEO): no bloquean; se anota cuáles faltan y qué función queda apagada.
5. Repetir `npm run env:check` hasta «sin bloqueos».
6. Mismo cruce, solo por nombres, con Vercel (`vercel env ls` o el conector) y con los secretos de GitHub (`gh secret list`): lo que el código lee debe existir en producción, y lo que nadie lee se propone retirar. Borrar un secreto remoto es decisión de Omar.

**Ya medido en GitHub Actions (2026-11-15), para no redescubrirlo:**
- **El respaldo semanal lleva roto desde al menos el 2026-10-25** (cuatro ejecuciones seguidas en rojo): `scripts/backup-supabase.sh` aborta en la línea 24 con «`BACKUPS_REPO` no está definido». Falta ese secreto en GitHub; el workflow también pide `BACKUPS_REPO_TOKEN`, `BACKUP_PUBLIC_KEY`, `SUPABASE_DB_URL` y los de Cloudflare R2. Es lo más grave de esta auditoría: **hoy la base no tiene copia reciente**. Solo Omar puede poner los secretos; hasta que el workflow pase en verde (`gh workflow run backup-weekly.yml` y `gh run watch`), no se ejecuta ninguna tarea que modifique o borre datos existentes.
- `check-limits.yml` llama cada 6 horas a `/api/cron/check-limits`, que vigila cuotas de proveedores de LLM (Groq, OpenRouter, Cerebras) leyendo `api_logs`. Es un resto del chatbot retirado: no hay tráfico que vigilar. Se le propone a Omar retirar el workflow y la ruta; si acepta, entra en T-16 (comparte `notifyTelegram`). No se borra sin su respuesta.
- Los otros cinco workflows programados apuntan a rutas que existen (`daily-summary`, `email-followup`, `cleanup-cold-leads`, `database-cleanup`, `health`).
- `test.yml` ya no pasa `GROQ_API_KEY`, `ADMIN_PASSWORD` ni `ADMIN_SECRET`. Los secretos con esos nombres siguen en GitHub sin que nada los use: se le propone a Omar borrarlos (`gh secret delete`).

**Paso 3 · Comprobar que el entorno sirve.** `npm run build` completo (aquí sí hay red) y `npm run dev`: la portada carga, `/admin` deja entrar a Omar y una lectura con la clave `anon` devuelve los 22 proyectos publicados. Si el build falla por algo que la nube no podía ver, se arregla aquí o se abre su tarea.

**Paso 4 · Cabos sueltos.**
- Borrar la rama remota obsoleta: `git push origin --delete feat/portfolio-seed` (desde la nube el servidor cortaba la conexión).
- Regenerar `src/types/database.types.ts` desde la base real: todavía declara la función `match_projects`, borrada en D-2. El test `database-types.test.ts` debe seguir en verde.
- `/impeccable hooks on` una vez en esta máquina.

**Trampas conocidas.**
- `jsonb` no conserva el orden de las claves: comparar contenido con `{es,en}` exige una comparación canónica, no `JSON.stringify`.
- El SQL Editor y `psql` ejecutan como propietario y se saltan RLS: que la carga funcione no demuestra que `anon` pueda leer. Comprobarlo con la clave `anon`.
- Si el `.env` apunta a otro proyecto, **no se carga nada** hasta corregirlo: se estaría escribiendo en la base equivocada.

**Criterios de aceptación — comprobados el 2026-11-16.**
- [x] 172 ítems, 171 con certificado, 0 sin categoría; medidos tras la 1ª y la 2ª carga (idéntico) con `psql` contra la base real. Por categoría: 1/1/1/2/8/73/86, igual que `educationData` (suman 172).
- [x] Confirmado también con la clave `anon` vía REST: `content-range: 0-171/172`. RLS no lo oculta.
- [x] `npm run env:check` termina en «sin bloqueos» en esta máquina. 0 obligatorias sin valor; proyecto de Supabase correcto (`ozftxfwkhomnbvicjtae`) en las 7 comprobaciones.
- [x] Encontré un hueco real en la auditoría: `.mcp.json` expande `${SUPABASE_ACCESS_TOKEN}` y `${SUPABASE_PROJECT_REF}` para el conector MCP, y el script no lo miraba — las marcaba como «sobrantes» por error. Corregido (`scripts/check-env.ts` ahora también lee `.mcp.json`) y cubierto por un test nuevo.
- [ ] **Pendiente de tu decisión** — 21 variables en `.env.local` que nada lee: `GROQ_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, y 19 más de proveedores de LLM (Cerebras, DeepSeek, HuggingFace, Mistral, Ollama, OpenRouter y 9 de Nvidia) y `LLM_PROVIDER_CHAIN`. Son restos del chatbot retirado (D-2). No las toqué: te las listo completas más abajo en el mensaje y tú decides si se comentan.
- [x] `npm run build` real ejecutado con el `.env.local` de esta máquina: termina sin errores (middleware + todas las rutas, estáticas y dinámicas). `npm run dev`: portada `200`, `/admin` `307` (redirige a login sin sesión, que es el comportamiento correcto), 22 proyectos publicados confirmados con la clave `anon`.
- [x] Ningún valor del `.env` apareció en el chat ni en un commit. `git status` solo mostró el `.bak` (ignorado por `.gitignore`) y los archivos de código que se listan en §6.
- [x] Rama `feat/portfolio-seed` borrada de `origin`. `src/types/database.types.ts` regenerado con la CLI de Supabase contra el proyecto real: `match_projects` ya no aparece.
- [ ] **Respaldo semanal: sigue roto.** `gh secret list` (autenticado con el token de `.env.local`) confirma que faltan 4 secretos: `BACKUPS_REPO`, `BACKUPS_REPO_TOKEN`, `BACKUP_PUBLIC_KEY`, `R2_BUCKET_NAME`. También sobran 3 que ningún workflow ya usa: `ADMIN_PASSWORD`, `ADMIN_SECRET`, `GROQ_API_KEY`. Anotado como bloqueo en §0; no se ejecuta nada que modifique o borre datos hasta que esté en verde.
- [ ] **Nuevo, no estaba en la ficha:** `VERCEL_TOKEN` en `.env.local` parece un valor de plantilla — el CLI de Vercel lo rechaza (contiene `[` y `]`), así que no pude cruzar las variables de Vercel. Anotado como bloqueo en §0.

**Evidencia en §6.** Conteos medidos en la base, resumen del informe **por número de variables en cada categoría** (sin valores), resultado del build y lo que Omar decidió retirar.

#### T-06 · Capa de lectura con respaldo
**Rama:** `feat/portfolio-data-layer` · **Depende de:** T-05b · **Estado:** `[x]`

**Objetivo.** Que el sitio público pueda leer su contenido de Supabase sin dejar de funcionar si la base no responde o está vacía.

**Hecho.** `src/lib/portfolio/repository.ts`: `getProjects()`, `getSkills()`, `getEducation()`, `getBadges()`, `getServices()`, `getTechnologies()`, `getTimeline()`, `getProfileSection()`. Cada una tiene una función `leerX(cliente)` testeable con un cliente simulado (sin `unstable_cache`, que necesita el runtime de Next y no existe en Jest) y una `getX()` pública sin argumentos que la envuelve en caché con etiqueta `portfolio:x`.

**Desviación consciente del paso 1 original:** no se lee con el cliente de `src/lib/supabase/server.ts` porque ese cliente llama a `cookies()` (sesión del admin), y Next marca como dinámica — y revienta — cualquier función envuelta en `unstable_cache` que llame a `cookies()`. Se creó `src/lib/supabase/public.ts`: la misma clave `anon`, sin cookies ni sesión, segura dentro de la caché. Documentado aquí para que quien lea el paso 1 y el código no los encuentre contradictorios sin explicación.

**Red de seguridad añadida, no pedida por la ficha pero necesaria para cumplir "el sitio nunca queda en blanco":** si ni siquiera se puede *construir* el cliente (p. ej. sin variables de Supabase, `createClient('', '')` lanza de forma síncrona antes de poder fallar como un error de consulta normal), cada `getX()` lo atrapa (`conProteccion`) y cae al mismo respaldo. Sin esto, la ausencia total de variables habría tirado la página en vez de mostrar el contenido de origen.

**Paso 4 (sobre-mi): dedup parcial, razonada.** `educationDataEs/En`, `projectsEs/En` y `coreSkillsEs/En` ya no retecleaban el contenido — y ya habían empezado a desviarse: la descripción de "DevOps & CI/CD" decía algo distinto ahí que en `skillsData` (confirmado y corregido: ahora sale la de `skillsData` en los dos idiomas). Ahora los hechos (título, institución, fechas, certificado, tecnologías, demo, repositorio, porcentaje, color) se leen con `getEducation()`/`getProjects()`/`getSkills()`/`getTimeline()`; las descripciones de educación y de proyectos, que en esta página son un resumen más corto que el de la ficha completa, se dejaron como prosa propia (reescribirlas por el texto largo habría sido cambiar contenido sin que Omar lo pidiera). `servicesEs/En` **no se tocó**: no es el mismo contenido que `servicesData` (es un menú de 5 categorías con icono JSX y `href` a `/servicios/*`, no las 4 tarjetas con precio), así que no había duplicación real que resolver ahí.

**Trampas confirmadas.** Los componentes de sección (`SkillSection`, `ServicesSection`, etc.) siguen con sus arrays estáticos — T-06 no los tocó; solo `sobre-mi/page.tsx`, que es la duplicación que la ficha nombraba explícitamente. Si una tarea futura (T-09 a T-12 invalidan con `revalidateTag`) necesita que esas secciones también reflejen ediciones del panel, hace falta wirearlas al repositorio: no estaba en esta ficha y queda anotado para no perderlo.

**Aceptación.**
- [x] Tests del repositorio con Supabase simulado: fila → forma original correcta; error → respaldo; cero filas → respaldo; orden por `position`. 23 tests en `__tests__/unit/portfolio-repository.test.ts`, uno por tipo de contenido más los guardarraíles de `service_role`.
- [x] Test que compara, para proyectos, la salida del repositorio con base poblada (datos del seed, vía `construirProyectos()`) contra `projectsData`: los 22, idénticos (`toEqual`).
- [x] Sin variables de Supabase, la home (y `/sobre-mi`) no se queda en blanco: `crearClientePublico` mockeado para lanzar como lo haría sin URL, las 8 `getX()` caen a su contenido de origen — probado, no solo documentado.
- [x] Ninguna consulta nueva usa `service_role`: `src/lib/supabase/public.ts` usa `NEXT_PUBLIC_SUPABASE_ANON_KEY`; guardarraíl que falla si alguien importa `supabaseServer` en el repositorio.

**Validado además:** `npm run build` real contra la base real generó `/es/sobre-mi` y `/en/sobre-mi` como HTML estático (●), o sea que la cadena completa — repositorio, caché, Supabase — funciona de punta a punta, no solo en los mocks de Jest. Revisión visual: confirmado en el navegador a tamaño de escritorio (~1093 px) que las tres secciones muestran el contenido correcto (la descripción de DevOps corregida, el título de "Shopi" y "Diccionario Dev" con el guion normal de `projectsData` en vez del guion largo que tenía el duplicado). **Pendiente de validación:** no se pudo forzar un viewport de 375 px real en esta sesión (`resize_window` no cambió `window.innerWidth` en este entorno); no se tocó ninguna clase ni el JSX de la página — el cambio es solo de dónde salen los datos —, así que el riesgo de ruptura en móvil es bajo, pero queda pendiente confirmarlo a simple vista en un teléfono o en el DevTools de un navegador normal.

**Evidencia en §6:** conteo de tests nuevos y resultado de la comparación.

#### T-07 · El visor de proyectos lee de la base
**Rama:** `feat/projects-from-db` · **Depende de:** T-06 · **Estado:** `[ ]`

**Objetivo.** Los proyectos del visor salen de `getProjects()`. **`src/components/shared/Card.tsx` no cambia ni una línea** (`npm run verify` lo comprueba).

**Pasos.**
1. Lee `src/components/sections/ProjectsSection.tsx` entero: paginación de 4, búsqueda sobre título + descripción + tecnologías, y la `key` de React (hoy basada en el título).
2. La página de servidor obtiene los proyectos y los pasa a `ProjectsSection`. Se sigue usando `getLocalizedProjectsData` (respaldo a `es`) para entregar a `Card` exactamente `{ title, description, technologies, repository, demo, category? }` con cadenas ya localizadas.
3. Cambia la `key` a `slug` (en `ProjectsSection`, no en `Card`).
4. Comprobador de embebido: una función de servidor que hace `fetch` al `demo` y lee `X-Frame-Options` y la directiva `frame-ancestors` de `Content-Security-Policy`; el resultado se guarda en `demo_embeddable` y `demo_checked_at`. Se ejecutará desde el panel (T-09); aquí solo la función y sus tests.

**Aceptación.**
- [ ] `git diff origin/main -- src/components/shared/Card.tsx` vacío.
- [ ] Test: los 22 proyectos llegan a `Card` con las mismas props que antes del cambio (compara contra `getLocalizedProjectsData(projectsData, 'es')` y `'en'`).
- [ ] Test: búsqueda y paginación devuelven lo mismo que antes para tres consultas de ejemplo.
- [ ] Tests del comprobador: `X-Frame-Options: DENY`, `SAMEORIGIN`, `frame-ancestors 'none'`, sin cabeceras, y error de red (este último **no** marca el demo como no embebible: marca «sin comprobar»).
- [ ] Revisión visual a 375 px y en escritorio: el visor se ve y se toca igual. Si el entorno no puede levantar el sitio, se declara pendiente de validación visual.

#### T-16 · Bot de Telegram que solo avisa de lo real
**Rama:** `fix/telegram-bot` (existe, 1 commit `wip`) · **Depende de:** nada · **Estado:** `[~]`

**Diagnóstico** (§1.3): plantilla fija con ceros en `daily-summary`, `pendingCount` acumulativo sin ventana, y webhook entrante en 503 mudo.

**Ya hecho en la rama** (léelo y verifícalo antes de seguir): `sendTelegramMessage(text, chatId?)` con resultado `{ sent, reason }` y motivos estables en `src/lib/chatbot/telegram.ts`; `TELEGRAM_WEBHOOK_SECRET` en el schema zod con aviso explícito en `src/config/env.ts`.

**Falta.**
1. Confirmar que `notifyTelegram` sigue existiendo con una firma compatible: hay **26 llamadas en 15 rutas** (`grep -rn "notifyTelegram" src`). Ninguna debe cambiar de comportamiento.
2. `src/app/api/cron/daily-summary/route.ts`: si ayer no hubo leads nuevos, ni pagos, ni pendientes que hayan cruzado un umbral, **no se envía nada** y la ruta responde `{ skipped: true, reason }`. Si hay algo, el mensaje se arma por secciones condicionales; no aparecen `N/A`, `0 leads` ni `Sin pagos confirmados`.
3. `pendingCount` con ventana temporal; los antiguos se informan con contexto («3 llevan más de 48 h»), no como un número suelto que se repite a diario.
4. `src/app/api/telegram/webhook/route.ts`: responder al `chat.id` del update; sin `TELEGRAM_WEBHOOK_SECRET`, error registrado y distinguible.
5. Revisar los otros crons que notifican (`email-followup`, `cleanup-cold-leads`, `check-limits`, `database-cleanup`) con la misma pregunta: ¿envían aunque no haya nada que decir?

**Aceptación** (tests con `fetch` y Supabase simulados; nunca se llama a Telegram de verdad):
- [ ] Día sin actividad → cero llamadas a la API de Telegram.
- [ ] Día con leads → se envía y el texto contiene los números reales.
- [ ] Día con pagos y sin leads → sección de pagos presente, sección de leads ausente.
- [ ] Sin credenciales → `sent: false` con motivo; no lanza.
- [ ] Respuesta 400 de Telegram → reintento en texto plano (comportamiento actual, se conserva).
- [ ] Webhook sin secreto → error identificable. Webhook con update → responde a ese `chat.id`.
- [ ] `grep` de `N/A` y `Sin pagos confirmados` en `src/app/api/cron` no devuelve plantillas fijas.

**Pendiente de validación con credenciales:** un envío real y los comandos `/leads`, `/conv`, `/reply`, `/auto`, `/help` desde Telegram.

#### T-19 · Endurecimiento de la autenticación
**Rama:** `feat/auth-hardening` · **Depende de:** nada · **Estado:** `[ ]`

Se queda en Supabase Auth. **No se instala ningún SDK de AWS** (eso es T-20, condicional). Por orden de gravedad:

1. **Fallo de seguridad, lo primero.** `src/lib/admin/access.ts` (~L17): con `ADMIN_ALLOWED_EMAILS` vacío, `isEmailAllowed()` devuelve `true`. Debe fallar **cerrado**. Como eso puede dejar fuera a Omar si la variable falta, el error tiene que ser explícito en logs («ADMIN_ALLOWED_EMAILS no configurada: el panel queda cerrado») y la variable, documentada en `.env.example`. Reproduce el fallo con un test **antes** de corregirlo.
2. **Límite de intentos en el login** por IP + correo, ventana corta. Si se implementa en memoria, un comentario debe decir por qué no basta en serverless con varias instancias y qué haría falta (tabla en Supabase).
3. **Caché del rol** en `src/middleware.ts` con TTL corto: hoy cada petición a `/admin/*` consulta el rol en Supabase y `getUser()` se repite en tres capas. El TTL es el coste aceptado; se documenta.
4. **Auditoría completa:** revisar cada endpoint de escritura de `/api/admin/**` (lista en §1.4 del análisis original y con `grep -rn "requireAdmin" src/app/api`) y registrar los que no llamen a `src/lib/admin/audit.ts`.
5. **MFA TOTP** con `supabase.auth.mfa.*` para el rol `owner`: alta y verificación. Interfaz con los primitivos del panel y la skill `impeccable`.
6. **Deuda de la base, medida en §1.6** (migración nueva, idempotente, validada antes en PostgreSQL local): revocar `insert, update, delete, truncate` a `anon` y `authenticated` en las 16 tablas antiguas —comprobando primero con `grep` que ningún código cliente escriba con la clave anónima—; revocar `execute` de `get_auth_role()` y `handle_new_user_role()` a esos roles; y añadir `set search_path = ''` a las 7 funciones que el linter marca. Al terminar, volver a pedir los avisos del linter y anotar en §6 cuántos quedan.
7. Activar en la consola de Supabase la **protección de contraseñas filtradas**. Lo hace Omar: es un ajuste de consola, no código.

**Trampas.** Tres capas comprueban el acceso (middleware, `layout.tsx` del panel, `requireAdmin`): un cambio en una sola deja las otras con la lógica vieja. El login actual por enlace mágico tiene que seguir funcionando.

**Aceptación.**
- [ ] Test: allowlist vacía → `false`. Con correo presente → `true`; ausente → `false`; mayúsculas y espacios normalizados.
- [ ] Test: N intentos permitidos, el N+1 bloqueado, se libera al pasar la ventana (con reloj simulado).
- [ ] Test: segunda lectura de rol dentro del TTL no consulta Supabase; pasado el TTL, sí.
- [ ] Test: `viewer` no puede escribir; un endpoint no listado cae al mínimo.
- [ ] Lista, en el commit, de los endpoints a los que se añadió auditoría.

**Pendiente de validación con credenciales:** el flujo completo de MFA contra Supabase real. Se dice así; no se da por hecho.

#### T-13 · Métricas reales de GitHub
**Rama:** `feat/github-metrics` · **Depende de:** nada (T-14 depende de esta) · **Estado:** `[ ]`

**Decisión de arquitectura, obligatoria.** El panel lee **de Supabase**, nunca de la API de GitHub en vivo. La ingesta la hace un trabajo programado. Así la carga es instantánea y no hay límite de peticiones a la vista del usuario.

**Construir.**
1. `src/lib/github.ts`: cliente tipado, sin `any`. Por repositorio: commits, líneas añadidas y eliminadas, lenguajes por bytes, estrellas, forks, PR abiertos y cerrados, actividad diaria, rachas.
2. Migración `supabase/migrations/AAAAMMDD_github_metrics.sql` con el patrón de T-04: minúsculas, idempotente, RLS **con política real** de lectura y sin política de escritura. Histórico acumulable: una fila por repositorio y fecha de captura, índice por fecha.
3. `src/app/api/cron/github-metrics/route.ts` protegido con `requireCronAuth` (`src/lib/cronAuth.ts`), que escribe con `supabaseServer`.
4. `.github/workflows/github-metrics.yml`. Este repo **no usa Vercel Cron**: los trabajos programados son workflows que hacen `curl -H "Authorization: Bearer $CRON_SECRET"`. Copia el patrón de uno existente y elige una hora que no choque con las ya usadas (13:00, 14:00, 00:00 UTC y cada 6 h).
5. `GITHUB_TOKEN` en `.env.example` (con los permisos mínimos que necesita) y en el schema de `src/config/env.ts`.

**Trampas de la API, verificadas en su documentación; compruébalas con `gh api`:**
- Los endpoints `/stats/commit_activity`, `/stats/code_frequency` y `/stats/contributors` responden **202 con cuerpo vacío** la primera vez, mientras GitHub calcula. Eso **no** es «cero commits»: se reintenta con espera.
- Paginación por cabecera `Link`; no todo cabe en una página.
- Cabeceras `x-ratelimit-remaining` y `x-ratelimit-reset`: parar antes de agotar el cupo, con un error claro.

**Aceptación** (tests con `fetch` simulado):
- [ ] 202 con cuerpo vacío → reintenta; nunca devuelve cero.
- [ ] Cupo casi agotado → se detiene con error claro.
- [ ] Dos páginas se concatenan bien.
- [ ] Lenguajes: bytes → porcentajes que suman 100.
- [ ] Rachas: días consecutivos cuentan; un hueco corta la racha; se respeta la zona horaria `America/Bogota`.
- [ ] El cron sin `CRON_SECRET` válido responde como el resto de crons.
- [ ] Migración ejecutada dos veces en PostgreSQL local; RLS probada con `anon`.
- [ ] **Una verificación real fuera de Jest:** un script que llama a la API con `gh` para un repositorio y comprueba que el parser da las mismas cifras. Las cifras obtenidas se anotan en §6.

#### T-08 · Nuevo shell del panel, mobile-first
**Rama:** `feat/dashboard-shell` · **Depende de:** nada · **Skills:** `impeccable` (obligatoria) · **Estado:** `[ ]`

**Objetivo.** Reorganizar la navegación del panel en dos áreas: **Portafolio** (el motor: contenido y métricas) y **Negocio** (el CRM actual, completo e intacto). Decisión de Omar recogida en `PRODUCT.md`.

**Antes de escribir código.** Ejecuta `impeccable context`, luego `/impeccable shape` sobre el shell para planear la navegación a 375 px, y lee `reference/craft-floor.md` justo antes de editar. Es una superficie **Operate**: precisión y sobriedad. No se crea un mundo visual nuevo; se extiende el de `DESIGN.md`.

**Archivos.** `src/lib/admin/permissions.ts` (`NAV_ITEMS`, ~L84-104, y la matriz de permisos), `src/components/admin/AdminNav.tsx`, `src/app/admin/(dashboard)/layout.tsx`, `src/app/admin/(dashboard)/page.tsx` (864 líneas y ~16 consultas: es el resumen actual del CRM).

**Requisitos.**
- A 375 px el panel se maneja con una mano: los destinos principales al alcance del pulgar.
- Los 12 destinos actuales siguen existiendo y accesibles bajo «Negocio»; ninguna ruta cambia de URL.
- `AdminNav` conserva lo que ya hace bien: foco atrapado en el cajón, cierre con Escape, `aria-expanded`, enlace de salto.
- El resumen actual del CRM pasa a ser la portada de «Negocio»; la portada del panel será el resumen del portafolio (se rellena en T-14; aquí puede quedar un estado vacío honesto, sin cifras de ejemplo).
- Se corrigen los tamaños de letra fuera de escala **solo en los archivos que esta tarea toque** (el detector los señala).

**Aceptación.**
- [ ] Tests: los 12 destinos siguen en la navegación; el filtrado por rol no cambió (`viewer`, `assistant`, `owner`).
- [ ] Tests de `AdminNav`: abrir y cerrar el cajón, Escape, foco.
- [ ] Detector sin antipatrones nuevos (`npm run verify`).
- [ ] `/impeccable critique` sobre el resultado, y sus hallazgos materiales resueltos o anotados.
- [ ] Revisión a 375, 475 y ≥1024 px.

#### T-09 a T-12 · Módulos de edición de contenido
**Ramas:** `feat/module-projects` (T-09), `feat/module-skills` (T-10), `feat/module-education` (T-11), `feat/module-content` (T-12: servicios, tecnologías, timeline, perfil) · **Dependen de:** T-06, T-08 · **Skills:** `impeccable` · **Estado:** `[ ]`

Los cuatro siguen el mismo patrón; **T-09 lo establece y los demás lo copian**. Haz T-09 completo y con cuidado antes de empezar otro.

**Patrón por módulo.**
1. **API** en `src/app/api/admin/portfolio/<recurso>/route.ts` y `.../[id]/route.ts`: `GET` (lista, incluye borradores), `POST`, `PATCH`, `DELETE`, y `PATCH .../reorder`. Cada handler: `requireAdmin('owner')` para escribir, validación con **zod** de todo el cuerpo, escritura con `supabaseServer`, registro en `src/lib/admin/audit.ts`, y `revalidateTag` de la etiqueta de T-06. Añade las rutas a la matriz de `src/lib/admin/permissions.ts`: por omisión una ruta nueva hereda el permiso mínimo.
2. **Validación compartida** en `src/lib/portfolio/schemas.ts` (zod), usada por la API y por el formulario.
3. **Interfaz** con los primitivos de `src/components/admin/ui/`: `DataTable` para la lista (tarjetas en móvil), `Dialog` para crear y editar, `ConfirmDialog` con tono `danger` para borrar, `Switch` para publicar, `Tabs` para alternar español e inglés en los campos bilingües.
4. **Reordenar** con botones subir/bajar (accesibles y fiables en táctil). El arrastre es opcional y nunca el único camino.
5. **Estados:** cargando (`Skeleton`), vacío, error de red con reintento, y guardado optimista que se revierte si falla.

**Específico.**
- **T-09 Proyectos:** al guardar un `demo`, ejecutar el comprobador de embebido de T-07 y avisar si el sitio bloquea iframes, antes de publicar. `technologies` se elige de una lista con las claves de `src/config/technologyIcons.tsx`, para garantizar la coincidencia literal que necesitan los iconos; se puede añadir una tecnología sin icono, pero avisando de que saldrá como texto.
- **T-10 Skills:** `percentage` entero 0–100; el color es un campo del registro (`color_hex`), dato del contenido, no un color de la interfaz.
- **T-11 Educación e insignias:** categorías e ítems; imagen por **archivo** (Supabase Storage) o por **URL**. Para una URL externa hay que añadir su dominio a `remotePatterns` en `next.config.mjs`: decide una lista cerrada de dominios y documenta cómo ampliarla. Borrar una categoría arrastra sus ítems (`on delete cascade`): el diálogo debe decir cuántos.
- **T-12:** servicios, tecnologías del marquee (el `name` debe coincidir con una clave de icono; `icon_key` se elige del registro `src/lib/portfolio/source/icon-registry.tsx`), timeline y secciones de perfil.

**Aceptación por módulo.**
- [ ] Tests de API: sin sesión → 401; `viewer` → 403 al escribir; cuerpo inválido → 400 con el campo señalado; alta, edición, borrado y reordenación correctos; cada escritura deja registro de auditoría e invalida la caché.
- [ ] Tests de interfaz: crear, editar, publicar/despublicar, reordenar, cancelar un borrado, confirmar un borrado.
- [ ] Un borrador no aparece en el sitio público (lo garantiza RLS; se comprueba con el rol `anon` en PostgreSQL local).
- [ ] Ningún hex literal en los componentes nuevos; detector sin antipatrones nuevos.
- [ ] Revisión a 375 px: todo el flujo se completa con el pulgar.

**Pendiente de validación con credenciales:** el ciclo completo contra la base real y la subida de archivos a Storage.

#### T-14 · Resumen del portafolio con gráficas reales
**Rama:** `feat/metrics-dashboard` · **Depende de:** T-13 (con datos ya ingeridos), T-08 · **Skills:** `kpi-dashboard-design`, `dataviz`, `impeccable` · **Estado:** `[ ]`

**Antes de escribir código.** Con `kpi-dashboard-design`, define y anota en esta ficha los **4 a 6 KPI de cabecera** y qué contexto lleva cada uno (comparación con el periodo anterior, tendencia u objetivo). Candidatos reales: commits de los últimos 30 días, racha actual, repositorios activos, lenguaje principal, despliegues, y —cuando exista T-15— visitas y clics de contacto. Con `dataviz`, elige la forma de cada gráfica **antes** que el color.

**Decisiones a tomar y justificar en el commit.**
- Librería de gráficas. Criterios: SVG (para usar `var(--chart-n)` y heredar la paleta), peso en el bundle, accesibilidad, y que funcione con componentes de servidor o se cargue de forma diferida. Mide el peso real añadido; no lo supongas.

**Gráficas previstas.** Actividad diaria (línea o barras, un solo eje), mapa de calor de contribuciones con rachas (rampa secuencial `sequentialStep`), lenguajes por bytes (barras ordenadas; nunca tarta de muchas porciones), commits por repositorio (`assignSeriesColors`, de la novena serie en adelante «Otros»).

**Reglas.** Cero datos de ejemplo: si no hay datos ingeridos, estado vacío que lo dice y explica cómo se llenará. Un solo eje por gráfica. Cifras y etiquetas en color de texto, no en el de la serie. Leyenda siempre que haya dos o más series. Capa de hover y alternativa en tabla. Legible a 375 px. En superficie clara `--chart-8` exige etiqueta visible.

**Aceptación.**
- [ ] Los KPI y su contexto quedaron anotados aquí antes de implementar.
- [ ] Tests: transformaciones de datos (agregación diaria, rachas, porcentajes) y estado vacío.
- [ ] `grep` sin datos de ejemplo en los componentes de métricas.
- [ ] `/impeccable critique` y `audit` sobre la vista; hallazgos resueltos o anotados.
- [ ] Peso añadido al bundle, medido y anotado en §6.

#### T-15 · Rendimiento real y embudo
**Rama:** `feat/analytics-real` · **Depende de:** T-14 · **Estado:** `[ ]`

`web-vitals` en el cliente → endpoint propio → tabla de eventos (migración con el patrón de T-04; aquí la escritura anónima necesita una política de `insert` muy acotada o pasar por un endpoint con límite de tasa: decide y justifica). Embudo: visita → vista de proyecto → descarga de CV → clic de contacto, reutilizando los `track()` de `@vercel/analytics` que ya existen en 5 componentes. LCP, INP y CLS separados por móvil y escritorio. **No se recoge ningún dato personal**: ni IP en claro ni identificadores persistentes; se documenta qué se guarda.
**Aceptación:** tests del endpoint (carga útil válida e inválida, límite de tasa) y de la agregación; migración validada dos veces en PostgreSQL local.

#### T-17 · Notificaciones con sentido
**Rama:** `feat/telegram-events` · **Depende de:** T-16, T-13 · **Estado:** `[ ]`

Eventos nuevos: proyecto publicado desde el panel, racha de commits a punto de romperse, caída sostenida de un Core Web Vital, lead real entrante. Misma regla que T-16: **sin novedad no hay mensaje**; cada evento con su test de «se envía» y de «no se envía», y con protección contra duplicados.

#### T-18 · Borradores, vista previa e historial
**Rama:** `feat/content-versioning` · **Depende de:** T-09 a T-12 · **Skills:** `impeccable` · **Estado:** `[ ]`

Tabla de versiones (quién, cuándo, antes y después en `jsonb`) escrita en cada guardado; restaurar una versión es un guardado más y queda auditado. Vista previa de un borrador mediante el modo borrador de Next.js, accesible solo con sesión de `owner`.
**Aceptación:** tests de crear versión, restaurar y que un `anon` no puede leer versiones ni borradores.

#### T-20 · Migración a AWS Cognito *(condicional a D-1)*
**Rama:** `feat/cognito-auth` · **Estado:** bloqueada hasta que Omar decida.

No se empieza sin confirmación explícita. Si se confirma: fase aislada, con plan de reversión escrito antes de tocar código, y sin romper `user_roles` ni `admin_audit_logs`.

#### T-21 · Sincronización GitHub → proyectos
**Rama:** `feat/github-sync` · **Depende de:** T-13, T-09

Un repositorio nuevo detectado en la ingesta se **propone** en el panel como borrador de proyecto, con el stack deducido de sus lenguajes. Nunca se publica solo.

#### T-22 · Modo reclutador
**Rama:** `feat/recruiter-mode` · **Depende de:** T-06 · **Skills:** `impeccable`

CV en PDF generado desde los datos reales (`pdf-lib` ya está instalado). Sirve directamente al objetivo de `PRODUCT.md`: que lo contraten. Titular: «Ingeniero de Software» primero. El registro de visitas por empresa solo si puede hacerse sin datos personales; si no, se descarta y se anota por qué.

#### T-23 · Regresión visual
**Rama:** `test/visual-regression` · **Depende de:** T-07

Capturas de referencia de la home (incluido el visor de proyectos) y del panel a 375 y 1280 px, con Cypress, que ya está en el repo. El visor es el caso más importante.

#### T-25 · Comprobar y reforzar la entrada de leads
**Rama:** `feat/entrada-leads` · **Depende de:** nada · **Estado:** `[ ]` · **Decidido por Omar el 2026-11-14**

**Punto de partida, medido (§1.6).** El formulario (`src/components/sections/ContactForm.tsx` → `src/app/api/contact/bridge/route.ts` → `registerContactFormLead` en `src/lib/chatbot/contactBridge.ts`) y la calculadora **sí crean leads**; aportaron 7 de los 41. El chatbot aportaba 34 y ya no existe. El último lead del formulario es del 2026-08-29, pero con un ritmo de 3 en cuatro meses ese hueco no demuestra avería: **lo primero es comprobarlo, no suponerlo**.

**Pasos.**
1. **Reproducir antes de cambiar.** Enviar el formulario contra la base real y ver si aparece el lead. Si falla, leer el log de Vercel (`get_runtime_logs`) para esa ruta y arreglar la causa. Si funciona, decirlo en el informe: el problema era solo que nadie escribió.
2. **Quitar la conversación falsa.** `contactBridge` inserta una fila en `conversations` por cada envío solo para colgar de ella el lead. Eso deja el origen del lead escondido en `intent` y ensucia una tabla de chatbot que ya no se usa. Añadir a `leads` una columna `source text` (valores `contact_form`, `budget_calculator`, `chatbot`, `manual`) con migración idempotente, rellenarla desde `conversations.intent` para las 41 filas existentes, y dejar de crear conversaciones sintéticas. `conversation_id` se conserva por histórico.
3. **Notificación que sirva.** El aviso de lead nuevo a Telegram debe traer nombre, correo, servicio pedido y origen. Coordinado con T-16.
4. **Revisar la calculadora** (`/api/calculator`) con el mismo criterio.

**Aceptación.**
- [ ] Prueba de punta a punta del formulario contra la base real, con el lead verificado por `select`. Se anota en §6 si funcionaba ya o qué estaba roto.
- [ ] Migración de `source` validada en PostgreSQL local y aplicada; las 41 filas existentes quedan clasificadas (34 `chatbot`, 4 `budget_calculator`, 3 `contact_form`), verificado con un `group by`.
- [ ] Tests: carga útil válida crea lead con el `source` correcto; carga inválida responde 400 sin crear nada; un fallo de Telegram no impide guardar el lead.
- [ ] Ya no se insertan filas en `conversations` al enviar el formulario.
- [ ] Ningún dato existente se modifica más allá de rellenar `source`.

#### T-24 · Deuda técnica
**Rama:** `chore/tech-debt` — una rama por punto si el cambio es grande.

- [ ] `border-l-4` en `src/app/admin/(dashboard)/docs/[slug]/page.tsx:27` (único antipatrón de la línea base). Al corregirlo, bajar `LINEA_BASE_ANTIPATRONES` a `0` en `scripts/verificar-tarea.sh`.
- [ ] 224 tamaños de letra literales fuera de escala en el panel (`text-[9px]`, `text-[10px]`, `text-[11px]`), incluidos los de los primitivos de T-03. Decidir con Omar si 10–11 px entra en la escala como token o se sube a `text-kicker`/`text-label`.
- [ ] `AdminCard` usa radios escritos a mano (16, 24, 32 px) en vez de la escala nombrada.
- [ ] `src/components/ui/Button.tsx` fija `bg-blue-500`, fuera del sistema.
- [ ] 7 de las 10 paletas apuntan `--main-font-family` a fuentes que `next/font` no carga. **No tocar los colores**; esto es solo tipografía y requiere decisión de Omar.
- [ ] `src/data/` y `src/lib/` conviven sin criterio.
- [ ] `src/components/DeviceFrame.tsx` y su CSS están huérfanos: confirmar con `grep` y preguntar a Omar antes de borrar.
- [ ] `npx tsc -p tsconfig.jest.json` da 816 errores (`jsx: "react"` sin `import React`). Jest no usa ese config, pero confunde.
- [ ] `src/app/admin/(dashboard)/page.tsx`: 864 líneas y ~16 consultas.

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
| 2026-11-16 | T-06: capa de lectura del portafolio con respaldo | `feat/portfolio-data-layer` | 23 tests nuevos (`portfolio-repository.test.ts`) · 357 tests totales · comparación completa de los 22 proyectos contra `projectsData` · build real con la base real: `/es/sobre-mi` y `/en/sobre-mi` prerenderizados · drift real encontrado y corregido (descripción de "DevOps & CI/CD" distinta entre `sobre-mi` y `skillsData`) · revisión visual a ~1093px en navegador; pendiente confirmar a 375px real | ✅ |
| 2026-11-16 | T-05c: carga de educación + entorno coherente en la máquina de Omar | `chore/t05c-cierre-entorno` | 172/171/0 medidos 2× con psql + confirmado con clave anon · env:check sin bloqueos (proyecto Supabase correcto) · hueco de auditoría corregido (.mcp.json) + test nuevo · build real OK · dev: portada 200, /admin 307, 22 proyectos anon · feat/portfolio-seed borrada · tipos regenerados sin match_projects · 334 tests | ✅ |
| 2026-11-15 | Auditoría de workflows: respaldo semanal roto (secreto ausente), cron de cuotas LLM huérfano, rutas de cron verificadas | `docs/hallazgos-ci-entorno` | `gh run view --log-failed` · cruce workflow ↔ rutas existentes · verify en verde | ✅ |
| 2026-11-14 | Auditoría del entorno (`npm run env:check`) + estado del plan al día + T-05c | `chore/env-audit-y-estado` | verify en verde · 333 tests (23 nuevos) · el informe no arrastra valores (probado) · `.env.example` = lo que lee el código (28) · 3 variables muertas fuera de CI | ✅ |
| 2026-11-14 | T-05b Seed del contenido | `feat/portfolio-seed` | generador puro + SQL idempotente · migración y seed 2× en PostgreSQL 16 con conteos exactos · ida y vuelta idéntica a los módulos · 8/9 tablas cargadas en Supabase · 310 tests |  ✅ |
| 2026-11-14 | D-2 limpieza del chatbot | `feat/portfolio-seed` | `match_projects()` borrada · extensión `vector` movida a `extensions` · linter: `extension_in_public` resuelto y `search_path` de 7 a 6 · datos intactos (519/2000/2007/41) |  ✅ |
| 2026-11-14 | Corrección del origen de los leads (34 chatbot / 4 calculadora / 3 formulario) + T-25 | `fix/correccion-origen-leads` | agrupación por `intent` en la base real · 275 tests |  ✅ |
| 2026-11-14 | Auditoría de Supabase + T-04 aplicada en la base real | `fix/timeline-year-jsonb` | 9 tablas/políticas/triggers verificadas en Supabase · linter sin ningún ERROR · 275 tests · tipos generados |  ✅ |
| 2026-11-14 | Plan de ejecución: manual de trabajo, fichas por tarea, `npm run verify` y bloqueo de paletas | `docs/plan-ejecucion` | verify en verde · 269 tests · la puerta falla al tocar el visor o una paleta (probado) · hechos de las fichas comprobados con grep |  ✅ |
| 2026-11-14 | Skills de diseño + PRODUCT.md + DESIGN.md | `chore/design-skills` | doctor sin deriva · detector operativo · tests | ✅ |
| 2026-11-12 | T-05a Módulos de datos | `feat/portfolio-source-modules` | typecheck · lint · 257 tests · conteos medidos en vivo | ✅ |
