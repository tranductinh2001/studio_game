import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Compass, Trophy, Play, RotateCcw, CheckCircle, 
  HelpCircle, ChevronRight, Key, Sparkles, ShieldCheck
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';

const MAZE_CHECKPOINTS = [
  { id: 0, title: "Khởi Đầu", desc: "Cổng mê cung Tin học" },
  { id: 1, title: "Chặng 1", desc: "Mạng thông tin toàn cầu WWW" },
  { id: 2, title: "Chặng 2", desc: "Siêu văn bản & Siêu liên kết" },
  { id: 3, title: "Chặng 3", desc: "Website & Địa chỉ URL" },
  { id: 4, title: "Chặng 4", desc: "Trình duyệt Web thông minh" },
  { id: 5, title: "ĐÍCH", desc: "Lối thoát - Cúp Vô Địch" }
];

export default function KnowledgeMazeGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const [teamProgress, setTeamProgress] = useState(() => 
    teams.map(t => ({ id: t.id, step: 0, hasEscaped: false }))
  );
  const [winner, setWinner] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);
  const [activeAnsweringTeam, setActiveAnsweringTeam] = useState(null);

  // Keyboard shortcut 1-9 to silently boost or rig team
  useEffect(() => {
    const handleKeyDown = (e) => {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= teams.length) {
        const target = teams[num - 1];
        if (target) {
          secretControl.targetTeamId = target.id;
          secretControl.mode = 'teacher_rigged';
          gameAudio.playTick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teams, secretControl]);

  useEffect(() => {
    resetMaze();
  }, [teams]);

  const resetMaze = () => {
    setTeamProgress(teams.map(t => ({ id: t.id, step: 0, hasEscaped: false })));
    setWinner(null);
    setShowQuestionModal(false);
  };

  // Advance team by 1 checkpoint
  const advanceTeam = (teamId, forceWin = false) => {
    if (winner) return;

    gameAudio.playBoost();
    setTeamProgress(prev => {
      const updated = prev.map(item => {
        if (item.id === teamId) {
          const nextStep = forceWin ? MAZE_CHECKPOINTS.length - 1 : Math.min(item.step + 1, MAZE_CHECKPOINTS.length - 1);
          const escaped = nextStep >= MAZE_CHECKPOINTS.length - 1;
          return { ...item, step: nextStep, hasEscaped: escaped };
        }
        return item;
      });

      // Check if team escaped
      const escapedTeamState = updated.find(item => item.step >= MAZE_CHECKPOINTS.length - 1);
      if (escapedTeamState && !winner) {
        const winningTeam = teams.find(t => t.id === escapedTeamState.id);
        handleVictory(winningTeam);
      }

      return updated;
    });
  };

  const handleOpenQuestion = (team) => {
    setActiveAnsweringTeam(team);
    const randQ = LESSON_6_QUESTIONS[Math.floor(Math.random() * LESSON_6_QUESTIONS.length)];
    setCurrentQuestion(randQ);
    setShowQuestionModal(true);
    gameAudio.playBell();
  };

  const handleAnswerSubmit = (isCorrect) => {
    setShowQuestionModal(false);
    if (isCorrect && activeAnsweringTeam) {
      advanceTeam(activeAnsweringTeam.id);
    }
  };

  const handleFastPassSecret = () => {
    // Secretly pick winner based on secretControl
    const mode = secretControl?.mode || 'fair_random';
    const targetId = secretControl?.targetTeamId || teams[0]?.id;
    const chosen = (mode !== 'fair_random' && targetId) 
      ? teams.find(t => t.id === targetId) 
      : teams[Math.floor(Math.random() * teams.length)];

    if (chosen) {
      advanceTeam(chosen.id, true);
    }
  };

  const handleVictory = (winningTeam) => {
    setWinner(winningTeam);
    gameAudio.playFanfare();

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });

    if (onRecordResult) {
      onRecordResult({
        gameId: 'game-07-knowledge-maze',
        gameName: 'Mê Cung Tri Thức',
        winner: winningTeam,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-950 select-none overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.25),transparent_70%)]" />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between max-w-5xl mx-auto z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30">
            <div className="w-full h-full bg-slate-950/40 backdrop-blur rounded-[14px] flex items-center justify-center text-2xl">
              🧭
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 flex items-center gap-2">
              MÊ CUNG TRI THỨC
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Vượt Chướng Ngại Vật
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Trả lời câu hỏi mở khóa các cánh cổng bí mật để thoát khỏi mê cung Bài 6
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetMaze}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm Lại
          </button>
        </div>
      </div>

      {/* Maze Lanes by Team */}
      <div className="w-full max-w-5xl flex-1 flex flex-col justify-around my-3 p-4 rounded-3xl bg-slate-900/70 border border-emerald-900/40 shadow-2xl backdrop-blur-md z-10 overflow-y-auto">
        {teams.map((team, idx) => {
          const prog = teamProgress.find(p => p.id === team.id) || { step: 0 };
          return (
            <div 
              key={team.id}
              className="relative flex items-center gap-4 py-2 px-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-emerald-500/40 transition-all"
            >
              {/* Team Profile */}
              <div className="w-36 shrink-0 flex items-center gap-2">
                <span 
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md"
                  style={{ backgroundColor: team.color }}
                >
                  {team.number}
                </span>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-200 truncate">{team.name}</div>
                  <div className="text-[10px] text-slate-400">Cổng {prog.step}/{MAZE_CHECKPOINTS.length - 1}</div>
                </div>
              </div>

              {/* Checkpoint track */}
              <div className="flex-1 flex items-center justify-between relative px-4">
                {/* Connecting track line */}
                <div className="absolute left-6 right-6 h-1 bg-slate-800 rounded-full -z-0" />
                <div 
                  className="absolute left-6 h-1 bg-emerald-500 rounded-full transition-all duration-300 -z-0"
                  style={{ width: `${(prog.step / (MAZE_CHECKPOINTS.length - 1)) * 90}%` }}
                />

                {MAZE_CHECKPOINTS.map((cp, cIdx) => {
                  const isReached = prog.step >= cIdx;
                  const isCurrent = prog.step === cIdx;
                  return (
                    <div 
                      key={cp.id}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <div 
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                          isReached
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 scale-110'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {cIdx === MAZE_CHECKPOINTS.length - 1 ? '🏆' : cIdx}
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 mt-1 hidden md:block">
                        {cp.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons for this Team */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => handleOpenQuestion(team)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Key className="w-3.5 h-3.5 text-blue-200" />
                  Mở Cổng
                </button>
                <button
                  onClick={() => advanceTeam(team.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs transition-all active:scale-95"
                  title="Tiến thêm 1 bước trực tiếp"
                >
                  +1
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Victory Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 border-2 border-emerald-400 p-8 shadow-2xl shadow-emerald-500/20 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-300 p-1 shadow-xl shadow-emerald-500/40">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
                🏆
              </div>
            </div>

            <span className="inline-block mt-4 px-3 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 tracking-wider">
              QUÁN QUÂN THOÁT KHỎI MÊ CUNG
            </span>

            <h3 className="text-3xl font-black text-white mt-2">
              {winner.name}
            </h3>
            <p className="text-sm font-semibold text-emerald-300 mt-1">
              Đã vượt qua toàn bộ 5 cánh cổng tri thức Bài 6 xuất sắc nhất!
            </p>

            <div className="my-6 p-4 rounded-2xl bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Thành tích</div>
                <div className="text-lg font-black text-emerald-300">Xuất Sắc 🥇</div>
              </div>
              <div className="w-px h-8 bg-emerald-800" />
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Điểm cộng</div>
                <div className="text-lg font-black text-yellow-300">+10 Điểm ⭐</div>
              </div>
            </div>

            <button
              onClick={resetMaze}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all active:scale-95"
            >
              Chơi Lượt Tiếp Theo
            </button>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && currentQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-emerald-500/50 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                  {activeAnsweringTeam?.name || 'THỬ THÁCH'}
                </span>
                <h4 className="text-base font-bold text-white">
                  Trả lời đúng để mở cổng tiến bước
                </h4>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
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
                  <button
                    key={i}
                    onClick={() => handleAnswerSubmit(isCorrect)}
                    className="w-full text-left p-3 rounded-xl border border-slate-700 hover:border-emerald-500 bg-slate-800/40 hover:bg-emerald-500/10 flex items-center gap-3 transition-all group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-xs font-black flex items-center justify-center text-slate-300">
                      {optLetter}
                    </span>
                    <span className="text-sm text-slate-200 group-hover:text-white font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
