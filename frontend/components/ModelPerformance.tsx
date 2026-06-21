"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getModelMetrics } from "@/lib/api";
import type { ModelMetrics } from "@/lib/types";

const MODEL_LABELS: Record<string, string> = {
  passive_aggressive: "Passive Aggressive",
  linear_svc: "Linear SVC",
  logistic_regression: "Logistic Regression",
  naive_bayes: "Naive Bayes",
};

const STAT_FALLBACK = {
  total_articles: 72134,
  accuracy: 96.7,
};

export function ModelPerformance() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getModelMetrics()
      .then(setMetrics)
      .catch(() => setLoadError(true));
  }, []);

  const chartData = metrics
    ? Object.entries(metrics.models).map(([key, m]) => ({
        name: MODEL_LABELS[key] || key,
        Accuracy: m.accuracy,
        Precision: m.precision,
        Recall: m.recall,
        F1: m.f1,
        "ROC-AUC": Math.round(m.roc_auc * 1000) / 10,
      }))
    : [];

  const production = metrics?.models[metrics.production_model];
  const cm = production?.confusion_matrix; // [[TN, FP], [FN, TP]]

  const stats = [
    {
      label: "Articles trained on",
      value: metrics?.dataset.total_articles?.toLocaleString() ?? STAT_FALLBACK.total_articles.toLocaleString(),
    },
    {
      label: "Production accuracy",
      value: `${metrics?.production_model_calibrated_accuracy ?? STAT_FALLBACK.accuracy}%`,
    },
    { label: "Models compared", value: "4" },
    { label: "Inference time", value: "<50ms" },
  ];

  return (
    <section className="border-b border-border py-28">
      <Container>
        <SectionHeading
          eyebrow="Model performance"
          title="Four models, evaluated head to head"
          description="Passive Aggressive Classifier was selected for production after comparison against Linear SVC, Logistic Regression, and Naive Bayes on a held-out 20% test split."
        />

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-border bg-bg-surface p-5"
            >
              <p className="font-mono text-2xl font-semibold tabular-nums text-ink md:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-border bg-bg-surface p-6 lg:col-span-3"
          >
            <h3 className="mb-1 text-sm font-semibold text-ink">Metric comparison</h3>
            <p className="mb-6 text-xs text-ink-faint">All values on held-out test set (%)</p>
            {loadError && (
              <p className="text-xs text-ink-faint">
                Couldn't load live metrics — make sure the backend is running.
              </p>
            )}
            {!loadError && (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#A1A1A1", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[80, 100]}
                      tick={{ fill: "#A1A1A1", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#161616",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "#FAFAFA" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#A1A1A1" }} />
                    <Bar dataKey="Accuracy" fill="#FAFAFA" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Precision" fill="#A1A1A1" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Recall" fill="#6B6B6B" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="F1" fill="#1E8449" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-bg-surface p-6 lg:col-span-2"
          >
            <h3 className="mb-1 text-sm font-semibold text-ink">
              Confusion matrix
            </h3>
            <p className="mb-6 text-xs text-ink-faint">
              Production model · {MODEL_LABELS[metrics?.production_model || "passive_aggressive"]}
            </p>
            {cm ? (
              <div className="grid grid-cols-2 gap-2">
                <CmCell label="True Real" value={cm[0][0]} tone="real" />
                <CmCell label="False Fake" value={cm[0][1]} tone="muted" />
                <CmCell label="False Real" value={cm[1][0]} tone="muted" />
                <CmCell label="True Fake" value={cm[1][1]} tone="fake" />
              </div>
            ) : (
              <p className="text-xs text-ink-faint">Loading…</p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2 text-center font-mono text-[10px] text-ink-faint">
              <span>Predicted Real</span>
              <span>Predicted Fake</span>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function CmCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "real" | "fake" | "muted";
}) {
  const toneClass =
    tone === "real"
      ? "border-verdict-real/25 bg-verdict-realSoft text-verdict-real"
      : tone === "fake"
      ? "border-verdict-fake/25 bg-verdict-fakeSoft text-verdict-fake"
      : "border-border bg-white/[0.03] text-ink-muted";
  return (
    <div className={`rounded-lg border p-4 text-center ${toneClass}`}>
      <p className="font-mono text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-1 text-[11px] text-ink-faint">{label}</p>
    </div>
  );
}
