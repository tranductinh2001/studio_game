# BÁO CÁO CHI TIẾT CÁC THAY ĐỔI MÃ NGUỒN (SOURCE_CHANGES.md)
## HỆ THỐNG WEBBY CLASSROOM – AI AGENT & THAO GIẢNG TIN HỌC THCS

Dự án đã được nâng cấp thành công từ **Webby AI** ban đầu lên hệ thống quản lý và tương tác lớp học hoàn chỉnh **WEBBY CLASSROOM** bao gồm 5 module nghiệp vụ: Webby AI Agent, Group Work Display, BitOne AI Question Generator, Smart QR Paper Assessment, và Live Classroom Analytics.

---

### 1. TỔNG HỢP CÁC TỆP TIN ĐÃ THÊM MỚI VÀ CHỈNH SỬA

| STT | Đường dẫn tệp tin | Phân loại | Mục đích & Chức năng |
|---|---|---|---|
| 1 | `server/index.js` | Chỉnh sửa | Mở rộng express server, nâng payload lên 15MB, tích hợp các API classroom, SSE stream, group photo upload, BitOne question generator & analytics. |
| 2 | `server/data/classroomStore.js` | Thêm mới | Bộ quản lý trạng thái lớp học theo thời gian thực (SSE), lưu trữ 32 học sinh Lớp 6A THCS Đắk Trôi, mã thẻ `CARD_0001` - `CARD_0032`, quản lý room, kết quả trắc nghiệm và ảnh nhóm. |
| 3 | `server/services/bitoneService.js` | Thêm mới | Adapter tích hợp BitOne AI (`https://platform.beeknoee.com/api/v1`), hỗ trợ fallback sang Gemini API hoặc Smart Curriculum Engine cho Tin học 6. |
| 4 | `src/services/classroomService.js` | Thêm mới | Client-side service kết nối SSE stream, gọi REST API cho nộp câu trả lời, tải ảnh bài làm nhóm, tạo câu hỏi BitOne và nhận xét sư phạm. |
| 5 | `src/components/GroupWork/GroupWorkDisplay.jsx` | Thêm mới | Module trình chiếu bài làm nhóm A3/A4 trên máy chiếu: Lưới 4 nhóm, So sánh 2 nhóm song song, Phóng to/Thu nhỏ (Zoom), Xoay 90° (Rotate), Đánh giá sticker nhận xét của giáo viên. |
| 6 | `src/components/BitOneQuiz/BitOneQuestionGenerator.jsx` | Thêm mới | Module AI tạo câu hỏi trắc nghiệm theo chuẩn kiến thức và thang đo tư duy Bloom, hỗ trợ chỉnh sửa trực tiếp, thêm/xóa câu, xuất/nhập JSON và đưa câu hỏi vào phiên đánh giá QR. |
| 7 | `src/components/CardGenerator/CardGenerator.jsx` | Thêm mới | Module quản lý danh sách 32 học sinh Lớp 6A, xem trước thẻ QR 4 hướng A, B, C, D và xuất tệp PDF chuẩn in ấn A4 (2 thẻ/trang). |
| 8 | `src/components/Scanner/SmartScanner.jsx` | Thêm mới | Module thị giác máy tính (Computer Vision) dùng `jsQR` nhận diện thẻ học sinh và tính toán góc quay vector $\theta$ để xác định đáp án A (0°), B (90°), C (180°), D (270°), tích hợp bộ giả lập quét kiểm thử toàn lớp. |
| 9 | `src/components/Assessment/AssessmentDisplay.jsx` | Thêm mới | Module trình chiếu câu hỏi trắc nghiệm cho máy chiếu lớp học: hiển thị câu hỏi chữ lớn, đếm ngược thời gian, ma trận 32 học sinh sáng đèn theo thời gian thực (ẩn đáp án trước khi công bố), hiệu ứng pháo hoa chúc mừng khi công bố đáp án, thống kê phần trăm biểu đồ và phân tích sư phạm BitOne AI. |
| 10 | `src/components/Mobile/MobileController.jsx` | Thêm mới | Giao diện điều khiển di động dành riêng cho điện thoại giáo viên: quét thẻ QR, chụp ảnh bài làm nhóm (nén ảnh client-side <1400px), và điều khiển câu hỏi từ xa. |
| 11 | `src/App.jsx` | Chỉnh sửa | Bổ sung thanh điều hướng 6 chế độ trên thanh header máy chiếu, tích hợp định tuyến linh hoạt giữa các module, bảo tồn 100% nhân vật 3D Webby, cơ chế hội thoại liên tục, và tối ưu responsive 16:9 không có thanh cuộn. |
| 12 | `public/manifest.json` | Thêm mới | Cấu hình PWA Web App Manifest, hỗ trợ cài đặt độc lập trên máy tính bảng và điện thoại giáo viên. |
| 13 | `public/sw.js` | Thêm mới | Service Worker hỗ trợ caching offline, đảm bảo hệ thống vận hành mượt mà ngay cả khi mất kết nối Internet. |
| 14 | `public/icons/` | Thêm mới | Bộ icon PWA kích thước 192x192 và 512x512. |
| 15 | `test_webby_classroom.py` | Thêm mới | Kịch bản kiểm thử tự động End-to-End toàn diện bằng Playwright trên Microsoft Edge cho toàn bộ 5 module và chế độ điện thoại di động. |
| 16 | `scripts/generate_sample_pdf.js` | Thêm mới | Kịch bản Node.js tạo tệp PDF thẻ in ấn mẫu trong thư mục phát hành. |
| 17 | `WEBBY_CLASSROOM_RELEASE/` | Thêm mới | Thư mục trọn gói phát hành chứa 10 tài liệu kỹ thuật, hướng dẫn giáo viên, tệp mẫu và kết quả kiểm thử. |

---

### 2. CAM KẾT KHÔNG GÂY ẢNH HƯỞNG TIÊU CỰC ĐẾN MÃ NGUỒN CŨ
- Nhân vật 3D Webby (`WebbyAvatar.jsx`), cảnh quả địa cầu (`GlobeScene.jsx`), phụ đề kích thước lớn (`SubtitleDisplay.jsx`), thanh điều khiển giọng nói (`VoiceControlBar.jsx`), bảng điều khiển giáo viên F2 (`TeacherPanel.jsx`) và biểu ngữ bài học (`IntroBanner.jsx`) hoàn toàn được bảo tồn nguyên vẹn.
- Trải nghiệm hội thoại bằng giọng nói liên tục hai chiều với cơ chế chống tiếng vọng (Acoustic Echo Suppression) và cơ chế tự động mở mic sau khi Webby nói xong được duy trì tuyệt đối.
- Bố cục màn hình 16:9 của máy chiếu không bị tràn (zero horizontal & vertical overflow).

