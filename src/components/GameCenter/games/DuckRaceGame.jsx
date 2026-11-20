import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Trophy, Sparkles, HelpCircle, CheckCircle } from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';

export default function DuckRaceGame({
  teams,
  students,
  secretControl,
  settings,
  onRecordResult,
  onOpenTeacherPanel
}) {
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE' | 'RACING' | 'FINISHED'
  const [winner, setWinner] = useState(null);
  const [ducks, setDucks] = useState(() => 
    teams.map(t => ({ id: t.id, name: t.shortName, icon: '🦆', color: t.color, progress: 0 }))
  );

  const raceRef = useRef({
    startTime: 0,
    duration: 18000,
    targetWinnerId: secretControl?.targetTeamId || teams[0]?.id,
    controlMode: secretControl?.mode || 'fair_random'
  });

  const animFrame = useRef(null);

  useEffect(() => {
    raceRef.current.targetWinnerId = secretControl?.targetTeamId || teams[0]?.id;
    raceRef.current.controlMode = secretControl?.mode || 'fair_random';
  }, [secretControl, teams]);

  const startRace = () => {
    if (gameState === 'RACING') return;
    setGameState('RACING');
    setWinner(null);
    gameAudio.playWhistle();
    gameAudio.playSplash();

    raceRef.current.startTime = performance.now();
    let winnerId = raceRef.current.controlMode === 'teacher_rigged' 
      ? raceRef.current.targetWinnerId 
      : teams[Math.floor(Math.random() * teams.length)].id;

    const duration = 16000 / (settings?.gameSpeed || 1.0);

    const update = (now) => {
      const elapsed = now - raceRef.current.startTime;
      const t = Math.min(1.0, elapsed / duration);

      const nextDucks = teams.map((team, idx) => {
        const isRigged = (team.id === winnerId);
        let p = t;
        if (isRigged) {
          p = t < 0.5 ? t * 0.95 : 0.475 + Math.pow((t - 0.5) / 0.5, 1.3) * 0.525;
        } else {
          p = Math.pow(t, 0.9 + (idx % 3) * 0.15) * 0.95;
        }
        return {
          id: team.id,
          name: team.shortName,
          icon: '🦆',
          color: team.color,
          progress: Math.min(1.0, p)
        };
      });

      setDucks(nextDucks);

      if (t < 1.0) {
        animFrame.current = requestAnimationFrame(update);
      } else {
        const winTeam = teams.find(t => t.id === winnerId) || teams[0];
        setWinner(winTeam);
        setGameState('FINISHED');
        gameAudio.playFanfare();
        confetti({ particleCount: 120, spread: 80 });
        if (onRecordResult) onRecordResult(winTeam.id, 15);
      }
    };

    animFrame.current = requestAnimationFrame(update);
  };

  const resetRace = () => {
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    setGameState('IDLE');
    setWinner(null);
    setDucks(teams.map(t => ({ id: t.id, name: t.shortName, icon: '🦆', color: t.color, progress: 0 })));
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-white font-sans overflow-hidden select-none">
      <header className="px-4 py-2.5 bg-slate-900 border-b border-amber-500/30 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl">
            🦆
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-amber-300 uppercase">
              GAME 02: ĐUA VỊT VƯỢT SÔNG
            </h2>
            <p className="text-[11px] text-slate-400">Các chú vịt quẫy chân té nước bơi qua dòng sông xanh</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gameState === 'IDLE' ? (
            <button
              onClick={startRace}
              className="px-5 py-2 rounded-xl font-black text-xs bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 shadow-md"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>XUẤT PHÁT</span>
            </button>
          ) : (
            <button
              onClick={resetRace}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ĐUA LẠI</span>
            </button>
          )}
        </div>
      </header>

      {/* River Track */}
      <main className="relative flex-1 w-full bg-gradient-to-b from-sky-900 via-teal-900 to-emerald-950 overflow-hidden flex flex-col justify-evenly px-6 py-4">
        {/* River banks & Lotus pads */}
        <div className="absolute top-2 left-10 text-2xl opacity-60">🪷</div>
        <div className="absolute bottom-4 right-20 text-3xl opacity-50">🪷</div>
        <div className="absolute top-1/2 left-1/3 text-2xl opacity-40">🍃</div>

        {/* Finish Line */}
        <div className="absolute top-0 bottom-0 right-20 w-3 bg-yellow-400/80 shadow-[0_0_15px_rgba(250,204,21,0.8)] z-10 flex flex-col justify-between items-center py-2">
          <span className="text-xl">🏁</span>
          <span className="text-xl">🏁</span>
        </div>

        {ducks.map((duck, idx) => {
          const isWinner = winner && winner.id === duck.id;
          return (
            <div key={duck.id} className="relative h-14 flex items-center border-b border-teal-500/20">
              <span className="text-xs font-bold text-slate-300 w-20 truncate">{duck.name}</span>

              {/* Duck Sprite */}
              <div
                className="absolute transition-transform will-change-transform flex items-center gap-1.5"
                style={{
                  left: `calc(5rem + ${duck.progress * 75}%)`,
                  transform: `translateY(${Math.sin(duck.progress * 30 + idx) * 4}px)`
                }}
              >
                <div 
                  className={`p-2 rounded-2xl flex items-center gap-1.5 shadow-lg border-2 ${
                    isWinner ? 'scale-125 bg-amber-400 text-slate-950 ring-4 ring-yellow-300' : 'bg-slate-900/90 text-white'
                  }`}
                  style={{ borderColor: duck.color }}
                >
                  <span className="text-2xl animate-bounce">🦆</span>
                  <span className="text-xs font-black">{duck.name}</span>
                </div>
                {gameState === 'RACING' && <span className="text-xs opacity-75">💦</span>}
              </div>
            </div>
          );
        })}
      </main>

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <span className="text-5xl">🦆👑</span>
            <h3 className="text-2xl font-black text-amber-300">
              {winner.name} CHIẾN THẮNG!
            </h3>
            <p className="text-xs text-slate-300">Chúc mừng chú vịt của {winner.shortName} đã về đích đầu tiên!</p>
            <button
              onClick={resetRace}
              className="w-full py-2.5 rounded-xl font-bold bg-amber-400 text-slate-950 hover:bg-amber-300"
            >
              TIẾP TỤC
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
