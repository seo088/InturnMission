"""
fallback 좌표(시군구 중심점) → 카카오 주소 검색 API로 재지오코딩
대상: cleaned_2차/ 의 01~05 시설 CSV
결과: 같은 파일 in-place 업데이트 (coord_status: centroid_fallback → ok, coord_accuracy: kakao_exact / kakao_road)

실행: python backend/geocode_fallback.py
재실행 안전: 이미 ok 처리된 행은 건너뜀 (체크포인트 불필요)
API 키 교체: KAKAO_KEY 상수만 변경
"""

import csv
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

KAKAO_KEY = "68ce7983ece74c2b864b4154546d1976"
CLEAN_DIR = Path(__file__).parent.parent / "cleaned_2차"

TARGETS = [
    ("병원",  "01_hospital_clean.csv"),
    ("약국",  "02_pharmacy_clean.csv"),
    ("미용",  "03_grooming_clean.csv"),
    ("위탁",  "04_boarding_clean.csv"),
    ("장묘",  "05_cremation_clean.csv"),
]

# 요청 간격 및 재시도 설정
REQUEST_INTERVAL = 0.35   # 초당 ~3건 (안전 여유)
RETRY_WAIT       = 60     # 쿼터 초과 시 대기(초)
MAX_QUOTA_RETRY  = 3      # 쿼터 초과 최대 재시도 횟수


def _call_api(address: str) -> tuple[float, float, str] | None | str:
    """
    반환값:
      (lat, lon, type) → 성공
      None             → 주소 불일치 (결과 없음)
      "QUOTA"          → 일일 한도 초과
    """
    url = (
        "https://dapi.kakao.com/v2/local/search/address.json"
        f"?query={urllib.parse.quote(address)}&size=1"
    )
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"KakaoAK {KAKAO_KEY}",
            "KA": "sdk/1.0 os/web origin/localhost",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read())
        docs = data.get("documents", [])
        if docs:
            d = docs[0]
            return float(d["y"]), float(d["x"]), d["address_type"]
        return None
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="ignore")
        if e.code == 400 and "API limit" in body:
            return "QUOTA"
        return None
    except Exception:
        return None


def kakao_geocode(address: str) -> tuple[float, float, str] | None | str:
    """
    1차: 원본 주소
    2차: 첫 쉼표 앞까지 단순화 (예: "도로명 102, 205호 (빌딩)" → "도로명 102")
    쿼터 초과 시 "QUOTA" 반환
    """
    result = _call_api(address)
    if result == "QUOTA":
        return "QUOTA"
    if result:
        return result

    simplified = address.split(",")[0].strip()
    if simplified != address:
        time.sleep(REQUEST_INTERVAL)
        result = _call_api(simplified)
        if result == "QUOTA":
            return "QUOTA"
        if result:
            return result

    return None


def process_file(label: str, filename: str) -> None:
    path = CLEAN_DIR / filename
    with open(path, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    fieldnames = list(rows[0].keys())

    # 이미 ok 처리된 행은 건너뜀 → 재실행 안전
    fallback_rows = [r for r in rows if "fallback" in r.get("coord_status", "")]
    total = len(fallback_rows)
    if total == 0:
        print(f"\n[{label}] fallback 없음, 스킵")
        return
    print(f"\n[{label}] fallback {total}건 처리 시작")

    ok_cnt = 0
    fail_cnt = 0
    quota_retries = 0

    i = 0
    while i < len(fallback_rows):
        row = fallback_rows[i]
        addr = row.get("roadaddress", "").strip()
        if not addr:
            fail_cnt += 1
            i += 1
            continue

        result = kakao_geocode(addr)

        if result == "QUOTA":
            quota_retries += 1
            if quota_retries > MAX_QUOTA_RETRY:
                print(f"\n  ⛔ 쿼터 초과 {MAX_QUOTA_RETRY}회 재시도 후 중단. 내일 다시 실행하세요.")
                # 중간 저장 후 종료
                _save(path, fieldnames, rows)
                print(f"[{label}] 중간저장: 성공={ok_cnt}, 실패={fail_cnt}, 남은={total-i}건")
                raise SystemExit(1)
            print(f"\n  ⚠ 쿼터 초과. {RETRY_WAIT}초 대기 후 재시도 ({quota_retries}/{MAX_QUOTA_RETRY})...")
            time.sleep(RETRY_WAIT)
            continue  # i 증가 없이 재시도
        elif result:
            lat, lon, addr_type = result
            row["lat"] = str(lat)
            row["lon"] = str(lon)
            row["coord_status"] = "ok"
            row["coord_accuracy"] = "kakao_exact" if addr_type == "ROAD_ADDR" else "kakao_road"
            ok_cnt += 1
            quota_retries = 0
        else:
            fail_cnt += 1

        i += 1
        if i % 200 == 0:
            print(f"  {i}/{total}  ✅={ok_cnt}  ❌={fail_cnt}")
            _save(path, fieldnames, rows)  # 200건마다 중간저장

        time.sleep(REQUEST_INTERVAL)

    _save(path, fieldnames, rows)
    print(f"[{label}] 완료: ✅={ok_cnt}, ❌={fail_cnt}")


def _save(path: Path, fieldnames: list, rows: list) -> None:
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    print("=== 카카오 주소 재지오코딩 ===")
    print(f"대상: cleaned_2차/ 병원/약국/미용/위탁/장묘 CSV")
    print(f"이미 ok 처리된 행은 자동 스킵 (재실행 안전)\n")
    for label, filename in TARGETS:
        process_file(label, filename)
    print("\n전체 지오코딩 완료")


if __name__ == "__main__":
    main()
