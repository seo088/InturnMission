import { useMemo, useState } from 'react'
import { useWalkRecommendation } from '../hooks'
import '../styles/pet-care.css'
import '../styles/pet-care-overrides.css'

const REGIONS = [{ label: '군산시', station: '군산', nx: 56, ny: 92 }]

const DEMO_ENVIRONMENT = {
  weather: { TMP: '18', POP: '0', sky: '맑음' },
  air: { pm10Value: '35', stationName: '군산 측정소' },
  score: 78,
  title: '가벼운 산책을 준비해보세요.',
  message: '바람이 약하고 공기가 무난한 본선 시연용 예시 상태입니다.',
}

const DEMO_FACILITIES = [
  { type: '동반 가능 확인 시설', kind: 'confirmed', name: '군산(서울) 휴게소 반려동물 놀이터', area: '군산시 성산면 · 휴게소 입구에서 200m', distance: '군산 예시', tags: ['24시간', '연중무휴', '반려동물 놀이터'], icon: '♙', position: ['62%', '58%'], companionNote: '반려동물 놀이터 정보가 확인된 시설입니다. 이용 전 운영 상태를 확인해 주세요.' },
  { type: '산책 참고 장소', kind: 'reference', name: '경암동 철길마을', area: '군산시 경촌4길 14', distance: '군산 예시', tags: ['관광 참고', '도심 산책'], icon: '⌂', position: ['28%', '28%'], companionNote: '관광 장소 정보이며 반려동물 동반 가능 여부는 방문 전 확인이 필요합니다.' },
  { type: '산책 참고 장소', kind: 'reference', name: '군산 영화의 거리', area: '군산시 구영6길 60', distance: '군산 예시', tags: ['관광 참고', '도심 산책'], icon: '◇', position: ['45%', '38%'], companionNote: '관광 장소 정보이며 반려동물 동반 가능 여부는 방문 전 확인이 필요합니다.' },
  { type: '산책 참고 장소', kind: 'reference', name: '금강습지생태공원', area: '군산시 성산면 성덕리', distance: '군산 예시', tags: ['관광 참고', '야외 공간'], icon: '♣', position: ['72%', '24%'], companionNote: '관광 장소 정보이며 반려동물 동반 가능 여부는 방문 전 확인이 필요합니다.' },
]

const MAP_FILTERS = ['전체', '동반 가능 확인 시설', '산책 참고 장소']

const value = (item, fallback = '-') => item === null || item === undefined || item === '' ? fallback : item

export default function PetCare() {
  const [region, setRegion] = useState(REGIONS[0])
  const [facilityFilter, setFacilityFilter] = useState('전체')
  const [selectedFacility, setSelectedFacility] = useState(DEMO_FACILITIES[0].name)
  const params = useMemo(() => ({ region: region.label, station: region.station }), [region])
  const { data: walk, isLoading, isFetching, isError, dataUpdatedAt, refetch } = useWalkRecommendation(params)
  const hasLiveEnvironment = Number.isFinite(Number(walk?.weather?.items?.TMP)) && Number.isFinite(Number(walk?.airQuality?.pm10Value)) && walk?.weather?.source !== 'sample' && walk?.airQuality?.source !== 'sample'
  const environmentMode = hasLiveEnvironment ? (isFetching ? 'refreshing' : 'live') : isLoading ? 'loading' : 'fallback'
  const environmentLabel = environmentMode === 'live' ? '실시간 정보' : environmentMode === 'refreshing' ? '마지막 확인값 · 갱신 중' : environmentMode === 'loading' ? '실시간 정보를 확인하고 있어요' : '본선 시연용 예시'
  const weather = hasLiveEnvironment ? walk.weather.items : DEMO_ENVIRONMENT.weather
  const air = hasLiveEnvironment ? walk.airQuality : DEMO_ENVIRONMENT.air
  const score = Number(hasLiveEnvironment ? walk.score : DEMO_ENVIRONMENT.score)
  const recommendation = hasLiveEnvironment ? walk.title : DEMO_ENVIRONMENT.title
  const message = hasLiveEnvironment ? walk.message : DEMO_ENVIRONMENT.message
  const direction = score >= 80 ? '가벼운 산책이 좋아요.' : score >= 55 ? '짧게 다녀오는 것을 추천해요.' : '실내 활동을 함께 추천해요.'
  const placeTypes = walk?.recommendedPlaceTypes?.length ? walk.recommendedPlaceTypes : ['산책하기 좋은 공원', '반려견 놀이터', '실내 동반 문화시설']
  const visibleFacilities = DEMO_FACILITIES.filter(item => facilityFilter === '전체' || item.type === facilityFilter)

  return <main className="pc-page"><div className="pc-shell">
    <section className="pc-hero"><div className="pc-hero-copy"><p className="pc-eyebrow">오늘의 반려생활</p><h1>오늘의 산책 전,<br />확인하세요.</h1><p>날씨와 공기질을 살펴보고, 우리 아이에게 무리 없는 외출 방향을 정해보세요.</p><label className="pc-region"><span>현재 참고 지역</span><select value={region.label} onChange={event => setRegion(REGIONS.find(item => item.label === event.target.value) || REGIONS[0])}>{REGIONS.map(item => <option key={item.label}>{item.label}</option>)}</select></label></div><div className="pc-art" aria-hidden="true"><span className="pc-sun" /><span className="pc-cloud" /><span className="pc-hill pc-hill-one" /><span className="pc-hill pc-hill-two" /><span className="pc-tree pc-tree-one" /><span className="pc-tree pc-tree-two" /><span className="pc-dog">🐶</span></div></section>

    <section className="pc-recommend"><div className="pc-score"><strong>{isLoading ? '–' : value(walk?.score)}</strong><span>오늘의 생활 지수</span></div><div><p className="pc-eyebrow">오늘의 생활 추천</p><h2>{direction}</h2><p>{recommendation} {message}</p><div className="pc-tags">{placeTypes.map(type => <span key={type}>{type}</span>)}</div></div><a className="pc-arrow" href="#places" aria-label="추천 장소 보기">↓</a></section>

    <div className={`pc-environment-status is-${environmentMode}`} role="status" aria-live="polite"><span>{environmentLabel}</span>{environmentMode === 'fallback' && <button type="button" onClick={() => refetch()}>다시 확인</button>}{hasLiveEnvironment && dataUpdatedAt && <small>갱신 {new Date(dataUpdatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</small>}</div><section className="pc-info" aria-label="오늘의 참고 정보"><article><span>날씨</span><strong>{value(weather.TMP)}°C</strong><p>{weather.sky || '맑음'} · 강수확률 {value(weather.POP)}%</p></article><article><span>미세먼지</span><strong>PM10 {value(air.pm10Value)}</strong><p>{air.stationName || region.station} 기준</p></article><article><span>추천 방향</span><strong>{score >= 80 ? '실외 중심' : score >= 55 ? '짧은 외출' : '실내 중심'}</strong><p>{hasLiveEnvironment ? '바람 약함 · 외출 전 상태를 확인해요.' : '바람 약함 · 본선 시연용 예시예요.'}</p></article></section>

    <section className="pc-map-section" id="places"><div className="pc-map-panel"><div className="pc-map-heading"><div><p className="pc-eyebrow">반려생활 장소 지도</p><h2>군산의 시설과 산책 참고 장소를<br />한눈에 살펴보세요.</h2></div><span>군산 · 본선 데모</span></div><div className="pc-map-filters" role="group" aria-label="시설 유형 필터">{MAP_FILTERS.map(filter => <button type="button" key={filter} className={facilityFilter === filter ? 'is-selected' : ''} onClick={() => { setFacilityFilter(filter); const first = DEMO_FACILITIES.find(item => filter === '전체' || item.type === filter); if (first) setSelectedFacility(first.name) }}>{filter}</button>)}</div><div className="pc-demo-map" aria-label="군산 반려생활 장소 지도">{visibleFacilities.map(facility => <button type="button" className={`pc-map-pin pc-map-pin--${facility.kind === 'confirmed' ? 'play' : 'culture'} ${selectedFacility === facility.name ? 'is-active' : ''}`} key={facility.name} style={{ left: facility.position[0], top: facility.position[1] }} onClick={() => setSelectedFacility(facility.name)} aria-label={`${facility.name} 선택`}><span>{facility.icon}</span></button>)}<span className="pc-map-location" aria-label="현재 위치" /><button className="pc-map-current" type="button" onClick={() => setSelectedFacility(DEMO_FACILITIES[0].name)}>◎ 내 위치</button><div className="pc-map-legend"><span><i className="play" />동반 가능 확인</span><span><i className="culture" />산책 참고</span></div></div></div><aside className="pc-top-facilities"><header><div><p className="pc-eyebrow">군산 장소 안내</p><h2>오늘 둘러볼 곳</h2></div><span>데모</span></header>{DEMO_FACILITIES.slice(0, 3).map((facility, index) => <button className={`pc-top-facility ${selectedFacility === facility.name ? 'is-selected' : ''}`} type="button" key={facility.name} onClick={() => setSelectedFacility(facility.name)}><div className={`pc-place-art pc-place-art-${index + 1}`} aria-hidden="true"><span>{facility.icon}</span></div><div><small>{facility.type}</small><strong>{facility.name}</strong><p>{facility.area}</p><em>{facility.tags[0]}</em></div><b aria-hidden="true">⌑</b></button>)}<button className="pc-find-more" type="button">지도에서 장소 보기 <span>›</span></button></aside><p className="pc-demo-note">{hasLiveEnvironment ? '날씨·대기 정보는 연결된 정보를 표시합니다.' : '실시간 정보를 불러오지 못해 본선 시연용 예시 날씨를 표시합니다.'} 동반 가능 확인 시설 외 장소는 방문 전 반려동물 동반 가능 여부를 확인해 주세요.</p></section>

    <details className="pc-details"><summary>오늘의 참고 정보 자세히 보기</summary><div><span>기온 <strong>{value(weather.TMP)}°C</strong></span><span>강수확률 <strong>{value(weather.POP)}%</strong></span><span>미세먼지 <strong>PM10 {value(air.pm10Value)}</strong></span><span>측정소 <strong>{air.stationName || region.station}</strong></span></div><p>날씨·대기질 기반의 생활 참고 정보이며, 외출 전 실제 기상 상황과 반려동물 상태를 함께 확인해 주세요.</p></details>
  </div></main>
}
