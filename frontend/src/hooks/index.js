import { useQuery } from '@tanstack/react-query'
import { fetchDashboardStats, fetchRegionStats, fetchDatasetTypes, fetchDatasets, fetchKGNodes, fetchKGEdges, fetchQualityMetrics } from '../api'

export const useDashboardStats = () => useQuery({ queryKey: ['dashboard','stats'],   queryFn: fetchDashboardStats })
export const useRegionStats    = () => useQuery({ queryKey: ['dashboard','regions'], queryFn: fetchRegionStats })
export const useDatasetTypes   = () => useQuery({ queryKey: ['dashboard','types'],   queryFn: fetchDatasetTypes })
export const useDatasets       = () => useQuery({ queryKey: ['datasets'],            queryFn: fetchDatasets })
export const useKGNodes        = () => useQuery({ queryKey: ['kg','nodes'],          queryFn: fetchKGNodes })
export const useKGEdges        = () => useQuery({ queryKey: ['kg','edges'],          queryFn: fetchKGEdges })
export const useQualityMetrics = () => useQuery({ queryKey: ['quality'],             queryFn: fetchQualityMetrics })
