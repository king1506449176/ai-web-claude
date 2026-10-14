/**
 * 莓莓头像：渐变圆角方块 + 草莓，带一圈外发光。
 */
export default function BerryAvatar({ size = 34, glow = true, className = '' }) {
  return (
    <span
      className={`relative inline-flex flex-none items-center justify-center rounded-xl ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        boxShadow: glow ? '0 6px 20px -4px rgba(99,102,241,0.65)' : 'none',
        fontSize: size * 0.52,
        lineHeight: 1,
      }}
    >
      <span className="drop-shadow-sm">🍓</span>
    </span>
  )
}
