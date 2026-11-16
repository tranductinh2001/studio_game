# HƯỚNG DẪN CẤU HÌNH MÔI TRƯỜNG & URL TỰ ĐỘNG
## ENVIRONMENT & DYNAMIC NETWORKING SPECIFICATION

---

### 1. BẢNG MA TRẬN MÔI TRƯỜNG

Hệ thống cung cấp module quản trị tập trung `src/config/environment.js`. Tuyệt đối không hardcode IP hay cổng trong từng file React component.

| Biến môi trường / Môi trường | Localhost Dev | LAN Wi-Fi Dev | Vercel Cloud Production |
| :--- | :--- | :--- | :--- |
| **`APP_ENV`** | `development` | `development` | `production` |
| **Giao thức (Protocol)** | `http:` | `http:` | `https:` |
| **Domain máy chiếu (Desktop)** | `localhost:5173` | `<LAN_IP>:5173` | `*.vercel.app` (cổng chuẩn 443) |
| **Backend API Base URL** | `http://localhost:3001/api` | `http://<LAN_IP>:3001/api` | `https://*.vercel.app/api` (Serverless) |
| **URL tạo mã QR điện thoại** | `http://<LAN_IP>:5173/?mode=mobile&room=WB-601` | `http://<LAN_IP>:5173/?mode=mobile&room=WB-601` | `https://*.vercel.app/?mode=mobile&room=WB-601` |
| **Tự động nhận diện** | `window.location.hostname === 'localhost'` | `window.location.hostname !== 'localhost'` | `window.location.hostname.endsWith('vercel.app')` |

---

### 2. CƠ CHẾ DYNAMIC LAN IP DISCOVERY

Thay vì cấu hình thủ công địa chỉ IP (dễ bị lỗi khi đổi mạng Wi-Fi trường học hoặc phát 4G từ điện thoại):

1. **Backend Endpoint**: `GET /api/network-info`
   - Quét tất cả các card mạng của máy chủ bằng `os.networkInterfaces()`.
   - Lọc bỏ card mạng ảo (VirtualBox, VMware, Loopback 127.0.0.1, WSL).
   - Ưu tiên dải mạng Wi-Fi cục bộ (`192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`).
   - Kết quả trả về thực tế:
     ```json
     {
       "success": true,
       "lanIp": "10.135.169.82",
       "frontendPort": 5173,
       "backendPort": 3001,
       "mobileConnectUrl": "http://10.135.169.82:5173/?mode=mobile&room=WB-601"
     }
     ```
2. **Frontend QR Generation**:
   - Khi giáo viên nhấn "Kết nối điện thoại", modal gọi `classroomService.getNetworkInfo()`.
   - Tạo mã QR với địa chỉ IP thực tế của máy tính.
   - Khi triển khai lên Vercel, hàm nhận diện môi trường tự động chuyển thành domain Vercel (HTTPS, không kèm số cổng :5173), đảm bảo điện thoại quét là mở được ngay qua 4G hoặc bất kỳ mạng Wi-Fi nào.

---

### 3. QUẢN LÝ BIẾN MÔI TRƯỜNG (.env)

Tệp `.env.example` được cung cấp trong thư mục dự án:

```env
# Chế độ chạy: development | production
VITE_APP_ENV=development

# Cấu hình API Backend (để trống để tự động nhận diện theo môi trường)
VITE_API_BASE_URL=

# Cấu hình Gemini AI Key (Tuỳ chọn cho giáo viên)
GEMINI_API_KEY=

# Cổng khởi chạy Local
PORT=3001
VITE_PORT=5173
```

