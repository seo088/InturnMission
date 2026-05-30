"""Abstract base for all KG builders.

Enforces:

- deterministic output (sorted iteration, no time/uuid in TTL)
- single PREFIXES block (knowledgemap 4-layer)
- write-then-rename atomicity
- consistent logging format
"""
from __future__ import annotations

import abc
import hashlib
import logging
import os
import tempfile
from pathlib import Path
from typing import ClassVar

from backend.kg.prefixes import PREFIXES_TTL

REPO_ROOT = Path(__file__).resolve().parents[3]
TURTLE_DIR = REPO_ROOT / "turtle"
CSV_DIR = REPO_ROOT / "csv_data"
PRE_DIR = REPO_ROOT / "preprocessed_data"
CLEAN_DIR = REPO_ROOT / "cleaned_2차"

log = logging.getLogger("kg.builder")


class BaseBuilder(abc.ABC):
    """Subclass contract:

    Class attributes
    ----------------
    DATASET_ID : str        e.g. ``"08"``
    SHORT_NAME : str        e.g. ``"abandoned_animal"``
    GRAPH      : str        e.g. ``"urn:knowledgemap:08_abandoned_animal"``
    """

    DATASET_ID: ClassVar[str]
    SHORT_NAME: ClassVar[str]

    @property
    def graph(self) -> str:
        return f"urn:knowledgemap:{self.DATASET_ID}_{self.SHORT_NAME}"

    @property
    def output_path(self) -> Path:
        return TURTLE_DIR / f"{self.DATASET_ID}_{self.SHORT_NAME}.ttl"

    # ── subclass entry points ────────────────────────────────────────────
    @abc.abstractmethod
    def build_triples(self) -> list[str]:
        """Return TTL triple blocks (already serialized strings, no prefixes).

        MUST be deterministic — sort any input iteration before producing output.
        """

    # ── orchestration ────────────────────────────────────────────────────
    def run(self) -> Path:
        TURTLE_DIR.mkdir(parents=True, exist_ok=True)
        triples = self.build_triples()
        body = PREFIXES_TTL + "\n".join(triples) + "\n"
        path = self.output_path
        # atomic write
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", delete=False,
            dir=str(path.parent), prefix=f".{path.name}.", suffix=".tmp",
        ) as fh:
            fh.write(body)
            tmp = Path(fh.name)
        os.replace(tmp, path)
        digest = hashlib.sha1(body.encode("utf-8")).hexdigest()[:12]
        size_kb = path.stat().st_size / 1024
        log.info(
            "[%s] %s wrote %d blocks → %s (%.1f KB, sha1=%s)",
            self.DATASET_ID, type(self).__name__, len(triples),
            path.name, size_kb, digest,
        )
        return path

    @classmethod
    def cli(cls) -> None:
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s %(levelname)s %(message)s",
        )
        cls().run()
