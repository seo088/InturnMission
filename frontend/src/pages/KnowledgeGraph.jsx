import { useState } from 'react'
import { useKGNodes } from '../hooks'

/* ─────────────────────────────────────────────────────────────
   SVG 고정 레이아웃 정의
   viewBox: 0 0 1100 780
   prefix: def: <http://knowledgemap.kr/def/animal/>
───────────────────────────────────────────────────────────── */

const ROOT = {
  id: 'root',
  x: 550,
  y: 390,
  r: 50,
  label: 'def:Animal',
  sub: '반려동물 지식그래프',
  color: '#0f172a',
}

const HUBS = [
  { id: 'h_fac', x: 290, y: 175, r: 38, label: '시설', sub: '병원·약국·미용·위탁·장묘', color: '#0284c7' },
  { id: 'h_med', x: 810, y: 175, r: 38, label: '의료', sub: '질병·증상', color: '#7c3aed' },
  { id: 'h_pro', x: 900, y: 480, r: 38, label: '보호·입양', sub: '쉘터·구조·분실', color: '#dc2626' },
  { id: 'h_reg', x: 550, y: 640, r: 38, label: '지역·등록', sub: 'Region/RFID', color: '#15803d' },
  { id: 'h_trl', x: 200, y: 480, r: 38, label: '관광·여행', sub: '동반 가능', color: '#b45309' },
]

const LEAVES = [
  // 시설
  { id: 'ds_hosp', x: 68, y: 55, icon: '🏥', label: '동물병원', hub: 'h_fac', color: '#0284c7', rdf: 'def:AnimalHospital', records: '18,000건' },
  { id: 'ds_phrm', x: 55, y: 205, icon: '💊', label: '동물약국', hub: 'h_fac', color: '#0369a1', rdf: 'def:AnimalPharmacy', records: '2,100건' },
  { id: 'ds_grm', x: 120, y: 340, icon: '✂️', label: '동물미용업', hub: 'h_fac', color: '#be185d', rdf: 'def:PetGroomingShop', records: '9,400건' },
  { id: 'ds_brd', x: 55, y: 440, icon: '🏡', label: '동물위탁관리업', hub: 'h_fac', color: '#c2410c', rdf: 'def:AnimalBoarding', records: '3,200건' },
  { id: 'ds_fun', x: 130, y: 555, icon: '🕊️', label: '동물장묘업', hub: 'h_fac', color: '#6d28d9', rdf: 'def:AnimalCremation', records: '450건' },

  // 의료
  { id: 'ds_sym', x: 960, y: 60, icon: '🩺', label: '동물질병증상분류', hub: 'h_med', color: '#7c3aed', rdf: 'def:Symptom', records: '1,200코드' },
  { id: 'ds_dis', x: 1050, y: 225, icon: '🦠', label: '동물질병정보', hub: 'h_med', color: '#9333ea', rdf: 'def:Disease', records: '320개' },

  // 보호·입양
  { id: 'ds_rsc', x: 1050, y: 375, icon: '🆘', label: '구조동물', hub: 'h_pro', color: '#dc2626', rdf: 'def:AbandonedAnimal', records: '100,000건/년' },
  { id: 'ds_lst', x: 1040, y: 490, icon: '🔍', label: '분실동물', hub: 'h_pro', color: '#ea580c', rdf: 'def:LostAnimal', records: '50,000건/년' },
  { id: 'ds_shlt', x: 950, y: 610, icon: '🏠', label: '동물보호센터', hub: 'h_pro', color: '#b91c1c', rdf: 'def:AnimalShelter', records: '280개소' },

  // 관광·여행
  { id: 'ds_cult', x: 68, y: 640, icon: '🐾', label: '반려동물동반가능시설', hub: 'h_trl', color: '#15803d', rdf: 'def:CulturalFacility', records: '5,700건' },
  { id: 'ds_rest', x: 200, y: 725, icon: '🛣️', label: '휴게소놀이터', hub: 'h_trl', color: '#b45309', rdf: 'def:RestArea', records: '320건' },
  { id: 'ds_trv', x: 390, y: 725, icon: '✈️', label: '반려동물동반여행', hub: 'h_trl', color: '#0891b2', rdf: 'def:TravelSpot', records: '8,900건' },

  // 지역·등록
  { id: 'ds_regi', x: 430, y: 748, icon: '🪪', label: '반려동물등록정보', hub: 'h_reg', color: '#15803d', rdf: 'def:RegisteredAnimal', records: '4,100,000건' },
  { id: 'ds_region', x: 550, y: 735, icon: '📍', label: '행정구역', hub: 'h_reg', color: '#16a34a', rdf: 'def:Region', records: '지역 코드' },
  { id: 'ds_nm', x: 670, y: 748, icon: '📛', label: '동물이름통계', hub: 'h_reg', color: '#0891b2', rdf: 'def:PetNameStats', records: '5,000개' },
]

const CROSS_EDGES = [
  { id: 'ce1', s: 'ds_dis', t: 'ds_hosp', pred: 'def:treatedAt', label: 'treatedAt', color: '#7c3aed' },
  { id: 'ce2', s: 'ds_dis', t: 'ds_sym', pred: 'def:hasSymptom', label: 'hasSymptom', color: '#9333ea' },
  { id: 'ce3', s: 'ds_sym', t: 'ds_dis', pred: 'def:indicatesDisease', label: 'indicatesDisease', color: '#15803d' },
  { id: 'ce4', s: 'ds_rsc', t: 'ds_lst', pred: 'def:matchingCandidate', label: 'matchingCandidate', color: '#ef4444' },
  { id: 'ce5', s: 'ds_rsc', t: 'ds_shlt', pred: 'def:protectedBy', label: 'protectedBy', color: '#dc2626' },
  { id: 'ce6', s: 'ds_rsc', t: 'ds_region', pred: 'def:foundAt', label: 'foundAt', color: '#0284c7' },
  { id: 'ce7', s: 'ds_regi', t: 'ds_rsc', pred: 'def:trackedAs', label: 'trackedAs', color: '#0284c7' },
  { id: 'ce8', s: 'ds_nm', t: 'ds_regi', pred: 'rdfs:label', label: 'rdfs:label', color: '#0891b2' },
  { id: 'ce9', s: 'ds_trv', t: 'h_fac', pred: 'def:nearBy', label: 'nearBy', color: '#b45309' },
  { id: 'ce10', s: 'ds_lst', t: 'ds_region', pred: 'def:lostNear', label: 'lostNear', color: '#ea580c' },
  { id: 'ce11', s: 'ds_trv', t: 'ds_shlt', pred: 'def:nearShelter', label: 'nearShelter', color: '#0891b2' },
  { id: 'ce12', s: 'ds_shlt', t: 'h_fac', pred: 'rdf:type def:Facility', label: 'rdf:type', color: '#b91c1c' },
  { id: 'ce13', s: 'ds_shlt', t: 'ds_hosp', pred: 'def:nearbyHospital', label: 'nearbyHospital', color: '#0284c7' },
  { id: 'ce14', s: 'ds_lst',  t: 'ds_shlt', pred: 'def:nearShelter',    label: 'nearShelter',   color: '#7c3aed' },
  { id: 'ce15', s: 'ds_dis',  t: 'ds_hosp', pred: 'def:affectsSpecies', label: 'affectsSpecies', color: '#16a34a' },
]

const buildNodeMap = () => {
  const map = { root: ROOT }
  HUBS.forEach((hub) => {
    map[hub.id] = hub
  })
  LEAVES.forEach((leaf) => {
    map[leaf.id] = leaf
  })
  return map
}

const NODE_MAP = buildNodeMap()

const normalizeRdfKey = (rdf) => {
  if (!rdf) return ''
  return rdf.replace('def:', '')
}

export default function KnowledgeGraph() {
  const { data: kgNodes } = useKGNodes()
  const [hoveredId, setHoveredId] = useState(null)

  const nodeCountMap = {}
  if (kgNodes) {
    kgNodes.forEach((node) => {
      nodeCountMap[node.id] = node.count
    })
  }

  const connSet = new Set()

  if (hoveredId) {
    connSet.add(hoveredId)

    HUBS.forEach((hub) => {
      if (hub.id === hoveredId) connSet.add('root')
      if (hoveredId === 'root') connSet.add(hub.id)
    })

    LEAVES.forEach((leaf) => {
      if (leaf.id === hoveredId) connSet.add(leaf.hub)
      if (leaf.hub === hoveredId) connSet.add(leaf.id)
    })

    CROSS_EDGES.forEach((edge) => {
      if (edge.s === hoveredId) connSet.add(edge.t)
      if (edge.t === hoveredId) connSet.add(edge.s)
    })
  }

  const isDim = (id) => hoveredId && !connSet.has(id)
  const isHighlighted = (id) => hoveredId && connSet.has(id)
  const isHovered = (id) => hoveredId === id

  const hoverNode = hoveredId ? NODE_MAP[hoveredId] : null
  const hoverLeaf = hoveredId ? LEAVES.find((leaf) => leaf.id === hoveredId) : null

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
          반려동물 지식그래프 — 데이터 연결 구조
        </h2>
        <p style={{ fontSize: 15, color: '#64748b', margin: '6px 0 0' }}>
          16개 데이터 노드 · 5개 엔티티 허브 · {CROSS_EDGES.length}개 교차 관계 · 노드에 마우스를 올리면 연결이 강조됩니다
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { color: '#0f172a', dash: false, label: '루트 노드' },
          { color: '#0284c7', dash: false, label: '엔티티 허브' },
          { color: '#64748b', dash: false, label: '데이터 노드' },
          { color: '#ef4444', dash: true, label: '교차 관계' },
        ].map((legend) => (
          <div key={legend.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="24" height="10">
              <line
                x1="0"
                y1="5"
                x2="24"
                y2="5"
                stroke={legend.color}
                strokeWidth="2.5"
                strokeDasharray={legend.dash ? '5,3' : 'none'}
              />
            </svg>
            <span style={{ fontSize: 14, color: '#475569' }}>{legend.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <svg viewBox="0 0 1100 780" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#e2e8f0" />
              </pattern>

              <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L0,8 L8,4 z" fill="#94a3b8" />
              </marker>

              <marker id="arrRed" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L0,8 L8,4 z" fill="#ef4444" />
              </marker>

              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="1100" height="780" fill="url(#dotGrid)" />

            {HUBS.map((hub) => (
              <line
                key={`root-${hub.id}`}
                x1={ROOT.x}
                y1={ROOT.y}
                x2={hub.x}
                y2={hub.y}
                stroke={hub.color}
                strokeWidth={isHighlighted(hub.id) ? 3 : 1.8}
                strokeOpacity={isDim(hub.id) ? 0.06 : 0.4}
                markerEnd="url(#arr)"
              />
            ))}

            {LEAVES.map((leaf) => {
              const hub = HUBS.find((item) => item.id === leaf.hub)
              if (!hub) return null

              const dimmed = isDim(leaf.id) || isDim(leaf.hub)

              return (
                <line
                  key={`leaf-${leaf.id}`}
                  x1={hub.x}
                  y1={hub.y}
                  x2={leaf.x}
                  y2={leaf.y}
                  stroke={leaf.color}
                  strokeWidth={isHighlighted(leaf.id) ? 2.5 : 1.4}
                  strokeOpacity={dimmed ? 0.05 : 0.45}
                  markerEnd="url(#arr)"
                />
              )
            })}

            {CROSS_EDGES.map((edge) => {
              const sourceNode = NODE_MAP[edge.s]
              const targetNode = NODE_MAP[edge.t]

              if (!sourceNode || !targetNode) return null

              const mx = (sourceNode.x + targetNode.x) / 2
              const my = (sourceNode.y + targetNode.y) / 2
              const active = hoveredId && connSet.has(edge.s) && connSet.has(edge.t)
              const dimmed = hoveredId && !active

              return (
                <g key={edge.id}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={edge.color}
                    strokeWidth={active ? 2.5 : 1.5}
                    strokeDasharray="8,4"
                    strokeOpacity={dimmed ? 0.05 : 0.65}
                    markerEnd="url(#arrRed)"
                  />

                  {!dimmed && (
                    <g>
                      <rect
                        x={mx - 48}
                        y={my - 11}
                        width="96"
                        height="20"
                        rx="6"
                        fill="white"
                        stroke={edge.color}
                        strokeWidth="1"
                        opacity="0.93"
                      />
                      <text
                        x={mx}
                        y={my + 5}
                        textAnchor="middle"
                        fontSize="10"
                        fill={edge.color}
                        fontWeight="bold"
                        fontFamily="'SF Mono','Fira Code',monospace"
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            <g
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredId('root')}
              onMouseLeave={() => setHoveredId(null)}
            >
              <circle
                cx={ROOT.x}
                cy={ROOT.y}
                r={ROOT.r + 12}
                fill={`${ROOT.color}0d`}
                stroke={ROOT.color}
                strokeWidth="1"
                strokeOpacity="0.25"
              />
              <circle
                cx={ROOT.x}
                cy={ROOT.y}
                r={ROOT.r}
                fill={ROOT.color}
                filter={isHovered('root') ? 'url(#glow)' : 'none'}
              />
              <text
                x={ROOT.x}
                y={ROOT.y - 9}
                textAnchor="middle"
                fontSize="13"
                fill="white"
                fontFamily="'SF Mono',monospace"
                fontWeight="bold"
              >
                {ROOT.label}
              </text>
              <text x={ROOT.x} y={ROOT.y + 11} textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.7)">
                {ROOT.sub}
              </text>
            </g>

            {HUBS.map((hub) => {
              const dimmed = isDim(hub.id)
              const active = isHovered(hub.id)

              return (
                <g
                  key={hub.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredId(hub.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <circle
                    cx={hub.x}
                    cy={hub.y}
                    r={hub.r + (active ? 8 : 0)}
                    fill={`${hub.color}12`}
                    stroke={hub.color}
                    strokeWidth={active ? 3 : 2}
                    opacity={dimmed ? 0.15 : 1}
                    filter={active ? 'url(#glow)' : 'none'}
                  />

                  {!dimmed && (
                    <>
                      <text
                        x={hub.x}
                        y={hub.y - 8}
                        textAnchor="middle"
                        fontSize="12"
                        fill={hub.color}
                        fontFamily="'SF Mono',monospace"
                        fontWeight="bold"
                      >
                        {hub.label}
                      </text>
                      <text x={hub.x} y={hub.y + 10} textAnchor="middle" fontSize="12" fill="#64748b">
                        {hub.sub}
                      </text>
                    </>
                  )}
                </g>
              )
            })}

            {LEAVES.map((leaf) => {
              const dimmed = isDim(leaf.id)
              const active = isHovered(leaf.id)

              return (
                <g
                  key={leaf.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredId(leaf.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <circle
                    cx={leaf.x}
                    cy={leaf.y}
                    r={active ? 28 : 24}
                    fill="white"
                    stroke={leaf.color}
                    strokeWidth={active ? 3 : 1.8}
                    opacity={dimmed ? 0.12 : 1}
                    filter={active ? 'url(#glow)' : 'none'}
                  />
                  <text x={leaf.x} y={leaf.y + 7} textAnchor="middle" fontSize="16" opacity={dimmed ? 0.12 : 1}>
                    {leaf.icon}
                  </text>
                  <text
                    x={leaf.x}
                    y={leaf.y + 42}
                    textAnchor="middle"
                    fontSize="12"
                    fill={dimmed ? '#cbd5e1' : '#334155'}
                    fontWeight={active ? '700' : '500'}
                  >
                    {leaf.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              minHeight: 130,
            }}
          >
            {hoverNode ? (
              <>
                <div
                  style={{
                    fontSize: 12,
                    color: '#94a3b8',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  선택된 노드
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      background: hoverNode.color,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#0f172a',
                      fontFamily: 'monospace',
                    }}
                  >
                    {hoverNode.label || hoverNode.id}
                  </div>
                </div>

                {hoverNode.sub && <div style={{ fontSize: 14, color: '#475569', marginBottom: 6 }}>{hoverNode.sub}</div>}

                {hoverLeaf?.rdf && (
                  <div
                    style={{
                      fontSize: 12,
                      color: '#0284c7',
                      fontFamily: 'monospace',
                      marginBottom: 4,
                    }}
                  >
                    {hoverLeaf.rdf}
                  </div>
                )}

                {hoverLeaf?.records && (
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    📊{' '}
                    {nodeCountMap[normalizeRdfKey(hoverLeaf.rdf)]
                      ? `${nodeCountMap[normalizeRdfKey(hoverLeaf.rdf)].toLocaleString()}건`
                      : hoverLeaf.records}
                  </div>
                )}

                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>연결 노드: {connSet.size - 1}개</div>
              </>
            ) : (
              <div
                style={{
                  fontSize: 14,
                  color: '#cbd5e1',
                  textAlign: 'center',
                  paddingTop: 24,
                  lineHeight: 1.7,
                }}
              >
                노드에 마우스를 올리면
                <br />
                상세 정보가 표시됩니다
              </div>
            )}
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              flex: 1,
              overflow: 'auto',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 12 }}>
              교차 관계 ({CROSS_EDGES.length}개)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {CROSS_EDGES.map((edge) => {
                const active = hoveredId && connSet.has(edge.s) && connSet.has(edge.t)
                const dimmed = hoveredId && !active

                return (
                  <div
                    key={edge.id}
                    style={{
                      padding: '9px 11px',
                      borderRadius: 8,
                      background: '#f8fafc',
                      border: `1px solid ${active ? edge.color : '#e2e8f0'}`,
                      borderLeft: `3px solid ${edge.color}`,
                      opacity: dimmed ? 0.3 : 1,
                      transition: 'opacity 0.15s, border-color 0.15s',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color: '#334155',
                        marginBottom: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <span style={{ color: edge.color }}>⇢</span>
                      {edge.label}
                    </div>
                    <div style={{ fontSize: 11, color: edge.color, fontFamily: 'monospace' }}>{edge.pred}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 14 }}>
          전체 RDF Predicate 요약 — 데이터베이스 연결 구조
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { rel: '질병 → 동물병원', pred: 'def:treatedAt', color: '#7c3aed', desc: 'Disease → AnimalHospital' },
            { rel: '질병정보 → 증상분류', pred: 'def:hasSymptom', color: '#9333ea', desc: 'Disease → Symptom' },
            { rel: '증상 → 질병', pred: 'def:indicatesDisease', color: '#15803d', desc: 'Symptom → Disease' },
            { rel: '구조동물 ↔ 분실동물', pred: 'def:matchingCandidate', color: '#ef4444', desc: 'AbandonedAnimal ↔ LostAnimal' },
            { rel: '구조동물 → 보호센터', pred: 'def:protectedBy', color: '#dc2626', desc: 'AbandonedAnimal → AnimalShelter' },
            { rel: '구조동물 → 행정구역', pred: 'def:foundAt', color: '#0284c7', desc: 'AbandonedAnimal → Region' },
            { rel: '등록정보 → 구조동물', pred: 'def:trackedAs', color: '#0284c7', desc: 'RegisteredAnimal → AbandonedAnimal' },
            { rel: '동물이름 → 등록정보', pred: 'rdfs:label', color: '#0891b2', desc: 'PetNameStats → RegisteredAnimal' },
            { rel: '동반여행 → 시설', pred: 'def:nearBy', color: '#b45309', desc: 'TravelSpot → Facility' },
            { rel: '분실동물 → 행정구역', pred: 'def:lostNear', color: '#ea580c', desc: 'LostAnimal → Region' },
            { rel: '동반여행 → 보호센터', pred: 'def:nearShelter', color: '#0891b2', desc: 'TravelSpot → AnimalShelter' },
            { rel: '보호센터 → 시설 레이어', pred: 'rdf:type def:Facility', color: '#b91c1c', desc: 'AnimalShelter → Facility' },
          ].map((item) => (
            <div
              key={item.pred + item.rel}
              style={{
                padding: '11px 13px',
                background: '#f8fafc',
                borderRadius: 9,
                borderLeft: `3px solid ${item.color}`,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>{item.rel}</div>
              <div style={{ fontSize: 12, color: item.color, fontFamily: 'monospace', marginBottom: 4 }}>{item.pred}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}