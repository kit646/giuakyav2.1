import React, { useState, useEffect } from 'react'
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowLeft, Headphones, BookOpen, Sparkles, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function ResultView({
  result,
  test,
  paperKey,
  onRetakeTest,
  onNavigateHome
}) {
  const [filter, setFilter] = useState('all') // 'all' | 'wrong'
  const [expandedTranscripts, setExpandedTranscripts] = useState({})

  // Trigger celebration confetti on high score
  useEffect(() => {
    if (result && result.cambridgeScore >= 120) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        })
      } catch (e) {}
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
  const filteredQuestions = filter === 'wrong'
    ? questionDetails.filter(q => !q.isCorrect)
    : questionDetails

  const toggleTranscript = (qNum) => {
    setExpandedTranscripts(prev => ({
      ...prev,
      [qNum]: !prev[qNum]
    }))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Quay về trang chủ"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>

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

      {/* Main Score Celebration Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-card text-center space-y-6">
        
        {/* Badge & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Award className="w-4 h-4 text-sunny-500" />
            <span>Kết Quả Bài Thi Cambridge A2 Key</span>
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
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto pt-4 border-t border-slate-100">
          <div className="bg-fresh-50 border border-fresh-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-fresh-700 font-semibold">Số câu đúng</div>
            <div className="text-xl sm:text-2xl font-bold font-lexend text-fresh-700 mt-0.5">
              {correctCount}
            </div>
          </div>

          <div className="bg-coral-50 border border-coral-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-coral-700 font-semibold">Số câu sai</div>
            <div className="text-xl sm:text-2xl font-bold font-lexend text-coral-700 mt-0.5">
              {wrongCount}
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-brand-700 font-semibold">Tỉ lệ đúng</div>
            <div className="text-xl sm:text-2xl font-bold font-lexend text-brand-700 mt-0.5">
              {percentage}%
            </div>
          </div>
        </div>

      </div>

      {/* Part Breakdown Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Kết quả chi tiết theo từng Part
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {partBreakdown.map((pb) => (
            <div
              key={pb.partNumber}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Part {pb.partNumber}</span>
                <span className="text-brand-600">{pb.correct}/{pb.total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all duration-500"
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Đối chiếu đáp án & Giải thích chi tiết
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Xem lại các câu hỏi kèm audioscript dẫn chứng và lưu ý từ KEY.pdf
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold" role="tablist" aria-label="Lọc câu hỏi xem lại">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400 ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Tất cả ({questionDetails.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'wrong'}
              onClick={() => setFilter('wrong')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-coral-400 ${
                filter === 'wrong' ? 'bg-white text-coral-600 shadow-sm' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Chỉ câu sai ({wrongCount})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isCorrect = q.isCorrect
            const isExpanded = expandedTranscripts[q.questionNumber]

            return (
              <div
                key={q.questionNumber}
                className={`rounded-2xl border p-5 bg-white shadow-card transition-all ${
                  isCorrect ? 'border-fresh-200' : 'border-coral-200 ring-1 ring-coral-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-lexend ${
                      isCorrect ? 'bg-fresh-100 text-fresh-800' : 'bg-coral-100 text-coral-800'
                    }`}>
                      {q.questionNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      Part {q.partNumber}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isCorrect ? 'bg-fresh-50 text-fresh-700' : 'bg-coral-50 text-coral-700'
                  }`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                        <span>Chính xác</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-coral-600" />
                        <span>Chưa đúng</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Prompt */}
                <div className="text-base font-semibold text-slate-900 mb-3">
                  {q.prompt}
                </div>

                {/* Answers Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-600 block font-medium">Câu trả lời của bạn:</span>
                    <span className={`font-bold ${isCorrect ? 'text-fresh-700' : 'text-coral-700'}`}>
                      {q.userAnswer ? String(q.userAnswer).toUpperCase() : '(Bỏ trống)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-600 block font-medium">Đáp án chuẩn từ KEY.pdf:</span>
                    <span className="font-bold text-brand-700">
                      {q.correctAnswer}
                    </span>
                  </div>
                </div>

                {/* Note / Explanation if present */}
                {q.explanation && (
                  <div className="mt-3 text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
                    💡 <strong>Ghi chú đáp án:</strong> {q.explanation}
                  </div>
                )}

                {/* Audioscript collapsible (for Listening) */}
                {q.transcript && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => toggleTranscript(q.questionNumber)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Ẩn audioscript" : "Xem audioscript"}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-audio-700 hover:text-audio-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-audio-500 rounded p-1"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Ẩn lời thoại (Audioscript)' : 'Xem lời thoại (Audioscript)'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 bg-audio-50/60 rounded-xl border border-audio-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-vietnam">
                        {q.transcript}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )
          })}
        </div>

      </div>

    </div>
  )
}
