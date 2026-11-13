import React, { useEffect } from 'react'
import { X, CheckCircle2, Flag, Circle, ArrowRight } from 'lucide-react'

export default function QuestionMatrixModal({
  isOpen,
  onClose,
  parts = [],
  answers = {},
  flagged = {},
  onSelectQuestion,
  onSubmit
}) {
  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Flatten questions list
  const allQuestions = []
  parts.forEach((p) => {
    if (p.questions && p.questions.length > 0) {
      p.questions.forEach((q) => {
        const num = q.question_number || q.number
        allQuestions.push({
          number: num,
          partNumber: p.part,
          partTitle: p.title
        })
      })
    } else if (p.answers_only) {
      Object.keys(p.answers_only).forEach((k) => {
        allQuestions.push({
          number: parseInt(k),
          partNumber: p.part,
          partTitle: p.title
        })
      })
    }
  })

  const total = allQuestions.length
  const answeredCount = allQuestions.filter(q => answers[q.number] !== undefined && String(answers[q.number]).trim() !== '').length
  const flaggedCount = allQuestions.filter(q => flagged[q.number]).length
  const remainingCount = total - answeredCount

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="matrix-modal-title"
    >
      <div 
        className="relative max-w-xl w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 id="matrix-modal-title" className="text-lg font-bold text-slate-900 font-lexend">
              Bảng Danh Sách Câu Hỏi
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Đã làm <strong className="text-brand-600">{answeredCount}/{total}</strong> câu • Còn <strong className="text-coral-600">{remainingCount}</strong> câu chưa trả lời
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng bảng câu hỏi (Esc)"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 py-3 text-xs font-semibold text-slate-700 bg-slate-50 px-4 rounded-xl my-4 border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-brand-600 shadow-xs" />
            <span>Đã làm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-sunny-400 border border-sunny-500 shadow-xs" />
            <span>Đã ghim xem lại</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 shadow-xs" />
            <span>Chưa làm</span>
          </div>
        </div>

        {/* Matrix Grid grouped by Part */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto space-y-4 pr-1">
          {parts.map((p) => {
            const partQuestions = allQuestions.filter(q => q.partNumber === p.part)
            if (partQuestions.length === 0) return null

            return (
              <div key={p.part} className="space-y-2">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Part {p.part}: {p.title || ''}
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
                  {partQuestions.map((q) => {
                    const num = q.number
                    const isAnswered = answers[num] !== undefined && String(answers[num]).trim() !== ''
                    const isFlagged = flagged[num]

                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          onSelectQuestion(p.part - 1, num)
                          onClose()
                        }}
                        aria-label={`Câu hỏi ${num}: ${isAnswered ? 'Đã làm' : 'Chưa làm'}${isFlagged ? ', đã ghim' : ''}`}
                        className={`relative h-11 rounded-xl font-bold font-lexend text-sm transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                          isFlagged
                            ? 'bg-sunny-100 text-sunny-900 border-2 border-sunny-400 shadow-sm'
                            : isAnswered
                            ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-700'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span>{num}</span>
                        {isFlagged && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sunny-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
          >
            Đóng bảng
          </button>

          {onSubmit && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onSubmit()
              }}
              className="px-5 py-2.5 bg-fresh-600 hover:bg-fresh-700 text-white font-bold text-sm rounded-xl shadow-md shadow-fresh-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Nộp bài & Chấm điểm</span>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
