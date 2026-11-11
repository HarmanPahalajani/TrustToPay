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
          DEFAULT: "#4263EB",
          hover: "#3451D1",
          soft: "#EDF2FF",
        },
        indigo: {
          DEFAULT: "#7057F5",
        },
        cyan: {
          DEFAULT: "#20BCE5",
        },
        emerald: {
          DEFAULT: "#12A875",
        },
        amber: {
          DEFAULT: "#F5A623",
        },
        canvas: {
          DEFAULT: "#F5F7FC",
          alt: "#EDF0F6",
        },
        ink: {
          DEFAULT: "#141B2D",
          body: "#4E596E",
          muted: "#68738A",
        },
        hairline: "#E4E9F2",
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
