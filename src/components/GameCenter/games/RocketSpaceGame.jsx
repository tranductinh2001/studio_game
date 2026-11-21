import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, Pause, RotateCcw, Trophy, Award, Zap, 
  HelpCircle, CheckCircle, Volume2, VolumeX, Rocket
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { GAME_STATES, pickRaceWinner, computeRacerProgress } from '../services/gameEngine2D';
import QuestionChallengeModal from '../QuestionChallengeModal';

export default function RocketSpaceGame({
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
  const [rocketProgress, setRocketProgress] = useState([]);
  const trackRef = useRef(null);
  const rocketRefs = useRef([]);
  const badgeRefs = useRef([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);
  const [isMuted, setIsMuted] = useState(false);

  const runtimeRef = useRef({
    rafId: null,
    startTime: 0,
    pausedTime: 0,
    elapsedBeforePause: 0,
    duration: 8500, // 8.5s fast exciting space race
    targetWinner: null,
    determinedWinner: null,
    isFinished: false,
    seed: Math.random() * 20
  });

  const raceDuration = useMemo(() => {
    const durSec = settings?.roundDuration ? Math.min(settings.roundDuration, 12) : 8.5;
    const speed = settings?.gameSpeed || 1.0;
    return (durSec * 1000) / speed;
  }, [settings]);

  useEffect(() => {
    setRocketProgress(teams.map(() => 0));
    setWinner(null);
    setRankings([]);
    setGameState(GAME_STATES.IDLE);
  }, [teams]);

  // Keyboard shortcut Space to start/pause, 1-9 to rig winner
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

  useEffect(() => {
    return () => {
      if (runtimeRef.current.rafId) {
        cancelAnimationFrame(runtimeRef.current.rafId);
      }
      gameAudio.stopAmbientBGM();
    };
  }, []);

  const startCountdown = () => {
    if (gameState === GAME_STATES.COUNTDOWN || gameState === GAME_STATES.PLAYING) return;

    resetRace();
    setGameState(GAME_STATES.COUNTDOWN);
    setCountdown(3);
    gameAudio.playTick();

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
    gameAudio.playBoost();
    gameAudio.playAmbientBGM('space');

    const rt = runtimeRef.current;
    rt.startTime = performance.now();
    rt.elapsedBeforePause = 0;
    rt.isFinished = false;
    rt.duration = raceDuration;

    // Measure lane travel width
    const trackWidth = trackRef.current ? (trackRef.current.clientWidth * 0.81) : 800;

    // Start 60-120 FPS GPU RAF Loop (Direct DOM update: ZERO React re-renders during race)
    const loop = (timestamp) => {
      const elapsed = (timestamp - rt.startTime) + rt.elapsedBeforePause;
      const normalizedTime = Math.min(elapsed / rt.duration, 1.0);

      const currentProgress = [];
      teams.forEach((team, idx) => {
        const isWinner = team.id === rt.determinedWinner?.id;
        const prog = computeRacerProgress(normalizedTime, idx, teams.length, isWinner, rt.seed + idx * 1.8);
        currentProgress.push(prog);

        const xPx = (prog / 100) * trackWidth;
        const yPx = Math.sin((timestamp * 0.005) + idx * 1.8) * 3;

        if (rocketRefs.current[idx]) {
          rocketRefs.current[idx].style.transform = `translate3d(${xPx}px, ${yPx}px, 0)`;
        }
        if (badgeRefs.current[idx]) {
          badgeRefs.current[idx].textContent = `${Math.round(prog)}%`;
        }
      });

      if (normalizedTime < 1.0 && !rt.isFinished) {
        rt.rafId = requestAnimationFrame(loop);
      } else if (!rt.isFinished) {
        setRocketProgress(currentProgress);
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

    const trackWidth = trackRef.current ? (trackRef.current.clientWidth * 0.81) : 800;

    const loop = (timestamp) => {
      const elapsed = (timestamp - rt.startTime) + rt.elapsedBeforePause;
      const normalizedTime = Math.min(elapsed / rt.duration, 1.0);

      const currentProgress = [];
      teams.forEach((team, idx) => {
        const isWinner = team.id === rt.determinedWinner?.id;
        const prog = computeRacerProgress(normalizedTime, idx, teams.length, isWinner, rt.seed + idx * 1.8);
        currentProgress.push(prog);

        const xPx = (prog / 100) * trackWidth;
        const yPx = Math.sin((timestamp * 0.005) + idx * 1.8) * 3;

        if (rocketRefs.current[idx]) {
          rocketRefs.current[idx].style.transform = `translate3d(${xPx}px, ${yPx}px, 0)`;
        }
        if (badgeRefs.current[idx]) {
          badgeRefs.current[idx].textContent = `${Math.round(prog)}%`;
        }
      });

      if (normalizedTime < 1.0 && !rt.isFinished) {
        rt.rafId = requestAnimationFrame(loop);
      } else if (!rt.isFinished) {
        setRocketProgress(currentProgress);
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

    const sorted = [...teams].sort((a, b) => {
      if (a.id === winTeam.id) return -1;
      if (b.id === winTeam.id) return 1;
      return 0;
    });
    setRankings(sorted);
    setGameState(GAME_STATES.FINISHED);

    if (onRecordResult) {
      onRecordResult('rocket-space', {
        winner: winTeam,
        rankings: sorted,
        mode: 'team'
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
    setRocketProgress(teams.map(() => 0));
    setWinner(null);
    setRankings([]);
    setGameState(GAME_STATES.IDLE);
    gameAudio.playTick();

    // Reset rocket positions directly
    teams.forEach((_, idx) => {
      if (rocketRefs.current[idx]) {
        rocketRefs.current[idx].style.transform = 'translate3d(0px, 0px, 0)';
      }
      if (badgeRefs.current[idx]) {
        badgeRefs.current[idx].textContent = '0%';
      }
    });
  };

  // Step advancement for question-based rocket play
  const advanceTeamRocket = (teamId, amount = 20) => {
    const trackWidth = trackRef.current ? trackRef.current.clientWidth * 0.80 : 800;
    setRocketProgress(prev => {
      return teams.map((team, i) => {
        if (team.id === teamId) {
          const next = Math.min((prev[i] || 0) + amount, 100);
          if (rocketRefs.current[i]) {
            const xPx = (next / 100) * trackWidth;
            rocketRefs.current[i].style.transform = `translate3d(${xPx}px, 0px, 0)`;
          }
          if (badgeRefs.current[i]) {
            badgeRefs.current[i].textContent = `${Math.round(next)}%`;
          }
          if (next >= 100 && !winner) {
            finishRace();
          }
          return next;
        }
        return prev[i] || 0;
      });
    });
    gameAudio.playBoost();
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                GAME 05 • 2D CARTOON PREMIUM
              </span>
              <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-indigo-300 uppercase">
                TÊN LỬA CHINH PHỤC VŨ TRỤ
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              {teams.length} Tàu Không Gian • Phóng Từ Trái Đất • Cán Đích Sao Hỏa
            </p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-2">
          {gameState === GAME_STATES.IDLE || gameState === GAME_STATES.FINISHED ? (
            <button
              onClick={startCountdown}
              className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>PHÓNG TÊN LỬA (RUN)</span>
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
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>LÀM LẠI</span>
          </button>
        </div>

        {/* Right: Challenge & Sound */}
        <div className="flex items-center gap-2">
          <button
            onClick={openChallenge}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Thử Thách Bài 6</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN 2D CARTOON SPACE ARENA */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* Space Illustration Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/games/rocket-space/space_bg.svg')` }}
        />

        {/* Lanes & Rockets */}
        <div ref={trackRef} className="absolute top-[15%] bottom-[15%] left-0 right-0 flex flex-col justify-around px-3 z-20">
          <style>{`
            @keyframes rocketFlamePulse {
              0%, 100% { transform: scale(1); opacity: 0.85; }
              50% { transform: scale(1.25, 1.15) translateX(-2px); opacity: 1; }
            }
          `}</style>
          {teams.map((team, index) => {
            const prog = rocketProgress[index] || 0;
            const isFirst = winner?.id === team.id;

            return (
              <div 
                key={team.id}
                className="relative w-full h-14 flex items-center border-b border-indigo-500/20"
              >
                {/* Team Number */}
                <div 
                  className="absolute left-2 w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shadow"
                  style={{ backgroundColor: team.color || '#3b82f6', color: '#fff' }}
                >
                  {team.number || index + 1}
                </div>

                {/* Rocket Sprite */}
                <div 
                  ref={(el) => (rocketRefs.current[index] = el)}
                  className="absolute flex items-center will-change-transform"
                  style={{
                    left: '3%',
                    transform: `translate3d(${(prog / 100) * (trackRef.current ? trackRef.current.clientWidth * 0.80 : 800)}px, 0px, 0)`
                  }}
                >
                  {/* Floating Team Badge above rocket */}
                  <div className="absolute -top-6 left-6 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/80 shadow-md backdrop-blur-sm whitespace-nowrap z-20">
                    <span className="text-xs">{team.icon || '🚀'}</span>
                    <span className="text-[11px] font-bold text-white">{team.shortName || team.name}</span>
                    <span 
                      ref={(el) => (badgeRefs.current[index] = el)}
                      className="text-[10px] font-mono text-cyan-300 font-bold"
                    >
                      {Math.round(prog)}%
                    </span>
                  </div>

                  {/* Rocket Illustration */}
                  <div 
                    className="relative w-32 h-16"
                    style={{ filter: isFirst ? 'drop-shadow(0 0 14px #38bdf8)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
                  >
                    <img 
                      src="/assets/games/rocket-space/rocket_sprite.svg" 
                      alt="Rocket" 
                      className="w-full h-full object-contain"
                    />

                    {/* Team Color Fin Accent */}
                    <div 
                      className="absolute top-2 right-4 w-3 h-3 rounded-full shadow"
                      style={{ backgroundColor: team.color || '#ef4444' }}
                    />

                    {/* Animated Rocket Thruster Flame during flight */}
                    {gameState === GAME_STATES.PLAYING && (
                      <div 
                        className="absolute left-1 top-5 w-4 h-6 rounded-full bg-gradient-to-l from-orange-400 via-amber-300 to-transparent pointer-events-none"
                        style={{ animation: 'rocketFlamePulse 0.15s infinite' }}
                      />
                    )}
                  </div>
                </div>

                {/* Step bump action for teacher manual control */}
                <button
                  onClick={() => advanceTeamRocket(team.id, 20)}
                  className="absolute right-4 px-2 py-1 rounded bg-slate-800/80 hover:bg-indigo-600/80 text-[10px] font-bold text-indigo-300 hover:text-white transition-all border border-indigo-500/30"
                  title="Tiến thêm +20% quãng đường"
                >
                  +20% Tiến
                </button>
              </div>
            );
          })}
        </div>

        {/* 3. COUNTDOWN MODAL */}
        {gameState === GAME_STATES.COUNTDOWN && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50 border-4 border-white/80 animate-bounce">
                <span className="text-7xl font-black text-slate-950 font-mono">
                  {countdown}
                </span>
              </div>
              <p className="mt-4 text-xl font-black text-cyan-300 uppercase tracking-widest animate-pulse">
                SẴN SÀNG... PHÓNG TÊN LỬA!
              </p>
            </div>
          </div>
        )}

        {/* 4. VICTORY MODAL */}
        {gameState === GAME_STATES.FINISHED && winner && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-cyan-400/60 p-6 shadow-2xl shadow-cyan-500/30 flex flex-col items-center text-center">
              
              <div className="w-24 h-24 mb-3">
                <img src="/assets/games/common/trophy_gold.svg" alt="Trophy" className="w-full h-full object-contain filter drop-shadow" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase tracking-widest mb-1">
                🚀 CÁN ĐÍCH TRẠM SAO HỎA!
              </span>

              <h2 className="text-2xl font-black text-white mt-1">
                {winner.name}
              </h2>
              <p className="text-xs text-cyan-200 mt-1">
                Tàu không gian đã xuất sắc vượt qua các tinh vân và cập bến thành công!
              </p>

              {/* Podium Table */}
              <div className="w-full mt-4 bg-slate-950/60 rounded-xl border border-slate-800 p-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-left">
                  Bảng Xếp Hạng Hạ Cánh:
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {rankings.map((r, i) => (
                    <div 
                      key={r.id}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold ${
                        i === 0 
                          ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300' 
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
                        {i === 0 ? 'HẠ CÁNH' : `Hạng ${i + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

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
                  className="flex-1 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 text-slate-950 shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Phóng Lượt Mới</span>
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
      </div>
    </div>
  );
}
