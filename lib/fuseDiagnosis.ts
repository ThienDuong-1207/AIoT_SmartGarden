/**
 * Kết hợp kết quả AI detection + sensor context để tạo diagnosis chi tiết hơn
 */

type SensorContext = {
  tds?: number | null;
  ph?: number | null;
  temperature?: number | null;
  humidity?: number | null;
};

export function fuseDiagnosis(
  topDisease: string | null,
  status: string,
  sensor: SensorContext
): string {
  const { tds, ph, temperature, humidity } = sensor;
  const cls = (topDisease ?? "").toLowerCase().replace(/\s+/g, "_");

  if (status === "healthy") {
    const notes: string[] = [];
    if (tds !== null && tds !== undefined) {
      if (tds < 600)  notes.push("TDS thấp — cần bổ sung dinh dưỡng");
      if (tds > 1800) notes.push("TDS cao — pha loãng dung dịch");
    }
    if (ph !== null && ph !== undefined) {
      if (ph < 5.5) notes.push("pH quá thấp — thêm KOH để nâng pH");
      if (ph > 7.0) notes.push("pH quá cao — thêm axit để hạ pH");
    }
    if (notes.length > 0) return `Cây khỏe nhưng chú ý: ${notes.join("; ")}.`;
    return "Cây phát triển bình thường. Không phát hiện bệnh.";
  }

  // --- Bệnh: kết hợp sensor để suy luận nguyên nhân ---

  if (cls === "yellow_leaf") {
    if (ph !== null && ph !== undefined && ph > 6.8)
      return `Vàng lá — Nghi ngờ thiếu sắt (Fe) do pH cao (${ph}). pH cao làm Fe kết tủa, cây không hấp thu được.`;
    if (tds !== null && tds !== undefined && tds < 600)
      return `Vàng lá — TDS quá thấp (${tds} ppm), thiếu dinh dưỡng tổng thể (N, Mg, Fe).`;
    if (temperature !== null && temperature !== undefined && temperature > 30)
      return `Vàng lá — Nhiệt độ cao (${temperature}°C) gây stress nhiệt, ức chế hấp thu dinh dưỡng.`;
    return "Vàng lá — Kiểm tra pH (mục tiêu 5.8–6.5) và nồng độ TDS.";
  }

  if (cls === "powdery_mildew") {
    if (humidity !== null && humidity !== undefined && humidity > 75)
      return `Nấm phấn trắng — Độ ẩm cao (${humidity}%) tạo điều kiện phát triển nấm. Cần tăng thông gió ngay.`;
    return "Nấm phấn trắng — Giảm độ ẩm, tăng thông gió, phun baking soda 1%.";
  }

  if (cls === "brown_spot") {
    if (humidity !== null && humidity !== undefined && humidity > 70)
      return `Đốm nâu — Độ ẩm cao (${humidity}%) kết hợp nhiệt độ ${temperature ?? "?"}°C tạo điều kiện nấm Cercospora phát triển.`;
    return "Đốm nâu — Nghi mầm bệnh nấm. Loại bỏ lá bệnh, cải thiện thông gió.";
  }

  if (cls === "aphid") {
    return `Rệp sáp — Mật độ ${tds !== null && tds !== undefined && tds > 1400 ? "có thể tăng do TDS cao" : "thấp"}. Phun neem oil 0.5%, kiểm tra mặt dưới lá.`;
  }

  if (cls === "nutrient_deficiency") {
    if (tds !== null && tds !== undefined && tds < 700)
      return `Thiếu dinh dưỡng — TDS chỉ ${tds} ppm (quá thấp). Bổ sung dung dịch A+B để đạt 1000–1400 ppm.`;
    if (ph !== null && ph !== undefined && (ph < 5.3 || ph > 6.8))
      return `Thiếu dinh dưỡng — pH=${ph} làm giảm khả năng hấp thu. Điều chỉnh pH về 5.8–6.5 trước.`;
    return "Thiếu dinh dưỡng tổng thể — Thay dung dịch dinh dưỡng mới và kiểm tra EC.";
  }

  // Fallback
  const parts: string[] = [];
  if (topDisease) parts.push(`Phát hiện: ${topDisease}`);
  if (tds    !== null && tds    !== undefined) parts.push(`TDS=${tds} ppm`);
  if (ph     !== null && ph     !== undefined) parts.push(`pH=${ph}`);
  if (temperature !== null && temperature !== undefined) parts.push(`Temp=${temperature}°C`);
  return parts.join(" · ") || "Phát hiện bất thường. Theo dõi và chụp lại sau 12h.";
}
