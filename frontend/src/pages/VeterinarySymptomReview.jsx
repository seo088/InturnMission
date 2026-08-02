import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createSymptomReviewDecision,
  fetchSymptomReviewQueue,
  fetchSymptomReviewStats,
} from '../api'

const REVIEWER_KEY = 'petgraph.vet-review.reviewer-id'

const OPTIONS = {
  clinical_validity: [
    ['valid', '유효한 증상'], ['invalid', '증상 아님'], ['unsure', '판단 보류'],
  ],
  species: [
    ['dog', '개'], ['cat', '고양이'], ['both', '개·고양이'], ['unsure', '판단 보류'],
  ],
  owner_observable: [
    ['yes', '보호자가 관찰 가능'], ['no', '검사 필요'], ['unsure', '판단 보류'],
  ],
  urgency: [
    ['emergency', '즉시 진료 안내'], ['urgent', '빠른 진료 안내'],
    ['routine', '일반 관찰·상담'], ['unsure', '판단 보류'],
  ],
}

const FOLLOWUPS = [
  ['onset', '시작 시점'], ['duration', '지속 시간'], ['frequency', '발생 횟수'],
  ['appetite', '식욕 변화'], ['water', '음수량 변화'], ['vomiting', '구토'],
  ['diarrhea', '설사'], ['breathing', '호흡 상태'], ['consciousness', '의식 상태'],
  ['urination', '배뇨 상태'], ['bleeding', '출혈'], ['toxin_exposure', '독성물질 노출'],
]

const emptyAnswers = () => ({
  clinical_validity: '',
  species: '',
  owner_observable: '',
  urgency: '',
  followup_question_ids: [],
  selected_symptom_codes: [],
})

function ChoiceGroup({ title, description, value, options, onChange }) {
  return (
    <section style={styles.question}>
      <h3 style={styles.questionTitle}>{title}</h3>
      {description && <p style={styles.help}>{description}</p>}
      <div style={styles.choices}>
        {options.map(([key, label]) => (
          <button key={key} type="button" onClick={() => onChange(key)}
            aria-pressed={value === key} style={choiceStyle(value === key)}>
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}

function newIdempotencyKey(reviewId) {
  if (globalThis.crypto?.randomUUID) return `${reviewId}-${globalThis.crypto.randomUUID()}`
  return `${reviewId}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function VeterinarySymptomReview() {
  const [reviewerId, setReviewerId] = useState(() => localStorage.getItem(REVIEWER_KEY) || '')
  const [draftReviewerId, setDraftReviewerId] = useState(() => localStorage.getItem(REVIEWER_KEY) || '')
  const [item, setItem] = useState(null)
  const [stats, setStats] = useState(null)
  const [answers, setAnswers] = useState(emptyAnswers)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [queue, currentStats] = await Promise.all([
        fetchSymptomReviewQueue({ status: 'pending', limit: 1 }),
        fetchSymptomReviewStats(),
      ])
      setItem(queue.data?.[0] || null)
      setStats(currentStats)
      setAnswers(emptyAnswers())
    } catch (requestError) {
      setError(requestError.response?.data?.detail || '검수 대기열을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const codes = useMemo(() => {
    if (!item) return []
    return [...new Set([item.ds13_code, ...(item.collision_codes || '').split('|')].filter(Boolean))]
  }, [item])

  const approvalReady = Boolean(
    reviewerId && answers.clinical_validity === 'valid'
    && answers.species && answers.species !== 'unsure'
    && answers.owner_observable && answers.owner_observable !== 'unsure'
    && answers.urgency && answers.urgency !== 'unsure'
    && answers.selected_symptom_codes.length,
  )

  const setAnswer = (field, value) => setAnswers(current => ({ ...current, [field]: value }))
  const toggleList = (field, value) => setAnswers(current => ({
    ...current,
    [field]: current[field].includes(value)
      ? current[field].filter(entry => entry !== value)
      : [...current[field], value],
  }))

  const saveReviewer = () => {
    const normalized = draftReviewerId.trim()
    if (normalized.length < 2) return
    localStorage.setItem(REVIEWER_KEY, normalized)
    setReviewerId(normalized)
  }

  const decide = async decision => {
    if (!item || !reviewerId || saving || (decision === 'approved' && !approvalReady)) return
    setSaving(true)
    setError('')
    try {
      await createSymptomReviewDecision(item.review_id, {
        candidate_version: item.candidate_version,
        expected_record_version: Number(item.record_version || 0),
        idempotency_key: newIdempotencyKey(item.review_id),
        reviewer_id: reviewerId,
        reviewer_role: 'veterinarian',
        decision,
        answers: {
          ...answers,
          clinical_validity: answers.clinical_validity || 'unsure',
          species: answers.species || 'unsure',
          owner_observable: answers.owner_observable || 'unsure',
          urgency: answers.urgency || 'unsure',
        },
      })
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || '검수 결과를 저장하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const status = stats?.status || {}
  const completed = (status.approved || 0) + (status.rejected || 0) + (status.deferred || 0)

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>VETERINARY REVIEW</div>
          <h1 style={styles.title}>수의사 증상 검수</h1>
          <p style={styles.subtitle}>표현과 DS13 표준 증상의 연결 및 안전 안내 수준을 한 건씩 확인합니다.</p>
        </div>
        <div style={styles.progress}>완료 <strong>{completed}</strong> / {stats?.total ?? '-'}</div>
      </header>

      <div style={styles.notice}>
        이 화면은 수의사 자격을 인증하지 않습니다. 입력한 검수자 ID는 감사 이력 식별용입니다.
        이 검수는 개별 동물의 진단·치료·처방을 결정하는 절차가 아닙니다.
      </div>

      {!reviewerId ? (
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>검수자 확인</h2>
          <label style={styles.label} htmlFor="reviewer-id">등록된 수의사 검수자 ID</label>
          <div style={styles.reviewerRow}>
            <input id="reviewer-id" value={draftReviewerId}
              onChange={event => setDraftReviewerId(event.target.value)} style={styles.input}
              placeholder="예: vet-reviewer-01" autoComplete="off" />
            <button type="button" onClick={saveReviewer} disabled={draftReviewerId.trim().length < 2}
              style={primaryStyle(draftReviewerId.trim().length >= 2)}>검수 시작</button>
          </div>
        </section>
      ) : (
        <div style={styles.reviewer}>검수자 역할: <strong>수의사</strong> · ID: {reviewerId}</div>
      )}

      {error && <div role="alert" style={styles.error}>{error}</div>}
      {reviewerId && loading && <div style={styles.card}>검수 항목을 불러오는 중입니다.</div>}
      {reviewerId && !loading && !item && !error && (
        <div style={styles.card}><h2 style={styles.cardTitle}>미검수 항목이 없습니다.</h2></div>
      )}

      {reviewerId && !loading && item && (
        <article style={styles.card}>
          <div style={styles.candidateHeader}>
            <div>
              <div style={styles.eyebrow}>검수 후보 {item.review_id}</div>
              <h2 style={styles.term}>{item.atomic_term}</h2>
            </div>
            <span style={styles.badge}>{item.category_ko || '분류 미정'}</span>
          </div>
          <dl style={styles.details}>
            <div><dt>원본 라벨</dt><dd>{item.source_symptom_name}</dd></div>
            <div><dt>현재 DS13 코드</dt><dd>{item.ds13_code}</dd></div>
            <div><dt>자동 표시</dt><dd>{item.auto_flags || '없음'}</dd></div>
          </dl>

          <ChoiceGroup title="1. 임상적으로 유효한 증상 표현인가요?" value={answers.clinical_validity}
            options={OPTIONS.clinical_validity} onChange={value => setAnswer('clinical_validity', value)} />
          <ChoiceGroup title="2. 어느 동물에 적용되나요?" value={answers.species}
            options={OPTIONS.species} onChange={value => setAnswer('species', value)} />
          <ChoiceGroup title="3. 보호자가 직접 관찰할 수 있나요?" value={answers.owner_observable}
            options={OPTIONS.owner_observable} onChange={value => setAnswer('owner_observable', value)} />
          <ChoiceGroup title="4. 이 표현에 필요한 안전 안내 수준은 무엇인가요?"
            description="질병 진단이 아니라 서비스가 취할 안전 조치를 선택합니다."
            value={answers.urgency} options={OPTIONS.urgency} onChange={value => setAnswer('urgency', value)} />

          <section style={styles.question}>
            <h3 style={styles.questionTitle}>5. 확인할 추가 질문을 선택하세요. <span style={styles.optional}>복수 선택·선택 없음 가능</span></h3>
            <div style={styles.choices}>
              {FOLLOWUPS.map(([key, label]) => (
                <button key={key} type="button" onClick={() => toggleList('followup_question_ids', key)}
                  aria-pressed={answers.followup_question_ids.includes(key)}
                  style={choiceStyle(answers.followup_question_ids.includes(key))}>{label}</button>
              ))}
            </div>
          </section>

          <section style={styles.question}>
            <h3 style={styles.questionTitle}>6. 연결할 DS13 코드를 선택하세요. <span style={styles.optional}>복수 선택 가능</span></h3>
            <div style={styles.choices}>
              {codes.map(code => (
                <button key={code} type="button" onClick={() => toggleList('selected_symptom_codes', code)}
                  aria-pressed={answers.selected_symptom_codes.includes(code)}
                  style={choiceStyle(answers.selected_symptom_codes.includes(code))}>
                  {code === item.ds13_code ? `현재 코드 · ${code}` : `충돌 코드 · ${code}`}
                </button>
              ))}
            </div>
          </section>

          <footer style={styles.actions}>
            <button type="button" disabled={saving} onClick={() => decide('rejected')} style={secondaryStyle(!saving)}>제외하고 다음</button>
            <button type="button" disabled={saving} onClick={() => decide('deferred')} style={secondaryStyle(!saving)}>보류하고 다음</button>
            <button type="button" disabled={!approvalReady || saving} onClick={() => decide('approved')}
              title={!approvalReady ? '승인에는 모든 필수 판단과 DS13 코드 선택이 필요합니다.' : ''}
              style={primaryStyle(approvalReady && !saving)}>{saving ? '저장 중…' : '승인하고 다음'}</button>
          </footer>
        </article>
      )}
    </div>
  )
}

const styles = {
  page: { maxWidth: 940, margin: '0 auto', color: 'var(--text)' },
  header: { display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start', marginBottom: 18 },
  eyebrow: { fontSize: 11, fontWeight: 900, letterSpacing: 1.2, color: 'var(--teal)', marginBottom: 6 },
  title: { margin: 0, fontSize: 28 },
  subtitle: { margin: '8px 0 0', color: 'var(--muted)', lineHeight: 1.6 },
  progress: { whiteSpace: 'nowrap', padding: '10px 14px', borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border)' },
  notice: { padding: '13px 16px', background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', borderRadius: 10, lineHeight: 1.55, marginBottom: 16 },
  reviewer: { fontSize: 13, color: 'var(--muted)', textAlign: 'right', marginBottom: 12 },
  reviewerRow: { display: 'flex', gap: 10 },
  label: { display: 'block', fontWeight: 800, marginBottom: 8 },
  input: { flex: 1, minWidth: 0, padding: '11px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 },
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, boxShadow: '0 5px 18px rgba(15,23,42,.05)' },
  cardTitle: { margin: '0 0 16px', fontSize: 20 },
  candidateHeader: { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' },
  term: { margin: 0, fontSize: 27 },
  badge: { padding: '6px 10px', borderRadius: 999, background: 'var(--teal-lt)', color: 'var(--teal)', fontSize: 12, fontWeight: 800 },
  details: { display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, margin: '18px 0' },
  question: { borderTop: '1px solid var(--border)', padding: '18px 0 2px' },
  questionTitle: { margin: '0 0 10px', fontSize: 15 },
  help: { margin: '-3px 0 10px', color: 'var(--muted)', fontSize: 12 },
  optional: { fontSize: 11, fontWeight: 600, color: 'var(--muted)' },
  choices: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 20 },
  error: { padding: 12, marginBottom: 12, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' },
}

function choiceStyle(active) {
  return {
    padding: '9px 13px', borderRadius: 9, cursor: 'pointer', fontWeight: 700,
    border: `1px solid ${active ? '#0d9488' : 'var(--border)'}`,
    background: active ? 'var(--teal-lt)' : 'var(--bg)', color: active ? '#0f766e' : 'var(--text)',
  }
}

function primaryStyle(enabled) {
  return {
    padding: '10px 16px', border: 0, borderRadius: 9, fontWeight: 800,
    background: enabled ? '#0d9488' : '#cbd5e1', color: '#fff', cursor: enabled ? 'pointer' : 'not-allowed',
  }
}

function secondaryStyle(enabled) {
  return {
    padding: '10px 16px', borderRadius: 9, fontWeight: 800,
    border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
    cursor: enabled ? 'pointer' : 'not-allowed', opacity: enabled ? 1 : 0.6,
  }
}
