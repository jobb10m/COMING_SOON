/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0B0E14',
          soft: '#0F1420',
        },
        surface: {
          DEFAULT: '#131826',
          light: '#FFFFFF',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          light: 'rgba(11,14,20,0.08)',
        },
        ink: {
          DEFAULT: '#F4F5F7',
          muted: '#8B93A7',
          light: '#0B0E14',
          lightMuted: '#5B6474',
        },
        kinetic: {
          DEFAULT: '#FF5A1F',
          soft: '#FF7A47',
        },
        pulse: {
          DEFAULT: '#00E5A0',
        },
        volt: {
          DEFAULT: '#7C6CFF',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
