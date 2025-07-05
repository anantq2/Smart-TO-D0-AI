// lib/llm.ts

const LLM_API_URL = process.env.LLM_API_URL || 'http://192.168.81.233:1234/v1/chat/completions';

export async function getLLMSuggestions(messages: { role: string; content: string }[]) {
  const response = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "llama-2-7b-chat", 
      messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`LLM request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}
