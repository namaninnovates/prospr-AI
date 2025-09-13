// TODO: REPLACE THIS LANDING PAGE WITH AN ELEGANT, THEMATIC, AND WELL-DESIGNED LANDING PAGE RELEVANT TO THE PROJECT
import { motion } from "framer-motion";
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

type InteractiveEl = HTMLElement | null;

export default function Landing() {
  const { isAuthenticated, user, isLoading } = useAuth();
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background cursor-none"
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
      </div>

      {/* Nav */}
      <div className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border bg-card">
              <Brain className="h-7 w-7 text-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">prosprAI</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
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
          </div>
        </nav>
      </div>

      {/* Hero */}
      <div className="relative z-10">
        <section className="px-6 pt-10">
          <div className="mx-auto max-w-5xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold tracking-tight text-foreground"
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

        {/* AI Chat Card - only after sign up (authenticated) */}
        {isAuthenticated && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="px-6 py-10"
          >
            <div className="mx-auto max-w-3xl">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-foreground/90">
                    <Bot className="h-5 w-5" />
                    <span className="font-semibold">Ask prosprAI</span>
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., What is a good asset allocation for a moderate risk profile? How do I compute ROE and what does it mean?"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={askAI}
                      disabled={loading || !prompt.trim()}
                      aria-busy={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...
                        </>
                      ) : (
                        <>
                          <Bot className="mr-2 h-4 w-4" /> Ask AI
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPrompt("");
                        setAnswer(null);
                      }}
                      disabled={loading}
                    >
                      Clear
                    </Button>
                  </div>

                  {answer && (
                    <div className="mt-2 rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          Answer
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowModal(true)}
                        >
                          View in Modal
                        </Button>
                      </div>
                      <div className="whitespace-pre-wrap">{answer}</div>
                    </div>
                  )}

                  {!answer && !loading && (
                    <div className="text-sm text-muted-foreground">
                      Tips: Ask about P/E, ROE/ROA, DCF basics, cash flow health, leverage, liquidity, or how to read a balance sheet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.section>
        )}
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
    </motion.div>
  );
}