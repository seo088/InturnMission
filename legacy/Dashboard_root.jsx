// 대시보드 페이지
import { useDashboardStats, useRegionStats, useDatasetTypes, useQualityMetrics, useDatasets } from '../hooks'
import StatCards from '../components/dashboard/StatCards'
import QualityBars from '../components/dashboard/QualityBars'
import DatasetList from '../components/dashboard/DatasetList'
import KoreaMap from '../components/dashboard/KoreaMap'
import BarChart from '../components/dashboard/BarChart'
import DonutChart from '../components/dashboard/DonutChart'

export default function Dashboard() {
  const { data: stats,   isLoading: loadingStats }   = useDashboardStats()
  const { data: regions, isLoading: loadingRegions } = useRegionStats()
  const { data: types                              } = useDatasetTypes()
  const { data: quality                            } = useQualityMetrics()
  const { data: datasets                           } = useDatasets()

  return (
    <div>
      {/* KPI 카드 5개 */}
      <StatCards stats={stats} loading={loadingStats} />

      {/* 메인 그리드: 사이드바 + 지도 */}
      <div className="grid gap-[18px]" style={{ gridTemplateColumns: '290px 1fr' }}>

        {/* 왼쪽 사이드바 */}
        <div className="flex flex-col gap-[14px]">
          <Card title="데이터셋 수집 현황" dotColor="var(--teal)" badge="14 / 14">
            <DatasetList datasets={datasets?.data} />
          </Card>
          <Card title="데이터 품질 검증" dotColor="var(--yellow)">
            <QualityBars metrics={quality} />
          </Card>
        </div>

        {/* 오른쪽 메인 */}
        <div className="flex flex-col gap-[14px]">
          <Card title="시설 분포 지도 (전국 · schema:geo 기반)" dotColor="var(--blue)" badge="버블 크기 = 시설 수">
            <KoreaMap />
          </Card>
          <div className="grid grid-cols-2 gap-[14px]">
            <Card title="지역별 시설 TOP 7" dotColor="var(--coral)">
              <BarChart data={regions} loading={loadingRegions} />
            </Card>
            <Card title="데이터셋 유형 분포" dotColor="var(--purple)">
              <DonutChart data={types} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// 공통 카드 컴포넌트
function Card({ title, dotColor, badge, children }) {
  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-[18px] py-[13px]"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--muted)' }}>
          <div className="w-[7px] h-[7px] rounded-full" style={{ background: dotColor }} />
          {title}
        </div>
        {badge && (
          <span
            className="text-[10px] font-mono px-[9px] py-[3px] rounded-[5px] font-semibold"
            style={{ background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            {badge}
          </span>
        )}
      </div>
      {/* 바디 */}
      <div className="p-[18px]">{children}</div>
    </div>
  )
}
