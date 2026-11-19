import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Cloud,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Trash2,
  KeyRound,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import {
  GITHUB_TOKEN_CREATE_URL,
  getSyncConfig,
  saveSyncConfig,
  clearSyncConfig,
  exportAllStorageData,
  syncWithGitHubGist,
} from '../services/storage'

const formatSyncTime = (isoString) => {
  if (!isoString) return 'Chưa đồng bộ lần nào'
  try {
    const date = new Date(isoString)
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch (e) {
    return isoString
  }
}

const countSnapshotMetrics = (snapshot) => {
  const answersMap = snapshot?.answers || {}
  const activeDraftCount = Object.values(answersMap).filter((paperAnswers) =>
    Object.values(paperAnswers || {}).some((v) => v !== undefined && String(v).trim() !== '')
  ).length
  const completedCount = Object.keys(snapshot?.results || {}).length
  const streakDays = snapshot?.stats?.streakDays || 3
  return { activeDraftCount, completedCount, streakDays }
}

export default function GitHubSyncModal({
  isOpen,
  onClose,
  syncStatus,
  onSyncComplete,
  onConfigChange,
}) {
  const [config, setConfig] = useState(() => getSyncConfig())
  const [tokenInput, setTokenInput] = useState(() => getSyncConfig().token || '')
  const [gistIdInput, setGistIdInput] = useState(() => getSyncConfig().gistId || '')
  const [showToken, setShowToken] = useState(false)
  const [showGuide, setShowGuide] = useState(() => !getSyncConfig().token)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [busyMode, setBusyMode] = useState('') // '' | 'merge' | 'push' | 'pull'
  const [feedback, setFeedback] = useState(null) // { type: 'success' | 'error', message: string }
  const [metricsTick, setMetricsTick] = useState(0)

  // Refresh state from localStorage whenever modal opens
  useEffect(() => {
    if (!isOpen) return
    const latest = getSyncConfig()
    setConfig(latest)
    setTokenInput(latest.token || '')
    setGistIdInput(latest.gistId || '')
    setShowGuide(!latest.token)
    setFeedback(syncStatus?.error ? { type: 'error', message: syncStatus.error } : null)
    setMetricsTick((t) => t + 1)
  }, [isOpen])

  // Keep synced if background sync finished while modal is open
  useEffect(() => {
    if (!isOpen) return
    const latest = getSyncConfig()
    setConfig(latest)
    if (latest.gistId && !gistIdInput) {
      setGistIdInput(latest.gistId)
    }
    setMetricsTick((t) => t + 1)
  }, [isOpen, syncStatus?.syncing])

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !busyMode) {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, busyMode, onClose])

  const localMetrics = useMemo(() => {
    void metricsTick
    return countSnapshotMetrics(exportAllStorageData())
  }, [metricsTick])

  if (!isOpen) return null

  const cleanToken = tokenInput.trim()
  const isConnected = Boolean(config.token && config.githubUser)

  const handleToggleAutoSync = () => {
    const nextVal = !config.autoSync
    const nextConfig = saveSyncConfig({ autoSync: nextVal })
    setConfig(nextConfig)
    onConfigChange?.(nextConfig)
  }

  const handleRunSync = async (mode) => {
    if (!cleanToken) {
      setFeedback({
        type: 'error',
        message: 'Vui lòng dán GitHub Personal Access Token (dạng ghp_...) trước khi đồng bộ.',
      })
      return
    }

    setBusyMode(mode)
    setFeedback(null)
    try {
      const result = await syncWithGitHubGist({
        mode,
        tokenOverride: cleanToken,
        gistIdOverride: showAdvanced ? gistIdInput.trim() : undefined,
      })

      setConfig(result.config)
      setGistIdInput(result.gistId || '')
      setShowGuide(false)
      setMetricsTick((t) => t + 1)

      const m = countSnapshotMetrics(result.snapshot)
      const statusTextMap = {
        created: `Đã kết nối @${result.config.githubUser} và tạo bản sao lưu mới trên Cloud! (${m.activeDraftCount} bài đang làm, ${m.completedCount} bài đã chấm điểm)`,
        merged: `Đồng bộ 2 chiều thành công với @${result.config.githubUser}! Hiện có ${m.activeDraftCount} bài đang làm và ${m.completedCount} bài đã chấm điểm.`,
        pushed: `Đã đẩy toàn bộ dữ liệu máy này lên Cloud (@${result.config.githubUser}) thành công!`,
        pulled: `Đã tải dữ liệu từ Cloud về máy này thành công! (${m.activeDraftCount} bài đang làm, ${m.completedCount} bài đã chấm điểm)`,
      }

      setFeedback({
        type: 'success',
        message: statusTextMap[result.status] || 'Đồng bộ thành công!',
      })

      onConfigChange?.(result.config)
      onSyncComplete?.(result)
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Đồng bộ thất bại. Vui lòng kiểm tra lại Token và kết nối mạng.',
      })
    } finally {
      setBusyMode('')
    }
  }

  const handleDisconnect = () => {
    clearSyncConfig()
    const reset = getSyncConfig()
    setConfig(reset)
    setTokenInput('')
    setGistIdInput('')
    setShowGuide(true)
    setFeedback({
      type: 'success',
      message: 'Đã xóa GitHub Token khỏi thiết bị này. Dữ liệu học tập trên máy vẫn được giữ nguyên.',
    })
    onConfigChange?.(reset)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={() => !busyMode && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-sync-modal-title"
    >
      <div
        className="relative max-w-lg w-full bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => !busyMode && onClose()}
          disabled={Boolean(busyMode)}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Đóng cửa sổ đồng bộ"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center shrink-0">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2
              id="github-sync-modal-title"
              className="text-lg font-bold text-slate-900 font-lexend leading-tight"
            >
              Đồng Bộ Laptop ↔ Điện Thoại
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Lưu bài đang làm, câu đã ghim &amp; bảng điểm qua GitHub Secret Gist riêng tư của bạn.
            </p>
          </div>
        </div>

        {/* Connected Account Card */}
        {isConnected && (
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {config.githubAvatar ? (
                <img
                  src={config.githubAvatar}
                  alt={config.githubUser}
                  className="w-9 h-9 rounded-xl border border-emerald-300 shrink-0 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {config.githubUser?.slice(0, 1)?.toUpperCase() || 'G'}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-emerald-900 truncate">
                    @{config.githubUser}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    Đã kết nối
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5 truncate">
                  Lần cuối: {formatSyncTime(config.lastSyncedAt)}
                </div>
                {config.gistId && (
                  <a
                    href={`https://gist.github.com/${config.gistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 hover:underline mt-0.5"
                  >
                    <span>Gist: {config.gistId.slice(0, 10)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleDisconnect}
              disabled={Boolean(busyMode)}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-coral-50 text-coral-700 border border-coral-200 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
              title="Ngắt kết nối GitHub Token trên thiết bị này"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ngắt kết nối</span>
            </button>
          </div>
        )}

        {/* Current Local Data Preview */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-base font-bold text-slate-900 font-lexend">
              {localMetrics.activeDraftCount}
            </div>
            <div className="text-[11px] text-slate-600 font-medium">Bài đang làm</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-base font-bold text-brand-700 font-lexend">
              {localMetrics.completedCount}
            </div>
            <div className="text-[11px] text-slate-600 font-medium">Bài đã chấm điểm</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-base font-bold text-sunny-700 font-lexend">
              {localMetrics.streakDays} ngày
            </div>
            <div className="text-[11px] text-slate-600 font-medium">Chuỗi học tập</div>
          </div>
        </div>

        {/* Collapsible 1-Click Setup Guide */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowGuide((v) => !v)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-brand-600" />
              <span>Hướng dẫn lấy GitHub Token (chỉ mất 20 giây)</span>
            </span>
            {showGuide ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showGuide && (
            <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 space-y-2.5 border-t border-slate-200/80">
              <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                <li>
                  Bấm nút tạo nhanh bên dưới — quyền <code className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[11px] text-slate-800">gist</code> đã được chọn sẵn.
                </li>
                <li>
                  Cuộn xuống cuối trang GitHub, bấm <strong>Generate token</strong> và sao chép mã{' '}
                  <code className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[11px] text-slate-800">ghp_...</code>.
                </li>
                <li>
                  Dán cùng mã Token này vào cả <strong>Laptop</strong> và <strong>Điện thoại</strong> để tự động đồng bộ.
                </li>
              </ol>

              <a
                href={GITHUB_TOKEN_CREATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-sunny-400" />
                <span>Tạo GitHub Token nhanh (1-Click)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          )}
        </div>

        {/* Token Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="github-sync-token-input"
            className="block text-xs font-bold text-slate-700"
          >
            GitHub Personal Access Token (quyền <code className="font-mono text-brand-700">gist</code>)
          </label>
          <div className="relative">
            <input
              id="github-sync-token-input"
              type={showToken ? 'text' : 'password'}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Dán mã ghp_... vào đây"
              autoComplete="off"
              spellCheck={false}
              className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-xs sm:text-sm font-mono text-slate-900 bg-white"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              title={showToken ? 'Ẩn Token' : 'Hiện Token'}
              aria-label={showToken ? 'Ẩn Token' : 'Hiện Token'}
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Token chỉ lưu trong bộ nhớ trình duyệt trên thiết bị này, không gửi qua server trung gian nào.
          </p>
        </div>

        {/* Advanced Gist ID Override (Collapsed by default) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Tùy chọn nâng cao: Nhập Gist ID thủ công (mặc định tự động tìm)</span>
          </button>

          {showAdvanced && (
            <div className="mt-2">
              <label
                htmlFor="github-sync-gist-id-input"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                Gist ID (Để trống để app tự tìm file a2-key-master-sync.json)
              </label>
              <input
                id="github-sync-gist-id-input"
                type="text"
                value={gistIdInput}
                onChange={(e) => setGistIdInput(e.target.value)}
                placeholder="Ví dụ: a1b2c3d4e5f6..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-xs font-mono text-slate-800"
              />
            </div>
          )}
        </div>

        {/* Auto-sync toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="pr-3">
            <div className="text-xs font-bold text-slate-800">Tự động đồng bộ ngầm</div>
            <div className="text-[11px] text-slate-500">
              Tự cập nhật khi mở trang, chuyển tab hoặc sau khi làm câu hỏi.
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(config.autoSync)}
            onClick={handleToggleAutoSync}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              config.autoSync ? 'bg-brand-600' : 'bg-slate-300'
            }`}
            title="Bật/Tắt tự động đồng bộ ngầm"
          >
            <span className="sr-only">Tự động đồng bộ ngầm</span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                config.autoSync ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl text-xs font-medium flex items-start gap-2.5 border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-coral-50 text-coral-900 border-coral-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-coral-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{feedback.message}</span>
          </div>
        )}

        {/* Sync Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleRunSync('merge')}
            disabled={Boolean(busyMode)}
            className="w-full py-3 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${busyMode === 'merge' ? 'animate-spin' : ''}`} />
            <span>
              {busyMode === 'merge'
                ? 'Đang đồng bộ 2 chiều...'
                : isConnected
                  ? 'Đồng bộ 2 chiều ngay (Gộp thông minh)'
                  : 'Lưu Token & Đồng bộ 2 chiều (Khuyên dùng)'}
            </span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleRunSync('push')}
              disabled={Boolean(busyMode)}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              title="Ghi đè dữ liệu trên Cloud bằng toàn bộ dữ liệu hiện tại của thiết bị này"
            >
              <UploadCloud className={`w-4 h-4 text-brand-600 ${busyMode === 'push' ? 'animate-pulse' : ''}`} />
              <span>{busyMode === 'push' ? 'Đang đẩy lên...' : 'Đẩy máy này lên Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRunSync('pull')}
              disabled={Boolean(busyMode)}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              title="Tải dữ liệu từ Cloud về và thay thế dữ liệu hiện tại trên thiết bị này"
            >
              <DownloadCloud className={`w-4 h-4 text-emerald-600 ${busyMode === 'pull' ? 'animate-pulse' : ''}`} />
              <span>{busyMode === 'pull' ? 'Đang tải về...' : 'Tải từ Cloud về máy này'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
