from fastapi import APIRouter
from app.schemas import QualityMetric

router = APIRouter()

@router.get("/metrics", response_model=list[QualityMetric])
async def get_quality_metrics():
    return [
        QualityMetric(metric_name="좌표 보유율 (lat/lon)",      value=94.2, warning_msg="⚠ CRD_INFO_X/Y → WGS84 변환 필요 (행안부 4종)"),
        QualityMetric(metric_name="도로명 주소 (ROAD_NM_ADDR)", value=98.7),
        QualityMetric(metric_name="최종수정일 (DAT_UPDT_PNT)", value=81.3),
        QualityMetric(metric_name="시계열 완전성",              value=67.8, warning_msg="⚠ CSV 3종 시점 정보 부족"),
        QualityMetric(metric_name="RFID 매핑 정합성 (rfidCd)", value=91.5),
    ]
