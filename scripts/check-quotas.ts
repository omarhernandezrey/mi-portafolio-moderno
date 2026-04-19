import { supabaseServer } from '../src/lib/supabaseServer';
import { notifyTelegram } from '../src/lib/chatbot/telegram';

async function checkQuotas() {
  console.log('--- Iniciando verificación de cuotas ---');
  
  try {
    // 1. Contar requests del día (usamos messages como proxy temporal hasta tener api_logs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: msgCount, error: msgError } = await supabaseServer
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('created_at', today.toISOString());
      
    if (msgError) throw msgError;
    
    const groqRequests = msgCount || 0;
    const GROQ_LIMIT = 1500;
    const groqPercentage = (groqRequests / GROQ_LIMIT) * 100;
    
    console.log(`Requests Groq hoy: ${groqRequests}/${GROQ_LIMIT} (${groqPercentage.toFixed(1)}%)`);
    
    if (groqPercentage >= 80) {
      await notifyTelegram(`⚠️ Alerta de Cuota Groq\n\nSe han realizado ${groqRequests} solicitudes hoy (${groqPercentage.toFixed(1)}% del límite diario de ${GROQ_LIMIT}).`);
    }

    // 2. Estimar tamaño de Supabase (500MB límite free)
    const { count: totalMsgs, error: totalError } = await supabaseServer
      .from('messages')
      .select('*', { count: 'exact', head: true });
      
    if (totalError) throw totalError;
    
    const ESTIMATED_MAX_MSGS = 100000; // Conservador
    const supabasePercentage = ((totalMsgs || 0) / ESTIMATED_MAX_MSGS) * 100;
    
    console.log(`Mensajes totales (estimación Supabase): ${totalMsgs}/${ESTIMATED_MAX_MSGS} (${supabasePercentage.toFixed(1)}%)`);
    
    if (supabasePercentage >= 80) {
      await notifyTelegram(`⚠️ Alerta de Espacio Supabase\n\nEl total de mensajes es ${totalMsgs} (aprox ${supabasePercentage.toFixed(1)}% de la capacidad recomendada). Considera limpiar mensajes viejos.`);
    }

    console.log('--- Verificación finalizada con éxito ---');
  } catch (error) {
    console.error('Error verificando cuotas:', error);
    await notifyTelegram(`🚨 Error en script de cuotas\n\n${error instanceof Error ? error.message : String(error)}`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkQuotas();
}

export { checkQuotas };
