# 🌐 WEBBY AI – INTERACTIVE GLOBAL INTERNET WORLD
### Hệ thống nhân vật AI giao tiếp bằng giọng nói cho tiết thao giảng Tin học 6
**Bài học:** Bài 6: Mạng thông tin toàn cầu (World Wide Web)  
**Đối tượng:** Học sinh lớp 6 (11–12 tuổi)  
**Công nghệ:** React 18, Vite, Three.js 3D, Web Speech API (vi-VN), Express.js, Google Gemini API.

---

## 🚀 1. TỔNG QUAN DỰ ÁN

**WEBBY AI** là hệ thống trợ lý AI 3D thế hệ mới dành cho tiết thao giảng môn Tin học 6 (Bài 6: Mạng thông tin toàn cầu - World Wide Web).

### Các điểm nâng cấp đột phá:
1. **Trò chuyện liên tục 2 chiều (Continuous Real-time AI Agent):**
   - Giáo viên chỉ cần nhấn **"BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC"** đúng một lần.
   - WEBBY tự động chào hỏi -> tự động chuyển sang lắng nghe (`LISTENING`).
   - Học sinh đặt câu hỏi bằng giọng nói tự nhiên, không cần bất kỳ ai phải bấm giữ nút micro.
   - Hệ thống tự động nhận biết câu nói kết thúc qua thuật toán phát hiện khoảng lặng (Silence Detection & VAD).
   - WEBBY suy nghĩ (`THINKING`), phản hồi bằng giọng nói tiếng Việt và cử động môi 3D (`SPEAKING`).
   - Khi WEBBY nói xong, hệ thống **tự động quay lại chế độ lắng nghe** để học sinh tiếp tục hỏi câu tiếp theo. Cuộc trò chuyện diễn ra tự nhiên, không ngắt quãng!
   - Tích hợp cơ chế **chống thu ngược âm thanh (Echo Suppression)**: Tự động ngắt mic khi Webby đang nói để tránh lặp âm.

2. **Chuẩn hóa Responsive 100% không tràn màn hình:**
   - Hoàn toàn vừa vặn trong Viewport 16:9 ở mọi độ phân giải máy chiếu và laptop trường học:
     - `1920 × 1080` (Full HD)
     - `1600 × 900` (HD+)
     - `1366 × 768` (Laptop & Máy chiếu phổ thông)
     - `1280 × 720` (Chuẩn 720p)
   - Tuyệt đối không xuất hiện thanh cuộn ngang hay thanh cuộn dọc trong chế độ trình chiếu.
   - Nhân vật 3D Webby tự động co giãn linh hoạt (`max-h-[38vh]`), không bị cắt đầu, thân hay các vòng đệm.
   - Khung phụ đề và phím điều khiển luôn hiển thị trọn vẹn trong vùng nhìn thấy.

---

## 📁 2. CẤU TRÚC THƯ MỤC

```
thaogiang/
├── .env                  # Tệp cấu hình biến môi trường (PORT, GEMINI_API_KEY)
├── .env.example          # Tệp mẫu hướng dẫn cấu hình
├── package.json          # Quản lý thư viện frontend & backend
├── vite.config.js        # Cấu hình Vite & Proxy API backend
├── tailwind.config.js    # Cấu hình giao diện Futuristic Cyan & Navy
├── index.html            # Khởi tạo HTML với phông chữ Be Vietnam Pro & Orbitron
├── server/
│   └── index.js          # Backend Express: kết nối Gemini API & Smart Local Rule Fallback
├── src/
│   ├── main.jsx          # Entry point của React
│   ├── App.jsx           # Điều phối trạng thái nhân vật, giọng nói, kịch bản
│   ├── index.css         # Định dạng Tailwind & hiệu ứng ánh sáng neon
│   ├── components/
│   │   ├── Avatar/
│   │   │   └── WebbyAvatar.jsx      # Nhân vật 3D Webby với bộ khung cử động & biểu cảm
│   │   ├── Globe/
│   │   │   └── GlobeScene.jsx       # Quả địa cầu 3D với luồng dữ liệu Internet toàn cầu
│   │   ├── Subtitle/
│   │   │   └── SubtitleDisplay.jsx  # Hộp phụ đề cỡ lớn tối ưu máy chiếu, tô sáng từ khóa
│   │   ├── VoiceControl/
│   │   │   └── VoiceControlBar.jsx  # Nút Micro, Nghe lại, Tạm dừng, Nhập văn bản dự phòng
│   │   ├── TeacherPanel/
│   │   │   └── TeacherPanel.jsx     # Bảng điều khiển ẩn/hiện dành riêng cho giáo viên đứng lớp
│   │   └── IntroBanner/
│   │       └── IntroBanner.jsx      # Bảng chào mừng chuyển cảnh hoành tráng vào Bài 6
│   ├── services/
│   │   ├── aiService.js             # Dịch vụ gọi API Gemini hoặc phản hồi thông minh nội bộ
│   │   ├── speechRecognition.js     # Nhận dạng giọng nói tiếng Việt Web Speech API
│   │   └── speechSynthesis.js       # Phát âm giọng đọc tiếng Việt & mô phỏng cử động môi
│   └── data/
│       ├── lessonKnowledge.json     # Bộ kiến thức chuẩn Bài 6 (FAQ & 6 chủ đề SGK)
│       └── conversationScripts.json # Kịch bản 4 bước khởi động mặc định & phản hồi mẫu
```

---

## ⚙️ 3. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY

### Bước 1: Khởi chạy máy chủ phát triển
Mở terminal PowerShell tại thư mục dự án và chạy:

```bash
npm run dev
```

Lệnh này sẽ khởi động đồng thời cả 2 dịch vụ:
- **Backend API (Node/Express):** `http://localhost:3001`
- **Frontend App (Vite React):** `http://localhost:5173`

Mở trình duyệt **Google Chrome** hoặc **Microsoft Edge** và truy cập:
👉 `http://localhost:5173`

---

## 🔑 4. CẤU HÌNH GEMINI API & CHẾ ĐỘ OFFLINE

Mở tệp `.env` trong thư mục gốc:

```env
PORT=3001
GEMINI_API_KEY=AIzaSy... (Điền khóa API miễn phí từ Google AI Studio nếu có)
GEMINI_MODEL=gemini-1.5-flash
```

> **🛡️ Lưu ý quan trọng cho giáo viên:**
> - Nếu **không điền API Key**, ứng dụng sẽ **tự động chuyển sang chế độ Smart Offline Mode**.
> - Trong chế độ Smart Offline, WEBBY vẫn trả lời chính xác, thông minh, đúng trọng tâm SGK cho tất cả các câu hỏi của học sinh nhờ bộ dữ liệu `lessonKnowledge.json` tích hợp sẵn.
> - Khi phòng học mất mạng Internet, hệ thống vẫn hoạt động 100% trơn tru, không lo gián đoạn tiết thao giảng!

---

## 👨‍🏫 5. HƯỚNG DẪN THAO TÁC TRONG TIẾT THAO GIẢNG

### 1. Phím tắt tiện lợi cho giáo viên:
- **`F2`**: Bật / Tắt nhanh **Bảng điều khiển giáo viên** (ở góc phải màn hình).
- **`F11`**: Bật chế độ **Toàn màn hình trình chiếu** (Full Screen 16:9).
- **`Esc`**: Đóng bảng chúc mừng vào bài hoặc đóng bảng điều khiển.

### 2. Quy trình kịch bản khởi động mẫu (5 – 7 phút đầu tiết):
1. **Bước 1 – Giới thiệu & Thách đố:**
   - Giáo viên nhấn nút **BẮT ĐẦU** hoặc nút **Khởi động** trên Bảng điều khiển.
   - WEBBY tự động chào: *"Xin chào các bạn học sinh lớp 6! Xin chào thầy cô giáo! Mình là WEBBY, đại sứ đến từ thế giới Mạng thông tin toàn cầu..."*
2. **Bước 2 – Thảo luận tình huống 1 (Gửi thư ra nước ngoài):**
   - WEBBY hỏi: *"Nếu muốn gửi một bức thư đến một người bạn đang sống ở một quốc gia rất xa, các bạn sẽ phải làm thế nào để thông tin đến được với người đó thật nhanh?"*
   - Giáo viên mời 1 học sinh đứng dậy phát biểu hoặc nhấn nút **BẬT MICRO ĐẶT CÂU HỎI**.
   - Học sinh nói: *"Thưa thầy, gửi qua email hoặc nhắn tin Zalo, Facebook ạ!"*
   - WEBBY khen ngợi hào hứng (`HAPPY`) và giải thích vai trò của Internet.
3. **Bước 3 – Thảo luận tình huống 2 (Xem tin tức, video toàn cầu):**
   - WEBBY hỏi: *"Thế nếu các bạn muốn xem hình ảnh về một đất nước, đọc một bài viết khoa học hoặc xem một video cách hàng nghìn cây số, chúng ta làm bằng cách nào?"*
   - Học sinh trả lời: *"Vào Google, xem YouTube hoặc mở trình duyệt web ạ!"*
   - WEBBY nhận xét chuẩn xác và tóm tắt kết nối thông tin.
4. **Bước 4 – Dẫn vào bài học:**
   - Giáo viên bấm nút **KẾT THÚC KHỞI ĐỘNG - VÀO BÀI 6!**.
   - WEBBY tổng kết: *"Các bạn thấy không, nhờ Internet, chúng ta có thể kết nối và tiếp cận một thế giới thông tin vô cùng rộng lớn... Và bây giờ, xin kính mời thầy cô đưa các bạn đến với bài học: Mạng thông tin toàn cầu!"*
   - Hiệu ứng Quả địa cầu tăng tốc xoay (`warp speed`), pháo hoa điện tử rực rỡ bùng nổ, bảng vàng **BÀI 6: MẠNG THÔNG TIN TOÀN CẦU** xuất hiện trang trọng trên màn chiếu!

### 3. Sử dụng Ngân hàng 12 câu hỏi gợi ý:
Trong Bảng điều khiển, chuyển sang tab **"Ngân hàng 12 câu hỏi"**:
- Giáo viên có thể nhấp chuột trực tiếp vào bất kỳ câu hỏi nào để WEBBY đọc câu trả lời và đặt câu hỏi gợi mở cho học sinh, giúp tiết học luôn sôi nổi và bám sát kiến thức.

---

## 🛠️ 6. PHƯƠNG ÁN DỰ PHÒNG KHI CÓ SỰ CỐ TẠI LỚP HỌC

| Tình huống | Phương án xử lý |
|---|---|
| **Mất kết nối Internet** | Bấm nút trạng thái ở đầu Bảng điều khiển để chuyển sang **Offline**. Toàn bộ 12 câu hỏi và kịch bản khởi động đều chạy độc lập 100% bằng dữ liệu nội bộ. |
| **Micro bị hỏng hoặc phòng học ồn** | Bấm vào biểu tượng **Bàn phím** bên cạnh nút micro để gõ câu hỏi trực tiếp hoặc bấm chọn câu hỏi trong Ngân hàng câu hỏi của giáo viên. |
| **Giọng đọc phát quá nhanh hoặc quá chậm** | Mở Bảng điều khiển -> tab **Cài đặt & Biểu cảm** -> Kéo thanh trượt **Tốc độ giọng đọc** (khuyến nghị 0.95x). |
| **Học sinh hỏi câu ngoài chủ đề** | WEBBY được lập trình sẵn sàng tiếp nhận vui vẻ và khéo léo dẫn dắt học sinh quay trở lại trọng tâm Bài 6 mà không làm các em xấu hổ. |
| **Muốn nghe lại lời nói của Webby** | Bấm nút **Nghe lại** màu xanh trên thanh điều khiển. |

---

*Chúc quý thầy cô có một tiết thao giảng môn Tin học 6 thành công rực rỡ và đầy hứng khởi cùng WEBBY AI!* 🚀


# studio_game
