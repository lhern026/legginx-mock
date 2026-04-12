/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./sections/**/*.liquid",
    "./snippets/**/*.liquid",
    "./layout/**/*.liquid",
    "./templates/**/*.liquid"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#111111',
          light: '#f9f9f9',
          accent: '#A0A0A0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
