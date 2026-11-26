import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Clock, Layers, Sparkles, ChevronLeft, ChevronRight,
  Maximize2, Minimize2, Play, Pause, RotateCcw, Award, CheckCircle2,
  AlertCircle, ArrowLeft, ExternalLink, HelpCircle, Eye, Volume2,
  Plus, Check, BarChart3, PieChart, TrendingUp, Table, Save,
  Power, ShieldCheck, Trophy, Sparkle, RefreshCw, X
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PUZZLE_BY_ACTIVITY = {
  0: {
    title: 'GHÉP HÌNH KHỞI ĐỘNG: CHỌN ĐÚNG LOẠI BIỂU ĐỒ',
    subtitle: 'Ghép 3 hình ảnh biểu đồ SGK với mục đích sử dụng tương ứng (HĐ 1)',
    slots: [
      { id: 's1', label: 'So sánh độ lớn giữa các đối tượng', expectedId: 'c_col' },
      { id: 's2', label: 'So sánh tỉ lệ phần trăm (%) trên tổng thể', expectedId: 'c_pie' },
      { id: 's3', label: 'Theo dõi xu hướng tăng/giảm theo thời gian', expectedId: 'c_line' }
    ],
    cards: [
      { id: 'c_line', title: 'Biểu đồ đoạn thẳng', hint: 'Hình 7.3 SGK', img: '/images/tin8_bai7/hinh_7_3_duong_thang.png' },
      { id: 'c_col', title: 'Biểu đồ cột', hint: 'Hình 7.9 SGK', img: '/images/tin8_bai7/hinh_7_9_doanh_thu_phan_mem.png' },
      { id: 'c_pie', title: 'Biểu đồ hình quạt tròn', hint: 'Hình 7.4 SGK', img: '/images/tin8_bai7/hinh_7_4_quat_tron.png' }
    ]
  },
  1: {
    title: 'GHÉP BƯỚC THỰC HÀNH: TẠO BIỂU ĐỒ CỘT (HĐ 2A)',
    subtitle: 'Sắp xếp 4 mảnh ghép hình ảnh & thao tác theo đúng quy trình tạo biểu đồ cột SGK tr.33–34',
    slots: [
      { id: 's1', label: 'Bước 1: Chuẩn bị & chọn vùng dữ liệu', expectedId: 'c1' },
      { id: 's2', label: 'Bước 2: Mở dải lệnh Insert -> Nhóm Charts', expectedId: 'c2' },
      { id: 's3', label: 'Bước 3: Chọn 2-D Column -> Clustered Column', expectedId: 'c3' },
      { id: 's4', label: 'Bước 4: Thêm tiêu đề & nhãn bằng nút (+)', expectedId: 'c4' }
    ],
    cards: [
      { id: 'c3', title: '2-D Column (Clustered Column)', hint: 'Chèn biểu đồ cột', img: '/images/tin8_bai7/hinh_7_5_nhom_charts.png' },
      { id: 'c1', title: 'Quét chọn vùng B2:C8', hint: 'Hình 7.1 SGK tr.32', img: '/images/tin8_bai7/hinh_7_1_bang_khao_sat.png' },
      { id: 'c4', title: 'Nút Chart Elements (+)', hint: 'Hình 7.6 SGK tr.34', img: '/images/tin8_bai7/hinh_7_6_chart_elements_cot.png' },
      { id: 'c2', title: 'Thẻ Insert -> Nhóm Charts', hint: 'Hình 7.5 SGK tr.33', img: '/images/tin8_bai7/hinh_7_5_nhom_charts.png' }
    ]
  },
  2: {
    title: 'GHÉP BƯỚC THỰC HÀNH: BIỂU ĐỒ QUẠT TRÒN & TỈ LỆ % (HĐ 2B)',
    subtitle: 'Ghép đúng thứ tự 4 thao tác tạo biểu đồ hình quạt tròn hiển thị phần trăm % (SGK tr.34)',
    slots: [
      { id: 's1', label: 'Bước 1: Chọn miền dữ liệu khảo sát (B2:C8)', expectedId: 'p1' },
      { id: 's2', label: 'Bước 2: Insert -> Insert Pie or Doughnut Chart -> 2-D Pie', expectedId: 'p2' },
      { id: 's3', label: 'Bước 3: Bấm (+) -> Data Labels -> More Options...', expectedId: 'p3' },
      { id: 's4', label: 'Bước 4: Tích chọn Percentage (%) để hiện tỉ lệ', expectedId: 'p4' }
    ],
    cards: [
      { id: 'p3', title: 'More Options... (Format Data Labels)', hint: 'Hình 7.7 SGK tr.34', img: '/images/tin8_bai7/hinh_7_7_chart_elements_quat.png' },
      { id: 'p1', title: 'Chọn vùng B2:C8', hint: 'Hình 7.1 SGK tr.32', img: '/images/tin8_bai7/hinh_7_1_bang_khao_sat.png' },
      { id: 'p4', title: 'Kết quả hiển thị % hoàn chỉnh', hint: 'Hình 7.4 SGK tr.33', img: '/images/tin8_bai7/hinh_7_4_quat_tron.png' },
      { id: 'p2', title: 'Nhóm lệnh Charts -> 2-D Pie', hint: 'Hình 7.5 SGK tr.33', img: '/images/tin8_bai7/hinh_7_5_nhom_charts.png' }
    ]
  },
  3: {
    title: 'GHÉP THAO TÁC LUYỆN TẬP: BÀI 1 & BÀI 2 SGK TR.35 (HĐ 3)',
    subtitle: 'Ghép đúng công cụ xử lý số liệu & biểu đồ tương ứng với 2 bài tập luyện tập',
    slots: [
      { id: 's1', label: 'Tính tổng thời gian Nam/Nữ (TGSDThietbiso.xlsx)', expectedId: 'l1' },
      { id: 's2', label: 'So sánh thời gian Nam và Nữ theo mục đích', expectedId: 'l2' },
      { id: 's3', label: 'Thể hiện cơ cấu tỉ lệ % từng khoảng thời gian', expectedId: 'l3' },
      { id: 's4', label: 'Quan sát doanh thu phần mềm 2016–2020 (Bài 2)', expectedId: 'l4' }
    ],
    cards: [
      { id: 'l4', title: 'Biểu đồ cột Hình 7.9 (Tăng đều 2016–2020)', hint: 'Bài 2 SGK tr.35', img: '/images/tin8_bai7/hinh_7_9_doanh_thu_phan_mem.png' },
      { id: 'l1', title: 'Hàm =SUM(...) tổng hợp bảng', hint: 'Hình 7.8 SGK tr.35', img: '/images/tin8_bai7/hinh_7_8_bang_thiet_bi_so.png' },
      { id: 'l3', title: 'Biểu đồ hình quạt tròn (2-D Pie)', hint: 'Tỉ lệ phần trăm %', img: '/images/tin8_bai7/hinh_7_4_quat_tron.png' },
      { id: 'l2', title: 'Biểu đồ cột kép (Clustered Column)', hint: 'Nhóm lệnh Charts', img: '/images/tin8_bai7/hinh_7_5_nhom_charts.png' }
    ]
  },
  4: {
    title: 'GHÉP HÌNH VẬN DỤNG: BIỂU ĐỒ ĐOẠN THẲNG & TỔNG KẾT (HĐ 4)',
    subtitle: 'Ghép đúng quy trình chuyển dữ liệu Hình 7.9 sang Biểu đồ đoạn thẳng (SGK tr.35)',
    slots: [
      { id: 's1', label: 'Bước 1: Nhập/chọn bảng số liệu Doanh thu 2016–2020', expectedId: 'v1' },
      { id: 's2', label: 'Bước 2: Insert -> Insert Line or Area Chart -> 2-D Line with Markers', expectedId: 'v2' },
      { id: 's3', label: 'Bước 3: Nhận diện xu hướng tăng trưởng qua đường dốc', expectedId: 'v3' }
    ],
    cards: [
      { id: 'v3', title: 'Biểu đồ đoạn thẳng hoàn chỉnh', hint: 'Hình 7.3 SGK tr.33', img: '/images/tin8_bai7/hinh_7_3_duong_thang.png' },
      { id: 'v1', title: 'Dữ liệu Doanh thu phần mềm', hint: 'Hình 7.9 SGK tr.35', img: '/images/tin8_bai7/hinh_7_9_doanh_thu_phan_mem.png' },
      { id: 'v2', title: 'Nhóm lệnh Charts (Line Chart)', hint: 'Hình 7.5 SGK tr.33', img: '/images/tin8_bai7/hinh_7_5_nhom_charts.png' }
    ]
  }
};

function InteractivePuzzleModal({ puzzle, onClose, playSound }) {
  const [placed, setPlaced] = useState({}); // slotId -> cardId
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [checked, setChecked] = useState(false);

  if (!puzzle) return null;

  const usedCardIds = new Set(Object.values(placed));
  const availableCards = puzzle.cards.filter((c) => !usedCardIds.has(c.id));
  const allFilled = puzzle.slots.every((s) => Boolean(placed[s.id]));
  const allCorrect = allFilled && puzzle.slots.every((s) => placed[s.id] === s.expectedId);

  const handlePlaceInSlot = (slotId, cardIdToPlace) => {
    if (!cardIdToPlace) return;
    setChecked(false);
    setPlaced((prev) => {
      const next = { ...prev };
      // Remove card from any other slot if already placed
      Object.keys(next).forEach((k) => {
        if (next[k] === cardIdToPlace) delete next[k];
      });
      next[slotId] = cardIdToPlace;
      return next;
    });
    setSelectedCardId(null);
    playSound('click');
  };

  const handleSlotClick = (slotId) => {
    if (selectedCardId) {
      handlePlaceInSlot(slotId, selectedCardId);
    } else if (placed[slotId]) {
      setChecked(false);
      setPlaced((prev) => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });
      playSound('click');
    }
  };

  const handleCheck = () => {
    setChecked(true);
    if (allCorrect) {
      playSound('celebrate');
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      playSound('click');
    }
  };

  const handleReset = () => {
    setPlaced({});
    setSelectedCardId(null);
    setChecked(false);
    playSound('click');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-900 border-2 border-cyan-400/60 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              HOẠT ĐỘNG THỰC HÀNH TƯƠNG TÁC • KÉO THẢ HOẶC BẤM GHÉP HÌNH
            </span>
            <h3 className="text-base sm:text-xl font-black text-white mt-1">{puzzle.title}</h3>
            <p className="text-xs text-slate-300">{puzzle.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
            title="Đóng bảng ghép hình"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Slots */}
        <div className={`grid grid-cols-1 ${puzzle.slots.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-3`}>
          {puzzle.slots.map((slot, idx) => {
            const cardId = placed[slot.id];
            const card = puzzle.cards.find((c) => c.id === cardId);
            const isCorrect = checked && cardId === slot.expectedId;
            const isWrong = checked && cardId && cardId !== slot.expectedId;

            return (
              <div
                key={slot.id}
                onClick={() => handleSlotClick(slot.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedId = e.dataTransfer.getData('text/plain');
                  handlePlaceInSlot(slot.id, droppedId);
                }}
                className={`cursor-pointer rounded-2xl p-3 border-2 min-h-[175px] flex flex-col justify-between transition-all ${
                  isCorrect
                    ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : isWrong
                    ? 'bg-rose-950/60 border-rose-500'
                    : selectedCardId
                    ? 'bg-slate-950/90 border-cyan-400/70 hover:bg-cyan-950/30'
                    : 'bg-slate-950/80 border-dashed border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[11px] font-black text-cyan-300 uppercase">Ô #{idx + 1}</span>
                  {checked && cardId && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                      {isCorrect ? '✓ Đúng' : '✕ Sai'}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-200 my-1 leading-snug">{slot.label}</div>

                {card ? (
                  <div className="bg-white rounded-xl p-1.5 text-center space-y-1 border border-slate-300">
                    <img src={card.img} alt={card.title} className="h-16 mx-auto object-contain" />
                    <div className="text-[11px] font-black text-slate-900 leading-tight">{card.title}</div>
                    <div className="text-[9px] text-slate-500">(Bấm vào ô để gỡ ra)</div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-slate-700/80 text-[11px] text-slate-400 p-2 text-center">
                    {selectedCardId ? '👉 Bấm vào đây để ghép mảnh đã chọn!' : 'Kéo hoặc bấm chọn mảnh bên dưới đặt vào đây'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Available Cards Pool */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 uppercase tracking-wider">
              🧩 KHO MẢNH GHÉP HÌNH ẢNH SGK ({availableCards.length} mảnh chưa ghép)
            </span>
            <span className="text-slate-400 text-[11px]">Bấm chọn mảnh → Bấm vào Ô muốn ghép (hoặc kéo thả)</span>
          </div>

          {availableCards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {availableCards.map((card) => {
                const isSel = selectedCardId === card.id;
                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', card.id)}
                    onClick={() => { setSelectedCardId(isSel ? null : card.id); playSound('click'); }}
                    className={`cursor-pointer rounded-xl p-2 bg-white border-2 transition-all flex flex-col items-center text-center gap-1 ${
                      isSel
                        ? 'border-amber-400 ring-4 ring-amber-400/40 scale-[1.03]'
                        : 'border-slate-300 hover:border-cyan-400'
                    }`}
                  >
                    <img src={card.img} alt={card.title} className="h-16 object-contain" />
                    <div className="text-xs font-black text-slate-900 leading-tight">{card.title}</div>
                    <div className="text-[10px] font-semibold text-cyan-700">{card.hint}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-3 text-xs font-bold text-emerald-300">
              ✓ Đã ghép hết tất cả các mảnh! Hãy bấm nút "Kiểm tra kết quả" bên dưới.
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="text-xs font-bold">
            {checked && allCorrect && (
              <span className="text-emerald-300 text-sm">🎉 CHÍNH XÁC 100%! Cả lớp vỗ tay chúc mừng!</span>
            )}
            {checked && !allCorrect && (
              <span className="text-amber-300">⚠️ Vẫn còn mảnh chưa đúng vị trí, hãy bấm vào ô sai để thử lại nhé!</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm lại</span>
            </button>
            <button
              onClick={handleCheck}
              disabled={!allFilled}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Kiểm tra kết quả</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tin8Bai07SlidePresentation({ onSwitchTab, onBackToLibrary }) {
  // Slide Index: 0 (HĐ 1: 4p), 1 (HĐ 2A: 10p), 2 (HĐ 2B: 10p), 3 (HĐ 3: 12p), 4 (HĐ 4: 6p)
  const [slideIndex, setSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null); // { src, title }
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);

  // Warmup Q&A reveal states (HĐ 1)
  const [warmupReveal1, setWarmupReveal1] = useState(false);
  const [warmupReveal2, setWarmupReveal2] = useState(false);

  // Per-activity countdown durations matching lesson plan (seconds)
  const ACTIVITY_DURATIONS = { 0: 240, 1: 600, 2: 600, 3: 720, 4: 360 };
  const [activityTimer, setActivityTimer] = useState(240);
  const [activityTimerRunning, setActivityTimerRunning] = useState(false);
  const activityTimerRef = useRef(null);

  // ==========================================
  // SLIDE 1 STATE (HĐ 2A: Biểu đồ cột & Chart Elements +)
  // ==========================================
  const [showChartTitle, setShowChartTitle] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(true);
  const [showAxisTitles, setShowAxisTitles] = useState(true);
  const [chartMenuOpen, setChartMenuOpen] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState(null);

  // Timer state for HĐ 2A
  const [timerP1, setTimerP1] = useState(480); // 8 minutes = 480 seconds
  const [timerRunningP1, setTimerRunningP1] = useState(false);
  const timerRefP1 = useRef(null);

  // ==========================================
  // SLIDE 2 STATE (HĐ 2B: Biểu đồ quạt tròn & Nhãn %)
  // ==========================================
  const [pieMode, setPieMode] = useState('percentage'); // 'value' | 'percentage'
  const [activePieSlice, setActivePieSlice] = useState(null);
  const [showNotebookNotes, setShowNotebookNotes] = useState(false);

  // ==========================================
  // SLIDE 3 STATE (HĐ 3: Luyện tập SGK tr.35)
  // ==========================================
  const [luyenTapTab, setLuyenTapTab] = useState('bai1'); // 'bai1' | 'bai2'
  const [showSumFormula, setShowSumFormula] = useState(true);
  const [viewExerciseChart, setViewExerciseChart] = useState('column'); // 'none' | 'column' | 'pie'
  const [revealedQ1, setRevealedQ1] = useState(false);
  const [revealedQ2, setRevealedQ2] = useState(false);

  // ==========================================
  // SLIDE 4 STATE (HĐ 4: Vận dụng & Tổng kết)
  // ==========================================
  const [showLineTrendDetails, setShowLineTrendDetails] = useState(false);
  const [safetyStep1, setSafetyStep1] = useState(false);
  const [safetyStep2, setSafetyStep2] = useState(false);
  const [safetyStep3, setSafetyStep3] = useState(false);
  const [isLessonFinished, setIsLessonFinished] = useState(false);

  // ==========================================
  // WEB AUDIO API SOUND EFFECTS
  // ==========================================
  const playSound = (type = 'click') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'timer_tick') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'alarm') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.15);
        osc.frequency.setValueAtTime(783.99, now + 0.3);
        osc.frequency.setValueAtTime(1046.50, now + 0.45);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      } else if (type === 'celebrate') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      // Audio autoplay restrictions
    }
  };

  // Trigger Fullscreen Confetti
  const triggerGloriousConfetti = () => {
    playSound('celebrate');
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  // Timer Tick Interval for HĐ 2A
  useEffect(() => {
    if (timerRunningP1) {
      timerRefP1.current = setInterval(() => {
        setTimerP1((prev) => {
          if (prev <= 1) {
            clearInterval(timerRefP1.current);
            setTimerRunningP1(false);
            playSound('alarm');
            return 0;
          }
          if (prev <= 10) {
            playSound('timer_tick');
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRefP1.current) clearInterval(timerRefP1.current);
    }
    return () => {
      if (timerRefP1.current) clearInterval(timerRefP1.current);
    };
  }, [timerRunningP1]);

  // Format Timer mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sync per-activity countdown when switching slide
  useEffect(() => {
    setActivityTimerRunning(false);
    setActivityTimer(ACTIVITY_DURATIONS[slideIndex] || 300);
  }, [slideIndex]);

  useEffect(() => {
    if (activityTimerRunning) {
      activityTimerRef.current = setInterval(() => {
        setActivityTimer((prev) => {
          if (prev <= 1) {
            clearInterval(activityTimerRef.current);
            setActivityTimerRunning(false);
            playSound('alarm');
            return 0;
          }
          if (prev <= 10) playSound('timer_tick');
          return prev - 1;
        });
      }, 1000);
    } else if (activityTimerRef.current) {
      clearInterval(activityTimerRef.current);
    }
    return () => {
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
    };
  }, [activityTimerRunning]);

  // Keyboard navigation: ArrowRight / Space / ArrowLeft / F
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape' && zoomedImage) {
        setZoomedImage(null);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setSlideIndex((prev) => Math.min(4, prev + 1));
        playSound('click');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setSlideIndex((prev) => Math.max(0, prev - 1));
        playSound('click');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedImage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.warn);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.warn);
      }
    }
  };

  // 5 Core Activities Metadata matching Lesson Plan (Tiết 12: 42 phút)
  const ACTIVITIES = [
    {
      id: 0,
      tag: 'HĐ 1',
      durationLabel: '3-5p',
      title: 'Mở Đầu',
      desc: 'HĐ 1 (3-5 phút): Khởi động Đấu trường Webby & Kết nối tri thức'
    },
    {
      id: 1,
      tag: 'HĐ 2A',
      durationLabel: '10p',
      title: 'Biểu Đồ Cột',
      desc: 'HĐ 2A (10 phút): Tạo biểu đồ cột & nút Chart Elements (+) (SGK tr.33-34)'
    },
    {
      id: 2,
      tag: 'HĐ 2B',
      durationLabel: '10p',
      title: 'Biểu Đồ Quạt',
      desc: 'HĐ 2B (10 phút): Tạo biểu đồ quạt tròn & Tỉ lệ % (SGK tr.34)'
    },
    {
      id: 3,
      tag: 'HĐ 3',
      durationLabel: '12p',
      title: 'Luyện Tập',
      desc: 'HĐ 3 (10-12 phút): Luyện tập Bài 1 & Bài 2 SGK trang 35'
    },
    {
      id: 4,
      tag: 'HĐ 4',
      durationLabel: '6p',
      title: 'Vận Dụng',
      desc: 'HĐ 4 (5-7 phút): Biểu đồ đoạn thẳng, Văn hóa phòng máy & Tổng kết'
    }
  ];

  // Data for Slide 1 & 2 (Hình 7.3 SGK Tin 8 tr.33)
  const SURVEY_DATA = [
    { row: 3, name: 'Soạn thảo văn bản', value: 18, pct: 40, color: '#38bdf8' },
    { row: 4, name: 'Bảng tính điện tử', value: 12, pct: 27, color: '#818cf8' },
    { row: 5, name: 'Trình chiếu đa phương tiện', value: 10, pct: 22, color: '#34d399' },
    { row: 6, name: 'Lập trình Scratch', value: 5, pct: 11, color: '#fbbf24' }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative">

      {/* =========================================================================
          TOP COMMAND HEADER (16:9 RESPONSIVE SINGLE-ROW BAR)
         ========================================================================= */}
      <header className="px-3 sm:px-5 py-2 bg-slate-900/95 border-b border-cyan-500/30 flex items-center justify-between gap-2 shrink-0 backdrop-blur-md z-30">
        
        {/* Left: Lesson Identification & Teacher Info */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/30">
            <BarChart3 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                TIN HỌC 8 • TIẾT 12
              </span>
              <h2 className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-indigo-300 uppercase tracking-tight truncate max-w-[280px] sm:max-w-md">
                BÀI 7: TRỰC QUAN HOÁ DỮ LIỆU BẰNG BIỂU ĐỒ (TT)
              </h2>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Trường THCS Đắk Trôi • GV: <span className="text-slate-200 font-bold">Thầy Trần Đức Tình</span>
            </p>
          </div>
        </div>

        {/* Center: Activity Navigation Tabs (HĐ 2A -> HĐ 4) */}
        <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          {ACTIVITIES.map((act) => {
            const isActive = slideIndex === act.id;
            return (
              <button
                key={act.id}
                onClick={() => {
                  setSlideIndex(act.id);
                  playSound('click');
                }}
                title={act.desc}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
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
                <span className={`${isActive ? 'inline' : 'hidden lg:inline'} font-semibold text-[11px]`}>
                  {act.title}
                </span>
                <span className={`hidden xl:inline text-[9px] font-mono px-1 rounded ${isActive ? 'bg-slate-950/20 text-slate-950' : 'text-slate-400'}`}>
                  {act.durationLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Activity Timer + Quick Classroom Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Interactive Puzzle Button for Current Activity */}
          <button
            onClick={() => { setIsPuzzleOpen(true); playSound('click'); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            title="Mở hoạt động Cắt ghép hình SGK tương ứng với hoạt động đang chiếu"
          >
            <span>🧩</span>
            <span className="hidden sm:inline">Ghép Hình Thực Hành</span>
          </button>

          {/* Per-Activity Countdown Timer Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-cyan-500/40 shadow-inner">
            <Clock className={`w-3.5 h-3.5 ${activityTimer <= 60 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className={`font-mono font-black text-xs sm:text-sm ${activityTimer <= 60 ? 'text-rose-300' : 'text-emerald-300'}`}>
              {formatTime(activityTimer)}
            </span>
            <button
              onClick={() => { setActivityTimerRunning((r) => !r); playSound('click'); }}
              className="p-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 transition-colors"
              title={activityTimerRunning ? 'Tạm dừng đồng hồ' : 'Bắt đầu đếm ngược'}
            >
              {activityTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => { setActivityTimerRunning(false); setActivityTimer(ACTIVITY_DURATIONS[slideIndex] || 300); playSound('click'); }}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Đặt lại thời gian hoạt động"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          {/* Jump to Webby / Mark AI Voice */}
          {onSwitchTab && (
            <button
              onClick={() => onSwitchTab('webby-agent')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 transition-all shadow-sm"
              title="Mở Trợ lý Mark AI (Giọng nói 3D)"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Mark AI</span>
            </button>
          )}

          {/* Jump to Game Center */}
          {onSwitchTab && (
            <button
              onClick={() => onSwitchTab('game-center')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 transition-all shadow-sm"
              title="Mở Đấu trường Game Bài 7"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Đấu trường Game</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
            title="Toàn màn hình (Phím F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Back to Library */}
          {onBackToLibrary && (
            <button
              onClick={onBackToLibrary}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              title="Quay lại Thư viện bài giảng"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Thư viện</span>
            </button>
          )}
        </div>
      </header>

      {/* =========================================================================
          SLIDE BODY CONTAINER (16:9 VIEWPORT OPTIMIZED)
         ========================================================================= */}
      <main className="flex-1 min-h-0 relative p-3 sm:p-5 overflow-hidden flex flex-col justify-between">

        {/* -----------------------------------------------------------------------
            SLIDE 0: HOẠT ĐỘNG 1 – MỞ ĐẦU: ĐẤU TRƯỜNG WEBBY & KẾT NỐI TRI THỨC (3 - 5 PHÚT)
           ----------------------------------------------------------------------- */}
        {slideIndex === 0 && (
          <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider">
                  HOẠT ĐỘNG 1: MỞ ĐẦU (3 - 5 PHÚT)
                </span>
                <span className="text-xs font-bold text-slate-400">Kết nối kiến thức Tiết 11</span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-300 uppercase tracking-tight">
                ĐẤU TRƯỜNG WEBBY: KHỞI ĐỘNG & KẾT NỐI TRI THỨC
              </h1>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
              {/* Left 6 cols: Game Launcher + 2 Warmup Questions */}
              <div className="col-span-12 lg:col-span-6 flex flex-col gap-3 justify-between bg-gradient-to-br from-slate-900/95 via-slate-900 to-indigo-950/60 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-cyan-500/20 border border-amber-400/50 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm sm:text-base font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                      <span>VÒNG QUAY MAY MẮN • HỘP QUÀ BÍ ẨN</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 mt-1">
                      Chọn ngẫu nhiên 1–2 học sinh trả lời nhanh thử thách kết nối trước khi thực hành trên Excel.
                    </p>
                  </div>
                  {onSwitchTab && (
                    <button
                      onClick={() => onSwitchTab('game-center')}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shrink-0 shadow-lg active:scale-95 transition-all"
                    >
                      🎮 Mở Đấu Trường
                    </button>
                  )}
                </div>

                {/* 2 Interactive Warmup Questions */}
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-sky-500/40 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm sm:text-base font-bold text-sky-100">
                        Câu 1: Khi nào nên sử dụng <span className="text-yellow-300">biểu đồ cột</span>?
                      </span>
                      <button
                        onClick={() => { setWarmupReveal1(!warmupReveal1); playSound('click'); }}
                        className="px-3.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-xs sm:text-sm font-bold shrink-0"
                      >
                        {warmupReveal1 ? 'Ẩn gợi ý' : 'Xem đáp án'}
                      </button>
                    </div>
                    {warmupReveal1 && (
                      <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-sm text-emerald-200">
                        ✅ Dùng khi cần <strong>so sánh trực quan độ lớn</strong> của các đối tượng dữ liệu với nhau (VD: số học sinh quan tâm từng nội dung Tin học).
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/40 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm sm:text-base font-bold text-indigo-100">
                        Câu 2: Khi nào nên dùng <span className="text-pink-300">biểu đồ hình quạt tròn</span> hoặc <span className="text-cyan-300">đoạn thẳng</span>?
                      </span>
                      <button
                        onClick={() => { setWarmupReveal2(!warmupReveal2); playSound('click'); }}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 text-xs sm:text-sm font-bold shrink-0"
                      >
                        {warmupReveal2 ? 'Ẩn gợi ý' : 'Xem đáp án'}
                      </button>
                    </div>
                    {warmupReveal2 && (
                      <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-sm text-emerald-200 space-y-1.5">
                        <div>🥧 <strong>Quạt tròn:</strong> So sánh <strong>tỉ lệ phần trăm (%)</strong> của từng phần trên tổng thể.</div>
                        <div>📈 <strong>Đoạn thẳng:</strong> Quan sát <strong>xu hướng tăng/giảm</strong> của dữ liệu theo thời gian.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right 6 cols: Real SGK Figures 7.1 & 7.4 for Visual Recall */}
              <div className="col-span-12 lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl gap-3">
                <div className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                  <span>HÌNH MINH HỌA SGK TIN HỌC 8 (TR.32–33)</span>
                  <span className="text-[11px] font-medium text-slate-400">(Bấm vào ảnh để phóng to)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0">
                  <div
                    onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_1_bang_khao_sat.png', title: 'Hình 7.1. Bảng tổng hợp kết quả khảo sát lớp 8A (SGK tr.32)' })}
                    className="cursor-pointer bg-white rounded-xl p-2 border-2 border-cyan-500/40 hover:border-cyan-400 flex flex-col items-center justify-center overflow-hidden group transition-all"
                  >
                    <img src="/images/tin8_bai7/hinh_7_1_bang_khao_sat.png" alt="Hình 7.1 SGK" className="max-h-48 object-contain group-hover:scale-[1.03] transition-transform" />
                    <span className="text-[11px] font-bold text-slate-700 mt-1 text-center">Hình 7.1. Bảng số liệu khảo sát</span>
                  </div>

                  <div
                    onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_4_quat_tron.png', title: 'Hình 7.4. Biểu đồ hình quạt tròn (SGK tr.33)' })}
                    className="cursor-pointer bg-white rounded-xl p-2 border-2 border-indigo-500/40 hover:border-indigo-400 flex flex-col items-center justify-center overflow-hidden group transition-all"
                  >
                    <img src="/images/tin8_bai7/hinh_7_4_quat_tron.png" alt="Hình 7.4 SGK" className="max-h-48 object-contain group-hover:scale-[1.03] transition-transform" />
                    <span className="text-[11px] font-bold text-slate-700 mt-1 text-center">Hình 7.4. Biểu đồ quạt tròn (%)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs text-cyan-200 text-center">
                  🎯 <strong>Nhiệm vụ hôm nay:</strong> Học sinh trực tiếp thực hành tạo biểu đồ cột, biểu đồ quạt tròn & biểu đồ đoạn thẳng trên <strong>Microsoft Excel</strong>!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            SLIDE 1: HOẠT ĐỘNG 2 – TIẾN TRÌNH 2A: BIỂU ĐỒ CỘT & CHART ELEMENTS (+)
           ----------------------------------------------------------------------- */}
        {slideIndex === 1 && (
          <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300">
            {/* Slide Header Strip */}
            <div className="flex items-center justify-between border-b border-sky-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/40 text-xs font-black uppercase tracking-wider">
                  HOẠT ĐỘNG 2 – TIẾN TRÌNH 2A
                </span>
                <span className="text-xs font-bold text-slate-400">Mục 2 SGK Trang 33 - 34</span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-cyan-300 uppercase tracking-tight">
                QUY TRÌNH TẠO BIỂU ĐỒ CỘT & SỬ DỤNG NÚT CHART ELEMENTS (+)
              </h1>
            </div>

            {/* Split Screen Grid (Left 6 cols, Right 6 cols for BIGGER visual guides) */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
              
              {/* Left Column (6 cols): Excel Data Table + Steps + Interactive Chart */}
              <div className="col-span-12 lg:col-span-6 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
                
                {/* 3 Steps Banner - LARGER & MORE COLORFUL */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-950/80 to-slate-900 border border-sky-400/50 shadow-md">
                    <span className="font-mono font-black text-sky-300 block text-xs sm:text-sm">BƯỚC 1</span>
                    <p className="text-xs sm:text-sm text-slate-100 mt-1 leading-snug font-medium">
                      Quét chọn vùng dữ liệu <strong className="text-yellow-300">B2:C8</strong>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-400/50 shadow-md">
                    <span className="font-mono font-black text-indigo-300 block text-xs sm:text-sm">BƯỚC 2</span>
                    <p className="text-xs sm:text-sm text-slate-100 mt-1 leading-snug font-medium">
                      <strong className="text-yellow-300">Insert</strong> ➔ <strong className="text-cyan-300">2-D Column</strong>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-400/60 shadow-md">
                    <span className="font-mono font-black text-emerald-300 block text-xs sm:text-sm">BƯỚC 3</span>
                    <p className="text-xs sm:text-sm text-emerald-100 mt-1 leading-snug font-medium">
                      Bấm dấu <strong className="text-yellow-300">(+)</strong> thêm Tiêu đề & Nhãn
                    </p>
                  </div>
                </div>

                {/* Simulated Excel Sheet & Interactive Live Chart */}
                <div className="flex-1 min-h-[220px] bg-slate-900/90 rounded-2xl border border-slate-800 p-3 flex flex-col justify-between shadow-xl relative">
                  
                  {/* Top Bar: Excel Table Preview vs Chart Controls */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span className="font-bold text-xs text-slate-200">
                        Bảng số liệu Hình 7.3 SGK (Vùng chọn <span className="font-mono text-cyan-300 font-black">A2:B6</span>)
                      </span>
                    </div>

                    {/* Chart Elements (+) Simulator Toggle Button */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setChartMenuOpen(!chartMenuOpen);
                          playSound('click');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                          chartMenuOpen
                            ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                            : 'bg-slate-800 text-emerald-300 border border-emerald-500/40 hover:bg-slate-700'
                        }`}
                        title="Bấm để bật/tắt bảng chọn Chart Elements"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Nút Chart Elements (+)</span>
                      </button>

                      {/* Dropdown Menu simulating Excel's Chart Elements Flyout */}
                      {chartMenuOpen && (
                        <div className="absolute right-0 top-8 z-30 w-52 p-2.5 bg-slate-950/95 border-2 border-emerald-400 rounded-xl shadow-2xl space-y-2 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                          <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider block border-b border-slate-800 pb-1">
                            CHART ELEMENTS (THÀNH PHẦN)
                          </span>
                          
                          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer hover:text-white">
                            <input
                              type="checkbox"
                              checked={showChartTitle}
                              onChange={(e) => {
                                setShowChartTitle(e.target.checked);
                                playSound('click');
                              }}
                              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
                            />
                            <span className="font-semibold">Chart Title (Tiêu đề)</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer hover:text-white">
                            <input
                              type="checkbox"
                              checked={showDataLabels}
                              onChange={(e) => {
                                setShowDataLabels(e.target.checked);
                                playSound('click');
                              }}
                              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
                            />
                            <span className="font-semibold">Data Labels (Nhãn dữ liệu)</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer hover:text-white">
                            <input
                              type="checkbox"
                              checked={showAxisTitles}
                              onChange={(e) => {
                                setShowAxisTitles(e.target.checked);
                                playSound('click');
                              }}
                              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
                            />
                            <span className="font-semibold">Axis Titles (Tên trục)</span>
                          </label>

                          <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800">
                            💡 Tích chọn để hiển thị các thành phần trên biểu đồ
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Excel mini table snippet */}
                  <div className="overflow-x-auto py-1">
                    <table className="w-full text-[11px] font-mono border-collapse">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                          <th className="p-1 text-center w-8 bg-slate-900 border-r border-slate-800">Ô</th>
                          <th className="p-1 text-left px-2 border-r border-slate-800">Cột A: Nội dung Tin học</th>
                          <th className="p-1 text-right px-2">Cột B: Số HS chọn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SURVEY_DATA.map((row) => (
                          <tr
                            key={row.row}
                            onMouseEnter={() => setHighlightedRow(row.row)}
                            onMouseLeave={() => setHighlightedRow(null)}
                            className={`border-b border-slate-800/60 transition-colors ${
                              highlightedRow === row.row ? 'bg-cyan-950/60 text-cyan-200' : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <td className="p-1 text-center font-bold text-slate-500 bg-slate-950/50 border-r border-slate-800">
                              {row.row}
                            </td>
                            <td className="p-1 px-2 border-r border-slate-800">{row.name}</td>
                            <td className="p-1 px-2 text-right font-black text-cyan-300">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Simulated SVG 2-D Column Chart */}
                  <div className="mt-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col items-center justify-between">
                    
                    {/* Chart Title */}
                    {showChartTitle ? (
                      <h4 className="font-black text-xs sm:text-sm text-yellow-300 tracking-wide uppercase text-center pb-2 animate-in fade-in duration-200">
                        KẾT QUẢ KHẢO SÁT NỘI DUNG TIN HỌC LỚP 8A
                      </h4>
                    ) : (
                      <div className="h-5 text-[10px] text-slate-600 italic">
                        [Đã ẩn Tiêu đề biểu đồ - Bấm nút (+) để hiện lại]
                      </div>
                    )}

                    {/* Chart Plot Area */}
                    <div className="w-full h-36 flex items-end justify-around gap-2 px-6 pt-4 pb-2 border-b-2 border-slate-600 relative">
                      
                      {/* Vertical Axis Title */}
                      {showAxisTitles && (
                        <div className="absolute -left-2 top-1/2 -rotate-90 -translate-y-1/2 text-[10px] font-bold text-slate-400 animate-in fade-in">
                          Số học sinh
                        </div>
                      )}

                      {/* Columns */}
                      {SURVEY_DATA.map((item) => {
                        const heightPct = Math.round((item.value / 20) * 100);
                        const isHovered = highlightedRow === item.row;
                        return (
                          <div
                            key={item.row}
                            onMouseEnter={() => setHighlightedRow(item.row)}
                            onMouseLeave={() => setHighlightedRow(null)}
                            className="flex-1 max-w-[64px] flex flex-col items-center justify-end h-full group cursor-pointer"
                          >
                            {/* Data Label on top of bar */}
                            {showDataLabels && (
                              <span className="font-mono text-xs font-black text-white mb-1 transition-transform group-hover:scale-125 animate-in fade-in">
                                {item.value}
                              </span>
                            )}
                            {/* Bar Body */}
                            <div
                              style={{ height: `${heightPct}%`, backgroundColor: item.color }}
                              className={`w-full rounded-t-lg transition-all duration-300 shadow-lg ${
                                isHovered ? 'brightness-125 ring-2 ring-white scale-105' : 'opacity-90'
                              }`}
                            ></div>
                            {/* Bar Base Label */}
                            <span className="text-[10px] text-slate-400 mt-1 truncate max-w-[56px] text-center" title={item.name}>
                              {item.name.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Horizontal Axis Title */}
                    {showAxisTitles && (
                      <div className="text-[10px] font-bold text-slate-400 pt-1 animate-in fade-in">
                        Nội dung Tin học lựa chọn
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column (6 cols): LARGE SGK Visual Reference Figures & Student Task */}
              <div className="col-span-12 lg:col-span-6 flex flex-col gap-3 min-h-0">
                
                {/* Real SGK Visual Reference Figures (LARGE & Click to Zoom) */}
                <div className="flex-1 bg-gradient-to-br from-slate-900/95 via-slate-900 to-sky-950/50 rounded-2xl border-2 border-cyan-500/50 p-3.5 space-y-2.5 shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📸 HÌNH MẪU SGK ĐỂ HS NHÌN THEO (BẤM PHÓNG TO)</span>
                    </span>
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-lg">SGK tr.33–34</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0">
                    <div
                      onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_5_nhom_charts.png', title: 'Hình 7.5. Nhóm lệnh Charts (Insert -> 2-D Column)' })}
                      className="cursor-pointer bg-white rounded-2xl p-2.5 border-2 border-cyan-400/60 hover:border-cyan-300 flex flex-col items-center justify-center group shadow-md"
                    >
                      <img src="/images/tin8_bai7/hinh_7_5_nhom_charts.png" alt="Hình 7.5" className="h-32 sm:h-40 w-full object-contain group-hover:scale-105 transition-transform" />
                      <span className="text-xs sm:text-sm font-black text-slate-800 mt-1.5 text-center">Hình 7.5. Nhóm lệnh Charts</span>
                    </div>
                    <div
                      onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_6_chart_elements_cot.png', title: 'Hình 7.6. Bổ sung thông tin bằng Chart Elements (+)' })}
                      className="cursor-pointer bg-white rounded-2xl p-2.5 border-2 border-emerald-400/60 hover:border-emerald-300 flex flex-col items-center justify-center group shadow-md"
                    >
                      <img src="/images/tin8_bai7/hinh_7_6_chart_elements_cot.png" alt="Hình 7.6" className="h-32 sm:h-40 w-full object-contain group-hover:scale-105 transition-transform" />
                      <span className="text-xs sm:text-sm font-black text-slate-800 mt-1.5 text-center">Hình 7.6. Nút Chart Elements (+)</span>
                    </div>
                  </div>
                </div>

                {/* Practical Checklist & Student Guidance Card */}
                <div className="bg-slate-900/90 rounded-2xl border border-amber-500/40 p-3.5 space-y-2 shadow-lg">
                  <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    YÊU CẦU THỰC HÀNH TẠI PHÒNG MÁY
                  </span>

                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-100">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                      <span>Nhập/mở bảng số liệu khảo sát lớp 8A (Hình 7.1 SGK) và quét chọn vùng <strong className="text-yellow-300 font-mono">B2:C8</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                      <span>Vào <strong>Insert ➔ Charts ➔ 2-D Column</strong> tạo biểu đồ cột như <strong>Hình 7.5</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                      <span>Nhấp nút <strong className="text-emerald-400">(+) Chart Elements</strong> thêm Tiêu đề, Nhãn dữ liệu như <strong>Hình 7.6</strong>.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            SLIDE 2: HOẠT ĐỘNG 2 – TIẾN TRÌNH 2B: BIỂU ĐỒ QUẠT TRÒN & NHÃN %
           ----------------------------------------------------------------------- */}
        {slideIndex === 2 && (
          <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300">
            {/* Slide Header Strip */}
            <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-xs font-black uppercase tracking-wider">
                  HOẠT ĐỘNG 2 – TIẾN TRÌNH 2B
                </span>
                <span className="text-xs font-bold text-slate-400">Mục 2 SGK Trang 34 - 35</span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-pink-300 uppercase tracking-tight">
                TẠO BIỂU ĐỒ HÌNH QUẠT TRÒN & ĐỊNH DẠNG TỈ LỆ PHẦN TRĂM (%)
              </h1>
            </div>

            {/* Two Symmetrical Columns (6 cols / 6 cols) */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
              
              {/* Left Column (6 cols): 3 Steps + Interactive SVG Pie Chart */}
              <div className="col-span-12 lg:col-span-6 bg-gradient-to-br from-slate-900/95 via-slate-900 to-indigo-950/50 rounded-2xl border border-indigo-500/30 p-4 flex flex-col justify-between shadow-xl">
                
                {/* 3 Steps */}
                <div className="space-y-2">
                  <span className="text-xs sm:text-sm font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-indigo-400" />
                    QUY TRÌNH TẠO BIỂU ĐỒ QUẠT TRÒN VÀ GẮN NHÃN %
                  </span>
                  <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                    <div className="p-2.5 rounded-xl bg-slate-950/85 border border-slate-700 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/25 text-indigo-300 font-black flex items-center justify-center shrink-0 text-xs">1</span>
                      <span className="text-slate-100">Quét chọn khối dữ liệu khảo sát (<strong className="text-cyan-300">B2:C8</strong>).</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/85 border border-slate-700 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/25 text-indigo-300 font-black flex items-center justify-center shrink-0 text-xs">2</span>
                      <span className="text-slate-100">Vào thẻ <strong className="text-yellow-300">Insert</strong> ➔ <strong className="text-indigo-300">Insert Pie or Doughnut Chart</strong> ➔ <strong className="text-indigo-300">2-D Pie</strong>.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-400/50 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-pink-500/25 text-pink-300 font-black flex items-center justify-center shrink-0 text-xs">3</span>
                      <span className="text-slate-100">Bấm nút <strong className="text-yellow-300">(+)</strong> ➔ <strong className="text-yellow-300">Data Labels</strong> ➔ <strong className="text-cyan-300">More Options</strong> ➔ chọn <strong className="text-pink-300">Percentage (%)</strong>.</span>
                    </div>
                  </div>
                </div>

                {/* Interactive SVG Pie Visualizer with mode switch */}
                <div className="mt-3 p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-col items-center">
                  <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-300">Mô phỏng Biểu đồ quạt tròn lớp 8A</span>
                    {/* Toggle Mode Button */}
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-[10px] font-bold">
                      <button
                        onClick={() => { setPieMode('value'); playSound('click'); }}
                        className={`px-2 py-0.5 rounded ${pieMode === 'value' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        Số tuyệt đối (18, 12...)
                      </button>
                      <button
                        onClick={() => { setPieMode('percentage'); playSound('click'); }}
                        className={`px-2 py-0.5 rounded ${pieMode === 'percentage' ? 'bg-pink-600 text-white font-black' : 'text-slate-400'}`}
                      >
                        Tỉ lệ % (40%, 27%...)
                      </button>
                    </div>
                  </div>

                  {/* SVG Pie Chart */}
                  <div className="relative w-40 h-40 flex items-center justify-center my-1">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {/* Slice 1: 40% (Soạn thảo) -> strokeDasharray="40 100", strokeDashoffset="0" */}
                      <circle
                        r="25" cx="50" cy="50" fill="transparent"
                        stroke="#38bdf8" strokeWidth="50"
                        strokeDasharray="40 100" strokeDashoffset="0"
                        onMouseEnter={() => setActivePieSlice(0)}
                        onMouseLeave={() => setActivePieSlice(null)}
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                      />
                      {/* Slice 2: 27% (Bảng tính) -> strokeDasharray="27 100", strokeDashoffset="-40" */}
                      <circle
                        r="25" cx="50" cy="50" fill="transparent"
                        stroke="#818cf8" strokeWidth="50"
                        strokeDasharray="27 100" strokeDashoffset="-40"
                        onMouseEnter={() => setActivePieSlice(1)}
                        onMouseLeave={() => setActivePieSlice(null)}
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                      />
                      {/* Slice 3: 22% (Trình chiếu) -> strokeDasharray="22 100", strokeDashoffset="-67" */}
                      <circle
                        r="25" cx="50" cy="50" fill="transparent"
                        stroke="#34d399" strokeWidth="50"
                        strokeDasharray="22 100" strokeDashoffset="-67"
                        onMouseEnter={() => setActivePieSlice(2)}
                        onMouseLeave={() => setActivePieSlice(null)}
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                      />
                      {/* Slice 4: 11% (Scratch) -> strokeDasharray="11 100", strokeDashoffset="-89" */}
                      <circle
                        r="25" cx="50" cy="50" fill="transparent"
                        stroke="#fbbf24" strokeWidth="50"
                        strokeDasharray="11 100" strokeDashoffset="-89"
                        onMouseEnter={() => setActivePieSlice(3)}
                        onMouseLeave={() => setActivePieSlice(null)}
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </svg>

                    {/* Center Ring Overlay */}
                    <div className="absolute w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-cyan-300 pointer-events-none shadow-inner">
                      100%
                    </div>
                  </div>

                  {/* Slices Legend */}
                  <div className="grid grid-cols-2 gap-1.5 w-full text-[11px] pt-2">
                    {SURVEY_DATA.map((item, idx) => (
                      <div
                        key={idx}
                        onMouseEnter={() => setActivePieSlice(idx)}
                        onMouseLeave={() => setActivePieSlice(null)}
                        className={`flex items-center justify-between p-1 rounded-lg border transition-all ${
                          activePieSlice === idx ? 'bg-slate-800 border-white text-white' : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span style={{ backgroundColor: item.color }} className="w-2.5 h-2.5 rounded-full shrink-0"></span>
                          <span className="truncate">{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-cyan-300 shrink-0 pl-1">
                          {pieMode === 'percentage' ? `${item.pct}%` : `${item.value} HS`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (6 cols): Direct Comparison & Notebook Takeaways */}
              <div className="col-span-12 lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  SO SÁNH TRỰC QUAN: BIỂU ĐỒ CỘT VS BIỂU ĐỒ QUẠT TRÒN
                </span>

                {/* 2 Symmetrical Contrast Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
                  {/* Column Chart Card */}
                  <div className="p-3 rounded-xl bg-gradient-to-b from-sky-950/80 to-slate-950 border border-sky-500/40 space-y-1.5 shadow-md">
                    <div className="flex items-center gap-1.5 text-sky-300 font-bold text-xs">
                      <BarChart3 className="w-4 h-4 text-sky-400" />
                      <span>BIỂU ĐỒ CỘT</span>
                    </div>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Tối ưu khi cần <strong>so sánh độ lớn</strong> (hơn / kém, cao / thấp) giữa các đối tượng độc lập.
                    </p>
                    <div className="text-[10px] text-sky-400 font-mono bg-sky-950/60 p-1 rounded">
                      Ví dụ: Môn nào có nhiều HS chọn nhất?
                    </div>
                  </div>

                  {/* Pie Chart Card */}
                  <div className="p-3 rounded-xl bg-gradient-to-b from-indigo-950/80 to-slate-950 border border-indigo-500/40 space-y-1.5 shadow-md">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                      <PieChart className="w-4 h-4 text-indigo-400" />
                      <span>BIỂU ĐỒ QUẠT TRÒN</span>
                    </div>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Tối ưu khi cần thấy rõ <strong>cơ cấu tỉ lệ phần trăm (%)</strong> đóng góp của từng thành phần trong tổng thể 100%.
                    </p>
                    <div className="text-[10px] text-indigo-400 font-mono bg-indigo-950/60 p-1 rounded">
                      Ví dụ: Soạn thảo chiếm bao nhiêu % cả lớp?
                    </div>
                  </div>
                </div>

                {/* Real SGK Figures 7.4 & 7.7 for Pie Chart (ENLARGED FOR CLASSROOM VIEW) */}
                <div className="grid grid-cols-2 gap-3 my-1.5">
                  <div
                    onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_4_quat_tron.png', title: 'Hình 7.4. Mẫu biểu đồ hình quạt tròn (SGK tr.33)' })}
                    className="cursor-pointer bg-white rounded-2xl p-2 border-2 border-indigo-400/60 hover:border-indigo-300 flex flex-col items-center group shadow-md"
                  >
                    <img src="/images/tin8_bai7/hinh_7_4_quat_tron.png" alt="Hình 7.4" className="h-32 sm:h-40 w-full object-contain group-hover:scale-105 transition-transform" />
                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-1">Hình 7.4. Biểu đồ quạt tròn</span>
                  </div>
                  <div
                    onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_7_chart_elements_quat.png', title: 'Hình 7.7. Chọn More Options -> Percentage (%) (SGK tr.34)' })}
                    className="cursor-pointer bg-white rounded-2xl p-2 border-2 border-pink-400/60 hover:border-pink-300 flex flex-col items-center group shadow-md"
                  >
                    <img src="/images/tin8_bai7/hinh_7_7_chart_elements_quat.png" alt="Hình 7.7" className="h-32 sm:h-40 w-full object-contain group-hover:scale-105 transition-transform" />
                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-1">Hình 7.7. Hiện tỉ lệ %</span>
                  </div>
                </div>

                {/* Notebook Takeaway Button & Box */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => {
                      setShowNotebookNotes(!showNotebookNotes);
                      playSound('click');
                    }}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-200 border border-amber-400/50 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>{showNotebookNotes ? '🔒 ẨN NỘI DUNG GHI VỞ' : '✍️ CHỐT KIẾN THỨC GHI VỞ (BẤM ĐỂ XEM)'}</span>
                  </button>

                  {showNotebookNotes && (
                    <div className="p-3 rounded-xl bg-slate-950 border-2 border-yellow-400/60 space-y-1.5 text-xs text-slate-100 animate-in fade-in duration-200">
                      <span className="font-bold text-yellow-300 block text-[11px] uppercase tracking-wide">
                        📝 NỘI DUNG HỌC SINH HOÀN THIỆN VÀO VỞ:
                      </span>
                      <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-200">
                        <li><strong>Bước tạo:</strong> Quét chọn dữ liệu ➔ Insert ➔ Charts ➔ Chọn dạng biểu đồ thích hợp.</li>
                        <li><strong>Tùy biến:</strong> Dùng nút <strong>(+) Chart Elements</strong> để thêm Tiêu đề, Tên trục và Nhãn dữ liệu.</li>
                        <li><strong>Biểu đồ tròn:</strong> Định dạng Format Data Labels ➔ Tích chọn <strong>Percentage (%)</strong> để hiện cơ cấu.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            SLIDE 3: HOẠT ĐỘNG 3 – LUYỆN TẬP: BÁM SÁT 100% BÀI TẬP SGK TRANG 35
           ----------------------------------------------------------------------- */}
        {slideIndex === 3 && (
          <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300">
            {/* Slide Header Strip with Sub-Tabs */}
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black uppercase tracking-wider">
                  HOẠT ĐỘNG 3: LUYỆN TẬP
                </span>
                <span className="text-xs font-bold text-slate-400">Bám sát Bài tập SGK Trang 35</span>
              </div>

              {/* Sub-Tabs: Bài tập 1 vs Bài tập 2 */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => { setLuyenTapTab('bai1'); playSound('click'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    luyenTapTab === 'bai1'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  BÀI TẬP 1 (Tệp TGSDThietbiso.xlsx)
                </button>
                <button
                  onClick={() => { setLuyenTapTab('bai2'); playSound('click'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    luyenTapTab === 'bai2'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  BÀI TẬP 2 (Hình 7.9 Doanh thu phần mềm)
                </button>
              </div>
            </div>

            {/* TAB 1: BÀI TẬP 1 (TGSDThietbiso.xlsx) */}
            {luyenTapTab === 'bai1' && (
              <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
                {/* Left (6 cols): Table Data + SUM Formula */}
                <div className="col-span-12 lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between shadow-xl overflow-y-auto">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-black text-xs text-emerald-300 uppercase tracking-wider">
                        BẢNG DỮ LIỆU THỜI GIAN SỬ DỤNG THIẾT BỊ SỐ (GIỜ/TUẦN)
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        Hình 7.8 SGK tr.35
                      </span>
                    </div>

                    {/* Table View */}
                    <table className="w-full text-xs font-mono border-collapse bg-slate-950 rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[11px]">
                          <th className="p-2 text-left">Mục đích sử dụng</th>
                          <th className="p-2 text-center text-sky-300">Nam (giờ)</th>
                          <th className="p-2 text-center text-pink-300">Nữ (giờ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-[11px]">
                        <tr>
                          <td className="p-2 font-sans font-medium text-slate-200">Học tập</td>
                          <td className="p-2 text-center font-bold text-sky-400">7.5</td>
                          <td className="p-2 text-center font-bold text-pink-400">9.0</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-sans font-medium text-slate-200">Giải trí (game, phim)</td>
                          <td className="p-2 text-center font-bold text-sky-400">12.0</td>
                          <td className="p-2 text-center font-bold text-pink-400">8.5</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-sans font-medium text-slate-200">Mạng xã hội</td>
                          <td className="p-2 text-center font-bold text-sky-400">8.0</td>
                          <td className="p-2 text-center font-bold text-pink-400">9.5</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-sans font-medium text-slate-200">Tra cứu thông tin</td>
                          <td className="p-2 text-center font-bold text-sky-400">4.5</td>
                          <td className="p-2 text-center font-bold text-pink-400">5.0</td>
                        </tr>
                        <tr className="bg-emerald-950/40 font-bold border-t-2 border-emerald-500/50">
                          <td className="p-2 font-sans font-black text-emerald-300">Tổng cộng (giờ)</td>
                          <td className="p-2 text-center font-mono text-cyan-300">
                            {showSumFormula ? '=SUM(B4:B7) ➜ 32.0' : '32.0'}
                          </td>
                          <td className="p-2 text-center font-mono text-pink-300">
                            {showSumFormula ? '=SUM(C4:C7) ➜ 32.0' : '32.0'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* SGK Figure 7.8 preview (ENLARGED) */}
                  <div
                    onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_8_bang_thiet_bi_so.png', title: 'Hình 7.8. Tổng số HS sử dụng thiết bị số (SGK tr.35)' })}
                    className="cursor-pointer bg-white rounded-2xl p-2.5 border-2 border-emerald-400/60 hover:border-emerald-300 flex items-center justify-center gap-4 my-1.5 group shadow-md"
                  >
                    <img src="/images/tin8_bai7/hinh_7_8_bang_thiet_bi_so.png" alt="Hình 7.8" className="h-32 sm:h-40 object-contain group-hover:scale-105 transition-transform" />
                    <div className="text-left text-xs sm:text-sm text-slate-800 font-semibold space-y-1">
                      <div className="font-black text-emerald-700 text-sm sm:text-base">📸 Hình 7.8 SGK tr.35</div>
                      <div>Mở <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-emerald-800">TGSDThietbiso.xlsx</code>, dùng hàm <strong>=SUM(...)</strong> tính tổng và tạo biểu đồ cột + quạt tròn.</div>
                      <div className="text-[11px] text-cyan-700 font-bold">👉 Bấm vào ảnh để phóng to!</div>
                    </div>
                  </div>

                  {/* Actions to Switch Sample Charts */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      CHỌN BIỂU ĐỒ MẪU ĐỂ ĐỐI CHIẾU KẾT QUẢ THỰC HÀNH:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setViewExerciseChart('column'); playSound('click'); }}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          viewExerciseChart === 'column'
                            ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-sky-300'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Biểu đồ cột (Nam vs Nữ)</span>
                      </button>

                      <button
                        onClick={() => { setViewExerciseChart('pie'); playSound('click'); }}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          viewExerciseChart === 'pie'
                            ? 'bg-pink-500 text-slate-950 font-black shadow-lg shadow-pink-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-pink-300'
                        }`}
                      >
                        <PieChart className="w-4 h-4" />
                        <span>Biểu đồ quạt tròn (Nữ)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right (6 cols): Sample Chart Visualizer */}
                <div className="col-span-12 lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl">
                  {viewExerciseChart === 'column' ? (
                    <div className="w-full h-full flex flex-col justify-between space-y-2 animate-in fade-in duration-200">
                      <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
                        <h4 className="font-black text-xs text-sky-300 uppercase">
                          MẪU 1: SO SÁNH THỜI GIAN NAM VS NỮ THEO MỤC ĐÍCH
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold font-mono">
                          <span className="flex items-center gap-1 text-sky-400">
                            <span className="w-2.5 h-2.5 rounded bg-sky-400 inline-block"></span> Nam
                          </span>
                          <span className="flex items-center gap-1 text-pink-400">
                            <span className="w-2.5 h-2.5 rounded bg-pink-400 inline-block"></span> Nữ
                          </span>
                        </div>
                      </div>

                      {/* Clustered Columns Simulation */}
                      <div className="flex-1 min-h-[160px] bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-end justify-around gap-4 pb-2">
                        {[
                          { name: 'Học tập', male: 7.5, female: 9.0 },
                          { name: 'Giải trí', male: 12.0, female: 8.5 },
                          { name: 'Mạng XH', male: 8.0, female: 9.5 },
                          { name: 'Tra cứu', male: 4.5, female: 5.0 }
                        ].map((cat, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                            <div className="flex items-end gap-1 w-full justify-center h-28">
                              {/* Male Bar */}
                              <div
                                style={{ height: `${(cat.male / 12) * 100}%` }}
                                className="w-4 sm:w-5 bg-sky-400 rounded-t shadow flex flex-col justify-start items-center text-[9px] font-mono font-bold text-slate-950 pt-0.5"
                                title={`Nam: ${cat.male}h`}
                              >
                                {cat.male}
                              </div>
                              {/* Female Bar */}
                              <div
                                style={{ height: `${(cat.female / 12) * 100}%` }}
                                className="w-4 sm:w-5 bg-pink-400 rounded-t shadow flex flex-col justify-start items-center text-[9px] font-mono font-bold text-slate-950 pt-0.5"
                                title={`Nữ: ${cat.female}h`}
                              >
                                {cat.female}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-300 font-medium mt-1 truncate">
                              {cat.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Insight Takeaway */}
                      <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-xs text-sky-200 font-medium">
                        💡 <strong>Nhận xét nhanh:</strong> Học sinh nam dành nhiều thời gian nhất cho <em>Giải trí (12h)</em>, trong khi học sinh nữ dành thời gian cao nhất cho <em>Mạng xã hội (9.5h)</em> và <em>Học tập (9.0h)</em>.
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col justify-between space-y-2 animate-in fade-in duration-200">
                      <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
                        <h4 className="font-black text-xs text-pink-300 uppercase">
                          MẪU 2: CƠ CẤU THỜI GIAN SỬ DỤNG CỦA HỌC SINH NỮ (32 GIỜ = 100%)
                        </h4>
                        <span className="text-[10px] font-mono text-pink-300 bg-pink-950 px-2 py-0.5 rounded">
                          2-D Pie Chart
                        </span>
                      </div>

                      <div className="flex-1 min-h-[160px] bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-around gap-3">
                        {/* Circular graphic */}
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#f472b6" strokeWidth="50" strokeDasharray="28 100" strokeDashoffset="0" />
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#fb7185" strokeWidth="50" strokeDasharray="27 100" strokeDashoffset="-28" />
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#c084fc" strokeWidth="50" strokeDasharray="30 100" strokeDashoffset="-55" />
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#38bdf8" strokeWidth="50" strokeDasharray="15 100" strokeDashoffset="-85" />
                          </svg>
                          <div className="absolute font-black text-xs text-white">Nữ</div>
                        </div>

                        {/* Percent breakdown */}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span><span>Học tập: <strong>28%</strong> (9.0h)</span></div>
                          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span><span>Giải trí: <strong>27%</strong> (8.5h)</span></div>
                          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span><span>Mạng XH: <strong>30%</strong> (9.5h)</span></div>
                          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span><span>Tra cứu: <strong>15%</strong> (5.0h)</span></div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-pink-950/60 border border-pink-500/40 text-xs text-pink-200 font-medium">
                        💡 <strong>Đặc điểm nổi bật:</strong> Biểu đồ quạt tròn giúp thấy rõ <em>Mạng xã hội (30%)</em> chiếm tỉ trọng lớn nhất trong quỹ thời gian thiết bị số của nữ sinh.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: BÀI TẬP 2 (Hình 7.9 Doanh thu ngành công nghiệp phần mềm Việt Nam) */}
            {luyenTapTab === 'bai2' && (
              <div className="flex-1 grid grid-cols-12 gap-3.5 min-h-0">
                {/* Left (6 cols): Column Chart Preview Hình 7.9 */}
                <div className="col-span-12 lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl">
                  <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-yellow-300 uppercase">
                        DOANH THU NGÀNH CÔNG NGHIỆP PHẦN MỀM VIỆT NAM (2016 – 2020)
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">Hình 7.9 SGK Tin học 8 tr.35 (Đơn vị: Tỷ USD)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                      Bài tập 2
                    </span>
                  </div>

                  {/* Real SGK Figure 7.9 (ENLARGED & Click to Zoom) */}
                  <div
                    onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_9_doanh_thu_phan_mem.png', title: 'Hình 7.9. Doanh thu công nghiệp phần mềm giai đoạn 2016–2020 (SGK tr.35)' })}
                    className="cursor-pointer bg-white rounded-2xl p-3 border-2 border-amber-400/60 hover:border-amber-300 flex flex-col items-center justify-center flex-1 min-h-[240px] my-2 group shadow-lg"
                  >
                    <img src="/images/tin8_bai7/hinh_7_9_doanh_thu_phan_mem.png" alt="Hình 7.9 SGK tr.35" className="max-h-72 sm:max-h-80 w-full object-contain group-hover:scale-[1.02] transition-transform" />
                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-1.5">Hình 7.9 SGK tr.35 (Bấm để phóng to)</span>
                  </div>

                  <div className="text-[11px] text-slate-400 text-center italic">
                    Nguồn số liệu: Sách giáo khoa Tin học 8 – Kết nối tri thức với cuộc sống
                  </div>
                </div>

                {/* Right (6 cols): 2 Interactive Click-to-Reveal Questions */}
                <div className="col-span-12 lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl space-y-3">
                  <span className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    CÂU HỎI THẢO LUẬN & ĐÁP ÁN CHUẨN HOÁ
                  </span>

                  {/* Question 1 */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-xs text-slate-100">
                        1. Tại sao trong trường hợp này lại sử dụng biểu đồ cột?
                      </p>
                      <button
                        onClick={() => { setRevealedQ1(!revealedQ1); playSound('click'); }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shrink-0"
                      >
                        {revealedQ1 ? 'Ẩn đáp án' : 'Xem đáp án'}
                      </button>
                    </div>

                    {revealedQ1 && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-200 animate-in fade-in duration-200">
                        ✓ <strong>Đáp án chuẩn:</strong> Dùng biểu đồ cột để <strong>so sánh rõ ràng quy mô doanh thu giữa các năm liên tiếp</strong> (chiều cao cột tăng dần thể hiện trực quan giá trị tuyệt đối).
                      </div>
                    )}
                  </div>

                  {/* Question 2 */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-xs text-slate-100">
                        2. Nhận xét xu hướng phát triển của ngành công nghiệp phần mềm Việt Nam?
                      </p>
                      <button
                        onClick={() => { setRevealedQ2(!revealedQ2); playSound('click'); }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shrink-0"
                      >
                        {revealedQ2 ? 'Ẩn đáp án' : 'Xem đáp án'}
                      </button>
                    </div>

                    {revealedQ2 && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-200 animate-in fade-in duration-200">
                        ✓ <strong>Đáp án chuẩn:</strong> Doanh thu <strong>tăng trưởng liên tục, đều đặn và vững chắc qua từng năm</strong> (từ 3,8 tỷ USD năm 2016 lên 5,4 tỷ USD năm 2020), khẳng định tiềm năng phát triển mạnh mẽ của công nghệ số nước ta.
                      </div>
                    )}
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950 text-[11px] text-slate-400 text-center">
                    💡 Học sinh giơ tay phát biểu ý kiến trước khi giáo viên lật mở đáp án chuẩn.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            SLIDE 4: HOẠT ĐỘNG 4 – VẬN DỤNG, VĂN HÓA PHÒNG MÁY & TỔNG KẾT
           ----------------------------------------------------------------------- */}
        {slideIndex === 4 && (
          <div className="w-full h-full flex flex-col gap-3 animate-in fade-in duration-300">
            {/* Slide Header Strip */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider">
                  HOẠT ĐỘNG 4: VẬN DỤNG & TỔNG KẾT
                </span>
                <span className="text-xs font-bold text-slate-400">SGK Trang 35</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 uppercase tracking-tight">
                MỞ RỘNG BIỂU ĐỒ ĐOẠN THẲNG & VĂN HÓA PHÒNG MÁY
              </h1>
            </div>

            {/* Symmetrical Two Columns (6 cols / 6 cols) */}
            <div className="flex-1 grid grid-cols-12 gap-3.5 min-h-0">
              
              {/* Left Column (6 cols): Line Chart Discovery */}
              <div className="col-span-12 lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl">
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    PHẦN 1: KHÁM PHÁ BIỂU ĐỒ ĐOẠN THẲNG (LINE CHART)
                  </span>
                  <p className="text-xs text-slate-300">
                    Khi muốn nhận diện <strong>xu hướng tăng trưởng theo chuỗi thời gian</strong>, biểu đồ đoạn thẳng là lựa chọn số 1!
                  </p>
                </div>

                {/* Simulated SVG Line Chart */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center my-2">
                  <div className="text-[11px] font-bold text-cyan-300 mb-1">
                    Đường dốc đi lên liên tục thể hiện xu hướng tăng trưởng (2016 – 2020)
                  </div>

                  <div className="w-full h-32 px-4 py-2 relative flex items-center justify-between">
                    <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="400" y2="20" stroke="#334155" strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeDasharray="3 3" />
                      <line x1="0" y1="80" x2="400" y2="80" stroke="#334155" strokeDasharray="3 3" />

                      {/* Glowing Line */}
                      <polyline
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="4"
                        points="40,80 120,68 200,54 280,36 360,20"
                        className="filter drop-shadow-[0_0_8px_#06b6d4]"
                      />

                      {/* Markers & Labels */}
                      {[
                        { x: 40, y: 80, rev: '3.8', year: '2016' },
                        { x: 120, y: 68, rev: '4.1', year: '2017' },
                        { x: 200, y: 54, rev: '4.5', year: '2018' },
                        { x: 280, y: 36, rev: '5.0', year: '2019' },
                        { x: 360, y: 20, rev: '5.4', year: '2020' }
                      ].map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                          <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#facc15" fontSize="11" fontWeight="bold font-mono">
                            {pt.rev}
                          </text>
                          <text x={pt.x} y="98" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                            {pt.year}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Real SGK Figures 7.3 & 7.9 for Line Chart Practice (ENLARGED) */}
                <div className="grid grid-cols-2 gap-3 my-1.5">
                  <div
                    onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_3_duong_thang.png', title: 'Hình 7.3. Mẫu biểu đồ đoạn thẳng (SGK tr.33)' })}
                    className="cursor-pointer bg-white rounded-2xl p-2 border-2 border-cyan-400/60 hover:border-cyan-300 flex flex-col items-center group shadow-md"
                  >
                    <img src="/images/tin8_bai7/hinh_7_3_duong_thang.png" alt="Hình 7.3" className="h-32 sm:h-40 w-full object-contain group-hover:scale-105 transition-transform" />
                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-1">Hình 7.3. Biểu đồ đoạn thẳng</span>
                  </div>
                  <div
                    onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_9_doanh_thu_phan_mem.png', title: 'Hình 7.9. Dữ liệu Doanh thu phần mềm 2016–2020 (SGK tr.35)' })}
                    className="cursor-pointer bg-white rounded-2xl p-2 border-2 border-amber-400/60 hover:border-amber-300 flex flex-col items-center group shadow-md"
                  >
                    <img src="/images/tin8_bai7/hinh_7_9_doanh_thu_phan_mem.png" alt="Hình 7.9" className="h-32 sm:h-40 w-full object-contain group-hover:scale-105 transition-transform" />
                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-1">Hình 7.9. Dữ liệu thực hành</span>
                  </div>
                </div>

                {/* Line Chart Guide Steps */}
                <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-xs text-cyan-200">
                  <strong>Thao tác tạo:</strong> Quét vùng dữ liệu ➔ <strong className="text-white">Insert</strong> ➔ nhóm Charts chọn <strong className="text-white">Insert Line or Area Chart</strong> ➔ kiểu <strong className="text-yellow-300">2-D Line with Markers</strong>.
                </div>
              </div>

              {/* Right Column (6 cols): Safe Exit Checklist & Finish Lesson */}
              <div className="col-span-12 lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl">
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    PHẦN 2: VĂN HÓA PHÒNG MÁY & KẾT THÚC AN TOÀN
                  </span>
                  <p className="text-xs text-slate-300">
                    Học sinh thực hiện đầy đủ 3 bước an toàn trước khi rời khỏi vị trí thực hành:
                  </p>
                </div>

                {/* 3 Interactive Safety Checkboxes */}
                <div className="space-y-2 my-2">
                  <div
                    onClick={() => { setSafetyStep1(!safetyStep1); playSound('click'); }}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      safetyStep1 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                      safetyStep1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {safetyStep1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                    </div>
                    <div>
                      <strong className="block text-xs">Lưu tệp bảng tính thực hành (Ctrl + S)</strong>
                      <span className="text-[10px] text-slate-400">Lưu vào thư mục cá nhân trên ổ đĩa D:\ để nộp bài</span>
                    </div>
                  </div>

                  <div
                    onClick={() => { setSafetyStep2(!safetyStep2); playSound('click'); }}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      safetyStep2 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                      safetyStep2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {safetyStep2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                    </div>
                    <div>
                      <strong className="block text-xs">Tắt máy tính an toàn theo quy trình chuẩn</strong>
                      <span className="text-[10px] text-slate-400">Nhấn nút Start ➔ Power ➔ Shut down (Không tắt nguồn đột ngột)</span>
                    </div>
                  </div>

                  <div
                    onClick={() => { setSafetyStep3(!safetyStep3); playSound('click'); }}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      safetyStep3 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                      safetyStep3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {safetyStep3 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                    </div>
                    <div>
                      <strong className="block text-xs">Vệ sinh và sắp xếp ngay ngắn vị trí thực hành</strong>
                      <span className="text-[10px] text-slate-400">Đẩy bàn phím vào gầm bàn, xếp ghế ngay ngắn và không để lại rác</span>
                    </div>
                  </div>
                </div>

                {/* GRAND FINALE BUTTON */}
                <button
                  onClick={() => {
                    setIsLessonFinished(true);
                    triggerGloriousConfetti();
                  }}
                  className="w-full py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/30 active:scale-95 transition-all animate-pulse"
                >
                  <Trophy className="w-5 h-5 text-slate-950" />
                  <span>🎉 HOÀN THÀNH TIẾT THAO GIẢNG (FINISH LESSON)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          BOTTOM HUD CONTROL STRIP (NAVIGATION & SHORTCUTS)
         ========================================================================= */}
      <footer className="px-4 py-2 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between text-xs shrink-0 z-30">
        
        {/* Left: Previous Button */}
        <button
          onClick={() => {
            setSlideIndex((prev) => Math.max(0, prev - 1));
            playSound('click');
          }}
          disabled={slideIndex === 0}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 font-bold flex items-center gap-1 border border-slate-700/80 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-cyan-400" />
          <span>Hoạt động trước</span>
        </button>

        {/* Center: Slide Progress Dots & Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSlideIndex(idx);
                  playSound('click');
                }}
                className={`h-2 rounded-full transition-all ${
                  slideIndex === idx ? 'w-8 bg-cyan-400 shadow-md shadow-cyan-400/50' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Chuyển tới ${ACTIVITIES[idx]?.tag} (${ACTIVITIES[idx]?.durationLabel})`}
              ></button>
            ))}
          </div>

          <span className="font-mono font-bold text-slate-400 text-xs">
            SLIDE <span className="text-cyan-300 font-black">{slideIndex + 1}</span> / 5 • {ACTIVITIES[slideIndex]?.tag} ({ACTIVITIES[slideIndex]?.durationLabel})
          </span>

          <span className="hidden md:inline text-[11px] text-slate-500">
            (Nhấn <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Phím ➔</kbd> hoặc <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Space</kbd> để chuyển slide)
          </span>
        </div>

        {/* Right: Next Button */}
        {slideIndex < 4 ? (
          <button
            onClick={() => {
              setSlideIndex((prev) => Math.min(4, prev + 1));
              playSound('click');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black flex items-center gap-1 shadow-md shadow-cyan-500/30 active:scale-95 transition-all"
          >
            <span>Hoạt động tiếp</span>
            <ChevronRight className="w-4 h-4 text-slate-950" />
          </button>
        ) : (
          <button
            onClick={() => {
              setIsLessonFinished(true);
              triggerGloriousConfetti();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black flex items-center gap-1 shadow-md shadow-amber-500/30 active:scale-95 transition-all"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>Tổng kết</span>
          </button>
        )}
      </footer>

      {/* =========================================================================
          GRAND FINALE MODAL: CHÚC MỪNG HOÀN THÀNH TIẾT DẠY
         ========================================================================= */}
      {isLessonFinished && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-yellow-400 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_60px_rgba(250,204,21,0.4)] relative">
            
            <button
              onClick={() => setIsLessonFinished(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto text-4xl shadow-lg border border-yellow-400/40 animate-bounce">
              👑
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950">
                CHÚC MỪNG HOÀN THÀNH TIẾT DẠY
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-amber-300 uppercase">
                BÀI 7: TRỰC QUAN HOÁ DỮ LIỆU BẰNG BIỂU ĐỒ
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Lớp 8 • Trường THCS Đắk Trôi • Giáo viên: <strong>Thầy Trần Đức Tình</strong>
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-200 text-left space-y-2">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>KẾT QUẢ TIẾT THỰC HÀNH:</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-300">
                <li>100% học sinh nắm vững quy trình tạo biểu đồ cột & hình quạt tròn trên Excel.</li>
                <li>Sử dụng thành thạo nút lệnh <strong>Chart Elements (+)</strong> để tùy biến biểu đồ.</li>
                <li>Thực hiện đúng quy tắc an toàn và văn hóa phòng máy tính trường học.</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={triggerGloriousConfetti}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95"
              >
                <span>🌸 Bắn pháo hoa</span>
              </button>
              <button
                onClick={() => setIsLessonFinished(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE IMAGE PUZZLE MODAL FOR CURRENT ACTIVITY */}
      {isPuzzleOpen && (
        <InteractivePuzzleModal
          puzzle={PUZZLE_BY_ACTIVITY[slideIndex]}
          onClose={() => setIsPuzzleOpen(false)}
          playSound={playSound}
        />
      )}

      {/* ZOOM MODAL FOR SGK FIGURES */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-cyan-400 flex flex-col items-center gap-3"
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900 text-white hover:bg-rose-600 transition-colors"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm sm:text-base font-black text-slate-900 pr-10 text-center">
              {zoomedImage.title}
            </h3>
            <img
              src={zoomedImage.src}
              alt={zoomedImage.title}
              className="max-h-[75vh] w-auto object-contain rounded-xl border border-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}

