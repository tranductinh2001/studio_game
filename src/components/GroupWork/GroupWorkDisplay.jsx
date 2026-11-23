import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2,
  CheckCircle2, Star, Lightbulb, AlertCircle, RefreshCw, Columns, Grid,
  Camera, Smartphone, Video, QrCode, Check, Send, Sparkles, ExternalLink, Play, Pause
} from 'lucide-react';
import { classroomService } from '../../services/classroomService';
import QRCode from 'qrcode';

export default function GroupWorkDisplay({ roomCode = 'WB-601' }) {
  const [groups, setGroups] = useState({
    1: null,
    2: null,
    3: null,
    4: null
  });
  
  // Active selected group to view in the 1 Camera Box: 1 | 2 | 3 | 4
  const [selectedGroup, setSelectedGroup] = useState(1);
  // View mode: 'camera' (1 Central Live Camera Stage) | 'grid' (4 groups) | 'compare' (2 groups side-by-side)
  const [viewMode, setViewMode] = useState('camera');
  const [compareGroups, setCompareGroups] = useState([1, 2]);

  // Live Mobile Camera Streaming States
  const [isPhoneStreaming, setIsPhoneStreaming] = useState(false);
  const [liveFrameData, setLiveFrameData] = useState(null);
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const [streamGroup, setStreamGroup] = useState(1);
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);

  // Zoom, Rotate & Fullscreen
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isCameraFullscreen, setIsCameraFullscreen] = useState(false);
  const [activeModalGroup, setActiveModalGroup] = useState(null);

  // Teacher feedback states
  const [ratings, setRatings] = useState({});
  const [notes, setNotes] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  // Connect Phone QR Modal state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [mobileUrl, setMobileUrl] = useState('');

  const cameraContainerRef = useRef(null);

  // Generate QR Code for Phone Connection
  useEffect(() => {
    classroomService.getNetworkInfo().then((info) => {
      const url = info.mobileConnectUrl || `${window.location.origin}/?tab=mobile-controller&room=${roomCode}`;
      setMobileUrl(url);
      QRCode.toDataURL(url, { width: 300, margin: 1 }, (err, dataUrl) => {
        if (!err && dataUrl) setQrCodeDataUrl(dataUrl);
      });
    }).catch(() => {
      const url = `${window.location.origin}/?tab=mobile-controller&room=${roomCode}`;
      setMobileUrl(url);
      QRCode.toDataURL(url, { width: 300, margin: 1 }, (err, dataUrl) => {
        if (!err && dataUrl) setQrCodeDataUrl(dataUrl);
      });
    });
  }, [roomCode]);

  // Sync Room State & Listen for Live Camera Stream via SSE & BroadcastChannel
  useEffect(() => {
    // 1. Initial Room Fetch
    classroomService.getRoom(roomCode).then((room) => {
      if (room && room.groupWorks) {
        setGroups(prev => ({ ...prev, ...room.groupWorks }));
      }
    });

    // 2. Subscribe to Room Events
    const unsubscribe = classroomService.subscribeToRoom(roomCode, (event) => {
      if (!event) return;

      // Group photo submission
      if (event.type === 'GROUP_WORK_SUBMITTED' || event.type === 'ROOM_STATE') {
        const payload = event.payload;
        if (payload?.groupWorks) {
          setGroups(prev => ({ ...prev, ...payload.groupWorks }));
        } else if (payload?.groupNumber) {
          setGroups(prev => ({ ...prev, [payload.groupNumber]: payload }));
        }
      }

      // Mobile Device Joined
      if (event.type === 'DEVICE_JOINED') {
        setIsPhoneConnected(true);
      }

      // Live Camera Frame received from phone
      if (event.type === 'CAMERA_FRAME') {
        const payload = event.payload;
        if (payload && payload.frameData) {
          setLiveFrameData(payload.frameData);
          setIsPhoneStreaming(true);
          setIsPhoneConnected(true);
          setLastFrameTime(Date.now());
          if (payload.groupNumber) {
            setStreamGroup(payload.groupNumber);
            setSelectedGroup(payload.groupNumber);
          }
        }
      }

      // Live Camera Status change from phone
      if (event.type === 'CAMERA_STATUS') {
        const payload = event.payload;
        if (payload) {
          setIsPhoneStreaming(!!payload.isStreaming);
          setIsPhoneConnected(true);
          if (payload.groupNumber) {
            setStreamGroup(payload.groupNumber);
            setSelectedGroup(payload.groupNumber);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Check if camera stream is active or has timed out (no frame in 3.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPhoneStreaming && Date.now() - lastFrameTime > 3500) {
        setIsPhoneStreaming(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPhoneStreaming, lastFrameTime]);

  // Switch selected group on Web & broadcast to Mobile
  const handleSelectGroup = (gNum) => {
    setSelectedGroup(gNum);
    setZoomLevel(1);
    setRotation(0);
    // Broadcast to mobile so phone also switches to this group!
    classroomService.broadcastCameraStatus(roomCode, {
      isStreaming: isPhoneStreaming,
      groupNumber: gNum
    });
  };

  // Capture snapshot from Live Camera feed directly on Web
  const handleSnapshotCurrentGroup = async () => {
    const frame = liveFrameData || groups[selectedGroup]?.imageUrl;
    if (!frame) return;

    setIsUploading(true);
    try {
      await classroomService.uploadGroupWork(roomCode, {
        groupNumber: selectedGroup,
        imageUrl: frame,
        caption: `Ảnh chụp trực tiếp bài làm Nhóm ${selectedGroup} trên máy chiếu`
      });
      setSnapshotSuccess(true);
      setTimeout(() => setSnapshotSuccess(false), 2500);
    } catch (err) {
      console.error('Snapshot error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle local desktop file upload
  const handleLocalUpload = (groupNum, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target.result;
      try {
        await classroomService.uploadGroupWork(roomCode, {
          groupNumber: groupNum,
          imageUrl: base64Url,
          caption: `Bài làm giấy A3/A4 - Nhóm ${groupNum}`
        });
      } catch (err) {
        console.error('Upload error:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSetRating = (groupNum, rating) => {
    setRatings(prev => ({ ...prev, [groupNum]: rating }));
  };

  // Toggle fullscreen for camera view
  const toggleCameraFullscreen = () => {
    if (!document.fullscreenElement) {
      if (cameraContainerRef.current?.requestFullscreen) {
        cameraContainerRef.current.requestFullscreen();
        setIsCameraFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsCameraFullscreen(false);
      }
    }
  };

  const currentGroupSavedItem = groups[selectedGroup];

  return (
    <div className="w-full h-full flex flex-col bg-[#020617] text-white overflow-hidden p-2 sm:p-4 font-sans select-none">
      
      {/* 1. TOP HEADER & TWO-WAY CONNECTION TOOLBAR */}
      <header className="px-3 sm:px-4 py-2.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg z-20">
        
        {/* Left: Module Badge & Room Code */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <Camera className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                A3 / A4 GROUP WORK
              </span>
              <h2 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-white uppercase">
                CAMERA VẬT THỂ SOI BÀI NHÓM TRỰC TIẾP
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              Phòng: <span className="font-mono text-cyan-300 font-bold">{roomCode}</span> • Kết nối 2 chiều không dây với điện thoại giáo viên
            </p>
          </div>
        </div>

        {/* Center: Live Camera Streaming Status Pill */}
        <div className="flex items-center gap-2">
          {isPhoneStreaming ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border-2 border-red-500/80 text-xs font-black text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span>🔴 ĐANG SOI TRỰC TIẾP TỪ ĐIỆN THOẠI • NHÓM {selectedGroup}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300">
              <span className={`w-2 h-2 rounded-full ${isPhoneConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>{isPhoneConnected ? '📱 Điện thoại đã kết nối' : '📡 Chờ kết nối điện thoại'}</span>
            </div>
          )}

          {/* Quick Connect Mobile QR Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-all border border-cyan-500/30 shadow-md"
            title="Mở mã QR kết nối điện thoại"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kết nối ĐT</span>
          </button>
        </div>

        {/* Right: View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('camera')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all ${
              viewMode === 'camera'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Ô Camera Trực Tiếp</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Lưới 4 Nhóm</span>
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'compare'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>So Sánh</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 min-h-0 py-2.5 flex flex-col overflow-hidden">
        
        {/* ========================================================================= */}
        {/* VIEW 1: THE DEDICATED 1 CENTRAL CAMERA STAGE (CHỈ CẦN 1 Ô CAMERA)        */}
        {/* ========================================================================= */}
        {viewMode === 'camera' && (
          <div className="flex-1 flex flex-col min-h-0 gap-3">
            
            {/* Top Selector Bar: Tabs Nhóm 1, 2, 3, 4 */}
            <div className="flex items-center justify-between bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 hidden sm:inline">Chọn nhóm xem bài:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((gNum) => {
                    const isSelected = selectedGroup === gNum;
                    const hasSubmitted = !!groups[gNum]?.imageUrl;
                    return (
                      <button
                        key={gNum}
                        onClick={() => handleSelectGroup(gNum)}
                        className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all transform active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                          isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {gNum}
                        </span>
                        <span>Nhóm {gNum}</span>
                        {hasSubmitted && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Snapshot, Zoom, Rotate, Fullscreen */}
              <div className="flex items-center gap-1.5">
                {isPhoneStreaming && (
                  <button
                    onClick={handleSnapshotCurrentGroup}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition-all transform active:scale-95"
                    title="Chụp lưu lại bài làm của nhóm đang soi"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{snapshotSuccess ? '✓ Đã lưu bài!' : `Lưu bài Nhóm ${selectedGroup}`}</span>
                  </button>
                )}

                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                  className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
                  title="Phóng to"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                  className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
                  title="Xoay ảnh 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleCameraFullscreen}
                  className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
                  title="Toàn màn hình máy chiếu"
                >
                  {isCameraFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* THE ONE SINGLE CAMERA VIEW BOX (Aspect 16:9 Stage) */}
            <div 
              ref={cameraContainerRef}
              className="flex-1 bg-slate-950/90 rounded-3xl border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col justify-between overflow-hidden relative"
            >
              
              {/* Corner Watermark / Group HUD */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
                <span className="px-3 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-400/50 text-cyan-300 text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                  BÀI LÀM NHÓM {selectedGroup}
                </span>

                {isPhoneStreaming ? (
                  <span className="px-2.5 py-1 rounded-xl bg-red-950/90 border border-red-500 text-red-300 text-xs font-black animate-pulse shadow-md">
                    🔴 LIVE STREAM
                  </span>
                ) : currentGroupSavedItem ? (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-bold shadow-md">
                    ✓ ẢNH ĐÃ LƯU
                  </span>
                ) : null}
              </div>

              {/* Main Camera Display Canvas */}
              <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
                {isPhoneStreaming && liveFrameData ? (
                  /* 1. REAL-TIME LIVE STREAM FROM MOBILE */
                  <div className="w-full h-full flex items-center justify-center relative">
                    <img
                      src={liveFrameData}
                      alt={`Live Camera Nhóm ${selectedGroup}`}
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transition: 'transform 0.15s ease-out'
                      }}
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                    />

                    {/* Camera Targeting Reticle Grid */}
                    <div className="absolute inset-4 sm:inset-10 border border-cyan-400/20 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between text-[10px] font-mono text-cyan-400/50">
                        <span>[CAM_LIVE_720P]</span>
                        <span>[A3_A4_STAGED]</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-cyan-400/50">
                        <span>ZOOM: {Math.round(zoomLevel * 100)}%</span>
                        <span>XOAY: {rotation}°</span>
                      </div>
                    </div>
                  </div>
                ) : currentGroupSavedItem && currentGroupSavedItem.imageUrl ? (
                  /* 2. SAVED SNAPSHOT PHOTO OF THIS GROUP */
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={currentGroupSavedItem.imageUrl}
                      alt={`Bài làm nhóm ${selectedGroup}`}
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transition: 'transform 0.15s ease-out'
                      }}
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                    />
                  </div>
                ) : (
                  /* 3. STANDBY PROMPT: HOW TO VIEW THIS GROUP */
                  <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto">
                    <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border-2 border-dashed border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-xl">
                      <Smartphone className="w-10 h-10 animate-bounce" />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-slate-100">
                        CHƯA BẬT CAMERA CHO NHÓM {selectedGroup}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        Thầy cô dùng điện thoại (quét mã QR) ➜ chọn <strong>"Nhóm {selectedGroup}"</strong> ➜ bấm <strong>"BẬT CAMERA TRỰC TIẾP"</strong> để soi bài làm giấy của nhóm này lên máy chiếu!
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setShowQrModal(true)}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Mở Mã QR Điện Thoại</span>
                      </button>

                      <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all">
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>Tải ảnh từ máy tính</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLocalUpload(selectedGroup, e)}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick Reaction & Notes Bar for Selected Group */}
              <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs shrink-0 z-10">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">Đánh giá nhanh:</span>
                  <button
                    onClick={() => handleSetRating(selectedGroup, '⭐ Xuất sắc')}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                      ratings[selectedGroup] === '⭐ Xuất sắc'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-950 hover:bg-slate-800 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    ⭐ Xuất sắc
                  </button>
                  <button
                    onClick={() => handleSetRating(selectedGroup, '💡 Sáng tạo')}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                      ratings[selectedGroup] === '💡 Sáng tạo'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                        : 'bg-slate-950 hover:bg-slate-800 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    💡 Sáng tạo
                  </button>
                  <button
                    onClick={() => handleSetRating(selectedGroup, '🎯 Đầy đủ')}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                      ratings[selectedGroup] === '🎯 Đầy đủ'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-950 hover:bg-slate-800 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    🎯 Đầy đủ
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-1.5 font-medium">
                  <span>💡</span>
                  <span>Điện thoại đang soi nhóm nào, máy chiếu tự động chuyển sang nhóm đó!</span>
                </div>
              </div>

            </div>

            {/* Bottom 4-Group Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2.5 shrink-0">
              {[1, 2, 3, 4].map((gNum) => {
                const isSelected = selectedGroup === gNum;
                const item = groups[gNum];
                const rating = ratings[gNum];

                return (
                  <div
                    key={gNum}
                    onClick={() => handleSelectGroup(gNum)}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-md ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 shadow-cyan-500/20 ring-1 ring-cyan-400'
                        : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isSelected ? 'bg-cyan-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {gNum}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          Nhóm {gNum}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {isSelected ? 'Đang soi ở trên' : item ? 'Đã có bài nộp' : 'Chưa có bài'}
                        </span>
                      </div>
                    </div>

                    {rating ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        {rating}
                      </span>
                    ) : item?.imageUrl ? (
                      <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                        ✓ Đã lưu
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: GRID VIEW (LƯỚI 4 NHÓM)                                           */}
        {/* ========================================================================= */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 h-full">
            {[1, 2, 3, 4].map((gNum) => {
              const item = groups[gNum];
              const rating = ratings[gNum];
              return (
                <div 
                  key={gNum} 
                  className="flex flex-col bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all shadow-xl group"
                >
                  <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/70 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black flex items-center justify-center border border-cyan-400/40">
                        {gNum}
                      </span>
                      <span className="text-xs font-bold text-slate-200">Nhóm {gNum}</span>
                    </div>

                    {rating && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        {rating}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden min-h-[160px]">
                    {item && item.imageUrl ? (
                      <>
                        <img 
                          src={item.imageUrl} 
                          alt={`Bài làm nhóm ${gNum}`} 
                          className="max-w-full max-h-full object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
                          onClick={() => {
                            setSelectedGroup(gNum);
                            setViewMode('camera');
                          }}
                        />
                        <button
                          onClick={() => {
                            setSelectedGroup(gNum);
                            setViewMode('camera');
                          }}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-950/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-slate-700 transition-all shadow-md"
                          title="Mở sang Ô Camera Soi Chi Tiết"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
                        <ImageIcon className="w-10 h-10 stroke-[1.2] text-slate-600" />
                        <p className="text-xs">Chưa có bài nộp</p>
                        <button
                          onClick={() => {
                            setSelectedGroup(gNum);
                            setViewMode('camera');
                          }}
                          className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40"
                        >
                          Bật Camera Soi Nhóm {gNum}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-2 bg-slate-950/50 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleSetRating(gNum, '⭐ Xuất sắc')}
                        className="px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/20 transition-all"
                      >
                        ⭐ Tốt
                      </button>
                      <button 
                        onClick={() => handleSetRating(gNum, '💡 Sáng tạo')}
                        className="px-1.5 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] border border-cyan-500/20 transition-all"
                      >
                        💡 Đẹp
                      </button>
                    </div>

                    <label className="cursor-pointer text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-0.5">
                      <Upload className="w-2.5 h-2.5" />
                      Tải ảnh
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleLocalUpload(gNum, e)}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: COMPARE VIEW (SO SÁNH 2 NHÓM)                                      */}
        {/* ========================================================================= */}
        {viewMode === 'compare' && (
          <div className="flex flex-col h-full gap-2">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-semibold">Chọn 2 nhóm so sánh:</span>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-bold">Vế Trái:</span>
                  <select 
                    value={compareGroups[0]} 
                    onChange={(e) => setCompareGroups([Number(e.target.value), compareGroups[1]])}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-bold"
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>Nhóm {n}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300 font-bold">Vế Phải:</span>
                  <select 
                    value={compareGroups[1]} 
                    onChange={(e) => setCompareGroups([compareGroups[0], Number(e.target.value)])}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-purple-300 font-bold"
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>Nhóm {n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
              {compareGroups.map((gNum, idx) => {
                const item = groups[gNum];
                const themeColor = idx === 0 ? 'cyan' : 'purple';
                return (
                  <div 
                    key={gNum}
                    className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-full"
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full bg-${themeColor}-500/20 text-${themeColor}-300 font-bold flex items-center justify-center border border-${themeColor}-400/40 text-xs`}>
                          {gNum}
                        </span>
                        <h3 className="font-bold text-sm text-slate-100">Bài làm Nhóm {gNum}</h3>
                      </div>
                      <span className="text-xs text-slate-400">
                        {item ? 'Đã có ảnh' : 'Chưa có ảnh'}
                      </span>
                    </div>

                    <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden p-2">
                      {item && item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={`Nhóm ${gNum}`} 
                          className="max-w-full max-h-full object-contain cursor-pointer"
                          onClick={() => {
                            setSelectedGroup(gNum);
                            setViewMode('camera');
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                          <ImageIcon className="w-12 h-12 stroke-[1.2] text-slate-600" />
                          <p className="text-xs">Chưa có bài nộp</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* 3. QR CONNECT MODAL FOR TEACHER PHONE */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-cyan-300 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                KẾT NỐI CAMERA ĐIỆN THOẠI
              </h3>
              <button 
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Dùng camera điện thoại hoặc Zalo quét mã QR này để mở điều khiển &amp; truyền camera trực tiếp:
            </p>

            {qrCodeDataUrl ? (
              <div className="p-3 bg-white rounded-2xl inline-block shadow-inner">
                <img src={qrCodeDataUrl} alt="QR Code Kết Nối" className="w-56 h-56 mx-auto" />
              </div>
            ) : (
              <div className="w-56 h-56 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            )}

            <div className="text-xs font-mono text-cyan-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 break-all select-all">
              {mobileUrl}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
            >
              Đã hiểu, đóng cửa sổ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
