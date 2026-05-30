"""Quiet builder runner — disables logging and prints only sha.

Usage: python scripts/build_q.py [id ...]
"""
import sys, logging
logging.disable(logging.CRITICAL)
sys.path.insert(0, "/home/hong/petgraph")
from backend.kg.cli import BUILDERS, _resolve
ids = sys.argv[1:] or sorted(BUILDERS)
for did in ids:
    if did not in BUILDERS:
        print(f"{did} SKIP unknown")
        continue
    cls = _resolve(BUILDERS[did])
    p = cls().run()
    print(f"{did} OK {p.name}")
