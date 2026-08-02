const SOURCE = '농림축산식품부 보도자료(2025.12.22) 공공 조사 요약'

export const FALLBACK_NATIONAL_COSTS = [
  { Category: '진찰', ItemName: '초진 진찰료', WeightClass: '전체', AvgCost: 10520, MedianCost: 10000, MinCost: 1000, MaxCost: 61000, CostYear: 2025, RegionScope: '전국', Source: SOURCE },
  { Category: '진찰', ItemName: '재진 진찰료', WeightClass: '전체', AvgCost: 8457, MedianCost: 8000, MinCost: 1000, MaxCost: 61000, CostYear: 2025, RegionScope: '전국', Source: SOURCE },
  { Category: '상담', ItemName: '상담료', WeightClass: '전체', AvgCost: 10283, MedianCost: 10000, MinCost: 1000, MaxCost: 110000, CostYear: 2025, RegionScope: '전국', Source: SOURCE },
  { Category: '입원', ItemName: '입원비(개)', WeightClass: '전체', AvgCost: 65040, MedianCost: 60000, MinCost: 10000, MaxCost: 330000, CostYear: 2025, RegionScope: '전국', Source: SOURCE },
  { Category: '백신접종', ItemName: '종합백신(개)', WeightClass: '전체', AvgCost: 25935, MedianCost: 25000, MinCost: 10000, MaxCost: 70000, CostYear: 2025, RegionScope: '전국', Source: SOURCE },
]

export const FALLBACK_SIDO_GAPS = [
  { ItemName: '초진료', MinAvgCost: 9397, MinSido: '충북', MaxAvgCost: 13051, MaxSido: '대전', GapRatio: 1.4, CostYear: 2025, Source: SOURCE },
  { ItemName: '상담료', MinAvgCost: 7389, MinSido: '전남', MaxAvgCost: 12881, MaxSido: '대전', GapRatio: 1.7, CostYear: 2025, Source: SOURCE },
  { ItemName: '입원비(개)', MinAvgCost: 56087, MinSido: '광주', MaxAvgCost: 81565, MaxSido: '충남', GapRatio: 1.5, CostYear: 2025, Source: SOURCE },
  { ItemName: '광견병백신', MinAvgCost: 19600, MinSido: '세종', MaxAvgCost: 29234, MaxSido: '대구', GapRatio: 1.5, CostYear: 2025, Source: SOURCE },
]
