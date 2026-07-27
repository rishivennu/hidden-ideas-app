import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
        body: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'sans-serif'],
      },
      colors: {
        bg: {
          100: '#FFFFFF',
          200: '#F7F7F8',
          300: '#EFEFEF',
        },
        accent: {
          DEFAULT: '#0A84FF',
          hover: '#0070E0',
          muted: '#CCE4FF',
        },
        muted: '#6B6B6B',
        glass: 'rgba(255,255,255,0.6)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        '14': '14px',
        '20': '20px',
      },
      backdropBlur: {
        glass: '12px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
        glow: '0 0 24px rgba(10,132,255,0.25)',
        glass: '0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
      },
      fontSize: {
        hero: ['clamp(3rem,8vw,6rem)', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        title: ['clamp(2rem,5vw,3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '600' }],
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
      animation: {
        fadeIn: 'fadeIn 420ms cubic-bezier(0.2,0.8,0.2,1) both',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
