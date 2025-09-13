import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import "./types/global.d.ts";
import { AnimatePresence, motion } from "framer-motion";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

import Dashboard from "@/pages/Dashboard.tsx";
import ChatPage from "@/pages/Chat.tsx";

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0.6, y: 4, filter: "blur(1px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0.7, y: -4, filter: "blur(1px)" }}
      transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.8 }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

function TopProgress() {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((k) => k + 1);
    setShow(true);
    const t = setTimeout(() => setShow(false), 450); // brief and snappy
    return () => clearTimeout(t);
  }, [location.pathname]);

  if (!show) return null;

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, width: "0%" }}
      animate={{ opacity: 1, width: "100%" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="fixed top-0 left-0 h-0.5 z-[70]"
      style={{
        background:
          "linear-gradient(90deg, var(--primary), color-mix(in oklch, var(--secondary) 60%, transparent))",
      }}
    />
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage redirectAfterAuth="/dashboard" /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/chat" element={<PageTransition><ChatPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <TopProgress />
          <RouteSyncer />
          <AnimatedRoutes />
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);