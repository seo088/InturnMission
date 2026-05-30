# 🐾 애니멀루 (AnimalLoo)

> 공공데이터 기반 반려동물 통합 지식그래프 플랫폼

---

## 📌 프로젝트 개요

6개 공공기관에서 제공하는 14종의 이기종 반려동물 관련 공공 데이터를 수집·정제하여 RDF/OWL 지식그래프를 구축하고, 이를 기반으로 반려동물 케어 통합 서비스를 제공하는 플랫폼.

**핵심 기여:**
- 이기종 좌표계 통합 전처리 파이프라인 (EPSG:5174 → WGS84)
- 영업 상태 코드 기반 유효 레코드 필터링
- 3단계 계층적 분실·구조 동물 RFID 매칭 (A/B/C 등급)
- 증상→질병→진료과목 추론 체인 (58개 경로)
- 838,980 트리플 규모의 반려동물 케어 도메인 지식그래프

> **논문 제출 완료 (2026-05-xx)**
> 현재는 데모 서비스 구현을 위한 개발 단계로 전환됨.

---

## 📊 현재 전체 완성도: 약 72%

> README3/4 기준 상태와 실제 코드 비교 후 수정됨 (2026-05-29)

| 차원 | 점수 | 가중치 | 상태 |
|------|------|--------|------|
| 데이터 수집 | 90% | 15% | ✅ 양호 |
| 행 단위 전처리 | 96% | 20% | ✅ 양호 |
| 좌표 품질 | 65% | 15% | ⚠️ fallback 25% |
| KG 빌더 구현 | 85% | 20% | ✅ 대부분 구현 완료 |
| 데이터 품질·연결성 | 45% | 30% | 🟠 FK 링크 일부 미완성 |
| **종합** | **약 72%** | | |

---

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| 언어 | Python 3.11, JavaScript (React/JSX) |
| RDF | RDF/Turtle, OWL2, RDFS, SKOS |
| 트리플스토어 | Apache Jena Fuseki |
| 질의 언어 | SPARQL 1.1 |
| 전처리 | pandas, pyproj, rdflib |
| 프론트엔드 | React (하드코딩 목업 상태 → 실데이터 연동 예정) |
| 백엔드 | FastAPI (dashboard/datasets/kg/quality 4개 라우터 구현됨) |
| 서버 환경 | Linux (Ubuntu), `/home/hong/petgraph/` |
| 지도 | Kakao Map API (지오코딩 현재 비활성) |
| 공공 API | 공공데이터포털 14종 |

---

## 📁 데이터셋 현황

> 실제 코드 확인 후 빌더 상태 수정됨 (2026-05-29)

| ID | 클래스 | 원본 레코드 | 유효 레코드 | 빌더 상태 | 좌표 품질 |
|----|--------|------------|------------|---------|---------|
| 01 | AnimalHospital | 10,475 | 5,373 | ✅ 구현 (FacilityBuilder 상속) | 75% (25% fallback) |
| 02 | Pharmacy | 19,908 | 13,054 | ✅ 구현 (FacilityBuilder 상속) | 73% (27% fallback) |
| 03 | Grooming | 15,432 | 10,814 | ✅ 구현 (FacilityBuilder 상속) | 추정 유사 |
| 04 | Boarding | 9,618 | 5,821 | ✅ 구현 (FacilityBuilder 상속) | 추정 유사 |
| 05 | Cremation | 99 | 84 | ✅ 구현 (FacilityBuilder 상속) | 60% (40% fallback) |
| 07 | TravelSpot | — | — | ✅ 구현 (2단계 fetch+build) | ⚠️ 캐시 파일 없으면 빈 output |
| 08 | AbandonedAnimal | 15,241 | 15,240 | ✅ 구현 | — |
| 09 | LostAnimal | 2,963 | 2,884 | ✅ 구현 + F1 버그 수정 완료 | — |
| 10 | AnimalShelter | 330 | 330 | ✅ 구현 | 95% |
| 11 | CultureFacility | ~70,650 | 67 | ✅ 구현 (FacilityBuilder 상속) | 100% |
| 12 | RestArea | 20 | 20 | ✅ 구현 (FacilityBuilder 상속) | 미제공 |
| 13 | Symptom | 516 | 516 | ✅ 구현 | — |
| 14 | VetQA | 25 | 25 | ✅ 구현 | — |
| 15 | Disease | 116 → **13** | 13 | ✅ 구현 (개\|고양이\|견\|묘 필터 적용) | — |
| 16 | ReasoningChain | — | 58 경로 | ✅ 구현 | — |
| **합계** | | | | | **838,980 트리플** |

> ds09 F1 버그: composite key에 HappenDate/RfidCode 추가 → 2,963→12 손실 문제 해결됨.

---

## ✅ 완료된 작업

### Phase 1 — 데이터 수집 및 명세 분석
- [x] 공공 API 14종 명세 분석
- [x] 인증키 통합 관리
- [x] 좌표계 이슈 파악 (Bessel TM vs WGS84)
- [x] 데이터 품질 사전 평가

### Phase 2 — 원본 데이터 수집 및 구조화
- [x] 시설 데이터 5종 수집 (병원·약국·미용·위탁·장묘)
- [x] 유실·구조동물 데이터 수집
- [x] 의료 지식 데이터 수집 (증상·질병·QA)
- [x] 매핑테이블 완성본 산출

### Phase 3 — RDF 온톨로지 설계
- [x] 18개 클래스 정의
- [x] URI 정책 수립 (`http://knowledgemap.kr/def/animal/`)
- [x] 네임스페이스 전략 수립
- [x] 증상→질병→진료과목 추론 체인 설계 (58개 경로)

### Phase 4 — UI 목업 제작
- [x] 지도 핀맵 UI
- [x] 시설 상세 정보 패널
- [x] 관리자 대시보드

### Phase 5 — TTL 빌드 및 Fuseki 적재
- [x] 총 트리플 838,980건 적재 완료
- [x] 16개 named graph 구성
- [x] ISO/IEC 25012 품질 평가 → A− 등급

### Phase 6 — 빌더 및 백엔드 구현 (실제 확인 완료)
- [x] FacilityBuilder 상속 구조로 ds01~05, ds11, ds12 빌더 완성
- [x] ds07 TravelSpot 빌더 구현 (2단계 fetch+build 방식)
- [x] ds09 F1 버그 수정 (composite key 개선)
- [x] ds15 반려동물 필터 적용 (116→13개)
- [x] FastAPI 백엔드 4개 라우터 구현 (dashboard / datasets / kg / quality)
- [x] Pydantic 스키마 완성 (FacilityBase, DashboardStats, KGNode, KGEdge 등)
- [x] VetDepartment 한글 라벨 추가 (내과/외과/피부과/안과/치과)

---

## 🔴 현재 미완성 항목

### 1순위 — 데이터 파이프라인 복원 (빌드 불가 상태)

#### [ ] 데이터 파일 서버 → 로컬 동기화
- **심각도**: 🔴 치명적
- **현황**: `csv_data/`, `preprocessed_data/`, `turtle/`, `cleaned_2차/` 디렉토리가 로컬에 없음
- **영향**: 빌더 코드가 완성돼도 실제 빌드 불가
- **방법**: 서버 `/home/hong/petgraph/` 에서 로컬로 rsync

```bash
rsync -avz hong@서버주소:/home/hong/petgraph/csv_data/ ./csv_data/
rsync -avz hong@서버주소:/home/hong/petgraph/preprocessed_data/ ./preprocessed_data/
```

#### [ ] ds07 TravelSpot API 캐시 생성
- **현황**: `07_travel.json` 캐시 파일 없음 → 빌더 실행 시 빈 output
- **방법**: 환경변수 설정 후 fetch 스크립트 실행

```bash
export PETGRAPH_TOURAPI_KEY=발급받은_키
python -m backend.kg.fetch ds07
```

#### [ ] 전체 빌드 파이프라인 실행
- 데이터 파일 동기화 완료 후

```bash
python -m backend.kg.cli build all
```

---

### 2순위 — KG 연결성 강화

#### [ ] ds09 분실↔구조 동물 FK 링크 완성
- **현황**: `matchingGrade` 속성은 LostAnimal에 붙어 있으나 AbandonedAnimal URI로의 `def:possibleMatch` / `owl:sameAs` 객체 링크 없음
- **파일**: `ds09_lost.py`
- **방법**: `match_composite_key` 컬럼으로 AbandonedAnimal URI를 조회해 트리플 추가

```python
# ds09_lost.py 수정
if row['matching_grade'] == 'A':
    abandoned_uri = get_abandoned_uri(row['match_composite_key'])
    g.add((lost_uri, OWL.sameAs, abandoned_uri))
    g.add((lost_uri, DEF.possibleMatch, abandoned_uri))
    g.add((lost_uri, DEF.matchingGrade, Literal("A")))
elif row['matching_grade'] == 'B':
    abandoned_uri = get_abandoned_uri(row['match_composite_key'])
    g.add((lost_uri, DEF.possibleMatch, abandoned_uri))
    g.add((lost_uri, DEF.matchingGrade, Literal("B")))
```

#### [ ] ds13↔ds15 증상-질병 링크 데이터 기반으로 강화
- **현황**: `def:indicatesDisease` 트리플이 ds16에서 하드코딩 딕셔너리로 생성됨. ds14 QA 25건 파싱은 미적용
- **방법**: ds14 QA 텍스트에서 증상 코드·질병명 추출 → `def:indicatesDisease` 트리플 보강

---

### 3순위 — 코드 품질

#### [ ] dqa.py 네임스페이스 수정
- **현황**: `dqa.py:20` 에서 `https://knowledgemap.kr/koah/def/` 사용
- **전체 표준**: `http://knowledgemap.kr/def/animal/`
- **방법**: `dqa.py` 20번째 줄 네임스페이스 1줄 수정

```python
# 수정 전
KOAH = Namespace("https://knowledgemap.kr/koah/def/")
# 수정 후
DEF = Namespace("http://knowledgemap.kr/def/animal/")
```

#### [ ] quality 라우터 실 SPARQL 연동
- **현황**: `/api/quality/metrics`가 실 SPARQL 없이 mock 값 반환
- **방법**: Fuseki 엔드포인트로 실제 품질 지표 쿼리 연동

---

### 4순위 — 프론트엔드 실데이터 연동

#### [ ] SPARQL 엔드포인트 외부 노출
- Fuseki를 외부에서 접근 가능하도록 설정 또는 FastAPI 프록시 경유

#### [ ] React 실데이터 연동
- 하드코딩 목업 → FastAPI `/api/*` 실제 호출로 교체
- 지도 마커, 시설 상세, 분실동물 매칭 결과, 증상 선택 화면 순으로 연동

---

## 🐛 잔존 이슈

| 이슈 | 심각도 | 원인 | 해결 방향 |
|------|--------|------|---------|
| 데이터 파일 전부 로컬 부재 | 🔴 치명적 | 서버-로컬 미동기화 | rsync로 서버에서 로컬 복사 |
| ds07 캐시 파일 없음 | 🔴 | `07_travel.json` 미생성 | API 키 설정 후 fetch 실행 |
| ds09 possibleMatch/sameAs 링크 없음 | 🟠 | ds09 빌더에서 FK 연결 미완성 | `ds09_lost.py` 수정 |
| dqa.py 네임스페이스 혼재 | 🟠 | `koah/def/` vs `def/animal/` | `dqa.py:20` 1줄 수정 |
| CareRegNo deadlink 10.7% | 🟠 | ds08↔ds10 정규화 방식 차이 | FK reconciler 스크립트 작성 |
| quality 라우터 mock 값 반환 | 🟡 | 실 SPARQL 미연동 | Fuseki 질의 연동 |
| centroid_fallback 25% (병원·약국) | 🟡 | Bessel 변환 실패 시 시군구 중심점 대체 | 카카오 Geocoding API 재지오코딩 |
| CultureFacility collapse 32% | 🟡 | 원천 CSV에 시설 식별자 없음 | 시설명+좌표 복합키 URI 전략 적용 |

---

## 📚 논문 현황

> **제출 완료** — 이하 항목은 기록 목적으로 유지

| 섹션 | 상태 |
|------|------|
| 요약 / Abstract | ✅ 완료 |
| Ⅰ. 서론 | ✅ 완료 |
| Ⅱ. 관련 연구 | ✅ 완료 |
| Ⅲ. 본론 (3.1~3.5) | ✅ 완료 |
| Ⅳ. 결론 및 향후 연구 | ✅ 완료 |
| 참고문헌 | ✅ 완료 |

---

## 🗺 온톨로지 설계 요약

**네임스페이스**

| 접두어 | URI | 용도 |
|--------|-----|------|
| `def:` | `http://knowledgemap.kr/def/animal/` | 스키마 정의 |
| `data:` | `http://knowledgemap.kr/data/` | 인스턴스 |
| `schema:` | `https://schema.org/` | 외부 공개 어휘 |
| `owl:` | `http://www.w3.org/2002/07/owl#` | OWL2 |
| `skos:` | `http://www.w3.org/2004/02/skos/core#` | 어휘 매핑 |

> ⚠️ `dqa.py`에서 `koah/def/` 혼용 중. 전체 통일 필요.

**URI 패턴**

```
data:facility/hospital/{MNG_NO}
data:facility/shelter/{CareRegNo}
data:animal/rescue/{DesertionNo}
data:animal/lost/{RfidCode 또는 복합키}
data:medical/symptom/{SymptomCode}
data:medical/disease/{DiseaseNo}
data:region/{SidoCode}/{SigunguCode}
```

**주요 추론 체인**

```
증상 입력
  → def:belongsTo → SymptomCategory
  → def:indicatesDisease → Disease  ← 현재 하드코딩 딕셔너리 기반
  → 질병 정보 출력 + 인근 AnimalHospital 위치 안내

분실동물 RFID
  → owl:sameAs (A등급) → AbandonedAnimal  ← FK 링크 미완성
  → def:protectedBy → AnimalShelter
  → 보호소 위치 및 연락처 안내
```

---

## 🔧 로컬 개발 환경 설정

### 1. Python 의존성 설치

```bash
pip install pandas pyproj rdflib requests fastapi uvicorn
```

### 2. 데이터 파일 동기화 (최초 1회)

```bash
rsync -avz hong@서버주소:/home/hong/petgraph/csv_data/ ./csv_data/
rsync -avz hong@서버주소:/home/hong/petgraph/preprocessed_data/ ./preprocessed_data/
rsync -avz hong@서버주소:/home/hong/petgraph/turtle/ ./turtle/
```

### 3. Apache Jena Fuseki 실행

```bash
./fuseki-server --update --mem /ds
# 접속: http://localhost:3030
```

### 4. 전체 빌드 파이프라인 실행

```bash
python -m backend.kg.cli build all
python upload_to_fuseki.py --endpoint http://localhost:3030/ds
```

### 5. FastAPI 백엔드 실행

```bash
uvicorn backend.main:app --reload --port 8000
# API 문서: http://localhost:8000/docs
```

### 6. SPARQL 질의 테스트

```bash
curl -X POST http://localhost:3030/ds/sparql \
  -H "Content-Type: application/sparql-query" \
  -d "SELECT * WHERE { ?s a <http://knowledgemap.kr/def/animal/AnimalHospital> } LIMIT 10"
```

---

## 🔐 보안 규칙 (Notion 교수님 지침)

- API 키 하드코딩 금지
- 인증키는 반드시 `.env` 파일로 관리
- `.env` 파일은 `.gitignore`에 포함

```bash
# .env 예시
KAKAO_MAP_API_KEY=your_key_here
PUBLIC_DATA_API_KEY=your_key_here
PETGRAPH_TOURAPI_KEY=your_key_here
FUSEKI_ENDPOINT=http://localhost:3030/ds
```

---

## 📋 팀 정보

- **팀명**: 7조
- **프로젝트명**: 애니멀루 (AnimalLoo)
- **지도교수**: 김장원
- **서버 경로**: `/home/hong/petgraph/`
- **마지막 업데이트**: 2026-05-29