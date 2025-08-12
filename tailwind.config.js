/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f14',
        panel: '#0f1620',
        muted: '#9fb0c3',
        text: '#e6eef7',
        accent: '#5ee1a5',
        'accent-2': '#7aa2f7',
        danger: '#ff6b6b',
        warn: '#ffd166',
        card: '#121a25',
        chip: '#1b2532',
        border: '#233044',
      },
      boxShadow: {
        'custom': '0 10px 30px rgba(0,0,0,.35)',
      }
    },
  },
  plugins: [],
}

