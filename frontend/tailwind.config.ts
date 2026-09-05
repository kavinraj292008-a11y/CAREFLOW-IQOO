import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#08111F',
          secondary: '#0D1726',
        },
        surface: {
          DEFAULT: '#111E2E',
          elevated: '#162437',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#9AA8B8',
          muted: '#66768A',
        },
        accent: {
          teal: '#16C7B7',
          tealLight: '#54DDD0',
        },
        stress: {
          coral: '#F06C6C',
          amber: '#E8AD55',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '10px',
        lg: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config
