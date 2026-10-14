import { useRef } from 'react'
import { SUGGESTIONS } from '@/lib/berry'
import { gsap, useGSAP, useReducedMotion, useSpotlight } from '@/lib/motion'
import BerryAvatar from './BerryAvatar'

/** 推荐卡：光标聚光代替"整卡抬升" */
function SuggestionCard({ item, onPick }) {
  const ref = useRef(null)
  useSpotlight(ref)

  return (
    <button
      ref={ref}
      onClick={() => onPick(item.prompt)}
      data-reveal
      className="group relative isolate flex items-start gap-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 text-left backdrop-blur-sm transition-[transform,border-color,background-color,box-shadow] duration-300 hover:border-indigo-400/25 hover:bg-white/[0.055] hover:shadow-[0_18px_44px_-24px_rgba(99,102,241,0.85)] motion-safe:active:scale-[0.98]"
    >
      {/* 跟随指针的柔和聚光 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(220px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(129,140,248,0.15), rgba(129,140,248,0) 70%)',
        }}
      />

      <span className="relative flex items-start gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white/[0.06] text-base transition-[background-color,transform] duration-300 group-hover:bg-indigo-400/10 motion-safe:group-hover:scale-[1.04]">
          {item.icon}
        </span>
        <span className="min-w-0 pt-0.5">
          <span className="block text-[13.5px] font-medium text-slate-200">{item.title}</span>
          <span className="mt-0.5 block truncate text-[12px] text-slate-400">{item.prompt}</span>
        </span>
      </span>
    </button>
  )
}

/** 空会话时的首屏：品牌 + 推荐提问 */
export default function Welcome({ onPick }) {
  const rootRef = useRef(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced) return

      gsap.fromTo(
        '[data-reveal]',
        { y: 14, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.7,
          stagger: 0.075,
          ease: 'power3.out',
          clearProps: 'filter',
        },
      )
    },
    { scope: rootRef, dependencies: [reduced] },
  )

  return (
    <div ref={rootRef} className="flex min-h-full flex-col items-center justify-center px-4 py-14">
      <div data-reveal className="relative">
        {/* 头像背后的光晕 */}
        <div
          className="absolute -inset-6 rounded-full opacity-40 blur-2xl"
          style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }}
        />
        <BerryAvatar size={64} className="relative" />
      </div>

      <h1
        data-reveal
        className="mt-6 text-center text-[30px] font-semibold tracking-tight"
        style={{
          background: 'linear-gradient(120deg, #FFFFFF 0%, #C7D2FE 45%, #A5B4FC 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        今天想聊点什么？
      </h1>

      <p
        data-reveal
        className="mt-3 max-w-md text-center text-[14px] leading-relaxed text-slate-400"
      >
        我是莓莓，一个随时在线的 AI 伙伴。可以陪你闲聊，也可以帮你把事想清楚。
      </p>

      <div className="mt-9 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map(s => (
          <SuggestionCard key={s.title} item={s} onPick={onPick} />
        ))}
      </div>
    </div>
  )
}
