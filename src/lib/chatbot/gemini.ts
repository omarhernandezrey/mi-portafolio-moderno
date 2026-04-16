import { GoogleGenAI } from "@google/genai";

interface ContentPart {
  text: string;
}

interface Content {
  role: string;
  parts: ContentPart[];
}

export async function generateReply(
  systemPrompt: string,
  history: { role: 'user' | 'assistant' | 'system'; content: string }[],
  userMessage: string
): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not defined in environment variables");
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const contents: Content[] = [
      ...history
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    const text = res.text;
    return text || "Lo siento, no he podido generar una respuesta.";

  } catch (error: unknown) {
    console.error("Gemini modern SDK Error:", error);

    // Detectar cuota agotada (Error 429)
    const err = error as { status?: number; message?: string };
    if (err.status === 429 || err.message?.includes('quota') || err.message?.includes('429')) {
      return "<<<QUOTA_EXCEEDED>>>";
    }

    return "Lo siento, he tenido un pequeño error técnico. ¿Podrías repetirme eso o prefieres hablar directamente con Omar vía WhatsApp?";
  }
}
