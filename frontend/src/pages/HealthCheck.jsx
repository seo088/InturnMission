import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/animal-route-logo.png'
import { getPetAvatar, getPetAvatarLabel } from '../assets/petAvatar'
import {
  REPRESENTATIVE_TEXT,
  assessClientSafety,
  fallbackMapping,
  fallbackResult,
  mergeLiveResult,
  requestInference,
  requestMapping,
} from '../demo/demoFlow'
import { clearHealthDraft, getActivePet, getDashboardSession, getDraftOwner, loadHealthDraft, saveHealthDraft } from '../demo/dashboardState'
import '../styles/health-check.css'

const INITIAL = {
  pet: { species: 'dog', breed: '', age: '', sex: '', neutered: '', region: '군산' },
  symptom: '',
  followups: { onset: '', appetite: '', water: '', vomiting: '', diarrhea: '', breathing: '', consciousness: '' },
  privacy: false,
  disclaimer: false,
}

function loadDraft() {
  const owner = getDraftOwner()
  const saved = loadHealthDraft(owner)
  const pet = getDashboardSession().mode === 'member-demo' ? getActivePet() : null
  const profile = pet ? { species: pet.species, breed: pet.breed, age: pet.age, sex: pet.sex, neutered: pet.neutered, region: pet.region } : INITIAL.pet
  return saved?.data ? { ...INITIAL, ...saved.data, pet: { ...profile, ...saved.data.pet }, followups: { ...INITIAL.followups, ...saved.data.followups } } : { ...INITIAL, pet: profile }
}

const followupGroups = [
  ['onset', '증상 시작', ['오늘', '2~3일 전', '일주일 이상', '모름']],
  ['appetite', '식욕 변화', ['감소', '변화 없음', '증가', '모름']],
  ['water', '음수량 변화', ['감소', '변화 없음', '증가', '모름']],
  ['vomiting', '구토', ['있음', '없음', '모름']],
  ['diarrhea', '설사', ['있음', '없음', '모름']],
  ['breathing', '호흡 상태', ['평소와 같음', '힘들어 보임', '모름']],
  ['consciousness', '의식 상태', ['평소와 같음', '처져 있음', '의식이 흐림', '모름']],
]
const primaryFollowupKeys = new Set(['onset', 'appetite', 'vomiting', 'breathing'])

function Stepper({ step, onStepClick, availableSteps }) {
  return <ol className="hc-stepper" aria-label="건강 경로 진행 단계">{['반려동물', '증상 입력', '사용자 확인', '건강 경로'].map((label, index) => { const target = index + 1; const enabled = availableSteps.includes(target); return <li className={step >= target ? 'is-active' : ''} key={label}><button type="button" disabled={!enabled} aria-current={step === target ? 'step' : undefined} aria-label={`${label} 단계로 이동`} onClick={() => onStepClick(target)}><span>{step > target ? '✓' : target}</span><small>{label}</small></button></li> })}</ol>
}

function SafetyNotice({ urgent = false, children }) {
  return <div className={`hc-safety ${urgent ? 'hc-safety--urgent' : ''}`}><strong>{urgent ? '즉시 확인이 필요할 수 있어요' : '안내'}</strong><p>{children}</p></div>
}

export default function HealthCheck() {
  const [step, setStep] = useState(() => loadHealthDraft()?.stage ?? 1)
  const [draft, setDraft] = useState(loadDraft)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [sourceMode, setSourceMode] = useState('')
  const [showExtraQuestions, setShowExtraQuestions] = useState(false)
  const [isQuestionSheetOpen, setIsQuestionSheetOpen] = useState(false)
  const [selectedExampleTexts, setSelectedExampleTexts] = useState([])
  const firstErrorRef = useRef(null)
  const questionSheetTriggerRef = useRef(null)
  const questionSheetCloseRef = useRef(null)
  const draftOwnerRef = useRef(getDraftOwner())
  const safety = useMemo(() => assessClientSafety(draft.symptom), [draft.symptom])
  const urgentFollowup = draft.followups.breathing === '힘들어 보임' || draft.followups.consciousness === '의식이 흐림'
  const urgent = safety.blocked || urgentFollowup
  const urgentSignals = [safety.blocked && '응급 표현 감지', draft.followups.breathing === '힘들어 보임' && '호흡 이상', draft.followups.consciousness === '의식이 흐림' && '의식 저하'].filter(Boolean)
  const answeredPrimaryFollowups = [...primaryFollowupKeys].filter(key => Boolean(draft.followups[key])).length

  useEffect(() => {
    saveHealthDraft({ owner: draftOwnerRef.current, stage: step, data: draft })
  }, [draft, step])

  useEffect(() => { firstErrorRef.current?.focus(); firstErrorRef.current = null }, [errors])

  useEffect(() => {
    if (!isQuestionSheetOpen) return undefined
    const previousOverflow = document.body.style.overflow
    const focusableSelector = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const onKeyDown = event => {
      if (event.key === 'Escape') { event.preventDefault(); setIsQuestionSheetOpen(false); return }
      if (event.key !== 'Tab') return
      const focusable = [...document.querySelectorAll('.hc-question-sheet ' + focusableSelector)]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    window.requestAnimationFrame(() => questionSheetCloseRef.current?.focus())
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown); window.requestAnimationFrame(() => questionSheetTriggerRef.current?.focus()) }
  }, [isQuestionSheetOpen])

  const updatePet = (key, value) => setDraft(current => ({ ...current, pet: { ...current.pet, [key]: value } }))
  const updateFollowup = (key, value) => setDraft(current => ({ ...current, followups: { ...current.followups, [key]: value } }))

  const validatePet = () => {
    const next = {}
    if (!draft.pet.species) next.species = '개 또는 고양이를 선택해주세요.'
    if (!draft.pet.region.trim()) next.region = '병원 후보를 찾을 지역을 입력해주세요.'
    setErrors(next)
    return !Object.keys(next).length
  }

  const toSymptoms = () => { if (validatePet()) { setErrors({}); setStep(2); window.scrollTo(0, 0) } }

  const findCandidates = async () => {
    if (!draft.symptom.trim()) { setErrors({ symptom: '관찰한 증상을 한 문장 이상 입력해주세요.' }); return }
    if (urgent) { setStatus('urgent'); setStep(2); window.scrollTo(0, 0); return }
    setErrors({}); setStatus('mapping'); setMessage('')
    try {
      const response = await requestMapping(draft.symptom)
      if (response.safety?.recommendation_blocked) { setStatus('urgent'); return }
      if (!response.candidates?.length) throw new Error('empty')
      setCandidates(response.candidates); setSourceMode('live'); setStep(3); setStatus('idle')
    } catch {
      const fallback = fallbackMapping(draft.symptom)
      if (!fallback) { setStatus('error'); setMessage('표준 증상 후보를 찾지 못했습니다. 관찰한 행동을 조금 더 구체적으로 적어주세요.'); return }
      setCandidates(fallback.candidates); setSourceMode('reviewed-cache'); setMessage(fallback.fallback_reason); setStep(3); setStatus('idle')
    }
    window.scrollTo(0, 0)
  }

  const getResult = async () => {
    if (!selected) { setErrors({ candidate: '내 반려동물에게 해당하는 표준 증상 후보를 선택해주세요.' }); return }
    if (!draft.privacy || !draft.disclaimer) { setErrors({ consent: '개인정보 처리와 의료 면책 안내를 각각 확인해주세요.' }); return }
    setErrors({}); setStatus('retrieving'); setMessage('')
    try {
      const live = await requestInference(draft.symptom, selected.code)
      if (live.safety?.recommendation_blocked) { setStatus('urgent'); setStep(2); return }
      const merged = mergeLiveResult(live); setResult(merged); setSourceMode(merged.source_mode)
    } catch {
      const cached = fallbackResult(); setResult(cached); setSourceMode(cached.source_mode); setMessage(cached.fallback_reason)
    }
    setStatus('idle'); setStep(4); window.scrollTo(0, 0)
  }

  const reset = () => { clearHealthDraft(draftOwnerRef.current); setDraft(loadDraft()); setStep(1); setCandidates([]); setSelected(null); setResult(null); setErrors({}); setMessage(''); setStatus('idle'); setIsQuestionSheetOpen(false); setSelectedExampleTexts([]); window.scrollTo(0, 0) }

  return <div className="hc-page">
    <header className="hc-header"><Link to="/" className="hc-brand"><img src={logo} alt="Animal-Route" /></Link><div><span>입력 내용은 이 브라우저 세션에 임시 저장됩니다</span><button type="button" onClick={reset}>입력 지우기</button></div></header>
    <main className="hc-shell">
      <div className="hc-top"><Link to={step === 1 ? '/' : '#'} onClick={event => { if (step > 1) { event.preventDefault(); setStep(current => Math.max(1, current - 1)); window.scrollTo(0, 0) } }} className="hc-back">← {step === 1 ? '홈' : '이전 단계'}</Link><Stepper step={step} availableSteps={[1, 2, ...(candidates.length ? [3] : []), ...(result ? [4] : [])]} onStepClick={target => { setStep(target); window.scrollTo(0, 0) }} /></div>

      {step === 1 && <section className="hc-content hc-content--split hc-enter">
        <div className="hc-intro"><p className="hc-eyebrow">STEP 1 · PET PROFILE</p><h1>어떤 반려동물의<br />건강 경로를 찾을까요?</h1><p>현재 서비스는 개와 고양이를 대상으로 합니다. 품종·나이 등은 상황을 정리하기 위한 참고 정보이며 현재 추론 정확도에는 직접 반영되지 않습니다.</p><SafetyNotice>병원 후보를 찾기 위해 지역만 필수로 받습니다. 정확한 위치 권한은 요청하지 않습니다.</SafetyNotice></div>
        <form className="hc-form" onSubmit={event => { event.preventDefault(); toSymptoms() }}>
          <fieldset><legend>반려동물 종류 <em>필수</em></legend><div className="hc-segment">{[['dog','강아지'],['cat','고양이']].map(([value,label]) => <button type="button" className={draft.pet.species === value ? 'selected' : ''} onClick={() => updatePet('species', value)} key={value}>{label}</button>)}</div>{errors.species && <p className="hc-error" tabIndex="-1" ref={node => { if (node && !firstErrorRef.current) firstErrorRef.current = node }}>{errors.species}</p>}</fieldset>
          <label>현재 지역 <em>필수</em><input value={draft.pet.region} onChange={event => updatePet('region', event.target.value)} placeholder="예: 군산" />{errors.region && <p className="hc-error" tabIndex="-1" ref={node => { if (node && !firstErrorRef.current) firstErrorRef.current = node }}>{errors.region}</p>}</label>
          <details className="hc-optional-profile"><summary>품종·나이 등 추가 정보 입력 <span>선택</span></summary><div className="hc-fields"><label>품종<input value={draft.pet.breed} onChange={event => updatePet('breed', event.target.value)} placeholder="예: 말티즈, 코리안숏헤어" /></label><label>나이<input value={draft.pet.age} onChange={event => updatePet('age', event.target.value)} placeholder="예: 5살 또는 모름" /></label></div><div className="hc-fields"><label>성별<select value={draft.pet.sex} onChange={event => updatePet('sex', event.target.value)}><option value="">선택해주세요</option><option>수컷</option><option>암컷</option><option>모름</option></select></label><label>중성화 여부<select value={draft.pet.neutered} onChange={event => updatePet('neutered', event.target.value)}><option value="">선택해주세요</option><option>완료</option><option>하지 않음</option><option>모름</option></select></label></div></details>
          <button className="hc-primary" type="submit">증상 입력하기 <span>→</span></button>
        </form>
      </section>}

      {step === 2 && <section className="hc-content hc-enter hc-symptom-step">
        {status === 'urgent' ? <div className="hc-urgent"><span>!</span><p className="hc-eyebrow">SAFETY FIRST</p><h1>즉시 확인이 필요할 수 있어요.</h1><p>{safety.warning || '호흡이 힘들거나 의식이 흐린 상태는 일반 건강 정보보다 빠른 확인이 중요합니다.'}</p><section className="hc-urgent-input"><small>입력하신 내용</small><blockquote>“{draft.symptom || '추가 질문에서 위험 신호가 확인됐어요.'}”</blockquote></section><section className="hc-urgent-signals"><small>응급으로 우선 안내한 신호</small><div>{urgentSignals.map(signal => <span key={signal}>{signal}</span>)}</div></section><section className="hc-urgent-actions"><small>지금 할 일</small><ol><li><b>1</b><div><strong>가까운 동물병원 찾기</strong><p>응급·야간 진료 가능 여부를 전화로 먼저 확인해 주세요.</p></div></li><li><b>2</b><div><strong>상태를 계속 관찰하기</strong><p>호흡과 의식 상태가 변하는지 확인해 주세요.</p></div></li><li><b>3</b><div><strong>일반 건강 경로는 나중에</strong><p>응급 확인 뒤 증상 정리와 병원 문의에 이용할 수 있어요.</p></div></li></ol></section><div><a href="https://map.naver.com/p/search/%EB%8F%99%EB%AC%BC%EB%B3%91%EC%9B%90" target="_blank" rel="noreferrer" className="hc-primary">가까운 동물병원 찾기</a><button type="button" className="hc-secondary" onClick={() => setStatus('idle')}>입력 내용 수정하기</button></div><SafetyNotice urgent>이 화면은 진단이나 처방이 아닙니다. 응급·24시간 진료 가능 여부는 반드시 전화로 확인해주세요.</SafetyNotice></div> : <>
          <div className="hc-question-heading"><div><p className="hc-eyebrow">STEP 2 · SYMPTOM</p><h1>지금 보이는 증상을 알려주세요.</h1><p>진단명보다 보호자가 직접 관찰한 행동과 변화를 적어주세요.</p></div><div className="hc-pet-summary"><span className="hc-pet-avatar"><img src={getPetAvatar(draft.pet.species)} alt={getPetAvatarLabel(draft.pet.species)} /></span><div><strong>{draft.pet.species === 'dog' ? '강아지' : '고양이'}</strong><span>{draft.pet.breed || '품종 모름'} · {draft.pet.age || '나이 모름'} · {draft.pet.region}</span></div></div></div>
          <div className="hc-symptom-panel"><label className="hc-symptom-input"><span className="hc-input-label">자연어 증상</span><span className="hc-input-helper">증상 정리 도우미</span><textarea value={draft.symptom} onChange={event => { setDraft(current => ({ ...current, symptom: event.target.value })); setSelectedExampleTexts([]); setStatus('idle'); setMessage('') }} maxLength="300" rows="5" placeholder="예: 강아지가 기침을 하고, 밥을 잘 먹지 않아요. 어제부터 토를 2번 했어요." /><span className="hc-input-count">{draft.symptom.length}/300</span></label><p className="hc-writing-tip"><span aria-hidden="true">●</span> 언제부터, 얼마나 자주, 어떤 상황에서 나타나는지 자세히 적어주세요.</p><div className="hc-example-group"><strong>검수된 대표 기침 문장 사용하기</strong><div>{['기침을 하고 있어요', '토를 했어요', '설사를 하고 있어요', '식욕이 없어요', '호흡이 가빠 보여요', '피부를 긁어요', '눈이나 코 분비물이 있어요', '이상한 행동을 해요'].map(text => <button type="button" className={`hc-example ${selectedExampleTexts.includes(text) ? 'selected' : ''}`} aria-pressed={selectedExampleTexts.includes(text)} onClick={() => { setSelectedExampleTexts(current => current.includes(text) ? current.filter(value => value !== text) : [...current, text]); setDraft(current => ({ ...current, symptom: current.symptom.includes(text) ? current.symptom.replace(text, '').replace(/\s{2,}/g, ' ').trim() : current.symptom ? `${current.symptom} ${text}` : text })) }} key={text}>{text} <span aria-hidden="true">+</span></button>)}</div></div>{errors.symptom && <p className="hc-error" tabIndex="-1" ref={firstErrorRef}>{errors.symptom}</p>}{status === 'error' && <p className="hc-error" role="alert">{message}</p>}</div>
          {safety.blocked && <SafetyNotice urgent>응급 신호가 의심돼요. 일반 건강 경로 대신 가까운 동물병원에 먼저 전화해 주세요.</SafetyNotice>}
          <div className="hc-followups hc-followups--desktop"><div><h2>추가로 확인할 수 있나요?</h2><p>병원에 상황을 설명하는 데 도움이 되는 선택 정보예요. 모르면 건너뛰어도 됩니다.</p></div><div>{followupGroups.filter(([key]) => primaryFollowupKeys.has(key)).map(([key,label,options]) => <fieldset className="hc-followup-row" data-key={key} key={key}><legend>{label}</legend><div>{options.map(option => <button type="button" className={draft.followups[key] === option ? 'selected' : ''} onClick={() => updateFollowup(key, draft.followups[key] === option ? '' : option)} key={option}>{option}</button>)}</div></fieldset>)}<button className="hc-more-questions" type="button" aria-expanded={showExtraQuestions} onClick={() => setShowExtraQuestions(value => !value)}>{showExtraQuestions ? '추가 질문 접기' : '더 확인할 내용 보기'} {showExtraQuestions ? '↑' : '↓'}</button>{showExtraQuestions && followupGroups.filter(([key]) => !primaryFollowupKeys.has(key)).map(([key,label,options]) => <fieldset className="hc-followup-row" data-key={key} key={key}><legend>{label}</legend><div>{options.map(option => <button type="button" className={draft.followups[key] === option ? 'selected' : ''} onClick={() => updateFollowup(key, draft.followups[key] === option ? '' : option)} key={option}>{option}</button>)}</div></fieldset>)}</div></div>
          <button ref={questionSheetTriggerRef} type="button" className="hc-question-sheet-trigger" aria-expanded={isQuestionSheetOpen} aria-controls="health-check-question-sheet" onClick={() => setIsQuestionSheetOpen(true)}><span><strong>추가로 확인할 수 있나요?</strong><small>병원에 설명할 때 도움이 되는 선택 정보예요.</small></span><b>{answeredPrimaryFollowups}/4 확인 <i aria-hidden="true">→</i></b></button>
          {isQuestionSheetOpen && <div className="hc-question-sheet-backdrop" onMouseDown={() => setIsQuestionSheetOpen(false)}><section id="health-check-question-sheet" className="hc-question-sheet" role="dialog" aria-modal="true" aria-labelledby="health-check-question-sheet-title" onMouseDown={event => event.stopPropagation()}><div className="hc-question-sheet__header"><div><p>추가 확인</p><h2 id="health-check-question-sheet-title">병원에 설명할 내용을 정리해요</h2><span>기본 질문 {answeredPrimaryFollowups}/4개를 확인했어요.</span></div><button ref={questionSheetCloseRef} type="button" aria-label="추가 확인 닫기" onClick={() => setIsQuestionSheetOpen(false)}>×</button></div><div className="hc-question-sheet__body">{followupGroups.filter(([key]) => primaryFollowupKeys.has(key)).map(([key,label,options]) => <fieldset className="hc-followup-row" data-key={key} key={key}><legend>{label}</legend><div>{options.map(option => <button type="button" className={draft.followups[key] === option ? 'selected' : ''} onClick={() => updateFollowup(key, draft.followups[key] === option ? '' : option)} key={option}>{option}</button>)}</div></fieldset>)}<button className="hc-more-questions" type="button" aria-expanded={showExtraQuestions} onClick={() => setShowExtraQuestions(value => !value)}>{showExtraQuestions ? '추가 질문 접기' : '더 확인할 내용 보기'} <span>{showExtraQuestions ? '↑' : '↓'}</span></button>{showExtraQuestions && followupGroups.filter(([key]) => !primaryFollowupKeys.has(key)).map(([key,label,options]) => <fieldset className="hc-followup-row" data-key={key} key={key}><legend>{label}</legend><div>{options.map(option => <button type="button" className={draft.followups[key] === option ? 'selected' : ''} onClick={() => updateFollowup(key, draft.followups[key] === option ? '' : option)} key={option}>{option}</button>)}</div></fieldset>)}</div><button type="button" className="hc-primary hc-question-sheet__done" onClick={() => setIsQuestionSheetOpen(false)}>확인했어요</button></section></div>}
          <div className="hc-submit-row"><SafetyNotice urgent={urgent}>응급 표현과 호흡·의식 위험 답변은 일반 결과보다 먼저 차단합니다.</SafetyNotice><button type="button" className="hc-primary" disabled={status === 'mapping'} onClick={findCandidates}>{status === 'mapping' ? '표준 증상 후보를 찾는 중…' : urgent ? '응급 안내 확인하기 →' : '표준 증상 후보 확인하기 →'}</button></div>
        </>}
      </section>}

      {step === 3 && <section className="hc-content hc-enter">
        <div className="hc-question-heading"><div><p className="hc-eyebrow">STEP 3 · USER CONFIRMATION</p><h1>시스템이 찾은 표현을<br />직접 확인해주세요.</h1><p>아래 항목은 진단이 아니라 표준 증상 검색 후보입니다.</p></div><div className="hc-source"><strong>{sourceMode === 'live' ? '연결된 데이터 조회' : '검수된 데모 정보'}</strong><span>{message || '공개 증상 분류와 확인된 연결 정보를 사용했습니다.'}</span></div></div>
        <div className="hc-compare"><article><small>내가 입력한 표현</small><blockquote>“{draft.symptom}”</blockquote><button type="button" className="hc-none" onClick={() => setStep(2)}>표현 수정하기</button></article><span>→</span><article><small>확인할 표준 증상 후보</small><div className="hc-candidates">{candidates.map(candidate => <button type="button" aria-pressed={selected?.code === candidate.code} className={selected?.code === candidate.code ? 'selected' : ''} onClick={() => setSelected(candidate)} key={candidate.code}><span>{selected?.code === candidate.code ? '✓' : candidate.rank}</span><strong>{candidate.label}</strong><small>입력하신 내용과 가까운 표현이에요.</small></button>)}</div><button type="button" className="hc-none" onClick={() => { setSelected(null); setStep(2) }}>해당하는 후보가 없어요</button></article></div>
        {errors.candidate && <p className="hc-error" tabIndex="-1" ref={firstErrorRef}>{errors.candidate}</p>}
        <div className="hc-consents"><label><input type="checkbox" checked={draft.privacy} onChange={event => setDraft(current => ({ ...current, privacy: event.target.checked }))} /><span><strong>개인정보 수집·이용 동의</strong><small>입력한 증상과 위치 정보를 결과 제공에 일시적으로 사용하는 데 동의합니다. 데모에서는 서버 계정에 저장하지 않습니다.</small></span></label><label><input type="checkbox" checked={draft.disclaimer} onChange={event => setDraft(current => ({ ...current, disclaimer: event.target.checked }))} /><span><strong>의료 면책 안내 확인</strong><small>결과는 진단·처방·질병 발생 확률이 아니며 병원 문의를 돕는 탐색 정보입니다.</small></span></label></div>
        {errors.consent && <p className="hc-error" role="alert">{errors.consent}</p>}
        <div className="hc-submit-row"><SafetyNotice>선택한 표준 증상과 데이터상 연결된 정보만 조회합니다.</SafetyNotice><button type="button" className="hc-primary" disabled={status === 'retrieving'} onClick={getResult}>{status === 'retrieving' ? '건강 경로를 조회하는 중…' : '건강 경로 확인하기 →'}</button></div>
      </section>}

      {step === 4 && result && <section className="hc-content hc-enter">
        <div className="hc-result-heading"><p className="hc-eyebrow">STEP 4 · HEALTH ROUTE</p><h1>입력한 증상에서<br />다음 확인 정보까지 연결했어요.</h1><p>{result.medical_disclaimer}</p>{message && <span>{message}</span>}</div>
        <div className="hc-route-summary"><article><small>보호자 표현</small><strong>{draft.symptom}</strong></article><span>→</span><article><small>내가 확인한 증상</small><strong>{selected?.label}</strong></article><span>→</span><article><small>지역 병원 후보</small><strong>{draft.pet.region}</strong></article></div>
        <section className="hc-result-section"><div><p className="hc-eyebrow">CONNECTED INFORMATION</p><h2>이 증상과 데이터상 연결된 질병 정보</h2><p>발생 가능성이나 우선순위가 아니며 연결 근거가 있는 정보만 표시합니다.</p></div><div className="hc-disease-list">{result.diseases.map(disease => <details key={disease.uri || disease.name}><summary><strong>{disease.name}</strong><span>근거 보기 ＋</span></summary><p>{disease.department}</p><small>{disease.source} · 신뢰도/발생 확률 미평가</small></details>)}</div></section>
        <section className="hc-result-section"><div><p className="hc-eyebrow">HOSPITAL CANDIDATES</p><h2>{draft.pet.region} 동물병원 후보</h2><p>거리·진료 품질 순위가 아닙니다. 현재 진료 가능 여부는 전화로 확인해주세요.</p></div><div className="hc-hospital-list">{result.hospitals.map(hospital => <article key={hospital.facility_id}><div><strong>{hospital.name}</strong><p>공공등록 병원 · 전화번호 확인</p><small>응급·24시간·전문진료·현재 접수 가능 여부 미확인</small></div><a href={`tel:${hospital.phone}`}>전화하기 <span>{hospital.phone}</span></a></article>)}</div></section>
        <div className="hc-result-actions"><button type="button" className="hc-secondary" onClick={() => setStep(3)}>표준 증상 다시 확인</button><button type="button" className="hc-primary" onClick={reset}>새로운 건강 경로 시작</button></div>
      </section>}
    </main>
  </div>
}
