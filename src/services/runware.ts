// runware.ts

const runwareApiKey = import.meta.env.VITE_RUNWARE_API_KEY;

if (!runwareApiKey) {
	throw new Error(
		"Missing Runware API key. Please set VITE_RUNWARE_API_KEY in your .env file."
	);
}

export const runwareClient = {
	async generateImage(options: {
		positivePrompt: string;
		width?: number;
		height?: number;
		outputFormat?: string;
	}) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 30000);

		try {
			const payload = [
				{
					taskType: "imageInference", // ✅ Required field
					positivePrompt: options.positivePrompt,
					width: options.width ?? 768,
					height: options.height ?? 768,
					outputFormat: options.outputFormat ?? "WEBP",
				},
			];

			const res = await fetch("https://api.runware.ai/v1/image", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${runwareApiKey}`,
				},
				body: JSON.stringify(payload),
				signal: controller.signal,
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Runware error ${res.status}: ${text}`);
			}

			const data = await res.json();
			if (!data?.[0]?.imageURL) {
				throw new Error("No image URL returned by Runware API");
			}

			return { imageURL: data[0].imageURL };
		} finally {
			clearTimeout(timeout);
		}
	},
};
