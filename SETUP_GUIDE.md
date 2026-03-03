# 🚀 개발 환경 세팅 — 단계별 가이드

## 📋 사전 준비 (설치 필수)

### 1. Node.js 20 LTS 설치
```
https://nodejs.org → LTS 버전 다운로드 설치
확인: node --version   → v20.x.x
확인: npm --version    → 10.x.x
```

### 2. Python 3.11 설치
```
https://python.org → 3.11.x 다운로드
⚠️ Windows: "Add Python to PATH" 체크 필수
확인: python --version  → Python 3.11.x
```

### 3. Docker Desktop 설치
```
https://docker.com/products/docker-desktop
확인: docker --version         → Docker 25.x
확인: docker compose version   → Docker Compose v2.x
```

### 4. VSCode 확장 설치
```
VSCode 열기 → Ctrl+Shift+P → "Extensions: Show Recommended Extensions"
→ .vscode/extensions.json 의 목록 전체 설치
```

---

## 🏗️ 프로젝트 세팅

### Step 1. GitLab 레포 생성 & 클론
```bash
# GitLab에서 새 프로젝트 생성 후
git clone https://gitlab.com/YOUR_ID/petgraph.git
cd petgraph
```

### Step 2. PostgreSQL 실행 (Docker)
```bash
# petgraph/ 루트에서
docker compose up -d db

# 정상 실행 확인
docker compose ps
# → petgraph_db   Up (healthy)
```

### Step 3. 백엔드 세팅
```bash
cd backend

# 가상환경 생성 (Python 3.11)
python -m venv venv

# 활성화
source venv/bin/activate        # Mac/Linux
# 또는
venv\Scripts\activate           # Windows PowerShell

# 패키지 설치
pip install -r requirements.txt

# 환경변수 파일 생성
cp .env.example .env
# .env 파일 열어서 API 키 입력 (선택사항, 없어도 기본 동작)

# 서버 실행
uvicorn app.main:app --reload --port 8000
```

확인: http://localhost:8000/docs → Swagger UI 열리면 성공 ✅

### Step 4. 프론트엔드 세팅
```bash
# 새 터미널에서
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

확인: http://localhost:5173 → 대시보드 열리면 성공 ✅

---

## 🔍 API 테스트

Swagger UI (http://localhost:8000/docs) 에서 바로 테스트 가능:

```
GET /api/dashboard/stats      → KPI 5개
GET /api/datasets              → 14개 데이터셋 목록
GET /api/kg/nodes              → 지식그래프 노드
GET /api/kg/edges              → 지식그래프 엣지
GET /api/quality/metrics       → 품질 지표
```

---

## 📝 GitLab 커밋 흐름

```bash
# 1. 브랜치 생성
git checkout -b feat/dashboard-stats

# 2. 작업 후 스테이징
git add .

# 3. 커밋 (컨벤션 준수)
git commit -m "feat: dashboard stats API + StatCards component"

# 4. 푸시
git push origin feat/dashboard-stats

# 5. MR (Merge Request) 생성 → main 브랜치로
```

### 커밋 메시지 컨벤션
| 태그 | 설명 |
|------|------|
| `feat:` | 새 기능 |
| `fix:` | 버그 수정 |
| `chore:` | 설정, 문서, 패키지 |
| `refactor:` | 코드 구조 변경 |
| `style:` | UI/CSS 변경 |

---

## 🐛 자주 겪는 오류

### "ModuleNotFoundError: No module named 'app'"
```bash
# backend/ 폴더에서 실행했는지 확인
cd backend
uvicorn app.main:app --reload
```

### "Cannot connect to PostgreSQL"
```bash
# Docker 컨테이너 상태 확인
docker compose ps
docker compose up -d db   # 재시작
```

### "CORS error" (프론트엔드에서 API 호출 실패)
```bash
# vite.config.js 프록시 설정 확인
# backend .env의 CORS_ORIGINS 확인
```

### "pyproj 설치 실패" (Windows)
```bash
pip install --upgrade pip
pip install pyproj==3.6.1
# 안 되면: conda install -c conda-forge pyproj
```
