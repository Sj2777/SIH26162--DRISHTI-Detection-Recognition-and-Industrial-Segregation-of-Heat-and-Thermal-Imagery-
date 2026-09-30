/**
 * Generates OASIS Common Alerting Protocol (CAP-v1.2) XML
 * Conforming to India NDMA SACHET disaster alert schema.
 */
export function generateCAPXML(incident) {
  const sentIso = new Date().toISOString();
  const alertId = `IN-NDMA-AGNI-${incident.id}`;

  const severityMap = {
    WARNING: 'Moderate',
    CRITICAL: 'Severe',
    ROUTINE: 'Minor'
  };

  const urgencyMap = {
    WARNING: 'Expected',
    CRITICAL: 'Immediate',
    ROUTINE: 'Future'
  };

  const severity = severityMap[incident.severity] || 'Severe';
  const urgency = urgencyMap[incident.severity] || 'Immediate';

  const dLat = 0.025;
  const dLon = 0.025;
  const lat = incident.lat || 18.52;
  const lng = incident.lng || 73.85;
  const polyPoints = [
    `${lat - dLat},${lng - dLon}`,
    `${lat + dLat},${lng - dLon}`,
    `${lat + dLat},${lng + dLon}`,
    `${lat - dLat},${lng + dLon}`,
    `${lat - dLat},${lng - dLon}`
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
    <headline>${incident.facility} [FRP: ${incident.frp || 45} MW]</headline>
    <description>Satellite-detected thermal event at ${incident.facility}. Located in ${incident.location}. Classification: ${incident.classification || 'Unknown'}</description>
    <instruction>Deploy district emergency response squad; maintain downwind exclusion perimeter.</instruction>
    <web>https://agni-vision.gov.in/alerts/${incident.id}</web>
    <contact>DEOC Pune: 112 | National Emergency: 112</contact>
    <parameter>
      <valueName>SatelliteSensor</valueName>
      <value>${incident.source || 'VIIRS'}</value>
    </parameter>
    <parameter>
      <valueName>FireRadiativePowerMW</valueName>
      <value>${incident.frp || 45}</value>
    </parameter>
    <area>
      <areaDesc>Downwind Plume Zone around ${incident.facility}</areaDesc>
      <polygon>${polyPoints}</polygon>
      <circle>${lat},${lng},2.5</circle>
    </area>
  </info>
</alert>`;
}
