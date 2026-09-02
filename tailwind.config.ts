import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0a0d14",
        panel: "#12161f",
        accent: "#7c9eff",
        glow: "#4fc3ff",
        amber: "#ff9d3d",
      },
    },
  },
  plugins: [],
};

export default config;
