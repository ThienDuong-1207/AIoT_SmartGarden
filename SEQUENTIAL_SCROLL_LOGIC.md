🎞️ ECO-TECH: Sequential Cinematic Scroll Specification
1. Core Concept: "The Layered Stage"
Thay vì một trang web cuộn dọc truyền thống, chúng ta sẽ biến UI thành một "Sân khấu lớp" (Layered Stage). Tất cả các Section được ghim (pinned) tại chỗ và hành động cuộn chuột sẽ điều khiển việc chuyển đổi giữa các "màn hình" (Screens).

2. Technical Architecture
Master Container: #main-canvas (với position: relative).

Section Stacking: Tất cả các section (BentoGrid, HardwareStore, Terminal) phải được thiết lập:

position: absolute; top: 0; left: 0; width: 100%; height: 100vh;

visibility: hidden; opacity: 0; (Trạng thái mặc định).

Z-index Management: - Hero (Z: 10) -> Bento (Z: 20) -> Hardware (Z: 30) -> Terminal/Footer (Z: 40).

3. The Master Timeline (GSAP ScrollTrigger)
Kịch bản bắt đầu ngay sau khi chữ "Trí tuệ nhân tạo hội tụ." đạt trạng thái hiển thị đầy đủ.

Phase 0: Hero Exit (The Dissolve)
Trigger: Người dùng bắt đầu cuộn tiếp sau Portal.

Action: - Tiêu đề "Trí tuệ nhân tạo hội tụ." mờ dần (opacity: 1 -> 0) và thu nhỏ nhẹ (scale: 1 -> 0.9).

Toàn bộ lớp Hero mờ dần để nhường chỗ cho lớp tiếp theo.

Phase 1: Mạng lưới phân tích (Bento Grid)
Transition: autoAlpha: 1 cho #bento-section.

Reveal: Các Card kính "vật chất hóa" từ tâm (Dùng clip-path hoặc stagger scale).

Hold: Giữ màn hình này trong khoảng cuộn 100vh.

Phase 2: Nâng cấp hệ thống (Hardware Store)
Exit Bento: #bento-section mờ dần và trượt nhẹ lên trên (y: -50).

Enter Hardware: #hardware-section hiện ra (autoAlpha: 1).

Action: Chạy hiệu ứng "AI Bounding Box" scan sản phẩm trước khi hiện rõ các card kính sản phẩm.

Phase 3: Mở khóa truy cập toàn diện (Terminal/Footer)
Exit Hardware: #hardware-section phai nhạt.

Enter Terminal: #terminal-section hiện ra.

Action: Kích hoạt hiệu ứng Typewriter cho các dòng mã log hệ thống. Mở khóa Scroll tự do cho phần Footer cuối cùng.

4. Constraint & Guardrails (Ràng buộc kỹ thuật)
Scrubbing: Toàn bộ Timeline phải dùng scrub: 1.5 để đảm bảo chuyển động mượt theo tay người dùng.

ImmediateRender: Phải đặt immediateRender: false cho tất cả các giai đoạn để tránh lỗi nhảy cảnh khi vừa load trang.

Global Background: Nền Galaxy Plexus phải chạy xuyên suốt (Z-index thấp nhất) và không bị ảnh hưởng bởi việc chuyển màn hình.