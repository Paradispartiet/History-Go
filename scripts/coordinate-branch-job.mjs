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
const candidateBuildingNumbers = ['81764387', '300171619'];

async function fetchText(url) {
  const response = await fetch(url, { headers });
  const text = await response.text();
  return {
    url,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get('content-type'),
    text
  };
}

const capabilitiesUrl = `${BASE}?service=WFS&version=2.0.0&request=GetCapabilities`;
const capabilities = await fetchText(capabilitiesUrl);
fs.writeFileSync(path.join(REPORT_DIR, 'get-capabilities.txt'), capabilities.text);

const discoveredNames = [...capabilities.text.matchAll(/<[^>]*Name[^>]*>([^<]+)<\/[^>]*Name>/gi)]
  .map((match) => match[1].trim())
  .filter(Boolean);
const discoveredFeatureTypes = [...new Set(discoveredNames.filter((name) => /bygning|matrikkel/i.test(name)))];

const typeCandidates = [...new Set([
  ...discoveredFeatureTypes,
  'app:Bygningspunkt',
  'matrikkel:Bygningspunkt',
  'MatrikkelenBygningspunkt:Bygningspunkt',
  'Bygningspunkt',
  'app:bygning',
  'app:Bygning'
])];

const bboxVariants = [
  { id: 'lat_lon_axis', bbox: '59.9450,10.7640,59.9490,10.7705,urn:ogc:def:crs:EPSG::4326' },
  { id: 'lon_lat_axis', bbox: '10.7640,59.9450,10.7705,59.9490,urn:ogc:def:crs:EPSG::4326' }
];

const attempts = [];
const features = [];
for (const typeName of typeCandidates) {
  const describeUrl = `${BASE}?service=WFS&version=2.0.0&request=DescribeFeatureType&typeNames=${encodeURIComponent(typeName)}`;
  const describe = await fetchText(describeUrl);
  fs.writeFileSync(path.join(REPORT_DIR, `describe-${typeName.replace(/[^a-z0-9]+/gi, '_')}.txt`), describe.text);

  for (const variant of bboxVariants) {
    for (const outputFormat of ['application/json', 'json', 'GML3']) {
      const url = `${BASE}?service=WFS&version=2.0.0&request=GetFeature&typeNames=${encodeURIComponent(typeName)}&count=500&srsName=EPSG:4326&bbox=${encodeURIComponent(variant.bbox)}&outputFormat=${encodeURIComponent(outputFormat)}`;
      const response = await fetchText(url);
      const fileBase = `${typeName.replace(/[^a-z0-9]+/gi, '_')}-${variant.id}-${outputFormat.replace(/[^a-z0-9]+/gi, '_')}`;
      fs.writeFileSync(path.join(REPORT_DIR, `get-feature-${fileBase}.txt`), response.text);

      let parsed = null;
      try { parsed = JSON.parse(response.text); } catch {}
      const textMatches = candidateBuildingNumbers.filter((number) => response.text.includes(number));
      attempts.push({
        typeName,
        variant: variant.id,
        outputFormat,
        status: response.status,
        ok: response.ok,
        contentType: response.contentType,
        parsedFeatureCount: parsed?.features?.length ?? null,
        candidateNumbersFoundInRawText: textMatches,
        responsePrefix: response.text.slice(0, 500)
      });

      for (const feature of parsed?.features || []) {
        const raw = JSON.stringify(feature);
        const matched = candidateBuildingNumbers.filter((number) => raw.includes(number));
        features.push({ typeName, variant: variant.id, outputFormat, matchedBuildingNumbers: matched, feature });
      }
    }
  }
}

const candidateMatches = features.filter((row) => row.matchedBuildingNumbers.length > 0);
const rawCandidateAttempts = attempts.filter((attempt) => attempt.candidateNumbersFoundInRawText.length > 0);

const summary = {
  date: '2026-07-20',
  source: 'Kartverket / Geonorge Matrikkelen Bygningspunkt WFS',
  sourceUrl: BASE,
  capabilities: {
    status: capabilities.status,
    ok: capabilities.ok,
    contentType: capabilities.contentType,
    prefix: capabilities.text.slice(0, 1500)
  },
  discoveredFeatureTypes,
  typeCandidates,
  candidateBuildingNumbers,
  successfulAttemptCount: attempts.filter((attempt) => attempt.ok).length,
  parsedFeatureCount: features.length,
  rawCandidateAttempts,
  candidateMatches,
  attempts
};

fs.writeFileSync(path.join(REPORT_DIR, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'README.md'), `# Øvre Spinneri – Matrikkelen Bygningspunkt research\n\nResearch-only correlation of OSM candidate building numbers with Kartverket's open Matrikkelen Bygningspunkt WFS.\n\n- Candidate OSM building numbers: ${candidateBuildingNumbers.join(', ')}\n- Feature-type candidates tried: ${typeCandidates.join(', ')}\n- Successful HTTP attempts: ${summary.successfulAttemptCount}\n- Parsed features: ${features.length}\n- Attempts containing either candidate building number: ${rawCandidateAttempts.length}\n- Parsed exact candidate matches: ${candidateMatches.length}\n\nRaw capabilities, schema attempts and feature responses are saved in this report directory. No canonical coordinates are changed by this job.\n`);

console.log(JSON.stringify({
  capabilitiesStatus: capabilities.status,
  discoveredFeatureTypes,
  successfulAttemptCount: summary.successfulAttemptCount,
  parsedFeatureCount: features.length,
  rawCandidateAttempts,
  candidateMatches
}, null, 2));
