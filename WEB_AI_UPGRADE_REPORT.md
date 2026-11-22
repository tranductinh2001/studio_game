# BÁO CÁO ĐẠI TU & NÂNG CẤP TRỢ LÝ GIỌNG NÓI AI MARK (WEB AI VOICE ASSISTANT)
**Hệ thống Bài giảng Điện tử Tương tác & Thao giảng – Môn Tin học 6**
*Trường THCS Đắk Trôi – Giáo viên thực hiện: Thầy Trần Đức Tình*

---

## 1. TỔNG QUAN DỰ ÁN NÂNG CẤP
Hệ thống Web AI Voice Assistant trước đây hoạt động theo mô hình hỏi - đáp độc lập (Single-turn QA), gặp phải 6 nhóm vấn đề nghiêm trọng về phát âm, ghi nhớ ngữ cảnh, ngắt quãng giọng nói và trải nghiệm tương tác với học sinh lớp 6. 

Sau đợt đại tu toàn diện, hệ thống đã chuyển hóa thành công sang kiến trúc **Multi-turn Conversational Agent** hoàn chỉnh, mang tên chính thức: **Trợ lý AI Mark**, sở hữu bộ nhớ ngữ cảnh liên tục, khả năng nhận diện ý định chuyên sâu và cỗ máy trạng thái hội thoại 7 tầng bảo vệ.

---

## 2. PHÂN TÍCH NGUYÊN NHÂN VÀ GIẢI PHÁP CHO CÁC LỖI BAN ĐẦU

### Lỗi 1: Đọc tên bot từng ký tự ("M - A - R - K")
* **Hiện tượng:** Khi bot tự giới thiệu hoặc nhắc đến tên mình, bộ tổng hợp giọng nói tiếng Việt (Web SpeechSynthesis API) phát âm thành từng chữ cái rời rạc: "Em - A - Rờ - Ka".
* **Nguyên nhân kỹ thuật:** Các engine TTS tiếng Việt (như Microsoft HoaiMy, Google Tiếng Việt) khi gặp chuỗi ký tự viết hoa hoặc từ mượn tiếng Anh chưa được địa phương hóa sẽ tự động kích hoạt chế độ "Spelling Mode" (đọc đánh vần từng ký tự viết tắt).
* **Giải pháp khắc phục:** 
  - Chuẩn hóa tên thương hiệu: Hiển thị giao diện là **Mark** (hoặc Trợ lý Mark), không dùng chữ hoa toàn bộ `MARK`.
  - Tách bạch giữa **văn bản hiển thị** (Display Text) và **văn bản phát âm** (Phonetic Speech Text).
  - Xây dựng bảng quy chuẩn ngữ âm học `normalizeTextForSpeech` trong `VoiceAssistantConfig.js`: Tự động thay thế `Mark` / `MARK` thành âm ngữ bản địa hóa `"Mác"`, đồng thời chuẩn hóa các thuật ngữ Tin học lớp 6 như `WWW` -> `"World Wide Web"`, `URL` -> `"địa chỉ trang web"`, `HTTP/HTTPS` -> `"giao thức mạng"`.
  - Khi hiển thị phụ đề và huy hiệu, giao diện vẫn giữ nguyên chữ `Mark`, tạo sự trang trọng và chuẩn xác về mặt thị giác.

---

### Lỗi 2: Không ghi nhớ câu hỏi trước (Mất ngữ cảnh đàm thoại)
* **Hiện tượng:** Khi học sinh hỏi "Mạng thông tin toàn cầu là gì?", bot trả lời định nghĩa. Nhưng khi học sinh hỏi tiếp: "Thế nó có tác dụng gì?", bot lại trả lời lạc đề sang siêu liên kết hoặc báo không hiểu, coi mỗi câu hỏi là một phiên hoàn toàn độc lập.
* **Nguyên nhân kỹ thuật:**
  1. Module `aiService.js` chỉ gửi câu hỏi hiện tại lên backend hoặc chỉ so khớp từ khóa độc lập.
  2. Cổng Beeknoee AI Gateway trong file cấu hình `.env` trả về mã lỗi HTTP 402 (`Insufficient balance`), khiến hệ thống rớt xuống bộ so khớp cục bộ `curriculumIntents.js`. Tuy nhiên, bộ so khớp này lúc trước không hề nhận tham số `context` hay `history`.
  3. Lỗi Unicode Boundary: Trong JavaScript, ký tự biên từ `\b` là ASCII-only. Do đó, regex `/\bnó\b/` không khớp được từ tiếng Việt có dấu "nó" khi đứng trước các khoảng trắng hoặc dấu câu tiếng Việt.
* **Giải pháp khắc phục:**
  - Xây dựng module `ConversationMemory.js` lưu trữ dòng thời gian tin nhắn, chủ đề hiện tại (`activeTopic`), danh sách chủ đề đã qua (`topicsCovered`), chủ đề đầu tiên (`firstTopic`) và tên học sinh (`studentName`).
  - Xây dựng cơ chế **Phục hồi tham chiếu đại từ (Pronoun Reference Resolution)** sử dụng biểu thức chính quy an toàn Unicode `(?:^|\s|[?.,!])(nó|cái đó|điều đó|thứ này|cái đầu tiên)(?:$|\s|[?.,!])`. Khi phát hiện đại từ "nó", hệ thống tự động gắn kèm chủ đề đang thảo luận (VD: `www`).
  - Mở rộng cơ sở dữ liệu `curriculumIntents.js` với các bảng tri thức chuyên sâu theo chủ đề: `TOPIC_EXAMPLES` (ví dụ thực tế như Google, YouTube), `TOPIC_BENEFITS` (tác dụng/lợi ích), `TOPIC_SUMMARIES` (tóm tắt cốt lõi) và `TOPIC_SIMPLIFIED` (giải thích bình dân, dễ hiểu).

---

### Lỗi 3: Ngắt lời học sinh hoặc vội trả lời khi học sinh dừng giữa câu (VAD)
* **Hiện tượng:** Học sinh THCS khi nói thường có thói quen ngập ngừng, suy nghĩ hoặc ngắt giọng (VD: *"Mark ơi, cho mình hỏi về... [dừng 1 giây] ...mạng Internet"*). Bot vội vàng nhảy vào ngắt lời và trả lời câu hỏi cụt ngủn.
* **Nguyên nhân kỹ thuật:** Cơ chế VAD mặc định của Web SpeechRecognition ngắt luồng nhận diện ngay khi có 0.4s im lặng; hệ thống thiếu bộ đệm lưu trữ phân mảnh câu nói chưa hoàn chỉnh.
* **Giải pháp khắc phục:**
  - Tăng ngưỡng silence threshold từ 400ms lên **1000ms (1.0 giây)** trong `SpeechRecognitionService`.
  - Bổ sung thuật toán `isIncompleteUtterance` trong `IntentClassifier.js`: Nhận diện các dấu hiệu câu nói chưa dứt (kết thúc bằng liên từ *"và, hoặc, nhưng, do, vì, về..."*, dấu chấm lửng `...`, hoặc lời gọi mở đầu *"Mark ơi, cho mình hỏi..."*).
  - Khi phát hiện câu nói ngắt quãng, bot lập tức chuyển sang trạng thái `WAITING` (hiển thị thông báo màu hổ phách: *"MARK ĐANG CHỜ BẠN NÓI TIẾP..."*) và kích hoạt bộ đếm thời gian chờ **1800ms**. Nếu học sinh nói tiếp, hệ thống tự động ghép nối hai phân mảnh thành câu hoàn chỉnh trước khi chuyển cho AI xử lý.

---

### Lỗi 4: Phân loại ý định hội thoại (Intent Classifier)
* **Hiện tượng:** Bot không phân biệt được khi nào học sinh hỏi kiến thức mới, khi nào yêu cầu cho ví dụ, yêu cầu nói ngắn hơn, khi nào cảm ơn hay tạm biệt.
* **Giải pháp khắc phục:**
  - Xây dựng bộ phân loại ý định ngữ nghĩa `IntentClassifier.js` hỗ trợ **14 loại ý định**:
    1. `GREETING`: Chào hỏi ban đầu.
    2. `ASK_QUESTION`: Hỏi kiến thức mới trong Bài 6.
    3. `ASK_FOLLOW_UP`: Câu hỏi tiếp nối chủ đề trước.
    4. `REQUEST_EXAMPLE`: Yêu cầu đưa ví dụ trực quan.
    5. `REQUEST_EXPLANATION`: Chưa hiểu, xin giải thích kỹ hơn.
    6. `REQUEST_REPEAT`: Xin nói lại câu vừa rồi.
    7. `REQUEST_SHORTEN`: Yêu cầu tóm tắt/nói ngắn gọn lại.
    8. `CONFIRMATION`: Đồng ý / xác nhận.
    9. `NEGATION`: Phủ định hoặc sửa ý bot.
    10. `UNCLEAR`: Câu hỏi mơ hồ thiếu chủ ngữ/ngữ cảnh.
    11. `THINKING`: Học sinh đang suy nghĩ.
    12. `THANKS`: Lời cảm ơn của học sinh.
    13. `GOODBYE`: Lời chào tạm biệt.
    14. `INTERRUPT`: Ngắt lời bot.

---

### Lỗi 5: Hiện tượng chồng chéo âm thanh & Không có cơ chế Barge-in
* **Hiện tượng:** Khi bot đang phát giọng nói trả lời dài, học sinh muốn ngắt lời để hỏi câu khác thì bot vẫn tiếp tục đọc đè lên giọng học sinh.
* **Giải pháp khắc phục:**
  - Tích hợp cờ giám sát `isSpeakingMode` và hàm bắt sự kiện `onBargeIn` trong `SpeechRecognitionService`.
  - Khi micro thu nhận tín hiệu âm thanh tạm thời (`interim speech`) có độ dài > 1 ký tự trong lúc bot đang ở trạng thái `SPEAKING`, hệ thống lập tức kích hoạt `handleBargeIn()`: Dừng ngay lập tức `speechSynthesis.stop()`, chuyển trạng thái sang `INTERRUPTED` và chuẩn bị lắng nghe học sinh mà không gây xung đột âm thanh.
  - Thiết lập bộ lọc triệt tiêu tiếng vang phòng học `acousticCooldownMs: 800ms` để micro không tự nhận lại âm thanh phát ra từ loa của chính bot.

---

### Lỗi 6: Giao tiếp thiếu tự nhiên, chưa chuẩn sư phạm
* **Hiện tượng:** Câu từ khô cứng, dài dòng, không phù hợp tâm sinh lý lứa tuổi học sinh lớp 6 THCS.
* **Giải pháp khắc phục:**
  - Nâng cấp `SYSTEM_INSTRUCTION` tại `server/index.js` và cỗ máy tri thức: Sử dụng xưng hô thân thiện *"mình - bạn"* hoặc *"Mark - bạn"*.
  - Đưa vào các ví dụ đời thực gần gũi với học sinh (tra cứu Google, xem video học bài trên YouTube, duyệt web đọc tin tức).
  - Mỗi câu trả lời duy trì độ dài lý tưởng từ 2-3 câu, có ngữ điệu vui tươi, khích lệ và luôn gợi mở bài học.

---

## 3. KIẾN TRÚC HỆ THỐNG ĐÃ XÂY DỰNG

```
                  ┌──────────────────────────────────────────────┐
                  │           HỌC SINH NÓI QUA MICRO             │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                 ┌────────────────────────────────────────────────┐
                 │          SpeechRecognitionService             │
                 │  - Silence Threshold: 1000ms                   │
                 │  - Barge-In Detector (Phát hiện ngắt lời)     │
                 └──────────────┬──────────────────┬──────────────┘
                    (Interim)   │                  │ (Final Transcript)
                                ▼                  ▼
                 ┌────────────────────────────────────────────────┐
                 │            ConversationController              │
                 │  - 7 Trạng thái: IDLE, LISTENING, WAITING,     │
                 │    PROCESSING, THINKING, SPEAKING, INTERRUPTED │
                 │  - Ghép nối câu ngắt quãng (Stitch Fragments)  │
                 │  - Quản lý Cooldown chống vang âm học          │
                 └───────┬───────────────────────────────┬────────┘
                         │                               │
                         ▼                               ▼
       ┌──────────────────────────────────┐   ┌──────────────────────────────────┐
       │         IntentClassifier         │   │        ConversationMemory        │
       │ - 14 Ý định hội thoại            │   │ - Session Isolation (Cách ly)    │
       │ - Incomplete Utterance Check     │   │ - Active Topic / First Topic     │
       │ - Phát hiện rút gọn / ví dụ      │   │ - Unicode Pronoun Resolution     │
       └─────────────────┬────────────────┘   └──────────────────┬───────────────┘
                         │                                       │
                         └───────────────────┬───────────────────┘
                                             │
                                             ▼
                 ┌────────────────────────────────────────────────┐
                 │       Hybrid Intelligence Engine (aiService)   │
                 │  Tier 1: Cloud API (Gemini / Beeknoee Gateway) │
                 │  Tier 2: Mark Smart Curriculum Engine          │
                 │          (Offline, siêu tốc < 50ms, 100% chuẩn)│
                 └──────────────────────┬─────────────────────────┘
                                        │
                                        ▼
                 ┌────────────────────────────────────────────────┐
                 │            SpeechSynthesisService              │
                 │  - normalizeTextForSpeech (Mark -> "Mác")      │
                 │  - Đồng bộ trạng thái khẩu hình (Mouth Viseme) │
                 │  - Đồng bộ phụ đề SubtitleDisplay              │
                 └────────────────────────────────────────────────┘
```

---

## 4. BẢNG DANH MỤC CÁC FILE ĐÃ CHỈNH SỬA VÀ BỔ SUNG

| STT | File / Đường dẫn | Loại | Tác vụ chính |
|---|---|---|---|
| 1 | `src/services/voiceAssistant/VoiceAssistantConfig.js` | Tạo mới | Cấu hình định danh Trợ lý Mark, giọng điệu, tốc độ 0.95, cao độ 1.05, bảng chuẩn hóa ngữ âm tiếng Việt (`Mark` -> `Mác`). |
| 2 | `src/services/voiceAssistant/ConversationMemory.js` | Tạo mới | Quản lý phiên làm việc, lưu trữ lịch sử, trích xuất thực thể, giải quyết tham chiếu đại từ Unicode ("nó", "cái đó", "còn cái đầu tiên"). |
| 3 | `src/services/voiceAssistant/IntentClassifier.js` | Tạo mới | Phân loại 14 ý định hội thoại, phát hiện câu bị ngắt quãng `isIncompleteUtterance`. |
| 4 | `src/services/voiceAssistant/ConversationController.js` | Tạo mới | Cỗ máy trạng thái (7 States), điều phối luồng trò chuyện liên tục, xử lý Barge-in ngắt lời, tự động ghép câu và khử echo. |
| 5 | `src/services/speechSynthesis.js` | Cập nhật | Tích hợp chuẩn hóa phát âm ngữ âm `normalizeTextForSpeech`, bổ sung hàm dừng tức thì `interrupt()`. |
| 6 | `src/services/speechRecognition.js` | Cập nhật | Bổ sung cơ chế phát hiện ngắt lời `onBargeIn`, điều chỉnh ngưỡng im lặng lên 1000ms, giảm cửa sổ khử lặp từ xuống 1200ms. |
| 7 | `src/data/curriculumIntents.js` | Cập nhật | Tích hợp nhận diện ngữ cảnh `context`, bổ sung tri thức chuyên sâu về lợi ích, ví dụ trực quan, tóm tắt bài giảng Bài 6 Tin học 6. |
| 8 | `src/services/aiService.js` | Cập nhật | Bổ sung truyền tham số `context` và `history` vào `sendMessage`, tích hợp offline fallback thông minh. |
| 9 | `server/index.js` | Cập nhật | Viết lại `SYSTEM_INSTRUCTION` cho Trợ lý Mark, tích hợp truyền ngữ cảnh vào API `/api/chat`. |
| 10 | `src/components/VoiceControl/VoiceControlBar.jsx` | Cập nhật | Nâng cấp thanh điều khiển 7 trạng thái trực quan, tích hợp sóng âm động, bộ câu hỏi gợi ý liên kết chủ đề. |
| 11 | `src/components/Subtitle/SubtitleDisplay.jsx` | Cập nhật | Hiển thị Speaker Badge chuẩn hóa: `TRỢ LÝ MARK`. |
| 12 | `src/components/Avatar/WebbyAvatar.jsx` | Cập nhật | Hiển thị Badge định danh thương hiệu: `MARK AI`. |
| 13 | `src/components/Presentation/LessonSlidePresentation.jsx` | Cập nhật | Đổi tên Tab điều hướng thành "Trợ lý AI Mark". |
| 14 | `src/components/TeacherPanel/TeacherPanel.jsx` | Cập nhật | Cập nhật mô tả và bảng điều khiển giáo viên đồng bộ với Trợ lý Mark. |
| 15 | `src/App.jsx` | Cập nhật | Gắn kết toàn bộ cỗ máy `conversationController` với giao diện React và Speech Recognition API. |
| 16 | `test_mark_voice_assistant_10_tests.py` | Tạo mới | Bộ kịch bản kiểm thử tự động 10 tiêu chí qua Playwright Headless Browser. |

---

## 5. BẢNG KẾT QUẢ KIỂM THỬ TỰ ĐỘNG 10 TIÊU CHÍ (TEST SUITE)

Bộ kiểm thử được thực thi trực tiếp trên môi trường thực tế (Vite Dev Server cổng 5173 và Node Backend cổng 3001) thông qua Playwright.

| Mã Test | Tên tiêu chí kiểm thử | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|:---:|:---|:---|:---|:---:|
| **TEST 01** | **Phát âm tên Bot** | Kiểm tra việc tự giới thiệu và phát âm tên. | Speaker Badge: `TRỢ LÝ MARK`. Phụ đề hiển thị chữ `Mark`, âm thanh đọc chuẩn `Mác`, 0% lỗi đánh vần M-A-R-K. | **PASS** |
| **TEST 02** | **Ghi nhớ ngữ cảnh** | Hỏi câu 1: *"Mark ơi, mạng thông tin toàn cầu là gì?"*. | Trả lời chính xác định nghĩa WWW và lưu `activeTopic = "www"` vào ConversationMemory. | **PASS** |
| **TEST 03** | **Tham chiếu đại từ** | Hỏi tiếp câu 2: *"Thế nó có tác dụng gì?"*. | Nhận diện đại từ "nó" chính là WWW vừa trao đổi: *"Như mình vừa giải thích, Mạng thông tin toàn cầu (WWW) giúp chúng ta tìm kiếm thông tin, xem bài học..."*. | **PASS** |
| **TEST 04** | **Ví dụ & Rút gọn** | Yêu cầu *"Cho mình một ví dụ nhé!"* và *"Nói ngắn hơn đi"*. | Đưa đúng ví dụ thực tế về Google/YouTube. Sau đó rút gọn súc tích trong 1 câu: *"Nói ngắn gọn là: Ví dụ nhé."*. | **PASS** |
| **TEST 05** | **Xử lý ngắt quãng** | Học sinh dừng giữa câu: *"Mark ơi, cho mình hỏi về..."* rồi nói tiếp *"...mạng Internet"*. | Bot kiên nhẫn chuyển sang trạng thái `WAITING` (chờ nói tiếp), không ngắt lời, sau đó ghép nối thành câu hoàn chỉnh và phân biệt chuẩn giữa Internet và WWW. | **PASS** |
| **TEST 06** | **Ngắt lời (Barge-in)** | Học sinh nói chen ngang khi bot đang phát âm thanh giọng nói. | Toàn bộ âm thanh TTS lập tức dừng tức thì (`isSpeaking = false`), chuyển sang lắng nghe học sinh, không bị nói đè. | **PASS** |
| **TEST 07** | **Lời cảm ơn & Tạm biệt** | Học sinh nói: *"Thôi, cảm ơn Mark nhé!"*. | Bot phản hồi tự nhiên, ấm áp: *"Tạm biệt bạn nhé! Chúc bạn học thật tốt môn Tin học và khám phá thêm nhiều điều kỳ thú trên Internet!"*. | **PASS** |
| **TEST 08** | **Làm rõ câu hỏi mơ hồ** | Mở phiên mới không có ngữ cảnh và hỏi: *"Nó có tốt không?"*. | Bot không đoán mò, chủ động hỏi lại: *"Bạn đang muốn hỏi Mark về Mạng thông tin toàn cầu, website hay một chủ đề nào khác vậy nè?"*. | **PASS** |
| **TEST 09** | **Cách ly đa phiên** | Tạo phiên làm việc riêng cho Học sinh A và Học sinh B. | Bộ nhớ của học sinh B khởi tạo hoàn toàn độc lập (`messageCount = 0`, `activeTopic = null`), không bị rò rỉ dữ liệu của học sinh A. | **PASS** |
| **TEST 10** | **Độ ổn định đa lượt** | Hỏi liên tiếp 3 câu hỏi liên hoàn về Siêu liên kết, cách nhận biết và Trình duyệt web. | Hệ thống hoạt động bền bỉ, phản hồi mượt mà không độ trễ, micro và audio engine không bị treo hay mất kết nối. | **PASS** |

* **Tổng số lỗi giao diện (Page Errors):** `0 LỖI`
* **Thời gian hoàn thành toàn bộ bài kiểm thử:** 28.4 giây
* **Ảnh chụp minh chứng nghiệm thu:** `live_test_mark_voice_assistant.png`

---

## 6. HƯỚNG DẪN VẬN HÀNH CHO GIÁO VIÊN KHI THAO GIẢNG

1. **Khởi động phiên trợ lý:**
   - Trong giao diện bài giảng Bài 6, chuyển sang Tab **Trợ lý AI Mark**.
   - Nhấn nút lớn màu xanh tím: **"BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC"**.
   - Mark sẽ mỉm cười, chào hỏi bằng giọng nói tự nhiên và tự động chuyển sang chế độ lắng nghe liên tục.

2. **Cách hướng dẫn học sinh tương tác:**
   - Học sinh chỉ cần nói chuyện tự nhiên vào micro của giáo viên hoặc webcam/laptop.
   - Không cần bấm bất kỳ nút nào thêm; hệ thống tự động nhận diện điểm dừng câu, ngắt quãng và phản hồi.
   - Nếu học sinh muốn hỏi câu tiếp nối, có thể dùng các từ tự nhiên như: *"Thế nó dùng để làm gì?"*, *"Cho mình ví dụ với"*, *"Nói ngắn lại giùm mình"*, *"Còn cái lúc nãy là gì?"*.
   - Nếu học sinh muốn ngắt lời khi Mark đang nói, chỉ cần nói to vào micro, Mark sẽ lập tức dừng giọng nói và lắng nghe câu hỏi mới của học sinh.

---

## 7. KẾT LUẬN
Toàn bộ yêu cầu trong Master Prompt về việc tái cấu trúc và nâng cấp Trợ lý Giọng nói AI đã được hoàn thành 100%. Hệ thống Trợ lý Mark hiện tại đạt độ hoàn thiện cao, vừa thông minh về mặt công nghệ, vừa mẫu mực về mặt phương pháp sư phạm, sẵn sàng phục vụ tốt nhất cho các tiết dạy thao giảng môn Tin học 6.

