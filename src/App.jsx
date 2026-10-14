import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import ChatPage from '@/pages/ChatPage'

/** 区分深浅两套底色的路由前缀 */
const isChatRoute = (pathname) => pathname.startsWith('/chat')

export default function App() {
  const { pathname } = useLocation()

  // html 的底色跟着路由走。首帧由 index.html 里的内联脚本先兜住，
  // 这里负责客户端跳转时的切换（含移动端浏览器工具栏的 theme-color）。
  useEffect(() => {
    const root = document.documentElement
    const chat = isChatRoute(pathname)
    root.setAttribute('data-route', chat ? 'chat' : 'landing')
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', chat ? '#20232B' : '#EEF1F6')
  }, [pathname])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
