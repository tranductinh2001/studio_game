import React, { useState, useEffect } from 'react';
import { 
  Upload, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, Maximize2, 
  CheckCircle2, Star, Lightbulb, AlertCircle, RefreshCw, Columns, Grid
} from 'lucide-react';
import { classroomService } from '../../services/classroomService';

export default function GroupWorkDisplay({ roomCode = 'WB-601' }) {
  const [groups, setGroups] = useState({
    1: null,
    2: null,
    3: null,
    4: null
  });
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'compare' | 'single'
  const [compareGroups, setCompareGroups] = useState([1, 2]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeModalGroup, setActiveModalGroup] = useState(null);
  const [ratings, setRatings] = useState({});
  const [notes, setNotes] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Sync with Room State via SSE
  useEffect(() => {
    // Initial fetch
    classroomService.getRoom(roomCode).then((room) => {
      if (room && room.groupWorks) {
        setGroups(prev => ({ ...prev, ...room.groupWorks }));
      }
    });

    // Subscribe to SSE
    const unsubscribe = classroomService.subscribeToRoom(roomCode, (event) => {
      if (event.type === 'GROUP_WORK_SUBMITTED' || event.type === 'ROOM_STATE') {
        const payload = event.payload;
        if (payload.groupWorks) {
          setGroups(prev => ({ ...prev, ...payload.groupWorks }));
        } else if (payload.groupNumber) {
          setGroups(prev => ({ ...prev, [payload.groupNumber]: payload }));
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

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

  const handleSetNote = (groupNum, text) => {
    setNotes(prev => ({ ...prev, [groupNum]: text }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden p-3 sm:p-5">
      {/* Top Header / Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ImageIcon className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-300">
              TRÌNH CHIẾU BÀI LÀM NHÓM (A3 / A4)
            </h2>
            <p className="text-xs text-slate-400">
              Chụp ảnh bài giấy từ điện thoại hoặc tải lên trực tiếp • Phòng: <span className="text-cyan-400 font-mono font-bold">{roomCode}</span>
            </p>
          </div>
        </div>

        {/* View Switcher: Grid vs Compare */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid' 
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' 
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Grid className="w-4 h-4" />
            Lưới 4 Nhóm
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'compare' 
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' 
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Columns className="w-4 h-4" />
            So sánh 2 Nhóm
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 py-3 overflow-hidden">
        {viewMode === 'grid' ? (
          // GRID VIEW: 4 GROUPS
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 h-full">
            {[1, 2, 3, 4].map((gNum) => {
              const item = groups[gNum];
              const rating = ratings[gNum];
              return (
                <div 
                  key={gNum} 
                  className="flex flex-col bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all shadow-xl group"
                >
                  {/* Card Header */}
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

                  {/* Poster Image Container */}
                  <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden min-h-[160px]">
                    {item && item.imageUrl ? (
                      <>
                        <img 
                          src={item.imageUrl} 
                          alt={`Bài làm nhóm ${gNum}`} 
                          className="max-w-full max-h-full object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
                          onClick={() => {
                            setActiveModalGroup(gNum);
                            setZoomLevel(1);
                            setRotation(0);
                          }}
                        />
                        <button
                          onClick={() => {
                            setActiveModalGroup(gNum);
                            setZoomLevel(1);
                            setRotation(0);
                          }}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-950/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-slate-700 transition-all shadow-md"
                          title="Phóng to chi tiết"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
                        <ImageIcon className="w-10 h-10 stroke-[1.2] text-slate-600" />
                        <p className="text-xs">Chưa có bài nộp</p>
                        <label className="cursor-pointer px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 border border-slate-700 flex items-center gap-1 transition-all">
                          <Upload className="w-3 h-3" />
                          Tải ảnh từ máy tính
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleLocalUpload(gNum, e)}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Footer: Quick Teacher Reactions */}
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

                    {item && (
                      <label className="cursor-pointer text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-0.5">
                        <Upload className="w-2.5 h-2.5" />
                        Thay ảnh
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleLocalUpload(gNum, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // COMPARE VIEW: 2 GROUPS SIDE-BY-SIDE
          <div className="flex flex-col h-full gap-2">
            {/* Group Selector for Comparison */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-semibold">Chọn 2 nhóm so sánh:</span>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-bold">Vế Trái:</span>
                  <select 
                    value={compareGroups[0]} 
                    onChange={(e) => setCompareGroups([Number(e.target.value), compareGroups[1]])}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300"
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>Nhóm {n}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300 font-bold">Vế Phải:</span>
                  <select 
                    value={compareGroups[1]} 
                    onChange={(e) => setCompareGroups([compareGroups[0], Number(e.target.value)])}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-purple-300"
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>Nhóm {n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 2 Split Columns */}
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
                        {item ? 'Đã nộp' : 'Chưa có ảnh'}
                      </span>
                    </div>

                    <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden p-2">
                      {item && item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={`Nhóm ${gNum}`} 
                          className="max-w-full max-h-full object-contain cursor-pointer"
                          onClick={() => {
                            setActiveModalGroup(gNum);
                            setZoomLevel(1);
                            setRotation(0);
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                          <ImageIcon className="w-12 h-12 stroke-[1.2] text-slate-600" />
                          <p className="text-xs">Chưa có bài nộp</p>
                          <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            Tải ảnh bài làm
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleLocalUpload(gNum, e)}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN ZOOM / PAN / ROTATE MODAL */}
      {activeModalGroup && groups[activeModalGroup] && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40 text-sm">
                BÀI LÀM NHÓM {activeModalGroup}
              </span>
              <span className="text-xs text-slate-400">
                Chế độ xem chi tiết trên máy chiếu
              </span>
            </div>

            {/* Action Tools: Zoom +, Zoom -, Rotate 90, Close */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200"
                title="Xoay ảnh 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setZoomLevel(1); setRotation(0); }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
                title="Đặt lại"
              >
                100%
              </button>
              <button 
                onClick={() => setActiveModalGroup(null)}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold hover:bg-red-500/30 ml-2"
              >
                Đóng
              </button>
            </div>
          </div>

          {/* Modal Image Body with Zoom & Rotation */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-4">
            <img 
              src={groups[activeModalGroup].imageUrl} 
              alt={`Bài làm nhóm ${activeModalGroup}`}
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
              className="max-w-[90%] max-h-[85vh] object-contain shadow-2xl rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

