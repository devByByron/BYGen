import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { RunwareService } from "@/services/runware";
import Navbar from "@/components/Navbar";

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    if (!prompt.trim()) return toast.error("Please enter a prompt");
    const rwKey = localStorage.getItem("bygen-runware-key") || "";
    if (!rwKey) return toast.error("Missing Runware API key. Open Settings to add it.");
    setLoading(true);
    try {
      const runware = new RunwareService();
      const res = await runware.generateImage({ positivePrompt: prompt.trim(), width: 1024, height: 1024, outputFormat: "WEBP" });
      setImageUrl(res.imageURL);
      toast.success("Image generated");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const onDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl; a.download = "bygen-image.webp"; a.click();
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Image Generator – BYGen</title>
        <meta name="description" content="Generate images from text prompts with BYGen." />
        <link rel="canonical" href="/image" />
      </Helmet>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="space-y-4">
          <h1 className="text-3xl font-semibold">Image Generator</h1>
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="font-mono">Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic neon city at night with glass reflections..."
              />
              <Button onClick={onGenerate} disabled={loading} className="neon-border">
                {loading ? "Generating..." : "Generate"}
              </Button>
            </CardContent>
          </Card>
        </section>

        {imageUrl && (
          <section className="space-y-4 animate-fade-in">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="font-mono">Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <img src={imageUrl} alt="BYGen generated" className="w-full h-auto rounded-md" loading="lazy" />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onDownload}>Download</Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
