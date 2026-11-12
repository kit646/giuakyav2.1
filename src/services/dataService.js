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

// Compute Levenshtein edit distance to detect close spelling mistakes
const getEditDistance = (a, b) => {
  const s1 = normalizeText(a)
  const s2 = normalizeText(b)
  if (!s1 || !s2) return 99
  const dp = Array.from({ length: s1.length + 1 }, () => Array(s2.length + 1).fill(0))
  for (let i = 0; i <= s1.length; i++) dp[i][0] = i
  for (let j = 0; j <= s2.length; j++) dp[0][j] = j
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[s1.length][s2.length]
}

// Stopwords to ignore when matching keywords between question/answer and passage/transcript
const STOPWORDS = new Set([
  'the', 'a', 'an', 'to', 'in', 'on', 'at', 'for', 'with', 'about', 'from', 'by', 'of',
  'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'can', 'could', 'should', 'what', 'where', 'when', 'who', 'why', 'how',
  'which', 'that', 'this', 'these', 'those', 'it', 'he', 'she', 'they', 'we', 'you', 'his',
  'her', 'their', 'our', 'your', 'my', 'me', 'him', 'them', 'us', 'and', 'or', 'but', 'so',
  'if', 'because', 'as', 'than', 'very', 'too', 'also', 'just', 'not', 'only', 'some', 'any'
])

const extractKeywords = (text) => {
  if (!text) return []
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOPWORDS.has(w))
}

// Extract the exact sentence around gap (qNum) in Reading Part 4 & Part 5 Cloze passages
const extractClozeSentenceContext = (passageText, qNum) => {
  if (!passageText || !qNum) return null
  const text = String(passageText)
  // Match patterns like "(19) ___" or "(19) ____" or "(19)" or "[19]"
  const gapRegex = new RegExp(`(\\(\\s*${qNum}\\s*\\)\\s*_+|\\(\\s*${qNum}\\s*\\)|\\[\\s*${qNum}\\s*\\])`)
  const match = text.match(gapRegex)
  if (!match) return null

  const gapIndex = match.index
  const gapToken = match[0]

  // Find sentence boundaries around gapIndex
  let start = 0
  for (let i = gapIndex - 1; i >= 0; i--) {
    if (['.', '!', '?', '\n'].includes(text[i])) {
      start = i + 1
      break
    }
  }
  let end = text.length
  for (let i = gapIndex + gapToken.length; i < text.length; i++) {
    if (['.', '!', '?', '\n'].includes(text[i])) {
      end = i + 1
      break
    }
  }

  const beforeGap = text.slice(start, gapIndex).trimStart()
  const afterGap = text.slice(gapIndex + gapToken.length, end).trimEnd()
  const fullSentence = text.slice(start, end).trim()

  return {
    beforeGap,
    afterGap,
    gapToken,
    fullSentence
  }
}

// Extract best matching evidence sentence(s) from passage or transcript
const findBestEvidenceSentence = (sourceText, queryTexts = [], personLetter = null, personName = null) => {
  if (!sourceText) return null
  let targetBlock = String(sourceText)

  // If Reading Part 2 (3 people A, B, C), isolate the paragraph of the target person first
  if (personLetter) {
    const paragraphs = targetBlock.split(/\n\s*\n/)
    const headerPattern = new RegExp(`\\(${personLetter}\\)|^${personLetter}\\b|${personName || '___'}`, 'i')
    for (let i = 0; i < paragraphs.length; i++) {
      if (headerPattern.test(paragraphs[i])) {
        // If the header is a standalone short line like "Tanya (A)", include the next paragraph
        if (paragraphs[i].trim().length < 35 && paragraphs[i + 1]) {
          targetBlock = `${paragraphs[i].trim()}: ${paragraphs[i + 1].trim()}`
        } else {
          targetBlock = paragraphs[i].trim()
        }
        break
      }
    }
  }

  // Split into sentences or dialogue lines
  const sentences = targetBlock
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 8)

  if (sentences.length === 0) return targetBlock.slice(0, 260)

  const keywords = extractKeywords(queryTexts.join(' '))
  if (keywords.length === 0) return sentences.slice(0, 2).join(' ')

  let bestScore = -1
  let bestIdx = 0

  sentences.forEach((sent, idx) => {
    const lowerSent = sent.toLowerCase()
    let score = 0
    keywords.forEach((kw) => {
      if (lowerSent.includes(kw)) score += 2
      else if (kw.length >= 5 && lowerSent.includes(kw.slice(0, 4))) score += 1
    })
    if (score > bestScore) {
      bestScore = score
      bestIdx = idx
    }
  })

  if (bestScore <= 0) {
    return personLetter ? targetBlock : sentences.slice(0, 2).join(' ')
  }

  // Include adjacent sentence if helpful for context
  const mainSent = sentences[bestIdx]
  if (mainSent.length < 70 && sentences[bestIdx + 1]) {
    return `${mainSent} ${sentences[bestIdx + 1]}`
  }
  return mainSent
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

    // Resolve passage text if any
    const passageObj = part.passage
      ? (typeof part.passage === 'object' ? part.passage : { title: part.passage_title || '', text: part.passage })
      : (part.passage_text ? { title: part.passage_title || '', text: part.passage_text } : null)
    const passageText = passageObj?.text || ''
    const passageTitle = passageObj?.title || ''

    // Resolve matching options if any (e.g. Listening Part 5 A-H)
    const matchingOptions = part.matching_options || (part.type === 'matching' ? part.options : null)

    // Handle normal questions array
    if (part.questions && part.questions.length > 0) {
      part.questions.forEach((q) => {
        const qNum = q.question_number || q.number
        const rawUserAns = userAnswers[qNum] !== undefined ? String(userAnswers[qNum]).trim() : ''
        const correctAns = q.answer !== undefined ? String(q.answer).trim() : ''
        const isCorrect = checkAnswerMatch(rawUserAns, correctAns, q.accepted_answers)
        const isUnanswered = rawUserAns === ''

        totalQuestions++
        partTotal++
        if (!isUnanswered) answeredCount++
        if (isCorrect) {
          correctCount++
          partCorrect++
        }

        // Determine options map (Multiple choice A/B/C, Picture descriptions, or Matching A-H)
        const allOptions = q.options || matchingOptions || q.options_descriptions || null
        const isMultipleChoiceOrMatching = Boolean(allOptions && typeof allOptions === 'object' && Object.keys(allOptions).length > 0)
        const isClozePart = part.part === 4 || part.part === 5 || part.type === 'multiple_choice_cloze' || part.type === 'open_cloze'

        const userKeyUpper = rawUserAns.toUpperCase()
        const correctKeyUpper = correctAns.toUpperCase()

        const userOptionText = isMultipleChoiceOrMatching && allOptions[userKeyUpper]
          ? allOptions[userKeyUpper]
          : null
        const correctOptionText = isMultipleChoiceOrMatching && allOptions[correctKeyUpper]
          ? allOptions[correctKeyUpper]
          : null

        // Formatted display strings for user answer and correct answer
        const userAnswerDisplay = isUnanswered
          ? '(Bỏ trống - Chưa trả lời)'
          : (userOptionText ? `${userKeyUpper} — ${userOptionText}` : rawUserAns)

        const correctAnswerDisplay = correctOptionText
          ? `${correctKeyUpper} — ${correctOptionText}`
          : correctAns

        // Extract Cloze sentence context for Reading Part 4 & Part 5
        const clozeContext = isClozePart ? extractClozeSentenceContext(passageText, qNum) : null

        // Resolve full transcript (question-level or part-level)
        const fullTranscript = q.transcript || part.transcript || ''

        // Extract specific evidence quote from passage or transcript
        let evidenceQuote = null
        if (clozeContext) {
          evidenceQuote = clozeContext.fullSentence
        } else if (part.part === 2 && passageText && isMultipleChoiceOrMatching) {
          // Reading Part 2: Matching 3 people (A, B, C)
          evidenceQuote = findBestEvidenceSentence(
            passageText,
            [q.question || q.prompt, correctOptionText],
            correctKeyUpper,
            correctOptionText
          )
        } else if (passageText) {
          // Reading Part 3
          evidenceQuote = findBestEvidenceSentence(
            passageText,
            [q.question || q.prompt, correctOptionText || correctAns]
          )
        } else if (q.stimulus_text || q.text) {
          // Reading Part 1 short notice
          evidenceQuote = q.stimulus_text || q.text
        } else if (fullTranscript) {
          // Listening Parts 1-5
          evidenceQuote = findBestEvidenceSentence(
            fullTranscript,
            [q.question || q.prompt || q.label || q.item || q.person, correctOptionText || correctAns]
          )
        }

        // Build detailed diagnostic explanation ("Lỗi sai ở đâu & Tại sao")
        let errorAnalysis = ''
        let errorType = '' // 'unanswered' | 'spelling' | 'word_count' | 'wrong_choice' | 'wrong_gap'

        if (!isCorrect) {
          if (isUnanswered) {
            errorType = 'unanswered'
            errorAnalysis = `Bạn đã bỏ trống câu hỏi số ${qNum}. Đáp án đúng cần chọn/điền là "${correctAnswerDisplay}".`
          } else if (!isMultipleChoiceOrMatching) {
            // Gap fill error diagnosis (Reading Part 5 or Listening Part 2)
            const words = rawUserAns.split(/\s+/).filter(Boolean)
            const dist = getEditDistance(rawUserAns, correctAns)
            if ((part.part === 5 || part.type === 'open_cloze') && words.length > 1) {
              errorType = 'word_count'
              errorAnalysis = `Lỗi quy tắc điền từ: Phần này chỉ cho phép điền ĐÚNG 1 TỪ duy nhất, nhưng bạn đã điền ${words.length} từ ("${rawUserAns}"). Từ đúng cần điền vào chỗ trống (${qNum}) là "${correctAns}".`
            } else if (dist > 0 && dist <= 2 && correctAns.length >= 3) {
              errorType = 'spelling'
              errorAnalysis = `Lỗi chính tả (Rất tiếc!): Bạn điền "${rawUserAns}" gần giống với đáp án đúng "${correctAns}" (chỉ lệch ${dist} ký tự). Trong kỳ thi Cambridge, từ điền vào ô trống phải được đánh vần chính xác 100%.`
            } else {
              errorType = 'wrong_gap'
              errorAnalysis = `Từ/số bạn điền là "${rawUserAns}" chưa phù hợp với ngữ cảnh tại vị trí (${qNum}). Đáp án chính xác phải là "${correctAns}"${q.accepted_answers && q.accepted_answers.length > 1 ? ` (hoặc: ${q.accepted_answers.join(' / ')})` : ''}.`
            }
          } else {
            // Multiple Choice / Matching error diagnosis
            errorType = 'wrong_choice'
            if (part.part === 2 && passageText && userOptionText && correctOptionText) {
              errorAnalysis = `Bạn đã chọn ${userKeyUpper} (${userOptionText}), nhưng thông tin trong câu hỏi thuộc về đoạn văn của ${correctKeyUpper} (${correctOptionText}).`
            } else if (isClozePart && userOptionText && correctOptionText) {
              errorAnalysis = `Tại chỗ trống (${qNum}), từ "${userOptionText}" (${userKeyUpper}) không phù hợp về ngữ pháp/cụm từ cố định. Từ đúng phải là "${correctOptionText}" (${correctKeyUpper}).`
            } else {
              errorAnalysis = `Bạn đã chọn phương án ${userAnswerDisplay} (chưa đúng). Đáp án chính xác theo nội dung bài là ${correctAnswerDisplay}.`
            }
          }
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
          label: q.label || null,
          prefix: q.prefix || '',
          suffix: q.suffix || '',
          formTitle: part.form_title || null,
          stimulusText: q.stimulus_text || q.text || null,
          passageTitle,
          options: allOptions,
          isMultipleChoiceOrMatching,
          isClozePart,
          clozeContext,
          userAnswer: rawUserAns,
          userAnswerDisplay,
          userOptionText,
          correctAnswer: correctAns,
          correctAnswerDisplay,
          correctOptionText,
          acceptedAnswers: q.accepted_answers || [],
          isCorrect,
          isUnanswered,
          errorType,
          errorAnalysis,
          evidenceQuote,
          transcript: fullTranscript,
          explanation: q.key_pdf_note ? `Lưu ý đáp án: ${q.key_pdf_note}` : '',
          images: q.images || null,
          image: q.image || null,
        })
      })
    } else if (part.answers_only) {
      // In case part has only answer keys (e.g. Reading Part 2 in some scanned PDFs)
      Object.entries(part.answers_only).forEach(([qNum, ans]) => {
        const num = parseInt(qNum)
        const userAns = userAnswers[num] !== undefined ? String(userAnswers[num]).trim() : ''
        const isCorrect = checkAnswerMatch(userAns, ans)
        const isUnanswered = userAns === ''

        totalQuestions++
        partTotal++
        if (!isUnanswered) answeredCount++
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
          userAnswerDisplay: isUnanswered ? '(Bỏ trống)' : userAns,
          correctAnswer: ans,
          correctAnswerDisplay: ans,
          isCorrect,
          isUnanswered,
          errorType: !isCorrect ? (isUnanswered ? 'unanswered' : 'wrong_choice') : '',
          errorAnalysis: !isCorrect ? `Đáp án chuẩn cho câu ${num} là ${ans}.` : '',
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
