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

    // Add a short-lived class to animate theme variable changes
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    // remove transition class after animation completes
    window.setTimeout(() => root.classList.remove("theme-transition"), 300);
  };

  const LOGO_URL =
    "https://harmless-tapir-303.convex.cloud/api/storage/2844fd15-ce02-408e-9ac5-3e88a6ab15f7";

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md bg-white/40 dark:bg-white/10">
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg border bg-card cursor-pointer hover:opacity-90 transition"
          role="button"
          tabIndex={0}
          aria-label="Go to home"
          onClick={() => navigate("/")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/");
          }}
        >
          <img src={LOGO_URL} alt="prosprAI logo" className="h-9 w-auto" />
        </div>
        <span
          className="text-2xl font-bold text-foreground tracking-tight cursor-pointer hover:opacity-90 transition"
          role="button"
          tabIndex={0}
          aria-label="Go to home"
          onClick={() => navigate("/")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/");
          }}
        >
          prosprAI
        </span>
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

        <Button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}>
          {isAuthenticated ? "Dashboard" : "Get Started"}
        </Button>

        {isAuthenticated && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-10 rounded-full pl-1 pr-2 gap-2" aria-label="Open profile menu">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={(user as any)?.image || ""} alt="Profile" />
                  <AvatarFallback className="text-xs">
                    {((user?.name || user?.email || "U")[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56" sideOffset={8}>
              <div className="px-1 py-1.5 text-xs text-muted-foreground">
                {user?.name || user?.email || "Account"}
              </div>
              <div className="h-px my-1 bg-border" />
              <button className="w-full text-left rounded-md px-2 py-1.5 hover:bg-accent/40" onClick={() => navigate("/dashboard")}>
                Personal Info
              </button>
              <button className="w-full text-left rounded-md px-2 py-1.5 hover:bg-accent/40" onClick={() => navigate("/chat")}>
                Your Data
              </button>
              <button className="w-full text-left rounded-md px-2 py-1.5 hover:bg-accent/40" onClick={() => navigate("/dashboard")}>
                Settings
              </button>
              <div className="h-px my-1 bg-border" />
              <button
                className="w-full text-left rounded-md px-2 py-1.5 bg-gradient-to-r from-red-600 to-red-400 text-white hover:from-red-700 hover:to-red-500 shadow-sm"
                onClick={async () => {
                  try {
                    if (signOut) {
                      await signOut();
                    }
                  } finally {
                    navigate("/");
                  }
                }}
              >
                Logout
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </nav>
  );
}