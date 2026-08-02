import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/animal-route-logo.png'
import { getDashboardSession, getMemberProfile, MEMBER_PROFILE_UPDATED_EVENT } from '../../demo/dashboardState'

const navigation = [
  { to: '/health-check', label: '증상 확인' },
  { to: '/#how-it-works', label: '이용 방법' },
  { to: '/costs', label: '진료비' },
  { to: '/pet-care', label: '시설 추천' },
]

function MobileMenu({ onClose, triggerRef }) {
  const closeRef = useRef(null)
  const menuRef = useRef(null)
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    closeRef.current?.focus()
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; triggerRef.current?.focus() }
  }, [onClose, triggerRef])
  const trapFocus = (event) => {
    if (event.key !== 'Tab') return
    const items = [...menuRef.current.querySelectorAll('button, [href]')]
    const first = items[0]; const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  return <div className="ar-menu-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="ar-mobile-menu" ref={menuRef} role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" onKeyDown={trapFocus}>
      <div className="ar-mobile-menu-head"><strong id="mobile-menu-title">메뉴</strong><button type="button" ref={closeRef} className="ar-menu-close" aria-label="메뉴 닫기" onClick={onClose}>×</button></div>
      <nav id="mobile-navigation" aria-label="사용자 메뉴">{navigation.map((item) => <Link key={item.to} to={item.to} onClick={onClose}>{item.label}<span aria-hidden="true">→</span></Link>)}</nav>
      <p>증상 확인은 로그인 없이 시작할 수 있어요.</p>
    </section>
  </div>
}

export function UserHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState(getMemberProfile)
  const menuTriggerRef = useRef(null)
  const dashboardSession = getDashboardSession()
  const isDemoMember = dashboardSession.mode === 'member-demo'
  useEffect(() => {
    const refreshProfile = () => setProfile(getMemberProfile())
    window.addEventListener(MEMBER_PROFILE_UPDATED_EVENT, refreshProfile)
    window.addEventListener('storage', refreshProfile)
    return () => { window.removeEventListener(MEMBER_PROFILE_UPDATED_EVENT, refreshProfile); window.removeEventListener('storage', refreshProfile) }
  }, [])
  const rawMemberName = profile.displayName || dashboardSession.member?.displayName || '보호자'
  const memberName = rawMemberName.endsWith('님') ? rawMemberName : `${rawMemberName}님`
  return <header className="ar-header ar-header--shared">
    <Link to="/" className="ar-brand" aria-label="Animal-Route 홈"><img src={logo} alt="Animal-Route" /></Link>
    <nav className="ar-nav" aria-label="사용자 메뉴">{navigation.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}</nav>
    <div className="ar-header-actions">{isDemoMember ? <Link className="ar-account-profile" to="/my" aria-label={`${memberName} 마이페이지 보기`}><span className="ar-account-avatar" aria-hidden="true">{profile.avatarDataUrl ? <img src={profile.avatarDataUrl} alt="" /> : memberName.slice(0, 1)}</span><span>{memberName}</span></Link> : <Link className="ar-login-button" to="/">로그인</Link>}<button ref={menuTriggerRef} type="button" className="ar-menu-toggle" aria-label="메뉴 열기" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}><span /><span /><span /></button></div>
    {menuOpen && <MobileMenu triggerRef={menuTriggerRef} onClose={() => setMenuOpen(false)} />}
  </header>
}

export function UserFooter() {
  return <footer className="ar-footer ar-footer--shared">
    <div className="ar-footer-brand"><img src={logo} alt="Animal-Route" /><p>반려동물 보호자의 다음 행동을 돕는 건강 탐색 서비스</p></div>
    <div><Link to="/#services">서비스 소개</Link><Link to="/#how-it-works">이용 방법</Link><Link to="/#service-scope">의료 면책</Link><Link to="/#evidence-title">데이터 출처</Link></div>
    <p>문의 채널 준비 중 · © 2026 Animal-Route</p>
  </footer>
}
