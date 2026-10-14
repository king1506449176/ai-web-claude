/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          dark: '#8B5CF6',
        },
        secondary: '#22D3EE',
        background: '#EEF1F6',
        card: 'rgba(255, 255, 255, 0.85)',
        sidebar: 'rgba(255, 255, 255, 0.7)',
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          muted: '#94A3B8',
        }
      },
      // 圆角用 Tailwind 标准刻度（sm2 / DEFAULT4 / md6 / lg8 / xl12 / 2xl16 / 3xl24）。
      // 这里曾把 sm/md/lg/xl 改大却没动 2xl/3xl，导致刻度非单调：
      // rounded-xl=24px 比 rounded-2xl=16px 还圆，32px 的头像被钳成圆形、小控件比大气泡更圆。
      // 需要更大圆角时直接用 rounded-3xl，别再改这套刻度。
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.04)',
        'primary': '0 4px 15px rgba(99, 102, 241, 0.25)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
      spacing: {
        '17': '68px',
        '18': '72px',
        '75': '300px',
        '85': '340px',
        '22': '88px',
      }
    },
  },
  plugins: [
    // Tailwind 3 的 hover: 变体不带指针能力判断。触屏上点一下会让 :hover "粘住"，
    // 看起来像被选中且退不掉。把 hover / group-hover 收进 hover-capable 查询里。
    function ({ addVariant }) {
      addVariant('hover', '@media (hover: hover) and (pointer: fine) { &:hover }')
      addVariant(
        'group-hover',
        '@media (hover: hover) and (pointer: fine) { &:is(:where(.group):hover *) }',
      )
    },
  ],
}
