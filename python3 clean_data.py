from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, SpectralClustering
from sklearn.mixture import GaussianMixture
import numpy as np
from collections import Counter

# 데이터 로드 (txt 파일 직접 읽기)
import pandas as pd
df = pd.read_csv('input_iris.txt', header=None)
X = df.iloc[:, :4].values                      # 피처 4개 추출
y_str = df.iloc[:, 4].values                   # 문자열 레이블
label_map = {'setosa': 0, 'versicolor': 1, 'virginica': 2}
y = np.array([label_map[l] for l in y_str])    # 숫자 레이블로 변환

# 표준화 및 데이터 분할
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)             # 평균 0, 분산 1로 표준화
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.3, random_state=42
)

# ── K-Means ──────────────────────────────────
kmeans = KMeans(n_clusters=3,                  # 클러스터 수 = 클래스 수
                init='k-means++',              # 초기 중심 분산 배치
                random_state=42)
km_train = kmeans.fit_predict(X_train)         # 학습 + 클러스터 배정
km_test  = kmeans.predict(X_test)              # 학습된 중심으로 test 배정

# ── DBSCAN ───────────────────────────────────
# 하이퍼파라미터 탐색: train 데이터로 최적 eps, min_samples 결정
best_acc, best_eps, best_min = 0, 0, 0
for eps in [0.4, 0.5, 0.6, 0.7, 0.8, 0.9]:
    for min_s in [3, 4, 5, 6]:
        pred = DBSCAN(eps=eps, min_samples=min_s).fit_predict(X_train)
        n_c = len(set(pred)) - (1 if -1 in pred else 0)
        if n_c < 2: continue                   # 유효 클러스터 2개 미만 skip
        acc = clustering_accuracy(y_train, pred)
        if acc > best_acc:
            best_acc, best_eps, best_min = acc, eps, min_s

# 최적 파라미터(eps=0.8, min_samples=5)로 test 적용
dbscan = DBSCAN(eps=best_eps, min_samples=best_min)
db_train = dbscan.fit_predict(X_train)
db_test  = DBSCAN(eps=best_eps,                # DBSCAN은 predict 미지원
                  min_samples=best_min).fit_predict(X_test)

# ── Hierarchical (Agglomerative) ─────────────
agg = AgglomerativeClustering(n_clusters=3,
                               linkage='ward') # 분산 최소화 기준 병합
agg_train = agg.fit_predict(X_train)
agg_test  = AgglomerativeClustering(n_clusters=3,
                                     linkage='ward').fit_predict(X_test)

# ── Spectral Clustering ───────────────────────
spc = SpectralClustering(n_clusters=3,
                          affinity='rbf',      # 가우시안 커널 유사도 행렬
                          random_state=42)
spc_train = spc.fit_predict(X_train)
spc_test  = SpectralClustering(n_clusters=3,
                                affinity='rbf',
                                random_state=42).fit_predict(X_test)

# ── GMM (Gaussian Mixture Model) ─────────────
gmm = GaussianMixture(n_components=3,          # 혼합 가우시안 분포 수
                       random_state=42)
gmm.fit(X_train)
gmm_train = gmm.predict(X_train)
gmm_test  = gmm.predict(X_test)                # GMM은 predict 지원