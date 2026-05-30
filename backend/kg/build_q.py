"""Quiet runner: ``python -m backend.kg.build_q [id ...]``."""
import sys, logging
logging.disable(logging.CRITICAL)
from backend.kg.cli import BUILDERS, _resolve

def main():
    ids = sys.argv[1:] or sorted(BUILDERS)
    for did in ids:
        if did not in BUILDERS:
            print(f"{did} SKIP unknown")
            continue
        cls = _resolve(BUILDERS[did])
        p = cls().run()
        print(f"{did} OK {p.name}")

if __name__ == "__main__":
    main()
