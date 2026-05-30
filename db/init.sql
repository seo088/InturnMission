CREATE TABLE IF NOT EXISTS facilities (
    id          SERIAL PRIMARY KEY,
    type        VARCHAR(20) NOT NULL,
    name        VARCHAR(200),
    manage_no   VARCHAR(100) UNIQUE,
    status      VARCHAR(50),
    road_addr   VARCHAR(300),
    sido        VARCHAR(50),
    sigungu     VARCHAR(50),
    lat         DOUBLE PRECISION,
    lon         DOUBLE PRECISION,
    phone       VARCHAR(30),
    floor_area  DOUBLE PRECISION,
    license_dt  DATE,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS animals (
    id             SERIAL PRIMARY KEY,
    type           VARCHAR(20) NOT NULL,
    rfid_cd        VARCHAR(100),
    care_reg_no    VARCHAR(100),
    dog_reg_no     VARCHAR(100),
    name           VARCHAR(100),
    kind_nm        VARCHAR(100),
    up_kind_cd     VARCHAR(20),
    process_state  VARCHAR(50),
    happen_place   VARCHAR(200),
    neuter_yn      CHAR(1),
    sex_cd         CHAR(1),
    age            VARCHAR(20),
    weight         VARCHAR(20),
    lat            DOUBLE PRECISION,
    lon            DOUBLE PRECISION,
    thumbnail      TEXT,
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shelters (
    care_reg_no    VARCHAR(100) PRIMARY KEY,
    name           VARCHAR(200),
    division_nm    VARCHAR(50),
    lat            DOUBLE PRECISION,
    lon            DOUBLE PRECISION,
    vet_count      INTEGER DEFAULT 0,
    breed_cnt      INTEGER DEFAULT 0,
    sido           VARCHAR(50),
    sigungu        VARCHAR(50),
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS travel_spots (
    content_id     VARCHAR(50) PRIMARY KEY,
    title          VARCHAR(300),
    pet_allowed    VARCHAR(300),
    addr           VARCHAR(300),
    lat            DOUBLE PRECISION,
    lon            DOUBLE PRECISION,
    cat1           VARCHAR(10),
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diseases (
    id              SERIAL PRIMARY KEY,
    symptom_code    VARCHAR(50) UNIQUE,
    category_ko     VARCHAR(100),
    symptom_name    VARCHAR(200),
    disease_name_ko VARCHAR(200),
    cause_category  VARCHAR(100),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quality_metrics (
    id           SERIAL PRIMARY KEY,
    metric_name  VARCHAR(100) NOT NULL,
    value        DOUBLE PRECISION NOT NULL,
    warning_msg  TEXT,
    measured_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO quality_metrics (metric_name, value, warning_msg) VALUES
('좌표 보유율 (lat/lon)',      94.2, '⚠ CRD_INFO_X/Y → WGS84 변환 필요 (행안부 4종)'),
('도로명 주소 (ROAD_NM_ADDR)', 98.7, NULL),
('최종수정일 (DAT_UPDT_PNT)', 81.3, NULL),
('시계열 완전성',              67.8, '⚠ CSV 3종 시점 정보 부족'),
('RFID 매핑 정합성 (rfidCd)', 91.5, NULL)
ON CONFLICT DO NOTHING;
