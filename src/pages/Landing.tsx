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

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    setMouse({ x, y });
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
      className="min-h-screen bg-background"
      onMouseMove={handleMouseMove}
    >
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
            <span className="text-2xl font-bold text-foreground tracking-tight">FinanceAI</span>
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
                : "Welcome to FinanceAI"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg md:text-xl text-muted-foreground"
            >
              {isAuthenticated
                ? "Ask anything about investments, budgeting, statements, or ratios — get clear, professional answers."
                : "Your AI assistant for investments, budgeting, statements, and ratios — sign up to start asking questions."}
            </motion.p>

            {/* CTA when not authenticated */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex justify-center"
              >
                <Button
                  onClick={() => navigate("/auth")}
                >
                  Sign up to ask questions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </section>

        {/* AI Chat Card - only after sign up (authenticated) */}
        {isAuthenticated && (
          <section className="px-6 py-10">
            <div className="mx-auto max-w-3xl">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-foreground/90">
                    <Bot className="h-5 w-5" />
                    <span className="font-semibold">Ask DeepSeek Finance AI</span>
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
          </section>
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