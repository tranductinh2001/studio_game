// =========================================================================
// GAME STORAGE & STATE SERVICE
// Manages Teams, Students, Game Modes, LocalStorage Persistence,
// and the Teacher's Secret Rigging / Priority State.
// =========================================================================

import { CHARACTER_PRESETS } from './characterAvatars';

const STORAGE_KEY = 'webby_game_center_config_v3';

const ROSTER_NAMES_61 = [
  'BÙI THỊ HẢI ANH', 'BÊN', 'DOAN', 'DOAN', 'DOAT', 'ĐINH GAM', 'HIÊP', 'HOĂ', 'HOĂI', 'HUNG',
  'HYĂNH', 'PHAN ANH KIỆT', 'KLONH', 'LICH', 'NÊ', 'NGUYỄN NHƯ NGỌC', 'NHĂI', 'NHEI', 'NHI', 'ĐINH PHƯ',
  'THOANH', 'THUÊ', 'THUYÊN', 'THUYÊT', 'THUYN', 'TI', 'LIÊU THỊ VIỆT TRINH', 'ĐINH TŬIN', 'YANG', 'YÊU',
  'YOEN', 'ANGĂNH', 'BIM', 'DOAN', 'DUIN', 'DUƠN', 'ĐOANH', 'HAY', 'HLANH', 'HMÔN',
  'HNGAT', 'HNGEN', 'HUY', 'HUYN', 'HUYN', 'HYE', 'KHEN', 'KHUYN', 'LĂNH', 'LÊN',
  'LOĂCH', 'LUÂN', 'LUYÊN', 'MÂY', 'MLEI', 'NAM', 'NẪK', 'NHIN', 'ĐINH PHÂN', 'THAM',
  'ĐINH THỊ THƠI'
];

const AVATAR_POOL = ['👦', '👧', '🧒', '👩', '🧑', '👱‍♀️'];

// 61 Students configured for THCS Đắk Trôi Game Center
export const DEFAULT_STUDENTS_6A = ROSTER_NAMES_61.map((name, idx) => {
  const num = idx + 1;
  const numStr = String(num).padStart(2, '0');
  const teamNum = (idx % 6) + 1;
  return {
    id: `STU_${numStr}`,
    code: `HS${numStr}`,
    name,
    teamId: `TEAM_${teamNum}`,
    avatar: AVATAR_POOL[idx % AVATAR_POOL.length]
  };
});

// Default Teams
export const DEFAULT_TEAMS = [
  {
    id: 'TEAM_1',
    number: 1,
    name: 'Đội Sói Xanh (Nhóm 1)',
    shortName: 'Nhóm 1',
    icon: '🐺',
    characterId: 'char_wolf',
    characterImage: CHARACTER_PRESETS[0].image,
    color: '#0ea5e9', // Sky blue
    gradient: 'from-sky-500 to-blue-600',
    avatar: '🐺',
    score: 0,
    wins: 0
  },
  {
    id: 'TEAM_2',
    number: 2,
    name: 'Đội Đại Bàng (Nhóm 2)',
    shortName: 'Nhóm 2',
    icon: '🦅',
    characterId: 'char_eagle',
    characterImage: CHARACTER_PRESETS[1].image,
    color: '#f59e0b', // Amber
    gradient: 'from-amber-500 to-orange-600',
    avatar: '🦅',
    score: 0,
    wins: 0
  },
  {
    id: 'TEAM_3',
    number: 3,
    name: 'Đội Rồng Lửa (Nhóm 3)',
    shortName: 'Nhóm 3',
    icon: '🐉',
    characterId: 'char_dragon',
    characterImage: CHARACTER_PRESETS[2].image,
    color: '#ef4444', // Red
    gradient: 'from-rose-500 to-red-600',
    avatar: '🐉',
    score: 0,
    wins: 0
  },
  {
    id: 'TEAM_4',
    number: 4,
    name: 'Chiến Binh Số (Nhóm 4)',
    shortName: 'Nhóm 4',
    icon: '⚔️',
    characterId: 'char_knight',
    characterImage: CHARACTER_PRESETS[3].image,
    color: '#10b981', // Emerald
    gradient: 'from-emerald-500 to-teal-600',
    avatar: '⚔️',
    score: 0,
    wins: 0
  },
  {
    id: 'TEAM_5',
    number: 5,
    name: 'Đội Thần Tốc (Nhóm 5)',
    shortName: 'Nhóm 5',
    icon: '⚡',
    characterId: 'char_flash',
    characterImage: CHARACTER_PRESETS[4].image,
    color: '#8b5cf6', // Purple
    gradient: 'from-purple-500 to-indigo-600',
    avatar: '⚡',
    score: 0,
    wins: 0
  },
  {
    id: 'TEAM_6',
    number: 6,
    name: 'Đội Sao Băng (Nhóm 6)',
    shortName: 'Nhóm 6',
    icon: '🌠',
    characterId: 'char_astro',
    characterImage: CHARACTER_PRESETS[5].image,
    color: '#ec4899', // Pink
    gradient: 'from-pink-500 to-rose-600',
    avatar: '🌠',
    score: 0,
    wins: 0
  }
];

// Color palette choices for teacher team customization
export const PRESET_COLORS = [
  { label: 'Xanh Biển', color: '#0ea5e9', gradient: 'from-sky-500 to-blue-600' },
  { label: 'Vàng Cam', color: '#f59e0b', gradient: 'from-amber-500 to-orange-600' },
  { label: 'Đỏ Lửa', color: '#ef4444', gradient: 'from-rose-500 to-red-600' },
  { label: 'Xanh Lá', color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
  { label: 'Tím Huyền Bí', color: '#8b5cf6', gradient: 'from-purple-500 to-indigo-600' },
  { label: 'Hồng Rực Rỡ', color: '#ec4899', gradient: 'from-pink-500 to-rose-600' },
  { label: 'Xanh Cyan', color: '#06b6d4', gradient: 'from-cyan-400 to-blue-500' },
  { label: 'Vàng Hoàng Kim', color: '#eab308', gradient: 'from-yellow-400 to-amber-500' },
  { label: 'Xanh Đọt Chuối', color: '#84cc16', gradient: 'from-lime-400 to-emerald-500' },
  { label: 'Chàm Indigo', color: '#6366f1', gradient: 'from-indigo-500 to-purple-600' }
];

// Icon emoji choices for teacher team customization
export const PRESET_ICONS = [
  '🐺', '🦅', '🐉', '⚔️', '⚡', '🌠', '🚀', '🔥', 
  '⛵', '🦁', '🐯', '🐬', '🏆', '⭐', '💎', '🎯'
];

export const PRESET_AVATARS = [
  '👦', '👧', '🧑', '👩', '🧒', '👱‍♂️', '👱‍♀️', '👨‍🎓', 
  '👩‍🎓', '🦸‍♂️', '🦸‍♀️', '🤖', '👾', '🚀', '🐱', '🐼'
];

// Catalog of 8 Educational Games for Lesson 6
export const GAME_CATALOG = [
  {
    id: 'boat-race',
    number: '01',
    title: 'ĐUA THUYỀN VƯỢT SÓNG',
    subtitle: 'Boat Race - Ocean Odyssey',
    badge: 'Trò chơi chính',
    badgeColor: 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950',
    description: 'Cuộc đua thuyền rồng lướt sóng kịch tính trên đại dương xanh! Mỗi đội là một chiếc thuyền đua bứt tốc, sóng biển dập dềnh và cờ hoa rực rỡ.',
    icon: '⛵',
    tags: ['Chọn nhóm', 'Sóng biển 3D', 'Bứt tốc ngoạn mục'],
    recommendedTime: '30s / lượt'
  },
  {
    id: 'duck-race',
    number: '02',
    title: 'ĐUA VỊT VƯỢT SÔNG',
    subtitle: 'Duck Water Stream Sprint',
    badge: 'Vui nhộn',
    badgeColor: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950',
    description: 'Các chú vịt vàng siêu ngộ nghĩnh quẫy chân té nước qua dòng sông xanh, vượt qua lá sen hoa súng để về đích đầu tiên!',
    icon: '🦆',
    tags: ['Chọn nhóm / Cá nhân', 'Hoạt họa vui', 'Té nước'],
    recommendedTime: '25s / lượt'
  },
  {
    id: 'lucky-wheel',
    number: '03',
    title: 'VÒNG QUAY MAY MẮN',
    subtitle: 'Lucky Wheel of Fortune',
    badge: 'Bốc thăm',
    badgeColor: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white',
    description: 'Vòng quay sắc màu hồi hộp xoay tít với âm thanh tạch tạch sống động, kim chỉ vàng dừng chính xác tại đội hoặc học sinh được chọn.',
    icon: '🎡',
    tags: ['Chọn cá nhân', 'Âm thanh tick', 'Hồi hộp'],
    recommendedTime: '15s / lượt'
  },
  {
    id: 'mystery-boxes',
    number: '04',
    title: 'HỘP QUÀ BÍ ẨN',
    subtitle: '3D Mystery Gift Boxes',
    badge: 'Bất ngờ',
    badgeColor: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950',
    description: 'Những hộp quà 3D lấp lánh thắt nơ vàng kim. Bấm chọn hộp để nắp bung ra, ánh sáng hào quang tỏa sáng kèm nhiệm vụ câu hỏi.',
    icon: '🎁',
    tags: ['Mở quà 3D', 'Pháo giấy', 'Câu hỏi thử thách'],
    recommendedTime: '20s / lượt'
  },
  {
    id: 'rocket-space',
    number: '05',
    title: 'TÊN LỬA VŨ TRỤ',
    subtitle: 'Rocket Cosmic Expedition',
    badge: 'Chinh phục',
    badgeColor: 'bg-gradient-to-r from-indigo-500 to-rose-500 text-white',
    description: 'Tên lửa khoa học xuất phát từ Trái Đất vút bay vào dải ngân hà. Đội trả lời đúng bốc lửa tăng tốc phi thuyền lên Sao Hỏa!',
    icon: '🚀',
    tags: ['Vũ trụ sao băng', 'Tăng tốc', 'Cộng điểm'],
    recommendedTime: '35s / lượt'
  },
  {
    id: 'lucky-card-shuffle',
    number: '06',
    title: 'AI LÀ NGƯỜI MAY MẮN?',
    subtitle: '3D Magic Card Shuffle',
    badge: 'Chọn ngẫu nhiên',
    badgeColor: 'bg-gradient-to-r from-sky-400 to-indigo-500 text-white',
    description: 'Các thẻ bài học sinh xáo trộn 3D với tốc độ chóng mặt, lật mở thẻ học sinh may mắn được mời lên bảng trả lời câu hỏi.',
    icon: '🃏',
    tags: ['Xáo bài 3D', 'Lật thẻ', 'Toàn bộ học sinh'],
    recommendedTime: '15s / lượt'
  },
  {
    id: 'knowledge-maze',
    number: '07',
    title: 'MÊ CUNG TRI THỨC',
    subtitle: 'Knowledge Maze Runner',
    badge: 'Trí tuệ',
    badgeColor: 'bg-gradient-to-r from-teal-400 to-emerald-600 text-slate-950',
    description: 'Vượt qua các ngã rẽ mê cung kỳ thú, trả lời đúng các câu hỏi về Internet và WWW để mở khóa cánh cửa thoát ra đầu tiên!',
    icon: '🧩',
    tags: ['Vượt ải', 'Mê cung', 'Kiến thức Bài 6'],
    recommendedTime: '45s / lượt'
  },
  {
    id: 'ball-cannon',
    number: '08',
    title: 'BẮN BÓNG TRÚNG ĐÍCH',
    subtitle: 'Ball Cannon Target Strike',
    badge: 'Khéo léo',
    badgeColor: 'bg-gradient-to-r from-orange-400 to-red-500 text-white',
    description: 'Khẩu pháo bắn bóng năng lượng theo đường parabol ngắm chuẩn mục tiêu của các đội, nổ tung pháo hoa rực rỡ khi trúng đích!',
    icon: '🎯',
    tags: ['Bắn bóng', 'Vật lý bay', 'Pháo hoa'],
    recommendedTime: '20s / lượt'
  }
];

export class GameStorageService {
  constructor() {
    this.config = this.loadConfig();
  }

  getConfig() {
    if (!this.config) {
      this.config = this.loadConfig();
    }
    return this.config;
  }

  loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.teams) && parsed.teams.length > 0) {
          // Ensure every team has a characterId & characterImage
          parsed.teams = parsed.teams.map((t, idx) => {
            if (t.characterImage) return t;
            const preset = CHARACTER_PRESETS[idx % CHARACTER_PRESETS.length];
            return {
              ...t,
              characterId: t.characterId || preset.id,
              characterImage: preset.image
            };
          });
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error loading Game Center config, fallback to default:", e);
    }

    const initial = {
      version: 2,
      teams: JSON.parse(JSON.stringify(DEFAULT_TEAMS)),
      students: JSON.parse(JSON.stringify(DEFAULT_STUDENTS_6A)),
      gameMode: 'team', // 'team' | 'individual'
      activeGameId: 'boat-race',
      settings: {
        roundDuration: 25,
        soundEnabled: true,
        bgmEnabled: true,
        gameSpeed: 1.0,
      },
      secretControl: {
        mode: 'fair_random', // 'fair_random' | 'teacher_rigged' | 'weighted_random'
        targetTeamId: 'TEAM_1',
        targetStudentId: 'STU_01',
      },
      history: []
    };

    this.saveConfig(initial);
    return initial;
  }

  saveConfig(newConfig = this.config) {
    this.config = { ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.warn("Error saving Game Center config to localStorage:", e);
    }
    return this.config;
  }

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.config = this.loadConfig();
    return this.config;
  }

  // --- TEAM OPERATIONS ---
  getTeams() {
    return this.config.teams || [];
  }

  addTeam(teamData) {
    const newId = `TEAM_${Date.now()}`;
    const nextNumber = this.config.teams.length + 1;
    const colorPreset = PRESET_COLORS[(nextNumber - 1) % PRESET_COLORS.length];

    const newTeam = {
      id: newId,
      number: nextNumber,
      name: teamData.name || `Đội Mới (Nhóm ${nextNumber})`,
      shortName: teamData.shortName || `Nhóm ${nextNumber}`,
      icon: teamData.icon || PRESET_ICONS[(nextNumber - 1) % PRESET_ICONS.length],
      color: teamData.color || colorPreset.color,
      gradient: teamData.gradient || colorPreset.gradient,
      avatar: teamData.avatar || PRESET_ICONS[(nextNumber - 1) % PRESET_ICONS.length],
      score: 0,
      wins: 0,
      ...teamData
    };

    this.config.teams.push(newTeam);
    this.saveConfig();
    return newTeam;
  }

  updateTeam(id, updates) {
    const idx = this.config.teams.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.config.teams[idx] = { ...this.config.teams[idx], ...updates };
      this.saveConfig();
      return this.config.teams[idx];
    }
    return null;
  }

  deleteTeam(id) {
    this.config.teams = this.config.teams.filter(t => t.id !== id);
    // Re-index team numbers
    this.config.teams.forEach((t, i) => {
      t.number = i + 1;
    });
    this.saveConfig();
    return this.config.teams;
  }

  addScore(teamId, delta = 10) {
    const team = this.config.teams.find(t => t.id === teamId);
    if (team) {
      team.score = Math.max(0, (team.score || 0) + delta);
      if (delta > 0) team.wins = (team.wins || 0) + 1;
      this.saveConfig();
    }
    return team;
  }

  // --- STUDENT OPERATIONS ---
  getStudents() {
    return this.config.students || [];
  }

  addStudent(studentData) {
    const newId = `STU_${Date.now()}`;
    const nextCode = `HS${String(this.config.students.length + 1).padStart(2, '0')}`;
    const newStudent = {
      id: newId,
      code: nextCode,
      name: studentData.name || 'Học sinh mới',
      teamId: studentData.teamId || (this.config.teams[0]?.id || 'TEAM_1'),
      avatar: studentData.avatar || PRESET_AVATARS[this.config.students.length % PRESET_AVATARS.length],
      answeredCount: 0,
      isCalled: false,
      ...studentData
    };
    this.config.students.push(newStudent);
    this.saveConfig();
    return newStudent;
  }

  updateStudent(id, updates) {
    const idx = this.config.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.config.students[idx] = { ...this.config.students[idx], ...updates };
      this.saveConfig();
      return this.config.students[idx];
    }
    return null;
  }

  deleteStudent(id) {
    this.config.students = this.config.students.filter(s => s.id !== id);
    this.saveConfig();
    return this.config.students;
  }

  markStudentCalled(id) {
    const student = this.config.students.find(s => s.id === id);
    if (student) {
      student.isCalled = true;
      student.answeredCount = (student.answeredCount || 0) + 1;
      this.saveConfig();
    }
    return student;
  }

  resetCalledStatus() {
    this.config.students.forEach(s => {
      s.isCalled = false;
    });
    this.saveConfig();
  }

  // --- SECRET RIGGING & PRIORITY CONTROL ---
  getSecretControl() {
    return this.config.secretControl || {
      mode: 'fair_random',
      targetTeamId: this.config.teams[0]?.id,
      targetStudentId: this.config.students[0]?.id
    };
  }

  setSecretControl(secretUpdates) {
    this.config.secretControl = {
      ...this.config.secretControl,
      ...secretUpdates
    };
    this.saveConfig();
    return this.config.secretControl;
  }

  setRiggedTeamByNumber(teamNumber) {
    const team = this.config.teams.find(t => t.number === teamNumber);
    if (team) {
      this.config.secretControl.mode = 'teacher_rigged';
      this.config.secretControl.targetTeamId = team.id;
      this.saveConfig();
      return team;
    }
    return null;
  }

  // --- GAME MODE & ACTIVE GAME ---
  getGameMode() {
    return this.config.gameMode || 'team';
  }

  setGameMode(mode) {
    this.config.gameMode = mode;
    this.saveConfig();
  }

  getActiveGameId() {
    return this.config.activeGameId || 'boat-race';
  }

  setActiveGameId(id) {
    this.config.activeGameId = id;
    this.saveConfig();
  }

  recordHistory(result) {
    if (!this.config.history) this.config.history = [];
    this.config.history.unshift({
      id: `HIST_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...result
    });
    if (this.config.history.length > 50) this.config.history.pop();
    this.saveConfig();
  }
}

export const gameStorage = new GameStorageService();

// Standalone Functional Exports for easy importing across components
export const loadGameConfig = () => gameStorage.getConfig();
export const saveGameConfig = (cfg) => gameStorage.saveConfig(cfg);
export const loadSecretControl = () => gameStorage.getSecretControl();
export const saveSecretControl = (sec) => gameStorage.setSecretControl(sec);
export const recordGameResult = (res) => gameStorage.recordHistory(res);
