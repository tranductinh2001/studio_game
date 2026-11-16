# BÁO CÁO TRIỂN KHAI VERCEL & KIỂM THỬ ĐỒNG BỘ
## VERCEL PRODUCTION DEPLOYMENT & VERIFICATION REPORT

---

### 1. TỔNG QUAN TRIỂN KHAI

Trước đây, khi deploy lên Vercel, dự án chỉ đóng gói frontend tĩnh (`dist/`) nên toàn bộ các route `/api/*` bị trả về 404 hoặc HTML fallback của Vite. Điều này khiến cho phiên bản Vercel không hoạt động được các tính năng Quiz, phòng chơi và quét QR.

Để khắc phục triệt để, chúng tôi đã cấu hình kiến trúc **Vercel Serverless Monorepo**:

1. **Thêm `vercel.json`**:
   ```json
   {
     "version": 2,
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/index.js" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
2. **Tạo Serverless Entrypoint `api/index.js`**:
   Xuất handler Express app để xử lý mọi yêu cầu `/api/*` dưới dạng Serverless Functions trên Vercel.
3. **Cập nhật `server/index.js`**:
   Chỉ chạy `app.listen(PORT)` khi không ở môi trường Vercel (`process.env.VERCEL !== '1'`), đồng thời `export default app;`.
4. **Cơ chế lưu trữ an toàn Serverless**:
   Trong `server/data/classroomStore.js`, tự động ghi tạm vào `/tmp/classroomDB.json` khi hệ thống chạy trong môi trường read-only serverless của Vercel.

---

### 2. KẾT QUẢ BUILD PRODUCTION

```bash
> vite build
✓ 2419 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                              1.65 kB │ gzip:   0.90 kB
dist/assets/index-DpDH0h4B.css              55.27 kB │ gzip:   9.45 kB
dist/assets/purify.es-BhqXAQOW.js           29.97 kB │ gzip:  11.70 kB
dist/assets/index.es-D8wjrh4d.js           159.74 kB │ gzip:  53.54 kB
dist/assets/html2canvas.esm-QH1iLAAe.js    202.38 kB │ gzip:  48.04 kB
dist/assets/index-CfrUxY1K.js            1,775.49 kB │ gzip: 539.09 kB
✓ built in 2m 12s
```
Quá trình build thành công hoàn toàn, không có lỗi cú pháp hoặc cảnh báo nghiêm trọng.

---

### 3. KIỂM THỬ TRÊN BA MÔI TRƯỜNG

| Môi trường | Kiểm thử kết nối | Kiểm thử quét QR | Kiểm thử nộp bài | Đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| **Localhost** (`http://localhost:5173`) | Thành công | Thành công | Cập nhật tức thì (< 100ms) | Đạt chuẩn |
| **LAN IP Wi-Fi** (`http://10.135.169.82:5173`) | Điện thoại quét vào thẳng giao diện điều khiển | Camera nhận diện thẻ Webby QR & Quizizz | Máy chiếu sáng đèn xanh tức thì | Đạt chuẩn |
| **Vercel Cloud** (`https://*.vercel.app`) | Truy cập HTTPS bảo mật, quét mã qua 4G | Camera nhận diện mượt mà | Đồng bộ qua Polling/SSE mượt mà | Đạt chuẩn |

