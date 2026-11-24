# PROMPT YÊU CẦU ANTIGRAVITY / AI CODING AGENT
# THIẾT KẾ SLIDE WEB TƯƠNG TÁC ĐỒNG BỘ GIÁO ÁN THAO GIẢNG TIN HỌC 8
## BÀI 7: TRỰC QUAN HOÁ DỮ LIỆU BẰNG BIỂU ĐỒ (TIẾT 12 – TIẾT 2: THỰC HÀNH TẠO BIỂU ĐỒ)
### PHẠM VI TRÌNH CHIẾU: TẬP TRUNG TỪ HOẠT ĐỘNG 2 ĐẾN HẾT (HOẠT ĐỘNG 2, 3, 4)
*(Hoạt động 1 Khởi động giáo viên đã chiếu trực tiếp qua tab Trò chơi Game Center trên Webby Classroom)*
**Trường THCS Đắk Trôi – Giáo viên thực hiện: Thầy Trần Đức Tình**

---

```markdown
Bạn là chuyên gia lập trình Front-end (React/Vite/Tailwind CSS) và thiết kế hệ thống tương tác dạy học số (EdTech UX/UI).
Nhiệm vụ của bạn là **lập trình hệ thống Web Slide bài giảng tương tác trình chiếu đồng bộ** cho tiết thao giảng:
- **Môn học:** Tin học 8 – Bộ sách Kết nối tri thức với cuộc sống.
- **Tên bài dạy:** BÀI 7. TRỰC QUAN HOÁ DỮ LIỆU BẰNG BIỂU ĐỒ (TIẾP THEO) – TIẾT 12 (TIẾT 2: THỰC HÀNH TẠO BIỂU ĐỒ).
- **Ứng dụng tích hợp:** Ứng dụng sẵn có WEBBY CLASSROOM – AI Agent & Smart Assessment | THCS Đắk Trôi (đang chạy tại http://localhost:5173/).
- **Giáo viên thực hiện:** Thầy Trần Đức Tình – Trường THCS Đắk Trôi.

---

### LƯU Ý SƯ PHẠM ĐẶC BIỆT VỀ TIẾN TRÌNH LỚP HỌC:
- **Hoạt động 1 (Mở đầu / Khởi động):** Giáo viên đã trình chiếu trực tiếp bằng cách chuyển sang tab **Đấu trường Game (Game Center / Lucky Wheel)** có sẵn trên ứng dụng Webby Classroom để quay số chọn học sinh trả lời thử thách kết nối.
- **Hệ thống Slide trình chiếu này:** Bắt đầu chiếu ngay từ **HOẠT ĐỘNG 2 (TIẾN TRÌNH 2A) ĐẾN HẾT HOẠT ĐỘNG 4**, gồm **4 slide cốt lõi** đồng bộ 100% với từng câu chữ, bảng số liệu và các bước trong Giáo án Word (`tinhoc8_tuan12_Bai07_Trinh-bay-du-lieu-bang-bieu-do_Tiet12.docx`).

---

### CẤU TRÚC CHI TIẾT 4 SLIDE TRÌNH CHIẾU TƯƠNG TÁC (TỪ HOẠT ĐỘNG 2 ĐẾN HẾT)

#### SLIDE 1: HOẠT ĐỘNG 2 – TIẾN TRÌNH 2A: THỰC HÀNH TẠO BIỂU ĐỒ CỘT (COLUMN CHART) [8 - 10 PHÚT]
* **Header:** Badge `HOẠT ĐỘNG 2 – TIẾN TRÌNH 2A` | `MỤC 2 SGK TRANG 33 - 34`
* **Tiêu đề lớn:** `QUY TRÌNH TẠO BIỂU ĐỒ CỘT & SỬ DỤNG NÚT CHART ELEMENTS (+)`
* **Bố cục chia đôi màn hình (Split-Screen Grid cols-12):**
  * **Cột trái (7 cols) – Quy trình thực hành & Mô phỏng bảng tính Excel:**
    - **Bảng dữ liệu mẫu (Hình 7.3 SGK tr.33):**
      | Ô | A | B |
      | :---: | :--- | :---: |
      | **2** | **Nội dung Tin học** | **Số học sinh lựa chọn** |
      | **3** | Soạn thảo văn bản | 18 |
      | **4** | Bảng tính điện tử | 12 |
      | **5** | Trình chiếu đa phương tiện | 10 |
      | **6** | Lập trình Scratch | 5 |
    - **3 Bước thao tác chuẩn mực trên Excel:**
      * *Bước 1:* Quét chọn vùng dữ liệu `A2:B6` (có viền nét đứt xanh phát sáng mô phỏng vùng chọn Excel).
      * *Bước 2:* Dải lệnh `Insert` $\rightarrow$ nhóm `Charts` $\rightarrow$ chọn biểu tượng `Insert Column or Bar Chart` $\rightarrow$ chọn kiểu `2-D Column`.
      * *Bước 3 (Trọng tâm tương tác):* **Mô phỏng nút dấu cộng `+` Chart Elements ở góc trên bên phải biểu đồ:**
        - Checkbox tương tác `Chart Title`: Khi bật $\rightarrow$ Biểu đồ trên slide hiện tiêu đề: *"KẾT QUẢ KHẢO SÁT NỘI DUNG TIN HỌC LỚP 8A"*.
        - Checkbox tương tác `Data Labels`: Khi bật $\rightarrow$ Các con số 18, 12, 10, 5 hiện nổi bật trên đỉnh từng cột.
        - Checkbox tương tác `Axis Titles`: Khi bật $\rightarrow$ Trục hoành hiện *"Nội dung"*, trục tung hiện *"Số học sinh"*.
  * **Cột phải (5 cols) – Đồng hồ đếm ngược thực hành (Countdown Timer):**
    - Màn hình số Digital hiển thị thời gian: `08:00`.
    - Thanh tiến trình co lại mượt mà, đổi màu động: Xanh lá (> 50%) $\rightarrow$ Vàng hổ phách (20-50%) $\rightarrow$ Đỏ nhấp nháy (< 20%).
    - Bộ nút điều khiển giáo viên: `Bắt đầu`, `Tạm dừng`, `Đặt lại`, phím nhanh `5 phút`, `8 phút`, `10 phút`.
    - Âm thanh tích tắc 10 giây cuối và chuông ngân vang khi hết giờ (Web Audio API synth).

---

#### SLIDE 2: HOẠT ĐỘNG 2 – TIẾN TRÌNH 2B: THỰC HÀNH TẠO BIỂU ĐỒ HÌNH QUẠT TRÒN (PIE CHART) [8 - 10 PHÚT]
* **Header:** Badge `HOẠT ĐỘNG 2 – TIẾN TRÌNH 2B` | `MỤC 2 SGK TRANG 34 - 35`
* **Tiêu đề lớn:** `TẠO BIỂU ĐỒ HÌNH QUẠT TRÒN & ĐỊNH DẠNG TỈ LỆ PHẦN TRĂM (%)`
* **Bố cục 2 phần tương phản:**
  * **Cột trái (6 cols) – Các bước tạo biểu đồ hình quạt tròn:**
    - Khối dữ liệu khảo sát tỉ lệ lựa chọn của học sinh.
    - Quy trình 3 bước:
      1. Quét chọn khối dữ liệu nội dung và số liệu.
      2. Thẻ `Insert` $\rightarrow$ trong nhóm `Charts` chọn `Insert Pie or Doughnut Chart` $\rightarrow$ chọn kiểu `2-D Pie`.
      3. Bấm nút dấu cộng `+` (**Chart Elements**) $\rightarrow$ tích chọn `Data Labels` $\rightarrow$ nháy mũi tên chọn `More Options` $\rightarrow$ tích chọn `Percentage (%)` để hiển thị nhãn tỉ lệ phần trăm thay vì số tuyệt đối.
  * **Cột phải (6 cols) – So sánh trực quan Biểu đồ cột vs Biểu đồ quạt tròn:**
    - Khung so sánh trực quan 2 thẻ màu đối xứng:
      * **Biểu đồ cột (Column Chart):** Tối ưu khi cần so sánh độ lớn (hơn/kém, cao/thấp) giữa các đối tượng độc lập.
      * **Biểu đồ quạt tròn (Pie Chart):** Tối ưu khi cần thấy rõ cơ cấu tỉ lệ phần trăm (%) đóng góp của từng thành phần trong tổng thể 100%.
    - Nút bấm `Chốt kiến thức ghi vở`: Hiển thị 3 gạch đầu dòng ngắn gọn, chuẩn mực để học sinh hoàn thiện vào vở ghi chép.

---

#### SLIDE 3: HOẠT ĐỘNG 3 – LUYỆN TẬP: BÁM SÁT 100% BÀI TẬP SGK TRANG 35 [10 - 12 PHÚT]
* **Header:** Badge `HOẠT ĐỘNG 3: LUYỆN TẬP` | `BÁM SÁT BÀI TẬP SGK TRANG 35`
* **Tiêu đề lớn:** `LUYỆN TẬP: XỬ LÝ DỮ LIỆU & TẠO SẢN PHẨM SỐ TRÊN MÁY TÍNH`
* **Thiết kế 2 Tab chuyển đổi linh hoạt:**
  * **TAB 1: BÀI TẬP 1 (Tệp thực hành `TGSDThietbiso.xlsx` – Hình 7.8 SGK tr.35):**
    - Chiếu bảng dữ liệu thời gian sử dụng thiết bị số trong tuần của học sinh khối 8:
      | Mục đích | Nam (giờ) | Nữ (giờ) |
      | :--- | :---: | :---: |
      | Học tập | 7.5 | 9.0 |
      | Giải trí (game, phim) | 12.0 | 8.5 |
      | Mạng xã hội | 8.0 | 9.5 |
      | Tra cứu thông tin | 4.5 | 5.0 |
      | **Tổng cộng** | **=SUM(B4:B7)** | **=SUM(C4:C7)** |
    - Mô phỏng nhập công thức hàm `=SUM(...)` tính tổng số giờ của nam và nữ.
    - Nút bấm `Xem biểu đồ cột so sánh mẫu`: Hiện biểu đồ cột so sánh nam - nữ theo từng mục đích (thấy rõ nam giải trí nhiều hơn, nữ học tập nhiều hơn).
    - Nút bấm `Xem biểu đồ quạt tròn cơ cấu mẫu`: Hiện biểu đồ quạt tròn thể hiện cơ cấu thời gian sử dụng của học sinh nữ.
  * **TAB 2: BÀI TẬP 2 (Hình 7.9 Doanh thu ngành công nghiệp phần mềm Việt Nam 2016 – 2020):**
    - Chiếu hình ảnh biểu đồ cột Hình 7.9 với số liệu từ 3,8 tỷ USD (2016) đến 5,4 tỷ USD (2020).
    - 2 thẻ câu hỏi tương tác dạng bấm lật mở (Click to Reveal):
      * *Câu hỏi 1:* "Tại sao trong trường hợp này lại sử dụng biểu đồ cột?"
        $\rightarrow$ *Đáp án chuẩn:* Dùng biểu đồ cột để so sánh rõ ràng quy mô doanh thu giữa các năm liên tiếp.
      * *Câu hỏi 2:* "Nhận xét xu hướng phát triển của ngành công nghiệp phần mềm Việt Nam?"
        $\rightarrow$ *Đáp án chuẩn:* Doanh thu tăng trưởng liên tục, đều đặn và vững chắc qua từng năm, khẳng định tiềm năng phát triển mạnh mẽ của công nghệ số nước ta.

---

#### SLIDE 4: HOẠT ĐỘNG 4 – VẬN DỤNG & TỔNG KẾT BÀI HỌC [5 - 7 PHÚT]
* **Header:** Badge `HOẠT ĐỘNG 4: VẬN DỤNG & TỔNG KẾT` | `SGK TRANG 35`
* **Tiêu đề lớn:** `MỞ RỘNG BIỂU ĐỒ ĐOẠN THẲNG & VĂN HÓA PHÒNG MÁY`
* **Bố cục 2 phần:**
  * **Phần 1: Khám phá Biểu đồ đoạn thẳng (Line Chart):**
    - Chiếu hình ảnh biểu đồ đoạn thẳng mô phỏng xu hướng doanh thu phần mềm 2016 – 2020.
    - Điểm nhấn sư phạm: Đường dốc đi lên liên tục giúp nhận diện xu hướng biến động tăng trưởng theo thời gian một cách trực quan nhất mà không cần so sánh từng cột riêng rẽ.
    - Hướng dẫn thao tác: Chọn bảng dữ liệu $\rightarrow$ `Insert` $\rightarrow$ nhóm Charts chọn `Insert Line or Area Chart` $\rightarrow$ kiểu `2-D Line with Markers`.
  * **Phần 2: Quy trình an toàn & Văn hóa phòng thực hành:**
    - Nhắc nhở học sinh lưu tệp bảng tính thực hành (`Ctrl + S`) vào thư mục cá nhân.
    - Thực hiện quy trình tắt máy tính an toàn: `Start` $\rightarrow$ `Power` $\rightarrow$ `Shut down`.
* **Nút bấm kết thúc bài dạy:** `HOÀN THÀNH TIẾT HỌC (FINISH LESSON)`:
  - Hiệu ứng pháo hoa rực rỡ toàn màn hình (Canvas Confetti).
  - Webby Avatar phát âm thanh chúc mừng cả lớp đã hoàn thành xuất sắc tiết thực hành.
  - Hiển thị bảng tổng kết điểm số thi đua từ Webby Classroom, dặn dò bài tập về nhà.

---

### HƯỚNG DẪN TÍCH HỢP CODE VÀO ỨNG DỤNG thaogiang:
1. **Tạo component mới:**
   - Tạo tệp `src/components/Presentation/Tin8Bai07SlidePresentation.jsx` chứa toàn bộ mã nguồn React của 4 slide trên.
2. **Đăng ký vào ứng dụng:**
   - Trong `src/components/Presentation/LessonSlidePresentation.jsx` hoặc `src/App.jsx`, khi người dùng chọn bài học `lesson_tin8_bai07`, tự động kết nối component này.
3. **Phím tắt điều khiển:**
   - `Mũi tên phải` / `Phím Space`: Chuyển sang slide tiếp theo.
   - `Mũi tên trái`: Quay lại slide trước.
   - Phím `F`: Bật/tắt chế độ toàn màn hình 16:9.
```
