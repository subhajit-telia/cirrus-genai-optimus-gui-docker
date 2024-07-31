/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      colors: {
        primary: 'var(--color-primary)',
        white: 'var(--color-white)',
        black: 'var(--color-black)'
      },
      extend: {
        fontFamily: {
          custom: ['TeliaFont', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }