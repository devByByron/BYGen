// groq.ts

// Prefer key from localStorage to avoid build-time envs; fall back to Vite env if present
function getGroqApiKey(): string | null {
  try {
    const k = localStorage.getItem("bygen-groq-key");
    if (k && k.trim()) return k.trim();
  } catch {
    // localStorage may be unavailable in some contexts
  }
  const v = (import.meta as any)?.env?.VITE_GROQ_API_KEY as string | undefined;
  return v && String(v).trim() ? String(v).trim() : null;
}

export async function groqChatGenerate(prompt: string): Promise<string> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 30000);

	try {
		const key = getGroqApiKey();
		if (!key) {
			throw new Error(
				"Missing Groq API key. Open Settings and add your Groq key (stored locally), or define VITE_GROQ_API_KEY."
			);
		}

		const res = await fetch(
			"https://api.groq.com/openai/v1/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${key}`,
				},
				body: JSON.stringify({
					model: "llama-3.1-8b-instant",
					messages: [
						{
							role: "system",
							content:
								"You are a helpful, accurate assistant. Be clear, structured, and include useful details when helpful.",
						},
						{ role: "user", content: prompt },
					],
					temperature: 0.4,
					top_p: 0.9,
					max_tokens: 600,
				}),
				signal: controller.signal,
			}
		);

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Groq error ${res.status}: ${text}`);
		}

		const data = await res.json();
		const content = data?.choices?.[0]?.message?.content?.trim?.();
		if (!content) throw new Error("No content returned by Groq");
		return content;
	} finally {
		clearTimeout(timeout);
	}
}

export async function groqCodeGenerate(
	prompt: string,
	language: string
): Promise<string> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 30000);

	try {
		const key = getGroqApiKey();
		if (!key) {
			throw new Error(
				"Missing Groq API key. Open Settings and add your Groq key (stored locally), or define VITE_GROQ_API_KEY."
			);
		}

		const res = await fetch(
			"https://api.groq.com/openai/v1/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${key}`,
				},
				body: JSON.stringify({
					model: "llama-3.1-8b-instant",
					messages: [
						{
							role: "system",
							content:
								"You are a senior software engineer. Return only valid, runnable code with no explanations or code fences.",
						},
						{
							role: "user",
							content: `Language: ${language}\nTask: Write code for the following.\n${prompt}`,
						},
					],
					temperature: 0.2,
					top_p: 0.9,
					max_tokens: 500,
				}),
				signal: controller.signal,
			}
		);

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Groq error ${res.status}: ${text}`);
		}

		const data = await res.json();
		const content = data?.choices?.[0]?.message?.content ?? "";
		return content.trim();
	} finally {
		clearTimeout(timeout);
	}
}
