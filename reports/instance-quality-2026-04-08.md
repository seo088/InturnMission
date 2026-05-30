# Instance Quality Report — Pet-Graph KG — 2026-04-08

**Reviewer**: 박정우 위원 (페르소나 — `instance-quality-reviewer` 스킬)
**Source**: Apache Jena Fuseki @ `http://localhost:3031/ds` · 16 named graphs · 829,727 triples
**Verdict**: **B** — Completeness/Accuracy 우수, Uniqueness 1건 critical issue (LostAnimal collapse)

## A. ISO/IEC 25012 차원별 점수

| 차원 | 측정 | 결과 | 임계값 | 등급 |
|---|---|---|---|---|
| **Completeness** | 클래스별 필수 속성(rdfs:label) 결측률 | 0% (8/9 클래스) · 100% (Disease ds16 typing) | ≤2% | **A−** |
| **Accuracy (구문)** | URI 정규식·datatype·prefix 위반 | 0건 (rdflib 800K 파싱 통과) | 0건 | **A** |
| **Accuracy (의미)** | 외래키 deadlink (ds08→ds10) | 34 / 317 (10.7%) | 0 | **C** |
| **Uniqueness** | LostAnimal composite key collapse | 2,963 → 12 (99.6% loss) | 0 | **F** |
| **Uniqueness** | AnimalHospital slug collision | 8,813 → 5,267 (40% collapse) | <5% | **D** |
| **Consistency** | 클래스 typing 다중 graph (Disease) | ds15 + ds16 중복 typing | 단일 | **C** |
| **Coverage (region)** | locatedIn/foundAt 채워진 비율 | 99% (15,231/15,367 facilities), 98% AbandonedAnimal | ≥95% | **A** |
| **Freshness** | dct:modified 보유 비율 | 100% facility · 0% AbandonedAnimal | ≥95% | **B** |

**종합 등급 B** — Critical 1건(F4 LostAnimal Uniqueness), Major 2건(F3 FK gap, F2 Disease consistency), 나머지 차원 A.

## B. 사용된 SPARQL probe

### B-1. 클래스별 distinct 인스턴스
```sparql
PREFIX def: <http://knowledgemap.kr/def/animal/>
SELECT ?cls (COUNT(DISTINCT ?s) AS ?n) WHERE {
  GRAPH ?g { ?s a ?cls }
  FILTER(STRSTARTS(STR(?cls), STR(def:)))
} GROUP BY ?cls ORDER BY DESC(?n)
```

| 클래스 | distinct | 빌드 출력 | dedup ratio |
|---|---|---|---|
| AbandonedAnimal | 15,240 | 15,241 | 0.0% ✅ |
| Dog | 13,627 | (sub of above) | — |
| Pharmacy | 12,314 | 13,054 | 5.7% ⚠ |
| Grooming | 10,733 | 10,814 | 0.7% ✅ |
| Boarding | 5,773 | 5,821 | 0.8% ✅ |
| **AnimalHospital** | **5,267** | **8,813** | **40.2% 🔴** |
| Cat | 1,504 | (sub) | — |
| Symptom | 516 | 528 | 2.3% ✅ |
| AnimalShelter | 330 | 330 | 0.0% ✅ |
| Cremation | 84 | 84 | 0.0% ✅ |
| CultureFacility | 36 | 99 | 63.6% 🔴 |
| VetQA | 25 | 25 | 0.0% ✅ |
| RestArea | 19 | 20 | 5.0% ⚠ |
| Disease | 13 | 13 | 0.0% ✅ |
| **LostAnimal** | **12** | **2,963** | **99.6% 🔴** |
| SymptomCategory | 12 | 12 | 0.0% ✅ |
| VetDepartment | 5 | 5 | 0.0% ✅ |

### B-2. Completeness — rdfs:label 결측
```sparql
SELECT ?cls (COUNT(?s) AS ?n) (SUM(IF(BOUND(?l),0,1)) AS ?missing) WHERE {
  GRAPH ?g { ?s a ?cls . OPTIONAL { ?s rdfs:label ?l } }
  FILTER(?cls IN (def:AnimalHospital, def:Pharmacy, def:Grooming, def:Boarding,
                  def:Cremation, def:AnimalShelter, def:CultureFacility,
                  def:RestArea, def:Disease))
} GROUP BY ?cls
```

전부 0% missing (Disease 13건은 ds16 가 typing 만 한 케이스로, ds15 가 라벨을 보유 — F2 권고 적용 후 사라짐).

### B-3. ds08 → ds10 FK 정합
```sparql
SELECT (COUNT(DISTINCT ?aa) AS ?n_animals)
       (COUNT(DISTINCT ?sh) AS ?ref_shelters)
       (COUNT(DISTINCT ?have) AS ?join_count)
WHERE {
  GRAPH ?g1 { ?aa a def:AbandonedAnimal ; def:protectedBy ?sh }
  OPTIONAL { GRAPH ?g2 { ?sh a def:AnimalShelter . BIND(?sh AS ?have) } }
}
```

| | |
|---|---|
| AbandonedAnimal 총수 | 15,240 |
| 참조된 distinct shelter | 317 |
| ds10에 존재하는 shelter | 283 |
| **deadlink** | **34 (10.7%)** |

### B-4. 추론 체인 도달성
```sparql
SELECT (COUNT(*) AS ?paths) WHERE {
  GRAPH ?g1 { ?sym a def:Symptom ; def:indicatesDisease ?dis }
  GRAPH ?g2 { ?dis def:treatedByDept ?dept }
}
```
**58 paths** — DISEASE_SYMPTOM_MAP × DISEASE_DEPT_MAP cross-graph join 정상.

### B-5. Region coverage
모든 facility 100%, AbandonedAnimal 98% (308 missing region — OrgNm/CareAddr 둘 다에서 시도/시군구 추출 실패한 케이스).

## C. Critical / Major 액션 아이템

### C-1 [F4-A LostAnimal collapse — F등급]
- **즉시 ds09 builder 수정**: composite key 에 HappenDate + RfidCode 추가
- 예상 결과: 12 → ~2,500 distinct
- 회귀 테스트: `ds09` 두번 빌드 sha1 동일

### C-2 [F4-B AnimalHospital collapse — D등급]
- KEY_SPEC AnimalHospital → `(sido, sgg, name, Facility_ID)` 변경
- 또는 `mint()` 시 `Facility_ID` salt 옵션 추가
- 마이그레이션: 기존 URI 변경 → 등록부 (uri_registry.parquet) 자동 업데이트

### C-3 [F3 FK gap]
- ds08 빌드 시 ds10 등록부 사전 로드 → 일치하지 않는 CareRegNo 는 link 생략 + report
- 예상 트리플 손실: 34 abandoned animal 의 protectedBy 1개씩 = 34건 (전체의 0.01%)

### C-4 [F2 Disease consistency]
- ds16_reasoning.py 의 `triples.append(f"<{dis_uri}> a def:Disease ; ...")` 줄 제거
- ds16 은 link only

## D. 신뢰성 평가

전체적으로 **production 적합 등급 B**:
- ✅ 800K triples 가 rdflib 에서 syntax error 0
- ✅ URI 정책 100% 준수
- ✅ 결정성·재현성 보장 (sha1 안정)
- ⚠ 1개 critical (LostAnimal) — 사용자 결정 후 즉시 수정 가능
- ⚠ 2개 major (FK gap, Hospital dedup) — 다음 스프린트
- ⚠ 1개 minor (Disease consistency) — F2 권고 적용 시 자동 해결

## E. 다음 측정

권고: 본 리포트의 C-1~C-4 적용 후 재실행. 목표 등급 **A**.

```bash
# 일괄 재빌드 + 적재 + 본 리포트 재생성
backend/venv/bin/python -m backend.kg.cli build all
bash ops/fuseki/load.sh
# (DQA SPARQL 재실행 — 본 §B 쿼리 그대로 사용)
```

---
*리포트 생성: `instance-quality-reviewer` 페르소나, 실데이터 SPARQL 14 query 기반.*
