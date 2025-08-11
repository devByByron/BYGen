

export async function hfImageGenerate(prompt: string): Promise<Blob> {
	const token = import.meta.env.VITE_HF_ACCESS_TOKEN;
	if (!token)
		throw new Error(
			"Missing Hugging Face token. Set VITE_HF_ACCESS_TOKEN in .env.local"
		);

	const model = "stabilityai/stable-diffusion-xl-base-1.0";

	const res = await fetch(
		`https://api-inference.huggingface.co/models/${model}`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
				Accept: "image/png",
			},
			body: JSON.stringify({
				inputs: prompt,
				options: { wait_for_model: true },
			}),
		}
	);

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`HF error ${res.status}: ${text}`);
	}

	return await res.blob();
}
export async function hfTextGenerate(prompt: string): Promise<string> {
	const token = import.meta.env.VITE_HF_ACCESS_TOKEN;
	if (!token) {
		throw new Error("Missing Hugging Face token. Set VITE_HF_ACCESS_TOKEN in .env.local");
	}

	// DeepSeek Coder V2 Lite Instruct model
	const model = "deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct";

	const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			inputs: prompt,
			parameters: {
				temperature: 0.7,
				max_new_tokens: 1024,
				do_sample: true
			},
			options: { wait_for_model: true }
		}),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`HF error ${res.status}: ${text}`);
	}

	const data = await res.json();

	// Hugging Face API sometimes returns an array of generated_text
	if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
		return data[0].generated_text;
	}

	// Or it may return token-wise output
	if (data.generated_text) {
		return data.generated_text;
	}

	return JSON.stringify(data);
}

export async function hfCodeGenerate(prompt: string): Promise<string> {
	const token = import.meta.env.VITE_HF_ACCESS_TOKEN;
	if (!token) {
		throw new Error("Missing Hugging Face token. Set VITE_HF_ACCESS_TOKEN in .env.local");
	}

	// Code generation model
	// Recommended: Starcoder2 or CodeLlama for free HF inference
	const model = "bigcode/starcoder2-15b"; // Can change to codellama/CodeLlama-13b-Instruct-hf if preferred

	const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			inputs: prompt,
			parameters: {
				temperature: 0.2,      // Lower temperature for more deterministic code
				max_new_tokens: 1024,  // Allows longer code output
				do_sample: true
			},
			options: { wait_for_model: true }
		}),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`HF error ${res.status}: ${text}`);
	}

	const data = await res.json();

	if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
		return data[0].generated_text;
	}
	if (data.generated_text) {
		return data.generated_text;
	}

	return JSON.stringify(data);
}

