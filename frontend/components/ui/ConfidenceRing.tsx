"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ConfidenceRing({
  confidence,
  variant,
  size = 156,
}: {
  confidence: number;
  variant: "fake" | "real";
  size?: number;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;
  const color = variant === "fake" ? "#C0392B" : "#1E8449";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={cn(
            "font-mono text-3xl font-semibold tabular-nums",
            variant === "fake" ? "text-verdict-fake" : "text-verdict-real"
          )}
        >
          {confidence.toFixed(1)}%
        </motion.span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          confidence
        </span>
      </div>
    </div>
  );
}
