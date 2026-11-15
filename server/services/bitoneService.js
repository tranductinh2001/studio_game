// BitOne AI Service Adapter
// Interacts with Beeknoee/BitOne Chat Completions API with fallback to Gemini or local curriculum engine
import dotenv from 'dotenv';
dotenv.config();

const BITONE_API_KEY = process.env.BITONE_API_KEY || process.env.BEE_API_KEY || '';
const BITONE_BASE_URL = process.env.BITONE_BASE_URL || process.env.BEE_BASE_URL || 'https://platform.beeknoee.com/api/v1';
const BITONE_MODEL = process.env.BITONE_MODEL || process.env.AI_MODEL || 'gemini-3.1-flash-lite';

export async function callBitOneAI(systemPrompt, userPrompt, temperature = 0.3) {
  if (!BITONE_API_KEY) {
    throw new Error('BITONE_API_KEY (or BEE_API_KEY) is not configured');
  }

  const response = await fetch(`${BITONE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BITONE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: BITONE_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: 4096,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`BitOne API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  return content;
}

// Generate Question Bank via BitOne AI with fallback
export async function generateQuestionsWithBitOne({
  subject = 'Tin học',
  grade = 6,
  lesson = 'Bài 6: Mạng thông tin toàn cầu',
  topics = 'Internet, World Wide Web (WWW), Website, Trang web, Siêu liên kết, Trình duyệt web',
  numQuestions = 5,
  difficultyDistribution = { recognition: 2, comprehension: 2, application: 1 }
}) {
  const systemPrompt = `Bạn là chuyên gia thẩm định đề thi và xây dựng câu hỏi trắc nghiệm Tin học THCS chuẩn Bộ GD&ĐT Việt Nam.
Nhiệm vụ: Tạo ngân hàng câu hỏi trắc nghiệm 4 lựa chọn (A, B, C, D) chính xác 100%, khoa học, rõ ràng.
Quy tắc:
1. Mỗi câu chỉ có DUY NHẤT một đáp án đúng. Các phương án nhiễu phải hợp lý và không gây tranh cãi.
2. Tuyệt đối phân biệt: Internet là mạng máy tính toàn cầu; WWW là dịch vụ thông tin chạy TRÊN Internet. Website gồm nhiều trang web; trang đầu là Trang chủ; Trình duyệt là phần mềm xem web.
3. Trả về DUY NHẤT một mảng JSON thuần túy (không kèm markdown ngoài mảng json) theo cấu trúc:
[
  {
    "question": "Nội dung câu hỏi?",
    "options": {
      "A": "Nội dung phương án A",
      "B": "Nội dung phương án B",
      "C": "Nội dung phương án C",
      "D": "Nội dung phương án D"
    },
    "correctAnswer": "A",
    "explanation": "Giải thích chi tiết vì sao đáp án này đúng.",
    "difficulty": "recognition", // 'recognition' | 'comprehension' | 'application'
    "topic": "World Wide Web",
    "learningObjective": "Mục tiêu cần đạt"
  }
]`;

  const userPrompt = `Môn học: ${subject}
Lớp: ${grade}
Bài học: ${lesson}
Chủ đề: ${topics}
Số lượng câu hỏi: ${numQuestions}
Phân bố mức độ: Nhận biết: ${difficultyDistribution.recognition || 2}, Thông hiểu: ${difficultyDistribution.comprehension || 2}, Vận dụng: ${difficultyDistribution.application || 1}.
Hãy tạo danh sách câu hỏi theo đúng định dạng JSON yêu cầu.`;

  try {
    const rawContent = await callBitOneAI(systemPrompt, userPrompt);
    // Parse json
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          source: 'bitone-ai',
          model: BITONE_MODEL,
          questions: parsed
        };
      }
    }
  } catch (err) {
    console.warn('BitOne AI call failed or key needs refill:', err.message);
  }

  // Smart Fallback Generator: High quality vetted questions for Grade 6 Lesson 6
  console.log('Using Smart Curriculum Question Generator fallback.');
  const allCurriculumQuestions = [
    {
      question: "Mạng thông tin toàn cầu (World Wide Web) là gì?",
      options: {
        A: "Là một mạng máy tính nối các máy tính trong một tòa nhà.",
        B: "Là một hệ thống thông tin khổng lồ liên kết các trang web trên Internet.",
        C: "Là một phần mềm trò chơi cài đặt trên máy tính cá nhân.",
        D: "Là chiếc dây cáp mạng dùng để kết nối mạng Internet."
      },
      correctAnswer: "B",
      explanation: "World Wide Web (WWW) là không gian thông tin toàn cầu liên kết hàng triệu trang web qua Internet.",
      difficulty: "recognition",
      topic: "World Wide Web",
      learningObjective: "Nhận biết khái niệm Mạng thông tin toàn cầu."
    },
    {
      question: "Khẳng định nào sau đây là ĐÚNG khi so sánh giữa Internet và World Wide Web?",
      options: {
        A: "Internet và World Wide Web là hai tên gọi khác nhau của cùng một phần mềm.",
        B: "Internet là dịch vụ chạy trên World Wide Web.",
        C: "Internet là hạ tầng mạng kết nối các máy tính; WWW là dịch vụ thông tin chạy trên Internet.",
        D: "World Wide Web xuất hiện trước khi Internet ra đời."
      },
      correctAnswer: "C",
      explanation: "Internet là mạng lưới máy tính toàn cầu, còn WWW là dịch vụ thông tin hoạt động trên nền tảng Internet.",
      difficulty: "comprehension",
      topic: "Internet vs WWW",
      learningObjective: "Phân biệt sự khác nhau giữa Internet và WWW."
    },
    {
      question: "Trang web đầu tiên được mở ra khi truy cập vào một website được gọi là gì?",
      options: {
        A: "Trang kết thúc",
        B: "Trang chủ (Homepage)",
        C: "Trang quảng cáo",
        D: "Trang liên kết"
      },
      correctAnswer: "B",
      explanation: "Trang đầu tiên người dùng nhìn thấy khi mở một website được gọi là Trang chủ (Homepage).",
      difficulty: "recognition",
      topic: "Website",
      learningObjective: "Nhận biết khái niệm Trang chủ."
    },
    {
      question: "Khi đưa con trỏ chuột vào một siêu liên kết trên trang web, con trỏ chuột thường chuyển sang hình dạng nào?",
      options: {
        A: "Hình mũi tên bốn chiều",
        B: "Hình bàn tay chỉ ngón trỏ",
        C: "Hình đồng hồ cát xoay tròn",
        D: "Hình dấu cộng chữ thập"
      },
      correctAnswer: "B",
      explanation: "Khi trỏ vào một siêu liên kết (hyperlink), con trỏ chuột thường đổi thành hình bàn tay để báo hiệu có thể nhấp chuột chuyển trang.",
      difficulty: "comprehension",
      topic: "Siêu liên kết",
      learningObjective: "Nhận diện đặc điểm của siêu liên kết."
    },
    {
      question: "Phần mềm nào sau đây KHÔNG PHẢI là trình duyệt web?",
      options: {
        A: "Google Chrome",
        B: "Microsoft Edge",
        C: "Microsoft Word",
        D: "Cốc Cốc"
      },
      correctAnswer: "C",
      explanation: "Microsoft Word là phần mềm soạn thảo văn bản, không phải là trình duyệt web.",
      difficulty: "application",
      topic: "Trình duyệt web",
      learningObjective: "Phân biệt được phần mềm trình duyệt web với các phần mềm ứng dụng khác."
    },
    {
      question: "Một website bao gồm những gì?",
      options: {
        A: "Chỉ gồm một tập tin văn bản thuần túy không có hình ảnh.",
        B: "Một tập hợp các trang web liên quan được lưu trữ dưới một địa chỉ chung.",
        C: "Tất cả các máy tính có trong phòng thực hành Tin học.",
        D: "Một modem kết nối đường truyền mạng."
      },
      correctAnswer: "B",
      explanation: "Website là tập hợp nhiều trang web liên quan được liên kết và quản lý dưới một địa chỉ truy cập.",
      difficulty: "recognition",
      topic: "Website",
      learningObjective: "Hiểu cấu trúc của một website."
    },
    {
      question: "Để truy cập vào trang báo điện tử Tuổi Trẻ (tuoitre.vn), em cần thực hiện thao tác nào?",
      options: {
        A: "Mở máy tính và đợi báo tự động phát trên màn hình.",
        B: "Mở trình duyệt web, gõ địa chỉ tuoitre.vn vào thanh địa chỉ rồi nhấn Enter.",
        C: "Cắm USB vào máy tính để sao chép bài báo.",
        D: "Tắt kết nối Internet của máy tính."
      },
      correctAnswer: "B",
      explanation: "Để truy cập một website, người dùng mở trình duyệt, nhập địa chỉ URL và nhấn Enter.",
      difficulty: "application",
      topic: "Truy cập thông tin",
      learningObjective: "Vận dụng kỹ năng truy cập website qua trình duyệt."
    }
  ];

  return {
    source: 'smart-curriculum-engine',
    model: 'curriculum-expert-v1',
    questions: allCurriculumQuestions.slice(0, Math.min(numQuestions, allCurriculumQuestions.length))
  };
}

// Analyze class assessment results via BitOne AI with fallback
export async function analyzeResultsWithBitOne(analyticsData) {
  const systemPrompt = `Bạn là cố vấn sư phạm Tin học thông minh của WEBBY CLASSROOM.
Nhiệm vụ: Phân tích số liệu kết quả đánh giá trắc nghiệm của cả lớp, đưa ra nhận xét sâu sắc, chỉ rõ phần kiến thức học sinh còn nhầm lẫn và gợi ý hành động củng cố cho giáo viên ngay trong tiết học.
Đầu ra JSON:
{
  "summary": "Nhận xét tổng quan ngắn gọn về mức độ hiểu bài của lớp.",
  "weakTopic": "Chủ đề hoặc khái niệm học sinh đang làm sai nhiều nhất.",
  "distractorAnalysis": "Phân tích phương án gây nhiễu khiến học sinh nhầm lẫn.",
  "actionAdvice": "Gợi ý 2-3 hoạt động cụ thể để giáo viên củng cố ngay trên lớp."
}`;

  const userPrompt = `Dữ liệu tiết học:
- Tổng số học sinh: ${analyticsData.totalStudents}
- Số học sinh tham gia trả lời: ${analyticsData.totalAnswered}
- Số học sinh trả lời đúng: ${analyticsData.totalCorrect}
- Tỷ lệ đúng trên số tham gia: ${analyticsData.percentageCorrectOnAnswered}%
- Tỷ lệ đúng trên tổng số lớp: ${analyticsData.percentageCorrectOnTotal}%
- Phân bố lựa chọn: A: ${analyticsData.choiceDistribution?.A || 0}, B: ${analyticsData.choiceDistribution?.B || 0}, C: ${analyticsData.choiceDistribution?.C || 0}, D: ${analyticsData.choiceDistribution?.D || 0}
- Câu hỏi hiện tại: "${analyticsData.questionText}"
- Đáp án đúng: ${analyticsData.correctAnswer}
Hãy phân tích và đưa ra giải pháp sư phạm phù hợp.`;

  try {
    const rawContent = await callBitOneAI(systemPrompt, userPrompt);
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn('BitOne AI analyze call failed:', err.message);
  }

  // Fallback pedagogic analytic insights based on real numbers
  const pct = analyticsData.percentageCorrectOnAnswered || 0;
  let summary = '';
  let advice = '';

  if (pct >= 80) {
    summary = `Xuất sắc! Đa số học sinh trong lớp (${pct}%) đã nắm rất vững kiến thức về nội dung này.`;
    advice = 'Giáo viên có thể biểu dương tinh thần học tập của lớp và chuyển nhanh sang câu hỏi nâng cao hoặc hoạt động thực hành tiếp theo.';
  } else if (pct >= 50) {
    summary = `Khá tốt! Khoảng ${pct}% học sinh đã chọn đúng đáp án, tuy nhiên vẫn còn một số em bị nhầm lẫn giữa các phương án tương đồng.`;
    advice = 'Giáo viên nên mời một học sinh trả lời đúng giải thích lý do, sau đó nhấn mạnh điểm khác biệt giữa các khái niệm để củng cố cho nhóm học sinh chọn chưa đúng.';
  } else {
    summary = `Cần lưu ý! Tỷ lệ trả lời đúng đạt ${pct}%, cho thấy phần lớn học sinh đang gặp khó khăn hoặc bị đánh lừa bởi phương án nhiễu.`;
    advice = 'Giáo viên nên tạm dừng, dùng ví dụ trực quan (như so sánh cuốn sách với từng trang sách) để giải thích lại trước khi sang câu hỏi mới.';
  }

  return {
    summary,
    weakTopic: analyticsData.topic || 'Khái niệm Mạng thông tin toàn cầu',
    distractorAnalysis: 'Các học sinh chọn sai chủ yếu do nhầm lẫn giữa hạ tầng kết nối (Internet) và dịch vụ nội dung (World Wide Web).',
    actionAdvice: advice
  };
}

