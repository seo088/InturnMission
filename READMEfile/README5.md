# 애니멀루 (AnimalLoo) 웹사이트 구현 현황

> 마지막 업데이트: 2026-05-30

---

## 현재 실행 환경

```
React 프론트엔드   → localhost:5180
FastAPI 백엔드    → localhost:8000
Apache Jena Fuseki → localhost:3030  (약 170만 트리플)
```

> 세 프로세스 모두 로컬 PC에서 실행 중. PC 종료 시 중단됨.

---

## 구현 완료

### 백엔드 API (FastAPI)

| 엔드포인트 | 설명 | 상태 |
|---|---|---|
| GET /api/dashboard/stats | 전체 시설 수, 동물 수, 트리플 수 | ✅ 실 SPARQL |
| GET /api/dashboard/region-stats | 시도별 시설 TOP 분포 | ✅ 실 SPARQL |
| GET /api/dashboard/dataset-types | 데이터셋 유형 분포 (API/CSV) | ✅ |
| GET /api/datasets | 14종 데이터셋 목록 | ✅ |
| GET /api/kg/nodes | 지식그래프 노드 목록 + 건수 | ✅ 실 SPARQL |
| GET /api/kg/edges | 지식그래프 엣지 목록 + 건수 | ✅ 실 SPARQL |
| GET /api/quality/metrics | 데이터 품질 5개 지표 | ✅ 실 SPARQL |

### 프론트엔드 페이지

| 페이지 | 경로 | 구현 수준 |
|---|---|---|
| Dashboard | `/` | ✅ 실데이터 연동 완료 |
| 데이터셋 | `/datasets` | ✅ 실데이터 연동 완료 |
| 지식그래프 | `/kg` | ✅ 실데이터 연동 완료 |
| 매핑테이블 | `/mapping` | ✅ 문서 역할 (하드코딩 유지) |
| 포스터 | `/poster` | ✅ 포스터 역할 (하드코딩 유지) |

### 지식그래프 엣지 (CROSS_EDGES 15개)

| 엣지 | 연결 | 트리플 수 |
|---|---|---|
| treatedAt | 질병 → 동물병원 | - |
| hasSymptom | 질병 → 증상 | 58개 |
| indicatesDisease | 증상 → 질병 | 58개 |
| matchingCandidate | 구조동물 ↔ 분실동물 | - |
| protectedBy | 구조동물 → 보호센터 | 14,645개 |
| foundAt | 구조동물 → 행정구역 | 17,798개 |
| locatedIn | 시설 → 행정구역 | 35,547개 |
| matchingGrade | 분실동물 → 구조동물 | 2,884개 |
| possibleMatch | 분실동물 ↔ 구조동물 | 20,553개 |
| trackedAs | 등록동물 → 구조동물 | - |
| lostNear | 분실동물 → 행정구역 | - |
| nearShelter | 분실동물 → 보호센터 (시도 매칭) | 81,775개 |
| nearbyHospital | 보호센터 → 인근 동물병원 (5km) | 10,088개 |
| affectsSpecies | 질병 → 동물 종 (개/고양이) | 18개 |
| rdf:type | 보호센터 → 시설 레이어 | - |

### Dashboard 주요 지표 (실데이터)

| 지표 | 수치 |
|---|---|
| 의료·케어 시설 수 | 35,146개 |
| 동물 등록 개체 | 15,240개 |
| 동반·문화 시설 | 330개 |
| RDF 트리플 | 약 170만개 |
| 연동 데이터셋 | 14개 |

### 데이터 품질 지표 (실 SPARQL)

| 지표 | 수치 |
|---|---|
| 좌표 완전성 (schema:geo) | 100% |
| 주소 완전성 (def:address) | 100% |
| 보호센터 FK 연결율 | 96.1% |
| 분실동물 A등급 매칭율 | 23.9% |
| 증상-질병 링크 보유율 | 4.3% ⚠️ |

---

## 잔존 이슈

| 이슈 | 심각도 | 설명 |
|---|---|---|
| 중복 클래스 네임스페이스 | 🟠 | `koah/def/`와 `animalloo.kr/ontology#` 혼재 → 같은 클래스가 두 개로 집계됨 |
| 증상-질병 링크 부족 | 🟠 | 516개 증상 중 4.3%만 질병과 연결됨 |
| CareRegNo deadlink 10.7% | 🟠 | 구조동물↔보호센터 FK 불일치 |
| quality 라우터 일부 0% | 🟡 | 일부 SPARQL 쿼리 결과 0 반환 (속성명 불일치 가능성) |
| PC 종료 시 서비스 중단 | 🔴 | 서버 배포 필요 |

---

## 추후 할 것

### 1순위 — 서버 배포

- [ ] 서버 접속 복구 확인
- [ ] Fuseki, FastAPI, React 빌드 파일 서버에 배포
- [ ] `.env` 파일 서버 환경에 맞게 설정
- [ ] 외부 URL로 접속 가능하도록 포트 설정

### 2순위 — 데이터 품질 개선

- [ ] 증상-질병 링크 강화 (ds14 QA 25건 파싱 → indicatesDisease 트리플 추가)
- [ ] 중복 네임스페이스 정리 (koah/def/ 통일)
- [ ] CareRegNo FK reconciler (deadlink 10.7% 해결)
- [ ] centroid_fallback 재지오코딩 (병원 25%, 약국 27%)

### 3순위 — 프론트엔드 기능 추가

- [ ] 지도 마커 표시 (카카오맵 API 연동)
  - 동물병원, 보호센터 등 카테고리별 마커
  - 클릭 시 상세 정보 패널
- [ ] 반려동물 동반 조건 필터 UI
  - 크기 제한, 실내/실외 여부, 리드줄 필요 여부 필터
- [ ] 분실동물 신고 화면
  - 신고 입력 폼
  - 매칭 결과 (A/B/C 등급) 출력
- [ ] 구조동물 열람 화면
  - 품종, 지역, 성별 필터
  - 보호센터 연결 정보
- [ ] 증상 선택 → 질병 정보 출력 화면
  - 증상 선택 UI
  - 관련 질병 정보 + 인근 동물병원 목록

### 4순위 — 추가 연결 작업

- [ ] 반려동물 동반가능시설 → 인근 동물병원 (def:nearbyHospital)
- [ ] 문화시설·관광지 → 인근 보호센터 (def:nearShelter)

### 5순위 — 코드 정리

- [ ] ds01~05 빌더 완성 (파이프라인 재현성 확보)
- [ ] ds07 TravelSpot API 캐시 생성
- [ ] VetDepartment 한글 라벨 추가

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| 프론트엔드 | React, Vite, TanStack Query, D3.js |
| 백엔드 | FastAPI, Python 3.13 |
| 그래프 DB | Apache Jena Fuseki (SPARQL 1.1) |
| RDF | Turtle (.ttl), OWL2, RDFS, SKOS |
| 전처리 | pandas, pyproj, rdflib |
| 지도 | Kakao Map API (미연동) |

# 2026-05-30 작업 일지

---

## 환경 구축 및 백엔드 연동

### FastAPI 실행 환경 복구
- uvicorn, httpx, pydantic-settings 등 누락 패키지 설치
- `backend/app/main.py` 실행 경로 문제 해결 (`backend` 폴더 내에서 실행)
- `graphdb.py` Fuseki 포트 3031 → 3030 수정
- `config.py` FUSEKI_URL 설정 추가 및 `.env` 파일 생성

### 네임스페이스 불일치 수정
- Fuseki 실제 네임스페이스 확인 (`https://knowledgemap.kr/koah/def/`)
- `dashboard.py`, `knowledge_graph.py` PREFIX 전면 수정
- 중복 노드 합산 처리 (같은 id는 count 합산)

---

## API 실데이터 연동

| 엔드포인트 | 수정 내용 |
|---|---|
| `/api/dashboard/stats` | facility_count 전체 시설 합산 (병원+약국+미용+위탁+장묘), rdf_triple_count 실 SPARQL |
| `/api/dashboard/region-stats` | URI 파싱 수정 → 시도명 추출 |
| `/api/kg/nodes` | PREFIX 수정, 중복 노드 합산 |
| `/api/kg/edges` | PREFIX 수정 |
| `/api/quality/metrics` | 하드코딩 mock → 실 SPARQL 5개 지표 |

### 품질 지표 최종값
| 지표 | 수치 |
|---|---|
| 좌표 완전성 (schema:geo) | 100% |
| 주소 완전성 (def:address) | 100% |
| 보호센터 FK 연결율 | 96.1% |
| 분실동물 A등급 매칭율 | 23.9% |
| 증상-질병 링크 보유율 | 4.3% |

---

## 프론트엔드 실데이터 연동

| 컴포넌트 | 수정 내용 |
|---|---|
| `StatCards.jsx` | 하드코딩 수치 제거, rdf_triple_count 실데이터 표시, 동물보호센터 라벨 수정 |
| `KoreaMap.jsx` | 하드코딩 도시 → useRegionStats 실데이터 버블 지도 |
| `KnowledgeGraph.jsx` | useKGNodes 실데이터 연동, CROSS_EDGES 3개 추가 |
| `Dashboard.jsx` | 전처리 통계 카드 추가 (논문 표 1 수치 반영) |

---

## 지식그래프 엣지 추가

| 엣지 | 스크립트 | 트리플 수 | Fuseki 업로드 |
|---|---|---|---|
| 보호센터 → 인근 동물병원 (5km) | `nearby_hospital.py` | 10,088개 | ✅ |
| 질병 → 동물 종 (개/고양이) | `disease_species.py` | 18개 | ✅ |
| 분실동물 → 인근 보호센터 (시도 매칭) | `lost_shelter.py` | 81,775개 | ✅ |

---

## 논문 연계 UI 수정

### 데이터 수치 반영
- Dashboard 전처리 통계 카드 추가:
  - 수집 원본: 272,221건
  - 유효 레코드: 55,688건
  - 데이터 손실률: 79.6%
  - 개체 연결 등급: A 767 · B 2,189 · C 7
- RDF 트리플 169만으로 올바르게 표시

### 시나리오 페이지 신규 구현 (`/scenario`)
탭 1 — 증상 → 병원 추천 (SPARQL 추론 체인 실데이터 연동)
- 증상 선택 → 질병 추론 → 인근 병원 추천 3단계 플로우
- `/api/scenario/symptoms`: 질병과 연결된 실제 증상 12개 반환
- `/api/scenario/infer`: 증상 URI → 질병 추론 + 병원 추천

탭 2 — 시설 지도 (Leaflet.js + OpenStreetMap)
- 동물병원, 동물약국, 문화시설, 장묘시설, 보호센터, 위탁관리 카테고리 필터
- `/api/scenario/map-facilities`: 카테고리별 실좌표 시설 최대 300개 반환
- react-leaflet@4.2.1 (React 18 호환 버전) 설치

---

## 신규 백엔드 파일

- `backend/app/routers/scenario.py` 신규 생성
  - `/api/scenario/symptoms`
  - `/api/scenario/infer`
  - `/api/scenario/hospitals-map`
  - `/api/scenario/map-facilities`
- `backend/app/main.py` scenario 라우터 등록

---

## 신규 프론트엔드 파일

- `frontend/src/pages/Scenario.jsx` 신규 생성 (탭 구조)
- `frontend/src/App.jsx` `/scenario` 라우트 추가
- `frontend/src/components/layout/Sidebar.jsx` 추론 시나리오 메뉴 추가

---

## 현재 실행 환경

```
React 프론트엔드   → localhost:5180
FastAPI 백엔드    → localhost:8000
Apache Jena Fuseki → localhost:3030
```

총 RDF 트리플: 약 169만개 (1,688,569개)

---

## 잔존 이슈

| 이슈 | 설명 |
|---|---|
| 중복 클래스 네임스페이스 | `koah/def/`와 `animalloo.kr/ontology#` 혼재 |
| 증상-질병 링크 부족 | 4.3%만 연결됨 |
| 장묘/문화시설 클래스명 불일치 | `Cremation` vs `AnimalCremation`, `CultureFacility` vs `CulturalFacility` |
| 시나리오 병원 추천 지역 편향 | nearbyHospital이 대구 보호센터 기반이라 대구 병원만 나옴 |