# # # """
# # # 반려동물 관련 공공데이터 API 자동 수집 스크립트
# # # 실행 방법: python 공공데이터_API_수집스크립트.py
# # # 필요 패키지: pip install requests
# # # """

# # # import requests
# # # import csv
# # # import time
# # # import os
# # # import json
# # # from datetime import datetime

# # # # ────────────────────────────────────────────
# # # # 공통 설정
# # # # ────────────────────────────────────────────
# # # SERVICE_KEY = "96ed67423c666f7e208f748b1ea6e32e4a4fe9ff6417187340ceeb7e1fb3a7b8"
# # # OUTPUT_DIR = "./공공데이터_CSV"
# # # os.makedirs(OUTPUT_DIR, exist_ok=True)

# # # HEADERS = {"Accept": "application/json"}
# # # NUM_OF_ROWS = 1000   # 한 번에 가져올 행 수 (최대값)
# # # DELAY = 0.5          # API 호출 간격 (초) - 과부하 방지


# # # def fetch_all_pages(base_url, params, data_extractor, label=""):
# # #     """페이지네이션을 자동으로 처리하며 전체 데이터를 수집"""
# # #     all_items = []
# # #     page = 1
# # #     total = None

# # #     while True:
# # #         params.update({"pageNo": page, "numOfRows": NUM_OF_ROWS})
# # #         try:
# # #             res = requests.get(base_url, params=params, headers=HEADERS, timeout=30)
# # #             res.raise_for_status()
# # #             data = res.json()
# # #         except Exception as e:
# # #             print(f"  ❌ [{label}] 페이지 {page} 오류: {e}")
# # #             break

# # #         items, total_count = data_extractor(data)
# # #         if not items:
# # #             break

# # #         all_items.extend(items)
# # #         if total is None:
# # #             total = total_count
# # #         print(f"  📄 [{label}] 페이지 {page} - {len(items)}건 수집 (누적: {len(all_items)}/{total})")

# # #         if len(all_items) >= total:
# # #             break
# # #         page += 1
# # #         time.sleep(DELAY)

# # #     return all_items


# # # def save_csv(filename, fieldnames, rows):
# # #     path = os.path.join(OUTPUT_DIR, filename)
# # #     with open(path, "w", newline="", encoding="utf-8-sig") as f:
# # #         writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
# # #         writer.writeheader()
# # #         writer.writerows(rows)
# # #     print(f"  ✅ 저장 완료: {filename} ({len(rows)}건)\n")


# # # # ════════════════════════════════════════════
# # # # 01. 동물병원 조회 (행정안전부)
# # # # ════════════════════════════════════════════
# # # def collect_동물병원():
# # #     print("▶ 01. 동물병원 조회 수집 중...")
# # #     base_url = "https://apis.data.go.kr/1741000/animal_hospitals/info"
# # #     params = {"serviceKey": SERVICE_KEY, "_type": "json"}

# # #     def extractor(data):
# # #         try:
# # #             body = data["response"]["body"]
# # #             items = body["items"]["item"]
# # #             if isinstance(items, dict):
# # #                 items = [items]
# # #             return items, int(body["totalCount"])
# # #         except Exception:
# # #             return [], 0

# # #     raw = fetch_all_pages(base_url, params, extractor, "동물병원")
# # #     rows = []
# # #     for r in raw:
# # #         rows.append({
# # #             "Name": r.get("BPLC_NM", ""),
# # #             "Facility_ID": r.get("MNG_NO", ""),
# # #             "Category": r.get("OPN_ATMY_GRP_CD", ""),
# # #             "BusinessStatus": r.get("SALS_STTS_NM", ""),
# # #             "BusinessStatusDetail": r.get("DTL_SALS_STTS_NM", ""),
# # #             "Sido": r.get("ROAD_NM_ADDR", "").split()[0] if r.get("ROAD_NM_ADDR") else "",
# # #             "Sigungu": r.get("ROAD_NM_ADDR", "").split()[1] if r.get("ROAD_NM_ADDR") and len(r.get("ROAD_NM_ADDR","").split()) > 1 else "",
# # #             "Dong": r.get("LOTNO_ADDR", "").split()[1] if r.get("LOTNO_ADDR") and len(r.get("LOTNO_ADDR","").split()) > 1 else "",
# # #             "LotNumber": r.get("LOTNO_ADDR", ""),
# # #             "RoadAddress": r.get("ROAD_NM_ADDR", ""),
# # #             "PostalCode": r.get("ROAD_NM_ZIP", ""),
# # #             "lat": r.get("CRD_INFO_Y", ""),
# # #             "lon": r.get("CRD_INFO_X", ""),
# # #             "PhoneNumber": r.get("TELNO", ""),
# # #             "LicenseDate": r.get("LCPMT_YMD", ""),
# # #             "ClosingDate": r.get("CLSBIZ_YMD", ""),
# # #             "LastUpdated": r.get("DAT_UPDT_PNT", ""),
# # #         })
# # #     save_csv("01_동물병원_조회데이터.csv",
# # #              ["Name","Facility_ID","Category","BusinessStatus","BusinessStatusDetail",
# # #               "Sido","Sigungu","Dong","LotNumber","RoadAddress","PostalCode",
# # #               "lat","lon","PhoneNumber","LicenseDate","ClosingDate","LastUpdated"], rows)


# # # # ════════════════════════════════════════════
# # # # 02. 동물약국 조회 (행정안전부)
# # # # ════════════════════════════════════════════
# # # def collect_동물약국():
# # #     print("▶ 02. 동물약국 조회 수집 중...")
# # #     base_url = "https://apis.data.go.kr/1741000/animal_pharmacy/info"
# # #     params = {"serviceKey": SERVICE_KEY, "_type": "json"}

# # #     def extractor(data):
# # #         try:
# # #             body = data["response"]["body"]
# # #             items = body["items"]["item"]
# # #             if isinstance(items, dict):
# # #                 items = [items]
# # #             return items, int(body["totalCount"])
# # #         except Exception:
# # #             return [], 0

# # #     raw = fetch_all_pages(base_url, params, extractor, "동물약국")
# # #     rows = []
# # #     for r in raw:
# # #         addr = r.get("ROAD_NM_ADDR", "")
# # #         addr_parts = addr.split()
# # #         rows.append({
# # #             "Name": r.get("BPLC_NM", ""),
# # #             "Facility_ID": r.get("MNG_NO", ""),
# # #             "GroupCode": r.get("OPN_ATMY_GRP_CD", ""),
# # #             "RightMemberSN": r.get("RGHT_MNBD_SN", ""),
# # #             "BusinessStatus": r.get("SALS_STTS_NM", ""),
# # #             "BusinessStatusDetail": r.get("DTL_SALS_STTS_NM", ""),
# # #             "DataUpdateType": r.get("DAT_UPDT_SE", ""),
# # #             "LastUpdated": r.get("DAT_UPDT_PNT", ""),
# # #             "LastModified": r.get("LAST_MDFCN_PNT", ""),
# # #             "Sido": addr_parts[0] if addr_parts else "",
# # #             "Sigungu": addr_parts[1] if len(addr_parts) > 1 else "",
# # #             "Dong": r.get("LOTNO_ADDR", "").split()[1] if r.get("LOTNO_ADDR") and len(r.get("LOTNO_ADDR","").split()) > 1 else "",
# # #             "LotNumber": r.get("LOTNO_ADDR", ""),
# # #             "RoadAddress": addr,
# # #             "PostalCode": r.get("ROAD_NM_ZIP", ""),
# # #             "LotPostalCode": r.get("LCTN_ZIP", ""),
# # #             "FloorArea": r.get("LCTN_AREA", ""),
# # #             "lat": r.get("CRD_INFO_Y", ""),
# # #             "lon": r.get("CRD_INFO_X", ""),
# # #             "PhoneNumber": r.get("TELNO", ""),
# # #             "LicenseDate": r.get("LCPMT_YMD", ""),
# # #             "LicenseRevokedDate": r.get("LCPMT_RTRCN_YMD", ""),
# # #             "ReopenDate": r.get("ROBIZ_YMD", ""),
# # #             "ClosingDate": r.get("CLSBIZ_YMD", ""),
# # #             "SuspensionStartDate": r.get("TCBIZ_BGNG_YMD", ""),
# # #             "SuspensionEndDate": r.get("TCBIZ_END_YMD", ""),
# # #         })
# # #     save_csv("02_동물약국_조회데이터.csv",
# # #              ["Name","Facility_ID","GroupCode","RightMemberSN","BusinessStatus","BusinessStatusDetail",
# # #               "DataUpdateType","LastUpdated","LastModified","Sido","Sigungu","Dong","LotNumber",
# # #               "RoadAddress","PostalCode","LotPostalCode","FloorArea","lat","lon","PhoneNumber",
# # #               "LicenseDate","LicenseRevokedDate","ReopenDate","ClosingDate","SuspensionStartDate","SuspensionEndDate"], rows)


# # # # ════════════════════════════════════════════
# # # # 03. 동물미용업 조회 (행정안전부)
# # # # ════════════════════════════════════════════
# # # def collect_동물미용업():
# # #     print("▶ 03. 동물미용업 조회 수집 중...")
# # #     base_url = "https://apis.data.go.kr/1741000/pet_grooming/info"
# # #     params = {"serviceKey": SERVICE_KEY, "_type": "json"}

# # #     def extractor(data):
# # #         try:
# # #             body = data["response"]["body"]
# # #             items = body["items"]["item"]
# # #             if isinstance(items, dict):
# # #                 items = [items]
# # #             return items, int(body["totalCount"])
# # #         except Exception:
# # #             return [], 0

# # #     raw = fetch_all_pages(base_url, params, extractor, "동물미용업")
# # #     rows = []
# # #     for r in raw:
# # #         rows.append({
# # #             "Name": r.get("BPLC_NM", ""),
# # #             "Facility_ID": r.get("MNG_NO", ""),
# # #             "RightNumber": r.get("RGHT_MNBD_SN", ""),
# # #             "Category": r.get("OPN_ATMY_GRP_CD", ""),
# # #             "BusinessStatus": r.get("SALS_STTS_NM", ""),
# # #             "DetailedBusinessStatus": r.get("DTL_SALS_STTS_NM", ""),
# # #             "BusinessStatusCode": r.get("SALS_STTS_CD", ""),
# # #             "DetailedStatusCode": r.get("DTL_SALS_STTS_CD", ""),
# # #             "LocationArea": r.get("LCTN_AREA", ""),
# # #             "RoadAddress": r.get("ROAD_NM_ADDR", ""),
# # #             "PostalCode": r.get("ROAD_NM_ZIP", ""),
# # #             "LotAddress": r.get("LOTNO_ADDR", ""),
# # #             "LotPostalCode": r.get("LCTN_ZIP", ""),
# # #             "lat": r.get("CRD_INFO_Y", ""),
# # #             "lon": r.get("CRD_INFO_X", ""),
# # #             "PhoneNumber": r.get("TELNO", ""),
# # #             "LicenseDate": r.get("LCPMT_YMD", ""),
# # #             "LicenseWithdrawalDate": r.get("LCPMT_RTRCN_YMD", ""),
# # #             "ReopeningDate": r.get("ROBIZ_YMD", ""),
# # #             "ClosingDate": r.get("CLSBIZ_YMD", ""),
# # #             "TempClosingStart": r.get("TCBIZ_BGNG_YMD", ""),
# # #             "TempClosingEnd": r.get("TCBIZ_END_YMD", ""),
# # #             "DataUpdateType": r.get("DAT_UPDT_SE", ""),
# # #             "LastUpdated": r.get("DAT_UPDT_PNT", ""),
# # #             "LastModificationTime": r.get("LAST_MDFCN_PNT", ""),
# # #         })
# # #     save_csv("03_동물미용업_조회데이터.csv",
# # #              ["Name","Facility_ID","RightNumber","Category","BusinessStatus","DetailedBusinessStatus",
# # #               "BusinessStatusCode","DetailedStatusCode","LocationArea","RoadAddress","PostalCode",
# # #               "LotAddress","LotPostalCode","lat","lon","PhoneNumber","LicenseDate","LicenseWithdrawalDate",
# # #               "ReopeningDate","ClosingDate","TempClosingStart","TempClosingEnd","DataUpdateType",
# # #               "LastUpdated","LastModificationTime"], rows)


# # # # ════════════════════════════════════════════
# # # # 04. 동물위탁관리업 조회 (행정안전부)
# # # # ════════════════════════════════════════════
# # # def collect_동물위탁관리업():
# # #     print("▶ 04. 동물위탁관리업 조회 수집 중...")
# # #     base_url = "https://apis.data.go.kr/1741000/animal_boarding/info"
# # #     params = {"serviceKey": SERVICE_KEY, "_type": "json"}

# # #     def extractor(data):
# # #         try:
# # #             body = data["response"]["body"]
# # #             items = body["items"]["item"]
# # #             if isinstance(items, dict):
# # #                 items = [items]
# # #             return items, int(body["totalCount"])
# # #         except Exception:
# # #             return [], 0

# # #     raw = fetch_all_pages(base_url, params, extractor, "동물위탁관리업")
# # #     rows = []
# # #     for r in raw:
# # #         addr = r.get("ROAD_NM_ADDR", "")
# # #         addr_parts = addr.split()
# # #         rows.append({
# # #             "Name": r.get("BPLC_NM", ""),
# # #             "Facility_ID": r.get("MNG_NO", ""),
# # #             "Category": r.get("OPN_ATMY_GRP_CD", ""),
# # #             "TaskType": r.get("DTL_TASK_SE_NM", ""),
# # #             "BusinessStatus": f"{r.get('SALS_STTS_NM','')} / {r.get('DTL_SALS_STTS_NM','')}".strip(" /"),
# # #             "Sido": addr_parts[0] if addr_parts else "",
# # #             "Sigungu": addr_parts[1] if len(addr_parts) > 1 else "",
# # #             "Dong": r.get("LOTNO_ADDR", "").split()[1] if r.get("LOTNO_ADDR") and len(r.get("LOTNO_ADDR","").split()) > 1 else "",
# # #             "LotNumber": r.get("LOTNO_ADDR", ""),
# # #             "RoadAddress": addr,
# # #             "PostalCode": r.get("ROAD_NM_ZIP", ""),
# # #             "lat": r.get("CRD_INFO_Y", ""),
# # #             "lon": r.get("CRD_INFO_X", ""),
# # #             "PhoneNumber": r.get("TELNO", ""),
# # #             "LicenseDate": r.get("LCPMT_YMD", ""),
# # #             "ClosingDate": r.get("CLSBIZ_YMD", ""),
# # #             "LastUpdated": r.get("DAT_UPDT_PNT", ""),
# # #         })
# # #     save_csv("04_동물위탁관리업_조회데이터.csv",
# # #              ["Name","Facility_ID","Category","TaskType","BusinessStatus","Sido","Sigungu","Dong",
# # #               "LotNumber","RoadAddress","PostalCode","lat","lon","PhoneNumber","LicenseDate","ClosingDate","LastUpdated"], rows)


# # # # ════════════════════════════════════════════
# # # # 05. 동물장묘업 조회 (행정안전부)
# # # # ════════════════════════════════════════════
# # # def collect_동물장묘업():
# # #     print("▶ 05. 동물장묘업 조회 수집 중...")
# # #     base_url = "https://apis.data.go.kr/1741000/animal_cremation/info"
# # #     params = {"serviceKey": SERVICE_KEY, "_type": "json"}

# # #     def extractor(data):
# # #         try:
# # #             body = data["response"]["body"]
# # #             items = body["items"]["item"]
# # #             if isinstance(items, dict):
# # #                 items = [items]
# # #             return items, int(body["totalCount"])
# # #         except Exception:
# # #             return [], 0

# # #     raw = fetch_all_pages(base_url, params, extractor, "동물장묘업")
# # #     rows = []
# # #     for r in raw:
# # #         addr = r.get("ROAD_NM_ADDR", "")
# # #         addr_parts = addr.split()
# # #         rows.append({
# # #             "Name": r.get("BPLC_NM", ""),
# # #             "Facility_ID": r.get("MNG_NO", ""),
# # #             "Category": r.get("OPN_ATMY_GRP_CD", ""),
# # #             "BusinessStatus": f"{r.get('SALS_STTS_NM','')} / {r.get('DTL_SALS_STTS_NM','')}".strip(" /"),
# # #             "Sido": addr_parts[0] if addr_parts else "",
# # #             "Sigungu": addr_parts[1] if len(addr_parts) > 1 else "",
# # #             "Dong": r.get("LOTNO_ADDR", "").split()[1] if r.get("LOTNO_ADDR") and len(r.get("LOTNO_ADDR","").split()) > 1 else "",
# # #             "LotNumber": r.get("LOTNO_ADDR", ""),
# # #             "RoadAddress": addr,
# # #             "PostalCode": r.get("ROAD_NM_ZIP", ""),
# # #             "lat": r.get("CRD_INFO_Y", ""),
# # #             "lon": r.get("CRD_INFO_X", ""),
# # #             "PhoneNumber": r.get("TELNO", ""),
# # #             "LicenseDate": r.get("LCPMT_YMD", ""),
# # #             "ClosingDate": r.get("CLSBIZ_YMD", ""),
# # #             "LastUpdated": r.get("DAT_UPDT_PNT", ""),
# # #         })
# # #     save_csv("05_동물장묘업_조회데이터.csv",
# # #              ["Name","Facility_ID","Category","BusinessStatus","Sido","Sigungu","Dong",
# # #               "LotNumber","RoadAddress","PostalCode","lat","lon","PhoneNumber","LicenseDate","ClosingDate","LastUpdated"], rows)


# # # # ════════════════════════════════════════════
# # # # 06+07. 반려동물 동반여행 서비스 (한국관광공사)
# # # # ════════════════════════════════════════════
# # # def collect_반려동물동반여행():
# # #     print("▶ 06+07. 반려동물 동반여행 서비스 수집 중...")

# # #     # 06: 반려동물 동반 상세
# # #     base_pet = "https://apis.data.go.kr/B551011/KorPetTourService2/detailPetTour2"
# # #     params_pet = {"serviceKey": SERVICE_KEY, "MobileOS": "ETC", "MobileApp": "AppTest", "_type": "json"}

# # #     def extractor_pet(data):
# # #         try:
# # #             body = data["response"]["body"]
# # #             items = body["items"]["item"]
# # #             if isinstance(items, dict):
# # #                 items = [items]
# # #             return items, int(body["totalCount"])
# # #         except Exception:
# # #             return [], 0

# # #     raw_pet = fetch_all_pages(base_pet, params_pet, extractor_pet, "동반여행_동물정보")
# # #     rows_pet = []
# # #     for r in raw_pet:
# # #         rows_pet.append({
# # #             "ContentID": r.get("contentid", ""),
# # #             "PetTypeCode": r.get("acmpyTypeCd", ""),
# # #             "PetAllowedInfo": r.get("acmpyPsblCpam", ""),
# # #             "PetRequirement": r.get("acmpyNeedMtr", ""),
# # #             "SafetyNotice": r.get("relaAcdntRiskMtr", ""),
# # #             "PetFacility": r.get("relaPosesFclty", ""),
# # #             "PetSupplies": r.get("relaFrnshPrdlst", ""),
# # #             "PetPurchasable": r.get("relaPurcPrdlst", ""),
# # #             "PetRentable": r.get("relaRntlPrdlst", ""),
# # #             "EtcPetInfo": r.get("etcAcmpyInfo", ""),
# # #         })
# # #     save_csv("06_반려동물_동반여행_동물정보.csv",
# # #              ["ContentID","PetTypeCode","PetAllowedInfo","PetRequirement","SafetyNotice",
# # #               "PetFacility","PetSupplies","PetPurchasable","PetRentable","EtcPetInfo"], rows_pet)

# # #     # 07: 관광지 공통 정보
# # #     base_common = "https://apis.data.go.kr/B551011/KorPetTourService2/detailCommon2"
# # #     params_common = {"serviceKey": SERVICE_KEY, "MobileOS": "ETC", "MobileApp": "AppTest", "_type": "json",
# # #                      "defaultYN": "Y", "addrinfoYN": "Y", "mapinfoYN": "Y", "overviewYN": "Y"}

# # #     def extractor_common(data):
# # #         try:
# # #             body = data["response"]["body"]
# # #             items = body["items"]["item"]
# # #             if isinstance(items, dict):
# # #                 items = [items]
# # #             return items, int(body["totalCount"])
# # #         except Exception:
# # #             return [], 0

# # #     raw_common = fetch_all_pages(base_common, params_common, extractor_common, "동반여행_관광지공통")
# # #     rows_common = []
# # #     for r in raw_common:
# # #         rows_common.append({
# # #             "ContentID": r.get("contentid", ""),
# # #             "ContentTypeID": r.get("contenttypeid", ""),
# # #             "Title": r.get("title", ""),
# # #             "Category1": r.get("cat1", ""),
# # #             "Category2": r.get("cat2", ""),
# # #             "Category3": r.get("cat3", ""),
# # #             "LclsSystm1": r.get("lclsSystm1", ""),
# # #             "LclsSystm2": r.get("lclsSystm2", ""),
# # #             "LclsSystm3": r.get("lclsSystm3", ""),
# # #             "RoadAddress": r.get("addr1", ""),
# # #             "AddressDetail": r.get("addr2", ""),
# # #             "PostalCode": r.get("zipcode", ""),
# # #             "AreaCode": r.get("areacode", ""),
# # #             "SigunguCode": r.get("sigungucode", ""),
# # #             "LDongRegnCd": r.get("lDongRegnCd", ""),
# # #             "LDongSignguCd": r.get("lDongSignguCd", ""),
# # #             "lon": r.get("mapx", ""),
# # #             "lat": r.get("mapy", ""),
# # #             "MapLevel": r.get("mlevel", ""),
# # #             "PhoneNumber": r.get("tel", ""),
# # #             "ImageURL": r.get("firstimage", ""),
# # #             "ThumbnailURL": r.get("firstimage2", ""),
# # #             "CreatedTime": r.get("createdtime", ""),
# # #             "ModifiedTime": r.get("modifiedtime", ""),
# # #             "CopyrightCode": r.get("cpyrhtDivCd", ""),
# # #         })
# # #     save_csv("07_반려동물_동반여행_관광지공통정보.csv",
# # #              ["ContentID","ContentTypeID","Title","Category1","Category2","Category3","LclsSystm1",
# # #               "LclsSystm2","LclsSystm3","RoadAddress","AddressDetail","PostalCode","AreaCode",
# # #               "SigunguCode","LDongRegnCd","LDongSignguCd","lon","lat","MapLevel","PhoneNumber",
# # #               "ImageURL","ThumbnailURL","CreatedTime","ModifiedTime","CopyrightCode"], rows_common)


# # # # ════════════════════════════════════════════
# # # # 08. 구조동물 조회 (농림축산식품부)
# # # # ════════════════════════════════════════════
# # # def collect_구조동물():
# # #     print("▶ 08. 구조동물 조회 수집 중...")
# # #     base_url = "https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2"
# # #     today = datetime.today()
# # #     params = {
# # #         "serviceKey": SERVICE_KEY,
# # #         "bgnde": "20240101",
# # #         "endde": today.strftime("%Y%m%d"),
# # #         "_type": "json",
# # #     }

# # #     def extractor(data):
# # #         try:
# # #             body = data["response"]["body"]
# # #             items = body["items"]["item"]
# # #             if isinstance(items, dict):
# # #                 items = [items]
# # #             return items, int(body["totalCount"])
# # #         except Exception:
# # #             return [], 0

# # #     raw = fetch_all_pages(base_url, params, extractor, "구조동물")
# # #     rows = []
# # #     for r in raw:
# # #         rows.append({
# # #             "NoticeNo": r.get("noticeNo", ""),
# # #             "DesertionNo": r.get("desertionNo", ""),
# # #             "RfidCode": r.get("rfidCd", ""),
# # #             "HappenDate": r.get("happenDt", ""),
# # #             "HappenPlace": r.get("happenPlace", ""),
# # #             "UpKindCode": r.get("upKindCd", ""),
# # #             "UpKindName": r.get("upKindNm", ""),
# # #             "KindCode": r.get("kindCd", ""),
# # #             "KindName": r.get("kindNm", ""),
# # #             "KindFullName": r.get("kindFullNm", ""),
# # #             "ColorCode": r.get("colorCd", ""),
# # #             "Age": r.get("age", ""),
# # #             "Weight": r.get("weight", ""),
# # #             "SexCode": r.get("sexCd", ""),
# # #             "NeuterYn": r.get("neuterYn", ""),
# # #             "SpecialMark": r.get("specialMark", ""),
# # #             "ProcessState": r.get("processState", ""),
# # #             "NoticeSDate": r.get("noticeSdt", ""),
# # #             "NoticeEDate": r.get("noticeEdt", ""),
# # #             "EndReason": r.get("endReason", ""),
# # #             "Image1": r.get("popfile1", ""),
# # #             "Image2": r.get("popfile2", ""),
# # #             "Image3": r.get("popfile3", ""),
# # #             "Image4": r.get("popfile4", ""),
# # #             "Image5": r.get("popfile5", ""),
# # #             "Image6": r.get("popfile6", ""),
# # #             "Image7": r.get("popfile7", ""),
# # #             "Image8": r.get("popfile8", ""),
# # #             "VaccinationChk": r.get("vaccinationChk", ""),
# # #             "HealthChk": r.get("healthChk", ""),
# # #             "SfeHealth": r.get("sfeHealth", ""),
# # #             "SfeSoci": r.get("sfeSoci", ""),
# # #             "EtcBigo": r.get("etcBigo", ""),
# # #             "UpdateTime": r.get("updTm", ""),
# # #             "CareRegNo": r.get("careRegNo", ""),
# # #             "CareNm": r.get("careNm", ""),
# # #             "CareTel": r.get("careTel", ""),
# # #             "CareAddr": r.get("careAddr", ""),
# # #             "OrgNm": r.get("orgNm", ""),
# # #             "AdptnTitle": r.get("adptnTitle", ""),
# # #             "AdptnSDate": r.get("adptnSDate", ""),
# # #             "AdptnEDate": r.get("adptnEDate", ""),
# # #             "AdptnTxt": r.get("adptnTxt", ""),
# # #             "AdptnCondition": r.get("adptnConditionLimitTxt", ""),
# # #             "AdptnImg": r.get("adptnImg", ""),
# # #             "SprtTitle": r.get("sprtTitle", ""),
# # #             "SprtSDate": r.get("sprtSDate", ""),
# # #             "SprtEDate": r.get("sprtEDate", ""),
# # #             "SprtTxt": r.get("sprtTxt", ""),
# # #             "SrvcTitle": r.get("srvcTitle", ""),
# # #             "SrvcTxt": r.get("srvcTxt", ""),
# # #             "EvntTitle": r.get("evntTitle", ""),
# # #             "EvntTxt": r.get("evntTxt", ""),
# # #             "EvntImg": r.get("evntImg", ""),
# # #         })
# # #     save_csv("08_구조동물_조회데이터.csv",
# # #              ["NoticeNo","DesertionNo","RfidCode","HappenDate","HappenPlace","UpKindCode","UpKindName",
# # #               "KindCode","KindName","KindFullName","ColorCode","Age","Weight","SexCode","NeuterYn",
# # #               "SpecialMark","ProcessState","NoticeSDate","NoticeEDate","EndReason","Image1","Image2",
# # #               "Image3","Image4","Image5","Image6","Image7","Image8","VaccinationChk","HealthChk",
# # #               "SfeHealth","SfeSoci","EtcBigo","UpdateTime","CareRegNo","CareNm","CareTel","CareAddr",
# # #               "OrgNm","AdptnTitle","AdptnSDate","AdptnEDate","AdptnTxt","AdptnCondition","AdptnImg",
# # #               "SprtTitle","SprtSDate","SprtEDate","SprtTxt","SrvcTitle","SrvcTxt","EvntTitle","EvntTxt","EvntImg"], rows)


# # # # ════════════════════════════════════════════
# # # # 09. 분실동물 조회 (농림축산식품부)
# # # # ════════════════════════════════════════════
# # # def collect_분실동물():
# # #     print("▶ 09. 분실동물 조회 수집 중...")
# # #     base_url = "http://apis.data.go.kr/1543061/lossInfoService/lossInfo"
# # #     today = datetime.today()
# # #     params = {
# # #         "serviceKey": SERVICE_KEY,
# # #         "bgnde": "20240101",
# # #         "ended": today.strftime("%Y%m%d"),
# # #         "_type": "json",
# # #     }

# # #     def extractor(data):
# # #         try:
# # #             body = data["response"]["body"]
# # #             items = body["items"]["item"]
# # #             if isinstance(items, dict):
# # #                 items = [items]
# # #             return items, int(body["totalCount"])
# # #         except Exception:
# # #             return [], 0

# # #     raw = fetch_all_pages(base_url, params, extractor, "분실동물")
# # #     rows = []
# # #     for r in raw:
# # #         rows.append({
# # #             "RfidCode": r.get("rfidCd", ""),
# # #             "HappenDate": r.get("happenDt", ""),
# # #             "HappenAddr": r.get("happenAddr", ""),
# # #             "HappenAddrDtl": r.get("happenAddrDtl", ""),
# # #             "HappenPlace": r.get("happenPlace", ""),
# # #             "OrgNm": r.get("orgNm", ""),
# # #             "KindCode": r.get("kindCd", ""),
# # #             "ColorCode": r.get("colorCd", ""),
# # #             "SexCode": r.get("sexCd", ""),
# # #             "Age": r.get("age", ""),
# # #             "SpecialMark": r.get("specialMark", ""),
# # #             "Image": r.get("popfile", ""),
# # #             "CallName": r.get("callName", ""),
# # #             "CallTel": r.get("callTel", ""),
# # #         })
# # #     save_csv("09_분실동물_조회데이터.csv",
# # #              ["RfidCode","HappenDate","HappenAddr","HappenAddrDtl","HappenPlace","OrgNm",
# # #               "KindCode","ColorCode","SexCode","Age","SpecialMark","Image","CallName","CallTel"], rows)


# # # # ════════════════════════════════════════════
# # # # 10. 동물보호센터 정보 조회 (농림축산식품부)
# # # # ════════════════════════════════════════════
# # # def collect_동물보호센터():
# # #     print("▶ 10. 동물보호센터 정보 조회 수집 중...")
# # #     base_url = "http://apis.data.go.kr/1543061/shelterInfoService_v2/shelterInfo_v2"
# # #     params = {"serviceKey": SERVICE_KEY, "_type": "json"}

# # #     def extractor(data):
# # #         try:
# # #             body = data["response"]["body"]
# # #             items = body["items"]["item"]
# # #             if isinstance(items, dict):
# # #                 items = [items]
# # #             return items, int(body["totalCount"])
# # #         except Exception:
# # #             return [], 0

# # #     raw = fetch_all_pages(base_url, params, extractor, "동물보호센터")
# # #     rows = []
# # #     for r in raw:
# # #         rows.append({
# # #             "CareRegNo": r.get("careRegNo", ""),
# # #             "CareNm": r.get("careNm", ""),
# # #             "OrgNm": r.get("orgNm", ""),
# # #             "DivisionNm": r.get("divisionNm", ""),
# # #             "SaveTrgtAnimal": r.get("saveTrgtAnimal", ""),
# # #             "CareTel": r.get("careTel", ""),
# # #             "DataStdDt": r.get("dataStdDt", ""),
# # #             "DsignationDate": r.get("dsignationDate", ""),
# # #             "CareAddr": r.get("careAddr", ""),
# # #             "JibunAddr": r.get("jibunAddr", ""),
# # #             "lat": r.get("lat", ""),
# # #             "lng": r.get("lng", ""),
# # #             "WeekOprStime": r.get("weekOprStime", ""),
# # #             "WeekOprEtime": r.get("weekOprEtime", ""),
# # #             "WeekCellStime": r.get("weekCellStime", ""),
# # #             "WeekCellEtime": r.get("weekCellEtime", ""),
# # #             "WeekendOprStime": r.get("weekendOprStime", ""),
# # #             "WeekendOprEtime": r.get("weekendOprEtime", ""),
# # #             "WeekendCellStime": r.get("weekendCellStime", ""),
# # #             "WeekendCellEtime": r.get("weekendCellEtime", ""),
# # #             "CloseDay": r.get("closeDay", ""),
# # #             "VetPersonCnt": r.get("vetPersonCnt", ""),
# # #             "SpecsPersonCnt": r.get("specsPersonCnt", ""),
# # #             "MedicalCnt": r.get("medicalCnt", ""),
# # #             "BreedCnt": r.get("breedCnt", ""),
# # #             "QuarantineCnt": r.get("quarabtineCnt", ""),
# # #             "FeedCnt": r.get("feedCnt", ""),
# # #             "TransCarCnt": r.get("transCarCnt", ""),
# # #         })
# # #     save_csv("10_동물보호센터_조회데이터.csv",
# # #              ["CareRegNo","CareNm","OrgNm","DivisionNm","SaveTrgtAnimal","CareTel","DataStdDt",
# # #               "DsignationDate","CareAddr","JibunAddr","lat","lng","WeekOprStime","WeekOprEtime",
# # #               "WeekCellStime","WeekCellEtime","WeekendOprStime","WeekendOprEtime","WeekendCellStime",
# # #               "WeekendCellEtime","CloseDay","VetPersonCnt","SpecsPersonCnt","MedicalCnt","BreedCnt",
# # #               "QuarantineCnt","FeedCnt","TransCarCnt"], rows)


# # # # ════════════════════════════════════════════
# # # # 11. 반려동물 동반 가능 문화시설 (한국문화정보원)
# # # # ════════════════════════════════════════════
# # # def collect_문화시설():
# # #     print("▶ 11. 반려동물 동반 가능 문화시설 수집 중...")
# # #     base_url = "https://api.odcloud.kr/api/15111389/v1/uddi:28a35fe8-b523-4b7f-b976-4e39dfdb04f5"
# # #     params = {"serviceKey": SERVICE_KEY, "page": 1, "perPage": NUM_OF_ROWS}

# # #     all_items = []
# # #     page = 1
# # #     while True:
# # #         params["page"] = page
# # #         try:
# # #             res = requests.get(base_url, params=params, headers=HEADERS, timeout=30)
# # #             res.raise_for_status()
# # #             data = res.json()
# # #         except Exception as e:
# # #             print(f"  ❌ [문화시설] 오류: {e}")
# # #             break

# # #         items = data.get("data", [])
# # #         total = data.get("totalCount", 0)
# # #         if not items:
# # #             break
# # #         all_items.extend(items)
# # #         print(f"  📄 [문화시설] 페이지 {page} - {len(items)}건 (누적: {len(all_items)}/{total})")
# # #         if len(all_items) >= total:
# # #             break
# # #         page += 1
# # #         time.sleep(DELAY)

# # #     rows = []
# # #     for r in all_items:
# # #         rows.append({
# # #             "Name": r.get("시설명", ""),
# # #             "Facility_ID": r.get("시설명", ""),  # 고유 ID 없어 시설명 대체
# # #             "Category": f"{r.get('카테고리1','')} > {r.get('카테고리2','')} > {r.get('카테고리3','')}".strip(" >"),
# # #             "Sido": r.get("시도 명칭", ""),
# # #             "Sigungu": r.get("시군구 명칭", ""),
# # #             "Dong": r.get("법정읍면동명칭", ""),
# # #             "LotNumber": r.get("번지", ""),
# # #             "RoadAddress": r.get("도로명주소", ""),
# # #             "PostalCode": r.get("우편번호", ""),
# # #             "lat": r.get("위도", ""),
# # #             "lon": r.get("경도", ""),
# # #             "PhoneNumber": r.get("전화번호", ""),
# # #             "OpeningHours": r.get("운영시간", ""),
# # #             "CloseDay": r.get("휴무일", ""),
# # #             "PetAllowedInfo": r.get("반려동물 동반 가능정보", ""),
# # #             "PetRestriction": r.get("반려동물 제한사항", ""),
# # #             "PetSize": r.get("입장 가능 동물 크기", ""),
# # #             "LastUpdated": r.get("최종작성일", ""),
# # #         })
# # #     save_csv("11_반려동물동반가능_문화시설.csv",
# # #              ["Name","Facility_ID","Category","Sido","Sigungu","Dong","LotNumber","RoadAddress",
# # #               "PostalCode","lat","lon","PhoneNumber","OpeningHours","CloseDay",
# # #               "PetAllowedInfo","PetRestriction","PetSize","LastUpdated"], rows)


# # # # ════════════════════════════════════════════
# # # # 12. 휴게소 반려동물 놀이터 (한국도로공사)
# # # # ════════════════════════════════════════════
# # # def collect_휴게소놀이터():
# # #     print("▶ 12. 휴게소 반려동물 놀이터 수집 중...")
# # #     base_url = "https://api.odcloud.kr/api/15064250/v1/uddi:48f77b64-9bdc-4f37-b7db-35e1e2e4f3ce"
# # #     params = {"serviceKey": SERVICE_KEY, "page": 1, "perPage": NUM_OF_ROWS}

# # #     all_items = []
# # #     page = 1
# # #     while True:
# # #         params["page"] = page
# # #         try:
# # #             res = requests.get(base_url, params=params, headers=HEADERS, timeout=30)
# # #             res.raise_for_status()
# # #             data = res.json()
# # #         except Exception as e:
# # #             print(f"  ❌ [휴게소] 오류: {e}")
# # #             break

# # #         items = data.get("data", [])
# # #         total = data.get("totalCount", 0)
# # #         if not items:
# # #             break
# # #         all_items.extend(items)
# # #         print(f"  📄 [휴게소] 페이지 {page} - {len(items)}건 (누적: {len(all_items)}/{total})")
# # #         if len(all_items) >= total:
# # #             break
# # #         page += 1
# # #         time.sleep(DELAY)

# # #     rows = []
# # #     for r in all_items:
# # #         rows.append({
# # #             "Name": r.get("휴게소명", ""),
# # #             "FacilityType": r.get("종류", ""),
# # #             "Location": r.get("위치", ""),
# # #             "OpeningHours": r.get("운영시간", ""),
# # #             "CloseDay": r.get("휴장일", ""),
# # #             "EstablishedYear": r.get("설치연도", ""),
# # #             "Remark": r.get("비고", ""),
# # #         })
# # #     save_csv("12_휴게소_반려동물놀이터.csv",
# # #              ["Name","FacilityType","Location","OpeningHours","CloseDay","EstablishedYear","Remark"], rows)


# # # # ════════════════════════════════════════════
# # # # 13. 동물질병증상 데이터 (한국과학기술정보연구원)
# # # # ════════════════════════════════════════════
# # # def collect_질병증상():
# # #     print("▶ 13. 동물질병증상 데이터 수집 중...")
# # #     base_url = "https://api.odcloud.kr/api/15050441/v1/uddi:cc7486db-c496-4497-8ade-e75a7b463406"
# # #     params = {"serviceKey": SERVICE_KEY, "page": 1, "perPage": NUM_OF_ROWS}

# # #     all_items = []
# # #     page = 1
# # #     while True:
# # #         params["page"] = page
# # #         try:
# # #             res = requests.get(base_url, params=params, headers=HEADERS, timeout=30)
# # #             res.raise_for_status()
# # #             data = res.json()
# # #         except Exception as e:
# # #             print(f"  ❌ [질병증상] 오류: {e}")
# # #             break

# # #         items = data.get("data", [])
# # #         total = data.get("totalCount", 0)
# # #         if not items:
# # #             break
# # #         all_items.extend(items)
# # #         print(f"  📄 [질병증상] 페이지 {page} - {len(items)}건 (누적: {len(all_items)}/{total})")
# # #         if len(all_items) >= total:
# # #             break
# # #         page += 1
# # #         time.sleep(DELAY)

# # #     rows = []
# # #     for r in all_items:
# # #         rows.append({
# # #             "SymptomCode": r.get("증상코드", ""),
# # #             "CategoryKo": r.get("증상분류 한글", ""),
# # #             "CategoryEn": r.get("증상분류 영어", ""),
# # #             "SymptomListCode": r.get("증상목록코드", ""),
# # #             "SymptomName": r.get("증상명", ""),
# # #         })
# # #     save_csv("13_동물질병증상_데이터.csv",
# # #              ["SymptomCode","CategoryKo","CategoryEn","SymptomListCode","SymptomName"], rows)


# # # # ════════════════════════════════════════════
# # # # 실행
# # # # ════════════════════════════════════════════
# # # if __name__ == "__main__":
# # #     print(f"\n{'='*60}")
# # #     print(f"  반려동물 공공데이터 API 수집 시작")
# # #     print(f"  저장 위치: {os.path.abspath(OUTPUT_DIR)}")
# # #     print(f"{'='*60}\n")

# # #     collect_동물병원()
# # #     collect_동물약국()
# # #     collect_동물미용업()
# # #     collect_동물위탁관리업()
# # #     collect_동물장묘업()
# # #     collect_반려동물동반여행()
# # #     collect_구조동물()
# # #     collect_분실동물()
# # #     collect_동물보호센터()
# # #     collect_문화시설()
# # #     collect_휴게소놀이터()
# # #     collect_질병증상()

# # #     print(f"\n{'='*60}")
# # #     print("  ✅ 전체 수집 완료!")
# # #     print(f"  📁 저장된 파일 목록:")
# # #     for f in sorted(os.listdir(OUTPUT_DIR)):
# # #         if f.endswith(".csv"):
# # #             size = os.path.getsize(os.path.join(OUTPUT_DIR, f))
# # #             print(f"    {f}  ({size:,} bytes)")
# # #     print(f"{'='*60}\n")

# # #---------------------------------
# # """
# # 오류난 API 재수집 스크립트
# # 대상:
# #   - 06_반려동물_동반여행_동물정보
# #   - 07_반려동물_동반여행_관광지공통정보
# #   - 11_반려동물동반가능_문화시설
# #   - 12_휴게소_반려동물놀이터

# # 실행 방법: python 재수집_오류API_스크립트.py
# # 필요 패키지: pip install requests
# # """

# # import requests
# # import csv
# # import time
# # import os

# # SERVICE_KEY = "96ed67423c666f7e208f748b1ea6e32e4a4fe9ff6417187340ceeb7e1fb3a7b8"
# # OUTPUT_DIR = "./공공데이터_CSV"
# # os.makedirs(OUTPUT_DIR, exist_ok=True)

# # DELAY = 0.3


# # def save_csv(filename, fieldnames, rows):
# #     path = os.path.join(OUTPUT_DIR, filename)
# #     with open(path, "w", newline="", encoding="utf-8-sig") as f:
# #         writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
# #         writer.writeheader()
# #         writer.writerows(rows)
# #     print(f"  ✅ 저장 완료: {filename} ({len(rows)}건)\n")


# # # ════════════════════════════════════════════
# # # 06 + 07. 반려동물 동반여행 서비스 (한국관광공사)
# # # 문제 원인: contentId 없이 detailPetTour2 직접 호출 불가
# # # 해결: ① areaBasedList2로 전체 contentId 수집
# # #       ② contentId별로 detailPetTour2 + detailCommon2 호출
# # # ════════════════════════════════════════════
# # def collect_반려동물동반여행():
# #     print("▶ 06+07. 반려동물 동반여행 서비스 수집 중...")
# #     BASE = "https://apis.data.go.kr/B551011/KorPetTourService2"
# #     COMMON_PARAMS = {
# #         "serviceKey": SERVICE_KEY,
# #         "MobileOS": "ETC",
# #         "MobileApp": "AnimalLoo",
# #         "_type": "json",
# #         "numOfRows": 100,
# #     }

# #     # ── STEP 1: petTourSyncList2로 반려동물 동반 가능 contentId 전체 수집 ──
# #     print("  [STEP 1] 반려동물 동반 콘텐츠 목록 수집...")
# #     content_ids = []
# #     page = 1
# #     total = None

# #     while True:
# #         params = {**COMMON_PARAMS, "pageNo": page}
# #         try:
# #             res = requests.get(f"{BASE}/petTourSyncList2", params=params, timeout=30)
# #             res.raise_for_status()
# #             data = res.json()
# #             body = data["response"]["body"]
# #             items = body.get("items", {})

# #             if not items or items == "":
# #                 print(f"  ⚠️  petTourSyncList2 응답 없음 → areaBasedList2로 대체 시도")
# #                 break

# #             item_list = items.get("item", [])
# #             if isinstance(item_list, dict):
# #                 item_list = [item_list]
# #             if not item_list:
# #                 break

# #             for it in item_list:
# #                 cid = it.get("contentid") or it.get("contentId")
# #                 if cid:
# #                     content_ids.append(str(cid))

# #             if total is None:
# #                 total = int(body.get("totalCount", 0))
# #             print(f"    페이지 {page}: {len(item_list)}건 (누적 {len(content_ids)}/{total})")

# #             if len(content_ids) >= total:
# #                 break
# #             page += 1
# #             time.sleep(DELAY)

# #         except Exception as e:
# #             print(f"  ⚠️  petTourSyncList2 오류: {e} → areaBasedList2로 대체")
# #             content_ids = []
# #             break

# #     # petTourSyncList2 실패 시 areaBasedList2로 대체
# #     if not content_ids:
# #         print("  [STEP 1-B] areaBasedList2로 전체 목록 수집...")
# #         page = 1
# #         total = None
# #         while True:
# #             params = {**COMMON_PARAMS, "pageNo": page, "listYN": "Y", "arrange": "A"}
# #             try:
# #                 res = requests.get(f"{BASE}/areaBasedList2", params=params, timeout=30)
# #                 res.raise_for_status()
# #                 data = res.json()
# #                 body = data["response"]["body"]
# #                 items = body.get("items", {})

# #                 if not items or items == "":
# #                     break

# #                 item_list = items.get("item", [])
# #                 if isinstance(item_list, dict):
# #                     item_list = [item_list]
# #                 if not item_list:
# #                     break

# #                 for it in item_list:
# #                     cid = it.get("contentid") or it.get("contentId")
# #                     if cid:
# #                         content_ids.append(str(cid))

# #                 if total is None:
# #                     total = int(body.get("totalCount", 0))
# #                 print(f"    페이지 {page}: {len(item_list)}건 (누적 {len(content_ids)}/{total})")

# #                 if len(content_ids) >= total:
# #                     break
# #                 page += 1
# #                 time.sleep(DELAY)

# #             except Exception as e:
# #                 print(f"  ❌ areaBasedList2 오류: {e}")
# #                 break

# #     content_ids = list(dict.fromkeys(content_ids))  # 중복 제거
# #     print(f"  → 총 {len(content_ids)}개 contentId 확보\n")

# #     # ── STEP 2: contentId별 반려동물 상세 + 공통 정보 수집 ──
# #     print(f"  [STEP 2] contentId별 상세 정보 수집 (총 {len(content_ids)}건)...")

# #     rows_pet = []
# #     rows_common = []

# #     for i, cid in enumerate(content_ids, 1):
# #         if i % 100 == 0:
# #             print(f"    {i}/{len(content_ids)} 처리 중...")

# #         # detailPetTour2
# #         try:
# #             res = requests.get(
# #                 f"{BASE}/detailPetTour2",
# #                 params={**COMMON_PARAMS, "contentId": cid},
# #                 timeout=15,
# #             )
# #             res.raise_for_status()
# #             data = res.json()
# #             item = data["response"]["body"].get("items", {})
# #             if item and item != "":
# #                 r = item.get("item", {})
# #                 if isinstance(r, list):
# #                     r = r[0]
# #                 rows_pet.append({
# #                     "ContentID":      r.get("contentid", cid),
# #                     "PetTypeCode":    r.get("acmpyTypeCd", ""),
# #                     "PetAllowedInfo": r.get("acmpyPsblCpam", ""),
# #                     "PetRequirement": r.get("acmpyNeedMtr", ""),
# #                     "SafetyNotice":   r.get("relaAcdntRiskMtr", ""),
# #                     "PetFacility":    r.get("relaPosesFclty", ""),
# #                     "PetSupplies":    r.get("relaFrnshPrdlst", ""),
# #                     "PetPurchasable": r.get("relaPurcPrdlst", ""),
# #                     "PetRentable":    r.get("relaRntlPrdlst", ""),
# #                     "EtcPetInfo":     r.get("etcAcmpyInfo", ""),
# #                 })
# #         except Exception:
# #             pass

# #         # detailCommon2
# #         try:
# #             res = requests.get(
# #                 f"{BASE}/detailCommon2",
# #                 params={
# #                     **COMMON_PARAMS,
# #                     "contentId": cid,
# #                     "defaultYN": "Y",
# #                     "addrinfoYN": "Y",
# #                     "mapinfoYN": "Y",
# #                     "overviewYN": "N",
# #                 },
# #                 timeout=15,
# #             )
# #             res.raise_for_status()
# #             data = res.json()
# #             item = data["response"]["body"].get("items", {})
# #             if item and item != "":
# #                 r = item.get("item", {})
# #                 if isinstance(r, list):
# #                     r = r[0]
# #                 rows_common.append({
# #                     "ContentID":      r.get("contentid", cid),
# #                     "ContentTypeID":  r.get("contenttypeid", ""),
# #                     "Title":          r.get("title", ""),
# #                     "Category1":      r.get("cat1", ""),
# #                     "Category2":      r.get("cat2", ""),
# #                     "Category3":      r.get("cat3", ""),
# #                     "LclsSystm1":     r.get("lclsSystm1", ""),
# #                     "LclsSystm2":     r.get("lclsSystm2", ""),
# #                     "LclsSystm3":     r.get("lclsSystm3", ""),
# #                     "RoadAddress":    r.get("addr1", ""),
# #                     "AddressDetail":  r.get("addr2", ""),
# #                     "PostalCode":     r.get("zipcode", ""),
# #                     "AreaCode":       r.get("areacode", ""),
# #                     "SigunguCode":    r.get("sigungucode", ""),
# #                     "LDongRegnCd":    r.get("lDongRegnCd", ""),
# #                     "LDongSignguCd":  r.get("lDongSignguCd", ""),
# #                     "lon":            r.get("mapx", ""),
# #                     "lat":            r.get("mapy", ""),
# #                     "MapLevel":       r.get("mlevel", ""),
# #                     "PhoneNumber":    r.get("tel", ""),
# #                     "ImageURL":       r.get("firstimage", ""),
# #                     "ThumbnailURL":   r.get("firstimage2", ""),
# #                     "CreatedTime":    r.get("createdtime", ""),
# #                     "ModifiedTime":   r.get("modifiedtime", ""),
# #                     "CopyrightCode":  r.get("cpyrhtDivCd", ""),
# #                 })
# #         except Exception:
# #             pass

# #         time.sleep(DELAY)

# #     save_csv("06_반려동물_동반여행_동물정보.csv",
# #              ["ContentID","PetTypeCode","PetAllowedInfo","PetRequirement","SafetyNotice",
# #               "PetFacility","PetSupplies","PetPurchasable","PetRentable","EtcPetInfo"],
# #              rows_pet)

# #     save_csv("07_반려동물_동반여행_관광지공통정보.csv",
# #              ["ContentID","ContentTypeID","Title","Category1","Category2","Category3",
# #               "LclsSystm1","LclsSystm2","LclsSystm3","RoadAddress","AddressDetail",
# #               "PostalCode","AreaCode","SigunguCode","LDongRegnCd","LDongSignguCd",
# #               "lon","lat","MapLevel","PhoneNumber","ImageURL","ThumbnailURL",
# #               "CreatedTime","ModifiedTime","CopyrightCode"],
# #              rows_common)


# # # ════════════════════════════════════════════
# # # 11. 반려동물 동반 가능 문화시설 (한국문화정보원)
# # # 문제 원인: 파일 다운로드 방식 — API JSON 응답에 data[] 없음
# # # 해결: CSV 파일을 직접 다운로드하여 파싱
# # # ════════════════════════════════════════════
# # def collect_문화시설():
# #     print("▶ 11. 반려동물 동반 가능 문화시설 수집 중...")

# #     # 방법 A: 오픈API (odcloud) 시도
# #     base_url = "https://api.odcloud.kr/api/15111389/v1/uddi:28a35fe8-b523-4b7f-b976-4e39dfdb04f5"
# #     all_items = []
# #     page = 1

# #     while True:
# #         params = {
# #             "serviceKey": SERVICE_KEY,
# #             "page": page,
# #             "perPage": 1000,
# #             "returnType": "json",
# #         }
# #         try:
# #             res = requests.get(base_url, params=params, timeout=30)
# #             res.raise_for_status()
# #             data = res.json()
# #             items = data.get("data", [])
# #             total = data.get("totalCount", 0)

# #             if not items:
# #                 if page == 1:
# #                     print("  ⚠️  odcloud API 응답 없음 → CSV 직접 다운로드 시도")
# #                     collect_문화시설_csv_fallback()
# #                     return
# #                 break

# #             all_items.extend(items)
# #             print(f"  📄 페이지 {page}: {len(items)}건 (누적 {len(all_items)}/{total})")

# #             if len(all_items) >= total:
# #                 break
# #             page += 1
# #             time.sleep(DELAY)

# #         except Exception as e:
# #             print(f"  ⚠️  odcloud API 오류: {e} → CSV 직접 다운로드 시도")
# #             collect_문화시설_csv_fallback()
# #             return

# #     rows = []
# #     for r in all_items:
# #         rows.append({
# #             "Name":           r.get("시설명", ""),
# #             "Category":       f"{r.get('카테고리1','')} > {r.get('카테고리2','')} > {r.get('카테고리3','')}".strip(" >"),
# #             "Sido":           r.get("시도 명칭", ""),
# #             "Sigungu":        r.get("시군구 명칭", ""),
# #             "Dong":           r.get("법정읍면동명칭", ""),
# #             "LotNumber":      r.get("번지", ""),
# #             "RoadAddress":    r.get("도로명주소", ""),
# #             "PostalCode":     r.get("우편번호", ""),
# #             "lat":            r.get("위도", ""),
# #             "lon":            r.get("경도", ""),
# #             "PhoneNumber":    r.get("전화번호", ""),
# #             "OpeningHours":   r.get("운영시간", ""),
# #             "CloseDay":       r.get("휴무일", ""),
# #             "PetAllowedInfo": r.get("반려동물 동반 가능정보", ""),
# #             "PetOnlyInfo":    r.get("반려동물 전용 정보", ""),
# #             "PetSizeLimit":   r.get("입장 가능 동물 크기", ""),
# #             "PetRestriction": r.get("반려동물 제한사항", ""),
# #             "IndoorYn":       r.get("장소(실내) 여부", ""),
# #             "OutdoorYn":      r.get("장소(실외)여부", ""),
# #             "PetExtraFee":    r.get("애견 동반 추가 요금", ""),
# #             "LastUpdated":    r.get("최종작성일", ""),
# #         })

# #     save_csv("11_반려동물동반가능_문화시설.csv",
# #              ["Name","Category","Sido","Sigungu","Dong","LotNumber","RoadAddress","PostalCode",
# #               "lat","lon","PhoneNumber","OpeningHours","CloseDay","PetAllowedInfo","PetOnlyInfo",
# #               "PetSizeLimit","PetRestriction","IndoorYn","OutdoorYn","PetExtraFee","LastUpdated"],
# #              rows)


# # def collect_문화시설_csv_fallback():
# #     """공공데이터포털 CSV 직접 다운로드 (API 실패 시 대체)"""
# #     print("  [Fallback] 공공데이터포털 CSV 직접 다운로드 시도...")

# #     # 공공데이터포털 CSV 다운로드 URL (15111389)
# #     download_url = (
# #         "https://api.odcloud.kr/api/15111389/v1/uddi:28a35fe8-b523-4b7f-b976-4e39dfdb04f5"
# #         f"?serviceKey={SERVICE_KEY}&page=1&perPage=1&returnType=csv"
# #     )
# #     try:
# #         res = requests.get(download_url, timeout=60)
# #         res.raise_for_status()

# #         # CSV 파싱
# #         import io
# #         content = res.content.decode("utf-8-sig", errors="replace")
# #         reader = csv.DictReader(io.StringIO(content))
# #         rows = []
# #         for r in reader:
# #             rows.append({
# #                 "Name":           r.get("시설명", ""),
# #                 "Category":       f"{r.get('카테고리1','')} > {r.get('카테고리2','')} > {r.get('카테고리3','')}".strip(" >"),
# #                 "Sido":           r.get("시도 명칭", ""),
# #                 "Sigungu":        r.get("시군구 명칭", ""),
# #                 "Dong":           r.get("법정읍면동명칭", ""),
# #                 "RoadAddress":    r.get("도로명주소", ""),
# #                 "PostalCode":     r.get("우편번호", ""),
# #                 "lat":            r.get("위도", ""),
# #                 "lon":            r.get("경도", ""),
# #                 "PhoneNumber":    r.get("전화번호", ""),
# #                 "OpeningHours":   r.get("운영시간", ""),
# #                 "CloseDay":       r.get("휴무일", ""),
# #                 "PetAllowedInfo": r.get("반려동물 동반 가능정보", ""),
# #                 "PetOnlyInfo":    r.get("반려동물 전용 정보", ""),
# #                 "PetSizeLimit":   r.get("입장 가능 동물 크기", ""),
# #                 "PetRestriction": r.get("반려동물 제한사항", ""),
# #                 "IndoorYn":       r.get("장소(실내) 여부", ""),
# #                 "OutdoorYn":      r.get("장소(실외)여부", ""),
# #                 "PetExtraFee":    r.get("애견 동반 추가 요금", ""),
# #                 "LastUpdated":    r.get("최종작성일", ""),
# #             })

# #         if rows:
# #             save_csv("11_반려동물동반가능_문화시설.csv",
# #                      ["Name","Category","Sido","Sigungu","Dong","RoadAddress","PostalCode",
# #                       "lat","lon","PhoneNumber","OpeningHours","CloseDay","PetAllowedInfo",
# #                       "PetOnlyInfo","PetSizeLimit","PetRestriction","IndoorYn","OutdoorYn",
# #                       "PetExtraFee","LastUpdated"],
# #                      rows)
# #         else:
# #             print("  ❌ CSV fallback도 데이터 없음")
# #             print("  ➡️  수동 다운로드 필요:")
# #             print("     https://www.data.go.kr/data/15111389/fileData.do")
# #             print("     → '전국_반려동물_동반_가능_문화시설_위치_데이터.csv' 다운로드")
# #             print(f"     → {OUTPUT_DIR}/ 폴더에 '11_반려동물동반가능_문화시설.csv'로 저장\n")

# #     except Exception as e:
# #         print(f"  ❌ CSV fallback 오류: {e}")
# #         print("  ➡️  수동 다운로드 필요:")
# #         print("     https://www.data.go.kr/data/15111389/fileData.do")
# #         print("     → '전국_반려동물_동반_가능_문화시설_위치_데이터.csv' 다운로드")
# #         print(f"     → {OUTPUT_DIR}/ 폴더에 '11_반려동물동반가능_문화시설.csv'로 저장\n")


# # # ════════════════════════════════════════════
# # # 12. 휴게소 반려동물 놀이터 (한국도로공사)
# # # 문제 원인: UUID 오류
# # #   ❌ 구: uddi:48f77b64-9bdc-4f37-b7db-35e1e2e4f3ce
# # #   ✅ 신: uddi:d83eaf9c-67dc-4f83-8021-ed01a5bc67b9
# # # ════════════════════════════════════════════
# # def collect_휴게소놀이터():
# #     print("▶ 12. 휴게소 반려동물 놀이터 수집 중...")

# #     # ✅ 수정된 UUID
# #     base_url = "https://api.odcloud.kr/api/15064250/v1/uddi:d83eaf9c-67dc-4f83-8021-ed01a5bc67b9"
# #     all_items = []
# #     page = 1

# #     while True:
# #         params = {
# #             "serviceKey": SERVICE_KEY,
# #             "page": page,
# #             "perPage": 1000,
# #             "returnType": "json",
# #         }
# #         try:
# #             res = requests.get(base_url, params=params, timeout=30)
# #             res.raise_for_status()
# #             data = res.json()
# #             items = data.get("data", [])
# #             total = data.get("totalCount", 0)

# #             if not items:
# #                 break

# #             all_items.extend(items)
# #             print(f"  📄 페이지 {page}: {len(items)}건 (누적 {len(all_items)}/{total})")

# #             if len(all_items) >= total:
# #                 break
# #             page += 1
# #             time.sleep(DELAY)

# #         except Exception as e:
# #             print(f"  ❌ [휴게소놀이터] 오류: {e}")
# #             break

# #     rows = []
# #     for r in all_items:
# #         rows.append({
# #             "Name":            r.get("휴게소명", ""),
# #             "FacilityType":    r.get("종류", ""),
# #             "Location":        r.get("위치", ""),
# #             "OpeningHours":    r.get("운영시간", ""),
# #             "CloseDay":        r.get("휴장일", ""),
# #             "EstablishedYear": r.get("설치연도", ""),
# #             "Remark":          r.get("비고", ""),
# #         })

# #     save_csv("12_휴게소_반려동물놀이터.csv",
# #              ["Name","FacilityType","Location","OpeningHours","CloseDay","EstablishedYear","Remark"],
# #              rows)


# # # ════════════════════════════════════════════
# # # 실행
# # # ════════════════════════════════════════════
# # if __name__ == "__main__":
# #     print(f"\n{'='*60}")
# #     print("  오류 API 재수집 시작")
# #     print(f"  저장 위치: {os.path.abspath(OUTPUT_DIR)}")
# #     print(f"{'='*60}\n")

# #     collect_반려동물동반여행()   # 06, 07
# #     collect_문화시설()           # 11
# #     collect_휴게소놀이터()       # 12

# #     print(f"\n{'='*60}")
# #     print("  ✅ 재수집 완료!")
# #     print(f"  📁 결과 파일:")
# #     targets = [
# #         "06_반려동물_동반여행_동물정보.csv",
# #         "07_반려동물_동반여행_관광지공통정보.csv",
# #         "11_반려동물동반가능_문화시설.csv",
# #         "12_휴게소_반려동물놀이터.csv",
# #     ]
# #     for fname in targets:
# #         path = os.path.join(OUTPUT_DIR, fname)
# #         if os.path.exists(path):
# #             size = os.path.getsize(path)
# #             rows = sum(1 for _ in open(path, encoding="utf-8-sig")) - 1
# #             print(f"    ✅ {fname}  ({rows}건, {size:,} bytes)")
# #         else:
# #             print(f"    ❌ {fname}  (미생성)")
# #     print(f"{'='*60}\n")

# """
# 07번 관광지공통정보 재수집
# 핵심 수정: serviceKey를 params 아닌 URL에 직접 삽입 (이중인코딩 방지)

# 실행: python 07_관광지공통정보_재수집.py
# """

# import requests
# import csv
# import time
# import os
# from urllib.parse import urlencode

# SERVICE_KEY = "96ed67423c666f7e208f748b1ea6e32e4a4fe9ff6417187340ceeb7e1fb3a7b8"
# OUTPUT_DIR  = "./공공데이터_CSV"
# os.makedirs(OUTPUT_DIR, exist_ok=True)

# BASE    = "https://apis.data.go.kr/B551011/KorPetTourService2"
# DELAY   = 0.3

# def get(endpoint, extra_params):
#     """serviceKey를 URL에 직접 붙여서 이중인코딩 방지"""
#     base_params = {
#         "MobileOS":  "ETC",
#         "MobileApp": "AnimalLoo",
#         "_type":     "json",
#         "numOfRows": 100,
#     }
#     query = urlencode({**base_params, **extra_params})
#     url   = f"{BASE}/{endpoint}?serviceKey={SERVICE_KEY}&{query}"
#     res   = requests.get(url, timeout=30)
#     res.raise_for_status()
#     return res.json()


# def save_csv(filename, fieldnames, rows):
#     path = os.path.join(OUTPUT_DIR, filename)
#     with open(path, "w", newline="", encoding="utf-8-sig") as f:
#         writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
#         writer.writeheader()
#         writer.writerows(rows)
#     print(f"✅ 저장 완료: {filename} ({len(rows):,}건)")


# # ── STEP 1: 전체 contentId 수집 ──
# print("▶ STEP 1. contentId 목록 수집 (areaBasedList2)...")
# content_ids = []
# page  = 1
# total = None

# while True:
#     try:
#         data = get("areaBasedList2", {"pageNo": page, "listYN": "Y", "arrange": "A"})
#         body      = data["response"]["body"]
#         items_raw = body.get("items") or {}
#         item_list = items_raw.get("item", [])
#         if isinstance(item_list, dict):
#             item_list = [item_list]

#         if total is None:
#             total = int(body.get("totalCount", 0))
#             print(f"  총 {total:,}건")

#         if not item_list:
#             print("  더 이상 데이터 없음")
#             break

#         for it in item_list:
#             cid = str(it.get("contentid", ""))
#             if cid:
#                 content_ids.append(cid)

#         print(f"  페이지 {page}: {len(item_list)}건 (누적 {len(content_ids):,}/{total:,})")

#         if len(content_ids) >= total:
#             break
#         page += 1
#         time.sleep(DELAY)

#     except Exception as e:
#         print(f"  ❌ 목록 오류 (페이지 {page}): {e}")
#         # 응답 내용 출력해서 진단
#         try:
#             url = f"{BASE}/areaBasedList2?serviceKey={SERVICE_KEY}&MobileOS=ETC&MobileApp=AnimalLoo&_type=json&numOfRows=10&pageNo=1&listYN=Y&arrange=A"
#             r = requests.get(url, timeout=30)
#             print(f"  HTTP 상태: {r.status_code}")
#             print(f"  응답 앞부분: {r.text[:300]}")
#         except Exception as e2:
#             print(f"  진단 실패: {e2}")
#         break

# content_ids = list(dict.fromkeys(content_ids))
# print(f"\n→ contentId {len(content_ids):,}개 확보\n")

# if not content_ids:
#     print("❌ contentId 수집 실패. 아래 URL을 브라우저에서 직접 열어 응답 확인:")
#     print(f"  {BASE}/areaBasedList2?serviceKey={SERVICE_KEY}&MobileOS=ETC&MobileApp=AnimalLoo&_type=json&numOfRows=10&pageNo=1&listYN=Y&arrange=A")
#     exit()

# # ── STEP 2: contentId별 detailCommon2 수집 ──
# print(f"▶ STEP 2. 공통정보 수집 ({len(content_ids):,}건)...")
# rows = []

# for i, cid in enumerate(content_ids, 1):
#     if i % 200 == 0 or i == 1:
#         print(f"  {i:,}/{len(content_ids):,} 처리 중...")
#     try:
#         data = get("detailCommon2", {
#             "contentId":  cid,
#             "defaultYN":  "Y",
#             "addrinfoYN": "Y",
#             "mapinfoYN":  "Y",
#             "overviewYN": "N",
#         })
#         item = (data["response"]["body"].get("items") or {}).get("item", {})
#         if isinstance(item, list):
#             item = item[0] if item else {}
#         if item:
#             rows.append({
#                 "ContentID":     item.get("contentid", cid),
#                 "ContentTypeID": item.get("contenttypeid", ""),
#                 "Title":         item.get("title", ""),
#                 "Category1":     item.get("cat1", ""),
#                 "Category2":     item.get("cat2", ""),
#                 "Category3":     item.get("cat3", ""),
#                 "LclsSystm1":    item.get("lclsSystm1", ""),
#                 "LclsSystm2":    item.get("lclsSystm2", ""),
#                 "LclsSystm3":    item.get("lclsSystm3", ""),
#                 "RoadAddress":   item.get("addr1", ""),
#                 "AddressDetail": item.get("addr2", ""),
#                 "PostalCode":    item.get("zipcode", ""),
#                 "AreaCode":      item.get("areacode", ""),
#                 "SigunguCode":   item.get("sigungucode", ""),
#                 "LDongRegnCd":   item.get("lDongRegnCd", ""),
#                 "LDongSignguCd": item.get("lDongSignguCd", ""),
#                 "lon":           item.get("mapx", ""),
#                 "lat":           item.get("mapy", ""),
#                 "MapLevel":      item.get("mlevel", ""),
#                 "PhoneNumber":   item.get("tel", ""),
#                 "ImageURL":      item.get("firstimage", ""),
#                 "ThumbnailURL":  item.get("firstimage2", ""),
#                 "CreatedTime":   item.get("createdtime", ""),
#                 "ModifiedTime":  item.get("modifiedtime", ""),
#                 "CopyrightCode": item.get("cpyrhtDivCd", ""),
#             })
#     except Exception:
#         pass
#     time.sleep(DELAY)

# save_csv("07_반려동물_동반여행_관광지공통정보.csv",
#     ["ContentID","ContentTypeID","Title","Category1","Category2","Category3",
#      "LclsSystm1","LclsSystm2","LclsSystm3","RoadAddress","AddressDetail",
#      "PostalCode","AreaCode","SigunguCode","LDongRegnCd","LDongSignguCd",
#      "lon","lat","MapLevel","PhoneNumber","ImageURL","ThumbnailURL",
#      "CreatedTime","ModifiedTime","CopyrightCode"], rows)

"""
02_동물약국 + 10_동물보호센터 재수집 스크립트

실행: python 02_10_재수집.py
패키지: pip install requests
"""

import requests
import csv
import time
import os
from urllib.parse import urlencode

SERVICE_KEY = "96ed67423c666f7e208f748b1ea6e32e4a4fe9ff6417187340ceeb7e1fb3a7b8"
OUTPUT_DIR  = "./공공데이터_CSV"
os.makedirs(OUTPUT_DIR, exist_ok=True)
DELAY = 0.3


def save_csv(filename, fieldnames, rows):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    print(f"  ✅ 저장 완료: {filename} ({len(rows):,}건)\n")


def fetch_haanbu_all(endpoint, label):
    """
    행안부 계열 전체 수집
    - serviceKey URL 직접 삽입 (이중인코딩 방지)
    - returnType=json, numOfRows=100 (행안부 최대값)
    """
    all_items = []
    page  = 1
    total = None

    while True:
        query = urlencode({
            "returnType": "json",
            "pageNo":     page,
            "numOfRows":  100,
        })
        url = f"{endpoint}?serviceKey={SERVICE_KEY}&{query}"

        try:
            res = requests.get(url, timeout=30)
            res.raise_for_status()

            if res.text.strip().startswith("<"):
                print(f"  ❌ [{label}] XML 반환됨 (인증키/파라미터 문제)")
                print(f"     응답: {res.text[:200]}")
                break

            data  = res.json()
            body  = data["response"]["body"]
            items = (body.get("items") or {}).get("item", [])
            if isinstance(items, dict):
                items = [items]

            if total is None:
                total = int(body.get("totalCount", 0))
                print(f"  총 {total:,}건")

            if not items:
                break

            all_items.extend(items)
            print(f"  페이지 {page}: {len(items)}건 (누적 {len(all_items):,}/{total:,})")

            if len(all_items) >= total:
                break
            page += 1
            time.sleep(DELAY)

        except Exception as e:
            print(f"  ❌ [{label}] 페이지 {page} 오류: {e}")
            break

    return all_items


# ════════════════════════════════════════════
# 02. 동물약국 (행정안전부)
# ════════════════════════════════════════════
def collect_동물약국():
    print("▶ 02. 동물약국 수집 중...")
    raw = fetch_haanbu_all(
        "https://apis.data.go.kr/1741000/animal_pharmacies/info",
        "동물약국"
    )
    rows = []
    for r in raw:
        addr      = r.get("ROAD_NM_ADDR", "")
        addr_p    = addr.split()
        lot       = r.get("LOTNO_ADDR", "")
        lot_p     = lot.split()
        rows.append({
            "Name":                r.get("BPLC_NM", ""),
            "Facility_ID":         r.get("MNG_NO", ""),
            "GroupCode":           r.get("OPN_ATMY_GRP_CD", ""),
            "RightMemberSN":       r.get("RGHT_MNBD_SN", ""),
            "BusinessStatus":      r.get("SALS_STTS_NM", ""),
            "BusinessStatusDetail":r.get("DTL_SALS_STTS_NM", ""),
            "DataUpdateType":      r.get("DAT_UPDT_SE", ""),
            "LastUpdated":         r.get("DAT_UPDT_PNT", ""),
            "LastModified":        r.get("LAST_MDFCN_PNT", ""),
            "Sido":                addr_p[0] if addr_p else "",
            "Sigungu":             addr_p[1] if len(addr_p) > 1 else "",
            "Dong":                lot_p[1]  if len(lot_p) > 1 else "",
            "LotNumber":           lot,
            "RoadAddress":         addr,
            "PostalCode":          r.get("ROAD_NM_ZIP", ""),
            "LotPostalCode":       r.get("LCTN_ZIP", ""),
            "FloorArea":           r.get("LCTN_AREA", ""),
            "lat":                 r.get("CRD_INFO_Y", ""),
            "lon":                 r.get("CRD_INFO_X", ""),
            "PhoneNumber":         r.get("TELNO", ""),
            "LicenseDate":         r.get("LCPMT_YMD", ""),
            "LicenseRevokedDate":  r.get("LCPMT_RTRCN_YMD", ""),
            "ReopenDate":          r.get("ROBIZ_YMD", ""),
            "ClosingDate":         r.get("CLSBIZ_YMD", ""),
            "SuspensionStartDate": r.get("TCBIZ_BGNG_YMD", ""),
            "SuspensionEndDate":   r.get("TCBIZ_END_YMD", ""),
        })
    save_csv("02_동물약국_조회데이터.csv",
        ["Name","Facility_ID","GroupCode","RightMemberSN","BusinessStatus",
         "BusinessStatusDetail","DataUpdateType","LastUpdated","LastModified",
         "Sido","Sigungu","Dong","LotNumber","RoadAddress","PostalCode",
         "LotPostalCode","FloorArea","lat","lon","PhoneNumber","LicenseDate",
         "LicenseRevokedDate","ReopenDate","ClosingDate",
         "SuspensionStartDate","SuspensionEndDate"], rows)


# ════════════════════════════════════════════
# 10. 동물보호센터 (농림축산식품부)
# 농림부 계열은 _type=json 사용 (returnType 아님)
# 마찬가지로 serviceKey URL 직접 삽입
# ════════════════════════════════════════════
def collect_보호센터():
    print("▶ 10. 동물보호센터 수집 중...")
    all_items = []
    page  = 1
    total = None

    while True:
        query = urlencode({
            "_type":     "json",
            "pageNo":    page,
            "numOfRows": 1000,
        })
        url = f"http://apis.data.go.kr/1543061/animalShelterSrvc_v2/shelterInfo_v2?serviceKey={SERVICE_KEY}&{query}"

        try:
            res = requests.get(url, timeout=30)
            res.raise_for_status()

            if res.text.strip().startswith("<"):
                print(f"  ❌ XML 반환됨: {res.text[:200]}")
                break

            data  = res.json()
            body  = data["response"]["body"]
            items = (body.get("items") or {}).get("item", [])
            if isinstance(items, dict):
                items = [items]

            if total is None:
                total = int(body.get("totalCount", 0))
                print(f"  총 {total:,}건")

            if not items:
                break

            all_items.extend(items)
            print(f"  페이지 {page}: {len(items)}건 (누적 {len(all_items):,}/{total:,})")

            if len(all_items) >= total:
                break
            page += 1
            time.sleep(DELAY)

        except Exception as e:
            print(f"  ❌ 페이지 {page} 오류: {e}")
            break

    rows = []
    for r in all_items:
        rows.append({
            "CareRegNo":        r.get("careRegNo", ""),
            "CareNm":           r.get("careNm", ""),
            "OrgNm":            r.get("orgNm", ""),
            "DivisionNm":       r.get("divisionNm", ""),
            "SaveTrgtAnimal":   r.get("saveTrgtAnimal", ""),
            "CareTel":          r.get("careTel", ""),
            "DataStdDt":        r.get("dataStdDt", ""),
            "DsignationDate":   r.get("dsignationDate", ""),
            "CareAddr":         r.get("careAddr", ""),
            "JibunAddr":        r.get("jibunAddr", ""),
            "lat":              r.get("lat", ""),
            "lng":              r.get("lng", ""),
            "WeekOprStime":     r.get("weekOprStime", ""),
            "WeekOprEtime":     r.get("weekOprEtime", ""),
            "WeekCellStime":    r.get("weekCellStime", ""),
            "WeekCellEtime":    r.get("weekCellEtime", ""),
            "WeekendOprStime":  r.get("weekendOprStime", ""),
            "WeekendOprEtime":  r.get("weekendOprEtime", ""),
            "WeekendCellStime": r.get("weekendCellStime", ""),
            "WeekendCellEtime": r.get("weekendCellEtime", ""),
            "CloseDay":         r.get("closeDay", ""),
            "VetPersonCnt":     r.get("vetPersonCnt", ""),
            "SpecsPersonCnt":   r.get("specsPersonCnt", ""),
            "MedicalCnt":       r.get("medicalCnt", ""),
            "BreedCnt":         r.get("breedCnt", ""),
            "QuarantineCnt":    r.get("quarabtineCnt", ""),
            "FeedCnt":          r.get("feedCnt", ""),
            "TransCarCnt":      r.get("transCarCnt", ""),
        })
    save_csv("10_동물보호센터_조회데이터.csv",
        ["CareRegNo","CareNm","OrgNm","DivisionNm","SaveTrgtAnimal","CareTel",
         "DataStdDt","DsignationDate","CareAddr","JibunAddr","lat","lng",
         "WeekOprStime","WeekOprEtime","WeekCellStime","WeekCellEtime",
         "WeekendOprStime","WeekendOprEtime","WeekendCellStime","WeekendCellEtime",
         "CloseDay","VetPersonCnt","SpecsPersonCnt","MedicalCnt","BreedCnt",
         "QuarantineCnt","FeedCnt","TransCarCnt"], rows)


if __name__ == "__main__":
    print(f"\n{'='*50}")
    print("  02_동물약국 + 10_보호센터 재수집")
    print(f"{'='*50}\n")

    collect_동물약국()
    collect_보호센터()

    print(f"\n{'='*50}")
    for fname in ["02_동물약국_조회데이터.csv", "10_동물보호센터_조회데이터.csv"]:
        path = os.path.join(OUTPUT_DIR, fname)
        if os.path.exists(path):
            rows = sum(1 for _ in open(path, encoding="utf-8-sig")) - 1
            print(f"  ✅ {fname} ({rows:,}건)")
        else:
            print(f"  ❌ {fname} 미생성")
    print(f"{'='*50}\n")