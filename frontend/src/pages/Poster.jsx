const DATASETS = [
  { icon: '🏥', name: '동물병원', org: '행정안전부', type: 'API/CSV', kg: 'KG Y', count: '5,406건', color: '#0d9488' },
  { icon: '💊', name: '동물약국', org: '행정안전부', type: 'API/CSV', kg: 'KG Y', count: '13,194건', color: '#0284c7' },
  { icon: '✂️', name: '동물미용업', org: '행정안전부', type: 'API/CSV', kg: 'KG Y', count: '10,879건', color: '#7c3aed' },
  { icon: '🏠', name: '동물위탁관리업', org: '행정안전부', type: 'API/CSV', kg: 'KG Y', count: '5,845건', color: '#d97706' },
  { icon: '🕯️', name: '동물장묘업', org: '행정안전부', type: 'API/CSV', kg: 'KG Y', count: '86건', color: '#64748b' },
  { icon: '🧳', name: '반려동물 동반여행', org: '한국관광공사', type: 'API', kg: 'KG Y', count: '1,000건', color: '#ea580c' },
  { icon: '🐾', name: '구조동물', org: '농림축산검역본부', type: 'API/CSV', kg: 'KG Y', count: '15,241건', color: '#e11d48' },
  { icon: '🔎', name: '분실동물', org: '농림축산검역본부', type: 'API/CSV', kg: 'KG Y', count: '2,963건', color: '#f43f5e' },
  { icon: '🏡', name: '동물보호센터', org: '농림축산검역본부', type: 'API/CSV', kg: 'KG Y', count: '330건', color: '#7c3aed' },
  { icon: '🎭', name: '동반 가능 문화시설', org: '한국문화정보원', type: 'CSV', kg: 'KG Y', count: '100건', color: '#2563eb' },
  { icon: '🛑', name: '휴게소 반려동물 편의시설', org: '한국도로공사', type: 'CSV', kg: 'KG Y', count: '20건', color: '#16a34a' },
  { icon: '🧬', name: '동물질병 증상분류', org: 'KISTI', type: 'CSV', kg: 'KG Y', count: '516건', color: '#0891b2' },
  { icon: '🦠', name: '동물 질병 정보', org: '농림축산검역본부', type: 'CSV', kg: 'KG Y', count: '116건', color: '#6366f1' },
  { icon: '🩺', name: '반려견 성장·질병 말뭉치', org: 'AI허브', type: 'AI허브', kg: 'KG Y', count: '25건', color: '#be185d' },
  { icon: '📈', name: '반려견·반려묘 건강정보', org: 'AI허브', type: 'AI허브', kg: 'KG Y', count: '112,332건', color: '#9333ea' },
  { icon: '💸', name: '동물병원 진료비 현황조사', org: '농림축산식품부', type: 'CSV', kg: '서비스', count: '62건', color: '#0f766e' },
]

const FLOW = [
  { label: '수집', detail: '8개 기관 16종\nAPI·CSV·AI허브 원천 데이터', color: '#0d9488', icon: '📥' },
  { label: '정제', detail: '폐업·중복 제거\n좌표·주소·표기 정리', color: '#2563eb', icon: '🧹' },
  { label: '정규화', detail: '공통 스키마 매핑\n지역·품종·증상 코드 정리', color: '#7c3aed', icon: '🧩' },
  { label: '그래프 변환', detail: 'RDF/TTL 생성\nGraphDB 적재', color: '#ea580c', icon: '🕸️' },
  { label: '서비스', detail: 'FastAPI + React\n검색·지도·추론 화면 제공', color: '#e11d48', icon: '🚀' },
]

const INFERENCES = [
  { icon: '🧬', title: '증상 → 질병 → 병원', desc: '표준 증상과 질병 데이터를 관계로 연결해 질병 후보와 지역 병원 추천으로 이어집니다.' },
  { icon: '💸', title: '지역 → 진료비', desc: '전국 진료비 통계와 시도별 편차를 서비스 화면에서 비교하고 전북 우위 항목을 표시합니다.' },
  { icon: '🐾', title: '구조·분실 후보 조회', desc: '구조동물과 분실동물을 지역·품종·색상 기준으로 탐색하고, 향후 매칭 점수화로 고도화합니다.' },
  { icon: '🗺️', title: '시설 → 지역 인프라', desc: '병원·약국·미용·위탁·장묘·보호센터를 지도에서 통합 탐색합니다.' },
]

const TYPE_STYLE = {
  'API': { bg: 'var(--teal-lt)', color: 'var(--teal)', border: '#99f6e4' },
  'API/CSV': { bg: 'var(--teal-lt)', color: 'var(--teal)', border: '#99f6e4' },
  'CSV': { bg: 'var(--yellow-lt)', color: 'var(--yellow)', border: '#fde68a' },
  'AI허브': { bg: '#ede9fe', color: '#7c3aed', border: '#c4b5fd' },
}

const KG_STYLE = {
  'KG Y': { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  '서비스': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
}

const SUMMARY = [
  ['16종', '활용 데이터'],
  ['168,115건', '정제·서비스 데이터'],
  ['167,573개', 'KG 개체'],
  ['4,504,931개', 'RDF 트리플'],
  ['112,332건', '건강 관측 데이터'],
]

export default function Poster() {
  return (
    <div style={{ maxWidth: 1200 }}>
      <section style={{ borderRadius: 18, padding: '36px 40px', marginBottom: 28, background: 'linear-gradient(135deg,#0d9488 0%,#2563eb 60%,#7c3aed 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 280, opacity: 0.08, fontSize: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>🐾</div>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8, marginBottom: 10 }}>Pet Knowledge Graph · 2026</div>
        <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>반려동물 공공·AI 데이터<br />지식그래프 구축 현황</div>
        <div style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.8, maxWidth: 690 }}>
          8개 기관 16종 데이터를 정제해 RDF 지식그래프로 구조화하고, GraphDB에 적재한 뒤
          증상 기반 후보 탐색, 병원 추천, 진료비 비교, 구조·분실동물 조회 화면에서 활용합니다.
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {SUMMARY.map(([n, l]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 10, opacity: 0.85, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <Panel title="데이터 처리 파이프라인">
        <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', overflowX: 'auto', paddingBottom: 4, marginTop: 16 }}>
          {FLOW.map((f, i) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ borderRadius: 12, padding: '14px 18px', background: f.color + '10', border: `1px solid ${f.color}44`, minWidth: 168, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: f.color, marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 10.5, color: 'var(--muted)', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{f.detail}</div>
              </div>
              {i < FLOW.length - 1 && (
                <div style={{ fontSize: 18, color: 'var(--muted)', padding: '0 8px', flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="16종 공공·AI 활용 데이터셋 현황">
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(250px,1fr))', marginTop: 16 }}>
          {DATASETS.map((ds) => {
            const typeStyle = TYPE_STYLE[ds.type] || TYPE_STYLE.CSV
            const kgStyle = KG_STYLE[ds.kg] || KG_STYLE['KG Y']
            return (
              <div key={ds.name} style={{ borderRadius: 8, padding: '10px 12px', background: 'var(--bg)', border: `1px solid ${ds.color}33`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 20, width: 32, textAlign: 'center', flexShrink: 0 }}>{ds.icon}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, lineHeight: 1.3 }}>{ds.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{ds.org}</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>{ds.count}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end', flexShrink: 0 }}>
                  <Badge styleDef={typeStyle}>{ds.type}</Badge>
                  <Badge styleDef={kgStyle}>{ds.kg}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel title="관계 기반 서비스 활용">
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', marginTop: 16 }}>
          {INFERENCES.map((item) => (
            <div key={item.title} style={{ borderRadius: 10, padding: '16px 18px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 900, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="기술 스택">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          {[
            ['React + Vite', '#61dafb'], ['FastAPI', '#009688'], ['GraphDB', '#2563eb'],
            ['RDF / Turtle', '#7c3aed'], ['SPARQL', '#0891b2'], ['Python ETL', '#0d9488'],
            ['TailwindCSS', '#38bdf8'], ['D3.js', '#f9a03c'], ['Docker', '#2496ed'],
          ].map(([label, color]) => (
            <span key={label} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, background: color + '15', color, border: `1px solid ${color}44` }}>{label}</span>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function Badge({ children, styleDef }) {
  return (
    <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: styleDef.bg, color: styleDef.color, border: `1px solid ${styleDef.border}`, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

function Panel({ title, children }) {
  return (
    <section style={{ borderRadius: 14, padding: '22px 24px', background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: 24 }}>
      <SectionLabel label={title} />
      {children}
    </section>
  )
}

function SectionLabel({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}
