/**
 * Generates OASIS Common Alerting Protocol (CAP-v1.2) XML
 * Conforming to India NDMA SACHET disaster alert schema.
 */
export function generateCAPXML(incident) {
  const sentIso = new Date().toISOString();
  const alertId = `IN-NDMA-AGNI-${incident.id}`;

  const severityMap = {
    TIER_1_ROUTINE: 'Minor',
    TIER_2_ANOMALY: 'Moderate',
    TIER_3_INDUSTRIAL_INCIDENT: 'Severe',
    TIER_4_MAJOR_DISASTER: 'Extreme',
    TIER_5_WILDFIRE_ECO: 'Severe'
  };

  const urgencyMap = {
    TIER_1_ROUTINE: 'Future',
    TIER_2_ANOMALY: 'Expected',
    TIER_3_INDUSTRIAL_INCIDENT: 'Immediate',
    TIER_4_MAJOR_DISASTER: 'Immediate',
    TIER_5_WILDFIRE_ECO: 'Immediate'
  };

  const severity = severityMap[incident.severity] || 'Severe';
  const urgency = urgencyMap[incident.severity] || 'Immediate';

  const dLat = 0.025;
  const dLon = 0.025;
  const polyPoints = [
    `${incident.lat - dLat},${incident.lon - dLon}`,
    `${incident.lat + dLat},${incident.lon - dLon}`,
    `${incident.lat + dLat},${incident.lon + dLon}`,
    `${incident.lat - dLat},${incident.lon + dLon}`,
    `${incident.lat - dLat},${incident.lon - dLon}`
  ].join(' ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${alertId}</identifier>
  <sender>agni-vision-satellite-engine@ndma.gov.in</sender>
  <sent>${sentIso}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <code>DISASTER-THERMAL-IND-01</code>
  <info>
    <category>Fire</category>
    <category>Env</category>
    <event>Severe Industrial Thermal Anomaly</event>
    <urgency>${urgency}</urgency>
    <severity>${severity}</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>SACHET-CODE</valueName>
      <value>IND_THERMAL_SURGE_VIIRS</value>
    </eventCode>
    <expires>${new Date(Date.now() + 6 * 3600 * 1000).toISOString()}</expires>
    <senderName>National Disaster Management Authority (NDMA) &amp; AGNI-VISION Engine</senderName>
    <headline>${incident.title} [FRP: ${incident.frp_mw} MW]</headline>
    <description>${incident.auto_brief.replace(/\n/g, ' ')}</description>
    <instruction>Nearby residents within 2.8 km downwind should remain indoors with windows shut. Wear N95 or moist cloths if hydrocarbon odor is detected. Follow instructions of local district fire and police squads.</instruction>
    <web>https://agni-vision.gov.in/alerts/${incident.id}</web>
    <contact>DEOC Jamnagar: 0288-2553404 | National Emergency: 112</contact>
    <parameter>
      <valueName>SatelliteSensor</valueName>
      <value>${incident.viirs_pass}</value>
    </parameter>
    <parameter>
      <valueName>ZScoreDeviation</valueName>
      <value>+${incident.z_score} sigma</value>
    </parameter>
    <parameter>
      <valueName>FireRadiativePowerMW</valueName>
      <value>${incident.frp_mw}</value>
    </parameter>
    <area>
      <areaDesc>Downwind Plume Zone around ${incident.facility_name}</areaDesc>
      <polygon>${polyPoints}</polygon>
      <circle>${incident.lat},${incident.lon},${incident.downwind_hazard_radius_km}</circle>
    </area>
  </info>
</alert>`;
}
