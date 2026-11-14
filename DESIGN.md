---
name: Portafolio de Omar Hernández Rey
description: Portafolio de ingeniería con un panel propio que gobierna su contenido y sus métricas.
colors:
  primary: "#00cba9"
  accent: "#00a086"
  background: "#0d131a"
  secondary-background: "#1c2731"
  card: "#1c2731"
  text: "#e5e7eb"
  muted: "#b8bfca"
  admin-primary: "#2dd4bf"
  admin-accent: "#7dd3fc"
  admin-bg: "#070c11"
  admin-surface: "#0b131a"
  admin-raised: "#101c26"
  admin-card: "#0f1922"
  admin-line: "#1e2c38"
  admin-ink: "#f1f6fa"
  admin-muted: "#8ea0b5"
  admin-success: "#34d399"
  admin-warning: "#fbbf24"
  admin-danger: "#fb7185"
  admin-info: "#60a5fa"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
  section:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.125rem, 1rem + 0.6vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  metric:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "clamp(1.75rem, 1.2rem + 2.4vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  metric-sm:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 1rem + 1.2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "1rem"
  label:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "0.8125rem"
    lineHeight: 1.2
    letterSpacing: "0.01em"
  kicker:
    fontFamily: "JetBrains Mono, Courier New, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  chip: "0.625rem"
  field: "0.75rem"
  card: "1.25rem"
  panel: "1.75rem"
  canvas: "2rem"
  pill: "9999px"
spacing:
  "1": "0.5rem"
  "2": "0.75rem"
  "3": "1rem"
  "4": "1.5rem"
  "5": "2rem"
  "6": "3rem"
  "7": "4.5rem"
  "8": "6rem"
  "9": "9rem"
components:
  button-primary:
    backgroundColor: "{colors.admin-primary}"
    textColor: "{colors.admin-bg}"
    rounded: "{rounded.field}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.admin-raised}"
    textColor: "{colors.admin-ink}"
    rounded: "{rounded.field}"
    padding: "10px 16px"
  button-ghost:
    textColor: "{colors.admin-muted}"
    rounded: "{rounded.field}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.admin-card}"
    textColor: "{colors.admin-ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  input:
    backgroundColor: "{colors.admin-bg}"
    textColor: "{colors.admin-ink}"
    rounded: "{rounded.field}"
    padding: "10px 14px"
    height: "44px"
  status-badge:
    textColor: "{colors.admin-primary}"
    rounded: "{rounded.pill}"
---

# Design System: Portafolio de Omar Hernández Rey

## Overview

**Creative North Star: "El Taller del Ingeniero"**

Un banco de trabajo ordenado: superficie oscura, herramientas precisas a la vista y etiquetas técnicas que dicen exactamente qué es cada cosa. Nada está de adorno. El carácter no viene de efectos, sino de la precisión: un titular serif con peso, una etiqueta monoespaciada con tracking amplio, una línea fina teñida que separa sin gritar.

El sistema es denso sin ser apretado. La información manda y el color se reserva para lo que es acción o estado. El panel de administración es la versión más sobria de este mundo: componentes contenidos, de líneas finas, donde el acento aparece solo cuando algo se puede hacer o algo cambió.

El trabajo debe leerse como hecho a mano por un equipo de diseño. Composición, jerarquía y ritmo se deciden caso por caso; no se aplican recetas de plantilla.

**Key Characteristics:**
- Superficie oscura con profundidad dada por dos gradientes radiales fijos y muy tenues, no por imágenes.
- Tres voces tipográficas con papeles separados: serif para titulares, sans para cuerpo y cifras, mono en mayúsculas para etiquetas.
- Separación por líneas finas teñidas del acento, no por cajas pesadas.
- Luz por desenfoque detrás de la superficie, nunca por halo alrededor.
- Diez paletas conmutables; el panel vive aislado en la suya.

## Colors

Un solo acento teal sobre azules casi negros, con una paleta de datos fija y aparte para las gráficas.

### Primary
- **Teal de Instrumento** (`primary`, y `admin-primary` dentro del panel): acciones principales, estado activo, foco, enlaces y la marca de selección. Es el único color con voz propia en la interfaz.

### Secondary
- **Teal Profundo** (`accent`) en el sitio público y **Cielo Tenue** (`admin-accent`) en el panel: segundo extremo de los gradientes a 135° y acentos de apoyo. Nunca compite con el primario en la misma pieza.

### Neutral
- **Tinta de Taller** (`background`, `admin-bg`): el lienzo.
- **Banco** (`secondary-background`, `card`, `admin-surface`, `admin-card`, `admin-raised`): superficies escalonadas; cada nivel es apenas más claro que el anterior.
- **Hilo** (`admin-line`): bordes y divisores del panel.
- **Papel** (`text`, `admin-ink`) y **Grafito** (`muted`, `admin-muted`): texto principal y secundario.

### Estado
- `admin-success`, `admin-warning`, `admin-danger`, `admin-info`: solo para comunicar estado, siempre con la tríada texto + borde al 20 % + fondo al 10 % y acompañados de etiqueta.

### Datos
- `chart-1` a `chart-8`: series de gráficas, en orden fijo. Además existen una rampa secuencial de un solo tono (`--chart-seq-1..7`) y una divergente con gris neutro al centro (`--chart-div-*`), definidas en `src/app/globals.css`.

### Named Rules
**La Regla de las Diez Paletas.** Los valores de este archivo son los de la paleta por defecto. El sitio tiene diez, conmutables en tiempo real, y todas viven como variables CSS en `src/app/globals.css`. Todo componente consume el token (`primary`, `accent`, `card-bg`, `admin-*`), nunca un hex literal: un hex quemado rompe las otras nueve.

**La Regla de la Paleta Intocable.** Los valores de las diez paletas no se modifican, no se «mejoran» y no se sustituyen. Son una decisión del propietario.

**La Regla del Color de Datos Fijo.** La paleta de gráficas es la única parte del sistema con color fijo, a propósito: fue calculada y verificada para distinguirse bajo daltonismo y contra la superficie. Las series se asignan en orden, nunca en ciclo; de la novena en adelante se agrupan en «Otros». Los colores de estado no se usan como serie.

**La Regla del Panel Aislado.** Todo lo que vive en `/admin` va dentro de `.admin-shell`, que redefine sus propias variables para que la única paleta clara del sitio no rompa su contraste.

## Typography

**Display Font:** Fraunces (con Georgia, serif)
**Body Font:** Manrope (con Segoe UI, Arial, sans-serif)
**Label/Mono Font:** JetBrains Mono (con Courier New, monospace)

**Character:** Una serif con carácter para lo que se lee primero, una sans geométrica y limpia para trabajar, y una mono que etiqueta como lo haría una pegatina de taller. El contraste entre las tres es deliberado y hace el trabajo que en otros sistemas hace el color.

### Hierarchy
- **Display** (Fraunces): titulares del sitio público y títulos de página.
- **Section** (Fraunces 600, fluido de 1.125 a 1.5rem, interlineado 1.15): títulos de sección y de diálogo en el panel.
- **Metric** (Manrope 700, fluido de 1.75 a 2.75rem, interlineado 0.95): la cifra protagonista de una tarjeta. Escala con el ancho para no desbordar a 375 px.
- **Metric-sm** (Manrope 700, fluido de 1.25 a 1.75rem): cifras secundarias.
- **Body** (Manrope, 1rem): texto corrido. En campos de formulario, 16px en móvil y 14px desde `sm`.
- **Label** (Manrope, 0.8125rem): etiquetas de campo y texto de interfaz.
- **Kicker** (JetBrains Mono 600, 0.6875rem, tracking 0.2em, mayúsculas): rótulos sobre títulos, encabezados de tabla y nombres de dato.

### Named Rules
**La Regla de los 16 Píxeles.** Ningún campo editable baja de 16px en móvil. Por debajo, Safari en iOS hace zoom al enfocar y descoloca la pantalla.

**La Regla de la Cifra en Tinta.** Los números y las etiquetas van en color de texto, nunca en el color de la serie. La identidad la da la marca de color que los acompaña.

## Layout

Mobile-first en sentido estricto: cada pantalla se compone y se valida a 375 px, luego a 475 (`xs`) y solo al final desde 1024 (`lg`). Puntos de corte: los de Tailwind por defecto más `xs` 475px y `3xl` 1600px.

El panel usa barra lateral fija de 18rem desde `lg`; por debajo, cabecera de 4rem y un cajón lateral de hasta 22rem. Los objetivos táctiles miden al menos 44px. Las tablas no existen en móvil: cada fila se vuelve una tarjeta con título, línea de apoyo y pares etiqueta/valor, y la tabla aparece desde `lg`. Los diálogos entran como hoja inferior en móvil y se centran desde `sm`. Las pestañas se desplazan horizontalmente en lugar de partirse en dos líneas.

El sitio público usa una rejilla editorial de 12 columnas con ancho máximo de 90rem, canal `clamp(1rem, 3vw, 2rem)` y margen `clamp(1.25rem, 5vw, 4rem)`.

## Elevation & Depth

Híbrido de capas tonales y sombra difusa. La profundidad principal es tonal: cada superficie es un paso más clara que la que tiene debajo. La sombra existe pero se hunde, con spread negativo, de modo que la tarjeta parece asentada en la mesa y no flotando.

### Shadow Vocabulary
- **e1** (`0 6px 18px -14px rgb(0 0 0 / 85%)`): controles pequeños, el pulgar de un interruptor.
- **e2** (`0 12px 32px -22px rgb(0 0 0 / 90%)`): burbujas y menús.
- **e3** (`0 18px 45px -32px rgb(0 0 0 / 95%)`): tarjetas. Es la sombra canónica del sistema.
- **e4** (`0 28px 70px -40px rgb(0 0 0 / 95%)`): diálogos y hojas.

### Named Rules
**La Regla de la Luz por Detrás.** La luz se hace con una mancha del acento al 10 % desenfocada (40, 80 o 140px) colocada detrás de la superficie. No se usan sombras de color ni halos alrededor de los elementos.

## Shapes

Esquinas generosas y consistentes, con una escala corta y nombrada: chip (0.625rem), campo (0.75rem), tarjeta (1.25rem), panel (1.75rem) y lienzo (2rem); píldora completa para insignias y contadores. Los bordes son de un píxel, teñidos: el acento al 20 o 30 % en el sitio público y `admin-line` en el panel.

Nota de estado: `AdminCard`, anterior a estos tokens, usa todavía 16, 24 y 32px escritos a mano. Los componentes nuevos usan la escala nombrada; la migración de `AdminCard` está anotada como deuda en el plan maestro.

## Components

Precisos y sobrios: contenidos, de líneas finas, con el color reservado para acción y estado.

### Buttons
- **Shape:** esquina de campo (0.75rem); peso tipográfico fuerte.
- **Primary:** fondo del primario, texto del color del lienzo, relleno 10px 16px.
- **Secondary:** superficie apenas levantada con borde `admin-line`; al pasar el cursor el borde se tiñe del primario al 30 %.
- **Ghost:** sin fondo ni borde, texto atenuado que se aclara al pasar.
- **Danger:** tríada de estado en rojo; nunca relleno sólido.
- **Focus:** anillo de 2px del primario al 40 %.

### Cards / Containers
- **Corner Style:** tarjeta (1.25rem); panel (1.75rem) para contenedores mayores.
- **Background:** `card-bg` opaco.
- **Shadow Strategy:** e3.
- **Border:** un píxel, `admin-line`.
- **Internal Padding:** 20px en móvil, 28px desde `md`.

### Inputs / Fields
- **Style:** fondo del lienzo al 60 %, borde `admin-line`, esquina de campo, alto mínimo 44px.
- **Focus:** borde del primario al 50 % más anillo de 2px al 40 %.
- **Error / Disabled:** borde de peligro al 50 % con mensaje que sustituye a la pista; deshabilitado al 50 % de opacidad.

### Chips
- **Style:** píldora con punto de color, tríada texto + borde 20 % + fondo 10 %.
- **State:** el color comunica estado y siempre va con su etiqueta.

### Navigation
- Pestañas con subrayado de 2px del primario sobre el borde del contenedor; la activa en tinta plena, el resto atenuadas. En móvil se desplazan con ajuste por pestaña. Contadores en mono dentro de una píldora.

### Visor de proyectos
Tres dispositivos (portátil, tableta, teléfono) con el sitio de cada proyecto funcionando dentro, también al tacto. Vive en `src/components/shared/Card.tsx`. Su geometría está ajustada a mano píxel a píxel. **No se modifica**: ni su marcado, ni sus estilos, ni su escala.

## Do's and Don'ts

### Do:
- **Do** consumir siempre tokens de color (`primary`, `accent`, `card-bg`, `admin-*`, `chart-*`).
- **Do** componer primero a 375 px y validar ahí antes de pensar en escritorio.
- **Do** usar los primitivos de `src/components/admin/ui/` (importados desde su `index.ts`) antes de crear uno nuevo.
- **Do** usar la escala nombrada de radio (`rounded-card`, `rounded-field`…) y de elevación (`shadow-e1`…`shadow-e4`).
- **Do** dar a cada objetivo táctil al menos 44px.
- **Do** mostrar solo cifras que vengan de la base de datos o de GitHub.
- **Do** acompañar todo color de estado o de serie con una etiqueta de texto.

### Don't:
- **Don't** escribir un hex literal en un componente.
- **Don't** cambiar ningún valor de las diez paletas.
- **Don't** tocar `src/components/shared/Card.tsx` más allá de su fuente de datos.
- **Don't** usar `src/components/ui/Button.tsx`: fija un azul ajeno al sistema.
- **Don't** usar halos ni sombras de color para iluminar.
- **Don't** mostrar tablas con desplazamiento horizontal en móvil.
- **Don't** ciclar los colores de serie ni reutilizar un color de estado como serie.
- **Don't** mostrar datos de ejemplo, inventados o de relleno.
