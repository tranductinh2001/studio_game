# SYSTEM AUDIT REPORT – WEBBY CLASSROOM
## BÁO CÁO KIỂM TRA TOÀN DIỆN KIẾN TRÚC & NGUYÊN NHÂN GỐC RỄ LỖI ĐỒNG BỘ
*Thời gian kiểm toán: 2026-11-16 21:45:00 (Asia/Ho_Chi_Minh)*
*Chuyên gia thực hiện: Senior Full-stack Engineer & System Architect*

---

### I. HIỆN TRẠNG HỆ THỐNG (AUDIT THEO 12 TIÊU CHÍ)

| STT | Tiêu chí | Trạng thái hiện tại | Đánh giá & Rủi ro |
|:---:|---|---|---|
| **1** | **Frontend Framework** | React 18.3.1 + Vite 6.0.7 + TailwindCSS 3.4.17 + Lucide React | Hoạt động tốt ở tầng hiển thị client. |
| **2** | **Backend Server** | Node.js Express 4.21.2 (`server/index.js`), chạy trên cổng `3001` | **LỖI LỚN KHI DEPLOY:** Server chỉ chạy dưới dạng tiến trình local trên máy tính cá nhân. Khi deploy lên Vercel, Vercel chỉ build static HTML/JS (`vite build`), hoàn toàn **KHÔNG CÓ BACKEND NÀO CHẠY TRÊN VERCEL**. Mọi request `/api/*` trên Vercel đều trả về 404/HTML. |
| **3** | **Cơ sở dữ liệu** | Tệp JSON cục bộ `server/data/classroomDB.json` | **LỖI LỚN KHI DEPLOY:** Tệp JSON nằm trên ổ cứng laptop. Khi lên Vercel Serverless, file system là read-only, dữ liệu giữa các thiết bị không thể chia sẻ. |
| **4** | **Lưu trữ State/Cache** | Phân mảnh: vừa lưu ở `classroomStore.js` (RAM/JSON), vừa lưu trong React state của từng component | Khi F5 hoặc chuyển thiết bị, state bị mất hoặc không đồng nhất. |
| **5** | **Cơ chế tạo Quiz Room** | Mã phòng bị fix cứng `WB-601`, thiếu vòng đời phòng (`WAITING` -> `ACTIVE` -> `LOCKED`) | Chưa có luồng tạo phòng động với `roomId` duy nhất và danh sách câu hỏi riêng. |
| **6** | **Cơ chế điện thoại vào phòng** | Nhận `?mode=mobile` hoặc truy cập Tab 6 | Chưa có màn hình xác thực mã phòng `roomCode` để điện thoại kết nối đúng phòng đang mở. |
| **7** | **Quét QR & nhận diện đáp án** | Dùng Webby QR và Quizizz ArUco 4x4 (`quizizzArucoDetector.js`) | Thuật toán nhận diện tốt, nhưng **KHÔNG TỰ ĐỘNG GỬI ĐÁP ÁN** lên server khi quét trúng thẻ. |
| **8** | **Đồng bộ Phone <-> Desktop** | `SmartScanner.jsx` yêu cầu bấm nút thủ công "Đồng bộ đáp án" mới gửi API | Giáo viên quét thẻ học sinh nhưng đáp án không tự nảy lên máy chiếu do thiếu cơ chế auto-stream. |
| **9** | **Biến môi trường (.env)** | `.env` chỉ có `PORT=3001`, `GEMINI_API_KEY` | Thiếu hoàn toàn các biến chuẩn hóa môi trường: `VITE_APP_ENV`, `VITE_API_BASE_URL`, `VITE_APP_BASE_URL`. |
| **10** | **Hardcode URL trong code** | `src/App.jsx` dòng 92: `let host = '192.168.1.10'` và `fullUrl = http://${host}:5173/?mode=mobile` | **LỖI NGHIÊM TRỌNG:** Mã QR kết nối ĐT bị fix cứng IP `192.168.1.10` và port `:5173`. Trên Vercel, nó tạo ra link `http://...vercel.app:5173` khiến điện thoại không thể mở được! |
| **11** | **Phân biệt Local / LAN / Vercel** | `classroomService.js` lấy `getApiBase = () => '/api'` | Trên localhost có Vite proxy `/api -> 3001`, nhưng trên Vercel không có proxy và không có backend, dẫn đến sập toàn bộ API. |
| **12** | **Cơ chế Realtime** | Server-Sent Events (SSE) `EventSource('/api/classroom/rooms/WB-601/events')` | SSE chết ngay lập tức trên Vercel; thiếu cơ chế Polling Fallback dự phòng khi mất kết nối mạng. |

---

### II. 5 NGUYÊN NHÂN GỐC RỄ (ROOT CAUSES)

#### 1. Vercel hoàn toàn không có Backend và Database
- `npm run build` chỉ chạy `vite build` ra thư mục `dist/`.
- Không có `vercel.json` cấu hình Serverless Functions cho Express backend.
- File cơ sở dữ liệu `classroomDB.json` chỉ nằm trên máy tính cá nhân của giáo viên, Vercel không thể truy cập vào ổ cứng laptop. Khi mở trang trên Vercel, mọi lệnh nạp phòng, lưu học sinh, submit đáp án đều thất bại.

#### 2. Lỗi sinh URL mã QR kết nối điện thoại (App.jsx)
- Đoạn code sinh QR trong `src/App.jsx` tự gán mặc định `host = '192.168.1.10'` nếu hostname là `localhost`. Nhưng mạng Wi-Fi thực tế của trường/nhà có thể là `10.135.169.82` hoặc `192.168.1.x`.
- Khi deploy lên Vercel, code vẫn ép nối `:5173`, tạo ra đường dẫn sai `http://my-project.vercel.app:5173/?mode=mobile`. Trình duyệt điện thoại từ chối kết nối vì Vercel không mở cổng 5173 và chỉ hỗ trợ HTTPS.

#### 3. SmartScanner không tự động gửi dữ liệu khi quét thẻ (Passive Buffer Bug)
- Trong `SmartScanner.jsx`, khi camera nhận diện được thẻ (cả QR và Quizizz ArUco), dữ liệu chỉ được nhét vào `setDetectedResponses` trong React State nội bộ của điện thoại.
- Hàm `classroomService.submitResponses` chỉ được kích hoạt khi giáo viên bấm vào nút "Đồng bộ đáp án". Điều này khiến máy chiếu không nhận được đáp án trực tiếp khi giáo viên đang lia camera.

#### 4. Cơ chế Realtime SSE đơn độc, không có Fallback
- `classroomService.subscribeToRoom` chỉ dựa vào `new EventSource(...)`.
- Khi điện thoại chuyển mạng 4G/Wi-Fi, hoặc chạy trên Vercel, SSE bị ngắt hoặc không hỗ trợ. Lúc này client hoàn toàn "điếc", không có cơ chế tự động chuyển sang Polling định kỳ (`heartbeat / delta sync`).

#### 5. Thiếu mô hình Quiz Room chuẩn hóa theo vòng đời Quizizz
- Chưa có bảng dữ liệu chuẩn liên kết: `quiz_rooms` -> `quiz_room_questions` -> `quiz_answers`.
- Khóa định danh của một câu trả lời phải là: `roomId + questionId + studentId` để đảm bảo khi học sinh xoay đổi đáp án (A sang C) thì hệ thống thực hiện **UPSERT** (ghi đè cập nhật) thay vì sinh ra bản ghi mới hoặc từ chối.

---

### III. GIẢI PHÁP THIẾT KẾ ĐỒNG BỘ TRIỆT ĐỂ

1. **Module Cấu hình Môi trường Tập trung (`src/config/environment.js`)**:
   - Tự động nhận diện `development` (Localhost), `lan` (Wi-Fi IP), hay `production` (Vercel).
   - Backend cung cấp endpoint `GET /api/network-info` trả về IP LAN thực tế (`10.135.169.82`), loại bỏ hoàn toàn hardcode `192.168.1.10`.
   - Trên Vercel, tự động dùng `https://${window.location.host}` (không kèm port 5173).

2. **Serverless API Wrapper trên Vercel (`api/index.js` + `vercel.json`)**:
   - Chuyển `server/index.js` thành Vercel Serverless Function tương thích 100%.
   - Hỗ trợ lưu trữ trạng thái đồng bộ: Local dùng JSON DB, Vercel dùng Shared State / In-Memory Cache với Fallback đồng bộ đám mây.

3. **Luồng Auto-Stream cho SmartScanner**:
   - Tích hợp Throttle/Debounce Auto-Sync (150ms): Ngay khi camera nhận diện thẻ hoặc học sinh xoay đổi đáp án, hệ thống lập tức gửi payload lên Backend qua `submitResponses`.
   - Máy chiếu giáo viên cập nhật ngay lập tức mà không cần bấm nút phụ.

4. **Resilient Realtime Channel (SSE + Intelligent Polling Fallback)**:
   - Client cố gắng kết nối SSE. Nếu SSE ngắt hoặc trên môi trường Serverless không giữ kết nối lâu, hệ thống tự động kích hoạt Polling nhịp nhàng (mỗi 1.2s) để đảm bảo hai thiết bị luôn nhìn thấy trạng thái giống nhau 100%.

5. **Chuẩn hóa vòng đời Quiz Room & Upsert Đáp Án**:
   - Vòng đời: `WAITING` (chờ thiết bị) -> `ACTIVE` (đang thi đấu) -> `LOCKED` (khóa bài, từ chối nhận thêm) -> `REVEALED` (công bố đáp án, tính analytics).
   - Khóa duy nhất: `roomId + questionId + studentId`.
