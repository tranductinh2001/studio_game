// Curriculum Knowledge Intents & Smart Natural Language Matching Engine
// Môn Tin học 6 - Bài 6: Mạng thông tin toàn cầu (SGK Kết nối tri thức với cuộc sống & CV 5512)

// SPECIFIC CURRICULUM KNOWLEDGE TOPICS (Evaluated FIRST so compound questions get answered)
export const KNOWLEDGE_INTENTS = [
  // 1. Who invented WWW? (Tim Berners-Lee / History)
  {
    id: 'inventor_history',
    patterns: [
      /(ai phát minh|ai tạo ra|người sáng lập|người phát minh|tim berners-lee|năm 1989|lịch sử web)/i
    ],
    keywords: ['ai phát minh', 'ai tạo ra', 'tim berners-lee', '1989', 'lịch sử web'],
    reply: "World Wide Web được phát minh vào năm 1989 bởi nhà khoa học người Anh Tim Berners-Lee tại viện nghiên cứu CERN! Nhờ phát minh vĩ đại này mà nhân loại có thể xem và chia sẻ trang web dễ dàng như hôm nay!",
    emotion: 'HAPPY'
  },

  // 2. World Wide Web (WWW) Definition
  {
    id: 'www_definition',
    patterns: [
      /(mạng thông tin toàn cầu là gì|thế nào là mạng thông tin toàn cầu)/i,
      /(www là gì|world wide web là gì|viết tắt của từ gì|nghĩa là gì)/i,
      /(khái niệm www|định nghĩa www)/i
    ],
    keywords: ['www là gì', 'world wide web', 'mạng thông tin toàn cầu là gì', 'viết tắt', 'định nghĩa www'],
    reply: "Mạng thông tin toàn cầu, viết tắt là WWW (World Wide Web), là một dịch vụ thông tin khổng lồ trên Internet, bao gồm hàng triệu trang web liên kết chặt chẽ với nhau!",
    emotion: 'SPEAKING'
  },

  // 3. Hyperlink (Siêu liên kết) & Signs (Dấu hiệu nhận biết)
  {
    id: 'hyperlink',
    patterns: [
      /(siêu liên kết là gì|thế nào là siêu liên kết|hyperlink|dấu hiệu nhận biết siêu liên kết|hình bàn tay|con trỏ chuột biến thành|gạch chân)/i
    ],
    keywords: ['siêu liên kết', 'hyperlink', 'bàn tay', 'dấu hiệu nhận biết', 'con trỏ', 'gạch chân'],
    reply: "Siêu liên kết (Hyperlink) là đoạn văn bản hoặc hình ảnh mà khi nhấn chuột vào sẽ đưa chúng ta đến một trang web khác! Dấu hiệu nhận biết là chữ thường đổi màu, có gạch chân và con trỏ chuột biến thành hình bàn tay chỉ ngón!",
    emotion: 'HAPPY'
  },

  // 4. Hypertext (Siêu văn bản)
  {
    id: 'hypertext',
    patterns: [
      /(siêu văn bản là gì|thế nào là siêu văn bản|hypertext|khác văn bản thường)/i
    ],
    keywords: ['siêu văn bản', 'hypertext', 'văn bản tích hợp'],
    reply: "Siêu văn bản (Hypertext) là loại văn bản đặc biệt tích hợp chữ viết, hình ảnh sống động, âm thanh, video clip và chứa các siêu liên kết để dẫn sang các trang web khác!",
    emotion: 'SPEAKING'
  },

  // 5. How information is organized on Internet
  {
    id: 'info_organization',
    patterns: [
      /(thông tin trên internet được tổ chức|tổ chức thông tin như thế nào|tổ chức như thế nào|dưới dạng gì)/i
    ],
    keywords: ['tổ chức thông tin', 'tổ chức như thế nào', 'dưới dạng'],
    reply: "Thông tin trên Internet được tổ chức dưới dạng siêu văn bản và được kết nối với nhau bằng các siêu liên kết, tạo thành một mạng lưới thông tin toàn cầu khổng lồ!",
    emotion: 'SPEAKING'
  },

  // 6. Website vs Webpage (Website và Trang web)
  {
    id: 'website_vs_webpage',
    patterns: [
      /(website là gì|thế nào là website|trang web là gì|phân biệt website và trang web|khác nhau giữa website và trang web|tập hợp các trang web)/i
    ],
    keywords: ['website là gì', 'trang web là gì', 'phân biệt website', 'cuốn sách', 'khác nhau giữa website'],
    reply: "Các bạn hãy nhớ hình ảnh này: Website giống như một cuốn sách hoàn chỉnh, còn Trang web (Web page) chính là từng trang riêng lẻ trong cuốn sách đó! Một website gồm nhiều trang web liên quan được lưu dưới một địa chỉ chung!",
    emotion: 'SPEAKING'
  },

  // 7. Homepage (Trang chủ)
  {
    id: 'homepage',
    patterns: [
      /(trang chủ là gì|thế nào là trang chủ|homepage|trang mở ra đầu tiên|trang đầu tiên)/i
    ],
    keywords: ['trang chủ', 'homepage', 'trang đầu tiên', 'trang mở ra'],
    reply: "Trang chủ (Homepage) chính là trang web đầu tiên xuất hiện khi các bạn truy cập vào một địa chỉ website!",
    emotion: 'SPEAKING'
  },

  // 8. Website Address (URL / Địa chỉ website)
  {
    id: 'website_address',
    patterns: [
      /(địa chỉ website|địa chỉ web là gì|url là gì|cho ví dụ địa chỉ web|thcsdaktroi\.edu\.vn|dantri\.com\.vn)/i
    ],
    keywords: ['địa chỉ website', 'địa chỉ web', 'url', 'ví dụ địa chỉ'],
    reply: "Mỗi website trên Internet đều có một địa chỉ truy cập duy nhất, ví dụ: thcsdaktroi.edu.vn hoặc dantri.com.vn. Nhập đúng địa chỉ này vào thanh địa chỉ là chúng ta vào thẳng website!",
    emotion: 'SPEAKING'
  },

  // 9. Web Browser (Trình duyệt web)
  {
    id: 'web_browser',
    patterns: [
      /(trình duyệt là gì|trình duyệt web là gì|browser là gì|công dụng của trình duyệt|dùng để làm gì)/i
    ],
    keywords: ['trình duyệt là gì', 'trình duyệt web', 'browser', 'phần mềm', 'công dụng'],
    reply: "Trình duyệt web là phần mềm ứng dụng giúp người dùng truy cập, hiển thị và tương tác với các trang web trên Mạng thông tin toàn cầu!",
    emotion: 'SPEAKING'
  },

  // 10. Popular Browsers (Các trình duyệt phổ biến)
  {
    id: 'popular_browsers',
    patterns: [
      /(kể tên trình duyệt|các trình duyệt phổ biến|trình duyệt nào|chrome|google chrome|edge|microsoft edge|cốc cốc|firefox|safari|opera)/i
    ],
    keywords: ['kể tên trình duyệt', 'các trình duyệt', 'chrome', 'cốc cốc', 'edge', 'firefox', 'safari'],
    reply: "Một số trình duyệt web rất quen thuộc và phổ biến hiện nay gồm có: Google Chrome, Microsoft Edge, Cốc Cốc, Mozilla Firefox và Safari của Apple!",
    emotion: 'HAPPY'
  },

  // 11. 3 Steps to Access a Webpage (Quy trình 3 bước)
  {
    id: 'access_steps',
    patterns: [
      /(3 bước|ba bước|các bước truy cập|quy trình truy cập|làm sao vào trang web|cách vào trang web|truy cập trang web bằng cách nào)/i
    ],
    keywords: ['3 bước', 'ba bước', 'các bước truy cập', 'quy trình', 'cách vào trang web'],
    reply: "Quy trình chuẩn 3 bước truy cập trang web: Bước 1: Khởi động trình duyệt web; Bước 2: Nhập địa chỉ website vào thanh địa chỉ URL; Bước 3: Nhấn phím Enter trên bàn phím!",
    emotion: 'SPEAKING'
  },

  // 12. Address Bar (Thanh địa chỉ)
  {
    id: 'address_bar',
    patterns: [
      /(thanh địa chỉ|ô địa chỉ|gõ địa chỉ ở đâu|thanh url)/i
    ],
    keywords: ['thanh địa chỉ', 'ô địa chỉ', 'gõ ở đâu'],
    reply: "Thanh địa chỉ nằm ở phía trên cùng của cửa sổ trình duyệt. Đó là nơi chúng mình gõ địa chỉ website muốn xem rồi nhấn Enter để mở trang!",
    emotion: 'SPEAKING'
  },

  // 13. Difference: Internet vs Web
  {
    id: 'internet_vs_web',
    patterns: [
      /(phân biệt internet và|khác nhau giữa internet và|internet và www khác nhau|internet và web có giống nhau|internet và mạng toàn cầu)/i
    ],
    keywords: ['khác nhau giữa internet', 'phân biệt internet', 'internet và www', 'đường cao tốc'],
    reply: "Internet và WWW không phải là một đâu nhé! Internet là hạ tầng mạng kết nối các máy tính toàn cầu, giống như hệ thống đường cao tốc. Còn WWW là dịch vụ thông tin chứa các trang web chạy trên con đường Internet đó!",
    emotion: 'SPEAKING'
  },

  // 14. Internet Benefits (Lợi ích Internet)
  {
    id: 'internet_benefits',
    patterns: [
      /(lợi ích của internet|internet giúp ích gì|internet dùng để làm gì|học tập trên mạng|xem youtube|xem video|nghe nhạc|tra cứu)/i
    ],
    keywords: ['lợi ích', 'giúp ích gì', 'xem video', 'học bài', 'tra cứu', 'youtube'],
    reply: "Internet mang lại vô vàn lợi ích: giúp chúng mình tra cứu kiến thức học tập, xem video khoa học, học trực tuyến, nghe nhạc thư giãn và kết nối với bạn bè khắp nơi!",
    emotion: 'HAPPY'
  },

  // 15. Online Safety & Netiquette (An toàn mạng)
  {
    id: 'online_safety',
    patterns: [
      /(an toàn trên mạng|tin giả|lừa đảo|có nên tin tất cả|mật khẩu|bảo vệ thông tin cá nhân|lướt web an toàn)/i
    ],
    keywords: ['an toàn', 'tin giả', 'mật khẩu', 'thông tin cá nhân', 'lừa đảo', 'tin tất cả'],
    reply: "Không phải mọi thông tin trên Internet đều đúng đâu nhé! Các bạn hãy luôn bảo vệ mật khẩu, không bấm vào liên kết lạ, không chia sẻ thông tin cá nhân và luôn hỏi ý kiến thầy cô, bố mẹ!",
    emotion: 'ENCOURAGING'
  },

  // 16. If No Internet (Nếu không có Internet)
  {
    id: 'no_internet',
    patterns: [
      /(nếu không có internet|không có mạng|mất mạng thì sao|trước khi có internet)/i
    ],
    keywords: ['không có internet', 'không có mạng', 'mất mạng'],
    reply: "Nếu không có Internet, việc tìm kiếm thông tin sẽ rất khó khăn và mất thời gian, chúng ta phải đến thư viện tìm từng trang sách và gửi thư tay qua bưu điện mất nhiều ngày!",
    emotion: 'SPEAKING'
  },

  // 17. Dak Troi School & Teacher Tran Duc Tinh
  {
    id: 'school_teacher',
    patterns: [
      /(đắk trôi|dak troi|thcs đắk trôi)/i,
      /(thầy tình|trần đức tình|thầy giáo)/i,
      /(tổ tự nhiên|trường mình)/i
    ],
    keywords: ['đắk trôi', 'thầy tình', 'trần đức tình', 'thcs đắk trôi', 'tổ tự nhiên'],
    reply: "Trường THCS Đắk Trôi của chúng mình thật tuyệt vời! Hôm nay được đồng hành cùng Thầy Trần Đức Tình và các bạn học sinh lớp 6 thông minh là niềm vinh hạnh rất lớn của WEBBY đấy!",
    emotion: 'HAPPY'
  },

  // 18. Lesson 6 context / Today's lesson
  {
    id: 'lesson_topic',
    patterns: [
      /(hôm nay học bài gì|bài hôm nay|bài 6|tiết 11|môn tin|môn tin học)/i
    ],
    keywords: ['bài 6', 'tiết 11', 'học bài gì', 'mạng thông tin toàn cầu'],
    reply: "Hôm nay chúng mình học Bài 6: Mạng thông tin toàn cầu (Tiết 11) môn Tin học 6 nhé! Bài học có rất nhiều điều kỳ diệu về WWW, website, siêu liên kết và trình duyệt web đấy!",
    emotion: 'SPEAKING'
  },

  // 19. Group Discussion & Paper Draft (Thảo luận nhóm giấy nháp)
  {
    id: 'group_work',
    patterns: [
      /(thảo luận nhóm|giấy nháp|làm bài nhóm|nhóm 1|nhóm 2|nhóm 3|nhóm 4|lên bảng)/i
    ],
    keywords: ['thảo luận nhóm', 'giấy nháp', 'nhóm 1', 'nhóm 2', 'nhóm 3', 'nhóm 4', 'lên bảng'],
    reply: "Các bạn hãy tích cực đọc SGK, thảo luận nhóm sôi nổi, ghi câu trả lời ra giấy nháp và cử đại diện lên bảng viết nhé! WEBBY luôn đồng hành và cổ vũ các nhóm!",
    emotion: 'HAPPY'
  },

  // 20. Timer Finished (Hết giờ)
  {
    id: 'timer_ended',
    patterns: [
      /(hết giờ|hết thời gian|rung chuông)/i
    ],
    keywords: ['hết giờ', 'hết thời gian', 'chuông reo'],
    reply: "Kính coong! Đã hết thời gian thảo luận rồi! Xin mời các nhóm cử đại diện nhanh chóng lên bảng trình bày kết quả cho thầy cô và cả lớp cùng theo dõi nhé!",
    emotion: 'HAPPY'
  },

  // 21. Compliments to Student (Khen ngợi học sinh)
  {
    id: 'student_correct',
    patterns: [
      /(đúng rồi|chính xác|em trả lời xong rồi|câu trả lời của em|làm đúng không)/i
    ],
    keywords: ['đúng rồi', 'chính xác', 'trả lời xong'],
    reply: "Hoan hô bạn! Câu trả lời rất chính xác và xuất sắc! Cả lớp hãy dành một tràng pháo tay thật lớn để khen ngợi bạn nào!",
    emotion: 'HAPPY'
  }
];

// CONVERSATIONAL INTENTS (Evaluated when no specific knowledge topic matched)
export const CONVERSATIONAL_INTENTS = [
  // 1. Identity & Introduction
  {
    id: 'identity',
    patterns: [
      /(bạn|cậu|webby|em|cháu) là ai/i,
      /tên (bạn|cậu|em|cháu) là gì/i,
      /ai (tạo|sinh|lập trình) ra (bạn|webby|cậu)/i,
      /giới thiệu về (bạn|bản thân|webby)/i,
      /bạn từ đâu (đến|tới)/i,
      /mấy tuổi/i
    ],
    keywords: ['webby là ai', 'bạn là ai', 'tên là gì', 'ai tạo ra bạn', 'giới thiệu bản thân'],
    reply: "Mình là WEBBY, đại sứ AI thông minh đến từ thế giới Mạng thông tin toàn cầu! Mình rất thích được đồng hành cùng các bạn học sinh lớp 6 Trường THCS Đắk Trôi khám phá Internet và các trang web kỳ thú!",
    emotion: 'HAPPY'
  },

  // 2. Greetings
  {
    id: 'greeting',
    patterns: [
      /(xin chào|chào bạn|chào webby|webby ơi|ê webby|chào em|chào cháu|chào lớp|chào cả lớp|hello|hé lô|hi\b)/i,
      /chúc.*(buổi sáng|buổi chiều|ngày mới|tốt lành)/i,
      /lớp 6.*chào/i
    ],
    keywords: ['xin chào', 'chào bạn', 'chào webby', 'hello', 'hi', 'webby ơi'],
    reply: "Xin chào các bạn học sinh lớp 6 thân yêu! Mình là WEBBY đây. Rất vui được gặp các bạn trong tiết Tin học hôm nay! Các bạn có câu hỏi thú vị nào muốn trao đổi cùng mình không?",
    emotion: 'HAPPY'
  },

  // 3. Ready / Cheerful confirmation
  {
    id: 'ready',
    patterns: [
      /(sẵn sàng|rồi|sẵn sàng rồi|bắt đầu thôi|ok|yes|dạ rồi|nhất trí)/i
    ],
    keywords: ['sẵn sàng', 'bắt đầu thôi', 'ok', 'dạ rồi'],
    reply: "Tuyệt vời! Tinh thần lớp mình hôm nay thật sôi nổi và năng lượng! Chúng ta cùng bước vào khám phá thế giới Mạng thông tin toàn cầu ngay nào!",
    emotion: 'HAPPY'
  },

  // 4. Fun & Jokes (Hài hước, giải trí)
  {
    id: 'fun_humor',
    patterns: [
      /(kể chuyện cười|hát đi|biết hát không|kể chuyện vui|chơi game)/i
    ],
    keywords: ['chuyện cười', 'hát', 'chơi game', 'chuyện vui'],
    reply: "Có một chú chuột máy tính hỏi chú chuột nhắt: 'Sao cậu cứ chạy lăng xăng thế?'. Chuột nhắt trả lời: 'Tại tớ không có dây kết nối như cậu đấy!'. Giờ thì chúng mình cùng quay lại bài học kỳ thú nhé!",
    emotion: 'HAPPY'
  },

  // 5. Farewell (Tạm biệt)
  {
    id: 'goodbye',
    patterns: [
      /(tạm biệt|bye bye|hẹn gặp lại|chào tạm biệt)/i
    ],
    keywords: ['tạm biệt', 'bye bye', 'hẹn gặp lại'],
    reply: "Tạm biệt các bạn học sinh lớp 6 siêu thông minh của Trường THCS Đắk Trôi! Chúc các bạn luôn lướt web an toàn, học thật giỏi và yêu thích môn Tin học nhé!",
    emotion: 'GOODBYE'
  }
];

export const CURRICULUM_INTENTS = [...KNOWLEDGE_INTENTS, ...CONVERSATIONAL_INTENTS];

// Helper to match curriculum intent with prioritized topic resolution
export function matchCurriculumResponse(query, faqList = [], topicsList = []) {
  if (!query || typeof query !== 'string') {
    return {
      text: "Xin chào bạn! Mình là WEBBY. Bạn có thắc mắc gì về Mạng thông tin toàn cầu không nào?",
      emotion: "GREETING",
      source: "curriculum-default"
    };
  }

  const clean = query.toLowerCase().trim();

  // STEP 1: Check Specific Knowledge Topics FIRST
  for (const intent of KNOWLEDGE_INTENTS) {
    if (intent.patterns && intent.patterns.some((r) => r.test(clean))) {
      return {
        text: intent.reply,
        emotion: intent.emotion || 'SPEAKING',
        source: `curriculum-intent-${intent.id}`
      };
    }
    if (intent.keywords && intent.keywords.some((k) => clean.includes(k))) {
      return {
        text: intent.reply,
        emotion: intent.emotion || 'SPEAKING',
        source: `curriculum-keyword-${intent.id}`
      };
    }
  }

  // STEP 2: Check Secondary FAQ List
  if (Array.isArray(faqList)) {
    for (const item of faqList) {
      const qWords = item.question.toLowerCase().replace(/[?.,]/g, '').split(' ');
      const matchCount = qWords.filter((w) => w.length > 2 && clean.includes(w)).length;
      if (matchCount >= 2 || clean.includes(item.question.toLowerCase().slice(0, 15))) {
        return {
          text: `${item.answer} ${item.followup}`,
          emotion: "SPEAKING",
          source: "knowledge-faq"
        };
      }
    }
  }

  // STEP 3: Check Topic Dialogue List
  if (Array.isArray(topicsList)) {
    for (const topic of topicsList) {
      if (topic.keywords) {
        for (const kw of topic.keywords) {
          if (clean.includes(kw)) {
            return {
              text: `${topic.dialogue} Bạn thấy khái niệm này có thú vị không?`,
              emotion: "SPEAKING",
              source: "knowledge-topic"
            };
          }
        }
      }
    }
  }

  // STEP 4: Check Conversational Intents (Greetings, Identity, Ready, Goodbye)
  for (const intent of CONVERSATIONAL_INTENTS) {
    if (intent.patterns && intent.patterns.some((r) => r.test(clean))) {
      return {
        text: intent.reply,
        emotion: intent.emotion || 'SPEAKING',
        source: `curriculum-intent-${intent.id}`
      };
    }
    if (intent.keywords && intent.keywords.some((k) => clean.includes(k))) {
      return {
        text: intent.reply,
        emotion: intent.emotion || 'SPEAKING',
        source: `curriculum-keyword-${intent.id}`
      };
    }
  }

  // STEP 5: Context-Aware Fallbacks
  if (clean.includes('máy tính') || clean.includes('điện thoại') || clean.includes('công nghệ') || clean.includes('robot') || clean.includes('ai')) {
    return {
      text: "Đó là một câu hỏi rất sáng tạo về công nghệ! Các thiết bị như máy tính và điện thoại đều có thể kết nối Internet để duyệt web. Bạn có muốn cùng mình tìm hiểu cách một trang web được mở trên các thiết bị đó không?",
      emotion: 'SPEAKING',
      source: 'tech-contextual-fallback'
    };
  }

  if (clean.includes('game') || clean.includes('trò chơi') || clean.includes('phim') || clean.includes('video')) {
    return {
      text: "Thế giới web có rất nhiều trò chơi và video giáo dục bổ ích! Nhưng các bạn nhớ luôn chọn lọc nội dung lành mạnh và an toàn nhé. Giờ bạn muốn tìm hiểu tiếp về website hay trình duyệt nào?",
      emotion: 'HAPPY',
      source: 'media-contextual-fallback'
    };
  }

  // STEP 6: Positive, open-ended pedagogical fallback (Never says "hơi bối rối")
  return {
    text: "Đó là một câu hỏi rất thú vị của bạn! Trong thế giới Mạng thông tin toàn cầu, mọi điều kỳ diệu đều bắt đầu từ việc chúng ta tò mò và đặt câu hỏi. Bạn có muốn cùng mình khám phá tiếp về các trang web và trình duyệt trong Bài 6 này không?",
    emotion: "HAPPY",
    source: "open-pedagogical-fallback"
  };
}
