# CẨM NANG XỬ LÝ SỰ CỐ & HỎI ĐÁP (TROUBLESHOOTING GUIDE)
## KHẮC PHỤC CÁC TÌNH HUỐNG THỰC TẾ TRÊN LỚP HỌC

---

### TÌNH HUỐNG 1: ĐIỆN THOẠI QUÉT MÃ QR NHƯNG BÁO KHÔNG THỂ KẾT NỐI (ERR_CONNECTION_REFUSED / TIMEOUT)

- **Nguyên nhân**:
  1. Máy tính và điện thoại không ở chung mạng Wi-Fi (ví dụ: máy tính cắm mạng dây LAN khác subnet, điện thoại dùng 4G).
  2. Tường lửa (Windows Firewall) của máy tính chặn cổng 5173 hoặc 3001.
- **Cách xử lý**:
  1. **Cách nhanh nhất**: Dùng điện thoại bật điểm phát sóng Wi-Fi di động (Personal Hotspot), cho máy tính kết nối vào Wi-Fi của điện thoại. Khi đó hai máy chắc chắn thông mạng 100%.
  2. Bấm "Kết nối điện thoại" trên Webby Classroom để xem mã QR mới với IP tương ứng.
  3. Nếu sử dụng bản Vercel (`*.vercel.app`), điện thoại có thể dùng 4G hoặc bất kỳ mạng nào đều kết nối được ngay vì máy chủ nằm trên Cloud.

---

### TÌNH HUỐNG 2: HỌC SINH ĐÃ GIƠ THẺ NHƯNG MÀN HÌNH KHÔNG HIỆN ĐÁP ÁN

- **Nguyên nhân**:
  1. Phòng thi đang ở trạng thái `LOCKED` (Đã khóa). Khi đó server từ chối nhận đáp án mới.
  2. Thẻ bị che khuất góc hoặc ánh sáng phòng học quá chói / quá tối.
  3. Học sinh giơ thẻ của lớp khác hoặc số thẻ vượt quá sĩ số lớp.
- **Cách xử lý**:
  1. Kiểm tra trên màn hình máy chiếu hoặc thanh điều khiển điện thoại: Nếu trạng thái là `ĐÃ KHÓA`, giáo viên nhấn mở khóa hoặc chuyển sang câu hỏi mới.
  2. Yêu cầu học sinh cầm thẻ ngay ngắn, không để ngón tay che vào viền đen hoặc hoa văn trung tâm.
  3. `SmartScanner` trên điện thoại sẽ rung nhẹ và vẽ khung viền sáng quanh thẻ khi nhận diện thành công.

---

### TÌNH HUỐNG 3: HỌC SINH LỠ GIƠ SAI VÀ MUỐN ĐỔI ĐÁP ÁN

- **Cơ chế xử lý**:
  - Hệ thống hỗ trợ tính năng **Card Rotation Upsert** tự động.
  - Học sinh chỉ cần xoay thẻ sang cạnh chứa chữ cái mong muốn (A, B, C, D) hướng lên trên.
  - Camera điện thoại quét lại thẻ, server sẽ cập nhật ngay lập tức sang đáp án mới và tăng số lần sửa (`revision: 2`).

---

### TÌNH HUỐNG 4: THẺ QUIZIZZ ĐÃ IN CÓ DÙNG ĐƯỢC KHÔNG?

- **Trả lời**: **Có, tương thích 100%!**
  - Hệ thống tích hợp sẵn thuật toán giải mã ArUco 4x4 chuẩn của Quizizz Paper Mode Q-Cards.
  - Thẻ `P 1` tương ứng học sinh STT 1 trong danh sách lớp.
  - Thẻ `P 2` tương ứng học sinh STT 2,...
  - Thẻ nhận diện với khung viền tím đặc trưng và góc quay tự động hiển thị đáp án A, B, C, D.

---

### TÌNH HUỐNG 5: VERCEL SERVERLESS CÓ BỊ MẤT KẾT NỐI REALTIME KHÔNG?

- **Cơ chế bảo vệ**:
  - Webby Classroom triển khai cơ chế **Resilient Realtime (SSE + Polling Fallback 1.2s)**.
  - Ngay cả khi kết nối SSE bị Vercel Serverless Function ngắt sau timeout, hệ thống tự động chuyển sang chế độ Polling kiểm tra trạng thái phòng mỗi 1.2s.
  - Bộ lọc hàm băm (`lastStateHash`) đảm bảo chỉ cập nhật giao diện khi có học sinh nộp bài mới, không làm chậm điện thoại hay giật lag máy chiếu.

