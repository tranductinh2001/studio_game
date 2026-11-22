import React from 'react';
import { Volume2, Mic, Bot, User } from 'lucide-react';

export default function SubtitleDisplay({
  currentSpeaker = 'WEBBY',
  text = '',
  interimText = '',
  isSpeaking = false,
  isListening = false,
}) {
  if (!text && !interimText && !isListening) {
    return null;
  }

  // Highlight key terms for Grade 6 Lesson 6
  const formatHighlightedText = (content) => {
    if (!content) return null;
    const keywords = [
      'Internet',
      'Mạng thông tin toàn cầu',
      'World Wide Web',
      'WWW',
      'Website',
      'Trang web',
      'Trang chủ',
      'Siêu liên kết',
      'Siêu văn bản',
      'Trình duyệt',
      'Trình duyệt web',
      'Google Chrome',
      'Microsoft Edge',
      'Cốc Cốc',
      'Tim Berners-Lee',
      'Bài 6'
    ];

    // Escape regex
    const pattern = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = content.split(pattern);

    return parts.map((part, index) => {
      if (keywords.some((k) => k.toLowerCase() === part.toLowerCase())) {
        return (
          <span
            key={index}
            className="text-cyan-300 font-extrabold underline decoration-cyan-400 decoration-2 underline-offset-4"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const isMark = currentSpeaker === 'MARK' || currentSpeaker === 'WEBBY' || currentSpeaker === 'Mark';

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-4 z-20 transition-all duration-300">
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-cyan-500/40 sm:border-2 sm:border-cyan-500/50 p-3.5 sm:p-5 md:p-6 shadow-[0_0_40px_rgba(0,180,255,0.2)]">
        {/* Glow ambient background bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        {/* Header with speaker badge & soundwave */}
        <div className="flex items-center justify-between mb-2 sm:mb-2.5">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full font-bold text-xs sm:text-sm md:text-base tracking-wider ${
                isMark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
              }`}
            >
              {isMark ? <Bot className="w-4 h-4 sm:w-5 sm:h-5" /> : <User className="w-4 h-4 sm:w-5 sm:h-5" />}
              <span>{isMark ? 'TRỢ LÝ MARK' : 'HỌC SINH ĐẶT CÂU HỎI'}</span>
            </div>

            {/* Audio Activity indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-1 text-cyan-400">
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
                <div className="flex items-end gap-0.5 sm:gap-1 h-3.5 sm:h-4">
                  <span className="w-0.5 sm:w-1 bg-cyan-400 h-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                  <span className="w-0.5 sm:w-1 bg-cyan-400 h-2/3 animate-[pulse_0.8s_ease-in-out_infinite]" />
                  <span className="w-0.5 sm:w-1 bg-cyan-400 h-4/5 animate-[pulse_0.5s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {isListening && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 text-xs sm:text-sm font-semibold animate-pulse">
                <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                <span>Đang nghe liên tục...</span>
              </div>
            )}
          </div>
        </div>

        {/* Subtitle Text Content (Large projector-optimized typography, responsive) */}
        <div className="text-base sm:text-xl md:text-2xl lg:text-[1.65rem] font-medium leading-snug sm:leading-relaxed md:leading-normal text-slate-100 min-h-[44px] sm:min-h-[56px] flex items-center">
          {isListening && !text && !interimText ? (
            <p className="italic text-slate-400 flex items-center gap-2 text-sm sm:text-base md:text-xl">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan-400 animate-ping inline-block" />
              Mời các bạn đặt câu hỏi hoặc trao đổi, WEBBY đang lắng nghe...
            </p>
          ) : (
            <p className="drop-shadow-md">
              {formatHighlightedText(text)}
              {interimText && (
                <span className="italic text-slate-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  {' '}{interimText}...
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

