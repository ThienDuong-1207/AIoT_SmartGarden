# Tài Liệu Ánh Xạ Chức Năng Của Từng File Dự Án (Project File Mapping)

Dưới đây là một danh sách phẳng hiển thị chức năng của **tất cả** các file đang tồn tại trong dự án AIoT Smart Garden của bạn.

---

## 1. Cấp Độ Gốc Của Dự Án (Root Directory)

*   `/.env.local`: Lưu trữ các biến môi trường cấu hình Database (MongoDB), API Keys, JWT Secrets và credentials bảo mật.
*   `/package.json`: Danh sách toàn bộ các thư viện Node.js được ứng dụng (dependencies) cùng các Script chạy dự án.
*   `/package-lock.json`: File log ghi nhận chi tiết chính xác version của từng npm package đã cài đặt.
*   `/tsconfig.json`: Tệp cấu hình của trình biên dịch TypeScript (TSC).
*   `/next.config.ts`: Cấu hình lõi khi build dự án (webpack config, image domains whitelist, etc.).
*   `/middleware.ts`: Ngăn chặn người dùng chưa đăng nhập truy cập vào các trang bảo mật, và redirect (điều hướng) họ về trang Login.
*   `/.gitignore`: Khai báo những file và thư mục (như `node_modules`, `.env`) sẽ bị bỏ qua khi commit lên Github/Gitlab.
*   `/eslint.config.mjs`: Thiết lập bộ quy tắc kiểm định lỗi chính tả/cú pháp code Javascript/Typescript.
*   `/postcss.config.mjs`: Thiết lập bộ build xử lý CSS hậu kỳ, kết nối mạnh mẽ cùng TailwindCSS.
*   `/plantAI.pt`: Trọng số (Weights) của mô hình AI YOLOv8 đã train chuyên biệt cho lá cây.
*   `/README.md`: Hướng dẫn cài đặt và thiết lập nhanh dự án bằng Tiếng Anh.

---

## 2. Thư mục `app/` (Hệ thống điều hướng Next.js)

### 2.1. Cấu hình toàn cục
*   `/app/layout.tsx`: Root Layout định hình khung HTML, Body bọc lại những Provider (Context dữ liệu) cần cho mọi page.
*   `/app/globals.css`: Thiết lập CSS Reset, định nghĩa những biến màu chủ đạo.
*   `/app/page.tsx`: File render nội dung Trang Chủ Landing Page bắt mắt nhất của trang.
*   `/app/head.tsx`: Quản lý các thẻ Meta tag SEO (Title, description) của dự án.

### 2.2. Phân vùng Frontend Pages (Các Trang)
*   **Trang Giới thiệu:**
    *   `/app/about/page.tsx`: Màn hình About Us của dự án.
*   **Trang Xác thực (Auth):**
    *   `/app/auth/login/page.tsx`: Màn hình đăng nhập tài khoản.
    *   `/app/auth/register/page.tsx`: Màn hình Đăng ký mới.
    *   `/app/auth/redirect/page.tsx`: Trạm trung gian chuyển đổi trang sau khi Auth API chạy xong.
*   **Trang Shop & Kệ Hàng:**
    *   `/app/products/page.tsx`: Màn hình liệt kê sản phẩm.
    *   `/app/products/[slug]/page.tsx`: Màn hình chi tiết của 1 sản phẩm.
    *   `/app/cart/page.tsx`: Giỏ hàng cá nhân.
    *   `/app/checkout/success/page.tsx`: Thông báo mua hàng/chốt đơn thành công.
*   **Trang Quản trị (Admin):**
    *   `/app/admin/layout.tsx`: Khung viền riêng dành cho phân vùng Admin.
    *   `/app/admin/page.tsx`: Tổng quan hệ thống cho Admin xem chung.
    *   `/app/admin/users/page.tsx`: Màn hình quản trị người dùng.
    *   `/app/admin/products/page.tsx`: Quản lý thêm/xoá/sửa sản phẩm.
    *   `/app/admin/orders/page.tsx`: Duyệt đơn mua.
    *   `/app/admin/diagnostics/page.tsx`: Quản lý các Record bệnh thực vật mà AI báo cáo.
*   **Trang Cá Nhân:**
    *   `/app/profile/page.tsx`: Thông tin User.
*   **Trang IoT Dashboard (Giao diện điều khiển Vườn):**
    *   `/app/dashboard/layout.tsx`: Khung Dashboard với các Tabs thông số.
    *   `/app/dashboard/page.tsx`: Dashboard tổng.
    *   `/app/dashboard/[deviceId]/page.tsx`: Quản lý chi tiết theo từng máy/chậu cây.
    *   `/app/dashboard/alerts/page.tsx`: Tab kiểm tra các cảnh báo cũ.
    *   `/app/dashboard/settings/page.tsx`: Cấu hình cho cụm thiết bị IOT.

### 2.3. Phân vùng Backend (API Routes)
*   `/app/api/auth/[...nextauth]/route.ts`: Xử lý luồng đăng nhập bằng Google hoặc Tài khoản/Mật khẩu lưu trong MongoDB.
*   `/app/api/ingest/route.ts`: HTTP Webhook tiếp nhận Data Cảm biến bắn lên nếu ko dùng MQTT.
*   `/app/api/ai/predict/route.ts`: Nơi tiếp quản tấm ảnh cây bị bệnh để truyền xuống cho Python Server.
*   `/app/api/ai/ollama/...`: API kết nối tới một local LLM mô hình Ollama (nếu xài để chat tư vấn GPT nội bộ).
*   `/app/api/devices/route.ts`: CRUD các thiết bị IOT trong vườn.
*   `/app/api/alerts/route.ts`: API xử lý đánh dấu đã đọc các thông báo Push.
*   `/app/api/products/route.ts`: API Cấp dữ liệu JSON List Cửa hàng.
*   `/app/api/admin/route.ts`: API giới hạn đặc quyền cho thao tác Admin xoá tài khoản,...

---

## 3. Thư mục `components/` (Tái sử dụng các UI Mảnh ghép)

### 3.1. Các Components của Dashboard
*   `/components/dashboard/DashboardClient.tsx`: Hooking MQTT lên toàn app Dashboard, Subscribe/Publish logic.
*   `/components/dashboard/DeviceCard.tsx`: Một khối Card thông minh hiện tình trạng On/Off của Node.
*   `/components/dashboard/SmartAlerts.tsx`: Sidebar hay Floating Cảnh báo (khi tưới quá nhiều, hay khi thiếu sáng).
*   `/components/dashboard/AITestUpload.tsx`: Nút kéo/thả ảnh lên UI để Test AI, show box kết quả Loading mô phỏng chuẩn đoán bệnh.
*   `/components/dashboard/PumpControl.tsx`: Form UI nút Bấm Bơm nước.
*   `/components/dashboard/LightControl.tsx`: Slider ánh sáng / Tắt Bật Đèn Grow Light.
*   `/components/dashboard/WateringSchedule.tsx`: Form thiết lập Hẹn Giờ tưới Cây.
*   `/components/dashboard/SensorCalibrationWizard.tsx`: Tool Step-by-Step dùng để cân chỉnh Data cho cảm biến Đất khi mới cấu hình.
*   `/components/dashboard/AddDeviceModal.tsx` & `AddDeviceContent.tsx`: Popup giao diện thêm Chậu Cây mới.
*   `/components/dashboard/DeviceTabsNav.tsx`: Chuyển tab qua lại giữa các Màn hình Device.

### 3.2. Các Components của Admin
*   `/components/admin/AdminSidebar.tsx`: Thanh điều hướng sườn trải dọc cho Admin.
*   `/components/admin/AdminHeader.tsx`: Thanh Toolbar ngang trên Admin.
*   `/components/admin/AdminProductForm.tsx`: Component Form điền thông tin nhập/tạo Sản phẩm bán mới.
*   `/components/admin/AdminProductDeleteButton.tsx`: Nút xử lý cảnh báo Confirm xoá sp.
*   `/components/admin/AdminUserActions.tsx`: Cột Action ở Table User -> Ban / Khoá User.
*   `/components/admin/AdminOrderActions.tsx`: Cột Action cập nhật Status cho giao hàng/duyệt đơn.

### 3.3. Các Components Marketing (UI/UX Sang Mịn)
*   `/components/marketing/AppHeader.tsx` & `AppHeaderClient.tsx`: Navbar trang public.
*   `/components/marketing/SiteFooter.tsx`: Cấu trúc Footer website.
*   `/components/marketing/HomeHero.tsx`: Cinematic Animation (Text chớp tắt, line chạy GSAP đỉnh cao).
*   `/components/marketing/BentoGrid.tsx`: Hiển thị bố cục Grid lệch "bento" (hiệu ứng di chuột 3D card/ kính mờ Glassmorphism).
*   `/components/marketing/ProductCard.tsx`: Box chứa riêng biệt cho một item đồ E-commerce.
*   `/components/marketing/AddToCartButton.tsx`: Nút Push Logic vô App Context (Cart Data).
*   `/components/marketing/TerminalCta.tsx`: Giao diện Code Terminal mô phỏng mời gọi tương tác kỹ thuật.
*   `/components/marketing/LoadingScreen.tsx`: Logo Spinner GSAP đợi nạp CSS.
*   `/components/marketing/HomePageClient.tsx` & `AboutClient.tsx` & `ProductsClient.tsx`: Wrapper Client Component.

### 3.4. Các Provider, UI Global Components
*   `/components/providers/ThemeProvider.tsx`: Xử lý logic Dark/Light Mode Tailwind (class `dark`).
*   `/components/providers/AuthSessionProvider.tsx`: Nạp NextAuth Session xuyên suốt App tree.
*   `/components/providers/CartProvider.tsx`: Hook context theo dõi Giỏ Hàng chung giấu ở Background App.
*   `/components/ui/GalaxyBackground.tsx`: Lớp Filter Canvas/Particles chạy ngầm ở màn Home tạo độ Sâu không gian vũ trụ/eco.
*   `/components/ui/ThemeToggle.tsx`: Nút Switch icon Mặt Trời / Mặt Trăng.

---

## 4. Thư mục `lib/` (Lõi chức năng thuần, Utils & Driver)

*   `/lib/mqtt.ts`: Bộ Engine mạnh mẽ nhất xử lý vòng lặp MQTT Broker, quản lý Socket mất/nối lại, parse JSON Payload từ ngoại vi.
*   `/lib/mongodb.ts`: Connect Driver Data Database.
*   `/lib/auth.ts`: Lưu trữ JWT Logic, Bcrypt Verification kiểm thử mật khẩu.
*   `/lib/firebase.ts` & `firebaseClient.ts`: SDK khai báo cho Browser dùng Firebase.
*   `/lib/firebaseAdmin.ts`: Cấp quyền Private Server SDK để gửi Push Message.
*   `/lib/sendNotification.ts`: Phương thức kích hoạt lệnh gửi App Notification vào thẳng điện thoại của Chủ vườn.
*   `/lib/fuseDiagnosis.ts`: Mã nhúng đóng gói việc Đẩy Ảnh -> Server Python -> Nhận JSON -> Định hình loại bệnh vào DB và Gọi thông báo FCM.
*   `/lib/cart.ts`: Thư viện tính Cart Utils (Price X VAT X Số lượng).
*   `/lib/mock-data.ts`: Fake Demo Data để test UX mà ko cần Đợi Phần Cứng.
*   `/lib/deviceAuth.ts`: Mã mã hoá Bảo mật cho riêng Trạm Cảm Biến Gửi Data vào, đánh bay Fake Data từ Hacker.
*   `/lib/require-admin.ts`: Function Check xem Node backend đang được gọi có phải từ tài khoản Role Admin hay không?

---

## 5. Thư mục `models/` (Các Schema Giao Dịch MongoDB)

*   `/models/User.ts`: Khung Dữ liệu Email, Role, Avatar Của Khách Hàng.
*   `/models/Product.ts` & `Order.ts`: Khung Dữ liệu Tên SP, URL Ảnh SP, Mã Đơn, Số lượng Tiền, Address.
*   `/models/Device.ts`: Name, Wifi MAC Address, Status Offline/Online Của Trạm vườn.
*   `/models/SensorReading.ts`: Object Data Mũi Tên Dữ liệu (Thời điểm 10:00 -> Temp 30.0 -> Humd 40% -> Đang tưới...).
*   `/models/AIdiagnostic.ts`: Cấu trúc Lưu Log lịch sử các Lần Báo Bệnh Cây (Sợ thiếu sắt, Bệnh vàng lá).
*   `/models/Alert.ts`: Bảng lưu giữ Cảnh Báo "Đất Quá Khô!" (isRead = True/False).
*   `/models/Command.ts`: Bảng lưu giữ các Lệnh Điều Khiển bơm đã được ra lệnh (Schedule time).
*   `/models/CameraCapture.ts`: Bảng map Image UUID Của Lần chụp ảnh IoT vừa xong.

---

## 6. Thư mục `plant_ai_service/` (Server Xử lý Hình Ảnh Python)

*   `/plant_ai_service/main.py`: Chạy Server cực lẹ (FastAPI Uvicorn), load Model Model YOLOv8 vào CUDA GPU (nếu có) để Scan Ảnh và return JSON toạ độ con sâu/vết đốm vàng.
*   `/plant_ai_service/requirements.txt`: Bộ package Python (`uvicorn`, `fastapi`, `ultralytics`, `python-multipart`).
*   `/plant_ai_service/plantAI.md`: Trợ lý hướng dẫn (docs) môi trường cài đặt Pytorch ảo cho dev team tham khảo.

---

## 7. Các Thư Mục Tiện Ích Khác
*   `/hooks/useFcmToken.ts`: Tuỳ biến React Hook nhằm hỏi cửa sổ Browser Permission cho quyền Enable Notification trên máy Local/iOS/Android.
*   `/types/next-auth.d.ts`: Tích hợp các thuộc tính Bổ sung như `user.role`, `user.id` vào Type Safe Của Typecript để code ko bị báo Lỗi môi trường gõ.
*   `/public/favicon.ico` + các tài nguyên khác: Các file tĩnh, icon tải từ public.
