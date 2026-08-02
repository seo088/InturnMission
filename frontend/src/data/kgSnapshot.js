export const kgSnapshot = {
  as_of: '2026-07-28',
  snapshot: true,
  headline: [
    { label: '핵심 활용 원천', value: '16종', detail: '공공데이터 13종 · AI Hub 2종 · 정부공표 1종' },
    { label: '정제·연계 카탈로그', value: '20종', detail: '핵심 원천에 환경·의약품 연계 4종 포함' },
    { label: '개별 TTL 산출물', value: '35개', detail: '정본 및 파생 그래프 레이어' },
    { label: '통합 그래프', value: '약 242MB', detail: 'knowledgemap_all.ttl 스냅샷' },
  ],
  core_stats: [
    { label: '동물병원 노드', value: '5,373', dataset: 'DS01' },
    { label: '표준 증상', value: '516', dataset: 'DS13 · 12개 분류' },
    { label: 'DS14 승인 매핑', value: '40', dataset: '25건 검수 완료' },
    { label: '증상–질병 관계', value: '145', dataset: 'DS27 · 37개 질병 노드' },
    { label: '운영정보 보강 시설', value: '3,460', dataset: 'DS29 · 병원/약국 중복 제외' },
    { label: '건강 관측', value: '112,332', dataset: 'DS17' },
  ],
  expansion: [
    { id: 'DS30', label: '공공 반려견 놀이터', value: '57곳', status: '연결 완료' },
    { id: 'DS32', label: '분실–구조 후보 연결', value: '882건', status: '속성 후보' },
    { id: 'DS33', label: '시설 서비스유형 관계', value: '5,921건', status: '등록 업종 기반' },
    { id: 'DS28', label: '건강 위험 후보', value: '4,160건', status: '진단 아님' },
  ],
  relations: [
    { from: '보호자 원문', predicate: 'selectedSymptom', to: 'DS13 표준 증상', count: '40', status: '검수 확정' },
    { from: 'DS13 표준 증상', predicate: 'indicatesDisease', to: 'DS27 질병', count: '145', status: '그래프 관계' },
    { from: '질병', predicate: 'treatedByDept', to: '진료 문의 분야', count: '22', status: '진료 탐색 보조' },
    { from: '병원·약국', predicate: '운영시간·홈페이지', to: '보강 속성', count: '3,460', status: '매칭 신뢰도 저장' },
    { from: '분실동물', predicate: 'matchingCandidate', to: '구조동물', count: '882', status: '확정 동일개체 아님' },
    { from: '시설', predicate: 'offersServiceType', to: '서비스 유형', count: '5,921', status: '등록 업종 기반' },
  ],
  boundaries: [
    '병원별 24시간·응급·전문진료·현재 접수 가능 여부는 미확인 상태로 분리 표시합니다.',
    '시설 후보 추천 구조는 구축되었으나, 현재 GraphDB의 검증 시설 후보 수는 0건입니다.',
    '의약품 데이터는 등록·허가 정보이며 적응증·금기 관계는 아직 정본화하지 않았습니다.',
    '건강 관측 데이터에는 안정적인 개체 식별자와 관측 시점이 부족하여 시간 추세 추론에 사용하지 않습니다.',
  ],
}

export const sourceRoles = {
  '동물병원': '시설·지역 기반 진료 후보', '동물약국': '시설 탐색', '동물미용업': '생활 서비스',
  '동물위탁관리업': '생활 서비스', '동물장묘업': '생활 서비스', '구조동물': '보호·매칭 후보',
  '분실동물': '보호·매칭 후보', '동물보호센터': '보호시설 탐색', '동물질병': '질병 지식',
  '반려동물 동반여행': '동반 여행지', '반려동물 동반 문화시설': '문화시설 추천', '휴게소 반려동물 놀이터': '이동·놀이시설',
  '동물질병 증상분류': 'DS13 표준 증상', '수의 QA': '자연어 표현 검토', '건강 관측': '건강 관측 레이어',
  '진료비 공표': '진료비 비교 정보', '기상예보': '날씨 기반 안내', '대기질': '환경 기반 안내',
  '동물용의약품 등록': '의약품 등록 정보', '동물용의약품 허가': '의약품 허가 정보',
}
