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
      if (tds < 600)  notes.push("Low TDS — add nutrients");
      if (tds > 1800) notes.push("High TDS — dilute the solution");
    }
    if (ph !== null && ph !== undefined) {
      if (ph < 5.5) notes.push("pH too low — add KOH to raise pH");
      if (ph > 7.0) notes.push("pH too high — add acid to lower pH");
    }
    if (notes.length > 0) return `Plant looks healthy, but note: ${notes.join("; ")}.`;
    return "Plant is developing normally. No disease detected.";
  }

  // --- Bệnh: kết hợp sensor để suy luận nguyên nhân ---

  if (cls === "yellow_leaf") {
    if (ph !== null && ph !== undefined && ph > 6.8)
      return `Yellow leaf — Suspected iron (Fe) deficiency due to high pH (${ph}). High pH precipitates Fe, reducing uptake.`;
    if (tds !== null && tds !== undefined && tds < 600)
      return `Yellow leaf — TDS is too low (${tds} ppm), indicating overall nutrient deficiency (N, Mg, Fe).`;
    if (temperature !== null && temperature !== undefined && temperature > 30)
      return `Yellow leaf — High temperature (${temperature}°C) causes heat stress and suppresses nutrient uptake.`;
    return "Yellow leaf — Check pH (target 5.8-6.5) and TDS concentration.";
  }

  if (cls === "powdery_mildew") {
    if (humidity !== null && humidity !== undefined && humidity > 75)
      return `Powdery mildew — High humidity (${humidity}%) promotes fungal growth. Increase ventilation immediately.`;
    return "Powdery mildew — Reduce humidity, improve airflow, and spray 1% baking soda solution.";
  }

  if (cls === "brown_spot") {
    if (humidity !== null && humidity !== undefined && humidity > 70)
      return `Brown spot — High humidity (${humidity}%) with temperature ${temperature ?? "?"}°C creates favorable conditions for Cercospora fungus.`;
    return "Brown spot — Suspected fungal infection. Remove affected leaves and improve ventilation.";
  }

  if (cls === "aphid") {
    return `Aphid — Population is ${tds !== null && tds !== undefined && tds > 1400 ? "possibly increased by high TDS" : "low"}. Spray 0.5% neem oil and inspect leaf undersides.`;
  }

  if (cls === "nutrient_deficiency") {
    if (tds !== null && tds !== undefined && tds < 700)
      return `Nutrient deficiency — TDS is only ${tds} ppm (too low). Add A+B nutrient solution to reach 1000-1400 ppm.`;
    if (ph !== null && ph !== undefined && (ph < 5.3 || ph > 6.8))
      return `Nutrient deficiency — pH=${ph} reduces nutrient uptake. Adjust pH to 5.8-6.5 first.`;
    return "Overall nutrient deficiency — replace with fresh nutrient solution and check EC.";
  }

  // Fallback
  const parts: string[] = [];
  if (topDisease) parts.push(`Detected: ${topDisease}`);
  if (tds    !== null && tds    !== undefined) parts.push(`TDS=${tds} ppm`);
  if (ph     !== null && ph     !== undefined) parts.push(`pH=${ph}`);
  if (temperature !== null && temperature !== undefined) parts.push(`Temp=${temperature}°C`);
  return parts.join(" · ") || "Anomaly detected. Monitor and capture another image in 12 hours.";
}
