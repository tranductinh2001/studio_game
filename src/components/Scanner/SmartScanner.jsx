import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, CameraOff, CheckCircle2, RotateCw, RefreshCw, Send, 
  Users, Volume2, Sparkles, AlertCircle, PlayCircle, Layers, Image as ImageIcon,
  ArrowLeft, X, Smartphone, ChevronLeft, ChevronRight, Trophy, Lock, Unlock, Eye, EyeOff, Award, Shield
} from 'lucide-react';
import { classroomService } from '../../services/classroomService';
import { detectQuizizzCards } from '../../utils/quizizzArucoDetector';
import { LESSON_6_QUESTIONS } from '../../data/lesson6Questions';

export default function SmartScanner({ 
  roomCode = 'WB-601', 
  onResponsesUpdated,
  fullscreen = false,
  currentQuestionIndex: propQIndex = 0,
  questions: propQuestions = null,
  onNavigateQuestion,
  onCloseScanner
}) {
  const questionsList = propQuestions || LESSON_6_QUESTIONS;
  const [currentQIndex, setCurrentQIndex] = useState(propQIndex);

  // Sync prop changes
  useEffect(() => {
    if (typeof propQIndex === 'number' && propQIndex >= 0) {
      setCurrentQIndex(propQIndex);
    }
  }, [propQIndex]);

  const [isScanning, setIsScanning] = useState(false);
  const [questionState, setQuestionState] = useState('COLLECTING');
  const [cameraError, setCameraError] = useState(null);
  const [detectedResponses, setDetectedResponses] = useState({});
  const [studentsMap, setStudentsMap] = useState({});
  const [totalStudents, setTotalStudents] = useState(32);
  const [lastScannedStudent, setLastScannedStudent] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [hideAnswersOnScan, setHideAnswersOnScan] = useState(true); // Anti-cheating privacy mode

  const [classes, setClasses] = useState([]);
  const [activeClassId, setActiveClassId] = useState('CLASS_6B');
  const [activeClassName, setActiveClassName] = useState('Lớp 6B');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const streamRef = useRef(null);
  const isScanningRef = useRef(false);
  const lastProcessTimeRef = useRef(0);

  // Web Audio API offline sound synthesizer (Uniform chime to prevent pitch-based answer leaking)
  const playScanChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 987.77; // Uniform pleasant B5 chime for all scans

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.33, now + 0.1);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  // Next Question Directly from Phone Camera Scanner
  const handleNextQuestion = async () => {
    const nextIdx = currentQIndex + 1;
    if (nextIdx < questionsList.length) {
      setCurrentQIndex(nextIdx);
      const nextQ = questionsList[nextIdx];
      setDetectedResponses({});
      syncedCardsRef.current.clear();
      setQuestionState('COLLECTING');
      setSyncStatus(`Đã chuyển sang Câu ${nextIdx + 1}`);
      try {
        await classroomService.setQuestion(roomCode, nextQ, 'COLLECTING');
        if (onNavigateQuestion) onNavigateQuestion(nextIdx);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(60);
      } catch (err) {
        console.error('Error switching next question:', err);
      }
    }
  };

  // Previous Question from Phone Camera Scanner
  const handlePrevQuestion = async () => {
    const prevIdx = currentQIndex - 1;
    if (prevIdx >= 0) {
      setCurrentQIndex(prevIdx);
      const prevQ = questionsList[prevIdx];
      setDetectedResponses({});
      syncedCardsRef.current.clear();
      setQuestionState('COLLECTING');
      setSyncStatus(`Đã quay lại Câu ${prevIdx + 1}`);
      try {
        await classroomService.setQuestion(roomCode, prevQ, 'COLLECTING');
        if (onNavigateQuestion) onNavigateQuestion(prevIdx);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(60);
      } catch (err) {
        console.error('Error switching prev question:', err);
      }
    }
  };

  // Instant Lock Answers from Camera Scanner
  const handleLockQuestion = async () => {
    try {
      setQuestionState('LOCKED');
      await classroomService.lockQuestion(roomCode);
      setSyncStatus('🔒 Đã chốt & khóa nhận đáp án');
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(80);
    } catch (err) {
      console.error('Error locking question:', err);
    }
  };

  // Instant Unlock Answers from Camera Scanner
  const handleUnlockQuestion = async () => {
    try {
      setQuestionState('COLLECTING');
      const activeQ = questionsList[currentQIndex];
      await classroomService.setQuestion(roomCode, activeQ, 'COLLECTING');
      setSyncStatus('🔓 Đã mở lại cho học sinh nộp bài');
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(60);
    } catch (err) {
      console.error('Error unlocking question:', err);
    }
  };

  // Instant Reveal Answer from Camera Scanner
  const handleRevealAnswer = async () => {
    try {
      setQuestionState('REVEALED');
      await classroomService.revealAnswer(roomCode);
      setSyncStatus('👁️ Đã công bố đáp án lên màn chiếu');
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([60, 60, 100]);
    } catch (err) {
      console.error('Error revealing answer:', err);
    }
  };

  // Finish Quiz & Trigger Glorious Podium / Flower Bursts on Web Projector
  const handleFinishAndShowLeaderboard = async () => {
    try {
      await classroomService.broadcastLeaderboard(roomCode, { showLeaderboard: true });
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      if (onCloseScanner) onCloseScanner();
    } catch (err) {
      console.error('Error broadcasting leaderboard:', err);
    }
  };

  // Persistent overlay storage so bounding boxes don't vanish after 16ms
  const activeOverlaysRef = useRef(new Map()); // cardKey -> { corners, studentName, answer, color, bgColor, expiresAt }
  const procCanvasRef = useRef(null); // Offscreen processing canvas for high performance QR detection
  const nativeDetectorRef = useRef(null); // Hardware BarcodeDetector for simultaneous multi-QR
  const nativeDetectorBusyRef = useRef(false);

  // Auto-streaming queue to instantly push detected responses to Teacher Desktop in real time
  const pendingSyncQueueRef = useRef(new Map());
  const syncTimeoutRef = useRef(null);
  const syncedCardsRef = useRef(new Map()); // cardId -> last synced answer

  // Helper: Normalize any card code format into canonical CARD_xxxx
  const normalizeCardId = (str) => {
    if (!str) return null;
    const s = String(str).trim();
    if (s.startsWith('CARD_')) return s;
    if (s.startsWith('WEBBY_')) return s.replace('WEBBY_', 'CARD_');
    const pMatch = s.match(/^[P|HS]\s*(\d+)$/i);
    if (pMatch) {
      const num = parseInt(pMatch[1], 10);
      return `CARD_${num < 10 ? '000' + num : (num < 100 ? '00' + num : '0' + num)}`;
    }
    const numOnly = s.match(/(\d+)/);
    if (numOnly) {
      const num = parseInt(numOnly[1], 10);
      return `CARD_${num < 10 ? '000' + num : (num < 100 ? '00' + num : '0' + num)}`;
    }
    return s;
  };

  // Helper: Parse code data from JSON, URL parameters, or raw text
  const parseCardData = (data) => {
    if (!data) return null;
    const str = String(data).trim();
    // 1. JSON format
    try {
      const parsed = JSON.parse(str);
      const id = parsed.cardId || parsed.studentCode || parsed.id || parsed.code || parsed.card;
      if (id) return normalizeCardId(id);
    } catch {}

    // 2. URL format (e.g. https://...?card=1 or ?cardId=CARD_0001)
    if (str.includes('?') || str.startsWith('http')) {
      try {
        const url = new URL(str, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        const cardParam = url.searchParams.get('card') || url.searchParams.get('cardId') || url.searchParams.get('id');
        if (cardParam) return normalizeCardId(cardParam);
      } catch {}
    }

    // 3. Raw text fallback
    return normalizeCardId(str);
  };

  // Helper: Resolve student details from map with fallback
  const resolveStudent = (cardId, quizizzCode = null) => {
    if (studentsMap[cardId]) return studentsMap[cardId];
    if (quizizzCode && studentsMap[quizizzCode]) return studentsMap[quizizzCode];

    const searchKey = quizizzCode || cardId;
    const numMatch = String(searchKey).match(/(\d+)/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      const padded = `CARD_${num < 10 ? '000' + num : (num < 100 ? '00' + num : '0' + num)}`;
      if (studentsMap[padded]) return studentsMap[padded];
      if (studentsMap[`P ${num}`]) return studentsMap[`P ${num}`];
      if (studentsMap[`P${num}`]) return studentsMap[`P${num}`];
      if (studentsMap[`${num}`]) return studentsMap[`${num}`];

      return {
        id: padded,
        cardId: padded,
        studentCode: `HS${num < 10 ? '0' + num : num}`,
        fullName: `Học sinh ${num} (${quizizzCode || padded})`
      };
    }

    return {
      id: cardId,
      cardId: cardId,
      studentCode: cardId,
      fullName: `Học sinh (${quizizzCode || cardId})`
    };
  };

  const flushPendingSyncQueue = async () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    const batch = Array.from(pendingSyncQueueRef.current.values());
    if (batch.length === 0) return;
    pendingSyncQueueRef.current.clear();

    try {
      const res = await classroomService.submitResponses(roomCode, batch);
      if (res && res.locked) {
        setSyncStatus('⚠️ Câu hỏi đã bị khóa!');
      } else if (res && (res.success || res.cloudSynced)) {
        setSyncStatus(`⚡ Realtime: Đã nạp ${res.totalAnswered || batch.length} đáp án lên máy chiếu!`);
        if (onResponsesUpdated) onResponsesUpdated(batch);
      }
    } catch (err) {
      console.warn('Auto-sync response error:', err);
    }
  };

  const queueResponseForAutoSync = (respItem) => {
    const lastAnswer = syncedCardsRef.current.get(respItem.cardId);
    if (lastAnswer === respItem.answer) {
      return; // Already submitted this exact answer
    }

    // Check if student rotated card to change answer
    const isAnswerChanged = Boolean(lastAnswer && lastAnswer !== respItem.answer);
    syncedCardsRef.current.set(respItem.cardId, respItem.answer);
    pendingSyncQueueRef.current.set(respItem.cardId, respItem);

    // Instant zero-delay dispatch (<50ms) if student turns card, or rapid throttle batching (35ms)
    if (isAnswerChanged) {
      flushPendingSyncQueue();
    } else if (!syncTimeoutRef.current) {
      syncTimeoutRef.current = setTimeout(flushPendingSyncQueue, 35);
    }
  };

  // Load students for active class
  const loadStudentsForClass = (classId) => {
    classroomService.getStudents(classId).then((list) => {
      const map = {};
      if (Array.isArray(list)) {
        list.forEach((s, idx) => {
          const stt = idx + 1;
          const numMatch = (s.cardId || '').match(/(\d+)/);
          const pNum = numMatch ? parseInt(numMatch[1], 10) : stt;

          // Universal multi-key mapping for 100% hits across both card modes
          if (s.id) map[s.id] = s;
          if (s.cardId) map[s.cardId] = s;
          if (s.studentCode) map[s.studentCode] = s;

          // Index by parsed pNum
          const cardKey = `CARD_${pNum < 10 ? '000' + pNum : (pNum < 100 ? '00' + pNum : '0' + pNum)}`;
          map[cardKey] = s;
          map[`P ${pNum}`] = s;
          map[`P${pNum}`] = s;
          map[`${pNum}`] = s;

          // Also index by STT (roster order index)
          const sttKey = `CARD_${stt < 10 ? '000' + stt : (stt < 100 ? '00' + stt : '0' + stt)}`;
          map[sttKey] = s;
          map[`P ${stt}`] = s;
          map[`P${stt}`] = s;
          map[`${stt}`] = s;
        });
        setTotalStudents(list.length);
      }
      setStudentsMap(map);
    });
  };

  useEffect(() => {
    classroomService.getClasses().then((clsList) => {
      setClasses(clsList || []);
    });

    classroomService.getRoom(roomCode).then((room) => {
      if (room) {
        const cId = room.classId || 'CLASS_6B';
        setActiveClassId(cId);
        setActiveClassName(room.className || 'Lớp 6B');
        loadStudentsForClass(cId);
      }
    });

    const unsubscribe = classroomService.subscribeToRoom(roomCode, (event) => {
      if (event.type === 'ROOM_CLASS_CHANGED' || (event.type === 'ROOM_STATE' && event.payload?.classId)) {
        const newClassId = event.payload.classId;
        setActiveClassId(newClassId);
        setActiveClassName(event.payload.className || 'Lớp 6B');
        loadStudentsForClass(newClassId);
        setDetectedResponses({});
        syncedCardsRef.current.clear();
      }
      if (event.type === 'QUESTION_UPDATED' || event.type === 'ROOM_STARTED') {
        const q = event.payload?.activeQuestion || event.payload?.currentQuestion;
        if (q) {
          const foundIdx = questionsList.findIndex(item => item.id === q.id || item.questionText === q.questionText);
          if (foundIdx !== -1) setCurrentQIndex(foundIdx);
        }
        setQuestionState(event.payload?.questionState || 'COLLECTING');
        setDetectedResponses({});
        syncedCardsRef.current.clear();
        setSyncStatus('Câu hỏi mới: Sẵn sàng quét thẻ học sinh');
      }
      if (event.type === 'QUESTION_LOCKED') {
        setQuestionState('LOCKED');
        setSyncStatus('🔒 Đã chốt & khóa nhận đáp án');
      }
      if (event.type === 'ANSWER_REVEALED') {
        setQuestionState('REVEALED');
        setSyncStatus('👁️ Đã công bố đáp án lên màn chiếu');
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  const handleSwitchClass = async (newClassId) => {
    setActiveClassId(newClassId);
    const cls = classes.find((c) => c.id === newClassId);
    if (cls) setActiveClassName(cls.name);
    loadStudentsForClass(newClassId);
    setDetectedResponses({});
    try {
      await classroomService.setRoomClass(roomCode, newClassId);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate orientation and map to answer A, B, C, D using physical screen UP direction
  const calculateAnswerFromCorners = (location) => {
    const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = location;

    // Physical orientation: The edge pointing UP towards the ceiling/top of the screen has minimum Y
    // Side A = Top edge (topLeft -> topRight)
    // Side B = Right edge (topRight -> bottomRight)
    // Side C = Bottom edge (bottomRight -> bottomLeft)
    // Side D = Left edge (bottomLeft -> topLeft)
    const sides = [
      { answer: 'A', y: (topLeftCorner.y + topRightCorner.y) / 2 },
      { answer: 'B', y: (topRightCorner.y + bottomRightCorner.y) / 2 },
      { answer: 'C', y: (bottomRightCorner.y + bottomLeftCorner.y) / 2 },
      { answer: 'D', y: (bottomLeftCorner.y + topLeftCorner.y) / 2 }
    ];
    sides.sort((a, b) => a.y - b.y);
    const answer = sides[0].answer;

    // Visual angle along top edge for debugging
    const dx = topRightCorner.x - topLeftCorner.x;
    const dy = topRightCorner.y - topLeftCorner.y;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    return { answer, angle: Math.round(angle) };
  };

  // Start Camera with Multi-Tier Fallback (Mobile Back Camera -> Any Video Device)
  const startCamera = async () => {
    setCameraError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('⚠️ Trình duyệt hạn chế video trực tiếp qua HTTP. Thầy/Cô hãy dùng nút "📸 Chụp ảnh quét thẻ" bên cạnh (hoạt động 100%), hoặc mở link Vercel HTTPS!');
      return;
    }

    let stream = null;
    const constraintTiers = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 }, focusMode: { ideal: 'continuous' } } },
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'environment' } },
      { video: { facingMode: 'user' } },
      { video: true }
    ];

    for (const constraints of constraintTiers) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err) {
        // try next tier
      }
    }

    if (!stream) {
      isScanningRef.current = false;
      setIsScanning(false);
      setCameraError('Không thể mở camera video trực tiếp. Vui lòng bấm nút "📸 Chụp ảnh quét thẻ" bên cạnh để chụp thẻ ngay!');
      return;
    }

    streamRef.current = stream;
    if (videoRef.current) {
      const vid = videoRef.current;
      vid.srcObject = stream;
      vid.setAttribute('playsinline', 'true');
      vid.setAttribute('autoplay', 'true');
      vid.muted = true;
      try {
        await vid.play();
      } catch (playErr) {
        console.warn('video.play() wait gesture:', playErr);
      }
      isScanningRef.current = true;
      setIsScanning(true);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(scanFrame);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    isScanningRef.current = false;
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  };

  // Auto-start camera when in fullscreen mobile mode & cleanup on unmount
  useEffect(() => {
    if (fullscreen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [fullscreen]);

  // Handle Scan from Photo Capture / File Upload (Works on 100% of mobile phones on any HTTP/HTTPS network!)
  const handleScanFromPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSyncStatus('🔍 Đang phân tích thẻ học sinh từ ảnh chụp...');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

        let detectedInPhoto = 0;
        let lastStudentInfo = null;

        // 1. Try Quizizz ArUco Q-Cards
        try {
          const qCards = detectQuizizzCards(imageData);
          if (qCards && qCards.length > 0) {
            qCards.forEach((q) => {
              const student = resolveStudent(q.cardId, q.quizizzCode);
              const targetKey = student.cardId || q.cardId;
              const respItem = {
                cardId: targetKey,
                quizizzCode: q.quizizzCode,
                studentCode: student.studentCode,
                studentName: student.fullName,
                answer: q.answer,
                angle: q.visualAngle,
                cardType: 'Quizizz Q-Card',
                detectedAt: new Date().toISOString()
              };
              setDetectedResponses((prev) => ({ ...prev, [targetKey]: respItem }));
              queueResponseForAutoSync(respItem);
              detectedInPhoto++;
              lastStudentInfo = { name: `${student.fullName} (${q.quizizzCode})`, answer: q.answer, angle: q.visualAngle };
            });
          }
        } catch (err) {
          console.warn('Quizizz scan error from photo:', err);
        }

        // 2. Try Webby QR (jsQR)
        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });
          if (code) {
            const { answer, angle } = calculateAnswerFromCorners(code.location);
            const cId = parseCardData(code.data);
            if (cId) {
              const student = resolveStudent(cId);
              const targetKey = student.cardId || cId;
              const respItem = {
                cardId: targetKey,
                studentCode: student.studentCode,
                studentName: student.fullName,
                answer,
                angle,
                cardType: 'Webby QR',
                detectedAt: new Date().toISOString()
              };
              setDetectedResponses((prev) => ({ ...prev, [targetKey]: respItem }));
              queueResponseForAutoSync(respItem);
              detectedInPhoto++;
              lastStudentInfo = { name: student.fullName, answer, angle };
            }
          }
        } catch (err) {
          console.warn('Webby QR scan error from photo:', err);
        }

        if (detectedInPhoto > 0) {
          playScanChime(lastStudentInfo?.answer || 'A');
          if (lastStudentInfo) setLastScannedStudent(lastStudentInfo);
          if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
          setSyncStatus(`🎉 ĐÃ QUÉT TRÚNG ${detectedInPhoto} THẺ HỌC SINH TỪ ẢNH CHỤP!`);
        } else {
          setSyncStatus('⚠️ Không nhận diện được thẻ trong ảnh. Vui lòng chụp rõ mã vuông trên giấy!');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Continuous frame loop with persistent visual overlay rendering
  const scanFrame = () => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      if (isScanningRef.current) {
        requestRef.current = requestAnimationFrame(scanFrame);
      }
      return;
    }

    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext('2d');
      // 1. Clear transparent overlay canvas so video underneath remains crisp
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = performance.now();

      // 2. Render all active persistent overlays (re-drawn on every frame so they never flicker or disappear)
      activeOverlaysRef.current.forEach((overlay, key) => {
        if (now < overlay.expiresAt) {
          const timeLeft = overlay.expiresAt - now;
          const alpha = Math.min(1, timeLeft / 200); // smooth fade during final 200ms

          ctx.save();
          ctx.globalAlpha = alpha;

          // A. Ô MÀU XANH VIỀN QUANH THẺ (Translucent green quad box + glowing neon border)
          ctx.beginPath();
          ctx.moveTo(overlay.corners[0].x, overlay.corners[0].y);
          ctx.lineTo(overlay.corners[1].x, overlay.corners[1].y);
          ctx.lineTo(overlay.corners[2].x, overlay.corners[2].y);
          ctx.lineTo(overlay.corners[3].x, overlay.corners[3].y);
          ctx.closePath();

          ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
          ctx.fill();

          ctx.lineWidth = 4;
          ctx.strokeStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
          ctx.stroke();

          // B. HỘP ĐÁP ÁN DÍNH LIỀN TRÊN ĐẦU THẺ (Floating AR Badge pinned directly above card)
          let minX = Infinity, maxX = -Infinity, minY = Infinity;
          for (let i = 0; i < 4; i++) {
            const pt = overlay.corners[i];
            if (pt.x < minX) minX = pt.x;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y < minY) minY = pt.y;
          }
          const centerX = (minX + maxX) / 2;
          const topY = minY;

          const studentShortName = overlay.shortName || (overlay.studentName ? overlay.studentName.split(' ').slice(-1)[0] : '');
          const cardBadgeText = overlay.quizizzCode || `P ${overlay.pNum || ''}`;
          const labelText = studentShortName ? `${cardBadgeText} • ${studentShortName}` : cardBadgeText;
          const answerLetter = (overlay.answer || 'A').toUpperCase();

          ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const labelWidth = ctx.measureText(labelText).width;
          const badgeWidth = labelWidth + 46;
          const badgeHeight = 28;
          const badgeX = Math.max(8, Math.min(canvas.width - badgeWidth - 8, centerX - badgeWidth / 2));
          const badgeY = Math.max(34, topY - badgeHeight - 8);

          // Draw floating pill container
          ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
          ctx.shadowBlur = 10;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 14);
          } else {
            ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
          }
          ctx.fill();

          ctx.lineWidth = 2;
          ctx.strokeStyle = '#10b981';
          ctx.stroke();

          // Left Text: Card & Name
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#f8fafc';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'left';
          ctx.fillText(labelText, badgeX + 10, badgeY + badgeHeight / 2);

          // Right Answer Square (Contrasting letter badge)
          const ansBoxW = 24;
          const ansBoxH = 20;
          const ansBoxX = badgeX + badgeWidth - ansBoxW - 4;
          const ansBoxY = badgeY + (badgeHeight - ansBoxH) / 2;

          const ansColorMap = {
            A: '#ef4444', // Red
            B: '#3b82f6', // Blue
            C: '#10b981', // Green
            D: '#f59e0b'  // Amber
          };
          ctx.fillStyle = ansColorMap[answerLetter] || '#10b981';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(ansBoxX, ansBoxY, ansBoxW, ansBoxH, 6);
          } else {
            ctx.rect(ansBoxX, ansBoxY, ansBoxW, ansBoxH);
          }
          ctx.fill();

          // Answer Letter text
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(answerLetter, ansBoxX + ansBoxW / 2, ansBoxY + ansBoxH / 2 + 1);
          ctx.textAlign = 'left';

          ctx.restore();
        } else {
          activeOverlaysRef.current.delete(key);
        }
      });

      // 3. Scan every 30ms (~33 FPS) with hardware BarcodeDetector + multi-pass adaptive-contrast jsQR
      if (now - lastProcessTimeRef.current >= 30) {
        lastProcessTimeRef.current = now;
        if (!procCanvasRef.current) {
          procCanvasRef.current = document.createElement('canvas');
        }
        const proc = procCanvasRef.current;
        if (proc.width !== video.videoWidth || proc.height !== video.videoHeight) {
          proc.width = video.videoWidth;
          proc.height = video.videoHeight;
        }
        const pCtx = proc.getContext('2d', { willReadFrequently: true });
        pCtx.drawImage(video, 0, 0, proc.width, proc.height);
        const imageData = pCtx.getImageData(0, 0, proc.width, proc.height);

        const processDetectedWebbyQr = (rawData, location) => {
          const cId = parseCardData(rawData);
          if (!cId || !location) return false;
          const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = location;
          const { answer, angle } = calculateAnswerFromCorners(location);
          const student = resolveStudent(cId);
          const targetKey = student.cardId || cId;

          const pNum = (cId || '').replace(/\D+/g, '');
          activeOverlaysRef.current.set(targetKey, {
            corners: [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner],
            studentName: student.fullName,
            shortName: student.fullName ? student.fullName.split(' ').slice(-1)[0] : '',
            quizizzCode: `P ${pNum || ''}`,
            pNum,
            answer,
            color: '#10b981',
            expiresAt: now + 800
          });

          const respItem = {
            cardId: targetKey,
            studentCode: student.studentCode,
            studentName: student.fullName,
            answer,
            angle,
            cardType: 'Webby QR',
            detectedAt: new Date().toISOString()
          };

          setDetectedResponses((prev) => ({
            ...prev,
            [targetKey]: respItem
          }));

          setLastScannedStudent({ name: student.fullName, answer, angle });
          playScanChime(answer);
          queueResponseForAutoSync(respItem);

          if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
          return true;
        };

        // A. Scan Quizizz Paper Mode Q-Cards (ArUco 4x4)
        try {
          const qCards = detectQuizizzCards(imageData);
          if (qCards && qCards.length > 0) {
            qCards.forEach((q) => {
              const { participant, cardId, quizizzCode, answer, visualAngle, corners } = q;
              const student = resolveStudent(cardId, quizizzCode);
              const targetKey = student.cardId || cardId;

              activeOverlaysRef.current.set(targetKey, {
                corners,
                studentName: student.fullName,
                shortName: student.fullName ? student.fullName.split(' ').slice(-1)[0] : '',
                quizizzCode,
                pNum: participant,
                answer,
                color: '#10b981',
                expiresAt: now + 800
              });

              const respItem = {
                cardId: targetKey,
                quizizzCode,
                studentCode: student.studentCode,
                studentName: student.fullName,
                answer,
                angle: visualAngle,
                cardType: 'Quizizz Q-Card',
                detectedAt: new Date().toISOString()
              };

              setDetectedResponses((prev) => ({
                ...prev,
                [targetKey]: respItem
              }));

              setLastScannedStudent({ name: `${student.fullName} (${quizizzCode})`, answer, angle: visualAngle });
              playScanChime(answer);
              queueResponseForAutoSync(respItem);

              if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
            });
          }
        } catch (err) {
          // ignore scan error
        }

        // B1. Hardware-accelerated native BarcodeDetector (multi-QR simultaneous detection on Chrome/Android)
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window && !nativeDetectorBusyRef.current) {
          nativeDetectorBusyRef.current = true;
          if (!nativeDetectorRef.current) {
            try {
              nativeDetectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
            } catch (e) {
              nativeDetectorRef.current = null;
            }
          }
          if (nativeDetectorRef.current) {
            nativeDetectorRef.current.detect(proc).then((barcodes) => {
              if (Array.isArray(barcodes) && barcodes.length > 0) {
                barcodes.forEach((bc) => {
                  if (bc.rawValue && Array.isArray(bc.cornerPoints) && bc.cornerPoints.length >= 4) {
                    processDetectedWebbyQr(bc.rawValue, {
                      topLeftCorner: bc.cornerPoints[0],
                      topRightCorner: bc.cornerPoints[1],
                      bottomRightCorner: bc.cornerPoints[2],
                      bottomLeftCorner: bc.cornerPoints[3]
                    });
                  }
                });
              }
            }).catch(() => {}).finally(() => {
              nativeDetectorBusyRef.current = false;
            });
          } else {
            nativeDetectorBusyRef.current = false;
          }
        }

        // B2. Scan Webby QR via jsQR (raw frame + adaptive contrast stretch fallback for dim/distant cards)
        try {
          let code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });

          if (!code) {
            // Adaptive contrast boost on a lightweight copy for faint/low-light paper QR cards
            const boosted = new Uint8ClampedArray(imageData.data.length);
            const src = imageData.data;
            for (let i = 0; i < src.length; i += 4) {
              const lum = (src[i] * 77 + src[i + 1] * 150 + src[i + 2] * 29) >> 8;
              const stretched = lum < 95 ? 0 : (lum > 165 ? 255 : Math.min(255, Math.max(0, (lum - 95) * 3.6)));
              boosted[i] = stretched;
              boosted[i + 1] = stretched;
              boosted[i + 2] = stretched;
              boosted[i + 3] = 255;
            }
            code = jsQR(boosted, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });
          }

          if (code) {
            processDetectedWebbyQr(code.data, code.location);
          }
        } catch (err) {
          // ignore scan error
        }
      }
    }

    if (isScanningRef.current) {
      requestRef.current = requestAnimationFrame(scanFrame);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Send detected responses to Server
  const handleSyncResponses = async () => {
    const list = Object.values(detectedResponses);
    if (list.length === 0) return;

    setIsSyncing(true);
    setSyncStatus('Đang đồng bộ đáp án lên máy chiếu...');
    try {
      await classroomService.submitResponses(roomCode, list);
      setSyncStatus(`Đã gửi thành công ${list.length} đáp án!`);
      if (onResponsesUpdated) onResponsesUpdated(list);
    } catch (err) {
      console.error('Lỗi khi gửi đáp án:', err);
      setSyncStatus('Lỗi đồng bộ!');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(''), 4000);
    }
  };

  // Simulate Classroom Scan for 28-32 students (Useful for Testing & Fast Demos)
  const handleSimulateScan = () => {
    const answers = ['A', 'B', 'C', 'D'];
    const angles = { A: 5, B: 92, C: 184, D: 268 };
    const simulated = {};

    Object.keys(studentsMap).forEach((cId, idx) => {
      if (idx < 29) {
        const choice = idx % 5 === 0 ? 'A' : (idx % 7 === 0 ? 'C' : 'B');
        const stu = studentsMap[cId];
        simulated[cId] = {
          cardId: cId,
          studentCode: stu.studentCode,
          studentName: stu.fullName,
          answer: choice,
          angle: angles[choice],
          detectedAt: new Date().toISOString()
        };
      }
    });

    setDetectedResponses(simulated);
    setLastScannedStudent({ name: '29 Học sinh', answer: 'A/B/C/D', angle: 0 });

    classroomService.submitResponses(roomCode, Object.values(simulated)).then(() => {
      setSyncStatus('Đã giả lập quét thành công 29 học sinh!');
      setTimeout(() => setSyncStatus(''), 3000);
    });
  };

  const detectedCount = Object.keys(detectedResponses).length;

  const tally = { A: 0, B: 0, C: 0, D: 0 };
  Object.values(detectedResponses).forEach((r) => {
    if (r.answer && tally[r.answer] !== undefined) {
      tally[r.answer]++;
    }
  });

  // Fullscreen Immersive Camera Mode for Mobile View
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col text-white overflow-hidden select-none">
        {/* Top Floating Glassmorphism Controls */}
        <div className="absolute top-0 left-0 right-0 z-30 px-3 py-3 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent flex items-center justify-between pointer-events-auto">
          <button
            onClick={() => {
              stopCamera();
              if (onCloseScanner) onCloseScanner();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 text-xs font-bold backdrop-blur-md shadow-lg active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Quay lại phòng</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-emerald-500/40 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-black text-emerald-300 font-mono">
              {detectedCount} / {totalStudents} HS
            </span>
            <span className="text-[10px] text-slate-400">
              ({Math.round((detectedCount / (totalStudents || 1)) * 100)}%)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <label 
              title="Chụp ảnh quét thẻ" 
              className="cursor-pointer p-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white border border-purple-400/50 backdrop-blur-md shadow-lg active:scale-95 transition-all flex items-center justify-center"
            >
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleScanFromPhoto}
                className="hidden"
              />
            </label>

            {isScanning ? (
              <button
                onClick={stopCamera}
                className="p-2 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white border border-rose-400/50 backdrop-blur-md shadow-lg active:scale-95 transition-all"
                title="Tạm dừng camera"
              >
                <CameraOff className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold backdrop-blur-md shadow-lg active:scale-95 transition-all"
                title="Bật lại camera"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Fullscreen Video & Canvas Feed */}
        <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
          <video 
            ref={videoRef} 
            playsInline 
            muted 
            autoPlay
            className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
          />
          <canvas 
            ref={canvasRef} 
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${isScanning ? 'block' : 'hidden'}`}
          />

          {!isScanning && (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-sm z-20">
              <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-2xl">
                <Camera className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Camera đang tạm dừng</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Bấm nút bên dưới để tiếp tục quét thẻ học sinh
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  Bật Camera
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    if (onCloseScanner) onCloseScanner();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Về phòng học
                </button>
              </div>
            </div>
          )}
        </div>

        {/* QUESTION CONTROLLER HUD INSIDE CAMERA (CHUYỂN CÂU HỎI & ĐIỀU KHIỂN PHÒNG TRỰC TIẾP KHI ĐANG QUÉT) */}
        <div className="absolute bottom-14 left-2 right-2 z-30 flex flex-col gap-1.5 p-2 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 shadow-2xl pointer-events-auto">
          {/* Top Row: Current Question Info & Live Submitted Badge */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="font-mono font-black text-xs sm:text-sm text-cyan-300 shrink-0">
                CÂU {currentQIndex + 1}/{questionsList.length}:
              </span>
              <span className="text-[11px] text-slate-200 truncate font-semibold" title={questionsList[currentQIndex]?.questionText}>
                {questionsList[currentQIndex]?.questionText}
              </span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-[11px] font-bold text-emerald-300 shrink-0">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>{detectedCount}/{totalStudents} HS</span>
            </div>
          </div>

          {/* Action Controls Row */}
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            {/* Previous Question */}
            <button
              onClick={handlePrevQuestion}
              disabled={currentQIndex === 0}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all border border-slate-700/60"
              title="Câu trước"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
              <span className="hidden xs:inline">Trước</span>
            </button>

            {/* Quick Lock / Unlock Button */}
            {questionState === 'COLLECTING' ? (
              <button
                onClick={handleLockQuestion}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 flex items-center gap-1 active:scale-95 transition-all shadow-md"
                title="Khóa không cho nộp thêm"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Chốt đáp án</span>
              </button>
            ) : (
              <button
                onClick={handleUnlockQuestion}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 flex items-center gap-1 active:scale-95 transition-all shadow-md"
                title="Mở lại nhận nộp bài"
              >
                <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mở lại</span>
              </button>
            )}

            {/* Quick Reveal Button */}
            <button
              onClick={handleRevealAnswer}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 flex items-center gap-1 active:scale-95 transition-all shadow-md"
              title="Công bố đáp án đúng lên máy chiếu"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Công bố</span>
            </button>

            {/* Next Question or Leaderboard */}
            {currentQIndex < questionsList.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                title="Sang câu tiếp theo"
              >
                <span>Tiếp</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
            ) : (
              <button
                onClick={handleFinishAndShowLeaderboard}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-lg shadow-yellow-500/40 active:scale-95 transition-all animate-pulse"
                title="Hiện bảng vinh danh và tổng kết"
              >
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>Tổng kết</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Floating Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-3 py-2 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent flex items-center justify-between pointer-events-auto backdrop-blur-sm">
          {/* Privacy Protection Mode: Student answers masked by default */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHideAnswersOnScan(!hideAnswersOnScan)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-[10px] text-slate-300 hover:text-white"
              title="Chống nhìn bài: Ẩn/Hiện chữ đáp án"
            >
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>{hideAnswersOnScan ? '🔒 Đang ẩn đáp án' : '👁️ Đang hiện đáp án'}</span>
            </button>
            {!hideAnswersOnScan && (
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
                <span className="px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">A:{tally.A || 0}</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-500/40">B:{tally.B || 0}</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">C:{tally.C || 0}</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">D:{tally.D || 0}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              stopCamera();
              if (onCloseScanner) onCloseScanner();
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xong</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden p-3 sm:p-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Camera className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-200 to-white">
              QUÉT THẺ QR THÔNG MINH (COMPUTER VISION)
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Phòng: <span className="text-cyan-400 font-mono font-bold">{roomCode}</span></span>
              <span>•</span>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-0.5">
                <span className="text-[11px] text-slate-400">Đang quét lớp:</span>
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
              <div className="hidden md:flex items-center gap-1.5 bg-purple-950/60 border border-purple-800/50 rounded-lg px-2 py-0.5 text-[11px] text-purple-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                <span>Hỗ trợ thẻ Quizizz Q-Cards (P 1 - P 60)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Actions & Quick Simulator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateScan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/50 transition-all"
            title="Tự động giả lập quét toàn bộ học sinh trong lớp"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Giả lập quét lớp ({totalStudents} HS)
          </button>
          
          <button
            onClick={handleSyncResponses}
            disabled={isSyncing || detectedCount === 0}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
              detectedCount === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Gửi {detectedCount} đáp án lên máy chiếu
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Camera View & Live Scanned List */}
      <div className="flex-1 min-h-0 py-3 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left: Camera Feed & Canvas Overlay (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden relative p-3">
          <div className="flex items-center justify-between pb-2 shrink-0">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              CAMERA QUÉT THẺ
            </span>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md">
                <Camera className="w-3.5 h-3.5" />
                Chụp ảnh thẻ
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleScanFromPhoto}
                  className="hidden"
                />
              </label>

              {isScanning ? (
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  Dừng camera
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Bật camera
                </button>
              )}
            </div>
          </div>

          {/* Video / Canvas Container */}
          <div className="flex-1 relative bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
            <video 
              ref={videoRef} 
              playsInline 
              muted 
              autoPlay
              className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
            />
            <canvas 
              ref={canvasRef} 
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${isScanning ? 'block' : 'hidden'}`}
            />

            {!isScanning && (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Camera className="w-14 h-14 stroke-[1.2] text-cyan-400" />
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/30"
                  >
                    Bật camera video
                  </button>
                  <label className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    Chụp ảnh quét thẻ
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleScanFromPhoto}
                      className="hidden"
                    />
                  </label>
                </div>
                {cameraError && (
                  <p className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40 max-w-sm">
                    {cameraError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Status banner */}
          {syncStatus && (
            <div className="mt-2 text-center text-xs py-1.5 px-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold">
              {syncStatus}
            </div>
          )}
        </div>

        {/* Right: Live Scanned Students Feed (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden p-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-200">
                ĐÃ QUÉT: {detectedCount} / {totalStudents} HS
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHideAnswersOnScan(!hideAnswersOnScan)}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 hover:text-white"
                title="Bảo mật đáp án: Chống nhìn bài"
              >
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>{hideAnswersOnScan ? '🔒 Ẩn ký tự A,B,C,D' : '👁️ Hiện đáp án'}</span>
              </button>
              <span className="text-xs font-bold text-cyan-300">
                {Math.round((detectedCount / (totalStudents || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* Scanned Items list */}
          <div className="flex-1 min-h-0 overflow-y-auto py-2 space-y-1.5 pr-1">
            {Object.values(detectedResponses).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
                <CheckCircle2 className="w-10 h-10 stroke-[1.2] text-slate-700 mb-2" />
                <p className="text-xs">Chưa có thẻ nào được quét trong lượt này.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Đưa thẻ Quizizz Q-Card hoặc mã QR trước camera hoặc chụp ảnh để nạp đáp án ngay!
                </p>
              </div>
            ) : (
              Object.values(detectedResponses).map((res) => {
                const answerColors = {
                  A: 'bg-red-500/20 text-red-300 border-red-500/40',
                  B: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                  C: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                  D: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                };
                return (
                  <div 
                    key={res.cardId}
                    className="flex items-center justify-between px-3 py-2 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {res.cardType === 'Quizizz Q-Card' ? (
                        <span className="font-mono text-[10px] text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800/60 font-bold">
                          Quizizz {res.quizizzCode || res.cardId}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {res.cardId}
                        </span>
                      )}
                      <span className="font-semibold text-slate-100">{res.studentName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">{res.angle}°</span>
                      <span className={`px-2 py-1 rounded-lg flex items-center justify-center font-bold text-xs border shadow-sm ${
                        hideAnswersOnScan 
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50' 
                          : answerColors[res.answer] || ''
                      }`}>
                        {hideAnswersOnScan ? '✓ Đã nhận' : res.answer}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
