import React, { useState, useEffect } from 'react';
import { 
  Printer, Download, Eye, Users, FileText, CheckCircle2, 
  RotateCw, ArrowUp, ArrowRight, ArrowDown, ArrowLeft, RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { classroomService } from '../../services/classroomService';

export default function CardGenerator() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  useEffect(() => {
    classroomService.getStudents('CLASS_6A').then((list) => {
      setStudents(list);
      if (list && list.length > 0) {
        setSelectedStudent(list[0]);
      }
    });
  }, []);

  // Generate QR preview when selectedStudent changes
  useEffect(() => {
    if (!selectedStudent) return;
    const qrData = JSON.stringify({
      cardId: selectedStudent.cardId,
      studentCode: selectedStudent.studentCode,
      classId: selectedStudent.classId
    });

    QRCode.toDataURL(qrData, {
      width: 320,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    }).then(url => {
      setPreviewQrDataUrl(url);
    }).catch(err => {
      console.error('QR preview error:', err);
    });
  }, [selectedStudent]);

  // Generate and Download Full Printable A4 PDF (2 cards per A4 page)
  const handleGenerateFullPdf = async () => {
    if (!students || students.length === 0) return;
    setIsGeneratingPdf(true);
    setPdfProgress(0);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4' // 210 x 297 mm
      });

      const total = students.length;

      for (let i = 0; i < total; i++) {
        setPdfProgress(Math.round(((i + 1) / total) * 100));
        const student = students[i];
        
        // 2 cards per page: index % 2 === 0 is Top card, index % 2 === 1 is Bottom card
        const cardSlot = i % 2; 
        if (i > 0 && cardSlot === 0) {
          doc.addPage();
        }

        const topOffset = cardSlot === 0 ? 10 : 155;
        const leftOffset = 15;
        const cardWidth = 180;
        const cardHeight = 135;

        // Card Border
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(1.2);
        doc.roundedRect(leftOffset, topOffset, cardWidth, cardHeight, 5, 5);

        // Header strip
        doc.setFillColor(15, 23, 42);
        doc.rect(leftOffset, topOffset, cardWidth, 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("THCS DAK TROI - LOP 6A | BAI 6: MANG THONG TIN TOAN CAU", leftOffset + 5, topOffset + 9);

        // Student Info
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(`Hoc sinh: ${student.fullName}`, leftOffset + 8, topOffset + 24);
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Ma so: ${student.studentCode}  |  The: ${student.cardId}`, leftOffset + 8, topOffset + 30);

        // Directions on 4 borders
        // TOP: A
        doc.setFontSize(18);
        doc.setTextColor(220, 38, 38); // Red
        doc.text("A", leftOffset + (cardWidth / 2) - 3, topOffset + 38);
        doc.setFontSize(10);
        doc.text("▲ (Dap an A huong len tren)", leftOffset + (cardWidth / 2) - 25, topOffset + 43);

        // RIGHT: B
        doc.setFontSize(18);
        doc.setTextColor(37, 99, 235); // Blue
        doc.text("B ▶", leftOffset + cardWidth - 18, topOffset + (cardHeight / 2) + 5);

        // BOTTOM: C
        doc.setFontSize(18);
        doc.setTextColor(22, 163, 74); // Green
        doc.text("C", leftOffset + (cardWidth / 2) - 3, topOffset + cardHeight - 12);
        doc.setFontSize(10);
        doc.text("▼ (Dap an C huong len tren)", leftOffset + (cardWidth / 2) - 25, topOffset + cardHeight - 6);

        // LEFT: D
        doc.setFontSize(18);
        doc.setTextColor(217, 119, 6); // Amber
        doc.text("◀ D", leftOffset + 6, topOffset + (cardHeight / 2) + 5);

        // Center QR Code
        const qrData = JSON.stringify({
          cardId: student.cardId,
          studentCode: student.studentCode,
          classId: student.classId
        });

        const qrDataUrl = await QRCode.toDataURL(qrData, {
          width: 250,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'H'
        });

        const qrSize = 65;
        const qrX = leftOffset + (cardWidth - qrSize) / 2;
        const qrY = topOffset + 46;
        doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

        // Orientation guide box
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);
      }

      doc.save(`The_QR_Trac_Nghiem_Lop6A_THCS_Dak_Troi.pdf`);
    } catch (err) {
      console.error('Lỗi xuất PDF thẻ:', err);
      alert('Đã xảy ra lỗi khi tạo tệp PDF!');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden p-3 sm:p-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Printer className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white">
              QUẢN LÝ & IN THẺ QR ĐÁNH GIÁ (PLICKERS-STYLE)
            </h2>
            <p className="text-xs text-slate-400">
              Mỗi học sinh sở hữu 1 thẻ riêng biệt • Xoay 4 hướng để chọn đáp án A, B, C, D
            </p>
          </div>
        </div>

        {/* Action: Print all cards */}
        <button
          onClick={handleGenerateFullPdf}
          disabled={isGeneratingPdf}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 transition-all shadow-lg ${
            isGeneratingPdf
              ? 'bg-slate-700 cursor-not-allowed text-slate-400'
              : 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-emerald-500/30'
          }`}
        >
          {isGeneratingPdf ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              Đang tạo PDF ({pdfProgress}%)...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-slate-950" />
              In toàn bộ 32 thẻ (PDF chuẩn A4)
            </>
          )}
        </button>
      </div>

      {/* Main 2-Column Split: Student Roster & Live Card Preview */}
      <div className="flex-1 min-h-0 py-3 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left: 32 Student Roster (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden p-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-200">
                DANH SÁCH LỚP 6A ({students.length} HỌC SINH)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              THCS Đắk Trôi
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto py-2 space-y-1.5 pr-1">
            {students.map((stu, index) => {
              const isSelected = selectedStudent?.id === stu.id;
              return (
                <div
                  key={stu.id}
                  onClick={() => setSelectedStudent(stu)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-all ${
                    isSelected 
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-white font-semibold shadow-md' 
                      : 'bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                      {index + 1}
                    </span>
                    <span className="text-slate-100">{stu.fullName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      {stu.cardId}
                    </span>
                    <span className="text-[10px] text-slate-500">{stu.studentCode}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Interactive Card Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto items-center justify-center">
          {selectedStudent ? (
            <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl p-4 flex flex-col border-4 border-slate-300 relative select-none">
              {/* Card Header Strip */}
              <div className="border-b-2 border-slate-800 pb-2 mb-2 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                    THCS ĐẮK TRÔI • LỚP 6A
                  </h4>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    Bài 6: Mạng thông tin toàn cầu
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs">
                    {selectedStudent.cardId}
                  </span>
                </div>
              </div>

              {/* Student Name */}
              <div className="text-center py-1">
                <h3 className="text-base font-black text-blue-900">
                  {selectedStudent.fullName}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Mã định danh: {selectedStudent.studentCode}
                </p>
              </div>

              {/* The 4-Way Directional Card Body */}
              <div className="relative my-2 p-5 bg-slate-50 border-2 border-dashed border-slate-400 rounded-xl flex items-center justify-center">
                {/* DIRECTION A (TOP) */}
                <div className="absolute top-1 left-0 right-0 flex flex-col items-center">
                  <span className="font-black text-lg text-red-600 flex items-center gap-1 leading-none">
                    A <ArrowUp className="w-4 h-4 stroke-[3]" />
                  </span>
                  <span className="text-[9px] font-bold text-slate-500">
                    Đáp án A hướng lên trên
                  </span>
                </div>

                {/* DIRECTION B (RIGHT) */}
                <div className="absolute right-1 top-0 bottom-0 flex flex-col items-center justify-center">
                  <span className="font-black text-lg text-blue-600 flex items-center gap-1 leading-none">
                    B <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </span>
                </div>

                {/* DIRECTION C (BOTTOM) */}
                <div className="absolute bottom-1 left-0 right-0 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-slate-500">
                    Đáp án C hướng lên trên
                  </span>
                  <span className="font-black text-lg text-emerald-600 flex items-center gap-1 leading-none">
                    C <ArrowDown className="w-4 h-4 stroke-[3]" />
                  </span>
                </div>

                {/* DIRECTION D (LEFT) */}
                <div className="absolute left-1 top-0 bottom-0 flex flex-col items-center justify-center">
                  <span className="font-black text-lg text-amber-600 flex items-center gap-1 leading-none">
                    <ArrowLeft className="w-4 h-4 stroke-[3]" /> D
                  </span>
                </div>

                {/* Center QR Code Image */}
                <div className="bg-white p-2 rounded-lg border-2 border-slate-900 shadow-md">
                  {previewQrDataUrl ? (
                    <img 
                      src={previewQrDataUrl} 
                      alt={`QR Thẻ ${selectedStudent.cardId}`} 
                      className="w-44 h-44 object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions footer on card */}
              <div className="mt-2 text-[10px] text-slate-600 text-center bg-slate-100 rounded-lg p-2 border border-slate-200">
                💡 <span className="font-bold">Hướng dẫn cho học sinh:</span> Xoay chữ cái đáp án bạn chọn lên phía trên cùng và giơ thẳng thẻ để camera giáo viên quét nhận diện!
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Chọn một học sinh từ danh sách để xem trước thẻ.</p>
          )}
        </div>
      </div>
    </div>
  );
}

