/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8B0000", // Dunkelrot (Dark Red)
        secondary: "#1A1A1A", // Dunkelgrau (Dark Gray)
        accent: "#FF3333", // Helleres Rot für Akzente
        dark: {
          DEFAULT: "#121212", // Haupthintergrundfarbe (sehr dunkel)
          lighter: "#1E1E1E", // Etwas helleres Schwarz für Karten/Komponenten
          card: "#252525", // Für Karten und hervorgehobene Elemente
        },
        light: {
          DEFAULT: "#FFFFFF", // Weiß für Text
          muted: "#AAAAAA", // Gedämpftes Weiß für weniger wichtigen Text
        }
      },
      backgroundColor: {
        dark: "#121212", // Haupthintergrundfarbe
        card: "#1E1E1E", // Kartenhintergrund
        hover: "#252525", // Hover-Zustand
      }
    },
  },
  plugins: [],
}
