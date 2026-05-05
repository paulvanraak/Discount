/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EEF0FE',
          100: '#D5DAFC',
          200: '#A8B2F8',
          400: '#5C6BEF',
          500: '#3340DD',
          600: '#2630B8',
          700: '#1D258F',
          900: '#0F1454',
        },
        accent: {
          50:  '#FFF4E6',
          400: '#FFA940',
          500: '#FF8800',
          600: '#E07000',
        },
        success: '#1D9E75',
        successBg: '#E1F5EE',
        warning: '#EF9F27',
        danger: '#E24B4A',
        ink: {
          900: '#0A0A0A',
          700: '#1A1A1A',
          500: '#5F5E5A',
          300: '#888780',
          100: '#F1EFE8',
          50:  '#FAFAF7',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm:  '4px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}
