import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Gift, Sparkles, Trophy, RotateCcw, HelpCircle, 
  CheckCircle, ArrowRight, Star, Award, Zap, Volume2, VolumeX
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { GAME_STATES } from '../services/gameEngine2D';
import StealthWinnerControl from '../StealthWinnerControl';
import { CharacterAvatar } from '../services/characterAvatars';

const REWARD_TYPES = [
  { type: 'star', title: 'Ngôi Sao May Mắn', points: 10, icon: '⭐', desc: 'Cộng trực tiếp +10 điểm vào bảng xếp hạng!' },
  { type: 'trophy', title: 'Cúp Thần Tốc', points: 20, icon: '🏆', desc: 'Thưởng lớn +20 điểm cho tinh thần xung phong!' },
  { type: 'question', title: 'Thử Thách Bài 6', points: 15, icon: '❓', desc: 'Trả lời đúng câu hỏi kiến thức để nhận +15 điểm!' },
  { type: 'zap', title: 'Tia Chớp Nhân Đôi', points: 10, icon: '⚡', desc: 'Nhận quyền nhân đôi điểm số ở câu hỏi tiếp theo!' },
  { type: 'heart', title: 'Trái Tim Tri Thức', points: 10, icon: '❤️', desc: 'Cộng +10 điểm và quyền ưu tiên chọn câu hỏi!' },
  { type: 'shield', title: 'Khiên Bảo Vệ', points: 10, icon: '🛡️', desc: 'Bảo toàn điểm số nếu trả lời chưa chính xác!' }
];

export default function MysteryBoxesGame({
  teams = [],
  students = [],
  secretControl = {},
  onUpdateSecretControl,
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [boxes, setBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [openedBoxIds, setOpenedBoxIds] = useState(new Set());
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize Boxes
  useEffect(() => {
    initBoxes();
  }, [teams]);

  const initBoxes = () => {
    const numBoxes = Math.max(teams.length, 6);
    const boxColors = [
      '#0284c7', '#ea580c', '#16a34a', '#7c3aed', 
      '#db2777', '#059669', '#d97706', '#4f46e5'
    ];

    const generated = Array.from({ length: numBoxes }).map((_, i) => {
      const reward = REWARD_TYPES[i % REWARD_TYPES.length];
      const q = LESSON_6_QUESTIONS[i % LESSON_6_QUESTIONS.length];
      const team = teams[i % teams.length];

      return {
        id: `BOX_${i + 1}`,
        number: i + 1,
        color: boxColors[i % boxColors.length],
        team: team,
        teamName: team?.shortName || `Hộp ${i + 1}`,
        reward,
        question: q,
        isOpened: false
      };
    });

    setBoxes(generated);
    setOpenedBoxIds(new Set());
    setSelectedBox(null);
    setShowRewardModal(false);
    setGameState(GAME_STATES.IDLE);
  };

  const handleBoxClick = (box) => {
    if (openedBoxIds.has(box.id)) return;

    // If teacher secretly rigged a winning team, grant top prize (+20đ Cúp Thần Tốc) to that team's box
    const isRigged = secretControl?.mode === 'teacher_rigged' && secretControl?.targetTeamId;
    const isRiggedTarget = isRigged && (box.team?.id === secretControl.targetTeamId || String(box.number) === String(secretControl.targetTeamId));
    const effectiveBox = isRiggedTarget ? { ...box, reward: REWARD_TYPES[1] } : box;

    gameAudio.playPop();
    setSelectedBox(effectiveBox);
    setOpenedBoxIds(prev => new Set([...prev, box.id]));
    setGameState(GAME_STATES.PLAYING);

    // After animation, trigger reward reveal
    setTimeout(() => {
      gameAudio.playFanfare();
      setShowRewardModal(true);
      setGameState(GAME_STATES.FINISHED);

      if (onRecordResult) {
        onRecordResult('mystery-boxes', {
          box: box.number,
          reward: box.reward
        });
      }

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }, 600);
  };

  const toggleSound = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-white select-none overflow-hidden font-sans">
      
      {/* 1. TOP CONTROL BAR */}
      <div className="flex-none h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-30 backdrop-blur-md">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
            🎁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                GAME 04 • 2D CARTOON PREMIUM
              </span>
              <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-100 to-amber-300 uppercase">
                HỘP QUÀ BÍ ẨN
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              {boxes.length} Hộp Quà Sắc Màu • Mở Bung Nắp Rực Rỡ • Khám Phá Bất Ngờ
            </p>
          </div>
        </div>

        {/* Center: Status */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">Đã mở:</span>
          <span className="font-mono text-emerald-300 font-black">{openedBoxIds.size} / {boxes.length}</span>
        </div>

        {/* Right: Reset & Sound */}
        <div className="flex items-center gap-2">
          <button
            onClick={initBoxes}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm Mới Hộp</span>
          </button>
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN ARENA WITH 2D CARTOON GIFT BOXES */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-6 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950">
        
        {/* Stage Lighting Backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500 via-transparent to-transparent" />

        {/* Grid of Cartoon Gift Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl w-full z-10">
          {boxes.map((box) => {
            const isOpened = openedBoxIds.has(box.id);
            const isTarget = selectedBox?.id === box.id;

            return (
              <div
                key={box.id}
                onClick={() => !isOpened && handleBoxClick(box)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                  isOpened 
                    ? 'opacity-60 scale-95 cursor-default' 
                    : 'hover:scale-105 active:scale-95 cursor-pointer hover:drop-shadow-[0_10px_20px_rgba(20,184,166,0.3)]'
                }`}
              >
                {/* Gift Box Graphic (SVG) */}
                <div className="relative w-36 h-36">
                  <img
                    src={isOpened ? "/assets/games/mystery-box/gift_open.svg" : "/assets/games/mystery-box/gift_box.svg"}
                    alt="Gift Box"
                    className={`w-full h-full object-contain transition-transform ${
                      !isOpened && 'hover:rotate-2'
                    }`}
                  />

                  {/* Box Number Badge */}
                  <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-slate-900/90 border border-amber-400 text-amber-300 font-black text-xs flex items-center justify-center shadow">
                    {box.number}
                  </div>

                  {/* Opened Checkmark Badge */}
                  {isOpened && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-950/80 text-emerald-400 border border-emerald-500 shadow">
                        ĐÃ MỞ
                      </span>
                    </div>
                  )}
                </div>

                {/* Team / Box Label with Character Avatar */}
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  {box.team && <CharacterAvatar team={box.team} size="xs" />}
                  <span className="text-xs font-bold text-slate-200 text-center">
                    {box.teamName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. REWARD / QUESTION MODAL */}
        {showRewardModal && selectedBox && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-emerald-400/60 p-6 shadow-2xl shadow-emerald-500/30 flex flex-col items-center text-center">
              
              <div className="w-24 h-24 mb-2">
                <img src="/assets/games/mystery-box/gift_open.svg" alt="Open Gift" className="w-full h-full object-contain filter drop-shadow" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-widest mb-1">
                🎁 MỞ HỘP SỐ {selectedBox.number}
              </span>

              <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                <span>{selectedBox.reward.icon}</span>
                <span>{selectedBox.reward.title}</span>
              </h2>

              <p className="text-xs text-emerald-200 mt-2">
                {selectedBox.reward.desc}
              </p>

              {/* If challenge question attached */}
              {selectedBox.reward.type === 'question' && selectedBox.question && (
                <div className="w-full mt-4 bg-slate-950/85 rounded-2xl border border-slate-800 p-4 sm:p-5 text-left shadow-inner">
                  <h4 className="text-sm sm:text-base font-black text-white mb-3 leading-snug">
                    {selectedBox.question.questionText || selectedBox.question.question}
                  </h4>
                  <div className="space-y-2">
                    {(Array.isArray(selectedBox.question.options)
                      ? selectedBox.question.options.map((text, i) => ({ key: ['A', 'B', 'C', 'D'][i] || `${i + 1}`, text: String(text) }))
                      : Object.entries(selectedBox.question.options || {}).map(([key, text]) => ({ key, text: String(text) }))
                    ).map((opt) => {
                      const isCorrect = opt.key === selectedBox.question.correctAnswer;
                      return (
                        <div 
                          key={opt.key} 
                          className={`px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 transition-all ${
                            isCorrect 
                              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 font-bold' 
                              : 'bg-slate-900/80 text-slate-200 border border-slate-800/80'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center font-black shrink-0 ${
                            isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {opt.key}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowRewardModal(false)}
                className="mt-5 w-full py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Tiếp Tục Cuộc Chơi</span>
              </button>
            </div>
          </div>
        )}

        {/* Stealth Hidden Winner Control */}
        <StealthWinnerControl
          items={teams}
          secretControl={secretControl}
          onUpdateSecretControl={onUpdateSecretControl}
        />
      </div>
    </div>
  );
}
