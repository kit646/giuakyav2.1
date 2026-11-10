import React, { useState } from 'react'
import { GraduationCap, Flame, Award, Languages, ArrowLeft, Smartphone, Monitor, QrCode } from 'lucide-react'
import MobileAccessModal from './MobileAccessModal'

export default function Navbar({
  currentView,
  onNavigateHome,
  bilingualMode,
  onToggleBilingual,
  stats,
  activeTestTitle,
  activePaperName,
  examMode,
  isMobileMode,
  onToggleViewMode
}) {
  const isTakingTest = currentView === 'reading' || currentView === 'listening'
  const [showMobileModal, setShowMobileModal] = useState(false)

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all ${
        isMobileMode ? 'h-14 px-3' : 'h-16 px-4 sm:px-6 lg:px-8'
      }`}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand or Back Button */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isTakingTest && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Quay về danh sách đề thi"
                aria-label="Quay về danh sách đề thi"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Trang chủ</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-2 text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-xl p-1 min-w-0"
              aria-label="Về trang chủ A2 Key Master"
            >
              <div className={`${isMobileMode ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} bg-brand-600 text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                <GraduationCap className={isMobileMode ? 'w-5 h-5' : 'w-6 h-6'} />
              </div>
              <div className="min-w-0">
                <div className={`font-lexend font-bold leading-tight text-slate-900 group-hover:text-brand-600 transition-colors truncate ${
                  isMobileMode ? 'text-sm max-w-[120px] sm:max-w-xs' : 'text-lg'
                }`}>
                  {isTakingTest && activeTestTitle ? activeTestTitle : 'A2 Key Master'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">
                  {isTakingTest && activePaperName ? (
                    <span className="text-brand-600 font-semibold">{activePaperName}</span>
                  ) : (
                    'Luyện Thi A2.1'
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Center / Right: Mode Tag & View Switch & Bilingual Switch & Stats */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Exam Mode Tag */}
            {isTakingTest && (
              <div className={`px-2 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 shrink-0 ${
                examMode === 'exam' 
                  ? 'bg-sunny-100 text-sunny-800 border border-sunny-300' 
                  : 'bg-brand-50 text-brand-700 border border-brand-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${examMode === 'exam' ? 'bg-sunny-500 animate-pulse' : 'bg-brand-500'}`} />
                <span className="hidden md:inline">{examMode === 'exam' ? 'Thi Thử (Tính giờ)' : 'Luyện Tập Tự Do'}</span>
              </div>
            )}

            {/* BUTTON 1: Switch between Desktop Mode and Mobile Mode */}
            <button
              type="button"
              onClick={onToggleViewMode}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                isMobileMode
                  ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
              title={isMobileMode ? "Đang ở chế độ Điện thoại (Bấm để chuyển sang Máy tính)" : "Đang ở chế độ Máy tính (Bấm để chuyển sang Điện thoại)"}
              aria-label="Chuyển đổi giao diện máy tính và điện thoại"
            >
              {isMobileMode ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-white" />
                  <span>ĐT</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Máy tính</span>
                  <span className="sm:hidden">PC</span>
                </>
              )}
            </button>

            {/* Bilingual Toggle Button */}
            <button
              type="button"
              onClick={onToggleBilingual}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                bilingualMode 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
              title="Bật/Tắt hiển thị lời giải nghĩa tiếng Việt"
              aria-pressed={bilingualMode}
              aria-label={`Chế độ song ngữ: ${bilingualMode ? 'BẬT' : 'TẮT'}`}
            >
              <Languages className={`w-3.5 h-3.5 ${bilingualMode ? 'text-emerald-600' : 'text-slate-600'}`} />
              <span className="hidden md:inline">Song ngữ:</span>
              <span className="font-bold">{bilingualMode ? 'VI' : 'EN'}</span>
            </button>

            {/* Mobile / Tablet QR Access Button (Only visible on Desktop Mode) */}
            {!isMobileMode && (
              <button
                type="button"
                onClick={() => setShowMobileModal(true)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
                title="Mở luyện thi trên điện thoại hoặc máy tính bảng (Quét mã QR)"
                aria-label="Mở luyện thi trên điện thoại"
              >
                <Smartphone className="w-4 h-4 text-brand-600" />
                <span>Mở trên ĐT</span>
                <QrCode className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}

            {/* Streak Badge (hidden on mobile) */}
            {!isMobileMode && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-sunny-50 text-sunny-800 border border-sunny-200 rounded-xl text-xs font-semibold">
                <Flame className="w-4 h-4 text-sunny-500 fill-sunny-500" />
                <span>{stats?.streakDays || 3} ngày</span>
              </div>
            )}

            {/* Cambridge Average Score Badge (hidden on mobile) */}
            {!isMobileMode && stats?.totalTestsCompleted > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-800 border border-brand-200 rounded-xl text-xs font-medium">
                <Award className="w-4 h-4 text-brand-600" />
                <span>ĐTB: <strong className="font-bold">{stats.averageScore}/150</strong></span>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Access QR Modal */}
      <MobileAccessModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
      />
    </>
  )
}
