export const DEMO_HEALTH_RECORDS = [
  { id: 'record-ruby-01', petId: 'pet-demo-ruby', facilityId: 'hospital-sun', date: '2026.08.02', status: 'general', input: '기침을 하고 평소보다 밥을 적게 먹는 것 같아요.', summary: '기침과 식욕 감소', symptoms: ['기침', '식욕 감소'], guidance: '기침이 이어지거나 식욕 저하가 심해지면 가까운 동물병원에 문의해 주세요.', hospital: '햇살 동물병원 · 군산시 · 2.1km' },
  { id: 'record-ruby-02', petId: 'pet-demo-ruby', date: '2026.04.03', status: 'general', input: '피부를 자주 긁고 귀 주변을 신경 쓰는 모습이에요.', summary: '피부 가려움', symptoms: ['피부 가려움', '귀 주변 불편'], guidance: '긁는 횟수와 피부 변화를 관찰해 병원 문의 시 함께 알려주세요.', hospital: '햇살 동물병원 · 군산시 · 2.1km' },
  { id: 'record-ruby-03', petId: 'pet-demo-ruby', date: '2026.02.17', status: 'general', input: '평소보다 산책 후 피곤해 보였지만 휴식 후에는 괜찮아졌어요.', summary: '활동량 변화 확인', symptoms: ['활동량 변화'], guidance: '증상이 반복되면 지속 시간과 함께 병원에 문의해 주세요.', hospital: '방문 전 전화 확인이 필요해요.' },
  { id: 'record-maru-01', petId: 'pet-demo-maru', date: '2026.06.11', status: 'urgent', input: '구토를 했고 기운이 없어 보여요.', summary: '구토와 기력 저하', symptoms: ['구토', '기력 저하'], guidance: '응급 신호를 우선 안내했던 기록이에요. 상태가 이어지면 가까운 동물병원에 연락하세요.', hospital: '사랑 동물병원 · 군산시 · 1.6km' },
  { id: 'record-maru-02', petId: 'pet-demo-maru', date: '2026.05.18', status: 'general', input: '사료를 남기는 날이 늘었지만 물은 잘 마셔요.', summary: '식욕 변화', symptoms: ['식욕 감소', '음수량 정상'], guidance: '식사량 변화를 며칠간 기록해 병원 문의 시 전달해 주세요.', hospital: '방문 전 전화 확인이 필요해요.' },
  { id: 'record-maru-03', petId: 'pet-demo-maru', date: '2026.03.22', status: 'general', input: '낯선 소리에 평소보다 오래 숨는 모습이었어요.', summary: '행동 변화 관찰', symptoms: ['행동 변화'], guidance: '환경 변화와 함께 나타난 행동인지 관찰해 주세요.', hospital: '방문 전 전화 확인이 필요해요.' },
]

export function getDemoHealthRecords(petId) { return DEMO_HEALTH_RECORDS.filter((record) => record.petId === petId) }

export const DEMO_SAVED_PLACES = [
  { id: 'hospital-sun', kind: 'hospital', name: '햇살 동물병원', area: '군산시', distance: '2.1km', tags: ['야간 진료'], note: '방문 전 전화로 진료 가능 여부를 확인해 주세요.' },
  { id: 'hospital-love', kind: 'hospital', name: '사랑 동물병원', area: '군산시', distance: '1.6km', tags: ['응급 진료'], note: '방문 전 전화로 진료 가능 여부를 확인해 주세요.' },
  { id: 'facility-play', kind: 'facility', name: '군산 휴게소 반려동물 놀이터', area: '군산시 성산면', distance: '군산 예시', tags: ['24시간', '반려동물 놀이터'], status: '동반 가능 확인 시설', note: '이용 전 운영 상태와 동반 규칙을 확인해 주세요.' },
  { id: 'facility-rail', kind: 'facility', name: '경암동 철길마을', area: '군산시 경촌4길', distance: '군산 예시', tags: ['관광 참고'], status: '산책 참고 장소', note: '반려동물 동반 가능 여부를 방문 전 확인해 주세요.' },
  { id: 'facility-wetland', kind: 'facility', name: '금강습지생태공원', area: '군산시 성산면', distance: '군산 예시', tags: ['야외 공간'], status: '산책 참고 장소', note: '반려동물 동반 가능 여부를 방문 전 확인해 주세요.' },
]

// 본선 데모 전용 개인 기록 fixture입니다. 실제 영수증·처방 원본과 자동 의료 판단은 포함하지 않습니다.
export const DEMO_MEDICAL_VISITS = [
  { id: 'visit-ruby-20260803-01', petId: 'pet-demo-ruby', healthRouteId: 'record-ruby-01', facilityId: 'hospital-sun', occurredOn: '2026.08.03', status: 'guardian-reported', source: 'competition-demo', guardianMemo: '병원 방문 후 다음에 확인할 내용을 보호자 메모로 남긴 예시입니다.' },
]
export const DEMO_RECEIPTS = [
  { id: 'receipt-ruby-20260803-01', petId: 'pet-demo-ruby', visitId: 'visit-ruby-20260803-01', issuedOn: '2026.08.03', facilityId: 'hospital-sun', totalAmount: 48000, itemLabels: ['진찰', '검사'], attachmentRef: 'demo-receipt-preview', entryStatus: 'demo', source: 'competition-demo' },
]
export const DEMO_CARE_NOTES = [
  { id: 'care-note-ruby-20260803-01', petId: 'pet-demo-ruby', visitId: 'visit-ruby-20260803-01', recordedOn: '2026.08.03', source: 'competition-demo', text: '병원에서 들은 다음 확인 사항을 보호자가 직접 옮겨 적은 데모 메모입니다.' },
]
export const DEMO_CARE_SCHEDULES = [
  { id: 'schedule-ruby-20260810-01', petId: 'pet-demo-ruby', sourceType: 'visit', sourceId: 'visit-ruby-20260803-01', type: 'follow-up', title: '경과 다시 확인하기', scheduledOn: '2026.08.10', reminderSetting: '3-days', status: 'planned', guardianNote: '', source: 'competition-demo' },
]

export function getDemoVisitByRouteId(healthRouteId) { return DEMO_MEDICAL_VISITS.find((visit) => visit.healthRouteId === healthRouteId) ?? null }
export function getDemoReceiptByVisitId(visitId) { return DEMO_RECEIPTS.find((receipt) => receipt.visitId === visitId) ?? null }
export function getDemoCareNoteByVisitId(visitId) { return DEMO_CARE_NOTES.find((note) => note.visitId === visitId) ?? null }
export function getDemoScheduleBySourceId(sourceId) { return DEMO_CARE_SCHEDULES.find((schedule) => schedule.sourceId === sourceId) ?? null }

export function getDemoFacility(id) { return DEMO_SAVED_PLACES.find((place) => place.id === id) ?? null }
export function getDemoMedicalTimeline(petId) {
  const events = [
    ...getDemoHealthRecords(petId).map((route) => ({ eventId: `health-route:${route.id}`, kind: 'health-route', petId, eventOn: route.date, title: '건강 경로를 확인했어요', subtitle: `보호자 입력: ${route.summary}`, badge: route.status === 'urgent' ? { label: '응급 우선 안내', tone: 'urgent' } : { label: '표준 증상 확인', tone: 'general' }, sourceLabel: '보호자 입력 · 본선 데모', isDemo: true })),
    ...DEMO_MEDICAL_VISITS.filter((visit) => visit.petId === petId).map((visit) => ({ eventId: `visit:${visit.id}`, kind: 'visit', petId, eventOn: visit.occurredOn, title: '병원 방문 메모를 남겼어요', subtitle: '보호자가 직접 남긴 방문 기록', badge: { label: '방문 기록 예시', tone: 'general' }, sourceLabel: '본선 데모', isDemo: true, visitId: visit.id })),
    ...DEMO_RECEIPTS.filter((receipt) => receipt.petId === petId).map((receipt) => ({ eventId: `receipt:${receipt.id}`, kind: 'receipt', petId, eventOn: receipt.issuedOn, title: '진료비 영수증을 보관했어요', subtitle: `개인 기록 ${receipt.totalAmount.toLocaleString('ko-KR')}원 · 데모`, badge: { label: '영수증 예시', tone: 'general' }, sourceLabel: '본선 데모', isDemo: true, visitId: receipt.visitId })),
    ...DEMO_CARE_NOTES.filter((note) => note.petId === petId).map((note) => ({ eventId: `care-note:${note.id}`, kind: 'care-note', petId, eventOn: note.recordedOn, title: '병원 안내 메모를 적었어요', subtitle: '보호자가 직접 입력한 메모', badge: { label: '보호자 메모', tone: 'general' }, sourceLabel: '본선 데모', isDemo: true, visitId: note.visitId })),
    ...DEMO_CARE_SCHEDULES.filter((schedule) => schedule.petId === petId).map((schedule) => ({ eventId: `schedule:${schedule.id}`, kind: 'schedule', petId, eventOn: schedule.scheduledOn, title: '다음 확인 일정을 등록했어요', subtitle: `${schedule.scheduledOn} · ${schedule.title}`, badge: { label: '일정 예시', tone: 'general' }, sourceLabel: '본선 데모', isDemo: true, sourceId: schedule.sourceId })),
  ]
  return events.sort((a, b) => a.eventOn.localeCompare(b.eventOn) || a.eventId.localeCompare(b.eventId))
}
