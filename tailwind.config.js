/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy dojo colors (kept for compatibility)
        'dojo-red': '#C6362A',
        'dojo-gold': '#EFC94C',
        'ink-black': '#1C1C1C',
        'rice-white': '#E9E6D5',

        // Ninjago Elemental Theme
        // Fire Element (Kai)
        'ninja-red': '#f90000',
        'ninja-red-dark': '#cc0000',
        'ninja-orange': '#FF6600',

        // Lightning Element (Jay)
        'ninja-blue': '#0095fc',
        'ninja-blue-dark': '#0070c0',
        'ninja-yellow': '#f7f503',

        // Energy Element (Lloyd)
        'ninja-green': '#009f28',
        'ninja-green-dark': '#007020',

        // Ultimate Power
        'ninja-gold': '#FFD700',
        'ninja-gold-dark': '#DAA520',

        // Earth Element (Cole)
        'ninja-black': '#120101',
        'ninja-gray': '#424242',

        // Ice Element (Zane)
        'ninja-white': '#F5F5F5',
        'ninja-ice': '#E0F7FF',

        // Water Element (Nya)
        'ninja-teal': '#00CED1',
        'ninja-teal-dark': '#008B8B',

        // Mystery/Advanced
        'ninja-purple': '#8B00FF',
      },
      fontFamily: {
        'sans': ['DM Sans', 'Noto Sans SC', 'sans-serif'],
        'serif': ['Noto Serif TC', 'serif'],
        'heading': ['Bungee', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
      },
    },
  },
  plugins: [],
}
