import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Atmosphere from '@/components/effects/Atmosphere'

export default function LandingPage() {
  return (
    // isolate：让 Atmosphere 的 -z-10 留在本页的层叠上下文里，
    // 否则负 z-index 会逃逸到根层叠上下文，被这里的底色整个盖掉。
    <div className="relative isolate min-h-screen bg-[#EEF1F6] text-slate-900">
      <Atmosphere />
      <Navbar />
      <Hero />
    </div>
  )
}
