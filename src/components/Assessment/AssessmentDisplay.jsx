import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Lock, Unlock, Eye, Sparkles, Clock, 
  BarChart3, Users, ChevronLeft, ChevronRight, RotateCcw, AlertCircle,
  Smartphone, QrCode, PlayCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { classroomService } from '../../services/classroomService';

export const LESSON_6_QUESTIONS = [
  {
    id: 'Q_01',
    questionText: 'Mạng thông tin toàn cầu (World Wide Web - WWW) là gì?',
    options: {
      A: 'Là một mạng máy tính kết nối bằng cáp ngầm dưới biển',
      B: 'Là dịch vụ thông tin bao gồm các trang web liên kết với nhau được lưu trữ trên Internet',
      C: 'Là một phần mềm dùng để soạn thảo văn bản',
      D: 'Là chiếc máy tính chủ của Google đặt tại Mỹ'
    },
    correctAnswer: 'B',
    explanation: 'WWW là một dịch vụ thông tin toàn cầu được tổ chức dưới dạng các trang web liên kết với nhau, hoạt động trên nền tảng Internet.',
    bloomLevel: 'Nhận biết',
    difficulty: 'Dễ'
  },
  {
    id: 'Q_02',
    questionText: 'Phát biểu nào sau đây là ĐÚNG khi nói về mối quan hệ giữa Internet và Mạng thông tin toàn cầu (WWW)?',
    options: {
      A: 'Internet và WWW là hai tên gọi khác nhau của cùng một đối tượng',
      B: 'WWW là hạ tầng mạng phần cứng, còn Internet là trang web',
      C: 'Internet là hạ tầng mạng kết nối, còn WWW là một dịch vụ thông tin hoạt động trên Internet',
      D: 'Muốn dùng Internet thì nhất thiết phải cài đặt WWW'
    },
    correctAnswer: 'C',
    explanation: 'Internet là mạng liên kết các mạng máy tính toàn cầu (hạ tầng mạng), còn WWW chỉ là một trong các dịch vụ chạy trên Internet.',
    bloomLevel: 'Thông hiểu',
    difficulty: 'Trung bình'
  },
  {
    id: 'Q_03',
    questionText: 'Trang web đầu tiên mở ra khi bạn truy cập vào một địa chỉ website được gọi là gì?',
    options: {
      A: 'Trang chủ (Homepage)',
      B: 'Trang tìm kiếm',
      C: 'Trang liên hệ',
      D: 'Trang mạng xã hội'
    },
    correctAnswer: 'A',
    explanation: 'Trang chủ (Homepage) là trang đầu tiên được tải và hiển thị khi người dùng mở một địa chỉ website.',
    bloomLevel: 'Nhận biết',
    difficulty: 'Dễ'
  },
  {
    id: 'Q_04',
    questionText: 'Đoạn văn bản hoặc hình ảnh mà khi nháy chuột vào đó sẽ dẫn đến một trang web khác được gọi là gì?',
    options: {
      A: 'Siêu văn bản (Hypertext)',
      B: 'Siêu liên kết (Hyperlink)',
      C: 'Trình duyệt web (Web Browser)',
      D: 'Địa chỉ IP máy chủ'
    },
    correctAnswer: 'B',
    explanation: 'Siêu liên kết (Hyperlink) là thành phần trong trang web liên kết đến một vị trí khác hoặc một trang web khác khi được nháy chuột.',
    bloomLevel: 'Nhận biết',
    difficulty: 'Dễ'
  },
  {
    id: 'Q_05',
    questionText: 'Phần mềm nào dưới đây KHÔNG PHẢI là trình duyệt web?',
    options: {
      A: 'Google Chrome',
      B: 'Microsoft Edge',
      C: 'Microsoft Word',
      D: 'Cốc Cốc'
    },
    correctAnswer: 'C',
    explanation: 'Microsoft Word là phần mềm soạn thảo văn bản, không phải là trình duyệt web.',
    bloomLevel: 'Vận dụng',
    difficulty: 'Dễ'
  }
];

export default function AssessmentDisplay({ roomCode = 'WB-601', currentQuestion = null, onOpenPhoneConnect = null }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(currentQuestion || LESSON_6_QUESTIONS[0]);

  const [questionState, setQuestionState] = useState('COLLECTING'); // 'COLLECTING' | 'LOCKED' | 'REVEALED'
  const [classes, setClasses] = useState([]);
  const [activeClassId, setActiveClassId] = useState('CLASS_6A');
  const [activeClassName, setActiveClassName] = useState('Lớp 6A');
  const [students, setStudents] = useState([]);
  const [responses, setResponses] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [bitoneAiAnalysis, setBitoneAiAnalysis] = useState(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // Load classes, students & Room state
  useEffect(() => {
    classroomService.getClasses().then((clsList) => {
      setClasses(clsList || []);
    });

    classroomService.getRoom(roomCode).then((room) => {
      if (room) {
        if (room.activeQuestion) setActiveQuestion(room.activeQuestion);
        if (room.questionState) setQuestionState(room.questionState);
        if (room.responses) setResponses(room.responses);
        if (room.analytics) setAnalytics(room.analytics);
        const targetClassId = room.classId || 'CLASS_6A';
        setActiveClassId(targetClassId);
        setActiveClassName(room.className || 'Lớp 6A');
        classroomService.getStudents(targetClassId).then(setStudents);
      }
    });

    // Subscribe to SSE
    const unsubscribe = classroomService.subscribeToRoom(roomCode, (event) => {
      if (event.type === 'QUESTION_UPDATED') {
        setActiveQuestion(event.payload.activeQuestion);
        setQuestionState(event.payload.questionState);
      } else if (event.type === 'RESPONSES_UPDATED') {
        setResponses(event.payload.responses || {});
        setAnalytics(event.payload.analytics);
      } else if (event.type === 'QUESTION_LOCKED') {
        setQuestionState('LOCKED');
      } else if (event.type === 'ANSWER_REVEALED') {
        setQuestionState('REVEALED');
        triggerConfetti();
      } else if (event.type === 'ROOM_CLASS_CHANGED' || event.type === 'ROOM_STATE') {
        const payload = event.payload;
        if (payload.activeQuestion) setActiveQuestion(payload.activeQuestion);
        if (payload.questionState) setQuestionState(payload.questionState);
        if (payload.responses) setResponses(payload.responses);
        if (payload.analytics) setAnalytics(payload.analytics);
        if (payload.classId) {
          setActiveClassId(payload.classId);
          setActiveClassName(payload.className || 'Lớp 6A');
          classroomService.getStudents(payload.classId).then(setStudents);
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Switch Room Class
  const handleSwitchClass = async (newClassId) => {
    setActiveClassId(newClassId);
    const cls = classes.find((c) => c.id === newClassId);
    if (cls) setActiveClassName(cls.name);
    try {
      await classroomService.setRoomClass(roomCode, newClassId);
      const stuList = await classroomService.getStudents(newClassId);
      setStudents(stuList || []);
      setResponses({});
    } catch (err) {
      console.error('Error switching room class:', err);
    }
  };

  // Sync external question selection if changed from Question Bank
  useEffect(() => {
    if (currentQuestion) {
      setActiveQuestion(currentQuestion);
      handleSetQuestion(currentQuestion);
    }
  }, [currentQuestion]);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleLockQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSetQuestion = async (q) => {
    try {
      await classroomService.setQuestion(roomCode, q, 'COLLECTING');
      setQuestionState('COLLECTING');
      setResponses({});
      setBitoneAiAnalysis(null);
      setTimerSeconds(60);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLockQuestion = async () => {
    try {
      await classroomService.lockQuestion(roomCode);
      setQuestionState('LOCKED');
      setIsTimerRunning(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevealAnswer = async () => {
    try {
      await classroomService.revealAnswer(roomCode);
      setQuestionState('REVEALED');
      setIsTimerRunning(false);
      triggerConfetti();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetQuestion = () => {
    handleSetQuestion(activeQuestion);
  };

  const handleSelectQuestionByIndex = (idx) => {
    if (idx >= 0 && idx < LESSON_6_QUESTIONS.length) {
      setCurrentQIndex(idx);
      const q = LESSON_6_QUESTIONS[idx];
      setActiveQuestion(q);
      handleSetQuestion(q);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      handleSelectQuestionByIndex(currentQIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < LESSON_6_QUESTIONS.length - 1) {
      handleSelectQuestionByIndex(currentQIndex + 1);
    }
  };

  // Run BitOne AI Pedagogical Analysis
  const handleAnalyzeWithBitOne = async () => {
    setIsAnalyzingAi(true);
    try {
      const data = await classroomService.getAnalytics(roomCode);
      const res = await classroomService.analyzeResults({
        analytics: data,
        question: activeQuestion
      });
      setBitoneAiAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Helper: Resilient lookup for student response across cardId, studentCode, id & Quizizz P 1..60
  const getStudentResponse = (stu, idx) => {
    if (!stu) return null;
    const stt = idx + 1;
    const cardMatch = (stu.cardId || '').match(/(\d+)/);
    const pNum = cardMatch ? parseInt(cardMatch[1], 10) : stt;
    return responses[stu.cardId] || 
           responses[stu.id] || 
           responses[stu.studentCode] || 
           responses[`P ${pNum}`] || 
           responses[`P${pNum}`] ||
           responses[`CARD_${String(pNum).padStart(4, '0')}`] ||
           responses[`P ${stt}`] || 
           responses[`P${stt}`] ||
           responses[`CARD_${String(stt).padStart(4, '0')}`] ||
           responses[String(pNum)] ||
           responses[String(stt)];
  };

  const totalStudents = students.length || 32;
  const answeredStudents = students.filter((stu, idx) => !!getStudentResponse(stu, idx));
  const answeredCount = Math.max(answeredStudents.length, Object.keys(responses).length > 0 && answeredStudents.length === 0 ? Object.keys(responses).length : answeredStudents.length);
  const answeredPercentage = Math.round((answeredCount / totalStudents) * 100);

  // Distribution counts
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  if (answeredStudents.length > 0) {
    answeredStudents.forEach((stu, idx) => {
      const r = getStudentResponse(stu, idx);
      if (r && r.answer && counts[r.answer] !== undefined) {
        counts[r.answer]++;
      }
    });
  } else {
    Object.values(responses).forEach(r => {
      if (r && r.answer && counts[r.answer] !== undefined) {
        counts[r.answer]++;
      }
    });
  }

  const correctCount = counts[activeQuestion.correctAnswer] || 0;
  const accuracyOnAnswered = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const accuracyOnTotal = Math.round((correctCount / totalStudents) * 100);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden p-3 sm:p-5">
      {/* Top Header & Projector Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <BarChart3 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-emerald-300 font-['Orbitron',sans-serif]">
                ĐÁNH GIÁ QR THẺ GIẤY
              </h2>
              {/* Question State Badge */}
              {questionState === 'COLLECTING' && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> ĐANG THU BÀI
                </span>
              )}
              {questionState === 'LOCKED' && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/50 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> ĐÃ KHÓA
                </span>
              )}
              {questionState === 'REVEALED' && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> ĐÃ CÔNG BỐ ĐÁP ÁN
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Phòng: <span className="text-cyan-400 font-mono font-bold">{roomCode}</span></span>
              <span>•</span>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-0.5">
                <span className="text-[11px] text-slate-400">Đang chọn lớp:</span>
                <select
                  value={activeClassId}
                  onChange={(e) => handleSwitchClass(e.target.value)}
                  className="bg-transparent text-cyan-300 font-bold text-xs focus:outline-none cursor-pointer"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id} className="bg-slate-900 text-white">
                      {cls.name} ({cls.totalStudents || 0} HS)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Question Switcher for Teacher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Question Navigator Strip (5 Bài 6 Questions) */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQIndex === 0}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Câu trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {LESSON_6_QUESTIONS.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => handleSelectQuestionByIndex(idx)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  currentQIndex === idx 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Câu {idx + 1}
              </button>
            ))}
            <button
              onClick={handleNextQuestion}
              disabled={currentQIndex === LESSON_6_QUESTIONS.length - 1}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Câu tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Connect Phone Button */}
          {onOpenPhoneConnect && (
            <button
              onClick={onOpenPhoneConnect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20"
              title="Mở mã QR để kết nối camera điện thoại quét thẻ"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Kết nối điện thoại
            </button>
          )}

          {/* Timer pill */}
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
              timerSeconds <= 10 && isTimerRunning
                ? 'bg-red-500/20 text-red-300 border-red-500 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {timerSeconds}s {isTimerRunning ? '(Chạy)' : '(Dừng)'}
          </button>

          {questionState === 'COLLECTING' && (
            <button
              onClick={handleLockQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20"
            >
              <Lock className="w-3.5 h-3.5" />
              Khóa nộp bài
            </button>
          )}

          {questionState !== 'REVEALED' ? (
            <button
              onClick={handleRevealAnswer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
            >
              <Eye className="w-3.5 h-3.5" />
              Công bố đáp án
            </button>
          ) : (
            <button
              onClick={handleResetQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Bắt đầu thu bài lại
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Question & Options (7 cols) vs 32-Student Grid & Analytics (5 cols) */}
      <div className="flex-1 min-h-0 py-3 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Big Projector Question Display & 4 Options (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Question Header & Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-black text-xs border border-cyan-400/40">
                CÂU HỎI
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-400/30">
                {activeQuestion.bloomLevel || 'Nhận biết'}
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
              {activeQuestion.questionText}
            </h3>
          </div>

          {/* 4 Big High-Contrast Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['A', 'B', 'C', 'D'].map((optKey) => {
              const text = activeQuestion.options?.[optKey];
              const isCorrect = activeQuestion.correctAnswer === optKey;
              const count = counts[optKey] || 0;
              const percent = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;

              let cardStyle = "bg-slate-950/80 border-slate-800 text-slate-200";
              let badgeStyle = "bg-slate-800 text-slate-300";

              if (questionState === 'REVEALED') {
                if (isCorrect) {
                  cardStyle = "bg-emerald-950/60 border-emerald-400 text-white shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-400/50";
                  badgeStyle = "bg-emerald-400 text-slate-950 font-black";
                } else {
                  cardStyle = "bg-slate-950/50 border-slate-800 text-slate-400 opacity-60";
                  badgeStyle = "bg-slate-800 text-slate-400";
                }
              }

              return (
                <div
                  key={optKey}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between min-h-[90px] relative overflow-hidden ${cardStyle}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${badgeStyle}`}>
                      {optKey}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold leading-snug flex-1">
                      {text}
                    </span>
                  </div>

                  {/* Percentage bar if Revealed */}
                  {questionState === 'REVEALED' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        <span className={isCorrect ? "text-emerald-400" : "text-slate-400"}>
                          {count} học sinh ({percent}%)
                        </span>
                      </div>
                      <div className="w-24 bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isCorrect ? 'bg-emerald-400' : 'bg-slate-600'}`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Box on Reveal */}
          {questionState === 'REVEALED' && (
            <div className="bg-slate-950/90 border border-emerald-500/40 rounded-xl p-3.5 space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                GIẢI THÍCH CHI TIẾT CÂU HỎI
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Live 32-Student Response Matrix & Analytics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden p-3.5">
          {/* Header Stats Strip */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-200">
                TIẾN ĐỘ THU BÀI: {answeredCount} / {totalStudents} HS
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300">
              {answeredPercentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden my-2">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${answeredPercentage}%` }}
            />
          </div>

          {/* 32 Student Live Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto py-2 pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {students.map((stu, idx) => {
                const res = getStudentResponse(stu, idx);
                const hasAnswered = !!res;
                const isCorrect = hasAnswered && res.answer === activeQuestion.correctAnswer;

                let cellClass = "bg-slate-950 border-slate-800 text-slate-400";
                if (hasAnswered) {
                  if (questionState === 'REVEALED') {
                    cellClass = isCorrect 
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold" 
                      : "bg-red-950/80 border-red-500/80 text-red-300";
                  } else {
                    // Answered but not revealed: Show green glowing card WITHOUT showing answer!
                    cellClass = "bg-cyan-950/60 border-cyan-400/80 text-cyan-300 font-bold shadow-sm shadow-cyan-500/20";
                  }
                }

                return (
                  <div
                    key={stu.id}
                    className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-between transition-all ${cellClass}`}
                    title={stu.fullName}
                  >
                    <span className="truncate pr-1">
                      {stu.fullName.split(' ').slice(-1)[0]}
                    </span>
                    {hasAnswered ? (
                      questionState === 'REVEALED' ? (
                        <span className="text-[10px] font-black">{res.answer}</span>
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Realtime Accuracy Strip & BitOne AI Button if Revealed */}
          {questionState === 'REVEALED' && (
            <div className="pt-2 border-t border-slate-800 shrink-0 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Đúng / Đã nộp</span>
                  <span className="text-sm font-black text-emerald-400">{accuracyOnAnswered}%</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Đúng / Toàn lớp (32 HS)</span>
                  <span className="text-sm font-black text-cyan-400">{accuracyOnTotal}%</span>
                </div>
              </div>

              {/* BitOne AI Qualitative Analysis Trigger */}
              <button
                onClick={handleAnalyzeWithBitOne}
                disabled={isAnalyzingAi}
                className="w-full py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isAnalyzingAi ? 'BitOne AI đang phân tích...' : 'Nhận xét sư phạm với BitOne AI'}
              </button>

              {bitoneAiAnalysis && (
                <div className="bg-indigo-950/50 border border-indigo-500/40 rounded-xl p-2.5 text-[11px] text-slate-200 max-h-32 overflow-y-auto space-y-1">
                  <span className="font-bold text-indigo-300 block">💡 Nhận xét từ BitOne AI:</span>
                  <p className="leading-relaxed">{bitoneAiAnalysis.summary || bitoneAiAnalysis}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

