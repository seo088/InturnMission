---
name: api-scaffold
description: backend/app/models 와 schemas 로부터 FastAPI 라우터 보일러플레이트를 생성. 기존 정본 라우터(dashboard/datasets/knowledge_graph/quality)와 충돌·중복 금지.
trigger: ["라우터 추가", "FastAPI 엔드포인트", "API 스캐폴딩"]
permissions:
  read: ["backend/app/**"]
  write: ["backend/app/routers/**", "backend/app/schemas/**", "backend/app/services/**"]
---

# FastAPI Scaffold 스킬

## 정본 위치
- 진입점: `backend/app/main.py`
- 라우터: `backend/app/routers/{dashboard,datasets,knowledge_graph,quality}.py`
- 모델: `backend/app/models/{animal,facility}.py`
- 스키마: `backend/app/schemas/` (현재 비어있음 — Pydantic v2 모델 채워야 함)
- 설정: `backend/app/core/config.py`
- DB 세션: `backend/app/database.py` (assumed; 확인 후 사용)

## 절차
1. **사전 검증**: 추가하려는 리소스명이 기존 4개 라우터·모델과 중복되지 않는지 grep.
2. **모델 확인 또는 신규**: `backend/app/models/<resource>.py` (SQLAlchemy 2.0 Async 스타일).
3. **스키마**: `backend/app/schemas/<resource>.py` (Pydantic v2, `model_config = ConfigDict(from_attributes=True)`).
4. **라우터**: `backend/app/routers/<resource>.py`
   - `APIRouter(prefix="/api/<resource>", tags=["<resource>"])`
   - CRUD 또는 read-only는 사용자 지정
   - `db: AsyncSession = Depends(get_db)`
5. **등록**: `backend/app/main.py` 의 import 와 `app.include_router(...)` 에 추가.
6. **테스트 스텁**: `backend/tests/test_<resource>.py` (있으면).

## 누락·중복 방지
- `main.py` 등록 누락 시 라우터는 동작하지 않음 → 항상 등록 단계 검증.
- 동일 prefix 중복 등록 금지 (`grep "include_router" backend/app/main.py`).
- ⛔ 루트 `main.py`, `dashboard.py` 는 절대 수정하지 않음 (레거시).

## 코드 컨벤션
- 응답 모델은 항상 `response_model=` 명시.
- summary/description 한국어 허용.
- 동기 endpoint 금지 (전부 `async def`).
