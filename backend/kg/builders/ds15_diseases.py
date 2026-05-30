"""ds15 — Disease master builder.

Foreign-key target of ds16 ``def:indicatesDisease``. Loads via the same
encoding fallback chain as ds16's ``_load_diseases`` and filters to
companion-animal diseases (개/고양이/견/묘).
"""
from __future__ import annotations

from backend.kg.builders.base import BaseBuilder
from backend.kg.builders.ds16_reasoning import _load_diseases
from backend.kg.ttl import lit, safe
from backend.kg.uri import mint


class Ds15DiseasesBuilder(BaseBuilder):
    DATASET_ID = "15"
    SHORT_NAME = "diseases"

    def build_triples(self) -> list[str]:
        df = _load_diseases()
        df = df[df["MainTargetAnimal"].str.contains("개|고양이|견|묘", na=False)].copy()
        df = df.sort_values("DiseaseNo", kind="stable").reset_index(drop=True)

        out: list[str] = []
        for _, r in df.iterrows():
            try:
                no = int(r["DiseaseNo"])
            except (TypeError, ValueError):
                continue
            uri = mint("Disease", {"no": no})
            t = [f"<{uri}>", "  a def:Disease ;"]
            if safe(r.get("DiseaseName")):
                t.append(f'  rdfs:label "{r["DiseaseName"]}"@ko ;')
            if safe(r.get("DiseaseNameEN")):
                t.append(f'  rdfs:label "{r["DiseaseNameEN"]}"@en ;')
            for col, prop in (
                ("MainTargetAnimal", "targetAnimal"),
                ("CauseClass",       "causeClass"),
            ):
                v = r.get(col)
                if safe(v):
                    t.append(f"  def:{prop} {lit(str(v).strip())} ;")
            t[-1] = t[-1][:-1] + "."
            out.append("\n".join(t))
        return out


if __name__ == "__main__":
    Ds15DiseasesBuilder.cli()
