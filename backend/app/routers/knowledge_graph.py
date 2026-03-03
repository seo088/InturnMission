from fastapi import APIRouter
from app.schemas import KGNode, KGEdge

router = APIRouter()

@router.get("/nodes", response_model=list[KGNode])
async def get_kg_nodes():
    return [
        KGNode(id="animal",   label="동물 개체",    icon="🐾", color="#0d9488", category="안전·개체", count=3120000),
        KGNode(id="hospital", label="동물병원",      icon="🏥", color="#e11d48", category="의료·케어", count=5281),
        KGNode(id="pharmacy", label="동물약국",      icon="💊", color="#e11d48", category="의료·케어", count=3102),
        KGNode(id="shelter",  label="동물보호센터",  icon="🏠", color="#7c3aed", category="보호·여가", count=279),
        KGNode(id="rescue",   label="구조동물",      icon="🚨", color="#ea580c", category="안전·개체"),
        KGNode(id="lost",     label="분실동물",      icon="🔍", color="#ea580c", category="안전·개체"),
        KGNode(id="travel",   label="동반여행지",    icon="🗺️", color="#d97706", category="보호·여가", count=72847),
        KGNode(id="disease",  label="질병·증상",     icon="🔬", color="#0284c7", category="의료·케어", count=516),
        KGNode(id="location", label="위치 노드",     icon="📍", color="#6366f1", category="공통"),
    ]

@router.get("/edges", response_model=list[KGEdge])
async def get_kg_edges():
    return [
        KGEdge(source="lost",     target="animal",   predicate="owl:sameAs",              key="rfidCd"),
        KGEdge(source="rescue",   target="shelter",  predicate="schema:containedInPlace", key="careRegNo"),
        KGEdge(source="travel",   target="location", predicate="schema:geo",              key="contentid"),
        KGEdge(source="animal",   target="disease",  predicate="schema:additionalProperty", key="upKindCd"),
        KGEdge(source="hospital", target="location", predicate="schema:geo",              key="lat/lon"),
        KGEdge(source="rescue",   target="animal",   predicate="skos:broader",            key="upKindCd"),
    ]
