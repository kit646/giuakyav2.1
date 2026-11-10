import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { Smartphone, QrCode, Copy, Check, X, Wifi, ExternalLink, HelpCircle } from 'lucide-react'

export default function MobileAccessModal({ isOpen, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [mobileUrl, setMobileUrl] = useState('')

  useEffect(() => {
    if (!isOpen) return

    // Determine the phone-accessible LAN URL
    let url = 'http://192.168.0.4:5173/giuakyav2.1/'
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const port = window.location.port || '5173'
      const pathname = window.location.pathname.startsWith('/giuakyav2.1') 
        ? window.location.pathname 
        : '/giuakyav2.1/'

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        url = `http://192.168.0.4:${port}${pathname}`
      } else {
        url = `${window.location.protocol}//${hostname}:${port}${pathname}`
      }
    }
    setMobileUrl(url)

    // Generate offline QR Code using the qrcode library
    QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => {
        console.error('Lỗi tạo mã QR:', err)
        // Fallback to online generator if needed
        setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`)
      })
  }, [isOpen])

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mobileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback copy
      const textArea = document.createElement('textarea')
      textArea.value = mobileUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 overflow-hidden space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 shadow-sm">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Truy Cập Trên Điện Thoại & Máy Tính Bảng
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Luyện thi song song tiện lợi mọi lúc mọi nơi trong nhà
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code and Instructions */}
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
          {/* QR Code Frame */}
          <div className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl shadow-sm border border-slate-200 shrink-0">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Mã QR mở trên điện thoại" 
                className="w-44 h-44 rounded-lg object-contain"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-xs font-mono">
                Đang tạo QR...
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-2">
              <QrCode className="w-3.5 h-3.5 text-brand-600" />
              <span>Quét bằng Camera / Zalo</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
              <div>
                <strong className="text-slate-900 font-semibold flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 inline" /> Kết nối cùng Wi-Fi
                </strong>
                <p className="text-slate-500 mt-0.5">
                  Điện thoại và máy tính cần kết nối chung mạng Wi-Fi nhà bạn (tắt 4G/5G khi kết nối).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
              <div>
                <strong className="text-slate-900 font-semibold">Quét mã QR</strong>
                <p className="text-slate-500 mt-0.5">
                  Mở ứng dụng <strong>Camera</strong> (trên iPhone) hoặc <strong>Quét mã QR trong Zalo / Google Lens</strong> (trên Android).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
              <div>
                <strong className="text-slate-900 font-semibold">Bắt đầu học ngay</strong>
                <p className="text-slate-500 mt-0.5">
                  Giao diện tối ưu chuẩn cảm ứng cho điện thoại: nghe audio, chọn đáp án trơn tru.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Link Copy Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Hoặc nhập trực tiếp địa chỉ vào trình duyệt Safari / Chrome trên điện thoại:</span>
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={mobileUrl} 
              className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Firewall / Troubleshooting Notice */}
        <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-amber-50/80 border border-amber-200/80 rounded-xl p-3">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Nếu điện thoại không kết nối được:</strong> Kiểm tra xem trên máy tính bảng thông báo <em>"Windows Defender Firewall"</em> có đang chặn Node.js hay không, hãy chọn <em>"Allow access / Cho phép truy cập"</em>; và đảm bảo điện thoại không bật VPN.
          </p>
        </div>

        {/* Footer Close */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Đã hiểu, đóng lại
          </button>
        </div>
      </div>
    </div>
  )
}
