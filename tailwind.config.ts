import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07111F",
        mist: "#EEF4FF",
        sky: "#6AA8FF",
        mint: "#74E7C3",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(47, 109, 246, 0.18)",
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
