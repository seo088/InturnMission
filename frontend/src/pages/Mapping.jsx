import { useState } from "react";

/* ─────────────────────────────────────────────────────────────
   15개 데이터셋 정의 + 아코디언 샘플 데이터
───────────────────────────────────────────────────────────── */
const DATASETS = [
  {
    id:1, section:"동물병원", category:"의료 및 케어 인프라",
    provider:"행정안전부", fields:28, color:"#0284c7",
    endpoint:"https://apis.data.go.kr/1741000/animal_hospitals/info",
    source:"https://www.data.go.kr/data/15154952/openapi.do",
    mainFields:[
      {field:"BPLC_NM",   prop:"schema:name",       type:"text", desc:"시설 공식 명칭"},
      {field:"MNG_NO",    prop:"schema:identifier",  type:"text", desc:"시설 고유 식별자"},
      {field:"ROAD_NM_ADDR",prop:"schema:address",   type:"text", desc:"도로명 주소"},
      {field:"SALS_STTS_NM",prop:"ex:businessStatus",type:"text", desc:"영업 상태"},
      {field:"TELNO",     prop:"schema:telephone",   type:"text", desc:"전화번호"},
      {field:"CRD_INFO_X",prop:"schema:longitude",   type:"float",desc:"경도 (EPSG:5174)"},
      {field:"CRD_INFO_Y",prop:"schema:latitude",    type:"float",desc:"위도 (EPSG:5174)"},
    ],
    samples:[
      {BPLC_NM:"늘푸른동물병원",MNG_NO:"366000001020260001",ROAD_NM_ADDR:"서울 강남구 역삼로 123",SALS_STTS_NM:"영업/정상",TELNO:"02-1234-5678",CRD_INFO_X:"198823.12",CRD_INFO_Y:"452103.44"},
      {BPLC_NM:"행복동물의원",MNG_NO:"366000001020260002",ROAD_NM_ADDR:"서울 마포구 합정동 456",SALS_STTS_NM:"영업/정상",TELNO:"02-2345-6789",CRD_INFO_X:"194201.30",CRD_INFO_Y:"453820.11"},
      {BPLC_NM:"강남24시동물병원",MNG_NO:"366000001020260003",ROAD_NM_ADDR:"서울 서초구 서초대로 789",SALS_STTS_NM:"영업/정상",TELNO:"02-3456-7890",CRD_INFO_X:"199145.22",CRD_INFO_Y:"451234.87"},
      {BPLC_NM:"미래동물병원",MNG_NO:"366000001020260004",ROAD_NM_ADDR:"경기 수원시 영통구 101",SALS_STTS_NM:"영업/정상",TELNO:"031-1111-2222",CRD_INFO_X:"203412.55",CRD_INFO_Y:"442100.20"},
      {BPLC_NM:"해피동물의원",MNG_NO:"366000001020260005",ROAD_NM_ADDR:"부산 해운대구 중동 202",SALS_STTS_NM:"폐업",TELNO:"051-2222-3333",CRD_INFO_X:"431200.10",CRD_INFO_Y:"393400.33"},
      {BPLC_NM:"서울동물메디컬센터",MNG_NO:"366000001020260006",ROAD_NM_ADDR:"서울 송파구 가락동 303",SALS_STTS_NM:"영업/정상",TELNO:"02-4567-8901",CRD_INFO_X:"200312.44",CRD_INFO_Y:"449800.12"},
      {BPLC_NM:"좋은동물병원",MNG_NO:"366000001020260007",ROAD_NM_ADDR:"인천 남동구 논현고잔로 404",SALS_STTS_NM:"영업/정상",TELNO:"032-3333-4444",CRD_INFO_X:"186700.99",CRD_INFO_Y:"453100.77"},
    ],
  },
  {
    id:2, section:"동물약국", category:"의료 및 케어 인프라",
    provider:"행정안전부", fields:28, color:"#0284c7",
    endpoint:"https://apis.data.go.kr/1741000/animal_pharmacies/info",
    source:"https://www.data.go.kr/data/15154956/openapi.do",
    mainFields:[
      {field:"BPLC_NM",    prop:"schema:name",       type:"text", desc:"약국 명칭"},
      {field:"MNG_NO",     prop:"schema:identifier",  type:"text", desc:"관리번호"},
      {field:"ROAD_NM_ADDR",prop:"schema:address",   type:"text", desc:"도로명 주소"},
      {field:"SALS_STTS_NM",prop:"ex:businessStatus",type:"text", desc:"영업 상태"},
      {field:"TELNO",      prop:"schema:telephone",   type:"text", desc:"전화번호"},
      {field:"CRD_INFO_X", prop:"schema:longitude",   type:"float",desc:"경도"},
      {field:"LCPMT_YMD",  prop:"schema:datePublished",type:"date",desc:"인허가 일자"},
    ],
    samples:[
      {BPLC_NM:"애니멀팜약국",MNG_NO:"1100000010001",ROAD_NM_ADDR:"서울 종로구 세종대로 10",SALS_STTS_NM:"영업/정상",TELNO:"02-111-2222",CRD_INFO_X:"198100.11",LCPMT_YMD:"2015-03-21"},
      {BPLC_NM:"동물사랑약국",MNG_NO:"1100000010002",ROAD_NM_ADDR:"서울 용산구 한강대로 20",SALS_STTS_NM:"영업/정상",TELNO:"02-222-3333",CRD_INFO_X:"196300.44",LCPMT_YMD:"2018-07-15"},
      {BPLC_NM:"수의약국강남",MNG_NO:"1100000010003",ROAD_NM_ADDR:"서울 강남구 테헤란로 30",SALS_STTS_NM:"영업/정상",TELNO:"02-333-4444",CRD_INFO_X:"199200.22",LCPMT_YMD:"2020-01-10"},
      {BPLC_NM:"펫케어약국",MNG_NO:"1100000010004",ROAD_NM_ADDR:"경기 성남시 분당구 판교로 40",SALS_STTS_NM:"영업/정상",TELNO:"031-444-5555",CRD_INFO_X:"202500.33",LCPMT_YMD:"2019-06-25"},
      {BPLC_NM:"동물약국중구",MNG_NO:"1100000010005",ROAD_NM_ADDR:"서울 중구 을지로 50",SALS_STTS_NM:"폐업",TELNO:"02-555-6666",CRD_INFO_X:"197800.55",LCPMT_YMD:"2010-02-14"},
      {BPLC_NM:"그린펫약국",MNG_NO:"1100000010006",ROAD_NM_ADDR:"부산 동래구 온천장로 60",SALS_STTS_NM:"영업/정상",TELNO:"051-666-7777",CRD_INFO_X:"428100.66",LCPMT_YMD:"2021-09-30"},
      {BPLC_NM:"한림동물약국",MNG_NO:"1100000010007",ROAD_NM_ADDR:"대전 유성구 대학로 70",SALS_STTS_NM:"영업/정상",TELNO:"042-777-8888",CRD_INFO_X:"240300.77",LCPMT_YMD:"2017-11-05"},
    ],
  },
  {
    id:3, section:"동물미용업", category:"의료 및 케어 인프라",
    provider:"행정안전부", fields:29, color:"#0284c7",
    endpoint:"https://apis.data.go.kr/1741000/pet_grooming/info",
    source:"https://www.data.go.kr/data/15154944/openapi.do",
    mainFields:[
      {field:"BPLC_NM",     prop:"schema:name",        type:"text",desc:"미용업 명칭"},
      {field:"MNG_NO",      prop:"schema:identifier",   type:"text",desc:"관리번호"},
      {field:"DTL_TASK_SE_NM",prop:"schema:serviceType",type:"text",desc:"서비스 유형"},
      {field:"ROAD_NM_ADDR",prop:"schema:address",      type:"text",desc:"도로명 주소"},
      {field:"TELNO",       prop:"schema:telephone",    type:"text",desc:"전화번호"},
      {field:"CRD_INFO_X",  prop:"schema:longitude",    type:"float",desc:"경도 (EPSG:5174)"},
      {field:"SALS_STTS_NM",prop:"ex:businessStatus",   type:"text",desc:"영업 상태"},
    ],
    samples:[
      {BPLC_NM:"강아지미용실",MNG_NO:"2100000020001",DTL_TASK_SE_NM:"반려동물미용",ROAD_NM_ADDR:"서울 마포구 망원로 11",TELNO:"02-100-2000",CRD_INFO_X:"194100.11",SALS_STTS_NM:"영업/정상"},
      {BPLC_NM:"펫살롱홍대",MNG_NO:"2100000020002",DTL_TASK_SE_NM:"반려동물미용",ROAD_NM_ADDR:"서울 마포구 독막로 22",TELNO:"02-200-3000",CRD_INFO_X:"194500.22",SALS_STTS_NM:"영업/정상"},
      {BPLC_NM:"그루밍클럽",MNG_NO:"2100000020003",DTL_TASK_SE_NM:"반려동물미용",ROAD_NM_ADDR:"서울 강서구 화곡로 33",TELNO:"02-300-4000",CRD_INFO_X:"191200.33",SALS_STTS_NM:"영업/정상"},
      {BPLC_NM:"스타펫미용",MNG_NO:"2100000020004",DTL_TASK_SE_NM:"반려동물미용",ROAD_NM_ADDR:"경기 고양시 일산동구 44",TELNO:"031-400-5000",CRD_INFO_X:"188900.44",SALS_STTS_NM:"폐업"},
      {BPLC_NM:"해피그루머",MNG_NO:"2100000020005",DTL_TASK_SE_NM:"반려동물미용",ROAD_NM_ADDR:"인천 부평구 부평대로 55",TELNO:"032-500-6000",CRD_INFO_X:"185400.55",SALS_STTS_NM:"영업/정상"},
      {BPLC_NM:"모던펫살롱",MNG_NO:"2100000020006",DTL_TASK_SE_NM:"반려동물목욕",ROAD_NM_ADDR:"서울 관악구 봉천로 66",TELNO:"02-600-7000",CRD_INFO_X:"196800.66",SALS_STTS_NM:"영업/정상"},
      {BPLC_NM:"깔끔미용실",MNG_NO:"2100000020007",DTL_TASK_SE_NM:"반려동물미용",ROAD_NM_ADDR:"서울 노원구 공릉로 77",TELNO:"02-700-8000",CRD_INFO_X:"201500.77",SALS_STTS_NM:"영업/정상"},
    ],
  },
  {
    id:4, section:"동물위탁관리업", category:"보호 및 여가 인프라",
    provider:"행정안전부", fields:29, color:"#0284c7",
    endpoint:"https://apis.data.go.kr/1741000/animal_boarding/info",
    source:"https://www.data.go.kr/data/15155055/openapi.do",
    mainFields:[
      {field:"BPLC_NM",     prop:"schema:name",       type:"text", desc:"업소 명칭"},
      {field:"DTL_TASK_SE_NM",prop:"ex:serviceType",  type:"text", desc:"세부 업무 구분"},
      {field:"ROAD_NM_ADDR",prop:"schema:address",    type:"text", desc:"도로명 주소"},
      {field:"TELNO",       prop:"schema:telephone",  type:"text", desc:"전화번호"},
      {field:"CRD_INFO_X",  prop:"schema:longitude",  type:"float",desc:"경도"},
      {field:"SALS_STTS_NM",prop:"ex:businessStatus", type:"text", desc:"영업 상태"},
      {field:"MNG_NO",      prop:"schema:identifier", type:"text", desc:"관리번호"},
    ],
    samples:[
      {BPLC_NM:"강아지유치원",DTL_TASK_SE_NM:"위탁관리",ROAD_NM_ADDR:"서울 성동구 왕십리로 1",TELNO:"02-111-1111",CRD_INFO_X:"200100.11",SALS_STTS_NM:"영업/정상",MNG_NO:"3100000030001"},
      {BPLC_NM:"펫호텔강남",DTL_TASK_SE_NM:"호텔관리",ROAD_NM_ADDR:"서울 강남구 논현로 2",TELNO:"02-222-2222",CRD_INFO_X:"199300.22",SALS_STTS_NM:"영업/정상",MNG_NO:"3100000030002"},
      {BPLC_NM:"도그스쿨",DTL_TASK_SE_NM:"훈련",ROAD_NM_ADDR:"경기 남양주시 진건읍 3",TELNO:"031-333-3333",CRD_INFO_X:"208400.33",SALS_STTS_NM:"영업/정상",MNG_NO:"3100000030003"},
      {BPLC_NM:"미니독하우스",DTL_TASK_SE_NM:"위탁관리",ROAD_NM_ADDR:"서울 은평구 진관길 4",TELNO:"02-444-4444",CRD_INFO_X:"191900.44",SALS_STTS_NM:"폐업",MNG_NO:"3100000030004"},
      {BPLC_NM:"펫팰리스",DTL_TASK_SE_NM:"호텔관리",ROAD_NM_ADDR:"경기 용인시 기흥구 5",TELNO:"031-555-5555",CRD_INFO_X:"204700.55",SALS_STTS_NM:"영업/정상",MNG_NO:"3100000030005"},
      {BPLC_NM:"행복한보금자리",DTL_TASK_SE_NM:"위탁관리",ROAD_NM_ADDR:"서울 도봉구 창동로 6",TELNO:"02-666-6666",CRD_INFO_X:"200900.66",SALS_STTS_NM:"영업/정상",MNG_NO:"3100000030006"},
      {BPLC_NM:"강사랑훈련소",DTL_TASK_SE_NM:"훈련",ROAD_NM_ADDR:"경기 파주시 문산읍 7",TELNO:"031-777-7777",CRD_INFO_X:"186100.77",SALS_STTS_NM:"영업/정상",MNG_NO:"3100000030007"},
    ],
  },
  {
    id:5, section:"동물장묘업", category:"사후 관리",
    provider:"행정안전부", fields:28, color:"#6d28d9",
    endpoint:"https://apis.data.go.kr/1741000/animal_cremation/info",
    source:"https://www.data.go.kr/data/15155065/openapi.do",
    mainFields:[
      {field:"BPLC_NM",     prop:"schema:name",       type:"text", desc:"장묘업 명칭"},
      {field:"MNG_NO",      prop:"schema:identifier",  type:"text", desc:"관리번호"},
      {field:"ROAD_NM_ADDR",prop:"schema:address",    type:"text", desc:"도로명 주소"},
      {field:"SALS_STTS_NM",prop:"ex:businessStatus", type:"text", desc:"영업 상태"},
      {field:"TELNO",       prop:"schema:telephone",  type:"text", desc:"전화번호"},
      {field:"CRD_INFO_X",  prop:"schema:longitude",  type:"float",desc:"경도"},
      {field:"LCPMT_YMD",   prop:"schema:datePublished",type:"date",desc:"인허가 일자"},
    ],
    samples:[
      {BPLC_NM:"하늘길동물장례식장",MNG_NO:"4100000040001",ROAD_NM_ADDR:"경기 양평군 강하면 1",SALS_STTS_NM:"영업/정상",TELNO:"031-111-2222",CRD_INFO_X:"226300.11",LCPMT_YMD:"2016-04-12"},
      {BPLC_NM:"무지개다리동물장례",MNG_NO:"4100000040002",ROAD_NM_ADDR:"경기 가평군 청평면 2",SALS_STTS_NM:"영업/정상",TELNO:"031-222-3333",CRD_INFO_X:"229100.22",LCPMT_YMD:"2018-08-20"},
      {BPLC_NM:"별이된반려동물",MNG_NO:"4100000040003",ROAD_NM_ADDR:"충북 음성군 금왕읍 3",SALS_STTS_NM:"영업/정상",TELNO:"043-333-4444",CRD_INFO_X:"252400.33",LCPMT_YMD:"2020-02-28"},
      {BPLC_NM:"영원의숲동물장묘",MNG_NO:"4100000040004",ROAD_NM_ADDR:"강원 원주시 지정면 4",SALS_STTS_NM:"영업/정상",TELNO:"033-444-5555",CRD_INFO_X:"271200.44",LCPMT_YMD:"2019-05-15"},
      {BPLC_NM:"하늘정원펫장례",MNG_NO:"4100000040005",ROAD_NM_ADDR:"경기 이천시 마장면 5",SALS_STTS_NM:"폐업",TELNO:"031-555-6666",CRD_INFO_X:"216300.55",LCPMT_YMD:"2014-10-01"},
      {BPLC_NM:"사랑담아장례원",MNG_NO:"4100000040006",ROAD_NM_ADDR:"충남 아산시 배방읍 6",SALS_STTS_NM:"영업/정상",TELNO:"041-666-7777",CRD_INFO_X:"228700.66",LCPMT_YMD:"2022-03-11"},
      {BPLC_NM:"별빛동물장례식장",MNG_NO:"4100000040007",ROAD_NM_ADDR:"전북 완주군 이서면 7",SALS_STTS_NM:"영업/정상",TELNO:"063-777-8888",CRD_INFO_X:"212100.77",LCPMT_YMD:"2021-07-19"},
    ],
  },
  {
    id:6, section:"반려동물동반문화시설", category:"이동 및 거점 시설",
    provider:"한국문화정보원", fields:31, color:"#7c3aed",
    endpoint:"api.odcloud.kr/api/15111389/v1",
    source:"https://www.data.go.kr/data/15111389/fileData.do",
    mainFields:[
      {field:"시설명",     prop:"schema:name",        type:"text", desc:"문화시설 명칭"},
      {field:"카테고리1",  prop:"schema:category",    type:"text", desc:"대분류"},
      {field:"위도",       prop:"schema:latitude",    type:"float",desc:"위도 (WGS84)"},
      {field:"경도",       prop:"schema:longitude",   type:"float",desc:"경도 (WGS84)"},
      {field:"도로명주소", prop:"schema:address",     type:"text", desc:"도로명 주소"},
      {field:"운영시간",   prop:"schema:openingHours",type:"text", desc:"운영 시간"},
      {field:"반려동물 동반 가능정보",prop:"ex:petPolicy",type:"text",desc:"동반 조건 정보"},
    ],
    samples:[
      {시설명:"카페 보리",카테고리1:"카페",위도:"37.5412",경도:"127.0231",도로명주소:"서울 광진구 능동로 1",운영시간:"10:00~22:00","반려동물 동반 가능정보":"소형견 동반 가능, 목줄 필수"},
      {시설명:"갤러리독",카테고리1:"미술관",위도:"37.5280",경도:"126.9236",도로명주소:"서울 마포구 서교동 2",운영시간:"11:00~19:00","반려동물 동반 가능정보":"반려견 동반 가능 (10kg 미만)"},
      {시설명:"한강반려동물카페",카테고리1:"카페",위도:"37.5242",경도:"126.8973",도로명주소:"서울 영등포구 여의도동 3",운영시간:"09:00~21:00","반려동물 동반 가능정보":"모든 반려동물 가능"},
      {시설명:"북촌펫파크",카테고리1:"공원",위도:"37.5824",경도:"126.9837",도로명주소:"서울 종로구 북촌로 4",운영시간:"상시개방","반려동물 동반 가능정보":"리드줄 착용 필수"},
      {시설명:"판교알파돔시티",카테고리1:"복합문화시설",위도:"37.3943",경도:"127.1104",도로명주소:"경기 성남시 분당구 5",운영시간:"10:00~20:00","반려동물 동반 가능정보":"소형견 케이지 지참 시 가능"},
      {시설명:"인천차이나타운문화센터",카테고리1:"문화센터",위도:"37.4766",경도:"126.6171",도로명주소:"인천 중구 차이나타운로 6",운영시간:"09:00~18:00","반려동물 동반 가능정보":"실외만 가능"},
      {시설명:"부산해운대아쿠아리움",카테고리1:"수족관",위도:"35.1598",경도:"129.1597",도로명주소:"부산 해운대구 해운대해변로 7",운영시간:"10:00~19:00","반려동물 동반 가능정보":"실외 지정구역만 가능"},
    ],
  },
  {
    id:7, section:"반려동물_동반여행", category:"이동 및 거점 시설",
    provider:"한국관광공사", fields:35, color:"#7c3aed",
    endpoint:"https://apis.data.go.kr/B551011/KorPetTourService2/detailPetTour2",
    source:"https://www.data.go.kr/data/15135102/openapi.do",
    mainFields:[
      {field:"title",       prop:"schema:name",         type:"text", desc:"콘텐츠 제목"},
      {field:"addr1",       prop:"schema:address",      type:"text", desc:"주소"},
      {field:"mapx",        prop:"schema:longitude",    type:"float",desc:"경도 (WGS84)"},
      {field:"mapy",        prop:"schema:latitude",     type:"float",desc:"위도 (WGS84)"},
      {field:"acmpyNeedMtr",prop:"ex:petRequirement",   type:"text", desc:"동반 시 필요 사항"},
      {field:"etcAcmpyInfo",prop:"ex:petSizeLimit",     type:"text", desc:"기타 동반 정보"},
      {field:"firstimage",  prop:"schema:image",        type:"url",  desc:"대표 이미지 URL"},
    ],
    samples:[
      {title:"설악산국립공원",addr1:"강원 속초시 설악산로 833",mapx:"128.4656",mapy:"38.1195",acmpyNeedMtr:"목줄 필수, 배변봉투 지참",etcAcmpyInfo:"10kg 미만 소형견",firstimage:"https://example.com/img1.jpg"},
      {title:"경주 보문단지",addr1:"경북 경주시 보문로 534",mapx:"129.2624",mapy:"35.8562",acmpyNeedMtr:"리드줄 착용 필수",etcAcmpyInfo:"모든 반려동물 가능",firstimage:"https://example.com/img2.jpg"},
      {title:"제주 협재해수욕장",addr1:"제주 제주시 한림읍 협재해변로 115",mapx:"126.2398",mapy:"33.3940",acmpyNeedMtr:"리드줄 착용",etcAcmpyInfo:"해수욕장 일부 구역 허용",firstimage:"https://example.com/img3.jpg"},
      {title:"전주한옥마을",addr1:"전북 전주시 완산구 기린대로 99",mapx:"127.1522",mapy:"35.8150",acmpyNeedMtr:"목줄 필수",etcAcmpyInfo:"실외 구역 전체 가능",firstimage:"https://example.com/img4.jpg"},
      {title:"남이섬",addr1:"강원 춘천시 남산면 남이섬길 1",mapx:"127.5252",mapy:"37.7935",acmpyNeedMtr:"입장 시 케이지 또는 목줄",etcAcmpyInfo:"5kg 미만 케이지 필수",firstimage:"https://example.com/img5.jpg"},
      {title:"오동도",addr1:"전남 여수시 오동도로 222",mapx:"127.7581",mapy:"34.7413",acmpyNeedMtr:"목줄 및 배변봉투",etcAcmpyInfo:"제한 없음",firstimage:"https://example.com/img6.jpg"},
      {title:"부안 변산반도국립공원",addr1:"전북 부안군 변산면 변산해변로 264",mapx:"126.5353",mapy:"35.6810",acmpyNeedMtr:"리드줄 착용 필수",etcAcmpyInfo:"일부 구역 동반 제한",firstimage:"https://example.com/img7.jpg"},
    ],
  },
  {
    id:8, section:"반려동물놀이터", category:"이동 및 거점 시설",
    provider:"한국도로공사", fields:7, color:"#7c3aed",
    endpoint:"https://api.odcloud.kr/api/15064250/v1/uddi:d83eaf9c-67dc",
    source:"https://data.go.kr/data/15064250",
    mainFields:[
      {field:"휴게소명",  prop:"schema:name",        type:"text", desc:"휴게소 공식 명칭"},
      {field:"종류",      prop:"schema:additionalProperty",type:"text",desc:"편의시설 종류"},
      {field:"위치",      prop:"schema:location",    type:"text", desc:"상세 설치 위치"},
      {field:"운영시간",  prop:"schema:openingHours",type:"text", desc:"운영 시간"},
      {field:"휴장일",    prop:"ex:closedDay",       type:"text", desc:"정기 휴무일"},
      {field:"설치연도",  prop:"schema:dateCreated", type:"integer",desc:"설치 연도"},
      {field:"비고",      prop:"schema:description", type:"text", desc:"추가 사항"},
    ],
    samples:[
      {휴게소명:"죽암(서울)휴게소",종류:"놀이터",위치:"휴게소 우측 녹지대",운영시간:"24시간",휴장일:"연중무휴",설치연도:2018,비고:""},
      {휴게소명:"기흥휴게소",종류:"놀이터",위치:"주차장 뒤편",운영시간:"06:00~22:00",휴장일:"연중무휴",설치연도:2019,비고:"대형견 가능"},
      {휴게소명:"화성휴게소(서울)",종류:"놀이터",위치:"건물 동측",운영시간:"24시간",휴장일:"연중무휴",설치연도:2020,비고:""},
      {휴게소명:"안성휴게소",종류:"놀이터",위치:"녹지공간",운영시간:"24시간",휴장일:"연중무휴",설치연도:2017,비고:"소형견 전용"},
      {휴게소명:"천안삼거리휴게소",종류:"놀이터",위치:"북쪽 잔디",운영시간:"24시간",휴장일:"연중무휴",설치연도:2021,비고:""},
      {휴게소명:"인삼랜드휴게소",종류:"놀이터",위치:"서측 녹지대",운영시간:"06:00~21:00",휴장일:"동절기 휴장",설치연도:2016,비고:"동절기 운영 제한"},
      {휴게소명:"서대전휴게소",종류:"놀이터",위치:"주차장 남쪽",운영시간:"24시간",휴장일:"연중무휴",설치연도:2022,비고:""},
    ],
  },
  {
    id:9, section:"구조동물", category:"안전 및 개체 인증",
    provider:"농림축산검역본부", fields:60, color:"#16a34a",
    endpoint:"https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2",
    source:"https://www.data.go.kr/data/15098931/openapi.do",
    mainFields:[
      {field:"desertionNo",  prop:"schema:identifier",  type:"text", desc:"유기동물 고유번호"},
      {field:"kindCd",       prop:"schema:breed",       type:"text", desc:"품종"},
      {field:"happenDt",     prop:"schema:startDate",   type:"date", desc:"발견 일자"},
      {field:"happenPlace",  prop:"schema:location",    type:"text", desc:"발견 장소"},
      {field:"processState", prop:"ex:adoptionStatus",  type:"text", desc:"처리 상태"},
      {field:"careNm",       prop:"ex:shelterName",     type:"text", desc:"보호소 이름"},
      {field:"popfile1",     prop:"schema:image",       type:"url",  desc:"개체 사진 URL"},
    ],
    samples:[
      {desertionNo:"444537202400001",kindCd:"믹스견",happenDt:"20240301",happenPlace:"서울 마포구 망원동",processState:"보호중",careNm:"마포구동물보호센터",popfile1:"https://example.com/a1.jpg"},
      {desertionNo:"444537202400002",kindCd:"말티즈",happenDt:"20240310",happenPlace:"경기 수원시 팔달구",processState:"입양완료",careNm:"수원시동물보호센터",popfile1:"https://example.com/a2.jpg"},
      {desertionNo:"444537202400003",kindCd:"코리안숏헤어",happenDt:"20240315",happenPlace:"서울 강남구 역삼동",processState:"공고중",careNm:"강남구동물보호소",popfile1:"https://example.com/a3.jpg"},
      {desertionNo:"444537202400004",kindCd:"진돗개",happenDt:"20240320",happenPlace:"전남 순천시 조례동",processState:"보호중",careNm:"순천시동물보호센터",popfile1:"https://example.com/a4.jpg"},
      {desertionNo:"444537202400005",kindCd:"포메라니안",happenDt:"20240325",happenPlace:"부산 해운대구 우동",processState:"입양완료",careNm:"해운대구동물보호소",popfile1:"https://example.com/a5.jpg"},
      {desertionNo:"444537202400006",kindCd:"셰퍼드",happenDt:"20240401",happenPlace:"경북 포항시 북구",processState:"자연사",careNm:"포항시동물보호센터",popfile1:"https://example.com/a6.jpg"},
      {desertionNo:"444537202400007",kindCd:"페르시안",happenDt:"20240405",happenPlace:"서울 종로구 부암동",processState:"보호중",careNm:"서울시동물보호센터",popfile1:"https://example.com/a7.jpg"},
    ],
  },
  {
    id:10, section:"분실동물", category:"안전 및 개체 인증",
    provider:"농림축산검역본부", fields:14, color:"#16a34a",
    endpoint:"http://apis.data.go.kr/1543061/lossInfoService/lossInfo",
    source:"https://www.data.go.kr/data/15141910/openapi.do",
    mainFields:[
      {field:"rfidCd",     prop:"schema:identifier",  type:"text", desc:"RFID 칩 코드"},
      {field:"callName",   prop:"schema:name",        type:"text", desc:"동물 이름"},
      {field:"happenDt",   prop:"schema:startDate",   type:"date", desc:"분실 일자"},
      {field:"happenAddr", prop:"schema:location",    type:"text", desc:"분실 주소"},
      {field:"kindCd",     prop:"schema:breed",       type:"text", desc:"품종"},
      {field:"callTel",    prop:"schema:telephone",   type:"text", desc:"보호자 연락처"},
      {field:"specialMark",prop:"schema:description", type:"text", desc:"특징"},
    ],
    samples:[
      {rfidCd:"410123456789001",callName:"코코",happenDt:"20240302",happenAddr:"서울 강남구 대치동",kindCd:"말티즈",callTel:"010-1111-2222",specialMark:"흰색, 빨간 목줄"},
      {rfidCd:"410123456789002",callName:"나비",happenDt:"20240312",happenAddr:"경기 성남시 분당구",kindCd:"코리안숏헤어",callTel:"010-2222-3333",specialMark:"회색 줄무늬"},
      {rfidCd:"410123456789003",callName:"초코",happenDt:"20240318",happenAddr:"서울 마포구 상암동",kindCd:"포메라니안",callTel:"010-3333-4444",specialMark:"갈색, 겁이 많음"},
      {rfidCd:"410123456789004",callName:"몽이",happenDt:"20240322",happenAddr:"부산 동래구 온천동",kindCd:"믹스견",callTel:"010-4444-5555",specialMark:"검정색, 꼬리짧음"},
      {rfidCd:"410123456789005",callName:"하루",happenDt:"20240328",happenAddr:"인천 연수구 송도동",kindCd:"시바이누",callTel:"010-5555-6666",specialMark:"주황색, 파란 옷"},
      {rfidCd:"410123456789006",callName:"두부",happenDt:"20240402",happenAddr:"서울 송파구 방이동",kindCd:"비숑프리제",callTel:"010-6666-7777",specialMark:"흰색, 곱슬"},
      {rfidCd:"410123456789007",callName:"뭉치",happenDt:"20240408",happenAddr:"경기 고양시 덕양구",kindCd:"진돗개",callTel:"010-7777-8888",specialMark:"흰색/황색 혼합"},
    ],
  },
  {
    id:11, section:"동물보호센터", category:"안전 및 개체 인증",
    provider:"농림축산식품부", fields:28, color:"#16a34a",
    endpoint:"http://apis.data.go.kr/1543061/animalShelterSrvc_v2/shelterInfo_v2",
    source:"https://www.data.go.kr/data/15098915/openapi.do",
    mainFields:[
      {field:"careNm",       prop:"schema:name",         type:"text", desc:"보호센터 명칭"},
      {field:"careRegNo",    prop:"schema:identifier",   type:"text", desc:"등록번호"},
      {field:"lat",          prop:"schema:latitude",     type:"float",desc:"위도 (WGS84)"},
      {field:"lng",          prop:"schema:longitude",    type:"float",desc:"경도 (WGS84)"},
      {field:"vetPersonCnt", prop:"ex:vetCount",         type:"integer",desc:"수의사 수"},
      {field:"weekOprStime", prop:"schema:openingHours", type:"text", desc:"평일 시작 시간"},
      {field:"saveTrgtAnimal",prop:"ex:targetAnimal",    type:"text", desc:"구조 대상 동물"},
    ],
    samples:[
      {careNm:"서울시동물보호센터",careRegNo:"11000001",lat:"37.5721",lng:"126.8494",vetPersonCnt:"3",weekOprStime:"09:00",saveTrgtAnimal:"개, 고양이"},
      {careNm:"강남구동물보호소",careRegNo:"11010001",lat:"37.5172",lng:"127.0473",vetPersonCnt:"2",weekOprStime:"09:00",saveTrgtAnimal:"개, 고양이"},
      {careNm:"수원시동물보호센터",careRegNo:"41110001",lat:"37.2636",lng:"127.0286",vetPersonCnt:"4",weekOprStime:"08:30",saveTrgtAnimal:"개, 고양이, 기타"},
      {careNm:"부산시동물보호센터",careRegNo:"21000001",lat:"35.1796",lng:"129.0756",vetPersonCnt:"5",weekOprStime:"09:00",saveTrgtAnimal:"개, 고양이"},
      {careNm:"인천광역시보호소",careRegNo:"22000001",lat:"37.4563",lng:"126.7052",vetPersonCnt:"3",weekOprStime:"09:00",saveTrgtAnimal:"개, 고양이"},
      {careNm:"대구시동물보호센터",careRegNo:"27000001",lat:"35.8714",lng:"128.6014",vetPersonCnt:"4",weekOprStime:"08:00",saveTrgtAnimal:"개, 고양이, 기타"},
      {careNm:"광주시동물보호센터",careRegNo:"29000001",lat:"35.1595",lng:"126.8526",vetPersonCnt:"2",weekOprStime:"09:00",saveTrgtAnimal:"개, 고양이"},
    ],
  },
  {
    id:12, section:"질병정보", category:"의료 및 케어 인프라",
    provider:"농림축산검역본부", fields:7, color:"#e11d48",
    endpoint:"-",
    source:"https://www.data.go.kr/data/15103008/fileData.do",
    mainFields:[
      {field:"DISS_NO",         prop:"schema:identifier",  type:"integer",desc:"질병 고유 번호"},
      {field:"DISS_NM",         prop:"schema:name",        type:"text",   desc:"질병명(한글)"},
      {field:"ENG_DISS_NM",     prop:"skos:altLabel",      type:"text",   desc:"질병명(영문)"},
      {field:"MAIN_INFC_ANIMAL",prop:"ex:affectsAnimal",   type:"text",   desc:"주요 감염 동물"},
      {field:"CAUSE_CMMN_CL",   prop:"ex:causeType",       type:"text",   desc:"원인 분류"},
      {field:"INFO_OFFER_NM",   prop:"schema:author",      type:"text",   desc:"정보 제공자"},
      {field:"RGSDE",           prop:"schema:dateCreated", type:"date",   desc:"등록 일자"},
    ],
    samples:[
      {DISS_NO:5,DISS_NM:"개디스템퍼",ENG_DISS_NM:"Canine distemper",MAIN_INFC_ANIMAL:"개",CAUSE_CMMN_CL:"바이러스",INFO_OFFER_NM:"최은진",RGSDE:"2007-09-18"},
      {DISS_NO:6,DISS_NM:"개보데텔라폐렴",ENG_DISS_NM:"Pneumonic bordetellosis",MAIN_INFC_ANIMAL:"개",CAUSE_CMMN_CL:"세균",INFO_OFFER_NM:"정병열",RGSDE:"2007-09-18"},
      {DISS_NO:8,DISS_NM:"개파보바이러스감염증",ENG_DISS_NM:"Canine parvovirus infection",MAIN_INFC_ANIMAL:"개",CAUSE_CMMN_CL:"바이러스",INFO_OFFER_NM:"박종현",RGSDE:"2007-09-18"},
      {DISS_NO:12,DISS_NM:"광견병",ENG_DISS_NM:"Rabies",MAIN_INFC_ANIMAL:"개/고양이/소",CAUSE_CMMN_CL:"바이러스",INFO_OFFER_NM:"안동준",RGSDE:"2007-09-18"},
      {DISS_NO:55,DISS_NM:"브루셀라병",ENG_DISS_NM:"Brucellosis",MAIN_INFC_ANIMAL:"소/개",CAUSE_CMMN_CL:"세균",INFO_OFFER_NM:"허은정",RGSDE:"2007-09-18"},
      {DISS_NO:107,DISS_NM:"큐열",ENG_DISS_NM:"Q fever",MAIN_INFC_ANIMAL:"소/개/고양이",CAUSE_CMMN_CL:"세균",INFO_OFFER_NM:"엄재구",RGSDE:"2007-09-18"},
      {DISS_NO:115,DISS_NM:"개코로나바이러스감염증",ENG_DISS_NM:"Canine coronavirus infection",MAIN_INFC_ANIMAL:"개",CAUSE_CMMN_CL:"바이러스",INFO_OFFER_NM:"차상호",RGSDE:"2007-10-25"},
    ],
  },
  {
    id:13, section:"질병증상", category:"의료 및 케어 인프라",
    provider:"KISTI", fields:5, color:"#e11d48",
    endpoint:"https://api.odcloud.kr/api/15050441/v1/uddi:cc7486db",
    source:"https://www.data.go.kr/data/15050441/fileData.do",
    mainFields:[
      {field:"증상코드",       prop:"schema:identifier",type:"text", desc:"증상 고유 코드"},
      {field:"증상분류 한글",  prop:"schema:category",  type:"text", desc:"대분류(한글)"},
      {field:"증상분류 영어",  prop:"skos:broader",     type:"text", desc:"대분류(영어)"},
      {field:"증상목록코드",   prop:"skos:notation",    type:"text", desc:"세부 코드"},
      {field:"증상명",         prop:"schema:name",      type:"text", desc:"증상 명칭"},
    ],
    samples:[
      {증상코드:"DH10.56","증상분류 한글":"안과 질환","증상분류 영어":"Ophthalmology",증상목록코드:"H10",증상명:"바이러스성 결막염"},
      {증상코드:"DH11.00","증상분류 한글":"안과 질환","증상분류 영어":"Ophthalmology",증상목록코드:"H11",증상명:"각막궤양"},
      {증상코드:"DA01.00","증상분류 한글":"소화기계 질환","증상분류 영어":"Digestive",증상목록코드:"A01",증상명:"급성 위장염"},
      {증상코드:"DA02.10","증상분류 한글":"소화기계 질환","증상분류 영어":"Digestive",증상목록코드:"A02",증상명:"구토"},
      {증상코드:"DJ10.00","증상분류 한글":"호흡기계 질환","증상분류 영어":"Respiratory",증상목록코드:"J10",증상명:"바이러스성 폐렴"},
      {증상코드:"DJ11.00","증상분류 한글":"호흡기계 질환","증상분류 영어":"Respiratory",증상목록코드:"J11",증상명:"기관지염"},
      {증상코드:"DL20.00","증상분류 한글":"피부과 질환","증상분류 영어":"Dermatology",증상목록코드:"L20",증상명:"아토피성 피부염"},
    ],
  },
  {
    id:14, section:"입양정보", category:"안전 및 개체 인증",
    provider:"공공데이터포털", fields:13, color:"#16a34a",
    endpoint:"https://apis.data.go.kr/1543061/abandonmentPublicService_v2",
    source:"https://www.data.go.kr/data/15098931",
    mainFields:[
      {field:"ANIMAL_NO",    prop:"schema:identifier",  type:"text", desc:"동물 식별 번호"},
      {field:"ANIMAL_BREED", prop:"schema:breed",       type:"text", desc:"품종"},
      {field:"ANIMAL_BIRTH", prop:"schema:birthDate",   type:"date", desc:"출생년도"},
      {field:"ANIMAL_SEX",   prop:"schema:gender",      type:"text", desc:"성별 (M/F)"},
      {field:"ADOPT_STATUS", prop:"ex:adoptionStatus",  type:"text", desc:"입양 가능 상태"},
      {field:"MOVIE_URL",    prop:"schema:url",         type:"url",  desc:"소개 영상 URL"},
      {field:"careNm",       prop:"ex:shelterName",     type:"text", desc:"보호소 명칭"},
    ],
    samples:[
      {ANIMAL_NO:"2024001",ANIMAL_BREED:"말티즈",ANIMAL_BIRTH:"2022",ANIMAL_SEX:"M",ADOPT_STATUS:"입양가능",MOVIE_URL:"https://youtu.be/abc1",careNm:"서울시동물보호센터"},
      {ANIMAL_NO:"2024002",ANIMAL_BREED:"코리안숏헤어",ANIMAL_BIRTH:"2023",ANIMAL_SEX:"F",ADOPT_STATUS:"입양가능",MOVIE_URL:"https://youtu.be/abc2",careNm:"강남구동물보호소"},
      {ANIMAL_NO:"2024003",ANIMAL_BREED:"포메라니안",ANIMAL_BIRTH:"2021",ANIMAL_SEX:"M",ADOPT_STATUS:"보호중",MOVIE_URL:"https://youtu.be/abc3",careNm:"수원시동물보호센터"},
      {ANIMAL_NO:"2024004",ANIMAL_BREED:"믹스견",ANIMAL_BIRTH:"2020",ANIMAL_SEX:"F",ADOPT_STATUS:"입양가능",MOVIE_URL:"https://youtu.be/abc4",careNm:"부산시동물보호센터"},
      {ANIMAL_NO:"2024005",ANIMAL_BREED:"진돗개",ANIMAL_BIRTH:"2019",ANIMAL_SEX:"M",ADOPT_STATUS:"입양가능",MOVIE_URL:"https://youtu.be/abc5",careNm:"인천광역시보호소"},
      {ANIMAL_NO:"2024006",ANIMAL_BREED:"페르시안",ANIMAL_BIRTH:"2022",ANIMAL_SEX:"F",ADOPT_STATUS:"입양가능",MOVIE_URL:"https://youtu.be/abc6",careNm:"대구시동물보호센터"},
      {ANIMAL_NO:"2024007",ANIMAL_BREED:"비숑프리제",ANIMAL_BIRTH:"2023",ANIMAL_SEX:"M",ADOPT_STATUS:"보호중",MOVIE_URL:"https://youtu.be/abc7",careNm:"광주시동물보호센터"},
    ],
  },
  // ★ 15번째 데이터셋 — 동물이름 통계
  {
    id:15, section:"동물이름통계", category:"안전 및 개체 인증",
    provider:"공공데이터포털", fields:2, color:"#0891b2",
    endpoint:"-",
    source:"https://www.data.go.kr/data/15000000",
    mainFields:[
      {field:"name",  prop:"rdfs:label",      type:"text",    desc:"등록된 반려동물 이름"},
      {field:"count", prop:"koah:frequency",  type:"integer", desc:"사용 빈도수"},
    ],
    samples:[
      {name:"코코",count:12845},{name:"초코",count:11203},{name:"몽이",count:9876},
      {name:"하루",count:9104},{name:"두부",count:8732},{name:"나비",count:8561},{name:"콩이",count:7940},
    ],
  },
];

const CATEGORY_COLORS = {
  "의료 및 케어 인프라":"#0284c7",
  "이동 및 거점 시설":"#7c3aed",
  "안전 및 개체 인증":"#16a34a",
  "사후 관리":"#6d28d9",
  "보호 및 여가 인프라":"#0369a1",
};

/* ─────────────────────────────────────────────────────────────
   아코디언 행 컴포넌트
───────────────────────────────────────────────────────────── */
function DatasetRow({ ds, isOpen, onToggle }) {
  const catColor = CATEGORY_COLORS[ds.category] || "#64748b";
  const fieldKeys = Object.keys(ds.samples[0] || {});

  return (
    <div style={{ border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden",
      marginBottom:8, background:"#ffffff",
      boxShadow: isOpen ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
      transition:"box-shadow 0.2s" }}>

      {/* 헤더 행 — 클릭하면 아코디언 토글 */}
      <div onClick={onToggle}
        style={{ display:"grid", gridTemplateColumns:"36px 1fr 160px 100px 80px 36px",
          alignItems:"center", padding:"11px 16px", cursor:"pointer",
          background: isOpen ? "#f8fafc" : "#ffffff",
          borderBottom: isOpen ? "1px solid #e2e8f0" : "none",
          transition:"background 0.15s", userSelect:"none",
          gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:"50%",
          background: catColor+"15", border:`1.5px solid ${catColor}55`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:12, fontWeight:700, color:catColor }}>
          {ds.id}
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{ds.section}</div>
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>{ds.provider}</div>
        </div>
        <div style={{ fontSize:11, color:"#64748b" }}>{ds.category}</div>
        <div style={{ fontSize:11, color:"#64748b" }}>{ds.fields}개 필드</div>
        <div>
          <span style={{ fontSize:10, padding:"2px 7px", borderRadius:4,
            background:`${catColor}12`, color:catColor, fontWeight:600 }}>
            {ds.id===15?"NEW":"API"}
          </span>
        </div>
        <div style={{ fontSize:14, color:"#94a3b8", textAlign:"center",
          transform: isOpen ? "rotate(180deg)" : "rotate(0)",
          transition:"transform 0.2s" }}>
          ▾
        </div>
      </div>

      {/* 아코디언 본문 */}
      <div style={{
        maxHeight: isOpen ? "600px" : "0",
        overflow:"hidden",
        transition:"max-height 0.3s ease",
      }}>
        <div style={{ padding:"16px" }}>

          {/* 주요 필드 설명 */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#94a3b8", letterSpacing:1,
              textTransform:"uppercase", marginBottom:8 }}>주요 필드 · RDF 매핑</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:6 }}>
              {ds.mainFields.map(f => (
                <div key={f.field} style={{ padding:"6px 10px", borderRadius:6,
                  background:"#f8fafc", border:"1px solid #e2e8f0",
                  display:"flex", alignItems:"flex-start", gap:8 }}>
                  <code style={{ fontSize:10, color:catColor,
                    background:`${catColor}12`, padding:"1px 5px",
                    borderRadius:3, flexShrink:0, lineHeight:1.8 }}>
                    {f.field}
                  </code>
                  <div>
                    <div style={{ fontSize:10, color:"#475569", fontFamily:"monospace" }}>{f.prop}</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>{f.desc}</div>
                  </div>
                  <span style={{ fontSize:9, color:"#cbd5e1", marginLeft:"auto",
                    flexShrink:0, padding:"1px 5px", border:"1px solid #e2e8f0",
                    borderRadius:3 }}>{f.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 실제 데이터 인스턴스 7개 */}
          <div>
            <div style={{ fontSize:11, color:"#94a3b8", letterSpacing:1,
              textTransform:"uppercase", marginBottom:8 }}>
              실제 데이터 인스턴스 (7건 샘플)
            </div>
            <div style={{ overflowX:"auto", borderRadius:6,
              border:"1px solid #e2e8f0" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, minWidth:600 }}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    <th style={{ padding:"7px 10px", textAlign:"left",
                      borderBottom:"1px solid #e2e8f0", color:"#64748b",
                      fontWeight:500, whiteSpace:"nowrap" }}>#</th>
                    {fieldKeys.map(k => (
                      <th key={k} style={{ padding:"7px 10px", textAlign:"left",
                        borderBottom:"1px solid #e2e8f0", color:"#64748b",
                        fontWeight:500, whiteSpace:"nowrap" }}>
                        <code style={{ fontSize:10, color:catColor }}>{k}</code>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ds.samples.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom:"1px solid #f1f5f9",
                      background: idx%2===0 ? "#ffffff" : "#fafafa" }}>
                      <td style={{ padding:"6px 10px", color:"#cbd5e1", fontWeight:600 }}>
                        {idx+1}
                      </td>
                      {fieldKeys.map(k => (
                        <td key={k} style={{ padding:"6px 10px", color:"#334155",
                          maxWidth:180, overflow:"hidden",
                          textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                          title={String(row[k]||"")}>
                          {String(row[k]||"-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {ds.source !== "-" && (
              <div style={{ marginTop:8, fontSize:10, color:"#94a3b8" }}>
                출처:&nbsp;
                <a href={ds.source} target="_blank" rel="noreferrer"
                  style={{ color:"#0284c7", textDecoration:"none" }}>
                  {ds.source}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   메인 컴포넌트
───────────────────────────────────────────────────────────── */
export default function MappingTablePage() {
  const [openId,   setOpenId]   = useState(null);
  const [search,   setSearch]   = useState("");
  const [catFilter,setCatFilter]= useState("전체");

  const cats = ["전체", ...Array.from(new Set(DATASETS.map(d=>d.category)))];
  const filtered = DATASETS.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.section.includes(q) || d.provider.includes(q) || d.category.includes(q);
    const matchCat    = catFilter==="전체" || d.category===catFilter;
    return matchSearch && matchCat;
  });

  const toggle = (id) => setOpenId(p => p===id ? null : id);

  const catBtnStyle = (active, color) => ({
    padding:"4px 11px", fontSize:11, borderRadius:5, cursor:"pointer",
    border:`1px solid ${active ? (color||"#0f172a") : "#e2e8f0"}`,
    background: active ? (color||"#0f172a")+"15" : "#ffffff",
    color: active ? (color||"#0f172a") : "#64748b",
    fontWeight: active ? 600 : 400,
    transition:"all 0.15s",
  });

  return (
    <div style={{ minHeight:"100vh", background:"#ffffff",
      fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* 헤더 */}
      <div style={{ padding:"16px 32px", borderBottom:"1px solid #e2e8f0",
        background:"#ffffff", boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
        position:"sticky", top:0, zIndex:30 }}>
        <div style={{ maxWidth:1200, margin:"0 auto",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:"#0f172a" }}>
              Pet-Graph&nbsp;
              <span style={{color:"#94a3b8",fontWeight:400}}>/</span>
              <span style={{ color:"#0369a1", marginLeft:8 }}>데이터셋 매핑 테이블</span>
            </div>
            <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>
              총 15개 공공 데이터셋 · 행 클릭 시 필드 정의 및 데이터 샘플 7건 확인
            </div>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="데이터셋 검색…"
            style={{ padding:"7px 12px", fontSize:12, borderRadius:6,
              border:"1px solid #e2e8f0", outline:"none", width:200,
              background:"#f8fafc", color:"#0f172a" }} />
        </div>

        {/* 카테고리 필터 */}
        <div style={{ maxWidth:1200, margin:"10px auto 0",
          display:"flex", gap:6, flexWrap:"wrap" }}>
          {cats.map(c => (
            <button key={c} onClick={()=>setCatFilter(c)}
              style={catBtnStyle(catFilter===c, CATEGORY_COLORS[c])}>
              {c}
            </button>
          ))}
          <span style={{ marginLeft:"auto", fontSize:11, color:"#94a3b8",
            alignSelf:"center" }}>
            {filtered.length}개 표시
          </span>
        </div>
      </div>

      {/* 데이터셋 목록 */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 32px" }}>

        {/* 컬럼 헤더 */}
        <div style={{ display:"grid",
          gridTemplateColumns:"36px 1fr 160px 100px 80px 36px",
          padding:"6px 16px", marginBottom:6, gap:8 }}>
          <div style={{fontSize:10,color:"#94a3b8"}}>#</div>
          <div style={{fontSize:10,color:"#94a3b8"}}>데이터셋 · 제공기관</div>
          <div style={{fontSize:10,color:"#94a3b8"}}>카테고리</div>
          <div style={{fontSize:10,color:"#94a3b8"}}>필드 수</div>
          <div style={{fontSize:10,color:"#94a3b8"}}>유형</div>
          <div/>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0",
            color:"#94a3b8", fontSize:14 }}>
            검색 결과가 없습니다
          </div>
        ) : (
          filtered.map(ds => (
            <DatasetRow key={ds.id} ds={ds}
              isOpen={openId===ds.id}
              onToggle={() => toggle(ds.id)} />
          ))
        )}
      </div>
    </div>
  );
}
