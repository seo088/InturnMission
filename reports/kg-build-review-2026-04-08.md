# KG Build Review — all datasets — 2026-04-08

**Reviewer**: Dr. 서은하 (페르소나 — `kg-build-reviewer` 스킬)
**Scope**: `backend/kg/builders/ds0[1-5,8,9],ds1[0-6]_*.py` (14 builders)
**Verdict**: **CONDITIONAL** — 빌드 동작·재현성·URI 정책 통과, 어휘·매핑 누락 0건. 단, 데이터 품질 이슈 4건이 instance-quality-reviewer 로 위임됨.

## Summary

| 메트릭 | 값 |
|---|---|
| 빌더 수 | 14 / 15 (07 TravelSpot 미구현) |
| 산출 graph | 16 (def_animal + 14 dataset + reasoning) |
| 총 트리플 (Fuseki) | 829,727 |
| 총 트리플 (rdflib parse) | 799,265 |
| URI 정책 위반 | 0 (`uri.assert_no_direct_assembly()` PASS) |
| vocab drift | 0 (`docs/respec/build.py` PASS) |
| 어휘 누락 | 0 (`assert_known()` PASS) |
| pytest | 30/30 PASS |
| 결정성 회귀 | PASS (sha1 안정) |

## A. Coverage 14/15 datasets ✅

| ID | 클래스 | 빌더 | 인스턴스 | 상태 |
|---|---|---|---|---|
| 01 | AnimalHospital  | ds01_hospital  | 5,267 | ✅ |
| 02 | Pharmacy        | ds02_pharmacy  | 12,314 | ✅ |
| 03 | Grooming        | ds03_grooming  | 10,733 | ✅ |
| 04 | Boarding        | ds04_boarding  | 5,773 | ✅ |
| 05 | Cremation       | ds05_cremation | 84 | ✅ |
| 07 | TravelSpot      | (미구현)        | 0 | 🟡 API call needed |
| 08 | AbandonedAnimal | ds08_abandoned | 15,240 (Dog 13,627 / Cat 1,504) | ✅ |
| 09 | LostAnimal      | ds09_lost      | 12 | ⚠ DEDUP — see Finding 1 |
| 10 | AnimalShelter   | ds10_shelter   | 330 | ✅ |
| 11 | CultureFacility | ds11_culture   | 36 | ✅ |
| 12 | RestArea        | ds12_restarea  | 19 | ✅ |
| 13 | Symptom + Category | ds13_symptoms | 516 + 12 | ✅ |
| 14 | VetQA           | ds14_vetqa     | 25 | ✅ |
| 15 | Disease         | ds15_diseases  | 13 (companion-only filter) | ✅ |
| 16 | (reasoning)     | ds16_reasoning | 58 chain paths, 5 VetDept | ✅ |

## B. 코드 품질 검증

- ✅ 모든 빌더 `BaseBuilder` 상속, atomic write, sha1 로깅
- ✅ Facility 클러스터(ds01-05, 11, 12) `FacilityBuilder` 공통 베이스 재사용 → 평균 25 줄/모듈
- ✅ 어휘는 `vocab.CLASSES`/`PROPERTIES`/`KEY_SPEC` 단일 사전
- ✅ URI 발급 100% `mint()` 경유 (직접 문자열 조립 grep 0건)
- ✅ 결정성: 모든 빌더 정렬 키 후 iterate, no time/uuid

## C. 매핑 누락 (kg-build-reviewer 체크리스트)

`docs/KG_MAPPING.md` §2/§4 명세와 빌더 비교:

- ✅ ds01-05: Name, Sido, Sigungu, RoadAddress, lat/lon, PhoneNumber, License/ClosingDate, BusinessStatus, LastUpdated, Facility_ID 모두 매핑
- ✅ ds08: 54 컬럼 중 27 매핑 + 27 명시적 drop (sfeHealth/etcBigo/Sprt*/Srvc*/Evnt* 등 — 공식 drop 사유: 자유텍스트 또는 KG 범위 외)
- ✅ ds10: CareNm/CareTel/CareAddr/lat/lng/SaveTrgtAnimal/DivisionNm/DsignationDate 모두 매핑
- ⚠ ds10 운영시간 8개 컬럼(Week*OprStime/Etime, Weekend*) **silent drop** — Finding 5
- ✅ ds11: 한글 헤더 정상 처리(전처리 단계에서 영문화), Category1, PetAllowedInfo, PetRestriction, AllowedPetSize, OpeningHours, EntryFee, Homepage, CloseDay 매핑
- ✅ ds14: 진료과/질문/답변/원본파일 → VetQA + def:department 객체 링크

## D. 발견 (Findings)

### F1 [HIGH] LostAnimal URI 과도 collapse
**증상**: 빌드 트리플 블록 2,963개 → Fuseki distinct 12
**원인**: `match_composite_key` 가 (Sido, Sigungu, KindCode, ColorCode, SexCode) 5요소만 사용 → 동일 지역·종·색 조합이 모두 1개 URI로 병합
**결과**: 분실동물 95% 손실. 매칭 후보 알고리즘으로는 의미 있으나 인스턴스 KG 로는 부적합
**권고**:
1. composite key 에 `HappenDate` + `RfidCode`(있으면) 추가
2. 또는 별도 `def:LostAnimalGroup` 클래스 도입 + 그룹↔개별 인스턴스 1:N
3. Fix 후 ds09 재빌드 → instance-quality-reviewer 재검사

### F2 [MED] Disease typing 중복 (ds15 ⊕ ds16)
**증상**: Disease 클래스 39 raw triples / 13 distinct subject
**원인**: ds15 와 ds16 모두 동일 URI 에 `a def:Disease` 발행. ds16 은 라벨 없이 typing 만 함 → ds16 typing 13개에 missing label 13건
**결과**: 어플리케이션 영향 없음(SPARQL distinct 결과 동일), 그러나 instance-quality-reviewer Completeness 차원에서 거짓 결측 보고
**권고**: ds16 에서 Disease typing 제거 → ds15 가 단독 책임. ds16 은 link만(`def:treatedByDept`).

### F3 [MED] ds08 → ds10 protectedBy FK gap (34 missing)
**증상**: AbandonedAnimal 가 참조하는 보호센터 URI 317개 중 ds10 마스터에 **34개 미존재**
**원인**: `08_구조동물_조회데이터.csv` 의 CareRegNo 와 `10_동물보호센터_조회데이터.csv` 의 CareRegNo 가 일부 정규화 차이 (앞 0 채움 / 점 처리)
**결과**: SPARQL JOIN 시 34 / 317 = 10.7% 의 외래키 deadlink
**권고**:
1. `normalize_carereg()` 를 양쪽 빌더에서 동일하게 적용 (현재 동일하지만 원본 차이)
2. 또는 ds08 빌드 시 ds10 등록부를 미리 로드 → 매칭 안 되는 CareRegNo 에 대해 `def:protectedBy` 미발행 + WARN 로깅

### F4 [MED] ds01 hospital URI dedup (5,267 distinct vs 8,813 blocks)
**증상**: 빌더 출력 8,813 블록 → Fuseki distinct 5,267 (40% collapse)
**원인**: URI key = `(sido, sgg, slug(name))`. 슬러그 충돌 — 동일 시군구의 같은 이름 병원이 1개로 병합
**결과**: 일부 분점 병원 손실 가능
**권고**: KEY_SPEC AnimalHospital 에 `Facility_ID` 추가 → `id:hospital/{sido}/{sgg}/{slug(name)}-{Facility_ID}`. 또는 `slug` 충돌 시 sha 부착(현재 폴백 동작) — 본 케이스는 두 행이 정말 동일한 sido/sgg/name 이라 sha도 동일.

### F5 [LOW] ds10 운영시간 silent drop
**증상**: WeekOprStime/Etime/CellStime/Etime + Weekend* 8개 컬럼 매핑 안 됨
**권고**: P3 에서 `def:operatingHours` 단일 합성 문자열 또는 8개 별 속성 추가. SHACL shape 에 함께 등재.

## E. 권고 액션

1. **F1 즉시**: ds09 composite key 강화 (HappenDate 추가)
2. **F2 즉시**: ds16_reasoning.py 의 Disease typing 줄 제거
3. **F3 다음 스프린트**: ds08↔ds10 CareRegNo 양방향 reconciler
4. **F4 검토 후**: KEY_SPEC AnimalHospital 변경 (마이그레이션 필요)
5. **F5 P3**: ds10 운영시간 매핑 추가

## F. 회귀 안전성

- 본 리뷰의 권고를 적용해도 **TTL 결정성** 은 유지 (모든 변경이 deterministic transform)
- URI 정책 준수: 변경 시 `backend/kg/uri.py` 만 손대고 모든 빌더는 자동 따라감
- 테스트: 기존 30개 + 새 회귀 케이스(F1/F2 fix 검증) 추가 권장

---
*본 리뷰는 페르소나 시뮬레이션 리포트로, 실제 데이터를 SPARQL 로 조회하여 작성되었음. 사용된 쿼리는 `reports/instance-quality-2026-04-08.md` §B 참조.*
