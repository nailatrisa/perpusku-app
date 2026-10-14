/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0eeff', 100: '#e3e0ff', 200: '#c7c2ff', 300: '#aba3ff',
          400: '#8f85ff', 500: '#6C63FF', 600: '#5a51eb', 700: '#4a41d7',
          800: '#3a32c3', 900: '#2a22af', 950: '#1a1288',
        },
        dark: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#0B1120',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        violet: '0 10px 30px -10px rgba(108, 99, 255, 0.5)',
      },
    },
  },
  plugins: [],
};