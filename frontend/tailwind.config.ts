import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cornell: {
          red: '#B31B1B',
          'red-dark': '#8B1515',
          carnelian: '#D44A3C',
        },
        dark: {
          900: '#222222',
          800: '#333333',
          700: '#444444',
          600: '#555555',
          500: '#666666',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
