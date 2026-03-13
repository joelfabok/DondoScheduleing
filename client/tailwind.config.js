/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f9f4',
          100: '#dcf0e5',
          200: '#bbe1ce',
          300: '#8dcaad',
          400: '#5aad87',
          500: '#37906a',
          600: '#267354',
          700: '#1e5c43',
          800: '#1a4936',
          900: '#163c2d',
        },
      },
    },
  },
  plugins: [],
};
