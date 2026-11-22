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

  // Thiết lập nhận diện giọng nói (ASR & VAD)
  silenceThresholdMs: 1000,      // 1.0s im lặng để xác nhận kết thúc câu (chuẩn học sinh THCS)
  incompleteWaitMs: 1800,        // Thời gian chờ thêm nếu học sinh nói ngắt quãng ("cho mình hỏi về...")
  acousticCooldownMs: 800,       // Thời gian triệt tiêu tiếng vang phòng học sau khi bot nói xong

  // Lời chào mở đầu tự nhiên, thân thiện và đặt câu hỏi gợi mở thực tế cho tiết học
  welcomeGreeting: 'Xin chào các bạn! Mình là Mark. Hôm nay Mark có một thử thách nhỏ muốn nhờ cả lớp giúp đỡ: Các bạn có thường sử dụng Google để tìm kiếm thông tin, xem video hoặc tìm hình ảnh không?',
  // Văn bản dành cho TTS (sử dụng phát âm chuẩn không đánh vần)
  welcomeGreetingSpeech: 'Xin chào các bạn! Mình là Mác. Hôm nay Mác có một thử thách nhỏ muốn nhờ cả lớp giúp đỡ: Các bạn có thường sử dụng Gu gồ để tìm kiếm thông tin, xem video hoặc tìm hình ảnh không?'
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

