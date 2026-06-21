"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getStats, getHistory } from "@/lib/api";
import type { StatsResponse, HistoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LiveStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    let active = true;

    const poll = () => {
      Promise.all([getStats(), getHistory(6)])
        .then(([s, h]) => {
          if (!active) return;
          setStats(s);
          setHistory(h);
          setConnected(true);
        })
        .catch(() => active && setConnected(false));
    };

    poll();
    const interval = setInterval(poll, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const total = stats?.total_predictions ?? 0;
  const fakePct = stats?.fake_pct ?? 0;
  const realPct = stats?.real_pct ?? 0;

  return (
    <section className="border-b border-border py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Live database"
            title="Every prediction, persisted"
            description="This isn't decorative — each request to /predict writes a real row to the database. These numbers update as people use the demo."
          />
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px]",
              connected
                ? "border-verdict-real/25 bg-verdict-realSoft text-verdict-real"
                : "border-border text-ink-faint"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                connected ? "animate-pulseSoft bg-verdict-real" : "bg-ink-faint"
              )}
            />
            {connected ? "live" : "offline"}
          </span>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-border bg-bg-surface p-8 lg:col-span-2"
          >
            <p className="font-mono text-5xl font-semibold tabular-nums text-ink">
              {total.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-ink-muted">total predictions made</p>

            <div className="mt-8">
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${realPct}%` }}
                  viewport={{ once: true }}
                  className="bg-verdict-real"
                />
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${fakePct}%` }}
                  viewport={{ once: true }}
                  className="bg-verdict-fake"
                />
              </div>
              <div className="mt-3 flex justify-between font-mono text-xs">
                <span className="text-verdict-real">{realPct}% real</span>
                <span className="text-verdict-fake">{fakePct}% fake</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="rounded-xl border border-border bg-bg-surface p-6 lg:col-span-3"
          >
            <div className="mb-4 flex items-center gap-2 text-ink-muted">
              <Activity className="h-4 w-4" />
              <p className="text-sm font-semibold text-ink">Recent activity</p>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {history.length === 0 && (
                <p className="py-4 text-xs text-ink-faint">
                  No predictions yet — be the first to try the live demo above.
                </p>
              )}
              {history.map((h) => (
                <div key={h.request_id} className="flex items-center gap-3 py-3">
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold",
                      h.label === "FAKE"
                        ? "border-verdict-fake/25 bg-verdict-fakeSoft text-verdict-fake"
                        : "border-verdict-real/25 bg-verdict-realSoft text-verdict-real"
                    )}
                  >
                    {h.label}
                  </span>
                  <p className="flex-1 truncate text-xs text-ink-muted">
                    {h.input_preview}
                  </p>
                  <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                    {h.confidence.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
