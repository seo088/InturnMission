import { useState } from 'react'

/* ─────────────────────────────────────────────────────────────
   SVG 고정 레이아웃 정의
   viewBox: 0 0 1100 780
───────────────────────────────────────────────────────────── */

// ── 루트 ──────────────────────────────────────────────────
const ROOT = { id: 'root', x: 550, y: 390, r: 50, label: 'ex:PetAnimal', sub: '반려동물', color: '#0f172a' }

// ── 엔티티 허브 5개 (중간 링) ────────────────────────────
const HUBS = [
  { id: 'h_fac', x: 290, y: 175, r: 38, label: 'ex:Facility',   sub: '시설 정보',  color: '#0284c7' },
  { id: 'h_med', x: 810, y: 175, r: 38, label: 'ex:Medical',    sub: '의료 정보',  color: '#7c3aed' },
  { id: 'h_pro', x: 900, y: 480, r: 38, label: 'ex:Protection', sub: '보호·입양', color: '#dc2626' },
  { id: 'h_reg', x: 550, y: 640, r: 38, label: 'ex:Registry',   sub: '등록 정보',  color: '#15803d' },
  { id: 'h_trl', x: 200, y: 480, r: 38, label: 'ex:Travel',     sub: '관광·여행', color: '#b45309' },
]

// ── API 소스 노드 15개 (바깥 링) ─────────────────────────
const LEAVES = [
  // 시설 클러스터
  { id: 'ds_hosp', x: 68,  y: 55,  icon: '🏥', label: '동물병원',       hub: 'h_fac', color: '#0284c7', rdf: 'ex:AnimalHospital',     records: '18,000건' },
  { id: 'ds_phrm', x: 55,  y: 205, icon: '💊', label: '동물약국',       hub: 'h_fac', color: '#0369a1', rdf: 'ex:AnimalPharmacy',     records: '2,100건' },
  { id: 'ds_grm',  x: 120, y: 340, icon: '✂️', label: '동물미용업',     hub: 'h_fac', color: '#be185d', rdf: 'ex:PetGrooming',        records: '9,400건' },
  { id: 'ds_brd',  x: 55,  y: 440, icon: '🏡', label: '동물위탁관리업', hub: 'h_fac', color: '#c2410c', rdf: 'ex:AnimalBoarding',     records: '3,200건' },
  { id: 'ds_fun',  x: 130, y: 555, icon: '🕊️', label: '동물장묘업',    hub: 'h_fac', color: '#6d28d9', rdf: 'ex:AnimalCremation',    records: '450건' },
  // 의료 클러스터
  { id: 'ds_sym',  x: 960, y: 60,  icon: '🩺', label: '동물질병증상분류', hub: 'h_med', color: '#7c3aed', rdf: 'ex:Symptom',          records: '1,200코드' },
  { id: 'ds_dis',  x: 1050,y: 225, icon: '🦠', label: '동물질병정보',   hub: 'h_med', color: '#9333ea', rdf: 'ex:Disease',            records: '320개' },
  // 보호·입양 클러스터
  { id: 'ds_rsc',  x: 1050,y: 375, icon: '🆘', label: '구조동물',       hub: 'h_pro', color: '#dc2626', rdf: 'ex:AbandonedAnimal',    records: '100,000건/년' },
  { id: 'ds_lst',  x: 1040,y: 490, icon: '🔍', label: '분실동물',       hub: 'h_pro', color: '#ea580c', rdf: 'ex:LostAnimal',         records: '50,000건/년' },
  { id: 'ds_shlt', x: 950, y: 610, icon: '🏠', label: '동물보호센터',   hub: 'h_pro', color: '#b91c1c', rdf: 'ex:AnimalShelter',      records: '280개소' },
  // 관광 클러스터
  { id: 'ds_cult', x: 68,  y: 640, icon: '🐾', label: '반려동물동반가능시설', hub: 'h_trl', color: '#15803d', rdf: 'ex:PetFriendlyPlace', records: '5,700건' },
  { id: 'ds_rest', x: 200, y: 725, icon: '🛣️', label: '휴게소놀이터',  hub: 'h_trl', color: '#b45309', rdf: 'ex:RestAreaFacility',   records: '320건' },
  { id: 'ds_trv',  x: 390, y: 748, icon: '✈️', label: '반려동물동반여행', hub: 'h_trl', color: '#0891b2', rdf: 'ex:PetTourSpot',      records: '8,900건' },
  // 등록 클러스터
  { id: 'ds_regi', x: 420, y: 748, icon: '🪪', label: '반려동물등록정보', hub: 'h_reg', color: '#15803d', rdf: 'ex:RegisteredAnimal', records: '4,100,000건' },
  { id: 'ds_nm',   x: 640, y: 748, icon: '📛', label: '동물이름통계',   hub: 'h_reg', color: '#0891b2', rdf: 'ex:PetNameStats',       records: '5,000개' },
]

// ── 교차 관계 엣지 (데이터 연결성의 핵심) ────────────────
const CROSS_EDGES = [
  { id: 'ce1',  s: 'ds_hosp', t: 'h_med',   pred: 'schema:treats',          label: 'treats',            color: '#7c3aed' },
  { id: 'ce2',  s: 'ds_dis',  t: 'ds_sym',  pred: 'schema:hasSymptom',      label: 'hasSymptom',        color: '#9333ea' },
  { id: 'ce3',  s: 'ds_rsc',  t: 'ds_lst',  pred: 'owl:sameAs (rfidCd)',    label: 'owl:sameAs',        color: '#ef4444' },
  { id: 'ce4',  s: 'ds_rsc',  t: 'ds_shlt', pred: 'ex:protectedAt',         label: 'protectedAt',       color: '#dc2626' },
  { id: 'ce5',  s: 'ds_regi', t: 'ds_dis',  pred: 'ex:susceptibleTo (품종→질병)', label: 'susceptibleTo', color: '#15803d' },
  { id: 'ce6',  s: 'ds_regi', t: 'ds_rsc',  pred: 'ex:trackedAs (등록→유기)', label: 'trackedAs',       color: '#0284c7' },
  { id: 'ce7',  s: 'ds_nm',   t: 'ds_regi', pred: 'rdfs:label (이름빈도)',  label: 'rdfs:label',        color: '#0891b2' },
  { id: 'ce8',  s: 'ds_trv',  t: 'h_fac',   pred: 'schema:nearBy (여행지→시설)', label: 'nearBy',       color: '#b45309' },
  { id: 'ce9',  s: 'ds_shlt', t: 'h_fac',   pred: 'rdf:type Facility',      label: 'rdf:type',          color: '#b91c1c' },
  { id: 'ce10', s: 'ds_sym',  t: 'ds_hosp', pred: 'ex:treatedAt (증상→병원)', label: 'treatedAt',       color: '#0284c7' },
  { id: 'ce11', s: 'ds_lst',  t: 'h_trl',   pred: 'ex:lostNear (분실→지역)', label: 'lostNear',         color: '#ea580c' },
  { id: 'ce12', s: 'ds_trv',  t: 'ds_shlt', pred: 'ex:nearShelter',         label: 'nearShelter',       color: '#0891b2' },
]

// 노드 맵 (id → 노드 객체)
const buildNodeMap = () => {
  const m = { root: ROOT }
  HUBS.forEach(h => { m[h.id] = h })
  LEAVES.forEach(l => { m[l.id] = l })
  return m
}
const NODE_MAP = buildNodeMap()

export default function KnowledgeGraph() {
  const [hoveredId, setHoveredId] = useState(null)

  /* ── hover 연결 집합 계산 ── */
  const connSet = new Set()
  if (hoveredId) {
    connSet.add(hoveredId)
    // root ↔ hub
    HUBS.forEach(h => {
      if (h.id === hoveredId) connSet.add('root')
      if (hoveredId === 'root') connSet.add(h.id)
    })
    // hub ↔ leaf
    LEAVES.forEach(l => {
      if (l.id === hoveredId) connSet.add(l.hub)
      if (l.hub === hoveredId) connSet.add(l.id)
    })
    // cross edges
    CROSS_EDGES.forEach(e => {
      if (e.s === hoveredId) connSet.add(e.t)
      if (e.t === hoveredId) connSet.add(e.s)
    })
  }

  const dim      = id => hoveredId && !connSet.has(id)
  const highlit  = id => hoveredId && connSet.has(id)
  const hover    = id => hoveredId === id

  const hoverNode = hoveredId ? NODE_MAP[hoveredId] : null
  const hoverLeaf = hoveredId ? LEAVES.find(l => l.id === hoveredId) : null

  return (
    <div style={{ padding: '24px 28px' }}>

      {/* 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
          반려동물 지식그래프 — 데이터 연결 구조
        </h2>
        <p style={{ fontSize: 15, color: '#64748b', margin: '6px 0 0' }}>
          15개 공공 API · 5개 엔티티 허브 · {CROSS_EDGES.length}개 교차 관계 · 노드에 마우스를 올리면 연결이 강조됩니다
        </p>
      </div>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { color: '#0f172a', dash: false, label: '루트 노드 (반려동물)' },
          { color: '#0284c7', dash: false, label: '엔티티 허브 (5개 레이어)' },
          { color: '#64748b', dash: false, label: 'API 소스 노드 (15개)' },
          { color: '#ef4444', dash: true,  label: '교차 관계 — 데이터 연결성' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="24" height="10">
              <line x1="0" y1="5" x2="24" y2="5"
                stroke={l.color} strokeWidth="2.5"
                strokeDasharray={l.dash ? '5,3' : 'none'} />
            </svg>
            <span style={{ fontSize: 14, color: '#475569' }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>

        {/* ── SVG 그래프 ── */}
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: 14, overflow: 'hidden',
        }}>
          <svg viewBox="0 0 1100 780" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#e2e8f0" />
              </pattern>
              <marker id="arr"    markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L0,8 L8,4 z" fill="#94a3b8" />
              </marker>
              <marker id="arrRed" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L0,8 L8,4 z" fill="#ef4444" />
              </marker>
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <rect width="1100" height="780" fill="url(#dotGrid)" />

            {/* ── 루트 → 허브 엣지 ── */}
            {HUBS.map(h => (
              <line key={`r-${h.id}`}
                x1={ROOT.x} y1={ROOT.y} x2={h.x} y2={h.y}
                stroke={h.color}
                strokeWidth={highlit(h.id) ? 3 : 1.8}
                strokeOpacity={dim(h.id) ? 0.06 : 0.4}
                markerEnd="url(#arr)"
              />
            ))}

            {/* ── 허브 → 리프 엣지 ── */}
            {LEAVES.map(l => {
              const h = HUBS.find(h => h.id === l.hub)
              if (!h) return null
              const isDim = dim(l.id) || dim(l.hub)
              return (
                <line key={`l-${l.id}`}
                  x1={h.x} y1={h.y} x2={l.x} y2={l.y}
                  stroke={l.color}
                  strokeWidth={highlit(l.id) ? 2.5 : 1.4}
                  strokeOpacity={isDim ? 0.05 : 0.45}
                  markerEnd="url(#arr)"
                />
              )
            })}

            {/* ── 교차 관계 엣지 (점선) ── */}
            {CROSS_EDGES.map(e => {
              const sn = NODE_MAP[e.s], tn = NODE_MAP[e.t]
              if (!sn || !tn) return null
              const mx = (sn.x + tn.x) / 2
              const my = (sn.y + tn.y) / 2
              const active = hoveredId && connSet.has(e.s) && connSet.has(e.t)
              const isDim = hoveredId && !active
              return (
                <g key={e.id}>
                  <line
                    x1={sn.x} y1={sn.y} x2={tn.x} y2={tn.y}
                    stroke={e.color}
                    strokeWidth={active ? 2.5 : 1.5}
                    strokeDasharray="8,4"
                    strokeOpacity={isDim ? 0.05 : 0.65}
                    markerEnd="url(#arrRed)"
                  />
                  {!isDim && (
                    <g>
                      <rect x={mx - 44} y={my - 11} width="88" height="20" rx="6"
                        fill="white" stroke={e.color} strokeWidth="1" opacity="0.93" />
                      <text x={mx} y={my + 5} textAnchor="middle"
                        fontSize="10" fill={e.color} fontWeight="bold"
                        fontFamily="'SF Mono','Fira Code',monospace">
                        {e.label}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* ── 루트 노드 ── */}
            <g style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredId('root')}
              onMouseLeave={() => setHoveredId(null)}>
              <circle cx={ROOT.x} cy={ROOT.y} r={ROOT.r + 12}
                fill={`${ROOT.color}0d`} stroke={ROOT.color}
                strokeWidth="1" strokeOpacity="0.25" />
              <circle cx={ROOT.x} cy={ROOT.y} r={ROOT.r}
                fill={ROOT.color}
                filter={hover('root') ? 'url(#glow)' : 'none'} />
              <text x={ROOT.x} y={ROOT.y - 9} textAnchor="middle"
                fontSize="13" fill="white" fontFamily="'SF Mono',monospace" fontWeight="bold">
                {ROOT.label}
              </text>
              <text x={ROOT.x} y={ROOT.y + 11} textAnchor="middle"
                fontSize="13" fill="rgba(255,255,255,0.7)">
                {ROOT.sub}
              </text>
            </g>

            {/* ── 허브 노드 ── */}
            {HUBS.map(h => {
              const isDim = dim(h.id)
              const isActive = hover(h.id)
              return (
                <g key={h.id} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredId(h.id)}
                  onMouseLeave={() => setHoveredId(null)}>
                  <circle cx={h.x} cy={h.y} r={h.r + (isActive ? 8 : 0)}
                    fill={`${h.color}12`} stroke={h.color}
                    strokeWidth={isActive ? 3 : 2}
                    opacity={isDim ? 0.15 : 1}
                    filter={isActive ? 'url(#glow)' : 'none'} />
                  {!isDim && (
                    <>
                      <text x={h.x} y={h.y - 8} textAnchor="middle"
                        fontSize="12" fill={h.color}
                        fontFamily="'SF Mono',monospace" fontWeight="bold">
                        {h.label}
                      </text>
                      <text x={h.x} y={h.y + 10} textAnchor="middle"
                        fontSize="13" fill="#64748b">
                        {h.sub}
                      </text>
                    </>
                  )}
                </g>
              )
            })}

            {/* ── 리프 노드 (API 소스) ── */}
            {LEAVES.map(l => {
              const isDim = dim(l.id)
              const isActive = hover(l.id)
              return (
                <g key={l.id} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredId(l.id)}
                  onMouseLeave={() => setHoveredId(null)}>
                  <circle cx={l.x} cy={l.y} r={isActive ? 28 : 24}
                    fill="white" stroke={l.color}
                    strokeWidth={isActive ? 3 : 1.8}
                    opacity={isDim ? 0.12 : 1}
                    filter={isActive ? 'url(#glow)' : 'none'} />
                  <text x={l.x} y={l.y + 7} textAnchor="middle"
                    fontSize="16" opacity={isDim ? 0.12 : 1}>
                    {l.icon}
                  </text>
                  <text x={l.x} y={l.y + 42} textAnchor="middle"
                    fontSize="12" fill={isDim ? '#cbd5e1' : '#334155'}
                    fontWeight={isActive ? '700' : '500'}>
                    {l.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* ── 사이드 패널 ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 노드 정보 */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 12, padding: 16, minHeight: 130,
          }}>
            {hoverNode ? (
              <>
                <div style={{ fontSize: 12, color: '#94a3b8', letterSpacing: 1,
                  textTransform: 'uppercase', marginBottom: 8 }}>선택된 노드</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 11, height: 11, borderRadius: '50%',
                    background: hoverNode.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a',
                    fontFamily: 'monospace' }}>
                    {hoverNode.label || hoverNode.id}
                  </div>
                </div>
                {hoverNode.sub && (
                  <div style={{ fontSize: 14, color: '#475569', marginBottom: 6 }}>
                    {hoverNode.sub}
                  </div>
                )}
                {hoverLeaf?.rdf && (
                  <div style={{ fontSize: 12, color: '#0284c7',
                    fontFamily: 'monospace', marginBottom: 4 }}>
                    {hoverLeaf.rdf}
                  </div>
                )}
                {hoverLeaf?.records && (
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    📊 {hoverLeaf.records}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                  연결 노드: {connSet.size - 1}개
                </div>
              </>
            ) : (
              <div style={{ fontSize: 14, color: '#cbd5e1',
                textAlign: 'center', paddingTop: 24, lineHeight: 1.7 }}>
                노드에 마우스를 올리면<br />상세 정보가 표시됩니다
              </div>
            )}
          </div>

          {/* 교차 관계 목록 */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 12, padding: 16, flex: 1, overflow: 'auto',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 12 }}>
              교차 관계 ({CROSS_EDGES.length}개)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {CROSS_EDGES.map(e => {
                const active = hoveredId && connSet.has(e.s) && connSet.has(e.t)
                const isDim = hoveredId && !active
                return (
                  <div key={e.id} style={{
                    padding: '9px 11px', borderRadius: 8,
                    background: '#f8fafc',
                    border: `1px solid ${active ? e.color : '#e2e8f0'}`,
                    borderLeft: `3px solid ${e.color}`,
                    opacity: isDim ? 0.3 : 1,
                    transition: 'opacity 0.15s, border-color 0.15s',
                  }}>
                    <div style={{ fontSize: 13, color: '#334155',
                      marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ color: e.color }}>⇢</span>
                      {e.label}
                    </div>
                    <div style={{ fontSize: 11, color: e.color,
                      fontFamily: 'monospace' }}>{e.pred}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 하단: 전체 RDF 관계 요약 ── */}
      <div style={{
        marginTop: 18, background: '#ffffff',
        border: '1px solid #e2e8f0', borderRadius: 12, padding: 20,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 14 }}>
          전체 RDF Predicate 요약 — 데이터베이스 연결 구조
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { rel: '반려동물 → 동물병원',           pred: 'schema:nearBy',          color: '#0284c7', desc: '위치 기반 시설 연결' },
            { rel: '동물병원 → 질병증상분류',        pred: 'schema:treats',          color: '#7c3aed', desc: '진료 가능 증상 연결' },
            { rel: '질병정보 → 증상분류',            pred: 'schema:hasSymptom',      color: '#9333ea', desc: 'KISTI 코드 JOIN' },
            { rel: '등록정보 → 질병정보',            pred: 'ex:susceptibleTo',       color: '#15803d', desc: '품종 → 취약 질병' },
            { rel: '구조동물 ↔ 분실동물',           pred: 'owl:sameAs (rfidCd)',     color: '#ef4444', desc: 'RFID 번호 매칭' },
            { rel: '구조동물 → 보호센터',            pred: 'ex:protectedAt',         color: '#dc2626', desc: 'careNm JOIN' },
            { rel: '등록정보 → 구조동물',            pred: 'ex:trackedAs',           color: '#0284c7', desc: '등록번호 유기동물 추적' },
            { rel: '이름통계 → 등록정보',            pred: 'rdfs:label',             color: '#0891b2', desc: '이름 빈도 노드 연결' },
            { rel: '동반여행 → 시설',               pred: 'schema:nearBy',          color: '#b45309', desc: '여행지 근처 시설 추천' },
            { rel: '동반여행 → 보호센터',            pred: 'ex:nearShelter',         color: '#0891b2', desc: '여행지 근처 보호소' },
            { rel: '보호센터 → 시설 레이어',         pred: 'rdf:type Facility',      color: '#b91c1c', desc: '보호소 = 시설 분류' },
            { rel: '분실동물 → 관광 레이어',         pred: 'ex:lostNear',            color: '#ea580c', desc: '분실 핫스팟 분석' },
          ].map((r, i) => (
            <div key={i} style={{
              padding: '11px 13px', background: '#f8fafc',
              borderRadius: 9, borderLeft: `3px solid ${r.color}`,
              border: `1px solid #e2e8f0`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                {r.rel}
              </div>
              <div style={{ fontSize: 12, color: r.color,
                fontFamily: 'monospace', marginBottom: 4 }}>{r.pred}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
