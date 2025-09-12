/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'swiss': {
          'black': '#000000',
          'white': '#FFFFFF',
          'gray': {
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
          }
        }
      },
      spacing: {
        'a4-width': '210mm',
        'a4-height': '297mm',
        'a3-width': '297mm',
        'a3-height': '420mm',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}