import { useState } from 'react'
const SECS = [
  { label:'🏥 동물병원·약국·미용', color:'#0d9488', rows:[
    ['Name','BPLC_NM','text','schema:name','늘푸른동물병원','시설 명칭'],
    ['Facility_ID','MNG_NO','text','schema:identifier','366000001020260001','고유 식별자'],
    ['RoadAddress','ROAD_NM_ADDR','text','schema:streetAddress','대전광역시 서구 계룡로550','도로명 주소'],
    ['lat','CRD_INFO_Y','float','schema:latitude','36.3178','⚠ TM→WGS84 변환 필요'],
    ['lon','CRD_INFO_X','float','schema:longitude','127.3941','⚠ TM→WGS84 변환 필요'],
    ['PhoneNumber','TELNO','text','schema:telephone','042-731-5850','전화번호'],
  ]},
  { label:'🚨 구조·분실·등록', color:'#e11d48', rows:[
    ['RfidCode','rfidCd','text','owl:sameAs','410123456789012','RFID 칩 코드 (핵심 JOIN 키)'],
    ['CareRegNo','careRegNo','text','schema:containedInPlace','411310201900001','보호소 등록번호 (JOIN 키)'],
    ['KindName','kindNm','text','skos:Concept','믹스견','품종명'],
    ['ProcessState','processState','text','schema:additionalProperty','보호중','처리상태'],
    ['HappenPlace','happenPlace','text','schema:location','서울시 마포구 망원동','발견·분실 장소'],
  ]},
  { label:'🏠 보호센터', color:'#7c3aed', rows:[
    ['CareRegNo','careRegNo','text','schema:identifier','411310201900001','JOIN 키'],
    ['CareNm','careNm','text','schema:name','서울동물복지지원센터','보호센터 명칭'],
    ['lat','lat','float','geo:lat','37.5671','✅ WGS84 직접 사용 가능'],
    ['lng','lng','float','geo:long','126.8941','✅ WGS84 직접 사용 가능'],
  ]},
  { label:'🗺️ 동반여행', color:'#d97706', rows:[
    ['ContentID','contentid','text','schema:identifier','126508','관광지 ID (JOIN 키)'],
    ['Title','title','text','schema:name','한강공원 반려견 놀이터','관광지 명칭'],
    ['lon','mapx','float','geo:long','126.9242','✅ WGS84 직접 사용'],
    ['lat','mapy','float','geo:lat','37.5271','✅ WGS84 직접 사용'],
  ]},
  { label:'🧬 질병·증상', color:'#0284c7', rows:[
    ['SymptomCode','증상코드','text','schema:identifier','DH10.56','질병 고유 코드'],
    ['CategoryKo','증상분류 한글','text','skos:broader','안과 질환','증상 대분류'],
    ['SymptomName','증상명','text','skos:prefLabel','바이러스성 결막염','증상명'],
    ['DiseaseNameKo','DISS_NM','text','skos:prefLabel','개디스템퍼','질병명 한글'],
    ['CauseCategory','CAUSE_CMMN_CL','text','skos:Concept','바이러스','원인 분류'],
  ]},
]
export default function Mapping() {
  const [tab, setTab] = useState(0)
  const sec = SECS[tab]
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[17px] font-black mb-1">🔗 매핑테이블 — API 원본 필드 ↔ Schema.org / LOV</h1>
        <p className="text-[12px]" style={{ color:'var(--muted)' }}>data.go.kr 실제 필드명 기반</p>
      </div>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {SECS.map((s,i)=>(
          <button key={i} onClick={()=>setTab(i)} className="px-4 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all"
            style={tab===i?{background:s.color+'18',border:`1px solid ${s.color}`,color:s.color}:{background:'var(--bg)',border:'1px solid var(--border)',color:'var(--muted)'}}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-[12px]" style={{ border:'1px solid var(--border)' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'12px' }}>
          <thead>
            <tr style={{ background:'var(--bg3)',borderBottom:'1px solid var(--border)' }}>
              {['제안 필드명','API 원본 필드명','Type','Schema.org / LOV','예시값','설명'].map(h=>(
                <th key={h} className="text-left px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.6px] whitespace-nowrap" style={{ color:'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sec.rows.map(([f,a,t,s,e,d],i)=>{
              const warn=d.includes('⚠'), ok=d.includes('✅')
              return (
                <tr key={i} style={{ borderBottom:'1px solid #f8fafc' }} className="hover:bg-[#f8fafc]">
                  <td className="px-3.5 py-2 font-mono font-semibold" style={{ color:'var(--blue)' }}>{f}</td>
                  <td className="px-3.5 py-2 font-mono" style={{ color:'var(--teal)' }}>{a}</td>
                  <td className="px-3.5 py-2"><span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono" style={{ background:'var(--bg3)',color:'var(--muted)',border:'1px solid var(--border)' }}>{t}</span></td>
                  <td className="px-3.5 py-2 font-mono text-[11px]" style={{ color:'var(--purple)' }}>{s}</td>
                  <td className="px-3.5 py-2 font-mono text-[11px]" style={{ color:'var(--muted)' }}>{e}</td>
                  <td className="px-3.5 py-2" style={{ color:warn?'var(--orange)':ok?'var(--green)':'var(--text2)',fontWeight:(warn||ok)?600:400 }}>{d}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
