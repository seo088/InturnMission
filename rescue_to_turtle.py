"""
구조동물 데이터 전처리 + RDF Turtle 변환 통합 스크립트
=======================================================
1단계: 전처리
  - 보호중만 필터 (21만 → 15,241행)
  - 날짜 정규화 (YYYYMMDD → YYYY-MM-DD)
  - 무게·나이 숫자 추출
  - 시도·시군구 추출 → region_key
  - RFID 정규화
  - 이미지 URL 리스트화
  - 보호센터 연결키(CareRegNo) 정규화

2단계: TTL 변환
  - ex:AbandonedAnimal 클래스
  - 보호센터(AnimalShelter)와 protectedBy 관계
  - Region 노드와 foundAt 관계
  - 분실동물(LostAnimal)과 matchingCandidate 관계 준비

실행: python3 rescue_to_turtle.py
출력:
  - csv_data/08_구조동물_전처리완료.csv
  - turtle/08_abandoned_animal.ttl
  - turtle/animalloo_all.ttl (기존 파일에 구조동물 추가)
"""

import pandas as pd
import numpy as np
import re
import os

# ── 경로 설정 ──────────────────────────────────────────────
DATA_DIR   = "/home/hong/petgraph/csv_data"
OUTPUT_DIR = "/home/hong/petgraph/turtle"
BASE       = "http://animalloo.kr/ontology"

os.makedirs(OUTPUT_DIR, exist_ok=True)

PREFIXES = """\
@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .
@prefix schema: <https://schema.org/> .
@prefix ex:     <http://animalloo.kr/ontology#> .

"""

# ── 유틸 함수 ──────────────────────────────────────────────
def safe(v):
    if v is None: return False
    if isinstance(v, float) and v != v: return False
    return str(v).strip() not in ('', 'nan', 'None')

def esc(v):
    return str(v).replace('\\','\\\\').replace('"','\\"').replace('\n','\\n').replace('\r','')

def lit(v, dtype=None):
    return f'"{esc(v)}"^^{dtype}' if dtype else f'"{esc(v)}"'

def uri(path):
    return f"<{BASE}/{path}>"

def slug(v):
    return re.sub(r'[^\w가-힣]', '_', str(v).strip())


# ══════════════════════════════════════════════════════════
# STEP 1: 전처리
# ══════════════════════════════════════════════════════════
print("=" * 55)
print("  STEP 1: 구조동물 전처리 시작")
print("=" * 55)

df = pd.read_csv(
    f"{DATA_DIR}/08_구조동물_조회데이터.csv",
    encoding="utf-8-sig",
    low_memory=False
)
print(f"  원본 행 수: {len(df):,}")

# ── 1-1. 보호중 필터 ─────────────────────────────────────
df = df[df['ProcessState'] == '보호중'].copy()
print(f"  [보호중 필터] → {len(df):,}행")

# ── 1-2. 날짜 정규화 (YYYYMMDD → YYYY-MM-DD) ────────────
def fmt_date(v):
    s = str(v).strip()
    if re.match(r'^\d{8}$', s):
        return f"{s[:4]}-{s[4:6]}-{s[6:]}"
    return s if s not in ('nan','') else None

for col in ['HappenDate', 'NoticeSDate', 'NoticeEDate']:
    if col in df.columns:
        df[col] = df[col].apply(fmt_date)

# ── 1-3. 무게 숫자 추출 (2.5(Kg) → 2.5) ────────────────
def parse_weight(v):
    if not safe(v): return None
    m = re.search(r'([\d.]+)', str(v))
    if not m: return None
    s = m.group(1)
    # '1..5' 같이 점 두 개 이상인 이상 데이터 처리
    s = re.sub(r'\.{2,}', '.', s).strip('.')
    try:
        return float(s)
    except ValueError:
        return None

df['WeightKg'] = df['Weight'].apply(parse_weight)

# ── 1-4. 나이 정규화 (2026(60일미만)(년생) → 2026 / 60일미만) ─
def parse_age(v):
    if not safe(v): return None, None
    s = str(v)
    year_m = re.search(r'(\d{4})', s)
    detail_m = re.search(r'\(([^)]+)\)', s.replace(year_m.group(),'',1) if year_m else s)
    year   = year_m.group(1) if year_m else None
    detail = detail_m.group(1) if detail_m else None
    return year, detail

df[['BirthYear','AgeDetail']] = df['Age'].apply(
    lambda v: pd.Series(parse_age(v))
)

# ── 1-5. RFID 정규화 ─────────────────────────────────────
df['RfidCode'] = df['RfidCode'].apply(
    lambda v: str(int(float(v))) if safe(v) and str(v).strip() not in ('','nan') else None
)
rfid_ok = df['RfidCode'].notna().sum()
print(f"  [RFID] 유효: {rfid_ok:,}건 / 결측: {df['RfidCode'].isna().sum():,}건")

# ── 1-6. 이미지 URL 합치기 ──────────────────────────────
img_cols = [c for c in df.columns if c.startswith('Image')]
df['ImageList'] = df[img_cols].apply(
    lambda row: '|'.join([str(v) for v in row if safe(v)]),
    axis=1
)
df['ImageMain'] = df['Image1'].where(df['Image1'].notna(), None)

# ── 1-7. 시도·시군구 추출 (OrgNm 활용) ──────────────────
SIDO_PAT = (
    r"(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시"
    r"|세종특별자치시|경기도|강원특별자치도|충청북도|충청남도"
    r"|전북특별자치도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)"
)

def extract_sido(v):
    if not safe(v): return None
    m = re.match(SIDO_PAT, str(v).strip())
    return m.group(1) if m else None

def extract_sigungu(v):
    if not safe(v): return None
    m = re.search(
        r'(?:특별시|광역시|특별자치시|특별자치도|도)\s*(\S+?[시군구])\b', str(v)
    )
    return m.group(1) if m else None

# OrgNm 우선, 없으면 CareAddr
df['Sido']    = df['OrgNm'].apply(extract_sido)
df['Sigungu'] = df['OrgNm'].apply(extract_sigungu)

# OrgNm으로 못 찾은 것은 CareAddr로 보완
mask = df['Sido'].isna()
df.loc[mask, 'Sido']    = df.loc[mask, 'CareAddr'].apply(extract_sido)
df.loc[mask, 'Sigungu'] = df.loc[mask, 'CareAddr'].apply(extract_sigungu)

df['region_key'] = df['Sido'].fillna('') + '_' + df['Sigungu'].fillna('')
print(f"  [지역 추출] Sido 성공: {df['Sido'].notna().sum():,}건")

# ── 1-8. CareRegNo 정규화 ───────────────────────────────
df['CareRegNo'] = df['CareRegNo'].apply(
    lambda v: str(int(float(v))) if safe(v) and str(v).replace('.','').isdigit() else str(v) if safe(v) else None
)

# ── 1-9. 불필요 컬럼 제거 (이미지 개별 → ImageList로 통합) ─
drop_cols = [c for c in df.columns if c.startswith('Image') and c != 'ImageMain']
df = df.drop(columns=drop_cols + ['Weight', 'Age'], errors='ignore')

# 저장
out_csv = f"{DATA_DIR}/08_구조동물_전처리완료.csv"
df.to_csv(out_csv, index=False, encoding='utf-8-sig')
print(f"\n  ✅ 전처리 완료: {out_csv}")
print(f"     행: {len(df):,} | 컬럼: {len(df.columns)}")

# 상태 요약
print(f"\n  [전처리 요약]")
print(f"  보호중:     {len(df):,}행")
print(f"  개:         {(df['UpKindName']=='개').sum():,}건")
print(f"  고양이:     {(df['UpKindName']=='고양이').sum():,}건")
print(f"  기타:       {(~df['UpKindName'].isin(['개','고양이'])).sum():,}건")
print(f"  중성화 완료: {(df['NeuterYn']=='Y').sum():,}건")
print(f"  사진 있음:  {df['ImageMain'].notna().sum():,}건")
print(f"  입양공고 있음: {df['AdptnTitle'].notna().sum():,}건")


# ══════════════════════════════════════════════════════════
# STEP 2: TTL 변환
# ══════════════════════════════════════════════════════════
print(f"\n{'='*55}")
print("  STEP 2: RDF Turtle 변환 시작")
print("=" * 55)

triples = []

for idx, r in df.iterrows():
    # URI: DesertionNo 기반
    desert_no = str(r['DesertionNo']).strip()
    uid = uri(f"animal/rescue/{desert_no}")

    t = [uid]

    # 종류에 따라 서브클래스
    upkind = str(r.get('UpKindName', '')).strip()
    if upkind == '개':
        t.append('  a ex:AbandonedAnimal, ex:Dog ;')
    elif upkind == '고양이':
        t.append('  a ex:AbandonedAnimal, ex:Cat ;')
    else:
        t.append('  a ex:AbandonedAnimal ;')

    # 기본 식별자
    t.append(f'  ex:desertionNo {lit(desert_no)} ;')
    t.append(f'  ex:noticeNo {lit(str(r["NoticeNo"]))} ;')

    # 동물 정보
    if safe(r.get('KindName')):
        t.append(f'  ex:animalBreed {lit(r["KindName"])} ;')
    if safe(r.get('KindFullName')):
        t.append(f'  ex:kindFullName {lit(r["KindFullName"])} ;')
    if safe(r.get('ColorCode')):
        t.append(f'  ex:colorCode {lit(r["ColorCode"])} ;')
    if safe(r.get('SexCode')):
        t.append(f'  schema:gender {lit(r["SexCode"])} ;')
    if safe(r.get('NeuterYn')):
        t.append(f'  ex:neuterYn {lit(r["NeuterYn"])} ;')
    if safe(r.get('WeightKg')):
        t.append(f'  ex:weightKg {float(r["WeightKg"]):.1f} ;')
    if safe(r.get('BirthYear')):
        t.append(f'  ex:birthYear {lit(r["BirthYear"])} ;')
    if safe(r.get('AgeDetail')):
        t.append(f'  ex:ageDetail {lit(r["AgeDetail"])} ;')
    if safe(r.get('SpecialMark')):
        t.append(f'  ex:specialMark {lit(str(r["SpecialMark"]).strip())} ;')

    # 상태
    t.append(f'  ex:processState {lit("보호중")} ;')

    # 날짜
    if safe(r.get('HappenDate')):
        t.append(f'  ex:happenDate {lit(r["HappenDate"])} ;')
    if safe(r.get('NoticeSDate')):
        t.append(f'  ex:noticeSDate {lit(r["NoticeSDate"])} ;')
    if safe(r.get('NoticeEDate')):
        t.append(f'  ex:noticeEDate {lit(r["NoticeEDate"])} ;')

    # 발견 장소
    if safe(r.get('HappenPlace')):
        t.append(f'  ex:happenPlace {lit(str(r["HappenPlace"]).strip())} ;')

    # 이미지
    if safe(r.get('ImageMain')):
        t.append(f'  ex:imageUrl {lit(str(r["ImageMain"]))} ;')
    if safe(r.get('ImageList')) and str(r['ImageList']).strip():
        t.append(f'  ex:imageList {lit(str(r["ImageList"]))} ;')

    # 건강 정보
    if safe(r.get('VaccinationChk')):
        t.append(f'  ex:vaccinationChk {lit(str(r["VaccinationChk"]))} ;')
    if safe(r.get('HealthChk')):
        t.append(f'  ex:healthChk {lit(str(r["HealthChk"]))} ;')

    # 입양 정보 (있으면)
    if safe(r.get('AdptnTitle')):
        t.append(f'  ex:adoptionTitle {lit(str(r["AdptnTitle"]))} ;')
    if safe(r.get('AdptnTxt')):
        t.append(f'  ex:adoptionText {lit(str(r["AdptnTxt"])[:200])} ;')
    if safe(r.get('AdptnCondition')):
        t.append(f'  ex:adoptionCondition {lit(str(r["AdptnCondition"]))} ;')

    # RFID
    if safe(r.get('RfidCode')):
        t.append(f'  ex:rfidCode {lit(str(r["RfidCode"]))} ;')

    # 보호센터 연결 (protectedBy → AnimalShelter URI)
    if safe(r.get('CareRegNo')):
        shelter_uri = uri(f"facility/shelter/{r['CareRegNo']}")
        t.append(f'  ex:protectedBy {shelter_uri} ;')
        t.append(f'  ex:careNm {lit(str(r["CareNm"]))} ;')

    # 지역 연결
    if safe(r.get('Sido')) and safe(r.get('Sigungu')):
        rkey = slug(f"{r['Sido']}_{r['Sigungu']}")
        t.append(f'  ex:foundAt {uri(f"region/{rkey}")} ;')

    # 마지막 줄 마침표
    last = t[-1]
    t[-1] = last[:-1] + ' .'   # ; → .
    triples.append('\n'.join(t))


# TTL 저장
ttl_path = f"{OUTPUT_DIR}/08_abandoned_animal.ttl"
with open(ttl_path, 'w', encoding='utf-8') as f:
    f.write(PREFIXES)
    f.write('\n'.join(triples))
    f.write('\n')

size_mb = os.path.getsize(ttl_path) / 1024 / 1024
print(f"  ✅ {ttl_path}")
print(f"     엔티티: {len(triples):,}개 | 크기: {size_mb:.2f} MB")


# ══════════════════════════════════════════════════════════
# STEP 3: animalloo_all.ttl 에 구조동물 추가
# ══════════════════════════════════════════════════════════
print(f"\n{'='*55}")
print("  STEP 3: animalloo_all.ttl 업데이트")
print("=" * 55)

all_ttl_path = f"{OUTPUT_DIR}/animalloo_all.ttl"

if os.path.exists(all_ttl_path):
    with open(all_ttl_path, 'a', encoding='utf-8') as f:
        f.write('\n\n# ── 08_abandoned_animal.ttl ──\n')
        with open(ttl_path, encoding='utf-8') as src:
            content = src.read()
            # prefix 중복 제거
            content = re.sub(r'@prefix[^\n]+\n', '', content)
            f.write(content.strip())
            f.write('\n')
    size_all = os.path.getsize(all_ttl_path) / 1024 / 1024
    print(f"  ✅ animalloo_all.ttl 업데이트 완료 ({size_all:.2f} MB)")
else:
    print(f"  ⚠ animalloo_all.ttl 없음 → 08_abandoned_animal.ttl 단독으로 사용")

# ── 최종 요약 ────────────────────────────────────────────
print(f"\n{'='*55}")
print("  전체 완료 요약")
print(f"{'='*55}")
print(f"  전처리 CSV : {out_csv}")
print(f"  TTL 파일   : {ttl_path}")
print(f"  엔티티 수  : {len(triples):,}개")
print(f"  개         : {(df['UpKindName']=='개').sum():,}건")
print(f"  고양이     : {(df['UpKindName']=='고양이').sum():,}건")
print(f"  RFID 있음  : {rfid_ok:,}건")
print(f"  보호센터 연결: {df['CareRegNo'].notna().sum():,}건")
print(f"  입양공고 있음: {df['AdptnTitle'].notna().sum():,}건")