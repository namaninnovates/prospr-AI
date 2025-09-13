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
import { Bot, Plus, Send, Loader2, ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUp, ArrowDown, Pencil, Check, X, Wand2 } from "lucide-react";

type InteractiveEl = HTMLElement | null;

export default function ChatPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
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

  // Call useQuery at top level; pass undefined to pause until chat is selected
  const messages = useQuery(
    api.messages.listByChat,
    activeChatId ? ({ chatId: activeChatId as any }) : "skip"
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [movingId, setMovingId] = useState<string | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

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

  const onMove = async (id: string, direction: "up" | "down") => {
    if (movingId) return;
    setMovingId(id);
    try {
      await moveChat({ chatId: id as any, direction });
    } finally {
      setMovingId(null);
    }
  };

  const onSummarize = async (id: string) => {
    if (summarizingId) return;
    setSummarizingId(id);
    try {
      await summarizeChat({ chatId: id as any });
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
        <Loader2 className="h-6 w-6 animate-spin" />
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
      className="min-h-screen bg-background cursor-none"
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
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(177,59,255,0.18), transparent 60%)" }}
          animate={{ x: mouse.x * 20, y: mouse.y * 20 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(71,19,150,0.16), transparent 60%)" }}
          animate={{ x: mouse.x * -25, y: mouse.y * -25 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,204,0,0.08), transparent 60%)" }}
          animate={{ x: mouse.x * 15, y: mouse.y * 10 }}
          transition={{ type: "spring", stiffness: 60, damping: 22 }}
        />
      </div>

      {/* Top Bar */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md bg-white/40 dark:bg-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border bg-card/60 backdrop-blur-md">
            <Bot className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight">FinanceAI Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Home
          </Button>
        </div>
      </nav>

      {/* Layout */}
      <div className="px-6 py-6 grid gap-4 md:grid-cols-[280px_1fr] max-w-6xl mx-auto">
        {/* Sidebar: chats */}
        <Card className="h-[72vh] md:h-[76vh] bg-white/40 dark:bg-card/40 backdrop-blur-md border-white/30">
          <CardContent className="p-3 h-full overflow-auto space-y-2">
            {listChats.length === 0 && (
              <div className="text-sm text-muted-foreground">No chats yet. Create one to start.</div>
            )}
            <TooltipProvider>
              {listChats.map((c) => (
                <Tooltip key={c._id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      className={`w-full rounded-md border p-2 ${activeChatId === c._id ? "bg-primary/10 border-primary/30" : "bg-card"} ${draggingId === c._id ? "opacity-70 ring-2 ring-primary/40" : ""}`}
                      draggable
                      onMouseDown={() => setDraggingId(c._id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggingId) reorder(draggingId, c._id);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 220, damping: 22 }}
                    >
                      <div className="flex items-center justify-between gap-2">
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
                              <span className="text-sm truncate">{c.title}</span>
                            </div>
                          )}
                        </button>
                        {editingId !== c._id && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => startEdit(c._id, c.title)}
                              title="Edit title"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => onMove(c._id, "up")}
                              disabled={movingId === c._id}
                              title="Move up"
                            >
                              {movingId === c._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ArrowUp className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => onMove(c._id, "down")}
                              disabled={movingId === c._id}
                              title="Move down"
                            >
                              {movingId === c._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="default"
                              className={`h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow transition-shadow ${summarizingId === c._id ? "opacity-80" : ""}`}
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
                    {renderBrief(c.brief)}
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>

            {/* New Chat button moved below all chats with purple glass styling */}
            <div className="pt-2">
              <Button
                onClick={newChat}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat panel */}
        <Card className="flex flex-col h-[72vh] md:h-[76vh] bg-white/40 dark:bg-card/40 backdrop-blur-md border-white/30">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-auto p-4 space-y-3">
              {!activeChatId && (
                <div className="text-sm text-muted-foreground">Select a chat or create a new one.</div>
              )}
              {activeChatId && messages === undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading messages...
                </div>
              )}
              {activeChatId &&
                Array.isArray(messages) &&
                messages.map((m: any) => (
                  <motion.div
                    key={m._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md ${
                      m.role === "user"
                        ? "ml-auto border-secondary/30 bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent"
                        : "border-white/20 bg-gradient-to-br from-white/40 via-white/20 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent"
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground/80 mb-1.5">
                      {m.role === "user" ? (user?.name || "You") : "prosprAI"}
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                  </motion.div>
                ))}

              {/* Assistant "thinking" bubble while generating a reply */}
              {activeChatId && sending && (
                <motion.div
                  key="assistant-thinking"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-[80%] px-3.5 py-2.5 rounded-2xl border border-white/20 bg-gradient-to-br from-white/40 via-white/20 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md"
                >
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground/80 mb-1.5">
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
            <div className="border-t p-3 bg-white/30 dark:bg-white/10 backdrop-blur-md">
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
                  className="bg-white/60 dark:bg-white/10"
                />
                <Button onClick={send} disabled={sending || !activeChatId} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              {!activeChatId && (
                <div className="text-xs text-muted-foreground mt-2">Create or select a chat to begin.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}