---
name: kg-query
description: 지식그래프(turtle/knowledgemap_all.ttl, 레거시 animalloo_all.ttl 호환) + PostgreSQL 혼합 질의. reasoning_chain(증상→질병→병원) 추론 활용.
trigger: ["SPARQL", "KG 질의", "지식그래프 검색", "증상→질병", "질병→병원", "추론 질의"]
permissions:
  read: ["turtle/**", "csv_data/**", "preprocessed_data/**"]
  exec: ["python3 *"]
mcp_servers: ["petgraph_pg", "petgraph_sparql"]
---

# KG Query 스킬

## 추론 체인 (reasoning_chain.py 와 동기화)

```
ex:SymptomCategory --ex:mapsTo--> ex:VetDepartment
ex:Symptom         --ex:indicatesDisease--> ex:Disease
ex:Disease         --ex:treatedAt--> ex:AnimalHospital
```

## 표준 질의 템플릿

### Q1. "기침" 증상 → 가능 질병 → 진료 가능 병원(지역 필터)
```sparql
PREFIX def: <http://knowledgemap.kr/def/animal/>
PREFIX id:  <http://knowledgemap.kr/id/animal/>
SELECT ?disease ?hospital ?region WHERE {
  ?sym a def:Symptom ; rdfs:label "기침" ;
       def:indicatesDisease ?disease .
  ?disease def:treatedAt ?hospital .
  ?hospital def:locatedIn ?region .
  FILTER(CONTAINS(STR(?region), "서울"))
}
```

### Q2. 보호중 구조동물 → 동일 region 의 분실동물 매칭 후보
```sparql
PREFIX def: <http://knowledgemap.kr/def/animal/>
SELECT ?abandoned ?lost WHERE {
  ?abandoned a def:AbandonedAnimal ; def:foundAt ?r .
  ?lost      a def:LostAnimal      ; def:foundAt ?r .
}
```

### Q3. 진료과 → 매핑 증상 분류
```sparql
PREFIX def: <http://knowledgemap.kr/def/animal/>
SELECT ?cat ?dept WHERE { ?cat def:mapsTo ?dept . }
```

## PG 혼합 질의
- 시설 카운트·지역 통계는 `petgraph_pg` MCP 사용 (SELECT 만 허용).
- KG 결과 → PG 보강(주소·전화) 시 facility 테이블 join.

## 규칙
- ⛔ 그래프 쓰기 금지. 추론 결과 캐시는 `reports/` 또는 메모리 내.
- 새 prefix 도입 금지. 어휘는 CLAUDE.md §3 / ttl-validate 사전 참조.
