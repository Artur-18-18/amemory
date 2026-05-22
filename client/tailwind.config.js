/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: "#050505",
          matte: "#0a0a0b",
          charcoal: "#121214",
          silver: "#a8a8ad",
          purple: "#8b5cf6",
          glow: "#a78bfa",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(139, 92, 246, 0.15)",
        "glow-lg": "0 0 60px rgba(167, 139, 250, 0.25)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        shimmer: "shimmer 2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};
