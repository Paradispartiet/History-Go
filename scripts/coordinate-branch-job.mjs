import fs from 'node:fs';
import path from 'node:path';

const OUT_JSON = 'reports/etne-natur-batch-8-akrafjorden-waterbody-geometry.json';
const OUT_MD = 'reports/etne-natur-batch-8-akrafjorden-waterbody-geometry.md';
const ENDPOINT = 'https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1/query';
const BBOX = [5.70, 59.62, 6.58, 59.98];

async function fetchJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'History-Go-Akrafjorden-geometry-audit/1.0' }
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error(`Fetch failed: ${lastError?.message || lastError}`);
}

function textValues(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach(item => textValues(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach(item => textValues(item, out));
  return out;
}

function polygonStats(geometry) {
  const polygons = geometry?.type === 'Polygon'
    ? [geometry.coordinates]
    : geometry?.type === 'MultiPolygon'
      ? geometry.coordinates
      : [];
  let rings = 0;
  let vertices = 0;
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      rings += 1;
      vertices += ring.length;
      for (const [lon, lat] of ring) {
        minLon = Math.min(minLon, lon);
        minLat = Math.min(minLat, lat);
        maxLon = Math.max(maxLon, lon);
        maxLat = Math.max(maxLat, lat);
      }
    }
  }
  return {
    polygonCount: polygons.length,
    ringCount: rings,
    vertexCount: vertices,
    bbox: Number.isFinite(minLon) ? [minLon, minLat, maxLon, maxLat] : null
  };
}

const query = new URLSearchParams({
  where: '1=1',
  geometry: BBOX.join(','),
  geometryType: 'esriGeometryEnvelope',
  inSR: '4326',
  spatialRel: 'esriSpatialRelIntersects',
  outFields: '*',
  returnGeometry: 'true',
  outSR: '4326',
  f: 'geojson'
});
const requestUrl = `${ENDPOINT}?${query}`;
const payload = await fetchJson(requestUrl);
const allFeatures = Array.isArray(payload.features) ? payload.features : [];
const matches = allFeatures.filter(feature =>
  textValues(feature.properties).some(text => /åkrafjord|akrafjord/i.test(text))
);
if (!matches.length) {
  const nearbyNames = allFeatures.flatMap(feature => textValues(feature.properties))
    .filter(text => /fjord/i.test(text))
    .slice(0, 100);
  throw new Error(`No Åkrafjorden waterbody matches. Nearby fjord texts: ${JSON.stringify(nearbyNames)}`);
}

const rows = matches.map(feature => {
  const properties = feature.properties || {};
  const keyEntries = Object.entries(properties).filter(([key, value]) =>
    value !== null && value !== '' && /(navn|name|vannforekomst|waterbody|lokalid|id|areal|fakta|kommune|type)/i.test(key)
  );
  return {
    id: feature.id ?? null,
    geometryType: feature.geometry?.type || null,
    geometryStats: polygonStats(feature.geometry),
    properties,
    keyProperties: Object.fromEntries(keyEntries)
  };
});

const output = {
  schemaVersion: '1.0',
  generatedAt: new Date().toISOString(),
  source: {
    provider: 'Miljødirektoratet / Vann-Nett',
    layer: 'Kystvannforekomster',
    endpoint: ENDPOINT,
    requestUrl,
    queryBbox: BBOX
  },
  counts: {
    intersectingFeatures: allFeatures.length,
    akrafjordenMatches: matches.length
  },
  featureCollection: {
    type: 'FeatureCollection',
    features: matches
  },
  waterbodies: rows
};
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

const rowText = rows.map((row, index) => {
  const props = row.keyProperties;
  return `### Del ${index + 1}\n\n- Feature-ID: \`${row.id ?? 'mangler'}\`\n- Geometri: \`${row.geometryType}\`\n- Polygoner: ${row.geometryStats.polygonCount}\n- Ringer: ${row.geometryStats.ringCount}\n- Punkter: ${row.geometryStats.vertexCount}\n- Avgrensningsboks: \`${JSON.stringify(row.geometryStats.bbox)}\`\n- Nøkkelegenskaper:\n\n\`\`\`json\n${JSON.stringify(props, null, 2)}\n\`\`\`\n`;
}).join('\n');
const report = `# Åkrafjorden – Vann-Nett geometri-audit\n\n## Formål\n\nDenne revisjonen undersøker om Åkrafjorden kan avgrenses med offisielle kystvannforekomstpolygoner i stedet for det gamle navnepunktet med radius. Vannforekomster er forvaltningsenheter med navngitt geometri og stabile ID-er.\n\n## Resultat\n\n- Kystvannforekomster som krysser søkeområdet: **${allFeatures.length}**\n- Treff med Åkrafjorden i egenskapene: **${matches.length}**\n- Kilde: Miljødirektoratet / Vann-Nett, laget Kystvannforekomster\n- Forespørsel: ${requestUrl}\n\n${rowText}\n## Neste beslutning\n\nDersom treffene dekker hele Åkrafjorden uten nabofjorder, kan polygonene brukes som canonical geometry og Artskart-revisjonsflate. Dersom vannforvaltningen deler fjorden i flere navngitte delområder, skal History GO bevare hele fjordstedet som en sammensatt multipolygon med alle relevante stabile vannforekomst-ID-er. Ingen artsdata publiseres fra det gamle navnepunktet.\n`;
fs.writeFileSync(OUT_MD, report, 'utf8');
console.log(`Åkrafjorden geometry audit: ${matches.length} matching waterbody feature(s) among ${allFeatures.length} nearby features`);
