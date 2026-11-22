import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { classroomStore } from './data/classroomStore.js';
import { generateQuestionsWithBitOne, analyzeResultsWithBitOne } from './services/bitoneService.js';
import { voiceService } from './services/voiceService.js';
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

// Static directories for voice files and audio assets
app.use('/audio_generated', express.static(path.join(__dirname, '../public/audio_generated')));
app.use('/voice_samples', express.static(path.join(__dirname, '../public/voice_samples')));

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

// System Instruction for Mark AI - Intelligent Learning Assistant for Grade 6
const SYSTEM_INSTRUCTION = `
Bạn là Mark, một trợ lý AI học tập thông minh, thân thiện và ấm áp dành cho học sinh trung học cơ sở (lớp 6) tại Việt Nam trong tiết thao giảng môn Tin học - Bài 6: Mạng thông tin toàn cầu.

NHIỆM VỤ CỦA BẠN:
Trò chuyện, hướng dẫn, giải đáp thắc mắc và gợi mở tư duy cho học sinh như một người thầy, người bạn đồng hành thông thái.

14 QUY TẮC BẮT BUỘC TRONG HỘI THOẠI:
1. Luôn đọc và thấu hiểu lịch sử hội thoại trước khi trả lời.
2. Không xem câu hỏi mới là một yêu cầu độc lập nếu nó liên quan đến câu trước đó.
3. Hiểu các đại từ và cách diễn đạt tham chiếu ("nó", "cái đó", "điều vừa rồi", "câu trước", "ví dụ đầu tiên", "cái đầu tiên").
4. Trả lời tự nhiên, có cảm xúc, không lặp lại máy móc từng từ.
5. Nếu chưa hiểu hoặc câu hỏi quá mơ hồ, hãy hỏi lại một cách lịch sự, không tự đoán mò.
6. Nếu học sinh đang nói ngập ngừng hoặc chưa xong câu, hãy kiên nhẫn chờ đợi.
7. Nếu học sinh yêu cầu giải thích lại ("em chưa hiểu"), hãy dùng cách diễn đạt khác gần gũi hơn, không lặp lại nguyên văn câu cũ.
8. Nếu học sinh yêu cầu ví dụ, hãy đưa ra ví dụ đời sống thực tế, sinh động, dễ hiểu với lứa tuổi 11-12.
9. Tuyệt đối không bịa đặt kiến thức, không nói sai chuẩn kiến thức môn Tin học 6.
10. Không đưa ra thông tin lan man ngoài phạm vi bài học khi không có cơ sở.
11. Luôn khuyến khích học sinh tự suy nghĩ và tự tin khám phá bài học.
12. Giữ phong cách giao tiếp thân thiện, ngắn gọn (1 đến 3 câu). Tuyệt đối không thuyết trình dài dòng.
13. Không tự động kết thúc hội thoại sau mỗi câu trả lời.
14. Ghi nhớ chủ đề đang thảo luận xuyên suốt toàn bộ phiên học.

PHÂN BIỆT RÕ RÀNG KIẾN THỨC BÀI 6 (TUYỆT ĐỐI CHUẨN XÁC):
- Internet: Mạng liên kết các mạng máy tính trên phạm vi toàn cầu (hạ tầng mạng).
- Mạng thông tin toàn cầu (World Wide Web - WWW): Là một DỊCH VỤ hoạt động TRÊN nền Internet, bao gồm các trang web liên kết với nhau. (Internet và WWW KHÔNG PHẢI là một!).
- Website: Tập hợp gồm một hoặc nhiều trang web liên quan được lưu dưới một địa chỉ chung (như một cuốn sách).
- Trang web (Web page): Từng trang tài liệu đa phương tiện trong website (như một trang trong cuốn sách).
- Trang chủ (Homepage): Trang web đầu tiên mở ra khi truy cập vào một website.
- Siêu liên kết (Hyperlink): Cánh cửa chuyển tiếp – đoạn chữ hoặc hình ảnh có thể bấm chuột vào để chuyển đến trang web khác (con trỏ chuột biến thành hình bàn tay).
- Trình duyệt web: Phần mềm giúp con người truy cập và xem trang web (Chrome, Edge, Cốc Cốc...).
- Tim Berners-Lee: Nhà khoa học người Anh phát minh ra WWW vào năm 1989.
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

// Helper: Intelligent Super Curriculum Knowledge Engine (26+ Grade 6 intents + FAQ + Topics + Context Memory)
function getLocalFallbackResponse(query, history = [], context = {}) {
  const matched = matchCurriculumResponse(
    query,
    lessonKnowledge ? lessonKnowledge.faq : [],
    lessonKnowledge ? lessonKnowledge.topics : [],
    context
  );

  return {
    text: matched.text,
    emotion: matched.emotion || 'SPEAKING',
    topic: matched.topic,
    source: matched.source || 'curriculum-engine'
  };
}

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    assistantName: 'Mark',
    hasApiKey: !!GEMINI_API_KEY,
    hasBitOneKey: !!BITONE_API_KEY,
    model: BITONE_API_KEY ? BITONE_MODEL : (GEMINI_API_KEY ? GEMINI_MODEL : 'mark-curriculum-engine'),
    serverTime: new Date().toISOString()
  });
});

// Chat endpoint with 3-tier intelligence: BitOne AI -> Gemini API -> Super Curriculum Engine
app.post('/api/chat', async (req, res) => {
  const { message, history = [], context = {} } = req.body;

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
          parts: [{ text: 'Tôi đã hiểu rõ vai trò Mark - Trợ lý AI học tập thông minh cho học sinh lớp 6. Tôi sẽ luôn nói ngắn gọn, thân thiện bằng tiếng Việt, giải thích dễ hiểu và bám sát Bài 6.' }]
        }
      ];

      if (Array.isArray(history)) {
        for (const h of history.slice(-6)) {
          if (h.sender === 'user' || h.role === 'user') {
            contents.push({ role: 'user', parts: [{ text: h.text || h.content }] });
          } else if (h.sender === 'webby' || h.role === 'assistant') {
            contents.push({ role: 'model', parts: [{ text: h.text || h.content }] });
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

  // TIER 3: Super Curriculum Knowledge Engine (100% Reliable, 26+ Intents, Context Memory, Zero Error)
  const fallback = getLocalFallbackResponse(message, history, context);
  return res.json({
    reply: fallback.text,
    emotion: fallback.emotion,
    topic: fallback.topic,
    mode: 'curriculum-engine',
    provider: 'Mark Smart Curriculum Engine'
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

// Get all active rooms
app.get('/api/classroom/rooms', (req, res) => {
  const rooms = classroomStore.getActiveRooms();
  res.json({ rooms });
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

// Mobile Device Joins & Pairs with Desktop Room
app.post('/api/classroom/rooms/:code/device/join', (req, res) => {
  const { deviceType = 'mobile', userAgent = '' } = req.body;
  classroomStore.broadcast(req.params.code, 'DEVICE_JOINED', {
    roomCode: req.params.code,
    deviceType,
    userAgent,
    timestamp: Date.now()
  });
  res.json({ success: true, roomCode: req.params.code });
});

// Test Chime Ping from Mobile to Desktop
app.post('/api/classroom/rooms/:code/device/ping', (req, res) => {
  classroomStore.broadcast(req.params.code, 'CHIME_TEST', {
    roomCode: req.params.code,
    timestamp: Date.now()
  });
  res.json({ success: true });
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

// ==========================================
// BIT1 ENGLISH VOICE STUDIO & SPEECH APIS
// ==========================================

// 1. Text to Speech (Edge-TTS / gTTS Fallback)
app.post('/api/voice/tts', async (req, res) => {
  try {
    const result = await voiceService.synthesizeSpeech(req.body || {});
    res.json(result);
  } catch (err) {
    console.error('Error in /api/voice/tts:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Voice Cloning & Learner Simulation
app.post('/api/voice/clone', async (req, res) => {
  try {
    const result = await voiceService.simulateClonedVoice(req.body || {});
    res.json(result);
  } catch (err) {
    console.error('Error in /api/voice/clone:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Audio Sample Analysis
app.post('/api/voice/analyze-sample', async (req, res) => {
  try {
    const { sampleFile = 'default_learner_voice.wav' } = req.body || {};
    const result = await voiceService.analyzeSample(sampleFile);
    res.json(result);
  } catch (err) {
    console.error('Error in /api/voice/analyze-sample:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Pronunciation Evaluation & Alignment
app.post('/api/voice/evaluate-pronunciation', (req, res) => {
  try {
    const result = voiceService.evaluatePronunciation(req.body || {});
    res.json(result);
  } catch (err) {
    console.error('Error in /api/voice/evaluate-pronunciation:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Upload Voice Sample (from Mic recording or File upload)
app.post('/api/voice/upload-sample', (req, res) => {
  try {
    const { audioBase64, fileName = 'user_recorded_sample.wav' } = req.body || {};
    if (!audioBase64) {
      return res.status(400).json({ error: 'Thiếu dữ liệu audioBase64' });
    }
    const cleanBase64 = audioBase64.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const safeName = `user_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const targetPath = path.join(__dirname, '../public/voice_samples', safeName);
    fs.writeFileSync(targetPath, buffer);
    res.json({ success: true, fileName: safeName, url: `/voice_samples/${safeName}` });
  } catch (err) {
    console.error('Error in /api/voice/upload-sample:', err);
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

