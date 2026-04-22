import { clientEnv } from '../src/config/env';

/**
 * Script para revisión rápida de costos mensuales.
 * Ejecutar con: npx tsx scripts/check-costs.ts
 */
async function main() {
  console.log('=== 💰 REVISIÓN DE COSTOS MENSUALES ===');
  console.log(`Fecha: ${new Date().toLocaleDateString()}`);
  console.log('\nPor favor, visita los siguientes enlaces para confirmar que el costo sigue siendo $0.00 USD:\n');

  const links = [
    { provider: 'Vercel', url: 'https://vercel.com/dashboard/settings/billing', note: 'Plan Hobby (Free)' },
    { provider: 'Supabase', url: 'https://supabase.com/dashboard/org/_/billing', note: 'Plan Free + Spend Cap $0' },
    { provider: 'Groq Cloud', url: 'https://console.groq.com/usage', note: 'Free Tier' },
    { provider: 'OpenRouter', url: 'https://openrouter.ai/activity', note: 'Free Models Only' },
    { provider: 'Cerebras Cloud', url: 'https://cloud.cerebras.ai/', note: 'Free Tier' },
    { provider: 'GitHub', url: 'https://github.com/settings/billing/summary', note: 'Free Plan' },
    { provider: 'Cal.com', url: 'https://app.cal.com/settings/billing', note: 'Free Plan' },
  ];

  links.forEach(l => {
    console.log(`- [ ] ${l.provider.padEnd(15)}: ${l.url}`);
    console.log(`      (${l.note})`);
  });

  console.log('\nUna vez confirmado, actualiza el archivo COSTOS_MENSUALES.md.');
  console.log('\n=======================================');
}

main().catch(console.error);
