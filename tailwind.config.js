/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          900: "#0b0f1a",
          800: "#111827",
          700: "#1f2937"
        }
      },
      boxShadow: {
        glow: "0 0 20px rgba(99, 102, 241, 0.35)",
        neon: "0 0 25px rgba(34, 211, 238, 0.35)"
      },
      backgroundImage: {
        "neon-radial": "radial-gradient(60% 60% at 50% 20%, rgba(99,102,241,0.35) 0%, rgba(0,0,0,0) 60%)",
        "grid": "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(56,189,248,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(99,102,241,0.6)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: 0.5 },
          "50%": { opacity: 0.9 }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 4s ease-in-out infinite",
        pulseSoft: "pulseSoft 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
