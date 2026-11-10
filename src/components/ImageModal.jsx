import React, { useEffect } from 'react'
import { X, ZoomIn } from 'lucide-react'

export default function ImageModal({ src, alt, onClose }) {
  // Listen for Escape key
  useEffect(() => {
    if (!src) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [src, onClose])

  if (!src) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh phóng to"
    >
      <div 
        className="relative max-w-3xl max-h-[90vh] bg-white rounded-3xl p-4 shadow-2xl flex flex-col items-center border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition-transform hover:scale-105 cursor-pointer"
          aria-label="Đóng xem ảnh (Esc)"
          title="Đóng xem ảnh (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <img
          src={src}
          alt={alt || 'Enlarged view'}
          className="max-h-[80vh] w-auto object-contain rounded-2xl"
        />

        {alt && (
          <div className="mt-2 text-xs font-semibold text-slate-600 text-center">
            {alt}
          </div>
        )}
      </div>
    </div>
  )
}
