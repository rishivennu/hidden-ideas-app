import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-fredoka)', 'Fredoka', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        ink: '#141414',
        paper: '#FFFDF5',
        yellow: { DEFAULT: '#FFE111', deep: '#F4C400' },
        biz: {
          green: '#2FB457',
          pink: '#FF5CA8',
          purple: '#7B6EF6',
          blue: '#2E5BFF',
          orange: '#FF6A2B',
          sky: '#8FD3FF',
        },
        accent: { DEFAULT: '#2E5BFF', hover: '#1E42D6' },
        muted: '#5B5B52',
      },
      borderRadius: { '14': '14px', '20': '20px', '28': '28px' },
      boxShadow: {
        hard: '4px 4px 0 #141414',
        'hard-lg': '7px 7px 0 #141414',
        'hard-sm': '3px 3px 0 #141414',
        card: '4px 4px 0 #141414',
        'card-hover': '7px 7px 0 #141414',
      },
      fontSize: {
        hero: ['clamp(3rem,9vw,7rem)', { lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '700' }],
        title: ['clamp(2rem,5vw,3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        floaty: { '0%,100%': { transform: 'translateY(0) rotate(var(--tw-rotate,0))' }, '50%': { transform: 'translateY(-10px) rotate(var(--tw-rotate,0))' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        fadeIn: 'fadeIn 420ms cubic-bezier(0.2,0.8,0.2,1) both',
        floaty: 'floaty 5s ease-in-out infinite',
        marquee: 'marquee 26s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
