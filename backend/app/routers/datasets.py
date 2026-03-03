from fastapi import APIRouter

router = APIRouter()

DATASETS = [
    {"id":1,  "cat":"의료·케어","icon":"🏥","name":"동물병원",       "org":"행정안전부",        "type":"api","status":"done","realtime":False,"fields":16},
    {"id":2,  "cat":"의료·케어","icon":"💊","name":"동물약국",        "org":"행정안전부",        "type":"api","status":"done","realtime":False,"fields":24},
    {"id":3,  "cat":"의료·케어","icon":"✂️","name":"동물미용업",      "org":"행정안전부",        "type":"api","status":"done","realtime":False,"fields":23},
    {"id":4,  "cat":"의료·케어","icon":"🔬","name":"KISTI 질병정보",  "org":"한국과학기술정보연구원","type":"csv","status":"done","realtime":False,"fields":5},
    {"id":5,  "cat":"의료·케어","icon":"🧬","name":"증상분류",        "org":"한국과학기술정보연구원","type":"csv","status":"done","realtime":False,"fields":3},
    {"id":6,  "cat":"보호·여가","icon":"🏠","name":"위탁관리업",      "org":"행정안전부",        "type":"api","status":"done","realtime":False,"fields":21},
    {"id":7,  "cat":"보호·여가","icon":"🗺️","name":"동반여행",        "org":"한국관광공사",      "type":"api","status":"done","realtime":False,"fields":15},
    {"id":8,  "cat":"보호·여가","icon":"🎭","name":"문화시설",        "org":"한국문화정보원",    "type":"csv","status":"done","realtime":False,"fields":12},
    {"id":9,  "cat":"이동·거점","icon":"🛑","name":"휴게소 놀이터",   "org":"한국도로공사",      "type":"csv","status":"done","realtime":False,"fields":8},
    {"id":10, "cat":"이동·거점","icon":"🏗️","name":"동물보호센터",    "org":"농림축산식품부",    "type":"api","status":"done","realtime":False,"fields":18},
    {"id":11, "cat":"안전·개체","icon":"🚨","name":"구조동물(실시간)","org":"농림축산식품부",    "type":"api","status":"done","realtime":True, "fields":22},
    {"id":12, "cat":"안전·개체","icon":"🔍","name":"분실동물(실시간)","org":"농림축산식품부",    "type":"api","status":"done","realtime":True, "fields":20},
    {"id":13, "cat":"안전·개체","icon":"🪪","name":"동물등록",        "org":"농림축산식품부",    "type":"api","status":"done","realtime":False,"fields":14},
    {"id":14, "cat":"사후관리", "icon":"🌿","name":"동물장묘업",      "org":"행정안전부",        "type":"api","status":"done","realtime":False,"fields":19},
]

@router.get("")
async def get_datasets():
    return {"data": DATASETS, "total": len(DATASETS)}
