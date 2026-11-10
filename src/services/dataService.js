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

// Helper to normalize strings for comparison
const normalizeText = (str) => {
  if (!str) return ''
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[‘’ʻʼ`]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
}

// Expands parenthesized optional words/letters recursively (e.g. "(The) White (Hotel)" -> [ "The White Hotel", "White Hotel", "The White", "White" ])
const expandParens = (str) => {
  const m = str.match(/\(([^)]*)\)/)
  if (!m) return [normalizeText(str)]
  
  const before = str.slice(0, m.index)
  const inside = m[1]
  const after = str.slice(m.index + m[0].length)

  const withInside = expandParens(before + inside + after)
  const withoutInside = expandParens(before + after)

  const res = new Set([...withInside, ...withoutInside])
  return Array.from(res).map(normalizeText).filter(Boolean)
}

// Generate valid Cambridge answer variations from answer key string
const generateCambridgeVariations = (keyStr) => {
  if (!keyStr) return []
  const base = normalizeText(keyStr)
  const variations = new Set()

  // Slashes
  const chunks = base.includes('/') ? base.split('/').map(s => s.trim()) : [base]

  chunks.forEach((chunk) => {
    const expanded = expandParens(chunk)
    expanded.forEach((item) => {
      variations.add(item)
      // allow hyphen <-> space e.g. "thirty-six" <-> "thirty six"
      if (item.includes('-')) {
        variations.add(item.replace(/-/g, ' ').replace(/\s+/g, ' ').trim())
        variations.add(item.replace(/-/g, '').trim())
      }
      // allow currency without space "£ 12" -> "£12" and "12"
      if (item.includes('£')) {
        variations.add(item.replace(/£\s*/g, '£').trim())
        variations.add(item.replace(/£\s*/g, '').trim())
      }
      // allow time "6.15" <-> "6:15"
      if (item.includes('.')) variations.add(item.replace('.', ':'))
      if (item.includes(':')) variations.add(item.replace(':', '.'))
    })
  })

  return Array.from(variations).filter(Boolean)
}

// Number word map for Cambridge A2 Key
const NUMBER_WORD_MAP = {
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
  '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten',
  '11': 'eleven', '12': 'twelve', '13': 'thirteen', '14': 'fourteen', '15': 'fifteen',
  '16': 'sixteen', '17': 'seventeen', '18': 'eighteen', '19': 'nineteen', '20': 'twenty',
  '21': 'twenty-one', '22': 'twenty-two', '23': 'twenty-three', '24': 'twenty-four', '25': 'twenty-five',
  '26': 'twenty-six', '27': 'twenty-seven', '28': 'twenty-eight', '29': 'twenty-nine', '30': 'thirty',
  '36': 'thirty-six', '40': 'forty', '50': 'fifty', '60': 'sixty', '63': 'sixty-three',
  '70': 'seventy', '80': 'eighty', '90': 'ninety', '100': 'one hundred', '300': 'three hundred'
}

// Compare user text answer with answer key (handles alternatives, Cambridge parens, numbers)
export const checkAnswerMatch = (userAns, correctAns, acceptedAnswers = []) => {
  if (userAns === undefined || userAns === null || userAns === '') return false
  if (!correctAns && (!acceptedAnswers || acceptedAnswers.length === 0)) return false

  const cleanUser = normalizeText(userAns)
  if (!cleanUser) return false

  // 1. Direct match with correctAns
  const cleanCorrect = normalizeText(correctAns)
  if (cleanUser === cleanCorrect) return true

  // 2. Check acceptedAnswers list if provided
  if (Array.isArray(acceptedAnswers)) {
    for (const acc of acceptedAnswers) {
      if (checkAnswerMatch(userAns, acc)) return true
    }
  }

  // 3. Check Cambridge variations of correctAns
  const vars = generateCambridgeVariations(correctAns)
  if (vars.includes(cleanUser)) return true

  // 4. Stripped user variations (e.g. user typed "£12" or "12" or "thirty six" or "12 pounds")
  const userNoHyphen = cleanUser.replace(/-/g, ' ').replace(/\s+/g, ' ')
  if (vars.includes(userNoHyphen)) return true

  const userNoCurrency = cleanUser.replace(/[£$]/g, '').trim()
  if (vars.includes(userNoCurrency)) return true

  const userNoUnit = cleanUser.replace(/\b(pounds|street|hotel|island|bedrooms|dishes|pm|am|o'clock|hour)\b/gi, '').trim()
  if (userNoUnit && vars.includes(userNoUnit)) return true

  // 5. Check number words e.g. "8" vs "eight"
  if (NUMBER_WORD_MAP[cleanUser] && vars.includes(NUMBER_WORD_MAP[cleanUser])) return true
  for (const [digit, word] of Object.entries(NUMBER_WORD_MAP)) {
    if (cleanUser === word && vars.some(v => v === digit || v.includes(digit))) return true
    if (cleanUser === digit && vars.some(v => v === word || v.includes(word))) return true
  }

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
        const isCorrect = checkAnswerMatch(userAns, correctAns, q.accepted_answers)

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
          prompt: q.label 
            ? `${q.label}${q.prefix ? ` (${q.prefix})` : ''}${q.suffix ? ` (${q.suffix})` : ''}`
            : (q.item || q.person 
              ? `${part.left_column_title || 'Mục ghép'}: ${q.item || q.person}` 
              : (q.question || q.prompt || q.stimulus_text || `Câu hỏi số ${qNum}`)
            ),
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
