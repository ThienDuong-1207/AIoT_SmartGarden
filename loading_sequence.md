🎯 Objective
Xây dựng một màn hình Loading (Pre-loader) cho trang Landing Page với phong cách AI Biometric Scan (Cybernetic). Mục tiêu là tạo ra trải nghiệm công nghệ cao, kịch tính trước khi giới thiệu hệ thống nông nghiệp thông minh ECO-TECH.

🛠 Tech Stack
Framework: Next.js 14+ (App Router).

Styling: Tailwind CSS.

Animation: GSAP (GreenSock) + @gsap/react.

Icons: Lucide React.

🏗 Component Structure
Container: Fixed phủ toàn màn hình, nền màu #050505.

Background: Lưới Grid (Grid lines) mờ ảo với độ đục thấp.

Core Element: Một SVG thực vật (chiếc lá/mầm cây) nằm chính giữa.

Lớp 1 (Wireframe): Nét đứt, màu xanh nhạt, mờ.

Lớp 2 (Solid): Khối màu rực rỡ (Gradient Green-Cyan), được lộ diện dần theo % loading.

Scanner: Một thanh Laser sáng rực chạy từ dưới lên theo tiến độ loading.

Tech UI: Các khung Bounding Box (YOLOv8 style) chớp tắt xung quanh chiếc lá với các nhãn dữ liệu giả lập.

Particles: Các div nhỏ (pixel) ẩn sẵn, sẽ bùng nổ khi đạt 100%.

🎬 Animation Sequence (The "AI Scan & Explode" Logic)
AI cần thực hiện chuỗi logic GSAP sau:

Giai đoạn 1: Scanning (Progress 0% - 100%)

Đồng bộ hóa loadingProgress (state) với:

Thuộc tính clip-path: inset(...) của lớp Solid SVG để chiếc lá "đầy" dần.

Vị trí bottom của thanh Laser.

Hiển thị số % tại tâm điểm.

Giai đoạn 2: The Climax (At 100%)

Tạm dừng progress. Kích hoạt Timeline:

Step 2.1: Toàn bộ Core Element nhấp nháy (Flash) 2 lần cực nhanh (yoyo: true).

Step 2.2 (The Explosion):

Phóng to (scale: 10) Core Element lao thẳng về phía camera (POV).

Đồng thời, các hạt Particles bị bắn tung ra từ tâm với quỹ đạo ngẫu nhiên, tăng kích thước để tạo hiệu ứng 3D lao vào màn hình.

Làm nhòe (blur) toàn bộ Loader.

Step 2.3 (Transition): Giảm opacity của Loader xuống 0 để lộ Hero Section.

💻 Code Implementation Instructions
Sử dụng useGSAP để quản lý dọn dẹp bộ nhớ.

Đảm bảo document.body.style.overflow = 'hidden' khi đang load và 'auto' khi hoàn tất.

Video nền ở Hero Section chỉ được gọi lệnh .play() sau khi Loader đã biến mất hoàn toàn.

Sử dụng dangerouslySetInnerHTML để nhúng các CSS Keyframes cho hiệu ứng hạt pixel nếu cần tối ưu hiệu suất.