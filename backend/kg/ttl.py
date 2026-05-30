"""TTL serialization helpers (deterministic, no I/O).

Centralizes the small string utilities that were previously copy-pasted
across qa_to_turtle.py / rescue_to_turtle*.py / reasoning_chain.py.
"""
from __future__ import annotations
import re
from typing import Any

_NULL_STRINGS = {"", "nan", "none", "null", "na"}


def safe(v: Any) -> bool:
    """True iff value is non-null and meaningful."""
    if v is None:
        return False
    if isinstance(v, float) and v != v:  # NaN
        return False
    return str(v).strip().lower() not in _NULL_STRINGS


def esc(v: Any) -> str:
    """Escape a value for embedding inside a TURTLE quoted literal."""
    return (
        str(v)
        .replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "")
    )


def lit(v: Any, dtype: str | None = None) -> str:
    """Render a typed or plain TURTLE literal: ``"foo"`` or ``"42"^^xsd:int``."""
    return f'"{esc(v)}"^^{dtype}' if dtype else f'"{esc(v)}"'


_SLUG_DROP = re.compile(r"[^a-z0-9가-힣\-]+")
_SLUG_COLLAPSE = re.compile(r"-{2,}")


def slug(v: Any, *, ascii_only: bool = False) -> str:
    """Normalize a string for URI key use.

    - lowercase
    - spaces / underscores → hyphen
    - non `[a-z0-9가-힣-]` removed (or non-ASCII transliterated when ``ascii_only``)
    - collapse repeated hyphens, strip ends
    """
    s = str(v).strip().lower().replace("_", "-").replace(" ", "-")
    if ascii_only:
        try:
            from unidecode import unidecode  # type: ignore
            s = unidecode(s)
        except ImportError:
            # graceful fallback: drop non-ASCII
            s = s.encode("ascii", "ignore").decode("ascii")
        s = re.sub(r"[^a-z0-9\-]+", "", s)
    else:
        s = _SLUG_DROP.sub("-", s)
    s = _SLUG_COLLAPSE.sub("-", s).strip("-")
    return s[:60]
