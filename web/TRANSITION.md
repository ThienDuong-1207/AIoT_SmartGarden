Chiến thuật **"Cánh cổng ECO"** thực sự là một cú "chốt hạ" về mặt trải nghiệm người dùng (UX). Nó biến logo không chỉ là một hình ảnh tĩnh, mà trở thành một thực thể không gian dẫn dắt người xem vào "vũ trụ" dữ liệu của bạn.

Để đảm bảo Cursor hoặc bất kỳ cộng sự nào sau này hiểu rõ "linh hồn" của hiệu ứng này, tôi đã soạn thảo một bản tài liệu kỹ thuật chi tiết. Bạn có thể dán đoạn này vào file `README.md` hoặc một file `docs/TRANSITION.md` trong project.

---

## 🌌 Tài liệu Kỹ thuật: Hiệu ứng Chuyển tiếp "ECO Portal"

### 1. Tổng quan (Overview)
Sau khi hoàn thành hoạt ảnh giới thiệu (Intro Animation), hệ thống sẽ chuyển sang chế độ **Scroll-driven Interaction**. Mục tiêu là tạo ra một cú "nhảy không gian" (Spatial Jump) xuyên qua chữ **ECO** để dẫn người dùng từ thế giới thực (Video cây cối) vào thế giới trí tuệ nhân tạo (Galaxy/Data Background).

---

### 2. Trình tự Hoạt ảnh (Animation Sequence)

| Giai đoạn (Scroll %) | Hành động chính | Chi tiết kỹ thuật |
| :--- | :--- | :--- |
| **0% - 20%** | **Phai nhạt Tech** | Chữ `TECH` (Outline) và Slogan cũ mờ dần về `opacity: 0`. |
| **20% - 80%** | **Cú nhảy Portal** | Chữ `ECO` (Solid) bắt đầu phóng lớn từ $Scale: 1$ đến $Scale: 150+$. |
| **40% - 90%** | **Chuyển cảnh** | Video nền mờ dần; Lớp nền Galaxy (Deep Black + Plexus) hiện ra. |
| **80% - 100%** | **Hội tụ trí tuệ** | Nội dung `'Trí tuệ nhân tạo hội tụ.'` xuất hiện ở tâm điểm. |

---

### 3. Thông số Kỹ thuật (Technical Specs)

* **Trigger:** `gsap.scrollTrigger` gắn vào `#hero-section`.
* **Pinning:** `pin: true` cho đến khi toàn bộ quá trình zoom hoàn tất.
* **Scrub:** `scrub: 1.5` (tạo độ trễ mượt mà cho cảm giác điện ảnh).
* **Transform Origin:** `transform-origin: center center` (hoặc tập trung vào lòng chữ 'O' để tạo hiệu ứng ống kính).
* **CSS Layering:**
    * `Z-index 1`: Video Background (Môi trường thực).
    * `Z-index 2`: Galaxy Background (Môi trường AI - Ẩn lúc đầu).
    * `Z-index 3`: Title ECO-TECH (Lớp tương tác chính).
    * `Z-index 4`: Tiêu đề mới "Trí tuệ nhân tạo hội tụ" (Ẩn lúc đầu).

---

### 4. Logic "Phá vỡ" (The Break-through)
> **Lưu ý quan trọng:** Khi chữ `ECO` đạt mức $Scale > 50$, nó sẽ mất hoàn toàn chi tiết và trở thành một mảng trắng che phủ màn hình. Đây là thời điểm vàng (`Golden Moment`) để hoán đổi (Swap) nền Video thành nền Galaxy phía sau lớp trắng đó trước khi nó biến mất hoàn toàn, tạo cảm giác người dùng đã đi xuyên qua "bức tường trắng" để vào vũ trụ mới.

---

### 5. Kiểm soát Cuộn (Scroll Control)
Chỉ sau khi tiêu đề **'Trí tuệ nhân tạo hội tụ.'** đạt `opacity: 1`, lệnh `unpin` mới được thực hiện để giải phóng thanh cuộn, cho phép người dùng tiếp cận các nội dung (Bento Grid, v.v.) bên dưới.
