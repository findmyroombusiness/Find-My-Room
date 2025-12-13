/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        luckguy: ['LuckGuy', 'sans-serif'],  // <-- your custom font
      },
    },
  },
  plugins: [],
}
