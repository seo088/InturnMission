import { useState } from "react";

/* ─────────────────────────────────────────────────────────────
   색상 상수
───────────────────────────────────────────────────────────── */
const C = {
  bg:       "#f8fafc",
  white:    "#ffffff",
  border:   "#e2e8f0",
  txt:      "#0f172a",
  txts:     "#334155",
  txtm:     "#64748b",
  txtl:     "#94a3b8",
  // Layer 색상 — 교수님용 명확한 구분
  L1:       "#7c3aed",   // 데이터소스
  L2:       "#0284c7",   // 백엔드
  L3:       "#16a34a",   // DB
  L4:       "#ea580c",   // 프론트엔드
  // 기타
  accent:   "#0284c7",
  green:    "#16a34a",
  orange:   "#ea580c",
  purple:   "#7c3aed",
};

/* ─────────────────────────────────────────────────────────────
   포트 & 개발환경 데이터
───────────────────────────────────────────────────────────── */
const PORTS = [
  { port:4441, label:"VS Code SSH",    desc:"원격 서버 접속",  status:"connected", layer:"운영", color:"#6d28d9" },
  { port:5175, label:"Vite Dev Server",desc:"프론트엔드 개발서버",status:"running", layer:"L4 프론트엔드", color:C.L4 },
  { port:8000, label:"FastAPI Uvicorn",desc:"백엔드 API 서버",  status:"running",   layer:"L2 백엔드",    color:C.L2 },
  { port:5435, label:"PostgreSQL",     desc:"데이터베이스",    status:"connected",  layer:"L3 DB",       color:C.L3 },
];

const DEV_ENV = [
  { label:"Frontend",  stack:"React 18 + Vite + Tailwind CSS",   color:C.L4, port:5175 },
  { label:"Backend",   stack:"FastAPI + Uvicorn (Python 3.12)",   color:C.L2, port:8000 },
  { label:"Database",  stack:"PostgreSQL (PostGIS 확장)",         color:C.L3, port:5435 },
  { label:"Dev IDE",   stack:"VS Code Remote SSH",                color:"#6d28d9", port:4441 },
];

/* ─────────────────────────────────────────────────────────────
   아키텍처 레이어 정의
───────────────────────────────────────────────────────────── */
const ARCH_LAYERS = [
  {
    num:"L1", title:"데이터 소스 레이어", subtitle:"15개 공공 API · 외부 데이터 수집",
    color:C.L1, port:null,
    desc:"외부 공공기관 API에서 원시 데이터(Raw Data)를 수집합니다. REST API 호출 및 CSV 파일 다운로드 방식을 사용합니다.",
    chips:[
      "행정안전부 동물병원", "동물약국", "동물미용업", "동물위탁관리업", "동물장묘업",
      "한국문화정보원 문화시설 (7만건)", "한국관광공사 반려동물여행",
      "한국도로공사 휴게소", "농림축산검역본부 구조동물", "분실동물", "동물보호센터",
      "동물질병정보 (CSV 117건)", "KISTI 질병증상분류",
      "공공데이터포털 입양정보", "동물이름통계 ★NEW",
    ],
  },
  {
    num:"L2", title:"백엔드 레이어", subtitle:"FastAPI + Uvicorn · :8000",
    color:C.L2, port:8000,
    desc:"수집된 원시 데이터를 정제하고 지식그래프(RDF Triple)로 변환합니다. REST API 엔드포인트를 통해 프론트엔드에 데이터를 제공합니다.",
    chips:[
      "FastAPI (Python 3.12)", "Uvicorn ASGI 서버",
      "pyproj 좌표변환 (EPSG:5174→WGS84)", "폐업 업체 필터링",
      "Entity Resolution (중복 제거 10m)", "RDF Triple 생성",
      "SPARQL 추론 엔진", "배치 스케줄러",
    ],
  },
  {
    num:"L3", title:"데이터베이스 레이어", subtitle:"PostgreSQL + PostGIS · :5435",
    color:C.L3, port:5435,
    desc:"정제된 데이터를 영구 저장합니다. PostGIS 확장으로 공간 데이터 쿼리, RDF Store로 지식그래프 트리플을 관리합니다.",
    chips:[
      "PostgreSQL (PostGIS 확장)", "공간 인덱스 (GiST)",
      "RDF Store (트리플 저장)", "매핑 테이블 (15개 데이터셋)",
      "메타데이터 관리 (출처·기준시점)", "인증 & 세션 스토어",
    ],
  },
  {
    num:"L4", title:"프론트엔드 레이어", subtitle:"React + Vite + Tailwind · :5175",
    color:C.L4, port:5175,
    desc:"사용자가 실제로 보는 화면입니다. Vite 번들러로 빠른 개발 서버를 구동하며 Tailwind CSS로 스타일링합니다.",
    chips:[
      "React 18 + Vite", "Tailwind CSS",
      "지식그래프 페이지 (Canvas)", "반려동물 지도",
      "데이터셋 매핑 테이블 (Accordion)", "건강 챗봇",
      "입양 정보 카드", "시스템 보고서 (본 페이지)",
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   아키텍처 탭
───────────────────────────────────────────────────────────── */
function ArchTab() {
  const layerColors = { L1:C.L1, L2:C.L2, L3:C.L3, L4:C.L4 };

  return (
    <div style={{ padding:"4px 0 32px" }}>

      {/* ── 개발환경 & 포트 헤더 카드 ── */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10,
        padding:"18px 24px", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <div style={{ width:4, height:20, background:C.accent, borderRadius:2 }}/>
          <span style={{ fontSize:14, fontWeight:700, color:C.txt }}>개발 환경 구성</span>
        </div>

        {/* 개발 스택 */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
          {DEV_ENV.map(d => (
            <div key={d.label} style={{ padding:"10px 12px", borderRadius:8,
              background:`${d.color}0d`, border:`1px solid ${d.color}33` }}>
              <div style={{ fontSize:10, color:d.color, fontWeight:700,
                letterSpacing:0.5, textTransform:"uppercase", marginBottom:4 }}>
                {d.label}
              </div>
              <div style={{ fontSize:11, color:C.txts, lineHeight:1.4 }}>{d.stack}</div>
              <div style={{ marginTop:5, display:"inline-flex", alignItems:"center", gap:4,
                background:`${d.color}15`, borderRadius:4,
                padding:"2px 7px" }}>
                <span style={{ fontSize:9, color:d.color, fontFamily:"monospace",
                  fontWeight:700 }}>:{d.port}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 포트 테이블 */}
        <div>
          <div style={{ fontSize:11, color:C.txtm, letterSpacing:0.8,
            textTransform:"uppercase", marginBottom:8 }}>포트 현황</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
              <thead>
                <tr style={{ background:"#f8fafc" }}>
                  {["포트","서비스","용도","레이어","상태"].map(h => (
                    <th key={h} style={{ padding:"7px 12px", textAlign:"left",
                      borderBottom:`1px solid ${C.border}`, color:C.txtm,
                      fontWeight:500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PORTS.map((p, i) => (
                  <tr key={p.port} style={{ borderBottom:`1px solid #f8fafc`,
                    background: i%2===0 ? C.white : "#fafafa" }}>
                    <td style={{ padding:"7px 12px" }}>
                      <code style={{ fontSize:12, fontWeight:700, color:p.color,
                        background:`${p.color}10`, padding:"2px 8px",
                        borderRadius:4 }}>:{p.port}</code>
                    </td>
                    <td style={{ padding:"7px 12px", fontWeight:600, color:C.txts }}>{p.label}</td>
                    <td style={{ padding:"7px 12px", color:C.txtm }}>{p.desc}</td>
                    <td style={{ padding:"7px 12px" }}>
                      <span style={{ fontSize:10, padding:"2px 8px", borderRadius:4,
                        background:`${p.color}12`, color:p.color, fontWeight:600 }}>
                        {p.layer}
                      </span>
                    </td>
                    <td style={{ padding:"7px 12px" }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:4,
                        fontSize:10, color: p.status==="running" ? C.green : C.accent }}>
                        <span style={{ width:6, height:6, borderRadius:"50%",
                          background: p.status==="running" ? C.green : C.accent,
                          display:"inline-block" }}/>
                        {p.status==="running" ? "실행중" : "연결됨"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 4-Layer 아키텍처 ── */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10,
        padding:"18px 24px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <div style={{ width:4, height:20, background:C.accent, borderRadius:2 }}/>
          <span style={{ fontSize:14, fontWeight:700, color:C.txt }}>4-Layer 시스템 아키텍처</span>
        </div>
        <div style={{ fontSize:11, color:C.txtm, marginBottom:20 }}>
          각 레이어는 단방향 의존성을 가집니다 — L1(수집) → L2(처리) → L3(저장) → L4(표현)
        </div>

        {ARCH_LAYERS.map((layer, idx) => (
          <div key={layer.num}>
            {/* 레이어 박스 */}
            <div style={{ borderRadius:10, overflow:"hidden",
              border:`1.5px solid ${layer.color}44`,
              boxShadow:`0 1px 4px ${layer.color}18` }}>

              {/* 레이어 헤더 */}
              <div style={{ padding:"12px 18px", background:`${layer.color}0e`,
                borderBottom:`1px solid ${layer.color}22`,
                display:"flex", alignItems:"center", gap:12 }}>
                {/* 레이어 번호 배지 */}
                <div style={{ width:36, height:36, borderRadius:8,
                  background:layer.color, display:"flex", alignItems:"center",
                  justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:12, fontWeight:800, color:"#fff" }}>{layer.num}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:layer.color }}>
                    {layer.title}
                  </div>
                  <div style={{ fontSize:11, color:C.txtm, marginTop:1 }}>
                    {layer.subtitle}
                  </div>
                </div>
                {layer.port && (
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:10, color:C.txtl, marginBottom:2 }}>실행 포트</div>
                    <code style={{ fontSize:14, fontWeight:800, color:layer.color,
                      background:`${layer.color}15`, padding:"3px 10px",
                      borderRadius:5 }}>:{layer.port}</code>
                  </div>
                )}
              </div>

              {/* 레이어 내용 */}
              <div style={{ padding:"12px 18px 14px" }}>
                <div style={{ fontSize:11, color:C.txtm, lineHeight:1.6,
                  marginBottom:10, paddingBottom:10,
                  borderBottom:`1px solid ${C.border}` }}>
                  {layer.desc}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {layer.chips.map(chip => (
                    <span key={chip} style={{ padding:"4px 10px", fontSize:11,
                      borderRadius:5, border:`1px solid ${layer.color}30`,
                      background:`${layer.color}08`, color:C.txts,
                      transition:"all 0.15s" }}>
                      {chip.includes("★NEW") ? (
                        <><span style={{ color:C.accent, fontWeight:700 }}>★ </span>{chip.replace(" ★NEW","")}</>
                      ) : chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 레이어 간 화살표 */}
            {idx < ARCH_LAYERS.length - 1 && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                padding:"10px 0", gap:8 }}>
                <div style={{ height:1, flex:1,
                  background:`linear-gradient(to right,transparent,${C.border})` }}/>
                <div style={{ display:"flex", flexDirection:"column",
                  alignItems:"center", gap:3 }}>
                  <span style={{ fontSize:10, color:C.txtl, whiteSpace:"nowrap",
                    padding:"2px 10px", border:`1px solid ${C.border}`,
                    borderRadius:16, background:C.white }}>
                    {{0:"API 호출 / CSV 배치 수집",
                      1:"정제 데이터 적재 (배치)",
                      2:"REST API 응답 (JSON)"}[idx]}
                  </span>
                  <span style={{ fontSize:16, color:C.txtl, lineHeight:1 }}>↓</span>
                </div>
                <div style={{ height:1, flex:1,
                  background:`linear-gradient(to left,transparent,${C.border})` }}/>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   데이터 흐름 탭
───────────────────────────────────────────────────────────── */
const FLOW_STEPS = [
  {
    num:"01", title:"수집 (Collect)", layer:"L1", color:C.L1, port:null,
    items:[
      "공공 API 15종 REST 호출 (JSON/XML)",
      "CSV 파일 직접 다운로드 (질병정보 117건)",
      "배치 처리 — 문화시설 70,650건",
      "동물이름통계 수집 (15번째 데이터셋 신규)",
      "Incremental Sync — 매일 00:00 변동분 업데이트",
    ],
  },
  {
    num:"02", title:"정제 (Cleanse)", layer:"L2", color:C.L2, port:8000,
    items:[
      "EPSG:5174(Bessel) → WGS84 좌표 변환 (pyproj)",
      "폐업 업체 필터링 (SALS_STTS_CD ≠ '01')",
      "시설명 + 좌표 기반 중복 제거 (반경 10m 이내)",
      "주소 정규화 → 시/도 · 구/군 단위 계층 추출",
      "병원체·질병명 한영 혼용 표준화",
    ],
  },
  {
    num:"03", title:"변환 (Transform)", layer:"L2→L3", color:C.L3, port:5435,
    items:[
      "RDF Triple 생성 (Subject–Predicate–Object)",
      "엔티티 URI 전략: ex:facility/{type}/{MNG_NO}",
      "Schema.org 표준 온톨로지 매핑",
      "KISTI 증상분류 ↔ 검역본부 질병정보 조인",
      "PostGIS 공간 인덱스 (GiST) 구성",
    ],
  },
  {
    num:"04", title:"서비스 (Serve)", layer:"L2 API", color:C.L2, port:8000,
    items:[
      "FastAPI REST 엔드포인트 제공 (:8000)",
      "PostGIS 공간 쿼리 — 반경 N km 시설 검색",
      "SPARQL 추론: 증상 → 질병 → 병원 추천",
      "구조동물 RFID ↔ 분실동물 크로스 매칭",
    ],
  },
  {
    num:"05", title:"표현 (Present)", layer:"L4", color:C.L4, port:5175,
    items:[
      "Canvas Force-directed 지식그래프 (:5175)",
      "WGS84 마커 기반 반려동물 지도",
      "Accordion 데이터셋 매핑 테이블 (15개)",
      "증상 입력 → 질병 추론 → 병원 추천 챗봇",
    ],
  },
];

const RDF_TRIPLES = [
  {s:"ex:Animal/dog/12345", p:"hasSymptom",        o:"ex:Symptom/구토",          src:"KISTI 증상분류"},
  {s:"ex:Symptom/구토",     p:"indicatesDisease",   o:"ex:Disease/개파보",         src:"농림축산검역본부"},
  {s:"ex:Disease/개파보",   p:"treatedBy",          o:"ex:Hospital/366000001",     src:"행정안전부 동물병원"},
  {s:"ex:Hospital/366...",  p:"locatedIn",          o:"ex:Region/서울/강남구",      src:"행정안전부"},
  {s:"ex:Shelter/456",      p:"manages",            o:"ex:Animal/abandoned/789",   src:"구조동물 API"},
  {s:"ex:LostAnimal/777",   p:"matchingCandidate",  o:"ex:Animal/rescued/789",     src:"분실↔구조 RFID 매칭"},
  {s:'ex:PetName/"코코"',   p:"koah:frequency",    o:"12845",                      src:"동물이름통계 ★NEW"},
];

function DataFlowTab() {
  return (
    <div style={{ padding:"4px 0 32px" }}>

      {/* 흐름 스텝 */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`,
        borderRadius:10, padding:"18px 24px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:4, height:20, background:C.accent, borderRadius:2 }}/>
          <span style={{ fontSize:14, fontWeight:700, color:C.txt }}>5단계 데이터 처리 파이프라인</span>
        </div>

        {FLOW_STEPS.map((step, idx) => (
          <div key={step.num} style={{ display:"flex", gap:0,
            borderBottom: idx < FLOW_STEPS.length-1 ? `1px solid ${C.border}` : "none",
            paddingBottom: idx < FLOW_STEPS.length-1 ? 16 : 0,
            marginBottom: idx < FLOW_STEPS.length-1 ? 16 : 0 }}>

            {/* 왼쪽: 스텝 번호 + 세로선 */}
            <div style={{ display:"flex", flexDirection:"column",
              alignItems:"center", marginRight:16, flexShrink:0, width:52 }}>
              <div style={{ width:48, height:48, borderRadius:10,
                background:`${step.color}12`, border:`2px solid ${step.color}55`,
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:1 }}>
                <span style={{ fontSize:10, fontWeight:800, color:step.color,
                  fontFamily:"monospace", letterSpacing:0.5 }}>{step.num}</span>
                {step.port && (
                  <span style={{ fontSize:8, color:step.color,
                    fontFamily:"monospace" }}>:{step.port}</span>
                )}
              </div>
              {idx < FLOW_STEPS.length-1 && (
                <div style={{ width:2, flex:1, minHeight:12,
                  background:`linear-gradient(${step.color}55, ${FLOW_STEPS[idx+1].color}55)`,
                  margin:"4px 0" }}/>
              )}
            </div>

            {/* 오른쪽: 내용 */}
            <div style={{ flex:1, paddingTop:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:700, color:step.color }}>
                  {step.title}
                </span>
                <span style={{ fontSize:10, padding:"2px 8px", borderRadius:4,
                  background:`${step.color}12`, color:step.color, fontWeight:600 }}>
                  {step.layer}
                </span>
              </div>
              <div style={{ display:"grid",
                gridTemplateColumns: step.items.length > 3 ? "1fr 1fr" : "1fr",
                gap:"4px 16px" }}>
                {step.items.map(item => (
                  <div key={item} style={{ display:"flex", gap:6,
                    alignItems:"flex-start" }}>
                    <span style={{ color:step.color, fontSize:10,
                      flexShrink:0, marginTop:2 }}>▸</span>
                    <span style={{ fontSize:11, color:C.txts, lineHeight:1.5 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RDF 트리플 테이블 */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`,
        borderRadius:10, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:4, height:18, background:C.green, borderRadius:2 }}/>
          <span style={{ fontSize:13, fontWeight:700, color:C.txt }}>
            핵심 RDF Triple 예시 (Subject – Predicate – Object)
          </span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Subject (주어)","Predicate (술어)","Object (목적어)","출처 API"].map(h => (
                  <th key={h} style={{ padding:"8px 14px", textAlign:"left",
                    borderBottom:`1px solid ${C.border}`, color:C.txtm,
                    fontWeight:500, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RDF_TRIPLES.map((r, i) => (
                <tr key={i} style={{ borderBottom:`1px solid #f8fafc`,
                  background: i%2===0 ? C.white : "#fafafa" }}>
                  <td style={{ padding:"7px 14px", color:C.accent,
                    fontFamily:"monospace", fontSize:10 }}>{r.s}</td>
                  <td style={{ padding:"7px 14px", color:C.green,
                    fontWeight:600 }}>{r.p}</td>
                  <td style={{ padding:"7px 14px", color:C.txts,
                    fontFamily:"monospace", fontSize:10 }}>{r.o}</td>
                  <td style={{ padding:"7px 14px", color:C.txtm }}>
                    {r.src.includes("★NEW") ? (
                      <><span style={{ color:C.accent, fontWeight:700 }}>★ </span>
                      {r.src.replace(" ★NEW","")}</>
                    ) : r.src}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   목업 탭
───────────────────────────────────────────────────────────── */
const SCREENS = [
  {id:"dashboard", label:"메인 대시보드",  path:"/dashboard"},
  {id:"map",       label:"반려동물 지도",   path:"/map"},
  {id:"chatbot",   label:"건강 챗봇",      path:"/chatbot"},
  {id:"adoption",  label:"입양 정보",      path:"/adoption"},
];

function DashboardPreview() {
  return (
    <div style={{ background:"#f8fafc", minHeight:360 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:10, padding:"14px" }}>
        {[
          {val:"124,832",label:"등록 시설",  color:C.accent},
          {val:"8,241",  label:"보호 동물",  color:C.green},
          {val:"312",    label:"분실 신고",  color:C.orange},
          {val:"3,509",  label:"반려 여행지",color:C.purple},
        ].map(k => (
          <div key={k.label} style={{ background:C.white, borderRadius:8,
            padding:"12px", border:`1px solid ${C.border}`, textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.val}</div>
            <div style={{ fontSize:10, color:C.txtm, marginTop:2 }}>{k.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
        gap:10, padding:"0 14px 14px" }}>
        <div style={{ background:C.white, borderRadius:8, padding:"12px",
          border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:10, color:C.txtm, marginBottom:8 }}>지역별 시설 분포</div>
          {[["서울",88],["경기",75],["부산",44],["인천",35],["대구",29]].map(([r,v]) => (
            <div key={r} style={{ display:"flex", alignItems:"center",
              gap:6, marginBottom:5 }}>
              <span style={{ fontSize:9, color:C.txtm, width:22 }}>{r}</span>
              <div style={{ flex:1, height:5, background:"#f1f5f9",
                borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:`${v}%`, height:"100%",
                  background:C.accent, borderRadius:3 }}/>
              </div>
              <span style={{ fontSize:9, color:C.txtm }}>{v}%</span>
            </div>
          ))}
        </div>
        <div style={{ background:C.white, borderRadius:8, padding:"12px",
          border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:10, color:C.txtm, marginBottom:8 }}>
            질병 원인 분류 (116건)
          </div>
          {[
            {label:"바이러스",val:"28건",color:"#dc2626"},
            {label:"세균",    val:"25건",color:C.orange},
            {label:"기타",    val:"50건",color:C.txtm},
            {label:"기생충",  val:"9건", color:C.green},
            {label:"곰팡이",  val:"3건", color:C.purple},
          ].map(d => (
            <div key={d.label} style={{ display:"flex", alignItems:"center",
              gap:6, marginBottom:5 }}>
              <div style={{ width:8, height:8, borderRadius:"50%",
                background:d.color, flexShrink:0 }}/>
              <span style={{ fontSize:10, flex:1, color:C.txts }}>{d.label}</span>
              <span style={{ fontSize:10, color:d.color, fontWeight:600 }}>{d.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapPreview() {
  return (
    <div style={{ background:"linear-gradient(180deg,#e0f2fe,#dbeafe)",
      height:360, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0,
        backgroundImage:"repeating-linear-gradient(rgba(2,132,199,0.12) 0,rgba(2,132,199,0.12) 1px,transparent 1px,transparent 36px),repeating-linear-gradient(90deg,rgba(2,132,199,0.12) 0,rgba(2,132,199,0.12) 1px,transparent 1px,transparent 36px)" }}/>
      <div style={{ position:"absolute", top:10, left:10,
        background:"rgba(255,255,255,0.92)", borderRadius:8,
        padding:"9px", border:`1px solid ${C.border}`, zIndex:10 }}>
        <div style={{ fontSize:10, fontWeight:600, color:C.txt, marginBottom:6 }}>시설 필터</div>
        {[
          {icon:"🏥", label:"동물병원", color:C.accent},
          {icon:"🌳", label:"반려공원", color:C.green},
          {icon:"☕", label:"반려카페", color:C.purple},
          {icon:"✂️", label:"미용업",  color:C.orange},
        ].map(f => (
          <div key={f.label} style={{ display:"flex", gap:5,
            alignItems:"center", marginBottom:3 }}>
            <div style={{ width:9, height:9, borderRadius:2,
              background:f.color }}/>
            <span style={{ fontSize:9, color:C.txts }}>{f.label}</span>
          </div>
        ))}
      </div>
      {[
        {top:60, left:120,  bg:C.accent, icon:"🏥"},
        {top:100,left:220,  bg:C.green,  icon:"🌳"},
        {top:80, left:300,  bg:C.purple, icon:"☕"},
        {top:160,left:170,  bg:C.orange, icon:"✂️"},
        {top:130,left:380,  bg:C.green,  icon:"🏡"},
      ].map((pin, i) => (
        <div key={i} style={{ position:"absolute", top:pin.top, left:pin.left,
          width:26, height:26, borderRadius:"50%", background:pin.bg,
          border:"2px solid #fff", display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:11,
          boxShadow:"0 1px 4px rgba(0,0,0,.18)", zIndex:5 }}>
          {pin.icon}
        </div>
      ))}
      <div style={{ position:"absolute", right:12, bottom:12,
        background:"rgba(255,255,255,0.95)", borderRadius:8, padding:"10px",
        border:`1px solid ${C.border}`, width:148, zIndex:10 }}>
        <div style={{ fontSize:11, fontWeight:600, color:C.txt, marginBottom:3 }}>
          🏥 행복동물병원
        </div>
        <div style={{ fontSize:9, color:C.txtm }}>서울 강남구 역삼로 123</div>
        <div style={{ fontSize:9, color:C.green, marginTop:3 }}>● 영업중</div>
        <div style={{ fontSize:9, color:C.accent, marginTop:2 }}>0.3km</div>
      </div>
    </div>
  );
}

function ChatbotPreview() {
  return (
    <div style={{ background:"#f8fafc", height:360,
      display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${C.border}`,
        fontSize:12, fontWeight:700, color:C.txt, background:C.white }}>
        🩺 반려동물 건강 어시스턴트
      </div>
      <div style={{ flex:1, padding:"10px", display:"flex",
        flexDirection:"column", gap:8, overflowY:"hidden" }}>
        <div style={{ display:"flex", gap:7 }}>
          <div style={{ width:26, height:26, borderRadius:"50%",
            background:C.accent, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:12, color:"#fff", flexShrink:0 }}>🐾</div>
          <div style={{ background:C.white, border:`1px solid ${C.border}`,
            borderRadius:"0 8px 8px 8px", padding:"8px 11px",
            fontSize:11, color:C.txts, maxWidth:"75%", lineHeight:1.5 }}>
            안녕하세요! 반려동물의 증상을 알려주세요.
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <div style={{ background:C.accent, borderRadius:"8px 0 8px 8px",
            padding:"8px 11px", fontSize:11, color:"#fff", maxWidth:"75%" }}>
            강아지가 구토를 자꾸 해요 😢
          </div>
        </div>
        <div style={{ display:"flex", gap:7, alignItems:"flex-start" }}>
          <div style={{ width:26, height:26, borderRadius:"50%",
            background:C.accent, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:12, color:"#fff", flexShrink:0 }}>🐾</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6,
            flex:1, maxWidth:"80%" }}>
            <div style={{ background:C.white, border:`1px solid ${C.border}`,
              borderRadius:"0 8px 8px 8px", padding:"8px 11px",
              fontSize:11, color:C.txts }}>
              구토 증상 분석 결과:
              <div style={{ marginTop:5, borderTop:`1px solid ${C.border}`,
                paddingTop:5 }}>
                {[
                  {nm:"개파보바이러스감염증",lv:"높음",c:"#dc2626"},
                  {nm:"개코로나바이러스감염증",lv:"중간",c:C.orange},
                ].map(d => (
                  <div key={d.nm} style={{ display:"flex",
                    justifyContent:"space-between", padding:"2px 0",
                    fontSize:10 }}>
                    <span style={{ color:C.txts }}>{d.nm}</span>
                    <span style={{ color:d.c, fontWeight:600 }}>{d.lv}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0",
              borderRadius:8, padding:"8px 11px",
              fontSize:10, color:C.txts }}>
              <div style={{ color:C.green, fontWeight:700, marginBottom:3 }}>
                📍 근처 추천 병원 (3km 내)
              </div>
              <div>행복동물병원 (0.8km)</div>
              <div>강남24시동물병원 (1.2km)</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding:"9px 12px",
        borderTop:`1px solid ${C.border}`,
        display:"flex", gap:7, background:C.white }}>
        <div style={{ flex:1, background:"#f8fafc",
          border:`1px solid ${C.border}`, borderRadius:6,
          padding:"6px 10px", fontSize:10, color:C.txtl }}>
          증상을 입력하세요...
        </div>
        <div style={{ width:32, height:32, borderRadius:6, background:C.accent,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"#fff", fontSize:14, cursor:"pointer" }}>↑</div>
      </div>
    </div>
  );
}

function AdoptionPreview() {
  const pets = [
    {nm:"코코",  breed:"말티즈",      age:"2세",sex:"M",status:"입양가능",color:C.accent,  icon:"🐕"},
    {nm:"나비",  breed:"코리안숏헤어",age:"1세",sex:"F",status:"입양가능",color:C.purple, icon:"🐈"},
    {nm:"초코",  breed:"포메라니안",  age:"1세",sex:"M",status:"보호중",  color:C.orange, icon:"🐕"},
    {nm:"미미",  breed:"페르시안",    age:"2세",sex:"F",status:"입양가능",color:C.green,  icon:"🐈"},
    {nm:"두부",  breed:"비숑프리제",  age:"1세",sex:"M",status:"입양가능",color:C.accent,  icon:"🐕"},
    {nm:"하루",  breed:"시바이누",    age:"3세",sex:"F",status:"보호중",  color:C.orange, icon:"🐕"},
    {nm:"뭉치",  breed:"진돗개",      age:"3세",sex:"M",status:"입양가능",color:C.green,  icon:"🐕"},
    {nm:"하양이",breed:"러시안블루",  age:"2세",sex:"F",status:"입양가능",color:C.purple, icon:"🐈"},
  ];
  return (
    <div style={{ background:"#f8fafc", minHeight:360, padding:14 }}>
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {["전체","강아지","고양이"].map((f,i) => (
          <span key={f} style={{ padding:"4px 10px", fontSize:10,
            borderRadius:16, cursor:"pointer",
            background: i===0 ? C.txt : C.white,
            color: i===0 ? "#fff" : C.txtm,
            border:`1px solid ${i===0 ? C.txt : C.border}` }}>{f}</span>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:9 }}>
        {pets.map(p => (
          <div key={p.nm} style={{ background:C.white, borderRadius:8,
            border:`1px solid ${C.border}`, overflow:"hidden",
            boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ height:60, background:`${p.color}15`,
              display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:28 }}>{p.icon}</div>
            <div style={{ padding:"7px 8px" }}>
              <div style={{ fontSize:11, fontWeight:600, color:C.txt }}>{p.nm}</div>
              <div style={{ fontSize:9, color:C.txtm }}>{p.breed} · {p.age} · {p.sex}</div>
              <div style={{ marginTop:4, fontSize:9, fontWeight:600,
                color: p.status==="입양가능" ? C.green : C.orange,
                background: p.status==="입양가능" ? "#f0fdf4" : "#fff7ed",
                padding:"1px 6px", borderRadius:3,
                display:"inline-block" }}>{p.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PREVIEW_MAP = {
  dashboard: DashboardPreview,
  map:       MapPreview,
  chatbot:   ChatbotPreview,
  adoption:  AdoptionPreview,
};

function MockupTab() {
  const [active, setActive] = useState("dashboard");
  const Preview = PREVIEW_MAP[active];

  return (
    <div style={{ padding:"4px 0 32px" }}>
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {SCREENS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            style={{ padding:"6px 14px", fontSize:11, borderRadius:6,
              cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit",
              background: active===s.id ? C.txt : C.white,
              color: active===s.id ? "#fff" : C.txtm,
              border:`1px solid ${active===s.id ? C.txt : C.border}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* 설명 */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <div style={{ width:3, height:18, background:C.accent, borderRadius:2 }}/>
        <div>
          <span style={{ fontSize:13, fontWeight:600, color:C.txt, marginRight:8 }}>
            {SCREENS.find(s=>s.id===active)?.label}
          </span>
          <code style={{ fontSize:10, background:"#e0f2fe", color:C.accent,
            padding:"2px 8px", borderRadius:4 }}>
            {SCREENS.find(s=>s.id===active)?.path}
          </code>
        </div>
      </div>

      {/* 브라우저 프레임 */}
      <div style={{ border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden",
        boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ padding:"8px 12px", background:"#f8fafc",
          borderBottom:`1px solid ${C.border}`,
          display:"flex", gap:5, alignItems:"center" }}>
          {["#ef4444","#f59e0b","#22c55e"].map(c => (
            <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }}/>
          ))}
          <div style={{ flex:1, margin:"0 10px", background:C.white,
            borderRadius:4, padding:"3px 10px",
            fontSize:10, color:C.txtm,
            border:`1px solid ${C.border}` }}>
            localhost:5175{SCREENS.find(s=>s.id===active)?.path}
          </div>
          <code style={{ fontSize:9, color:C.green, background:"#f0fdf4",
            padding:"2px 7px", borderRadius:4 }}>:5175</code>
        </div>
        <Preview />
      </div>

      {/* 전체 화면 구성 */}
      <div style={{ marginTop:20, background:C.white,
        border:`1px solid ${C.border}`, borderRadius:10,
        padding:"16px 20px" }}>
        <div style={{ fontSize:12, fontWeight:600, color:C.txt, marginBottom:12 }}>
          전체 화면 구성 (6개 페이지)
        </div>
        <div style={{ display:"grid",
          gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
          {[
            {title:"메인 대시보드",  path:"/dashboard",     desc:"KPI, 지역분포, 질병통계"},
            {title:"지식그래프",     path:"/knowledge-graph",desc:"Canvas 그래프 (15개 API)"},
            {title:"반려동물 지도",  path:"/map",            desc:"WGS84 마커 + 시설 필터"},
            {title:"입양 정보",      path:"/adoption",       desc:"구조동물 카드 + Accordion"},
            {title:"건강 챗봇",      path:"/chatbot",        desc:"증상→질병→병원 추천"},
            {title:"매핑 테이블",    path:"/mapping",        desc:"15개 데이터셋 Accordion UI"},
          ].map(p => (
            <div key={p.path} style={{ padding:"10px 13px", borderRadius:7,
              background:"#f8fafc", border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12, fontWeight:600, color:C.txt }}>{p.title}</div>
              <code style={{ fontSize:9, color:C.accent,
                display:"inline-block", margin:"3px 0" }}>{p.path}</code>
              <div style={{ fontSize:10, color:C.txtm }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   모바일 목업 탭들 (기존 지도/피드/프로필/관리자)
───────────────────────────────────────────────────────────── */
function PhoneFrame({ children, title }) {
  return (
    <div style={{ width:375, height:780, borderRadius:36,
      border:`2px solid ${C.border}`, background:C.white,
      margin:"0 auto", position:"relative", overflow:"hidden",
      boxShadow:"0 12px 40px rgba(0,0,0,0.1)" }}>
      <div style={{ position:"absolute", top:0, left:"50%",
        transform:"translateX(-50%)", width:140, height:26,
        background:C.txt, borderRadius:"0 0 18px 18px", zIndex:20 }}/>
      <div style={{ display:"flex", justifyContent:"space-between",
        padding:"7px 22px 0", fontSize:10, color:C.txtl, position:"relative",
        zIndex:10 }}>
        <span>9:41</span><span>{title}</span><span>5G</span>
      </div>
      <div style={{ height:"calc(100% - 64px)", overflowY:"auto",
        position:"relative" }}>
        {children}
      </div>
      <div style={{ position:"absolute", bottom:0, left:0, right:0,
        height:64, background:C.white, borderTop:`1px solid ${C.border}`,
        display:"flex", justifyContent:"space-around", alignItems:"center",
        zIndex:20 }}>
        {[{icon:"🗺️",label:"지도"},{icon:"📸",label:"피드"},
          {icon:"❤️",label:"입양"},{icon:"👤",label:"프로필"}].map(n => (
          <div key={n.label} style={{ display:"flex", flexDirection:"column",
            alignItems:"center", gap:2, cursor:"pointer",
            padding:"7px 12px", borderRadius:10 }}>
            <span style={{ fontSize:18, color:C.txtl }}>{n.icon}</span>
            <span style={{ fontSize:9, color:C.txtl, fontWeight:600 }}>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapMockTab() {
  return (
    <PhoneFrame title="Pet-Graph">
      <div style={{ width:"100%", height:340,
        background:"linear-gradient(180deg,#e0f2fe,#dbeafe)",
        position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"repeating-linear-gradient(rgba(2,132,199,0.12) 0,rgba(2,132,199,0.12) 1px,transparent 1px,transparent 34px),repeating-linear-gradient(90deg,rgba(2,132,199,0.12) 0,rgba(2,132,199,0.12) 1px,transparent 1px,transparent 34px)" }}/>
        <div style={{ position:"absolute", top:8, left:8, right:8,
          display:"flex", gap:5, zIndex:10, flexWrap:"wrap" }}>
          {[{c:"#0284c7",t:"동물병원 34"},{c:"#16a34a",t:"반려공원 12"},{c:"#7c3aed",t:"카페 28"}].map(z => (
            <div key={z.t} style={{ background:"rgba(255,255,255,0.9)",
              padding:"3px 8px", borderRadius:16, fontSize:10,
              fontWeight:600, color:"#334155",
              display:"flex", alignItems:"center", gap:4,
              border:`1px solid ${C.border}` }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:z.c }}/>
              {z.t}
            </div>
          ))}
        </div>
        {[
          {t:70,l:100,bg:"#0284c7",i:"🏥"},{t:120,l:220,bg:"#7c3aed",i:"☕"},
          {t:200,l:280,bg:"#16a34a",i:"🌳"},{t:80, l:260,bg:"#ea580c",i:"✂️"},
          {t:240,l:140,bg:"#16a34a",i:"🏡"},
        ].map((p, i) => (
          <div key={i} style={{ position:"absolute", top:p.t, left:p.l,
            width:26, height:26, borderRadius:"50%", background:p.bg,
            border:"2px solid #fff", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:11,
            boxShadow:"0 1px 4px rgba(0,0,0,.2)", zIndex:5 }}>{p.i}</div>
        ))}
        <div style={{ position:"absolute", bottom:10, right:10,
          width:14, height:14, borderRadius:"50%", background:"#0284c7",
          border:"2px solid rgba(2,132,199,0.25)",
          boxShadow:"0 0 0 6px rgba(2,132,199,0.15)", zIndex:6 }}/>
      </div>
      <div style={{ padding:10 }}>
        <div style={{ background:C.white, borderRadius:10, padding:11,
          border:`1px solid ${C.border}`, marginBottom:8 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.txt, marginBottom:5 }}>
            🏥 행복동물병원
          </div>
          <div style={{ fontSize:10, color:C.txtm, marginBottom:4 }}>
            서울 강남구 역삼로 123
          </div>
          <div style={{ display:"flex", gap:8, fontSize:10 }}>
            <span style={{ color:C.green, fontWeight:600 }}>● 영업중</span>
            <span style={{ color:C.txtm }}>02-1234-5678</span>
            <span style={{ color:C.accent, marginLeft:"auto" }}>0.3km</span>
          </div>
        </div>
        <div style={{ background:"#f0fdf4", borderRadius:10, padding:11,
          border:"1px solid #bbf7d0" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#15803d", marginBottom:5 }}>
            📍 내 주변 시설 (1km 이내)
          </div>
          <div style={{ fontSize:10, color:C.txts, display:"flex",
            flexDirection:"column", gap:3 }}>
            <span>🏥 동물병원 3곳</span>
            <span>☕ 반려동물카페 2곳</span>
            <span>✂️ 미용업 1곳</span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function FeedMockTab() {
  return (
    <PhoneFrame title="커뮤니티">
      <div style={{ padding:"38px 10px 10px" }}>
        <div style={{ fontSize:16, fontWeight:700, color:C.txt,
          padding:"6px 0 10px", display:"flex",
          justifyContent:"space-between" }}>
          <span>🐾 커뮤니티</span>
          <span style={{ fontSize:11, color:C.accent }}>🔍</span>
        </div>
        {[
          {nm:"이수빈",badge:"강아지집사",time:"서울 마포구 · 2분 전",
           icon:"🐕📸",text:"몽이 예방접종 완료! 행복동물병원 강추 🏥",
           tags:["#동물병원","#예방접종"],likes:"❤️ 43"},
          {nm:"박민준",badge:"고양이집사",time:"경기 성남 · 15분 전",
           icon:"🐈✨",text:"나비 입양 1주년! 동물보호센터에서 데려온 게 최고의 선택 🏡",
           tags:["#입양","#보호센터"],likes:"❤️ 128"},
        ].map(f => (
          <div key={f.nm} style={{ background:C.white, borderRadius:12,
            marginBottom:10, overflow:"hidden",
            border:`1px solid ${C.border}`,
            boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 11px" }}>
              <div style={{ width:30, height:30, borderRadius:"50%",
                background:C.accent, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:13, color:"#fff" }}>👤</div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.txt }}>
                  {f.nm} <span style={{ background:"#e0f2fe", color:C.accent,
                    padding:"1px 6px", borderRadius:3, fontSize:9 }}>{f.badge}</span>
                </div>
                <div style={{ fontSize:9, color:C.txtl }}>{f.time}</div>
              </div>
            </div>
            <div style={{ height:120, background:"linear-gradient(135deg,#e0f2fe,#dbeafe)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:36 }}>{f.icon}</div>
            <div style={{ padding:"9px 11px" }}>
              <div style={{ fontSize:11, color:C.txts, lineHeight:1.5,
                marginBottom:5 }}>{f.text}</div>
              <div style={{ display:"flex", gap:4, marginBottom:6 }}>
                {f.tags.map(t => (
                  <span key={t} style={{ fontSize:9, color:C.accent,
                    background:"#e0f2fe", padding:"2px 6px",
                    borderRadius:3 }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize:11, color:C.txtm }}>{f.likes}</div>
            </div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

function ProfileMockTab() {
  return (
    <PhoneFrame title="프로필">
      <div style={{ padding:"38px 10px 10px" }}>
        <div style={{ background:C.white, borderRadius:14, padding:18,
          border:`1px solid ${C.border}`, textAlign:"center", marginBottom:12,
          boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:C.accent,
            margin:"0 auto 8px", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:24, color:"#fff" }}>👩</div>
          <div style={{ fontSize:15, fontWeight:700, color:C.txt }}>이수빈</div>
          <div style={{ fontSize:11, color:C.accent, marginTop:2 }}>강아지집사 Lv.8</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
            gap:10, marginTop:14 }}>
            {[{v:"3,240",l:"포인트"},{v:"8위",l:"랭킹"},{v:"47",l:"리뷰"}].map(s => (
              <div key={s.l}>
                <div style={{ fontSize:16, fontWeight:800, color:C.accent }}>{s.v}</div>
                <div style={{ fontSize:9, color:C.txtm, marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between",
              fontSize:10, color:C.txtm, marginBottom:3 }}>
              <span>Lv.8</span><span>3,240 / 4,000</span>
            </div>
            <div style={{ height:6, background:"#f1f5f9", borderRadius:3, overflow:"hidden" }}>
              <div style={{ width:"81%", height:"100%",
                background:"linear-gradient(90deg,#0284c7,#0ea5e9)",
                borderRadius:3 }}/>
            </div>
          </div>
        </div>
        <div style={{ fontSize:12, fontWeight:700, color:C.txt, marginBottom:7 }}>
          ⚡ 활성 퀘스트
        </div>
        {[
          {icon:"🏥",title:"동물병원 3곳 방문",xp:"+150P",pct:"67%",sub:"2/3 완료",
           grad:"linear-gradient(90deg,#0284c7,#0ea5e9)"},
          {icon:"❤️",title:"입양 정보 공유 5회",xp:"+200P",pct:"60%",sub:"3/5 완료",
           grad:"linear-gradient(90deg,#16a34a,#22c55e)"},
        ].map(q => (
          <div key={q.title} style={{ background:"#f8fafc", borderRadius:10,
            padding:"10px 11px", marginBottom:7,
            border:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
              <span>{q.icon}</span>
              <span style={{ fontSize:12, fontWeight:700, flex:1, color:C.txt }}>
                {q.title}
              </span>
              <span style={{ fontSize:10, color:C.accent, fontWeight:700 }}>{q.xp}</span>
            </div>
            <div style={{ height:5, background:"#e2e8f0",
              borderRadius:3, overflow:"hidden", marginTop:5 }}>
              <div style={{ width:q.pct, height:"100%", background:q.grad,
                borderRadius:3 }}/>
            </div>
            <div style={{ fontSize:9, color:C.txtm, marginTop:3 }}>{q.sub}</div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

function AdminMockTab() {
  return (
    <div style={{ padding:"0 0 24px" }}>
      <div style={{ fontSize:16, fontWeight:700, color:C.txt,
        marginBottom:16, display:"flex", alignItems:"center", gap:7 }}>
        🐾 Pet-Graph 관리자 대시보드
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:10, marginBottom:18 }}>
        {[
          {val:"124,832",label:"등록 시설",  color:C.accent, delta:"+23 오늘"},
          {val:"8,241",  label:"보호 동물",  color:C.green,  delta:"+12 신규"},
          {val:"312",    label:"분실 신고",  color:C.orange, delta:"+5 오늘"},
          {val:"15",     label:"공공 API",   color:C.purple, delta:"최신 동기화"},
        ].map(k => (
          <div key={k.label} style={{ background:C.white, borderRadius:10,
            padding:"14px", textAlign:"center",
            border:`1px solid ${C.border}`,
            boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize:24, fontWeight:800, color:k.color }}>{k.val}</div>
            <div style={{ fontSize:10, color:C.txtm, marginTop:3 }}>{k.label}</div>
            <div style={{ fontSize:9, color:C.green, marginTop:3 }}>{k.delta}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ background:C.white, borderRadius:12, padding:"16px",
          border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.txt, marginBottom:12 }}>
            API 동기화 현황
          </div>
          {[
            {name:"행정안전부 API (5종)",color:C.accent,pct:100},
            {name:"농림축산검역본부 (4종)",color:C.green,pct:100},
            {name:"관광/문화 API (3종)",color:C.purple,pct:96},
            {name:"KISTI / 기타 (3종)",color:C.orange,pct:100},
          ].map(z => (
            <div key={z.name} style={{ marginBottom:9 }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                fontSize:11, marginBottom:3, color:C.txts }}>
                <span style={{ fontWeight:500 }}>{z.name}</span>
                <span style={{ color:C.txtm }}>{z.pct}%</span>
              </div>
              <div style={{ height:5, background:"#f1f5f9",
                borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:`${z.pct}%`, height:"100%",
                  background:z.color, borderRadius:3 }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:C.white, borderRadius:12, padding:"16px",
          border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.txt, marginBottom:12 }}>
            TOP 시설 조회 순위
          </div>
          {[
            {pos:"🥇",name:"강남24시동물병원",     val:"4,210"},
            {pos:"🥈",name:"서울시동물보호센터",    val:"3,890"},
            {pos:"🥉",name:"한강반려동물카페",      val:"3,120"},
            {pos:"4.", name:"제주 협재해수욕장",    val:"2,980"},
            {pos:"5.", name:"수원시동물보호센터",   val:"2,750"},
          ].map(r => (
            <div key={r.name} style={{ display:"flex", alignItems:"center",
              gap:7, padding:"5px 0", fontSize:12,
              borderBottom:`1px solid #f8fafc`, color:C.txts }}>
              <span style={{ minWidth:26, textAlign:"center" }}>{r.pos}</span>
              <span style={{ flex:1 }}>{r.name}</span>
              <span style={{ fontWeight:700, color:C.accent }}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   메인 컴포넌트
───────────────────────────────────────────────────────────── */
const ALL_TABS = [
  { id:"map",      label:"🗺️ 지도 목업" },
  { id:"feed",     label:"📸 SNS 피드" },
  { id:"profile",  label:"👤 프로필" },
  { id:"admin",    label:"🖥️ 관리자" },
  { id:"arch",     label:"🏗️ 아키텍처",   accent:true },
  { id:"dataflow", label:"🔄 데이터 흐름", accent:true },
  { id:"mockup",   label:"📱 UI 목업",    accent:true },
];

export default function IndexPage() {
  const [activeTab, setActiveTab] = useState("arch");

  const tabBtn = (active, accent) => ({
    padding:"8px 16px", fontSize:12, fontWeight:600, borderRadius:8,
    cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s",
    fontFamily:"inherit",
    background: active ? (accent ? C.accent : C.txt) : C.white,
    color: active ? "#ffffff" : (accent ? C.accent : C.txtm),
    border: `1px solid ${active ? (accent ? C.accent : C.txt) : (accent ? `${C.accent}44` : C.border)}`,
  });

  return (
    <div style={{ minHeight:"100vh", background:C.bg,
      fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* 헤더 */}
      <div style={{ padding:"20px 32px 0", background:C.white,
        borderBottom:`1px solid ${C.border}`,
        boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"flex-start",
            justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:C.txt, letterSpacing:0.3 }}>
                Pet-Graph
                <span style={{ color:C.txtl, fontWeight:400, margin:"0 8px" }}>/</span>
                <span style={{ color:C.accent }}>시스템 문서 & UI 목업</span>
              </div>
              <div style={{ fontSize:11, color:C.txtm, marginTop:3 }}>
                반려동물 지식그래프 기반 웹 서비스 — 15개 공공 데이터셋 통합 · 4-Layer 아키텍처
              </div>
            </div>
            {/* 포트 배지 — 헤더 우측 */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap",
              justifyContent:"flex-end" }}>
              {PORTS.map(p => (
                <div key={p.port} style={{ display:"flex", alignItems:"center",
                  gap:5, padding:"4px 9px", borderRadius:6,
                  background:`${p.color}0d`, border:`1px solid ${p.color}33` }}>
                  <div style={{ width:6, height:6, borderRadius:"50%",
                    background: p.status==="running" ? C.green : p.color }}/>
                  <code style={{ fontSize:11, fontWeight:700, color:p.color }}>
                    :{p.port}
                  </code>
                  <span style={{ fontSize:10, color:C.txtm }}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 탭 */}
          <div style={{ display:"flex", gap:5, overflowX:"auto",
            paddingBottom:1 }}>
            {ALL_TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={tabBtn(activeTab===t.id, t.accent)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth:1280, margin:"0 auto",
        padding:"24px 32px" }}>
        {activeTab==="map"      && <MapMockTab />}
        {activeTab==="feed"     && <FeedMockTab />}
        {activeTab==="profile"  && <ProfileMockTab />}
        {activeTab==="admin"    && <AdminMockTab />}
        {activeTab==="arch"     && <ArchTab />}
        {activeTab==="dataflow" && <DataFlowTab />}
        {activeTab==="mockup"   && <MockupTab />}
      </div>
    </div>
  );
}
