import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Lock, Unlock, Eye, Sparkles, Clock, 
  BarChart3, Users, ChevronLeft, ChevronRight, RotateCcw, AlertCircle,
  Smartphone, QrCode, PlayCircle, Settings, PlusCircle, Check, X, Shield, RefreshCw, Layers,
  Trophy, Award, Flame, Medal, Download, HelpCircle, EyeOff, ShieldCheck
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

  // Leaderboard & Podium Top 1 2 3 Celebration states
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [questionHistory, setQuestionHistory] = useState({});
  const [showStudentAnswers, setShowStudentAnswers] = useState(false); // Anti-cheating privacy mode (Default false: hide A,B,C,D letters)

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
        // Merge responses incrementally so newly scanned cards don't wipe existing ones
        setResponses(prev => ({
          ...prev,
          ...(event.payload.responses || {})
        }));
        if (event.payload.analytics) {
          setAnalytics(event.payload.analytics);
        }
      } else if (event.type === 'QUESTION_LOCKED') {
        setQuestionState('LOCKED');
      } else if (event.type === 'ANSWER_REVEALED') {
        setQuestionState('REVEALED');
        triggerConfetti();
      } else if (event.type === 'SHOW_LEADERBOARD' || event.type === 'LEADERBOARD_TOGGLED') {
        setShowLeaderboardModal(true);
        triggerGloriousConfetti();
      } else if (event.type === 'QUESTION_RESET') {
        setQuestionState('COLLECTING');
        setResponses({});
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

  // Track student responses across all questions for overall leaderboard
  useEffect(() => {
    if (activeQuestion && responses && Object.keys(responses).length > 0) {
      setQuestionHistory(prev => ({
        ...prev,
        [activeQuestion.id]: {
          question: activeQuestion,
          responses: { ...responses }
        }
      }));
    }
  }, [responses, activeQuestion]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Super High-Impact Glorious Confetti & Flower Burst (Tung hoa rực rỡ & âm thanh kéo dài ~4.5s)
  const triggerGloriousConfetti = () => {
    // 1. Play extended triumphant fanfare + celebratory shimmer (~4.2s) via Web Audio API
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const notes = [
          // Opening fanfare arpeggio
          { f: 523.25, t: 0.0, d: 0.25, v: 0.30 },
          { f: 659.25, t: 0.12, d: 0.25, v: 0.30 },
          { f: 783.99, t: 0.24, d: 0.25, v: 0.32 },
          { f: 1046.50, t: 0.38, d: 0.85, v: 0.38 },
          // Second celebratory phrase
          { f: 783.99, t: 1.05, d: 0.22, v: 0.28 },
          { f: 880.00, t: 1.22, d: 0.22, v: 0.28 },
          { f: 987.77, t: 1.40, d: 0.25, v: 0.30 },
          { f: 1046.50, t: 1.62, d: 1.15, v: 0.38 },
          // Grand finale chord sustain
          { f: 523.25, t: 2.55, d: 1.55, v: 0.22 },
          { f: 659.25, t: 2.55, d: 1.55, v: 0.22 },
          { f: 783.99, t: 2.55, d: 1.55, v: 0.24 },
          { f: 1046.50, t: 2.55, d: 1.65, v: 0.30 },
          { f: 1318.51, t: 2.75, d: 1.45, v: 0.20 },
        ];
        notes.forEach(({ f, t, d, v }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + t);
          gain.gain.setValueAtTime(0.001, now + t);
          gain.gain.linearRampToValueAtTime(v, now + t + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + t);
          osc.stop(now + t + d + 0.05);
        });
      }
    } catch (e) {}

    // 2. Multi-stage celebratory confetti cannons (~4.5 seconds continuous show)
    const palette = ['#facc15', '#ffd700', '#34d399', '#22d3ee', '#f43f5e', '#a855f7', '#fb923c'];
    const burstSides = (count = 85) => {
      confetti({ particleCount: count, angle: 60, spread: 65, origin: { x: 0.08, y: 0.72 }, colors: palette });
      confetti({ particleCount: count, angle: 120, spread: 65, origin: { x: 0.92, y: 0.72 }, colors: palette });
    };

    burstSides(95);
    setTimeout(() => {
      confetti({ particleCount: 150, spread: 110, origin: { x: 0.5, y: 0.35 }, colors: palette });
    }, 400);
    setTimeout(() => burstSides(80), 1100);
    setTimeout(() => {
      confetti({ particleCount: 130, spread: 130, origin: { x: 0.5, y: 0.45 }, colors: palette });
    }, 1900);
    setTimeout(() => burstSides(75), 2700);
    setTimeout(() => {
      confetti({ particleCount: 110, spread: 140, origin: { x: 0.5, y: 0.28 }, colors: palette });
    }, 3500);
    setTimeout(() => burstSides(60), 4100);
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

          {/* Bảng Vàng Vinh Danh & Tung Hoa Top 1 2 3 */}
          <button
            onClick={() => {
              setShowLeaderboardModal(true);
              triggerGloriousConfetti();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/30 transform active:scale-95"
            title="Mở Bảng Vàng Vinh Danh & Tung Hoa Chúc Mừng Top 1, 2, 3"
          >
            <Trophy className="w-4 h-4 text-slate-950 animate-bounce" />
            <span>BẢNG VÀNG VINH DANH</span>
          </button>
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

      {/* Main Split: Question & Options (8 cols) vs 32-Student Grid & Analytics (4 cols) */}
      <div className="flex-1 min-h-0 py-3 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Big Projector Question Display & 4 Options (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950 border border-indigo-900/40 rounded-3xl p-5 sm:p-7 overflow-y-auto space-y-5 shadow-2xl">
          {/* Question Header & Content */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 font-black text-xs sm:text-sm border border-cyan-400/50 shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  CÂU HỎI {currentQIndex + 1} / {LESSON_6_QUESTIONS.length}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs sm:text-sm border border-indigo-400/40">
                  {activeQuestion.bloomLevel || 'Nhận biết'}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-slate-400 font-medium">
                Bài 6: Mạng thông tin toàn cầu (WWW)
              </span>
            </div>

            <div className="bg-slate-950/75 border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-inner">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-snug tracking-tight drop-shadow">
                {activeQuestion.questionText}
              </h3>
            </div>
          </div>

          {/* 4 Big High-Contrast Kahoot/Quizizz Style Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {['A', 'B', 'C', 'D'].map((optKey) => {
              const text = activeQuestion.options?.[optKey];
              const isCorrect = activeQuestion.correctAnswer === optKey;
              const count = counts[optKey] || 0;
              const percent = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;

              // 4 Distinct High-Contrast Themes for Cards
              const optionThemes = {
                A: {
                  baseBorder: 'border-rose-500/50 hover:border-rose-400',
                  baseBg: 'bg-rose-950/25 hover:bg-rose-950/40',
                  badgeBg: 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-600/40 border-rose-300/40',
                  barColor: 'bg-rose-500'
                },
                B: {
                  baseBorder: 'border-sky-500/50 hover:border-sky-400',
                  baseBg: 'bg-sky-950/25 hover:bg-sky-950/40',
                  badgeBg: 'bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-sky-600/40 border-sky-300/40',
                  barColor: 'bg-sky-500'
                },
                C: {
                  baseBorder: 'border-amber-500/50 hover:border-amber-400',
                  baseBg: 'bg-amber-950/25 hover:bg-amber-950/40',
                  badgeBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/40 border-amber-200',
                  barColor: 'bg-amber-400'
                },
                D: {
                  baseBorder: 'border-emerald-500/50 hover:border-emerald-400',
                  baseBg: 'bg-emerald-950/25 hover:bg-emerald-950/40',
                  badgeBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 shadow-emerald-600/40 border-emerald-300',
                  barColor: 'bg-emerald-500'
                }
              };

              const theme = optionThemes[optKey];
              let cardStyle = `${theme.baseBg} ${theme.baseBorder} text-slate-100 shadow-md`;
              let badgeStyle = theme.badgeBg;

              if (questionState === 'REVEALED') {
                if (isCorrect) {
                  cardStyle = "bg-gradient-to-br from-emerald-950/95 via-slate-900 to-emerald-950/90 border-2 border-emerald-400 text-white shadow-[0_0_35px_rgba(16,185,129,0.4)] ring-4 ring-emerald-400/40 scale-[1.01]";
                  badgeStyle = "bg-gradient-to-tr from-emerald-400 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/50 border border-white";
                } else {
                  cardStyle = "bg-slate-950/60 border-slate-800 text-slate-400 opacity-40 grayscale-[30%]";
                  badgeStyle = "bg-slate-800 text-slate-400 border border-slate-700";
                }
              }

              return (
                <div
                  key={optKey}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[110px] sm:min-h-[135px] relative overflow-hidden shadow-lg ${cardStyle}`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shrink-0 shadow-md ${badgeStyle}`}>
                      {optKey}
                    </span>
                    <span className="text-sm sm:text-base lg:text-lg font-bold leading-relaxed flex-1 pt-1 text-white drop-shadow-sm">
                      {text}
                    </span>
                  </div>

                  {/* Percentage bar & student count if Revealed */}
                  {questionState === 'REVEALED' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs sm:text-sm font-bold">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/60 text-xs font-black">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ĐÁP ÁN ĐÚNG
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            {count} HS ({percent}%)
                          </span>
                        )}
                        {isCorrect && (
                          <span className="text-emerald-300 font-black text-xs sm:text-sm">
                            {count} HS ({percent}%)
                          </span>
                        )}
                      </div>
                      <div className="w-28 sm:w-36 bg-slate-900/90 h-3 rounded-full overflow-hidden border border-slate-700/60">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${isCorrect ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_10px_#34d399]' : 'bg-slate-600'}`} 
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
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-slate-950 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 space-y-2 animate-fadeIn shadow-xl shadow-emerald-950/40">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>GIẢI THÍCH CHI TIẾT CÂU HỎI:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {activeQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Live Student Response Matrix & Analytics (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-slate-900/90 border border-slate-800/80 rounded-3xl overflow-hidden p-4 sm:p-5 shadow-xl">
          {/* Header Stats Strip */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-200">
                TIẾN ĐỘ THU BÀI: {answeredCount} / {totalStudents} HS
              </h4>
            </div>
            <span className="text-xs sm:text-sm font-mono font-black text-cyan-300">
              {answeredPercentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden my-3 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300 shadow-[0_0_10px_#22d3ee]"
              style={{ width: `${answeredPercentage}%` }}
            />
          </div>

          {/* Anti-Cheating Privacy Protection Mode Strip */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs shrink-0 mb-2">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-[11px]">Bảo mật đáp án:</span>
              <span className="text-[11px] text-emerald-400 font-bold">Chống nhìn bài</span>
            </div>
            {questionState === 'REVEALED' && (
              <button
                onClick={() => setShowStudentAnswers(!showStudentAnswers)}
                className="text-[10px] font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 underline"
              >
                {showStudentAnswers ? '🔒 Ẩn chữ A,B,C,D' : '👁️ Hiện chữ A,B,C,D'}
              </button>
            )}
          </div>

          {/* 32 Student Live Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto py-1 pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
              {students.map((stu, idx) => {
                const res = getStudentResponse(stu, idx);
                const hasAnswered = !!res;
                const isCorrect = hasAnswered && res.answer === activeQuestion.correctAnswer;

                let cellClass = "bg-slate-950/80 border-slate-800/80 text-slate-400 hover:border-slate-700";
                if (hasAnswered) {
                  if (questionState === 'REVEALED') {
                    cellClass = isCorrect 
                      ? "bg-gradient-to-r from-emerald-950/90 to-emerald-900/70 border-emerald-400 text-emerald-200 font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/50" 
                      : "bg-red-950/80 border-red-500/80 text-red-300 ring-1 ring-red-500/30";
                  } else {
                    // Answered but not revealed: Gradual neon glow popup & emerald highlight!
                    cellClass = "bg-gradient-to-r from-cyan-950/90 via-emerald-950/80 to-cyan-950/90 border-emerald-400 text-emerald-300 font-bold shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/60 animate-in fade-in zoom-in-95 duration-500";
                  }
                }

                return (
                  <div
                    key={stu.id || idx}
                    className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-between transition-all duration-300 ${cellClass}`}
                    title={stu.fullName}
                  >
                    <span className="truncate pr-1 font-semibold">
                      {stu.fullName.split(' ').slice(-1)[0]}
                    </span>
                    {hasAnswered ? (
                      questionState === 'REVEALED' ? (
                        showStudentAnswers ? (
                          <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-black bg-slate-900 border border-emerald-400/50 text-emerald-300">
                            {res.answer}
                          </span>
                        ) : (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${isCorrect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}`}>
                            {isCorrect ? '✓ ĐÚNG' : '✗ SAI'}
                          </span>
                        )
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-400/40 animate-pulse">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>ĐÃ NỘP</span>
                        </span>
                      )
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700/80 shrink-0"></span>
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

      {/* ========================================================================= */}
      {/* MODAL: BẢNG VÀNG VINH DANH TOP 1 - 2 - 3 (DASHBOARD & TUNG HOA RỰC RỠ)   */}
      {/* ========================================================================= */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="relative w-full max-w-7xl max-h-[94vh] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_80px_rgba(245,158,11,0.25)] flex flex-col space-y-4 overflow-y-auto lg:overflow-hidden">
            
            {/* Top Close & Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/40 text-slate-950 font-black">
                  <Trophy className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      TỔNG KẾT TRÒ CHƠI
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase tracking-tight font-['Orbitron',sans-serif]">
                      BẢNG VÀNG VINH DANH & ĐÁNH GIÁ
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Đánh giá thẻ giấy QR • Lớp: <span className="font-bold text-cyan-300">{activeClassName}</span> • THCS Đắk Trôi
                  </p>
                </div>
              </div>

              {/* Action Buttons: Tung hoa & Close */}
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerGloriousConfetti}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-400 hover:from-rose-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/30 active:scale-95 transition-all animate-pulse"
                >
                  <span className="text-base">🌸</span>
                  <span>TUNG HOA CHÚC MỪNG</span>
                </button>

                <button
                  onClick={() => setShowLeaderboardModal(false)}
                  className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
                  title="Đóng Bảng Vàng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* THE PODIUM: BỤC VINH QUANG 3 TẦNG RỰC RỠ */}
            {(() => {
              // Calculate Leaderboard rankings
              const leaderboardList = students.map((stu, idx) => {
                const currentRes = getStudentResponse(stu, idx);
                let totalCorrect = 0;
                let totalAnswered = 0;

                Object.values(questionHistory).forEach((h) => {
                  if (h.responses) {
                    const r = h.responses[stu.cardId] || 
                              h.responses[stu.id] || 
                              h.responses[stu.studentCode] || 
                              h.responses[`CARD_${String(idx + 1).padStart(4, '0')}`];
                    if (r) {
                      totalAnswered++;
                      if (r.answer === h.question?.correctAnswer) totalCorrect++;
                    }
                  }
                });

                if (questionState === 'REVEALED' && currentRes && !questionHistory[activeQuestion.id]) {
                  totalAnswered++;
                  if (currentRes.answer === activeQuestion.correctAnswer) totalCorrect++;
                }

                const effectiveCorrect = totalAnswered > 0 ? totalCorrect : (currentRes?.answer === activeQuestion.correctAnswer ? 1 : 0);
                const points = effectiveCorrect * 100 + (currentRes ? 50 : 0);

                return {
                  ...stu,
                  stt: idx + 1,
                  shortName: stu.fullName ? stu.fullName.split(' ').slice(-1)[0] : `HS ${idx + 1}`,
                  totalCorrect: effectiveCorrect,
                  totalAnswered: Math.max(totalAnswered, currentRes ? 1 : 0),
                  points
                };
              }).sort((a, b) => b.points - a.points || b.totalCorrect - a.totalCorrect || a.stt - b.stt);

              const top1 = leaderboardList[0] || { fullName: 'Học sinh 1', points: 100, totalCorrect: 1 };
              const top2 = leaderboardList[1] || { fullName: 'Học sinh 2', points: 90, totalCorrect: 1 };
              const top3 = leaderboardList[2] || { fullName: 'Học sinh 3', points: 80, totalCorrect: 1 };
              const participatedCount = leaderboardList.filter((s) => s.totalAnswered > 0 || s.points > 0).length;

              return (
                <>
                  <style>{`
                    @keyframes podiumRise {
                      0% { opacity: 0; transform: translateY(40px) scale(0.92); }
                      70% { opacity: 1; transform: translateY(-6px) scale(1.03); }
                      100% { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    @keyframes crownFloat {
                      0%, 100% { transform: translateY(0) rotate(-3deg) scale(1); }
                      50% { transform: translateY(-8px) rotate(3deg) scale(1.08); }
                    }
                    @keyframes goldGlow {
                      0%, 100% { box-shadow: 0 0 35px rgba(250,204,21,0.45); }
                      50% { box-shadow: 0 0 65px rgba(250,204,21,0.85); }
                    }
                    .anim-podium-1 { animation: podiumRise 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both; }
                    .anim-podium-2 { animation: podiumRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both; }
                    .anim-podium-3 { animation: podiumRise 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both; }
                    .anim-crown { animation: crownFloat 2.2s ease-in-out infinite; }
                    .anim-gold-glow { animation: goldGlow 2.4s ease-in-out infinite; }
                  `}</style>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 flex-1 min-h-0">
                    {/* CỘT TRÁI: BỤC VINH DANH TOP 1-2-3 & THỐNG KÊ TỔNG QUAN */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
                      <div className="flex items-end justify-center gap-2.5 sm:gap-4 pt-5 pb-1 w-full">
                        
                        {/* TOP 2: Á QUÂN */}
                        <div className="flex-1 flex flex-col items-center max-w-[200px] anim-podium-2">
                          <div className="relative mb-1.5 flex flex-col items-center">
                            <div className="text-2xl sm:text-3xl filter drop-shadow animate-pulse">🥈</div>
                            <span className="mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 shadow-md">
                              Á QUÂN
                            </span>
                          </div>
                          <div className="w-full bg-slate-900/90 border-2 border-slate-300/80 rounded-2xl p-2.5 text-center space-y-0.5 shadow-[0_0_25px_rgba(203,213,225,0.3)] mb-1.5">
                            <h4 className="font-black text-xs sm:text-sm text-slate-100 truncate" title={top2.fullName}>
                              {top2.fullName}
                            </h4>
                            <div className="text-xs sm:text-sm font-mono font-bold text-cyan-300">
                              {top2.points} Điểm
                            </div>
                            <div className="text-[11px] text-slate-300">
                              {top2.totalCorrect} câu đúng
                            </div>
                          </div>
                          <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 border-t-2 border-x-2 border-slate-200 flex flex-col items-center justify-center text-white shadow-xl">
                            <span className="font-['Orbitron',sans-serif] text-2xl sm:text-3xl font-black text-slate-100">2</span>
                            <span className="text-[9px] uppercase tracking-widest font-black text-slate-300 opacity-80">SILVER</span>
                          </div>
                        </div>

                        {/* TOP 1: QUÁN QUÂN */}
                        <div className="flex-1 flex flex-col items-center max-w-[230px] -mt-4 z-10 anim-podium-1">
                          <div className="relative mb-1.5 flex flex-col items-center">
                            <div className="text-3xl sm:text-4xl anim-crown filter drop-shadow-[0_0_20px_#facc15]">👑</div>
                            <span className="mt-0.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-lg border border-white">
                              QUÁN QUÂN
                            </span>
                          </div>
                          <div className="w-full bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border-3 border-yellow-400 rounded-2xl p-3 text-center space-y-1 anim-gold-glow ring-4 ring-yellow-400/30 mb-1.5">
                            <h4 className="font-black text-sm sm:text-base text-yellow-300 drop-shadow truncate" title={top1.fullName}>
                              {top1.fullName}
                            </h4>
                            <div className="text-sm sm:text-base font-mono font-black text-white bg-amber-500/30 py-0.5 rounded-lg border border-amber-400/40">
                              {top1.points} Điểm
                            </div>
                            <div className="text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{top1.totalCorrect} câu đúng</span>
                            </div>
                          </div>
                          <div className="w-full h-32 sm:h-36 rounded-t-2xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 border-t-4 border-x-4 border-yellow-200 flex flex-col items-center justify-center text-slate-950 shadow-2xl">
                            <span className="font-['Orbitron',sans-serif] text-4xl sm:text-5xl font-black text-slate-950">1</span>
                            <span className="text-[10px] uppercase tracking-widest font-black text-slate-950 opacity-90">CHAMPION</span>
                          </div>
                        </div>

                        {/* TOP 3: QUÝ QUÂN */}
                        <div className="flex-1 flex flex-col items-center max-w-[200px] anim-podium-3">
                          <div className="relative mb-1.5 flex flex-col items-center">
                            <div className="text-2xl sm:text-3xl filter drop-shadow animate-pulse">🥉</div>
                            <span className="mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-md">
                              QUÝ QUÂN
                            </span>
                          </div>
                          <div className="w-full bg-slate-900/90 border-2 border-amber-600/80 rounded-2xl p-2.5 text-center space-y-0.5 shadow-[0_0_25px_rgba(217,119,6,0.3)] mb-1.5">
                            <h4 className="font-black text-xs sm:text-sm text-slate-100 truncate" title={top3.fullName}>
                              {top3.fullName}
                            </h4>
                            <div className="text-xs sm:text-sm font-mono font-bold text-amber-400">
                              {top3.points} Điểm
                            </div>
                            <div className="text-[11px] text-slate-300">
                              {top3.totalCorrect} câu đúng
                            </div>
                          </div>
                          <div className="w-full h-20 sm:h-24 rounded-t-2xl bg-gradient-to-b from-amber-700 via-amber-800 to-slate-900 border-t-2 border-x-2 border-amber-500 flex flex-col items-center justify-center text-white shadow-xl">
                            <span className="font-['Orbitron',sans-serif] text-2xl sm:text-3xl font-black text-amber-200">3</span>
                            <span className="text-[9px] uppercase tracking-widest font-black text-amber-300 opacity-80">BRONZE</span>
                          </div>
                        </div>
                      </div>

                      {/* SUMMARY STATS STRIP & CLASSROOM ANALYTICS OVERVIEW */}
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center shadow-md">
                            <span className="text-[11px] text-slate-400 font-bold block">Sĩ số lớp</span>
                            <span className="text-sm sm:text-base font-black text-cyan-300">{students.length || 32} HS</span>
                          </div>
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center shadow-md">
                            <span className="text-[11px] text-slate-400 font-bold block">Đã tham gia</span>
                            <span className="text-sm sm:text-base font-black text-emerald-400">{Math.max(answeredCount, participatedCount)} / {students.length || 32} HS</span>
                          </div>
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center shadow-md">
                            <span className="text-[11px] text-slate-400 font-bold block">Chính xác</span>
                            <span className="text-sm sm:text-base font-black text-yellow-300">{accuracyOnAnswered}% Đúng</span>
                          </div>
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center shadow-md">
                            <span className="text-[11px] text-slate-400 font-bold block">Thử thách</span>
                            <span className="text-sm sm:text-base font-black text-amber-300">{LESSON_6_QUESTIONS.length} Câu</span>
                          </div>
                        </div>

                        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <BarChart3 className="w-4 h-4 text-cyan-400" />
                            <span>Phổ đáp án hiện tại:</span>
                          </span>
                          <div className="flex items-center gap-1.5 font-mono font-bold">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-500/40">A: {counts.A || 0}</span>
                            <span className="px-2 py-0.5 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-500/40">B: {counts.B || 0}</span>
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">C: {counts.C || 0}</span>
                            <span className="px-2 py-0.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/40">D: {counts.D || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CỘT PHẢI: DANH SÁCH TẤT CẢ HỌC SINH THAM GIA & SỐ ĐIỂM ĐÁNH GIÁ */}
                    <div className="lg:col-span-6 bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 flex flex-col min-h-[280px] lg:max-h-[60vh] shadow-xl">
                      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800 shrink-0">
                        <span className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-400" />
                          BẢNG ĐIỂM HỌC SINH THAM GIA ({leaderboardList.length} HS)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Có điểm: {participatedCount} HS
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
                        {leaderboardList.map((stu, i) => {
                          const hasScore = stu.points > 0 || stu.totalAnswered > 0;
                          return (
                            <div 
                              key={stu.id || i}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                                i === 0
                                  ? 'bg-amber-950/50 border-amber-400/70 shadow-md'
                                  : hasScore
                                  ? 'bg-slate-950/95 border-cyan-500/50 shadow-sm'
                                  : 'bg-slate-950/60 border-slate-800/80 opacity-85'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`font-mono font-black text-xs px-2 py-1 rounded-lg shrink-0 ${
                                  i === 0 ? 'bg-amber-400 text-slate-950' :
                                  i === 1 ? 'bg-slate-300 text-slate-950' :
                                  i === 2 ? 'bg-amber-600 text-white' :
                                  'bg-slate-800 text-cyan-300'
                                }`}>
                                  #{i + 1}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-sm text-slate-100 truncate" title={stu.fullName}>
                                    {stu.fullName}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium">
                                    Đúng {stu.totalCorrect}/{Math.max(stu.totalAnswered, 1)} câu
                                  </div>
                                </div>
                              </div>
                              <span className={`font-mono font-black text-sm px-2.5 py-1 rounded-xl shrink-0 border ${
                                hasScore
                                  ? 'text-emerald-200 bg-emerald-500/20 border-emerald-400/50'
                                  : 'text-slate-400 bg-slate-900 border-slate-700'
                              }`}>
                                {stu.points}đ
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Bottom Footer Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                🎉 Chúc mừng các em học sinh đã hoàn thành xuất sắc thử thách trắc nghiệm thẻ QR!
              </span>
              <button
                onClick={() => setShowLeaderboardModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700"
              >
                Đóng bảng vàng
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

