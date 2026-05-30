# Pet-Graph × OpenHarness 통합

본 디렉토리는 [OpenHarness](https://github.com/HKUDS/OpenHarness) (HKUDS) 에이전트 하네스를 Pet-Graph 리포에 적용하기 위한 **설정·스킬·MCP 서버 정의**를 담는다.

## 설치 (사용자 직접 수행 필요)

```bash
# 1) OpenHarness 설치
curl -fsSL https://raw.githubusercontent.com/HKUDS/OpenHarness/main/scripts/install.sh | bash

# 2) LLM API 키
export ANTHROPIC_API_KEY=sk-...      # 또는 다른 공급자 키

# 3) 프로젝트 진입
cd /home/hong/petgraph
oh                                    # 대화형 TUI
# 또는
oh -p "ETL: 08 구조동물 전처리·TTL 재생성"
```

> 본 리포의 OH 자산은 설치 없이도 **Claude Code(Skills 호환)** 로 그대로 사용 가능.

## 구조

```
.openharness/
├── README.md              # (이 파일)
├── config.yaml            # 권한·모델·MCP 설정
├── skills/                # Anthropic Skills 호환 마크다운
│   ├── INDEX.md
│   ├── etl-pipeline.md         # 2단계: ETL 오케스트레이션
│   ├── ttl-validate.md         # 2단계: TTL 무결성 검증
│   ├── db-import.md            # 2단계: PG 주입
│   ├── kg-query.md             # 3단계: SPARQL/PG 질의
│   ├── api-scaffold.md         # 3단계: FastAPI 라우터/스키마 스캐폴딩
│   └── react-component.md      # 4단계: React 컴포넌트/훅 스캐폴딩
└── mcp/
    ├── petgraph-pg.json        # PostgreSQL MCP 서버 정의(스텁)
    └── petgraph-sparql.json    # SPARQL/Turtle MCP 서버 정의(스텁)
```

## 핵심 원칙 (CLAUDE.md §3 요약)

1. **레거시 미수정**: `main.py`, `dashboard.py`, `Dashboard.jsx`, `rescue_to_turtle*.py`, `qa_to_turtle.py` (루트) 은 사용자 명시 지시 없이 수정 금지.
2. **중복 생성 금지**: 정본 위치는 CLAUDE.md §1 표 참조.
3. **데이터셋 누락 금지**: 14 + 추론 1 = 15개 기준.
4. **URI 정책 (UK Public Sector URI 101)**: 도메인 `knowledgemap.kr`, 4계층(`def/id/doc/set`). 상세는 `docs/URI_POLICY.md`. 레거시 `animalloo.kr` 네임스페이스는 `turtle/animalloo_*.ttl` 에 한해 읽기전용 보존.
