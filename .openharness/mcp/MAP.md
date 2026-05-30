# MCP Map — 단일 진실원천

본 표는 **도메인 클래스 ↔ 산출물 ↔ MCP 도구 ↔ 스킬** 의 라우팅 사전이다.
모든 신규 빌더/스킬/문서는 이 표를 갱신하면서 작업해야 하며, CI 가 표 ↔ 실제 파일을 diff 해 누락/중복을 검출한다.

| ID | 클래스 (`def:`) | URI 패턴 (`id:`) | 빌더 모듈 | TTL graph | PG 테이블 | MCP 도구 | 스킬 |
|----|----|----|----|----|----|----|----|
| 01 | AnimalHospital | `id:hospital/{sido}/{sgg}/{slug}` | `backend/kg/builders/ds01_hospital.py` 🟡 | `urn:knowledgemap:01_hospital` | `01_동물병원_조회데이터` | `petgraph_pg.select`, `petgraph_fuseki.sparql_query` | kg-build, kg-query, db-import |
| 02 | Pharmacy | `id:pharmacy/{sido}/{sgg}/{slug}` | `ds02_pharmacy.py` 🟡 | `urn:knowledgemap:02_pharmacy` | `02_동물약국_조회데이터` | 동일 | 동일 |
| 03 | Grooming | `id:grooming/{sido}/{sgg}/{slug}` | `ds03_grooming.py` 🟡 | `urn:knowledgemap:03_grooming` | `03_동물미용업_조회데이터` | 동일 | 동일 |
| 04 | Boarding | `id:boarding/{sido}/{sgg}/{slug}` | `ds04_boarding.py` 🟡 | `urn:knowledgemap:04_boarding` | `04_동물위탁관리업_조회데이터` | 동일 | 동일 |
| 05 | Cremation | `id:cremation/{sido}/{sgg}/{slug}` | `ds05_cremation.py` 🟡 | `urn:knowledgemap:05_cremation` | `05_동물장묘업_조회데이터` | 동일 | 동일 |
| 07 | TravelSpot | `id:travel/{slug}` | `ds07_travel.py` (wraps `api_trans_csv.py`) 🟡 | `urn:knowledgemap:07_travel` | (없음) | `petgraph_fuseki.sparql_query` | kg-build |
| 08 | AbandonedAnimal | `id:abandoned/{careRegNo}/{noticeNo}` | `ds08_abandoned.py` (wraps `qa_to_turtle.py`) 🟡 | `urn:knowledgemap:08_abandoned_animal` | `08_구조동물_조회데이터` | 동일 | kg-build, kg-query |
| 09 | LostAnimal | `id:lost/{lostNoticeNo}` | `ds09_lost.py` 🟡 | `urn:knowledgemap:09_lost_animal` | `09_분실동물_조회데이터` | 동일 | 동일 |
| 10 | AnimalShelter | `id:shelter/{careRegNo}` | `ds10_shelter.py` 🟡 | `urn:knowledgemap:10_shelter` | `10_동물보호센터_조회데이터` | 동일 | 동일 |
| 11 | CultureFacility | `id:culture/{sido}/{slug}` | `ds11_culture.py` 🟡 | `urn:knowledgemap:11_culture` | `11_반려동물동반가능_문화시설` | 동일 | 동일 |
| 12 | RestArea | `id:restarea/{slug}` | `ds12_restarea.py` 🟡 | `urn:knowledgemap:12_restarea` | `12_휴게소_반려동물놀이터` | 동일 | 동일 |
| 13 | Symptom | `id:symptom/{slug}` | `ds13_symptoms.py` 🟡 | `urn:knowledgemap:13_symptoms` | `13_동물질병증상_데이터` | 동일 | 동일 |
| 14 | (vet QA pairs) | `id:vetqa/{sha1}` | `ds14_vetqa.py` (wraps `extract_aihub.py`) 🟡 | `urn:knowledgemap:14_vet_qa` | `14_동물성장_및_질병_데이터` | 동일 | 동일 |
| 15 | Disease | `id:disease/{slug}` | `ds15_diseases.py` 🟡 | `urn:knowledgemap:15_diseases` | `15_동물질병_데이터` | 동일 | 동일 |
| 16 | (Reasoning chain) | — (predicates: `def:mapsTo`, `def:indicatesDisease`, `def:treatedAt`) | `ds16_reasoning.py` (wraps `reasoning_chain.py`) 🟢 | `urn:knowledgemap:16_reasoning` | (없음) | `petgraph_fuseki.sparql_query` | kg-query |
| — | (Ontology) | `def:*` | `def_animal.ttl` (수기 + jinja) 🟡 | `urn:knowledgemap:def` | (없음) | `petgraph_fuseki.sparql_query`, `petgraph_wiki.get_page` | wiki-publish, respec-publish |
| — | (통합) | — | (자동 머지) | **default** = `turtle/knowledgemap_all.ttl` | — | 모두 | 모두 |

범례: 🟢 정본 존재 · 🟡 신규/이전 필요

## MCP 서버 ↔ 스킬 매트릭스

| MCP 서버 | 정의 파일 | 사용 스킬 |
|---|---|---|
| `petgraph_pg`     | `petgraph-pg.json`     | db-import, kg-query, instance-quality-reviewer |
| `petgraph_sparql` | `petgraph-sparql.json` | kg-query, instance-quality-reviewer (Fuseki 프록시) |
| `petgraph_fuseki` | `petgraph-fuseki.json` | fuseki-deploy, kg-query, kg-build, instance-quality-reviewer |
| `petgraph_uri`    | `petgraph-uri.json`    | uri-mint, kg-build, kg-build-reviewer |
| `petgraph_wiki`   | `petgraph-wiki.json` (P4) | wiki-publish |

## CI 검증 (P5에서 활성화)

```bash
# 1. MAP.md 의 빌더 모듈명 ↔ 실제 파일 존재 확인
python3 ops/ci/map_diff.py

# 2. URI 직접 조립 grep 0건
! grep -rn '"http://knowledgemap.kr/' backend/kg/builders/ | grep -v 'uri.py'

# 3. 15 graph 누락 검사
python3 ops/ci/graph_coverage.py
```
