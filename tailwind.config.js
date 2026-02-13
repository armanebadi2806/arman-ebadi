/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        accent: '#1b4f72',
        'card-border': 'rgba(15, 23, 42, 0.08)'
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15, 23, 42, 0.12)'
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
