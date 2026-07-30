/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/client/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Game theme colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        knight: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#b91c1c',
        },
        archer: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#047857',
        },
        mage: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dark: '#6d28d9',
        },
      },
      fontFamily: {
        game: ['Press Start 2P', 'cursive'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
