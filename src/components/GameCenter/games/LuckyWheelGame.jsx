import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';

export default function LuckyWheelGame({
  teams,
  students,
  gameMode,
  secretControl,
  onRecordResult
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);

  const canvasRef = useRef(null);
  const spinRef = useRef({
    startAngle: 0,
    targetAngle: 0,
    startTime: 0,
    duration: 6500,
    lastTickIndex: -1
  });

  const animFrame = useRef(null);

  // Items to put on wheel slices: Teams or Students
  const items = gameMode === 'individual' ? students : teams;
  const numSlices = Math.max(2, items.length);
  const sliceAngle = 360 / numSlices;

  // Draw the Wheel on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 20;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw slices
    items.forEach((item, idx) => {
      const startA = (idx * sliceAngle * Math.PI) / 180;
      const endA = ((idx + 1) * sliceAngle * Math.PI) / 180;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startA, endA);
      ctx.closePath();

      const color = item.color || `hsl(${(idx * 360) / items.length}, 75%, 45%)`;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Slice Text & Icon
      ctx.save();
      ctx.rotate(startA + (sliceAngle * Math.PI) / 360);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;

      const label = item.shortName || item.name || `Tổ ${idx + 1}`;
      ctx.fillText(`${item.icon || item.avatar || '⭐'} ${label}`, radius - 25, 5);
      ctx.restore();
    });

    // Center Hub 3D
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    ctx.restore();
  }, [items, rotation, sliceAngle]);

  // Spin the Wheel
  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinner(null);
    gameAudio.playBoost();

    // Determine target slice index
    let targetIdx = 0;
    if (secretControl?.mode === 'teacher_rigged' && secretControl?.targetTeamId) {
      const found = items.findIndex(item => item.id === secretControl.targetTeamId || item.id === secretControl.targetStudentId);
      targetIdx = found !== -1 ? found : Math.floor(Math.random() * items.length);
    } else {
      targetIdx = Math.floor(Math.random() * items.length);
    }

    // Needle points at top (270 degrees). Calculate target rotation
    // Angle of slice center = targetIdx * sliceAngle + sliceAngle / 2
    // We want that angle to end up at 270 (or 270 - sliceCenter) modulo 360
    const sliceCenter = targetIdx * sliceAngle + sliceAngle / 2;
    const extraRounds = (5 + Math.floor(Math.random() * 3)) * 360;
    const finalAngle = extraRounds + (270 - sliceCenter);

    spinRef.current.startTime = performance.now();
    spinRef.current.startAngle = rotation % 360;
    spinRef.current.targetAngle = finalAngle;
    spinRef.current.duration = 6000;
    spinRef.current.lastTickIndex = -1;

    const animate = (now) => {
      const elapsed = now - spinRef.current.startTime;
      const progress = Math.min(1.0, elapsed / spinRef.current.duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3.5);
      const currentRot = spinRef.current.startAngle + (spinRef.current.targetAngle - spinRef.current.startAngle) * ease;

      setRotation(currentRot);

      // Play tick sound on slice pass
      const normalizedA = (currentRot % 360 + 360) % 360;
      const currentSliceIdx = Math.floor(normalizedA / sliceAngle);
      if (currentSliceIdx !== spinRef.current.lastTickIndex) {
        spinRef.current.lastTickIndex = currentSliceIdx;
        gameAudio.playTick(1.0 + (1 - progress) * 0.5);
      }

      if (progress < 1.0) {
        animFrame.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winningItem = items[targetIdx];
        setWinner(winningItem);
        gameAudio.playFanfare();
        confetti({ particleCount: 140, spread: 90 });
        if (onRecordResult && winningItem.id) onRecordResult(winningItem.id, 10);
      }
    };

    animFrame.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-white font-sans overflow-hidden select-none">
      <header className="px-4 py-2.5 bg-slate-900 border-b border-purple-500/30 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center font-black text-xl">
            🎡
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-purple-300 uppercase">
              GAME 03: VÒNG QUAY MAY MẮN
            </h2>
            <p className="text-[11px] text-slate-400">
              Chế độ: {gameMode === 'individual' ? 'Chọn cá nhân học sinh' : 'Chọn nhóm thi đua'}
            </p>
          </div>
        </div>

        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="px-6 py-2 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 flex items-center gap-1.5 shadow-lg disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isSpinning ? 'ĐANG QUAY...' : 'QUAY NGAY'}</span>
        </button>
      </header>

      {/* Main Wheel Arena */}
      <main className="relative flex-1 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-slate-950">
        {/* Pointer Needle at Top */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none filter drop-shadow-[0_5px_15px_rgba(245,158,11,0.8)]">
          <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[34px] border-t-amber-400"></div>
          <div className="w-5 h-5 rounded-full bg-slate-950 border-2 border-amber-400 -mt-2"></div>
        </div>

        {/* Canvas Wheel */}
        <div className="relative p-3 rounded-full border-4 border-amber-400/50 shadow-[0_0_50px_rgba(139,92,246,0.3)] bg-slate-900/80">
          <canvas
            ref={canvasRef}
            width={460}
            height={460}
            className="rounded-full max-w-[80vw] max-h-[65vh] aspect-square"
          />
        </div>
      </main>

      {/* Winner Pop-up */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-yellow-400 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <span className="text-6xl animate-bounce">🏆</span>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-yellow-400 text-slate-950">
                CHÚC MỪNG
              </span>
              <h3 className="text-2xl font-black text-white pt-2">
                {winner.name}
              </h3>
              <p className="text-xs text-amber-300 font-bold">{winner.shortName || winner.code}</p>
            </div>
            <button
              onClick={() => setWinner(null)}
              className="w-full py-2.5 rounded-xl font-bold bg-amber-400 text-slate-950 hover:bg-amber-300"
            >
              HOÀN THÀNH
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
