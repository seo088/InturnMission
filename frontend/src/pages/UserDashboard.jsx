import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPetAvatar, getPetAvatarLabel } from '../assets/petAvatar'
import { clearHealthDraft, draftLabel, endDemoSession, getDashboardView, getMemberProfile, loadHealthDraft, setActivePetId } from '../demo/dashboardState'
import '../styles/my-page.css'

const history = [
  ['루비', '기침과 식욕 감소', '2026.08.02', '완료'],
  ['마루', '구토', '2026.06.11', '응급 안내'],
  ['루비', '피부 가려움', '2026.04.03', '완료'],
]

const hospitals = [
  ['햇살 동물병원', '군산시 · 2.1km', '야간 진료'],
  ['사랑 동물병원', '군산시 · 1.6km', '응급 진료'],
]

function elapsed(value) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000))
  if (minutes < 1) return '방금 전 임시저장'
  if (minutes < 60) return `${minutes}분 전 임시저장`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전 임시저장`
  return '이 브라우저 세션에 임시저장'
}

function PlusModal({ onClose, triggerRef }) {
  const closeRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const onKeyDown = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key !== 'Tab') return
      const nodes = [...(dialogRef.current?.querySelectorAll('button:not([disabled]), [href]') || [])]
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    window.requestAnimationFrame(() => closeRef.current?.focus())
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      window.requestAnimationFrame(() => triggerRef.current?.focus())
    }
  }, [onClose, triggerRef])

  return <div className="my-modal-backdrop my-plus-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section ref={dialogRef} className="my-plus-modal" role="dialog" aria-modal="true" aria-labelledby="plus-title" aria-describedby="plus-description">
      <button ref={closeRef} className="my-plus-close" type="button" aria-label="Animal-Route Plus 소개 닫기" onClick={onClose}>×</button>
      <p className="my-plus-kicker">ANIMAL-ROUTE PLUS · 본선 데모</p>
      <h2 id="plus-title">우리 아이의 건강 기록을<br />더 오래, 더 편하게 관리하세요</h2>
      <p id="plus-description">증상 확인과 응급 안내는 누구나 무료입니다. Plus는 기록·일정·저장처럼 반복 관리가 필요한 기능을 위한 옵션입니다.</p>
      <div className="my-plus-benefits">
        <article><b>01</b><div><strong>건강 기록 모아보기</strong><span>반려동물별 건강 경로와 증상 변화를 날짜별로 확인해요.</span></div></article>
        <article><b>02</b><div><strong>예방·검진·복약 일정</strong><span>필요한 일정을 등록하고 놓치지 않도록 알려드려요.</span></div></article>
        <article><b>03</b><div><strong>병원·시설 방문 준비</strong><span>자주 찾는 곳과 방문 전 확인할 내용을 저장해요.</span></div></article>
      </div>
      <div className="my-plus-price"><strong>실제 결제는 진행되지 않습니다.</strong><span>가격과 제공 범위는 출시 전 보호자 인터뷰·설문 후 확정합니다. <b>예상 월 2,900원~4,900원</b></span></div>
      <button type="button" className="my-plus-primary" onClick={onClose}>Plus 기능 미리보기</button>
      <button type="button" className="my-plus-secondary" onClick={onClose}>무료 기능 계속 이용하기</button>
      <small>의료 진단·처방 기능은 제공하지 않으며, 응급 안내는 Plus와 무관하게 누구나 이용할 수 있어요.</small>
    </section>
  </div>
}

export default function UserDashboard() {
  const nav = useNavigate()
  const [, update] = useState(0)
  const [clearTarget, setClearTarget] = useState(null)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [plusOpen, setPlusOpen] = useState(false)
  const plusTriggerRef = useRef(null)
  const { session, profiles, activePet } = getDashboardView()
  const memberProfile = getMemberProfile()
  const memberName = memberProfile.displayName.endsWith('님') ? memberProfile.displayName : `${memberProfile.displayName}님`
  const drafts = profiles.pets.map(pet => ({ pet, draft: loadHealthDraft(pet.id) })).filter(item => item.draft)
  const petNames = profiles.pets.map(pet => pet.name).join('와 ')

  const selectPet = (petId) => setActivePetId(petId)
  const openPlus = event => { plusTriggerRef.current = event.currentTarget; setPlusOpen(true) }
  const removeDraft = () => {
    if (!clearTarget) return
    clearHealthDraft(clearTarget.id)
    setClearTarget(null)
    update(value => value + 1)
  }

  if (session.mode !== 'member-demo') {
    return <main className="mypage"><section className="my-empty"><h1>내 반려동물과 건강 경로를 관리해보세요.</h1><p>로그인하면 반려동물별 작성 중인 건강 경로와 최근 기록을 한곳에서 볼 수 있어요.</p><Link to="/">로그인 또는 데모 보기</Link></section></main>
  }

  return <main className="mypage"><div className="my-shell">
    <section className="my-profile"><div className="my-avatar">{memberProfile.avatarDataUrl ? <img src={memberProfile.avatarDataUrl} alt="" /> : memberName.slice(0, 1)}</div><div><p>MY ANIMAL-ROUTE <b className="my-free-badge">Free 데모</b></p><h1>{memberName}</h1><span>{petNames}를 돌보고 있어요.</span><Link to="/account">프로필 수정</Link><button className="my-profile-plus" type="button" aria-haspopup="dialog" aria-expanded={plusOpen} onClick={openPlus}>Plus 기능 보기</button></div><div className="my-stats"><article><b>🐾</b><span>내 반려동물</span><strong>{profiles.pets.length}마리</strong></article><article><b>▣</b><span>작성 중인 경로</span><strong>{drafts.length}건</strong></article><article><b>◷</b><span>활동 시작일</span><strong>2026.05.10</strong></article></div></section>

    <div className="my-grid"><section className="my-pets"><header><h2>내 반려동물 <small>{profiles.pets.length}마리</small></h2><button type="button" disabled>+ 반려동물 추가 · 준비 중</button></header><div>{profiles.pets.map(pet => {
      const draft = loadHealthDraft(pet.id)
      return <article key={pet.id} className={pet.id === activePet?.id ? 'is-active' : ''}><i className="my-pet-avatar"><img src={getPetAvatar(pet.species)} alt={getPetAvatarLabel(pet.species)} /></i><h3>{pet.name}</h3><p>{pet.breed} · {pet.age} · {pet.sex}</p><small>{draft ? `${draftLabel(draft.stage)} · ${elapsed(draft.updatedAt)}` : '작성 중인 건강 경로가 없어요.'}</small><Link to="/health-check" onClick={() => selectPet(pet.id)}>{draft ? '이어서 작성하기' : '건강 경로 시작하기'} →</Link>{draft && <button className="my-reset-draft" type="button" onClick={() => setClearTarget(pet)}>새로 시작</button>}</article>
    })}</div></section>
      <aside className="my-draft"><h2>작성 중인 건강 경로</h2>{drafts.length ? <div className="my-draft-list">{drafts.map(({ pet, draft }) => <article className={pet.id === activePet?.id ? 'is-active' : ''} key={pet.id}><div><strong>{pet.name}</strong><span>{draftLabel(draft.stage)} 단계 · {elapsed(draft.updatedAt)}</span><div className="my-progress"><span style={{ width: `${draft.stage * 25}%` }} /></div></div><Link to="/health-check" onClick={() => selectPet(pet.id)}>이어서 작성하기 →</Link></article>)}</div> : <><p>작성 중인 건강 경로가 없어요.</p><Link to="/health-check" onClick={() => activePet && selectPet(activePet.id)}>건강 경로 시작하기 →</Link></>}<small className="my-draft-policy">초안은 이 브라우저 탭에만 임시 저장됩니다. 삭제한 초안은 복구할 수 없어요.</small></aside></div>

    <div className="my-grid my-grid--bottom"><section className="my-history"><header><h2>최근 건강 경로</h2><Link to="/my/records">전체 기록 보기 ›</Link></header>{history.map(row => <article key={row[1]}><b>{row[0]}</b><strong>{row[1]}</strong><span>{row[2]}</span><em className={row[3] === '응급 안내' ? 'urgent' : ''}>{row[3]}</em><Link className="my-history-result" to="/my/records">기록 보기 ›</Link></article>)}</section><section className="my-hospitals"><header><h2>저장한 병원</h2><span>전체 보기 ›</span></header>{hospitals.map(row => <article key={row[0]}><b>✚</b><div><strong>{row[0]}</strong><p>{row[1]} <em>{row[2]}</em></p><button type="button">전화하기</button> <button type="button">지도 보기</button></div></article>)}<small>방문 전 전화로 진료 여부를 확인해 주세요.</small></section></div>
    <section className="my-plus-section" aria-labelledby="plus-preview-title"><header><div><p>ANIMAL-ROUTE PLUS · 데모</p><h2 id="plus-preview-title">기록을 더 오래, 더 편하게 관리해요</h2><span>핵심 증상 확인과 응급 안내는 언제나 무료입니다.</span></div><button type="button" aria-haspopup="dialog" aria-expanded={plusOpen} onClick={openPlus}>Plus 전체 보기 →</button></header><div className="my-plus-grid"><article><span className="my-plus-badge">Plus</span><h3>우리 아이 건강 기록</h3><p>최근 건강 경로 3건은 무료로 보고, 전체 기록과 월별 변화는 Plus에서 모아볼 수 있어요.</p><Link to="/my/records">기록 관리 알아보기 →</Link></article><article><span className="my-plus-badge">Plus</span><h3>놓치기 쉬운 건강 일정</h3><p>예방접종·검진·복약 일정을 등록하고 필요한 시점에 알림을 받아보세요.</p><Link to="/my/schedule">일정 관리 알아보기 →</Link></article><article><span className="my-plus-badge">Plus</span><h3>저장한 병원과 시설</h3><p>자주 찾는 장소, 방문 전 체크리스트, 증상 요약을 한곳에 저장해요.</p><button type="button" onClick={openPlus}>저장 기능 알아보기 →</button></article></div><small className="my-plus-demo-note">본선 데모 화면입니다. 결제·구독·실제 알림 및 기록 저장은 아직 연결되지 않았습니다.</small></section>
    <footer className="my-shortcuts"><Link to="/health-check">작성 중인 경로<br /><b>이어서 작성하기</b></Link><Link to="/costs">진료비 참고<br /><b>방문 전 확인하기</b></Link><Link to="/pet-care">오늘의 산책<br /><b>시설 추천 보기</b></Link><Link to="/account">내 정보<br /><b>프로필 관리</b></Link></footer><section className="my-demo-session"><div><p>DEMO SESSION</p><strong>데모 로그아웃</strong><span>로그아웃해도 이 브라우저의 프로필과 초안은 남아 있을 수 있어요.</span></div><button type="button" onClick={()=>setLogoutOpen(true)}>로그아웃</button></section>
  </div>{plusOpen && <PlusModal onClose={() => setPlusOpen(false)} triggerRef={plusTriggerRef} />}{clearTarget && <div className="my-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setClearTarget(null)}><section className="my-reset-modal" role="dialog" aria-modal="true" aria-labelledby="reset-draft-title"><p className="my-modal-eyebrow">새 건강 경로 시작</p><h2 id="reset-draft-title">{clearTarget.name}의 작성 중인 내용을 지울까요?</h2><p>현재 초안은 이 브라우저 탭에만 임시 저장돼 있습니다. 지운 뒤에는 복구할 수 없어요.</p><div><button type="button" onClick={() => setClearTarget(null)}>계속 작성하기</button><button type="button" className="is-danger" onClick={removeDraft}>지우고 새로 시작</button></div></section></div>}{logoutOpen&&<div className="my-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setLogoutOpen(false)}><section className="my-reset-modal" role="dialog" aria-modal="true" aria-labelledby="logout-title"><p className="my-modal-eyebrow">DEMO SESSION</p><h2 id="logout-title">데모 로그아웃할까요?</h2><p>로그인 상태만 종료됩니다. 프로필 사진·반려동물·작성 중 초안은 이 브라우저에 남아 있을 수 있어요.</p><div><button autoFocus type="button" onClick={()=>setLogoutOpen(false)}>취소</button><button type="button" className="is-danger" onClick={()=>{endDemoSession();nav('/')}}>로그아웃</button></div></section></div>}</main>
}
