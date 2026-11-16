import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, CameraOff, CheckCircle2, RotateCw, RefreshCw, Send, 
  Users, Volume2, Sparkles, AlertCircle, PlayCircle, Layers, Image as ImageIcon
} from 'lucide-react';
import { classroomService } from '../../services/classroomService';
import { detectQuizizzCards } from '../../utils/quizizzArucoDetector';

export default function SmartScanner({ roomCode = 'WB-601', onResponsesUpdated }) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [detectedResponses, setDetectedResponses] = useState({});
  const [studentsMap, setStudentsMap] = useState({});
  const [totalStudents, setTotalStudents] = useState(32);
  const [lastScannedStudent, setLastScannedStudent] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const [classes, setClasses] = useState([]);
  const [activeClassId, setActiveClassId] = useState('CLASS_6B');
  const [activeClassName, setActiveClassName] = useState('Lớp 6B');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const streamRef = useRef(null);
  const isScanningRef = useRef(false);
  const lastProcessTimeRef = useRef(0);

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
    const pMatch = s.match(/^P\s*(\d+)$/i);
    if (pMatch) {
      const num = parseInt(pMatch[1], 10);
      return `CARD_${num < 10 ? '000' + num : (num < 100 ? '00' + num : '0' + num)}`;
    }
    if (/^\d+$/.test(s)) {
      const num = parseInt(s, 10);
      return `CARD_${num < 10 ? '000' + num : (num < 100 ? '00' + num : '0' + num)}`;
    }
    return s;
  };

  // Helper: Parse code data from JSON or raw text
  const parseCardData = (data) => {
    if (!data) return null;
    try {
      const parsed = JSON.parse(data);
      const id = parsed.cardId || parsed.studentCode || parsed.id || parsed.code;
      if (id) return normalizeCardId(id);
    } catch {}

    return normalizeCardId(data);
  };

  // Helper: Resolve student details from map with fallback
  const resolveStudent = (cardId, quizizzCode = null) => {
    if (studentsMap[cardId]) return studentsMap[cardId];
    if (quizizzCode && studentsMap[quizizzCode]) return studentsMap[quizizzCode];

    const numMatch = String(cardId).match(/(\d+)/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      const padded = `CARD_${num < 10 ? '000' + num : (num < 100 ? '00' + num : '0' + num)}`;
      if (studentsMap[padded]) return studentsMap[padded];
      if (studentsMap[`P ${num}`]) return studentsMap[`P ${num}`];
      if (studentsMap[`P${num}`]) return studentsMap[`P${num}`];

      return {
        id: padded,
        cardId: padded,
        studentCode: `HS${num < 10 ? '0' + num : num}`,
        fullName: `Học sinh ${num}`
      };
    }

    return {
      id: cardId,
      cardId: cardId,
      studentCode: cardId,
      fullName: `Học sinh (${cardId})`
    };
  };

  const queueResponseForAutoSync = (respItem) => {
    const lastAnswer = syncedCardsRef.current.get(respItem.cardId);
    if (lastAnswer === respItem.answer) {
      return;
    }

    pendingSyncQueueRef.current.set(respItem.cardId, respItem);

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      const batch = Array.from(pendingSyncQueueRef.current.values());
      if (batch.length === 0) return;
      pendingSyncQueueRef.current.clear();

      try {
        const res = await classroomService.submitResponses(roomCode, batch);
        if (res && res.locked) {
          setSyncStatus('⚠️ Câu hỏi đã bị khóa!');
        } else if (res && res.success) {
          batch.forEach(item => {
            syncedCardsRef.current.set(item.cardId, item.answer);
          });
          setSyncStatus(`⚡ Realtime: Đã nạp ${res.totalAnswered || batch.length} đáp án lên máy chiếu!`);
          if (onResponsesUpdated) onResponsesUpdated(batch);
        }
      } catch (err) {
        console.warn('Auto-sync response error:', err);
      }
    }, 120);
  };

  // Load students for active class
  const loadStudentsForClass = (classId) => {
    classroomService.getStudents(classId).then((list) => {
      const map = {};
      if (Array.isArray(list)) {
        list.forEach((s, idx) => {
          map[s.cardId] = s;
          const pNum = idx + 1;
          const cardKey = `CARD_${pNum < 10 ? '000' + pNum : (pNum < 100 ? '00' + pNum : '0' + pNum)}`;
          map[cardKey] = s;
          map[`P ${pNum}`] = s;
          map[`P${pNum}`] = s;
          map[`${pNum}`] = s;
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
        setDetectedResponses({});
        syncedCardsRef.current.clear();
        setSyncStatus('Câu hỏi mới: Sẵn sàng quét thẻ học sinh');
      }
      if (event.type === 'QUESTION_LOCKED') {
        setSyncStatus('⚠️ Giáo viên đã khóa nhận đáp án');
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

  // Calculate orientation and map to answer A, B, C, D
  const calculateAnswerFromCorners = (location) => {
    const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = location;
    
    // Vector along top edge (from topLeft to topRight)
    const dx = topRightCorner.x - topLeftCorner.x;
    const dy = topRightCorner.y - topLeftCorner.y;

    // Angle in degrees (0 to 360)
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    // Direction mapping based on orientation:
    // ~0 deg (315 to 45): Top is up -> A
    // ~90 deg (45 to 135): Right is up -> B
    // ~180 deg (135 to 225): Bottom is up -> C
    // ~270 deg (225 to 315): Left is up -> D
    let answer = 'A';
    if (angle >= 45 && angle < 135) {
      answer = 'B';
    } else if (angle >= 135 && angle < 225) {
      answer = 'C';
    } else if (angle >= 225 && angle < 315) {
      answer = 'D';
    } else {
      answer = 'A';
    }

    return { answer, angle: Math.round(angle) };
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('⚠️ Trình duyệt hạn chế video trực tiếp qua HTTP. Thầy/Cô hãy dùng nút "📸 Chụp ảnh quét thẻ" bên cạnh (hoạt động 100%), hoặc mở link Vercel HTTPS!');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        isScanningRef.current = true;
        setIsScanning(true);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      console.warn('Camera error:', err.message);
      isScanningRef.current = false;
      setIsScanning(false);
      setCameraError('Không thể mở camera video trực tiếp. Vui lòng bấm nút "📸 Chụp ảnh quét thẻ" bên cạnh để chụp thẻ ngay!');
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
            }
          }
        } catch (err) {
          console.warn('Webby QR scan error from photo:', err);
        }

        if (detectedInPhoto > 0) {
          setSyncStatus(`🎉 Đã quét thành công ${detectedInPhoto} thẻ từ ảnh chụp!`);
        } else {
          setSyncStatus('⚠️ Không nhận diện được thẻ trong ảnh. Vui lòng chụp rõ mã vuông trên giấy!');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Continuous frame loop using isScanningRef to prevent stale closure loop termination
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
      // Draw fresh video frame into canvas view
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const now = performance.now();
      // Scan every 75ms to guarantee smooth 60fps video feed and low mobile temperature
      if (now - lastProcessTimeRef.current >= 75) {
        lastProcessTimeRef.current = now;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 1. Scan Quizizz Paper Mode Q-Cards (ArUco 4x4)
        try {
          const qCards = detectQuizizzCards(imageData);
          if (qCards && qCards.length > 0) {
            qCards.forEach((q) => {
              const { participant, cardId, quizizzCode, answer, visualAngle, corners } = q;
              const student = resolveStudent(cardId, quizizzCode);
              const targetKey = student.cardId || cardId;

              // Glowing purple polygon
              ctx.beginPath();
              ctx.moveTo(corners[0].x, corners[0].y);
              ctx.lineTo(corners[1].x, corners[1].y);
              ctx.lineTo(corners[2].x, corners[2].y);
              ctx.lineTo(corners[3].x, corners[3].y);
              ctx.closePath();
              ctx.lineWidth = 5;
              ctx.strokeStyle = '#c084fc';
              ctx.stroke();

              // Overlay pill
              ctx.fillStyle = 'rgba(88, 28, 135, 0.9)';
              ctx.fillRect(corners[0].x - 4, Math.max(10, corners[0].y - 32), 240, 28);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 15px Orbitron, sans-serif';
              ctx.fillText(
                `[${quizizzCode} • ${student.fullName}] -> ${answer}`,
                corners[0].x + 4,
                Math.max(28, corners[0].y - 12)
              );

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
              queueResponseForAutoSync(respItem);

              if (navigator.vibrate) navigator.vibrate(30);
            });
          }
        } catch (err) {
          // ignore scan error
        }

        // 2. Scan Webby QR (jsQR with both normal and inverted attempt)
        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });

          if (code) {
            const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = code.location;
            ctx.beginPath();
            ctx.moveTo(topLeftCorner.x, topLeftCorner.y);
            ctx.lineTo(topRightCorner.x, topRightCorner.y);
            ctx.lineTo(bottomRightCorner.x, bottomRightCorner.y);
            ctx.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
            ctx.closePath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#10b981';
            ctx.stroke();

            const cId = parseCardData(code.data);
            if (cId) {
              const { answer, angle } = calculateAnswerFromCorners(code.location);
              const student = resolveStudent(cId);
              const targetKey = student.cardId || cId;

              // Green overlay pill
              ctx.fillStyle = 'rgba(6, 78, 59, 0.9)';
              ctx.fillRect(topLeftCorner.x - 4, Math.max(10, topLeftCorner.y - 32), 240, 28);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 15px Orbitron, sans-serif';
              ctx.fillText(`[${student.fullName}] -> ${answer} (${angle}°)`, topLeftCorner.x + 4, Math.max(28, topLeftCorner.y - 12));

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
              queueResponseForAutoSync(respItem);

              if (navigator.vibrate) navigator.vibrate(40);
            }
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
              className="hidden"
            />
            <canvas 
              ref={canvasRef} 
              className={`max-w-full max-h-full object-contain ${isScanning ? 'block' : 'hidden'}`}
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
            <span className="text-xs font-bold text-cyan-300">
              {Math.round((detectedCount / (totalStudents || 1)) * 100)}%
            </span>
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
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm border shadow-sm ${answerColors[res.answer] || ''}`}>
                        {res.answer}
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
