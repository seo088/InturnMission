# Pet-Graph — Agent Context (CLAUDE.md / OpenHarness)

전국 반려동물 지식그래프 풀스택 프로젝트(React + FastAPI + PostgreSQL + RDF/Turtle).
이 문서는 OpenHarness(`oh`) 및 Claude Code가 본 리포에서 작업할 때 따라야 할 컨텍스트·규칙을 정의한다.

## 1. 디렉토리 맵 (정본)

| 경로 | 역할 | 정본 여부 |
|---|---|---|
| `backend/app/main.py` | FastAPI 진입점 | ✅ 정본 |
| `backend/app/routers/{dashboard,datasets,knowledge_graph,quality}.py` | API 라우터 | ✅ 정본 |
| `backend/app/models/{animal,facility}.py` | SQLAlchemy 모델 | ✅ 정본 |
| `backend/app/schemas/` | Pydantic 스키마 | ✅ 정본 (현재 비어있음, 채워야 함) |
| `backend/app/services/` | 서비스 레이어 | ✅ 정본 (비어있음) |
| `backend/app/core/config.py` | 설정 | ✅ 정본 |
| `backend/import_csv.py` | CSV → PG 주입 (구조동물) | ✅ 정본 |
| `backend/kg/{uri,vocab,prefixes,ttl,__init__}.py` | KG core (URI mint, 어휘, 프리픽스, TTL 헬퍼) | ✅ 정본 (P2 신규) |
| `backend/kg/builders/{base,ds08_abandoned,ds16_reasoning}.py` | 정본 빌더 (base+2개 구현, 13개 추가 예정) | ✅ 정본 (P2 신규) |
| `backend/kg/cli.py` | `python -m backend.kg.cli build <id\|all>` | ✅ 정본 (P2 신규) |
| `backend/tests/test_kg_core.py` | URI 정책·결정성·어휘 회귀 (30 tests) | ✅ 정본 (P2 신규) |
| `frontend/src/pages/*.jsx` | React 페이지 | ✅ 정본 |
| `frontend/src/components/{dashboard,datasets,kg,layout,mapping}/` | 컴포넌트 | ✅ 정본 |
| `frontend/src/api/index.js`, `hooks/index.js` | API 클라이언트, 훅 | ✅ 정본 |
| `csv_data/` | 원본 공공데이터 CSV (14종) | ✅ 정본 |
| `preprocessed_data/` | 전처리 결과 CSV | ✅ 정본 |
| `turtle/` | 최종 RDF Turtle (16개) | ✅ 정본 |
| `db/init.sql`, `init.sql` | PG 스키마 초기화 | ⚠️ 두 곳 — 통합 필요 |
| `docker-compose.yml` | 컨테이너 정의 | ✅ 정본 |

### 1-1. 레거시/중복 (수정·삭제 금지, 사용자 결정 대기)
| 파일 | 정본 | 비고 |
|---|---|---|
| `main.py` (root) | `backend/app/main.py` | 깨진 import (없는 라우터 5개 참조) |
| `dashboard.py` (root) | `backend/app/routers/dashboard.py` | 라우터 코드 위치 오류 |
| `Dashboard.jsx` (root) | `frontend/src/pages/Dashboard.jsx` | 페이지 컴포넌트 |
| `legacy/etl/qa_to_turtle.py` | `backend/kg/builders/ds08_abandoned.py` | 정본 흡수 완료 (legacy/ 이동) |
| `legacy/etl/rescue_to_turtle1.py` | 동상 | qa_to_turtle.py 와 byte-identical |
| `legacy/etl/rescue_to_turtle.py` | 동상 | 구버전 — superseded |
| `legacy/etl/reasoning_chain.py` | `backend/kg/builders/ds16_reasoning.py` | 정본 흡수 완료 |
| `legacy/wip/ttl_trans_py.py` | `backend/kg/builders/ds0[1-5,9],ds1[0-3,5]*.py` | **수정**: 빈 디렉토리가 아니라 28KB 변환 스크립트였음. 11개 데이터셋 빌더 로직 제공 — 정본화 진행중 |

> 위 4개 ETL 스크립트는 결과 비교·회귀 검증 목적으로 보존. 신규 빌드는 반드시 `backend/kg/builders/dsXX_*.py` 만 사용.

## 2. 데이터셋 카탈로그 (14 + 추론 1)

| ID | 도메인 | 원본 CSV (`csv_data/`) | 전처리 (`preprocessed_data/`) | TTL (`turtle/`) | 변환 스크립트 |
|---|---|---|---|---|---|
| 01 | 동물병원 | `01_동물병원_조회데이터.csv` | `01_hospital.csv` | `01_hospital.ttl` | (TTL 빌더 미존재) |
| 02 | 동물약국 | `02_동물약국_조회데이터.csv` | `02_pharmacy.csv` | `02_pharmacy.ttl` | — |
| 03 | 미용업 | `03_동물미용업_조회데이터.csv` | `03_grooming.csv` | `03_grooming.ttl` | — |
| 04 | 위탁관리(보딩) | `04_동물위탁관리업_조회데이터.csv` | `04_boarding.csv` | `04_boarding.ttl` | — |
| 05 | 장묘업 | `05_동물장묘업_조회데이터.csv` | `05_cremation.csv` | `05_cremation.ttl` | — |
| 07 | 동반여행(API) | (직접 호출) | — | — | `api_trans_csv.py` |
| 08 | 구조동물 | `08_구조동물_조회데이터.csv` | `08_구조동물_전처리완료.csv` | `08_abandoned_animal.ttl` | `qa_to_turtle.py` (정본 추정), `rescue_to_turtle.py`, `rescue_to_turtle1.py` (중복) |
| 09 | 분실동물 | `09_분실동물_조회데이터.csv` | `09_lost_animal.csv` | `09_lost_animal.ttl` | — |
| 10 | 보호센터 | `10_동물보호센터_조회데이터.csv` | `10_shelter.csv` | `10_shelter.ttl` | — |
| 11 | 문화시설 | `11_반려동물동반가능_문화시설.csv` | `11_culture.csv` | `11_culture.ttl` | — |
| 12 | 휴게소 놀이터 | `12_휴게소_반려동물놀이터.csv` | `12_restarea.csv` | `12_restarea.ttl` | — |
| 13 | 질병 증상 | `13_동물질병증상_데이터.csv` | `13_symptoms.csv` | `13_symptoms.ttl` | — |
| 14 | 수의 QA | `14_동물성장_및_질병_데이터.csv` | `14_disease_qa.csv` | `14_vet_qa.ttl` | `extract_aihub.py`, `extract_final.py` (AI허브 추출) |
| 15 | 질병 마스터 | `15_동물질병_데이터.csv` | `15_diseases.csv` | `15_diseases.ttl` | — |
| 16 | 추론체인(파생) | — | — | `16_reasoning_chain.ttl` | `reasoning_chain.py` |
| — | 통합 그래프 | — | — | `animalloo_all.ttl` | `reasoning_chain.py` 외 자동 append |

> 01~05, 09~13, 15 의 CSV→TTL 빌더는 현재 리포에 부재. 산출물(TTL)만 존재하므로 재생성 시 빌더 신규 작성 필요. **신규 작성 시 신규 네임스페이스(`http://knowledgemap.kr/def/animal/`) + 기존 클래스/속성 로컬명을 재사용**할 것. 기존 `turtle/animalloo_all.ttl` 은 레거시(읽기전용)로 유지하며, 신규 빌드는 `turtle/knowledgemap_all.ttl` 로 출력. 마이그레이션은 `ops/migrate/animalloo_to_knowledgemap.rq` (SPARQL UPDATE) 사용.

## 3. 작업 원칙

1. **기존 파일 보존**: 1-1의 레거시는 사용자 명시 지시 없이 수정/삭제/이동 금지.
2. **중복 생성 금지**: 신규 변환·라우터·컴포넌트 작성 전 위 표에서 정본 위치를 먼저 확인.
3. **누락 금지**: 데이터셋 작업 시 14개 + 추론 1개 = 15개를 기준으로 검증.
4. **URI/네임스페이스 정책 (UK Public Sector URI 101 채택)**: 도메인 = `knowledgemap.kr`. 4계층 패턴:
   - 온톨로지(클래스/속성): `http://knowledgemap.kr/def/animal/{Term}` — prefix `def: <http://knowledgemap.kr/def/animal/>`
   - 실세계 인스턴스: `http://knowledgemap.kr/id/animal/{class}/{key}` — prefix `id: <http://knowledgemap.kr/id/animal/>`
   - 인스턴스 기술 문서(303 redirect 대상): `http://knowledgemap.kr/doc/animal/{class}/{key}`
   - 컬렉션/데이터셋: `http://knowledgemap.kr/set/animal/{class}` — prefix `set: <http://knowledgemap.kr/set/animal/>`
   - 규칙: 기술 종속 토큰(.html, .php, /api) 금지 · 소문자·하이픈 · slug=unidecode → `[a-z0-9-]+` · 충돌 시 `-{sha1[:6]}` · 영속성(PURL/redirect) 보장
   - 자세한 정책: `docs/URI_POLICY.md` (단일 진실원천)
5. **DB 자격증명**: `postgresql://postgres:spark!1@127.0.0.1:5435/petgraph_db` (현 상태). 비밀번호/포트는 `.env` 또는 `backend/app/core/config.py`로 통합 권장(별도 작업).
6. **대용량/시크릿 경로 금지**: `.ohignore` 참조.

## 4. 빌드/실행

- 백엔드: `cd backend && uvicorn app.main:app --reload --port 8000`
- 프론트: `cd frontend && npm run dev`
- DB: `docker-compose up -d` (PostgreSQL)
- KG 빌더: `python -m backend.kg.cli list` / `python -m backend.kg.cli build 08|16|all`
- KG 테스트: `backend/venv/bin/python -m pytest backend/tests/test_kg_core.py -q`
- Fuseki(로컬): `docker compose -f ops/fuseki/docker-compose.fuseki.yml --env-file ops/fuseki/.env up -d && bash ops/fuseki/load.sh`

## 5. OpenHarness 통합

- 스킬: `.openharness/skills/` (ETL/검증/주입/KG질의/API스캐폴딩/React스캐폴딩)
- MCP 서버 정의: `.openharness/mcp/`
- 권한/무시 규칙: `.openharness/config.yaml`, `.ohignore`
- 사용: `oh` 실행 후 `/skills` 또는 단발 `oh -p "ETL pipeline 실행"`
