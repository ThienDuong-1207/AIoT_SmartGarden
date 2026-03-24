🛠 Tech Stack
Library: GSAP + ScrollTrigger.

Icon/Layer: Một SVG Plexus Network (mạng lưới điểm) cho nền tối.

🏗 Animation Logic (GSAP Steps & callbacks)
Tách logic thành hai ScrollTrigger riêng biệt.

Trigger 1 (Video & Plexus - Scrubbed): start: "top top", end: "+=120%", scrub: 1.

Nền Plexus: scale: 1 -> 1.2, opacity: 0.2 -> 0.5.

Video (đã được làm mờ 4 góc bằng CSS): opacity: 0.

Trigger 2 (Text - Auto-play at point): start: "25% top", KHÔNG CÓ SCRUB.

onEnter Callback: Chạy Timeline tự động (play()):

Step 1: Hiển thị Title và Slogan (duration 1s, ease expo.out).

Step 2: Khi text đã hiện xong (onComplete), kích hoạt Timeline phụ:

Cấp Nhật Video: Video nền opacity: 0 -> 0.5 (mờ mờ), đồng thời filter: blur(5px) -> blur(2px). Chuyển động này làm video "tan chảy" hiện ra phía dưới nền galaxy.

💻 Implementation Details
CSS cho Video: Thêm hiệu ứng Vignette mạnh cho video: mask-image: radial-gradient(circle, black 30%, transparent 80%).

CSS cho Nền Tối: Đặt nền galaxy Plexus nằm trên layer video nhưng dưới layer text.

Initial Set: Text: gsap.set về opacity: 0, visibility: hidden.