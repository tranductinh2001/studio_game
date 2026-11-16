import React, { useState, useEffect } from 'react';
import { 
  Printer, Download, Eye, Users, FileText, CheckCircle2, 
  RotateCw, ArrowUp, ArrowRight, ArrowDown, ArrowLeft, RefreshCw,
  Plus, Edit3, Trash2, Clipboard, Save, X, School, Check, AlertCircle,
  FileSpreadsheet, FolderSync, Upload, CheckSquare, Square, UserPlus
} from 'lucide-react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { classroomService } from '../../services/classroomService';

export default function CardGenerator() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('CLASS_6A');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  // Quick single student add bar
  const [quickAddName, setQuickAddName] = useState('');

  // Modals state
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassSchool, setNewClassSchool] = useState('THCS Đắk Trôi');
  const [newClassTeacher, setNewClassTeacher] = useState('Thầy Trần Đức Tình');

  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkStudentsText, setBulkStudentsText] = useState('');
  const [bulkImportMode, setBulkImportMode] = useState('append'); // 'append' or 'replace'
  const [saveStatus, setSaveStatus] = useState('');

  // SMAS Import Modal state
  const [showSmasModal, setShowSmasModal] = useState(false);
  const [smasDetection, setSmasDetection] = useState(null);
  const [isDetectingSmas, setIsDetectingSmas] = useState(false);
  const [isImportingSmas, setIsImportingSmas] = useState(false);
  const [selectedSmasCodes, setSelectedSmasCodes] = useState([]);
  const [uploadProgress, setUploadProgress] = useState('');

  // Editing single student inline
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editCardId, setEditCardId] = useState('');

  // 1. Load Classes list
  const loadClasses = async () => {
    const list = await classroomService.getClasses();
    setClasses(list || []);
    if (list && list.length > 0 && !list.find(c => c.id === selectedClassId)) {
      setSelectedClassId(list[0].id);
    }
  };

  // 2. Load Students of selected class
  const loadStudents = async (classId) => {
    if (!classId) return;
    const list = await classroomService.getStudents(classId);
    setStudents(list || []);
    if (list && list.length > 0) {
      setSelectedStudent(list[0]);
    } else {
      setSelectedStudent(null);
      setPreviewQrDataUrl('');
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadStudents(selectedClassId);
    }
  }, [selectedClassId]);

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

  // Handle Add New Class
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      const created = await classroomService.addClass({
        name: newClassName.trim(),
        code: newClassCode.trim() || newClassName.trim(),
        school: newClassSchool.trim(),
        teacher: newClassTeacher.trim()
      });

      await loadClasses();
      setSelectedClassId(created.id);
      setShowAddClassModal(false);
      setNewClassName('');
      setNewClassCode('');
      setSaveStatus(`Đã tạo thành công lớp ${created.name}!`);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tạo lớp học!');
    }
  };

  // Handle Delete Class
  const handleDeleteClass = async (classId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này và toàn bộ học sinh trong lớp?')) {
      try {
        await classroomService.deleteClass(classId);
        await loadClasses();
        setSelectedClassId('CLASS_6A');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Check SMAS file on server
  const checkSmasDetection = async () => {
    setIsDetectingSmas(true);
    try {
      const data = await classroomService.detectSmasFile();
      setSmasDetection(data);
      if (data && data.classes && data.classes.length > 0) {
        setSelectedSmasCodes(data.classes.map(c => c.code));
      }
    } catch (err) {
      console.error('Error detecting SMAS:', err);
    } finally {
      setIsDetectingSmas(false);
    }
  };

  const handleToggleSmasClass = (code) => {
    setSelectedSmasCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleImportLocalSmas = async () => {
    setIsImportingSmas(true);
    try {
      const res = await classroomService.importLocalSmas(selectedSmasCodes);
      if (res && res.success) {
        setSaveStatus(`Đã nhập thành công ${res.importedCount} lớp học (${res.totalStudents} học sinh) từ SMAS!`);
        await loadClasses();
        const has6A = res.classes?.find(c => c.code === '6A');
        if (has6A) {
          setSelectedClassId(has6A.id);
        } else if (res.classes && res.classes.length > 0) {
          setSelectedClassId(res.classes[0].id);
        }
        setShowSmasModal(false);
      }
    } catch (err) {
      console.error('Lỗi nạp SMAS:', err);
      alert('Đã xảy ra lỗi khi nạp dữ liệu SMAS: ' + err.message);
    } finally {
      setIsImportingSmas(false);
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  // Universal client-side parser for ANY Excel student file (SMAS, vnEdu, or custom list)
  const parseSmasWorkbookClient = (wb) => {
    const result = [];
    const schoolDefault = 'TRƯỜNG TH & THCS ĐĂK TRÔI';

    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName];
      if (!ws) continue;
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!rawData || rawData.length === 0) continue;

      let school = schoolDefault;
      if (rawData[3] && rawData[3][0] && typeof rawData[3][0] === 'string') {
        school = rawData[3][0].trim();
      }

      let classCode = '';
      const match = sheetName.match(/(\d+[A-Za-z]*)/);
      if (match) {
        classCode = match[1];
      } else if (rawData[0] && rawData[0][3]) {
        classCode = String(rawData[0][3]).trim();
      } else {
        classCode = sheetName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'Lop1';
      }

      const className = classCode.toLowerCase().startsWith('lớp') ? classCode : (`Lớp ${classCode}`);
      const classId = `CLASS_${classCode.toUpperCase()}`;

      // Dynamic column headers detection
      let nameCol = -1;
      let hoCol = -1;
      let tenCol = -1;
      let codeCol = -1;
      let startRow = -1;

      for (let r = 0; r < Math.min(25, rawData.length); r++) {
        const row = rawData[r];
        if (!Array.isArray(row)) continue;
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').trim().toLowerCase();
          if (val.includes('họ và tên') || val === 'họ tên' || val === 'họ và tên học sinh' || val === 'tên học sinh' || val === 'fullname' || val === 'full name') {
            nameCol = c;
            startRow = r + 1;
          } else if (val.includes('họ đệm') || val.includes('họ và đệm') || val.includes('họ và chữ đệm') || val === 'họ') {
            hoCol = c;
            startRow = r + 1;
          } else if ((val === 'tên' || val === 'ten') && nameCol === -1) {
            tenCol = c;
            startRow = r + 1;
          } else if (val.includes('mã học sinh') || val.includes('mã định danh') || val.includes('mã số') || val === 'studentid' || val === 'code') {
            codeCol = c;
          }
        }
        if (startRow !== -1) {
          if (rawData[startRow] && Array.isArray(rawData[startRow])) {
            const nextRowText = rawData[startRow].map(x => String(x || '').trim()).join('');
            if (/^(\d+|tx\d+|đđg.*)$/i.test(nextRowText) || nextRowText.length < 5) {
              startRow++;
            }
          }
          break;
        }
      }

      // Fallback: scan columns for name-like strings if no header found
      if (nameCol === -1 && hoCol === -1 && tenCol === -1) {
        let bestCol = -1;
        let maxNames = 0;
        for (let c = 0; c < 10; c++) {
          let count = 0;
          for (let r = 0; r < Math.min(30, rawData.length); r++) {
            const cell = String(rawData[r]?.[c] || '').trim();
            if (cell.length > 2 && cell.includes(' ') && !/^\d+$/.test(cell)) {
              count++;
            }
          }
          if (count > maxNames) {
            maxNames = count;
            bestCol = c;
          }
        }
        if (maxNames >= 2) {
          nameCol = bestCol;
          startRow = 0;
        }
      }

      const parsedStudents = [];
      const beginRow = startRow !== -1 ? startRow : 0;

      for (let r = beginRow; r < rawData.length; r++) {
        const row = rawData[r];
        if (!row || !Array.isArray(row)) continue;

        let fullName = '';
        if (nameCol !== -1 && row[nameCol]) {
          fullName = String(row[nameCol]).trim();
        } else if (hoCol !== -1 && tenCol !== -1 && (row[hoCol] || row[tenCol])) {
          fullName = `${String(row[hoCol] || '').trim()} ${String(row[tenCol] || '').trim()}`.trim();
        }

        if (!fullName || fullName === 'None' || fullName.toLowerCase().includes('tổng số') || fullName.toLowerCase().includes('học kỳ') || fullName.toLowerCase().includes('họ và tên') || /^\d+$/.test(fullName)) {
          continue;
        }

        const num = parsedStudents.length + 1;
        const numStr = num < 10 ? `0${num}` : `${num}`;
        const cardNum = num < 10 ? `000${num}` : `00${num}`;
        const stuCode = (codeCol !== -1 && row[codeCol]) ? String(row[codeCol]).trim() : (`HS${classCode}${numStr}`);

        parsedStudents.push({
          id: `STU_${classCode}_${numStr}`,
          studentCode: stuCode,
          fullName,
          classId,
          cardId: `CARD_${cardNum}`,
          status: 'active',
          group: `Nhóm ${((num - 1) % 4) + 1}`,
          createdAt: new Date().toISOString()
        });
      }

      if (parsedStudents.length > 0) {
        result.push({
          id: classId,
          code: classCode,
          name: className,
          school: school,
          teacher: 'Thầy Trần Đức Tình',
          totalStudents: parsedStudents.length,
          students: parsedStudents,
          sheetName: sheetName
        });
      }
    }

    return result;
  };

  const handleUploadSmasExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingSmas(true);
    setUploadProgress('Đang đọc tệp Excel SMAS...');
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const buffer = evt.target.result;
          const wb = XLSX.read(buffer, { type: 'array' });
          const parsedClasses = parseSmasWorkbookClient(wb);

          if (!parsedClasses || parsedClasses.length === 0) {
            alert('Không tìm thấy danh sách học sinh trong tệp Excel. Vui lòng đảm bảo tệp có cột Họ và tên học sinh!');
            return;
          }

          setUploadProgress('Đang đồng bộ dữ liệu vào hệ thống...');
          // Save each parsed class into system
          try {
            for (const pc of parsedClasses) {
              await classroomService.saveClassStudents(pc.id, pc.students);
            }
            await loadClasses();
          } catch (syncErr) {
            console.warn('Backend sync note, applying client-side roster directly:', syncErr);
            setClasses(prev => {
              const map = new Map(prev.map(c => [c.id, c]));
              parsedClasses.forEach(c => map.set(c.id, { id: c.id, code: c.code, name: c.name, school: c.school, totalStudents: c.students.length }));
              return Array.from(map.values());
            });
          }

          // Select primary class (default to 6A if present, otherwise first parsed class)
          const targetClass = parsedClasses.find(c => c.code === '6A') || parsedClasses[0];
          setSelectedClassId(targetClass.id);
          setStudents(targetClass.students);
          if (targetClass.students.length > 0) {
            setSelectedStudent(targetClass.students[0]);
          }

          setSaveStatus(`Đã nạp thành công ${parsedClasses.length} lớp (${parsedClasses.reduce((acc, c) => acc + c.totalStudents, 0)} học sinh) từ tệp Excel!`);
          setShowSmasModal(false);
        } catch (err) {
          console.error('Lỗi phân tích Excel:', err);
          alert('Lỗi xử lý file Excel SMAS: ' + err.message);
        } finally {
          setIsImportingSmas(false);
          setUploadProgress('');
          setTimeout(() => setSaveStatus(''), 4000);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      setIsImportingSmas(false);
      setUploadProgress('');
    }
  };

  // Quick single student add handler
  const handleQuickAddStudent = async (e) => {
    e.preventDefault();
    const name = quickAddName.trim();
    if (!name) return;

    try {
      const added = await classroomService.addStudent(selectedClassId, { fullName: name });
      if (added) {
        setStudents(prev => [...prev, added]);
        setSelectedStudent(added);
      }
    } catch (err) {
      console.warn('Backend add note, applying local student:', err);
      const num = students.length + 1;
      const numStr = num < 10 ? `0${num}` : `${num}`;
      const cardNum = num < 10 ? `000${num}` : `00${num}`;
      const localStudent = {
        id: `STU_${selectedClassId}_${Date.now()}_${numStr}`,
        studentCode: `HS${selectedClassObj.code || '6'}${numStr}`,
        fullName: name,
        classId: selectedClassId,
        cardId: `CARD_${cardNum}`,
        status: 'active',
        group: `Nhóm ${((num - 1) % 4) + 1}`,
        createdAt: new Date().toISOString()
      };
      setStudents(prev => [...prev, localStudent]);
      setSelectedStudent(localStudent);
    }

    setQuickAddName('');
    setSaveStatus(`Đã thêm học sinh "${name}" vào ${selectedClassObj.name}!`);
    setTimeout(() => setSaveStatus(''), 3000);
    loadClasses();
  };

  // Delete student handler
  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${studentName}" khỏi lớp?`)) {
      return;
    }

    try {
      await classroomService.deleteStudent(selectedClassId, studentId);
    } catch (err) {
      console.warn('Backend delete note:', err);
    }

    setStudents(prev => {
      const remaining = prev.filter(s => s.id !== studentId);
      return remaining.map((s, idx) => {
        const num = idx + 1;
        const cardNum = num < 10 ? `000${num}` : `00${num}`;
        return {
          ...s,
          cardId: `CARD_${cardNum}`,
          group: `Nhóm ${((num - 1) % 4) + 1}`
        };
      });
    });

    if (selectedStudent?.id === studentId) {
      setSelectedStudent(students[0] || null);
    }

    setSaveStatus(`Đã xóa học sinh "${studentName}" khỏi lớp!`);
    setTimeout(() => setSaveStatus(''), 3000);
    loadClasses();
  };

  // Handle Bulk Import Students (with Append vs Overwrite choice)
  const handleBulkImport = async () => {
    if (!bulkStudentsText.trim()) return;
    const lines = bulkStudentsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return;

    try {
      let saved = [];
      if (bulkImportMode === 'append') {
        saved = await classroomService.appendStudents(selectedClassId, lines);
      } else {
        saved = await classroomService.saveClassStudents(selectedClassId, lines);
      }

      if (saved && saved.length > 0) {
        setStudents(saved);
        setSelectedStudent(saved[0]);
      }
      setShowBulkImportModal(false);
      setBulkStudentsText('');
      setSaveStatus(`Đã cập nhật danh sách ${saved.length || lines.length} học sinh & tự động gán mã thẻ QR!`);
      setTimeout(() => setSaveStatus(''), 4000);
      loadClasses();
    } catch (err) {
      console.warn('Backend save note, applying local student roster fallback:', err);
      if (bulkImportMode === 'append') {
        const startIdx = students.length;
        const newStudents = lines.map((name, idx) => {
          const num = startIdx + idx + 1;
          const numStr = num < 10 ? `0${num}` : `${num}`;
          const cardNum = num < 10 ? `000${num}` : `00${num}`;
          return {
            id: `STU_${selectedClassId}_${numStr}`,
            studentCode: `HS${numStr}`,
            fullName: name,
            classId: selectedClassId,
            cardId: `CARD_${cardNum}`,
            group: `Nhóm ${((num - 1) % 4) + 1}`,
            status: 'active'
          };
        });
        const combined = [...students, ...newStudents];
        setStudents(combined);
        if (combined.length > 0) setSelectedStudent(combined[0]);
        setSaveStatus(`Đã thêm ${newStudents.length} học sinh vào lớp (tổng ${combined.length} HS)!`);
      } else {
        const clientStudents = lines.map((name, idx) => {
          const num = idx + 1;
          const numStr = num < 10 ? `0${num}` : `${num}`;
          const cardNum = num < 10 ? `000${num}` : `00${num}`;
          return {
            id: `STU_${selectedClassId}_${numStr}`,
            studentCode: `HS${numStr}`,
            fullName: name,
            classId: selectedClassId,
            cardId: `CARD_${cardNum}`,
            group: `Nhóm ${((num - 1) % 4) + 1}`,
            status: 'active'
          };
        });
        setStudents(clientStudents);
        if (clientStudents.length > 0) setSelectedStudent(clientStudents[0]);
        setSaveStatus(`Đã cập nhật danh sách ${clientStudents.length} học sinh & tự động gán mã thẻ QR!`);
      }
      setShowBulkImportModal(false);
      setBulkStudentsText('');
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  // Save Inline Edit Student
  const handleSaveStudentEdit = async (studentId) => {
    if (!editFullName.trim()) return;
    try {
      const updated = await classroomService.updateStudent(selectedClassId, studentId, {
        fullName: editFullName.trim(),
        cardId: editCardId.trim()
      });
      setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(updated);
      }
      setEditingStudentId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Generate and Download Full Printable A4 PDF for current class
  const handleGenerateFullPdf = async () => {
    if (!students || students.length === 0) return;
    setIsGeneratingPdf(true);
    setPdfProgress(0);

    const currentClass = classes.find(c => c.id === selectedClassId) || { name: 'Lớp 6A', school: 'THCS Đắk Trôi' };

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
        doc.text(`${currentClass.school.toUpperCase()} - ${currentClass.name.toUpperCase()} | THE TRAC NGHIEM QR`, leftOffset + 5, topOffset + 9);

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
        doc.setTextColor(220, 38, 38);
        doc.text("A", leftOffset + (cardWidth / 2) - 3, topOffset + 38);
        doc.setFontSize(9);
        doc.text("^ (Dap an A huong len tren)", leftOffset + (cardWidth / 2) - 22, topOffset + 43);

        // RIGHT: B
        doc.setFontSize(18);
        doc.setTextColor(37, 99, 235);
        doc.text("B >", leftOffset + cardWidth - 18, topOffset + (cardHeight / 2) + 5);

        // BOTTOM: C
        doc.setFontSize(18);
        doc.setTextColor(22, 163, 74);
        doc.text("C", leftOffset + (cardWidth / 2) - 3, topOffset + cardHeight - 12);
        doc.setFontSize(9);
        doc.text("v (Dap an C huong len tren)", leftOffset + (cardWidth / 2) - 22, topOffset + cardHeight - 6);

        // LEFT: D
        doc.setFontSize(18);
        doc.setTextColor(217, 119, 6);
        doc.text("< D", leftOffset + 6, topOffset + (cardHeight / 2) + 5);

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

      doc.save(`The_QR_${currentClass.name.replace(/\s+/g, '_')}_${currentClass.school.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Lỗi xuất PDF thẻ:', err);
      alert('Đã xảy ra lỗi khi tạo tệp PDF!');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const selectedClassObj = classes.find(c => c.id === selectedClassId) || { name: 'Lớp 6A', school: 'THCS Đắk Trôi' };

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
              CÀI ĐẶT LỚP HỌC & MÃ THẺ QR (PLICKERS-STYLE)
            </h2>
            <p className="text-xs text-slate-400">
              Mã thẻ QR mặc định (Thẻ 1 - 40) dùng chung • Tùy chỉnh danh sách học sinh theo từng lớp học
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Class, Bulk Import, SMAS Import, Print Full PDF */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddClassModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-all"
            title="Tạo thêm một lớp học mới"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            Tạo lớp mới
          </button>

          <button
            onClick={() => {
              setShowSmasModal(true);
              checkSmasDetection();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60 hover:text-white hover:border-emerald-400 transition-all shadow-md shadow-emerald-500/20"
            title="Nhập tự động danh sách học sinh từ file Excel SMAS (Sổ điểm THCS Đắk Trôi)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Nhập Excel SMAS
          </button>

          <button
            onClick={() => setShowBulkImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-emerald-300 hover:border-emerald-500/50 transition-all"
            title="Dán nhanh danh sách học sinh từ Excel hoặc Word"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-400" />
            Dán danh sách
          </button>

          <button
            onClick={handleGenerateFullPdf}
            disabled={isGeneratingPdf || students.length === 0}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 transition-all shadow-lg ${
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
                In toàn bộ thẻ {selectedClassObj.name} (PDF A4)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Status Notification */}
      {saveStatus && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 my-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{saveStatus}</span>
        </div>
      )}

      {/* Class Selector Bar & Notification */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3 bg-slate-900/60 rounded-xl border border-slate-800 my-2 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <School className="w-4 h-4 text-cyan-400" />
            CHỌN LỚP HỌC:
          </span>

          {/* Class Dropdown */}
          <div className="flex flex-wrap items-center gap-1.5">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedClassId === cls.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cls.name} ({cls.totalStudents || 0} HS)
              </button>
            ))}
          </div>
        </div>

        {/* Notice of Shared QR Card Set */}
        <div className="text-[11px] text-amber-300/90 flex items-center gap-1.5 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Mã thẻ QR (CARD_0001 - CARD_0040) là cố định dùng chung cho mọi lớp. Khi chọn lớp nào, tên học sinh lớp đó sẽ tự liên kết với thẻ!</span>
        </div>
      </div>

      {saveStatus && (
        <div className="text-center text-xs font-bold text-emerald-400 bg-emerald-950/50 py-1.5 rounded-lg border border-emerald-500/40 shrink-0 mb-2">
          {saveStatus}
        </div>
      )}

      {/* Main 2-Column Split: Student Roster Table & Card Preview */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left: Students of Selected Class (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden p-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-200">
                DANH SÁCH {selectedClassObj.name} ({students.length} HỌC SINH)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {selectedClassObj.school}
            </span>
          </div>

          {/* Quick Add Single Student Bar */}
          <form onSubmit={handleQuickAddStudent} className="flex items-center gap-2 py-2 border-b border-slate-800 shrink-0">
            <input
              type="text"
              placeholder="+ Nhập họ và tên học sinh mới (ví dụ: Nguyễn Thị Mai)..."
              value={quickAddName}
              onChange={(e) => setQuickAddName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!quickAddName.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Thêm vào lớp
            </button>
          </form>

          {/* Student Table */}
          <div className="flex-1 min-h-0 overflow-y-auto py-2 space-y-1.5 pr-1">
            {students.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Users className="w-10 h-10 stroke-[1.2] text-slate-600" />
                <p className="text-xs">Lớp này chưa có danh sách học sinh.</p>
                <button
                  onClick={() => setShowBulkImportModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md"
                >
                  Dán danh sách học sinh ngay
                </button>
              </div>
            ) : (
              students.map((stu, index) => {
                const isSelected = selectedStudent?.id === stu.id;
                const isEditing = editingStudentId === stu.id;

                return (
                  <div
                    key={stu.id}
                    onClick={() => {
                      if (!isEditing) setSelectedStudent(stu);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      isSelected 
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-white font-semibold shadow-md' 
                        : 'bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {/* Left: STT & Name */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-mono shrink-0">
                        {index + 1}
                      </span>

                      {isEditing ? (
                        <input
                          type="text"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="bg-slate-900 border border-cyan-400 rounded px-2 py-0.5 text-xs text-white flex-1"
                          autoFocus
                        />
                      ) : (
                        <span className="text-slate-100 truncate cursor-pointer">
                          {stu.fullName}
                        </span>
                      )}
                    </div>

                    {/* Right: Card Code & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editCardId}
                          onChange={(e) => setEditCardId(e.target.value)}
                          className="w-24 bg-slate-900 border border-cyan-400 rounded px-1.5 py-0.5 text-xs text-emerald-400 font-mono"
                          placeholder="CARD_0001"
                        />
                      ) : (
                        <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 font-bold">
                          {stu.cardId}
                        </span>
                      )}

                      {isEditing ? (
                        <button
                          onClick={() => handleSaveStudentEdit(stu.id)}
                          className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                          title="Lưu thay đổi"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStudentId(stu.id);
                              setEditFullName(stu.fullName);
                              setEditCardId(stu.cardId);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                            title="Đổi tên hoặc mã thẻ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStudent(stu.id, stu.fullName);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title={`Xóa học sinh ${stu.fullName} khỏi lớp`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Live Interactive Card Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto items-center justify-center">
          {selectedStudent ? (
            <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl shadow-2xl p-4 flex flex-col border-4 border-slate-300 relative select-none">
              {/* Card Header Strip */}
              <div className="border-b-2 border-slate-800 pb-2 mb-2 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wide">
                    {selectedClassObj.school} • {selectedClassObj.name}
                  </h4>
                  <p className="text-[10px] text-slate-600 font-semibold">
                    Thẻ trả lời trắc nghiệm 4 hướng
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
                  Mã số: {selectedStudent.studentCode}
                </p>
              </div>

              {/* The 4-Way Directional Card Body */}
              <div className="relative my-2 p-5 bg-slate-50 border-2 border-dashed border-slate-400 rounded-xl flex items-center justify-center">
                {/* DIRECTION A (TOP) */}
                <div className="absolute top-1 left-0 right-0 flex flex-col items-center">
                  <span className="font-black text-lg text-red-600 flex items-center gap-1 leading-none">
                    A <ArrowUp className="w-4 h-4 stroke-[3]" />
                  </span>
                  <span className="text-[8px] font-bold text-slate-500">
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
                  <span className="text-[8px] font-bold text-slate-500">
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
                      className="w-40 h-40 object-contain"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions footer on card */}
              <div className="mt-2 text-[9px] text-slate-600 text-center bg-slate-100 rounded-lg p-1.5 border border-slate-200">
                💡 <span className="font-bold">Học sinh xoay chữ cái đáp án lên trên cùng</span> và giơ thẳng thẻ để camera giáo viên quét nhận diện!
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Chọn một học sinh từ danh sách để xem trước thẻ.</p>
          )}
        </div>
      </div>

      {/* MODAL 1: TẠO LỚP HỌC MỚI */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddClassModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-cyan-300 flex items-center gap-2">
              <School className="w-5 h-5" />
              TẠO LỚP HỌC MỚI
            </h3>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Tên lớp học (ví dụ: Lớp 6D, Lớp 7A)</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên lớp..."
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Trường học</label>
                <input
                  type="text"
                  value={newClassSchool}
                  onChange={(e) => setNewClassSchool(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Giáo viên phụ trách</label>
                <input
                  type="text"
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md"
                >
                  Tạo lớp ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NHẬP DANH SÁCH NHANH (PASTE EXCEL/TEXT) */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowBulkImportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-emerald-400 flex items-center gap-2">
                <Clipboard className="w-5 h-5" />
                NHẬP NHANH DANH SÁCH {selectedClassObj.name.toUpperCase()}
              </h3>
              <p className="text-xs text-slate-400">
                {bulkImportMode === 'append'
                  ? `Dán danh sách học sinh để thêm tiếp vào sau ${students.length} học sinh hiện tại (bắt đầu từ Thẻ CARD_${students.length + 1 < 10 ? '000' + (students.length + 1) : '00' + (students.length + 1)}).`
                  : `Dán danh sách học sinh để thay thế mới toàn bộ lớp (bắt đầu lại từ Thẻ CARD_0001).`}
              </p>
            </div>

            {/* Mode selection: Nối tiếp vs Ghi đè */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Chế độ nạp:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-emerald-400 transition-colors">
                  <input
                    type="radio"
                    name="bulkImportMode"
                    value="append"
                    checked={bulkImportMode === 'append'}
                    onChange={() => setBulkImportMode('append')}
                    className="accent-emerald-500"
                  />
                  <span>Nối tiếp (+ Thêm vào {students.length} HS)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-rose-400 transition-colors">
                  <input
                    type="radio"
                    name="bulkImportMode"
                    value="replace"
                    checked={bulkImportMode === 'replace'}
                    onChange={() => setBulkImportMode('replace')}
                    className="accent-rose-500"
                  />
                  <span>Ghi đè (Thay thế mới)</span>
                </label>
              </div>
            </div>

            <textarea
              rows={10}
              placeholder={`Nguyễn Văn A\nTrần Thị B\nLê Văn C\nPhạm Thị D...`}
              value={bulkStudentsText}
              onChange={(e) => setBulkStudentsText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-slate-200 font-mono"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                Số học sinh phát hiện: <span className="font-bold text-cyan-300">{bulkStudentsText.split('\n').filter(l => l.trim().length > 0).length}</span>
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkImportModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleBulkImport}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Lưu & Tự động gán mã thẻ QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: NHẬP DỮ LIỆU TỪ EXCEL SMAS */}
      {showSmasModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl shadow-emerald-500/10 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSmasModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <FileSpreadsheet className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-emerald-300">
                  NHẬP DANH SÁCH HỌC SINH TỪ EXCEL SMAS
                </h3>
                <p className="text-xs text-slate-400">
                  Sổ Đánh Giá Học Sinh từ SMAS Bộ GD&ĐT • Khớp STT với Thẻ QR (CARD_0001 - CARD_0040)
                </p>
              </div>
            </div>

            {/* OPTION 1: DETECTED LOCAL FILE */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <FolderSync className="w-4 h-4" />
                  1. Sổ điểm SMAS trên máy tính (Tự động phát hiện)
                </span>
                {isDetectingSmas ? (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                    Đang quét file...
                  </span>
                ) : smasDetection?.detected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Phát hiện: {smasDetection.classes?.length || 0} Lớp ({smasDetection.classes?.reduce((acc, c) => acc + c.totalStudents, 0) || 0} HS)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                    Chưa tìm thấy
                  </span>
                )}
              </div>

              {smasDetection?.detected ? (
                <>
                  <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 font-mono truncate">
                    📁 <span className="text-emerald-400 font-bold">Đường dẫn:</span> {smasDetection.filePath}
                  </div>

                  {/* List of Detected Classes */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Chọn các lớp muốn nạp vào hệ thống:</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedSmasCodes.length === smasDetection.classes.length) {
                            setSelectedSmasCodes([]);
                          } else {
                            setSelectedSmasCodes(smasDetection.classes.map(c => c.code));
                          }
                        }}
                        className="text-[11px] text-cyan-400 hover:underline font-semibold"
                      >
                        {selectedSmasCodes.length === smasDetection.classes.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                      {smasDetection.classes.map((c) => {
                        const isSelected = selectedSmasCodes.includes(c.code);
                        return (
                          <div
                            key={c.code}
                            onClick={() => handleToggleSmasClass(c.code)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-emerald-950/50 border-emerald-500/70 text-white shadow-sm'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600 shrink-0" />
                              )}
                              <div>
                                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                  {c.name}
                                  {c.code === '6A' && (
                                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/40">
                                      Thao giảng
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                                  Mẫu: {c.sampleStudents?.join(', ')}...
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                              {c.totalStudents} HS
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1-Click Import Button */}
                  <button
                    onClick={handleImportLocalSmas}
                    disabled={isImportingSmas || selectedSmasCodes.length === 0}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                      isImportingSmas || selectedSmasCodes.length === 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
                    }`}
                  >
                    {isImportingSmas ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        Đang đồng bộ dữ liệu vào hệ thống...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-slate-950" />
                        🚀 NẠP NGAY {selectedSmasCodes.length} LỚP VÀO HỆ THỐNG (1-CLICK)
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="text-xs text-slate-400 p-2 text-center">
                  Không tìm thấy file tại đường dẫn mặc định. Bạn có thể sử dụng tính năng tải file bên dưới.
                </div>
              )}
            </div>

            {/* OPTION 2: UPLOAD CUSTOM SMAS FILE */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Upload className="w-4 h-4" />
                2. Tải lên tệp Excel SMAS khác (.xlsx)
              </span>
              <p className="text-xs text-slate-400">
                Nếu bạn có file SMAS của các khối lớp hoặc năm học khác, hãy chọn tệp để nạp trực tiếp:
              </p>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-cyan-500/70 rounded-xl p-4 cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition-all">
                <Upload className="w-6 h-6 text-cyan-400 mb-1" />
                <span className="text-xs font-semibold text-slate-200">
                  {uploadProgress || 'Bấm để chọn file hoặc kéo thả tệp .xlsx vào đây'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Định dạng chuẩn SMAS (các sheet: Tin học 6A, 6B, 7A...)
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleUploadSmasExcel}
                  className="hidden"
                  disabled={isImportingSmas}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
