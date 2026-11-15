/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#030712',
          navy: '#0a1128',
          blue: '#0052cc',
          electric: '#0099ff',
          cyan: '#00f2fe',
          glow: '#4facfe',
          accent: '#10b981',
          warning: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Be Vietnam Pro"', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', filter: 'drop-shadow(0 0 15px rgba(0, 242, 254, 0.6))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 30px rgba(0, 242, 254, 0.9))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

