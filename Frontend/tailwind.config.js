/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.28), 0 20px 50px rgba(56, 189, 248, 0.18)',
        neon: '0 0 40px rgba(59, 130, 246, 0.32)',
      },
      backgroundImage: {
        'hero-grid': 'linear-gradient(rgba(11, 18, 32, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(11, 18, 32, 0.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
