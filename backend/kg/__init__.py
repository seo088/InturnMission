"""Knowledgemap KG core package.

Single source of truth for URI minting, vocabulary, prefixes, and TTL helpers.
All builders MUST import from this package; direct string assembly of
``https://knowledgemap.kr/koah/...`` URIs anywhere else is forbidden (CI: grep).

See ``docs/URI_POLICY.md`` and ``.openharness/skills/uri-mint.md``.
"""
from backend.kg.uri import mint, mint_def, mint_set, parse, validate
from backend.kg.prefixes import PREFIXES_TTL, NS
from backend.kg.ttl import safe, esc, lit, slug

__all__ = [
    "mint", "mint_def", "mint_set", "parse", "validate",
    "PREFIXES_TTL", "NS",
    "safe", "esc", "lit", "slug",
]
