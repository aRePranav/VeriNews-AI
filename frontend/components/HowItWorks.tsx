"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Eraser,
  Hash,
  Cpu,
  Eye,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    icon: FileText,
    title: "Raw text",
    description: "You paste a headline or article. No formatting required.",
  },
  {
    icon: Eraser,
    title: "Preprocessing",
    description: "Lowercased, links and HTML stripped, filler words removed, words reduced to their root form.",
  },
  {
    icon: Hash,
    title: "TF-IDF vectorization",
    description: "Text becomes 50,000 numeric features capturing which words and word-pairs matter most.",
  },
  {
    icon: Cpu,
    title: "Classification",
    description: "A Passive Aggressive Classifier, trained on 72,134 labeled articles, scores the vector.",
  },
  {
    icon: Eye,
    title: "Explainability",
    description: "Each word's contribution to the score is extracted and ranked, in both directions.",
  },
  {
    icon: CheckCircle2,
    title: "Result",
    description: "A verdict, a calibrated confidence percentage, and the evidence behind it — all under 50ms.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border py-28">
      <Container>
        <SectionHeading
          eyebrow="Under the hood"
          title="Six steps, fully transparent"
          description="No part of this pipeline is hidden. Here's exactly what happens between you hitting Analyze and seeing a verdict."
        />

        <div className="mt-16 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group relative flex flex-col gap-3 rounded-xl border border-border bg-bg-surface p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-4 w-4 text-ink-faint transition group-hover:text-ink" />
                </div>
                <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                <p className="text-xs leading-relaxed text-ink-muted">
                  {step.description}
                </p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-2.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-ink-faint/40 lg:block" />
                )}
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
