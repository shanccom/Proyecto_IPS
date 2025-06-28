/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#7DCFF', // Celeste base
          light: '#AEEBFF',
          dark: '#3BAEDF',
        },
        rose: {
          DEFAULT: '#FF8BB3', // Rosado base
          light: '#FFC6DA',
          dark: '#DB5F8E',
        },
        emerald: {
          DEFAULT: '#4CAF50', // Verde base
          light: '#81C784',
          dark: '#388E3C',
        },
        amber: {
          DEFAULT: '#FFB74D', // Naranja base
          light: '#FFD08A',
          dark: '#F57C00',
        },
        crimson: {
          DEFAULT: '#F44336', // Rojo base
          light: '#E57373',
          dark: '#C62828',
        },
      },
    },
  },
  plugins: [],
}

