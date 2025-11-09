/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dojo-red': '#C6362A',
        'dojo-gold': '#EFC94C',
        'ink-black': '#1C1C1C',
        'rice-white': '#E9E6D5',
      },
      fontFamily: {
        'sans': ['Noto Sans SC', 'sans-serif'],
        'serif': ['Noto Serif TC', 'serif'],
      },
    },
  },
  plugins: [],
}
