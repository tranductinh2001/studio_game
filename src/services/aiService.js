import lessonData from '../data/lessonKnowledge.json';

const getBaseApiUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:3001/api`;
  }
  return '/api';
};

class AIService {
  constructor() {
    this.apiUrl = `${getBaseApiUrl()}/chat`;
    this.statusUrl = `${getBaseApiUrl()}/status`;
    this.onlineStatus = {
      isBackendOnline: false,
      hasApiKey: false,
      model: 'unknown'
    };
    this.checkStatus();
  }

  async checkStatus() {
    try {
      const res = await fetch(this.statusUrl, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        this.onlineStatus = {
          isBackendOnline: true,
          hasApiKey: data.hasApiKey,
          model: data.model
        };
        return this.onlineStatus;
      }
    } catch (e) {
      console.warn('Backend not detected, running in full client-side offline mode.');
      this.onlineStatus = {
        isBackendOnline: false,
        hasApiKey: false,
        model: 'client-offline'
      };
    }
    return this.onlineStatus;
  }

  // Generate local offline reply if backend is offline or student is offline
  generateClientOfflineReply(message, history = []) {
    const clean = (message || '').toLowerCase().trim();

    // Who are you / Identity
    if (/^(bạn là ai|bạn tên là gì|cậu là ai|webby là ai|giới thiệu|ai tạo ra bạn)/i.test(clean)) {
      return {
        reply: "Mình là WEBBY, đại sứ AI đến từ thế giới Mạng thông tin toàn cầu! Mình rất thích cùng các bạn học sinh lớp 6 khám phá thế giới Internet và các trang web kỳ diệu!",
        emotion: "HAPPY",
        mode: "client-identity"
      };
    }

    // Greetings
    if (/^(xin chào|chào|hello|hi|webby ơi|ê webby|chào bạn)/i.test(clean) && clean.length < 25) {
      return {
        reply: "Xin chào các bạn học sinh lớp 6 thân yêu! Mình là WEBBY đây. Rất vui được trò chuyện cùng các bạn trong tiết Tin học hôm nay! Bạn muốn hỏi mình điều gì nào?",
        emotion: "HAPPY",
        mode: "client-greeting"
      };
    }

    // Ready
    if (/(sẵn sàng|rồi|ok|dạ rồi|sẵn sàng rồi)/i.test(clean) && clean.length < 25) {
      return {
        reply: "Tuyệt vời! Tinh thần lớp mình thật hào hứng! Chúng ta bắt đầu khám phá thế giới Mạng thông tin toàn cầu nhé! Bạn muốn hỏi gì đầu tiên nào?",
        emotion: "HAPPY",
        mode: "client-offline"
      };
    }

    // Internet vs Web difference
    if ((clean.includes('khác nhau') || clean.includes('phân biệt') || clean.includes('giống nhau')) &&
        (clean.includes('internet') || clean.includes('mạng')) &&
        (clean.includes('web') || clean.includes('www'))) {
      return {
        reply: "Internet và WWW không phải là một đâu nhé! Internet là hạ tầng mạng lưới toàn cầu kết nối các máy tính. Còn WWW là dịch vụ thông tin chứa các trang web chạy trên con đường Internet đó!",
        emotion: "SPEAKING",
        mode: "client-internet-vs-web"
      };
    }

    // Common student answers: "xem video", "học bài", "xem youtube"
    if (/^(xem video|xem phim|xem youtube|học tập|tìm bài tập|học bài|tra cứu|nghe nhạc)/i.test(clean)) {
      return {
        reply: "Thật tuyệt vời! Internet giúp chúng ta học tập và giải trí mọi lúc mọi nơi. Vậy bạn có biết làm thế nào để máy tính tìm được đúng video hay bài học đó trên mạng không?",
        emotion: "HAPPY",
        mode: "client-followup"
      };
    }

    // Match FAQ in lesson data
    if (lessonData && lessonData.faq) {
      for (const item of lessonData.faq) {
        const words = item.question.toLowerCase().replace(/[?.,]/g, '').split(' ');
        const matches = words.filter(w => w.length > 2 && clean.includes(w));
        if (matches.length >= 2 || clean.includes(item.question.toLowerCase().slice(0, 15))) {
          return {
            reply: `${item.answer} ${item.followup}`,
            emotion: "SPEAKING",
            mode: "client-knowledge-base"
          };
        }
      }
    }

    // Match topics
    if (lessonData && lessonData.topics) {
      for (const topic of lessonData.topics) {
        for (const kw of topic.keywords) {
          if (clean.includes(kw)) {
            return {
              reply: `${topic.dialogue} Bạn thấy khái niệm này có thú vị không?`,
              emotion: "SPEAKING",
              mode: "client-topic-match"
            };
          }
        }
      }
    }

    // Default polite off-topic or fallback
    return {
      reply: "Đó là một câu hỏi rất thú vị! Nhưng hôm nay mình đến đây để cùng các bạn khám phá thế giới Mạng thông tin toàn cầu. Bạn có thắc mắc gì về Website, Trình duyệt hay Internet không?",
      emotion: "THINKING",
      mode: "client-offline-fallback"
    };
  }

  async sendQuery(message, history = []) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          reply: data.reply,
          emotion: data.emotion || 'SPEAKING',
          mode: data.mode || 'backend'
        };
      }
    } catch (err) {
      console.warn('Backend request failed, using instant client-side intelligence:', err.message);
    }

    // Fallback to client-side rule engine
    return this.generateClientOfflineReply(message);
  }
}

export const aiService = new AIService();

