/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#26343B',
        night: '#08243A',
        brand: '#1A4053',
        accent: '#D0D543',
        paper: '#F5F7F8',
        mist: '#E7EEF1',
        school: {
          steel: '#1A4053',
          cyan: '#59BDDC',
          coral: '#ECAFAC',
          lime: '#D0D543',
          magenta: '#C42079'
        }
      },
      boxShadow: {
        lift: '0 24px 52px -34px rgb(8 36 58 / 35%)',
        soft: '0 12px 28px -20px rgb(8 36 58 / 28%)'
      },
      fontFamily: {
        display: ['"Hind Guntur"', '"Open Sans"', 'Arial', 'sans-serif'],
        body: ['"Hind Guntur"', '"Open Sans"', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
