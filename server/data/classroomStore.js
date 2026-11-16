import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'classroomDB.json');
export const DEFAULT_SMAS_PATH = 'C:\\Users\\X1\\Desktop\\tài liệu THCS Đắk Trôi\\điểm kiểm tra\\SDGHS_Tin học_2026-2027.xlsx';

// Default Students for 6A (THCS Đắk Trôi)
const STUDENTS_6A = [
  "Nguyễn Hoàng An", "Trần Quốc Bảo", "Lê Thị Ngọc Bích", "Phạm Minh Cường",
  "Đỗ Diệu Châu", "Vũ Tiến Dũng", "Hoàng Thùy Dương", "Bùi Đức Đạt",
  "Đặng Hương Giang", "Ngô Gia Huy", "Dương Thu Hà", "Lý Thanh Hải",
  "Mai Đức Hiếu", "Trịnh Thúy Hằng", "Phan Nhật Khánh", "Hồ Gia Linh",
  "Đinh Tuấn Kiệt", "Lương Phương Mai", "Võ Hải Nam", "Tạ Bích Ngọc",
  "Nguyễn Minh Quân", "Trần Như Quỳnh", "Lê Văn Sang", "Phạm Thu Thảo",
  "Đỗ Đức Thắng", "Vũ Mai Trang", "Hoàng Trọng Tín", "Bùi Thanh Trúc",
  "Đặng Quốc Việt", "Ngô Tuệ Mẫn", "Dương Khắc Vượng", "Lê Cẩm Yến"
].map((name, idx) => {
  const num = idx + 1;
  const numStr = num < 10 ? `0${num}` : `${num}`;
  const cardNum = num < 10 ? `000${num}` : `00${num}`;
  return {
    id: `STU_6A_${numStr}`,
    studentCode: `HS6A${numStr}`,
    fullName: name,
    classId: 'CLASS_6A',
    cardId: `CARD_${cardNum}`,
    status: 'active',
    createdAt: new Date().toISOString()
  };
});

// Default Students for 6B (THCS Đắk Trôi)
const STUDENTS_6B = [
  "Trần Văn Bình", "Hoàng Thị Mai", "Phạm Tuấn Kiệt", "Lê Thùy Linh",
  "Vũ Hải Đăng", "Đỗ Ngọc Hân", "Bùi Minh Trí", "Ngô Phương Anh",
  "Dương Quốc Khánh", "Đặng Diễm My", "Lý Gia Bảo", "Mai Trúc Linh",
  "Trịnh Văn Nam", "Phan Kim Ngân", "Hồ Thế Vinh", "Đinh Cẩm Tú",
  "Lương Hữu Phước", "Võ Thùy Trang", "Tạ Đức Huy", "Nguyễn Yến Nhi",
  "Trần Bảo Long", "Lê Thanh Thảo", "Phạm Đình Trọng", "Đỗ Thu Uyên",
  "Vũ Quang Minh", "Hoàng Bảo Ngọc", "Bùi Nhật Tân", "Đặng Thảo Vy",
  "Ngô Tấn Phát", "Dương Hồng Nhung"
].map((name, idx) => {
  const num = idx + 1;
  const numStr = num < 10 ? `0${num}` : `${num}`;
  const cardNum = num < 10 ? `000${num}` : `00${num}`;
  return {
    id: `STU_6B_${numStr}`,
    studentCode: `HS6B${numStr}`,
    fullName: name,
    classId: 'CLASS_6B',
    cardId: `CARD_${cardNum}`,
    status: 'active',
    createdAt: new Date().toISOString()
  };
});

// Default Students for 6C (THCS Đắk Trôi)
const STUDENTS_6C = [
  "Lê Thanh Tùng", "Bùi Thu Trang", "Nguyễn Đức Anh", "Trần Mai Hoa",
  "Phạm Quang Huy", "Đỗ Hải Yến", "Vũ Hoàng Nam", "Hoàng Minh Quân",
  "Đặng Ngọc Ánh", "Ngô Quốc Thái", "Dương Thúy Kiều", "Lý Tuấn Anh",
  "Mai Thanh Hương", "Trịnh Bảo Trâm", "Phan Hữu Nghĩa", "Hồ Ngọc Diệp",
  "Đinh Văn Hùng", "Lương Kim Oanh", "Võ Đình Phúc", "Tạ Thảo Nguyên",
  "Nguyễn Văn Toàn", "Trần Thùy Chi", "Lê Tấn Sang", "Phạm Bích Thủy",
  "Đỗ Minh Nhật", "Vũ Khánh Linh", "Hoàng Đức Duy", "Bùi Quỳnh Như"
].map((name, idx) => {
  const num = idx + 1;
  const numStr = num < 10 ? `0${num}` : `${num}`;
  const cardNum = num < 10 ? `000${num}` : `00${num}`;
  return {
    id: `STU_6C_${numStr}`,
    studentCode: `HS6C${numStr}`,
    fullName: name,
    classId: 'CLASS_6C',
    cardId: `CARD_${cardNum}`,
    status: 'active',
    createdAt: new Date().toISOString()
  };
});

const DEFAULT_QUESTION = {
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
};

const DEFAULT_DB = {
  classes: [
    {
      id: 'CLASS_6A',
      code: '6A',
      name: 'Lớp 6A',
      school: 'THCS Đắk Trôi',
      teacher: 'Thầy Trần Đức Tình',
      totalStudents: 32,
      createdAt: new Date().toISOString()
    },
    {
      id: 'CLASS_6B',
      code: '6B',
      name: 'Lớp 6B',
      school: 'THCS Đắk Trôi',
      teacher: 'Thầy Trần Đức Tình',
      totalStudents: 30,
      createdAt: new Date().toISOString()
    },
    {
      id: 'CLASS_6C',
      code: '6C',
      name: 'Lớp 6C',
      school: 'THCS Đắk Trôi',
      teacher: 'Thầy Trần Đức Tình',
      totalStudents: 28,
      createdAt: new Date().toISOString()
    }
  ],
  students: [...STUDENTS_6A, ...STUDENTS_6B, ...STUDENTS_6C],
  questionBanks: [],
  activeRooms: {}
};

class ClassroomStore {
  constructor() {
    this.subscribers = new Map(); // roomCode -> Set of response callbacks
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        this.data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        // Ensure classes array has at least 6A, 6B, 6C if missing
        if (!this.data.classes || this.data.classes.length <= 1) {
          this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
          this.save();
        }
      } else {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
        this.save();
      }
    } catch (err) {
      console.warn('Error reading classroom DB, using defaults:', err.message);
      this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving classroom DB:', err.message);
    }
  }

  // SSE Realtime Subscription
  subscribe(roomCode, res) {
    if (!this.subscribers.has(roomCode)) {
      this.subscribers.set(roomCode, new Set());
    }
    this.subscribers.get(roomCode).add(res);

    // Initial event
    const room = this.getRoom(roomCode);
    res.write(`data: ${JSON.stringify({ type: 'ROOM_STATE', payload: room })}\n\n`);

    res.on('close', () => {
      if (this.subscribers.has(roomCode)) {
        this.subscribers.get(roomCode).delete(res);
      }
    });
  }

  broadcast(roomCode, eventType, payload) {
    if (this.subscribers.has(roomCode)) {
      const msg = `data: ${JSON.stringify({ type: eventType, payload })}\n\n`;
      this.subscribers.get(roomCode).forEach((res) => {
        try {
          res.write(msg);
        } catch (e) {
          console.warn('Error broadcasting to SSE subscriber:', e.message);
        }
      });
    }
  }

  // ==========================================
  // CLASSES CRUD & STUDENT MANAGEMENT
  // ==========================================
  getClasses() {
    return this.data.classes || [];
  }

  addClass({ name, code, school = 'THCS Đắk Trôi', teacher = 'Thầy Trần Đức Tình' }) {
    const id = `CLASS_${Date.now()}`;
    const cleanCode = (code || name.replace(/[^a-zA-Z0-9]/g, '')).toUpperCase();
    const newClass = {
      id,
      code: cleanCode,
      name,
      school,
      teacher,
      totalStudents: 0,
      createdAt: new Date().toISOString()
    };
    if (!this.data.classes) this.data.classes = [];
    this.data.classes.push(newClass);
    this.save();
    return newClass;
  }

  updateClass(classId, updateData) {
    const cls = (this.data.classes || []).find((c) => c.id === classId);
    if (!cls) return null;
    Object.assign(cls, updateData);
    this.save();
    return cls;
  }

  deleteClass(classId) {
    this.data.classes = (this.data.classes || []).filter((c) => c.id !== classId);
    this.data.students = (this.data.students || []).filter((s) => s.classId !== classId);
    this.save();
    return { success: true };
  }

  getStudents(classId = 'CLASS_6A') {
    return (this.data.students || []).filter((s) => !classId || s.classId === classId);
  }

  saveClassStudents(classId, studentsList) {
    let cls = (this.data.classes || []).find((c) => c.id === classId || c.code === classId || c.id === `CLASS_${classId}`);
    if (!cls) {
      const cleanCode = classId.replace(/^CLASS_/, '');
      cls = this.addClass({ name: `Lớp ${cleanCode}`, code: cleanCode });
    }

    // Remove existing students of this class
    this.data.students = (this.data.students || []).filter((s) => s.classId !== cls.id);

    const newStudents = studentsList.map((item, idx) => {
      const num = idx + 1;
      const numStr = num < 10 ? `0${num}` : `${num}`;
      const cardNum = num < 10 ? `000${num}` : `00${num}`;
      const fullName = typeof item === 'string' ? item.trim() : (item.fullName || item.name || `Học sinh ${num}`).trim();
      const cardId = typeof item === 'object' && item.cardId ? item.cardId : `CARD_${cardNum}`;
      const studentCode = typeof item === 'object' && item.studentCode ? item.studentCode : `HS${cls.code || '6'}${numStr}`;

      return {
        id: `STU_${cls.id}_${numStr}`,
        studentCode,
        fullName,
        classId: cls.id,
        cardId,
        status: 'active',
        group: `Nhóm ${((num - 1) % 4) + 1}`,
        createdAt: new Date().toISOString()
      };
    });

    if (!this.data.students) this.data.students = [];
    this.data.students.push(...newStudents);
    cls.totalStudents = newStudents.length;

    // Update active room if this class is currently in use
    Object.values(this.data.activeRooms || {}).forEach((room) => {
      if (room.classId === cls.id) {
        room.totalStudents = newStudents.length;
        this.broadcast(room.roomCode, 'ROOM_STATE', room);
      }
    });

    this.save();
    return newStudents;
  }

  // Add a single student to a class
  addStudent(classId, { fullName, studentCode, cardId }) {
    let cls = (this.data.classes || []).find((c) => c.id === classId || c.code === classId || c.id === `CLASS_${classId}`);
    if (!cls) {
      const cleanCode = classId.replace(/^CLASS_/, '');
      cls = this.addClass({ name: `Lớp ${cleanCode}`, code: cleanCode });
    }

    const currentStudents = (this.data.students || []).filter((s) => s.classId === cls.id);
    const num = currentStudents.length + 1;
    const numStr = num < 10 ? `0${num}` : `${num}`;
    const cardNum = num < 10 ? `000${num}` : `00${num}`;

    const newStudent = {
      id: `STU_${cls.id}_${Date.now()}_${numStr}`,
      studentCode: studentCode || `HS${cls.code || '6'}${numStr}`,
      fullName: (fullName || `Học sinh ${num}`).trim(),
      classId: cls.id,
      cardId: cardId || `CARD_${cardNum}`,
      status: 'active',
      group: `Nhóm ${((num - 1) % 4) + 1}`,
      createdAt: new Date().toISOString()
    };

    if (!this.data.students) this.data.students = [];
    this.data.students.push(newStudent);
    cls.totalStudents = currentStudents.length + 1;

    Object.values(this.data.activeRooms || {}).forEach((room) => {
      if (room.classId === cls.id) {
        room.totalStudents = cls.totalStudents;
        this.broadcast(room.roomCode, 'ROOM_STATE', room);
      }
    });

    this.save();
    return newStudent;
  }

  // Append a list of students to existing roster
  appendClassStudents(classId, studentsList) {
    let cls = (this.data.classes || []).find((c) => c.id === classId || c.code === classId || c.id === `CLASS_${classId}`);
    if (!cls) {
      const cleanCode = classId.replace(/^CLASS_/, '');
      cls = this.addClass({ name: `Lớp ${cleanCode}`, code: cleanCode });
    }

    const currentStudents = (this.data.students || []).filter((s) => s.classId === cls.id);
    const startIdx = currentStudents.length;

    const newStudents = studentsList.map((item, idx) => {
      const num = startIdx + idx + 1;
      const numStr = num < 10 ? `0${num}` : `${num}`;
      const cardNum = num < 10 ? `000${num}` : `00${num}`;
      const fullName = typeof item === 'string' ? item.trim() : (item.fullName || item.name || `Học sinh ${num}`).trim();
      const cardId = typeof item === 'object' && item.cardId ? item.cardId : `CARD_${cardNum}`;
      const studentCode = typeof item === 'object' && item.studentCode ? item.studentCode : `HS${cls.code || '6'}${numStr}`;

      return {
        id: `STU_${cls.id}_${numStr}`,
        studentCode,
        fullName,
        classId: cls.id,
        cardId,
        status: 'active',
        group: `Nhóm ${((num - 1) % 4) + 1}`,
        createdAt: new Date().toISOString()
      };
    });

    if (!this.data.students) this.data.students = [];
    this.data.students.push(...newStudents);
    cls.totalStudents = currentStudents.length + newStudents.length;

    Object.values(this.data.activeRooms || {}).forEach((room) => {
      if (room.classId === cls.id) {
        room.totalStudents = cls.totalStudents;
        this.broadcast(room.roomCode, 'ROOM_STATE', room);
      }
    });

    this.save();
    return (this.data.students || []).filter((s) => s.classId === cls.id);
  }

  // Delete a student from class and re-sequence QR cards
  deleteStudent(studentId) {
    const student = (this.data.students || []).find((s) => s.id === studentId);
    if (!student) return { success: false, error: 'Học sinh không tồn tại' };

    const classId = student.classId;
    this.data.students = (this.data.students || []).filter((s) => s.id !== studentId);

    // Re-index remaining students
    const remaining = (this.data.students || []).filter((s) => s.classId === classId);
    remaining.forEach((s, idx) => {
      const num = idx + 1;
      const numStr = num < 10 ? `0${num}` : `${num}`;
      const cardNum = num < 10 ? `000${num}` : `00${num}`;
      s.cardId = `CARD_${cardNum}`;
      s.group = `Nhóm ${((num - 1) % 4) + 1}`;
    });

    const cls = (this.data.classes || []).find((c) => c.id === classId);
    if (cls) {
      cls.totalStudents = remaining.length;
    }

    Object.values(this.data.activeRooms || {}).forEach((room) => {
      if (room.classId === classId) {
        room.totalStudents = remaining.length;
        this.broadcast(room.roomCode, 'ROOM_STATE', room);
      }
    });

    this.save();
    return { success: true, remaining };
  }

  updateStudent(studentId, { fullName, cardId, studentCode }) {
    const student = (this.data.students || []).find((s) => s.id === studentId);
    if (!student) return null;
    if (fullName) student.fullName = fullName.trim();
    if (cardId) student.cardId = cardId.trim();
    if (studentCode) student.studentCode = studentCode.trim();
    this.save();
    return student;
  }

  findStudentByCardId(cardId, classId = null) {
    const list = classId 
      ? (this.data.students || []).filter((s) => s.classId === classId)
      : (this.data.students || []);
    return list.find((s) => s.cardId === cardId || s.cardId === `CARD_${cardId}`);
  }

  // ==========================================
  // ROOM MANAGEMENT & SWITCHING CLASS
  // ==========================================
  createRoom(roomCode = 'WB-601', classId = 'CLASS_6A') {
    const existing = this.data.activeRooms[roomCode];
    if (existing) {
      return existing;
    }

    const cls = (this.data.classes || []).find((c) => c.id === classId) || { name: 'Lớp 6A' };
    const students = this.getStudents(classId);
    const room = {
      roomCode,
      classId,
      className: cls.name,
      school: 'THCS Đắk Trôi',
      currentQuestion: DEFAULT_QUESTION,
      activeQuestion: DEFAULT_QUESTION,
      questionState: 'COLLECTING',
      activeQuestionIndex: 0,
      totalStudents: students.length,
      studentResponses: {},
      responses: {},
      groupSubmissions: {},
      groupWorks: {},
      history: [],
      createdAt: new Date().toISOString()
    };

    this.data.activeRooms[roomCode] = room;
    this.save();
    return room;
  }

  getRoom(roomCode = 'WB-601') {
    if (!this.data.activeRooms[roomCode]) {
      return this.createRoom(roomCode);
    }
    const room = this.data.activeRooms[roomCode];
    // Ensure compatibility mappings
    if (!room.activeQuestion && room.currentQuestion) room.activeQuestion = room.currentQuestion;
    if (!room.currentQuestion && room.activeQuestion) room.currentQuestion = room.activeQuestion;
    if (!room.responses) room.responses = {};
    if (!room.groupWorks) room.groupWorks = {};
    if (!room.className) {
      const cls = (this.data.classes || []).find((c) => c.id === room.classId);
      room.className = cls ? cls.name : 'Lớp 6A';
    }
    return room;
  }

  // Switch Room Class dynamically for this session/room
  setRoomClass(roomCode, classId) {
    const room = this.getRoom(roomCode);
    const cls = (this.data.classes || []).find((c) => c.id === classId);
    if (!cls) return room;

    room.classId = classId;
    room.className = cls.name;
    const students = this.getStudents(classId);
    room.totalStudents = students.length;
    room.studentResponses = {}; // reset responses for new class
    room.responses = {};
    const analytics = this.calculateAnalytics(roomCode);
    room.analytics = analytics;

    this.save();
    this.broadcast(roomCode, 'ROOM_CLASS_CHANGED', room);
    this.broadcast(roomCode, 'ROOM_STATE', room);
    return room;
  }

  setQuestion(roomCode, questionData, state = 'COLLECTING') {
    const room = this.getRoom(roomCode);
    room.currentQuestion = questionData;
    room.activeQuestion = questionData;
    room.questionState = state;
    room.studentResponses = {}; // reset for new question
    room.responses = {};
    this.save();
    this.broadcast(roomCode, 'QUESTION_UPDATED', room);
    return room;
  }

  lockQuestion(roomCode) {
    const room = this.getRoom(roomCode);
    room.questionState = 'LOCKED';
    this.save();
    this.broadcast(roomCode, 'QUESTION_LOCKED', room);
    return room;
  }

  revealAnswer(roomCode) {
    const room = this.getRoom(roomCode);
    room.questionState = 'REVEALED';

    const correctOpt = room.currentQuestion?.correctAnswer;
    Object.values(room.studentResponses).forEach((resp) => {
      resp.isCorrect = resp.answer === correctOpt;
    });
    Object.values(room.responses).forEach((resp) => {
      resp.isCorrect = resp.answer === correctOpt;
    });

    const analytics = this.calculateAnalytics(roomCode);
    room.analytics = analytics;

    this.save();
    this.broadcast(roomCode, 'ANSWER_REVEALED', room);
    return room;
  }

  // Submit Answer from Camera Scanner (Single or Batch)
  submitResponses(roomCode, responsesList) {
    const room = this.getRoom(roomCode);

    if (room.questionState === 'LOCKED' || room.questionState === 'COMPLETED') {
      return { warning: 'Question is locked. Cannot accept answers.', room };
    }

    const correctOpt = room.currentQuestion?.correctAnswer;
    const activeClassId = room.classId || 'CLASS_6A';

    responsesList.forEach((item) => {
      // Map cardId to the student of the CURRENT CLASS assigned to this room!
      const student = this.findStudentByCardId(item.cardId, activeClassId);
      if (!student) return;

      const answer = (item.answer || '').toUpperCase();
      const isCorrect = correctOpt ? answer === correctOpt : false;

      const respObj = {
        studentId: student.id,
        studentCode: student.studentCode,
        fullName: student.fullName,
        studentName: student.fullName,
        cardId: student.cardId,
        rotation: item.rotation || item.angle || 0,
        angle: item.angle || item.rotation || 0,
        answer,
        isCorrect,
        timestamp: new Date().toISOString()
      };

      room.studentResponses[student.id] = respObj;
      room.responses[student.cardId] = respObj; // Map directly by cardId for UI
    });

    const analytics = this.calculateAnalytics(roomCode);
    room.analytics = analytics;

    this.save();
    this.broadcast(roomCode, 'RESPONSES_UPDATED', room);
    return { 
      success: true, 
      totalAnswered: Object.keys(room.responses).length, 
      room,
      analytics 
    };
  }

  // Group Work Paper Submission
  submitGroupWork(roomCode, { groupNumber, imageUrl, caption = '' }) {
    const room = this.getRoom(roomCode);
    const gNum = parseInt(groupNumber, 10);
    const grpKey = `group_${gNum}`;

    const item = {
      groupNumber: gNum,
      imageUrl,
      caption,
      timestamp: new Date().toISOString()
    };

    room.groupSubmissions[grpKey] = item;
    room.groupWorks[gNum] = item;

    this.save();
    this.broadcast(roomCode, 'GROUP_WORK_SUBMITTED', room);
    return { success: true, status: 'uploaded', group: item, room };
  }

  // Analytics Computation
  calculateAnalytics(roomCode) {
    const room = this.getRoom(roomCode);
    const totalStudents = room.totalStudents || 32;
    const responses = Object.values(room.responses || {});
    const totalAnswered = responses.length;
    const totalUnanswered = Math.max(0, totalStudents - totalAnswered);

    const correctOpt = room.currentQuestion?.correctAnswer;
    let totalCorrect = 0;
    let totalIncorrect = 0;

    const choiceDistribution = { A: 0, B: 0, C: 0, D: 0 };

    responses.forEach((r) => {
      if (choiceDistribution[r.answer] !== undefined) {
        choiceDistribution[r.answer]++;
      }
      if (correctOpt) {
        if (r.answer === correctOpt) {
          totalCorrect++;
        } else {
          totalIncorrect++;
        }
      }
    });

    const percentageCorrectOnAnswered = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    const percentageCorrectOnTotal = totalStudents > 0 ? Math.round((totalCorrect / totalStudents) * 100) : 0;

    return {
      roomCode,
      classId: room.classId,
      className: room.className,
      questionText: room.currentQuestion?.questionText || '',
      correctAnswer: correctOpt,
      totalStudents,
      totalAnswered,
      totalUnanswered,
      totalCorrect,
      totalIncorrect,
      percentageCorrectOnAnswered,
      percentageCorrectOnTotal,
      choiceDistribution
    };
  }

  // ==========================================
  // SMAS & UNIVERSAL EXCEL PARSER & AUTO-IMPORT
  // ==========================================
  parseSmasWorkbook(workbook) {
    const result = [];
    const schoolDefault = 'TRƯỜNG TH & THCS ĐĂK TRÔI';

    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName];
      if (!ws) continue;
      const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 });
      if (!rawData || rawData.length === 0) continue;

      // School name
      let school = schoolDefault;
      if (rawData[3] && rawData[3][0] && typeof rawData[3][0] === 'string') {
        school = rawData[3][0].trim();
      }

      // Class code & name
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

      // Detect column indices dynamically
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

      const students = [];
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

        const num = students.length + 1;
        const numStr = num < 10 ? `0${num}` : `${num}`;
        const cardNum = num < 10 ? `000${num}` : `00${num}`;
        const stuCode = (codeCol !== -1 && row[codeCol]) ? String(row[codeCol]).trim() : (`HS${classCode}${numStr}`);

        students.push({
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

      if (students.length > 0) {
        result.push({
          id: classId,
          code: classCode,
          name: className,
          school: school,
          teacher: 'Thầy Trần Đức Tình',
          totalStudents: students.length,
          students: students,
          sheetName: sheetName
        });
      }
    }

    return result;
  }

  detectLocalSmasFile(filePath = null) {
    const targetPath = (filePath && typeof filePath === 'string' && filePath.trim()) ? filePath.trim() : DEFAULT_SMAS_PATH;
    try {
      if (fs.existsSync(targetPath)) {
        const wb = xlsx.readFile(targetPath);
        const parsed = this.parseSmasWorkbook(wb);
        return {
          detected: true,
          filePath: targetPath,
          sheetsCount: wb.SheetNames.length,
          classes: parsed.map(c => ({
            id: c.id,
            code: c.code,
            name: c.name,
            school: c.school,
            totalStudents: c.totalStudents,
            sheetName: c.sheetName,
            sampleStudents: c.students.slice(0, 3).map(s => s.fullName)
          }))
        };
      }
      return { detected: false, filePath: targetPath, classes: [] };
    } catch (err) {
      console.warn('Error detecting local SMAS file:', err.message);
      return { detected: false, error: err.message, filePath: targetPath, classes: [] };
    }
  }

  importSmasData(parsedClasses, classCodesToImport = null) {
    const importedClasses = [];
    const classesToProcess = classCodesToImport && classCodesToImport.length > 0
      ? parsedClasses.filter(c => classCodesToImport.includes(c.id) || classCodesToImport.includes(c.code))
      : parsedClasses;

    for (const item of classesToProcess) {
      let cls = (this.data.classes || []).find(c => c.id === item.id || c.code === item.code);
      if (!cls) {
        cls = {
          id: item.id,
          code: item.code,
          name: item.name,
          school: item.school,
          teacher: item.teacher,
          totalStudents: item.students.length,
          createdAt: new Date().toISOString()
        };
        if (!this.data.classes) this.data.classes = [];
        this.data.classes.push(cls);
      } else {
        cls.name = item.name;
        cls.school = item.school;
        cls.teacher = item.teacher;
        cls.totalStudents = item.students.length;
      }

      // Replace students for this class
      this.data.students = (this.data.students || []).filter(s => s.classId !== cls.id);
      this.data.students.push(...item.students);

      // Update active rooms using this class
      Object.values(this.data.activeRooms || {}).forEach(room => {
        if (room.classId === cls.id) {
          room.totalStudents = item.students.length;
          room.className = cls.name;
          this.broadcast(room.roomCode, 'ROOM_STATE', room);
        }
      });

      importedClasses.push(cls);
    }

    this.save();
    return {
      success: true,
      importedCount: importedClasses.length,
      classes: importedClasses,
      totalStudents: this.data.students.length
    };
  }

  importLocalSmas(filePath = null, classCodesToImport = null) {
    const targetPath = (filePath && typeof filePath === 'string' && filePath.trim()) ? filePath.trim() : DEFAULT_SMAS_PATH;
    if (!fs.existsSync(targetPath)) {
      throw new Error(`Không tìm thấy file SMAS tại đường dẫn: ${targetPath}`);
    }
    const wb = xlsx.readFile(targetPath);
    const parsed = this.parseSmasWorkbook(wb);
    return this.importSmasData(parsed, classCodesToImport);
  }

  importUploadedSmasBuffer(buffer, classCodesToImport = null) {
    const wb = xlsx.read(buffer, { type: 'buffer' });
    const parsed = this.parseSmasWorkbook(wb);
    return this.importSmasData(parsed, classCodesToImport);
  }
}

export const classroomStore = new ClassroomStore();
