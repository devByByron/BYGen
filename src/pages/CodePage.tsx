import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { groqCodeGenerate } from "@/services/groq";
import { hfCodeGenerate } from "@/services/hf"
import Navbar from "@/components/Navbar";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const languages = [
	"javascript",
	"typescript",
	"python",
	"go",
	"java",
	"csharp",
	"rust",
] as const;

export default function CodePage() {
	const [prompt, setPrompt] = useState("");
	const [language, setLanguage] =
		useState<(typeof languages)[number]>("typescript");
	const [output, setOutput] = useState("");
	const [loading, setLoading] = useState(false);

	const onGenerate = async () => {
		if (!prompt.trim()) return toast.error("Please enter a prompt");
		setLoading(true);
		try {
			const generated = await hfCodeGenerate(prompt.trim(), language);
			setOutput(generated);
			toast.success("Code generated");
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
		const extMap: Record<string, string> = {
			javascript: "js",
			typescript: "ts",
			python: "py",
			go: "go",
			java: "java",
			csharp: "cs",
			rust: "rs",
		};
		const ext = extMap[language] || "txt";
		const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `bygen-snippet.${ext}`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="min-h-screen">
			<Helmet>
				<title>Code Generator – BYGen</title>
				<meta
					name="description"
					content="Generate code snippets in multiple languages with BYGen."
				/>
				<link rel="canonical" href="/code" />
			</Helmet>
			<Navbar />
			<main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
				<section className="space-y-4">
					<h1 className="text-3xl font-semibold">Code Generator</h1>
					<Card className="glass-panel">
						<CardHeader>
							<CardTitle className="font-mono">Prompt</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid md:grid-cols-4 gap-4">
								<div className="md:col-span-3">
									<Textarea
										value={prompt}
										onChange={(e) =>
											setPrompt(e.target.value)
										}
										placeholder="Write a function that sorts an array using quicksort..."
										className="min-h-[160px]"
									/>
								</div>
								<div className="md:col-span-1">
									<Select
										value={language}
										onValueChange={(v) =>
											setLanguage(v as any)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Language" />
										</SelectTrigger>
										<SelectContent>
											{languages.map((l) => (
												<SelectItem key={l} value={l}>
													{l}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
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
								<div className="rounded-md overflow-hidden border">
									<SyntaxHighlighter
										language={language as any}
										style={vscDarkPlus}
										customStyle={{
											margin: 0,
											background: "transparent",
										}}
									>
										{output}
									</SyntaxHighlighter>
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
