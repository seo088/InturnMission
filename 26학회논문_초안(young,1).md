## 공공데이터 기반 반려동물 통합 서비스 플랫폼을 위한 데이터 전처리 파이프라인 설계 및 지식그래프 구축 방안

Design of a Data Preprocessing Pipeline and Knowledge Graph Construction for a Public Data-Based Integrated Pet Care Service Platform

---

### 초록

**국문**

본 연구는 이기종 반려동물 공공데이터를 단일 지식그래프로 통합하기 위한 전처리 파이프라인을 설계하고 구현한다. 국내 반려동물 양육 가구 비율은 2023년 기준 전체 가구의 약 28.2%에 달한다. 정부는 동물병원, 동물약국, 구조동물 공고 등 다양한 공공 데이터를 개방하고 있다. 그러나 각 기관의 데이터는 좌표계 혼용, 이기종 스키마 등의 품질 문제를 내포한다. 전처리 없이 데이터를 결합하면 의미론적 불일치 및 오류 연결(spurious triple)이 대량 발생한다. 본 연구는 이러한 품질 문제를 분석하고, 좌표 변환, 상태 필터링, 스키마 정규화, 개체 연결(Entity Resolution), 품질 검증의 5단계 전처리 파이프라인을 설계 및 구현하였다. 정제된 데이터는 RDF 트리플로 변환되어 반려동물 도메인 지식그래프의 기반 데이터로 활용된다. 이를 통해 증상 기반 질병 추론 및 분실·구조동물 매칭 기능을 갖춘 통합 플랫폼 '애니멀루(AnimalLoo)'의 구축 방안을 제시한다.

**영문**

This study designs and implements a preprocessing pipeline to integrate heterogeneous pet-related public datasets into a unified knowledge graph. As of 2023, approximately 28.2% of Korean households own pets. The government provides various public datasets including animal hospitals, pharmacies, and rescued animal announcements. However, each agency's data suffers from quality issues such as coordinate system mismatches and divergent schemas. Merging these datasets without preprocessing causes semantic inconsistencies and spurious triples. This study analyzes these quality issues and implements a 5-stage preprocessing pipeline comprising coordinate transformation, status filtering, schema normalization, entity resolution, and quality validation. The refined data are converted into RDF triples as input for a domain-specific knowledge graph. The ultimate goal is to establish a technical foundation for 'AnimalLoo,' an integrated platform providing symptom-based disease inference and lost-and-rescued animal matching.

**Keywords**

Knowledge Graph, Public Data, Preprocessing Pipeline, Entity Resolution, Pet Care Service

---

### Ⅰ. 서론.

반려동물 관련 통합 서비스 플랫폼을 구축하기 위해서는 여러 기관의 공공데이터를 하나로 통합하는 과정이 필요하다. 국내 반려동물 관련 산업이 성장함에 따라 정부는 동물병원, 분실·구조동물, 동물 질병 등 14종의 공공데이터를 개방하고 있다.
반면 이들 데이터는 있는 그대로 활용할 수 없다. 각 기관의 데이터는 좌표계, 필드 구성, 데이터 형식이 서로 다르다. 이를 전처리 없이 결합하면 잘못된 연결(spurious triple)이 대량 발생하여 지식그래프의 추론 정확도가 저하된다 [1]. 이에 공공데이터를 지식그래프로 구축하기 위해서는 체계적인 전처리 과정이 요구된다 [2].
관련 연구로는 이기종 데이터 변환 [3], 개체 연결(Entity Resolution) [4], 반려동물 질병 진단 [5], 지리 정보 연계 및 도시 지식그래프 구축 [6][7] 등이 있다. 다만 다수 기관의 이기종 반려동물 데이터를 대상으로 전처리 파이프라인을 설계하고 지식그래프로 통합한 연구는 찾기 어렵다.
이를 위해 본 연구는 6개 기관 14종 공공데이터를 대상으로 좌표 변환, 상태 필터링, 스키마 정규화, 개체 연결, 품질 검증의 5단계 전처리 파이프라인을 설계 및 구현하였다. 이를 통해 정제된 데이터를 RDF/OWL 기반 지식그래프로 변환하고, 증상 기반 질병 추론과 분실·구조동물 매칭 기능을 갖춘 통합 플랫폼 애니멀루(AnimalLoo)의 구축 방안을 제시한다.
본 논문은 2장 관련 연구, 3장 공공데이터 수집 및 전처리, 4장 지식그래프 설계 및 구현, 5장 결론 순으로 구성된다.

### **Ⅱ. 관련 연구**

지식그래프는 개체 간의 의미적 관계를 표현하는 구조로, 다양한 데이터 통합 및 추론 분야에서 활발히 연구되고 있다 [1]. 김현지·김학래 [2]는 행정표준코드를 활용하여 공공데이터의 품질을 진단하고 개선하는 방법을 제안하였으며, 공공데이터의 정확성과 일관성 확보가 데이터 활용의 핵심 조건임을 밝혔다.
공공데이터를 지식그래프로 연계하는 연구도 진행되었다. 송채은 [3]은 분산된 도서관 공공데이터의 상호운용성 개선을 위해 지식그래프를 적용하는 방안을 연구하였다. 홍현석·김장원 [4]은 도로명주소를 공통 연계 항목으로 활용하여 이기종 공공데이터를 지식그래프로 연결하는 방법을 제안하였다. Hoang et al. [5]은 반려동물 전자 의료 기록 기반 지식그래프를 구축하고 증상으로부터 질병을 진단하는 모델을 제시하였다. Rajabi et al. [6]과 Portisch et al. [7]은 각각 공개 정부 데이터를 RDF 기반 지식그래프로 구축하는 방법과 공공데이터를 지식그래프와 연계할 때 발생하는 스키마 불일치 문제를 다루었다. 류민우·차시호 [8]는 온톨로지 학습을 통해 지식그래프를 자동으로 구축하는 방법을 제안하였다.
이상의 연구는 단일 도메인 또는 단일 데이터 유형을 대상으로 한다. 반면 본 연구는 6개 기관 14종의 이기종 반려동물 공공데이터를 통합 대상으로 하며, 전처리 파이프라인 설계부터 지식그래프 구축 및 시각화까지의 전 과정을 다룬다는 점에서 차별성을 가진다.

### Ⅲ. 공공데이터 수집 및 전처리

본 연구는 공공데이터포털(data.go.kr)을 통해 총 6개 기관의 14종 반려동물 관련 공공데이터를 수집하였다. 수집 형태는 API 및 CSV이며, 전처리 완료 후 최종 54,721건의 유효 레코드를 확보하였다. 각 데이터셋의 수집 현황은 표 1과 같다.

**표 1. 수집 공공데이터셋 현황**

| # | 데이터셋명 | 제공기관 | 원본 건수 | 유효 건수 | 유효율(%) | 좌표계 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 동물병원 조회 | 행정안전부 | 10,475 | 5,406 | 51.6 | EPSG:5174 |
| 2 | 동물약국 조회 | 행정안전부 | 19,908 | 13,194 | 66.3 | EPSG:5174 |
| 3 | 동물미용업 조회 | 행정안전부 | 15,432 | 10,879 | 70.5 | EPSG:5174 |
| 4 | 동물위탁관리업 조회 | 행정안전부 | 9,618 | 5,845 | 60.8 | EPSG:5174 |
| 5 | 동물장묘업 조회 | 행정안전부 | 99 | 86 | 86.9 | EPSG:5174 |
| 6 | 구조동물 조회 | 농림축산검역본부 | 15,241 | 15,241 | 100.0 | — |
| 7 | 분실동물 조회 | 농림축산검역본부 | 2,963 | 2,963 | 100.0 | — |
| 8 | 동물보호센터 조회 | 농림축산식품부 | 330 | 330 | 100.0 | WGS84 |
| 9 | 반려동물 동반 문화시설 | 한국문화정보원 | 100 | 100 | 100.0 | WGS84 |
| 10 | 휴게소 반려동물 놀이터 | 한국도로공사 | 20 | 20 | 100.0 | 좌표 부재 |
| 11 | 동물질병 증상분류 | 한국과학기술정보연구원 | 516 | 516 | 100.0 | — |
| 12 | 동물성장·질병 QA | 한국과학기술정보연구원 | 25 | 25 | 100.0 | — |
| 13 | 동물질병 정보 | 농림축산검역본부 | 116 | 116 | 100.0 | — |
| 합계 |  |  | 75,043 | 54,721 | 72.9 |  |

이기종 공공데이터를 전처리 없이 결합하면 잘못된 연결(spurious triple)이 대량 발생한다. 공공데이터의 품질 문제는 데이터 활용의 핵심 장애 요인으로 지적되어 왔다 [2]. 본 연구에서 식별한 주요 품질 문제는 세 가지이다. 첫째, 좌표계 혼용 문제이다. 행정안전부 시설 데이터는 EPSG:5174 좌표계를 사용한다. 반면 타 기관 데이터는 WGS84를 사용하거나 좌표 정보가 없다. 좌표계가 통일되지 않으면 위치 기반 공간 쿼리가 불가능하다. 둘째, 유효하지 않은 레코드 혼재 문제이다. 수집된 동물병원 원본 10,475건 중 실제 영업 중인 시설은 5,406건으로 약 51.6%에 불과하다. 폐업 데이터를 필터링 없이 적재하면 사용자에게 잘못된 정보가 제공된다. 셋째, 스키마 불일치 및 데이터 타입 오류 문제이다. 기관마다 필드명이 다르고, 구조동물 체중 표기의 단위 혼용("kg", "Kg"), 나이 필드의 비정형 텍스트 혼재 등 정규화가 필요한 항목이 다수 존재한다 [4]. 또한 분실·구조동물 데이터에는 동일 개체가 서로 다른 기관 데이터에 중복 존재할 위험이 있어 개체 연결(Entity Resolution) 처리가 요구된다.

본 연구는 이러한 품질 문제를 해결하기 위해 5단계 전처리 파이프라인을 설계 및 구현하였다. 1단계는 좌표 변환으로, 행정안전부 시설 데이터의 EPSG:5174 좌표를 WGS84로 일괄 변환한다. 2단계는 상태 필터링으로, 영업 및 보호 상태 기준으로 유효 레코드만 추출한다. 3단계는 스키마 정규화로, 기관별로 다른 필드명을 공통 스키마로 통일하고 비정형 텍스트 필드를 정규표현식 기반으로 정제한다. 4단계는 개체 연결로, RFID 코드 일치 여부를 우선 확인하고 품종·색상·발생 지역의 복합 유사도를 산출하여 동일 개체에 owl:sameAs 관계를 부여한다. 5단계는 품질 검증으로, 결측치·중복·범위 오류를 최종 점검한다. 검증을 통과한 데이터는 CSV-to-TTL 변환 스크립트를 통해 RDF 트리플(.ttl)로 변환된다.

### Ⅳ. 지식그래프 설계 및 구현

애니멀루(AnimalLoo) 플랫폼의 지식그래프는 정제된 공공데이터를 RDF 트리플로 변환하여 단일 저장소에 통합하는 구조로 설계되었다. 전체 시스템은 데이터 수집부터 서비스 제공까지 5계층(Layer) 아키텍처로 구성된다. 6개 기관 14종의 이기종 데이터 소스(Layer 1)는 전처리 파이프라인(Layer 2)을 거쳐 정제된다. 정제된 데이터는 지식그래프 저장소(Layer 3)에 온톨로지와 인스턴스 데이터로 분리 적재되며, SPARQL Endpoint를 통해 외부 시스템과 연동된다. 백엔드 API(Layer 4)와 React 기반 프론트엔드(Layer 5)는 이 저장소와 상호작용하여 사용자에게 서비스를 제공한다. 전체 아키텍처는 그림 1과 같다.

![image.png](attachment:3a5c773b-16a2-4009-811f-c013dfdc37c8:image.png)

[그림 1. 애니멀루 시스템 컴포넌트 다이어그램 — 5-Layer 아키텍처]

제안하는 지식그래프는 반려동물(aloo:Animal) 노드를 중심으로 4개의 도메인 레이어로 구성된 OWL2/RDFS 기반 온톨로지를 따른다. 장소·시설 레이어는 동물병원, 동물약국, 반려동물 동반 문화시설 등 전국 시설 노드를 포함하며 WGS84 좌표를 geo:lat, geo:long 속성으로 표현한다. 동물·보호 레이어는 구조동물과 분실동물 개체 노드를 포함하며 RFID 코드 또는 유사도 기반 owl:sameAs로 연결한다. 의료 지식 레이어는 Symptom, Disease, VetDepartment 노드로 구성되며 증상→질병→진료과로 이어지는 추론 체인을 형성한다. 지역 연결 레이어는 모든 시설·동물·센터 노드를 locatedIn 관계로 연결하는 허브 역할을 수행한다. 온톨로지 네임스페이스는 도메인 정의(aloo:)와 인스턴스 데이터(data:)로 분리하여 관리하며, 자연어 리터럴에는 @ko, @en 언어 태그를 명시하고 날짜 필드에는 ^^xsd:date 타입을 부여하였다 [1][3].

데이터 수집 및 지식그래프 구축의 흐름은 그림 2의 시퀀스 다이어그램과 같다. 연구자의 실행 요청에 따라 전처리 스크립트는 6개 기관의 공공 API 및 CSV 데이터를 수집한다. 이후 5단계 전처리를 거쳐 54,721건의 유효 레코드를 추출한다. 정제된 데이터는 aloo: 온톨로지 스키마에 따라 클래스 및 속성이 매핑되어 RDF(.ttl) 형식으로 변환된다. 생성된 트리플은 Triple Store에 적재되며, 적재 완료 시점부터 SPARQL Endpoint가 활성화된다.

![image.png](attachment:f859d93b-a7c2-4459-9910-6b919b576837:image.png)

[그림 2. 이기종 공공데이터 전처리 파이프라인 및 지식그래프 구축 시퀀스 다이어그램]

구축된 지식그래프의 구조와 추론 결과는 React 기반 프로토타입 UI를 통해 시각적으로 확인할 수 있다. 지식그래프 시각화 화면은 Triple Store에 적재된 노드와 엣지 간의 관계를 인터랙티브하게 탐색할 수 있는 뷰를 제공한다. 데이터셋 현황 대시보드는 14종 공공데이터의 수집 기관, 필드 구성, 전처리 및 지식그래프 연동 상태를 한눈에 파악할 수 있도록 설계되었다. 현재 프로토타입은 프론트엔드 컴포넌트 설계와 정적 데이터 연동을 완료한 상태이며, 향후 SPARQL Endpoint 기반 백엔드 API와 연동하여 실시간 추론 서비스를 완성할 예정이다.

![image.png](attachment:f8d8c5dc-37cc-4d24-878d-a50601f16ee9:image.png)

[화면 1. 온톨로지 기반 지식그래프 노드 간 관계 시각화 인터페이스]

![image.png](attachment:de065343-15b2-4637-9c76-bcbb4dc57ccf:image.png)

[화면 2. 14종 공공데이터 수집 및 지식그래프 연동 현황 대시보드]

### Ⅴ. 결론

본 연구는 6개 기관에 산재한 14종의 반려동물 공공데이터를 수집하고, 이를 단일 지식그래프로 통합하기 위한 전처리 파이프라인과 온톨로지 아키텍처를 설계 및 구현하였다. 이기종 데이터 결합 시 발생하는 좌표계 불일치, 유효하지 않은 레코드 혼재, 스키마 불일치의 세 가지 품질 문제를 체계적으로 분석하였다. 이를 해결하기 위해 좌표 변환, 상태 필터링, 스키마 정규화, 개체 연결, 품질 검증의 5단계 전처리 파이프라인을 적용하여 54,721건의 유효 레코드를 확보하였다. 정제된 데이터는 RDF 트리플로 변환되어 지식그래프의 기반 데이터로 활용된다.

설계된 지식그래프는 장소·시설, 동물·보호, 의료 지식, 지역 연결의 4개 도메인 레이어를 융합한 OWL2/RDFS 기반 온톨로지를 따른다. 이를 통해 증상 기반 질병 추론 및 분실·구조동물 매칭 서비스를 단일 플랫폼에서 제공할 수 있는 기술적 기반을 마련하였다 [5]. 현재 전처리 파이프라인과 TTL 변환 스크립트를 구현하였으며,현재 전처리 파이프라인과 TTL 변환 스크립트를 구현하였으며, React 기반 프로토타입 UI를 통해 수집된 공공데이터의 연동 현황과 지식그래프의 노드 및 관계 구조를 시각적으로 확인할 수 있다.

향후 연구는 세 단계로 진행된다. 첫째, Triple Store를 구축하고 변환된 TTL 파일을 적재한다. 둘째, SPARQL 쿼리 기반 백엔드 REST API를 구현한다. 셋째, 프론트엔드가 정적 목업 대신 실시간 API를 호출하도록 연동하여 지식그래프 기반 추론 서비스를 완성한다.

---

### 참고 문헌

[1] A. Hogan, E. Blomqvist, M. Cochez, C. d'Amato, G. de Melo, C. Gutierrez, S. Kirrane, J. E. Labra Gayo, R. Navigli, S. Neumaier, A.-C. Ngonga Ngomo, A. Polleres, S. M. Rashid, A. Rula, L. Schmelzeisen, J. Sequeda, S. Staab, and A. Zimmermann, "Knowledge Graphs," *ACM Computing Surveys*, Vol. 54, No. 4, Article 71, pp. 1–37, 2022.

[2] 김현지, 김학래, "행정표준코드의 기관코드를 활용한 공공데이터의 품질 개선 방법 제안", *디지털콘텐츠학회논문지*, Vol. 23, No. 3, pp. 481–488, 2022.

[3] 송채은, "도서관 데이터의 상호운용성 개선을 위한 지식그래프 적용방안", 중앙대학교 대학원 석사학위논문, 2023.

[4] 홍현석, 김장원, "지식그래프를 활용한 공공데이터 연계 방법", *2024 한국정보기술학회 추계 종합학술대회 논문집*, pp. 74–76, 2024.

[5] V. T. Hoang, S. T. Nguyen, S. Lee, J. Lee, L. V. Nguyen, and O.-J. Lee, "Companion Animal Disease Diagnostics Based on Literal-Aware Medical Knowledge Graph Representation Learning," arXiv:2309.03219, 2023.

[6] E. Rajabi, R. Midha, and J. F. de Souza, "Constructing a Knowledge Graph for Open Government Data: The Case of Nova Scotia Disease Datasets," *Journal of Biomedical Semantics*, Vol. 14, No. 4, 2023.

[7] J. Portisch, O. Fallatah, S. Neumaier, M. Y. Jaradeh, and A. Polleres, "Challenges of Linking Organizational Information in Open Government Data to Knowledge Graphs," arXiv:2008.06232, 2020.

[8] 류민우, 차시호, "온톨로지 학습 기반 지식 그래프 구축", *컴퓨터교육학회논문지*,