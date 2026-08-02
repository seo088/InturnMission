import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'

const NAV = [
  { path: '/vet/symptom-review', label: '수의사 증상 검수', icon: 'VR' },
  { path: '/admin', label: '대시보드', icon: 'DB', end: true },
  { path: '/datasets', label: '데이터셋', icon: 'DS' },
  { path: '/mapping', label: '매핑', icon: 'MP' },
  { path: '/kg', label: '지식그래프', icon: 'KG' },
  { path: '/scenario', label: '추론 시나리오', icon: 'AI' },
  { path: '/pet-care', label: '산책 케어', icon: 'WK' },
  { path: '/costs', label: '진료비', icon: '₩' },
  { path: '/animals', label: '동물 조회', icon: 'AN' },
  { path: '/poster', label: '포스터', icon: 'PT' },
  { path: '/IndexPage', label: '이름 통계', icon: 'NM' },
]

const EXTERNAL = [
  {
    url: import.meta.env.VITE_RESPEC_URL || 'http://203.234.62.166:5280/koah/def/',
    label: 'KOAH ReSpec',
    sub: 'Animal Ontology',
  },
  {
    url: import.meta.env.VITE_MCPMAP_URL || 'http://203.234.62.166:5280/vocab/def/mcpmap/',
    label: 'MCPMap v0.5',
    sub: 'vocabulary map',
  },
]

const USER_ONLY_PATHS = new Set(['/pet-care', '/costs'])

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
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: 228,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
    }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: 'linear-gradient(135deg,#0d9488,#2563eb)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 900,
          }}>PG</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, lineHeight: 1.3, color: 'var(--text)' }}>반려동물</div>
            <div style={{ fontWeight: 900, fontSize: 14, lineHeight: 1.3, color: 'var(--text)' }}>지식그래프</div>
          </div>
        </div>
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '5px 0',
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--muted)',
          textAlign: 'center',
        }}>v1.1 · Pet-Graph</div>
      </div>

      <nav style={{ padding: '10px', flex: 1, overflowY: 'auto' }}>
        <div style={{
          fontSize: 9,
          fontWeight: 800,
          color: 'var(--muted)',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          padding: '4px 6px 8px',
          fontFamily: "'JetBrains Mono', monospace",
        }}>Navigation</div>

        {NAV.filter(({ path }) => !USER_ONLY_PATHS.has(path)).map(({ path, label, icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              marginBottom: 2,
              fontSize: 13.5,
              fontWeight: isActive ? 800 : 600,
              textDecoration: 'none',
              background: isActive ? 'var(--teal-lt)' : 'transparent',
              color: isActive ? 'var(--teal)' : 'var(--muted)',
              border: `1px solid ${isActive ? '#b2f5ea' : 'transparent'}`,
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{
                  width: 24,
                  fontSize: 10,
                  fontWeight: 900,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{icon}</span>
                <span>{label}</span>
                {isActive && (
                  <span style={{
                    marginLeft: 'auto',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--teal)',
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}

        <div style={{
          fontSize: 9,
          fontWeight: 800,
          color: 'var(--muted)',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          padding: '14px 6px 8px',
          borderTop: '1px solid var(--border)',
          marginTop: 10,
          fontFamily: "'JetBrains Mono', monospace",
        }}>Ontology</div>

        {EXTERNAL.map(({ url, label, sub }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '9px 12px',
              borderRadius: 8,
              marginBottom: 2,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              color: 'var(--muted)',
            }}
          >
            <span>{label}</span>
            <span style={{ fontSize: 10, opacity: 0.7, fontFamily: "'JetBrains Mono', monospace" }}>{sub}</span>
          </a>
        ))}
      </nav>

      <div style={{ padding: '14px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          fontSize: 10,
          color: 'var(--muted)',
          fontFamily: "'JetBrains Mono', monospace",
          textAlign: 'center',
        }}>{time}</div>
      </div>
    </aside>
  )
}
