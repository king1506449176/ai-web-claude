import { useRef } from 'react'
import { useCursorParallax } from '@/lib/motion'

/**
 * 落地页环境光：贴在视口上的背景层，随光标做景深微移。
 *
 * 为什么是 fixed 而不是直接塞进 Hero —— Hero 带 overflow-hidden，
 * 光晕一旦越过它的上边界就会被切出一条直边（浅色底上尤其明显）。
 * fixed inset-0 的裁剪边界是视口本身，光晕可以自然淡出到视野之外。
 *
 * 只留 indigo→violet 一个色相族，透明度压得很低：颜色是"透出来"的，不是"砸上去"的。
 */
const BLOBS = [
  { depth: 0.32, cls: '-top-[30vh] -left-[10vw] h-[70vh] w-[70vw]', rgb: '99,102,241', alpha: 0.2 },
  { depth: 0.55, cls: '-top-[20vh] -right-[12vw] h-[62vh] w-[54vw]', rgb: '139,92,246', alpha: 0.15 },
  { depth: 0.8, cls: '-bottom-[34vh] left-[14vw] h-[62vh] w-[58vw]', rgb: '129,140,248', alpha: 0.11 },
]

export default function Atmosphere() {
  const ref = useRef(null)
  useCursorParallax(ref, { max: 30, duration: 1.1 })

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {BLOBS.map((b, i) => (
        <div
          key={i}
          data-depth={b.depth}
          className={`absolute rounded-full blur-[120px] ${b.cls}`}
          style={{
            background: `radial-gradient(closest-side, rgba(${b.rgb},${b.alpha}), rgba(${b.rgb},0) 100%)`,
          }}
        />
      ))}

      {/* 胶片颗粒，和聊天页共用同一套质感 */}
      <div className="grain" />
    </div>
  )
}
