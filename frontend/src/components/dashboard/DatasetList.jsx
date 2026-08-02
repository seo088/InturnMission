const FALLBACK = [
  { id: 1, icon: '🏥', name: '동물병원 조회서비스', org: '행정안전부', realtime: false },
  { id: 2, icon: '💊', name: '동물약국 조회서비스', org: '행정안전부', realtime: false },
  { id: 3, icon: '✂️', name: '동물미용업 조회서비스', org: '행정안전부', realtime: false },
  { id: 4, icon: '🏠', name: '동물위탁관리업 조회서비스', org: '행정안전부', realtime: false },
  { id: 5, icon: '🕯️', name: '동물장묘업 조회서비스', org: '행정안전부', realtime: false },
  { id: 7, icon: '🧳', name: '반려동물 동반여행 서비스', org: '한국관광공사', realtime: false },
  { id: 8, icon: '🐾', name: '구조동물 조회서비스', org: '농림축산식품부', realtime: false },
  { id: 9, icon: '❓', name: '분실동물 조회서비스', org: '농림축산식품부', realtime: false },
  { id: 10, icon: '🏘️', name: '동물보호센터 정보 조회서비스', org: '농림축산식품부', realtime: false },
  { id: 11, icon: '🎭', name: '반려동물 동반 가능 문화시설', org: '한국문화정보원', realtime: false },
  { id: 12, icon: '🛣️', name: '휴게소 반려동물 편의시설', org: '한국도로공사', realtime: false },
  { id: 13, icon: '🧬', name: '동물질병 증상분류', org: 'KISTI', realtime: false },
  { id: 14, icon: '💬', name: '반려견 성장·질병 말뭉치', org: 'AI허브', realtime: false },
  { id: 15, icon: '🦠', name: '동물 질병 정보', org: '농림축산식품부', realtime: false },
  { id: 16, icon: '💰', name: '동물병원 진료비 현황조사', org: '농림축산식품부', realtime: false },
  { id: 17, icon: '📈', name: '반려견·반려묘 건강정보', org: 'AI허브', realtime: false },
]

export default function DatasetList({ datasets }) {
  const items = datasets?.length ? datasets : FALLBACK

  return (
    <div className="flex flex-col gap-1">
      {items.map((ds) => (
        <div
          key={ds.id}
          className="flex items-center gap-2 rounded-[9px] px-3 py-2 transition-all hover:border-[var(--teal)] hover:bg-[var(--teal-lt)]"
          style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}
        >
          <span className="shrink-0 text-[15px]">{ds.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-bold" style={{ color: 'var(--text2)' }}>{ds.name}</div>
            <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{ds.org}</div>
          </div>
          <div
            className={`h-[7px] w-[7px] shrink-0 rounded-full ${ds.realtime ? 'animate-blink' : ''}`}
            style={{ background: ds.realtime ? 'var(--coral)' : 'var(--green)' }}
          />
        </div>
      ))}
    </div>
  )
}
