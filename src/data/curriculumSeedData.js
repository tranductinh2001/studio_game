// Seed Curriculum Database for Multi-Grade Presentation System (Lớp 6, 7, 8, 9)
// Designed for THCS Đắk Trôi - Thầy Trần Đức Tình

export const INITIAL_CURRICULUM_LESSONS = [
  // 1. LỚP 6 - BÀI 6 (CORE LIVE LESSON)
  {
    id: 'lesson_tin6_bai06',
    subject: 'Tin học',
    grade: 6,
    lessonNumber: 6,
    title: 'Mạng thông tin toàn cầu (WWW)',
    shortTitle: 'Bài 6: Mạng WWW',
    periodsCount: 1,
    teacherName: 'Thầy Trần Đức Tình',
    school: 'THCS Đắk Trôi',
    createdAt: '2026-11-15T08:00:00.000Z',
    updatedAt: '2026-11-22T20:00:00.000Z',
    slideCount: 7,
    status: 'completed',
    version: '1.2',
    description: 'Tìm hiểu mạng thông tin toàn cầu WWW, website, siêu văn bản, siêu liên kết và địa chỉ URL của trang web.',
    isCoreLesson: true, // Uses existing interactive presentation + 8 games + Mark AI
    periods: [
      {
        periodNumber: 1,
        title: 'Tiết 1: Khái niệm WWW, Trình duyệt & Siêu liên kết',
        objectives: [
          'Nêu được khái niệm Mạng thông tin toàn cầu (World Wide Web - WWW)',
          'Biết vai trò và phân biệt được Trình duyệt web và Website',
          'Hiểu và nhận biết được siêu văn bản (Hypertext) và siêu liên kết (Hyperlink)'
        ],
        keyKnowledge: 'WWW là dịch vụ thông tin toàn cầu liên kết các website trên nền tảng Internet qua giao thức HTTP/HTTPS và siêu liên kết.',
        slides: [
          {
            id: 'slide_6_0',
            type: 'title',
            title: 'BÀI 6: MẠNG THÔNG TIN TOÀN CẦU (WWW)',
            subtitle: 'Tin học 6 • Bộ sách Kết Nối Tri Thức Với Cuộc Sống',
            content: [
              'Khởi động: Thử thách kết nối thông tin toàn cầu',
              'Mục 1: Mạng thông tin toàn cầu là gì?',
              'Mục 2: Trình duyệt web và siêu liên kết',
              'Hoạt động nhóm A3/A4 & Đấu trường trò chơi'
            ],
            notes: 'Mở đầu tiết thao giảng, dẫn dắt bằng câu chuyện thực tế về tìm kiếm bài học trên Google.'
          },
          {
            id: 'slide_6_1',
            type: 'activity',
            title: 'HOẠT ĐỘNG 1: KHỞI ĐỘNG CÙNG TRỢ LÝ MARK AI',
            subtitle: 'Thảo luận lớp • Thời gian: 3 phút',
            content: [
              'Câu hỏi gợi mở: Vì sao máy tính ở Việt Nam có thể xem ngay video vừa đăng tại Mỹ?',
              'Internet là hạ tầng vật lý kết nối máy tính toàn cầu.',
              'Vậy thông tin, hình ảnh, văn bản được tổ chức và chia sẻ bằng cách nào?'
            ],
            notes: 'Chuyển sang Mark AI hoặc hỏi đáp tương tác trực tiếp với học sinh.'
          },
          {
            id: 'slide_6_2',
            type: 'concept',
            title: 'MỤC 1: KHÁI NIỆM MẠNG THÔNG TIN TOÀN CẦU (WWW)',
            subtitle: 'Kiến thức cốt lõi Bài 6',
            content: [
              'World Wide Web (WWW) là dịch vụ thông tin toàn cầu liên kết các trang web trên Internet.',
              'Website là tập hợp các trang web liên quan, được mở qua một địa chỉ chung (URL).',
              'Trang chủ (Homepage) là trang đầu tiên được mở ra khi truy cập vào website.'
            ],
            notes: 'Nhấn mạnh sự khác nhau giữa Internet (hạ tầng mạng) và WWW (dịch vụ nội dung).'
          },
          {
            id: 'slide_6_3',
            type: 'concept',
            title: 'MỤC 2: TRÌNH DUYỆT WEB & SIÊU LIÊN KẾT',
            subtitle: 'Công cụ và cách thức duyệt thông tin',
            content: [
              'Trình duyệt web: Phần mềm giúp con người truy cập và xem nội dung các website (Chrome, Edge, Cốc Cốc, Safari).',
              'Siêu văn bản (Hypertext): Văn bản tích hợp hình ảnh, âm thanh và chứa các siêu liên kết.',
              'Siêu liên kết (Hyperlink): Đường dẫn trỏ tới một vị trí khác hoặc một trang web khác khi nhấp chuột.'
            ],
            notes: 'Cho học sinh thực hành chỉ ra con trỏ chuột đổi thành hình bàn tay khi gặp hyperlink.'
          },
          {
            id: 'slide_6_4',
            type: 'summary',
            title: 'GHI VỞ CHUẨN HÓA BÀI 6 (2 CỘT)',
            subtitle: 'Nội dung cốt lõi học sinh cần ghi nhớ',
            content: [
              'Cột 1: Mạng thông tin toàn cầu (WWW) và Website.',
              'Cột 2: Trình duyệt web và Siêu liên kết (Hyperlink).',
              'Ghi nhớ: WWW hoạt động trên nền tảng Internet.'
            ],
            notes: 'Dành 3-5 phút cho học sinh hoàn thiện nội dung vở ghi.'
          }
        ],
        questions: [
          {
            id: 'q_tin6_01',
            type: 'multiple_choice',
            bloomLevel: 'Nhận biết',
            questionText: 'Mạng thông tin toàn cầu (World Wide Web - WWW) là gì?',
            options: {
              A: 'Là mạng máy tính kết nối bằng cáp ngầm dưới biển',
              B: 'Là dịch vụ thông tin bao gồm các trang web liên kết với nhau được lưu trữ trên Internet',
              C: 'Là một phần mềm dùng để soạn thảo văn bản',
              D: 'Là chiếc máy tính chủ của Google đặt tại Mỹ'
            },
            correctAnswer: 'B',
            explanation: 'WWW là dịch vụ thông tin toàn cầu liên kết các trang web trên nền Internet.'
          },
          {
            id: 'q_tin6_02',
            type: 'multiple_choice',
            bloomLevel: 'Thông hiểu',
            questionText: 'Phát biểu nào sau đây phân biệt ĐÚNG nhất giữa Internet và WWW?',
            options: {
              A: 'Internet và WWW hoàn toàn là một, không có điểm khác biệt',
              B: 'Internet là dịch vụ xem phim, còn WWW là mạng dây cáp',
              C: 'Internet là mạng máy tính toàn cầu, còn WWW là dịch vụ thông tin hoạt động trên Internet',
              D: 'WWW ra đời trước, sau đó người ta mới xây dựng nên mạng Internet'
            },
            correctAnswer: 'C',
            explanation: 'Internet cung cấp hạ tầng kết nối vật lý; WWW là dịch vụ tổ chức và chia sẻ nội dung trên hạ tầng đó.'
          }
        ]
      }
    ]
  },

  // 2. LỚP 8 - BÀI 7: TRỰC QUAN HOÁ DỮ LIỆU (TRÌNH BÀY DỮ LIỆU BẰNG BIỂU ĐỒ - 2 TIẾT)
  // Chuẩn SGK Kết Nối Tri Thức Với Cuộc Sống & Công văn 5512/BGDĐT
  {
    id: 'lesson_tin8_bai07',
    subject: 'Tin học',
    grade: 8,
    lessonNumber: 7,
    title: 'Trực quan hoá dữ liệu (Trình bày dữ liệu bằng biểu đồ)',
    shortTitle: 'Bài 7: Trực quan hoá dữ liệu',
    periodsCount: 2,
    teacherName: 'Thầy Trần Đức Tình',
    school: 'THCS Đắk Trôi',
    createdAt: '2026-11-23T08:00:00.000Z',
    updatedAt: '2026-11-23T09:15:00.000Z',
    slideCount: 16,
    status: 'completed',
    version: '1.2',
    description: 'Tìm hiểu trực quan hoá dữ liệu, ý nghĩa biểu đồ cột, quạt tròn, đoạn thẳng và thực hành quy trình 4 bước tạo, định dạng biểu đồ chuyên nghiệp trên bảng tính Excel.',
    isCoreLesson: false,
    periods: [
      {
        periodNumber: 1,
        title: 'Tiết 1: Trực quan hoá dữ liệu và các loại biểu đồ cơ bản',
        objectives: [
          'Hiểu được khái niệm và ưu điểm vượt trội của việc trực quan hoá dữ liệu so với bảng số liệu thô',
          'Nhận biết và phân biệt được mục đích sử dụng của 3 loại biểu đồ thông dụng: Biểu đồ cột, Biểu đồ quạt tròn và Biểu đồ đoạn thẳng',
          'Biết lựa chọn đúng loại biểu đồ phù hợp với từng tình huống thực tế'
        ],
        keyKnowledge: 'Trực quan hoá dữ liệu là cách chuyển số liệu thành hình ảnh biểu đồ giúp mắt người dễ so sánh, phát hiện quy luật và dự đoán xu hướng.',
        slides: [
          {
            id: 'slide_8_7_1_0',
            type: 'title',
            title: 'TIN HỌC 8 - BÀI 7: TRỰC QUAN HOÁ DỮ LIỆU',
            subtitle: 'Tiết 1: Trực quan hoá dữ liệu & Các loại biểu đồ thông dụng (KNTT)',
            content: [
              'Khởi động: Bảng số liệu vs Biểu đồ trực quan (Hình 7.1 & 7.2 SGK)',
              'Mục 1: Trực quan hoá dữ liệu bằng biểu đồ là gì?',
              'Mục 2: Phân loại biểu đồ: Biểu đồ cột, Quạt tròn, Đoạn thẳng',
              'Luyện tập nhận diện & Thử thách chọn đúng dạng biểu đồ'
            ],
            notes: 'Mở đầu bằng việc chiếu cùng lúc bảng số liệu điều tra sở thích Tin học và biểu đồ cột để học sinh tự so sánh độ trực quan.'
          },
          {
            id: 'slide_8_7_1_1',
            type: 'hook',
            title: 'HOẠT ĐỘNG KHỞI ĐỘNG: SỐ LIỆU BIẾT NÓI',
            subtitle: 'Cách nào giúp bạn nhận ra ngay chủ đề Tin học được yêu thích nhất?',
            content: [
              'Bảng số liệu (Hình 7.1 SGK): Liệt kê 6 chủ đề kèm các con số 8, 7, 15, 4, 2, 5 ➜ Mắt phải dò từng dòng và so sánh nhẩm trong đầu.',
              'Biểu đồ cột (Hình 7.2 SGK): Chiều cao cột Đồ hoạ máy tính (15) vọt hẳn lên trên ➜ Nhìn 1 giây là biết ngay chủ đề hot nhất!',
              'Câu hỏi gợi mở: Nếu muốn biết chủ đề Đồ hoạ máy tính chiếm bao nhiêu % trong toàn bộ lớp 8A, ta nên dùng cách nào?'
            ],
            notes: 'Dẫn dắt học sinh nhận ra: Biểu đồ giúp não bộ tiếp nhận thông tin nhanh gấp nhiều lần bảng số thô.'
          },
          {
            id: 'slide_8_7_1_2',
            type: 'concept',
            title: '1. TRỰC QUAN HOÁ DỮ LIỆU BẰNG BIỂU ĐỒ',
            subtitle: 'Khái niệm và ý nghĩa thực tiễn',
            content: [
              'Trực quan hoá dữ liệu: Là việc thể hiện dữ liệu dưới dạng hình ảnh, sơ đồ hoặc biểu đồ đồ hoạ.',
              'Ưu điểm: Dễ quan sát, dễ so sánh, dễ phát hiện quy luật và nhận định xu hướng biến thiên tăng giảm.',
              'Ghi nhớ: Mỗi loại biểu đồ đều mang một ý nghĩa truyền đạt riêng, cần chọn đúng mục đích.'
            ],
            notes: 'Cho học sinh ghi nhanh định nghĩa ngắn gọn vào vở.'
          },
          {
            id: 'slide_8_7_1_3',
            type: 'concept',
            title: '2.1. BIỂU ĐỒ CỘT (COLUMN / BAR CHART)',
            subtitle: 'Công cụ đắc lực để so sánh các đại lượng độc lập',
            content: [
              'Đặc điểm: Sử dụng các cột có chiều cao (hoặc chiều dài) tương ứng với giá trị dữ liệu.',
              'Mục đích: So sánh trực quan dữ liệu giữa các đối tượng khác nhau hoặc qua từng mốc rời rạc.',
              'Ví dụ: So sánh số học sinh chọn từng môn thể thao, so sánh số lượng hoa điểm tốt của 4 tổ trong tuần.'
            ],
            notes: 'Nhấn mạnh: Chiều cao cột càng lớn thể hiện số lượng càng nhiều.'
          },
          {
            id: 'slide_8_7_1_4',
            type: 'concept',
            title: '2.2. BIỂU ĐỒ HÌNH QUẠT TRÒN (PIE CHART)',
            subtitle: 'Công cụ tối ưu so sánh các phần trong một tổng thể (100%)',
            content: [
              'Đặc điểm: Hình tròn tượng trưng cho toàn bộ 100% tổng thể, mỗi hình quạt là tỉ lệ của từng thành phần.',
              'Mục đích: Rất hữu ích khi cần so sánh tỉ lệ phần trăm các phần so với toàn bộ tổng thể.',
              'Ví dụ: Tỉ lệ phần trăm xếp loại học lực của khối 8 (Giỏi, Khá, Đạt, Chưa đạt), cơ cấu chi tiêu của gia đình.'
            ],
            notes: 'Nhắc học sinh: Tổng các góc quạt tròn luôn là 360 độ tương đương 100%.'
          },
          {
            id: 'slide_8_7_1_5',
            type: 'concept',
            title: '2.3. BIỂU ĐỒ ĐOẠN THẲNG (LINE CHART)',
            subtitle: 'Công cụ quan sát xu hướng thay đổi liên tục theo thời gian',
            content: [
              'Đặc điểm: Các điểm dữ liệu được nối với nhau bằng các đoạn thẳng liên tục.',
              'Mục đích: Thích hợp quan sát sự biến thiên tăng, giảm của dữ liệu theo chuỗi thời gian (ngày, tháng, năm).',
              'Ví dụ (Hình 7.3 SGK): Số lượng ứng dụng di động tải về từ năm 2017 đến 2020 có xu hướng liên tục tăng mạnh.'
            ],
            notes: 'Liên hệ môn Địa lí và Khoa học tự nhiên (nhiệt độ theo tháng, tốc độ tăng trưởng kinh tế).'
          },
          {
            id: 'slide_8_7_1_6',
            type: 'activity',
            title: 'LUYỆN TẬP TIẾT 1: THỬ THÁCH CHỌN BIỂU ĐỒ',
            subtitle: 'Tình huống thực tế đòi hỏi quyết định trực quan',
            content: [
              'Tình huống 1: So sánh lượng mưa các tháng trong năm tại Đắk Trôi ➜ Biểu đồ Đoạn thẳng hoặc Biểu đồ Cột.',
              'Tình huống 2: Thể hiện tỉ lệ học sinh đi bộ, đi xe đạp, bố mẹ chở đến trường ➜ Biểu đồ Hình quạt tròn.',
              'Tình huống 3: So sánh dân số giữa 5 huyện trong tỉnh Gia Lai ➜ Biểu đồ Cột.'
            ],
            notes: 'Chia cặp đôi học sinh thảo luận nhanh 2 phút và giơ thẻ chọn A, B, C.'
          },
          {
            id: 'slide_8_7_1_7',
            type: 'summary',
            title: 'TỔNG KẾT TIẾT 1 & CHUẨN BỊ TIẾT 2 THỰC HÀNH',
            subtitle: 'Chốt lại kiến thức cốt lõi và nhiệm vụ phòng máy',
            content: [
              'Biểu đồ cột: So sánh đại lượng giữa các đối tượng.',
              'Biểu đồ quạt tròn: So sánh tỉ lệ % trong tổng thể.',
              'Biểu đồ đoạn thẳng: Quan sát xu hướng biến thiên theo thời gian.',
              'Nhiệm vụ Tiết 2: Lên phòng máy tính thực hành tạo và định dạng biểu đồ cột, biểu đồ tròn trên bảng tính Excel.'
            ],
            notes: 'Dặn dò học sinh mang sổ ghi chép và xem trước các bước tạo biểu đồ trang 33-35 SGK.'
          }
        ],
        questions: [
          {
            id: 'q_tin8_7_1_01',
            type: 'multiple_choice',
            bloomLevel: 'Nhận biết',
            questionText: 'Mục đích chính của việc trực quan hoá dữ liệu bằng biểu đồ là gì?',
            options: {
              A: 'Để làm cho trang tính có nhiều màu sắc bắt mắt hơn',
              B: 'Giúp người đọc dễ so sánh, nhận định xu hướng tăng giảm và phát hiện quy luật của dữ liệu',
              C: 'Để giảm bớt dung lượng của tệp bảng tính Excel',
              D: 'Để thay thế hoàn toàn việc gõ công thức toán học'
            },
            correctAnswer: 'B',
            explanation: 'Trực quan hoá dữ liệu chuyển các con số khô khan thành hình ảnh trực quan giúp dễ dàng so sánh và nắm bắt xu hướng.'
          },
          {
            id: 'q_tin8_7_1_02',
            type: 'multiple_choice',
            bloomLevel: 'Thông hiểu',
            questionText: 'Để biểu diễn cơ cấu tỉ lệ phần trăm xếp loại học tập (Xuất sắc, Giỏi, Khá, Đạt) của học sinh khối 8, loại biểu đồ nào sau đây là phù hợp nhất?',
            options: {
              A: 'Biểu đồ đoạn thẳng (Line Chart)',
              B: 'Biểu đồ hình quạt tròn (Pie Chart)',
              C: 'Biểu đồ vùng phân tán (Scatter Chart)',
              D: 'Biểu đồ mạng nhện (Radar Chart)'
            },
            correctAnswer: 'B',
            explanation: 'Biểu đồ hình quạt tròn (Pie Chart) là lựa chọn tối ưu nhất khi cần so sánh tỉ lệ các phần trên tổng thể 100%.'
          }
        ]
      },
      {
        periodNumber: 2,
        title: 'Tiết 2: Thực hành tạo và định dạng biểu đồ (tt)',
        objectives: [
          'Thực hiện thành thạo quy trình 4 bước tạo Biểu đồ cột (Clustered Column) trong Excel',
          'Sử dụng thành thạo nút lệnh Chart Elements (+) để bổ sung Tiêu đề biểu đồ, Tên trục toạ độ và Nhãn dữ liệu',
          'Tạo Biểu đồ hình quạt tròn (Pie Chart) và định dạng hiển thị tỉ lệ phần trăm (%) qua Format Data Labels',
          'Luyện tập trên tệp TGSDThietbiso.xlsx, tính hàm SUM và rút ra nhận xét có ý nghĩa từ biểu đồ',
          'Thực hành vẽ biểu đồ đoạn thẳng thể hiện doanh thu công nghiệp phần mềm Việt Nam (2016-2020)'
        ],
        keyKnowledge: 'Tạo biểu đồ qua thẻ Insert > Charts; Bổ sung thành phần biểu đồ qua nút dấu cộng (+) Chart Elements; Định dạng tỉ lệ % qua Format Data Labels.',
        slides: [
          {
            id: 'slide_8_7_2_0',
            type: 'title',
            title: 'TIN HỌC 8 - BÀI 7: TRỰC QUAN HOÁ DỮ LIỆU',
            subtitle: 'Tiết 2: Thực hành tạo và định dạng biểu đồ trên bảng tính điện tử (tt)',
            content: [
              'Nhiệm vụ 1: Quy trình 4 bước tạo Biểu đồ cột (Clustered Column)',
              'Kỹ thuật bổ sung: Tùy biến thành phần qua nút Chart Elements (+)',
              'Nhiệm vụ 2: Biểu đồ hình quạt tròn & Định dạng nhãn % (Percentage)',
              'Nhiệm vụ 3 & Vận dụng: Luyện tập trên tệp TGSDThietbiso.xlsx & Đánh giá Rubric'
            ],
            notes: 'Giáo viên kiểm tra kết nối mạng phòng máy, gửi sẵn tệp thực hành và phổ biến nội quy an toàn.'
          },
          {
            id: 'slide_8_7_2_1',
            type: 'concept',
            title: 'MỤC TIÊU CẦN ĐẠT & NHIỆM VỤ THỰC HÀNH',
            subtitle: 'Yêu cầu cần đạt theo Chương trình GDPT 2018 (Công văn 5512)',
            content: [
              'Thao tác chuẩn: Nắm vững và thực hiện đúng quy trình 4 bước tạo biểu đồ cột và biểu đồ hình quạt tròn trong phần mềm bảng tính Excel.',
              'Định dạng chuyên nghiệp: Biết dùng nút Chart Elements (+) để thêm tên biểu đồ, tên trục, nhãn dữ liệu và hiển thị nhãn tỉ lệ phần trăm (%).',
              'Năng lực đọc dữ liệu: Nhận xét được ý nghĩa, so sánh số liệu và rút ra xu hướng thực tế từ biểu đồ vừa tạo.',
              'Thái độ học tập: Nghiêm túc, cẩn thận, biết hợp tác nhóm và ý thức quản lý thời gian sử dụng thiết bị số lành mạnh.'
            ],
            notes: 'Nhấn mạnh với học sinh: Thực hành Tin học không chỉ là thao tác bấm chuột, mà là biến số liệu thô thành thông tin hữu ích.'
          },
          {
            id: 'slide_8_7_2_2',
            type: 'hook',
            title: 'KHỞI ĐỘNG NHANH: THỬ THÁCH "BẮT BỆNH DỮ LIỆU"',
            subtitle: 'Chọn dạng biểu đồ chuẩn xác cho từng bài toán thực tế',
            content: [
              'Tình huống A: So sánh số học sinh Giỏi, Khá, Trung bình giữa các lớp khối 8 ➜ Chọn Biểu đồ Cột (Column).',
              'Tình huống B: Thể hiện cơ cấu nguồn điện Việt Nam (Thủy điện, Nhiệt điện, Năng lượng tái tạo) ➜ Chọn Biểu đồ Quạt tròn (Pie).',
              'Tình huống C: Theo dõi diễn biến nhiệt độ trung bình 12 tháng tại Gia Lai ➜ Chọn Biểu đồ Đoạn thẳng (Line).',
              'Ghi nhớ: Dữ liệu so sánh đại lượng độc lập dùng Cột; Cơ cấu tỉ lệ % dùng Tròn; Xu hướng thời gian dùng Đoạn thẳng.'
            ],
            notes: 'Gọi nhanh 2-3 học sinh trả lời nhanh trong 2 phút để tạo không khí hào hứng đầu giờ.'
          },
          {
            id: 'slide_8_7_2_3',
            type: 'concept',
            title: 'NHIỆM VỤ 1: QUY TRÌNH 4 BƯỚC TẠO BIỂU ĐỒ CỘT',
            subtitle: 'Thực hành trên bảng khảo sát sở thích Tin học lớp 8A',
            content: [
              'Bước 1: Chọn đúng vùng dữ liệu B2:C8 (Chỉ chọn tên chủ đề và cột số lượng, không chọn ô tiêu đề lớn ngoài bảng).',
              'Bước 2: Mở thẻ Insert trên thanh dải lệnh Ribbon ➜ Tìm đến nhóm lệnh Charts.',
              'Bước 3: Nhấp chọn nút lệnh Insert Column or Bar Chart (biểu đồ cột 2 chiều hoặc thanh nằm ngang).',
              'Bước 4: Trong danh mục 2-D Column, nhấp chọn kiểu Clustered Column (Biểu đồ cột cụm đứng).'
            ],
            notes: 'Lưu ý cảnh báo lỗi kinh điển: Tuyệt đối không chọn hàng "Tổng cộng" kẻo cột tổng sẽ đè bẹp các cột khác!'
          },
          {
            id: 'slide_8_7_2_4',
            type: 'concept',
            title: 'KỸ THUẬT NÂNG CAO: TÙY BIẾN QUA NÚT CHART ELEMENTS (+)',
            subtitle: 'Hoàn thiện biểu đồ chuyên nghiệp, chuẩn sư phạm và báo cáo',
            content: [
              'Nút Chart Elements (+): Nằm ở góc trên bên phải khi nhấp chọn biểu đồ, cho phép bật/tắt các thành phần.',
              'Chart Title (Tiêu đề biểu đồ): Đổi tên thành "Số học sinh quan tâm các nội dung Tin học" để biểu đồ rõ nghĩa.',
              'Axis Titles (Tên trục toạ độ): Đặt tên Trục đứng (Số học sinh) và Trục ngang (Chủ đề Tin học).',
              'Data Labels (Nhãn dữ liệu): Hiển thị con số chính xác trên đỉnh mỗi cột (Outside End) giúp người đọc không cần dóng mắt vào trục.'
            ],
            notes: 'Thao tác mẫu trên máy chiếu 1 lần rồi yêu cầu học sinh làm theo trên máy cá nhân.'
          },
          {
            id: 'slide_8_7_2_5',
            type: 'concept',
            title: 'NHIỆM VỤ 2: TẠO BIỂU ĐỒ QUẠT TRÒN & HIỂN THỊ TỈ LỆ %',
            subtitle: 'Kỹ thuật định dạng nhãn dữ liệu tỉ lệ phần trăm (Percentage)',
            content: [
              'Bước 1 - 3: Chọn vùng B2:C8 ➜ Thẻ Insert ➜ Nhóm Charts ➜ Insert Pie or Doughnut Chart ➜ Chọn 2-D Pie.',
              'Bước 4: Thêm nhãn: Nhấp nút Chart Elements (+) ➜ Chọn Data Labels ➜ Nhấp mũi tên trỏ sang chọn More Options...',
              'Bước 5: Cửa sổ Format Data Labels hiện bên phải màn hình: Tích chọn ô Percentage (%) và bỏ chọn ô Value (Giá trị số).',
              'Kết quả: Biểu đồ hiển thị chính xác Đồ hoạ máy tính chiếm 37%, Ngôn ngữ lập trình chiếm 19%, Mạng máy tính 17%.'
            ],
            notes: 'Nhắc học sinh quan sát: Tổng tất cả các lát cắt trong biểu đồ hình quạt tròn luôn luôn bằng 100%.'
          },
          {
            id: 'slide_8_7_2_6',
            type: 'activity',
            title: 'NHIỆM VỤ 3: LUYỆN TẬP VỚI TỆP THỰC TẾ "TGSDThietbiso.xlsx"',
            subtitle: 'Khảo sát thời gian sử dụng thiết bị số của học sinh khối 8',
            content: [
              'Thao tác 1: Mở tệp TGSDThietbiso.xlsx có sẵn trong thư mục bài tập ➜ Dùng hàm =SUM() tính tổng số học sinh được khảo sát.',
              'Thao tác 2: Vẽ Biểu đồ Cột thể hiện số học sinh theo từng khoảng thời gian (Không dùng, Dưới 1h, 1-2h, 3-4h, Trên 5h).',
              'Thao tác 3: Vẽ Biểu đồ Quạt Tròn hiển thị tỉ lệ phần trăm các nhóm học sinh sử dụng thiết bị số.',
              'Thao tác 4: Rút ra nhận xét: Đa số HS dùng từ 1-2 giờ (34%), nhưng vẫn có 3% HS dùng trên 5 giờ/ngày ➜ Cần điều chỉnh để bảo vệ mắt và sức khỏe.'
            ],
            notes: 'Tổ chức thi đua giữa các bàn máy. Giáo viên đi quan sát, hỗ trợ các máy gặp trục trặc.'
          },
          {
            id: 'slide_8_7_2_7',
            type: 'summary',
            title: 'VẬN DỤNG THỰC TẾ & BẢNG TIÊU CHÍ ĐÁNH GIÁ (RUBRIC)',
            subtitle: 'Biểu đồ doanh thu công nghiệp phần mềm & Đánh giá kết quả tiết học',
            content: [
              'Thử thách Vận dụng: Dựa trên bảng doanh thu phần mềm Việt Nam (2016-2020), vẽ biểu đồ đường thẳng (Line) để thấy xu hướng tăng trưởng liên tục từ 3.038 đến 5.439 triệu USD.',
              'Tiêu chí 1 (3đ): Chọn đúng vùng dữ liệu, không dính hàng tổng, chọn đúng loại biểu đồ yêu cầu.',
              'Tiêu chí 2 (3đ): Có đầy đủ Tiêu đề biểu đồ (Chart Title), tên trục (Axis Titles) và Chú giải (Legend) hợp lý.',
              'Tiêu chí 3 (2đ): Nhãn dữ liệu (Data Labels) hiển thị rõ ràng, biểu đồ tròn có định dạng tỉ lệ % chuẩn xác.',
              'Tiêu chí 4 (2đ): Đọc đúng xu hướng dữ liệu thực tế và lưu tệp đúng tên theo quy định của giáo viên.'
            ],
            notes: 'Cho đại diện 2 nhóm chiếu màn hình sản phẩm lên máy chủ để cả lớp cùng nhận xét và chấm điểm chéo.'
          }
        ],
        questions: [
          {
            id: 'q_tin8_7_2_01',
            type: 'multiple_choice',
            bloomLevel: 'Nhận biết',
            questionText: 'Trong Microsoft Excel, nút lệnh nào hiển thị ở góc trên bên phải biểu đồ cho phép nhanh chóng thêm hoặc ẩn Tiêu đề (Chart Title), Tên trục (Axis Titles) và Nhãn dữ liệu (Data Labels)?',
            options: {
              A: 'Nút Chart Filters (hình cái phễu lọc)',
              B: 'Nút Chart Styles (hình cây cọ vẽ)',
              C: 'Nút Chart Elements (hình dấu cộng +)',
              D: 'Nút Format Data Point'
            },
            correctAnswer: 'C',
            explanation: 'Nút Chart Elements (hình dấu cộng +) là công cụ trung tâm để bật/tắt và tùy chỉnh nhanh các thành phần cốt lõi của biểu đồ.'
          },
          {
            id: 'q_tin8_7_2_02',
            type: 'Thông hiểu',
            bloomLevel: 'Thông hiểu',
            questionText: 'Khi cần tạo biểu đồ hình quạt tròn (Pie Chart) thể hiện tỉ lệ phần trăm số học sinh quan tâm các môn Tin học, em chọn lệnh nào trong nhóm lệnh Charts của thẻ Insert?',
            options: {
              A: 'Insert Column or Bar Chart',
              B: 'Insert Pie or Doughnut Chart',
              C: 'Insert Line or Area Chart',
              D: 'Insert Waterfall Chart'
            },
            correctAnswer: 'B',
            explanation: 'Trong thẻ Insert > nhóm Charts, nhấp vào nút lệnh Insert Pie or Doughnut Chart rồi chọn kiểu biểu đồ 2-D Pie.'
          },
          {
            id: 'q_tin8_7_2_03',
            type: 'multiple_choice',
            bloomLevel: 'Vận dụng',
            questionText: 'Một học sinh khi tạo biểu đồ cột so sánh số học sinh chọn các môn Tin học đã vô tình bôi đen chọn luôn cả hàng "Tổng cộng = 41". Hậu quả gì sẽ xảy ra trên biểu đồ?',
            options: {
              A: 'Excel sẽ báo lỗi cú pháp và từ chối vẽ biểu đồ',
              B: 'Cột Tổng cộng cao vượt trội (41) sẽ làm cho các cột môn học còn lại (2, 4, 5, 7, 8, 15) bị lùn tịt xuống, rất khó so sánh trực quan',
              C: 'Biểu đồ tự động chuyển đổi thành biểu đồ hình quạt tròn',
              D: 'Excel sẽ tự động xóa số liệu hàng Tổng cộng ra khỏi bảng tính'
            },
            correctAnswer: 'B',
            explanation: 'Khi đưa hàng tổng cộng vào biểu đồ so sánh chi tiết, giá trị tổng quá lớn sẽ thu nhỏ tỉ lệ trục tung, làm các cột thành phần bị lùn tịt và mất đi ý nghĩa so sánh.'
          },
          {
            id: 'q_tin8_7_2_04',
            type: 'multiple_choice',
            bloomLevel: 'Vận dụng cao',
            questionText: 'Trong ngăn tác vụ Format Data Labels của biểu đồ hình quạt tròn, muốn biểu đồ hiển thị nhãn là con số phần trăm (ví dụ: 37%) thay vì con số tuyệt đối (15 học sinh), ta cần thực hiện thao tác nào?',
            options: {
              A: 'Tích chọn vào ô Value và bỏ chọn Series Name',
              B: 'Tích chọn vào ô Percentage và bỏ chọn ô Value',
              C: 'Nhập công thức =SUM() trực tiếp vào từng lát cắt',
              D: 'Đổi phông chữ của toàn bộ trang tính sang cỡ chữ 37'
            },
            correctAnswer: 'B',
            explanation: 'Trong Label Options của ngăn Format Data Labels, tích chọn ô Percentage để Excel tự động tính toán và hiển thị tỉ lệ phần trăm, đồng thời bỏ chọn ô Value nếu không muốn hiện số đếm tuyệt đối.'
          }
        ]
      }
    ]
  },

  // 3. LỚP 8 - BÀI 8 (USER TEST SCENARIO: TIN HỌC 8, BÀI 8, 2 TIẾT)
  {
    id: 'lesson_tin8_bai08',
    subject: 'Tin học',
    grade: 8,
    lessonNumber: 8,
    title: 'Mạch logic và cổng logic cơ bản',
    shortTitle: 'Bài 8: Mạch & Cổng logic',
    periodsCount: 2,
    teacherName: 'Thầy Trần Đức Tình',
    school: 'THCS Đắk Trôi',
    createdAt: '2026-11-20T09:00:00.000Z',
    updatedAt: '2026-11-22T21:30:00.000Z',
    slideCount: 14,
    status: 'completed',
    version: '1.0',
    description: 'Tìm hiểu tín hiệu số, bit 0 và 1, các phép toán logic cơ bản AND, OR, NOT và bảng chân lý của cổng logic.',
    isCoreLesson: false,
    periods: [
      {
        periodNumber: 1,
        title: 'Tiết 1: Tín hiệu nhị phân và Cổng logic AND, OR, NOT',
        objectives: [
          'Hiểu được khái niệm tín hiệu nhị phân (0 và 1 / Đúng và Sai) trong máy tính',
          'Nhận biết được ký hiệu và nguyên lý hoạt động của cổng logic NOT (ĐẢO), AND (VÀ), OR (HOẶC)',
          'Lập được bảng chân lý cho từng cổng logic cơ bản'
        ],
        keyKnowledge: 'Mọi phép tính trong máy tính số đều xây dựng từ các mạch logic cơ bản với hai mức tín hiệu 0 và 1.',
        slides: [
          {
            id: 'slide_8_1_0',
            type: 'title',
            title: 'TIN HỌC 8 - BÀI 8: MẠCH LOGIC VÀ CỔNG LOGIC CƠ BẢN',
            subtitle: 'Tiết 1: Tín hiệu nhị phân và các cổng logic cơ bản (AND, OR, NOT)',
            content: [
              'Khởi động: Đèn bật/tắt và tín hiệu nhị phân 0 - 1',
              'Mục 1: Tín hiệu số và biểu diễn nhị phân',
              'Mục 2: Ba cổng logic cơ bản: NOT, AND, OR',
              'Luyện tập & Bảng chân lý tương tác'
            ],
            notes: 'Giới thiệu tính kết nối giữa công tắc bóng đèn gia đình và vi mạch điện tử máy tính.'
          },
          {
            id: 'slide_8_1_1',
            type: 'hook',
            title: 'KHỞI ĐỘNG: BÍ MẬT ĐẰNG SAU TÍN HIỆU 0 VÀ 1',
            subtitle: 'Máy tính suy nghĩ và ra quyết định như thế nào?',
            content: [
              'Bóng đèn gia đình chỉ có 2 trạng thái: BẬT (ON) hoặc TẮT (OFF).',
              'Trong mạch điện máy tính: Điện áp cao tương ứng với bit 1 (True - Đúng), điện áp thấp tương ứng bit 0 (False - Sai).',
              'Làm sao kết hợp hàng triệu công tắc siêu nhỏ để thực hiện phép cộng, trừ và so sánh logic?'
            ],
            notes: 'Cho học sinh liên tưởng đến công tắc cầu dao điện tử.'
          },
          {
            id: 'slide_8_1_2',
            type: 'concept',
            title: '1. CỔNG NOT (PHÉP PHỦ ĐỊNH / ĐẢO LOGIC)',
            subtitle: 'Ký hiệu và Bảng chân lý cổng NOT',
            content: [
              'Đầu vào có 1 tín hiệu (A), đầu ra là phủ định (Y = NOT A).',
              'Nếu đầu vào A = 0 ➜ Đầu ra Y = 1.',
              'Nếu đầu vào A = 1 ➜ Đầu ra Y = 0.',
              'Ứng dụng: Đảo trạng thái tín hiệu, ngắt mạch tự động khi phát hiện quá tải.'
            ],
            notes: 'Vẽ ký hiệu hình tam giác có vòng tròn nhỏ ở đầu ra.'
          },
          {
            id: 'slide_8_1_3',
            type: 'concept',
            title: '2. CỔNG AND (PHÉP NHÂN LOGIC / VÀ)',
            subtitle: 'Đầu ra chỉ bằng 1 khi TẤT CẢ đầu vào bằng 1',
            content: [
              'Cổng AND có từ 2 đầu vào trở lên (A, B) và 1 đầu ra (Y = A AND B).',
              'Bảng chân lý: 0 AND 0 = 0 | 0 AND 1 = 0 | 1 AND 0 = 0 | 1 AND 1 = 1.',
              'Ví dụ đời sống: Cửa két sắt chỉ mở (1) khi CẢ mã số đúng (1) VÀ chìa khóa xoay đúng (1).'
            ],
            notes: 'Nhấn mạnh quy tắc: Chỉ cần 1 đầu vào bằng 0 thì đầu ra lập tức bằng 0.'
          },
          {
            id: 'slide_8_1_4',
            type: 'concept',
            title: '3. CỔNG OR (PHÉP CỘNG LOGIC / HOẶC)',
            subtitle: 'Đầu ra bằng 1 khi CÓ ÍT NHẤT MỘT đầu vào bằng 1',
            content: [
              'Cổng OR có từ 2 đầu vào (A, B) và 1 đầu ra (Y = A OR B).',
              'Bảng chân lý: 0 OR 0 = 0 | 0 OR 1 = 1 | 1 OR 0 = 1 | 1 OR 1 = 1.',
              'Ví dụ đời sống: Chuông báo cháy reo (1) khi CÓ khói (1) HOẶC CÓ nhiệt độ cao (1).'
            ],
            notes: 'Phân biệt rõ bản chất "đồng thời" của AND và "linh hoạt" của OR.'
          },
          {
            id: 'slide_8_1_5',
            type: 'activity',
            title: 'LUYỆN TẬP TIẾT 1: THỬ THÁCH BẢNG CHÂN LÝ',
            subtitle: 'Tính toán giá trị đầu ra của cổng logic',
            content: [
              'Bài tập 1: Cho A = 1, B = 0. Tính giá trị của Y1 = A AND B?',
              'Bài tập 2: Cho A = 0, B = 1. Tính giá trị của Y2 = A OR B?',
              'Bài tập 3: Cho A = 1. Tính giá trị của Y3 = NOT (NOT A)?'
            ],
            notes: 'Tổ chức cho 2 học sinh lên bảng hoàn thành bảng giá trị.'
          },
          {
            id: 'slide_8_1_6',
            type: 'summary',
            title: 'TỔNG KẾT TIẾT 1 & NHIỆM VỤ TIẾT 2',
            subtitle: 'Ghi nhớ kiến thức nền tảng',
            content: [
              '3 Cổng logic nền tảng: NOT (đảo), AND (tất cả đều 1), OR (chỉ cần một số 1).',
              'Bảng chân lý là công cụ kiểm chứng giá trị logic của mạch.',
              'Chuẩn bị Tiết 2: Kết hợp các cổng cơ bản để thiết kế mạch phức hợp và bộ cộng nhị phân.'
            ],
            notes: 'Dặn dò học sinh xem trước phần kết hợp mạch logic trong sách giáo khoa.'
          }
        ],
        questions: [
          {
            id: 'q_tin8_1_01',
            type: 'multiple_choice',
            bloomLevel: 'Nhận biết',
            questionText: 'Cổng logic nào chỉ cho đầu ra bằng 1 khi TẤT CẢ các đầu vào đều bằng 1?',
            options: {
              A: 'Cổng OR (Hoặc)',
              B: 'Cổng AND (Và)',
              C: 'Cổng NOT (Đảo)',
              D: 'Cổng XOR'
            },
            correctAnswer: 'B',
            explanation: 'Cổng AND (phép nhân logic) chỉ cho giá trị 1 khi toàn bộ các ngõ vào đều đạt mức 1.'
          },
          {
            id: 'q_tin8_1_02',
            type: 'multiple_choice',
            bloomLevel: 'Thông hiểu',
            questionText: 'Cho tín hiệu đầu vào A = 0, B = 1. Giá trị đầu ra của cổng OR (A OR B) là bao nhiêu?',
            options: {
              A: '0',
              B: '1',
              C: 'Không xác định',
              D: '-1'
            },
            correctAnswer: 'B',
            explanation: 'Với cổng OR, chỉ cần ít nhất một đầu vào bằng 1 thì đầu ra sẽ bằng 1 (0 OR 1 = 1).'
          }
        ]
      },
      {
        periodNumber: 2,
        title: 'Tiết 2: Ghép nối mạch logic phức hợp & Ứng dụng thực tế',
        objectives: [
          'Biết cách ghép nối các cổng NOT, AND, OR để tạo mạch logic phức hợp',
          'Vẽ sơ đồ mạch logic từ biểu thức toán học cho trước',
          'Giải thích được nguyên lý hoạt động của mạch cộng nhị phân nửa (Half Adder)'
        ],
        keyKnowledge: 'Ghép các cổng logic cơ bản tạo thành mạch tổ hợp thực hiện các phép toán số học trong CPU.',
        slides: [
          {
            id: 'slide_8_2_0',
            type: 'title',
            title: 'TIN HỌC 8 - BÀI 8: MẠCH LOGIC (TIẾT 2)',
            subtitle: 'Mạch logic phức hợp & Mạch cộng nhị phân nửa (Half Adder)',
            content: [
              'Ôn tập Tiết 1: Bảng chân lý AND, OR, NOT',
              'Mục 1: Mạch logic phức hợp (Ghép nối nhiều cổng)',
              'Mục 2: Thiết kế mạch cộng nhị phân nửa (Half Adder)',
              'Thực hành mô phỏng & Đánh giá năng lực'
            ],
            notes: 'Khởi động bằng câu hỏi ôn nhanh bảng chân lý Tiết 1.'
          },
          {
            id: 'slide_8_2_1',
            type: 'concept',
            title: '1. GHÉP NỐI MẠCH LOGIC PHỨC HỢP',
            subtitle: 'Từ biểu thức đại số logic đến sơ đồ mạch điện tử',
            content: [
              'Biểu thức logic ví dụ: Y = (A AND B) OR (NOT C).',
              'Quy tắc tính toán: Thực hiện phép trong ngoặc và phép NOT trước, sau đó đến AND, cuối cùng là OR.',
              'Mỗi phép toán tương ứng với một cổng logic vật lý trên chip bán dẫn.'
            ],
            notes: 'Hướng dẫn học sinh phân tích từng tầng tín hiệu (layer) từ trái qua phải.'
          },
          {
            id: 'slide_8_2_2',
            type: 'concept',
            title: '2. MẠCH CỘNG NHỊ PHÂN NỬA (HALF ADDER)',
            subtitle: 'Trái tim tính toán của bộ xử lý CPU máy tính',
            content: [
              'Cộng 2 bit nhị phân A và B cho ra 2 tín hiệu: Tổng S (Sum) và Nhớ C (Carry).',
              'Quy tắc cộng nhị phân: 0+0=0 (nhớ 0) | 0+1=1 (nhớ 0) | 1+0=1 (nhớ 0) | 1+1=0 (nhớ 1).',
              'Cổng AND tạo tín hiệu nhớ C (C = A AND B).',
              'Cổng XOR tạo tín hiệu tổng S (S = A XOR B).'
            ],
            notes: 'Minh họa phép cộng 1 + 1 = 10 trong hệ nhị phân.'
          },
          {
            id: 'slide_8_2_3',
            type: 'activity',
            title: 'THỰC HÀNH TỔNG HỢP: TÌNH HUỐNG HỆ THỐNG AN NINH',
            subtitle: 'Vận dụng mạch logic vào đời sống thực tế',
            content: [
              'Tình huống: Một căn phòng bảo mật phát chuông báo động (Y = 1) khi:',
              '- Ban đêm (D = 1) VÀ phát hiện chuyển động (M = 1), HOẶC',
              '- Nút khẩn cấp bị nhấn (E = 1).',
              'Hãy viết biểu thức logic Y theo các biến D, M, E và vẽ sơ đồ cổng logic tương ứng!'
            ],
            notes: 'Cho các nhóm học sinh thảo luận 3 phút và trình bày biểu thức.'
          },
          {
            id: 'slide_8_2_4',
            type: 'summary',
            title: 'CHUẨN HÓA TOÀN BÀI 8 (GHI VỞ)',
            subtitle: 'Đúc kết kiến thức 2 tiết Bài 8',
            content: [
              'Khái niệm: Tín hiệu nhị phân 0 và 1 là ngôn ngữ cơ bản của máy tính.',
              '3 Cổng logic cơ bản: NOT, AND, OR.',
              'Mạch logic phức hợp: Kết hợp nhiều cổng để xử lý các điều kiện phức tạp.',
              'Ứng dụng: Xây dựng bộ vi xử lý (CPU), hệ thống điều khiển tự động và robot thông minh.'
            ],
            notes: 'Khép lại bài học, liên hệ tới bài học kế tiếp về hệ điều hành.'
          }
        ],
        questions: [
          {
            id: 'q_tin8_2_01',
            type: 'multiple_choice',
            bloomLevel: 'Vận dụng',
            questionText: 'Trong phép cộng 2 bit nhị phân 1 + 1, giá trị của bit Tổng (Sum) và bit Nhớ (Carry) lần lượt là:',
            options: {
              A: 'Tổng = 1, Nhớ = 0',
              B: 'Tổng = 0, Nhớ = 1',
              C: 'Tổng = 1, Nhớ = 1',
              D: 'Tổng = 2, Nhớ = 0'
            },
            correctAnswer: 'B',
            explanation: 'Trong hệ nhị phân: 1 + 1 = 10 (tức là bit Tổng bằng 0 và bit Nhớ chuyển sang hàng tiếp theo bằng 1).'
          },
          {
            id: 'q_tin8_2_02',
            type: 'multiple_choice',
            bloomLevel: 'Vận dụng cao',
            questionText: 'Biểu thức logic Y = (A AND B) OR C sẽ có giá trị Y = 1 khi nào?',
            options: {
              A: 'Chỉ khi cả A, B và C đều bằng 1',
              B: 'Khi C = 1 (không phụ thuộc vào A và B)',
              C: 'Chỉ khi C = 0',
              D: 'Khi cả A = 0 và B = 0 và C = 0'
            },
            correctAnswer: 'B',
            explanation: 'Vì phép toán ngoài cùng là cổng OR C, nên chỉ cần C = 1 thì kết quả toàn bộ biểu thức Y chắc chắn bằng 1.'
          }
        ]
      }
    ]
  },

  // 3. LỚP 6 - BÀI 7: TÌM KIẾM THÔNG TIN TRÊN INTERNET (2 TIẾT)
  {
    id: 'lesson_tin6_bai07',
    subject: 'Tin học',
    grade: 6,
    lessonNumber: 7,
    title: 'Tìm kiếm thông tin trên Internet',
    shortTitle: 'Bài 7: Tìm kiếm thông tin',
    periodsCount: 2,
    teacherName: 'Thầy Trần Đức Tình',
    school: 'THCS Đắk Trôi',
    createdAt: '2026-11-18T10:00:00.000Z',
    updatedAt: '2026-11-22T21:00:00.000Z',
    slideCount: 12,
    status: 'completed',
    version: '1.0',
    description: 'Máy tìm kiếm, từ khóa tìm kiếm và các kỹ năng thu thập, đánh giá độ tin cậy của thông tin trên mạng.',
    isCoreLesson: false,
    periods: [
      {
        periodNumber: 1,
        title: 'Tiết 1: Máy tìm kiếm và Kỹ thuật chọn từ khóa',
        objectives: [
          'Nêu được công dụng của máy tìm kiếm (Search Engine)',
          'Biết cách xác định từ khóa ngắn gọn, chính xác',
          'Sử dụng dấu ngoặc kép để tìm kiếm cụm từ chính xác'
        ],
        keyKnowledge: 'Máy tìm kiếm là website đặc biệt giúp tìm thông tin dựa trên từ khóa người dùng nhập vào.',
        slides: [
          {
            id: 'slide_6_7_1',
            type: 'title',
            title: 'TIN HỌC 6 - BÀI 7: TÌM KIẾM THÔNG TIN TRÊN INTERNET',
            subtitle: 'Tiết 1: Máy tìm kiếm & Kỹ thuật chọn từ khóa thông minh',
            content: [
              'Khởi động: Thử thách tìm kiếm thông tin nhanh',
              'Mục 1: Máy tìm kiếm là gì?',
              'Mục 2: Cách lựa chọn từ khóa hiệu quả',
              'Luyện tập & Thực hành tìm kiếm'
            ]
          },
          {
            id: 'slide_6_7_2',
            type: 'concept',
            title: 'MÁY TÌM KIẾM (SEARCH ENGINE)',
            subtitle: 'Công cụ tra cứu thông tin khổng lồ',
            content: [
              'Máy tìm kiếm là trang web giúp tìm kiếm thông tin trên Internet theo yêu cầu.',
              'Các máy tìm kiếm phổ biến: Google, Bing, Yahoo, Cốc Cốc.',
              'Kết quả trả về gồm: Tiêu đề trang, đoạn trích ngắn và đường link truy cập.'
            ]
          }
        ],
        questions: [
          {
            id: 'q_tin6_7_01',
            type: 'multiple_choice',
            bloomLevel: 'Nhận biết',
            questionText: 'Đâu KHÔNG PHẢI là một máy tìm kiếm trên Internet?',
            options: {
              A: 'Google (google.com)',
              B: 'Bing (bing.com)',
              C: 'Microsoft Word',
              D: 'Cốc Cốc (coccoc.com)'
            },
            correctAnswer: 'C',
            explanation: 'Microsoft Word là phần mềm soạn thảo văn bản offline, không phải là máy tìm kiếm trực tuyến.'
          }
        ]
      },
      {
        periodNumber: 2,
        title: 'Tiết 2: Đánh giá độ tin cậy & An toàn thông tin',
        objectives: [
          'Biết cách đánh giá độ tin cậy của thông tin tìm được',
          'Nhận biết các nguồn tin chính thống và tin rác/tin giả',
          'Tuân thủ bản quyền và quy tắc an toàn thông tin'
        ],
        keyKnowledge: 'Luôn đối chiếu thông tin từ nhiều nguồn chính thống uy tín trước khi sử dụng.',
        slides: [
          {
            id: 'slide_6_7_3',
            type: 'title',
            title: 'TIN HỌC 6 - BÀI 7: TIẾT 2',
            subtitle: 'Đánh giá độ tin cậy của nguồn thông tin trên Internet',
            content: [
              'Tiêu chí đánh giá tác giả và cơ quan xuất bản',
              'Cách phân biệt website chính phủ (.gov), giáo dục (.edu)',
              'Thực hành kiểm chứng thông tin thực tế'
            ]
          }
        ],
        questions: [
          {
            id: 'q_tin6_7_02',
            type: 'multiple_choice',
            bloomLevel: 'Vận dụng',
            questionText: 'Tên miền nào sau đây thường đại diện cho các tổ chức giáo dục đáng tin cậy?',
            options: {
              A: '.edu.vn',
              B: '.xyz',
              C: '.info',
              D: '.top'
            },
            correctAnswer: 'A',
            explanation: 'Đuôi tên miền .edu (Education) được cấp cho các trường học và tổ chức giáo dục chính quy.'
          }
        ]
      }
    ]
  },

  // 4. LỚP 7 - BÀI 3: QUẢN LÝ DỮ LIỆU TRONG BẢNG TÍNH (2 TIẾT)
  {
    id: 'lesson_tin7_bai03',
    subject: 'Tin học',
    grade: 7,
    lessonNumber: 3,
    title: 'Quản lý dữ liệu trong bảng tính điện tử',
    shortTitle: 'Bài 3: Quản lý bảng tính',
    periodsCount: 2,
    teacherName: 'Thầy Trần Đức Tình',
    school: 'THCS Đắk Trôi',
    createdAt: '2026-11-17T08:30:00.000Z',
    updatedAt: '2026-11-22T21:10:00.000Z',
    slideCount: 12,
    status: 'completed',
    version: '1.0',
    description: 'Thao tác sắp xếp dữ liệu, lọc dữ liệu có điều kiện và trình bày bảng tính Excel khoa học.',
    isCoreLesson: false,
    periods: [
      {
        periodNumber: 1,
        title: 'Tiết 1: Sắp xếp dữ liệu trong bảng tính',
        objectives: [
          'Biết mục đích của việc sắp xếp dữ liệu',
          'Thực hiện thành thạo sắp xếp tăng dần và giảm dần',
          'Tránh các lỗi sai chọn vùng dữ liệu khi sắp xếp'
        ],
        keyKnowledge: 'Sắp xếp dữ liệu giúp dễ dàng so sánh, tra cứu và tìm kiếm thông tin nhanh chóng.',
        slides: [
          {
            id: 'slide_7_3_1',
            type: 'title',
            title: 'TIN HỌC 7 - BÀI 3: QUẢN LÝ DỮ LIỆU BẢNG TÍNH',
            subtitle: 'Tiết 1: Kỹ thuật sắp xếp dữ liệu chuyên nghiệp',
            content: [
              'Khởi động: Sắp xếp bảng điểm thi đua lớp',
              'Quy trình sắp xếp thứ tự Tăng dần (A-Z, 0-9)',
              'Quy trình sắp xếp thứ tự Giảm dần (Z-A, 9-0)',
              'Lưu ý quan trọng về vùng chọn dữ liệu'
            ]
          }
        ],
        questions: [
          {
            id: 'q_tin7_3_01',
            type: 'multiple_choice',
            bloomLevel: 'Nhận biết',
            questionText: 'Trong phần mềm bảng tính, công cụ Sort A to Z dùng để làm gì?',
            options: {
              A: 'Sắp xếp dữ liệu theo thứ tự tăng dần',
              B: 'Sắp xếp dữ liệu theo thứ tự giảm dần',
              C: 'Xóa toàn bộ dữ liệu từ A đến Z',
              D: 'Đổi phông chữ từ hoa sang thường'
            },
            correctAnswer: 'A',
            explanation: 'Sort A to Z (hoặc Sort Smallest to Largest) là lệnh sắp xếp tăng dần.'
          }
        ]
      },
      {
        periodNumber: 2,
        title: 'Tiết 2: Lọc dữ liệu theo tiêu chí (Filter)',
        objectives: [
          'Hiểu công dụng của bộ lọc dữ liệu tự động AutoFilter',
          'Thiết lập điều kiện lọc dữ liệu theo số và theo chữ',
          'Thực hành lọc danh sách học sinh đạt học lực Xuất sắc'
        ],
        keyKnowledge: 'Lọc dữ liệu là chọn và hiển thị các hàng thỏa mãn các tiêu chuẩn nhất định.',
        slides: [
          {
            id: 'slide_7_3_2',
            type: 'title',
            title: 'TIN HỌC 7 - BÀI 3: TIẾT 2',
            subtitle: 'Lọc dữ liệu có điều kiện (Filter)',
            content: [
              'Khái niệm bộ lọc dữ liệu (Filter)',
              'Các bước kích hoạt nút lọc tam giác',
              'Thực hành lọc danh sách học sinh đạt điểm Giỏi'
            ]
          }
        ],
        questions: [
          {
            id: 'q_tin7_3_02',
            type: 'multiple_choice',
            bloomLevel: 'Thông hiểu',
            questionText: 'Sau khi thực hiện lọc dữ liệu, những hàng không thỏa mãn điều kiện sẽ như thế nào?',
            options: {
              A: 'Bị xóa vĩnh viễn khỏi bảng tính',
              B: 'Tạm thời bị ẩn đi, không bị xóa',
              C: 'Chuyển sang màu đỏ',
              D: 'Tự động sao chép sang Sheet mới'
            },
            correctAnswer: 'B',
            explanation: 'Lọc dữ liệu chỉ ẩn tạm thời các hàng không thỏa tiêu chuẩn, dữ liệu gốc hoàn toàn còn nguyên.'
          }
        ]
      }
    ]
  },

  // 5. LỚP 9 - BÀI 5: TRÍ TUỆ NHÂN TẠO VÀ ỨNG DỤNG (2 TIẾT)
  {
    id: 'lesson_tin9_bai05',
    subject: 'Tin học',
    grade: 9,
    lessonNumber: 5,
    title: 'Trí tuệ nhân tạo và ứng dụng trong đời sống',
    shortTitle: 'Bài 5: Trí tuệ nhân tạo (AI)',
    periodsCount: 2,
    teacherName: 'Thầy Trần Đức Tình',
    school: 'THCS Đắk Trôi',
    createdAt: '2026-11-19T14:00:00.000Z',
    updatedAt: '2026-11-22T21:40:00.000Z',
    slideCount: 14,
    status: 'completed',
    version: '1.1',
    description: 'Khái niệm trí tuệ nhân tạo (AI), học máy, các ứng dụng của AI trong y tế, giáo dục, giao thông và đạo đức AI.',
    isCoreLesson: false,
    periods: [
      {
        periodNumber: 1,
        title: 'Tiết 1: Khái niệm Trí tuệ nhân tạo và Năng lực của AI',
        objectives: [
          'Nêu được khái niệm sơ lược về Trí tuệ nhân tạo (AI)',
          'Nhận biết được các khả năng đặc trưng của AI: nhận dạng giọng nói, thị giác máy tính, xử lý ngôn ngữ',
          'Phân biệt được phần mềm truyền thống và hệ thống AI học từ dữ liệu'
        ],
        keyKnowledge: 'Trí tuệ nhân tạo là khả năng của máy tính thực hiện các tác vụ vốn đòi hỏi trí tuệ của con người.',
        slides: [
          {
            id: 'slide_9_5_1',
            type: 'title',
            title: 'TIN HỌC 9 - BÀI 5: TRÍ TUỆ NHÂN TẠO (AI)',
            subtitle: 'Tiết 1: Khái niệm AI và Các năng lực vượt trội của máy tính thông minh',
            content: [
              'Khởi động: Trải nghiệm trợ lý ảo và nhận diện khuôn mặt',
              'Mục 1: Trí tuệ nhân tạo (AI) là gì?',
              'Mục 2: Máy tính học như thế nào? (Machine Learning)',
              'Thảo luận: AI đã vượt con người ở những lĩnh vực nào?'
            ]
          }
        ],
        questions: [
          {
            id: 'q_tin9_5_01',
            type: 'multiple_choice',
            bloomLevel: 'Nhận biết',
            questionText: 'Trí tuệ nhân tạo (Artificial Intelligence - AI) là gì?',
            options: {
              A: 'Là một loại vi mạch xử lý siêu nhanh sản xuất tại Mỹ',
              B: 'Là khả năng của máy tính thực hiện các tác vụ thông minh vốn đòi hỏi trí tuệ con người',
              C: 'Là một robot hình người biết khiêu vũ',
              D: 'Là chiếc màn hình cảm ứng độ phân giải 8K'
            },
            correctAnswer: 'B',
            explanation: 'AI là ngành khoa học máy tính hướng tới việc tạo ra các hệ thống có khả năng tư duy, học hỏi và giải quyết vấn đề như con người.'
          }
        ]
      },
      {
        periodNumber: 2,
        title: 'Tiết 2: Ứng dụng thực tế & Đạo đức sử dụng AI',
        objectives: [
          'Kể tên được các ứng dụng AI trong y tế, giao thông xe tự hành, giáo dục',
          'Nhận thức được các thách thức về việc làm, quyền riêng tư và bản quyền',
          'Xây dựng thái độ sử dụng AI văn minh, có trách nhiệm và liêm chính học thuật'
        ],
        keyKnowledge: 'Sử dụng AI như một công cụ hỗ trợ sáng tạo, không lạm dụng để gian lận hay làm xói mòn tư duy phản biện.',
        slides: [
          {
            id: 'slide_9_5_2',
            type: 'title',
            title: 'TIN HỌC 9 - BÀI 5: TIẾT 2',
            subtitle: 'Ứng dụng thực tiễn & Đạo đức sử dụng Trí tuệ nhân tạo',
            content: [
              'AI trong chẩn đoán y tế và phát triển thuốc mới',
              'Xe tự lái và hệ thống giao thông đô thị thông minh',
              'Đạo đức AI: Liêm chính học thuật và bảo vệ dữ liệu cá nhân'
            ]
          }
        ],
        questions: [
          {
            id: 'q_tin9_5_02',
            type: 'multiple_choice',
            bloomLevel: 'Vận dụng',
            questionText: 'Hành vi nào sau đây là sử dụng AI có trách nhiệm và đúng đắn trong học tập?',
            options: {
              A: 'Nhờ AI viết toàn bộ bài văn rồi nộp cho cô giáo chấm điểm',
              B: 'Dùng AI để gợi mở ý tưởng, giải thích khái niệm khó hiểu và tự hoàn thành bài làm',
              C: 'Dùng AI tạo ảnh giả mạo người khác để đăng lên mạng xã hội',
              D: 'Chép nguyên văn câu trả lời của AI vào bài kiểm tra'
            },
            correctAnswer: 'B',
            explanation: 'Sử dụng AI có trách nhiệm là coi AI như một người trợ giảng giúp gợi mở ý tưởng, học sinh vẫn phải tự mình tư duy và sáng tạo.'
          }
        ]
      }
    ]
  }
];

// Sample Knowledge Templates for Quick Testing in Creator Wizard
export const SAMPLE_CURRICULUM_KNOWLEDGE = {
  GRADE_8_BAI_7: {
    subject: 'Tin học',
    grade: 8,
    lessonNumber: 7,
    title: 'Trực quan hoá dữ liệu (Trình bày dữ liệu bằng biểu đồ)',
    periodsCount: 2,
    rawText: `BÀI 7: TRỰC QUAN HOÁ DỮ LIỆU (TIN HỌC 8 - BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG)

I. MỤC TIÊU CẦN ĐẠT:
- Nêu được một số tình huống thực tế cần sử dụng chức năng tạo biểu đồ.
- Hiểu ý nghĩa của 3 loại biểu đồ thông dụng: Biểu đồ cột (so sánh đại lượng), Biểu đồ hình quạt tròn (so sánh tỉ lệ % trong tổng thể), Biểu đồ đoạn thẳng (quan sát xu hướng biến thiên theo thời gian).
- Thực hiện được các thao tác tạo và định dạng biểu đồ trong phần mềm bảng tính Excel.

II. NỘI DUNG 2 TIẾT:
TIẾT 1: TRỰC QUAN HOÁ DỮ LIỆU VÀ CÁC LOẠI BIỂU ĐỒ
1. Khái niệm: Trực quan hoá dữ liệu là cách trình bày dữ liệu dưới dạng biểu đồ đồ hoạ giúp dễ so sánh, nhận định xu hướng thay đổi.
2. Các loại biểu đồ cơ bản:
- Biểu đồ cột: So sánh dữ liệu giữa các đối tượng độc lập.
- Biểu đồ hình quạt tròn: So sánh các phần trên toàn bộ tổng thể (tỉ lệ %).
- Biểu đồ đoạn thẳng: Quan sát xu hướng tăng giảm theo mốc thời gian.

TIẾT 2: THỰC HÀNH TẠO VÀ ĐỊNH DẠNG BIỂU ĐỒ (TT)
1. Nhiệm vụ 1: Tạo biểu đồ cột (Clustered Column) khảo sát nội dung Tin học học sinh 8A quan tâm.
- Quy trình 4 bước: Chọn vùng B2:C8 -> Thẻ Insert -> Nhóm Charts -> Chọn Clustered Column.
- Bổ sung thành phần qua nút Chart Elements (+): Chart Title, Axis Titles, Data Labels.
2. Nhiệm vụ 2: Tạo biểu đồ hình quạt tròn (Pie Chart) và định dạng hiển thị tỉ lệ phần trăm (%) qua ngăn Format Data Labels -> tích Percentage.
3. Nhiệm vụ 3: Mở tệp TGSDThietbiso.xlsx, tính hàm =SUM() và vẽ biểu đồ phân tích xu hướng thời gian dùng thiết bị số khối 8.
4. Vận dụng: Vẽ biểu đồ đoạn thẳng doanh thu công nghiệp phần mềm Việt Nam 2016-2020.`
  },

  GRADE_8_BAI_8: {
    subject: 'Tin học',
    grade: 8,
    lessonNumber: 8,
    title: 'Mạch logic và cổng logic cơ bản',
    periodsCount: 2,
    rawText: `BÀI 8: MẠCH LOGIC VÀ CỔNG LOGIC CƠ BẢN (TIN HỌC 8 - BỘ SÁCH KẾT NỐI TRI THỨC)

I. MỤC TIÊU BÀI HỌC:
- Biết được tín hiệu số chỉ nhận hai mức logic: 0 (Thấp / Sai / False) và 1 (Cao / Đúng / True).
- Nhận biết được ký hiệu, nguyên lý hoạt động và lập bảng chân lý cho 3 cổng logic cơ bản: NOT, AND, OR.
- Biết cách ghép nối các cổng cơ bản thành mạch logic phức hợp.
- Hiểu được nguyên lý của mạch cộng nhị phân nửa (Half Adder) - nền tảng tính toán số học của vi xử lý CPU.

II. NỘI DUNG PHÂN BỔ 2 TIẾT HỌC:
TIẾT 1: TÍN HIỆU NHỊ PHÂN VÀ 3 CỔNG LOGIC CƠ BẢN
1. Tín hiệu nhị phân:
- Máy tính chỉ hiểu hai trạng thái điện áp: Có điện (1) hoặc Không có điện (0).
- Dữ liệu âm thanh, hình ảnh, văn bản đều được số hóa thành dãy bit 0 và 1.

2. Cổng logic NOT (Đảo):
- Có 1 đầu vào A, 1 đầu ra Y = NOT A.
- Nếu A = 0 thì Y = 1. Nếu A = 1 thì Y = 0.

3. Cổng logic AND (Và):
- Có 2 đầu vào A, B; 1 đầu ra Y = A AND B.
- Đầu ra Y chỉ bằng 1 khi cả A = 1 VÀ B = 1. Chỉ cần một đầu vào bằng 0 thì Y = 0.

4. Cổng logic OR (Hoặc):
- Có 2 đầu vào A, B; 1 đầu ra Y = A OR B.
- Đầu ra Y bằng 1 khi có ít nhất một đầu vào bằng 1. Chỉ khi cả A = 0 và B = 0 thì Y = 0.

TIẾT 2: GHÉP NỐI MẠCH PHỨC HỢP VÀ MẠCH CỘNG NHỊ PHÂN NỬA
1. Mạch logic phức hợp:
- Kết hợp các cổng NOT, AND, OR theo biểu thức đại số logic.
- Ví dụ: Y = (A AND B) OR (NOT C). Thực hiện trong ngoặc trước, NOT trước AND/OR.

2. Mạch cộng nhị phân nửa (Half Adder):
- Cộng 2 bit nhị phân A và B:
  + 0 + 0 = 0 (Tổng S = 0, Nhớ C = 0)
  + 0 + 1 = 1 (Tổng S = 1, Nhớ C = 0)
  + 1 + 0 = 1 (Tổng S = 1, Nhớ C = 0)
  + 1 + 1 = 10 (Tổng S = 0, Nhớ C = 1)
- Tín hiệu Nhớ C được sinh ra bởi cổng AND: C = A AND B.
- Tín hiệu Tổng S được sinh ra bởi cổng XOR: S = A XOR B.

3. Hoạt động vận dụng thực tế: Thiết kế hệ thống cảnh báo an ninh gia đình.`
  },

  GRADE_6_BAI_7: {
    subject: 'Tin học',
    grade: 6,
    lessonNumber: 7,
    title: 'Tìm kiếm thông tin trên Internet',
    periodsCount: 2,
    rawText: `BÀI 7: TÌM KIẾM THÔNG TIN TRÊN INTERNET (TIN HỌC 6)

I. MỤC TIÊU:
- Nêu được công dụng của máy tìm kiếm.
- Biết cách chọn từ khóa tìm kiếm ngắn gọn, chính xác.
- Sử dụng dấu ngoặc kép "..." để tìm cụm từ chính xác.
- Đánh giá được độ tin cậy của thông tin tìm thấy trên mạng.

II. NỘI DUNG 2 TIẾT:
Tiết 1: Máy tìm kiếm và kỹ thuật chọn từ khóa (Google, Bing, dấu ngoặc kép, từ khóa trọng tâm).
Tiết 2: Đánh giá độ tin cậy nguồn tin (.gov, .edu, tác giả, kiểm chứng chéo, an toàn số).`
  }
};

export const sampleRawTexts = SAMPLE_CURRICULUM_KNOWLEDGE;
