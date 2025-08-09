import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { SettingsDialog } from "./SettingsDialog";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "bg-accent/20 text-accent-foreground" : "hover:bg-accent/10"
    }`;

  return (
    <header className="sticky top-0 z-40 backdrop-blur glass-panel">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <NavLink to="/" className="font-mono text-lg tracking-tight">
            <span className="text-accent font-bold">BY</span>Gen
          </NavLink>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/text" className={linkCls} end>
              Text
            </NavLink>
            <NavLink to="/image" className={linkCls} end>
              Image
            </NavLink>
            <NavLink to="/code" className={linkCls} end>
              Code
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <NavLink to="/text"><Button variant="ghost">Tools</Button></NavLink>
            </div>
            <SettingsDialog />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
