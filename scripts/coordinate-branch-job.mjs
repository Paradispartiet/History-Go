import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/ovre-spinneri-matrikkel-building-research');
fs.mkdirSync(REPORT_DIR, { recursive: true });

const BASE = 'https://wfs.geonorge.no/skwms1/wfs.matrikkelen-bygningspunkt';
const headers = {
  'User-Agent': 'History-Go-coordinate-research/1.0 (github.com/Paradispartiet/History-Go)',
  'Accept': '*/*'
};

async function fetchText(url) {
  const response = await fetch(url, { headers });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}\n${text.slice(0, 1000)}`);
  return { url, contentType: response.headers.get('content-type'), text };
}

const capabilitiesUrl = `${BASE}?service=WFS&request=GetCapabilities`;
const capabilities = await fetchText(capabilitiesUrl);
fs.writeFileSync(path.join(REPORT_DIR, 'get-capabilities.xml'), capabilities.text);

const featureTypeNames = [...capabilities.text.matchAll(/<(?:\w+:)?Name>([^<]+)<\/(?:\w+:)?Name>/g)]
  .map((match) => match[1].trim())
  .filter((name) => /bygning/i.test(name));
const uniqueFeatureTypes = [...new Set(featureTypeNames)];
if (!uniqueFeatureTypes.length) throw new Error('Could not discover a building feature type from WFS capabilities');

const typeName = uniqueFeatureTypes.find((name) => /bygningspunkt/i.test(name)) || uniqueFeatureTypes[0];
const describeUrl = `${BASE}?service=WFS&version=2.0.0&request=DescribeFeatureType&typeNames=${encodeURIComponent(typeName)}`;
const describe = await fetchText(describeUrl);
fs.writeFileSync(path.join(REPORT_DIR, 'describe-feature-type.xml'), describe.text);

// Query both likely axis orders because WFS/EPSG:4326 axis handling varies by server/version.
const bboxVariants = [
  { id: 'lat_lon_axis', bbox: '59.9450,10.7640,59.9490,10.7705,urn:ogc:def:crs:EPSG::4326' },
  { id: 'lon_lat_axis', bbox: '10.7640,59.9450,10.7705,59.9490,urn:ogc:def:crs:EPSG::4326' }
];

const queries = [];
for (const variant of bboxVariants) {
  for (const version of ['2.0.0', '1.1.0']) {
    const typeParam = version === '2.0.0' ? 'typeNames' : 'typeName';
    const url = `${BASE}?service=WFS&version=${version}&request=GetFeature&${typeParam}=${encodeURIComponent(typeName)}&count=500&srsName=EPSG:4326&bbox=${encodeURIComponent(variant.bbox)}&outputFormat=${encodeURIComponent('application/json')}`;
    try {
      const response = await fetchText(url);
      const file = `get-feature-${variant.id}-v${version.replaceAll('.', '_')}.txt`;
      fs.writeFileSync(path.join(REPORT_DIR, file), response.text);
      let parsed = null;
      try { parsed = JSON.parse(response.text); } catch {}
      queries.push({
        variant: variant.id,
        version,
        url,
        contentType: response.contentType,
        ok: true,
        featureCount: parsed?.features?.length ?? null,
        parsed
      });
    } catch (error) {
      queries.push({ variant: variant.id, version, url, ok: false, error: String(error) });
    }
  }
}

const candidateBuildingNumbers = new Set(['81764387', '300171619']);
const discovered = [];
for (const query of queries) {
  for (const feature of query.parsed?.features || []) {
    const props = feature.properties || {};
    const values = Object.values(props).map((value) => String(value));
    const matchedNumber = [...candidateBuildingNumbers].find((number) => values.includes(number));
    discovered.push({
      query: `${query.variant}/${query.version}`,
      id: feature.id,
      matchedCandidateBuildingNumber: matchedNumber || null,
      properties: props,
      geometry: feature.geometry || null
    });
  }
}

const candidateMatches = discovered.filter((row) => row.matchedCandidateBuildingNumber);
const summary = {
  date: '2026-07-20',
  source: 'Kartverket / Geonorge Matrikkelen Bygningspunkt WFS',
  sourceUrl: BASE,
  typeName,
  discoveredFeatureTypes: uniqueFeatureTypes,
  queryResults: queries.map(({ parsed, ...rest }) => rest),
  discoveredFeatureCount: discovered.length,
  candidateBuildingNumbers: [...candidateBuildingNumbers],
  candidateMatches,
  allDiscovered: discovered
};

fs.writeFileSync(path.join(REPORT_DIR, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'README.md'), `# Øvre Spinneri – Matrikkelen Bygningspunkt research\n\nResearch-only correlation of OSM candidate building numbers with Kartverket's open Matrikkelen Bygningspunkt WFS.\n\n- WFS feature type: \`${typeName}\`\n- Candidate OSM building numbers: 81764387, 300171619\n- Features discovered in bbox queries: ${discovered.length}\n- Exact candidate-number matches: ${candidateMatches.length}\n\nNo canonical coordinates are changed by this job.\n`);

console.log(JSON.stringify({
  typeName,
  discoveredFeatureCount: discovered.length,
  candidateMatches
}, null, 2));
