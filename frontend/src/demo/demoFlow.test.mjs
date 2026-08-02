import test from 'node:test'
import assert from 'node:assert/strict'

import {
  assessClientSafety,
  fallbackMapping,
  fallbackResult,
  isRepresentativeCough,
  mergeLiveResult,
} from './demoFlow.js'


test('approved cough scenario is eligible for the explicit fallback', () => {
  assert.equal(isRepresentativeCough('짖고 나면 쿨럭거리며 기침해요'), true)
  assert.equal(fallbackMapping('오늘 피부가 가려워요'), null)
  assert.equal(fallbackMapping('짖고 나면 기침해요').candidates[0].code, 'i012')
})


test('client safety is fail-closed before mapping', () => {
  const urgent = assessClientSafety('숨을 제대로 못 쉬고 의식도 없어요')
  assert.equal(urgent.blocked, true)
  assert.equal(urgent.urgency, 'urgent')
  assert.equal(assessClientSafety('포도를 먹은 것은 아니고 장난감이에요').blocked, false)
})


test('fallback hospitals keep all clinical capabilities unknown', () => {
  const result = fallbackResult()
  assert.deepEqual(result.hospitals.map((hospital) => hospital.phone), [
    '063-461-5079',
    '063-452-6700',
    '063-463-5575',
  ])
  for (const hospital of result.hospitals) {
    assert.deepEqual(new Set(Object.values(hospital.capability)), new Set(['unknown']))
    assert.equal(hospital.availability_confirmation_required, true)
  }
})


test('live disease relations are merged with stronger reviewed contact cache', () => {
  const result = mergeLiveResult({
    diseases: [{
      uri: 'http://knowledgemap.kr/id/animal/disease/qa-tracheal-collapse',
      name: '기관허탈',
      display_priority: 1,
      confidence_status: 'not_evaluated',
    }],
    hospitals: [{ name: '군산24시 제일동물병원', phone: '' }],
  })
  assert.equal(result.source_mode, 'live_graph_hospital_cache')
  assert.equal(result.diseases[0].name, '기관허탈')
  assert.equal(result.hospitals[0].phone, '063-461-5079')
  assert.equal(result.hospitals[0].capability.emergency_care, 'unknown')
})
