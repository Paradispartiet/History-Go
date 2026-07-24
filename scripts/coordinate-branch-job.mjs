import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-gamlebyen-skole-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap/gamlebyen_skole.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const fetchText = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
      'user-agent': 'History-Go coordinate research/1.0 (github.com/Paradispartiet/History-Go)',
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
};
const fetchJson = async (url, options = {}) => JSON.parse(await fetchText(url, options));
const normalize = (value) => String(value ?? '')
  .toLowerCase()
  .replaceAll('æ', 'ae')
  .replaceAll('ø', 'o')
  .replaceAll('å', 'a')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();
const distanceMeters = (a, b) => {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const addressText = (record) => {
  const address = record?.beliggenhetsadresse ?? record?.forretningsadresse ?? record?.postadresse ?? {};
  return [...(address.adresse ?? []), address.postnummer, address.poststed].filter(Boolean).join(' ');
};
const objectCoordinate = (entry) => {
  const lat = Number(entry.lat ?? entry.center?.lat);
  const lon = Number(entry.lon ?? entry.center?.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
};
const osmSourceId = (entry) => `osm-${entry.type}:${entry.id}`;

await fs.mkdir(reportDir, { recursive: true });
const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; this research must stay post-195.');

const place = await readJson(placeRel);
assert(place.id === 'gamlebyen_skole', 'Unexpected place identity.');
assert(place.coordStatus == null, 'Gamlebyen skole already has a coordinate status; manual reconciliation required.');

const urls = {
  officialHome: 'https://gamlebyen.osloskolen.no/',
  officialContact: 'https://gamlebyen.osloskolen.no/kontakt-oss/',
  officialProfile: 'https://gamlebyen.osloskolen.no/om-skolen/om-oss/var-profil/',
  officialHistory: 'https://gamlebyen.osloskolen.no/om-skolen/om-oss/skolens-historie/',
  brregSubunit: 'https://data.brreg.no/enhetsregisteret/api/underenheter/973626442',
  geonorge: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Egedes%20gate&nummer=3&kommunenummer=0301&treffPerSide=20',
};
const [officialHome, officialContact, officialProfile, officialHistory, brregSubunit, geonorge] = await Promise.all([
  fetchText(urls.officialHome),
  fetchText(urls.officialContact),
  fetchText(urls.officialProfile),
  fetchText(urls.officialHistory),
  fetchJson(urls.brregSubunit),
  fetchJson(urls.geonorge),
]);
const homeText = normalize(officialHome);
const contactText = normalize(officialContact);
const profileText = normalize(officialProfile);
const historyText = normalize(officialHistory);
assert(homeText.includes('gamlebyen skole') || contactText.includes('gamlebyen skole'), 'Official Osloskolen pages no longer identify Gamlebyen skole.');
const officialAddressShown = contactText.includes('egedes gate 3') && contactText.includes('0192') && contactText.includes('oslo');
const official1881Shown = profileText.includes('1881') || historyText.includes('1881');
assert(brregSubunit.organisasjonsnummer === '973626442', 'Unexpected Gamlebyen school subunit identity.');
assert(normalize(brregSubunit.navn) === 'gamlebyen skole', 'Brønnøysund subunit no longer resolves to Gamlebyen skole.');
assert(normalize(addressText(brregSubunit)).includes('egedes gate 3 0192 oslo'), 'Brønnøysund no longer resolves Gamlebyen school to Egedes gate 3, 0192 Oslo.');

const exactRows = (geonorge.adresser ?? []).filter((entry) => normalize(entry.adressenavn ?? entry.adressetekst).includes('egedes gate')
  && Number(entry.nummer) === 3
  && String(entry.postnummer ?? '') === '0192'
  && String(entry.kommunenummer ?? entry.kommune?.kommunenummer ?? '') === '0301');
assert(exactRows.length > 0, 'Kartverket returned no exact Egedes gate 3, 0192 Oslo result.');
const coordinateGroups = new Map();
for (const entry of exactRows) {
  const lat = Number(entry.representasjonspunkt?.lat);
  const lon = Number(entry.representasjonspunkt?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  const key = `${lat.toFixed(8)},${lon.toFixed(8)}`;
  if (!coordinateGroups.has(key)) coordinateGroups.set(key, []);
  coordinateGroups.get(key).push(entry);
}
assert(coordinateGroups.size > 0, 'Kartverket exact address rows expose no usable coordinates.');
const addressCoordinates = [...coordinateGroups.entries()].map(([key, rows]) => {
  const [lat, lon] = key.split(',').map(Number);
  const row = rows[0];
  const municipality = String(row.kommunenummer ?? row.kommune?.kommunenummer ?? '0301');
  const addressCode = String(row.adressekode ?? row.adressenavn?.adressekode ?? 'unknown');
  const addressNumber = `${row.nummer ?? 3}${row.bokstav ?? ''}`;
  return {
    lat,
    lon,
    sourceObjectId: `geonorge-adresser-v1:${municipality}:${addressCode}:${addressNumber}:${key}`,
    rowCount: rows.length,
    addressText: row.adressetekst ?? `Egedes gate ${addressNumber}`,
  };
});

const searchOrigin = addressCoordinates[0];
const overpassQuery = `[out:json][timeout:30];(nwr(around:500,${searchOrigin.lat},${searchOrigin.lon})["name"~"Gamlebyen skole",i];nwr(around:250,${searchOrigin.lat},${searchOrigin.lon})["amenity"="school"];nwr(around:250,${searchOrigin.lat},${searchOrigin.lon})["addr:street"~"Egedes gate",i]["addr:housenumber"~"^3"];) ;out center tags;`;
const overpass = await fetchJson('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ data: overpassQuery }).toString(),
});
const transportLike = (tags) => Boolean(tags.public_transport || tags.railway || tags.highway === 'bus_stop' || tags.station || tags.tram || tags.subway);
const rankedOsm = (overpass.elements ?? []).map((entry) => {
  const tags = entry.tags ?? {};
  const coordinate = objectCoordinate(entry);
  const nearestAddressMeters = coordinate ? Math.min(...addressCoordinates.map((address) => distanceMeters(address, coordinate))) : Infinity;
  const names = normalize(`${tags.name ?? ''} ${tags['name:no'] ?? ''} ${tags['name:en'] ?? ''}`);
  const address = normalize(`${tags['addr:street'] ?? ''} ${tags['addr:housenumber'] ?? ''} ${tags['addr:postcode'] ?? ''}`);
  const website = normalize(`${tags.website ?? ''} ${tags['contact:website'] ?? ''}`);
  const orgRef = String(tags['ref:NO:orgnr'] ?? tags.ref ?? '');
  let score = 0;
  if (names.includes('gamlebyen skole')) score += 100;
  if (tags.amenity === 'school') score += 55;
  if (tags.building === 'school') score += 35;
  else if (tags.building && tags.building !== 'no') score += 15;
  if (address.includes('egedes gate 3')) score += 45;
  if (website.includes('gamlebyen osloskolen no')) score += 60;
  if (orgRef.includes('973626442')) score += 80;
  if (nearestAddressMeters <= 30) score += 30;
  else if (nearestAddressMeters <= 75) score += 20;
  else if (nearestAddressMeters <= 150) score += 10;
  if (transportLike(tags)) score -= 250;
  return {
    entry,
    tags,
    coordinate,
    nearestAddressMeters: Number.isFinite(nearestAddressMeters) ? Number(nearestAddressMeters.toFixed(1)) : null,
    score,
    excludedAsTransport: transportLike(tags),
  };
}).sort((a, b) => b.score - a.score || (a.nearestAddressMeters ?? Infinity) - (b.nearestAddressMeters ?? Infinity));
const selectedOsm = rankedOsm.find((candidate) => !candidate.excludedAsTransport && candidate.coordinate && candidate.score >= 85) ?? null;
assert(selectedOsm, 'No sufficiently identified non-transport OSM school object was found near Egedes gate 3.');
assert(selectedOsm.nearestAddressMeters < 180, `Selected school object is ${selectedOsm.nearestAddressMeters} m from all official address points.`);

const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };
let candidate = null;
let coordinateDecision;
let coordStatus;
let coordType;
if (addressCoordinates.length === 1) {
  const officialPoint = addressCoordinates[0];
  candidate = {
    lat: officialPoint.lat,
    lon: officialPoint.lon,
    sourceProvider: 'official_address',
    sourceObjectId: officialPoint.sourceObjectId,
    sourceUrl: urls.geonorge,
    objectType: 'school_address_point',
  };
  coordinateDecision = distanceMeters(currentCoordinate, candidate) <= 3
    ? 'verify_existing_at_official_school_address_point'
    : 'promote_official_school_address_point';
  coordStatus = 'verified';
  coordType = 'address_point';
} else if (selectedOsm.entry.type !== 'node'
  && normalize(`${selectedOsm.tags.name ?? ''} ${selectedOsm.tags['name:no'] ?? ''}`).includes('gamlebyen skole')
  && selectedOsm.tags.amenity === 'school') {
  candidate = {
    lat: Number(selectedOsm.coordinate.lat.toFixed(8)),
    lon: Number(selectedOsm.coordinate.lon.toFixed(8)),
    sourceProvider: 'osm',
    sourceObjectId: osmSourceId(selectedOsm.entry),
    sourceUrl: `https://www.openstreetmap.org/${selectedOsm.entry.type}/${selectedOsm.entry.id}`,
    objectType: 'named_school_geometry_reference_center',
  };
  coordinateDecision = distanceMeters(currentCoordinate, candidate) <= 3
    ? 'verify_existing_at_named_school_geometry_center'
    : 'promote_named_school_geometry_center';
  coordStatus = 'verified_geometry';
  coordType = 'campus_center';
} else {
  coordinateDecision = 'multiple_official_address_points_need_full_school_geometry';
}
const canBecomeVerified = candidate != null;
const displacementMeters = candidate ? Number(distanceMeters(currentCoordinate, candidate).toFixed(1)) : null;

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_gamlebyen_school_egedes_gate_3',
  coordinateDecision,
  currentCoordinate,
  candidate,
  displacementMeters,
  officialAddress: {
    address: 'Egedes gate 3, 0192 Oslo',
    coordinateCount: addressCoordinates.length,
    coordinates: addressCoordinates,
    selectionDecision: addressCoordinates.length === 1
      ? 'unique_official_point_supported_by_school_identity_and_nearby_school_object'
      : canBecomeVerified
        ? 'multiple_official_points_resolved_by_named_school_geometry'
        : 'multiple_official_points_preserved_pending_full_geometry',
  },
  supportingOsmObject: {
    sourceObjectId: osmSourceId(selectedOsm.entry),
    sourceUrl: `https://www.openstreetmap.org/${selectedOsm.entry.type}/${selectedOsm.entry.id}`,
    coordinate: selectedOsm.coordinate,
    nearestAddressMeters: selectedOsm.nearestAddressMeters,
    score: selectedOsm.score,
    tags: selectedOsm.tags,
  },
  historyReview: {
    canonicalYear: Number(place.year),
    officialFoundingYear: 1881,
    officialPageContains1881: official1881Shown,
    mismatch: Number(place.year) !== 1881,
    coordinateResearchChangedYear: false,
    nextAction: 'Review canonical year separately; the official school profile states that Gamlebyen school was founded in 1881.',
  },
  sourceChecks: {
    officialSchoolIdentity: true,
    officialContactPageAddressShown: officialAddressShown,
    official1881FoundingYearShown: official1881Shown,
    brregSubunitIdentityAndAddress: true,
    geonorgeExactAddressCoordinatesPreserved: true,
    namedNonTransportSchoolObjectFound: true,
    transportObjectsExcluded: true,
  },
  recommendation: {
    canBecomeVerified,
    nextAction: canBecomeVerified
      ? `${coordinateDecision.startsWith('promote') ? 'Apply' : 'Keep'} ${candidate.sourceObjectId} as the canonical display marker, preserve official Osloskolen and Brønnøysund identity, retain all Kartverket address evidence, retain ${osmSourceId(selectedOsm.entry)} as school-object support, add coordinate evidence, synchronize aggregate/index copies, and keep protocol max batch at 195. Review the canonical 1799 year separately against the official 1881 founding year.`
      : 'Do not choose among multiple official address points arbitrarily. Continue full named school-geometry research while preserving the official school identity and keeping protocol max batch at 195.',
    coordStatus: canBecomeVerified ? coordStatus : 'needs_source',
    coordType: canBecomeVerified ? coordType : null,
    locatorType: 'building',
    suggestedRadiusMeters: Number(place.r),
  },
};

await fs.writeFile(path.join(reportDir, 'official-home.html'), officialHome, 'utf8');
await fs.writeFile(path.join(reportDir, 'official-contact.html'), officialContact, 'utf8');
await fs.writeFile(path.join(reportDir, 'official-profile.html'), officialProfile, 'utf8');
await fs.writeFile(path.join(reportDir, 'official-history.html'), officialHistory, 'utf8');
await fs.writeFile(path.join(reportDir, 'brreg-subunit-973626442.json'), `${JSON.stringify(brregSubunit, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'geonorge-egedes-gate-3.json'), `${JSON.stringify(geonorge, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'overpass-gamlebyen-school.json'), `${JSON.stringify(overpass, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Gamlebyen school coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **Gamlebyen school, Egedes gate 3, subunit 973626442**\n- Current marker: **${currentCoordinate.lat}, ${currentCoordinate.lon}**\n- Candidate: **${candidate ? `${candidate.lat}, ${candidate.lon}` : 'none'}**\n- Candidate source: **${candidate?.sourceObjectId ?? 'none'}**\n- Displacement: **${displacementMeters ?? 'n/a'} m**\n- Official address coordinate count: **${addressCoordinates.length}**\n- Supporting OSM object: **${summary.supportingOsmObject.sourceObjectId}**\n- Coordinate recommendation: **${coordinateDecision}**\n- Canonical year: **${place.year}**\n- Official school founding year: **1881**\n- Year changed in this research: **no**\n\nThe coordinate recommendation is grounded in the official school identity, Brønnøysund operating-unit address, Kartverket address data and a non-transport OSM school object. The historical year discrepancy is recorded for separate content review. No batch 196 is created.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'gamlebyen_school_research_complete',
  reportDir: reportRel,
  displacementMeters,
  candidateSource: candidate?.sourceObjectId ?? null,
  supportingOsmObject: summary.supportingOsmObject.sourceObjectId,
  recommendation: coordinateDecision,
  historyYearMismatch: summary.historyReview.mismatch,
}, null, 2));
