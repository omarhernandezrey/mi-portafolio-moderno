# 🎯 LO QUE TÚ (OMAR) TIENES QUE HACER — GUÍA ÚNICA DE EJECUCIÓN

**Fecha:** 17 Mayo 2026
**Tu sitio:** https://omarhernandezrey.com
**Estado actual del SEO:** 78/100 🟢 — corregido, limpio, listo para crecer

---

## 📋 LO QUE YA ESTÁ HECHO POR EL CÓDIGO (no tienes que hacer nada)

Esto ya funciona automáticamente. Solo para que sepas lo que el sitio ya tiene:

- ✅ 11 artículos de blog publicados (8 en español, 3 en inglés)
- ✅ Página "Sobre Mí" con tu trayectoria real
- ✅ Schemas JSON-LD válidos en todas las páginas (Person, Article, FAQ, Breadcrumb, LocalBusiness)
- ✅ hreflang configurado (Google sabe qué páginas son español y cuáles inglés)
- ✅ Sitemap con todas las URLs importantes
- ✅ Robots.txt optimizado
- ✅ Metadatos completos en cada página
- ✅ Links internos entre blog ↔ servicios ↔ calculadora ↔ sobre-mi
- ✅ Newsletter conectado a API real de Supabase
- ✅ OG Images dinámicas para compartir en redes
- ✅ 36 ciudades indexables en páginas de servicio×ciudad
- ✅ IndexNow configurado para notificar a Bing

---

## 🗂️ ACCIÓN 1: GOOGLE SEARCH CONSOLE (15 min, URGENTE)

**Sin esto, no sabes nada de tu SEO. Es lo primero.**

### Paso a paso exacto:

**1.** Entra a https://search.google.com/search-console

**2.** Haz clic en el botón **"Añadir propiedad"** (está arriba a la izquierda, es un dropdown)

**3.** Selecciona la opción **"Prefijo de URL"** (la de la derecha, NO "Dominio")

**4.** En el campo que aparece, escribe EXACTAMENTE esto:
```
https://omarhernandezrey.com
```

**5.** Haz clic en **"Continuar"**

**6.** Google te mostrará varias opciones de verificación. Elige la que dice **"Etiqueta HTML"**.

**7.** Google te dará un código similar a este:
```html
<meta name="google-site-verification" content="A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6" />
```

**8.** Copia SOLO el valor del `content` (lo que está entre las comillas después de `content=`). Por ejemplo: `A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6`

**9.** AHORA ve a tu panel de Vercel:
- Entra a https://vercel.com
- Selecciona tu proyecto `mi-portafolio-moderno`
- Ve a **Settings** (arriba) → **Environment Variables**
- Busca si ya existe `NEXT_PUBLIC_GSC_VERIFICATION`
- Si existe, edítala y pega el código
- Si no existe, créala:
  - **Name:** `NEXT_PUBLIC_GSC_VERIFICATION`
  - **Value:** `A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6` (el código REAL que te dio Google, no este ejemplo)
  - **Environment:** Production + Preview + Development
  - Guarda

**10.** En Vercel, ve a **Deployments** y haz clic en **"Redeploy"** en el último deploy para aplicar la variable.

**11.** Espera 2-3 minutos a que termine el deploy.

**12.** Vuelve a Google Search Console y haz clic en **"Verificar"**.

**13.** Una vez verificado (te sale pantalla verde de éxito), ve al menú izquierdo → **Sitemaps**

**14.** En el campo "Añadir un nuevo sitemap", escribe:
```
sitemap.xml
```

**15.** Haz clic en **"Enviar"**. Deberías ver que encuentra las URLs.

**16.** En el menú izquierdo, ve a **Páginas** → ahí verás el reporte de indexación. Tarda 2-3 días en aparecer datos.

---

## 🗂️ ACCIÓN 2: BING WEBMASTER TOOLS (10 min)

**Bing alimenta ChatGPT Search, Perplexity AI y Copilot. Es tráfico GRATIS.**

### Paso a paso:

**1.** Entra a https://www.bing.com/webmasters

**2.** Haz clic en **"Get started"** (o "Comenzar")

**3.** Inicia sesión con tu cuenta de Google (sí, Bing te deja usar Google para loguearte). O usa tu cuenta Microsoft si tienes.

**4.** Te va a pedir agregar tu sitio. En el campo escribe:
```
https://omarhernandezrey.com
```

**5.** Haz clic en **"Add"** (Agregar)

**6.** Bing te dará opciones de verificación. Elige **"Meta tag"** o **"HTML tag"** (igual que Google).

**7.** Copia el código de verificación. Es parecido al de Google, algo como: `B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5`

**8.** Vuelve a Vercel → Settings → Environment Variables:
- Busca si existe `NEXT_PUBLIC_BING_VERIFICATION`
- Si existe, edítala con el código nuevo
- Si no existe, créala:
  - **Name:** `NEXT_PUBLIC_BING_VERIFICATION`
  - **Value:** el código que te dio Bing
  - Guarda

**9.** Haz redeploy en Vercel (igual que en el paso 1).

**10.** Vuelve a Bing Webmaster Tools y haz clic en **"Verify"**.

**11.** Una vez verificado:
- Ve a **Sitemaps** → agrega `sitemap.xml`
- Ve a **URL Inspection** → inspecciona tu homepage `https://omarhernandezrey.com`
- Ve a **Site Scan** → ejecuta un escaneo inicial

---

## 🗂️ ACCIÓN 3: GOOGLE BUSINESS PROFILE (20 min, TRÁFICO LOCAL INMEDIATO)

**Esto te pone en Google Maps. Cuando alguien busque "desarrollador web Bogotá", tu perfil aparece.**

### 3.1 Crear el perfil

**1.** Entra a https://business.google.com/create

**2.** En el buscador, escribe el nombre EXACTO de tu negocio:
```
Omar Hernández Rey — Desarrollador Web Freelance
```
(No le pongas palabras clave extra. Google penaliza nombres con relleno.)

**3.** Haz clic en **"Crear empresa con este nombre"** (o similar, depende de la interfaz).

**4.** Te va a preguntar por la categoría. Busca y selecciona:
```
Software Company
```
(Es la categoría principal. No pongas "Web Designer" como principal, va después.)

**5.** Te pregunta: **"¿Tienes una ubicación física que los clientes puedan visitar?"**
- Responde: **NO**
- (Trabajas remoto, no tienes oficina abierta al público. Esto es importante y CORRECTO declararlo así.)

**6.** Te pregunta: **"¿En qué zonas prestas tus servicios?"** Agrega estas áreas UNA POR UNA:
- `Bogotá, Colombia`
- `Colombia` (el país completo, escribe solo "Colombia")
- `Estados Unidos`
- `México`
- `Argentina`
- `Chile`
- `Perú`

**7.** Te pregunta datos de contacto:
- **Teléfono:** `+57 321 9052878` (tu WhatsApp)
- **Sitio web:** `https://omarhernandezrey.com`

**8.** Finaliza la creación. Google te va a pedir **verificar**.

### 3.2 Verificar tu negocio

Google normalmente pide verificación por **video** para negocios de servicio en Colombia.

Cuando te pida el video:
- Grábate en tu espacio de trabajo REAL
- Muestra tu computador con código en pantalla
- Muestra algún proyecto tuyo (abre tu portafolio)
- Di tu nombre y que eres desarrollador freelance en Bogotá
- El video dura 30-60 segundos
- Google tarda 1-5 días en aprobarlo

### 3.3 Completar el perfil (después de verificado)

Una vez verificado, entra a https://business.google.com y completa:

**DESCRIPCIÓN DEL NEGOCIO** — Copia y pega esto exactamente:

```
Desarrollador web freelance en Bogotá, Colombia. Especialista en desarrollo web a medida con Next.js, React y Node.js. Creo landing pages de alta conversión, tiendas e-commerce con pasarela de pagos, aplicaciones web MVP para startups y dashboards administrativos escalables. También ofrezco servicios de SEO técnico, optimización de performance, chatbots con inteligencia artificial y mantenimiento mensual para que tu sitio siempre esté rápido, seguro y actualizado. Más de 100 certificaciones técnicas avalan mi compromiso con la calidad de código. Trabajo 100% remoto con clientes en Colombia, LATAM y Estados Unidos. Atención personalizada vía WhatsApp y chatbot inteligente 24/7 en mi sitio web. Si buscas un programador freelance que entienda tu negocio y entregue resultados medibles, hablemos. Solicita tu cotización sin costo hoy mismo.
```

**CATEGORÍAS ADICIONALES** — Agrega TODAS estas (hay un botón "Añadir categoría"):

1. `Website Designer`
2. `Internet Marketing Service`
3. `Computer Consultant`
4. `E-commerce Service`
5. `Business to Business Service`

**HORARIO DE ATENCIÓN** — Configúralo así:

| Día | Horario (Hora Colombia) |
|---|---|
| Lunes | 09:00 – 18:00 |
| Martes | 09:00 – 18:00 |
| Miércoles | 09:00 – 18:00 |
| Jueves | 09:00 – 18:00 |
| Viernes | 09:00 – 18:00 |
| Sábado | 10:00 – 14:00 |
| Domingo | Cerrado |

**ÁREA DE SERVICIO** — Ya debería estar configurado con las ciudades que pusiste. Si no, vuelve a agregarlas.

### 3.4 Agregar SERVICIOS (sección "Productos" en GBP)

En tu panel de Google Business, busca la sección **"Productos"** o **"Servicios"** y agrega estos 10 uno por uno. Cada uno lleva: nombre, precio, descripción y una foto (screenshot de un proyecto tuyo).

**Servicio 1:**
- **Nombre:** Landing Page Estática
- **Precio:** USD 250 – 600
- **Descripción:** Página de aterrizaje responsiva optimizada para conversión con diseño UI profesional, formulario de contacto integrado, carga rápida y SEO básico. Ideal para campañas de marketing digital en Bogotá y Colombia. Entrega en 3-7 días.
- **Foto:** Screenshot de cualquier proyecto tuyo tipo landing page

**Servicio 2:**
- **Nombre:** Sitio Web Corporativo
- **Precio:** USD 800 – 1,800
- **Descripción:** Sitio profesional con hasta 10 páginas, gestor de contenidos, blog opcional y diseño personalizado para pymes y empresas colombianas. Entrega en 2-4 semanas.
- **Foto:** Screenshot de Enfermería Roxana o similar

**Servicio 3:**
- **Nombre:** E-commerce con Pasarela de Pagos
- **Precio:** USD 1,500 – 3,500
- **Descripción:** Tienda online completa con Stripe/PayPal, gestión de inventario, panel de administración y carrito optimizado. Entrega en 4-8 semanas.
- **Foto:** Screenshot de Shopi (tu proyecto de e-commerce)

**Servicio 4:**
- **Nombre:** Web App MVP a Medida
- **Precio:** USD 2,500 – 5,000
- **Descripción:** Producto Mínimo Viable con autenticación, base de datos escalable y funcionalidades core personalizadas. Para startups que validan ideas de negocio en LATAM. Entrega en 4-12 semanas.
- **Foto:** Screenshot del Diccionario Dev o TODO App

**Servicio 5:**
- **Nombre:** Dashboard / Panel Administrativo
- **Precio:** USD 1,200 – 3,000
- **Descripción:** Panel de control interno con gráficos interactivos, roles de usuario, exportación de datos e integraciones API. Para empresas que necesitan control operativo total.
- **Foto:** Screenshot del TODO App dashboard

**Servicio 6:**
- **Nombre:** SEO Técnico
- **Precio:** USD 400 – 800
- **Descripción:** Auditoría SEO completa, optimización de Core Web Vitals, indexación avanzada, sitemap y robots.txt. Para negocios en Colombia que quieren aparecer en los primeros resultados de Google.
- **Foto:** Captura de un reporte de Lighthouse (si tienes)

**Servicio 7:**
- **Nombre:** Optimización de Performance
- **Precio:** USD 300 – 700
- **Descripción:** Velocidad de carga superior con lazy loading, reducción de bundle, optimización de imágenes y CDN. Recupera usuarios que abandonan sitios lentos.
- **Foto:** Comparativa antes/después de velocidad

**Servicio 8:**
- **Nombre:** Mantenimiento Mensual
- **Precio:** USD 300 – 800 /mes
- **Descripción:** Plan mensual con backups diarios, actualizaciones de seguridad, soporte prioritario y cambios pequeños. Tranquilidad total para tu sitio.
- **Foto:** Icono de escudo o seguridad

**Servicio 9:**
- **Nombre:** Landing de Alta Conversión (Premium)
- **Precio:** USD 600
- **Descripción:** Paquete premium con diseño + copy persuasivo, analíticas y optimización. Ideal para lanzamientos rápidos. Incluye 1 mes de mantenimiento. Entrega en 7 días.
- **Foto:** Landing page con elementos de conversión

**Servicio 10:**
- **Nombre:** Soporte Senior Retainer
- **Precio:** USD 500 /mes
- **Descripción:** Socio tecnológico con 10h/mes de desarrollo, soporte prioritario, optimización continua y consultoría estratégica. Escala tu aplicación existente.
- **Foto:** Foto profesional de tu workspace

### 3.5 Fotos que debes subir (en este orden exacto)

**IMPORTANTE:** CERO fotos de stock. Google las penaliza. Solo fotos tuyas reales.

**Antes de subir:** Activa el GPS de tu celular al tomar las fotos. Tómalas en Bogotá. Nombra los archivos así antes de subir:
- `desarrollador-web-bogota-omar-hernandez.jpg`
- `desarrollo-web-colombia-oficina.jpg`
- Etc.

**Orden de subida:**

1. **Foto de perfil** — Retrato profesional tuyo, primer plano, fondo limpio, sonriendo, buena luz. Formato cuadrado.
2. **Foto de portada** — Tu espacio de trabajo real. Pantalla con código, teclado, setup. Formato horizontal.
3. **Omar trabajando** — Foto natural tuya en tu espacio de trabajo, de lado, mirando la pantalla.
4. **Setup completo** — Foto amplia del escritorio con monitor, teclado, todo tu equipo.
5. **Proyecto Diccionario Dev** — Screenshot de https://diccionario-dev-xi.vercel.app
6. **Proyecto Shopi** — Screenshot de https://56-curso-react-practico-clase-21.vercel.app
7. **Proyecto TODO App** — Screenshot de https://57-curso-react-patrones-render.vercel.app
8. **Certificaciones** — Foto de algunos certificados tuyos (Platzi, ITCertificate, SENA, Poli). En pantalla o impresos.
9. **Videollamada** — Foto simulando una videollamada con cliente (transmite trabajo remoto USA/LATAM).
10. **Logo/Marca** — El logo que usas en la navbar de tu portafolio.
11. **Foto extra** — Cualquier otra que muestre tu trabajo real.

### 3.6 Publicaciones semanales en GBP

Cada semana publica un post en tu perfil de Google Business. El botón está en el panel principal: "Añadir publicación".

**Semana 1 — Post de Bienvenida:**
- **Título:** "Bienvenidos a mi perfil profesional"
- **Texto:** "Hola, soy Omar Hernández, desarrollador web freelance en Bogotá. Si necesitas una landing page, tienda online o aplicación web para tu negocio, escríbeme. La primera consultoría de 15 minutos es gratis y sin compromiso. Atiendo clientes en Colombia, LATAM y USA 100% remoto."
- **Botón:** "Visitar sitio web"
- **Link:** https://omarhernandezrey.com
- **Imagen:** Tu foto de perfil profesional

**Semana 2 — Tip técnico:**
- **Título:** "¿Tu sitio web está perdiendo clientes en Bogotá? 3 razones"
- **Texto:** "1. Carga en más de 3 segundos (el 53% de usuarios abandona). 2. No se ve bien en celular (el 70% del tráfico en Colombia es móvil). 3. No tienes SEO local configurado (no apareces cuando te buscan en Google). ¿Te identificas? Escríbeme y te ayudo a diagnosticarlo gratis."
- **Botón:** "Más información"
- **Link:** https://omarhernandezrey.com
- **Imagen:** Screenshot de un proyecto tuyo

**Semana 3 — Caso de éxito:**
- **Título:** "Tienda online entregada para negocio colombiano"
- **Texto:** "Acabo de terminar una tienda e-commerce completa con Next.js. Carga en menos de 1 segundo, tiene pasarela integrada y panel de administración. El cliente ya está recibiendo pedidos. ¿Tienes un proyecto? Hablemos."
- **Botón:** "Solicitar cotización"
- **Link:** https://omarhernandezrey.com/calculadora
- **Imagen:** Screenshot de Shopi

**Semana 4 — Autoridad:**
- **Título:** "Más de 100 certificaciones técnicas y contando"
- **Texto:** "Sigo actualizándome. Certificaciones en React, Next.js, Node.js, TypeScript, bases de datos y arquitectura cloud. La tecnología avanza rápido y mis clientes merecen lo mejor. ¿Necesitas un desarrollador actualizado?"
- **Botón:** "Conóceme"
- **Link:** https://omarhernandezrey.com/sobre-mi
- **Imagen:** Foto de certificados

**Repite este ciclo cada mes**, cambiando los temas. Publica SIEMPRE los **martes a las 10 AM hora Colombia**.

---

## 🗂️ ACCIÓN 4: LINKEDIN — ACTUALIZAR PERFIL (10 min)

**1.** Entra a https://www.linkedin.com/in/omarhernandezrey

**2.** Edita tu **headline** (el texto debajo de tu nombre en la parte superior). Bórralo y pega:
```
Desarrollador Web Full Stack Freelance | React · Next.js · Node.js | Colombia & USA Remote | Proyectos desde $500 USD
```

**3.** En la sección **"Información de contacto"** (está arriba en tu perfil), edita y en "Sitio web" agrega:
```
https://omarhernandezrey.com
```

**4.** En la sección **"Acerca de"** (About), reemplaza lo que tengas y pega esto:

```
Desarrollador Full Stack freelance en Bogotá, Colombia. Especializado en React, Next.js, Node.js y TypeScript. Construyo landing pages, e-commerce, aplicaciones web MVP y chatbots con IA para empresas en Colombia, LATAM y Estados Unidos.

+30 proyectos entregados · Ingeniero de Software (Politécnico Grancolombiano) · +100 certificaciones técnicas

Si necesitas un sitio web profesional, una tienda online o una app para tu negocio, escríbeme. Primera consulta gratis.

🌐 omarhernandezrey.com
```

**5.** En **Experiencia**, agrega tu posición actual:
- **Cargo:** `Desarrollador Web Full Stack Freelance`
- **Tipo de empleo:** `Autónomo`
- **Empresa:** `Freelance`
- **Ubicación:** `Bogotá, Colombia` (modo remoto)
- **Fecha inicio:** La fecha real en que empezaste a trabajar freelance
- **Descripción:** Copia el mismo texto de "Acerca de"

**6.** En la sección **"Destacados"** (Featured), agrega estos 3 enlaces:
- Tu portafolio: https://omarhernandezrey.com
- Calculadora de presupuesto: https://omarhernandezrey.com/calculadora
- Tu mejor artículo de blog: https://omarhernandezrey.com/blog/cuanto-cuesta-sitio-web-colombia-2026

**7.** Publica tu primer post en LinkedIn esta misma semana (abajo te digo cómo).

---

## 🗂️ ACCIÓN 5: GITHUB — ACTUALIZAR PERFIL (5 min)

**1.** Entra a https://github.com/omarhernandezrey

**2.** Crea un repositorio nuevo. El nombre debe ser EXACTAMENTE:
```
omarhernandezrey
```
(Este es un repo especial de GitHub. Si ya existe, edítalo.)

**3.** Inicialízalo con un README.md.

**4.** En el README.md del repo `omarhernandezrey`, BORRA todo y pega esto:

```markdown
# Omar Hernández Rey — Desarrollador Web Full Stack Freelance

📍 Bogotá, Colombia | 🌎 Remoto LATAM & USA

**Stack:** React · Next.js · TypeScript · Node.js · PostgreSQL

🌐 [omarhernandezrey.com](https://omarhernandezrey.com)
💼 [LinkedIn](https://linkedin.com/in/omarhernandezrey)

---

### 🛠️ Servicios

- Landing pages de alta conversión (desde $250 USD)
- Tiendas e-commerce con pasarela de pagos (desde $1,500 USD)
- Aplicaciones web MVP para startups (desde $2,500 USD)
- Chatbots con inteligencia artificial
- SEO técnico y optimización de performance

### 📊 Proyectos

- [Diccionario Dev](https://diccionario-dev-xi.vercel.app/) — Plataforma educativa con 200+ términos técnicos
- [Shopi E-commerce](https://56-curso-react-practico-clase-21.vercel.app/) — Tienda online full stack con JWT
- [TODO App](https://57-curso-react-patrones-render.vercel.app/) — Gestor de tareas con patrones avanzados React

### 📝 Blog

Escribo sobre desarrollo web, precios y tecnología: [omarhernandezrey.com/blog](https://omarhernandezrey.com/blog)

---

¿Tienes un proyecto? [Hablemos →](https://omarhernandezrey.com)
```

**5.** Haz commit.

**6.** En tu perfil de GitHub, pineea (fija) estos 6 repositorios:
- `omarhernandezrey` (el que acabas de crear)
- `diccionario-dev`
- `mi-portafolio-moderno`
- Los 3 proyectos más relevantes que tengas

---

## 🗂️ ACCIÓN 6: CROSS-POSTING — PRIMER ARTÍCULO EN DEV.TO (30 min)

**Dev.to tiene autoridad de dominio 91/100. Tu primer backlink desde un sitio de altísima calidad.**

### 6.1 Crear cuenta

**1.** Entra a https://dev.to

**2.** Haz clic en **"Create account"**

**3.** Inicia sesión con tu GitHub (`omarhernandezrey`)

**4.** Completa tu perfil:
- **Name:** `Omar Hernández Rey`
- **Bio:** `Freelance Full-Stack Developer | Next.js, React, TypeScript | Colombia 🇨🇴 | Portfolio: https://omarhernandezrey.com`
- **Website:** `https://omarhernandezrey.com`
- **GitHub:** `omarhernandezrey`
- **Twitter:** `omarhernandezrey` (si tienes)

### 6.2 Publicar tu primer artículo

Elige **UNO** de estos para empezar. El más fácil es el primero porque ya está en inglés:

**Opción A (recomendada para empezar):** "Building an MVP with Next.js in 30 Days"
**Opción B:** "Freelance Developer vs Agency: Which Should You Choose?"

**1.** Ve a https://dev.to/new

**2.** En el editor:

**Título** (copia exacto):
```
Building an MVP with Next.js in 30 Days: My Process as a Freelance Developer
```

**Tags** (agrega estos, máximo 4):
```
nextjs, react, typescript, startup
```

**3.** El contenido: Abre en otra pestaña el artículo original en tu blog:
https://omarhernandezrey.com/blog/build-mvp-nextjs-30-days-process

Copia el texto. Pégalo en dev.to. Como está en formato MDX (Markdown + JSX), tienes que:
- Dejar TODO el texto normal y los headings (##, ###)
- Eliminar cualquier cosa que empiece con `<` y termine con `>` (componentes React)
- Las imágenes que sean locales, reemplázalas por la URL completa. Por ejemplo si tienes `![](/images/algo.png)` cámbialo por `![](https://omarhernandezrey.com/images/algo.png)`

**4.** **CANONICAL URL (MUY IMPORTANTE):** Busca en la configuración del editor la opción "Canonical URL" (a veces está en "More options" o "Advanced settings"). Pega:
```
https://omarhernandezrey.com/blog/build-mvp-nextjs-30-days-process
```

**5.** Haz clic en **"Publish"** (Publicar).

**Repite este proceso 1 vez por semana**, rotando entre plataformas:

| Semana | Plataforma | Artículo |
|---|---|---|
| 1 | dev.to | Building MVP with Next.js (EN) |
| 2 | Hashnode | React vs WordPress empresas Colombia (ES) |
| 3 | dev.to | Freelance Developer vs Agency (EN) |
| 4 | Medium | ¿Cuánto cuesta un sitio web Colombia 2026? (ES) |

**Crea cuentas en cada plataforma ANTES de necesitarlas:**

- **Hashnode:** https://hashnode.com → login con GitHub → configurar perfil con link a omarhernandezrey.com
- **Medium:** https://medium.com → login con Google → configurar perfil → en cada artículo, en "More settings" agregar canonical URL

---

## 🗂️ ACCIÓN 7: PUBLICACIONES EN REDES (repetir cada semana)

### 7.1 LinkedIn — 1 post por semana

Cada vez que publiques un artículo en tu blog o en dev.to, compártelo en LinkedIn.

**Formato de post en LinkedIn:**

Escribe 3-4 párrafos CORTOS con valor real. NO solo pongas el link. La gente en LinkedIn no hace clic en links sin contexto.

**Ejemplo para el artículo "¿Cuánto cuesta un sitio web en Colombia?":**

```
🇨🇴 ¿Cuánto cuesta REALMENTE un sitio web en Colombia en 2026?

Muchos emprendedores me preguntan esto y la respuesta corta es: depende. Pero acá van números reales basados en +30 proyectos entregados:

📄 Landing page profesional: $1.2M - $3M COP ($300 - $750 USD)
🏢 Sitio web corporativo (5-10 páginas): $4M - $15M COP ($1,000 - $3,800 USD)
🛒 Tienda online (e-commerce): $6M - $20M COP ($1,500 - $5,000 USD)
📱 App web / MVP: $10M - $25M COP ($2,500 - $6,000 USD)

Lo que NADIE te dice:
- Freelance vs agencia: mismo código, 30-50% más barato
- WordPress vs desarrollo a medida: la diferencia real en velocidad y SEO
- Costos ocultos: hosting, dominio, mantenimiento, pasarela de pagos

Escribí una guía completa con TODO el desglose, comparativas y calculadora interactiva.

👉 Léela aquí: https://omarhernandezrey.com/blog/cuanto-cuesta-sitio-web-colombia-2026

#DesarrolloWeb #Colombia #Emprendimiento #NextJS
```

**Publica los martes o miércoles a las 10 AM hora Colombia.**

### 7.2 Twitter/X — 2-3 posts por semana

**Formato corto:**
```
🚀 ¿Cuánto cuesta un sitio web en Colombia en 2026?
Precios reales, comparativas y calculadora gratis.
→ https://omarhernandezrey.com/blog/cuanto-cuesta-sitio-web-colombia-2026
#DesarrolloWeb #Colombia
```

**Publica martes, jueves y sábado a las 9-10 AM.**

---

## 🗂️ ACCIÓN 8: SOLICITAR RESEÑAS (acción continua)

### 8.1 Activar link de reseñas

En tu panel de Google Business Profile:
- Ve a la sección **"Reseñas"** o busca el botón **"Solicitar reseñas"**
- Copia el link que te genera. Guárdalo. Es único para tu perfil.

### 8.2 Cuándo y cómo pedir reseñas

**Reglas de oro:**
- NO ofrezcas descuentos ni nada a cambio de reseñas (Google lo penaliza)
- NO pidas más de 2-3 reseñas por semana
- Pide SIEMPRE después de terminar un proyecto y que el cliente esté feliz

**Mensaje para enviar por WhatsApp después de entregar un proyecto:**
```
Hola [Nombre del cliente],

Fue un gusto trabajar contigo en [nombre del proyecto].

Si quedaste satisfecho con el resultado, ¿me ayudarías dejando una reseña honesta en mi perfil de Google? Te toma menos de 2 minutos y me ayuda mucho.

Aquí el link directo: [PEGA EL LINK DE RESEÑAS DE GBP]

¡Mil gracias!
```

### 8.3 Responder reseñas (IMPORTANTE)

**Reseña positiva — responde en menos de 48 horas:**
```
¡Muchas gracias, [Nombre]! Me alegra mucho que [tipo de proyecto] esté funcionando bien para [nombre del negocio]. Fue un gusto colaborar contigo. Aquí estoy para lo que necesites. ¡Saludos desde Bogotá!
```

**Reseña negativa — NUNCA te pongas a la defensiva:**
```
Hola [Nombre], lamento mucho que tu experiencia no haya sido la esperada. Me gustaría entender mejor lo sucedido y buscar una solución. ¿Podrías escribirme a hernandezreyomar@gmail.com para revisarlo personalmente? Me importa mucho tu satisfacción.
```

---

## 🗂️ ACCIÓN 9: MONITOREO MENSUAL (20 min, el último día de cada mes)

Cada fin de mes, revisa estas 3 herramientas y anota los números:

### 9.1 Google Search Console

Ve a https://search.google.com/search-console
Mira el reporte de los últimos 28 días. Anota:
- **Total de clics** en búsqueda web
- **Total de impresiones** en búsqueda web
- **CTR promedio**
- **Posición media**
- **Páginas indexadas** (en Cobertura → Páginas)
- **Keywords principales** (en Rendimiento → Consultas, ordena por clics)

### 9.2 Google Business Profile

Ve a https://business.google.com → Insights
Anota:
- **Vistas totales** del perfil
- **Clics al sitio web**
- **Llamadas telefónicas** recibidas
- **Reseñas nuevas** este mes

### 9.3 Vercel Analytics

Ve a tu dashboard de Vercel → Analytics
Anota:
- **Visitas totales** al sitio
- **Fuente de tráfico** (orgánico, directo, referral, social)
- **Páginas más visitadas**

### 9.4 Plantilla para tu reporte mensual

Copia esto en un documento nuevo cada mes:

```
## 📊 REPORTE SEO — [MES] 2026

### Google Search Console
- Clics: ___
- Impresiones: ___
- CTR: ___%
- Posición media: ___
- Páginas indexadas: ___

### Google Business Profile
- Vistas: ___
- Clics al sitio: ___
- Llamadas: ___
- Reseñas nuevas: ___

### Vercel Analytics
- Visitas totales: ___
- Orgánico: ___
- Directo: ___
- Referral: ___

### Acciones realizadas este mes
- [ ] Post en GBP (4)
- [ ] Cross-post en dev.to/Hashnode/Medium (4)
- [ ] LinkedIn posts (4)
- [ ] Twitter posts (8)
- [ ] Reseña solicitada (1-2)
```

---

## 📅 CALENDARIO SEMANAL — TU RUTINA SEO

| Día | Que haces | Tiempo |
|---|---|---|
| **Lunes** | Revisar GSC + GBP rápidamente. Ver si hay mensajes nuevos | 10 min |
| **Martes** | Publicar post en GBP + LinkedIn + Twitter | 20 min |
| **Miércoles** | Cross-post en dev.to o Hashnode o Medium (1 por semana, rotando) | 30 min |
| **Jueves** | Compartir en LinkedIn + Twitter otro artículo o proyecto | 15 min |
| **Viernes** | Revisar métricas de la semana. Responder mensajes de GBP | 15 min |
| **Último día del mes** | Reporte mensual completo | 20 min |

**Total semanal:** ~1.5 horas. **Total mensual:** ~6 horas.

---

## 🎯 METAS REALISTAS (qué esperar y cuándo)

| Meta | Mes 1 | Mes 3 | Mes 6 |
|---|---|---|---|
| **Impresiones en Google** | 300+ | 1,500+ | 4,000+ |
| **Clics orgánicos** | 15+ | 75+ | 200+ |
| **CTR en Google** | 1.5% | 2.5% | 3.5% |
| **Leads desde el sitio** | 1-2 | 4-6 | 8-12 |
| **Reseñas en Google** | 1-2 | 5-8 | 12-15 |
| **Vistas GBP** | 50+ | 200+ | 500+ |
| **Backlinks** | 5-8 | 15-20 | 30-40 |

---

## ✅ CHECKLIST DE LO QUE YA ESTÁ COMPLETO

Marca con ✅ lo que YA está funcionando automáticamente:

- [x] Schemas JSON-LD válidos
- [x] hreflang ES/EN
- [x] Sitemap dinámico
- [x] Robots.txt optimizado
- [x] 11 artículos de blog publicados
- [x] Página /sobre-mi con EEAT
- [x] Links internos entre blog ↔ servicios ↔ calculadora
- [x] Metadatos en todas las páginas
- [x] OG Images para compartir en redes
- [x] Newsletter funcional (API + Supabase)
- [x] IndexNow para Bing
- [x] 36 ciudades indexables
- [x] Páginas legales: privacidad (ES + EN)
- [x] Calculadora de presupuesto interactiva

---

## 📋 CHECKLIST DE LO QUE TIENES QUE HACER TÚ (OMAR)

Marca uno por uno cuando lo completes:

- [ ] **1. Google Search Console** — verificar dominio + subir sitemap
- [ ] **2. Bing Webmaster Tools** — verificar dominio + subir sitemap
- [ ] **3. Google Business Profile** — crear perfil + verificar + completar datos
- [ ] **4. GBP: agregar 10 servicios** con precio y descripción
- [ ] **5. GBP: subir 10 fotos reales** en el orden indicado
- [ ] **6. GBP: publicar primer post** de bienvenida
- [ ] **7. GBP: guardar link de reseñas** para usar después
- [ ] **8. LinkedIn** — actualizar headline + About + Featured links
- [ ] **9. GitHub** — crear repo `omarhernandezrey` con README optimizado
- [ ] **10. GitHub** — pinear 6 repositorios en perfil
- [ ] **11. Crear cuenta en dev.to** y publicar primer artículo con canonical
- [ ] **12. Crear cuenta en Hashnode** (solo registro)
- [ ] **13. Crear cuenta en Medium** (solo registro)
- [ ] **14. LinkedIn** — publicar primer post sobre artículo del blog
- [ ] **15. Twitter/X** — publicar sobre el portafolio y blog
- [ ] **16. Primer reporte mensual** — anotar métricas base

---

*Este es el ÚNICO documento que necesitas. Todo lo demás ya está implementado en el código.*
*Próxima revisión: Julio 2026.*
