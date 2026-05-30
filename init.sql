-- ============================================================
-- 반려동물 통합 지식그래프 — DB 초기화 스크립트
-- PostgreSQL 16.x
-- ============================================================

-- 1. 의료·케어 시설 (행안부 3종: 동물병원·약국·미용업)
CREATE TABLE IF NOT EXISTS facilities (
    id          SERIAL PRIMARY KEY,
    type        VARCHAR(20) NOT NULL CHECK (type IN ('hospital', 'pharmacy', 'grooming')),
    name        VARCHAR(200),           -- BPLC_NM → schema:name
    manage_no   VARCHAR(100) UNIQUE,    -- MNG_NO  → schema:identifier
    status      VARCHAR(50),            -- SALS_STTS_NM
    road_addr   VARCHAR(300),           -- ROAD_NM_ADDR → schema:streetAddress
    sido        VARCHAR(50),
    sigungu     VARCHAR(50),
    lat         DOUBLE PRECISION,       -- CRD_INFO_Y (TM→WGS84 변환 후)
    lon         DOUBLE PRECISION,       -- CRD_INFO_X (TM→WGS84 변환 후)
    phone       VARCHAR(30),
    floor_area  DOUBLE PRECISION,       -- LCTN_AREA → schema:floorSize
    license_dt  DATE,                   -- LCPMT_YMD → schema:foundingDate
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 동물 (구조·분실·등록 통합)
CREATE TABLE IF NOT EXISTS animals (
    id             SERIAL PRIMARY KEY,
    type           VARCHAR(20) NOT NULL CHECK (type IN ('rescue', 'lost', 'registered')),
    rfid_cd        VARCHAR(100),        -- owl:sameAs 핵심 JOIN 키
    care_reg_no    VARCHAR(100),        -- schema:containedInPlace JOIN 키
    dog_reg_no     VARCHAR(100),
    name           VARCHAR(100),        -- dogNm → schema:name
    kind_nm        VARCHAR(100),        -- kindNm → skos:Concept
    up_kind_cd     VARCHAR(20),         -- upKindCd → skos:broader
    process_state  VARCHAR(50),         -- processState → schema:additionalProperty
    happen_place   VARCHAR(200),        -- happenPlace → schema:location
    color_cd       VARCHAR(50),
    age            VARCHAR(20),
    weight         VARCHAR(20),
    neuter_yn      CHAR(1),
    sex_cd         CHAR(1),
    lat            DOUBLE PRECISION,
    lon            DOUBLE PRECISION,
    thumbnail      TEXT,
    notice_sdt     DATE,
    notice_edt     DATE,
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 동물보호센터
CREATE TABLE IF NOT EXISTS shelters (
    care_reg_no    VARCHAR(100) PRIMARY KEY,  -- careRegNo JOIN 키
    name           VARCHAR(200),              -- careNm → schema:name
    division_nm    VARCHAR(50),               -- divisionNm: 공영/민간
    lat            DOUBLE PRECISION,          -- ✅ WGS84 직접 사용
    lon            DOUBLE PRECISION,
    vet_count      INTEGER DEFAULT 0,         -- vetPersonCnt
    breed_cnt      INTEGER DEFAULT 0,         -- breedCnt
    quarantine_cnt INTEGER DEFAULT 0,         -- quarabtineCnt
    week_opr_stime VARCHAR(10),
    week_opr_etime VARCHAR(10),
    close_day      VARCHAR(100),
    tel            VARCHAR(30),
    sido           VARCHAR(50),
    sigungu        VARCHAR(50),
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 동반여행·문화시설 (관광공사 TourAPI)
CREATE TABLE IF NOT EXISTS travel_spots (
    content_id     VARCHAR(50) PRIMARY KEY,   -- contentid JOIN 키
    title          VARCHAR(300),              -- title → schema:name
    pet_allowed    VARCHAR(300),              -- acmpyPsblCpam
    pet_requirement VARCHAR(300),             -- acmpyNeedMtr
    pet_facility   VARCHAR(300),              -- relaPosesFclty
    addr           VARCHAR(300),
    lat            DOUBLE PRECISION,          -- mapy → geo:lat ✅
    lon            DOUBLE PRECISION,          -- mapx → geo:long ✅
    cat1           VARCHAR(10),
    cat2           VARCHAR(10),
    cat3           VARCHAR(10),
    content_type   VARCHAR(50),
    first_image    TEXT,
    modified_time  TIMESTAMP WITH TIME ZONE,
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. KISTI 질병·증상 분류
CREATE TABLE IF NOT EXISTS diseases (
    id             SERIAL PRIMARY KEY,
    symptom_code   VARCHAR(50) UNIQUE,        -- 증상코드 → schema:identifier
    category_ko    VARCHAR(100),              -- 증상분류 한글 → skos:broader
    category_en    VARCHAR(100),              -- 증상분류 영어 → skos:broader
    symptom_name   VARCHAR(200),              -- 증상명 → skos:prefLabel
    disease_no     INTEGER,                   -- DISS_NO → schema:identifier
    disease_name_ko VARCHAR(200),             -- DISS_NM → skos:prefLabel
    disease_name_en VARCHAR(200),             -- ENG_DISS_NM → skos:altLabel
    cause_category VARCHAR(100),              -- CAUSE_CMMN_CL → skos:Concept
    main_animal    VARCHAR(100),              -- MAIN_INFC_ANIMAL
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 데이터 품질 로그 (품질 대시보드용)
CREATE TABLE IF NOT EXISTS quality_metrics (
    id             SERIAL PRIMARY KEY,
    metric_name    VARCHAR(100) NOT NULL,
    value          DOUBLE PRECISION NOT NULL,
    warning_msg    TEXT,
    measured_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 (쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_facilities_type      ON facilities(type);
CREATE INDEX IF NOT EXISTS idx_facilities_sido      ON facilities(sido);
CREATE INDEX IF NOT EXISTS idx_facilities_geo       ON facilities(lat, lon);
CREATE INDEX IF NOT EXISTS idx_animals_type         ON animals(type);
CREATE INDEX IF NOT EXISTS idx_animals_rfid         ON animals(rfid_cd);
CREATE INDEX IF NOT EXISTS idx_animals_care_reg     ON animals(care_reg_no);
CREATE INDEX IF NOT EXISTS idx_shelters_geo         ON shelters(lat, lon);
CREATE INDEX IF NOT EXISTS idx_travel_geo           ON travel_spots(lat, lon);

-- 초기 품질 지표 데이터
INSERT INTO quality_metrics (metric_name, value, warning_msg) VALUES
('좌표 보유율 (lat/lon)',      94.2, '⚠ CRD_INFO_X/Y → WGS84 변환 필요 (행안부 4종)'),
('도로명 주소 (ROAD_NM_ADDR)', 98.7, NULL),
('최종수정일 (DAT_UPDT_PNT)', 81.3, NULL),
('시계열 완전성',              67.8, '⚠ CSV 3종 (KISTI·문화정보원·도로공사) 시점 정보 부족'),
('RFID 매핑 정합성 (rfidCd)', 91.5, NULL)
ON CONFLICT DO NOTHING;
