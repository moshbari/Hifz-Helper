/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Amiri', 'serif'],
      },
      colors: {
        // Deep Ocean Theme (Default)
        ocean: {
          bg: '#0a1628',
          card: '#1a2744',
          primary: '#3b82f6',
          secondary: '#1e3a5f',
          text: '#e2e8f0',
          muted: '#64748b',
        },
        // Forest Theme
        forest: {
          bg: '#0d1f0d',
          card: '#1a3a1a',
          primary: '#22c55e',
          secondary: '#15401a',
          text: '#dcfce7',
          muted: '#4ade80',
        },
        // Royal Theme
        royal: {
          bg: '#1a0a2e',
          card: '#2d1650',
          primary: '#a855f7',
          secondary: '#3b1f6b',
          text: '#f3e8ff',
          muted: '#c084fc',
        },
      },
    },
  },
  plugins: [],
};
