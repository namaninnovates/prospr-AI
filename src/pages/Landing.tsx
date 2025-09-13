// TODO: REPLACE THIS LANDING PAGE WITH AN ELEGANT, THEMATIC, AND WELL-DESIGNED LANDING PAGE RELEVANT TO THE PROJECT
import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Bot, Brain, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Shield, Lock, TrendingUp, BarChart3, PieChart } from "lucide-react";
import Footer from "@/components/Footer";

type InteractiveEl = HTMLElement | null;

export default function Landing() {
  const { isAuthenticated, user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const chat = useAction(api.ai.chatWithAI);

  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // Theme state managed via DOM class & localStorage for persistence
  const [isDark, setIsDark] = useState<boolean>(true);

  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveringInteractive, setHoveringInteractive] = useState<boolean>(false);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Add: scroll-based parallax drivers
  const { scrollYProgress } = useScroll();
  const bgScrollY = useTransform(scrollYProgress, [0, 1], [0, -120]); // background layers
  const heroTitleY = useTransform(scrollYProgress, [0, 1], [0, -60]); // hero heading
  const ctaWaveY = useTransform(scrollYProgress, [0, 1], [0, -80]); // CTA backdrop wave

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    setMouse({ x, y });

    // Track cursor position
    setCursorPos({ x: e.clientX, y: e.clientY });

    // Detect interactive elements to scale cursor subtly
    const target = (e.target as HTMLElement) ?? null;
    const isInteractive =
      !!(target as InteractiveEl)?.closest?.(
        "button,[role='button'],a,input,textarea,select,label,.cursor-pointer"
      );
    setHoveringInteractive(Boolean(isInteractive));
  };

  const LOGO_URL = "https://harmless-tapir-303.convex.cloud/api/storage/2844fd15-ce02-408e-9ac5-3e88a6ab15f7";

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    // Default to light theme for a white background
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

  const askAI = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await chat({
        messages: [{ role: "user", content: prompt.trim() }],
      });
      setAnswer(res);
    } catch (e: any) {
      setAnswer(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add: active section highlight via IntersectionObserver
  const [activeSection, setActiveSection] = useState<string>("hero");
  useEffect(() => {
    const ids = ["hero", "why", "how", "privacy", "cta"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.2, 0.4, 0.6, 0.8] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Helper: smooth scroll to section
  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen cursor-none bg-gradient-to-b from-purple-50 via-white to-yellow-50 dark:from-background dark:via-background dark:to-background"
      onMouseMove={handleMouseMove}
    >
      {/* Custom Glass Cursor */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed z-[60] h-6 w-6 rounded-full"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.25), rgba(255,255,255,0.05))",
          boxShadow:
            "0 0 0 1px color-mix(in oklch, var(--ring) 70%, transparent), 0 8px 24px rgba(0,0,0,0.12)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
        animate={{
          scale: hoveringInteractive ? 1.4 : 1,
          opacity: 1,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20, mass: 0.6 }}
      />

      {/* Parallax Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(177,59,255,0.18), transparent 60%)" }}
          animate={{
            x: mouse.x * 20,
            y: mouse.y * 20,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(71,19,150,0.16), transparent 60%)" }}
          animate={{
            x: mouse.x * -25,
            y: mouse.y * -25,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,204,0,0.08), transparent 60%)" }}
          animate={{
            x: mouse.x * 15,
            y: mouse.y * 10,
          }}
          transition={{ type: "spring", stiffness: 60, damping: 22 }}
        />

        {/* New: Multi-color gradient mesh layer with scroll + mouse parallax */}
        <motion.div
          className="absolute inset-0 -z-10"
          style={{
            transform: "translateZ(0)",
          }}
          animate={{
            rotate: [0, 360],
            x: mouse.x * 8,
            y: mouse.y * 5,
          }}
          transition={{
            rotate: { duration: 90, repeat: Infinity, ease: "linear" },
            x: { type: "spring", stiffness: 40, damping: 18 },
            y: { type: "spring", stiffness: 40, damping: 18 },
          }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0"
            style={{
              y: bgScrollY,
              background:
                "radial-gradient(40% 40% at 12% 18%, rgba(255, 99, 132, 0.12), transparent 60%)," + // pink
                "radial-gradient(50% 50% at 88% 15%, rgba(54, 162, 235, 0.12), transparent 60%)," + // blue
                "radial-gradient(55% 55% at 18% 85%, rgba(255, 206, 86, 0.10), transparent 60%)," + // yellow
                "radial-gradient(45% 45% at 80% 78%, rgba(75, 192, 192, 0.12), transparent 60%)," + // teal
                "radial-gradient(36% 36% at 55% 50%, rgba(157, 107, 255, 0.10), transparent 60%)," + // lavender
                "radial-gradient(42% 42% at 30% 60%, rgba(114, 224, 167, 0.10), transparent 60%)",   // mint
              mixBlendMode: "multiply",
            }}
          />
        </motion.div>

        {/* New: Floating finance icons with opposing parallax */}
        <motion.div
          className="absolute top-20 left-1/5"
          animate={{ x: mouse.x * 10, y: mouse.y * 6 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          aria-hidden
        >
          <motion.span
            className="text-4xl select-none"
            animate={{ y: [0, -8, 0], rotate: [0, 6, -4, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            💰
          </motion.span>
        </motion.div>
        <motion.div
          className="absolute top-36 right-24"
          animate={{ x: mouse.x * -12, y: mouse.y * -8 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          aria-hidden
        >
          <motion.span
            className="text-3xl select-none"
            animate={{ y: [0, 10, 0], rotate: [0, -6, 4, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          >
            📊
          </motion.span>
        </motion.div>
        <motion.div
          className="absolute bottom-24 left-10"
          animate={{ x: mouse.x * 14, y: mouse.y * 10 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          aria-hidden
        >
          <motion.span
            className="text-4xl select-none"
            animate={{ y: [0, -6, 0], rotate: [0, 4, -3, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          >
            🤖
          </motion.span>
        </motion.div>
      </div>

      {/* Nav */}
      <div className="relative z-10">
        <nav className="sticky top-0 backdrop-blur-md bg-white/65 dark:bg-white/10 border-b z-30">
          <div className="flex items-center justify-between px-6 py-3 relative">
            {/* Left: Logo + brand */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border bg-card">
                <img src={LOGO_URL} alt="prosprAI logo" className="h-7 w-auto" />
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight">prosprAI</span>
            </div>
            {/* Right: Theme + Dashboard/Get Started + Profile */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title="Toggle theme"
              >
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
              <Button
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                disabled={loading}
                aria-busy={loading}
              >
                {isAuthenticated ? "Dashboard" : "Get Started"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {isAuthenticated && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-10 rounded-full pl-1 pr-2 gap-2"
                      aria-label="Open profile menu"
                    >
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
                    <button
                      className="w-full text-left rounded-md px-2 py-1.5 hover:bg-accent/40"
                      onClick={() => navigate("/dashboard")}
                    >
                      Personal Info
                    </button>
                    <button
                      className="w-full text-left rounded-md px-2 py-1.5 hover:bg-accent/40"
                      onClick={() => navigate("/chat")}
                    >
                      Your Data
                    </button>
                    <button
                      className="w-full text-left rounded-md px-2 py-1.5 hover:bg-accent/40"
                      onClick={() => navigate("/dashboard")}
                    >
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

            {/* Center: Section links */}
            <div
              className={`hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2`}
            >
              {[
                { id: "why", label: "Why Us" },
                { id: "how", label: "How it Works" },
                { id: "privacy", label: "Privacy" },
                { id: "cta", label: "Get Started" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => goTo(link.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    activeSection === link.id
                      ? "bg-primary/20 text-foreground border border-primary/30"
                      : "hover:bg-muted/60"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Hero */}
      <div id="hero" className="relative z-10">
        <section className="px-6 pt-10">
          <div className="mx-auto max-w-5xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold tracking-tight text-foreground"
              style={{ y: heroTitleY }}
            >
              {isAuthenticated
                ? `Welcome, ${user?.name || user?.email || "there"}`
                : "Welcome to prosprAI"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg md:text-xl text-muted-foreground"
            >
              {"Finance Made Smarter. Prosperity Made Closer."}
            </motion.p>

            {/* CTA when not authenticated */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex justify-center"
              >
                {/* subtle interactive hover/tap */}
                <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => navigate("/auth")}
                  >
                    Sign up to ask questions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Scroll indicator */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => goTo("why")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            aria-label="Scroll to Why ProsprAI"
            title="Scroll to Why ProsprAI"
          >
            <span>Scroll to explore</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </button>
        </div>

        {/* Glassmorphism Illustration */}
        <section className="relative px-6 pt-8">
          <div className="mx-auto max-w-5xl">
            {/* Soft animated blobs behind the glass cards */}
            <div className="pointer-events-none absolute inset-0 -z-10">
              <motion.div
                className="absolute -top-10 left-12 h-40 w-40 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(255,204,0,0.22), transparent 60%)" }}
                animate={{ x: [0, 10, -6, 0], y: [0, -6, 8, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute top-16 right-10 h-48 w-48 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(177,59,255,0.16), transparent 60%)" }}
                animate={{ x: [0, -8, 12, 0], y: [0, 10, -6, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(71,19,150,0.14), transparent 60%)" }}
                animate={{ x: [0, 6, -8, 0], y: [0, 8, -10, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ y: -4 }}  // Add subtle float on hover for consistency
                className="rounded-xl border bg-white/50 dark:bg-card/40 backdrop-blur-md p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border bg-white/60 dark:bg-background/40">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="font-semibold tracking-tight">Smart by Design</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clear, actionable answers on budgeting, statements, and ratios — without the jargon.
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  ✨ Friendly, expert guidance
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.12, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ y: -4 }}
                className="rounded-xl border bg-white/50 dark:bg-card/40 backdrop-blur-md p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border bg-white/60 dark:bg-background/40">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="font-semibold tracking-tight">Always On</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ask anything — from ROE/ROA basics to cash flow health and allocation ideas.
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  ⚡ Fast, reliable responses
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.18, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ y: -4 }}
                className="rounded-xl border bg-white/50 dark:bg-card/40 backdrop-blur-md p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border bg-white/60 dark:bg-background/40">
                    <span className="text-base" role="img" aria-label="chart">📈</span>
                  </div>
                  <div className="font-semibold tracking-tight">Built for You</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Personalized and practical — your name, your goals, your journey.
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  💛 Human tone, pro insights
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* New: Why Choose ProsprAI */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[900px] -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 180, 80, 0.16), transparent 60%)",
            y: bgScrollY,
          }}
          aria-hidden
        />

        <section id="why" className="relative px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-3xl md:text-4xl font-bold tracking-tight text-center"
            >
              Why Choose ProsprAI?
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                className="rounded-xl border bg-white/60 dark:bg-card/40 backdrop-blur-md p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border bg-white/70 dark:bg-background/40">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="font-semibold tracking-tight">Finance made simple</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clear answers without jargon. Understand where you stand and what to do next.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                className="rounded-xl border bg-white/60 dark:bg-card/40 backdrop-blur-md p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border bg-white/70 dark:bg-background/40">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div className="font-semibold tracking-tight">Actionable insights</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Trends and tips tailored to your goals, income, and comfort with risk.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                className="rounded-xl border bg-white/60 dark:bg-card/40 backdrop-blur-md p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border bg-white/70 dark:bg-background/40">
                    <PieChart className="h-4 w-4" />
                  </div>
                  <div className="font-semibold tracking-tight">Personalized by AI</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Advice adapts as your life evolves—budgets, portfolios, and goals included.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                className="rounded-xl border bg-white/60 dark:bg-card/40 backdrop-blur-md p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border bg-white/70 dark:bg-background/40">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="font-semibold tracking-tight">Secure by design</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your data stays yours. Bank‑level protection and full control to delete anytime.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* New: How ProsprAI Works */}
        <section id="how" className="relative px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-3xl md:text-4xl font-bold tracking-tight text-center"
            >
              How ProsprAI Works
            </motion.h2>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {[
                { title: "Ask AI", desc: "Type a question or upload statements.", step: "1" },
                { title: "Get Insights", desc: "AI breaks it down with simple visuals.", step: "2" },
                { title: "Track Growth", desc: "Dashboard keeps your progress updated.", step: "3" },
              ].map((s, idx) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: idx * 0.06, type: "spring", stiffness: 220, damping: 22 }}
                  className="relative rounded-xl border bg-white/60 dark:bg-card/40 backdrop-blur-md p-6"
                >
                  <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-foreground grid place-items-center font-bold">
                    {s.step}
                  </div>
                  <div className="text-lg font-semibold">{s.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${((idx + 1) / 3) * 100}%` }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full bg-secondary"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* New: Data Privacy & Security */}
        <section id="privacy" className="relative px-6 py-16">
          {/* Darken-on-view overlay for mood shift */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.08 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            style={{
              background:
                "radial-gradient(60% 60% at 50% 40%, rgba(0,0,0,0.5), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="mx-auto max-w-5xl relative">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-3xl md:text-4xl font-bold tracking-tight text-center"
            >
              Your Data, Safe with Us
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              className="mt-8 rounded-2xl border bg-white/60 dark:bg-card/40 backdrop-blur-md p-6 md:p-8"
            >
              <div className="grid md:grid-cols-[1fr_1.6fr] gap-6 items-center">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-secondary/20 to-primary/20 blur-2xl" />
                    <motion.div
                      className="relative h-28 w-28 rounded-3xl border grid place-items-center bg-white/70 dark:bg-white/10"
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Lock className="h-10 w-10" />
                    </motion.div>
                  </div>
                </div>
                <ul className="space-y-3 text-sm">
                  <li>🔒 Bank-level encryption for all data</li>
                  <li>🔐 No sharing with third parties</li>
                  <li>🛡️ You control your information — delete anytime</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA with dynamic gradient wave */}
        <section id="cta" className="relative px-6 py-16">
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{ y: ctaWaveY }}
            animate={{ x: [0, 20, -10, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(40% 40% at 20% 20%, rgba(255, 204, 0, 0.18), transparent 60%)," +
                  "radial-gradient(40% 40% at 80% 30%, rgba(157, 107, 255, 0.16), transparent 60%)," +
                  "radial-gradient(40% 40% at 30% 80%, rgba(114, 224, 167, 0.14), transparent 60%)",
                filter: "saturate(1.1)",
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto max-w-4xl rounded-3xl border bg-gradient-to-br from-primary/20 via-white/70 to-transparent dark:from-secondary/20 dark:via-white/5 dark:to-transparent backdrop-blur-md p-8 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold">Take Charge of Your Finances Today</h3>
            <p className="mt-2 text-muted-foreground">
              Get clear answers and a plan that adapts to you.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => navigate(isAuthenticated ? "/chat" : "/auth")} className="gap-2">
                Ask ProsprAI Now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
                View Dashboard
              </Button>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Animated Answer Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>AI Answer</DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="max-h-[60vh] overflow-auto rounded-md border p-4"
          >
            {answer}
          </motion.div>
        </DialogContent>
      </Dialog>

      <Footer />
    </motion.div>
  );
}