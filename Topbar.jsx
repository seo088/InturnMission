// 상단 네비게이션 바 — 기존 HTML 프로토타입 v0.2 디자인 재현
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { path: '/',         label: '📊 대시보드' },
  { path: '/datasets', label: '🗂️ 데이터셋 (14개)' },
  { path: '/kg',       label: '🕸️ 지식그래프' },
  { path: '/mapping',  label: '🔗 매핑테이블' },
]

export default function Topbar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('ko-KR'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 flex items-center h-14 px-7 gap-0 border-b"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        borderColor: 'var(--border)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* 로고 */}
      <div className="flex items-center gap-2 mr-8">
        <div
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[17px]"
          style={{ background: 'linear-gradient(135deg,#0d9488,#2563eb)', boxShadow: '0 2px 8px rgba(13,148,136,0.25)' }}
        >
          🐾
        </div>
        <span className="font-black text-[15px] tracking-tight" style={{ color: 'var(--text)' }}>
          반려동물 통합 지식그래프
        </span>
        <span
          className="font-mono text-[9px] px-2 py-0.5 rounded-[5px] ml-1"
          style={{ background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          v1.0 · 2026
        </span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex gap-1">
        {NAV_ITEMS.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `h-9 px-4 rounded-lg text-[13px] font-medium flex items-center transition-all duration-150 ` +
              (isActive
                ? 'font-bold'
                : 'hover:bg-[var(--bg3)]')
            }
            style={({ isActive }) =>
              isActive
                ? { color: 'var(--teal)', background: 'var(--teal-lt)' }
                : { color: 'var(--muted)' }
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* 우측 상태 Pills */}
      <div className="ml-auto flex items-center gap-2">
        <StatusPill color="green"  label="API 연동 11개" />
        <StatusPill color="yellow" label="CSV 3개" />
        <StatusPill color="red"    label="실시간 2개" />
        <span className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>{time}</span>
      </div>
    </header>
  )
}

function StatusPill({ color, label }) {
  const styles = {
    green:  { bg: 'var(--green-lt)',  text: 'var(--green)',  border: '#a7f3d0' },
    yellow: { bg: 'var(--yellow-lt)', text: 'var(--yellow)', border: '#fde68a' },
    red:    { bg: 'var(--coral-lt)',  text: 'var(--coral)',  border: '#fecdd3' },
  }[color]

  return (
    <div
      className="flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold"
      style={{ background: styles.bg, color: styles.text, border: `1px solid ${styles.border}` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-blink"
        style={{ background: 'currentColor' }}
      />
      {label}
    </div>
  )
}
