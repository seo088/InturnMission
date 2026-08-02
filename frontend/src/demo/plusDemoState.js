export const DEMO_HEALTH_RECORDS = [
  { id: 'record-ruby-01', petId: 'pet-demo-ruby', date: '2026.08.02', status: 'general', input: '기침을 하고 평소보다 밥을 적게 먹는 것 같아요.', summary: '기침과 식욕 감소', symptoms: ['기침', '식욕 감소'], guidance: '기침이 이어지거나 식욕 저하가 심해지면 가까운 동물병원에 문의해 주세요.', hospital: '햇살 동물병원 · 군산시 · 2.1km' },
  { id: 'record-ruby-02', petId: 'pet-demo-ruby', date: '2026.04.03', status: 'general', input: '피부를 자주 긁고 귀 주변을 신경 쓰는 모습이에요.', summary: '피부 가려움', symptoms: ['피부 가려움', '귀 주변 불편'], guidance: '긁는 횟수와 피부 변화를 관찰해 병원 문의 시 함께 알려주세요.', hospital: '햇살 동물병원 · 군산시 · 2.1km' },
  { id: 'record-ruby-03', petId: 'pet-demo-ruby', date: '2026.02.17', status: 'general', input: '평소보다 산책 후 피곤해 보였지만 휴식 후에는 괜찮아졌어요.', summary: '활동량 변화 확인', symptoms: ['활동량 변화'], guidance: '증상이 반복되면 지속 시간과 함께 병원에 문의해 주세요.', hospital: '방문 전 전화 확인이 필요해요.' },
  { id: 'record-maru-01', petId: 'pet-demo-maru', date: '2026.06.11', status: 'urgent', input: '구토를 했고 기운이 없어 보여요.', summary: '구토와 기력 저하', symptoms: ['구토', '기력 저하'], guidance: '응급 신호를 우선 안내했던 기록이에요. 상태가 이어지면 가까운 동물병원에 연락하세요.', hospital: '사랑 동물병원 · 군산시 · 1.6km' },
  { id: 'record-maru-02', petId: 'pet-demo-maru', date: '2026.05.18', status: 'general', input: '사료를 남기는 날이 늘었지만 물은 잘 마셔요.', summary: '식욕 변화', symptoms: ['식욕 감소', '음수량 정상'], guidance: '식사량 변화를 며칠간 기록해 병원 문의 시 전달해 주세요.', hospital: '방문 전 전화 확인이 필요해요.' },
  { id: 'record-maru-03', petId: 'pet-demo-maru', date: '2026.03.22', status: 'general', input: '낯선 소리에 평소보다 오래 숨는 모습이었어요.', summary: '행동 변화 관찰', symptoms: ['행동 변화'], guidance: '환경 변화와 함께 나타난 행동인지 관찰해 주세요.', hospital: '방문 전 전화 확인이 필요해요.' },
]

export function getDemoHealthRecords(petId) { return DEMO_HEALTH_RECORDS.filter((record) => record.petId === petId) }
