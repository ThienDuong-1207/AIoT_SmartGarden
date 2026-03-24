🎯 Objective
Nâng cấp thiết kế và animation của Logo ECO-TECH tại HomeHero.tsx. Mục tiêu là tái tạo bố cục phân tầng của image_31.png: "ECO" đậm và đặc, nằm phía trên; "TECH" lớn hơn, chỉ có viền (outline), nằm phía dưới và lớn hơn, tạo độ sâu điện ảnh.

🛠 Tech Stack
Library: GSAP + ScrollTrigger (Cho environment) + Observer (Cho intro).

SVG: Bắt buộc sử dụng cấu trúc SVG phân lớp.

🏗 Design Structure (Cinematic Split Title)
Thay thế Title phẳng cũ bằng một <svg viewBox="0 0 800 300"> duy nhất, căn giữa:

Lớp 1 (ECO - Đậm & Đặc - Phía trên): Sử dụng <text> với phông Bold Sans, fill: url(#gradient), ban đầu đặt opacity="0". Xếp x="400" y="100".

Lớp 2 (TECH - Lớn & Viền - Phía dưới): Sử dụng <text> với cùng phông, size lớn hơn (xấp xỉ 1.5-2 lần), fill="none", stroke="#ecfeff", stroke-width="1.5px", ban đầu đặt visibility="hidden". Xếp x="400" y="200". Chồng lên Lớp 1 một chút.

🎬 Animation Sequence (The "Trace & Reveal" Logic)
Timeline chạy tự động khi isLoaded === true:

Initial Setup (Set): Dùng gsap.set để đặt visibility: "visible", strokeDasharray: 2000, strokeDashoffset: 2000 cho Lớp 2 (TECH). Đặt Lớp 1 (ECO) và Video opacity: 0. Màn hình đen hoàn toàn.

Phase 1 (Draw Outline - TECH): Animate strokeDashoffset của Lớp 2 (TECH) từ 2000 về 0 trong 2.5s. Ease: power2.inOut. (Lúc này đường vẽ và ánh sáng sẽ hiện ra trên nền đen, tạo hình chữ TECH).

Phase 2 (Converge - ECO): Ngay khi vẽ xong viền TECH (onComplete):

Dùng gsap.to phần fill của Lớp 1 (ECO) từ 0 sang Gradient mượt mà trong 0.8s. (Chữ ECO đặc sẽ hiện ra).

Thêm filter: drop-shadow(0 0 10px #22c55e) mờ dần cho Lớp 2 TECH để tạo độ sâu.

Phase 3 (Slogan): Cho Slogan hiện lên sau khi ECO rõ nét.

Phase 4 (Environment - Video): Cuối cùng mới animate Video Background và Plexus Network opacity: 0 -> 0.4.

💻 Implementation Details
Đảm bảo SVG text được căn giữa hoàn hảo.

Không để Video hiện ra đột ngột.

Giải phóng overflow: auto cho body chỉ khi kết thúc Phase 4.