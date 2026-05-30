"""ds08 — Abandoned animal builder (canonical).

Replaces the three duplicated root scripts:

- ``qa_to_turtle.py``       (canonical content)
- ``rescue_to_turtle1.py``  (byte-identical to qa_to_turtle.py)
- ``rescue_to_turtle.py``   (older variant — superseded)

Behavior preserved from ``qa_to_turtle.py``:

- ProcessState=='보호중' filter
- Date YYYYMMDD → YYYY-MM-DD (xsd:date typed)
- Weight numeric extraction
- Age (BirthYear, AgeDetail) parsing with garbage-value filter
- RFID normalization
- Image1..Image4 → ImageMain + ImageList
- Sido / Sigungu extraction (OrgNm → CareAddr fallback)
- CareRegNo normalization
- Triples linked to AnimalShelter (protectedBy) and Region (foundAt)

URIs are now ``https://knowledgemap.kr/koah/id/abandoned/{careRegNo}/{noticeNo}``
via ``backend.kg.uri.mint`` — direct string assembly is forbidden.

Output is **deterministic**: rows are sorted by ``DesertionNo`` before
serialization, and no timestamps or random IDs are emitted.
"""
from __future__ import annotations

import re
from typing import Iterable

import pandas as pd

from backend.kg.builders.base import BaseBuilder, CSV_DIR, PRE_DIR
from backend.kg.ttl import esc, lit, safe, slug
from backend.kg.uri import mint

# ── constants (carried verbatim from legacy qa_to_turtle.py) ─────────────
GARBAGE_DETAIL = frozenset({"년생", "년", "생", "년생)", "(년생)"})

SIDO_PAT = re.compile(
    r"(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시"
    r"|세종특별자치시|경기도|강원특별자치도|충청북도|충청남도"
    r"|전북특별자치도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)"
)
SIGUNGU_PAT = re.compile(
    r"(?:특별시|광역시|특별자치시|특별자치도|도)\s*(\S+?[시군구])\b"
)


# ── pure transforms (each unit-testable) ─────────────────────────────────
def fmt_date(v) -> str | None:
    s = str(v).strip()
    if re.fullmatch(r"\d{8}", s):
        return f"{s[:4]}-{s[4:6]}-{s[6:]}"
    return s if s and s.lower() != "nan" else None


def parse_weight(v) -> float | None:
    if not safe(v):
        return None
    m = re.search(r"([\d.]+)", str(v))
    if not m:
        return None
    s = re.sub(r"\.{2,}", ".", m.group(1)).strip(".")
    try:
        return float(s)
    except ValueError:
        return None


def parse_age(v) -> tuple[str | None, str | None]:
    if not safe(v):
        return None, None
    s = str(v)
    year_m = re.search(r"(\d{4})", s)
    year = year_m.group(1) if year_m else None
    s_no_year = s.replace(year_m.group(), "", 1) if year_m else s
    detail_m = re.search(r"\(([^)]+)\)", s_no_year)
    detail = detail_m.group(1).strip() if detail_m else None
    if detail in GARBAGE_DETAIL:
        detail = None
    return year, detail


def extract_sido(v) -> str | None:
    if not safe(v):
        return None
    m = SIDO_PAT.match(str(v).strip())
    return m.group(1) if m else None


def extract_sigungu(v) -> str | None:
    if not safe(v):
        return None
    m = SIGUNGU_PAT.search(str(v))
    return m.group(1) if m else None


def normalize_rfid(v) -> str | None:
    if not safe(v):
        return None
    s = str(v).strip()
    try:
        return str(int(float(s)))
    except (ValueError, OverflowError):
        return None


def normalize_carereg(v) -> str | None:
    if not safe(v):
        return None
    s = str(v).strip()
    if s.replace(".", "", 1).isdigit():
        try:
            return str(int(float(s)))
        except (ValueError, OverflowError):
            return s
    return s


# ── builder ──────────────────────────────────────────────────────────────
class Ds08AbandonedBuilder(BaseBuilder):
    DATASET_ID = "08"
    SHORT_NAME = "abandoned_animal"

    SOURCE_CSV = CSV_DIR / "08_구조동물_조회데이터.csv"
    PREPROCESSED_CSV = PRE_DIR / "08_abandoned_animal.csv"
    SHELTER_MASTER_CSV = CSV_DIR / "10_동물보호센터_조회데이터.csv"

    def _shelter_master(self) -> set[str]:
        """F3 fix: pre-load ds10 master CareRegNo set so we can suppress
        ``def:protectedBy`` triples for animals whose shelter is not in the
        master (10.7% deadlink rate observed). Logged at INFO level."""
        if not self.SHELTER_MASTER_CSV.exists():
            return set()
        master = pd.read_csv(self.SHELTER_MASTER_CSV, encoding="utf-8-sig",
                             low_memory=False, dtype=str)
        return {normalize_carereg(v) for v in master["CareRegNo"].dropna()
                if normalize_carereg(v)}

    # ---- preprocess ----------------------------------------------------
    def preprocess(self) -> pd.DataFrame:
        df = pd.read_csv(self.SOURCE_CSV, encoding="utf-8-sig", low_memory=False)
        df = df[df["ProcessState"] == "보호중"].copy()

        for col in ("HappenDate", "NoticeSDate", "NoticeEDate"):
            if col in df.columns:
                df[col] = df[col].apply(fmt_date)

        df["WeightKg"] = df["Weight"].apply(parse_weight)
        df[["BirthYear", "AgeDetail"]] = df["Age"].apply(
            lambda v: pd.Series(parse_age(v))
        )
        df["RfidCode"] = df["RfidCode"].apply(normalize_rfid)

        img_cols = [c for c in df.columns if c.startswith("Image")]
        df["ImageList"] = df[img_cols].apply(
            lambda row: "|".join(str(v) for v in row if safe(v)), axis=1
        )
        df["ImageMain"] = df["Image1"].where(df["Image1"].notna(), None)

        df["Sido"] = df["OrgNm"].apply(extract_sido)
        df["Sigungu"] = df["OrgNm"].apply(extract_sigungu)
        mask = df["Sido"].isna()
        df.loc[mask, "Sido"] = df.loc[mask, "CareAddr"].apply(extract_sido)
        df.loc[mask, "Sigungu"] = df.loc[mask, "CareAddr"].apply(extract_sigungu)
        df["region_key"] = df["Sido"].fillna("") + "_" + df["Sigungu"].fillna("")

        df["CareRegNo"] = df["CareRegNo"].apply(normalize_carereg)

        drop_cols = [c for c in df.columns if c.startswith("Image") and c != "ImageMain"]
        df = df.drop(columns=drop_cols + ["Weight", "Age"], errors="ignore")

        # determinism: stable row order
        df = df.sort_values("DesertionNo", kind="stable").reset_index(drop=True)

        PRE_DIR.mkdir(parents=True, exist_ok=True)
        df.to_csv(self.PREPROCESSED_CSV, index=False, encoding="utf-8-sig")
        return df

    # ---- triple builder ------------------------------------------------
    def _row_to_triples(self, r: pd.Series, shelter_master: set[str]) -> str:
        care = r.get("CareRegNo")
        notice = r.get("NoticeNo")
        if not (safe(care) and safe(notice)):
            return ""  # cannot mint stable URI without both keys

        subj = f"<{mint('AbandonedAnimal', {'careRegNo': care, 'noticeNo': notice})}>"
        t: list[str] = [subj]

        upkind = str(r.get("UpKindName", "")).strip()
        types = ["def:AbandonedAnimal"]
        if upkind == "개":
            types.append("def:Dog")
        elif upkind == "고양이":
            types.append("def:Cat")
        t.append(f"  a {', '.join(types)} ;")

        # identifiers
        t.append(f"  def:desertionNo {lit(str(r['DesertionNo']).strip())} ;")
        t.append(f"  def:noticeNo {lit(str(notice))} ;")

        # animal
        for col, prop in (
            ("KindName",     "animalBreed"),
            ("KindFullName", "kindFullName"),
            ("ColorCode",    "colorCode"),
            ("NeuterYn",     "neuterYn"),
            ("BirthYear",    "birthYear"),
            ("AgeDetail",    "ageDetail"),
            ("SpecialMark",  "specialMark"),
        ):
            v = r.get(col)
            if safe(v):
                t.append(f"  def:{prop} {lit(str(v).strip())} ;")
        if safe(r.get("SexCode")):
            t.append(f"  schema:gender {lit(r['SexCode'])} ;")
        if safe(r.get("WeightKg")):
            t.append(f"  def:weightKg {float(r['WeightKg']):.1f} ;")

        # state + dates
        t.append(f"  def:processState {lit('보호중')} ;")
        for col, prop in (
            ("HappenDate", "happenDate"),
            ("NoticeSDate", "noticeSDate"),
            ("NoticeEDate", "noticeEDate"),
        ):
            v = r.get(col)
            if safe(v):
                t.append(f'  def:{prop} "{esc(v)}"^^xsd:date ;')

        if safe(r.get("HappenPlace")):
            t.append(f"  def:happenPlace {lit(str(r['HappenPlace']).strip())} ;")

        # images
        if safe(r.get("ImageMain")):
            t.append(f"  schema:image {lit(str(r['ImageMain']))} ;")
        if safe(r.get("ImageList")):
            t.append(f"  def:imageList {lit(str(r['ImageList']))} ;")

        for col, prop in (
            ("VaccinationChk", "vaccinationChk"),
            ("HealthChk",      "healthChk"),
            ("AdptnTitle",     "adoptionTitle"),
            ("AdptnCondition", "adoptionCondition"),
            ("RfidCode",       "rfidCode"),
        ):
            v = r.get(col)
            if safe(v):
                t.append(f"  def:{prop} {lit(str(v).strip())} ;")
        if safe(r.get("AdptnTxt")):
            t.append(f"  def:adoptionText {lit(str(r['AdptnTxt'])[:200])} ;")

        # provenance / freshness — required by instance-quality-reviewer DQA
        if safe(r.get("UpdateTime")):
            t.append(f'  dct:modified "{esc(r["UpdateTime"])}" ;')
        if safe(r.get("EndReason")):
            t.append(f"  def:endReason {lit(str(r['EndReason']).strip())} ;")

        # relationships (centralized URI mint — no string assembly)
        # F3: only emit protectedBy when the shelter exists in the ds10 master,
        # otherwise stash the unresolved CareRegNo as a literal so the source
        # data is not lost (allowed deadlink rate after fix: 0%).
        if shelter_master and care in shelter_master:
            shelter_uri = mint("AnimalShelter", {"careRegNo": care})
            t.append(f"  def:protectedBy <{shelter_uri}> ;")
        else:
            t.append(f"  def:unresolvedCareRegNo {lit(str(care).strip())} ;")

        if safe(r.get("Sido")) and safe(r.get("Sigungu")):
            region_uri = mint("Region", {"sido": r["Sido"], "sgg": r["Sigungu"]})
            t.append(f"  def:foundAt <{region_uri}> ;")

        # terminate the last predicate with '.' instead of ';'
        t[-1] = t[-1][:-1] + "."
        return "\n".join(t)

    # ---- entry point ---------------------------------------------------
    def build_triples(self) -> list[str]:
        df = self.preprocess()
        master = self._shelter_master()
        unresolved = sum(1 for c in df["CareRegNo"].dropna() if c not in master)
        if unresolved:
            import logging
            logging.getLogger("kg.builder.ds08").info(
                "F3: %d/%d rows have CareRegNo missing from ds10 master "
                "(emitting def:unresolvedCareRegNo instead of protectedBy)",
                unresolved, len(df),
            )
        out: list[str] = []
        for _, r in df.iterrows():  # df already sorted in preprocess()
            block = self._row_to_triples(r, master)
            if block:
                out.append(block)
        return out


if __name__ == "__main__":
    Ds08AbandonedBuilder.cli()
