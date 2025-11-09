/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "accent-blue": "#2563EB",
        "accent-purple": "#7C3AED",
        "accent-orange": "#FB923C",
        "accent-green": "#22C55E",
        slate: {
          950: "#0f172a",
          900: "#111827",
          800: "#1f2937",
          700: "#334155",
          600: "#475569",
          500: "#64748b"
        }
      },
      fontFamily: {
        display: ["Inter", "System", "sans-serif"],
        body: ["GeneralSans", "System", "sans-serif"]
      },
      borderRadius: {
        "3xl": "1.75rem"
      },
      boxShadow: {
        glow: "0 10px 40px rgba(124, 58, 237, 0.25)"
      }
    }
  },
  plugins: []
};

