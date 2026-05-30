"""Core KG package tests — URI policy, determinism, vocabulary closure.

Run with::

    cd /home/hong/petgraph
    python -m pytest backend/tests/test_kg_core.py -v
"""
from __future__ import annotations

import os
import re
from pathlib import Path

import pytest

# Use a throwaway registry to keep tests hermetic.
os.environ.setdefault(
    "URI_REGISTRY",
    str(Path(__file__).parent / ".tmp_uri_registry.parquet"),
)

from backend.kg import mint, mint_def, mint_set, parse, validate, NS
from backend.kg.prefixes import PREFIXES_TTL
from backend.kg.ttl import esc, lit, safe, slug
from backend.kg.vocab import CLASSES, PROPERTIES, KEY_SPEC, assert_known
from backend.kg.uri import assert_no_direct_assembly


# ── ttl helpers ──────────────────────────────────────────────────────────
@pytest.mark.parametrize(
    "v,expected",
    [(None, False), (float("nan"), False), ("", False), ("nan", False),
     ("None", False), ("  ", False), ("hello", True), (0, True), (False, True)],
)
def test_safe(v, expected):
    assert safe(v) is expected


def test_esc_quotes_newlines():
    assert esc('a"b\nc\\d') == 'a\\"b\\nc\\\\d'


def test_lit_typed_and_plain():
    assert lit("foo") == '"foo"'
    assert lit("2024-01-02", "xsd:date") == '"2024-01-02"^^xsd:date'


@pytest.mark.parametrize(
    "raw,expected",
    [("Seoul", "seoul"), ("강남구", "강남구"), ("Pet Love!!", "pet-love"),
     ("  hello  world  ", "hello-world"), ("a___b", "a-b")],
)
def test_slug_basic(raw, expected):
    assert slug(raw) == expected


def test_slug_ascii_only():
    try:
        import unidecode  # noqa: F401
    except ImportError:
        # Fallback path: non-ASCII is dropped → empty string
        assert slug("강남구", ascii_only=True) == ""
        return
    assert slug("강남구", ascii_only=True) in {"gangnamgu", "gang-nam-gu"}


# ── URI policy ───────────────────────────────────────────────────────────
def test_mint_def_known_only():
    assert mint_def("AnimalHospital").endswith("/koah/def/AnimalHospital")
    with pytest.raises(ValueError):
        mint_def("NotAClass")


def test_mint_set():
    assert mint_set("AnimalHospital").endswith("/koah/set/hospital")


def test_mint_id_pattern_and_validate():
    uri = mint("AnimalHospital",
               {"sido": "서울특별시", "sgg": "강남구", "name": "Pet Love", "fid": "12345"})
    assert uri.startswith("https://knowledgemap.kr/koah/id/hospital/")
    assert uri.endswith("/12345")
    assert validate(uri)


def test_mint_is_deterministic():
    key = {"careRegNo": "3149999", "noticeNo": "202503-12345"}
    a = mint("AbandonedAnimal", key)
    b = mint("AbandonedAnimal", dict(reversed(list(key.items()))))
    assert a == b
    assert validate(a)


def test_validate_rejects_forbidden_tokens():
    # mint() strips these via slug(); validate() is the defense for external URIs.
    assert not validate("https://knowledgemap.kr/koah/id/hospital/x.html")
    assert not validate("https://knowledgemap.kr/koah/id/api/v1/hospital/x")


def test_mint_missing_key_field_raises():
    with pytest.raises(ValueError):
        mint("AnimalHospital", {"sido": "서울", "sgg": "강남"})  # missing name


def test_parse_roundtrip():
    uri = mint("Region", {"sido": "서울특별시", "sgg": "강남구"})
    kind, leaf, _ = parse(uri)
    assert kind == "id"
    assert leaf == "region"


def test_validate_rejects_other_domain():
    assert not validate("http://example.com/id/animal/hospital/x")


# ── prefixes ─────────────────────────────────────────────────────────────
def test_prefixes_block_contains_all_namespaces():
    for p in NS:
        assert f"@prefix {p}" in PREFIXES_TTL


# ── vocabulary closure ──────────────────────────────────────────────────
def test_vocab_assert_known():
    for cls in CLASSES:
        assert_known(cls)
    for prop in PROPERTIES:
        assert_known(prop)
    with pytest.raises(ValueError):
        assert_known("FrobnicateOMatic")


def test_vocab_key_spec_classes_subset():
    assert set(KEY_SPEC).issubset(CLASSES)


# ── enforcement: no direct URI assembly outside backend/kg/uri.py ───────
def test_no_direct_uri_assembly_in_builders():
    root = Path(__file__).resolve().parents[2]
    builders = list((root / "backend" / "kg" / "builders").rglob("*.py"))
    bad = assert_no_direct_assembly(builders)
    assert not bad, f"Direct URI assembly found in: {bad}"


# ── builder smoke (deterministic re-build) ──────────────────────────────
def test_ds16_reasoning_is_deterministic(tmp_path, monkeypatch):
    """Two consecutive builds must produce byte-identical output."""
    pytest.importorskip("pandas")
    from backend.kg.builders.ds16_reasoning import Ds16ReasoningBuilder
    from backend.kg.builders import base as base_mod

    monkeypatch.setattr(base_mod, "TURTLE_DIR", tmp_path)
    Ds16ReasoningBuilder.SHORT_NAME = "reasoning_chain"  # idempotent

    try:
        p1 = Ds16ReasoningBuilder().run()
        first = p1.read_bytes()
        p2 = Ds16ReasoningBuilder().run()
        assert p2.read_bytes() == first
    except FileNotFoundError as e:
        pytest.skip(f"source CSV missing in CI: {e}")
