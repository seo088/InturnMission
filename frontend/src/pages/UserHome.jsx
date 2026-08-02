import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/animal-route-logo.png'
import { getPetAvatar, getPetAvatarLabel } from '../assets/petAvatar'
import { clearHealthDraft, draftLabel, endDemoSession, getActivePet, getDashboardSession, getMemberProfile, getPetProfiles, loadHealthDraft, setActivePetId, startDemoSession } from '../demo/dashboardState'
import '../styles/user-home.css'
import '../styles/hero-typography.css'

const serviceCards = [
  {
    number: '01',
    title: '증상으로 건강 경로 찾기',
    description: '관찰한 증상을 정리하고, 함께 살펴볼 건강 정보와 문의할 지역 동물병원을 연결해요.',
    link: '/health-check',
    action: '증상 확인 시작하기',
    status: '이용 가능',
    statusNote: '약 1~2분',
    featured: true,
  },
  {
    number: '02',
    title: '우리 지역 진료비 확인',
    description: '공개된 동물병원 진료비 정보를 지역별로 살펴볼 수 있어요.',
    link: '/costs',
    action: '지역별 진료비 비교하기',
    status: '2025 공개 조사',
    statusNote: '개별 병원 실시간 가격 아님',
  },
  {
    number: '03',
    title: '날씨 맞춤 반려생활',
    description: '날씨와 대기질을 바탕으로 오늘의 외출 방향과 추천 장소 유형을 안내해요.',
    link: '/pet-care',
    action: '오늘 외출 정보 보기',
    status: '데모 기능',
    statusNote: '개별 시설 목록·지도 준비 중',
  },
]

const routeSteps = [
  ['관찰한 증상 입력', '“어제부터 마른기침을 해요”'],
  ['증상 표현 확인', 'Animal-Route가 찾은 표현을 직접 선택'],
  ['건강 정보 살펴보기', '입력한 증상과 연결된 정보 확인'],
  ['병원에 문의하기', '지역 동물병원에 전화로 진료 가능 여부 확인'],
]

const mobileRouteSteps = [
  ['증상 입력', '평소와 다른 모습을 자연스럽게 적어요'],
  ['표현 확인', '찾은 증상 표현을 내가 직접 확인해요'],
  ['병원 찾기', '전화로 문의할 지역 동물병원을 살펴봐요'],
]

function LoginDialog({ onClose, onStartDemo, isDemoMember, onLogout, triggerRef }) {
  const closeRef = useRef(null)
  const modalRef = useRef(null)
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; triggerRef.current?.focus() }
  }, [onClose])

  const trapFocus = (event) => {
    if (event.key !== 'Tab') return
    const items = [...modalRef.current.querySelectorAll('button:not([disabled]), [href], input:not([disabled])')]
    const first = items[0]; const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }

  return (
    <div className="ar-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="ar-login-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="login-title" aria-describedby="login-description" onKeyDown={trapFocus}>
        <button className="ar-modal-close" ref={closeRef} type="button" aria-label="로그인 창 닫기" onClick={onClose}>×</button>
        <img src={logo} alt="" className="ar-login-logo" />
        <p className="ar-eyebrow">WELCOME BACK</p>
        <h2 id="login-title">반려동물별 건강 경로를 이어보세요</h2>
        <p id="login-description" className="ar-modal-copy">실제 로그인 기능은 준비 중입니다. 아래 버튼은 예시 반려동물과 화면 구성을 둘러보는 데모입니다.</p>
        {!isDemoMember && <button type="button" className="ar-demo-login" onClick={onStartDemo}>데모로 내 대시보드 보기 <span>예시 데이터</span></button>}
        <button type="button" className="ar-social ar-social--kakao" disabled>카카오 로그인 (준비 중)</button>
        <button type="button" className="ar-social ar-social--naver" disabled>네이버 로그인 (준비 중)</button>
        <button type="button" className="ar-email-login" disabled>이메일 로그인 (준비 중)</button>
        {isDemoMember && <button type="button" className="ar-demo-exit" onClick={onLogout}>데모 대시보드 나가기</button>}
        <p className="ar-demo-note">회원정보·증상·병원 기록은 서버로 전송하거나 저장하지 않습니다.</p>
      </section>
    </div>
  )
}

function relativeDraftTime(updatedAt) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(updatedAt).getTime()) / 60000))
  return minutes < 60 ? `${minutes}분 전 임시저장` : '이 브라우저 세션에 임시저장'
}

export default function UserHome() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [dashboardVersion, setDashboardVersion] = useState(0)
  const homeRef = useRef(null)
  const loginTriggerRef = useRef(null)
  const session = getDashboardSession()
  const memberProfile = getMemberProfile()
  const profileName = memberProfile.displayName.endsWith('님') ? memberProfile.displayName : `${memberProfile.displayName}님`
  const profiles = getPetProfiles()
  const activePet = getActivePet()
  const activeDraft = loadHealthDraft(session.mode === 'member-demo' ? activePet?.id : 'guest')
  const refreshDashboard = () => setDashboardVersion((version) => version + 1)

  useEffect(() => {
    const root = homeRef.current
    const cards = root?.querySelectorAll('.ar-scroll-reveal') ?? []

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cards.forEach((card) => card.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.18 })

    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="ar-home" ref={homeRef}>
      <header className="ar-header">
        <Link to="/" className="ar-brand" aria-label="Animal-Route 홈">
          <img src={logo} alt="Animal-Route" />
        </Link>
        <nav className="ar-nav" aria-label="사용자 메뉴">
          <Link to="/health-check">증상 확인</Link>
          <a href="#how-it-works">이용 방법</a>
          <Link to="/costs">진료비</Link>
          <Link to="/pet-care">시설 추천</Link>
          {session.mode === 'member-demo' ? <Link className="ar-account-profile" to="/my" aria-label={`${profileName} 마이페이지 보기`}><span className="ar-account-avatar" aria-hidden="true">{memberProfile.avatarDataUrl ? <img src={memberProfile.avatarDataUrl} alt="" /> : profileName.slice(0, 1)}</span><span>{profileName}</span></Link> : <button type="button" ref={loginTriggerRef} className="ar-login-button" onClick={() => setLoginOpen(true)}>로그인</button>}
        </nav>
      </header>

      <main>
        <section className="ar-hero" aria-labelledby="hero-title">
          <div className="ar-hero-copy">
            <p className="ar-eyebrow ar-reveal ar-delay-1">PET HEALTH NAVIGATION</p>
            <h1 id="hero-title" className="ar-reveal ar-delay-2">우리 아이가 평소와 다르다면,<br /><em>지금 보이는 증상부터 확인해보세요.</em></h1>
            <p className="ar-hero-description ar-reveal ar-delay-3">관찰한 증상을 적어주시면, 함께 확인할 건강 정보와 전화로 문의할 지역 동물병원 후보를 안내해드려요.</p>
            <div className="ar-hero-actions ar-reveal ar-delay-4">
              <Link to="/health-check" className="ar-primary-action">증상 확인 시작하기 <span aria-hidden="true">→</span></Link>
              <a href="#how-it-works" className="ar-secondary-action">어떻게 작동하나요?</a>
            </div>
            <p className="ar-hero-meta ar-reveal ar-delay-4"><span aria-hidden="true">✓</span> 약 1~2분 · 로그인 없이 이용 가능</p>
          </div>

          <div className="ar-route-visual" aria-label="보호자 증상에서 병원 후보까지 이어지는 서비스 경로">
            <div className="ar-orbit ar-orbit--one" />
            <div className="ar-orbit ar-orbit--two" />
            <div className="ar-orbit-dots" aria-hidden="true" />
            <div className="ar-pet-marker">
              <img src={logo} alt="" />
              <span className="ar-marker-pulse" />
            </div>
            <svg className="ar-route-line" viewBox="0 0 540 420" role="presentation" aria-hidden="true">
              <path pathLength="1" d="M105 330 C155 285, 120 208, 215 190 S310 94, 435 112" />
            </svg>
            <div className="ar-route-node ar-node--symptom"><span>1</span><strong>증상 입력</strong><small>평소와 다른 모습</small></div>
            <div className="ar-route-node ar-node--meaning"><span>2</span><strong>표현 확인</strong><small>내가 직접 선택</small></div>
            <div className="ar-route-node ar-node--hospital"><span>3</span><strong>병원 찾기</strong><small>전화 문의할 곳</small></div>
          </div>

          <ol className="ar-mobile-route" aria-label="증상 확인 과정">
            {mobileRouteSteps.map(([title, detail], index) => (
              <li key={title}>
                <span aria-hidden="true">{index + 1}</span>
                <div><strong>{title}</strong><small>{detail}</small></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="ar-trust-strip" aria-label="서비스 원칙">
          <div><strong>공개 데이터 기반 정보</strong><span>데이터 출처와 확인 기준을 볼 수 있어요</span></div>
          <div><strong>내가 직접 증상 확인</strong><span>검색 후보를 선택한 뒤 다음 정보를 살펴봐요</span></div>
          <div><strong>응급 신호는 먼저 안내</strong><span>진단·처방 대신 병원 문의를 도와요</span></div>
        </section>

        <section className="ar-evidence" aria-labelledby="evidence-title">
          <details>
            <summary id="evidence-title"><span>서비스 근거와 데이터 기준 보기</span><small>공개 데이터 기반 · 상태별 확인</small></summary>
            <div className="ar-evidence-content">
              <article><h3>어떤 정보를 쓰나요?</h3><p>516개 표준 증상 용어를 바탕으로, 증상과 연결된 건강 정보 및 동물병원 공공등록 정보를 사용합니다.</p><small>기술 정보: 표준 증상 분류(DS13) · 증상–질병 연결 관계(DS27)</small></article>
              <article><h3>어떻게 확인하나요?</h3><p>보호자가 입력한 표현을 검색 후보와 비교해 직접 선택한 뒤, 연결 근거가 있는 정보만 안내합니다.</p><small>증상·질병 관계에는 내부 정합성·안전 규칙 검수 이력이 있습니다.</small></article>
              <article><h3>병원 정보는 어떻게 보나요?</h3><p>지역 동물병원 후보는 전화 문의를 돕기 위한 정보입니다. 거리, 진료 품질, 24시간·응급 진료와 현재 접수 가능 여부를 보장하지 않습니다.</p><small>방문 전 전화로 증상 진료 가능 여부를 확인해주세요.</small></article>
              <article><h3>데이터 상태와 갱신 기준</h3><p>데이터 출처·검수 상태는 결과 화면과 데모 고지에서 구분해 표시합니다. 병원 정보와 운영 여부는 변동될 수 있습니다.</p><small>연결된 데이터 조회 · 내부 확인 이력이 있는 데모 정보 · 데모용 예시 정보를 구분합니다.</small></article>
            </div>
          </details>
        </section>

        {(activeDraft || session.mode === 'member-demo') && <section className="ar-dashboard-panel" aria-label="내 건강 경로">
          <div className="ar-dashboard-heading"><div><p className="ar-eyebrow">MY ROUTE</p><h2>{session.mode === 'member-demo' ? '예시 대시보드' : '작성 중인 건강 경로'}</h2></div><p>{session.mode === 'member-demo' ? '데모 예시 · 실제 계정 또는 기록 저장 기능이 아닙니다.' : '입력 내용은 이 브라우저 세션에만 임시 저장됩니다.'}</p></div>
          {session.mode === 'member-demo' && <><div className="ar-pet-switcher" aria-label="반려동물 선택">{profiles.pets.map((pet) => <button type="button" key={pet.id} className={pet.id === activePet?.id ? 'is-selected' : ''} aria-pressed={pet.id === activePet?.id} onClick={() => { setActivePetId(pet.id); refreshDashboard() }}><span className="ar-pet-avatar"><img src={getPetAvatar(pet.species)} alt={getPetAvatarLabel(pet.species)} /></span><strong>{pet.name}</strong><small>{pet.breed} · {pet.age}</small>{pet.id === activePet?.id && <b aria-hidden="true">✓ 선택됨</b>}</button>)}</div><p className="ar-pet-selection-status" aria-live="polite">현재 {activePet?.name}를 선택했어요.</p></>}
          <div className="ar-dashboard-grid">
            {session.mode === 'member-demo' && activePet && <article className="ar-dashboard-card ar-dashboard-card--pet"><span className="ar-card-label">선택한 반려동물 · 데모 프로필</span><h3>{activePet.name}</h3><dl className="ar-pet-meta"><div><dt>종류</dt><dd>{activePet.species === 'dog' ? '강아지' : '고양이'}</dd></div><div><dt>품종</dt><dd>{activePet.breed}</dd></div><div><dt>나이</dt><dd>{activePet.age}</dd></div><div><dt>성별</dt><dd>{activePet.sex}</dd></div><div><dt>중성화</dt><dd>{activePet.neutered}</dd></div></dl><small>건강 경로 입력 시 이 정보를 미리 채워요. 현재 추론 결과에는 직접 반영되지 않아요.</small><Link to="/health-check">{activePet.name}의 증상 확인하기 <span>→</span></Link></article>}
            {activeDraft ? <article className="ar-dashboard-card ar-dashboard-card--draft"><span className="ar-card-label">이어서 작성하기</span><h3>작성 중인 건강 경로가 있어요</h3><p>{session.mode === 'member-demo' ? `${activePet?.name} · ` : ''}{draftLabel(activeDraft.stage)} · {relativeDraftTime(activeDraft.updatedAt)}</p><div><Link to="/health-check">이어서 작성하기 <span>→</span></Link><Link to="/health-check" onClick={(event) => { if (!window.confirm('작성 중인 입력을 지우고 새로 시작할까요?')) event.preventDefault(); else { clearHealthDraft(session.mode === 'member-demo' ? activePet?.id : 'guest'); refreshDashboard() } }}>새로 시작</Link></div></article> : <article className="ar-dashboard-card"><span className="ar-card-label">건강 경로</span><h3>아직 작성 중인 경로가 없어요</h3><p>{session.mode === 'member-demo' ? `${activePet?.name}의 증상부터 차근차근 확인해보세요.` : '증상을 입력하면 이곳에서 이어서 작성할 수 있어요.'}</p><Link to="/health-check">증상 확인 시작하기 <span>→</span></Link></article>}
            {session.mode === 'member-demo' && <article className="ar-dashboard-card"><span className="ar-card-label">기록 저장</span><h3>저장 기능 준비 중</h3><p>실제 계정 연결 후 건강 경로와 병원 후보를 아이별로 관리할 수 있어요.</p><small>현재는 예시 화면이며 기록을 저장하지 않습니다.</small></article>}
          </div>
        </section>}

        <section id="services" className="ar-section ar-services">
          <div className="ar-section-heading">
            <div><p className="ar-eyebrow">OUR SERVICES</p><h2>필요한 순간, 다음 행동을 명확하게</h2></div>
            <p>증상을 정리하는 핵심 서비스와 진료 전후에 필요한 정보를 구분해 확인하세요.</p>
          </div>
          <div className="ar-service-grid">
            {serviceCards.map((service) => (
              <article className={`ar-service-card ar-scroll-reveal ${service.featured ? 'ar-service-card--featured' : ''}`} key={service.number}>
                <span className="ar-card-number">{service.number}</span>
                <span className="ar-service-status"><strong>{service.status}</strong><small>{service.statusNote}</small></span>
                <div className="ar-card-icon" aria-hidden="true">{service.featured ? '⌁' : service.number === '02' ? '₩' : '☼'}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={service.link}>{service.action} <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="ar-section ar-how">
          <div className="ar-how-intro">
            <p className="ar-eyebrow">HOW IT WORKS</p>
            <h2>입력한 증상이<br />건강 경로가 되는 과정</h2>
            <p>Animal-Route가 상태를 대신 진단하지 않아요. 보호자가 찾은 증상 표현을 확인한 뒤 다음 정보를 살펴봅니다.</p>
          </div>
          <ol className="ar-step-list">
            {routeSteps.map(([title, detail], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{title}</strong><p>{detail}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="ar-final-cta">
          <div className="ar-final-art" aria-hidden="true"><span>⌁</span><span>●</span><span>⌁</span></div>
          <p className="ar-eyebrow">START YOUR ROUTE</p>
          <h2>지금 보이는 증상부터<br />차근차근 확인해보세요.</h2>
          <Link to="/health-check" className="ar-primary-action">증상 확인 시작하기 <span aria-hidden="true">→</span></Link>
        </section>

        <section id="service-scope" className="ar-scope">
          <div><p className="ar-eyebrow">SERVICE SCOPE</p><h2>진단 대신, 다음에 확인할 일을 안내해요.</h2></div>
          <p>Animal-Route는 질병을 진단하거나 치료 방법을 처방하지 않습니다. 호흡 곤란·의식 저하 등 응급 신호가 있으면 결과를 기다리지 말고 가까운 동물병원에 먼저 연락하세요.</p>
        </section>
      </main>

      <footer className="ar-footer">
        <div className="ar-footer-brand"><img src={logo} alt="Animal-Route" /><p>반려동물 보호자의 다음 행동을 돕는 건강 탐색 서비스</p></div>
        <div><a href="#services">서비스</a><a href="#how-it-works">이용 방법</a><a href="#service-scope">서비스 범위</a></div>
        <p>© 2026 Animal-Route</p>
      </footer>
      {loginOpen && <LoginDialog triggerRef={loginTriggerRef} isDemoMember={session.mode === 'member-demo'} onClose={() => setLoginOpen(false)} onStartDemo={() => { startDemoSession(); setLoginOpen(false); refreshDashboard() }} onLogout={() => { endDemoSession(); setLoginOpen(false); refreshDashboard() }} />}
    </div>
  )
}
