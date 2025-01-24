/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        'tech-mono': ['Share Tech Mono', 'monospace'],
        'inter': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'menu-dark': '#1a1f24',
        'menu-hover': '#2a2f36',
        gray: {
          50: '#F9FAFB',
          100: '#F4F7FE',
          200: '#EAECF0',
          300: '#D0D5DD',
          400: '#98A2B3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1D2939',
          900: '#101828',
        },
        indigo: {
          50: '#EEF4FF',
          100: '#E0EAFF',
          200: '#C7D7FE',
          300: '#A4BCFD',
          400: '#8098F9',
          500: '#6172F3',
          600: '#444CE7',
          700: '#3538CD',
          800: '#2D31A6',
          900: '#2D3282',
        }
      },
    },
  },
  plugins: [],
};