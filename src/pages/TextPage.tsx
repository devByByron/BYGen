import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
// import { groqChatGenerate } from "@/services/groq";
// import { hfTextGenerate } from "@/services/hf";
import { geminiText } from "@/services/gemini";
import Navbar from "@/components/Navbar";

export default function TextPage() {
	const [prompt, setPrompt] = useState("");
	const [output, setOutput] = useState("");
	const [loading, setLoading] = useState(false);

	const onGenerate = async () => {
		if (!prompt.trim()) return toast.error("Please enter a prompt");
		setLoading(true);
		try {
			const generated = await geminiText(prompt.trim());
			setOutput(generated);
			toast.success("Generated text ready");
		} catch (e: any) {
			toast.error(e.message || "Generation failed");
		} finally {
			setLoading(false);
		}
	};
	const onCopy = async () => {
		await navigator.clipboard.writeText(output);
		toast.success("Copied to clipboard");
	};
	const onDownload = () => {
		const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "bygen-text.txt";
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="min-h-screen">
			<Helmet>
				<title>Text Generator – BYGen</title>
				<meta
					name="description"
					content="Generate high-quality text from prompts with BYGen."
				/>
				<link rel="canonical" href="/text" />
			</Helmet>
			<Navbar />
			<main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
				<section className="space-y-4">
					<h1 className="text-3xl font-semibold">Text Generator</h1>
					<Card className="glass-panel">
						<CardHeader>
							<CardTitle className="font-mono">Prompt</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Textarea
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								placeholder="Describe what you want to generate..."
								className="min-h-[160px]"
							/>
							<Button
								onClick={onGenerate}
								disabled={loading}
								className="neon-border"
							>
								{loading ? "Generating..." : "Generate"}
							</Button>
						</CardContent>
					</Card>
				</section>

				{output && (
					<section className="space-y-4 animate-fade-in">
						<Card className="glass-panel">
							<CardHeader>
								<CardTitle className="font-mono">
									Output
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="whitespace-pre-wrap text-left">
									{output}
								</div>
								<div className="flex gap-2">
									<Button
										variant="secondary"
										onClick={onCopy}
									>
										Copy
									</Button>
									<Button
										variant="outline"
										onClick={onDownload}
									>
										Download
									</Button>
								</div>
							</CardContent>
						</Card>
					</section>
				)}
			</main>
		</div>
	);
}
