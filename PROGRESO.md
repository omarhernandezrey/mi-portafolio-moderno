# PROGRESO — estado real del proyecto

> **Si eres una IA que acaba de abrir este proyecto: lee ESTE archivo primero.**
> Te deja exactamente donde quedó el trabajo, sin tener que reconstruir nada.
> Después lee `CLAUDE.md` (reglas) y la skill
> `.claude/skills/portfolio-engineering-team/SKILL.md` (modo de trabajo y las
> 12 fases). `PLAN_MAESTRO_DASHBOARD.md` §6 tiene el histórico detallado con
> evidencia de cada tanda.

**Última actualización:** 2026-11-27
**Rama en curso:** ninguna — las dos ramas de precios (`…-cop-2026-11` y `…-usd-2026-11`) ya están en `main`
**Puerta de calidad:** `npm run verify` → TODO EN VERDE
**Suite:** 1308 tests en 118 suites · typecheck 0 · 0 errores de lint (147 avisos)

---

## 1. Dónde estamos AHORA MISMO

El proyecto se trabaja con la skill **`portfolio-engineering-team`**, que define
12 fases (de la −1 a la 10), una por sesión.

| Fase | Estado |
|---|---|
| **−1** Instalar y revisar skills | ✅ **cerrada** (ver §4) |
| **0** Auditoría del estado actual | ⬅️ **SIGUIENTE. Empieza aquí.** No necesita nada de Omar |
| 1 a 10 | pendientes, en ese orden obligatorio |

**La Fase 0 pide:** tabla por cada tarea T-XX del plan maestro (qué pedía,
commit, si está en `main`, si funciona hoy), revisar ramas y PR, inventario de
repo/Supabase/workflows/Vercel, **verificar que el README no afirme nada falso**
y correr `npm run verify` y todas las pruebas.

**Aviso:** parte de la Fase 0 ya se hizo el 22–23 de noviembre (ramas revisadas
y limpiadas, README corregido, verify en verde). Lo que falta es la **tabla
tarea por tarea** del plan maestro y el inventario con MCP. No repitas lo ya
hecho: está documentado en §3 de este archivo.

---

## 2. Lo que BLOQUEA, y solo Omar puede desbloquear

**Hoy no hay nada bloqueado.** La auditoría del entorno (`npm run env:check`)
da **0 variables faltantes**, porque el código aún no lee esos servicios. Las
credenciales de abajo bloquean fases FUTURAS, no el trabajo inmediato.

| Credencial | Bloquea | Nombre de variable | Dónde se consigue |
|---|---|---|---|
| Cloudinary (cloud name, API key, API secret) | Fase 2 | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | cloudinary.com → Settings → API Keys |
| Sentry (DSN + auth token) | Fase 3 | `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | sentry.io plan Developer → proyecto Next.js; token con `project:releases` |
| PageSpeed Insights | Fase 5 | `PAGESPEED_API_KEY` | console.cloud.google.com → habilitar PageSpeed Insights API → Credenciales → Clave de API |
| Search Console API | Fases 5 y 6 | JSON de cuenta de servicio | Google Cloud → habilitar Search Console API → cuenta de servicio → clave JSON → dar permiso al `client_email` en Search Console |
| Bing Webmaster | Fase 6 | `BING_WEBMASTER_API_KEY` | bing.com/webmasters → engranaje → API access |
| Token de Vercel | Fase 5 | `VERCEL_TOKEN` | vercel.com/account/tokens |
| API de cron-job.org (opcional) | Fase 5 | `CRONJOB_API_KEY` | console.cron-job.org → Settings → API |

La verificación de propiedad de **Google y Bing ya está hecha**
(`NEXT_PUBLIC_GSC_VERIFICATION` y `NEXT_PUBLIC_BING_VERIFICATION` están en
Vercel): solo falta el acceso por API.

**Pendiente de decisión de Omar:** `HASHNODE_TOKEN` y
`HASHNODE_PUBLICATION_ID` están en `.env.local` pero **vacías**. Son de la Fase
6.5 (difusión). O se rellenan o se retiran; no se dejan así.

---

## 3. Hecho y VERIFICADO (22–27 nov 2026)

Todo esto está en `main`, con CI verde. No hay que repetirlo.

### Precios en COP y en USD: nueva escala y una sola fuente (27 nov)

Trabajo fuera de fase, pedido por Omar para salir a buscar clientes en Bogotá.

- **Todos los precios viven en UN archivo: `src/data/precios.ts`**
  (`PRECIOS_COP` para español y `PRECIOS_USD` para inglés). De ahí salen el catálogo de la calculadora, las nueve
  páginas de servicio, los metadatos, la FAQ y los tramos del formulario de
  contacto. **Para cambiar un precio se toca una línea ahí**, nada más —
  salvo las cuatro etiquetas del formulario en
  `src/locales/{es,en}/common.json`, que las pruebas obligan a mantener
  iguales.
- Regla de posicionamiento: cada «desde» queda **por debajo del más bajo que
  publica la competencia**. Los competidores, con URL y fecha, están en
  `src/data/pricing-sources.ts` → `COMPETIDORES_CO` y `COMPETIDORES_US`, y
  `precios-cop.test.ts` / `precios-usd.test.ts` fallan si un precio deja de
  cumplirlo.
- Nuevos «desde» en COP: landing $299.000 · corporativo $790.000 ·
  e-commerce $1.190.000 · SEO técnico $290.000 · mantenimiento $79.000/mes.
- Nuevos «from» en USD: landing $149 · corporativo $249 · e-commerce $590 ·
  aplicación web $1,190 · SEO técnico $149 · mantenimiento $29/mes.
- Las dos escalas son independientes: ninguna sale de convertir la otra.
- **Riesgo aceptado en USD:** parte del público de EE. UU. lee un precio muy
  bajo como baja calidad. Si las consultas en inglés no suben, es lo primero
  que hay que revisar (está escrito en `pricing-sources.ts`).
- **Ojo al comparar:** varios competidores incluyen dominio y hosting del
  primer año en su «desde»; el sitio no promete eso en ningún texto.
- **Sin tocar, a propósito:** los artículos del blog en los dos idiomas
  (hablan de precios de mercado) y la tabla
  `portfolio_services` de Supabase (USD, no se pinta en el sitio público).
  Los plazos de entrega publicados tampoco cambiaron.

### Registro real de disponibilidad — funcionando solo

- `/status` publicaba **cinco datos inventados** y se quitaron todos: un
  «Network Health 99.98%» literal, una gráfica de 70 barras con alturas
  `Math.random()`, dos servicios con `status="operational"` escrito a mano, y
  «Core Intelligence», cuyo estado parecía venir de la API pero era un stub.
- Ahora hay registro real: tabla `uptime_checks` ← `/api/cron/uptime-record`
  ← `/api/uptime/history` ← la gráfica. La comprobación vive en
  `src/lib/health/check.ts`, compartida con `/api/health`.
- **Regla del diseño: un hueco NO es un 100%.** Un día sin comprobaciones sale
  con `porcentaje: null`, barra hueca y etiqueta «sin datos».
- **Disparador: cron-job.org**, cada hora en el minuto 10. Funcionando y
  verificado de punta a punta.
- GitHub Actions queda de **respaldo**, y está medido que no es fiable: cumplió
  **2 de ~17** ventanas horarias, con casi una hora de retraso.
- **No puede ir a los crons de Vercel**: el plan es Hobby y los limita a uno
  diario. Se intentó y el despliegue falló.
- El disparador externo usa **`UPTIME_CRON_SECRET`**, una llave que solo abre
  esa ruta. El `CRON_SECRET` general abre **once**, incluidas las que borran
  filas y mandan correo: no se le da a un tercero.

### Limpieza de react-hooks (Next 16) — 81 → 30

`static-components` y `refs` quedan en **cero**. Los 30 restantes están
clasificados uno a uno en `eslint.config.mjs`, en tres familias, con las cuentas
medidas y el motivo por el que se quedan. **Si la cuenta sube de 30, es código
nuevo y hay que mirarlo.**

### Variables CSS fantasma — 5 resueltas

`--primary-hover-color`, `--accent-hover-color`, `--error-color`,
`--button-bg-color`, `--button-hover-color` se consumían y no existían en
ninguna parte. Hay guardarraíl: `__tests__/unit/css-variables-definidas.test.ts`
falla si alguien vuelve a referenciar un token inexistente.

### Otros

- README: se corrigieron cifras que no salían de ninguna ejecución (decía 96
  tests cuando hay 1163, e insignia de «94.97% de cobertura» cuando solo se
  mide un archivo). La cobertura se quitó del README por decisión de Omar.
- Ramas: **51 obsoletas borradas** tras verificar una por una que su trabajo
  estaba en `main`. Respaldo de los SHA en `~/ramas-borradas-2026-11-22.txt`.
- Suite: de 1034 a **1163 tests**. Las secciones públicas que se tocaron no
  tenían NINGUNA prueba; se escribieron antes de refactorizar y se pasaron
  contra el código sin tocar.

---

## 4. Fase −1: skills instaladas

35 activas. Fuente y commit en `skills-lock.json` (versionado). El paquete vive
en `.agents/skills/` y **no** se versiona: 860 archivos y 16 MB de código ajeno
que contaminarían el inventario de la Fase 10.

Reinstalar en una máquina nueva:

```
npx skills add obra/superpowers anthropics/skills vercel-labs/agent-skills supabase/agent-skills
```

`CLAUDE.md` tiene la tabla de **cuándo usar cada skill** y la lista de las 17
desactivadas con su motivo.

**Dos desactivadas por riesgo, no por gusto:** `brand-guidelines` aplica los
colores y la tipografía de Anthropic, y `theme-factory` temas ajenos. Las dos
chocan con `DESIGN.md` y con la regla de que las diez paletas no se tocan.

**Dos cosas que el instalador rompió y están arregladas:**

1. Convirtió `frontend-design` y `webapp-testing` —ya versionadas— en enlaces
   simbólicos, borrando los archivos del repo. Contenido idéntico, no se perdió
   nada; restauradas como directorios reales.
2. Rompió `eslint .` por completo («could not find plugin react-hooks»): los 97
   archivos JS/TS de `.agents/` caen bajo un bloque de reglas sin `files`. Se
   añadió `.agents/**` a `ignores`.

---

## 5. Correcciones a la skill, con datos

La skill tiene dos afirmaciones que **no se sostienen**. No las corrijas en el
archivo sin decírselo a Omar, pero trabaja con la realidad:

1. Dice que existen «Docker y Jenkins de trabajos anteriores». **No existen**:
   no hay `Dockerfile`, `docker-compose` ni `Jenkinsfile`. La Fase 3 se
   simplifica — no hay nada que consolidar ni retirar.
2. Pide instalar `frontend-design`, `webapp-testing` y `skill-creator`, que **ya
   estaban** disponibles.

---

## 6. Avisos programados (se disparan solos)

Dos rutinas en la nube comprueban el registro de uptime y **mandan el resultado
por correo** a `hernandezreyomar@gmail.com`. Son de solo lectura y se
autodesactivan al dispararse.

| Cuándo | Qué comprueba |
|---|---|
| 24 nov, 14:07 UTC | El ritmo: una comprobación por hora |
| 25 nov, 14:07 UTC | El día 24 completo, hora por hora: las 24 |

Si el correo dijo que hay huecos, lo primero es mirar el historial del job en
`console.cron-job.org`: un **401** significa que se perdió la cabecera
`Authorization: Bearer <UPTIME_CRON_SECRET>`.

---

## 7. Cómo NO romper nada

- **La rama se crea ANTES de la primera edición.** Un hook bloquea editar
  `src/`, `__tests__/`, `cypress/` o `supabase/` estando en `main`.
- `npm run verify` tiene que acabar en **TODO EN VERDE** antes de mergear, y
  cada tanda deja su fila de evidencia en §6 de `PLAN_MAESTRO_DASHBOARD.md`.
- Los valores de `.env` **nunca** se muestran, se copian al chat ni se
  commitean. Para usarlos: `set -a; . ./.env.local; set +a`.
- Para avisar por Telegram se usa `notifyTelegram`
  (`src/lib/chatbot/telegram.ts`), **no `curl`**. El script no puede usar
  `await` de nivel superior (falla con `ERR_REQUIRE_ASYNC_MODULE`): hay que
  envolverlo en `void (async () => { ... })()`.
- Las migraciones se aplican a mano en Supabase y deben ser **idempotentes**.
- Antes de usar el CLI de Vercel: `unset VERCEL_ORG_ID VERCEL_PROJECT_ID
  VERCEL_TOKEN VERCEL_ENV VERCEL_URL VERCEL` — las variables de la shell están
  obsoletas y lo confunden.
