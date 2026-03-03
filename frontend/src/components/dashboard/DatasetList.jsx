const FALLBACK = [
  {id:1,icon:'🏥',name:'동물병원',org:'행안부',realtime:false},
  {id:2,icon:'💊',name:'동물약국',org:'행안부',realtime:false},
  {id:3,icon:'✂️',name:'동물미용업',org:'행안부',realtime:false},
  {id:4,icon:'🔬',name:'KISTI 질병정보',org:'KISTI',realtime:false},
  {id:5,icon:'🧬',name:'증상분류',org:'KISTI',realtime:false},
  {id:6,icon:'🏠',name:'위탁관리업',org:'행안부',realtime:false},
  {id:7,icon:'🗺️',name:'동반여행',org:'관광공사',realtime:false},
  {id:8,icon:'🎭',name:'문화시설',org:'문화정보원',realtime:false},
  {id:9,icon:'🛑',name:'휴게소 놀이터',org:'도로공사',realtime:false},
  {id:10,icon:'🏗️',name:'동물보호센터',org:'농식품부',realtime:false},
  {id:11,icon:'🚨',name:'구조동물',org:'농식품부',realtime:true},
  {id:12,icon:'🔍',name:'분실동물',org:'농식품부',realtime:true},
  {id:13,icon:'🪪',name:'동물등록',org:'농식품부',realtime:false},
  {id:14,icon:'🌿',name:'동물장묘업',org:'행안부',realtime:false},
]
export default function DatasetList({ datasets }) {
  const items = datasets || FALLBACK
  return (
    <div className="flex flex-col gap-1">
      {items.map(ds => (
        <div key={ds.id} className="flex items-center gap-2 px-3 py-2 rounded-[9px] cursor-pointer transition-all hover:border-[var(--teal)] hover:bg-[var(--teal-lt)]"
          style={{ border:'1px solid var(--border)', background:'var(--bg)' }}>
          <span className="text-[15px] shrink-0">{ds.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold truncate" style={{ color:'var(--text2)' }}>{ds.name}</div>
            <div className="text-[10px]" style={{ color:'var(--muted)' }}>{ds.org}</div>
          </div>
          <div className={`w-[7px] h-[7px] rounded-full shrink-0 ${ds.realtime?'animate-blink':''}`}
            style={{ background:ds.realtime?'var(--coral)':'var(--green)' }} />
        </div>
      ))}
    </div>
  )
}
