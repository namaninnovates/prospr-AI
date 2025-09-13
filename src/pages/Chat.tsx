import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Bot, Plus, Send, Loader2, ArrowLeft, Share2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GripVertical, Pencil, Check, X, Wand2, Brain } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Moon, Sun, ChevronDown } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

type InteractiveEl = HTMLElement | null;

export default function ChatPage() {
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const navigate = useNavigate();

  const createChat = useMutation(api.chats.createChat);
  const listChats = useQuery(api.chats.listMyChats);
  const addMessage = useMutation(api.messages.addMessage);
  const chatWithAI = useAction(api.ai.chatWithAI);
  const renameChat = useMutation(api.chats.renameChat);
  const moveChat = useMutation(api.chats.moveChat);
  const summarizeChat = useAction(api.ai.summarizeChat);
  const reorderChats = useMutation(api.chats.reorderChats);

  const [activeChatId, setActiveChatId] = useState<null | string>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Cursor + parallax state (same style as Landing)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveringInteractive, setHoveringInteractive] = useState<boolean>(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Add: Theme state and persistence (match Landing)
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

  // Add: Shared logo URL (match Landing)
  const LOGO_URL =
    "https://harmless-tapir-303.convex.cloud/api/storage/2844fd15-ce02-408e-9ac5-3e88a6ab15f7";

  // Call useQuery at top level; pass undefined to pause until chat is selected
  const messages = useQuery(
    api.messages.listByChat,
    activeChatId ? ({ chatId: activeChatId as any }) : "skip"
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  // Derive active chat object to show title and share
  const activeChat = useMemo(() => {
    if (!listChats || !activeChatId) return null;
    return listChats.find((c) => c._id === activeChatId) ?? null;
  }, [listChats, activeChatId]);

  // Reusable brain-thinking loader with animated dots and glass styling
  function BrainThinking({ label = "Thinking…" }: { label?: string }) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-2xl border border-white/30 bg-white/40 dark:bg-white/10 backdrop-blur-md px-3.5 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <Brain className="h-4 w-4 text-secondary animate-pulse" />
        <span className="inline-flex items-center">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce [animation-delay:-200ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce mx-1" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce [animation-delay:200ms]" />
        </span>
        {label}
      </div>
    );
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth");
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!activeChatId && listChats && listChats.length > 0) {
      setActiveChatId(listChats[0]._id);
    }
  }, [listChats, activeChatId]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    setMouse({ x, y });

    setCursorPos({ x: e.clientX, y: e.clientY });

    const target = (e.target as HTMLElement) ?? null;
    const isInteractive = !!(target as InteractiveEl)?.closest?.(
      "button,[role='button'],a,input,textarea,select,label,.cursor-pointer"
    );
    setHoveringInteractive(Boolean(isInteractive));
  };

  const newChat = async () => {
    const id = await createChat({ title: "New Chat" });
    setActiveChatId(id);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !activeChatId || sending) return;
    setSending(true);
    try {
      await addMessage({ chatId: activeChatId as any, role: "user", content: text });
      setInput("");
      const answer = await chatWithAI({
        messages: [{ role: "user", content: text }],
      });
      await addMessage({ chatId: activeChatId as any, role: "assistant", content: answer });
    } catch (e) {
      await addMessage({
        chatId: activeChatId as any,
        role: "assistant",
        content: "Sorry, I couldn't process that. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditTitle(current);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveEdit = async (id: string) => {
    const title = editTitle.trim();
    if (!title) return;
    await renameChat({ chatId: id as any, title });
    setEditingId(null);
    setEditTitle("");
  };

  const shareChat = async () => {
    try {
      if (!activeChatId || !activeChat) {
        toast.error("Select a chat to share");
        return;
      }
      const url = `${window.location.origin}/chat`;
      const shareText = `Chat — ${activeChat.title}`;
      if (navigator.share) {
        await navigator.share({
          title: activeChat.title,
          text: shareText,
          url,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} — ${url}`);
        toast.success("Link copied to clipboard");
      }
    } catch {
      toast.error("Unable to share. Please try again.");
    }
  };

  const onSummarize = async (id: string) => {
    if (summarizingId) return;
    setSummarizingId(id);
    try {
      await summarizeChat({ chatId: id as any });
      toast.success("Brief generated");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to summarize. Please configure OpenRouter in Integrations.");
    } finally {
      setSummarizingId(null);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  // Safely derive message count to avoid TS issues when messages may be undefined or non-array
  const messageCount = Array.isArray(messages) ? messages.length : 0;
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messageCount, sending]);

  if (isLoading || !isAuthenticated || !listChats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BrainThinking label="Loading chat…" />
      </div>
    );
  }

  // Build a new ordering when a chat is dropped onto another chat
  const reorder = async (sourceId: string, targetId: string) => {
    if (!listChats) return;
    if (sourceId === targetId) return;
    const ids = listChats.map((c) => c._id);
    const idStrings = ids.map(String);
    const from = idStrings.indexOf(String(sourceId));
    const to = idStrings.indexOf(String(targetId));
    if (from === -1 || to === -1) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    try {
      await reorderChats({ orderedIds: next as any });
    } finally {
      setDraggingId(null);
    }
  };

  // Render a styled bullet list for the chat brief
  function renderBrief(text?: string) {
    if (!text) {
      return (
        <div className="text-xs text-muted-foreground">
          No brief yet. Click the magic wand to generate a summary.
        </div>
      );
    }
    const items = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((l) => l.replace(/^[-*•]\s?/, "")); // strip leading bullet chars

    if (items.length === 0) {
      return <div className="text-xs text-muted-foreground whitespace-pre-wrap">{text}</div>;
    }

    return (
      <ul className="text-xs text-muted-foreground list-disc pl-4 pr-2 space-y-1">
        {items.map((it, i) => (
          <li key={i} className="leading-snug">{it}</li>
        ))}
      </ul>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen cursor-none bg-gradient-to-b from-slate-50 via-white to-zinc-50 dark:from-background dark:via-background dark:to-background flex flex-col"
      onMouseMove={onMouseMove}
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

      {/* Parallax Background Elements (same spirit as Landing) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <motion.div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(177,59,255,0.18), transparent 60%)" }}
          animate={{ x: mouse.x * 20, y: mouse.y * 20 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(71,19,150,0.14), transparent 60%)" }}
          animate={{ x: mouse.x * -25, y: mouse.y * -25 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,204,0,0.10), transparent 60%)" }}
          animate={{ x: mouse.x * 15, y: mouse.y * 10 }}
          transition={{ type: "spring", stiffness: 60, damping: 22 }}
        />

        {/* Rotating gradient mesh overlay copied from Landing */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 15% 20%, rgba(255, 99, 132, 0.12), transparent 60%)," +
              "radial-gradient(50% 50% at 85% 25%, rgba(54, 162, 235, 0.12), transparent 60%)," +
              "radial-gradient(55% 55% at 20% 85%, rgba(255, 206, 86, 0.10), transparent 60%)," +
              "radial-gradient(45% 45% at 80% 80%, rgba(75, 192, 192, 0.12), transparent 60%)",
            mixBlendMode: "multiply",
          }}
          animate={{
            rotate: [0, 360],
            x: mouse.x * 10,
            y: mouse.y * 6,
          }}
          transition={{
            rotate: { duration: 80, repeat: Infinity, ease: "linear" },
            x: { type: "spring", stiffness: 40, damping: 20 },
            y: { type: "spring", stiffness: 40, damping: 20 },
          }}
          aria-hidden
        />

        {/* Extra floating blobs for liveliness */}
        <motion.div
          className="absolute top-10 left-1/4"
          animate={{ x: mouse.x * 14, y: mouse.y * 10 }}
          transition={{ type: "spring", stiffness: 50, damping: 22 }}
          aria-hidden
        >
          <motion.div
            className="h-56 w-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(236,72,153,0.14), transparent 60%)" }}
            animate={{ x: [0, 10, -8, 0], y: [0, -10, 12, 0], scale: [1, 1.04, 0.98, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.div
          className="absolute bottom-10 right-1/3"
          animate={{ x: mouse.x * -16, y: mouse.y * -12 }}
          transition={{ type: "spring", stiffness: 50, damping: 22, delay: 0.2 }}
          aria-hidden
        >
          <motion.div
            className="h-52 w-52 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.12), transparent 60%)" }}
            animate={{ x: [0, -12, 10, 0], y: [0, 8, -10, 0], scale: [1, 0.97, 1.03, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
        </motion.div>
      </div>

      <Header />

      {/* Layout */}
      <div className="px-6 py-6 grid gap-4 md:grid-cols-[280px_1fr] max-w-6xl mx-auto flex-1">
        {/* Sidebar: chats */}
        <Card className="h-[72vh] md:h-[76vh] bg-white/40 dark:bg-card/40 backdrop-blur-md border-white/30">
          <CardContent className="p-3 h-full overflow-auto space-y-2">
            {listChats.length === 0 && (
              <div className="text-sm text-muted-foreground">No chats yet. Create one to start.</div>
            )}
            <TooltipProvider>
              {listChats.map((c, idx) => (
                <Tooltip key={c._id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`w-full rounded-md border p-2 ${activeChatId === c._id ? "bg-primary/10 border-primary/30" : "bg-card"} ${draggingId === c._id ? "opacity-70 ring-2 ring-primary/40" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggingId) reorder(draggingId, c._id);
                      }}
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 220, damping: 22, delay: Math.min(idx * 0.02, 0.2) }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            draggable
                            onDragStart={() => setDraggingId(c._id)}
                            onDragEnd={() => setDraggingId(null)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-card/70 hover:bg-card cursor-grab active:cursor-grabbing"
                            aria-label="Drag to reorder"
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => setActiveChatId(c._id)}
                            className="flex-1 text-left truncate"
                            title={c.title}
                          >
                            {editingId === c._id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  autoFocus
                                  className="h-8"
                                />
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => saveEdit(c._id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(c._id, c.title);
                                  }}
                                  className="text-sm truncate hover:underline decoration-dotted"
                                  title="Click to rename"
                                >
                                  {c.title}
                                </span>
                              </div>
                            )}
                          </button>
                        </div>
                        {editingId !== c._id && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="default"
                              className={`h-8 w-8 bg-white/60 text-foreground hover:bg-white/70 shadow-sm transition-shadow ${summarizingId === c._id ? "opacity-80" : ""}`}
                              onClick={() => onSummarize(c._id)}
                              disabled={summarizingId === c._id}
                              title="Generate brief"
                            >
                              {summarizingId === c._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Wand2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="text-xs font-medium mb-1">{c.title}</div>
                    {c.brief ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children, ...props }: any) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-secondary hover:opacity-90"
                                {...props}
                              >
                                {children}
                              </a>
                            ),
                            code: ({ className, children, ...props }: any) => {
                              const isBlock = typeof className === "string" && /language-/.test(className);
                              if (isBlock) {
                                return (
                                  <pre className="overflow-x-auto rounded-md border bg-black/80 text-white p-3 my-2">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                );
                              }
                              return (
                                <code
                                  className={`rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5 ${className ?? ""}`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            p: ({ children, ...props }: any) => (
                              <p className="mb-2 whitespace-pre-wrap" {...props}>
                                {children}
                              </p>
                            ),
                            ul: ({ children, ...props }: any) => (
                              <ul className="list-disc pl-5 my-2 space-y-1" {...props}>
                                {children}
                              </ul>
                            ),
                            ol: ({ children, ...props }: any) => (
                              <ol className="list-decimal pl-5 my-2 space-y-1" {...props}>
                                {children}
                              </ol>
                            ),
                            li: ({ children, ...props }: any) => (
                              <li className="leading-snug" {...props}>
                                {children}
                              </li>
                            ),
                            h1: (props: any) => <h1 className="text-lg font-semibold mb-2" {...props} />,
                            h2: (props: any) => <h2 className="text-base font-semibold mb-2" {...props} />,
                            h3: (props: any) => <h3 className="text-sm font-semibold mb-2" {...props} />,
                            table: (props: any) => (
                              <div className="overflow-x-auto my-2">
                                <table className="w-full text-sm border-collapse" {...props} />
                              </div>
                            ),
                            th: (props: any) => <th className="border px-2 py-1 text-left bg-white/30 dark:bg-white/10" {...props} />,
                            td: (props: any) => <td className="border px-2 py-1" {...props} />,
                          }}
                        >
                          {c.brief}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        No brief yet. Click the magic wand to generate a summary.
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>

            {/* New Chat button moved below all chats with purple glass styling */}
            <div className="pt-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={newChat}
                  className="w-full bg-white/60 text-foreground hover:bg-muted/60 shadow-md border border-white/30 dark:bg-white/10 dark:hover:bg-muted/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Chat
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Chat panel */}
        <Card className="flex flex-col h-[72vh] md:h-[76vh] bg-white/40 dark:bg-card/40 backdrop-blur-md border-white/30">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Chat header with title and Share */}
            <div className="flex items-center justify-between border-b p-3 bg-white/30 dark:bg-white/10 backdrop-blur-md">
              <div className="truncate text-sm font-medium">
                {activeChat ? activeChat.title : "Select a chat"}
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={shareChat}
                  disabled={!activeChat}
                  title="Share chat"
                  className="gap-2 rounded-full px-3 py-1.5 bg-white/60 text-foreground hover:bg-muted/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md border border-white/30 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-white/10 dark:hover:bg-muted/20"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </motion.div>
            </div>

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-auto p-4 space-y-3">
              {!activeChatId && (
                <div className="text-sm text-muted-foreground">Select a chat or create a new one.</div>
              )}
              {activeChatId && messages === undefined && (
                <BrainThinking label="Loading messages…" />
              )}
              {activeChatId &&
                Array.isArray(messages) &&
                messages.map((m: any) => (
                  <motion.div
                    layout
                    key={m._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 22 }}
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md ${
                      m.role === "user"
                        ? "ml-auto border-white/30 bg-gradient-to-br from-white/70 via-white/40 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent"
                        : "border-white/20 bg-gradient-to-br from-white/40 via-white/20 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent"
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground/80 mb-1.5">
                      {m.role === "user" ? (user?.name || "You") : "prosprAI"}
                    </div>
                    {/* Render markdown for assistant replies; keep user as plain text for predictability */}
                    {m.role === "assistant" ? (
                      <div className="text-sm leading-relaxed break-words">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children, ...props }: any) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-secondary hover:opacity-90"
                                {...props}
                              >
                                {children}
                              </a>
                            ),
                            code: ({ className, children, ...props }: any) => {
                              const isBlock = typeof className === "string" && /language-/.test(className);
                              if (isBlock) {
                                return (
                                  <pre className="overflow-x-auto rounded-md border bg-black/80 text-white p-3 my-2">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                );
                              }
                              return (
                                <code
                                  className={`rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5 ${className ?? ""}`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            p: ({ children, ...props }: any) => (
                              <p className="mb-2 whitespace-pre-wrap" {...props}>
                                {children}
                              </p>
                            ),
                            ul: ({ children, ...props }: any) => (
                              <ul className="list-disc pl-5 my-2 space-y-1" {...props}>
                                {children}
                              </ul>
                            ),
                            ol: ({ children, ...props }: any) => (
                              <ol className="list-decimal pl-5 my-2 space-y-1" {...props}>
                                {children}
                              </ol>
                            ),
                            li: ({ children, ...props }: any) => (
                              <li className="leading-snug" {...props}>
                                {children}
                              </li>
                            ),
                            h1: (props: any) => <h1 className="text-lg font-semibold mb-2" {...props} />,
                            h2: (props: any) => <h2 className="text-base font-semibold mb-2" {...props} />,
                            h3: (props: any) => <h3 className="text-sm font-semibold mb-2" {...props} />,
                            table: (props: any) => (
                              <div className="overflow-x-auto my-2">
                                <table className="w-full text-sm border-collapse" {...props} />
                              </div>
                            ),
                            th: (props: any) => <th className="border px-2 py-1 text-left bg-white/30 dark:bg-white/10" {...props} />,
                            td: (props: any) => <td className="border px-2 py-1" {...props} />,
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                    )}
                  </motion.div>
                ))}

              {/* Assistant "thinking" bubble while generating a reply */}
              {activeChatId && sending && (
                <motion.div
                  layout
                  key="assistant-thinking"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  className="max-w-[80%] px-3.5 py-2.5 rounded-2xl border border-white/20 bg-gradient-to-br from-white/40 via-white/20 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md"
                >
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground/80 mb-1.5 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-secondary animate-pulse" />
                    prosprAI
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/50 animate-bounce [animation-delay:-200ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/50 animate-bounce mx-1" />
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/50 animate-bounce [animation-delay:200ms]" />
                    </span>
                    Thinking…
                  </div>
                </motion.div>
              )}
            </div>

            {/* Composer */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.05 }}
              className="border-t p-3 bg-white/30 dark:bg-white/10 backdrop-blur-md"
            >
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about budgeting, statements, ratios..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!activeChatId) return;
                      send();
                    }
                  }}
                  disabled={sending || !activeChatId}
                  className="rounded-2xl border border-white/30 bg-gradient-to-br from-white/70 via-white/40 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.08)] focus-visible:ring-2 focus-visible:ring-secondary/40 placeholder:text-foreground/60"
                />
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={send}
                    disabled={sending || !activeChatId}
                    className="bg-secondary/90 text-secondary-foreground hover:bg-muted/30 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md border border-white/20 dark:hover:bg-muted/30"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </motion.div>
              </div>
              {!activeChatId && (
                <div className="text-xs text-muted-foreground mt-2">Create or select a chat to begin.</div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </motion.div>
  );
}