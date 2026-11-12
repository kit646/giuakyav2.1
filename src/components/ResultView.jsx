import React, { useState, useEffect } from 'react'
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  Headphones,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  FileSearch,
  ArrowRight,
  MapPin
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { getImageUrl } from '../services/dataService'

export default function ResultView({
  result,
  test,
  paperKey,
  onRetakeTest,
  onNavigateHome,
  onStartOtherPaper,
  onReviewInTest,
  isMobileMode = false
}) {
  const [filter, setFilter] = useState('all') // 'all' | 'wrong' | 'correct'
  const [expandedTranscripts, setExpandedTranscripts] = useState({})

  const otherPaperKey = paperKey.includes('reading')
    ? (test?.papers?.listening ? 'listening' : null)
    : (test?.papers?.reading_and_writing ? 'reading_and_writing' : test?.papers?.reading ? 'reading' : null)

  // Trigger celebration confetti on high score & auto-expand transcripts for wrong questions
  useEffect(() => {
    if (result) {
      if (result.cambridgeScore >= 120) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          })
        } catch (e) {}
      }
      // Auto-expand transcripts for all wrong questions so user immediately sees evidence
      const initialExpanded = {}
      ;(result.questionDetails || []).forEach((q) => {
        if (!q.isCorrect && q.transcript) {
          initialExpanded[q.questionNumber] = true
        }
      })
      setExpandedTranscripts(initialExpanded)
    }
  }, [result])

  if (!result) return null

  const {
    totalQuestions,
    answeredCount = 0,
    correctCount,
    percentage,
    cambridgeScore,
    badge,
    partBreakdown = [],
    questionDetails = []
  } = result

  const wrongCount = totalQuestions - correctCount
  const unansweredCount = questionDetails.filter(q => q.isUnanswered).length
  const wrongAnsweredCount = wrongCount - unansweredCount

  const filteredQuestions = questionDetails.filter((q) => {
    if (filter === 'wrong') return !q.isCorrect
    if (filter === 'correct') return q.isCorrect
    return true
  })

  const toggleTranscript = (qNum) => {
    setExpandedTranscripts(prev => ({
      ...prev,
      [qNum]: !prev[qNum]
    }))
  }

  const scrollToQuestionCard = (qNum) => {
    // Ensure filter shows this question
    const targetQ = questionDetails.find(q => q.questionNumber === qNum)
    if (targetQ) {
      if (filter === 'wrong' && targetQ.isCorrect) setFilter('all')
      if (filter === 'correct' && !targetQ.isCorrect) setFilter('all')
    }
    setTimeout(() => {
      const el = document.getElementById(`result-question-${qNum}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 60)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Quay về trang chủ"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {onReviewInTest && (
            <button
              type="button"
              onClick={onReviewInTest}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <FileSearch className="w-4 h-4" />
              <span>Xem lỗi sai trực tiếp trên Đề Thi</span>
            </button>
          )}

          {otherPaperKey && onStartOtherPaper && (
            <button
              type="button"
              onClick={() => onStartOtherPaper(otherPaperKey)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              {otherPaperKey === 'listening' ? (
                <>
                  <Headphones className="w-4 h-4 text-audio-400" />
                  <span>Làm tiếp phần Nghe (Listening) →</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-sunny-400" />
                  <span>Làm tiếp phần Đọc (Reading) →</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onRetakeTest}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-sm rounded-xl border border-brand-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Làm lại bài thi này"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại bài này</span>
          </button>
        </div>
      </div>

      {/* Main Score Celebration Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-card text-center space-y-6">
        
        {/* Badge & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Award className="w-4 h-4 text-sunny-500" />
            <span>Kết Quả & Chữa Bài Chi Tiết Cambridge A2 Key</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {test.title} • {paperKey.includes('reading') ? 'Reading & Writing' : 'Listening'}
          </h1>
        </div>

        {/* Cambridge Score Big Display */}
        <div className="inline-block p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-inner">
          <div className="text-xs uppercase font-bold tracking-widest text-slate-600 mb-1">
            Điểm Quy Đổi Cambridge Scale
          </div>
          <div className="text-5xl sm:text-7xl font-extrabold font-lexend text-brand-600 tracking-tight">
            {cambridgeScore}
            <span className="text-2xl sm:text-3xl font-semibold text-slate-500">/150</span>
          </div>

          {/* Official Cambridge Grade Badge */}
          <div className="mt-4">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-extrabold shadow-sm ${badge.color}`}>
              {badge.title} ({badge.cefr})
            </span>
          </div>
        </div>

        {/* Motivational Feedback Quote */}
        <p className="text-base text-slate-700 max-w-xl mx-auto leading-relaxed font-medium">
          {badge.description}
        </p>

        {/* Quick Stats Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto pt-4 border-t border-slate-100">
          <div className="bg-fresh-50 border border-fresh-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-fresh-700 font-semibold">Làm đúng ✅</div>
            <div className="text-xl sm:text-2xl font-bold font-lexend text-fresh-700 mt-0.5">
              {correctCount}/{totalQuestions}
            </div>
          </div>

          <div className="bg-coral-50 border border-coral-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-coral-700 font-semibold">Làm sai ❌</div>
            <div className="text-xl sm:text-2xl font-bold font-lexend text-coral-700 mt-0.5">
              {wrongAnsweredCount}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-amber-800 font-semibold">Bỏ trống ⚠️</div>
            <div className="text-xl sm:text-2xl font-bold font-lexend text-amber-700 mt-0.5">
              {unansweredCount}
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-brand-700 font-semibold">Tỉ lệ chính xác</div>
            <div className="text-xl sm:text-2xl font-bold font-lexend text-brand-700 mt-0.5">
              {percentage}%
            </div>
          </div>
        </div>

      </div>

      {/* Quick Question Navigator Map (Click to jump to any question) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Bảng Tra Cứu Nhanh Đúng / Sai Từng Câu
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Bấm vào số thứ tự câu bất kỳ để nhảy tới phần chỉ lỗi sai & giải thích của câu đó
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 text-fresh-700">
              <span className="w-3 h-3 rounded bg-fresh-500 inline-block" /> Đúng ({correctCount})
            </span>
            <span className="inline-flex items-center gap-1.5 text-coral-700">
              <span className="w-3 h-3 rounded bg-coral-500 inline-block" /> Sai ({wrongAnsweredCount})
            </span>
            {unansweredCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Bỏ trống ({unansweredCount})
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2">
          {questionDetails.map((q) => {
            const btnStyle = q.isCorrect
              ? 'bg-fresh-500 hover:bg-fresh-600 text-white border-fresh-600 shadow-xs'
              : q.isUnanswered
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                : 'bg-coral-500 hover:bg-coral-600 text-white border-coral-600 shadow-xs'

            return (
              <button
                key={q.questionNumber}
                type="button"
                onClick={() => scrollToQuestionCard(q.questionNumber)}
                className={`h-10 rounded-xl border font-lexend font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${btnStyle}`}
                title={`Câu ${q.questionNumber}: ${q.isCorrect ? 'Đúng' : q.isUnanswered ? 'Bỏ trống' : `Sai (Bạn chọn ${q.userAnswer} - Đáp án: ${q.correctAnswer})`}`}
              >
                <span>{q.questionNumber}</span>
                <span className="text-[9px] opacity-90 leading-none">
                  {q.isCorrect ? '✓' : q.isUnanswered ? '—' : '✗'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Part Breakdown Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Kết quả theo từng Part
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {partBreakdown.map((pb) => (
            <div
              key={pb.partNumber}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Part {pb.partNumber}</span>
                <span className={pb.correct === pb.total ? 'text-fresh-600' : 'text-brand-600'}>
                  {pb.correct}/{pb.total} câu đúng
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`${pb.correct === pb.total ? 'bg-fresh-500' : 'bg-brand-600'} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${pb.percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-600 font-medium truncate">
                {pb.partTitle}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Question By Question Review */}
      <div className="space-y-4">
        
        {/* Section Header with Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs sticky top-14 z-20">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-brand-600" />
              <span>Chi Tiết Đáp Án & Chỉ Ra Vị Trí Lỗi Sai</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Mỗi câu sai đều chỉ rõ bạn đã chọn gì, đáp án đúng là gì và trích dẫn câu chứa đáp án trong bài
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold shrink-0" role="tablist" aria-label="Lọc câu hỏi xem lại">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Tất cả ({questionDetails.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'wrong'}
              onClick={() => setFilter('wrong')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'wrong' ? 'bg-coral-600 text-white shadow-sm font-bold' : 'text-coral-700 hover:bg-coral-50'
              }`}
            >
              Câu Sai / Bỏ trống ({wrongCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'correct'}
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'correct' ? 'bg-fresh-600 text-white shadow-sm font-bold' : 'text-fresh-700 hover:bg-fresh-50'
              }`}
            >
              Câu Đúng ({correctCount})
            </button>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-fresh-500 mx-auto" />
            <div className="text-lg font-bold text-slate-900">
              {filter === 'wrong' ? 'Tuyệt vời! Bạn không làm sai câu nào trong bài thi này!' : 'Không có câu hỏi nào trong mục này.'}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredQuestions.map((q) => {
              const isCorrect = q.isCorrect
              const isUnanswered = q.isUnanswered
              const isExpanded = expandedTranscripts[q.questionNumber]
              const userKeyUpper = String(q.userAnswer || '').trim().toUpperCase()
              const correctKeyUpper = String(q.correctAnswer || '').trim().toUpperCase()
              const hasOptionImages = Boolean(q.images?.option_A && q.images?.option_B && q.images?.option_C)
              const stimulusImg = q.images?.stimulus ? getImageUrl(q.images.stimulus) : null

              return (
                <div
                  id={`result-question-${q.questionNumber}`}
                  key={q.questionNumber}
                  className={`rounded-2xl border p-5 sm:p-6 bg-white shadow-card transition-all space-y-4 ${
                    isCorrect
                      ? 'border-fresh-300'
                      : isUnanswered
                        ? 'border-amber-300 ring-1 ring-amber-200'
                        : 'border-coral-300 ring-2 ring-coral-200/70'
                  }`}
                >
                  {/* Header: Question Number, Part & Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold font-lexend ${
                        isCorrect
                          ? 'bg-fresh-600 text-white'
                          : isUnanswered
                            ? 'bg-amber-500 text-white'
                            : 'bg-coral-600 text-white'
                      }`}>
                        {q.questionNumber}
                      </span>
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                          Part {q.partNumber} • {q.partTitle}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          Câu hỏi số {q.questionNumber}
                        </span>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${
                      isCorrect
                        ? 'bg-fresh-50 text-fresh-700 border border-fresh-200'
                        : isUnanswered
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : 'bg-coral-50 text-coral-700 border border-coral-200'
                    }`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-fresh-600" />
                          <span>Đúng (+1 điểm)</span>
                        </>
                      ) : isUnanswered ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Bỏ trống — Chưa làm</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-coral-600" />
                          <span>Làm sai — Cần xem lại</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Reading Part 1 Notice / Sign Stimulus if present */}
                  {(stimulusImg || (q.partNumber === 1 && q.stimulusText)) && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-500 uppercase">
                        📋 Nội dung biển báo / tin nhắn (Câu {q.questionNumber}):
                      </div>
                      {stimulusImg ? (
                        <img
                          src={stimulusImg}
                          alt={`Biển báo câu ${q.questionNumber}`}
                          className="max-h-44 object-contain rounded-lg mx-auto bg-white p-2 border border-slate-200"
                        />
                      ) : (
                        <div className="p-3 bg-white rounded-lg border-2 border-slate-300 font-mono text-sm font-bold text-slate-800 text-center">
                          {q.stimulusText}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question Prompt */}
                  <div className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {q.prompt}
                  </div>

                  {/* Listening Part 1 Picture Options (A, B, C) with Visual Right/Wrong Badges */}
                  {hasOptionImages && (
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-1">
                      {['A', 'B', 'C'].map((optKey) => {
                        const isCorrectOpt = correctKeyUpper === optKey
                        const isUserWrongOpt = !isCorrect && userKeyUpper === optKey
                        const optImg = getImageUrl(q.images[`option_${optKey}`])
                        const optDesc = q.options?.[optKey] || ''

                        return (
                          <div
                            key={optKey}
                            className={`rounded-2xl border p-2.5 flex flex-col items-center justify-between gap-2 relative ${
                              isCorrectOpt
                                ? 'bg-fresh-50/70 border-fresh-500 ring-2 ring-fresh-500/30'
                                : isUserWrongOpt
                                  ? 'bg-coral-50/70 border-coral-500 ring-2 ring-coral-500/30'
                                  : 'bg-slate-50/60 border-slate-200 opacity-75'
                            }`}
                          >
                            <div className="w-full h-24 sm:h-32 bg-white rounded-xl flex items-center justify-center p-1.5 border border-slate-100">
                              <img
                                src={optImg}
                                alt={`Hình ${optKey}`}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="w-full flex flex-wrap items-center justify-between gap-1 px-1">
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${
                                isCorrectOpt
                                  ? 'bg-fresh-600 text-white'
                                  : isUserWrongOpt
                                    ? 'bg-coral-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                              }`}>
                                Hình {optKey}
                              </span>
                              {isCorrectOpt && (
                                <span className="text-[11px] font-extrabold text-fresh-700">
                                  ✓ Đáp án đúng
                                </span>
                              )}
                              {isUserWrongOpt && (
                                <span className="text-[11px] font-extrabold text-coral-700">
                                  ✗ Bạn chọn
                                </span>
                              )}
                            </div>
                            {optDesc && (
                              <div className="text-[11px] text-slate-600 font-medium text-center line-clamp-2">
                                {optDesc}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Cloze Sentence Inline Diff (For Reading Part 4 & Part 5) */}
                  {q.clozeContext && (
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                      <div className="text-xs font-extrabold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        <span>Vị trí chỗ trống ({q.questionNumber}) trong đoạn văn:</span>
                      </div>
                      <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                        <span>...{q.clozeContext.beforeGap} </span>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mx-1 rounded-lg bg-fresh-100 border border-fresh-400 text-fresh-900 font-extrabold">
                            ({q.questionNumber}) ✓ {q.correctOptionText || q.correctAnswer}
                          </span>
                        ) : (
                          <span className="inline-flex flex-wrap items-center gap-1.5 px-2.5 py-0.5 mx-1 rounded-lg bg-white border-2 border-coral-400 shadow-2xs">
                            <span className="text-xs font-bold text-slate-500">({q.questionNumber})</span>
                            <span className="line-through text-coral-700 font-bold">
                              ✗ {q.isUnanswered ? 'bỏ trống' : (q.userOptionText || q.userAnswer)}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-fresh-700 font-extrabold bg-fresh-50 px-1.5 py-0.5 rounded border border-fresh-300">
                              ✓ {q.correctOptionText || q.correctAnswer}
                            </span>
                          </span>
                        )}
                        <span> {q.clozeContext.afterGap}...</span>
                      </p>
                    </div>
                  )}

                  {/* Listening Part 2 Gap-fill Form Line Context */}
                  {!q.isMultipleChoiceOrMatching && !q.clozeContext && (q.label || q.prefix || q.suffix) && (
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                      <div className="text-xs font-extrabold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        <span>Vị trí điền thông tin trên phiếu {q.formTitle ? `(${q.formTitle})` : ''}:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-semibold text-slate-900">
                        {q.label && <span className="text-slate-700">{q.label}:</span>}
                        {q.prefix && <span className="px-2 py-0.5 bg-white rounded border border-slate-200">{q.prefix}</span>}
                        {isCorrect ? (
                          <span className="px-3 py-1 rounded-lg bg-fresh-100 border border-fresh-400 text-fresh-900 font-extrabold">
                            ✓ {q.userAnswer}
                          </span>
                        ) : (
                          <span className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-lg bg-white border-2 border-coral-400">
                            <span className="line-through text-coral-700 font-bold">
                              ✗ {q.isUnanswered ? '(Bỏ trống)' : q.userAnswer}
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                            <span className="text-fresh-700 font-extrabold bg-fresh-50 px-2 py-0.5 rounded border border-fresh-300">
                              ✓ {q.correctAnswer}
                            </span>
                          </span>
                        )}
                        {q.suffix && <span className="px-2 py-0.5 bg-white rounded border border-slate-200">{q.suffix}</span>}
                      </div>
                    </div>
                  )}

                  {/* Side-by-side Answer Comparison Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className={`p-3 rounded-xl border ${
                      isCorrect
                        ? 'bg-fresh-50/70 border-fresh-200'
                        : 'bg-coral-50/70 border-coral-200'
                    }`}>
                      <span className="text-xs text-slate-600 block font-semibold mb-1">
                        Câu trả lời của bạn:
                      </span>
                      <span className={`text-base font-extrabold ${
                        isCorrect ? 'text-fresh-800' : 'text-coral-700'
                      }`}>
                        {isCorrect ? '✓ ' : '✗ '}
                        {q.userAnswerDisplay}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border bg-fresh-50/80 border-fresh-300">
                      <span className="text-xs text-fresh-800 block font-semibold mb-1">
                        Đáp án đúng chuẩn Cambridge:
                      </span>
                      <span className="text-base font-extrabold text-fresh-900">
                        ✓ {q.correctAnswerDisplay}
                      </span>
                      {q.acceptedAnswers && q.acceptedAnswers.length > 1 && (
                        <span className="block text-xs text-fresh-700 font-medium mt-0.5">
                          (Chấp nhận: {q.acceptedAnswers.join(' / ')})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* All Options Breakdown (For Multiple Choice A/B/C or Matching A-H) */}
                  {q.isMultipleChoiceOrMatching && q.options && !hasOptionImages && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Đối chiếu các phương án lựa chọn:
                      </div>
                      <div className={`grid ${Object.keys(q.options).length > 3 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2`}>
                        {Object.entries(q.options).map(([optKey, optText]) => {
                          const optUpper = optKey.toUpperCase()
                          const isCorrectOption = optUpper === correctKeyUpper
                          const isUserWrongOption = !isCorrect && optUpper === userKeyUpper

                          return (
                            <div
                              key={optKey}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-sm ${
                                isCorrectOption
                                  ? 'bg-fresh-50 border-fresh-500 text-fresh-950 font-bold ring-1 ring-fresh-500/30'
                                  : isUserWrongOption
                                    ? 'bg-coral-50 border-coral-400 text-coral-950 font-semibold'
                                    : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                                  isCorrectOption
                                    ? 'bg-fresh-600 text-white'
                                    : isUserWrongOption
                                      ? 'bg-coral-600 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {optKey}
                                </span>
                                <span className={isUserWrongOption ? 'line-through decoration-coral-600' : ''}>
                                  {optText}
                                </span>
                              </div>

                              {isCorrectOption && (
                                <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-fresh-600 text-white text-[11px] font-extrabold">
                                  ✓ Đáp án đúng
                                </span>
                              )}
                              {isUserWrongOption && (
                                <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-coral-600 text-white text-[11px] font-extrabold">
                                  ✗ Bạn đã chọn (Sai)
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Diagnostic Error Analysis & Evidence Box ("Lỗi sai ở đâu & Dẫn chứng") */}
                  {(!isCorrect || q.evidenceQuote || q.explanation) && (
                    <div className={`rounded-2xl p-4 border space-y-2.5 ${
                      !isCorrect
                        ? 'bg-coral-50/40 border-coral-200'
                        : 'bg-brand-50/40 border-brand-200'
                    }`}>
                      {!isCorrect && q.errorAnalysis && (
                        <div className="flex items-start gap-2 text-sm text-coral-900">
                          <span className="font-extrabold shrink-0">🔎 Chỉ ra lỗi sai:</span>
                          <span className="font-semibold leading-relaxed">{q.errorAnalysis}</span>
                        </div>
                      )}

                      {q.evidenceQuote && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-1">
                          <div className="font-extrabold text-brand-700 flex items-center gap-1.5 text-xs uppercase">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Dẫn chứng xác thực trong bài (Câu chứa đáp án đúng):</span>
                          </div>
                          <blockquote className="italic text-slate-900 font-medium border-l-3 border-fresh-500 pl-3 py-0.5">
                            "{q.evidenceQuote}"
                          </blockquote>
                        </div>
                      )}

                      {q.explanation && (
                        <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
                          💡 <strong>Ghi chú từ KEY.pdf:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audioscript collapsible (auto-expanded for wrong Listening questions) */}
                  {q.transcript && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => toggleTranscript(q.questionNumber)}
                        aria-expanded={isExpanded}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-audio-700 hover:text-audio-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-audio-500 rounded-lg px-2.5 py-1.5 bg-audio-50 border border-audio-200"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Ẩn toàn bộ lời thoại (Audioscript)' : 'Xem toàn bộ lời thoại (Audioscript)'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 p-4 bg-audio-50/60 rounded-xl border border-audio-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-vietnam">
                          <div className="text-[11px] font-extrabold uppercase text-audio-800 mb-1.5">
                            🎧 Lời thoại gốc trong băng nghe (Audioscript):
                          </div>
                          {q.transcript}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}

      </div>

    </div>
  )
}
