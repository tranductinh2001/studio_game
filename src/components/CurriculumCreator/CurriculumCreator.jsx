import React, { useState } from 'react';
import {
  Sparkles, BookOpen, Layers, Clock, ArrowLeft, ArrowRight,
  Check, Play, Save, RefreshCw, FileText, Upload, HelpCircle,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Eye,
  GraduationCap, Hash, LayoutGrid, Award, Sliders
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { sampleRawTexts } from '../../data/curriculumSeedData';

export default function CurriculumCreator({
  onCancel,
  onLessonCreated,
  onPresentImmediately
}) {
  // Wizard steps: 1 = Info, 2 = Content, 3 = AI Generation & Structuring, 4 = Review & Finalize
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    subject: 'Tin học',
    grade: 8,
    lessonNumber: 8,
    title: 'Mạch logic và các cổng logic cơ bản',
    shortTitle: 'Mạch logic cơ bản',
    periodsCount: 2,
    teacherName: 'Thầy Trần Đức Tình',
    school: 'THCS Đắk Trôi',
    rawText: '',
    referenceNotes: 'Chuẩn bị phòng máy / phần mềm mô phỏng Logisim hoặc bảng mạch thực tế nếu có.'
  });

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [structuredPeriods, setStructuredPeriods] = useState([]);
  const [activePreviewPeriod, setActivePreviewPeriod] = useState(1);
  const [validationError, setValidationError] = useState('');

  // Pre-fill Sample SGK helper
  const handleLoadSample = (sampleKey) => {
    const sample = sampleRawTexts[sampleKey];
    if (!sample) return;
    setFormData(prev => ({
      ...prev,
      subject: sample.subject || prev.subject,
      grade: sample.grade || prev.grade,
      lessonNumber: sample.lessonNumber || prev.lessonNumber,
      title: sample.title || prev.title,
      periodsCount: sample.periodsCount || prev.periodsCount,
      rawText: sample.rawText || ''
    }));
    setValidationError('');
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.title.trim()) {
      setValidationError('Vui lòng nhập tên bài học.');
      return false;
    }
    if (!formData.lessonNumber || formData.lessonNumber < 1) {
      setValidationError('Số bài phải lớn hơn hoặc bằng 1.');
      return false;
    }
    setValidationError('');
    return true;
  };

  // Step 2 Validation & Trigger AI Generation
  const handleStartAIGeneration = async () => {
    if (!formData.rawText.trim()) {
      setValidationError('Vui lòng dán nội dung bài học hoặc chọn Nạp bài mẫu SGK.');
      return false;
    }
    setValidationError('');
    setCurrentStep(3);
    setIsGenerating(true);
    setGenerationProgress(15);

    try {
      const interval = setInterval(() => {
        setGenerationProgress(p => (p < 85 ? p + 15 : p));
      }, 250);

      const generated = await curriculumService.generateAIStructure(formData);
      clearInterval(interval);
      setGenerationProgress(100);

      const periodList = Array.isArray(generated) ? generated : (generated.periods || []);

      setTimeout(() => {
        setStructuredPeriods(periodList);
        setIsGenerating(false);
        setActivePreviewPeriod(1);
      }, 400);
    } catch (err) {
      console.error('Error generating AI structure:', err);
      setIsGenerating(false);
      setValidationError('Có lỗi khi tạo cấu trúc bài giảng. Vui lòng thử lại.');
    }
  };

  // Update Period Title in Preview
  const handleUpdatePeriodTitle = (periodNum, newTitle) => {
    setStructuredPeriods(prev =>
      prev.map(p => (p.periodNumber === periodNum ? { ...p, title: newTitle } : p))
    );
  };

  // Save Lesson to Library
  const handleSaveLesson = (presentAfterSave = false) => {
    const totalSlideCount = structuredPeriods.reduce(
      (acc, p) => acc + (p.slides?.length || 0),
      0
    );

    const newLesson = curriculumService.createLesson({
      ...formData,
      slideCount: totalSlideCount || 10,
      status: 'completed',
      periods: structuredPeriods
    });

    if (presentAfterSave && onPresentImmediately) {
      onPresentImmediately(newLesson);
    } else if (onLessonCreated) {
      onLessonCreated(newLesson);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden font-sans select-none">
      
      {/* 1. TOP HEADER & STEPPER */}
      <header className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            title="Quay lại Thư viện bài giảng"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950">
                THIẾT KẾ SLIDE BÀI GIẢNG AI
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                Chuẩn GDPT 2018 • Tỷ lệ 16:9
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-amber-300">
              Tạo bài giảng mới &amp; Cấu trúc đa tiết
            </h1>
          </div>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {[
            { step: 1, label: 'Thông tin' },
            { step: 2, label: 'Nội dung' },
            { step: 3, label: 'Phân bổ tiết AI' },
            { step: 4, label: 'Hoàn thiện' }
          ].map(s => (
            <div
              key={s.step}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                currentStep === s.step
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : currentStep > s.step
                  ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                  : 'text-slate-500'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black bg-black/30">
                {currentStep > s.step ? '✓' : s.step}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* 2. BODY CONTENT ACCORDING TO CURRENT STEP */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">

        {/* Error Alert Banner */}
        {validationError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-3 text-rose-200 text-xs sm:text-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* ================= STEP 1: LESSON METADATA ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Quick SGK Presets */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black uppercase text-cyan-300 tracking-wider">
                  Nạp nhanh bài mẫu SGK (Thử nghiệm 1 chạm)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Chọn mẫu bài soạn sẵn để trải nghiệm quy trình phân bổ tiết học và tạo slide chuẩn 16:9 ngay lập tức:
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleLoadSample('GRADE_8_BAI_8')}
                  className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 text-[10px] font-black">
                    LỚP 8
                  </span>
                  <span>Bài 8: Mạch logic và các cổng logic cơ bản (2 Tiết)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('GRADE_6_BAI_7')}
                  className="px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500 text-white text-[10px] font-black">
                    LỚP 6
                  </span>
                  <span>Bài 7: Tìm kiếm thông tin trên Internet (2 Tiết)</span>
                </button>
              </div>
            </div>

            {/* Input Form Fields */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>1. Thiết lập thông tin bài học &amp; Số tiết phân bổ</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Môn học */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Môn học
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:border-cyan-400"
                    placeholder="VD: Tin học, KHTN..."
                  />
                </div>

                {/* Khối lớp */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Khối lớp
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-black text-sm focus:outline-none focus:border-cyan-400"
                  >
                    <option value={6}>Lớp 6 (THCS)</option>
                    <option value={7}>Lớp 7 (THCS)</option>
                    <option value={8}>Lớp 8 (THCS)</option>
                    <option value={9}>Lớp 9 (THCS)</option>
                  </select>
                </div>

                {/* Số bài */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Số bài
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={formData.lessonNumber}
                      onChange={(e) => setFormData({ ...formData, lessonNumber: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-black text-sm focus:outline-none focus:border-cyan-400 pl-9"
                    />
                    <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Số tiết của bài học (1..4) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Số tiết phân bổ
                  </label>
                  <select
                    value={formData.periodsCount}
                    onChange={(e) => setFormData({ ...formData, periodsCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-300 font-black text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value={1}>1 Tiết (45 phút)</option>
                    <option value={2}>2 Tiết (90 phút - Khuyên dùng)</option>
                    <option value={3}>3 Tiết (Chuyên đề lớn)</option>
                    <option value={4}>4 Tiết (Dự án học tập)</option>
                  </select>
                </div>
              </div>

              {/* Tên bài học */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Tên bài học (Theo chương trình SGK hoặc chuyên đề)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-bold text-sm sm:text-base focus:outline-none focus:border-cyan-400 placeholder-slate-600"
                  placeholder="VD: Mạch logic và các cổng logic cơ bản"
                />
              </div>

              {/* Tên ngắn & Giáo viên */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tiêu đề rút gọn (Hiển thị thanh menu)
                  </label>
                  <input
                    type="text"
                    value={formData.shortTitle}
                    onChange={(e) => setFormData({ ...formData, shortTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-400"
                    placeholder="VD: Mạch logic cơ bản"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Giáo viên &amp; Đơn vị công tác
                  </label>
                  <input
                    type="text"
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-400"
                    placeholder="VD: Thầy Trần Đức Tình • THCS Đắk Trôi"
                  />
                </div>
              </div>

            </div>

            {/* Bottom Actions for Step 1 */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Tiếp tục: Nhập nội dung SGK</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: RAW LESSON CONTENT INPUT ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>2. Nạp nội dung kiến thức bài học ({formData.subject} {formData.grade} - Bài {formData.lessonNumber})</span>
                </h2>
                
                {/* Quick Sample Refill button */}
                <button
                  type="button"
                  onClick={() => handleLoadSample(formData.grade === 8 ? 'GRADE_8_BAI_8' : 'GRADE_6_BAI_7')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dán văn bản mẫu SGK Bài {formData.lessonNumber}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Dán toàn bộ nội dung lý thuyết sách giáo khoa, kế hoạch bài dạy (giáo án), hoặc ghi chú kiến thức trọng tâm.
                Hệ thống AI sẽ tự động phân tích các tiêu đề mục, khái niệm và phân bổ thành <span className="text-amber-300 font-bold">{formData.periodsCount} tiết học</span> cân đối.
              </p>

              {/* Textarea for Raw Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Nội dung văn bản kiến thức:</span>
                  <span>{formData.rawText.length} ký tự</span>
                </div>
                <textarea
                  rows={12}
                  value={formData.rawText}
                  onChange={(e) => {
                    setFormData({ ...formData, rawText: e.target.value });
                    if (validationError) setValidationError('');
                  }}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs sm:text-sm focus:outline-none focus:border-cyan-400 leading-relaxed placeholder-slate-600 resize-y"
                  placeholder="Dán nội dung bài học tại đây (Ví dụ: Các mục I, II, III; khái niệm cổng NOT, AND, OR, bảng chân lý; ví dụ minh họa và bài tập vận dụng)..."
                />
              </div>

              {/* Pedagogical Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Ghi chú sư phạm &amp; Thiết bị dạy học cần chuẩn bị:
                </label>
                <input
                  type="text"
                  value={formData.referenceNotes}
                  onChange={(e) => setFormData({ ...formData, referenceNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-400"
                  placeholder="VD: Máy chiếu, phòng thực hành, phiếu học tập nhóm A3..."
                />
              </div>

            </div>

            {/* Bottom Actions for Step 2 */}
            <div className="flex justify-between items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>

              <button
                type="button"
                onClick={handleStartAIGeneration}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 hover:opacity-95 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
                <span>AI Phân tích &amp; Tạo cấu trúc {formData.periodsCount} Tiết</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: AI GENERATION & PERIOD STRUCTURING PREVIEW ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Loading / Generating State */}
            {isGenerating ? (
              <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/30 animate-pulse">
                  <Sparkles className="w-10 h-10 text-white animate-spin" />
                </div>
                
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300">
                    AI Đang phân bổ nội dung thành {formData.periodsCount} tiết học...
                  </h3>
                  <p className="text-xs text-slate-400">
                    Phân tích ngữ nghĩa theo Chương trình GDPT 2018: Khởi động ➔ Hình thành kiến thức ➔ Luyện tập ➔ Vận dụng &amp; Đánh giá Bloom.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="max-w-md mx-auto space-y-1.5">
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Đang trích xuất câu hỏi Bloom...</span>
                    <span>{generationProgress}%</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Structured Periods Preview */
              <div className="space-y-6">
                
                {/* Success Banner & Period Switcher Tabs */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                          ĐÃ TẠO CẤU TRÚC THÀNH CÔNG ({structuredPeriods.length} TIẾT HỌC)
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-white mt-1">
                        {formData.title}
                      </h2>
                    </div>

                    {/* Period Tabs */}
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                      {structuredPeriods.map(p => (
                        <button
                          key={p.periodNumber}
                          type="button"
                          onClick={() => setActivePreviewPeriod(p.periodNumber)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                            activePreviewPeriod === p.periodNumber
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Tiết {p.periodNumber}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active Period Detail & Slide Canvas Cards */}
                {structuredPeriods
                  .filter(p => p.periodNumber === activePreviewPeriod)
                  .map(p => (
                    <div key={p.periodNumber} className="space-y-4">
                      
                      {/* Period Header Editor */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <Layers className="w-5 h-5 text-amber-400" />
                          <h3 className="text-sm font-black uppercase text-amber-300 tracking-wider">
                            Cấu trúc chi tiết Tiết {p.periodNumber} ({p.slides?.length || 0} slide • {p.questions?.length || 0} câu hỏi trắc nghiệm)
                          </h3>
                        </div>

                        {/* Title Editor */}
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">
                            Tiêu đề Tiết {p.periodNumber}:
                          </label>
                          <input
                            type="text"
                            value={p.title}
                            onChange={(e) => handleUpdatePeriodTitle(p.periodNumber, e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* Objectives List */}
                        {p.objectives && (
                          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                            <span className="text-[11px] font-black uppercase text-cyan-400 tracking-wider">
                              Mục tiêu cần đạt Tiết {p.periodNumber}:
                            </span>
                            <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                              {p.objectives.map((obj, oIdx) => (
                                <li key={oIdx}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* 16:9 Slides Preview Grid */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-cyan-400" />
                          <span>Danh sách Slide trình chiếu 16:9 của Tiết {p.periodNumber}</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {p.slides?.map((slide, sIdx) => (
                            <div
                              key={slide.id || sIdx}
                              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between aspect-[16/9] shadow-md hover:border-cyan-500/50 transition-all group relative overflow-hidden"
                            >
                              {/* Top Slide Meta */}
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-2">
                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 uppercase">
                                  {slide.type || 'Nội dung'}
                                </span>
                                <span>Slide {sIdx + 1}/{p.slides.length}</span>
                              </div>

                              {/* Center Content */}
                              <div className="my-auto py-2">
                                <h5 className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                                  {slide.title}
                                </h5>
                                {slide.subtitle && (
                                  <p className="text-[11px] text-amber-300/90 font-medium mt-0.5 line-clamp-1">
                                    {slide.subtitle}
                                  </p>
                                )}
                                <div className="text-[11px] text-slate-400 mt-2 space-y-0.5">
                                  {Array.isArray(slide.content) ? (
                                    slide.content.slice(0, 2).map((c, cIdx) => (
                                      <p key={cIdx} className="truncate">• {c}</p>
                                    ))
                                  ) : (
                                    <p className="truncate">• {slide.content}</p>
                                  )}
                                </div>
                              </div>

                              {/* Bottom Note */}
                              <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-800/60">
                                📌 {slide.notes || 'Thầy/Cô dẫn dắt theo hoạt động'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bloom Questions Preview */}
                      {p.questions && p.questions.length > 0 && (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                              Câu hỏi kiểm tra nhanh theo thang Bloom (Gắn liền với Tiết {p.periodNumber})
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {p.questions.map((q, qIdx) => (
                              <div
                                key={q.id || qIdx}
                                className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-indigo-400">
                                    Câu {qIdx + 1}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                                    Mức {q.bloomLevel || 'Nhận biết'}
                                  </span>
                                </div>
                                <p className="font-bold text-slate-200">
                                  {q.questionText}
                                </p>
                                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 pt-1">
                                  {Object.entries(q.options || {}).map(([key, val]) => (
                                    <div
                                      key={key}
                                      className={`px-2 py-1 rounded-lg border ${
                                        key === q.correctAnswer
                                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                                          : 'bg-slate-900 border-slate-800'
                                      }`}
                                    >
                                      {key}. {val}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}

                {/* Bottom Actions for Step 3 */}
                <div className="flex justify-between items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Điều chỉnh nội dung</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveLesson(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <Save className="w-4 h-4 text-cyan-400" />
                      <span>Lưu vào Thư viện</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveLesson(true)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:opacity-95 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <Play className="w-4 h-4 text-slate-950 fill-current" />
                      <span>LƯU &amp; TRÌNH CHIẾU NGAY</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}