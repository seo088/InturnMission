"""ds16 — Reasoning chain builder (canonical).

Refactor of legacy ``reasoning_chain.py`` (root). Behavior preserved:

  ① SymptomCategory → mapsTo → VetDepartment   (12 categories)
  ② Symptom         → indicatesDisease → Disease  (curated map)
  ③ Disease         → treatedByDept → VetDepartment
  ④ VetDepartment   → treatsSympCategory → SymptomCategory  (reverse)

Improvements:

- knowledgemap.kr URIs via ``backend.kg.uri.mint`` (UK URI 101)
- vocabulary terms validated against ``backend.kg.vocab``
- deterministic: dict iteration over ``sorted(...)`` keys
- pure builder, no print side-effects (logging only)
- robust CSV loading (utf-8-sig → euc-kr → cp949 fallback chain)
"""
from __future__ import annotations

import logging
from pathlib import Path

import pandas as pd

from backend.kg.builders.base import BaseBuilder, CSV_DIR
from backend.kg.ttl import lit, safe
from backend.kg.uri import mint, mint_def

log = logging.getLogger("kg.builder.ds16")

# ── domain constants (carried from reasoning_chain.py) ───────────────────
CATEGORY_TO_DEPT: dict[str, tuple[str, str]] = {
    "a": ("ophthalmology", "청각기관 증상"),
    "b": ("internal",      "심혈관계 증상"),
    "c": ("internal",      "소화기계"),
    "d": ("ophthalmology", "안과 증상"),
    "e": ("internal",      "전신종합 증상"),
    "f": ("surgery",       "근골격계"),
    "g": ("internal",      "신경계 증상"),
    "h": ("surgery",       "통증 증상"),
    "i": ("internal",      "호흡기계 증상"),
    "j": ("dermatology",   "피부/외피계 증상"),
    "k": ("surgery",       "생식기계 증상"),
    "l": ("internal",      "비뇨기계 증상"),
}

# (DiseaseNo → list of curated SymptomListCode)
DISEASE_SYMPTOM_MAP: dict[int, tuple[str, ...]] = {
    8:   ("c036", "c038", "c003", "c050", "c055", "c056"),
    5:   ("i012", "i008", "i009", "g001", "g002", "c003"),
    6:   ("i012", "i011", "i008", "i009", "i004"),
    12:  ("g001", "g002", "g003", "g023", "g024"),
    115: ("c036", "c038", "c003", "c050"),
    55:  ("k001", "k002", "e001", "e002"),
    107: ("e001", "e002", "i008", "i009"),
    91:  ("g001", "g002", "e001", "e002"),
    18:  ("g001", "g002", "g023", "g024", "f003", "f004"),
    109: ("c050", "c003", "c038"),
    42:  ("g001", "g002", "e001"),
    61:  ("i012", "i008", "e001", "e002"),
    22:  ("g001", "g002", "i008", "i012"),
}

DISEASE_DEPT_MAP: dict[int, str] = {
    97: "internal", 94: "internal", 95: "internal", 100: "internal",
    83: "internal", 27: "surgery",  78: "internal", 62: "internal",
    106: "surgery", 79: "internal", 14: "internal", 33: "internal",
    110: "internal",
}

DEPT_TO_CATS: dict[str, tuple[str, ...]] = {
    "ophthalmology": ("a", "d"),
    "surgery":       ("f", "h", "k"),
    "internal":      ("b", "c", "e", "g", "i", "l"),
    "dermatology":   ("j",),
    "dentistry":     ("c", "e"),
}

DEPARTMENTS = ("ophthalmology", "surgery", "internal", "dermatology", "dentistry")

DEPARTMENT_LABELS_KO: dict[str, str] = {
    "internal":      "내과",
    "surgery":       "외과",
    "dermatology":   "피부과",
    "ophthalmology": "안과",
    "dentistry":     "치과",
}


def _load_diseases() -> pd.DataFrame:
    """Load disease master CSV with encoding fallback chain."""
    candidates: list[tuple[Path, str]] = [
        (CSV_DIR / "15_동물질병_전처리완료.csv", "utf-8-sig"),
        (CSV_DIR / "15_동물질병_데이터.csv",     "utf-8-sig"),
        (CSV_DIR / "15_동물질병_데이터.csv",     "euc-kr"),
        (CSV_DIR / "15_동물질병_데이터.csv",     "cp949"),
    ]
    last_err: Exception | None = None
    for path, enc in candidates:
        if not path.exists():
            continue
        try:
            df = pd.read_csv(path, encoding=enc)
            df = df.rename(columns={
                "DISS_NO": "DiseaseNo", "DISS_NM": "DiseaseName",
                "ENG_DISS_NM": "DiseaseNameEN",
                "MAIN_INFC_ANIMAL": "MainTargetAnimal",
                "CAUSE_CMMN_CL": "CauseClass",
            })
            return df
        except Exception as e:
            last_err = e
            continue
    raise FileNotFoundError(
        f"15_동물질병_*.csv not loadable; last error: {last_err}"
    )


# ── builder ──────────────────────────────────────────────────────────────
class Ds16ReasoningBuilder(BaseBuilder):
    DATASET_ID = "16"
    SHORT_NAME = "reasoning_chain"

    # The reasoning chain has no preprocessed CSV — it is purely derived.
    def build_triples(self) -> list[str]:
        triples: list[str] = []

        # ── ① SymptomCategory → VetDepartment ────────────────────────
        for code in sorted(CATEGORY_TO_DEPT):
            dept_en, cat_ko = CATEGORY_TO_DEPT[code]
            cat = mint("SymptomCategory", {"code": code})
            dept = mint("VetDepartment", {"name": dept_en})
            triples.append(
                f"<{cat}>\n"
                f"  a def:SymptomCategory ;\n"
                f"  def:mapsTo <{dept}> ;\n"
                f"  def:deptHint {lit(cat_ko)} ."
            )

        # ── ② Symptom → Disease (and reverse) ────────────────────────
        df_dis = _load_diseases()
        pet_dis = df_dis[df_dis["MainTargetAnimal"].str.contains(
            "개|고양이|견|묘", na=False)].copy()
        pet_dis = pet_dis.sort_values("DiseaseNo", kind="stable")

        chain = 0
        for dno in sorted(DISEASE_SYMPTOM_MAP):
            if dno not in set(pet_dis["DiseaseNo"].astype(int)):
                continue
            dis_uri = mint("Disease", {"no": dno})
            for scode in DISEASE_SYMPTOM_MAP[dno]:
                sym_uri = mint("Symptom", {"code": scode})
                # F2 fix: do not re-type Symptom/Disease here — ds13/ds15 own
                # the typing + labels; ds16 emits relationships only.
                triples.append(
                    f"<{sym_uri}>\n"
                    f"  def:indicatesDisease <{dis_uri}> ."
                )
                triples.append(
                    f"<{dis_uri}>\n"
                    f"  def:hasSymptom <{sym_uri}> ."
                )
                chain += 1
        log.info("symptom-disease chain triples: %d", chain)

        # ── ③ Disease → Department ───────────────────────────────────
        for dno in sorted(set(pet_dis["DiseaseNo"].astype(int))):
            dept_en = DISEASE_DEPT_MAP.get(dno, "internal")
            dis_uri = mint("Disease", {"no": dno})
            dept_uri = mint("VetDepartment", {"name": dept_en})
            triples.append(
                f"<{dis_uri}>\n"
                f"  def:treatedByDept <{dept_uri}> ."
            )

        # Department → handledBy AnimalHospital (range declaration)
        # Note: VetDepartment typing is owned by ds16 (no other dataset emits it).
        ah_def = mint_def("AnimalHospital")
        for dept_en in DEPARTMENTS:
            dept_uri = mint("VetDepartment", {"name": dept_en})
            label_ko = DEPARTMENT_LABELS_KO[dept_en]
            triples.append(
                f"<{dept_uri}>\n"
                f"  a def:VetDepartment ;\n"
                f'  rdfs:label "{label_ko}"@ko, "{dept_en}"@en ;\n'
                f"  def:handledBy <{ah_def}> ."
            )

        # ── ④ Department → SymptomCategory (reverse) ─────────────────
        for dept_en in sorted(DEPT_TO_CATS):
            dept_uri = mint("VetDepartment", {"name": dept_en})
            for code in DEPT_TO_CATS[dept_en]:
                cat_uri = mint("SymptomCategory", {"code": code})
                triples.append(
                    f"<{dept_uri}>\n"
                    f"  def:treatsSympCategory <{cat_uri}> ."
                )

        return triples


if __name__ == "__main__":
    Ds16ReasoningBuilder.cli()
