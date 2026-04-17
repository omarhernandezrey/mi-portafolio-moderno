import Groq from "groq-sdk";
import { serverEnv } from "@/config/env";

export async function generateReply(
  systemPrompt: string,
  history: { role: 'user' | 'assistant' | 'system'; content: string }[],
  userMessage: string
): Promise<string> {
  try {
    const groq = new Groq({
      apiKey: serverEnv.GROQ_API_KEY,
    });

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      })),
      { role: "user", content: userMessage }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages as { role: "system" | "user" | "assistant"; content: string }[],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 800,
    });

    const text = completion.choices[0]?.message?.content || "Lo siento, no he podido generar una respuesta.";

    // Lógica de Auto-revisión (solo para mensajes largos o complejos)
    if (text.length > 50 && !text.includes('<<<')) {
      const reviewMsg = [
        { role: "system", content: "Actúa como revisor de calidad. Revisa la siguiente respuesta del asistente de Omar. ¿Cumple con: voz de Omar, máximo 3 frases, no inventa precios, hace avanzar la venta? Responde solo 'OK' o 'FIX: <razón>'." },
        { role: "user", content: `Respuesta a revisar: "${text}"` }
      ];

      const review = await groq.chat.completions.create({
        messages: reviewMsg as { role: "system" | "user" | "assistant"; content: string }[],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1, // Baja temperatura para revisión precisa
        max_completion_tokens: 50,
      });

      const reviewText = review.choices[0]?.message?.content || "";
      
      if (reviewText.startsWith('FIX:')) {
        console.log(`Auto-correction triggered: ${reviewText}`);
        const fixedCompletion = await groq.chat.completions.create({
          messages: [
            ...messages as { role: "system" | "user" | "assistant"; content: string }[],
            { role: "assistant", content: text },
            { role: "user", content: `Corrige tu respuesta anterior basándote en esta crítica: ${reviewText.substring(5)}. Mantén el objetivo de venta.` }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
          max_completion_tokens: 800,
        });
        return fixedCompletion.choices[0]?.message?.content || text;
      }
    }

    return text;

  } catch (error: unknown) {
    console.error("Groq SDK Error:", error);

    const err = error as { status?: number; message?: string };
    // Manejo de cuota Groq
    if (err.status === 429) {
      return "<<<QUOTA_EXCEEDED>>>";
    }

    return "Lo siento, he tenido un pequeño error técnico. ¿Podrías repetirme eso o prefieres hablar directamente con Omar vía WhatsApp?";
  }
}
