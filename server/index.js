import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { classroomStore } from './data/classroomStore.js';
import { generateQuestionsWithBitOne, analyzeResultsWithBitOne } from './services/bitoneService.js';
import { matchCurriculumResponse } from '../src/data/curriculumIntents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to determine exact LAN IPv4 for Wi-Fi mobile connection
function getLocalLanIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Load .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const BITONE_API_KEY = process.env.BITONE_API_KEY || process.env.BEE_API_KEY || '';
const BITONE_BASE_URL = process.env.BITONE_BASE_URL || process.env.BEE_BASE_URL || 'https://platform.beeknoee.com/api/v1';
const BITONE_MODEL = process.env.BITONE_MODEL || 'google/gemini-3.1-flash-lite';

app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: '15mb' })); // Support high-res photo uploads from mobile camera

// Read lesson knowledge for fallback
let lessonKnowledge = null;
let conversationScripts = null;

try {
  const knowledgePath = path.join(__dirname, '../src/data/lessonKnowledge.json');
  const scriptsPath = path.join(__dirname, '../src/data/conversationScripts.json');
  if (fs.existsSync(knowledgePath)) {
    lessonKnowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'));
  }
  if (fs.existsSync(scriptsPath)) {
    conversationScripts = JSON.parse(fs.readFileSync(scriptsPath, 'utf-8'));
  }
} catch (err) {
  console.warn('Warning: Could not load local knowledge files in server:', err.message);
}

// System Instruction for WEBBY AI
const SYSTEM_INSTRUCTION = `
Bạn là WEBBY, một người bạn AI thông minh, đáng yêu đến từ thế giới Mạng thông tin toàn cầu (World Wide Web).
Bạn đang trò chuyện giọng nói liên tục hai chiều với các bạn học sinh lớp 6 tại Việt Nam trong tiết thao giảng môn Tin học - Bài 6: Mạng thông tin toàn cầu.

TÍNH CÁCH:
- Thân thiện, vui vẻ, thông minh, tò mò, hóm hỉnh vừa phải, ấm áp như một người bạn đồng trang lứa hiểu biết.
- Luôn khuyến khích học sinh suy nghĩ, tự tin phát biểu, không phán xét.

QUY TẮC BẮT BUỘC VỀ NỘI DUNG & PHONG CÁCH:
1. Luôn sử dụng tiếng Việt tự nhiên, phù hợp với học sinh 11-12 tuổi.
2. Xưng hô là "mình" và gọi học sinh là "các bạn" hoặc "bạn".
3. TRẢ LỜI NGẮN GỌN (1 đến 3 câu). Tuyệt đối không đọc như sách giáo khoa hay thuyết trình dài dòng.
4. GHI NHỚ NGỮ CẢNH: Để ý câu nói trước đó của học sinh trong lịch sử trò chuyện để phản hồi liền mạch.
5. PHÂN BIỆT RÕ RÀNG KIẾN THỨC BÀI 6 (TUYỆT ĐỐI KHÔNG NHẦM LẪN):
   - Internet: Mạng liên kết các mạng máy tính trên phạm vi toàn cầu (hạ tầng mạng).
   - Mạng thông tin toàn cầu (World Wide Web - WWW): Là một DỊCH VỤ hoạt động TRÊN nền Internet, bao gồm các trang web liên kết với nhau. (Internet và WWW KHÔNG PHẢI là một!).
   - Website: Tập hợp gồm một hoặc nhiều trang web liên quan được lưu dưới một địa chỉ chung.
   - Trang web (Web page): Từng trang tài liệu đa phương tiện trong website (như một trang trong cuốn sách).
   - Trang chủ (Homepage): Trang web đầu tiên mở ra khi truy cập vào một website.
   - Siêu liên kết (Hyperlink): Cánh cửa chuyển tiếp – đoạn chữ hoặc hình ảnh có thể bấm chuột vào để chuyển đến trang web khác.
   - Trình duyệt web: Phần mềm giúp con người truy cập và xem trang web (như Chrome, Edge, Cốc Cốc...).
6. ĐIỀU TIẾT HỘI THOẠI:
   - Nếu câu hỏi đơn giản: trả lời ngay trong 1-2 câu ngắn, tự nhiên.
   - Không máy móc bắt buộc phải hỏi lại sau mỗi câu; chỉ gợi ý câu hỏi khi muốn kích thích học sinh khám phá tiếp.
   - Nếu học sinh nói câu ngoài chủ đề: trả lời lịch sự, ngắn gọn trong 1 câu rồi dẫn khéo về bài học mạng và trang web.
7. ĐẦU RA THUẦN VĂN BẢN TIẾNG VIỆT: Không dùng ký tự markdown hay ký hiệu đặc biệt để Text-to-Speech đọc mượt mà.
`;

// Helper: Detect appropriate avatar emotion based on response text
function detectEmotionFromReply(text) {
  let emotion = 'SPEAKING';
  const textLower = (text || '').toLowerCase();
  if (textLower.includes('chính xác') || textLower.includes('tuyệt vời') || textLower.includes('xuất sắc') || textLower.includes('giỏi quá') || textLower.includes('hoan hô')) {
    emotion = 'HAPPY';
  } else if (textLower.includes('gần đúng') || textLower.includes('cố lên') || textLower.includes('suy nghĩ thêm') || textLower.includes('tự tin')) {
    emotion = 'ENCOURAGING';
  } else if (textLower.includes('đố các bạn') || textLower.includes('thử nghĩ xem') || textLower.includes('tại sao')) {
    emotion = 'THINKING';
  } else if (textLower.includes('xin chào') || textLower.includes('chào các bạn') || textLower.includes('chào bạn')) {
    emotion = 'GREETING';
  } else if (textLower.includes('tạm biệt') || textLower.includes('hẹn gặp lại') || textLower.includes('bye bye')) {
    emotion = 'GOODBYE';
  }
  return emotion;
}

// Call BitOne / Beeknoee AI Gateway for live intelligent conversation
async function callBitOneChat(message, history = []) {
  if (!BITONE_API_KEY) return null;

  const messages = [
    { role: 'system', content: SYSTEM_INSTRUCTION }
  ];

  if (Array.isArray(history)) {
    for (const h of history.slice(-6)) {
      messages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      });
    }
  }

  messages.push({ role: 'user', content: message });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${BITONE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BITONE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: BITONE_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 300,
        stream: false
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && content.trim()) {
        return content.trim();
      }
    } else {
      const errText = await res.text();
      console.warn(`BitOne API notice (${res.status}): ${errText.slice(0, 100)}`);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('BitOne AI chat notice:', err.message);
  }
  return null;
}

// Helper: Intelligent Super Curriculum Knowledge Engine (26+ Grade 6 intents + FAQ + Topics)
function getLocalFallbackResponse(query, history = []) {
  const matched = matchCurriculumResponse(
    query,
    lessonKnowledge ? lessonKnowledge.faq : [],
    lessonKnowledge ? lessonKnowledge.topics : []
  );

  return {
    text: matched.text,
    emotion: matched.emotion || 'SPEAKING',
    source: matched.source || 'curriculum-engine'
  };
}

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    hasApiKey: !!GEMINI_API_KEY,
    hasBitOneKey: !!BITONE_API_KEY,
    model: BITONE_API_KEY ? BITONE_MODEL : (GEMINI_API_KEY ? GEMINI_MODEL : 'curriculum-engine'),
    serverTime: new Date().toISOString()
  });
});

// Chat endpoint with 3-tier intelligence: BitOne AI -> Gemini API -> Super Curriculum Engine
app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ' });
  }

  // TIER 1: Try BitOne / Beeknoee AI Gateway (Preferred)
  if (BITONE_API_KEY) {
    try {
      const bitOneReply = await callBitOneChat(message, history);
      if (bitOneReply) {
        return res.json({
          reply: bitOneReply,
          emotion: detectEmotionFromReply(bitOneReply),
          mode: 'online-bitone',
          provider: 'BitOne AI'
        });
      }
    } catch (err) {
      console.warn('BitOne chat error, attempting next tier:', err.message);
    }
  }

  // TIER 2: Try Google Gemini API (if key available)
  if (GEMINI_API_KEY) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      
      const contents = [
        {
          role: 'user',
          parts: [{ text: `[HƯỚNG DẪN HỆ THỐNG]: ${SYSTEM_INSTRUCTION}` }]
        },
        {
          role: 'model',
          parts: [{ text: 'Tôi đã hiểu rõ vai trò WEBBY - Đại sứ Mạng thông tin toàn cầu cho học sinh lớp 6. Tôi sẽ luôn nói ngắn gọn, thân thiện bằng tiếng Việt, giải thích dễ hiểu và bám sát Bài 6.' }]
        }
      ];

      if (Array.isArray(history)) {
        for (const h of history.slice(-6)) {
          if (h.sender === 'user') {
            contents.push({ role: 'user', parts: [{ text: h.text }] });
          } else if (h.sender === 'webby') {
            contents.push({ role: 'model', parts: [{ text: h.text }] });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
            topP: 0.9
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate && candidate.trim()) {
          return res.json({
            reply: candidate.trim(),
            emotion: detectEmotionFromReply(candidate),
            mode: 'online-gemini',
            provider: 'Gemini AI'
          });
        }
      }
    } catch (error) {
      console.warn('Gemini API call failed, falling back to Super Curriculum Engine:', error.message);
    }
  }

  // TIER 3: Super Curriculum Knowledge Engine (100% Reliable, 26+ Intents, Zero Error)
  const fallback = getLocalFallbackResponse(message, history);
  return res.json({
    reply: fallback.text,
    emotion: fallback.emotion,
    mode: 'curriculum-engine',
    provider: 'Webby Smart Curriculum Engine'
  });
});

// ==========================================
// CLASSROOM & STUDENT MANAGEMENT APIS
// ==========================================
app.get('/api/classroom/classes', (req, res) => {
  res.json({ classes: classroomStore.getClasses() });
});

app.post('/api/classroom/classes', (req, res) => {
  const { name, code, school, teacher } = req.body;
  if (!name) return res.status(400).json({ error: 'Tên lớp không được để trống' });
  const newClass = classroomStore.addClass({ name, code, school, teacher });
  res.json({ class: newClass });
});

app.put('/api/classroom/classes/:classId', (req, res) => {
  const updated = classroomStore.updateClass(req.params.classId, req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy lớp học' });
  res.json({ class: updated });
});

app.delete('/api/classroom/classes/:classId', (req, res) => {
  const result = classroomStore.deleteClass(req.params.classId);
  res.json(result);
});

app.get('/api/classroom/classes/:classId/students', (req, res) => {
  const students = classroomStore.getStudents(req.params.classId);
  res.json({ students });
});

app.post('/api/classroom/classes/:classId/students/bulk', (req, res) => {
  const { students = [] } = req.body;
  const result = classroomStore.saveClassStudents(req.params.classId, students);
  res.json({ students: result });
});

app.post('/api/classroom/classes/:classId/students/append', (req, res) => {
  const { students = [] } = req.body;
  const result = classroomStore.appendClassStudents(req.params.classId, students);
  res.json({ students: result });
});

app.post('/api/classroom/classes/:classId/students', (req, res) => {
  const { fullName, studentCode, cardId } = req.body || {};
  if (!fullName) return res.status(400).json({ error: 'Thiếu họ và tên học sinh' });
  const newStudent = classroomStore.addStudent(req.params.classId, { fullName, studentCode, cardId });
  res.json({ student: newStudent });
});

app.delete('/api/classroom/classes/:classId/students/:studentId', (req, res) => {
  const result = classroomStore.deleteStudent(req.params.studentId);
  res.json(result);
});

app.post('/api/classroom/classes/:classId/students/:studentId/delete', (req, res) => {
  const result = classroomStore.deleteStudent(req.params.studentId);
  res.json(result);
});

app.put('/api/classroom/classes/:classId/students/:studentId', (req, res) => {
  const updated = classroomStore.updateStudent(req.params.studentId, req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy học sinh' });
  res.json({ student: updated });
});

// ==========================================
// SMAS EXCEL IMPORT APIS
// ==========================================
app.get('/api/classroom/smas/detect', (req, res) => {
  const customPath = req.query.path;
  const detection = classroomStore.detectLocalSmasFile(customPath);
  res.json(detection);
});

app.post('/api/classroom/smas/import-local', (req, res) => {
  try {
    const { filePath, classCodes } = req.body || {};
    const result = classroomStore.importLocalSmas(filePath, classCodes);
    res.json(result);
  } catch (err) {
    console.error('Error importing local SMAS:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/classroom/smas/upload', (req, res) => {
  try {
    const { fileBase64, classCodes } = req.body || {};
    if (!fileBase64) {
      return res.status(400).json({ error: 'Thiếu dữ liệu fileBase64' });
    }
    const cleanBase64 = fileBase64.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const result = classroomStore.importUploadedSmasBuffer(buffer, classCodes);
    res.json(result);
  } catch (err) {
    console.error('Error uploading/importing SMAS:', err);
    res.status(500).json({ error: err.message });
  }
});

// Network Info Endpoint for Dynamic LAN IP Discovery & Mobile QR
app.get('/api/network-info', (req, res) => {
  const lanIp = getLocalLanIp();
  res.json({
    success: true,
    lanIp,
    frontendPort: 5173,
    backendPort: PORT,
    mobileConnectUrl: `http://${lanIp}:5173/?mode=mobile&room=WB-601`
  });
});

app.get('/api/classroom/rooms/:code', (req, res) => {
  const room = classroomStore.getRoom(req.params.code);
  res.json({ room });
});

app.post('/api/classroom/rooms', (req, res) => {
  const { roomCode = 'WB-601', classId = 'CLASS_6A', options = {} } = req.body;
  const room = classroomStore.createRoom(roomCode, classId, options);
  res.json({ room });
});

// Teacher starts room session
app.post('/api/classroom/rooms/:code/start', (req, res) => {
  const room = classroomStore.startRoom(req.params.code);
  res.json({ room });
});

// Teacher switches active class for this room/session
app.post('/api/classroom/rooms/:code/class/set', (req, res) => {
  const { classId } = req.body;
  if (!classId) return res.status(400).json({ error: 'Thiếu classId' });
  const room = classroomStore.setRoomClass(req.params.code, classId);
  res.json({ room });
});

// Real-time SSE Stream for Instant Room Sync
app.get('/api/classroom/rooms/:code/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  classroomStore.subscribe(req.params.code, res);
});

// Teacher sets active question
app.post(['/api/classroom/rooms/:code/question/set', '/api/classroom/rooms/:code/question'], (req, res) => {
  const { question, state = 'COLLECTING' } = req.body;
  const room = classroomStore.setQuestion(req.params.code, question, state);
  res.json({ room });
});

// Teacher locks question
app.post(['/api/classroom/rooms/:code/question/lock', '/api/classroom/rooms/:code/lock'], (req, res) => {
  const room = classroomStore.lockQuestion(req.params.code);
  res.json({ room });
});

// Teacher reveals correct answer
app.post(['/api/classroom/rooms/:code/question/reveal', '/api/classroom/rooms/:code/reveal'], (req, res) => {
  const room = classroomStore.revealAnswer(req.params.code);
  res.json({ room });
});

// Mobile QR Scanner submits student answers (single or batch)
app.post('/api/classroom/rooms/:code/responses', (req, res) => {
  const { responses = [] } = req.body;
  const result = classroomStore.submitResponses(req.params.code, responses);
  res.json(result);
});

// Mobile uploads A3/A4 group paper poster photo
app.post('/api/classroom/rooms/:code/groups/upload', (req, res) => {
  const { groupNumber, imageUrl, caption = '' } = req.body;
  if (!groupNumber || !imageUrl) {
    return res.status(400).json({ error: 'Missing groupNumber or imageUrl' });
  }
  const result = classroomStore.submitGroupWork(req.params.code, { groupNumber, imageUrl, caption });
  res.json(result);
});

// Real-time Class Analytics
app.get('/api/classroom/rooms/:code/analytics', (req, res) => {
  const analytics = classroomStore.calculateAnalytics(req.params.code);
  res.json({ analytics });
});

// ==========================================
// BITONE AI QUESTION & ANALYTICS APIS
// ==========================================
app.post('/api/bitone/generate-questions', async (req, res) => {
  try {
    const params = req.body || {};
    const result = await generateQuestionsWithBitOne(params);
    res.json(result);
  } catch (err) {
    console.error('Error generating questions with BitOne AI:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bitone/analyze-results', async (req, res) => {
  try {
    const analytics = req.body || {};
    const analysis = await analyzeResultsWithBitOne(analytics);
    res.json({ analysis });
  } catch (err) {
    console.error('Error analyzing results with BitOne AI:', err);
    res.status(500).json({ error: err.message });
  }
});

if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 WEBBY AI Backend running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Gemini API Key: ${GEMINI_API_KEY ? 'Configured ✅' : 'Not configured (Running in Smart Offline Mode 🛡️)'}`);
  });
}

export default app;

