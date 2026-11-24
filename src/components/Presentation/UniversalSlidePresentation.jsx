import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Clock, Layers, Sparkles, ChevronLeft, ChevronRight,
  Maximize2, Minimize2, Play, Pause, RotateCcw, Award, CheckCircle2,
  AlertCircle, ArrowLeft, ExternalLink, HelpCircle, Eye, Volume2, List
} from 'lucide-react';
import LessonSlidePresentation from './LessonSlidePresentation';
import Tin8Bai07SlidePresentation from './Tin8Bai07SlidePresentation';
import { curriculumService } from '../../services/curriculumService';

export default function UniversalSlidePresentation({
  lesson: propLesson,
  onSwitchTab,
  onBackToLibrary
}) {
  // If no prop passed, retrieve active lesson from service
  const activeLesson = propLesson || curriculumService.getActiveLesson();

  // If this is the Core Lesson 6 (Mạng thông tin toàn cầu), render the rich custom presentation
  if (activeLesson?.isCoreLesson) {
    return (
      <div className="w-full h-full flex flex-col relative">
        {/* Quick Return to Library Ribbon */}
        <div className="bg-slate-900 px-4 py-1.5 border-b border-cyan-500/30 flex items-center justify-between text-xs z-30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-bold text-cyan-300">
              Đang trình chiếu: Tin học 6 - Bài 6 (Mô-đun Tương Tác Cốt Lõi)
            </span>
          </div>
          {onBackToLibrary && (
            <button
              onClick={onBackToLibrary}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thư viện bài giảng</span>
            </button>
          )}
        </div>
        <div className="flex-1 min-h-0">
          <LessonSlidePresentation onSwitchTab={onSwitchTab} />
        </div>
      </div>
    );
  }

  // If this is Tin học 8 - Bài 7 (Trực quan hoá dữ liệu bằng biểu đồ - Tiết 2), render dedicated interactive presentation!
  if (activeLesson?.id === 'lesson_tin8_bai07' || (activeLesson?.grade === 8 && activeLesson?.lessonNumber === 7)) {
    return (
      <div className="w-full h-full flex flex-col relative">
        <Tin8Bai07SlidePresentation
          onSwitchTab={onSwitchTab}
          onBackToLibrary={onBackToLibrary}
        />
      </div>
    );
  }

  // Fallback for empty lesson
  if (!activeLesson || !activeLesson.periods || activeLesson.periods.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center space-y-4">
        <BookOpen className="w-16 h-16 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold">Chưa có bài giảng nào được chọn</h2>
        <p className="text-xs text-slate-400 max-w-md">
          Vui lòng chọn một bài giảng từ Thư viện hoặc tạo bài giảng mới để bắt đầu trình chiếu.
        </p>
        {onBackToLibrary && (
          <button
            onClick={onBackToLibrary}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 transition-all"
          >
            Mở Thư Viện Bài Giảng
          </button>
        )}
      </div>
    );
  }

  // Universal 16:9 Presentation Engine State
  const [activePeriodNum, setActivePeriodNum] = useState(1);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState({});
  const [showAnswerFeedback, setShowAnswerFeedback] = useState({});

  // Classroom Countdown Timer State
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerPreset, setTimerPreset] = useState(60);

  const containerRef = useRef(null);

  // Active Period and Slides
  const currentPeriod = activeLesson.periods.find(p => p.periodNumber === activePeriodNum) || activeLesson.periods[0];
  const slides = currentPeriod?.slides || [];
  const currentSlide = slides[slideIndex] || slides[0] || {};
  const currentQuestions = currentPeriod?.questions || [];

  // Reset slide index when changing period
  const handleSelectPeriod = (num) => {
    setActivePeriodNum(num);
    setSlideIndex(0);
  };

  // Slide navigation
  const nextSlide = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      // If at end of current period and next period exists, prompt or advance
      if (activePeriodNum < activeLesson.periods.length) {
        setActivePeriodNum(activePeriodNum + 1);
        setSlideIndex(0);
      }
    }
  };

  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    } else if (activePeriodNum > 1) {
      const prevPeriod = activeLesson.periods.find(p => p.periodNumber === activePeriodNum - 1);
      setActivePeriodNum(activePeriodNum - 1);
      setSlideIndex((prevPeriod?.slides?.length || 1) - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        setShowQuizModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slideIndex, activePeriodNum, slides.length]);

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const resetTimer = (seconds) => {
    setIsTimerRunning(false);
    setTimerPreset(seconds);
    setTimerSeconds(seconds);
  };

  // Toggle browser fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden font-sans select-none"
    >
      
      {/* 1. TOP CONTROL BAR */}
      <header className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 z-20">
        
        {/* Left: Back & Lesson Meta */}
        <div className="flex items-center gap-3">
          {onBackToLibrary && (
            <button
              onClick={onBackToLibrary}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Quay lại Thư viện bài giảng"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-cyan-500/20">
            {activeLesson.grade}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {activeLesson.subject?.toUpperCase()} {activeLesson.grade} • BÀI {activeLesson.lessonNumber}
              </span>
              <span className="text-xs font-bold text-slate-200 hidden md:inline truncate max-w-sm">
                {activeLesson.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {activeLesson.school || 'THCS Đắk Trôi'} • GV: {activeLesson.teacherName || 'Thầy Trần Đức Tình'}
            </p>
          </div>
        </div>

        {/* Center: Period Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {activeLesson.periods.map(p => (
            <button
              key={p.periodNumber}
              onClick={() => handleSelectPeriod(p.periodNumber)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activePeriodNum === p.periodNumber
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Tiết {p.periodNumber}</span>
            </button>
          ))}
        </div>

        {/* Right: Embedded Classroom Timer, Bloom Quiz & Fullscreen */}
        <div className="flex items-center gap-2">
          
          {/* Quick Timer Pill */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
            <span className="font-bold text-amber-300">
              {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 hover:text-cyan-300 transition-colors"
              title={isTimerRunning ? 'Tạm dừng' : 'Bắt đầu đếm ngược'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => resetTimer(timerPreset)}
              className="p-1 hover:text-slate-200 transition-colors"
              title="Đặt lại đồng hồ"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <div className="hidden lg:flex items-center gap-1 ml-1 pl-1 border-l border-slate-800 text-[10px]">
              {[60, 120, 300].map(s => (
                <button
                  key={s}
                  onClick={() => resetTimer(s)}
                  className={`px-1.5 py-0.5 rounded ${timerPreset === s ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {s >= 60 ? `${s / 60}p` : `${s}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Formative Quiz Trigger */}
          {currentQuestions.length > 0 && (
            <button
              onClick={() => setShowQuizModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-400/40 text-indigo-300 hover:text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/10"
              title="Mở câu hỏi trắc nghiệm kiểm tra nhanh Tiết này"
            >
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Trắc nghiệm Bloom ({currentQuestions.length})</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white transition-all"
            title="Toàn màn hình trình chiếu (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN 16:9 SLIDE STAGE */}
      <main className="flex-1 min-h-0 flex items-center justify-center p-3 sm:p-6 bg-[#020617] relative">
        
        {/* 16:9 Aspect Ratio Projected Canvas */}
        <div className="w-full max-w-6xl aspect-[16/9] max-h-full bg-gradient-to-br from-slate-900 via-[#0a0f24] to-[#040816] rounded-3xl border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Ambient Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Header Strip */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
                {currentSlide.type === 'title' ? 'Trang Bìa' :
                 currentSlide.type === 'objective' ? 'Mục Tiêu' :
                 currentSlide.type === 'hook' ? 'Khởi Động' :
                 currentSlide.type === 'activity' ? 'Hoạt Động' :
                 currentSlide.type === 'summary' ? 'Tổng Kết' : 'Kiến Thức Trọng Tâm'}
              </span>
              <span className="text-xs text-amber-300 font-bold">
                {currentPeriod?.title}
              </span>
            </div>

            <div className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              Slide {slideIndex + 1} / {slides.length}
            </div>
          </div>

          {/* Slide Body Content */}
          <div className="my-auto py-4 relative z-10 space-y-5">
            
            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-amber-300 leading-tight">
                {currentSlide.title}
              </h1>
              {currentSlide.subtitle && (
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-amber-400/90">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Slide Content Cards or Bullets */}
            <div className="space-y-3 pt-2">
              {Array.isArray(currentSlide.content) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {currentSlide.content.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 p-4 rounded-2xl flex items-start gap-3 transition-all shadow-md group"
                    >
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
                        {idx + 1}
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-slate-200 leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl text-base sm:text-xl font-semibold text-slate-200 leading-relaxed">
                  {currentSlide.content}
                </div>
              )}
            </div>

          </div>

          {/* Slide Footer: Pedagogical Note & Author Tag */}
          <div className="border-t border-slate-800/80 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">📌 Hướng dẫn tổ chức:</span>
              <span className="text-slate-300 font-medium">
                {currentSlide.notes || 'Giáo viên điều phối hoạt động theo nhóm hoặc cặp đôi.'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-semibold">
              {activeLesson.school || 'THCS Đắk Trôi'} • 2026-2027
            </div>
          </div>

        </div>

      </main>

      {/* 3. BOTTOM SLIDE NAVIGATION & THUMBNAILS BAR */}
      <footer className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 z-20">
        
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          disabled={slideIndex === 0 && activePeriodNum === 1}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
            slideIndex === 0 && activePeriodNum === 1
              ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500'
              : 'bg-slate-800 hover:bg-slate-700 text-white hover:scale-[1.02]'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Trước</span>
        </button>

        {/* Thumbnail Dots or Quick Jump */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl py-1 px-2">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setSlideIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                slideIndex === idx
                  ? 'w-8 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md shadow-cyan-500/50'
                  : 'w-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Slide ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/30 transition-all hover:scale-[1.02]"
        >
          <span>Tiếp theo</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </footer>

      {/* 4. BLOOM FORMATIVE QUIZ MODAL */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Kiểm tra nhanh Tiết {activePeriodNum} (Phân tầng Bloom)
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeLesson.title} • {currentQuestions.length} câu hỏi củng cố
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowQuizModal(false)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Đóng
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {currentQuestions.map((q, qIdx) => {
                const userChoice = selectedQuizAnswer[q.id];
                const isRevealed = showAnswerFeedback[q.id];
                const isCorrect = userChoice === q.correctAnswer;

                return (
                  <div
                    key={q.id || qIdx}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-400">
                        Câu {qIdx + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                        Mức {q.bloomLevel || 'Nhận biết'}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-white">
                      {q.questionText}
                    </p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(q.options || {}).map(([optKey, optVal]) => (
                        <button
                          key={optKey}
                          onClick={() => {
                            setSelectedQuizAnswer({ ...selectedQuizAnswer, [q.id]: optKey });
                            setShowAnswerFeedback({ ...showAnswerFeedback, [q.id]: true });
                          }}
                          className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                            isRevealed && optKey === q.correctAnswer
                              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/50'
                              : isRevealed && userChoice === optKey && !isCorrect
                              ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                              : userChoice === optKey
                              ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <span className="font-black text-cyan-400 mr-1.5">{optKey}.</span>
                          <span>{optVal}</span>
                        </button>
                      ))}
                    </div>

                    {/* Feedback & Explanation */}
                    {isRevealed && (
                      <div
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          isCorrect
                            ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950/40 border border-amber-500/40 text-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-black">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Chính xác! Đáp án đúng là {q.correctAnswer}</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-amber-400" />
                              <span>Chưa đúng! Đáp án chính xác là {q.correctAnswer}</span>
                            </>
                          )}
                        </div>
                        {q.explanation && (
                          <p className="text-[11px] text-slate-300 pl-5">
                            💡 Giải thích: {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
