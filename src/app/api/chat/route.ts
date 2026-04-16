import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const chatSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
  language: z.enum(['es', 'en']),
  visitorMeta: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = chatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data', details: result.error.format() }, { status: 400 });
    }

    const { sessionId, message, language } = result.data;
    
    console.log(`Processing message for session ${sessionId} in ${language}`);

    // TODO: Implementar lógica de persistencia y Gemini
    return NextResponse.json({ reply: 'Chat endpoint is under construction. Received: ' + message });

  } catch (error) {
    console.error('API Chat Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
