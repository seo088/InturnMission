import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
const FALLBACK=[{sido:'경기',count:1820},{sido:'서울',count:1250},{sido:'부산',count:680},{sido:'경남',count:590},{sido:'대구',count:520},{sido:'인천',count:440},{sido:'경북',count:380}]
export default function BarChart({ data, loading }) {
  const ref=useRef(null)
  const items=data||FALLBACK
  useEffect(() => {
    if(!ref.current||loading) return
    const el=ref.current, W=el.clientWidth||320, H=180
    const m={top:8,right:12,bottom:28,left:40}
    d3.select(el).selectAll('*').remove()
    const svg=d3.select(el).append('svg').attr('width',W).attr('height',H)
    const g=svg.append('g').attr('transform',`translate(${m.left},${m.top})`)
    const iW=W-m.left-m.right, iH=H-m.top-m.bottom
    const x=d3.scaleBand().domain(items.map(d=>d.sido)).range([0,iW]).padding(0.3)
    const y=d3.scaleLinear().domain([0,d3.max(items,d=>d.count)*1.1]).range([iH,0])
    g.append('g').attr('transform',`translate(0,${iH})`).call(d3.axisBottom(x).tickSize(0)).select('.domain').remove()
    g.selectAll('.tick text').style('font-size','10px').style('fill','var(--muted)')
    const defs=svg.append('defs'),grad=defs.append('linearGradient').attr('id','barGrad').attr('x1','0').attr('y1','0').attr('x2','0').attr('y2','1')
    grad.append('stop').attr('offset','0%').attr('stop-color','var(--coral)')
    grad.append('stop').attr('offset','100%').attr('stop-color','var(--orange)')
    g.selectAll('rect').data(items).join('rect')
      .attr('x',d=>x(d.sido)).attr('y',d=>y(d.count))
      .attr('width',x.bandwidth()).attr('height',d=>iH-y(d.count))
      .attr('rx',4).attr('fill','url(#barGrad)')
  },[items,loading])
  return <div ref={ref} style={{ width:'100%',height:180 }} />
}
