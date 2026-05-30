"""KG builder CLI.

Usage::

    python -m backend.kg.cli list
    python -m backend.kg.cli build 08
    python -m backend.kg.cli build 16
    python -m backend.kg.cli build all
"""
from __future__ import annotations

import argparse
import importlib
import logging
import sys
from typing import Iterable

from backend.kg.builders.base import BaseBuilder

# Registry of (DATASET_ID → import path). Adding a new dataset is **one line**.
BUILDERS: dict[str, str] = {
    "01": "backend.kg.builders.ds01_hospital:Ds01HospitalBuilder",
    "02": "backend.kg.builders.ds02_pharmacy:Ds02PharmacyBuilder",
    "03": "backend.kg.builders.ds03_grooming:Ds03GroomingBuilder",
    "04": "backend.kg.builders.ds04_boarding:Ds04BoardingBuilder",
    "05": "backend.kg.builders.ds05_cremation:Ds05CremationBuilder",
    "07": "backend.kg.builders.ds07_travel:Ds07TravelBuilder",
    "08": "backend.kg.builders.ds08_abandoned:Ds08AbandonedBuilder",
    "09": "backend.kg.builders.ds09_lost:Ds09LostBuilder",
    "10": "backend.kg.builders.ds10_shelter:Ds10ShelterBuilder",
    "11": "backend.kg.builders.ds11_culture:Ds11CultureBuilder",
    "12": "backend.kg.builders.ds12_restarea:Ds12RestareaBuilder",
    "13": "backend.kg.builders.ds13_symptoms:Ds13SymptomsBuilder",
    "14": "backend.kg.builders.ds14_vetqa:Ds14VetQABuilder",
    "15": "backend.kg.builders.ds15_diseases:Ds15DiseasesBuilder",
    "16": "backend.kg.builders.ds16_reasoning:Ds16ReasoningBuilder",
    # 07 (TravelSpot via API) → to be implemented (P2 final)
}


def _resolve(spec: str) -> type[BaseBuilder]:
    mod, _, attr = spec.partition(":")
    return getattr(importlib.import_module(mod), attr)


def _ids(arg: str) -> Iterable[str]:
    if arg == "all":
        return sorted(BUILDERS)
    if arg in BUILDERS:
        return [arg]
    raise SystemExit(f"unknown dataset id: {arg}; known: {sorted(BUILDERS)}")


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="kg")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list", help="show registered builders")
    pb = sub.add_parser("build", help="run a builder (or all)")
    pb.add_argument("id", help="dataset id (e.g. 08, 16, all)")
    pl = sub.add_parser("load", help="PUT all turtle/*.ttl into Fuseki")
    pl.add_argument("--legacy", action="store_true",
                    help="also include animalloo_all.ttl as urn:knowledgemap:legacy")
    sub.add_parser("dqa", help="run DQA report against local TTL files")
    args = p.parse_args(argv)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s — %(message)s",
    )

    if args.cmd == "list":
        for k in sorted(BUILDERS):
            print(f"  {k}  →  {BUILDERS[k]}")
        return 0

    if args.cmd == "build":
        if args.id == "dqa":
            from backend.kg.dqa import main as dqa_main
            return dqa_main()
        if args.id == "load":
            from backend.kg.fuseki_load import main as load_main
            return load_main([])
        for did in _ids(args.id):
            cls = _resolve(BUILDERS[did])
            cls().run()
        return 0

    if args.cmd == "load":
        from backend.kg.fuseki_load import main as load_main
        argv2 = ["--legacy"] if getattr(args, "legacy", False) else []
        return load_main(argv2)

    if args.cmd == "dqa":
        from backend.kg.dqa import main as dqa_main
        return dqa_main()

    return 2


if __name__ == "__main__":
    sys.exit(main())
