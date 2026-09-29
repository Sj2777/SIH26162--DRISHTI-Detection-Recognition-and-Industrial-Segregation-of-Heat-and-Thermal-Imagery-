// Indian Districts Geo-Database & Boundary Generators
// Provides coordinates, bounding boxes, and GeoJSON polygon outlines for interactive district filtering

export const INDIAN_DISTRICTS = [
  { name: 'Korba', state: 'Chhattisgarh', lat: 22.3595, lon: 82.7501, bounds: [82.20, 22.05, 83.20, 22.75], zoom: 8.8 },
  { name: 'Raigarh', state: 'Chhattisgarh', lat: 21.8974, lon: 83.3950, bounds: [82.90, 21.50, 83.80, 22.30], zoom: 8.8 },
  { name: 'Durg', state: 'Chhattisgarh', lat: 21.1904, lon: 81.2849, bounds: [80.90, 20.80, 81.70, 21.60], zoom: 9.0 },
  { name: 'Singrauli', state: 'Madhya Pradesh', lat: 24.1992, lon: 82.6645, bounds: [82.10, 23.80, 83.30, 24.50], zoom: 8.8 },
  { name: 'Sonbhadra', state: 'Uttar Pradesh', lat: 24.6850, lon: 83.0684, bounds: [82.50, 23.85, 83.55, 24.65], zoom: 8.8 },
  { name: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lon: 86.4304, bounds: [86.00, 23.50, 86.80, 24.10], zoom: 9.0 },
  { name: 'Bokaro', state: 'Jharkhand', lat: 23.6693, lon: 85.9610, bounds: [85.60, 23.40, 86.30, 23.90], zoom: 9.0 },
  { name: 'East Singhbhum (Jamshedpur)', state: 'Jharkhand', lat: 22.8046, lon: 86.2029, bounds: [85.90, 22.40, 86.70, 23.10], zoom: 8.9 },
  { name: 'Angul', state: 'Odisha', lat: 20.8444, lon: 85.1511, bounds: [84.70, 20.50, 85.60, 21.20], zoom: 8.8 },
  { name: 'Jharsuguda', state: 'Odisha', lat: 21.8554, lon: 84.0062, bounds: [83.60, 21.60, 84.40, 22.20], zoom: 9.0 },
  { name: 'Jagatsinghpur (Paradip)', state: 'Odisha', lat: 20.2644, lon: 86.4388, bounds: [86.10, 20.00, 86.80, 20.60], zoom: 9.0 },
  { name: 'Jamnagar', state: 'Gujarat', lat: 22.4707, lon: 70.0577, bounds: [69.40, 22.00, 70.60, 22.90], zoom: 8.8 },
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311, bounds: [72.40, 20.90, 73.30, 21.50], zoom: 9.0 },
  { name: 'Bharuch', state: 'Gujarat', lat: 21.7051, lon: 72.9959, bounds: [72.60, 21.40, 73.40, 22.00], zoom: 9.0 },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812, bounds: [72.90, 22.00, 73.50, 22.60], zoom: 9.0 },
  { name: 'Gautam Buddha Nagar (Noida/Dadri)', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910, bounds: [77.20, 28.20, 77.80, 28.80], zoom: 9.2 },
  { name: 'Bulandshahr', state: 'Uttar Pradesh', lat: 28.4070, lon: 77.8498, bounds: [77.60, 28.10, 78.30, 28.70], zoom: 9.0 },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, bounds: [78.60, 20.70, 79.60, 21.60], zoom: 8.8 },
  { name: 'Chandrapur', state: 'Maharashtra', lat: 19.9615, lon: 79.2961, bounds: [78.80, 19.40, 80.00, 20.50], zoom: 8.7 },
  { name: 'Paschim Bardhaman (Asansol/Durgapur)', state: 'West Bengal', lat: 23.6889, lon: 86.9661, bounds: [86.70, 23.40, 87.50, 23.90], zoom: 9.0 },
  { name: 'Ballari (Toranagallu)', state: 'Karnataka', lat: 15.1394, lon: 76.9214, bounds: [76.50, 14.80, 77.30, 15.50], zoom: 8.9 },
  { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573, bounds: [75.40, 30.60, 76.30, 31.20], zoom: 9.0 },
  { name: 'Sangrur', state: 'Punjab', lat: 30.2458, lon: 75.8421, bounds: [75.50, 29.90, 76.20, 30.60], zoom: 9.0 },
  { name: 'Patiala', state: 'Punjab', lat: 30.3398, lon: 76.3869, bounds: [76.00, 30.00, 76.80, 30.70], zoom: 9.0 },
  { name: 'Firozpur', state: 'Punjab', lat: 30.9237, lon: 74.6065, bounds: [74.30, 30.60, 75.20, 31.30], zoom: 9.0 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, bounds: [82.80, 17.30, 83.50, 18.00], zoom: 9.0 },
  { name: 'Chennai / Tiruvallur', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, bounds: [79.80, 12.80, 80.40, 13.50], zoom: 9.0 },
  { name: 'Purba Medinipur (Haldia)', state: 'West Bengal', lat: 22.0620, lon: 88.0698, bounds: [87.70, 21.80, 88.30, 22.30], zoom: 9.2 }
];

/**
 * Generate a smooth district boundary GeoJSON polygon from its bounding coordinates
 */
export function getDistrictPolygon(district) {
  const b = district.bounds || [
    district.lon - 0.35,
    district.lat - 0.30,
    district.lon + 0.35,
    district.lat + 0.30
  ];

  const minLon = b[0], minLat = b[1], maxLon = b[2], maxLat = b[3];
  const midLon = (minLon + maxLon) / 2;
  const midLat = (minLat + maxLat) / 2;
  const dLon = (maxLon - minLon) * 0.12;
  const dLat = (maxLat - minLat) * 0.12;

  // Realistic natural polygonal boundary with 12 perimeter vertices
  const coordinates = [[
    [minLon + dLon, minLat],
    [midLon, minLat - dLat * 0.4],
    [maxLon - dLon, minLat],
    [maxLon, minLat + dLat],
    [maxLon + dLon * 0.3, midLat],
    [maxLon, maxLat - dLat],
    [maxLon - dLon, maxLat],
    [midLon, maxLat + dLat * 0.4],
    [minLon + dLon, maxLat],
    [minLon, maxLat - dLat],
    [minLon - dLon * 0.3, midLat],
    [minLon, minLat + dLat],
    [minLon + dLon, minLat]
  ]];

  return {
    type: 'Feature',
    properties: {
      name: district.name,
      state: district.state,
      centerLat: district.lat,
      centerLon: district.lon
    },
    geometry: {
      type: 'Polygon',
      coordinates
    }
  };
}
