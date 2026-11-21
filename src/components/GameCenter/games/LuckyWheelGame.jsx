import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, RotateCcw, Trophy, Award, Sparkles, UserCheck, 
  Trash2, Volume2, VolumeX, Users, User, HelpCircle, CheckCircle
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { GAME_STATES, easeOutQuint } from '../services/gameEngine2D';
import QuestionChallengeModal from '../QuestionChallengeModal';

export default function LuckyWheelGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [eliminateChosen, setEliminateChosen] = useState(false);
  const [activeItems, setActiveItems] = useState([]);
  const [mode, setMode] = useState('team'); // 'team' | 'individual'
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [flapperAngle, setFlapperAngle] = useState(0);

  // Sync mode from settings
  useEffect(() => {
    if (settings?.gameMode) {
      setMode(settings.gameMode);
    }
  }, [settings]);

  // Sync active items based on mode
  useEffect(() => {
    if (mode === 'individual' && students.length > 0) {
      setActiveItems(students);
    } else {
      setActiveItems(teams);
    }
  }, [mode, teams, students]);

  // Wheel Physics Ref
  const wheelRef = useRef({
    rotation: 0,
    startRotation: 0,
    targetRotation: 0,
    startTime: 0,
    duration: 6500, // 6.5s spin
    rafId: null,
    targetItem: null,
    lastTickIndex: -1
  });

  // Hotkeys: Space to Spin, R to Reset, 1-9 to Pick Winner
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (gameState !== GAME_STATES.PLAYING) {
          spinWheel();
        }
      }
      if ((e.key === 'r' || e.key === 'R') && e.target.tagName !== 'INPUT') {
        resetWheel();
      }
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= activeItems.length) {
        const target = activeItems[num - 1];
        if (target) {
          wheelRef.current.targetItem = target;
          gameAudio.playTick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeItems]);

  // Render Wheel to HTML5 Canvas (High-DPI Razor Sharp)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 25;

    ctx.clearRect(0, 0, width, height);

    if (activeItems.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Danh sách trống', centerX, centerY);
      return;
    }

    const sliceAngle = (2 * Math.PI) / activeItems.length;
    const rot = wheelRef.current.rotation;

    // 1. Draw Outer Glowing Rim
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rot);

    // Rim shadow
    ctx.beginPath();
    ctx.arc(0, 0, radius + 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Outer Chrome / Golden Bevel
    const rimGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    rimGrad.addColorStop(0, '#fef08a');
    rimGrad.addColorStop(0.3, '#f59e0b');
    rimGrad.addColorStop(0.7, '#ca8a04');
    rimGrad.addColorStop(1, '#854d0e');
    ctx.lineWidth = 14;
    ctx.strokeStyle = rimGrad;
    ctx.stroke();

    // Flashing Rim Light Bulbs
    const numBulbs = 24;
    for (let b = 0; b < numBulbs; b++) {
      const bAngle = (b / numBulbs) * 2 * Math.PI;
      const bx = (radius + 8) * Math.cos(bAngle);
      const by = (radius + 8) * Math.sin(bAngle);
      const isLit = (b + Math.floor(rot * 5)) % 2 === 0;

      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = isLit ? '#ffffff' : '#fbbf24';
      ctx.shadowColor = isLit ? '#ffffff' : '#f59e0b';
      ctx.shadowBlur = isLit ? 10 : 3;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 2. Draw Wheel Slices
    activeItems.forEach((item, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      // Palette Colors
      const colors = [
        '#0284c7', '#ea580c', '#16a34a', '#7c3aed', 
        '#db2777', '#059669', '#d97706', '#4f46e5'
      ];
      ctx.fillStyle = item.color || colors[i % colors.length];
      ctx.fill();

      // Slice separator border
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Slice Outer Peg Pins
      const pinX = (radius - 5) * Math.cos(startAngle);
      const pinY = (radius - 5) * Math.sin(startAngle);
      ctx.beginPath();
      ctx.arc(pinX, pinY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Slice Text & Icon
      ctx.save();
      const midAngle = startAngle + sliceAngle / 2;
      ctx.rotate(midAngle);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;

      const label = item.shortName || item.name;
      const truncated = label.length > 14 ? label.slice(0, 12) + '...' : label;
      ctx.fillText(`${item.icon || item.avatar || '⭐'} ${truncated}`, radius - 20, 5);
      ctx.restore();
    });

    // 3. Draw Center Game-Show Emblem
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 36);
    centerGrad.addColorStop(0, '#ffffff');
    centerGrad.addColorStop(0.4, '#fef08a');
    centerGrad.addColorStop(0.8, '#f59e0b');
    centerGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Center Gold Star
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#78350f';
    ctx.fillText('★', 0, 1);

    ctx.restore();
  });

  // -------------------------------------------------------------
  // SPIN LOGIC WITH ACCURATE POINTER STOP ALIGNMENT
  // -------------------------------------------------------------
  const spinWheel = () => {
    if (gameState === GAME_STATES.PLAYING || activeItems.length === 0) return;

    setWinner(null);
    setGameState(GAME_STATES.PLAYING);
    gameAudio.playHorn();

    const w = wheelRef.current;
    w.startRotation = w.rotation % (2 * Math.PI);
    w.startTime = performance.now();
    w.duration = 6000 + Math.random() * 800; // ~6.5 seconds

    // 1. Pick Winner (Secret Rigged or Fair Random)
    const modeRig = secretControl?.mode || 'fair_random';
    const targetId = mode === 'individual' ? secretControl?.targetStudentId : secretControl?.targetTeamId;
    
    let chosen = w.targetItem;
    if (!chosen) {
      if (modeRig === 'teacher_rigged' && targetId) {
        chosen = activeItems.find(it => it.id === targetId || String(it.number) === String(targetId));
      } else if (modeRig === 'weighted_random' && targetId && Math.random() < 0.8) {
        chosen = activeItems.find(it => it.id === targetId || String(it.number) === String(targetId));
      }
    }
    if (!chosen) {
      const idx = Math.floor(Math.random() * activeItems.length);
      chosen = activeItems[idx];
    }
    w.targetItem = chosen;

    // 2. Compute exact rotation to stop needle at chosen slice!
    // Pointer is at Top (Angle = 3*PI/2 = 270 deg)
    const sliceAngle = (2 * Math.PI) / activeItems.length;
    const targetIndex = activeItems.findIndex(it => it.id === chosen.id);
    // Slice center angle relative to wheel 0
    const sliceCenterAngle = targetIndex * sliceAngle + sliceAngle / 2;

    // Pointer angle in canvas coordinate is 3*Math.PI / 2
    // We want: (targetRotation + sliceCenterAngle) % 2*PI == 3*Math.PI / 2
    const targetAngleAtTop = (3 * Math.PI / 2 - sliceCenterAngle);
    const normalizedTarget = (targetAngleAtTop % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    // Add 6 to 8 full revolutions for dramatic spin
    const fullSpins = 7 * 2 * Math.PI;
    const currentNorm = w.startRotation;
    const diff = (normalizedTarget - (currentNorm % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    w.targetRotation = currentNorm + fullSpins + diff;

    // 3. Start Spin Animation Loop
    const loop = (timestamp) => {
      const elapsed = timestamp - w.startTime;
      const progress = Math.min(elapsed / w.duration, 1.0);
      const eased = easeOutQuint(progress);

      w.rotation = w.startRotation + (w.targetRotation - w.startRotation) * eased;

      // Tick Audio & Pointer Flapper Deflection
      const currentSliceIdx = Math.floor((w.rotation / sliceAngle)) % activeItems.length;
      if (currentSliceIdx !== w.lastTickIndex) {
        w.lastTickIndex = currentSliceIdx;
        gameAudio.playTick();
        setFlapperAngle(-18);
        setTimeout(() => setFlapperAngle(0), 40);
      }

      // Re-render
      const canvas = canvasRef.current;
      if (canvas) {
        // Trigger canvas redraw by setting dummy state or invoking render
        const event = new CustomEvent('wheel-draw');
        window.dispatchEvent(event);
      }

      if (progress < 1.0) {
        w.rafId = requestAnimationFrame(loop);
      } else {
        finishSpin();
      }
    };

    w.rafId = requestAnimationFrame(loop);
  };

  const finishSpin = () => {
    const w = wheelRef.current;
    cancelAnimationFrame(w.rafId);
    gameAudio.playFanfare();

    const winItem = w.targetItem;
    setWinner(winItem);
    setHistory(prev => [winItem, ...prev]);
    setGameState(GAME_STATES.FINISHED);

    if (onRecordResult) {
      onRecordResult('lucky-wheel', {
        winner: winItem,
        mode: mode
      });
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (e) {}

    // Auto-eliminate if enabled
    if (eliminateChosen) {
      setTimeout(() => {
        setActiveItems(prev => prev.filter(it => it.id !== winItem.id));
      }, 2500);
    }
  };

  const resetWheel = () => {
    const w = wheelRef.current;
    if (w.rafId) cancelAnimationFrame(w.rafId);
    w.targetItem = null;
    setWinner(null);
    setGameState(GAME_STATES.IDLE);
    gameAudio.playTick();
  };

  const restoreAll = () => {
    if (mode === 'individual') {
      setActiveItems(students);
    } else {
      setActiveItems(teams);
    }
    setWinner(null);
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-400 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">
            🎡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                GAME 03 • GAME SHOW VÒNG QUAY
              </span>
              <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-100 to-amber-300 uppercase">
                VÒNG QUAY MAY MẮN
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              {activeItems.length} Ô Quay • Tạch Tạch Hồi Hộp • Dừng Chuẩn Kim Chỉ
            </p>
          </div>
        </div>

        {/* Center: Mode Toggles & Elimination Option */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMode('team')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mode === 'team' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Đua Nhóm ({teams.length})</span>
          </button>
          <button
            onClick={() => setMode('individual')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mode === 'individual' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Cá Nhân ({students.length})</span>
          </button>

          <label className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-amber-300 cursor-pointer border-l border-slate-800 ml-1">
            <input 
              type="checkbox"
              checked={eliminateChosen}
              onChange={(e) => setEliminateChosen(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-purple-500"
            />
            <span>Loại người đã gọi</span>
          </label>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={restoreAll}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Khôi phục danh sách đầy đủ"
          >
            Khôi Phục
          </button>
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN ARENA WITH BIG WHEEL */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
        
        {/* Stage Lighting Rays */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent" />

        {/* Wheel Container */}
        <div className="relative flex items-center justify-center">
          
          {/* Top Indicator Needle Pointer (SVG) */}
          <div 
            className="absolute -top-7 z-30 w-16 h-20 transition-transform origin-top duration-75 filter drop-shadow-xl"
            style={{ transform: `rotate(${flapperAngle}deg)` }}
          >
            <img 
              src="/assets/games/lucky-wheel/pointer.svg" 
              alt="Pointer" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* HTML5 Canvas Wheel */}
          <canvas
            ref={canvasRef}
            width={580}
            height={580}
            className="max-w-[85vw] max-h-[72vh] rounded-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]"
          />

          {/* Big Center "QUAY" Button (or trigger) */}
          <button
            onClick={spinWheel}
            disabled={gameState === GAME_STATES.PLAYING}
            className={`absolute w-20 h-20 rounded-full font-black text-sm uppercase tracking-wider flex flex-col items-center justify-center z-20 transition-all transform shadow-2xl ${
              gameState === GAME_STATES.PLAYING 
                ? 'bg-slate-800 text-slate-400 scale-95 border-2 border-slate-700' 
                : 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 text-slate-950 hover:scale-110 active:scale-95 border-4 border-white shadow-amber-500/50 cursor-pointer animate-pulse'
            }`}
          >
            <Play className="w-5 h-5 fill-current mb-0.5" />
            <span>QUAY</span>
          </button>
        </div>

        {/* History Sidebar Floating at Bottom-Right */}
        <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-800 p-2.5 max-w-xs shadow-xl hidden md:block">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Lịch Sử Đã Gọi ({history.length}):
          </span>
          <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
            {history.slice(0, 8).map((h, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-purple-300 border border-slate-700">
                {h.shortName || h.name}
              </span>
            ))}
          </div>
        </div>

        {/* 3. VICTORY MODAL POPUP */}
        {gameState === GAME_STATES.FINISHED && winner && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-purple-400/60 p-6 shadow-2xl shadow-purple-500/30 flex flex-col items-center text-center">
              
              <div className="w-20 h-20 mb-2">
                <img src="/assets/games/common/trophy_gold.svg" alt="Trophy" className="w-full h-full object-contain filter drop-shadow" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-400/40 uppercase tracking-widest mb-1">
                🎡 KẾT QUẢ VÒNG QUAY MAY MẮN
              </span>

              <div className="w-16 h-16 rounded-2xl my-2 flex items-center justify-center text-3xl shadow-lg"
                style={{ backgroundColor: winner.color || '#7c3aed' }}>
                {winner.icon || winner.avatar || '⭐'}
              </div>

              <h2 className="text-2xl font-black text-white mt-1">
                {winner.name}
              </h2>
              <p className="text-xs text-purple-200 mt-1">
                Xin chúc mừng! Kim chỉ vàng đã dừng chính xác tại vị trí này.
              </p>

              <div className="flex items-center gap-3 mt-5 w-full">
                <button
                  onClick={openChallenge}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Câu Hỏi Bài 6 (+10đ)</span>
                </button>
                <button
                  onClick={spinWheel}
                  className="flex-1 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Quay Lượt Tiếp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. QUESTION CHALLENGE MODAL */}
        <QuestionChallengeModal
          isOpen={showChallengeModal}
          question={currentQuestion}
          targetName={winner?.name || 'Đối tượng được chọn'}
          onClose={() => setShowChallengeModal(false)}
          onConfirmSuccess={() => setShowChallengeModal(false)}
        />
      </div>
    </div>
  );
}
