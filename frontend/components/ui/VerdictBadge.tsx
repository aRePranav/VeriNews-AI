"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerdictBadge({ label }: { label: "FAKE" | "REAL" }) {
  const isFake = label === "FAKE";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5",
        isFake
          ? "border-verdict-fake/30 bg-verdict-fakeSoft text-verdict-fake"
          : "border-verdict-real/30 bg-verdict-realSoft text-verdict-real"
      )}
    >
      {isFake ? (
        <AlertTriangle className="h-5 w-5" strokeWidth={2.25} />
      ) : (
        <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
      )}
      <span className="font-mono text-lg font-bold tracking-wide">{label}</span>
    </motion.div>
  );
}
