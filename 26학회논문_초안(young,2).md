# 공공데이터 기반 반려동물 지식그래프 구축을 위한 전처리 파이프라인 설계

## Design of a Preprocessing Pipeline for Constructing a Companion Animal Knowledge Graph from Heterogeneous Public Data

---

## 요 약

반려동물 보유 가구의 증가와 함께 동물의료·실종동물 신고·반려 여행 등 관련 서비스 수요가 확대되면서, 정부는 시설·동물·의료 분야의 반려동물 관련 데이터를 공공데이터로 개방하고 있다. 그러나 이들 데이터는 다수의 기관에 분산 관리되어 좌표계 혼용, 코드 체계 불일치, 결측값, 이기종 스키마 등의 품질 이슈를 포함하므로, 정제 없이 결합할 경우 지식그래프 기반 추론 결과의 신뢰성에 영향을 미칠 수 있다. 본 논문은 이러한 이기종 공공 데이터를 단일 지식그래프로 통합하기 위한 전처리 요구사항을 다섯 가지 유형(좌표계·유효성·스키마·품질·개체연결)으로 체계화하고, 이에 대응하는 전처리 파이프라인과 4계층 도메인 지식그래프 구조를 제안한다. 제안된 다섯 가지 전처리 유형 분류는 시설·개체·지식체계가 혼재된 도메인 특화 공공 데이터 통합에서 전처리가 갖추어야 할 의미 정렬 요건을 체계적으로 정의한다.

## Abstract

With growing demand for companion animal services, the Korean government has opened diverse related public data. However, the data are dispersed across multiple agencies and contain quality issues such as heterogeneous coordinate systems, inconsistent codes, and divergent schemas, which may compromise the reliability of inferences performed on knowledge graphs. This paper categorizes the preprocessing requirements for unifying such data into a single knowledge graph into five types (coordinate, validity, schema, quality, and entity linkage), and proposes a corresponding pipeline along with a knowledge graph structure organized in four layers. The proposed classification systematically defines the semantic alignment requirements that preprocessing must satisfy when integrating public data in specialized domains.

## Key words

public data, preprocessing pipeline, knowledge graph, RDF/OWL2, companion animal, data integration, SPARQL

---

## Ⅰ. 서 론

국내 반려동물 보유 가구는 2023년 기준 전체 가구의 약 28.2%로 보고되었으며[1], 반려동물 관련 산업 규모 역시 확대되는 추세이다. 이에 정부는 동물병원·동물약국·미용업·위탁관리업·장묘업 등 반려동물 관련 시설 정보, 구조·분실동물 공고, 동물보호센터 현황, 반려동물 동반 가능 문화시설·휴게소, 동물 질병·증상 분류 체계 등 다양한 공공 데이터를 개방하고 있다. 그러나 이들 데이터는 행정안전부, 농림축산검역본부, 농림축산식품부, 한국관광공사, 한국문화정보원, 한국도로공사, 한국과학기술정보연구원 등 서로 다른 7개 기관이 독립적으로 생산·관리하기 때문에, 데이터 형식, 좌표계, 코드 체계가 상이하고 품질 수준에도 차이가 존재한다. 따라서 여러 데이터셋을 단순히 수집하여 결합하는 방식으로는 통합 서비스를 위한 데이터 기반을 충분히 확보하기 어려우며, 데이터 간 연결의 정확도가 후속 추론 결과에 영향을 미칠 수 있다.

이기종 공공 데이터를 의미적으로 통합하는 방법으로 지식그래프가 주목받고 있다[2]. 지식그래프는 개체와 개체 사이의 관계를 RDF 트리플로 표현하여 SPARQL 쿼리 기반 추론과 이종 데이터 간 의미적 연결을 지원한다. 다만 원시 데이터의 품질은 트리플 집합의 정확도와 후속 추론의 신뢰성에 직접적인 영향을 미치므로, 입력 데이터의 품질 확보가 지식그래프 구축의 선결 조건이 된다. 이러한 점에서 전처리 파이프라인 설계가 핵심 과제이다.

기존 연구는 도로명주소의 계층 구조를 활용한 공공데이터 연계[2], 도서관 데이터의 메타데이터 정렬을 통한 LOD 통합[3], 또는 단일 도메인의 의료 지식그래프 구축[4]을 다루어 왔다. 그러나 시설(지리정보)·개체(동물)·의료지식(분류체계)이라는 세 가지 이질적 도메인이 혼재한 영역에서 발생하는 도메인 특화 전처리 요구는 직접적으로 다루어지지 않았다. 본 논문은 이러한 공백을 반려동물 도메인을 사례로 보완하는 것을 목적으로 한다.

본 논문의 기여는 다음과 같다. 첫째, 7개 기관 14종 공공 데이터를 통합할 때 발생하는 전처리 요구사항을 **다섯 가지 유형(좌표계 통일, 유효 레코드 필터, 스키마 정규화, 품질 오류 교정, 개체 연결)** 으로 체계화하였으며, 이 유형화는 반려동물 도메인을 넘어 타 도메인 공공 데이터 통합에도 재사용 가능한 일반적 틀로 활용될 수 있다. 둘째, 다섯 유형에 대응하는 **5단계 전처리 파이프라인을 설계**하고 14종 76,043건 데이터에 적용하여 정량적 효과(평균 탈락률 26.8%)를 관측하였다. 셋째, 정제 결과를 적재할 **시설·동물·의료·지역 4계층 도메인 지식그래프 구조**를 제안하였다. 넷째, 다섯 가지 전처리 유형과 지식그래프 구성 요건의 대응 관계를 명시함으로써, 전처리를 표면적 정제 작업이 아니라 의미 정렬 과정으로 정형화하였다.

본 논문의 구성은 다음과 같다. Ⅱ장에서는 공공데이터 연계 및 지식그래프 구축 관련 선행연구를 정리하고 차별성을 기술한다. Ⅲ장에서는 수집한 14종 공공 데이터의 개요를 정리하며, Ⅳ장에서는 다섯 가지 전처리 요구사항과 이에 대응하는 5단계 전처리 파이프라인 및 4계층 지식그래프 구조의 설계와 구현 결과를 기술한다. Ⅴ장에서 한계와 향후 과제로 마무리한다.

---

## Ⅱ. 관련 연구

공공데이터의 일반적 연계 절차에 관해, Kim은 행정구역 정보를 기반으로 한국 공공데이터의 상호 연계 방안을 LOD 형태로 제안하였으며[5], 홍·김은 도로명주소의 계층적 정보를 활용하여 데이터 수집·정제·검증·지식그래프 생성의 4단계 절차를 제시하였다[2]. 두 연구는 행정 정보(행정구역·주소)를 공통 키로 활용하는 일반적 연계 절차를 정의했다는 점에서 의의를 가지나, 도메인 특화 전처리 요구(예: 의료 분류체계 정렬, 개체 식별)는 직접적인 논의 대상이 아니다.

도메인 특화 지식그래프 구축에 관한 연구도 활발히 진행되어 왔다. Dórea et al.은 동물 건강 감시 체계를 위한 AHSO 온톨로지를 설계하였고[6], Hoang et al.은 문헌 정보를 활용한 반려동물 질병 진단용 지식그래프 표현 학습 모델을 제안하였다[4]. Rajabi et al.은 캐나다 Nova Scotia 주의 공공 질병 데이터셋을 지식그래프로 구축하였으며[7], Janowicz et al.은 환경 정보 분야의 다중 도메인 지식그래프 KnowWhereGraph를 발표하였다[8]. Liu et al.은 도시 데이터를 대상으로 한 UrbanKG를 구축하였다[9]. 이들 연구는 단일 또는 인접 도메인의 지식그래프 구축에 깊이 있는 성과를 보였으나, 반려동물 영역에 특화된 한국 공공데이터 통합 전처리에 관한 논의는 다루어지지 않았다.

이기종 데이터 변환과 개체 연결 방법론에 관해서는, Van Assche et al.이 이기종 (반)정형 데이터로부터 RDF 그래프를 선언적으로 생성하는 방법론을 체계적 문헌고찰로 정리하였으며[10], Christophides et al.이 빅데이터 환경의 종단간 개체 해소 기법을 포괄적으로 검토하였다[11]. 제안하는 5단계 파이프라인은 이들 방법론의 핵심 아이디어(선언적 변환, 다속성 유사도 기반 개체 연결)를 반려동물 도메인의 실제 데이터셋에 적용하여 도메인 특화 구현으로 구체화한 것이다.

요약하면, 본 논문은 행정 정보 중심의 일반 연계 절차[2][5]를 도메인 특화 요구사항으로 확장하고, 단일 도메인 지식그래프 구축[4][6][7]을 시설·개체·의료지식의 다중 이질 도메인 통합으로 일반화하며, 추상 수준에서 논의된 RDF 변환·개체 연결 방법론[10][11]을 14종 한국 공공 데이터에 적용 가능한 구체적 파이프라인으로 인스턴스화하였다는 점에서 선행연구와 차별된다.

## Ⅲ. 수집 공공 데이터 개요

활용한 공공 데이터는 시설 정보, 동물 보호, 의료·지식의 세 범주에 걸쳐 총 14종이며, 7개 기관에서 제공된다. 데이터는 공공데이터포털의 REST API 호출 또는 정적 CSV 파일 형태로 수집하였다. 원본 총 76,043건 중 Ⅴ장에서 제안할 전처리 파이프라인을 적용한 후 유효 레코드는 55,688건으로, 평균 탈락률은 26.8%이다. 수집된 데이터의 개요는 표 1에서 보인다.

**표 1. 수집 공공 데이터셋 현황 (전처리 완료 기준)**

| # | 데이터셋명 | 제공기관 | 원본 건수 | 유효 건수 | 유효율(%) | 좌표계 |
|---|---|---|---|---|---|---|
| 1 | 동물병원 조회 | 행정안전부 | 10,475 | 5,406 | 51.6 | EPSG:5174 |
| 2 | 동물약국 조회 | 행정안전부 | 19,908 | 13,194 | 66.3 | EPSG:5174 |
| 3 | 동물미용업 조회 | 행정안전부 | 15,432 | 10,879 | 70.5 | EPSG:5174 |
| 4 | 동물위탁관리업 조회 | 행정안전부 | 9,618 | 5,845 | 60.8 | EPSG:5174 |
| 5 | 동물장묘업 조회 | 행정안전부 | 99 | 86 | 86.9 | EPSG:5174 |
| 6 | 반려동물 동반 여행지 | 한국관광공사 | 1,000 | 1,000 | 100.0 | WGS84 |
| 7 | 구조동물 조회 | 농림축산검역본부 | 15,241 | 15,241 | 100.0 | — |
| 8 | 분실동물 조회 | 농림축산검역본부 | 2,963 | 2,963 | 100.0 | — |
| 9 | 동물보호센터 조회 | 농림축산식품부 | 330 | 330 | 100.0 | WGS84 |
| 10 | 반려동물 동반 문화시설 | 한국문화정보원 | 100 | 67 | 67.0 | WGS84 |
| 11 | 휴게소 반려동물 놀이터 | 한국도로공사 | 20 | 20 | 100.0 | 좌표 부재 |
| 12 | 동물질병 증상분류 | 한국과학기술정보연구원 | 516 | 516 | 100.0 | — |
| 13 | 동물성장·질병 QA | 한국과학기술정보연구원 | 25 | 25 | 100.0 | — |
| 14 | 동물질병 정보 | 농림축산검역본부 | 116 | 116 | 100.0 | — |
| **합계** | | | **76,043** | **55,688** | **73.2** | |

기관별로 데이터를 생산한 목적과 시스템이 다르기 때문에, 동일한 개념을 표현하더라도 필드명, 코드 체계, 좌표 표현 방식이 서로 다른 경우가 관찰된다. 시설 정보는 모두 EPSG:5174 좌표계로 제공되는 반면, 동물보호센터와 문화시설은 국제 표준 WGS84로 제공된다. 휴게소 데이터는 좌표 정보가 부재하여 지명 기반 지오코딩이 필요하고, 구조·분실동물 데이터 및 의료지식 데이터는 공간 좌표를 본질적으로 갖지 않는 비공간 데이터이다. 또한 반려동물 동반 문화시설 데이터는 1차 적재 표본으로 100건을 사용하였다.

---

## Ⅳ. 전처리 파이프라인 및 지식그래프 설계

Ⅲ장에서 수집한 14종 공공 데이터의 표현 방식 차이는 직접 통합 시 부정확한 연결을 발생시킬 수 있다. 본 장에서는 이러한 차이를 다섯 가지 전처리 유형으로 정리하고(표 2), 이에 대응하는 5단계 전처리 파이프라인 및 4계층 지식그래프 구조를 설계한다.

**표 2. 전처리 유형과 지식그래프 구성 요건의 대응 관계**

| 전처리 유형 | KG 구성 요건 | 대응 RDF/OWL 표현 |
|---|---|---|
| 좌표계 통일 | 공간 연결성 | geo:lat, geo:long, aloo:locatedIn |
| 유효 레코드 필터 | 현실 반영 정확도 | 인스턴스 적재 범위 결정 |
| 스키마 정규화 | 의미적 통합 | 공통 property URI |
| 품질 오류 교정 | 추론 정확도 | 외래키 무결성 |
| 개체 연결 | 동일성 확립 | owl:sameAs |

전체 구조는 그림 1과 같으며, 수집·전처리 시퀀스는 그림 2와 같다.

**[그림 1. 데이터 소스(Layer 1) 및 수집·전처리(Layer 2) 다이어그램]**

**[그림 2. 데이터 수집·전처리 시퀀스 다이어그램]**

파이프라인의 첫 번째 단계는 **공공API 연동**으로, 각 기관의 REST API 또는 정적 CSV로부터 원시 데이터를 수집한다.

두 번째 단계는 **좌표계 변환**이다. 시설 정보(EPSG:5174)와 동물보호센터·문화시설(WGS84)의 좌표계 혼용 상태에서 직접 결합 시 수백 미터 단위의 평면 오차가 발생할 수 있어[5], pyproj로 WGS84로 통일하고 geo:lat·geo:long 속성으로 적재한다. 좌표가 부재한 휴게소 데이터는 Map API 기반 지오코딩으로 보정한다.

세 번째 단계는 **유효 레코드 필터링**이다. 행정안전부 시설 데이터에는 영업·폐업·휴업 상태가 혼재되어 유효율이 51.6%~86.9%로 분포한다(표 1). 시설 데이터는 "영업중", 구조동물 데이터는 "보호중" 상태만 유지하며, 이 단계에서 전체의 약 26.8%가 탈락한다.

네 번째 단계는 **스키마 정규화 및 품질 검증**이다. 14종 데이터셋은 동일 속성도 상이한 표기(체중 "3.5 kg"/"3.5kg", 날짜 "20240315"/"2024-03-15" 등)로 기록되며, 식별자 필드의 물리적 순서 불일치(예: 첫 레코드의 DiseaseNo가 28) 같은 품질 이슈도 관찰된다. 본 단계는 필드명을 통일된 카멜케이스 속성명으로 재명명하고 단위·날짜·행정구역 코드를 표준화하며, 외래키 무결성 검증으로 식별자 매핑 이슈를 차단한다.

다섯 번째 단계는 **RDF 변환 및 개체 연결**이다. rdflib로 Turtle 트리플을 생성하며 리터럴에 @ko·@en 언어 태그, 날짜 필드에 ^^xsd:date 타입을 부여하여 SPARQL 시간·수치 쿼리를 지원한다. 실종-구조동물의 경우 RFID 일치 시 owl:sameAs 관계를 부여하고, 불일치 시 품종·색상·성별·발생 지역의 복합 유사도 점수로 매칭 후보를 산출한다[11].

파이프라인 산출물이 적재될 지식그래프는 OWL2/RDFS 기반 4계층 구조이며, 각 계층의 대표 클래스 및 역할은 표 4에서 보인다.

**표 4. 지식그래프 계층별 대표 클래스 및 역할**

| 레이어 | 대표 클래스 | 설명 |
|---|---|---|
| Layer 1 · 장소·시설 | AnimalHospital, AnimalPharmacy, PetGroomingShop, AnimalBoarding, CulturalFacility, RestArea, AnimalCremation | 전국 반려동물 관련 시설 노드. WGS84 좌표를 geo:lat / geo:long 속성으로 표현 |
| Layer 2 · 동물·보호 | AbandonedAnimal, LostAnimal, AnimalShelter | 구조·분실동물 개체 노드. RFID 코드 또는 유사도 기반 owl:sameAs 연결 |
| Layer 3 · 의료 지식 | Symptom, SymptomCategory, Disease, VetDepartment | 추론 체인: Symptom → Disease → (부분) VetDepartment |
| Layer 4 · 지역 연결 | Region | 모든 시설·동물·센터 노드를 aloo:locatedIn 관계로 연결하는 허브 계층 |

네임스페이스는 aloo:(도메인 온톨로지)와 data:(인스턴스)로 분리한다. 의료 지식 계층의 추론 체인은 동물질병 증상분류 데이터에서 SymptomCategory → Symptom을, 동물성장·질병 QA 데이터에서 Symptom → Disease → VetDepartment 트리플을 추출하여 구성한다.

본 파이프라인은 pyproj·pandas·rdflib 등 Python 라이브러리를 활용하여 구현되었다. 원본 76,043건에 대해 좌표 변환·유효성 필터·스키마 정규화·품질 검증의 4단계까지 완료하여 55,688건의 유효 레코드(평균 탈락률 26.8%)를 산출하였다.

---

## Ⅴ. 결론 및 향후 과제

본 논문은 국내 7개 기관 14종 반려동물 공공 데이터를 단일 지식그래프로 통합하기 위해, 전처리가 요구되는 이유를 좌표계 혼용·유효 레코드 오염·이기종 스키마·품질 이슈·개체 연결의 다섯 가지 유형으로 체계화하고, 각각이 공간 연결·서비스 신뢰성·의미적 통합·추론 정확도·동일성 확립이라는 지식그래프 구성의 핵심 요건과 대응함을 보였다. 이를 기반으로 5단계 전처리 파이프라인과 시설·동물·의료·지역의 4계층 지식그래프 구조를 설계하였으며, 76,043건의 데이터에 적용한 결과 유효 레코드 55,688건(탈락률 26.8%)을 정량적으로 관측하였다.

한계는 다음과 같다. 첫째, 제안된 다섯 가지 전처리 유형과 5단계 파이프라인은 14종 한국 반려동물 공공 데이터에서 귀납적으로 도출된 결과이므로, 시설·개체·지식체계가 혼재된 타 도메인 공공데이터에 대한 일반화 가능성은 추가 검증이 필요하다. 둘째, 스키마 정규화와 품질 검증 단계의 매핑 규칙은 현재 데이터셋별 수동 설정에 의존하며, 자동화된 규칙 도출 메커니즘은 포함되지 않는다.

향후 과제로는 정의된 4계층 어휘를 기반으로 14종 공공 데이터에 대한 지식그래프 모델링을 적용할 예정이다.

---

## 참 고 문 헌

[1] KB금융지주 경영연구소, "2023 한국 반려동물보고서," KB금융지주 경영연구소 보고서, 2023.

[2] 홍현석, 김장원, "지식그래프를 활용한 공공데이터 연계 방법," 2024 한국정보기술학회 추계 종합학술대회 논문집, pp. 74–76, 2024.

[3] 송채은, "도서관 데이터의 상호운용성 개선을 위한 지식그래프 적용방안," 고려대학교 석사학위논문, 2023.

[4] V. T. Hoang, T. S. Nguyen, S. Lee, J. Lee, L. V. Nguyen, and O. Lee, "Companion Animal Disease Diagnostics Based on Literal-Aware Medical Knowledge Graph Representation Learning," *IEEE Access*, vol. 11, pp. 114238–114249, Oct. 2023.

[5] H. Kim, "Building Knowledge Graph of the Korea Administrative District for Interlinking Public Open Data," *J. Korea Contents Assoc.*, vol. 17, no. 1, pp. 1–11, Jan. 2017.

[6] F. C. Dórea, F. Vial, K. Hammar, A. Lindberg, P. Lambrix, E. Blomqvist, and C. W. Revie, "Drivers for the Development of an Animal Health Surveillance Ontology (AHSO)," *Prev. Vet. Med.*, vol. 166, pp. 39–48, May 2019.

[7] E. Rajabi, R. Midha, and J. F. de Souza, "Constructing a Knowledge Graph for Open Government Data: The Case of Nova Scotia Disease Datasets," *J. Biomed. Semant.*, vol. 14, Apr. 2023, Art. no. 4.

[8] K. Janowicz et al., "Know, Know Where, KnowWhereGraph: A Densely Connected, Cross-Domain Knowledge Graph and Geo-Enrichment Service Stack for Applications in Environmental Intelligence," *AI Mag.*, vol. 43, no. 1, pp. 30–39, Mar. 2022.

[9] Y. Liu, J. Ding, Y. Fu, and Y. Li, "UrbanKG: An Urban Knowledge Graph System," *ACM Trans. Intell. Syst. Technol.*, vol. 14, no. 4, pp. 1–25, 2023.

[10] D. Van Assche, T. Delva, G. Haesendonck, P. Heyvaert, B. De Meester, and A. Dimou, "Declarative RDF Graph Generation from Heterogeneous (Semi-)Structured Data: A Systematic Literature Review," *J. Web Semant.*, vol. 75, Jan. 2023, Art. no. 100753.

[11] V. Christophides, V. Efthymiou, T. Palpanas, G. Papadakis, and K. Stefanidis, "An Overview of End-to-End Entity Resolution for Big Data," *ACM Comput. Surv.*, vol. 53, no. 6, Dec. 2020, Art. no. 127.