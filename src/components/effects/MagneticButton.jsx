import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { useMagnetic, useSpotlight } from '@/lib/motion'

/**
 * 磁吸按钮：整体朝指针轻微偏移，内部叠一层跟随指针的柔和高光。
 * 按压回弹放在内层 span 上 —— 外层 transform 已经被 GSAP 接管，
 * 两者分层才不会互相覆盖。
 *
 * 用法：<MagneticButton as={Link} to="/chat" className="...">立即开始</MagneticButton>
 */
export default function MagneticButton({
  as: Tag = 'button',
  className,
  children,
  strength,
  ...props
}) {
  const ref = useRef(null)
  useMagnetic(ref, { strength })
  useSpotlight(ref)

  return (
    <Tag
      ref={ref}
      className={cn(
        'group relative isolate inline-flex items-center justify-center overflow-hidden',
        className,
      )}
      {...props}
    >
      {/* 指针聚光：只写 CSS 变量，不参与布局 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(150px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.20), rgba(255,255,255,0) 68%)',
        }}
      />
      <span className="relative z-10 inline-flex items-center justify-center gap-2 transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-active:scale-[0.97]">
        {children}
      </span>
    </Tag>
  )
}
