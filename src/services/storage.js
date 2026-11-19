// Storage service for A2 Key Master using localStorage & GitHub Gist Cloud Sync

const KEYS = {
  ANSWERS_PREFIX: 'a2_answers_',
  RESULTS_PREFIX: 'a2_results_',
  FLAGGED_PREFIX: 'a2_flagged_',
  STATS: 'a2_user_stats',
  SETTINGS: 'a2_settings',
  SYNC_CONFIG: 'a2_github_sync_config',
  SYNC_META: 'a2_sync_meta',
}

export const GIST_FILENAME = 'a2-key-master-sync.json'
export const GITHUB_TOKEN_CREATE_URL =
  'https://github.com/settings/tokens/new?scopes=gist&description=A2%20Key%20Master%20Sync'

const LEGACY_TIMESTAMP = '1970-01-01T00:00:01.000Z'

const getDefaultSettings = () => ({
  bilingual: true,
  volume: 0.9,
  autoPlayNext: false,
})

const getDefaultStats = () => ({
  streakDays: 3, // Initial encouraging streak for young learner
  totalTestsCompleted: 0,
  totalQuestionsAnswered: 0,
  averageScore: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
})

const getDefaultSyncConfig = () => ({
  token: '',
  gistId: '',
  githubUser: '',
  githubAvatar: '',
  autoSync: true,
  lastSyncedAt: null,
})

const getSyncMeta = () => {
  try {
    const raw = localStorage.getItem(KEYS.SYNC_META)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        updatedAtByKey: parsed.updatedAtByKey || {},
        deletedKeys: parsed.deletedKeys || {},
      }
    }
  } catch (e) {}
  return { updatedAtByKey: {}, deletedKeys: {} }
}

const saveSyncMeta = (meta) => {
  try {
    localStorage.setItem(KEYS.SYNC_META, JSON.stringify(meta))
  } catch (e) {
    console.error('Failed to save sync metadata', e)
  }
}

const touchSyncKey = (storageKey) => {
  const meta = getSyncMeta()
  meta.updatedAtByKey[storageKey] = new Date().toISOString()
  delete meta.deletedKeys[storageKey]
  saveSyncMeta(meta)
}

const markSyncKeyDeleted = (storageKey) => {
  const meta = getSyncMeta()
  meta.deletedKeys[storageKey] = new Date().toISOString()
  delete meta.updatedAtByKey[storageKey]
  saveSyncMeta(meta)
}

export const getSettings = () => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS)
    return raw ? JSON.parse(raw) : getDefaultSettings()
  } catch (e) {
    return getDefaultSettings()
  }
}

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
    touchSyncKey(KEYS.SETTINGS)
  } catch (e) {
    console.error('Failed to save settings', e)
  }
}

export const getSavedAnswers = (testId, paperKey) => {
  try {
    const key = `${KEYS.ANSWERS_PREFIX}${testId}_${paperKey}`
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

export const saveAnswer = (testId, paperKey, questionNumber, answer) => {
  try {
    const key = `${KEYS.ANSWERS_PREFIX}${testId}_${paperKey}`
    const current = getSavedAnswers(testId, paperKey)
    current[questionNumber] = answer
    localStorage.setItem(key, JSON.stringify(current))
    touchSyncKey(key)
    return current
  } catch (e) {
    console.error('Failed to save answer', e)
    return {}
  }
}

export const clearAnswers = (testId, paperKey) => {
  try {
    const key = `${KEYS.ANSWERS_PREFIX}${testId}_${paperKey}`
    localStorage.removeItem(key)
    markSyncKeyDeleted(key)
  } catch (e) {
    console.error('Failed to clear answers', e)
  }
}

export const clearFlaggedQuestions = (testId, paperKey) => {
  try {
    const key = `${KEYS.FLAGGED_PREFIX}${testId}_${paperKey}`
    localStorage.removeItem(key)
    markSyncKeyDeleted(key)
  } catch (e) {
    console.error('Failed to clear flagged questions', e)
  }
}

export const clearPaperResult = (testId, paperKey) => {
  try {
    const key = `${KEYS.RESULTS_PREFIX}${testId}_${paperKey}`
    localStorage.removeItem(key)
    markSyncKeyDeleted(key)
  } catch (e) {
    console.error('Failed to clear paper result', e)
  }
}

const recalculateStatsFromResults = () => {
  try {
    const stats = getGlobalStats()
    const progress = getAllTestProgress()
    const entries = Object.values(progress)
    stats.totalTestsCompleted = entries.length
    if (entries.length > 0) {
      const scoreSum = entries.reduce((sum, item) => sum + (item?.cambridgeScore || 120), 0)
      stats.averageScore = Math.round(scoreSum / entries.length)
      const qSum = entries.reduce((sum, item) => sum + (item?.totalQuestions || 0), 0)
      stats.totalQuestionsAnswered = Math.max(stats.totalQuestionsAnswered || 0, qSum)
    } else {
      stats.averageScore = 0
    }
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats))
    touchSyncKey(KEYS.STATS)
    return stats
  } catch (e) {
    console.error('Failed to recalculate stats', e)
    return getGlobalStats()
  }
}

/**
 * Reset all saved answers, flags, and (optionally) graded result for one paper or a whole test.
 */
export const clearTestProgress = (test, { includeResults = true } = {}) => {
  if (!test?.test_id) return
  const paperKeys = Object.keys(test.papers || {})
  const candidateKeys = paperKeys.length > 0 ? paperKeys : ['reading_and_writing', 'reading', 'listening']
  candidateKeys.forEach((pk) => {
    clearAnswers(test.test_id, pk)
    clearFlaggedQuestions(test.test_id, pk)
    if (includeResults) {
      clearPaperResult(test.test_id, pk)
    }
  })
  if (includeResults) {
    recalculateStatsFromResults()
  }
}

export const getAllSavedAnswerCounts = () => {
  try {
    const counts = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(KEYS.ANSWERS_PREFIX)) {
        const id = k.replace(KEYS.ANSWERS_PREFIX, '')
        try {
          const parsed = JSON.parse(localStorage.getItem(k) || '{}')
          const nonEmpty = Object.values(parsed).filter(
            (v) => v !== undefined && String(v).trim() !== ''
          ).length
          if (nonEmpty > 0) {
            counts[id] = nonEmpty
          }
        } catch (_) {}
      }
    }
    return counts
  } catch (e) {
    return {}
  }
}

export const getFlaggedQuestions = (testId, paperKey) => {
  try {
    const key = `${KEYS.FLAGGED_PREFIX}${testId}_${paperKey}`
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

export const toggleFlagQuestion = (testId, paperKey, questionNumber) => {
  try {
    const key = `${KEYS.FLAGGED_PREFIX}${testId}_${paperKey}`
    const current = getFlaggedQuestions(testId, paperKey)
    current[questionNumber] = !current[questionNumber]
    const hasAnyFlag = Object.values(current).some(Boolean)
    if (hasAnyFlag) {
      localStorage.setItem(key, JSON.stringify(current))
      touchSyncKey(key)
    } else {
      localStorage.removeItem(key)
      markSyncKeyDeleted(key)
    }
    return current
  } catch (e) {
    return {}
  }
}

export const saveResult = (testId, paperKey, resultData) => {
  try {
    const key = `${KEYS.RESULTS_PREFIX}${testId}_${paperKey}`
    localStorage.setItem(
      key,
      JSON.stringify({
        ...resultData,
        completedAt: new Date().toISOString(),
      })
    )
    touchSyncKey(key)

    // Update global stats
    updateGlobalStats(resultData)
  } catch (e) {
    console.error('Failed to save result', e)
  }
}

export const getResult = (testId, paperKey) => {
  try {
    const key = `${KEYS.RESULTS_PREFIX}${testId}_${paperKey}`
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export const getAllTestProgress = () => {
  try {
    const progress = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(KEYS.RESULTS_PREFIX)) {
        const id = k.replace(KEYS.RESULTS_PREFIX, '')
        try {
          progress[id] = JSON.parse(localStorage.getItem(k))
        } catch (_) {}
      }
    }
    return progress
  } catch (e) {
    return {}
  }
}

export const getGlobalStats = () => {
  try {
    const raw = localStorage.getItem(KEYS.STATS)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return getDefaultStats()
}

const updateGlobalStats = (resultData) => {
  try {
    const stats = getGlobalStats()
    const today = new Date().toISOString().split('T')[0]

    if (stats.lastActiveDate !== today) {
      stats.streakDays += 1
      stats.lastActiveDate = today
    }

    stats.totalTestsCompleted += 1
    stats.totalQuestionsAnswered += resultData.totalQuestions || 0

    const prevScoreSum = (stats.averageScore || 0) * (stats.totalTestsCompleted - 1)
    stats.averageScore = Math.round(
      (prevScoreSum + (resultData.cambridgeScore || 120)) / stats.totalTestsCompleted
    )

    localStorage.setItem(KEYS.STATS, JSON.stringify(stats))
    touchSyncKey(KEYS.STATS)
  } catch (e) {
    console.error('Failed to update stats', e)
  }
}

// ============================================================================
// GitHub Token Cloud Sync Configuration, Snapshots & Smart 2-Way Merge
// ============================================================================

export const getSyncConfig = () => {
  try {
    const raw = localStorage.getItem(KEYS.SYNC_CONFIG)
    if (!raw) return getDefaultSyncConfig()
    return { ...getDefaultSyncConfig(), ...JSON.parse(raw) }
  } catch (e) {
    return getDefaultSyncConfig()
  }
}

export const saveSyncConfig = (partialConfig) => {
  try {
    const next = { ...getSyncConfig(), ...partialConfig }
    localStorage.setItem(KEYS.SYNC_CONFIG, JSON.stringify(next))
    return next
  } catch (e) {
    console.error('Failed to save sync config', e)
    return getSyncConfig()
  }
}

export const clearSyncConfig = () => {
  try {
    localStorage.removeItem(KEYS.SYNC_CONFIG)
  } catch (e) {
    console.error('Failed to clear sync config', e)
  }
}

export const exportAllStorageData = () => {
  const answers = {}
  const flagged = {}
  const results = {}

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      if (k.startsWith(KEYS.ANSWERS_PREFIX)) {
        try {
          answers[k] = JSON.parse(localStorage.getItem(k) || '{}')
        } catch (_) {}
      } else if (k.startsWith(KEYS.FLAGGED_PREFIX)) {
        try {
          flagged[k] = JSON.parse(localStorage.getItem(k) || '{}')
        } catch (_) {}
      } else if (k.startsWith(KEYS.RESULTS_PREFIX)) {
        try {
          const parsed = JSON.parse(localStorage.getItem(k))
          if (parsed) results[k] = parsed
        } catch (_) {}
      }
    }
  } catch (e) {
    console.error('Failed to export localStorage snapshot', e)
  }

  return {
    schemaVersion: 1,
    app: 'a2-key-master',
    exportedAt: new Date().toISOString(),
    meta: getSyncMeta(),
    settings: getSettings(),
    stats: getGlobalStats(),
    answers,
    flagged,
    results,
  }
}

const normalizeStatsFromSnapshot = (rawStats, resultsMap) => {
  const base = { ...getDefaultStats(), ...(rawStats || {}) }
  const resultEntries = Object.values(resultsMap || {}).filter(Boolean)
  if (resultEntries.length > 0) {
    const scoreSum = resultEntries.reduce((sum, item) => sum + (item?.cambridgeScore || 120), 0)
    const qSum = resultEntries.reduce((sum, item) => sum + (item?.totalQuestions || 0), 0)
    base.totalTestsCompleted = Math.max(base.totalTestsCompleted || 0, resultEntries.length)
    base.averageScore = Math.round(scoreSum / resultEntries.length)
    base.totalQuestionsAnswered = Math.max(base.totalQuestionsAnswered || 0, qSum)
  } else {
    base.totalTestsCompleted = 0
    base.averageScore = 0
  }
  return base
}

export const replaceLocalWithSnapshot = (remoteData) => {
  if (!remoteData || typeof remoteData !== 'object') {
    throw new Error('Dữ liệu đám mây không hợp lệ.')
  }

  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (
      k &&
      (k.startsWith(KEYS.ANSWERS_PREFIX) ||
        k.startsWith(KEYS.FLAGGED_PREFIX) ||
        k.startsWith(KEYS.RESULTS_PREFIX))
    ) {
      keysToRemove.push(k)
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))

  const answers = remoteData.answers || {}
  const flagged = remoteData.flagged || {}
  const results = remoteData.results || {}

  Object.entries(answers).forEach(([k, val]) => {
    if (k.startsWith(KEYS.ANSWERS_PREFIX) && val && typeof val === 'object') {
      localStorage.setItem(k, JSON.stringify(val))
    }
  })

  Object.entries(flagged).forEach(([k, val]) => {
    if (k.startsWith(KEYS.FLAGGED_PREFIX) && val && typeof val === 'object') {
      localStorage.setItem(k, JSON.stringify(val))
    }
  })

  Object.entries(results).forEach(([k, val]) => {
    if (k.startsWith(KEYS.RESULTS_PREFIX) && val && typeof val === 'object') {
      localStorage.setItem(k, JSON.stringify(val))
    }
  })

  if (remoteData.settings && typeof remoteData.settings === 'object') {
    localStorage.setItem(
      KEYS.SETTINGS,
      JSON.stringify({ ...getDefaultSettings(), ...remoteData.settings })
    )
  }

  const normalizedStats = normalizeStatsFromSnapshot(remoteData.stats, results)
  localStorage.setItem(KEYS.STATS, JSON.stringify(normalizedStats))

  const nextMeta = {
    updatedAtByKey: remoteData.meta?.updatedAtByKey || {},
    deletedKeys: remoteData.meta?.deletedKeys || {},
  }
  saveSyncMeta(nextMeta)

  return {
    ...remoteData,
    stats: normalizedStats,
    meta: nextMeta,
  }
}

export const mergeStorageSnapshots = (localData, remoteData) => {
  const localMeta = localData?.meta || { updatedAtByKey: {}, deletedKeys: {} }
  const remoteMeta = remoteData?.meta || { updatedAtByKey: {}, deletedKeys: {} }
  const mergedMeta = { updatedAtByKey: {}, deletedKeys: {} }

  const resolveKeyWinner = (key, localObj, remoteObj, mergeObjectsFn, fallbackTimestamp = LEGACY_TIMESTAMP) => {
    const localUpdated =
      localMeta.updatedAtByKey?.[key] || (localObj ? localObj.completedAt || fallbackTimestamp : '')
    const localDeleted = localMeta.deletedKeys?.[key] || ''
    const remoteUpdated =
      remoteMeta.updatedAtByKey?.[key] || (remoteObj ? remoteObj.completedAt || fallbackTimestamp : '')
    const remoteDeleted = remoteMeta.deletedKeys?.[key] || ''

    const maxDeleted = localDeleted > remoteDeleted ? localDeleted : remoteDeleted
    const maxUpdated = localUpdated > remoteUpdated ? localUpdated : remoteUpdated

    if (maxDeleted && (!maxUpdated || maxDeleted > maxUpdated)) {
      mergedMeta.deletedKeys[key] = maxDeleted
      return null
    }

    if (localObj && remoteObj) {
      mergedMeta.updatedAtByKey[key] = maxUpdated || new Date().toISOString()
      return mergeObjectsFn(localObj, remoteObj, localUpdated >= remoteUpdated, localUpdated, remoteUpdated)
    }

    if (localObj) {
      mergedMeta.updatedAtByKey[key] = localUpdated || new Date().toISOString()
      return localObj
    }

    if (remoteObj) {
      mergedMeta.updatedAtByKey[key] = remoteUpdated || new Date().toISOString()
      return remoteObj
    }

    return null
  }

  const mergedAnswers = {}
  const allAnswerKeys = new Set([
    ...Object.keys(localData?.answers || {}),
    ...Object.keys(remoteData?.answers || {}),
  ])
  allAnswerKeys.forEach((key) => {
    const winner = resolveKeyWinner(
      key,
      localData?.answers?.[key],
      remoteData?.answers?.[key],
      (loc, rem, localIsNewer) => (localIsNewer ? { ...rem, ...loc } : { ...loc, ...rem })
    )
    if (winner && Object.keys(winner).length > 0) {
      mergedAnswers[key] = winner
    }
  })

  const mergedFlagged = {}
  const allFlagKeys = new Set([
    ...Object.keys(localData?.flagged || {}),
    ...Object.keys(remoteData?.flagged || {}),
  ])
  allFlagKeys.forEach((key) => {
    const winner = resolveKeyWinner(
      key,
      localData?.flagged?.[key],
      remoteData?.flagged?.[key],
      (loc, rem, localIsNewer) => (localIsNewer ? { ...rem, ...loc } : { ...loc, ...rem })
    )
    if (winner && Object.values(winner).some(Boolean)) {
      mergedFlagged[key] = winner
    }
  })

  const mergedResults = {}
  const allResultKeys = new Set([
    ...Object.keys(localData?.results || {}),
    ...Object.keys(remoteData?.results || {}),
  ])
  allResultKeys.forEach((key) => {
    const winner = resolveKeyWinner(
      key,
      localData?.results?.[key],
      remoteData?.results?.[key],
      (loc, rem, localIsNewer, localUpd, remoteUpd) => {
        const locTime = loc?.completedAt || localUpd || ''
        const remTime = rem?.completedAt || remoteUpd || ''
        if (locTime && remTime && locTime !== remTime) {
          return locTime > remTime ? loc : rem
        }
        if ((loc?.percentage || 0) !== (rem?.percentage || 0)) {
          return (loc?.percentage || 0) >= (rem?.percentage || 0) ? loc : rem
        }
        return localIsNewer ? loc : rem
      }
    )
    if (winner) {
      mergedResults[key] = winner
    }
  })

  // Merge settings preferring newer update timestamp
  const localSettingsUpd = localMeta.updatedAtByKey?.[KEYS.SETTINGS] || ''
  const remoteSettingsUpd = remoteMeta.updatedAtByKey?.[KEYS.SETTINGS] || ''
  const mergedSettings =
    remoteSettingsUpd > localSettingsUpd
      ? { ...getDefaultSettings(), ...(localData?.settings || {}), ...(remoteData?.settings || {}) }
      : { ...getDefaultSettings(), ...(remoteData?.settings || {}), ...(localData?.settings || {}) }
  if (localSettingsUpd || remoteSettingsUpd) {
    mergedMeta.updatedAtByKey[KEYS.SETTINGS] =
      localSettingsUpd >= remoteSettingsUpd ? localSettingsUpd : remoteSettingsUpd
  }

  // Merge stats
  const locStats = localData?.stats || getDefaultStats()
  const remStats = remoteData?.stats || getDefaultStats()
  const mergedStatsRaw = {
    streakDays: Math.max(locStats.streakDays || 0, remStats.streakDays || 0),
    totalTestsCompleted: Math.max(locStats.totalTestsCompleted || 0, remStats.totalTestsCompleted || 0),
    totalQuestionsAnswered: Math.max(
      locStats.totalQuestionsAnswered || 0,
      remStats.totalQuestionsAnswered || 0
    ),
    averageScore: 0,
    lastActiveDate:
      (locStats.lastActiveDate || '') >= (remStats.lastActiveDate || '')
        ? locStats.lastActiveDate
        : remStats.lastActiveDate,
  }
  const mergedStats = normalizeStatsFromSnapshot(mergedStatsRaw, mergedResults)
  const localStatsUpd = localMeta.updatedAtByKey?.[KEYS.STATS] || ''
  const remoteStatsUpd = remoteMeta.updatedAtByKey?.[KEYS.STATS] || ''
  if (localStatsUpd || remoteStatsUpd) {
    mergedMeta.updatedAtByKey[KEYS.STATS] =
      localStatsUpd >= remoteStatsUpd ? localStatsUpd : remoteStatsUpd
  }

  const mergedSnapshot = {
    schemaVersion: 1,
    app: 'a2-key-master',
    exportedAt: new Date().toISOString(),
    meta: mergedMeta,
    settings: mergedSettings,
    stats: mergedStats,
    answers: mergedAnswers,
    flagged: mergedFlagged,
    results: mergedResults,
  }

  return replaceLocalWithSnapshot(mergedSnapshot)
}

const buildGitHubHeaders = (token) => ({
  Authorization: `Bearer ${token.trim()}`,
  Accept: 'application/vnd.github+json',
})

export const verifyGitHubToken = async (token) => {
  const cleanToken = (token || '').trim()
  if (!cleanToken) {
    throw new Error('Vui lòng nhập GitHub Personal Access Token.')
  }

  const res = await fetch('https://api.github.com/user', {
    cache: 'no-store',
    headers: buildGitHubHeaders(cleanToken),
  })

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('GitHub Token không hợp lệ hoặc đã hết hạn (401 Unauthorized).')
    }
    if (res.status === 403) {
      throw new Error('GitHub Token bị giới hạn truy cập hoặc vượt rate limit (403 Forbidden).')
    }
    throw new Error(`Không thể xác thực GitHub Token (HTTP ${res.status}).`)
  }

  const scopesHeader = res.headers.get('x-oauth-scopes')
  if (scopesHeader !== null) {
    const scopes = scopesHeader
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    if (!scopes.includes('gist')) {
      throw new Error(
        'Token chưa có quyền "gist". Vui lòng tạo lại Classic Token và tích chọn ô "gist".'
      )
    }
  }

  const user = await res.json()
  return {
    login: user.login,
    avatar_url: user.avatar_url,
    name: user.name || user.login,
  }
}

const fetchGistDetail = async (token, gistId) => {
  const res = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistId)}`, {
    cache: 'no-store',
    headers: buildGitHubHeaders(token),
  })
  if (!res.ok) return null
  return res.json()
}

const findExistingSyncGist = async (token, preferredGistId = '') => {
  if (preferredGistId) {
    const direct = await fetchGistDetail(token, preferredGistId.trim())
    if (direct && direct.files && direct.files[GIST_FILENAME]) {
      return direct
    }
  }

  const listRes = await fetch('https://api.github.com/gists?per_page=100', {
    cache: 'no-store',
    headers: buildGitHubHeaders(token),
  })
  if (!listRes.ok) {
    if (listRes.status === 403 || listRes.status === 404) {
      throw new Error(
        'Token không thể truy cập Gist. Hãy dùng Classic Token có quyền "gist" (nút 1-Click ở trên).'
      )
    }
    throw new Error(`Không thể tìm kiếm Gist trên GitHub (HTTP ${listRes.status}).`)
  }

  const gists = await listRes.json()
  if (!Array.isArray(gists)) return null

  const found = gists.find((g) => g?.files && Boolean(g.files[GIST_FILENAME]))
  if (!found) return null

  return fetchGistDetail(token, found.id)
}

const parseGistSnapshot = async (gist, token) => {
  const fileObj = gist?.files?.[GIST_FILENAME]
  if (!fileObj) return null

  let rawText = fileObj.content || ''
  if (fileObj.truncated && fileObj.raw_url) {
    const rawRes = await fetch(fileObj.raw_url, {
      cache: 'no-store',
      headers: buildGitHubHeaders(token),
    })
    if (rawRes.ok) {
      rawText = await rawRes.text()
    }
  }

  if (!rawText.trim()) return null
  try {
    return JSON.parse(rawText)
  } catch (e) {
    throw new Error('File đồng bộ trên GitHub Gist bị lỗi định dạng JSON.')
  }
}

export const syncWithGitHubGist = async ({ mode = 'merge', tokenOverride, gistIdOverride } = {}) => {
  const currentConfig = getSyncConfig()
  const rawToken = tokenOverride !== undefined ? tokenOverride : currentConfig.token
  const cleanToken = (rawToken || '').trim()
  if (!cleanToken) {
    throw new Error('Chưa cấu hình GitHub Token.')
  }

  const tokenChanged = cleanToken !== (currentConfig.token || '').trim()
  let userProfile = null
  if (!currentConfig.githubUser || tokenChanged) {
    userProfile = await verifyGitHubToken(cleanToken)
  }

  const targetGistId =
    gistIdOverride !== undefined
      ? gistIdOverride.trim()
      : tokenChanged
        ? ''
        : (currentConfig.gistId || '').trim()

  const existingGist = await findExistingSyncGist(cleanToken, targetGistId)
  const localSnapshot = exportAllStorageData()
  const nowIso = new Date().toISOString()

  if (!existingGist) {
    if (mode === 'pull') {
      throw new Error(
        'Chưa tìm thấy dữ liệu đồng bộ nào trên GitHub cho Token này. Hãy dùng "Đồng bộ 2 chiều" hoặc "Đẩy máy này lên Cloud" trên thiết bị đang có dữ liệu trước.'
      )
    }

    const createRes = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        ...buildGitHubHeaders(cleanToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'A2 Key Master - Cloud Sync Data (Laptop & Mobile)',
        public: false,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(localSnapshot, null, 2),
          },
        },
      }),
    })

    if (!createRes.ok) {
      throw new Error(`Không thể tạo Gist đồng bộ mới trên GitHub (HTTP ${createRes.status}).`)
    }

    const createdGist = await createRes.json()
    const nextConfig = saveSyncConfig({
      token: cleanToken,
      gistId: createdGist.id,
      githubUser: userProfile?.login || currentConfig.githubUser,
      githubAvatar: userProfile?.avatar_url || currentConfig.githubAvatar,
      lastSyncedAt: nowIso,
    })

    return {
      status: 'created',
      gistId: createdGist.id,
      snapshot: localSnapshot,
      config: nextConfig,
    }
  }

  const remoteSnapshot = await parseGistSnapshot(existingGist, cleanToken)
  let finalSnapshot = localSnapshot

  if (mode === 'pull') {
    if (!remoteSnapshot) {
      throw new Error('Gist trên Cloud không có dữ liệu hợp lệ để tải về.')
    }
    finalSnapshot = replaceLocalWithSnapshot(remoteSnapshot)
  } else {
    if (mode === 'merge' && remoteSnapshot) {
      finalSnapshot = mergeStorageSnapshots(localSnapshot, remoteSnapshot)
    }

    const patchRes = await fetch(`https://api.github.com/gists/${encodeURIComponent(existingGist.id)}`, {
      method: 'PATCH',
      headers: {
        ...buildGitHubHeaders(cleanToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'A2 Key Master - Cloud Sync Data (Laptop & Mobile)',
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(finalSnapshot, null, 2),
          },
        },
      }),
    })

    if (!patchRes.ok) {
      throw new Error(`Không thể cập nhật dữ liệu lên GitHub Gist (HTTP ${patchRes.status}).`)
    }
  }

  const nextConfig = saveSyncConfig({
    token: cleanToken,
    gistId: existingGist.id,
    githubUser: userProfile?.login || existingGist.owner?.login || currentConfig.githubUser,
    githubAvatar:
      userProfile?.avatar_url || existingGist.owner?.avatar_url || currentConfig.githubAvatar,
    lastSyncedAt: nowIso,
  })

  return {
    status: mode === 'pull' ? 'pulled' : mode === 'push' ? 'pushed' : 'merged',
    gistId: existingGist.id,
    snapshot: finalSnapshot,
    config: nextConfig,
  }
}
