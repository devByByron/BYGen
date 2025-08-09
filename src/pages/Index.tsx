import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { PenLine, Image as ImageIcon, Code2 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>BYGen – AI Text, Image, and Code Generator</title>
        <meta name="description" content="BYGen is a sleek AI toolkit to generate text, images, and code—fast and beautifully." />
        <link rel="canonical" href="/" />
      </Helmet>

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <section className="text-center space-y-6 py-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Create with <span className="text-accent">BY</span>Gen
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional, futuristic, and fast. Generate text, images, and code with a beautiful, glassy interface.
          </p>
          <div className="flex items-center justify-center gap-3">
            <NavLink to="/text"><Button className="neon-border">Start with Text</Button></NavLink>
            <NavLink to="/image"><Button variant="outline" className="hover-scale">Try Images</Button></NavLink>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mt-10">
          <NavLink to="/text" className="hover-scale">
            <Card className="glass-panel h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono"><PenLine className="h-5 w-5" /> Text Generator</CardTitle>
              </CardHeader>
              <CardContent>
                Craft blog ideas, outlines, and copy with a clean prompt interface.
              </CardContent>
            </Card>
          </NavLink>
          <NavLink to="/image" className="hover-scale">
            <Card className="glass-panel h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono"><ImageIcon className="h-5 w-5" /> Image Generator</CardTitle>
              </CardHeader>
              <CardContent>
                Turn prompts into visuals. Download results with one click.
              </CardContent>
            </Card>
          </NavLink>
          <NavLink to="/code" className="hover-scale">
            <Card className="glass-panel h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono"><Code2 className="h-5 w-5" /> Code Generator</CardTitle>
              </CardHeader>
              <CardContent>
                Generate multi-language snippets with syntax highlighting.
              </CardContent>
            </Card>
          </NavLink>
        </section>
      </main>
    </div>
  );
};

export default Index;
