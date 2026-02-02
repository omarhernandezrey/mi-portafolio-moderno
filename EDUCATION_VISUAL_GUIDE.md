# 📚 Timeline de Educación - Guía Visual

## ¿Cómo se refleja en la App?

### 1. **EducationSection Component**

La sección de educación importa y renderiza todos los 56 cursos desde `educationData.ts`:

```typescript
// src/components/sections/EducationSection.tsx
import { educationData } from '../../lib/educationData';

export function EducationSection() {
  // Renderiza cada categoría y sus cursos
  return (
    <section className="education-timeline">
      {educationData.map((category) => (
        <div key={category.category.es} className="category-block">
          <h2>{category.category[language]}</h2>
          <div className="courses-grid">
            {category.items.map((course) => (
              <CourseCard key={course.title.es} course={course} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
```

---

### 2. **Estructura Visual en la Página**

```
┌─────────────────────────────────────────────────────────┐
│                 EDUCATION TIMELINE                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ 🎓 POLITÉCNICO GRANCOLOMBIANO                           │
│   ├─ Ingeniero de Software (2023-2026)                  │
│   └─ [VER DETALLES]                                     │
│                                                           │
│ 🏢 SENA (5 cursos)                                       │
│   ├─ Mentalidad de Líder                                │
│   ├─ Competencia Laboral                                │
│   ├─ Metodología de Programación                        │
│   ├─ Bases de Datos MySQL                               │
│   ├─ Tecnólogo ADSI                                     │
│   └─ [CARGAR MÁS...]                                    │
│                                                           │
│ 💼 IT CERTIFICATE (2 cursos)                            │
│   ├─ Full Stack Developer Specialist                    │
│   ├─ Back End Developer Professional                    │
│   └─ [VER DETALLES]                                     │
│                                                           │
│ 🚀 TALENTO TECH BOGOTÁ                                  │
│   └─ Bootcamp Full Stack Web Dev (159h)                │
│                                                           │
│ 📖 PLATZI (47 cursos)                                    │
│   ├─ Pensamiento Lógico (2020)              [NUEVO ✨]   │
│   ├─ Programación Básica                                │
│   ├─ Configuración Entorno Windows                      │
│   ├─ Terminal & Git/GitHub                             │
│   ├─ JavaScript Fundamentals                            │
│   ├─ React.js                            [DESTACADO ⭐] │
│   ├─ Audiocurso: Frameworks & Arquitectura             │
│   └─ [CARGAR 4 MÁS...]                                  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

### 3. **Tarjeta de Curso (Course Card)**

Cuando el usuario hace hover o click:

```
┌────────────────────────────────┐
│  [LOGO]    Ingeniero Software  │
│                                │
│ Institución: Politécnico...    │
│ Duración:    2023 - 2026       │
│ Estado:      En curso          │
│                                │
│ Descripción: Programa de educ- │
│ ación superior en Ingeniería...│
│                                │
│ [VER CERTIFICADO] [COMPARTIR]  │
└────────────────────────────────┘
```

---

### 4. **Modal de Detalles**

Al hacer click en una tarjeta, se abre un modal:

```
╔════════════════════════════════════════════╗
║     REACT.JS COURSE - PLATZI               ║
╠════════════════════════════════════════════╣
║                                            ║
║  [LOGO PLATZI]                             ║
║                                            ║
║  Institución: Platzi                       ║
║  Duración:   25 horas                      ║
║  Fecha:      Aprobado 13 Nov 2023          ║
║  Estado:     ✅ COMPLETADO                 ║
║                                            ║
║  📖 DESCRIPCIÓN:                           ║
║  "Curso enfocado en el desarrollo de       ║
║   aplicaciones web modernas utilizando     ║
║   React.js. Cubre componentes funcio-      ║
║   nales, manejo de estado, hooks,..."      ║
║                                            ║
║  📄 CERTIFICADO:                           ║
║  [VER CERTIFICADO]                         ║
║  /public/images/education/platzi/          ║
║  54 diploma-react.jpg                      ║
║                                            ║
║  🌐 OPCIONES:                              ║
║  [DESCARGAR] [COMPARTIR] [CERRAR]          ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### 5. **Paginación e Interactividad**

```
Carreras Mostradas Inicialmente: 8
Paso de Carga: 4 más por click

[Primera carga]
1. Politécnico
2. SENA 1
3. SENA 2
4. SENA 3
5. SENA 4
6. SENA 5
7. ITCertificate 1
8. ITCertificate 2

[Click "VER MÁS"]
9. Talento Tech
10. Platzi 1
11. Platzi 2
12. Platzi 3

[Click "VER MÁS"]
13-16. Platzi 4-7
...y así sucesivamente hasta completar los 56
```

---

### 6. **Bilingüismo EN VIVO**

El componente detecta el idioma y renderiza:

**EN ESPAÑOL:**
```
Institución: Servicio Nacional de Aprendizaje (SENA)
Duración: 40 horas (Finalizado el 21 de marzo de 2023)
Descripción: Participé y aprobé el curso de Metodología...
```

**EN INGLÉS:**
```
Institution: National Learning Service (SENA)
Duration: 40 hours (Completed on March 21, 2023)
Description: I participated and passed the Information Systems...
```

---

### 7. **Marcas Especiales**

#### 🆕 Nueva (isNew: true)
```
Laboratorio Práctico de React.js
└─ Se muestra con badge "NUEVO" en la tarjeta
```

#### ⭐ Destacado
```
React.js Course
└─ Especial importancia educativa/laboral
```

#### ✅ Completado
```
Todos los cursos muestran el estado según la fecha
```

---

### 8. **Integración con el Sistema de Paletas**

Las tarjetas de curso se estilizan con las variables CSS:

```css
/* Variables aplicadas desde paletas */
.course-card {
  background: var(--background-color);
  border: 2px solid var(--primary-color);
  color: var(--text-color);
}

.course-header {
  background: var(--accent-color);
  color: var(--background-color);
}

.certificate-link {
  color: var(--secondary-color);
  text-decoration: underline;
}
```

---

### 9. **Responsividad**

**Desktop (> 1024px):**
- Grid de 3 columnas
- Modal en el centro
- Animaciones fluidas

**Tablet (768px - 1024px):**
- Grid de 2 columnas
- Modal adaptado a pantalla

**Mobile (< 768px):**
- Grid de 1 columna
- Modal en fullscreen
- Animaciones optimizadas

---

### 10. **Animaciones**

Cada componente tiene animaciones con Framer Motion:

```typescript
// Entrada de tarjetas (stagger)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Cada tarjeta
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};
```

---

## 📊 Flujo de Datos

```
educationData.ts (56 cursos)
       ↓
EducationSection.tsx importa
       ↓
useTranslation() Hook (idioma actual)
       ↓
Renderiza categorías en orden
       ↓
Lazy loading: 8 iniciales + 4 más
       ↓
Modales interactivos por curso
       ↓
Imágenes desde /public/images/education/
       ↓
Usuario ve timeline completo y funcional
```

---

## 🔗 Rutas Clave

| Componente | Ruta |
|---|---|
| Datos | `src/lib/educationData.ts` |
| Componente | `src/components/sections/EducationSection.tsx` |
| Modal | `src/components/ui/EducationModal.tsx` |
| Imágenes | `public/images/education/` |
| Hook i18n | `src/hooks/useTranslation.ts` |
| Estilos | Tailwind CSS + variables CSS globales |

---

## ✅ Checklist de Funcionalidad

- [x] Los 56 cursos cargan correctamente
- [x] Cada curso tiene logo institucional
- [x] Los certificados están vinculados correctamente
- [x] Bilingüismo funciona (ES/EN)
- [x] Paginación (cargar más) funciona
- [x] Modales muestran detalles completos
- [x] Imágenes cargan sin errores 404
- [x] Responsive en todos los dispositivos
- [x] TypeScript sin errores
- [x] Animaciones suaves y funcionales

---

## 🐛 Cómo Verificar en Desarrollo

```bash
# 1. Abrir dev server
npm run dev

# 2. Ir a http://localhost:3000

# 3. Scroll hasta sección "Educación"

# 4. Verificar:
# ✓ Se carga la sección
# ✓ Se ven 8 cursos iniciales
# ✓ Botón "Ver Más" funciona
# ✓ Click en tarjeta abre modal
# ✓ Certificados se ven correctamente
# ✓ Cambiar idioma actualiza texto

# 5. Verificar errores en consola
# - Abrir DevTools (F12)
# - Tab "Console"
# - No debe haber errores de hidratación
```

---

## 📈 Impacto en SEO

Los 56 cursos ayudan a:
- Mejorar cobertura de palabras clave
- Demostrar experiencia profesional
- Aumentar tiempo en página
- Mejorar engagement (modal clicks)
- Validar expertise en múltiples tecnologías

---

**Fecha**: 2 de febrero de 2026  
**Estado**: ✅ Completamente funcional y documentado  
**Última verificación**: TypeScript ✓, Imports ✓, Rendering ✓
