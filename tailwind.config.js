/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F766E", // Teal 700
          hover: "#0D665F",
          light: "#F0FDFA",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#059669", // Emerald 600
          hover: "#047857",
          light: "#ECFDF5",
          foreground: "#FFFFFF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
        },
        background: "#F8FAFC",
        income: {
          DEFAULT: "#16A34A", // Green 600
          light: "#F0FDF4",
          border: "#BBF7D0",
          foreground: "#15803D",
        },
        expense: {
          DEFAULT: "#DC2626", // Red 600
          light: "#FEF2F2",
          border: "#FECACA",
          foreground: "#B91C1C",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FFFBEB",
          foreground: "#B45309",
        },
        info: {
          DEFAULT: "#2563EB",
          light: "#EFF6FF",
          foreground: "#1D4ED8",
        },
        border: "#E2E8F0",
        slate: {
          900: "#0F172A",
          500: "#64748B",
        }
      },
      borderRadius: {
        card: "12px",
        btn: "10px",
        input: "10px",
        modal: "16px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
