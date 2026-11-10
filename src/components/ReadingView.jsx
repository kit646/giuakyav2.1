import React, { useState, useEffect } from 'react'
import { BookOpen, Flag, CheckCircle2, LayoutGrid, AlertCircle, ZoomIn, Check, ChevronDown, ChevronUp, CheckSquare } from 'lucide-react'
import { getImageUrl } from '../services/dataService'
import ImageModal from './ImageModal'
import QuestionMatrixModal from './QuestionMatrixModal'

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

export default function ReadingView({
  test,
  paperKey,
  answers = {},
  flagged = {},
  onAnswer,
  onToggleFlag,
  onSubmit,
  bilingualMode,
  examMode,
  timeLeft,
  isMobileMode = false
}) {
  const paper = test.papers ? test.papers[paperKey] : null
  const parts = paper?.parts || []
  
  const [activePartIndex, setActivePartIndex] = useState(0)
  const [isMatrixOpen, setIsMatrixOpen] = useState(false)
  const [modalImage, setModalImage] = useState(null)
  const [mobileReadingTab, setMobileReadingTab] = useState('questions')
  const [mobilePassageExpanded, setMobilePassageExpanded] = useState(false)

  const currentPart = parts[activePartIndex] || parts[0]

  // Format time mm:ss for exam mode
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Count total answered in this paper
  const totalQuestionsInPaper = parts.reduce((acc, p) => acc + (p.questions?.length || 0), 0)
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

  const handleSelectQuestionFromMatrix = (partIdx, qNum) => {
    setActivePartIndex(partIdx)
    setTimeout(() => {
      const el = document.getElementById(`reading-question-${qNum}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const scrollToPassage = () => {
    const el = document.getElementById('reading-passage-column')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToQuestions = () => {
    const el = document.getElementById('reading-questions-column')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Lightbox Modal */}
      {modalImage && (
        <ImageModal
          src={modalImage.src}
          alt={modalImage.alt}
          onClose={() => setModalImage(null)}
        />
      )}

      {/* Question Matrix Drawer/Modal */}
      <QuestionMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        parts={parts}
        answers={answers}
        flagged={flagged}
        onSelectQuestion={handleSelectQuestionFromMatrix}
        onSubmit={onSubmit}
      />

      {/* Top Bar: Title, Part Tabs, Matrix & Submit */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Test Info & Parts Navigation */}
        <div className="space-y-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700">
              {test.title}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              Reading & Writing • Đã làm <strong className="text-brand-700">{answeredCount}/{totalQuestionsInPaper}</strong> câu
            </span>
          </div>

          {/* Part Selection Tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Các phần thi Reading">
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
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm'
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

        {/* Right: Matrix, Timer (if Exam Mode) & Submit Button */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          {/* Question Matrix Button */}
          <button
            type="button"
            onClick={() => setIsMatrixOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
            title="Mở bảng câu hỏi"
            aria-label={`Mở bảng câu hỏi (Đã làm ${answeredCount} trên ${totalQuestionsInPaper})`}
          >
            <LayoutGrid className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Bảng câu hỏi ({answeredCount}/{totalQuestionsInPaper})</span>
            <span className="sm:hidden">{answeredCount}/{totalQuestionsInPaper}</span>
          </button>

          {examMode === 'exam' && timeLeft !== undefined && (
            <div 
              aria-label={`Thời gian còn lại: ${formatTimer(timeLeft)}`}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 border ${
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
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-fresh-600 hover:bg-fresh-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-fresh-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-fresh-500"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Nộp bài & Chấm điểm</span>
          </button>
        </div>

      </div>

      {/* Mobile Anchor Bar (Visible only on < lg screens) */}
      <div className="lg:hidden flex items-center justify-between bg-slate-100 p-2 rounded-xl border border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={scrollToPassage}
          className="flex-1 py-1.5 text-center text-brand-700 bg-white rounded-lg shadow-xs hover:bg-brand-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Lên đầu bài đọc</span>
        </button>
        <span className="px-2 text-slate-400">•</span>
        <button
          type="button"
          onClick={scrollToQuestions}
          className="flex-1 py-1.5 text-center text-slate-700 bg-white rounded-lg shadow-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <span>Xuống danh sách câu hỏi</span>
        </button>
      </div>

      {/* Part Content Area */}
      {currentPart && (
        <div className="space-y-6">
          
          {/* Part Header & Instructions */}
          <div className="bg-brand-50/70 border border-brand-200/80 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                Part {currentPart.part}: {currentPart.title || 'Reading Section'}
              </h2>
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">Phím [ lùi • ] tiến Part</span>
            </div>
            <p className="text-sm text-slate-700">
              {currentPart.instructions || 'Đọc kỹ thông tin và chọn câu trả lời chính xác nhất.'}
            </p>
            {bilingualMode && (
              <p className="text-xs text-brand-800 italic mt-1 font-semibold">
                💡 Mẹo làm bài: Hãy đọc lướt câu hỏi trước, sau đó tìm từ khóa tương ứng trong đoạn văn bên trái.
              </p>
            )}
          </div>

          {/* Special notice if Part 2 has no scanned questions (omitted pages in book) */}
          {currentPart.note && (!currentPart.questions || currentPart.questions.length === 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>Ghi chú về phần thi này trong sách gốc</span>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed">
                {currentPart.note}
              </p>
              {currentPart.answers_only && (
                <div className="bg-white p-4 rounded-xl border border-amber-200">
                  <div className="text-xs font-bold text-slate-700 mb-2">Đáp án chuẩn từ KEY.pdf:</div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {Object.entries(currentPart.answers_only).map(([qNum, ans]) => (
                      <div key={qNum} className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs text-slate-600 font-mono">Q{qNum}</div>
                        <div className="text-sm font-bold text-brand-600">{ans}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Reading Mode Segmented Tab Selector */}
          {isMobileMode && currentPart.part !== 1 && (
            <div className="flex bg-slate-200/90 p-1 rounded-2xl sticky top-14 z-20 shadow-xs mb-4">
              <button
                type="button"
                onClick={() => setMobileReadingTab('passage')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mobileReadingTab === 'passage'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                <span>1. Xem đoạn văn</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileReadingTab('questions')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mobileReadingTab === 'questions'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>2. Làm câu hỏi ({currentPart.questions?.length || 0} câu)</span>
              </button>
            </div>
          )}

          {/* MAIN TWO-COLUMN SPLIT VIEW FOR READING */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Passage or Stimulus Area (6 Cols) */}
            <div 
              id="reading-passage-column"
              className={`lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4 max-h-[750px] overflow-y-auto lg:sticky lg:top-24 ${
                isMobileMode && currentPart.part !== 1 && mobileReadingTab === 'questions' ? 'hidden lg:block' : 'block'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  <span>Văn Bản Đọc Hiểu (Reading Material)</span>
                </div>
                <span className="text-xs text-slate-500 font-mono font-medium">Cuộn để đọc</span>
              </div>

              {/* Resolve reading material (single passage, notice stimuli, or empty) */}
              {(() => {
                const passageObj = currentPart.passage 
                  ? (typeof currentPart.passage === 'object' ? currentPart.passage : { title: currentPart.passage_title || '', text: currentPart.passage })
                  : (currentPart.passage_text ? { title: currentPart.passage_title || '', text: currentPart.passage_text, author: currentPart.passage_author, email_header: currentPart.email_header, example: currentPart.example } : null)

                if (passageObj && passageObj.text) {
                  return (
                    <div className="space-y-4">
                      {passageObj.title && (
                        <h3 className="text-lg font-bold text-brand-900 border-b border-slate-100 pb-2">
                          {passageObj.title}
                        </h3>
                      )}
                      {passageObj.author && (
                        <p className="text-xs font-semibold text-slate-500 italic -mt-2">
                          {passageObj.author}
                        </p>
                      )}
                      {passageObj.email_header && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono space-y-1">
                          {Object.entries(passageObj.email_header).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                              <span className="font-bold text-slate-600 min-w-14">{k}:</span>
                              <span className="text-slate-900 font-medium">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {passageObj.example && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 font-medium flex items-center gap-2">
                          <span className="font-bold px-1.5 py-0.5 bg-amber-200/80 rounded text-amber-900">Ví dụ (0):</span>
                          <span>{typeof passageObj.example === 'object' ? Object.entries(passageObj.example).map(([k, v]) => `(${k}) ${v}`).join(', ') : passageObj.example}</span>
                        </div>
                      )}
                      <div className="text-base text-slate-800 leading-relaxed whitespace-pre-line font-vietnam selection:bg-brand-100">
                        {passageObj.text}
                      </div>
                      {bilingualMode && passageObj.title && (
                        <div className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                          <strong>Bản dịch gợi ý:</strong> Đọc kỹ các chi tiết ngày tháng, địa điểm và sở thích của nhân vật để đối chiếu câu trả lời.
                        </div>
                      )}
                    </div>
                  )
                }

                if (currentPart.part === 1) {
                  return (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-600 font-medium">
                        Mỗi câu hỏi tương ứng với một biển báo hoặc đoạn tin nhắn ngắn riêng biệt bên dưới. Bấm vào ảnh để phóng to.
                      </p>
                      <div className="space-y-4">
                        {(currentPart.questions || []).map((q) => {
                          const qNum = q.question_number || q.number
                          const stimImg = q.images?.stimulus ? getImageUrl(q.images.stimulus) : null

                          return (
                            <div key={qNum} className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                                  Câu {qNum} - Biển báo / Tin nhắn
                                </span>
                              </div>

                              {stimImg ? (
                                <div 
                                  onClick={() => setModalImage({ src: stimImg, alt: `Biển báo câu ${qNum}` })}
                                  className="group relative flex justify-center bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-brand-400 transition-colors"
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      setModalImage({ src: stimImg, alt: `Biển báo câu ${qNum}` })
                                    }
                                  }}
                                  aria-label={`Phóng to hình biển báo câu ${qNum}`}
                                >
                                  <img
                                    src={stimImg}
                                    alt={`Biển báo câu ${qNum}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="max-h-48 object-contain rounded"
                                  />
                                  <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                                    <span className="bg-white/90 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                                      <ZoomIn className="w-3.5 h-3.5" /> Phóng to
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-white p-4 rounded-lg border-2 border-slate-300 font-mono text-sm font-bold text-center tracking-wide text-slate-800 uppercase shadow-xs">
                                  {q.stimulus_text || q.text || q.prompt}
                                </div>
                              )}

                              {bilingualMode && (
                                <div className="text-xs text-slate-600 italic font-medium">
                                  💡 Chú ý từ khóa điều kiện (chỉ dành cho ai, khi nào, ở đâu).
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="text-sm text-slate-600 italic p-4 text-center font-medium">
                    Vui lòng đọc các câu hỏi bên phải để làm bài.
                  </div>
                )
              })()}

              {/* Mobile Quick Action: Switch to questions */}
              {isMobileMode && currentPart.part !== 1 && (
                <button
                  type="button"
                  onClick={() => setMobileReadingTab('questions')}
                  className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                >
                  <span>Đã đọc xong, chuyển sang làm câu hỏi</span>
                  <CheckSquare className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* RIGHT COLUMN: Questions & Options (6 Cols) */}
            <div 
              id="reading-questions-column" 
              className={`lg:col-span-6 space-y-5 ${
                isMobileMode && currentPart.part !== 1 && mobileReadingTab === 'passage' ? 'hidden lg:block' : 'block'
              }`}
            >
              {/* Mobile Shortcut to re-read passage */}
              {isMobileMode && currentPart.part !== 1 && (
                <button
                  type="button"
                  onClick={() => setMobileReadingTab('passage')}
                  className="w-full p-2.5 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-brand-600" />
                    <span>Bấm để xem lại đoạn văn đọc hiểu</span>
                  </span>
                  <span className="text-[11px] text-brand-700 font-semibold underline">Xem bài đọc</span>
                </button>
              )}
              {(currentPart.questions || []).map((q) => {
                const qNum = q.question_number || q.number
                const userAns = answers[qNum]
                const isFlagged = flagged[qNum]
                const options = q.options || {}

                return (
                  <div
                    id={`reading-question-${qNum}`}
                    key={qNum}
                    className={`bg-white rounded-2xl border p-5 shadow-card transition-all ${
                      userAns !== undefined ? 'border-brand-400 ring-1 ring-brand-300' : 'border-slate-200'
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

                    {/* Question Text Prompt */}
                    <div className="text-base font-semibold text-slate-900 mb-4 leading-snug">
                      {q.question || q.prompt || (currentPart.part === 5 ? `Chỗ trống (${qNum}) — Hãy điền MỘT từ thích hợp:` : currentPart.part === 4 ? `Chỗ trống (${qNum}) — Chọn từ thích hợp điền vào đoạn văn:` : 'Chọn đáp án đúng nhất:')}
                    </div>

                    {/* Multiple Choice Options (A, B, C) */}
                    {typeof options === 'object' && Object.keys(options).length > 0 ? (
                      <div className="space-y-2.5" role="radiogroup" aria-label={`Các phương án câu ${qNum}`}>
                        {Object.entries(options).map(([optKey, optText]) => {
                          const isSelected = userAns === optKey

                          return (
                            <button
                              key={optKey}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => onAnswer(qNum, optKey)}
                              className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                                isSelected
                                  ? 'bg-brand-50 border-brand-600 text-brand-900 ring-2 ring-brand-500/20 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-lexend shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-brand-600 text-white'
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
                    ) : (
                      /* Open Cloze text input (Part 5: điền từ với DebouncedInput) */
                      <div className="pt-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Nhập MỘT từ cần điền vào ô trống ({qNum}):
                        </label>
                        <DebouncedInput
                          value={userAns}
                          onChange={(val) => onAnswer(qNum, val)}
                          placeholder="Nhập 1 từ duy nhất (ví dụ: at, on, the, with...)"
                          ariaLabel={`Đáp án điền từ chỗ trống câu ${qNum}`}
                          className="w-full sm:w-80 px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 font-semibold text-sm outline-none transition-all shadow-xs"
                        />
                      </div>
                    )}

                    {/* Bilingual Hint */}
                    {bilingualMode && (
                      <div className="mt-3 text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                        {currentPart.part === 1 && `(Dịch câu hỏi ${qNum}: Biển báo này có nghĩa gì đối với người đọc?)`}
                        {currentPart.part === 4 && `(Dịch câu hỏi ${qNum}: Chọn giới từ hoặc liên từ phù hợp với ngữ cảnh của câu)`}
                        {currentPart.part === 5 && `(Gợi ý: Điền các từ chức năng như mạo từ, giới từ, đại từ hoặc trợ động từ)`}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  )
}
