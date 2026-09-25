/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', //it imp line
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WCAG 2.1 AA accessible contrast tokens
        surface: {
          default: '#f4f5f7',
          column: '#ebecf0',
          card: '#ffffff',
          },
          content: {
            primary: '#172b4d', // 4.5:1+ contrast
            muted: '#5e6c84',
        }
      }
    },
  },
  plugins: [],
}