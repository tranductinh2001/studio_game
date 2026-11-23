// Voice Assistant Configuration
// Cấu hình chuẩn hóa cho Trợ lý AI Mark - Tiết thao giảng Tin học 6

export const BOT_CONFIG = {
  // Tên hiển thị trên giao diện người dùng
  displayName: 'Mark',

  // Danh xưng đầy đủ
  fullName: 'Trợ lý AI Mark',

  // Danh xưng trong câu thoại
  pronoun: 'mình',

  // Phát âm khi chuyển sang Text-To-Speech (Tránh đọc đánh vần M-A-R-K)
  // Trong công cụ TTS tiếng Việt (Microsoft HoaiMy, An, Google Vietnamese),
  // từ "Mark" hoặc "Mác" sẽ được đọc thành một từ trọn vẹn, ấm áp.
  voicePronunciation: 'Mác',

  // Thiết lập giọng đọc tiếng Việt
  language: 'vi-VN',
  speechRate: 0.95, // Tốc độ vừa phải, chuẩn sư phạm cho học sinh lớp 6
  pitch: 1.05,      // Tông giọng tươi vui, gần gũi, ấm áp

  // Các tùy chọn giọng đọc mặc định đề xuất
  voicePresets: [
    { id: 'hoaimy', name: 'Microsoft Hoài My', gender: 'female', desc: 'Giọng Nữ - Truyền cảm, ấm áp, chuẩn ngữ điệu sư phạm' },
    { id: 'namminh', name: 'Microsoft Nam Minh', gender: 'male', desc: 'Giọng Nam - Rõ ràng, dõng dạc, rành mạch' },
    { id: 'google_vi', name: 'Google Tiếng Việt', gender: 'female', desc: 'Giọng Nữ - Tự nhiên, thân thiện' }
  ],

  // Thiết lập nhận diện giọng nói (ASR & VAD)
  silenceThresholdMs: 1000,      // 1.0s im lặng để xác nhận kết thúc câu (chuẩn học sinh THCS)
  incompleteWaitMs: 1800,        // Thời gian chờ thêm nếu học sinh nói ngắt quãng ("cho mình hỏi về...")
  acousticCooldownMs: 800,       // Thời gian triệt tiêu tiếng vang phòng học sau khi bot nói xong

  // Lời chào mở đầu tự nhiên, thân thiện và dẫn dắt bằng câu hỏi trải nghiệm đời sống cho tiết học
  welcomeGreeting: 'Xin chào các bạn học sinh lớp 6 yêu quý! Mình là Mark – trợ lý AI của lớp mình hôm nay. Cho Mark hỏi nhỏ nhé: Khi muốn tìm lời giải một bài toán khó, xem video hướng dẫn gấp giấy Origami, hay tìm lời một bài hát, các bạn thường làm gì trên điện thoại hoặc máy tính?',
  // Văn bản dành cho TTS (sử dụng phát âm chuẩn không đánh vần M-A-R-K)
  welcomeGreetingSpeech: 'Xin chào các bạn học sinh lớp 6 yêu quý! Mình là Mác – trợ lý AI của lớp mình hôm nay. Cho Mác hỏi nhỏ nhé: Khi muốn tìm lời giải một bài toán khó, xem video hướng dẫn gấp giấy Ô ri ga mi, hay tìm lời một bài hát, các bạn thường làm gì trên điện thoại hoặc máy tính?'
};

// Từ điển chuẩn hóa phát âm cho Text-to-Speech tiếng Việt
export const PRONUNCIATION_MAP = [
  // Tên bot: Đảm bảo không bao giờ bị đánh vần M - A - R - K
  { pattern: /\bMARK\b/gi, replacement: 'Mác' },
  { pattern: /\bMark\b/g, replacement: 'Mác' },
  { pattern: /\bWEBBY\b/gi, replacement: 'Oép bi' },
  { pattern: /\bWebby\b/g, replacement: 'Oép bi' },

  // Thuật ngữ công nghệ Tin học 6: Chuẩn hóa để TTS đọc tự nhiên
  { pattern: /\bWWW\b/g, replacement: 'W W W' },
  { pattern: /\bWorld Wide Web\b/gi, replacement: 'Uôn oai oép' },
  { pattern: /\bWebsite\b/gi, replacement: 'Uép sai' },
  { pattern: /\bWeb page\b/gi, replacement: 'Uép pây' },
  { pattern: /\bWebpage\b/gi, replacement: 'Uép pây' },
  { pattern: /\bHomepage\b/gi, replacement: 'Hôm pây' },
  { pattern: /\bHyperlink\b/gi, replacement: 'Hai pơ linh' },
  { pattern: /\bHypertext\b/gi, replacement: 'Hai pơ tếch' },
  { pattern: /\bBrowser\b/gi, replacement: 'Bờ rau zơ' },
  { pattern: /\bGoogle Chrome\b/gi, replacement: 'Gú gồ Crôm' },
  { pattern: /\bChrome\b/gi, replacement: 'Crôm' },
  { pattern: /\bMicrosoft Edge\b/gi, replacement: 'Mai crô sốp Ét' },
  { pattern: /\bEdge\b/gi, replacement: 'Ét' },
  { pattern: /\bCốc Cốc\b/gi, replacement: 'Cốc Cốc' },
  { pattern: /\bFirefox\b/gi, replacement: 'Phai phốc' },
  { pattern: /\bSafari\b/gi, replacement: 'Sa pha ri' },
  { pattern: /\bTim Berners-Lee\b/gi, replacement: 'Tim Bơ nơ Li' }
];

// Hàm chuẩn hóa văn bản hiển thị thành văn bản phát âm cho TTS
export function normalizeTextForSpeech(text) {
  if (!text || typeof text !== 'string') return '';

  let speechText = text;

  // 1. Loại bỏ các ký tự Markdown định dạng (*, _, `, ~, #)
  speechText = speechText.replace(/[*_~`#]/g, '');

  // 2. Chuẩn hóa tên bot và các từ viết tắt
  for (const item of PRONUNCIATION_MAP) {
    speechText = speechText.replace(item.pattern, item.replacement);
  }

  // 3. Xóa các dấu câu dư thừa lặp lại
  speechText = speechText.replace(/\.{2,}/g, '.').replace(/\?{2,}/g, '?');

  return speechText.trim();
}

