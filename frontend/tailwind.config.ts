import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0A0A0A",
          surface: "#111111",
          elevated: "#161616",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.14)",
        },
        ink: {
          DEFAULT: "#FAFAFA",
          muted: "#A1A1A1",
          faint: "#6B6B6B",
        },
        verdict: {
          fake: "#C0392B",
          fakeSoft: "rgba(192,57,43,0.12)",
          real: "#1E8449",
          realSoft: "rgba(30,132,73,0.12)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        scan: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 200%" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        drift: {
          "0%": { transform: "translate(0,0)" },
          "100%": { transform: "translate(-60px,-60px)" },
        },
      },
      animation: {
        scan: "scan 1.6s linear infinite",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
        drift: "drift 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
