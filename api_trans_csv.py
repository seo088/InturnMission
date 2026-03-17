import requests
import csv
import os

# 1. 포털 마이페이지에서 [일반 인증키(Encoding)]를 복사해서 넣어보세요. 
# 만약 안되면 [Decoding] 키로 교체하세요.
SERVICE_KEY = "96ed67423c666f7e208f748b1ea6e32e4a4fe9ff6417187340ceeb7e1fb3a7b8"

OUTPUT_DIR = "./공공데이터_CSV"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def collect_07_final_rescue():
    print("▶ 07. 반려동물 동반여행 상세 데이터 강제 추출 시도...")
    
    # KorPetTourService2의 핵심인 상세 정보 엔드포인트
    base_url = "https://apis.data.go.kr/B551011/KorPetTourService2/detailPetTour2"
    
    # 쿼리 스트링 수동 생성 (인코딩 방지)
    query_params = (
        f"?serviceKey={SERVICE_KEY}"
        "&MobileOS=ETC"
        "&MobileApp=PetGraph"
        "&_type=json"
        "&pageNo=1"
        "&numOfRows=100"
    )
    
    full_url = base_url + query_params
    
    try:
        # URL 전체를 직접 전달
        res = requests.get(full_url, timeout=30)
        
        # 만약 결과가 XML로 오면 인증 실패 메시지 출력
        if res.text.startswith("<?xml"):
            print("  ❌ API 인증 에러 (XML 응답): 키 타입(Encoding/Decoding)을 바꿔보세요.")
            return

        data = res.json()
        body = data.get("response", {}).get("body", {})
        items_node = body.get("items")

        if not items_node or items_node == "":
            print("  ⚠️ 서버 응답은 정상이나 데이터가 0건입니다.")
            print("  💡 이 현상은 보통 API 활용 신청 승인 후 데이터 동기화까지 24시간이 걸릴 때 발생합니다.")
            return

        items = items_node.get("item", [])
        if isinstance(items, dict): items = [items]

        # 저장
        filename = "07_반려동물_관광상세_최종.csv"
        path = os.path.join(OUTPUT_DIR, filename)
        
        with open(path, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=items[0].keys())
            writer.writeheader()
            writer.writerows(items)
            
        print(f"  ✅ [성공] {len(items)}건의 상세 데이터를 저장했습니다!")

    except Exception as e:
        print(f"  ❌ 실행 오류: {e}")

if __name__ == "__main__":
    collect_07_final_rescue()