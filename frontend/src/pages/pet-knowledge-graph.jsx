import { useState } from "react";

const datasets = [
  {
    id: "hospital",
    icon: "🏥",
    name: "동물병원",
    provider: "행정안전부",
    endpoint: "https://apis.data.go.kr/1741000/animal_hospitals/info",
    records: "전국 약 18,000건",
    color: "#4ade80",
    category: "시설",
    keyFields: ["Name", "Facility_ID", "Category", "RoadAddress", "lat/lon", "PhoneNumber", "BusinessStatus"],
    description: "전국 동물병원 인허가 정보. TM→WGS84 좌표 변환 필요.",
    schemaOrg: "schema:VeterinaryCare",
    sourceUrl: "https://www.data.go.kr/data/15154952/openapi.do",
  },
  {
    id: "pharmacy",
    icon: "💊",
    name: "동물약국",
    provider: "행정안전부",
    endpoint: "https://apis.data.go.kr/1741000/animal_hospitals/info",
    records: "전국 약 2,100건",
    color: "#60a5fa",
    category: "시설",
    keyFields: ["Name", "Facility_ID", "BusinessStatus", "RoadAddress", "lat/lon", "PhoneNumber", "FloorArea"],
    description: "동물용 의약품 판매 약국 정보. 면적 정보(㎡) 포함.",
    schemaOrg: "schema:Pharmacy",
    sourceUrl: "https://www.data.go.kr/data/15154953/openapi.do",
  },
  {
    id: "grooming",
    icon: "✂️",
    name: "동물미용업",
    provider: "행정안전부",
    endpoint: "https://apis.data.go.kr/1741000/pet_grooming/info",
    records: "전국 약 9,400건",
    color: "#f472b6",
    category: "시설",
    keyFields: ["Name", "Category", "BusinessStatus", "RoadAddress", "lat/lon", "LicenseDate", "ClosingDate"],
    description: "반려동물 미용업 인허가 정보. 임시휴업 기간 추적 가능.",
    schemaOrg: "schema:HealthAndBeautyBusiness",
    sourceUrl: "https://www.data.go.kr/data/15154952/openapi.do",
  },
  {
    id: "boarding",
    icon: "🏡",
    name: "동물위탁관리업",
    provider: "행정안전부",
    endpoint: "https://apis.data.go.kr/1741000/animal_boarding/info",
    records: "전국 약 3,200건",
    color: "#fb923c",
    category: "시설",
    keyFields: ["Name", "TaskType", "BusinessStatus", "Sido", "Sigungu", "Dong", "PhoneNumber"],
    description: "반려동물 위탁·호텔링 업소 정보. 세부 업무구분(호텔/유치원 등) 포함.",
    schemaOrg: "schema:LodgingBusiness",
    sourceUrl: "https://www.data.go.kr/data/15155055/openapi.do",
  },
  {
    id: "funeral",
    icon: "🕊️",
    name: "동물장묘업",
    provider: "행정안전부",
    endpoint: "https://apis.data.go.kr/1741000/animal_funeral/info",
    records: "전국 약 450건",
    color: "#a78bfa",
    category: "시설",
    keyFields: ["Name", "BusinessStatus", "RoadAddress", "lat/lon", "LicenseDate", "PhoneNumber"],
    description: "동물 화장·납골 시설 정보. 소수 운영 시설로 희소 데이터.",
    schemaOrg: "schema:LocalBusiness",
    sourceUrl: "https://www.data.go.kr/data/15094225/openapi.do",
  },
  {
    id: "petfriendly",
    icon: "🐾",
    name: "반려동물 동반가능 시설",
    provider: "한국문화정보원",
    endpoint: "https://apis.data.go.kr/1741000/animal_hospitals/info",
    records: "전국 약 5,700건",
    color: "#34d399",
    category: "관광",
    keyFields: ["Name", "Category", "Sido", "Sigungu", "RoadAddress", "lat/lon", "PhoneNumber"],
    description: "카페·음식점·숙박 등 반려동물 입장 허용 시설. 시설 유형 다양.",
    schemaOrg: "schema:TouristAttraction",
    sourceUrl: "https://www.data.go.kr/data/15111389/fileData.do",
  },
  {
    id: "restarea",
    icon: "🛣️",
    name: "휴게소 반려동물 놀이터",
    provider: "한국도로공사",
    endpoint: "data.go.kr/data/15064250",
    records: "전국 약 320건",
    color: "#fbbf24",
    category: "관광",
    keyFields: ["Name", "FacilityType", "Location", "OpeningHours", "CloseDay", "EstablishedYear", "Remark"],
    description: "고속도로 휴게소 내 반려동물 전용 놀이터·시설 정보.",
    schemaOrg: "schema:Park",
    sourceUrl: "https://www.data.go.kr/data/15064250",
  },
  {
    id: "travel",
    icon: "✈️",
    name: "반려동물 동반여행",
    provider: "한국관광공사",
    endpoint: "https://apis.data.go.kr/B551011/KorPetTourService2",
    records: "전국 약 8,900건",
    color: "#38bdf8",
    category: "관광",
    keyFields: ["title", "addr1", "mapx/mapy", "acmpyTypeCd", "acmpyNeedMtr", "etcAcmpyInfo", "firstimage"],
    description: "관광지·숙박·음식점의 반려동물 동반 조건(무게제한, 리드줄 등) 포함. WGS84 직접 제공.",
    schemaOrg: "schema:TouristAttraction",
    sourceUrl: "https://www.data.go.kr/data/15135102/openapi.do",
  },
  {
    id: "rescue",
    icon: "🆘",
    name: "구조동물 조회",
    provider: "국가동물보호정보시스템",
    endpoint: "https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2",
    records: "연간 약 100,000건",
    color: "#f87171",
    category: "보호·입양",
    keyFields: ["ANIMAL_NO", "ANIMAL_BREED", "ANIMAL_BIRTH", "ADOPT_STATUS", "MOVIE_URL", "CareNm"],
    description: "유기·유실 동물 구조 공고. 품종·나이·성별·상태 포함. 동물보호센터와 JOIN 가능.",
    schemaOrg: "koah:RescuedAnimal",
    sourceUrl: "https://www.data.go.kr/data/15098930/openapi.do",
  },
  {
    id: "lost",
    icon: "🔍",
    name: "분실동물 조회",
    provider: "국가동물보호정보시스템",
    endpoint: "https://apis.data.go.kr/1543061/lostPetInfoSrvc/lostPetInfo",
    records: "연간 약 50,000건",
    color: "#e879f9",
    category: "보호·입양",
    keyFields: ["HappenDate", "HappenAddr", "KindCode", "ColorCode", "SexCode", "SpecialMark", "CallTel"],
    description: "반려동물 분실 신고 접수 정보. 발생 장소·날짜·동물 특징 포함.",
    schemaOrg: "koah:LostAnimal",
    sourceUrl: "https://www.data.go.kr/data/15098937/openapi.do",
  },
  {
    id: "shelter",
    icon: "🏠",
    name: "동물보호센터",
    provider: "농림축산식품부",
    endpoint: "http://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2",
    records: "전국 약 280개소",
    color: "#2dd4bf",
    category: "보호·입양",
    keyFields: ["CareRegNo", "CareNm", "CareAddr", "lat/lng", "VetPersonCnt", "BreedCnt", "WeekOprStime"],
    description: "공영·민간 동물보호소 시설 정보. 수의사 수·보호 가능 마릿수 등 운영 현황 포함.",
    schemaOrg: "schema:AnimalShelter",
    sourceUrl: "https://www.data.go.kr/data/15098915/openapi.do",
  },
  {
    id: "symptom",
    icon: "🩺",
    name: "동물질병 증상분류",
    provider: "한국과학기술정보연구원",
    endpoint: "data.go.kr/data/15050441/fileData.do",
    records: "약 1,200개 증상 코드",
    color: "#f9a8d4",
    category: "의료",
    keyFields: ["SymptomCode", "CategoryKo", "CategoryEn", "SymptomListCode", "SymptomName"],
    description: "동물 질병 증상 표준 분류 코드. KISTI 표준 코드 기반. 질병 정보와 JOIN 가능.",
    schemaOrg: "schema:MedicalSignOrSymptom",
    sourceUrl: "https://www.data.go.kr/data/15050441/fileData.do",
  },
  {
    id: "disease",
    icon: "🦠",
    name: "동물질병 정보",
    provider: "농림축산검역본부",
    endpoint: "data.go.kr/data/15103008/fileData.do",
    records: "약 320개 질병",
    color: "#c084fc",
    category: "의료",
    keyFields: ["DiseaseNo", "DiseaseNameKo", "DiseaseNameEn", "MainInfectedAnimal", "CauseCategory", "RegisteredDate"],
    description: "동물 감염병 공식 정보. 원인(세균/바이러스/기생충 등)·주요 감염 동물 포함.",
    schemaOrg: "schema:MedicalCondition",
    sourceUrl: "https://www.data.go.kr/data/15103008/fileData.do",
  },
  {
    id: "registration",
    icon: "🪪",
    name: "반려동물 등록정보",
    provider: "농림축산식품부",
    endpoint: "https://apis.data.go.kr/1543061/animalInfoSrvc_v3/animalInfo_v3",
    records: "약 4,100,000건",
    color: "#86efac",
    category: "등록",
    keyFields: ["DogRegNo", "RfidCode", "DogName", "KindName", "SexName", "NeuterYn", "BirthDate"],
    description: "동물 등록번호(RFID) 기반 공식 등록 데이터. 국내 최대 규모 반려동물 데이터셋.",
    schemaOrg: "koah:RegisteredAnimal",
    sourceUrl: "https://www.data.go.kr/data/15098913/openapi.do",
  },
];

const categories = ["전체", "시설", "관광", "보호·입양", "의료", "등록"];
const categoryColors = {
  시설: "#4ade80",
  관광: "#fbbf24",
  "보호·입양": "#f87171",
  의료: "#c084fc",
  등록: "#86efac",
};

const navItems = [
  { id: "dashboard", icon: "▦", label: "대시보드" },
  { id: "datasets", icon: "◫", label: "데이터셋", badge: "14" },
  { id: "knowledge", icon: "◈", label: "지식그래프" },
  { id: "mapping", icon: "⊕", label: "매핑테이블" },
  { id: "poster", icon: "◻", label: "포스터" },
];

const providerStats = [
  { name: "행정안전부", count: 5, color: "#4ade80" },
  { name: "농림축산식품부", count: 3, color: "#60a5fa" },
  { name: "한국관광공사", count: 1, color: "#fbbf24" },
  { name: "국가동물보호정보시스템", count: 2, color: "#f87171" },
  { name: "KISTI", count: 1, color: "#c084fc" },
  { name: "한국도로공사", count: 1, color: "#fb923c" },
  { name: "한국문화정보원", count: 1, color: "#34d399" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const filtered = selectedCategory === "전체"
    ? datasets
    : datasets.filter((d) => d.category === selectedCategory);

  return (
    <div style={{
      display: "flex", height: "100vh", background: "#0a0c10",
      fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif", color: "#e2e8f0",
      overflow: "hidden",
    }}>
      {/* LEFT SIDEBAR */}
      <div style={{
        width: sidebarCollapsed ? 64 : 220,
        background: "#0d1117",
        borderRight: "1px solid #1e2635",
        display: "flex", flexDirection: "column",
        transition: "width 0.25s ease",
        flexShrink: 0, zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarCollapsed ? "20px 0" : "20px 16px",
          borderBottom: "1px solid #1e2635",
          display: "flex", alignItems: "center", gap: 10,
          justifyContent: sidebarCollapsed ? "center" : "flex-start",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #4ade80, #22c55e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}>🐾</div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>반려동물</div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.2 }}>지식그래프 v1.0</div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                title={sidebarCollapsed ? item.label : ""}
                style={{
                  display: "flex", alignItems: "center",
                  gap: sidebarCollapsed ? 0 : 10,
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  padding: sidebarCollapsed ? "10px 0" : "10px 12px",
                  borderRadius: 8, border: "none", cursor: "pointer",
                  background: active ? "#1a2435" : "transparent",
                  color: active ? "#4ade80" : "#64748b",
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                  borderLeft: active ? "2px solid #4ade80" : "2px solid transparent",
                  width: "100%", textAlign: "left",
                  position: "relative",
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <span style={{ flex: 1 }}>{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span style={{
                    background: active ? "#4ade8033" : "#1e2635",
                    color: active ? "#4ade80" : "#64748b",
                    fontSize: 10, fontWeight: 600,
                    padding: "2px 6px", borderRadius: 10,
                  }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid #1e2635" }}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              width: "100%", padding: "8px", borderRadius: 8,
              background: "transparent", border: "none",
              color: "#475569", cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div style={{
          padding: "16px 28px", borderBottom: "1px solid #1e2635",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#0d1117", flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>
              {navItems.find(n => n.id === page)?.label || "대시보드"}
            </div>
            <div style={{ fontSize: 11, color: "#475569" }}>반려동물 통합 지식그래프 · 2026</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["시설", "관광", "보호·입양", "의료"].map(cat => (
              <span key={cat} style={{
                padding: "3px 10px", borderRadius: 20, fontSize: 11,
                background: `${categoryColors[cat]}18`,
                color: categoryColors[cat], border: `1px solid ${categoryColors[cat]}44`,
              }}>{cat}</span>
            ))}
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {page === "dashboard" && <DashboardPage datasets={datasets} setPage={setPage} />}
          {page === "datasets" && (
            <DatasetsPage
              datasets={filtered}
              all={datasets}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDataset={selectedDataset}
              setSelectedDataset={setSelectedDataset}
            />
          )}
          {page === "knowledge" && <KnowledgePage datasets={datasets} />}
          {page === "mapping" && <MappingPage datasets={datasets} />}
          {page === "poster" && <PosterPage datasets={datasets} />}
        </div>
      </div>
    </div>
  );
}

/* ── DASHBOARD ── */
function DashboardPage({ datasets, setPage }) {
  const catCounts = {};
  datasets.forEach(d => { catCounts[d.category] = (catCounts[d.category] || 0) + 1; });

  return (
    <div style={{ padding: 28 }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "총 데이터셋", value: "14개", sub: "7개 기관", color: "#4ade80", icon: "◫" },
          { label: "시설 데이터", value: "5종", sub: "행정안전부 중심", color: "#60a5fa", icon: "🏥" },
          { label: "관광·여행", value: "3종", sub: "WGS84 좌표", color: "#fbbf24", icon: "🐾" },
          { label: "보호·의료", value: "6종", sub: "입양·질병·등록", color: "#f87171", icon: "🩺" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#0d1117", border: "1px solid #1e2635", borderRadius: 12,
            padding: 20, borderTop: `3px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Dataset list */}
        <div style={{ background: "#0d1117", border: "1px solid #1e2635", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#94a3b8" }}>데이터셋 목록</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {datasets.map((d) => (
              <div key={d.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 8, background: "#141920",
              }}>
                <span style={{ fontSize: 16 }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: "#475569" }}>{d.provider}</div>
                </div>
                <span style={{
                  padding: "2px 8px", borderRadius: 10, fontSize: 10,
                  background: `${categoryColors[d.category]}18`,
                  color: categoryColors[d.category],
                }}>{d.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown + provider */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#0d1117", border: "1px solid #1e2635", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#94a3b8" }}>카테고리 분포</div>
            {Object.entries(catCounts).map(([cat, cnt]) => (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#cbd5e1" }}>{cat}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: categoryColors[cat] }}>{cnt}개</span>
                </div>
                <div style={{ height: 6, background: "#1e2635", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${(cnt / 14) * 100}%`,
                    background: categoryColors[cat], borderRadius: 3,
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#0d1117", border: "1px solid #1e2635", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#94a3b8" }}>제공기관</div>
            {providerStats.map((p) => (
              <div key={p.name} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "5px 0", borderBottom: "1px solid #1e2635",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.count}종</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── DATASETS ── */
function DatasetsPage({ datasets, all, categories, selectedCategory, setSelectedCategory, selectedDataset, setSelectedDataset }) {
  return (
    <div style={{ padding: 28 }}>
      {/* Category Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: `1px solid ${selectedCategory === cat ? "#4ade80" : "#1e2635"}`,
            background: selectedCategory === cat ? "#4ade8022" : "transparent",
            color: selectedCategory === cat ? "#4ade80" : "#64748b", fontWeight: 600,
          }}>{cat}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#475569", alignSelf: "center" }}>
          {datasets.length}개 데이터셋
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {datasets.map((d) => (
          <div
            key={d.id}
            onClick={() => setSelectedDataset(selectedDataset?.id === d.id ? null : d)}
            style={{
              background: "#0d1117", border: `1px solid ${selectedDataset?.id === d.id ? d.color : "#1e2635"}`,
              borderRadius: 12, padding: 20, cursor: "pointer",
              transition: "border-color 0.15s, transform 0.15s",
              borderTop: `3px solid ${d.color}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: `${d.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
              }}>{d.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{d.provider}</div>
              </div>
              <span style={{
                padding: "3px 8px", borderRadius: 8, fontSize: 10, fontWeight: 600,
                background: `${categoryColors[d.category]}18`, color: categoryColors[d.category],
              }}>{d.category}</span>
            </div>

            <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>{d.description}</p>

            <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>
              <span style={{ color: d.color, fontWeight: 600 }}>📊 {d.records}</span>
            </div>

            {selectedDataset?.id === d.id && (
              <div style={{ borderTop: "1px solid #1e2635", paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>주요 필드</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {d.keyFields.map((f) => (
                    <span key={f} style={{
                      padding: "2px 8px", borderRadius: 6, fontSize: 10,
                      background: "#141920", color: "#94a3b8", border: "1px solid #1e2635",
                      fontFamily: "monospace",
                    }}>{f}</span>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#475569" }}>Schema.org:</span>
                  <span style={{ fontSize: 10, color: d.color, fontFamily: "monospace" }}>{d.schemaOrg}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── KNOWLEDGE GRAPH ── */
function KnowledgePage({ datasets }) {
  const nodes = [
    { id: "dog", label: "🐕 반려견", x: 50, y: 50, color: "#4ade80", size: 16 },
    { id: "cat", label: "🐈 반려묘", x: 50, y: 78, color: "#60a5fa", size: 14 },
    { id: "hospital", label: "🏥 동물병원", x: 18, y: 30, color: "#4ade80", size: 12 },
    { id: "pharmacy", label: "💊 동물약국", x: 8, y: 55, color: "#60a5fa", size: 11 },
    { id: "grooming", label: "✂️ 미용실", x: 18, y: 78, color: "#f472b6", size: 10 },
    { id: "shelter", label: "🏠 보호센터", x: 80, y: 25, color: "#f87171", size: 12 },
    { id: "rescue", label: "🆘 구조동물", x: 92, y: 48, color: "#f87171", size: 11 },
    { id: "disease", label: "🦠 질병", x: 72, y: 68, color: "#c084fc", size: 11 },
    { id: "symptom", label: "🩺 증상", x: 88, y: 75, color: "#f9a8d4", size: 10 },
    { id: "travel", label: "✈️ 동반여행", x: 35, y: 18, color: "#38bdf8", size: 11 },
    { id: "restarea", label: "🛣️ 휴게소", x: 62, y: 12, color: "#fbbf24", size: 10 },
    { id: "registration", label: "🪪 등록정보", x: 50, y: 35, color: "#86efac", size: 13 },
  ];

  const edges = [
    ["dog", "hospital"], ["dog", "pharmacy"], ["dog", "grooming"],
    ["dog", "disease"], ["dog", "registration"], ["dog", "travel"],
    ["cat", "hospital"], ["cat", "disease"], ["cat", "pharmacy"],
    ["shelter", "rescue"], ["rescue", "dog"], ["rescue", "cat"],
    ["disease", "symptom"], ["registration", "dog"],
    ["travel", "restarea"], ["hospital", "pharmacy"],
  ];

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 16, fontSize: 13, color: "#64748b" }}>
        반려동물 데이터 간 관계 구조 (개념 시각화)
      </div>
      <div style={{
        background: "#0d1117", border: "1px solid #1e2635", borderRadius: 12,
        position: "relative", height: 480, overflow: "hidden",
      }}>
        {/* Background grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {edges.map(([a, b], i) => {
            const na = nodes.find(n => n.id === a);
            const nb = nodes.find(n => n.id === b);
            if (!na || !nb) return null;
            return (
              <line key={i}
                x1={`${na.x}%`} y1={`${na.y}%`}
                x2={`${nb.x}%`} y2={`${nb.y}%`}
                stroke="#1e3a5f" strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {nodes.map((n) => (
          <div key={n.id} style={{
            position: "absolute",
            left: `${n.x}%`, top: `${n.y}%`,
            transform: "translate(-50%, -50%)",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 4,
          }}>
            <div style={{
              width: n.size * 3, height: n.size * 3,
              borderRadius: "50%", background: `${n.color}22`,
              border: `2px solid ${n.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: n.size * 0.9, cursor: "pointer",
            }}>
              {n.label.split(" ")[0]}
            </div>
            <div style={{
              fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap",
              background: "#0d1117cc", padding: "1px 4px", borderRadius: 4,
            }}>
              {n.label.split(" ").slice(1).join(" ")}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20, background: "#0d1117", border: "1px solid #1e2635",
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#94a3b8" }}>
          주요 관계 (Relationships)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { rel: "반려견 → 동물병원", type: "nearBy / treatedAt", color: "#4ade80" },
            { rel: "반려견 → 질병", type: "susceptibleTo", color: "#c084fc" },
            { rel: "질병 → 증상", type: "hasSymptom", color: "#f9a8d4" },
            { rel: "구조동물 → 보호센터", type: "protectedAt", color: "#f87171" },
            { rel: "등록정보 → 반려견", type: "identifies", color: "#86efac" },
            { rel: "반려견 → 동반여행", type: "canVisit", color: "#38bdf8" },
          ].map((r, i) => (
            <div key={i} style={{
              padding: "10px 12px", background: "#141920",
              borderRadius: 8, borderLeft: `3px solid ${r.color}`,
            }}>
              <div style={{ fontSize: 11, color: "#e2e8f0", marginBottom: 3 }}>{r.rel}</div>
              <div style={{ fontSize: 10, color: r.color, fontFamily: "monospace" }}>{r.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MAPPING TABLE ── */
function MappingPage({ datasets }) {
  const [active, setActive] = useState(datasets[0].id);
  const d = datasets.find(x => x.id === active);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {datasets.map(ds => (
          <button key={ds.id} onClick={() => setActive(ds.id)} style={{
            padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12,
            border: `1px solid ${active === ds.id ? ds.color : "#1e2635"}`,
            background: active === ds.id ? `${ds.color}18` : "transparent",
            color: active === ds.id ? ds.color : "#64748b",
          }}>{ds.icon} {ds.name}</button>
        ))}
      </div>

      {d && (
        <div style={{ background: "#0d1117", border: "1px solid #1e2635", borderRadius: 12, overflow: "hidden" }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid #1e2635",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 24 }}>{d.icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{d.name}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>{d.provider} · {d.records}</div>
            </div>
            <div style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 12, color: d.color }}>
              {d.schemaOrg}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#141920" }}>
                  {["필드명", "타입", "원본 API 필드", "Schema.org 매핑", "설명"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: "left",
                      fontSize: 11, color: "#64748b", fontWeight: 600,
                      borderBottom: "1px solid #1e2635",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.keyFields.map((f, i) => {
                  const fieldMeta = {
                    "Name": { type: "text", raw: "BPLC_NM", schema: "schema:name", desc: "시설 공식 명칭" },
                    "Facility_ID": { type: "text", raw: "MNG_NO", schema: "schema:identifier", desc: "시설 고유 식별자" },
                    "Category": { type: "text", raw: "OPN_ATMY_GRP_CD", schema: "schema:category", desc: "업종 카테고리" },
                    "RoadAddress": { type: "text", raw: "ROAD_NM_ADDR", schema: "schema:streetAddress", desc: "전체 도로명 주소" },
                    "lat/lon": { type: "float", raw: "CRD_INFO_Y/X", schema: "schema:latitude/longitude", desc: "WGS84 좌표 (TM 변환 필요)" },
                    "PhoneNumber": { type: "text", raw: "TELNO", schema: "schema:telephone", desc: "대표 전화번호" },
                    "BusinessStatus": { type: "text", raw: "SALS_STTS_NM", schema: "schema:additionalProperty", desc: "영업 상태" },
                    "LicenseDate": { type: "date", raw: "LCPMT_YMD", schema: "schema:foundingDate", desc: "인허가 일자" },
                    "ClosingDate": { type: "date", raw: "CLSBIZ_YMD", schema: "schema:dissolutionDate", desc: "폐업 일자" },
                  };
                  const meta = fieldMeta[f] || { type: "text", raw: f, schema: "schema:additionalProperty", desc: "추가 정보" };
                  return (
                    <tr key={f} style={{ borderBottom: "1px solid #0f1623" }}>
                      <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12, color: d.color }}>{f}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{
                          padding: "2px 6px", borderRadius: 4, fontSize: 10,
                          background: "#1e2635", color: "#64748b",
                        }}>{meta.type}</span>
                      </td>
                      <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 11, color: "#94a3b8" }}>{meta.raw}</td>
                      <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 11, color: "#60a5fa" }}>{meta.schema}</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, color: "#64748b" }}>{meta.desc}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── POSTER ── */
function PosterPage({ datasets }) {
  const categoryGroups = {};
  datasets.forEach(d => {
    if (!categoryGroups[d.category]) categoryGroups[d.category] = [];
    categoryGroups[d.category].push(d);
  });

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0d1117 0%, #0f1e2e 50%, #0d1117 100%)",
        border: "1px solid #1e3a5f", borderRadius: 16, padding: "40px 44px",
        marginBottom: 24, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          borderRadius: "50%", background: "radial-gradient(circle, #4ade8022, transparent 70%)",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "4px 14px", borderRadius: 20, border: "1px solid #4ade8044",
            background: "#4ade8011", marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>반려동물 통합 지식그래프 v1.0 · 2026</span>
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 900, margin: "0 0 12px",
            background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            공공데이터 기반 반려동물<br />통합 지식그래프 구축
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", maxWidth: 600, lineHeight: 1.7, margin: 0 }}>
            행정안전부, 농림축산식품부, 한국관광공사 등 7개 기관에서 제공하는
            14종의 공공 API 데이터를 통합하여 반려동물 생애주기 전반을 아우르는
            지식그래프(Knowledge Graph)를 구축한 프로젝트입니다.
          </p>
          <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
            {[
              { v: "14", u: "데이터셋" }, { v: "7", u: "제공기관" },
              { v: "~4.1M", u: "최대 레코드" }, { v: "5", u: "온톨로지 도메인" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{s.u}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category sections */}
      {Object.entries(categoryGroups).map(([cat, dsets]) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
          }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: categoryColors[cat] }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>{cat}</h2>
            <span style={{
              padding: "2px 10px", borderRadius: 10, fontSize: 11,
              background: `${categoryColors[cat]}18`, color: categoryColors[cat],
              border: `1px solid ${categoryColors[cat]}33`,
            }}>{dsets.length}종</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {dsets.map((d) => (
              <div key={d.id} style={{
                background: "#0d1117", border: "1px solid #1e2635",
                borderLeft: `4px solid ${d.color}`, borderRadius: 10, padding: 18,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{d.name}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{d.provider}</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 10, color: d.color, fontFamily: "monospace", textAlign: "right" }}>
                    {d.records}
                  </div>
                </div>

                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.65, margin: "0 0 12px" }}>{d.description}</p>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 6, fontWeight: 600 }}>핵심 필드</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {d.keyFields.slice(0, 5).map(f => (
                      <span key={f} style={{
                        padding: "2px 7px", fontSize: 9.5, borderRadius: 4,
                        background: "#141920", color: "#64748b",
                        border: "1px solid #1e2635", fontFamily: "monospace",
                      }}>{f}</span>
                    ))}
                    {d.keyFields.length > 5 && (
                      <span style={{ fontSize: 9.5, color: "#475569", padding: "2px 4px" }}>
                        +{d.keyFields.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#60a5fa" }}>{d.schemaOrg}</span>
                  <a href={d.sourceUrl} target="_blank" rel="noreferrer" style={{
                    fontSize: 10, color: "#475569", textDecoration: "none",
                    padding: "2px 8px", border: "1px solid #1e2635", borderRadius: 6,
                  }}>data.go.kr ↗</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Architecture */}
      <div style={{
        background: "#0d1117", border: "1px solid #1e2635", borderRadius: 12,
        padding: 28, marginBottom: 24,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginTop: 0, marginBottom: 20 }}>
          데이터 파이프라인 아키텍처
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
          {[
            { step: "01", label: "공공API 수집", sub: "7개 기관 REST API", color: "#4ade80", icon: "📡" },
            { step: "02", label: "전처리", sub: "TM→WGS84 변환\n필드 정규화", color: "#60a5fa", icon: "⚙️" },
            { step: "03", label: "온톨로지 매핑", sub: "schema.org / koah:\n어휘 매핑", color: "#fbbf24", icon: "🔗" },
            { step: "04", label: "RDF 트리플 생성", sub: "Subject-Predicate\n-Object", color: "#f87171", icon: "◈" },
            { step: "05", label: "지식그래프", sub: "SPARQL 조회\n관계 탐색", color: "#c084fc", icon: "🌐" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 140 }}>
              <div style={{
                flex: 1, background: "#141920", border: `1px solid ${s.color}44`,
                borderRadius: 10, padding: "16px 14px", textAlign: "center",
                borderTop: `3px solid ${s.color}`,
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 700, marginBottom: 4 }}>STEP {s.step}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.5, whiteSpace: "pre-line" }}>{s.sub}</div>
              </div>
              {i < 4 && (
                <div style={{ color: "#334155", fontSize: 18, padding: "0 6px", flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Technical notes */}
      <div style={{
        background: "#0d1117", border: "1px solid #1e2635", borderRadius: 12, padding: 24,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginTop: 0, marginBottom: 16 }}>
          기술 구현 노트
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            {
              icon: "🗺️", title: "좌표계 변환",
              content: "행안부 데이터는 TM(Transverse Mercator) 좌표계를 사용. 지도 시각화를 위해 WGS84(GPS) 변환 필수. 한국관광공사 API는 WGS84 직접 제공.",
              color: "#4ade80",
            },
            {
              icon: "🔀", title: "데이터 통합 전략",
              content: "시설명 + 주소 기반 퍼지 매칭(Fuzzy Matching)으로 관광공사-행안부 중복 시설 통합. 동물 등록번호(RFID)를 PK로 구조동물-보호센터 JOIN.",
              color: "#60a5fa",
            },
            {
              icon: "📐", title: "온톨로지 설계",
              content: "schema.org 기본 어휘 + koah: 커스텀 어휘(Sido, Dong, affectsBreed 등). RDF 클래스 계층: ex:PetFriendlyPlace → ex:PetHotel / ex:PetCafe.",
              color: "#fbbf24",
            },
            {
              icon: "⚡", title: "API 호출 구조",
              content: "관광공사 2단계 호출: areaBasedList2(목록) → detailPetTour2(동반조건). etcAcmpyInfo 필드에서 정규표현식으로 무게 제한 추출.",
              color: "#c084fc",
            },
          ].map((n, i) => (
            <div key={i} style={{
              padding: "14px 16px", background: "#141920",
              borderRadius: 8, borderLeft: `3px solid ${n.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{n.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{n.title}</span>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.65, margin: 0 }}>{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
