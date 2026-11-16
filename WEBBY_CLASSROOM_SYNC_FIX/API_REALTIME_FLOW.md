# ĐẶC TẢ TÀI LIỆU API & LUỒNG REALTIME (API & REALTIME FLOW)
## HTTP RESTFUL + SERVER-SENT EVENTS (SSE) SPECIFICATION

---

### 1. DANH SÁCH ENDPOINTS RESTFUL

| Phương thức | Đường dẫn API | Mục đích | Yêu cầu Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/network-info` | Lấy thông tin mạng LAN & URL kết nối điện thoại | Không |
| `GET` | `/api/classroom/rooms/:code` | Lấy trạng thái phòng chơi | Không |
| `POST` | `/api/classroom/rooms` | Tạo phòng chơi mới | `{ roomCode, classId }` |
| `POST` | `/api/classroom/rooms/:code/start` | Giáo viên bấm Bắt đầu phòng | Không |
| `POST` | `/api/classroom/rooms/:code/class/set` | Giáo viên đổi lớp phụ trách | `{ classId }` |
| `POST` | `/api/classroom/rooms/:code/question` | Giáo viên đặt câu hỏi | `{ question, state }` |
| `POST` | `/api/classroom/rooms/:code/lock` | Giáo viên khóa nhận bài | Không |
| `POST` | `/api/classroom/rooms/:code/reveal` | Giáo viên công bố đáp án | Không |
| `POST` | `/api/classroom/rooms/:code/responses` | Quét thẻ QR gửi đáp án (Batch) | `{ responses: [...] }` |
| `POST` | `/api/classroom/rooms/:code/groups/upload` | Điện thoại nộp ảnh bài nhóm (A3/A4) | `{ groupNumber, imageUrl }` |
| `GET` | `/api/classroom/rooms/:code/analytics` | Lấy thống kê lớp học | Không |
| `GET` | `/api/classroom/rooms/:code/events` | Luồng SSE nhận sự kiện Realtime | Header `text/event-stream` |

---

### 2. CÁC SỰ KIỆN REALTIME (SSE EVENT MATRIX)

Mọi sự kiện được truyền qua định dạng SSE: `data: {"type": "<EVENT_TYPE>", "payload": <DATA>}\n\n`.

| Tên sự kiện (`type`) | Kích hoạt khi nào | Tác vụ trên Máy chiếu giáo viên | Tác vụ trên Điện thoại giáo viên |
| :--- | :--- | :--- | :--- |
| `ROOM_STARTED` | Giáo viên nhấn "Bắt đầu" | Đổi trạng thái từ `WAITING` sang `ACTIVE` | Kích hoạt camera quét và sẵn sàng nhận diện |
| `ROOM_CLASS_CHANGED` | Giáo viên chọn lớp khác (6A $\leftrightarrow$ 6B) | Nạp danh sách học sinh mới, reset ma trận nộp bài | Cập nhật tên lớp, tải lại bản đồ thẻ học sinh |
| `QUESTION_UPDATED` | Giáo viên chuyển câu hỏi mới | Hiển thị câu hỏi mới, trạng thái `COLLECTING` | Reset bộ đệm quét thẻ, sẵn sàng quét câu mới |
| `RESPONSES_UPDATED` | Điện thoại quét được thẻ học sinh | Ô học sinh sáng đèn xanh báo hiệu đã nộp | Cập nhật số lượng đáp án đã đồng bộ thành công |
| `QUESTION_LOCKED` | Giáo viên bấm "Khóa bài" | Huy hiệu hiển thị `ĐÃ KHÓA`, dừng đếm ngược | Báo hiệu `⚠️ Giáo viên đã khóa nhận đáp án` |
| `ANSWER_REVEALED` | Giáo viên bấm "Công bố" | Hiệu ứng pháo hoa, tô màu xanh/đỏ cho ma trận | Hiển thị đáp án đúng trên màn hình điều khiển |
| `GROUP_WORK_SUBMITTED` | Điện thoại nộp ảnh bài nhóm | Chiếu ảnh bài nhóm lên khung trưng bày A3/A4 | Báo `Đã gửi bài thành công!` |

---

### 3. CƠ CHẾ AUTO-FALLBACK POLLING (DÀNH CHO VERCEL SERVERLESS)

Trong file `src/services/classroomService.js`:

```javascript
// Khi SSE gặp lỗi (do timeout của serverless hoặc mạng chập chờn)
sseSource.onerror = () => {
  sseSource.close();
  // Kích hoạt cơ chế Polling thông minh chu kỳ 1.2s
  startPollingFallback();
};

function poll() {
  fetch(`/api/classroom/rooms/${roomCode}`)
    .then(res => res.json())
    .then(data => {
      const hash = generateStateHash(data.room);
      if (hash !== lastStateHash) {
        lastStateHash = hash;
        onEvent({ type: 'ROOM_STATE', payload: data.room });
      }
    });
}
```

Nhờ cơ chế này, ngay cả khi triển khai trên Vercel Serverless (nơi không duy trì kết nối TCP vĩnh viễn), máy chiếu và điện thoại vẫn đồng bộ dữ liệu trơn tru và hoàn toàn tức thì.

