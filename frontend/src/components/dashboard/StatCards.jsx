import { useState } from 'react'

const CARD_DETAILS = {
  serviceRows: {
    label: '서비스 활용 데이터',
    icon: '📊',
    color: '#0d9488',
    bg: '#e6f7f5',
    from: '#0d9488',
    to: '#0284c7',
    value: '168,115',
    suffix: '행',
    desc: '전처리 15종 168,053행 + 진료비 62행',
    columns: ['구분', '수량', '내용'],
    rows: [
      ['외부 원천 데이터', '16종', '공공데이터포털 13종, AI허브 2종, 농림축산식품부 진료비 데이터 1종'],
      ['KG 구축 대상 데이터셋', '16개', '동물병원, 동물약국, 미용업, 위탁관리업, 장묘업, 동반여행, 구조동물, 분실동물, 보호센터, 문화시설, 휴게소, 질병·증상, 수의 QA, 질병정보, 건강정보, 추론체인'],
      ['전처리 원천 데이터', '15개', 'preprocessed_data 기준 CSV/JSON 전처리 파일'],
      ['진료비 데이터 테이블', '2개', '전국 진료비 통계 42행, 시도별 진료비 편차 20행'],
      ['서비스 직접 활용 행 수', '168,115행', '전처리 원천 15종 168,053행 + 진료비 데이터 62행'],
      ['AI허브 QA 관계 보강', '278개', '수의 QA 25건에서 증상 연결 113개, 증상 표현 113개, 질병 표현 52개를 KG에 추가'],
    ],
  },
  kgInstances: {
    label: 'KG 주요 개체',
    icon: '🧩',
    color: '#e11d48',
    bg: '#fce7ec',
    from: '#e11d48',
    to: '#ea580c',
    value: '167,573',
    suffix: '개',
    desc: '주요 RDF 클래스 인스턴스 합계',
    columns: ['RDF 클래스', '의미', 'GraphDB 적재 개체 수'],
    rows: [
      ['AnimalHospital', '동물병원', '5,373'],
      ['Pharmacy', '동물약국', '13,054'],
      ['Grooming', '동물미용업', '10,814'],
      ['Boarding', '동물위탁관리업', '5,821'],
      ['Cremation', '동물장묘업', '84'],
      ['TravelSpot', '반려동물 동반여행지', '1,000'],
      ['AbandonedAnimal', '구조동물', '15,240'],
      ['LostAnimal', '분실동물', '2,884'],
      ['AnimalShelter', '동물보호센터', '330'],
      ['CultureFacility', '반려동물 동반 가능 문화시설', '67'],
      ['RestArea', '휴게소 반려동물 놀이터', '20'],
      ['Symptom', '동물 질병 증상', '516'],
      ['Disease', '동물 질병 정보', '13'],
      ['VetQA', '반려동물 질병·성장 QA', '25'],
      ['HealthObservation', '반려견·반려묘 건강 관측', '112,332'],
      ['VetQA→Symptom', 'AI허브 QA 기반 증상 연결', '113'],
      ['VetQA 질병 표현', 'AI허브 QA 텍스트 추출 질병성 표현', '52'],
    ],
  },
  sourceDatasets: {
    label: '외부 원천 데이터',
    icon: '🗂️',
    color: '#7c3aed',
    bg: '#ede9fe',
    from: '#7c3aed',
    to: '#be185d',
    value: '16',
    suffix: '종',
    desc: '공공데이터포털 13 · AI허브 2 · 진료비 1',
    columns: ['번호', '데이터명', '출처 구분', '활용 형태'],
    rows: [
      ['1', '동물병원 조회 데이터', '공공데이터포털', '시설 위치·주소·연락처 KG 구축'],
      ['2', '동물약국 조회 데이터', '공공데이터포털', '동물약국 위치·주소 KG 구축'],
      ['3', '동물미용업 조회 데이터', '공공데이터포털', '반려동물 미용시설 KG 구축'],
      ['4', '동물위탁관리업 조회 데이터', '공공데이터포털', '위탁·돌봄 시설 KG 구축'],
      ['5', '동물장묘업 조회 데이터', '공공데이터포털', '장묘시설 KG 구축'],
      ['6', '반려동물 동반여행 데이터', '공공데이터포털', '반려동물 동반 여행지 KG 구축'],
      ['7', '구조동물 조회 데이터', '공공데이터포털', '구조동물 개체·보호 정보 KG 구축'],
      ['8', '분실동물 조회 데이터', '공공데이터포털', '분실동물 개체·지역·품종 조회'],
      ['9', '동물보호센터 데이터', '공공데이터포털', '보호센터 위치·연락처 KG 구축'],
      ['10', '반려동물 동반 가능 문화시설 데이터', '공공데이터포털', '문화시설 위치·동반 가능 정보 KG 구축'],
      ['11', '휴게소 반려동물 놀이터 데이터', '공공데이터포털', '휴게소 편의시설 KG 구축'],
      ['12', '동물질병 증상분류 데이터', '공공데이터포털', '증상 기반 질병 탐색'],
      ['13', '동물질병 정보 데이터', '공공데이터포털', '질병 마스터 데이터 KG 구축'],
      ['14', '반려견 성장 및 질병관련 말뭉치 데이터', 'AI허브', '수의 QA·질병 설명 데이터 구축 + 증상 연결 113개·질병 표현 52개 추출'],
      ['15', '반려견·반려묘 건강정보 데이터', 'AI허브', '건강 관측·체형·혈액수치·스트레스 데이터 KG 구축'],
      ['16', '2025년 동물병원 진료비 현황 데이터', '농림축산식품부', '전국 진료비 통계·시도 편차 대시보드 구축'],
    ],
  },
  rdfTriples: {
    label: 'RDF 트리플',
    icon: '🔗',
    color: '#d97706',
    bg: '#fef3c7',
    from: '#d97706',
    to: '#ea580c',
    value: '4,504,931',
    suffix: '개',
    desc: '서버 GraphDB 적재 기준',
    columns: ['구분', '수량', '내용'],
    rows: [
      ['RDF Turtle 산출물', '17개', '00_regions.ttl 포함 번호형 TTL 파일 기준'],
      ['GraphDB 적재 트리플', '4,504,931개', '서버 GraphDB 적재 기준'],
      ['GraphDB 주요 개체 수', '167,573개', '주요 RDF 클래스 인스턴스 합계 기준'],
      ['건강 관측 데이터', '112,332건', 'HealthObservation 클래스 적재 기준'],
      ['AI허브 QA 보강 트리플', '278개', 'mentionsSymptom 113개, mentionedSymptomText 113개, mentionedDiseaseText 52개를 14_vet_qa.ttl과 통합 Turtle에 반영'],
    ],
  },
  kgDatasets: {
    label: 'KG 구축 데이터셋',
    icon: '🧬',
    color: '#059669',
    bg: '#ecfdf5',
    from: '#059669',
    to: '#0d9488',
    value: '16',
    suffix: '개',
    desc: '01~05 · 07~17 + 추론체인',
    columns: ['번호', '데이터셋', 'KG 활용 위치'],
    rows: [
      ['01', '동물병원', '병원 탐색·추천'],
      ['02', '동물약국', '약국 탐색'],
      ['03', '미용업', '생활 시설 탐색'],
      ['04', '위탁관리업', '돌봄 시설 탐색'],
      ['05', '장묘업', '사후 케어 시설 탐색'],
      ['07', '동반여행', '동반 여행지 탐색'],
      ['08', '구조동물', '구조동물 조회'],
      ['09', '분실동물', '분실동물 조회'],
      ['10', '보호센터', '구조동물 보호기관 연결'],
      ['11', '문화시설', '동반 가능 문화시설 탐색'],
      ['12', '휴게소', '이동 중 편의시설 탐색'],
      ['13', '질병·증상', '증상 기반 질병 후보 탐색'],
      ['14', '수의 QA', '질병 설명 근거 문장 + 증상·질병 표현 추출 관계'],
      ['15', '질병정보', '질병 마스터 데이터'],
      ['17', '건강정보', '건강 관측 그래프 확장'],
      ['16', '추론체인', '증상-질병-시설 관계 연결'],
    ],
  },
}

const CARDS = [
  CARD_DETAILS.serviceRows,
  CARD_DETAILS.kgInstances,
  CARD_DETAILS.sourceDatasets,
  CARD_DETAILS.rdfTriples,
  CARD_DETAILS.kgDatasets,
]

export default function StatCards() {
  const [selected, setSelected] = useState(null)

  return (
    <>
      <div className="grid grid-cols-5 gap-[14px] mb-[22px]">
        {CARDS.map((card, i) => (
          <button
            type="button"
            key={card.label}
            onClick={() => setSelected(card)}
            className="relative rounded-[14px] p-[18px_20px] overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl animate-fadeUp text-left"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', animationDelay: `${(i + 1) * 0.05}s` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]" style={{ background: `linear-gradient(90deg,${card.from},${card.to})` }} />
            <div className="absolute right-4 top-4 w-9 h-9 rounded-[10px] flex items-center justify-center text-lg" style={{ background: card.bg }}>{card.icon}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.5px] mb-2" style={{ color: 'var(--muted)' }}>{card.label}</div>
            <div className="text-[30px] font-black leading-none" style={{ color: card.color }}>
              {card.value}
              <span className="text-[14px] ml-1">{card.suffix}</span>
            </div>
            <div className="text-[11px] mt-1 pr-8" style={{ color: 'var(--muted)' }}>{card.desc}</div>
          </button>
        ))}
      </div>

      {selected && <DetailModal card={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function DetailModal({ card, onClose }) {
  return (
    <div
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, maxWidth: 980, width: '100%', maxHeight: '86vh', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {card.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>상세 데이터</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', lineHeight: 1.3 }}>{card.label}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{card.value}{card.suffix} · {card.desc}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '6px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--muted)', fontSize: 13, flexShrink: 0 }}
          >
            닫기
          </button>
        </div>

        <div style={{ padding: 18, overflow: 'auto', maxHeight: 'calc(86vh - 84px)' }}>
          <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: card.columns.length > 3 ? 820 : 680 }}>
              <thead>
                <tr style={{ background: 'var(--bg3)' }}>
                  {card.columns.map((column) => (
                    <th key={column} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.rows.map((row, rowIndex) => (
                  <tr key={`${card.label}-${rowIndex}`} style={{ borderBottom: '1px solid var(--border)', background: rowIndex % 2 === 0 ? 'var(--bg2)' : 'var(--bg)' }}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${rowIndex}-${cellIndex}`}
                        style={{ padding: '9px 12px', color: cellIndex === 0 ? card.color : 'var(--text2)', fontWeight: cellIndex === 0 ? 800 : 500, lineHeight: 1.55, verticalAlign: 'top', whiteSpace: cellIndex === 0 ? 'nowrap' : 'normal' }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
