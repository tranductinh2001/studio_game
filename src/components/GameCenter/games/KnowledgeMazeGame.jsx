import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, Pause, RotateCcw, Trophy, Award, Zap, 
  HelpCircle, ArrowRight, CheckCircle, Volume2, VolumeX, Shield, Key, Lock, Unlock
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { GAME_STATES } from '../services/gameEngine2D';
import QuestionChallengeModal from '../QuestionChallengeModal';

const MAZE_GATES = [
  { step: 1, title: 'Cổng 1: Mạng WWW', hint: 'Khái niệm WWW & Siêu văn bản' },
  { step: 2, title: 'Cổng 2: Trình Duyệt', hint: 'Vai trò của Web Browser' },
  { step: 3, title: 'Cổng 3: Siêu Liên Kết', hint: 'Đường dẫn Hyperlink' },
  { step: 4, title: 'Cổng 4: Tìm Kiếm', hint: 'Công cụ tra cứu thông tin' }
];

export default function KnowledgeMazeGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [currentStep, setCurrentStep] = useState(0); // 0 to 5
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);
  const [winner, setWinner] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const activeTeam = teams[currentTeamIndex] || teams[0];

  useEffect(() => {
    resetMaze();
  }, [teams]);

  const advanceStep = () => {
    if (currentStep >= 5) return;

    gameAudio.playBoost();
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    if (nextStep >= 5) {
      gameAudio.playFanfare();
      setWinner(activeTeam);
      setGameState(GAME_STATES.FINISHED);

      if (onRecordResult) {
        onRecordResult('knowledge-maze', {
          team: activeTeam,
          stepsCompleted: 5
        });
      }

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else {
      // Trigger question at gate
      const q = LESSON_6_QUESTIONS[(nextStep - 1) % LESSON_6_QUESTIONS.length];
      setCurrentQuestion(q);
      setShowQuestionModal(true);
    }
  };

  const resetMaze = () => {
    setCurrentStep(0);
    setWinner(null);
    setShowQuestionModal(false);
    setGameState(GAME_STATES.IDLE);
    gameAudio.playTick();
  };

  const toggleSound = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-white select-none overflow-hidden font-sans">
      
      {/* 1. TOP CONTROL BAR */}
      <div className="flex-none h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-30 backdrop-blur-md">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
            🧭
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                GAME 07 • 2D CARTOON PREMIUM
              </span>
              <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-100 to-indigo-300 uppercase">
                MÊ CUNG TRI THỨC
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              5 Trạm Thử Thách • Mở Khóa Cửa Thần Kỳ • Đoạt Rương Báu
            </p>
          </div>
        </div>

        {/* Center: Team Selector */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-bold">Đội Thám Hiểm:</span>
          <select
            value={currentTeamIndex}
            onChange={(e) => {
              setCurrentTeamIndex(Number(e.target.value));
              resetMaze();
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-amber-300 font-black text-xs outline-none"
          >
            {teams.map((t, idx) => (
              <option key={t.id} value={idx}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={advanceStep}
            disabled={currentStep >= 5}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 text-slate-950 shadow flex items-center gap-1.5 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>TIẾN 1 BƯỚC (RUN)</span>
          </button>

          <button
            onClick={resetMaze}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>LÀM LẠI</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN 2D CARTOON MAZE MAP */}
      <div className="relative flex-1 w-full h-full flex flex-col justify-center px-12 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950">
        
        {/* Ancient Stone Floor / Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Connecting Pathway Line */}
        <div className="relative w-full flex items-center justify-between">
          
          {/* Dynamic Hopping Pawn Adventurer */}
          <div 
            className="absolute -top-16 z-30 flex flex-col items-center pointer-events-none transition-all duration-700 [transition-timing-function:cubic-bezier(0.34,1.4,0.64,1)] will-change-[left,transform] -translate-x-1/2"
            style={{
              left: `calc(${Math.min(currentStep, 5) * 20}% + 32px)`
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 border-2 border-white flex items-center justify-center text-2xl shadow-xl shadow-cyan-500/50 animate-bounce">
              {activeTeam?.icon || '🧙'}
            </div>
            <span className="mt-0.5 px-2 py-0.5 rounded text-[9px] font-black bg-cyan-500 text-slate-950 shadow whitespace-nowrap">
              {activeTeam?.shortName}
            </span>
          </div>

          <div className="absolute left-[5%] right-[5%] h-3 bg-slate-800 rounded-full border border-amber-500/30 -z-0">
            {/* Progress filled bar */}
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_#f59e0b]"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>

          {/* Node 0: VẠCH XUẤT PHÁT */}
          <div className="relative flex flex-col items-center z-10 w-24">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xs font-black border-2 transition-all ${
              currentStep === 0 
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 border-white text-slate-950 shadow-lg shadow-cyan-500/40 scale-105' 
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              START
            </div>
            <span className="mt-2.5 text-xs font-black text-cyan-300 text-center">
              Xuất Phát
            </span>
            <span className="text-[10px] text-slate-400 text-center">
              Bắt đầu
            </span>
          </div>

          {/* 4 Checkpoint Gates */}
          {MAZE_GATES.map((gate, i) => {
            const isReached = currentStep >= gate.step;
            const isCurrent = currentStep === gate.step - 1;

            return (
              <div 
                key={gate.step}
                className="relative flex flex-col items-center z-10 w-28 text-center"
              >
                {/* Gate Badge Circle */}
                <div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black border-2 transition-all duration-300 ${
                    isReached 
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-white text-slate-950 shadow-lg shadow-emerald-500/50 scale-105' 
                      : isCurrent
                        ? 'bg-gradient-to-tr from-amber-400 to-orange-500 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/50'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {isReached ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
                </div>

                {/* Gate Title & Hint */}
                <span className="mt-2.5 text-xs font-black text-white text-center leading-tight">
                  {gate.title}
                </span>
                <span className="text-[10px] text-amber-300/90 text-center leading-snug mt-0.5">
                  {gate.hint}
                </span>
              </div>
            );
          })}

          {/* Treasure Chest at End (Gate 5) */}
          <div className="relative flex flex-col items-center z-10 w-24">
            <div className={`w-16 h-16 flex items-center justify-center transition-transform ${currentStep >= 5 ? 'scale-125 filter drop-shadow-[0_0_20px_#fef08a]' : 'opacity-80'}`}>
              <img 
                src="/assets/games/knowledge-maze/treasure_chest.svg" 
                alt="Treasure Chest" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="mt-2.5 text-xs font-black text-amber-300 uppercase tracking-wider text-center">
              KHO BÁU
            </span>
            <span className="text-[10px] text-amber-400/90 text-center">
              Đích đến
            </span>
          </div>
        </div>

        {/* 3. QUESTION CHALLENGE MODAL AT GATE */}
        <QuestionChallengeModal
          isOpen={showQuestionModal}
          question={currentQuestion}
          targetName={`Cửa ải số ${currentStep} • ${activeTeam?.name}`}
          onClose={() => setShowQuestionModal(false)}
          onConfirmSuccess={() => {
            setShowQuestionModal(false);
          }}
        />

        {/* 4. VICTORY REVEAL MODAL */}
        {gameState === GAME_STATES.FINISHED && winner && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-amber-400/60 p-6 shadow-2xl shadow-amber-500/30 flex flex-col items-center text-center">
              
              <div className="w-24 h-24 mb-2">
                <img src="/assets/games/knowledge-maze/treasure_chest.svg" alt="Treasure" className="w-full h-full object-contain filter drop-shadow" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest mb-1">
                🏆 MỞ KHÓA TOÀN BỘ MÊ CUNG
              </span>

              <h2 className="text-2xl font-black text-white mt-1">
                {winner.name}
              </h2>
              <p className="text-xs text-amber-200 mt-1">
                Đã giải mã xuất sắc 5 thử thách và mở thành công Rương Kho Báu Tri Thức Bài 6!
              </p>

              <button
                onClick={resetMaze}
                className="mt-6 w-full py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 text-slate-950 shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chinh Phục Lại Mê Cung</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
