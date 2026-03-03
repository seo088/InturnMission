import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
const CITIES = [
  {name:'서울',x:0.42,y:0.22,count:1250},{name:'부산',x:0.62,y:0.72,count:680},
  {name:'대구',x:0.57,y:0.58,count:520},{name:'인천',x:0.36,y:0.24,count:440},
  {name:'광주',x:0.35,y:0.67,count:310},{name:'대전',x:0.46,y:0.45,count:390},
  {name:'울산',x:0.65,y:0.64,count:260},{name:'수원',x:0.41,y:0.30,count:320},
  {name:'청주',x:0.50,y:0.42,count:210},{name:'전주',x:0.38,y:0.58,count:190},
  {name:'창원',x:0.56,y:0.72,count:230},{name:'제주',x:0.38,y:0.93,count:150},
]
export default function KoreaMap() {
  const ref = useRef(null)
  useEffect(() => {
    if(!ref.current) return
    const el=ref.current, W=el.clientWidth||600, H=310
    d3.select(el).selectAll('*').remove()
    const svg=d3.select(el).append('svg').attr('width',W).attr('height',H)
    svg.append('rect').attr('width',W).attr('height',H).attr('fill','#f8fafc')
    const rScale=d3.scaleSqrt().domain([0,d3.max(CITIES,d=>d.count)]).range([6,42])
    CITIES.forEach(city => {
      const cx=city.x*W, cy=city.y*H, r=rScale(city.count)
      svg.append('circle').attr('cx',cx).attr('cy',cy).attr('r',r)
        .attr('fill','rgba(13,148,136,0.15)').attr('stroke','var(--teal)').attr('stroke-width',1.5)
        .style('cursor','pointer')
        .on('mouseover',function(){d3.select(this).attr('fill','rgba(13,148,136,0.35)')})
        .on('mouseout',function(){d3.select(this).attr('fill','rgba(13,148,136,0.15)')})
      if(r>15) svg.append('text').attr('x',cx).attr('y',cy+4).attr('text-anchor','middle')
        .attr('font-size','10px').attr('font-weight','700').attr('fill','var(--teal)')
        .style('font-family','Noto Sans KR,sans-serif').text(city.name)
    })
  },[])
  return <div ref={ref} style={{ height:310 }} />
}
