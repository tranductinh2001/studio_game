import React from 'react';
import { 
  Sparkles, Play, Award, Zap, Users, User, ShieldCheck
} from 'lucide-react';
import { gameAudio } from './services/gameAudioSynth';

export const GAME_CATALOG_LIST = [
  {
    id: 'game-01-boat-race',
    number: '01',
    title: 'Đua Thuyền Vượt Sóng',
    tagline: '2D Cartoon Ocean - Đua thuyền rồng vượt đại dương',
    description: 'Thuyền đua 2D hoạt hình lướt sóng biển rộn rã, bứt phá về đích trong tiếng reo hò sôi động.',
    icon: '⛵',
    badge: 'Game Chính ⭐',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
    colorFrom: 'from-blue-600',
    colorTo: 'to-cyan-500',
    borderColor: 'hover:border-cyan-400',
    recommendedMode: 'team',
    componentName: 'BoatRaceGame'
  },
  {
    id: 'game-02-duck-race',
    number: '02',
    title: 'Đua Vịt Vui Nhộn',
    tagline: '2D River Sprint - Dàn vịt vàng bơi suối ngộ nghĩnh',
    description: 'Những chú vịt vàng đội mũ ngộ nghĩnh quẫy nước vượt suối mát lành, cán đích tại cầu gỗ cổ kính.',
    icon: '🦆',
    badge: 'Vui Nhộn',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50',
    colorFrom: 'from-amber-500',
    colorTo: 'to-orange-500',
    borderColor: 'hover:border-amber-400',
    recommendedMode: 'team',
    componentName: 'DuckRaceGame'
  },
  {
    id: 'game-03-lucky-wheel',
    number: '03',
    title: 'Vòng Quay May Mắn',
    tagline: '2D Game Show Wheel - Đèn viền nhấp nháy, kim chỉ chuẩn',
    description: 'Bánh xe game show rực rỡ với chốt cơ học tích tắc sống động, hãm phanh dừng chuẩn xác 100%.',
    icon: '🎡',
    badge: 'Kinh Điển',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/50',
    colorFrom: 'from-purple-600',
    colorTo: 'to-pink-600',
    borderColor: 'hover:border-purple-400',
    recommendedMode: 'both',
    componentName: 'LuckyWheelGame'
  },
  {
    id: 'game-04-mystery-box',
    number: '04',
    title: 'Hộp Quà Bí Ẩn',
    tagline: '2D Mystery Gift - Nắp quà bung mở ánh sáng hào quang',
    description: 'Dãy hộp quà rực rỡ thắt nơ vàng kim; chạm mở bung nắp phóng tia sáng và trao tặng vinh quang.',
    icon: '🎁',
    badge: 'Bất Ngờ',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/50',
    colorFrom: 'from-rose-600',
    colorTo: 'to-red-500',
    borderColor: 'hover:border-rose-400',
    recommendedMode: 'both',
    componentName: 'MysteryBoxesGame'
  },
  {
    id: 'game-05-rocket-space',
    number: '05',
    title: 'Tên Lửa Chinh Phục Vũ Trụ',
    tagline: '2D Cosmic Odyssey - Phóng phi thuyền từ Trái Đất',
    description: 'Tên lửa không gian 2D với động cơ phản lực phun lửa rực rỡ, bứt tốc qua thiên hà đến Trạm Sao Hỏa.',
    icon: '🚀',
    badge: 'Công Nghệ Cao',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50',
    colorFrom: 'from-indigo-600',
    colorTo: 'to-violet-500',
    borderColor: 'hover:border-indigo-400',
    recommendedMode: 'team',
    componentName: 'RocketSpaceGame'
  },
  {
    id: 'game-06-lucky-shuffle',
    number: '06',
    title: 'Ai Là Người May Mắn?',
    tagline: '2.5D Holographic Cards - Xáo bài và lật mở gương mặt',
    description: 'Bộ thẻ bài ma thuật 2.5D tráo đổi vị trí liên hồi trước khi lật mở gương mặt học sinh may mắn.',
    icon: '🎴',
    badge: 'Chọn Cá Nhân',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/50',
    colorFrom: 'from-sky-600',
    colorTo: 'to-teal-500',
    borderColor: 'hover:border-sky-400',
    recommendedMode: 'individual',
    componentName: 'LuckyCardShuffleGame'
  },
  {
    id: 'game-07-knowledge-maze',
    number: '07',
    title: 'Mê Cung Tri Thức',
    tagline: '2D Labyrinth Quest - Vượt 5 cửa ải thần kỳ',
    description: 'Quân cờ thám hiểm giải mã câu hỏi trọng tâm Bài 6 để mở khóa các cánh cổng tiến tới Rương Kho Báu.',
    icon: '🧭',
    badge: 'Tư Duy',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
    colorFrom: 'from-emerald-600',
    colorTo: 'to-teal-600',
    borderColor: 'hover:border-emerald-400',
    recommendedMode: 'team',
    componentName: 'KnowledgeMazeGame'
  },
  {
    id: 'game-08-ball-cannon',
    number: '08',
    title: 'Bắn Bóng Trúng Đích',
    tagline: '2D Carnival Cannon - Pháo thần công bắn trúng tâm vàng',
    description: 'Khẩu pháo đồng hoạt hình ngắm góc bắn, bóng bay theo parabol chạm nổ mục tiêu nhận điểm thưởng.',
    icon: '🎯',
    badge: 'Kỹ Năng',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
    colorFrom: 'from-amber-600',
    colorTo: 'to-yellow-500',
    borderColor: 'hover:border-yellow-400',
    recommendedMode: 'both',
    componentName: 'BallCannonGame'
  }
];

export default function GameCatalog({ onSelectGame, currentMode = 'team' }) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-4 md:p-6 overflow-y-auto select-none bg-slate-950 font-sans">
      {/* 3D Cinematic Gameshow Banner */}
      <div className="relative w-full rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 p-5 md:p-6 shadow-2xl overflow-hidden mb-5 shrink-0">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                ĐẤU TRƯỜNG HOẠT HÌNH 2D CARTOON
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Tin học 6 • THCS Đắk Trôi (Thầy Trần Đức Tình)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-amber-300">
              TRUNG TÂM TRÒ CHƠI 2D CARTOON PREMIUM
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Trải nghiệm 8 trò chơi hoạt hình 2D rực rỡ, mượt mà và sống động củng cố kiến thức Bài 6: Mạng thông tin toàn cầu (WWW), chọn nhóm/cá nhân trả lời câu hỏi và thi đua sôi nổi trong tiết thao giảng.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-center shadow-lg min-w-[125px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Trò Chơi Sẵn Sàng</div>
              <div className="text-lg sm:text-xl font-black text-amber-300">8 Trò Chơi</div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-center shadow-lg min-w-[140px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Chế Độ Thi Đấu</div>
              <div className="text-lg sm:text-xl font-black text-cyan-400">
                {currentMode === 'team' ? '👥 Thi Đấu Nhóm' : '👤 Chọn Cá Nhân'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Games 3D Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 flex-1">
        {GAME_CATALOG_LIST.map((game) => (
          <div
            key={game.id}
            data-game-id={game.id}
            onMouseEnter={() => gameAudio.playTick()}
            onClick={() => onSelectGame(game.id)}
            className={`group relative rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950 border-2 border-slate-800 ${game.borderColor} p-5 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer overflow-hidden backdrop-blur-md`}
          >
            {/* Top Glow bar on hover */}
            <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${game.colorFrom} ${game.colorTo} opacity-40 group-hover:opacity-100 transition-opacity`} />

            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${game.colorFrom} ${game.colorTo} p-0.5 shadow-xl`}>
                  <div className="w-full h-full bg-slate-950/50 rounded-[14px] flex items-center justify-center text-3xl">
                    {game.icon}
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${game.badgeColor}`}>
                  {game.badge}
                </span>
              </div>

              {/* Number and Title */}
              <div className="text-[11px] font-black text-slate-500 tracking-wider">
                TRÒ CHƠI {game.number}
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors mt-0.5">
                {game.title}
              </h3>

              <p className="text-xs font-semibold text-cyan-300 mt-1 leading-snug">
                {game.tagline}
              </p>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed min-h-[38px]">
                {game.description}
              </p>
            </div>

            {/* Bottom Button */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                {game.recommendedMode === 'team' ? '👥 Dành cho nhóm' : game.recommendedMode === 'individual' ? '👤 Dành cho cá nhân' : '👥👤 Đa năng'}
              </span>

              <button
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r ${game.colorFrom} ${game.colorTo} text-white font-black text-xs shadow-md group-hover:scale-105 transition-all active:scale-95`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                CHƠI NGAY
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
