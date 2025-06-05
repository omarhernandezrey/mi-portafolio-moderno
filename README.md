# 🚀 Mi Portafolio Moderno

Un portafolio web moderno y responsivo desarrollado con **Next.js 15**, **TypeScript**, **Tailwind CSS** y **Framer Motion**, con animaciones avanzadas y optimizaciones de rendimiento.

![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Características Principales

- 🎨 **Diseño Moderno**: Interfaz limpia y profesional con efectos visuales avanzados
- 📱 **Totalmente Responsivo**: Optimizado para todos los dispositivos y tamaños de pantalla
- ⚡ **Rendimiento Optimizado**: Build optimizado con Next.js 15 y Turbopack
- 🎭 **Animaciones Fluidas**: Implementadas con Framer Motion para una experiencia inmersiva
- 🔧 **TypeScript**: Código tipado para mejor mantenibilidad y desarrollo
- 🎯 **SEO Optimizado**: Meta tags y estructura optimizada para motores de búsqueda
- 🚀 **Deploy Ready**: Configurado para deploy en Vercel con optimizaciones de producción

## 🛠️ Tecnologías Utilizadas

### Frontend Core
- **Next.js 15.3.3** - Framework React con App Router
- **React 19.1.0** - Biblioteca para interfaces de usuario
- **TypeScript 5.8.3** - Superset tipado de JavaScript
- **Tailwind CSS 3.4.17** - Framework CSS utility-first

### Animaciones y UI
- **Framer Motion 12.15.0** - Biblioteca de animaciones
- **Lucide React 0.511.0** - Iconos SVG
- **React Icons 5.5.0** - Colección de iconos
- **Typewriter Effect 2.22.0** - Efecto de máquina de escribir

### Formularios y Validación
- **React Hook Form 7.57.0** - Manejo de formularios
- **Zod 3.25.46** - Validación de esquemas
- **@hookform/resolvers 5.0.1** - Resolvers para validación

### Comunicación
- **EmailJS Browser 4.4.1** - Envío de emails desde el frontend

### Herramientas de Desarrollo
- **ESLint 9.28.0** - Linting de código
- **Prettier** - Formateo de código
- **Autoprefixer 10.4.21** - Prefijos CSS automáticos

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18.0 o superior
- npm, yarn, pnpm o bun

### Instalación

1. **Clona el repositorio:**
```bash
git clone https://github.com/tuusuario/mi-portafolio-moderno.git
cd mi-portafolio-moderno
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Ejecuta el servidor de desarrollo:**
```bash
npm run dev
```

4. **Abre tu navegador:**
Visita [http://localhost:3000](http://localhost:3000) para ver el proyecto.

## 📜 Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Inicia el servidor de desarrollo con Turbopack
npm run build        # Genera el build de producción
npm run start        # Inicia el servidor de producción
npm run lint         # Ejecuta ESLint para verificar errores
```

### Calidad de Código
```bash
npx tsc --noEmit     # Verifica errores de TypeScript
npx prettier . --check   # Verifica formato del código
npx prettier . --write   # Aplica formato automático
```

## 🔧 Correcciones y Optimizaciones Realizadas

### ✅ Errores de React Hooks Corregidos
- **Problema**: Dependencias faltantes en `useCallback` y `useEffect`
- **Solución**: Optimización de dependencias para evitar bucles infinitos
- **Impacto**: Eliminación de warnings de ESLint y mejor rendimiento

### ✅ Error de "Maximum Update Depth" Solucionado
- **Problema**: Bucle infinito causado por dependencias circulares en `useEffect`
- **Solución**: Reestructuración de dependencias en SkillSection
- **Impacto**: Componente `SkillSection` funcionando correctamente sin crashes

### ✅ Limpieza de Caché y Reinstalación
- **Problema**: Build fallando por caché corrupta de Next.js
- **Solución**: Limpieza completa de `.next`, `node_modules` y reinstalación
- **Impacto**: Build exitoso en 2.4 minutos con optimizaciones completas

### ✅ Optimizaciones de Rendimiento
- **TypeScript**: Sin errores de tipos
- **ESLint**: Zero warnings or errors
- **Build Size**: First Load JS optimizado a 251 kB
- **Static Generation**: 5/5 páginas generadas estáticamente

## 🎨 Secciones Implementadas

### 🏠 Hero Section
- Animación de entrada con Framer Motion
- Efecto de typing con Typewriter Effect
- Diseño responsivo con gradientes animados

### 💼 Skills Section (Optimizada)
- Círculos de progreso animados con SVG
- Filtrado por categorías
- Animaciones de hover y entrada
- **Errores corregidos**: Bucles infinitos y dependencias optimizadas

### 📞 Contact Section
- Formulario funcional con React Hook Form
- Validación con Zod
- Integración con EmailJS
- Estados de loading y success

## 🚀 Deploy en Vercel

El proyecto está optimizado para deploy en Vercel:

1. **Conecta tu repositorio** en [vercel.com](https://vercel.com)
2. **Deploy automático** con cada push a main
3. **Optimizaciones incluidas**:
   - Edge Runtime
   - Image Optimization
   - Static Generation
   - Bundle Analysis

## 🐛 Troubleshooting

### Build Fallando
```bash
# Limpia la caché y reinstala
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Errores de TypeScript
```bash
# Verifica errores sin generar archivos
npx tsc --noEmit
```

### Problemas de ESLint
```bash
# Ejecuta linting con reporte detallado
npm run lint -- --report-unused-disable-directives
```

## 📈 Próximas Implementaciones

### AboutSection
- [ ] Integración con [Lanyard](https://www.reactbits.dev/components/lanyard) para estado de Discord
- [ ] [Profile Card](https://www.reactbits.dev/components/profile-card) interactiva
- [ ] Timeline de experiencia profesional

### Mejoras Generales
- [ ] Modo oscuro/claro
- [ ] Internacionalización (i18n)
- [ ] Blog integrado
- [ ] Sistema de comentarios
- [ ] Analytics avanzado

## 🤝 Contribución

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Omar** - [GitHub](https://github.com/tuusuario)

---

⭐ Si este proyecto te ha sido útil, no olvides darle una estrella en GitHub! 