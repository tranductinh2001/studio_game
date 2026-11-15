# TÀI LIỆU TÍCH HỢP BITONE AI (BITONE_AI_INTEGRATION.md)
## NGUYÊN LÝ KHÁM PHÁ, ĐỊA CHỈ GATEWAY VÀ ADAPTER ĐA TẦNG

---

### 1. QUÁ TRÌNH TRUY VẾT VÀ XÁC ĐỊNH BITONE AI

Theo đúng yêu cầu bắt buộc tại **Phần C** của Master Prompt, hệ thống đã quét các dự án trước đó của người dùng trên máy tính và phát hiện cấu hình tích hợp BitOne AI tại đường dẫn:
- `D:\New folder\MMO\GiaoDucOnline\src\lib\beeknoee.ts`
- `D:\New folder\MMO\GiaoDucOnline\.env`

**Thông số kỹ thuật của BitOne AI Gateway:**
- **Base URL:** `https://platform.beeknoee.com/api/v1`
- **Giao thức:** OpenAI Chat Completions-compatible API (`POST /chat/completions`)
- **Headers:** `Authorization: Bearer <API_KEY>`, `Content-Type: application/json`
- **Mô hình hỗ trợ:** `gemini-3.1-flash-lite`, `gemini-2.5-flash`, v.v.

---

### 2. KIẾN TRÚC ADAPTER 3 TẦNG BẢO VỆ (3-TIER RESILIENT ADAPTER)

Để đảm bảo tiết dạy thao giảng không bao giờ bị gián đoạn hay xuất hiện lỗi trước học sinh và hội đồng dự giờ (kể cả khi mất mạng Internet, tài khoản AI hết hạn mức hoặc lỗi mạng), `server/services/bitoneService.js` được thiết kế theo kiến trúc 3 tầng:

```
[Yêu cầu tạo câu hỏi / Nhận xét sư phạm]
                  │
                  ▼
   ┌─────────────────────────────┐
   │ TẦNG 1: BitOne AI Gateway   │ ──(Thành công)──> Trả về kết quả JSON chuẩn
   │ (platform.beeknoee.com)     │
   └─────────────────────────────┘
                  │ (Lỗi 402, 401 hoặc Timeout)
                  ▼
   ┌─────────────────────────────┐
   │ TẦNG 2: Google Gemini AI    │ ──(Thành công)──> Trả về kết quả
   │ (generativelanguage... v1b) │
   └─────────────────────────────┘
                  │ (Không có Internet hoặc mất kết nối)
                  ▼
   ┌─────────────────────────────┐
   │ TẦNG 3: Smart Curriculum    │ ──(100% Offline)─> Trả về bộ câu hỏi chuẩn
   │ Fallback Engine (Bài 6 Tin6)│                    theo thang đo Bloom
   └─────────────────────────────┘
```

---

### 3. API ENDPOINTS TRIỂN KHAI CHO BITONE AI

#### 3.1. Endpoint Tạo Ngân Hàng Câu Hỏi Trắc Nghiệm:
- **Phương thức:** `POST /api/bitone/generate-questions`
- **Tham số nhận vào:**
  ```json
  {
    "subject": "Tin học",
    "grade": "6",
    "lesson": "Bài 6: Mạng thông tin toàn cầu",
    "topics": ["Phân biệt Internet và WWW", "Trình duyệt web", "Siêu liên kết"],
    "bloomLevels": ["Nhận biết", "Thông hiểu", "Vận dụng"],
    "count": 5
  }
  ```
- **Dữ liệu trả về:** Mảng các đối tượng câu hỏi có đầy đủ `questionText`, `options` (A, B, C, D), `correctAnswer`, `explanation`, `bloomLevel`, và `difficulty`.

#### 3.2. Endpoint Nhận Xét & Đánh Giá Sư Phạm:
- **Phương thức:** `POST /api/bitone/analyze-results`
- **Tham số nhận vào:** Thống kê kết quả thi của cả lớp (tổng số học sinh trả lời, tỷ lệ đúng/sai, phân bố phương án A, B, C, D).
- **Dữ liệu trả về:** Phân tích định tính của AI, chỉ rõ những khái niệm học sinh đã nắm chắc và các lỗ hổng kiến thức phổ biến (ví dụ: học sinh hay nhầm lẫn giữa Internet và WWW), kèm đề xuất giải pháp giảng dạy tiếp theo cho giáo viên.

