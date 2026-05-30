from fastapi import APIRouter
from app.services.graphdb import sparql_query
from app.schemas import KGNode, KGEdge

router = APIRouter()

ICON_MAP = {
    "AnimalHospital": ("🏥", "#e11d48", "의료·케어"),
    "Pharmacy":       ("💊", "#e11d48", "의료·케어"),
    "Grooming":       ("✂️", "#f97316", "의료·케어"),
    "Boarding":       ("🏠", "#0d9488", "보호·여가"),
    "Cremation":      ("🌿", "#6366f1", "사후관리"),
    "AnimalShelter":  ("🏠", "#7c3aed", "보호·여가"),
    "AbandonedAnimal":("🚨", "#ea580c", "안전·개체"),
    "LostAnimal":     ("🔍", "#ea580c", "안전·개체"),
    "Dog":            ("🐕", "#0d9488", "안전·개체"),
    "Cat":            ("🐈", "#0d9488", "안전·개체"),
    "TravelSpot":     ("🗺️", "#d97706", "보호·여가"),
    "CultureFacility":("🎭", "#d97706", "보호·여가"),
    "RestArea":       ("🛑", "#d97706", "이동·거점"),
    "Symptom":        ("🧬", "#0284c7", "의료·케어"),
    "Disease":        ("🔬", "#0284c7", "의료·케어"),
    "SymptomCategory":("📋", "#0284c7", "의료·케어"),
    "VetQA":          ("💬", "#0284c7", "의료·케어"),
    "Facility":       ("📍", "#64748b", "공통"),
}

@router.get("/nodes", response_model=list[KGNode])
async def get_kg_nodes():
    q = """
    SELECT ?type (COUNT(*) AS ?cnt)
    WHERE {
      ?s a ?type .
      FILTER(
        STRSTARTS(STR(?type), "https://knowledgemap.kr/koah/def/") ||
        STRSTARTS(STR(?type), "http://animalloo.kr/ontology#")
      )
    }
    GROUP BY ?type ORDER BY DESC(?cnt)
    """
    res = await sparql_query(q)
    nodes = []
    for b in res["results"]["bindings"]:
        uri = b["type"]["value"]
        t = uri.split("/")[-1].split("#")[-1]
        icon, color, cat = ICON_MAP.get(t, ("📌", "#64748b", "기타"))
        nodes.append(KGNode(
            id=t, label=t, icon=icon, color=color,
            category=cat, count=int(b["cnt"]["value"])
        ))
    # 중복 노드 제거 (같은 id는 count 합산)
    merged = {}
    for node in nodes:
        if node.id in merged:
            merged[node.id] = KGNode(
                id=node.id,
                label=node.label,
                icon=node.icon,
                color=node.color,
                category=node.category,
                count=merged[node.id].count + node.count
            )
        else:
            merged[node.id] = node
    return list(merged.values())

@router.get("/edges", response_model=list[KGEdge])
async def get_kg_edges():
    q = """
    PREFIX def: <https://knowledgemap.kr/koah/def/>
    SELECT ?pred (COUNT(*) AS ?cnt)
    WHERE {
      VALUES ?pred {
        def:protectedBy
        def:foundAt
        def:locatedIn
        def:matchingGrade
        def:hasSymptom
        def:treatedByDept
        def:mapsTo
        def:indicatesDisease
      }
      ?s ?pred ?o .
    }
    GROUP BY ?pred
    ORDER BY DESC(?cnt)
    """
    res = await sparql_query(q)

    # predicate 로컬명 → (source 클래스, target 클래스, 조인 키)
    EDGE_META: dict[str, tuple[str, str, str]] = {
        "locatedIn":        ("Facility",        "Region",          "address"),
        "foundAt":          ("AbandonedAnimal", "Region",          "sido"),
        "protectedBy":      ("AbandonedAnimal", "AnimalShelter",   "careRegNo"),
        "matchingGrade":    ("LostAnimal",      "AbandonedAnimal", "rfidCode"),
        "hasSymptom":       ("Disease",         "Symptom",         "diseaseCode"),
        "treatedByDept":    ("Disease",         "VetDepartment",   "diseaseCode"),
        "mapsTo":           ("SymptomCategory", "VetDepartment",   "categoryCode"),
        "indicatesDisease": ("Symptom",         "Disease",         "symptomCode"),
    }

    edges = []
    for b in res["results"]["bindings"]:
        local = b["pred"]["value"].split("/")[-1]
        cnt   = int(b["cnt"]["value"])
        if local in EDGE_META and cnt > 0:
            src, tgt, key = EDGE_META[local]
            edges.append(KGEdge(
                source=src, target=tgt,
                predicate=f"def:{local}", key=key, count=cnt,
            ))
    return edges
