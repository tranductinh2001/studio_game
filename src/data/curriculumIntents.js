// Curriculum Knowledge Intents & Smart Natural Language Matching Engine
// Môn Tin học 6 - Bài 6: Mạng thông tin toàn cầu (SGK Kết nối tri thức với cuộc sống & CV 5512)
// Nâng cấp: Tích hợp Conversation Memory, tham chiếu ngữ cảnh, câu hỏi nối tiếp và nhân vật Trợ lý Mark

// KHO VÍ DỤ THỰC TẾ GẦN GŨI CHO TỪNG CHỦ ĐỀ BÀI 6 (Dành cho học sinh lớp 6)
export const TOPIC_EXAMPLES = {
  www: "Ví dụ nhé! Khi bạn sử dụng Google để tìm kiếm một bài học hoặc xem video học tập trên YouTube, bạn đang sử dụng Internet và World Wide Web đấy!",
  internet: "Ví dụ nhé! Khi bạn sử dụng điện thoại gọi video cho người thân ở xa, hoặc xem bài giảng trực tuyến trên YouTube, dữ liệu đó truyền qua mạng Internet kết nối toàn cầu!",
  hyperlink: "Ví dụ nhé! Khi bạn đọc một bài viết về 'Thành phố Pleiku', bạn thấy chữ 'Biển Hồ' có màu xanh và gạch chân. Khi bạn nhấp chuột vào đó, nó sẽ mở ra một trang mới giới thiệu về Biển Hồ – đó chính là một siêu liên kết!",
  hypertext: "Ví dụ nhé! Trang báo điện tử Dân Trí có cả chữ viết, ảnh phóng sự, clip video bàn thắng bóng đá và các đường dẫn sang bài viết khác – đó chính là một trang siêu văn bản!",
  website: "Ví dụ nhé! Website của Trường THCS Đắk Trôi (thcsdaktroi.edu.vn) giống như một cuốn sách lớn, trong đó có trang giới thiệu trường, trang thời khóa biểu và trang tin tức!",
  webpage: "Ví dụ nhé! Trong website trường mình, trang 'Thời khóa biểu lớp 6' chính là một trang web riêng lẻ đấy!",
  homepage: "Ví dụ nhé! Khi bạn gõ dantri.com.vn, trang đầu tiên mở ra với các tin tức nổi bật và thanh menu chính là Trang chủ!",
  browser: "Ví dụ nhé! Biểu tượng hình tròn 4 màu Google Chrome hoặc chữ 'e' màu xanh Microsoft Edge trên máy tính chính là các trình duyệt web!",
  history: "Ví dụ nhé! Vào năm 1989, giáo sư Tim Berners-Lee muốn các nhà khoa học khắp thế giới dễ dàng chia sẻ tài liệu nghiên cứu với nhau, nên ông đã sáng tạo ra World Wide Web!",
  search: "Ví dụ nhé! Khi bạn gõ từ khóa 'thời tiết Gia Lai hôm nay' vào ô tìm kiếm của Google và nhấn Enter, Google chính là một máy tìm kiếm thông tin!"
};

// KHO GIẢI THÍCH TÁC DỤNG CHO TỪNG CHỦ ĐỀ KHI HỌC SINH HỎI "THẾ NÓ CÓ TÁC DỤNG GÌ?"
export const TOPIC_BENEFITS = {
  www: "Như mình vừa giải thích, Mạng thông tin toàn cầu (WWW) giúp chúng ta tìm kiếm thông tin, xem các bài học trực tuyến, đọc báo, xem video và chia sẻ tài liệu với mọi người trên toàn thế giới một cách nhanh chóng!",
  internet: "Internet là hạ tầng mạng kết nối các máy tính toàn cầu, giúp truyền tải dữ liệu, gửi thư điện tử, gọi video và kết nối mọi người khắp năm châu!",
  hyperlink: "Siêu liên kết có tác dụng như chiếc cầu nối thần kỳ, giúp bạn chỉ cần nhấp một cú chuột là chuyển ngay sang trang web mới mà không phải gõ lại địa chỉ dài dòng!",
  hypertext: "Siêu văn bản giúp thông tin trở nên vô cùng sống động và trực quan, kết hợp hài hòa chữ viết, hình ảnh, âm thanh và video trong cùng một trang tài liệu!",
  website: "Website dùng để tập hợp toàn bộ thông tin của một trường học, tổ chức hay công ty dưới một địa chỉ duy nhất để mọi người dễ dàng tra cứu mọi lúc mọi nơi!",
  webpage: "Trang web giúp trình bày một nội dung cụ thể trong website, ví dụ như một bài báo, một thông báo điểm thi hay một bài học trực tuyến!",
  homepage: "Trang chủ có tác dụng như mục lục của cuốn sách, giúp người xem có cái nhìn tổng quan và dễ dàng điều hướng đến các nội dung quan trọng khác trong website!",
  browser: "Trình duyệt có tác dụng dịch mã nguồn trang web thành chữ viết, hình ảnh, âm thanh sống động để con người có thể nhìn và tương tác trực tiếp!",
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
  www: "Không sao đâu! Mình thử giải thích bằng một ví dụ gần gũi nhé: Bạn hãy tưởng tượng Internet như một hệ thống đường quốc lộ, còn World Wide Web chính là các siêu thị, thư viện và rạp chiếu phim được xây dựng dọc hai bên đường để chúng ta vào học và giải trí!",
  internet: "Không sao đâu! Bạn cứ tưởng tượng Internet giống như mạng lưới bưu điện và đường giao thông kết nối các thành phố trên toàn thế giới lại với nhau vậy!",
  hyperlink: "Đơn giản lắm nhé! Bạn có bao giờ chơi trò mở cánh cửa thần kỳ chưa? Siêu liên kết chính là một cánh cửa thần kỳ trên màn hình máy tính: bạn nhấp chuột một cái là bước ngay sang một căn phòng mới!",
  website: "Bạn hãy hình dung Website giống như một cuốn sách giáo khoa Tin học 6, còn mỗi Trang web chính là từng trang sách cụ thể từ trang 1 đến trang 50!",
  browser: "Bạn hãy tưởng tượng Trình duyệt web giống như một chiếc kính thần kỳ: nhờ có chiếc kính này (Chrome hay Cốc Cốc) mà mắt chúng ta mới nhìn thấy và đọc được nội dung trên mạng!",
  homepage: "Trang chủ giống như chiếc cổng trường hoặc trang bìa của một cuốn truyện: vừa bước tới là bạn nhìn thấy nó đầu tiên!"
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

  // 4. Hyperlink (Siêu liên kết) & Signs (Dấu hiệu nhận biết)
  {
    id: 'hyperlink',
    topic: 'hyperlink',
    patterns: [
      /(siêu liên kết là gì|thế nào là siêu liên kết|hyperlink|dấu hiệu nhận biết siêu liên kết|hình bàn tay|con trỏ chuột biến thành|gạch chân)/i
    ],
    keywords: ['siêu liên kết', 'hyperlink', 'bàn tay', 'dấu hiệu nhận biết', 'con trỏ', 'gạch chân'],
    reply: "Siêu liên kết (Hyperlink) là đoạn văn bản hoặc hình ảnh mà khi nhấn chuột vào sẽ đưa chúng ta đến một trang web khác! Dấu hiệu nhận biết là chữ thường đổi màu, có gạch chân và con trỏ chuột biến thành hình bàn tay chỉ ngón!",
    emotion: 'HAPPY'
  },

  // 5. Hypertext (Siêu văn bản)
  {
    id: 'hypertext',
    topic: 'hypertext',
    patterns: [
      /(siêu văn bản là gì|thế nào là siêu văn bản|hypertext|khác văn bản thường)/i
    ],
    keywords: ['siêu văn bản', 'hypertext', 'văn bản tích hợp'],
    reply: "Siêu văn bản (Hypertext) là loại văn bản đặc biệt tích hợp chữ viết, hình ảnh sống động, âm thanh, video clip và chứa các siêu liên kết để dẫn sang các trang web khác!",
    emotion: 'SPEAKING'
  },

  // 6. How information is organized on Internet
  {
    id: 'info_organization',
    topic: 'www',
    patterns: [
      /(thông tin trên internet được tổ chức|tổ chức thông tin như thế nào|tổ chức như thế nào|dưới dạng gì)/i
    ],
    keywords: ['tổ chức thông tin', 'tổ chức như thế nào', 'dưới dạng'],
    reply: "Thông tin trên Internet được tổ chức dưới dạng siêu văn bản và được kết nối với nhau bằng các siêu liên kết, tạo thành một mạng lưới thông tin toàn cầu khổng lồ!",
    emotion: 'SPEAKING'
  },

  // 7. Website vs Webpage (Website và Trang web)
  {
    id: 'website_vs_webpage',
    topic: 'website',
    patterns: [
      /(website là gì|thế nào là website|trang web là gì|phân biệt website và trang web|khác nhau giữa website và trang web|tập hợp các trang web)/i
    ],
    keywords: ['website là gì', 'trang web là gì', 'phân biệt website', 'cuốn sách', 'khác nhau giữa website'],
    reply: "Các bạn hãy nhớ hình ảnh này: Website giống như một cuốn sách hoàn chỉnh, còn Trang web (Web page) chính là từng trang riêng lẻ trong cuốn sách đó! Một website gồm nhiều trang web liên quan được lưu dưới một địa chỉ chung!",
    emotion: 'SPEAKING'
  },

  // 8. Homepage (Trang chủ)
  {
    id: 'homepage',
    topic: 'homepage',
    patterns: [
      /(trang chủ là gì|thế nào là trang chủ|homepage|trang mở ra đầu tiên|trang đầu tiên)/i
    ],
    keywords: ['trang chủ', 'homepage', 'trang đầu tiên', 'trang mở ra'],
    reply: "Trang chủ (Homepage) chính là trang web đầu tiên xuất hiện khi các bạn truy cập vào một địa chỉ website!",
    emotion: 'SPEAKING'
  },

  // 9. Website Address (URL / Địa chỉ website)
  {
    id: 'website_address',
    topic: 'website',
    patterns: [
      /(địa chỉ website|địa chỉ web là gì|url là gì|cho ví dụ địa chỉ web|thcsdaktroi\.edu\.vn|dantri\.com\.vn)/i
    ],
    keywords: ['địa chỉ website', 'địa chỉ web', 'url', 'ví dụ địa chỉ'],
    reply: "Mỗi website trên Internet đều có một địa chỉ truy cập duy nhất, ví dụ: thcsdaktroi.edu.vn hoặc dantri.com.vn. Nhập đúng địa chỉ này vào thanh địa chỉ là chúng ta vào thẳng website!",
    emotion: 'SPEAKING'
  },

  // 10. Popular Browsers (Các trình duyệt phổ biến)
  {
    id: 'popular_browsers',
    topic: 'browser',
    patterns: [
      /(kể tên trình duyệt|các trình duyệt phổ biến|trình duyệt nào|chrome|google chrome|edge|microsoft edge|cốc cốc|firefox|safari|opera)/i
    ],
    keywords: ['kể tên trình duyệt', 'các trình duyệt', 'chrome', 'cốc cốc', 'edge', 'firefox', 'safari'],
    reply: "Một số trình duyệt web rất quen thuộc và phổ biến hiện nay gồm có: Google Chrome, Microsoft Edge, Cốc Cốc, Mozilla Firefox và Safari của Apple!",
    emotion: 'HAPPY'
  },

  // 11. Web Browser (Trình duyệt web)
  {
    id: 'web_browser',
    topic: 'browser',
    patterns: [
      /(trình duyệt là gì|trình duyệt web là gì|browser là gì|công dụng của trình duyệt|dùng để làm gì)/i
    ],
    keywords: ['trình duyệt là gì', 'trình duyệt web', 'browser', 'phần mềm', 'công dụng'],
    reply: "Trình duyệt web là phần mềm ứng dụng giúp người dùng truy cập, hiển thị và tương tác với các trang web trên Mạng thông tin toàn cầu!",
    emotion: 'SPEAKING'
  },

  // 12. 3 Steps to Access a Webpage (Quy trình 3 bước)
  {
    id: 'access_steps',
    topic: 'browser',
    patterns: [
      /(các bước truy cập|làm sao để truy cập|quy trình truy cập|3 bước|bước 1.*bước 2|cách mở trang web)/i
    ],
    keywords: ['các bước truy cập', '3 bước', 'bước 1', 'thanh địa chỉ', 'nhập địa chỉ'],
    reply: "Để truy cập một trang web, chúng ta thực hiện 3 bước: Bước 1: Khởi động trình duyệt web; Bước 2: Nhập địa chỉ website vào thanh địa chỉ; Bước 3: Nhấn phím Enter để mở trang web!",
    emotion: 'SPEAKING'
  },

  // 13. Search Engine (Máy tìm kiếm)
  {
    id: 'search_engine',
    topic: 'search',
    patterns: [
      /(máy tìm kiếm|công cụ tìm kiếm|tìm kiếm thông tin|google có phải|search engine)/i
    ],
    keywords: ['máy tìm kiếm', 'công cụ tìm kiếm', 'tìm kiếm thông tin', 'google'],
    reply: "Máy tìm kiếm là một trang web đặc biệt giúp người sử dụng tìm kiếm thông tin trên Internet dựa trên các từ khóa, ví dụ nổi tiếng nhất chính là Google!",
    emotion: 'SPEAKING'
  }
];

// CONVERSATIONAL INTENTS (Tương tác tự nhiên mang tên Mark)
export const CONVERSATIONAL_INTENTS = [
  // 1. Identity & Introduction
  {
    id: 'identity',
    patterns: [
      /(bạn|cậu|mark|em|cháu) là ai/i,
      /tên (bạn|cậu|em|cháu) là gì/i,
      /ai (tạo|sinh|lập trình) ra (bạn|mark|cậu)/i,
      /giới thiệu về (bạn|bản thân|mark)/i,
      /bạn từ đâu (đến|tới)/i,
      /mấy tuổi/i
    ],
    keywords: ['mark là ai', 'bạn là ai', 'tên là gì', 'ai tạo ra bạn', 'giới thiệu bản thân'],
    reply: "Mình là Mark, trợ lý AI học tập thông minh! Mình rất vui được đồng hành cùng các bạn học sinh lớp 6 Trường THCS Đắk Trôi khám phá Internet và các trang web kỳ thú!",
    emotion: 'HAPPY'
  },

  // 2. Greetings
  {
    id: 'greeting',
    patterns: [
      /(xin chào|chào bạn|chào mark|mark ơi|ê mark|chào em|chào cháu|chào lớp|chào cả lớp|hello|hé lô|hi\b)/i,
      /chúc.*(buổi sáng|buổi chiều|ngày mới|tốt lành)/i,
      /lớp 6.*chào/i
    ],
    keywords: ['xin chào', 'chào bạn', 'chào mark', 'hello', 'hi', 'mark ơi'],
    reply: "Xin chào! Mình là Mark. Hôm nay mình sẽ cùng bạn học tập nhé!",
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

  // 4. Farewell (Tạm biệt)
  {
    id: 'goodbye',
    patterns: [
      /(tạm biệt|bye bye|hẹn gặp lại|chào tạm biệt|thôi nghỉ|hết rồi)/i
    ],
    keywords: ['tạm biệt', 'bye bye', 'hẹn gặp lại'],
    reply: "Tạm biệt các bạn học sinh lớp 6 siêu thông minh của Trường THCS Đắk Trôi! Chúc các bạn luôn lướt web an toàn, học thật giỏi và yêu thích môn Tin học nhé!",
    emotion: 'GOODBYE'
  }
];

export const CURRICULUM_INTENTS = [...KNOWLEDGE_INTENTS, ...CONVERSATIONAL_INTENTS];

/**
 * Hàm đối sánh tri thức chương trình học có nhận diện ngữ cảnh (Context-Aware Curriculum Matching)
 * @param {string} query - Câu nói/câu hỏi hiện tại của học sinh
 * @param {Array} faqList - Danh mục câu hỏi thường gặp
 * @param {Array} topicsList - Danh mục chủ đề
 * @param {Object} context - Ngữ cảnh hội thoại: { activeTopic, firstTopic, studentName, lastAssistantReply, history }
 */
export function matchCurriculumResponse(query, faqList = [], topicsList = [], context = {}) {
  if (!query || typeof query !== 'string') {
    return {
      text: "Xin chào bạn! Mình là Mark. Bạn có thắc mắc gì về Mạng thông tin toàn cầu không nào?",
      emotion: "GREETING",
      topic: 'www',
      source: "curriculum-default"
    };
  }

  const clean = query.toLowerCase().trim();
  const activeTopic = context.activeTopic || null;
  const firstTopic = context.firstTopic || 'www';
  const studentName = context.studentName || null;
  const namePrefix = studentName ? `Bạn ${studentName} ơi! ` : '';

  // -------------------------------------------------------------
  // GIAI ĐOẠN 0: XỬ LÝ CÁC CÂU HỎI THAM CHIẾU & TIẾP NỐI NGỮ CẢNH
  // -------------------------------------------------------------

  // 1. Tham chiếu "Cái đầu tiên là gì nhỉ?"
  if (clean.includes('cái đầu tiên') || clean.includes('điều đầu tiên') || clean.includes('ý đầu tiên') || clean.includes('chủ đề đầu')) {
    const topicLabel = firstTopic === 'www' ? 'Mạng thông tin toàn cầu (WWW)' : (firstTopic === 'internet' ? 'Mạng máy tính Internet' : firstTopic);
    return {
      text: `${namePrefix}Bạn đang hỏi về khái niệm ${topicLabel} mà chúng ta vừa trao đổi lúc đầu phải không? Đó là dịch vụ thông tin khổng lồ trên Internet kết nối hàng triệu website với nhau đấy!`,
      emotion: 'HAPPY',
      topic: firstTopic,
      source: 'context-reference-first-topic'
    };
  }

  // 2. Yêu cầu đưa ví dụ: "Cho mình một ví dụ nhé!", "Cho ví dụ đi", "Ví dụ là gì?"
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

  // 3. Câu hỏi tiếp nối về tác dụng / vai trò: "Thế nó có tác dụng gì?", "Nó dùng để làm gì?", "Thế có tác dụng gì?"
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

  // 4. Yêu cầu giải thích lại / chưa hiểu: "Em chưa hiểu lắm", "Vẫn chưa hiểu", "Nói dễ hiểu hơn đi"
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

  // 5. Yêu cầu tóm tắt ngắn hơn: "Nói ngắn hơn đi", "Tóm tắt lại", "Nói ngắn thôi"
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

  // 6. Đại từ đơn độc thiếu ngữ cảnh (VD: Người dùng mở đầu cuộc trò chuyện bằng "Nó có tốt không?")
  if (/^(nó|cái đó|điều đó)\s+(có tốt không|sao|thế nào|là gì)/i.test(clean) && !activeTopic) {
    return {
      text: "Bạn đang hỏi về Internet, Mạng thông tin toàn cầu hay một ứng dụng nào khác vậy nè?",
      emotion: 'ENCOURAGING',
      topic: null,
      source: 'context-clarification-needed'
    };
  }

  // -------------------------------------------------------------
  // GIAI ĐOẠN 1: ĐỐI SÁNH CÁC CHỦ ĐỀ TRI THỨC BÀI 6 (KNOWLEDGE INTENTS)
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // GIAI ĐOẠN 2: ĐỐI SÁNH DANH MỤC FAQ PHỤ TRỢ
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // GIAI ĐOẠN 3: ĐỐI SÁNH Ý ĐỊNH GIAO TIẾP (CONVERSATIONAL INTENTS)
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // GIAI ĐOẠN 4: DẪN DẮT SƯ PHẠM MỞ (OPEN PEDAGOGICAL GUIDANCE)
  // -------------------------------------------------------------
  return {
    text: `Đó là một câu hỏi rất sáng tạo của bạn! Trong Bài 6 Mạng thông tin toàn cầu, bạn có muốn cùng Mark tìm hiểu tiếp về các trang web, siêu liên kết hay trình duyệt web không?`,
    emotion: "HAPPY",
    topic: activeTopic || 'www',
    source: "open-pedagogical-fallback"
  };
}
