import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Headphones } from 'lucide-react'

export default function AudioPlayer({ audioTrack, partTitle, testTitle, isMobileMode = false }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [volume, setVolume] = useState(0.9)
  const [isMuted, setIsMuted] = useState(false)

  // Construct audio source path
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  const rawPath = audioTrack?.relative_path || (audioTrack?.file_name ? `audio/${audioTrack.file_name}` : '')
  const clean = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath
  const audioSrc = clean ? `${base}${clean}` : ''

  // When track changes, reset and load
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
      audioRef.current.load()
    }
  }, [audioSrc])

  // Play / Pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.error('Audio play failed:', err)
      })
    }
  }

  // Skip ±5 seconds
  const skip = (seconds) => {
    if (!audioRef.current) return
    const nextTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration || 1000)
    audioRef.current.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  // Change speed
  const changeSpeed = (rate) => {
    if (!audioRef.current) return
    audioRef.current.playbackRate = rate
    setPlaybackRate(rate)
  }

  // Cycle speed for compact mobile
  const cycleSpeed = () => {
    const rates = [1.0, 1.2, 0.8]
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length
    changeSpeed(rates[nextIdx])
  }

  // Volume & Mute
  const toggleMute = () => {
    if (!audioRef.current) return
    const nextMuted = !isMuted
    audioRef.current.muted = nextMuted
    setIsMuted(nextMuted)
  }

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (audioRef.current) {
      audioRef.current.volume = val
      audioRef.current.muted = val === 0
      setIsMuted(val === 0)
    }
  }

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value)
    setCurrentTime(val)
    if (audioRef.current) {
      audioRef.current.currentTime = val
    }
  }

  // Format mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Spacebar hotkey
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        togglePlay()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying])

  return (
    <div className={`sticky ${isMobileMode ? 'top-14 z-30 px-3 py-2' : 'top-16 z-30 px-4 py-3'} bg-audio-50/98 backdrop-blur-md border-b border-audio-200 shadow-md shadow-audio-500/5 transition-all`}>
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* MOBILE COMPACT LAYOUT (Single Row, Height ~48px) */}
      {isMobileMode ? (
        <div className="max-w-md mx-auto flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-audio-600 hover:bg-audio-700 active:scale-95 text-white flex items-center justify-center shrink-0 shadow-sm shadow-audio-600/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500"
            title={isPlaying ? "Tạm dừng" : "Phát audio"}
            aria-label={isPlaying ? "Tạm dừng" : "Phát audio"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>

          {/* Skip Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => skip(-5)}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center active:bg-slate-100 cursor-pointer"
              title="Lùi 5s"
              aria-label="Lùi 5 giây"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => skip(5)}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center active:bg-slate-100 cursor-pointer"
              title="Tiến 5s"
              aria-label="Tiến 5 giây"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeline and Track Info */}
          <div className="flex-1 min-w-0 px-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span className="truncate max-w-[120px]">{partTitle || 'Audio Track'}</span>
              <span className="font-mono text-slate-600 text-[10px] shrink-0 ml-1">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Tiến độ phát audio"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-audio-600 block mt-1"
            />
          </div>

          {/* Speed & Mute */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={cycleSpeed}
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-audio-700 active:bg-audio-50 cursor-pointer"
              title="Chạm để đổi tốc độ phát"
            >
              {playbackRate}x
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 text-slate-600 hover:text-audio-600 cursor-pointer"
              aria-label={isMuted ? "Bật âm" : "Tắt âm"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-audio-600" />}
            </button>
          </div>
        </div>
      ) : (
        /* DESKTOP SPATIOUS LAYOUT */
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Track Title Info */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-audio-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-audio-200 text-audio-800">
                  Track {audioTrack?.track_number || ''}
                </span>
                <span className="font-lexend font-bold text-slate-900 text-sm truncate">
                  {partTitle || 'Listening Track'}
                </span>
              </div>
              <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                {audioTrack?.file_name || 'A2 Key Audio'} • Bấm <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-xs">Space</kbd> để dừng/phát
              </p>
            </div>
          </div>

          {/* Center: Controls (Skip -5s, Play/Pause, Skip +5s, Timeline) */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-center flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => skip(-5)}
              className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:text-audio-600 hover:bg-audio-100 border border-slate-200 flex items-center justify-center shadow-sm transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-audio-500"
              title="Tua lại 5 giây"
              aria-label="Tua lại 5 giây"
            >
              <RotateCcw className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="w-14 h-14 rounded-2xl bg-audio-600 hover:bg-audio-700 text-white flex items-center justify-center shadow-lg shadow-audio-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500 focus:ring-offset-2"
              title={isPlaying ? "Tạm dừng (Space)" : "Phát âm thanh (Space)"}
              aria-label={isPlaying ? "Tạm dừng audio (Space)" : "Phát audio (Space)"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 fill-white ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => skip(5)}
              className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:text-audio-600 hover:bg-audio-100 border border-slate-200 flex items-center justify-center shadow-sm transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-audio-500"
              title="Tua tới 5 giây"
              aria-label="Tua tới 5 giây"
            >
              <RotateCw className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>

            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-600 w-11 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                aria-label="Tiến độ phát audio"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-audio-600 focus:outline-none focus:ring-2 focus:ring-audio-500"
              />
              <span className="text-xs font-mono font-semibold text-slate-600 w-11">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Speed & Volume */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center bg-white rounded-xl border border-slate-200 p-0.5 text-xs font-semibold shadow-xs">
              {[0.8, 1.0, 1.2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => changeSpeed(rate)}
                  aria-pressed={playbackRate === rate}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    playbackRate === rate
                      ? 'bg-audio-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 text-slate-600 hover:text-audio-600 cursor-pointer"
                title={isMuted ? "Bật âm thanh" : "Tắt âm"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Âm lượng audio"
                className="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-audio-600 hidden sm:inline-block"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
