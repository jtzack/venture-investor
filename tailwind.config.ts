import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0a0e14",
        panel: "#11161f",
        panel2: "#161d28",
        edge: "#232c3a",
        muted: "#7e8aa0",
        accent: "#4ade80",
        accent2: "#38bdf8",
        warn: "#fbbf24",
        bad: "#f87171",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
