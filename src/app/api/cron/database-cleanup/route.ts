import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireCronAuth } from "@/lib/cronAuth";
import { notifyTelegram } from "@/lib/chatbot/telegram";

/**
 * Tarea 21.3 — Limpieza automática mensual de la base de datos
 * Borra conversaciones sin leads y mensajes de sistema duplicados.
 */
export async function POST(req: NextRequest) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  try {
    console.log("▶️ Iniciando limpieza de base de datos...");

    // Paso a paso para mensajes duplicados:
    const { data: allSystemMsgs, error: fetchError } = await supabaseServer
      .from("messages")
      .select("id, conversation_id, content")
      .eq("role", "system");

    if (fetchError) throw fetchError;

    const seen = new Set<string>();
    const toDelete: string[] = [];
    
    allSystemMsgs?.forEach((msg) => {
      const key = `${msg.conversation_id}-${msg.content}`;
      if (seen.has(key)) {
        toDelete.push(msg.id);
      } else {
        seen.add(key);
      }
    });

    if (toDelete.length > 0) {
      const { error: delDupError } = await supabaseServer
        .from("messages")
        .delete()
        .in("id", toDelete);
      if (delDupError) throw delDupError;
    }

    // 4. Borrar conversaciones inactivas (>90 días) sin leads
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Enfoque manual: traer IDs de leads y luego filtrar conversaciones
    const { data: leadsWithConv, error: leadsFetchError } = await supabaseServer
      .from("leads")
      .select("conversation_id")
      .not("conversation_id", "is", null);
    
    if (leadsFetchError) throw leadsFetchError;
    
    const leadConvIds = new Set(leadsWithConv?.map(l => l.conversation_id) || []);

    const { data: oldConvs, error: oldError } = await supabaseServer
      .from("conversations")
      .select("id")
      .lt("updated_at", ninetyDaysAgo.toISOString());

    if (oldError) throw oldError;

    const toDeleteConvs = oldConvs
      ?.filter(c => !leadConvIds.has(c.id))
      .map(c => c.id) || [];

    let deletedCount = 0;
    if (toDeleteConvs.length > 0) {
      const { error: finalDelError } = await supabaseServer
        .from("conversations")
        .delete()
        .in("id", toDeleteConvs);
      if (finalDelError) throw finalDelError;
      deletedCount = toDeleteConvs.length;
    }

    // 5. Retención de `uptime_checks`: una fila por hora crece ~8760 al año.
    // `/api/uptime/history` solo mira 90 días, así que se guardan 180 — el
    // doble de la ventana, margen de sobra para ampliarla sin haber perdido
    // nada ya.
    const haceMedioAno = new Date();
    haceMedioAno.setDate(haceMedioAno.getDate() - 180);

    const { data: uptimeBorradas, error: uptimeError } = await supabaseServer
      .from("uptime_checks")
      .delete()
      .lt("checked_at", haceMedioAno.toISOString())
      .select("id");

    if (uptimeError) throw uptimeError;
    const uptimeCount = uptimeBorradas?.length ?? 0;

    // Solo avisa si de verdad limpió algo: un mensaje mensual con dos ceros
    // no informa nada y se deja de leer igual que pasó con el resumen diario.
    if (toDelete.length > 0 || deletedCount > 0 || uptimeCount > 0) {
      const report = `🧹 *Limpieza DB completada*\n- Mensajes duplicados: ${toDelete.length}\n- Conversaciones eliminadas: ${deletedCount}\n- Comprobaciones de uptime caducadas: ${uptimeCount}`;
      await notifyTelegram(report);
    }

    return NextResponse.json({
      success: true,
      duplicatesRemoved: toDelete.length,
      conversationsRemoved: deletedCount,
      uptimeChecksRemoved: uptimeCount
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error en database-cleanup:", errorMessage);
    await notifyTelegram(`🚨 *Error en limpieza de DB*: ${errorMessage}`);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
