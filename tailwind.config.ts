import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sup: {
          teal: "#008080",
          sand: "#F5F5DC",
          orange: "#FF8C00",
          dark: "#1A202C",
          "teal-50": "#E6F2F2",
          "teal-100": "#BFDEDE",
          "teal-200": "#80BDBD",
          "teal-300": "#339999",
          "teal-500": "#006B6B",
          "teal-600": "#005757",
          "teal-700": "#003E3E",
          "sand-50": "#FBFAF1",
          "sand-100": "#F5F5DC",
          "sand-200": "#ECE9C6",
          "sand-300": "#DDD7A6",
          "orange-50": "#FFF4E5",
          "orange-100": "#FFE0B3",
          "orange-500": "#E27800",
          "orange-600": "#B85F00",
          "orange-700": "#8A4700",
          "slate-100": "#EDEFF3",
          "slate-200": "#D9DDE4",
          "slate-300": "#B3BAC6",
          "slate-400": "#6C7382",
          "slate-500": "#4B5260",
          "slate-600": "#2E3543",
        },
      },
      fontFamily: {
        kanit: ["var(--font-kanit)", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-orange": "0 10px 28px rgba(255,140,0,0.40)",
        "glow-teal": "0 10px 28px rgba(0,128,128,0.35)",
        "sup-sm": "0 1px 2px rgba(0,80,80,0.06),0 1px 1px rgba(0,80,80,0.04)",
        "sup-md": "0 4px 12px rgba(0,80,80,0.08),0 2px 4px rgba(0,80,80,0.04)",
        "sup-lg": "0 12px 28px rgba(0,80,80,0.14),0 4px 10px rgba(0,80,80,0.06)",
        "sup-xl": "0 24px 48px rgba(0,80,80,0.18),0 8px 18px rgba(0,80,80,0.08)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0)" },
          "70%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        pop: "pop 480ms cubic-bezier(0.34,1.56,0.64,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
