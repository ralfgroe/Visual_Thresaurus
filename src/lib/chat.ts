export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isWordSearch?: boolean;
}

export async function chatWithClaude(
  apiKey: string,
  centerWord: string,
  userMessage: string,
  history: ChatMessage[],
): Promise<string> {
  const systemPrompt = `You are a helpful linguistic assistant embedded in a Visual Thesaurus app. The user is currently exploring the word "${centerWord}" and its connections. Answer questions about this word concisely -- etymology, usage, nuances, examples, cultural context, etc. Keep responses brief (2-4 sentences) unless the user asks for more detail.`;

  const messages = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

  messages.push({ role: 'user', content: userMessage });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API error ${response.status}: ${errBody}`);
  }

  const result = await response.json();
  const textBlock = result.content?.find(
    (b: { type: string }) => b.type === 'text',
  );
  if (!textBlock) throw new Error('No text in response');

  return textBlock.text;
}
