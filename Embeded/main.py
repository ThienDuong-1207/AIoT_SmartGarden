import network
import time
import ujson
import dht
from machine import Pin, ADC
from umqtt.simple import MQTTClient
import urequests
import gc
import camera

# ==========================================
# 1. CẤU HÌNH HỆ THỐNG (CHỈNH TẠI ĐÂY)
# ==========================================
SSID = "Dna"
PASSWORD = "xiungangxiudoc"

# Cấu hình MQTT HiveMQ
MQTT_BROKER = "00ab434094624b199888389f95079d45.s1.eu.hivemq.cloud"
MQTT_USER = "admin"
MQTT_PASSWORD = "Admin123"
DEVICE_ID = "DEV_ESP32_001"

# Các Topic MQTT
TOPIC_SENSOR = b"garden/DEV_ESP32_001/sensors"
TOPIC_COMMAND = b"garden/DEV_ESP32_001/commands"

# API Next.js (⚠️ Hãy kiểm tra lại địa chỉ IP máy tính của bạn thường xuyên)
NEXTJS_API_URL = "http:// 192.168.43.127:3000/api/camera/upload"

# Khởi tạo cảm biến
dht_sensor = dht.DHT11(Pin(41))
tds_adc = ADC(Pin(1))
tds_adc.atten(ADC.ATTN_11DB)

# Biến trạng thái để kiểm soát đa nhiệm
capture_trigger = False 
is_processing = False 

# ==========================================
# 2. HÀM CHỤP VÀ GỬI ẢNH (ĐẶC TRỊ OV3660)
# ==========================================
def take_and_send_photo(reason="Auto"):
    global is_processing
    is_processing = True # Khóa chip để tập trung chụp ảnh
    buf = None
    try:
        print(f"\n📸 [{reason}] Bắt đầu khởi động Camera OV3660...")
        
        # Dọn rác RAM trước khi khởi động camera
        gc.collect()
        
        camera.init(0, format=camera.JPEG, framesize=camera.FRAME_VGA, 
                    d0=11, d1=9, d2=8, d3=10, d4=12, d5=18, d6=17, d7=16,
                    href=7, vsync=6, reset=-1, pwdn=-1, sioc=5, siod=4, xclk=15, pclk=13,
                    xclk_freq=20000000)
        
        # Đợi 3 giây để OV3660 cân bằng trắng (Rất quan trọng)
        time.sleep(3) 
        
        # Xả 2 frame "rác" để tránh nhiễu
        camera.capture() 
        time.sleep(0.5)
        camera.capture() 
        
        # Chụp tấm ảnh chính thức
        buf = camera.capture()
        camera.deinit() # GIẢI PHÓNG CAMERA NGAY ĐỂ CỨU RAM
        
        if buf and len(buf) > 0:
            print(f"✅ Đã chụp ({len(buf)} bytes). Đang đẩy lên Cloudinary...")
            headers = {'Device-Id': DEVICE_ID, 'Content-Type': 'image/jpeg'}
            
            # Gửi ảnh lên Server
            res = urequests.post(NEXTJS_API_URL, headers=headers, data=buf)
            print("🌐 Server phản hồi:", res.text)
            res.close()
        else:
            print("❌ Lỗi: Buffer ảnh trống!")
            
    except Exception as e:
        print(f"❌ Lỗi xử lý ảnh ({reason}):", e)
        try: camera.deinit()
        except: pass
    finally:
        if buf: del buf
        is_processing = False # Mở khóa chip
        gc.collect()

# ==========================================
# 3. XỬ LÝ MQTT & WIFI
# ==========================================
def sub_cb(topic, msg):
    global capture_trigger, is_processing
    print(f"📩 Lệnh MQTT: {msg}")
    if msg == b"capture_now":
        if is_processing:
            print("⚠️ Máy đang bận xử lý, bỏ qua lệnh Capture mới.")
        else:
            capture_trigger = True 

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)
    print('Đang kết nối WiFi...', end='')
    while not wlan.isconnected():
        print('.', end='')
        time.sleep(0.5)
    print('\n✅ WiFi OK! IP:', wlan.ifconfig()[0])

def connect_mqtt():
    client = MQTTClient(DEVICE_ID, MQTT_BROKER, port=8883, user=MQTT_USER, 
                        password=MQTT_PASSWORD, keepalive=60, ssl=True, 
                        ssl_params={'server_hostname': MQTT_BROKER})
    client.set_callback(sub_cb)
    client.connect()
    client.subscribe(TOPIC_COMMAND)
    print("✅ MQTT HiveMQ OK!")
    return client

def get_sensors():
    try:
        dht_sensor.measure()
        t, h = dht_sensor.temperature(), dht_sensor.humidity()
        adc_sum = sum([tds_adc.read() for _ in range(20)])
        v = (adc_sum / 20) * 3.3 / 4095
        tds = (133.42 * v**3 - 255.86 * v**2 + 857.39 * v) * 0.5
        return t, h, round(tds, 1)
    except:
        return None, None, None

# ==========================================
# 4. VÒNG LẶP CHÍNH (ĐA NHIỆM)
# ==========================================
connect_wifi()
mqtt_client = connect_mqtt()

last_sensor_time = time.time()
last_photo_time = time.time()

print("\n🚀 Hệ thống AIoT Smart Garden ONLINE!")

while True:
    try:
        # Kiểm tra hòm thư MQTT (lệnh từ Web)
        mqtt_client.check_msg()
        
        current_time = time.time()
        
        # 1. ƯU TIÊN: Thực thi lệnh Capture Now từ Web
        if capture_trigger and not is_processing:
            take_and_send_photo(reason="Manual")
            capture_trigger = False
            last_photo_time = current_time # Reset bộ đếm tự động
        
        # 2. Gửi sensor (Mỗi 10 giây)
        if current_time - last_sensor_time >= 10:
            t, h, tds = get_sensors()
            if t is not None:
                payload = ujson.dumps({"deviceId": DEVICE_ID, "temp": t, "humi": h, "tds_ppm": tds})
                mqtt_client.publish(TOPIC_SENSOR, payload)
                print(f"📡 Sensor: {payload}")
            last_sensor_time = current_time
            
        # 3. Tự động chụp ảnh định kỳ (Mỗi 60 giây)
        if current_time - last_photo_time >= 60 and not is_processing:
            take_and_send_photo(reason="Schedule")
            last_photo_time = current_time
            
        time.sleep(0.5) # Nghỉ 0.5s để vòng lặp mượt mà
        
    except Exception as e:
        print("🔄 Mất kết nối, đang thử lại...", e)
        try:
            mqtt_client.connect()
            mqtt_client.subscribe(TOPIC_COMMAND)
        except:
            pass
        time.sleep(5)