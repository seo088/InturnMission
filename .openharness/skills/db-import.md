---
name: db-import
description: preprocessed_data/*.csv 를 PostgreSQL(petgraph_db)에 적재. 기존 backend/import_csv.py 패턴 재사용.
trigger: ["DB 주입", "import csv", "PG 적재", "postgres 적재"]
permissions:
  read: ["preprocessed_data/**", "csv_data/**", "backend/**"]
  write: ["backend/etl/**"]
  exec: ["python3 *", "psql *"]
---

# DB Import 스킬

## 정본 패턴 (참조)
`backend/import_csv.py` — `pandas.read_csv(..., dtype=str, chunksize=500, on_bad_lines='skip')` + `to_sql(if_exists='replace')` 사용. **모든 컬럼 TEXT** 로 적재해 타입 오류 방지.

## 규칙
1. **스키마 정합**: 테이블명은 한글 그대로 (정본 따름) 또는 `ds_<id>_<name>` (영문 정규화) 중 사용자 선택. 기본은 정본 따라 한글 유지.
2. **자격증명**: `backend/app/core/config.py` 에서 읽기 우선. 없으면 환경변수 `PETGRAPH_DB_URL`. 하드코딩 금지.
3. **트랜잭션**: 데이터셋 단위 트랜잭션. 실패 시 롤백.
4. **중복 주입 방지**: `if_exists='replace'` 기본, append 모드는 `--append` 명시 시.
5. ⛔ `db/init.sql`, `init.sql` 수정 금지 (정본 통합 별도 작업).

## 절차
1. 대상 데이터셋 확정 (id 또는 'all')
2. `preprocessed_data/<id>_<name>.csv` 존재 확인
3. 신규 import 모듈은 `backend/etl/import_<id>_<name>.py` 로 작성 (기존 `backend/import_csv.py` 는 보존)
4. 실행 후 `SELECT COUNT(*)` 검증

## 누락 검사
14 데이터셋 중 적재 누락이 있으면 리포트. 추론(16)은 PG 적재 대상 아님(KG 전용).
