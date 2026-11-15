import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Globe2, X } from 'lucide-react';

export default function IntroBanner({ onClose }) {
  useEffect(() => {
    // Fire celebratory confetti cannons
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#00f2fe', '#4facfe', '#00c6ff', '#ffffff', '#ffd700']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#00f2fe', '#4facfe', '#00c6ff', '#ffffff', '#ffd700']
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-4xl w-full p-8 md:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 via-indigo-950/90 to-slate-950/90 border-2 border-cyan-400 shadow-[0_0_80px_rgba(0,242,254,0.4)] text-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Đóng thông báo"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold text-sm md:text-base mb-6 tracking-widest uppercase">
          <Globe2 className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          <span>Chào Mừng Đến Với Tiết Học</span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>

        {/* Main Lesson Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-300 tracking-tight mb-4 drop-shadow-[0_5px_15px_rgba(0,242,254,0.4)] font-['Orbitron',sans-serif]">
          BÀI 6: MẠNG THÔNG TIN TOÀN CẦU
        </h1>

        <p className="text-xl md:text-3xl text-cyan-200/90 font-medium mb-8">
          WORLD WIDE WEB (WWW) & KẾT NỐI TRI THỨC
        </p>

        {/* Lesson Objectives Pill Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto mb-8 text-left text-sm md:text-base">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-cyan-500/30 flex items-center gap-3">
            <span className="text-xl">🌐</span>
            <span className="text-slate-200">Hiểu về Mạng thông tin toàn cầu (WWW)</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-cyan-500/30 flex items-center gap-3">
            <span className="text-xl">📄</span>
            <span className="text-slate-200">Phân biệt Website, Trang web & Trang chủ</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-cyan-500/30 flex items-center gap-3">
            <span className="text-xl">🔗</span>
            <span className="text-slate-200">Khám phá Siêu liên kết & Trình duyệt web</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-lg shadow-[0_0_30px_rgba(0,242,254,0.5)] transition-all hover:scale-105 active:scale-95"
        >
          BẮT ĐẦU BÀI HỌC CÙNG THẦY CÔ 🚀
        </button>
      </div>
    </div>
  );
}

