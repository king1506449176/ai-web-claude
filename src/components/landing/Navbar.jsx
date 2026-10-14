import { Link } from 'react-router-dom'
import MagneticButton from '@/components/effects/MagneticButton'
import { cn } from '@/lib/utils'
import { useScrolled } from '@/lib/motion'

const navLinks = [
  { label: '功能', href: '#features' },
  { label: '评价', href: '#testimonials' },
  { label: '定价', href: '#pricing' },
]

export default function Navbar() {
  // 顶部全透明 → 滚过阈值后磨砂玻璃浮现，而不是从头到尾一个样
  const scrolled = useScrolled(12)

  return (
    // safe-t 挂在外层 header 上：吸顶时磨砂底一路铺到状态栏底下，
    // 而不是在状态栏下沿留一条缝。
    <header
      className={cn(
        'safe-t sticky top-0 z-50 w-full border-b transition-[background-color,border-color,backdrop-filter,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        scrolled
          ? 'border-slate-200/60 bg-white/70 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.55),0_1px_0_rgba(255,255,255,0.7)_inset] backdrop-blur-xl'
          : 'border-transparent bg-white/0 backdrop-blur-0',
      )}
    >
      {/* safe-px-6 = px-6 + 横屏刘海。内边距挂在 nav 上而不是 header 上，
          底色和那条 border-b 才能继续铺满整宽 */}
      <nav className="safe-px-6 mx-auto flex h-16 max-w-6xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-base shadow-primary">
            <span aria-hidden="true">🍓</span>
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">莓莓</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="group relative text-sm text-slate-600 transition-colors duration-300 hover:text-slate-900"
            >
              {link.label}
              {/* 细线从中间向两侧展开 */}
              <span className="absolute -bottom-1.5 left-0 h-px w-full origin-center scale-x-0 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <MagneticButton
          as={Link}
          to="/chat"
          strength={0.2}
          className="h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark px-4 text-sm font-medium text-white shadow-primary"
        >
          开始聊天
        </MagneticButton>
      </nav>
    </header>
  )
}
