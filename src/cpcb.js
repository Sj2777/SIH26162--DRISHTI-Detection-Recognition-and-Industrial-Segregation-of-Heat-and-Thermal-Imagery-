/**
 * CPCB Environmental Compensation (EC) Exposure Estimator
 * Tribunal-validated formula (NGT Principal Bench O.A. No. 593/2017):
 * EC = PI × N × R × S × LF
 *
 * Parameters:
 * - PI: Pollution Index (Red = 80, Orange = 50, Green = 30)
 * - N: Number of days of violation (from satellite persistence count)
 * - R: Factor in Rupees recommended by CPCB (Standard base = ₹250 per day)
 * - S: Factor for scale of operation (Large = 1.5, Medium = 1.0, Small = 0.5)
 * - LF: Location factor based on population ( >1M: 1.5, 0.5-1M: 1.25, <0.5M: 1.0)
 */

export function calculateCPCBExposure(inputs) {
  const { pollutionIndex, violationDaysN, rupeeFactorR, scaleFactorS, locationFactorLF } = inputs;
  const total = pollutionIndex * violationDaysN * rupeeFactorR * scaleFactorS * locationFactorLF;
  const daily = pollutionIndex * rupeeFactorR * scaleFactorS * locationFactorLF;

  let priorityLevel = 'LOW';
  if (total > 2000000) priorityLevel = 'CRITICAL_INSPECTION';
  else if (total > 800000) priorityLevel = 'HIGH';
  else if (total > 300000) priorityLevel = 'MODERATE';

  const formattedINR = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(total);

  return {
    totalExposureINR: total,
    formattedINR,
    dailyRateINR: daily,
    priorityLevel,
    legalCaveat:
      'Statutory Disclaimer: This figure represents estimated Environmental Compensation liability for State Pollution Control Board (SPCB) inspection prioritization pursuant to NGT O.A. 593/2017 guidelines. Actual assessment requires physical stack monitoring verification.'
  };
}
