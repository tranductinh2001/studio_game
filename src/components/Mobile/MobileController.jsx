import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Image as ImageIcon, Send, RotateCw, Lock, Eye, 
  CheckCircle2, Sparkles, Smartphone, ChevronRight, Upload, RefreshCw
} from 'lucide-react';
import SmartScanner from '../Scanner/SmartScanner';
import { classroomService } from '../../services/classroomService';

export default function MobileController({ roomCode: propRoomCode = 'WB-601' }) {
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const roomCode = urlParams.get('room') || propRoomCode;

  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'groupPhoto' | 'quizControl'
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadStatus, setPhotoUploadStatus] = useState('');
  const [roomState, setRoomState] = useState(null);

  // Load and subscribe to room
  useEffect(() => {
    classroomService.getRoom(roomCode).then(setRoomState);
    const unsubscribe = classroomService.subscribeToRoom(roomCode, (event) => {
      if (event.type === 'ROOM_STATE' || event.type === 'QUESTION_UPDATED' || event.type === 'QUESTION_LOCKED' || event.type === 'ANSWER_REVEALED') {
        classroomService.getRoom(roomCode).then(setRoomState);
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
        // Compress client-side to max 1400px width/height to guarantee instant upload
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

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Mobile Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-cyan-300">ĐIỀU KHIỂN GIÁO VIÊN</h3>
            <p className="text-[10px] text-slate-400">
              Phòng: <span className="font-mono text-cyan-400 font-bold">{roomCode}</span> • <span className="text-emerald-400 font-bold">{roomState?.className || 'Lớp 6A'}</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'scanner' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Quét QR
          </button>
          <button
            onClick={() => setActiveTab('groupPhoto')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'groupPhoto' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Chụp A3/A4
          </button>
          <button
            onClick={() => setActiveTab('quizControl')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'quizControl' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Câu hỏi
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'scanner' && (
          <div className="h-full">
            <SmartScanner roomCode={roomCode} />
          </div>
        )}

        {activeTab === 'groupPhoto' && (
          <div className="p-4 space-y-4 max-w-lg mx-auto">
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
                    Hỗ trợ máy ảnh sau hoặc chọn từ thư viện
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
          </div>
        )}

        {activeTab === 'quizControl' && (
          <div className="p-4 space-y-4 max-w-lg mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-sm text-slate-200">
                ĐIỀU KHIỂN CÂU HỎI TRÊN MÁY CHIẾU
              </h4>

              {roomState?.activeQuestion ? (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <span className="text-cyan-400 font-bold block">
                    {roomState.activeQuestion.questionText}
                  </span>
                  <div className="text-[11px] text-slate-400">
                    Trạng thái: <span className="font-bold text-white">{roomState.questionState}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Chưa có câu hỏi nào đang hoạt động.</p>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => classroomService.lockQuestion(roomCode)}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Khóa nộp bài
                </button>
                <button
                  onClick={() => classroomService.revealAnswer(roomCode)}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Công bố đáp án
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

