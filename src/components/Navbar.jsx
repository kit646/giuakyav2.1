import React from 'react'
import { GraduationCap, Flame, Award, BookOpen, Volume2, Languages, ArrowLeft } from 'lucide-react'

export default function Navbar({
  currentView,
  onNavigateHome,
  bilingualMode,
  onToggleBilingual,
  stats,
  activeTestTitle,
  activePaperName,
  examMode
}) {
  const isTakingTest = currentView === 'reading' || currentView === 'listening'

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand or Back Button */}
        <div className="flex items-center gap-3">
          {isTakingTest && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-xl transition-colors cursor-pointer"
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
            className="flex items-center gap-2.5 text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-xl p-1"
            aria-label="Về trang chủ A2 Key Master"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-lexend font-bold text-lg leading-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                A2 Key Master
              </div>
              <div className="text-xs text-slate-600 font-medium">
                {isTakingTest && activeTestTitle ? (
                  <span className="text-brand-600 font-semibold">{activeTestTitle} • {activePaperName}</span>
                ) : (
                  'Luyện Thi Tiếng Anh A2.1'
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Center / Right: Mode Tag & Bilingual Switch & Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Exam Mode Tag */}
          {isTakingTest && (
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              examMode === 'exam' 
                ? 'bg-sunny-100 text-sunny-800 border border-sunny-300' 
                : 'bg-brand-50 text-brand-700 border border-brand-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${examMode === 'exam' ? 'bg-sunny-500 animate-pulse' : 'bg-brand-500'}`} />
              {examMode === 'exam' ? 'Thi Thử (Tính giờ)' : 'Luyện Tập Tự Do'}
            </div>
          )}

          {/* Bilingual Toggle Button */}
          <button
            type="button"
            onClick={onToggleBilingual}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              bilingualMode 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm' 
                : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
            }`}
            title="Bật/Tắt hiển thị lời giải nghĩa tiếng Việt"
            aria-pressed={bilingualMode}
            aria-label={`Chế độ song ngữ tiếng Việt: ${bilingualMode ? 'Đang Bật' : 'Đang Tắt'}`}
          >
            <Languages className={`w-4 h-4 ${bilingualMode ? 'text-emerald-600' : 'text-slate-600'}`} />
            <span className="hidden md:inline">Song ngữ VI:</span>
            <span className="font-bold">{bilingualMode ? 'BẬT' : 'TẮT'}</span>
          </button>

          {/* Streak Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-sunny-50 text-sunny-800 border border-sunny-200 rounded-xl text-sm font-semibold">
            <Flame className="w-4 h-4 text-sunny-500 fill-sunny-500" />
            <span>{stats?.streakDays || 3} ngày</span>
          </div>

          {/* Cambridge Average Score Badge */}
          {stats?.totalTestsCompleted > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-800 border border-brand-200 rounded-xl text-sm font-medium">
              <Award className="w-4 h-4 text-brand-600" />
              <span>ĐTB: <strong className="font-bold">{stats.averageScore}/150</strong></span>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
