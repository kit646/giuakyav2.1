import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Headphones } from 'lucide-react'

export default function AudioPlayer({ audioTrack, partTitle, testTitle }) {
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

  // Change speed (0.8x, 1.0x, 1.2x)
  const changeSpeed = (rate) => {
    if (!audioRef.current) return
    audioRef.current.playbackRate = rate
    setPlaybackRate(rate)
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
    if (audioRef.current) {
      audioRef.current.volume = val
      audioRef.current.muted = false
    }
    setVolume(val)
    setIsMuted(false)
  }

  // Timeline slider
  const handleSeek = (e) => {
    const val = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = val
      setCurrentTime(val)
    }
  }

  // Format mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Global spacebar keyboard shortcut for Audio Play/Pause (when not typing in an input)
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
    <div className="sticky top-16 z-30 bg-audio-50/95 backdrop-blur-md border-b border-audio-200 px-4 py-3 shadow-md shadow-audio-500/5 transition-all">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
      />

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
          {/* Skip -5s */}
          <button
            type="button"
            onClick={() => skip(-5)}
            className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:text-audio-600 hover:bg-audio-100 border border-slate-200 flex items-center justify-center shadow-sm transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-audio-500"
            title="Tua lại 5 giây"
            aria-label="Tua lại 5 giây"
          >
            <RotateCcw className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
            <span className="sr-only">Lùi 5s</span>
          </button>

          {/* Large Play/Pause Button (56px w-14 h-14) */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-14 h-14 rounded-2xl bg-audio-600 hover:bg-audio-700 text-white flex items-center justify-center shadow-lg shadow-audio-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500 focus:ring-offset-2"
            title={isPlaying ? "Tạm dừng (Space)" : "Phát âm thanh (Space)"}
            aria-label={isPlaying ? "Tạm dừng audio (phím Space)" : "Phát audio (phím Space)"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            )}
          </button>

          {/* Skip +5s */}
          <button
            type="button"
            onClick={() => skip(5)}
            className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:text-audio-600 hover:bg-audio-100 border border-slate-200 flex items-center justify-center shadow-sm transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-audio-500"
            title="Tua tới 5 giây"
            aria-label="Tua tới 5 giây"
          >
            <RotateCw className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="sr-only">Tiến 5s</span>
          </button>

          {/* Timeline and Times */}
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
              aria-valuemin={0}
              aria-valuemax={Math.round(duration || 100)}
              aria-valuenow={Math.round(currentTime)}
              aria-valuetext={`${formatTime(currentTime)} trên ${formatTime(duration)}`}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-audio-600 focus:outline-none focus:ring-2 focus:ring-audio-500"
            />
            <span className="text-xs font-mono font-semibold text-slate-600 w-11">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Speed & Volume */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          {/* Speed Selector */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-0.5 text-xs font-semibold shadow-xs">
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => changeSpeed(rate)}
                aria-pressed={playbackRate === rate}
                aria-label={`Tốc độ phát ${rate}x`}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-audio-500 ${
                  playbackRate === rate
                    ? 'bg-audio-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 text-slate-600 hover:text-audio-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-audio-500 rounded-lg"
              title={isMuted ? "Bật âm thanh" : "Tắt âm"}
              aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              aria-pressed={isMuted}
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
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round((isMuted ? 0 : volume) * 100)}
              className="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-audio-600 hidden sm:inline-block focus:outline-none focus:ring-1 focus:ring-audio-500"
            />
          </div>
        </div>

      </div>
    </div>
  )
}
