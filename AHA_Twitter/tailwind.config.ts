import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aha: {
          bg: "#060b14",
          surface: "#0c1423",
          accent: "#2ee58b",
          text: "#dce8ff",
          muted: "#8ea3c4"
        }
      }
    },
  },
  plugins: [],
};

export default config;
