import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useRegionStats } from '../../hooks'

// 시도별 대략적인 지도 위치 (0~1 비율)
const SIDO_POS = {
  '경기도':         { x: 0.42, y: 0.28 },
  '서울특별시':     { x: 0.40, y: 0.22 },
  '인천광역시':     { x: 0.35, y: 0.24 },
  '강원특별자치도': { x: 0.62, y: 0.22 },
  '충청북도':       { x: 0.48, y: 0.42 },
  '충청남도':       { x: 0.38, y: 0.45 },
  '대전광역시':     { x: 0.44, y: 0.48 },
  '세종특별자치시': { x: 0.43, y: 0.44 },
  '전북특별자치도': { x: 0.38, y: 0.60 },
  '전라남도':       { x: 0.36, y: 0.72 },
  '광주광역시':     { x: 0.37, y: 0.67 },
  '경상북도':       { x: 0.62, y: 0.42 },
  '경상남도':       { x: 0.60, y: 0.68 },
  '대구광역시':     { x: 0.58, y: 0.52 },
  '부산광역시':     { x: 0.65, y: 0.72 },
  '울산광역시':     { x: 0.67, y: 0.65 },
  '제주특별자치도': { x: 0.40, y: 0.93 },
}

export default function KoreaMap() {
  const ref = useRef(null)
  const { data: regions, isLoading } = useRegionStats()

  useEffect(() => {
    if (!ref.current || !regions || regions.length === 0) return

    const cities = regions
      .map(r => ({ name: r.sido, count: r.count, ...SIDO_POS[r.sido] }))
      .filter(c => c.x && c.y)

    const el = ref.current
    const W = el.clientWidth || 600
    const H = 310

    d3.select(el).selectAll('*').remove()
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H)
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#f8fafc')

    const rScale = d3.scaleSqrt()
      .domain([0, d3.max(cities, d => d.count)])
      .range([6, 42])

    cities.forEach(city => {
      const cx = city.x * W
      const cy = city.y * H
      const r = rScale(city.count)

      svg.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', r)
        .attr('fill', 'rgba(13,148,136,0.15)')
        .attr('stroke', 'var(--teal)')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mouseover', function () { d3.select(this).attr('fill', 'rgba(13,148,136,0.35)') })
        .on('mouseout', function () { d3.select(this).attr('fill', 'rgba(13,148,136,0.15)') })

      // tooltip
      svg.append('title').text(`${city.name}: ${city.count.toLocaleString()}건`)

      if (r > 15) {
        svg.append('text')
          .attr('x', cx).attr('y', cy + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-weight', '700')
          .attr('fill', 'var(--teal)')
          .style('font-family', 'Noto Sans KR,sans-serif')
          .text(city.name)
      }
    })
  }, [regions])

  if (isLoading) return <div style={{ height: 310, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>로딩 중...</div>

  return <div ref={ref} style={{ height: 310 }} />
}