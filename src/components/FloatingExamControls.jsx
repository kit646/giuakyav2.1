import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  BookOpen,
  Headphones,
  LayoutGrid,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'

const AUTO_HIDE_MS = 4500
const MIN_SCROLL_Y = 220

/**
 * Smart floating exam dock: reveals smoothly when the user scrolls up slightly
 * mid-test and auto-hides after a few seconds (or on downward scroll), allowing
 * quick Part switching, paper switching, reset, or submit without scrolling all the way up.
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
  const isInteractingRef = useRef(false)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleHide = useCallback(() => {
    clearHideTimer()
    if (isInteractingRef.current) return
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

      // Reveal when scrolling up slightly (> 6px) past the top control bar
      if (delta < -6) {
        setVisible(true)
        scheduleHide()
      } else if (delta > 16 && !isInteractingRef.current) {
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

  const handleInteractionStart = () => {
    isInteractingRef.current = true
    clearHideTimer()
  }

  const handleInteractionEnd = () => {
    isInteractingRef.current = false
    if (visible) scheduleHide()
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

  return (
    <div
      aria-hidden={!visible}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onFocusCapture={handleInteractionStart}
      onBlurCapture={handleInteractionEnd}
      className={`fixed z-40 transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none print:hidden ${
        isMobileMode
          ? 'inset-x-3 bottom-16'
          : 'bottom-16 lg:bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-3xl'
      } ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-floating rounded-2xl p-2.5 sm:p-3 space-y-2">
        {/* Top Row: Skill switcher, progress, and quick actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {hasOtherPaper && onSwitchPaper && (
              <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] sm:text-xs font-bold">
                {isListening ? (
                  <>
                    <button
                      type="button"
                      tabIndex={visible ? 0 : -1}
                      onClick={() => onSwitchPaper(otherPaperKey)}
                      className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                      <span>Sang Reading</span>
                    </button>
                    <span className="px-2 py-1 rounded-lg bg-audio-600 text-white flex items-center gap-1">
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Listening</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-1 rounded-lg bg-brand-600 text-white flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Reading</span>
                    </span>
                    <button
                      type="button"
                      tabIndex={visible ? 0 : -1}
                      onClick={() => onSwitchPaper(otherPaperKey)}
                      className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Headphones className="w-3.5 h-3.5 text-audio-600" />
                      <span>Sang Listening</span>
                    </button>
                  </>
                )}
              </div>
            )}

            <span className="text-xs text-slate-600 font-medium px-1">
              Đã làm <strong className={countColor}>{answeredCount}/{totalQuestions}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {onOpenMatrix && (
              <button
                type="button"
                tabIndex={visible ? 0 : -1}
                onClick={onOpenMatrix}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Mở bảng câu hỏi"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Bảng câu hỏi</span>
              </button>
            )}

            {reviewMode ? (
              <>
                {onBackToResult && (
                  <button
                    type="button"
                    tabIndex={visible ? 0 : -1}
                    onClick={onBackToResult}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Về bảng điểm</span>
                  </button>
                )}
                {onRetakeTest && (
                  <button
                    type="button"
                    tabIndex={visible ? 0 : -1}
                    onClick={onRetakeTest}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                      isListening
                        ? 'bg-audio-50 hover:bg-audio-100 text-audio-700 border-audio-200'
                        : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border-brand-200'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm lại đề</span>
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
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition-colors ${
                      hasProgressToReset
                        ? 'bg-coral-50 hover:bg-coral-100 text-coral-700 border-coral-200 cursor-pointer'
                        : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Làm lại tất cả</span>
                  </button>
                )}

                {onSubmit && (
                  <button
                    type="button"
                    tabIndex={visible ? 0 : -1}
                    onClick={onSubmit}
                    className="px-3 py-1.5 bg-fresh-600 hover:bg-fresh-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Nộp bài</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Row: Part Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" role="tablist" aria-label="Chuyển nhanh giữa các Part">
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
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
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
      </div>
    </div>
  )
}
