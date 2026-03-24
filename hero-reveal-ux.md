🎯 Objective
Xây dựng trải nghiệm cuộn chuột mượt mà (Scrub on Scroll) cho component HomeHero.tsx. Biến phần giới thiệu thành một màn "lộ diện" (Reveal) thương hiệu mang tính điện ảnh.

🛠 Tech Stack
Library: GSAP + ScrollTrigger.

Component: HomeHero.tsx.

🏗 Animation Logic (GSAP Timeline)
AI cần thiết lập một gsap.timeline gắn với ScrollTrigger tại heroRef. Hoạt ảnh phải trôi theo thanh cuộn chuột (scrub).

Trigger settings: pin: true, scrub: 1.5 (độ trễ 1.5 giây để tạo cảm giác rất mượt và sang trọng), start: "top top", end: "+=350%".

🎬 Sequence Phases:
Phân đoạn 1: Zoom & Darken (0% -> 25%)

Video nền: scale từ 1 lên 1.25.

Overlay đen: opacity từ 0.3 lên 0.85 (tối hơn để text nổi bật).

Scroll Indicator (nếu có): opacity về 0.

Phân đoạn 2: Title Reveal (25% -> 70%)

Toàn bộ chữ ECO-TECH:

opacity: từ 0 (trong suốt) lên 1 (hiện rõ).

filter: từ blur(15px) (rất nhòe) về blur(0px) (sắc nét).

y: di chuyển nhẹ từ 20px lên 0 (tạo cảm giác nổi lên).

Phân đoạn 3: Slogan & HUD Reveal (70% -> 100%)

Slogan: opacity 0 -> 1, y từ 15px lên 0.

Hiệu ứng xuất sắc thêm: Các ký tự của slogan hiện ra dạng stagger (từng chữ cái một) với hiệu ứng blur nhẹ.

💻 Implementation Details
Các lớp Text (ECO-TECH, Slogan) phải được xếp chồng hoàn hảo (position: absolute, inset-0, flex items-center justify-center).

Đảm bảo video có thuộc tính will-change: transform để tối ưu hiệu suất khi scale.

CSS: Đảm bảo phần text khi ở trạng thái ẩn có pointer-events: none để không cản trở việc cuộn.