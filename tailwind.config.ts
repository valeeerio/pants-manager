import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.08)",
        premium: "0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.05), 0 0 0 1px rgba(15,23,42,0.03)",
        "premium-hover": "0 2px 4px rgba(15,23,42,0.04), 0 10px 28px rgba(15,23,42,0.09), 0 0 0 1px rgba(15,23,42,0.04)",
        "amber-glow": "0 0 0 1px rgba(180,83,9,0.15), 0 4px 16px rgba(180,83,9,0.18), 0 1px 3px rgba(180,83,9,0.12)",
        "inner-top": "inset 0 1px 0 rgba(255,255,255,0.1)"
      },
      backgroundImage: {
        "gradient-amber": "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
        "gradient-card": "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
        "gradient-sidebar-active": "linear-gradient(90deg, rgba(180,83,9,0.92) 0%, rgba(180,83,9,0.72) 100%)"
      },
      animation: {
        "fade-in-up": "fadeInUp 0.28s ease-out both",
        "fade-in": "fadeIn 0.2s ease-out both",
        "scale-in": "scaleIn 0.2s ease-out both",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite"
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        "pulse-dot": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.8" }
        }
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
