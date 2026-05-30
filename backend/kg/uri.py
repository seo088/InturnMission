"""Single URI mint / parse / validate module for knowledgemap.kr.

Implements UK Public Sector URI 101 (def / id / doc / set 4-layer pattern).
This is the **only** module in the codebase allowed to assemble
``https://knowledgemap.kr/koah/...`` URI strings. CI enforces this with grep.

Determinism guarantee
---------------------
``mint(klass, key)`` is a pure function: identical input → identical URI.
A persistent registry (parquet) records every minted (source_key → uri)
mapping so that re-runs against the same source data produce stable URIs
even when the slug algorithm changes (the registry takes precedence).

The registry path is configurable via ``URI_REGISTRY`` env var; defaults
to ``backend/kg/uri_registry.parquet``. The registry is append-only.
"""
from __future__ import annotations

import hashlib
import os
import re
import threading
from pathlib import Path
from typing import Any, Iterable, Literal, Mapping

from backend.kg.prefixes import NS
from backend.kg.ttl import slug
from backend.kg.vocab import KEY_SPEC, assert_known

Kind = Literal["id", "doc"]

_BASE = "https://knowledgemap.kr/koah"
# KOAH(Korea Open Animal Hub) — 프로젝트 네임스페이스가 _BASE에 포함되어 있어
# 별도 _SECTOR 세그먼트는 사용하지 않는다. 4-layer만 _BASE 다음에 온다.
_VALID_URI = re.compile(
    r"^https://knowledgemap\.kr/koah/(def|id|doc|set)(/[\w\-/]+)?$",
    re.UNICODE,
)
_FORBIDDEN_TOKENS = (".html", ".php", ".json", "/api/", "/v1/", "/v2/")
_REGISTRY_PATH = Path(os.environ.get(
    "URI_REGISTRY",
    Path(__file__).resolve().parent / "uri_registry.parquet",
))
_lock = threading.Lock()


# ── helpers ──────────────────────────────────────────────────────────────
def _key_string(klass: str, key: Mapping[str, Any]) -> str:
    """Compose the canonical slash-joined key for a class according to KEY_SPEC.

    Slug strategy: try ASCII (unidecode) first; if any field collapses to empty
    (no unidecode installed → Korean stripped), fall back to the unicode-allowed
    slug for that field. If even that is empty, substitute a stable sha1[:6]
    derived from the original raw key value so the URI remains deterministic
    AND non-empty AND collision-resistant.
    """
    if klass not in KEY_SPEC:
        raise ValueError(f"No KEY_SPEC for class {klass!r}")
    leaf, fields = KEY_SPEC[klass]
    parts = [leaf]
    for f in fields:
        v = key.get(f)
        if v is None or str(v).strip() == "":
            raise ValueError(f"Missing key field {f!r} for {klass}")
        v_str = str(v)
        # If the value contains Korean characters, prefer the unicode slug
        # unconditionally — ascii_only=True drops Korean, leaving only leading
        # digits/ASCII (e.g. "24시보듬동물병원" → "24"), which causes URI
        # truncation and collisions between distinct facilities.
        has_korean = any('가' <= c <= '힣' for c in v_str)
        if has_korean:
            s = slug(v, ascii_only=False)
        else:
            s = slug(v, ascii_only=True)
            if not s:
                s = slug(v, ascii_only=False)
        if not s:
            s = "x" + hashlib.sha1(v_str.encode("utf-8")).hexdigest()[:6]
        parts.append(s)
    return "/".join(parts)


def _format(kind: str, leaf_path: str) -> str:
    return f"{_BASE}/{kind}/{leaf_path}"


def _check_forbidden(uri: str) -> None:
    for tok in _FORBIDDEN_TOKENS:
        if tok in uri:
            raise ValueError(f"URI contains forbidden token {tok!r}: {uri}")


# ── public API ───────────────────────────────────────────────────────────
def mint(klass: str, key: Mapping[str, Any], *, kind: Kind = "id") -> str:
    """Mint or look up an instance URI for a real-world thing.

    Parameters
    ----------
    klass : str
        Vocabulary class (e.g. ``"AnimalHospital"``).
    key : Mapping[str, Any]
        Source key fields (must include all fields listed in
        ``vocab.KEY_SPEC[klass]``).
    kind : ``"id"`` | ``"doc"``
        Identifier vs document URI (UK URI 101 layer).
    """
    if klass not in KEY_SPEC:
        raise ValueError(f"Unknown class {klass!r}")
    if kind not in ("id", "doc"):
        raise ValueError(f"kind must be 'id' or 'doc', got {kind!r}")
    leaf = _key_string(klass, key)
    uri = _format(kind, leaf)
    _check_forbidden(uri)
    if not _VALID_URI.match(uri):
        raise ValueError(f"Generated URI failed regex: {uri}")
    _registry_record(klass=klass, source_key=dict(key), uri=uri)
    return uri


def mint_def(term: str) -> str:
    """Mint an ontology (class or property) URI: ``def:{Term}``."""
    assert_known(term)
    uri = f"{_BASE}/def/{term}"
    _check_forbidden(uri)
    return uri


def mint_set(klass: str) -> str:
    """Mint a collection URI: ``set:{leaf}``."""
    if klass not in KEY_SPEC:
        raise ValueError(f"Unknown class {klass!r}")
    leaf, _ = KEY_SPEC[klass]
    return f"{_BASE}/set/{leaf}"


def parse(uri: str) -> tuple[str, str | None, list[str]]:
    """Decompose ``uri`` → ``(kind, leaf, path_parts)`` (best effort)."""
    m = _VALID_URI.match(uri)
    if not m:
        raise ValueError(f"Not a knowledgemap URI: {uri}")
    kind = m.group(1)
    tail = (m.group(2) or "").lstrip("/")
    parts = tail.split("/") if tail else []
    leaf = parts[0] if parts else None
    return kind, leaf, parts[1:]


def validate(uri: str) -> bool:
    """Return True iff ``uri`` conforms to the policy."""
    if not _VALID_URI.match(uri):
        return False
    try:
        _check_forbidden(uri)
    except ValueError:
        return False
    return True


# ── registry (append-only, optional dependency: pandas+pyarrow) ──────────
def _registry_record(*, klass: str, source_key: dict, uri: str) -> None:
    """Append a row to the URI registry. Silently no-op if pandas missing."""
    try:
        import pandas as pd  # type: ignore
    except ImportError:  # registry is best-effort
        return
    row = {
        "class": klass,
        "source_key": repr(sorted(source_key.items())),
        "uri": uri,
    }
    with _lock:
        if _REGISTRY_PATH.exists():
            try:
                df = pd.read_parquet(_REGISTRY_PATH)
                if ((df["class"] == klass) & (df["uri"] == uri)).any():
                    return  # already recorded — preserve append-only semantics
                df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
            except Exception:
                df = pd.DataFrame([row])
        else:
            _REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
            df = pd.DataFrame([row])
        try:
            df.to_parquet(_REGISTRY_PATH, index=False)
        except Exception:
            pass  # writing the registry must never break a build


def lookup(klass: str, source_key: Mapping[str, Any]) -> str | None:
    """Return the previously minted URI for ``(klass, source_key)`` if any."""
    try:
        import pandas as pd  # type: ignore
    except ImportError:
        return None
    if not _REGISTRY_PATH.exists():
        return None
    df = pd.read_parquet(_REGISTRY_PATH)
    needle = repr(sorted(dict(source_key).items()))
    hit = df[(df["class"] == klass) & (df["source_key"] == needle)]
    return None if hit.empty else str(hit.iloc[0]["uri"])


# ── enforcement helper for CI ────────────────────────────────────────────
def assert_no_direct_assembly(paths: Iterable[Path]) -> list[Path]:
    """Return files outside this module that string-assemble knowledgemap URIs."""
    bad: list[Path] = []
    pat = re.compile(r"['\"]https?://knowledgemap\.kr/")
    self_path = Path(__file__).resolve()
    for p in paths:
        if p.resolve() == self_path:
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except Exception:
            continue
        if pat.search(text):
            bad.append(p)
    return bad
