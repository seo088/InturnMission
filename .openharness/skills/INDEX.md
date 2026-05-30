# Skills Index

| 스킬 | 단계 | 트리거 | 설명 |
|---|---|---|---|
| [uri-mint](uri-mint.md) | A | "URI 발급", "uri mint" | knowledgemap.kr URI 발급/검증/등록부 (UK URI 101) |
| [etl-pipeline](etl-pipeline.md) | 2 | "ETL", "전처리", "TTL 변환" | 14개 데이터셋 CSV→전처리→TTL 파이프라인 오케스트레이션 |
| [ttl-validate](ttl-validate.md) | 2 | "TTL 검증", "그래프 무결성" | turtle/*.ttl 파싱·prefix·중복 트리플·URI 정합 검증 |
| [db-import](db-import.md) | 2 | "DB 주입", "import csv" | preprocessed_data/*.csv → PostgreSQL 적재 |
| [fuseki-deploy](fuseki-deploy.md) | C | "fuseki", "그래프 적재" | 로컬 docker Fuseki 기동 + graph 단위 PUT (운영 NAS 이전 가이드 포함) |
| [kg-query](kg-query.md) | 3 | "SPARQL", "추론 질의" | KG/PG 혼합 질의 + reasoning_chain |
| [api-scaffold](api-scaffold.md) | 3 | "라우터 추가", "FastAPI 엔드포인트" | models/schemas → router 자동 스캐폴딩 |
| [react-component](react-component.md) | 4 | "컴포넌트 생성" | API → React 컴포넌트/훅/페이지 스캐폴딩 |
| [kg-build-reviewer](kg-build-reviewer.md) | R | "KG 리뷰", "매핑 검토" | **페르소나(Dr. 서은하)**: KG 빌더·매핑·어휘·URI 정책 감사 |
| [instance-quality-reviewer](instance-quality-reviewer.md) | R | "인스턴스 검토", "DQA" | **페르소나(박정우 위원)**: SHACL+ISO25012 인스턴스 품질 감사 |

## 실행 토폴로지

```
                ┌──────────────┐
   CSV/API ───▶ │ etl-pipeline │ ──▶ preprocessed_data/
                └──────┬───────┘
                       ▼
                ┌──────────────┐    ┌──────────┐
                │   uri-mint   │◀───│ kg-build │── (정본 빌더 14+1)
                └──────┬───────┘    └────┬─────┘
                       ▼                 ▼
                  uri_registry      turtle/*.ttl
                                         │
                            ┌────────────┴────────────┐
                            ▼                         ▼
                      ttl-validate         ┌────────────────┐
                            │              │ kg-build-      │
                            ▼              │   reviewer     │ (페르소나)
                    ┌──────────────┐       └────────┬───────┘
                    │ fuseki-deploy│                ▼
                    │ (docker)     │       ┌────────────────┐
                    └──────┬───────┘       │ instance-      │
                           ▼               │ quality-       │ (페르소나)
                    SPARQL endpoint ──────▶│ reviewer       │
                           │               └────────────────┘
                           ▼
                       kg-query, api-scaffold, react-component
```

모든 스킬은 **CLAUDE.md §3 작업 원칙** 과 **docs/URI_POLICY.md** 를 준수.
