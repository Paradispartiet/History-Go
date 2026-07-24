import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-oslomet-pilestredet-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap/oslo_met_pilestredet.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const mainOrg = '997058925';
const campusSubunit = '974647648';
const supportedCampusNumbers = [32, 35, 40, 42, 44, 46, 48, 50, 52];
const assert = (value, message) => { if (!value) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchText = async (url, accept = 'text/html') => {
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          accept,
          'accept-language': 'nb-NO,nb;q=0.9,en;q=0.8',
          'user-agent': 'History-Go coordinate research/1.0',
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 2) await sleep(1500 * (attempt + 1));
    }
  }
  throw lastError;
};
const fetchJson = async (url) => {
  const candidates = url.includes('overpass-api.de/api/interpreter')
    ? [url, url.replace('https://overpass-api.de', 'https://overpass.kumi.systems')]
    : [url];
  let lastError = null;
  for (const candidate of candidates) {
    try {
      return JSON.parse(await fetchText(candidate, 'application/json'));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};
const normalize = (value) => String(value ?? '')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&aring;|&#229;/gi, 'å')
  .replace(/&oslash;|&#248;/gi, 'ø')
  .replace(/&aelig;|&#230;/gi, 'æ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[’']/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();
const distanceMeters = (a, b) => {
  const rad = (value) => value * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const pointInPolygon = (point, ring) => {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const a = ring[index];
    const b = ring[previous];
    if (((a.lat > point.lat) !== (b.lat > point.lat))
      && point.lon < ((b.lon - a.lon) * (point.lat - a.lat)) / (b.lat - a.lat) + a.lon) inside = !inside;
  }
  return inside;
};
const elementCoordinate = (element) => {
  if (Number.isFinite(Number(element.lat)) && Number.isFinite(Number(element.lon))) {
    return { lat: Number(element.lat), lon: Number(element.lon) };
  }
  if (Number.isFinite(Number(element.center?.lat)) && Number.isFinite(Number(element.center?.lon))) {
    return { lat: Number(element.center.lat), lon: Number(element.center.lon) };
  }
  return null;
};
const extractAddressPoint = (response, number) => {
  const matches = (response.adresser ?? []).filter((entry) => normalize(entry.adressetekst) === `pilestredet ${number}`);
  const unique = [];
  for (const row of matches) {
    const lat = Number(row.representasjonspunkt?.lat);
    const lon = Number(row.representasjonspunkt?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (unique.some((point) => Math.abs(point.lat - lat) < 1e-9 && Math.abs(point.lon - lon) < 1e-9)) continue;
    unique.push({
      number,
      lat,
      lon,
      addressText: row.adressetekst,
      postnummer: row.postnummer,
      poststed: row.poststed,
      sourceObjectId: `geonorge-adresser-v1:0301:${row.adressekode ?? 'pilestredet'}:${number}:${lat.toFixed(8)},${lon.toFixed(8)}`,
    });
  }
  assert(unique.length === 1, `Expected one unique Kartverket point for Pilestredet ${number}, got ${unique.length}.`);
  return unique[0];
};

await fs.mkdir(reportDir, { recursive: true });
const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; research must remain post-195.');
const place = await readJson(placeRel);
assert(place.id === 'oslo_met_pilestredet' && place.year === 1994, 'Unexpected OsloMet canonical record.');
const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };

const urls = {
  contact: 'https://www.oslomet.no/om/kontakt',
  campusNb: 'https://www.oslomet.no/om/studiested-pilestredet',
  campusEn: 'https://www.oslomet.no/en/about/pilestredet-campus',
  history: 'https://www.oslomet.no/om/historie',
  groupRooms: 'https://student.oslomet.no/oversikt-over-grupperom',
  printers: 'https://student.oslomet.no/en/web/student/printers',
  contactLui: 'https://www.oslomet.no/om/lui/kontakt-lui',
  brregMain: `https://data.brreg.no/enhetsregisteret/api/enheter/${mainOrg}`,
  brregCampus: `https://data.brreg.no/enhetsregisteret/api/underenheter/${campusSubunit}`,
};
const [contactHtml, campusNbHtml, campusEnHtml, historyHtml, groupRoomsHtml, printersHtml, contactLuiHtml, brregMain, brregCampus] = await Promise.all([
  fetchText(urls.contact),
  fetchText(urls.campusNb),
  fetchText(urls.campusEn),
  fetchText(urls.history),
  fetchText(urls.groupRooms),
  fetchText(urls.printers),
  fetchText(urls.contactLui),
  fetchJson(urls.brregMain),
  fetchJson(urls.brregCampus),
]);
const sourceCaptures = {
  'oslomet-contact.html': contactHtml,
  'oslomet-campus-pilestredet-nb.html': campusNbHtml,
  'oslomet-campus-pilestredet-en.html': campusEnHtml,
  'oslomet-history.html': historyHtml,
  'oslomet-group-rooms.html': groupRoomsHtml,
  'oslomet-printers.html': printersHtml,
  'oslomet-contact-lui.html': contactLuiHtml,
  'brreg-main-997058925.json': `${JSON.stringify(brregMain, null, 2)}\n`,
  'brreg-campus-974647648.json': `${JSON.stringify(brregCampus, null, 2)}\n`,
};
for (const [filename, content] of Object.entries(sourceCaptures)) {
  await fs.writeFile(path.join(reportDir, filename), content, 'utf8');
}
const contactText = normalize(contactHtml);
const campusNbText = normalize(campusNbHtml);
const campusEnText = normalize(campusEnHtml);
const historyText = normalize(historyHtml);
const buildingSupportText = normalize([groupRoomsHtml, printersHtml, contactLuiHtml, campusNbHtml, campusEnHtml].join(' '));
assert(contactText.includes('pilestredet 46'), 'Official contact page no longer identifies Pilestredet 46.');
assert(contactText.includes(mainOrg), 'Official contact page no longer identifies organisation number 997058925.');
assert(campusNbText.includes('pilestredet 32 52'), 'Norwegian campus page no longer defines Pilestredet 32–52.');
assert(campusEnText.includes('pilestredet 32 54'), 'English campus page no longer defines Pilestredet 32–54.');
assert(campusNbText.includes('clara holsts hus') && campusNbText.includes('pilestredet 46'), 'Norwegian campus page no longer identifies the main reception building.');
assert(historyText.includes('1994') && (historyText.includes('høgskolen i oslo') || historyText.includes('hogskolen i oslo')), 'Official history no longer supports 1994.');
for (const number of supportedCampusNumbers) {
  assert(buildingSupportText.includes(`pilestredet ${number}`), `No official OsloMet building support found for Pilestredet ${number}.`);
}
assert(String(brregMain.organisasjonsnummer) === mainOrg, 'Unexpected OsloMet main organisation number.');
assert(String(brregCampus.organisasjonsnummer) === campusSubunit && String(brregCampus.overordnetEnhet) === mainOrg, 'Unexpected Pilestredet campus subunit.');

const addressResponses = await Promise.all(supportedCampusNumbers.map(async (number) => {
  const url = `https://ws.geonorge.no/adresser/v1/sok?adressenavn=Pilestredet&nummer=${number}&kommunenummer=0301&treffPerSide=20`;
  const response = await fetchJson(url);
  await fs.writeFile(path.join(reportDir, `geonorge-pilestredet-${number}.json`), `${JSON.stringify(response, null, 2)}\n`, 'utf8');
  return { number, url, response };
}));
const addressPoints = addressResponses.map(({ number, response }) => extractAddressPoint(response, number));
const mainReceptionPoint = addressPoints.find((point) => point.number === 46);
assert(mainReceptionPoint, 'Pilestredet 46 point missing.');

const overpassQuery = `[out:json][timeout:60];(way(around:120,${mainReceptionPoint.lat},${mainReceptionPoint.lon})[building];nwr(around:550,${mainReceptionPoint.lat},${mainReceptionPoint.lon})["name"~"OsloMet|Høgskolen i Oslo|Oslo Metropolitan University|Clara Holst",i];nwr(around:550,${mainReceptionPoint.lat},${mainReceptionPoint.lon})["ref:NO:orgnr"="${mainOrg}"];);out center tags geom;`;
const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
const overpass = await fetchJson(overpassUrl);
await fs.writeFile(path.join(reportDir, 'overpass-oslomet-pilestredet.json'), `${JSON.stringify(overpass, null, 2)}\n`, 'utf8');
const buildings = [];
const namedContext = [];
for (const element of overpass.elements ?? []) {
  const tags = element.tags ?? {};
  const coordinate = elementCoordinate(element);
  const identity = normalize([tags.name, tags['name:en'], tags.operator, tags.description].join(' '));
  const namedOsloMet = identity.includes('oslomet') || identity.includes('oslo metropolitan university')
    || identity.includes('høgskolen i oslo') || identity.includes('hogskolen i oslo')
    || identity.includes('clara holst') || tags['ref:NO:orgnr'] === mainOrg;
  if (coordinate && namedOsloMet) {
    namedContext.push({
      sourceObjectId: `osm-${element.type}:${element.id}`,
      sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      coordinate,
      distanceFromMainReceptionMeters: Number(distanceMeters(mainReceptionPoint, coordinate).toFixed(1)),
      tags,
    });
  }
  if (element.type !== 'way' || !Array.isArray(element.geometry) || element.geometry.length < 4) continue;
  const ring = element.geometry.map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) }));
  if (!pointInPolygon(mainReceptionPoint, ring)) continue;
  buildings.push({
    sourceObjectId: `osm-way:${element.id}`,
    sourceUrl: `https://www.openstreetmap.org/way/${element.id}`,
    tags,
    polygonNodeCount: ring.length,
  });
}
assert(buildings.length >= 1, 'Kartverket point for Pilestredet 46 is outside nearby building polygons.');
namedContext.sort((a, b) => a.distanceFromMainReceptionMeters - b.distanceFromMainReceptionMeters);
assert(namedContext.length >= 1 && namedContext[0].distanceFromMainReceptionMeters <= 150, 'No sufficiently close named OsloMet context.');

const campusAddressSupport = addressPoints.map((point) => ({
  ...point,
  distanceFromMainReceptionMeters: Number(distanceMeters(mainReceptionPoint, point).toFixed(1)),
})).sort((a, b) => a.distanceFromMainReceptionMeters - b.distanceFromMainReceptionMeters);
const maximumCampusSupportDistanceMeters = Math.max(...campusAddressSupport.map((point) => point.distanceFromMainReceptionMeters));
const footprintBufferMeters = 40;
const suggestedRadiusMeters = Math.max(Number(place.r), Math.ceil((maximumCampusSupportDistanceMeters + footprintBufferMeters) / 10) * 10);
const displacementMeters = Number(distanceMeters(currentCoordinate, mainReceptionPoint).toFixed(1));

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_oslomet_pilestredet_multi_building_campus_main_reception_p46',
  scopeDecision: {
    representation: 'single display marker at the official main reception plus a campus-scale radius',
    norwegianOfficialPage: 'Pilestredet 32–52',
    englishOfficialPage: 'Pilestredet 32–54',
    reconciledUmbrellaRange: 'Pilestredet 32–54',
    verifiedActiveBuildingAddresses: supportedCampusNumbers.map((number) => `Pilestredet ${number}`),
    handlingOf54: 'range endpoint supported by the English campus page, but not treated as an active OsloMet building without separate building evidence',
  },
  historyDecision: 'hio_campus_established_1994_canonical_year_preserved',
  currentCoordinate,
  candidate: {
    lat: mainReceptionPoint.lat,
    lon: mainReceptionPoint.lon,
    sourceProvider: 'Kartverket / Matrikkelen Adresse REST-API',
    sourceObjectId: mainReceptionPoint.sourceObjectId,
    sourceUrl: addressResponses.find((entry) => entry.number === 46).url,
    objectType: 'campus_main_reception_address_point',
    buildingIdentity: 'Clara Holsts hus, Pilestredet 46',
  },
  displacementMeters,
  mainReceptionBuilding: buildings[0],
  nearestNamedCampusContext: namedContext[0],
  campusAddressSupport,
  maximumCampusSupportDistanceMeters: Number(maximumCampusSupportDistanceMeters.toFixed(1)),
  radiusMethod: {
    basis: 'maximum distance from Pilestredet 46 to verified active OsloMet building address points',
    footprintBufferMeters,
    previousRadiusMeters: Number(place.r),
    suggestedRadiusMeters,
  },
  sourceChecks: {
    officialMainReceptionAddress: true,
    officialMultilingualRangeDiscrepancyDocumented: true,
    officialBuildingAddressSupport: true,
    brregIdentityAndAddress: true,
    geonorgeUniqueMainReceptionPoint: true,
    addressInsideBuildingGeometry: true,
    namedOsloMetContextFound: true,
  },
  recommendation: {
    canBecomeVerified: true,
    coordStatus: 'verified',
    coordType: 'address_point',
    locatorType: 'campus',
    suggestedRadiusMeters,
    nextAction: `Use ${mainReceptionPoint.lat}, ${mainReceptionPoint.lon} as the canonical display marker for OsloMet Pilestredet, set radius ${suggestedRadiusMeters}, preserve year 1994, synchronize coordinate evidence and runtime index, and keep protocol max at 195.`,
  },
};
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# OsloMet Pilestredet coordinate research\n\n- Canonical changed: **no**\n- Norwegian official campus range: **Pilestredet 32–52**\n- English official campus range: **Pilestredet 32–54**\n- Reconciled representation: **multi-building campus, marker at main reception**\n- Main reception: **Clara Holsts hus, Pilestredet 46**\n- Kartverket point: **${mainReceptionPoint.lat}, ${mainReceptionPoint.lon}**\n- Containing OSM building: **${buildings[0].sourceObjectId}**\n- Verified active building addresses: **${supportedCampusNumbers.join(', ')}**\n- Maximum campus support distance: **${maximumCampusSupportDistanceMeters.toFixed(1)} m**\n- Footprint buffer: **${footprintBufferMeters} m**\n- Suggested radius: **${suggestedRadiusMeters} m**\n- Displacement from canonical marker: **${displacementMeters} m**\n- Canonical year 1994 preserved: **yes**\n- Protocol max batch: **${protocolMaxBatch}**\n`, 'utf8');
console.log(JSON.stringify({
  status: 'oslomet_pilestredet_coordinate_research_complete',
  mainReceptionPoint: { lat: mainReceptionPoint.lat, lon: mainReceptionPoint.lon },
  mainReceptionBuilding: buildings[0].sourceObjectId,
  maximumCampusSupportDistanceMeters,
  suggestedRadiusMeters,
  displacementMeters,
  protocolMaxBatch,
}, null, 2));
