from fastapi import APIRouter
from app.services.graphdb import sparql_query
from app.schemas import QualityMetric

router = APIRouter()

P = "PREFIX def: <https://knowledgemap.kr/koah/def/>\nPREFIX schema: <https://schema.org/>"

async def count_query(q: str) -> int:
    try:
        res = await sparql_query(q)
        return int(res["results"]["bindings"][0]["cnt"]["value"])
    except:
        return 0

@router.get("/metrics", response_model=list[QualityMetric])
async def get_quality_metrics():

    total_hosp  = await count_query(f"{P}\nSELECT (COUNT(DISTINCT ?s) AS ?cnt) WHERE {{ ?s a def:AnimalHospital }}")
    geo_hosp    = await count_query(f"{P}\nSELECT (COUNT(DISTINCT ?s) AS ?cnt) WHERE {{ ?s a def:AnimalHospital ; schema:geo ?g }}")
    addr_hosp   = await count_query(f"{P}\nSELECT (COUNT(DISTINCT ?s) AS ?cnt) WHERE {{ ?s a def:AnimalHospital ; def:address ?a }}")
    total_rsc   = await count_query(f"{P}\nSELECT (COUNT(DISTINCT ?s) AS ?cnt) WHERE {{ ?s a def:AbandonedAnimal }}")
    linked_rsc  = await count_query(f"{P}\nSELECT (COUNT(DISTINCT ?s) AS ?cnt) WHERE {{ ?s a def:AbandonedAnimal ; def:protectedBy ?sh }}")
    total_lost  = await count_query(f"{P}\nSELECT (COUNT(DISTINCT ?s) AS ?cnt) WHERE {{ ?s a def:LostAnimal }}")
    grade_a     = await count_query(f'{P}\nSELECT (COUNT(DISTINCT ?s) AS ?cnt) WHERE {{ ?s a def:LostAnimal ; def:matchingGrade "A_rfid" }}')
    total_sym   = await count_query(f"{P}\nSELECT (COUNT(DISTINCT ?s) AS ?cnt) WHERE {{ ?s a def:Symptom }}")
    linked_sym  = await count_query(f"{P}\nSELECT (COUNT(DISTINCT ?s) AS ?cnt) WHERE {{ ?s a def:Symptom ; def:indicatesDisease ?d }}")

    def pct(a, b): return round(a / b * 100, 1) if b else 0

    coord_pct = pct(geo_hosp,   total_hosp)
    addr_pct  = pct(addr_hosp,  total_hosp)
    fk_pct    = pct(linked_rsc, total_rsc)
    match_pct = pct(grade_a,    total_lost)
    sym_pct   = pct(linked_sym, total_sym)

    return [
        QualityMetric(metric_name="좌표 완전성 (schema:geo)", value=coord_pct,
            warning_msg=None if coord_pct >= 90 else f"⚠️ {100-coord_pct:.1f}% 누락"),
        QualityMetric(metric_name="주소 완전성 (def:address)", value=addr_pct,
            warning_msg=None if addr_pct >= 90 else f"⚠️ {100-addr_pct:.1f}% 누락"),
        QualityMetric(metric_name="보호센터 FK 연결율", value=fk_pct,
            warning_msg=None if fk_pct >= 90 else f"⚠️ deadlink {100-fk_pct:.1f}%"),
        QualityMetric(metric_name="분실동물 A등급 매칭율", value=match_pct,
            warning_msg=None),
        QualityMetric(metric_name="증상-질병 링크 보유율", value=sym_pct,
            warning_msg=None if sym_pct >= 10 else "⚠️ 증상-질병 링크 부족"),
    ]