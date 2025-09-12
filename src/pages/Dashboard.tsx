import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, FileText, Bot, Bell, Download, TrendingUp, Wallet, WalletMinimal, PieChart, Target, GraduationCap, BookOpenCheck } from "lucide-react";

type InteractiveEl = HTMLElement | null;
type TxnType = "income" | "expense" | "asset" | "liability";
type Txn = {
  id: string;
  date: string;
  type: TxnType;
  category: string;
  amount: number;
  note?: string;
};

const defaultTxns: Array<Txn> = [
  { id: "t1", date: "2025-01-05", type: "income", category: "Salary", amount: 3200, note: "Monthly salary" },
  { id: "t2", date: "2025-01-07", type: "expense", category: "Rent", amount: 1200, note: "Jan rent" },
  { id: "t3", date: "2025-01-09", type: "expense", category: "Groceries", amount: 210.55, note: "Weekly groceries" },
  { id: "t4", date: "2025-01-11", type: "asset", category: "Stocks", amount: 7500, note: "Portfolio value" },
  { id: "t5", date: "2025-01-12", type: "liability", category: "Credit Card", amount: 450, note: "CC outstanding" },
];

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveringInteractive, setHoveringInteractive] = useState<boolean>(false);
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    setCursorPos({ x: e.clientX, y: e.clientY });

    const { innerWidth, innerHeight } = window;
    const mx = (e.clientX / innerWidth - 0.5) * 2;
    const my = (e.clientY / innerHeight - 0.5) * 2;
    setMouse({ x: mx, y: my });

    const target = (e.target as HTMLElement) ?? null;
    const isInteractive = !!(target as InteractiveEl)?.closest?.(
      "button,[role='button'],a,input,textarea,select,label,.cursor-pointer"
    );
    setHoveringInteractive(Boolean(isInteractive));
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative min-h-screen overflow-hidden bg-background cursor-none" onMouseMove={handleMouseMove}>
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

      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--chart-2) 22%, transparent), transparent 60%)" }}
          animate={{ x: mouse.x * 20, y: mouse.y * 20 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full"
          style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--primary) 18%, transparent), transparent 60%)" }}
          animate={{ x: mouse.x * -25, y: mouse.y * -25 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute top-1/3 left-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--chart-1) 14%, transparent), transparent 60%)" }}
          animate={{ x: mouse.x * 15, y: mouse.y * 10 }}
          transition={{ type: "spring", stiffness: 60, damping: 22 }}
        />
      </div>

      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border bg-card">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">FinanceAI Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome{user?.name ? `, ${user.name}` : user?.email ? `, ${user.email}` : ""} — manage finances with AI.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/")}>
            <Bot className="mr-2 h-4 w-4" />
            Ask AI
          </Button>
          <Button onClick={() => toast("Notifications opened")}>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </div>
      </header>

      <main className="px-6 py-6">
        <Tabs defaultValue="home" className="mx-auto max-w-6xl">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="home">Dashboard</TabsTrigger>
            <TabsTrigger value="ledger">Transactions & Ledgers</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analysis</TabsTrigger>
            <TabsTrigger value="investments">Investments & Goals</TabsTrigger>
            <TabsTrigger value="learning">Learning Hub</TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <HomeTab />
          </TabsContent>

          <TabsContent value="ledger">
            <LedgerTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="investments">
            <InvestmentsTab />
          </TabsContent>

          <TabsContent value="learning">
            <LearningTab />
          </TabsContent>
        </Tabs>
      </main>
    </motion.div>
  );
}

function KPI({ label, value, icon: Icon, accentClass }: { label: string; value: string; icon: any; accentClass: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      whileHover={{ y: -3 }}
    >
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardDescription>{label}</CardDescription>
          <div className={`p-2 rounded-md border ${accentClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function HomeTab() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight">
          Snapshot{user?.name ? ` — ${user.name}` : ""}
        </h2>
        <p className="text-sm text-muted-foreground">
          Quick view of your financial health with AI insights.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-md border px-3 py-2 text-sm text-muted-foreground bg-primary/5 dark:bg-primary/10"
      >
        Overview of your finances at a glance with KPIs and AI-driven insights.
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPI label="Net Worth" value="$54,320" icon={WalletMinimal} accentClass="bg-primary/10 border-primary/20" />
        <KPI label="Income vs Expense" value="$3,200 / $1,650" icon={TrendingUp} accentClass="bg-secondary/10 border-secondary/20" />
        <KPI label="Debt Ratio" value="0.28" icon={PieChart} accentClass="bg-accent/10 border-accent/20" />
        <KPI label="Portfolio Value" value="$7,500" icon={Target} accentClass="bg-chart-1/10 border-chart-1/20" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          whileHover={{ y: -3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>Tips, red flags, and goal progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Insight text="Spending on groceries is up 12% MoM. Consider setting a weekly cap." tone="tip" />
              <Insight text="Credit card utilization at 45%. Aim to keep it under 30%." tone="warning" />
              <Insight text="You're on track to hit your emergency fund goal in 3 months." tone="success" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.05 }}
          whileHover={{ y: -3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => toast("Add Transaction dialog opened")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
              <Button variant="outline" onClick={() => toast("Generating report...")}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline" onClick={() => toast("Opening AI on landing")}>
                <Bot className="mr-2 h-4 w-4" />
                Ask AI
              </Button>
              <Button variant="outline" onClick={() => toast("Notifications opened")}>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Insight({ text, tone }: { text: string; tone: "tip" | "warning" | "success" }) {
  const toneClass = {
    tip: "border-primary/30 bg-primary/10",
    warning: "border-secondary/30 bg-secondary/10",
    success: "border-chart-3/30 bg-chart-3/10",
  }[tone];
  return (
    <div className={`text-sm rounded-md border px-3 py-2 ${toneClass}`}>
      {text}
    </div>
  );
}

function LedgerTab() {
  const [txns, setTxns] = useState<Array<Txn>>(defaultTxns);
  const [open, setOpen] = useState(false);

  // form state
  const [date, setDate] = useState("");
  const [type, setType] = useState<TxnType>("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");

  const income = useMemo(() => txns.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0), [txns]);
  const expense = useMemo(() => txns.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0), [txns]);

  function addTxn() {
    const amt = Number(amount);
    if (!date || !category || isNaN(amt)) {
      toast.error("Please fill all required fields.");
      return;
    }
    const id = Math.random().toString(36).slice(2);
    const next: Txn = { id, date, type, category, amount: amt, note: note || undefined };
    setTxns(prev => [next, ...prev]);
    setOpen(false);
    setDate(""); setCategory(""); setAmount(""); setNote("");
    toast.success("Transaction added");
  }

  function removeTxn(id: string) {
    setTxns(prev => prev.filter(t => t.id !== id));
    toast("Transaction removed");
  }

  function exportCsv() {
    const header = ["date", "type", "category", "amount", "note"];
    const rows = txns.map(t => [t.date, t.type, t.category, t.amount.toString(), t.note ?? ""]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transactions.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-md border px-3 py-2 text-sm text-muted-foreground bg-primary/5 dark:bg-primary/10"
      >
        Add, manage, and export your transactions with monthly summaries.
      </motion.div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Transactions</h3>
          <p className="text-sm text-muted-foreground">Core ledger with filters and exports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Income (mo.)</CardDescription></CardHeader><CardContent className="text-xl font-bold">${income.toFixed(2)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Expense (mo.)</CardDescription></CardHeader><CardContent className="text-xl font-bold">${expense.toFixed(2)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Net (mo.)</CardDescription></CardHeader><CardContent className="text-xl font-bold">${(income - expense).toFixed(2)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Count</CardDescription></CardHeader><CardContent className="text-xl font-bold">{txns.length}</CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ledger</CardTitle>
          <CardDescription>Recent activity</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell className="capitalize">{t.type}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell className="text-right">${t.amount.toFixed(2)}</TableCell>
                  <TableCell className="max-w-[240px] truncate">{t.note}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => removeTxn(t.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {txns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No transactions yet. Click "Add" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Date</label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Type</label>
                <Select value={type} onValueChange={(v: TxnType) => setType(v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <Input placeholder="e.g., Salary, Rent, Groceries" value={category} onChange={e => setCategory(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amount</label>
              <Input type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Note (optional)</label>
              <Input placeholder="Short note" value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={addTxn}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportsTab() {
  const items = [
    { title: "Balance Sheet", desc: "Assets vs. Liabilities snapshot" },
    { title: "Income Statement / P&L", desc: "Revenues and expenses over a period" },
    { title: "Cash Flow Statement", desc: "Operating, Investing, Financing" },
    { title: "Leverage & Ratios", desc: "Debt/Equity, Liquidity, Profitability" },
    { title: "Forecasts & Scenarios", desc: "What-if simulations and projections" },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-2 rounded-md border px-3 py-2 text-sm text-muted-foreground bg-primary/5 dark:bg-primary/10"
      >
        Generate financial statements and analyses to understand performance and plan ahead.
      </motion.div>

      {items.map((it) => (
        <Card key={it.title}>
          <CardHeader>
            <CardTitle>{it.title}</CardTitle>
            <CardDescription>{it.desc}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Button onClick={() => toast(`${it.title}: Generated sample`)}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Sample
            </Button>
            <Button variant="outline" onClick={() => toast(`${it.title}: Exported PDF`)}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InvestmentsTab() {
  const portfolios = [
    { label: "Stocks", value: "$5,200", tip: "Consider rebalancing — tech overweight" },
    { label: "Mutual Funds", value: "$1,300", tip: "SIP on track. Review yearly." },
    { label: "Crypto", value: "$600", tip: "High volatility — cap at 5–10%." },
    { label: "Fixed Deposit", value: "$300", tip: "Ladder FDs for liquidity." },
    { label: "Real Estate", value: "$100", tip: "Monitoring opportunity." },
  ] as const;

  const goals = [
    { label: "Emergency Fund", progress: "70%", tip: "3 months left at current savings rate" },
    { label: "Retirement", progress: "22%", tip: "Increase SIP by $150/mo to reach target" },
    { label: "Home Down Payment", progress: "15%", tip: "Automate monthly transfers" },
  ] as const;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2 rounded-md border px-3 py-2 text-sm text-muted-foreground bg-primary/5 dark:bg-primary/10"
      >
        Track allocations and goal progress with quick AI suggestions for next steps.
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
          <CardDescription>Allocation snapshot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {portfolios.map(p => (
            <div key={p.label} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <div className="font-medium">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.tip}</div>
              </div>
              <div className="font-semibold">{p.value}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goals</CardTitle>
          <CardDescription>Tracking progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {goals.map(g => (
            <div key={g.label} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{g.label}</div>
                <div className="text-sm">{g.progress}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{g.tip}</div>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Button onClick={() => toast("AI Suggestion: Increase SIP by $100/mo")}>
              <Target className="mr-2 h-4 w-4" />
              AI Suggestion
            </Button>
            <Button variant="outline" onClick={() => toast("Alert created for price target")}>
              <Bell className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LearningTab() {
  const items = [
    { title: "AI Finance Tutor", desc: "Interactive lessons and FAQs", icon: GraduationCap },
    { title: "Daily Market News", desc: "AI summaries of important events", icon: BookOpenCheck },
    { title: "Quizzes & Badges", desc: "Gamified learning & rewards", icon: Target },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-3 rounded-md border px-3 py-2 text-sm text-muted-foreground bg-primary/5 dark:bg-primary/10"
      >
        Learn finance concepts in plain language with quick lessons and news summaries.
      </motion.div>

      {items.map((it) => (
        <Card key={it.title} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md border bg-card">
                <it.icon className="h-4 w-4" />
              </div>
              <CardTitle>{it.title}</CardTitle>
            </div>
            <CardDescription>{it.desc}</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button variant="outline" onClick={() => toast(`${it.title}: Coming soon`)}>
              Learn More
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}