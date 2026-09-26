/**
 * FRP-based Emissions Estimation Service
 * Wooster et al. (2005) & Seiler-Crutzen Fire Radiative Energy formulas:
 * Fuel Burned Rate (kg/s) = FRP (MW) × C_smoke (≈ 0.368 kg/MJ)
 */

export function estimateEmissionsFromFRP(frpMw, isIndustrialHydrocarbon = true) {
  const fuelBurnedKgPerHour = frpMw * 0.368 * 3600;

  const efCO2 = isIndustrialHydrocarbon ? 2.75 : 1.58;
  const efCH4 = isIndustrialHydrocarbon ? 0.035 : 0.018;

  const co2EmissionsKgPerHour = fuelBurnedKgPerHour * efCO2;
  const ch4EmissionsKgPerHour = fuelBurnedKgPerHour * efCH4;

  const carbonDioxideTonsPerDay = (co2EmissionsKgPerHour * 24) / 1000;
  const methaneTonsPerDay = (ch4EmissionsKgPerHour * 24) / 1000;

  return {
    fuelBurnedKgPerHour: Math.round(fuelBurnedKgPerHour),
    co2EmissionsKgPerHour: Math.round(co2EmissionsKgPerHour),
    ch4EmissionsKgPerHour: Math.round(ch4EmissionsKgPerHour * 10) / 10,
    carbonDioxideTonsPerDay: Math.round(carbonDioxideTonsPerDay * 10) / 10,
    methaneTonsPerDay: Math.round(methaneTonsPerDay * 100) / 100,
    confidenceMarginPct: 8.5
  };
}
