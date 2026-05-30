#!/usr/bin/env bash
# Load all turtle/*.ttl into Fuseki as named graphs.
# Usage: bash ops/fuseki/load.sh [--legacy] [--dry-run]
#
# Graph naming: urn:knowledgemap:<basename without ext>
# - knowledgemap_all.ttl  → default graph
# - animalloo_all.ttl     → only when --legacy passed
set -euo pipefail

ENDPOINT="${FUSEKI_ENDPOINT:-http://localhost:3030/knowledgemap}"
USER="${FUSEKI_USER:-admin}"
PW="${FUSEKI_ADMIN_PW:?set FUSEKI_ADMIN_PW (see ops/fuseki/.env.example)}"
TURTLE_DIR="${TURTLE_DIR:-$(cd "$(dirname "$0")/../.." && pwd)/turtle}"

INCLUDE_LEGACY=0
DRY=0
for arg in "$@"; do
  case "$arg" in
    --legacy)  INCLUDE_LEGACY=1 ;;
    --dry-run) DRY=1 ;;
    *) echo "unknown: $arg"; exit 2 ;;
  esac
done

put_graph () {
  local file="$1" graph="$2"
  echo "▶ PUT $graph  ←  $(basename "$file")"
  if [[ $DRY -eq 1 ]]; then return 0; fi
  curl -fsS -u "$USER:$PW" -X PUT \
    -H "Content-Type: text/turtle; charset=utf-8" \
    --data-binary "@$file" \
    "$ENDPOINT/data?graph=$graph"
  echo
}

# 1. default graph: knowledgemap_all.ttl
if [[ -f "$TURTLE_DIR/knowledgemap_all.ttl" ]]; then
  put_graph "$TURTLE_DIR/knowledgemap_all.ttl" "default"
else
  echo "⚠  knowledgemap_all.ttl 없음 — kg-build 먼저 실행 필요"
fi

# 2. per-dataset named graphs
shopt -s nullglob
for f in "$TURTLE_DIR"/[0-9][0-9]_*.ttl "$TURTLE_DIR"/def_*.ttl; do
  base="$(basename "$f" .ttl)"
  put_graph "$f" "urn:knowledgemap:$base"
done

# 3. legacy (optional, for diff/comparison only)
if [[ $INCLUDE_LEGACY -eq 1 && -f "$TURTLE_DIR/animalloo_all.ttl" ]]; then
  put_graph "$TURTLE_DIR/animalloo_all.ttl" "urn:knowledgemap:legacy"
fi

# 4. healthcheck
echo "▶ ping"
curl -fsS "$ENDPOINT/query?query=SELECT%20(COUNT(*)%20AS%20%3Fn)%20WHERE%20%7B%3Fs%20%3Fp%20%3Fo%7D" \
  -H "Accept: application/sparql-results+json"
echo
echo "✅ load.sh done"
