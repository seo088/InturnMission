"""
반려동물 통합 지식그래프 — FastAPI 메인 진입점
FastAPI 0.115.4 | Uvicorn 0.30.6
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.routers import (
    dashboard,
    datasets,
    facilities,
    animals,
    shelters,
    travel,
    diseases,
    knowledge_graph,
    quality,
)
from app.core.config import settings


# ── 앱 시작/종료 이벤트 ──────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작: 테이블 자동 생성 (개발 환경)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ DB 연결 완료")
    yield
    # 종료
    await engine.dispose()
    print("🔌 DB 연결 종료")


# ── FastAPI 앱 생성 ───────────────────────────────────────────
app = FastAPI(
    title="반려동물 통합 지식그래프 API",
    description="14개 공공 데이터셋 기반 반려동물 지식그래프 연구 API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",       # Swagger UI: http://localhost:8000/docs
    redoc_url="/redoc",     # ReDoc:       http://localhost:8000/redoc
)


# ── CORS 설정 ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,   # ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 라우터 등록 (폴더 → API화) ────────────────────────────────
app.include_router(dashboard.router,       prefix="/api/dashboard",      tags=["📊 대시보드"])
app.include_router(datasets.router,        prefix="/api/datasets",        tags=["🗂️ 데이터셋"])
app.include_router(facilities.router,      prefix="/api/facilities",      tags=["🏥 시설"])
app.include_router(animals.router,         prefix="/api/animals",         tags=["🐾 동물"])
app.include_router(shelters.router,        prefix="/api/shelters",        tags=["🏠 보호센터"])
app.include_router(travel.router,          prefix="/api/travel",          tags=["🗺️ 여행"])
app.include_router(diseases.router,        prefix="/api/diseases",        tags=["🔬 질병"])
app.include_router(knowledge_graph.router, prefix="/api/kg",              tags=["🕸️ 지식그래프"])
app.include_router(quality.router,         prefix="/api/quality",         tags=["✅ 품질"])


# ── 헬스체크 ─────────────────────────────────────────────────
@app.get("/health", tags=["시스템"])
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
