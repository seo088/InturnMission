export const HEALTH_DRAFTS_KEY = 'animal-route.health-check.drafts.v2'
const LEGACY_HEALTH_DRAFT_KEY = 'animal-route.health-check.v1'
const SESSION_KEY = 'animal-route.demo-session.v1'
const PET_PROFILES_KEY = 'animal-route.pet-profiles.v1'
const MEMBER_PROFILE_KEY = 'animal-route.member-profile.v1'
export const MEMBER_PROFILE_UPDATED_EVENT = 'animal-route:member-profile-updated'

const DEMO_PETS = [
  { id: 'pet-demo-ruby', name: '루비', species: 'dog', breed: '말티즈', age: '5살', sex: '암컷', neutered: '완료', region: '군산' },
  { id: 'pet-demo-maru', name: '마루', species: 'cat', breed: '코리안숏헤어', age: '3살', sex: '수컷', neutered: '완료', region: '군산' },
]

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

function readSession(key, fallback) {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback } catch { return fallback }
}

function write(key, value) { localStorage.setItem(key, JSON.stringify(value)) }
function writeSession(key, value) { sessionStorage.setItem(key, JSON.stringify(value)) }

export function getDashboardSession() {
  const state = read(SESSION_KEY, { version: 1, mode: 'guest', member: null })
  return state?.mode === 'member-demo' ? state : { version: 1, mode: 'guest', member: null }
}

export function startDemoSession() {
  const session = { version: 1, mode: 'member-demo', member: { id: 'demo-guardian', displayName: '보호자' } }
  write(SESSION_KEY, session)
  if (!read(PET_PROFILES_KEY, null)?.pets?.length) write(PET_PROFILES_KEY, { version: 1, activePetId: DEMO_PETS[0].id, pets: DEMO_PETS })
  return session
}

export function endDemoSession() { write(SESSION_KEY, { version: 1, mode: 'guest', member: null }) }

export function getMemberProfile() {
  const saved = read(MEMBER_PROFILE_KEY, null)
  return { version: 1, displayName: saved?.displayName || '보호자', avatarDataUrl: saved?.avatarDataUrl || null }
}

export function updateMemberProfile(patch) {
  const current = getMemberProfile()
  const displayName = typeof patch.displayName === 'string' ? patch.displayName.trim().slice(0, 20) : current.displayName
  const next = { ...current, ...patch, displayName: displayName || '보호자', updatedAt: new Date().toISOString() }
  write(MEMBER_PROFILE_KEY, next)
  window.dispatchEvent(new CustomEvent(MEMBER_PROFILE_UPDATED_EVENT, { detail: next }))
  return next
}

export function getPetProfiles() {
  const state = read(PET_PROFILES_KEY, { version: 1, activePetId: null, pets: [] })
  const pets = Array.isArray(state.pets) ? state.pets : []
  return { ...state, pets, activePetId: pets.some((pet) => pet.id === state.activePetId) ? state.activePetId : pets[0]?.id ?? null }
}

export function setActivePetId(activePetId) {
  const profiles = getPetProfiles()
  write(PET_PROFILES_KEY, { ...profiles, activePetId })
}

export function getActivePet() {
  const profiles = getPetProfiles()
  return profiles.pets.find((pet) => pet.id === profiles.activePetId) ?? null
}

export function getDashboardView() {
  const session = getDashboardSession()
  const profiles = getPetProfiles()
  const activePet = getActivePet()
  const activeDraft = loadHealthDraft(session.mode === 'member-demo' ? activePet?.id : 'guest')
  const petCount = profiles.pets.length
  const view = session.mode !== 'member-demo'
    ? (activeDraft ? 'guest-draft' : 'guest-empty')
    : petCount === 0 ? 'member-empty' : petCount === 1 ? 'member-single' : 'member-multiple'
  return { session, profiles, activePet, activeDraft, petCount, view }
}

function migrateLegacyDraft() {
  const current = readSession(HEALTH_DRAFTS_KEY, null)
  if (current?.version === 2) return current
  const legacy = readSession(LEGACY_HEALTH_DRAFT_KEY, null)
  const next = { version: 2, drafts: legacy?.version === 1 ? { guest: { updatedAt: legacy.updatedAt, stage: 1, data: legacy.data } } : {} }
  writeSession(HEALTH_DRAFTS_KEY, next)
  return next
}

export function getDraftOwner() {
  const session = getDashboardSession()
  return session.mode === 'member-demo' ? getActivePet()?.id ?? 'guest' : 'guest'
}

export function loadHealthDraft(owner = getDraftOwner()) { return migrateLegacyDraft().drafts?.[owner] ?? null }

export function saveHealthDraft({ owner = getDraftOwner(), stage, data }) {
  const state = migrateLegacyDraft()
  writeSession(HEALTH_DRAFTS_KEY, { ...state, drafts: { ...state.drafts, [owner]: { updatedAt: new Date().toISOString(), stage, data } } })
}

export function clearHealthDraft(owner = getDraftOwner()) {
  const state = migrateLegacyDraft()
  const drafts = { ...state.drafts }
  delete drafts[owner]
  writeSession(HEALTH_DRAFTS_KEY, { ...state, drafts })
}

export function draftLabel(stage) { return ['반려동물 정보', '증상 입력', '증상 확인', '건강 경로 결과'][Number(stage) - 1] ?? '작성 중' }
