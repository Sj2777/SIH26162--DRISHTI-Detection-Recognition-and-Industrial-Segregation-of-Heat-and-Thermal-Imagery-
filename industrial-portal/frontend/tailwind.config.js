/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: '#0a0d12',
          surface: '#121820',
          panel: '#18212c',
          border: '#243242',
          borderLight: '#32455b',
          textMuted: '#7f93a8',
          textDim: '#4e6175',
          accent: '#0284c7',
          thermal: '#f97316',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
