"""
애니멀루 CSV → RDF Turtle 변환 스크립트
=========================================
대상 파일 (11개):
  01_동물병원 / 02_동물약국 / 03_동물미용업 / 04_동물위탁관리업 / 05_동물장묘업
  09_분실동물 / 10_동물보호센터 / 11_문화시설 / 12_휴게소
  13_동물질병증상 / 15_동물질병

실행: python3 csv_to_turtle.py
출력: turtle/ 폴더에 각 .ttl 파일 + animalloo_all.ttl (통합본)

필요 패키지: pip install pandas
"""

import pandas as pd
import re
import os

# ── 경로 설정 ──────────────────────────────────────────────────────────────
DATA_DIR   = "/home/hong/petgraph/preprocessed_data"   # 전처리 완료 CSV 폴더 경로
OUTPUT_DIR = "/home/hong/petgraph/turtle"      # .ttl 출력 폴더

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── 네임스페이스 prefix ────────────────────────────────────────────────────
PREFIXES = """\
@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .
@prefix schema: <https://schema.org/> .
@prefix ex:     <http://animalloo.kr/ontology#> .

"""

BASE = "http://animalloo.kr/ontology"


# ── 유틸 함수 ──────────────────────────────────────────────────────────────
def safe(v) -> bool:
    """값이 유효한지 확인 (NaN / None / 빈 문자열 제외)"""
    if v is None:
        return False
    if isinstance(v, float) and (v != v):   # NaN 체크
        return False
    return str(v).strip() != ""


def esc(v: str) -> str:
    """Turtle 문자열 이스케이프"""
    return str(v).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "")


def slug(v: str) -> str:
    """URI 슬러그 생성: 공백·특수문자 → 언더스코어"""
    return re.sub(r"[^\w가-힣]", "_", str(v).strip())


def lit(v, dtype: str = None) -> str:
    """Turtle 리터럴 생성"""
    if dtype:
        return f'"{esc(v)}"^^{dtype}'
    return f'"{esc(v)}"'


def uri(path: str) -> str:
    return f"<{BASE}/{path}>"


def region_uri(sido: str, sigungu: str) -> str:
    key = slug(f"{sido}_{sigungu}")
    return uri(f"region/{key}")


def write_ttl(fname: str, triples: list[str]):
    path = os.path.join(OUTPUT_DIR, fname)
    with open(path, "w", encoding="utf-8") as f:
        f.write(PREFIXES)
        f.write("\n".join(triples))
        f.write("\n")
    print(f"  💾 {fname}  ({len([t for t in triples if t.startswith('<')])}개 엔티티)")
    return path


# ── Region 노드 수집 (전 파일 공통) ───────────────────────────────────────
REGIONS: dict[str, tuple[str, str]] = {}   # region_key → (sido, sigungu)


def collect_region(sido, sigungu):
    if safe(sido) and safe(sigungu):
        key = f"{sido}_{sigungu}"
        REGIONS[key] = (str(sido).strip(), str(sigungu).strip())


# ══════════════════════════════════════════════════════════════════════════
# 01. 동물병원
# ══════════════════════════════════════════════════════════════════════════
def convert_hospital():
    df = pd.read_csv(f"{DATA_DIR}/01_hospital.csv", encoding="utf-8-sig")
    df = df[df["coord_status"] != "missing_coord"]
    triples = []

    for _, r in df.iterrows():
        uid  = uri(f"facility/hospital/{int(r['Facility_ID'])}")
        collect_region(r.get("Sido"), r.get("Sigungu"))

        t = [f"{uid}"]
        t.append(f'  a ex:AnimalHospital, schema:VeterinaryCare ;')
        t.append(f'  schema:name {lit(r["Name"])} ;')
        if safe(r.get("RoadAddress")):
            t.append(f'  schema:address {lit(r["RoadAddress"])} ;')
        if safe(r.get("PhoneNumber")):
            t.append(f'  schema:telephone {lit(r["PhoneNumber"])} ;')
        if safe(r.get("lat")) and safe(r.get("lon")):
            t.append(f'  ex:latitude {float(r["lat"]):.6f} ;')
            t.append(f'  ex:longitude {float(r["lon"]):.6f} ;')
        if safe(r.get("LicenseDate")):
            t.append(f'  ex:licensedDate {lit(r["LicenseDate"], "xsd:date")} ;')
        if safe(r.get("Sido")) and safe(r.get("Sigungu")):
            t.append(f'  ex:locatedIn {region_uri(r["Sido"], r["Sigungu"])} ;')
        t.append(f'  ex:coord_status {lit(r["coord_status"])} .')
        triples.append("\n".join(t))

    return write_ttl("01_hospital.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# 02. 동물약국
# ══════════════════════════════════════════════════════════════════════════
def convert_pharmacy():
    df = pd.read_csv(f"{DATA_DIR}/02_pharmacy.csv", encoding="utf-8-sig")
    df = df[df["coord_status"] != "missing_coord"]
    triples = []

    for _, r in df.iterrows():
        uid = uri(f"facility/pharmacy/{int(r['Facility_ID'])}")
        collect_region(r.get("Sido"), r.get("Sigungu"))

        t = [f"{uid}"]
        t.append(f'  a ex:AnimalPharmacy, schema:Pharmacy ;')
        t.append(f'  schema:name {lit(r["Name"])} ;')
        if safe(r.get("RoadAddress")):
            t.append(f'  schema:address {lit(r["RoadAddress"])} ;')
        if safe(r.get("PhoneNumber")):
            t.append(f'  schema:telephone {lit(r["PhoneNumber"])} ;')
        if safe(r.get("lat")) and safe(r.get("lon")):
            t.append(f'  ex:latitude {float(r["lat"]):.6f} ;')
            t.append(f'  ex:longitude {float(r["lon"]):.6f} ;')
        if safe(r.get("Sido")) and safe(r.get("Sigungu")):
            t.append(f'  ex:locatedIn {region_uri(r["Sido"], r["Sigungu"])} ;')
        t.append(f'  ex:coord_status {lit(r["coord_status"])} .')
        triples.append("\n".join(t))

    return write_ttl("02_pharmacy.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# 03. 동물미용업
# ══════════════════════════════════════════════════════════════════════════
def convert_grooming():
    df = pd.read_csv(f"{DATA_DIR}/03_grooming.csv", encoding="utf-8-sig")
    df = df[df["coord_status"] != "missing_coord"]
    triples = []

    for _, r in df.iterrows():
        uid = uri(f"facility/grooming/{int(r['Facility_ID'])}")
        collect_region(r.get("Sido"), r.get("Sigungu"))

        t = [f"{uid}"]
        t.append(f'  a ex:PetGroomingShop ;')
        t.append(f'  schema:name {lit(r["Name"])} ;')
        if safe(r.get("RoadAddress")):
            t.append(f'  schema:address {lit(r["RoadAddress"])} ;')
        if safe(r.get("PhoneNumber")):
            t.append(f'  schema:telephone {lit(r["PhoneNumber"])} ;')
        if safe(r.get("lat")) and safe(r.get("lon")):
            t.append(f'  ex:latitude {float(r["lat"]):.6f} ;')
            t.append(f'  ex:longitude {float(r["lon"]):.6f} ;')
        if safe(r.get("LocationArea")) and float(r["LocationArea"]) > 0:
            t.append(f'  ex:facilityArea {float(r["LocationArea"])} ;')
        if safe(r.get("Sido")) and safe(r.get("Sigungu")):
            t.append(f'  ex:locatedIn {region_uri(r["Sido"], r["Sigungu"])} ;')
        t.append(f'  ex:coord_status {lit(r["coord_status"])} .')
        triples.append("\n".join(t))

    return write_ttl("03_grooming.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# 04. 동물위탁관리업
# ══════════════════════════════════════════════════════════════════════════
BOARDING_CLASS = {
    "호텔": "ex:PetBoardingHotel",
    "유치원": "ex:PetKindergarten",
    "훈련": "ex:PetTrainingCenter",
}

def boarding_class(name: str) -> str:
    for k, v in BOARDING_CLASS.items():
        if k in str(name):
            return v
    return "ex:AnimalBoarding"


def convert_boarding():
    df = pd.read_csv(f"{DATA_DIR}/04_boarding.csv", encoding="utf-8-sig")
    df = df[df["coord_status"] != "missing_coord"]
    triples = []

    for _, r in df.iterrows():
        uid = uri(f"facility/boarding/{int(r['Facility_ID'])}")
        collect_region(r.get("Sido"), r.get("Sigungu"))
        cls = boarding_class(r["Name"])

        t = [f"{uid}"]
        t.append(f'  a {cls}, ex:AnimalBoarding ;')
        t.append(f'  schema:name {lit(r["Name"])} ;')
        if safe(r.get("RoadAddress")):
            t.append(f'  schema:address {lit(r["RoadAddress"])} ;')
        if safe(r.get("PhoneNumber")):
            t.append(f'  schema:telephone {lit(r["PhoneNumber"])} ;')
        if safe(r.get("lat")) and safe(r.get("lon")):
            t.append(f'  ex:latitude {float(r["lat"]):.6f} ;')
            t.append(f'  ex:longitude {float(r["lon"]):.6f} ;')
        if safe(r.get("Sido")) and safe(r.get("Sigungu")):
            t.append(f'  ex:locatedIn {region_uri(r["Sido"], r["Sigungu"])} ;')
        t.append(f'  ex:coord_status {lit(r["coord_status"])} .')
        triples.append("\n".join(t))

    return write_ttl("04_boarding.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# 05. 동물장묘업
# ══════════════════════════════════════════════════════════════════════════
def convert_cremation():
    df = pd.read_csv(f"{DATA_DIR}/05_cremation.csv", encoding="utf-8-sig")
    df = df[df["coord_status"] != "missing_coord"]
    triples = []

    for _, r in df.iterrows():
        uid = uri(f"facility/cremation/{int(r['Facility_ID'])}")
        collect_region(r.get("Sido"), r.get("Sigungu"))

        t = [f"{uid}"]
        t.append(f'  a ex:AnimalCremation, schema:FuneralService ;')
        t.append(f'  schema:name {lit(r["Name"])} ;')
        if safe(r.get("RoadAddress")):
            t.append(f'  schema:address {lit(r["RoadAddress"])} ;')
        if safe(r.get("PhoneNumber")):
            t.append(f'  schema:telephone {lit(r["PhoneNumber"])} ;')
        if safe(r.get("lat")) and safe(r.get("lon")):
            t.append(f'  ex:latitude {float(r["lat"]):.6f} ;')
            t.append(f'  ex:longitude {float(r["lon"]):.6f} ;')
        if safe(r.get("Sido")) and safe(r.get("Sigungu")):
            t.append(f'  ex:locatedIn {region_uri(r["Sido"], r["Sigungu"])} ;')
        t.append(f'  ex:coord_status {lit(r["coord_status"])} .')
        triples.append("\n".join(t))

    return write_ttl("05_cremation.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# 09. 분실동물
# ══════════════════════════════════════════════════════════════════════════
def convert_lost_animal():
    df = pd.read_csv(f"{DATA_DIR}/09_lost_animal.csv", encoding="utf-8-sig")
    triples = []

    for idx, r in df.iterrows():
        uid = uri(f"animal/lost/{idx}")
        collect_region(r.get("Sido"), r.get("Sigungu"))

        t = [f"{uid}"]
        t.append(f'  a ex:LostAnimal ;')
        if safe(r.get("CallName")):
            t.append(f'  ex:callName {lit(r["CallName"])} ;')
        if safe(r.get("KindCode")):
            t.append(f'  ex:animalBreed {lit(r["KindCode"])} ;')
        if safe(r.get("ColorCode")):
            t.append(f'  ex:colorCode {lit(r["ColorCode"])} ;')
        if safe(r.get("SexCode")):
            t.append(f'  schema:gender {lit(r["SexCode"])} ;')
        if safe(r.get("Age")):
            t.append(f'  schema:age {lit(r["Age"])} ;')
        if safe(r.get("HappenAddr")):
            t.append(f'  ex:lostAddress {lit(r["HappenAddr"])} ;')
        if safe(r.get("HappenDate")):
            t.append(f'  ex:happenDate {lit(r["HappenDate"])} ;')
        if safe(r.get("SpecialMark")):
            t.append(f'  ex:specialMark {lit(r["SpecialMark"])} ;')
        if safe(r.get("Image")):
            t.append(f'  ex:imageUrl {lit(r["Image"])} ;')
        if safe(r.get("CallTel")):
            t.append(f'  ex:ownerContact {lit(r["CallTel"])} ;')
        if safe(r.get("RfidCode")):
            t.append(f'  ex:rfidCode {lit(str(r["RfidCode"]))} ;')
        if safe(r.get("matching_grade")):
            t.append(f'  ex:matchingGrade {lit(r["matching_grade"])} ;')
        if safe(r.get("Sido")) and safe(r.get("Sigungu")):
            t.append(f'  ex:lostAt {region_uri(r["Sido"], r["Sigungu"])} ;')
        t.append(f'  ex:matchCompositeKey {lit(r.get("match_composite_key", ""))} .')
        triples.append("\n".join(t))

    return write_ttl("09_lost_animal.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# 10. 동물보호센터
# ══════════════════════════════════════════════════════════════════════════
def convert_shelter():
    df = pd.read_csv(f"{DATA_DIR}/10_shelter.csv", encoding="utf-8-sig")
    triples = []

    for _, r in df.iterrows():
        uid = uri(f"facility/shelter/{int(r['CareRegNo'])}")
        collect_region(r.get("Sido"), r.get("Sigungu"))

        t = [f"{uid}"]
        t.append(f'  a ex:AnimalShelter ;')
        t.append(f'  schema:name {lit(r["CareNm"])} ;')
        if safe(r.get("CareAddr")):
            t.append(f'  schema:address {lit(r["CareAddr"])} ;')
        if safe(r.get("CareTel")):
            t.append(f'  schema:telephone {lit(r["CareTel"])} ;')
        if safe(r.get("lat")) and safe(r.get("lon")):
            t.append(f'  ex:latitude {float(r["lat"]):.6f} ;')
            t.append(f'  ex:longitude {float(r["lon"]):.6f} ;')
        if safe(r.get("SaveTrgtAnimal")):
            t.append(f'  ex:savesAnimalType {lit(r["SaveTrgtAnimal"])} ;')
        if safe(r.get("VetPersonCnt")):
            t.append(f'  ex:vetPersonCnt {int(r["VetPersonCnt"])} ;')
        if safe(r.get("OrgNm")):
            t.append(f'  ex:orgName {lit(r["OrgNm"])} ;')
        if safe(r.get("WeekOprStime")) and safe(r.get("WeekOprEtime")):
            t.append(f'  ex:weekdayOpenTime {lit(r["WeekOprStime"])} ;')
            t.append(f'  ex:weekdayCloseTime {lit(r["WeekOprEtime"])} ;')
        if safe(r.get("Sido")) and safe(r.get("Sigungu")):
            t.append(f'  ex:locatedIn {region_uri(r["Sido"], r["Sigungu"])} ;')
        t.append(f'  ex:careRegNo {lit(str(int(r["CareRegNo"])))} .')
        triples.append("\n".join(t))

    return write_ttl("10_shelter.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# 11. 반려동물 동반가능 문화시설
# ══════════════════════════════════════════════════════════════════════════
def convert_culture():
    df = pd.read_csv(f"{DATA_DIR}/11_culture.csv", encoding="utf-8-sig")
    triples = []

    for idx, r in df.iterrows():
        name_slug = slug(r["Name"])[:40]
        uid = uri(f"culture/facility/{idx}_{name_slug}")
        collect_region(r.get("Sido"), r.get("Sigungu"))

        t = [f"{uid}"]
        t.append(f'  a ex:CulturalFacility ;')
        t.append(f'  schema:name {lit(r["Name"])} ;')
        if safe(r.get("RoadAddress")):
            t.append(f'  schema:address {lit(r["RoadAddress"])} ;')
        if safe(r.get("PhoneNumber")):
            t.append(f'  schema:telephone {lit(r["PhoneNumber"])} ;')
        if safe(r.get("lat")) and safe(r.get("lon")):
            t.append(f'  ex:latitude {float(r["lat"]):.6f} ;')
            t.append(f'  ex:longitude {float(r["lon"]):.6f} ;')
        if safe(r.get("Category1")):
            t.append(f'  schema:category {lit(r["Category1"])} ;')
        if safe(r.get("PetAllowedInfo")):
            t.append(f'  ex:petAllowedInfo {lit(r["PetAllowedInfo"])} ;')
        if safe(r.get("PetRestriction")):
            t.append(f'  ex:petRestriction {lit(r["PetRestriction"])} ;')
        if safe(r.get("AllowedPetSize")):
            t.append(f'  ex:allowedPetSize {lit(r["AllowedPetSize"])} ;')
        if safe(r.get("OpeningHours")):
            t.append(f'  schema:openingHours {lit(r["OpeningHours"])} ;')
        if safe(r.get("Sido")) and safe(r.get("Sigungu")):
            t.append(f'  ex:locatedIn {region_uri(r["Sido"], r["Sigungu"])} ;')
        t.append(f'  ex:coord_status {lit(r["coord_status"])} .')
        triples.append("\n".join(t))

    return write_ttl("11_culture.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# 12. 휴게소
# ══════════════════════════════════════════════════════════════════════════
def convert_restarea():
    df = pd.read_csv(f"{DATA_DIR}/12_restarea.csv", encoding="utf-8-sig")
    triples = []

    for idx, r in df.iterrows():
        name_slug = slug(r["Name"])[:30]
        uid = uri(f"facility/restarea/{idx}_{name_slug}")
        collect_region(r.get("Sido"), r.get("Sigungu"))

        t = [f"{uid}"]
        t.append(f'  a ex:RestArea ;')
        t.append(f'  schema:name {lit(r["Name"])} ;')
        t.append(f'  ex:petPlayground true ;')
        if safe(r.get("lat")) and safe(r.get("lon")):
            t.append(f'  ex:latitude {float(r["lat"]):.6f} ;')
            t.append(f'  ex:longitude {float(r["lon"]):.6f} ;')
        if safe(r.get("OpeningHours")):
            t.append(f'  schema:openingHours {lit(r["OpeningHours"])} ;')
        if safe(r.get("EstablishedYear")):
            t.append(f'  ex:establishedYear {int(r["EstablishedYear"])} ;')
        if safe(r.get("Sido")) and safe(r.get("Sigungu")):
            t.append(f'  ex:locatedIn {region_uri(r["Sido"], r["Sigungu"])} ;')
        t.append(f'  ex:facilityType {lit(r["FacilityType"])} .')
        triples.append("\n".join(t))

    return write_ttl("12_restarea.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# 13. 동물질병증상
# ══════════════════════════════════════════════════════════════════════════
def convert_symptoms():
    df = pd.read_csv(f"{DATA_DIR}/13_symptoms.csv", encoding="utf-8-sig")
    triples = []

    # 증상 대분류(Category) 노드 먼저 생성
    categories = df[["SymptomCode", "CategoryKo", "CategoryEn"]].drop_duplicates("SymptomCode")
    for _, r in categories.iterrows():
        uid = uri(f"medical/symptomCategory/{r['SymptomCode']}")
        t = [f"{uid}"]
        t.append(f'  a ex:SymptomCategory ;')
        t.append(f'  ex:categoryKR {lit(r["CategoryKo"])} ;')
        t.append(f'  ex:categoryEN {lit(r["CategoryEn"])} .')
        triples.append("\n".join(t))

    # 증상 노드
    for _, r in df.iterrows():
        uid     = uri(f"medical/symptom/{r['SymptomListCode']}")
        cat_uid = uri(f"medical/symptomCategory/{r['SymptomCode']}")

        t = [f"{uid}"]
        t.append(f'  a ex:Symptom ;')
        t.append(f'  ex:symptomCode {lit(r["SymptomListCode"])} ;')
        t.append(f'  ex:symptomNameKR {lit(r["SymptomName"])} ;')
        t.append(f'  ex:belongsTo {cat_uid} .')
        triples.append("\n".join(t))

    return write_ttl("13_symptoms.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# 15. 동물질병
# ══════════════════════════════════════════════════════════════════════════
def convert_diseases():
    df = pd.read_csv(f"{DATA_DIR}/15_diseases.csv", encoding="utf-8-sig")
    triples = []

    for _, r in df.iterrows():
        uid = uri(f"medical/disease/{int(r['DiseaseNo'])}")

        t = [f"{uid}"]
        t.append(f'  a ex:Disease ;')
        t.append(f'  ex:diseaseName {lit(r["DiseaseName"])} ;')
        if safe(r.get("DiseaseNameEN")):
            t.append(f'  ex:diseaseNameEN {lit(r["DiseaseNameEN"])} ;')
        if safe(r.get("CauseClass")):
            t.append(f'  ex:causeClass {lit(r["CauseClass"])} ;')
        if safe(r.get("MainTargetAnimal")):
            t.append(f'  ex:mainTargetAnimal {lit(r["MainTargetAnimal"])} ;')
        t.append(f'  ex:targetsDog {str(bool(r["TargetsDog"])).lower()} ;')
        t.append(f'  ex:targetsCat {str(bool(r["TargetsCat"])).lower()} .')
        triples.append("\n".join(t))

    return write_ttl("15_diseases.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# Region 노드 파일 생성
# ══════════════════════════════════════════════════════════════════════════
def write_regions():
    triples = []
    for key, (sido, sigungu) in REGIONS.items():
        uid = uri(f"region/{slug(key)}")
        t = [f"{uid}"]
        t.append(f'  a ex:Region, schema:AdministrativeArea ;')
        t.append(f'  ex:sidoName {lit(sido)} ;')
        t.append(f'  ex:sigunguName {lit(sigungu)} ;')
        t.append(f'  ex:regionKey {lit(key)} .')
        triples.append("\n".join(t))

    return write_ttl("00_regions.ttl", triples), len(triples)


# ══════════════════════════════════════════════════════════════════════════
# 통합 .ttl 생성
# ══════════════════════════════════════════════════════════════════════════
def merge_all():
    all_files = sorted(f for f in os.listdir(OUTPUT_DIR) if f.endswith(".ttl") and f != "animalloo_all.ttl")
    out_path  = os.path.join(OUTPUT_DIR, "animalloo_all.ttl")

    with open(out_path, "w", encoding="utf-8") as out:
        out.write(PREFIXES)
        for fname in all_files:
            fpath = os.path.join(OUTPUT_DIR, fname)
            with open(fpath, encoding="utf-8") as f:
                content = f.read()
                # prefix 중복 제거
                content = re.sub(r"@prefix[^\n]+\n", "", content)
                out.write(f"\n# ── {fname} ──\n")
                out.write(content.strip())
                out.write("\n")

    size_mb = os.path.getsize(out_path) / 1024 / 1024
    print(f"\n  📦 animalloo_all.ttl 생성 완료 ({size_mb:.2f} MB)")

def natural_disaster():
    all_files = sorted(f for f in os.listdir(OUTPUT_DIR) if f.endswith(".ttl") and f != "animalloo_all.ttl")
    out_path  = os.path.join(OUTPUT_DIR, "14_disease_qa.ttl")

    with open(out_path, "w", encoding="utf-8") as out:
        out.write(PREFIXES)
        for fname in all_files:
            fpath = os.path.join(OUTPUT_DIR, fname)
            with open(fpath, encoding="utf-8") as f:
                content = f.read()
                # prefix 중복 제거
                content = re.sub(r"@prefix[^\n]+\n", "", content)
                out.write(f"\n# ── {fname} ──\n")
                out.write(content.strip())
                out.write("\n")

    size_mb = os.path.getsize(out_path) / 1024 / 1024
    print(f"\n  📦 14_disease_qa.ttl 생성 완료 ({size_mb:.2f} MB)")
# ══════════════════════════════════════════════════════════════════════════
# 메인
# ══════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("=" * 55)
    print("  CSV → RDF Turtle 변환 시작")
    print("=" * 55)

    results = []
    results.append(("01_병원",    convert_hospital()))
    results.append(("02_약국",    convert_pharmacy()))
    results.append(("03_미용",    convert_grooming()))
    results.append(("04_위탁",    convert_boarding()))
    results.append(("05_장묘",    convert_cremation()))
    results.append(("09_분실",    convert_lost_animal()))
    results.append(("10_보호센터", convert_shelter()))
    results.append(("11_문화시설", convert_culture()))
    results.append(("12_휴게소",  convert_restarea()))
    results.append(("12_휴게소",  convert_restarea()))
    results.append(("14_질병자연여",    convert_natural_disaster()))
    results.append(("13_증상",    convert_symptoms()))

    results.append(("15_질병",    convert_diseases()))

    # Region 노드 (전 파일 처리 후 생성)
    results.append(("00_지역",    write_regions()))

    # 통합 파일
    merge_all()

    # 요약
    print(f"\n{'=' * 55}")
    print("  변환 완료 요약")
    print(f"{'=' * 55}")
    total = 0
    for name, (_, cnt) in results:
        print(f"  {name:<12}: {cnt:>6,}개 엔티티")
        total += cnt
    print(f"  {'─' * 30}")
    print(f"  {'전체 합계':<12}: {total:>6,}개 엔티티")
    print(f"\n  출력 위치: {OUTPUT_DIR}")
    print("  ✅ 완료")