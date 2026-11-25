import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Image as ImageIcon, Send, RotateCw, Lock, Eye, Unlock,
  CheckCircle2, Sparkles, Smartphone, ChevronRight, ChevronLeft, Upload, RefreshCw, X, ArrowLeft,
  Users, Check, AlertCircle, Award, Volume2, LogIn, LogOut, Radio, PlayCircle,
  Video, VideoOff, Trophy
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
  // Auto-join if room parameter is present in URL (e.g. from QR scan)
  const [hasJoinedRoom, setHasJoinedRoom] = useState(Boolean(urlRoom));
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

  // Group Photo & Document Camera Streaming states
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadStatus, setPhotoUploadStatus] = useState('');

  // Real-time Wireless Camera Streaming to Projector
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
  const [streamError, setStreamError] = useState('');
  const [streamFps, setStreamFps] = useState(0);
  const [liveSnapshotSuccess, setLiveSnapshotSuccess] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const isStreamingRef = useRef(false);
  const selectedGroupRef = useRef(selectedGroup);

  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

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
      if (event.type === 'RESPONSES_UPDATED' && event.payload?.responses) {
        setRoomState(prev => ({
          ...prev,
          responses: {
            ...(prev?.responses || {}),
            ...event.payload.responses
          }
        }));
      } else if (event.type === 'QUESTION_UPDATED') {
        const q = event.payload?.activeQuestion || event.payload?.currentQuestion;
        if (q) {
          const foundIdx = LESSON_6_QUESTIONS.findIndex(item => item.id === q.id || item.questionText === q.questionText);
          if (foundIdx !== -1) setCurrentQIndex(foundIdx);
        }
        setRoomState(prev => ({
          ...prev,
          activeQuestion: q,
          questionState: event.payload?.questionState || 'COLLECTING',
          responses: {}
        }));
      } else if (event.type === 'QUESTION_LOCKED') {
        setRoomState(prev => ({ ...prev, questionState: 'LOCKED' }));
      } else if (event.type === 'ANSWER_REVEALED') {
        setRoomState(prev => ({ ...prev, questionState: 'REVEALED' }));
      } else if (event.type === 'ROOM_STATE' || event.type === 'ROOM_CREATED') {
        if (event.payload) {
          setRoomState(prev => ({ ...prev, ...event.payload }));
          if (event.payload.activeQuestion) {
            const foundIdx = LESSON_6_QUESTIONS.findIndex(item => item.id === event.payload.activeQuestion.id || item.questionText === event.payload.activeQuestion.questionText);
            if (foundIdx !== -1) setCurrentQIndex(foundIdx);
          }
        }
      }

      refreshRoom(selectedRoomCode);

      // Synchronize group if switched on projector web screen
      if (event.type === 'CAMERA_STATUS' && event.payload?.groupNumber) {
        setSelectedGroup(event.payload.groupNumber);
        selectedGroupRef.current = event.payload.groupNumber;
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
    stopLiveCamera(true);
    setHasJoinedRoom(false);
    setIsCameraScanning(false);
    fetchActiveRooms();
  };

  // Handle Question Navigation from Mobile Phone
  const handleNavigateQuestion = async (newIndex) => {
    if (newIndex >= 0 && newIndex < LESSON_6_QUESTIONS.length) {
      setCurrentQIndex(newIndex);
      const targetQ = LESSON_6_QUESTIONS[newIndex];
      setRoomState(prev => ({
        ...prev,
        activeQuestion: targetQ,
        questionState: 'COLLECTING',
        responses: {}
      }));
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      try {
        await classroomService.setQuestion(selectedRoomCode, targetQ, 'COLLECTING');
        await refreshRoom(selectedRoomCode);
      } catch (err) {
        console.error('Error navigating question:', err);
      }
    }
  };

  // Handle Mobile Photo Capture for Group Poster
  const handlePhotoCapture = (e, autoUpload = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
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

        if (autoUpload) {
          setIsUploadingPhoto(true);
          setPhotoUploadStatus(`Đang gửi ảnh Nhóm ${selectedGroup} lên máy chiếu...`);
          try {
            await classroomService.uploadGroupWork(selectedRoomCode, {
              groupNumber: selectedGroup,
              imageUrl: compressedDataUrl,
              caption: `Ảnh chụp bài làm Nhóm ${selectedGroup} từ Camera ĐT`
            });
            setPhotoUploadStatus(`Đã show bài Nhóm ${selectedGroup} lên màn hình thành công!`);
            setTimeout(() => {
              setCapturedPhotoUrl(null);
              setPhotoUploadStatus('');
            }, 3000);
          } catch (err) {
            console.error(err);
            setPhotoUploadStatus('Lỗi khi gửi ảnh!');
          } finally {
            setIsUploadingPhoto(false);
          }
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopLiveCamera(false);
    };
  }, []);

  // Switch SubTab (stops camera if leaving groupPhoto)
  const switchSubTab = (tab) => {
    if (tab !== 'groupPhoto' && isLiveStreaming) {
      stopLiveCamera(true);
    }
    setActiveSubTab(tab);
  };

  // Start Real-time Camera Stream to Web Projector
  const startLiveCamera = async (overrideFacing) => {
    try {
      setStreamError('');
      // Stop any existing stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }

      const facing = overrideFacing || cameraFacing;
      const constraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(console.warn);
      }

      setIsLiveStreaming(true);
      isStreamingRef.current = true;

      // Broadcast CAMERA_STATUS active
      classroomService.broadcastCameraStatus(selectedRoomCode, {
        isStreaming: true,
        groupNumber: selectedGroupRef.current
      });

      // Frame broadcasting loop (~10 fps: 100ms interval)
      let frameCount = 0;
      let lastFpsCheck = Date.now();

      streamIntervalRef.current = setInterval(() => {
        if (!isStreamingRef.current || !videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.videoWidth > 0 && video.videoHeight > 0) {
          const targetW = 640;
          const targetH = Math.round((video.videoHeight / video.videoWidth) * targetW) || 360;

          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }

          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, targetW, targetH);
          const frameData = canvas.toDataURL('image/jpeg', 0.65);

          classroomService.broadcastCameraFrame(selectedRoomCode, {
            groupNumber: selectedGroupRef.current,
            frameData: frameData,
            isStreaming: true
          });

          frameCount++;
          if (Date.now() - lastFpsCheck >= 1000) {
            setStreamFps(frameCount);
            frameCount = 0;
            lastFpsCheck = Date.now();
          }
        }
      }, 100);

    } catch (err) {
      console.error('Camera streaming error:', err);
      setStreamError('Không thể mở camera: ' + (err.message || 'Vui lòng cấp quyền máy ảnh'));
      setIsLiveStreaming(false);
      isStreamingRef.current = false;
    }
  };

  // Stop Real-time Camera Stream
  const stopLiveCamera = (notify = true) => {
    isStreamingRef.current = false;
    setIsLiveStreaming(false);
    setStreamFps(0);

    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (notify) {
      classroomService.broadcastCameraStatus(selectedRoomCode, {
        isStreaming: false,
        groupNumber: selectedGroupRef.current
      });
    }
  };

  // Flip front/rear camera
  const toggleFacingMode = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (isLiveStreaming) {
      startLiveCamera(nextFacing);
    }
  };

  // Change active group from mobile and sync to web
  const handleSelectGroup = (g) => {
    setSelectedGroup(g);
    selectedGroupRef.current = g;
    classroomService.broadcastCameraStatus(selectedRoomCode, {
      isStreaming: isLiveStreaming,
      groupNumber: g
    });
  };

  // Capture high-res snapshot from live stream and save as group submission
  const handleLiveSnapshotAndSave = async () => {
    if (!videoRef.current || !isLiveStreaming) return;
    const video = videoRef.current;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = video.videoWidth || 1280;
    snapCanvas.height = video.videoHeight || 720;
    const ctx = snapCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
    const highResDataUrl = snapCanvas.toDataURL('image/jpeg', 0.85);

    setIsUploadingPhoto(true);
    setPhotoUploadStatus(`Đang lưu ảnh bài làm Nhóm ${selectedGroup}...`);
    try {
      await classroomService.uploadGroupWork(selectedRoomCode, {
        groupNumber: selectedGroup,
        imageUrl: highResDataUrl,
        caption: `Ảnh chụp tài liệu bài làm Nhóm ${selectedGroup} qua Camera ĐT trực tiếp`
      });
      setPhotoUploadStatus(`Đã lưu bài làm Nhóm ${selectedGroup} thành công!`);
      setLiveSnapshotSuccess(true);
      setTimeout(() => {
        setLiveSnapshotSuccess(false);
        setPhotoUploadStatus('');
      }, 3000);
    } catch (err) {
      console.error('Snapshot save error:', err);
      setPhotoUploadStatus('Lỗi khi lưu bài: ' + (err.message || 'Thử lại'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Helper calculations for responses and tallies (deduplicated per student across cardId/studentId aliases)
  const responses = roomState?.responses || {};
  const sourceResponses = (roomState?.studentResponses && Object.keys(roomState.studentResponses).length > 0)
    ? roomState.studentResponses
    : responses;
  const seenStudentKeys = new Set();
  const uniqueResponses = [];
  Object.entries(sourceResponses).forEach(([k, r]) => {
    if (!r || !r.answer) return;
    const dedupKey = r.studentId || r.cardId || k;
    if (!seenStudentKeys.has(dedupKey)) {
      seenStudentKeys.add(dedupKey);
      uniqueResponses.push(r);
    }
  });
  const submittedCount = uniqueResponses.length;
  const totalStudents = studentsList.length || 32;
  const progressPercent = Math.min(100, Math.round((submittedCount / (totalStudents || 1)) * 100));

  const tally = { A: 0, B: 0, C: 0, D: 0 };
  uniqueResponses.forEach((r) => {
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
          currentQuestionIndex={currentQIndex}
          questions={LESSON_6_QUESTIONS}
          onNavigateQuestion={(idx) => handleNavigateQuestion(idx)}
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
            onClick={() => switchSubTab('hub')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeSubTab === 'hub' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            Bàn điều khiển
          </button>
          <button
            onClick={() => switchSubTab('groupPhoto')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'groupPhoto' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Soi Bài Nhóm</span>
            {isLiveStreaming && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
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

            {/* QUICK LAUNCH CTA: MỞ CAMERA CHỤP / SOI BÀI NHÓM LÊN MÀN HÌNH */}
            <button
              onClick={() => setActiveSubTab('group-camera')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 flex items-center justify-between transition-all transform active:scale-98 group border border-blue-300/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950/25 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black uppercase tracking-wide">
                    MỞ CAMERA SHOW BÀI NHÓM LÊN MÀN HÌNH
                  </div>
                  <div className="text-[11px] font-medium text-blue-100/90">
                    Chụp ảnh hoặc soi trực tiếp bài Nhóm 1–4 lên máy chiếu
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform shrink-0" />
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

                {currentQIndex < LESSON_6_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => handleNavigateQuestion(currentQIndex + 1)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1"
                  >
                    <span>Câu tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => classroomService.broadcastLeaderboard(selectedRoomCode, { showLeaderboard: true })}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-500/30 active:scale-95 transition-all"
                  >
                    <span>🏆 Bảng Vàng</span>
                  </button>
                )}
              </div>

              {/* Action Buttons: Chốt Đáp Án / Mở Lại / Công Bố Đáp Án */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {questionState === 'COLLECTING' ? (
                  <button
                    onClick={async () => {
                      setRoomState(prev => ({ ...prev, questionState: 'LOCKED' }));
                      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(80);
                      await classroomService.lockQuestion(selectedRoomCode);
                      refreshRoom(selectedRoomCode);
                    }}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    title="Khóa nhận đáp án câu hỏi hiện tại ngay lập tức"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Chốt đáp án</span>
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      setRoomState(prev => ({ ...prev, questionState: 'COLLECTING' }));
                      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(60);
                      await classroomService.setQuestion(selectedRoomCode, activeQ, 'COLLECTING');
                      refreshRoom(selectedRoomCode);
                    }}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    title="Mở lại nhận đáp án câu hỏi này"
                  >
                    <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mở lại nộp bài</span>
                  </button>
                )}

                <button
                  onClick={async () => {
                    setRoomState(prev => ({ ...prev, questionState: 'REVEALED' }));
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([60, 60, 100]);
                    await classroomService.revealAnswer(selectedRoomCode);
                    refreshRoom(selectedRoomCode);
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  title="Công bố đáp án đúng lên máy chiếu"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Công bố đáp án</span>
                </button>
              </div>

              {/* Master Classroom Summary & Leaderboard Trigger Button */}
              <button
                onClick={async () => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
                  await classroomService.broadcastLeaderboard(selectedRoomCode, { showLeaderboard: true });
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/35 text-amber-200 border border-amber-400/50 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>🏆 Bảng Thông Số Kết Thúc & Vinh Danh Top 1 2 3</span>
              </button>
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
                          questionState === 'REVEALED' ? (
                            <span className="px-1.5 py-0.5 rounded-md font-mono font-black text-xs bg-emerald-500 text-slate-950">
                              {resp.answer}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md font-mono font-bold text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                              ✓ Đã nộp
                            </span>
                          )
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
          /* SUBTAB: DOCUMENT CAMERA & GROUP WORK (SOI BÀI NHÓM A3/A4) */
          <div className="space-y-4">
            {/* Hidden canvas for frame extraction */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Header info banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  CAMERA VẬT THỂ • TRUYỀN LÊN MÁY CHIẾU
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Phòng: {selectedRoomCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Chọn nhóm bên dưới và bật Camera để soi trực tiếp tờ bài làm A3/A4 của nhóm đó lên ô máy chiếu trên lớp.
              </p>
            </div>

            {/* Group Selector Pills: 4 Nhóm */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>CHỌN NHÓM ĐANG SOI BÀI:</span>
                <span className="text-cyan-400 font-mono font-black text-xs">
                  Đang xem: Nhóm {selectedGroup}
                </span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleSelectGroup(g)}
                    className={`py-2.5 rounded-xl font-black text-xs border transition-all flex flex-col items-center justify-center gap-0.5 ${
                      selectedGroup === g
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-[1.03]'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>Nhóm {g}</span>
                    {selectedGroup === g && isLiveStreaming && (
                      <span className="text-[9px] font-bold text-slate-950 tracking-tight flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                        ĐANG CHIẾU
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* LIVE CAMERA STREAMING VIEWPORT */}
            <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-3.5 space-y-3 shadow-xl">
              {isLiveStreaming ? (
                <div className="space-y-3">
                  {/* Live Video Box */}
                  <div className="relative rounded-xl overflow-hidden bg-black border-2 border-cyan-400/80 shadow-inner max-h-[55vh] flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto max-h-[55vh] object-contain"
                    />

                    {/* HUD Overlay: Live Badge & FPS */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-600/90 text-white font-mono font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        LIVE NHÓM {selectedGroup}
                      </span>
                      {streamFps > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-emerald-400 font-mono text-[10px] font-bold border border-slate-700">
                          {streamFps} FPS
                        </span>
                      )}
                    </div>

                    {/* Camera Flip Button */}
                    <button
                      onClick={toggleFacingMode}
                      className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-cyan-300 border border-cyan-500/50 shadow-md active:scale-95 transition-all"
                      title="Đổi camera trước / sau"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Document Targeting Crosshairs */}
                    <div className="absolute inset-4 pointer-events-none border border-cyan-400/30 rounded-lg flex flex-col justify-between p-2">
                      <div className="flex justify-between">
                        <span className="w-3 h-3 border-t-2 border-l-2 border-cyan-400"></span>
                        <span className="w-3 h-3 border-t-2 border-r-2 border-cyan-400"></span>
                      </div>
                      <div className="text-center font-bold text-[10px] text-cyan-300/80 bg-slate-950/60 py-0.5 px-2 rounded mx-auto backdrop-blur-sm">
                        Đang truyền hình ảnh Nhóm {selectedGroup} lên máy chiếu
                      </div>
                      <div className="flex justify-between">
                        <span className="w-3 h-3 border-b-2 border-l-2 border-cyan-400"></span>
                        <span className="w-3 h-3 border-b-2 border-r-2 border-cyan-400"></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions when Streaming */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Snapshot & Save Button */}
                    <button
                      onClick={handleLiveSnapshotAndSave}
                      disabled={isUploadingPhoto}
                      className="py-3 px-3 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all active:scale-98"
                    >
                      <Camera className="w-4 h-4 text-slate-950" />
                      <span>{isUploadingPhoto ? 'Đang lưu...' : `Chụp Lưu Bài Nhóm ${selectedGroup}`}</span>
                    </button>

                    {/* Stop Streaming Button */}
                    <button
                      onClick={() => stopLiveCamera(true)}
                      className="py-3 px-3 rounded-xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      <VideoOff className="w-4 h-4 text-rose-400" />
                      <span>Dừng Camera</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Card when Camera is Stopped: Big Launch CTA */
                <div className="space-y-3 text-center py-2">
                  <button
                    onClick={() => startLiveCamera()}
                    className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2.5 transform active:scale-98 transition-all border border-cyan-200/40"
                  >
                    <Video className="w-5 h-5 text-slate-950 animate-pulse" />
                    <span>BẬT CAMERA TRỰC TIẾP LÊN MÁY CHIẾU</span>
                  </button>

                  <p className="text-[11px] text-slate-400">
                    Máy chiếu sẽ tự động mở ô Camera cho <strong>Nhóm {selectedGroup}</strong>. Thầy cô lia máy soi bài, máy chiếu sẽ chuyển động theo thời gian thực.
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {streamError && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{streamError}</span>
                </div>
              )}

              {/* Status alerts */}
              {photoUploadStatus && (
                <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/60 rounded-xl text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{photoUploadStatus}</span>
                </div>
              )}
            </div>

            {/* QUICK NATIVE CAMERA CAPTURE & AUTO-SHOW (Works 100% on both HTTP LAN & HTTPS) */}
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-3.5 space-y-2.5 shadow-lg">
              <label className="cursor-pointer w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 active:scale-98 transition-all">
                <Camera className="w-5 h-5 text-slate-950" />
                <span>{isUploadingPhoto ? 'ĐANG GỬI LÊN MÀN HÌNH...' : `MỞ CAMERA ĐT CHỤP SHOW NHÓM ${selectedGroup}`}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handlePhotoCapture(e, true)}
                />
              </label>
              <p className="text-[11px] text-slate-400 text-center">
                Mở thẳng Camera điện thoại chụp 1 tấm và <strong>tự động chiếu ngay</strong> lên màn hình PC (chạy ổn định cả Wi-Fi nội bộ).
              </p>
            </div>

            {/* FALLBACK: TẢI ẢNH TỪ THƯ VIỆN ĐIỆN THOẠI NẾU KHÔNG DÙNG LIVE CAM */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                HOẶC CHỌN ẢNH CÓ SẴN TỪ THƯ VIỆN MÁY:
              </span>

              <label className="cursor-pointer w-full py-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/60 flex items-center justify-center gap-2 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition-all">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Chọn ảnh bài làm Nhóm {selectedGroup} từ máy...</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoCapture(e, false)}
                />
              </label>

              {capturedPhotoUrl && (
                <div className="space-y-2 pt-1">
                  <div className="rounded-xl overflow-hidden border border-slate-700 max-h-48 flex items-center justify-center bg-black">
                    <img
                      src={capturedPhotoUrl}
                      alt="Xem trước bài làm"
                      className="max-h-48 object-contain"
                    />
                  </div>
                  <button
                    onClick={handleUploadPhoto}
                    disabled={isUploadingPhoto}
                    className="w-full py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Gửi ảnh file Nhóm {selectedGroup} lên máy chiếu</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
