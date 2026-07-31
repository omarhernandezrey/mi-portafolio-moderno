#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# 🧪 VALIDACIÓN SEO CON CURL - Verificación técnica
# Valida meta tags, headers y respuestas HTTP
# ═══════════════════════════════════════════════════════════════

URL='https://omarhernandezrey.com'

echo ''
echo '╔═══════════════════════════════════════════════════════════════╗'
echo '║                                                               ║'
echo '║           🧪 VALIDACIÓN TÉCNICA SEO - CURL TEST              ║'
echo '║                                                               ║'
echo '╚═══════════════════════════════════════════════════════════════╝'
echo ''
echo '🌐 URL: '$URL
echo '⏰ Timestamp: '$(date '+%Y-%m-%d %H:%M:%S')
echo ''
echo '──────────────────────────────────────────────────────────────'

# 1. Verificar que el sitio responda
echo ''
echo '🔍 [1/8] Verificando conectividad...'
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" $URL)
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ Sitio accesible (HTTP $HTTP_CODE)"
else
    echo "  ❌ Error: HTTP $HTTP_CODE"
fi

# 2. Verificar robots.txt
echo ''
echo '🤖 [2/8] Verificando robots.txt...'
ROBOTS_CODE=$(curl -o /dev/null -s -w "%{http_code}" $URL'/robots.txt')
if [ "$ROBOTS_CODE" = "200" ]; then
    echo "  ✅ robots.txt accesible"
    curl -s $URL'/robots.txt' | head -5
else
    echo "  ❌ robots.txt no accesible (HTTP $ROBOTS_CODE)"
fi

# 3. Verificar sitemap.xml
echo ''
echo '🗺️  [3/8] Verificando sitemap.xml...'
SITEMAP_CODE=$(curl -o /dev/null -s -w "%{http_code}" $URL'/sitemap.xml')
if [ "$SITEMAP_CODE" = "200" ]; then
    echo "  ✅ sitemap.xml accesible"
    echo "  Primeras URLs:"
    curl -s $URL'/sitemap.xml' | grep -o '<loc>[^<]*</loc>' | head -3 | sed 's/<loc>//g' | sed 's/<\/loc>//g' | sed 's/^/    - /'
else
    echo "  ❌ sitemap.xml no accesible (HTTP $SITEMAP_CODE)"
fi

# 4. Verificar imagen de preview
echo ''
echo '🖼️  [4/8] Verificando imagen de preview...'
IMAGE_CODE=$(curl -o /dev/null -s -w "%{http_code}" $URL'/portfolio-preview.jpg')
IMAGE_SIZE=$(curl -s -I $URL'/portfolio-preview.jpg' | grep -i content-length | awk '{print $2}' | tr -d '\r')
if [ "$IMAGE_CODE" = "200" ]; then
    IMAGE_SIZE_KB=$((IMAGE_SIZE / 1024))
    echo "  ✅ Imagen accesible (${IMAGE_SIZE_KB} KB)"
    if [ $IMAGE_SIZE_KB -lt 1024 ]; then
        echo "  ✅ Tamaño óptimo (< 1 MB)"
    else
        echo "  ⚠️  Tamaño grande (> 1 MB)"
    fi
else
    echo "  ❌ Imagen no accesible (HTTP $IMAGE_CODE)"
fi

# 5. Verificar Open Graph tags
echo ''
echo '📱 [5/8] Verificando Open Graph tags...'
OG_TAGS=$(curl -s $URL | grep -o '<meta property="og:[^"]*" content="[^"]*"' | wc -l)
if [ "$OG_TAGS" -gt 0 ]; then
    echo "  ✅ $OG_TAGS Open Graph tags encontrados"
    echo "  Principales:"
    curl -s $URL | grep '<meta property="og:' | head -5 | sed 's/^[[:space:]]*/    /'
else
    echo "  ❌ No se encontraron Open Graph tags"
fi

# 6. Verificar Twitter Card tags
echo ''
echo '🐦 [6/8] Verificando Twitter Card tags...'
TWITTER_TAGS=$(curl -s $URL | grep -o '<meta name="twitter:[^"]*" content="[^"]*"' | wc -l)
if [ "$TWITTER_TAGS" -gt 0 ]; then
    echo "  ✅ $TWITTER_TAGS Twitter Card tags encontrados"
    echo "  Principales:"
    curl -s $URL | grep '<meta name="twitter:' | head -5 | sed 's/^[[:space:]]*/    /'
else
    echo "  ❌ No se encontraron Twitter Card tags"
fi

# 7. Verificar JSON-LD Schema
echo ''
echo '📊 [7/8] Verificando JSON-LD Schema...'
SCHEMA_COUNT=$(curl -s $URL | grep -o 'type="application/ld+json"' | wc -l)
if [ "$SCHEMA_COUNT" -gt 0 ]; then
    echo "  ✅ $SCHEMA_COUNT JSON-LD schemas encontrados"
    curl -s $URL | grep -A 2 'application/ld+json' | grep '@type' | sed 's/^[[:space:]]*/    /'
else
    echo "  ❌ No se encontraron JSON-LD schemas"
fi

# 8. Verificar headers de seguridad
echo ''
echo '🔒 [8/8] Verificando headers de seguridad...'
HEADERS=$(curl -s -I $URL)
if echo "$HEADERS" | grep -i "x-content-type-options" > /dev/null; then
    echo "  ✅ X-Content-Type-Options presente"
else
    echo "  ⚠️  X-Content-Type-Options ausente"
fi
if echo "$HEADERS" | grep -i "x-frame-options" > /dev/null; then
    echo "  ✅ X-Frame-Options presente"
else
    echo "  ⚠️  X-Frame-Options ausente"
fi
if echo "$HEADERS" | grep -i "strict-transport-security" > /dev/null; then
    echo "  ✅ HSTS presente"
else
    echo "  ⚠️  HSTS ausente (normal en Vercel)"
fi

# Resumen final
echo ''
echo '──────────────────────────────────────────────────────────────'
echo '📊 RESUMEN DE VALIDACIÓN:'
echo ''
echo "  Sitio accesible:     $([ "$HTTP_CODE" = "200" ] && echo "✅" || echo "❌")"
echo "  robots.txt:          $([ "$ROBOTS_CODE" = "200" ] && echo "✅" || echo "❌")"
echo "  sitemap.xml:         $([ "$SITEMAP_CODE" = "200" ] && echo "✅" || echo "❌")"
echo "  Imagen preview:      $([ "$IMAGE_CODE" = "200" ] && echo "✅" || echo "❌")"
echo "  Open Graph tags:     $([ "$OG_TAGS" -gt 0 ] && echo "✅ ($OG_TAGS)" || echo "❌")"
echo "  Twitter Card tags:   $([ "$TWITTER_TAGS" -gt 0 ] && echo "✅ ($TWITTER_TAGS)" || echo "❌")"
echo "  JSON-LD schemas:     $([ "$SCHEMA_COUNT" -gt 0 ] && echo "✅ ($SCHEMA_COUNT)" || echo "❌")"
echo ''
echo '──────────────────────────────────────────────────────────────'
echo '✅ Validación técnica completada'
echo ''
echo '💡 Para validación visual, ejecuta: ./validate-seo.sh'
echo '📚 Documentación: SEO_100_COMPLETE.md'
echo ''
