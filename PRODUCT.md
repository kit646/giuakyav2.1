# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + Tailwind CSS + Lucide Icons

## Users

Học sinh lứa tuổi 10–15 tuổi (lớp 5, 6, 7 THCS hoặc tiểu học lớn) tại Việt Nam đang tự ôn luyện chứng chỉ tiếng Anh Cambridge A2 Key for Schools (KET) hoặc chuẩn bị cho các kỳ thi học kỳ, giữa kỳ môn Tiếng Anh.

Học sinh cần một môi trường làm bài thân thiện, không áp lực, chữ to rõ ràng, thao tác mượt mà trên cả máy tính bàn, laptop và máy tính bảng (iPad/tablet).

## Product Purpose

Cung cấp nền tảng web luyện thi Cambridge A2 Key trực quan, tươi sáng và khích lệ người học:
- Hỗ trợ làm bài thi thực tế với trọn bộ 8 đề thi chuẩn Cambridge (từ giáo trình *Ready for A2 Key for Schools* của tác giả Valentina Chen, ELI Publishing) cùng bộ đề mẫu giữa kỳ A2.1.
- Tích hợp 41 track audio MP3 chất lượng cao đồng bộ tự động với từng câu hỏi phần thi Listening.
- Cung cấp hai chế độ học tập linh hoạt: **Chế độ Thi thử (Exam Mode)** tính giờ nghiêm túc và **Chế độ Học tập (Study Mode)** có trợ giúp song ngữ, xem transcript và lời giải chi tiết.
- Tự động chấm điểm theo thang Cambridge A2 (100–150 điểm), phân tích câu đúng/sai và lưu lịch sử làm bài.

## Positioning

Khác với các trang web luyện thi hàn lâm, khô cứng hoặc các ứng dụng nước ngoài thiếu hỗ trợ tiếng Việt:
- **Tối ưu song ngữ thông minh:** Tiếng Anh là ngôn ngữ chính yếu chuẩn mực quốc tế; tiếng Việt đóng vai trò "người đồng hành hỗ trợ" (bản dịch, gợi ý từ vựng, giải thích ngữ pháp) có thể bật/tắt tức thì.
- **Dữ liệu đề thi thực tế đã số hóa 100%:** Toàn bộ đề thi, câu hỏi trắc nghiệm, hình ảnh tranh vẽ/biển báo (Part 1) và audio MP3 đã sẵn sàng offline/local, không bị phụ thuộc kết nối bên thứ ba.
- **Trải nghiệm học tập mang tính khích lệ (Gamified & Friendly):** Giao diện tươi sáng, âm thanh tích cực, theo dõi chuỗi streak học tập và biểu đồ tiến bộ rõ rệt.

## Operating Context

- **Thiết bị:** Máy tính để bàn, laptop (Windows/Mac) và máy tính bảng (iPad/Android tablet) trên các trình duyệt hiện đại (Chrome, Edge, Safari, Firefox).
- **Môi trường học:** Học sinh tự học tại nhà hoặc làm bài tập giáo viên giao; sử dụng loa ngoài hoặc tai nghe cho phần thi Listening.
- **Thời gian làm bài:** 
  - Bài Reading & Writing: 45 – 60 phút.
  - Bài Listening: ~30 phút (nghe audio 2 lần theo quy chuẩn thi Cambridge).

## Capabilities and Constraints

- **Nguồn dữ liệu thực:**
  - 8 Bộ đề thực hành trắc nghiệm (`test_1.json` đến `test_8.json`) và 1 Bộ đề mẫu giữa kỳ (`sample_test.json`) tổng hợp tại `Tieng anh giua ky/extracted_data/all_tests.json`.
  - 41 Track audio MP3 (`A2 Key TK_1.mp3` đến `TK_41.mp3`) với công thức ánh xạ chuẩn: $\text{Track} = (N - 1) \times 5 + P$.
  - Toàn bộ hình ảnh biển báo Reading Part 1 và lựa chọn tranh A/B/C Listening Part 1 trong `extracted_data/images/`.
- **Tính năng cốt lõi:**
  - Trang chọn đề thi (Dashboard) hiển thị tiến độ hoàn thành, điểm số cao nhất và thời gian hoàn thành.
  - Giao diện làm bài Reading & Writing dạng 2 cột chia màn hình (Split View): bên trái bài đọc, bên phải câu hỏi trắc nghiệm.
  - Giao diện làm bài Listening với Sticky Audio Player: hỗ trợ tua lùi/tiến 5 giây, điều chỉnh tốc độ phát 0.8x / 1.0x / 1.2x.
  - Chấm điểm tự động và màn hình tổng kết kết quả (Celebration & Detailed Review) kèm Audioscript và lời giải thích.
  - Lưu trạng thái bài làm và lịch sử điểm số vào `localStorage`.

## Brand Commitments

- **Tên nền tảng:** A2 Key Master (Web Luyện Thi Tiếng Anh A2.1 Cho Học Sinh).
- **Tông giọng (Voice & Tone):** Tươi vui, thân thiện, cổ vũ, thấu hiểu tâm lý học sinh. Tuyệt đối không dùng lời lẽ phán xét khi học sinh làm sai.
- **Quy chuẩn thị giác:** Tuân thủ nguyên tắc đã xác lập tại `design-system/MASTER.md`:
  - Bảng màu: Xanh dương hoàng gia `#2563EB`, Vàng hổ phách `#F59E0B`, Xanh ngọc `#10B981`, Hồng san hô `#F43F5E`, Tím audio `#8B5CF6`.
  - Phông chữ: `Lexend` cho tiêu đề và số hiệu; `Be Vietnam Pro` cho nội dung câu hỏi và song ngữ Việt - Anh.

## Evidence on Hand

- `Tieng anh giua ky/extracted_data/all_tests.json`: Dữ liệu 8 đề thi chuẩn + Sample test (372 KB).
- `Tieng anh giua ky/extracted_data/audio_map.json`: Ánh xạ 41 file audio (28 KB).
- `Tieng anh giua ky/extracted_data/images/`: Hình ảnh câu hỏi, biển báo và lựa chọn trắc nghiệm tranh.
- `Tieng anh giua ky/audio/`: 41 file MP3 đầy đủ.
- `design-system/MASTER.md`: Hệ thống thiết kế hoàn chỉnh.

## Product Principles

1. **Khả năng đọc và Tập trung tối đa (Distraction-Free Legibility):** Bố cục gọn gàng, kích thước chữ to rõ, không hiệu ứng rối mắt; chia đôi màn hình giữa bài đọc và câu hỏi để học sinh không phải cuộn trang liên tục.
2. **Phản hồi nhẹ nhàng, khích lệ (Encouraging & Constructive Feedback):** Khi làm sai, hệ thống hiển thị đoạn trích văn bản hoặc audioscript giải thích lý do vì sao đáp án đó là chính xác, biến mỗi bài kiểm tra thành một cơ hội học tập.
3. **Bệ đỡ song ngữ linh hoạt (Flexible Bilingual Scaffolding):** Tiếng Anh là trọng tâm rèn luyện; tiếng Việt là công cụ hỗ trợ đọc hiểu khi học sinh gặp từ khó. Dễ dàng bật hoặc tắt tiếng Việt chỉ bằng một cú nhấp chuột.
4. **Trình phát âm thanh tiện dụng (Audio Ergonomics):** Thanh phát audio luôn nằm cố định ở tầm nhìn học sinh, các nút bấm to bản, hỗ trợ tua lại $\pm 5\text{s}$ nhanh chóng để nghe kỹ từng đoạn hội thoại.

## Accessibility & Inclusion

- Đạt chuẩn WCAG 2.1 AA: Độ tương phản văn bản tối thiểu 7:1 cho nội dung chính, 4.5:1 cho nội dung phụ.
- Vùng chạm (Tap/Click Target) tối thiểu 48x48px cho mọi nút bấm và thẻ chọn trắc nghiệm.
- Hỗ trợ phím tắt bàn phím: phím 1, 2, 3 (hoặc A, B, C) để chọn đáp án; phím Space để tạm dừng/phát audio.
