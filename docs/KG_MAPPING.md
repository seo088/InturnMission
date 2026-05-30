# 데이터셋 → KG 매핑 명세

본 문서는 14개 공공 데이터셋(+ 추론체인 1)을 knowledgemap.kr 지식그래프로 전환하는 컬럼 단위 매핑을 정의한다.

> **검증 상태**: 2026-04-08 기준
> - ✅ 구현·검증 완료: **08, 16** (rdflib 파싱 + 시맨틱 카운트 통과)
> - 🟡 매핑 명세만: 01~05, 07, 09~15 (빌더 작성 P2 잔여)
>
> **표기**:
> `→` 객체 속성(URI), `:` 데이터 속성(literal), `▼` silent drop(의도적 미매핑), `⚠` 검토 필요

## 0. 공통 사항

### 0-1. Namespace (UK URI 101 / `docs/URI_POLICY.md`)
| Prefix | URI | 용도 |
|---|---|---|
| `def:`    | `https://knowledgemap.kr/koah/def/` | 클래스·속성 (온톨로지) |
| `id:`     | `https://knowledgemap.kr/koah/id/`  | 인스턴스 (실세계 사물) |
| `doc:`    | `https://knowledgemap.kr/koah/doc/` | 인스턴스 기술 문서 (303) |
| `set:`    | `https://knowledgemap.kr/koah/set/` | 컬렉션 |
| `schema:` | `https://schema.org/` | gender, image 등 표준 차용 |
| `dct:`    | `http://purl.org/dc/terms/` | modified (freshness) |

### 0-2. URI 발급 (`backend/kg/uri.py`)
- 모든 인스턴스 URI는 `mint(klass, key)` 단일 진입점 통과 (직접 문자열 조립 금지, CI grep 0건)
- slug 전략: ASCII(unidecode) → unicode fallback → `xSHA1[:6]` (3단 폴백, 결정성 보장)
- 등록부: `backend/kg/uri_registry.parquet` (append-only)

### 0-3. 검증 도구
- 결정성 회귀: `backend/tests/test_kg_core.py::test_ds16_reasoning_is_deterministic`
- 어휘 폐쇄: `backend.kg.vocab.assert_known()` 모든 신규 term 강제
- TTL 파싱: `python -c "from rdflib import Graph; Graph().parse('turtle/<id>.ttl', format='turtle')"`

---

## 1. 검증 과정에서 발견·수정된 결함 (2026-04-08)

| # | 영향 | 증상 | 원인 | 수정 |
|---|---|---|---|---|
| B1 | 🔴 HIGH | 모든 TTL이 rdflib 파싱 실패할 형태 — `@prefix rdf  <...>` (콜론 누락) | `prefixes.py` 의 f-string `{p:<7}` 가 prefix 이름만 7자 패딩 후 콜론 미부착 | `f"@prefix {(p+':'):<8}<{u}> ."` 로 수정 |
| B2 | 🔴 HIGH | Region URI 가 `id/animal/region///dad774` 형태 (슬래시 3중 + 의미 없는 sha) | `unidecode` 미설치 환경에서 ASCII slug 가 빈 문자열, `_key_string` 가 빈 슬러그를 그대로 join 후 sha 부착 | slug 3단 폴백 도입 (ASCII → unicode → `xSHA1[:6]`). 결과: `region/전북특별자치도/고창군` |
| B3 | 🟡 MED | `validate()` 가 한글 fallback URI 를 거짓 거부 | `_VALID_URI` 정규식이 `[a-z0-9\-/]` 만 허용 | `[\w\-/]` + `re.UNICODE` 로 확장 |
| B4 | 🟡 MED | `UpdateTime`, `EndReason` 컬럼 silent drop (DQA freshness 측정 불가) | ds08 매핑 누락 (legacy 도 누락) | `dct:modified`, `def:endReason` 추가 + vocab 등록 |

수정 후 재빌드 결과:
- `turtle/16_reasoning_chain.ttl`: 224 트리플 (sha1 `37d14e8b`)
- `turtle/08_abandoned_animal.ttl`: 329,389 트리플 / 15,240 AbandonedAnimal / 13,627 Dog · 1,504 Cat / 317 보호센터 · 224 region 외래키 정합

---

## 2. ds08 — 구조동물 (`AbandonedAnimal`) ✅

**소스**: `csv_data/08_구조동물_조회데이터.csv` (54 컬럼)
**빌더**: `backend/kg/builders/ds08_abandoned.py` · **그래프**: `urn:knowledgemap:08_abandoned_animal`

### 2-1. URI 패턴
```
id:abandoned/{slug(careRegNo)}/{slug(noticeNo)}
예) https://knowledgemap.kr/koah/id/abandoned/311300201300001/2025-00128
```
필터: `ProcessState == '보호중'` (전체 21만 → 15,241행)

### 2-2. 컬럼 매핑

| CSV 컬럼 | 매핑 | 비고 |
|---|---|---|
| NoticeNo | `def:noticeNo`: string | URI key 일부 |
| DesertionNo | `def:desertionNo`: string | |
| RfidCode | `def:rfidCode`: string | float→int 정규화 |
| HappenDate | `def:happenDate`: xsd:date | YYYYMMDD → YYYY-MM-DD |
| HappenPlace | `def:happenPlace`: string | |
| UpKindName | `rdf:type` 추가 (`def:Dog`/`def:Cat`) | "개"/"고양이"/기타 |
| KindName | `def:animalBreed`: string | |
| KindFullName | `def:kindFullName`: string | |
| ColorCode | `def:colorCode`: string | |
| Age | `def:birthYear` + `def:ageDetail` | "2024(2개월)" → 2024 / "2개월" (garbage 필터) |
| Weight | `def:weightKg`: float | "2.5(Kg)" → 2.5 |
| SexCode | `schema:gender`: string | M/F/U |
| NeuterYn | `def:neuterYn`: string | Y/N/U |
| SpecialMark | `def:specialMark`: string | |
| ProcessState | `def:processState`: "보호중" 고정 | 필터 후 모두 동일 |
| NoticeSDate | `def:noticeSDate`: xsd:date | |
| NoticeEDate | `def:noticeEDate`: xsd:date | |
| EndReason | `def:endReason`: string | **B4 수정**으로 추가 |
| Image1..Image8 | `schema:image`(첫번째) + `def:imageList`('|' join) | |
| VaccinationChk | `def:vaccinationChk`: string | |
| HealthChk | `def:healthChk`: string | |
| UpdateTime | `dct:modified`: string | **B4 수정**으로 추가 (freshness) |
| CareRegNo | URI key + `def:protectedBy → id:shelter/{careRegNo}` | 외부 키 |
| OrgNm/CareAddr | sido/sigungu 추출 → `def:foundAt → id:region/{sido}/{sgg}` | OrgNm 우선, fallback CareAddr |
| AdptnTitle | `def:adoptionTitle`: string | |
| AdptnTxt | `def:adoptionText`: string (200자 truncate) | |
| AdptnCondition | `def:adoptionCondition`: string | |
| **▼ UpKindCode** | drop | UpKindName 으로 충분 |
| **▼ KindCode** | drop | KindName 으로 충분 |
| **▼ SfeHealth, SfeSoci, EtcBigo** | drop | 자유텍스트, ds14 vetqa 와 중복 |
| **▼ CareNm, CareTel, CareAddr** | drop | `ds10_shelter` 가 정본 보유 (외래키만 유지) |
| **▼ AdptnSDate, AdptnEDate, AdptnImg** | drop | 입양 메타는 고도화 시 별도 노드 |
| **▼ SprtTitle..SprtTxt, SrvcTitle/Txt, EvntTitle/Txt/Img** | drop | 후원/이벤트는 KG 범위 외 |

### 2-3. 외래키 (cross-graph join)
- `def:protectedBy` → `urn:knowledgemap:10_shelter` (CareRegNo)
- `def:foundAt` → `urn:knowledgemap:00_regions` (sido/sigungu)
- `def:matchingCandidate` → `urn:knowledgemap:09_lost_animal` (P2 잔여, region/특징 매칭)

---

## 3. ds16 — 추론 체인 (Reasoning Chain) ✅

**소스**: `csv_data/15_동물질병_데이터.csv` + `csv_data/13_동물질병증상_데이터.csv` + 큐레이션 매핑
**빌더**: `backend/kg/builders/ds16_reasoning.py` · **그래프**: `urn:knowledgemap:16_reasoning`

### 3-1. 4단 추론 패턴

```
SymptomCategory  --def:mapsTo→            VetDepartment
Symptom          --def:indicatesDisease→  Disease    (역방향 def:hasSymptom)
Disease          --def:treatedByDept→     VetDepartment
VetDepartment    --def:treatsSympCategory→ SymptomCategory  (역방향)
VetDepartment    --def:handledBy→         def:AnimalHospital  (range)
```

### 3-2. URI 발급
| 클래스 | key | 예시 |
|---|---|---|
| `def:SymptomCategory` | `code` (a..l) | `id:symptom-category/h` |
| `def:VetDepartment` | `name` (internal/surgery/dermatology/ophthalmology/dentistry) | `id:department/internal` |
| `def:Symptom` | `code` (c001..) | `id:symptom/c038` |
| `def:Disease` | `no` (DiseaseNo) | `id:disease/97` |

### 3-3. 큐레이션 매핑 (코드 상수)
| 매핑 | 항목 수 | 출처 |
|---|---|---|
| `CATEGORY_TO_DEPT` | 12 (a~l → 5 진료과) | reasoning_chain.py 보존 |
| `DISEASE_SYMPTOM_MAP` | 13 질병 × 평균 5 증상 코드 | 큐레이션 |
| `DISEASE_DEPT_MAP` | 13 질병 → 진료과 | 큐레이션 |
| `DEPT_TO_CATS` | 5 진료과 → SymptomCategory 역매핑 | 큐레이션 |

### 3-4. 검증 결과
- 트리플 블록 160 / rdflib 파싱 224 트리플
- `test_ds16_reasoning_is_deterministic`: 두 번 빌드 → byte-identical PASS
- 큐레이션 매핑 변경 시 재실행으로 회귀

### 3-5. 검증 SPARQL
```sparql
PREFIX def: <https://knowledgemap.kr/koah/def/>
SELECT ?d ?dept WHERE {
  ?sym a def:Symptom ; def:indicatesDisease ?d .
  ?d   def:treatedByDept ?dept .
} LIMIT 10
```

---

## 4. P2 잔여 데이터셋 매핑 명세 (빌더 미구현)

각 항목은 **target class → URI key → 핵심 컬럼 → 외래키** 순.

### 4-1. ds01 동물병원 → `def:AnimalHospital`
- **CSV**: 17 cols — Name, Facility_ID, Category, BusinessStatus, BusinessStatusDetail, Sido, Sigungu, Dong, LotNumber, RoadAddress, PostalCode, lat, lon, PhoneNumber, LicenseDate, ClosingDate, LastUpdated
- **URI**: `id:hospital/{sido}/{sgg}/{slug(name)}`
- **매핑**: Name→`rdfs:label`, Sido/Sigungu→`def:locatedIn → id:region/...`, RoadAddress→`def:address`, PhoneNumber→`def:phone`, lat/lon→`schema:geo` (blank node), LicenseDate→`def:licenseDate xsd:date`, BusinessStatus→`def:businessStatus`, LastUpdated→`dct:modified`
- ▼ Drop: Facility_ID(내부), PostalCode(저우선), Dong/LotNumber(주소 분해 미사용)

### 4-2. ds02 동물약국 → `def:Pharmacy`
- **CSV**: 26 cols — 동물병원 + GroupCode, RightMemberSN, FloorArea, LotPostalCode, Reopen/SuspensionStart/EndDate
- **URI**: `id:pharmacy/{sido}/{sgg}/{slug(name)}`
- **매핑**: ds01 동일 + FloorArea→`def:floorAreaSqm xsd:decimal`, ReopenDate→`def:reopenDate`, SuspensionStart/End→`def:suspensionStart/End`
- ⚠ Sido/Sigungu 가 별도 컬럼임 — 02 전용 region resolver 동일 사용

### 4-3. ds03 미용업 → `def:Grooming`
- **CSV**: 25 cols — Name, Facility_ID, RightNumber, Category, BusinessStatusCode, LocationArea(통합주소), RoadAddress, lat, lon, PhoneNumber, License/Reopening/Closing/TempClosingStart/End...
- **URI**: `id:grooming/{sido}/{sgg}/{slug(name)}` (LocationArea 에서 sido/sgg 추출)
- **이슈**: Sido/Sigungu 분리 컬럼 없음 → ds08 의 `extract_sido/sigungu` 재사용 필요 (`backend/kg/region.py` 로 추출)

### 4-4. ds04 위탁관리 → `def:Boarding`
- **CSV**: 17 cols — ds01 + TaskType
- **URI**: `id:boarding/{sido}/{sgg}/{slug(name)}`
- **매핑**: ds01 동일 + TaskType→`def:taskType`

### 4-5. ds05 장묘업 → `def:Cremation`
- **CSV**: 16 cols — ds01 minus BusinessStatusDetail
- **URI**: `id:cremation/{sido}/{sgg}/{slug(name)}`
- **매핑**: ds01 그대로 (서브셋)

### 4-6. ds07 동반여행 → `def:TravelSpot`
- **소스**: API (`api_trans_csv.py`, KorPetTourService2)
- **URI**: `id:travel/{slug(name)}`
- **매핑**: title→`rdfs:label`, addr1→`def:address`, mapx/mapy→`schema:geo`, contentid→`dct:identifier`, overview→`rdfs:comment`
- **특이**: ETL 단계에서 API 결과를 `preprocessed_data/07_travel.csv` 로 정규화 후 빌더에 진입

### 4-7. ds09 분실동물 → `def:LostAnimal`
- **CSV**: 14 cols — RfidCode, HappenDate, HappenAddr, HappenAddrDtl, HappenPlace, OrgNm, KindCode, ColorCode, SexCode, Age, SpecialMark, Image, CallName, CallTel
- **URI**: `id:lost/{noticeNo}` ⚠ NoticeNo 컬럼 없음 → **대안**: `id:lost/{HappenDate}-{slug(CallTel)}` 또는 `xSHA1(row)`
- **외래키**: `def:foundAt → id:region/...` (HappenAddr), `def:matchingCandidate → AbandonedAnimal` (region+종+성별 일치)
- ⚠ CallTel 은 PII — 해시 후 등록부 보관, RDF 에는 미노출

### 4-8. ds10 보호센터 → `def:AnimalShelter`
- **CSV**: 28 cols — CareRegNo, CareNm, OrgNm, DivisionNm, SaveTrgtAnimal, CareTel, DataStdDt, DsignationDate, CareAddr, JibunAddr, lat, lng, Week*Stime/Etime(8개), CloseDay, VetPersonCnt, ..., TransCarCnt
- **URI**: `id:shelter/{CareRegNo}` (ds08 외래키와 정합)
- **매핑**: CareNm→`rdfs:label`, CareTel→`def:phone`, CareAddr→`def:address`, lat/lng→`schema:geo`, DsignationDate→`def:designatedDate`, SaveTrgtAnimal→`def:targetAnimal`, VetPersonCnt등→`def:staffVet`, `def:staffSpec`...
- **운영시간**: 8개 시간 컬럼 → 단일 `def:operatingHours` 문자열 또는 8개 별 속성 (정밀도 vs 단순성 트레이드오프 — 빌더 작성 시 결정)

### 4-9. ds11 문화시설 → `def:CultureFacility`
- **CSV**: 31 cols 한글 헤더 — 시설명, 시도/시군구/리/도로명, 위도/경도, 카테고리1/2/3, 반려동물 동반/제한 정보, 운영시간, 휴무일, 입장료, 주차, 홈페이지, 최종작성일
- **URI**: `id:culture/{시도}/{slug(시설명)}`
- **매핑**: 시설명→`rdfs:label`, 시도/시군구→`def:locatedIn`, 도로명주소→`def:address`, 위도/경도→`schema:geo`, 카테고리1→`def:category`, 반려동물동반정보→`def:petPolicy`, 입장료→`schema:price`, 홈페이지→`schema:url`, 최종작성일→`dct:modified`
- ⚠ 한글 컬럼명 → 빌더에서 dict rename map 1회 정의

### 4-10. ds12 휴게소 놀이터 → `def:RestArea`
- **CSV**: 7 cols — Name, FacilityType, Location, OpeningHours, CloseDay, EstablishedYear, Remark
- **URI**: `id:restarea/{slug(name)}`
- **매핑**: Name→`rdfs:label`, FacilityType→`def:facilityType`, Location→`def:address`, OpeningHours→`def:operatingHours`, CloseDay→`def:closeDay`, EstablishedYear→`def:establishedYear xsd:gYear`, Remark→`rdfs:comment`

### 4-11. ds13 질병 증상 → `def:Symptom` + `def:SymptomCategory`
- **CSV**: 5 cols — SymptomCode, CategoryKo, CategoryEn, SymptomListCode, SymptomName
- **URI**: `id:symptom/{SymptomListCode}` (ds16 와 정합), `id:symptom-category/{SymptomCode[0]}` (a..l)
- **매핑**: SymptomName→`rdfs:label @ko`, CategoryKo→`def:categoryLabelKo`, CategoryEn→`def:categoryLabelEn`, 해당 카테고리 노드와 `def:hasSymptom` 양방향
- **빌더 책임**: ds16 가 사용하는 모든 SymptomListCode 가 본 데이터셋에 존재해야 함 — 빌드 후 cross-check (kg-build-reviewer)

### 4-12. ds14 수의 QA → `def:VetQA` (신규 클래스 추가 예정)
- **소스**: `csv_data/14_동물성장_및_질병_데이터.csv` + AI허브 추출본 (`extract_aihub.py`, `extract_final.py`)
- **URI**: `id:vetqa/{sha1(question+answer)[:12]}` (PII 없는 결정성 ID)
- **매핑**: question→`def:question`, answer→`def:answer`, department(내과/외과/...)→`def:department → id:department/...`, animal(개/고양이)→`def:targetAnimal`, source→`dct:source`
- ⚠ 어휘에 `VetQA`, `question`, `answer`, `targetAnimal` 추가 + kg-build-reviewer 검토 필요

### 4-13. ds15 질병 마스터 → `def:Disease`
- **CSV**: 7 cols (cp949) — DISS_NO, DISS_NM, ENG_DISS_NM, INFO_OFFER_NM, RGSDE, MAIN_INFC_ANIMAL, CAUSE_CMMN_CL
- **URI**: `id:disease/{DiseaseNo}` (ds16 와 정합)
- **매핑**: DISS_NM→`rdfs:label @ko`, ENG_DISS_NM→`rdfs:label @en`, INFO_OFFER_NM→`dct:source`, RGSDE→`def:registeredDate`, MAIN_INFC_ANIMAL→`def:targetAnimal`, CAUSE_CMMN_CL→`def:causeClass`
- **필터**: ds16 와 동일하게 `MAIN_INFC_ANIMAL contains '개|고양이|견|묘'` 만 (반려동물 한정)
- **인코딩**: `_load_diseases()` 의 utf-8-sig → euc-kr → cp949 fallback chain 재사용

---

## 5. 데이터셋 ↔ MCP MAP (단일 진실원천 동기화)

본 표는 `.openharness/mcp/MAP.md` 와 자동 일치해야 한다 (CI: `ops/ci/map_diff.py`).

| ID | 클래스 | URI leaf | 빌더 모듈 | 그래프 | 상태 |
|---|---|---|---|---|---|
| 01 | AnimalHospital | hospital | `ds01_hospital.py` | `urn:knowledgemap:01_hospital` | 🟡 |
| 02 | Pharmacy | pharmacy | `ds02_pharmacy.py` | `urn:knowledgemap:02_pharmacy` | 🟡 |
| 03 | Grooming | grooming | `ds03_grooming.py` | `urn:knowledgemap:03_grooming` | 🟡 |
| 04 | Boarding | boarding | `ds04_boarding.py` | `urn:knowledgemap:04_boarding` | 🟡 |
| 05 | Cremation | cremation | `ds05_cremation.py` | `urn:knowledgemap:05_cremation` | 🟡 |
| 07 | TravelSpot | travel | `ds07_travel.py` | `urn:knowledgemap:07_travel` | 🟡 |
| 08 | AbandonedAnimal | abandoned | `ds08_abandoned.py` | `urn:knowledgemap:08_abandoned_animal` | ✅ |
| 09 | LostAnimal | lost | `ds09_lost.py` | `urn:knowledgemap:09_lost_animal` | 🟡 |
| 10 | AnimalShelter | shelter | `ds10_shelter.py` | `urn:knowledgemap:10_shelter` | 🟡 |
| 11 | CultureFacility | culture | `ds11_culture.py` | `urn:knowledgemap:11_culture` | 🟡 |
| 12 | RestArea | restarea | `ds12_restarea.py` | `urn:knowledgemap:12_restarea` | 🟡 |
| 13 | Symptom + SymptomCategory | symptom | `ds13_symptoms.py` | `urn:knowledgemap:13_symptoms` | 🟡 |
| 14 | VetQA | vetqa | `ds14_vetqa.py` | `urn:knowledgemap:14_vet_qa` | 🟡 |
| 15 | Disease | disease | `ds15_diseases.py` | `urn:knowledgemap:15_diseases` | 🟡 |
| 16 | (predicates only) | — | `ds16_reasoning.py` | `urn:knowledgemap:16_reasoning` | ✅ |

> 🟡 = 빌더 미작성. **매핑 명세는 본 문서가 정본**이며, 빌더 작성 시 본 §4 의 컬럼 매핑을 그대로 따라야 한다 (kg-build-reviewer 페르소나 검수 통과 필수).
