"""ds07 — Pet-friendly travel destinations (TravelSpot) builder.

Source: KorPetTourService2 (`https://apis.data.go.kr/B551011/KorPetTourService2`).
The API requires an authentication key — to keep builds reproducible we
support a **two-stage** workflow:

1. **Fetch (one-off, online)**: caches the raw API response to
   ``preprocessed_data/07_travel.json`` (commit-friendly, deterministic).
   Triggered explicitly via ``python -m backend.kg.builders.ds07_travel fetch``.
   Reads service key from env ``PETGRAPH_TOURAPI_KEY`` only — never embedded.

2. **Build (offline, deterministic)**: reads the cache and emits TTL.
   Triggered via the standard CLI ``python -m backend.kg.cli build 07``.

This separation means CI / regression runs do not depend on network access.
URI: ``id:travel/{contentid}`` — ``contentid`` is the API's stable per-spot ID.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from backend.kg.builders.base import BaseBuilder, PRE_DIR
from backend.kg.ttl import esc, lit, safe
from backend.kg.uri import mint

CACHE_PATH = PRE_DIR / "07_travel.json"
API_BASE = "https://apis.data.go.kr/B551011/KorPetTourService2/detailPetTour2"


# ── fetch (online, one-off) ──────────────────────────────────────────────
def fetch(num_of_rows: int = 1000) -> Path:
    key = os.environ.get("PETGRAPH_TOURAPI_KEY")
    if not key:
        raise SystemExit(
            "PETGRAPH_TOURAPI_KEY env var not set. "
            "Get one at https://www.data.go.kr (KorPetTourService2)."
        )
    items: list[dict] = []
    page = 1
    while True:
        qs = urllib.parse.urlencode({
            "serviceKey": key,
            "MobileOS":   "ETC",
            "MobileApp":  "PetGraph",
            "_type":      "json",
            "pageNo":     page,
            "numOfRows":  num_of_rows,
        })
        url = f"{API_BASE}?{qs}"
        with urllib.request.urlopen(url, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        body = data.get("response", {}).get("body", {})
        node = body.get("items")
        if not node or node == "":
            break
        page_items = node.get("item", [])
        if isinstance(page_items, dict):
            page_items = [page_items]
        if not page_items:
            break
        items.extend(page_items)
        total = int(body.get("totalCount", 0) or 0)
        if len(items) >= total:
            break
        page += 1
        if page > 100:  # safety stop
            break

    PRE_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(
        json.dumps(items, ensure_ascii=False, sort_keys=True, indent=2),
        encoding="utf-8",
    )
    print(f"fetched {len(items)} travel spots → {CACHE_PATH}")
    return CACHE_PATH


# ── build (offline) ──────────────────────────────────────────────────────
class Ds07TravelBuilder(BaseBuilder):
    DATASET_ID = "07"
    SHORT_NAME = "travel"

    def build_triples(self) -> list[str]:
        if not CACHE_PATH.exists():
            # Empty graph rather than crashing — keeps `build all` runnable
            # before the user has fetched the API cache.
            return []
        items = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        items.sort(key=lambda r: str(r.get("contentid") or ""))

        out: list[str] = []
        for r in items:
            cid = r.get("contentid")
            if not safe(cid):
                continue
            uri = mint("TravelSpot", {"contentid": str(cid).strip()})
            t = [f"<{uri}>", "  a def:TravelSpot ;"]
            for src, prop in (
                ("title",  None),       # → rdfs:label
                ("addr1",  "address"),
                ("tel",    "phone"),
                ("homepage", "homepage"),
                ("overview", "remark"),
                ("areacode", "areaCode"),
                ("sigungucode", "sigunguCode"),
                ("cat1", "category"),
            ):
                v = r.get(src)
                if not safe(v):
                    continue
                if prop is None:
                    t.append(f"  rdfs:label {lit(str(v).strip())} ;")
                else:
                    t.append(f"  def:{prop} {lit(str(v).strip())} ;")

            mapx = r.get("mapx")
            mapy = r.get("mapy")
            if safe(mapx) and safe(mapy):
                try:
                    lon = float(mapx)
                    lat = float(mapy)
                    t.append(
                        "  schema:geo [ schema:latitude "
                        f'"{lat}"^^xsd:decimal ; schema:longitude "{lon}"^^xsd:decimal ] ;'
                    )
                except (TypeError, ValueError):
                    pass

            mod = r.get("modifiedtime") or r.get("createdtime")
            if safe(mod):
                t.append(f'  dct:modified "{esc(mod)}" ;')

            t[-1] = t[-1][:-1] + "."
            out.append("\n".join(t))
        return out


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "fetch":
        fetch()
    else:
        Ds07TravelBuilder.cli()
