export default function Poster() {
  const DATASETS = [
    { icon:'🏥', name:'동물병원',           org:'행정안전부',      type:'API',  fields:10, kg:'Y',  color:'#0d9488' },
    { icon:'💊', name:'동물약국',           org:'행정안전부',      type:'API',  fields:7,  kg:'Y',  color:'#0284c7' },
    { icon:'✂️', name:'동물미용업',         org:'행정안전부',      type:'API',  fields:5,  kg:'검토중', color:'#7c3aed' },
    { icon:'🏨', name:'동물위탁관리업',     org:'행정안전부',      type:'API',  fields:7,  kg:'검토중', color:'#d97706' },
    { icon:'🌿', name:'동물장묘업',         org:'행정안전부',      type:'API',  fields:6,  kg:'N',  color:'#94a3b8' },
    { icon:'🗺️', name:'반려동물 동반여행', org:'한국관광공사',    type:'API',  fields:11, kg:'Y',  color:'#ea580c' },
    { icon:'🐾', name:'구조동물',           org:'농림축산검역본부',type:'API',  fields:12, kg:'Y',  color:'#e11d48' },
    { icon:'❓', name:'분실동물',           org:'농림축산식품부',  type:'API',  fields:7,  kg:'Y',  color:'#f43f5e' },
    { icon:'🏠', name:'동물보호센터',       org:'농림축산검역본부',type:'API',  fields:9,  kg:'Y',  color:'#7c3aed' },
    { icon:'📍', name:'반려동물 동반가능 시설',org:'한국문화정보원',type:'API', fields:7,  kg:'Y',  color:'#2563eb' },
    { icon:'🛑', name:'휴게소 편의시설',    org:'한국도로공사',    type:'CSV',  fields:5,  kg:'검토중', color:'#16a34a' },
    { icon:'🧬', name:'동물질병 증상분류',  org:'KISTI',           type:'API',  fields:5,  kg:'Y',  color:'#0891b2' },
    { icon:'🦠', name:'동물 질병 정보',     org:'농림축산검역본부',type:'CSV',  fields:7,  kg:'Y',  color:'#6366f1' },
    { icon:'🐶', name:'반려동물 등록정보',  org:'농림축산식품부',  type:'API',  fields:4,  kg:'Y',  color:'#e11d48' },
  ]

  const KG_STYLE = {
    'Y':     { bg:'#ecfdf5', color:'#059669', border:'#a7f3d0' },
    '검토중': { bg:'#fef3c7', color:'#d97706', border:'#fde68a' },
    'N':     { bg:'#fce7ec', color:'#e11d48', border:'#fecdd3' },
  }

  const FLOW = [
    { step:'1', label:'공공데이터 수집', detail:'13개 API + CSV\n행정안전부 · 관광공사\n농림부 · KISTI · 도로공사', color:'#0d9488', icon:'📡' },
    { step:'2', label:'전처리 · 정제',   detail:'좌표계 변환 (Bessel→WGS84)\n한영 혼용 정제\n코드 마스터 테이블 구축', color:'#2563eb', icon:'⚙️' },
    { step:'3', label:'온톨로지 설계',  detail:'12 RDF 클래스\n15+ 관계 (Predicate)\n11개 네임스페이스', color:'#7c3aed', icon:'🕸️' },
    { step:'4', label:'트리플스토어',   detail:'RDF Turtle 직렬화\nApache Jena / Fuseki\nSPARQL 엔드포인트', color:'#ea580c', icon:'🗄️' },
    { step:'5', label:'서비스 제공',    detail:'FastAPI + React\n지식그래프 시각화\n추론 기반 추천', color:'#e11d48', icon:'🚀' },
  ]

  const INFERENCES = [
    { icon:'🩺', title:'증상 → 병원 추천',       desc:'증상코드 기반 질병 추론 후 인근 전문 병원 안내' },
    { icon:'🏠', title:'입양 동선 최적화',        desc:'보호소 위치 기반 반경 3km 내 반려동물 시설 추천' },
    { icon:'🗺️', title:'여행 안전 점수 계산',    desc:'여행 경로 내 응급 동물병원 접근성 검증' },
    { icon:'⚠️', title:'인수공통전염병 경보',     desc:'감염 동물 → 인근 보호소 전파 경보 시스템' },
  ]

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* ── Hero ── */}
      <div style={{ borderRadius: 18, padding: '36px 40px', marginBottom: 28, background: 'linear-gradient(135deg,#0d9488 0%,#2563eb 60%,#7c3aed 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 280, opacity: 0.08, fontSize: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>🐾</div>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8, marginBottom: 10 }}>Pet Knowledge Graph · 2026</div>
        <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>반려동물 통합 지식그래프<br/>고도화 프로젝트</div>
        <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.8, maxWidth: 600 }}>
          전국 14개 공공 데이터셋을 통합하여 반려동물 의료·보호·여행·질병 정보를 
          하나의 지식그래프로 연결합니다. Schema.org·SKOS·OWL 기반 온톨로지 설계로 
          증상→병원 추천, 입양 동선 최적화 등 고도화된 추론 서비스를 제공합니다.
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          {[['14', '데이터셋'], ['8', '제공 기관'], ['95+', '필드 (KG 반영)'], ['12', 'RDF 클래스'], ['15+', '관계(Predicate)']].map(([n, l]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 16px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 데이터 흐름 ── */}
      <div style={{ borderRadius: 14, padding: '22px 24px', background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: 24 }}>
        <SectionLabel label="데이터 처리 파이프라인" />
        <div style={{ display: 'flex', gap: 0, alignItems: 'center', overflowX: 'auto', paddingBottom: 4, marginTop: 16 }}>
          {FLOW.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ borderRadius: 12, padding: '14px 18px', background: f.color + '10', border: `1px solid ${f.color}44`, minWidth: 160, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: f.color, marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{f.detail}</div>
              </div>
              {i < FLOW.length - 1 && (
                <div style={{ fontSize: 18, color: 'var(--muted)', padding: '0 8px', flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 데이터셋 목록 ── */}
      <div style={{ borderRadius: 14, padding: '22px 24px', background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: 24 }}>
        <SectionLabel label="14개 공공 데이터셋 현황" />
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', marginTop: 16 }}>
          {DATASETS.map((ds, i) => {
            const kg = KG_STYLE[ds.kg]
            return (
              <div key={i} style={{ borderRadius: 8, padding: '10px 12px', background: 'var(--bg)', border: `1px solid ${ds.color}33`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 20, width: 32, textAlign: 'center', flexShrink: 0 }}>{ds.icon}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.3 }}>{ds.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{ds.org}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end', flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: ds.type === 'API' ? 'var(--teal-lt)' : 'var(--yellow-lt)', color: ds.type === 'API' ? 'var(--teal)' : 'var(--yellow)', border: `1px solid ${ds.type === 'API' ? '#99f6e4' : '#fde68a'}` }}>{ds.type}</span>
                  <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: kg.bg, color: kg.color, border: `1px solid ${kg.border}` }}>KG {ds.kg}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 추론 시나리오 ── */}
      <div style={{ borderRadius: 14, padding: '22px 24px', background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: 24 }}>
        <SectionLabel label="추론 기반 서비스 시나리오" />
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', marginTop: 16 }}>
          {INFERENCES.map((s, i) => (
            <div key={i} style={{ borderRadius: 10, padding: '16px 18px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 기술 스택 ── */}
      <div style={{ borderRadius: 14, padding: '22px 24px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <SectionLabel label="기술 스택" />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          {[
            ['React + Vite','#61dafb'], ['FastAPI','#009688'], ['PostgreSQL','#336791'],
            ['D3.js','#f9a03c'], ['TailwindCSS','#38bdf8'], ['RDF / Turtle','#7c3aed'],
            ['SPARQL','#0891b2'], ['Schema.org','#ea580c'], ['SKOS + OWL','#6366f1'],
            ['Apache Jena','#e11d48'], ['pyproj','#0d9488'], ['Docker','#2496ed'],
          ].map(([label, color]) => (
            <span key={label} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: color + '15', color, border: `1px solid ${color}44` }}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}
