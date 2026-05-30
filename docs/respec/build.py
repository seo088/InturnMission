"""Generate W3C ReSpec HTML + OWL TTL from docs/respec/terms.yaml.

Validates against ``backend.kg.vocab`` to enforce zero drift between code
and documentation. Exits non-zero on any mismatch (CI-friendly).

Usage::

    backend/venv/bin/python docs/respec/build.py

Outputs::

    docs/respec/ontology.html   (W3C ReSpec spec — open in browser)
    turtle/def_animal.ttl       (OWL ontology — load as urn:knowledgemap:def)
"""
from __future__ import annotations

import html
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))

import yaml  # type: ignore

from backend.kg.vocab import CLASSES, PROPERTIES

TERMS_PATH = Path(__file__).parent / "terms.yaml"
HTML_PATH = Path(__file__).parent / "ontology.html"
TTL_PATH = REPO / "turtle" / "def_animal.ttl"

NS = "https://knowledgemap.kr/koah/def/"


def _load() -> dict:
    return yaml.safe_load(TERMS_PATH.read_text(encoding="utf-8"))


def _validate(terms: dict) -> None:
    """Fail loudly on any drift between vocab.py and terms.yaml."""
    yaml_classes = set(terms["classes"])
    yaml_props = set(terms["properties"])

    missing_cls = CLASSES - yaml_classes
    extra_cls = yaml_classes - CLASSES
    missing_prop = PROPERTIES - yaml_props
    extra_prop = yaml_props - PROPERTIES

    errors: list[str] = []
    if missing_cls:
        errors.append(f"vocab.CLASSES not in terms.yaml: {sorted(missing_cls)}")
    if extra_cls:
        errors.append(f"terms.yaml classes not in vocab: {sorted(extra_cls)}")
    if missing_prop:
        errors.append(f"vocab.PROPERTIES not in terms.yaml: {sorted(missing_prop)}")
    if extra_prop:
        errors.append(f"terms.yaml properties not in vocab: {sorted(extra_prop)}")
    if errors:
        for e in errors:
            print(f"DRIFT: {e}", file=sys.stderr)
        sys.exit(2)


# ── TTL emitter ───────────────────────────────────────────────────────────
def _ttl(terms: dict) -> str:
    onto = terms["ontology"]
    out: list[str] = []
    out.append("@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .")
    out.append("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .")
    out.append("@prefix owl:  <http://www.w3.org/2002/07/owl#> .")
    out.append("@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .")
    out.append("@prefix dct:  <http://purl.org/dc/terms/> .")
    out.append(f"@prefix def:  <{NS}> .")
    out.append("")

    out.append(f"<{NS}> a owl:Ontology ;")
    out.append(f'  dct:title "{onto["title"]}" ;')
    out.append(f'  owl:versionInfo "{onto["version"]}" ;')
    out.append(f'  rdfs:comment """{onto["abstract"].strip()}""" .')
    out.append("")

    for name in sorted(terms["classes"]):
        c = terms["classes"][name] or {}
        out.append(f"def:{name} a owl:Class ;")
        if c.get("label_ko"):
            out.append(f'  rdfs:label "{c["label_ko"]}"@ko ;')
        out.append(f'  rdfs:label "{name}"@en ;')
        if c.get("comment"):
            out.append(f'  rdfs:comment "{c["comment"]}"@ko ;')
        if c.get("parent"):
            out.append(f"  rdfs:subClassOf def:{c['parent']} ;")
        if c.get("used_by"):
            ids = ", ".join(f'"{x:02}"' for x in c["used_by"])
            out.append(f"  dct:source {ids} ;")
        out[-1] = out[-1].rstrip(" ;") + " ."
        out.append("")

    for name in sorted(terms["properties"]):
        p = terms["properties"][name] or {}
        kind = p.get("kind", "data")
        ptype = "owl:ObjectProperty" if kind == "object" else "owl:DatatypeProperty"
        out.append(f"def:{name} a {ptype} ;")
        if p.get("label_ko"):
            out.append(f'  rdfs:label "{p["label_ko"]}"@ko ;')
        out.append(f'  rdfs:label "{name}"@en ;')
        if p.get("domain"):
            out.append(f"  rdfs:domain def:{p['domain']} ;")
        if p.get("range"):
            r = p["range"]
            if ":" in r:  # xsd:foo etc
                out.append(f"  rdfs:range {r} ;")
            else:
                out.append(f"  rdfs:range def:{r} ;")
        out[-1] = out[-1].rstrip(" ;") + " ."
        out.append("")
    return "\n".join(out) + "\n"


# ── ReSpec HTML emitter ───────────────────────────────────────────────────
def _esc(s: str) -> str:
    return html.escape(str(s), quote=True)


def _ds_link(n: int, datasets: dict) -> str:
    code = f"ds{n:02}"
    ds = datasets.get(code) if datasets else None
    label = ds.get("name_ko") if ds else ""
    if label:
        return f'<a href="#{code}"><code>{code}</code> {_esc(label)}</a>'
    return f'<a href="#{code}"><code>{code}</code></a>'


def _row_class(name: str, c: dict, datasets: dict) -> str:
    parent = f' rdfs:subClassOf <code>def:{c["parent"]}</code>' if c.get("parent") else ""
    used_html = "<br>".join(_ds_link(n, datasets) for n in c.get("used_by", []))
    return (
        f'<tr id="cls-{_esc(name)}">'
        f'<td><code>def:{_esc(name)}</code></td>'
        f'<td>{_esc(c.get("label_ko",""))}</td>'
        f'<td>{_esc(c.get("comment","") or "")}{parent}</td>'
        f'<td>{used_html or "—"}</td>'
        f"</tr>"
    )


def _row_prop(name: str, p: dict) -> str:
    kind = p.get("kind", "data")
    dom = p.get("domain", "")
    rng = p.get("range", "")
    rng_html = f"<code>def:{_esc(rng)}</code>" if (rng and ":" not in str(rng)) else f"<code>{_esc(rng)}</code>"
    return (
        f'<tr id="prop-{_esc(name)}">'
        f'<td><code>def:{_esc(name)}</code></td>'
        f'<td>{_esc(p.get("label_ko",""))}</td>'
        f'<td>{kind}</td>'
        f'<td>{f"<code>def:{_esc(dom)}</code>" if dom else "—"}</td>'
        f"<td>{rng_html or '—'}</td>"
        f"</tr>"
    )


def _ds_section(datasets: dict) -> str:
    """Render R2RML-style dataset mapping section.

    Each dataset becomes a sub-section (h3) so it appears in the ReSpec ToC,
    with metadata table + column-mapping table + relations table.
    """
    if not datasets:
        return ""
    parts: list[str] = []
    for code in sorted(datasets):
        ds = datasets[code] or {}
        title = f"{code} — {_esc(ds.get('name_ko',''))}"
        parts.append(f'<section id="{code}">')
        parts.append(f"<h3>{title}</h3>")

        # metadata
        parts.append("<table><tbody>")
        for k, label in [
            ("source_csv", "Source CSV"),
            ("builder", "Builder module"),
            ("primary_class", "Primary class"),
            ("uri_template", "URI template"),
            ("key_columns", "Key columns"),
        ]:
            v = ds.get(k)
            if v is None:
                continue
            if k == "primary_class":
                v_html = f'<a href="#cls-{_esc(v)}"><code>def:{_esc(v)}</code></a>'
            elif k == "key_columns":
                v_html = ", ".join(f"<code>{_esc(x)}</code>" for x in v)
            elif k in ("source_csv", "builder", "uri_template"):
                v_html = f"<code>{_esc(v)}</code>"
            else:
                v_html = _esc(v)
            parts.append(f"<tr><th>{label}</th><td>{v_html}</td></tr>")
        parts.append("</tbody></table>")

        # column map (R2RML rr:predicate / rr:column equivalent)
        cmap = ds.get("column_map") or {}
        if cmap:
            parts.append("<p><b>Column map</b> (CSV column → <code>def:</code> property)</p>")
            parts.append("<table><thead><tr><th>CSV column</th><th>Predicate</th></tr></thead><tbody>")
            for col, prop in cmap.items():
                if ":" in str(prop):  # already prefixed (e.g. rdfs:label)
                    prop_html = f"<code>{_esc(prop)}</code>"
                else:
                    prop_html = f'<a href="#prop-{_esc(prop)}"><code>def:{_esc(prop)}</code></a>'
                parts.append(f"<tr><td><code>{_esc(col)}</code></td><td>{prop_html}</td></tr>")
            parts.append("</tbody></table>")

        # relations (object properties)
        rels = ds.get("relations") or {}
        if rels:
            parts.append("<p><b>Relations</b> (object properties)</p>")
            parts.append("<table><thead><tr><th>Source columns</th><th>Predicate</th><th>Target class</th><th>Note</th></tr></thead><tbody>")
            for src, spec in rels.items():
                if isinstance(spec, dict):
                    prop = spec.get("property", "")
                    tgt = spec.get("target_class", "")
                    note = ", ".join(f"{k}={v}" for k, v in spec.items() if k not in ("property", "target_class"))
                else:
                    prop, tgt, note = str(spec), "", ""
                prop_html = f'<a href="#prop-{_esc(prop)}"><code>def:{_esc(prop)}</code></a>' if prop else "—"
                tgt_html = f'<a href="#cls-{_esc(tgt)}"><code>def:{_esc(tgt)}</code></a>' if tgt else "—"
                parts.append(f"<tr><td><code>{_esc(src)}</code></td><td>{prop_html}</td><td>{tgt_html}</td><td>{_esc(note)}</td></tr>")
            parts.append("</tbody></table>")

        if ds.get("notes"):
            parts.append(f'<p><b>Notes</b><br>{_esc(ds["notes"]).replace(chr(10),"<br>")}</p>')

        parts.append("</section>")
    return "\n".join(parts)


def _html(terms: dict) -> str:
    onto = terms["ontology"]
    datasets = terms.get("datasets") or {}
    classes_html = "\n".join(
        _row_class(n, terms["classes"][n] or {}, datasets) for n in sorted(terms["classes"])
    )
    props_html = "\n".join(
        _row_prop(n, terms["properties"][n] or {}) for n in sorted(terms["properties"])
    )
    datasets_html = _ds_section(datasets)
    abstract = _esc(onto["abstract"]).replace("\n", "<br>")
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>{_esc(onto['title'])}</title>
  <script src="https://www.w3.org/Tools/respec/respec-w3c" class="remove" defer></script>
  <script class="remove">
    var respecConfig = {{
      specStatus: "{onto['status']}",
      shortName:  "{onto['short_name']}",
      editors: [{{ name: "Pet-Graph Working Group" }}],
      github:   "https://github.com/knowledgemap-kr/petgraph",
      license:  "cc-by",
      latestVersion: null,
      maxTocLevel: 4,
    }};
  </script>
  <style>
    table {{ border-collapse: collapse; width: 100%; margin: 1em 0; }}
    th, td {{ border: 1px solid #ccc; padding: 6px 10px; vertical-align: top; }}
    th {{ background: #f4f6fa; text-align: left; }}
    code {{ font-size: 0.9em; }}
  </style>
</head>
<body>

<section id="abstract"><p>{abstract}</p></section>

<section id="sotd"><p>본 명세는 <code>docs/respec/terms.yaml</code> 단일 진실원천에서
자동 생성되며, <code>backend/kg/vocab.py</code> 와의 정합이 빌드 시 강제된다.</p></section>

<section>
<h2>1. Namespaces</h2>
<table>
  <thead><tr><th>Prefix</th><th>IRI</th><th>용도</th></tr></thead>
  <tbody>
    <tr><td><code>def:</code></td><td><code>{NS}</code></td><td>온톨로지 (클래스/속성)</td></tr>
    <tr><td><code>id:</code></td><td><code>https://knowledgemap.kr/koah/id/</code></td><td>인스턴스</td></tr>
    <tr><td><code>doc:</code></td><td><code>https://knowledgemap.kr/koah/doc/</code></td><td>인스턴스 기술 문서 (303)</td></tr>
    <tr><td><code>set:</code></td><td><code>https://knowledgemap.kr/koah/set/</code></td><td>컬렉션</td></tr>
  </tbody>
</table>
</section>

<section>
<h2>2. Datasets (R2RML-style mappings)</h2>
<p>14개 공공 데이터셋과 1개 추론 파생 데이터셋의 CSV → RDF 매핑 명세.
각 데이터셋은 <code>backend/kg/builders/dsXX_*.py</code> 정본 빌더에 1:1 대응한다.
R2RML(RDB 전용) 대신 CSV 친화적 단순 형식으로 표현하나
<code>rr:logicalTable</code>·<code>rr:subjectMap</code>·<code>rr:predicateObjectMap</code>
의 세 핵심 개념(<i>source</i>, <i>uri template</i>, <i>column → predicate</i>)을 모두 보존한다.</p>
{datasets_html}
</section>

<section>
<h2>3. Classes</h2>
<table>
  <thead><tr><th>Term</th><th>Label (ko)</th><th>Comment</th><th>Sources</th></tr></thead>
  <tbody>
{classes_html}
  </tbody>
</table>
</section>

<section>
<h2>4. Properties</h2>
<table>
  <thead><tr><th>Term</th><th>Label (ko)</th><th>Kind</th><th>Domain</th><th>Range</th></tr></thead>
  <tbody>
{props_html}
  </tbody>
</table>
</section>

<section>
<h2>5. Reasoning Patterns</h2>
<pre><code>SymptomCategory --def:mapsTo→            VetDepartment
Symptom         --def:indicatesDisease→  Disease    (역방향 def:hasSymptom)
Disease         --def:treatedByDept→     VetDepartment
VetDepartment   --def:treatsSympCategory→ SymptomCategory
VetDepartment   --def:handledBy→         AnimalHospital
</code></pre>

<p>예시 SPARQL:</p>
<pre><code>PREFIX def: &lt;{NS}&gt;
SELECT ?d ?dept WHERE {{
  ?sym a def:Symptom ; def:indicatesDisease ?d .
  ?d   def:treatedByDept ?dept .
}} LIMIT 10
</code></pre>
</section>

<section>
<h2>6. URI Policy</h2>
<p>전체 정책은 <a href="../URI_POLICY.md"><code>docs/URI_POLICY.md</code></a> 참조 (UK Public Sector URI 101).</p>
</section>

</body>
</html>
"""


def main() -> int:
    terms = _load()
    _validate(terms)

    HTML_PATH.parent.mkdir(parents=True, exist_ok=True)
    TTL_PATH.parent.mkdir(parents=True, exist_ok=True)

    HTML_PATH.write_text(_html(terms), encoding="utf-8")
    TTL_PATH.write_text(_ttl(terms), encoding="utf-8")
    print(f"wrote {HTML_PATH.relative_to(REPO)}")
    print(f"wrote {TTL_PATH.relative_to(REPO)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
