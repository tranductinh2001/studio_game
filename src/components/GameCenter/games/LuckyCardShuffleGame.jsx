import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Shuffle, UserCheck, Sparkles, Trophy, RotateCcw, 
  HelpCircle, CheckCircle, Users, Star, Award, Filter, Volume2, VolumeX
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { GAME_STATES, pickRaceWinner } from '../services/gameEngine2D';
import QuestionChallengeModal from '../QuestionChallengeModal';

export default function LuckyCardShuffleGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [calledIds, setCalledIds] = useState(new Set());
  const [preventDuplicate, setPreventDuplicate] = useState(true);
  const [winner, setWinner] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [cardFlip, setCardFlip] = useState(false);
  const [shuffleOffset, setShuffleOffset] = useState(0);

  // Mode: individual or team
  const isIndividual = settings?.gameMode === 'individual';
  const rawPool = isIndividual ? students : teams;

  // Filtered candidate pool
  const candidatePool = useMemo(() => {
    return rawPool.filter(p => {
      if (preventDuplicate && calledIds.has(p.id)) return false;
      if (isIndividual && selectedFilter !== 'ALL' && p.teamId !== selectedFilter) {
        return false;
      }
      return true;
    });
  }, [rawPool, preventDuplicate, calledIds, isIndividual, selectedFilter]);

  // Keyboard shortcut Space to start, 1-9 to pick
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (gameState !== GAME_STATES.PLAYING) {
          startShuffle();
        }
      }
      if ((e.key === 'r' || e.key === 'R') && e.target.tagName !== 'INPUT') {
        resetGame();
      }
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= rawPool.length) {
        const target = rawPool[num - 1];
        if (target) {
          secretControl.targetTeamId = target.id;
          secretControl.targetStudentId = target.id;
          secretControl.mode = 'teacher_rigged';
          gameAudio.playTick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, rawPool, secretControl]);

  // -------------------------------------------------------------
  // SHUFFLE & DRAW CARD LOGIC
  // -------------------------------------------------------------
  const startShuffle = () => {
    if (gameState === GAME_STATES.PLAYING || candidatePool.length === 0) return;

    setWinner(null);
    setCardFlip(false);
    setGameState(GAME_STATES.PLAYING);
    gameAudio.playHorn();

    // Pick winner upfront
    const modeRig = secretControl?.mode || 'fair_random';
    const targetId = isIndividual ? secretControl?.targetStudentId : secretControl?.targetTeamId;
    const chosen = pickRaceWinner(candidatePool, targetId, modeRig) || candidatePool[0];

    // High energy shuffle card deck animation
    let shuffleCount = 0;
    const shuffleInterval = setInterval(() => {
      shuffleCount += 1;
      setShuffleOffset((prev) => (prev === 0 ? 35 : prev === 35 ? -35 : 0));
      gameAudio.playTick();

      if (shuffleCount >= 10) {
        clearInterval(shuffleInterval);
        setShuffleOffset(0);

        // Draw and flip chosen card
        setTimeout(() => {
          setWinner(chosen);
          setCardFlip(true);
          setCalledIds(prev => new Set([...prev, chosen.id]));
          setGameState(GAME_STATES.FINISHED);
          gameAudio.playFanfare();

          if (onRecordResult) {
            onRecordResult('lucky-card', {
              winner: chosen,
              mode: isIndividual ? 'individual' : 'team'
            });
          }

          try {
            confetti({
              particleCount: 110,
              spread: 85,
              origin: { y: 0.55 }
            });
          } catch (e) {}
        }, 400);
      }
    }, 120);
  };

  const resetGame = () => {
    setWinner(null);
    setCardFlip(false);
    setShuffleOffset(0);
    setGameState(GAME_STATES.IDLE);
    gameAudio.playTick();
  };

  const restoreAll = () => {
    setCalledIds(new Set());
    resetGame();
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
            🃏
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                GAME 06 • 2D CARTOON PREMIUM
              </span>
              <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-100 to-pink-300 uppercase">
                AI LÀ NGƯỜI MAY MẮN?
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              {candidatePool.length} / {rawPool.length} Ứng Viên • Xáo Bài 2.5D Rực Rỡ • Lật Thẻ May Mắn
            </p>
          </div>
        </div>

        {/* Center: Filters & Duplicate Prevention */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          {isIndividual && (
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs font-bold outline-none"
            >
              <option value="ALL">Toàn Bộ Lớp 6A (32 HS)</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          <label className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-indigo-300 cursor-pointer">
            <input 
              type="checkbox"
              checked={preventDuplicate}
              onChange={(e) => setPreventDuplicate(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500"
            />
            <span>Chống gọi trùng</span>
          </label>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={restoreAll}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Khôi phục danh sách đầy đủ"
          >
            Khôi Phục ({calledIds.size})
          </button>
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN 2.5D CARTOON CARD ARENA */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-6 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
        
        {/* Felt Casino Table Green / Velvet Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />

        {/* 3D / 2.5D Deck Container with Perspective */}
        <div className="relative flex flex-col items-center justify-center [perspective:1000px]">
          
          {/* Deck of Holographic Cards */}
          <div 
            className="relative w-64 h-96 transition-all duration-300"
            style={{
              transformStyle: 'preserve-3d',
              transform: cardFlip ? 'rotateY(180deg) scale(1.08)' : 'rotateY(0deg)'
            }}
          >
            {/* BACK OF CARD: Holographic Magic Shield (Face Down) */}
            <div 
              className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden [backface-visibility:hidden] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
              style={{
                transform: `translateX(${shuffleOffset}px) rotate(${shuffleOffset * 0.3}deg)`,
                transition: 'transform 0.12s ease-out'
              }}
            >
              <img 
                src="/assets/games/lucky-card/card_back.svg" 
                alt="Card Back" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* FRONT OF CARD: Student Profile & Badge (Face Up after Flip) */}
            <div 
              className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-4 border-amber-400 p-5 flex flex-col items-center justify-between text-center [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-2xl shadow-amber-500/30"
            >
              {/* Header Ribbon */}
              <div className="w-full flex items-center justify-between border-b border-amber-400/30 pb-2">
                <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                  THCS ĐẮK TRÔI
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  LỚP 6A
                </span>
              </div>

              {/* Big Avatar Display */}
              <div className="my-auto flex flex-col items-center">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-6xl shadow-xl shadow-indigo-500/40 border-2 border-white/60 mb-3 animate-bounce">
                  {winner?.avatar || winner?.icon || '🧑‍🎓'}
                </div>
                <h3 className="text-xl font-black text-white">
                  {winner?.name || 'Học Sinh May Mắn'}
                </h3>
                <span className="text-xs font-bold text-amber-300 mt-0.5">
                  {winner?.code ? `Mã: ${winner.code}` : winner?.shortName}
                </span>
              </div>

              {/* Golden Medal Footer */}
              <div className="w-full bg-amber-500/10 rounded-xl border border-amber-400/30 py-2">
                <span className="text-xs font-black text-amber-300 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>XUNG PHONG TRẢ LỜI</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Button: XÁO BÀI & RÚT THẺ (RUN) */}
          <button
            onClick={startShuffle}
            disabled={gameState === GAME_STATES.PLAYING || candidatePool.length === 0}
            className={`mt-8 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all transform shadow-2xl ${
              gameState === GAME_STATES.PLAYING 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/40 cursor-pointer animate-pulse'
            }`}
          >
            <Shuffle className="w-5 h-5" />
            <span>{winner ? 'XÁO TIẾP LƯỢT MỚI (RUN)' : 'BẮT ĐẦU XÁO BÀI (RUN)'}</span>
          </button>
        </div>

        {/* 3. VICTORY REVEAL OVERLAY MODAL */}
        {gameState === GAME_STATES.FINISHED && winner && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-indigo-400/60 p-6 shadow-2xl shadow-indigo-500/30 flex flex-col items-center text-center">
              
              <div className="w-20 h-20 mb-2">
                <img src="/assets/games/common/trophy_gold.svg" alt="Trophy" className="w-full h-full object-contain filter drop-shadow" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 uppercase tracking-widest mb-1">
                🃏 ĐÃ CHỌN ĐƯỢC ỨNG VIÊN
              </span>

              <div className="w-16 h-16 rounded-2xl my-2 flex items-center justify-center text-4xl shadow-lg bg-indigo-600/30 border border-indigo-400/40">
                {winner.avatar || winner.icon || '🧑‍🎓'}
              </div>

              <h2 className="text-2xl font-black text-white mt-1">
                {winner.name}
              </h2>
              <p className="text-xs text-indigo-200 mt-1">
                Xin mời bạn chuẩn bị trả lời câu hỏi thử thách kiến thức Bài 6!
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
                  onClick={startShuffle}
                  className="flex-1 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chọn Bạn Tiếp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. QUESTION CHALLENGE MODAL */}
        <QuestionChallengeModal
          isOpen={showChallengeModal}
          question={currentQuestion}
          targetName={winner?.name || 'Học Sinh May Mắn'}
          onClose={() => setShowChallengeModal(false)}
          onConfirmSuccess={() => setShowChallengeModal(false)}
        />
      </div>
    </div>
  );
}
