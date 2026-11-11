/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0e1318',
          800: '#141b22',
          700: '#1b2530',
          600: '#263341',
        },
        mist: {
          100: '#e6edf3',
          300: '#b4c1ce',
          500: '#8697a8',
        },
        sage: {
          300: '#9fdcd0',
          400: '#6cc4b4',
          500: '#4fa797',
          600: '#3b8577',
        },
        practice: '#0f2a2a',
        rest: '#1d2140',
        amber: { 400: '#e0b25a', 900: '#3a2e14' },
        rose: { 400: '#e58a8a', 900: '#3b1c1f' },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
