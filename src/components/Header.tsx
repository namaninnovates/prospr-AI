import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuth();
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const shouldDark = stored ? stored === "dark" : false;
    setIsDark(shouldDark);
    document.documentElement.classList.toggle("dark", shouldDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const LOGO_URL =
    "https://harmless-tapir-303.convex.cloud/api/storage/2844fd15-ce02-408e-9ac5-3e88a6ab15f7";

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md bg-white/40 dark:bg-white/10">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/")}
        role="button"
        aria-label="Go to home"
        title="Go to home"
      >
        <div className="p-2 rounded-lg border bg-card">
          <img src={LOGO_URL} alt="prosprAI logo" className="h-7 w-auto" />
        </div>
        <span className="text-2xl font-bold text-foreground tracking-tight">prosprAI</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
          {isDark ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </>
          )}
        </Button>

        {!isAuthenticated ? (
          <>
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Register
            </Button>
          </>
        ) : (
          <div className="text-sm md:text-base font-medium">
            {`Hey ${user?.name?.split?.(" ")?.[0] ?? "there"}, let's ask prosperAI ✨`}
          </div>
        )}
      </div>
    </nav>
  );
}