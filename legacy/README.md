# Legacy

본 디렉토리는 정본 모듈로 흡수가 완료되었거나 위치가 잘못되었던 파일들을 git history 보존을 위해 모아둔 곳이다. **편집 금지** — 정본은 다음과 같다.

| 레거시 파일 | 정본 |
|---|---|
| `main_root_broken.py` | `backend/app/main.py` |
| `dashboard_root_misplaced.py` | `backend/app/routers/dashboard.py` |
| `Dashboard_root.jsx` | `frontend/src/pages/Dashboard.jsx` |
| `etl/qa_to_turtle.py` | `backend/kg/builders/ds08_abandoned.py` |
| `etl/rescue_to_turtle.py` | 동상 (구버전) |
| `etl/rescue_to_turtle1.py` | 동상 (qa_to_turtle.py 와 byte-identical) |
| `etl/reasoning_chain.py` | `backend/kg/builders/ds16_reasoning.py` |
| `wip/ttl_trans_py.py` | `backend/kg/builders/{ds01,ds02,ds03,ds04,ds05,ds09,ds10,ds11,ds12,ds13,ds15}_*.py` (분리 정본화 진행중) |
| `wip/extract_aihub.py`, `wip/extract_final.py` | `backend/kg/builders/ds14_vetqa.py` (P2 잔여) |
| `wip/api_trans_csv.py` | `backend/kg/builders/ds07_travel.py` (P2 잔여 — API call needed) |
