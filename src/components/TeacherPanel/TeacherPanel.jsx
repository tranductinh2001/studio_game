import React, { useState } from 'react';
import {
  Settings,
  Play,
  Square,
  Pause,
  RotateCcw,
  Sparkles,
  Wifi,
  WifiOff,
  BookOpen,
  Volume2,
  Award,
  Radio
} from 'lucide-react';
import lessonKnowledge from '../../data/lessonKnowledge.json';
import conversationScripts from '../../data/conversationScripts.json';

export default function TeacherPanel({
  isOpen,
  onToggleOpen,
  isSessionActive,
  agentState,
  onStartSession,
  onStopSession,
  onPauseListening,
  onResumeListening,
  onReplay,
  onExecuteScriptStep,
  onSelectFaqQuestion,
  onTriggerTransitionLesson,
  isOfflineMode,
  onToggleOfflineMode,
  hasGeminiKey,
  speechRate,
  onChangeSpeechRate,
  currentScriptStep = 1,
  onEmotionOverride
}) {
  const [activeTab, setActiveTab] = useState('script'); // 'script' | 'faq' | 'settings'

  const isListening = agentState === 'LISTENING';
  const isPaused = agentState === 'PAUSED';

  return (
    <>
      {/* Floating Toggle Pill for Teacher (Top Right) */}
      <div className="fixed top-3 sm:top-4 right-3 sm:right-4 z-50 flex items-center gap-2">
        <button
          onClick={onToggleOpen}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-xs sm:text-sm backdrop-blur-md transition-all shadow-xl ${
            isOpen
              ? 'bg-cyan-500 text-slate-950 font-bold border border-cyan-300'
              : 'bg-slate-900/85 text-cyan-300 border border-cyan-500/50 hover:bg-slate-800'
          }`}
          title="Bảng điều khiển giáo viên (Phím tắt: F2)"
        >
          <Settings className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isOpen ? 'rotate-90' : ''} transition-transform`} />
          <span>{isOpen ? 'ĐÓNG ĐIỀU KHIỂN' : 'BẢNG ĐIỀU KHIỂN GV'}</span>
        </button>
      </div>

      {/* Drawer / Floating Panel */}
      {isOpen && (
        <div className="fixed top-14 sm:top-16 right-3 sm:right-4 w-96 max-w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-4.5rem)] bg-slate-950/95 backdrop-blur-2xl border-2 border-cyan-500/60 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.85)] z-50 flex flex-col overflow-hidden text-slate-200">
          {/* Header */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="p-1 sm:p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">ĐIỀU KHIỂN TIẾT DẠY</h3>
                <p className="text-[11px] sm:text-xs text-cyan-300/80">Bài 6: Mạng thông tin toàn cầu</p>
              </div>
            </div>

            {/* Offline / Online Status Badge */}
            <button
              onClick={onToggleOfflineMode}
              className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border ${
                isOfflineMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : hasGeminiKey
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
              }`}
              title="Nhấp để đổi chế độ AI Online / Offline"
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{hasGeminiKey ? 'Gemini AI' : 'Smart Rule'}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Action Bar for Session Control */}
          <div className="p-2 sm:p-3 bg-slate-900/60 border-b border-slate-800 grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs">
            {/* Start or Resume */}
            {!isSessionActive ? (
              <button
                onClick={onStartSession}
                className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 transition-all font-medium"
              >
                <Play className="w-4 h-4 mb-1 text-cyan-400 fill-cyan-400" />
                <span>Bắt đầu</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={onResumeListening}
                className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 transition-all font-medium"
              >
                <Play className="w-4 h-4 mb-1 text-emerald-400 fill-emerald-400" />
                <span>Tiếp tục</span>
              </button>
            ) : (
              <button
                onClick={onPauseListening}
                className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 transition-all font-medium"
              >
                <Pause className="w-4 h-4 mb-1 text-amber-400" />
                <span>Tạm dừng</span>
              </button>
            )}

            {/* Listening state indicator / manual pause */}
            <div
              className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border text-[11px] font-medium ${
                isListening
                  ? 'bg-red-500/20 text-red-300 border-red-500/60 animate-pulse'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
            >
              <Radio className="w-4 h-4 mb-1 text-red-400" />
              <span>{isListening ? 'Đang nghe' : 'Nghỉ'}</span>
            </div>

            {/* Replay */}
            <button
              onClick={onReplay}
              className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all font-medium"
            >
              <RotateCcw className="w-4 h-4 mb-1 text-cyan-400" />
              <span>Nói lại</span>
            </button>

            {/* Stop session */}
            <button
              onClick={onStopSession}
              className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 transition-all font-medium"
            >
              <Square className="w-4 h-4 mb-1 text-red-400 fill-red-400" />
              <span>Kết thúc</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('script')}
              className={`flex-1 py-2 sm:py-2.5 text-center transition-all ${
                activeTab === 'script'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kịch bản khởi động
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-2 sm:py-2.5 text-center transition-all ${
                activeTab === 'faq'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ngân hàng 12 câu
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 sm:py-2.5 text-center transition-all ${
                activeTab === 'settings'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cài đặt
            </button>
          </div>

          {/* Tab Contents (Scrollable with max-height to ensure fit within viewport) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 max-h-[50vh]">
            {/* TAB 1: SCRIPT RUNNER */}
            {activeTab === 'script' && (
              <div className="space-y-2.5">
                <p className="text-[11px] sm:text-xs text-slate-400 italic">
                  Quy trình khởi động 4 bước dẫn dắt tự nhiên vào Bài 6:
                </p>

                {conversationScripts.warmupSteps.map((stepItem) => {
                  const isCurrent = currentScriptStep === stepItem.step;
                  return (
                    <div
                      key={stepItem.step}
                      className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded ${
                            isCurrent
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Bước {stepItem.step}
                        </span>
                        <button
                          onClick={() => onExecuteScriptStep(stepItem)}
                          className="text-[11px] sm:text-xs px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-400/40 font-medium"
                        >
                          Phát bước này
                        </button>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2">
                        {stepItem.text}
                      </p>
                    </div>
                  );
                })}

                {/* Big Trigger for Lesson Transition */}
                <button
                  onClick={onTriggerTransitionLesson}
                  className="w-full mt-3 flex items-center justify-center gap-2 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:scale-102 active:scale-98 transition-all"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>KẾT THÚC KHỞI ĐỘNG - VÀO BÀI 6!</span>
                </button>
              </div>
            )}

            {/* TAB 2: FAQ 12 QUESTIONS */}
            {activeTab === 'faq' && (
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-[11px] sm:text-xs text-slate-400 italic">
                  Nhấp câu hỏi để Mark trả lời và đặt câu hỏi gợi mở cho học sinh:
                </p>

                {lessonKnowledge.faq.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectFaqQuestion(item)}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/60 hover:bg-cyan-950/30 cursor-pointer transition-all flex items-start gap-2 group"
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 mt-0.5 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
                      {item.id}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                        {item.question}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: SETTINGS & EMOTIONS */}
            {activeTab === 'settings' && (
              <div className="space-y-3 text-xs">
                {/* Speech Rate */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      Tốc độ đọc Mark:
                    </span>
                    <span className="text-cyan-400 font-bold">{speechRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={speechRate}
                    onChange={(e) => onChangeSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Chậm (0.75x)</span>
                    <span>Chuẩn (1.0x)</span>
                    <span>Nhanh (1.25x)</span>
                  </div>
                </div>

                {/* Manual Emotion Override */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Biểu cảm thử nghiệm:
                  </h4>
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    {[
                      { key: 'IDLE', label: 'Bình thường' },
                      { key: 'GREETING', label: 'Vẫy chào' },
                      { key: 'LISTENING', label: 'Lắng nghe' },
                      { key: 'THINKING', label: 'Suy nghĩ' },
                      { key: 'HAPPY', label: 'Vui mừng' },
                      { key: 'ENCOURAGING', label: 'Động viên' },
                    ].map((em) => (
                      <button
                        key={em.key}
                        onClick={() => onEmotionOverride(em.key)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-cyan-900/40 text-slate-300 hover:text-cyan-300 border border-slate-700 text-center font-medium transition-colors"
                      >
                        {em.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode info */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p>
                    <strong className="text-slate-300">Hội thoại liên tục:</strong> Tự động lắng nghe sau khi Webby nói xong.
                  </p>
                  <p>
                    <strong className="text-slate-300">Bảo mật:</strong> Không lưu trữ âm thanh hay thông tin học sinh.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
