import React, { useRef, useState, useEffect } from 'react';
import {
  Play, Maximize2, Minimize2, ExternalLink, Bot, BarChart3,
  Image as ImageIcon, BookOpen, Clock, Layers, Sparkles, ChevronRight, RefreshCw, Gamepad2
} from 'lucide-react';

export default function LessonSlidePresentation({ onSwitchTab }) {
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Quick activity jumps mapped to slide indexes (Tiết 11 kết thúc ở Đáp án 2.3):
  // Slide 0: Bìa tiết dạy Bài 6 & Khởi động (HĐ 1)
  // Slide 1 (2.1): Hoạt động 2.1 - Giao việc Mục 1 & Đồng hồ đếm ngược (Nhóm 1 & 2)
  // Slide 2 (Đáp án 2.1): Báo cáo & Đáp án chuẩn hóa Mục 1 (Nhóm 1 & 2)
  // Slide 3 (2.3): Hoạt động 2.3 - Giao việc Mục 2 & Đồng hồ đếm ngược (Nhóm 3 & 4)
  // Slide 4 (Đáp án 2.3): Báo cáo & Đáp án chuẩn hóa Mục 2 (Kết thúc tiết học)
  const ACTIVITIES = [
    { tag: 'HĐ 1', title: 'Khởi Động', desc: 'HĐ 1: Bìa & Khởi động tiết dạy', index: 0 },
    { tag: '2.1', title: 'Nhiệm vụ 1', desc: 'HĐ 2.1: Giao việc Mục 1 SGK (Nhóm 1 & 2)', index: 1 },
    { tag: 'Đáp án 2.1', title: 'Chuẩn hóa Mục 1', desc: 'Báo cáo & Đáp án chuẩn hóa Mục 1', index: 2 },
    { tag: '2.3', title: 'Nhiệm vụ 2', desc: 'HĐ 2.3: Giao việc Mục 2 SGK (Nhóm 3 & 4)', index: 3 },
    { tag: 'Đáp án 2.3', title: 'Chuẩn hóa Mục 2', desc: 'Báo cáo & Đáp án chuẩn hóa Mục 2 (Kết thúc bài học)', index: 4 }
  ];

  // Send message to slide iframe
  const jumpToSlide = (index) => {
    setActiveSlideIndex(index);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'GO_TO_SLIDE', index }, '*');
    }
  };

  // Toggle browser fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.warn);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.warn);
      }
    }
  };

  // Open slide in dedicated popup window
  const openInNewWindow = () => {
    window.open('/slide_trinh_chieu_tinhoc6_bai06.html', '_blank', 'noopener,noreferrer');
  };

  // Listen for navigation messages from the slide presentation iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'SWITCH_TAB' && onSwitchTab) {
        onSwitchTab(event.data.tab);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSwitchTab]);

  return (
    <div className="w-full h-full flex flex-col bg-[#030712] text-white overflow-hidden">
      {/* Top Slide Control Strip */}
      <header className="px-3 sm:px-4 py-2 bg-slate-900/95 border-b border-cyan-500/30 flex items-center justify-between gap-2 shrink-0 backdrop-blur-md z-20 overflow-x-auto">

        {/* Left: Lesson Badge & Teacher Info */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                BÀI 6 • TIẾT 11
              </span>
              <h2 className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-indigo-300 uppercase tracking-tight">
                MẠNG THÔNG TIN TOÀN CẦU (WWW)
              </h2>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Trường THCS Đắk Trôi • GV: <span className="text-slate-200 font-bold">Thầy Trần Đức Tình</span>
            </p>
          </div>
        </div>

        {/* Center: Quick Activity Jump Pills */}
        <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          {ACTIVITIES.map((act) => {
            const isActive = activeSlideIndex === act.index;
            return (
              <button
                key={act.index}
                onClick={() => jumpToSlide(act.index)}
                title={act.desc}
                className={`px-2 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-black ${
                  isActive ? 'bg-slate-950/30 text-slate-950' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {act.tag}
                </span>
                <span className={`${isActive ? 'inline' : 'hidden xl:inline'} font-semibold text-[11px]`}>
                  {act.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Specialized Classroom Tool Switchers & Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Jump to Mark AI */}
          <button
            onClick={() => onSwitchTab && onSwitchTab('webby-agent')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 transition-all shadow-sm"
            title="Mở Trợ lý Mark AI (Giọng nói 3D)"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Mark AI</span>
          </button>

          {/* Jump to Game Center */}
          <button
            onClick={() => onSwitchTab && onSwitchTab('game-center')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 text-amber-300 transition-all shadow-sm"
            title="Mở Trung Tâm Trò Chơi Thử Thách Bài 6 (8 Games)"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Đấu Trường Game</span>
          </button>

          {/* Jump to Live QR Arena */}
          <button
            onClick={() => onSwitchTab && onSwitchTab('qr-assessment')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-400/50 text-amber-200 transition-all shadow-sm"
            title="Mở Đấu trường Khảo sát thẻ QR / Quizizz"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Đấu trường QR</span>
          </button>

          {/* Open Printable/Projectable Worksheet */}
          <button
            onClick={() => window.open('/phieu_hoc_tap_tin6_bai06.html', '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 transition-all shadow-sm"
            title="Mở Phiếu học tập (Hoạt động 2.1 & 2.3) để chiếu cho HS trình bày / In A4"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Phiếu Học Tập</span>
          </button>

          {/* Open in dedicated new window */}
          <button
            onClick={openInNewWindow}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
            title="Mở Slide ở tab trình duyệt riêng biệt"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Cửa sổ riêng</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
            title="Toàn màn hình máy chiếu (Phím F / F11)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>

      </header>

      {/* Main Slide Interactive Frame */}
      <main className="flex-1 w-full h-full relative overflow-hidden bg-black">
        <iframe
          ref={iframeRef}
          src="/slide_trinh_chieu_tinhoc6_bai06.html"
          title="Trình chiếu Tin học 6 - Bài 6: Mạng thông tin toàn cầu"
          className="w-full h-full border-0 absolute inset-0"
          allow="autoplay; fullscreen; microphone"
        />
      </main>
    </div>
  );
}


