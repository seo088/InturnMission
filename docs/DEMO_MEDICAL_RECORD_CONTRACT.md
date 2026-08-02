# 본선 데모 개인 건강 기록 계약

개인 기록은 보호자가 직접 남기는 관리 정보이며, 공공 진료비 참고 데이터와 분리한다.

## 엔터티 연결

`petId`는 모든 기록에 필수다. 방문 기록은 선택적으로 `healthRouteId`, 영수증과 병원 안내 메모는 `visitId`, 일정은 `sourceType`과 `sourceId`만 참조한다. 표시 이름으로 관계를 연결하지 않는다.

## 제외 필드

`diagnosis`, `diseaseProbability`, `recommendedDose`, `dosage`, `treatmentPlan`, `medicalClearance`는 저장하거나 표시하지 않는다.

## 실제 서버 전환 API

- `GET/POST /pets/{petId}/medical-records`
- `PATCH/DELETE /medical-records/{recordId}`
- `POST/GET/DELETE /medical-records/{recordId}/attachments`

서버는 로그인 사용자, 반려동물 소유 권한, 기능 권한, 파일 형식·크기·악성코드 검사, 접근·삭제 로그를 검사한다. 원본 파일은 공개 URL로 제공하지 않는다.
