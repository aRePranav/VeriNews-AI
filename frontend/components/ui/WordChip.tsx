"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function WordChip({
  word,
  weight,
  variant,
  index = 0,
}: {
  word: string;
  weight: number;
  variant: "fake" | "real";
  index?: number;
}) {
  const isFake = variant === "fake";
  const intensity = Math.max(weight, 12) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col gap-1.5 rounded-md border px-3 py-2",
        isFake
          ? "border-verdict-fake/25 bg-verdict-fakeSoft"
          : "border-verdict-real/25 bg-verdict-realSoft"
      )}
      style={{
        opacity: 0.55 + intensity * 0.45,
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-sm text-ink">{word}</span>
        <span
          className={cn(
            "font-mono text-[10px] tabular-nums",
            isFake ? "text-verdict-fake" : "text-verdict-real"
          )}
        >
          {weight.toFixed(0)}
        </span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${weight}%` }}
          transition={{ delay: index * 0.05 + 0.15, duration: 0.5, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            isFake ? "bg-verdict-fake" : "bg-verdict-real"
          )}
        />
      </div>
    </motion.div>
  );
}
