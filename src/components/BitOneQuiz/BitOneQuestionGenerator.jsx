import React, { useState } from 'react';
import { 
  Sparkles, Plus, Trash2, Edit3, Save, Download, Upload, 
  CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Layers, RefreshCw
} from 'lucide-react';
import { classroomService } from '../../services/classroomService';

export default function BitOneQuestionGenerator({ onSelectQuestionForAssessment }) {
  const [subject, setSubject] = useState('Tin học');
  const [grade, setGrade] = useState('6');
  const [lesson, setLesson] = useState('Bài 6: Mạng thông tin toàn cầu');
  const [count, setCount] = useState(5);
  const [selectedTopics, setSelectedTopics] = useState([
    'Phân biệt Internet và WWW',
    'Khái niệm Website và Trang web',
    'Trang chủ và Siêu liên kết',
    'Trình duyệt Web'
  ]);
  const [selectedBloomLevels, setSelectedBloomLevels] = useState([
    'Nhận biết',
    'Thông hiểu',
    'Vận dụng'
  ]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Default seed questions for Lesson 6 (ready out-of-the-box!)
  const [questions, setQuestions] = useState([
    {
      id: 'Q_01',
      questionText: 'Mạng thông tin toàn cầu (World Wide Web - WWW) là gì?',
      options: {
        A: 'Là một mạng máy tính kết nối bằng cáp ngầm dưới biển',
        B: 'Là dịch vụ thông tin bao gồm các trang web liên kết với nhau được lưu trữ trên Internet',
        C: 'Là một phần mềm dùng để soạn thảo văn bản',
        D: 'Là chiếc máy tính chủ của Google đặt tại Mỹ'
      },
      correctAnswer: 'B',
      explanation: 'WWW là một dịch vụ thông tin toàn cầu được tổ chức dưới dạng các trang web liên kết với nhau, hoạt động trên nền tảng Internet.',
      bloomLevel: 'Nhận biết',
      difficulty: 'Dễ'
    },
    {
      id: 'Q_02',
      questionText: 'Phát biểu nào sau đây là ĐÚNG khi nói về mối quan hệ giữa Internet và Mạng thông tin toàn cầu (WWW)?',
      options: {
        A: 'Internet và WWW là hai tên gọi khác nhau của cùng một đối tượng',
        B: 'WWW là hạ tầng mạng phần cứng, còn Internet là trang web',
        C: 'Internet là hạ tầng mạng kết nối, còn WWW là một dịch vụ thông tin hoạt động trên Internet',
        D: 'Muốn dùng Internet thì nhất thiết phải cài đặt WWW'
      },
      correctAnswer: 'C',
      explanation: 'Internet là mạng liên kết các mạng máy tính toàn cầu (hạ tầng mạng), còn WWW chỉ là một trong các dịch vụ chạy trên Internet.',
      bloomLevel: 'Thông hiểu',
      difficulty: 'Trung bình'
    },
    {
      id: 'Q_03',
      questionText: 'Trang web đầu tiên mở ra khi bạn truy cập vào một địa chỉ website được gọi là gì?',
      options: {
        A: 'Trang tìm kiếm',
        B: 'Trang tài liệu',
        C: 'Trang chủ (Homepage)',
        D: 'Trang siêu liên kết'
      },
      correctAnswer: 'C',
      explanation: 'Trang chủ (Homepage) là trang web đầu tiên được hiển thị khi truy cập vào một địa chỉ website.',
      bloomLevel: 'Nhận biết',
      difficulty: 'Dễ'
    },
    {
      id: 'Q_04',
      questionText: 'Khi di chuyển con trỏ chuột vào một đoạn chữ hoặc hình ảnh trên trang web, nếu con trỏ biến thành hình bàn tay chỉ ngón thì đó là gì?',
      options: {
        A: 'Trình duyệt web bị đơ',
        B: 'Một siêu liên kết (Hyperlink)',
        C: 'Một thông báo lỗi virus',
        D: 'Một phần mềm máy tính'
      },
      correctAnswer: 'B',
      explanation: 'Khi con trỏ chuột biến thành hình bàn tay, đoạn chữ hoặc hình ảnh đó chứa một siêu liên kết (Hyperlink) dẫn tới vị trí hoặc trang web khác.',
      bloomLevel: 'Vận dụng',
      difficulty: 'Trung bình'
    },
    {
      id: 'Q_05',
      questionText: 'Phần mềm nào sau đây là Trình duyệt web giúp học sinh truy cập các trang web?',
      options: {
        A: 'Google Chrome, Microsoft Edge, Cốc Cốc',
        B: 'Microsoft Word, Microsoft Excel, PowerPoint',
        C: 'Unikey, Paint, Windows Media Player',
        D: 'Kodu Game Lab, Scratch, Pascal'
      },
      correctAnswer: 'A',
      explanation: 'Google Chrome, Microsoft Edge, Mozilla Firefox, Cốc Cốc, Safari... là các phần mềm trình duyệt web phổ biến hiện nay.',
      bloomLevel: 'Nhận biết',
      difficulty: 'Dễ'
    }
  ]);

  const allTopics = [
    'Phân biệt Internet và WWW',
    'Khái niệm Website và Trang web',
    'Trang chủ và Siêu liên kết',
    'Trình duyệt Web',
    'Địa chỉ website (URL)',
    'An toàn cơ bản khi dùng Web'
  ];

  const allBloomLevels = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];

  const toggleTopic = (t) => {
    setSelectedTopics(prev => 
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const toggleBloom = (b) => {
    setSelectedBloomLevels(prev => 
      prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    );
  };

  // Generate Questions with BitOne AI
  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    setStatusMessage('BitOne AI đang phân tích bài học và tạo câu hỏi...');
    try {
      const res = await classroomService.generateQuestions({
        subject,
        grade,
        lesson,
        topics: selectedTopics,
        bloomLevels: selectedBloomLevels,
        count: Number(count),
        customPrompt
      });

      if (res && Array.isArray(res.questions) && res.questions.length > 0) {
        setQuestions(res.questions);
        setStatusMessage(`Tạo thành công ${res.questions.length} câu hỏi từ ${res.provider || 'BitOne AI'}!`);
      } else {
        setStatusMessage('Không nhận được câu hỏi hợp lệ từ AI, vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Lỗi khi tạo câu hỏi với BitOne AI:', err);
      setStatusMessage('Đã có lỗi khi kết nối AI. Đang sử dụng bộ câu hỏi mẫu chuẩn.');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit question field
  const handleUpdateQuestion = (index, field, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Edit question option
  const handleUpdateOption = (index, optKey, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        options: {
          ...updated[index].options,
          [optKey]: value
        }
      };
      return updated;
    });
  };

  // Delete question
  const handleDeleteQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Add new blank question
  const handleAddQuestion = () => {
    const newQ = {
      id: `Q_${Date.now()}`,
      questionText: 'Nhập nội dung câu hỏi mới ở đây...',
      options: {
        A: 'Lựa chọn A',
        B: 'Lựa chọn B',
        C: 'Lựa chọn C',
        D: 'Lựa chọn D'
      },
      correctAnswer: 'A',
      explanation: 'Giải thích vì sao đáp án A đúng...',
      bloomLevel: 'Nhận biết',
      difficulty: 'Dễ'
    };
    setQuestions(prev => [...prev, newQ]);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NganHangCauHoi_Tin6_Bai6_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          setQuestions(imported);
          setStatusMessage(`Đã nạp ${imported.length} câu hỏi từ tệp JSON!`);
        }
      } catch (err) {
        alert('Tệp JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden p-3 sm:p-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-white">
              SOẠN CÂU HỎI TRẮC NGHIỆM BITONE AI
            </h2>
            <p className="text-xs text-slate-400">
              Tạo tự động theo thang đo Bloom & chuẩn kiến thức Tin học 6 • Bài 6: Mạng thông tin toàn cầu
            </p>
          </div>
        </div>

        {/* Global Bank Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all"
            title="Xuất ngân hàng câu hỏi ra file JSON"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất JSON
          </button>
          <label 
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all"
            title="Nhập ngân hàng câu hỏi từ file JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            Nhập JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
          </label>
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm câu hỏi
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Generation Config & Question List */}
      <div className="flex-1 min-h-0 py-3 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: AI Prompt Parameters (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-cyan-300">THAM SỐ TẠO ĐỀ</h3>
          </div>

          {/* Subject & Grade */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-slate-400 font-semibold mb-1 block">Môn học</label>
              <input 
                type="text" 
                value={subject} 
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold mb-1 block">Khối lớp</label>
              <select 
                value={grade} 
                onChange={e => setGrade(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
              >
                <option value="6">Lớp 6</option>
                <option value="7">Lớp 7</option>
                <option value="8">Lớp 8</option>
                <option value="9">Lớp 9</option>
              </select>
            </div>
          </div>

          {/* Lesson */}
          <div className="text-xs">
            <label className="text-slate-400 font-semibold mb-1 block">Bài học</label>
            <input 
              type="text" 
              value={lesson} 
              onChange={e => setLesson(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium"
            />
          </div>

          {/* Topic Pills */}
          <div className="text-xs">
            <label className="text-slate-400 font-semibold mb-1.5 block">Nội dung trọng tâm cần hỏi</label>
            <div className="flex flex-wrap gap-1.5">
              {allTopics.map(t => {
                const active = selectedTopics.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTopic(t)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                      active 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bloom Levels */}
          <div className="text-xs">
            <label className="text-slate-400 font-semibold mb-1.5 block">Mức độ nhận thức (Bloom)</label>
            <div className="grid grid-cols-2 gap-1.5">
              {allBloomLevels.map(b => {
                const active = selectedBloomLevels.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBloom(b)}
                    className={`px-2 py-1.5 rounded-lg text-center text-xs font-semibold border transition-all ${
                      active 
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm' 
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of questions */}
          <div className="text-xs">
            <label className="text-slate-400 font-semibold mb-1 block">Số lượng câu hỏi cần tạo</label>
            <div className="flex items-center gap-2">
              {[4, 5, 8, 10].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold border ${
                    count === n 
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400' 
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {n} câu
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuestions}
            disabled={isLoading}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-slate-950 transition-all shadow-lg ${
              isLoading
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-cyan-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-cyan-500/30'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                Đang tạo câu hỏi...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                TẠO CÂU HỎI VỚI BITONE AI
              </>
            )}
          </button>

          {statusMessage && (
            <p className="text-[11px] text-center text-cyan-300/80 italic">
              {statusMessage}
            </p>
          )}
        </div>

        {/* Right Column: Question Bank & Management (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-200">
                NGÂN HÀNG CÂU HỎI ({questions.length} CÂU)
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Nhấp vào văn bản để chỉnh sửa trực tiếp
            </span>
          </div>

          {/* Question List Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-4 pr-1">
            {questions.map((q, idx) => (
              <div 
                key={q.id || idx}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-3 transition-all"
              >
                {/* Header row: Question index, Bloom tag, and actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center border border-cyan-400/40">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      {q.bloomLevel || 'Nhận biết'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300">
                      {q.difficulty || 'Trung bình'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onSelectQuestionForAssessment && (
                      <button
                        onClick={() => onSelectQuestionForAssessment(q)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500 hover:text-slate-950 transition-all"
                        title="Đưa câu hỏi này vào phiên Đánh giá QR trên máy chiếu"
                      >
                        <ArrowRight className="w-3 h-3" />
                        Đưa vào Đánh giá QR
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteQuestion(idx)}
                      className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Editable Question Text */}
                <input 
                  type="text"
                  value={q.questionText}
                  onChange={(e) => handleUpdateQuestion(idx, 'questionText', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white"
                />

                {/* 4 Options (A, B, C, D) with Radio for Correct Answer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {['A', 'B', 'C', 'D'].map(optKey => {
                    const isCorrect = q.correctAnswer === optKey;
                    return (
                      <div 
                        key={optKey}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                          isCorrect 
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300' 
                            : 'bg-slate-900/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleUpdateQuestion(idx, 'correctAnswer', optKey)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isCorrect 
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                          title={`Đặt ${optKey} là đáp án đúng`}
                        >
                          {optKey}
                        </button>
                        <input 
                          type="text"
                          value={q.options?.[optKey] || ''}
                          onChange={(e) => handleUpdateOption(idx, optKey, e.target.value)}
                          className="flex-1 bg-transparent border-0 focus:outline-none text-xs text-slate-200"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="bg-slate-900/40 rounded-lg p-2 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                  <span className="font-semibold text-cyan-300/80 shrink-0">Giải thích:</span>
                  <input 
                    type="text"
                    value={q.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(idx, 'explanation', e.target.value)}
                    className="flex-1 bg-transparent border-0 focus:outline-none text-[11px] text-slate-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

