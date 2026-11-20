import React from 'react';
import { 
  Ship, Compass, Disc, Gift, Rocket, 
  Shuffle, Target, Sparkles, Play, Award, Zap, Users
} from 'lucide-react';
import { gameAudio } from './services/gameAudioSynth';

export const GAME_CATALOG_LIST = [
  {
    id: 'game-01-boat-race',
    number: '01',
    title: 'Đua Thuyền Vượt Sóng',
    tagline: 'Game show chính - Đua tốc độ gay cấn trên biển',
    description: 'Các đội thuyền rồng lướt sóng biển, vượt qua sóng lớn và bứt phá về đích trong tiếng reo hò cổ vũ sôi động.',
    icon: '⛵',
    badge: 'Ưu Tiên Số 1 ⭐',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    colorFrom: 'from-blue-600',
    colorTo: 'to-cyan-500',
    borderColor: 'hover:border-cyan-400',
    recommendedMode: 'team',
    componentName: 'BoatRaceGame'
  },
  {
    id: 'game-02-duck-race',
    number: '02',
    title: 'Đua Vịt Vượt Sông',
    tagline: 'Vui nhộn, hóm hỉnh với dàn vịt ngộ nghĩnh',
    description: 'Mỗi đội là một chú vịt vàng đáng yêu bơi lội qua dòng suối mát lành, vượt thác ghềnh và tạo sóng nước sống động.',
    icon: '🦆',
    badge: 'Vui Nhộn',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
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
    tagline: 'Vòng xoay kim chỉ quyết định vận may',
    description: 'Vòng quay nhiều màu sắc với âm thanh tích tắc hồi hộp, kim chỉ dừng lại chuẩn xác tại nhóm hoặc cá nhân được chọn.',
    icon: '🎡',
    badge: 'Kinh Điển',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
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
    tagline: 'Mở hộp quà 3D rực rỡ nhận bất ngờ',
    description: 'Hàng loạt hộp quà lấp lánh với nắp hộp bung mở hiệu ứng ánh sáng và pháo giấy, trao tặng vinh quang và câu hỏi thử thách.',
    icon: '🎁',
    badge: 'Bất Ngờ',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
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
    tagline: 'Du hành ngân hà - Phóng tên lửa vũ trụ',
    description: 'Phi thuyền không gian với động cơ phản lực rực lửa, bứt tốc qua dải thiên hà về Trạm Không Gian để ghi điểm thi đua.',
    icon: '🚀',
    badge: 'Công Nghệ Cao',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
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
    tagline: 'Xáo bài 3D - Chọn học sinh lên bảng',
    description: 'Bộ thẻ bài ma thuật tráo đổi vị trí liên hồi trước khi lật mở gương mặt học sinh may mắn nhất trả lời câu hỏi.',
    icon: '🎴',
    badge: 'Chọn Cá Nhân',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
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
    tagline: 'Vượt 5 cổng thử thách thoát khỏi mê cung',
    description: 'Đội thi giải mã các câu hỏi then chốt về Mạng thông tin toàn cầu để mở khóa chìa khóa vạn năng tiến thẳng về đích.',
    icon: '🧭',
    badge: 'Tư Duy',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
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
    tagline: 'Khai hỏa pháo thần công bắn trúng hồng tâm',
    description: 'Căn lực và góc bắn chuẩn xác, quả bóng bay theo quỹ đạo parabol chạm nổ mục tiêu đội được chọn trong tiếng reo hò.',
    icon: '🎯',
    badge: 'Kỹ Năng',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    colorFrom: 'from-amber-600',
    colorTo: 'to-yellow-500',
    borderColor: 'hover:border-yellow-400',
    recommendedMode: 'both',
    componentName: 'BallCannonGame'
  }
];

export default function GameCatalog({ onSelectGame, currentMode = 'team' }) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 overflow-y-auto">
      {/* Hero Banner */}
      <div className="relative w-full rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-2 border-indigo-500/40 p-6 md:p-8 shadow-2xl overflow-hidden mb-6">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                TRUNG TÂM TRÒ CHƠI BÀI 6
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Tin học 6 • THCS Đắk Trôi
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-amber-300">
              ĐẤU TRƯỜNG THỬ THÁCH TRI THỨC
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Khu vực trò chơi tương tác công nghệ cao dành cho giáo viên và học sinh: củng cố kiến thức Bài 6 (Mạng thông tin toàn cầu), chọn nhóm trả lời câu hỏi và thi đua sôi nổi trong tiết thao giảng.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Trò Chơi Sẵn Sàng</div>
              <div className="text-xl font-black text-amber-300">8 Trò Chơi</div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Chế Độ Hiện Tại</div>
              <div className="text-xl font-black text-emerald-400">
                {currentMode === 'team' ? 'Thi Đua Nhóm' : 'Chọn Cá Nhân'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 flex-1">
        {GAME_CATALOG_LIST.map((game) => (
          <div
            key={game.id}
            onMouseEnter={() => gameAudio.playTick()}
            onClick={() => onSelectGame(game.id)}
            className={`group relative rounded-3xl bg-slate-900/90 border-2 border-slate-800 ${game.borderColor} p-5 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer overflow-hidden backdrop-blur-sm`}
          >
            {/* Top Glow on hover */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${game.colorFrom} ${game.colorTo} opacity-40 group-hover:opacity-100 transition-opacity`} />

            <div>
              {/* Card Header: Icon & Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${game.colorFrom} ${game.colorTo} p-0.5 shadow-lg`}>
                  <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center text-2xl">
                    {game.icon}
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${game.badgeColor}`}>
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

              <p className="text-xs font-semibold text-indigo-300 mt-1 line-clamp-1">
                {game.tagline}
              </p>

              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {game.description}
              </p>
            </div>

            {/* Bottom Button */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                {game.recommendedMode === 'team' ? '👥 Dành cho nhóm' : game.recommendedMode === 'individual' ? '👤 Dành cho cá nhân' : '👥👤 Đa năng'}
              </span>

              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r ${game.colorFrom} ${game.colorTo} text-white font-black text-xs shadow-md group-hover:scale-105 transition-all`}
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
