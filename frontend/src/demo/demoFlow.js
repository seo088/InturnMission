import fallback from './data/cough-v1.json' with { type: 'json' }

export const REPRESENTATIVE_TEXT = fallback.representative_text

const compact = (value) => String(value || '').toLowerCase().replace(/[^0-9a-z가-힣]+/g, '')

export function isRepresentativeCough(text) {
  const value = compact(text)
  return (value.includes('기침') || value.includes('쿨럭') || value.includes('콜록'))
    && (value.includes('짖') || value.includes('기침'))
}

export function assessClientSafety(text) {
  const value = String(text || '')
  const urgentPatterns = [
    /숨[을이]?\s*(?:제대로\s*)?(?:못|안)\s*쉬/,
    /호흡.{0,12}(?:곤란|힘들|어렵)/,
    /의식[을이가은]?\s*(?:없|잃|소실)/,
    /(?:발작|경련|기절|쓰러져)/,
    /피가.{0,12}(?:계속|멈추지|안\s*멈)/,
    /소변.{0,35}(?:못|안)\s*(?:누|눴|봐|보)/,
    /(?:포도|초콜릿|양파).{0,18}(?:먹|삼)/,
    /눈.{0,10}(?:튀어나|돌출)/,
  ]
  const negated = /(?:것은|건)\s*아니|먹은\s*것은\s*아니/.test(value)
  const matched = negated ? [] : urgentPatterns.filter((pattern) => pattern.test(value))
  return {
    blocked: matched.length > 0,
    urgency: matched.length > 0 ? 'urgent' : 'routine',
    warning: matched.length > 0
      ? '응급 신호가 의심됩니다. 일반 질병·병원 추천을 중단합니다. 가까운 응급 진료 가능 병원에 즉시 전화하세요.'
      : null,
  }
}

export function fallbackMapping(text) {
  if (!isRepresentativeCough(text)) return null
  return {
    model_version: 'reviewed-demo-fallback-v1',
    index_version: fallback.schema_version,
    candidates: [{
      rank: 1,
      code: fallback.symptom.code,
      label: fallback.symptom.label,
      category: fallback.symptom.category,
      score: 1,
      confidence: fallback.symptom.confidence,
      matched_term: '검수된 대표 기침 표현',
    }],
    fallback_used: true,
    fallback_reason: '자연어 매핑 API를 사용할 수 없어 검수된 대표 시나리오 캐시를 사용했습니다.',
  }
}

export function fallbackResult() {
  return {
    diseases: fallback.diseases,
    hospitals: fallback.hospitals.map(normaliseHospital),
    medical_disclaimer: fallback.medical_disclaimer,
    fallback_used: true,
    fallback_reason: 'GraphDB 또는 백엔드를 사용할 수 없어 검수된 대표 시나리오 캐시를 사용했습니다.',
    source_mode: 'full_demo_fallback',
  }
}

export function normaliseHospital(hospital) {
  return {
    ...hospital,
    verification_status: 'phone_verified_capability_unverified',
    capability: { ...fallback.capability_defaults },
    availability_confirmation_required: true,
    source: '전국 동물병원 공공데이터 + 사용자 전화번호 확인',
  }
}

export function mergeLiveResult(live) {
  const diseases = (live?.diseases || []).map((disease) => ({
    ...disease,
    department: disease.department_label || disease.departments?.[0]?.label || '진료 문의 분야 미확정 — 병원에 증상 진료 가능 여부를 전화로 확인하세요.',
    confidence_status: disease.confidence_status || 'not_evaluated',
    source: 'GraphDB DS27 검수 관계',
  }))
  return {
    diseases: diseases.length ? diseases : fallback.diseases,
    // Contact verification is stronger than an incomplete GraphDB phone field.
    // Clinical capability remains unknown and is never inferred from the name.
    hospitals: fallback.hospitals.map(normaliseHospital),
    medical_disclaimer: fallback.medical_disclaimer,
    fallback_used: !diseases.length,
    fallback_reason: diseases.length ? null : 'GraphDB 질병 결과가 없어 검수 캐시를 사용했습니다.',
    source_mode: diseases.length ? 'live_graph_hospital_cache' : 'graph_fallback',
  }
}

export async function fetchJson(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function requestMapping(text, fault = '') {
  if (fault === 'mapper' || fault === 'all') throw new Error('fault:mapper')
  return fetchJson('/api/scenario/map-symptoms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, limit: 3 }),
  })
}

export async function requestInference(text, symptomCode, fault = '') {
  if (fault === 'graph' || fault === 'all') throw new Error('fault:graph')
  const params = new URLSearchParams({
    symptom_uri: `http://knowledgemap.kr/id/animal/symptom/${symptomCode}`,
    symptom_text: text,
    region: '군산',
  })
  return fetchJson(`/api/scenario/infer?${params}`)
}

export { fallback }
