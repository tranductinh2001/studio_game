import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Search, Filter, Layers, Clock, Sparkles,
  Play, Edit3, Copy, Trash2, CheckCircle2, AlertCircle, FileText,
  ChevronRight, Calendar, ArrowUpDown, MonitorPlay, ExternalLink, X, Tag
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';

export default function CurriculumLibrary({
  onSelectLessonToPresent,
  onOpenCreator,
  onOpenEditor
}) {
  const [lessons, setLessons] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // 'updated' | 'created' | 'lessonNumber'
  const [activeLessonId, setActiveLessonId] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [deletingLesson, setDeletingLesson] = useState(null);

  // Load and subscribe to curriculum changes
  useEffect(() => {
    const refresh = () => {
      const all = curriculumService.getLessons({
        grade: selectedGrade,
        subject: selectedSubject,
        search: searchQuery,
        sortBy
      });
      setLessons(all);
      const active = curriculumService.getActiveLesson();
      if (active) setActiveLessonId(active.id);
    };

    refresh();
    const unsubscribe = curriculumService.subscribe(refresh);
    return () => unsubscribe();
  }, [selectedGrade, selectedSubject, searchQuery, sortBy]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Actions
  const handlePresent = (lesson) => {
    curriculumService.setActiveLesson(lesson.id);
    setActiveLessonId(lesson.id);
    if (onSelectLessonToPresent) {
      onSelectLessonToPresent(lesson);
    }
  };

  const handleDuplicate = (lessonId) => {
    const dup = curriculumService.duplicateLesson(lessonId);
    if (dup) {
      showToast(`Đã nhân bản thành công: ${dup.title}`);
    }
  };

  const confirmDelete = () => {
    if (!deletingLesson) return;
    const ok = curriculumService.deleteLesson(deletingLesson.id);
    if (ok) {
      showToast(`Đã xóa bài giảng: ${deletingLesson.title}`);
    }
    setDeletingLesson(null);
  };

  // Unique subjects and grades in database for dynamic filter
  const allLessons = curriculumService.getLessons();
  const availableGrades = Array.from(new Set(allLessons.map(l => Number(l.grade)))).sort((a, b) => a - b);
  const totalPeriods = allLessons.reduce((acc, l) => acc + (Number(l.periodsCount) || 1), 0);
  const completedCount = allLessons.filter(l => l.status === 'completed').length;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden font-sans select-none">
      
      {/* 1. TOP HEADER & METRIC SUMMARY */}
      <div className="p-4 sm:p-6 pb-3 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Title & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  HỆ THỐNG QUẢN LÝ BÀI GIẢNG ĐA KHỐI LỚP
                </span>
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                  THCS Đắk Trôi • Thầy Trần Đức Tình
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-amber-300">
                THƯ VIỆN BÀI GIẢNG &amp; THIẾT KẾ SLIDE AI
              </h1>
            </div>
          </div>

          {/* Quick Creator CTA Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={onOpenCreator}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>TẠO BÀI GIẢNG MỚI (AI)</span>
            </button>
          </div>
        </div>

        {/* Metric Counter Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-4 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3 rounded-2xl flex items-center gap-3 shadow">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black text-xs">
              📚
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Tổng Bài Giảng</div>
              <div className="text-base sm:text-lg font-black text-white">{allLessons.length} Bài học</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3 rounded-2xl flex items-center gap-3 shadow">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-black text-xs">
              🎓
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Khối Lớp Quản Lý</div>
              <div className="text-base sm:text-lg font-black text-indigo-300">{availableGrades.map(g => `Lớp ${g}`).join(', ')}</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3 rounded-2xl flex items-center gap-3 shadow">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-xs">
              ⏱️
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Tổng Số Tiết Dạy</div>
              <div className="text-base sm:text-lg font-black text-amber-300">{totalPeriods} Tiết học</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3 rounded-2xl flex items-center gap-3 shadow">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-xs">
              ✨
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Trạng Thái Sẵn Sàng</div>
              <div className="text-base sm:text-lg font-black text-emerald-400">{completedCount} Hoàn thiện</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER STRIP: GRADE TABS, SEARCH & SORT */}
      <div className="px-4 sm:px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Grade Tabs: ALL, 6, 7, 8, 9 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Khối lớp:</span>
          </span>

          <button
            onClick={() => setSelectedGrade('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              selectedGrade === 'ALL'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Tất cả ({allLessons.length})
          </button>

          {[6, 7, 8, 9].map((g) => {
            const count = allLessons.filter(l => Number(l.grade) === g).length;
            const isSelected = selectedGrade === String(g) || selectedGrade === g;
            return (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>Lớp {g}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/40 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input & Sort Dropdown */}
        <div className="flex items-center gap-2.5 flex-1 sm:flex-initial justify-end">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài, số bài..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-cyan-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="updated" className="bg-slate-900 text-white">Mới cập nhật</option>
              <option value="lessonNumber" className="bg-slate-900 text-white">Thứ tự bài học</option>
              <option value="created" className="bg-slate-900 text-white">Ngày tạo</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. MAIN LESSONS GRID */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {lessons.length === 0 ? (
          <div className="w-full h-80 rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center text-3xl">
              📂
            </div>
            <h3 className="text-base font-bold text-slate-300">
              Không tìm thấy bài giảng nào cho bộ lọc hiện tại
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              Chưa có bài giảng nào của {selectedGrade === 'ALL' ? 'các khối lớp' : `Lớp ${selectedGrade}`} khớp với từ khóa tìm kiếm.
            </p>
            <button
              onClick={onOpenCreator}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo bài giảng mới cho Lớp {selectedGrade === 'ALL' ? '8' : selectedGrade} ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {lessons.map((lesson) => {
              const isCurrentActive = activeLessonId === lesson.id;
              const gradeColors = {
                6: 'from-cyan-500 to-blue-600 border-cyan-400/40 text-cyan-300',
                7: 'from-emerald-500 to-teal-600 border-emerald-400/40 text-emerald-300',
                8: 'from-indigo-500 to-purple-600 border-indigo-400/40 text-indigo-300',
                9: 'from-amber-500 to-rose-600 border-amber-400/40 text-amber-300'
              };
              const theme = gradeColors[lesson.grade] || 'from-sky-500 to-indigo-600 border-sky-400/40 text-sky-300';

              return (
                <div
                  key={lesson.id}
                  data-lesson-id={lesson.id}
                  className={`group relative rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-950 border-2 transition-all duration-300 flex flex-col justify-between p-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                    isCurrentActive
                      ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-cyan-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Active Slide Badge Ribbon */}
                  {isCurrentActive && (
                    <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-[10px] shadow-md uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-slate-950" />
                      <span>ĐANG TRÌNH CHIẾU</span>
                    </div>
                  )}

                  <div>
                    {/* Top Row: Grade & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-950 border border-slate-700 text-white`}>
                          LỚP {lesson.grade}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/60">
                          {lesson.subject}
                        </span>
                      </div>

                      {lesson.isCoreLesson ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 flex items-center gap-1">
                          ⭐ Tiết Thao Giảng
                        </span>
                      ) : lesson.status === 'completed' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                          ✓ Hoàn thành
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
                          Bản nháp
                        </span>
                      )}
                    </div>

                    {/* Lesson Number & Title */}
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      BÀI {lesson.lessonNumber} • {lesson.periodsCount} TIẾT HỌC
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors mt-0.5 leading-snug line-clamp-2">
                      {lesson.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>

                    {/* Periods & Slide Chips */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {lesson.periodsCount} Tiết
                      </span>
                      <span className="flex items-center gap-1 font-semibold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                        <Layers className="w-3 h-3 text-cyan-400" />
                        {lesson.slideCount} Slides
                      </span>
                      <span className="flex items-center gap-1 font-semibold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                        <Tag className="w-3 h-3 text-indigo-400" />
                        v{lesson.version}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/90 flex items-center justify-between gap-1">
                    {/* Primary Button: Trình chiếu */}
                    <button
                      data-present-id={lesson.id}
                      onClick={() => handlePresent(lesson)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 ${
                        isCurrentActive
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                      }`}
                      title="Mở trình chiếu slide toàn màn hình cho tiết dạy"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCurrentActive ? 'ĐANG DẠY' : 'TRÌNH CHIẾU'}</span>
                    </button>

                    {/* Secondary Action: Duplicate */}
                    <button
                      onClick={() => handleDuplicate(lesson.id)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-all"
                      title="Nhân bản bài giảng"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Secondary Action: Delete */}
                    {!lesson.isCoreLesson && (
                      <button
                        onClick={() => setDeletingLesson(lesson)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 transition-all"
                        title="Xóa bài giảng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. DELETE CONFIRMATION MODAL */}
      {deletingLesson && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500/50 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center text-xl font-black">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">XÁC NHẬN XÓA BÀI GIẢNG</h3>
                <p className="text-xs text-slate-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-2xl border border-slate-800">
              Bạn có chắc chắn muốn xóa bài giảng: <span className="font-bold text-white block mt-1">"{deletingLesson.title}"</span>
              (Lớp {deletingLesson.grade} • Bài {deletingLesson.lessonNumber} • {deletingLesson.periodsCount} Tiết)?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingLesson(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
              >
                Xác nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
