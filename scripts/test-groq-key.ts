import Groq from "groq-sdk";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  const apiKey = process.env.GROQ_API_KEY;
  console.log("Intentando conexión con Groq...");
  
  if (!apiKey) {
    console.error("❌ No hay GROQ_API_KEY en .env.local");
    return;
  }

  try {
    const groq = new Groq({ apiKey });
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Hola, responde solo OK" }],
      model: "llama-3.3-70b-versatile",
    });
    console.log("✅ Respuesta de Groq:", chatCompletion.choices[0]?.message?.content);
  } catch (error: any) {
    console.error("❌ Error de Conexión Real:", error.status, error.message);
  }
}

test();
