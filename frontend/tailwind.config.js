/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#18223a',
          light: '#2c3b5e',
          dark: '#0c1220'
        },
        secondary: {
          DEFAULT: '#146D78',
          light: '#1a8a99',
          dark: '#0e4f57'
        },
        accent: {
          DEFAULT: '#FFB74D',
          light: '#ffc670',
          dark: '#cc923d'
        }
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
  important: true
}; 