import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, Pause, RotateCcw, Trophy, Award, Zap, Flag, 
  Volume2, VolumeX, Sparkles, HelpCircle, ArrowRight, CheckCircle 
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';

export default function BoatRaceGame({
  teams,
  students,
  secretControl,
  settings,
  onRecordResult,
  onOpenTeacherPanel
}) {
  // Game states: 'IDLE' | 'COUNTDOWN' | 'RACING' | 'FINISHED'
  const [gameState, setGameState] = useState('IDLE');
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);

  // Race progress for each team (0% to 100%)
  const [boatProgress, setBoatProgress] = useState(() => 
    teams.map(t => ({ id: t.id, progress: 0, speed: 0, rank: null, laneY: 0 }))
  );

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const raceStateRef = useRef({
    startTime: 0,
    duration: (settings.roundDuration || 25) * 1000 / (settings.gameSpeed || 1.0),
    boats: [],
    targetWinnerId: null,
    controlMode: 'fair_random',
    isFinished: false
  });

  // Keep teams & secretControl in sync with ref
  useEffect(() => {
    raceStateRef.current.controlMode = secretControl?.mode || 'fair_random';
    raceStateRef.current.targetWinnerId = secretControl?.targetTeamId || teams[0]?.id;
    raceStateRef.current.duration = (settings.roundDuration || 25) * 1000 / (settings.gameSpeed || 1.0);
  }, [secretControl, settings, teams]);

  // Initialize boats when teams change
  useEffect(() => {
    const initialBoats = teams.map((team, idx) => ({
      id: team.id,
      number: team.number,
      name: team.name,
      shortName: team.shortName,
      icon: team.icon,
      color: team.color,
      progress: 0, // 0 to 1
      speedNoise: Math.random() * 0.4 + 0.8,
      verticalBob: Math.random() * Math.PI * 2,
      rank: null
    }));
    raceStateRef.current.boats = initialBoats;
    setBoatProgress(initialBoats);
    setGameState('IDLE');
    setWinner(null);
    setRankings([]);
    setShowChallengeModal(false);
  }, [teams]);

  // Reset race
  const resetRace = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    gameAudio.stopAmbientBGM();
    setGameState('IDLE');
    setWinner(null);
    setRankings([]);
    setShowChallengeModal(false);

    const resetBoats = teams.map((team) => ({
      id: team.id,
      number: team.number,
      name: team.name,
      shortName: team.shortName,
      icon: team.icon,
      color: team.color,
      progress: 0,
      speedNoise: Math.random() * 0.4 + 0.8,
      verticalBob: Math.random() * Math.PI * 2,
      rank: null
    }));
    raceStateRef.current.boats = resetBoats;
    raceStateRef.current.isFinished = false;
    setBoatProgress(resetBoats);
  };

  // Start race with 3.. 2.. 1.. Countdown
  const startRace = () => {
    if (gameState === 'RACING' || gameState === 'COUNTDOWN') return;
    resetRace();
    setGameState('COUNTDOWN');
    setCountdown(3);
    gameAudio.playTick(1.2);

    let count = 3;
    const countTimer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        gameAudio.playTick(1.2 + (3 - count) * 0.3);
      } else if (count === 0) {
        setCountdown('XUẤT PHÁT!');
        gameAudio.playWhistle();
        gameAudio.playHorn();
        if (settings.bgmEnabled) gameAudio.startAmbientBGM();
      } else {
        clearInterval(countTimer);
        setGameState('RACING');
        launchRaceLoop();
      }
    }, 900);
  };

  // Main high-performance Animation Loop
  const launchRaceLoop = () => {
    raceStateRef.current.startTime = performance.now();
    raceStateRef.current.isFinished = false;

    // Determine intended winner beforehand
    let finalWinnerId = null;
    const { controlMode, targetWinnerId } = raceStateRef.current;

    if (controlMode === 'teacher_rigged' && targetWinnerId) {
      finalWinnerId = targetWinnerId;
    } else if (controlMode === 'weighted_random' && targetWinnerId) {
      // 80% chance for target team, 20% random
      finalWinnerId = Math.random() < 0.8 
        ? targetWinnerId 
        : teams[Math.floor(Math.random() * teams.length)].id;
    } else {
      // 100% fair random
      finalWinnerId = teams[Math.floor(Math.random() * teams.length)].id;
    }

    const totalDuration = raceStateRef.current.duration;
    let finishedRanks = [];

    const loop = (currentTime) => {
      const elapsed = currentTime - raceStateRef.current.startTime;
      const t = Math.min(1.0, elapsed / totalDuration); // normalized time 0..1

      // Ease in-out pacing
      const currentBoats = raceStateRef.current.boats;

      currentBoats.forEach((boat) => {
        if (boat.progress >= 1.0) return;

        // Base progress with turbulence
        const isRigged = (boat.id === finalWinnerId);
        
        // Random micro wave oscillations
        const waveFluctuation = Math.sin(t * 15 + boat.number) * 0.04;
        
        // Progression curve
        let baseProgress = t;
        
        if (isRigged) {
          // Rigged boat stays competitive in first half, then accelerates decisively in second half
          if (t < 0.5) {
            baseProgress = t * 0.95 + waveFluctuation * 0.5;
          } else {
            // Turbo surge at 50% - 90%
            const surgeFactor = Math.pow((t - 0.5) / 0.5, 1.4);
            baseProgress = 0.475 + surgeFactor * 0.525 + 0.03;
          }
        } else {
          // Other boats have varying speed noise
          const noise = boat.speedNoise;
          baseProgress = Math.pow(t, noise) * 0.96 + waveFluctuation * 0.5;
          // Ensure non-rigged boats don't exceed 0.98 until winner crosses
          if (baseProgress > 0.97 && t < 0.98) baseProgress = 0.95;
        }

        boat.progress = Math.min(1.0, Math.max(0, baseProgress));

        // Check finish line
        if (boat.progress >= 1.0 && !boat.rank) {
          finishedRanks.push(boat);
          boat.rank = finishedRanks.length;

          // First finisher
          if (finishedRanks.length === 1) {
            triggerVictory(boat);
          }
        }
      });

      // Update state for render
      setBoatProgress([...currentBoats]);

      // Check if race ends
      if (t < 1.0 && finishedRanks.length < currentBoats.length) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        // Complete remaining boats
        currentBoats.forEach(b => {
          if (!b.rank) {
            finishedRanks.push(b);
            b.rank = finishedRanks.length;
            b.progress = 1.0;
          }
        });
        setRankings([...finishedRanks]);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  // Victory celebration trigger
  const triggerVictory = (winningBoat) => {
    raceStateRef.current.isFinished = true;
    setGameState('FINISHED');
    setWinner(winningBoat);
    gameAudio.stopAmbientBGM();
    gameAudio.playHorn();
    gameAudio.playFanfare();

    // Fire Confetti explosion
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 400);

    // Record score (+20 points for 1st place)
    if (onRecordResult) {
      onRecordResult(winningBoat.id, 20);
    }
  };

  // Keyboard shortcut listener: Number keys 1-9 to rig winner silently
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= teams.length) {
        const targetTeam = teams.find(t => t.number === num);
        if (targetTeam) {
          raceStateRef.current.controlMode = 'teacher_rigged';
          raceStateRef.current.targetWinnerId = targetTeam.id;
          gameAudio.playTick(1.8); // subtle auditory confirmation for teacher
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'IDLE' || gameState === 'FINISHED') startRace();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        resetRace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teams, gameState]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      gameAudio.stopAmbientBGM();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-white font-sans overflow-hidden select-none">
      
      {/* 1. TOP STATUS BAR & GAME DASHBOARD */}
      <header className="px-4 py-2.5 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20 text-xl">
            ⛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                GAME 01 • BÀI 6
              </span>
              <h2 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-indigo-300 uppercase tracking-tight">
                ĐUA THUYỀN VƯỢT SÓNG (OCEAN ODYSSEY)
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              Tranh tài kiến thức mạng toàn cầu • {teams.length} đội tham gia đua
            </p>
          </div>
        </div>

        {/* Center: Action Controls */}
        <div className="flex items-center gap-2">
          {gameState === 'IDLE' && (
            <button
              onClick={startRace}
              className="px-6 py-2 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>XUẤT PHÁT (SPACE)</span>
            </button>
          )}

          {gameState === 'RACING' && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black animate-pulse">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>CÁC THUYỀN ĐANG BỨT TỐC!</span>
            </div>
          )}

          {gameState === 'FINISHED' && (
            <button
              onClick={resetRace}
              className="px-5 py-2 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1.5 shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ĐUA LƯỢT MỚI (R)</span>
            </button>
          )}

          {/* Discreet Teacher Trigger Button */}
          <button
            onClick={onOpenTeacherPanel}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-all"
            title="Mở Bảng Điều Khiển Bí Mật (Phím F2)"
          >
            <Zap className="w-4 h-4 text-amber-400/80" />
          </button>
        </div>
      </header>

      {/* 2. MAIN 3D OCEAN TRACK CANVAS VIEWPORT (16:9 PROJECTION) */}
      <main className="relative flex-1 w-full overflow-hidden bg-gradient-to-b from-[#02182B] via-[#052E4A] to-[#04436A] flex flex-col justify-between">
        
        {/* Animated Sky & Clouds Background */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-3 left-10 text-4xl animate-pulse">☁️</div>
          <div className="absolute top-8 right-32 text-3xl opacity-80">☁️</div>
          <div className="absolute top-16 left-1/3 text-2xl opacity-60">☁️</div>
          {/* Mountain Silhouettes */}
          <div className="absolute bottom-1/2 left-0 right-0 h-24 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
        </div>

        {/* Start Line Marker (Left) */}
        <div className="absolute top-0 bottom-0 left-24 sm:left-32 w-1.5 bg-yellow-400/70 shadow-[0_0_15px_rgba(250,204,21,0.8)] z-10 flex flex-col justify-between items-center py-2 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-yellow-400 text-slate-950 uppercase rotate-90 origin-left mt-6">
            XUẤT PHÁT
          </span>
          <span className="text-xl">🚩</span>
        </div>

        {/* Finish Line Checkered Strip (Right) */}
        <div className="absolute top-0 bottom-0 right-16 sm:right-28 w-8 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#fff_10px,#fff_20px)] shadow-[0_0_25px_rgba(255,255,255,0.6)] z-10 flex flex-col justify-between items-center py-2 opacity-90 pointer-events-none border-x-2 border-white">
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-950 text-white uppercase rotate-90 origin-left mt-8 tracking-widest">
            ĐÍCH
          </span>
          <span className="text-2xl animate-bounce">🏁</span>
        </div>

        {/* 3D Ocean Waves Graphic Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="w-[200%] h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-blue-600/10 to-transparent animate-wave-slow"></div>
        </div>

        {/* 3. MULTI-LANE BOAT RACE TRACK */}
        <div className="relative z-10 flex-1 flex flex-col justify-evenly px-4 sm:px-8 py-3">
          {teams.map((team, idx) => {
            const boat = boatProgress.find(b => b.id === team.id) || { progress: 0 };
            const progressPercent = Math.min(100, Math.max(0, boat.progress * 100));

            // Dynamic wake turbulence
            const isMoving = gameState === 'RACING' && boat.progress > 0.05 && boat.progress < 0.98;
            const isWinner = winner && winner.id === team.id;

            return (
              <div 
                key={team.id} 
                className="relative h-14 sm:h-16 flex items-center border-b border-cyan-500/15 group"
              >
                {/* Lane Number & Team Badge (Fixed Left) */}
                <div className="absolute left-2 flex items-center gap-2 z-20 w-24 sm:w-28 shrink-0">
                  <span 
                    className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-slate-950 font-mono shadow-md border border-white/40"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.number}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-black text-white truncate drop-shadow">{team.shortName}</p>
                    <p className="text-[10px] text-cyan-300/80 font-mono font-bold">{team.score || 0}đ</p>
                  </div>
                </div>

                {/* The Moving Boat Sprite Container */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 transition-transform ease-out will-change-transform z-20 flex items-center"
                  style={{
                    left: `calc(7rem + ${progressPercent * 0.72}%)`,
                    transform: `translateY(-50%) translateY(${Math.sin(boat.progress * 25 + idx) * 3}px)`
                  }}
                >
                  {/* Wake Foam Spray (Behind Boat) */}
                  {isMoving && (
                    <div className="absolute right-full mr-1 flex items-center pointer-events-none">
                      <div className="w-12 sm:w-16 h-3 bg-gradient-to-l from-white/80 via-cyan-200/50 to-transparent rounded-full filter blur-[1px] animate-pulse"></div>
                      <span className="text-[10px] opacity-70">💦</span>
                    </div>
                  )}

                  {/* 3D Boat Body */}
                  <div 
                    className={`relative px-3 py-1.5 rounded-2xl shadow-2xl flex items-center gap-2 border-2 transition-all ${
                      isWinner 
                        ? 'scale-125 ring-4 ring-yellow-400 bg-gradient-to-r from-yellow-500 to-amber-600 border-white' 
                        : 'border-white/40 bg-slate-900/90 hover:scale-105'
                    }`}
                    style={{
                      borderColor: team.color,
                      boxShadow: `0 0 20px ${team.color}60`
                    }}
                  >
                    {/* Team Sail / Dragon Boat Head */}
                    <span className="text-2xl sm:text-3xl filter drop-shadow">
                      {isWinner ? '👑' : team.icon || '⛵'}
                    </span>

                    {/* Boat Captain Avatar & Info */}
                    <div className="text-left pr-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{team.avatar || '👦'}</span>
                        <span className="text-xs font-black text-white whitespace-nowrap drop-shadow">
                          {team.shortName}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-cyan-300 block">
                        {Math.round(progressPercent)}%
                      </span>
                    </div>

                    {/* Winner Crown Badge */}
                    {isWinner && (
                      <span className="absolute -top-3 -right-2 px-1.5 py-0.2 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-black uppercase shadow-lg animate-bounce">
                        TOP 1
                      </span>
                    )}
                  </div>
                </div>

                {/* Gentle Wave Crest Lines in each lane */}
                <div className="absolute inset-x-0 bottom-1 h-px bg-cyan-400/20"></div>
              </div>
            );
          })}
        </div>

        {/* Countdown Big Screen Overlay */}
        {gameState === 'COUNTDOWN' && (
          <div className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
            <span className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 font-orbitron tracking-tight animate-bounce drop-shadow-[0_10px_35px_rgba(245,158,11,0.8)]">
              {countdown}
            </span>
            <p className="text-sm sm:text-base font-black text-cyan-300 uppercase tracking-widest pt-4">
              CHUẨN BỊ XUẤT PHÁT!
            </p>
          </div>
        )}

      </main>

      {/* 4. VICTORY CELEBRATION MODAL & KNOWLEDGE CHALLENGE */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-yellow-400 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
            
            {/* Top Confetti & Glow Aura */}
            <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-2 border-yellow-400/80 flex items-center justify-center text-5xl mx-auto shadow-2xl shadow-yellow-500/40 animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-yellow-400 text-slate-950 shadow-md">
                ĐỘI CHIẾN THẮNG CHUNG CUỘC
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-white pt-2">
                {winner.name}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-300 font-semibold">
                Chúc mừng {winner.shortName} đã xuất sắc vượt sóng biển và cán đích đầu tiên!
              </p>
            </div>

            {/* Winner Team Members List */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-left space-y-2">
              <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider block">
                👥 Thành viên Đội ({students.filter(s => s.teamId === winner.id).length} học sinh):
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {students.filter(s => s.teamId === winner.id).map(s => (
                  <span key={s.id} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
                    <span>{s.avatar}</span>
                    <span className="font-bold">{s.name}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
              <button
                onClick={() => setShowChallengeModal(true)}
                className="py-3 px-4 rounded-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>GIAO CÂU HỎI THỬ THÁCH</span>
              </button>

              <button
                onClick={resetRace}
                className="py-3 px-4 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ĐUA LƯỢT TIẾP THEO</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. KNOWLEDGE CHALLENGE MODAL (HỎI ĐÁP BÀI 6 DÀNH CHO ĐỘI THẮNG) */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-cyan-400 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 font-black text-sm">❓</span>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                    THỬ THÁCH KIẾN THỨC BÀI 6 (DÀNH CHO {winner?.shortName})
                  </h4>
                  <p className="text-[11px] text-slate-400">Trả lời đúng để nhận thêm +10 điểm cho đội!</p>
                </div>
              </div>
              <button
                onClick={() => setShowChallengeModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <p className="text-sm sm:text-base font-black text-amber-300 leading-snug">
                {currentQuestion.questionText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(currentQuestion.options).map(([optKey, optText]) => (
                  <div
                    key={optKey}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center">
                      {optKey}
                    </span>
                    <span>{optText}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-xs text-emerald-300">
              👉 <strong>Đáp án chuẩn:</strong> {currentQuestion.correctAnswer}. {currentQuestion.explanation}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  if (onRecordResult && winner) onRecordResult(winner.id, 10);
                  setShowChallengeModal(false);
                  resetRace();
                }}
                className="px-5 py-2.5 rounded-xl font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle className="w-4 h-4" />
                <span>TRẢ LỜI ĐÚNG (+10 ĐIỂM)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
