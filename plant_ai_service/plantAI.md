# Lần đầu hoặc sau khi tắt máy
docker compose up -d

# Kiểm tra đang chạy
docker ps

# Kiểm tra health
curl http://localhost:8000/health

# Xem log nếu lỗi
docker logs aiot_smartgarden-plantai-1 --tail 50

# Rebuild và start lại từ thư mục gốc:
cd ~/Documents/GitHub/AIoT_SmartGarden
docker compose up -d --build