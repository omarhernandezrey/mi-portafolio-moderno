# Copilot Instructions - Mi Portafolio Moderno

## Arquitectura General

Este es un portafolio web moderno construido con **Next.js 15** (App Router), **React 19**, **TypeScript** y **Tailwind CSS**. El proyecto usa arquitectura de componentes con separación clara entre lógica de cliente y servidor.

### Estructura de Directorios Clave

- `src/app/` - App Router de Next.js (layout, pages, client providers)
- `src/components/` - Componentes organizados por tipo:
  - `sections/` - Secciones principales (Hero, About, Projects, Skills, Contact)
  - `ui/` - Componentes de UI (Navbar, Modals, Buttons)
  - `shared/` - Componentes reutilizables (Cards, Footer)
- `src/lib/` - Datos estáticos y utilidades (projectsData, educationData, i18n, utils)
- `src/contexts/` - Contextos de React (I18nContext para internacionalización)
- `src/hooks/` - Custom hooks (usePalette, useTheme, useTranslation)
- `src/locales/` - Archivos de traducción JSON (es/common.json, en/common.json)

## Convenciones de Desarrollo

### Sistema de Internacionalización (i18n)

**Patrón único**: Usamos i18next con React (NO next-i18next) con inicialización solo en cliente:

```typescript
// Hook principal para traducciones
import { useTranslation } from '@/hooks/useTranslation';
const { t } = useTranslation();
t('hero.title'); // Acceder a traducciones
```

- Idioma por defecto: español (`es`)
- Persistencia en localStorage como `i18nextLng`
- SSR siempre renderiza en español, cliente se hidrata con idioma guardado
- Archivos de traducción: `src/locales/{es,en}/common.json`
- Contexto global: `I18nProvider` en `src/app/ClientProvider.tsx`

### Sistema de Paletas de Color

10 paletas de color definidas mediante variables CSS en `globals.css`:

```typescript
// Hook para cambiar paletas
import { usePalette } from '@/hooks/usePalette';
const { paletteIndex, togglePalette } = usePalette();
```

- Variables CSS: `--primary-color`, `--accent-color`, `--background-color`, etc.
- Clases de Tailwind mapeadas a variables: `bg-primary`, `text-accent`
- Persistencia en localStorage como `paletteIndex`
- Aplicadas mediante clases en `<html>` (palette2, palette3, etc.)

### Gestión de Datos Estáticos

Los datos están centralizados en `src/lib/`:

- **projectsData.ts**: Array de proyectos con estructura bilingüe
- **educationData.ts**: Formación académica y certificaciones
- **servicesData.ts**: Servicios ofrecidos
- **skillsData.ts**: Habilidades técnicas

Estructura típica de datos bilingües:
```typescript
{
  title: { es: "...", en: "..." },
  description: { es: "...", en: "..." },
  // ... más campos
}
```

### Componentes Cliente vs Servidor

- **Directiva obligatoria**: Componentes que usan hooks, eventos o estado necesitan `"use client"` en la primera línea
- **Estrategia**: layout.tsx es servidor, ClientProvider.tsx envuelve contextos de cliente
- **Animaciones**: Todos los componentes con Framer Motion requieren `"use client"`

### Sistema de Rutas Dinámicas

Certificados tienen rutas dinámicas catch-all:
- Patrón: `src/app/certificates/[...certificatePath]/page.tsx`
- Ejemplo URL: `/certificates/platzi/react-avanzado`

## Comandos Críticos de Desarrollo

```bash
# Desarrollo local (usa Turbopack para builds rápidos)
npm run dev

# Build de producción
npm run build

# Verificar TypeScript
npx tsc --noEmit

# Lint
npm run lint

# Deploy a Vercel (automático en push a main)
# Configurado en vercel.json con región iad1
```

### Variables de Entorno Requeridas

Para que el formulario de contacto funcione, necesitas en `.env.local`:
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=tu_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=tu_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=tu_public_key
```

## Patrones Importantes

### React Hooks - Dependencias Críticas

**IMPORTANTE**: Este proyecto tuvo problemas con bucles infinitos por dependencias incorrectas en `useEffect` y `useCallback`. Siempre:

- Incluye todas las dependencias que use el effect
- Usa `useCallback` para funciones que se pasen como dependencias
- Evita referencias a objetos/arrays no memorizados en dependencias

### Animaciones con Framer Motion

Patrón consistente usado en todas las secciones:

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};
```

**IMPORTANTE - Z-Index en componentes animados con filas múltiples:**

Cuando tienes múltiples filas animadas con marquee (como en TechMarquee), los tooltips de la primera fila pueden ser tapados por los iconos de la segunda fila. Solución aplicada:

```typescript
// Primera fila - SIEMPRE por encima
<motion.div className="flex gap-8 mb-8 relative z-10">
  {/* contenido */}
</motion.div>

// Segunda fila - SIEMPRE por debajo
<motion.div className="flex gap-8 relative -z-10">
  {/* contenido */}
</motion.div>

// Tooltip dentro de la primera fila
<div className="absolute -bottom-10 ... z-[9999]">
  {/* tooltip content */}
</div>
```

Esta configuración garantiza que los tooltips de la primera fila se muestren correctamente por encima de todos los elementos de la segunda fila.

## Solución de Problemas de Scroll en Chrome

El sitio tenía un problema donde el scroll no funcionaba con la rueda del mouse en Chrome (funcionaba en Firefox y otros navegadores). La causa raíz eran múltiples factores:

### Problema Identificado

1. **CSS Global Restrictivo**: Había una media query que forzaba todos los grids a 1 columna en móvil con `!important`
2. **Componentes bloqueando scroll**: `NavbarMobile` y `LanguageSelector` aplicaban `overflow: hidden` al body cuando se abrían
3. **Contenedores Next.js**: Los divs internos de Next.js (`#__next`) podían bloquear el scroll en Chrome

### Solución Aplicada

**1. Eliminado CSS restrictivo en `globals.css`:**
```css
/* ELIMINADO - Causaba 1 sola columna en móvil */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr !important;
  }
}
```

**2. CSS agresivo para forzar scroll funcional:**
```css
html {
  overflow-y: scroll !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch;
}

html, body {
  overflow-y: auto !important;
  height: auto !important;
  overscroll-behavior-y: auto !important;
  touch-action: manipulation;
}

#__next, #__next > div {
  overflow-y: visible !important;
  height: auto !important;
  position: relative !important;
}
```

**3. JavaScript watchdog en `ClientProvider.tsx`:**
```typescript
useEffect(() => {
  const forceScrollEnabled = () => {
    document.documentElement.style.setProperty('overflow-y', 'scroll', 'important');
    document.body.style.setProperty('overflow-y', 'auto', 'important');
    document.body.style.setProperty('height', 'auto', 'important');
  };
  
  forceScrollEnabled();
  setTimeout(forceScrollEnabled, 100);
  setTimeout(forceScrollEnabled, 500);
}, []);
```

Este código ejecuta múltiples veces para asegurar que ningún componente bloquee el scroll durante la hidratación.

### Resultado

✅ Scroll funciona correctamente con rueda del mouse en Chrome, Firefox, Safari y Edge
✅ Grids muestran 2 columnas en móvil (Services, Skills, About, Footer, etc.)
✅ Sin efectos secundarios en la funcionalidad de menús o modales

### Optimización de Imágenes

- Usar siempre `next/image` para imágenes
- Formatos configurados: AVIF y WebP
- Imágenes públicas en `/public/images/`
- Logos en `/public/images/logos/`

## SEO y Metadata

El proyecto tiene SEO altamente optimizado (100/100):

- Metadata completa en `src/app/layout.tsx`
- Open Graph para redes sociales
- Twitter Cards
- Sitemap dinámico en `src/app/sitemap.ts`
- robots.txt en `/public/robots.txt`

## Testing y Validación

Scripts de validación SEO disponibles:
- `validate-seo.sh` - Validación completa de SEO
- `validate-seo-curl.sh` - Validación mediante curl

Documentación adicional en:
- `SEO_CHECKLIST.md`
- `MOBILE_OPTIMIZATION.md`
- `VALIDATION_SCRIPTS_README.md`

## Deploy en Vercel

- Framework detectado automáticamente como Next.js
- Región: `iad1` (US East)
- Build automático en push a `main`
- Variables de entorno configuradas en dashboard de Vercel
- Configuración en `vercel.json` incluye headers de seguridad

## Troubleshooting Común

1. **Errores de hidratación**: Verificar que componentes con `"use client"` no reciban datos inconsistentes entre servidor y cliente
2. **i18n no funciona**: Verificar que `I18nProvider` envuelve la app en `ClientProvider.tsx`
3. **Paletas no cambian**: Verificar que CSS variables estén definidas en `globals.css`
4. **Imágenes no cargan**: Verificar rutas relativas a `/public/` y configuración en `next.config.mjs`
