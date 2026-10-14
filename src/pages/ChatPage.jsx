import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Aurora from '@/components/chat/Aurora'
import Sidebar from '@/components/chat/Sidebar'
import MessageList from '@/components/chat/MessageList'
import Composer from '@/components/chat/Composer'
import Welcome from '@/components/chat/Welcome'
import { streamReply } from '@/lib/berry'

let seq = 0
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `m${++seq}-${Date.now()}`)

/** 新会话从空消息开始 —— 空会话由 <Welcome/> 接住 */
const newSession = () => ({ id: uid(), title: '新的对话', messages: [] })

/** 单行化 + 截断，用作会话标题 */
const clip = (text) => {
  const oneLine = text.replace(/\s+/g, ' ').trim()
  return oneLine.length > 16 ? `${oneLine.slice(0, 16)}…` : oneLine
}

/**
 * 喂给模型的对话历史。剔掉出错的、被中断的空消息 ——
 * 把「抱歉，我这边出了点问题」当成莓莓说过的话喂回去，会污染人设。
 */
const historyFor = (list) =>
  list.filter((m) => !m.error && m.content).map(({ role, content }) => ({ role, content }))

export default function ChatPage() {
  const [sessions, setSessions] = useState(() => [newSession()])
  const [activeId, setActiveId] = useState(() => sessions[0].id)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const abortRef = useRef(null)
  const scrollRef = useRef(null)
  const stickRef = useRef(true)

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? sessions[0],
    [sessions, activeId],
  )
  const messages = active.messages

  /* ── 会话操作 ─────────────────────────────────────────── */

  const patchMessage = useCallback((sessionId, messageId, patch) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id !== sessionId
          ? s
          : {
              ...s,
              messages: s.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
            },
      ),
    )
  }, [])

  const stop = useCallback(() => abortRef.current?.abort(), [])

  /** 跑一次流式回复，写进指定会话的指定消息 */
  const runStream = useCallback(
    async (sessionId, assistantId, prompt, history) => {
      const controller = new AbortController()
      abortRef.current = controller
      setStreaming(true)

      let acc = ''
      try {
        for await (const chunk of streamReply(prompt, {
          signal: controller.signal,
          history,
        })) {
          acc = chunk
          patchMessage(sessionId, assistantId, { content: acc })
        }
        patchMessage(sessionId, assistantId, { content: acc, streaming: false })
      } catch (err) {
        if (err?.name === 'AbortError') {
          patchMessage(sessionId, assistantId, {
            content: acc || '（已停止）',
            streaming: false,
          })
        } else {
          patchMessage(sessionId, assistantId, {
            content: '抱歉，我这边出了点问题，请再试一次。',
            streaming: false,
            error: true,
          })
        }
      } finally {
        abortRef.current = null
        setStreaming(false)
      }
    },
    [patchMessage],
  )

  /** 发一条消息 */
  const send = useCallback(
    (raw) => {
      const text = (raw ?? input).trim()
      if (!text || streaming) return

      const sessionId = active.id
      const userMsg = { id: uid(), role: 'user', content: text }
      const assistantMsg = { id: uid(), role: 'assistant', content: '', streaming: true }
      // 在 append 之前取历史，末尾才是这一轮的上下文
      const history = historyFor(messages)

      setSessions((prev) =>
        prev.map((s) =>
          s.id !== sessionId
            ? s
            : {
                ...s,
                // 首条用户消息顺带当作会话标题
                title: s.messages.length > 0 ? s.title : clip(text),
                messages: [...s.messages, userMsg, assistantMsg],
              },
        ),
      )
      setInput('')
      stickRef.current = true
      runStream(sessionId, assistantMsg.id, text, history)
    },
    [active.id, input, messages, streaming, runStream],
  )

  /** 重新生成最后一条回复 */
  const regenerate = useCallback(() => {
    if (streaming) return
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return

    const sessionId = active.id
    const assistantMsg = { id: uid(), role: 'assistant', content: '', streaming: true }
    // 历史取到这条用户消息之前为止，它本身要作为本轮的新提问重新发出去
    const history = historyFor(messages.slice(0, messages.lastIndexOf(lastUser)))

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const cut = [...s.messages]
        while (cut.length && cut[cut.length - 1].role === 'assistant') cut.pop()
        return { ...s, messages: [...cut, assistantMsg] }
      }),
    )
    runStream(sessionId, assistantMsg.id, lastUser.content, history)
  }, [active.id, messages, streaming, runStream])

  const createSession = useCallback(() => {
    stop()
    const s = newSession()
    setSessions((prev) => [s, ...prev])
    setActiveId(s.id)
    setSidebarOpen(false)
    stickRef.current = true
  }, [stop])

  const deleteSession = useCallback((id) => {
    if (id === activeId) stop()
    setSessions((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)))
  }, [activeId, stop])

  const selectSession = useCallback(
    (id) => {
      stop()
      setActiveId(id)
      setSidebarOpen(false)
      stickRef.current = true
    },
    [stop],
  )

  /* ── 自动滚动：贴底时才跟随，用户往上翻就不打扰 ─────────── */

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !stickRef.current) return
    el.scrollTo({ top: el.scrollHeight, behavior: streaming ? 'auto' : 'smooth' })
  }, [messages, streaming])

  // 切换会话时直接落到底部
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [activeId])

  // 离开页面时掐断流
  useEffect(() => () => abortRef.current?.abort(), [])

  // 当前会话被删掉时，自动落到第一个
  useEffect(() => {
    if (!sessions.some((s) => s.id === activeId)) setActiveId(sessions[0].id)
  }, [sessions, activeId])

  const isEmpty = messages.length === 0

  return (
    <div className="relative flex h-[100dvh] overflow-hidden bg-[var(--chat-bg)] text-slate-100">
      <Aurora />

      <Sidebar
        sessions={sessions}
        activeId={active.id}
        onSelect={selectSession}
        onCreate={createSession}
        onDelete={deleteSession}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* safe-x：横屏时让出一条刘海。纵向由顶栏 / 输入区各自处理，
          这里不能再挂 safe-t/safe-b，否则会和它们叠加成两份。
          safe-x 只保横 —— 侧栏是 fixed 且贴左，自己单独处理。 */}
      <main className="safe-x relative z-10 flex min-w-0 flex-1 flex-col">
        {/* 顶栏：磨砂底一直铺到状态栏底下，只有内容避让 */}
        <header className="safe-pt-3 flex flex-none items-center gap-3 border-b border-white/[0.07] bg-[var(--chat-bg-veil)] px-4 pb-3 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="打开侧栏"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-100 md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[14px] font-medium text-slate-100">{active.title}</h1>
          </div>

          <span className="flex flex-none items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-1 text-[11.5px] text-emerald-300">
            <span className="online-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {streaming ? '正在输入…' : '在线'}
          </span>
        </header>

        {/* 消息区 */}
        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto overscroll-contain">
          {isEmpty ? (
            <Welcome onPick={send} />
          ) : (
            <div className="mx-auto w-full max-w-3xl px-4 py-8">
              <MessageList
                messages={messages}
                pending={streaming && messages[messages.length - 1]?.content === ''}
                onRegenerate={regenerate}
              />
              <div className="h-4" />
            </div>
          )}
        </div>

        <Composer
          value={input}
          onChange={setInput}
          onSend={() => send()}
          onStop={stop}
          streaming={streaming}
        />
      </main>
    </div>
  )
}
