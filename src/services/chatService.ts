export interface ChatResponse {
  reply: string;
  handoffUrl?: string;
  calcomUrl?: string;
  visitorMeta?: { name?: string; email?: string; phone?: string };
}

export async function sendChatMessage(
  sessionId: string, 
  message: string, 
  language: 'es' | 'en',
  visitorMeta?: { name?: string; email?: string; phone?: string }
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message, language, visitorMeta })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Chat API error');
  }

  return response.json();
}
