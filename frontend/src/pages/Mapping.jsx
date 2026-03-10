import { useState } from 'react'

const ALL_ROWS = [
  // ── 동물병원 ──────────────────────────────────────────────────
  { sec:'동물병원', field:'Facility_ID', api:'MNG_NO', type:'text', schema:'schema:identifier', example:'366000001020260001', desc:'고유 식별자 (URI 키)', kg:'Y' },
  { sec:'동물병원', field:'Name', api:'BPLC_NM', type:'text', schema:'schema:name', example:'늘푸른동물병원', desc:'사업장 명칭', kg:'Y' },
  { sec:'동물병원', field:'BusinessStatus', api:'SALS_STTS_NM', type:'text', schema:'schema:additionalProperty', example:'영업/폐업', desc:'영업 상태', kg:'Y' },
  { sec:'동물병원', field:'RoadAddress', api:'ROAD_NM_ADDR', type:'text', schema:'schema:streetAddress', example:'대전광역시 서구 계룡로550', desc:'도로명 주소', kg:'Y' },
  { sec:'동물병원', field:'JibunAddress', api:'SITE_ADDR', type:'text', schema:'schema:address', example:'대전 서구 월평동 22', desc:'지번 주소', kg:'N' },
  { sec:'동물병원', field:'PhoneNumber', api:'TELNO', type:'text', schema:'schema:telephone', example:'042-731-5850', desc:'전화번호', kg:'Y' },
  { sec:'동물병원', field:'lat', api:'CRD_INFO_Y', type:'float', schema:'schema:latitude', example:'36.3178', desc:'⚠ TM→WGS84 변환 필요', kg:'Y' },
  { sec:'동물병원', field:'lon', api:'CRD_INFO_X', type:'float', schema:'schema:longitude', example:'127.3941', desc:'⚠ TM→WGS84 변환 필요', kg:'Y' },
  { sec:'동물병원', field:'LicenseDate', api:'LCPMT_YMD', type:'text', schema:'dcterms:created', example:'20180301', desc:'인허가일자', kg:'검토중' },
  { sec:'동물병원', field:'BusinessArea', api:'LCTN_AREA', type:'float', schema:'schema:floorSize', example:'165.3', desc:'소재지 면적 (㎡)', kg:'N' },
  // ── 동물약국 ──────────────────────────────────────────────────
  { sec:'동물약국', field:'Facility_ID', api:'MNG_NO', type:'text', schema:'schema:identifier', example:'3664000010200001', desc:'관리번호 (URI 키)', kg:'Y' },
  { sec:'동물약국', field:'Name', api:'BPLC_NM', type:'text', schema:'schema:name', example:'한마음동물약국', desc:'사업장 명칭', kg:'Y' },
  { sec:'동물약국', field:'BusinessStatus', api:'SALS_STTS_NM', type:'text', schema:'schema:additionalProperty', example:'영업', desc:'영업 상태', kg:'Y' },
  { sec:'동물약국', field:'RoadAddress', api:'ROAD_NM_ADDR', type:'text', schema:'schema:streetAddress', example:'서울 강남구 테헤란로4길 14', desc:'도로명 주소', kg:'Y' },
  { sec:'동물약국', field:'PhoneNumber', api:'TELNO', type:'text', schema:'schema:telephone', example:'02-555-7890', desc:'전화번호', kg:'Y' },
  { sec:'동물약국', field:'lat', api:'CRD_INFO_Y', type:'float', schema:'schema:latitude', example:'37.4972', desc:'⚠ TM→WGS84 변환 필요', kg:'Y' },
  { sec:'동물약국', field:'lon', api:'CRD_INFO_X', type:'float', schema:'schema:longitude', example:'127.0456', desc:'⚠ TM→WGS84 변환 필요', kg:'Y' },
  // ── 동물미용업 ────────────────────────────────────────────────
  { sec:'동물미용업', field:'Facility_ID', api:'MNG_NO', type:'text', schema:'schema:identifier', example:'1168000022120001', desc:'관리번호 (URI 키)', kg:'Y' },
  { sec:'동물미용업', field:'Name', api:'BPLC_NM', type:'text', schema:'schema:name', example:'멍멍뷰티살롱', desc:'사업장 명칭', kg:'Y' },
  { sec:'동물미용업', field:'BusinessStatus', api:'SALS_STTS_NM', type:'text', schema:'schema:additionalProperty', example:'영업', desc:'영업 상태', kg:'Y' },
  { sec:'동물미용업', field:'RoadAddress', api:'ROAD_NM_ADDR', type:'text', schema:'schema:streetAddress', example:'서울 강남구 봉은사로 101', desc:'도로명 주소', kg:'Y' },
  { sec:'동물미용업', field:'BusinessArea', api:'LCTN_AREA', type:'float', schema:'schema:floorSize', example:'45.2', desc:'소재지 면적 (㎡)', kg:'검토중' },
  { sec:'동물미용업', field:'lat', api:'CRD_INFO_Y', type:'float', schema:'schema:latitude', example:'37.5125', desc:'⚠ TM→WGS84 변환', kg:'Y' },
  { sec:'동물미용업', field:'lon', api:'CRD_INFO_X', type:'float', schema:'schema:longitude', example:'127.0612', desc:'⚠ TM→WGS84 변환', kg:'Y' },
  // ── 동물위탁관리업 ────────────────────────────────────────────
  { sec:'동물위탁관리업', field:'Facility_ID', api:'MNG_NO', type:'text', schema:'schema:identifier', example:'3640000012340001', desc:'관리번호 (URI 키)', kg:'Y' },
  { sec:'동물위탁관리업', field:'Name', api:'BPLC_NM', type:'text', schema:'schema:name', example:'행복한펫호텔', desc:'사업장 명칭', kg:'Y' },
  { sec:'동물위탁관리업', field:'DetailTask', api:'DTL_TASK_SE_NM', type:'text', schema:'schema:serviceType', example:'애완동물 호텔', desc:'세부 업무 구분명', kg:'Y' },
  { sec:'동물위탁관리업', field:'BusinessStatus', api:'SALS_STTS_NM', type:'text', schema:'schema:additionalProperty', example:'영업', desc:'영업 상태', kg:'Y' },
  { sec:'동물위탁관리업', field:'RoadAddress', api:'ROAD_NM_ADDR', type:'text', schema:'schema:streetAddress', example:'경기 성남시 분당구 판교로 100', desc:'도로명 주소', kg:'Y' },
  { sec:'동물위탁관리업', field:'lat', api:'CRD_INFO_Y', type:'float', schema:'schema:latitude', example:'37.3928', desc:'⚠ TM→WGS84 변환', kg:'Y' },
  { sec:'동물위탁관리업', field:'lon', api:'CRD_INFO_X', type:'float', schema:'schema:longitude', example:'127.1102', desc:'⚠ TM→WGS84 변환', kg:'Y' },
  // ── 동물장묘업 ────────────────────────────────────────────────
  { sec:'동물장묘업', field:'Facility_ID', api:'MNG_NO', type:'text', schema:'schema:identifier', example:'2700000099010001', desc:'관리번호 (URI 키)', kg:'Y' },
  { sec:'동물장묘업', field:'Name', api:'BPLC_NM', type:'text', schema:'schema:name', example:'반려동물장례원', desc:'사업장 명칭', kg:'Y' },
  { sec:'동물장묘업', field:'BusinessStatus', api:'SALS_STTS_NM', type:'text', schema:'schema:additionalProperty', example:'영업', desc:'영업 상태', kg:'Y' },
  { sec:'동물장묘업', field:'RoadAddress', api:'ROAD_NM_ADDR', type:'text', schema:'schema:streetAddress', example:'경기 파주시 탄현면 오금리 123', desc:'도로명 주소', kg:'Y' },
  { sec:'동물장묘업', field:'lat', api:'CRD_INFO_Y', type:'float', schema:'schema:latitude', example:'37.7561', desc:'⚠ TM→WGS84 변환', kg:'N' },
  { sec:'동물장묘업', field:'lon', api:'CRD_INFO_X', type:'float', schema:'schema:longitude', example:'126.7821', desc:'⚠ TM→WGS84 변환', kg:'N' },
  // ── 반려동물 동반여행 ─────────────────────────────────────────
  { sec:'반려동물 동반여행', field:'ContentID', api:'contentid', type:'text', schema:'schema:identifier', example:'126508', desc:'관광지 ID (URI 키)', kg:'Y' },
  { sec:'반려동물 동반여행', field:'Title', api:'title', type:'text', schema:'schema:name', example:'한강공원 반려견 놀이터', desc:'관광지 명칭', kg:'Y' },
  { sec:'반려동물 동반여행', field:'ContentTypeId', api:'contenttypeid', type:'text', schema:'schema:additionalType', example:'12', desc:'콘텐츠 유형 (12=관광지)', kg:'Y' },
  { sec:'반려동물 동반여행', field:'Address', api:'addr1', type:'text', schema:'schema:streetAddress', example:'서울 영등포구 여의동로 330', desc:'기본 주소', kg:'Y' },
  { sec:'반려동물 동반여행', field:'AccompanyType', api:'acmpyTypeCd', type:'text', schema:'schema:additionalProperty', example:'가능', desc:'동반 가능 형태 코드', kg:'Y' },
  { sec:'반려동물 동반여행', field:'AccompanyCondition', api:'acmpyPsblCpam', type:'text', schema:'schema:additionalProperty', example:'소형견 전용 (5kg 이하)', desc:'동반 조건', kg:'Y' },
  { sec:'반려동물 동반여행', field:'RelatedFacility', api:'relaPosesFclty', type:'text', schema:'schema:amenityFeature', example:'펫 전용 산책로, 음수대', desc:'관련 보유 시설', kg:'Y' },
  { sec:'반려동물 동반여행', field:'lon', api:'mapx', type:'float', schema:'geo:long', example:'126.9242', desc:'✅ WGS84 직접 사용', kg:'Y' },
  { sec:'반려동물 동반여행', field:'lat', api:'mapy', type:'float', schema:'geo:lat', example:'37.5271', desc:'✅ WGS84 직접 사용', kg:'Y' },
  { sec:'반려동물 동반여행', field:'Tel', api:'tel', type:'text', schema:'schema:telephone', example:'02-3146-2551', desc:'전화번호', kg:'Y' },
  { sec:'반려동물 동반여행', field:'ImageUrl', api:'firstimage', type:'text', schema:'schema:image', example:'https://...jpg', desc:'대표 이미지 URL', kg:'검토중' },
  // ── 구조동물 ──────────────────────────────────────────────────
  { sec:'구조동물', field:'DesertionNo', api:'desertionNo', type:'text', schema:'schema:identifier', example:'202404001234', desc:'유기번호 (URI 키)', kg:'Y' },
  { sec:'구조동물', field:'RfidCode', api:'rfidCd', type:'text', schema:'owl:sameAs', example:'410123456789012', desc:'RFID 칩 코드 (JOIN 키)', kg:'Y' },
  { sec:'구조동물', field:'HappenDate', api:'happenDt', type:'text', schema:'schema:dateCreated', example:'20240401', desc:'구조 발생 일자', kg:'Y' },
  { sec:'구조동물', field:'HappenPlace', api:'happenPlace', type:'text', schema:'schema:location', example:'서울시 마포구 망원동', desc:'구조장소', kg:'Y' },
  { sec:'구조동물', field:'KindCode', api:'kindCd', type:'text', schema:'skos:Concept', example:'[개] 믹스견', desc:'품종 코드 (축종+품종)', kg:'Y' },
  { sec:'구조동물', field:'ProcessState', api:'processState', type:'text', schema:'schema:additionalProperty', example:'보호중', desc:'처리상태', kg:'Y' },
  { sec:'구조동물', field:'SexCd', api:'sexCd', type:'text', schema:'schema:gender', example:'M/F/Q', desc:'성별 코드', kg:'Y' },
  { sec:'구조동물', field:'Age', api:'age', type:'text', schema:'schema:age', example:'2024(년생)', desc:'나이 (년생 표기)', kg:'Y' },
  { sec:'구조동물', field:'Weight', api:'weight', type:'text', schema:'schema:weight', example:'3.5(kg)', desc:'체중', kg:'Y' },
  { sec:'구조동물', field:'ImageUrl', api:'popfile1', type:'text', schema:'schema:image', example:'https://...jpg', desc:'동물 사진 URL', kg:'Y' },
  { sec:'구조동물', field:'CareRegNo', api:'careRegNo', type:'text', schema:'schema:containedInPlace', example:'411310201900001', desc:'보호소 등록번호 (JOIN 키)', kg:'Y' },
  { sec:'구조동물', field:'CareName', api:'careNm', type:'text', schema:'schema:name', example:'서울동물복지지원센터', desc:'보호소이름', kg:'Y' },
  // ── 분실동물 ──────────────────────────────────────────────────
  { sec:'분실동물', field:'RfidCode', api:'rfidCd', type:'text', schema:'schema:identifier', example:'410123456789012', desc:'RFID 칩 코드 (URI 키)', kg:'Y' },
  { sec:'분실동물', field:'HappenDate', api:'happenDt', type:'text', schema:'schema:dateCreated', example:'20240401', desc:'분실 발생 일자', kg:'Y' },
  { sec:'분실동물', field:'HappenAddress', api:'happenAddr', type:'text', schema:'schema:location', example:'서울 서초구 방배동', desc:'분실 발생 주소', kg:'Y' },
  { sec:'분실동물', field:'KindName', api:'kindNm', type:'text', schema:'skos:Concept', example:'믹스견', desc:'품종명', kg:'Y' },
  { sec:'분실동물', field:'Age', api:'age', type:'text', schema:'schema:age', example:'3', desc:'나이 (년)', kg:'Y' },
  { sec:'분실동물', field:'OwnerTel', api:'callTel', type:'text', schema:'schema:telephone', example:'010-1234-5678', desc:'신고자 연락처', kg:'검토중' },
  { sec:'분실동물', field:'ImageUrl', api:'photo', type:'text', schema:'schema:image', example:'https://...jpg', desc:'동물 사진 URL', kg:'Y' },
  // ── 동물보호센터 ──────────────────────────────────────────────
  { sec:'동물보호센터', field:'CareRegNo', api:'careRegNo', type:'text', schema:'schema:identifier', example:'411310201900001', desc:'등록번호 (URI 키 / JOIN 키)', kg:'Y' },
  { sec:'동물보호센터', field:'Name', api:'careNm', type:'text', schema:'schema:name', example:'서울동물복지지원센터', desc:'동물보호센터명', kg:'Y' },
  { sec:'동물보호센터', field:'OrgNm', api:'orgNm', type:'text', schema:'schema:department', example:'서울특별시', desc:'관할 기관명', kg:'Y' },
  { sec:'동물보호센터', field:'lat', api:'lat', type:'float', schema:'geo:lat', example:'37.5671', desc:'✅ WGS84 직접 사용', kg:'Y' },
  { sec:'동물보호센터', field:'lon', api:'lng', type:'float', schema:'geo:long', example:'126.8941', desc:'✅ WGS84 직접 사용', kg:'Y' },
  { sec:'동물보호센터', field:'Tel', api:'careTel', type:'text', schema:'schema:telephone', example:'02-6734-5600', desc:'전화번호', kg:'Y' },
  { sec:'동물보호센터', field:'VetPersonCnt', api:'vetPersonCnt', type:'int', schema:'schema:numberOfEmployees', example:'3', desc:'수의사 수', kg:'Y' },
  { sec:'동물보호센터', field:'SaveTargetAnimal', api:'saveTrgtAnimal', type:'text', schema:'schema:amenityFeature', example:'개, 고양이', desc:'구조대상동물', kg:'Y' },
  { sec:'동물보호센터', field:'Capacity', api:'tmCnt', type:'int', schema:'schema:maximumAttendeeCapacity', example:'120', desc:'수용가능 마리수', kg:'검토중' },
  // ── 반려동물 동반가능 시설 ────────────────────────────────────
  { sec:'반려동물 동반가능 시설', field:'Name', api:'시설명', type:'text', schema:'schema:name', example:'카페 멍멍이네', desc:'시설 명칭', kg:'Y' },
  { sec:'반려동물 동반가능 시설', field:'Category', api:'카테고리', type:'text', schema:'schema:additionalType', example:'음식점 > 카페', desc:'시설 유형', kg:'Y' },
  { sec:'반려동물 동반가능 시설', field:'Address', api:'주소', type:'text', schema:'schema:streetAddress', example:'서울 마포구 와우산로 14', desc:'주소', kg:'Y' },
  { sec:'반려동물 동반가능 시설', field:'lat', api:'위도', type:'float', schema:'geo:lat', example:'37.5489', desc:'✅ WGS84 직접 사용', kg:'Y' },
  { sec:'반려동물 동반가능 시설', field:'lon', api:'경도', type:'float', schema:'geo:long', example:'126.9269', desc:'✅ WGS84 직접 사용', kg:'Y' },
  { sec:'반려동물 동반가능 시설', field:'Tel', api:'전화번호', type:'text', schema:'schema:telephone', example:'02-325-1234', desc:'전화번호', kg:'Y' },
  { sec:'반려동물 동반가능 시설', field:'Homepage', api:'홈페이지', type:'text', schema:'schema:url', example:'https://...', desc:'홈페이지 URL', kg:'검토중' },
  // ── 휴게소 편의시설 ───────────────────────────────────────────
  { sec:'휴게소 편의시설', field:'RestAreaName', api:'휴게소명', type:'text', schema:'schema:name', example:'여주 휴게소', desc:'휴게소 공식 명칭', kg:'Y' },
  { sec:'휴게소 편의시설', field:'FacilityType', api:'종류', type:'text', schema:'schema:amenityFeature', example:'반려동물 놀이터', desc:'편의시설 종류', kg:'Y' },
  { sec:'휴게소 편의시설', field:'Location', api:'위치', type:'text', schema:'schema:location', example:'서울방향 1층', desc:'시설 위치', kg:'Y' },
  { sec:'휴게소 편의시설', field:'OperHours', api:'운영시간', type:'text', schema:'schema:openingHours', example:'09:00~18:00', desc:'운영 시간', kg:'Y' },
  { sec:'휴게소 편의시설', field:'InstallYear', api:'설치연도', type:'text', schema:'dcterms:created', example:'2019', desc:'설치연도', kg:'N' },
  // ── 동물질병 증상분류 ─────────────────────────────────────────
  { sec:'동물질병 증상분류', field:'SymptomCode', api:'증상코드', type:'text', schema:'schema:identifier', example:'DH10.56', desc:'증상 고유 식별자 (URI 키)', kg:'Y' },
  { sec:'동물질병 증상분류', field:'CategoryKo', api:'증상분류 한글', type:'text', schema:'skos:broader', example:'안과 질환', desc:'증상 대분류 (한글)', kg:'Y' },
  { sec:'동물질병 증상분류', field:'CategoryEn', api:'증상분류 영어', type:'text', schema:'skos:altLabel', example:'Ophthalmic Disease', desc:'증상 대분류 (영어)', kg:'Y' },
  { sec:'동물질병 증상분류', field:'SymptomListCode', api:'증상목록코드', type:'text', schema:'skos:notation', example:'D001', desc:'증상 목록 코드', kg:'검토중' },
  { sec:'동물질병 증상분류', field:'SymptomName', api:'증상명', type:'text', schema:'skos:prefLabel', example:'바이러스성 결막염', desc:'증상명 (핵심 추론 필드)', kg:'Y' },
  // ── 동물 질병 정보 ────────────────────────────────────────────
  { sec:'동물 질병 정보', field:'DiseaseNo', api:'DISS_NO', type:'int', schema:'schema:identifier', example:'1', desc:'질병 고유 번호 (URI 키)', kg:'Y' },
  { sec:'동물 질병 정보', field:'DiseaseNameKo', api:'DISS_NM', type:'text', schema:'skos:prefLabel', example:'개디스템퍼', desc:'질병명 (한글)', kg:'Y' },
  { sec:'동물 질병 정보', field:'DiseaseNameEn', api:'ENG_DISS_NM', type:'text', schema:'skos:altLabel', example:'Canine Distemper', desc:'질병명 (영문)', kg:'Y' },
  { sec:'동물 질병 정보', field:'InfoProvider', api:'INFO_OFFER_NM', type:'text', schema:'dcterms:publisher', example:'농림축산검역본부', desc:'정보 제공 기관', kg:'N' },
  { sec:'동물 질병 정보', field:'RegisterDate', api:'RGSDE', type:'text', schema:'dcterms:created', example:'2015-10-01', desc:'등록 일자', kg:'N' },
  { sec:'동물 질병 정보', field:'MainInfectedAnimal', api:'MAIN_INFC_ANIMAL', type:'text', schema:'schema:additionalProperty', example:'개, 고양이, 너구리', desc:'주요 감염 동물', kg:'Y' },
  { sec:'동물 질병 정보', field:'CauseCategory', api:'CAUSE_CMMN_CL', type:'text', schema:'skos:Concept', example:'바이러스', desc:'원인 공통 분류', kg:'Y' },
]

const SECTIONS = [...new Set(ALL_ROWS.map(r => r.sec))]

const KG_STYLE = {
  'Y':     { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', label: 'Y' },
  'N':     { bg: '#fce7ec', color: '#e11d48', border: '#fecdd3', label: 'N' },
  '검토중': { bg: '#fef3c7', color: '#d97706', border: '#fde68a', label: '검토중' },
}

const SEC_COLOR = {
  '동물병원': '#0d9488', '동물약국': '#0284c7', '동물미용업': '#7c3aed',
  '동물위탁관리업': '#d97706', '동물장묘업': '#94a3b8',
  '반려동물 동반여행': '#ea580c', '구조동물': '#e11d48', '분실동물': '#f43f5e',
  '동물보호센터': '#7c3aed', '반려동물 동반가능 시설': '#2563eb',
  '휴게소 편의시설': '#16a34a', '동물질병 증상분류': '#0891b2', '동물 질병 정보': '#6366f1',
}

export default function Mapping() {
  const [search, setSearch] = useState('')
  const [filterSec, setFilterSec] = useState('전체')
  const [filterKg, setFilterKg] = useState('전체')

  const filtered = ALL_ROWS.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.field.toLowerCase().includes(q) || r.api.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.sec.toLowerCase().includes(q)
    const matchSec = filterSec === '전체' || r.sec === filterSec
    const matchKg = filterKg === '전체' || r.kg === filterKg
    return matchSearch && matchSec && matchKg
  })

  // group filtered rows by section
  const grouped = filtered.reduce((acc, r) => {
    if (!acc[r.sec]) acc[r.sec] = []
    acc[r.sec].push(r)
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 17, fontWeight: 900, marginBottom: 4 }}>🔗 매핑테이블 — API 원본 필드 ↔ Schema.org / LOV</h1>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>13개 데이터셋 · {ALL_ROWS.length}개 필드 · data.go.kr 실제 필드명 기반</p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 필드명 / 설명 검색..."
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', fontSize: 12.5, width: 220, outline: 'none', color: 'var(--text)' }}
        />
        <select value={filterSec} onChange={e => setFilterSec(e.target.value)}
          style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}>
          <option>전체</option>
          {SECTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterKg} onChange={e => setFilterKg(e.target.value)}
          style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}>
          {['전체', 'Y', '검토중', 'N'].map(v => <option key={v}>{v}</option>)}
        </select>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", marginLeft: 4 }}>
          {filtered.length}개 필드
        </span>
      </div>

      {/* Table grouped by section */}
      {Object.entries(grouped).map(([sec, rows]) => {
        const color = SEC_COLOR[sec] || '#94a3b8'
        return (
          <div key={sec} style={{ marginBottom: 28 }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', borderRadius: 8, marginBottom: 0, background: color + '14', color, fontSize: 12.5, fontWeight: 700, borderBottom: `2px solid ${color}` }}>
              <span>{sec}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, opacity: 0.65 }}>{rows.length}개</span>
            </div>
            <div style={{ overflowX: 'auto', borderRadius: '0 0 10px 10px', border: '1px solid var(--border)', borderTop: 'none' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    {['API 원본 필드명', '제안 필드명', 'Type', 'Schema.org / LOV', '예시값', '설명', 'KG 반영'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const kg = KG_STYLE[r.kg] || KG_STYLE['N']
                    const warn = r.desc.includes('⚠'), ok = r.desc.includes('✅')
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '7px 12px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--teal)', fontSize: 11, whiteSpace: 'nowrap' }}>{r.api}</td>
                        <td style={{ padding: '7px 12px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--blue)', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>{r.field}</td>
                        <td style={{ padding: '7px 12px' }}>
                          <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)' }}>{r.type}</span>
                        </td>
                        <td style={{ padding: '7px 12px', fontFamily: "'JetBrains Mono',monospace", color: '#7c3aed', fontSize: 11, whiteSpace: 'nowrap' }}>{r.schema}</td>
                        <td style={{ padding: '7px 12px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--muted)', fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.example}</td>
                        <td style={{ padding: '7px 12px', color: warn ? 'var(--orange)' : ok ? 'var(--green)' : 'var(--text2)', fontWeight: (warn || ok) ? 600 : 400, fontSize: 12 }}>{r.desc}</td>
                        <td style={{ padding: '7px 12px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", background: kg.bg, color: kg.color, border: `1px solid ${kg.border}`, whiteSpace: 'nowrap' }}>{kg.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 13 }}>
          검색 결과가 없습니다
        </div>
      )}
    </div>
  )
}
