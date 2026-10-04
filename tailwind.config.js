/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: 'var(--as-ink-900)',
          800: 'var(--as-ink-800)',
          700: 'var(--as-ink-700)',
          600: 'var(--as-ink-600)',
          500: 'var(--as-ink-500)',
        },
        bone: {
          DEFAULT: 'var(--as-bone)',
          muted: 'var(--as-bone-muted)',
          dim: 'var(--as-bone-dim)',
        },
        accent: {
          DEFAULT: 'var(--as-accent)',
          soft: 'var(--as-accent-soft)',
        },
        line: 'var(--as-line)',
        'line-strong': 'var(--as-line-strong)',
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.045em',
        editorial: '-0.03em',
        wide2: '0.14em',
        wide3: '0.22em',
      },
      maxWidth: {
        shell: '96rem',
        prose2: '38rem',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
        cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: {
        header: '70',
        drawer: '80',
        modal: '90',
        toast: '95',
        cursor: '100',
      },
    },
  },
  plugins: [],
};
