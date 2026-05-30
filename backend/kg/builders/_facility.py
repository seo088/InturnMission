"""Shared base for facility-style builders (ds01-05).

The facility cluster (Hospital/Pharmacy/Grooming/Boarding/Cremation) shares
~80% of its CSV schema, so the per-dataset subclass only declares:

- ``KLASS``        — vocabulary class name
- ``SOURCE_CSV``   — input path
- ``EXTRA_PROPS``  — list of (csv_col, def_property) for fields beyond the
                     common facility set

Common columns (handled here): Name, Sido, Sigungu, RoadAddress, lat, lon,
PhoneNumber, BusinessStatus, LicenseDate, ClosingDate, LastUpdated.
Some datasets store address as a single column (`LocationArea`) instead of
Sido/Sigungu — subclasses can override ``derive_region()``.
"""
from __future__ import annotations

import hashlib
from typing import ClassVar, Iterable

import pandas as pd

from backend.kg.builders.base import BaseBuilder, CSV_DIR, PRE_DIR, CLEAN_DIR
from backend.kg.builders.ds08_abandoned import extract_sido, extract_sigungu
from backend.kg.ttl import esc, lit, safe
from backend.kg.uri import mint

# Properties that should be emitted with ^^xsd:date
_DATE_PROPS: frozenset[str] = frozenset({
    "licenseDate", "closingDate", "reopenDate", "reopeningDate",
    "suspensionStart", "suspensionEnd",
})
# Properties that carry Korean natural-language text (get @ko tag)
_KO_PROPS: frozenset[str] = frozenset({
    "businessStatus", "businessStatusDetail", "taskType",
})
# Properties that are opaque codes/identifiers (get ^^xsd:string)
_STR_PROPS: frozenset[str] = frozenset({
    "category",
})
# Properties that are numeric measurements (get ^^xsd:decimal; 0.0 = NULL, skip)
_DECIMAL_PROPS: frozenset[str] = frozenset({
    "floorAreaSqm",
})


# cleaned_2차/ 컬럼명(소문자) → 빌더가 기대하는 표기로 정규화
_CLEAN_COL_MAP: dict[str, str] = {
    "name": "Name", "facility_id": "Facility_ID",
    "category": "Category",
    "businessstatus": "BusinessStatus", "businessstatusdetail": "BusinessStatusDetail",
    "detailedbusinessstatus": "BusinessStatus",
    "businessstatuscode": "BusinessStatusCode", "detailedstatuscode": "DetailedStatusCode",
    "sido": "Sido", "sigungu": "Sigungu", "dong": "Dong",
    "lotnumber": "LotNumber", "roadaddress": "RoadAddress", "lotaddress": "LotAddress",
    "postalcode": "PostalCode",
    "lat": "lat", "lon": "lon",
    "phonenumber": "PhoneNumber",
    "licensedate": "LicenseDate", "closingdate": "ClosingDate",
    "lastupdated": "LastUpdated", "lastmodified": "LastModified",
    "lastmodificationtime": "LastModificationTime",
    "reopendate": "ReopenDate", "reopeningdate": "ReopeningDate",
    "floorarea": "FloorArea", "locationarea": "LocationArea",
    "suspensionstartdate": "SuspensionStartDate", "suspensionenddate": "SuspensionEndDate",
    "tasktype": "TaskType",
    "dataupdatetype": "DataUpdateType",
    "rightnumber": "RightNumber", "rightmembersn": "RightMemberSN", "groupcode": "GroupCode",
    "region_key": "region_key", "coord_status": "coord_status", "coord_accuracy": "coord_accuracy",
}


def _fid_for(row: pd.Series) -> str:
    """F4: stable per-row identifier for facility URI dedup.

    Prefers ``Facility_ID`` if present, otherwise falls back to a sha1
    of address + phone + lat/lon (deterministic, no time/uuid).
    """
    v = row.get("Facility_ID")
    if safe(v):
        return str(v).strip().split(".")[0]  # drop trailing ".0"
    payload = "|".join(
        str(row.get(c, "") or "")
        for c in ("RoadAddress", "Location", "PhoneNumber",
                  "BuildingNo", "LotAddress", "lat", "lon")
    )
    return "x" + hashlib.sha1(payload.encode("utf-8")).hexdigest()[:8]


class FacilityBuilder(BaseBuilder):
    KLASS: ClassVar[str]                  # vocab class name
    SOURCE_CSV: ClassVar[str]             # filename
    SOURCE_DIR: ClassVar[str] = "preprocessed"   # "preprocessed" | "raw"
    EXTRA_PROPS: ClassVar[tuple[tuple[str, str], ...]] = ()
    NAME_COL: ClassVar[str] = "Name"
    SIDO_COL: ClassVar[str | None] = "Sido"
    SGG_COL: ClassVar[str | None] = "Sigungu"
    ADDR_COL: ClassVar[str] = "RoadAddress"
    LOCATION_FALLBACK_COL: ClassVar[str | None] = None
    FILTER_COORD_STATUS: ClassVar[bool] = True   # drop rows with coord_status='missing_coord'

    def load(self) -> pd.DataFrame:
        if self.SOURCE_DIR == "cleaned":
            base = CLEAN_DIR
        elif self.SOURCE_DIR == "preprocessed":
            base = PRE_DIR
        else:
            base = CSV_DIR
        df = pd.read_csv(base / self.SOURCE_CSV, encoding="utf-8-sig", low_memory=False, dtype=str)
        if self.SOURCE_DIR == "cleaned":
            df.rename(columns=_CLEAN_COL_MAP, inplace=True)
        if self.FILTER_COORD_STATUS and "coord_status" in df.columns:
            df = df[df["coord_status"] != "missing_coord"]
        return df

    # ---- region derivation -------------------------------------------------
    def derive_region(self, row: pd.Series) -> tuple[str | None, str | None]:
        sido = row.get(self.SIDO_COL) if self.SIDO_COL else None
        sgg = row.get(self.SGG_COL) if self.SGG_COL else None
        if (not safe(sido) or not safe(sgg)) and self.LOCATION_FALLBACK_COL:
            loc = row.get(self.LOCATION_FALLBACK_COL)
            sido = sido if safe(sido) else extract_sido(loc)
            sgg = sgg if safe(sgg) else extract_sigungu(loc)
        if not safe(sido):
            sido = extract_sido(row.get(self.ADDR_COL))
        if not safe(sgg):
            sgg = extract_sigungu(row.get(self.ADDR_COL))
        return (sido or None, sgg or None)

    # ---- per-row triples ---------------------------------------------------
    def _row(self, r: pd.Series) -> str:
        name = r.get(self.NAME_COL)
        if not safe(name):
            return ""
        sido, sgg = self.derive_region(r)
        if not (safe(sido) and safe(sgg)):
            return ""  # cannot mint a stable URI without region

        fid = _fid_for(r)
        # RestArea has no sido/sgg in its KEY_SPEC (single-field name+fid).
        if self.KLASS == "RestArea":
            subj = mint(self.KLASS, {"name": name, "fid": fid})
        else:
            subj = mint(self.KLASS, {"sido": sido, "sgg": sgg, "name": name, "fid": fid})
        t: list[str] = [f"<{subj}>", f"  a def:{self.KLASS} ;"]
        # Korean name → @ko language tag
        t.append(f'  rdfs:label "{esc(str(name).strip())}"@ko ;')

        addr = r.get(self.ADDR_COL)
        if safe(addr):
            # Korean address → @ko
            t.append(f'  def:address "{esc(str(addr).strip())}"@ko ;')
        if safe(r.get("PhoneNumber")):
            # Phone/fax numbers are opaque strings, not natural language
            t.append(f'  def:phone "{esc(str(r["PhoneNumber"]).strip())}"^^xsd:string ;')

        # geo (schema:geo blank node)
        lat, lon = r.get("lat"), r.get("lon")
        if safe(lat) and safe(lon):
            try:
                la, lo = float(lat), float(lon)
                t.append(
                    "  schema:geo [ schema:latitude "
                    f'"{la}"^^xsd:decimal ; schema:longitude "{lo}"^^xsd:decimal ] ;'
                )
            except (TypeError, ValueError):
                pass

        for col, prop in self.EXTRA_PROPS:
            v = r.get(col)
            if not safe(v):
                continue
            vs = str(v).strip()
            if prop in _DATE_PROPS:
                t.append(f'  def:{prop} "{esc(vs)}"^^xsd:date ;')
            elif prop in _KO_PROPS:
                t.append(f'  def:{prop} "{esc(vs)}"@ko ;')
            elif prop in _STR_PROPS:
                t.append(f'  def:{prop} "{esc(vs)}"^^xsd:string ;')
            elif prop in _DECIMAL_PROPS:
                # 0.0 is a sentinel for missing data — skip rather than emit
                try:
                    if float(vs) == 0.0:
                        continue
                except (ValueError, TypeError):
                    continue
                t.append(f'  def:{prop} "{esc(vs)}"^^xsd:decimal ;')
            else:
                t.append(f"  def:{prop} {lit(vs)} ;")

        if safe(r.get("LastUpdated")):
            t.append(f'  dct:modified "{esc(r["LastUpdated"])}"^^xsd:date ;')
        if safe(r.get("Facility_ID")):
            # Identifiers are opaque strings, not natural language
            t.append(f'  dct:identifier "{esc(str(r["Facility_ID"]).strip())}"^^xsd:string ;')

        # Region URI references 00_regions.ttl (animalloo.kr namespace, _ separator)
        region_uri = f"http://animalloo.kr/ontology/region/{sido}_{sgg}"
        t.append(f"  def:locatedIn <{region_uri}> ;")

        t[-1] = t[-1][:-1] + "."
        return "\n".join(t)

    # ---- entry point -------------------------------------------------------
    def build_triples(self) -> list[str]:
        df = self.load()
        # determinism: stable order by (Sido, Sigungu, Name)
        sort_cols = [c for c in (self.SIDO_COL, self.SGG_COL, self.NAME_COL) if c and c in df.columns]
        if sort_cols:
            df = df.sort_values(sort_cols, kind="stable").reset_index(drop=True)
        out: list[str] = []
        for _, r in df.iterrows():
            block = self._row(r)
            if block:
                out.append(block)
        return out
