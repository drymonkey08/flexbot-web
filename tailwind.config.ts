import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#C9A84C',
      },
      backgroundColor: {
        'black-primary': '#0a0a0a',
      },
    },
  },
  plugins: [],
};

export default config;
