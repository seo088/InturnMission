import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
const FALLBACK=[{type:'API 연동',count:11,color:'#0d9488'},{type:'CSV',count:3,color:'#d97706'},{type:'실시간',count:2,color:'#e11d48'}]
export default function DonutChart({ data }) {
  const ref=useRef(null)
  const items=data||FALLBACK
  useEffect(() => {
    if(!ref.current) return
    const S=130,R=S/2
    d3.select(ref.current).selectAll('*').remove()
    const svg=d3.select(ref.current).append('svg').attr('width',S).attr('height',S).append('g').attr('transform',`translate(${R},${R})`)
    const pie=d3.pie().value(d=>d.count).sort(null)
    const arc=d3.arc().innerRadius(R*0.58).outerRadius(R*0.92)
    svg.selectAll('path').data(pie(items)).join('path').attr('d',arc).attr('fill',d=>d.data.color).attr('stroke','#fff').attr('stroke-width',2)
    svg.append('text').attr('text-anchor','middle').attr('y',-4).style('font-size','22px').style('font-weight','900').style('fill','var(--text)').text('14')
    svg.append('text').attr('text-anchor','middle').attr('y',12).style('font-size','9px').style('fill','var(--muted)').style('font-family','Noto Sans KR,sans-serif').text('데이터셋')
  },[items])
  return (
    <div className="flex items-center gap-5 px-5 py-4">
      <div ref={ref} />
      <div className="flex flex-col gap-1.5 flex-1">
        {items.map(d=>(
          <div key={d.type} className="flex items-center gap-2 text-[12px]">
            <div className="w-2 h-2 rounded-[3px]" style={{ background:d.color }} />
            <span className="flex-1" style={{ color:'var(--text2)' }}>{d.type}</span>
            <span className="font-mono text-[11px]" style={{ color:'var(--muted)' }}>{d.count}개</span>
          </div>
        ))}
      </div>
    </div>
  )
}
