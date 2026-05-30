---
name: etl-pipeline
description: Pet-Graph 14개 공공데이터셋의 CSV→전처리→TTL 파이프라인을 오케스트레이션. 누락 없이 15개 산출물(14 + 추론 1) 검증.
trigger: ["ETL", "전처리", "TTL 변환", "데이터 파이프라인", "재생성"]
inputs:
  - dataset_id: "01..16 또는 'all'"
permissions:
  read: ["csv_data/**", "preprocessed_data/**", "turtle/**", "*.py"]
  write: ["preprocessed_data/**", "turtle/**"]
  exec: ["python3 *"]
---

# ETL Pipeline 스킬

## 목적
14개 공공데이터셋 + 1개 파생(추론체인)을 일관된 파이프라인으로 재생성한다. **누락·중복 금지**.

## 데이터셋 매트릭스 (CLAUDE.md §2 와 동기화)

| ID | 도메인 | 빌더 스크립트 | 상태 |
|---|---|---|---|
| 01 | hospital | (미존재) | 🟡 빌더 신규 작성 필요 |
| 02 | pharmacy | (미존재) | 🟡 |
| 03 | grooming | (미존재) | 🟡 |
| 04 | boarding | (미존재) | 🟡 |
| 05 | cremation | (미존재) | 🟡 |
| 07 | travel(API) | `api_trans_csv.py` | ✅ |
| 08 | abandoned_animal | `qa_to_turtle.py` (정본 추정) | ⚠️ `rescue_to_turtle.py`/`rescue_to_turtle1.py` 와 중복 — 사용자 정본 확정 필요 |
| 09 | lost_animal | (미존재) | 🟡 |
| 10 | shelter | (미존재) | 🟡 |
| 11 | culture | (미존재) | 🟡 |
| 12 | restarea | (미존재) | 🟡 |
| 13 | symptoms | (미존재) | 🟡 |
| 14 | vet_qa | `extract_aihub.py` / `extract_final.py` (샘플 추출 단계만) | 🟡 TTL 빌더 미존재 |
| 15 | diseases | (미존재) | 🟡 |
| 16 | reasoning_chain | `reasoning_chain.py` | ✅ |

## 실행 절차

1. **선결 조건 확인**
   - `csv_data/<id>_*.csv` 존재
   - 필요 시 `download.tar` 또는 AI허브 zip 압축 (id=14)
2. **전처리** → `preprocessed_data/<id>_<name>.csv`
3. **TTL 변환** → `turtle/<id>_<name>.ttl`
   - prefix(필수 4종):
     - `@prefix def: <http://knowledgemap.kr/def/animal/> .`
     - `@prefix id:  <http://knowledgemap.kr/id/animal/> .`
     - `@prefix set: <http://knowledgemap.kr/set/animal/> .`
     - `@prefix doc: <http://knowledgemap.kr/doc/animal/> .`
   - 인스턴스 URI 발급은 반드시 `uri-mint` 스킬(또는 `backend/kg/uri.py`) 통해서 — 직접 문자열 조립 금지
   - 기존 클래스/속성 로컬명 재사용. 신규 어휘 도입 시 `kg-build-reviewer` 사전 검토 필수
4. **통합 그래프 갱신** → `turtle/knowledgemap_all.ttl` 에 append (중복 트리플 방지: `ttl-validate`). 레거시 `animalloo_all.ttl` 은 수정 금지
5. **검증**: `ttl-validate` 호출
6. (선택) **DB 주입**: `db-import` 호출

## 중요 규칙
- ⛔ `rescue_to_turtle.py`, `rescue_to_turtle1.py`, `qa_to_turtle.py` 는 사용자 정본 확정 전까지 **호출만** 가능. 수정·삭제 금지.
- ⛔ 신규 빌더 작성 시 기존 TTL 산출물(`turtle/01_hospital.ttl` 등)을 먼저 읽어 **온톨로지 스키마를 역추출**하고 동일하게 사용. 새 prefix 도입 금지.
- ⛔ `csv_data/` 원본은 read-only.
- ✅ 신규 빌더는 `backend/etl/<id>_<name>.py` 로 일원화 배치 (루트 스크립트 난립 방지). 모듈명 패턴 고정.

## 호출 예시
```
oh -p "etl-pipeline: dataset_id=08 재생성하고 ttl-validate 까지 실행"
oh -p "etl-pipeline: all — 누락된 빌더 목록 리포트"
```
