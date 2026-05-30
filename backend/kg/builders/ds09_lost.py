"""ds09 — Lost animal builder.

The CSV has no NoticeNo so we mint URIs from the preprocessed
``match_composite_key`` (Sido + Sigungu + Kind + Color + Sex hash). PII
fields (CallTel, CallName) are dropped from the RDF — only a sha1 fingerprint
is kept so re-identification requires re-joining the source CSV.
"""
from __future__ import annotations

import hashlib

import pandas as pd

from backend.kg.builders.base import BaseBuilder, PRE_DIR
from backend.kg.ttl import esc, lit, safe
from backend.kg.uri import mint


def _stable_key(row: pd.Series) -> str:
    """Composite key — deterministic, PII-free, per-individual.

    Strategy (in order of strength):
    1. RfidCode (the strongest natural ID — guaranteed unique per chip)
    2. ``match_composite_key`` (preprocessing) + HappenDate + HappenAddrDtl
       (HappenAddrDtl distinguishes two losses in same district on same day)
    3. fallback: full row sha1

    F1 fix (kg-build-review-2026-04-08): the original implementation used only
    ``match_composite_key`` which intentionally collapsed look-alike pets for
    matching purposes — the result was 2,963 → 12 distinct individuals
    (99.6% loss). This version restores per-individual identity.
    """
    rfid = row.get("RfidCode")
    if safe(rfid) and str(rfid).strip() not in ("0", "0.0"):
        return "rfid-" + str(rfid).strip()

    parts: list[str] = []
    if safe(row.get("match_composite_key")):
        parts.append(str(row["match_composite_key"]).strip())
    for col in ("HappenDate", "HappenAddrDtl", "HappenPlace", "OrgNm", "Image"):
        v = row.get(col)
        if safe(v):
            parts.append(str(v).strip())
    if not parts:
        parts = [str(row.get(c, "")) for c in row.index]
    return hashlib.sha1("|".join(parts).encode("utf-8")).hexdigest()[:16]


class Ds09LostBuilder(BaseBuilder):
    DATASET_ID = "09"
    SHORT_NAME = "lost_animal"

    SOURCE_CSV = PRE_DIR / "09_lost_animal.csv"

    def build_triples(self) -> list[str]:
        df = pd.read_csv(self.SOURCE_CSV, encoding="utf-8-sig", low_memory=False, dtype=str)
        df["lost_key"] = df.apply(_stable_key, axis=1)
        df = df.sort_values("lost_key", kind="stable").reset_index(drop=True)

        out: list[str] = []
        for _, r in df.iterrows():
            key = r["lost_key"]
            subj = mint("LostAnimal", {"lostNoticeNo": key})
            t = [f"<{subj}>", "  a def:LostAnimal ;"]
            for col, prop in (
                ("KindCode",   "animalBreed"),
                ("ColorCode",  "colorCode"),
                ("SexCode",    "neuterYn"),  # legacy: schema:gender — but vocab has neuterYn only; use schema below
                ("Age",        "ageDetail"),
                ("HappenAddr", "happenPlace"),
                ("HappenDate", "happenDate"),
                ("SpecialMark", "specialMark"),
                ("RfidCode",   "rfidCode"),
            ):
                v = r.get(col)
                if not safe(v):
                    continue
                if col == "HappenDate":
                    t.append(f'  def:{prop} "{esc(v)}"^^xsd:date ;')
                elif col == "SexCode":
                    t.append(f"  schema:gender {lit(str(v).strip())} ;")
                else:
                    t.append(f"  def:{prop} {lit(str(v).strip())} ;")

            if safe(r.get("Image")):
                t.append(f"  schema:image {lit(str(r['Image']).strip())} ;")

            if safe(r.get("Sido")) and safe(r.get("Sigungu")):
                region = mint("Region", {"sido": r["Sido"], "sgg": r["Sigungu"]})
                t.append(f"  def:foundAt <{region}> ;")

            if safe(r.get("matching_grade")):
                t.append(f"  def:matchingGrade {lit(str(r['matching_grade']).strip())} ;")

            # PII contact: keep only a hash (no plaintext phone/name)
            if safe(r.get("CallTel")):
                h = hashlib.sha1(str(r["CallTel"]).encode()).hexdigest()[:12]
                t.append(f"  def:contactHash {lit(h)} ;")

            t[-1] = t[-1][:-1] + "."
            out.append("\n".join(t))
        return out


if __name__ == "__main__":
    Ds09LostBuilder.cli()
