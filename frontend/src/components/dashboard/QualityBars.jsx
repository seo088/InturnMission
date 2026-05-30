export default function QualityBars({ metrics }) {
  if (!metrics) return <div className="text-xs opacity-40">로딩 중...</div>
  return (
    <div className="flex flex-col gap-3">
      {metrics.map(m => {
        const color = m.value>=90?'var(--green)':m.value>=75?'var(--yellow)':'var(--coral)'
        const grad  = m.value>=90?'linear-gradient(90deg,var(--teal),var(--green))':m.value>=75?'linear-gradient(90deg,var(--yellow),var(--orange))':'linear-gradient(90deg,var(--coral),var(--orange))'
        return (
          <div key={m.metric_name}>
            <div className="flex justify-between mb-1">
              <span className="text-[12px] font-semibold" style={{ color:'var(--text2)' }}>{m.metric_name}</span>
              <span className="text-[11px] font-mono font-bold" style={{ color }}>{m.value}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background:'var(--bg3)' }}>
              <div className="h-full rounded-full" style={{ width:`${m.value}%`, background:grad }} />
            </div>
            {m.warning_msg && <div className="text-[10px] mt-1" style={{ color:'var(--orange)' }}>{m.warning_msg}</div>}
          </div>
        )
      })}
    </div>
  )
}
