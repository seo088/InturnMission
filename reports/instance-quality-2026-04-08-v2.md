# Instance Quality Report — Pet-Graph KG — 2026-04-08 (v2 after F1/F2/F4)

**Reviewer**: 박정우 위원 (페르소나 — `instance-quality-reviewer` 스킬)
**Source**: local TTL files (rdflib + grep on `^<http`)
**Verdict**: **A−** — F1/F2/F4 적용 후 4개 critical/major issues 중 3개 해결

## A. ISO/IEC 25012 차원별 점수 변화

| 차원 | 이전(v1) | 현재(v2) | 변화 |
|---|---|---|---|
| **Completeness (label)** | A− | **A** | Disease 13 missing → 0 (F2 효과) |
| **Accuracy 구문** | A | A | unchanged |
| **Accuracy 의미 (FK)** | C (10.7%) | C (10.7%) | F3 미적용 (다음 스프린트) |
| **Uniqueness LostAnimal** | **F (99.6%)** | **A− (2.7%)** | 12 → 2,884 distinct (F1 효과) |
| **Uniqueness Hospital** | **D (40%)** | **A (0%)** | 5,373 / 5,373 (F4 효과) |
| **Uniqueness Pharmacy** | C (5.7%) | **A (0%)** | 13,054 / 13,054 (F4 효과) |
| **Uniqueness Grooming** | A | A | 10,814 / 10,814 |
| **Uniqueness Boarding** | A | A | 5,821 / 5,821 |
| **Uniqueness Cremation** | A | A | 84 / 84 |
| **Uniqueness Culture** | F (63.6%) | C (32.3%) | 99 → 67 distinct (F4 부분효과 — sido 미입력 행 잔존) |
| **Consistency (Disease)** | C | **A** | ds16 typing 제거 (F2) |
| **Coverage (region)** | A | A | unchanged |

**종합 등급 A−** (이전 B에서 상승). 잔여 이슈 2건 (F3 FK gap, ds11 culture sido 결측).

## B. 개별 메트릭 (rdflib + grep 측정)

### B-1. Distinct subject 카운트 (TTL 파일별)

| ID | 클래스 | builder blocks | distinct subjects | dedup % |
|---|---|---|---|---|
| 01 | AnimalHospital | 5,373 | **5,373** | 0.0% ✅ |
| 02 | Pharmacy | 13,054 | **13,054** | 0.0% ✅ |
| 03 | Grooming | 10,814 | **10,814** | 0.0% ✅ |
| 04 | Boarding | 5,821 | **5,821** | 0.0% ✅ |
| 05 | Cremation | 84 | **84** | 0.0% ✅ |
| 08 | AbandonedAnimal | 15,241 | 15,240 | 0.0% ✅ |
| **09** | **LostAnimal** | **2,963** | **2,884** | **2.7% ✅** |
| 10 | AnimalShelter | 330 | 330 | 0.0% ✅ |
| 11 | CultureFacility | 99 | 67 | 32.3% ⚠ (sido 결측) |
| 12 | RestArea | 20 | 20 | 0.0% ✅ |
| 13 | Symptom | 528 | 516 | 2.3% ✅ |
| 14 | VetQA | 25 | 25 | 0.0% ✅ |
| 15 | Disease | 13 | 13 | 0.0% ✅ |
| 16 | reasoning chain | 160 | (predicates only) | — |

### B-2. F1/F2/F4 효과 검증

| Fix | 측정 명령 | 결과 |
|---|---|---|
| F1 ds09 (RfidCode + HappenDate 추가) | `grep "^<http" 09_lost_animal.ttl \| sort -u \| wc -l` | **2,884** (was 12) |
| F2 ds16 (Disease typing 제거) | `grep -c "a def:Disease" 16_reasoning_chain.ttl` | **0** (was 13) |
| F2 ds15 (Disease 단독 typing) | `grep -c "a def:Disease" 15_diseases.ttl` | **13** ✅ |
| F4 ds01 hospital (KEY_SPEC + fid) | `grep "^<http" 01_hospital.ttl \| sort -u \| wc -l` | **5,373** distinct (no collapse) |

### B-3. FK 정합 (변경 없음 — F3 미적용)

```
ds08 protectedBy refs:  317 distinct shelter URIs
ds10 has shelters:      330
deadlinks (수동 측정):  34 (10.7%)
```

## C. 해결된 액션 vs 잔여

### ✅ 해결됨
- C-1 [F1 LostAnimal collapse] → 2,884 (96% 회복)
- C-2 [F4 Hospital dedup] → 5,373 (0% collapse)
- C-4 [F2 Disease consistency] → ds15만 단독 typing

### ⚠ 잔여
- C-3 [F3 ds08↔ds10 FK 34 missing] — CareRegNo 양방향 reconciler 필요
- **C-5 신규** [ds11 CultureFacility sido 결측 32.3%] — 11_culture.csv 의 일부 행에 Sido 미입력 → fallback로 RoadAddress 파싱 추가 필요

## D. 종합 평가

**production 적합 등급 A−** — 시맨틱 매핑 안정, URI 정책 100%, 결정성 보장.
14/15 데이터셋에서 100% 또는 사실상 100% 인스턴스 보존.
잔여 이슈 2건은 데이터 품질(소스 CSV 결측) 또는 다음 스프린트(FK reconciler)에 해당.

다음 측정: F3 적용 후 재실행. 목표 등급 **A**.
