import { useState } from 'react'
import BerryAvatar from './BerryAvatar'

function Icon({ path, className = 'h-3.5 w-3.5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={path} />
    </svg>
  )
}

const PATH = {
  copy: 'M9 9h10v10H9zM5 15V5h10',
  check: 'M4 12.5 9 17.5 20 6.5',
  refresh: 'M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5',
  alert: 'M12 8v5M12 16.5h.01M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
}

/** 两张图标同时在 DOM 里交叉淡入淡出，避免状态切换时「跳」一下 */
function CrossFadeIcon({ path, activePath, active }) {
  return (
    <>
      <span className="icon-swap" data-shown={!active}>
        <Icon path={path} />
      </span>
      <span className="icon-swap" data-shown={active}>
        <Icon path={activePath} />
      </span>
    </>
  )
}

/** 小圆按钮：悬停淡入 */
function Action({ label, path, activePath, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="relative flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-white/[0.08] hover:text-slate-200"
    >
      {activePath ? (
        <CrossFadeIcon path={path} activePath={activePath} active={active} />
      ) : (
        <Icon path={path} />
      )}
    </button>
  )
}

function AssistantBubble({ message, isLast, onRegenerate }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* 剪贴板不可用（非 https 等），静默忽略 */
    }
  }

  return (
    <div className="msg-in group flex gap-3">
      <BerryAvatar size={32} className="mt-0.5" />

      <div className="min-w-0 max-w-[min(680px,100%)] flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-400">莓莓</span>
          {message.error && (
            <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-400">
              <Icon path={PATH.alert} className="h-3 w-3" />
              出错了
            </span>
          )}
        </div>

        <div
          className={`relative rounded-2xl rounded-tl-md border px-4 py-3 text-[14.5px] leading-[1.75] transition-colors duration-300 ${
            message.error
              ? 'border-rose-500/25 bg-rose-500/[0.07] text-rose-100'
              : 'border-white/[0.08] bg-white/[0.045] text-slate-100'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">
            {message.content}
            {message.streaming && <span className="stream-caret" />}
          </p>
        </div>

        {/* 悬停操作条 */}
        {!message.streaming && (
          <div className="mt-1.5 flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
            <Action
              label={copied ? '已复制' : '复制'}
              path={PATH.copy}
              activePath={PATH.check}
              active={copied}
              onClick={copy}
            />
            {isLast && !message.error && (
              <Action label="重新生成" path={PATH.refresh} onClick={onRegenerate} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function UserBubble({ message }) {
  return (
    <div className="msg-in flex justify-end">
      <div
        className="max-w-[min(680px,86%)] rounded-2xl rounded-tr-md px-4 py-3 text-[14.5px] leading-[1.75] text-white shadow-[0_8px_28px_-8px_rgba(99,102,241,0.6)]"
        style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  )
}

/** 等待首个字时的三点跳动 */
export function TypingIndicator() {
  return (
    <div className="msg-in flex gap-3">
      <BerryAvatar size={32} className="mt-0.5" />
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/[0.08] bg-white/[0.045] px-4 py-3.5">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" />
      </div>
    </div>
  )
}

export default function MessageList({ messages, pending, onRegenerate }) {
  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id

  return (
    <div className="space-y-7">
      {messages.map((m) =>
        m.role === 'user' ? (
          <UserBubble key={m.id} message={m} />
        ) : (
          <AssistantBubble
            key={m.id}
            message={m}
            isLast={m.id === lastAssistantId}
            onRegenerate={onRegenerate}
          />
        ),
      )}
      {pending && <TypingIndicator />}
    </div>
  )
}
