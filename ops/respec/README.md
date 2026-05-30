# ops/respec — Knowledgemap Animal Ontology serving

W3C ReSpec HTML(`docs/respec/ontology.html`)과 OWL Turtle(`turtle/def_animal.ttl`)을
nginx 정적 컨테이너로 서빙하며, `Accept` 헤더 기반 content negotiation을 수행한다.

UK Public Sector URI 101 정책(`docs/URI_POLICY.md`) 4-layer 중 **def 레이어** 전용.

## 사용법

```bash
# 1. ReSpec/TTL 재생성 (소스: docs/respec/terms.yaml)
python docs/respec/build.py

# 2. 컨테이너 기동
docker compose -f ops/respec/docker-compose.respec.yml up -d

# 3. 검증
curl -s localhost:5280/healthz                                              # ok
open http://localhost:5280/def/animal/                                      # ReSpec HTML
curl -sI -H "Accept: text/turtle" localhost:5280/def/animal/                # → def_animal.ttl
curl -sI -H "Accept: text/turtle" localhost:5280/def/animal/AnimalHospital  # → def_animal.ttl
curl -s  -H "Accept: text/turtle" localhost:5280/def/animal/ | head
```

| 경로 | Accept | 응답 |
|---|---|---|
| `/` | (any) | 302 → `/def/animal/` |
| `/def/animal/` | `text/html` (default) | `ontology.html` |
| `/def/animal/` | `text/turtle` | `def_animal.ttl` |
| `/def/animal/{Term}` | `text/html` | `ontology.html` (브라우저가 fragment로 점프) |
| `/def/animal/{Term}` | `text/turtle` | `def_animal.ttl` (전체 ontology) |
| `/respec/` | (any) | 디렉토리 인덱스 (dev) |
| `/turtle/` | (any) | 디렉토리 인덱스 (dev) |

## 정지

```bash
docker compose -f ops/respec/docker-compose.respec.yml down
```

## DNS 전환 체크리스트 (knowledgemap.kr 확보 후)

1. `nginx.conf`
   - `server_name _;` → `server_name def.knowledgemap.kr knowledgemap.kr;`
   - HTTPS server block 추가 (listen 443 ssl http2)
   - HTTP→HTTPS 영구 redirect block 추가
2. TLS 인증서
   - 옵션 A: certbot sidecar + `/etc/letsencrypt` volume
   - 옵션 B: 상위 reverse proxy(Traefik/Caddy)에서 종료, 본 컨테이너는 80만 노출
3. `docker-compose.respec.yml`
   - 외부 노출 포트 `5280:80` → `80:80` + `443:443` (또는 reverse proxy 네트워크에만 attach)
4. 영속성 (URI 101 핵심)
   - `/def/animal/{Term}` URI는 **변경 금지**
   - 클래스/속성 rename 시 구 URI는 `owl:deprecated true` + `dcterms:isReplacedBy` 로 보존
5. 외부 HTTP 캐시 헤더
   - `add_header Cache-Control "public, max-age=3600";` (ontology 안정 후 86400)

## 주의

- nginx가 사용하는 두 마운트(`docs/respec`, `turtle`)는 read-only. 빌더는 호스트에서 실행.
- 컨테이너 재시작 없이 파일만 갱신해도 즉시 반영(volume mount).
- `terms.yaml` 수정 → 반드시 `python docs/respec/build.py` 재실행 (vocab.py drift 검증).
