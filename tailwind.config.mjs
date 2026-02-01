/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        card: 'var(--card)',
        border: 'var(--border)',
        ink: 'var(--text)',
        secondary: 'var(--secondary)',
        disabled: 'var(--disabled)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        charter: ['Charter', 'Georgia', 'serif'],
        display: ['"Libre Baskerville"', 'Georgia', 'serif'],
        mono: ['SF Mono', 'SFMono-Regular', 'ui-monospace', 'monospace'],
        sans: ['SF Pro Text', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['1.9rem', { lineHeight: '1.3' }],
        'hero': ['2.5rem', { lineHeight: '1.2' }],
        'body': ['1.1875rem', { lineHeight: '1.7' }],
        'label': ['0.6875rem', { lineHeight: '1.5' }],
        'meta': ['0.9375rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '52px': '52px',
      },
      maxWidth: {
        'content': '720px',
      },
      transitionDuration: {
        '0': '0ms',
        'flash': '50ms',
      },
    },
  },
  plugins: [],
};
