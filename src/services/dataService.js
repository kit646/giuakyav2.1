// Data service for loading tests and grading Cambridge A2 Key

let cachedMasterData = null

export const loadMasterData = async () => {
  if (cachedMasterData) return cachedMasterData
  try {
    const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
    const res = await fetch(`${base}extracted_data/all_tests.json`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    cachedMasterData = data
    return data
  } catch (err) {
    console.error('Failed to load tests data from extracted_data/all_tests.json', err)
    throw err
  }
}

export const getAudioUrl = (relativePath) => {
  if (!relativePath) return ''
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  const clean = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
  return `${base}${clean}`
}

export const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  const clean = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  return `${base}${clean}`
}

// Convert raw score to Cambridge Scale Score (100 - 150)
export const calculateCambridgeScore = (correct, total) => {
  if (!total || total === 0) return 100
  const pct = correct / total

  if (pct >= 0.90) {
    // 90% - 100% -> 140 - 150
    return Math.round(140 + ((pct - 0.90) / 0.10) * 10)
  } else if (pct >= 0.80) {
    // 80% - 89% -> 133 - 139
    return Math.round(133 + ((pct - 0.80) / 0.10) * 6)
  } else if (pct >= 0.70) {
    // 70% - 79% -> 120 - 132
    return Math.round(120 + ((pct - 0.70) / 0.10) * 12)
  } else if (pct >= 0.50) {
    // 50% - 69% -> 100 - 119
    return Math.round(100 + ((pct - 0.50) / 0.20) * 19)
  } else {
    // < 50% -> 80 - 99
    return Math.max(82, Math.round(82 + (pct / 0.50) * 17))
  }
}

export const getCambridgeGradeBadge = (score) => {
  if (score >= 140) {
    return {
      title: 'Pass with Distinction',
      cefr: 'CEFR Level B1',
      color: 'bg-fresh-500 text-white',
      border: 'border-fresh-400',
      bgLight: 'bg-fresh-50 text-fresh-700',
      description: 'Xuất sắc! Trình độ của bạn đã vượt chuẩn A2 và chạm mức B1.'
    }
  } else if (score >= 133) {
    return {
      title: 'Pass with Merit',
      cefr: 'CEFR Level A2',
      color: 'bg-brand-600 text-white',
      border: 'border-brand-400',
      bgLight: 'bg-brand-50 text-brand-700',
      description: 'Rất tốt! Bạn đạt điểm Khá - Giỏi chuẩn Cambridge A2 Key.'
    }
  } else if (score >= 120) {
    return {
      title: 'Pass',
      cefr: 'CEFR Level A2',
      color: 'bg-sunny-500 text-slate-900',
      border: 'border-sunny-400',
      bgLight: 'bg-sunny-50 text-sunny-800',
      description: 'Chúc mừng! Bạn đã đạt chứng chỉ Cambridge A2 Key for Schools.'
    }
  } else {
    return {
      title: 'Needs More Practice',
      cefr: 'CEFR Level A1',
      color: 'bg-slate-600 text-white',
      border: 'border-slate-400',
      bgLight: 'bg-slate-100 text-slate-700',
      description: 'Cố lên nhé! Hãy xem lại các câu sai và transcript để bứt phá ở lần thi tới.'
    }
  }
}

// Compare user text answer with answer key (handles alternatives like "9.30 / 9:30" or case-insensitive)
export const checkAnswerMatch = (userAns, correctAns) => {
  if (!userAns || !correctAns) return false
  const cleanUser = String(userAns).trim().toLowerCase()
  const cleanCorrect = String(correctAns).trim().toLowerCase()

  if (cleanUser === cleanCorrect) return true

  // Handle slash alternatives e.g. "9.30 / 9:30" or "centre / center"
  if (cleanCorrect.includes('/')) {
    const parts = cleanCorrect.split('/').map(s => s.trim().toLowerCase())
    if (parts.includes(cleanUser)) return true
  }

  // Handle number words e.g. "8" vs "eight"
  const numMap = {
    '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
    '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten'
  }
  if (numMap[cleanUser] === cleanCorrect || numMap[cleanCorrect] === cleanUser) return true

  return false
}

// Grade an entire paper (reading or listening)
export const gradePaper = (paperData, userAnswers = {}) => {
  const parts = paperData.parts || []
  let totalQuestions = 0
  let correctCount = 0
  let answeredCount = 0
  const partBreakdown = []
  const questionDetails = []

  parts.forEach((part) => {
    let partTotal = 0
    let partCorrect = 0

    // Handle normal questions array
    if (part.questions && part.questions.length > 0) {
      part.questions.forEach((q) => {
        const qNum = q.question_number || q.number
        const userAns = userAnswers[qNum] !== undefined ? userAnswers[qNum] : ''
        const correctAns = q.answer
        const isCorrect = checkAnswerMatch(userAns, correctAns)

        totalQuestions++
        partTotal++
        if (userAns !== '') answeredCount++
        if (isCorrect) {
          correctCount++
          partCorrect++
        }

        questionDetails.push({
          questionNumber: qNum,
          partNumber: part.part,
          partTitle: part.title,
          partType: part.type,
          prompt: q.question || q.prompt || q.stimulus_text || q.person || q.item || '',
          options: q.options || q.options_descriptions || null,
          userAnswer: userAns,
          correctAnswer: correctAns,
          isCorrect,
          transcript: q.transcript || '',
          explanation: q.key_pdf_note ? `Lưu ý đáp án: ${q.key_pdf_note}` : '',
          images: q.images || null,
          image: q.image || null,
        })
      })
    } else if (part.answers_only) {
      // In case part has only answer keys (e.g. Reading Part 2 in some scanned PDFs)
      Object.entries(part.answers_only).forEach(([qNum, ans]) => {
        const num = parseInt(qNum)
        const userAns = userAnswers[num] !== undefined ? userAnswers[num] : ''
        const isCorrect = checkAnswerMatch(userAns, ans)

        totalQuestions++
        partTotal++
        if (userAns !== '') answeredCount++
        if (isCorrect) {
          correctCount++
          partCorrect++
        }

        questionDetails.push({
          questionNumber: num,
          partNumber: part.part,
          partTitle: part.title,
          partType: part.type,
          prompt: `Câu hỏi số ${num} (Đáp án lưu theo KEY.pdf)`,
          userAnswer: userAns,
          correctAnswer: ans,
          isCorrect,
          explanation: part.note || ''
        })
      })
    }

    partBreakdown.push({
      partNumber: part.part,
      partTitle: part.title,
      partType: part.type,
      total: partTotal,
      correct: partCorrect,
      percentage: partTotal > 0 ? Math.round((partCorrect / partTotal) * 100) : 0
    })
  })

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const cambridgeScore = calculateCambridgeScore(correctCount, totalQuestions)
  const badge = getCambridgeGradeBadge(cambridgeScore)

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    percentage,
    cambridgeScore,
    badge,
    partBreakdown,
    questionDetails
  }
}
