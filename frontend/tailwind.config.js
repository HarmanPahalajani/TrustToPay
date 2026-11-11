/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
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
          foreground: "hsl(var(--primary-foreground))",
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
        navy: {
          DEFAULT: "#10172A",
          surface: "#162038",
          border: "#1E293B",
        },
        cobalt: {
          DEFAULT: "#365FEA",
          hover: "#2B4FC7",
          soft: "#EEF2FE",
        },
        indigo: {
          DEFAULT: "#365FEA",
        },
        cyan: {
          DEFAULT: "#365FEA",
        },
        emerald: {
          DEFAULT: "#438866",
        },
        amber: {
          DEFAULT: "#C97A2E",
        },
        canvas: {
          DEFAULT: "#F7F5EF",
          alt: "#F0EEE7",
        },
        ink: {
          DEFAULT: "#202722",
          body: "#444D47",
          muted: "#69736D",
        },
        hairline: "#E5E1D7",
      },
      fontFamily: {
        display: ["Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        surface: "0 1px 2px rgba(16, 23, 42, 0.04), 0 1px 3px rgba(16, 23, 42, 0.03)",
        elevated: "0 8px 24px -6px rgba(16, 23, 42, 0.08), 0 2px 6px rgba(16, 23, 42, 0.04)",
        inset: "inset 0 1px 2px rgba(16, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
