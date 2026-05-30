import httpx
from fastapi import HTTPException
from app.core.config import settings

FUSEKI_URL = f"{settings.FUSEKI_URL}/sparql"

async def sparql_query(query: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                FUSEKI_URL,
                data={"query": query},
                headers={"Accept": "application/sparql-results+json"},
            )
            r.raise_for_status()
            return r.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail=f"Fuseki 서버({FUSEKI_URL})에 연결할 수 없습니다.")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Fuseki 오류: {e.response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SPARQL 쿼리 실패: {str(e)}")
