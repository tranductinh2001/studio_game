import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Lock, Unlock, Eye, Sparkles, Clock, 
  BarChart3, Users, ChevronLeft, ChevronRight, RotateCcw, AlertCircle,
  Smartphone, QrCode, PlayCircle, Settings, PlusCircle, Check, X, Shield, RefreshCw, Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { classroomService } from '../../services/classroomService';
import { LESSON_6_QUESTIONS } from '../../data/lesson6Questions';

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

  // Room Config & Creator Modal states
  const [showRoomConfigModal, setShowRoomConfigModal] = useState(false);
  const [configRoomCode, setConfigRoomCode] = useState(roomCode);
  const [configClassId, setConfigClassId] = useState('CLASS_6A');
  const [configQuestionBank, setConfigQuestionBank] = useState('LESSON_6');
  const [configTimer, setConfigTimer] = useState(60);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomCreatedBanner, setRoomCreatedBanner] = useState('');
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);

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
        setConfigClassId(targetClassId);
        setActiveClassName(room.className || 'Lớp 6A');
        classroomService.getStudents(targetClassId).then(setStudents);
      }
    });

    // Subscribe to SSE
    const unsubscribe = classroomService.subscribeToRoom(roomCode, (event) => {
      if (event.type === 'DEVICE_JOINED') {
        setIsPhoneConnected(true);
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
        } catch (e) {}
      } else if (event.type === 'QUESTION_UPDATED') {
        const newQ = event.payload.activeQuestion || event.payload.currentQuestion;
        if (newQ) {
          setActiveQuestion(newQ);
          const foundIdx = LESSON_6_QUESTIONS.findIndex(q => q.id === newQ.id || q.questionText === newQ.questionText);
          if (foundIdx !== -1) setCurrentQIndex(foundIdx);
        }
        setQuestionState(event.payload.questionState || 'COLLECTING');
        setResponses(event.payload.responses || {});
      } else if (event.type === 'RESPONSES_UPDATED') {
        setResponses(event.payload.responses || {});
        setAnalytics(event.payload.analytics);
      } else if (event.type === 'QUESTION_LOCKED') {
        setQuestionState('LOCKED');
      } else if (event.type === 'ANSWER_REVEALED') {
        setQuestionState('REVEALED');
        triggerConfetti();
      } else if (event.type === 'ROOM_CLASS_CHANGED' || event.type === 'ROOM_STATE' || event.type === 'ROOM_CREATED') {
        const payload = event.payload;
        if (payload.activeQuestion) {
          setActiveQuestion(payload.activeQuestion);
          const foundIdx = LESSON_6_QUESTIONS.findIndex(q => q.id === payload.activeQuestion.id || q.questionText === payload.activeQuestion.questionText);
          if (foundIdx !== -1) setCurrentQIndex(foundIdx);
        }
        if (payload.questionState) setQuestionState(payload.questionState);
        if (payload.responses) setResponses(payload.responses);
        if (payload.analytics) setAnalytics(payload.analytics);
        if (payload.classId) {
          setActiveClassId(payload.classId);
          setConfigClassId(payload.classId);
          setActiveClassName(payload.className || 'Lớp 6A');
          classroomService.getStudents(payload.classId).then(setStudents);
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Handle Create and Launch Room Online
  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    try {
      const selectedQ = LESSON_6_QUESTIONS[0];
      await classroomService.createRoom(configRoomCode, configClassId, {
        questionBank: configQuestionBank,
        timerSeconds: configTimer,
        question: selectedQ
      });
      setActiveClassId(configClassId);
      const cls = classes.find(c => c.id === configClassId);
      if (cls) setActiveClassName(cls.name);
      setActiveQuestion(selectedQ);
      setCurrentQIndex(0);
      setTimerSeconds(configTimer);
      setResponses({});
      setQuestionState('COLLECTING');
      setShowRoomConfigModal(false);
      setRoomCreatedBanner(`🟢 PHÒNG ONLINE: ${configRoomCode} • ${cls ? cls.name : 'Lớp 6A'} đã kích hoạt! Điện thoại giáo viên có thể vào phòng ngay.`);
      setTimeout(() => setRoomCreatedBanner(''), 7000);
    } catch (err) {
      console.error('Error creating room:', err);
    } finally {
      setIsCreatingRoom(false);
    }
  };

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

          {/* Create & Config Room Button */}
          <button
            onClick={() => setShowRoomConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-purple-600/20"
            title="Tạo phòng chơi mới, cấu hình lớp và bộ câu hỏi"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Tạo & Cấu hình phòng</span>
          </button>

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

      {/* Room Online Banner / Phone Connected Notification */}
      {roomCreatedBanner && (
        <div className="mt-2 px-3 py-2 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{roomCreatedBanner}</span>
          </div>
          <button onClick={() => setRoomCreatedBanner('')} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isPhoneConnected && !roomCreatedBanner && (
        <div className="mt-2 px-3 py-1.5 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-cyan-200 text-xs font-bold flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>🟢 ĐIỆN THOẠI GIÁO VIÊN ĐÃ VÀO PHÒNG! Đang đồng bộ điều khiển và quét thẻ trực tiếp.</span>
        </div>
      )}

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

      {/* ROOM CONFIGURATION & CREATOR MODAL */}
      {showRoomConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative space-y-4 animate-scaleUp">
            {/* Close Button */}
            <button
              onClick={() => setShowRoomConfigModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300">
                  TẠO & CẤU HÌNH PHÒNG CHƠI
                </h3>
                <p className="text-xs text-slate-400">
                  Thiết lập phòng online để điện thoại giáo viên vào điều khiển
                </p>
              </div>
            </div>

            {/* Config Form */}
            <div className="space-y-3 pt-2 text-xs">
              {/* Room Code */}
              <div>
                <label className="text-slate-300 font-bold mb-1 flex items-center justify-between">
                  <span>MÃ PHÒNG CHƠI</span>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = Math.floor(100 + Math.random() * 900);
                      setConfigRoomCode(`WB-${rand}`);
                    }}
                    className="text-cyan-400 text-[11px] font-normal hover:underline"
                  >
                    🎲 Tạo mã ngẫu nhiên
                  </button>
                </label>
                <input
                  type="text"
                  value={configRoomCode}
                  onChange={(e) => setConfigRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono font-bold text-sm text-cyan-300 focus:outline-none focus:border-cyan-400"
                  placeholder="VD: WB-601"
                />
              </div>

              {/* Select Class */}
              <div>
                <label className="text-slate-300 font-bold mb-1 block">CHỌN LỚP HỌC</label>
                <select
                  value={configClassId}
                  onChange={(e) => setConfigClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-bold text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.totalStudents || 0} học sinh)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Question Bank */}
              <div>
                <label className="text-slate-300 font-bold mb-1 block">BỘ CÂU HỎI</label>
                <select
                  value={configQuestionBank}
                  onChange={(e) => setConfigQuestionBank(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-bold text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="LESSON_6">Bài 6: Mạng thông tin toàn cầu (SGK KNTT - 5 câu)</option>
                  <option value="BITONE_AI">Ngân hàng câu hỏi thông minh AI BitOne</option>
                  <option value="REVIEW">Bộ câu hỏi Củng cố & Mở rộng</option>
                </select>
              </div>

              {/* Timer Config */}
              <div>
                <label className="text-slate-300 font-bold mb-1 block">THỜI GIAN ĐẾM NGƯỢC MỖI CÂU</label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 90, 0].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setConfigTimer(sec)}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        configTimer === sec
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {sec === 0 ? 'Vô hạn' : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Room Button */}
            <div className="pt-2">
              <button
                onClick={handleCreateRoom}
                disabled={isCreatingRoom}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                {isCreatingRoom ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    Đang thiết lập phòng...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    🚀 TẠO PHÒNG & MỞ ONLINE LÊN MÁY CHIẾU
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

