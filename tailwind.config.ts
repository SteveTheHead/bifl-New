import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class", ".dark"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-score-elite',
    'bg-score-excellent',
    'bg-score-good',
    'bg-score-fair',
    'bg-score-poor'
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // BIFL Brand Colors
        "brand-cream": "#F9F8F6",
        "brand-teal": "#4A9D93",
        "brand-dark": "#2C3539",
        "brand-gray": "#6B7280",
        "score-green": "#4CAF50",
        "score-yellow": "#FFC107",
        "score-red": "#F44336",

        // Keep existing shadcn colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#4A9D93", // Use brand-teal
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Chart colors
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      backgroundImage: {
        "score-elite": "linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #81C784 100%)",
        "score-excellent": "linear-gradient(135deg, #FFC107 0%, #FFD54F 50%, #FFE082 100%)",
        "score-good": "linear-gradient(135deg, #FF9800 0%, #FFB74D 50%, #FFCC02 100%)",
        "score-fair": "linear-gradient(135deg, #F44336 0%, #EF5350 50%, #E57373 100%)",
        "score-poor": "linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 50%, #E0E0E0 100%)",
      },
      boxShadow: {
        "score-green-glow": "0 0 15px rgba(76, 175, 80, 0.5)",
        "score-yellow-glow": "0 0 15px rgba(255, 193, 7, 0.5)",
        "score-red-glow": "0 0 15px rgba(244, 67, 54, 0.5)",
        "teal-glow": "0 0 15px rgba(74, 157, 147, 0.5)",
        "yellow-glow": "0 0 15px rgba(255, 193, 7, 0.5)",
        "red-glow": "0 0 15px rgba(244, 67, 54, 0.5)",
        "score-pill": "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        serif: ["Merriweather", "serif"],
        sans: ["Lato", "sans-serif"],
      },
    },
  },
  // plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
