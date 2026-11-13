import React, { useState, useRef } from 'react'
import { BookOpen, Headphones, Award, Clock, ArrowRight, Play, CheckCircle2, RotateCcw, Sparkles, Flame, Check, Globe, Smartphone, Monitor, QrCode } from 'lucide-react'
import MobileAccessModal from './MobileAccessModal'
import { useGSAP, animateEntrance, animateStaggerCards } from '../utils/motion'

export default function Dashboard({
  tests = [],
  sampleTest = null,
  progress = {},
  stats = {},
  onStartTest,
  isMobileMode = false,
  onToggleViewMode
}) {
  const [filter, setFilter] = useState('all') // 'all' | 'official' | 'online' | 'reading' | 'listening'
  const [showMobileModal, setShowMobileModal] = useState(false)
  const scopeRef = useRef(null)

  // Hero entrance animation on initial mount
  useGSAP(
    () => {
      animateEntrance(scopeRef.current, '.gsap-hero', { y: 16, duration: 0.42 })
    },
    { scope: scopeRef }
  )

  // Fast, capped stagger reveal when test cards render or filter changes
  useGSAP(
    () => {
      animateStaggerCards(scopeRef.current, '.gsap-test-card', {
        y: 18,
        duration: 0.36,
        maxTotalStagger: 0.32,
      })
    },
    { scope: scopeRef, dependencies: [filter, isMobileMode], revertOnUpdate: true }
  )

  // Separate official tests and online practice tests
  const officialTests = [
    ...(sampleTest ? [{ ...sampleTest, isSample: true }] : []),
    ...tests.filter(t => !t.isOnline)
  ]
  const onlineTests = tests.filter(t => t.isOnline)

  // Filtered list
  let displayItems = []
  if (filter === 'all') {
    displayItems = [
      ...(sampleTest ? [{ ...sampleTest, isSample: true }] : []),
      ...tests
    ]
  } else if (filter === 'official') {
    displayItems = officialTests
  } else if (filter === 'online') {
    displayItems = onlineTests
  } else if (filter === 'reading') {
    displayItems = [
      ...(sampleTest ? [{ ...sampleTest, isSample: true }] : []),
      ...tests
    ].filter(t => t.papers?.reading_and_writing || t.papers?.reading)
  } else if (filter === 'listening') {
    displayItems = [
      ...(sampleTest ? [{ ...sampleTest, isSample: true }] : []),
      ...tests
    ].filter(t => t.papers?.listening)
  }

  const getTestStats = (testId, paperKey) => {
    return progress[`${testId}_${paperKey}`] || null
  }

  return (
    <div ref={scopeRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Banner */}
      <div className="gsap-hero relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 text-white p-6 sm:p-10 shadow-xl shadow-brand-500/10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs sm:text-sm font-semibold border border-white/20">
            <Sparkles className="w-4 h-4 text-sunny-400" />
            <span>Cambridge A2 Key for Schools (KET) • 25 Bộ Đề Toàn Diện</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Kho Đề Thi Cambridge A2 Key Chuẩn Quốc Tế
          </h1>

          <p className="text-slate-100 text-sm sm:text-base leading-relaxed">
            Học tập nhẹ nhàng với <strong>8 đề thi thật</strong> từ <em>Ready for A2 Key for Schools</em> + <strong>Đề mẫu giữa kỳ</strong> + <strong>16 đề luyện thêm online</strong> (9 đề Listening & 7 đề Reading/Use of English). Tích hợp 100% audio MP3 bản xứ, hỗ trợ song ngữ Việt – Anh và tự động chấm điểm theo thang Cambridge 100–150.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/15">
              <Flame className="w-5 h-5 text-sunny-400 fill-sunny-400" />
              <div className="text-left">
                <div className="text-xs text-slate-200">Chuỗi học tập</div>
                <div className="text-sm font-bold">{stats?.streakDays || 3} ngày liên tiếp</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/15">
              <Award className="w-5 h-5 text-fresh-400" />
              <div className="text-left">
                <div className="text-xs text-slate-200">Điểm trung bình</div>
                <div className="text-sm font-bold">{stats?.averageScore ? `${stats.averageScore}/150` : 'Chưa có bài thi'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/15">
              <CheckCircle2 className="w-5 h-5 text-sunny-400" />
              <div className="text-left">
                <div className="text-xs text-slate-200">Kho bài thi</div>
                <div className="text-sm font-bold">{tests.length + (sampleTest ? 1 : 0)} bộ đề sẵn sàng</div>
              </div>
            </div>

            {/* Mobile Mode Switch or QR Access Trigger Button */}
            {isMobileMode ? (
              <button
                type="button"
                onClick={onToggleViewMode}
                className="flex items-center gap-2.5 bg-white/20 hover:bg-white/30 active:scale-95 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/30 transition-all cursor-pointer text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                title="Bấm để chuyển sang giao diện máy tính"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Monitor className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs text-slate-200">Đang ở chế độ ĐT</div>
                  <div className="text-sm font-bold flex items-center gap-1.5 text-white">
                    <span>Đổi sang Máy tính 💻</span>
                  </div>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowMobileModal(true)}
                className="flex items-center gap-2.5 bg-white/15 hover:bg-white/25 active:scale-95 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/25 transition-all cursor-pointer text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                title="Quét mã QR để mở làm bài trên điện thoại hoặc máy tính bảng"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs text-slate-200">Làm trên điện thoại</div>
                  <div className="text-sm font-bold flex items-center gap-1.5 text-white">
                    <span>Quét mã QR</span>
                    <QrCode className="w-3.5 h-3.5 text-sunny-300" />
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background circles */}
        <div className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-40 -top-20 w-64 h-64 rounded-full bg-sunny-400/10 pointer-events-none" />
      </div>

      {/* Filter Tabs & Section Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {filter === 'online' ? 'Bộ Đề Luyện Thêm (Online Practice - 16 Đề)' : 
             filter === 'official' ? 'Bộ Đề Chính Thức (Ready for A2 Key & Mẫu)' :
             'Danh Sách Đề Thi Cambridge A2 Key'}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5 font-medium">
            Đang hiển thị {displayItems.length} đề thi phù hợp với bộ lọc
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold" role="tablist" aria-label="Bộ lọc danh sách đề thi">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              filter === 'all'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Tất cả ({tests.length + (sampleTest ? 1 : 0)})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'official'}
            onClick={() => setFilter('official')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              filter === 'official'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Đề Sách Gốc ({officialTests.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'online'}
            onClick={() => setFilter('online')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              filter === 'online'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-brand-700 bg-brand-50 hover:bg-brand-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Bộ Luyện Thêm ({onlineTests.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'listening'}
            onClick={() => setFilter('listening')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500 ${
              filter === 'listening'
                ? 'bg-white text-audio-700 shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Listening
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'reading'}
            onClick={() => setFilter('reading')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              filter === 'reading'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Reading
          </button>
        </div>
      </div>

      {/* Grid of Test Cards */}
      <div className={isMobileMode ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
        {displayItems.map((item) => {
          const testId = item.test_id
          const hasReading = !!(item.papers?.reading_and_writing || item.papers?.reading)
          const hasListening = !!(item.papers?.listening)
          const readingPaperKey = item.papers?.reading ? 'reading' : 'reading_and_writing'

          const readingStats = getTestStats(testId, readingPaperKey)
          const listeningStats = getTestStats(testId, 'listening')

          return (
            <div
              key={testId}
              className={`gsap-test-card rounded-2xl border bg-white p-6 shadow-card hover:shadow-card-hover transition-[box-shadow,border-color] duration-200 flex flex-col justify-between ${
                item.isSample 
                  ? 'border-sunny-300 ring-2 ring-sunny-400/20' 
                  : item.isOnline
                  ? 'border-indigo-200/80 hover:border-indigo-400'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    item.isSample 
                      ? 'bg-sunny-100 text-sunny-800' 
                      : item.isOnline
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                      : 'bg-brand-50 text-brand-700'
                  }`}>
                    {item.isSample 
                      ? 'Mid-Course Sample Test' 
                      : item.isOnline
                      ? `Online Practice • ${item.paper_type === 'listening' ? 'Listening' : 'Reading'}`
                      : `Test ${item.test_number}`}
                  </span>

                  <span className="text-xs text-slate-500 font-semibold">
                    {item.isSample ? 'Đề Mẫu Giữa Kỳ' : item.isOnline ? 'EnglishPracticeTest' : 'Ready for A2 Key'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  {item.title}
                </h3>

                {/* Description / Parts Info */}
                <div className="space-y-2 mb-6">
                  {/* Reading Info (if test has reading) */}
                  {hasReading && (
                    <div className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-brand-600" />
                        <span className="font-semibold">Reading & Writing</span>
                      </div>
                      {readingStats ? (
                        <span className="font-bold text-fresh-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {readingStats.cambridgeScore}/150
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">Chưa làm</span>
                      )}
                    </div>
                  )}

                  {/* Listening Info (if test has listening) */}
                  {hasListening && (
                    <div className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-audio-600" />
                        <span className="font-semibold">Listening (5 Tracks Audio)</span>
                      </div>
                      {listeningStats ? (
                        <span className="font-bold text-fresh-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {listeningStats.cambridgeScore}/150
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">Chưa làm</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {/* PRACTICE MODE BUTTONS */}
                {hasReading && hasListening ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onStartTest(item, readingPaperKey, 'study')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs sm:text-sm border border-brand-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
                      title={`Luyện đọc Reading cho đề ${item.title}`}
                      aria-label={`Luyện đọc Reading cho đề ${item.title}`}
                    >
                      <BookOpen className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="truncate">Luyện Đọc</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartTest(item, 'listening', 'study')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-audio-50 hover:bg-audio-100 text-audio-700 font-bold text-xs sm:text-sm border border-audio-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500 shadow-2xs"
                      title={`Luyện nghe Listening cho đề ${item.title}`}
                      aria-label={`Luyện nghe Listening cho đề ${item.title}`}
                    >
                      <Headphones className="w-4 h-4 text-audio-600 shrink-0" />
                      <span className="truncate">Luyện Nghe</span>
                    </button>
                  </div>
                ) : hasReading ? (
                  <button
                    type="button"
                    onClick={() => onStartTest(item, readingPaperKey, 'study')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-sm border border-brand-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
                    aria-label={`Luyện đọc Reading cho đề ${item.title}`}
                  >
                    <BookOpen className="w-4 h-4 text-brand-600" />
                    <span>Luyện Đọc Reading</span>
                  </button>
                ) : hasListening ? (
                  <button
                    type="button"
                    onClick={() => onStartTest(item, 'listening', 'study')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-audio-50 hover:bg-audio-100 text-audio-700 font-bold text-sm border border-audio-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500"
                    aria-label={`Luyện nghe Listening cho đề ${item.title}`}
                  >
                    <Headphones className="w-4 h-4 text-audio-600" />
                    <span>Luyện Nghe Listening (Audio)</span>
                  </button>
                ) : null}

                {/* EXAM MODE (THI THỰC TẾ CÓ TÍNH GIỜ) BUTTONS */}
                {hasReading && hasListening ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onStartTest(item, readingPaperKey, 'exam')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      title={`Thi thử tính giờ phần Đọc & Viết (60 phút)`}
                      aria-label={`Thi thử tính giờ phần Đọc cho đề ${item.title}`}
                    >
                      <Clock className="w-3.5 h-3.5 text-sunny-400 shrink-0" />
                      <span className="truncate">Thi Đọc (60p)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartTest(item, 'listening', 'exam')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-audio-500"
                      title={`Thi thử tính giờ phần Nghe (30 phút)`}
                      aria-label={`Thi thử tính giờ phần Nghe cho đề ${item.title}`}
                    >
                      <Clock className="w-3.5 h-3.5 text-audio-400 shrink-0" />
                      <span className="truncate">Thi Nghe (30p)</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartTest(item, hasListening ? 'listening' : readingPaperKey, 'exam')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-700"
                    aria-label={`Bắt đầu thi thử tính giờ cho đề ${item.title}`}
                  >
                    <Clock className="w-4 h-4 text-sunny-400" />
                    <span>Thi Thử Tính Giờ ({hasListening ? 'Listening 30p' : 'Reading 60p'})</span>
                  </button>
                )}
              </div>

            </div>
          )
        })}
      </div>

      {/* Mobile Access Modal */}
      <MobileAccessModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
      />

    </div>
  )
}
