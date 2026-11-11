/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1320px" },
    },
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        navy: "#10172A",
        cobalt: "#4263EB",
        indigo: "#7057F5",
        cyan: "#20BCE5",
        emerald: "#12A875",
        amber: "#F5A623",
        canvas: "#F5F7FC",
        "canvas-alt": "#EDF0F6",
        ink: "#141B2D",
        "ink-muted": "#68738A",
        hairline: "#E4E9F2",
        success: {
          DEFAULT: "#12A875",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F5A623",
          foreground: "#141B2D",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        surface: "0 1px 2px rgba(16, 23, 42, 0.04)",
        elevated: "0 10px 28px -6px rgba(16, 23, 42, 0.08), 0 2px 6px rgba(16, 23, 42, 0.04)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.7)",
      },
      fontFamily: {
        display: ["Manrope", "Space Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
