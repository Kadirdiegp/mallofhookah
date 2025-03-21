/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#e30613", // Red from logo
        secondary: "#000000", // Black
        dark: "#000000", // Black
        light: "#ffffff" // White
      }
    },
  },
  plugins: [],
}
