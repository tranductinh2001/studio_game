# CẨM NANG THẺ QR THÔNG MINH (SMART_QR_CARD_GUIDE.md)
## QUY CÁCH IN ẤN, THIẾT KẾ 4 HƯỚNG VÀ KỸ THUẬT QUÉT CAMERA

---

### 1. NGUYÊN LÝ HOẠT ĐỘNG (PLICKERS-STYLE QR)

Mỗi học sinh trong lớp được cấp một thẻ giấy cá nhân độc nhất:
- Thẻ có dạng hình chữ nhật hoặc hình vuông với mã QR độ tương phản cao ở trung tâm.
- Trên 4 đường viền bao quanh của thẻ in rõ 4 chữ cái:
  - **Mép đỉnh:** Chữ **A**
  - **Mép phải:** Chữ **B**
  - **Mép đáy:** Chữ **C**
  - **Mép trái:** Chữ **D**
- **Quy tắc chọn đáp án:** Học sinh chỉ cần xoay mặt thẻ sao cho chữ cái mình lựa chọn nằm ở mép trên cùng, sau đó giơ thẳng thẻ về phía giáo viên.
- Giáo viên đứng trên bục giảng cầm điện thoại lia camera một vòng quanh lớp. Hệ thống thị giác máy tính sẽ nhận diện đồng thời góc xoay của từng thẻ và tự động ghi nhận đáp án của từng em lên màn hình máy chiếu trong vòng 3 đến 5 giây.

---

### 2. QUY CÁCH VÀ TIÊU CHUẨN IN ẤN

- **Khổ giấy:** A4 (210 mm × 297 mm), định lượng khuyên dùng từ 160gsm – 250gsm (giấy bìa dày hoặc ép plastic mờ chống lóa).
- **Bố cục in:** 2 thẻ trên một trang A4 (Kích thước mỗi thẻ: 180 mm × 135 mm).
- **Màu sắc in:** Mực đen đậm sắc nét trên nền giấy trắng tinh (độ tương phản > 90%).
- **Tránh ép plastic bóng phản quang mạnh:** Nên chọn màng ép mờ hoặc dán bìa cứng để camera điện thoại không bị lóa sáng dưới ánh đèn tuýp phòng học.

---

### 3. HƯỚNG DẪN TẠO VÀ IN TỆP PDF TỰ ĐỘNG

1. Trên màn hình máy chiếu, giáo viên chọn tab **"In Thẻ QR"**.
2. Nhấn nút **"In toàn bộ 32 thẻ (PDF chuẩn A4)"**.
3. Hệ thống sẽ tự động dùng thư viện vector `jspdf` kết hợp `qrcode` tạo tệp PDF 16 trang (mỗi trang chứa 2 thẻ của 2 học sinh kèm đầy đủ họ tên, mã định danh, lớp 6A và hướng dẫn).
4. Mang tệp PDF này in ra máy in thông thường của nhà trường.

