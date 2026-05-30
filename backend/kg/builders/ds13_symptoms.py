"""ds13 — Symptom + SymptomCategory builder.

Provides the dictionary of symptom codes that ds16 reasoning chain references
via ``def:indicatesDisease``. URIs:

- ``id:symptom/{SymptomListCode}``
- ``id:symptom-category/{first letter of SymptomCode}``
"""
from __future__ import annotations

import pandas as pd

from backend.kg.builders.base import BaseBuilder, CSV_DIR
from backend.kg.ttl import lit, safe
from backend.kg.uri import mint


class Ds13SymptomsBuilder(BaseBuilder):
    DATASET_ID = "13"
    SHORT_NAME = "symptoms"

    SOURCE_CSV = CSV_DIR / "13_동물질병증상_데이터.csv"

    def build_triples(self) -> list[str]:
        df = pd.read_csv(self.SOURCE_CSV, encoding="utf-8-sig", low_memory=False, dtype=str)
        df = df[df["SymptomListCode"].notna()]
        df = df.sort_values(["SymptomListCode"], kind="stable").reset_index(drop=True)

        out: list[str] = []
        seen_categories: set[str] = set()

        for _, r in df.iterrows():
            code = str(r["SymptomListCode"]).strip()
            sym_uri = mint("Symptom", {"code": code})
            t = [f"<{sym_uri}>", "  a def:Symptom ;"]
            if safe(r.get("SymptomName")):
                t.append(f'  rdfs:label "{r["SymptomName"]}"@ko ;')

            cat_letter = code[:1]
            if cat_letter:
                cat_uri = mint("SymptomCategory", {"code": cat_letter})
                t.append(f"  def:categoryOf <{cat_uri}> ;")
                if cat_letter not in seen_categories:
                    seen_categories.add(cat_letter)
                    cblock = [f"<{cat_uri}>", "  a def:SymptomCategory ;"]
                    if safe(r.get("CategoryKo")):
                        cblock.append(f'  rdfs:label "{r["CategoryKo"]}"@ko ;')
                    if safe(r.get("CategoryEn")):
                        cblock.append(f'  rdfs:label "{r["CategoryEn"]}"@en ;')
                    cblock[-1] = cblock[-1][:-1] + "."
                    out.append("\n".join(cblock))

            t[-1] = t[-1][:-1] + "."
            out.append("\n".join(t))
        return out


if __name__ == "__main__":
    Ds13SymptomsBuilder.cli()
