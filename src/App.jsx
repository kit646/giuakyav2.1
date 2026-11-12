import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import ReadingView from './components/ReadingView'
import ListeningView from './components/ListeningView'
import ResultView from './components/ResultView'
import ConfirmModal from './components/ConfirmModal'
import { loadMasterData, gradePaper } from './services/dataService'
import {
  getSettings,
  saveSettings,
  getSavedAnswers,
  saveAnswer as persistAnswer,
  clearAnswers as persistClearAnswers,
  getFlaggedQuestions,
  toggleFlagQuestion as persistToggleFlag,
  saveResult as persistResult,
  getResult as fetchResult,
  getAllTestProgress,
  getGlobalStats
} from './services/storage'
import { Loader2, AlertCircle, HelpCircle, Smartphone, Monitor } from 'lucide-react'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [masterData, setMasterData] = useState(null)
  
  // App views: 'dashboard' | 'reading' | 'listening' | 'result'
  const [currentView, setCurrentView] = useState('dashboard')
  const [activeTest, setActiveTest] = useState(null)
  const [activePaperKey, setActivePaperKey] = useState('')
  const [examMode, setExamMode] = useState('study') // 'study' | 'exam'
  
  // Test in-progress state
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentResult, setCurrentResult] = useState(null)

  // Confirmation Modals
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)
  const [unansweredQuestions, setUnansweredQuestions] = useState([])
  const [exitExamConfirmOpen, setExitExamConfirmOpen] = useState(false)

  // Settings & user stats
  const [bilingualMode, setBilingualMode] = useState(true)
  const [stats, setStats] = useState(getGlobalStats())
  const [progress, setProgress] = useState({})

  // View Mode: 'desktop' | 'mobile' (Auto-detected or user toggled)
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('a2_view_mode')
    if (saved === 'mobile' || saved === 'desktop') return saved
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'
  })
  const isMobileMode = viewMode === 'mobile'

  const handleToggleViewMode = () => {
    setViewMode((prev) => {
      const next = prev === 'mobile' ? 'desktop' : 'mobile'
      localStorage.setItem('a2_view_mode', next)
      return next
    })
  }

  // 1. Initial Load of tests data and localStorage settings
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const data = await loadMasterData()
        setMasterData(data)
        
        const settings = getSettings()
        setBilingualMode(settings.bilingual !== false)
        
        setProgress(getAllTestProgress())
        setStats(getGlobalStats())
      } catch (err) {
        console.error('Failed to init app:', err)
        setError('Không thể tải dữ liệu đề thi. Vui lòng kiểm tra lại file /extracted_data/all_tests.json.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // 2. Countdown timer for Exam Mode
  useEffect(() => {
    let timerId = null
    if (examMode === 'exam' && (currentView === 'reading' || currentView === 'listening')) {
      if (timeLeft > 0) {
        timerId = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerId)
              handleSubmitTest()
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    }
    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [examMode, currentView, timeLeft])

  // Start a test (reading or listening)
  const handleStartTest = (test, paperKey, mode = 'study') => {
    setActiveTest(test)
    setActivePaperKey(paperKey)
    setExamMode(mode)

    // Load saved answers for this test if available
    const saved = getSavedAnswers(test.test_id, paperKey)
    setAnswers(saved)
    setFlagged(getFlaggedQuestions(test.test_id, paperKey))

    // Set timer based on paper and mode
    if (mode === 'exam') {
      const isListening = paperKey === 'listening'
      setTimeLeft(isListening ? 30 * 60 : 45 * 60)
    } else {
      setTimeLeft(0)
    }

    if (paperKey === 'listening') {
      setCurrentView('listening')
    } else {
      setCurrentView('reading')
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Switch between papers of the active test (e.g. Reading <-> Listening)
  const handleSwitchPaper = (newPaperKey) => {
    if (!activeTest || !newPaperKey || newPaperKey === activePaperKey) return
    handleStartTest(activeTest, newPaperKey, examMode)
  }

  // Handle student selecting or typing an answer
  const handleAnswer = (qNum, val) => {
    setAnswers((prev) => {
      const next = { ...prev, [qNum]: val }
      if (activeTest && activePaperKey) {
        persistAnswer(activeTest.test_id, activePaperKey, qNum, val)
      }
      return next
    })
  }

  // Toggle flag on a question
  const handleToggleFlag = (qNum) => {
    setFlagged((prev) => {
      const next = { ...prev, [qNum]: !prev[qNum] }
      if (activeTest && activePaperKey) {
        persistToggleFlag(activeTest.test_id, activePaperKey, qNum)
      }
      return next
    })
  }

  // Request test submission (checks for unanswered questions)
  const handleRequestSubmit = () => {
    if (!activeTest || !activePaperKey) return
    const paper = activeTest.papers[activePaperKey]
    if (!paper || !paper.parts) {
      handleSubmitTest()
      return
    }

    const missing = []
    paper.parts.forEach((p) => {
      if (p.questions && p.questions.length > 0) {
        p.questions.forEach((q) => {
          const num = q.question_number || q.number
          const val = answers[num]
          if (val === undefined || String(val).trim() === '') {
            missing.push(num)
          }
        })
      } else if (p.answers_only) {
        Object.keys(p.answers_only).forEach((k) => {
          const num = parseInt(k)
          const val = answers[num]
          if (val === undefined || String(val).trim() === '') {
            missing.push(num)
          }
        })
      }
    })

    if (missing.length > 0) {
      setUnansweredQuestions(missing)
      setSubmitConfirmOpen(true)
    } else {
      handleSubmitTest()
    }
  }

  // Submit and grade the test
  const handleSubmitTest = () => {
    if (!activeTest || !activePaperKey) return
    const paper = activeTest.papers[activePaperKey]
    if (!paper) return

    const result = gradePaper(paper, answers)
    persistResult(activeTest.test_id, activePaperKey, result)

    setCurrentResult(result)
    setProgress(getAllTestProgress())
    setStats(getGlobalStats())
    setCurrentView('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Retake the current test
  const handleRetakeTest = () => {
    if (!activeTest || !activePaperKey) return
    persistClearAnswers(activeTest.test_id, activePaperKey)
    setAnswers({})
    setFlagged({})
    handleStartTest(activeTest, activePaperKey, examMode)
  }

  // Request navigate back to Dashboard
  const handleRequestNavigateHome = () => {
    if (examMode === 'exam' && (currentView === 'reading' || currentView === 'listening')) {
      setExitExamConfirmOpen(true)
    } else {
      handleNavigateHome()
    }
  }

  // Navigate back to Dashboard directly
  const handleNavigateHome = () => {
    setCurrentView('dashboard')
    setActiveTest(null)
    setActivePaperKey('')
    setProgress(getAllTestProgress())
    setStats(getGlobalStats())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Toggle bilingual translation
  const handleToggleBilingual = () => {
    setBilingualMode((prev) => {
      const next = !prev
      saveSettings({ ...getSettings(), bilingual: next })
      return next
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <div className="text-slate-600 font-medium font-lexend text-sm">
          Đang tải dữ liệu đề thi Cambridge A2 Key...
        </div>
      </div>
    )
  }

  // Error state
  if (error || !masterData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-coral-200 shadow-xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-coral-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Không thể tải dữ liệu</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors cursor-pointer"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-vietnam">
      {/* Universal Navbar */}
      <Navbar
        currentView={currentView}
        onNavigateHome={handleRequestNavigateHome}
        bilingualMode={bilingualMode}
        onToggleBilingual={handleToggleBilingual}
        stats={stats}
        activeTest={activeTest}
        activeTestTitle={activeTest?.title}
        activePaperName={activePaperKey === 'listening' ? 'Listening' : 'Reading & Writing'}
        activePaperKey={activePaperKey}
        examMode={examMode}
        isMobileMode={isMobileMode}
        onToggleViewMode={handleToggleViewMode}
        onSwitchPaper={handleSwitchPaper}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'dashboard' && (
          <Dashboard
            tests={[...(masterData.tests || []), ...(masterData.online_tests || [])]}
            sampleTest={masterData.sample_test}
            progress={progress}
            stats={stats}
            onStartTest={handleStartTest}
            isMobileMode={isMobileMode}
            onToggleViewMode={handleToggleViewMode}
          />
        )}

        {currentView === 'reading' && activeTest && (
          <ReadingView
            test={activeTest}
            paperKey={activePaperKey}
            answers={answers}
            flagged={flagged}
            onAnswer={handleAnswer}
            onToggleFlag={handleToggleFlag}
            onSubmit={handleRequestSubmit}
            bilingualMode={bilingualMode}
            examMode={examMode}
            timeLeft={timeLeft}
            isMobileMode={isMobileMode}
            onToggleViewMode={handleToggleViewMode}
            onSwitchPaper={handleSwitchPaper}
          />
        )}

        {currentView === 'listening' && activeTest && (
          <ListeningView
            test={activeTest}
            answers={answers}
            flagged={flagged}
            onAnswer={handleAnswer}
            onToggleFlag={handleToggleFlag}
            onSubmit={handleRequestSubmit}
            bilingualMode={bilingualMode}
            examMode={examMode}
            timeLeft={timeLeft}
            isMobileMode={isMobileMode}
            onToggleViewMode={handleToggleViewMode}
            onSwitchPaper={handleSwitchPaper}
          />
        )}

        {currentView === 'result' && (
          <ResultView
            result={currentResult}
            test={activeTest}
            paperKey={activePaperKey}
            onRetakeTest={handleRetakeTest}
            onNavigateHome={handleNavigateHome}
            onStartOtherPaper={handleSwitchPaper}
            isMobileMode={isMobileMode}
          />
        )}
      </main>

      {/* Submit Confirmation Modal (when questions remain unanswered) */}
      <ConfirmModal
        isOpen={submitConfirmOpen}
        onClose={() => setSubmitConfirmOpen(false)}
        onConfirm={handleSubmitTest}
        title="Xác nhận nộp bài thi"
        variant="warning"
        confirmText="Vẫn nộp bài"
        cancelText="Làm tiếp bài thi"
        description={
          <div>
            <p>
              Bạn còn <strong className="text-coral-600 font-bold">{unansweredQuestions.length} câu hỏi</strong> chưa điền đáp án 
              {unansweredQuestions.length > 0 && ` (câu ${unansweredQuestions.slice(0, 6).join(', ')}${unansweredQuestions.length > 6 ? '...' : ''})`}.
            </p>
            <p className="mt-1 text-slate-500 text-xs">
              Các câu chưa trả lời sẽ bị tính là sai khi chấm điểm. Bạn có chắc chắn muốn nộp bài ngay bây giờ?
            </p>
          </div>
        }
      />

      {/* Exit Exam Mode Confirmation Modal */}
      <ConfirmModal
        isOpen={exitExamConfirmOpen}
        onClose={() => setExitExamConfirmOpen(false)}
        onConfirm={handleNavigateHome}
        title="Tạm dừng bài thi tính giờ?"
        variant="danger"
        confirmText="Rời phòng thi"
        cancelText="Tiếp tục làm bài"
        description={
          <div>
            <p>
              Bạn đang trong chế độ <strong>Thi Thử Tính Giờ (Exam Mode)</strong>.
            </p>
            <p className="mt-1 text-slate-500 text-xs">
              Tiến độ bài làm đã được lưu vào máy, nhưng đồng hồ đếm ngược sẽ dừng lại. Bạn có chắc muốn quay về trang chủ không?
            </p>
          </div>
        }
      />

      {/* Floating View Switcher Button (Desktop <-> Mobile) */}
      <div className="fixed bottom-4 right-4 z-50 print:hidden">
        <button
          type="button"
          onClick={handleToggleViewMode}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white shadow-xl shadow-slate-900/25 backdrop-blur-md border border-slate-700/50 text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500"
          title={isMobileMode ? "Bấm để đổi sang giao diện Máy tính" : "Bấm để đổi sang giao diện Điện thoại"}
          aria-label="Chuyển đổi giao diện Điện thoại và Máy tính"
        >
          {isMobileMode ? (
            <>
              <Monitor className="w-4 h-4 text-sunny-400" />
              <span className="hidden sm:inline">Giao diện:</span>
              <span className="text-sunny-300">Máy tính 💻</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Giao diện:</span>
              <span className="text-emerald-300">Điện thoại 📱</span>
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-medium">
        <p>A2 Key Master — Nền tảng ôn thi tiếng Anh Cambridge A2 Key for Schools (KET) dành cho học sinh.</p>
        <p className="mt-1 text-slate-400">Dữ liệu trích xuất từ giáo trình <em>Ready for A2 Key for Schools</em> (Valentina Chen, ELI Publishing) & Đề mẫu giữa kỳ.</p>
      </footer>
    </div>
  )
}
