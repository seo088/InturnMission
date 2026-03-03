from fastapi import APIRouter
from app.schemas import DashboardStats, RegionStat, DatasetTypeStat

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    return DashboardStats(
        facility_count=5281,
        animal_registered_count=3120000,
        travel_spot_count=72847,
        rdf_triple_count=42100,
        dataset_count=14,
    )

@router.get("/region-stats", response_model=list[RegionStat])
async def get_region_stats():
    return [
        RegionStat(sido="경기", count=1820),
        RegionStat(sido="서울", count=1250),
        RegionStat(sido="부산", count=680),
        RegionStat(sido="경남", count=590),
        RegionStat(sido="대구", count=520),
        RegionStat(sido="인천", count=440),
        RegionStat(sido="경북", count=380),
    ]

@router.get("/dataset-types", response_model=list[DatasetTypeStat])
async def get_dataset_types():
    return [
        DatasetTypeStat(type="API 연동", count=11, color="#0d9488"),
        DatasetTypeStat(type="CSV",      count=3,  color="#d97706"),
        DatasetTypeStat(type="실시간",   count=2,  color="#e11d48"),
    ]
