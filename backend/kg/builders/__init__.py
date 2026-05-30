"""Canonical KG builders.

Each builder is a subclass of ``BaseBuilder`` and exposes:

- ``DATASET_ID`` and ``GRAPH`` (urn:knowledgemap:<id>_<name>)
- ``run()`` → writes ``turtle/<id>_<name>.ttl`` deterministically

Builders never assemble URIs directly — they always go through ``backend.kg.uri``.
"""
from backend.kg.builders.base import BaseBuilder

__all__ = ["BaseBuilder"]
