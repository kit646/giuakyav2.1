// Storage service for A2 Key Master using localStorage

const KEYS = {
  ANSWERS_PREFIX: 'a2_answers_',
  RESULTS_PREFIX: 'a2_results_',
  FLAGGED_PREFIX: 'a2_flagged_',
  STATS: 'a2_user_stats',
  SETTINGS: 'a2_settings',
}

export const getSettings = () => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS)
    return raw ? JSON.parse(raw) : { bilingual: true, volume: 0.9, autoPlayNext: false }
  } catch (e) {
    return { bilingual: true, volume: 0.9, autoPlayNext: false }
  }
}

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
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
  } catch (e) {
    console.error('Failed to clear answers', e)
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
    localStorage.setItem(key, JSON.stringify(current))
    return current
  } catch (e) {
    return {}
  }
}

export const saveResult = (testId, paperKey, resultData) => {
  try {
    const key = `${KEYS.RESULTS_PREFIX}${testId}_${paperKey}`
    localStorage.setItem(key, JSON.stringify({
      ...resultData,
      completedAt: new Date().toISOString()
    }))

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
  return {
    streakDays: 3, // Initial encouraging streak for young learner
    totalTestsCompleted: 0,
    totalQuestionsAnswered: 0,
    averageScore: 0,
    lastActiveDate: new Date().toISOString().split('T')[0]
  }
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
    stats.totalQuestionsAnswered += (resultData.totalQuestions || 0)
    
    const prevScoreSum = (stats.averageScore || 0) * (stats.totalTestsCompleted - 1)
    stats.averageScore = Math.round((prevScoreSum + (resultData.cambridgeScore || 120)) / stats.totalTestsCompleted)
    
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats))
  } catch (e) {
    console.error('Failed to update stats', e)
  }
}
