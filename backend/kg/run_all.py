"""Batch builder runner that writes a status file for harness consumption.

Usage::
    python -m backend.kg.run_all              # build everything
    python -m backend.kg.run_all 01 02 09     # selective

Writes ``/tmp/kg_run.log`` with one line per dataset.
"""
from __future__ import annotations

import logging
import sys
import traceback
from pathlib import Path

logging.disable(logging.CRITICAL)

from backend.kg.cli import BUILDERS, _resolve

OUT = Path("/tmp/kg_run.log")


def main() -> int:
    ids = sys.argv[1:] or sorted(BUILDERS)
    lines: list[str] = []
    rc = 0
    for did in ids:
        if did not in BUILDERS:
            lines.append(f"{did}\tSKIP\tunknown")
            rc = 1
            continue
        try:
            cls = _resolve(BUILDERS[did])
            p = cls().run()
            lines.append(f"{did}\tOK\t{p.name}\t{p.stat().st_size}")
        except Exception as e:
            lines.append(f"{did}\tFAIL\t{type(e).__name__}\t{e}")
            lines.append(traceback.format_exc())
            rc = 2
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
