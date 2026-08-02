import axios from 'axios'

const client = axios.create({ baseURL: '/api', timeout: 10000 })

export const fetchDashboardStats  = () => client.get('/dashboard/stats').then(r => r.data)
export const fetchKGOverview      = () => client.get('/dashboard/overview').then(r => r.data)
export const fetchRegionStats     = () => client.get('/dashboard/region-stats').then(r => r.data)
export const fetchDatasetTypes    = () => client.get('/dashboard/dataset-types').then(r => r.data)
export const fetchDatasets        = () => client.get('/datasets').then(r => r.data)
export const fetchKGNodes         = () => client.get('/kg/nodes').then(r => r.data)
export const fetchKGEdges         = () => client.get('/kg/edges').then(r => r.data)
export const fetchQualityMetrics  = () => client.get('/quality/metrics').then(r => r.data)
export const fetchNationalCosts   = (params = {}) => client.get('/costs/national', { params }).then(r => r.data)
export const fetchSidoCostGap     = (params = {}) => client.get('/costs/sido-gap', { params }).then(r => r.data)
export const fetchWalkRecommendation = (params = {}) => client.get('/environment/walk-recommendation', { params }).then(r => r.data)
export const fetchDrugs           = (params = {}) => client.get('/drugs', { params }).then(r => r.data)
export const fetchSymptomReviewQueue = (params = {}) => client.get('/symptom-reviews/queue', { params }).then(r => r.data)
export const fetchSymptomReviewStats = () => client.get('/symptom-reviews/stats').then(r => r.data)
export const createSymptomReviewDecision = (reviewId, payload) => client
  .post(`/symptom-reviews/${encodeURIComponent(reviewId)}/decisions`, payload)
  .then(r => r.data)
