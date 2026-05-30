# Instance Quality Report — after F1/F2/F4/ds07 — 2026-04-08

**Reviewer**: 박정우 위원 (페르소나 — `instance-quality-reviewer`)
**Source**: Fuseki @ `http://localhost:3031/ds` · 17 graphs · **828,357 triples**
**Verdict**: **A−** (이전 B 등급에서 승급)

## A. Before / After 비교

| 메트릭 | Before (2026-04-08 1차) | After (본 리포트) | 효과 |
|---|---|---|---|
| **LostAnimal distinct** | 12 | **2,884** | **240× 회복** (F1) |
| **Disease typing 중복** | 39 raw / 13 distinct, 13 missing label | **13 raw / 13 distinct, 0 missing** | F2 완료 |
| **AnimalHospital distinct** | 5,267 (블록 8,813 대비 40% collapse) | **5,373** (preprocessed 5,373 대비 0% collapse) | F4 완료 |
| **Pharmacy distinct** | 12,314 (5.7% collapse) | **13,054** (0% collapse) | F4 완료 |
| **Grooming distinct** | 10,733 | **10,814** | F4 완료 |
| **Boarding distinct** | 5,773 | **5,821** | F4 완료 |
| **CultureFacility distinct** | 36 (63.6% collapse) | **67** (32% — fid fallback hash collision) | F4 부분 |
| **RestArea distinct** | 19 | **20** | F4 완료 |
| **TravelSpot** | (클래스 미존재) | **0** (cache 없음, graceful skip) | ds07 등록 |
| Total triples | 829,727 | **828,357** | -1,370 (Disease 중복 제거 효과) |

## B. ISO 25012 차원별 등급 변화

| 차원 | Before | After | 비고 |
|---|---|---|---|
| Completeness (label) | A− | **A** | VetDepartment 5/5 missing 만 잔존 |
| Accuracy (구문) | A | **A** | rdflib 800K 파싱 0 error |
| Accuracy (의미, FK deadlink) | C | C | F3 미적용 — 34/317 (10.7%) 유지 |
| **Uniqueness (LostAnimal)** | **F** | **A** | F1 적용 |
| Uniqueness (Hospital) | D | **A** | F4 적용 |
| Consistency (Disease) | C | **A** | F2 적용 |
| Coverage (region) | A | A | 변동 없음 (98-100%) |
| Freshness (dct:modified) | B | B | 변동 없음 |

**종합 등급**: B → **A−** (FK gap 1건만 잔존)

## C. 잔존 이슈

### F3 [MED] ds08 → ds10 protectedBy FK gap — **미적용**
- 34 / 317 = 10.7% deadlink 유지
- CareRegNo 정규화 차이 (앞 0 채움 등)
- 권고: ds08 빌드 시 ds10 등록부 사전 로드 + 미일치 케이스 protectedBy 생략 또는 마스터 보강

### F5 [LOW] ds10 운영시간 8개 컬럼 silent drop — **미적용**
- 영향 없음, P3 정리 작업

### 신규 발견: VetDepartment label 결측 (5/5)
- 원인: ds16_reasoning 가 `def:VetDepartment` 만 typing, 한글 라벨 없음
- 권고: ds16 에 `rdfs:label "내과"@ko` 등 5개 한글 라벨 추가 (10줄 작업)

### CultureFacility 32% 잔여 collapse
- 원인: ds11 CSV 에 Facility_ID 없음 → `_fid_for` 가 (RoadAddress, lat, lon) 해시로 폴백
- 32 collapse = 동일 주소/좌표/이름 조합 (실제 동일 시설일 가능성)
- 권고: BuildingNo 컬럼이 있으면 우선 사용 (`_fid_for` 에서 이미 처리)

## D. F1 ~ F4 적용 검증 SPARQL 결과 (raw)

### LostAnimal (F1 검증)
```
SELECT (COUNT(DISTINCT ?s) AS ?n) WHERE { ?s a def:LostAnimal }
→ n = 2884   (이전 12)
```

### Disease typing (F2 검증)
```
SELECT (COUNT(?s) AS ?triples) (COUNT(DISTINCT ?s) AS ?distinct)
WHERE { ?s a def:Disease }
→ triples = 13, distinct = 13   (이전 39 raw / 13 distinct)
```

### AnimalHospital uniqueness (F4 검증)
```
SELECT (COUNT(DISTINCT ?s) AS ?n) WHERE { ?s a def:AnimalHospital }
→ n = 5373   (이전 5267, 입력 5373 → 0% collapse)
```

### 추론 체인 도달성 (회귀)
```
SELECT (COUNT(*) AS ?paths) WHERE {
  ?sym def:indicatesDisease ?d . ?d def:treatedByDept ?dept
}
→ paths = 58   (변동 없음)
```

## E. 다음 액션

1. **VetDepartment 한글 라벨 추가** — 1분 작업
2. **F3 FK reconciler** — 다음 스프린트
3. **F5 운영시간 매핑** — P3
4. **ds07 cache 채우기** — `legacy/wip/api_trans_csv.py` + 유효 SERVICE_KEY
5. **본 리포트 자동화**: `backend.kg.dqa` 모듈 운영 — 이번 턴에서 구현 완료, `python -m backend.kg.cli dqa` 1줄로 재실행

---
*리포트는 `backend.kg.dqa` (실 SPARQL 5 probe) 출력 기반.*
