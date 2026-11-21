import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, Pause, RotateCcw, Trophy, Award, Zap, 
  HelpCircle, ArrowRight, CheckCircle, Volume2, VolumeX, Sparkles
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { GAME_STATES, pickRaceWinner, computeRacerProgress } from '../services/gameEngine2D';
import QuestionChallengeModal from '../QuestionChallengeModal';

// Fun duck accessories based on lane index
const DUCK_ACCESSORIES = [
  { name: 'Thuyền Trưởng', hat: '⚓', hatColor: '#1e3a8a', label: 'Captain' },
  { name: 'Kính Ngầu', hat: '🕶️', hatColor: '#0f172a', label: 'Cool Shades' },
  { name: 'DJ Tai Nghe', hat: '🎧', hatColor: '#9333ea', label: 'DJ Beats' },
  { name: 'Nơ Đỏ', hat: '🎀', hatColor: '#ef4444', label: 'Red Bow' },
  { name: 'Vương Miện', hat: '👑', hatColor: '#eab308', label: 'Crown' },
  { name: 'Hải Tặc', hat: '🏴‍☠️', hatColor: '#b91c1c', label: 'Pirate' },
  { name: 'Mũ Phù Thủy', hat: '🧙', hatColor: '#6366f1', label: 'Wizard' },
  { name: 'Mũ Ninja', hat: '🥷', hatColor: '#1c1917', label: 'Ninja' }
];

export default function DuckRaceGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);
  const [isMuted, setIsMuted] = useState(false);

  // Racer progress array (0 to 100 for each participant)
  const [duckProgress, setDuckProgress] = useState([]);

  // Mode: 'team' or 'individual'
  const isIndividual = settings?.gameMode === 'individual';
  const participants = useMemo(() => {
    if (isIndividual && students.length > 0) {
      return students.slice(0, 8); // Top 8 students for clean river lanes
    }
    return teams;
  }, [isIndividual, students, teams]);

  // Animation & Runtime Refs
  const runtimeRef = useRef({
    rafId: null,
    startTime: 0,
    pausedTime: 0,
    elapsedBeforePause: 0,
    duration: 18000, // 18s default round
    targetWinner: null,
    determinedWinner: null,
    isFinished: false,
    seed: Math.random() * 15
  });

  const raceDuration = useMemo(() => {
    const durSec = settings?.roundDuration || 18;
    const speed = settings?.gameSpeed || 1.0;
    return (durSec * 1000) / speed;
  }, [settings]);

  // Reset progress when participants change
  useEffect(() => {
    setDuckProgress(participants.map(() => 0));
    setWinner(null);
    setRankings([]);
    setGameState(GAME_STATES.IDLE);
  }, [participants]);

  // Keyboard shortcut 1-9 for secret winner rigging & Space for start/pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (gameState === GAME_STATES.IDLE || gameState === GAME_STATES.FINISHED) {
          startCountdown();
        } else if (gameState === GAME_STATES.PLAYING) {
          pauseRace();
        } else if (gameState === GAME_STATES.PAUSED) {
          resumeRace();
        }
      }
      if ((e.key === 'r' || e.key === 'R') && e.target.tagName !== 'INPUT') {
        resetRace();
      }
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= participants.length) {
        const target = participants[num - 1];
        if (target) {
          runtimeRef.current.targetWinner = target;
          runtimeRef.current.determinedWinner = target;
          gameAudio.playTick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, participants]);

  useEffect(() => {
    return () => {
      if (runtimeRef.current.rafId) {
        cancelAnimationFrame(runtimeRef.current.rafId);
      }
      gameAudio.stopAmbientBGM();
    };
  }, []);

  // -------------------------------------------------------------
  // DUCK RACE ENGINE
  // -------------------------------------------------------------
  const startCountdown = () => {
    if (gameState === GAME_STATES.COUNTDOWN || gameState === GAME_STATES.PLAYING) return;

    resetRace();
    setGameState(GAME_STATES.COUNTDOWN);
    setCountdown(3);
    gameAudio.playTick();

    const mode = secretControl?.mode || 'fair_random';
    const secretTargetId = isIndividual ? secretControl?.targetStudentId : secretControl?.targetTeamId;
    const chosenWinner = pickRaceWinner(participants, secretTargetId, mode) || participants[0];
    runtimeRef.current.determinedWinner = chosenWinner;
    runtimeRef.current.seed = Math.random() * 25;

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        gameAudio.playTick();
      } else {
        clearInterval(interval);
        launchRace();
      }
    }, 800);
  };

  const launchRace = () => {
    setGameState(GAME_STATES.PLAYING);
    gameAudio.playWhistle();
    gameAudio.playSplash();
    gameAudio.playAmbientBGM('ocean');

    const rt = runtimeRef.current;
    rt.startTime = performance.now();
    rt.elapsedBeforePause = 0;
    rt.isFinished = false;
    rt.duration = raceDuration;

    const loop = (timestamp) => {
      const elapsed = (timestamp - rt.startTime) + rt.elapsedBeforePause;
      const normalizedTime = Math.min(elapsed / rt.duration, 1.0);

      const newProgress = participants.map((item, idx) => {
        const isWinner = item.id === rt.determinedWinner?.id;
        return computeRacerProgress(normalizedTime, idx, participants.length, isWinner, rt.seed + idx * 2.1);
      });

      setDuckProgress(newProgress);

      if (normalizedTime < 1.0 && !rt.isFinished) {
        rt.rafId = requestAnimationFrame(loop);
      } else if (!rt.isFinished) {
        finishRace();
      }
    };

    rt.rafId = requestAnimationFrame(loop);
  };

  const pauseRace = () => {
    if (gameState !== GAME_STATES.PLAYING) return;
    const rt = runtimeRef.current;
    cancelAnimationFrame(rt.rafId);
    rt.pausedTime = performance.now();
    rt.elapsedBeforePause += (rt.pausedTime - rt.startTime);
    setGameState(GAME_STATES.PAUSED);
    gameAudio.playTick();
  };

  const resumeRace = () => {
    if (gameState !== GAME_STATES.PAUSED) return;
    const rt = runtimeRef.current;
    rt.startTime = performance.now();
    setGameState(GAME_STATES.PLAYING);
    gameAudio.playTick();

    const loop = (timestamp) => {
      const elapsed = (timestamp - rt.startTime) + rt.elapsedBeforePause;
      const normalizedTime = Math.min(elapsed / rt.duration, 1.0);

      const newProgress = participants.map((item, idx) => {
        const isWinner = item.id === rt.determinedWinner?.id;
        return computeRacerProgress(normalizedTime, idx, participants.length, isWinner, rt.seed + idx * 2.1);
      });

      setDuckProgress(newProgress);

      if (normalizedTime < 1.0 && !rt.isFinished) {
        rt.rafId = requestAnimationFrame(loop);
      } else if (!rt.isFinished) {
        finishRace();
      }
    };

    rt.rafId = requestAnimationFrame(loop);
  };

  const finishRace = () => {
    const rt = runtimeRef.current;
    rt.isFinished = true;
    cancelAnimationFrame(rt.rafId);
    gameAudio.stopAmbientBGM();
    gameAudio.playFanfare();

    const winItem = rt.determinedWinner || participants[0];
    setWinner(winItem);

    const sorted = [...participants].sort((a, b) => {
      if (a.id === winItem.id) return -1;
      if (b.id === winItem.id) return 1;
      return 0;
    });
    setRankings(sorted);
    setGameState(GAME_STATES.FINISHED);

    if (onRecordResult) {
      onRecordResult('duck-race', {
        winner: winItem,
        rankings: sorted,
        mode: isIndividual ? 'individual' : 'team'
      });
    }

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const resetRace = () => {
    const rt = runtimeRef.current;
    if (rt.rafId) cancelAnimationFrame(rt.rafId);
    rt.isFinished = false;
    rt.startTime = 0;
    rt.elapsedBeforePause = 0;
    gameAudio.stopAmbientBGM();
    setDuckProgress(participants.map(() => 0));
    setWinner(null);
    setRankings([]);
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
        
        {/* Left: Game Title Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
            🦆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                GAME 02 • 2D CARTOON PREMIUM
              </span>
              <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-orange-300 uppercase">
                ĐUA VỊT VUI NHỘN
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              {participants.length} Chú Vịt Siêu Quậy • Bơi Vượt Suối • Quẫy Nước Về Đích
            </p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-2">
          {gameState === GAME_STATES.IDLE || gameState === GAME_STATES.FINISHED ? (
            <button
              onClick={startCountdown}
              className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>BẮT ĐẦU ĐUA (RUN)</span>
            </button>
          ) : gameState === GAME_STATES.PLAYING ? (
            <button
              onClick={pauseRace}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-1.5 transition-all"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>TẠM DỪNG</span>
            </button>
          ) : gameState === GAME_STATES.PAUSED ? (
            <button
              onClick={resumeRace}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md flex items-center gap-1.5 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>TIẾP TỤC</span>
            </button>
          ) : null}

          <button
            onClick={resetRace}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
            title="Khởi tạo lại lượt đua (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>LÀM LẠI</span>
          </button>
        </div>

        {/* Right: Challenge, Sound & Mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={openChallenge}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Thử Thách Bài 6</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN 2D CARTOON RIVER ARENA */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* River Background with Grassy Shorelines & Wooden Finish Bridge */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/games/duck-race/river_bg.svg')` }}
        />

        {/* Start Line at Left 4% */}
        <div className="absolute top-[18%] bottom-[18%] left-[3%] w-1 border-r-4 border-dashed border-amber-300/60 z-10 pointer-events-none">
          <span className="absolute -top-6 -left-3 px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950 shadow">
            XUẤT PHÁT
          </span>
        </div>

        {/* RACING LANES & DUCKS */}
        <div className="absolute top-[18%] bottom-[18%] left-0 right-0 flex flex-col justify-around px-2 z-20">
          {participants.map((item, index) => {
            const prog = duckProgress[index] || 0;
            // Map 0 -> 100 progress to left margin percentage (3% to 83%)
            const leftPercent = 3 + (prog / 100) * 80;
            const isFirst = winner?.id === item.id;
            const accessory = DUCK_ACCESSORIES[index % DUCK_ACCESSORIES.length];

            return (
              <div 
                key={item.id}
                className="relative w-full h-14 flex items-center border-b border-sky-400/20"
              >
                {/* Lane marker badge */}
                <div 
                  className="absolute left-2 w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shadow"
                  style={{ backgroundColor: item.color || '#f59e0b', color: '#fff' }}
                >
                  {item.number || index + 1}
                </div>

                {/* 2D CARTOON DUCK SPRITE */}
                <div 
                  className="absolute flex items-center transition-all duration-75"
                  style={{
                    left: `${leftPercent}%`,
                    transform: `translateY(${Math.sin((prog + index * 30) * 0.15) * 4}px) rotate(${gameState === GAME_STATES.PLAYING ? Math.sin(prog * 0.3) * 6 : 0}deg)`
                  }}
                >
                  {/* Floating Team / Student Badge above duck */}
                  <div className="absolute -top-7 left-1 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/80 shadow-md backdrop-blur-sm whitespace-nowrap z-20">
                    <span className="text-xs">{item.avatar || accessory.hat}</span>
                    <span className="text-[11px] font-bold text-white">{item.shortName || item.name}</span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">{Math.round(prog)}%</span>
                  </div>

                  {/* Water Splash & Wake Droplets behind duck */}
                  {gameState === GAME_STATES.PLAYING && prog > 2 && (
                    <div className="absolute -left-6 top-3 flex items-center">
                      <div className="w-3 h-2 rounded-full bg-white/80 animate-ping" />
                      <div className="w-5 h-3 rounded-full bg-cyan-200/60 -ml-1 animate-pulse" />
                    </div>
                  )}

                  {/* Duck Illustration (SVG) */}
                  <div 
                    className="relative w-28 h-16"
                    style={{ filter: isFirst ? 'drop-shadow(0 0 12px #fef08a)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))' }}
                  >
                    <img 
                      src="/assets/games/duck-race/duck_base.svg" 
                      alt="Duck" 
                      className="w-full h-full object-contain"
                    />

                    {/* Custom Accessory on Duck Head */}
                    <div className="absolute top-1 right-3 text-lg filter drop-shadow">
                      {accessory.hat}
                    </div>

                    {/* Team Color Neck Scarf Ribbon */}
                    <div 
                      className="absolute top-7 right-7 w-4 h-2 rounded-full shadow"
                      style={{ backgroundColor: item.color || '#ef4444' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. COUNTDOWN MODAL */}
        {gameState === GAME_STATES.COUNTDOWN && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-2xl shadow-amber-500/50 border-4 border-white/80 animate-bounce">
                <span className="text-7xl font-black text-slate-950 font-mono">
                  {countdown}
                </span>
              </div>
              <p className="mt-4 text-xl font-black text-amber-300 uppercase tracking-widest animate-pulse">
                SẴN SÀNG... VỊT BƠI TUNG TĂNG!
              </p>
            </div>
          </div>
        )}

        {/* 4. VICTORY CELEBRATION MODAL */}
        {gameState === GAME_STATES.FINISHED && winner && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-amber-400/60 p-6 shadow-2xl shadow-amber-500/30 flex flex-col items-center text-center">
              
              <div className="w-24 h-24 mb-3">
                <img src="/assets/games/common/trophy_gold.svg" alt="Trophy" className="w-full h-full object-contain filter drop-shadow" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest mb-1">
                🦆 VỊT VÀNG SIÊU TỐC VỀ ĐÍCH!
              </span>

              <h2 className="text-2xl font-black text-white mt-1">
                {winner.name}
              </h2>
              <p className="text-xs text-amber-200 mt-1">
                Đã quẫy chân té nước siêu tốc và cán đích vinh quang tại cầu gỗ!
              </p>

              {/* Podium Rankings Table */}
              <div className="w-full mt-4 bg-slate-950/60 rounded-xl border border-slate-800 p-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-left">
                  Bảng Xếp Hạng Vịt Về Đích:
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {rankings.map((r, i) => (
                    <div 
                      key={r.id}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold ${
                        i === 0 
                          ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300' 
                          : 'bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                        </span>
                        <span>{r.name}</span>
                      </div>
                      <span className="text-amber-400 font-mono">
                        {i === 0 ? 'QUÁN QUÂN' : `Hạng ${i + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-5 w-full">
                <button
                  onClick={openChallenge}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Thử Thách Bài 6 (+10đ)</span>
                </button>
                <button
                  onClick={startCountdown}
                  className="flex-1 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi Lại Lượt Mới</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. QUESTION CHALLENGE MODAL */}
        <QuestionChallengeModal
          isOpen={showChallengeModal}
          question={currentQuestion}
          targetName={winner?.name || 'Vịt Về Đích'}
          onClose={() => setShowChallengeModal(false)}
          onConfirmSuccess={() => setShowChallengeModal(false)}
        />
      </div>
    </div>
  );
}
