import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0f1115",
        panel: "#171a21",
        accent: "#7c9eff",
      },
    },
  },
  plugins: [],
};

export default config;
