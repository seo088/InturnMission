# Fuseki 로컬 기동

## 사전 준비 (1회)

```bash
# 1. docker 그룹에 사용자 추가 (현재 미소속)
sudo usermod -aG docker $USER
newgrp docker        # 또는 로그아웃/재로그인

# 2. 비밀번호 설정
cp ops/fuseki/.env.example ops/fuseki/.env
$EDITOR ops/fuseki/.env       # FUSEKI_ADMIN_PW 변경
```

## 기동

```bash
docker compose -f ops/fuseki/docker-compose.fuseki.yml --env-file ops/fuseki/.env up -d
docker compose -f ops/fuseki/docker-compose.fuseki.yml ps
curl -fsS http://localhost:3030/$/ping
```

## TTL 적재

```bash
# 신규 빌드 산출물 PUT
bash ops/fuseki/load.sh

# 레거시(animalloo.kr 네임스페이스)도 함께 비교용으로
bash ops/fuseki/load.sh --legacy

# 무엇이 PUT 될지만 보기
bash ops/fuseki/load.sh --dry-run
```

기대 graph 목록:
- `default` ← `turtle/knowledgemap_all.ttl` (kg-build merge 후 생성)
- `urn:knowledgemap:def_animal` ← `turtle/def_animal.ttl` (ReSpec 생성)
- `urn:knowledgemap:08_abandoned_animal`
- `urn:knowledgemap:16_reasoning_chain`
- (P2 잔여) 01..15

## 검증 SPARQL

```bash
curl -fsS http://localhost:3030/knowledgemap/query \
  --data-urlencode 'query=PREFIX def: <https://knowledgemap.kr/koah/def/>
SELECT (COUNT(*) AS ?n) WHERE { ?s a def:AbandonedAnimal }' \
  -H 'Accept: application/sparql-results+json'
```

## 종료 / 백업

```bash
docker compose -f ops/fuseki/docker-compose.fuseki.yml down            # 컨테이너만 (데이터 보존)
docker compose -f ops/fuseki/docker-compose.fuseki.yml down -v          # ⚠ 데이터 삭제
docker run --rm -v knowledgemap_fuseki_data:/d alpine tar czf - /d \
  > backups/fuseki-$(date +%F).tar.gz
```

## 운영 (NAS) 이전 시 변경 사항
- `127.0.0.1:3030` → reverse-proxy 뒤로
- `shiro.ini`: 모든 endpoint 인증 필수, GET 만 익명
- TLS (Let's Encrypt + DNS-01)
- 콘텐츠 협상 (303 redirect from `id/` to `doc/`, Accept 기반 ttl/jsonld/html)
