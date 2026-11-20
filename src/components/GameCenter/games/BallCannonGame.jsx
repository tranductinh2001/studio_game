import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Crosshair, Trophy, Play, RotateCcw, Sparkles, 
  HelpCircle, CheckCircle, Target, Award, Zap
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';

export default function BallCannonGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const isIndividualMode = settings.mode === 'individual';
  const participants = isIndividualMode ? students : teams;

  // 'IDLE' | 'FIRING' | 'HIT'
  const [gameState, setGameState] = useState('IDLE');
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [ballPosition, setBallPosition] = useState({ x: 10, y: 85, visible: false });
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);

  const animFrameRef = useRef(null);

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

  const resetGame = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setGameState('IDLE');
    setSelectedWinner(null);
    setBallPosition({ x: 10, y: 85, visible: false });
    setShowChallengeModal(false);
  };

  const fireCannon = () => {
    if (gameState === 'FIRING') return;
    setGameState('FIRING');
    setSelectedWinner(null);
    gameAudio.playPop();

    // Determine target winner
    let chosenWinner = null;
    let targetIdx = 0;
    const mode = secretControl?.mode || 'fair_random';
    const targetId = isIndividualMode ? secretControl?.targetStudentId : secretControl?.targetTeamId;

    if (mode === 'teacher_rigged' && targetId) {
      targetIdx = participants.findIndex(p => p.id === targetId);
      if (targetIdx === -1) targetIdx = 0;
      chosenWinner = participants[targetIdx];
    } else if (mode === 'weighted_random' && targetId && Math.random() < 0.8) {
      targetIdx = participants.findIndex(p => p.id === targetId);
      if (targetIdx === -1) targetIdx = 0;
      chosenWinner = participants[targetIdx];
    } else {
      targetIdx = Math.floor(Math.random() * participants.length);
      chosenWinner = participants[targetIdx] || { name: 'Mục Tiêu', icon: '🎯' };
    }

    // Target X position in percentage (spread horizontally in target zone)
    const targetCount = participants.length;
    const targetX = 35 + (targetIdx / Math.max(targetCount - 1, 1)) * 55;
    const targetY = 25 + (targetIdx % 2) * 15;

    // Animate parabolic trajectory
    const startX = 12;
    const startY = 82;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animateTrajectory = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1.0);

      // Parabolic arc formula
      const currentX = startX + (targetX - startX) * t;
      // Arc peak in the middle
      const arcHeight = 45 * Math.sin(t * Math.PI);
      const currentY = (startY + (targetY - startY) * t) - arcHeight;

      setBallPosition({ x: currentX, y: currentY, visible: true });

      if (t < 1.0) {
        animFrameRef.current = requestAnimationFrame(animateTrajectory);
      } else {
        // Hit target!
        handleTargetHit(chosenWinner);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateTrajectory);
  };

  const handleTargetHit = (winner) => {
    setGameState('HIT');
    setSelectedWinner(winner);
    gameAudio.playWhistle();
    gameAudio.playFanfare();

    confetti({
      particleCount: 140,
      spread: 95,
      origin: { y: 0.55 }
    });

    if (onRecordResult) {
      onRecordResult({
        gameId: 'game-08-ball-cannon',
        gameName: 'Bắn Bóng Trúng Đích',
        winner: winner,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 bg-gradient-to-b from-slate-950 via-sky-950/50 to-slate-900 select-none overflow-hidden font-sans">
      {/* Background radial gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.25),transparent_70%)]" />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between max-w-5xl mx-auto z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5 shadow-lg shadow-sky-500/30">
            <div className="w-full h-full bg-slate-950/40 backdrop-blur rounded-[14px] flex items-center justify-center text-2xl">
              🎯
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-amber-300 flex items-center gap-2">
              BẮN BÓNG TRÚNG ĐÍCH
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                {isIndividualMode ? 'Bắn Trúng Học Sinh' : 'Bắn Trúng Nhóm'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Khai hỏa khẩu pháo thần công để bắn quả bóng trúng hồng tâm chọn đội may mắn
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {gameState === 'IDLE' && (
            <button
              onClick={fireCannon}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-sky-600/30 transition-all active:scale-95"
            >
              <Target className="w-4 h-4" />
              KHAI HỎA BẮN BÓNG
            </button>
          )}
          {gameState === 'HIT' && (
            <button
              onClick={resetGame}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Bắn Lượt Mới
            </button>
          )}
        </div>
      </div>

      {/* Main Shooting Range Stage */}
      <div className="relative w-full max-w-5xl flex-1 my-3 rounded-3xl bg-slate-900/60 border border-sky-900/40 p-4 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-md z-10">
        {/* Targets Area (Top Half) */}
        <div className="w-full flex items-center justify-around py-4 flex-wrap gap-4 z-10">
          {participants.map((item, idx) => {
            const isWinner = selectedWinner?.id === item.id;
            return (
              <div
                key={item.id}
                className={`flex flex-col items-center transition-all duration-300 ${
                  isWinner ? 'scale-125 animate-bounce' : 'opacity-85 hover:opacity-100'
                }`}
              >
                {/* Target Bullseye Circle */}
                <div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center p-1 shadow-xl border-2 transition-all ${
                    isWinner
                      ? 'border-yellow-400 bg-yellow-400/20 shadow-yellow-400/40'
                      : 'border-sky-400/50 bg-sky-950/60'
                  }`}
                  style={{ borderColor: item.color || '#38bdf8' }}
                >
                  <div className="w-full h-full rounded-full border-2 border-dashed border-sky-300/40 flex items-center justify-center text-xl">
                    {item.icon || '🎯'}
                  </div>
                </div>

                <span className="text-xs font-black text-slate-200 mt-2 max-w-[80px] truncate text-center">
                  {item.shortName || item.name}
                </span>
                <span className="text-[10px] font-bold text-sky-400">
                  {item.number ? `Đội ${item.number}` : 'HS'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Flying Cannon Ball */}
        {ballPosition.visible && (
          <div
            className="absolute z-30 transition-transform pointer-events-none"
            style={{
              left: `${ballPosition.x}%`,
              top: `${ballPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 shadow-[0_0_20px_rgba(251,191,36,0.9)] animate-spin flex items-center justify-center text-xs">
              ⚡
            </div>
          </div>
        )}

        {/* Cannon Launcher at Bottom Left */}
        <div className="w-full flex items-end justify-between px-6 pb-2 z-10">
          <div className="flex items-end gap-3">
            {/* 3D Cannon Graphic */}
            <div className="relative">
              {/* Cannon Barrel pointing at 45 deg */}
              <div className="w-24 h-8 bg-gradient-to-r from-slate-700 via-slate-600 to-sky-700 rounded-r-xl border-2 border-sky-400/60 shadow-xl origin-bottom-left -rotate-[38deg] transform translate-y-2">
                <div className="absolute right-0 top-0 bottom-0 w-3 bg-sky-400 rounded-r" />
              </div>
              {/* Cannon Base Wheel */}
              <div className="w-14 h-14 rounded-full bg-slate-800 border-4 border-slate-600 shadow-2xl flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-sky-400" />
              </div>
            </div>

            <div className="hidden sm:block">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block">
                Pháo Thần Công Tin Học
              </span>
              <span className="text-[11px] text-slate-400">
                Góc bắn tối ưu: 45° • Lực bắn: 100%
              </span>
            </div>
          </div>

          {/* Quick Fire Button in Stage */}
          {gameState === 'IDLE' && (
            <button
              onClick={fireCannon}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              BẮN NGAY
            </button>
          )}
        </div>
      </div>

      {/* Victory Hit Modal */}
      {gameState === 'HIT' && selectedWinner && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-sky-950 to-slate-900 border-2 border-amber-400 p-8 shadow-2xl shadow-amber-500/20 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-xl shadow-yellow-500/40">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
                🎯
              </div>
            </div>

            <span className="inline-block mt-4 px-3 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 tracking-wider">
              TRÚNG HỒNG TÂM XUẤT SẮC
            </span>

            <h3 className="text-3xl font-black text-white mt-2">
              {selectedWinner.name}
            </h3>
            <p className="text-sm font-semibold text-sky-300 mt-1">
              Quả bóng đã bắn trúng đích mục tiêu với độ chính xác tuyệt đối!
            </p>

            <div className="my-6 p-4 rounded-2xl bg-sky-900/30 border border-sky-500/30 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Độ chính xác</div>
                <div className="text-lg font-black text-sky-300">100% Điểm 10</div>
              </div>
              <div className="w-px h-8 bg-sky-800" />
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Thưởng thi đua</div>
                <div className="text-lg font-black text-yellow-300">+10 Điểm ⭐</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  const randQ = LESSON_6_QUESTIONS[Math.floor(Math.random() * LESSON_6_QUESTIONS.length)];
                  setCurrentQuestion(randQ);
                  setShowChallengeModal(true);
                  gameAudio.playBell();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <HelpCircle className="w-4 h-4" />
                Thử Thách Bài 6
              </button>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Bắn Lượt Khác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Question Modal */}
      {showChallengeModal && currentQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-sky-500/50 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-bold text-xs">
                  {currentQuestion.id || 'CÂU HỎI'}
                </span>
                <h4 className="text-base font-bold text-white">
                  Thử Thách Dành Cho {selectedWinner?.name}
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
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all"
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
