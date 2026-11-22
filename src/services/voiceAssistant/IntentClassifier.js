// Intent Classifier & Semantic Analysis Engine
// Phân loại ý định của học sinh kết hợp ngữ cảnh hội thoại và dấu hiệu ngữ nghĩa

export const INTENTS = {
  GREETING: 'GREETING',                         // Chào hỏi
  ASK_QUESTION: 'ASK_QUESTION',                 // Câu hỏi kiến thức mới
  ASK_FOLLOW_UP: 'ASK_FOLLOW_UP',               // Câu hỏi tiếp nối
  REQUEST_EXAMPLE: 'REQUEST_EXAMPLE',           // Yêu cầu đưa ví dụ
  REQUEST_EXPLANATION: 'REQUEST_EXPLANATION',   // Giải thích lại / chưa hiểu
  REQUEST_REPEAT: 'REQUEST_REPEAT',             // Yêu cầu đọc/nói lại
  REQUEST_SHORTEN: 'REQUEST_SHORTEN',           // Yêu cầu nói ngắn gọn hơn
  CONFIRMATION: 'CONFIRMATION',                 // Xác nhận, đồng ý
  NEGATION: 'NEGATION',                         // Phủ định, sửa ý bot
  UNCLEAR: 'UNCLEAR',                           // Câu hỏi mơ hồ, thiếu chủ ngữ
  THINKING: 'THINKING',                         // Đang suy nghĩ, ngập ngừng
  THANKS: 'THANKS',                             // Lời cảm ơn
  GOODBYE: 'GOODBYE',                           // Tạm biệt, kết thúc
  INTERRUPT: 'INTERRUPT'                        // Ngắt lời bot
};

export class IntentClassifier {
  constructor() {}

  // Kiểm tra xem câu nói của học sinh có dấu hiệu bị ngắt quãng hoặc chưa nói hết câu
  isIncompleteUtterance(text) {
    if (!text) return false;
    const clean = text.toLowerCase().trim();

    // 0. Nếu câu kết thúc bằng dấu chấm lửng (... hoặc …)
    if (/[.]{2,}$|[…]$/.test(clean)) {
      return true;
    }

    const cleanWithoutPunct = clean.replace(/[.,?!…\s]+$/, '').trim();

    // 1. Kết thúc bằng các giới từ, liên từ hoặc cụm mở đầu chưa hoàn thiện
    const trailingPatterns = [
      /(cho mình hỏi về|cho em hỏi về|mình muốn hỏi về|em muốn hỏi về)$/i,
      /(cho mình hỏi|cho em hỏi|mình muốn hỏi|em muốn hỏi)$/i,
      /(là gì|là|thì|mà|nếu|bởi vì|tại vì|do|về|và|hoặc|với|nhưng|trong khi)$/i,
      /(theo em nghĩ thì|theo em thì|em thấy là|mình thấy là)$/i,
      /(để xem nào|để em nhớ|khoan đã|chờ tí|chờ chút|à|ờ|ừm)$/i
    ];

    for (const pattern of trailingPatterns) {
      if (pattern.test(clean) || pattern.test(cleanWithoutPunct)) {
        return true;
      }
    }

    // 2. Câu quá ngắn chứa từ gợi mở (dưới 4 từ và chỉ là lời gọi)
    const words = cleanWithoutPunct.split(/\s+/);
    if (words.length <= 3 && /^(mark ơi|ơi mark|mark à|bạn ơi|cho mình hỏi|thầy ơi|cô ơi)$/i.test(cleanWithoutPunct)) {
      return true;
    }

    return false;
  }

  // Phân tích ý định toàn diện dựa trên câu nói và bộ nhớ ngữ cảnh
  classify(text, memory = null) {
    if (!text || typeof text !== 'string') {
      return { intent: INTENTS.UNCLEAR, confidence: 0, entities: {} };
    }

    const clean = text.toLowerCase().trim();
    const activeTopic = memory ? memory.getActiveTopic() : null;
    const hasHistory = memory && memory.messages && memory.messages.length > 0;

    // 1. Phủ định hoặc sửa ý bot: "Không phải ý đó!", "Không phải thế!", "Sai rồi"
    if (/^(không phải|sai rồi|đâu phải|không đúng|chưa đúng|không phải ý đó|ý mình khác)/i.test(clean)) {
      return {
        intent: INTENTS.NEGATION,
        topic: activeTopic,
        confidence: 0.95
      };
    }

    // 2. Yêu cầu nói ngắn gọn hơn: "Nói ngắn hơn đi", "Tóm tắt lại đi", "Dài quá, nói ngắn thôi"
    if (/(nói ngắn hơn|ngắn hơn đi|tóm tắt lại|ngắn gọn thôi|dài quá|rút gọn lại)/i.test(clean)) {
      return {
        intent: INTENTS.REQUEST_SHORTEN,
        topic: activeTopic,
        targetResponse: memory ? memory.getLastAssistantReply() : '',
        confidence: 0.95
      };
    }

    // 3. Yêu cầu nhắc lại: "Mark nói lại được không?", "Nói lại đi", "Nhắc lại câu vừa rồi"
    if (/(nói lại|nhắc lại|đọc lại|nghe lại|chưa nghe rõ|mark nói lại)/i.test(clean)) {
      return {
        intent: INTENTS.REQUEST_REPEAT,
        topic: activeTopic,
        targetResponse: memory ? memory.getLastAssistantReply() : '',
        confidence: 0.95
      };
    }

    // 4. Lời cảm ơn: "Cảm ơn Mark nhé", "Thanks Mark", "Cảm ơn bạn"
    if (/(cảm ơn|cam on|thanks|thank you|biết ơn)/i.test(clean)) {
      // Nếu có thêm từ tạm biệt hoặc thôi
      if (/(thôi|nghỉ|tạm biệt|bye)/i.test(clean)) {
        return { intent: INTENTS.GOODBYE, confidence: 0.9 };
      }
      return { intent: INTENTS.THANKS, confidence: 0.95 };
    }

    // 5. Tạm biệt / Kết thúc: "Tạm biệt Mark", "Thôi mình nghỉ nhé", "Bye bye"
    if (/(tạm biệt|tam biet|bye bye|hẹn gặp lại|chào tạm biệt|thôi nghỉ|hết rồi)/i.test(clean)) {
      return { intent: INTENTS.GOODBYE, confidence: 0.95 };
    }

    // 6. Yêu cầu ví dụ: "Cho mình một ví dụ nhé!", "Cho ví dụ đi", "Ví dụ là gì?"
    if (/(cho ví dụ|cho mình ví dụ|ví dụ nhé|lấy ví dụ|ví dụ cụ thể|ví dụ minh họa|cho em ví dụ)/i.test(clean)) {
      return {
        intent: INTENTS.REQUEST_EXAMPLE,
        topic: activeTopic,
        confidence: 0.95
      };
    }

    // 7. Giải thích lại / Sư phạm: "Em chưa hiểu lắm", "Vẫn chưa hiểu", "Nói rõ hơn đi"
    if (/(chưa hiểu lắm|chưa hiểu|vẫn chưa hiểu|khó hiểu quá|giải thích lại|nói dễ hiểu hơn|nghĩa là sao)/i.test(clean)) {
      return {
        intent: INTENTS.REQUEST_EXPLANATION,
        topic: activeTopic,
        confidence: 0.95
      };
    }

    // 8. Chào hỏi ban đầu: "Xin chào", "Chào Mark", "Hello", "Hi"
    if (/^(xin chào|chào mark|chào bạn|hello|hi|alo|chào em|chào anh)\b/i.test(clean) && !hasHistory) {
      return { intent: INTENTS.GREETING, confidence: 0.95 };
    }

    // 9. Đồng ý, xác nhận: "Đúng rồi", "Chính xác", "Vâng ạ", "Ừ"
    if (/^(đúng rồi|chính xác|vâng|vâng ạ|dạ đúng|ừ|chuẩn luôn|được rồi)$/i.test(clean)) {
      return { intent: INTENTS.CONFIRMATION, topic: activeTopic, confidence: 0.9 };
    }

    // 10. Câu hỏi tham chiếu cái đầu tiên: "Còn cái đầu tiên là gì nhỉ?"
    if (/(cái đầu tiên|điều đầu tiên|chủ đề đầu)/i.test(clean)) {
      return {
        intent: INTENTS.ASK_FOLLOW_UP,
        topic: memory ? (memory.getFirstTopic() || activeTopic) : activeTopic,
        isFirstTopicQuery: true,
        confidence: 0.95
      };
    }

    // 11. Câu hỏi tiếp nối có đại từ: "Thế nó có tác dụng gì?", "Nó dùng để làm gì?", "Thế có tác dụng gì?"
    if (/(nó|cái đó|điều đó|cái này|điều này)/i.test(clean) || /^(thế|vậy|còn)\s+(có tác dụng|dùng để|làm sao|được không|thế nào)/i.test(clean)) {
      if (activeTopic) {
        return {
          intent: INTENTS.ASK_FOLLOW_UP,
          topic: activeTopic,
          confidence: 0.9
        };
      } else {
        // Chưa có chủ đề trước đó mà đã dùng "nó" -> Ý định mơ hồ (UNCLEAR) cần hỏi lại
        return {
          intent: INTENTS.UNCLEAR,
          confidence: 0.85
        };
      }
    }

    // 12. Mặc định: Câu hỏi kiến thức
    return {
      intent: INTENTS.ASK_QUESTION,
      confidence: 0.8
    };
  }
}

export const intentClassifier = new IntentClassifier();

