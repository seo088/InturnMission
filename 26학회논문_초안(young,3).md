# 공공데이터 기반 반려동물 지식그래프 구축을 위한 전처리 파이프라인 설계
**Design of a Preprocessing Pipeline for Constructing a Companion Animal Knowledge Graph from Heterogeneous Public Data**

**김서영\*, 김장원\*†**  
\*국립군산대학교 소프트웨어학과 {tjdud0760@kunsan.ac.kr, jwgim@kunsan.ac.kr}  
†교신저자 (jwgim@kunsan.ac.kr)

---

**※ 본 연구는 2026년도 과학기술정보통신부 및 정보통신기획평가원의 “SW중심대학사업”지원을 받아 수행되었음(2023-0-00065)**

---

### 초 록 (요 약)
반려동물 관련 공공데이터 개방이 확대되고 있으나, 이들 데이터는 다수의 기관에 분산 관리되어 좌표계 혼용, 코드 체계 불일치, 이기종 스키마 등의 품질 이슈를 지닌다. 이를 정제 없이 결합할 경우 지식그래프 기반 추론 결과의 신뢰성이 저하될 수 있다. 본 논문은 이기종 공공데이터를 단일 지식그래프로 통합하기 위한 전처리 요구사항을 5가지 유형(좌표계·유효성·스키마·품질·개체연결)으로 체계화하고, 이에 대응하는 전처리 파이프라인과 4계층 도메인 지식그래프 구조를 제안한다. 이를 통해 시설·개체·의료지식이 혼재된 도메인 특화 데이터 통합 과정에서 전처리가 갖추어야 할 의미 정렬 요건을 체계적으로 정의한다.

### Abstract
With growing demand for companion animal services, diverse public data has been opened. However, dispersed data across agencies contains quality issues like heterogeneous coordinates and divergent schemas, which may compromise knowledge graph inferences. This paper categorizes the preprocessing requirements for unifying such data into five types (coordinate, validity, schema, quality, and entity linkage), proposing a corresponding pipeline and a four-layer knowledge graph structure. This classification systematically defines the semantic alignment requirements for integrating public data in specialized domains.

**Key words:** public data, preprocessing pipeline, knowledge graph, RDF/OWL2, companion animal, data integration, SPARQL

---

## Ⅰ. 서 론
국내 반려동물 보유 가구는 2023년 기준 전체 가구의 약 28.2%로 보고되었으며[1], 반려동물 관련 산업 규모 역시 확대되는 추세이다. 이에 정부는 시설, 보호동물, 의료 등 다양한 관련 공공데이터를 개방하고 있다[1]. 그러나 이 데이터들은 7개 기관(행정안전부, 농림축산검역본부 등)에서 독립적으로 생산되어 데이터 형식, 좌표계, 코드 체계가 상이하다. 여러 데이터셋을 단순 수집·결합하는 방식으로는 데이터 간 연결의 정확도가 떨어져 후속 추론 결과의 신뢰성에 악영향을 미칠 수 있다.

이기종 공공데이터의 의미적 통합 수단으로 지식그래프가 주목받고 있으나[2], 원시 데이터의 품질이 트리플 집합의 정확도와 직결되므로 전처리 파이프라인 설계가 통합의 선결 조건이 된다. 기존 연구[2-4]는 주로 행정 정보 중심의 일반적 연계나 단일 도메인에 집중되어 있어, 시설(공간)·개체(동물)·의료지식(분류)이 혼재된 다중 도메인의 특화 전처리 요구를 직접 다루지 못했다. 본 논문은 반려동물 도메인을 사례로 이러한 공백을 보완한다.

본 논문의 기여는 다음과 같다. 첫째, 7개 기관 14종 데이터 통합 시 발생하는 전처리 요구사항을 5가지 유형(좌표계, 유효성, 스키마, 품질, 개체연결)으로 체계화하여, 타 도메인에도 재사용 가능한 틀을 제시했다. 둘째, 이에 대응하는 5단계 파이프라인을 설계하고 76,843건의 데이터에 적용해 정량적 전처리 효과(평균 탈락률 27.5%)를 관측했다. 셋째, 정제 결과를 적재할 4계층 도메인 지식그래프 구조를 제안했다. 넷째, 전처리 유형과 지식그래프 구성 요건을 매핑하여, 전처리를 단순 정제가 아닌 의미 정렬 과정으로 정형화했다.

## Ⅱ. 관련 연구 및 활용 데이터 개요
공공데이터 연계 절차와 관련해 Kim은 행정구역 기반의 LOD 형태 연계 방안을 제안했고[5], 홍·김은 도로명주소 기반의 4단계 지식그래프 생성 절차를 제시했다[2]. 두 연구는 행정 정보를 공통 키로 활용한 일반적 연계 절차를 정의했으나, 의료 분류체계 정렬이나 개체 식별 등 도메인 특화 전처리는 다루지 않았다.

도메인 특화 지식그래프 구축 연구도 활발하다. Dórea 등은 동물 건강 감시용 AHSO 온톨로지를 설계했고[6], Hoang 등은 반려동물 질병 진단용 지식그래프 표현 학습 모델을 제안했다[4]. 또한 공공 질병 데이터셋 지식그래프[7], 환경 분야 다중 도메인 KnowWhereGraph[8], 도시 데이터 대상 UrbanKG[9] 등이 구축되었다. 이들은 단일·인접 도메인 구축에 성과를 냈으나, 반려동물 특화 한국 공공데이터 통합 전처리는 논의하지 않았다.

이기종 데이터 변환 및 개체 연결 방법론에 관해 Van Assche 등은 이기종 데이터의 선언적 RDF 그래프 생성 방법론을 고찰했고[10], Christophides 등은 종단간 개체 해소 기법을 검토했다[11].

요약하면, 기존 연구는 일반 행정 정보 연계[2][5]나 단일 도메인 지식그래프 구축[4][6][7]에 치중했다. 본 연구는 이를 시설·개체·의료지식 등 다중 이질 도메인 통합으로 확장한다. 아울러 기존의 추상적 RDF 변환 및 개체 연결 방법론[10][11]을 한국 공공데이터에 적용해 5단계의 구체적 전처리 파이프라인으로 구현했다는 점에서 차별성이 있다.

본 연구는 시설, 동물 보호, 의료·지식 등 3개 범주에 걸쳐 7개 기관의 공공데이터 14종을 수집했다(공공데이터포털 REST API 및 CSV 활용). 기관별 생산 목적과 시스템이 달라 필드명, 코드 체계, 좌표계 등이 상이하다. 시설 정보는 EPSG:5174, 동물보호센터·문화시설은 WGS84를 사용하며, 휴게소 데이터는 좌표가 없어 지오코딩이 필요하다. 구조·분실동물 및 의료지식 데이터는 비공간 데이터다. 데이터 수집 및 전처리 현황은 표 1과 같다.

**<표 1> 데이터 수집 및 전처리 현황**

| 번호 | 데이터셋명 | 원본 건수 | 유효 건수 | 유효율(%) |
|:---:|:---|:---:|:---:|:---:|
| 1 | 동물병원 조회 | 10,475 | 5,406 | 51.6 |
| 2 | 동물약국 조회 | 19,908 | 13,194 | 66.3 |
| 3 | 동물미용업 조회 | 15,432 | 10,879 | 70.5 |
| 4 | 동물위탁관리업 조회 | 9,618 | 5,845 | 60.8 |
| 5 | 동물장묘업 조회 | 99 | 86 | 86.9 |
| 6 | 구조동물 조회 | 15,241 | 15,241 | 100.0 |
| 7 | 분실동물 조회 | 2,963 | 2,963 | 100.0 |
| 8 | 동물보호센터 조회 | 330 | 330 | 100.0 |
| 9 | 반려동물 동반여행 | 1,000 | 1,000 | 100.0 |
| 10 | 반려동물 동반 문화시설 | 100 | 67 | 67.0 |
| 11 | 휴게소 반려동물 놀이터 | 20 | 20 | 100.0 |
| 12 | 동물질병 증상분류 | 516 | 516 | 100.0 |
| 13 | 동물성장·질병 QA | 25 | 25 | 100.0 |
| 14 | 동물질병 정보 | 116 | 116 | 100.0 |
| **합계** | | **76,843** | **55,688** | **72.5** |

## Ⅲ. 전처리 파이프라인 설계
Ⅱ장에서 수집한 14종 공공데이터의 표현 방식 차이는 직접 통합 시 부정확한 연결을 초래한다. 본 장에서는 이러한 차이를 5가지 전처리 유형으로 분류하고, 이에 대응하는 5단계 전처리 파이프라인 및 5계층(레이어) 지식그래프 구조를 설계한다. 전체 전처리 파이프라인의 구조는 그림 1과 같으며, API 연동부터 데이터베이스 적재까지의 수집·전처리 시퀀스는 그림 2에 나타내었다.

파이프라인의 첫 번째 단계는 공공API 연동으로, 각 기관의 REST API 또는 정적 CSV로부터 원시 데이터를 수집한다.

제안하는 전처리 파이프라인의 구체적인 5단계는 다음과 같다.
1. **공공 API 연동 및 데이터 수집**: 각 기관의 REST API 또는 정적 CSV로부터 원시 데이터를 수집한다.
2. **좌표계 변환 및 보정**: 시설 정보(EPSG:5174)와 보호센터·문화시설(WGS84)을 직접 결합하면 수백 미터의 오차가 발생한다[5]. 이를 방지하기 위해 pyproj 라이브러리를 활용하여 WGS84로 통일하고, `geo:lat`, `geo:long` 속성으로 적재한다. 좌표가 없는 휴게소 데이터는 Map API 기반 지오코딩으로 보정한다.
3. **유효 레코드 필터링**: 행정안전부 시설 데이터는 영업·폐업·휴업 상태가 혼재되어 유효율이 51.6~86.9%로 낮다(표 1). 시설 데이터는 "영업중", 구조동물 데이터는 "보호중" 상태만 유지하며, 이 과정을 통해 원본 데이터의 약 27.5%가 탈락한다.
4. **스키마 정규화 및 품질 검증**: 14종의 데이터셋은 동일한 속성이라도 표기법(예: 체중 "3.5 kg" vs "3.5kg", 날짜 "20240315" vs "2024-03-15")이 다르며, 식별자 필드의 물리적 순서 불일치 등 품질 이슈가 존재한다. 필드명을 카멜케이스(Camel Case)로 통일하고, 단위·날짜·행정구역 코드를 표준화하며, 외래키 무결성 검증으로 식별자 매핑 오류를 차단한다.
5. **RDF 변환 및 개체 연결**: rdflib를 활용해 Turtle 포맷의 트리플을 생성한다. 리터럴에는 언어 태그(`@ko`, `@en`)를, 날짜 필드에는 타입(`^^xsd:date`)을 부여해 SPARQL 쿼리를 지원한다. 실종·구조동물은 RFID 일치 시 `owl:sameAs` 관계를 부여하며, 불일치 시 품종, 색상, 성별, 발생 지역의 복합 유사도 점수를 기반으로 매칭 후보를 도출한다[11].

위의 5단계 파이프라인을 거쳐 의미적으로 정제된 데이터는 그림 3의 지식그래프 프로토타입으로 적재된다.

## Ⅳ. 결론
본 논문은 국내 7개 기관에서 제공하는 14종의 반려동물 공공데이터 연계를 위한 구체적인 전처리 파이프라인을 제안했다. 제안된 5단계 파이프라인을 통해 좌표계 통합, 스키마 매핑, 유효성 필터링 등의 이질성 문제를 해결하고 데이터 간 의미적 연계의 기반을 마련했다. 향후 구축된 정제 데이터를 바탕으로 본격적인 지식그래프 모델링을 수행하여, 관련 도메인 추론 시스템의 신뢰성을 향상시킬 계획이다.

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