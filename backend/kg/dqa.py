"""DQA report generator — runs ISO/IEC 25012 probes against local TTL files
using rdflib (no Fuseki needed).

Usage::
    python -m backend.kg.dqa
    python -m backend.kg.dqa > reports/dqa-$(date +%F).txt

Replicates the SPARQL queries from
``reports/instance-quality-2026-04-08.md`` §B against the union of all
``turtle/[0-9][0-9]_*.ttl`` + ``def_animal.ttl``.
"""
from __future__ import annotations

from collections import defaultdict
from pathlib import Path

from rdflib import Graph, URIRef
from rdflib.namespace import RDF, RDFS

DEF = "http://knowledgemap.kr/def/animal/"
TURTLE = Path("turtle")

CLASS_NAMES = (
    "AnimalHospital", "Pharmacy", "Grooming", "Boarding", "Cremation",
    "AbandonedAnimal", "Dog", "Cat", "LostAnimal", "AnimalShelter",
    "CultureFacility", "RestArea", "TravelSpot",
    "Symptom", "SymptomCategory", "Disease", "VetDepartment", "VetQA",
)


def load_union() -> Graph:
    g = Graph()
    for f in sorted(TURTLE.glob("[0-9][0-9]_*.ttl")):
        g.parse(f, format="turtle")
    g.parse(TURTLE / "def_animal.ttl", format="turtle")
    return g


def main() -> int:
    out_path = Path("reports") / "dqa-latest.txt"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_lines: list[str] = []

    def emit(s: str = "") -> None:
        out_lines.append(s)
        print(s)

    emit("# DQA report — local TTL union")
    g = load_union()
    emit(f"\n## Total triples: {len(g):,}\n")

    # 1. distinct instance count per class
    emit("## B-1. Distinct instances per class")
    emit("class                    distinct")
    distinct: dict[str, int] = {}
    for name in CLASS_NAMES:
        cls = URIRef(DEF + name)
        n = len(set(g.subjects(RDF.type, cls)))
        distinct[name] = n
        emit(f"{name:25s} {n:>8,}")

    # 2. label completeness
    emit("\n## B-2. rdfs:label completeness (label-bearing classes)")
    emit("class                    n   missing")
    for name in ("AnimalHospital", "Pharmacy", "Grooming", "Boarding",
                 "Cremation", "AnimalShelter", "CultureFacility", "RestArea", "Disease",
                 "Symptom", "SymptomCategory", "VetDepartment"):
        cls = URIRef(DEF + name)
        subs = set(g.subjects(RDF.type, cls))
        missing = sum(1 for s in subs if (s, RDFS.label, None) not in g)
        emit(f"{name:25s} {len(subs):>5} {missing:>8}")

    # 3. ds08 → ds10 protectedBy FK consistency
    emit("\n## B-3. ds08 protectedBy → ds10 join")
    pb = URIRef(DEF + "protectedBy")
    sh = URIRef(DEF + "AnimalShelter")
    refs = set(o for s, p, o in g.triples((None, pb, None)))
    have = set(g.subjects(RDF.type, sh))
    miss = refs - have
    emit(f"  abandoned animals: {distinct['AbandonedAnimal']}")
    emit(f"  referenced shelters: {len(refs)}")
    emit(f"  ds10 has:            {len(have)}")
    emit(f"  deadlinks:           {len(miss)} ({100*len(miss)/max(1,len(refs)):.1f}%)")

    # 4. reasoning chain reachability
    emit("\n## B-4. Symptom -> Disease -> Department reachability")
    sym = URIRef(DEF + "Symptom")
    ind = URIRef(DEF + "indicatesDisease")
    tdept = URIRef(DEF + "treatedByDept")
    paths = 0
    for sym_s in g.subjects(RDF.type, sym):
        for _, _, dis in g.triples((sym_s, ind, None)):
            for _, _, dept in g.triples((dis, tdept, None)):
                paths += 1
    emit(f"  reachable paths: {paths}")

    # 5. region coverage
    emit("\n## B-5. region coverage (locatedIn / foundAt)")
    emit("class                    n   with_region")
    li = URIRef(DEF + "locatedIn")
    fa = URIRef(DEF + "foundAt")
    for name in ("AnimalHospital", "Pharmacy", "Grooming", "Boarding",
                 "Cremation", "CultureFacility", "RestArea",
                 "AbandonedAnimal", "LostAnimal", "AnimalShelter"):
        cls = URIRef(DEF + name)
        subs = set(g.subjects(RDF.type, cls))
        with_r = sum(
            1 for s in subs
            if (s, li, None) in g or (s, fa, None) in g
        )
        emit(f"{name:25s} {len(subs):>5} {with_r:>10}")

    # 6. Disease consistency (F2 fix verification)
    emit("\n## B-6. Disease typing graph distribution")
    dis = URIRef(DEF + "Disease")
    dis_subs = list(g.subjects(RDF.type, dis))
    emit(f"  distinct Disease subjects: {len(set(dis_subs))}")
    emit(f"  total Disease typing triples: {len(dis_subs)}")

    out_path.write_text("\n".join(out_lines) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
