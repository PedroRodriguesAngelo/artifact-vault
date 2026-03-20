/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f13',
        surface: '#1a1a24',
        surface2: '#23233a',
        border: '#2d2d4a',
        accent: '#7c6bf0',
        accent2: '#a78bfa',
        txt: '#e4e4ed',
        txt2: '#9494b8',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      }
    }
  },
  plugins: []
}
