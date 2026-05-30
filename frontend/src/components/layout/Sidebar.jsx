import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { path } from 'd3'

const NAV = [
  { path: '/',         label: '대시보드',   icon: '📊', end: true  },
  { path: '/datasets', label: '데이터셋',   icon: '🗂️', end: false },
  { path: '/mapping',  label: '매핑테이블', icon: '🔗', end: false },
  { path: '/kg',       label: '지식그래프', icon: '🕸️', end: false },
  { path: '/poster',   label: '포스터',     icon: '📋', end: false },
  {path: '/IndexPage',   label: '흐름도',     icon: '📈', end: false },
  { path: '/scenario', label: '추론 시나리오', icon: '🧩', end: false },
]

// 외부 링크 (라우터 밖) — env 변수로 도메인 전환 가능
// 우선순위: VITE_RESPEC_URL > 서버 고정 IP(개발/내부망) > 운영 도메인(DNS 확보 후)
// 운영 전환 시: VITE_RESPEC_URL=https://knowledgemap.kr/koah/def/
const RESPEC_URL =
  import.meta.env.VITE_RESPEC_URL || 'http://203.234.62.166:5280/koah/def/'
const MCPMAP_URL =
  import.meta.env.VITE_MCPMAP_URL || 'http://203.234.62.166:5280/vocab/def/mcpmap/'
const MCPMAP_DIAGRAM_URL =
  import.meta.env.VITE_MCPMAP_DIAGRAM_URL || 'http://203.234.62.166:5280/mcpmap/diagram'

const EXTERNAL = [
  { url: RESPEC_URL,         label: 'KOAH ReSpec',    icon: '📖', sub: 'Animal Ontology' },
  { url: MCPMAP_URL,         label: 'MCPMap v0.5',    icon: '🧩', sub: 'mcpm: + am: vocab' },
  { url: MCPMAP_DIAGRAM_URL, label: 'MCPMap 다이어그램', icon: '🗺️', sub: 'class hierarchy SVG' },
]

const PILLS = [
  { color: 'green',  label: 'API 연동 11개' },
  { color: 'yellow', label: 'CSV 3개' },
  { color: 'red',    label: '실시간 2개' },
]

const PILL_STYLES = {
  green:  { bg: 'var(--green-lt)',  text: 'var(--green)',  border: '#a7f3d0' },
  yellow: { bg: 'var(--yellow-lt)', text: 'var(--yellow)', border: '#fde68a' },
  red:    { bg: 'var(--coral-lt)',  text: 'var(--coral)',  border: '#fecdd3' },
}

export default function Sidebar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('ko-KR'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: 228,
      background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 50,
      boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: 'linear-gradient(135deg,#0d9488,#2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🐾</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 13.5, lineHeight: 1.3, color: 'var(--text)' }}>반려동물</div>
            <div style={{ fontWeight: 900, fontSize: 13.5, lineHeight: 1.3, color: 'var(--text)' }}>통합 지식그래프</div>
          </div>
        </div>
        <div style={{
          background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6,
          padding: '4px 0', fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--muted)', textAlign: 'center', letterSpacing: '0.5px',
        }}>v1.0 · 2026 · Pet-Graph</div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ padding: '10px 10px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '4px 6px 8px', fontFamily: "'JetBrains Mono', monospace" }}>
          NAVIGATION
        </div>
        {NAV.map(({ path, label, icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 9, marginBottom: 2,
              fontSize: 13.5, fontWeight: isActive ? 700 : 500,
              textDecoration: 'none', transition: 'all .15s',
              background: isActive ? 'var(--teal-lt)' : 'transparent',
              color: isActive ? 'var(--teal)' : 'var(--muted)',
              border: `1px solid ${isActive ? '#b2f5ea' : 'transparent'}`,
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
                <span>{label}</span>
                {isActive && (
                  <span style={{
                    marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--teal)', flexShrink: 0,
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* ── External: ontology / docs ── */}
        <div style={{
          fontSize: 9, fontWeight: 700, color: 'var(--muted)',
          letterSpacing: '1.2px', textTransform: 'uppercase',
          padding: '14px 6px 8px',
          fontFamily: "'JetBrains Mono', monospace",
          borderTop: '1px solid var(--border)', marginTop: 10,
        }}>
          ONTOLOGY
        </div>
        {EXTERNAL.map(({ url, label, icon, sub }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 9, marginBottom: 2,
              fontSize: 13.5, fontWeight: 500,
              textDecoration: 'none',
              background: 'transparent',
              color: 'var(--muted)',
              border: '1px solid transparent',
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span>{label}</span>
              <span style={{
                fontSize: 9, color: 'var(--muted)', opacity: 0.7,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{sub}</span>
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.5 }}>↗</span>
          </a>
        ))}
      </nav>

      {/* ── Footer status ── */}
      <div style={{ padding: '14px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          fontSize: 9, color: 'var(--muted)', marginBottom: 8,
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
          fontFamily: "'JetBrains Mono', monospace",
        }}>데이터 연결 현황</div>
        {PILLS.map(({ color, label }) => {
          const s = PILL_STYLES[color]
          return (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '5px 10px', borderRadius: 20, marginBottom: 5,
              background: s.bg, color: s.text, border: `1px solid ${s.border}`,
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', animation: 'blink 2s infinite', flexShrink: 0 }} />
              {label}
            </div>
          )
        })}
        <div style={{
          marginTop: 10, fontSize: 10, color: 'var(--muted)',
          fontFamily: "'JetBrains Mono', monospace", textAlign: 'center',
          padding: '5px 0', borderTop: '1px solid var(--border)',
        }}>{time}</div>
      </div>
    </aside>
  )
}
