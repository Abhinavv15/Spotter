/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.12)",
        ring: "#00D4C7",
        background: "#0B1020", // Midnight Ink
        foreground: "#E8F1F2", // Ice
        primary: {
          DEFAULT: "#00D4C7", // Electric Teal
          foreground: "#0B1020",
          glow: "rgba(0, 212, 199, 0.35)",
        },
        secondary: {
          DEFAULT: "#A78BFA", // Soft Lavender
          foreground: "#0B1020",
        },
        destructive: {
          DEFAULT: "#F43F5E", // Rose / Violation
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#161F38", // Card Dark
          foreground: "#94A3B8", // Slate Light
        },
        accent: {
          DEFAULT: "#F4B860", // Warm Amber
          foreground: "#0B1020",
        },
        success: {
          DEFAULT: "#7FE7D5", // Muted Mint
          foreground: "#0B1020",
        },
        popover: {
          DEFAULT: "#11182D",
          foreground: "#E8F1F2",
        },
        card: {
          DEFAULT: "#11182D", // Deep Space
          foreground: "#E8F1F2",
          subtle: "#161F38",
        },
        // Dedicated Spotter Palette
        spotter: {
          ink: "#0B1020",
          space: "#11182D",
          panel: "#161F38",
          teal: "#00D4C7",
          mint: "#7FE7D5",
          lavender: "#A78BFA",
          amber: "#F4B860",
          ice: "#E8F1F2",
          slate: "#65738B",
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      boxShadow: {
        'glow-teal': '0 0 20px -3px rgba(0, 212, 199, 0.35)',
        'glow-amber': '0 0 20px -3px rgba(244, 184, 96, 0.35)',
        'glow-lavender': '0 0 20px -3px rgba(167, 139, 250, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.03)" },
        },
        "slide-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "slide-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "accordion-down": "slide-down 0.2s ease-out",
        "accordion-up": "slide-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
