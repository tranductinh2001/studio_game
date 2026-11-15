# HƯỚNG DẪN TRIỂN KHAI VÀ CÀI ĐẶT (DEPLOY_GUIDE.md)
## HƯỚNG DẪN CHẠY TRÊN MÁY TÍNH LỚP HỌC, MẠNG LAN/WI-FI VÀ PWA

---

### 1. YÊU CẦU MÔI TRƯỜNG

- **Hệ điều hành:** Windows 10/11, macOS hoặc Linux.
- **Node.js:** Phiên bản 18.x trở lên (đã kiểm thử hoàn hảo trên Node 20/22).
- **Trình duyệt khuyên dùng:** Google Chrome, Microsoft Edge, hoặc Cốc Cốc (hỗ trợ Web Speech API và MediaDevices Camera).
- **Mạng Wi-Fi:** Máy tính giáo viên và điện thoại kết nối cùng một mạng Wi-Fi của phòng học (hoặc phát Wi-Fi từ điện thoại của giáo viên sang máy tính).

---

### 2. CÁC BƯỚC KHỞI ĐỘNG HỆ THỐNG

1. **Mở terminal tại thư mục dự án:**
   ```bash
   cd "c:\Users\X1\Desktop\tài liệu THCS Đắk Trôi\thaogiang"
   ```

2. **Cài đặt các thư viện cần thiết (nếu chưa cài):**
   ```bash
   npm install
   ```

3. **Khởi chạy đồng thời cả Backend và Frontend:**
   ```bash
   npm run dev
   ```
   *Lệnh này sẽ tự động chạy Backend tại cổng 3001 và Frontend tại cổng 5173.*

4. **Mở trình duyệt trên máy tính:**
   - Màn hình máy chiếu: `http://localhost:5173`

5. **Mở trên điện thoại giáo viên (quét QR và chụp bài làm nhóm):**
   - Xem địa chỉ IP của máy tính (ví dụ: `192.168.1.10`).
   - Mở trình duyệt điện thoại truy cập: `http://192.168.1.10:5173/?mode=mobile`.
   - Bấm vào menu trình duyệt điện thoại -> Chọn **"Thêm vào Màn hình chính" (Install PWA)** để sử dụng như một ứng dụng độc lập toàn màn hình.

---

### 3. VẬN HÀNH NGOẠI TUYẾN 100% (OFFLINE FIELD MODE)

Trong trường hợp trường học bị mất mạng cáp quang hoặc Wi-Fi không có Internet:
- Hệ thống tự động chuyển sang cơ chế **Offline Rule-Based Mode** kết hợp **Local Speech Synthesis**.
- Toàn bộ cơ chế Webby AI hội thoại, quét thẻ QR, trình chiếu bài làm nhóm A3/A4 và thống kê phân tích số liệu vẫn hoạt động 100% trơn tru, không phụ thuộc vào bất kỳ dịch vụ đám mây nào!

