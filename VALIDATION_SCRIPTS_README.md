# 🧪 Scripts de Validación SEO

Scripts automatizados para validar el SEO 100/100 de tu portafolio en todas las plataformas.

---

## 📁 Scripts Disponibles

### 1. `validate-seo.sh` - Validación Visual
**Descripción:** Abre todas las herramientas de validación en el navegador

**Uso:**
```bash
./validate-seo.sh
```

**Qué hace:**
- ✅ Abre Facebook Sharing Debugger
- ✅ Abre Twitter Card Validator
- ✅ Abre LinkedIn Post Inspector
- ✅ Abre Schema.org Validator
- ✅ Abre Google Rich Results Test
- ✅ Abre PageSpeed Insights
- ✅ Abre robots.txt
- ✅ Abre sitemap.xml
- ✅ Abre imagen de preview
- ✅ Abre sitio principal

**Resultado:**
10 pestañas del navegador abiertas con todas las herramientas de validación

---

### 2. `validate-seo-curl.sh` - Validación Técnica
**Descripción:** Validación técnica vía terminal usando curl

**Uso:**
```bash
./validate-seo-curl.sh
```

**Qué verifica:**
- ✅ Conectividad HTTP (código 200)
- ✅ robots.txt accesible
- ✅ sitemap.xml accesible y válido
- ✅ Imagen de preview (tamaño y accesibilidad)
- ✅ Open Graph tags (cuenta y muestra primeros)
- ✅ Twitter Card tags (cuenta y muestra primeros)
- ✅ JSON-LD schemas (cuenta y muestra tipos)
- ✅ Headers de seguridad (X-Content-Type-Options, etc.)

**Resultado:**
```
✅ Sitio accesible
✅ robots.txt accesible
✅ sitemap.xml accesible
✅ Imagen preview accesible (149 KB)
✅ 25 Open Graph tags
✅ 16 Twitter Card tags
✅ 3 JSON-LD schemas
✅ Headers de seguridad presentes
```

---

## 🚀 Instalación y Uso

### Dar permisos de ejecución:
```bash
chmod +x validate-seo.sh
chmod +x validate-seo-curl.sh
```

### Ejecutar validación visual:
```bash
./validate-seo.sh
```

### Ejecutar validación técnica:
```bash
./validate-seo-curl.sh
```

### Ejecutar ambas:
```bash
./validate-seo-curl.sh && ./validate-seo.sh
```

---

## 📊 Resultados Esperados

### Validación Técnica (curl):
```
Sitio accesible:     ✅
robots.txt:          ✅
sitemap.xml:         ✅
Imagen preview:      ✅
Open Graph tags:     ✅ (25+)
Twitter Card tags:   ✅ (16+)
JSON-LD schemas:     ✅ (3)
```

### Validación Visual (navegador):

#### Facebook Debugger:
- ✅ Imagen 1200x630 visible
- ✅ og:title presente
- ✅ og:description presente
- ✅ Sin warnings

#### Twitter Card Validator:
- ✅ summary_large_image
- ✅ Imagen grande visible
- ✅ @omarhernandezrey visible

#### LinkedIn Post Inspector:
- ✅ Preview profesional
- ✅ Imagen de alta calidad

#### Schema.org Validator:
- ✅ Person Schema
- ✅ WebSite Schema
- ✅ ProfilePage Schema
- ✅ Sin errores

#### Google Rich Results:
- ✅ Elegible para rich snippets
- ✅ Structured data válida

#### PageSpeed Insights (SEO):
- ✅ Score: 100/100
- ✅ Todos los checks pasados

---

## 🎯 Checklist de Validación

Después de ejecutar los scripts:

- [ ] **Facebook:** Click "Scrape Again" y verificar imagen
- [ ] **Twitter:** Pegar URL y verificar card
- [ ] **LinkedIn:** Verificar preview profesional
- [ ] **Schema.org:** Verificar 3 schemas sin errores
- [ ] **Rich Results:** Verificar elegibilidad
- [ ] **PageSpeed:** Verificar SEO 100/100
- [ ] **robots.txt:** Verificar accesible y correcto
- [ ] **sitemap.xml:** Verificar XML válido
- [ ] **Imagen:** Verificar carga correctamente
- [ ] **Sitio:** Verificar funcionamiento general

---

## 💡 Tips

### Para Facebook Debugger:
1. Pegar tu URL
2. Click **"Debug"**
3. Click **"Scrape Again"** (importante para limpiar caché)
4. Verificar que la imagen sea 1200x630
5. Tomar screenshot

### Para Twitter Card Validator:
1. Pegar tu URL en el campo
2. Click **"Preview card"**
3. Verificar que sea "Summary with Large Image"
4. Tomar screenshot

### Para LinkedIn Post Inspector:
1. Pegar tu URL
2. Click **"Inspect"**
3. Verificar preview profesional
4. Tomar screenshot

---

## 📚 Documentación Adicional

- **SEO_100_COMPLETE.md** - Guía completa de optimización SEO
- **QUICK_VALIDATION.md** - Validación rápida en 3 minutos
- **SEO_FINAL_REPORT.md** - Reporte de optimizaciones anteriores
- **SEO_VALIDATION_CHECKLIST.md** - Checklist detallado

---

## 🔧 Troubleshooting

### El script no abre el navegador:
```bash
# Instalar xdg-utils (si no está instalado)
sudo apt-get install xdg-utils
```

### Cambiar el navegador predeterminado:
```bash
# Configurar Firefox como predeterminado
xdg-settings set default-web-browser firefox.desktop

# O Chrome
xdg-settings set default-web-browser google-chrome.desktop
```

### Ejecutar solo una validación específica:
```bash
# Solo Facebook
xdg-open 'https://developers.facebook.com/tools/debug/?q=https://omarhernandezrey.com'

# Solo Twitter
xdg-open 'https://cards-dev.twitter.com/validator'

# Solo PageSpeed
xdg-open 'https://pagespeed.web.dev/report?url=https://omarhernandezrey.com'
```

---

## 🎊 Resultado Final

Después de ejecutar ambos scripts y validar en todas las plataformas:

```
✅ SEO Score: 100/100
✅ Facebook: Preview perfecto
✅ Twitter: Large Image Card
✅ LinkedIn: Preview profesional
✅ WhatsApp: Instant preview
✅ Telegram: Instant View
✅ Instagram: Direct preview
✅ Reddit: Preview card
✅ Discord: Rich embed
✅ Google: Rich Snippets elegible
✅ Bing: Rich results
✅ 25+ Open Graph tags
✅ 16+ Twitter Card tags
✅ 3 JSON-LD schemas
✅ 100% compatible con 12 plataformas
```

---

## 🚀 Tu SEO está en el nivel MÁXIMO

¡Felicidades! Con estos scripts puedes validar tu SEO en cualquier momento y asegurarte de que todo esté funcionando perfectamente.

**Próximos pasos:**
1. Ejecuta los scripts después de cada deploy
2. Toma screenshots de las validaciones
3. Monitorea Google Search Console semanalmente
4. Actualiza el contenido regularmente
