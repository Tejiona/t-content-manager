import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#6366f1', dark: '#4f46e5', light: '#818cf8' },
        surface: { DEFAULT: '#1e293b', dark: '#0f172a', darker: '#0a1120' },
        border: '#334155',
      },
    },
  },
  plugins: [],
};
export default config;
