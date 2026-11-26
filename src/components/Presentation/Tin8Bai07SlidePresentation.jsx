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
    subtitle: 'Ghép đúng công cụ xử lý số liệu & biểu đồ tương ứng với Bài 1 & Bài 2 SGK tr.35',
    slots: [
      { id: 's1', label: 'Bài 1: Tính tổng số HS mỗi khoảng thời gian (TGSDThietbiso.xlsx)', expectedId: 'l1' },
      { id: 's2', label: 'Bài 1a: So sánh số HS sử dụng theo từng khoảng thời gian', expectedId: 'l2' },
      { id: 's3', label: 'Bài 1b: Thể hiện tỉ lệ % số HS theo mỗi khoảng thời gian', expectedId: 'l3' },
      { id: 's4', label: 'Bài 2: Lập bảng & nhận xét doanh thu phần mềm 2016–2020', expectedId: 'l4' }
    ],
    cards: [
      { id: 'l4', title: 'Biểu đồ cột Hình 7.9 (3.038 → 5.439 triệu USD)', hint: 'Bài 2 SGK tr.35', img: '/images/tin8_bai7/hinh_7_9_doanh_thu_phan_mem.png' },
      { id: 'l1', title: 'Hàm =SUM(...) tổng hợp bảng', hint: 'Hình 7.8 SGK tr.35', img: '/images/tin8_bai7/hinh_7_8_bang_thiet_bi_so.png' },
      { id: 'l3', title: 'Biểu đồ hình quạt tròn (2-D Pie)', hint: 'Tỉ lệ phần trăm %', img: '/images/tin8_bai7/hinh_7_4_quat_tron.png' },
      { id: 'l2', title: 'Biểu đồ cột (2-D Column)', hint: 'Nhóm lệnh Charts', img: '/images/tin8_bai7/hinh_7_5_nhom_charts.png' }
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

  // Per-activity countdown durations matching lesson plan (HĐ2 = 20m split evenly: 10m + 10m)
  const ACTIVITY_DURATIONS = { 0: 240, 1: 600, 2: 600, 3: 600, 4: 360 };
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

  // 5 Core Activities Metadata matching Lesson Plan (HĐ 2 = 20p chia đều 10p + 10p)
  const ACTIVITIES = [
    {
      id: 0,
      tag: 'HĐ 1',
      durationLabel: '4p',
      title: 'Mở Đầu',
      desc: 'HĐ 1 (3–5 phút): Khởi động Đấu trường Webby & Kết nối tri thức'
    },
    {
      id: 1,
      tag: 'HĐ 2A',
      durationLabel: '10p',
      title: 'Gõ Bảng & Cột',
      desc: 'HĐ 2A (10 phút): Gõ bảng Hình 7.1 vào Excel & tạo Biểu đồ cột (chia đều 20p HĐ 2)'
    },
    {
      id: 2,
      tag: 'HĐ 2B',
      durationLabel: '10p',
      title: 'Biểu Đồ Quạt',
      desc: 'HĐ 2B (10 phút): Từ bảng vừa gõ tạo Biểu đồ quạt tròn & hiện % (chia đều 20p HĐ 2)'
    },
    {
      id: 3,
      tag: 'HĐ 3',
      durationLabel: '10p',
      title: 'Luyện Tập',
      desc: 'HĐ 3 (10–12 phút): Luyện tập Bài 1 & Bài 2 SGK trang 35'
    },
    {
      id: 4,
      tag: 'HĐ 4',
      durationLabel: '6p',
      title: 'Vận Dụng',
      desc: 'HĐ 4 (5–7 phút): Biểu đồ đoạn thẳng, Văn hóa phòng máy & Tổng kết'
    }
  ];

  // Shared Prominent Countdown Widget (giống Slide Bài 6)
  const renderSlideCountdown = (label) => {
    const total = ACTIVITY_DURATIONS[slideIndex] || 600;
    const pct = Math.max(0, Math.min(100, (activityTimer / total) * 100));
    return (
      <div className="bg-slate-950/90 border-2 border-cyan-500/40 rounded-2xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <Clock className={`w-5 h-5 ${activityTimer <= 60 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</div>
            <div className={`font-mono text-2xl sm:text-3xl font-black leading-none ${activityTimer <= 60 ? 'text-rose-400' : 'text-emerald-300'}`}>
              {formatTime(activityTimer)}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[100px] h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            style={{ width: `${pct}%` }}
            className={`h-full transition-all duration-1000 ${pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'}`}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setActivityTimerRunning((r) => !r); playSound('click'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow transition-all active:scale-95 ${
              activityTimerRunning ? 'bg-amber-400 hover:bg-amber-300 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {activityTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{activityTimerRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
          </button>
          <button
            onClick={() => { setActivityTimerRunning(false); setActivityTimer(total); playSound('click'); }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Đặt lại thời gian"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

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
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/40 text-xs sm:text-sm font-black uppercase tracking-wider">
                  HOẠT ĐỘNG 2A • 10 PHÚT (1/2 CỦA 20 PHÚT HĐ 2)
                </span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-cyan-300 uppercase tracking-tight">
                GÕ BẢNG HÌNH 7.1 & TẠO BIỂU ĐỒ CỘT + CHART ELEMENTS (+)
              </h1>
            </div>

            {/* Clear Student Task Banner + Prominent Countdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              <div className="lg:col-span-7 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500/20 via-cyan-500/15 to-emerald-500/20 border-2 border-cyan-400/50 text-sm sm:text-base text-slate-100 shadow-md">
                <span className="font-black text-yellow-300 uppercase mr-2">🎯 YÊU CẦU HĐ 2A:</span>
                <span><strong>(1) Gõ lại bảng Hình 7.1</strong> vào Excel (ô B2:C8) ➔ <strong>(2) Tạo Biểu đồ cột</strong> (2-D Column) ➔ <strong>(3) Bấm (+)</strong> thêm Tiêu đề & Nhãn dữ liệu.</span>
              </div>
              <div className="lg:col-span-5">
                {renderSlideCountdown('ĐẾM NGƯỢC HĐ 2A (10 PHÚT)')}
              </div>
            </div>

            {/* Split Screen Grid (Left 5 cols: Data & Steps | Right 7 cols: LARGE SGK Figures) */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
              
              {/* Left Column (5 cols): Figure 7.1 + Clear 4 Steps */}
              <div className="col-span-12 lg:col-span-5 flex flex-col gap-3 min-h-0 justify-between">
                
                {/* Hình 7.1 SGK (Click to Zoom) */}
                <div
                  onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_1_bang_khao_sat.png', title: 'Hình 7.1. Bảng số liệu khảo sát lớp 8A (Vùng chọn B2:C8)' })}
                  className="cursor-pointer bg-white rounded-2xl p-2.5 border-2 border-sky-400/60 hover:border-sky-300 flex items-center gap-3 shadow-lg group"
                >
                  <img src="/images/tin8_bai7/hinh_7_1_bang_khao_sat.png" alt="Hình 7.1" className="h-32 sm:h-36 object-contain group-hover:scale-105 transition-transform" />
                  <div className="text-left space-y-1">
                    <div className="text-xs sm:text-sm font-black text-sky-700">📋 Hình 7.1 SGK tr.32</div>
                    <div className="text-xs sm:text-sm text-slate-700 font-semibold">Vùng dữ liệu cần chọn: <span className="font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">B2:C8</span></div>
                    <div className="text-[11px] text-cyan-700 font-bold">(Bấm ảnh để phóng to)</div>
                  </div>
                </div>

                {/* 4 Clear Steps */}
                <div className="flex-1 bg-slate-900/90 rounded-2xl border border-sky-500/40 p-3.5 flex flex-col justify-between gap-2 shadow-xl">
                  <span className="text-xs sm:text-sm font-black text-sky-300 uppercase tracking-wider">
                    📌 CÁC BƯỚC THỰC HÀNH TRÊN EXCEL:
                  </span>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-700 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-sky-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">1</span>
                      <span className="text-slate-100">Quét chọn vùng dữ liệu <strong className="text-yellow-300 font-mono">B2:C8</strong> (Hình 7.1).</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-700 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">2</span>
                      <span className="text-slate-100">Thẻ <strong className="text-yellow-300">Insert</strong> ➔ nhóm <strong className="text-yellow-300">Charts</strong> ➔ <strong className="text-cyan-300">Insert Column or Bar Chart</strong> ➔ <strong className="text-cyan-300">2-D Column</strong>.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-400/60 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">3</span>
                      <span className="text-emerald-100">Nhấp nút dấu cộng <strong className="text-yellow-300">(+) Chart Elements</strong> tích chọn <strong>Chart Title</strong>, <strong>Data Labels</strong>, <strong>Axis Titles</strong>.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): ENLARGED SGK Visual Reference Figures (7.5 & 7.6) */}
              <div className="col-span-12 lg:col-span-7 flex flex-col gap-3 min-h-0">
                <div className="flex-1 bg-gradient-to-br from-slate-900/95 via-slate-900 to-sky-950/50 rounded-2xl border-2 border-cyan-500/50 p-4 space-y-3 shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-black text-cyan-300 uppercase tracking-wider">
                      📸 HÌNH MINH HỌA SGK ĐỂ HS NHÌN LÀM THEO (BẤM PHÓNG TO)
                    </span>
                    <span className="text-xs font-bold text-slate-200 bg-slate-800 px-2.5 py-1 rounded-lg">SGK tr.33–34</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 flex-1 min-h-0">
                    <div
                      onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_5_nhom_charts.png', title: 'Hình 7.5. Nhóm lệnh Charts (Insert -> 2-D Column)' })}
                      className="cursor-pointer bg-white rounded-2xl p-2.5 border-2 border-cyan-400/60 hover:border-cyan-300 flex items-center justify-between gap-4 group shadow-md"
                    >
                      <img src="/images/tin8_bai7/hinh_7_5_nhom_charts.png" alt="Hình 7.5" className="h-28 sm:h-36 flex-1 object-contain group-hover:scale-[1.03] transition-transform" />
                      <div className="w-44 text-left shrink-0">
                        <div className="text-sm font-black text-slate-900">Hình 7.5. Nhóm Charts</div>
                        <div className="text-xs text-slate-600 mt-0.5">Chọn biểu tượng cột vàng (2-D Column)</div>
                      </div>
                    </div>
                    <div
                      onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_6_chart_elements_cot.png', title: 'Hình 7.6. Bổ sung thông tin bằng Chart Elements (+)' })}
                      className="cursor-pointer bg-white rounded-2xl p-2.5 border-2 border-emerald-400/60 hover:border-emerald-300 flex items-center justify-between gap-4 group shadow-md"
                    >
                      <img src="/images/tin8_bai7/hinh_7_6_chart_elements_cot.png" alt="Hình 7.6" className="h-36 sm:h-44 flex-1 object-contain group-hover:scale-[1.03] transition-transform" />
                      <div className="w-44 text-left shrink-0">
                        <div className="text-sm font-black text-emerald-800">Hình 7.6. Nút dấu (+)</div>
                        <div className="text-xs text-slate-600 mt-0.5">Tích chọn Chart Title, Data Labels, Axis Titles</div>
                      </div>
                    </div>
                  </div>
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
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-xs sm:text-sm font-black uppercase tracking-wider">
                  HOẠT ĐỘNG 2B • 10 PHÚT (1/2 CỦA 20 PHÚT HĐ 2)
                </span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-pink-300 uppercase tracking-tight">
                TỪ BẢNG ĐÃ GÕ ➔ TẠO BIỂU ĐỒ QUẠT TRÒN & HIỆN TỈ LỆ %
              </h1>
            </div>

            {/* Clear Student Task Banner + Prominent Countdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              <div className="lg:col-span-7 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-pink-500/20 border-2 border-indigo-400/50 text-sm sm:text-base text-slate-100 shadow-md">
                <span className="font-black text-yellow-300 uppercase mr-2">🎯 YÊU CẦU HĐ 2B:</span>
                <span>Từ <strong>bảng số liệu vừa gõ ở HĐ 2A (B2:C8)</strong> ➔ Tạo <strong>Biểu đồ hình quạt tròn (2-D Pie)</strong> ➔ Bấm <strong>(+) ➔ Data Labels ➔ More Options ➔ Percentage (%)</strong>.</span>
              </div>
              <div className="lg:col-span-5">
                {renderSlideCountdown('ĐẾM NGƯỢC HĐ 2B (10 PHÚT)')}
              </div>
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

              {/* Sub-Tabs + Countdown */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => { setLuyenTapTab('bai1'); playSound('click'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      luyenTapTab === 'bai1'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    BÀI TẬP 1 (TGSDThietbiso.xlsx)
                  </button>
                  <button
                    onClick={() => { setLuyenTapTab('bai2'); playSound('click'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      luyenTapTab === 'bai2'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    BÀI TẬP 2 (Hình 7.9)
                  </button>
                </div>
              </div>
            </div>

            {renderSlideCountdown('ĐẾM NGƯỢC HĐ 3: LUYỆN TẬP (10 PHÚT)')}

            {/* TAB 1: BÀI TẬP 1 (TGSDThietbiso.xlsx - CHUẨN SGK TR.35) */}
            {luyenTapTab === 'bai1' && (
              <div className="flex-1 grid grid-cols-12 gap-3.5 min-h-0">
                {/* Left (6 cols): Đề bài SGK + Hình 7.8 + Bảng số liệu chuẩn */}
                <div className="col-span-12 lg:col-span-6 bg-slate-900/90 rounded-2xl border border-emerald-500/40 p-3.5 flex flex-col justify-between shadow-xl overflow-y-auto gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-400/40 text-xs sm:text-sm text-slate-100 space-y-1">
                    <div className="font-black text-emerald-300 uppercase">📌 BÀI 1 (SGK TR.35): MỞ TỆP <code className="text-yellow-300 font-mono">TGSDThietbiso.xlsx</code></div>
                    <p>• Dùng hàm <strong className="text-cyan-300 font-mono">=SUM(...)</strong> tính tổng số HS mỗi khoảng thời gian (như <strong>Hình 7.8</strong>):</p>
                    <p><strong>a)</strong> Vẽ <strong>biểu đồ cột</strong> thể hiện số HS sử dụng thiết bị số mỗi khoảng thời gian & nhận xét.</p>
                    <p><strong>b)</strong> Vẽ <strong>biểu đồ hình quạt tròn</strong> thể hiện <strong>tỉ lệ phần trăm (%)</strong> theo mỗi khoảng thời gian.</p>
                  </div>

                  {/* SGK Figure 7.8 preview (ENLARGED) */}
                  <div
                    onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_8_bang_thiet_bi_so.png', title: 'Hình 7.8. Tổng số HS sử dụng thiết bị số (SGK tr.35)' })}
                    className="cursor-pointer bg-white rounded-2xl p-2.5 border-2 border-emerald-400/60 hover:border-emerald-300 flex items-center justify-center gap-4 group shadow-md"
                  >
                    <img src="/images/tin8_bai7/hinh_7_8_bang_thiet_bi_so.png" alt="Hình 7.8" className="h-32 sm:h-40 object-contain group-hover:scale-105 transition-transform" />
                    <div className="text-left text-xs sm:text-sm text-slate-800 font-semibold space-y-1">
                      <div className="font-black text-emerald-700 text-sm sm:text-base">📸 Hình 7.8 SGK tr.35</div>
                      <div>Tổng cộng: <strong className="text-emerald-700">429 học sinh</strong></div>
                      <div className="text-[11px] text-cyan-700 font-bold">👉 Bấm vào ảnh để phóng to!</div>
                    </div>
                  </div>

                  {/* Actions to Switch Sample Charts */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => { setViewExerciseChart('column'); playSound('click'); }}
                      className={`p-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                        viewExerciseChart === 'column'
                          ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-sky-300'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Câu a: Biểu đồ cột</span>
                    </button>

                    <button
                      onClick={() => { setViewExerciseChart('pie'); playSound('click'); }}
                      className={`p-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                        viewExerciseChart === 'pie'
                          ? 'bg-pink-500 text-slate-950 font-black shadow-lg shadow-pink-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-pink-300'
                      }`}
                    >
                      <PieChart className="w-4 h-4" />
                      <span>Câu b: Quạt tròn (%)</span>
                    </button>
                  </div>
                </div>

                {/* Right (6 cols): Accurate SGK Sample Chart Visualizer (68, 131, 146, 72, 12) */}
                <div className="col-span-12 lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl">
                  {viewExerciseChart === 'column' ? (
                    <div className="w-full h-full flex flex-col justify-between space-y-2 animate-in fade-in duration-200">
                      <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
                        <h4 className="font-black text-xs sm:text-sm text-sky-300 uppercase">
                          CÂU a: SỐ HỌC SINH SỬ DỤNG THIẾT BỊ SỐ THEO THỜI GIAN
                        </h4>
                        <span className="text-[11px] font-mono text-sky-300 bg-sky-950 px-2 py-0.5 rounded">2-D Column</span>
                      </div>

                      {/* Exact Columns for Hình 7.8 */}
                      <div className="flex-1 min-h-[180px] bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-end justify-around gap-3 pt-6 pb-2">
                        {[
                          { name: 'Không dùng', val: 68, color: '#64748b' },
                          { name: 'Dưới 1 giờ', val: 131, color: '#38bdf8' },
                          { name: '1-2 giờ', val: 146, color: '#10b981' },
                          { name: '3-4 giờ', val: 72, color: '#f59e0b' },
                          { name: '≥ 5 giờ', val: 12, color: '#f43f5e' }
                        ].map((cat, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                            <span className="font-mono font-black text-xs sm:text-sm text-yellow-300 mb-1">{cat.val}</span>
                            <div
                              style={{ height: `${Math.round((cat.val / 150) * 100)}%`, backgroundColor: cat.color }}
                              className="w-9 sm:w-12 rounded-t-lg shadow-lg transition-all"
                            />
                            <span className="text-[11px] text-slate-200 font-semibold mt-1.5 text-center leading-tight">
                              {cat.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-500/40 text-xs sm:text-sm text-sky-100 font-medium">
                        💡 <strong>Nhận xét (Câu a):</strong> Học sinh khối 8 sử dụng thiết bị số nhiều nhất ở mức <strong>1–2 giờ (146 HS)</strong> và <strong>Dưới 1 giờ (131 HS)</strong>; rất ít em dùng từ 5 giờ trở lên (12 HS).
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col justify-between space-y-2 animate-in fade-in duration-200">
                      <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
                        <h4 className="font-black text-xs sm:text-sm text-pink-300 uppercase">
                          CÂU b: TỈ LỆ % SỐ HS SỬ DỤNG THIẾT BỊ SỐ (429 HS = 100%)
                        </h4>
                        <span className="text-[11px] font-mono text-pink-300 bg-pink-950 px-2 py-0.5 rounded">2-D Pie (%)</span>
                      </div>

                      <div className="flex-1 min-h-[180px] bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-around gap-4">
                        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#64748b" strokeWidth="50" strokeDasharray="16 100" strokeDashoffset="0" />
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#38bdf8" strokeWidth="50" strokeDasharray="31 100" strokeDashoffset="-16" />
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#10b981" strokeWidth="50" strokeDasharray="34 100" strokeDashoffset="-47" />
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#f59e0b" strokeWidth="50" strokeDasharray="17 100" strokeDashoffset="-81" />
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#f43f5e" strokeWidth="50" strokeDasharray="2 100" strokeDashoffset="-98" />
                          </svg>
                          <div className="absolute w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center font-black text-xs text-white">100%</div>
                        </div>

                        <div className="space-y-1.5 text-xs sm:text-sm">
                          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-500"></span><span>Không dùng: <strong>16%</strong> (68 HS)</span></div>
                          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sky-400"></span><span>Dưới 1 giờ: <strong>31%</strong> (131 HS)</span></div>
                          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400"></span><span>1–2 giờ: <strong>34%</strong> (146 HS)</span></div>
                          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400"></span><span>3–4 giờ: <strong>17%</strong> (72 HS)</span></div>
                          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span><span>Từ 5 giờ trở lên: <strong>3%</strong> (12 HS)</span></div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-pink-950/60 border border-pink-500/40 text-xs sm:text-sm text-pink-100 font-medium">
                        💡 <strong>Nhắc thao tác:</strong> Bấm nút <strong>(+) ➔ Data Labels ➔ More Options ➔ Percentage (%)</strong> để hiện tỉ lệ phần trăm!
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
                  <span className="text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    YÊU CẦU BÀI 2 (SGK TR.35) & ĐÁP ÁN CHUẨN
                  </span>

                  {/* Question a */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-xs sm:text-sm text-slate-100">
                        a) Từ Hình 7.9, em có nhận xét gì về doanh thu công nghiệp phần mềm giai đoạn 2016–2020?
                      </p>
                      <button
                        onClick={() => { setRevealedQ1(!revealedQ1); playSound('click'); }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shrink-0"
                      >
                        {revealedQ1 ? 'Ẩn' : 'Đáp án'}
                      </button>
                    </div>

                    {revealedQ1 && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-xs sm:text-sm text-emerald-200 animate-in fade-in duration-200">
                        ✓ Doanh thu <strong>tăng trưởng liên tục qua từng năm</strong>: từ <strong>3.038 triệu USD</strong> (2016) lên <strong>5.439 triệu USD</strong> (2020).
                      </div>
                    )}
                  </div>

                  {/* Question b & c */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs sm:text-sm text-slate-100 space-y-1">
                        <p>b) Tạo bảng dữ liệu trong phần mềm bảng tính từ biểu đồ Hình 7.9.</p>
                        <p>c) Tạo biểu đồ cột từ bảng dữ liệu có được ở câu b.</p>
                      </div>
                      <button
                        onClick={() => { setRevealedQ2(!revealedQ2); playSound('click'); }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shrink-0"
                      >
                        {revealedQ2 ? 'Ẩn' : 'Xem bảng'}
                      </button>
                    </div>

                    {revealedQ2 && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-xs sm:text-sm text-emerald-200 animate-in fade-in duration-200 font-mono">
                        2016: 3038 | 2017: 3779 | 2018: 4447 | 2019: 4932 | 2020: 5439 (Triệu USD) ➔ Insert ➔ 2-D Column.
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
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 uppercase tracking-tight">
                MỞ RỘNG BIỂU ĐỒ ĐOẠN THẲNG & VĂN HÓA PHÒNG MÁY
              </h1>
            </div>

            {renderSlideCountdown('ĐẾM NGƯỢC HĐ 4: VẬN DỤNG & TỔNG KẾT (6 PHÚT)')}

            {/* Symmetrical Two Columns (6 cols / 6 cols) */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
              
              {/* Left Column (6 cols): KHBD Questions (BIG & CLEAR) + Line Chart Steps */}
              <div className="col-span-12 lg:col-span-6 bg-gradient-to-br from-slate-900/95 via-slate-900 to-cyan-950/40 rounded-2xl border border-cyan-500/40 p-4 flex flex-col justify-between shadow-xl gap-2.5 overflow-y-auto">
                {/* 1. Nhiệm vụ Vận dụng chuẩn KHBD (Chữ to rõ) */}
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border-2 border-amber-400/50 space-y-1.5">
                  <div className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>🎯 NHIỆM VỤ VẬN DỤNG (KHBD & SGK TR.35):</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                    Ngoài biểu đồ cột, để biểu diễn <span className="text-cyan-300">xu hướng tăng giảm theo thời gian</span>, ta dùng loại biểu đồ nào? Hãy thực hành vẽ <span className="text-yellow-300">biểu đồ đoạn thẳng (Line Chart)</span> cho dữ liệu <strong>Doanh thu phần mềm (Hình 7.9)</strong>.
                  </p>
                </div>

                {/* 2. Câu hỏi gợi mở KHBD (To rõ + Nút xem đáp án) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm sm:text-base font-bold text-cyan-200 leading-snug">
                      ❓ <strong>Câu hỏi gợi mở:</strong> Để vẽ biểu đồ đoạn thẳng, ta vào dải lệnh <span className="text-yellow-300">Insert</span> và chọn biểu tượng nào trong nhóm <span className="text-yellow-300">Charts</span>?
                    </p>
                    <button
                      onClick={() => { setShowLineTrendDetails(!showLineTrendDetails); playSound('click'); }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 text-xs sm:text-sm font-bold shrink-0"
                    >
                      {showLineTrendDetails ? 'Ẩn gợi ý' : 'Xem đáp án'}
                    </button>
                  </div>
                  {showLineTrendDetails && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-400/50 text-xs sm:text-sm text-emerald-100 space-y-1 animate-in fade-in duration-150">
                      <div>✅ Chọn biểu tượng <strong>Insert Line or Area Chart</strong> (đường gấp khúc, hàng 2 cột 1 trong <strong>Hình 7.5</strong>) ➔ kiểu <strong>2-D Line (Line with Markers)</strong>.</div>
                      <div>📈 <strong>So sánh:</strong> Đường dốc đi lên thể hiện ngay <strong>xu hướng tăng trưởng liên tục (2016–2020)</strong> mà không cần so từng cột!</div>
                    </div>
                  )}
                </div>

                {/* 3. Hình minh họa SGK phóng to (Hình 7.5 + Hình 7.3) */}
                <div className="grid grid-cols-2 gap-3 flex-1 min-h-[140px]">
                  <div
                    onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_5_nhom_charts.png', title: 'Hình 7.5. Chọn biểu tượng Insert Line or Area Chart (hàng 2 cột 1)' })}
                    className="cursor-pointer bg-white rounded-2xl p-2 border-2 border-cyan-400/60 hover:border-cyan-300 flex flex-col items-center justify-center group shadow-md"
                  >
                    <img src="/images/tin8_bai7/hinh_7_5_nhom_charts.png" alt="Hình 7.5" className="h-28 sm:h-36 w-full object-contain group-hover:scale-105 transition-transform" />
                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-1 text-center">Hình 7.5. Nút Line Chart</span>
                  </div>
                  <div
                    onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_3_duong_thang.png', title: 'Hình 7.3. Kết quả mẫu Biểu đồ đoạn thẳng (SGK tr.33)' })}
                    className="cursor-pointer bg-white rounded-2xl p-2 border-2 border-emerald-400/60 hover:border-emerald-300 flex flex-col items-center justify-center group shadow-md"
                  >
                    <img src="/images/tin8_bai7/hinh_7_3_duong_thang.png" alt="Hình 7.3" className="h-28 sm:h-36 w-full object-contain group-hover:scale-105 transition-transform" />
                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-1 text-center">Hình 7.3. Mẫu đường thẳng</span>
                  </div>
                </div>
              </div>

              {/* Right Column (6 cols): Hình 7.9 Dữ liệu thực hành + Dặn dò & Kết thúc */}
              <div className="col-span-12 lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl gap-2.5 overflow-y-auto">
                {/* Hình 7.9 Dữ liệu Doanh thu phần mềm (TO RÕ) */}
                <div
                  onClick={() => setZoomedImage({ src: '/images/tin8_bai7/hinh_7_9_doanh_thu_phan_mem.png', title: 'Hình 7.9. Dữ liệu Doanh thu phần mềm 2016–2020 (3.038 → 5.439 triệu USD)' })}
                  className="cursor-pointer bg-white rounded-2xl p-2.5 border-2 border-amber-400/60 hover:border-amber-300 flex items-center justify-between gap-3 group shadow-md"
                >
                  <img src="/images/tin8_bai7/hinh_7_9_doanh_thu_phan_mem.png" alt="Hình 7.9" className="h-32 sm:h-40 flex-1 object-contain group-hover:scale-[1.03] transition-transform" />
                  <div className="w-40 text-left shrink-0 space-y-1">
                    <div className="text-xs sm:text-sm font-black text-amber-700">📊 Hình 7.9 SGK tr.35</div>
                    <div className="text-xs text-slate-700 font-semibold">Dữ liệu thực hành vẽ biểu đồ đoạn thẳng (2016–2020).</div>
                    <div className="text-[11px] text-cyan-700 font-bold">(Bấm phóng to)</div>
                  </div>
                </div>

                {/* Văn hóa phòng máy & Dặn dò cuối tiết (To rõ) */}
                <div className="space-y-1.5">
                  <span className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    DẶN DÒ & QUY TẮC PHÒNG MÁY CUỐI TIẾT:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    <div
                      onClick={() => { setSafetyStep1(!safetyStep1); playSound('click'); }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all text-xs sm:text-sm ${
                        safetyStep1 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        safetyStep1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {safetyStep1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                      </div>
                      <span><strong>Lưu bài thực hành (Ctrl + S)</strong> vào thư mục cá nhân trên máy tính.</span>
                    </div>

                    <div
                      onClick={() => { setSafetyStep2(!safetyStep2); playSound('click'); }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all text-xs sm:text-sm ${
                        safetyStep2 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        safetyStep2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {safetyStep2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                      </div>
                      <span><strong>Tắt máy đúng quy trình</strong> (Start ➔ Power ➔ Shut down) & xếp ghế gọn gàng.</span>
                    </div>
                  </div>
                </div>

                {/* GRAND FINALE BUTTON */}
                <button
                  onClick={() => {
                    setIsLessonFinished(true);
                    triggerGloriousConfetti();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/30 active:scale-95 transition-all animate-pulse"
                >
                  <Trophy className="w-5 h-5 text-slate-950" />
                  <span>🎉 HOÀN THÀNH TIẾT HỌC</span>
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

