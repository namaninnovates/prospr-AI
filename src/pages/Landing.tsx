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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const chat = useAction(api.ai.chatWithAI);

  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // Theme state managed via DOM class & localStorage for persistence
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = stored ? stored === "dark" : true || prefersDark;
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
    >
      {/* Nav */}
      <div className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FinanceAI</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="outline"
              onClick={toggleTheme}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
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
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
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
              className="text-5xl md:text-6xl font-bold tracking-tight text-white"
            >
              Glassmorphism Finance Assistant
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg md:text-xl text-white/85"
            >
              Ask anything about investments, budgeting, statements, or ratios — explained clearly and professionally.
            </motion.p>
          </div>
        </section>

        {/* AI Chat Card */}
        <section className="px-6 py-10">
          <div className="mx-auto max-w-3xl">
            <Card className="border-white/20 bg-white/10 backdrop-blur-xl text-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-white/90">
                  <Bot className="h-5 w-5" />
                  <span className="font-semibold">Ask DeepSeek Finance AI</span>
                </div>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., What is a good asset allocation for a moderate risk profile? How do I compute ROE and what does it mean?"
                  className="min-h-28 bg-white/5 border-white/20 text-white placeholder:text-white/60"
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={askAI}
                    disabled={loading || !prompt.trim()}
                    className="bg-blue-500/20 text-blue-100 border border-blue-400/30 hover:bg-blue-500/30"
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
                    className="bg-white/5 text-white border-white/20 hover:bg-white/15"
                    disabled={loading}
                  >
                    Clear
                  </Button>
                </div>

                {answer && (
                  <div className="mt-2 rounded-lg border border-white/15 bg-white/5 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        Answer
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/5 text-white border-white/20 hover:bg-white/15"
                        onClick={() => setShowModal(true)}
                      >
                        View in Modal
                      </Button>
                    </div>
                    <div className="whitespace-pre-wrap text-white/95">{answer}</div>
                  </div>
                )}

                {!answer && !loading && (
                  <div className="text-sm text-white/70">
                    Tips: Ask about P/E, ROE/ROA, DCF basics, cash flow health, leverage, liquidity, or how to read a balance sheet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Animated Answer Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="border-white/20 bg-white/10 backdrop-blur-2xl text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-white/95">AI Answer</DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="max-h-[60vh] overflow-auto rounded-md border border-white/10 bg-white/5 p-4 text-white/95"
          >
            {answer}
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}