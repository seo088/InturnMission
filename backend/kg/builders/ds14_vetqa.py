"""ds14 — Veterinary Q&A pairs (AI Hub source) builder.

Source: ``preprocessed_data/14_disease_qa.csv`` with Korean column names
(진료과 / 질문 / 답변 / 원본파일).

Each row becomes a ``def:VetQA`` instance. URI is built from a sha1 of the
question+answer text (PII-free, deterministic, content-addressed).
The Q&A is linked to the appropriate ``def:VetDepartment`` so the reasoning
chain in ds16 can route symptoms → questions.
"""
from __future__ import annotations

import hashlib

import pandas as pd

from backend.kg.builders.base import BaseBuilder, PRE_DIR
from backend.kg.ttl import esc, lit, safe
from backend.kg.uri import mint

DEPT_KO_TO_EN = {
    "내과":   "internal",
    "외과":   "surgery",
    "피부과": "dermatology",
    "안과":   "ophthalmology",
    "치과":   "dentistry",
}


class Ds14VetQABuilder(BaseBuilder):
    DATASET_ID = "14"
    SHORT_NAME = "vet_qa"

    SOURCE_CSV = PRE_DIR / "14_disease_qa.csv"

    def build_triples(self) -> list[str]:
        df = pd.read_csv(self.SOURCE_CSV, encoding="utf-8-sig", low_memory=False, dtype=str)
        # rename Korean columns
        df = df.rename(columns={
            "진료과": "department_ko",
            "질문":   "question",
            "답변":   "answer",
            "원본파일": "source",
        })

        def _key(row):
            payload = (str(row.get("question", "")) + "|" + str(row.get("answer", ""))).encode("utf-8")
            return hashlib.sha1(payload).hexdigest()[:12]

        df["qa_key"] = df.apply(_key, axis=1)
        df = df.drop_duplicates("qa_key").sort_values("qa_key", kind="stable").reset_index(drop=True)

        out: list[str] = []
        for _, r in df.iterrows():
            key = r["qa_key"]
            subj = mint("VetQA", {"sha": key})
            t = [f"<{subj}>", "  a def:VetQA ;"]
            if safe(r.get("question")):
                t.append(f"  def:question {lit(str(r['question']).strip())} ;")
            if safe(r.get("answer")):
                t.append(f"  def:answer {lit(str(r['answer']).strip())} ;")
            if safe(r.get("source")):
                t.append(f"  dct:source {lit(str(r['source']).strip())} ;")

            dept_ko = str(r.get("department_ko") or "").strip()
            dept_en = DEPT_KO_TO_EN.get(dept_ko)
            if dept_en:
                dept_uri = mint("VetDepartment", {"name": dept_en})
                t.append(f"  def:department <{dept_uri}> ;")
                t.append(f"  def:departmentLabel {lit(dept_ko)} ;")

            t[-1] = t[-1][:-1] + "."
            out.append("\n".join(t))
        return out


if __name__ == "__main__":
    Ds14VetQABuilder.cli()
