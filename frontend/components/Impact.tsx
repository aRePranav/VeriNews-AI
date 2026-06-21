"use client";

import { motion } from "framer-motion";
import {
  Newspaper,
  Share2,
  Chrome,
  GraduationCap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const USE_CASES = [
  {
    icon: Share2,
    title: "Social media platforms",
    description: "A first-pass filter that flags likely misinformation for human review before it spreads.",
  },
  {
    icon: Newspaper,
    title: "Newsrooms",
    description: "A sanity check on wire copy and reader submissions before publication.",
  },
  {
    icon: Chrome,
    title: "Browser extensions",
    description: "Inline credibility signals while reading, without leaving the page.",
  },
  {
    icon: GraduationCap,
    title: "Academic research",
    description: "A reproducible classical-ML baseline for misinformation detection studies.",
  },
];

const LIMITATIONS = [
  "Trained on English-language text only — performance on other languages is unverified.",
  "The training data skews toward wire-service real news, so writing style as much as factual accuracy can influence the verdict.",
  "Short, headline-only input is meaningfully less reliable, since the model was trained on full articles. The UI flags this automatically.",
  "A fine-tuned transformer (e.g. BERT) would likely push accuracy higher, at the cost of interpretability and the sub-50ms inference this demo relies on — a deliberate trade-off, not an oversight.",
];

export function Impact() {
  return (
    <section className="border-b border-border py-28">
      <Container>
        <SectionHeading
          eyebrow="Why this exists"
          title="Misinformation has real, measurable costs"
          description="Fabricated health claims have driven people toward unproven treatments. Coordinated false stories have moved markets before being corrected. Manipulated narratives have shaped how people vote. None of that requires a black box to fight — it requires a fast, explainable first pass."
        />

        <div className="mt-14">
          <p className="mb-6 font-mono text-xs uppercase tracking-wider text-ink-faint">
            Where this fits
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <motion.div
                  key={uc.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-xl border border-border bg-bg-surface p-5"
                >
                  <Icon className="mb-4 h-5 w-5 text-ink-muted" strokeWidth={1.75} />
                  <h3 className="text-sm font-semibold text-ink">{uc.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                    {uc.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 rounded-xl border border-border bg-bg-surface p-6 md:p-8"
        >
          <p className="mb-5 font-mono text-xs uppercase tracking-wider text-ink-faint">
            Limitations &amp; future work
          </p>
          <ul className="grid gap-3 md:grid-cols-2">
            {LIMITATIONS.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-ink-muted"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </Container>
    </section>
  );
}
