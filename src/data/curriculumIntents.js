// Curriculum Knowledge Intents & Smart Natural Language Matching Engine
// Môn Tin học 6 - Bài 6: Mạng thông tin toàn cầu (SGK Kết nối tri thức với cuộc sống & CV 5512)
// Nâng cấp: Socratic Pedagogical Dialogue Engine, phân loại ý định học sinh, 7 giai đoạn sư phạm

// KHO VÍ DỤ THỰC TẾ GẦN GŨI CHO TỪNG CHỦ ĐỀ BÀI 6 (Dành cho học sinh lớp 6)
export const TOPIC_EXAMPLES = {
  www: "Ví dụ nhé! Khi bạn dùng điện thoại mở Google tìm 'cách giải bài toán tỉ số phần trăm' hay vào YouTube xem video khám phá vũ trụ, bạn đang bước vào thế giới Mạng thông tin toàn cầu (WWW) đấy!",
  internet: "Ví dụ nhé! Internet giống như hệ thống đường cao tốc và mạng lưới bưu chính toàn cầu: dữ liệu truyền qua cáp quang dưới đáy biển và sóng wifi từ máy tính trường THCS Đắk Trôi đến tận các máy chủ ở bên kia bán cầu!",
  hyperlink: "Ví dụ nhé! Trong bài đọc về 'Tây Nguyên', bạn thấy cụm từ 'Không gian văn hóa Cồng chiêng' màu xanh và có gạch chân. Khi bạn chạm ngón tay hoặc rê chuột vào, con trỏ biến thành hình bàn tay và mở ngay ra bài viết mới – đó chính là Siêu liên kết (Hyperlink), giống như cánh cửa thần kỳ của Doraemon vậy!",
  hypertext: "Ví dụ nhé! Trang báo điện tử Thiếu niên Tiền phong có bài viết về Hội khỏe Phù Đổng: trong bài vừa có chữ viết, ảnh chụp các bạn đạt giải, clip video bàn thắng và cả các đường dẫn sang bài khác – đó chính là Siêu văn bản!",
  website: "Ví dụ nhé! Website của trường THCS Đắk Trôi (thcsdaktroi.edu.vn) giống như một cuốn bách khoa thư về trường: trong đó có trang giới thiệu thầy cô, trang thời khóa biểu và trang tin hoạt động Đoàn Đội!",
  webpage: "Ví dụ nhé! Trong website trường mình, trang 'Thời khóa biểu lớp 6' chính là một trang web (webpage) cụ thể nằm trong website đó!",
  homepage: "Ví dụ nhé! Khi bạn gõ địa chỉ google.com hay thcsdaktroi.edu.vn, trang đầu tiên mở ra trước mắt có logo và thanh điều hướng chính là Trang chủ (Homepage) – giống như cánh cổng trường hay trang bìa của một cuốn sách!",
  browser: "Ví dụ nhé! Biểu tượng hình tròn 4 màu Google Chrome, chữ 'e' xoáy màu xanh Microsoft Edge, hay quả cầu xanh Cốc Cốc trên màn hình chính là các Trình duyệt web – chiếc kính thần kỳ giúp mắt chúng ta đọc và tương tác với các trang web!",
  history: "Ví dụ nhé! Vào năm 1989, nhà khoa học Tim Berners-Lee muốn giúp các đồng nghiệp khắp thế giới dễ dàng chia sẻ tài liệu nghiên cứu với nhau, nên ông đã sáng tạo ra World Wide Web – phát minh đã làm thay đổi cả nhân loại!",
  search: "Ví dụ nhé! Khi bạn gõ từ khóa 'dự báo thời tiết Đắk Trôi hôm nay' vào ô tìm kiếm của Google và nhấn Enter, Google chính là Máy tìm kiếm giúp lục tìm kết quả trong hàng triệu trang web chỉ sau nửa giây!"
};

// KHO GIẢI THÍCH TÁC DỤNG CHO TỪNG CHỦ ĐỀ KHI HỌC SINH HỎI "THẾ NÓ CÓ TÁC DỤNG GÌ?"
export const TOPIC_BENEFITS = {
  www: "Mạng thông tin toàn cầu (WWW) mang cả kho tàng tri thức khổng lồ của nhân loại về ngay bàn học của bạn: từ bài tập Toán, khoa học, lịch sử đến các bộ phim tài liệu sinh động, bạn có thể học tập và khám phá mọi lúc mọi nơi!",
  internet: "Internet giúp kết nối thế giới phẳng không biên giới: giúp các bạn ở Đắk Trôi có thể học tập trực tuyến, gọi video cho người thân ở xa và kết nối bạn bè khắp năm châu trong tích tắc!",
  hyperlink: "Siêu liên kết giúp việc đọc tài liệu vô cùng liền mạch: bạn không cần ghi nhớ hay gõ lại những địa chỉ trang web dài ngoằng, chỉ cần bấm nhẹ một cái là đến ngay nội dung cần tìm!",
  hypertext: "Siêu văn bản giúp bài học sinh động gấp nhiều lần sách in truyền thống, kết hợp hài hòa chữ viết, hình ảnh, âm thanh sống động và video chân thực!",
  website: "Website giúp các trường học, bảo tàng, tổ chức sắp xếp hàng triệu thông tin ngăn nắp dưới một địa chỉ duy nhất, giúp mọi người tra cứu thuận tiện nhất!",
  webpage: "Trang web giúp trình bày một nội dung cụ thể trong website, ví dụ như một bài báo, một thông báo điểm thi hay một bài học trực tuyến!",
  homepage: "Trang chủ giúp người xem nắm bắt ngay bức tranh tổng thể của toàn bộ website và dễ dàng tìm đường đến các nội dung quan trọng khác!",
  browser: "Trình duyệt web như một người thông dịch viên tài ba: dịch những dòng mã lập trình phức tạp thành hình ảnh, video và chữ viết rực rỡ để chúng ta dễ dàng thao tác!",
  history: "Phát minh của Tim Berners-Lee đã mở ra kỷ nguyên thông tin cho nhân loại, đưa kho tàng tri thức thế giới đến tận bàn học của mỗi chúng ta!",
  search: "Máy tìm kiếm giúp chúng ta tra cứu thông tin nhanh chóng trong hàng triệu trang web chỉ trong chưa đầy một giây!"
};

// KHO TÓM TẮT SIÊU NGẮN (KHI HỌC SINH YÊU CẦU: "NÓI NGẮN HƠN ĐI")
export const TOPIC_SUMMARIES = {
  www: "Nói ngắn gọn: WWW là dịch vụ thông tin khổng lồ gồm các trang web liên kết với nhau trên Internet.",
  internet: "Nói ngắn gọn: Internet là mạng liên kết các máy tính trên toàn thế giới.",
  hyperlink: "Nói ngắn gọn: Siêu liên kết là đoạn chữ hoặc hình ảnh bấm vào sẽ dẫn sang trang web khác.",
  hypertext: "Nói ngắn gọn: Siêu văn bản là văn bản tích hợp hình ảnh, âm thanh, video và siêu liên kết.",
  website: "Nói ngắn gọn: Website là tập hợp nhiều trang web liên quan dưới một địa chỉ chung.",
  webpage: "Nói ngắn gọn: Trang web là từng trang tài liệu riêng lẻ trong một website.",
  homepage: "Nói ngắn gọn: Trang chủ là trang web đầu tiên xuất hiện khi truy cập website.",
  browser: "Nói ngắn gọn: Trình duyệt web là phần mềm giúp chúng ta xem và lướt các trang web.",
  history: "Nói ngắn gọn: World Wide Web do nhà khoa học Tim Berners-Lee phát minh năm 1989.",
  search: "Nói ngắn gọn: Máy tìm kiếm là công cụ giúp tra cứu thông tin trên Internet."
};

// KHO SƯ PHẠM GIẢNG GIẢI ĐƠN GIẢN HÓA (KHI HỌC SINH: "EM CHƯA HIỂU LẮM")
export const TOPIC_SIMPLIFIED = {
  www: "Đơn giản lắm nhé! Bạn hãy tưởng tượng Internet như một hệ thống đường cao tốc, còn World Wide Web chính là các khu siêu thị, bảo tàng và thư viện sách khổng lồ được xây dọc hai bên đường để chúng mình vào học tập và vui chơi!",
  internet: "Bạn cứ tưởng tượng Internet giống như mạng lưới đường bộ và hệ thống dây điện thoại bưu chính kết nối mọi ngôi nhà và trường học trên thế giới lại với nhau vậy!",
  hyperlink: "Bạn có nhớ 'Cánh cửa thần kỳ' của chú mèo máy Doraemon không? Siêu liên kết trên màn hình máy tính y như vậy: chạm vào một cái là bạn bước ngay sang một thế giới thông tin mới!",
  website: "Website giống như một cuốn sách giáo khoa Tin học 6 hoàn chỉnh, còn mỗi Trang web chính là từng trang sách cụ thể từ trang 1 đến trang 50 bên trong cuốn sách đó!",
  browser: "Trình duyệt web giống như chiếc kính thần kỳ: nhờ có chiếc kính này (như Chrome, Cốc Cốc, Edge) thì mắt chúng ta mới nhìn rõ được hình ảnh, chữ viết và video trên mạng!",
  homepage: "Trang chủ giống như chiếc cổng trường hoặc trang bìa của cuốn truyện: vừa bước đến nơi là bạn nhìn thấy nó đầu tiên!"
};

// SPECIFIC CURRICULUM KNOWLEDGE TOPICS
export const KNOWLEDGE_INTENTS = [
  // 1. Who invented WWW? (Tim Berners-Lee / History)
  {
    id: 'inventor_history',
    topic: 'history',
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
    topic: 'www',
    patterns: [
      /(mạng thông tin toàn cầu là gì|thế nào là mạng thông tin toàn cầu)/i,
      /(www là gì|world wide web là gì|viết tắt của từ gì|nghĩa là gì)/i,
      /(khái niệm www|định nghĩa www)/i
    ],
    keywords: ['www là gì', 'world wide web', 'mạng thông tin toàn cầu là gì', 'viết tắt', 'định nghĩa www'],
    reply: "Mạng thông tin toàn cầu, viết tắt là WWW (World Wide Web), là một dịch vụ thông tin khổng lồ trên Internet, bao gồm hàng triệu trang web liên kết chặt chẽ với nhau!",
    emotion: 'SPEAKING'
  },

  // 3. Internet Definition & Distinction
  {
    id: 'internet_definition',
    topic: 'internet',
    patterns: [
      /(internet là gì|mạng internet là gì|khái niệm internet|định nghĩa internet)/i,
      /(phân biệt internet và www|khác nhau giữa internet và|internet khác gì|internet có giống www)/i
    ],
    keywords: ['internet là gì', 'mạng internet', 'phân biệt internet', 'internet khác gì'],
    reply: "Các bạn lưu ý nhé: Internet là mạng máy tính toàn cầu (hạ tầng kết nối các máy tính), còn World Wide Web là một DỊCH VỤ thông tin hoạt động TRÊN Internet! Hai khái niệm này gắn bó nhưng không phải là một!",
    emotion: 'SPEAKING'
  },

  // 4. Hyperlink (Siêu liên kết) & Signs
  {
    id: 'hyperlink',
    topic: 'hyperlink',
    patterns: [
      /(siêu liên kết là gì|thế nào là siêu liên kết|định nghĩa siêu liên kết)/i,
      /(dấu hiệu nhận biết siêu liên kết|làm sao nhận biết được|nhận biết siêu liên kết bằng cách nào|biểu tượng bàn tay|hình bàn tay)/i
    ],
    keywords: ['siêu liên kết', 'hyperlink', 'hình bàn tay', 'con trỏ bàn tay', 'gạch chân', 'làm sao nhận biết'],
    reply: "Siêu liên kết (Hyperlink) là một đoạn văn bản hoặc hình ảnh trên trang web có gắn đường dẫn ngầm! Dấu hiệu nhận biết: chữ thường có màu xanh, gạch chân và khi rê chuột vào, con trỏ sẽ biến thành hình bàn tay!",
    emotion: 'SPEAKING'
  },

  // 5. Hypertext (Siêu văn bản)
  {
    id: 'hypertext',
    topic: 'hypertext',
    patterns: [
      /(siêu văn bản là gì|thế nào là siêu văn bản|định nghĩa siêu văn bản)/i,
      /(siêu văn bản khác gì văn bản thông thường)/i
    ],
    keywords: ['siêu văn bản', 'hypertext', 'văn bản tích hợp'],
    reply: "Siêu văn bản là loại văn bản đặc biệt, tích hợp nhiều dạng dữ liệu như chữ viết, hình ảnh, âm thanh, video và ĐẶC BIỆT là có chứa các siêu liên kết tới các tài liệu khác!",
    emotion: 'SPEAKING'
  },

  // 6. Website Definition
  {
    id: 'website',
    topic: 'website',
    patterns: [
      /(website là gì|thế nào là website|trang mạng là gì)/i,
      /(ví dụ về website|website gồm những gì)/i
    ],
    keywords: ['website là gì', 'trang mạng', 'tập hợp các trang web'],
    reply: "Website là một tập hợp gồm một hoặc nhiều trang web liên quan, được tổ chức dưới một địa chỉ truy cập chung, giống như một cuốn sách giáo khoa gồm nhiều trang bài học vậy!",
    emotion: 'SPEAKING'
  },

  // 7. Webpage (Trang web)
  {
    id: 'webpage',
    topic: 'webpage',
    patterns: [
      /(trang web là gì|webpage là gì|khái niệm trang web)/i,
      /(phân biệt website và trang web)/i
    ],
    keywords: ['trang web là gì', 'webpage', 'một trang trong website'],
    reply: "Trang web (Web page) là một trang tài liệu siêu văn bản cụ thể được lưu trữ trên website! Nếu website là một cuốn sách thì mỗi trang web chính là một trang trong cuốn sách đó!",
    emotion: 'SPEAKING'
  },

  // 8. Homepage (Trang chủ)
  {
    id: 'homepage',
    topic: 'homepage',
    patterns: [
      /(trang chủ là gì|homepage là gì|khái niệm trang chủ)/i,
      /(trang đầu tiên mở ra|trang chính của website)/i
    ],
    keywords: ['trang chủ', 'homepage', 'trang đầu tiên'],
    reply: "Trang chủ (Homepage) là trang web đầu tiên xuất hiện khi bạn mở địa chỉ của một website! Địa chỉ của trang chủ cũng chính là địa chỉ của website đó!",
    emotion: 'SPEAKING'
  },

  // 9. Web Browser (Trình duyệt web)
  {
    id: 'browser',
    topic: 'browser',
    patterns: [
      /(trình duyệt web là gì|trình duyệt là gì|browser là gì|kể tên các trình duyệt)/i,
      /(chrome|cốc cốc|microsoft edge|safari|firefox|dùng để làm gì)/i
    ],
    keywords: ['trình duyệt web', 'browser', 'chrome', 'cốc cốc', 'edge', 'safari'],
    reply: "Trình duyệt web là phần mềm ứng dụng giúp người dùng truy cập, hiển thị và tương tác với các trang web trên Internet! Các trình duyệt phổ biến gồm có Google Chrome, Cốc Cốc, Microsoft Edge và Mozilla Firefox!",
    emotion: 'SPEAKING'
  },

  // 10. Search Engine (Máy tìm kiếm)
  {
    id: 'search_engine',
    topic: 'search',
    patterns: [
      /(máy tìm kiếm là gì|công cụ tìm kiếm|tìm kiếm thông tin trên internet)/i
    ],
    keywords: ['máy tìm kiếm', 'công cụ tìm kiếm', 'tìm kiếm trên internet', 'google'],
    reply: "Máy tìm kiếm là một hệ thống phần mềm trực tuyến giúp người dùng tìm kiếm thông tin trên World Wide Web bằng cách nhập các từ khóa liên quan, phổ biến nhất là Google!",
    emotion: 'SPEAKING'
  }
];

// CONVERSATIONAL INTENTS
export const CONVERSATIONAL_INTENTS = [
  {
    id: 'greeting',
    patterns: [/^(xin chào|chào bạn|hello|hi|chào em|chào mark)/i],
    keywords: ['xin chào', 'chào bạn', 'hello', 'hi'],
    reply: "Xin chào bạn! Mình là Mark, rất vui được đồng hành cùng bạn khám phá Mạng thông tin toàn cầu!",
    emotion: 'GREETING'
  },
  {
    id: 'how_are_you',
    patterns: [/(bạn có khỏe không|khỏe không|bạn thế nào|hôm nay thế nào)/i],
    keywords: ['khỏe không', 'thế nào'],
    reply: "Mark luôn tràn đầy năng lượng và sẵn sàng giúp các bạn học sinh lớp 6 chinh phục bài học hôm nay!",
    emotion: 'HAPPY'
  },
  {
    id: 'who_are_you',
    patterns: [/(bạn là ai|tên bạn là gì|giới thiệu về mình)/i],
    keywords: ['bạn là ai', 'tên là gì'],
    reply: "Mình là Mark – trợ lý AI đồng hành học tập môn Tin học lớp 6 cùng thầy Trần Đức Tình và các bạn học sinh trường THCS Đắk Trôi!",
    emotion: 'HAPPY'
  }
];

export const TOPIC_IDENTIFIERS = [
  { id: 'www', words: ['www', 'world wide web', 'mạng thông tin toàn cầu', 'dịch vụ thông tin'] },
  { id: 'internet', words: ['internet', 'mạng máy tính', 'mạng toàn cầu', 'cáp quang', 'wifi', 'hạ tầng'] },
  { id: 'hyperlink', words: ['siêu liên kết', 'hyperlink', 'bàn tay', 'liên kết'] },
  { id: 'hypertext', words: ['siêu văn bản', 'hypertext'] },
  { id: 'website', words: ['website', 'trang mạng'] },
  { id: 'webpage', words: ['trang web', 'webpage'] },
  { id: 'homepage', words: ['trang chủ', 'homepage'] },
  { id: 'browser', words: ['trình duyệt', 'browser', 'chrome', 'cốc cốc', 'edge'] },
  { id: 'history', words: ['tim berners-lee', 'phát minh', '1989', 'lịch sử'] },
  { id: 'search', words: ['máy tìm kiếm', 'tìm kiếm', 'google'] }
];

export const CURRICULUM_INTENTS = [...KNOWLEDGE_INTENTS, ...CONVERSATIONAL_INTENTS];

/**
 * Super Socratic Pedagogical Curriculum Engine
 * Xử lý mọi tình huống đàm thoại sư phạm: câu trả lời ngắn (Có/Không/Không biết),
 * câu hỏi ngược, câu trả lời sai, câu trả lời dài, đổi chủ đề, nâng độ sâu, và chuyển giao bài học.
 */
export function matchCurriculumResponse(query, faqList = [], topicsList = [], context = {}) {
  if (!query || typeof query !== 'string') {
    return {
      text: "Xin chào các bạn! Mình là Mark. Các bạn có thường sử dụng Google để tìm kiếm thông tin không?",
      emotion: "GREETING",
      topic: 'www',
      source: "curriculum-default"
    };
  }

  // Chuẩn hóa chuỗi truy vấn: loại bỏ dấu câu thừa ở đầu/cuối (!, ., ?, ...)
  const rawClean = query.toLowerCase().trim();
  const clean = rawClean.replace(/^[!.,?\s]+|[!.,?\s]+$/g, '').trim();
  const activeTopic = context.activeTopic || context.current_topic || 'www';
  const firstTopic = context.firstTopic || context.first_topic || 'www';
  const studentName = context.studentName || context.student_name || null;
  const namePrefix = studentName ? `Bạn ${studentName} ơi! ` : '';
  const stage = context.conversationStage || context.conversation_stage || 'STAGE_1_HOOK';
  const lastAiQuestion = (context.lastAiQuestion || context.last_ai_question || '').toLowerCase();
  const consecutiveCorrect = context.consecutiveCorrect || context.consecutive_correct || 0;

  // =============================================================
  // TÌNH HUỐNG 5: HỌC SINH HỎI NGƯỢC LẠI AI (STUDENT ASK BACK)
  // =============================================================
  if (/(thế còn mark|còn mark thì sao|mark có biết không|mark biết không|tại sao hả mark|tại sao lại thế hả mark|mark trả lời đi|thế mark bảo xem|còn mark)/i.test(clean)) {
    if (stage === 'STAGE_2_EXPLORE' || lastAiQuestion.includes('ở mỹ') || lastAiQuestion.includes('việt nam')) {
      return {
        text: "Mark biết chứ! Đó là nhờ hệ thống mạng Internet toàn cầu kết nối các máy tính xuyên lục địa đấy! Nhưng đố các bạn biết: Internet có phải chỉ đơn giản là một chiếc dây cáp kết nối các máy tính lại với nhau không nhỉ?",
        emotion: 'THINKING',
        topic: 'internet',
        stage: 'STAGE_3_COGNITIVE_CONFLICT',
        question: 'Internet có phải chỉ đơn giản là một chiếc dây cáp kết nối các máy tính lại với nhau không nhỉ?',
        source: 'socratic-ask-back-explore'
      };
    }
    return {
      text: "Mark biết chứ! Đó là nhờ một dịch vụ thông tin kỳ diệu hoạt động trên Internet. Đố các bạn biết dịch vụ đó viết tắt bằng 3 chữ cái nào mà chúng mình thường thấy ở đầu địa chỉ trang web nhỉ?",
      emotion: 'HAPPY',
      topic: 'www',
      stage: 'STAGE_4_DISCOVERY',
      question: 'Dịch vụ đó viết tắt bằng 3 chữ cái nào mà chúng mình thường thấy ở đầu địa chỉ web nhỉ?',
      source: 'socratic-ask-back-general'
    };
  }

  // =============================================================
  // TÌNH HUỐNG 8: HỌC SINH ĐỔI CHỦ ĐỀ / NÓI LẠC ĐỀ (TOPIC SWITCH)
  // =============================================================
  if (/(chơi game|roblox|liên quân|free fire|mấy tuổi|ở đâu|thời tiết|ăn cơm chưa|người yêu|bạn gái|facebook của mark)/i.test(clean)) {
    return {
      text: "Haha, câu hỏi ngoài lề rất ngộ nghĩnh và đáng yêu! Nhưng hôm nay Mark và các bạn đang có một nhiệm vụ khám phá Mạng thông tin toàn cầu hấp dẫn hơn nhiều. Chúng mình cùng giải đáp câu hỏi lúc nãy nhé: Các bạn có nghĩ Internet chỉ đơn giản là sợi dây cáp kết nối máy tính không?",
      emotion: 'HAPPY',
      topic: 'internet',
      stage: 'STAGE_3_COGNITIVE_CONFLICT',
      question: 'Các bạn có nghĩ Internet chỉ đơn giản là sợi dây cáp kết nối máy tính không?',
      source: 'socratic-topic-switch'
    };
  }

  // =============================================================
  // TÌNH HUỐNG 7: HỘI THOẠI NHIỀU LƯỢT (NHỚ CÂU ĐẦU TIÊN / THAM CHIẾU ĐẦU TIÊN)
  // =============================================================
  if (clean.includes('câu đầu tiên') || clean.includes('cái đầu tiên') || clean.includes('điều đầu tiên') || clean.includes('lúc nãy mark hỏi gì') || clean.includes('chủ đề đầu')) {
    return {
      text: `${namePrefix}Lúc nãy Mark đã hỏi các bạn về thói quen sử dụng công cụ tìm kiếm Google để tìm kiếm thông tin, xem video hoặc tìm hình ảnh đấy! Nhờ câu hỏi đó mà chúng mình đã cùng nhau bước vào hành trình khám phá thế giới Mạng thông tin toàn cầu hôm nay.`,
      emotion: 'HAPPY',
      topic: 'www',
      source: 'socratic-memory-first-question'
    };
  }

  // =============================================================
  // TÌNH HUỐNG 6: HỌC SINH TRẢ LỜI DÀI / PHÂN TÍCH SÂU (> 11 TỪ)
  // =============================================================
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 12 && !clean.endsWith('?')) {
    if (clean.includes('mỹ') || clean.includes('vệ tinh') || clean.includes('cáp quang') || clean.includes('máy chủ') || clean.includes('truyền dữ liệu')) {
      return {
        text: "Một câu trả lời vô cùng sâu sắc và chuẩn xác của một chuyên gia công nghệ tương lai! Đúng vậy, nhờ hạ tầng mạng toàn cầu kết nối các máy chủ mà dữ liệu được truyền đi khắp năm châu. Vậy các bạn có biết hệ thống hàng triệu trang web giúp chúng ta xem được nội dung đó tên là gì không?",
        emotion: 'HAPPY',
        topic: 'www',
        stage: 'STAGE_4_DISCOVERY',
        question: 'Các bạn có biết hệ thống hàng triệu trang web giúp chúng ta xem được nội dung đó tên là gì không?',
        source: 'socratic-long-answer-elaborate'
      };
    }
  }

  // =============================================================
  // TÌNH HUỐNG 3: HỌC SINH TRẢ LỜI "EM KHÔNG BIẾT" (ANSWER_DONT_KNOW)
  // =============================================================
  if (/^(em không biết|mình không biết|không biết ạ|em chưa biết|chưa biết ạ|khó quá|em chịu|chưa nghĩ ra|chịu thôi|không biết)/i.test(clean)) {
    if (stage === 'STAGE_2_EXPLORE' || lastAiQuestion.includes('ở mỹ') || lastAiQuestion.includes('điện thoại')) {
      return {
        text: "Đừng lo nhé, để Mark gợi ý một chút nè: Để chiếc điện thoại của chúng mình có thể nhận được dữ liệu từ khoảng cách nửa vòng Trái Đất như vậy, máy của chúng mình cần được kết nối vào mạng gì mà chúng mình hay bật Wifi hoặc 4G nhỉ?",
        emotion: 'ENCOURAGING',
        topic: 'internet',
        stage: 'STAGE_2_EXPLORE',
        question: 'Máy của chúng mình cần được kết nối vào mạng gì mà chúng mình hay bật Wifi hoặc 4G nhỉ?',
        source: 'socratic-dont-know-hint-internet'
      };
    }
    if (stage === 'STAGE_3_COGNITIVE_CONFLICT' || lastAiQuestion.includes('dây cáp')) {
      return {
        text: "Mark bật mí một chút nhé: Dây cáp chỉ giống như đường quốc lộ, còn để có hình ảnh, video và bài học thì chúng mình cần các trang web. Vậy theo bạn, mạng kết nối hàng triệu trang web đó tên là gì nào?",
        emotion: 'ENCOURAGING',
        topic: 'www',
        stage: 'STAGE_4_DISCOVERY',
        question: 'Vậy theo bạn, mạng kết nối hàng triệu trang web đó tên là gì nào?',
        source: 'socratic-dont-know-hint-www'
      };
    }
    return {
      text: "Không sao đâu bạn ơi! Chưa biết thì chúng mình cùng tìm hiểu nhé. Mark gợi ý nè: Khi bạn muốn tìm bài học trên máy tính, bạn thường mở phần mềm nào có biểu tượng chữ G nhiều màu hoặc hình quả địa cầu nhỉ?",
      emotion: 'ENCOURAGING',
      topic: 'www',
      stage: 'STAGE_1_HOOK',
      question: 'Khi bạn muốn tìm bài học trên máy tính, bạn thường mở phần mềm nào có biểu tượng chữ G nhiều màu nhỉ?',
      source: 'socratic-dont-know-general'
    };
  }

  // =============================================================
  // TÌNH HUỐNG 4: HỌC SINH TRẢ LỜI SAI (MISCONCEPTION / WRONG)
  // =============================================================
  if (clean.includes('chỉ là dây cáp') || clean.includes('chỉ là cái dây') || (lastAiQuestion.includes('dây cáp') && /^(có|có ạ|vâng|đúng rồi|phải ạ|đúng đấy)$/i.test(clean))) {
    return {
      text: "Ồ, bạn đang có một góc nhìn rất thú vị! Dây cáp đúng là hạ tầng giúp kết nối máy tính. Nhưng nếu chỉ có dây cáp mà không có các trang tài liệu, hình ảnh, video và dịch vụ thông tin thì chúng mình có xem phim hay đọc báo được không nhỉ?",
      emotion: 'ENCOURAGING',
      topic: 'www',
      stage: 'STAGE_3_COGNITIVE_CONFLICT',
      question: 'Nếu chỉ có dây cáp mà không có các trang tài liệu thì chúng mình có xem phim hay đọc báo được không nhỉ?',
      source: 'socratic-wrong-answer-guidance'
    };
  }

  // =============================================================
  // TÌNH HUỐNG 1: HỌC SINH TRẢ LỜI "CÓ" (ANSWER_YES)
  // =============================================================
  if (/^(có|có ạ|dạ có|dạ có ạ|vâng|vâng ạ|chắc chắn có|chuẩn rồi ạ|đúng ạ)$/i.test(clean)) {
    // 1. Trả lời Có cho câu hỏi Hook ban đầu (Google / tìm kiếm)
    if (stage === 'STAGE_1_HOOK' || lastAiQuestion.includes('google') || lastAiQuestion.includes('tìm kiếm')) {
      return {
        text: "Wow! Tuyệt vời! Vậy là các bạn đã sử dụng Internet khá thành thạo rồi đấy! Nhưng Mark đang có một thắc mắc muốn hỏi cả lớp: Các bạn có bao giờ tự hỏi vì sao một chiếc điện thoại ở Việt Nam lại có thể xem được một video vừa được đăng tải ở Mỹ hay không?",
        emotion: 'HAPPY',
        topic: 'internet',
        stage: 'STAGE_2_EXPLORE',
        question: 'Các bạn có bao giờ tự hỏi vì sao một chiếc điện thoại ở Việt Nam lại có thể xem được một video vừa được đăng tải ở Mỹ hay không?',
        source: 'socratic-yes-hook-to-explore'
      };
    }

    // 2. Trả lời Có cho câu hỏi khám phá hệ thống toàn cầu
    if (stage === 'STAGE_4_DISCOVERY' || stage === 'STAGE_5_LESSON_CONNECTION' || lastAiQuestion.includes('hệ thống kết nối') || lastAiQuestion.includes('rộng lớn')) {
      return {
        text: "Thật tuyệt vời! Qua những câu trả lời vừa rồi, chúng ta đã nhận ra rằng Internet không chỉ giúp tìm kiếm thông tin mà còn tạo nên một không gian kết nối và chia sẻ thông tin trên phạm vi toàn cầu. Vậy mạng thông tin toàn cầu là gì? Chúng ta sẽ cùng khám phá trong bài học hôm nay nhé! Bây giờ, Mark xin kính mời thầy giáo Trần Đức Tình sẽ cùng cả lớp bắt đầu bài học hôm nay!",
        emotion: 'HAPPY',
        topic: 'www',
        stage: 'STAGE_6_HANDOFF',
        source: 'socratic-yes-discovery-to-handoff'
      };
    }

    // Mặc định cho Có
    return {
      text: "Rất chuẩn xác! Đúng như vậy đấy các bạn. Chúng mình cùng tiếp tục khám phá điều kỳ diệu tiếp theo nhé!",
      emotion: 'HAPPY',
      topic: activeTopic || 'www',
      source: 'socratic-yes-default'
    };
  }

  // =============================================================
  // TÌNH HUỐNG 2: HỌC SINH TRẢ LỜI "KHÔNG" (ANSWER_NO)
  // =============================================================
  if (/^(không|không ạ|dạ không|dạ không ạ|chưa ạ|đâu có|không phải đâu ạ|không phải)$/i.test(clean)) {
    // 1. Trả lời Không cho câu hỏi dây cáp (Mâu thuẫn nhận thức thành công!)
    if (stage === 'STAGE_3_COGNITIVE_CONFLICT' || lastAiQuestion.includes('dây cáp')) {
      return {
        text: "Chính xác luôn! Internet không chỉ đơn thuần là những sợi dây cáp vật lý. Vậy theo các bạn, điều kỳ diệu gì giúp hàng tỷ thiết bị trên khắp thế giới có thể kết nối, trao đổi và chia sẻ hàng triệu trang web với nhau nhỉ?",
        emotion: 'HAPPY',
        topic: 'www',
        stage: 'STAGE_4_DISCOVERY',
        question: 'Điều kỳ diệu gì giúp hàng tỷ thiết bị trên khắp thế giới có thể kết nối, trao đổi và chia sẻ hàng triệu trang web với nhau nhỉ?',
        source: 'socratic-no-conflict-to-discovery'
      };
    }

    // 2. Trả lời Không cho câu hỏi ban đầu
    if (stage === 'STAGE_1_HOOK' || lastAiQuestion.includes('google')) {
      return {
        text: "Ồ không sao cả! Vậy chắc hẳn các bạn đã từng xem video trên YouTube hay nghe nhạc giải trí rồi đúng không nè? Các bạn có bao giờ tò mò vì sao chúng mình có thể xem được những nội dung từ khắp nơi trên thế giới như vậy không?",
        emotion: 'ENCOURAGING',
        topic: 'internet',
        stage: 'STAGE_2_EXPLORE',
        question: 'Các bạn có bao giờ tò mò vì sao chúng mình có thể xem được những nội dung từ khắp nơi trên thế giới như vậy không?',
        source: 'socratic-no-hook-to-explore'
      };
    }

    return {
      text: "Rất thẳng thắn và thú vị! Điều đó chứng tỏ bạn đang suy nghĩ rất độc lập. Vậy chúng mình cùng xem điều gì tiếp theo nhé!",
      emotion: 'ENCOURAGING',
      topic: activeTopic || 'www',
      source: 'socratic-no-default'
    };
  }

  // =============================================================
  // TÌNH HUỐNG 9: HỌC SINH TRẢ LỜI ĐÚNG LIÊN TỤC HOẶC KHÁI NIỆM "INTERNET" / "WWW"
  // =============================================================
  if (clean.includes('vì có internet') || clean.includes('nhờ internet') || clean.includes('do có internet') || clean === 'internet ạ' || clean === 'internet') {
    // Nếu học sinh trả lời đúng liên tục ngay từ đầu -> tăng độ sâu
    if (consecutiveCorrect >= 2) {
      return {
        text: "Xuất sắc! Các bạn nắm kiến thức rất chắc chắn. Vậy Mark nâng độ khó lên một chút nhé: World Wide Web và Internet có phải là một không, hay chúng có mối quan hệ như thế nào với nhau?",
        emotion: 'HAPPY',
        topic: 'internet',
        stage: 'STAGE_3_COGNITIVE_CONFLICT',
        question: 'World Wide Web và Internet có phải là một không, hay chúng có mối quan hệ như thế nào với nhau?',
        source: 'socratic-consecutive-correct-deepen'
      };
    }

    return {
      text: "Chính xác! Đúng là nhờ có mạng Internet! Nhưng các bạn có nghĩ rằng Internet chỉ đơn giản là một chiếc dây cáp kết nối các máy tính lại với nhau không?",
      emotion: 'HAPPY',
      topic: 'internet',
      stage: 'STAGE_3_COGNITIVE_CONFLICT',
      question: 'Nhưng các bạn có nghĩ rằng Internet chỉ đơn giản là một chiếc dây cáp kết nối các máy tính lại với nhau không?',
      source: 'socratic-concept-internet'
    };
  }

  // =============================================================
  // TÌNH HUỐNG 10: HOÀN THÀNH MỞ ĐẦU (DISCOVERY HOẶC BẮT ĐẦU BÀI HỌC)
  // =============================================================
  if (clean.includes('mạng thông tin toàn cầu') && (stage === 'STAGE_4_DISCOVERY' || lastAiQuestion.includes('kết nối') || lastAiQuestion.includes('chia sẻ'))) {
    return {
      text: "Thật tuyệt vời! Qua những câu trả lời vừa rồi, chúng ta đã nhận ra rằng Internet không chỉ giúp tìm kiếm thông tin mà còn tạo nên một không gian kết nối và chia sẻ thông tin trên phạm vi toàn cầu. Vậy mạng thông tin toàn cầu là gì? Chúng ta sẽ cùng khám phá trong bài học hôm nay nhé! Bây giờ, Mark xin kính mời thầy giáo Trần Đức Tình sẽ cùng cả lớp bắt đầu bài học hôm nay!",
      emotion: 'HAPPY',
      topic: 'www',
      stage: 'STAGE_6_HANDOFF',
      source: 'socratic-discovery-complete-handoff'
    };
  }

  // =============================================================
  // CÁC NHU CẦU TIẾP NỐI THÔNG THƯỜNG (VÍ DỤ, RÚT GỌN, TÁC DỤNG...)
  // =============================================================

  // 1. Yêu cầu đưa ví dụ: "Cho mình một ví dụ nhé!", "Cho ví dụ đi", "Ví dụ là gì?"
  if (/(cho ví dụ|cho mình ví dụ|ví dụ nhé|lấy ví dụ|ví dụ cụ thể|ví dụ minh họa|cho em ví dụ)/i.test(clean)) {
    const targetTopic = activeTopic || 'www';
    const exampleText = TOPIC_EXAMPLES[targetTopic] || TOPIC_EXAMPLES.www;
    return {
      text: `${namePrefix}${exampleText}`,
      emotion: 'HAPPY',
      topic: targetTopic,
      source: `context-example-${targetTopic}`
    };
  }

  // 2. Câu hỏi tiếp nối về tác dụng / vai trò: "Thế nó có tác dụng gì?", "Nó dùng để làm gì?"
  if ((/(nó|cái đó|điều đó|cái này|điều này)/i.test(clean) || /^(thế|vậy|còn)?\s*(có tác dụng|dùng để|để làm gì)/i.test(clean)) && /(tác dụng|dùng để|để làm gì|ích lợi|công dụng|làm gì)/i.test(clean)) {
    const targetTopic = activeTopic || 'www';
    const benefitText = TOPIC_BENEFITS[targetTopic] || TOPIC_BENEFITS.www;
    return {
      text: `${namePrefix}${benefitText}`,
      emotion: 'SPEAKING',
      topic: targetTopic,
      source: `context-benefit-${targetTopic}`
    };
  }

  // 3. Yêu cầu giải thích lại / chưa hiểu: "Em chưa hiểu lắm", "Vẫn chưa hiểu"
  if (/(chưa hiểu lắm|chưa hiểu|vẫn chưa hiểu|khó hiểu quá|giải thích lại|nói dễ hiểu hơn)/i.test(clean)) {
    const targetTopic = activeTopic || 'www';
    const simplifiedText = TOPIC_SIMPLIFIED[targetTopic] || TOPIC_SIMPLIFIED.www;
    return {
      text: `${namePrefix}${simplifiedText}`,
      emotion: 'ENCOURAGING',
      topic: targetTopic,
      source: `context-pedagogical-simplify-${targetTopic}`
    };
  }

  // 4. Yêu cầu tóm tắt ngắn hơn: "Nói ngắn hơn đi", "Tóm tắt lại", "Nói ngắn thôi"
  if (/(nói ngắn hơn|ngắn hơn đi|tóm tắt lại|ngắn gọn thôi|rút gọn lại)/i.test(clean)) {
    const targetTopic = activeTopic || 'www';
    const summaryText = TOPIC_SUMMARIES[targetTopic] || TOPIC_SUMMARIES.www;
    return {
      text: `${namePrefix}${summaryText}`,
      emotion: 'HAPPY',
      topic: targetTopic,
      source: `context-shorten-${targetTopic}`
    };
  }

  // 5. Đại từ đơn độc thiếu ngữ cảnh (VD: Người dùng mở đầu cuộc trò chuyện bằng "Nó có tốt không?")
  if (/^(nó|cái đó|điều đó)\s+(có tốt không|sao|thế nào|là gì)/i.test(clean) && !context.activeTopic) {
    return {
      text: "Bạn đang muốn hỏi Mark về Mạng thông tin toàn cầu, website hay một chủ đề nào khác vậy nè?",
      emotion: 'ENCOURAGING',
      topic: null,
      source: 'context-clarification-needed'
    };
  }

  // =============================================================
  // GIAI ĐOẠN ĐỐI SÁNH KNOWLEDGE INTENTS (BÀI 6 TIN HỌC 6)
  // =============================================================
  for (const intent of KNOWLEDGE_INTENTS) {
    if (intent.patterns && intent.patterns.some((r) => r.test(clean))) {
      return {
        text: intent.reply,
        emotion: intent.emotion || 'SPEAKING',
        topic: intent.topic,
        source: `curriculum-intent-${intent.id}`
      };
    }
    if (intent.keywords && intent.keywords.some((k) => clean.includes(k))) {
      return {
        text: intent.reply,
        emotion: intent.emotion || 'SPEAKING',
        topic: intent.topic,
        source: `curriculum-keyword-${intent.id}`
      };
    }
  }

  // =============================================================
  // GIAI ĐOẠN ĐỐI SÁNH FAQ VÀ GIAO TIẾP
  // =============================================================
  if (Array.isArray(faqList)) {
    for (const item of faqList) {
      const qWords = item.question.toLowerCase().replace(/[?.,]/g, '').split(' ');
      const matchCount = qWords.filter((w) => w.length > 2 && clean.includes(w)).length;
      if (matchCount >= 2 || clean.includes(item.question.toLowerCase().slice(0, 15))) {
        return {
          text: `${item.answer} ${item.followup}`,
          emotion: "SPEAKING",
          topic: activeTopic || 'www',
          source: "knowledge-faq"
        };
      }
    }
  }

  for (const intent of CONVERSATIONAL_INTENTS) {
    if (intent.patterns && intent.patterns.some((r) => r.test(clean))) {
      return {
        text: intent.reply,
        emotion: intent.emotion || 'SPEAKING',
        topic: activeTopic,
        source: `curriculum-intent-${intent.id}`
      };
    }
    if (intent.keywords && intent.keywords.some((k) => clean.includes(k))) {
      return {
        text: intent.reply,
        emotion: intent.emotion || 'SPEAKING',
        topic: activeTopic,
        source: `curriculum-keyword-${intent.id}`
      };
    }
  }

  // =============================================================
  // FALLBACK DẪN DẮT SƯ PHẠM MỞ
  // =============================================================
  return {
    text: `Đó là một câu hỏi rất sáng tạo của bạn! Trong Bài 6 Mạng thông tin toàn cầu, bạn có muốn cùng Mark tìm hiểu tiếp về các trang web, siêu liên kết hay trình duyệt web không?`,
    emotion: "HAPPY",
    topic: activeTopic || 'www',
    source: "open-pedagogical-fallback"
  };
}
