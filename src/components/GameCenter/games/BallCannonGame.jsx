import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, RotateCcw, Trophy, Award, Zap, 
  HelpCircle, CheckCircle, Volume2, VolumeX, Target, Sparkles
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { GAME_STATES } from '../services/gameEngine2D';
import QuestionChallengeModal from '../QuestionChallengeModal';
import StealthWinnerControl from '../StealthWinnerControl';
import { CharacterAvatar } from '../services/characterAvatars';

const TARGET_ZONES = [
  { score: 100, label: 'TÂM VÀNG (100 PTS)', ring: 'Tâm Vàng', color: '#facc15' },
  { score: 50, label: 'VÒNG ĐỎ (50 PTS)', ring: 'Vòng Đỏ', color: '#ef4444' },
  { score: 20, label: 'VÒNG XANH (20 PTS)', ring: 'Vòng Xanh', color: '#0ea5e9' },
  { score: 10, label: 'VÒNG NGOÀI (10 PTS)', ring: 'Vòng Ngoài', color: '#64748b' }
];

export default function BallCannonGame({
  teams = [],
  students = [],
  secretControl = {},
  onUpdateSecretControl,
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [scoreTally, setScoreTally] = useState(0);
  const [lastHit, setLastHit] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);
  const [recoiling, setRecoiling] = useState(false);

  const arenaRef = useRef(null);
  const cannonRef = useRef(null);
  const targetRef = useRef(null);
  const ballRef = useRef(null);

  // Ball flight physics state
  const [ballState, setBallState] = useState({
    flying: false,
    x: 120,
    y: 400,
    scale: 1,
    impact: false
  });

  const activeTeam = teams[selectedTeamIndex] || teams[0];

  // Keyboard shortcut Space to Shoot
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (gameState !== GAME_STATES.PLAYING) {
          fireCannon();
        }
      }
      if ((e.key === 'r' || e.key === 'R') && e.target.tagName !== 'INPUT') {
        resetGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeTeam]);

  // -------------------------------------------------------------
  // CANNON FIRE & PARABOLIC BALL FLIGHT LOGIC (GPU Direct DOM)
  // -------------------------------------------------------------
  const fireCannon = () => {
    if (gameState === GAME_STATES.PLAYING) return;

    setGameState(GAME_STATES.PLAYING);
    setLastHit(null);
    setRecoiling(true);
    setTimeout(() => setRecoiling(false), 350);

    gameAudio.playHorn();
    gameAudio.playPop();

    // Determine target hit: Teacher rigged or random
    const modeRig = secretControl?.mode || 'fair_random';
    let chosenZone = TARGET_ZONES[Math.floor(Math.random() * TARGET_ZONES.length)];
    if (modeRig === 'teacher_rigged') {
      chosenZone = TARGET_ZONES[0]; // 100 PTS Bullseye!
    }

    const containerRect = arenaRef.current?.getBoundingClientRect();
    const cannonRect = cannonRef.current?.getBoundingClientRect();
    const targetRect = targetRef.current?.getBoundingClientRect();

    let startX = 140;
    let startY = 320;
    let endX = 750;
    let endY = 260;

    if (containerRect && cannonRect && targetRect) {
      startX = cannonRect.right - containerRect.left - 20;
      startY = cannonRect.top - containerRect.top + 35;
      endX = targetRect.left - containerRect.left + targetRect.width * 0.45;
      const yOffset = chosenZone.score === 100 ? 0.45 : (chosenZone.score === 50 ? 0.35 : 0.60);
      endY = targetRect.top - containerRect.top + targetRect.height * yOffset;
    }

    if (ballRef.current) {
      ballRef.current.style.display = 'block';
      ballRef.current.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(1)`;
    }

    const startTime = performance.now();
    const flightDuration = 850; // 0.85s snappy flight

    const animateFlight = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / flightDuration, 1.0);

      // Smooth parabolic flight
      const currentX = startX + (endX - startX) * progress;
      const linearY = startY + (endY - startY) * progress;
      const arcHeight = 160 * Math.sin(progress * Math.PI);
      const currentY = linearY - arcHeight;
      const scale = 1.0 - progress * 0.35;

      if (ballRef.current) {
        ballRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${scale})`;
      }

      if (progress < 1.0) {
        requestAnimationFrame(animateFlight);
      } else {
        // Impact!
        if (ballRef.current) {
          ballRef.current.style.display = 'none';
        }
        gameAudio.playBoost();
        gameAudio.playFanfare();
        setBallState(prev => ({ ...prev, flying: false, impact: true }));
        setLastHit(chosenZone);
        setScoreTally(prev => prev + chosenZone.score);
        setGameState(GAME_STATES.FINISHED);

        if (onRecordResult) {
          onRecordResult('ball-cannon', {
            team: activeTeam,
            score: chosenZone.score
          });
        }

        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { x: 0.75, y: 0.4 }
          });
        } catch (e) {}
      }
    };

    requestAnimationFrame(animateFlight);
  };

  const resetGame = () => {
    if (ballRef.current) {
      ballRef.current.style.display = 'none';
    }
    setBallState({ flying: false, x: 120, y: 400, scale: 1, impact: false });
    setLastHit(null);
    setGameState(GAME_STATES.IDLE);
    gameAudio.playTick();
  };

  const toggleSound = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
  };

  const openChallenge = () => {
    const randomQ = LESSON_6_QUESTIONS[Math.floor(Math.random() * LESSON_6_QUESTIONS.length)];
    setCurrentQuestion(randomQ);
    setShowChallengeModal(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-white select-none overflow-hidden font-sans">
      
      {/* 1. TOP CONTROL BAR */}
      <div className="flex-none h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-30 backdrop-blur-md">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                GAME 08 • 2D CARTOON PREMIUM
              </span>
              <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-100 to-rose-300 uppercase">
                BẮN BÓNG TRÚNG ĐÍCH
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              Pháo Thần Công • Quỹ Đạo Parabol Chuẩn Xác • Điểm Thưởng Tâm Vàng 100
            </p>
          </div>
        </div>

        {/* Center: Team & Score Tally */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-bold">Đội Bắn:</span>
          <select
            value={selectedTeamIndex}
            onChange={(e) => setSelectedTeamIndex(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-amber-300 font-black text-xs outline-none"
          >
            {teams.map((t, idx) => (
              <option key={t.id} value={idx}>{t.name}</option>
            ))}
          </select>
          <div className="border-l border-slate-700 pl-3 flex items-center gap-1.5">
            <span className="text-slate-400">Tổng điểm:</span>
            <span className="font-mono text-amber-400 font-black text-sm">{scoreTally} PTS</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={fireCannon}
            disabled={gameState === GAME_STATES.PLAYING}
            className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 text-slate-950 shadow-lg flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>BẮN BÓNG (RUN)</span>
          </button>

          <button
            onClick={resetGame}
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

      {/* 2. MAIN 2D CARTOON CARNIVAL ARENA */}
      <div ref={arenaRef} className="relative flex-1 w-full h-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950 flex items-center justify-between px-16">
        <style>{`
          @keyframes cannonRecoilAnim {
            0% { transform: scale(1) translateX(0); }
            30% { transform: scale(1.06, 0.94) translateX(-16px) rotate(-4deg); }
            100% { transform: scale(1) translateX(0); }
          }
        `}</style>

        {/* Carnival Striped Backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent" />

        {/* LEFT: Cartoon Brass Cannon & Shooter Character */}
        <div 
          ref={cannonRef}
          className="relative z-10 flex flex-col items-center"
          style={recoiling ? { animation: 'cannonRecoilAnim 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28)' } : {}}
        >
          <div className="relative w-48 h-36 flex items-center">
            <CharacterAvatar
              team={activeTeam}
              index={selectedTeamIndex}
              size="lg"
              className="absolute -left-4 bottom-2 z-20 ring-2 ring-amber-300 shadow-xl"
            />
            <img 
              src="/assets/games/ball-cannon/cannon.svg" 
              alt="Cannon" 
              className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
            />
          </div>
          <span className="mt-2 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/30">
            {activeTeam?.name}
          </span>
        </div>

        {/* FLYING CARTOON BALL (Direct GPU transform) */}
        <div 
          ref={ballRef}
          className="absolute z-20 pointer-events-none will-change-transform hidden"
          style={{
            left: 0,
            top: 0,
            transform: 'translate3d(0px, 0px, 0) scale(1)'
          }}
        >
          {/* Cannonball with fire trail */}
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 via-slate-700 to-amber-300 border-2 border-white shadow-xl shadow-amber-500/50" />
            <div className="absolute -left-4 w-6 h-3 rounded-full bg-orange-500/80 blur-sm animate-ping" />
          </div>
        </div>

        {/* RIGHT: Concentric Target Board */}
        <div ref={targetRef} className="relative z-10 flex flex-col items-center">
          <div className={`w-64 h-64 transition-transform ${ballState.impact ? 'scale-110 animate-bounce' : ''}`}>
            <img 
              src="/assets/games/ball-cannon/target_board.svg" 
              alt="Target Board" 
              className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Hit Result Badge */}
          {lastHit && (
            <div className="mt-4 px-4 py-1.5 rounded-xl text-sm font-black bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 animate-pulse">
              +{lastHit.score} ĐIỂM ({lastHit.label})!
            </div>
          )}
        </div>

        {/* 3. VICTORY / HIT CELEBRATION MODAL */}
        {gameState === GAME_STATES.FINISHED && lastHit && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-amber-400/60 p-6 shadow-2xl shadow-amber-500/30 flex flex-col items-center text-center">
              
              <div className="flex items-center justify-center gap-3 mb-2">
                <CharacterAvatar team={activeTeam} index={selectedTeamIndex} size="xl" className="ring-4 ring-amber-400/60 shadow-xl" />
                <img src="/assets/games/common/trophy_gold.svg" alt="Trophy" className="w-16 h-16 object-contain filter drop-shadow" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest mb-1">
                🎯 BẮN TRÚNG MỤC TIÊU!
              </span>

              <h2 className="text-3xl font-black text-amber-300 mt-1">
                +{lastHit.score} ĐIỂM
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {activeTeam?.name} đã bắn bóng chính xác vào {lastHit.label}!
              </p>

              <div className="flex items-center gap-3 mt-5 w-full">
                <button
                  onClick={openChallenge}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Câu Hỏi Bài 6 (+10đ)</span>
                </button>
                <button
                  onClick={fireCannon}
                  className="flex-1 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 text-slate-950 shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Bắn Lượt Tiếp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. QUESTION CHALLENGE MODAL */}
        <QuestionChallengeModal
          isOpen={showChallengeModal}
          question={currentQuestion}
          targetName={activeTeam?.name || 'Đội Bắn Pháo'}
          onClose={() => setShowChallengeModal(false)}
          onConfirmSuccess={() => setShowChallengeModal(false)}
        />

        {/* Stealth Hidden Winner Control */}
        <StealthWinnerControl
          items={teams}
          secretControl={secretControl}
          onUpdateSecretControl={onUpdateSecretControl}
          onLiveOverrideWinner={(target) => {
            if (target) {
              const idx = teams.findIndex((t) => t.id === target.id);
              if (idx !== -1) setSelectedTeamIndex(idx);
            }
          }}
        />
      </div>
    </div>
  );
}
