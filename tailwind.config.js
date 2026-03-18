/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        accent: '#F59E0B',
        danger: '#EF4444',
        light: '#F3F4F6',
        dark: '#1F2937',
        background: '#FDF2F8',
        'pet-1': '#FFB6C1',
        'pet-2': '#ADD8E6',
        'pet-3': '#98FB98',
        'pet-4': '#FFD700',
        'pet-5': '#DDA0DD',
      },
      fontFamily: {
        sans: ['AlimamaFangYuanTiVF', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'sleep': 'sleep 5s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sleep: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(5px) rotate(5deg)' },
        },
      },
    },
  },
  plugins: [],
}