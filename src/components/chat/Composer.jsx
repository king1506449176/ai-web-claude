import { useEffect, useRef, useState } from 'react'

/**
 * 输入区。textarea 随内容自动增高，Enter 发送 / Shift+Enter 换行。
 * streaming 时发送键变成「停止」。
 */
export default function Composer({ value, onChange, onSend, onStop, streaming }) {
  const ref = useRef(null)
  const [focused, setFocused] = useState(false)

  // 自动增高
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 176)}px`
  }, [value])

  // 挂载即聚焦
  useEffect(() => {
    ref.current?.focus()
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      onSend()
    }
  }

  const canSend = value.trim().length > 0 && !streaming

  // safe-pb-5：底部再让出 Home Indicator 的高度，否则输入框会压在指示条上
  return (
    <div className="safe-pb-5 mx-auto w-full max-w-3xl px-4">
      <div
        className={`relative rounded-2xl border bg-white/[0.04] backdrop-blur-xl transition-[border-color,box-shadow] duration-200 ${
          focused
            ? 'border-indigo-400/40 shadow-[0_0_0_4px_rgba(99,102,241,0.12),0_18px_50px_-20px_rgba(99,102,241,0.7)]'
            : 'border-white/[0.09] shadow-[0_10px_36px_-22px_rgba(0,0,0,0.9)]'
        }`}
      >
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="说点什么…"
          className="block w-full resize-none bg-transparent px-4 pb-11 pt-3.5 text-[14.5px] leading-6 text-slate-100 outline-none placeholder:text-slate-400"
        />

        {/* 底部一行 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-2.5">
          <span className="hidden text-[11px] text-slate-400 sm:block">
            Enter 发送 · Shift + Enter 换行
          </span>

          {streaming ? (
            <button
              onClick={onStop}
              className="pointer-events-auto ml-auto flex items-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.07] px-3 py-1.5 text-[12.5px] font-medium text-slate-200 transition-colors duration-150 hover:bg-white/[0.12] active:scale-[0.96]"
            >
              <span className="h-2.5 w-2.5 rounded-[3px] bg-slate-200" />
              停止生成
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!canSend}
              aria-label="发送"
              className={`pointer-events-auto ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-white transition-[transform,opacity,box-shadow] duration-200 ${
                canSend
                  ? 'opacity-100 hover:shadow-[0_8px_24px_-6px_rgba(139,92,246,0.85)] active:scale-[0.96]'
                  : 'opacity-30'
              }`}
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M5 12h13M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="mt-2.5 text-center text-[11px] text-slate-400">
        莓莓会出错，重要信息请自行核实
      </p>
    </div>
  )
}
