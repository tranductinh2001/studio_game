import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, ShieldAlert, Award, Play, Pause, RotateCcw, 
  Sparkles, CheckCircle, Plus, Minus, Zap, UserCheck, Settings, X 
} from 'lucide-react';
import { gameStorage } from './services/gameStorage';

export default function TeacherSecretPanel({ 
  isOpen, 
  onClose, 
  teams, 
  students, 
  gameMode,
  secretControl,
  onUpdateSecretControl,
  onStartGame,
  onPauseGame,
  onResetGame,
  gameState,
  onAddScore
}) {
  const [selectedTeamId, setSelectedTeamId] = useState(secretControl?.targetTeamId || teams[0]?.id);
  const [selectedStudentId, setSelectedStudentId] = useState(secretControl?.targetStudentId || students[0]?.id);
  const [controlMode, setControlMode] = useState(secretControl?.mode || 'fair_random');
  const [filterUncalledOnly, setFilterUncalledOnly] = useState(false);
  const [notification, setNotification] = useState('');

  // Sync internal state with props
  useEffect(() => {
    if (secretControl) {
      setControlMode(secretControl.mode);
      if (secretControl.targetTeamId) setSelectedTeamId(secretControl.targetTeamId);
      if (secretControl.targetStudentId) setSelectedStudentId(secretControl.targetStudentId);
    }
  }, [secretControl]);

  // Flash temporary stealth notification
  const flashNote = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  // Change mode
  const handleModeChange = (mode) => {
    setControlMode(mode);
    onUpdateSecretControl({
      mode,
      targetTeamId: selectedTeamId,
      targetStudentId: selectedStudentId
    });
    flashNote(`Đã chọn chế độ: ${mode === 'teacher_rigged' ? '🎯 Thầy chọn bí mật' : mode === 'weighted_random' ? '⚖️ Ưu tiên 80%' : '🎲 Ngẫu nhiên'}`);
  };

  // Select team
  const handleSelectTeam = (teamId) => {
    setSelectedTeamId(teamId);
    onUpdateSecretControl({
      mode: controlMode === 'fair_random' ? 'teacher_rigged' : controlMode,
      targetTeamId: teamId
    });
    const team = teams.find(t => t.id === teamId);
    flashNote(`🎯 Đã bí mật chọn: ${team?.name || 'Đội số ' + teamId}`);
  };

  // Select student
  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId);
    onUpdateSecretControl({
      mode: controlMode === 'fair_random' ? 'teacher_rigged' : controlMode,
      targetStudentId: studentId
    });
    const stu = students.find(s => s.id === studentId);
    flashNote(`🎯 Đã bí mật chọn HS: ${stu?.name}`);
  };

  if (!isOpen) return null;

  // Filtered students
  const displayStudents = filterUncalledOnly 
    ? students.filter(s => !s.isCalled) 
    : students;

  return (
    <aside 
      className="fixed inset-y-0 right-0 w-96 max-w-[95vw] bg-slate-950/95 backdrop-blur-xl border-l-2 border-amber-500/60 shadow-2xl z-50 flex flex-col text-white font-sans overflow-hidden select-none animate-slide-left"
      style={{ boxShadow: '-10px 0 35px rgba(245, 158, 11, 0.25)' }}
    >
      {/* Top Secret Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-950 border-b border-amber-500/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 font-black">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>BẢNG ĐIỀU KHIỂN BÍ MẬT</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-500/30 text-red-300 border border-red-500/40 font-mono">
                ẨN 100%
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Chỉ Thầy Tình nhìn thấy • Phím tắt F2 / 1-9</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
          title="Đóng bảng bí mật (Phím F2)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Secret Toast Indicator */}
      {notification && (
        <div className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold text-center tracking-wide animate-pulse">
          ⚡ {notification}
        </div>
      )}

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* 1. Quick Game Controls */}
        <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            🎮 Điều Khiển Trận Đấu
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onStartGame}
              disabled={gameState === 'RACING'}
              className="px-2 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 flex items-center justify-center gap-1 shadow-md transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>BẮT ĐẦU</span>
            </button>

            <button
              onClick={onPauseGame}
              disabled={gameState !== 'RACING'}
              className="px-2 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>TẠM DỪNG</span>
            </button>

            <button
              onClick={onResetGame}
              className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
          </div>
        </div>

        {/* 2. Three Secret Operating Modes */}
        <div className="bg-slate-900/90 rounded-2xl p-3 border border-amber-500/30 space-y-2">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chế Độ Phân Định Kết Quả</span>
          </span>

          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <button
              onClick={() => handleModeChange('fair_random')}
              className={`p-2.5 rounded-xl text-left font-bold transition-all border flex items-center justify-between ${
                controlMode === 'fair_random'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div>
                <p className="text-white">🎲 1. Ngẫu nhiên hoàn toàn</p>
                <p className="text-[10px] text-slate-400 font-normal">Hệ thống bốc thăm / đua tự nhiên 100%</p>
              </div>
              {controlMode === 'fair_random' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => handleModeChange('teacher_rigged')}
              className={`p-2.5 rounded-xl text-left font-bold transition-all border flex items-center justify-between ${
                controlMode === 'teacher_rigged'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div>
                <p className="text-amber-200">🎯 2. Giáo viên chỉ định thắng bí mật</p>
                <p className="text-[10px] text-slate-400 font-normal">Đội/em được chọn chắc chắn về đích đầu tiên</p>
              </div>
              {controlMode === 'teacher_rigged' && <CheckCircle className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={() => handleModeChange('weighted_random')}
              className={`p-2.5 rounded-xl text-left font-bold transition-all border flex items-center justify-between ${
                controlMode === 'weighted_random'
                  ? 'bg-purple-500/25 border-purple-400 text-purple-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div>
                <p className="text-purple-200">⚖️ 3. Ngẫu nhiên có ưu tiên (80%)</p>
                <p className="text-[10px] text-slate-400 font-normal">Tạo kịch tính cao, đội chọn có xác suất thắng lớn</p>
              </div>
              {controlMode === 'weighted_random' && <CheckCircle className="w-4 h-4 text-purple-400" />}
            </button>
          </div>
        </div>

        {/* 3. Team Secret Selection & Score Controls */}
        <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-sky-400 uppercase tracking-wider">
              🏆 Bí Mật Chọn Đội Thắng (Phím 1-9)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Bấm phím số khi đang đua</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {teams.map((t) => {
              const isSelected = selectedTeamId === t.id && controlMode !== 'fair_random';
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTeam(t.id)}
                  className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400 shadow-md'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black bg-slate-800 text-white border border-slate-700">
                      {t.number}
                    </span>
                    <span className="text-sm">{t.icon}</span>
                  </div>

                  <p className="font-bold text-[11px] truncate pt-1">{t.shortName || t.name}</p>

                  {/* Quick score buttons */}
                  <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-800/80 text-[10px]">
                    <span className="font-mono text-amber-300 font-black">{t.score || 0}đ</span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onAddScore(t.id, -5)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="Trừ 5 điểm"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => onAddScore(t.id, 10)}
                        className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold"
                        title="Cộng 10 điểm"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Individual Student Selection (If Mode is Individual) */}
        {gameMode === 'individual' && (
          <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">
                👤 Bí Mật Chọn Học Sinh
              </span>
              <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterUncalledOnly}
                  onChange={(e) => setFilterUncalledOnly(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
                <span>Chỉ người chưa gọi</span>
              </label>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 text-xs">
              {displayStudents.map((s) => {
                const isSelected = selectedStudentId === s.id && controlMode !== 'fair_random';
                const team = teams.find(t => t.id === s.teamId);
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectStudent(s.id)}
                    className={`px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{s.avatar}</span>
                      <span className="truncate">{s.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                        {team?.shortName || 'Tổ'}
                      </span>
                      {s.isCalled && (
                        <CheckCircle className="w-3 h-3 text-emerald-400" title="Đã được gọi" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Footer Info & Instructions */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
        <p className="flex items-center justify-between font-mono">
          <span>⌨️ Phím tắt:</span>
          <span className="text-amber-400">1..9 (Chọn đội) • Space (Chạy) • R (Reset)</span>
        </p>
        <p className="text-slate-500 text-center">
          Bảng điều khiển độc lập • Không hiển thị trên màn hình học sinh.
        </p>
      </div>
    </aside>
  );
}

