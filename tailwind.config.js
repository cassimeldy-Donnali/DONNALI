/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          50:  '#e6f3fb',
          100: '#cce7f7',
          200: '#99cfef',
          300: '#66b7e7',
          400: '#339fdf',
          500: '#0077B6',
          600: '#0069a3',
          700: '#005a8f',
          800: '#004c7a',
          900: '#003d66',
        },
        eco: {
          50:  '#edf7f1',
          100: '#dbefe3',
          200: '#b6dfc7',
          300: '#92cfab',
          400: '#6dbf8f',
          500: '#52B788',
          600: '#47a579',
          700: '#3c926a',
          800: '#31805b',
          900: '#266d4c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(0,119,182,0.08)',
        'card-hover': '0 8px 32px 0 rgba(0,119,182,0.16)',
      },
    },
  },
  plugins: [],
};
