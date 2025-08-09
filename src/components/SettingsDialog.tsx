import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings } from "lucide-react";

export function SettingsDialog() {
  const [hfToken, setHfToken] = useState("");
  const [runwareKey, setRunwareKey] = useState("");

  useEffect(() => {
    setHfToken(localStorage.getItem("bygen-hf-token") || "");
    setRunwareKey(localStorage.getItem("bygen-runware-key") || "");
  }, []);

  const save = () => {
    localStorage.setItem("bygen-hf-token", hfToken.trim());
    localStorage.setItem("bygen-runware-key", runwareKey.trim());
    toast.success("API keys saved locally");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover-scale">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription>Tokens are stored locally in your browser and used client-side.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hf">Hugging Face Token</Label>
            <Input
              id="hf"
              type="password"
              placeholder="hf_..."
              value={hfToken}
              onChange={(e) => setHfToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Used for GPT-2 (text) and StarCoder (code) via Inference API.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rw">Runware API Key</Label>
            <Input
              id="rw"
              type="password"
              placeholder="rw_..."
              value={runwareKey}
              onChange={(e) => setRunwareKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Used for Stable Diffusion image generation (websocket).
            </p>
          </div>
          <div className="pt-2">
            <Button onClick={save} className="w-full">Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
