from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import dashboard, datasets, knowledge_graph, quality
from app.core.config import settings

app = FastAPI(title="반려동물 통합 지식그래프 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router,       prefix="/api/dashboard",  tags=["대시보드"])
app.include_router(datasets.router,        prefix="/api/datasets",   tags=["데이터셋"])
app.include_router(knowledge_graph.router, prefix="/api/kg",         tags=["지식그래프"])
app.include_router(quality.router,         prefix="/api/quality",    tags=["품질"])

@app.get("/health")
async def health():
    return {"status": "ok"}
