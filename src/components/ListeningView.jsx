import React, { useState, useEffect } from 'react'
import { Headphones, Flag, CheckCircle2, AlertCircle, Sparkles, Check } from 'lucide-react'
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
  timeLeft
}) {
  const paper = test.papers ? test.papers.listening : null
  const parts = paper?.parts || []

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
          partTitle={`Listening Part ${currentPart.part}: ${currentPart.title || ''}`}
          testTitle={test.title}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Control Bar: Parts Navigation & Submit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Left: Test Info & Parts Selector */}
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-audio-50 text-audio-700">
                {test.title}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                Listening Paper • Đã làm <strong className="text-audio-700">{answeredCount}/{totalQuestions}</strong> câu
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

          {/* Right: Timer (Exam Mode) & Submit Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {examMode === 'exam' && timeLeft !== undefined && (
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

            <button
              type="button"
              onClick={onSubmit}
              className="w-full md:w-auto px-5 py-2.5 bg-fresh-600 hover:bg-fresh-700 text-white font-bold text-sm rounded-xl shadow-md shadow-fresh-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-fresh-500"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Nộp Bài & Chấm Điểm</span>
            </button>
          </div>

        </div>

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

            {/* Questions Container */}
            <div className="space-y-6">
              {(currentPart.questions || []).map((q) => {
                const qNum = q.question_number || q.number
                const userAns = answers[qNum]
                const isFlagged = flagged[qNum]
                const isPictureQuestion = currentPart.part === 1 || q.images?.option_A

                return (
                  <div
                    key={qNum}
                    className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-card transition-all ${
                      userAns !== undefined ? 'border-audio-400 ring-1 ring-audio-300' : 'border-slate-200'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-900 font-bold font-lexend text-sm flex items-center justify-center">
                          {qNum}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Câu hỏi {qNum}
                        </span>
                        {userAns !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Đã lưu
                          </span>
                        )}
                      </div>

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
                    </div>

                    {/* Question Prompt */}
                    <div className="text-base sm:text-lg font-bold text-slate-900 mb-4 leading-snug">
                      {q.question || q.prompt || (q.person ? `Nhân vật: ${q.person}` : `Câu hỏi số ${qNum}`)}
                    </div>

                    {/* CASE 1: PART 1 - PICTURE MULTIPLE CHOICE (A, B, C WITH IMAGES) */}
                    {isPictureQuestion && (
                      <div className="space-y-4">
                        {q.images?.option_A && q.images?.option_B && q.images?.option_C ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="radiogroup" aria-label={`Lựa chọn cho câu ${qNum}`}>
                            {['A', 'B', 'C'].map((optKey) => {
                              const isSelected = userAns === optKey
                              const optImg = getImageUrl(q.images[`option_${optKey}`])
                              const optDesc = q.options_descriptions ? q.options_descriptions[optKey] : ''

                              return (
                                <button
                                  key={optKey}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  aria-label={`Lựa chọn ${optKey}${optDesc ? `: ${optDesc}` : ''}`}
                                  onClick={() => onAnswer(qNum, optKey)}
                                  className={`rounded-2xl border p-3 flex flex-col items-center justify-between gap-3 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500 ${
                                    isSelected
                                      ? 'bg-audio-50 border-audio-600 ring-2 ring-audio-600/30 shadow-md'
                                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                                  }`}
                                >
                                  {/* Picture container */}
                                  <div className="w-full h-36 sm:h-40 bg-slate-50 rounded-xl flex items-center justify-center p-2 border border-slate-100">
                                    <img
                                      src={optImg}
                                      alt={`Hình minh họa lựa chọn ${optKey}`}
                                      loading="lazy"
                                      decoding="async"
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>

                                  {/* Option Key Badge & Description */}
                                  <div className="w-full flex items-center justify-between px-1">
                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-lexend ${
                                      isSelected ? 'bg-audio-600 text-white' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {optKey}
                                    </span>
                                    {optDesc && (
                                      <span className="text-xs text-slate-600 truncate max-w-[140px] text-right font-medium">
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
                              {['A', 'B', 'C'].map((optKey) => (
                                <button
                                  key={optKey}
                                  type="button"
                                  role="radio"
                                  aria-checked={userAns === optKey}
                                  onClick={() => onAnswer(qNum, optKey)}
                                  className={`py-3 rounded-xl border font-lexend font-bold text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500 ${
                                    userAns === optKey
                                      ? 'bg-audio-600 text-white border-audio-600 shadow-md'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  Chọn {optKey}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label={`Chọn đáp án cho câu ${qNum}`}>
                            {['A', 'B', 'C'].map((optKey) => (
                              <button
                                key={optKey}
                                type="button"
                                role="radio"
                                aria-checked={userAns === optKey}
                                onClick={() => onAnswer(qNum, optKey)}
                                className={`p-4 rounded-xl border text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500 ${
                                  userAns === optKey
                                    ? 'bg-audio-50 border-audio-500 text-audio-900 ring-2 ring-audio-500/20'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <div className="font-bold text-lg">{optKey}</div>
                                <div className="text-xs text-slate-600 mt-1">{q.options_descriptions?.[optKey] || `Hình ${optKey}`}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CASE 2: PART 2 - GAP FILL NOTES */}
                    {currentPart.part === 2 && (
                      <div className="pt-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Nhập thông tin điền vào chỗ trống ({qNum}):
                        </label>
                        <DebouncedInput
                          value={userAns}
                          onChange={(val) => onAnswer(qNum, val)}
                          placeholder="Nhập tên, số giờ, giá tiền, ngày tháng..."
                          ariaLabel={`Đáp án điền từ cho câu ${qNum}`}
                          className="w-full sm:w-80 px-4 py-3 rounded-xl border border-slate-300 focus:border-audio-500 focus:ring-2 focus:ring-audio-500/20 text-slate-900 font-semibold text-sm outline-none transition-all shadow-xs"
                        />
                      </div>
                    )}

                    {/* CASE 3: PART 3 & 4 - TEXT MULTIPLE CHOICE (A, B, C) */}
                    {(currentPart.part === 3 || currentPart.part === 4) && q.options && (
                      <div className="space-y-2.5" role="radiogroup" aria-label={`Các phương án câu ${qNum}`}>
                        {Object.entries(q.options).map(([optKey, optText]) => {
                          const isSelected = userAns === optKey
                          return (
                            <button
                              key={optKey}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => onAnswer(qNum, optKey)}
                              className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500 ${
                                isSelected
                                  ? 'bg-audio-50 border-audio-500 text-audio-900 ring-2 ring-audio-500/20 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-lexend shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-audio-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {optKey}
                              </span>
                              <span className="text-sm font-medium leading-relaxed">
                                {optText}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* CASE 4: PART 5 - MATCHING (A - H, 44x44px touch targets) */}
                    {currentPart.part === 5 && (
                      <div className="pt-2 space-y-3">
                        <label className="block text-xs font-semibold text-slate-700">
                          Chọn đáp án ghép đôi phù hợp:
                        </label>
                        <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={`Đáp án ghép đôi cho câu ${qNum}`}>
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => {
                            const isSelected = userAns === letter
                            return (
                              <button
                                key={letter}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                aria-label={`Ghép với lựa chọn ${letter}`}
                                onClick={() => onAnswer(qNum, letter)}
                                className={`w-11 h-11 rounded-xl font-bold font-lexend text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500 ${
                                  isSelected
                                    ? 'bg-audio-600 text-white shadow-md shadow-audio-600/30'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {letter}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Bilingual Hint */}
                    {bilingualMode && (
                      <div className="mt-3 text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {currentPart.part === 1 && `(Dịch câu hỏi ${qNum}: Lắng nghe chi tiết về người, đồ vật hoặc thời gian trong audio)`}
                        {currentPart.part === 2 && `(Dịch câu hỏi ${qNum}: Chú ý cách đánh vần tên riêng hoặc số liệu giờ giấc/tiền tệ)`}
                        {currentPart.part === 5 && `(Gợi ý nối: Đối chiếu sở thích của ${q.person || 'nhân vật'} với các lựa chọn từ A đến H)`}
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
