export async function hfTextGenerate(prompt: string): Promise<string> {
  // Local-first: run small GPT-2 in the browser via @huggingface/transformers
  try {
    const { pipeline } = await import("@huggingface/transformers");
    const generator: any = await pipeline("text-generation", "onnx-community/gpt2");
    const out = await generator(prompt, { max_new_tokens: 120, do_sample: true });
    const text = out?.[0]?.generated_text ?? "";
    if (text) return text;
  } catch (localError) {
    // Continue to remote fallback if local execution isn't available/supported
    console.warn("Local transformers text generation failed, trying HF API:", localError);
  }

  // Remote fallback: Hugging Face Inference API (only if token provided)
  const token = localStorage.getItem("bygen-hf-token") || "";
  if (token) {
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
        const generated = data?.[0]?.generated_text ?? "";
        if (generated) return generated;
      } catch (e) {
        lastError = e;
      }
    }

    console.warn("HF Inference API failed:", lastError);
  }

  throw new Error(
    "HF text generation failed. Local and remote fallbacks were unavailable. Please try again or check Settings."
  );
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
