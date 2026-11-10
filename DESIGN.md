# Design Authority: A2 Key Master (A2.1 English Exam Prep)

<!-- impeccable:design-schema 1 -->

Hệ thống thiết kế chi tiết tuân thủ quy chuẩn quốc tế WCAG 2.1 AA+, tối ưu cho học sinh lứa tuổi 10–15 tuổi ôn luyện thi chứng chỉ Cambridge A2 Key for Schools.

Xem tài liệu chi tiết đầy đủ tại: [design-system/MASTER.md](design-system/MASTER.md)

## 1. Visual Theme & Personality
- **Phong cách:** Tươi sáng (Bright), Thân thiện, Kích thích tư duy (Engaging & Gamified), Cực kỳ dễ đọc (Distraction-Free Legibility).
- **Tránh:** Màu sắc quá tối xám u ám, chữ quá nhỏ, nút bấm bé khó thao tác trên màn hình cảm ứng, hoặc màu đỏ gắt gây áp lực tâm lý.

## 2. Color Palette & Tokens
- **Primary (`#2563EB` Royal Blue):** Màu chủ đạo đại diện cho sự tin cậy, thông thái và tập trung.
- **Primary Light (`#EFF6FF` Sky 50):** Nền thẻ câu hỏi đang chọn, highlight từ vựng.
- **Secondary (`#F59E0B` Amber Gold):** Chuỗi ngày học liên tục (Streak 🔥), huy hiệu thành tích, mẹo làm bài thi.
- **Success (`#10B981` Emerald Fresh):** Thông báo đáp án đúng, đạt điểm giỏi.
- **Error / Alert (`#F43F5E` Coral Rose):** Báo câu trả lời sai (tone hồng cam nhẹ nhàng, giảm áp lực sợ sai cho học sinh).
- **Audio Feature (`#8B5CF6` Violet Purple):** Trình phát âm thanh Sticky Audio Player và các thao tác liên quan đến bài nghe.
- **Background (`#F8FAFC` Slate 50):** Nền chính dịu mắt.
- **Card Surface (`#FFFFFF` Pure White):** Nền thẻ câu hỏi, bài đọc, có đổ bóng nhẹ `shadow-card` và bo góc mềm mại `rounded-2xl`.

## 3. Typography & Bilingual Scaffolding
- **Heading & Numbers:** `Lexend` — Phông chữ thiết kế đặc biệt giúp giảm mỏi mắt, tăng tốc độ đọc và khả năng nhận diện mặt chữ của học sinh.
- **Body & Bilingual Text:** `Be Vietnam Pro` — Chuẩn mực hàng đầu cho hiển thị tiếng Việt, các dấu thanh không bị lệch hay vỡ layout.
- **Quy tắc song ngữ:**
  - Tiếng Anh (Chính): 16–18px, font-weight 500, màu `#0F172A`.
  - Tiếng Việt (Bổ trợ): 13–14px, font-weight 400, màu `#64748B`, có thể bật/tắt bằng nút gạt *Song ngữ*.

## 4. Key Component Standards
- **Sticky Audio Player:** Luôn bám đỉnh màn hình, có nút Play/Pause ($\ge 48\text{px}$), tua lại $\pm 5\text{s}$, nút chỉnh tốc độ `0.8x` / `1.0x` / `1.2x`.
- **Thẻ trắc nghiệm A/B/C:** Vùng chạm tối thiểu $52\text{px}$, hiệu ứng chuyển màu mượt mà trong 150ms khi hover và click.
- **Split View cho Reading:** Cột trái là văn bản đọc có thanh cuộn riêng, cột phải là bảng câu hỏi trắc nghiệm đối chiếu.
