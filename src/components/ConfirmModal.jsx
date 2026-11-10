import React, { useEffect } from 'react'
import { AlertTriangle, AlertCircle, X, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'warning', // 'warning' | 'danger' | 'info'
  icon = null
}) {
  // Listen for Escape key to close
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

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-coral-100 text-coral-600',
          btnBg: 'bg-coral-600 hover:bg-coral-700 text-white shadow-coral-600/20',
          border: 'border-coral-200'
        }
      case 'info':
        return {
          iconBg: 'bg-brand-100 text-brand-600',
          btnBg: 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20',
          border: 'border-brand-200'
        }
      case 'warning':
      default:
        return {
          iconBg: 'bg-sunny-100 text-sunny-700',
          btnBg: 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20',
          border: 'border-sunny-200'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Đóng hộp thoại"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${styles.iconBg}`}>
            {icon || <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="min-w-0 pr-6">
            <h3 id="confirm-modal-title" className="text-lg font-bold text-slate-900 font-lexend leading-tight">
              {title}
            </h3>
            <div className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${styles.btnBg}`}
          >
            <span>{confirmText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
