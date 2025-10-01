/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6B2C',
          blue: '#0EA5E9',
          purple: '#9333EA',
          gold: '#F59E0B',
          red: '#EF4444',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #FF6B2C 0%, #9333EA 50%, #0EA5E9 100%)',
        'gradient-fire': 'linear-gradient(135deg, #FF6B2C 0%, #EF4444 100%)',
        'gradient-storm': 'linear-gradient(135deg, #0EA5E9 0%, #9333EA 100%)',
        'gradient-victory': 'linear-gradient(135deg, #F59E0B 0%, #FF6B2C 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};