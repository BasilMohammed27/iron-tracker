/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gym: {
          bg: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          accent: '#10b981', // Neon emerald for completed sets & buttons
          highlight: '#38bdf8', // Cyan for timers and active metrics
          muted: '#8b949e',
        }
      }
    },
  },
  plugins: [],
}