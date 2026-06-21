import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VeriNews AI — Real-time fake news detection",
  description:
    "Paste any headline or article and get an instant, explainable verdict. Trained on 72,134 labeled news articles. 96.7% accuracy, zero black box.",
  openGraph: {
    title: "VeriNews AI — Real-time fake news detection",
    description:
      "Every verdict, explained. TF-IDF + Passive Aggressive Classifier trained on the WELFake dataset.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
