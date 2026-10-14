import { Link } from 'react-router-dom'
import BerryAvatar from './BerryAvatar'

function Icon({ path, className = 'h-4 w-4' }) {
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
  plus: 'M12 5v14M5 12h14',
  chat: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
  home: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
  close: 'M6 6l12 12M18 6 6 18',
}

export default function Sidebar({
  sessions,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  open,
  onClose,
}) {
  return (
    <>
      {/* 移动端遮罩 */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* 抽屉是整屏高、贴着左边，所以纵向和左侧都要避让。
          右侧不挂 —— 它的右边缘离屏幕右边还有 272px，凭空塞右刘海宽度没有道理。 */}
      <aside
        className={`safe-t safe-b safe-l fixed inset-y-0 left-0 z-40 flex w-[272px] flex-none flex-col border-r border-white/[0.07] bg-[#0B0F1B]/85 backdrop-blur-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:relative md:inset-auto md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 品牌 */}
        <div className="flex items-center gap-2.5 px-4 py-5">
          <BerryAvatar size={34} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold tracking-tight text-white">莓莓</div>
            <div className="text-[11px] text-slate-400">AI 聊天伙伴</div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭侧栏"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200 md:hidden"
          >
            <Icon path={PATH.close} />
          </button>
        </div>

        {/* 新对话 */}
        <div className="px-3">
          <button
            onClick={onCreate}
            className="group relative flex w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-2.5 text-[13px] font-medium text-white transition-transform duration-150 active:scale-[0.96]"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
          >
            <span
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 160%)' }}
            />
            <span className="relative flex items-center gap-2">
              <Icon path={PATH.plus} />
              开启新对话
            </span>
          </button>
        </div>

        {/* 会话列表 */}
        <div className="mt-5 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
          {/* slate-600 在深底上只有 2.59:1，11px 读不清 —— 降到 slate-400(7.67:1) */}
          <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            最近的对话
          </div>

          <div className="space-y-0.5">
            {/* 会话列表是高频交互，不做入场错峰 —— 新建/删除时让它直接到位 */}
            {sessions.map((s) => {
              const active = s.id === activeId
              return (
                <div key={s.id} className="group relative">
                  <button
                    onClick={() => onSelect(s.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-150 ${
                      active
                        ? 'bg-white/[0.09] text-white'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                    }`}
                  >
                    {/* 选中态左侧竖条 */}
                    <span
                      className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-[transform,opacity] duration-200 ${
                        active ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
                      }`}
                      style={{ background: 'linear-gradient(180deg, #6366F1, #22D3EE)' }}
                    />
                    <Icon path={PATH.chat} className="h-3.5 w-3.5 flex-none opacity-70" />
                    <span className="min-w-0 flex-1 truncate text-[13px]">{s.title}</span>
                  </button>

                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(s.id)
                      }}
                      aria-label="删除对话"
                      className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 opacity-0 transition-[opacity,background-color,color] duration-150 hover:bg-white/[0.08] hover:text-rose-400 focus:opacity-100 group-hover:opacity-100"
                    >
                      <Icon path={PATH.trash} className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 底部 */}
        <div className="border-t border-white/[0.07] p-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] text-slate-400 transition-colors duration-200 hover:bg-white/[0.05] hover:text-slate-200"
          >
            <Icon path={PATH.home} />
            返回首页
          </Link>
        </div>
      </aside>
    </>
  )
}
