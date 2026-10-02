/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0B1120', 900: '#111827', 800: '#1F2937', 700: '#374151',
          600: '#4B5563', 500: '#6B7280', 400: '#9CA3AF', 300: '#D1D5DB', 200: '#E5E7EB',
        },
        primary: { 300: '#A5A0FF', 400: '#8B83FF', 500: '#6C63FF', 600: '#5B52E8' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};