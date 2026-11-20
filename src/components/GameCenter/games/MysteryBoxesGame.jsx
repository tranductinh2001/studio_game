import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Gift, Sparkles, Trophy, RotateCcw, HelpCircle, 
  CheckCircle, ArrowRight, Star, Award, Zap, Shuffle
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';

const SURPRISE_REWARDS = [
  { text: "+10 Điểm vinh quang cho đội!", badge: "🎁 Điểm Thưởng", icon: "⭐" },
  { text: "Nhận tràng pháo tay giòn giã từ cả lớp!", badge: "👏 Cổ Vũ", icon: "🎉" },
  { text: "Đặc quyền chọn câu hỏi tiếp theo!", badge: "👑 Quyền Ưu Tiên", icon: "👑" },
  { text: "Cơ hội nhân đôi điểm số nếu trả lời đúng!", badge: "⚡ Nhân Đôi Điểm", icon: "🚀" },
  { text: "Huy hiệu Ngôi Sao Tin Học 6!", badge: "🌟 Danh Hiệu Vàng", icon: "🏅" },
  { text: "Bảo bối miễn trừ 1 lần trả lời sai!", badge: "🛡️ Khiên Bảo Vệ", icon: "🛡️" }
];

export default function MysteryBoxesGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const isIndividualMode = settings.mode === 'individual';
  const participants = isIndividualMode ? students : teams;

  const [boxes, setBoxes] = useState([]);
  const [openedBoxId, setOpenedBoxId] = useState(null);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);

  // Keyboard shortcut 1-9 to silently pick target winner
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

  // Initialize or reset mystery boxes
  const initBoxes = () => {
    setOpenedBoxId(null);
    setSelectedWinner(null);
    setShowChallengeModal(false);

    const count = Math.min(participants.length > 0 ? participants.length : 6, 8);
    const boxColors = [
      'from-amber-500 to-yellow-600',
      'from-red-500 to-rose-600',
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-purple-500 to-fuchsia-600',
      'from-orange-500 to-amber-600',
      'from-cyan-500 to-blue-600',
      'from-pink-500 to-rose-600'
    ];

    const newBoxes = Array.from({ length: count }).map((_, idx) => ({
      id: idx + 1,
      color: boxColors[idx % boxColors.length],
      reward: SURPRISE_REWARDS[idx % SURPRISE_REWARDS.length],
      isOpened: false
    }));

    setBoxes(newBoxes);
  };

  useEffect(() => {
    initBoxes();
  }, [teams, students, isIndividualMode]);

  // Open a specific box
  const handleOpenBox = (box) => {
    if (box.isOpened || openedBoxId !== null) return;

    gameAudio.playPop();
    setOpenedBoxId(box.id);

    // Determine winner based on secretControl
    let chosenWinner = null;
    const mode = secretControl?.mode || 'fair_random';
    const targetId = isIndividualMode ? secretControl?.targetStudentId : secretControl?.targetTeamId;

    if (mode === 'teacher_rigged' && targetId) {
      chosenWinner = participants.find(p => p.id === targetId) || participants[0];
    } else if (mode === 'weighted_random' && targetId && Math.random() < 0.8) {
      chosenWinner = participants.find(p => p.id === targetId) || participants[0];
    } else {
      // Fair random
      const randomIdx = Math.floor(Math.random() * participants.length);
      chosenWinner = participants[randomIdx] || { name: 'Người chơi may mắn', number: 1, icon: '⭐' };
    }

    setTimeout(() => {
      setSelectedWinner(chosenWinner);
      gameAudio.playFanfare();

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });

      if (onRecordResult) {
        onRecordResult({
          gameId: 'game-04-mystery-box',
          gameName: 'Hộp Quà Bí Ẩn',
          winner: chosenWinner,
          timestamp: new Date().toISOString()
        });
      }
    }, 450);
  };

  const handleOpenQuestion = () => {
    const randomQ = LESSON_6_QUESTIONS[Math.floor(Math.random() * LESSON_6_QUESTIONS.length)];
    setCurrentQuestion(randomQ);
    setShowChallengeModal(true);
    gameAudio.playBell();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 select-none overflow-hidden">
      {/* Background magical sparkles */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_50%_30%,rgba(245,158,11,0.25),transparent_70%)]" />

      {/* Top Banner */}
      <div className="w-full flex items-center justify-between max-w-5xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/30">
            <div className="w-full h-full bg-slate-950/40 backdrop-blur rounded-[14px] flex items-center justify-center text-2xl">
              🎁
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 flex items-center gap-2">
              HỘP QUÀ BÍ ẨN
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {isIndividualMode ? 'Chọn Học Sinh' : 'Chọn Nhóm'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Chọn một hộp quà bất kỳ để mở khóa phần thưởng và câu hỏi thử thách Tin học 6
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={initBoxes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95"
            title="Xáo trộn và đặt lại hộp quà"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm mới hộp
          </button>
        </div>
      </div>

      {/* Boxes Grid */}
      <div className="w-full max-w-5xl flex-1 flex items-center justify-center my-4 z-10">
        {!selectedWinner ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl px-4">
            {boxes.map((box) => (
              <div
                key={box.id}
                onClick={() => handleOpenBox(box)}
                onMouseEnter={() => gameAudio.playTick()}
                className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {/* 3D Glow behind box */}
                <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${box.color} opacity-40 blur-lg group-hover:opacity-80 transition duration-300`} />

                {/* Box Container */}
                <div className="relative rounded-2xl bg-slate-900/90 border-2 border-amber-400/30 group-hover:border-amber-400 p-6 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-sm min-h-[160px]">
                  {/* Ribbon icon */}
                  <div className="text-5xl mb-2 filter drop-shadow-md group-hover:animate-bounce">
                    🎁
                  </div>
                  <span className="text-lg font-black text-amber-300 tracking-wider">
                    HỘP SỐ {box.id}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-400" /> Nhấn để mở quà
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Opened Box Reveal Presentation */
          <div className="w-full max-w-xl animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
            {/* Winner Card */}
            <div className="relative w-full rounded-3xl bg-gradient-to-b from-slate-900/95 via-indigo-950/90 to-slate-900 border-2 border-yellow-400/80 p-8 shadow-2xl shadow-amber-500/20 backdrop-blur-md">
              {/* Floating Trophy & Sparkle */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-xl shadow-amber-500/40">
                <div className="w-full h-full bg-slate-950 rounded-[12px] flex items-center justify-center text-3xl">
                  {selectedWinner.icon || '🏆'}
                </div>
              </div>

              <div className="mt-8">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest mb-2">
                  🎉 CHÚC MỪNG {isIndividualMode ? 'HỌC SINH' : 'NHÓM CHIẾN THẮNG'} 🎉
                </span>

                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
                  {selectedWinner.name}
                </h3>

                {selectedWinner.shortName && (
                  <p className="text-sm font-semibold text-slate-400 mt-1">
                    {selectedWinner.shortName}
                  </p>
                )}

                {/* Reward Banner */}
                <div className="my-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center gap-3">
                  <div className="text-3xl">🎁</div>
                  <div className="text-left">
                    <div className="text-xs uppercase font-bold text-amber-400">
                      Phần thưởng bí ẩn:
                    </div>
                    <div className="text-base font-bold text-slate-100">
                      {boxes[openedBoxId - 1]?.reward.text || "+10 Điểm vinh quang cho đội!"}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleOpenQuestion}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                  >
                    <HelpCircle className="w-4 h-4 text-blue-200" />
                    Thử Thách Bài 6
                  </button>

                  <button
                    onClick={initBoxes}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-600 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Chọn Lại
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                  Thử Thách Kiến Thức Bài 6
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
