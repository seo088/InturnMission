"""Standard TURTLE prefixes (UK URI 101 — knowledgemap.kr / KOAH 4계층).

KOAH = Korea Open Animal Hub. 프로젝트 네임스페이스를 layer 위에 두어
knowledgemap.kr 도메인 하에 다른 온톨로지가 추가되어도 충돌이 없도록 한다.
"""
from __future__ import annotations

NS = {
    "rdf":    "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs":   "http://www.w3.org/2000/01/rdf-schema#",
    "owl":    "http://www.w3.org/2002/07/owl#",
    "xsd":    "http://www.w3.org/2001/XMLSchema#",
    "schema": "https://schema.org/",
    "dct":    "http://purl.org/dc/terms/",
    # knowledgemap KOAH (UK URI 101 — def/id 계층만 실제 TTL에 사용)
    "def":    "https://knowledgemap.kr/koah/def/",
    "id":     "https://knowledgemap.kr/koah/id/",
}

PREFIXES_TTL = "".join(
    f"@prefix {(p + ':'):<8}<{u}> .\n" for p, u in NS.items()
) + "\n"
