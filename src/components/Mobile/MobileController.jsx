import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Image as ImageIcon, Send, RotateCw, Lock, Eye, Unlock,
  CheckCircle2, Sparkles, Smartphone, ChevronRight, Upload, RefreshCw, X, ArrowLeft,
  Users, Check, AlertCircle, Award, Volume2
} from 'lucide-react';
import SmartScanner from '../Scanner/SmartScanner';
import { classroomService } from '../../services/classroomService';

export default function MobileController({ roomCode: propRoomCode = 'WB-601', onExitMobile }) {
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const roomCode = urlParams.get('room') || propRoomCode;

  // View state: isCameraScanning toggles between Room Hub and Fullscreen AR Camera
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('hub'); // 'hub' | 'groupPhoto'

  // Room & Students State
  const [roomState, setRoomState] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [chimeSent, setChimeSent] = useState(false);

  // Group Photo Poster states
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadStatus, setPhotoUploadStatus] = useState('');

  // 1. Initial Load & SSE Subscriptions
  useEffect(() => {
    // Announce mobile presence to desktop projector
    classroomService.broadcastDeviceJoin(roomCode, 'mobile');

    // Load Classes
    classroomService.getClasses().then((cls) => {
      if (Array.isArray(cls)) setClassesList(cls);
    });

    // Refresh Room & Students
    const refreshRoom = async () => {
      try {
        const room = await classroomService.getRoom(roomCode);
        if (room) {
          setRoomState(room);
          const cId = room.classId || 'CLASS_6A';
          const stu = await classroomService.getStudents(cId);
          if (Array.isArray(stu)) setStudentsList(stu);
        }
      } catch (err) {
        console.warn('Error refreshing room state:', err);
      }
    };

    refreshRoom();

    // Subscribe to SSE realtime events
    const unsubscribe = classroomService.subscribeToRoom(roomCode, (event) => {
      if (
        event.type === 'ROOM_STATE' || 
        event.type === 'QUESTION_UPDATED' || 
        event.type === 'QUESTION_LOCKED' || 
        event.type === 'ANSWER_REVEALED' ||
        event.type === 'RESPONSES_UPDATED' ||
        event.type === 'ROOM_CLASS_CHANGED'
      ) {
        refreshRoom();
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Handle mobile camera photo capture for group poster
  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1400;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setCapturedPhotoUrl(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Upload group poster photo
  const handleUploadPhoto = async () => {
    if (!capturedPhotoUrl) return;
    setIsUploadingPhoto(true);
    setPhotoUploadStatus('Đang gửi ảnh lên màn hình máy chiếu...');
    try {
      await classroomService.uploadGroupWork(roomCode, {
        groupNumber: selectedGroup,
        imageUrl: capturedPhotoUrl,
        caption: `Ảnh bài làm nhóm ${selectedGroup} từ điện thoại giáo viên`
      });
      setPhotoUploadStatus('Đã gửi bài thành công!');
      setTimeout(() => {
        setCapturedPhotoUrl(null);
        setPhotoUploadStatus('');
      }, 2500);
    } catch (err) {
      console.error(err);
      setPhotoUploadStatus('Lỗi khi gửi ảnh!');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Helper calculations for responses and tallies
  const responses = roomState?.responses || {};
  const submittedCount = Object.keys(responses).length;
  const totalStudents = studentsList.length || 32;
  const progressPercent = Math.min(100, Math.round((submittedCount / (totalStudents || 1)) * 100));

  const tally = { A: 0, B: 0, C: 0, D: 0 };
  Object.values(responses).forEach((r) => {
    if (r && r.answer && tally[r.answer] !== undefined) {
      tally[r.answer]++;
    }
  });

  const activeQ = roomState?.activeQuestion;
  const questionState = roomState?.questionState || 'COLLECTING';

  // 2. FULLSCREEN CAMERA SCANNER VIEW (Active when teacher taps "Bật Camera Quét Đáp Án")
  if (isCameraScanning) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <SmartScanner 
          roomCode={roomCode}
          fullscreen={true}
          onCloseScanner={() => {
            setIsCameraScanning(false);
            // Refresh room state when returning from camera
            classroomService.getRoom(roomCode).then((r) => {
              if (r) setRoomState(r);
            });
          }}
          onResponsesUpdated={() => {
            classroomService.getRoom(roomCode).then((r) => {
              if (r) setRoomState(r);
            });
          }}
        />
      </div>
    );
  }

  // 3. ROOM HUB INTERFACE (The Room screen when user accesses room from phone)
  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden select-none">
      {/* Top Projector Connection Status Bar */}
      <div className="px-3 py-1.5 bg-emerald-950/90 border-b border-emerald-500/40 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>🟢 ĐÃ KẾT NỐI MÁY CHIẾU ({roomCode})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              classroomService.sendChimePing(roomCode);
              setChimeSent(true);
              setTimeout(() => setChimeSent(false), 2000);
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 text-[11px] font-bold border border-emerald-400/40 transition-all flex items-center gap-1"
          >
            <span>🔔</span>
            <span>{chimeSent ? 'Đã rung chuông PC!' : 'Thử chuông PC'}</span>
          </button>

          {onExitMobile && (
            <button
              onClick={onExitMobile}
              title="Quay lại Slide"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* In-app Browser Notice (e.g. Zalo) */}
      {typeof navigator !== 'undefined' && /Zalo|FBAN|FBAV|Instagram/i.test(navigator.userAgent) && (
        <div className="px-3 py-2 bg-amber-500/20 border-b border-amber-500/40 text-amber-200 text-[11px] text-center font-medium shrink-0">
          ⚠️ <b>Đang mở trong Zalo:</b> Bấm dấu <b>"..."</b> ở góc trên bên phải ➔ Chọn <b>"Mở bằng trình duyệt" (Chrome/Safari)</b> để camera quét nhanh và mượt nhất!
        </div>
      )}

      {/* Room Header & Mode Switcher */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-cyan-500/20">
            <Smartphone className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-cyan-300">PHÒNG {roomCode}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                ONLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {roomState?.className || 'Lớp 6A'} • <span className="text-cyan-400 font-bold">{totalStudents} Học sinh</span>
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('hub')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeSubTab === 'hub' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            Phòng chơi
          </button>
          <button
            onClick={() => setActiveSubTab('groupPhoto')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeSubTab === 'groupPhoto' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            Chụp A3/A4
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto w-full">
        {activeSubTab === 'hub' ? (
          <>
            {/* HERO CTA BUTTON: TAP TO OPEN FULLSCREEN AR SCANNER */}
            <button
              onClick={() => setIsCameraScanning(true)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-cyan-500/30 flex items-center justify-between transform active:scale-98 transition-all border border-cyan-200/40 relative overflow-hidden group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
                  <Camera className="w-6 h-6 text-slate-950 animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-black uppercase tracking-wide flex items-center gap-1.5">
                    <span>BẬT CAMERA QUÉT ĐÁP ÁN</span>
                    <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-900/80">
                    Camera AR góc rộng • Tự bắt thẻ Quizizz xoay A, B, C, D
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* Current Active Question Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  CÂU HỎI TRÊN MÁY CHIẾU
                </span>

                {/* Question State Badge */}
                {questionState === 'COLLECTING' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Đang nhận bài
                  </span>
                )}
                {questionState === 'LOCKED' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Đã khóa nộp bài
                  </span>
                )}
                {questionState === 'REVEALED' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                    <Award className="w-3 h-3 text-yellow-300" />
                    Đã công bố đáp án
                  </span>
                )}
              </div>

              {activeQ ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <p className="font-bold text-sm text-slate-100 leading-snug">
                      {activeQ.questionText}
                    </p>
                  </div>

                  {/* Options List */}
                  {activeQ.options && (
                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                      {Object.entries(activeQ.options).map(([optKey, optText]) => {
                        const isCorrect = questionState === 'REVEALED' && activeQ.correctAnswer === optKey;
                        return (
                          <div
                            key={optKey}
                            className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                              isCorrect 
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                              isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-cyan-300'
                            }`}>
                              {optKey}
                            </span>
                            <span className="flex-1 truncate">{optText}</span>
                            {isCorrect && (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Control Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {questionState === 'COLLECTING' ? (
                      <button
                        onClick={async () => {
                          await classroomService.lockQuestion(roomCode);
                          classroomService.getRoom(roomCode).then(setRoomState);
                        }}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Khóa nộp bài</span>
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await classroomService.setQuestion(roomCode, activeQ, 'COLLECTING');
                          classroomService.getRoom(roomCode).then(setRoomState);
                        }}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Mở lại nộp bài</span>
                      </button>
                    )}

                    <button
                      onClick={async () => {
                        await classroomService.revealAnswer(roomCode);
                        classroomService.getRoom(roomCode).then(setRoomState);
                      }}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Công bố đáp án</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Chưa có câu hỏi nào đang được chọn.</p>
                  <p className="text-[11px] text-slate-500">Giáo viên vui lòng chuyển câu hỏi trên máy chiếu hoặc tab Trắc nghiệm!</p>
                </div>
              )}
            </div>

            {/* Live Progress Bar & Answer Tallies */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  TIẾN ĐỘ NỘP BÀI
                </span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {submittedCount} / {totalStudents} HS ({progressPercent}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Breakdown tally pills */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono font-bold text-xs">
                <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300">
                  <div className="text-[10px] text-rose-400">ĐÁP ÁN A</div>
                  <div className="text-base font-black">{tally.A}</div>
                </div>
                <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-300">
                  <div className="text-[10px] text-blue-400">ĐÁP ÁN B</div>
                  <div className="text-base font-black">{tally.B}</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                  <div className="text-[10px] text-emerald-400">ĐÁP ÁN C</div>
                  <div className="text-base font-black">{tally.C}</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300">
                  <div className="text-[10px] text-amber-400">ĐÁP ÁN D</div>
                  <div className="text-base font-black">{tally.D}</div>
                </div>
              </div>
            </div>

            {/* Students Grid: Live List of Who Has Answered */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  DANH SÁCH THẺ HỌC SINH ({totalStudents} HS)
                </span>
                <span className="text-[11px] text-slate-400">
                  Xanh lá = Đã nộp bài
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-1">
                {studentsList.map((stu, idx) => {
                  const stt = idx + 1;
                  const numMatch = (stu.cardId || '').match(/(\d+)/);
                  const pNum = numMatch ? parseInt(numMatch[1], 10) : stt;
                  const cardKey = `CARD_${pNum < 10 ? '000' + pNum : (pNum < 100 ? '00' + pNum : '0' + pNum)}`;

                  // Check if student responded
                  const resp = responses[cardKey] || responses[stu.id] || responses[stu.cardId] || responses[`P ${pNum}`] || responses[`P${pNum}`];
                  const hasAnswered = !!resp;
                  const shortName = stu.fullName ? stu.fullName.split(' ').slice(-1)[0] : `HS ${pNum}`;

                  return (
                    <div
                      key={stu.id || idx}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        hasAnswered 
                          ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-sm shadow-emerald-500/20'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-bold text-slate-400">
                        P {pNum}
                      </div>
                      <div className="text-[11px] font-bold truncate max-w-full">
                        {shortName}
                      </div>
                      <div className="mt-1">
                        {hasAnswered ? (
                          <span className="px-1.5 py-0.5 rounded-md font-mono font-black text-xs bg-emerald-500 text-slate-950">
                            {resp.answer}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-mono">
                            ---
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* SUBTAB: CHỤP ẢNH BÀI LÀM NHÓM A3/A4 */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              CHỤP ẢNH BÀI LÀM NHÓM LÊN MÁY CHIẾU
            </h4>

            {/* Select Group */}
            <div className="text-xs">
              <label className="text-slate-400 font-semibold mb-1 block">Chọn Nhóm nộp bài</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGroup(g)}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      selectedGroup === g 
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md' 
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    Nhóm {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Trigger / Photo Upload */}
            <div className="pt-2">
              <label className="cursor-pointer w-full py-4 rounded-xl border-2 border-dashed border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/20 flex flex-col items-center justify-center text-center space-y-2 transition-all">
                <Camera className="w-8 h-8 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300">
                  Bấm để chụp ảnh bài giấy (A3/A4)
                </span>
                <span className="text-[10px] text-slate-500">
                  Tự động tối ưu hóa và truyền trực tiếp lên máy chiếu
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoCapture}
                />
              </label>
            </div>

            {/* Photo Preview & Upload Submit */}
            {capturedPhotoUrl && (
              <div className="space-y-3 pt-2">
                <div className="rounded-xl overflow-hidden border border-slate-700 max-h-60 flex items-center justify-center bg-black">
                  <img 
                    src={capturedPhotoUrl} 
                    alt="Xem trước bài làm" 
                    className="max-h-60 object-contain"
                  />
                </div>

                <button
                  onClick={handleUploadPhoto}
                  disabled={isUploadingPhoto}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all"
                >
                  {isUploadingPhoto ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      Đang gửi lên máy chiếu...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-slate-950" />
                      Gửi ảnh Nhóm {selectedGroup} lên máy chiếu
                    </>
                  )}
                </button>
              </div>
            )}

            {photoUploadStatus && (
              <p className="text-center text-xs font-bold text-emerald-400">
                {photoUploadStatus}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
