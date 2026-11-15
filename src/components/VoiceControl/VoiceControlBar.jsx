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
  Radio
} from 'lucide-react';

export default function VoiceControlBar({
  isSessionActive,
  agentState, // 'IDLE' | 'GREETING' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'PAUSED'
  onStartSession,
  onStopSession,
  onPauseListening,
  onResumeListening,
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

  const isListening = agentState === 'LISTENING';
  const isSpeaking = agentState === 'SPEAKING';
  const isProcessing = agentState === 'PROCESSING';
  const isPaused = agentState === 'PAUSED';

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 z-20">
      <div className="flex flex-col items-center gap-2.5">
        {/* Main Agent Control & Status Row */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap">
          {/* 1. If session is not active -> Big START CONVERSATION button */}
          {!isSessionActive ? (
            <button
              onClick={onStartSession}
              disabled={disabled}
              className="relative group flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-extrabold text-base sm:text-lg lg:text-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(0,242,254,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-spin-slow" />
              <span>BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC</span>
              <span className="text-xs bg-cyan-900/60 border border-cyan-400/50 px-2 py-0.5 rounded-full text-cyan-200 hidden sm:inline">
                Tự động lắng nghe
              </span>
            </button>
          ) : (
            /* 2. When session is active: Real-time Agent State Bar */
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Agent Active State Pill */}
              <div
                className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-bold shadow-lg transition-all ${
                  isListening
                    ? 'bg-red-500/20 text-red-300 border-2 border-red-500/70 shadow-red-500/20 animate-pulse'
                    : isProcessing
                    ? 'bg-purple-500/20 text-purple-300 border-2 border-purple-500/70'
                    : isSpeaking
                    ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/70'
                    : 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/70'
                }`}
              >
                {isListening && (
                  <>
                    <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 animate-ping" />
                    <span>ĐANG LẮNG NGHE HỌC SINH... (Hỏi tự nhiên)</span>
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
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-600 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                  title="Tạm dừng lắng nghe khi giáo viên giảng bài"
                >
                  <Pause className="w-4 h-4" />
                  <span>Tạm dừng</span>
                </button>
              ) : isPaused ? (
                <button
                  onClick={onResumeListening}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/50 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                  title="Tiếp tục để WEBBY lắng nghe học sinh"
                >
                  <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                  <span>Tiếp tục nghe</span>
                </button>
              ) : null}

              {/* End Session Button */}
              <button
                onClick={onStopSession}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/60 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95"
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
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            title="Nghe lại câu nói của WEBBY"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Nghe lại</span>
          </button>

          {/* Keyboard toggle button */}
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className={`p-2 sm:p-2.5 rounded-full border transition-all ${
              showTextInput
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Nhập câu hỏi bằng bàn phím (Dự phòng)"
          >
            <Keyboard className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
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
              className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all disabled:opacity-40"
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
