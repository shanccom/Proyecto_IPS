/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary-color) / <alpha-value>)',
          light: 'rgb(var(--primary-color-light) / <alpha-value>)',
          dark: 'rgb(var(--primary-color-dark) / <alpha-value>)',
        },
        background: {
          DEFAULT: 'rgb(var(--background-color) / <alpha-value>)',
        },
        text: {
          DEFAULT: 'rgb(var(--text-color) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
