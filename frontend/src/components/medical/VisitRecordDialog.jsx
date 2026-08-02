import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getDemoCareNoteByVisitId, getDemoFacility, getDemoReceiptByVisitId, getDemoScheduleBySourceId } from '../../demo/plusDemoState'
import '../../styles/medical-records.css'

export default function VisitRecordDialog({ visit, pet, onClose, triggerRef }) {
  const closeRef = useRef(null)
  const facility = getDemoFacility(visit.facilityId)
  const receipt = getDemoReceiptByVisitId(visit.id)
  const note = getDemoCareNoteByVisitId(visit.id)
  const schedule = getDemoScheduleBySourceId(visit.id)
  useEffect(() => { const before = document.body.style.overflow; const key = e => { if (e.key === 'Escape') onClose() }; document.body.style.overflow = 'hidden'; document.addEventListener('keydown', key); requestAnimationFrame(() => closeRef.current?.focus()); return () => { document.body.style.overflow = before; document.removeEventListener('keydown', key); requestAnimationFrame(() => triggerRef?.current?.focus()) } }, [onClose, triggerRef])
  return <div className="medical-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="medical-dialog" role="dialog" aria-modal="true" aria-labelledby="visit-title"><button ref={closeRef} className="medical-close" onClick={onClose} aria-label="방문 기록 닫기">×</button><p className="medical-kicker">본선 데모 예시 · 보호자 방문 기록</p><h2 id="visit-title">{pet.name}의 병원 방문 메모</h2><div className="medical-summary"><strong>{visit.occurredOn} · {facility?.name ?? '병원 정보 예시'}</strong><span>보호자가 직접 남긴 방문 기록 예시입니다.</span></div><section><h3>보호자 방문 메모</h3><p>{visit.guardianMemo}</p></section><section><h3>진료비 기록</h3>{receipt ? <div className="medical-cost"><b>{receipt.totalAmount.toLocaleString('ko-KR')}원</b><span>{receipt.itemLabels.join(' · ')} · 영수증 예시 1장</span></div> : <p>진료비 기록이 없어요.</p>}</section>{receipt && <section><h3>영수증 예시</h3><div className="receipt-preview"><b>RECEIPT · DEMO</b><span>개인정보 보호를 위해 실제 영수증이 아닌 예시만 표시합니다.</span><i>예시</i></div></section>}<section><h3>병원 안내 메모</h3><p>{note?.text ?? '보호자 메모가 없어요.'}</p><small>복약 방법과 기간은 처방한 동물병원 안내를 우선 확인해 주세요.</small></section>{schedule && <section><h3>다음 확인</h3><div className="medical-schedule"><b>{schedule.scheduledOn} · {schedule.title}</b><span>알림 {schedule.reminderSetting} · 본선 데모</span><Link to="/my/schedule">일정 보기 →</Link></div></section>}<small className="medical-notice">본선 데모 화면입니다. 실제 영수증·처방 정보는 업로드하거나 저장하지 않습니다. 이 기록은 보호자의 관리 편의를 위한 정보이며, 진단·처방 판단은 담당 동물병원 안내를 우선 확인해 주세요.</small></section></div>
}
