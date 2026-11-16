# CẤU TRÚC DỮ LIỆU & QUẢN TRỊ BỘ NHỚ (DATABASE SCHEMA)
## SHARED DATA REPOSITORY SPECIFICATION

---

### 1. FILE-BASED PERSISTENT STORAGE
Dữ liệu được lưu trữ tập trung tại:
- **Local / LAN**: `server/data/classroomDB.json`
- **Vercel Serverless**: `/tmp/classroomDB.json` (bảo vệ tránh lỗi Read-only Filesystem của AWS Lambda/Vercel Serverless)

---

### 2. ROOM OBJECT SCHEMA (PHÒNG CHƠI QUIZ)

```typescript
interface QuizRoom {
  id: string;                      // "ROOM_WB-601_1740000000000"
  roomCode: string;                // "WB-601"
  classId: string;                 // "CLASS_6B"
  className: string;               // "Lớp 6B"
  school: string;                  // "THCS Đắk Trôi"
  status: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'ENDED';
  
  // Câu hỏi đang hoạt động
  activeQuestion: {
    id: string;                    // "Q_01"
    questionText: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    bloomLevel?: string;
    difficulty?: string;
  };
  
  // Trạng thái thu bài
  questionState: 'COLLECTING' | 'LOCKED' | 'REVEALED';
  totalStudents: number;           // 33

  // Danh sách đáp án học sinh (Được cập nhật tự động khi quét thẻ)
  responses: {
    [cardIdOrStudentId: string]: {
      studentId: string;
      studentCode: string;
      fullName: string;
      studentName: string;
      cardId: string;              // "CARD_0001"
      rotation: number;            // Góc xoay (0, 90, 180, 270)
      angle: number;
      answer: 'A' | 'B' | 'C' | 'D';
      isCorrect: boolean;
      revision: number;            // 1 cho lần nộp đầu, 2+ nếu xoay thẻ đổi đáp án
      previousAnswer: string | null;
      scannedAt: string;           // ISO 8601
      updatedAt: string;
      timestamp: string;
    };
  };

  // Bài làm nhóm chụp từ điện thoại (A3/A4)
  groupWorks: {
    [groupNumber: number]: {
      groupNumber: number;
      imageUrl: string;            // Base64 ảnh đã nén
      caption: string;
      timestamp: string;
    };
  };

  // Thống kê kết quả theo thời gian thực
  analytics?: {
    totalStudents: number;
    totalAnswered: number;
    totalUnanswered: number;
    totalCorrect: number;
    totalIncorrect: number;
    percentageCorrectOnAnswered: number;
    percentageCorrectOnTotal: number;
    choiceDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
    };
  };

  createdAt: string;
  startedAt: string;
  lastUpdated: string;
}
```

---

### 3. STUDENT & CLASS OBJECT SCHEMA

```typescript
interface Student {
  id: string;                      // "STU_1730000000000_1"
  classId: string;                 // "CLASS_6B"
  studentCode: string;             // "HS-6B-01"
  fullName: string;                // "Y Thoan Niê"
  gender: 'Nam' | 'Nữ';
  birthDate: string;               // "2013-05-12"
  cardId: string;                  // "CARD_0001" (Được sinh theo STT trong lớp)
  group: string;                   // "Nhóm 1"
  createdAt: string;
}

interface Classroom {
  id: string;                      // "CLASS_6B"
  code: string;                    // "6B"
  name: string;                    // "Lớp 6B"
  school: string;                  // "THCS Đắk Trôi"
  teacher: string;                 // "Thầy Trần Đức Tình"
  totalStudents: number;           // 33
  createdAt: string;
}
```

---

### 4. QUY TẮC ĐÁNH MÃ CARD_ID & QUẢN LÝ THẺ

1. **Thẻ Webby QR**:
   - `CARD_0001` -> STT 1 trong danh sách lớp.
   - `CARD_0002` -> STT 2 trong danh sách lớp.
2. **Thẻ Quizizz Paper Mode (ArUco 4x4)**:
   - Thẻ `P 1` (Participant 1) -> Khớp tự động với STT 1 (`CARD_0001`).
   - Thẻ `P 2` (Participant 2) -> Khớp tự động với STT 2 (`CARD_0002`).
3. **Khi xoá hoặc nhập thêm học sinh**:
   - Hệ thống tự động re-index lại số thẻ (`re-sequence`), đảm bảo không có lỗ hổng số thẻ và luôn tương thích hoàn toàn với bộ thẻ Quizizz giáo viên đã in.
