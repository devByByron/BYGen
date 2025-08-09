export async function hfTextGenerate(prompt: string): Promise<string> {
  const token = localStorage.getItem("bygen-hf-token") || "";
  if (!token) throw new Error("Missing Hugging Face token. Open Settings to add it.");

  const models = ["openai-community/gpt2", "gpt2"]; // fallback if org route 404s
  let lastError: any = null;

  for (const model of models) {
    try {
      const res = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 120 },
            options: { wait_for_model: true },
          }),
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          // Try next fallback model id
          lastError = new Error(`HF model not found: ${model}`);
          continue;
        }
        const text = await res.text();
        throw new Error(`HF error ${res.status}: ${text}`);
      }

      const data = await res.json();
      return data?.[0]?.generated_text ?? "";
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError ?? new Error("HF text generation failed");
}

export async function hfCodeGenerate(prompt: string, language: string): Promise<string> {
  const token = localStorage.getItem("bygen-hf-token") || "";
  if (!token) throw new Error("Missing Hugging Face token. Open Settings to add it.");

  const model = "bigcode/starcoder";

  const res = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inputs: `# Language: ${language}\n# Task: Write code based on the prompt below.\n${prompt}\n`,
        parameters: { max_new_tokens: 200, temperature: 0.2 },
        options: { wait_for_model: true },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data?.[0]?.generated_text ?? "";
}
