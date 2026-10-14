import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export { gsap, useGSAP }

const REDUCE = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCE).matches
}

/** 订阅 reduced-motion：用户中途改系统设置也能立刻生效 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    const mq = window.matchMedia(REDUCE)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/**
 * 光标驱动的景深视差。
 * scope 内任何带 data-depth 的元素都会按各自深度反向平移 —— depth 越大越"靠前"，
 * 于是背景光晕、文案、预览卡形成分层纵深，而不是整块一起晃。
 */
export function useCursorParallax(scopeRef, { max = 22, duration = 0.7 } = {}) {
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const scope = scopeRef.current
      if (!scope || reduced) return

      const layers = gsap.utils.toArray('[data-depth]', scope)
      if (!layers.length) return

      const setters = layers.map(el => ({
        x: gsap.quickTo(el, 'x', { duration, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration, ease: 'power3.out' }),
        depth: parseFloat(el.dataset.depth) || 0,
      }))

      const onMove = e => {
        const r = scope.getBoundingClientRect()
        // 归一化到 -1..1
        const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
        const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
        for (const s of setters) {
          s.x(-nx * max * s.depth)
          s.y(-ny * max * s.depth)
        }
      }
      const onLeave = () => {
        for (const s of setters) {
          s.x(0)
          s.y(0)
        }
      }

      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerleave', onLeave)
      return () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope: scopeRef, dependencies: [reduced, max, duration] },
  )
}

/**
 * 磁吸：元素朝指针轻微偏移。位移量有上限，靠近中心时几乎不动 ——
 * 手感是"被吸住"，不是"跟着跑"。
 */
export function useMagnetic(ref, { strength = 0.26, maxX = 16, maxY = 12, duration = 0.5 } = {}) {
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return

      const xTo = gsap.quickTo(el, 'x', { duration, ease: 'power3.out' })
      const yTo = gsap.quickTo(el, 'y', { duration, ease: 'power3.out' })

      const onMove = e => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        xTo(gsap.utils.clamp(-maxX, maxX, dx * strength))
        yTo(gsap.utils.clamp(-maxY, maxY, dy * strength))
      }
      const onLeave = () => {
        xTo(0)
        yTo(0)
      }

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope: ref, dependencies: [reduced, strength, maxX, maxY, duration] },
  )
}

/**
 * 光标聚光：把指针位置写进 CSS 变量 --spot-x / --spot-y，
 * 由 CSS 用 radial-gradient 画一层柔和高光。
 * 只写变量、不碰 transform，所以能和 hover 过渡叠加而不打架。
 */
export function useSpotlight(ref) {
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return

      const onMove = e => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--spot-x', `${(((e.clientX - r.left) / r.width) * 100).toFixed(2)}%`)
        el.style.setProperty('--spot-y', `${(((e.clientY - r.top) / r.height) * 100).toFixed(2)}%`)
      }
      const onLeave = () => {
        el.style.setProperty('--spot-x', '50%')
        el.style.setProperty('--spot-y', '0%')
      }

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope: ref, dependencies: [reduced] },
  )
}

/** 3D 倾斜：跟随指针绕 X/Y 轴微转。角度刻意小，是"有厚度"不是"会翻" */
export function useTilt(ref, { max = 5, perspective = 1000, duration = 0.7 } = {}) {
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return

      gsap.set(el, { transformPerspective: perspective, transformOrigin: 'center center' })
      const rx = gsap.quickTo(el, 'rotationX', { duration, ease: 'power3.out' })
      const ry = gsap.quickTo(el, 'rotationY', { duration, ease: 'power3.out' })

      const onMove = e => {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        ry((px - 0.5) * 2 * max)
        rx(-(py - 0.5) * 2 * max)
      }
      const onLeave = () => {
        rx(0)
        ry(0)
      }

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope: ref, dependencies: [reduced, max, perspective, duration] },
  )
}

/** 滚动过了阈值就返回 true —— 顶栏磨砂玻璃分级加深用它 */
export function useScrolled(threshold = 16) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}
