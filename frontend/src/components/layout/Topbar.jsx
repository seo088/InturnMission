import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'

const NAV = [
  { path: '/',         label: '📊 대시보드' },
  { path: '/datasets', label: '🗂️ 데이터셋 (14개)' },
  { path: '/kg',       label: '🕸️ 지식그래프' },
  { path: '/mapping',  label: '🔗 매핑테이블' },
]

export default function Topbar() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('ko-KR'))
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])

  return (
    <header className="sticky top-0 z-50 flex items-center h-14 px-7 border-b"
      style={{ background:'rgba(255,255,255,0.95)', backdropFilter:'blur(16px)', borderColor:'var(--border)', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2 mr-8">
        <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[17px]"
          style={{ background:'linear-gradient(135deg,#0d9488,#2563eb)' }}>🐾</div>
        <span className="font-black text-[15px]">반려동물 통합 지식그래프</span>
        <span className="font-mono text-[9px] px-2 py-0.5 rounded-[5px] ml-1"
          style={{ background:'var(--bg3)', color:'var(--muted)', border:'1px solid var(--border)' }}>v1.0 · 2026</span>
      </div>
      <nav className="flex gap-1">
        {NAV.map(({ path, label }) => (
          <NavLink key={path} to={path} end={path=='/'}
            className={({ isActive }) => `h-9 px-4 rounded-lg text-[13px] font-medium flex items-center transition-all ` + (isActive ? 'font-bold' : 'hover:bg-[var(--bg3)]')}
            style={({ isActive }) => isActive ? { color:'var(--teal)', background:'var(--teal-lt)' } : { color:'var(--muted)' }}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        {[['green','API 연동 11개'],['yellow','CSV 3개'],['red','실시간 2개']].map(([c,l]) => (
          <Pill key={l} color={c} label={l} />
        ))}
        <span className="font-mono text-[11px]" style={{ color:'var(--muted)' }}>{time}</span>
      </div>
    </header>
  )
}

function Pill({ color, label }) {
  const s = { green:{bg:'var(--green-lt)',text:'var(--green)',border:'#a7f3d0'}, yellow:{bg:'var(--yellow-lt)',text:'var(--yellow)',border:'#fde68a'}, red:{bg:'var(--coral-lt)',text:'var(--coral)',border:'#fecdd3'} }[color]
  return (
    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold"
      style={{ background:s.bg, color:s.text, border:`1px solid ${s.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full animate-blink" style={{ background:'currentColor' }} />{label}
    </div>
  )
}
