# Design System Master: A2.1 English Prep Web Platform
> **Phiên bản:** 1.0.0  
> **Dành cho:** Nền tảng web ôn luyện thi tiếng Anh A2 Key for Schools (KET) cho học sinh THCS/Tiểu học lớn.  
> **Định hướng phong cách:** Tươi sáng (Bright & Engaging), Cực kỳ dễ đọc (High Legibility), Hỗ trợ Song ngữ Việt – Anh linh hoạt.  
> **Tiêu chuẩn thiết kế:** WCAG 2.1 AA+, Phosphor/Lucide Icons, 8pt Grid Rhythm, Mobile & Tablet Ready.

---

## 1. Triết lý Thiết kế & Chân dung Người dùng (Design Philosophy & Persona)

### 1.1. Chân dung người học (Target Learner)
- **Độ tuổi:** 10 – 15 tuổi (học sinh lớp 5, 6, 7 chuẩn bị thi chứng chỉ Cambridge A2 Key for Schools / KET hoặc kiểm tra định kỳ).
- **Đặc điểm tâm lý:**
  - Dễ mất tập trung nếu giao diện đơn điệu, xám xịt hoặc mang nặng tính "sách vở hàn lâm".
  - Dễ nản lòng nếu mắc lỗi nhưng không nhận được phản hồi khích lệ tích cực.
  - Cần kích thước chữ và khoảng cách bấm to rõ, thao tác mượt mà trên cả laptop, máy tính bảng (iPad) và điện thoại.

### 1.2. Ba trụ cột thiết kế cốt lõi
1. **Tươi sáng & Tràn đầy năng lượng (Bright & Vibrant):** Màu sắc trong trẻo (Sky Blue + Amber Gold + Emerald Green), thẻ bo góc tròn mềm mại (`rounded-xl` / `rounded-2xl`), tạo cảm giác vui vẻ như đang chơi một trò chơi trí tuệ (gamified learning).
2. **Tối ưu khả năng đọc & Tập trung (Distraction-Free Legibility):** Nền trắng kem dịu mắt, độ tương phản văn bản chuẩn mực $\ge 7:1$, phân tách rõ ràng giữa khu vực đọc đề thi và khu vực làm bài.
3. **Song ngữ Việt – Anh hài hòa (Harmonious Bilingual Experience):** Tiếng Anh là ngôn ngữ mục tiêu (Target Language) được tôn nổi bật; Tiếng Việt đóng vai trò "người đồng hành dẫn dắt" (Scaffolding / Translation Hints), có thể chuyển đổi chế độ xem linh hoạt.

---

## 2. Bảng màu & Design Tokens (Color Palette)

Hệ màu được thiết kế để kích thích sự hưng phấn học tập, giảm căng thẳng khi làm bài thi dài.

### 2.1. Bảng màu ngữ nghĩa (Semantic Palette)

| Phân loại | Mã Hex | Tên Token CSS | Ứng dụng cụ thể |
|:---|:---|:---|:---|
| **Primary (Chủ đạo)** | `#2563EB` | `--color-primary` | Màu thương hiệu, tiêu đề chính, nút bấm hành động (Nộp bài, Làm tiếp). Mang lại sự tin cậy, thông thái. |
| **Primary Light** | `#EFF6FF` | `--color-primary-light` | Nền câu hỏi đang chọn, highlight từ vựng, badge phần thi. |
| **Secondary (Khích lệ)** | `#F59E0B` | `--color-secondary` | Huy hiệu thưởng, chuỗi học tập (Streak 🔥), thanh năng lượng, mẹo làm bài thi (Exam Tips). |
| **Success (Đúng / Thành tích)** | `#10B981` | `--color-success` | Đáp án đúng, chúc mừng hoàn thành phần thi, tỉ lệ điểm cao. |
| **Success Light** | `#ECFDF5` | `--color-success-light` | Nền thẻ câu trả lời đúng, hộp giải thích đáp án. |
| **Error / Alert (Sai / Chú ý)** | `#F43F5E` | `--color-error` | Đáp án sai, thông báo hết giờ (sử dụng tone Rose đỏ hồng thân thiện thay vì đỏ gắt). |
| **Error Light** | `#FFF1F2` | `--color-error-light` | Nền thẻ câu trả lời sai kèm chú thích sửa lỗi. |
| **Audio / Media Feature** | `#8B5CF6` | `--color-audio` | Trình phát âm thanh (Audio player cho bài nghe Listening Test 1–8), nút nghe lại. |
| **Background (Nền chính)** | `#F8FAFC` | `--color-bg-main` | Nền trang Slate 50 mềm mại, chống lóa mắt học sinh khi nhìn lâu. |
| **Surface / Card** | `#FFFFFF` | `--color-bg-card` | Thẻ đề thi, hộp bài đọc, khối câu hỏi trắc nghiệm. |
| **Text Primary** | `#0F172A` | `--color-text-main` | Nội dung câu hỏi, bài đọc tiếng Anh (Độ tương phản 15.8:1 đạt chuẩn AAA). |
| **Text Secondary** | `#475569` | `--color-text-sub` | Hướng dẫn tiếng Việt, phần dịch nghĩa, số câu, ngày tháng. |
| **Border & Divider** | `#E2E8F0` | `--color-border` | Đường viền thẻ câu hỏi, thanh phân chia các phần thi. |

### 2.2. Biến CSS (CSS Custom Properties)

```css
:root {
  /* Brand & Status Colors */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #eff6ff;
  --color-secondary: #f59e0b;
  --color-success: #10b981;
  --color-success-light: #ecfdf5;
  --color-error: #f43f5e;
  --color-error-light: #fff1f2;
  --color-audio: #8b5cf6;
  --color-audio-light: #f5f3ff;

  /* Surfaces & Text */
  --color-bg-main: #f8fafc;
  --color-bg-card: #ffffff;
  --color-text-main: #0f172a;
  --color-text-sub: #475569;
  --color-text-vietnamese: #64748b;
  --color-border: #e2e8f0;
  --color-border-active: #93c5fd;

  /* Elevation Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-floating: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* Border Radii (Friendly rounded) */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}
```

---

## 3. Hệ thống Typography & Giải pháp Song ngữ (Typography & Bilingual System)

### 3.1. Phối hợp phông chữ (Font Pairing)
Web sử dụng cặp phông chữ đạt chuẩn mực quốc tế và tối ưu 100% cho tiếng Việt có dấu:
1. **Phông Tiêu đề, Số hiệu & Gamification:** `Lexend` (Google Fonts)
   - *Ưu điểm:* Được nghiên cứu khoa học chuyên biệt để giảm mỏi mắt, tăng tốc độ đọc và nhận diện từ vựng cho học sinh. Nét chữ mở, hiện đại, thân thiện.
2. **Phông Nội dung đề bài & Song ngữ:** `Be Vietnam Pro` (Google Fonts)
   - *Ưu điểm:* Thiết kế chuyên biệt cho tiếng Việt. Dấu thanh (sắc, huyền, hỏi, ngã, nặng) và các ký tự mũ (ă, â, ê, ô, ơ, ư) được cân đối tỉ mỉ, không bao giờ bị dính dấu hay vỡ layout khi tăng line-height.

```html
<!-- Nhúng Google Fonts tối ưu -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Lexend:wght@500;600;700;800&display=swap" rel="stylesheet">
```

### 3.2. Bảng phân cấp cỡ chữ (Type Scale)

| Cấp bậc | Font | Kích thước | Chiều cao dòng (Line-height) | Trọng số (Weight) | Mục đích sử dụng |
|:---|:---|:---|:---|:---|:---|
| **Display / Hero** | Lexend | 32px (2rem) | 1.25 | 800 (ExtraBold) | Tên bài thi: `Test 1 - Reading & Writing` |
| **Heading 1 (H1)** | Lexend | 24px (1.5rem) | 1.3 | 700 (Bold) | Tên phần thi: `Part 1: Multiple Choice Questions` |
| **Heading 2 (H2)** | Lexend | 20px (1.25rem) | 1.35 | 600 (SemiBold) | Tiêu đề đoạn văn, câu hỏi: `Question 1` |
| **Body (English)** | Be Vietnam Pro | 17px (1.06rem) | 1.65 | 500 (Medium) | Nội dung câu hỏi đề thi, các lựa chọn A, B, C |
| **Body (Bilingual VI)** | Be Vietnam Pro | 14px (0.875rem)| 1.5 | 400 (Regular/Italic) | Bản dịch nghĩa tiếng Việt, lời dẫn giải thích |
| **Caption / Badge** | Lexend | 12px (0.75rem) | 1.4 | 600 (SemiBold) | Nhãn điểm số, số phút đếm ngược, mã đề |

### 3.3. Quy tắc Hiển thị Song ngữ Việt – Anh (Bilingual Hierarchy Rules)

Nhằm giúp học sinh tập trung đọc hiểu tiếng Anh nhưng không bị bỡ ngỡ trước các từ mới:
- **Tỉ lệ phân cấp thị giác:**
  - Tiếng Anh (Màu đậm `#0F172A`, cỡ 17px, font-weight 500).
  - Tiếng Việt (Màu phụ `--color-text-vietnamese` `#64748B`, cỡ 14px, thường để nghiêng hoặc kèm icon `[Dịch]`).
- **3 Chế độ hiển thị song ngữ (Bilingual Modes) cho học sinh chọn:**
  1. *Chế độ Học tập (Study Mode - Mặc định):* Hiển thị tiếng Anh kèm bản dịch tiếng Việt mờ ở dưới hoặc hiển thị khi rê chuột (Hover Tooltip).
  2. *Chế độ Thi thử (Exam Mode):* Ẩn hoàn toàn tiếng Việt để mô phỏng 100% phòng thi thật của Cambridge.
  3. *Chế độ Xem giải thích (Review Mode):* Sau khi nộp bài, hiển thị song song tiếng Anh kèm bản dịch đối chiếu chi tiết từng câu và transcript bài nghe.

```html
<!-- Ví dụ cấu trúc câu hỏi song ngữ -->
<div class="question-item">
  <div class="en-text text-base font-medium text-slate-900">
    Where did the boy leave his backpack?
  </div>
  <div class="vi-translation text-sm text-slate-500 italic mt-0.5">
    (Cậu bé đã để quên chiếc ba lô ở đâu?)
  </div>
</div>
```

---

## 4. Đặc tả Thành phần Giao diện Ôn thi (Component Specifications)

### 4.1. Khối Trình phát Âm thanh (Sticky Audio Player for Listening)
Dành cho các phần thi nghe (Test 1 – Test 8, từ `A2 Key TK_1.mp3` đến `TK_40.mp3`):
- **Vị trí:** Cố định ở đầu trang làm bài thi (Sticky Top Bar), không bị che khuất khi học sinh cuộn xuống xem các câu hỏi bên dưới.
- **Tính năng học sinh cần:**
  - Nút Play / Pause tròn to ($\ge 48\text{px}$).
  - Nút tua nhanh / tua lùi 5 giây (`-5s` / `+5s`) để nghe lại câu hỏi.
  - Tùy chỉnh tốc độ phát âm: `0.8x` (luyện nghe chậm), `1.0x` (chuẩn thi), `1.2x` (thử thách).
  - Thanh tiến trình phát trực quan (Waveform hoặc Audio Track Slider) màu tím năng lượng `#8B5CF6`.
  - Huy hiệu hiển thị track: `Track 1: Listening Part 1 (Questions 1 - 5)`.

### 4.2. Thẻ Lựa chọn Trắc nghiệm (Multiple Choice Option Cards - A / B / C)
- **Kích thước vùng bấm (Tap Target):** Chiều cao tối thiểu 52px, khoảng cách giữa các lựa chọn 10px để tránh bấm nhầm trên màn hình cảm ứng.
- **Trạng thái (States):**
  - *Mặc định (Default):* Nền trắng `#FFFFFF`, viền xám `#E2E8F0`, số thứ tự A/B/C nằm trong vòng tròn xám nhạt.
  - *Rê chuột (Hover):* Viền xanh đổi màu `#93C5FD`, nền hơi xanh nhẹ `#F8FAFC`.
  - *Đã chọn (Selected):* Viền xanh đậm `2px solid #2563EB`, nền xanh tươi sáng `#EFF6FF`, chữ số A/B/C chuyển màu trắng trên nền xanh `#2563EB`.
  - *Kết quả đúng (Correct - sau khi nộp):* Viền xanh lá `#10B981`, nền `#ECFDF5`, xuất hiện biểu tượng dấu tích xanh `✓`.
  - *Kết quả sai (Incorrect - sau khi nộp):* Viền đỏ hồng `#F43F5E`, nền `#FFF1F2`, kèm biểu tượng gạch chéo `✕`.

### 4.3. Bố cục Đọc hiểu 2 Cột (Split-screen Reading Layout)
Áp dụng cho bài Reading Part 3, Part 4, Part 5:
- **Cột trái (Đoạn văn đọc hiểu):** Chiếm 50% màn hình, có thanh cuộn riêng (Independent Scroll), hỗ trợ công cụ bôi màu từ vựng (Highlighter) và click vào từ để xem dịch nghĩa tiếng Việt nhanh.
- **Cột phải (Bảng câu hỏi):** Chứa các câu hỏi trắc nghiệm tương ứng, giúp học sinh vừa đối chiếu mắt sang đoạn văn bên trái vừa chọn đáp án bên phải mà không phải cuộn lên cuộn xuống gây mất tập trung.
- **Trên thiết bị di động:** Tự động chuyển thành dạng Tab: `[ Bài đọc ]` và `[ Câu hỏi ]` với thanh chuyển đổi nhanh ở đáy màn hình.

### 4.4. Thẻ Câu hỏi có Hình ảnh (Visual Image Questions)
Dành cho bài **Listening Part 1** (chọn tranh A/B/C) và **Reading Part 1** (biển báo/thông báo):
- Khung hình tranh ảnh bo góc `12px`, có viền xám nhẹ `border border-slate-200`.
- Chế độ phóng to (Lightbox Zoom) khi click vào ảnh biển báo hoặc hình vẽ để học sinh nhìn rõ từng chi tiết nhỏ.
- Nhãn ký hiệu `A`, `B`, `C` gắn liền ngay dưới mỗi ảnh giúp liên kết thị giác rõ ràng.

---

## 5. Gamification & Phản hồi Tương tác (Gamification & Feedback)

Để giữ ngọn lửa hứng thú cho lứa tuổi A2.1:
1. **Thanh tiến độ làm bài (Live Progress Bar):**
   - Đặt ở trên cùng màn hình: `Đã làm: 18/25 câu (72%)`.
   - Các nút số câu hỏi (1 to 25) ở thanh điều hướng bên cạnh: Tô màu xanh các câu đã làm, màu vàng câu đang đánh dấu xem lại (Flagged for Review), màu xám câu chưa làm.
2. **Đồng hồ đếm ngược thân thiện (Gentle Exam Timer):**
   - Khi thời gian còn dồi dào: Màu chữ xám/xanh điềm tĩnh.
   - Khi còn 5 phút cuối: Chuyển màu vàng cam hổ phách `#F59E0B` nhấp nháy nhẹ nhàng để nhắc nhở học sinh kiểm tra lại bài, không dùng màu đỏ báo động gây hoảng loạn.
3. **Màn hình Chúc mừng Kết quả (Celebration Modal):**
   - Đánh giá theo khung Cambridge: *Pass with Distinction (140-150)*, *Pass with Merit (133-139)*, *Pass (120-132)*, hoặc *Needs Practice*.
   - Hiệu ứng pháo hoa giấy (Confetti) nhẹ nhàng (tôn trọng thuộc tính `prefers-reduced-motion`).
   - Huy hiệu tặng kèm: "Vua từ vựng", "Thính giác siêu phàm", "Streak 3 ngày liên tiếp".

---

## 6. Tiêu chuẩn Tiếp cận & Thao tác (Accessibility & Ergonomics)

1. **Chuẩn độ tương phản:** Mọi chữ tiếng Anh chính đạt tối thiểu 7:1; chữ phụ đạt tối thiểu 4.5:1.
2. **Không dùng Emoji làm icon giao diện:** Sử dụng 100% SVG Icon chuẩn mực (Phosphor Icons hoặc Lucide React) với nét vẽ đồng nhất 1.75px:
   - Play/Pause: `<Play />`, `<Pause />`
   - Dịch nghĩa: `<Translate />` / `<Languages />`
   - Mẹo thi: `<Lightbulb />`
   - Đánh dấu xem lại: `<Bookmark />` / `<Flag />`
3. **Điều hướng bằng bàn phím (Keyboard Shortcuts):**
   - Phím số `1`, `2`, `3` hoặc `A`, `B`, `C` để chọn đáp án tương ứng.
   - Phím `Space` để tạm dừng / phát tiếp audio.
   - Phím `Mũi tên trái/phải` để tua lại hoặc chuyển câu tiếp theo.
   - Mọi nút bấm đều có viền Focus rõ ràng `focus-visible:ring-2 focus-visible:ring-blue-500`.

---

## 7. Cấu hình Mẫu Tailwind CSS (Tailwind Config Preset)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        sunny: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        fresh: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        },
        coral: {
          50: '#fff1f2',
          500: '#f43f5e',
          600: '#e11d48',
        },
        audio: {
          50: '#f5f3ff',
          500: '#8b5cf6',
          600: '#7c3aed',
        }
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        vietnam: ['Be Vietnam Pro', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
        'active-option': '0 0 0 2px #2563eb, 0 4px 12px -2px rgba(37, 99, 235, 0.2)',
      }
    },
  },
}
```

---

## 8. Danh mục Kiểm tra Hoàn thiện Giao diện (Pre-delivery Checklist)

- [ ] **Khả năng tương thích tiếng Việt:** Kiểm tra các từ có dấu phức hợp (`nghiêng`, `khuấy`, `thưởng`, `quyển`) không bị cắt đầu dấu ở các cỡ chữ từ 12px đến 32px.
- [ ] **Độ tương phản:** Đã kiểm tra qua WebAIM Contrast Checker cho cả nền sáng `#F8FAFC` và thẻ trắng `#FFFFFF`.
- [ ] **Kích thước cảm ứng:** Mọi nút bấm, thẻ trắc nghiệm đều có chiều cao $\ge 44\text{px}$ (khuyến nghị $52\text{px}$).
- [ ] **Trình phát âm thanh:** Nút tua lùi 5s hoạt động mượt mà, không bị giật lag audio.
- [ ] **Phản hồi tức thì:** Có animation chuyển đổi mượt mà khi click chọn đáp án (150ms transition).
- [ ] **Chế độ song ngữ:** Nút chuyển đổi nhanh Tiếng Anh / Song ngữ hoạt động tức thời mà không cần tải lại trang.
