export const sampleProducts = [
  {
    slug: "hat-giong-cai-xanh",
    name: "Hydroponic Mustard Green Seeds",
    category: "seeds",
    price: 1.99,
    salePrice: 1.59,
    images: ["/globe.svg"],
    description: "High-germination seeds optimized for home hydroponic systems.",
    specs: { germination: "3–5 days", harvest: "25–30 days" },
    stock: 120,
    rating: 4.7,
    reviewCount: 48,
    tags: ["seed", "hydroponic"],
  },
  {
    slug: "dung-dich-a-b-500ml",
    name: "A+B Nutrient Solution 500ml",
    category: "nutrients",
    price: 4.99,
    salePrice: 4.49,
    images: ["/file.svg"],
    description: "Balanced nutrient kit for leafy greens and herbs.",
    specs: { volume: "500ml x 2", usage: "2ml/L" },
    stock: 80,
    rating: 4.8,
    reviewCount: 67,
    tags: ["nutrients", "ab"],
  },
  {
    slug: "chau-thong-minh-esp32",
    name: "ESP32 Smart Garden Pot",
    category: "smart-pots",
    price: 67.99,
    images: ["/window.svg"],
    description: "Integrated TDS, pH, temperature sensors with dashboard control.",
    specs: { sensors: ["TDS", "pH", "DHT22"], connection: "WiFi" },
    stock: 25,
    rating: 4.9,
    reviewCount: 21,
    tags: ["iot", "smart-pot"],
  },
];

export const sampleAlerts = [
  "TDS below minimum threshold — consider adding A+B solution",
  "pH stable within range 5.8 – 6.3",
  "Reservoir water level at 42%",
  "Ambient temperature 24.1°C — optimal for growth",
  "Last capture: plant appears healthy",
];

export const sampleProductReviews: Record<
  string,
  Array<{ author: string; rating: number; content: string; verified: boolean; createdAt: string }>
> = {
  "hat-giong-cai-xanh": [
    {
      author: "Ngoc Anh",
      rating: 5,
      content: "Easy to grow — sprouted evenly in 4 days. Great for beginners.",
      verified: true,
      createdAt: "2026-02-21",
    },
    {
      author: "Hoang Minh",
      rating: 4,
      content: "High germination rate, neatly packaged. Will buy again next season.",
      verified: true,
      createdAt: "2026-01-15",
    },
  ],
  "dung-dich-a-b-500ml": [
    {
      author: "Khanh Linh",
      rating: 5,
      content: "Works great with my home NFT system — leaves are noticeably greener after 1 week.",
      verified: true,
      createdAt: "2026-03-05",
    },
    {
      author: "Tuan Kiet",
      rating: 4,
      content: "Clear mixing instructions, perfect volume for small-scale growers.",
      verified: false,
      createdAt: "2026-02-11",
    },
  ],
  "chau-thong-minh-esp32": [
    {
      author: "Mai Thu",
      rating: 5,
      content: "Dashboard is easy to read, pH alerts are fast. Camera works well at night.",
      verified: true,
      createdAt: "2026-03-12",
    },
    {
      author: "Gia Bao",
      rating: 5,
      content: "From unboxing to connected app in about 20 minutes. Premium experience.",
      verified: true,
      createdAt: "2026-02-26",
    },
  ],
};
