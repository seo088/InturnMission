"""
추론 체인 TTL 생성 스크립트
==============================
생성할 관계 3종:
  ① ex:SymptomCategory → ex:mapsTo → ex:VetDepartment  (증상분류 → 진료과)
  ② ex:Symptom         → ex:indicatesDisease → ex:Disease  (증상 → 질병)
  ③ ex:Disease         → ex:treatedAt → ex:AnimalHospital  (질병 → 병원)

실행: python3 reasoning_chain.py
출력:
  - turtle/16_reasoning_chain.ttl
  - turtle/animalloo_all.ttl 에 자동 추가
"""

import pandas as pd
import re
import os

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

def uri(path):
    return f"<{BASE}/{path}>"

def lit(v):
    return f'"{str(v).replace(chr(92), chr(92)*2).replace(chr(34), chr(92)+chr(34))}"'

triples = []

print("=" * 55)
print("  추론 체인 TTL 생성 시작")
print("=" * 55)


# ══════════════════════════════════════════════════════════
# ① 증상분류 → 진료과 (mapsTo)
#    12개 증상 카테고리 → 5개 진료과
# ══════════════════════════════════════════════════════════
print("\n[1/3] 증상분류 → 진료과 매핑 생성...")

# 증상 코드(a~l) → 진료과 매핑
CATEGORY_TO_DEPT = {
    'a': ('ophthalmology', '청각기관 증상'),   # 청각 → 안과 (이비인후과 없으므로)
    'b': ('internal',      '심혈관계 증상'),
    'c': ('internal',      '소화기계'),
    'd': ('ophthalmology', '안과 증상'),
    'e': ('internal',      '전신종합 증상'),
    'f': ('surgery',       '근골격계'),
    'g': ('internal',      '신경계 증상'),
    'h': ('surgery',       '통증 증상'),
    'i': ('internal',      '호흡기계 증상'),
    'j': ('dermatology',   '피부/외피계 증상'),
    'k': ('surgery',       '생식기계 증상'),
    'l': ('internal',      '비뇨기계 증상'),
}

for code, (dept_en, cat_ko) in CATEGORY_TO_DEPT.items():
    cat_uri  = uri(f"medical/symptomCategory/{code}")
    dept_uri = uri(f"medical/department/{dept_en}")
    triples.append(
        f"{cat_uri}\n"
        f"  ex:mapsTo {dept_uri} ;\n"
        f"  ex:deptHint {lit(cat_ko)} ."
    )

print(f"  ✅ {len(CATEGORY_TO_DEPT)}개 매핑 생성")


# ══════════════════════════════════════════════════════════
# ② 증상 → 질병 (indicatesDisease)
#    키워드 매핑: 질병명/영문명에서 증상 키워드를 추출해 연결
# ══════════════════════════════════════════════════════════
print("\n[2/3] 증상 → 질병 매핑 생성...")

# 질병 로드
try:
    df_dis = pd.read_csv(f"{DATA_DIR}/15_동물질병_전처리완료.csv", encoding="utf-8-sig")
    dis_col_name = "DiseaseName"
    dis_col_no   = "DiseaseNo"
except FileNotFoundError:
    try:
        df_dis = pd.read_csv(f"{DATA_DIR}/15_동물질병_데이터.csv", encoding="euc-kr")
        df_dis = df_dis.rename(columns={
            'DISS_NO': 'DiseaseNo', 'DISS_NM': 'DiseaseName',
            'ENG_DISS_NM': 'DiseaseNameEN', 'MAIN_INFC_ANIMAL': 'MainTargetAnimal',
            'CAUSE_CMMN_CL': 'CauseClass'
        })
        dis_col_name = "DiseaseName"
        dis_col_no   = "DiseaseNo"
    except FileNotFoundError:
        df_dis = pd.read_csv(f"{DATA_DIR}/15_동물질병_데이터.csv", encoding="cp1252")
        df_dis = df_dis.rename(columns={
            'DISS_NO': 'DiseaseNo', 'DISS_NM': 'DiseaseName',
            'ENG_DISS_NM': 'DiseaseNameEN', 'MAIN_INFC_ANIMAL': 'MainTargetAnimal',
            'CAUSE_CMMN_CL': 'CauseClass'
        })

# 반려동물 관련 질병만 필터
pet_dis = df_dis[
    df_dis['MainTargetAnimal'].str.contains('개|고양이|견|묘', na=False)
].copy()
print(f"  반려동물 질병: {len(pet_dis)}개")

# 증상 로드
for _sf in ["13_질병증상_전처리완료.csv", "13_동물질병증상_데이터.csv"]:
    if os.path.exists(f"{DATA_DIR}/{_sf}"):
        df_sym = pd.read_csv(f"{DATA_DIR}/{_sf}", encoding="utf-8-sig")
        break

# 질병 ↔ 증상 매핑 테이블 (실제 SymptomListCode 기반)
# {질병No: [증상 SymptomListCode 리스트]}
DISEASE_SYMPTOM_MAP = {
    8:   ['c036', 'c038', 'c003', 'c050', 'c055', 'c056'],
    5:   ['i012', 'i008', 'i009', 'g001', 'g002', 'c003'],
    6:   ['i012', 'i011', 'i008', 'i009', 'i004'],
    12:  ['g001', 'g002', 'g003', 'g023', 'g024'],
    115: ['c036', 'c038', 'c003', 'c050'],
    55:  ['k001', 'k002', 'e001', 'e002'],
    107: ['e001', 'e002', 'i008', 'i009'],
    91:  ['g001', 'g002', 'e001', 'e002'],
    18:  ['g001', 'g002', 'g023', 'g024', 'f003', 'f004'],
    109: ['c050', 'c003', 'c038'],
    42:  ['g001', 'g002', 'e001'],
    61:  ['i012', 'i008', 'e001', 'e002'],
    22:  ['g001', 'g002', 'i008', 'i012'],
}

# 유효한 SymptomListCode 목록
valid_sym_codes = set(df_sym['SymptomListCode'].tolist())

chain_count = 0
for _, row in pet_dis.iterrows():
    dis_no   = int(row['DiseaseNo'])
    dis_uri  = uri(f"medical/disease/{dis_no}")
    sym_codes = DISEASE_SYMPTOM_MAP.get(dis_no, [])

    for scode in sym_codes:
        if scode in valid_sym_codes:
            sym_uri = uri(f"medical/symptom/{scode}")
            # 양방향: 증상→질병, 질병→증상
            triples.append(
                f"{sym_uri}\n"
                f"  ex:indicatesDisease {dis_uri} ."
            )
            triples.append(
                f"{dis_uri}\n"
                f"  ex:hasSymptom {sym_uri} ."
            )
            chain_count += 1

print(f"  ✅ 증상-질병 연결: {chain_count}개 트리플 생성")


# ══════════════════════════════════════════════════════════
# ③ 진료과 → 병원 (treats) + 질병 → 병원 (treatedAt)
#    진료과별 해당 병원을 Region 단위로 연결
#    (전체 5,382개 병원을 질병마다 연결하면 너무 많으므로
#     진료과 단위로 연결하고 SPARQL에서 추론)
# ══════════════════════════════════════════════════════════
print("\n[3/3] 질병 → 진료과 연결 생성 (treatedAt)...")

# 질병 → 진료과 매핑
DISEASE_DEPT_MAP = {
    97:  'internal',       # 개파보바이러스 → 내과
    94:  'internal',       # 개디스템퍼 → 내과
    95:  'internal',       # 개보데텔라폐렴 → 내과
    100: 'internal',       # 광견병 → 내과
    83:  'internal',       # 개코로나 → 내과
    27:  'surgery',        # 브루셀라병 → 외과
    78:  'internal',       # 큐열 → 내과
    62:  'internal',       # 웨스트나일 → 내과
    106: 'surgery',        # 네오스포라 → 외과
    79:  'internal',       # 크립토스포리디움 → 내과
    14:  'internal',       # 리스테리아 → 내과
    33:  'internal',       # 소결핵 → 내과
    110: 'internal',       # 니파바이러스 → 내과
}

dept_count = 0
for _, row in pet_dis.iterrows():
    dis_no  = int(row['DiseaseNo'])
    dis_uri = uri(f"medical/disease/{dis_no}")
    dept_en = DISEASE_DEPT_MAP.get(dis_no, 'internal')
    dept_uri = uri(f"medical/department/{dept_en}")

    triples.append(
        f"{dis_uri}\n"
        f"  ex:treatedByDept {dept_uri} ."
    )
    dept_count += 1

# 진료과 → 병원 (treats) 관계: 병원 5,382개 전체 연결은 과부하이므로
# AnimalHospital 클래스에 진료과 속성을 역으로 붙이는 방식 사용
# 여기서는 진료과 노드에서 병원 클래스를 범위로 선언만 추가
for dept_en in ['ophthalmology', 'surgery', 'internal', 'dermatology', 'dentistry']:
    dept_uri = uri(f"medical/department/{dept_en}")
    triples.append(
        f"{dept_uri}\n"
        f"  ex:handledBy ex:AnimalHospital .\n"
    )

print(f"  ✅ 질병-진료과 연결: {dept_count}개 트리플 생성")


# ══════════════════════════════════════════════════════════
# ④ Q&A ↔ 증상분류 보강 (VetQnA → SymptomCategory)
# ══════════════════════════════════════════════════════════
print("\n[보강] Q&A → 증상분류 연결...")

# 진료과 → 증상 카테고리 코드 역매핑
DEPT_TO_CATS = {
    'ophthalmology': ['a', 'd'],
    'surgery':       ['f', 'h', 'k'],
    'internal':      ['b', 'c', 'e', 'g', 'i', 'l'],
    'dermatology':   ['j'],
    'dentistry':     ['c', 'e'],
}

for dept_en, cat_codes in DEPT_TO_CATS.items():
    dept_uri = uri(f"medical/department/{dept_en}")
    for code in cat_codes:
        cat_uri = uri(f"medical/symptomCategory/{code}")
        triples.append(
            f"{dept_uri}\n"
            f"  ex:treatsSympCategory {cat_uri} ."
        )

print(f"  ✅ 진료과-증상분류 역매핑 추가")


# ══════════════════════════════════════════════════════════
# TTL 저장
# ══════════════════════════════════════════════════════════
ttl_path = f"{OUTPUT_DIR}/16_reasoning_chain.ttl"
with open(ttl_path, 'w', encoding='utf-8') as f:
    f.write(PREFIXES)
    f.write('\n'.join(triples))
    f.write('\n')

size_kb = os.path.getsize(ttl_path) / 1024
print(f"\n  ✅ {ttl_path} ({size_kb:.1f} KB)")
print(f"     총 트리플 블록: {len(triples)}개")

# animalloo_all.ttl 에 추가
all_ttl = f"{OUTPUT_DIR}/animalloo_all.ttl"
if os.path.exists(all_ttl):
    with open(all_ttl, 'a', encoding='utf-8') as f:
        f.write('\n\n# ── 16_reasoning_chain.ttl ──\n')
        with open(ttl_path, encoding='utf-8') as src:
            content = src.read()
            content = re.sub(r'@prefix[^\n]+\n', '', content)
            f.write(content.strip())
            f.write('\n')
    size_mb = os.path.getsize(all_ttl) / 1024 / 1024
    print(f"  ✅ animalloo_all.ttl 업데이트 ({size_mb:.2f} MB)")
else:
    print(f"  ⚠ animalloo_all.ttl 없음 → 단독 파일로 사용")


# ══════════════════════════════════════════════════════════
# 검증용 SPARQL 예시 출력
# ══════════════════════════════════════════════════════════
print(f"\n{'='*55}")
print("  완료! 아래 SPARQL로 즉시 테스트 가능")
print(f"{'='*55}")
print("""
  # "구토" 증상 → 질병 → 진료과 추론
  PREFIX ex: <http://animalloo.kr/ontology#>

  SELECT ?symptomName ?diseaseName ?deptName
  WHERE {
      ?symptom ex:symptomNameKR ?symptomName ;
               ex:indicatesDisease ?disease .
      ?disease ex:diseaseName ?diseaseName ;
               ex:treatedByDept ?dept .
      ?dept    ex:deptNameKR ?deptName .
      FILTER(CONTAINS(?symptomName, "구토"))
  }
""")