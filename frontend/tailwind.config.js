/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'noir': '#0a0a0a',
        'jaune': '#eab308',
        'jaune-deep': '#ca8a04',
        'gamer-dark': '#121212',
      },
    },
  },
  plugins: [],
}

