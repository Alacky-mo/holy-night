/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // 与 src/styles/global.css 的 CSS 变量主题一一对应（AGENT.md 5.2）
        page: 'var(--bg-page)',
        card: 'var(--bg-card)',
        accent: 'var(--accent)',
        'accent-warm': 'var(--accent-warm)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        border: 'var(--border)',
      },
      fontFamily: {
        serif: ['var(--font-serif)'],
        sans: ['var(--font-sans)'],
      },
      maxWidth: {
        content: '1200px', // DONT_DO #8：内容区最大宽度固定 1200px
      },
      transitionDuration: {
        DEFAULT: '300ms', // 动效 200–400ms，ease-out（AGENT.md 5.4）
      },
    },
  },
  plugins: [],
};
