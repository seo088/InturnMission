"""
대시보드 라우터
GET /api/dashboard/stats
GET /api/dashboard/region-stats
GET /api/dashboard/dataset-types
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from app.database import get_db
from app.models.facility import Facility
from app.models.animal import Animal
from app.models.travel import TravelSpot
from app.schemas import DashboardStats, RegionStat, DatasetTypeStat

router = APIRouter()


@router.get("/stats", response_model=DashboardStats, summary="KPI 통계 5개")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """대시보드 상단 5개 KPI 카드 데이터"""

    facility_count = await db.scalar(select(func.count()).select_from(Facility))
    animal_count   = await db.scalar(
        select(func.count()).select_from(Animal).where(Animal.type == "registered")
    )
    travel_count   = await db.scalar(select(func.count()).select_from(TravelSpot))

    return DashboardStats(
        facility_count=facility_count or 0,
        animal_registered_count=animal_count or 0,
        travel_spot_count=travel_count or 0,
        rdf_triple_count=42100,   # 계산된 고정값 (14개 데이터셋 기반)
        dataset_count=14,
    )


@router.get("/region-stats", response_model=list[RegionStat], summary="지역별 시설 TOP 7")
async def get_region_stats(db: AsyncSession = Depends(get_db)):
    """지역별 시설 수 TOP 7 (막대 차트용)"""

    result = await db.execute(
        select(Facility.sido, func.count().label("count"))
        .where(Facility.sido.isnot(None))
        .group_by(Facility.sido)
        .order_by(func.count().desc())
        .limit(7)
    )
    rows = result.fetchall()
    return [RegionStat(sido=row.sido, count=row.count) for row in rows]


@router.get("/dataset-types", response_model=list[DatasetTypeStat], summary="데이터셋 유형 분포")
async def get_dataset_types():
    """도넛 차트용 데이터셋 유형 분포 (고정 메타데이터)"""
    return [
        DatasetTypeStat(type="API 연동",  count=11, color="#0d9488"),
        DatasetTypeStat(type="CSV",       count=3,  color="#d97706"),
        DatasetTypeStat(type="실시간",    count=2,  color="#e11d48"),
    ]
