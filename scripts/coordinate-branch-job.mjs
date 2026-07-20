import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/ovre-spinneri-matrikkel-building-research');
fs.mkdirSync(REPORT_DIR, { recursive: true });

const BASE = 'https://wfs.geonorge.no/skwms1/wfs.matrikkelen-bygningspunkt';
const TYPE_NAME = 'app:Bygning';
const APP_NS = 'http://skjema.geonorge.no/SOSI/produktspesifikasjon/Matrikkelen-Bygningspunkt/20211101';
const candidateBuildingNumbers = ['81764387', '300171619'];
const headers = {
  'User-Agent': 'History-Go-coordinate-research/1.0 (github.com/Paradispartiet/History-Go)',
  'Accept': 'application/xml,text/xml,*/*'
};

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

function first(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

function parseCandidateGml(text, requestedBuildingNumber) {
  const bygningsnummer = first(text, /<app:bygningsnummer>([^<]+)<\/app:bygningsnummer>/i);
  const bygningsstatus = first(text, /<app:bygningsstatus[^>]*>([^<]+)<\/app:bygningsstatus>/i);
  const bygningstype = first(text, /<app:bygningstype[^>]*>([^<]+)<\/app:bygningstype>/i);
  const harKulturminne = first(text, /<app:harKulturminne>([^<]+)<\/app:harKulturminne>/i);
  const harSefrakminne = first(text, /<app:harSefrakminne>([^<]+)<\/app:harSefrakminne>/i);
  const kommunenummer = first(text, /<app:kommunenummer[^>]*>([^<]+)<\/app:kommunenummer>/i);
  const pos = first(text, /<gml:pos[^>]*>([^<]+)<\/gml:pos>/i);
  const uuid = first(text, /<app:uuid[^>]*>([^<]+)<\/app:uuid>/i)
    || first(text, /<app:lokalId>([^<]+)<\/app:lokalId>/i);
  return {
    requestedBuildingNumber,
    bygningsnummer,
    exactNumberMatch: bygningsnummer === requestedBuildingNumber,
    bygningsstatus,
    bygningstype,
    harKulturminne,
    harSefrakminne,
    kommunenummer,
    pos,
    uuid,
    containsRequestedNumber: text.includes(requestedBuildingNumber),
    exception: /ExceptionReport/i.test(text)
      ? first(text, /<ows:ExceptionText>([\s\S]*?)<\/ows:ExceptionText>/i)
      : null
  };
}

const capabilities = await fetchText(`${BASE}?service=WFS&version=2.0.0&request=GetCapabilities`);
fs.writeFileSync(path.join(REPORT_DIR, 'get-capabilities.xml'), capabilities.text);
const describe = await fetchText(`${BASE}?service=WFS&version=2.0.0&request=DescribeFeatureType&typeNames=${encodeURIComponent(TYPE_NAME)}`);
fs.writeFileSync(path.join(REPORT_DIR, 'describe-app-Bygning.xml'), describe.text);

const attempts = [];
for (const number of candidateBuildingNumbers) {
  const filterXml = `<fes:Filter xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:app="${APP_NS}"><fes:PropertyIsEqualTo><fes:ValueReference>app:bygningsnummer</fes:ValueReference><fes:Literal>${number}</fes:Literal></fes:PropertyIsEqualTo></fes:Filter>`;
  const urls = [
    {
      id: 'cql-filter',
      url: `${BASE}?service=WFS&version=2.0.0&request=GetFeature&typeNames=${encodeURIComponent(TYPE_NAME)}&count=10&CQL_FILTER=${encodeURIComponent(`bygningsnummer=${number}`)}`
    },
    {
      id: 'fes-filter',
      url: `${BASE}?service=WFS&version=2.0.0&request=GetFeature&typeNames=${encodeURIComponent(TYPE_NAME)}&count=10&FILTER=${encodeURIComponent(filterXml)}`
    }
  ];

  for (const attempt of urls) {
    const response = await fetchText(attempt.url);
    const file = `building-${number}-${attempt.id}.xml`;
    fs.writeFileSync(path.join(REPORT_DIR, file), response.text);
    attempts.push({
      number,
      method: attempt.id,
      status: response.status,
      ok: response.ok,
      contentType: response.contentType,
      parsed: parseCandidateGml(response.text, number),
      responsePrefix: response.text.slice(0, 800),
      url: attempt.url
    });
  }
}

// Area query in default GML as a fallback/cross-check. Both axis orders are retained explicitly.
for (const variant of [
  { id: 'lat_lon_axis', bbox: '59.9450,10.7640,59.9490,10.7705,urn:ogc:def:crs:EPSG::4326' },
  { id: 'lon_lat_axis', bbox: '10.7640,59.9450,10.7705,59.9490,urn:ogc:def:crs:EPSG::4326' }
]) {
  const url = `${BASE}?service=WFS&version=2.0.0&request=GetFeature&typeNames=${encodeURIComponent(TYPE_NAME)}&count=500&srsName=EPSG:4326&bbox=${encodeURIComponent(variant.bbox)}`;
  const response = await fetchText(url);
  fs.writeFileSync(path.join(REPORT_DIR, `bbox-${variant.id}.xml`), response.text);
  attempts.push({
    number: null,
    method: `bbox-${variant.id}`,
    status: response.status,
    ok: response.ok,
    contentType: response.contentType,
    candidateNumbersFound: candidateBuildingNumbers.filter((number) => response.text.includes(number)),
    responsePrefix: response.text.slice(0, 800),
    url
  });
}

const exactMatches = attempts.filter((attempt) => attempt.parsed?.exactNumberMatch);
const summary = {
  date: '2026-07-20',
  source: 'Kartverket / Geonorge Matrikkelen Bygningspunkt WFS',
  sourceUrl: BASE,
  typeName: TYPE_NAME,
  candidateBuildingNumbers,
  exactMatches,
  attempts
};

fs.writeFileSync(path.join(REPORT_DIR, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'README.md'), `# Øvre Spinneri – Matrikkelen Bygningspunkt research\n\nResearch-only correlation of OSM candidate building numbers with Kartverket's open Matrikkelen Bygningspunkt WFS.\n\n- WFS feature type: \`${TYPE_NAME}\`\n- Candidate OSM building numbers: ${candidateBuildingNumbers.join(', ')}\n- Exact WFS building-number matches: ${exactMatches.length}\n\nFor each candidate the report stores CQL and FES-filter responses in standard GML, including official building point, status and culture/SEFRAK flags when returned. No canonical coordinates are changed by this job.\n`);

console.log(JSON.stringify({ exactMatches, attempts: attempts.map((attempt) => ({ number: attempt.number, method: attempt.method, status: attempt.status, parsed: attempt.parsed, candidateNumbersFound: attempt.candidateNumbersFound })) }, null, 2));
