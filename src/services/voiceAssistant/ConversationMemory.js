// Conversation Memory Service & Pedagogical State Engine
// Quản lý bộ nhớ ngữ cảnh hội thoại đa phiên, trạng thái sư phạm 7 giai đoạn,
// liên kết câu hỏi trước và giải quyết câu trả lời ngắn / ngắt quãng / phản biện

export const CONVERSATION_STAGES = {
  STAGE_1_HOOK: 'STAGE_1_HOOK',                               // 1. Gợi mở: trải nghiệm thực tế (Google, YouTube)
  STAGE_2_EXPLORE: 'STAGE_2_EXPLORE',                         // 2. Khai thác: kết nối toàn cầu (VN xem video ở Mỹ)
  STAGE_3_COGNITIVE_CONFLICT: 'STAGE_3_COGNITIVE_CONFLICT',   // 3. Mâu thuẫn nhận thức: Internet có phải chỉ là dây cáp?
  STAGE_4_DISCOVERY: 'STAGE_4_DISCOVERY',                     // 4. Khám phá: Mạng thông tin toàn cầu (WWW)
  STAGE_5_LESSON_CONNECTION: 'STAGE_5_LESSON_CONNECTION',     // 5. Kết nối: Tổng hợp ý nghĩa WWW và Internet
  STAGE_6_HANDOFF: 'STAGE_6_HANDOFF',                         // 6. Chuyển giao: Mời Thầy Trần Đức Tình bắt đầu bài giảng
  QA_FREE_FLOW: 'QA_FREE_FLOW'                                // 7. Chế độ hỏi - đáp tự do chuyên sâu Bài 6
};

export const PRAISE_POOL = [
  'Tuyệt vời!',
  'Chính xác!',
  'Rất tốt!',
  'Một câu trả lời rất thông minh!',
  'Xuất sắc!',
  'Ý kiến của bạn rất chuẩn xác!',
  'Hoan hô các bạn!',
  'Thật tuyệt cú mèo!',
  'Đúng là các chuyên gia công nghệ tương lai!'
];

export class ConversationMemory {
  constructor(sessionId = null) {
    this.sessionId = sessionId || `session_${Date.now()}`;
    this.conversationId = `conv_${Date.now()}`;
    this.messages = [];
    this.activeTopic = 'www';          // Chủ đề đang thảo luận gần nhất (mặc định www)
    this.topicsCovered = ['www'];      // Danh sách các chủ đề đã nói qua trong phiên
    this.firstTopic = 'www';           // Chủ đề đầu tiên của phiên (cho câu: "còn cái đầu tiên là gì?")
    this.studentName = null;          // Tên học sinh nếu có ("mình là An", "em tên là Bảo")
    this.lastAssistantReply = '';     // Nội dung trả lời gần nhất của bot
    this.lastUserQuery = '';          // Câu hỏi/câu trả lời gần nhất của học sinh
    this.unresolvedQuery = null;      // Câu hỏi dang dở cần làm rõ
    this.maxHistorySize = 16;         // Kích thước cửa sổ trượt (sliding window)

    // --- Pedagogical Socratic State Management ---
    this.conversationStage = CONVERSATION_STAGES.STAGE_1_HOOK;
    this.lastAiQuestion = 'Các bạn có thường sử dụng Google để tìm kiếm thông tin, xem video hoặc tìm hình ảnh không?';
    this.lastAiQuestionType = 'YES_NO'; // 'YES_NO' | 'CONCEPT' | 'CONFLICT' | 'DISCOVERY' | 'OPEN'
    this.lastStudentAnswer = '';
    this.lastStudentIntent = null;
    this.learningObjective = 'Dẫn dắt học sinh khám phá Mạng thông tin toàn cầu (WWW) và phân biệt với hạ tầng Internet';
    this.studentKnowledge = [];        // Danh sách khái niệm học sinh đã hiểu (VD: 'google_search', 'internet_global')
    this.misconceptions = [];         // Các hiểu lầm cần uốn nắn (VD: 'internet_only_cables')
    this.nextTeachingGoal = 'Khai thác việc sử dụng Internet để truyền thông tin toàn cầu';
    this.difficultyLevel = 'standard'; // 'standard' | 'simplified' | 'deep'
    this.consecutiveCorrect = 0;       // Đếm số lần trả lời đúng liên tiếp để nâng độ khó
    this.praiseHistory = [];           // Lịch sử khen ngợi để không bao giờ lặp từ
    this.isWarmupCompleted = false;    // Cờ đánh dấu đã hoàn thành phần mở đầu
  }

  // Bắt đầu một phiên trò chuyện mới (cách ly 100% giữa các học sinh/tiết học)
  startNewSession(newSessionId = null) {
    this.sessionId = newSessionId || `session_${Date.now()}`;
    this.conversationId = `conv_${Date.now()}`;
    this.messages = [];
    this.activeTopic = null;
    this.topicsCovered = [];
    this.firstTopic = null;
    this.studentName = null;
    this.lastAssistantReply = '';
    this.lastUserQuery = '';
    this.unresolvedQuery = null;

    // Reset State Sư phạm
    this.conversationStage = CONVERSATION_STAGES.STAGE_1_HOOK;
    this.lastAiQuestion = 'Các bạn có thường sử dụng Google để tìm kiếm thông tin, xem video hoặc tìm hình ảnh không?';
    this.lastAiQuestionType = 'YES_NO';
    this.lastStudentAnswer = '';
    this.lastStudentIntent = null;
    this.learningObjective = 'Dẫn dắt học sinh khám phá Mạng thông tin toàn cầu (WWW) và phân biệt với hạ tầng Internet';
    this.studentKnowledge = [];
    this.misconceptions = [];
    this.nextTeachingGoal = 'Khai thác việc sử dụng Internet để truyền thông tin toàn cầu';
    this.difficultyLevel = 'standard';
    this.consecutiveCorrect = 0;
    this.praiseHistory = [];
    this.isWarmupCompleted = false;
  }

  // Thêm tin nhắn vào bộ nhớ ngữ cảnh và tự động cập nhật State
  addMessage(role, content, metadata = {}) {
    if (!content || !content.trim()) return;

    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      role, // 'user' | 'assistant'
      content: content.trim(),
      timestamp: Date.now(),
      topic: metadata.topic || this.activeTopic,
      intent: metadata.intent || null,
      stage: metadata.stage || this.conversationStage,
      ...metadata
    };

    this.messages.push(msg);

    if (role === 'assistant') {
      this.lastAssistantReply = msg.content;
      if (metadata.topic) {
        this.setActiveTopic(metadata.topic);
      }
      if (metadata.stage) {
        this.conversationStage = metadata.stage;
      }
      // Tự động trích xuất câu hỏi gần nhất của AI từ lời thoại
      if (metadata.question) {
        this.lastAiQuestion = metadata.question;
      } else {
        this.extractLastQuestionFromText(msg.content);
      }
      if (metadata.questionType) {
        this.lastAiQuestionType = metadata.questionType;
      }
    } else if (role === 'user') {
      this.lastUserQuery = msg.content;
      this.lastStudentAnswer = msg.content;
      this.lastStudentIntent = metadata.intent || null;
      // Phát hiện học sinh xưng tên (VD: "mình là An", "em tên Minh")
      this.detectStudentName(msg.content);
    }

    // Giữ kích thước cửa sổ trượt hợp lý, tránh tăng vô hạn
    if (this.messages.length > this.maxHistorySize * 2) {
      this.pruneOldHistory();
    }

    return msg;
  }

  // Tự động trích xuất câu hỏi từ văn bản phát ngôn của AI
  extractLastQuestionFromText(text) {
    if (!text) return;
    const sentences = text.split(/(?<=[.?!])\s+/);
    const questions = sentences.filter(s => s.trim().endsWith('?'));
    if (questions.length > 0) {
      this.lastAiQuestion = questions[questions.length - 1].trim();
    }
  }

  // Cập nhật chủ đề hiện tại và lưu vào dòng thời gian chủ đề
  setActiveTopic(topicKey) {
    if (!topicKey) return;
    this.activeTopic = topicKey;

    if (!this.firstTopic) {
      this.firstTopic = topicKey;
    }

    if (!this.topicsCovered.includes(topicKey)) {
      this.topicsCovered.push(topicKey);
    }
  }

  getActiveTopic() {
    return this.activeTopic;
  }

  getFirstTopic() {
    return this.firstTopic;
  }

  getLastAssistantReply() {
    return this.lastAssistantReply;
  }

  getLastUserQuery() {
    return this.lastUserQuery;
  }

  getStudentName() {
    return this.studentName;
  }

  getConversationStage() {
    return this.conversationStage;
  }

  setConversationStage(stage) {
    if (CONVERSATION_STAGES[stage]) {
      this.conversationStage = stage;
      console.log(`[ConversationMemory] Chuyển đổi giai đoạn sư phạm: ${stage}`);
    }
  }

  getLastAiQuestion() {
    return this.lastAiQuestion;
  }

  getLastAiQuestionType() {
    return this.lastAiQuestionType;
  }

  getStudentKnowledge() {
    return [...this.studentKnowledge];
  }

  getMisconceptions() {
    return [...this.misconceptions];
  }

  getDifficultyLevel() {
    return this.difficultyLevel;
  }

  getConsecutiveCorrect() {
    return this.consecutiveCorrect;
  }

  addStudentKnowledge(concept) {
    if (concept && !this.studentKnowledge.includes(concept)) {
      this.studentKnowledge.push(concept);
      this.consecutiveCorrect += 1;
      console.log(`[ConversationMemory] Ghi nhận kiến thức học sinh đạt được: ${concept} (Chuỗi đúng: ${this.consecutiveCorrect})`);
    }
  }

  addMisconception(concept) {
    if (concept && !this.misconceptions.includes(concept)) {
      this.misconceptions.push(concept);
      this.consecutiveCorrect = 0; // Reset chuỗi đúng
      console.log(`[ConversationMemory] Phát hiện hiểu lầm của học sinh: ${concept}`);
    }
  }

  resolveMisconception(concept) {
    this.misconceptions = this.misconceptions.filter(m => m !== concept);
    console.log(`[ConversationMemory] Đã uốn nắn hiểu lầm: ${concept}`);
  }

  // Lấy lời khen ngợi ngẫu nhiên nhưng không bao giờ lặp lại câu vừa dùng
  getDiversePraise() {
    const available = PRAISE_POOL.filter(p => !this.praiseHistory.slice(-3).includes(p));
    const chosen = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : PRAISE_POOL[0];

    this.praiseHistory.push(chosen);
    if (this.praiseHistory.length > 6) this.praiseHistory.shift();
    return chosen;
  }

  // Phát hiện và ghi nhớ tên học sinh trong cuộc trò chuyện
  detectStudentName(text) {
    if (!text) return;
    const match = text.match(/(?:mình tên là|em tên là|mình là|em là|tên mình là|tên em là)\s+([A-ZÀ-Ỹa-zà-ỹ\s]{2,15})/i);
    if (match && match[1]) {
      const name = match[1].trim().split(' ').slice(-1)[0]; // Lấy tên gọi chính
      if (name && name.length >= 2 && !['gì', 'ai', 'học', 'sinh', 'bạn'].includes(name.toLowerCase())) {
        this.studentName = name.charAt(0).toUpperCase() + name.slice(1);
        console.log('[ConversationMemory] Ghi nhận tên học sinh:', this.studentName);
      }
    }
  }

  // Giải quyết tham chiếu đại từ, câu hỏi nối tiếp và câu trả lời ngắn dựa trên ngữ cảnh đã lưu
  resolveReference(query) {
    if (!query) return { isReference: false, topic: this.activeTopic };

    const lower = query.toLowerCase().trim();

    // 1. Tham chiếu đến cái đầu tiên / câu hỏi đầu tiên: "còn cái đầu tiên là gì nhỉ?", "câu đầu tiên là gì?"
    if (lower.includes('cái đầu tiên') || lower.includes('điều đầu tiên') || lower.includes('ý đầu tiên') || lower.includes('chủ đề đầu') || lower.includes('câu đầu tiên')) {
      return {
        isReference: true,
        referenceType: 'FIRST_TOPIC',
        topic: this.firstTopic || this.activeTopic || 'www',
        label: 'chủ đề đầu tiên'
      };
    }

    // 2. Nhận diện câu trả lời ngắn của học sinh ("Có", "Không", "Em không biết", "Google ạ")
    const isYesAnswer = /^(có|có ạ|dạ có|vâng|vâng ạ|dạ đúng|đúng rồi|chuẩn rồi|chắc chắn có)$/i.test(lower);
    const isNoAnswer = /^(không|không ạ|dạ không|chưa ạ|không phải|không phải ạ|đâu có)$/i.test(lower);
    const isDontKnow = /^(em không biết|mình không biết|không biết ạ|em chưa biết|chưa biết ạ|khó quá|em chịu)$/i.test(lower);

    if (isYesAnswer || isNoAnswer || isDontKnow) {
      return {
        isReference: true,
        isShortAnswer: true,
        answerType: isYesAnswer ? 'YES' : (isNoAnswer ? 'NO' : 'DONT_KNOW'),
        topic: this.activeTopic || 'www',
        lastAiQuestion: this.lastAiQuestion,
        conversationStage: this.conversationStage
      };
    }

    // 3. Tham chiếu đại từ: "nó", "cái đó", "điều đó", "cái này", "điều vừa rồi"
    const hasPronoun = /(?:^|\s|[?.,!])(nó|cái đó|điều đó|cái này|điều này|cái vừa rồi|điều vừa nói|vừa nãy|vừa rồi)(?:$|\s|[?.,!])/i.test(lower);
    if (hasPronoun && this.activeTopic) {
      return {
        isReference: true,
        referenceType: 'PRONOUN',
        topic: this.activeTopic,
        label: this.getTopicHumanLabel(this.activeTopic)
      };
    }

    // 4. Câu hỏi tiếp nối không có chủ ngữ rõ ràng:
    // "thế có tác dụng gì?", "dùng để làm gì?", "cho mình một ví dụ", "ví dụ đi", "nói rõ hơn đi"
    const isFollowUpPattern = /^(thế|vậy|cho mình|cho em|còn|thế thì)?\s*(có tác dụng gì|dùng để làm gì|để làm gì|cho ví dụ|cho mình ví dụ|ví dụ nhé|nói ngắn hơn|giải thích lại|nghĩa là sao|tại sao)/i.test(lower);
    if (isFollowUpPattern && this.activeTopic) {
      return {
        isReference: true,
        referenceType: 'FOLLOW_UP',
        topic: this.activeTopic,
        label: this.getTopicHumanLabel(this.activeTopic)
      };
    }

    return {
      isReference: false,
      topic: this.activeTopic
    };
  }

  // Chuyển mã chủ đề thành tên hiển thị tự nhiên
  getTopicHumanLabel(topicKey) {
    const labels = {
      www: 'Mạng thông tin toàn cầu (World Wide Web)',
      internet: 'Mạng máy tính Internet',
      hyperlink: 'Siêu liên kết',
      hypertext: 'Siêu văn bản',
      website: 'Website',
      webpage: 'Trang web',
      homepage: 'Trang chủ',
      browser: 'Trình duyệt web',
      history: 'Lịch sử phát minh Web của Tim Berners-Lee',
      search: 'Máy tìm kiếm thông tin'
    };
    return labels[topicKey] || topicKey;
  }

  // Tóm tắt và cắt gọt lịch sử cũ khi hội thoại kéo dài (Sliding Window Memory)
  pruneOldHistory() {
    if (this.messages.length <= this.maxHistorySize) return;

    // Giữ lại các tin nhắn gần nhất nhưng luôn bảo toàn trạng thái sư phạm
    const recent = this.messages.slice(-this.maxHistorySize);
    this.messages = recent;
  }

  // Xuất lịch sử chuẩn hóa để gửi tới AI API (Gemini / BitOne / OpenAI)
  getHistoryForAPI() {
    return this.messages.slice(-10).map((m) => ({
      sender: m.role === 'user' ? 'user' : 'webby',
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
      text: m.content
    }));
  }

  // Xuất đầy đủ cấu trúc dữ liệu State Management chuẩn mực theo yêu cầu
  getFullContextForAI() {
    return {
      conversation_history: this.getHistoryForAPI(),
      current_topic: this.activeTopic || 'www',
      last_ai_question: this.lastAiQuestion,
      last_ai_question_type: this.lastAiQuestionType,
      last_student_answer: this.lastStudentAnswer,
      learning_objective: this.learningObjective,
      student_knowledge: this.studentKnowledge,
      misconceptions: this.misconceptions,
      conversation_stage: this.conversationStage,
      next_teaching_goal: this.nextTeachingGoal,
      difficulty_level: this.difficultyLevel,
      consecutive_correct: this.consecutiveCorrect,
      is_warmup_completed: this.isWarmupCompleted,
      student_name: this.studentName,
      first_topic: this.firstTopic,
      last_assistant_reply: this.lastAssistantReply
    };
  }

  // Lấy toàn bộ bản ghi phục vụ debug và báo cáo
  getSnapshot() {
    return {
      sessionId: this.sessionId,
      conversationId: this.conversationId,
      activeTopic: this.activeTopic,
      topicsCovered: this.topicsCovered,
      firstTopic: this.firstTopic,
      studentName: this.studentName,
      messageCount: this.messages.length,
      conversationStage: this.conversationStage,
      lastAiQuestion: this.lastAiQuestion,
      lastStudentAnswer: this.lastStudentAnswer,
      learningObjective: this.learningObjective,
      studentKnowledge: this.studentKnowledge,
      misconceptions: this.misconceptions,
      difficultyLevel: this.difficultyLevel,
      consecutiveCorrect: this.consecutiveCorrect,
      isWarmupCompleted: this.isWarmupCompleted,
      recentMessages: this.messages.slice(-6)
    };
  }
}

export const conversationMemory = new ConversationMemory();
