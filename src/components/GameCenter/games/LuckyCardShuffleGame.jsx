import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Shuffle, UserCheck, Sparkles, Trophy, RotateCcw, 
  HelpCircle, CheckCircle, Users, Star, Award
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';

export default function LuckyCardShuffleGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const isIndividualMode = settings.mode === 'individual';
  const participants = isIndividualMode ? students : teams;

  // 'IDLE' | 'SHUFFLING' | 'REVEALED'
  const [gameState, setGameState] = useState('IDLE');
  const [activeCards, setActiveCards] = useState([]);
  const [luckyWinner, setLuckyWinner] = useState(null);
  const [flippedIndex, setFlippedIndex] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);

  // Setup initial visible deck of 6 or 8 cards
  useEffect(() => {
    resetDeck();
  }, [teams, students, isIndividualMode]);

  // Shortcut 1-9 to silently pick winner
  useEffect(() => {
    const handleKeyDown = (e) => {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= teams.length) {
        const target = teams[num - 1];
        if (target) {
          secretControl.targetTeamId = target.id;
          secretControl.mode = 'teacher_rigged';
          gameAudio.playTick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teams, secretControl]);

  const resetDeck = () => {
    setGameState('IDLE');
    setLuckyWinner(null);
    setFlippedIndex(null);
    setShowChallengeModal(false);

    const count = Math.min(participants.length > 0 ? participants.length : 6, 6);
    const initialDeck = Array.from({ length: count }).map((_, idx) => ({
      slotId: idx,
      isFlipped: false,
      rotation: (Math.random() - 0.5) * 6,
      offsetY: 0
    }));
    setActiveCards(initialDeck);
  };

  const startShuffle = () => {
    if (gameState === 'SHUFFLING') return;
    setGameState('SHUFFLING');
    setFlippedIndex(null);
    setLuckyWinner(null);
    gameAudio.playTick();

    // Determine lucky winner beforehand
    let winner = null;
    const mode = secretControl?.mode || 'fair_random';
    const targetId = isIndividualMode ? secretControl?.targetStudentId : secretControl?.targetTeamId;

    if (mode === 'teacher_rigged' && targetId) {
      winner = participants.find(p => p.id === targetId) || participants[0];
    } else if (mode === 'weighted_random' && targetId && Math.random() < 0.8) {
      winner = participants.find(p => p.id === targetId) || participants[0];
    } else {
      const randIdx = Math.floor(Math.random() * participants.length);
      winner = participants[randIdx] || { name: 'Học sinh may mắn', icon: '⭐' };
    }

    // Shuffle cycle animation
    let tickCount = 0;
    const totalTicks = 16;
    const interval = setInterval(() => {
      tickCount++;
      gameAudio.playPop();

      setActiveCards(prev => prev.map(card => ({
        ...card,
        rotation: (Math.random() - 0.5) * 24,
        offsetY: (Math.random() - 0.5) * 30
      })));

      if (tickCount >= totalTicks) {
        clearInterval(interval);
        finishShuffle(winner);
      }
    }, 150);
  };

  const finishShuffle = (winner) => {
    // Pick the middle or random card slot to flip
    const revealSlot = Math.floor(activeCards.length / 2);
    setFlippedIndex(revealSlot);
    setLuckyWinner(winner);
    setGameState('REVEALED');

    gameAudio.playFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });

    if (onRecordResult) {
      onRecordResult({
        gameId: 'game-06-lucky-shuffle',
        gameName: 'Ai Là Người May Mắn?',
        winner: winner,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 select-none overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.25),transparent_70%)]" />

      {/* Header */}
      <div className="w-full flex items-center justify-between max-w-5xl mx-auto z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950/40 backdrop-blur rounded-[14px] flex items-center justify-center text-2xl">
              🎴
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-cyan-300 flex items-center gap-2">
              AI LÀ NGƯỜI MAY MẮN?
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {isIndividualMode ? 'Học Sinh Cá Nhân' : 'Đại Diện Nhóm'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Hệ thống đảo vị trí thẻ bài ngẫu nhiên để chọn ra người may mắn nhất lên bảng hoặc trả lời
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {gameState !== 'SHUFFLING' && (
            <button
              onClick={startShuffle}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              XÁO BÀI & CHỌN
            </button>
          )}
          {gameState === 'REVEALED' && (
            <button
              onClick={resetDeck}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Làm Mới
            </button>
          )}
        </div>
      </div>

      {/* Main Card Stage */}
      <div className="w-full max-w-5xl flex-1 flex items-center justify-center my-4 z-10">
        {gameState !== 'REVEALED' ? (
          <div className="flex items-center justify-center gap-4 flex-wrap max-w-4xl px-4 py-8">
            {activeCards.map((card, idx) => (
              <div
                key={card.slotId}
                className="relative w-36 h-56 rounded-2xl bg-gradient-to-b from-indigo-900/90 via-slate-900 to-indigo-950 border-2 border-indigo-400/50 shadow-2xl flex flex-col items-center justify-center p-3 text-center transition-transform duration-200"
                style={{
                  transform: `rotate(${card.rotation}deg) translateY(${card.offsetY}px)`,
                  boxShadow: '0 15px 30px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                {/* Mystic card back pattern */}
                <div className="w-full h-full rounded-xl border border-dashed border-indigo-400/30 flex flex-col items-center justify-center gap-2 bg-slate-950/50">
                  <span className="text-3xl filter drop-shadow">✨</span>
                  <span className="text-[11px] font-black text-indigo-300 tracking-widest uppercase">
                    BÀI 6 TIN HỌC
                  </span>
                  <div className="w-8 h-0.5 bg-indigo-500/40 rounded-full" />
                  <span className="text-xs font-mono font-bold text-sky-400">
                    THCS ĐẮK TRÔI
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Card Reveal Presentation */
          luckyWinner && (
            <div className="w-full max-w-md animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
              <div className="relative w-full rounded-3xl bg-gradient-to-b from-slate-900/95 via-indigo-950 to-slate-900 border-2 border-amber-400 p-8 shadow-2xl shadow-amber-500/20 backdrop-blur-md">
                {/* Crown Avatar */}
                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-xl shadow-amber-500/40 mb-4">
                  <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
                    {luckyWinner.icon || (isIndividualMode ? '🎓' : '⭐')}
                  </div>
                </div>

                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest mb-2">
                  🎉 NGƯỜI MAY MẮN NHẤT 🎉
                </span>

                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
                  {luckyWinner.name}
                </h3>

                {luckyWinner.teamName && (
                  <p className="text-sm font-bold text-indigo-300 mt-1">
                    Thuộc nhóm: {luckyWinner.teamName}
                  </p>
                )}

                <div className="my-5 p-3.5 rounded-2xl bg-indigo-900/30 border border-indigo-500/30 flex items-center justify-around text-xs">
                  <div>
                    <span className="text-slate-400">Lớp:</span>{' '}
                    <span className="font-bold text-white">6A - THCS Đắk Trôi</span>
                  </div>
                  <div className="w-px h-4 bg-slate-700" />
                  <div>
                    <span className="text-slate-400">Nhiệm vụ:</span>{' '}
                    <span className="font-bold text-yellow-300">Trả lời câu hỏi</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      const randomQ = LESSON_6_QUESTIONS[Math.floor(Math.random() * LESSON_6_QUESTIONS.length)];
                      setCurrentQuestion(randomQ);
                      setShowChallengeModal(true);
                      gameAudio.playBell();
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Thử Thách Bài 6
                  </button>
                  <button
                    onClick={startShuffle}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all active:scale-95"
                  >
                    <Shuffle className="w-4 h-4" />
                    Chọn Người Khác
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Challenge Question Modal */}
      {showChallengeModal && currentQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-indigo-500/50 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                  {currentQuestion.id || 'CÂU HỎI'}
                </span>
                <h4 className="text-base font-bold text-white">
                  Thử Thách Dành Cho {luckyWinner?.name}
                </h4>
              </div>
              <button
                onClick={() => setShowChallengeModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="mt-4 text-base font-bold text-slate-100 leading-relaxed">
              {currentQuestion.question}
            </p>

            <div className="mt-4 space-y-2">
              {currentQuestion.options.map((opt, i) => {
                const optLetter = String.fromCharCode(65 + i);
                const isCorrect = i === currentQuestion.correctAnswer;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      isCorrect 
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-medium' 
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-xs font-black flex items-center justify-center">
                      {optLetter}
                    </span>
                    <span className="text-sm">{opt}</span>
                    {isCorrect && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowChallengeModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
              >
                Đã Hoàn Thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
