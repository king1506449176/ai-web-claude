import { useRef } from 'react'
import { useCursorParallax } from '@/lib/motion'

/**
 * 背景极光：几团模糊的渐变色缓慢漂移，给深空底加一层呼吸感。
 * 纯装饰，pointer-events-none。
 *
 * 外层 wrapper 归 GSAP（光标微视差），内层 .aurora-blob 归 CSS（漂移），
 * 分成两层是因为两者都要写 transform —— 同一元素上会互相覆盖。
 */
export default function Aurora() {
  const ref = useRef(null)
  useCursorParallax(ref, { max: 32, duration: 1.2 })

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div data-depth="0.35" className="absolute -left-[15%] -top-[25%] h-[60vmax] w-[60vmax]">
        <div
          className="aurora-blob h-full w-full rounded-full opacity-[0.22] blur-[110px]"
          style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 68%)' }}
        />
      </div>

      <div data-depth="0.6" className="absolute -right-[18%] top-[8%] h-[52vmax] w-[52vmax]">
        <div
          className="aurora-blob h-full w-full rounded-full opacity-[0.17] blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #8B5CF6 0%, transparent 68%)',
            animationDelay: '-7s',
            animationDuration: '26s',
          }}
        />
      </div>

      {/* 原来是青色 #22D3EE —— 收进 indigo→violet 同一色相族，只留一点浅紫余韵 */}
      <div data-depth="0.85" className="absolute bottom-[-28%] left-[22%] h-[46vmax] w-[46vmax]">
        <div
          className="aurora-blob h-full w-full rounded-full opacity-[0.13] blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #A78BFA 0%, transparent 68%)',
            animationDelay: '-14s',
            animationDuration: '30s',
          }}
        />
      </div>

      {/* 顶部压暗，让顶栏文字更清晰 */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--chat-bg)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--chat-bg)] to-transparent" />

      {/* 胶片颗粒，和落地页共用同一套质感 */}
      <div className="grain" />
    </div>
  )
}
