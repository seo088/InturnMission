// 포스터 페이지 — 노션 정리본 전체 반영 (정확한 데이터 기반)

const categoryColors = {
  '시설':      '#4ade80',
  '관광·문화': '#fbbf24',
  '보호·입양': '#f87171',
  '의료':      '#c084fc',
}

// ── 노션 정리본 기반 정확한 데이터 ──
const datasets = [
  // ── 시설 ──
  {
    icon: '🏥',
    name: '동물병원 조회서비스',
    provider: '행정안전부',
    category: '시설',
    dataType: 'REST API',
    records: '전국 전수',
    color: '#4ade80',
    sourceUrl: 'https://www.data.go.kr/data/15154952/openapi.do',
    baseUrl: 'apis.data.go.kr/1741000/animal_hospitals',
    endpoints: ['/info (현재)', '/history (이력)'],
    summary: '전국 자치단체에서 관리하는 동물병원 인허가 정보를 일괄 취합. 영업 중 병원뿐 아니라 폐업/휴업 이력까지 확인 가능한 의료 인프라 표준 API.',
    keyFields: [
      { name: 'BPLC_NM', desc: '사업장명', role: 'Node' },
      { name: 'SALS_STTS_NM', desc: '영업상태명', role: 'Property' },
      { name: 'ROAD_NM_ADDR', desc: '도로명주소', role: 'Property' },
      { name: 'CRD_INFO_X/Y', desc: '좌표(Bessel)', role: 'Property' },
      { name: 'LCPMT_YMD', desc: '인허가일자', role: 'Property' },
      { name: 'MNG_NO', desc: '관리번호 (URI 키)', role: 'ID' },
    ],
    rdfClass: 'ex:AnimalHospital',
    uriPattern: 'ex:facility/hospital/{MNG_NO}',
    techNote: '좌표계 Bessel 중부원점(EPSG:5174) → pyproj로 WGS84 변환 필수. /history 엔드포인트로 지역별 개업/폐업 시계열 분석 가능.',
    warn: '⚠️ EPSG:5174 좌표 변환 필수',
  },
  {
    icon: '💊',
    name: '동물약국 조회서비스',
    provider: '행정안전부',
    category: '시설',
    dataType: 'REST API',
    records: '전국 전수',
    color: '#4ade80',
    sourceUrl: 'https://www.data.go.kr/data/15154953/openapi.do',
    baseUrl: 'apis.data.go.kr/1741000/animal_pharmacies',
    endpoints: ['/info (현재)', '/history (이력)'],
    summary: '전국 자치단체에서 인허가한 동물용 의약품 취급 업소(동물약국)의 명칭, 주소, 영업 상태, 좌표 정보 제공.',
    keyFields: [
      { name: 'BPLC_NM', desc: '사업장명', role: 'Node' },
      { name: 'SALS_STTS_NM', desc: '영업상태명', role: 'Property' },
      { name: 'ROAD_NM_ADDR', desc: '도로명주소', role: 'Property' },
      { name: 'CRD_INFO_X/Y', desc: '좌표(Bessel)', role: 'Property' },
      { name: 'LCPMT_YMD', desc: '인허가일자', role: 'Property' },
      { name: 'MNG_NO', desc: '관리번호 (URI 키)', role: 'ID' },
    ],
    rdfClass: 'ex:AnimalPharmacy',
    uriPattern: 'ex:pharmacy/{MNG_NO}',
    techNote: 'SALS_STTS_CD=01(영업중)만 필터링 권장. EPSG:5174 좌표 변환 필수. ROAD_NM_ADDR에서 시/도·구/군 파싱 후 지역 노드 연결.',
    warn: '⚠️ EPSG:5174 좌표 변환 필수',
  },
  {
    icon: '✂️',
    name: '동물미용업 조회서비스',
    provider: '행정안전부',
    category: '시설',
    dataType: 'REST API',
    records: '전국 전수',
    color: '#4ade80',
    sourceUrl: 'https://www.data.go.kr/data/15154944/openapi.do',
    baseUrl: 'apis.data.go.kr/1741000/pet_grooming',
    endpoints: ['/info (현재)', '/history (이력)'],
    summary: '전국 동물 미용업(반려동물 미용·위생 관리) 인허가 업소의 명칭, 주소, 영업 상태 제공. 1인 기업 보호를 위해 상세 주소 비식별 처리됨.',
    keyFields: [
      { name: 'BPLC_NM', desc: '사업장명', role: 'Node' },
      { name: 'DTL_TASK_SE_NM', desc: '상세업무구분명', role: 'Node' },
      { name: 'ROAD_NM_ADDR', desc: '도로명주소(비식별)', role: 'Property' },
      { name: 'CRD_INFO_X/Y', desc: '좌표(EPSG:5147)', role: 'Property' },
      { name: 'SALS_STTS_NM', desc: '영업상태명', role: 'Property' },
      { name: 'MNG_NO', desc: '관리번호 (URI 키)', role: 'ID' },
    ],
    rdfClass: 'ex:PetGroomingShop',
    uriPattern: 'ex:facility/grooming/{MNG_NO}',
    techNote: '상세주소 비식별 처리(건물 단위까지만 매핑 가능). EPSG:5147 좌표계 사용(약국과 동일 변환 모듈 재사용 가능).',
    warn: '⚠️ 상세주소 비식별 처리됨',
  },
  {
    icon: '🏡',
    name: '동물위탁관리업 조회서비스',
    provider: '행정안전부',
    category: '시설',
    dataType: 'REST API',
    records: '전국 전수',
    color: '#4ade80',
    sourceUrl: 'https://www.data.go.kr/data/15155055/openapi.do',
    baseUrl: 'apis.data.go.kr/1741000/animal_boarding',
    endpoints: ['/info (현재)', '/history (이력)'],
    summary: '반려동물 소유자의 위탁을 받아 사육·훈련·보호를 수행하는 영업소(호텔, 유치원, 훈련소 등)의 인허가 및 위치 정보 제공.',
    keyFields: [
      { name: 'BPLC_NM', desc: '사업장명', role: 'Node' },
      { name: 'DTL_TASK_SE_NM', desc: '상세업무구분명', role: 'Node' },
      { name: 'ROAD_NM_ADDR', desc: '도로명주소(비식별)', role: 'Property' },
      { name: 'CRD_INFO_X/Y', desc: '좌표(EPSG:5174)', role: 'Property' },
      { name: 'LCTN_AREA', desc: '소재지면적', role: 'Property' },
      { name: 'MNG_NO', desc: '관리번호 (URI 키)', role: 'ID' },
    ],
    rdfClass: 'ex:AnimalBoarding → ex:PetHotel / ex:PetKindergarten',
    uriPattern: 'ex:facility/boarding/{MNG_NO}',
    techNote: 'LCTN_AREA(소재지면적)로 대형견 위탁 가능 여부 추론 가능. 활용신청 6건으로 API 응답 느릴 수 있어 타임아웃·재시도 로직 필요.',
    warn: '⚠️ API 응답 지연 가능성',
  },
  {
    icon: '🕊️',
    name: '동물장묘업 조회서비스',
    provider: '행정안전부',
    category: '시설',
    dataType: 'REST API',
    records: '전국 전수 (희소)',
    color: '#4ade80',
    sourceUrl: 'https://www.data.go.kr/data/15155065/openapi.do',
    baseUrl: 'apis.data.go.kr/1741000/animal_cremation',
    endpoints: ['/info (현재)', '/history (이력)'],
    summary: '동물 전용 장례식장, 화장시설, 건조장 및 납골시설을 운영하는 동물장묘업소의 인허가 정보와 위치 데이터. 특정 지역 밀집 경향.',
    keyFields: [
      { name: 'BPLC_NM', desc: '사업장명', role: 'Node' },
      { name: 'SALS_STTS_NM', desc: '영업상태명', role: 'Property' },
      { name: 'ROAD_NM_ADDR', desc: '도로명주소', role: 'Property' },
      { name: 'CRD_INFO_X/Y', desc: '좌표(EPSG:5174)', role: 'Property' },
      { name: 'LCPMT_YMD', desc: '인허가일자', role: 'Property' },
      { name: 'MNG_NO', desc: '관리번호 (URI 키)', role: 'ID' },
    ],
    rdfClass: 'ex:AnimalCremation (schema:FuneralService 매핑)',
    uriPattern: 'ex:facility/cremation/{MNG_NO}',
    techNote: '행안부 4대 API(약국·미용·위탁·장묘) 모두 EPSG:5174 공유 → 통합 변환 모듈 구축 가능. 지역별 장묘 시설 접근성 분석 지표로 활용.',
    warn: '⚠️ EPSG:5174 좌표 변환 필수',
  },

  // ── 관광·문화 ──
  {
    icon: '🐾',
    name: '반려동물 동반 가능 문화시설',
    provider: '한국문화정보원',
    category: '관광·문화',
    dataType: 'CSV / API',
    records: '약 70,650건 (대규모)',
    color: '#fbbf24',
    sourceUrl: 'https://www.data.go.kr/data/15111389/fileData.do',
    baseUrl: 'api.odcloud.kr/api (15111389/v1)',
    endpoints: ['Swagger: infuser.odcloud.kr/oas/docs?namespace=15111389/v1'],
    summary: '전국 미술관·박물관·카페·식당 등 반려동물과 함께 향유할 수 있는 문화 공간에 특화된 7만여 건 대규모 위치 기반 데이터셋. 2025년 3월 최신 보완.',
    keyFields: [
      { name: '시설명', desc: '문화시설 명칭', role: 'Node' },
      { name: '카테고리', desc: '시설 분류(미술관·카페 등)', role: 'Node' },
      { name: '위도/경도', desc: 'WGS84 좌표', role: 'Property' },
      { name: '반려동물 동반 가능 여부', desc: 'Boolean', role: 'Property' },
      { name: '반려동물 전용 정보', desc: '"강아지 메뉴 있음" 등', role: 'Property' },
      { name: '최종작성일', desc: '데이터 신뢰도 판단', role: 'Property' },
    ],
    rdfClass: 'ex:CulturalFacility → ex:Museum / ex:PetCafe',
    uriPattern: '시설명+위경도 기반 Entity Resolution',
    techNote: '7만 건 → 배치(Batch) 처리로 벌크 업로드 필요. 관광공사 데이터와 중복 가능성 높음 → 시설명+10m 반경 엔티티 해상도(Entity Resolution) 로직 적용 예정.',
    warn: '⚠️ 휴먼에러 포함, 데이터 정제 필수',
  },
  {
    icon: '🛣️',
    name: '휴게소 반려동물 놀이터 현황',
    provider: '한국도로공사',
    category: '관광·문화',
    dataType: 'REST API',
    records: '약 20건+ (고속도로 전체)',
    color: '#fbbf24',
    sourceUrl: 'https://www.data.go.kr/data/15064250/fileData.do',
    baseUrl: 'api.odcloud.kr/api',
    endpoints: ['/15064250/v1/uddi:d83eaf9c-... (2024.06.30 최신)'],
    summary: '고속도로 휴게소 내 설치된 반려동물 놀이터의 위치, 운영시간, 설치년도 등 상세 정보 제공. 반려동물 동반 장거리 이동 경로상 휴식 거점 데이터.',
    keyFields: [
      { name: '휴게소명', desc: '노드 생성 기준 키', role: 'ID' },
      { name: '종류', desc: '시설 종류(놀이터 등)', role: 'Property' },
      { name: '위치', desc: '휴게소 내 상세 위치', role: 'Property' },
      { name: '운영시간', desc: '"24시간" 또는 특정 시간대', role: 'Property' },
      { name: '휴장일', desc: '정기 휴무 정보', role: 'Property' },
      { name: '설치연도', desc: '시설 노후도 판단', role: 'Property' },
    ],
    rdfClass: 'Route → [contains] → RestArea → [hasFacility] → Playground',
    uriPattern: '휴게소명 기반 (좌표 없음 → 지오코딩 필요)',
    techNote: '⚠️ 위/경도 좌표 미제공. 휴게소명 기반 카카오/T-map API 지오코딩으로 WGS84 좌표 생성 필요. 2시간 간격 경로 추천 알고리즘 구현 예정.',
    warn: '⚠️ 좌표 없음 → 지오코딩 필요',
  },
  {
    icon: '✈️',
    name: '반려동물 동반여행 서비스',
    provider: '한국관광공사',
    category: '관광·문화',
    dataType: 'REST API',
    records: '전국 관광지·숙박·음식점',
    color: '#fbbf24',
    sourceUrl: 'https://www.data.go.kr/data/15135102/openapi.do',
    baseUrl: 'apis.data.go.kr/B551011/KorPetTourService2',
    endpoints: ['/detailPetTour2 (동반조건 핵심)', '/areaBasedList2', '/locationBasedList2', '/detailCommon2'],
    summary: '전국 관광지·숙박·음식점의 반려동물 동반 조건(무게 제한, 리드줄 여부 등) 및 보유 시설 정보 제공. WGS84 좌표 직접 제공.',
    keyFields: [
      { name: 'acmpyTypeCd', desc: '동반 가능 형태(전체/부분)', role: 'Property' },
      { name: 'acmpyNeedMtr', desc: '필요 사항(리드줄·배변봉투)', role: 'Property' },
      { name: 'etcAcmpyInfo', desc: '무게 제한(예: 10kg 미만)', role: 'Property' },
      { name: 'relaPosesFclty', desc: '관련 보유 시설', role: 'Node' },
      { name: 'mapx / mapy', desc: 'WGS84 좌표 직접 제공', role: 'Property' },
      { name: 'contentId', desc: '2단계 호출 키', role: 'ID' },
    ],
    rdfClass: 'ex:PetFriendlyPlace → ex:PetHotel / ex:PetCafe / ex:PetPark',
    uriPattern: 'ex:tour/content/{contentId}',
    techNote: '2단계 호출: areaBasedList2(목록) → detailPetTour2(동반조건). etcAcmpyInfo의 "10kg 미만" 등 텍스트를 정규표현식으로 추출하여 [강아지 크기]-[입장가능장소] 관계 정규화.',
    warn: '⚠️ 2단계 API 호출 구조',
  },

  // ── 보호·입양 ──
  {
    icon: '🆘',
    name: '구조동물 조회 서비스',
    provider: '농림축산식품부 농림축산검역본부',
    category: '보호·입양',
    dataType: 'REST API',
    records: '연간 약 10만 건 (실시간)',
    color: '#f87171',
    sourceUrl: 'https://www.data.go.kr/data/15098931/openapi.do',
    baseUrl: 'apis.data.go.kr/1543061/abandonmentPublicService_v2',
    endpoints: ['/abandonmentPublic_v2 (핵심)', '/shelter_v2', '/sido_v2', '/kind_v2'],
    summary: '전국 유실·유기 동물의 구조 정보(품종·특징·구조장소)와 현재 상태(공고중·보호중), 보호소 정보를 제공하는 국가 표준 API.',
    keyFields: [
      { name: 'desertionNo', desc: '유기번호 (URI 생성 키)', role: 'ID' },
      { name: 'kindCd', desc: '품종 코드', role: 'Node' },
      { name: 'happenPlace', desc: '구조장소', role: 'Property' },
      { name: 'processState', desc: '상태(공고중/보호중/입양)', role: 'Property' },
      { name: 'careNm', desc: '보호소이름 (보호소 노드 연결)', role: 'Node' },
      { name: 'popfile1', desc: '동물 사진 URL', role: 'Property' },
    ],
    rdfClass: 'ex:AbandonedAnimal → ex:Dog / ex:Cat',
    uriPattern: 'ex:animal/rescue/{desertionNo}',
    techNote: 'sido_v2·kind_v2로 코드 마스터 테이블 먼저 구축 후 매핑. 매일 변동(입양 등) → bgupd/enupd 파라미터로 Incremental Sync(증분 업데이트) 구현.',
    warn: '⚠️ 코드 마스터 테이블 선행 구축 필요',
  },
  {
    icon: '🔍',
    name: '분실동물 조회 서비스',
    provider: '농림축산식품부 농림축산검역본부',
    category: '보호·입양',
    dataType: 'REST API',
    records: '연간 약 5만 건',
    color: '#f87171',
    sourceUrl: 'https://www.data.go.kr/data/15141910/openapi.do',
    baseUrl: 'apis.data.go.kr/1543061/lossInfoService',
    endpoints: ['/lossInfo (핵심)', '/lossInfoSido', '/lossInfoSigungu', '/lossInfoKind'],
    summary: '국민이 직접 등록한 분실동물 정보(실종 장소·연락처·특징) 제공. 실종 반려동물의 빠른 귀가 지원 및 지역별 분실 현황 파악 가능.',
    keyFields: [
      { name: 'rfidCd', desc: 'RFID 번호 (매칭 핵심 키)', role: 'ID' },
      { name: 'happenAddr', desc: '분실주소 (지오코딩 필요)', role: 'Property' },
      { name: 'happenPlace', desc: '분실장소 상세', role: 'Property' },
      { name: 'callTel', desc: '보호자 연락처', role: 'Property' },
      { name: 'specialMark', desc: '특징("빨간 목줄" 등)', role: 'Property' },
      { name: 'popfile', desc: '동물 사진 URL', role: 'Property' },
    ],
    rdfClass: 'ex:LostAnimal',
    uriPattern: 'rfidCd 기반 → owl:sameAs로 구조동물과 연결',
    techNote: '핵심: rfidCd로 구조동물 API와 교차 매칭 → 동일 개체 발견 시 owl:sameAs 연결. happenAddr 지오코딩으로 분실 핫스팟 분석 가능.',
    warn: '⚠️ bgnde/ended 날짜 범위 필수',
  },
  {
    icon: '🏠',
    name: '동물보호센터 정보 조회서비스',
    provider: '농림축산식품부 농림축산검역본부',
    category: '보호·입양',
    dataType: 'REST API',
    records: '전국 약 280개소',
    color: '#f87171',
    sourceUrl: 'https://www.data.go.kr/data/15098915/openapi.do',
    baseUrl: 'apis.data.go.kr/1543061/animalShelterSrvc_v2',
    endpoints: ['/shelterInfo_v2'],
    summary: '전국 유기·구조 동물 보호 센터의 위치(WGS84), 시설 규모, 운영 시간, 수의사 수 등 상세 운영 정보 제공.',
    keyFields: [
      { name: 'careNm', desc: '동물보호센터명', role: 'Node' },
      { name: 'careRegNo', desc: '등록번호 (구조동물 API와 JOIN 키)', role: 'ID' },
      { name: 'lat / lng', desc: 'WGS84 (변환 불필요 ✅)', role: 'Property' },
      { name: 'vetPersonCnt', desc: '수의사 수 (의료 역량 지표)', role: 'Property' },
      { name: 'saveTrgtAnimal', desc: '구조대상(개·고양이·기타)', role: 'Property' },
      { name: 'weekOprStime/Etime', desc: '평일 운영 시간', role: 'Property' },
    ],
    rdfClass: 'ex:AnimalShelter',
    uriPattern: 'ex:facility/shelter/{careRegNo}',
    techNote: 'careRegNo로 구조동물 API와 Relational Join. WGS84 직접 제공 → 관광공사 데이터와 즉시 중첩 분석 가능. vetPersonCnt로 "의료 우수 보호소" 가중치 부여.',
    warn: '✅ WGS84 좌표 변환 불필요',
  },

  // ── 의료 ──
  {
    icon: '🩺',
    name: '동물질병 증상분류',
    provider: '한국과학기술정보연구원 (KISTI)',
    category: '의료',
    dataType: 'REST API',
    records: '516건 (정적 참조 테이블)',
    color: '#c084fc',
    sourceUrl: 'https://www.data.go.kr/data/15050441/fileData.do',
    baseUrl: 'api.odcloud.kr/api',
    endpoints: ['/15050441/v1/uddi:cc7486db-... (최신)', '/15050441/v1/uddi:4f72100d-... (구버전)'],
    summary: 'KISTI가 수집·정제한 동물질병 증상 분류 체계. 증상코드·한영 분류명·증상목록코드 포함 516건. 실시간 갱신 없는 정적 참조 테이블.',
    keyFields: [
      { name: '증상코드', desc: '증상 고유 식별자 (URI 키)', role: 'ID' },
      { name: '증상분류 한글', desc: '상위 분류 (소화기계·피부계 등)', role: 'Node' },
      { name: '증상분류 영어', desc: '국제 표준 온톨로지 연계용', role: 'Property' },
      { name: '증상목록코드', desc: '질병-증상 조인 기준 외래키', role: 'Property' },
      { name: '증상명', desc: '실제 증상 명칭', role: 'Property' },
    ],
    rdfClass: 'ex:Symptom → [belongsTo] → ex:SymptomCategory',
    uriPattern: 'ex:medical/symptom/{증상코드}',
    techNote: '정적 참조 테이블 → 초기 1회 수집 후 고정 노드 적재. 증상분류 영어 필드로 SNOMED-CT Veterinary 등 국제 온톨로지 매핑 가능. 질병 데이터와 [hasSymptom]으로 연결.',
    warn: '⚠️ 실시간 갱신 없는 1회성 데이터',
  },
  {
    icon: '🦠',
    name: '동물 질병 정보',
    provider: '농림축산식품부 농림축산검역본부',
    category: '의료',
    dataType: 'CSV 파일',
    records: '117건 (정적 지식 베이스)',
    color: '#c084fc',
    sourceUrl: 'https://www.data.go.kr/data/15103008/fileData.do',
    baseUrl: '— (CSV 직접 다운로드)',
    endpoints: ['다운로드: data.mafra.go.kr/opendata/data/indexOpenDataDetail.do?data_id=20220214000000001884'],
    summary: '농림축산검역본부가 유전자원은행과 연계하여 구축한 동물 질병 정보. 질병별 병원체·항원·감염 경로·발생 원인(바이러스/세균) 포함.',
    keyFields: [
      { name: '질병명', desc: '동물 질병 고유 명칭', role: 'Node' },
      { name: '병원체', desc: '질병 유발 병원체명', role: 'Property' },
      { name: '발생원인', desc: '바이러스/세균 구분', role: 'Category' },
      { name: '항원', desc: '면역 반응 유발 물질', role: 'Property' },
      { name: '감염경로', desc: '전파 방식', role: 'Property' },
      { name: '유전자원은행코드', desc: '연계 자원 식별자', role: 'ID' },
    ],
    rdfClass: 'ex:Disease → [causedBy] → ex:Pathogen',
    uriPattern: 'ex:medical/disease/{질병명_slug}',
    techNote: 'API 아닌 CSV 직접 다운로드 → 정기 다운로드 스크립트 필요. KISTI 증상분류와 "질병명↔증상명" JOIN으로 Symptom→[indicatesDisease]→Disease→[causedBy]→Pathogen 추론 체인 완성.',
    warn: '⚠️ API 아님 — CSV 다운로드 방식',
  },
]

const categoryOrder = ['시설', '관광·문화', '보호·입양', '의료']

export default function Poster() {
  const grouped = categoryOrder.reduce((acc, cat) => {
    acc[cat] = datasets.filter(d => d.category === cat)
    return acc
  }, {})

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* ── 헤더 ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #0f1e2e 50%, #0d1117 100%)',
        border: '1px solid #1e3a5f', borderRadius: 16,
        padding: '40px 44px', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          borderRadius: '50%', background: 'radial-gradient(circle, #4ade8022, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16,
          padding: '4px 14px', borderRadius: 20,
          border: '1px solid #4ade8044', background: '#4ade8011',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>
            반려동물 통합 지식그래프 v1.0 · 2026
          </span>
        </div>

        <h1 style={{
          fontSize: 30, fontWeight: 900, margin: '0 0 12px',
          background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em', lineHeight: 1.3,
        }}>
          공공데이터 기반 반려동물<br />통합 지식그래프 구축
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', maxWidth: 620, lineHeight: 1.8, margin: '0 0 24px' }}>
          행정안전부, 농림축산식품부(검역본부), 한국관광공사, 한국문화정보원, 한국도로공사,
          KISTI 등 6개 기관에서 제공하는 12종의 공공 API·CSV 데이터를 통합하여
          반려동물 생애주기 전반을 아우르는 Knowledge Graph를 구축한 프로젝트입니다.
        </p>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            { v: '12종', u: '데이터셋' },
            { v: '6개', u: '제공기관' },
            { v: '~70,650+', u: '최대 단일 규모' },
            { v: '4개', u: '온톨로지 도메인' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{s.u}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 카테고리별 데이터셋 ── */}
      {categoryOrder.map(cat => {
        const color = categoryColors[cat]
        return (
          <div key={cat} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: color }} />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', margin: 0 }}>{cat}</h2>
              <span style={{
                padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                background: `${color}18`, color, border: `1px solid ${color}33`,
              }}>{grouped[cat].length}종</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {grouped[cat].map(d => (
                <DatasetCard key={d.name} d={d} />
              ))}
            </div>
          </div>
        )
      })}

      {/* ── 파이프라인 ── */}
      <div style={{
        background: '#0d1117', border: '1px solid #1e2635',
        borderRadius: 14, padding: '24px 28px', marginBottom: 20,
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', marginTop: 0, marginBottom: 20 }}>
          데이터 파이프라인 아키텍처
        </h2>
        <div style={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto' }}>
          {[
            { step: '01', icon: '📡', label: '공공API/CSV 수집', sub: '6개 기관', color: '#4ade80' },
            { step: '02', icon: '⚙️', label: '전처리', sub: 'EPSG:5174→WGS84\n필드 정규화', color: '#fbbf24' },
            { step: '03', icon: '🔗', label: '온톨로지 매핑', sub: 'schema.org\nex: 커스텀 어휘', color: '#c084fc' },
            { step: '04', icon: '◈', label: 'RDF 트리플 생성', sub: 'S-P-O 구조\nURI 전략 적용', color: '#f87171' },
            { step: '05', icon: '🌐', label: '지식그래프 적재', sub: 'SPARQL 조회\nowl:sameAs 연결', color: '#86efac' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 130 }}>
              <div style={{
                flex: 1, background: '#141920',
                border: `1px solid ${s.color}44`, borderTop: `3px solid ${s.color}`,
                borderRadius: 10, padding: '14px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 5 }}>{s.icon}</div>
                <div style={{ fontSize: 9, color: s.color, fontWeight: 800, marginBottom: 3 }}>STEP {s.step}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{s.sub}</div>
              </div>
              {i < 4 && <div style={{ color: '#334155', fontSize: 18, padding: '0 4px', flexShrink: 0 }}>›</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── 핵심 기술 통합 시나리오 ── */}
      <div style={{
        background: '#0d1117', border: '1px solid #1e2635',
        borderRadius: 14, padding: '24px 28px',
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', marginTop: 0, marginBottom: 16 }}>
          핵심 데이터 통합 시나리오
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            {
              icon: '🗺️', title: '좌표계 통합', color: '#4ade80',
              body: '행안부 4대 API(병원·약국·미용·위탁·장묘)는 EPSG:5174(Bessel 중부원점). pyproj 라이브러리로 WGS84(EPSG:4326)로 일괄 변환. 관광공사·보호센터는 WGS84 직접 제공.',
            },
            {
              icon: '🔀', title: '분실-구조 교차 매칭', color: '#f87171',
              body: '분실동물 API의 rfidCd와 구조동물 API의 rfidCd가 일치하면 owl:sameAs 관계 자동 연결. 품종·색상·장소 텍스트 유사도 기반 후보 매칭도 병행.',
            },
            {
              icon: '🩺', title: '의료 추론 체인', color: '#c084fc',
              body: 'ex:Symptom(KISTI 516건) → [indicatesDisease] → ex:Disease(검역본부 117건) → [causedBy] → ex:Pathogen. 증상 입력 시 근처 진료 가능 병원 자동 추천.',
            },
            {
              icon: '🐾', title: '문화시설 엔티티 해상도', color: '#fbbf24',
              body: '한국문화정보원(7만 건)과 한국관광공사 데이터 중복 제거: 시설명+위/경도 10m 반경 이내면 동일 시설로 판단하여 노드 병합(Entity Resolution).',
            },
          ].map((n, i) => (
            <div key={i} style={{
              padding: '14px 16px', background: '#141920',
              border: '1px solid #1e2635', borderLeft: `3px solid ${n.color}`,
              borderRadius: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 17 }}>{n.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{n.title}</span>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{n.body}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ── 데이터셋 카드 (상세 정보 포함) ──
function DatasetCard({ d }) {
  const color = categoryColors[d.category]
  const roleColor = { Node: '#4ade80', Property: '#60a5fa', ID: '#f87171', Category: '#c084fc' }

  return (
    <div style={{
      background: '#0d1117', border: '1px solid #1e2635',
      borderLeft: `4px solid ${color}`, borderRadius: 10, padding: '20px 22px',
    }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>{d.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 }}>{d.name}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{d.provider}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
            background: '#141920', color: '#94a3b8', border: '1px solid #1e2635',
          }}>{d.dataType}</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
            background: `${color}18`, color, border: `1px solid ${color}33`,
          }}>{d.records}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 좌: 설명 + 엔드포인트 + 경고 */}
        <div>
          <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.75, margin: '0 0 10px' }}>{d.summary}</p>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 4 }}>Endpoint</div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#64748b', lineHeight: 1.6 }}>
              <div style={{ color: '#60a5fa88', marginBottom: 2 }}>{d.baseUrl}</div>
              {d.endpoints.map(e => (
                <div key={e} style={{ color: '#475569' }}>└ {e}</div>
              ))}
            </div>
          </div>

          <div style={{
            fontSize: 10, padding: '6px 10px', borderRadius: 6,
            background: '#1a1208', color: '#fbbf24',
            border: '1px solid #fbbf2433',
          }}>{d.warn}</div>
        </div>

        {/* 우: 핵심 필드 + RDF */}
        <div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 6 }}>핵심 필드 (지식그래프 역할)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {d.keyFields.map(f => (
                <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <code style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 4,
                    background: '#141920', color: '#94a3b8',
                    border: '1px solid #1e2635', fontFamily: 'monospace',
                    minWidth: 100, flexShrink: 0,
                  }}>{f.name}</code>
                  <span style={{
                    fontSize: 9, padding: '1px 5px', borderRadius: 4,
                    background: `${roleColor[f.role] || '#94a3b8'}18`,
                    color: roleColor[f.role] || '#94a3b8',
                    flexShrink: 0,
                  }}>{f.role}</span>
                  <span style={{ fontSize: 10, color: '#475569' }}>{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            padding: '8px 10px', background: '#141920',
            border: '1px solid #1e2635', borderRadius: 6,
          }}>
            <div style={{ fontSize: 9, color: '#475569', marginBottom: 4, fontWeight: 600 }}>RDF 클래스 / URI 전략</div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#c084fc', marginBottom: 3 }}>{d.rdfClass}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#60a5fa' }}>{d.uriPattern}</div>
          </div>

          <div style={{
            marginTop: 8, padding: '7px 10px', background: '#0f1a0f',
            border: '1px solid #4ade8022', borderRadius: 6, fontSize: 11, color: '#94a3b8', lineHeight: 1.6,
          }}>{d.techNote}</div>
        </div>
      </div>

      <div style={{
        marginTop: 12, paddingTop: 10, borderTop: '1px solid #1e2635',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#475569' }}>
          수정일: {d.name.includes('휴게소') ? '2025-07-24' : d.name.includes('증상') ? '2022-09-16' : d.name.includes('질병 정보') ? '2025-09-17' : d.name.includes('관광') ? '2026-01-08' : '2026-02-19'}
        </span>
        <a href={d.sourceUrl} target="_blank" rel="noreferrer" style={{
          fontSize: 10, color: '#475569', textDecoration: 'none',
          padding: '3px 10px', border: '1px solid #1e2635',
          borderRadius: 6, background: '#141920',
        }}>data.go.kr ↗</a>
      </div>
    </div>
  )
}
