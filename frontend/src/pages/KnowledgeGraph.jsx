import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useKGNodes, useKGEdges } from '../hooks'

function GraphCanvas({ nodes, edges }) {
  const ref = useRef(null)
  useEffect(() => {
    if(!ref.current||!nodes||!edges) return
    const el=ref.current, W=el.clientWidth||700, H=520
    d3.select(el).selectAll('*').remove()
    const svg=d3.select(el).append('svg').attr('width',W).attr('height',H)
    svg.append('defs').append('marker').attr('id','arrow').attr('viewBox','0 -5 10 10').attr('refX',22).attr('refY',0).attr('markerWidth',6).attr('markerHeight',6).attr('orient','auto').append('path').attr('d','M0,-5L10,0L0,5').attr('fill','#cbd5e1')
    const simNodes=nodes.map(d=>({...d}))
    const byId=Object.fromEntries(simNodes.map(d=>[d.id,d]))
    const simLinks=edges.map(d=>({...d,source:byId[d.source],target:byId[d.target]})).filter(d=>d.source&&d.target)
    const sim=d3.forceSimulation(simNodes).force('link',d3.forceLink(simLinks).distance(120).strength(0.5)).force('charge',d3.forceManyBody().strength(-300)).force('center',d3.forceCenter(W/2,H/2)).force('collision',d3.forceCollide(40))
    const link=svg.append('g').selectAll('line').data(simLinks).join('line').attr('stroke','#e2e8f0').attr('stroke-width',1.5).attr('marker-end','url(#arrow)')
    const node=svg.append('g').selectAll('g').data(simNodes).join('g').style('cursor','pointer').call(d3.drag().on('start',(e,d)=>{if(!e.active)sim.alphaTarget(0.3).restart();d.fx=d.x;d.fy=d.y}).on('drag',(e,d)=>{d.fx=e.x;d.fy=e.y}).on('end',(e,d)=>{if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null}))
    node.append('circle').attr('r',24).attr('fill',d=>d.color+'22').attr('stroke',d=>d.color).attr('stroke-width',2)
    node.append('text').attr('y',-2).attr('text-anchor','middle').attr('font-size','16px').text(d=>d.icon)
    node.append('text').attr('y',14).attr('text-anchor','middle').attr('font-size','9px').attr('fill','var(--text2)').style('font-family','Noto Sans KR,sans-serif').style('font-weight','700').text(d=>d.label)
    sim.on('tick',()=>{
      link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y)
      node.attr('transform',d=>`translate(${d.x},${d.y})`)
    })
    return ()=>sim.stop()
  },[nodes,edges])
  return <div ref={ref} style={{ width:'100%',height:520 }} />
}

export default function KnowledgeGraph() {
  const { data:nodes } = useKGNodes()
  const { data:edges } = useKGEdges()
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[17px] font-black mb-1">🕸️ 지식그래프 스키마 시각화</h1>
        <p className="text-[12px]" style={{ color:'var(--muted)' }}>노드 드래그 가능 · Entity와 Predicate 관계 시각화</p>
      </div>
      <div className="grid gap-[18px]" style={{ gridTemplateColumns:'1fr 260px' }}>
        <div className="rounded-[14px] overflow-hidden" style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}>
          <div className="px-[18px] py-[13px] text-[11px] font-bold uppercase tracking-[0.8px]" style={{ borderBottom:'1px solid var(--border)', color:'var(--muted)' }}>● 전체 연결맵 — Entity Relation Graph</div>
          <div className="p-2"><GraphCanvas nodes={nodes} edges={edges} /></div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-[14px]" style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}>
            <div className="px-[18px] py-[13px] text-[11px] font-bold uppercase tracking-[0.8px]" style={{ borderBottom:'1px solid var(--border)', color:'var(--muted)' }}>● 노드 범례</div>
            <div className="p-2.5 flex flex-col gap-1">
              {(nodes||[]).map(n=>(
                <div key={n.id} className="flex items-center gap-2.5 px-3 py-2 rounded-[9px] text-[12px]" style={{ background:'var(--bg)', border:'1px solid var(--border)' }}>
                  <div className="w-[11px] h-[11px] rounded-full" style={{ background:n.color }} />
                  <span className="font-bold" style={{ color:'var(--text2)' }}>{n.icon} {n.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[14px]" style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}>
            <div className="px-[18px] py-[13px] text-[11px] font-bold uppercase tracking-[0.8px]" style={{ borderBottom:'1px solid var(--border)', color:'var(--muted)' }}>● 주요 Predicate</div>
            <div className="p-2.5 flex flex-col gap-1.5">
              {(edges||[]).slice(0,5).map((e,i)=>(
                <div key={i} className="px-3 py-2 rounded-[8px] font-mono text-[10px] leading-[1.7]" style={{ background:'var(--bg)', border:'1px solid var(--border)', color:'var(--muted)' }}>
                  {e.key&&<><span style={{ color:'var(--teal)' }}>{e.key}</span> →<br/></>}
                  <span style={{ color:'var(--blue)',fontWeight:600 }}>{e.predicate}</span><br/>
                  {e.source} → {e.target}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
