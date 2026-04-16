# Mapa de Integración del Chatbot

Este documento define la relación entre el chatbot AI y el ecosistema existente del portafolio.

## 🛡️ Sistemas Intocables (Fuentes de Verdad)

| Sistema / Archivo | Rol | Regla de Oro |
|---|---|---|
| `src/lib/projectsData.ts` | Datos de proyectos | El bot lee este archivo; NUNCA lo modifica. |
| `src/lib/servicesData.ts` | Base de servicios | El bot lo usa como referencia inicial. |
| `src/lib/educationData.ts` | Formación académica | El bot cita estos datos como prueba de autoridad. |
| `src/lib/skillsData.ts` | Habilidades técnicas | Fuente para responder "¿Sabes X tecnología?". |
| `src/components/sections/ContactForm.tsx` | Formulario tradicional | Convive con el bot. No se elimina ni se altera. |
| `src/components/ui/PaletteToggle.tsx` | Gestión de temas | El bot debe heredar los colores definidos aquí. |
| `src/hooks/useTranslation.ts` | Sistema i18n | El bot usa este hook para su propia UI. |

## 🔗 Puntos de Conexión

1. **`src/app/layout.tsx`**: Único punto de montaje global del `<ChatWidget />`.
2. **`src/lib/chatbot/data/index.ts`**: El "puente" que importa los datos del portafolio y los entrega al `systemPrompt`.
3. **`src/locales/`**: Archivos compartidos para las traducciones de la interfaz del chatbot.

## 🎨 Coherencia Visual
El chatbot utiliza exclusivamente variables CSS (`var(--primary-color)`, etc.) para asegurar que reacciona instantáneamente a los cambios de paleta de colores del usuario.

## 🚀 Performance
El widget se carga de forma diferida (lazy load) para no impactar en las métricas de carga inicial (Core Web Vitals).
