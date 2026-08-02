import { useKGOverview } from '../hooks'
import { kgSnapshot } from '../data/kgSnapshot'

const tone = { '검수 확정': '#0f766e', '그래프 관계': '#2563eb', '진료 탐색 보조': '#7c3aed', '매칭 신뢰도 저장': '#b45309', '연결 완료': '#0f766e' }
function Section({ title, children }) {
  return <section className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}><h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>{title}</h2>{children}</section>
}
function Badge({ children, color }) {
  return <span className="inline-block rounded-full px-2 py-1 text-[11px] font-semibold" style={{ color: color || '#64748b', background: `${color || '#64748b'}18` }}>{children}</span>
}

export default function Dashboard() {
  const { data, isError } = useKGOverview()
  const overview = data || kgSnapshot
  return <div className="space-y-5 max-w-[1400px]">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-bold tracking-wider" style={{ color: '#0f766e' }}>ANIMAL-ROUTE · KNOWLEDGE GRAPH</p><h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>반려동물 통합 지식그래프 현황</h1><p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>수치 기준일 {overview.as_of} · 정본 스냅샷 기반 {isError && '· API 연결 실패 시 로컬 스냅샷 표시'}</p></div>
      <Badge color="#0f766e">검수·출처·한계 분리 표시</Badge>
    </header>

    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">{overview.headline.map(item => <div key={item.label} className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}><p className="text-xs" style={{ color: 'var(--muted)' }}>{item.label}</p><p className="text-2xl font-bold mt-2" style={{ color: 'var(--text)' }}>{item.value}</p><p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>{item.detail}</p></div>)}</div>

    <Section title="서비스 핵심 경로">
      <div className="flex flex-col lg:flex-row items-stretch gap-2">
        {[['보호자 자연어', 'DS14 승인 관계 40건'], ['DS13 표준 증상', '516개 · 12개 분류'], ['질병 가능성', 'DS27 관계 145건'], ['진료 문의 분야', '22개 관계'], ['병원 후보', 'DS01 5,373개']].map(([name, detail], index) => <div key={name} className="flex flex-1 items-center gap-2"><div className="w-full rounded-xl p-3" style={{ background: index === 0 ? '#ecfdf5' : 'var(--bg3)', border: '1px solid var(--border)' }}><p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{name}</p><p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{detail}</p></div>{index < 4 && <span className="hidden lg:block text-lg" style={{ color: '#94a3b8' }}>→</span>}</div>)}
      </div>
      <p className="text-xs mt-4 rounded-lg p-3" style={{ background: '#fff7ed', color: '#9a3412' }}>병원 후보는 위치·공공시설 정보 기반 탐색 결과입니다. 병원별 24시간, 응급, 전문진료, 현재 접수 가능 여부는 별도 검증 전까지 ‘미확인’으로 표시합니다.</p>
    </Section>

    <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <Section title="핵심 지식그래프 자산"><div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">{overview.core_stats.map(item => <div className="rounded-xl p-4" key={item.label} style={{ background: 'var(--bg3)' }}><p className="text-xs" style={{ color: 'var(--muted)' }}>{item.dataset}</p><p className="font-bold mt-2" style={{ color: 'var(--text)' }}>{item.label}</p><p className="text-xl font-bold mt-1" style={{ color: '#0f766e' }}>{item.value}</p></div>)}</div></Section>
      <Section title="신규 확장 레이어"><div className="space-y-3">{overview.expansion.map(item => <div className="flex justify-between gap-3" key={item.id}><div><p className="text-xs font-bold" style={{ color: '#2563eb' }}>{item.id}</p><p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.label}</p></div><div className="text-right"><p className="font-bold" style={{ color: 'var(--text)' }}>{item.value}</p><Badge color={item.status === '연결 완료' ? '#0f766e' : '#b45309'}>{item.status}</Badge></div></div>)}</div></Section>
    </div>

    <Section title="관계 단위 품질 현황"><div className="overflow-x-auto"><table className="w-full text-sm"><thead style={{ color: 'var(--muted)' }}><tr className="text-left border-b" style={{ borderColor: 'var(--border)' }}><th className="pb-3">출발 개체</th><th className="pb-3">관계</th><th className="pb-3">도착 개체</th><th className="pb-3 text-right">관계 수</th><th className="pb-3 text-right">상태</th></tr></thead><tbody>{overview.relations.map(row => <tr key={`${row.from}-${row.predicate}`} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}><td className="py-3 font-medium">{row.from}</td><td className="py-3 font-mono text-xs" style={{ color: '#2563eb' }}>{row.predicate}</td><td className="py-3">{row.to}</td><td className="py-3 text-right font-bold">{row.count}</td><td className="py-3 text-right"><Badge color={tone[row.status] || '#b45309'}>{row.status}</Badge></td></tr>)}</tbody></table></div></Section>
    <Section title="해석 시 지켜야 할 경계"><ul className="grid gap-2 md:grid-cols-2">{overview.boundaries.map(item => <li className="rounded-lg p-3 text-sm" key={item} style={{ background: '#f8fafc', color: '#475569' }}>• {item}</li>)}</ul></Section>
  </div>
}
