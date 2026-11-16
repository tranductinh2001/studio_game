# QUY TRÌNH VẬN HÀNH PHÒNG THI THÔNG MINH (QUIZ ROOM LIFECYCLE)
## CHUẨN HOÁ NGHIỆP VỤ GIỐNG QUIZIZZ & PLICKERS

---

### BƯỚC 1: GIÁO VIÊN TẠO PHÒNG & CHỌN LỚP (TEACHER PREPARATION)
1. **Truy cập**: Giáo viên mở mục **Đánh giá QR Thẻ Giấy** hoặc **Quiz Room**.
2. **Chọn lớp học**:
   - Menu chọn lớp (Lớp 6A, 6B,...) hiển thị sĩ số chuẩn (ví dụ: Lớp 6B gồm 33 học sinh trường TH & THCS Đắk Trôi).
   - Danh sách học sinh được liên kết với số thẻ (`CARD_0001` tương ứng STT 1, `CARD_0002` tương ứng STT 2,...).
3. **Kích hoạt phòng**:
   - Gọi API: `POST /api/classroom/rooms/WB-601/start`.
   - Trạng thái phòng: Chuyển từ `WAITING` sang `ACTIVE`.
   - Backend phát sự kiện SSE `ROOM_STARTED` đến tất cả các thiết bị.

---

### BƯỚC 2: GIÁO VIÊN KÍCH HOẠT CÂU HỎI (QUESTION ACTIVATION)
1. **Hiển thị trên máy chiếu**:
   - Câu hỏi trắc nghiệm xuất hiện lớn, rõ ràng (4 phương án A, B, C, D).
   - Trạng thái câu hỏi: `COLLECTING` (Đang thu bài).
   - Reset toàn bộ đáp án cũ trên máy chiếu và điện thoại: `room.responses = {}`.
2. **Đồng bộ xuống điện thoại giáo viên**:
   - Điện thoại nhận sự kiện `QUESTION_UPDATED`.
   - `SmartScanner` xóa bộ đệm thẻ đã quét trước đó (`syncedCardsRef.current.clear()`).
   - Sẵn sàng quét thẻ mới cho học sinh.

---

### BƯỚC 3: HỌC SINH GIƠ THẺ & ĐIỆN THOẠI QUÉT TỰ ĐỘNG (LIVE SCANNING)
1. **Học sinh thao tác**:
   - Học sinh giơ thẻ giấy Webby QR hoặc thẻ Quizizz Paper Q-Card.
   - Hướng xoay của chữ cái (A, B, C, D) hướng lên trên là đáp án lựa chọn.
2. **Điện thoại giáo viên quét**:
   - Camera quét bao quát cả lớp học (nhận diện đồng thời nhiều thẻ).
   - Hiển thị khung viền xanh lục (Webby QR) hoặc khung viền tím (Quizizz ArUco) cùng tên học sinh và góc quay.
   - Rung nhẹ (haptic vibration 40-50ms) báo hiệu quét thành công.
3. **Auto-streaming lên máy chiếu**:
   - Tự động nạp vào hàng đợi gửi (120ms debounce).
   - Máy chiếu nhận đáp án qua SSE trong thời gian thực (< 150ms).
   - Ô tên của học sinh trên máy chiếu sáng xanh kèm biểu tượng xác nhận (không để lộ chữ cái đáp án để học sinh khác không thể sao chép).
4. **Học sinh đổi ý (Card Rotation)**:
   - Nếu học sinh xoay thẻ sang đáp án khác trước khi hết giờ, hệ thống tự động cập nhật:
     - Ghi nhận `revision = 2`.
     - Lưu lại `previousAnswer`.
     - Thay đổi đáp án mới trên hệ thống.

---

### BƯỚC 4: GIÁO VIÊN KHÓA NỘP BÀI (QUESTION LOCKING)
1. **Thao tác**: Giáo viên nhấn nút **Khóa nộp bài** (trên máy chiếu hoặc trực tiếp trên thanh điều khiển điện thoại).
2. **Xử lý Backend**:
   - Trạng thái phòng chuyển sang `LOCKED`.
   - Server lập tức từ chối mọi yêu cầu gửi đáp án sau thời điểm khóa với phản hồi:
     ```json
     {
       "success": false,
       "locked": true,
       "error": "Câu hỏi đã bị khóa! Không thể nhận thêm hoặc thay đổi đáp án."
     }
     ```
3. **Phản hồi giao diện**:
   - Máy chiếu đổi huy hiệu sang: `ĐÃ KHÓA (LOCKED)`.
   - Điện thoại hiển thị cảnh báo: `⚠️ Giáo viên đã khóa nhận đáp án`.

---

### BƯỚC 5: CÔNG BỐ ĐÁP ÁN & PHÂN TÍCH (ANSWER REVEAL & ANALYTICS)
1. **Thao tác**: Giáo viên nhấn nút **Công bố đáp án**.
2. **Hiển thị trên máy chiếu**:
   - Hiệu ứng pháo hoa rực rỡ (`canvas-confetti`).
   - Đáp án đúng sáng viền màu ngọc lam / xanh lá nổi bật kèm giải thích chi tiết câu hỏi.
   - Bảng ma trận học sinh lật thẻ:
     - Học sinh trả lời đúng: Ô xanh lá kèm đáp án đúng.
     - Học sinh trả lời sai: Ô đỏ kèm đáp án đã chọn.
   - Biểu đồ phân bố (A, B, C, D), tỷ lệ chính xác trên số học sinh đã nộp bài và tỷ lệ trên toàn bộ sĩ số lớp.
3. **Sư phạm AI BitOne**:
   - Giáo viên có thể bấm "Phân tích sư phạm AI" để nhận gợi ý củng cố kiến thức cho những học sinh chọn phương án nhiễu.
