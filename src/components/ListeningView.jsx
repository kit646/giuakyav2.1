import React, { useState, useEffect, useMemo } from 'react'
import { Headphones, BookOpen, Flag, CheckCircle2, XCircle, AlertTriangle, AlertCircle, Sparkles, Check, ArrowLeft, RotateCcw, ArrowRight } from 'lucide-react'
import AudioPlayer from './AudioPlayer'
import { getImageUrl } from '../services/dataService'

function DebouncedInput({ value, onChange, placeholder, className, ariaLabel }) {
  const [localVal, setLocalVal] = useState(value || '')

  useEffect(() => {
    setLocalVal(value || '')
  }, [value])

  const handleBlur = () => {
    if (localVal !== (value || '')) {
      onChange(localVal)
    }
  }

  const handleChange = (e) => {
    const next = e.target.value
    setLocalVal(next)
  }

  return (
    <input
      type="text"
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onChange(localVal)
          e.target.blur()
        }
      }}
      placeholder={placeholder}
      className={className}
      aria-label={ariaLabel}
    />
  )
}

export default function ListeningView({
  test,
  answers = {},
  flagged = {},
  onAnswer,
  onToggleFlag,
  onSubmit,
  bilingualMode,
  examMode,
  timeLeft,
  isMobileMode = false,
  onSwitchPaper,
  reviewMode = false,
  result = null,
  onBackToResult,
  onRetakeTest
}) {
  const paper = test.papers ? test.papers.listening : null
  const parts = paper?.parts || []
  const hasReading = Boolean(test.papers?.reading_and_writing || test.papers?.reading)
  const readingPaperKey = test.papers?.reading ? 'reading' : 'reading_and_writing'

  const questionDetailsMap = useMemo(() => {
    const map = {}
    if (result && result.questionDetails) {
      result.questionDetails.forEach((qd) => {
        map[qd.questionNumber] = qd
      })
    }
    return map
  }, [result])

  const [activePartIndex, setActivePartIndex] = useState(0)
  const currentPart = parts[activePartIndex] || parts[0]

  // Format time mm:ss for exam mode
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Count total answered in listening
  const totalQuestions = parts.reduce((acc, p) => acc + (p.questions?.length || 0), 0)
  const answeredCount = Object.keys(answers).length

  // Global hotkeys: [ / ] for switching Parts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.key === '[' || e.key === 'PageUp') {
        e.preventDefault()
        setActivePartIndex(prev => Math.max(0, prev - 1))
      } else if (e.key === ']' || e.key === 'PageDown') {
        e.preventDefault()
        setActivePartIndex(prev => Math.min(parts.length - 1, prev + 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [parts.length])

  return (
    <div className="space-y-6 pb-12">
      
      {/* Sticky Audio Player for Current Part */}
      {currentPart && (
        <AudioPlayer
          audioTrack={currentPart.audio}
          partTitle={`Part ${currentPart.part}: ${currentPart.title || ''}`}
          testTitle={test.title}
          isMobileMode={isMobileMode}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Control Bar: Parts Navigation & Submit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Left: Test Info & Parts Selector */}
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-audio-50 text-audio-700">
                {test.title}
              </span>

              {/* Paper Switcher: If test has both papers */}
              {hasReading && (
                <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => onSwitchPaper && onSwitchPaper(readingPaperKey)}
                    className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
                    title="Chuyển sang làm bài Đọc (Reading & Writing)"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                    <span>Sang Reading</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-lg bg-audio-600 text-white shadow-xs flex items-center gap-1 cursor-default">
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Listening</span>
                  </span>
                </div>
              )}

              <span className="text-xs text-slate-600 font-medium">
                Đã làm <strong className="text-audio-700">{answeredCount}/{totalQuestions}</strong> câu
              </span>
            </div>

            {/* Part Selection Tabs */}
            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Các phần thi Listening">
              {parts.map((p, idx) => {
                const isSelected = activePartIndex === idx
                const partQuestions = p.questions || []
                const partAnswered = partQuestions.filter(q => answers[q.question_number || q.number] !== undefined).length
                const isDone = partQuestions.length > 0 && partAnswered === partQuestions.length

                return (
                  <button
                    key={p.part}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActivePartIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-audio-500 ${
                      isSelected
                        ? 'bg-audio-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>Part {p.part}</span>
                    {isDone && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-fresh-500'}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Timer (Exam Mode) & Submit / Review Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {!reviewMode && examMode === 'exam' && timeLeft !== undefined && (
              <div 
                aria-label={`Thời gian làm bài còn lại: ${formatTimer(timeLeft)}`}
                className={`px-4 py-2 rounded-xl text-sm font-mono font-bold flex items-center gap-2 border ${
                  timeLeft < 300 
                    ? 'bg-sunny-50 text-sunny-800 border-sunny-300 animate-pulse' 
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <span>⏳ {formatTimer(timeLeft)}</span>
              </div>
            )}

            {reviewMode ? (
              <>
                {onBackToResult && (
                  <button
                    type="button"
                    onClick={onBackToResult}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Về Bảng Điểm Chi Tiết</span>
                  </button>
                )}
                {onRetakeTest && (
                  <button
                    type="button"
                    onClick={onRetakeTest}
                    className="px-3.5 py-2 bg-audio-50 hover:bg-audio-100 text-audio-700 border border-audio-200 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Làm lại đề</span>
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                className="w-full md:w-auto px-5 py-2.5 bg-fresh-600 hover:bg-fresh-700 text-white font-bold text-sm rounded-xl shadow-md shadow-fresh-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-fresh-500"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Nộp Bài & Chấm Điểm</span>
              </button>
            )}
          </div>

        </div>

        {/* Review Mode Banner */}
        {reviewMode && result && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider">
                🔍 Chế độ Sửa Bài Trực Tiếp Trên Đề
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Kết quả: Đúng <strong className="text-fresh-700">{result.correctCount}/{result.totalQuestions}</strong> câu ({result.percentage}%) • Bạn có thể bấm nghe lại Audio ở trên kết hợp đọc lời thoại (Audioscript) bên dưới mỗi câu.
              </span>
            </div>
          </div>
        )}

        {/* Current Part Content */}
        {currentPart && (
          <div className="space-y-6">
            
            {/* Part Instruction Box */}
            <div className="bg-audio-50/70 border border-audio-200/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                  Part {currentPart.part}: {currentPart.title || 'Listening Section'}
                </h2>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">Phím [ lùi • ] tiến Part</span>
              </div>
              <p className="text-sm text-slate-700">
                {currentPart.instructions || 'Bạn sẽ được nghe mỗi đoạn hội thoại hai lần. Chọn câu trả lời chính xác cho mỗi câu hỏi.'}
              </p>
              {bilingualMode && (
                <p className="text-xs text-audio-800 italic mt-1 font-semibold">
                  💡 Gợi ý: Hãy quan sát tranh và đọc kỹ các từ khóa trước khi bấm nghe audio.
                </p>
              )}
            </div>

            {/* Matching Options Table / Reference Card (For Part 2 or Part 5 Matching) */}
            {(() => {
              const matchingOptions = currentPart.matching_options || currentPart.options
              if (!matchingOptions || Object.keys(matchingOptions).length === 0) return null
              return (
                <div className="bg-white rounded-2xl border border-audio-200 p-5 shadow-card space-y-3">
                  <div className="text-sm font-bold text-audio-900 flex items-center justify-between">
                    <span>📋 Bảng thông tin: {currentPart.right_column_title || 'Lựa chọn ghép đôi (Options A - H)'}</span>
                    {currentPart.example && (
                      <span className="text-xs bg-audio-50 text-audio-800 border border-audio-200 px-2.5 py-1 rounded-lg font-medium">
                        Ví dụ: {typeof currentPart.example === 'object' ? `${currentPart.example.item || currentPart.example.person || 0} → [ ${currentPart.example.answer || currentPart.example.value} ]` : currentPart.example}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {Object.entries(matchingOptions).map(([letter, textVal]) => (
                      <div key={letter} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                        <span className="w-6 h-6 rounded-lg bg-audio-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                          {letter}
                        </span>
                        <span className="text-slate-800 font-semibold truncate" title={textVal}>
                          {textVal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Gap Fill / Notes Form Header Box */}
            {(currentPart.form_title || (currentPart.context && (currentPart.part === 2 || currentPart.type === 'gap_fill_notes'))) && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      📝
                    </span>
                    <h3 className="text-base font-extrabold text-amber-950 uppercase tracking-wide">
                      {currentPart.form_title || 'THÔNG TIN CẦN ĐIỀN (NOTES)'}
                    </h3>
                  </div>
                  {currentPart.example && (
                    <div className="text-xs bg-white border border-amber-200 px-3 py-1 rounded-xl font-medium text-amber-900 shadow-2xs">
                      <span className="font-bold">Ví dụ: </span>
                      {typeof currentPart.example === 'object'
                        ? `${currentPart.example.label || 'Mẫu'}: ${currentPart.example.value || currentPart.example.answer}`
                        : currentPart.example}
                    </div>
                  )}
                </div>
                {currentPart.context && (
                  <p className="text-xs text-amber-900/80 italic font-medium">
                    {currentPart.context}
                  </p>
                )}
              </div>
            )}

            {/* Questions Container */}
            <div className="space-y-6">
              {(currentPart.questions || []).map((q) => {
                const qNum = q.question_number || q.number
                const userAns = answers[qNum]
                const isFlagged = flagged[qNum]
                const qd = reviewMode ? questionDetailsMap[qNum] : null
                const userKeyUpper = String(userAns || '').trim().toUpperCase()
                const correctKeyUpper = String(qd?.correctAnswer || q.answer || '').trim().toUpperCase()

                // Dynamic type determination
                const matchingOptions = currentPart.matching_options || currentPart.options
                const isMatching = currentPart.type === 'matching' || q.type === 'matching' || Boolean(matchingOptions && Object.keys(matchingOptions).length > 0)
                const isPictureQuestion = Boolean(q.images?.option_A || q.images?.question_and_options || currentPart.type === 'multiple_choice_pictures' || (currentPart.part === 1 && q.images))
                const isMultipleChoice = !isMatching && !isPictureQuestion && Boolean(q.options && typeof q.options === 'object' && Object.keys(q.options).length > 0)
                const isGapFill = !isMatching && !isPictureQuestion && !isMultipleChoice

                return (
                  <div
                    key={qNum}
                    className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-card transition-all ${
                      reviewMode && qd
                        ? qd.isCorrect
                          ? 'border-fresh-400 ring-1 ring-fresh-200'
                          : 'border-coral-400 ring-2 ring-coral-200/70'
                        : userAns !== undefined
                          ? 'border-audio-400 ring-1 ring-audio-300'
                          : 'border-slate-200'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-xl font-bold font-lexend text-sm flex items-center justify-center ${
                          reviewMode && qd
                            ? qd.isCorrect
                              ? 'bg-fresh-600 text-white'
                              : 'bg-coral-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}>
                          {qNum}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Câu hỏi {qNum}
                        </span>
                        {reviewMode && qd ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                            qd.isCorrect
                              ? 'bg-fresh-50 text-fresh-700 border-fresh-300'
                              : qd.isUnanswered
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-coral-50 text-coral-700 border-coral-300'
                          }`}>
                            {qd.isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                                <span>Đúng</span>
                              </>
                            ) : qd.isUnanswered ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Bỏ trống</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-coral-600" />
                                <span>Làm sai</span>
                              </>
                            )}
                          </span>
                        ) : (
                          userAns !== undefined && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Đã lưu
                            </span>
                          )
                        )}
                      </div>

                      {!reviewMode && (
                        <button
                          type="button"
                          onClick={() => onToggleFlag(qNum)}
                          aria-pressed={isFlagged}
                          aria-label={isFlagged ? `Bỏ ghim câu hỏi ${qNum}` : `Ghim câu hỏi ${qNum} để xem lại`}
                          className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sunny-400 ${
                            isFlagged
                              ? 'bg-sunny-100 text-sunny-900 border border-sunny-300'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                          title="Đánh dấu câu hỏi cần xem lại"
                        >
                          <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-sunny-500 text-sunny-600' : ''}`} />
                          <span className="hidden sm:inline">{isFlagged ? 'Đã ghim' : 'Ghim'}</span>
                        </button>
                      )}
                    </div>

                    {/* Question Prompt */}
                    <div className="text-base sm:text-lg font-bold text-slate-900 mb-4 leading-snug">
                      {q.label
                        ? `${q.label}:`
                        : (q.item || q.person
                          ? `${currentPart.left_column_title || 'Mục cần ghép'}: ${q.item || q.person}`
                          : (q.question || q.prompt || `Câu hỏi số ${qNum}`)
                        )
                      }
                    </div>

                    {/* CASE 1: PICTURE MULTIPLE CHOICE (A, B, C WITH IMAGES) */}
                    {isPictureQuestion && (
                      <div className="space-y-4">
                        {q.images?.option_A && q.images?.option_B && q.images?.option_C ? (
                          <div className={`grid ${isMobileMode ? 'grid-cols-3 gap-2' : 'grid-cols-1 sm:grid-cols-3 gap-4'}`} role="radiogroup" aria-label={`Lựa chọn cho câu ${qNum}`}>
                            {['A', 'B', 'C'].map((optKey) => {
                              const isSelected = userAns === optKey
                              const isCorrectOpt = reviewMode && optKey === correctKeyUpper
                              const isUserWrongOpt = reviewMode && !qd?.isCorrect && optKey === userKeyUpper
                              const optImg = getImageUrl(q.images[`option_${optKey}`])
                              const optDesc = q.options_descriptions ? q.options_descriptions[optKey] : ''

                              return (
                                <button
                                  key={optKey}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  disabled={reviewMode}
                                  aria-label={`Lựa chọn ${optKey}${optDesc ? `: ${optDesc}` : ''}`}
                                  onClick={() => !reviewMode && onAnswer(qNum, optKey)}
                                  className={`rounded-2xl border p-2 sm:p-3 flex flex-col items-center justify-between gap-2 transition-all ${
                                    reviewMode
                                      ? isCorrectOpt
                                        ? 'bg-fresh-50 border-fresh-500 ring-2 ring-fresh-500/30 shadow-md'
                                        : isUserWrongOpt
                                          ? 'bg-coral-50 border-coral-500 ring-2 ring-coral-500/30'
                                          : 'bg-white border-slate-200 opacity-75'
                                      : isSelected
                                        ? 'bg-audio-50 border-audio-600 ring-2 ring-audio-600/30 shadow-md cursor-pointer'
                                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs cursor-pointer'
                                  }`}
                                >
                                  {/* Picture container */}
                                  <div className={`w-full ${isMobileMode ? 'h-24 sm:h-32' : 'h-36 sm:h-40'} bg-slate-50 rounded-xl flex items-center justify-center p-1.5 border border-slate-100`}>
                                    <img
                                      src={optImg}
                                      alt={`Hình minh họa lựa chọn ${optKey}`}
                                      loading="lazy"
                                      decoding="async"
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>

                                  {/* Option Key Badge & Description */}
                                  <div className="w-full flex flex-wrap items-center justify-between gap-1 px-1">
                                    <span className={`w-6 sm:w-7 h-6 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold font-lexend ${
                                      reviewMode
                                        ? isCorrectOpt
                                          ? 'bg-fresh-600 text-white'
                                          : isUserWrongOpt
                                            ? 'bg-coral-600 text-white'
                                            : 'bg-slate-100 text-slate-700'
                                        : isSelected
                                          ? 'bg-audio-600 text-white'
                                          : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {optKey}
                                    </span>
                                    {reviewMode && isCorrectOpt && (
                                      <span className="text-[11px] font-extrabold text-fresh-700">✓ Đúng</span>
                                    )}
                                    {reviewMode && isUserWrongOpt && (
                                      <span className="text-[11px] font-extrabold text-coral-700">✗ Bạn chọn</span>
                                    )}
                                    {!reviewMode && optDesc && !isMobileMode && (
                                      <span className="hidden sm:inline text-xs text-slate-600 truncate max-w-[140px] text-right font-medium">
                                        {optDesc}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        ) : q.images?.question_and_options ? (
                          <div className="space-y-3">
                            <div className="flex justify-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                              <img
                                src={getImageUrl(q.images.question_and_options)}
                                alt={`Câu hỏi ${qNum} kèm các hình lựa chọn`}
                                loading="lazy"
                                decoding="async"
                                className="max-h-56 object-contain rounded"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label={`Chọn đáp án cho câu ${qNum}`}>
                              {['A', 'B', 'C'].map((optKey) => {
                                const isCorrectOpt = reviewMode && optKey === correctKeyUpper
                                const isUserWrongOpt = reviewMode && !qd?.isCorrect && optKey === userKeyUpper
                                return (
                                  <button
                                    key={optKey}
                                    type="button"
                                    role="radio"
                                    disabled={reviewMode}
                                    aria-checked={userAns === optKey}
                                    onClick={() => !reviewMode && onAnswer(qNum, optKey)}
                                    className={`py-3 rounded-xl border font-lexend font-bold text-sm transition-all ${
                                      reviewMode
                                        ? isCorrectOpt
                                          ? 'bg-fresh-600 text-white border-fresh-600 shadow-md'
                                          : isUserWrongOpt
                                            ? 'bg-coral-600 text-white border-coral-600'
                                            : 'bg-white text-slate-600 border-slate-200'
                                        : userAns === optKey
                                          ? 'bg-audio-600 text-white border-audio-600 shadow-md cursor-pointer'
                                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer'
                                    }`}
                                  >
                                    {reviewMode && isCorrectOpt ? `✓ Đáp án ${optKey}` : reviewMode && isUserWrongOpt ? `✗ Bạn chọn ${optKey}` : `Chọn ${optKey}`}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label={`Chọn đáp án cho câu ${qNum}`}>
                            {['A', 'B', 'C'].map((optKey) => {
                              const isCorrectOpt = reviewMode && optKey === correctKeyUpper
                              const isUserWrongOpt = reviewMode && !qd?.isCorrect && optKey === userKeyUpper
                              return (
                                <button
                                  key={optKey}
                                  type="button"
                                  role="radio"
                                  disabled={reviewMode}
                                  aria-checked={userAns === optKey}
                                  onClick={() => !reviewMode && onAnswer(qNum, optKey)}
                                  className={`p-4 rounded-xl border text-center transition-all ${
                                    reviewMode
                                      ? isCorrectOpt
                                        ? 'bg-fresh-50 border-fresh-500 text-fresh-950 font-bold'
                                        : isUserWrongOpt
                                          ? 'bg-coral-50 border-coral-500 text-coral-950'
                                          : 'bg-white border-slate-200'
                                      : userAns === optKey
                                        ? 'bg-audio-50 border-audio-500 text-audio-900 ring-2 ring-audio-500/20 cursor-pointer'
                                        : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
                                  }`}
                                >
                                  <div className="font-bold text-lg">{optKey}</div>
                                  <div className="text-xs text-slate-600 mt-1">{q.options_descriptions?.[optKey] || `Hình ${optKey}`}</div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CASE 2: MATCHING (A - H, 44x44px touch targets) */}
                    {isMatching && (
                      <div className="pt-2 space-y-3">
                        <label className="block text-xs font-semibold text-slate-700">
                          Chọn đáp án ghép đôi cho <span className="font-bold text-audio-700">{q.item || q.person || `Câu ${qNum}`}</span>:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="radiogroup" aria-label={`Đáp án ghép đôi cho câu ${qNum}`}>
                          {Object.entries(matchingOptions || { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H' }).map(([letter, labelText]) => {
                            const isSelected = userAns === letter
                            const letterUpper = letter.toUpperCase()
                            const isCorrectOpt = reviewMode && letterUpper === correctKeyUpper
                            const isUserWrongOpt = reviewMode && !qd?.isCorrect && letterUpper === userKeyUpper
                            return (
                              <button
                                key={letter}
                                type="button"
                                role="radio"
                                disabled={reviewMode}
                                aria-checked={isSelected}
                                aria-label={`Ghép với ${letter}${labelText ? `: ${labelText}` : ''}`}
                                onClick={() => !reviewMode && onAnswer(qNum, letter)}
                                className={`min-h-11 px-3 py-2 rounded-xl font-bold font-lexend text-xs sm:text-sm transition-all flex items-center gap-2 ${
                                  reviewMode
                                    ? isCorrectOpt
                                      ? 'bg-fresh-600 text-white shadow-md ring-2 ring-fresh-400'
                                      : isUserWrongOpt
                                        ? 'bg-coral-600 text-white shadow-md'
                                        : 'bg-slate-50 text-slate-600 border border-slate-200 opacity-75'
                                    : isSelected
                                      ? 'bg-audio-600 text-white shadow-md shadow-audio-600/30 cursor-pointer'
                                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                  reviewMode
                                    ? (isCorrectOpt || isUserWrongOpt ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')
                                    : (isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800')
                                }`}>
                                  {letter}
                                </span>
                                {labelText && typeof labelText === 'string' && (
                                  <span className={`font-medium text-xs truncate text-left ${isUserWrongOpt ? 'line-through' : ''}`} title={labelText}>
                                    {labelText}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* CASE 3: TEXT MULTIPLE CHOICE (A, B, C) */}
                    {isMultipleChoice && (
                      <div className="space-y-2.5" role="radiogroup" aria-label={`Các phương án câu ${qNum}`}>
                        {Object.entries(q.options).map(([optKey, optText]) => {
                          const isSelected = userAns === optKey
                          const optUpper = optKey.toUpperCase()
                          const isCorrectOpt = reviewMode && optUpper === correctKeyUpper
                          const isUserWrongOpt = reviewMode && !qd?.isCorrect && optUpper === userKeyUpper
                          return (
                            <button
                              key={optKey}
                              type="button"
                              role="radio"
                              disabled={reviewMode}
                              aria-checked={isSelected}
                              onClick={() => !reviewMode && onAnswer(qNum, optKey)}
                              className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                reviewMode
                                  ? isCorrectOpt
                                    ? 'bg-fresh-50 border-fresh-500 text-fresh-950 font-bold ring-2 ring-fresh-500/20'
                                    : isUserWrongOpt
                                      ? 'bg-coral-50 border-coral-400 text-coral-950 font-semibold'
                                      : 'bg-white border-slate-200 text-slate-600 opacity-80'
                                  : isSelected
                                    ? 'bg-audio-50 border-audio-500 text-audio-900 ring-2 ring-audio-500/20 shadow-xs cursor-pointer'
                                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-lexend shrink-0 transition-colors ${
                                  reviewMode
                                    ? isCorrectOpt
                                      ? 'bg-fresh-600 text-white'
                                      : isUserWrongOpt
                                        ? 'bg-coral-600 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                    : isSelected
                                      ? 'bg-audio-600 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {optKey}
                                </span>
                                <span className={`text-sm leading-relaxed ${isUserWrongOpt ? 'line-through decoration-coral-600' : 'font-medium'}`}>
                                  {optText}
                                </span>
                              </div>
                              {reviewMode && isCorrectOpt && (
                                <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-fresh-600 text-white text-[11px] font-extrabold">
                                  ✓ Đáp án đúng
                                </span>
                              )}
                              {reviewMode && isUserWrongOpt && (
                                <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-coral-600 text-white text-[11px] font-extrabold">
                                  ✗ Bạn chọn (Sai)
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* CASE 4: GAP FILL NOTES */}
                    {isGapFill && (
                      <div className="pt-2 space-y-2">
                        {reviewMode && qd ? (
                          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                            {q.prefix && (
                              <span className="font-bold text-slate-800 text-sm bg-white px-2.5 py-1 rounded border border-slate-200">
                                {q.prefix}
                              </span>
                            )}
                            <div>
                              <span className="text-xs text-slate-500 block font-semibold">Bạn đã điền:</span>
                              <span className={`text-base font-extrabold ${qd.isCorrect ? 'text-fresh-700' : 'text-coral-700 line-through'}`}>
                                {qd.isCorrect ? '✓ ' : '✗ '}
                                {qd.isUnanswered ? '(Bỏ trống)' : qd.userAnswer}
                              </span>
                            </div>
                            {!qd.isCorrect && (
                              <>
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                <div className="px-3 py-1.5 rounded-xl bg-fresh-50 border border-fresh-300">
                                  <span className="text-xs text-fresh-800 block font-semibold">Đáp án đúng:</span>
                                  <span className="text-base font-extrabold text-fresh-900">
                                    ✓ {qd.correctAnswer}
                                  </span>
                                </div>
                              </>
                            )}
                            {q.suffix && (
                              <span className="font-bold text-slate-700 text-sm bg-white px-2.5 py-1 rounded border border-slate-200">
                                {q.suffix}
                              </span>
                            )}
                          </div>
                        ) : (
                          <>
                            <label className="block text-xs font-semibold text-slate-700">
                              {q.label ? `Điền thông tin cho "${q.label}":` : `Nhập thông tin điền vào chỗ trống (${qNum}):`}
                            </label>
                            <div className="flex items-center gap-2 max-w-md">
                              {q.prefix && (
                                <span className="font-bold text-slate-800 text-sm bg-slate-100 px-3 py-3 rounded-xl border border-slate-200 shrink-0">
                                  {q.prefix}
                                </span>
                              )}
                              <DebouncedInput
                                value={userAns}
                                onChange={(val) => onAnswer(qNum, val)}
                                placeholder="Nhập câu trả lời..."
                                ariaLabel={`Đáp án điền từ cho câu ${qNum}`}
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-audio-500 focus:ring-2 focus:ring-audio-500/20 text-slate-900 font-semibold text-sm outline-none transition-all shadow-xs"
                              />
                              {q.suffix && (
                                <span className="font-bold text-slate-700 text-sm bg-slate-100 px-3 py-3 rounded-xl border border-slate-200 shrink-0">
                                  {q.suffix}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Review Mode Error Analysis & Audioscript Evidence */}
                    {reviewMode && qd && (
                      <div className={`mt-4 p-4 rounded-xl border space-y-2.5 text-xs sm:text-sm ${
                        qd.isCorrect
                          ? 'bg-fresh-50/50 border-fresh-200 text-slate-800'
                          : 'bg-coral-50/50 border-coral-200 text-slate-900'
                      }`}>
                        {!qd.isCorrect && qd.errorAnalysis && (
                          <div className="text-coral-900 font-semibold">
                            <strong className="font-extrabold">🔎 Chỉ ra lỗi sai: </strong>
                            {qd.errorAnalysis}
                          </div>
                        )}
                        {qd.evidenceQuote && (
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <span className="text-[11px] font-extrabold uppercase text-audio-700 block mb-0.5">
                              🎧 Câu dẫn chứng trong băng nghe:
                            </span>
                            <span className="italic text-slate-800 font-medium">"{qd.evidenceQuote}"</span>
                          </div>
                        )}
                        {qd.transcript && (
                          <details className="pt-1" open={!qd.isCorrect}>
                            <summary className="text-xs font-extrabold text-audio-800 cursor-pointer hover:underline">
                              Xem toàn bộ lời thoại (Audioscript) của phần này
                            </summary>
                            <div className="mt-2 p-3 bg-white/90 rounded-lg border border-audio-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                              {qd.transcript}
                            </div>
                          </details>
                        )}
                      </div>
                    )}

                    {/* Bilingual Hint */}
                    {!reviewMode && bilingualMode && (
                      <div className="mt-3 text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {isPictureQuestion && `(Dịch câu hỏi ${qNum}: Lắng nghe chi tiết về người, đồ vật hoặc thời gian trong audio)`}
                        {isGapFill && `(Dịch câu hỏi ${qNum}: Chú ý cách đánh vần tên riêng hoặc số liệu giờ giấc/tiền tệ)`}
                        {isMatching && `(Gợi ý nối: Đối chiếu thông tin của ${q.person || 'nhân vật'} với các lựa chọn từ A đến H)`}
                        {isMultipleChoice && `(Dịch câu hỏi ${qNum}: Nghe kỹ lý do hoặc quan điểm của người nói)`}
                      </div>
                    )}

                  </div>
                )
              })}
            </div>

          </div>
        )}

      </div>

    </div>
  )
}
