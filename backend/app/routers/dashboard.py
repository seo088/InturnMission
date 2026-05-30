from fastapi import APIRouter
from app.services.graphdb import sparql_query
from app.schemas import DashboardStats, RegionStat, DatasetTypeStat
router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    q = """
    PREFIX def: <https://knowledgemap.kr/koah/def/>
    SELECT
      (COUNT(DISTINCT ?fac)     AS ?fac_cnt)
      (COUNT(DISTINCT ?animal)  AS ?anim)
      (COUNT(DISTINCT ?shelter) AS ?shel)
    WHERE {
      {
        { ?fac a def:AnimalHospital }
        UNION { ?fac a def:Pharmacy }
        UNION { ?fac a def:Grooming }
        UNION { ?fac a def:Boarding }
        UNION { ?fac a def:Cremation }
      }
      UNION { ?animal a def:AbandonedAnimal }
      UNION { ?shelter a def:AnimalShelter }
    }
    """
    res = await sparql_query(q)
    b = res["results"]["bindings"][0]

    triple_q = "SELECT (COUNT(*) AS ?cnt) WHERE { ?s ?p ?o }"
    triple_res = await sparql_query(triple_q)
    triple_cnt = int(triple_res["results"]["bindings"][0]["cnt"]["value"])

    return DashboardStats(
        facility_count=int(b.get("fac_cnt",{}).get("value",0)),
        animal_registered_count=int(b.get("anim",{}).get("value",0)),
        travel_spot_count=int(b.get("shel",{}).get("value",0)),
        rdf_triple_count=triple_cnt,
        dataset_count=14,
    )

@router.get("/region-stats", response_model=list[RegionStat])
async def get_region_stats():
    q = """
    PREFIX def: <https://knowledgemap.kr/koah/def/>
    SELECT ?region (COUNT(DISTINCT ?fac) AS ?cnt)
    WHERE {
      ?fac a ?type ; def:locatedIn ?regionUri .
      FILTER(?type IN (def:AnimalHospital, def:Pharmacy, def:Grooming))
      BIND(REPLACE(STR(?regionUri), "http://animalloo.kr/ontology/region/", "") AS ?region)
    }
    GROUP BY ?region ?regionUri ORDER BY DESC(?cnt) LIMIT 20
    """
    res = await sparql_query(q)
    from collections import defaultdict
    merged: defaultdict[str, int] = defaultdict(int)
    for b in res["results"]["bindings"]:
        uri = b["region"]["value"]
        # https://knowledgemap.kr/koah/id/region/경기도/수원시 → 경기도
        parts = uri.split("/region/")[-1].split("/")
        sido = parts[0] if parts else uri
        merged[sido] += int(b["cnt"]["value"])
    return [RegionStat(sido=k, count=v)
            for k, v in sorted(merged.items(), key=lambda x: -x[1])]

@router.get("/dataset-types", response_model=list[DatasetTypeStat])
async def get_dataset_types():
    return [
        DatasetTypeStat(type="API 자동수집", count=11, color="#0d9488"),
        DatasetTypeStat(type="CSV",         count=3,  color="#d97706"),
    ]
