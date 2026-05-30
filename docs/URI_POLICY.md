# Knowledgemap URI Policy

> 단일 진실원천. 모든 빌더·MCP·문서·SPARQL은 본 문서 규칙만 따른다.
> 근거 방법론: **"Designing URI Sets for the UK Public Sector" (UK Cabinet Office, 2009)** + **Linked Data Principles (Berners-Lee, 2006)**.

## 1. 도메인

- **운영 도메인**: `knowledgemap.kr` (NAS 호스팅 예정)
- **로컬 개발**: `http://localhost:3030/` (Fuseki) + `http://knowledgemap.kr` URI는 그대로 발급(콘텐츠 협상은 운영 NAS에서 처리)
- **레거시**: `animalloo.kr` 네임스페이스는 `turtle/animalloo_*.ttl` 에서만 읽기전용 보존. 신규 트리플은 절대 생성 금지.

## 2. 4계층 URI 패턴 (UK URI 101)

| 의미 | 패턴 | 예시 | prefix |
|---|---|---|---|
| **Definition** (온톨로지) — 클래스/속성 | `http://knowledgemap.kr/def/{sector}/{Term}` | `.../def/animal/AnimalHospital` | `def:` |
| **Identifier** — 실세계 사물 | `http://knowledgemap.kr/id/{sector}/{class}/{key}` | `.../id/animal/hospital/seoul/gangnam/petlove-medical` | `id:` |
| **Document** — 사물에 대한 기술 (303 redirect 대상) | `http://knowledgemap.kr/doc/{sector}/{class}/{key}` | `.../doc/animal/hospital/seoul/gangnam/petlove-medical` | `doc:` |
| **Set** — 컬렉션/데이터셋 | `http://knowledgemap.kr/set/{sector}/{class}` | `.../set/animal/hospital` | `set:` |

`{sector}` = `animal` 고정 (펫그래프). 향후 확장 시 `vet`, `policy` 등 추가.

## 3. 콘텐츠 협상 (운영 NAS)

- `id/...` GET → 303 See Other → `doc/...` (Accept 헤더 기준 html / turtle / json-ld)
- `def/...` GET → 200 OK ontology fragment
- `set/...` GET → 200 OK VoID/DCAT description + `void:dataDump`

로컬 docker 단계에서는 콘텐츠 협상 없이 Fuseki SPARQL endpoint 만 노출. 협상은 P5 (NAS 이전) 단계에서 nginx + Lua 또는 FastAPI 미들웨어로 추가.

## 4. Slug 규칙

1. 한글 → `unidecode` 로마자화
2. 소문자, 공백→`-`, `[a-z0-9-]` 외 제거, 연속 `-` 압축
3. 길이 ≤ 60
4. 충돌 시 `-{sha1(originalKey)[:6]}` suffix
5. **금지 토큰**: `.html`, `.php`, `.json`, `/api/`, `/v1/`, 버전·날짜·기술명

## 5. 클래스별 key 규칙

| 클래스 | key 구조 | 사용 컬럼 |
|---|---|---|
| `def:AnimalHospital` | `{sido}/{sgg}/{slug(name)}` | 시도, 시군구, 사업장명 |
| `def:Pharmacy` | 동일 | |
| `def:Grooming` `def:Boarding` `def:Cremation` | 동일 | |
| `def:AbandonedAnimal` | `{careRegNo}/{noticeNo}` | 보호센터등록번호, 공고번호 |
| `def:LostAnimal` | `{lostNoticeNo}` | 분실공고번호 |
| `def:AnimalShelter` | `{careRegNo}` | 보호센터등록번호 |
| `def:CultureFacility` | `{sido}/{slug(name)}` | |
| `def:RestArea` | `{slug(name)}` | 휴게소명 |
| `def:Symptom` | `{slug(label_ko)}` | |
| `def:Disease` | `{slug(label_ko)}` | 질병명 |
| `def:VetDepartment` | enum: `internal/surgery/dermatology/ophthalmology/dental` | |
| `def:Region` | `kr/{sido_code}/{sgg_code}` | KOSIS 코드 |
| `def:TravelSpot` | `{slug(name)}` | API 07 |

## 6. URI 등록부 (Registry)

- 위치: `backend/kg/uri_registry.parquet`
- 컬럼: `class, source_key, slug, full_uri, first_seen, last_seen, sha`
- 모든 빌더는 mint 시 등록부 lookup → 동일 source_key 이면 기존 URI 재사용. **결정성 보장**.
- 등록부는 git 추적 (LFS 또는 압축). PR 시 diff 로 신규 URI 검토.

## 7. 단일 구현 모듈

- `backend/kg/uri.py` 에 `mint(class, key) → URIRef`, `parse(uri) → (class,key)`, `validate(uri) → bool` 만 export
- 다른 모든 빌더/스킬/MCP 는 이 모듈만 호출. 직접 문자열 조립 **금지** (CI grep 검사).

## 8. 검증 (CI)

- `ttl-validate` 스킬에서:
  - 정규식 `^http://knowledgemap\.kr/(def|id|doc|set)/animal/.+$`
  - 금지 토큰 부재
  - 등록부와 대조해 미등록 URI 0건
- `instance-quality-reviewer` 스킬에서:
  - 동일 source_key → 동일 URI 결정성
  - 인스턴스당 필수 속성 충족 (SHACL)
