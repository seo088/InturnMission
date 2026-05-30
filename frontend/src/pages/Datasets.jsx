import { useState } from 'react'
import { useDatasets } from '../hooks'

const DS_DETAIL = {
  '동물병원': {
    summary: '전국 자치단체에서 관리하는 동물병원 인허가 정보를 일괄 취합. 영업 중인 병원뿐 아니라 폐업/휴업 이력까지 확인 가능한 의료 인프라 표준 API.',
    org: '행정안전부', format: 'REST / JSON+XML', count: '전국 전체',
    dataUrl: 'https://www.data.go.kr/data/15154952/openapi.do',
    baseUrl: 'https://apis.data.go.kr/1741000/animal_hospitals',
    endpoints: [
      { method: 'GET /info',    desc: '현재 병원 정보 조회 (핵심)' },
      { method: 'GET /history', desc: '영업 상태 이력 조회' },
    ],
    notice: '좌표계가 Bessel 중부원점TM (EPSG:5174)입니다. WGS84 변환 필수 (pyproj 활용).',
    keyFields: [
      { key: 'BPLC_NM',      desc: '사업장명',          role: 'entity' },
      { key: 'MNG_NO',       desc: '관리번호 (URI 키)', role: 'id'     },
      { key: 'SALS_STTS_NM', desc: '영업상태명',        role: 'prop'   },
      { key: 'ROAD_NM_ADDR', desc: '도로명주소',         role: 'prop'   },
      { key: 'CRD_INFO_X/Y', desc: 'Bessel → WGS84 변환', role: 'prop' },
      { key: 'LCPMT_YMD',    desc: '인허가일자',         role: 'prop'   },
    ],
    rdfClass: 'ex:AnimalHospital', uriPattern: 'ex:facility/hospital/{MNG_NO}', kgStatus: 'Y',
    params: [
      { name: 'serviceKey',              req: true,  desc: '공공데이터포털 인증키' },
      { name: 'pageNo / numOfRows',      req: true,  desc: '페이지 정보 (최대 100건)' },
      { name: 'cond[SALS_STTS_CD::EQ]', req: false, desc: '영업상태코드 01(영업), 03(폐업)' },
    ],
  },
  '동물약국': {
    summary: '전국 자치단체에서 인허가한 동물용 의약품 취급 업소(동물약국)의 명칭, 주소, 영업 상태, 좌표 정보를 제공하는 API.',
    org: '행정안전부', format: 'REST / JSON+XML', count: '전국 전체',
    dataUrl: 'https://www.data.go.kr/data/15154953/openapi.do',
    baseUrl: 'https://apis.data.go.kr/1741000/animal_pharmacies',
    endpoints: [
      { method: 'GET /info',    desc: '현재 약국 정보 조회' },
      { method: 'GET /history', desc: '이력 정보 조회' },
    ],
    notice: '좌표계 EPSG:5174(Bessel). SALS_STTS_CD=01(영업중) 필터링 필수.',
    keyFields: [
      { key: 'BPLC_NM',      desc: '사업장명',           role: 'entity' },
      { key: 'MNG_NO',       desc: '관리번호 (URI 키)',  role: 'id'     },
      { key: 'SALS_STTS_NM', desc: '영업상태명',         role: 'prop'   },
      { key: 'ROAD_NM_ADDR', desc: '도로명주소',          role: 'prop'   },
      { key: 'CRD_INFO_X/Y', desc: 'Bessel 좌표 → WGS84', role: 'prop' },
    ],
    rdfClass: 'ex:AnimalPharmacy', uriPattern: 'ex:facility/pharmacy/{MNG_NO}', kgStatus: 'Y',
    params: [
      { name: 'serviceKey',              req: true,  desc: '공공데이터포털 인증키' },
      { name: 'cond[SALS_STTS_CD::EQ]', req: false, desc: '01(영업중) 필터 권장' },
    ],
  },
  '동물미용업': {
    summary: '전국 동물미용업소의 인허가 정보, 영업상태, 면적, 좌표를 제공하는 API.',
    org: '행정안전부', format: 'REST / JSON+XML', count: '전국 전체',
    dataUrl: 'https://www.data.go.kr/data/15154952/openapi.do',
    baseUrl: 'https://apis.data.go.kr/1741000/pet_grooming',
    endpoints: [{ method: 'GET /info', desc: '미용업소 목록 조회' }],
    notice: '좌표계 EPSG:5174(Bessel) — WGS84 변환 필요.',
    keyFields: [
      { key: 'BPLC_NM',   desc: '사업장명',        role: 'entity' },
      { key: 'MNG_NO',    desc: '관리번호',         role: 'id'     },
      { key: 'LCTN_AREA', desc: '소재지 면적 (㎡)', role: 'prop'   },
    ],
    rdfClass: 'ex:PetGrooming', uriPattern: 'ex:facility/grooming/{MNG_NO}', kgStatus: '검토중',
    params: [{ name: 'serviceKey', req: true, desc: '공공데이터포털 인증키' }],
  },
  '동물위탁관리업': {
    summary: '반려동물 위탁관리업소(펫시터, 호텔 등)의 인허가·위치·영업 정보 제공 API.',
    org: '행정안전부', format: 'REST / JSON+XML', count: '전국 전체',
    dataUrl: 'https://www.data.go.kr/data/15155055/openapi.do',
    baseUrl: 'https://apis.data.go.kr/1741000/animal_boarding',
    endpoints: [{ method: 'GET /info', desc: '위탁관리업 목록 조회' }],
    notice: '좌표계 EPSG:5174 — WGS84 변환 필요.',
    keyFields: [
      { key: 'BPLC_NM',        desc: '사업장명',         role: 'entity' },
      { key: 'DTL_TASK_SE_NM', desc: '세부 업무 구분명', role: 'prop'   },
    ],
    rdfClass: 'ex:PetBoarding', uriPattern: 'ex:facility/boarding/{MNG_NO}', kgStatus: '검토중',
    params: [{ name: 'serviceKey', req: true, desc: '공공데이터포털 인증키' }],
  },
  '동물장묘업': {
    summary: '반려동물 장묘업(화장, 납골 등)의 위치 및 영업 정보 제공 API.',
    org: '행정안전부', format: 'REST / JSON+XML', count: '전국 전체',
    dataUrl: 'https://www.data.go.kr/data/15155065/openapi.do',
    baseUrl: 'https://apis.data.go.kr/1741000/animal_cremation',
    endpoints: [{ method: 'GET /info', desc: '장묘업 목록 조회' }],
    notice: '좌표계 EPSG:5174 — WGS84 변환 필요.',
    keyFields: [
      { key: 'BPLC_NM', desc: '사업장명', role: 'entity' },
      { key: 'MNG_NO',  desc: '관리번호', role: 'id'     },
    ],
    rdfClass: 'ex:PetCremation', uriPattern: 'ex:facility/cremation/{MNG_NO}', kgStatus: 'N',
    params: [{ name: 'serviceKey', req: true, desc: '공공데이터포털 인증키' }],
  },
  '반려동물 동반여행': {
    summary: '전국의 반려동물 동반 가능 관광지, 숙소, 음식점 정보와 동반 조건(무게 제한, 리드줄 여부 등) 및 상세 시설 정보를 제공하는 관광 전문 API.',
    org: '한국관광공사', format: 'REST / JSON+XML', count: '전국 관광지',
    dataUrl: 'https://www.data.go.kr/data/15135102/openapi.do',
    baseUrl: 'https://apis.data.go.kr/B551011/KorPetTourService2',
    endpoints: [
      { method: 'GET /detailPetTour2',     desc: '반려동물 동반 상세 정보 (핵심)' },
      { method: 'GET /petTourSyncList2',   desc: '동기화 목록' },
      { method: 'GET /areaBasedList2',     desc: '지역기반 관광정보 조회' },
      { method: 'GET /locationBasedList2', desc: '위치기반(GPS) 조회' },
      { method: 'GET /detailCommon2',      desc: '공통 정보 (이름, 주소, 전화)' },
    ],
    notice: '좌표계 WGS84 — 즉시 지도 시각화 가능. 목록→contentId→상세 2단계 수집 필요.',
    keyFields: [
      { key: 'contentid',      desc: '관광지 고유 ID (URI 키)', role: 'id'     },
      { key: 'title',          desc: '관광지 명칭',              role: 'entity' },
      { key: 'acmpyTypeCd',    desc: '동반 가능 형태 코드',      role: 'prop'   },
      { key: 'acmpyPsblCpam',  desc: '동반 가능 동물 조건',      role: 'prop'   },
      { key: 'relaPosesFclty', desc: '관련 보유 시설',           role: 'entity' },
      { key: 'mapx / mapy',    desc: 'WGS84 좌표 ✅',            role: 'prop'   },
    ],
    rdfClass: 'ex:PetFriendlyPlace', uriPattern: 'ex:tour/content/{contentId}', kgStatus: 'Y',
    params: [
      { name: 'MobileOS / MobileApp', req: true,  desc: 'ETC / TestApp' },
      { name: '_type',                req: true,  desc: 'json 설정 필수' },
      { name: 'contentTypeId',        req: false, desc: '12(관광지), 32(숙박), 39(음식점)' },
    ],
  },
  '구조동물': {
    summary: '전국 유실·유기 동물의 구조 정보(품종, 특징, 구조장소)와 현재 상태(공고중, 보호중 등), 보호소 정보를 제공하는 국가 표준 API.',
    org: '농림축산식품부 농림축산검역본부', format: 'REST / JSON+XML', count: '전국 유기동물',
    dataUrl: 'https://www.data.go.kr/data/15098931/openapi.do',
    baseUrl: 'http://apis.data.go.kr/1543061/abandonmentPublicService_v2',
    endpoints: [
      { method: 'GET /abandonmentPublic_v2', desc: '구조동물 목록 조회 (핵심)' },
      { method: 'GET /shelter_v2',           desc: '보호소 코드 조회' },
      { method: 'GET /kind_v2',              desc: '품종 코드 조회' },
    ],
    notice: '시도·품종 등을 전용 코드로 관리 → 코드 마스터 테이블 먼저 구축 필요.',
    keyFields: [
      { key: 'desertionNo',  desc: '유기번호 (URI 키)',         role: 'id'     },
      { key: 'kindCd',       desc: '품종 코드',                 role: 'entity' },
      { key: 'happenPlace',  desc: '구조장소',                  role: 'prop'   },
      { key: 'processState', desc: '상태 (공고중/보호중/입양)', role: 'prop'   },
      { key: 'popfile1',     desc: '동물 사진 URL',             role: 'prop'   },
      { key: 'careNm',       desc: '보호소이름 (조인 키)',       role: 'entity' },
    ],
    rdfClass: 'ex:AbandonedAnimal', uriPattern: 'ex:animal/rescue/{desertionNo}', kgStatus: 'Y',
    params: [
      { name: 'bgnde / endde', req: false, desc: '구조날짜 검색 범위 (YYYYMMDD)' },
      { name: 'upkind',        req: false, desc: '축종: 개(417000), 고양이(422400)' },
      { name: 'state',         req: false, desc: 'notice(공고중), protect(보호중)' },
    ],
  },
  '분실동물': {
    summary: '반려동물 분실 신고 정보(RFID, 품종, 분실장소, 신고자 연락처)를 제공하는 API.',
    org: '농림축산식품부', format: 'REST / JSON+XML', count: '전국 분실신고',
    dataUrl: 'https://www.data.go.kr/data/15141910/openapi.do',
    baseUrl: 'http://apis.data.go.kr/1543061/lossInfoService',
    endpoints: [{ method: 'GET /lossInfo', desc: '분실동물 목록 조회' }],
    notice: '',
    keyFields: [
      { key: 'rfidCd',     desc: 'RFID 칩 코드 (URI 키)', role: 'id'   },
      { key: 'happenDt',   desc: '분실 발생 일자',         role: 'prop' },
      { key: 'happenAddr', desc: '분실 발생 주소',         role: 'prop' },
      { key: 'callTel',    desc: '신고자 연락처',          role: 'prop' },
    ],
    rdfClass: 'ex:LostAnimal', uriPattern: 'ex:animal/lost/{rfidCd}', kgStatus: 'Y',
    params: [{ name: 'bgnde / ended', req: false, desc: '분실날짜 검색 범위' }],
  },
  '동물보호센터': {
    summary: '전국 동물보호센터의 위치, 시설 규모, 운영 시간, 수의사 수 등 상세 운영 정보를 제공하는 API.',
    org: '농림축산식품부 농림축산검역본부', format: 'REST / JSON+XML', count: '전국 보호센터',
    dataUrl: 'https://www.data.go.kr/data/15098915/openapi.do',
    baseUrl: 'http://apis.data.go.kr/1543061/animalShelterSrvc_v2',
    endpoints: [{ method: 'GET /shelterInfo_v2', desc: '보호센터 상세 정보 조회 (핵심)' }],
    notice: '좌표계 WGS84 ✅ — 즉시 사용 가능. careRegNo로 구조동물 API와 JOIN.',
    keyFields: [
      { key: 'careNm',         desc: '동물보호센터명',       role: 'entity' },
      { key: 'careRegNo',      desc: '등록번호 (URI 키)',    role: 'id'     },
      { key: 'lat / lng',      desc: 'WGS84 좌표 ✅',        role: 'prop'   },
      { key: 'vetPersonCnt',   desc: '수의사 수',            role: 'prop'   },
      { key: 'saveTrgtAnimal', desc: '구조대상동물',          role: 'prop'   },
    ],
    rdfClass: 'ex:AnimalShelter', uriPattern: 'ex:facility/shelter/{careRegNo}', kgStatus: 'Y',
    params: [{ name: 'upr_cd / org_cd', req: false, desc: '시도/시군구 코드' }],
  },
  '반려동물 동반가능 시설': {
    summary: '전국 반려동물 동반 가능 시설(카페, 펜션, 공원 등)의 위치 및 기본 정보를 제공하는 데이터셋.',
    org: '한국문화정보원', format: 'REST / JSON', count: '전국 시설',
    dataUrl: 'https://www.data.go.kr/data/15111389/fileData.do',
    baseUrl: 'https://api.odcloud.kr/api',
    endpoints: [{ method: 'GET /15111389/v1', desc: '반려동물 동반가능 시설 목록' }],
    notice: '',
    keyFields: [
      { key: 'name',      desc: '시설 명칭', role: 'entity' },
      { key: 'category',  desc: '시설 유형', role: 'prop'   },
      { key: 'lat / lng', desc: 'WGS84 좌표', role: 'prop'  },
    ],
    rdfClass: 'ex:PetFriendlyPlace', uriPattern: 'ex:facility/friendly/{id}', kgStatus: 'Y',
    params: [{ name: 'serviceKey', req: true, desc: '공공데이터포털 인증키' }],
  },
  '휴게소 편의시설': {
    summary: '고속도로 휴게소 내 반려동물 놀이터·편의시설의 명칭, 위치, 운영시간, 설치연도 정적 데이터셋.',
    org: '한국도로공사', format: 'CSV 파일', count: '전국 고속도로 휴게소',
    dataUrl: 'https://data.go.kr/data/15064250',
    baseUrl: '-',
    endpoints: [{ method: 'CSV 다운로드', desc: '파일 직접 다운로드 방식' }],
    notice: 'API가 아닌 CSV 직접 다운로드. 반려동물 놀이터 데이터를 편의시설 정보에 통합 처리.',
    keyFields: [
      { key: '휴게소명',  desc: '휴게소 공식 명칭', role: 'entity' },
      { key: '종류',     desc: '편의시설 종류',    role: 'prop'   },
      { key: '운영시간', desc: '운영 시간',        role: 'prop'   },
    ],
    rdfClass: 'ex:RestAreaPlayground', uriPattern: 'ex:facility/restarea/{slug}', kgStatus: '검토중',
    params: [],
  },
  '동물질병 증상분류': {
    summary: 'KISTI가 수집·정제한 동물질병 증상 분류 체계. 증상코드·한영 분류명·증상목록코드를 포함한 516건의 표준 증상 분류 데이터.',
    org: '한국과학기술정보연구원 (KISTI)', format: 'REST / JSON+XML', count: '516건',
    dataUrl: 'https://www.data.go.kr/data/15050441/fileData.do',
    baseUrl: 'https://api.odcloud.kr/api',
    endpoints: [{ method: 'GET /15050441/v1/...', desc: '최신 증상분류 데이터 조회' }],
    notice: '실시간 동기화가 아닌 정적 참조 테이블. 국제 수의학 온톨로지(SNOMED-CT Vet) 연계 가능.',
    keyFields: [
      { key: '증상코드',     desc: '증상 고유 식별자 (URI 키)',         role: 'id'     },
      { key: '증상분류 한글',desc: '분류 노드 (소화기계, 피부계 등)',   role: 'entity' },
      { key: '증상분류 영어',desc: '다국어 레이블',                     role: 'prop'   },
      { key: '증상명',      desc: '검색 및 추론 핵심 필드',             role: 'prop'   },
    ],
    rdfClass: 'ex:Symptom / ex:SymptomCategory', uriPattern: 'ex:medical/symptom/{증상코드}', kgStatus: 'Y',
    params: [{ name: 'page / perPage', req: false, desc: '페이지 인덱스 / 반환 건수' }],
  },
  '동물 질병 정보': {
    summary: '농림축산검역본부가 구축한 동물 질병 정보. 질병별 병원체·감염 경로·발생 원인을 포함한 117건의 수의학 기초 지식 데이터셋.',
    org: '농림축산식품부 농림축산검역본부', format: 'CSV 파일', count: '117건',
    dataUrl: 'https://www.data.go.kr/data/15103008/fileData.do',
    baseUrl: '-',
    endpoints: [{ method: 'CSV 다운로드', desc: 'CSV 파일 직접 다운로드 방식' }],
    notice: 'API가 아닌 CSV 다운로드. 병원체명·질병명의 한영 혼용 정제 필요.',
    keyFields: [
      { key: 'DISS_NO',          desc: '질병 고유 번호 (URI 키)',      role: 'id'     },
      { key: 'DISS_NM',          desc: '질병명 (한글)',                role: 'entity' },
      { key: 'ENG_DISS_NM',      desc: '질병명 (영문)',                role: 'prop'   },
      { key: 'CAUSE_CMMN_CL',    desc: '원인 분류 (바이러스/세균 등)', role: 'prop'   },
      { key: 'MAIN_INFC_ANIMAL', desc: '주요 감염 동물',               role: 'prop'   },
    ],
    rdfClass: 'ex:Disease', uriPattern: 'ex:medical/disease/{DISS_NO}', kgStatus: 'Y',
    params: [],
  },
  '반려동물 등록정보': {
    summary: '농림축산식품부에서 관리하는 반려동물 등록 정보. 동물등록번호, RFID 코드, 동물·보호자 정보를 제공하는 API.',
    org: '농림축산식품부', format: 'REST / JSON', count: '전국 등록 동물',
    dataUrl: 'https://www.data.go.kr/data/15098913/openapi.do',
    baseUrl: 'https://apis.data.go.kr/1543061/animalInfoSrvc_v3',
    endpoints: [{ method: 'GET /animalInfo_v3', desc: '반려동물 등록정보 조회' }],
    notice: 'dog_reg_no 또는 owner_nm으로 조회 가능.',
    keyFields: [
      { key: 'dogRegNo', desc: '동물 등록번호 (URI 키)', role: 'id'     },
      { key: 'rfidCd',   desc: 'RFID 칩 코드',          role: 'prop'   },
      { key: 'dogNm',    desc: '동물 이름',              role: 'entity' },
      { key: 'kindNm',   desc: '품종명',                 role: 'prop'   },
    ],
    rdfClass: 'ex:RegisteredAnimal', uriPattern: 'ex:animal/registered/{dogRegNo}', kgStatus: 'Y',
    params: [
      { name: 'dog_reg_no', req: false, desc: '동물등록번호' },
      { name: 'owner_nm',   req: false, desc: '소유자명' },
    ],
  },
}

const CAT_STYLES = {
  '의료·케어': { color: '#0d9488', bg: '#e6f7f5', icon: '🏥' },
  '보호·여가': { color: '#7c3aed', bg: '#ede9fe', icon: '🏠' },
  '이동·거점': { color: '#2563eb', bg: '#eff6ff', icon: '🛑' },
  '안전·개체': { color: '#e11d48', bg: '#fce7ec', icon: '🚨' },
  '사후관리':  { color: '#94a3b8', bg: '#f1f5f9', icon: '🌿' },
}

const ROLE_LABEL = { entity: '엔티티(Node)', prop: '속성(Property)', id: '식별자(ID)' }
const ROLE_COLOR = { entity: '#0d9488', prop: '#d97706', id: '#e11d48' }
const KG_STYLE = {
  'Y':     { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  'N':     { bg: '#fce7ec', color: '#e11d48', border: '#fecdd3' },
  '검토중': { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
}

function SectionTitle({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 18 }}>
      <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

function Modal({ ds, detail, onClose }) {
  if (!ds || !detail) return null
  const kg = KG_STYLE[detail.kgStatus] || KG_STYLE['N']
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, maxWidth: 780, width: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'fadeUp .22s ease both' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14, position: 'sticky', top: 0, background: 'var(--bg2)', zIndex: 5, borderRadius: '16px 16px 0 0' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', background: kg.bg, color: kg.color, border: `1px solid ${kg.border}`, marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>KG 반영: {detail.kgStatus}</div>
            <div style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.3, color: 'var(--text)', marginBottom: 3 }}>{ds.icon} {ds.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{detail.org} · {detail.format} · {detail.count}</div>
          </div>
          <button onClick={onClose} style={{ padding: '6px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--muted)', fontSize: 16, alignSelf: 'flex-start', lineHeight: 1 }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: '8px 24px 24px' }}>
          <SectionTitle title="한 줄 정의" />
          <div style={{ background: 'var(--bg3)', borderLeft: '3px solid var(--teal)', borderRadius: '0 8px 8px 0', padding: '12px 14px', fontSize: 13, color: 'var(--text2)', lineHeight: 1.75 }}>{detail.summary}</div>

          <SectionTitle title="API 정보" />
          {[['공공데이터 URL', <a href={detail.dataUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--teal)', fontSize: 12 }}>{detail.dataUrl}</a>],
            ['Base URL', <span style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--teal)', fontSize: 11 }}>{detail.baseUrl}</span>],
            ['RDF 클래스', <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#7c3aed', fontSize: 12 }}>{detail.rdfClass}</span>],
            ['URI 패턴', <span style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--yellow)', fontSize: 11 }}>{detail.uriPattern}</span>],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--muted)', flexShrink: 0, width: 120 }}>{lbl}</span>
              <span style={{ color: 'var(--text)', wordBreak: 'break-all', minWidth: 0 }}>{val}</span>
            </div>
          ))}

          <SectionTitle title="엔드포인트" />
          {detail.endpoints.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--teal)' }}>{e.method}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, paddingLeft: 4 }}>{e.desc}</div>
            </div>
          ))}

          {detail.notice && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#c2410c', marginTop: 14 }}>⚠️ {detail.notice}</div>
          )}

          {detail.params.length > 0 && <>
            <SectionTitle title="요청 파라미터" />
            <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    {['파라미터', '필수', '설명'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {detail.params.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '7px 12px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--blue)', fontSize: 11 }}>{p.name}</td>
                      <td style={{ padding: '7px 12px' }}><span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: p.req ? '#ecfdf5' : 'var(--bg3)', color: p.req ? '#059669' : 'var(--muted)', border: `1px solid ${p.req ? '#a7f3d0' : 'var(--border)'}` }}>{p.req ? '필수' : '선택'}</span></td>
                      <td style={{ padding: '7px 12px', color: 'var(--text2)' }}>{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}

          <SectionTitle title="핵심 데이터 필드" />
          <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--bg3)' }}>
                  {['필드명 (Key)', '의미', '지식그래프 역할'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {detail.keyFields.map((f, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '7px 12px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--teal)', fontSize: 11 }}>{f.key}</td>
                    <td style={{ padding: '7px 12px', color: 'var(--text2)' }}>{f.desc}</td>
                    <td style={{ padding: '7px 12px' }}><span style={{ fontSize: 11, fontWeight: 700, color: ROLE_COLOR[f.role] }}>{ROLE_LABEL[f.role]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Datasets() {
  const { data, isLoading } = useDatasets()
  const [selected, setSelected] = useState(null)

  const grouped = (data?.data || []).reduce((acc, ds) => {
    if (!acc[ds.cat]) acc[ds.cat] = []
    acc[ds.cat].push(ds)
    return acc
  }, {})

  const findDetail = (name) =>
    DS_DETAIL[name] ||
    Object.entries(DS_DETAIL).find(([k]) => name.includes(k) || k.includes(name))?.[1] ||
    null

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 17, fontWeight: 900, marginBottom: 4 }}>🗂️ 14개 데이터셋 상세</h1>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>카드를 클릭하면 API 명세, 주요 필드, 지식그래프 설계 정보를 확인할 수 있습니다</p>
      </div>

      {isLoading
        ? <div style={{ textAlign: 'center', padding: '80px 0', fontSize: 13, color: 'var(--muted)' }}>로딩 중...</div>
        : Object.entries(grouped).map(([cat, items]) => {
          const s = CAT_STYLES[cat] || { color: '#94a3b8', bg: '#f1f5f9', icon: '📦' }
          return (
            <div key={cat} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderRadius: 10, marginBottom: 12, background: s.bg, color: s.color, fontSize: 13, fontWeight: 700 }}>
                <span>{s.icon}</span><span>{cat}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, opacity: 0.6 }}>{items.length}개</span>
              </div>
              <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))' }}>
                {items.map(ds => {
                  const detail = findDetail(ds.name)
                  const kg = detail ? KG_STYLE[detail.kgStatus] : null
                  return (
                    <div key={ds.id} onClick={() => detail && setSelected({ ds, detail })}
                      style={{ borderRadius: 12, padding: '16px 18px', background: 'var(--bg2)', border: '1px solid var(--border)', cursor: detail ? 'pointer' : 'default', transition: 'all .2s', position: 'relative', overflow: 'hidden' }}
                      onMouseEnter={e => { if (detail) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = s.color + '88' } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, paddingTop: 4 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: s.bg, flexShrink: 0 }}>{ds.icon}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.3, marginBottom: 2 }}>{ds.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{ds.org}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {[ds.type, ds.realtime && 'realtime'].filter(Boolean).map(t => {
                          const cfg = { api: { l: 'API', bg: 'var(--teal-lt)', c: 'var(--teal)', b: '#99f6e4' }, csv: { l: 'CSV', bg: 'var(--yellow-lt)', c: 'var(--yellow)', b: '#fde68a' }, realtime: { l: '실시간', bg: 'var(--coral-lt)', c: 'var(--coral)', b: '#fecdd3' } }[t]
                          return cfg ? <span key={t} style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, background: cfg.bg, color: cfg.c, border: `1px solid ${cfg.b}` }}>{cfg.l}</span> : null
                        })}
                        <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)' }}>{ds.fields}개 필드</span>
                        {kg && <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, background: kg.bg, color: kg.color, border: `1px solid ${kg.border}`, marginLeft: 'auto' }}>KG {detail.kgStatus}</span>}
                      </div>
                      {detail && <div style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>상세 정보 보기 →</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      }

      {selected && <Modal ds={selected.ds} detail={selected.detail} onClose={() => setSelected(null)} />}
    </div>
  )
}
