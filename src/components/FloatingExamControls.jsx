import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  BookOpen,
  Headphones,
  LayoutGrid,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'

const AUTO_HIDE_MS = 2500
const MIN_SCROLL_Y = 200

/**
 * Flush smart top sub-header: docks right beneath Navbar (matching Navbar's
 * full-width desktop layout or Mobile's max-w-lg container with zero overflow)
 * when scrolling up slightly mid-test, and auto-hides after 2.5s or downward scroll.
 */
export default function FloatingExamControls({
  variant = 'reading', // 'reading' | 'listening'
  parts = [],
  activePartIndex = 0,
  onSelectPart,
  answers = {},
  answeredCount = 0,
  totalQuestions = 0,
  hasOtherPaper = false,
  otherPaperKey = '',
  onSwitchPaper,
  onOpenMatrix,
  onResetPaper,
  hasProgressToReset = false,
  onSubmit,
  reviewMode = false,
  onBackToResult,
  onRetakeTest,
  isMobileMode = false,
}) {
  const [visible, setVisible] = useState(false)
  const lastScrollYRef = useRef(0)
  const hideTimerRef = useRef(null)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleHide = useCallback(() => {
    clearHideTimer()
    hideTimerRef.current = setTimeout(() => {
      setVisible(false)
    }, AUTO_HIDE_MS)
  }, [clearHideTimer])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    lastScrollYRef.current = window.scrollY || 0

    const handleScroll = () => {
      const currentY = window.scrollY || 0
      const delta = currentY - lastScrollYRef.current
      lastScrollYRef.current = currentY

      if (currentY < MIN_SCROLL_Y) {
        clearHideTimer()
        setVisible(false)
        return
      }

      if (delta < -6) {
        setVisible(true)
        scheduleHide()
      } else if (delta > 12) {
        clearHideTimer()
        setVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearHideTimer()
    }
  }, [clearHideTimer, scheduleHide])

  const handleActiveBump = () => {
    if (visible) {
      scheduleHide()
    }
  }

  const handlePickPart = (idx) => {
    if (onSelectPart) {
      onSelectPart(idx)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    clearHideTimer()
    setVisible(false)
  }

  const isListening = variant === 'listening'
  const activePartStyle = isListening
    ? 'bg-audio-600 text-white shadow-sm'
    : 'bg-brand-600 text-white shadow-sm'
  const countColor = isListening ? 'text-audio-700' : 'text-brand-600'
  const actionLabelClass = isMobileMode ? 'sr-only' : 'hidden xl:inline'

  const partTabsNode = (
    <div
      className={`flex items-center overflow-x-auto max-w-full ${
        isMobileMode ? 'gap-1 w-full order-3 pt-0.5' : 'gap-1 order-2'
      }`}
      role="tablist"
      aria-label="Chuyển nhanh giữa các Part"
    >
      {parts.map((p, idx) => {
        const isSelected = activePartIndex === idx
        const partQuestions = p.questions || []
        const partAnswered = partQuestions.filter((q) => {
          const val = answers[q.question_number || q.number]
          return val !== undefined && String(val).trim() !== ''
        }).length
        const isDone = partQuestions.length > 0 && partAnswered === partQuestions.length

        return (
          <button
            key={p.part}
            type="button"
            role="tab"
            tabIndex={visible ? 0 : -1}
            aria-selected={isSelected}
            onClick={() => handlePickPart(idx)}
            className={`px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
              isSelected
                ? activePartStyle
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
  )

  const innerContent = (
    <div
      className={`flex flex-wrap items-center justify-between w-full ${
        isMobileMode ? 'gap-1.5' : 'gap-2'
      }`}
    >
      {/* Skill Switcher & Progress */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 order-1">
        {hasOtherPaper && onSwitchPaper && (
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] sm:text-xs font-bold shrink-0">
            {isListening ? (
              <>
                <button
                  type="button"
                  tabIndex={visible ? 0 : -1}
                  onClick={() => onSwitchPaper(otherPaperKey)}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-600" />
                  <span>{isMobileMode ? 'Đọc' : 'Sang Reading'}</span>
                </button>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-audio-600 text-white flex items-center gap-1">
                  <Headphones className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{isMobileMode ? 'Nghe' : 'Listening'}</span>
                </span>
              </>
            ) : (
              <>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-brand-600 text-white flex items-center gap-1">
                  <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{isMobileMode ? 'Đọc' : 'Reading'}</span>
                </span>
                <button
                  type="button"
                  tabIndex={visible ? 0 : -1}
                  onClick={() => onSwitchPaper(otherPaperKey)}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Headphones className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-audio-600" />
                  <span>{isMobileMode ? 'Nghe' : 'Sang Listening'}</span>
                </button>
              </>
            )}
          </div>
        )}

        <span className="text-[11px] sm:text-xs text-slate-600 font-semibold whitespace-nowrap">
          <strong className={countColor}>{answeredCount}/{totalQuestions}</strong>
          {!isMobileMode && ' câu'}
        </span>
      </div>

      {/* Part Tabs (inline middle on Desktop, second row on Mobile) */}
      {partTabsNode}

      {/* Quick Action Buttons */}
      <div className={`flex items-center gap-1 sm:gap-1.5 shrink-0 ${isMobileMode ? 'order-2' : 'order-3'}`}>
        {onOpenMatrix && (
          <button
            type="button"
            tabIndex={visible ? 0 : -1}
            onClick={onOpenMatrix}
            className="p-1.5 sm:px-2 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Mở bảng câu hỏi"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
            <span className={actionLabelClass}>Bảng câu hỏi</span>
          </button>
        )}

        {reviewMode ? (
          <>
            {onBackToResult && (
              <button
                type="button"
                tabIndex={visible ? 0 : -1}
                onClick={onBackToResult}
                className="px-2 sm:px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] sm:text-xs rounded-lg sm:rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isMobileMode ? 'Bảng điểm' : 'Về bảng điểm'}</span>
              </button>
            )}
            {onRetakeTest && (
              <button
                type="button"
                tabIndex={visible ? 0 : -1}
                onClick={onRetakeTest}
                title="Làm lại đề"
                className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                  isListening
                    ? 'bg-audio-50 hover:bg-audio-100 text-audio-700 border-audio-200'
                    : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border-brand-200'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className={actionLabelClass}>Làm lại đề</span>
              </button>
            )}
          </>
        ) : (
          <>
            {onResetPaper && (
              <button
                type="button"
                tabIndex={visible ? 0 : -1}
                onClick={onResetPaper}
                disabled={!hasProgressToReset}
                title={hasProgressToReset ? 'Làm lại tất cả câu hỏi' : 'Chưa có câu nào để hoàn tác'}
                className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold border flex items-center gap-1 transition-colors ${
                  hasProgressToReset
                    ? 'bg-coral-50 hover:bg-coral-100 text-coral-700 border-coral-200 cursor-pointer'
                    : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className={actionLabelClass}>Làm lại tất cả</span>
              </button>
            )}

            {onSubmit && (
              <button
                type="button"
                tabIndex={visible ? 0 : -1}
                onClick={onSubmit}
                className="px-2 sm:px-3 py-1.5 bg-fresh-600 hover:bg-fresh-700 text-white font-bold text-[11px] sm:text-xs rounded-lg sm:rounded-xl shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Nộp bài</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )

  return (
    <div
      aria-hidden={!visible}
      onPointerDown={handleActiveBump}
      onMouseMove={handleActiveBump}
      onFocusCapture={handleActiveBump}
      style={{ marginTop: 0 }}
      className={`fixed inset-x-0 !mt-0 z-[35] transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none print:hidden ${
        isMobileMode ? 'top-14' : 'top-16'
      } ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
    >
      <div className={isMobileMode ? 'w-full max-w-lg mx-auto px-3' : 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        <div
          className={`w-full bg-white/95 backdrop-blur-md border-x border-b border-slate-200 shadow-floating rounded-b-2xl overflow-hidden ${
            isMobileMode ? 'px-2.5 py-2' : 'px-4 py-2'
          }`}
        >
          {innerContent}
        </div>
      </div>
    </div>
  )
}
