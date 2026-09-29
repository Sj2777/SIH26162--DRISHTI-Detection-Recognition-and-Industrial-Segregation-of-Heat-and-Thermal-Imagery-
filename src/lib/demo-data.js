















































export const INDUSTRIES = [
{
  id: "sunrise-chemicals",
  name: "Sunrise Chemicals Pvt Ltd",
  category: "Chemicals & solvents",
  ward: "Ward 7 — Riverside Industrial Belt",
  riskScore: 87,
  contact: {
    supervisor: "R. Kulkarni (Site Safety Officer)",
    phone: "+91 98250 41207",
    email: "safety@sunrisechem.in",
    controlRoom: "+91 288 2551 101",
    address: "Plot 42, Riverside Industrial Estate, Ward 7"
  },
  history: [
  { id: "AL-0988", date: "2026-08-14", severity: "CRITICAL", frp: 58.2, outcome: "Verified incident — tanker fire contained", responseMins: 14 },
  { id: "AL-0931", date: "2026-06-02", severity: "WARNING", frp: 12.4, outcome: "Resolved — solvent drum overheating", responseMins: 26 },
  { id: "AL-0877", date: "2026-03-19", severity: "ROUTINE", frp: 3.8, outcome: "Routine flare — scheduled burn-off", responseMins: 5 },
  { id: "AL-0790", date: "2025-11-27", severity: "CRITICAL", frp: 71.0, outcome: "Escalated — fire control room dispatched", responseMins: 11 }]

},
{
  id: "ganga-textiles",
  name: "Ganga Textiles Co.",
  category: "Textile processing",
  ward: "Ward 12 — Textile Cluster",
  riskScore: 54,
  contact: {
    supervisor: "S. Menon (Plant Manager)",
    phone: "+91 99048 77310",
    email: "plant@gangatextiles.co.in",
    controlRoom: "+91 288 2551 220",
    address: "Survey 118, Textile Cluster Road, Ward 12"
  },
  history: [
  { id: "AL-0954", date: "2026-07-08", severity: "WARNING", frp: 9.9, outcome: "False positive — dyeing boiler plume", responseMins: 18 },
  { id: "AL-0842", date: "2026-02-11", severity: "ROUTINE", frp: 4.4, outcome: "Routine flare — boiler start-up", responseMins: 7 },
  { id: "AL-0768", date: "2025-10-05", severity: "WARNING", frp: 15.1, outcome: "Resolved — lint store smouldering", responseMins: 31 }]

},
{
  id: "msw-yard",
  name: "Municipal Solid Waste Site",
  category: "Waste handling",
  ward: "Ward 3 — Old Market Yard",
  riskScore: 68,
  contact: {
    supervisor: "A. Pathan (Yard In-charge)",
    phone: "+91 97129 55044",
    email: "swm.yard@municipality.gov.in",
    controlRoom: "+91 288 2551 333",
    address: "Old Market Yard Dumping Ground, Ward 3"
  },
  history: [
  { id: "AL-0975", date: "2026-08-01", severity: "WARNING", frp: 10.7, outcome: "Resolved — surface waste fire damped", responseMins: 22 },
  { id: "AL-0902", date: "2026-05-23", severity: "CRITICAL", frp: 44.6, outcome: "Verified incident — methane pocket ignition", responseMins: 17 },
  { id: "AL-0813", date: "2026-01-09", severity: "WARNING", frp: 8.2, outcome: "Resolved — open burning by scrap pickers", responseMins: 35 }]

},
{
  id: "coastal-refinery",
  name: "Coastal Petro Refinery Unit 3",
  category: "Petroleum refining",
  ward: "Ward 9 — Port Logistics Zone",
  riskScore: 92,
  contact: {
    supervisor: "V. Deshpande (Shift Superintendent)",
    phone: "+91 90990 12876",
    email: "unit3.control@coastalpetro.in",
    controlRoom: "+91 288 2551 480",
    address: "Refinery Gate 3, Port Logistics Zone, Ward 9"
  },
  history: [
  { id: "AL-0999", date: "2026-09-04", severity: "ROUTINE", frp: 6.1, outcome: "Routine flare — stack flaring declared", responseMins: 4 },
  { id: "AL-0921", date: "2026-05-02", severity: "CRITICAL", frp: 82.3, outcome: "Escalated — unit shutdown, no casualties", responseMins: 9 },
  { id: "AL-0805", date: "2025-12-18", severity: "ROUTINE", frp: 5.5, outcome: "Routine flare — declared maintenance burn", responseMins: 6 }]

}];


export const INITIAL_ALERTS = [
{
  id: "AL-1042",
  location: "Ward 7 — Riverside Industrial Belt",
  facility: "Sunrise Chemicals Pvt Ltd",
  industryId: "sunrise-chemicals",
  time: "14:12 IST",
  severity: "CRITICAL",
  priority: "High",
  classification: "Industrial",
  landCover: "Urban Industrial",
  assignedOfficer: null,
  status: "New",
  frp: 64.8,
  confidence: 94,
  position: "left-[49%] top-[43%]",
  source: "VIIRS · SNPP",
  detectionTime: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 mins ago
},
{
  id: "AL-1041",
  location: "Ward 3 — Old Market Yard",
  facility: "Municipal Solid Waste Site",
  industryId: "msw-yard",
  time: "13:40 IST",
  severity: "WARNING",
  priority: "Medium",
  classification: "Waste/Dump",
  landCover: "Open ground",
  assignedOfficer: "R. Sharma",
  status: "Under verification",
  frp: 9.2,
  confidence: 82,
  position: "left-[23%] top-[66%]",
  source: "NOAA-20",
  detectionTime: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 mins ago
},
{
  id: "AL-1039",
  location: "Ward 12 — Textile Cluster",
  facility: "Ganga Textiles Co.",
  industryId: "ganga-textiles",
  time: "11:05 IST",
  severity: "ROUTINE",
  priority: "Low",
  classification: "Industrial",
  landCover: "Urban Industrial",
  assignedOfficer: null,
  status: "Resolved",
  frp: 4.1,
  confidence: 76,
  position: "left-[72%] top-[28%]",
  source: "SEVIRI",
  detectionTime: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3 hrs ago
}];


export const INCOMING_ALERTS = [
{
  id: "AL-1043",
  location: "Ward 9 — Port Logistics Zone",
  facility: "Coastal Petro Refinery Unit 3",
  industryId: "coastal-refinery",
  time: "14:26 IST",
  severity: "CRITICAL",
  priority: "High",
  classification: "Industrial",
  landCover: "Industrial Port",
  assignedOfficer: null,
  status: "New",
  frp: 77.4,
  confidence: 91,
  position: "left-[62%] top-[62%]",
  source: "VIIRS · NOAA-21",
  detectionTime: new Date().toISOString()
}];


export const MONTHLY_ALERTS = [
{ month: "Apr", critical: 3, warning: 6, routine: 9 },
{ month: "May", critical: 5, warning: 4, routine: 11 },
{ month: "Jun", critical: 2, warning: 8, routine: 7 },
{ month: "Jul", critical: 4, warning: 5, routine: 12 },
{ month: "Aug", critical: 6, warning: 7, routine: 10 },
{ month: "Sep", critical: 3, warning: 3, routine: 8 }];


export const RESPONSE_TREND = [
{ month: "Apr", minutes: 24 },
{ month: "May", minutes: 21 },
{ month: "Jun", minutes: 19 },
{ month: "Jul", minutes: 17 },
{ month: "Aug", minutes: 15 },
{ month: "Sep", minutes: 13 }];


export function industryById(id) {
  return INDUSTRIES.find((industry) => industry.id === id);
}