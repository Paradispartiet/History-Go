import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const PLACE_ID = 'akershus_energi';
const REPORT_DIR = 'reports/oslo-coordinate-akershus-energi-identity-research-post-186';
const DATE = '2026-07-23';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const round = (value, digits = 2) => Number(value.toFixed(digits));

function distanceMeters(a, b) {
  const rad = (x) => x * Math.PI / 180;
  const R = 6371008.8;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function getText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'History-Go coordinate research/1.0' } });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return { status: response.status, finalUrl: response.url, text };
}

async function getJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'History-Go coordinate research/1.0' } });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

function normalizeAddress(hit) {
  const p = hit.representasjonspunkt || {};
  return {
    adressetekst: hit.adressetekst ?? null,
    adressenavn: hit.adressenavn ?? null,
    nummer: hit.nummer ?? null,
    bokstav: hit.bokstav ?? null,
    postnummer: hit.postnummer ?? null,
    poststed: hit.poststed ?? null,
    kommunenummer: hit.kommunenummer ?? null,
    kommunenavn: hit.kommunenavn ?? null,
    adressekode: hit.adressekode ?? null,
    lat: Number.isFinite(Number(p.lat)) ? Number(p.lat) : null,
    lon: Number.isFinite(Number(p.lon)) ? Number(p.lon) : null,
    sourceObjectId: hit.kommunenummer && hit.adressekode && hit.nummer != null
      ? `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${hit.nummer}${hit.bokstav || ''}`
      : null
  };
}

function collectStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, out));
  return out;
}

fs.mkdirSync(REPORT_DIR, { recursive: true });

const placeFile = 'data/places/naeringsliv/oslo/places_naeringsliv/akershus_energi.json';
const place = readJson(placeFile);
if (place.id !== PLACE_ID) throw new Error(`Unexpected id in ${placeFile}: ${place.id}`);

const protocol = fs.readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
if (!protocol.includes('| 186 | `ring_3` | Ring 3 | verified_geometry | `osm-way:4341399` |')) {
  throw new Error('Research must run from post-batch-186 main.');
}

const urls = {
  companyAbout: 'https://akershusenergi.no/varme-og-kjoling/om-akershus-energi-varme/',
  energyPark: 'https://akershusenergi.no/varmesentraler/lillestrom/',
  nve: 'https://www.nve.no/konsesjon/konsesjonssaker/konsesjonssak?id=396&type=A',
  companyContact: 'https://akershusenergi.no/varme-og-kjoling/kontakt/',
  geonorgeBrogata7: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Brogata&nummer=7&postnummer=2000&treffPerSide=20&side=0',
  geonorgeRolfOlsens50: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Rolf%20Olsens%20vei&nummer=50&postnummer=2007&treffPerSide=20&side=0'
};

const [companyAbout, energyPark, nve, companyContact, brogataRaw, rolfRaw] = await Promise.all([
  getText(urls.companyAbout),
  getText(urls.energyPark),
  getText(urls.nve),
  getText(urls.companyContact),
  getJson(urls.geonorgeBrogata7),
  getJson(urls.geonorgeRolfOlsens50)
]);

const officialAreas = ['Lillestrøm', 'Årnes', 'Lørenskog', 'Skedsmokorset', 'Sørumsand'];
const areaChecks = Object.fromEntries(officialAreas.map((name) => [name, companyAbout.text.includes(name)]));
const hasOsloFacilityLink = /\/varmesentraler\/oslo\/?/i.test(companyAbout.text);
const sourceChecks = {
  allFiveOfficialAreasPresent: Object.values(areaChecks).every(Boolean),
  noOsloFacilityLink: !hasOsloFacilityLink,
  energyParkNamed: /Akershus EnergiPark/i.test(energyPark.text),
  energyParkOpenedInLillestrøm2011: /åpnet i Lillestrøm i 2011/i.test(energyPark.text),
  nveLillestrømRælingen: /Lillestrøm og Rælingen/i.test(nve.text),
  nveEnergyPark: /Akershus energipark/i.test(nve.text),
  nveBrogataPlant: /fjernvarmesentral i Brogata/i.test(nve.text),
  contactBrogata7: /Brogata 7/i.test(companyContact.text),
  contactPostcode2000: /2000/i.test(companyContact.text)
};
if (!Object.values(sourceChecks).every(Boolean)) {
  throw new Error(`Authoritative identity checks failed: ${JSON.stringify(sourceChecks)}`);
}

const legacy = { lat: Number(place.lat), lon: Number(place.lon) };
const brogataHits = (brogataRaw.adresser || []).map(normalizeAddress);
const rolfHits = (rolfRaw.adresser || []).map(normalizeAddress);
for (const hit of [...brogataHits, ...rolfHits]) {
  if (hit.lat != null && hit.lon != null) hit.distanceFromLegacyMeters = round(distanceMeters(legacy, hit));
}
const exactBrogata7 = brogataHits.filter((hit) => String(hit.nummer) === '7' && hit.postnummer === '2000');

const tracked = execFileSync('git', ['ls-files', 'data/places'], { encoding: 'utf8' }).split('\n').filter(Boolean);
const geographyPathHints = tracked.filter((file) => /akershus|lillestrom|lillestrøm/i.test(file));
const manifestStrings = collectStrings(readJson('data/places/manifest.json'));
const manifestGeographyHints = [...new Set(manifestStrings.filter((value) => /akershus|lillestrom|lillestrøm/i.test(value)))].sort();

const duplicateCandidates = [];
for (const file of tracked.filter((file) => file.endsWith('.json') && !file.endsWith('places_index.json'))) {
  if (file === placeFile) continue;
  let parsed;
  try { parsed = readJson(file); } catch { continue; }
  const items = Array.isArray(parsed) ? parsed : [parsed];
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const id = String(item.id || '');
    const name = String(item.name || '');
    if (id === PLACE_ID || /Akershus EnergiPark/i.test(name) || /Akershus Energi Varme/i.test(name)) {
      duplicateCandidates.push({ file, id, name, lat: item.lat ?? null, lon: item.lon ?? null });
    }
  }
}

const decision = sourceChecks.noOsloFacilityLink && sourceChecks.energyParkOpenedInLillestrøm2011 && sourceChecks.nveBrogataPlant
  ? 'invalid_oslo_company_proxy; replace_or_move only as the physical Akershus EnergiPark in Lillestrøm after destination-manifest and exact-anchor checks'
  : 'needs_more_research';

const summary = {
  version: DATE,
  purpose: 'Resolve physical identity and municipality for unresolved Oslo record akershus_energi.',
  currentCanonical: {
    file: placeFile,
    id: place.id,
    name: place.name,
    lat: place.lat,
    lon: place.lon,
    year: place.year,
    hasCoordinateContractMetadata: Boolean(place.coordStatus || place.coordSource || place.sourceProvider || place.sourceObjectId)
  },
  authoritativeSourceChecks: sourceChecks,
  officialOperatingAreas: officialAreas,
  officialSources: urls,
  geonorge: {
    brogata7: { hitCount: brogataHits.length, exactHitCount: exactBrogata7.length, hits: brogataHits },
    rolfOlsensVei50: { hitCount: rolfHits.length, hits: rolfHits }
  },
  repositoryGeography: { pathHints: geographyPathHints, manifestHints: manifestGeographyHints },
  duplicateCandidates,
  decision
};
writeJson(path.join(REPORT_DIR, 'summary.json'), summary);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Akershus Energi identity research\n\nDate: ${DATE}\n\nResearch-only pass for \`${PLACE_ID}\`. No canonical place or coordinate data is changed.\n\n## Result\n\n- The official Akershus Energi Varme page lists five operating areas: ${officialAreas.join(', ')}. It exposes no Oslo facility link.\n- The current Oslo coordinate ${place.lat}, ${place.lon} is therefore not supported as an Akershus Energi Varme facility.\n- The official physical facility matching the record's infrastructure description is Akershus EnergiPark in Lillestrøm, opened in 2011.\n- NVE ties Akershus EnergiPark to the Lillestrøm/Rælingen district-heating system and describes the existing plant as being in Brogata.\n- Akershus Energi Varme's official contact page gives Brogata 7, 2000 Lillestrøm.\n- Exact Geonorge Brogata 7 hits: ${exactBrogata7.length}.\n- Repository path hints for an existing Akershus/Lillestrøm destination structure: ${geographyPathHints.length}.\n- Duplicate Akershus Energi identity candidates outside the current file: ${duplicateCandidates.length}.\n- Decision: ${decision}.\n\n## Sources\n\n- ${urls.companyAbout}\n- ${urls.energyPark}\n- ${urls.nve}\n- ${urls.companyContact}\n- ${urls.geonorgeBrogata7}\n`);

console.log(JSON.stringify({
  placeId: PLACE_ID,
  decision,
  exactBrogata7HitCount: exactBrogata7.length,
  brogataHits,
  rolfHits,
  geographyPathHintCount: geographyPathHints.length,
  manifestGeographyHintCount: manifestGeographyHints.length,
  duplicateCandidateCount: duplicateCandidates.length
}, null, 2));
