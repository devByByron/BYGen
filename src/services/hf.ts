let _textGen: any | null = null;
export async function hfTextGenerate(prompt: string): Promise<string> {
  // Local-first: run small GPT-2 in the browser via @huggingface/transformers
  try {
    const { pipeline, env } = await import("@huggingface/transformers");
    const token = localStorage.getItem("bygen-hf-token") || "";
    if (token) {
      // Provide token so model files can be fetched if required
      // @ts-ignore - env is runtime config object exposed by transformers
      env.HF_TOKEN = token;
    }
    if (!_textGen) {
      _textGen = await pipeline(
        "text-generation",
        "Xenova/distilgpt2",
        { device: (navigator as any).gpu ? "webgpu" : "wasm" }
      );
    }
    const generator: any = _textGen;
    const out = await generator(prompt, { max_new_tokens: 320, temperature: 0.7, top_p: 0.9, do_sample: true });
    const text = out?.[0]?.generated_text ?? "";
    if (text) return text;
  } catch (localError) {
    // Continue to remote fallback if local execution isn't available/supported
    console.warn("Local transformers text generation failed, trying HF API:", localError);
  }

  // Remote fallback: Hugging Face Inference API (only if token provided)
  const token = localStorage.getItem("bygen-hf-token") || "";
  if (token) {
    const models = [
      "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
      "Qwen/Qwen2.5-1.5B-Instruct",
      "distilgpt2",
      "gpt2"
    ]; // prefer small free instruct models first
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
              inputs: `Instruction: ${prompt}\nAnswer:`,
              parameters: { max_new_tokens: 320, temperature: 0.7, top_p: 0.9 },
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

  const model = "Salesforce/codegen-350M-multi";

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
