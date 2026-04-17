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
      messages: messages as any,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 800,
    });

    return completion.choices[0]?.message?.content || "Lo siento, no he podido generar una respuesta.";

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
