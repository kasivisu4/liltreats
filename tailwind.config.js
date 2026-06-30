/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6F0",
        pearl: "#F7F2EA",
        blush: "#F2DCE4",
        rose: "#C8788E",
        deep: "#6B2D3E",
        mauve: "#9B5068",
        gold: {
          DEFAULT: "#C4945A",
          light: "#EDD9A8",
          pale: "#F7EDD4",
        },
        lav: {
          DEFAULT: "#E8E0F4",
          deep: "#9880C0",
        },
        sage: {
          DEFAULT: "#D0DEC8",
          deep: "#6A8860",
        },
        ink: {
          DEFAULT: "#3A2228",
          soft: "#8A5868",
          mute: "#B89098",
        },
        line: "rgba(196,148,90,0.18)",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(107,45,62,0.10)",
        glow: "0 4px 16px rgba(196,148,90,0.18)",
      },
      borderRadius: {
        xl2: "20px",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        sparkle: {
          "0%": { opacity: "0", transform: "translateY(0) scale(0.5)" },
          "30%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(-40px) scale(1.2)" },
        },
        recpulse: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(208,64,96,0.4)" },
          "50%": { boxShadow: "0 0 0 6px rgba(208,64,96,0)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        sparkle: "sparkle 3s ease-in-out infinite",
        recpulse: "recpulse 1.4s infinite",
      },
    },
  },
  plugins: [],
};
