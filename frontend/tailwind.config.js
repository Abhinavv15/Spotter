/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', '"system-ui"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        border: "rgba(255, 255, 255, 0.09)",
        input: "rgba(255, 255, 255, 0.12)",
        ring: "#8AE922", // Nexterra Vivid Lime
        background: "#090E0B", // Deep Moss Obsidian
        foreground: "#F2F5F3", // Clean Crisp White
        primary: {
          DEFAULT: "#8AE922", // Nexterra Signature Lime
          foreground: "#090E0B",
          glow: "rgba(138, 233, 34, 0.35)",
        },
        secondary: {
          DEFAULT: "#4ADE80", // Organic Green
          foreground: "#090E0B",
        },
        destructive: {
          DEFAULT: "#F43F5E", // Rose Violation
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#121C16", // Moss Dark Panel
          foreground: "#8E9E93",
        },
        accent: {
          DEFAULT: "#FACC15", // Warm Gold
          foreground: "#090E0B",
        },
        success: {
          DEFAULT: "#8AE922", // Lime
          foreground: "#090E0B",
        },
        popover: {
          DEFAULT: "#101913",
          foreground: "#F2F5F3",
        },
        card: {
          DEFAULT: "#101913", // Deep Moss Card
          foreground: "#F2F5F3",
          subtle: "#152219",
          lime: "#8AE922",
        },
        spotter: {
          ink: "#090E0B",
          space: "#0D1510",
          panel: "#101913",
          panelLight: "#16231B",
          lime: "#8AE922",
          limeLight: "#9EF538",
          leaf: "#4ADE80",
          forest: "#062817",
          amber: "#FACC15",
          rose: "#F43F5E",
          ice: "#F2F5F3",
          slate: "#7D8E82",
        }
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        'glow-lime': '0 0 25px -2px rgba(138, 233, 34, 0.4)',
        'glow-leaf': '0 0 25px -2px rgba(74, 222, 128, 0.35)',
        'glass': '0 12px 40px 0 rgba(0, 0, 0, 0.45)',
        'glass-lime': '0 12px 40px 0 rgba(138, 233, 34, 0.12)',
      },
    },
  },
  plugins: [],
}
