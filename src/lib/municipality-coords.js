// Approximate center coordinates for major Indian municipalities
// Used to dynamically position the MapLibre map based on selected jurisdiction
export const MUNICIPALITY_COORDS = {
  // Andhra Pradesh
  "Greater Visakhapatnam MC": { lat: 17.6868, lng: 83.2185 },
  "Vijayawada MC": { lat: 16.5062, lng: 80.6480 },
  "Guntur MC": { lat: 16.3067, lng: 80.4365 },
  "Tirupati MC": { lat: 13.6288, lng: 79.4192 },
  // Gujarat
  "Ahmedabad MC": { lat: 23.0225, lng: 72.5714 },
  "Surat MC": { lat: 21.1702, lng: 72.8311 },
  "Vadodara MC": { lat: 22.3072, lng: 73.1812 },
  "Rajkot MC": { lat: 22.3039, lng: 70.8022 },
  "Jamnagar MC": { lat: 22.4707, lng: 70.0577 },
  "Bhavnagar MC": { lat: 21.7645, lng: 72.1519 },
  "Junagadh MC": { lat: 21.5222, lng: 70.4579 },
  "Gandhinagar MC": { lat: 23.2156, lng: 72.6369 },
  // Maharashtra
  "Brihanmumbai MC": { lat: 19.0760, lng: 72.8777 },
  "Pune MC": { lat: 18.5204, lng: 73.8567 },
  "Nagpur MC": { lat: 21.1458, lng: 79.0882 },
  "Thane MC": { lat: 19.2183, lng: 72.9781 },
  "Nashik MC": { lat: 20.0063, lng: 73.7900 },
  "Pimpri-Chinchwad MC": { lat: 18.6298, lng: 73.7997 },
  "Navi Mumbai MC": { lat: 19.0330, lng: 73.0297 },
  "Solapur MC": { lat: 17.6599, lng: 75.9064 },
  "Kolhapur MC": { lat: 16.7050, lng: 74.2433 },
  "Aurangabad (Chhatrapati Sambhajinagar) MC": { lat: 19.8762, lng: 75.3433 },
  // Karnataka
  "Bruhat Bengaluru Mahanagara Palike": { lat: 12.9716, lng: 77.5946 },
  "Mysuru City Corporation": { lat: 12.2958, lng: 76.6394 },
  "Mangaluru City Corporation": { lat: 12.9141, lng: 74.8560 },
  // Tamil Nadu
  "Greater Chennai Corporation": { lat: 13.0827, lng: 80.2707 },
  "Coimbatore Corporation": { lat: 11.0168, lng: 76.9558 },
  "Madurai Corporation": { lat: 9.9252, lng: 78.1198 },
  // Telangana
  "Greater Hyderabad MC": { lat: 17.3850, lng: 78.4867 },
  "Greater Warangal MC": { lat: 17.9784, lng: 79.5941 },
  // Delhi
  "Municipal Corporation of Delhi": { lat: 28.7041, lng: 77.1025 },
  "New Delhi MC": { lat: 28.6139, lng: 77.2090 },
  // Uttar Pradesh
  "Lucknow MC": { lat: 26.8467, lng: 80.9462 },
  "Kanpur MC": { lat: 26.4499, lng: 80.3319 },
  "Ghaziabad MC": { lat: 28.6692, lng: 77.4538 },
  "Agra MC": { lat: 27.1767, lng: 78.0081 },
  "Varanasi MC": { lat: 25.3176, lng: 82.9739 },
  "Noida Authority": { lat: 28.5355, lng: 77.3910 },
  // Rajasthan
  "Jaipur Greater MC": { lat: 26.9124, lng: 75.7873 },
  "Jodhpur North MC": { lat: 26.2389, lng: 73.0243 },
  "Udaipur MC": { lat: 24.5854, lng: 73.7125 },
  // West Bengal
  "Kolkata MC": { lat: 22.5726, lng: 88.3639 },
  "Howrah MC": { lat: 22.5958, lng: 88.2636 },
  // Punjab
  "Ludhiana MC": { lat: 30.9010, lng: 75.8573 },
  "Amritsar MC": { lat: 31.6340, lng: 74.8723 },
  // Kerala
  "Thiruvananthapuram Corporation": { lat: 8.5241, lng: 76.9366 },
  "Kochi Corporation": { lat: 9.9312, lng: 76.2673 },
  // Bihar
  "Patna MC": { lat: 25.6093, lng: 85.1376 },
  // Jharkhand
  "Ranchi MC": { lat: 23.3441, lng: 85.3096 },
  // Odisha
  "Bhubaneswar MC": { lat: 20.2961, lng: 85.8245 },
  // Assam
  "Guwahati MC": { lat: 26.1445, lng: 91.7362 },
  // Chhattisgarh
  "Raipur MC": { lat: 21.2514, lng: 81.6296 },
  // Madhya Pradesh
  "Indore MC": { lat: 22.7196, lng: 75.8577 },
  "Bhopal MC": { lat: 23.2599, lng: 77.4126 },
  // Haryana
  "Gurugram MC": { lat: 28.4595, lng: 77.0266 },
  "Faridabad MC": { lat: 28.4089, lng: 77.3178 },
  // Uttarakhand
  "Dehradun MC": { lat: 30.3165, lng: 78.0322 },
  // Himachal Pradesh
  "Shimla MC": { lat: 31.1048, lng: 77.1734 },
  // Goa
  "Corporation of the City of Panaji": { lat: 15.4909, lng: 73.8278 },
  // Chandigarh
  "Chandigarh MC": { lat: 30.7333, lng: 76.7794 },
  // Puducherry
  "Puducherry Municipality": { lat: 11.9416, lng: 79.8083 },
};

// Default fallback (center of India)
export const DEFAULT_COORDS = { lat: 22.5, lng: 78.5 };

export function getMunicipalityCoords(name) {
  return MUNICIPALITY_COORDS[name] || DEFAULT_COORDS;
}
