/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/frontend/index.html",
    "./src/frontend/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f97316',
        secondary: '#0f172a',
      },
    },
  },
  plugins: [],
}
