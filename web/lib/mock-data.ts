export const sampleProducts = [
  {
    slug: "hat-giong-cai-xanh",
    name: "Hạt Giống Cải Xanh Thủy Canh",
    category: "seeds",
    price: 39000,
    salePrice: 32000,
    images: ["/globe.svg"],
    description: "Hạt giống tỷ lệ nảy mầm cao, phù hợp cho hệ thống thủy canh tại nhà.",
    specs: { germination: "3-5 ngày", harvest: "25-30 ngày" },
    stock: 120,
    rating: 4.7,
    reviewCount: 48,
    tags: ["seed", "hydroponic"],
  },
  {
    slug: "dung-dich-a-b-500ml",
    name: "Dung Dịch Dinh Dưỡng A+B 500ml",
    category: "nutrients",
    price: 129000,
    salePrice: 115000,
    images: ["/file.svg"],
    description: "Bộ dinh dưỡng cân bằng cho rau lá và cây gia vị.",
    specs: { volume: "500ml x 2", usage: "2ml/lit" },
    stock: 80,
    rating: 4.8,
    reviewCount: 67,
    tags: ["nutrients", "ab"],
  },
  {
    slug: "chau-thong-minh-esp32",
    name: "Chậu Thông Minh ESP32 Smart Pot",
    category: "smart-pots",
    price: 1590000,
    images: ["/window.svg"],
    description: "Tích hợp cảm biến TDS, pH, nhiệt độ và điều khiển từ dashboard.",
    specs: { sensors: ["TDS", "pH", "DHT22"], connection: "WiFi" },
    stock: 25,
    rating: 4.9,
    reviewCount: 21,
    tags: ["iot", "smart-pot"],
  },
];

export const sampleAlerts = [
  "TDS thấp hơn ngưỡng tối thiểu, cân nhắc bổ sung dung dịch A+B",
  "pH đang ổn định trong vùng 5.8 - 6.3",
  "Mực nước bể chứa còn 42%",
  "Nhiệt độ môi trường 24.1°C, phù hợp tăng trưởng",
  "Lần chụp ảnh gần nhất: cây khỏe mạnh",
];

export const sampleProductReviews: Record<
  string,
  Array<{ author: string; rating: number; content: string; verified: boolean; createdAt: string }>
> = {
  "hat-giong-cai-xanh": [
    {
      author: "Ngoc Anh",
      rating: 5,
      content: "Hat nay de trong, 4 ngay da thay cay len deu. Rat phu hop cho nguoi moi bat dau.",
      verified: true,
      createdAt: "2026-02-21",
    },
    {
      author: "Hoang Minh",
      rating: 4,
      content: "Ti le nay mam tot, dong goi gon gang. Minh se mua lai cho vu tiep theo.",
      verified: true,
      createdAt: "2026-01-15",
    },
  ],
  "dung-dich-a-b-500ml": [
    {
      author: "Khanh Linh",
      rating: 5,
      content: "Dung voi he NFT o nha rat on dinh, la xanh hon sau 1 tuan.",
      verified: true,
      createdAt: "2026-03-05",
    },
    {
      author: "Tuan Kiet",
      rating: 4,
      content: "Huong dan pha de hieu, dung tich vua du cho nguoi choi nho le.",
      verified: false,
      createdAt: "2026-02-11",
    },
  ],
  "chau-thong-minh-esp32": [
    {
      author: "Mai Thu",
      rating: 5,
      content: "Dashboard de xem, canh bao pH nhanh. Camera chup on dinh vao buoi toi.",
      verified: true,
      createdAt: "2026-03-12",
    },
    {
      author: "Gia Bao",
      rating: 5,
      content: "Tu lap dat den ket noi app khoang 20 phut. Trai nghiem rat cao cap.",
      verified: true,
      createdAt: "2026-02-26",
    },
  ],
};
