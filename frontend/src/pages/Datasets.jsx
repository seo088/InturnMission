import { useDatasets } from '../hooks'
const CAT_STYLES = {
  '의료·케어':{color:'#0d9488',bg:'#e6f7f5',icon:'🏥'},
  '보호·여가':{color:'#7c3aed',bg:'#ede9fe',icon:'🏠'},
  '이동·거점':{color:'#2563eb',bg:'#eff6ff',icon:'🛑'},
  '안전·개체':{color:'#e11d48',bg:'#fce7ec',icon:'🚨'},
  '사후관리': {color:'#94a3b8',bg:'#f1f5f9',icon:'🌿'},
}
export default function Datasets() {
  const { data, isLoading } = useDatasets()
  const grouped = (data?.data||[]).reduce((acc,ds)=>{ if(!acc[ds.cat])acc[ds.cat]=[]; acc[ds.cat].push(ds); return acc },{})
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[17px] font-black mb-1">🗂️ 14개 데이터셋 상세</h1>
        <p className="text-[12px]" style={{ color:'var(--muted)' }}>각 데이터셋의 제공기관, 연결 키, API 필드명을 확인할 수 있습니다</p>
      </div>
      {isLoading ? <div className="text-center py-20 text-sm" style={{ color:'var(--muted)' }}>로딩 중...</div>
        : Object.entries(grouped).map(([cat,items])=>{
          const s=CAT_STYLES[cat]||{color:'#94a3b8',bg:'#f1f5f9',icon:'📦'}
          return (
            <div key={cat} className="mb-8">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] mb-3 text-[13px] font-bold" style={{ background:s.bg, color:s.color }}>
                <span>{s.icon}</span><span>{cat}</span><span className="font-mono text-[11px] opacity-60">{items.length}개</span>
              </div>
              <div className="grid gap-[14px]" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))' }}>
                {items.map(ds=>(
                  <div key={ds.id} className="rounded-[12px] p-[18px] transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-[20px]" style={{ background:s.bg }}>{ds.icon}</div>
                      <div>
                        <div className="text-[14px] font-extrabold">{ds.name}</div>
                        <div className="text-[11px]" style={{ color:'var(--muted)' }}>{ds.org}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[ds.type, ds.realtime&&'realtime'].filter(Boolean).map(t=>{
                        const cfg={api:{l:'API',bg:'var(--teal-lt)',c:'var(--teal)',b:'#99f6e4'},csv:{l:'CSV',bg:'var(--yellow-lt)',c:'var(--yellow)',b:'#fde68a'},realtime:{l:'실시간',bg:'var(--coral-lt)',c:'var(--coral)',b:'#fecdd3'}}[t]
                        return cfg?<span key={t} className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-bold border" style={{ background:cfg.bg,color:cfg.c,borderColor:cfg.b }}>{cfg.l}</span>:null
                      })}
                      <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-bold" style={{ background:'var(--bg3)',color:'var(--muted)',border:'1px solid var(--border)' }}>{ds.fields}개 필드</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      }
    </div>
  )
}
