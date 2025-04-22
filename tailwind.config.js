/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "card-background": "var(--card-background)",
        "card-border": "var(--card-border)",
        "button-background": "var(--button-background)",
        "button-hover": "var(--button-hover)",
        "button-text": "var(--button-text)",
        "header-background": "var(--header-background)",
        "header-border": "var(--header-border)",
        "input-background": "var(--input-background)",
        "input-border": "var(--input-border)",
        "input-focus-border": "var(--input-focus-border)",
        "text-light": "var(--text-light)",
        "text-lighter": "var(--text-lighter)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      transitionProperty: {
        'colors': 'background-color, border-color, color, fill, stroke',
      },
    },
  },
  plugins: [],
}; 