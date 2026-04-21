import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { serverEnv } from "@/config/env";
import { notifyTelegram } from "@/lib/chatbot/telegram";

/**
 * Tarea 25.7 — Alerta de "casi al límite"
 * Chequea el uso diario de los proveedores LLM y alerta si están cerca del límite free.
 */

// Límites diarios estimados para planes Free (conservadores)
const FREE_LIMITS: Record<string, number> = {
  groq: 14000,        // Groq permite bastante, pero 14k req/día es un buen tope para alerta
  openrouter: 200,    // OpenRouter free suele ser limitado
  cerebras: 1000,     // Cerebras es generoso pero nuevo
  cloudflare: 10000,  // Workers AI free es alto
  ollama: 999999      // Local no tiene límite
};

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: stats, error } = await supabaseServer
      .from("api_logs")
      .select("provider, status")
      .gte("created_at", today.toISOString());

    if (error) throw error;

    const usage: Record<string, { total: number; errors: number }> = {};
    stats?.forEach(log => {
      if (!usage[log.provider]) usage[log.provider] = { total: 0, errors: 0 };
      usage[log.provider].total++;
      if (log.status === 'error') usage[log.provider].errors++;
    });

    let alerts = "";
    Object.entries(usage).forEach(([provider, data]) => {
      const limit = FREE_LIMITS[provider] || 1000;
      const percentage = (data.total / limit) * 100;

      if (percentage >= 80) {
        alerts += `⚠️ *${provider}* al ${percentage.toFixed(1)}% de su cuota estimada (${data.total}/${limit} reqs).\n`;
      }
    });

    if (alerts) {
      await notifyTelegram(`🚨 *ALERTA DE CUOTA LLM*\n\n${alerts}\n_El sistema saltará automáticamente al siguiente proveedor si uno falla._`);
    }

    return NextResponse.json({ success: true, usage });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error en check-limits:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
