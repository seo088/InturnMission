---
name: uri-mint
description: knowledgemap.kr URI 발급·검증·등록부 관리. UK URI 101 정책(def/id/doc/set) 강제. 모든 KG 빌더가 호출하는 유일한 URI 진입점.
trigger: ["URI 발급", "uri mint", "신규 인스턴스 URI", "URI 검증"]
permissions:
  read: ["backend/kg/**", "csv_data/**", "preprocessed_data/**"]
  write: ["backend/kg/uri.py", "backend/kg/uri_registry.parquet"]
mcp_servers: ["petgraph_uri"]
---

# URI Mint 스킬

## 책임
1. `backend/kg/uri.py` 의 `mint/parse/validate` API 유지 (단일 구현)
2. `uri_registry.parquet` 등록부 갱신 (append-only, 결정성 보장)
3. 정책 위반 차단 (`docs/URI_POLICY.md` §2,§4,§5)

## 절대 규칙
- ⛔ 다른 어떤 모듈도 `f"http://knowledgemap.kr/..."` 문자열 조립 금지 → CI: `grep -rn 'knowledgemap.kr' backend/kg/builders/` 결과 0
- ⛔ 등록부 mutate 시 기존 행 수정 금지 (append-only). 동일 source_key 재요청은 기존 URI 반환
- ⛔ legacy `animalloo.kr` 네임스페이스 mint 금지

## API (구현 시그니처)

```python
def mint(klass: str, key: dict, *, kind: Literal["id","doc"] = "id") -> URIRef
def mint_def(term: str) -> URIRef               # def:Term
def mint_set(klass: str) -> URIRef               # set:{class}
def parse(uri: str) -> tuple[str, str, dict]    # (kind, klass, key)
def validate(uri: str) -> bool
```

## 호출 예시
```python
from backend.kg.uri import mint
hosp = mint("AnimalHospital", {"sido":"서울","sgg":"강남구","name":"펫러브의료원"})
# → URIRef("http://knowledgemap.kr/id/animal/hospital/seoul/gangnam/petlove-medical")
```

## 검증 호출
- `kg-build` 스킬은 빌드 전후 `validate(uri)` 일괄 호출
- `instance-quality-reviewer` 가 등록부 결정성(동일 key→동일 URI) 회귀 테스트
