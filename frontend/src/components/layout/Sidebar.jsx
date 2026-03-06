import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',         icon: '▦',  label: '대시보드' },
  { to: '/datasets', icon: '◫',  label: '데이터셋', badge: '14' },
  { to: '/kg',       icon: '◈',  label: '지식그래프' },
  { to: '/mapping',  icon: '⊕',  label: '매핑테이블' },
  { to: '/poster',   icon: '◻',  label: '포스터' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('ko-KR'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <aside style={{
      width: collapsed ? 64 : 220,
      transition: 'width 0.25s ease',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      background: '#0d1117',
      borderRight: '1px solid #1e2635',
      overflow: 'hidden',
    }}>

      {/* 로고 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '20px 0' : '20px 16px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: '1px solid #1e2635',
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #4ade80, #22c55e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          🐾
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
              반려동물
            </div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.2 }}>
              지식그래프 v1.0
            </div>
          </div>
        )}
      </div>

      {/* 네비게이션 */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ to, icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : '10px 12px',
              borderRadius: 8,
              border: 'none',
              borderLeft: isActive ? '2px solid #4ade80' : '2px solid transparent',
              cursor: 'pointer',
              background: isActive ? '#1a2435' : 'transparent',
              color: isActive ? '#4ade80' : '#64748b',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              transition: 'all 0.15s',
              width: '100%',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
                {!collapsed && badge && (
                  <span style={{
                    background: isActive ? '#4ade8033' : '#1e2635',
                    color: isActive ? '#4ade80' : '#64748b',
                    fontSize: 10, fontWeight: 600,
                    padding: '2px 6px', borderRadius: 10,
                  }}>{badge}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 하단 상태 */}
      {!collapsed && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid #1e2635', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <StatusPill color="#4ade80" border="#166534" bg="#052e16" label="API 연동 11개" />
          <StatusPill color="#fbbf24" border="#854d0e" bg="#2d1a00" label="CSV 3개" />
          <StatusPill color="#f87171" border="#991b1b" bg="#2d0a0a" label="실시간 2개" />
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#334155', textAlign: 'center', marginTop: 2 }}>
            {time}
          </span>
        </div>
      )}

      {/* 접기 토글 */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid #1e2635' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: '100%', padding: '8px', borderRadius: 8,
            background: 'transparent', border: 'none',
            color: '#475569', cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
    </aside>
  )
}

function StatusPill({ color, border, bg, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 20,
      fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
      background: bg, color: color,
      border: `1px solid ${border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </div>
  )
}
