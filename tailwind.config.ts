import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#E53935',
        'accent-dark': '#C62828',
        'accent-light': '#EF5350',
        surface: '#1C1C1E',
        'surface-light': '#2C2C2E',
        'surface-lighter': '#3A3A3C',
        dark: '#0A0A0A',
      },
    },
  },
  plugins: [],
};

export default config;
