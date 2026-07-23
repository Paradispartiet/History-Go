import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const PLACE_ID = 'akershus_energi';
const DATE = '2026-07-23';
const REPORT_DIR = 'reports/oslo-coordinate-akershus-energi-identity-research-post-186';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const round = (value, digits = 2) => Number(value.toFixed(digits));

function haversineMeters(a, b) {
  const toRad = (deg) => deg * Math.PI / 180;
  const R = 6371008.8;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'History-Go coordinate research/1.0 (+https://github.com/Paradispartiet/History-Go)'
    }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Fetch failed ${response.status} for ${url}`);
  return { status: response.status, url: response.url, text };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'History-Go coordinate research/1.0 (+https://github.com/Paradispartiet/History-Go)'
    }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Fetch failed ${response.status} for ${url}: ${text.slice(0, 300)}`);
  return { status: response.status, url: response.url, json: JSON.parse(text) };
}

function normalizeAddressHit(hit) {
  const point = hit.representasjonspunkt || hit.position || null;
  const lat = Number(point?.lat);
  const lon = Number(point?.lon);
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
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
    sourceObjectId: hit.kommunenummer && hit.adressekode && hit.nummer != null
      ? `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${hit.nummer}${hit.bokstav || ''}`
      : null
  };
}

function collectManifestStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) collectManifestStrings(item, out);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) collectManifestStrings(item, out);
  return out;
}

fs.mkdirSync(REPORT_DIR, { recursive: true });

const placeFile = 'data/places/naeringsliv/oslo/places_naeringsliv/akershus_energi.json';
const place = readJson(placeFile);
if (place.id !== PLACE_ID) throw new Error(`Unexpected place id in ${placeFile}: ${place.id}`);

const protocol = fs.readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
if (!protocol.includes('| 186 | `ring_3` | Ring 3 | verified_geometry | `osm-way:4341399` |')) {
  throw new Error('Expected merged Ring 3 batch 186 is not present; research must run from post-186 main.');
}

const companyAboutUrl = 'https://akershusenergi.no/varme-og-kjoling/om-akershus-energi-varme/';
const energyParkUrl = 'https://akershusenergi.no/varmesentraler/lillestrom/';
const nveUrl = 'https://www.nve.no/konsesjon/konsesjonssaker/konsesjonssak?id=396&type=A';
const brregUrl = 'https://virksomhet.brreg.no/nb/oppslag/enheter/983701469';

const [companyAbout, energyPark, nve, brreg] = await Promise.all([
  fetchText(companyAboutUrl),
  fetchText(energyParkUrl),
  fetchText(nveUrl),
  fetchText(brregUrl)
]);

const officialAreas = ['Lillestrøm', 'Årnes', 'Lørenskog', 'Skedsmokorset', 'Sørumsand'];
const companyAreaChecks = Object.fromEntries(officialAreas.map((name) => [name, companyAbout.text.includes(name)]));
const companyMentionsOslo = /(^|[^A-Za-zÆØÅæøå])Oslo([^A-Za-zÆØÅæøå]|$)/.test(companyAbout.text.replace(/Oslofjord/g, ''));
const energyParkChecks = {
  title: /Akershus EnergiPark/i.test(energyPark.text),
  opened2011: /åpnet i Lillestrøm i 2011/i.test(energyPark.text),
  lillestrømAndRælingen: /Lillestrøm og Rælingen kommune/i.test(energyPark.text),
  solarArea: /13000\s*(?:kvm|m2|m²)/i.test(energyPark.text)
};
const nveChecks = {
  lillestrømRælingen: /Lillestrøm og Rælingen/i.test(nve.text),
  akershusEnergyPark: /Akershus energipark/i.test(nve.text),
  brogataPlant: /fjernvarmesentral i Brogata/i.test(nve.text)
};
const brregChecks = {
  companyName: /AKERSHUS ENERGI VARME AS/i.test(brreg.text),
  brogata7: /Brogata 7/i.test(brreg.text),
  lillestrom: /2000\s+LILLESTRØM/i.test(brreg.text)
};

if (!Object.values(companyAreaChecks).every(Boolean)) throw new Error(`Official company area list did not match all expected areas: ${JSON.stringify(companyAreaChecks)}`);
if (!energyParkChecks.title || !energyParkChecks.opened2011) throw new Error(`Official EnergyPark identity check failed: ${JSON.stringify(energyParkChecks)}`);
if (!nveChecks.lillestrømRælingen || !nveChecks.akershusEnergyPark || !nveChecks.brogataPlant) throw new Error(`NVE identity/location check failed: ${JSON.stringify(nveChecks)}`);
if (!brregChecks.companyName || !brregChecks.brogata7 || !brregChecks.lillestrom) throw new Error(`Brønnøysund company/address check failed: ${JSON.stringify(brregChecks)}`);

const geonorgeQueries = {
  brogata7: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Brogata&nummer=7&postnummer=2000&treffPerSide=20&side=0',
  rolfOlsensVei50: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Rolf%20Olsens%20vei&nummer=50&postnummer=2007&treffPerSide=20&side=0'
};
const [brogataResult, rolfResult] = await Promise.all([
  fetchJson(geonorgeQueries.brogata7),
  fetchJson(geonorgeQueries.rolfOlsensVei50)
]);
const brogataHits = (brogataResult.json.adresser || []).map(normalizeAddressHit);
const rolfHits = (rolfResult.json.adresser || []).map(normalizeAddressHit);

const legacyCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };
for (const hit of [...brogataHits, ...rolfHits]) {
  if (Number.isFinite(hit.lat) && Number.isFinite(hit.lon)) {
    hit.distanceFromLegacyMeters = round(haversineMeters(legacyCoordinate, { lat: hit.lat, lon: hit.lon }));
  }
}

const trackedFiles = execFileSync('git', ['ls-files', 'data/places'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);
const geographyPathHints = trackedFiles.filter((file) => /lillestrom|lillestrøm|akershus/i.test(file));

const globalManifest = readJson('data/places/manifest.json');
const manifestStrings = collectManifestStrings(globalManifest);
const manifestGeographyHints = [...new Set(manifestStrings.filter((value) => /lillestrom|lillestrøm|akershus/i.test(value)))].sort();

const jsonFiles = trackedFiles.filter((file) => file.endsWith('.json'));
const duplicateCandidates = [];
for (const file of jsonFiles) {
  if (file === placeFile || file.endsWith('places_index.json')) continue;
  let parsed;
  try { parsed = readJson(file); } catch { continue; }
  const stack = Array.isArray(parsed) ? parsed : [parsed];
  for (const item of stack) {
    if (!item || typeof item !== 'object') continue;
    const id = String(item.id || '');
    const name = String(item.name || '');
    if (id === PLACE_ID || /Akershus EnergiPark/i.test(name) || /Akershus Energi Varme/i.test(name)) {
      duplicateCandidates.push({ file, id, name, lat: item.lat ?? null, lon: item.lon ?? null });
    }
  }
}

const hasOsloOperatingArea = companyMentionsOslo;
const legacyOsloIdentitySupported = hasOsloOperatingArea;
const energyParkCandidateSupported = energyParkChecks.title && energyParkChecks.opened2011 && nveChecks.akershusEnergyPark && nveChecks.brogataPlant;
const exactBrogata7 = brogataHits.filter((hit) => hit.postnummer === '2000' && String(hit.nummer) === '7');

const decision = !legacyOsloIdentitySupported && energyParkCandidateSupported
  ? 'retire_or_move_invalid_oslo_company_proxy; canonical replacement candidate is Akershus EnergiPark in Lillestrøm, subject to destination-manifest and exact-anchor production checks'
  : 'needs_more_research';

const report = {
  version: DATE,
  purpose: 'Resolve the physical identity and municipality of unresolved Oslo record akershus_energi before any coordinate is approved.',
  currentCanonical: {
    file: placeFile,
    id: place.id,
    name: place.name,
    lat: place.lat,
    lon: place.lon,
    year: place.year,
    hasCoordinateContractMetadata: Boolean(place.coordStatus || place.coordSource || place.sourceProvider || place.sourceObjectId)
  },
  officialSources: {
    companyAbout: { url: companyAboutUrl, status: companyAbout.status, areaChecks: companyAreaChecks, mentionsOsloAsOperatingArea: hasOsloOperatingArea },
    energyPark: { url: energyParkUrl, status: energyPark.status, checks: energyParkChecks },
    nve: { url: nveUrl, status: nve.status, checks: nveChecks },
    brreg: { url: brregUrl, status: brreg.status, checks: brregChecks }
  },
  geonorge: {
    brogata7: { query: geonorgeQueries.brogata7, hitCount: brogataHits.length, hits: brogataHits },
    rolfOlsensVei50: { query: geonorgeQueries.rolfOlsensVei50, hitCount: rolfHits.length, hits: rolfHits }
  },
  repositoryGeography: {
    pathHints: geographyPathHints,
    manifestHints: manifestGeographyHints
  },
  duplicateCandidates,
  controls: {
    legacyOsloIdentitySupported,
    energyParkCandidateSupported,
    exactBrogata7HitCount: exactBrogata7.length
  },
  decision
};

writeJson(path.join(REPORT_DIR, 'summary.json'), report);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Akershus Energi identity research\n\nDate: ${DATE}\n\nResearch-only pass for \`${PLACE_ID}\`. No canonical place or coordinate data is changed.\n\n## Sources\n\n- Akershus Energi Varme, official operating-area page: ${companyAboutUrl}\n- Akershus EnergiPark, official facility page: ${energyParkUrl}\n- NVE, Lillestrøm and Rælingen district-heating concession: ${nveUrl}\n- Brønnøysundregistrene, Akershus Energi Varme AS: ${brregUrl}\n- Kartverket / Geonorge address API: ${geonorgeQueries.brogata7}\n\n## Result\n\n- Official Akershus Energi Varme facility/network areas found: ${officialAreas.join(', ')}.\n- The current Oslo proxy coordinate is not supported as a documented Akershus Energi Varme facility.\n- The official facility identity that matches the current record's energy-infrastructure description is Akershus EnergiPark in Lillestrøm, opened in 2011.\n- NVE ties Akershus EnergiPark to the Lillestrøm/Rælingen system and explicitly describes the existing plant as being in Brogata.\n- Exact Geonorge Brogata 7 hits: ${exactBrogata7.length}.\n- Repository path hints containing Lillestrøm/Akershus: ${geographyPathHints.length}.\n- Decision: ${decision}.\n`);

console.log(JSON.stringify({
  placeId: PLACE_ID,
  decision,
  legacyCoordinate,
  officialAreas,
  exactBrogata7HitCount: exactBrogata7.length,
  geographyPathHintCount: geographyPathHints.length,
  manifestGeographyHintCount: manifestGeographyHints.length,
  duplicateCandidateCount: duplicateCandidates.length
}, null, 2));
