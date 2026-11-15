import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'classroomDB.json');

// Initial default database with 32 students for Lớp 6A (THCS Đắk Trôi)
const DEFAULT_STUDENTS = [
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
    id: `STU_${numStr}`,
    studentCode: `HS6A${numStr}`,
    fullName: name,
    classId: 'CLASS_6A',
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
    }
  ],
  students: DEFAULT_STUDENTS,
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

  // Classes & Students
  getClasses() {
    return this.data.classes || [];
  }

  getStudents(classId = 'CLASS_6A') {
    return (this.data.students || []).filter((s) => !classId || s.classId === classId);
  }

  findStudentByCardId(cardId) {
    return (this.data.students || []).find((s) => s.cardId === cardId || s.cardId === `CARD_${cardId}`);
  }

  // Room Management
  createRoom(roomCode = 'WB-601', classId = 'CLASS_6A') {
    const existing = this.data.activeRooms[roomCode];
    if (existing) {
      return existing;
    }

    const students = this.getStudents(classId);
    const room = {
      roomCode,
      classId,
      school: 'THCS Đắk Trôi',
      currentQuestion: DEFAULT_QUESTION,
      activeQuestion: DEFAULT_QUESTION,
      questionState: 'COLLECTING', // Start ready to accept student QR answers!
      activeQuestionIndex: 0,
      totalStudents: students.length,
      studentResponses: {}, // studentId -> item
      responses: {},        // cardId -> item (for direct cardId lookup in frontend)
      groupSubmissions: {}, // group_1 -> item
      groupWorks: {},       // 1 -> item
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

    responsesList.forEach((item) => {
      const student = this.findStudentByCardId(item.cardId);
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
    room.groupWorks[gNum] = item; // Map directly by integer group number

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
}

export const classroomStore = new ClassroomStore();
