import axios from 'axios'

const client = axios.create({ baseURL: '/api', timeout: 10000 })

export const fetchDashboardStats  = () => client.get('/dashboard/stats').then(r => r.data)
export const fetchRegionStats     = () => client.get('/dashboard/region-stats').then(r => r.data)
export const fetchDatasetTypes    = () => client.get('/dashboard/dataset-types').then(r => r.data)
export const fetchDatasets        = () => client.get('/datasets').then(r => r.data)
export const fetchKGNodes         = () => client.get('/kg/nodes').then(r => r.data)
export const fetchKGEdges         = () => client.get('/kg/edges').then(r => r.data)
export const fetchQualityMetrics  = () => client.get('/quality/metrics').then(r => r.data)
