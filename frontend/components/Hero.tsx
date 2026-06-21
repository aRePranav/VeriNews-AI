"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { usePredict } from "@/lib/usePredict";
import { useToast } from "@/components/ui/Toast";

export function Hero() {
  const [text, setText] = useState("");
  const { loading, result, error, run } = usePredict();
  const { push } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      push("Please enter some text to analyze.", "error");
      return;
    }
    try {
      await run(text);
    } catch {
      push(error || "Something went wrong. Try again.", "error");
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border pb-28 pt-36 md:pt-44">
      <div
        aria-hidden
        className="bg-grid-pattern pointer-events-none absolute inset-0 animate-drift opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-white/[0.04] to-transparent"
      />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-bg-surface px-3.5 py-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-ink-faint" />
          <span className="font-mono text-xs text-ink-muted">
            Built during the Intrainz AI internship
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-balance max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-7xl"
        >
          Every verdict,
          <br />
          explained. <span className="text-ink-muted">Every time.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted"
        >
          VeriNews AI reads a headline or article and tells you whether it's
          fake or real in milliseconds — with the exact words that drove the
          decision, not a black box.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-10 max-w-2xl rounded-xl border border-border bg-bg-surface/80 p-2 backdrop-blur"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a headline or article here, try: 'Scientists confirm coffee cures all known diseases overnight'"
            rows={3}
            className="w-full resize-none rounded-lg bg-transparent px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <div className="flex items-center justify-between px-2 pb-1 pt-1">
            <span className="font-mono text-xs text-ink-faint">
              {text.trim() ? text.trim().split(/\s+/).length : 0} words
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-bg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex max-w-2xl flex-wrap items-center gap-4 rounded-xl border border-border bg-bg-surface/60 px-5 py-4"
          >
            <VerdictBadge label={result.label} />
            <span className="font-mono text-sm text-ink-muted">
              {result.confidence.toFixed(1)}% confidence
            </span>
            <span className="text-sm text-ink-faint">
              Full breakdown in the live demo below ↓
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-3 font-mono text-xs text-ink-faint"
        >
          <span>96.7% accuracy</span>
          <span className="h-1 w-1 rounded-full bg-ink-faint" />
          <span>72,134 articles trained</span>
          <span className="h-1 w-1 rounded-full bg-ink-faint" />
          <span>Under 50ms inference</span>
        </motion.div>
      </Container>
    </section>
  );
}
