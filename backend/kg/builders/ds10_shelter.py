"""ds10 — Animal shelter builder.

Foreign-key target of ds08 ``def:protectedBy``. Stable URI:
``id:shelter/{CareRegNo}``. CareRegNo strings are kept verbatim (slugged) so
the URI matches what ds08 emits.
"""
from __future__ import annotations

import pandas as pd

from backend.kg.builders.base import BaseBuilder, CSV_DIR
from backend.kg.builders.ds08_abandoned import extract_sido, extract_sigungu, normalize_carereg
from backend.kg.ttl import esc, lit, safe
from backend.kg.uri import mint


class Ds10ShelterBuilder(BaseBuilder):
    DATASET_ID = "10"
    SHORT_NAME = "shelter"

    SOURCE_CSV = CSV_DIR / "10_동물보호센터_조회데이터.csv"

    def build_triples(self) -> list[str]:
        df = pd.read_csv(self.SOURCE_CSV, encoding="utf-8-sig", low_memory=False, dtype=str)
        df["CareRegNo"] = df["CareRegNo"].apply(normalize_carereg)
        df = df[df["CareRegNo"].notna()]
        df = df.sort_values("CareRegNo", kind="stable").reset_index(drop=True)

        out: list[str] = []
        for _, r in df.iterrows():
            care = r["CareRegNo"]
            subj = mint("AnimalShelter", {"careRegNo": care})
            t: list[str] = [f"<{subj}>", "  a def:AnimalShelter ;"]
            if safe(r.get("CareNm")):
                t.append(f"  rdfs:label {lit(str(r['CareNm']).strip())} ;")
            if safe(r.get("CareTel")):
                t.append(f"  def:phone {lit(str(r['CareTel']).strip())} ;")
            for col, prop in (
                ("CareAddr",       "address"),
                ("DivisionNm",     "category"),
                ("SaveTrgtAnimal", "targetAnimal"),
                ("DsignationDate", "designatedDate"),
                # F5: operating-hours block (8 columns) + capacity counts
                ("WeekOprStime",     "weekdayOpenTime"),
                ("WeekOprEtime",     "weekdayCloseTime"),
                ("WeekCellStime",    "weekdayCellOpenTime"),
                ("WeekCellEtime",    "weekdayCellCloseTime"),
                ("WeekendOprStime",  "weekendOpenTime"),
                ("WeekendOprEtime",  "weekendCloseTime"),
                ("WeekendCellStime", "weekendCellOpenTime"),
                ("WeekendCellEtime", "weekendCellCloseTime"),
                ("CloseDay",         "closeDay"),
                ("VetPersonCnt",     "vetStaffCount"),
                ("SpecsPersonCnt",   "specStaffCount"),
                ("MedicalCnt",       "medicalCount"),
                ("BreedCnt",         "breedCount"),
                ("QuarantineCnt",    "quarantineCount"),
                ("FeedCnt",          "feedCount"),
                ("TransCarCnt",      "transportCarCount"),
            ):
                v = r.get(col)
                if safe(v):
                    t.append(f"  def:{prop} {lit(str(v).strip())} ;")

            lat, lng = r.get("lat"), r.get("lng")
            if safe(lat) and safe(lng):
                try:
                    la, lo = float(lat), float(lng)
                    t.append(
                        "  schema:geo [ schema:latitude "
                        f'"{la}"^^xsd:decimal ; schema:longitude "{lo}"^^xsd:decimal ] ;'
                    )
                except (TypeError, ValueError):
                    pass

            sido = extract_sido(r.get("CareAddr")) or extract_sido(r.get("JibunAddr"))
            sgg = extract_sigungu(r.get("CareAddr")) or extract_sigungu(r.get("JibunAddr"))
            if safe(sido) and safe(sgg):
                region = mint("Region", {"sido": sido, "sgg": sgg})
                t.append(f"  def:locatedIn <{region}> ;")

            if safe(r.get("DataStdDt")):
                t.append(f'  dct:modified "{esc(r["DataStdDt"])}" ;')

            t[-1] = t[-1][:-1] + "."
            out.append("\n".join(t))
        return out


if __name__ == "__main__":
    Ds10ShelterBuilder.cli()
