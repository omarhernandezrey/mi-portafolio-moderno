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
  visitorMeta?: { name?: string; email?: string; phone?: string },
  consentAt?: string,
  imageDataUrl?: string
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message, language, visitorMeta, consentAt, imageDataUrl })
  });

  if (!response.ok) {
    let errorMsg = 'Chat API error';
    try {
      const errorBody = await response.json();
      errorMsg = errorBody.message || errorMsg;
    } catch {
      // response was not JSON (e.g., Next.js 500 HTML page)
    }
    throw new Error(errorMsg);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Invalid JSON response from Chat API');
  }
}
