from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class PaginationMeta(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int

class FacilityBase(BaseModel):
    id: int
    type: str
    name: Optional[str] = None
    status: Optional[str] = None
    road_addr: Optional[str] = None
    sido: Optional[str] = None
    sigungu: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    phone: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class FacilityListResponse(BaseModel):
    data: List[FacilityBase]
    meta: PaginationMeta

class DashboardStats(BaseModel):
    facility_count: int
    animal_registered_count: int
    travel_spot_count: int
    rdf_triple_count: int
    dataset_count: int

class RegionStat(BaseModel):
    sido: str
    count: int

class DatasetTypeStat(BaseModel):
    type: str
    count: int
    color: str

class QualityMetric(BaseModel):
    metric_name: str
    value: float
    warning_msg: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class KGNode(BaseModel):
    id: str
    label: str
    icon: str
    color: str
    category: str
    count: Optional[int] = None

class KGEdge(BaseModel):
    source: str
    target: str
    predicate: str
    key: Optional[str] = None
