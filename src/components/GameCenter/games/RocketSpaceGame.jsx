import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Rocket, Play, RotateCcw, Trophy, Zap, Sparkles, 
  HelpCircle, CheckCircle, Flame, ShieldAlert, Award
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';

export default function RocketSpaceGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE' | 'COUNTDOWN' | 'FLYING' | 'FINISHED'
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);

  // Rocket progress per team (0 to 100%)
  const [rockets, setRockets] = useState(() => 
    teams.map(t => ({ id: t.id, progress: 0, speed: 0, rank: null }))
  );

  const animFrameRef = useRef(null);
  const flightStateRef = useRef({
    startTime: 0,
    duration: (settings.roundDuration || 20) * 1000 / (settings.gameSpeed || 1.0),
    rockets: [],
    targetWinnerId: null,
    controlMode: 'fair_random',
    isFinished: false
  });

  // Sync secretControl and duration
  useEffect(() => {
    flightStateRef.current.controlMode = secretControl?.mode || 'fair_random';
    flightStateRef.current.targetWinnerId = secretControl?.targetTeamId || teams[0]?.id;
    flightStateRef.current.duration = (settings.roundDuration || 20) * 1000 / (settings.gameSpeed || 1.0);
  }, [secretControl, settings, teams]);

  // Listen to keyboard shortcuts 1-9 to silently pick winner on the fly
  useEffect(() => {
    const handleKeyDown = (e) => {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= teams.length) {
        const target = teams[num - 1];
        if (target) {
          flightStateRef.current.targetWinnerId = target.id;
          flightStateRef.current.controlMode = 'teacher_rigged';
          gameAudio.playTick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teams]);

  // Init rockets when teams change
  useEffect(() => {
    const initData = teams.map((t, idx) => ({
      id: t.id,
      number: t.number,
      name: t.name,
      shortName: t.shortName,
      icon: t.icon,
      color: t.color,
      progress: 0,
      turbSpeed: Math.random() * 0.3 + 0.85,
      wobble: Math.random() * Math.PI * 2,
      rank: null
    }));
    flightStateRef.current.rockets = initData;
    setRockets(initData);
    setGameState('IDLE');
    setWinner(null);
    setRankings([]);
    setShowChallengeModal(false);
  }, [teams]);

  const resetFlight = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    gameAudio.stopAmbientBGM();
    setGameState('IDLE');
    setWinner(null);
    setRankings([]);
    setShowChallengeModal(false);

    const resetData = flightStateRef.current.rockets.map(r => ({
      ...r,
      progress: 0,
      rank: null
    }));
    flightStateRef.current.rockets = resetData;
    flightStateRef.current.isFinished = false;
    setRockets(resetData);
  };

  const startCountdown = () => {
    if (gameState === 'COUNTDOWN' || gameState === 'FLYING') return;
    resetFlight();
    setGameState('COUNTDOWN');
    setCountdown(3);
    gameAudio.playTick();

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        gameAudio.playTick();
      } else {
        clearInterval(interval);
        setGameState('FLYING');
        launchRockets();
      }
    }, 900);
  };

  const launchRockets = () => {
    gameAudio.playBoost();
    gameAudio.playAmbientBGM('cosmic');
    flightStateRef.current.startTime = performance.now();
    flightStateRef.current.isFinished = false;

    const animate = (time) => {
      const elapsed = time - flightStateRef.current.startTime;
      const progressRatio = Math.min(elapsed / flightStateRef.current.duration, 1.0);
      const isNearEnd = progressRatio > 0.85;

      const { rockets: currentRockets, targetWinnerId, controlMode } = flightStateRef.current;
      let targetWinner = currentRockets.find(r => r.id === targetWinnerId);

      // If fair_random, randomly choose leading rocket
      if (controlMode === 'fair_random' && !targetWinner) {
        targetWinner = currentRockets[0];
      }

      const updated = currentRockets.map((rocket) => {
        let baseProg = progressRatio;
        // Fluctuations
        const wave = Math.sin(elapsed * 0.005 + rocket.wobble) * 0.04;
        let p = Math.max(0, baseProg * rocket.turbSpeed + wave);

        // Rigging enforcement near end
        if (isNearEnd && rocket.id === targetWinnerId && controlMode !== 'fair_random') {
          p = Math.max(p, progressRatio + 0.08); // Rigged winner shoots ahead
        } else if (isNearEnd && rocket.id !== targetWinnerId && controlMode === 'teacher_rigged') {
          p = Math.min(p, 0.92); // Hold others back
        }

        p = Math.min(Math.max(p, 0), 1.0);
        return { ...rocket, progress: p };
      });

      flightStateRef.current.rockets = updated;
      setRockets([...updated]);

      // Check if someone reached 100% or duration elapsed
      const finishedRocket = updated.find(r => r.progress >= 1.0);
      if ((progressRatio >= 1.0 || finishedRocket) && !flightStateRef.current.isFinished) {
        flightStateRef.current.isFinished = true;
        handleFinishFlight(updated);
        return;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleFinishFlight = (finalRockets) => {
    gameAudio.stopAmbientBGM();
    gameAudio.playFanfare();
    setGameState('FINISHED');

    // Rank rockets by progress
    const sorted = [...finalRockets].sort((a, b) => b.progress - a.progress);
    const winTeam = sorted[0];
    setWinner(winTeam);
    setRankings(sorted);

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });

    if (onRecordResult) {
      onRecordResult({
        gameId: 'game-05-rocket-space',
        gameName: 'Tên Lửa Chinh Phục Vũ Trụ',
        winner: winTeam,
        rankings: sorted,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 bg-gradient-to-b from-slate-950 via-purple-950 to-black select-none overflow-hidden font-sans">
      {/* Cosmic Star Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.2),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.2),transparent_50%)]" />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-slate-950/40 backdrop-blur rounded-[14px] flex items-center justify-center text-2xl">
              🚀
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-cyan-300 flex items-center gap-2">
              TÊN LỬA CHINH PHỤC VŨ TRỤ
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Đua Tốc Độ
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Mỗi đội sở hữu một phi thuyền không gian vượt dải ngân hà về đích Trạm Không Gian
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {gameState === 'IDLE' && (
            <button
              onClick={startCountdown}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              PHÓNG TÊN LỬA
            </button>
          )}

          {gameState === 'FINISHED' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const randomQ = LESSON_6_QUESTIONS[Math.floor(Math.random() * LESSON_6_QUESTIONS.length)];
                  setCurrentQuestion(randomQ);
                  setShowChallengeModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Câu Hỏi Bài 6
              </button>
              <button
                onClick={resetFlight}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đua Lại
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Countdown Overlay */}
      {gameState === 'COUNTDOWN' && (
        <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
          <div className="text-center">
            <span className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 animate-ping">
              {countdown}
            </span>
            <p className="text-lg font-bold text-purple-200 mt-4 tracking-widest uppercase">
              Chuẩn bị phóng phi thuyền...
            </p>
          </div>
        </div>
      )}

      {/* Space Race Track */}
      <div className="relative w-full flex-1 my-3 rounded-3xl bg-slate-950/60 border border-purple-900/40 p-4 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Track Lines and Background Stars */}
        <div className="absolute left-24 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-emerald-500/50 flex flex-col justify-start pt-2 pl-2">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest rotate-90 origin-left">
            Trái Đất (0%)
          </span>
        </div>

        <div className="absolute right-24 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 via-amber-300 to-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.8)] flex flex-col justify-end pb-2 pr-2">
          <span className="text-[10px] font-black text-yellow-300 uppercase tracking-widest -rotate-90 origin-right">
            Trạm Vũ Trụ (100%)
          </span>
        </div>

        {/* Lanes */}
        <div className="w-full flex-1 flex flex-col justify-around relative z-10 py-2">
          {rockets.map((rocket, idx) => {
            const laneLeft = 90;
            const laneWidth = 'calc(100% - 210px)';
            const progressPct = (rocket.progress * 100).toFixed(1);

            return (
              <div 
                key={rocket.id}
                className="relative w-full h-12 flex items-center border-b border-purple-900/20 last:border-b-0"
              >
                {/* Team Info on Left */}
                <div className="w-24 shrink-0 flex items-center gap-2 pr-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-900/60 border border-purple-400/40 text-[11px] font-black text-purple-300 flex items-center justify-center">
                    {rocket.number}
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {rocket.shortName || rocket.name}
                  </span>
                </div>

                {/* Flying Space Track for this Lane */}
                <div className="relative flex-1 h-full flex items-center" style={{ width: laneWidth, marginLeft: '10px' }}>
                  {/* Subtle trajectory line */}
                  <div className="absolute inset-x-0 h-0.5 bg-purple-500/10" />

                  {/* The Rocket Node */}
                  <div
                    className="absolute flex items-center transition-all duration-75"
                    style={{
                      left: `calc(${progressPct}% - 20px)`,
                      transform: 'translateY(-50%)',
                      top: '50%'
                    }}
                  >
                    {/* Flame trail behind rocket */}
                    {gameState === 'FLYING' && (
                      <div className="flex items-center -mr-1 animate-pulse">
                        <Flame className="w-6 h-6 text-orange-500 -rotate-90 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                      </div>
                    )}

                    {/* Rocket Body */}
                    <div 
                      className="relative px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl border"
                      style={{ 
                        backgroundColor: `${rocket.color}25`,
                        borderColor: rocket.color
                      }}
                    >
                      <span className="text-xl -rotate-45">🚀</span>
                      <span className="text-xs font-black text-white whitespace-nowrap">
                        {rocket.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Planet on Right */}
                <div className="w-24 shrink-0 text-right pr-2 flex items-center justify-end gap-1">
                  <span className="text-xs font-mono font-bold text-purple-300">
                    {Math.round(rocket.progress * 100)}%
                  </span>
                  <span className="text-base">🪐</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Victory Celebration Modal */}
      {gameState === 'FINISHED' && winner && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 border-2 border-yellow-400 p-8 shadow-2xl shadow-yellow-500/20 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-xl shadow-yellow-500/40">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
                🏆
              </div>
            </div>

            <span className="inline-block mt-4 px-3 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 tracking-wider">
              CHIẾN HẠM VÔ ĐỊCH VŨ TRỤ
            </span>

            <h3 className="text-3xl font-black text-white mt-2">
              {winner.name}
            </h3>
            <p className="text-sm font-semibold text-purple-300 mt-1">
              Đã đáp xuống Trạm Không Gian đầu tiên với tốc độ ánh sáng!
            </p>

            <div className="my-6 p-4 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Thành tích</div>
                <div className="text-lg font-black text-yellow-300">Hạng Nhất 🥇</div>
              </div>
              <div className="w-px h-8 bg-purple-800" />
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Điểm thi đua</div>
                <div className="text-lg font-black text-emerald-400">+10 Điểm ⭐</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  const randomQ = LESSON_6_QUESTIONS[Math.floor(Math.random() * LESSON_6_QUESTIONS.length)];
                  setCurrentQuestion(randomQ);
                  setShowChallengeModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <HelpCircle className="w-4 h-4" />
                Thử Thách Bài 6
              </button>
              <button
                onClick={resetFlight}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Đua Lượt Mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Question Modal */}
      {showChallengeModal && currentQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-purple-500/50 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs">
                  {currentQuestion.id || 'CÂU HỎI'}
                </span>
                <h4 className="text-base font-bold text-white">
                  Thử Thách Kiến Thức Mạng Toàn Cầu
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
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
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
