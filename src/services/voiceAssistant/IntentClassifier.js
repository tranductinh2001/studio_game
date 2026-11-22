// Intent Classifier & Semantic Analysis Engine
// Phân loại ý định của học sinh kết hợp ngữ cảnh hội thoại, trạng thái sư phạm và dấu hiệu ngữ nghĩa

export const INTENTS = {
  GREETING: 'GREETING',                         // Chào hỏi ban đầu
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
  INTERRUPT: 'INTERRUPT',                       // Ngắt lời bot

  // --- Socratic Pedagogical Intents ---
  ANSWER_YES: 'ANSWER_YES',                     // Học sinh trả lời "Có / Có ạ / Vâng ạ / Dạ có"
  ANSWER_NO: 'ANSWER_NO',                       // Học sinh trả lời "Không / Không ạ / Dạ không"
  ANSWER_DONT_KNOW: 'ANSWER_DONT_KNOW',         // Học sinh trả lời "Em không biết / Chưa biết ạ / Khó quá"
  ANSWER_UNCERTAIN: 'ANSWER_UNCERTAIN',         // "Chắc là vậy ạ / Em nghĩ là... / Có lẽ là..."
  ANSWER_WRONG: 'ANSWER_WRONG',                 // Học sinh trả lời chứa quan niệm sai lầm
  STUDENT_ASK_BACK: 'STUDENT_ASK_BACK',         // Học sinh hỏi ngược lại AI ("Thế còn Mark?")
  TOPIC_SWITCH: 'TOPIC_SWITCH',                 // Học sinh nói lạc đề ("Mark có chơi game không?")
  ANSWER_CONCEPT: 'ANSWER_CONCEPT',             // Trả lời một khái niệm ngắn ("Google ạ", "Vì có Internet ạ")
  LONG_ANSWER: 'LONG_ANSWER'                    // Câu trả lời dài chứa nhiều mệnh đề
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
    const lastQuestion = memory ? memory.getLastAiQuestion() : null;

    // 1. Học sinh hỏi ngược lại AI: "Thế còn Mark?", "Mark có biết không?", "Tại sao lại thế hả Mark?", "Mark trả lời đi"
    if (/(thế còn mark|còn mark thì sao|mark có biết không|mark biết không|tại sao hả mark|tại sao lại thế hả mark|mark trả lời đi|thế mark bảo xem|còn mark)/i.test(clean)) {
      return {
        intent: INTENTS.STUDENT_ASK_BACK,
        topic: activeTopic || 'www',
        confidence: 0.95
      };
    }

    // 2. Học sinh nói lạc đề ngoài bài học: "Mark có chơi game không?", "Mark mấy tuổi?", "Hôm nay trời mưa hay nắng?"
    if (/(chơi game|roblox|liên quân|free fire|mấy tuổi|ở đâu|thời tiết|ăn cơm chưa|người yêu|bạn gái|facebook của mark)/i.test(clean)) {
      return {
        intent: INTENTS.TOPIC_SWITCH,
        topic: activeTopic || 'www',
        confidence: 0.95
      };
    }

    // 3. Học sinh trả lời "Em không biết" / "Chưa biết ạ" / "Khó quá"
    if (/^(em không biết|mình không biết|không biết ạ|em chưa biết|chưa biết ạ|khó quá|em chịu|chưa nghĩ ra|chịu thôi|không biết)/i.test(clean)) {
      return {
        intent: INTENTS.ANSWER_DONT_KNOW,
        topic: activeTopic || 'www',
        lastQuestion,
        confidence: 0.98
      };
    }

    // 4. Học sinh trả lời ngắn "Có" / "Có ạ" / "Vâng ạ" / "Dạ có"
    if (/^(có|có ạ|dạ có|dạ có ạ|vâng|vâng ạ|chắc chắn có|chuẩn rồi ạ|đúng ạ)$/i.test(clean)) {
      return {
        intent: INTENTS.ANSWER_YES,
        topic: activeTopic || 'www',
        lastQuestion,
        confidence: 0.98
      };
    }

    // 5. Học sinh trả lời ngắn "Không" / "Không ạ" / "Dạ không"
    if (/^(không|không ạ|dạ không|dạ không ạ|chưa ạ|đâu có|không phải đâu ạ|không phải)$/i.test(clean)) {
      return {
        intent: INTENTS.ANSWER_NO,
        topic: activeTopic || 'www',
        lastQuestion,
        confidence: 0.98
      };
    }

    // 6. Học sinh trả lời ngập ngừng/không chắc chắn: "Chắc là vậy ạ", "Em nghĩ là...", "Có lẽ là..."
    if (/^(chắc là vậy|chắc vậy|em nghĩ là|mình nghĩ là|có lẽ là|hình như là|chắc thế)/i.test(clean)) {
      return {
        intent: INTENTS.ANSWER_UNCERTAIN,
        topic: activeTopic || 'www',
        lastQuestion,
        confidence: 0.9
      };
    }

    // 7. Học sinh trả lời bằng khái niệm quen thuộc trong Bài 6 (VD: "Google ạ", "Vì có Internet ạ", "Dây cáp ạ")
    if (/^(google|google ạ|bằng google|dùng google|trên google)$/i.test(clean)) {
      return {
        intent: INTENTS.ANSWER_CONCEPT,
        concept: 'google',
        topic: 'www',
        confidence: 0.95
      };
    }

    if (/^(vì có internet|do có internet|nhờ internet|internet ạ|do internet|có internet|qua internet)$/i.test(clean)) {
      return {
        intent: INTENTS.ANSWER_CONCEPT,
        concept: 'internet',
        topic: 'internet',
        confidence: 0.95
      };
    }

    if (/^(dây cáp|chỉ là dây cáp|dây mạng|cáp mạng)$/i.test(clean)) {
      return {
        intent: INTENTS.ANSWER_CONCEPT,
        concept: 'cables_only',
        topic: 'internet',
        confidence: 0.9
      };
    }

    // 8. Phủ định hoặc sửa ý bot: "Không phải ý đó!", "Không phải thế!", "Sai rồi"
    if (/^(không phải|sai rồi|đâu phải|không đúng|chưa đúng|không phải ý đó|ý mình khác)/i.test(clean)) {
      return {
        intent: INTENTS.NEGATION,
        topic: activeTopic,
        confidence: 0.95
      };
    }

    // 9. Yêu cầu nói ngắn gọn hơn: "Nói ngắn hơn đi", "Tóm tắt lại đi", "Dài quá, nói ngắn thôi"
    if (/(nói ngắn hơn|ngắn hơn đi|tóm tắt lại|ngắn gọn thôi|dài quá|rút gọn lại)/i.test(clean)) {
      return {
        intent: INTENTS.REQUEST_SHORTEN,
        topic: activeTopic,
        targetResponse: memory ? memory.getLastAssistantReply() : '',
        confidence: 0.95
      };
    }

    // 10. Yêu cầu nhắc lại: "Mark nói lại được không?", "Nói lại đi", "Nhắc lại câu vừa rồi"
    if (/(nói lại|nhắc lại|đọc lại|nghe lại|chưa nghe rõ|mark nói lại)/i.test(clean)) {
      return {
        intent: INTENTS.REQUEST_REPEAT,
        topic: activeTopic,
        targetResponse: memory ? memory.getLastAssistantReply() : '',
        confidence: 0.95
      };
    }

    // 11. Lời cảm ơn: "Cảm ơn Mark nhé", "Thanks Mark", "Cảm ơn bạn"
    if (/(cảm ơn|cam on|thanks|thank you|biết ơn)/i.test(clean)) {
      if (/(thôi|nghỉ|tạm biệt|bye)/i.test(clean)) {
        return { intent: INTENTS.GOODBYE, confidence: 0.9 };
      }
      return { intent: INTENTS.THANKS, confidence: 0.95 };
    }

    // 12. Tạm biệt / Kết thúc: "Tạm biệt Mark", "Thôi mình nghỉ nhé", "Bye bye"
    if (/(tạm biệt|tam biet|bye bye|hẹn gặp lại|chào tạm biệt|thôi nghỉ|hết rồi)/i.test(clean)) {
      return { intent: INTENTS.GOODBYE, confidence: 0.95 };
    }

    // 13. Yêu cầu ví dụ: "Cho mình một ví dụ nhé!", "Cho ví dụ đi", "Ví dụ là gì?"
    if (/(cho ví dụ|cho mình ví dụ|ví dụ nhé|lấy ví dụ|ví dụ cụ thể|ví dụ minh họa|cho em ví dụ)/i.test(clean)) {
      return {
        intent: INTENTS.REQUEST_EXAMPLE,
        topic: activeTopic,
        confidence: 0.95
      };
    }

    // 14. Giải thích lại / Sư phạm: "Em chưa hiểu lắm", "Vẫn chưa hiểu", "Nói rõ hơn đi"
    if (/(chưa hiểu lắm|chưa hiểu|vẫn chưa hiểu|khó hiểu quá|giải thích lại|nói dễ hiểu hơn|nghĩa là sao)/i.test(clean)) {
      return {
        intent: INTENTS.REQUEST_EXPLANATION,
        topic: activeTopic,
        confidence: 0.95
      };
    }

    // 15. Chào hỏi ban đầu: "Xin chào", "Chào Mark", "Hello", "Hi"
    if (/^(xin chào|chào mark|chào bạn|hello|hi|alo|chào em|chào anh)\b/i.test(clean) && !hasHistory) {
      return { intent: INTENTS.GREETING, confidence: 0.95 };
    }

    // 16. Đồng ý, xác nhận: "Đúng rồi", "Chính xác", "Vâng ạ", "Ừ"
    if (/^(đúng rồi|chính xác|dạ đúng|ừ|chuẩn luôn|được rồi)$/i.test(clean)) {
      return { intent: INTENTS.CONFIRMATION, topic: activeTopic, confidence: 0.9 };
    }

    // 17. Câu hỏi tham chiếu cái đầu tiên / câu hỏi đầu tiên
    if (/(cái đầu tiên|điều đầu tiên|chủ đề đầu|câu đầu tiên|câu hỏi đầu)/i.test(clean)) {
      return {
        intent: INTENTS.ASK_FOLLOW_UP,
        topic: memory ? (memory.getFirstTopic() || activeTopic) : activeTopic,
        isFirstTopicQuery: true,
        confidence: 0.95
      };
    }

    // 18. Câu hỏi tiếp nối có đại từ: "Thế nó có tác dụng gì?", "Nó dùng để làm gì?"
    if (/(nó|cái đó|điều đó|cái này|điều này)/i.test(clean) || /^(thế|vậy|còn)\s+(có tác dụng|dùng để|làm sao|được không|thế nào)/i.test(clean)) {
      if (activeTopic) {
        return {
          intent: INTENTS.ASK_FOLLOW_UP,
          topic: activeTopic,
          confidence: 0.9
        };
      } else {
        return {
          intent: INTENTS.UNCLEAR,
          confidence: 0.85
        };
      }
    }

    // 19. Câu trả lời dài của học sinh (> 12 từ)
    const wordCount = clean.split(/\s+/).length;
    if (wordCount >= 12 && !clean.endsWith('?')) {
      return {
        intent: INTENTS.LONG_ANSWER,
        topic: activeTopic || 'www',
        wordCount,
        confidence: 0.9
      };
    }

    // 20. Mặc định: Câu hỏi kiến thức
    return {
      intent: INTENTS.ASK_QUESTION,
      topic: activeTopic,
      confidence: 0.8
    };
  }
}

export const intentClassifier = new IntentClassifier();
