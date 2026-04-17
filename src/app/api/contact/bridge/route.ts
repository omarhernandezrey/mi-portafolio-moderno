import { NextRequest, NextResponse } from 'next/server';
import { registerContactFormLead } from '@/lib/chatbot/contactBridge';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await registerContactFormLead(result.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact Bridge API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
