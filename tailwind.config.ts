import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        "surface-tile": "var(--surface-tile)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-muted": "var(--ink-muted)",
        line: "var(--line)",
        action: "var(--action)",
        "action-hover": "var(--action-hover)",
        "on-action": "var(--on-action)",
        "drop-ground": "var(--drop-ground)",
        "on-drop-ground": "var(--on-drop-ground)",
        sale: "var(--sale)",
        accent: "var(--accent)",
        "on-accent": "var(--on-accent)",
        focus: "var(--focus)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
      boxShadow: {
        float: "var(--shadow-float)",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".px-gutter": {
          paddingLeft: "var(--gutter)",
          paddingRight: "var(--gutter-r)",
        },
        ".pl-gutter": {
          paddingLeft: "var(--gutter)",
        },
        ".pr-gutter": {
          paddingRight: "var(--gutter-r)",
        },
      });
    }),
  ],
};

export default config;
