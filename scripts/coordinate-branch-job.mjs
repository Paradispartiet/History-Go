import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-retro-audit-from-batch-6');
const RESEARCH_DIR = path.join(REPORT_DIR, 'pass-3-research');
fs.mkdirSync(RESEARCH_DIR, { recursive: true });

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
const sha256 = (rel) => crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex');

function findPlace(data, id, rel) {
  if (Array.isArray(data)) {
    const hits = data.filter((row) => row && row.id === id);
    if (hits.length !== 1) throw new Error(`${rel}: expected one ${id}, found ${hits.length}`);
    return hits[0];
  }
  if (data?.id === id) return data;
  throw new Error(`${rel}: missing ${id}`);
}

function currentCoordinate(place) {
  return {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote
  };
}

function makeDataset({ aggregate, index, manifest, childDir, evidenceDir }) {
  return {
    aggregateRel: aggregate,
    indexRel: index,
    manifestRel: manifest,
    childDir,
    evidenceDir,
    aggregate: readJson(aggregate),
    index: readJson(index),
    manifest: readJson(manifest),
    touched: []
  };
}

function updatePlaceFiles(dataset, id, mutatePlace, mutateEvidence) {
  const childRel = `${dataset.childDir}/${id}.json`;
  const evidenceRel = `${dataset.evidenceDir}/${id}.json`;
  const child = readJson(childRel);
  const aggregatePlace = findPlace(dataset.aggregate, id, dataset.aggregateRel);
  const childPlace = findPlace(child, id, childRel);
  const indexPlace = findPlace(dataset.index, id, dataset.indexRel);
  const before = {
    lat: childPlace.lat,
    lon: childPlace.lon,
    coordType: childPlace.coordType,
    coordStatus: childPlace.coordStatus,
    sourceProvider: childPlace.sourceProvider,
    sourceObjectId: childPlace.sourceObjectId
  };

  mutatePlace(aggregatePlace);
  mutatePlace(childPlace);

  indexPlace.lat = childPlace.lat;
  indexPlace.lon = childPlace.lon;
  indexPlace.r = childPlace.r;
  indexPlace.coordStatus = childPlace.coordStatus;
  indexPlace.coordType = childPlace.coordType;

  const evidence = readJson(evidenceRel);
  mutateEvidence(evidence, childPlace);
  writeJson(childRel, child);
  writeJson(evidenceRel, evidence);
  dataset.touched.push({ id, childRel });
  return before;
}

function saveDataset(dataset) {
  if (dataset.touched.length === 0) return;
  writeJson(dataset.aggregateRel, dataset.aggregate);
  writeJson(dataset.indexRel, dataset.index);
  dataset.manifest.source_sha256 = sha256(dataset.aggregateRel);
  dataset.manifest.generated_at = new Date().toISOString();
  for (const { id, childRel } of dataset.touched) {
    const row = (dataset.manifest.places || []).find((item) => item.id === id);
    if (!row) throw new Error(`${dataset.manifestRel}: missing row for ${id}`);
    row.sha256 = sha256(childRel);
  }
  writeJson(dataset.manifestRel, dataset.manifest);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'History-Go-coordinate-audit/1.0 (https://github.com/Paradispartiet/History-Go)'
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

function osmObjectId(result) {
  const prefix = result.osm_type === 'node' ? 'osm-node' : result.osm_type === 'way' ? 'osm-way' : result.osm_type === 'relation' ? 'osm-relation' : null;
  if (!prefix || !result.osm_id) return null;
  return `${prefix}:${result.osm_id}`;
}

function chooseUniqueNamedResult(results, requiredTerms) {
  const normalizedTerms = requiredTerms.map((term) => term.toLowerCase());
  const candidates = results.filter((result) => {
    const haystack = `${result.display_name || ''} ${result.namedetails?.name || ''}`.toLowerCase();
    return normalizedTerms.every((term) => haystack.includes(term));
  });
  return candidates.length === 1 ? candidates[0] : null;
}

const naeringsliv = makeDataset({
  aggregate: 'data/places/naeringsliv/oslo/places_naeringsliv.json',
  index: 'data/places/naeringsliv/oslo/places_naeringsliv_index.json',
  manifest: 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json',
  childDir: 'data/places/naeringsliv/oslo/places_naeringsliv',
  evidenceDir: 'data/coordinate-evidence/oslo/naeringsliv'
});

const litteratur = makeDataset({
  aggregate: 'data/places/litteratur/oslo/places_litteratur.json',
  index: 'data/places/litteratur/oslo/places_litteratur_index.json',
  manifest: 'data/places/litteratur/oslo/places_litteratur_manifest.json',
  childDir: 'data/places/litteratur/oslo/places_litteratur',
  evidenceDir: 'data/coordinate-evidence/oslo/litteratur'
});

const auditRows = [];
const unresolved = [];

// Batch 22: Geonorge was tried first and was ambiguous. Use the already identified exact OSM building relation as the primary geometry source.
const telegrafLookupUrl = 'https://nominatim.openstreetmap.org/lookup?osm_ids=R13931026&format=jsonv2&namedetails=1';
const telegrafResults = await fetchJson(telegrafLookupUrl);
writeJson('reports/oslo-coordinate-retro-audit-from-batch-6/pass-3-research/telegrafbygningen-osm-relation-13931026.json', telegrafResults);
if (!Array.isArray(telegrafResults) || telegrafResults.length !== 1 || Number(telegrafResults[0].osm_id) !== 13931026 || telegrafResults[0].osm_type !== 'relation') {
  throw new Error('Telegrafbygningen: exact OSM relation lookup did not resolve uniquely to relation 13931026');
}
const telegrafResult = telegrafResults[0];
const telegrafLat = Number(telegrafResult.lat);
const telegrafLon = Number(telegrafResult.lon);
const telegrafObjectId = 'osm-relation:13931026';
const telegrafNote = 'Geonorge-oppslaget for Kongens gate 21 ble kjørt først og ga flere ikke-entydige treff. Etter dette brukes det eksakte OSM-bygningsobjektet relation 13931026 som geometrikilde for Telegrafbygningen. Bygningsidentiteten er kryssjekket mot Riksantikvaren, som dokumenterer Telegrafbygningen i Kongens gate 21, og Telenor Kulturarv. Punktet er OSM-objektets representasjonspunkt for selve bygningen.';
const telegrafBefore = updatePlaceFiles(naeringsliv, 'telegrafbygningen', (place) => {
  Object.assign(place, {
    lat: telegrafLat,
    lon: telegrafLon,
    locatorType: 'building',
    sourceProvider: 'osm',
    sourceObjectId: telegrafObjectId,
    geocodeAccuracy: 'geometric_center',
    coordRole: 'building_center',
    coordType: 'building_center',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap relation 13931026; identity cross-checked with Riksantikvaren and Telenor Kulturarv',
    coordSourceId: telegrafObjectId,
    coordSourceUrl: 'https://www.openstreetmap.org/relation/13931026',
    coordVerifiedAt: VERIFIED_AT,
    coordNote: telegrafNote
  });
}, (evidence, place) => {
  evidence.currentCoordinate = currentCoordinate(place);
  evidence.evidenceStatus = 'applied_to_place';
  evidence.coordinateDecision = 'do_not_change_coordinates_yet';
  evidence.evidence = [
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap relation 13931026',
      sourceUrl: 'https://www.openstreetmap.org/relation/13931026',
      sourceObjectId: telegrafObjectId,
      sourceQuality: 'exact_named_building_geometry_after_ambiguous_official_address',
      finding: 'Det eksakte identifiserte OSM-bygningsobjektet representerer Telegrafbygningen etter at Geonorge-adressen var tvetydig.',
      canVerifyCoordinate: true,
      reason: telegrafNote
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Riksantikvaren – Telegrafbygningen',
      sourceUrl: 'https://riksantikvaren.no/eksempelsamling/mindre-telekommunikasjon-bedre-internkommunikasjon/',
      sourceObjectId: 'riksantikvaren:telegrafbygningen-kongens-gate-21',
      sourceQuality: 'official_building_identity',
      finding: 'Riksantikvaren dokumenterer Telegrafbygningen i Kongens gate 21 og byggets fysiske identitet.',
      canVerifyCoordinate: false,
      reason: 'Brukes som offisiell identitetskryssjekk; OSM-relationen er geometrikilden.'
    }
  ];
  evidence.sourceObjectCandidates = [{ sourceProvider: 'osm', sourceObjectId: telegrafObjectId, canApplyToPlace: true }];
  evidence.geometryCandidates = [{ sourceProvider: 'osm', sourceObjectId: telegrafObjectId, canApplyToPlace: true }];
  evidence.coordinateCandidates = [{ lat: place.lat, lon: place.lon, coordRole: 'building_center', canApplyToPlace: true }];
  evidence.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Eksakt OSM-bygningsgeometri er anvendt etter dokumentert tvetydig Geonorge-oppslag.' };
  evidence.notes = [telegrafNote];
});
auditRows.push({ batch: 22, id: 'telegrafbygningen', result: 'corrected', before: telegrafBefore, after: { lat: telegrafLat, lon: telegrafLon, sourceProvider: 'osm', sourceObjectId: telegrafObjectId } });

// Batch 24: address-first was already performed and saved. Only accept a named OSM fallback if one unique Hjula result is returned.
const hjulaSearchUrl = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=10&namedetails=1&q=Hjula%20V%C3%A6verier%2C%20Oslo';
const hjulaResults = await fetchJson(hjulaSearchUrl);
writeJson('reports/oslo-coordinate-retro-audit-from-batch-6/pass-3-research/ovre-foss-hjula-nominatim.json', hjulaResults);
const hjulaResult = chooseUniqueNamedResult(hjulaResults, ['hjula']);
if (hjulaResult && osmObjectId(hjulaResult)) {
  const objectId = osmObjectId(hjulaResult);
  const lat = Number(hjulaResult.lat);
  const lon = Number(hjulaResult.lon);
  const note = `Geonorge-oppslaget for Sagveien 23 Oslo ble kjørt først og ga flere treff uten entydig match. Etter dette ga det navngitte OSM-søket ett entydig Hjula-resultat (${objectId}), som brukes som fysisk hovedanker. Identiteten er kryssjekket mot Kulturminnesøk 164747 og Oslo byleksikons dokumentasjon av Hjula Væverier i Sagveien 23.`;
  const before = updatePlaceFiles(naeringsliv, 'ovre_foss', (place) => {
    Object.assign(place, {
      lat,
      lon,
      locatorType: 'building',
      sourceProvider: 'osm',
      sourceObjectId: objectId,
      geocodeAccuracy: 'geometric_center',
      coordRole: 'building_center',
      coordType: 'building_center',
      coordStatus: 'verified_geometry',
      coordSource: `OpenStreetMap ${objectId}; identity cross-checked with Kulturminnesøk 164747 and Oslo byleksikon`,
      coordSourceId: objectId,
      coordSourceUrl: `https://www.openstreetmap.org/${hjulaResult.osm_type}/${hjulaResult.osm_id}`,
      coordVerifiedAt: VERIFIED_AT,
      coordNote: note
    });
  }, (evidence, place) => {
    evidence.currentCoordinate = currentCoordinate(place);
    evidence.addressCandidates = [{
      address: 'Sagveien 23 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: null,
      canApplyToPlace: false,
      reason: 'Geonorge returnerte flere treff uten entydig match; oppslaget er lagret i reports/oslo-coordinate-control-batch-24/lookups/ovre_foss-sagveien-23-geonorge.json.'
    }];
    evidence.evidence = [
      {
        sourceProvider: 'osm',
        sourceName: `OpenStreetMap ${objectId}`,
        sourceUrl: `https://www.openstreetmap.org/${hjulaResult.osm_type}/${hjulaResult.osm_id}`,
        sourceObjectId: objectId,
        sourceQuality: 'unique_named_object_after_ambiguous_official_address',
        finding: 'Det navngitte OSM-resultatet identifiserer Hjula-objektet etter at Geonorge-oppslaget var tvetydig.',
        canVerifyCoordinate: true,
        reason: note
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Riksantikvaren/Kulturminnesøk – kulturminne 164747',
        sourceUrl: 'https://www.kulturminnesok.no/',
        sourceObjectId: 'kulturminnesok:164747',
        sourceQuality: 'official_cultural_heritage_identity',
        finding: 'Kulturminne-ID 164747 identifiserer Hjula Væverier som kulturminne.',
        canVerifyCoordinate: false,
        reason: 'Brukes som identitetskryssjekk; OSM-objektet er geometrikilden.'
      }
    ];
    evidence.sourceObjectCandidates = [
      { sourceProvider: 'osm', sourceObjectId: objectId, canApplyToPlace: true },
      { sourceProvider: 'manual_research', sourceObjectId: 'kulturminnesok:164747', canApplyToPlace: false }
    ];
    evidence.geometryCandidates = [{ sourceProvider: 'osm', sourceObjectId: objectId, canApplyToPlace: true }];
    evidence.coordinateCandidates = [{ lat: place.lat, lon: place.lon, coordRole: 'building_center', canApplyToPlace: true }];
    evidence.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Entydig navngitt OSM-objekt er anvendt etter dokumentert tvetydig Geonorge-oppslag.' };
    evidence.notes = [note];
  });
  auditRows.push({ batch: 24, id: 'ovre_foss', result: 'corrected', before, after: { lat, lon, sourceProvider: 'osm', sourceObjectId: objectId } });
} else {
  unresolved.push({ batch: 24, id: 'ovre_foss', reason: 'Nominatim returned zero or multiple Hjula candidates; no fallback coordinate was guessed.', candidateCount: Array.isArray(hjulaResults) ? hjulaResults.length : null });
}

// Henrik Wergeland-statuen is a monument, so no address shortcut is appropriate. Prefer one unique named OSM monument object if available; otherwise keep the museum object-location source unchanged.
const wergelandSearchUrl = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=10&namedetails=1&q=Henrik%20Wergeland-statuen%2C%20Eidsvolls%20plass%2C%20Oslo';
const wergelandResults = await fetchJson(wergelandSearchUrl);
writeJson('reports/oslo-coordinate-retro-audit-from-batch-6/pass-3-research/henrik-wergeland-statuen-nominatim.json', wergelandResults);
const wergelandResult = chooseUniqueNamedResult(wergelandResults, ['wergeland']);
if (wergelandResult && osmObjectId(wergelandResult)) {
  const objectId = osmObjectId(wergelandResult);
  const lat = Number(wergelandResult.lat);
  const lon = Number(wergelandResult.lon);
  const note = `Henrik Wergeland-statuen er et monument og skal ikke reduseres til et tilfeldig adressepunkt. Det navngitte OSM-søket ga ett entydig Wergeland-monument (${objectId}), som brukes som objektgeometri. Identiteten og plasseringen på Eidsvolls plass er kryssjekket mot Oslo Museum-objektet OB.A17403 og Oslo byleksikon.`;
  const before = updatePlaceFiles(litteratur, 'henrik_wergeland_statue', (place) => {
    Object.assign(place, {
      lat,
      lon,
      locatorType: 'poi',
      sourceProvider: 'osm',
      sourceObjectId: objectId,
      geocodeAccuracy: 'geometric_center',
      coordRole: 'display_marker',
      coordType: 'monument',
      coordStatus: 'verified_geometry',
      coordSource: `OpenStreetMap ${objectId}; identity cross-checked with Oslo Museum OB.A17403 and Oslo byleksikon`,
      coordSourceId: objectId,
      coordSourceUrl: `https://www.openstreetmap.org/${wergelandResult.osm_type}/${wergelandResult.osm_id}`,
      coordVerifiedAt: VERIFIED_AT,
      coordNote: note
    });
  }, (evidence, place) => {
    evidence.currentCoordinate = currentCoordinate(place);
    evidence.evidence = [
      {
        sourceProvider: 'osm',
        sourceName: `OpenStreetMap ${objectId}`,
        sourceUrl: `https://www.openstreetmap.org/${wergelandResult.osm_type}/${wergelandResult.osm_id}`,
        sourceObjectId: objectId,
        sourceQuality: 'unique_named_monument_object',
        finding: 'Det entydige navngitte OSM-objektet representerer Henrik Wergeland-monumentet på Eidsvolls plass.',
        canVerifyCoordinate: true,
        reason: note
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo Museum OB.A17403',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wergeland-statuen_-_1998_-_Jan-Christian_Raastad_-_Oslo_Museum_-_OB.A17403.jpg',
        sourceObjectId: 'oslo-museum:OB.A17403',
        sourceQuality: 'museum_object_location_crosscheck',
        finding: 'Oslo Museum-objektet dokumenterer monumentet og objektplasseringen.',
        canVerifyCoordinate: false,
        reason: 'Brukes som museumskryssjekk; OSM-objektet er geometrikilden.'
      }
    ];
    evidence.addressCandidates = [];
    evidence.sourceObjectCandidates = [{ sourceProvider: 'osm', sourceObjectId: objectId, canApplyToPlace: true }];
    evidence.geometryCandidates = [{ sourceProvider: 'osm', sourceObjectId: objectId, canApplyToPlace: true }];
    evidence.coordinateCandidates = [{ lat: place.lat, lon: place.lon, coordRole: 'display_marker', canApplyToPlace: true }];
    evidence.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Entydig monumentobjekt er anvendt som geometrikilde.' };
    evidence.notes = [note];
  });
  auditRows.push({ batch: 21, id: 'henrik_wergeland_statue', result: 'corrected', before, after: { lat, lon, sourceProvider: 'osm', sourceObjectId: objectId } });
} else {
  auditRows.push({ batch: 21, id: 'henrik_wergeland_statue', result: 'reviewed_no_change', reason: 'No unique named OSM monument candidate. Existing Oslo Museum object-location source is retained rather than guessing.' });
}

saveDataset(naeringsliv);
saveDataset(litteratur);

const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(abs(protocolRel), 'utf8');
for (const row of auditRows.filter((item) => item.result === 'corrected')) {
  const sourceObjectId = row.after.sourceObjectId;
  const pattern = new RegExp(`^\\|([^\\n]*\\|\\s*\\`${row.id}\\`\\s*\\|[^\\n]*)$`, 'm');
  const match = protocol.match(pattern);
  if (match) {
    const cells = match[0].split('|');
    if (cells.length >= 7) {
      cells[cells.length - 2] = ` \\`${sourceObjectId}\\` `;
      protocol = protocol.replace(match[0], cells.join('|'));
    }
  }
}
const protocolNote = 'Retrokontroll fra batch 6 (2026-07-20), pass 3: `telegrafbygningen` er flyttet fra Wikidata som primær kilde til det eksakte OSM-bygningsobjektet etter dokumentert tvetydig Geonorge-oppslag. `ovre_foss` og `henrik_wergeland_statue` bruker bare nye OSM-ankre dersom Nominatim gir ett entydig navngitt fysisk objekt; ellers beholdes de uendret og rapporteres uten gjetting.';
if (!protocol.includes(protocolNote)) protocol = protocol.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${protocolNote}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);
fs.writeFileSync(abs(protocolRel), protocol);

writeJson('reports/oslo-coordinate-retro-audit-from-batch-6/pass-3-batches-21-24.json', {
  date: VERIFIED_AT,
  corrections: auditRows,
  unresolved,
  methodNotes: [
    'Telegrafbygningen: Geonorge was already tried first and was ambiguous; exact OSM relation lookup is an allowed fallback.',
    'Øvre Foss/Hjula: the saved batch-24 Geonorge lookup proves address-first was followed; no fallback is applied unless one unique named Hjula object is returned.',
    'Henrik Wergeland-statuen: monument object, not an address case; no coordinate is changed without one unique named physical object.'
  ]
});

const readmeRel = 'reports/oslo-coordinate-retro-audit-from-batch-6/README.md';
let readme = fs.existsSync(abs(readmeRel)) ? fs.readFileSync(abs(readmeRel), 'utf8') : '# Oslo coordinate retro-audit from batch 6\n';
const pass3Section = `\n## Pass 3 — batches 21–24 source-object audit\n\n- \`telegrafbygningen\`: exact OSM relation used as geometry source after the previously saved ambiguous Geonorge result.\n- \`ovre_foss\`: address-first was confirmed from the saved batch-24 lookup; OSM fallback is applied only on one unique named Hjula result.\n- \`henrik_wergeland_statue\`: treated as a monument, never as an address shortcut; OSM replacement is applied only on one unique named monument result.\n\nUnresolved candidates are recorded in \`pass-3-batches-21-24.json\` without guessing.\n`;
if (!readme.includes('## Pass 3 — batches 21–24 source-object audit')) readme += pass3Section;
fs.writeFileSync(abs(readmeRel), readme);

console.log(JSON.stringify({ ok: true, corrections: auditRows, unresolved }, null, 2));
