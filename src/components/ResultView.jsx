import React, { useState, useEffect, useRef } from 'react'
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  Headphones,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  FileSearch,
  MapPin
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { getImageUrl } from '../services/dataService'
import {
  useGSAP,
  animateEntrance,
  animateStaggerCards,
  animateProgressBars,
  animateCounter,
} from '../utils/motion'

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
  const scopeRef = useRef(null)
  const scoreNumRef = useRef(null)

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

  // 60fps Score Card + Counter + Part Progress Bars entrance
  useGSAP(
    () => {
      animateEntrance(scopeRef.current, '.gsap-score-card', { y: 16, duration: 0.4 })
      animateCounter(scoreNumRef.current, cambridgeScore, {
        from: Math.max(0, cambridgeScore - 45),
        duration: 0.85,
        delay: 0.08,
      })
      animateEntrance(scopeRef.current, '.gsap-grade-badge', {
        y: 8,
        scale: 0.9,
        duration: 0.42,
        delay: 0.16,
        ease: 'back.out(1.6)',
      })
      animateStaggerCards(scopeRef.current, '.gsap-stat-card', {
        y: 12,
        duration: 0.34,
        each: 0.05,
        delay: 0.1,
      })
      animateProgressBars(
        scopeRef.current,
        '.gsap-part-bar',
        Array(partBreakdown.length).fill(1),
        { duration: 0.65, delay: 0.18, stagger: 0.06 }
      )
    },
    { scope: scopeRef, dependencies: [test?.test_id, paperKey, cambridgeScore], revertOnUpdate: true }
  )

  // Filter-aware stagger reveal for review question cards
  useGSAP(
    () => {
      animateStaggerCards(scopeRef.current, '.gsap-review-card', {
        y: 14,
        duration: 0.32,
        maxTotalStagger: 0.25,
      })
    },
    { scope: scopeRef, dependencies: [filter], revertOnUpdate: true }
  )

  const toggleTranscript = (qNum) => {
    setExpandedTranscripts(prev => ({
      ...prev,
      [qNum]: !prev[qNum]
    }))
  }

  const scrollToQuestionCard = (qNum) => {
    const targetQ = questionDetails.find(q => q.questionNumber === qNum)
    if (targetQ) {
      if (filter === 'wrong' && targetQ.isCorrect) setFilter('all')
      if (filter === 'correct' && !targetQ.isCorrect) setFilter('all')
    }
    setTimeout(() => {
      const el = document.getElementById(`result-question-${qNum}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 60)
  }

  return (
    <div ref={scopeRef} className={isMobileMode
      ? 'w-full px-3 py-4 space-y-5 pb-24'
      : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 pb-20'
    }>

      {/* Top Navigation & Quick Actions */}
      <div className={isMobileMode ? 'space-y-2.5' : 'flex flex-wrap items-center justify-between gap-3'}>
        <div className={isMobileMode ? 'grid grid-cols-2 gap-2' : 'flex items-center gap-2'}>
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-sm transition-colors cursor-pointer"
            aria-label="Quay về trang chủ"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Về trang chủ</span>
          </button>

          <button
            type="button"
            onClick={onRetakeTest}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs sm:text-sm rounded-xl border border-brand-200 transition-colors cursor-pointer ${isMobileMode ? '' : 'hidden'}`}
            aria-label="Làm lại bài thi này"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>Làm lại bài</span>
          </button>
        </div>

        <div className={isMobileMode ? 'flex flex-col gap-2' : 'flex flex-wrap items-center gap-2'}>
          {onReviewInTest && (
            <button
              type="button"
              onClick={onReviewInTest}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer ${isMobileMode ? 'w-full' : ''}`}
            >
              <FileSearch className="w-4 h-4 shrink-0" />
              <span>Xem lỗi sai trực tiếp trên Đề Thi</span>
            </button>
          )}

          {otherPaperKey && onStartOtherPaper && (
            <button
              type="button"
              onClick={() => onStartOtherPaper(otherPaperKey)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer ${isMobileMode ? 'w-full' : ''}`}
            >
              {otherPaperKey === 'listening' ? (
                <>
                  <Headphones className="w-4 h-4 text-audio-300 shrink-0" />
                  <span>Làm tiếp phần Nghe (Listening) →</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-sunny-300 shrink-0" />
                  <span>Làm tiếp phần Đọc (Reading) →</span>
                </>
              )}
            </button>
          )}

          {!isMobileMode && (
            <button
              type="button"
              onClick={onRetakeTest}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs sm:text-sm rounded-xl border border-brand-200 transition-colors cursor-pointer"
              aria-label="Làm lại bài thi này"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Làm lại bài này</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Score Celebration Card */}
      <div className={`gsap-score-card bg-white rounded-3xl border border-slate-200 shadow-card text-center ${isMobileMode ? 'p-5 space-y-4' : 'p-6 sm:p-8 space-y-6'}`}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Award className="w-4 h-4 text-sunny-500 shrink-0" />
            <span>Kết Quả Cambridge A2 Key</span>
          </div>

          <h1 className={isMobileMode ? 'text-lg font-extrabold text-slate-900 leading-snug' : 'text-2xl sm:text-3xl font-extrabold text-slate-900'}>
            {test.title} • {paperKey.includes('reading') ? 'Reading & Writing' : 'Listening'}
          </h1>
        </div>

        {/* Cambridge Score Display */}
        <div className={`inline-block rounded-3xl bg-slate-50 border border-slate-200 shadow-inner ${isMobileMode ? 'px-6 py-4' : 'p-6 sm:p-8'}`}>
          <div className="text-[11px] uppercase font-bold tracking-widest text-slate-600 mb-1">
            Điểm Quy Đổi Cambridge Scale
          </div>
          <div className={isMobileMode ? 'text-4xl font-extrabold font-lexend text-brand-600 tracking-tight' : 'text-5xl sm:text-6xl font-extrabold font-lexend text-brand-600 tracking-tight'}>
            <span ref={scoreNumRef}>{cambridgeScore}</span>
            <span className={isMobileMode ? 'text-xl font-semibold text-slate-500' : 'text-2xl sm:text-3xl font-semibold text-slate-500'}>/150</span>
          </div>
          <div className="mt-3">
            <span className={`gsap-grade-badge inline-block px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold shadow-sm ${badge.color}`}>
              {badge.title} ({badge.cefr})
            </span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-700 max-w-xl mx-auto leading-relaxed font-medium">
          {badge.description}
        </p>

        {/* Quick Stats Metrics Row */}
        <div className={`grid gap-2.5 max-w-2xl mx-auto pt-4 border-t border-slate-100 ${isMobileMode ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4 sm:gap-4'}`}>
          <div className="gsap-stat-card bg-fresh-50 border border-fresh-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-fresh-700 font-semibold">Làm đúng ✅</div>
            <div className="text-xl font-bold font-lexend text-fresh-800 mt-0.5">
              {correctCount}/{totalQuestions}
            </div>
          </div>

          <div className="gsap-stat-card bg-coral-50 border border-coral-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-coral-700 font-semibold">Làm sai ❌</div>
            <div className="text-xl font-bold font-lexend text-coral-700 mt-0.5">
              {wrongAnsweredCount}
            </div>
          </div>

          <div className="gsap-stat-card bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-amber-800 font-semibold">Bỏ trống ⚠️</div>
            <div className="text-xl font-bold font-lexend text-amber-700 mt-0.5">
              {unansweredCount}
            </div>
          </div>

          <div className="gsap-stat-card bg-brand-50 border border-brand-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-brand-700 font-semibold">Tỉ lệ đúng</div>
            <div className="text-xl font-bold font-lexend text-brand-700 mt-0.5">
              {percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Quick Question Navigator Map */}
      <div className={`bg-white rounded-3xl border border-slate-200 shadow-card space-y-3.5 ${isMobileMode ? 'p-4' : 'p-6'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Bảng Tra Cứu Nhanh Đúng / Sai
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Chạm vào số câu để nhảy ngay tới phần xem đáp án & lỗi sai
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 text-fresh-700">
              <span className="w-2.5 h-2.5 rounded bg-fresh-500 inline-block" /> Đúng ({correctCount})
            </span>
            <span className="inline-flex items-center gap-1.5 text-coral-700">
              <span className="w-2.5 h-2.5 rounded bg-coral-500 inline-block" /> Sai ({wrongAnsweredCount})
            </span>
            {unansweredCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-amber-800">
                <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" /> Trống ({unansweredCount})
              </span>
            )}
          </div>
        </div>

        <div className={`grid gap-2 ${isMobileMode ? 'grid-cols-5' : 'grid-cols-5 sm:grid-cols-10'}`}>
          {questionDetails.map((q) => {
            const btnStyle = q.isCorrect
              ? 'bg-fresh-500 hover:bg-fresh-600 text-white border-fresh-600'
              : q.isUnanswered
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                : 'bg-coral-500 hover:bg-coral-600 text-white border-coral-600'

            return (
              <button
                key={q.questionNumber}
                type="button"
                onClick={() => scrollToQuestionCard(q.questionNumber)}
                className={`h-10 rounded-xl border font-lexend font-bold text-xs flex items-center justify-center gap-1 transition-transform cursor-pointer active:scale-95 shadow-sm ${btnStyle}`}
                title={`Câu ${q.questionNumber}: ${q.isCorrect ? 'Đúng' : q.isUnanswered ? 'Bỏ trống' : `Sai (${q.userAnswer} → ${q.correctAnswer})`}`}
              >
                <span>{q.questionNumber}</span>
                <span className="text-[10px] opacity-90">
                  {q.isCorrect ? '✓' : q.isUnanswered ? '—' : '✗'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Part Breakdown Overview */}
      <div className={`bg-white rounded-3xl border border-slate-200 shadow-card space-y-3 ${isMobileMode ? 'p-4' : 'p-6'}`}>
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Kết quả theo từng Part
        </h2>

        <div className={`grid gap-2.5 ${isMobileMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'}`}>
          {partBreakdown.map((pb) => (
            <div
              key={pb.partNumber}
              className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Part {pb.partNumber}</span>
                <span className={pb.correct === pb.total ? 'text-fresh-700' : 'text-brand-700'}>
                  {pb.correct}/{pb.total} đúng
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`gsap-part-bar ${pb.correct === pb.total ? 'bg-fresh-500' : 'bg-brand-600'} h-full rounded-full`}
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

      {/* Detailed Question By Question Review Section */}
      <div className="space-y-4">
        {/* Non-sticky Section Heading */}
        <div className="px-1">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-brand-600 shrink-0" />
            <span>Chi Tiết Đáp Án & Giải Thích Lỗi Sai</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            Hiển thị rõ từng phương án bạn chọn sai, đáp án đúng và dẫn chứng ngay trong bài
          </p>
        </div>

        {/* Compact Sticky Filter Pill Bar (Never overlaps Navbar or covers content) */}
        <div className={`sticky ${isMobileMode ? 'top-14' : 'top-16'} z-20 bg-slate-50/95 backdrop-blur-sm py-2`}>
          <div
            className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-bold"
            role="tablist"
            aria-label="Lọc câu hỏi xem lại"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              onClick={() => setFilter('all')}
              className={`py-2 px-2 rounded-xl transition-colors cursor-pointer text-center ${
                filter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Tất cả ({questionDetails.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'wrong'}
              onClick={() => setFilter('wrong')}
              className={`py-2 px-2 rounded-xl transition-colors cursor-pointer text-center ${
                filter === 'wrong' ? 'bg-coral-600 text-white shadow-sm' : 'text-coral-700 hover:bg-coral-50'
              }`}
            >
              Sai / Trống ({wrongCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'correct'}
              onClick={() => setFilter('correct')}
              className={`py-2 px-2 rounded-xl transition-colors cursor-pointer text-center ${
                filter === 'correct' ? 'bg-fresh-600 text-white shadow-sm' : 'text-fresh-700 hover:bg-fresh-50'
              }`}
            >
              Đúng ({correctCount})
            </button>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-fresh-500 mx-auto" />
            <div className="text-base sm:text-lg font-bold text-slate-900">
              {filter === 'wrong'
                ? 'Tuyệt vời! Bạn không làm sai câu nào trong bài thi này!'
                : 'Không có câu hỏi nào trong mục này.'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
                  className={`gsap-review-card scroll-mt-32 rounded-2xl border bg-white shadow-card transition-shadow duration-200 space-y-3.5 ${
                    isMobileMode ? 'p-4' : 'p-5 sm:p-6'
                  } ${
                    isCorrect
                      ? 'border-fresh-300'
                      : isUnanswered
                        ? 'border-amber-300 ring-1 ring-amber-200'
                        : 'border-coral-300 ring-1 ring-coral-200'
                  }`}
                >
                  {/* 1. Card Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold font-lexend shrink-0 ${
                        isCorrect
                          ? 'bg-fresh-600 text-white'
                          : isUnanswered
                            ? 'bg-amber-500 text-white'
                            : 'bg-coral-600 text-white'
                      }`}>
                        {q.questionNumber}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block truncate">
                          Part {q.partNumber}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          Câu {q.questionNumber}
                        </span>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold shrink-0 ${
                      isCorrect
                        ? 'bg-fresh-50 text-fresh-700 border border-fresh-200'
                        : isUnanswered
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : 'bg-coral-50 text-coral-700 border border-coral-200'
                    }`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                          <span>Đúng</span>
                        </>
                      ) : isUnanswered ? (
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
                  </div>

                  {/* 2. Reading Part 1 Notice / Sign Stimulus */}
                  {(stimulusImg || (q.partNumber === 1 && q.stimulusText)) && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">
                        📋 Nội dung biển báo / tin nhắn:
                      </div>
                      {stimulusImg ? (
                        <img
                          src={stimulusImg}
                          alt={`Biển báo câu ${q.questionNumber}`}
                          className="max-h-44 object-contain rounded-lg mx-auto bg-white p-2 border border-slate-200"
                        />
                      ) : (
                        <div className="p-3 bg-white rounded-lg border border-slate-300 font-mono text-xs sm:text-sm font-bold text-slate-800 text-center">
                          {q.stimulusText}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Question Prompt */}
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.prompt}
                  </div>

                  {/* 4A. Listening Part 1 Picture Options */}
                  {hasOptionImages && (
                    <div className={`grid gap-2.5 pt-1 ${isMobileMode ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-3 sm:gap-4'}`}>
                      {['A', 'B', 'C'].map((optKey) => {
                        const isCorrectOpt = correctKeyUpper === optKey
                        const isUserWrongOpt = !isCorrect && userKeyUpper === optKey
                        const optImg = getImageUrl(q.images[`option_${optKey}`])
                        const optDesc = q.options?.[optKey] || ''

                        return (
                          <div
                            key={optKey}
                            className={`rounded-2xl border p-2.5 flex flex-col justify-between gap-2 ${
                              isCorrectOpt
                                ? 'bg-fresh-50 border-fresh-500 ring-1 ring-fresh-400'
                                : isUserWrongOpt
                                  ? 'bg-coral-50 border-coral-400 ring-1 ring-coral-300'
                                  : 'bg-slate-50/70 border-slate-200 opacity-75'
                            }`}
                          >
                            <div className="w-full h-28 sm:h-32 bg-white rounded-xl flex items-center justify-center p-1.5 border border-slate-100">
                              <img
                                src={optImg}
                                alt={`Hình ${optKey}`}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="flex flex-col items-center gap-1 pt-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${
                                  isCorrectOpt
                                    ? 'bg-fresh-600 text-white'
                                    : isUserWrongOpt
                                      ? 'bg-coral-600 text-white'
                                      : 'bg-slate-200 text-slate-700'
                                }`}>
                                  Hình {optKey}
                                </span>
                                {isCorrectOpt && (
                                  <span className="text-xs font-extrabold text-fresh-800">
                                    ✓ Đúng
                                  </span>
                                )}
                                {isUserWrongOpt && (
                                  <span className="text-xs font-extrabold text-coral-800">
                                    ✗ Bạn chọn
                                  </span>
                                )}
                              </div>
                              {optDesc && (
                                <div className="text-[11px] text-slate-600 font-medium text-center leading-snug">
                                  {optDesc}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* 4B. Text Multiple Choice / Matching Options (Single Clean List — No Redundant Box) */}
                  {q.isMultipleChoiceOrMatching && q.options && !hasOptionImages && (
                    <div className="space-y-2">
                      {isUnanswered && (
                        <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Bạn chưa chọn đáp án cho câu này. Đáp án đúng được tô xanh bên dưới:</span>
                        </div>
                      )}

                      <div className={`grid gap-2 ${!isMobileMode && Object.keys(q.options).length > 3 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                        {Object.entries(q.options).map(([optKey, optText]) => {
                          const optUpper = optKey.toUpperCase()
                          const isCorrectOption = optUpper === correctKeyUpper
                          const isUserSelected = !isUnanswered && optUpper === userKeyUpper
                          const isUserWrongOption = !isCorrect && isUserSelected

                          return (
                            <div
                              key={optKey}
                              className={`p-3 rounded-xl border flex flex-col gap-1.5 text-sm ${
                                isCorrectOption
                                  ? 'bg-fresh-50 border-fresh-500 text-fresh-950 ring-1 ring-fresh-400'
                                  : isUserWrongOption
                                    ? 'bg-coral-50 border-coral-400 text-coral-950'
                                    : 'bg-white border-slate-200 text-slate-600 opacity-80'
                              }`}
                            >
                              {/* Status Tag Row (Only rendered on Correct or Wrong option so text never collides!) */}
                              {(isCorrectOption || isUserWrongOption) && (
                                <div className="flex items-center justify-between gap-2">
                                  {isCorrectOption && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-fresh-600 text-white text-[11px] font-extrabold">
                                      ✓ {isUserSelected ? 'Bạn chọn đúng' : 'Đáp án đúng'}
                                    </span>
                                  )}
                                  {isUserWrongOption && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-coral-600 text-white text-[11px] font-extrabold">
                                      ✗ Bạn đã chọn (Sai)
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-start gap-2.5">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                                  isCorrectOption
                                    ? 'bg-fresh-600 text-white'
                                    : isUserWrongOption
                                      ? 'bg-coral-600 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {optKey}
                                </span>
                                <span className={`leading-relaxed break-words ${isCorrectOption ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                                  {optText}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4C. Gap-Fill Answers Comparison (Only for Reading Part 5 & Listening Part 2) */}
                  {!q.isMultipleChoiceOrMatching && !hasOptionImages && (
                    <div className={`grid gap-2.5 text-sm ${isMobileMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      <div className={`p-3 rounded-xl border ${
                        isCorrect
                          ? 'bg-fresh-50 border-fresh-300'
                          : isUnanswered
                            ? 'bg-amber-50 border-amber-300'
                            : 'bg-coral-50 border-coral-300'
                      }`}>
                        <span className="text-[11px] text-slate-600 block font-bold uppercase mb-0.5">
                          Câu trả lời của bạn:
                        </span>
                        <span className={`text-base font-extrabold break-words ${
                          isCorrect ? 'text-fresh-800' : isUnanswered ? 'text-amber-800' : 'text-coral-700'
                        }`}>
                          {isCorrect ? '✓ ' : isUnanswered ? '⚠️ ' : '✗ '}
                          {isUnanswered ? '(Bỏ trống)' : q.userAnswer}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl border bg-fresh-50 border-fresh-400">
                        <span className="text-[11px] text-fresh-800 block font-bold uppercase mb-0.5">
                          Đáp án đúng:
                        </span>
                        <span className="text-base font-extrabold text-fresh-900 break-words">
                          ✓ {q.correctAnswer}
                        </span>
                        {q.acceptedAnswers && q.acceptedAnswers.length > 1 && (
                          <span className="block text-xs text-fresh-800 font-medium mt-0.5">
                            (Chấp nhận: {q.acceptedAnswers.join(' / ')})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 5A. Cloze Sentence Context (Reading Part 4 & Part 5 — Clean, Spacious, Zero Overlap) */}
                  {q.clozeContext && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="text-[11px] font-extrabold text-brand-700 uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Câu chứa chỗ trống ({q.questionNumber}) trong đoạn văn:</span>
                      </div>
                      <p className="text-sm sm:text-base text-slate-800 leading-[2.1] font-medium break-words">
                        <span>{q.clozeContext.beforeGap} </span>
                        <span className={`inline-block px-2 py-0.5 mx-0.5 rounded-md font-extrabold text-xs sm:text-sm align-baseline border ${
                          isCorrect
                            ? 'bg-fresh-100 border-fresh-400 text-fresh-900'
                            : 'bg-fresh-100 border-fresh-500 text-fresh-900'
                        }`}>
                          ({q.questionNumber}) {q.correctOptionText || q.correctAnswer}
                        </span>
                        <span> {q.clozeContext.afterGap}</span>
                      </p>
                    </div>
                  )}

                  {/* 5B. Listening Part 2 Gap-fill Form Line Context */}
                  {!q.isMultipleChoiceOrMatching && !q.clozeContext && (q.label || q.prefix || q.suffix) && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-[11px] font-extrabold text-audio-700 uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Vị trí điền trên phiếu {q.formTitle ? `(${q.formTitle})` : ''}:</span>
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed font-semibold">
                        {q.label && <span className="text-slate-600">{q.label}: </span>}
                        {q.prefix && <span>{q.prefix} </span>}
                        <span className="inline-block px-2 py-0.5 rounded-md bg-fresh-100 border border-fresh-400 text-fresh-900 font-extrabold">
                          {q.correctAnswer}
                        </span>
                        {q.suffix && <span> {q.suffix}</span>}
                      </p>
                    </div>
                  )}

                  {/* 6. Error Diagnosis & Evidence Block (Avoid repeating clozeContext) */}
                  {((!isCorrect && q.errorAnalysis) || (!q.clozeContext && q.evidenceQuote) || q.explanation) && (
                    <div className={`rounded-xl p-3.5 border space-y-2 text-xs sm:text-sm ${
                      !isCorrect
                        ? 'bg-coral-50/50 border-coral-200'
                        : 'bg-brand-50/50 border-brand-200'
                    }`}>
                      {!isCorrect && q.errorAnalysis && (
                        <div className="text-coral-900 leading-relaxed font-medium">
                          <strong className="font-extrabold text-coral-800">🔎 Chỉ ra lỗi sai: </strong>
                          {q.errorAnalysis}
                        </div>
                      )}

                      {!q.clozeContext && q.evidenceQuote && (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 space-y-1">
                          <div className="font-extrabold text-brand-700 flex items-center gap-1.5 text-[11px] uppercase">
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span>Dẫn chứng trong bài:</span>
                          </div>
                          <blockquote className="italic text-slate-900 font-medium border-l-4 border-fresh-500 pl-3 py-0.5 leading-relaxed">
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

                  {/* 7. Audioscript collapsible (auto-expanded for wrong Listening questions) */}
                  {q.transcript && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => toggleTranscript(q.questionNumber)}
                        aria-expanded={isExpanded}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-audio-700 hover:text-audio-800 cursor-pointer rounded-lg px-2.5 py-1.5 bg-audio-50 border border-audio-200"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Ẩn lời thoại (Audioscript)' : 'Xem lời thoại (Audioscript)'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-3.5 bg-audio-50/70 rounded-xl border border-audio-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-vietnam max-h-64 overflow-y-auto">
                          <div className="text-[11px] font-extrabold uppercase text-audio-800 mb-1">
                            🎧 Lời thoại gốc trong băng nghe:
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
