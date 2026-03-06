import { useDashboardStats, useRegionStats, useDatasetTypes, useQualityMetrics, useDatasets } from '../hooks'
import StatCards from '../components/dashboard/StatCards'
import QualityBars from '../components/dashboard/QualityBars'
import DatasetList from '../components/dashboard/DatasetList'
import KoreaMap from '../components/dashboard/KoreaMap'
import BarChart from '../components/dashboard/BarChart'
import DonutChart from '../components/dashboard/DonutChart'

function Card({ title, dotColor, badge, children, noPad }) {
  return (
    <div className="rounded-[14px] overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between px-[18px] py-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
          <div className="w-[7px] h-[7px] rounded-full" style={{ background: dotColor }} />{title}
        </div>
        {badge && <span className="text-[10px] font-mono px-[9px] py-[3px] rounded-[5px] font-semibold" style={{ background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)' }}>{badge}</span>}
      </div>
      <div className={noPad ? '' : 'p-[18px]'}>{children}</div>
    </div>
  )
}

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useDashboardStats()
  const { data: regions, isLoading: loadingRegions } = useRegionStats()
  const { data: types } = useDatasetTypes()
  const { data: quality } = useQualityMetrics()
  const { data: datasets } = useDatasets()

  return (
    <div>
      <StatCards stats={stats} loading={loadingStats} />
      <div className="grid gap-[18px]" style={{ gridTemplateColumns: '290px 1fr' }}>
        <div className="flex flex-col gap-[14px]">
          <Card title="데이터셋 수집 현황" dotColor="var(--teal)" badge="14 / 14">
            <DatasetList datasets={datasets?.data} />
          </Card>
          <Card title="데이터 품질 검증" dotColor="var(--yellow)">
            <QualityBars metrics={quality} />
          </Card>
        </div>
        <div className="flex flex-col gap-[14px]">
          <Card title="시설 분포 지도 (전국 · schema:geo 기반)" dotColor="var(--blue)" badge="버블 크기 = 시설 수" noPad>
            <KoreaMap />
          </Card>
          <div className="grid grid-cols-2 gap-[14px]">
            <Card title="지역별 시설 TOP 7" dotColor="var(--coral)">
              <BarChart data={regions} loading={loadingRegions} />
            </Card>
            <Card title="데이터셋 유형 분포" dotColor="var(--purple)" noPad>
              <DonutChart data={types} />
            </Card>
            <Card title="데이터 거버넌스" dotColor="var(--amber-light)">
              <div className="text-[12px] text-slate-500 mb-3">
                13개 API의 RDF 매핑 구조와 보안 규칙을 확인하세요.
              </div>
              <button
                className="w-full py-2 rounded-md border text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-[var(--bg3)]"
                style={{ borderColor: 'var(--border)', color: 'var(--ink-mid)' }}
              >
                Open Technical Report
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
