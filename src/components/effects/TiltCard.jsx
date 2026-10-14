import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { useTilt, useSpotlight } from '@/lib/motion'

/**
 * 3D 倾斜卡：跟随指针绕 X/Y 轴微转，并叠一层随之移动的镜面高光。
 * 角度刻意压得很小 —— 目标是"有厚度"，不是"会翻"。
 *
 * 注意：外层负责旋转，所以视差 / 磁吸这类也动 transform 的效果
 * 要套在它的**父级**上，别放同一层。
 */
export default function TiltCard({
  className,
  children,
  max = 5,
  perspective = 1000,
  glare = 'rgba(255,255,255,0.13)',
}) {
  const ref = useRef(null)
  useTilt(ref, { max, perspective })
  useSpotlight(ref)

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      {children}
      {glare && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(58% 58% at var(--spot-x, 50%) var(--spot-y, 0%), ${glare}, rgba(255,255,255,0) 72%)`,
          }}
        />
      )}
    </div>
  )
}
