import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchNationalCosts } from '../api'
import { FALLBACK_NATIONAL_COSTS } from '../demo/costFallback'
import '../styles/costs.css'
import '../styles/costs-overrides.css'

const CATEGORIES = ['전체', '진료', '상담', '입원', '예방접종', '건강검진', '증상검진', '처방조제']
const REGIONS = ['전국 공개 조사']
const won = (value) => `${Number(value || 0).toLocaleString('ko-KR')}원`

function guideFor(item) {
  const name = item || ''
  if (name.includes('입원')) return '처치·약품·야간 관리 비용이 별도인지 물어보세요.'
  if (name.includes('백신') || name.includes('접종')) return '진찰료와 예방접종 비용이 함께 포함되는지 확인해보세요.'
  if (name.includes('검사')) return '검사 항목과 결과 확인 비용이 별도인지 물어보세요.'
  return '기본 진료비와 검사·처치 비용 포함 여부를 확인해보세요.'
}

export default function Costs() {
  const [category, setCategory] = useState('전체')
  const [region, setRegion] = useState('전국 공개 조사')
  const { data: liveRows = [], isLoading, refetch } = useQuery({
    queryKey: ['costs', 'national', category],
    queryFn: () => fetchNationalCosts(category === '전체' ? {} : { category }),
  })
  const rows = liveRows.length ? liveRows : FALLBACK_NATIONAL_COSTS.filter(row => category === '전체' || row.Category === category)
  const highlights = useMemo(() => rows.slice(0, 3), [rows])
  const source = rows[0]?.Source || '2025년 공개 조사 요약'

  return <main className="cost-page"><div className="cost-shell">
    <section className="cost-hero" aria-labelledby="cost-title">
      <p className="cost-eyebrow">진료비 참고</p>
      <h1 id="cost-title">우리 지역 진료비,<br />방문 전 참고해보세요.</h1>
      <p>공개 조사로 확인한 평균 범위입니다. 실제 진료비는 병원과 진료 상태에 따라 달라질 수 있어요.</p>
      <span className="cost-badge">{liveRows.length ? '공개 데이터 연결됨' : '2025년 공개 조사 요약을 보여드려요'}</span>
    </section>

    <section className="cost-controls" aria-label="진료비 조건 선택">
      <div><label htmlFor="cost-region">현재 참고 범위</label><select id="cost-region" value={region} onChange={event => setRegion(event.target.value)}>{REGIONS.map(item => <option key={item}>{item}</option>)}</select><small className="cost-control-note">지역별 비교는 데이터 연동 후 제공할 예정이에요.</small></div>
      <div className="cost-category"><span>궁금한 진료 항목</span><div>{CATEGORIES.map(item => <button type="button" key={item} className={category === item ? 'is-selected' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
    </section>

    <section className="cost-summary" aria-labelledby="cost-summary-title">
      <div><p className="cost-eyebrow">{region} · 공개 조사 기준</p><h2 id="cost-summary-title">방문 전에 참고할 수 있는 진료비예요.</h2><p>병원별 가격 비교나 최저가 정보가 아니며, 전화로 실제 비용을 확인하는 데 쓰는 참고 정보입니다.</p></div>
      <div className="cost-highlight-grid">{highlights.map((row, index) => <article key={`${row.ItemName}-${index}`}><span>{row.ItemName}</span><strong>{won(row.AvgCost)}</strong><small>참고 평균</small></article>)}</div>
    </section>

    <section className="cost-items" aria-labelledby="cost-items-title"><div className="cost-section-heading"><div><p className="cost-eyebrow">항목별 참고 금액</p><h2 id="cost-items-title">평균과 범위를 함께 확인하세요.</h2></div><small>{isLoading ? '정보를 확인하는 중이에요.' : `${rows.length}개 항목`}</small></div>
      {rows.length ? <div className="cost-item-list">{rows.map((row, index) => <article key={`${row.ItemName}-${row.WeightClass}-${index}`}><div><strong>{row.ItemName}</strong><span>{row.WeightClass && `${row.WeightClass} 기준`}</span></div><dl><div><dt>참고 평균</dt><dd>{won(row.AvgCost)}</dd></div><div><dt>참고 범위</dt><dd>{won(row.MinCost)} ~ {won(row.MaxCost)}</dd></div></dl><p>{guideFor(row.ItemName)}</p></article>)}</div> : <div className="cost-empty"><strong>선택한 항목의 공개 조사 정보가 아직 없어요.</strong><p>다른 진료 항목을 선택하거나 전국 참고 정보를 확인해보세요.</p><button type="button" onClick={() => setCategory('전체')}>전체 항목 보기</button></div>}</section>

    <details className="cost-compare"><summary>지역별 비교 안내</summary><p>지역별 공개 조사 데이터를 연결한 뒤 비교 기능을 제공할 예정입니다. 실제 비용은 방문 전 전화로 확인해 주세요.</p></details>

    <section className="cost-call"><div><p className="cost-eyebrow">전화 전 확인할 내용</p><h2>병원에 이렇게 물어보세요.</h2><ul><li>기본 진료비에 검사·처치 비용이 포함되는지</li><li>야간·응급 진료비가 별도인지</li><li>예상 총비용을 사전에 안내할 수 있는지</li></ul></div><Link to="/health-check" className="cost-cta">증상부터 확인하기 <span>→</span></Link></section>

    <footer className="cost-source"><strong>출처·안내 기준</strong><span>{source}</span><span>병원별 실제 가격과 진료 가능 여부는 방문 전 전화로 확인해 주세요.</span>{liveRows.length === 0 && <button type="button" onClick={() => refetch()}>정보 다시 확인</button>}</footer>
  </div></main>
}
