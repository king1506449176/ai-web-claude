import { useRef } from 'react'
import { Link } from 'react-router-dom'
import MagneticButton from '@/components/effects/MagneticButton'
import TiltCard from '@/components/effects/TiltCard'
import { gsap, useGSAP, useCursorParallax, useReducedMotion } from '@/lib/motion'

const demoMessages = [
  { role: 'assistant', text: '晚上好呀～今天过得怎么样？' },
  { role: 'user', text: '有点累，项目终于上线了' },
  { role: 'assistant', text: '辛苦啦，那今晚什么都不用想，跟我说说就好 🌙' },
]

function ChatMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-card backdrop-blur-xl">
      {/* 窗口头 */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        {/* 跟真实聊天页的莓莓头像保持一致：圆角方块，不是圆形 */}
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-base">
          <span aria-hidden="true">🍓</span>
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900">莓莓</p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="online-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            在线
          </p>
        </div>
        <span className="text-xs text-slate-400">刚刚</span>
      </div>

      {/* 消息 */}
      <div className="flex flex-col gap-3 px-5 py-5">
        {demoMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <p
              className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-primary-dark text-white shadow-primary'
                  : 'rounded-2xl rounded-bl-md border border-slate-100 bg-slate-100/80 text-slate-700'
              }`}
            >
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      {/* 输入栏 */}
      <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-4">
        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400">
          输入消息...
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-primary">
          ↑
        </span>
      </div>
    </div>
  )
}

export default function Hero() {
  const rootRef = useRef(null)
  const reduced = useReducedMotion()

  // 光标驱动的景深视差：光晕 / 文案 / 预览卡按不同深度分层移动
  useCursorParallax(rootRef, { max: 26 })

  useGSAP(
    () => {
      if (reduced) return

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(
          '[data-reveal]',
          { y: 20, opacity: 0, filter: 'blur(10px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.9,
            stagger: 0.085,
            clearProps: 'filter',
          },
        )
        .fromTo(
          '[data-reveal-mock]',
          { y: 32, opacity: 0, filter: 'blur(14px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.15, clearProps: 'filter' },
          '-=0.8',
        )
    },
    { scope: rootRef, dependencies: [reduced] },
  )

  return (
    // 背景交给 <Atmosphere />（fixed 视口层）：用 overflow-hidden 会把光晕切出直边。
    // 但只裁横向 —— 预览卡背后那层 -inset-8 背光在窄屏会外溢 8px 撑出横向滚动条，
    // overflow-x:clip 不建立滚动容器，safari/chrome 上都安全，也不影响纵向。
    <section
      ref={rootRef}
      className="safe-px-6 relative [overflow-x:clip] pb-24 pt-20 text-slate-900"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        {/* 左侧文案 —— 中层深度 */}
        <div data-depth="0.5">
          <span
            data-reveal
            className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/60 px-3 py-1 text-xs font-medium text-primary-dark shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-sm"
          >
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-primary-dark/40 blur-[3px]" />
              <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-primary-dark" />
            </span>
            全新的 AI 陪伴体验
          </span>

          <h1
            data-reveal
            className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            随时在线的 AI 伙伴
          </h1>

          <p data-reveal className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            莓莓听得懂你的心情。文字也好，语音也好，随时接住你的每一句话——
            聊天、整理思路、或者只是找个人说说话。
          </p>

          <div data-reveal className="mt-9 flex flex-wrap items-center gap-4">
            <MagneticButton
              as={Link}
              to="/chat"
              className="h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark px-7 text-base font-medium text-white shadow-primary"
            >
              立即开始聊天
            </MagneticButton>

            {/* 次级按钮不做抬升，改成一条从左侧划出的品牌色细线 */}
            <a
              href="#features"
              className="group inline-flex h-12 items-center rounded-xl border border-slate-300/80 bg-white/60 px-7 text-base font-medium text-slate-700 transition-colors duration-300 hover:border-primary/25 hover:bg-white/90 hover:text-slate-900"
            >
              <span className="relative">
                了解更多
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-primary to-primary-dark transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
              </span>
            </a>
          </div>

          <p data-reveal className="mt-8 text-sm text-slate-500">
            无需注册即可试用 · 支持语音消息 · 会话记录本地保存
          </p>
        </div>

        {/* 右侧预览 —— 最近，深度最大 */}
        <div data-depth="0.9" className="relative">
          {/* 背光：贴在卡片后方，跟着一起移动 */}
          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-[radial-gradient(closest-side,rgba(99,102,241,0.26),rgba(139,92,246,0.12),rgba(0,0,0,0)_100%)] blur-2xl" />

          <div data-reveal-mock>
            <TiltCard className="rounded-2xl" glare="rgba(99,102,241,0.16)">
              <ChatMock />
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  )
}
