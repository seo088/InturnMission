import { useEffect, useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const CATEGORIES = [
  { key: 'hospital',  label: '동물병원', color: '#e11d48', icon: '🏥' },
  { key: 'pharmacy',  label: '동물약국', color: '#0284c7', icon: '💊' },
  { key: 'culture',   label: '문화시설', color: '#7c3aed', icon: '🎭' },
  { key: 'cremation', label: '장묘시설', color: '#64748b', icon: '🌿' },
  { key: 'shelter',   label: '보호센터', color: '#d97706', icon: '🏠' },
  { key: 'boarding',  label: '위탁관리', color: '#0d9488', icon: '🐾' },
]

function SymptomTab() {
  const [step, setStep] = useState(0)
  const [symptoms, setSymptoms] = useState([])
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/scenario/symptoms').then(r => r.json()).then(setSymptoms)
  }, [])

  const infer = async (symptom) => {
    setSelected(symptom); setStep(1); setLoading(true)
    const res = await fetch(`/api/scenario/infer?symptom_uri=${encodeURIComponent(symptom.uri)}`)
    setResult(await res.json()); setLoading(false)
  }

  const reset = () => { setStep(0); setSelected(null); setResult(null) }

  return (
    <div style={{ maxWidth: 800 }}>
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
            <div style={{ color: '#7c3aed' }}>{'→ def:nearbyHospital → AnimalHospital'}</div>
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
          {result?.hospitals?.map((h, i) => (
            <div key={i} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{h.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{h.address}</div>
                {h.phone && <div style={{ fontSize: 11, color: '#0284c7' }}>{h.phone}</div>}
              </div>
              <span style={{ fontSize: 9, color: '#0d9488', fontFamily: 'monospace' }}>def:nearbyHospital</span>
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

  const fetchFacilities = useCallback((cat, b) => {
    if (!b) return
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    const sw = b.getSouthWest(), ne = b.getNorthEast()
    setLoading(true)
    fetch(
      `/api/scenario/map-facilities?category=${cat}&lat_min=${sw.lat.toFixed(6)}&lat_max=${ne.lat.toFixed(6)}&lon_min=${sw.lng.toFixed(6)}&lon_max=${ne.lng.toFixed(6)}`,
      { signal: abortRef.current.signal }
    )
      .then(r => r.json())
      .then(data => { setFacilities(data); setLoading(false) })
      .catch(e => { if (e.name !== 'AbortError') setLoading(false) })
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
            <CircleMarker key={i} center={[f.lat, f.lon]} radius={6}
              fillColor={f.color} color={f.color} weight={1} fillOpacity={0.8}>
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{f.address}</div>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: f.color + '20', color: f.color, fontWeight: 700 }}>{f.type}</span>
                </div>
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