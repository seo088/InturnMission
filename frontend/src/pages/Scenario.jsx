import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_RECOMMENDATION_REGION = '군산'

const CATEGORIES = [
  { key: 'hospital',  label: '동물병원', color: '#dc2626', icon: '🏥' },
  { key: 'pharmacy',  label: '동물약국', color: '#2563eb', icon: '💊' },
  { key: 'culture',   label: '문화시설', color: '#9333ea', icon: '🎭' },
  { key: 'cremation', label: '장묘시설', color: '#475569', icon: '🌿' },
  { key: 'shelter',   label: '보호센터', color: '#f59e0b', icon: '🏠' },
  { key: 'boarding',  label: '위탁관리', color: '#059669', icon: '🐾' },
]

const CATEGORY_STYLE = Object.fromEntries(CATEGORIES.map(category => [category.key, category]))

const SIDO_SHORT = {
  '서울특별시': '서울', 서울: '서울',
  '부산광역시': '부산', 부산: '부산',
  '대구광역시': '대구', 대구: '대구',
  '인천광역시': '인천', 인천: '인천',
  '광주광역시': '광주', 광주: '광주',
  '대전광역시': '대전', 대전: '대전',
  '울산광역시': '울산', 울산: '울산',
  '세종특별자치시': '세종', 세종: '세종',
  '경기도': '경기', 경기: '경기',
  '강원특별자치도': '강원', 강원도: '강원', 강원: '강원',
  '충청북도': '충북', 충북: '충북',
  '충청남도': '충남', 충남: '충남',
  '전북특별자치도': '전북', 전라북도: '전북', 전북: '전북',
  '전라남도': '전남', 전남: '전남',
  '경상북도': '경북', 경북: '경북',
  '경상남도': '경남', 경남: '경남',
  '제주특별자치도': '제주', 제주도: '제주', 제주: '제주',
}

function toShortSido(value = '') {
  const text = String(value || '').trim()
  if (!text) return ''
  const first = text.split(/\s+/)[0]
  return SIDO_SHORT[text] || SIDO_SHORT[first] || ''
}

function FacilityPopup({ facility }) {
  const navigate = useNavigate()
  const [showCostBadge, setShowCostBadge] = useState(false)

  useEffect(() => {
    const sido = toShortSido(facility.sido || facility.address)
    if (!sido) {
      setShowCostBadge(false)
      return
    }
    let alive = true
    fetch(`/api/costs/sido-gap?sido=${encodeURIComponent(sido)}`)
      .then(r => (r.ok ? r.json() : []))
      .then(rows => {
        if (alive) setShowCostBadge(Array.isArray(rows) && rows.some(row => row.position === 'min'))
      })
      .catch(() => {
        if (alive) setShowCostBadge(false)
      })
    return () => { alive = false }
  }, [facility])

  return (
    <div style={{ minWidth: 160 }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{facility.name}</div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{facility.address}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: facility.color + '20', color: facility.color, fontWeight: 700 }}>{facility.type}</span>
        {showCostBadge && (
          <button
            type="button"
            onClick={() => navigate('/costs')}
            style={{
              border: '1px solid #a7f3d0',
              background: '#ecfdf5',
              color: '#047857',
              borderRadius: 999,
              padding: '2px 7px',
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            진료비 우위 지역
          </button>
        )}
      </div>
    </div>
  )
}

function SymptomTab() {
  const [step, setStep] = useState(0)
  const [symptoms, setSymptoms] = useState([])
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [region, setRegion] = useState(DEFAULT_RECOMMENDATION_REGION)

  useEffect(() => {
    fetch('/api/scenario/symptoms').then(r => r.json()).then(setSymptoms)
  }, [])

  const infer = async (symptom) => {
    setSelected(symptom); setStep(1); setLoading(true)
    const params = new URLSearchParams({ symptom_uri: symptom.uri })
    if (region.trim()) params.set('region', region.trim())
    const res = await fetch(`/api/scenario/infer?${params.toString()}`)
    setResult(await res.json()); setLoading(false)
  }

  const reset = () => { setStep(0); setSelected(null); setResult(null) }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{
        marginBottom: 16,
        padding: '12px 14px',
        border: '1px solid #bae6fd',
        borderRadius: 10,
        background: '#f0f9ff',
        color: '#075985'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 8px',
            borderRadius: 999,
            background: '#0369a1',
            color: '#fff',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0
          }}>
            Graph-RAG PoC
          </span>
          <span style={{ fontSize: 12, fontWeight: 800 }}>SPARQL retrieval + AI generation</span>
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.5 }}>
          RDF 지식그래프에서 증상, 질병, 병원 정보를 검색하고 검색 결과를 기반으로 AI 설명을 생성하는 개념검증 기능입니다.
        </div>
      </div>
      {/* 스텝 인디케이터 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        {['증상 선택', '질병 추론', '병원 추천'].map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 12px', borderRadius: 8,
              background: step >= i ? '#0d9488' : '#f1f5f9',
              color: step >= i ? '#fff' : '#94a3b8',
              fontSize: 12, fontWeight: 700, transition: 'all 0.3s'
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: step >= i ? '#fff' : '#cbd5e1',
                color: step >= i ? '#0d9488' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800
              }}>{i + 1}</div>
              {label}
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > i ? '#0d9488' : '#e2e8f0', margin: '0 4px' }} />}
          </div>
        ))}
      </div>

      {/* Step 0 */}
      {step === 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: '#334155' }}>반려동물의 증상을 선택하세요</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: 12, border: '1px solid #ccfbf1', borderRadius: 10, background: '#f0fdfa' }}>
            <label htmlFor="scenario-region" style={{ fontSize: 12, fontWeight: 800, color: '#0f766e', whiteSpace: 'nowrap' }}>추천 기준 지역</label>
            <input
              id="scenario-region"
              value={region}
              onChange={e => setRegion(e.target.value)}
              placeholder="예: 군산, 전북, 서울 강남"
              style={{ flex: 1, minWidth: 140, border: '1px solid #99f6e4', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#0f172a', outline: 'none' }}
            />
            <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 700 }}>병원 추천에만 적용</span>
          </div>
          {symptoms.length === 0
            ? <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: 13 }}>로딩 중...</div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {symptoms.map(s => (
                <div key={s.code} onClick={() => infer(s)}
                  style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: '1px solid #e2e8f0', background: '#f8fafc', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0d9488'; e.currentTarget.style.background = '#e6f7f5' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>{s.category}</div>
                  <div style={{ fontSize: 9, color: '#0d9488', fontFamily: 'monospace' }}>{s.code}</div>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: '#334155' }}>SPARQL 추론 결과 — {selected?.name}</div>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 14, fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>
            <div style={{ color: '#0d9488', marginBottom: 3 }}>{'// SPARQL 추론 체인'}</div>
            <div>{`Symptom("${selected?.name}") ← def:hasSymptom ← Disease`}</div>
            <div style={{ color: '#7c3aed' }}>{'→ 지역 필터 → AnimalHospital'}</div>
          </div>
          {loading
            ? <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>추론 중...</div>
            : <>
              {result?.diseases?.length > 0
                ? <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>추론된 질병</div>
                  {result.diseases.map((d, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: '#ede9fe', border: '1px solid #c4b5fd', marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#4c1d95', marginBottom: 2 }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: '#6d28d9', marginBottom: 4 }}>{d.nameEN}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {d.cause && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 4, background: '#ddd6fe', color: '#5b21b6' }}>원인: {d.cause}</span>}
                        {d.target && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 4, background: '#ddd6fe', color: '#5b21b6' }}>대상: {d.target.split(',')[0]} 외</span>}
                      </div>
                    </div>
                  ))}
                </div>
                : <div style={{ padding: 12, background: '#fef3c7', borderRadius: 10, marginBottom: 14, fontSize: 12, color: '#92400e' }}>이 증상과 직접 연결된 질병 데이터가 없습니다.</div>
              }
              {result?.retrieval?.evidence_triples?.length > 0 && (
                <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #cbd5e1', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 800 }}>추천 근거</div>
                    <span style={{ fontSize: 10, color: '#0369a1', fontWeight: 800, background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 999, padding: '2px 8px' }}>Graph-RAG PoC</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                    <div style={{ padding: 10, borderRadius: 8, background: '#fff', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>선택 증상</div>
                      <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 800 }}>{selected?.name}</div>
                    </div>
                    <div style={{ padding: 10, borderRadius: 8, background: '#fff', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>질병 후보</div>
                      <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 800 }}>{result.retrieval.diseases?.length || 0}건 검색</div>
                    </div>
                    <div style={{ padding: 10, borderRadius: 8, background: '#fff', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>병원 후보</div>
                      <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 800 }}>{result.retrieval.hospitals?.length || 0}곳 검색</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.55, marginBottom: 10 }}>
                    공공데이터 지식그래프에서 선택한 증상과 연결된 질병 후보를 찾고, 입력한 지역 기준의 동물병원 후보를 함께 검색했습니다. AI 설명은 이 검색 결과만 참고하도록 제한됩니다.
                  </div>
                  <details style={{ borderTop: '1px solid #e2e8f0', paddingTop: 9 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 11, color: '#0369a1', fontWeight: 800 }}>
                      기술 검증용 GraphDB/SPARQL 근거 보기
                    </summary>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', margin: '10px 0 6px' }}>
                      <div style={{ fontSize: 11, color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>Retrieved Evidence</div>
                      <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{result.retrieval.method}</span>
                    </div>
                    {result.retrieval.evidence_triples.slice(0, 6).map((e, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center', padding: '6px 0', borderTop: i === 0 ? 'none' : '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 12, color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</span>
                        <span style={{ fontSize: 10, color: '#0d9488', fontFamily: 'monospace' }}>{e.predicate}</span>
                        <span style={{ fontSize: 12, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.object}</span>
                      </div>
                    ))}
                  </details>
                </div>
              )}
              {(result?.generation?.summary || result?.ai_summary) && (
                <div style={{ padding: 14, borderRadius: 10, background: '#ecfeff', border: '1px solid #a5f3fc', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: '#0891b2', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase' }}>AI Generated Explanation</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: '#164e63', whiteSpace: 'pre-wrap' }}>{result?.generation?.summary || result.ai_summary}</div>
                  {(result?.generation?.tokens || result?.ai_tokens) && (
                    <div style={{ fontSize: 10, color: '#0e7490', marginTop: 8 }}>
                      tokens: input {(result?.generation?.tokens || result.ai_tokens).input} / output {(result?.generation?.tokens || result.ai_tokens).output}
                    </div>
                  )}
                </div>
              )}
              {!(result?.generation?.summary || result?.ai_summary) && (result?.generation?.status || result?.ai_status) === 'unavailable' && (
                <div style={{ padding: 12, borderRadius: 10, background: '#f8fafc', border: '1px dashed #cbd5e1', marginBottom: 14, fontSize: 12, color: '#475569' }}>
                  AI 설명 생성은 Claude API 키와 Anthropic SDK 설정이 완료되면 표시됩니다. 현재 결과는 SPARQL 검색 기반 추론 결과입니다.
                </div>
              )}
              <button onClick={() => setStep(2)} style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: '#0d9488', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                인근 동물병원 추천 받기 →
              </button>
            </>
          }
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: '#334155' }}>인근 동물병원 추천 결과</div>
          <div style={{ fontSize: 11, color: result?.hospital_fallback ? '#b45309' : '#0d9488', fontWeight: 700, marginBottom: 14 }}>
            {result?.hospital_scope || `${region || DEFAULT_RECOMMENDATION_REGION} 기준`}
            {result?.hospital_fallback ? ' 지역 결과가 없어 전국 기준으로 표시합니다.' : ' 지역 병원만 표시합니다.'}
          </div>
          {result?.hospitals?.map((h, i) => (
            <div key={i} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{h.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{h.address}</div>
                {h.phone && <div style={{ fontSize: 11, color: '#0284c7' }}>{h.phone}</div>}
              </div>
              <span style={{ fontSize: 9, color: '#0d9488', fontFamily: 'monospace' }}>{h.recommendationScope || result?.hospital_scope}</span>
            </div>
          ))}
          <button onClick={reset} style={{ width: '100%', padding: '9px 0', borderRadius: 8, background: '#f1f5f9', color: '#475569', fontSize: 13, fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer', marginTop: 4 }}>
            다시 시작
          </button>
        </div>
      )}
    </div>
  )
}

function BoundsWatcher({ onBoundsChange }) {
  const map = useMap()
  useEffect(() => { onBoundsChange(map.getBounds()) }, [])
  useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds()),
  })
  return null
}

function MapTab() {
  const [category, setCategory] = useState('hospital')
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(false)
  const [bounds, setBounds] = useState(null)
  const abortRef = useRef(null)
  const requestIdRef = useRef(0)

  const fetchFacilities = useCallback((cat, b) => {
    if (!b) return
    if (abortRef.current) abortRef.current.abort()
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    const controller = new AbortController()
    abortRef.current = controller
    const sw = b.getSouthWest(), ne = b.getNorthEast()
    setLoading(true)
    setFacilities([])
    fetch(
      `/api/scenario/map-facilities?category=${cat}&lat_min=${sw.lat.toFixed(6)}&lat_max=${ne.lat.toFixed(6)}&lon_min=${sw.lng.toFixed(6)}&lon_max=${ne.lng.toFixed(6)}`,
      { signal: controller.signal }
    )
      .then(r => r.json())
      .then(data => {
        if (requestId !== requestIdRef.current) return
        const style = CATEGORY_STYLE[cat] || CATEGORY_STYLE.hospital
        setFacilities(Array.isArray(data)
          ? data.map(item => ({ ...item, type: style.label, color: style.color, category: cat }))
          : []
        )
        setLoading(false)
      })
      .catch(e => {
        if (e.name !== 'AbortError' && requestId === requestIdRef.current) setLoading(false)
      })
  }, [])

  useEffect(() => { fetchFacilities(category, bounds) }, [category, bounds])

  const handleBoundsChange = useCallback((b) => { setBounds(b) }, [])

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)}
            style={{
              padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              border: `1px solid ${category === c.key ? c.color : '#e2e8f0'}`,
              background: category === c.key ? c.color + '15' : '#fff',
              color: category === c.key ? c.color : '#64748b',
              cursor: 'pointer', transition: 'all 0.15s'
            }}>
            {c.icon} {c.label} {category === c.key && !loading ? `(${facilities.length})` : ''}
          </button>
        ))}
        {loading && <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center' }}>로딩 중...</span>}
      </div>

      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0', height: 520 }}>
        <MapContainer center={[36.5, 127.5]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BoundsWatcher onBoundsChange={handleBoundsChange} />
          {facilities.map((f, i) => (
            <CircleMarker
              key={`${f.category || category}-${f.name || i}-${f.lat}-${f.lon}`}
              center={[f.lat, f.lon]}
              radius={6}
              pathOptions={{ fillColor: f.color, color: '#fff', weight: 2, fillOpacity: 0.9 }}
            >
              <Popup>
                <FacilityPopup facility={f} />
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
            {c.label}
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8' }}>지도 이동 시 자동 로딩 · OpenStreetMap</span>
      </div>
    </div>
  )
}

export default function Scenario() {
  const [tab, setTab] = useState('symptom')

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
          서비스 시나리오
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 0' }}>
          Fuseki 실데이터 기반 · SPARQL 추론 체인 연동
        </p>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'symptom', label: '🧬 증상 → 병원 추천', desc: 'SPARQL 추론 체인' },
          { key: 'map',     label: '🗺️ 시설 지도',        desc: '전국 시설 분포' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${tab === t.key ? '#0d9488' : '#e2e8f0'}`,
              background: tab === t.key ? '#e6f7f5' : '#fff',
              color: tab === t.key ? '#0d9488' : '#64748b',
              fontWeight: tab === t.key ? 700 : 500,
              fontSize: 13, transition: 'all 0.15s', textAlign: 'left'
            }}>
            <div>{t.label}</div>
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {tab === 'symptom' && <SymptomTab />}
      {tab === 'map' && <MapTab />}
    </div>
  )
}
