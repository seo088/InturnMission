---
name: react-component
description: FastAPI 엔드포인트 스펙으로부터 React 컴포넌트·훅·페이지를 스캐폴딩. 기존 정본 폴더 구조 준수, 중복 컴포넌트 생성 금지.
trigger: ["컴포넌트 생성", "차트 추가", "React 스캐폴딩", "프론트 페이지 추가"]
permissions:
  read: ["frontend/src/**", "backend/app/routers/**", "backend/app/schemas/**"]
  write: ["frontend/src/**"]
  exec: ["npm *", "node *"]
---

# React Component Scaffold 스킬

## 정본 디렉토리

| 영역 | 경로 |
|---|---|
| 페이지 | `frontend/src/pages/*.jsx` |
| 컴포넌트 | `frontend/src/components/{dashboard,datasets,kg,layout,mapping}/*.jsx` |
| API 클라이언트 | `frontend/src/api/index.js` |
| 훅 | `frontend/src/hooks/index.js` |
| 스타일 | `frontend/src/styles/`, `tailwind.config.js` |

### 기존 컴포넌트 (중복 생성 금지)
- dashboard: `BarChart.jsx`, `DatasetList.jsx`, `DonutChart.jsx`, `KoreaMap.jsx`, `QualityBars.jsx`, `StatCards.jsx`
- layout: `Sidebar.jsx`, `Topbar.jsx`
- datasets/kg/mapping: (현재 비어있음 — 신규 작성 가능)

### 기존 페이지
`Dashboard, Datasets, IndexPage, KnowledgeGraph, Mapping1, Mapping, pet-knowledge-graph, Poster2, Poster`

> ⚠️ 페이지 중 `Mapping.jsx`/`Mapping1.jsx`, `Poster.jsx`/`Poster2.jsx` 는 사용자 정본 확정 전까지 수정 금지(중복 의심).
> ⚠️ 루트 `Dashboard.jsx` 는 레거시 — 수정 금지.

## 절차
1. **사전 검사**: 컴포넌트명·페이지명이 위 리스트와 충돌하지 않는지 확인.
2. **API 클라이언트**: 새 엔드포인트 호출 함수를 `frontend/src/api/index.js` 에 **추가만** (export 새 항목, 기존 함수 유지).
3. **훅**: `frontend/src/hooks/index.js` 에 React Query 또는 SWR 훅 추가. 기존 훅 시그니처 유지.
4. **컴포넌트**: 도메인에 맞는 폴더(`dashboard|datasets|kg|layout|mapping`)에 배치. JSX, 함수형, named export 금지(default export 통일).
5. **페이지**: 필요 시 `pages/` 에 추가하고 라우터 등록(`App.jsx` 확인).
6. **스타일**: TailwindCSS 사용. 인라인 스타일 금지.

## 코드 컨벤션
- React 18, Vite, JSX (TS 미사용 — 기존 컨벤션 유지)
- 함수형 컴포넌트 + Hooks
- props 타입은 JSDoc 으로 (PropTypes 도입 금지 — 기존 미사용)
- a11y: 차트는 `aria-label` 필수
- 한국어 텍스트 그대로 허용

## 누락·중복 방지 체크리스트
- [ ] 기존 컴포넌트 6개(dashboard) 와 이름 충돌 없음
- [ ] `api/index.js` 에 동일 함수 미존재
- [ ] `hooks/index.js` 에 동일 훅 미존재
- [ ] `App.jsx` 라우트 중복 없음
- [ ] 새 페이지가 `Mapping*`, `Poster*` 중복 패턴을 만들지 않음
