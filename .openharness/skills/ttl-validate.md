---
name: ttl-validate
description: turtle/*.ttl 파일을 rdflib로 파싱하여 문법·prefix·중복 트리플·고립 노드를 검증하고 리포트.
trigger: ["TTL 검증", "그래프 무결성", "ttl validate", "rdflib"]
permissions:
  read: ["turtle/**"]
  exec: ["python3 *"]
---

# TTL Validate 스킬

## 검사 항목
1. **파싱**: 각 `turtle/*.ttl` 을 `rdflib.Graph().parse(format="turtle")` 로 로드.
2. **Prefix 일관성 (UK URI 101)**: 신규 파일은 `def:/id:/doc:/set:` 4종 `http://knowledgemap.kr/...` 사용. 레거시 `animalloo.kr` 은 `animalloo_*.ttl` 에서만 허용.
3. **중복 트리플**: `knowledgemap_all.ttl`(신규) / `animalloo_all.ttl`(레거시) 각각의 동일 (s,p,o) 카운트.
3-1. **URI 정합**: 모든 인스턴스 URI가 `^http://knowledgemap\.kr/id/animal/[a-z0-9-]+/[a-z0-9-/]+$` 매치 + 기술 토큰(.html/.php/api) 미포함.
4. **고립 노드**: in/out degree 0 인 리소스 (단, 리터럴 제외).
5. **클래스/속성 어휘**: 새 파일이 기존 어휘를 재사용하는지 (사전: `def:AnimalHospital`, `def:Pharmacy`, `def:Grooming`, `def:Boarding`, `def:Cremation`, `def:AbandonedAnimal`, `def:LostAnimal`, `def:AnimalShelter`, `def:CultureFacility`, `def:RestArea`, `def:Symptom`, `def:Disease`, `def:VetDepartment`, `def:Region`, `def:protectedBy`, `def:foundAt`, `def:matchingCandidate`, `def:mapsTo`, `def:indicatesDisease`, `def:treatedAt`, `def:locatedIn`).
6. **15개 산출물 누락 검사**: ID 01..05, 08..16 (07은 API 직접) + `knowledgemap_all.ttl`.

## 출력
표준출력 + (옵션) `reports/ttl-validate-<날짜>.md`. **파일 수정 없음**.

## 의존성
`rdflib>=7.0`. 없으면 사용자에게 `pip install rdflib` 안내(자동 설치 금지).
