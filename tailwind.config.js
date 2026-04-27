/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        gold: '#C9922A',
        'gold-light': '#F0C96A',
        'gold-dark': '#a87520',
        dark: '#111111',
        'dark-800': '#1a1a1a',
        'dark-700': '#222222',
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
