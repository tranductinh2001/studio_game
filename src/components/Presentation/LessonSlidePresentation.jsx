import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, Maximize2, Minimize2, ExternalLink, Bot, BarChart3, 
  Image as ImageIcon, BookOpen, Clock, Layers, Sparkles, ChevronRight, RefreshCw, Gamepad2
} from 'lucide-react';

export default function LessonSlidePresentation({ onSwitchTab }) {
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Quick activity jumps mapped to slide indexes:
  // Slide 0: Bìa tiết dạy Bài 6 & Khởi động
  // Slide 1 (2.1): Tiến trình 1 - Giao việc Mục 1 & Đồng hồ đếm ngược 60/40 (Nhóm 1&2)
  // Slide 2 (2.2): Tiến trình 1 - Báo cáo & Chuẩn hóa Mục 1 (Đáp án Nhóm 1&2)
  // Slide 3 (2.3): Tiến trình 2 - Giao việc Mục 2 & Đồng hồ đếm ngược 60/40 (Nhóm 3&4)
  // Slide 4 (2.4): Tiến trình 2 - Báo cáo & Chuẩn hóa Mục 2 (Simulator gõ URL thật)
  // Slide 5 (2.5): Chuẩn hóa toàn bài 6 (Ghi vở 2 cột 50/50) ➜ Quizizz Q-Cards
  // Slide 6 (HĐ 4): Hoạt động 4 - Vận dụng thực hành & 5 Bí quyết tỏa sáng
  const ACTIVITIES = [
    { label: 'Bìa & Khởi Động', index: 0, tag: 'HĐ 1' },
    { label: '2.1: Mục 1 + Timer', index: 1, tag: '2.1' },
    { label: '2.2: Báo Cáo Mục 1', index: 2, tag: '2.2' },
    { label: '2.3: Mục 2 + Timer', index: 3, tag: '2.3' },
    { label: '2.4: Báo Cáo Mục 2', index: 4, tag: '2.4' },
    { label: '2.5: Chuẩn Hóa Ghi Vở', index: 5, tag: '2.5' },
    { label: 'HĐ 4: Vận Dụng', index: 6, tag: 'HĐ 4' }
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
      <header className="px-3 sm:px-5 py-2.5 bg-slate-900/90 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md z-20">
        
        {/* Left: Lesson Badge & Teacher Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                BÀI 6 • TIẾT 11
              </span>
              <h2 className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-indigo-300 uppercase tracking-tight">
                MẠNG THÔNG TIN TOÀN CẦU (WWW)
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              Trường THCS Đắk Trôi • Giáo viên: <span className="text-slate-200 font-bold">Thầy Trần Đức Tình</span>
            </p>
          </div>
        </div>

        {/* Center: Quick Activity Jump Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          {ACTIVITIES.map((act) => (
            <button
              key={act.index}
              onClick={() => jumpToSlide(act.index)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1 ${
                activeSlideIndex === act.index 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="font-mono text-[10px] opacity-80">{act.tag}</span>
              <span className="hidden md:inline">{act.label.split(':')[0]}</span>
            </button>
          ))}
        </div>

        {/* Right: Specialized Classroom Tool Switchers & Controls */}
        <div className="flex items-center gap-2">
          {/* Jump to Webby AI */}
          <button
            onClick={() => onSwitchTab && onSwitchTab('webby-agent')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 transition-all shadow-sm"
            title="Mở Đại sứ Webby AI (Giọng nói 3D)"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>Webby AI</span>
          </button>

          {/* Jump to Game Center */}
          <button
            onClick={() => onSwitchTab && onSwitchTab('game-center')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 text-amber-300 transition-all shadow-sm"
            title="Mở Trung Tâm Trò Chơi Thử Thách Bài 6 (8 Games)"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Đấu Trường Game</span>
          </button>

          {/* Jump to Live QR Arena */}
          <button
            onClick={() => onSwitchTab && onSwitchTab('qr-assessment')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-400/50 text-amber-200 transition-all shadow-sm"
            title="Mở Đấu trường Khảo sát thẻ QR / Quizizz"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Đấu trường Quizizz / QR</span>
          </button>

          {/* Open in dedicated new window */}
          <button
            onClick={openInNewWindow}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
            title="Mở Slide ở tab trình duyệt riêng biệt"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Cửa sổ riêng</span>
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

