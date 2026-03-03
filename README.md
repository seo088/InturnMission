반려동물 지식 그래프 기반 웹 서비스 (Pet-Graph)
전국 단위 반려동물 데이터 통합 및 지식 그래프 시각화 대시보드 > 14개 공공 데이터셋을 활용한 React + FastAPI + PostgreSQL 풀스택 프로젝트

1. 연구 배경 및 목적 (Research Background)
기존 서울시 중심의 데이터를 전국 단위로 확장하고, 사용자에게 신뢰성 있는 정보를 제공하기 위해 데이터의 출처(Provenance)와 최신성(Recency)을 보장하는 시스템을 구축합니다.

데이터 확장성: 서울시 한정 데이터를 전국 단위 이기종 데이터(보호소, 문화시설 등)로 통합.

신뢰성 확보: 실시간 API와 정적 데이터를 혼용하며 메타데이터(기준 시점, 출처)를 명확히 관리.

가치 창출: 수의학 지식 그래프를 융합하여 단순 조회를 넘어선 고도화된 정보 제공.

🚀 빠른 시작 (Quick Start)
1. 사전 요구사항 (Prerequisites)
본 프로젝트는 아래 환경에서 개발 및 테스트되었습니다.

Node.js: v20.20.0

Python: 3.12.3

Database: PostgreSQL (로컬 설치 필요)

2. 백엔드 실행 (Backend)
Bash
cd backend
# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행 (8000번 포트)
uvicorn app.main:app --reload --port 8000