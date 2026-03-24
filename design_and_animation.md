# Design & Animation Specifications

This document consolidates all design, animation, and UI/UX specifications for the Smart Garden AIoT project.

---

## 1. Cosmic Reveal Effect
*(Source: hero-cosmic-reveal.md)*

### 🛠 Tech Stack
Library: GSAP + ScrollTrigger.

Icon/Layer: Một SVG Plexus Network (mạng lưới điểm) cho nền tối.

### 🏗 Animation Logic (GSAP Steps & callbacks)
Tách logic thành hai ScrollTrigger riêng biệt.

#### Trigger 1 (Video & Plexus - Scrubbed):
- start: "top top", end: "+=120%", scrub: 1.
- Nền Plexus: scale: 1 -> 1.2, opacity: 0.2 -> 0.5.
- Video (đã được làm mờ 4 góc bằng CSS): opacity: 0.

#### Trigger 2 (Text - Auto-play at point):
- start: "25% top", KHÔNG CÓ SCRUB.

**onEnter Callback:** Chạy Timeline tự động (play()):

- **Step 1:** Hiển thị Title và Slogan (duration 1s, ease expo.out).
- **Step 2:** Khi text đã hiện xong (onComplete), kích hoạt Timeline phụ:
    - Cấp Nhật Video: Video nền opacity: 0 -> 0.5 (mờ mờ), đồng thời filter: blur(5px) -> blur(2px). Chuyển động này làm video "tan chảy" hiện ra phía dưới nền galaxy.

### 💻 Implementation Details
- **CSS cho Video:** Thêm hiệu ứng Vignette mạnh cho video: mask-image: radial-gradient(circle, black 30%, transparent 80%).
- **CSS cho Nền Tối:** Đặt nền galaxy Plexus nằm trên layer video nhưng dưới layer text.
- **Initial Set:** Text: gsap.set về opacity: 0, visibility: hidden.

---

## 2. Layered Reveal Effect
*(Source: hero-layered-reveal.md)*

### 🎯 Objective
Nâng cấp thiết kế và animation của Logo ECO-TECH tại HomeHero.tsx. Mục tiêu là tái tạo bố cục phân tầng của image_31.png: "ECO" đậm và đặc, nằm phía trên; "TECH" lớn hơn, chỉ có viền (outline), nằm phía dưới và lớn hơn, tạo độ sâu điện ảnh.

### 🛠 Tech Stack
- Library: GSAP + ScrollTrigger (Cho environment) + Observer (Cho intro).
- SVG: Bắt buộc sử dụng cấu trúc SVG phân lớp.

### 🏗 Design Structure (Cinematic Split Title)
Thay thế Title phẳng cũ bằng một <svg viewBox="0 0 800 300"> duy nhất, căn giữa:

- **Lớp 1 (ECO - Đậm & Đặc - Phía trên):** Sử dụng <text> với phông Bold Sans, fill: url(#gradient), ban đầu đặt opacity="0". Xếp x="400" y="100".
- **Lớp 2 (TECH - Lớn & Viền - Phía dưới):** Sử dụng <text> với cùng phông, size lớn hơn (xấp xỉ 1.5-2 lần), fill="none", stroke="#ecfeff", stroke-width="1.5px", ban đầu đặt visibility="hidden". Xếp x="400" y="200". Chồng lên Lớp 1 một chút.

### 🎬 Animation Sequence (The "Trace & Reveal" Logic)
Timeline chạy tự động khi `isLoaded === true`:

- **Initial Setup (Set):** Dùng gsap.set để đặt visibility: "visible", strokeDasharray: 2000, strokeDashoffset: 2000 cho Lớp 2 (TECH). Đặt Lớp 1 (ECO) và Video opacity: 0. Màn hình đen hoàn toàn.
- **Phase 1 (Draw Outline - TECH):** Animate strokeDashoffset của Lớp 2 (TECH) từ 2000 về 0 trong 2.5s. Ease: power2.inOut. (Lúc này đường vẽ và ánh sáng sẽ hiện ra trên nền đen, tạo hình chữ TECH).
- **Phase 2 (Converge - ECO):** Ngay khi vẽ xong viền TECH (onComplete):
    - Dùng gsap.to phần fill của Lớp 1 (ECO) từ 0 sang Gradient mượt mà trong 0.8s. (Chữ ECO đặc sẽ hiện ra).
    - Thêm filter: drop-shadow(0 0 10px #22c55e) mờ dần cho Lớp 2 TECH để tạo độ sâu.
- **Phase 3 (Slogan):** Cho Slogan hiện lên sau khi ECO rõ nét.
- **Phase 4 (Environment - Video):** Cuối cùng mới animate Video Background và Plexus Network opacity: 0 -> 0.4.

### 💻 Implementation Details
- Đảm bảo SVG text được căn giữa hoàn hảo.
- Không để Video hiện ra đột ngột.
- Giải phóng overflow: auto cho body chỉ khi kết thúc Phase 4.

---

## 3. General Reveal UX
*(Source: hero-reveal-ux.md)*

### 🎯 Objective
Xây dựng trải nghiệm cuộn chuột mượt mà (Scrub on Scroll) cho component HomeHero.tsx. Biến phần giới thiệu thành một màn "lộ diện" (Reveal) thương hiệu mang tính điện ảnh.

### 🛠 Tech Stack
- Library: GSAP + ScrollTrigger.
- Component: HomeHero.tsx.

### 🏗 Animation Logic (GSAP Timeline)
AI cần thiết lập một gsap.timeline gắn với ScrollTrigger tại heroRef. Hoạt ảnh phải trôi theo thanh cuộn chuột (scrub).
- Trigger settings: pin: true, scrub: 1.5 (độ trễ 1.5 giây để tạo cảm giác rất mượt và sang trọng), start: "top top", end: "+=350%".

### 🎬 Sequence Phases:
- **Phân đoạn 1: Zoom & Darken (0% -> 25%)**
    - Video nền: scale từ 1 lên 1.25.
    - Overlay đen: opacity từ 0.3 lên 0.85 (tối hơn để text nổi bật).
    - Scroll Indicator (nếu có): opacity về 0.
- **Phân đoạn 2: Title Reveal (25% -> 70%)**
    - Toàn bộ chữ ECO-TECH:
        - opacity: từ 0 (trong suốt) lên 1 (hiện rõ).
        - filter: từ blur(15px) (rất nhòe) về blur(0px) (sắc nét).
        - y: di chuyển nhẹ từ 20px lên 0 (tạo cảm giác nổi lên).
- **Phân đoạn 3: Slogan & HUD Reveal (70% -> 100%)**
    - Slogan: opacity 0 -> 1, y từ 15px lên 0.
    - Hiệu ứng xuất sắc thêm: Các ký tự của slogan hiện ra dạng stagger (từng chữ cái một) với hiệu ứng blur nhẹ.

### 💻 Implementation Details
- Các lớp Text (ECO-TECH, Slogan) phải được xếp chồng hoàn hảo (position: absolute, inset-0, flex items-center justify-center).
- Đảm bảo video có thuộc tính will-change: transform để tối ưu hiệu suất khi scale.
- CSS: Đảm bảo phần text khi ở trạng thái ẩn có pointer-events: none để không cản trở việc cuộn.

---

## 4. Loading Sequence
*(Source: loading_sequence.md)*

### 🎯 Objective
Xây dựng một màn hình Loading (Pre-loader) cho trang Landing Page với phong cách AI Biometric Scan (Cybernetic). Mục tiêu là tạo ra trải nghiệm công nghệ cao, kịch tính trước khi giới thiệu hệ thống nông nghiệp thông minh ECO-TECH.

### 🛠 Tech Stack
- Framework: Next.js 14+ (App Router).
- Styling: Tailwind CSS.
- Animation: GSAP (GreenSock) + @gsap/react.
- Icons: Lucide React.

### 🏗 Component Structure
- Container: Fixed phủ toàn màn hình, nền màu #050505.
- Background: Lưới Grid (Grid lines) mờ ảo với độ đục thấp.
- Core Element: Một SVG thực vật (chiếc lá/mầm cây) nằm chính giữa.
- Lớp 1 (Wireframe): Nét đứt, màu xanh nhạt, mờ.
- Lớp 2 (Solid): Khối màu rực rỡ (Gradient Green-Cyan), được lộ diện dần theo % loading.
- Scanner: Một thanh Laser sáng rực chạy từ dưới lên theo tiến độ loading.
- Tech UI: Các khung Bounding Box (YOLOv8 style) chớp tắt xung quanh chiếc lá với các nhãn dữ liệu giả lập.
- Particles: Các div nhỏ (pixel) ẩn sẵn, sẽ bùng nổ khi đạt 100%.

### 🎬 Animation Sequence (The "AI Scan & Explode" Logic)
AI cần thực hiện chuỗi logic GSAP sau:

**Giai đoạn 1: Scanning (Progress 0% - 100%)**
- Đồng bộ hóa loadingProgress (state) với:
    - Thuộc tính clip-path: inset(...) của lớp Solid SVG để chiếc lá "đầy" dần.
    - Vị trí bottom của thanh Laser.
    - Hiển thị số % tại tâm điểm.

**Giai đoạn 2: The Climax (At 100%)**
- Tạm dừng progress. Kích hoạt Timeline:
    - Step 2.1: Toàn bộ Core Element nhấp nháy (Flash) 2 lần cực nhanh (yoyo: true).
    - Step 2.2 (The Explosion):
        - Phóng to (scale: 10) Core Element lao thẳng về phía camera (POV).
        - Đồng thời, các hạt Particles bị bắn tung ra từ tâm với quỹ đạo ngẫu nhiên, tăng kích thước để tạo hiệu ứng 3D lao vào màn hình.
        - Làm nhòe (blur) toàn bộ Loader.
    - Step 2.3 (Transition): Giảm opacity của Loader xuống 0 để lộ Hero Section.

### 💻 Code Implementation Instructions
- Sử dụng useGSAP để quản lý dọn dẹp bộ nhớ.
- Đảm bảo document.body.style.overflow = 'hidden' khi đang load và 'auto' khi hoàn tất.
- Video nền ở Hero Section chỉ được gọi lệnh .play() sau khi Loader đã biến mất hoàn toàn.
- Sử dụng dangerouslySetInnerHTML để nhúng các CSS Keyframes cho hiệu ứng hạt pixel nếu cần tối ưu hiệu suất.

---

## 5. Sequential Cinematic Scroll Specification
*(Source: SEQUENTIAL_SCROLL_LOGIC.md)*

### 1. Core Concept: "The Layered Stage"
Thay vì một trang web cuộn dọc truyền thống, chúng ta sẽ biến UI thành một "Sân khấu lớp" (Layered Stage). Tất cả các Section được ghim (pinned) tại chỗ và hành động cuộn chuột sẽ điều khiển việc chuyển đổi giữa các "màn hình" (Screens).

### 2. Technical Architecture
- **Master Container:** #main-canvas (với position: relative).
- **Section Stacking:** Tất cả các section (BentoGrid, HardwareStore, Terminal) phải được thiết lập:
    - position: absolute; top: 0; left: 0; width: 100%; height: 100vh;
    - visibility: hidden; opacity: 0; (Trạng thái mặc định).
- **Z-index Management:** Hero (Z: 10) -> Bento (Z: 20) -> Hardware (Z: 30) -> Terminal/Footer (Z: 40).

### 3. The Master Timeline (GSAP ScrollTrigger)
Kịch bản bắt đầu ngay sau khi chữ "Trí tuệ nhân tạo hội tụ." đạt trạng thái hiển thị đầy đủ.

**Phase 0: Hero Exit (The Dissolve)**
- Trigger: Người dùng bắt đầu cuộn tiếp sau Portal.
- Action:
    - Tiêu đề "Trí tuệ nhân tạo hội tụ." mờ dần (opacity: 1 -> 0) và thu nhỏ nhẹ (scale: 1 -> 0.9).
    - Toàn bộ lớp Hero mờ dần để nhường chỗ cho lớp tiếp theo.

**Phase 1: Mạng lưới phân tích (Bento Grid)**
- Transition: autoAlpha: 1 cho #bento-section.
- Reveal: Các Card kính "vật chất hóa" từ tâm (Dùng clip-path hoặc stagger scale).
- Hold: Giữ màn hình này trong khoảng cuộn 100vh.

**Phase 2: Nâng cấp hệ thống (Hardware Store)**
- Exit Bento: #bento-section mờ dần và trượt nhẹ lên trên (y: -50).
- Enter Hardware: #hardware-section hiện ra (autoAlpha: 1).
- Action: Chạy hiệu ứng "AI Bounding Box" scan sản phẩm trước khi hiện rõ các card kính sản phẩm.

**Phase 3: Mở khóa truy cập toàn diện (Terminal/Footer)**
- Exit Hardware: #hardware-section phai nhạt.
- Enter Terminal: #terminal-section hiện ra.
- Action: Kích hoạt hiệu ứng Typewriter cho các dòng mã log hệ thống. Mở khóa Scroll tự do cho phần Footer cuối cùng.

### 4. Constraint & Guardrails (Ràng buộc kỹ thuật)
- **Scrubbing:** Toàn bộ Timeline phải dùng scrub: 1.5 để đảm bảo chuyển động mượt theo tay người dùng.
- **ImmediateRender:** Phải đặt immediateRender: false cho tất cả các giai đoạn để tránh lỗi nhảy cảnh khi vừa load trang.
- **Global Background:** Nền Galaxy Plexus phải chạy xuyên suốt (Z-index thấp nhất) và không bị ảnh hưởng bởi việc chuyển màn hình.

---

## 6. Transition Effects (ECO Portal)
*(Source: TRANSITION.md)*

Chiến thuật **"Cánh cổng ECO"** thực sự là một cú "chốt hạ" về mặt trải nghiệm người dùng (UX). Nó biến logo không chỉ là một hình ảnh tĩnh, mà trở thành một thực thể không gian dẫn dắt người xem vào "vũ trụ" dữ liệu của bạn.

### 🌌 Tài liệu Kỹ thuật: Hiệu ứng Chuyển tiếp "ECO Portal"

#### 1. Tổng quan (Overview)
Sau khi hoàn thành hoạt ảnh giới thiệu (Intro Animation), hệ thống sẽ chuyển sang chế độ **Scroll-driven Interaction**. Mục tiêu là tạo ra một cú "nhảy không gian" (Spatial Jump) xuyên qua chữ **ECO** để dẫn người dùng từ thế giới thực (Video cây cối) vào thế giới trí tuệ nhân tạo (Galaxy/Data Background).

#### 2. Trình tự Hoạt ảnh (Animation Sequence)

| Giai đoạn (Scroll %) | Hành động chính | Chi tiết kỹ thuật |
| :--- | :--- | :--- |
| **0% - 20%** | **Phai nhạt Tech** | Chữ `TECH` (Outline) và Slogan cũ mờ dần về `opacity: 0`. |
| **20% - 80%** | **Cú nhảy Portal** | Chữ `ECO` (Solid) bắt đầu phóng lớn từ $Scale: 1$ đến $Scale: 150+$. |
| **40% - 90%** | **Chuyển cảnh** | Video nền mờ dần; Lớp nền Galaxy (Deep Black + Plexus) hiện ra. |
| **80% - 100%** | **Hội tụ trí tuệ** | Nội dung `'Trí tuệ nhân tạo hội tụ.'` xuất hiện ở tâm điểm. |

#### 3. Thông số Kỹ thuật (Technical Specs)
* **Trigger:** `gsap.scrollTrigger` gắn vào `#hero-section`.
* **Pinning:** `pin: true` cho đến khi toàn bộ quá trình zoom hoàn tất.
* **Scrub:** `scrub: 1.5` (tạo độ trễ mượt mà cho cảm giác điện ảnh).
* **Transform Origin:** `transform-origin: center center` (hoặc tập trung vào lòng chữ 'O' để tạo hiệu ứng ống kính).
* **CSS Layering:**
    * `Z-index 1`: Video Background (Môi trường thực).
    * `Z-index 2`: Galaxy Background (Môi trường AI - Ẩn lúc đầu).
    * `Z-index 3`: Title ECO-TECH (Lớp tương tác chính).
    * `Z-index 4`: Tiêu đề mới "Trí tuệ nhân tạo hội tụ" (Ẩn lúc đầu).

#### 4. Logic "Phá vỡ" (The Break-through)
> **Lưu ý quan trọng:** Khi chữ `ECO` đạt mức $Scale > 50$, nó sẽ mất hoàn toàn chi tiết và trở thành một mảng trắng che phủ màn hình. Đây là thời điểm vàng (`Golden Moment`) để hoán đổi (Swap) nền Video thành nền Galaxy phía sau lớp trắng đó trước khi nó biến mất hoàn toàn, tạo cảm giác người dùng đã đi xuyên qua "bức tường trắng" để vào vũ trụ mới.

#### 5. Kiểm soát Cuộn (Scroll Control)
Chỉ sau khi tiêu đề **'Trí tuệ nhân tạo hội tụ.'** đạt `opacity: 1`, lệnh `unpin` mới được thực hiện để giải phóng thanh cuộn, cho phép người dùng tiếp cận các nội dung (Bento Grid, v.v.) bên dưới.
