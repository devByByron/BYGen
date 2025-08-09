export async function hfTextGenerate(prompt: string): Promise<string> {
  const token = localStorage.getItem("bygen-hf-token") || "";
  if (!token) throw new Error("Missing Hugging Face token. Open Settings to add it.");

  const res = await fetch(
    "https://api-inference.huggingface.co/models/openai-community/gpt2",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 120 } }),
    }
  );

  if (!res.ok) throw new Error(`HF error: ${res.status}`);
  const data = await res.json();
  // HF returns array of generated_text
  const text = data?.[0]?.generated_text ?? "";
  return text;
}

export async function hfCodeGenerate(prompt: string, language: string): Promise<string> {
  const token = localStorage.getItem("bygen-hf-token") || "";
  if (!token) throw new Error("Missing Hugging Face token. Open Settings to add it.");

  const res = await fetch(
    "https://api-inference.huggingface.co/models/bigcode/starcoder",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inputs: `# Language: ${language}\n# Task: Write code based on the prompt below.\n${prompt}\n`,
        parameters: { max_new_tokens: 200, temperature: 0.2 },
      }),
    }
  );

  if (!res.ok) throw new Error(`HF error: ${res.status}`);
  const data = await res.json();
  const text = data?.[0]?.generated_text ?? "";
  return text;
}
