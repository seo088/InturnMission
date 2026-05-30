#!/usr/bin/env bash
# Pet-Graph 전체 빌드 + Fuseki 적재 단일 진입점.
#
# 사용법:
#   bash ops/scripts/build_all.sh           # build all + load + verify
#   bash ops/scripts/build_all.sh build     # 빌더만
#   bash ops/scripts/build_all.sh load      # Fuseki 적재만
#   bash ops/scripts/build_all.sh verify    # SPARQL 카운트 검증
set -euo pipefail

cd "$(dirname "$0")/../.."
PY=backend/venv/bin/python

run_build () {
  echo "▶ pytest"
  $PY -m pytest backend/tests/test_kg_core.py -q

  echo "▶ regenerate ReSpec ontology"
  $PY docs/respec/build.py

  for id in 01 02 03 04 05 08 09 10 11 12 13 14 15 16; do
    echo "▶ build $id"
    $PY -m backend.kg.cli build "$id"
  done
}

run_load () {
  set -a; source ops/fuseki/.env; set +a
  bash ops/fuseki/load.sh
}

run_verify () {
  ENDPOINT="${FUSEKI_ENDPOINT:-http://localhost:3031/ds}/sparql"
  echo "▶ total triples"
  curl -s --data-urlencode 'query=SELECT (COUNT(*) AS ?n) WHERE { ?s ?p ?o }' \
    "$ENDPOINT" -H 'Accept: text/csv'
  echo
  echo "▶ class counts"
  curl -s --data-urlencode 'query=PREFIX def: <https://knowledgemap.kr/koah/def/>
SELECT ?cls (COUNT(?s) AS ?n) WHERE {
  GRAPH ?g { ?s a ?cls }
  FILTER(STRSTARTS(STR(?cls), STR(def:)))
} GROUP BY ?cls ORDER BY DESC(?n)' "$ENDPOINT" -H 'Accept: text/csv'
}

case "${1:-all}" in
  build)  run_build ;;
  load)   run_load ;;
  verify) run_verify ;;
  all)    run_build; run_load; run_verify ;;
  *) echo "usage: $0 [build|load|verify|all]"; exit 2 ;;
esac
