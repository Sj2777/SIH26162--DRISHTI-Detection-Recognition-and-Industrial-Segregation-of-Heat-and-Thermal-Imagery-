/**
 * AGNI-VISION DATA REPOSITORY
 * Realistic Indian Geospatial, NASA FIRMS VIIRS, OSM Industrial Infrastructure,
 * Historical Baselines, and Benchmark Incident Records
 */

export const MOCK_FACILITIES = [
  {
    id: 'FAC-JAM-01',
    name: 'Reliance Jamnagar Mega-Refinery Complex',
    type: 'refinery',
    operator: 'Reliance Industries Limited (RIL)',
    state: 'Gujarat',
    district: 'Jamnagar',
    lat: 22.3528,
    lon: 69.8452,
    boundary: [
      [22.3680, 69.8300],
      [22.3695, 69.8650],
      [22.3380, 69.8680],
      [22.3360, 69.8320],
      [22.3680, 69.8300]
    ],
    osm_tags: {
      industrial: 'oil_refinery',
      man_made: 'flare_stack',
      landuse: 'industrial',
      operator: 'Reliance Industries Ltd'
    },
    baseline_frp_mw: 14.2,
    current_frp_mw: 64.8,
    flaring_deviation_ratio: 4.56,
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 1,
    contact_officer: 'S. K. Singhania (VP Safety & Emergency)',
    phone: '+91 288 661 2400',
    downwind_population_1km: 14200,
    sub_units: [
      { id: 'U-CDU-1', name: 'Atmospheric Crude Distillation Unit 1', lat: 22.3565, lon: 69.8420, type: 'Crude Distillation', status: 'NORMAL' },
      { id: 'U-FCCU', name: 'Fluid Catalytic Cracker Unit (FCCU)', lat: 22.3510, lon: 69.8475, type: 'Secondary Cracking', status: 'NORMAL' },
      { id: 'U-FLARE-ACID', name: 'Acid Gas Flare Header Stack #3', lat: 22.3528, lon: 69.8452, type: 'High-Pressure Flare', status: 'CRITICAL' },
      { id: 'U-FLARE-MAR', name: 'Marine Terminal Elevated Flare Alpha', lat: 22.3640, lon: 69.8380, type: 'Marine Vent Flare', status: 'NORMAL' },
      { id: 'U-TANKS', name: 'Crude Oil Storage Terminal Tank Farm', lat: 22.3420, lon: 69.8550, type: 'Hydrocarbon Storage', status: 'NORMAL' },
      { id: 'U-POLY', name: 'Polypropylene Polyethylene Polymer Plant', lat: 22.3460, lon: 69.8350, type: 'Petrochemical Process', status: 'WARNING' }
    ]
  },
  {
    id: 'FAC-DAD-02',
    name: 'NTPC Dadri Super Thermal Power Station',
    type: 'thermal_power',
    operator: 'National Thermal Power Corporation (NTPC)',
    state: 'Uttar Pradesh',
    district: 'Gautam Buddha Nagar',
    lat: 28.5995,
    lon: 77.6080,
    boundary: [
      [28.6090, 77.5980],
      [28.6110, 77.6200],
      [28.5880, 77.6220],
      [28.5860, 77.6000],
      [28.6090, 77.5980]
    ],
    osm_tags: {
      industrial: 'power_station',
      man_made: 'cooling_tower',
      landuse: 'industrial',
      operator: 'NTPC Ltd'
    },
    wri_power_id: 'WRI1000184',
    fuel_type: 'Coal & Combined Cycle Gas',
    capacity_mw: 2637,
    baseline_frp_mw: 28.4,
    current_frp_mw: 31.2,
    flaring_deviation_ratio: 1.10,
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'Er. Rajeshwar Verma (Chief Plant Mgr)',
    phone: '+91 120 267 1140',
    downwind_population_1km: 26800,
    sub_units: [
      { id: 'U-BLR-1', name: 'Coal Boiler Unit 1 & 2', lat: 28.6010, lon: 77.6090, type: 'Supercritical Boiler', status: 'NORMAL' },
      { id: 'U-COOL-A', name: 'Hyperbolic Cooling Tower A', lat: 28.5970, lon: 77.6040, type: 'Cooling Tower', status: 'NORMAL' },
      { id: 'U-ASH-DYKE', name: 'Dadri Fly Ash Dyke Pond', lat: 28.5920, lon: 77.6180, type: 'Ash Slurry Yard', status: 'NORMAL' },
      { id: 'U-PERIPH-DUMP', name: 'Peripheral Buffer Yard & Stubble Depot', lat: 28.6080, lon: 77.6190, type: 'Open Storage Yard', status: 'NORMAL' }
    ]
  },
  {
    id: 'FAC-TAT-03',
    name: 'Tata Steel Jamshedpur Works',
    type: 'steel_plant',
    operator: 'Tata Steel Limited',
    state: 'Jharkhand',
    district: 'East Singhbhum',
    lat: 22.8046,
    lon: 86.2029,
    boundary: [
      [22.8150, 86.1920],
      [22.8180, 86.2160],
      [22.7950, 86.2180],
      [22.7920, 86.1950],
      [22.8150, 86.1920]
    ],
    osm_tags: {
      industrial: 'steel_mill',
      man_made: 'blast_furnace',
      landuse: 'industrial',
      operator: 'Tata Steel'
    },
    baseline_frp_mw: 42.0,
    current_frp_mw: 44.5,
    flaring_deviation_ratio: 1.06,
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'Anirban Mukherjee (GM Safety)',
    phone: '+91 657 242 5811',
    downwind_population_1km: 51200
  },
  {
    id: 'FAC-PAR-04',
    name: 'IOCL Paradip Coastal Refinery & Petrochemical',
    type: 'refinery',
    operator: 'Indian Oil Corporation Ltd (IOCL)',
    state: 'Odisha',
    district: 'Jagatsinghpur',
    lat: 20.2825,
    lon: 86.6698,
    boundary: [
      [20.2950, 86.6550],
      [20.2980, 86.6850],
      [20.2700, 86.6880],
      [20.2680, 86.6580],
      [20.2950, 86.6550]
    ],
    osm_tags: {
      industrial: 'oil_refinery',
      man_made: 'coker_flare',
      landuse: 'industrial',
      operator: 'Indian Oil'
    },
    baseline_frp_mw: 19.8,
    current_frp_mw: 24.1,
    flaring_deviation_ratio: 1.22,
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'Debabrata Das (DGM Operations)',
    phone: '+91 672 225 5000',
    downwind_population_1km: 8400
  },
  {
    id: 'FAC-SIN-05',
    name: 'Singrauli - Vindhyachal Super Thermal Complex',
    type: 'thermal_power',
    operator: 'NTPC Ltd',
    state: 'Madhya Pradesh',
    district: 'Singrauli',
    lat: 24.1025,
    lon: 82.6685,
    boundary: [
      [24.1200, 82.6500],
      [24.1220, 82.6850],
      [24.0880, 82.6880],
      [24.0850, 82.6520],
      [24.1200, 82.6500]
    ],
    osm_tags: {
      industrial: 'power_station',
      landuse: 'industrial'
    },
    wri_power_id: 'WRI1000210',
    fuel_type: 'Coal',
    capacity_mw: 4760,
    baseline_frp_mw: 52.0,
    current_frp_mw: 55.4,
    flaring_deviation_ratio: 1.07,
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'R. K. Tiwari (Chief Engineer)',
    phone: '+91 780 524 5011',
    downwind_population_1km: 18900
  },
  {
    id: 'FAC-KOR-06',
    name: 'Korba BALCO Smelter & Captive Power Plant',
    type: 'steel_plant',
    operator: 'Bharat Aluminium Company Ltd (Vedanta)',
    state: 'Chhattisgarh',
    district: 'Korba',
    lat: 22.3850,
    lon: 82.7480,
    boundary: [
      [22.3980, 82.7350],
      [22.4000, 82.7620],
      [22.3720, 82.7650],
      [22.3700, 82.7380],
      [22.3980, 82.7350]
    ],
    osm_tags: {
      industrial: 'aluminium_smelter',
      landuse: 'industrial'
    },
    baseline_frp_mw: 38.5,
    current_frp_mw: 41.2,
    flaring_deviation_ratio: 1.07,
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'Sanjay Chawla',
    phone: '+91 775 924 1000',
    downwind_population_1km: 22100
  },
  {
    id: 'FAC-JSW-VIJ-01',
    name: 'JSW Steel Vijayanagar Integrated Works',
    type: 'steel_plant',
    operator: 'JSW Steel Limited (Jindal Group)',
    state: 'Karnataka',
    district: 'Ballari (Toranagallu)',
    lat: 15.1681,
    lon: 76.6706,
    boundary: [
      [15.1950, 76.6400],
      [15.1950, 76.7050],
      [15.1380, 76.7050],
      [15.1380, 76.6400],
      [15.1950, 76.6400]
    ],
    osm_tags: {
      industrial: 'steel_mill',
      man_made: 'chimney',
      power: 'generator',
      landuse: 'industrial',
      operator: 'JSW Steel Limited'
    },
    baseline_frp_mw: 48.0,
    current_frp_mw: 52.4,
    flaring_deviation_ratio: 1.09,
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'Rajesh Nair (VP Environment & Safety)',
    phone: '+91 839 525 0120',
    downwind_population_1km: 18500,
    sub_units: [
      { id: 'U-JSW-BF', name: 'Blast Furnace #1-4 & Corex Units', lat: 15.1690, lon: 76.6690, type: 'Blast Furnace', status: 'NORMAL' },
      { id: 'U-JSW-PWR', name: 'Vijayanagar Toranagallu Captive Power Plant (860 MW)', lat: 15.1740, lon: 76.6650, type: 'Thermal Power', status: 'NORMAL' },
      { id: 'U-JSW-PELLET', name: 'Pellet & Sintering Plant Header', lat: 15.1620, lon: 76.6740, type: 'Pellet Plant', status: 'NORMAL' },
      { id: 'U-JSW-SLAG', name: 'Slag Yard & Metal Recovery Facility', lat: 15.1580, lon: 76.6780, type: 'Slag Processing', status: 'NORMAL' }
    ]
  },
  {
    id: 'FAC-SAIL-IISCO-01',
    name: 'SAIL IISCO Steel Plant Burnpur (Asansol)',
    type: 'steel_plant',
    operator: 'Steel Authority of India Limited (SAIL)',
    state: 'West Bengal',
    district: 'Paschim Bardhaman (Asansol)',
    lat: 23.6634,
    lon: 86.9190,
    boundary: [
      [23.6850, 86.9000],
      [23.6850, 86.9400],
      [23.6400, 86.9400],
      [23.6400, 86.9000],
      [23.6850, 86.9000]
    ],
    osm_tags: {
      industrial: 'steel_mill',
      man_made: 'blast_furnace',
      landuse: 'industrial',
      operator: 'SAIL'
    },
    baseline_frp_mw: 36.0,
    current_frp_mw: 38.2,
    flaring_deviation_ratio: 1.06,
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'S. K. Ganguly (GM Operations)',
    phone: '+91 341 224 0200',
    downwind_population_1km: 34200
  },
  {
    id: 'FAC-SAIL-BHI-01',
    name: 'SAIL Bhilai Steel Plant (BSP)',
    type: 'steel_plant',
    operator: 'Steel Authority of India Limited (SAIL)',
    state: 'Chhattisgarh',
    district: 'Durg',
    lat: 21.1820,
    lon: 81.3910,
    boundary: [
      [21.2050, 81.3700],
      [21.2050, 81.4200],
      [21.1600, 81.4200],
      [21.1600, 81.3700],
      [21.2050, 81.3700]
    ],
    osm_tags: {
      industrial: 'steel_mill',
      landuse: 'industrial',
      operator: 'SAIL'
    },
    baseline_frp_mw: 54.0,
    current_frp_mw: 58.1,
    flaring_deviation_ratio: 1.07,
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'P. K. Sen (ED Safety)',
    phone: '+91 788 222 2200',
    downwind_population_1km: 42000
  },
  {
    id: 'FAC-SAIL-BOK-01',
    name: 'SAIL Bokaro Steel Plant (BSL)',
    type: 'steel_plant',
    operator: 'Steel Authority of India Limited (SAIL)',
    state: 'Jharkhand',
    district: 'Bokaro',
    lat: 23.6700,
    lon: 86.1550,
    boundary: [
      [23.6900, 86.1300],
      [23.6900, 86.1800],
      [23.6500, 86.1800],
      [23.6500, 86.1300],
      [23.6900, 86.1300]
    ],
    osm_tags: {
      industrial: 'steel_mill',
      landuse: 'industrial',
      operator: 'SAIL'
    },
    baseline_frp_mw: 44.0,
    current_frp_mw: 46.2,
    flaring_deviation_ratio: 1.05,
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'M. K. Sharma (Chief GM)',
    phone: '+91 654 224 0100',
    downwind_population_1km: 29800
  },
  {
    id: 'FAC-UNREG-07',
    name: 'Bulandshahr Unregistered Fixed-Chimney Brick Kiln Belt #14',
    type: 'illegal_brick_kiln',
    operator: 'Unknown / Non-registered Entity (Unlawful Operation)',
    state: 'Uttar Pradesh',
    district: 'Bulandshahr',
    lat: 28.4082,
    lon: 77.8540,
    boundary: [
      [28.4150, 77.8480],
      [28.4160, 77.8600],
      [28.4010, 77.8610],
      [28.4000, 77.8490],
      [28.4150, 77.8480]
    ],
    osm_tags: {
      landuse: 'farmland'
    },
    baseline_frp_mw: 0.0,
    current_frp_mw: 19.4,
    flaring_deviation_ratio: 99.0,
    registered: false,
    cpcb_category: 'Unregistered',
    active_incidents: 1,
    contact_officer: 'Bulandshahr Regional Officer UPPCB (Inspection Priority)',
    phone: '+91 573 228 1900',
    downwind_population_1km: 9800
  },
  {
    id: 'FAC-MINE-WCL-01',
    name: 'Inder Coal Mine (Kamptee Area)',
    type: 'mine',
    operator: 'Western Coalfields Limited (Coal India Ltd)',
    state: 'Maharashtra',
    district: 'Nagpur',
    lat: 21.2450,
    lon: 79.2150,
    boundary: [
      [21.257, 79.203],
      [21.257, 79.227],
      [21.233, 79.227],
      [21.233, 79.203],
      [21.257, 79.203]
    ],
    osm_tags: { landuse: 'quarry', industrial: 'mine', resource: 'coal', operator: 'Western Coalfields Limited', cpcb_category: 'Red' },
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 1,
    contact_officer: 'WCL Kamptee Area General Manager',
    phone: '+91 7109 282 201',
    downwind_population_1km: 1200
  },
  {
    id: 'FAC-MINE-WCL-02',
    name: 'Kamptee Colliery Open-Cast Mine',
    type: 'mine',
    operator: 'Western Coalfields Limited (Coal India Ltd)',
    state: 'Maharashtra',
    district: 'Nagpur',
    lat: 21.2380,
    lon: 79.2080,
    boundary: [
      [21.250, 79.196],
      [21.250, 79.220],
      [21.226, 79.220],
      [21.226, 79.196],
      [21.250, 79.196]
    ],
    osm_tags: { landuse: 'quarry', industrial: 'mine', resource: 'coal', operator: 'Western Coalfields Limited', cpcb_category: 'Red' },
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'WCL Safety Officer',
    phone: '+91 7109 282 205',
    downwind_population_1km: 2400
  },
  {
    id: 'FAC-MINE-WCL-03',
    name: 'Gondegaon Open-Cast Coal Mine',
    type: 'mine',
    operator: 'Western Coalfields Limited (Coal India Ltd)',
    state: 'Maharashtra',
    district: 'Nagpur',
    lat: 21.2580,
    lon: 79.2050,
    osm_tags: { landuse: 'quarry', industrial: 'mine', resource: 'coal', operator: 'Western Coalfields Limited', cpcb_category: 'Red' },
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'WCL Sub-Area Manager',
    phone: '+91 7109 282 210',
    downwind_population_1km: 800
  },
  {
    id: 'FAC-MINE-WCL-05',
    name: 'Umrer Open-Cast Coal Mine',
    type: 'mine',
    operator: 'Western Coalfields Limited (Coal India Ltd)',
    state: 'Maharashtra',
    district: 'Nagpur',
    lat: 20.8450,
    lon: 79.3250,
    osm_tags: { landuse: 'quarry', industrial: 'mine', resource: 'coal', operator: 'Western Coalfields Limited', cpcb_category: 'Red' },
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'WCL Umrer Area Manager',
    phone: '+91 7116 244 321',
    downwind_population_1km: 1500
  },
  {
    id: 'FAC-MINE-WCL-06',
    name: 'Durgapur Open-Cast Mine Chandrapur',
    type: 'mine',
    operator: 'Western Coalfields Limited (Coal India Ltd)',
    state: 'Maharashtra',
    district: 'Chandrapur',
    lat: 19.9950,
    lon: 79.2980,
    osm_tags: { landuse: 'quarry', industrial: 'mine', resource: 'coal', operator: 'Western Coalfields Limited', cpcb_category: 'Red' },
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'WCL Chandrapur CGMT',
    phone: '+91 7172 250 110',
    downwind_population_1km: 3200
  },
  {
    id: 'FAC-MINE-SECL-01',
    name: 'Gevra Mega Open-Cast Coal Mine (Korba)',
    type: 'mine',
    operator: 'South Eastern Coalfields Limited (Coal India Ltd)',
    state: 'Chhattisgarh',
    district: 'Korba',
    lat: 22.3450,
    lon: 82.5950,
    osm_tags: { landuse: 'quarry', industrial: 'mine', resource: 'coal', operator: 'SECL', cpcb_category: 'Red' },
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'SECL Gevra Project Officer',
    phone: '+91 7759 275 000',
    downwind_population_1km: 4500
  },
  {
    id: 'FAC-MINE-BCCL-01',
    name: 'Kusunda Coal Mine (Jharia Coalfield)',
    type: 'mine',
    operator: 'Bharat Coking Coal Limited (Coal India Ltd)',
    state: 'Jharkhand',
    district: 'Dhanbad',
    lat: 23.7750,
    lon: 86.4150,
    osm_tags: { landuse: 'quarry', industrial: 'mine', resource: 'coal', operator: 'BCCL', cpcb_category: 'Red' },
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'BCCL Kusunda Area GM',
    phone: '+91 326 220 2000',
    downwind_population_1km: 18000
  },
  {
    id: 'FAC-MINE-NCL-01',
    name: 'Jayant Open-Cast Coal Mine (Singrauli)',
    type: 'mine',
    operator: 'Northern Coalfields Limited (Coal India Ltd)',
    state: 'Madhya Pradesh',
    district: 'Singrauli',
    lat: 24.1250,
    lon: 82.6450,
    osm_tags: { landuse: 'quarry', industrial: 'mine', resource: 'coal', operator: 'NCL', cpcb_category: 'Red' },
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'NCL Jayant Project General Manager',
    phone: '+91 7805 266 220',
    downwind_population_1km: 6200
  },
  {
    id: 'FAC-MINE-MCL-01',
    name: 'Bhubaneswari Open-Cast Mine (Talcher)',
    type: 'mine',
    operator: 'Mahanadi Coalfields Limited (Coal India Ltd)',
    state: 'Odisha',
    district: 'Angul',
    lat: 20.9650,
    lon: 85.1750,
    osm_tags: { landuse: 'quarry', industrial: 'mine', resource: 'coal', operator: 'MCL', cpcb_category: 'Red' },
    registered: true,
    cpcb_category: 'Red',
    active_incidents: 0,
    contact_officer: 'MCL Bhubaneswari OCP Manager',
    phone: '+91 6760 268 000',
    downwind_population_1km: 3800
  }
];

export const MOCK_HOTSPOTS = [];

export function createIncidentFromHotspot(h) {
  if (!h) {
    return {
      id: 'INC-STANDBY',
      facility_id: 'FAC-STANDBY',
      facility_name: 'Live Satellite Constellation (India)',
      hotspot_id: 'N/A',
      title: 'Awaiting Satellite Target Selection',
      timestamp: new Date().toISOString(),
      severity: 'TIER_1_ROUTINE_MONITORING',
      status: 'MONITORING',
      viirs_pass: 'NASA VIIRS & INSAT-3DR Rapid Scan Active',
      lat: 22.5,
      lon: 78.5,
      frp_mw: 0,
      baseline_frp_mw: 10,
      z_score: 0,
      wind_bearing: 245,
      wind_speed_kmh: 18.5,
      downwind_hazard_radius_km: 1.0,
      population_at_risk: 0,
      recommended_agent: 'Autonomous Continuous Satellite Surveillance',
      auto_brief: 'Scanning live constellation passes (VIIRS NOAA-20, Suomi-NPP, Sentinel-3 SLSTR, INSAT-3DR) across India...',
      escalation_timer_sec: 180,
      is_silence_escalated: false,
      public_broadcast_authorized: false,
      two_way_chat: [],
      cpcb_exposure: { pi: 80, days_n: 1, r_factor: 250, s_scale: 1.5, lf_location: 1.25, total_ec_inr: 0 }
    };
  }

  const lat = Number(h.latitude) || 22.5;
  const lon = Number(h.longitude) || 78.5;
  const frp = Number(h.frp) || 25;
  const sat = h.satellite || 'NASA VIIRS';
  const place = h.facility_name || (h.context_dossier?.landCover?.class ? `${h.context_dossier.landCover.class} Zone` : `${h.region || 'India'} Hotspot`);
  const pop = h.context_dossier?.population?.density_km2 
    ? Math.round(h.context_dossier.population.density_km2 * 8) 
    : Math.round(frp * 180);

  const baselineFrp = h.facility_id ? 14.2 : 8.0;
  const ratio = (frp / baselineFrp).toFixed(1);
  const zScore = ((frp - baselineFrp) / 10.0).toFixed(2);
  const tempK = h.vnf_temp_k || Math.round((h.brightness || 320) * 3.8);

  const timeStr = h.acq_time ? `${h.acq_time} UTC` : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
  const dateStr = h.acq_date || new Date().toISOString().split('T')[0];

  return {
    id: `INC-${dateStr.replace(/-/g, '')}-${h.id ? h.id.slice(-4) : '01'}`,
    facility_id: h.facility_id || 'FAC-LIVE-01',
    facility_name: place,
    hotspot_id: h.id || 'LIVE-FIRE-01',
    title: `${h.fire_type ? h.fire_type.replace(/_/g, ' ') : 'THERMAL ANOMALY'}: High-Intensity Radiance Surge at ${place}`,
    timestamp: `${dateStr}T${h.acq_time ? h.acq_time.slice(0, 2) + ':' + h.acq_time.slice(2, 4) : '12:00'}:00+05:30`,
    severity: frp >= 40 ? 'TIER_3_CRITICAL_INCIDENT' : frp >= 20 ? 'TIER_2_MODERATE_INCIDENT' : 'TIER_1_ROUTINE_MONITORING',
    status: 'INVESTIGATING',
    viirs_pass: `${sat} (${dateStr} ${timeStr})`,
    lat: lat,
    lon: lon,
    frp_mw: frp,
    baseline_frp_mw: baselineFrp,
    z_score: Number(zScore),
    wind_bearing: 245,
    wind_speed_kmh: 18.5,
    downwind_hazard_radius_km: Number((Math.min(frp * 0.05, 5.0)).toFixed(1)),
    population_at_risk: pop,
    recommended_agent: frp >= 40 
      ? 'AFFF High-Expansion Foam & Nitrogen Inerting Curtain'
      : 'Water Fog Curtains & Perimeter Firebreak Trenching',
    auto_brief: `SITUATION REPORT (SITREP) - SATELLITE DISASTER INTELLIGENCE
• Location: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E | ${h.region || 'India'}
• Target Area: ${place}
• Detection Sensor: ${sat} (Pass time: ${timeStr} on ${dateStr})
• Observed FRP: ${frp} MW (${ratio}x regional baseline | Z-Score: +${zScore}σ)
• Planck Temperature: ${tempK} K
• Land Cover: ${h.context_dossier?.landCover?.class || 'Sensing via ESA WorldCover 10m'}
• Population Density: ${h.context_dossier?.population?.density_km2 ? `${h.context_dossier.population.density_km2} / km² (Census of India / GHSL)` : 'Assessing spatial census...'}
• Suggested Mitigation: Deploy district emergency response squad; maintain downwind exclusion perimeter.`,
    escalation_timer_sec: 180,
    is_silence_escalated: false,
    public_broadcast_authorized: false,
    two_way_chat: [
      { 
        sender: 'SYSTEM', 
        text: `AUTOMATED ALERT: Thermal radiance of ${frp} MW detected by ${sat} at [${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E]. Escalation timer started (180s).`, 
        time: timeStr 
      },
      { 
        sender: 'SYSTEM', 
        text: `Transmitted coordinates to Regional Emergency Operations Centre (REOC) & State Pollution Control Board.`, 
        time: timeStr 
      }
    ],
    cpcb_exposure: {
      pi: 80,
      days_n: 14,
      r_factor: 250,
      s_scale: 1.5,
      lf_location: 1.25,
      total_ec_inr: Math.round(80 * 14 * 250 * 1.5 * 1.25)
    }
  };
}

export const MOCK_ACTIVE_INCIDENT = createIncidentFromHotspot(null);

export const MOCK_PAST_INCIDENTS = [
  {
    id: 'HIST-01',
    title: 'LG Polymers Toxic Styrene Gas Leak & Thermal Runaway',
    year: 2020,
    facility_type: 'Polymer / Chemical Plant',
    location: 'Visakhapatnam, Andhra Pradesh',
    peak_frp_mw: 22.4,
    temperature_k: 460,
    pressure_spike_bar: 3.2,
    duration_hrs: 18,
    direct_cause: 'Autopolymerization thermal runaway in unchilled styrene monomer storage tank due to lockdown stagnation.',
    similarity_score: 88.4,
    key_sops: ['Inject 4-tert-butylcatechol (TBC) polymerization inhibitor', 'Evacuate 3km downwind radius immediately', 'Continuous water spraying on shell walls']
  },
  {
    id: 'HIST-02',
    title: 'HPCL Visakh Refinery Cooling Tower & Flare Line Fire',
    year: 2013,
    facility_type: 'Petroleum Refinery',
    location: 'Visakhapatnam, Andhra Pradesh',
    peak_frp_mw: 78.5,
    temperature_k: 1680,
    pressure_spike_bar: 4.8,
    duration_hrs: 36,
    direct_cause: 'Hydrocarbon vapor leak from newly commissioned pipeline header during welding work near cooling tower.',
    similarity_score: 93.6,
    key_sops: ['Isolate header fuel feed blocks Alpha and Beta', 'Deploy Medium Expansion Foam monitors', 'Establish water curtains around adjacent FCCU columns']
  },
  {
    id: 'HIST-03',
    title: 'OIL Baghjan 5 Uncontrolled Gas & Condensate Blowout Fire',
    year: 2020,
    facility_type: 'Oil & Gas Production Well',
    location: 'Tinsukia, Assam',
    peak_frp_mw: 114.0,
    temperature_k: 1820,
    pressure_spike_bar: 18.0,
    duration_hrs: 2640,
    direct_cause: 'Casing head blowout preventer failure during workover operations triggering sustained 170-day fire.',
    similarity_score: 81.2,
    key_sops: ['High-discharge water capping umbrella deployment', 'Relief well drilling to intersect casing bottom', 'Biodiversity acoustic and toxic plume monitoring']
  },
  {
    id: 'HIST-04',
    title: 'IOCL Jaipur Terminal Tank Farm Multi-Storage Fire',
    year: 2009,
    facility_type: 'Hydrocarbon Storage Terminal',
    location: 'Sitapura Industrial Area, Jaipur',
    peak_frp_mw: 185.0,
    temperature_k: 1750,
    pressure_spike_bar: 5.5,
    duration_hrs: 168,
    direct_cause: 'Hammer-blind valve leakage during pipeline transfer creating massive ground-hugging gasoline vapor cloud.',
    similarity_score: 84.7,
    key_sops: ['Total cordon of 5km perimeter', 'Controlled burn-out protocol when foam blankets cannot reach liquid surface', 'Thermal radiation barrier screens on surrounding civil infrastructure']
  },
  {
    id: 'HIST-05',
    title: 'BP Texas City Refinery ISOM Unit Hydrocarbon Overfilling',
    year: 2005,
    facility_type: 'Petroleum Refinery',
    location: 'Texas City, USA',
    peak_frp_mw: 92.0,
    temperature_k: 1620,
    pressure_spike_bar: 4.2,
    duration_hrs: 12,
    direct_cause: 'Raffinate splitter tower overfilled, relieving liquid hydrocarbons through atmospheric blowdown drum stack.',
    similarity_score: 91.2,
    key_sops: ['Upgrade blowdown drums to closed flare systems', 'Emergency evacuation of all temporary trailers in 500m radius', 'Automated high-level shutoff overrides']
  },
  {
    id: 'HIST-06',
    title: 'NTPC Unchahar Boiler Flue Gas Duct Pressure Surge Explosion',
    year: 2017,
    facility_type: 'Thermal Power Plant',
    location: 'Rae Bareli, Uttar Pradesh',
    peak_frp_mw: 48.0,
    temperature_k: 1180,
    pressure_spike_bar: 2.9,
    duration_hrs: 8,
    direct_cause: 'Clinker blockage in bottom ash hopper caused pressure surge in economizer flue duct, releasing hot flue gases.',
    similarity_score: 76.5,
    key_sops: ['Furnace draft pressure trip interlock verification', 'Immediate boiler trip (MFT)', 'Depressurize boiler drum and stop coal pulverizers']
  },
  {
    id: 'HIST-07',
    title: 'IOCL Paradip Refinery Coker Furnace Tube Upset',
    year: 2021,
    facility_type: 'Petroleum Refinery',
    location: 'Paradip, Odisha',
    peak_frp_mw: 54.0,
    temperature_k: 1590,
    pressure_spike_bar: 3.6,
    duration_hrs: 14,
    direct_cause: 'Decoking cycle valve leak creating unexpected high-temperature flare dumping.',
    similarity_score: 89.1,
    key_sops: ['Steam injection into coker heater tubes', 'Divert sour gases to secondary sulfur recovery units', 'Monitor coastal ambient air VOC sensors']
  },
  {
    id: 'HIST-08',
    title: 'Adani Mundra Thermal Power Superheater Tube Rupture',
    year: 2022,
    facility_type: 'Thermal Power Plant',
    location: 'Mundra, Gujarat',
    peak_frp_mw: 38.0,
    temperature_k: 920,
    pressure_spike_bar: 2.1,
    duration_hrs: 6,
    direct_cause: 'Fly ash erosion causing secondary superheater tube puncture and steam venting.',
    similarity_score: 72.8,
    key_sops: ['Control boiler water feed rate', 'Gradual controlled shutdown to prevent turbine thermal shock']
  },
  {
    id: 'HIST-09',
    title: 'Hindustan Zinc Chanderiya Lead-Zinc Smelter Baghouse Fire',
    year: 2019,
    facility_type: 'Smelter / Metallurgy',
    location: 'Chittorgarh, Rajasthan',
    peak_frp_mw: 31.0,
    temperature_k: 1040,
    pressure_spike_bar: 1.8,
    duration_hrs: 9,
    direct_cause: 'Sparks carried over into electrostatic precipitator dust collection hopper.',
    similarity_score: 69.4,
    key_sops: ['CO2 inert gas flooding in baghouse compartments', 'Spark arrestor maintenance checklist activation']
  },
  {
    id: 'HIST-10',
    title: 'GAIL Nagaram Pipeline Gas Rupture & Flash Fire',
    year: 2014,
    facility_type: 'Gas Pipeline & Distribution',
    location: 'East Godavari, Andhra Pradesh',
    peak_frp_mw: 98.0,
    temperature_k: 1710,
    pressure_spike_bar: 12.5,
    duration_hrs: 16,
    direct_cause: 'Wet sour gas condensate internal microbial corrosion leading to high-pressure line rupture.',
    similarity_score: 82.3,
    key_sops: ['Remote automated mainline sectionalizing valve closure', 'Cathodic protection audit log inspection', 'Village evacuation and ignition source blackout']
  },
  {
    id: 'HIST-11',
    title: 'Chevron Richmond Refinery Crude Unit Pipe Rupture',
    year: 2012,
    facility_type: 'Petroleum Refinery',
    location: 'California, USA',
    peak_frp_mw: 85.0,
    temperature_k: 1640,
    pressure_spike_bar: 4.1,
    duration_hrs: 10,
    direct_cause: 'Sulfidation corrosion in 48-year-old carbon steel side-cut line in crude distillation unit.',
    similarity_score: 92.1,
    key_sops: ['Replace piping with minimum 9% Chromium alloy', 'Rapid nitrogen blanket flooding', 'Community shelter-in-place advisory']
  },
  {
    id: 'HIST-12',
    title: 'JSW Steel Vijayanagar Corex Plant Gas Line Flash',
    year: 2023,
    facility_type: 'Steel Plant',
    location: 'Toranagallu, Karnataka',
    peak_frp_mw: 42.0,
    temperature_k: 1380,
    pressure_spike_bar: 2.7,
    duration_hrs: 7,
    direct_cause: 'Blast furnace export gas pressure oscillation igniting off-gas manifold.',
    similarity_score: 86.5,
    key_sops: ['Corex furnace oxygen bleed emergency shutdown', 'Purge gas manifold with liquid nitrogen', 'Water deluge spray on gas holder bells']
  },
  {
    id: 'HIST-13',
    title: 'NTPC Dadri Peripheral Dumping Yard Surface Fire',
    year: 2024,
    facility_type: 'Thermal Power Plant Buffer Yard',
    location: 'Dadri, Greater Noida, Uttar Pradesh',
    peak_frp_mw: 6.8,
    temperature_k: 780,
    pressure_spike_bar: 0.0,
    duration_hrs: 2,
    direct_cause: 'Smoldering discarded ignition source in open dumping plot near boundary wall. Brought under control in 2 hrs; zero core plant impact.',
    similarity_score: 94.2,
    key_sops: ['Deploy boundary perimeter water tenders', 'Cross-verify thermal signature via VIIRS VNF (780 K confirms open smoldering, not boiler blast)', 'Inspect ash dyke and coal handling conveyor perimeter buffers']
  }
];

// Historical Baseline Data for Jamnagar (Hourly 24h + 30-day + 90-day baseline)
export const MOCK_HISTORICAL_BASELINE = [
  { hour: '00:00', current_frp: 14.8, baseline_30d: 14.1, baseline_90d: 13.9, std_dev: 2.1 },
  { hour: '01:00', current_frp: 18.2, baseline_30d: 14.3, baseline_90d: 14.0, std_dev: 2.2 },
  { hour: '01:42 (ANOMALY)', current_frp: 64.8, baseline_30d: 14.2, baseline_90d: 14.2, std_dev: 2.3 },
  { hour: '02:00', current_frp: 61.5, baseline_30d: 14.2, baseline_90d: 14.1, std_dev: 2.2 },
  { hour: '03:00', current_frp: 54.0, baseline_30d: 13.9, baseline_90d: 13.8, std_dev: 2.1 },
  { hour: '04:00', current_frp: 46.2, baseline_30d: 13.8, baseline_90d: 13.7, std_dev: 2.0 },
  { hour: '05:00', current_frp: 38.0, baseline_30d: 14.0, baseline_90d: 13.9, std_dev: 2.1 },
  { hour: '06:00', current_frp: 29.5, baseline_30d: 14.5, baseline_90d: 14.2, std_dev: 2.3 },
  { hour: '07:00', current_frp: 22.1, baseline_30d: 15.0, baseline_90d: 14.6, std_dev: 2.4 },
  { hour: '08:00', current_frp: 17.8, baseline_30d: 15.2, baseline_90d: 14.8, std_dev: 2.4 },
  { hour: '09:00', current_frp: 16.0, baseline_30d: 15.4, baseline_90d: 15.0, std_dev: 2.5 },
  { hour: '10:00', current_frp: 15.2, baseline_30d: 15.1, baseline_90d: 14.9, std_dev: 2.3 },
  { hour: '11:00', current_frp: 14.9, baseline_30d: 14.8, baseline_90d: 14.7, std_dev: 2.2 },
  { hour: '12:00', current_frp: 15.1, baseline_30d: 14.9, baseline_90d: 14.6, std_dev: 2.2 },
  { hour: '13:00', current_frp: 15.0, baseline_30d: 15.0, baseline_90d: 14.8, std_dev: 2.3 },
  { hour: '14:00', current_frp: 14.7, baseline_30d: 14.7, baseline_90d: 14.5, std_dev: 2.1 },
  { hour: '15:00', current_frp: 14.5, baseline_30d: 14.6, baseline_90d: 14.4, std_dev: 2.1 },
  { hour: '16:00', current_frp: 14.4, baseline_30d: 14.5, baseline_90d: 14.3, std_dev: 2.0 },
  { hour: '17:00', current_frp: 14.6, baseline_30d: 14.4, baseline_90d: 14.2, std_dev: 2.0 },
  { hour: '18:00', current_frp: 15.0, baseline_30d: 14.6, baseline_90d: 14.4, std_dev: 2.1 },
  { hour: '19:00', current_frp: 15.3, baseline_30d: 14.8, baseline_90d: 14.5, std_dev: 2.2 },
  { hour: '20:00', current_frp: 15.5, baseline_30d: 14.9, baseline_90d: 14.6, std_dev: 2.2 },
  { hour: '21:00', current_frp: 15.2, baseline_30d: 14.7, baseline_90d: 14.4, std_dev: 2.1 },
  { hour: '22:00', current_frp: 15.0, baseline_30d: 14.5, baseline_90d: 14.2, std_dev: 2.1 },
  { hour: '23:00', current_frp: 14.9, baseline_30d: 14.3, baseline_90d: 14.0, std_dev: 2.1 }
];

export const MOCK_BRSR_COMPANIES = [
  {
    id: 'BRSR-01',
    name: 'Reliance Industries Limited (Petrochemical Division)',
    ticker: 'RELIANCE',
    sector: 'Oil & Gas / Petrochemicals',
    fy_period: 'FY 2025-26',
    self_reported_co2_mt: 312000,
    satellite_verified_co2_mt: 398500,
    divergence_pct: 27.7,
    status: 'FLAGGED_UNDERREPORTING',
    filing_ref: 'NSE-BRSR-P6-RIL-88412'
  },
  {
    id: 'BRSR-02',
    name: 'NTPC Limited (Power Generation Portfolio)',
    ticker: 'NTPC',
    sector: 'Power Utility',
    fy_period: 'FY 2025-26',
    self_reported_co2_mt: 1450000,
    satellite_verified_co2_mt: 1492000,
    divergence_pct: 2.9,
    status: 'COMPLIANT',
    filing_ref: 'BSE-BRSR-P6-NTPC-19401'
  },
  {
    id: 'BRSR-03',
    name: 'Tata Steel Limited (India Operations)',
    ticker: 'TATASTEEL',
    sector: 'Metals & Mining',
    fy_period: 'FY 2025-26',
    self_reported_co2_mt: 820000,
    satellite_verified_co2_mt: 864000,
    divergence_pct: 5.4,
    status: 'COMPLIANT',
    filing_ref: 'BSE-BRSR-P6-TSL-30911'
  },
  {
    id: 'BRSR-04',
    name: 'Indian Oil Corporation Ltd (IOCL Refineries)',
    ticker: 'IOC',
    sector: 'Oil Refining',
    fy_period: 'FY 2025-26',
    self_reported_co2_mt: 420000,
    satellite_verified_co2_mt: 489000,
    divergence_pct: 16.4,
    status: 'MODERATE_DISCREPANCY',
    filing_ref: 'NSE-BRSR-P6-IOCL-55209'
  }
];

export const MOCK_CITIZEN_REPORTS = [
  {
    id: 'CIT-2026-001',
    timestamp: '2026-09-25 08:30 IST',
    lat: 28.4095,
    lon: 77.8562,
    location_name: 'Near Sikandrabad bypass, Bulandshahr, UP',
    smoke_color: 'Black / Heavy Soot',
    odor: 'Plastic / Acrid',
    notes: 'Massive black chimney smoke observed coming from unmarked brick kiln compound without zig-zag blowers running. Bad smell in nearby village.',
    status: 'VERIFIED'
  },
  {
    id: 'CIT-2026-002',
    timestamp: '2026-09-24 22:15 IST',
    lat: 30.2510,
    lon: 75.8490,
    location_name: 'Sunam Road field cluster, Sangrur, Punjab',
    smoke_color: 'Grey / Agricultural',
    odor: 'Wood / Biomass',
    notes: 'Paddy straw burning in 4 contiguous fields after dark to avoid local flying squads.',
    status: 'VERIFIED'
  }
];
