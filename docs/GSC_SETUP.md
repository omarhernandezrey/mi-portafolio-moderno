# Configuración SEO - Google Search Console

## ✅ Estado: VERIFICADO

La propiedad `https://omarhernandezrey.com` ha sido verificada exitosamente en Google Search Console.

## 🔧 Configuración en Vercel

Para que la verificación funcione en producción, debes configurar la variable de entorno en Vercel:

### Pasos:

1. **Ir a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto

2. **Configurar Variables de Entorno:**
   - Ve a "Settings" → "Environment Variables"
   - Agrega la siguiente variable:

   ```
   Nombre: NEXT_PUBLIC_GSC_VERIFICATION
   Valor: 0I_RGGL_z4LoRDMnAk_Wfbxw0H1ROZJgTDxZbuq4ThY
   ```

3. **Redeploy:**
   - Ve a "Deployments"
   - Selecciona el último deploy
   - Click en "Redeploy"

## ✅ Verificación en GSC

Una vez hecho el deploy, verifica en:
https://search.google.com/search-console/

Debería mostrar: "Propiedad verificada" ✅

## 📊 Siguientes pasos en GSC:

1. **Enviar Sitemap:**
   - En el menú izquierdo, click en "Sitemaps"
   - Agregar sitemap: `sitemap.xml`
   - Click "Enviar"

2. **Revisar cobertura:**
   - Ir a "Cobertura" para ver páginas indexadas
   - Esperar 24-48h para que Google indexe las páginas

3. **Monitorear rendimiento:**
   - Ir a "Rendimiento" para ver búsquedas y clics

## 🔍 Verificar que funciona:

```bash
# Después del deploy, ejecuta:
curl -s https://omarhernandezrey.com | grep "google-site-verification"

# Debería mostrar:
# <meta name="google-site-verification" content="0I_RGGL_z4LoRDMnAk_Wfbxw0H1ROZJgTDxZbuq4ThY" />
```

## 📝 Notas:

- El código está configurado en `src/app/layout.tsx` mediante `metadata.verification.google`
- Usa la variable de entorno `NEXT_PUBLIC_GSC_VERIFICATION`
- El `NEXT_PUBLIC_` es necesario para que esté disponible en el cliente
