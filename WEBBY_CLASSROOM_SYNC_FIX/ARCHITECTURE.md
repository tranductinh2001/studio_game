# KIẾN TRÚC HỆ THỐNG ĐỒNG BỘ WEBBY CLASSROOM
## UNIFIED REALTIME ARCHITECTURE (LOCAL - LAN IP - VERCEL)

---

### 1. TỔNG QUAN KIẾN TRÚC ĐỒNG BỘ

WEBBY CLASSROOM được thiết kế lại toàn diện theo mô hình **Single Source of Truth (Nguồn dữ liệu duy nhất)** kết hợp **Hybrid Resilient Realtime (SSE + Polling Fallback)** để đảm bảo đồng bộ hoàn hảo giữa màn hình máy chiếu giáo viên (Desktop/Laptop) và thiết bị quét thẻ (Mobile Phone), bất kể ứng dụng được chạy ở:
- **Localhost Development**: `http://localhost:5173`
- **LAN Wi-Fi Development**: `http://<LAN_IP>:5173` (Tự động phát hiện qua OS Network Interfaces, không hardcode)
- **Vercel Cloud Production**: `https://studio-game-*.vercel.app` (Serverless Functions + Cloud Hosting)

```
                            WEBBY CLASSROOM ECOSYSTEM
                                       |
                   +-------------------+-------------------+
                   |                                       |
          MÁY CHIẾU GIÁO VIÊN                     ĐIỆN THOẠI QUÉT THẺ
       (Teacher Desktop / Projector)            (Teacher Mobile Scanner)
                   |                                       |
                   |--- (1) Đăng ký SSE / Polling Event ---|
                   |                                       |
                   v                                       v
         +-----------------------------------------------------------+
         |                     SERVICE LAYER                         |
         |  - environment.js (Tự động nhận diện Origin & Config)    |
         |  - classroomService.js (Resilient SSE + 1.2s Poll fallback)|
         +-----------------------------------------------------------+
                                       |
                                       v
         +-----------------------------------------------------------+
         |                 UNIFIED BACKEND ENGINE                    |
         |  - Local/LAN: Express Server daemon (Port 3001)           |
         |  - Vercel Cloud: api/index.js (Serverless Express Handler)|
         +-----------------------------------------------------------+
                                       |
                                       v
         +-----------------------------------------------------------+
         |              PERSISTENT DATA STORE (Store Layer)          |
         |  - classroomStore.js: Quản lý Phòng, Lớp, Thẻ học sinh    |
         |  - File-system Storage: server/data/classroomDB.json      |
         |  - Serverless Fallback: Safe memory & /tmp storage       |
         +-----------------------------------------------------------+
```

---

### 2. PHÂN TÁCH HAI LOẠI MÃ QR ĐỘC LẬP

Để khắc phục hoàn toàn tình trạng nhầm lẫn giữa mã kết nối phòng và mã định danh học sinh:

| Tiêu chí | QR Tham gia Phòng (Room Join QR) | QR Thẻ Học Sinh (Student Card QR) |
| :--- | :--- | :--- |
| **Mục đích** | Mở trình duyệt điện thoại để kết nối vào phòng thi | Học sinh giơ thẻ trước camera để nộp đáp án (A, B, C, D) |
| **Thiết bị đọc** | Camera điện thoại bình thường (Zalo, iOS Camera, Google Lens) | Module `SmartScanner` tích hợp bên trong Webby Classroom |
| **Nội dung mã** | URL đầy đủ: `http://<LAN_IP>:5173/?mode=mobile&room=WB-601` hoặc `https://domain.vercel.app/?mode=mobile&room=WB-601` | JSON Payload chuẩn hoá: `{"type":"WEBBY_STUDENT_CARD","cardId":"CARD_0001","version":1}` hoặc ArUco 4x4 (Quizizz Paper Q-Card) |
| **Phụ thuộc IP** | Tự động thích ứng theo môi trường (LAN IP hoặc Vercel HTTPS) | **Tuyệt đối không chứa IP, không chứa Domain, không chứa họ tên** |
| **Khả năng tái sử dụng** | Tạo động theo phiên làm việc | In 1 lần trên bìa cứng A4/A5, dùng cho nhiều năm học |

---

### 3. CƠ CHẾ AUTO-STREAMING REALTIME CỦA SMARTSCANNER

Trước đây, giáo viên quét thẻ phải nhấn nút "Đồng bộ" thủ công, gây gián đoạn tiết dạy. Hệ thống mới áp dụng **Auto-streaming Debounced Queue**:

1. **Nhận diện thẻ liên tục**:
   - `jsQR` giải mã thẻ Webby QR (Góc quay $0^\circ \to A, 90^\circ \to B, 180^\circ \to C, 270^\circ \to D$).
   - `quizizzArucoDetector` giải mã thẻ ArUco 4x4 của Quizizz (Góc quay tự nhiên $0^\circ, 90^\circ, 180^\circ, 270^\circ$).
2. **Hàng đợi chống spam (120ms Debounce Queue)**:
   - Các thẻ nhận diện được đưa vào `pendingSyncQueueRef`.
   - Nếu học sinh giữ nguyên thẻ đã gửi đáp án (`syncedCardsRef`), hệ thống bỏ qua không gửi lại để tiết kiệm băng thông.
   - Nếu học sinh xoay thẻ sang đáp án khác, hệ thống ghi nhận `revision++` và cập nhật tức thì.
3. **Phản hồi thời gian thực trên máy chiếu**:
   - Máy chiếu nhận sự kiện `RESPONSES_UPDATED` qua SSE trong chưa đầy 150ms.
   - Ma trận 33 học sinh sáng đèn xanh (đã nộp) mà không để lộ đáp án cho học sinh khác nhìn trộm.
   - Khi giáo viên nhấn "Khóa", server từ chối mọi lần quét trễ với cờ `{ locked: true }`.

---

### 4. KHẢ NĂNG CHỐNG LỖI MẠNG (RESILIENT REALTIME)

- **Tại sao cần Hybrid SSE + Polling Fallback?**
  - Vercel Serverless Function có thời gian timeout (10s-60s), kết nối SSE lâu dài có thể bị ngắt bởi proxy Vercel hoặc điện thoại rơi vào chế độ Sleep màn hình.
- **Giải pháp triển khai trong `classroomService.js`**:
  - Khởi tạo kết nối SSE: `EventSource('/api/classroom/rooms/:code/events')`.
  - Nếu kết nối SSE gặp lỗi (`onError`), tự động kích hoạt bộ đếm Polling 1.2s.
  - Sử dụng cơ chế so khớp hàm băm (`lastStateHash`) để chỉ kích hoạt Re-render khi dữ liệu phòng thực sự thay đổi, loại bỏ hiện tượng giật lag màn hình.
