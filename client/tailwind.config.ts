import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f98080',
          500: '#d32f2f',
          600: '#b71c1c',
          700: '#8b0000',
          800: '#5c0000',
          900: '#3b0000',
          950: '#1a0000',
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#d4a017',
          500: '#b8860b',
          600: '#996515',
          700: '#7a4f0c',
          800: '#5c3a08',
          900: '#3d2505',
          950: '#1f1302',
        },
        midnight: {
          50: '#f5f5f6',
          100: '#e5e5e7',
          200: '#ccccce',
          300: '#a3a3a7',
          400: '#71717a',
          500: '#52525b',
          600: '#3f3f46',
          700: '#27272a',
          800: '#18181b',
          900: '#0f0f11',
          950: '#09090b',
        },
        parchment: {
          50: '#faf8f0',
          100: '#f0ead4',
          200: '#e2d5a8',
          300: '#d4bf7c',
          400: '#c6a950',
          500: '#b89330',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"EB Garamond"', 'Garamond', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'dramatic': '0 0 30px rgba(139, 0, 0, 0.3)',
        'glow-red': '0 0 15px rgba(211, 47, 47, 0.4)',
        'glow-gold': '0 0 15px rgba(184, 134, 11, 0.4)',
      },
      backgroundImage: {
        'dark-gradient': 'radial-gradient(ellipse at center, #1a0000 0%, #09090b 70%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
