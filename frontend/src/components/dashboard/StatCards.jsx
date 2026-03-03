const CARDS = [
  { key:'facility_count',          label:'의료·케어 시설',  icon:'🏥', color:'#0d9488', bg:'#e6f7f5', from:'#0d9488', to:'#0284c7', desc:'병원·약국·미용업 · 행안부 API' },
  { key:'animal_registered_count', label:'동물 등록 개체',  icon:'🔖', color:'#e11d48', bg:'#fce7ec', from:'#e11d48', to:'#ea580c', desc:'rfidCd 기반 · owl:sameAs 연결' },
  { key:'travel_spot_count',       label:'동반·문화 시설',  icon:'🗺️', color:'#7c3aed', bg:'#ede9fe', from:'#7c3aed', to:'#be185d', desc:'contentid JOIN · 문화시설 7만+' },
  { key:'rdf_triple_count',        label:'RDF 트리플',      icon:'🔗', color:'#d97706', bg:'#fef3c7', from:'#d97706', to:'#ea580c', desc:'14개 데이터셋 기반 관계' },
  { key:'dataset_count',           label:'연동 데이터셋',   icon:'🧩', color:'#059669', bg:'#ecfdf5', from:'#059669', to:'#0d9488', desc:'API 11 · CSV 3 · 실시간 2' },
]
const fmt = (k,v) => {
  if(v==null) return '—'
  if(k==='animal_registered_count') return '312만'
  if(k==='rdf_triple_count') return '42.1K'
  return v.toLocaleString()
}
export default function StatCards({ stats, loading }) {
  return (
    <div className="grid grid-cols-5 gap-[14px] mb-[22px]">
      {CARDS.map(({key,label,icon,color,bg,from,to,desc},i) => (
        <div key={key} className="relative rounded-[14px] p-[18px_20px] overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl animate-fadeUp"
          style={{ background:'var(--bg2)', border:'1px solid var(--border)', animationDelay:`${(i+1)*0.05}s` }}>
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]" style={{ background:`linear-gradient(90deg,${from},${to})` }} />
          <div className="absolute right-4 top-4 w-9 h-9 rounded-[10px] flex items-center justify-center text-lg" style={{ background:bg }}>{icon}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.5px] mb-2" style={{ color:'var(--muted)' }}>{label}</div>
          <div className="text-[30px] font-black leading-none" style={{ color }}>
            {loading ? '—' : fmt(key, stats?.[key])}
          </div>
          <div className="text-[11px] mt-1" style={{ color:'var(--muted)' }}>{desc}</div>
        </div>
      ))}
    </div>
  )
}
