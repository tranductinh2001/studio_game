import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Play, Pause, RotateCcw, Trophy, Award, Zap, Flag,
  Sparkles, HelpCircle, ArrowRight, CheckCircle, Volume2, VolumeX
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { GAME_STATES, pickRaceWinner, computeRacerProgress } from '../services/gameEngine2D';
import QuestionChallengeModal from '../QuestionChallengeModal';
import StealthWinnerControl from '../StealthWinnerControl';
import { CharacterAvatar } from '../services/characterAvatars';

export default function BoatRaceGame({
  teams = [],
  students = [],
  secretControl = {},
  onUpdateSecretControl,
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  // Game state: 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'FINISHED'
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);
  const [isMuted, setIsMuted] = useState(false);

  // Racer progress array (0 to 100 for each team)
  const [boatProgress, setBoatProgress] = useState([]);
  const trackRef = useRef(null);
  const boatRefs = useRef([]);
  const badgeRefs = useRef([]);

  // Animation & Runtime Refs
  const runtimeRef = useRef({
    rafId: null,
    startTime: 0,
    pausedTime: 0,
    elapsedBeforePause: 0,
    duration: 8500, // 8.5s exciting sprint
    targetWinner: null,
    determinedWinner: null,
    isFinished: false,
    seed: Math.random() * 10
  });

  // Calculate duration from settings (optimal 8.5s - 12s for classroom mini-game excitement)
  const raceDuration = useMemo(() => {
    const durSec = settings?.roundDuration ? Math.min(settings.roundDuration, 12) : 8.5;
    const speed = settings?.gameSpeed || 1.0;
    return (durSec * 1000) / speed;
  }, [settings]);

  // Initialize boats when teams change
  useEffect(() => {
    setBoatProgress(teams.map(() => 0));
    setWinner(null);
    setRankings([]);
    setGameState(GAME_STATES.IDLE);
  }, [teams]);

  // Secret teacher keyboard controls (Keys 1-9 to silently pick winner)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space to Start / Pause
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
      // 'R' to reset
      if ((e.key === 'r' || e.key === 'R') && e.target.tagName !== 'INPUT') {
        resetRace();
      }
      // 1-9 for secret winner rigging
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= teams.length) {
        const target = teams[num - 1];
        if (target) {
          runtimeRef.current.targetWinner = target;
          runtimeRef.current.determinedWinner = target;
          gameAudio.playTick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, teams]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (runtimeRef.current.rafId) {
        cancelAnimationFrame(runtimeRef.current.rafId);
      }
      gameAudio.stopAmbientBGM();
    };
  }, []);

  // -------------------------------------------------------------
  // RACE ENGINE LOGIC
  // -------------------------------------------------------------
  const startCountdown = () => {
    if (gameState === GAME_STATES.COUNTDOWN || gameState === GAME_STATES.PLAYING) return;

    resetRace();
    setGameState(GAME_STATES.COUNTDOWN);
    setCountdown(3);
    gameAudio.playTick();

    // Determine target winner upfront
    const mode = secretControl?.mode || 'fair_random';
    const secretTargetId = secretControl?.targetTeamId;
    const chosenWinner = pickRaceWinner(teams, secretTargetId, mode) || teams[0];
    runtimeRef.current.determinedWinner = chosenWinner;
    runtimeRef.current.seed = Math.random() * 20;

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
    gameAudio.playHorn();
    gameAudio.playAmbientBGM('ocean');

    const rt = runtimeRef.current;
    rt.startTime = performance.now();
    rt.elapsedBeforePause = 0;
    rt.isFinished = false;
    rt.duration = raceDuration;

    // Measure lane travel width
    const trackWidth = trackRef.current ? (trackRef.current.clientWidth * 0.79) : 800;

    // Start 60-120 FPS GPU RAF Loop (Direct DOM update: ZERO React re-renders during race)
    const loop = (timestamp) => {
      const elapsed = (timestamp - rt.startTime) + rt.elapsedBeforePause;
      const normalizedTime = Math.min(elapsed / rt.duration, 1.0);

      const currentProgress = [];
      teams.forEach((team, idx) => {
        const isWinner = team.id === rt.determinedWinner?.id;
        const prog = computeRacerProgress(normalizedTime, idx, teams.length, isWinner, rt.seed + idx * 1.5);
        currentProgress.push(prog);

        const xPx = (prog / 100) * trackWidth;
        const yPx = Math.sin((timestamp * 0.005) + idx * 1.6) * 3;

        if (boatRefs.current[idx]) {
          boatRefs.current[idx].style.transform = `translate3d(${xPx}px, ${yPx}px, 0)`;
        }
        if (badgeRefs.current[idx]) {
          badgeRefs.current[idx].textContent = `${Math.round(prog)}%`;
        }
      });

      if (normalizedTime < 1.0 && !rt.isFinished) {
        rt.rafId = requestAnimationFrame(loop);
      } else if (!rt.isFinished) {
        setBoatProgress(currentProgress);
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

    const trackWidth = trackRef.current ? (trackRef.current.clientWidth * 0.79) : 800;

    const loop = (timestamp) => {
      const elapsed = (timestamp - rt.startTime) + rt.elapsedBeforePause;
      const normalizedTime = Math.min(elapsed / rt.duration, 1.0);

      const currentProgress = [];
      teams.forEach((team, idx) => {
        const isWinner = team.id === rt.determinedWinner?.id;
        const prog = computeRacerProgress(normalizedTime, idx, teams.length, isWinner, rt.seed + idx * 1.5);
        currentProgress.push(prog);

        const xPx = (prog / 100) * trackWidth;
        const yPx = Math.sin((timestamp * 0.005) + idx * 1.6) * 3;

        if (boatRefs.current[idx]) {
          boatRefs.current[idx].style.transform = `translate3d(${xPx}px, ${yPx}px, 0)`;
        }
        if (badgeRefs.current[idx]) {
          badgeRefs.current[idx].textContent = `${Math.round(prog)}%`;
        }
      });

      if (normalizedTime < 1.0 && !rt.isFinished) {
        rt.rafId = requestAnimationFrame(loop);
      } else if (!rt.isFinished) {
        setBoatProgress(currentProgress);
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

    const winTeam = rt.determinedWinner || teams[0];
    setWinner(winTeam);

    // Sort rankings
    const sorted = [...teams].sort((a, b) => {
      if (a.id === winTeam.id) return -1;
      if (b.id === winTeam.id) return 1;
      return 0;
    });
    setRankings(sorted);
    setGameState(GAME_STATES.FINISHED);

    // Save result to history
    if (onRecordResult) {
      onRecordResult('boat-race', {
        winner: winTeam,
        rankings: sorted,
        mode: 'team'
      });
    }

    // Victory confetti celebration
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch (e) { }
  };

  const resetRace = () => {
    const rt = runtimeRef.current;
    if (rt.rafId) cancelAnimationFrame(rt.rafId);
    rt.isFinished = false;
    rt.startTime = 0;
    rt.elapsedBeforePause = 0;
    gameAudio.stopAmbientBGM();
    setBoatProgress(teams.map(() => 0));
    setWinner(null);
    setRankings([]);
    setGameState(GAME_STATES.IDLE);
    gameAudio.playTick();

    // Reset boat positions directly
    teams.forEach((_, idx) => {
      if (boatRefs.current[idx]) {
        boatRefs.current[idx].style.transform = 'translate3d(0px, 0px, 0)';
      }
      if (badgeRefs.current[idx]) {
        badgeRefs.current[idx].textContent = '0%';
      }
    });
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
            ⛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                GAME 01 • 2D CARTOON PREMIUM
              </span>
              <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-indigo-300 uppercase">
                ĐUA THUYỀN VƯỢT SÓNG
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              {teams.length} Thuyền Đua • Vượt Sóng Đại Dương • Về Đích Đoạt Cúp
            </p>
          </div>
        </div>

        {/* Center: Primary Playback Actions */}
        <div className="flex items-center gap-2">
          {gameState === GAME_STATES.IDLE || gameState === GAME_STATES.FINISHED ? (
            <button
              onClick={startCountdown}
              className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
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

        {/* Right: Sound, Question Challenge, Teacher settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={openChallenge}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Câu Hỏi Bài 6</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN 2D CARTOON OCEAN ARENA */}
      <div className="relative flex-1 w-full h-full overflow-hidden">

        {/* Ocean Illustrated Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/games/boat-race/ocean_bg.svg')` }}
        />

        {/* Checkered Finish Line at Right 90% */}
        <div
          className="absolute top-0 bottom-0 right-[8%] w-16 pointer-events-none z-10 opacity-90"
          style={{ backgroundImage: `url('/assets/games/boat-race/finish_line.svg')`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
        />

        {/* Start Line at Left 2.5% */}
        <div className="absolute top-[46%] bottom-4 left-[2.5%] w-1 border-r-4 border-dashed border-cyan-300/60 z-10 pointer-events-none">
          <span className="absolute -top-7 -left-7 px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md uppercase tracking-wider">
            XUẤT PHÁT
          </span>
        </div>

        {/* RACING LANES & BOATS */}
        <div ref={trackRef} className="absolute top-[48%] bottom-4 left-0 right-0 flex flex-col justify-around px-2 z-20">
          <style>{`
            @keyframes oarStrokeFast {
              0%, 100% { transform: rotate(-26deg); }
              50% { transform: rotate(26deg); }
            }
          `}</style>
          {teams.map((team, index) => {
            const prog = boatProgress[index] || 0;
            const isFirst = winner?.id === team.id;

            return (
              <div
                key={team.id}
                className="relative w-full h-14 flex items-center border-b border-cyan-400/15"
              >
                {/* Lane marker badge with Character Avatar */}
                <div
                  className="absolute left-2 flex items-center gap-1 z-10"
                >
                  <CharacterAvatar team={team} index={index} size="sm" />
                </div>

                {/* 2D CARTOON RACING BOAT SPRITE (Pure GPU translate3d) */}
                <div
                  ref={(el) => (boatRefs.current[index] = el)}
                  className="absolute flex items-center will-change-transform"
                  style={{
                    left: '4.8%',
                    transform: `translate3d(${(prog / 100) * (trackRef.current ? trackRef.current.clientWidth * 0.79 : 800)}px, 0px, 0)`
                  }}
                >
                  {/* Floating Team Badge above boat */}
                  <div className="absolute -top-7 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/80 shadow-md backdrop-blur-sm whitespace-nowrap z-20">
                    <CharacterAvatar team={team} index={index} size="xs" />
                    <span className="text-[11px] font-bold text-white">{team.shortName || team.name}</span>
                    <span 
                      ref={(el) => (badgeRefs.current[index] = el)}
                      className="text-[10px] font-mono text-cyan-300 font-bold"
                    >
                      {Math.round(prog)}%
                    </span>
                  </div>

                  {/* Water Splash behind boat when moving */}
                  {gameState === GAME_STATES.PLAYING && (
                    <div className="absolute -left-6 top-4 w-8 h-4 flex items-center pointer-events-none">
                      <div className="w-3 h-2 rounded-full bg-cyan-200/80 animate-ping" />
                      <div className="w-4 h-3 rounded-full bg-white/70 -ml-1 animate-pulse" />
                    </div>
                  )}

                  {/* Cartoon Boat Body (SVG Illustration) */}
                  <svg
                    viewBox="0 0 160 70"
                    className="w-36 h-16 drop-shadow-lg"
                    style={{ filter: isFirst ? 'drop-shadow(0 0 12px #fef08a)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}
                  >
                    <defs>
                      <linearGradient id={`hull_${team.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={team.color || '#0284c7'} />
                        <stop offset="70%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#fef08a" />
                      </linearGradient>
                      <linearGradient id={`wood_${team.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#b45309" />
                        <stop offset="100%" stopColor="#78350f" />
                      </linearGradient>
                    </defs>

                    {/* Boat Water Ripple */}
                    <ellipse cx="75" cy="58" rx="60" ry="8" fill="#38bdf8" opacity="0.45" />

                    {/* Wooden Hull */}
                    <path
                      d="M20 38 L140 38 C148 38 155 46 148 54 C132 58 35 58 18 52 C12 46 15 38 20 38 Z"
                      fill={`url(#hull_${team.id})`}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                    />

                    {/* Wooden Deck Planking */}
                    <line x1="26" y1="42" x2="136" y2="42" stroke={`url(#wood_${team.id})`} strokeWidth="3" />

                    {/* Dragon Bow Head / Sharp prow */}
                    <path d="M142 38 Q155 32 152 24 Q146 28 140 34 Z" fill="#eab308" stroke="#854d0e" strokeWidth="1.5" />

                    {/* Cartoon Rower Student */}
                    <g transform="translate(68, 14)">
                      {/* Student Body */}
                      <circle cx="12" cy="10" r="8" fill="#fed7aa" stroke="#78350f" strokeWidth="1.5" />
                      {/* Cap */}
                      <path d="M4 8 C4 2 20 2 20 8 Z" fill={team.color || '#ef4444'} />
                      <rect x="3" y="7" width="18" height="2" rx="1" fill="#f8fafc" />
                      {/* Eye */}
                      <circle cx="15" cy="9" r="1.5" fill="#0f172a" />
                      {/* Shirt */}
                      <path d="M6 18 L18 18 L20 26 L4 26 Z" fill={team.color || '#2563eb'} />
                      {/* Rowing Oar (Swaying with vigorous rhythm) */}
                      <g 
                        style={{
                          transformOrigin: '12px 24px',
                          animation: gameState === GAME_STATES.PLAYING ? 'oarStrokeFast 0.42s ease-in-out infinite' : 'none'
                        }}
                      >
                        <line x1="12" y1="20" x2="22" y2="42" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                        <ellipse cx="22" cy="42" rx="3.5" ry="6" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                      </g>
                    </g>

                    {/* Team Flag on Stern */}
                    <g transform="translate(22, 10)">
                      <line x1="4" y1="4" x2="4" y2="30" stroke="#475569" strokeWidth="2" />
                      <polygon points="4,4 24,10 4,16" fill={team.color || '#ef4444'} stroke="#991b1b" strokeWidth="1" />
                      <text x="8" y="12" fontSize="6" fontWeight="bold" fill="#ffffff">{team.number || index + 1}</text>
                    </g>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Waves Overlay at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-40 z-20"
          style={{ backgroundImage: `url('/assets/games/boat-race/wave_overlay.svg')`, backgroundRepeat: 'repeat-x', backgroundSize: 'contain' }}
        />

        {/* 3. BIG COUNTDOWN MODAL OVERLAY */}
        {gameState === GAME_STATES.COUNTDOWN && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50 border-4 border-white/80 animate-bounce">
                <span className="text-7xl font-black text-slate-950 font-mono">
                  {countdown}
                </span>
              </div>
              <p className="mt-4 text-xl font-black text-cyan-300 uppercase tracking-widest animate-pulse">
                SẴN SÀNG... VƯỢT SÓNG!
              </p>
            </div>
          </div>
        )}

        {/* 4. VICTORY CELEBRATION MODAL */}
        {gameState === GAME_STATES.FINISHED && winner && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-amber-400/60 p-6 shadow-2xl shadow-amber-500/30 flex flex-col items-center text-center">

              {/* Golden Trophy & Winner Character Avatar */}
              <div className="relative flex items-center justify-center gap-3 mb-3">
                <CharacterAvatar team={winner} size="xl" className="ring-4 ring-amber-400/60 shadow-2xl" />
                <img src="/assets/games/common/trophy_gold.svg" alt="Trophy" className="w-16 h-16 object-contain filter drop-shadow" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest mb-1">
                🏆 CHIẾN THẮNG NGOẠN MỤC
              </span>

              <h2 className="text-2xl font-black text-white mt-1">
                {winner.name}
              </h2>
              <p className="text-xs text-amber-200 mt-1">
                Đã xuất sắc cán đích đầu tiên trong cuộc đua thuyền vượt sóng!
              </p>

              {/* Podium Rankings Table */}
              <div className="w-full mt-4 bg-slate-950/60 rounded-xl border border-slate-800 p-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-left">
                  Bảng Xếp Hạng Lượt Đua:
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {rankings.map((r, i) => (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold ${i === 0
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
                      <span className="text-cyan-400 font-mono">
                        {i === 0 ? 'VỀ ĐÍCH' : `Hạng ${i + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-5 w-full">
                <button
                  onClick={openChallenge}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Thử Thách Bài 6 (+10đ)</span>
                </button>
                <button
                  onClick={startCountdown}
                  className="flex-1 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Đua Lại Lượt Mới</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. QUESTION CHALLENGE MODAL */}
        <QuestionChallengeModal
          isOpen={showChallengeModal}
          question={currentQuestion}
          targetName={winner?.name || 'Đội Chiến Thắng'}
          onClose={() => setShowChallengeModal(false)}
          onConfirmSuccess={() => setShowChallengeModal(false)}
        />

        {/* Stealth Hidden Winner Control (Bottom-left corner) */}
        <StealthWinnerControl
          items={teams}
          secretControl={secretControl}
          onUpdateSecretControl={onUpdateSecretControl}
          onLiveOverrideWinner={(target) => {
            if (target) {
              runtimeRef.current.targetWinner = target;
              runtimeRef.current.determinedWinner = target;
            }
          }}
        />
      </div>
    </div>
  );
}
