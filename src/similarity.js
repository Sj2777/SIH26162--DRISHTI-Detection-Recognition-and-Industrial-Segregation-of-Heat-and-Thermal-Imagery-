import { MOCK_PAST_INCIDENTS } from './data.js';

/**
 * Computes multi-dimensional vector cosine similarity
 * between the active anomaly and 12 benchmark historical industrial disasters
 */
export function calculateIncidentSimilarity(current, benchmarks = MOCK_PAST_INCIDENTS) {
  const currentVec = [
    Math.min(current.frpMw / 150, 1.0),
    Math.min(current.tempK / 2000, 1.0),
    Math.min(current.pressureBar / 15, 1.0)
  ];

  return benchmarks
    .map((hist) => {
      const histVec = [
        Math.min(hist.peak_frp_mw / 150, 1.0),
        Math.min(hist.temperature_k / 2000, 1.0),
        Math.min(hist.pressure_spike_bar / 15, 1.0)
      ];

      let dot = 0;
      let magA = 0;
      let magB = 0;
      for (let i = 0; i < currentVec.length; i++) {
        dot += currentVec[i] * histVec[i];
        magA += currentVec[i] * currentVec[i];
        magB += histVec[i] * histVec[i];
      }

      const cosine = dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);

      let typeBonus = 0;
      if (
        hist.facility_type.toLowerCase().includes('refinery') &&
        current.facilityType.toLowerCase().includes('refinery')
      ) {
        typeBonus = 0.08;
      } else if (
        hist.facility_type.toLowerCase().includes('power') &&
        current.facilityType.toLowerCase().includes('power')
      ) {
        typeBonus = 0.08;
      }

      const score = Math.min(Math.round((cosine * 0.92 + typeBonus) * 1000) / 10, 99.4);

      return {
        ...hist,
        similarity_score: score
      };
    })
    .sort((a, b) => b.similarity_score - a.similarity_score);
}
