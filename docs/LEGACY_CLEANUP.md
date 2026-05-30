# 레거시 정리 매니페스트

본 문서는 Pet-Graph 리포의 레거시/중복 자산을 분류하고, 정리 액션을 사용자 승인 대기 상태로 명시한다. **사용자 명시 지시 없이는 어떤 파일도 이동/삭제하지 않음** (CLAUDE.md §3.1).

## A. 레거시 파일 인벤토리

### A-1. 깨진 진입점 / 위치 오류
| 파일 | 정본 | 상태 | 권장 액션 |
|---|---|---|---|
| `main.py` (root, 74 lines) | `backend/app/main.py` | 깨진 import (없는 라우터 5개 참조) | `legacy/main_root_broken.py` 로 이동 |
| `dashboard.py` (root, 62 lines) | `backend/app/routers/dashboard.py` | 라우터 코드가 root에 위치 | `legacy/` 이동 |
| `Dashboard.jsx` (root) | `frontend/src/pages/Dashboard.jsx` | 페이지 컴포넌트가 root에 위치 | `legacy/` 이동 |

### A-2. ETL 중복 (정본 흡수 완료)
| 파일 | MD5 | 정본 (신규) | 상태 |
|---|---|---|---|
| `qa_to_turtle.py` | `952793fa…` | `backend/kg/builders/ds08_abandoned.py` | ✅ 정본화 완료. 결과 동등성 검증(재구축 트리플 +15K, 엔티티 동수 15,240) |
| `rescue_to_turtle1.py` | `952793fa…` | 동상 | qa_to_turtle.py 와 byte-identical |
| `rescue_to_turtle.py` | `f92eea59…` | 동상 | 구버전(garbage 필터·xsd:date·schema:image 누락) |
| `reasoning_chain.py` | — | `backend/kg/builders/ds16_reasoning.py` | ✅ 정본화 완료 |

권장: 위 4개를 `legacy/etl/` 로 이동하고 `legacy/etl/README.md` 에 정본 매핑 표 작성.

### A-3. 빈 디렉토리
- `ttl_trans_py/` — 빈 폴더, `rmdir` 가능

### A-4. 보존 대상 (정상 자산이지만 이름이 혼동)
| 파일 | 비고 |
|---|---|
| `extract_aihub.py`, `extract_final.py` | AI허브 14번 데이터셋 추출 — 빌더화 대기(P2 잔여 ds14) |
| `api_trans_csv.py` | 동반여행 API 호출 — ds07 빌더화 대기 |
| `backend/import_csv.py` | CSV→PG 정본. `backend/etl/` 로 모듈화 권장 |

### A-5. 레거시 TTL (네임스페이스 충돌)
`turtle/` 디렉토리에는 두 종류 TTL이 공존:

| 파일 (15개) | 네임스페이스 | 빌더 정본 | Fuseki graph |
|---|---|---|---|
| `01_hospital.ttl` | **knowledgemap.kr** (방금 재빌드) | ds01 | `urn:knowledgemap:01_hospital` |
| `08_abandoned_animal.ttl` | **knowledgemap.kr** | ds08 | `urn:knowledgemap:08_abandoned_animal` |
| `10_shelter.ttl` | **knowledgemap.kr** | ds10 | `urn:knowledgemap:10_shelter` |
| `13_symptoms.ttl` | **knowledgemap.kr** | ds13 | `urn:knowledgemap:13_symptoms` |
| `15_diseases.ttl` | **knowledgemap.kr** | ds15 | `urn:knowledgemap:15_diseases` |
| `16_reasoning_chain.ttl` | **knowledgemap.kr** | ds16 | `urn:knowledgemap:16_reasoning_chain` |
| `def_animal.ttl` | **knowledgemap.kr** | ReSpec 자동생성 | `urn:knowledgemap:def_animal` |
| `00_regions.ttl` | animalloo.kr (legacy) | (없음) | `urn:knowledgemap:00_regions` |
| `02_pharmacy.ttl` | animalloo.kr (legacy) | (P2 잔여) | 동상 |
| `03_grooming.ttl` | animalloo.kr (legacy) | (P2 잔여) | 동상 |
| `04_boarding.ttl` | animalloo.kr (legacy) | (P2 잔여) | 동상 |
| `05_cremation.ttl` | animalloo.kr (legacy) | (P2 잔여) | 동상 |
| `09_lost_animal.ttl` | animalloo.kr (legacy) | (P2 잔여) | 동상 |
| `11_culture.ttl` | animalloo.kr (legacy) | (P2 잔여) | 동상 |
| `12_restarea.ttl` | animalloo.kr (legacy) | (P2 잔여) | 동상 |
| `14_vet_qa.ttl` | animalloo.kr (legacy) | (P2 잔여) | 동상 |
| `animalloo_all.ttl` | animalloo.kr (legacy 통합) | — | 미적재 (`load.sh --legacy` 옵션) |

> 동일 그래프 이름에 두 네임스페이스 트리플이 섞여 있는 경우는 없음 (한 파일 = 한 graph).
> P2 잔여 8개 빌더 작성이 완료되면 위 animalloo.kr 트리플들은 새 빌드로 대체되며, 동일 graph 이름이 덮어써진다.

### A-6. 데이터 / 환경 (절대 이동 금지)
- `csv_data/**` — 원본 데이터 (read-only)
- `postgres_data/` — DB 볼륨
- `download.tar` — AI허브 원본
- `backend/venv*`, `venv/`, `frontend/node_modules/` — 환경

## B. 권장 정리 시퀀스 (사용자 승인 후)

```bash
mkdir -p legacy/etl legacy/web

# A-1: 위치 오류 파일들
git mv main.py             legacy/main_root_broken.py
git mv dashboard.py        legacy/dashboard_root_misplaced.py
git mv Dashboard.jsx       legacy/Dashboard_root.jsx

# A-2: ETL 중복
git mv qa_to_turtle.py     legacy/etl/qa_to_turtle.py
git mv rescue_to_turtle.py legacy/etl/rescue_to_turtle.py
git mv rescue_to_turtle1.py legacy/etl/rescue_to_turtle1.py
git mv reasoning_chain.py  legacy/etl/reasoning_chain.py

# A-3
rmdir ttl_trans_py

# A-4: 빌더화 대기 자산은 legacy/wip/
mkdir -p legacy/wip
git mv extract_aihub.py    legacy/wip/extract_aihub.py
git mv extract_final.py    legacy/wip/extract_final.py
git mv api_trans_csv.py    legacy/wip/api_trans_csv.py

# legacy/etl/README.md 작성 (정본 매핑 표)
```

총 이동 파일 11개 + 디렉토리 1개 삭제.

## C. 위험 평가
- **회귀 위험**: A-1/A-2 이동은 import 경로 변경 없음 (어떤 정본 코드도 이 파일들을 import 하지 않음). git history 보존됨.
- **레거시 TTL (A-5)**: 신규 빌드가 동일 파일명을 덮어씀 → 보존하려면 이동 전에 백업 필요.
- **사용자 작업 영향**: 위 11개 파일 중 어느 것도 정본 빌드/테스트 경로에서 참조되지 않음 (CLI list, 4 builders, tests 모두 무영향).

## D. 검증 체크리스트 (정리 후 실행)

```bash
# 1) 어떤 정본도 레거시를 import 하지 않는지
! grep -rn 'from main import\|import dashboard$\|qa_to_turtle\|rescue_to_turtle\|reasoning_chain' \
    backend/kg backend/app frontend/src

# 2) 핵심 테스트 통과
backend/venv/bin/python -m pytest backend/tests/test_kg_core.py -q

# 3) 빌더 CLI 정상
backend/venv/bin/python -m backend.kg.cli list

# 4) Fuseki 적재 회귀
bash ops/fuseki/load.sh --dry-run
```

## E. 사용자 결정 필요 사항
1. **이동 vs 삭제**: legacy/ 보존 권장 (git history + 비교용). 삭제 원하면 명시.
2. **A-5 레거시 TTL**: 신규 빌드로 대체하기 전 백업할까? → 권장: `cp -r turtle/ turtle.legacy.$(date +%F)/` 1회 백업 후 안심하고 P2 잔여 빌더 작업 진행.
3. **`backend/import_csv.py`** → `backend/etl/import_<class>.py` 로 분할 시점 (db-import 스킬과 짝).
