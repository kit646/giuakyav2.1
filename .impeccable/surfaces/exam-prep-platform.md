# Surface Brief: Nền tảng Ôn thi Tiếng Anh Cambridge A2.1 Key for Schools

<!-- impeccable:surface-brief 1 -->

## 1. Job and Audience
- **Visitor Mode:** Operate (hoàn thành nhiệm vụ thi thử / luyện tập với độ tập trung cao, thao tác nhanh gọn) kết hợp Persuade/Read ở Dashboard và trang Kết quả.
- **Audience:** Học sinh lứa tuổi 10–15 (lớp 5–7 THCS) tự học ôn thi Cambridge A2 Key for Schools (KET) hoặc chuẩn bị cho kỳ kiểm tra tiếng Anh định kỳ tại trường.
- **Mental State:** Muốn kiểm tra trình độ bản thân nhưng sợ cảm giác căng thẳng, áp lực; cần giao diện tươi sáng, khích lệ, hướng dẫn song ngữ rõ ràng và thao tác nghe/chọn đáp án trực quan.

## 2. Outcome and Proof
- **Mục tiêu cốt lõi:**
  1. Giúp học sinh trải nghiệm trọn vẹn 8 đề thi thật chuẩn Cambridge A2 và 1 đề thi mẫu giữa kỳ đã số hóa 100%.
  2. Tự động chấm điểm chính xác theo thang điểm Cambridge (100–150 điểm: *Pass*, *Pass with Merit*, *Pass with Distinction*).
  3. Cung cấp Audioscript có dẫn chứng và lời giải thích song ngữ cho từng câu hỏi để học sinh học từ lỗi sai.
- **Bằng chứng thực tế:**
  - 8 Đề thi đầy đủ + 1 Đề mẫu trong `extracted_data/all_tests.json`.
  - 41 File audio MP3 chuẩn track từ `A2 Key TK_1.mp3` đến `TK_41.mp3` trong `Tieng anh giua ky/audio/`.
  - Toàn bộ hình ảnh biển báo Reading Part 1 và hình vẽ đáp án A/B/C Listening Part 1 trong `extracted_data/images/`.

## 3. Five Core Surfaces Specification (5 Màn hình Trọng tâm)

### Surface 1: Dashboard (Trang Chủ & Quản Lý Ôn Luyện)
- **Cấu trúc & Bố cục:**
  - *Header:* Logo thương hiệu A2 Key Master, chuỗi ngày học liên tục (Streak 🔥), tổng số câu đã làm và điểm trung bình tích lũy.
  - *Bộ lọc kỹ năng & Chế độ:* Tab chọn `[Tất cả đề (1–8 & Sample)]`, `[Chỉ Reading & Writing]`, `[Chỉ Listening]`.
  - *Thẻ danh sách đề thi (Exam Cards Grid):*
    - Mỗi thẻ đại diện cho 1 đề (Test 1 – Test 8 và Sample Test).
    - Hiển thị nhãn thời gian ước tính, số lượng câu hỏi (ví dụ: Reading 30 câu / Listening 25 câu).
    - Huy hiệu trạng thái: `Chưa làm`, `Đang làm dở (Tiến độ: 15/25 câu)`, `Đã hoàn thành (Điểm cao nhất: 142/150)`.
    - Hai nút hành động: `Luyện tập tự do (Study Mode)` và `Thi thử tính giờ (Exam Mode)`.
    - Nút `Làm tiếp` nếu bài thi đang có tiến độ lưu dở dang.

### Surface 2: Trang Làm Bài Listening (với Sticky Audio Player)
- **Thanh phát Audio cố định (Sticky Header Audio Player):**
  - Luôn bám đỉnh màn hình, nổi bật với tone màu tím năng lượng `#8B5CF6`.
  - Hiển thị thông tin track hiện tại (ví dụ: `Test 1 - Part 1: Multiple Choice Pictures (Track 1)`).
  - Điều khiển âm thanh: Nút Play/Pause cỡ lớn ($\ge 48\text{px}$), Nút tua lùi 5 giây (`-5s`), Nút tua tiến 5 giây (`+5s`), Thanh trượt tiến trình phát trực quan, Nút điều chỉnh tốc độ nghe (`0.8x` - `1.0x` - `1.2x`), Điều chỉnh âm lượng.
  - Tự động chuyển track khi học sinh chuyển qua Part khác hoặc bấm chọn Part trên thanh điều hướng.
- **Khu vực làm bài:**
  - Part 1: Hiển thị câu hỏi + 3 hình ảnh lựa chọn A, B, C trực quan được cắt từ sách gốc, nhấp vào ảnh để chọn đáp án; có hỗ trợ phóng to ảnh nếu muốn xem chi tiết.
  - Part 2: Dạng điền từ/số vào chỗ trống (ghi chú tóm tắt).
  - Part 3, 4, 5: Trắc nghiệm 3 lựa chọn và bài tập nối thông tin (Matching).

### Surface 3: Trang Làm Bài Reading (Chia Đôi Màn Hình - Split View)
- **Bố cục 2 cột độc lập (Desktop/Tablet):**
  - *Cột bên trái (50% màn hình):* Hiển thị văn bản đọc hiểu (biển báo, email thông báo, bài văn ngắn, bài tập đục lỗ Part 4–5) với thanh cuộn riêng biệt.
  - *Cột bên phải (50% màn hình):* Hiển thị các câu hỏi và các lựa chọn trắc nghiệm A/B/C. Học sinh vừa đọc văn bản bên trái vừa chọn câu trả lời bên phải mà không phải cuộn lên cuộn xuống.
  - *Trên điện thoại (Mobile):* Hỗ trợ thanh chuyển Tab nhanh `[Đoạn văn đọc]` ↔ `[Câu hỏi]`.
- **Hệ thống Song ngữ Việt - Anh:**
  - Nút gạt chuyển đổi chế độ nhanh: `Bật/Tắt Dịch Nghĩa Tiếng Việt`.
  - Khi bật: Các câu hỏi và đoạn văn hiển thị lời giải nghĩa tiếng Việt ở dưới dạng chữ nghiêng màu xám thanh nhã `#64748B`.

### Surface 4: Trang Thi Thử Có Đồng Hồ (Exam Mode with Countdown Timer)
- **Đồng hồ đếm ngược thông minh (Smart Countdown Timer):**
  - Hiển thị thời gian còn lại (Reading: 45 phút, Listening: 30 phút, Trọn gói: 75 phút).
  - Trạng thái màu sắc theo tâm lý học sinh:
    - Khi thời gian bình thường: Xanh dương/xám điềm tĩnh `#2563EB`.
    - Khi còn 5 phút cuối: Chuyển màu vàng hổ phách `#F59E0B` nhấp nháy nhẹ để học sinh kiểm tra lại toàn bộ bài.
    - Hết giờ: Tự động khóa câu trả lời và tự động nộp bài (Auto-submit).
- **Thanh bản đồ câu hỏi (Question Matrix Bar):**
  - Hiển thị lưới tất cả các câu hỏi (1 to 25 hoặc 1 to 30) bên cạnh màn hình:
    - Màu xanh: Đã trả lời.
    - Màu vàng kèm cờ: Đánh dấu cần xem lại (Flagged).
    - Màu trắng viền xám: Chưa làm.
  - Bấm vào số câu hỏi sẽ cuộn mượt (smooth scroll) ngay lập tức tới câu đó.
- **Hộp thoại xác nhận nộp bài (Submit Confirmation Modal):**
  - Cảnh báo rõ ràng nếu còn câu chưa làm: *"Bạn còn 3 câu chưa trả lời. Bạn có chắc chắn muốn nộp bài ngay không?"*.

### Surface 5: Trang Kết Quả & Xem Lại Bài Làm (Result & Detailed Review)
- **Bảng điểm tổng quan theo chuẩn Cambridge:**
  - Tổng điểm và quy đổi thang điểm Cambridge A2: *100 – 150 điểm*.
  - Huy hiệu đánh giá chính thức: *Pass with Distinction (140-150)*, *Pass with Merit (133-139)*, *Pass (120-132)*, *Need More Practice (<120)*.
  - Hiệu ứng pháo hoa chúc mừng (Confetti) khi đạt kết quả tốt (tôn trọng `prefers-reduced-motion`).
- **Phân tích chi tiết từng phần thi (Part-by-Part Analysis):**
  - Tỉ lệ đúng theo từng Part (Part 1, Part 2, Part 3, Part 4, Part 5).
  - Bộ lọc xem lại: `[Tất cả câu]`, `[Chỉ xem câu sai]`, `[Câu đã đánh dấu cờ]`.
- **Hộp giải thích đáp án & Audioscript:**
  - Đối với bài Listening: Hiển thị toàn bộ đoạn Audioscript tiếng Anh, tô sáng (highlight màu vàng) câu thoại chứa từ khóa dẫn chứng cho đáp án đúng.
  - Đối với bài Reading: Chỉ rõ vị trí thông tin trong bài đọc giải thích vì sao chọn đáp án đó.
- **Hành động tiếp nối:** Nút `Làm lại đề này` và `Quay về Dashboard chọn đề tiếp theo`.

## 4. Scope and Boundaries
- **In-scope:**
  - Hoàn thiện toàn bộ logic chọn đáp án, tính điểm tự động, đồng hồ bấm giờ, phát audio đồng bộ, lưu trữ LocalStorage.
  - 100% dữ liệu 8 đề thi thật + Đề mẫu giữa kỳ.
  - Hỗ trợ đầy đủ phím tắt bàn phím (1/2/3, A/B/C, Space để play/pause audio).
- **Anti-goals:**
  - Không xây dựng hệ thống đăng nhập tài khoản backend phức tạp (mọi tiến độ và điểm số được lưu trực tiếp trên trình duyệt của học sinh qua LocalStorage để dùng ngay không cần mạng).
  - Không chèn quảng cáo hoặc pop-up gây xao nhãng.

## 5. Interaction and Layout
- **Quy chuẩn chạm (Touch Targets):** Tất cả các lựa chọn và nút điều khiển audio có chiều cao $\ge 48\text{px}$ để bấm chính xác trên iPad/máy tính bảng.
- **Lưu trữ tự động (Auto-save):** Mọi thao tác chọn đáp án được tự động ghi vào `localStorage` theo key `a2_exam_progress_{test_id}`. Khi học sinh vô tình đóng trình duyệt và mở lại, hệ thống lập tức khôi phục trạng thái làm bài dở dang.
- **Âm thanh tự do:** Luôn cho phép học sinh tua lại $\pm 5\text{s}$, kéo thanh timeline và tùy chỉnh tốc độ nghe theo nhu cầu.

## 6. Constraints & Open Decisions
- **Ràng buộc đã xác nhận:**
  - Stack: React + Vite + Tailwind CSS + Lucide Icons.
  - Design Tokens: Tuân thủ nghiêm ngặt `design-system/MASTER.md`.
  - Build path: `code-first`.
