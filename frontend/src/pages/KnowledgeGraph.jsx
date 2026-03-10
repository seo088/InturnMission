import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

// ════════════════════════════════════════════════════════════════
//  전체 KG 노드 & 엣지 (시각화 전용 — 백엔드 독립)
// ════════════════════════════════════════════════════════════════
const KG_NODES = [
  // 시설 도메인
  { id:'hospital',   label:'동물병원',        icon:'🏥', color:'#0d9488', domain:'시설',     r:32 },
  { id:'pharmacy',   label:'동물약국',        icon:'💊', color:'#0284c7', domain:'시설',     r:26 },
  { id:'grooming',   label:'동물미용업',      icon:'✂️', color:'#7c3aed', domain:'시설',     r:24 },
  { id:'boarding',   label:'위탁관리업',      icon:'🏨', color:'#d97706', domain:'시설',     r:24 },
  { id:'cremation',  label:'동물장묘업',      icon:'🌿', color:'#94a3b8', domain:'시설',     r:22 },
  { id:'restarea',   label:'휴게소 시설',     icon:'🛑', color:'#16a34a', domain:'시설',     r:22 },
  { id:'friendly',   label:'동반가능 시설',   icon:'📍', color:'#2563eb', domain:'시설',     r:26 },
  // 동물 도메인
  { id:'registered', label:'등록동물',        icon:'🪪', color:'#e11d48', domain:'동물',     r:30 },
  { id:'rescue',     label:'구조동물',        icon:'🐾', color:'#ea580c', domain:'동물',     r:28 },
  { id:'lost',       label:'분실동물',        icon:'❓', color:'#f43f5e', domain:'동물',     r:26 },
  // 보호 도메인
  { id:'shelter',    label:'동물보호센터',    icon:'🏠', color:'#7c3aed', domain:'보호',     r:30 },
  // 의료 도메인
  { id:'symptom',    label:'증상',            icon:'🧬', color:'#0891b2', domain:'의료',     r:26 },
  { id:'disease',    label:'질병',            icon:'🦠', color:'#6366f1', domain:'의료',     r:28 },
  { id:'pathogen',   label:'병원체',          icon:'🔬', color:'#dc2626', domain:'의료',     r:22 },
  // 여행 도메인
  { id:'tour',       label:'반려동물 여행',   icon:'🗺️', color:'#d97706', domain:'여행',     r:28 },
  // 공통
  { id:'region',     label:'행정구역',        icon:'📌', color:'#64748b', domain:'공통',     r:28 },
  { id:'owner',      label:'반려인(보호자)',  icon:'👤', color:'#059669', domain:'공통',     r:24 },
  { id:'species',    label:'동물 종(種)',     icon:'🐕', color:'#92400e', domain:'공통',     r:24 },
]

const KG_EDGES = [
  // 시설 ↔ 지역
  { s:'hospital',  t:'region',     p:'ex:locatedIn',           w:2 },
  { s:'pharmacy',  t:'region',     p:'ex:locatedIn',           w:1.5 },
  { s:'grooming',  t:'region',     p:'ex:locatedIn',           w:1.5 },
  { s:'boarding',  t:'region',     p:'ex:locatedIn',           w:1.5 },
  { s:'cremation', t:'region',     p:'ex:locatedIn',           w:1 },
  { s:'shelter',   t:'region',     p:'ex:locatedIn',           w:2 },
  { s:'friendly',  t:'region',     p:'ex:locatedIn',           w:1.5 },
  { s:'restarea',  t:'region',     p:'ex:locatedIn',           w:1 },
  { s:'tour',      t:'region',     p:'ex:locatedIn',           w:1.5 },
  // 동물 등록 체계
  { s:'registered',t:'owner',      p:'schema:owns',            w:2.5 },
  { s:'registered',t:'species',    p:'ex:hasSpecies',          w:2 },
  { s:'lost',      t:'registered', p:'owl:sameAs',             w:3 },
  { s:'rescue',    t:'registered', p:'owl:sameAs',             w:3 },
  { s:'lost',      t:'owner',      p:'ex:reportedBy',          w:2 },
  // 보호 관계
  { s:'shelter',   t:'rescue',     p:'schema:containedInPlace',w:2.5 },
  { s:'rescue',    t:'shelter',    p:'ex:protectedBy',         w:2 },
  { s:'rescue',    t:'species',    p:'ex:hasSpecies',          w:1.5 },
  // 의료 관계
  { s:'rescue',    t:'symptom',    p:'ex:hasSymptom',          w:2 },
  { s:'symptom',   t:'disease',    p:'ex:indicatesDisease',    w:2.5 },
  { s:'disease',   t:'pathogen',   p:'ex:causedBy',            w:2 },
  { s:'disease',   t:'species',    p:'ex:infectsAnimal',       w:2 },
  // 병원 ↔ 의료
  { s:'hospital',  t:'disease',    p:'ex:treats',              w:2 },
  { s:'hospital',  t:'species',    p:'ex:specializedIn',       w:1.5 },
  // 근접 관계
  { s:'hospital',  t:'friendly',   p:'ex:nearBy',              w:1.5 },
  { s:'shelter',   t:'hospital',   p:'ex:nearestHospital',     w:2 },
  { s:'tour',      t:'hospital',   p:'ex:nearBy',              w:1.5 },
  { s:'restarea',  t:'tour',       p:'ex:onRoute',             w:1 },
  // 보호자
  { s:'owner',     t:'registered', p:'ex:registers',           w:2 },
  { s:'owner',     t:'rescue',     p:'ex:adopts',              w:1.5 },
  // 여행
  { s:'tour',      t:'friendly',   p:'ex:includes',            w:1.5 },
  // 인수공통
  { s:'disease',   t:'owner',      p:'ex:zoonoticRiskTo',      w:1.5 },
]

const DOMAIN_COLOR = {
  '시설': '#0d9488', '동물': '#e11d48', '보호': '#7c3aed',
  '의료': '#6366f1', '여행': '#d97706', '공통': '#64748b',
}

// ════════════════════════════════════════════════════════════════
//  D3 그래프 캔버스 (줌/패닝, 툴팁, 노드 크기 가변)
// ════════════════════════════════════════════════════════════════
function GraphCanvas({ highlight }) {
  const ref = useRef(null)
  const simRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const W = el.clientWidth || 900, H = 640

    d3.select(el).selectAll('*').remove()

    const svg = d3.select(el).append('svg')
      .attr('width', W).attr('height', H)
      .style('background', 'var(--bg)')

    // zoom
    const g = svg.append('g')
    svg.call(
      d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform))
    )

    // arrow markers per color
    const defs = svg.append('defs')
    const domains = [...new Set(KG_NODES.map(n => n.domain))]
    domains.forEach(d => {
      const col = DOMAIN_COLOR[d] || '#94a3b8'
      defs.append('marker')
        .attr('id', `arrow-${d}`)
        .attr('viewBox', '0 -5 10 10').attr('refX', 28).attr('refY', 0)
        .attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', col).attr('opacity', 0.5)
    })

    const simNodes = KG_NODES.map(d => ({ ...d }))
    const byId = Object.fromEntries(simNodes.map(d => [d.id, d]))
    const simLinks = KG_EDGES
      .map(e => ({ ...e, source: byId[e.s], target: byId[e.t] }))
      .filter(e => e.source && e.target)

    // simulation
    const sim = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink(simLinks).distance(d => 110 + (d.source.r || 24) + (d.target.r || 24)).strength(0.45))
      .force('charge', d3.forceManyBody().strength(-420))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(d => (d.r || 24) + 14))
      .force('x', d3.forceX(W / 2).strength(0.04))
      .force('y', d3.forceY(H / 2).strength(0.04))
    simRef.current = sim

    // edges
    const link = g.append('g').selectAll('g').data(simLinks).join('g')

    const linkLine = link.append('line')
      .attr('stroke', d => DOMAIN_COLOR[d.source.domain] || '#cbd5e1')
      .attr('stroke-width', d => d.w || 1.5)
      .attr('stroke-opacity', 0.35)
      .attr('marker-end', d => `url(#arrow-${d.source.domain})`)

    const linkLabel = link.append('text')
      .attr('font-size', '8px')
      .attr('fill', '#94a3b8')
      .attr('text-anchor', 'middle')
      .style('font-family', "'JetBrains Mono',monospace")
      .style('pointer-events', 'none')
      .text(d => d.p.replace('ex:', '').replace('schema:', '').replace('owl:', ''))

    // nodes
    const node = g.append('g').selectAll('g').data(simNodes).join('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y })
        .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )

    // glow filter
    const filter = defs.append('filter').attr('id', 'glow')
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // outer ring
    node.append('circle')
      .attr('r', d => (d.r || 24) + 5)
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.2)

    // main circle
    node.append('circle')
      .attr('r', d => d.r || 24)
      .attr('fill', d => d.color + '1a')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)

    node.append('text')
      .attr('y', -3)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => `${Math.round((d.r || 24) * 0.65)}px`)
      .style('pointer-events', 'none')
      .text(d => d.icon)

    node.append('text')
      .attr('y', d => (d.r || 24) + 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9.5px')
      .attr('fill', 'var(--text2)')
      .attr('font-weight', '700')
      .style('font-family', "'Noto Sans KR',sans-serif")
      .style('pointer-events', 'none')
      .text(d => d.label)

    // domain badge
    node.append('text')
      .attr('y', d => -(d.r || 24) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '7.5px')
      .attr('fill', d => d.color)
      .attr('font-weight', '700')
      .style('font-family', "'JetBrains Mono',monospace")
      .style('pointer-events', 'none')
      .text(d => d.domain)

    // hover interaction
    node.on('mouseover', function(e, d) {
      d3.select(this).select('circle:nth-child(2)')
        .attr('fill', d.color + '40')
        .attr('stroke-width', 3)
        .attr('filter', 'url(#glow)')

      // highlight connected edges
      linkLine
        .attr('stroke-opacity', l =>
          l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.08)
        .attr('stroke-width', l =>
          l.source.id === d.id || l.target.id === d.id ? (l.w || 1.5) + 1 : l.w || 1.5)

      linkLabel
        .attr('fill', l =>
          l.source.id === d.id || l.target.id === d.id ? DOMAIN_COLOR[l.source.domain] : 'transparent')
    })
    .on('mouseout', function(e, d) {
      d3.select(this).select('circle:nth-child(2)')
        .attr('fill', d.color + '1a')
        .attr('stroke-width', 2)
        .attr('filter', null)
      linkLine.attr('stroke-opacity', 0.35).attr('stroke-width', d => d.w || 1.5)
      linkLabel.attr('fill', '#94a3b8')
    })

    sim.on('tick', () => {
      linkLine
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      linkLabel
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2 - 4)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => sim.stop()
  }, [])

  return (
    <div ref={ref} style={{ width: '100%', height: 640, borderRadius: 12, overflow: 'hidden' }} />
  )
}

// ════════════════════════════════════════════════════════════════
//  탭 데이터
// ════════════════════════════════════════════════════════════════
const CLASSES = [
  { domain:'시설',    color:'#0d9488', icon:'🏥', cls:'ex:AnimalHospital',    uri:'ex:facility/hospital/{MNG_NO}',    label:'동물병원',
    superClass:'schema:LocalBusiness',
    props:['schema:name','schema:telephone','schema:streetAddress','geo:lat','geo:long','schema:additionalProperty','dcterms:created'],
    constraints:['SALS_STTS_CD=01 (영업중만)','좌표계 EPSG:5174 → WGS84 변환 필수'] },
  { domain:'시설',    color:'#0284c7', icon:'💊', cls:'ex:AnimalPharmacy',     uri:'ex:facility/pharmacy/{MNG_NO}',    label:'동물약국',
    superClass:'schema:Pharmacy',
    props:['schema:name','schema:telephone','schema:streetAddress','geo:lat','geo:long'],
    constraints:['SALS_STTS_CD=01','좌표계 EPSG:5174 → WGS84'] },
  { domain:'시설',    color:'#7c3aed', icon:'✂️', cls:'ex:PetGrooming',        uri:'ex:facility/grooming/{MNG_NO}',    label:'동물미용업',
    superClass:'schema:HealthAndBeautyBusiness',
    props:['schema:name','schema:streetAddress','schema:floorSize','schema:serviceType'],
    constraints:['주소 비식별 처리 주의'] },
  { domain:'시설',    color:'#d97706', icon:'🏨', cls:'ex:PetBoarding',        uri:'ex:facility/boarding/{MNG_NO}',    label:'동물위탁관리업',
    superClass:'schema:LodgingBusiness',
    props:['schema:name','schema:serviceType','schema:streetAddress','schema:floorSize'],
    constraints:['DTL_TASK_SE_NM으로 SubClass 분기','LCTN_AREA로 대형견 수용 추론'] },
  { domain:'시설',    color:'#94a3b8', icon:'🌿', cls:'ex:PetCremation',       uri:'ex:facility/cremation/{MNG_NO}',   label:'동물장묘업',
    superClass:'schema:FuneralService',
    props:['schema:name','schema:streetAddress','geo:lat','geo:long'],
    constraints:['희소 데이터 — 지역 접근성 분석 중심'] },
  { domain:'시설',    color:'#16a34a', icon:'🛑', cls:'ex:RestAreaPlayground', uri:'ex:facility/restarea/{slug}',      label:'휴게소 편의시설',
    superClass:'schema:CivicStructure',
    props:['schema:name','schema:amenityFeature','schema:openingHours','dcterms:created'],
    constraints:['좌표 없음 → 카카오 Geocoding API 보완 필요'] },
  { domain:'시설',    color:'#2563eb', icon:'📍', cls:'ex:PetFriendlyPlace',   uri:'ex:facility/friendly/{id}',        label:'반려동물 동반가능 시설',
    superClass:'schema:TouristAttraction',
    props:['schema:name','schema:additionalType','geo:lat','geo:long','schema:telephone'],
    constraints:['한국문화정보원 7만건 — 배치 업로드 전략'] },
  { domain:'동물',    color:'#e11d48', icon:'🪪', cls:'ex:RegisteredAnimal',   uri:'ex:animal/registered/{dogRegNo}',  label:'등록동물',
    superClass:'schema:Animal',
    props:['schema:identifier','schema:name','skos:Concept','schema:gender','schema:birthDate'],
    constraints:['dogRegNo + rfidCd 이중 식별자 관리'] },
  { domain:'동물',    color:'#ea580c', icon:'🐾', cls:'ex:AbandonedAnimal',    uri:'ex:animal/rescue/{desertionNo}',   label:'구조동물',
    superClass:'ex:RegisteredAnimal',
    props:['schema:identifier','schema:location','schema:additionalProperty','schema:image','schema:dateCreated'],
    constraints:['owl:sameAs로 등록동물·분실동물과 연결','코드 마스터 테이블 선행 구축'] },
  { domain:'동물',    color:'#f43f5e', icon:'❓', cls:'ex:LostAnimal',          uri:'ex:animal/lost/{rfidCd}',          label:'분실동물',
    superClass:'ex:RegisteredAnimal',
    props:['schema:identifier','schema:location','schema:dateCreated','schema:telephone'],
    constraints:['rfidCd로 구조동물과 owl:sameAs 연결'] },
  { domain:'보호',    color:'#7c3aed', icon:'🏠', cls:'ex:AnimalShelter',      uri:'ex:facility/shelter/{careRegNo}',  label:'동물보호센터',
    superClass:'schema:Organization',
    props:['schema:name','geo:lat','geo:long','schema:numberOfEmployees','schema:amenityFeature'],
    constraints:['careRegNo로 구조동물 API JOIN 핵심'] },
  { domain:'의료',    color:'#0891b2', icon:'🧬', cls:'ex:Symptom',            uri:'ex:medical/symptom/{code}',        label:'증상',
    superClass:'skos:Concept',
    props:['skos:prefLabel','skos:altLabel','skos:broader','skos:notation','skos:inScheme'],
    constraints:['KISTI 증상 분류 체계 — SNOMED-CT Vet 연계 가능'] },
  { domain:'의료',    color:'#6366f1', icon:'🦠', cls:'ex:Disease',             uri:'ex:medical/disease/{DISS_NO}',    label:'질병',
    superClass:'skos:Concept',
    props:['skos:prefLabel','skos:altLabel','skos:Concept','schema:additionalProperty'],
    constraints:['CAUSE_CMMN_CL → Pathogen 노드로 분기'] },
  { domain:'의료',    color:'#dc2626', icon:'🔬', cls:'ex:Pathogen',            uri:'ex:medical/pathogen/{id}',         label:'병원체',
    superClass:'skos:Concept',
    props:['skos:prefLabel','ex:pathogenType'],
    constraints:['바이러스/세균/기생충/곰팡이 분류'] },
  { domain:'여행',    color:'#d97706', icon:'🗺️', cls:'ex:PetTourSpot',        uri:'ex:tour/content/{contentId}',      label:'반려동물 여행지',
    superClass:'schema:TouristAttraction',
    props:['schema:name','schema:amenityFeature','geo:lat','geo:long','schema:additionalProperty','schema:telephone'],
    constraints:['2단계 수집 — 목록→contentId→상세','WGS84 직접 사용 가능'] },
  { domain:'공통',    color:'#64748b', icon:'📌', cls:'ex:AdministrativeRegion',uri:'ex:region/{sido}/{sigungu}',       label:'행정구역',
    superClass:'schema:AdministrativeArea',
    props:['schema:name','schema:containsPlace'],
    constraints:['모든 시설·동물·여행지의 상위 공간 노드'] },
  { domain:'공통',    color:'#059669', icon:'👤', cls:'ex:PetOwner',            uri:'ex:owner/{id}',                    label:'반려인',
    superClass:'foaf:Person',
    props:['foaf:name','schema:telephone','ex:owns'],
    constraints:['개인정보 비식별 처리 — 집계 단위로만 활용'] },
  { domain:'공통',    color:'#92400e', icon:'🐕', cls:'ex:AnimalSpecies',       uri:'ex:species/{upKindCd}',            label:'동물 종(種)',
    superClass:'skos:Concept',
    props:['skos:prefLabel','skos:altLabel','ex:upKindCd'],
    constraints:['개/고양이/기타 3단계 분류 → 세분화 가능'] },
]

const RELATIONS = [
  // 공간
  { subj:'ex:AnimalHospital',     pred:'ex:locatedIn',             obj:'ex:AdministrativeRegion', type:'공간',   desc:'병원의 행정구역 포함 관계' },
  { subj:'ex:AnimalHospital',     pred:'ex:nearBy',                obj:'ex:AnimalHospital',       type:'공간',   desc:'반경 1km 내 인접 병원' },
  { subj:'ex:AnimalShelter',      pred:'ex:nearestHospital',       obj:'ex:AnimalHospital',       type:'공간',   desc:'보호센터 → 인근 응급 병원' },
  { subj:'ex:PetTourSpot',        pred:'ex:nearBy',                obj:'ex:AnimalHospital',       type:'공간',   desc:'여행지 인근 병원 (안전 점수)' },
  // 동물 개체 연결
  { subj:'ex:LostAnimal',         pred:'owl:sameAs',               obj:'ex:RegisteredAnimal',     type:'개체',   desc:'RFID로 분실↔등록 동일 개체' },
  { subj:'ex:AbandonedAnimal',    pred:'owl:sameAs',               obj:'ex:RegisteredAnimal',     type:'개체',   desc:'RFID로 구조↔등록 동일 개체' },
  { subj:'ex:AbandonedAnimal',    pred:'owl:sameAs',               obj:'ex:LostAnimal',           type:'개체',   desc:'분실→구조 개체 매핑' },
  { subj:'ex:RegisteredAnimal',   pred:'ex:hasSpecies',            obj:'ex:AnimalSpecies',        type:'개체',   desc:'등록 동물의 축종/품종' },
  // 보호
  { subj:'ex:AnimalShelter',      pred:'schema:containedInPlace',  obj:'ex:AbandonedAnimal',      type:'보호',   desc:'보호센터가 구조동물을 보호' },
  { subj:'ex:PetOwner',           pred:'ex:adopts',                obj:'ex:AbandonedAnimal',      type:'보호',   desc:'보호자의 입양 관계' },
  { subj:'ex:PetOwner',           pred:'ex:registers',             obj:'ex:RegisteredAnimal',     type:'보호',   desc:'보호자의 반려동물 등록' },
  // 의료
  { subj:'ex:AbandonedAnimal',    pred:'ex:hasSymptom',            obj:'ex:Symptom',              type:'의료',   desc:'구조동물 증상 연결' },
  { subj:'ex:Symptom',            pred:'ex:indicatesDisease',      obj:'ex:Disease',              type:'의료',   desc:'증상 → 질병 추론 (핵심)' },
  { subj:'ex:Disease',            pred:'ex:causedBy',              obj:'ex:Pathogen',             type:'의료',   desc:'질병의 원인 병원체' },
  { subj:'ex:Disease',            pred:'ex:infectsAnimal',         obj:'ex:AnimalSpecies',        type:'의료',   desc:'감염 동물 종' },
  { subj:'ex:AnimalHospital',     pred:'ex:treats',                obj:'ex:Disease',              type:'의료',   desc:'병원의 진료 질병 범위' },
  { subj:'ex:Disease',            pred:'ex:zoonoticRiskTo',        obj:'ex:PetOwner',             type:'의료',   desc:'인수공통전염병 → 보호자 경보' },
  // 여행
  { subj:'ex:PetTourSpot',        pred:'ex:includes',              obj:'ex:PetFriendlyPlace',     type:'여행',   desc:'여행지 내 동반가능 시설' },
  { subj:'ex:RestAreaPlayground', pred:'ex:onRoute',               obj:'ex:PetTourSpot',          type:'여행',   desc:'이동 경로 휴게소 거점' },
]

const TRIPLES = [
  { title:'동물병원 — 좌표 + 행정구역 연결', turtle:
`@prefix ex:     <http://example.org/> .
@prefix schema: <https://schema.org/> .
@prefix geo:    <http://www.w3.org/2003/01/geo/wgs84_pos#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .

ex:facility/hospital/366000001020260001
    a schema:LocalBusiness, ex:AnimalHospital ;
    schema:name          "늘푸른동물병원" ;
    schema:telephone     "042-731-5850" ;
    schema:streetAddress "대전광역시 서구 계룡로550" ;
    geo:lat  "36.3178"^^xsd:float ;
    geo:long "127.3941"^^xsd:float ;
    schema:additionalProperty "영업" ;
    ex:locatedIn ex:region/대전광역시/서구 .` },
  { title:'질병-증상-병원체 3단 연결', turtle:
`@prefix ex:   <http://example.org/> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .

ex:medical/disease/1
    a ex:Disease ;
    skos:prefLabel "개디스템퍼"@ko ;
    skos:altLabel  "Canine Distemper"@en ;
    ex:infectsAnimal ex:species/DOG ;
    ex:causedBy ex:medical/pathogen/paramyxovirus .

ex:medical/symptom/DH10.56
    a ex:Symptom ;
    skos:prefLabel "바이러스성 결막염"@ko ;
    skos:broader   ex:medical/symptomCat/안과질환 ;
    ex:indicatesDisease ex:medical/disease/1 .

ex:medical/pathogen/paramyxovirus
    a ex:Pathogen ;
    skos:prefLabel "파라믹소바이러스"@ko ;
    ex:pathogenType "바이러스" .` },
  { title:'구조동물 → 등록동물 owl:sameAs 연결', turtle:
`@prefix ex:     <http://example.org/> .
@prefix schema: <https://schema.org/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .

ex:animal/rescue/202404001234
    a ex:AbandonedAnimal ;
    schema:identifier "202404001234" ;
    schema:location   "서울시 마포구 망원동" ;
    ex:processState   "보호중" ;
    ex:hasSpecies     ex:species/믹스견 ;
    schema:containedInPlace ex:facility/shelter/411310201900001 ;
    owl:sameAs ex:animal/registered/410123456789012 ;
    owl:sameAs ex:animal/lost/202403005678 .` },
  { title:'인수공통전염병 — 보호자 경보 트리플', turtle:
`@prefix ex:   <http://example.org/> .
@prefix schema: <https://schema.org/> .

# 광견병: 사람에게도 감염 가능
ex:medical/disease/rabies
    a ex:Disease ;
    ex:infectsAnimal ex:species/DOG, ex:species/CAT ;
    ex:zoonoticRiskTo ex:owner/ALL ;
    ex:causedBy ex:medical/pathogen/rabiesVirus .

# 해당 동물이 보호 중인 센터의 모든 보호자에게 경보 전파 가능
ex:facility/shelter/411310201900001
    ex:hasZoonoticAlert ex:medical/disease/rabies .` },
]

const INFERENCE = [
  { icon:'🩺', title:'증상 → 전문 병원 추천',     desc:'ex:Symptom → ex:indicatesDisease → ex:Disease → ex:AnimalHospital[treats] + geo:nearBy 결합. 증상 입력 시 반경 5km 전문 병원 순위 반환.' },
  { icon:'🏠', title:'입양 적합 보호자 매칭',      desc:'ex:AbandonedAnimal의 ex:hasSpecies + 분실 지역 geo 좌표와 ex:PetOwner의 선호 종·거주 지역을 SPARQL로 매칭하여 입양 후보 추천.' },
  { icon:'🗺️', title:'반려동물 여행 안전 점수',   desc:'이동 경로상 ex:PetTourSpot마다 ex:nearBy → ex:AnimalHospital 접근성 계산. 응급 병원 없는 구간 경고 표시.' },
  { icon:'⚠️', title:'인수공통전염병 경보 전파',  desc:'ex:Disease[zoonoticRiskTo] 감지 시 해당 보호센터의 모든 보호자(ex:PetOwner)에게 체인 경보. SPARQL CONSTRUCT로 자동 전파.' },
  { icon:'📊', title:'지역 의료 인프라 분석',      desc:'ex:AdministrativeRegion 기준으로 병원·약국 밀도와 구조동물 수를 집계. 취약 지역 식별 후 보호센터 신설 제안.' },
  { icon:'🔗', title:'중복 시설 엔티티 해상도',    desc:'ex:PetFriendlyPlace와 ex:PetTourSpot 간 schema:name + geo 거리 10m 이내 시 owl:sameAs로 병합. 7만건 대규모 De-duplication.' },
]

const NAMESPACES = [
  { prefix:'ex:',      uri:'http://example.org/',                       usage:'프로젝트 전용 엔티티 URI' },
  { prefix:'schema:',  uri:'https://schema.org/',                       usage:'시설·동물·연락처·좌표 표준 속성' },
  { prefix:'skos:',    uri:'http://www.w3.org/2004/02/skos/core#',      usage:'증상·질병·종 분류 계층 (broader/narrower)' },
  { prefix:'owl:',     uri:'http://www.w3.org/2002/07/owl#',            usage:'sameAs — RFID 기반 개체 동일성' },
  { prefix:'dcterms:', uri:'http://purl.org/dc/terms/',                 usage:'날짜·출처·발행기관 메타데이터' },
  { prefix:'foaf:',    uri:'http://xmlns.com/foaf/0.1/',                usage:'보호자(PetOwner) 인적 정보' },
  { prefix:'geo:',     uri:'http://www.w3.org/2003/01/geo/wgs84_pos#', usage:'WGS84 위경도 (lat, long)' },
  { prefix:'vcard:',   uri:'http://www.w3.org/2006/vcard/ns#',         usage:'주소·전화번호 구조화' },
  { prefix:'xsd:',     uri:'http://www.w3.org/2001/XMLSchema#',        usage:'데이터 타입 (float, date, string)' },
  { prefix:'koah:',    uri:'http://example.org/ontology/animalHospital#', usage:'동물병원 도메인 온톨로지 확장' },
  { prefix:'koad:',    uri:'http://example.org/ontology/animalDisease#',  usage:'동물질병 도메인 온톨로지 확장' },
]

const TABS = ['시각화 그래프', '클래스 구조', '관계(Relation)', '트리플 패턴', '추론 시나리오', '네임스페이스']

function SectionLabel({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
      <span style={{ fontSize:9.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace", whiteSpace:'nowrap' }}>{label}</span>
      <div style={{ flex:1, height:1, background:'var(--border)' }} />
    </div>
  )
}

export default function KnowledgeGraph() {
  const [tab, setTab] = useState(0)
  const [filterDomain, setFilterDomain] = useState('전체')
  const [filterRelType, setFilterRelType] = useState('전체')

  const domains = [...new Set(CLASSES.map(c => c.domain))]
  const relTypes = [...new Set(RELATIONS.map(r => r.type))]

  const filteredClasses = filterDomain === '전체' ? CLASSES : CLASSES.filter(c => c.domain === filterDomain)
  const filteredRelations = filterRelType === '전체' ? RELATIONS : RELATIONS.filter(r => r.type === filterRelType)

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:17, fontWeight:900, marginBottom:4 }}>🕸️ 지식그래프 스키마</h1>
        <p style={{ fontSize:12, color:'var(--muted)' }}>
          18개 클래스 · 19개 관계 · 6개 추론 시나리오 · 11개 네임스페이스
        </p>
      </div>

      {/* 탭 바 */}
      <div style={{ display:'flex', gap:5, marginBottom:20, flexWrap:'wrap' }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            padding:'7px 15px', borderRadius:8, fontSize:12.5, cursor:'pointer', transition:'all .15s',
            fontWeight: tab===i ? 700 : 500,
            background: tab===i ? 'var(--teal-lt)' : 'var(--bg2)',
            color: tab===i ? 'var(--teal)' : 'var(--muted)',
            border: `1px solid ${tab===i ? '#b2f5ea' : 'var(--border)'}`,
          }}>{t}</button>
        ))}
      </div>

      {/* ── Tab 0: 시각화 ── */}
      {tab === 0 && (
        <div>
          <div style={{ borderRadius:14, overflow:'hidden', background:'var(--bg2)', border:'1px solid var(--border)' }}>
            <div style={{ padding:'12px 18px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--muted)' }}>
                ● 전체 연결맵 — 18 클래스 · 33 관계 · 드래그+줌 가능
              </span>
              <div style={{ display:'flex', gap:8 }}>
                {Object.entries(DOMAIN_COLOR).map(([d,c]) => (
                  <div key={d} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:c }} />
                    <span style={{ color:'var(--muted)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
            <GraphCanvas />
          </div>
          <div style={{ marginTop:12, fontSize:11, color:'var(--muted)', textAlign:'center' }}>
            노드 위에 마우스를 올리면 연결된 관계만 강조됩니다 · 스크롤로 줌 · 빈 공간 드래그로 이동
          </div>
        </div>
      )}

      {/* ── Tab 1: 클래스 구조 ── */}
      {tab === 1 && (
        <div>
          <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
            {['전체', ...domains].map(d => (
              <button key={d} onClick={() => setFilterDomain(d)} style={{
                padding:'5px 12px', borderRadius:7, fontSize:11.5, cursor:'pointer',
                fontWeight: filterDomain===d ? 700 : 500,
                background: filterDomain===d ? (DOMAIN_COLOR[d]||'var(--teal)') + '18' : 'var(--bg2)',
                color: filterDomain===d ? (DOMAIN_COLOR[d]||'var(--teal)') : 'var(--muted)',
                border: `1px solid ${filterDomain===d ? (DOMAIN_COLOR[d]||'var(--teal)')+'55' : 'var(--border)'}`,
              }}>{d} {d !== '전체' && `(${CLASSES.filter(c=>c.domain===d).length})`}</button>
            ))}
          </div>
          <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))' }}>
            {filteredClasses.map((c, i) => (
              <div key={i} style={{ borderRadius:12, padding:'16px', background:'var(--bg2)', border:`1px solid ${c.color}33`, borderLeft:`4px solid ${c.color}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <span style={{ fontSize:20 }}>{c.icon}</span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:c.color }}>{c.cls}</div>
                    <div style={{ fontSize:10, color:'var(--muted)', marginTop:1 }}>↑ {c.superClass}</div>
                  </div>
                </div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'var(--yellow)', background:'var(--bg3)', borderRadius:5, padding:'4px 8px', marginBottom:10 }}>{c.uri}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                  {c.props.map(p => (
                    <span key={p} style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", padding:'2px 6px', borderRadius:4, background:c.color+'12', color:c.color, border:`1px solid ${c.color}33` }}>{p}</span>
                  ))}
                </div>
                {c.constraints.map((ct, j) => (
                  <div key={j} style={{ fontSize:10.5, color:'var(--orange)', display:'flex', gap:5, marginTop:4 }}>
                    <span style={{ flexShrink:0 }}>⚠</span><span>{ct}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 2: 관계 ── */}
      {tab === 2 && (
        <div>
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
            {['전체', ...relTypes].map(t => (
              <button key={t} onClick={() => setFilterRelType(t)} style={{
                padding:'5px 12px', borderRadius:7, fontSize:11.5, cursor:'pointer',
                fontWeight: filterRelType===t ? 700 : 500,
                background: filterRelType===t ? 'var(--teal-lt)' : 'var(--bg2)',
                color: filterRelType===t ? 'var(--teal)' : 'var(--muted)',
                border: `1px solid ${filterRelType===t ? '#b2f5ea' : 'var(--border)'}`,
              }}>{t} {t !== '전체' && `(${RELATIONS.filter(r=>r.type===t).length})`}</button>
            ))}
          </div>
          <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid var(--border)' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'var(--bg3)' }}>
                  {['유형','주어 (Subject)','Predicate','목적어 (Object)','의미'].map(h => (
                    <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10, fontWeight:700, textTransform:'uppercase', color:'var(--muted)', borderBottom:'1px solid var(--border)', letterSpacing:'0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRelations.map((r, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding:'8px 14px' }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:5, background:'var(--bg3)', color:'var(--muted)', border:'1px solid var(--border)', whiteSpace:'nowrap' }}>{r.type}</span>
                    </td>
                    <td style={{ padding:'8px 14px', fontFamily:"'JetBrains Mono',monospace", color:'var(--teal)', fontSize:11 }}>{r.subj}</td>
                    <td style={{ padding:'8px 14px', fontFamily:"'JetBrains Mono',monospace", color:'#7c3aed', fontWeight:700, fontSize:11 }}>{r.pred}</td>
                    <td style={{ padding:'8px 14px', fontFamily:"'JetBrains Mono',monospace", color:'var(--blue)', fontSize:11 }}>{r.obj}</td>
                    <td style={{ padding:'8px 14px', color:'var(--text2)', fontSize:12 }}>{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: 트리플 패턴 ── */}
      {tab === 3 && (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          {TRIPLES.map((t, i) => (
            <div key={i} style={{ borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', background:'var(--bg2)' }}>
              <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', fontSize:12, fontWeight:700, color:'var(--text2)', background:'var(--bg3)' }}>{t.title}</div>
              <pre style={{ padding:'16px', fontFamily:"'JetBrains Mono',monospace", fontSize:11.5, lineHeight:1.85, color:'var(--text)', overflowX:'auto', margin:0, background:'#fafcff' }}>{t.turtle}</pre>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 4: 추론 시나리오 ── */}
      {tab === 4 && (
        <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))' }}>
          {INFERENCE.map((s, i) => (
            <div key={i} style={{ borderRadius:12, padding:'20px', background:'var(--bg2)', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontSize:14, fontWeight:800, marginBottom:8 }}>{s.title}</div>
              <div style={{ fontSize:12.5, color:'var(--text2)', lineHeight:1.8 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 5: 네임스페이스 ── */}
      {tab === 5 && (
        <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid var(--border)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ background:'var(--bg3)' }}>
                {['Prefix','URI','용도'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:700, textTransform:'uppercase', color:'var(--muted)', borderBottom:'1px solid var(--border)', letterSpacing:'0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NAMESPACES.map((n, i) => (
                <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding:'8px 14px', fontFamily:"'JetBrains Mono',monospace", color:'var(--teal)', fontWeight:700, fontSize:12 }}>{n.prefix}</td>
                  <td style={{ padding:'8px 14px', fontFamily:"'JetBrains Mono',monospace", color:'var(--muted)', fontSize:11 }}>{n.uri}</td>
                  <td style={{ padding:'8px 14px', color:'var(--text2)' }}>{n.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
