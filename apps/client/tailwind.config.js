/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tg-blue': '#0A84FF',
        'tg-green': '#34C759',
        'tg-red': '#FF3B30',
        'tg-bg': 'var(--tg-theme-bg-color)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
