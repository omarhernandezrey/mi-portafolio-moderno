# 🌅 Mañana (15 min)
- [ ] Revisar Telegram: ¿hay leads nuevos de la noche?
- [ ] Para cada lead nuevo: responder en < 30 min con WhatsApp directo
- [ ] Revisar /admin/leads: ¿alguno marcado "cold"? Reactivar con mensaje breve

# 🌇 Tarde (10 min)
- [ ] Revisar conversaciones del día en /admin/conversations
- [ ] Anotar 1 cosa que el bot dijo mal → ajustar `persona.ts` u `objections.ts`
- [ ] Si hubo cierre: enviar contrato + link de pago en < 2 horas

# 📅 Semanal (1 hora, domingo)
- [ ] Correr suite de eval (`npx tsx scripts/eval-chatbot.ts`)
- [ ] Si score bajó: iterar prompt
- [ ] Publicar 1 post en LinkedIn mostrando un proyecto reciente (link al portafolio)
- [ ] Publicar 1 thread en Twitter/X sobre algo técnico
- [ ] Revisar backups y cuotas

# 📆 Mensual
- [ ] Calcular conversion rate: leads / visitantes (de Vercel Analytics)
- [ ] Calcular cierre rate: pagados / leads
- [ ] Si cierre < 10%: revisar grabaciones de conversaciones perdidas
- [ ] Actualizar precios del catálogo si hay inflación / nueva demanda
- [ ] Pedir 1 testimonio a clientes recientes para `TestimonialCard`

# 🛠️ Recuperación de Desastres (Backups)
En caso de pérdida de datos o necesidad de migración:
1. **Descarga:** Obtén el archivo `.sql.gz` más reciente de GitHub Backups o Cloudflare R2.
2. **Desencripta (si aplica):** `age -d -i <tu-llave-privada> backup.sql.gz.age > backup.sql.gz`
3. **Descomprime:** `gunzip backup.sql.gz`
4. **Restaura:** `psql "postgresql://postgres:<password>@<db-host>:5432/postgres" -f backup.sql`
   - *Nota:* Se recomienda probar la restauración en una base de datos local o de staging semestralmente.
