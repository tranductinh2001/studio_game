// Conversation Memory Service
// Quản lý bộ nhớ ngữ cảnh hội thoại đa phiên, liên kết câu hỏi trước và giải quyết tham chiếu

export class ConversationMemory {
  constructor(sessionId = null) {
    this.sessionId = sessionId || `session_${Date.now()}`;
    this.conversationId = `conv_${Date.now()}`;
    this.messages = [];
    this.activeTopic = null;          // Chủ đề đang thảo luận gần nhất
    this.topicsCovered = [];          // Danh sách các chủ đề đã nói qua trong phiên
    this.firstTopic = null;           // Chủ đề đầu tiên của phiên (cho câu: "còn cái đầu tiên là gì?")
    this.studentName = null;          // Tên học sinh nếu có ("mình là An", "em tên là Bảo")
    this.lastAssistantReply = '';     // Nội dung trả lời gần nhất của bot
    this.lastUserQuery = '';          // Câu hỏi gần nhất của học sinh
    this.unresolvedQuery = null;      // Câu hỏi dang dở cần làm rõ
    this.maxHistorySize = 12;         // Kích thước cửa sổ trượt (sliding window)
  }

  // Bắt đầu một phiên trò chuyện mới (cách ly giữa các học sinh/tiết học)
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
  }

  // Thêm tin nhắn vào bộ nhớ ngữ cảnh
  addMessage(role, content, metadata = {}) {
    if (!content || !content.trim()) return;

    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      role, // 'user' | 'assistant'
      content: content.trim(),
      timestamp: Date.now(),
      topic: metadata.topic || this.activeTopic,
      intent: metadata.intent || null,
      ...metadata
    };

    this.messages.push(msg);

    if (role === 'assistant') {
      this.lastAssistantReply = msg.content;
      if (metadata.topic) {
        this.setActiveTopic(metadata.topic);
      }
    } else if (role === 'user') {
      this.lastUserQuery = msg.content;
      // Phát hiện học sinh xưng tên (VD: "mình là An", "em tên Minh")
      this.detectStudentName(msg.content);
    }

    // Giữ kích thước cửa sổ trượt hợp lý, tránh tăng vô hạn
    if (this.messages.length > this.maxHistorySize * 2) {
      this.pruneOldHistory();
    }

    return msg;
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

  // Giải quyết tham chiếu đại từ và câu hỏi nối tiếp dựa trên ngữ cảnh đã lưu
  resolveReference(query) {
    if (!query) return { isReference: false, topic: this.activeTopic };

    const lower = query.toLowerCase().trim();

    // 1. Tham chiếu đến cái đầu tiên: "còn cái đầu tiên là gì nhỉ?", "nhắc lại cái đầu tiên"
    if (lower.includes('cái đầu tiên') || lower.includes('điều đầu tiên') || lower.includes('ý đầu tiên') || lower.includes('chủ đề đầu')) {
      return {
        isReference: true,
        referenceType: 'FIRST_TOPIC',
        topic: this.firstTopic || this.activeTopic,
        label: 'chủ đề đầu tiên'
      };
    }

    // 2. Tham chiếu đại từ: "nó", "cái đó", "điều đó", "cái này", "điều vừa rồi"
    const hasPronoun = /(?:^|\s|[?.,!])(nó|cái đó|điều đó|cái này|điều này|cái vừa rồi|điều vừa nói|vừa nãy|vừa rồi)(?:$|\s|[?.,!])/i.test(lower);
    if (hasPronoun && this.activeTopic) {
      return {
        isReference: true,
        referenceType: 'PRONOUN',
        topic: this.activeTopic,
        label: this.getTopicHumanLabel(this.activeTopic)
      };
    }

    // 3. Câu hỏi tiếp nối không có chủ ngữ rõ ràng:
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

    // Giữ lại 8 tin nhắn gần nhất và tin nhắn đầu tiên chứa bối cảnh
    const recent = this.messages.slice(-this.maxHistorySize);
    this.messages = recent;
  }

  // Xuất lịch sử chuẩn hóa để gửi tới AI API (Gemini / BitOne / OpenAI)
  getHistoryForAPI() {
    return this.messages.slice(-8).map((m) => ({
      sender: m.role === 'user' ? 'user' : 'webby',
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
      text: m.content
    }));
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
      recentMessages: this.messages.slice(-6)
    };
  }
}

export const conversationMemory = new ConversationMemory();

