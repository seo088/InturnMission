import { useState } from 'react'

const tabs = [
  { key: 'abandoned', label: '구조동물', count: '15,241건' },
  { key: 'lost', label: '분실동물', count: '2,963건' },
]

export default function AnimalSearch() {
  const [type, setType] = useState('abandoned')
  const [region, setRegion] = useState('전북')
  const [breed, setBreed] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAnimal, setSelectedAnimal] = useState(null)

  const search = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ type })
      if (region.trim()) params.set('region', region.trim())
      if (breed.trim()) params.set('breed', breed.trim())

      const res = await fetch(`/api/animals/search?${params.toString()}`)
      if (!res.ok) throw new Error('조회 요청에 실패했습니다.')
      const json = await res.json()
      setRows(json.data || [])
      setSelectedAnimal(null)
    } catch (err) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">유기·분실동물 조회</h2>
        <p className="mt-1 text-sm text-slate-500">
          GraphDB에 적재된 구조동물 15,241건과 분실동물 2,963건을 지역·품종 기준으로 탐색합니다.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setType(tab.key)}
              className={`rounded-md border px-4 py-2 text-sm font-bold ${
                type === tab.key
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-70">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-500">지역</span>
            <input
              value={region}
              onChange={e => setRegion(e.target.value)}
              placeholder="예: 전북, 군산, 서울"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-500">품종</span>
            <input
              value={breed}
              onChange={e => setBreed(e.target.value)}
              placeholder="예: 말티즈, 믹스견, 한국 고양이"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </label>
          <button
            type="button"
            onClick={search}
            disabled={loading}
            className="self-end rounded-md bg-teal-600 px-5 py-2 text-sm font-extrabold text-white disabled:opacity-50"
          >
            {loading ? '조회 중...' : '검색'}
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-slate-700">검색 결과 {rows.length}건</div>
        <div className="text-xs text-slate-400">최대 60건 표시</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(item => (
          <article
            key={item.uri}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedAnimal(item)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setSelectedAnimal(item)
              }
            }}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900">{item.breed || '품종 정보 없음'}</div>
                <div className="mt-1 text-xs text-slate-500">{item.date || '날짜 정보 없음'}</div>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                item.type === 'abandoned' ? 'bg-orange-50 text-orange-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {item.type === 'abandoned' ? '구조' : '분실'}
              </span>
            </div>

            {item.image && (
              <img
                src={item.image}
                alt={item.breed || '동물 사진'}
                className="mb-3 h-56 w-full rounded-md bg-slate-50 object-contain"
                loading="lazy"
              />
            )}

            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs font-bold text-slate-400">지역·장소</dt>
                <dd className="text-slate-700">{item.region || '-'}</dd>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <dt className="text-xs font-bold text-slate-400">색상</dt>
                  <dd className="text-slate-700">{item.color || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400">나이·성별</dt>
                  <dd className="text-slate-700">{[item.age, item.gender].filter(Boolean).join(' / ') || '-'}</dd>
                </div>
              </div>
              {item.status && (
                <div>
                  <dt className="text-xs font-bold text-slate-400">상태</dt>
                  <dd className="text-slate-700">{item.status}</dd>
                </div>
              )}
              {item.specialMark && (
                <div>
                  <dt className="text-xs font-bold text-slate-400">특징</dt>
                  <dd className="line-clamp-3 text-slate-700">{item.specialMark}</dd>
                </div>
              )}
            </dl>
          </article>
        ))}
      </div>

      {selectedAnimal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAnimal(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <div className="text-lg font-extrabold text-slate-900">
                  {selectedAnimal.breed || '품종 정보 없음'}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-500">
                  {selectedAnimal.date || '날짜 정보 없음'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                  selectedAnimal.type === 'abandoned' ? 'bg-orange-50 text-orange-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {selectedAnimal.type === 'abandoned' ? '구조동물' : '분실동물'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAnimal(null)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-50"
                >
                  닫기
                </button>
              </div>
            </div>

            <div className="grid max-h-[78vh] overflow-y-auto md:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-slate-50 p-4">
                {selectedAnimal.image ? (
                  <img
                    src={selectedAnimal.image}
                    alt={selectedAnimal.breed || '동물 사진'}
                    className="max-h-[68vh] w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm font-bold text-slate-400">
                    등록된 사진이 없습니다
                  </div>
                )}
              </div>

              <div className="space-y-4 p-5">
                <dl className="grid gap-3 text-sm">
                  {[
                    ['지역·장소', selectedAnimal.region],
                    ['색상', selectedAnimal.color],
                    ['나이', selectedAnimal.age],
                    ['성별', selectedAnimal.gender],
                    ['상태', selectedAnimal.status],
                    ['고유 URI', selectedAnimal.uri],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-extrabold text-slate-400">{label}</dt>
                      <dd className="mt-0.5 break-words text-slate-700">{value || '-'}</dd>
                    </div>
                  ))}
                  <div>
                    <dt className="text-xs font-extrabold text-slate-400">특징</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-slate-700">
                      {selectedAnimal.specialMark || '-'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-semibold text-slate-400">
          검색 조건을 입력하고 검색 버튼을 눌러주세요.
        </div>
      )}
    </div>
  )
}
