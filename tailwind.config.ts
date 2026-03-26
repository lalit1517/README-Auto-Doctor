import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#07070E",
        surface: "#0E0E1A",
        elevated: "#15152A",
        "border-subtle": "#1E1E35",
        "border-default": "#2A2A48",
        "fg-primary": "#F2F2FF",
        "fg-secondary": "#9B9BB8",
        "fg-muted": "#5C5C7B",
        brand: {
          violet: "#7C6FE0",
          blue: "#4F8EF7",
          cyan: "#2ECAD9",
        },
        // Legacy tokens kept for any remaining references
        ink: "#07070E",
        mist: "#EEF4FF",
        sky: "#6AA8FF",
        mint: "#74E7C3",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 60px rgba(124, 111, 224, 0.25)",
        "glow-cyan": "0 0 60px rgba(46, 202, 217, 0.15)",
        "glow-sm": "0 0 30px rgba(124, 111, 224, 0.15)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 48px rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #7C6FE0 0%, #4F8EF7 50%, #2ECAD9 100%)",
        "gradient-brand-subtle":
          "linear-gradient(135deg, rgba(124,111,224,0.15) 0%, rgba(79,142,247,0.15) 100%)",
        "gradient-text":
          "linear-gradient(90deg, #7C6FE0, #4F8EF7, #2ECAD9)",
        "gradient-card":
          "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        grid: "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
