import { useState } from "react";

// ─── 색상 팔레트 ─────────────────────────────
const C = {
  bg:     "#0a0f1e",
  panel:  "#0f172a",
  border: "rgba(148,163,184,0.12)",
  text:   "#e2e8f0",
  sub:    "#94a3b8",
  muted:  "#475569",
  accent: "#0ea5e9",
  green:  "#34d399",
  orange: "#fb923c",
  pink:   "#f472b6",
  purple: "#818cf8",
  yellow: "#fbbf24",
  red:    "#f87171",
};

// ─── 탭 목록 ────────────────────────────────
const TABS = [
  { id:"arch",     label:"🏗️ 아키텍처" },
  { id:"dataflow", label:"🔄 데이터 흐름" },
  { id:"mockup",   label:"📱 목업 (UI)" },
];

// ─── 아키텍처 다이어그램 ──────────────────────
function ArchDiagram() {
  const layers = [
    {
      title: "📡 데이터 소스 레이어",
      color: C.purple,
      items: [
        { name:"행정안전부 API", detail:"동물병원·약국·미용·위탁·장묘" },
        { name:"농림축산검역본부 API", detail:"구조동물·보호센터·질병정보" },
        { name:"한국관광공사 API", detail:"반려동물 동반여행 서비스" },
        { name:"한국문화정보원 API", detail:"반려동물 동반 문화시설 (~7만건)" },
        { name:"도로공사 / KISTI", detail:"휴게소 놀이터 · 증상분류" },
      ],
    },
    {
      title: "⚙️ 백엔드 레이어",
      color: C.accent,
      items: [
        { name:"FastAPI (Python 3.12)", detail:"REST API 서버, 비동기 처리" },
        { name:"데이터 수집 파이프라인", detail:"배치 수집 · 좌표계 변환(EPSG:5174→WGS84)" },
        { name:"엔티티 해상도(Entity Resolution)", detail:"중복 시설 병합 · Fuzzy Matching" },
        { name:"지식그래프 구축", detail:"RDF 트리플 생성 · SPARQL 엔드포인트" },
      ],
    },
    {
      title: "🗄️ 데이터베이스 레이어",
      color: C.green,
      items: [
        { name:"PostgreSQL (PostGIS)", detail:"공간 데이터 저장 · 지리 인덱스" },
        { name:"지식그래프 DB (RDF Store)", detail:"엔티티·관계 트리플 저장" },
        { name:"매핑 테이블", detail:"코드 마스터 · 출처 메타데이터 관리" },
      ],
    },
    {
      title: "💻 프론트엔드 레이어",
      color: C.orange,
      items: [
        { name:"React (Node.js v20)", detail:"SPA 기반 대시보드" },
        { name:"지식그래프 시각화 페이지", detail:"Canvas 기반 Force-directed Graph" },
        { name:"지도 서비스 (지도 API 연동)", detail:"반려동물 시설 위치 지도 표시" },
        { name:"보고서 페이지", detail:"아키텍처·데이터흐름·목업 문서화" },
      ],
    },
  ];

  const connections = [
    { from:"데이터 소스", to:"백엔드", label:"API 호출 / CSV 수집" },
    { from:"백엔드", to:"DB", label:"정제 데이터 적재 (배치)" },
    { from:"DB", to:"프론트엔드", label:"REST API 응답 (JSON)" },
  ];

  return (
    <div style={{ padding:"24px 0" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:16 }}>
        {layers.map((layer, i) => (
          <div key={layer.title}>
            {/* 레이어 박스 */}
            <div style={{ border:`1px solid ${layer.color}44`, borderRadius:10, overflow:"hidden" }}>
              <div style={{ padding:"10px 16px", background:`${layer.color}18`,
                borderBottom:`1px solid ${layer.color}33`, display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:layer.color }} />
                <span style={{ fontSize:13, fontWeight:"bold", color:layer.color, letterSpacing:0.5 }}>
                  {layer.title}
                </span>
              </div>
              <div style={{ padding:12, display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:8 }}>
                {layer.items.map(item => (
                  <div key={item.name} style={{ padding:"8px 12px", background:"rgba(15,23,42,0.6)",
                    borderRadius:6, border:`1px solid ${layer.color}22` }}>
                    <div style={{ fontSize:12, color:C.text, marginBottom:3 }}>{item.name}</div>
                    <div style={{ fontSize:10, color:C.muted }}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 화살표 */}
            {i < layers.length - 1 && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                padding:"8px 0", gap:8 }}>
                <div style={{ height:1, flex:1, background:`linear-gradient(to right, transparent, ${C.border})` }} />
                <div style={{ fontSize:10, color:C.muted, whiteSpace:"nowrap",
                  padding:"3px 10px", border:`1px solid ${C.border}`, borderRadius:20 }}>
                  {connections[i]?.label}
                </div>
                <div style={{ fontSize:16, color:C.accent }}>↓</div>
                <div style={{ height:1, flex:1, background:`linear-gradient(to left, transparent, ${C.border})` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 기술 스택 뱃지 */}
      <div style={{ marginTop:24, padding:16, background:"rgba(14,165,233,0.06)",
        border:`1px solid ${C.accent}33`, borderRadius:10 }}>
        <div style={{ fontSize:11, color:C.accent, letterSpacing:1, marginBottom:12 }}>TECH STACK</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {["React","FastAPI","PostgreSQL","PostGIS","Python 3.12","Docker","pyproj (좌표변환)",
            "RDF/SPARQL","Node.js v20","REST API","Canvas API","공공데이터포털"].map(t => (
            <span key={t} style={{ padding:"4px 10px", fontSize:11, borderRadius:4,
              background:"rgba(148,163,184,0.08)", border:`1px solid ${C.border}`,
              color:C.sub }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 데이터 흐름 다이어그램 ──────────────────
function DataFlowDiagram() {
  const steps = [
    {
      step:"01", title:"데이터 수집",
      color:C.purple,
      icon:"📡",
      items:[
        "공공데이터포털 API 호출 (REST/JSON)",
        "CSV 파일 직접 다운로드 (질병정보 117건)",
        "배치 처리로 70,650건+ 문화시설 수집",
        "Incremental Sync — 매일 변동 상태 업데이트",
      ],
    },
    {
      step:"02", title:"데이터 정제",
      color:C.accent,
      icon:"🔧",
      items:[
        "EPSG:5174 (Bessel) → WGS84 좌표 변환 (pyproj)",
        "폐업 업체 필터링 (SALS_STTS_CD ≠ '01')",
        "시설명 + 좌표 기반 중복 제거 (10m 이내)",
        "주소 정규화 → 시/도, 구/군 단위 추출",
        "병원체명·질병명 한영 혼용 표준화",
      ],
    },
    {
      step:"03", title:"지식그래프 구축",
      color:C.green,
      icon:"🕸️",
      items:[
        "RDF 트리플 생성 (Subject-Predicate-Object)",
        "엔티티 URI 전략: ex:facility/{type}/{MNG_NO}",
        "Schema.org 표준 온톨로지 매핑",
        "증상코드 → 질병명 조인 (KISTI ↔ 검역본부)",
        "보호소-관광지-의료시설 공간 관계 연결",
      ],
    },
    {
      step:"04", title:"API 서비스",
      color:C.orange,
      icon:"⚡",
      items:[
        "FastAPI REST 엔드포인트 제공",
        "PostGIS 공간 쿼리 (근처 N km 시설 검색)",
        "SPARQL 추론: 증상 → 질병 → 병원 추천",
        "구조동물 RFID ↔ 분실동물 크로스 매칭",
      ],
    },
    {
      step:"05", title:"UI 표현",
      color:C.pink,
      icon:"🎨",
      items:[
        "Canvas 기반 Force-directed 지식그래프",
        "지도 마커 (동물병원·보호센터·관광지)",
        "반려동물 건강 챗봇 (증상 입력 → 추천)",
        "입양 대기 동물 카드 (실시간 API)",
      ],
    },
  ];

  return (
    <div style={{ padding:"24px 0" }}>
      {/* 흐름 스텝 */}
      <div style={{ position:"relative" }}>
        {/* 수직 라인 */}
        <div style={{ position:"absolute", left:28, top:30, bottom:30,
          width:2, background:`linear-gradient(to bottom, ${C.purple}, ${C.pink})`,
          borderRadius:1, zIndex:0 }} />

        {steps.map((s, i) => (
          <div key={s.step} style={{ display:"flex", gap:20, marginBottom:i < steps.length-1 ? 20 : 0,
            position:"relative", zIndex:1 }}>
            {/* 스텝 번호 */}
            <div style={{ width:56, height:56, borderRadius:"50%", flexShrink:0,
              background:`${s.color}22`, border:`2px solid ${s.color}88`,
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              fontSize:9, fontWeight:"bold", color:s.color, gap:1 }}>
              <span style={{ fontSize:16 }}>{s.icon}</span>
              <span style={{ letterSpacing:0.5 }}>{s.step}</span>
            </div>

            {/* 내용 */}
            <div style={{ flex:1, paddingTop:6 }}>
              <div style={{ fontSize:14, fontWeight:"bold", color:s.color, marginBottom:10 }}>
                {s.title}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {s.items.map(item => (
                  <div key={item} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                    <span style={{ color:s.color, fontSize:10, marginTop:2, flexShrink:0 }}>▸</span>
                    <span style={{ fontSize:11, color:C.sub, lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 핵심 관계 테이블 */}
      <div style={{ marginTop:28, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
        <div style={{ padding:"10px 16px", background:"rgba(14,165,233,0.06)",
          borderBottom:`1px solid ${C.border}`, fontSize:11, color:C.accent, letterSpacing:1 }}>
          🔗 핵심 지식그래프 관계 (RDF Triple 예시)
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
            <thead>
              <tr style={{ background:"rgba(15,23,42,0.6)" }}>
                {["Subject (주어)", "Predicate (술어)", "Object (목적어)", "출처 API"].map(h => (
                  <th key={h} style={{ padding:"8px 12px", textAlign:"left", color:C.muted,
                    borderBottom:`1px solid ${C.border}`, fontWeight:"normal", whiteSpace:"nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["ex:Animal/dog/12345", "hasSymptom", "ex:Symptom/구토",        "KISTI 증상분류"],
                ["ex:Symptom/구토",     "indicatesDisease","ex:Disease/개파보",  "농림축산검역본부"],
                ["ex:Disease/개파보",   "treatedBy",   "ex:Hospital/123",        "행정안전부 동물병원"],
                ["ex:Hospital/123",    "locatedIn",   "ex:Region/서울/강남구",   "행정안전부"],
                ["ex:Shelter/456",     "manages",     "ex:Animal/abandoned/789", "구조동물 API"],
                ["ex:PetFriendly/999", "hasRule",     "ex:PetPolicy/10kg이하",   "한국관광공사"],
                ["ex:Animal/lost/111", "matchingCand","ex:Animal/rescued/222",   "분실↔구조 매칭"],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.border}`,
                  background: i % 2 === 0 ? "transparent" : "rgba(15,23,42,0.3)" }}>
                  <td style={{ padding:"7px 12px", color:C.accent, fontFamily:"monospace" }}>{row[0]}</td>
                  <td style={{ padding:"7px 12px", color:C.green  }}>{row[1]}</td>
                  <td style={{ padding:"7px 12px", color:C.text,  fontFamily:"monospace" }}>{row[2]}</td>
                  <td style={{ padding:"7px 12px", color:C.muted  }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── 목업 페이지 ─────────────────────────────
function MockupPage() {
  const [activeMock, setActiveMock] = useState("dashboard");

  const screens = {
    dashboard: {
      title:"메인 대시보드",
      desc:"반려동물 서비스 통합 현황 요약",
      preview: () => (
        <div style={{ background:"#0a0f1e", borderRadius:8, overflow:"hidden", height:360 }}>
          {/* 상단 바 */}
          <div style={{ padding:"10px 16px", background:"#0f172a",
            borderBottom:`1px solid ${C.border}`, display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontSize:14, color:C.accent, fontWeight:"bold" }}>🐾 Pet-Graph</span>
            {["대시보드","지식그래프","지도","입양","보고서"].map(m => (
              <span key={m} style={{ fontSize:10, color: m==="대시보드" ? C.text : C.muted,
                padding:"2px 6px", borderRadius:3,
                background: m==="대시보드" ? "rgba(14,165,233,0.15)" : "transparent" }}>{m}</span>
            ))}
          </div>
          {/* KPI 카드 */}
          <div style={{ padding:12, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {[
              { label:"등록 시설", value:"124,832", color:C.accent, icon:"🏥" },
              { label:"보호 동물", value:"8,241",   color:C.orange, icon:"🐾" },
              { label:"분실 신고", value:"312",     color:C.red,    icon:"🔍" },
              { label:"반려 여행지", value:"3,509", color:C.green,  icon:"🗺️" },
            ].map(k => (
              <div key={k.label} style={{ padding:10, background:"rgba(255,255,255,0.03)",
                border:`1px solid ${k.color}33`, borderRadius:8 }}>
                <div style={{ fontSize:16 }}>{k.icon}</div>
                <div style={{ fontSize:16, fontWeight:"bold", color:k.color, marginTop:4 }}>{k.value}</div>
                <div style={{ fontSize:9, color:C.muted }}>{k.label}</div>
              </div>
            ))}
          </div>
          {/* 차트 영역 */}
          <div style={{ padding:"0 12px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:8, padding:10 }}>
              <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>지역별 시설 분포</div>
              {[["서울",85],["경기",72],["부산",41],["인천",33],["대구",28]].map(([r,v]) => (
                <div key={r} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                  <span style={{ fontSize:9, color:C.sub, width:24 }}>{r}</span>
                  <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.05)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ width:`${v}%`, height:"100%", background:C.accent, borderRadius:3 }} />
                  </div>
                  <span style={{ fontSize:9, color:C.muted }}>{v}%</span>
                </div>
              ))}
            </div>
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:8, padding:10 }}>
              <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>질병 원인 분류</div>
              {[["바이러스",C.red,28],["세균",C.orange,25],["기생충",C.green,9],["기타",C.muted,50]].map(([nm,col,v]) => (
                <div key={nm} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:col, flexShrink:0 }} />
                  <span style={{ fontSize:9, color:C.sub, flex:1 }}>{nm}</span>
                  <span style={{ fontSize:9, color:col, fontWeight:"bold" }}>{v}건</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    map: {
      title:"지도 뷰",
      desc:"반려동물 시설 위치 지도 (WGS84 좌표 기반)",
      preview: () => (
        <div style={{ background:"#1a2744", borderRadius:8, overflow:"hidden", height:360, position:"relative" }}>
          {/* 지도 배경 시뮬레이션 */}
          <div style={{ position:"absolute", inset:0,
            backgroundImage:`repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(148,163,184,0.08) 40px),
              repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(148,163,184,0.08) 40px)` }} />
          {/* 도로 느낌 */}
          {[[60,0,60,100],[30,0,30,100],[80,0,80,100]].map(([x1,y1,x2,y2],i) => (
            <div key={i} style={{ position:"absolute", left:`${x1}%`, top:`${y1}%`,
              width:2, height:"100%", background:"rgba(148,163,184,0.08)" }} />
          ))}
          {/* 마커들 */}
          {[
            { x:20, y:30, color:C.accent, icon:"🏥", label:"동물병원" },
            { x:40, y:50, color:C.green,  icon:"🌳", label:"반려공원" },
            { x:65, y:35, color:C.orange, icon:"🏠", label:"보호센터" },
            { x:50, y:65, color:C.purple, icon:"☕", label:"반려카페" },
            { x:75, y:60, color:C.pink,   icon:"✂️", label:"미용업" },
            { x:30, y:70, color:C.yellow, icon:"🗺️", label:"관광지" },
          ].map(m => (
            <div key={m.label} style={{ position:"absolute", left:`${m.x}%`, top:`${m.y}%`,
              transform:"translate(-50%,-50%)", zIndex:10 }}>
              <div style={{ width:28, height:28, borderRadius:"50%",
                background:`${m.color}cc`, border:`2px solid ${m.color}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, cursor:"pointer",
                boxShadow:`0 0 10px ${m.color}66` }}>
                {m.icon}
              </div>
              <div style={{ fontSize:9, color:C.text, textAlign:"center", marginTop:2,
                background:"rgba(0,0,0,0.6)", padding:"1px 4px", borderRadius:3, whiteSpace:"nowrap" }}>
                {m.label}
              </div>
            </div>
          ))}
          {/* 필터 패널 */}
          <div style={{ position:"absolute", top:10, left:10, background:"rgba(15,23,42,0.9)",
            border:`1px solid ${C.border}`, borderRadius:8, padding:10 }}>
            <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>시설 필터</div>
            {[
              { icon:"🏥", label:"동물병원", color:C.accent  },
              { icon:"🌳", label:"반려공원", color:C.green   },
              { icon:"🏠", label:"보호센터", color:C.orange  },
            ].map(f => (
              <div key={f.label} style={{ display:"flex", gap:6, alignItems:"center", marginBottom:4 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:f.color }} />
                <span style={{ fontSize:9, color:C.sub }}>{f.label}</span>
              </div>
            ))}
          </div>
          {/* 팝업 */}
          <div style={{ position:"absolute", right:10, bottom:10,
            background:"rgba(15,23,42,0.95)", border:`1px solid ${C.accent}44`,
            borderRadius:8, padding:12, width:140 }}>
            <div style={{ fontSize:11, fontWeight:"bold", color:C.text, marginBottom:4 }}>🏥 행복동물병원</div>
            <div style={{ fontSize:9, color:C.muted, marginBottom:6 }}>서울 강남구 역삼동 123</div>
            <div style={{ fontSize:9, color:C.green }}>● 영업중</div>
            <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>02-1234-5678</div>
          </div>
        </div>
      ),
    },
    chatbot: {
      title:"건강 챗봇",
      desc:"증상 입력 → 질병 추론 → 병원 추천",
      preview: () => (
        <div style={{ background:"#0a0f1e", borderRadius:8, overflow:"hidden", height:360,
          display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"10px 16px", background:"#0f172a",
            borderBottom:`1px solid ${C.border}`, fontSize:12, color:C.text, fontWeight:"bold" }}>
            🩺 반려동물 건강 어시스턴트
          </div>
          <div style={{ flex:1, padding:12, overflowY:"auto", display:"flex", flexDirection:"column", gap:10 }}>
            {/* 봇 메시지 */}
            <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:C.accent,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>🐾</div>
              <div style={{ background:"rgba(14,165,233,0.08)", border:`1px solid ${C.accent}33`,
                borderRadius:"0 8px 8px 8px", padding:"8px 12px", maxWidth:"75%" }}>
                <div style={{ fontSize:11, color:C.text }}>
                  안녕하세요! 반려동물의 증상을 알려주세요. 어떤 증상이 있나요?
                </div>
              </div>
            </div>
            {/* 사용자 메시지 */}
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <div style={{ background:"rgba(52,211,153,0.12)", border:`1px solid ${C.green}33`,
                borderRadius:"8px 0 8px 8px", padding:"8px 12px", maxWidth:"75%" }}>
                <div style={{ fontSize:11, color:C.text }}>우리 강아지가 구토를 자꾸 해요 😢</div>
              </div>
            </div>
            {/* 봇 추론 응답 */}
            <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:C.accent,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>🐾</div>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ background:"rgba(14,165,233,0.08)", border:`1px solid ${C.accent}33`,
                  borderRadius:"0 8px 8px 8px", padding:"8px 12px" }}>
                  <div style={{ fontSize:11, color:C.text, marginBottom:6 }}>
                    구토 증상과 관련된 의심 질병을 분석했어요:
                  </div>
                  {[
                    { name:"개파보바이러스감염증", prob:"높음", color:C.red   },
                    { name:"개코로나바이러스감염증",prob:"중간", color:C.orange },
                    { name:"크립토스포리디움증",   prob:"낮음", color:C.yellow },
                  ].map(d => (
                    <div key={d.name} style={{ display:"flex", justifyContent:"space-between",
                      padding:"3px 0", borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:10, color:C.sub }}>{d.name}</span>
                      <span style={{ fontSize:10, color:d.color }}>{d.prob}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"rgba(52,211,153,0.06)", border:`1px solid ${C.green}33`,
                  borderRadius:8, padding:"8px 12px" }}>
                  <div style={{ fontSize:10, color:C.green, marginBottom:4 }}>📍 근처 추천 동물병원 (3km 내)</div>
                  {["행복동물병원 (0.8km)", "강남24시동물병원 (1.2km)"].map(h => (
                    <div key={h} style={{ fontSize:10, color:C.sub, padding:"2px 0" }}>▸ {h}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* 입력창 */}
          <div style={{ padding:10, borderTop:`1px solid ${C.border}`, display:"flex", gap:8 }}>
            <div style={{ flex:1, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`,
              borderRadius:6, padding:"6px 10px", fontSize:10, color:C.muted }}>
              증상을 입력하세요...
            </div>
            <div style={{ width:32, height:32, borderRadius:6, background:C.accent,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, cursor:"pointer" }}>
              ↑
            </div>
          </div>
        </div>
      ),
    },
    adoption: {
      title:"입양 정보",
      desc:"구조/보호 동물 입양 카드 뷰",
      preview: () => (
        <div style={{ background:"#0a0f1e", borderRadius:8, overflow:"hidden", height:360, padding:12 }}>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            {["전체","강아지","고양이","기타"].map((f,i) => (
              <span key={f} style={{ padding:"4px 10px", fontSize:10, borderRadius:20, cursor:"pointer",
                background: i===0 ? C.accent : "rgba(255,255,255,0.05)",
                color: i===0 ? "#fff" : C.muted,
                border: `1px solid ${i===0 ? C.accent : C.border}` }}>{f}</span>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {[
              { name:"코코",   breed:"말티즈",    age:"2세", sex:"M", status:"입양가능", color:C.green  },
              { name:"나비",   breed:"코리안숏헤어",age:"1세",sex:"F", status:"보호중",  color:C.orange },
              { name:"뭉치",   breed:"진돗개",    age:"3세", sex:"M", status:"입양가능", color:C.green  },
              { name:"하양이", breed:"페르시안",   age:"4세", sex:"F", status:"입양가능", color:C.green  },
              { name:"초코",   breed:"포메라니안", age:"1세", sex:"M", status:"보호중",  color:C.orange },
              { name:"미미",   breed:"러시안블루", age:"2세", sex:"F", status:"입양가능", color:C.green  },
            ].map(a => (
              <div key={a.name} style={{ background:"rgba(255,255,255,0.03)",
                border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden" }}>
                <div style={{ height:60, background:`linear-gradient(135deg, ${a.color}22, rgba(255,255,255,0.02))`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
                  {a.sex === "M" ? "🐕" : "🐈"}
                </div>
                <div style={{ padding:6 }}>
                  <div style={{ fontSize:11, fontWeight:"bold", color:C.text }}>{a.name}</div>
                  <div style={{ fontSize:9, color:C.muted }}>{a.breed} · {a.age} · {a.sex}</div>
                  <div style={{ marginTop:4, fontSize:9, color:a.color,
                    padding:"1px 5px", borderRadius:3, background:`${a.color}15`,
                    display:"inline-block" }}>{a.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  };

  return (
    <div style={{ padding:"24px 0" }}>
      {/* 탭 선택 */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {Object.entries(screens).map(([id, s]) => (
          <button key={id} onClick={() => setActiveMock(id)}
            style={{ padding:"8px 16px", fontSize:12, borderRadius:6, cursor:"pointer",
              background: activeMock === id ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.03)",
              color: activeMock === id ? C.accent : C.muted,
              border: `1px solid ${activeMock === id ? C.accent : C.border}`,
              transition:"all 0.2s" }}>
            {s.title}
          </button>
        ))}
      </div>

      {/* 화면 설명 */}
      <div style={{ marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:3, height:20, background:C.accent, borderRadius:2 }} />
        <div>
          <div style={{ fontSize:14, fontWeight:"bold", color:C.text }}>{screens[activeMock].title}</div>
          <div style={{ fontSize:11, color:C.muted }}>{screens[activeMock].desc}</div>
        </div>
      </div>

      {/* 브라우저 프레임 */}
      <div style={{ border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
        <div style={{ padding:"8px 12px", background:"#0f172a",
          borderBottom:`1px solid ${C.border}`, display:"flex", gap:6, alignItems:"center" }}>
          {["#ef4444","#fbbf24","#34d399"].map(c => (
            <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }} />
          ))}
          <div style={{ flex:1, margin:"0 10px", background:"rgba(255,255,255,0.05)",
            borderRadius:4, padding:"3px 10px", fontSize:10, color:C.muted }}>
            localhost:3000/{activeMock}
          </div>
        </div>
        {screens[activeMock].preview()}
      </div>

      {/* 화면 목록 */}
      <div style={{ marginTop:20, display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
        {[
          { screen:"메인 대시보드",    path:"/",          desc:"KPI, 지역분포, 질병통계 한눈에" },
          { screen:"지식그래프 뷰",    path:"/knowledge", desc:"Canvas Force-directed 그래프" },
          { screen:"반려동물 지도",    path:"/map",       desc:"WGS84 기반 시설 위치 지도" },
          { screen:"입양 정보",       path:"/adoption",  desc:"구조동물 카드형 목록 + 필터" },
          { screen:"건강 챗봇",       path:"/chatbot",   desc:"증상 → 추론 → 병원 추천" },
          { screen:"보고서 페이지",    path:"/report",    desc:"아키텍처, 데이터흐름, 목업" },
        ].map(p => (
          <div key={p.path} style={{ padding:"10px 14px",
            background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`,
            borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:12, color:C.text }}>{p.screen}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{p.desc}</div>
            </div>
            <div style={{ fontSize:10, color:C.accent, fontFamily:"monospace",
              padding:"2px 8px", background:"rgba(14,165,233,0.1)",
              border:`1px solid ${C.accent}33`, borderRadius:4 }}>
              {p.path}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────
export default function ReportPage() {
  const [activeTab, setActiveTab] = useState("arch");

  return (
    <div style={{ minHeight:"100vh", background:C.bg,
      fontFamily:"'Courier New', Courier, monospace", color:C.text }}>

      {/* 헤더 */}
      <div style={{ padding:"20px 32px", borderBottom:`1px solid ${C.border}`,
        background:"rgba(15,23,42,0.8)", backdropFilter:"blur(8px)",
        position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:20, fontWeight:"bold", letterSpacing:2, marginBottom:4 }}>
                <span style={{ color:C.accent }}>PET-GRAPH</span>
                <span style={{ color:C.sub, marginLeft:8 }}>/ 시스템 보고서</span>
              </div>
              <div style={{ fontSize:11, color:C.muted }}>
                반려동물 지식그래프 기반 웹 서비스 — 14개 공공데이터셋 통합
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {[
                { label:"Node.js v20", color:C.green },
                { label:"Python 3.12", color:C.accent },
                { label:"PostgreSQL",  color:C.purple },
              ].map(b => (
                <span key={b.label} style={{ fontSize:10, padding:"3px 10px", borderRadius:4,
                  background:`${b.color}15`, border:`1px solid ${b.color}44`, color:b.color }}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* 탭 */}
          <div style={{ display:"flex", gap:4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ padding:"8px 18px", fontSize:12, borderRadius:"6px 6px 0 0",
                  cursor:"pointer", transition:"all 0.2s",
                  background: activeTab === t.id ? C.accent : "transparent",
                  color: activeTab === t.id ? "#fff" : C.muted,
                  border: `1px solid ${activeTab === t.id ? C.accent : C.border}`,
                  borderBottom: activeTab === t.id ? `1px solid ${C.accent}` : `1px solid ${C.border}` }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 32px 48px" }}>
        {activeTab === "arch"     && <ArchDiagram   />}
        {activeTab === "dataflow" && <DataFlowDiagram />}
        {activeTab === "mockup"   && <MockupPage    />}
      </div>
    </div>
  );
}
