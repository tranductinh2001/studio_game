import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Image as ImageIcon, Send, RotateCw, Lock, Eye, Unlock,
  CheckCircle2, Sparkles, Smartphone, ChevronRight, ChevronLeft, Upload, RefreshCw, X, ArrowLeft,
  Users, Check, AlertCircle, Award, Volume2, LogIn, LogOut, Radio, PlayCircle
} from 'lucide-react';
import SmartScanner from '../Scanner/SmartScanner';
import { classroomService } from '../../services/classroomService';
import { LESSON_6_QUESTIONS } from '../../data/lesson6Questions';

export default function MobileController({ roomCode: propRoomCode = 'WB-601', onExitMobile }) {
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const urlRoom = urlParams.get('room');

  // If room parameter is passed in URL, pre-fill it
  const [selectedRoomCode, setSelectedRoomCode] = useState(urlRoom || propRoomCode || 'WB-601');
  const [inputRoomCode, setInputRoomCode] = useState(urlRoom || propRoomCode || 'WB-601');
  
  // Master Flow State:
  // hasJoinedRoom = false => Shows Room Lobby / Discovery ("Vào phòng")
  // hasJoinedRoom = true  => Shows Game Controls & QR Scanner ("Trong phòng")
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('hub'); // 'hub' | 'groupPhoto'

  // Online Active Rooms list for lobby discovery
  const [activeRoomsList, setActiveRoomsList] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  // Active Room & Classroom state
  const [roomState, setRoomState] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [chimeSent, setChimeSent] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Group Photo Poster states
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadStatus, setPhotoUploadStatus] = useState('');

  // 1. Fetch available online rooms for Lobby
  const fetchActiveRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const list = await classroomService.getActiveRooms();
      if (Array.isArray(list)) {
        setActiveRoomsList(list);
      }
    } catch (err) {
      console.warn('Error fetching active rooms:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchActiveRooms();
    const interval = setInterval(fetchActiveRooms, 4000);
    return () => clearInterval(interval);
  }, []);

  // 2. Refresh active room data when joined
  const refreshRoom = async (code = selectedRoomCode) => {
    try {
      const room = await classroomService.getRoom(code);
      if (room) {
        setRoomState(room);
        const cId = room.classId || 'CLASS_6A';
        const stu = await classroomService.getStudents(cId);
        if (Array.isArray(stu)) setStudentsList(stu);

        // Sync question index
        if (room.activeQuestion || room.currentQuestion) {
          const q = room.activeQuestion || room.currentQuestion;
          const foundIdx = LESSON_6_QUESTIONS.findIndex(item => item.id === q.id || item.questionText === q.questionText);
          if (foundIdx !== -1) setCurrentQIndex(foundIdx);
        }
      }
    } catch (err) {
      console.warn('Error refreshing room state:', err);
    }
  };

  // 3. Subscribe to Room events when joined
  useEffect(() => {
    if (!hasJoinedRoom) return;

    // Announce mobile presence to desktop projector
    classroomService.broadcastDeviceJoin(selectedRoomCode, 'mobile');
    refreshRoom(selectedRoomCode);

    const unsubscribe = classroomService.subscribeToRoom(selectedRoomCode, (event) => {
      if (
        event.type === 'ROOM_STATE' || 
        event.type === 'QUESTION_UPDATED' || 
        event.type === 'QUESTION_LOCKED' || 
        event.type === 'ANSWER_REVEALED' ||
        event.type === 'RESPONSES_UPDATED' ||
        event.type === 'ROOM_CLASS_CHANGED' ||
        event.type === 'ROOM_CREATED'
      ) {
        refreshRoom(selectedRoomCode);
      }
    });

    return () => unsubscribe();
  }, [hasJoinedRoom, selectedRoomCode]);

  // Handle Join Room Action
  const handleJoinRoom = (code) => {
    const targetCode = (code || selectedRoomCode || 'WB-601').trim().toUpperCase();
    setSelectedRoomCode(targetCode);
    setHasJoinedRoom(true);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(60);
    }
  };

  // Handle Leave Room Action (Back to Lobby)
  const handleLeaveRoom = () => {
    setHasJoinedRoom(false);
    setIsCameraScanning(false);
    fetchActiveRooms();
  };

  // Handle Question Navigation from Mobile Phone
  const handleNavigateQuestion = async (newIndex) => {
    if (newIndex >= 0 && newIndex < LESSON_6_QUESTIONS.length) {
      setCurrentQIndex(newIndex);
      const targetQ = LESSON_6_QUESTIONS[newIndex];
      try {
        await classroomService.setQuestion(selectedRoomCode, targetQ, 'COLLECTING');
        await refreshRoom(selectedRoomCode);
      } catch (err) {
        console.error('Error navigating question:', err);
      }
    }
  };

  // Handle Mobile Photo Capture for Group Poster
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

  // Upload Group Poster Photo
  const handleUploadPhoto = async () => {
    if (!capturedPhotoUrl) return;
    setIsUploadingPhoto(true);
    setPhotoUploadStatus('Đang gửi ảnh lên màn hình máy chiếu...');
    try {
      await classroomService.uploadGroupWork(selectedRoomCode, {
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

  const activeQ = roomState?.activeQuestion || LESSON_6_QUESTIONS[currentQIndex];
  const questionState = roomState?.questionState || 'COLLECTING';

  // =========================================================================
  // SCENARIO 1: FULLSCREEN CAMERA SCANNER VIEW (When tapping "Bật Camera Quét Đáp Án")
  // =========================================================================
  if (isCameraScanning) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <SmartScanner 
          roomCode={selectedRoomCode}
          fullscreen={true}
          onCloseScanner={() => {
            setIsCameraScanning(false);
            refreshRoom(selectedRoomCode);
          }}
          onResponsesUpdated={() => {
            refreshRoom(selectedRoomCode);
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 2: ROOM LOBBY / DISCOVERY SCREEN (When phone picks up and hasn't joined yet)
  // =========================================================================
  if (!hasJoinedRoom) {
    return (
      <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-y-auto p-4 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Smartphone className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-200">
                ĐIỀU KHIỂN GIÁO VIÊN
              </h2>
              <p className="text-[11px] text-slate-400">
                THCS Đắk Trôi • Môn Tin học 6
              </p>
            </div>
          </div>

          {onExitMobile && (
            <button
              onClick={onExitMobile}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* In-app Browser Notice */}
        {typeof navigator !== 'undefined' && /Zalo|FBAN|FBAV|Instagram/i.test(navigator.userAgent) && (
          <div className="my-3 p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-200 text-xs text-center font-medium">
            ⚠️ <b>Đang mở trong Zalo:</b> Bấm dấu <b>"..."</b> góc trên bên phải ➔ <b>"Mở bằng trình duyệt" (Chrome/Safari)</b> để camera quét siêu mượt!
          </div>
        )}

        <div className="max-w-md mx-auto w-full space-y-4 pt-4">
          {/* Active Online Rooms List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                PHÒNG CHƠI ĐANG MỞ ONLINE ({activeRoomsList.length})
              </span>
              <button
                onClick={fetchActiveRooms}
                className="text-[11px] text-cyan-400 flex items-center gap-1 hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingRooms ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>

            {activeRoomsList.length > 0 ? (
              <div className="space-y-3">
                {activeRoomsList.map((room) => (
                  <div
                    key={room.roomCode}
                    className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/10 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="font-mono font-black text-lg text-cyan-300">
                          {room.roomCode}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                        SẴN SÀNG ONLINE
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="text-slate-200 font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{room.className || 'Lớp 6A'} ({room.totalStudents || 32} Học sinh)</span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1">
                        Câu hỏi: {room.activeQuestionText || 'Bài 6: Mạng thông tin toàn cầu'}
                      </p>
                    </div>

                    {/* BIG HERO BUTTON: VÀO PHÒNG */}
                    <button
                      onClick={() => handleJoinRoom(room.roomCode)}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                    >
                      <LogIn className="w-4 h-4 text-slate-950" />
                      <span>VÀO PHÒNG ĐIỀU KHIỂN & QUÉT QR</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
                <Radio className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
                <p className="font-bold text-sm text-slate-300">Đang tìm phòng chơi online...</p>
                <p className="text-xs text-slate-500">
                  Hãy bấm "Tạo & Cấu hình phòng" trên màn hình máy chiếu hoặc nhập mã phòng bên dưới!
                </p>
              </div>
            )}
          </div>

          {/* Manual Room Code Entry */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              HOẶC NHẬP MÃ PHÒNG THỦ CÔNG
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                placeholder="VD: WB-601"
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono font-bold text-sm text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleJoinRoom(inputRoomCode)}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>VÀO PHÒNG</span>
              </button>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-800/60 text-[11px] text-slate-400 space-y-1 leading-relaxed">
            <div className="font-bold text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tiện ích sau khi vào phòng:</span>
            </div>
            <p>• Điều khiển trực tiếp chuyển câu hỏi, khóa nhận bài và công bố đáp án lên máy chiếu.</p>
            <p>• Bật camera quét thẻ Quizizz AR góc rộng, tự động nhận diện và cập nhật xoay đáp án A, B, C, D tức thì!</p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 3: INSIDE ROOM VIEW (Room Hub & Live Game Controller)
  // =========================================================================
  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden select-none">
      {/* Top Projector Connection Status Bar */}
      <div className="px-3 py-1.5 bg-emerald-950/90 border-b border-emerald-500/40 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>🟢 ĐÃ VÀO PHÒNG ({selectedRoomCode})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              classroomService.sendChimePing(selectedRoomCode);
              setChimeSent(true);
              setTimeout(() => setChimeSent(false), 2000);
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 text-[11px] font-bold border border-emerald-400/40 transition-all flex items-center gap-1"
          >
            <span>🔔</span>
            <span>{chimeSent ? 'Đã rung chuông PC!' : 'Thử chuông PC'}</span>
          </button>

          <button
            onClick={handleLeaveRoom}
            title="Đổi phòng khác"
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 text-[11px] flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Đổi phòng</span>
          </button>
        </div>
      </div>

      {/* Room Header & Mode Switcher */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-cyan-500/20">
            <Smartphone className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-cyan-300">PHÒNG {selectedRoomCode}</span>
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
            Bàn điều khiển
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
            {/* HERO CTA BUTTON: TAP TO OPEN FULLSCREEN AR CAMERA SCANNER */}
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

            {/* GAME CONTROLLER: QUESTION SWITCHER & ACTIONS FOR TEACHER */}
            <div className="bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-3.5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5" />
                  ĐIỀU KHIỂN TRÒ CHƠI TRÊN MÁY CHIẾU
                </span>
                
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

              {/* Question Navigation Bar (Prev / Next Question) */}
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                <button
                  onClick={() => handleNavigateQuestion(currentQIndex - 1)}
                  disabled={currentQIndex === 0}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1 text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>

                <div className="text-center">
                  <div className="font-mono font-black text-sm text-cyan-300">
                    CÂU {currentQIndex + 1} / {LESSON_6_QUESTIONS.length}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Bấm để chuyển câu máy chiếu
                  </div>
                </div>

                <button
                  onClick={() => handleNavigateQuestion(currentQIndex + 1)}
                  disabled={currentQIndex === LESSON_6_QUESTIONS.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1 text-slate-200"
                >
                  <span>Câu tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons: Lock / Reveal / Re-open */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {questionState === 'COLLECTING' ? (
                  <button
                    onClick={async () => {
                      await classroomService.lockQuestion(selectedRoomCode);
                      refreshRoom(selectedRoomCode);
                    }}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Khóa nộp bài</span>
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await classroomService.setQuestion(selectedRoomCode, activeQ, 'COLLECTING');
                      refreshRoom(selectedRoomCode);
                    }}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Mở lại nộp bài</span>
                  </button>
                )}

                <button
                  onClick={async () => {
                    await classroomService.revealAnswer(selectedRoomCode);
                    refreshRoom(selectedRoomCode);
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Công bố đáp án</span>
                </button>
              </div>
            </div>

            {/* Active Question Preview */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                NỘI DUNG CÂU HỎI ĐANG CHIẾU
              </span>

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
                </div>
              ) : null}
            </div>

            {/* Live Progress Bar & Answer Tallies */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  TIẾN ĐỘ NỘP BÀI CẢ LỚP
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
                  Xanh lá = Đã nộp
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
