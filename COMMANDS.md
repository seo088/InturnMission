# 📋 COMMANDS.md — 애니멀루(Animallou) 프로젝트 규칙 및 API 명세 정리

> **교수님 지침 준수 필수 문서**
> - 코드 내 비번·인증키 하드코딩 **절대 금지**
> - 인증키는 반드시 `.env` 파일로 관리
> - 노션 정리본 작성 규칙을 모든 팀원이 동일하게 준수

---

## 🔐 0. 보안 규칙 (최우선 준수)

### ❌ 절대 금지
- Python, JS 등 **코드 파일 안에 API 키·비밀번호 직접 작성 금지**
- `.env` 파일을 Git에 커밋하는 행위 금지
- 노션 공개 문서, 발표 슬라이드, README에 실제 인증키 기재 금지

### ✅ 올바른 방법

**1단계 — `.gitignore`에 `.env` 추가**
```
.env
```

**2단계 — `.env` 파일 생성 (Git 커밋 하지 않음)**
```env
# 실제 키는 이 파일에만 작성
API_KEY_MOIS=여기에_입력
```

**3단계 — `.env.example` 파일을 Git에 커밋 (키 구조만 공유)**
```env
API_KEY_MOIS=YOUR_KEY_HERE
```

**Python 코드 사용 예시**
```python
# ❌ 절대 금지
API_KEY = "96ed67423c666..."

# ✅ 올바른 방법
import os
from dotenv import load_dotenv
load_dotenv()
API_KEY = os.getenv("API_KEY_MOIS")
```

---

## 🗂️ 1. 전체 API 인증키 환경변수 목록

> 아래 변수명을 `.env` 파일에 작성하고, 실제 키 값은 팀장에게 별도 전달받을 것.

| 환경변수명 | 사용 API | 비고 |
|-----------|---------|------|
| `API_KEY_MOIS` | 행정안전부 동물병원·약국·미용·위탁·장묘 | 5개 API 공통 사용 |
| `API_KEY_KTO` | 한국관광공사 반려동물 동반여행 | - |
| `API_KEY_ABANDONMENT` | 농림축산검역본부 구조동물 조회 | - |
| `API_KEY_LOSTPET` | 농림축산검역본부 분실동물 조회 | - |
| `API_KEY_SHELTER` | 농림축산식품부 동물보호센터 조회 | - |
| `API_KEY_ADOPTION` | 국가동물보호정보시스템 입양정보 | ⚠️ 별도 키 (다른 키 사용) |
| `API_KEY_KISTI` | 한국과학기술정보연구원 동물질병 증상분류 | - |
| `API_KEY_CULTURE` | 한국문화정보원 반려동물 동반가능 시설 | - |
| `API_KEY_EXPRESSWAY` | 한국도로공사 휴게소 편의시설 | - |

> ⚠️ **농림축산검역본부 동물질병정보** 는 API 없이 CSV 직접 다운로드 방식이므로 인증키 불필요.

---

## 📡 2. API별 상세 명세

---

### 2-1. 행정안전부 — 동물병원 조회서비스

| 항목 | 내용 |
|------|------|
| 제공기관 | 행정안전부 (소관: 농림축산식품부) |
| 공공데이터 URL | https://www.data.go.kr/data/15154952/openapi.do |
| Base URL | `https://apis.data.go.kr/1741000/animal_hospitals` |
| 인증키 환경변수 | `API_KEY_MOIS` |
| 수정일 | 2026-02-19 |

**엔드포인트**
```
GET /info      # 현재 정보 조회
GET /history   # 이력 정보 조회 (개폐업 시계열 분석용)
```

**주요 요청 파라미터**

| 파라미터 | 필수여부 | 설명 |
|---------|---------|------|
| `serviceKey` | 필수 | `.env`의 `API_KEY_MOIS` 사용 |
| `pageNo` / `numOfRows` | 필수 | 최대 100건 |
| `returnType` | 선택 | json 권장 |
| `cond[SALS_STTS_CD::EQ]` | 필터 | 01(영업중) 필터 필수 |
| `cond[BPLC_NM::LIKE]` | 필터 | 병원 이름 검색 |
| `cond[ROAD_NM_ADDR::LIKE]` | 필터 | 지역 검색 |

**주요 응답 필드**

| API 원본 필드 | 변수명 | 설명 | 지식그래프 역할 |
|-------------|-------|------|--------------|
| `MNG_NO` | `Facility_ID` | 시설 고유 식별자 (URI 키) | 식별자 |
| `BPLC_NM` | `Name` | 병원 공식 명칭 | 엔티티 (Node) |
| `SALS_STTS_NM` | `BusinessStatus` | 영업/폐업/휴업 | 속성 |
| `ROAD_NM_ADDR` | `RoadAddress` | 도로명 주소 | 속성 |
| `TELNO` | `PhoneNumber` | 전화번호 | 속성 |
| `CRD_INFO_X` | `lon` | 경도 (⚠️ Bessel→WGS84 변환 필요) | 속성 |
| `CRD_INFO_Y` | `lat` | 위도 (⚠️ Bessel→WGS84 변환 필요) | 속성 |
| `LCPMT_YMD` | `LicenseDate` | 인허가 일자 | 속성 |
| `CLSBIZ_YMD` | `ClosingDate` | 폐업 일자 (영업중이면 빈값) | 속성 |

**⚠️ 주의사항**
- 좌표계: `CRD_INFO_X/Y`는 **Bessel 중부원점TM (EPSG:5174)** → `pyproj`로 WGS84 변환 필수
- 폐업 데이터(`SALS_STTS_CD == '03'`)는 지도에서 제외, 통계 노드로만 활용

**RDF 설계**
- Class: `ex:AnimalHospital`
- URI: `ex:facility/hospital/{MNG_NO}`
- Relation: `ex:Hospital` → [locatedIn] → `ex:Region`

---

### 2-2. 행정안전부 — 동물약국 조회서비스

| 항목 | 내용 |
|------|------|
| 제공기관 | 행정안전부 |
| 공공데이터 URL | https://www.data.go.kr/data/15154953/openapi.do |
| Base URL | `https://apis.data.go.kr/1741000/animal_pharmacies` |
| 인증키 환경변수 | `API_KEY_MOIS` |
| 수정일 | 2026-02-19 |

**엔드포인트**
```
GET /info      # 현재 정보 조회
GET /history   # 이력 정보 조회
```

**주요 요청 파라미터**

| 파라미터 | 필수여부 | 설명 |
|---------|---------|------|
| `serviceKey` | 필수 | `.env`의 `API_KEY_MOIS` 사용 |
| `pageNo` / `numOfRows` | 필수 | 최대 100건 |
| `returnType` | 선택 | json 권장 |
| `cond[SALS_STTS_CD::EQ]` | 필터 | **01(영업중)** 필터 필수 |
| `cond[BPLC_NM::LIKE]` | 필터 | 약국 이름 검색 |
| `cond[ROAD_NM_ADDR::LIKE]` | 필터 | 지역 검색 |

**주요 응답 필드**

| API 원본 필드 | 변수명 | 설명 | 지식그래프 역할 |
|-------------|-------|------|--------------|
| `MNG_NO` | `Facility_ID` | 시설 고유 식별자 | 식별자 |
| `BPLC_NM` | `Name` | 약국 공식 명칭 | 엔티티 (Node) |
| `SALS_STTS_NM` / `SALS_STTS_CD` | `BusinessStatus` | 영업 상태 | 속성 |
| `DTL_SALS_STTS_NM` | `BusinessStatusDetail` | 상세 영업 상태 | 속성 |
| `ROAD_NM_ADDR` | `RoadAddress` | 도로명 주소 | 속성 |
| `ROAD_NM_ZIP` | `PostalCode` | 우편번호 | 속성 |
| `LCTN_AREA` | `FloorArea` | 시설 면적(㎡) | 속성 |
| `TELNO` | `PhoneNumber` | 전화번호 | 속성 |
| `CRD_INFO_X` | `lon` | 경도 (⚠️ 변환 필요) | 속성 |
| `CRD_INFO_Y` | `lat` | 위도 (⚠️ 변환 필요) | 속성 |
| `LCPMT_YMD` | `LicenseDate` | 인허가 일자 | 속성 |
| `CLSBIZ_YMD` | `ClosingDate` | 폐업 일자 | 속성 |
| `TCBIZ_BGNG_YMD` | `SuspensionStartDate` | 휴업 시작일 | 속성 |
| `TCBIZ_END_YMD` | `SuspensionEndDate` | 휴업 종료일 | 속성 |
| `DAT_UPDT_SE` | `DataUpdateType` | I(신규)/U(수정)/D(삭제) | 속성 |
| `DAT_UPDT_PNT` | `LastUpdated` | 최종 갱신 일시 | 속성 |

**⚠️ 주의사항**
- 좌표계: Bessel (EPSG:5174) → WGS84 변환 필수 (동물병원과 동일 모듈 재사용)
- `DAT_UPDT_SE` 필드로 증분 업데이트 가능

**RDF 설계**
- Class: `ex:AnimalPharmacy` (`schema:Pharmacy` 상속 권장)
- URI: `ex:pharmacy/{MNG_NO}`
- Relation: `ex:Pharmacy` → [locatedIn] → `ex:Region`

---

### 2-3. 행정안전부 — 동물미용업 조회서비스

| 항목 | 내용 |
|------|------|
| 제공기관 | 행정안전부 |
| 공공데이터 URL | https://www.data.go.kr/data/15154944/openapi.do |
| Base URL | `https://apis.data.go.kr/1741000/pet_grooming` |
| 인증키 환경변수 | `API_KEY_MOIS` |
| 수정일 | 2026-02-19 |

**엔드포인트**
```
GET /info      # 현재 정보 조회
GET /history   # 이력 정보 조회
```

**주요 요청 파라미터**

| 파라미터 | 필수여부 | 설명 |
|---------|---------|------|
| `serviceKey` | 필수 | `.env`의 `API_KEY_MOIS` 사용 |
| `pageNo` / `numOfRows` | 필수 | 최대 100건 |
| `returnType` | 선택 | json 권장 |
| `cond[SALS_STTS_CD::EQ]` | 필터 | 01(영업중) 필터 필수 |
| `cond[BPLC_NM::LIKE]` | 필터 | 미용실 이름 검색 |

**주요 응답 필드**

| API 원본 필드 | 변수명 | 설명 | 지식그래프 역할 |
|-------------|-------|------|--------------|
| `MNG_NO` | `Facility_ID` | 시설 고유 식별자 | 식별자 |
| `BPLC_NM` | `Name` | 미용실 공식 명칭 | 엔티티 (Node) |
| `DTL_TASK_SE_NM` | `TaskType` | 상세 서비스 구분명 | 엔티티 (Node) |
| `SALS_STTS_NM` | `BusinessStatus` | 영업 상태 | 속성 |
| `DTL_SALS_STTS_NM` | `DetailedBusinessStatus` | 세부 영업 상태 | 속성 |
| `ROAD_NM_ADDR` | `RoadAddress` | 도로명 주소 (⚠️ 상세주소 비식별) | 속성 |
| `LCTN_AREA` | `LocationArea` | 소재지 면적(㎡) | 속성 |
| `TELNO` | `PhoneNumber` | 전화번호 | 속성 |
| `CRD_INFO_X` | `lon` | 경도 (⚠️ EPSG:5174 변환 필요) | 속성 |
| `CRD_INFO_Y` | `lat` | 위도 (⚠️ EPSG:5174 변환 필요) | 속성 |
| `LCPMT_YMD` | `LicenseDate` | 인허가 일자 | 속성 |

**⚠️ 주의사항**
- 1인 기업 보호를 위해 **상세 주소(동·호수) 비식별 처리됨** → 건물 단위까지만 매핑 가능, `TELNO` 보조 식별 수단 활용
- 좌표계: EPSG:5174 → WGS84 변환 필수

**에러코드 대응**

| 코드 | 원인 | 대응 |
|-----|------|------|
| `-2, -4, -11` | 파라미터 누락 또는 인증키 오류 | 백엔드 로직 점검 |
| `-10` | 호출 한도 초과 | 캐싱 로직 또는 배치 주기 조정 |
| `-1, -5, -999` | 시스템 내부 오류 | 예외 처리 후 재시도 로직 |

**RDF 설계**
- Class: `ex:PetGroomingShop`
- URI: `ex:facility/grooming/{MNG_NO}`
- Relation: `ex:Grooming` → [locatedIn] → `ex:Region`

---

### 2-4. 행정안전부 — 동물위탁관리업 조회서비스

| 항목 | 내용 |
|------|------|
| 제공기관 | 행정안전부 |
| 공공데이터 URL | https://www.data.go.kr/data/15155055/openapi.do |
| Base URL | `https://apis.data.go.kr/1741000/animal_boarding` |
| 인증키 환경변수 | `API_KEY_MOIS` |
| 수정일 | 2026-02-19 |

**엔드포인트**
```
GET /info      # 현재 정보 조회
GET /history   # 이력 정보 조회
```

**주요 요청 파라미터**

| 파라미터 | 필수여부 | 설명 |
|---------|---------|------|
| `serviceKey` | 필수 | `.env`의 `API_KEY_MOIS` 사용 |
| `pageNo` / `numOfRows` | 필수 | 최대 100건 |
| `returnType` | 선택 | json 권장 |
| `cond[SALS_STTS_CD::EQ]` | 필터 | 01(영업중) 필터 필수 |
| `cond[BPLC_NM::LIKE]` | 필터 | 호텔·유치원 등 명칭 검색 |

**주요 응답 필드**

| API 원본 필드 | 변수명 | 설명 | 지식그래프 역할 |
|-------------|-------|------|--------------|
| `MNG_NO` | `Facility_ID` | 시설 고유 식별자 | 식별자 |
| `BPLC_NM` | `Name` | 시설 명칭 (예: OO애견호텔) | 엔티티 (Node) |
| `DTL_TASK_SE_NM` | `TaskType` | 위탁/훈련/보호 세부 분류 | 속성/노드 |
| `SALS_STTS_NM` / `DTL_SALS_STTS_NM` | `BusinessStatus` | 영업 상태 | 속성 |
| `ROAD_NM_ADDR` | `RoadAddress` | 도로명 주소 (⚠️ 비식별 처리) | 속성 |
| `LCTN_AREA` | `LocationArea` | 소재지 면적 (대형견 수용 추론에 활용) | 속성 |
| `TELNO` | `PhoneNumber` | 전화번호 | 속성 |
| `CRD_INFO_X` | `lon` | 경도 (⚠️ EPSG:5174 변환 필요) | 속성 |
| `CRD_INFO_Y` | `lat` | 위도 (⚠️ EPSG:5174 변환 필요) | 속성 |

**⚠️ 주의사항**
- 활용 신청 건수가 적어 API 응답이 느릴 수 있음 → **Timeout + Retry 로직 필수**
- `LCTN_AREA`(소재지면적)으로 **대형견 위탁 가능 여부** 추론 지표로 활용 가능

**RDF 설계**
- Class: `ex:AnimalBoarding`
- SubClass: `ex:PetHotel`, `ex:PetKindergarten`, `ex:PetTraining` (DTL_TASK_SE_NM 기준 분류)
- URI: `ex:facility/boarding/{MNG_NO}`
- Relation: `ex:AnimalBoarding` → [offersService] → `ex:Training`

---

### 2-5. 행정안전부 — 동물장묘업 조회서비스

| 항목 | 내용 |
|------|------|
| 제공기관 | 행정안전부 |
| 공공데이터 URL | https://www.data.go.kr/data/15155065/openapi.do |
| Base URL | `https://apis.data.go.kr/1741000/animal_cremation` |
| 인증키 환경변수 | `API_KEY_MOIS` |
| 수정일 | 2026-02-19 |

**엔드포인트**
```
GET /info      # 현재 정보 조회
GET /history   # 이력 정보 조회
```

**주요 요청 파라미터**

| 파라미터 | 필수여부 | 설명 |
|---------|---------|------|
| `serviceKey` | 필수 | `.env`의 `API_KEY_MOIS` 사용 |
| `pageNo` / `numOfRows` | 필수 | 최대 100건 |
| `returnType` | 선택 | json 권장 |
| `cond[SALS_STTS_CD::EQ]` | 필터 | 01(영업중) 필터 필수 |
| `cond[ROAD_NM_ADDR::LIKE]` | 필터 | 특정 지역 내 시설 검색 |
| `cond[BPLC_NM::LIKE]` | 필터 | 시설 명칭으로 검색 |

**주요 응답 필드**

| API 원본 필드 | 변수명 | 설명 | 지식그래프 역할 |
|-------------|-------|------|--------------|
| `MNG_NO` | `Facility_ID` | 시설 고유 식별자 | 식별자 |
| `BPLC_NM` | `Name` | 시설 명칭 (예: OO동물화장장) | 엔티티 (Node) |
| `SALS_STTS_NM` | `BusinessStatus` | 영업/휴업/폐업 상태 | 속성 |
| `ROAD_NM_ADDR` | `RoadAddress` | 도로명 주소 | 속성 |
| `TELNO` | `PhoneNumber` | 전화번호 | 속성 |
| `CRD_INFO_X` | `lon` | 경도 (⚠️ EPSG:5174 변환 필요) | 속성 |
| `CRD_INFO_Y` | `lat` | 위도 (⚠️ EPSG:5174 변환 필요) | 속성 |
| `LCPMT_YMD` | `LicenseDate` | 인허가 일자 | 속성 |
| `CLSBIZ_YMD` | `ClosingDate` | 폐업 일자 | 속성 |

**⚠️ 주의사항**
- 업소 수가 적고 특정 지역에 밀집 → **희소 데이터**, 지역 접근성 분석 지표로 활용
- 행안부 4대 API(약국·미용·위탁·장묘) 모두 EPSG:5174 공유 → **통합 좌표 변환 모듈** 단 1개로 처리

**RDF 설계**
- Class: `ex:AnimalCremation` (`schema:FuneralService` 상속 권장)
- URI: `ex:facility/cremation/{MNG_NO}`
- Relation: `ex:AnimalCremation` → [locatedIn] → `ex:Region`

---

### 2-6. 한국관광공사 — 반려동물 동반여행 서비스

| 항목 | 내용 |
|------|------|
| 제공기관 | 한국관광공사 |
| 공공데이터 URL | https://www.data.go.kr/data/15135102/openapi.do |
| Base URL | `https://apis.data.go.kr/B551011/KorPetTourService2` |
| 인증키 환경변수 | `API_KEY_KTO` |
| 수정일 | 2026-01-08 |

**핵심 엔드포인트**

| 엔드포인트 | 용도 | 필요 여부 |
|-----------|------|---------|
| `GET /detailPetTour2` | 반려동물 동반 조건 상세 | ✅ 핵심 |
| `GET /petTourSyncList2` | 동반여행 정보 동기화 목록 | ✅ 핵심 |
| `GET /areaBasedList2` | 지역기반 관광정보 (장소 목록) | ✅ |
| `GET /locationBasedList2` | 위치기반 관광정보 (지도 연동) | ✅ |
| `GET /detailCommon2` | 공통 정보 (이름·주소·전화) | ✅ |
| `GET /detailIntro2` | 소개 정보 | 🔶 선택 |
| `GET /detailImage2` | 이미지 조회 | 🔶 선택 |
| `GET /searchKeyword2` | 키워드 검색 | 🔶 검색 기능 있을 때 |

**주요 요청 파라미터**

| 파라미터 | 필수여부 | 설명 |
|---------|---------|------|
| `serviceKey` | 필수 | `.env`의 `API_KEY_KTO` 사용 |
| `MobileOS` / `MobileApp` | 필수 | ETC / TestApp 권장 |
| `_type` | 필수 | **json** 설정 필수 |
| `contentTypeId` | 조회 | 12(관광지), 32(숙박), 39(음식점) |
| `mapX` / `mapY` | 위치 | WGS84 GPS 좌표 (경도/위도) |
| `contentId` | 상세 | 상세 정보 및 이미지 조회 시 사용 |

**주요 응답 필드**

| API 원본 필드 | 설명 | 지식그래프 역할 |
|-------------|------|--------------|
| `title` | 관광지/숙소/음식점 명칭 | 엔티티 (Node) |
| `addr1` / `addr2` | 주소 | 속성 |
| `mapx` / `mapy` | WGS84 좌표 ✅ 즉시 사용 가능 | 속성 |
| `firstimage` | 대표 이미지 URL | 속성 |
| `acmpyTypeCd` | 동반 가능 형태 (전체/부분 동반) | 속성 |
| `acmpyPsblCpam` | 동반 가능 동물 수 | 속성 |
| `acmpyNeedMtr` | 동반 시 필요사항 (리드줄 등) | 속성 |
| `relaPosesFclty` | 보유 시설 (놀이터·수영장 등) | 엔티티 (Node) |
| `etcAcmpyInfo` | 기타 동반 정보 (무게 제한 등) | 속성 |

**⚠️ 주의사항**
- **2단계 호출 구조**: 목록 조회(`areaBasedList2`) 후 → `contentId`로 상세 조회(`detailPetTour2`)
- `etcAcmpyInfo`의 "10kg 미만", "대형견 불가" 텍스트를 정규표현식으로 추출하여 정규화 필요
- WGS84 직접 제공 → 행안부 데이터와 달리 좌표 변환 불필요 ✅

**RDF 설계**
- Class: `ex:PetFriendlyPlace`
- SubClass: `ex:PetHotel`, `ex:PetCafe`, `ex:PetPark` (contentTypeId 기준)
- URI: `ex:tour/content/{contentId}`
- Relation: `ex:Place` → [hasRule] → `ex:PetPolicy`

---

### 2-7. 농림축산검역본부 — 구조동물 조회 서비스

| 항목 | 내용 |
|------|------|
| 제공기관 | 농림축산식품부 농림축산검역본부 |
| 공공데이터 URL | https://www.data.go.kr/data/15098931/openapi.do |
| Base URL | `http://apis.data.go.kr/1543061/abandonmentPublicService_v2` |
| 인증키 환경변수 | `API_KEY_ABANDONMENT` |
| 수정일 | 2026-01-23 |

**엔드포인트**

| 엔드포인트 | 용도 | 필요 여부 |
|-----------|------|---------|
| `GET /abandonmentPublic_v2` | 구조동물 목록 조회 | ✅ 핵심 |
| `GET /shelter_v2` | 보호소 조회 | ✅ 지도 연동 |
| `GET /sido_v2` | 시도 코드 조회 | 참조용 |
| `GET /sigungu_v2` | 시군구 코드 조회 | 참조용 |
| `GET /kind_v2` | 품종 코드 조회 | 참조용 |

**주요 요청 파라미터**

| 파라미터 | 필수여부 | 설명 |
|---------|---------|------|
| `serviceKey` | 필수 | `.env`의 `API_KEY_ABANDONMENT` 사용 |
| `bgnde` / `endde` | 필터 | 구조날짜 범위 (YYYYMMDD) |
| `upkind` | 필터 | 개(417000), 고양이(422400) |
| `state` | 필터 | 공고중(notice), 보호중(protect) |
| `_type` | 공통 | json 권장 |

**주요 응답 필드**

| API 원본 필드 | 변수명 | 설명 | 지식그래프 역할 |
|-------------|-------|------|--------------|
| `desertionNo` | `DesertionNo` | 유기번호 (URI 생성 키) | 식별자 |
| `kindCd` | `KindCode` | 품종 코드 | 엔티티 (Node) |
| `happenPlace` | `HappenPlace` | 구조 장소 | 속성 |
| `processState` | `ProcessState` | 공고중/보호중/입양 상태 | 속성 |
| `careNm` | `CareNm` | 보호소 이름 | 엔티티 (Node) |
| `careRegNo` | `CareRegNo` | 보호소 등록번호 (보호센터 API JOIN 키) | 식별자 |
| `specialMark` | `SpecialMark` | 개체 특이사항 (비정형 텍스트) | 속성 |
| `popfile1` | `Image` | 동물 사진 URL | 속성 |

**⚠️ 주의사항**
- 코드 마스터 테이블 선 구축 필요: `sido_v2`, `kind_v2` 호출 후 구조동물 데이터 매핑
- 상태값(`processState`)이 매일 변경 → **Incremental Sync** 방식 적용 (`bgupd`/`enupd` 파라미터 활용)
- `popfile` 이미지 → 향후 품종 자동 분류 AI 학습 데이터로 확장 가능

**RDF 설계**
- Class: `ex:AbandonedAnimal`
- URI: `ex:animal/rescue/{desertionNo}`
- Relation: `ex:Animal` → [protectedBy] → `ex:Shelter`
- Relation: `ex:Animal` → [foundAt] → `ex:Location`

---

### 2-8. 농림축산검역본부 — 분실동물 조회 서비스

| 항목 | 내용 |
|------|------|
| 제공기관 | 농림축산식품부 농림축산검역본부 |
| 공공데이터 URL | https://www.data.go.kr/data/15141910/openapi.do |
| Base URL | `http://apis.data.go.kr/1543061/lossInfoService` |
| 인증키 환경변수 | `API_KEY_LOSTPET` |
| 수정일 | 2026-01-23 |

**엔드포인트**

| 엔드포인트 | 용도 | 필요 여부 |
|-----------|------|---------|
| `GET /lossInfo` | 분실동물 목록 조회 | ✅ 핵심 |
| `GET /lossInfoSido` | 시도 조회 | 참조용 |
| `GET /lossInfoSigungu` | 시군구 조회 | 참조용 |
| `GET /lossInfoKind` | 품종 조회 | 참조용 |

**주요 요청 파라미터**

| 파라미터 | 필수여부 | 설명 |
|---------|---------|------|
| `serviceKey` | 필수 | `.env`의 `API_KEY_LOSTPET` 사용 |
| `bgnde` / `ended` | **필수** | 분실날짜 범위 (YYYYMMDD — 시작/종료 모두 필수) |
| `upkind` | 선택 | 개(417000), 고양이(422400) |
| `upr_cd` / `org_cd` | 선택 | 시도/시군구별 필터링 |
| `_type` | 공통 | json 권장 |

**주요 응답 필드**

| API 원본 필드 | 설명 | 지식그래프 역할 |
|-------------|------|--------------|
| `rfidCd` | RFID 번호 (매칭의 핵심 키) | 식별자 |
| `callName` | 동물 이름 | 속성 |
| `happenAddr` | 분실 주소 (지오코딩 필요) | 속성/노드 |
| `happenPlace` | 분실 장소 상세 | 속성 |
| `callTel` | 보호자 연락처 | 속성 |
| `popfile` | 동물 사진 URL | 속성 |
| `specialMark` | 특징 (예: "겁이 많음", "빨간 목줄") | 속성 |

**⚠️ 핵심 전략: 구조동물과 교차 매칭**
- `rfidCd` 일치 → `owl:sameAs`로 즉시 연결 → 보호자에게 알림
- 미일치 시 → 품종코드 + 색상 + 발생 장소 텍스트 유사도 기반 후보군 제시
- `happenAddr` 좌표 변환 후 → 실종 빈발 **핫스팟 분석** 가능

**RDF 설계**
- Class: `ex:LostAnimal`
- Relation: `ex:Owner` → [lost] → `ex:LostAnimal`
- Relation: `ex:LostAnimal` → [matchingCandidate] → `ex:AbandonedAnimal`

---

### 2-9. 농림축산식품부 — 동물보호센터 정보 조회서비스

| 항목 | 내용 |
|------|------|
| 제공기관 | 농림축산식품부 농림축산검역본부 |
| 공공데이터 URL | https://www.data.go.kr/data/15098915/openapi.do |
| Base URL | `http://apis.data.go.kr/1543061/animalShelterSrvc_v2` |
| 인증키 환경변수 | `API_KEY_SHELTER` |
| 수정일 | 2026-01-23 |

**엔드포인트**
```
GET /shelterInfo_v2  # 보호센터 상세 정보 조회
```

**주요 요청 파라미터**

| 파라미터 | 필수여부 | 설명 |
|---------|---------|------|
| `serviceKey` | 필수 | `.env`의 `API_KEY_SHELTER` 사용 |
| `care_reg_no` | 선택 | 특정 센터 상세 조회 |
| `care_nm` | 선택 | 이름 기반 검색 |
| `upr_cd` / `org_cd` | 선택 | 지역별 보호소 목록 |
| `_type` | 공통 | json 권장 |

**주요 응답 필드**

| API 원본 필드 | 변수명 | 설명 | 지식그래프 역할 |
|-------------|-------|------|--------------|
| `careRegNo` | `CareRegNo` | 보호센터 등록번호 (JOIN 키) | 식별자 |
| `careNm` | `CareNm` | 동물보호센터 명칭 | 엔티티 (Node) |
| `divisionNm` | `DivisionNm` | 구분 (공영/민간) | 속성 |
| `saveTrgtAnimal` | `SaveTrgtAnimal` | 보호 대상 동물 | 속성 |
| `careTel` | `CareTel` | 전화번호 | 속성 |
| `lat` / `lng` | `lat` / `lng` | WGS84 좌표 ✅ 즉시 사용 가능 | 속성 |
| `weekOprStime` / `weekOprEtime` | `WeekOpr` | 평일 운영 시작/종료 시간 | 속성 |
| `weekendOprStime` / `weekendOprEtime` | `WeekendOpr` | 주말 운영 시간 | 속성 |
| `closeDay` | `CloseDay` | 휴무일 | 속성 |
| `vetPersonCnt` | `VetPersonCnt` | 수의사 수 (의료 역량 지표) | 속성 |
| `medicalCnt` | `MedicalCnt` | 진료실 수 | 속성 |
| `breedCnt` | `BreedCnt` | 보호 가능 마릿수 | 속성 |
| `transCarCnt` | `TransCarCnt` | 구조 차량 수 | 속성 |

**⚠️ 주의사항**
- `careRegNo`로 구조동물 API와 **Relational JOIN** 가능
- `vetPersonCnt` + `medicalCnt`로 **의료 역량 우수 보호소** 가중치 부여 가능

**RDF 설계**
- Class: `ex:AnimalShelter`
- URI: `ex:facility/shelter/{careRegNo}`
- Relation: `ex:AnimalShelter` → [manages] → `ex:AbandonedAnimal`

---

### 2-10. 국가동물보호정보시스템 — 입양 정보

| 항목 | 내용 |
|------|------|
| 제공기관 | 농림축산식품부 |
| 인증키 환경변수 | `API_KEY_ADOPTION` |
| 비고 | ⚠️ 다른 API들과 **별도 인증키** 사용 |

**주요 필드**

| API 원본 필드 | 변수명 | 설명 | 지식그래프 역할 |
|-------------|-------|------|--------------|
| `ANIMAL_NO` | `AnimalNo` | 동물 고유 식별 PK | 식별자 |
| `ANIMAL_BREED` | `AnimalBreed` | 품종명 (의료정보 매핑 핵심) | 엔티티 (Node) |
| `ANIMAL_BIRTH` | `AnimalBirth` | 출생 연도 | 속성 |
| `ANIMAL_SEX` | `AnimalSex` | 성별 (M/F) | 속성 |
| `ADOPT_STATUS` | `AdoptStatus` | 입양 가능 / 보호중 / 종료 | 속성 |
| `MOVIE_URL` | `MovieUrl` | 소개 영상 (YouTube URL) | 속성 |

---

### 2-11. 한국과학기술정보연구원(KISTI) — 동물질병 증상분류

| 항목 | 내용 |
|------|------|
| 제공기관 | 한국과학기술정보연구원 |
| 공공데이터 URL | https://www.data.go.kr/data/15050441/fileData.do |
| Base URL | `https://api.odcloud.kr/api` |
| 인증키 환경변수 | `API_KEY_KISTI` |
| 전체 데이터 건수 | 516건 |
| 수정일 | 2022-09-16 (1회성 정적 참조 테이블) |

**엔드포인트**
```
GET /15050441/v1/uddi:cc7486db-c496-4497-8ade-e75a7b463406  # 최신 데이터
GET /15050441/v1/uddi:4f72100d-7353-4678-942e-9c8b771aee39  # 구버전
```

**주요 요청 파라미터**

| 파라미터 | 필수여부 | 설명 |
|---------|---------|------|
| `serviceKey` | 필수 | `.env`의 `API_KEY_KISTI` 사용 |
| `page` / `perPage` | 페이징 | 기본값: 1 / 10 |
| `returnType` | 선택 | JSON(기본값) / XML |

**주요 응답 필드**

| 필드명 | 설명 | 지식그래프 역할 |
|-------|------|--------------|
| `증상코드` | 증상 고유 식별자 (URI 생성 기반) | 식별자 |
| `증상분류 한글` | 소화기계, 피부계 등 상위 분류 | 분류 노드 |
| `증상분류 영어` | 영문 상위 분류 (국제 온톨로지 연계용) | 다국어 레이블 |
| `증상목록코드` | 질병-증상 조인 외래키 | 관계 매핑 키 |
| `증상명` | 실제 증상 명칭 | 속성 |

**⚠️ 주의사항**
- 실시간 갱신 없음 → **1회 수집 후 지식그래프 고정 노드**로 적재
- "구토" vs "구역질" 등 중복 표현 → **정규화(Normalization) 필수**
- `증상분류 영어`로 국제 수의학 온톨로지(SNOMED-CT Veterinary)와 매핑 가능

**RDF 설계**
- Class: `ex:Symptom`, `ex:SymptomCategory`
- URI: `ex:medical/symptom/{증상코드}`
- Relation: `ex:Symptom` → [belongsTo] → `ex:SymptomCategory`
- Relation: `ex:Disease` → [hasSymptom] → `ex:Symptom`

---

### 2-12. 농림축산검역본부 — 동물 질병 정보

| 항목 | 내용 |
|------|------|
| 제공기관 | 농림축산식품부 농림축산검역본부 |
| 공공데이터 URL | https://www.data.go.kr/data/15103008/fileData.do |
| 형식 | **CSV 파일 직접 다운로드** (API 없음) |
| 인증키 | 불필요 |
| 전체 건수 | 117건 |
| 수정일 | 2025-09-17 (1회성 정적 데이터) |

**주요 컬럼 (CSV)**

| 컬럼명 | 설명 | 지식그래프 역할 |
|-------|------|--------------|
| `DISS_NM` (질병명) | 동물 질병 고유 명칭 | 엔티티 (Node) |
| `ENG_DISS_NM` | 질병명 영문 | 속성 |
| `병원체` | 질병 유발 병원체명 | 속성 |
| `CAUSE_CMMN_CL` (발생원인) | 바이러스/세균/기생충 구분 | 분류 속성 |
| `항원` | 면역 반응 유발 물질 | 속성 |
| `감염경로` | 전파 방식 | 관계 속성 |
| `MAIN_INFC_ANIMAL` | 주요 감염 동물 (개, 고양이 등) | 속성 |

**⚠️ 주의사항**
- API가 아닌 **CSV 다운로드** 방식 → 자동 수집 시 URL 기반 정기 다운로드 스크립트 필요
- 병원체명·질병명 한영 혼용, 오탈자 정제 필요
- `발생원인` 값 표준화 필요 ("바이러스" / "virus" / "Virus" 혼재 가능성)

**RDF 설계**
- Class: `ex:Disease`, `ex:Pathogen`, `ex:InfectionRoute`
- URI: `ex:medical/disease/{질병명_slug}`
- Relation: `ex:Disease` → [causedBy] → `ex:Pathogen`
- Relation: `ex:Disease` → [hasSymptom] → `ex:Symptom` *(KISTI 증상분류 연계)*

---

### 2-13. 한국문화정보원 — 전국 반려동물 동반 가능 문화시설

| 항목 | 내용 |
|------|------|
| 제공기관 | 한국문화정보원 |
| 공공데이터 URL | https://www.data.go.kr/data/15111389/fileData.do |
| Base URL | `https://api.odcloud.kr/api` |
| Swagger URL | https://infuser.odcloud.kr/oas/docs?namespace=15111389/v1 |
| 인증키 환경변수 | `API_KEY_CULTURE` |
| 데이터 규모 | 약 70,650행 (대규모) |

**주요 컬럼**

| 컬럼명 | 설명 | 지식그래프 역할 |
|-------|------|--------------|
| `시설명` | 문화시설 명칭 | 엔티티 (Node) |
| `카테고리` | 미술관·박물관·카페 등 분류 | 엔티티 (Node) |
| `위도` / `경도` | WGS84 좌표 ✅ 즉시 사용 가능 | 속성 |
| `반려동물 동반 가능 여부` | Boolean | 속성 |
| `반려동물 전용 정보` | 전용 시설/서비스 정보 | 속성 |
| `최종작성일` | 데이터 신뢰도 판단 지표 | 속성 |

**⚠️ 주의사항**
- **휴먼에러** 가능성 명시 → 데이터 정제(Cleaning) 단계 필수
- 7만 건 이상 → **배치(Batch) 처리 + 벌크 업로드** 전략 필요
- 관광공사 API와 중복 가능성 높음 → 시설명 + 좌표 10m 이내 동일 시설 판단 후 **엔티티 해상도(Entity Resolution)** 적용

**RDF 설계**
- Class: `ex:CulturalFacility`
- SubClass: `ex:Museum`, `ex:Gallery`, `ex:PetCafe`
- Relation: `ex:Facility` → [providesService] → `ex:PetMenu` / `ex:PetZone`

---

### 2-14. 한국도로공사 — 휴게소 반려동물 편의시설(놀이터) 현황

| 항목 | 내용 |
|------|------|
| 제공기관 | 한국도로공사 |
| 공공데이터 URL | https://www.data.go.kr/data/15064250/fileData.do |
| Base URL | `https://api.odcloud.kr/api` |
| 인증키 환경변수 | `API_KEY_EXPRESSWAY` |
| 수정일 | 2025-07-24 |

**엔드포인트**
```
GET /15064250/v1/uddi:d83eaf9c-67dc-4f83-8021-ed01a5bc67b9
```

**주요 요청 파라미터**

| 파라미터 | 필수여부 | 설명 |
|---------|---------|------|
| `serviceKey` | 필수 | `.env`의 `API_KEY_EXPRESSWAY` 사용 |
| `page` / `perPage` | 선택 | 기본값: 1 / 10 |
| `returnType` | 선택 | JSON/XML |

**주요 응답 필드**

| 필드명 | 설명 | 지식그래프 역할 |
|-------|------|--------------|
| `휴게소명` | 노드 생성 기준 키 | 식별자 |
| `종류` | 시설 종류 (놀이터 등) | 속성 |
| `위치` | 휴게소 내 구체적 위치 | 속성 |
| `운영시간` | 24시간 또는 특정 시간대 | 속성 |
| `휴장일` | 정기 휴무 정보 | 속성 |
| `설치연도` | 시설 노후도/신규성 판단 | 속성 |
| `비고` | 특이사항 | 속성 |

**⚠️ 주의사항**
- **위도/경도 미제공** → `휴게소명` 기반 카카오/T-map API 지오코딩(Geocoding) 후 WGS84 좌표 생성 필요
- 경로 기반 서비스 설계: `고속도로 노선` → [contains] → `휴게소` → [hasFacility] → `놀이터`

---

## 🌐 3. 좌표계 통합 현황

| 데이터 출처 | 원본 좌표계 | 변환 여부 | 변환 도구 |
|-----------|-----------|---------|---------|
| 행정안전부 5종 (병원·약국·미용·위탁·장묘) | Bessel TM (EPSG:5174) | ✅ WGS84 변환 필수 | pyproj |
| 한국관광공사 반려동물 동반여행 | WGS84 (EPSG:4326) | ❌ 불필요 | — |
| 농림축산검역본부 구조동물·분실동물 | WGS84 (EPSG:4326) | ❌ 불필요 | — |
| 농림축산식품부 동물보호센터 | WGS84 (EPSG:4326) | ❌ 불필요 | — |
| 한국문화정보원 동반가능 문화시설 | WGS84 (EPSG:4326) | ❌ 불필요 | — |
| 한국도로공사 휴게소 | **좌표 미제공** | ✅ 지오코딩 필요 | 카카오/T-map API |

---

## 📋 4. 노션 문서 작성 규칙

### 4-1. 파일명 컨벤션
```
{제공기관}_{서비스명}_API_명세_및_설계_노션_정리본
```
예시: `행정안전부_동물병원조회서비스_API_관련_노션_정리본`

### 4-2. 데이터 파일명 컨벤션
```
{데이터유형}_{원본/구조화}데이터({YYYYMMDD}, {이름}).{확장자}
```
예시: `편의시설_원본데이터(20260210, Young).csv`

### 4-3. API 문서 필수 섹션 구조

모든 API 노션 정리 문서는 아래 섹션을 반드시 포함:

```
0) 한 줄 정의
1) API 메타
2) 요청 파라미터
3) 응답 구조 및 지식그래프 매핑
4) 기술 구현 가이드 (교수님 보고용)
🛠 RDF 지식그래프 설계
```

### 4-4. 지식그래프 역할 분류 기준

| 역할 | 의미 | 표기 |
|-----|------|------|
| 엔티티 (Node) | 그래프의 노드가 되는 개체 | `엔티티 (Node)` |
| 속성 (Property) | 노드의 속성값 | `속성 (Property)` |
| 식별자 (ID) | URI 생성의 키 | `식별자 (ID)` |

### 4-5. Schema.org 매핑 어휘 기준

| 대상 | Schema.org |
|-----|-----------|
| 시설명·동물명 | `schema:name` |
| 고유 ID | `schema:identifier` |
| 도로명 주소 | `schema:streetAddress` |
| 위도 | `schema:latitude` |
| 경도 | `schema:longitude` |
| 전화번호 | `schema:telephone` |
| 운영시간 | `schema:openingHours` |
| 시설 분류 | `schema:category` |
| 최종 수정일 | `schema:dateModified` |
| 인허가일 | `schema:foundingDate` |
| 폐업일 | `schema:dissolutionDate` |
| 커스텀 어휘 | `koah:` 접두사 |

---

## 🔄 5. 데이터 업데이트 주기

| 데이터 | 주기 | 동기화 전략 |
|-------|------|-----------|
| 구조동물 | 매일 | `bgupd`/`enupd` 파라미터로 Incremental Sync |
| 분실동물 | 매일 | 날짜 범위 필터 재조회 |
| 행안부 5종 | 주간 | `DAT_UPDT_SE=U` 필터 또는 전체 재수집 |
| 관광공사 동반여행 | 월간 | `petTourSyncList2` 엔드포인트 활용 |
| KISTI 증상분류 | 수시(1회성) | 수정일 모니터링 후 수동 업데이트 |
| 검역본부 동물질병 | 수시(1회성) | 수정일 모니터링 후 수동 업데이트 |
| 한국문화정보원 | 수시 | 최신 보완일(2025-03) 기준 Overwrite |
| 한국도로공사 | 연간 | 최신 Endpoint 확인 후 재수집 |

---

> 📌 이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.
> 최종 수정: 2026-03-05 | 7조 — 애니멀루(Animallou)
