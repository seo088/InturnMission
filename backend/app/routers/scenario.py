from fastapi import APIRouter
from app.services.graphdb import sparql_query

router = APIRouter()

PREFIX = """
PREFIX def: <https://knowledgemap.kr/koah/def/>
PREFIX schema: <https://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
"""

CAT_MAP = {
    'a': '심혈관계', 'b': '심장계', 'c': '소화기계', 'd': '안과계',
    'e': '신경·근골격계', 'f': '근골격계', 'g': '신경계', 'h': '흉부계',
    'i': '피부계', 'j': '호흡기계', 'k': '생식기계', 'l': '비뇨기계',
    'm': '대사계', 'n': '혈액계', 'o': '면역계', 'p': '기타',
}

@router.get("/symptoms")
async def get_symptoms():
    res = await sparql_query(f"""
    {PREFIX}
    SELECT DISTINCT ?s ?name ?catUri WHERE {{
      ?disease a def:Disease ;
               def:hasSymptom ?s .
      ?s rdfs:label ?name ;
         def:categoryOf ?catUri .
      FILTER(LANG(?name) = "ko")
    }}
    LIMIT 12
    """)
    return [
        {
            "uri": b["s"]["value"],
            "name": b["name"]["value"],
            "category": CAT_MAP.get(b["catUri"]["value"].split("/")[-1], "기타"),
            "code": b["s"]["value"].split("/")[-1],
        }
        for b in res["results"]["bindings"]
    ]

@router.get("/infer")
async def infer_disease(symptom_uri: str):
    # 증상 → 질병 (역방향: Disease hasSymptom Symptom)
    r1 = await sparql_query(f"""
    {PREFIX}
    SELECT ?disease ?nameKo ?nameEn ?cause ?target WHERE {{
      ?disease a def:Disease ;
               def:hasSymptom <{symptom_uri}> ;
               rdfs:label ?nameKo ;
               rdfs:label ?nameEn .
      FILTER(LANG(?nameKo) = "ko")
      FILTER(LANG(?nameEn) = "en")
      OPTIONAL {{ ?disease def:causeClass ?cause }}
      OPTIONAL {{ ?disease def:targetAnimal ?target }}
    }}
    LIMIT 3
    """)

    diseases = [
        {
            "uri": b["disease"]["value"],
            "name": b["nameKo"]["value"],
            "nameEN": b["nameEn"]["value"],
            "cause": b.get("cause", {}).get("value", ""),
            "target": b.get("target", {}).get("value", ""),
        }
        for b in r1["results"]["bindings"]
    ]

    # 인근 병원 (nearbyHospital)
    r2 = await sparql_query(f"""
    {PREFIX}
    SELECT DISTINCT ?hospital ?name ?address ?phone WHERE {{
      ?shelter a def:AnimalShelter ;
               def:nearbyHospital ?hospital .
      ?hospital rdfs:label ?name .
      OPTIONAL {{ ?hospital def:address ?address }}
      OPTIONAL {{ ?hospital def:phone ?phone }}
    }}
    LIMIT 5
    """)

    hospitals = [
        {
            "uri": b["hospital"]["value"],
            "name": b["name"]["value"],
            "address": b.get("address", {}).get("value", ""),
            "phone": b.get("phone", {}).get("value", ""),
        }
        for b in r2["results"]["bindings"]
    ]

    return {
        "diseases": diseases,
        "hospitals": hospitals,
    }

@router.get("/hospitals-map")
async def get_hospitals_map():
    res = await sparql_query(f"""
    {PREFIX}
    SELECT DISTINCT ?hospital ?name ?address ?phone ?lat ?lon WHERE {{
      ?shelter a def:AnimalShelter ;
               def:nearbyHospital ?hospital .
      ?hospital rdfs:label ?name ;
               schema:geo ?geo .
      ?geo schema:latitude ?lat ;
           schema:longitude ?lon .
      OPTIONAL {{ ?hospital def:address ?address }}
      OPTIONAL {{ ?hospital def:phone ?phone }}
    }}
    LIMIT 100
    """)
    return [
        {
            "name": b["name"]["value"],
            "address": b.get("address", {}).get("value", ""),
            "phone": b.get("phone", {}).get("value", ""),
            "lat": float(b["lat"]["value"]),
            "lon": float(b["lon"]["value"]),
        }
        for b in res["results"]["bindings"]
    ]
@router.get("/map-facilities")
async def get_map_facilities(category: str = "hospital"):
    type_map = {
        "hospital":  "def:AnimalHospital",
        "pharmacy":  "def:Pharmacy",
        "culture":   "def:CultureFacility",
        "cremation": "def:Cremation",
        "shelter":   "def:AnimalShelter",
        "boarding":  "def:Boarding",
    }
    label_map = {
        "AnimalHospital": ("동물병원",  "#e11d48"),
        "Pharmacy":       ("동물약국",  "#0284c7"),
        "CultureFacility":("문화시설",  "#7c3aed"),
        "Cremation":      ("장묘시설",  "#64748b"),
        "AnimalShelter":  ("보호센터",  "#d97706"),
        "Boarding":       ("위탁관리",  "#0d9488"),
    }

    rdf_type = type_map.get(category, "def:AnimalHospital")
    class_name = rdf_type.split(":")[-1]
    label, color = label_map.get(class_name, ("기타", "#94a3b8"))

    res = await sparql_query(f"""
    {PREFIX}
    SELECT ?s ?name ?address ?lat ?lon WHERE {{
      ?s a {rdf_type} ;
         rdfs:label ?name ;
         schema:geo ?geo .
      ?geo schema:latitude ?lat ;
           schema:longitude ?lon .
      OPTIONAL {{ ?s def:address ?address }}
    }}
    LIMIT 300
    """)

    return [
        {
            "name": b["name"]["value"],
            "address": b.get("address", {}).get("value", ""),
            "lat": float(b["lat"]["value"]),
            "lon": float(b["lon"]["value"]),
            "type": label,
            "color": color,
        }
        for b in res["results"]["bindings"]
    ]