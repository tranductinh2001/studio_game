import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Settings, Volume2, VolumeX, Shield, 
  Users, User, Trophy, Sparkles, HelpCircle, MonitorPlay
} from 'lucide-react';
import { gameAudio } from './services/gameAudioSynth';

export default function GameCenterHeader({
  activeGame,
  onBackToCatalog,
  onOpenConfig,
  onToggleSecretPanel,
  isSecretPanelOpen,
  settings,
  onUpdateSettings,
  onExitToSlides
}) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(gameAudio.isMuted);
  }, []);

  const handleToggleMute = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
    if (onUpdateSettings) {
      onUpdateSettings({ soundEnabled: !muted });
    }
  };

  const handleToggleMode = () => {
    const newMode = settings.mode === 'individual' ? 'team' : 'individual';
    if (onUpdateSettings) {
      onUpdateSettings({ mode: newMode });
    }
    gameAudio.playTick();
  };

  return (
    <header className="w-full h-16 bg-slate-950/90 backdrop-blur-md border-b border-indigo-900/40 px-4 md:px-6 flex items-center justify-between z-30 select-none">
      {/* Left Section: Back / Title */}
      <div className="flex items-center gap-3">
        {activeGame ? (
          <button
            onClick={onBackToCatalog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-bold text-xs transition-all active:scale-95"
            title="Quay về danh sách trò chơi"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Danh Sách Trò Chơi</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-lg">
                🎮
              </div>
            </div>
            <div>
              <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
                TRUNG TÂM TRÒ CHƠI BÀI 6
              </div>
              <div className="text-[10px] font-medium text-slate-400">
                Tin học 6 • THCS Đắk Trôi
              </div>
            </div>
          </div>
        )}

        {activeGame && (
          <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-slate-800">
            <span className="text-xl">{activeGame.icon}</span>
            <div>
              <div className="text-xs font-black text-amber-300 uppercase tracking-wide">
                {activeGame.title}
              </div>
              <div className="text-[11px] text-slate-300 font-medium truncate max-w-[380px] lg:max-w-[480px]">
                {activeGame.tagline}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center: Mode Badge */}
      <div className="hidden lg:flex items-center gap-2">
        <button
          onClick={handleToggleMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            settings.mode === 'individual'
              ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
          }`}
          title="Nhấn để đổi giữa Chế độ Nhóm và Chế độ Học sinh cá nhân"
        >
          {settings.mode === 'individual' ? (
            <>
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Chế độ: Chọn Cá Nhân</span>
            </>
          ) : (
            <>
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chế độ: Thi Đấu Nhóm (6 Đội)</span>
            </>
          )}
        </button>
      </div>

      {/* Right Section: Tool Controls */}
      <div className="flex items-center gap-2">
        {/* Audio Mute/Unmute */}
        <button
          onClick={handleToggleMute}
          className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
            isMuted 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
          }`}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Secret Teacher Rigging Panel Toggle (Shift+G or F2) */}
        <button
          onClick={onToggleSecretPanel}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            isSecretPanelOpen
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-400 hover:text-slate-200'
          }`}
          title="Bảng điều khiển bí mật của giáo viên (Phím tắt: F2 hoặc Shift+G)"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Bảng Bí Mật</span>
          <span className="text-[10px] text-slate-500 font-mono">F2</span>
        </button>

        {/* Teacher Configuration Modal */}
        <button
          onClick={onOpenConfig}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          title="Cấu hình nhóm, học sinh và thiết lập tiết học"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cấu Hình</span>
        </button>

        {/* Exit back to slides */}
        {onExitToSlides && (
          <button
            onClick={onExitToSlides}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all active:scale-95 ml-1"
            title="Quay lại Bài giảng Slide"
          >
            <MonitorPlay className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Slide Bài Giảng</span>
          </button>
        )}
      </div>
    </header>
  );
}

