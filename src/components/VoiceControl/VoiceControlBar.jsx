import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  RotateCcw,
  Pause,
  Play,
  Send,
  Keyboard,
  Sparkles,
  Square,
  Radio,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

export default function VoiceControlBar({
  isSessionActive,
  agentState, // 'IDLE' | 'GREETING' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'PAUSED'
  micError = null,
  onRequestMicPermission,
  onStartSession,
  onStopSession,
  onPauseListening,
  onResumeListening,
  onDirectListen,
  onReplaySpeech,
  onManualSubmit,
  disabled = false,
}) {
  const [inputText, setInputText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !disabled) {
      onManualSubmit(inputText.trim());
      setInputText('');
    }
  };

  const handleChipClick = (question) => {
    if (!disabled && onManualSubmit) {
      onManualSubmit(question);
    }
  };

  const isListening = agentState === 'LISTENING';
  const isSpeaking = agentState === 'SPEAKING';
  const isProcessing = agentState === 'PROCESSING';
  const isPaused = agentState === 'PAUSED';

  const SAMPLE_QUESTIONS = [
    { label: '🌐 WWW là gì?', query: 'Mạng thông tin toàn cầu World Wide Web là gì?' },
    { label: '🔗 Siêu liên kết là gì?', query: 'Thế nào là siêu liên kết và siêu văn bản?' },
    { label: '🧭 Trình duyệt là gì?', query: 'Trình duyệt web là gì và kể tên các trình duyệt phổ biến?' },
    { label: '❓ Internet khác Web thế nào?', query: 'Internet và mạng thông tin toàn cầu khác nhau như thế nào?' },
    { label: '🏠 Trang chủ là gì?', query: 'Trang chủ và website là gì?' },
    { label: '🎬 Làm sao xem video trên mạng?', query: 'Làm thế nào để truy cập và xem một video trên web?' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 z-20">
      <div className="flex flex-col items-center gap-2.5">
        {/* Permission Error Warning Banner */}
        {micError && (
          <div className="w-full max-w-2xl bg-amber-950/80 border border-amber-500/60 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-amber-200 text-xs sm:text-sm backdrop-blur-md shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{micError}</span>
            </div>
            {onRequestMicPermission && (
              <button
                onClick={onRequestMicPermission}
                className="shrink-0 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
              >
                Cấp quyền Micro
              </button>
            )}
          </div>
        )}

        {/* Main Agent Control & Status Row */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap">
          {/* 1. If session is not active -> Big START CONVERSATION button */}
          {!isSessionActive ? (
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={onStartSession}
                disabled={disabled}
                className="relative group flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-extrabold text-base sm:text-lg lg:text-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(0,242,254,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-spin-slow" />
                <span>BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC</span>
                <span className="text-xs bg-cyan-900/60 border border-cyan-400/50 px-2 py-0.5 rounded-full text-cyan-200 hidden sm:inline">
                  Tự động lắng nghe
                </span>
              </button>

              {onDirectListen && (
                <button
                  onClick={onDirectListen}
                  disabled={disabled}
                  className="flex items-center gap-2 px-4 py-3 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-cyan-500/50 text-cyan-300 text-sm font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                  title="Bật Micro để lắng nghe ngay lập tức không cần nghe lời chào"
                >
                  <Mic className="w-4 h-4 text-cyan-400" />
                  <span>Bật Mic nghe ngay</span>
                </button>
              )}
            </div>
          ) : (
            /* 2. When session is active: Real-time Agent State Bar */
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Agent Active State Pill */}
              <div
                className={`flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-bold shadow-lg transition-all ${
                  isListening
                    ? 'bg-red-500/25 text-red-300 border-2 border-red-500 shadow-red-500/30'
                    : isProcessing
                    ? 'bg-purple-500/20 text-purple-300 border-2 border-purple-500/70'
                    : isSpeaking
                    ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/70'
                    : 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/70'
                }`}
              >
                {isListening && (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                      <Mic className="w-4 h-4 text-red-400" />
                    </div>
                    <span>MICRO ĐANG LẮNG NGHE...</span>
                    {/* Animated Audio Waveform */}
                    <div className="flex items-end gap-1 h-4 ml-1">
                      <span className="w-1 bg-red-400 rounded-full h-3 animate-[pulse_0.4s_ease-in-out_infinite]" />
                      <span className="w-1 bg-red-400 rounded-full h-4 animate-[pulse_0.6s_ease-in-out_infinite]" />
                      <span className="w-1 bg-red-400 rounded-full h-2 animate-[pulse_0.5s_ease-in-out_infinite]" />
                      <span className="w-1 bg-red-400 rounded-full h-4 animate-[pulse_0.7s_ease-in-out_infinite]" />
                    </div>
                  </>
                )}
                {isProcessing && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                    <span>WEBBY ĐANG SUY NGHĨ...</span>
                  </>
                )}
                {isSpeaking && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>WEBBY ĐANG TRẢ LỜI</span>
                  </>
                )}
                {isPaused && (
                  <>
                    <Pause className="w-4 h-4 text-amber-400" />
                    <span>ĐÃ TẠM DỪNG LẮNG NGHE</span>
                  </>
                )}
              </div>

              {/* Pause / Resume Listening toggle */}
              {isListening ? (
                <button
                  onClick={onPauseListening}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-600 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Tạm dừng lắng nghe khi giáo viên giảng bài"
                >
                  <Pause className="w-4 h-4" />
                  <span>Tạm dừng</span>
                </button>
              ) : isPaused ? (
                <button
                  onClick={onResumeListening}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/50 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Tiếp tục để WEBBY lắng nghe học sinh"
                >
                  <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                  <span>Tiếp tục nghe</span>
                </button>
              ) : null}

              {/* End Session Button */}
              <button
                onClick={onStopSession}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/60 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Kết thúc phiên trò chuyện"
              >
                <Square className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                <span>Kết thúc phiên</span>
              </button>
            </div>
          )}

          {/* Replay Speech Button */}
          <button
            onClick={onReplaySpeech}
            disabled={disabled || isListening}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer"
            title="Nghe lại câu nói của WEBBY"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Nghe lại</span>
          </button>

          {/* Keyboard toggle button */}
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className={`p-2 sm:p-2.5 rounded-full border transition-all cursor-pointer ${
              showTextInput
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Nhập câu hỏi bằng bàn phím (Dự phòng)"
          >
            <Keyboard className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Quick Sample Question Chips (Nhấp để hỏi ngay) */}
        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap pt-0.5">
          <span className="text-[11px] font-semibold text-cyan-300/80 flex items-center gap-1 mr-1">
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            <span>Hỏi nhanh:</span>
          </span>
          {SAMPLE_QUESTIONS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled || isSpeaking || isProcessing}
              onClick={() => handleChipClick(chip.query)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-cyan-950/90 text-cyan-200 hover:text-white border border-cyan-500/30 hover:border-cyan-400 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Fallback Keyboard Input Area */}
        {showTextInput && (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-1.5 sm:p-2 shadow-2xl transition-all"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập câu hỏi cho WEBBY (VD: WWW có nghĩa là gì?)..."
              className="flex-1 bg-transparent px-3 py-1.5 sm:py-2 text-white placeholder-slate-400 focus:outline-none text-xs sm:text-sm md:text-base"
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputText.trim() || disabled}
              className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
