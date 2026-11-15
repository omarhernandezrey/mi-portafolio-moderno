# Guía para agentes en este repositorio

Portafolio de Omar Hernández Rey (Next.js 15, TypeScript, Tailwind, Supabase) y el panel `/admin` que gobierna su contenido. Responde en español.

## Antes de cualquier trabajo

1. Lee `PLAN_MAESTRO_DASHBOARD.md`, en este orden: §0 (estado y ramas en curso), §3 (manual de ejecución: es obligatorio), §2 (restricciones) y la ficha de tu tarea en §5.
2. `PRODUCT.md` es la verdad de producto y `DESIGN.md` la del sistema visual. Si un cambio los contradice, se detiene y se pregunta; no se editan de paso.

## Skills de diseño instaladas en `.claude/skills/`

### `impeccable` — toda tarea que toque interfaz

Úsala en cualquier cambio de UI, grande o pequeño: componentes, páginas, estilos, textos de interfaz.

- Al empezar la sesión, una sola vez: `.claude/skills/impeccable/scripts/impeccable context`. Carga `PRODUCT.md`, `DESIGN.md` y las directivas del proyecto.
- Inmediatamente antes de editar UI, lee `.claude/skills/impeccable/reference/craft-floor.md`.
- El panel `/admin` es una superficie **Operate**: la ambición se expresa como precisión y sobriedad, no como espectáculo. El sitio público es **Experience** con secciones **Persuade**.
- En este repositorio todo trabajo es **refinamiento o extensión** del sistema existente. No se crea un mundo visual nuevo ni se reemplaza `DESIGN.md` sin que Omar lo pida expresamente.
- Comandos más útiles aquí: `shape` (planear una pantalla antes de programarla), `critique` y `audit` (revisar), `adapt` (móvil), `polish` (cierre), `harden` (errores, vacíos, i18n), `clarify` (textos).
- El hook de diseño está activado para el proyecto (`.impeccable/config.json`). Revisa cada archivo de UI editado y devuelve hallazgos. Un hallazgo real se corrige; no se añade una excepción para saltarse un arreglo. En una máquina nueva se activa una vez con `/impeccable hooks on`.

### `kpi-dashboard-design` — vistas de métricas

Úsala al definir qué métricas mostrar y cómo ordenarlas (T-14, T-15 y cualquier resumen del panel). Adaptaciones obligatorias a este proyecto:

- Sus ejemplos son de SaaS (MRR, churn). Aquí los KPI son de actividad de ingeniería y de alcance del portafolio: commits, líneas, lenguajes, rachas, despliegues, visitas, clics de contacto. No se copian métricas que el proyecto no tiene.
- Resumen con **4 a 6 KPI de cabecera** por vista, cada uno con contexto (comparación, tendencia u objetivo), y detalle por debajo.
- Su regla «rojo = malo, verde = bueno» se aplica con los tokens de estado (`admin-success`, `admin-danger`…) y siempre con etiqueta; nunca con colores sueltos ni usando un color de estado como serie.
- El panel lee métricas preagregadas de Supabase, nunca de la API de GitHub en vivo.

### Gráficas

Antes de escribir cualquier gráfica, carga también la skill `dataviz` si está disponible. La paleta de datos ya está definida y verificada: `src/lib/charts/palette.ts` y las variables `--chart-*`. Se usa `assignSeriesColors`; no se eligen colores nuevos.

## Restricciones que no se negocian

- **No se elimina contenido existente.** Los conteos reales están en `CONTENIDO_ORIGINAL` (`src/lib/portfolio/types.ts`) y un test los mide en vivo.
- **`src/components/shared/Card.tsx` no se modifica**: es el visor de proyectos. Solo puede cambiar su fuente de datos.
- **Las diez paletas no se tocan.** Los componentes consumen tokens (`primary`, `accent`, `card-bg`, `admin-*`, `chart-*`); ningún hex literal.
- **Mobile-first**: se compone y se valida a 375 px antes que en escritorio. Objetivos táctiles de 44px.
- **Ningún dato inventado** en el panel ni en el sitio.
- Primitivos de UI del panel: `src/components/admin/ui/` (importar desde su `index.ts`). `src/components/ui/Button.tsx` está fuera del sistema.

## Validación de cada tarea

```
npm run verify      # puerta de calidad: debe terminar en «TODO EN VERDE»
```

Ejecuta rama propia, visor intacto, typecheck, lint, tests (con los guardarraíles de paletas, tokens, esquema y conteos), compilación de Tailwind y detector de diseño. Una tarea no se marca completada ni se mergea sin eso, sin sus criterios de aceptación comprobados y sin su fila de evidencia en §6 del plan. Tras el merge: `gh run watch`.

`npm run build` necesita acceso a `fonts.googleapis.com` (por `next/font`). En entornos sin esa red se valida con typecheck, lint, tests y la compilación de Tailwind; el build real lo confirma Vercel. No se declara un build que no se ejecutó.

El entorno se audita con `npm run env:check`: cruza el `.env` local con lo que el código lee y con el proyecto de Supabase esperado, e imprime **solo nombres**. Los valores de un `.env` no se muestran, no se copian al chat y no se commitean; para usarlos en una orden se cargan con `set -a; . ./.env.local; set +a`.

Las migraciones de `supabase/migrations/` se aplican a mano en el SQL Editor de Supabase; deben ser idempotentes.
