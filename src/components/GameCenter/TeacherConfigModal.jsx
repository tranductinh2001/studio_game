import React, { useState } from 'react';
import { 
  Users, UserPlus, Settings, Volume2, VolumeX, Music, Clock, 
  Trash2, Edit3, Plus, Check, RefreshCw, X, Shield, Sparkles, Palette 
} from 'lucide-react';
import { PRESET_COLORS, PRESET_ICONS, PRESET_AVATARS } from './services/gameStorage';

export default function TeacherConfigModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDefault
}) {
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' | 'students' | 'settings'
  const [teams, setTeams] = useState(config.teams || []);
  const [students, setStudents] = useState(config.students || []);
  const [gameMode, setGameMode] = useState(config.gameMode || 'team');
  const [settings, setSettings] = useState(config.settings || {
    roundDuration: 25,
    soundEnabled: true,
    bgmEnabled: true,
    gameSpeed: 1.0
  });

  // Team Form editing state
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShortName, setNewTeamShortName] = useState('');
  const [newTeamIcon, setNewTeamIcon] = useState('🐺');
  const [newTeamColor, setNewTeamColor] = useState('#0ea5e9');

  // Student Form editing state
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentTeamId, setNewStudentTeamId] = useState(teams[0]?.id || 'TEAM_1');
  const [filterTeam, setFilterTeam] = useState('ALL');

  if (!isOpen) return null;

  // Save all changes
  const handleSave = () => {
    onSaveConfig({
      ...config,
      teams,
      students,
      gameMode,
      settings
    });
    onClose();
  };

  // Team CRUD
  const handleAddTeam = () => {
    const nextNum = teams.length + 1;
    const colorPreset = PRESET_COLORS[(nextNum - 1) % PRESET_COLORS.length];
    const newTeam = {
      id: `TEAM_${Date.now()}`,
      number: nextNum,
      name: newTeamName.trim() || `Đội Mới (Nhóm ${nextNum})`,
      shortName: newTeamShortName.trim() || `Nhóm ${nextNum}`,
      icon: newTeamIcon || PRESET_ICONS[(nextNum - 1) % PRESET_ICONS.length],
      color: newTeamColor || colorPreset.color,
      gradient: colorPreset.gradient,
      avatar: newTeamIcon || '🐺',
      score: 0,
      wins: 0
    };
    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setNewTeamShortName('');
  };

  const handleDeleteTeam = (id) => {
    if (teams.length <= 2) {
      alert("Cần tối thiểu 2 đội để tổ chức trò chơi!");
      return;
    }
    const updated = teams.filter(t => t.id !== id).map((t, idx) => ({
      ...t,
      number: idx + 1
    }));
    setTeams(updated);
  };

  const handleUpdateTeam = (id, updates) => {
    setTeams(teams.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // Student CRUD
  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const nextNum = students.length + 1;
    const newStu = {
      id: `STU_${Date.now()}`,
      code: `HS${String(nextNum).padStart(2, '0')}`,
      name: newStudentName.trim(),
      teamId: newStudentTeamId,
      avatar: PRESET_AVATARS[(nextNum - 1) % PRESET_AVATARS.length],
      answeredCount: 0,
      isCalled: false
    };
    setStudents([...students, newStu]);
    setNewStudentName('');
  };

  const handleDeleteStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleUpdateStudentTeam = (studentId, teamId) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, teamId } : s));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-slate-900 border-2 border-cyan-400/50 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-white">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center font-black">
              <Settings className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>CẤU HÌNH TRUNG TÂM TRÒ CHƠI BÀI 6</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  THCS ĐẮK TRÔI
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Quản lý các nhóm thi đấu, danh sách học sinh và thiết lập thời gian
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="px-5 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'teams'
                ? 'bg-slate-900 border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản Lý Nhóm ({teams.length} Đội)</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'students'
                ? 'bg-slate-900 border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Danh Sách Học Sinh ({students.length} HS)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'settings'
                ? 'bg-slate-900 border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài Đặt &amp; Âm Thanh</span>
          </button>
        </div>

        {/* Modal Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* TAB 1: TEAMS MANAGEMENT */}
          {activeTab === 'teams' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                  Danh Sách Các Đội Tham Gia (Tối đa 10+ Đội)
                </span>
                <span className="text-xs text-slate-400">
                  Kéo hoặc bấm sửa tên, màu sắc, icon của từng đội
                </span>
              </div>

              {/* Team list grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border-2 border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-2 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-slate-950 font-mono shadow-md"
                          style={{ backgroundColor: t.color }}
                        >
                          {t.number}
                        </span>
                        <div>
                          <p className="font-extrabold text-sm text-white">{t.shortName}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{t.name}</p>
                        </div>
                      </div>
                      <span className="text-2xl">{t.icon}</span>
                    </div>

                    {/* Color & Icon Pickers for Team */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={t.color}
                          onChange={(e) => handleUpdateTeam(t.id, { color: e.target.value })}
                          className="w-6 h-6 rounded-lg cursor-pointer bg-transparent border-0"
                          title="Chọn màu đại diện"
                        />
                        <select
                          value={t.icon}
                          onChange={(e) => handleUpdateTeam(t.id, { icon: e.target.value, avatar: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-lg text-xs px-1.5 py-0.5 text-white"
                        >
                          {PRESET_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                      </div>

                      <button
                        onClick={() => handleDeleteTeam(t.id)}
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all"
                        title="Xóa nhóm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Team Form */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Thêm Nhóm / Đội Mới</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <input
                    type="text"
                    value={newTeamShortName}
                    onChange={(e) => setNewTeamShortName(e.target.value)}
                    placeholder="Tên ngắn (VD: Nhóm 5)"
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Tên đầy đủ (VD: Đội Rồng Vàng)"
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newTeamIcon}
                      onChange={(e) => setNewTeamIcon(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-base"
                    >
                      {PRESET_ICONS.map(ic => <option key={ic} value={ic}>{ic} Biểu tượng</option>)}
                    </select>
                    <input
                      type="color"
                      value={newTeamColor}
                      onChange={(e) => setNewTeamColor(e.target.value)}
                      className="w-10 h-9 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={handleAddTeam}
                    className="px-4 py-2 rounded-xl font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Nhóm</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS MANAGEMENT */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                    Danh Sách Học Sinh Lớp 6A
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {students.length} em
                  </span>
                </div>

                {/* Filter by team */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Lọc theo nhóm:</span>
                  <select
                    value={filterTeam}
                    onChange={(e) => setFilterTeam(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-slate-200 text-xs"
                  >
                    <option value="ALL">Tất cả các nhóm</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
                  </select>
                </div>
              </div>

              {/* Add Student Bar */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-2 text-xs">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Nhập họ và tên học sinh mới..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                />
                <select
                  value={newStudentTeamId}
                  onChange={(e) => setNewStudentTeamId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
                </select>
                <button
                  onClick={handleAddStudent}
                  className="px-4 py-2 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm HS</span>
                </button>
              </div>

              {/* Student Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[45vh] overflow-y-auto pr-1">
                {students
                  .filter(s => filterTeam === 'ALL' || s.teamId === filterTeam)
                  .map((s) => {
                    const assignedTeam = teams.find(t => t.id === s.teamId);
                    return (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xl">{s.avatar}</span>
                          <div className="truncate">
                            <p className="font-bold text-white truncate">{s.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{s.code}</p>
                          </div>
                        </div>

                        {/* Team switcher select */}
                        <div className="flex items-center gap-1 shrink-0">
                          <select
                            value={s.teamId}
                            onChange={(e) => handleUpdateStudentTeam(s.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg text-[10px] px-1 py-0.5 text-slate-300"
                          >
                            {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
                          </select>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & AUDIO */}
          {activeTab === 'settings' && (
            <div className="space-y-5 max-w-xl mx-auto">
              {/* Game Mode */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                  Chế Độ Tham Gia Trò Chơi
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => setGameMode('team')}
                    className={`p-3 rounded-xl border text-left font-bold transition-all ${
                      gameMode === 'team'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-sm text-white">🏆 Chế độ Thi Đấu Nhóm</p>
                    <p className="text-[10px] text-slate-400 font-normal">Các đội đua thuyền, đua vịt, bốc thăm theo tổ</p>
                  </button>

                  <button
                    onClick={() => setGameMode('individual')}
                    className={`p-3 rounded-xl border text-left font-bold transition-all ${
                      gameMode === 'individual'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-sm text-white">👤 Chế độ Chọn Cá Nhân</p>
                    <p className="text-[10px] text-slate-400 font-normal">Quay chọn từng học sinh trong lớp lên bảng</p>
                  </button>
                </div>
              </div>

              {/* Duration & Speed */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-black text-sky-400 uppercase tracking-wider block">
                  Thời Gian &amp; Tốc Độ Trận Đấu
                </span>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Thời gian đua (giây):</label>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      value={settings.roundDuration}
                      onChange={(e) => setSettings({ ...settings, roundDuration: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Tốc độ hoạt cảnh:</label>
                    <select
                      value={settings.gameSpeed}
                      onChange={(e) => setSettings({ ...settings, gameSpeed: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="0.8">0.8x (Chậm, hồi hộp)</option>
                      <option value="1.0">1.0x (Chuẩn)</option>
                      <option value="1.5">1.5x (Nhanh)</option>
                      <option value="2.0">2.0x (Cực nhanh)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sound & Music */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider block">
                  Âm Thanh Web Audio API (Offline 100%)
                </span>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2 text-white">
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                      <span>Âm thanh hiệu ứng (Còi, sóng, cúp, tạch tạch)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                      className="rounded text-cyan-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2 text-white">
                      <Music className="w-4 h-4 text-purple-400" />
                      <span>Nhạc nền Gameshow hồi hộp (Procedural Synth)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.bgmEnabled}
                      onChange={(e) => setSettings({ ...settings, bgmEnabled: e.target.checked })}
                      className="rounded text-purple-500 w-4 h-4"
                    />
                  </label>
                </div>
              </div>

              {/* Reset Database button */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => {
                    if (confirm("Khôi phục toàn bộ danh sách 32 học sinh Lớp 6A THCS Đắk Trôi và 6 nhóm ban đầu?")) {
                      onResetDefault();
                      onClose();
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-slate-950 border border-slate-800 transition-all inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Khôi phục dữ liệu gốc Lớp 6A Đắk Trôi</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400">
            💾 Cấu hình được lưu tự động vào trình duyệt, không mất khi đổi slide hoặc F5.
          </p>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>LƯU CẤU HÌNH</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
