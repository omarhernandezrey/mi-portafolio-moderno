# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Visitante del portafolio público (omarhernandezrey.com).** Un reclutador o líder técnico que evalúa a Omar Hernández Rey para contratarlo como Ingeniero de Software. Llega con poco tiempo, compara candidatos y necesita comprobar rápido qué ha construido, con qué tecnologías y con qué nivel. Confirmado por Omar el 2026-11-14: el objetivo principal del sitio es que lo contraten.

**Administrador del dashboard (`/admin`).** Solo Omar. Es el único usuario con acceso. Lo usa con frecuencia desde el teléfono, así que cada tarea del panel debe poder completarse con una mano a 375 px antes de pensarse para escritorio.

Audiencia secundaria: negocios que piden un servicio freelance. Existe y se atiende, pero no dirige las decisiones del sitio.

## Product Purpose

El portafolio demuestra, con trabajo real y verificable, que Omar es contratable como Ingeniero de Software.

El dashboard es el motor central de ese portafolio: desde él Omar crea, edita, ordena, publica y elimina todo el contenido del sitio (proyectos, skills, educación e insignias, servicios, tecnologías, experiencia, perfil) sin programar ni desplegar, y consulta métricas reales de su actividad.

Éxito significa dos cosas: que añadir una insignia o un proyecto tome un minuto desde el teléfono, y que cada cifra que ve un visitante o el propio Omar salga de una fuente real.

## Positioning

Un portafolio cuyo contenido y cuyas métricas se gobiernan desde un panel propio conectado a datos reales (base de datos y actividad de GitHub), y cuyos proyectos se muestran funcionando en vivo dentro de un visor de dispositivos interactivo, no como capturas.

## Operating Context

- El contenido vive en Supabase; el sitio público lee de ahí con respaldo en los archivos originales del repositorio.
- Las métricas de actividad provienen de los repositorios de GitHub del usuario `omarhernandezrey`, ingeridas por un trabajo programado y leídas desde la base de datos, nunca en vivo desde la API.
- Los trabajos programados corren en GitHub Actions; el despliegue es en Vercel.
- Un bot de Telegram notifica a Omar de eventos reales del sitio.
- El sitio es bilingüe (español e inglés). El español es el idioma de origen.
- El plan de trabajo, las fases y las reglas de ejecución están en `PLAN_MAESTRO_DASHBOARD.md`.

## Capabilities and Constraints

Capacidades confirmadas del dashboard:

- Edición completa de cada sección del portafolio, con borrador y publicación.
- Insignias y certificados añadibles por archivo o por URL.
- Métricas y gráficas con datos reales por repositorio: commits, líneas, lenguajes, actividad diaria, rachas.
- Área secundaria «Negocio» que conserva íntegro el CRM existente (leads, facturas, tickets, suscriptores, cronómetro, webhooks). Confirmado por Omar el 2026-11-14.

Restricciones que todo trabajo futuro debe respetar:

- **No se elimina contenido existente.** Migrar no es borrar.
- **El visor de proyectos no se modifica.** Es `src/components/shared/Card.tsx`: tres mockups con iframes interactivos, también al tacto. Solo puede cambiar de dónde recibe sus datos.
- **La paleta existente se respeta.** Hay diez paletas conmutables definidas por variables CSS.
- **Ningún dato inventado.** Si una cifra no viene de la base de datos o de GitHub, no se muestra.
- **Mobile-first.** Se diseña y valida primero a 375 px.
- El resultado no debe parecer una plantilla generada: debe leerse como trabajo de un equipo de diseño.

Decisión de producto aún abierta: el proveedor de autenticación del panel (Supabase Auth endurecido frente a AWS Cognito). Ver D-1 en el plan maestro.

## Brand Commitments

- Nombre: Omar Hernández Rey. Dominio: omarhernandezrey.com.
- Se presenta primero como «Ingeniero de Software» y después como «Desarrollador Web Full Stack».
- Voz: directa, profesional, en español neutro; versión en inglés equivalente.
- El visor de dispositivos con proyectos en vivo es un rasgo de identidad del sitio.

## Evidence on Hand

Contenido real disponible, medido sobre el código (ver `src/lib/portfolio/types.ts`, `CONTENIDO_ORIGINAL`):

- 22 proyectos con demo, repositorio y stack (`src/lib/projectsData.ts`).
- 172 ítems de educación en 7 categorías, 171 con certificado (`src/lib/educationData.ts`; imágenes en `public/images/education/`).
- 7 insignias destacadas, 8 skills, 4 servicios, 42 tecnologías, 4 hitos de trayectoria.
- Actividad real de los repositorios públicos de GitHub.

Ausencias que no se deben rellenar: no hay cifras de impacto de negocio, clientes nombrados como referencia ni testimonios verificados registrados aquí. No se inventan métricas, logos de clientes ni citas.

## Product Principles

1. **Lo real por encima de lo vistoso.** Una cifra verdadera y modesta vale más que una gráfica impresionante sin fuente.
2. **El panel sirve al portafolio.** Cada módulo del dashboard existe porque cambia algo que el visitante ve o porque le dice a Omar algo cierto sobre su trabajo.
3. **Editar no debe exigir programar.** Si un cambio de contenido requiere tocar código, el panel está incompleto.
4. **Conservar antes que rehacer.** Lo que ya funciona y costó construir se preserva.
5. **El teléfono es el caso principal** del administrador, no una adaptación.
