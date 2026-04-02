# Đề cương Báo cáo: Thiết kế UI/UX - Dự án Smart Garden AIoT

## I. Phần Mở Đầu: Đặt vấn đề và Tổng quan Dự án

### 1. Giới thiệu nền tảng
Smart Garden AIoT được thiết kế như một hệ thống ứng dụng lai, kết hợp hai không gian số có tính chất rất khác nhau:
- Bảng điều khiển IoT (Dashboard) để quan sát và điều khiển thiết bị phần cứng theo thời gian thực (kết nối vi điều khiển như ESP32).
- Nền tảng thương mại điện tử để người dùng khám phá sản phẩm, thêm vào giỏ hàng và thực hiện quy trình mua sắm.

Về kiến trúc giao diện, dự án sử dụng Next.js App Router để phân tách rõ:
- Luồng marketing, giới thiệu sản phẩm.
- Luồng vận hành thiết bị trong dashboard.
- Luồng quản trị và xác thực.

### 2. Mục tiêu giao diện
Mục tiêu UI/UX của dự án là phá bỏ sự thô cứng thường thấy ở các dashboard kỹ thuật truyền thống, chuyển sang một trải nghiệm:
- Tương lai (futuristic) với hệ màu sâu, hiệu ứng động và ngôn ngữ hiển thị dữ liệu hiện đại.
- Hữu cơ (biological-friendly) với điểm nhấn xanh sinh học, nhịp điệu mềm và cấu trúc thông tin dễ tiếp cận.

Dự án hướng đến việc để người dùng cảm nhận cùng lúc hai giá trị:
- Độ tin cậy kỹ thuật khi làm việc với thiết bị thật.
- Sự thân thiện và nhẹ nhàng khi tương tác trong bối cảnh chăm sóc cây trồng.

- Hình chèn tại đây: Hình 1.1. Tổng quan kiến trúc hệ thống lai Smart Garden AIoT gồm Dashboard IoT, AI services và nền tảng thương mại điện tử.
- Hình chèn tại đây: Hình 1.2. Định hướng trải nghiệm giao diện: Futuristic Technology kết hợp Biological-friendly Design.

### Khối chèn hình trong bài (Phần I)
- Chèn sau mục I.1:
	- Hình 1.1. Tổng quan kiến trúc hệ thống lai Smart Garden AIoT gồm Dashboard IoT, AI services và nền tảng thương mại điện tử.
- Chèn sau mục I.2:
	- Hình 1.2. Định hướng trải nghiệm giao diện: Futuristic Technology kết hợp Biological-friendly Design.

---

## II. Ngôn ngữ Thiết kế "Soft Cyber Garden"

### 1. Triết lý cốt lõi
Ngôn ngữ thiết kế "Soft Cyber Garden" được xây dựng từ sự giao thoa của:
- Tinh thần tối giản, kỹ thuật và có chiều sâu của các không gian làm việc lập trình (cảm hứng từ dark UI của hệ sinh thái developer tools).
- Bản sắc tự nhiên của hệ cây trồng, thể hiện qua ánh xanh sinh học, nhịp điệu dịu và tỉ lệ bố cục ưu tiên khả năng đọc.

Cách tiếp cận này giúp hệ thống giữ được tính "cyber" nhưng không tạo cảm giác lạnh hoặc xa cách.

- Hình chèn tại đây: Hình 2.0. Định vị phong cách Soft Cyber Garden giữa ngôn ngữ công nghệ và hệ sinh học.

### 2. Hệ thống biến thiết kế (CSS Design Tokens)
Dự án triển khai bộ token tập trung trong lớp global style, giúp đồng bộ toàn hệ thống từ dashboard đến commerce.

#### a) Phân tầng chiều sâu
Không gian được tổ chức theo các lớp nền Deep Navy:
- Base: lớp nền gốc cho toàn trang.
- Elevated: lớp card/panel chính.
- Overlay: lớp dropdown/modal và vùng tương tác nổi.

Thay vì lạm dụng đổ bóng lớn, hệ thống ưu tiên:
- Tương phản lớp nền.
- Viền bán trong suốt theo ngữ nghĩa.
- Shadow vừa đủ để duy trì cảm giác chiều sâu sạch.

- Hình chèn tại đây: Hình 2.1. Hệ Design Tokens cho phân tầng nền: Base, Elevated, Overlay trên dải Deep Navy.

#### b) Bản sắc màu sắc
Màu nhấn được chuẩn hóa thành ba trục chính:
- Emerald: biểu thị sức khỏe hệ sinh thái, trạng thái ổn định và tín hiệu tích cực.
- Cyan: biểu thị AI, kết nối mạng, telemetry và dữ liệu công nghệ.
- Gold: biểu thị cảnh báo, điểm nhấn hành động và khu vực cần chú ý.

Các màu này được sử dụng nhất quán ở:
- Border accent của card.
- Badge trạng thái.
- Màu số liệu và chỉ thị hệ thống.

- Hình chèn tại đây: Hình 2.2. Bản sắc màu nhấn Emerald, Cyan và Gold theo ngữ nghĩa trạng thái hệ thống.

#### c) Nghệ thuật chữ (Typography)
Hệ thống chữ được tách lớp theo chức năng:
- Sans-serif cho tiêu đề, mô tả và nội dung điều hướng nhằm tối ưu tốc độ đọc.
- Monospace cho thông số kỹ thuật, log, mã thiết bị, metric labels để tạo cảm giác chuẩn xác kỹ thuật.

Cách phối này giúp giao diện vừa có tính thẩm mỹ thương hiệu vừa đọc dữ liệu nhanh trong ngữ cảnh real-time.

- Hình chèn tại đây: Hình 2.3. Cấu trúc Typography kết hợp Sans-serif và Monospace cho nội dung và dữ liệu kỹ thuật.

### Khối chèn hình trong bài (Phần II)
- Chèn sau tiểu mục II.2.a (Phân tầng chiều sâu):
	- Hình 2.1. Hệ Design Tokens cho phân tầng nền: Base, Elevated, Overlay trên dải Deep Navy.
- Chèn sau tiểu mục II.2.b (Bản sắc màu sắc):
	- Hình 2.2. Bản sắc màu nhấn Emerald, Cyan và Gold theo ngữ nghĩa trạng thái hệ thống.
- Chèn sau tiểu mục II.2.c (Typography):
	- Hình 2.3. Cấu trúc Typography kết hợp Sans-serif và Monospace cho nội dung và dữ liệu kỹ thuật.

---

## III. Kiến trúc Giao diện và Hệ sinh thái Thành phần

### 1. Thành phần UI tái sử dụng
Hệ thống component được tổ chức theo nhiều cấp phong cách:
- Dark-Card: card dữ liệu tối giản, dùng cho phần lớn dashboard.
- Glass-Panel: panel bán trong suốt cho khu vực marketing, header filter, lớp chuyển cảnh.
- Lux-Panel: card nhấn tương tác tinh tế với border accent và glow có kiểm soát.

Thiết kế component được chuẩn hóa để:
- Dễ tái sử dụng xuyên suốt nhiều route.
- Giữ tính nhất quán thị giác khi scale tính năng.

- Hình chèn tại đây: Hình 3.1. Hệ component tái sử dụng: Dark-Card, Glass-Panel và Lux-Panel trong cùng một ngôn ngữ giao diện.

### 2. Phân luồng hành trình người dùng (App Router Layout)

#### a) Luồng Thương mại & Cá nhân
Luồng thương mại tập trung vào tính mạch lạc:
- Landing/marketing dẫn vào danh mục sản phẩm.
- Product card, product detail và cart giữ cùng ngôn ngữ thiết kế.
- Cart/checkout ưu tiên phân cấp giá trị và CTA rõ ràng.
- Khu vực tài khoản và trạng thái đăng nhập được đồng bộ trong header chung.

- Hình chèn tại đây: Hình 3.2. Luồng App Router cho hành trình thương mại, giỏ hàng và tài khoản người dùng.

#### b) Luồng Điều khiển (Dashboard)
Luồng dashboard được tối ưu cho vận hành thiết bị:
- Màn hình tổng quát hiển thị danh sách thiết bị, trạng thái online/offline.
- Tabs theo thiết bị chia rõ: overview, controls, AI lab, plant doctor, settings.
- Widget phần cứng (đèn, bơm, lịch tưới, cảm biến) được tổ chức thành card độc lập.
- Trạng thái kết nối được phản hồi trực quan bằng badge và color semantics.

- Hình chèn tại đây: Hình 3.3. Luồng Dashboard theo thiết bị: Overview, Controls, AI Lab, Plant Doctor, Settings.

### 3. Thiết kế Đáp ứng Môi trường (Theme Toggle)
Hệ thống hỗ trợ Dark/Light mode theo hai mục tiêu khác nhau:
- Dark mode: tối ưu trải nghiệm không gian dữ liệu với nền galaxy, contrast cao cho dashboard ban đêm.
- Light mode: tối ưu thực dụng ngoài trời sáng, tăng readability với border/foreground sáng rõ.

Theme được lưu ở localStorage và áp dụng qua data-theme để đảm bảo đồng bộ xuyên phiên.

- Hình chèn tại đây: Hình 3.4. So sánh Dark Mode và Light Mode cho bối cảnh sử dụng trong nhà và ngoài trời.

### Khối chèn hình trong bài (Phần III)
- Chèn sau mục III.1 (Thành phần UI tái sử dụng):
	- Hình 3.1. Hệ component tái sử dụng: Dark-Card, Glass-Panel và Lux-Panel trong cùng một ngôn ngữ giao diện.
- Chèn sau mục III.2.a (Luồng Thương mại & Cá nhân):
	- Hình 3.2. Luồng App Router cho hành trình thương mại, giỏ hàng và tài khoản người dùng.
- Chèn sau mục III.2.b (Luồng Điều khiển Dashboard):
	- Hình 3.3. Luồng Dashboard theo thiết bị: Overview, Controls, AI Lab, Plant Doctor, Settings.
- Chèn sau mục III.3 (Theme Toggle):
	- Hình 3.4. So sánh Dark Mode và Light Mode cho bối cảnh sử dụng trong nhà và ngoài trời.

---

## IV. Trải nghiệm Tương tác và Hoạt ảnh Cấp cao

### 1. Nền tảng hoạt ảnh
Dự án sử dụng GSAP làm hạ tầng chuyển động cho các màn hình trọng điểm, thay vì phụ thuộc hoàn toàn vào CSS animation.

Lý do lựa chọn:
- Timeline phức hợp dễ kiểm soát hơn cho các chuỗi cinematic.
- Đồng bộ nhiều lớp visual (text, video, overlay, SVG) trong cùng một luồng thời gian.
- Khả năng tối ưu tốt cho trải nghiệm mượt, mục tiêu 60fps trên UI nhiều hiệu ứng.

- Hình chèn tại đây: Hình 4.1. Chuỗi hoạt ảnh Hero bằng GSAP timeline với chuyển lớp text, video và overlay.

### 2. Kỹ thuật Render Card (ScrollTrigger Batch)
Ở trạng thái triển khai hiện tại:
- Các card và khối nội dung đang dùng cơ chế reveal theo nhịp (stagger delay) và animation class/timeline có kiểm soát.
- Hero và một số section marketing dùng GSAP timeline để điều phối lớp hiển thị.

Định hướng kỹ thuật cho giai đoạn tối ưu tiếp theo:
- Nâng cấp sang ScrollTrigger batch cho nhóm card số lượng lớn.
- Gom xử lý theo cụm viewport để giảm số lần repaint và nâng hiệu suất khi scroll nhanh.

- Hình chèn tại đây: Hình 4.2. Minh họa kỹ thuật reveal card theo nhịp cuộn và độ trễ hiển thị có kiểm soát.

### 3. Giao diện Bento Grid Đa chiều
Bento Grid tạo hiệu ứng công nghệ đa lớp qua:
- VisionMockup: mô phỏng khung nhận diện AI, scan line, overlay nhiễu và chỉ số confidence.
- TelemetryChart: biểu diễn đường dữ liệu dạng SVG với phong cách HUD.
- Circuit/Notification blocks: mô tả trạng thái hệ thống theo ngôn ngữ terminal.

Mục tiêu thị giác đạt được:
- Tạo ảo giác "hệ thống đang chạy" thay vì dashboard tĩnh.
- Tăng tính kể chuyện cho dữ liệu kỹ thuật.

- Hình chèn tại đây: Hình 4.3. Bento Grid đa chiều với VisionMockup, TelemetryChart và các khối HUD trạng thái.

### Khối chèn hình trong bài (Phần IV)
- Chèn sau mục IV.1 (Nền tảng hoạt ảnh):
	- Hình 4.1. Chuỗi hoạt ảnh Hero bằng GSAP timeline với chuyển lớp text, video và overlay.
- Chèn sau mục IV.2 (Kỹ thuật Render Card):
	- Hình 4.2. Minh họa kỹ thuật reveal card theo nhịp cuộn và độ trễ hiển thị có kiểm soát.
- Chèn sau mục IV.3 (Bento Grid Đa chiều):
	- Hình 4.3. Bento Grid đa chiều với VisionMockup, TelemetryChart và các khối HUD trạng thái.

---

## V. Giao diện Phản hồi Dữ liệu Thời gian thực (Real-time UX)

### 1. Trải nghiệm tất thời (Immediate Feedback)
Dự án áp dụng chiến lược polling thông minh trong nhiều khu vực dashboard:
- Cập nhật dữ liệu thiết bị theo chu kỳ định sẵn.
- Tạm dừng hoặc giảm truy vấn khi tab không visible để tiết kiệm tài nguyên.
- Khi người dùng quay lại tab, trigger fetch tức thời để đồng bộ trạng thái mới nhất.

Lợi ích UX:
- Người dùng luôn thấy dữ liệu gần real-time.
- Tránh tải dư thừa gây nóng máy hoặc hao pin không cần thiết.

- Hình chèn tại đây: Hình 5.1. Cơ chế Polling thông minh: cập nhật tuần hoàn, tạm dừng khi tab ẩn và đồng bộ lại khi quay về.

### 2. Luồng xử lý hình ảnh AI
Pipeline xử lý ảnh trong AI Lab được thiết kế theo hướng giảm độ trễ trải nghiệm:
- Ảnh được gửi phân tích AI trực tiếp theo luồng API chuyên dụng.
- Ảnh snapshot từ thiết bị được đẩy lên cloud storage và truy xuất lại qua URL.
- Diagnostic record lưu thông tin đã chuẩn hóa (kết quả AI, sensor context, recommendation), tránh lưu payload nhị phân nặng trong DB.

Hiệu quả đạt được:
- Rút gọn các bước trung gian không cần thiết.
- Tăng tốc phản hồi giao diện khi người dùng chụp ảnh/phân tích liên tục.

- Hình chèn tại đây: Hình 5.2. Luồng xử lý ảnh AI: Capture -> Snapshot API -> Cloud Storage -> Diagnostic Record -> UI Feedback.

### Khối chèn hình trong bài (Phần V)
- Chèn sau mục V.1 (Immediate Feedback):
	- Hình 5.1. Cơ chế Polling thông minh: cập nhật tuần hoàn, tạm dừng khi tab ẩn và đồng bộ lại khi quay về.
- Chèn sau mục V.2 (Luồng xử lý hình ảnh AI):
	- Hình 5.2. Luồng xử lý ảnh AI: Capture -> Snapshot API -> Cloud Storage -> Diagnostic Record -> UI Feedback.

---

## VI. Tổng kết và Đánh giá

### 1. Giá trị cốt lõi
Smart Garden AIoT cho thấy sự kết hợp hiệu quả giữa:
- Nền tảng Next.js hiện đại với cấu trúc App Router rõ ràng.
- Thiết kế token hóa giúp mở rộng giao diện có kiểm soát.
- Trải nghiệm thị giác được trau chuốt, có bản sắc riêng và nhất quán.
- Luồng dữ liệu IoT + AI + commerce được liên kết chặt trong cùng một sản phẩm.

- Hình chèn tại đây: Hình 6.1. Bức tranh tổng hợp giá trị hệ thống: Next.js architecture, UI consistency và Real-time UX.

### 2. Kết luận
Ứng dụng đã vượt qua mô thức dashboard tĩnh thông thường để trở thành một không gian quản lý sinh học số:
- An toàn và có cấu trúc kỹ thuật rõ.
- Trực quan và thân thiện với người dùng cuối.
- Phản hồi nhanh, đủ sâu để phục vụ cả vận hành thiết bị lẫn hành trình thương mại.

"Soft Cyber Garden" không chỉ là một phong cách hình ảnh, mà là một framework trải nghiệm giúp kết nối công nghệ AIoT với hành vi chăm sóc cây trồng hằng ngày một cách tự nhiên và bền vững.

- Hình chèn tại đây: Hình 6.2. Đánh giá kết quả theo các tiêu chí: trực quan, phản hồi nhanh, nhất quán và khả năng mở rộng.

### Khối chèn hình trong bài (Phần VI)
- Chèn sau mục VI.1 (Giá trị cốt lõi):
	- Hình 6.1. Bức tranh tổng hợp giá trị hệ thống: Next.js architecture, UI consistency và Real-time UX.
- Chèn sau mục VI.2 (Kết luận):
	- Hình 6.2. Đánh giá kết quả theo các tiêu chí: trực quan, phản hồi nhanh, nhất quán và khả năng mở rộng.

---

## VII. Gợi ý chèn hình và chú thích theo phần (I → VI)

Lưu ý chung khi đặt hình:
- Mỗi hình nên có số thứ tự theo chuẩn: Hình 1.1, Hình 1.2, ... (chương.phần).
- Chú thích đặt ngay bên dưới hình, canh giữa, cỡ chữ nhỏ hơn nội dung chính 1 bậc.
- Trong phần nội dung, luôn dẫn chiếu kiểu: "như thể hiện ở Hình X.Y".

### 1) Phần I — Mở đầu và tổng quan dự án
- Vị trí đặt hình: cuối mục I.1 hoặc giữa I.1 và I.2.
- Trang gợi ý: trang 2.
- Loại hình phù hợp: sơ đồ tổng thể kiến trúc lai (IoT Dashboard + E-commerce + AI services).
- Mẫu chú thích:
	- Hình 1.1. Tổng quan kiến trúc hệ thống Smart Garden AIoT.
	- Hình 1.2. Mục tiêu trải nghiệm giao diện: Futuristic + Biological-friendly.

### 2) Phần II — Ngôn ngữ thiết kế Soft Cyber Garden
- Vị trí đặt hình: sau từng tiểu mục II.2.a, II.2.b, II.2.c.
- Trang gợi ý: trang 3-4.
- Loại hình phù hợp:
	- Ảnh swatch màu/token (Deep Navy, Emerald, Cyan, Gold).
	- Ảnh so sánh typography Sans-serif vs Monospace trên cùng màn hình.
- Mẫu chú thích:
	- Hình 2.1. Hệ nền phân tầng chiều sâu (Base, Elevated, Overlay).
	- Hình 2.2. Bảng màu nhấn theo ngữ nghĩa vận hành hệ sinh thái.
	- Hình 2.3. Hệ chữ cho nội dung mô tả và số liệu kỹ thuật.

### 3) Phần III — Kiến trúc giao diện và hệ sinh thái thành phần
- Vị trí đặt hình: sau III.1 và sau III.2 (mỗi luồng một hình).
- Trang gợi ý: trang 5-6.
- Loại hình phù hợp:
	- Screenshot nhóm component (Dark-Card, Glass-Panel, Lux-Panel).
	- Sơ đồ luồng App Router cho commerce flow và dashboard flow.
- Mẫu chú thích:
	- Hình 3.1. Hệ sinh thái thành phần giao diện tái sử dụng.
	- Hình 3.2. Luồng thương mại và cá nhân trong App Router.
	- Hình 3.3. Luồng điều khiển thiết bị trong Dashboard.
	- Hình 3.4. So sánh Dark Mode và Light Mode trong ngữ cảnh sử dụng thực tế.

### 4) Phần IV — Trải nghiệm tương tác và hoạt ảnh cấp cao
- Vị trí đặt hình: sau IV.1 và IV.3.
- Trang gợi ý: trang 7-8.
- Loại hình phù hợp:
	- Chuỗi frame Hero animation (timeline theo thời gian).
	- Screenshot Bento Grid (VisionMockup, TelemetryChart, HUD blocks).
- Mẫu chú thích:
	- Hình 4.1. Chuỗi hoạt ảnh Hero dựa trên GSAP timeline.
	- Hình 4.2. Minh họa kỹ thuật reveal card theo nhịp cuộn.
	- Hình 4.3. Bento Grid đa chiều với lớp dữ liệu mô phỏng AI.

### 5) Phần V — Real-time UX
- Vị trí đặt hình: sau V.1 (polling) và V.2 (AI pipeline).
- Trang gợi ý: trang 9.
- Loại hình phù hợp:
	- Sơ đồ polling theo vòng lặp + điều kiện visibility.
	- Sơ đồ pipeline ảnh: Capture -> Snapshot API -> Cloudinary -> Diagnostic -> UI.
- Mẫu chú thích:
	- Hình 5.1. Cơ chế cập nhật trạng thái thiết bị theo polling thông minh.
	- Hình 5.2. Luồng xử lý ảnh AI và tối ưu phản hồi giao diện.

### 6) Phần VI — Tổng kết và đánh giá
- Vị trí đặt hình: cuối chương VI, trước đoạn kết luận cuối cùng.
- Trang gợi ý: trang 10.
- Loại hình phù hợp:
	- Hình tổng hợp dashboard + commerce + AI trong một khung.
	- Bảng/biểu đồ mini đánh giá kết quả theo tiêu chí UX (nhất quán, phản hồi, trực quan).
- Mẫu chú thích:
	- Hình 6.1. Tổng hợp giá trị cốt lõi của hệ thống Smart Garden AIoT.
	- Hình 6.2. Kết quả đánh giá trải nghiệm giao diện theo nhóm tiêu chí.

### Gợi ý quy tắc đặt trang (nếu báo cáo dài 10 trang)
- Trang 1: Bìa.
- Trang 2: Phần I.
- Trang 3-4: Phần II.
- Trang 5-6: Phần III.
- Trang 7-8: Phần IV.
- Trang 9: Phần V.
- Trang 10: Phần VI + kết luận.

Nếu báo cáo ngắn hơn, vẫn giữ đúng thứ tự hình theo phần, chỉ gộp nhiều hình trong cùng một trang nhưng không đổi cách đánh số.

---

## VIII. Checklist chụp hình thủ công (route + khu vực cụ thể)

Mục này dùng trực tiếp khi bạn tự chụp ảnh màn hình cho báo cáo.

### Quy ước nhanh trước khi chụp
- Trình duyệt desktop: chiều rộng khoảng 1440px để giữ bố cục chuẩn.
- Header phải hiển thị đầy đủ (logo, nav, theme).
- Với ảnh dashboard, đăng nhập trước để tránh chụp nhầm màn auth.
- Mỗi ảnh chỉ tập trung 1 ý chính (không chụp quá nhiều vùng nhỏ trong cùng 1 hình).

### A) Phần I — Mở đầu và tổng quan

#### Hình 1.1 — Kiến trúc hệ thống lai
- Route để chụp: / (trang chủ).
- Khu vực cụ thể: toàn màn hình có AppHeader + Hero (thể hiện lớp marketing) để làm ảnh mở đầu hệ thống.
- Gợi ý khung chụp: từ top header đến hết khối Hero.

#### Hình 1.2 — Mục tiêu trải nghiệm Futuristic + Biological
- Route để chụp: / (trang chủ).
- Khu vực cụ thể: Hero section có nền video/galaxy và chữ ECO/TECH.
- Caption mẫu: “Trang chủ - phần Hero, thể hiện định hướng thị giác công nghệ kết hợp sinh học.”

### B) Phần II — Ngôn ngữ thiết kế Soft Cyber Garden

#### Hình 2.1 — Phân tầng nền và chiều sâu
- Route để chụp: /dashboard.
- Khu vực cụ thể: vùng sidebar + card thiết bị ở nội dung chính để thấy rõ Base/Elevated/Border layer.

#### Hình 2.2 — Màu nhấn Emerald/Cyan/Gold
- Route để chụp: /dashboard/[deviceId]/overview hoặc /dashboard/[deviceId]/controls.
- Khu vực cụ thể: badge trạng thái, card metric, trạng thái cảnh báo.
- Nếu chưa có device thật: chụp /dashboard với demo card (Online/Offline badge).

#### Hình 2.3 — Typography Sans + Monospace
- Route để chụp: /products và /dashboard.
- Khu vực cụ thể:
	- /products: title/description (Sans).
	- /dashboard: mã device/metric label (Monospace).

### C) Phần III — Kiến trúc giao diện và component ecosystem

#### Hình 3.1 — Component tái sử dụng
- Route để chụp: /products.
- Khu vực cụ thể: Product Grid (nhiều ProductCard cùng lúc).

#### Hình 3.2 — Luồng thương mại
- Route để chụp lần lượt:
	- /products (danh sách),
	- /products/[slug] (chi tiết),
	- /cart (giỏ hàng).
- Khu vực cụ thể: phần nội dung trung tâm của mỗi trang.

#### Hình 3.3 — Luồng điều khiển dashboard
- Route để chụp lần lượt:
	- /dashboard (My Pots),
	- /dashboard/[deviceId]/overview,
	- /dashboard/[deviceId]/controls,
	- /dashboard/[deviceId]/ai-lab.
- Khu vực cụ thể: tab bar thiết bị + nội dung tab.

#### Hình 3.4 — Theme Toggle (Dark/Light)
- Route để chụp: /dashboard hoặc /products.
- Khu vực cụ thể: cùng một màn hình chụp 2 lần (dark và light), giữ nguyên khung.
- Cách làm: bật/tắt ThemeToggle ở header rồi chụp lại cùng vị trí.

### D) Phần IV — Tương tác và hoạt ảnh

#### Hình 4.1 — Hero animation
- Route để chụp: /.
- Khu vực cụ thể: Hero section ở 2 thời điểm:
	- lúc text/overlay đang hiện,
	- lúc video đã fade-in.

#### Hình 4.2 — Render card/reveal khi cuộn
- Route để chụp: /products.
- Khu vực cụ thể: Product grid ở vùng giữa trang sau khi cuộn xuống (các card vừa vào viewport).

#### Hình 4.3 — Bento Grid đa lớp
- Route để chụp: /.
- Khu vực cụ thể: Bento section gồm VisionMockup + Telemetry + Hardware/Log cards.
- Gợi ý: chụp trọn 1 màn có đầy đủ 4 khối.

### E) Phần V — Real-time UX

#### Hình 5.1 — Polling/Realtime trạng thái thiết bị
- Route để chụp: /dashboard.
- Khu vực cụ thể: danh sách DeviceCard có badge Online/Offline và số liệu TDS/pH/Temp.
- Chụp thêm 1 ảnh ở /dashboard/[deviceId]/controls để thấy trạng thái Connected/Unconnected.

#### Hình 5.2 — Luồng xử lý ảnh AI
- Route để chụp: /dashboard/[deviceId]/ai-lab.
- Khu vực cụ thể:
	- khối AITestUpload (upload/capture),
	- kết quả chẩn đoán,
	- panel Environmental Risk Intelligence.
- Đây là ảnh chính minh họa pipeline ảnh AI -> lưu kết quả -> phản hồi UI.

### F) Phần VI — Tổng kết và đánh giá

#### Hình 6.1 — Ảnh tổng hợp giá trị hệ thống
- Route để chụp: /dashboard/[deviceId]/ai-lab hoặc /dashboard/[deviceId]/overview.
- Khu vực cụ thể: màn thể hiện đồng thời dữ liệu thiết bị + phân tích AI.

#### Hình 6.2 — Tổng hợp commerce + dashboard
- Route để chụp 2 ảnh nhỏ:
	- /products (commerce),
	- /dashboard (operations).
- Dùng hai ảnh đặt cạnh nhau trong báo cáo để kết luận tính tích hợp hệ thống.

### Gợi ý đặt tên file ảnh để khỏi nhầm
- fig-1-1-home-overview.png
- fig-1-2-home-hero.png
- fig-2-1-dashboard-depth.png
- fig-3-2-products-to-cart-flow.png
- fig-5-2-ai-lab-pipeline.png

Bạn có thể giữ đúng tên này để map nhanh với caption trong các phần I -> VI.
