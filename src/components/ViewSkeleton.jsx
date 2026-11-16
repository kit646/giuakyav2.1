import React from 'react'

/**
 * Lightweight loading skeleton matching the current Slate + Brand card style
 * while lazy-loaded exam/result views download.
 */
export default function ViewSkeleton({ isMobileMode = false, currentView = 'reading' }) {
  const isResult = currentView === 'result'
  const containerClass = isMobileMode
    ? 'w-full px-3 py-4 space-y-4 animate-pulse'
    : isResult
      ? 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse'
      : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse'

  return (
    <div className={containerClass} role="status" aria-label="Đang tải nội dung...">
      {/* Top header / score skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-card space-y-3">
        <div className="h-5 w-48 bg-slate-200 rounded-lg" />
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-20 bg-slate-100 rounded-xl" />
          <div className="h-8 w-20 bg-slate-100 rounded-xl" />
          <div className="h-8 w-20 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* Main cards skeleton */}
      <div className={currentView === 'reading' && !isMobileMode ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : 'space-y-4'}>
        {currentView === 'reading' && !isMobileMode && (
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-3 h-72">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-3.5 w-full bg-slate-100 rounded" />
            <div className="h-3.5 w-11/12 bg-slate-100 rounded" />
            <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
            <div className="h-3.5 w-4/5 bg-slate-100 rounded" />
          </div>
        )}

        <div className={currentView === 'reading' && !isMobileMode ? 'lg:col-span-6 space-y-4' : 'space-y-4'}>
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-card space-y-3"
            >
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
              <div className="grid grid-cols-1 gap-2 pt-1">
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
