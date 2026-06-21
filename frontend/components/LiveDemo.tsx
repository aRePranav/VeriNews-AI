"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ScanLine, Volume2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { ConfidenceRing } from "@/components/ui/ConfidenceRing";
import { WordChip } from "@/components/ui/WordChip";
import { usePredict } from "@/lib/usePredict";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  {
    label: "WHO measles report",
    kind: "real" as const,
    text: "GENEVA (Reuters) - The World Health Organization said on Wednesday that global vaccination rates for measles have stabilized after several years of decline, though officials cautioned that coverage remains below the threshold needed to prevent outbreaks in several regions. The agency's report, compiled from data submitted by 194 member states, found that roughly 83 percent of children worldwide received their first dose of the measles vaccine in the past year. Officials said funding gaps in lower income countries continue to pose the biggest obstacle to closing the immunity gap. The findings were presented at a briefing in Geneva ahead of next month's World Health Assembly.",
  },
  {
    label: "Fed rate decision",
    kind: "real" as const,
    text: "WASHINGTON (Reuters) - The Federal Reserve held interest rates steady on Wednesday, extending a pause that began earlier this year as policymakers wait for clearer signals on inflation and the labor market. In a statement, the central bank said recent data showed economic activity continuing at a moderate pace, while job growth had slowed somewhat from earlier in the year. Officials reiterated they would adjust policy as needed based on incoming data, declining to commit to a timeline for further rate cuts. Markets had largely priced in the decision, with major indexes closing roughly flat for the day.",
  },
  {
    label: "Miracle cure memo",
    kind: "fake" as const,
    text: "BREAKING: Doctors do not want you to know this ONE simple trick that cures every disease overnight! A leaked internal memo allegedly shows that major pharmaceutical companies have been hiding a miracle cure for decades to protect their profits. Insiders say the cover up goes all the way to the top of government health agencies. Share this NOW before they take it down and silence the truth forever! Wake up people, the mainstream media will NEVER report this!",
  },
  {
    label: "Moon landing 'leak'",
    kind: "fake" as const,
    text: "SHOCKING: Secret documents EXPOSE that the moon landing footage was staged in a hidden studio, according to an anonymous whistleblower. The bombshell claims, which have spread rapidly online, allege that government officials orchestrated a decades long cover up to hide the truth from the public. Critics call the claims baseless, but believers insist this is the proof we have been waiting for. Is this finally the truth coming out? You decide.",
  },
];

export function LiveDemo() {
  const [text, setText] = useState("");
  const { loading, result, error, run } = usePredict();
  const { push } = useToast();
  const [muted, setMuted] = useState(true);

  const handleAnalyze = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      push("Please enter some text to analyze.", "error");
      return;
    }
    if (trimmed.length > 20000) {
      push("That's a lot of text — try trimming it under 20,000 characters.", "error");
      return;
    }
    try {
      const res = await run(trimmed);
      if (res.warning) push(res.warning, "info");
    } catch {
      push(error || "Couldn't reach the analysis service.", "error");
    }
  };

  const loadExample = (exampleText: string) => {
    setText(exampleText);
  };

  const readAloud = () => {
    if (!result || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(
      `This article is classified as ${result.label} with ${result.confidence.toFixed(1)} percent confidence.`
    );
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section id="live-demo" className="border-b border-border py-28">
      <Container>
        <SectionHeading
          eyebrow="Live demo"
          title="Paste anything. Get a verdict, not a guess."
          description="Runs the real TF-IDF + Passive Aggressive Classifier pipeline trained on 72,134 articles — every request hits the live model, no pre-baked responses."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-bg-surface p-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a news headline or full article..."
                rows={10}
                className="w-full resize-none rounded-lg bg-transparent text-sm leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
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
                      Scanning
                    </>
                  ) : (
                    <>
                      <ScanLine className="h-4 w-4" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-faint">
                Try an example
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => loadExample(ex.text)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition hover:border-border-strong hover:bg-white/5",
                      "border-border text-ink-muted"
                    )}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="relative min-h-[420px] rounded-xl border border-border bg-bg-surface p-6 md:p-8">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-xl"
                  >
                    <div className="bg-grid-pattern absolute inset-0 opacity-30" />
                    <div className="relative h-1 w-2/3 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-ink to-transparent"
                        animate={{ left: ["-33%", "100%"] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                    <p className="font-mono text-xs text-ink-faint">
                      vectorizing → classifying → explaining
                    </p>
                  </motion.div>
                )}

                {!loading && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <VerdictBadge label={result.label} />
                      <button
                        onClick={readAloud}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-ink-muted transition hover:border-border-strong hover:text-ink"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        Read result aloud
                      </button>
                    </div>

                    {result.warning && (
                      <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-xs text-amber-200/90">
                        {result.warning}
                      </div>
                    )}

                    <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                      <ConfidenceRing confidence={result.confidence} variant={result.label === "FAKE" ? "fake" : "real"} />
                      <p className="flex-1 text-sm leading-relaxed text-ink-muted">
                        {result.explanation}
                      </p>
                    </div>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-verdict-fake">
                          Words pushing toward FAKE
                        </p>
                        <div className="flex flex-col gap-2">
                          {result.top_fake_words.length === 0 && (
                            <p className="text-xs text-ink-faint">No strong fake-leaning terms found.</p>
                          )}
                          {result.top_fake_words.map((w, i) => (
                            <WordChip key={w.word + i} word={w.word} weight={w.weight} variant="fake" index={i} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-verdict-real">
                          Words pushing toward REAL
                        </p>
                        <div className="flex flex-col gap-2">
                          {result.top_real_words.length === 0 && (
                            <p className="text-xs text-ink-faint">No strong real-leaning terms found.</p>
                          )}
                          {result.top_real_words.map((w, i) => (
                            <WordChip key={w.word + i} word={w.word} weight={w.weight} variant="real" index={i} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-6 border-t border-border pt-4 font-mono text-[11px] text-ink-faint">
                      <span>{result.word_count} words analyzed</span>
                      <span>{result.matched_vocabulary_terms} vocabulary matches</span>
                    </div>
                  </motion.div>
                )}

                {!loading && !result && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 text-center"
                  >
                    <ScanLine className="h-8 w-8 text-ink-faint" />
                    <p className="max-w-xs text-sm text-ink-faint">
                      Paste an article or pick an example to see a verdict with full word-level reasoning.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
