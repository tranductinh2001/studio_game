import React from 'react';
import { HelpCircle, CheckCircle, Award } from 'lucide-react';
import { gameAudio } from './services/gameAudioSynth';

export default function QuestionChallengeModal({
  isOpen,
  question,
  targetName = 'Đối tượng được chọn',
  onClose,
  onConfirmSuccess
}) {
  if (!isOpen || !question) return null;

  // Normalize question text
  const title = question.questionText || question.question || 'Câu hỏi củng cố kiến thức';

  // Normalize options whether they are an Object {A: '..', B: '..'} or Array ['..', '..']
  const optionsList = Array.isArray(question.options)
    ? question.options.map((text, i) => ({
        key: ['A', 'B', 'C', 'D'][i] || `${i + 1}`,
        text: String(text)
      }))
    : Object.entries(question.options || {}).map(([key, text]) => ({
        key,
        text: String(text)
      }));

  const handleConfirm = () => {
    gameAudio.playFanfare();
    if (onConfirmSuccess) onConfirmSuccess();
    if (onClose) onClose();
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border-2 border-indigo-500/50 p-6 sm:p-7 shadow-2xl shadow-indigo-500/30 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/40">
              CỦNG CỐ KIẾN THỨC BÀI 6
            </span>
            <span className="text-xs sm:text-sm text-slate-300 font-bold">
              Dành cho: <span className="text-amber-300 font-black">{targetName}</span>
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-sm font-bold flex items-center justify-center transition-all"
            title="Đóng modal"
          >
            ✕
          </button>
        </div>

        {/* Question Title */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
          <h3 className="text-base sm:text-xl font-black text-white leading-relaxed">
            {title}
          </h3>
        </div>

        {/* Options List */}
        <div className="mt-4 space-y-2.5">
          {optionsList.map((opt) => {
            const isCorrect = opt.key === question.correctAnswer || opt.key === String(question.correctAnswer);
            return (
              <div
                key={opt.key}
                className={`p-3.5 sm:p-4 rounded-xl border flex items-center gap-3.5 text-xs sm:text-sm transition-all ${
                  isCorrect 
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-100 font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/40' 
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-200 font-medium'
                }`}
              >
                <span className={`w-8 h-8 rounded-xl text-sm font-black flex items-center justify-center shrink-0 shadow-sm ${
                  isCorrect ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {opt.key}
                </span>
                <span className="leading-snug flex-1">{opt.text}</span>
              </div>
            );
          })}
        </div>

        {/* Explanation hint if present */}
        {question.explanation && (
          <div className="mt-3.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-xs sm:text-sm text-indigo-200/90 leading-relaxed font-medium">
            <span className="font-bold text-amber-300">💡 Gợi ý giải thích: </span>
            {question.explanation}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-5 flex items-center justify-end gap-3 pt-3.5 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-all"
          >
            Bỏ Qua
          </button>

          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Xác Nhận Trả Lời Đúng (+10đ)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

