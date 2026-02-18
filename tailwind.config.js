/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#0B1F36',
        },
        orange: {
          500: '#F97316',
          600: '#EA580C',
        },
        teal: {
          500: '#15B8A1',
          600: '#0D9488',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.charcoal.900'),
            a: {
              color: theme('colors.orange.500'),
              '&:hover': {
                color: theme('colors.orange.600'),
              },
              fontWeight: '500',
            },
            h1: {
              color: theme('colors.charcoal.900'),
              fontFamily: theme('fontFamily.heading').join(', '),
              fontWeight: '700',
              fontSize: '2.75rem', // ~44px
              lineHeight: '1.1',
              marginBottom: '1.5rem',
            },
            h2: {
              color: theme('colors.charcoal.900'),
              fontFamily: theme('fontFamily.heading').join(', '),
              fontWeight: '600',
              fontSize: '2rem', // ~32px
              marginTop: '2.5rem',
              marginBottom: '1rem',
            },
            h3: {
              color: theme('colors.charcoal.900'),
              fontFamily: theme('fontFamily.heading').join(', '),
              fontWeight: '600',
              fontSize: '1.5rem', // ~24px
              marginTop: '2rem',
              marginBottom: '0.75rem',
            },
            'ul > li::marker': {
              color: theme('colors.orange.500'),
            },
            strong: { color: theme('colors.charcoal.900') },
          },
        },
        invert: {
          css: {
            color: theme('colors.charcoal.50'),
            a: {
              color: theme('colors.orange.400'),
              '&:hover': {
                color: theme('colors.orange.500'),
              },
              fontWeight: '500',
            },
            h1: {
              color: theme('colors.charcoal.50'),
              fontFamily: theme('fontFamily.heading').join(', '),
              fontWeight: '700',
              fontSize: '2.75rem',
              lineHeight: '1.1',
              marginBottom: '1.5rem',
            },
            h2: {
              color: theme('colors.charcoal.50'),
              fontFamily: theme('fontFamily.heading').join(', '),
              fontWeight: '600',
              fontSize: '2rem',
              marginTop: '2.5rem',
              marginBottom: '1rem',
            },
            h3: {
              color: theme('colors.charcoal.50'),
              fontFamily: theme('fontFamily.heading').join(', '),
              fontWeight: '600',
              fontSize: '1.5rem',
              marginTop: '2rem',
              marginBottom: '0.75rem',
            },
            'ul > li::marker': {
              color: theme('colors.orange.400'),
            },
            strong: { color: theme('colors.charcoal.50') },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}; 