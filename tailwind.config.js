/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#0D0F12',
        'surface-card': '#14171E',
        'surface-elevated': '#1B202A',
        'border-dark': '#262B37',
        'border-light': '#363C4E',
        'primary-red': '#E53935',
        'primary-red-hover': '#F44336',
        'success-green': '#4CAF50',
        'success-green-hover': '#43A047',
        'warning-orange': '#FF9800',
        'text-primary': '#FFFFFF',
        'text-secondary': '#8E9BAE',
        'text-muted': '#525D6F',
        'rust-gold': '#FFB800',
        rarity: {
          contraband: '#FFB800',
          master: '#E53935',
          classified: '#8E24AA',
          restricted: '#1E88E5',
          'mil-spec': '#43A047',
          industrial: '#757575',
        }
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(229, 57, 53, 0.4)',
        'glow-green': '0 0 20px rgba(76, 175, 80, 0.4)',
        'glow-gold': '0 0 25px rgba(255, 184, 0, 0.45)',
        'glow-purple': '0 0 20px rgba(142, 36, 170, 0.4)',
        'glow-blue': '0 0 20px rgba(30, 136, 229, 0.4)',
        'glow-pointer': '0 0 15px #FF5722',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'lamp-swing': 'swing 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        swing: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        }
      }
    },
  },
  plugins: [],
}
