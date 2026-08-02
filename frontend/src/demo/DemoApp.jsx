import React, { useMemo, useState } from 'react'
import {
  REPRESENTATIVE_TEXT,
  assessClientSafety,
  fallbackMapping,
  fallbackResult,
  mergeLiveResult,
  requestInference,
  requestMapping,
} from './demoFlow'

const fault = new URLSearchParams(window.location.search).get('fail') || ''

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

function Stepper({ step }) {
  return (
    <ol className="stepper" aria-label="시연 진행 단계">
      {['증상 입력', '후보 확인', '진료 길찾기'].map((label, index) => (
        <li className={step >= index + 1 ? 'is-active' : ''} key={label}>
          <span>{index + 1}</span>{label}
        </li>
      ))}
    </ol>
  )
}

function SourceNotice({ mode }) {
  const fallback = mode && mode !== 'live'
  return (
    <div className={`source-notice ${fallback ? 'source-notice--fallback' : ''}`}>
      <strong>{fallback ? '검수 캐시가 함께 사용됐습니다' : '실시간 API 결과입니다'}</strong>
      <span>
        {fallback
          ? '시연 안정성을 위한 정적 결과이며 실시간 진료 가능 여부가 아닙니다.'
          : 'DS13·DS27 공공데이터와 검수 관계를 조회했습니다.'}
      </span>
    </div>
  )
}

export default function DemoApp() {
  const [step, setStep] = useState(1)
  const [text, setText] = useState(REPRESENTATIVE_TEXT)
  const [status, setStatus] = useState('idle')
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('')
  const [sourceMode, setSourceMode] = useState(null)
  const clientSafety = useMemo(() => assessClientSafety(text), [text])

  const reset = () => {
    setStep(1)
    setStatus('idle')
    setCandidates([])
    setSelected(null)
    setResult(null)
    setMessage('')
    setSourceMode(null)
  }

  const findCandidates = async () => {
    setMessage('')
    const safety = assessClientSafety(text)
    if (safety.blocked) {
      setStatus('blocked')
      setMessage(safety.warning)
      setCandidates([])
      return
    }
    setStatus('mapping')
    try {
      const response = await requestMapping(text, fault)
      if (response.safety?.recommendation_blocked) {
        setStatus('blocked')
        setMessage(response.warning)
        return
      }
      if (!response.candidates?.length) {
        setStatus('error')
        setMessage('표준 증상 후보를 찾지 못했습니다. 표현을 더 구체적으로 입력해 주세요.')
        return
      }
      setCandidates(response.candidates)
      setSourceMode('live')
      setStep(2)
      setStatus('completed')
    } catch (error) {
      const cached = fallbackMapping(text)
      if (!cached) {
        setStatus('error')
        setMessage('현재 매핑 API를 사용할 수 없습니다. 대표 기침 문장만 검수 캐시로 시연할 수 있습니다.')
        return
      }
      setCandidates(cached.candidates)
      setSourceMode('mapper_fallback')
      setStep(2)
      setStatus('fallback')
      setMessage(cached.fallback_reason)
    }
  }

  const confirmCandidate = async (candidate) => {
    setSelected(candidate)
    setStatus('retrieving')
    setMessage('')
    try {
      const live = await requestInference(text, candidate.code, fault)
      if (live.safety?.recommendation_blocked) {
        setStatus('blocked')
        setMessage(live.warning)
        setStep(1)
        return
      }
      const merged = mergeLiveResult(live)
      setResult(merged)
      setSourceMode(merged.source_mode)
      setStatus(merged.fallback_used ? 'fallback' : 'completed')
      setStep(3)
    } catch (error) {
      if (!fallbackMapping(text)) {
        setStatus('error')
        setMessage('질병 관계를 조회하지 못했습니다. 임의의 결과는 만들지 않습니다.')
        return
      }
      const cached = fallbackResult()
      setResult(cached)
      setSourceMode(cached.source_mode)
      setStatus('fallback')
      setMessage(cached.fallback_reason)
      setStep(3)
    }
  }

  return (
    <main className="demo-shell">
      <header className="hero">
        <div className="brand"><span>ANIMALLOO</span> 증상 길찾기</div>
        <h1>보호자 표현에서<br />진료 확인까지</h1>
        <p>공공데이터와 사람 검수 관계로 다음 행동을 찾는 모바일 시연입니다.</p>
      </header>

      <Stepper step={step} />

      {step === 1 && (
        <section className="panel" aria-labelledby="input-title">
          <div className="eyebrow">STEP 1</div>
          <h2 id="input-title">지금 보이는 증상을 적어주세요</h2>
          <label className="input-label" htmlFor="symptom-text">보호자 표현</label>
          <textarea
            id="symptom-text"
            value={text}
            onChange={(event) => { setText(event.target.value); setMessage('') }}
            rows={5}
            placeholder="예: 짖고 나면 쿨럭거리는 기침을 해요"
          />
          <div className="helper-row">
            <span>로그인 없이 바로 시연</span>
            <button type="button" className="text-button" onClick={() => setText(REPRESENTATIVE_TEXT)}>
              대표 문장 채우기
            </button>
          </div>
          {clientSafety.blocked && <div className="alert alert--urgent">{clientSafety.warning}</div>}
          {message && <div className={`alert alert--${status}`}>{message}</div>}
          <button
            type="button"
            className="primary-action"
            disabled={!text.trim() || status === 'mapping'}
            onClick={findCandidates}
          >
            {status === 'mapping' ? '응급 신호부터 확인 중…' : '증상 후보 찾기'}
          </button>
          <p className="safety-copy">응급 표현은 질병·일반 병원 추천보다 먼저 차단합니다.</p>
        </section>
      )}

      {step === 2 && (
        <section className="panel" aria-labelledby="candidate-title">
          <div className="eyebrow">STEP 2</div>
          <h2 id="candidate-title">가장 가까운 표준 증상을 확인하세요</h2>
          <p className="section-copy">AI가 진단한 결과가 아니라 DS13 표준 증상 검색 후보입니다.</p>
          <SourceNotice mode={sourceMode} />
          {message && <div className="alert alert--fallback">{message}</div>}
          <div className="candidate-list">
            {candidates.map((candidate) => (
              <button
                type="button"
                className="candidate-card"
                key={candidate.code}
                onClick={() => confirmCandidate(candidate)}
                disabled={status === 'retrieving'}
              >
                <span className="candidate-rank">{candidate.rank}</span>
                <span className="candidate-main">
                  <strong>{candidate.label}</strong>
                  <small>{candidate.code} · {candidate.category}</small>
                  <small>일치 근거: {candidate.matched_term || '표준 표현 유사도'}</small>
                </span>
                <Badge tone={candidate.confidence === 'high' ? 'good' : 'neutral'}>
                  {candidate.confidence === 'high' ? '높은 일치' : '확인 필요'}
                </Badge>
              </button>
            ))}
          </div>
          {status === 'retrieving' && <div className="loading-line">지식그래프 관계를 조회하고 있어요…</div>}
          <button type="button" className="secondary-action" onClick={reset}>다시 입력</button>
        </section>
      )}

      {step === 3 && result && (
        <section className="result-stack" aria-labelledby="result-title">
          <div className="panel result-hero">
            <div className="eyebrow">STEP 3</div>
            <h2 id="result-title">{selected?.label || '기침'} 진료 길찾기</h2>
            <p>{result.medical_disclaimer}</p>
            <SourceNotice mode={sourceMode} />
          </div>

          <section className="panel">
            <div className="section-heading">
              <h3>가능성 후보</h3><Badge>진단 확률 없음</Badge>
            </div>
            <div className="disease-list">
              {result.diseases.map((disease) => (
                <article key={disease.uri} className="disease-card">
                  <span className="order">{disease.display_priority || '–'}</span>
                  <div>
                    <strong>{disease.name}</strong>
                    <p>{disease.department || '진료 문의 분야 미확정 — 병원에 증상 진료 가능 여부를 전화로 확인하세요.'}</p>
                    <small>신뢰도: 미평가 · 검수일 {String(disease.reviewed_at || '2026-07-28').slice(0, 10)}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <h3>군산 병원 전화 확인</h3><Badge tone="warn">역량 미확인</Badge>
            </div>
            <p className="section-copy">거리·의료 품질 순위가 아닙니다. 전화번호가 확인된 공공등록 병원 후보입니다.</p>
            <div className="hospital-list">
              {result.hospitals.map((hospital) => (
                <article className="hospital-card" key={hospital.facility_id}>
                  <div>
                    <strong>{hospital.name}</strong>
                    <p>24시간 · 응급 · 호흡기 진료 · 현재 접수: <b>미확인</b></p>
                    <small>전화번호 확인일 {hospital.phone_verified_at.slice(0, 10)}</small>
                  </div>
                  <a href={`tel:${hospital.phone}`} aria-label={`${hospital.name} ${hospital.phone} 전화`}>
                    {hospital.phone}<span>전화 확인</span>
                  </a>
                </article>
              ))}
            </div>
          </section>

          <details className="panel evidence">
            <summary>근거와 데이터 출처 보기</summary>
            <ul>
              <li>DS13 전국 동물질병 증상 공공데이터: i012 기침</li>
              <li>DS14 사람 검수 자연어 매핑: 대표 기침 표현 승인</li>
              <li>DS27 질병–증상 assertion: 관계당 독립 트리플</li>
              <li>전국 동물병원 공공데이터 + 사용자 전화번호 확인</li>
              <li>AI 전체 평가: 일반화 성능 미달로 HOLD, 대표 시연 범위만 사용</li>
            </ul>
          </details>

          <button type="button" className="primary-action" onClick={reset}>처음부터 다시</button>
        </section>
      )}
    </main>
  )
}
