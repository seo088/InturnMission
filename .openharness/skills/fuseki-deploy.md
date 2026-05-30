---
name: fuseki-deploy
description: 로컬 Apache Jena Fuseki(docker) 기동·graph 단위 적재·헬스체크. 운영은 추후 knowledgemap.kr NAS 이전.
trigger: ["fuseki", "TDB2", "그래프 적재", "SPARQL 엔드포인트"]
permissions:
  read: ["turtle/**", "ops/fuseki/**"]
  write: ["ops/fuseki/**"]
  exec: ["docker *", "curl *", "bash ops/fuseki/*"]
---

# Fuseki Deploy 스킬

## 토폴로지 (로컬)

```
docker network: knowledgemap_net
┌─────────────────────────────┐
│ fuseki  (jena 5.x)          │
│   :3030  /knowledgemap      │
│   TDB2 persistent volume    │
└──────────┬──────────────────┘
           │ HTTP GSP/SPARQL
┌──────────┴──────────────────┐
│ petgraph_mcp.sparql_server  │
│ → MCP 도구로 노출           │
└─────────────────────────────┘
```

엔드포인트:
- Query:  `http://localhost:3030/knowledgemap/query`
- Update: `http://localhost:3030/knowledgemap/update`
- GSP RW: `http://localhost:3030/knowledgemap/data?graph=urn:knowledgemap:<id>`
- 관리 UI: `http://localhost:3030/` (admin / `${FUSEKI_ADMIN_PW}`)

## 적재 정책 (graph 단위)

| Graph URI | 소스 |
|---|---|
| `urn:knowledgemap:def`         | `turtle/def_animal.ttl` (온톨로지 — 신규) |
| `urn:knowledgemap:01_hospital` | `turtle/01_hospital.ttl` (knowledgemap 네임스페이스로 재빌드된 신규 산출물) |
| ... (각 데이터셋) ... | |
| `urn:knowledgemap:16_reasoning`| `turtle/16_reasoning_chain.ttl` |
| `urn:knowledgemap:legacy`      | `turtle/animalloo_all.ttl` (읽기전용 비교용) |
| **default**                    | `turtle/knowledgemap_all.ttl` |

> 레거시 graph 는 비교/검증 목적. SPARQL 질의는 default graph 또는 명시적 `FROM <urn:knowledgemap:...>`.

## 절차

1. `cd ops/fuseki && cp .env.example .env && edit .env` (admin pw)
2. `docker compose -f docker-compose.fuseki.yml up -d`
3. `bash ops/fuseki/load.sh` — `turtle/*.ttl` 를 graph 단위 PUT
4. 헬스체크: `curl -s http://localhost:3030/$/ping`
5. Sample SPARQL 3종 통과 (kg-query.md Q1~Q3)

## 안전
- ⛔ `dropdb`, `--rm` 볼륨 삭제 금지
- ⛔ admin 비밀번호 평문 커밋 금지 (.env, .ohignore 적용)
- ⛔ Update endpoint는 로컬 only — 운영 NAS 이전 시 reverse-proxy + JWT
- 백업: `ops/fuseki/backup.sh` — TDB2 dump → `backups/{ISO}.nq.gz`

## NAS 이전 체크리스트 (P5)
- [ ] DNS A record `knowledgemap.kr` → NAS
- [ ] nginx reverse proxy + Let's Encrypt
- [ ] 콘텐츠 협상 (303 from id → doc, Accept 기반 ttl/jsonld/html)
- [ ] Fuseki Update endpoint 차단(read-only) + 별도 ingestion endpoint
- [ ] TDB2 backup → NAS RAID + 외부 오프사이트
