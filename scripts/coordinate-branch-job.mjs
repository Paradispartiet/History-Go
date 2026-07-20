import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-36';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';

const candidates = [
  {
    id: 'sigrid_undset_statue',
    queries: ['Sigrid Undset Stensparken Oslo', 'Sigrid Undset-statuen Oslo'],
    acceptedNames: ['Sigrid Undset', 'Sigrid Undset-statuen', 'Sigrid Undsets skulptur'],
    preferredOsmTypes: ['node'],
    contract: {
      locatorType: 'poi',
      sourceProvider: 'osm',
      geocodeAccuracy: 'geometric_center',
      coordRole: 'display_marker',
      coordType: 'monument_point',
      coordStatus: 'verified_geometry'
    },
    identitySource: {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – Sigrid Undsets skulptur i Stensparken',
      sourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/17-mai/bekransninger/',
      sourceObjectId: 'oslo-kommune:stensparken:sigrid-undset-skulptur',
      finding: 'Oslo kommune dokumenterer den navngitte Sigrid Undset-skulpturen i Stensparken.'
    }
  },
  {
    id: 'inger_hagerups_plass',
    queries: ['Inger Hagerups plass Oslo'],
    acceptedNames: ['Inger Hagerups plass'],
    preferredOsmTypes: ['way', 'relation', 'node'],
    contract: {
      locatorType: 'square',
      sourceProvider: 'osm',
      geocodeAccuracy: 'geometric_center',
      coordRole: 'area_anchor',
      coordType: 'square_area',
      coordStatus: 'verified_geometry'
    },
    identitySource: {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Inger Hagerups plass',
      sourceUrl: 'https://oslobyleksikon.no/side/Inger_Hagerups_plass',
      sourceObjectId: 'oslobyleksikon:inger-hagerups-plass',
      finding: 'Oslo byleksikon identifiserer plassen som snuplassen i enden av Hagapynten ved Haugerud.'
    }
  },
  {
    id: 'hartvig_nissens_skole_skam',
    queries: ['Hartvig Nissens skole Oslo'],
    acceptedNames: ['Hartvig Nissens skole'],
    preferredOsmTypes: ['way', 'relation'],
    contract: {
      locatorType: 'building',
      sourceProvider: 'osm',
      geocodeAccuracy: 'building',
      coordRole: 'building_center',
      coordType: 'osm_building_center',
      coordStatus: 'verified_geometry'
    },
    identitySource: {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Hartvig Nissens skole',
      sourceUrl: 'https://oslobyleksikon.no/side/Hartvig_Nissens_skole',
      sourceObjectId: 'oslobyleksikon:hartvig-nissens-skole',
      finding: "Oslo byleksikon dokumenterer Hartvig Nissens skole i President Harbitz' gate 11 og den historiske skolebygningen."
    }
  },
  {
    id: 'prinds_christian_augusts_minde',
    queries: ['Prinds Christian Augusts Minde Oslo', 'Prindsen Storgata 36 Oslo'],
    acceptedNames: ['Prinds Christian Augusts Minde', 'Prindsen'],
    preferredOsmTypes: ['relation', 'way'],
    contract: {
      locatorType: 'historic_site',
      sourceProvider: 'manual_research',
      geocodeAccuracy: 'geometric_center',
      coordRole: 'area_anchor',
      coordType: 'historic_complex_area',
      coordStatus: 'verified_historical_source'
    },
    identitySource: {
      sourceProvider: 'manual_research',
      sourceName: 'Prindsen – dokumentasjon av Prinds Christian Augusts Minde',
      sourceUrl: 'https://prindsen.no/om-prindsen.html',
      sourceObjectId: 'prindsen:official-documentation',
      finding: 'Prindsen dokumenterer det fredede anlegget i Storgata 36 som et sammensatt fysisk bygningskompleks.'
    }
  }
];

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function sha256Text(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function sha256File(rel) { return sha256Text(fs.readFileSync(abs(rel))); }
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function normalize(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
function resultName(result) {
  return result?.namedetails?.name || String(result?.display_name || '').split(',')[0].trim();
}
function objectId(result) { return `osm-${result.osm_type}:${result.osm_id}`; }
function osmUrl(result) { return `https://www.openstreetmap.org/${result.osm_type}/${result.osm_id}`; }
function currentCoordinate(place) {
  return {
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    coordStatus: place.coordStatus ?? '',
    coordSource: place.coordSource ?? '',
    coordType: place.coordType ?? '',
    coordNote: place.coordNote ?? ''
  };
}
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function nominatimSearch(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '10');
  url.searchParams.set('countrycodes', 'no');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('extratags', '1');
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)',
      'Accept-Language': 'nb,en;q=0.8'
    }
  });
  if (!response.ok) throw new Error(`Nominatim ${response.status} for ${query}`);
  return await response.json();
}

function splitManifestRel(sourceRel) {
  const parsed = path.parse(sourceRel);
  return path.join(parsed.dir, `${parsed.name}_manifest${parsed.ext || '.json'}`).replace(/\\/g, '/');
}
function splitIndexRel(sourceRel) {
  const parsed = path.parse(sourceRel);
  return path.join(parsed.dir, `${parsed.name}_index${parsed.ext || '.json'}`).replace(/\\/g, '/');
}

function findActiveSource(placeId) {
  const manifest = readJson(PLACE_MANIFEST);
  const hits = [];
  for (const entry of manifest.files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    const data = readJson(rel);
    const rows = rowsFrom(data);
    const index = rows.findIndex((row) => row?.id === placeId);
    if (index >= 0) hits.push({ sourceRel: rel, data, rows, index });
  }
  if (hits.length !== 1) throw new Error(`${placeId}: expected one active aggregate source, found ${hits.length}`);
  return hits[0];
}

function writeAggregateHit(hit, updatedPlace) {
  const data = hit.data;
  if (Array.isArray(data)) data[hit.index] = updatedPlace;
  else if (Array.isArray(data.places)) data.places[hit.index] = updatedPlace;
  else if (Array.isArray(data.items)) data.items[hit.index] = updatedPlace;
  else Object.assign(data, updatedPlace);
  writeJson(hit.sourceRel, data);

  const manifestRel = splitManifestRel(hit.sourceRel);
  if (!fs.existsSync(abs(manifestRel))) return;
  const splitManifest = readJson(manifestRel);
  const row = (splitManifest.places || []).find((item) => item?.id === updatedPlace.id);
  if (!row?.file) throw new Error(`${updatedPlace.id}: split manifest exists but child row is missing`);
  const childRel = path.join(path.dirname(manifestRel), row.file).replace(/\\/g, '/');
  writeJson(childRel, updatedPlace);
  row.sha256 = sha256File(childRel);
  if (splitManifest.source_sha256 !== undefined) splitManifest.source_sha256 = sha256File(hit.sourceRel);
  if (splitManifest.generated_at !== undefined) splitManifest.generated_at = new Date().toISOString();
  writeJson(manifestRel, splitManifest);

  const indexRel = splitIndexRel(hit.sourceRel);
  if (fs.existsSync(abs(indexRel))) {
    const indexData = readJson(indexRel);
    const indexRows = rowsFrom(indexData);
    const indexRow = indexRows.find((item) => item?.id === updatedPlace.id);
    if (indexRow) {
      const fields = [
        'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy',
        'coordRole','coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordPrecisionM',
        'coordVerifiedAt','coordNote','geometry','anchors'
      ];
      for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(updatedPlace, field)) indexRow[field] = updatedPlace[field];
        else if (Object.prototype.hasOwnProperty.call(indexRow, field)) delete indexRow[field];
      }
      writeJson(indexRel, indexData);
    }
  }
}

function findEvidence(placeId) {
  const manifest = readJson(EVIDENCE_MANIFEST);
  const matches = [];
  for (const entry of manifest.files || []) {
    const rel = `data/coordinate-evidence/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    const data = readJson(rel);
    if (data?.placeId === placeId) matches.push({ rel, data });
  }
  if (matches.length !== 1) throw new Error(`${placeId}: expected one evidence file, found ${matches.length}`);
  return matches[0];
}

function chooseUniqueResult(config, results) {
  const accepted = new Set(config.acceptedNames.map(normalize));
  const deduped = new Map();
  for (const result of results.flat()) {
    const key = `${result.osm_type}:${result.osm_id}`;
    if (!deduped.has(key)) deduped.set(key, result);
  }
  const exact = [...deduped.values()].filter((result) => accepted.has(normalize(resultName(result))));
  for (const preferredType of config.preferredOsmTypes) {
    const typed = exact.filter((result) => result.osm_type === preferredType);
    if (typed.length === 1) return { selected: typed[0], exact, reason: `unique_exact_${preferredType}` };
    if (typed.length > 1) return { selected: null, exact, reason: `multiple_exact_${preferredType}` };
  }
  return { selected: null, exact, reason: exact.length ? 'no_unique_preferred_object' : 'no_exact_named_object' };
}

function buildNote(config, selected) {
  const name = resultName(selected);
  const oid = objectId(selected);
  if (config.id === 'sigrid_undset_statue') {
    return `Oslo kommune dokumenterer Sigrid Undsets skulptur i Stensparken. Det entydige navngitte OSM-monumentobjektet ${oid} (${name}) brukes som eksakt display-marker for selve skulpturen; adressen til parken brukes ikke som proxy.`;
  }
  if (config.id === 'inger_hagerups_plass') {
    return `Oslo byleksikon identifiserer Inger Hagerups plass som snuplassen i enden av Hagapynten. Det entydige navngitte OSM-objektet ${oid} (${name}) brukes som områdeanker for selve plassen; det tidligere legacy-punktet lå over to kilometer nord for dokumentert stedsidentitet.`;
  }
  if (config.id === 'hartvig_nissens_skole_skam') {
    return `President Harbitz' gate 11 ble tidligere kjørt adresse-first, men ga flere ikke-entydige Geonorge-treff. Oslo byleksikon dokumenterer den historiske skolebygningen, og det entydige navngitte OSM-bygningsobjektet ${oid} (${name}) brukes derfor som tillatt objektgeometri-fallback.`;
  }
  return `Storgata 36 ble tidligere kjørt adresse-first, men ga flere ikke-entydige Geonorge-treff for det sammensatte anlegget. Prindsens egen dokumentasjon avgrenser det fredede bygningskomplekset, og det entydige navngitte OSM-objektet ${oid} (${name}) brukes som geometrisk områdeanker for anlegget, ikke som et vilkårlig husbokstavpunkt.`;
}

function applyCandidate(config, selected) {
  const hit = findActiveSource(config.id);
  const oldPlace = structuredClone(hit.rows[hit.index]);
  const lat = Number(selected.lat);
  const lon = Number(selected.lon);
  const oid = objectId(selected);
  const note = buildNote(config, selected);
  const updated = {
    ...oldPlace,
    lat,
    lon,
    ...config.contract,
    sourceObjectId: config.id === 'prinds_christian_augusts_minde' ? config.identitySource.sourceObjectId : oid,
    coordSource: config.id === 'prinds_christian_augusts_minde'
      ? `${config.identitySource.sourceName}; OpenStreetMap ${oid}`
      : `OpenStreetMap ${oid} – ${resultName(selected)}`,
    coordSourceId: oid,
    coordSourceUrl: osmUrl(selected),
    coordVerifiedAt: VERIFIED_AT,
    coordNote: note
  };
  writeAggregateHit(hit, updated);

  const evidenceHit = findEvidence(config.id);
  const evidence = evidenceHit.data;
  evidence.placeFile = hit.sourceRel;
  evidence.evidenceStatus = 'applied_to_place';
  evidence.coordinateDecision = 'do_not_change_coordinates_yet';
  evidence.currentCoordinate = currentCoordinate(updated);
  evidence.evidence = [
    {
      sourceProvider: config.identitySource.sourceProvider,
      sourceName: config.identitySource.sourceName,
      sourceUrl: config.identitySource.sourceUrl,
      sourceObjectId: config.identitySource.sourceObjectId,
      sourceQuality: 'documented_identity_or_site_definition',
      finding: config.identitySource.finding,
      canVerifyCoordinate: config.id === 'prinds_christian_augusts_minde',
      reason: note
    },
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap ${oid} – ${resultName(selected)}`,
      sourceUrl: osmUrl(selected),
      sourceObjectId: oid,
      sourceQuality: 'unique_exact_named_object_geometry',
      finding: `Nominatim returned one accepted exact named ${selected.osm_type} object for the physical place after object-type filtering.`,
      canVerifyCoordinate: true,
      reason: note
    }
  ];
  evidence.addressCandidates = evidence.addressCandidates || [];
  evidence.sourceObjectCandidates = [{ sourceProvider: 'osm', sourceObjectId: oid, canApplyToPlace: true }];
  evidence.geometryCandidates = [{ sourceProvider: 'osm', sourceObjectId: oid, canApplyToPlace: true }];
  evidence.coordinateCandidates = [{ lat, lon, coordRole: config.contract.coordRole, canApplyToPlace: true }];
  evidence.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Entydig objektgeometri er anvendt på canonical place.' };
  evidence.notes = [note];
  writeJson(evidenceHit.rel, evidence);

  return {
    id: config.id,
    result: 'applied',
    before: currentCoordinate(oldPlace),
    after: currentCoordinate(updated),
    sourceObjectId: updated.sourceObjectId,
    geometryObjectId: oid,
    sourceFile: hit.sourceRel
  };
}

function updateProtocol(applied) {
  if (!applied.length) return;
  const rel = 'docs/coordinates/coordinate-control-protocol.md';
  let text = fs.readFileSync(abs(rel), 'utf8');
  const rows = applied.map((item) => {
    const hit = findActiveSource(item.id);
    const place = hit.rows[hit.index];
    return `| 36 | \`${place.id}\` | ${place.name} | ${place.coordStatus} | \`${place.sourceObjectId}\` |`;
  }).join('\n');
  const anchor = '| 35 | `akerselva_utlop_bjorvika` | Akerselvas utløp mot fjorden (Bjørvika) | verified_geometry | `osm-way:246047712` |';
  if (!text.includes('| 36 |')) text = text.replace(anchor, `${anchor}\n${rows}`);
  for (const item of applied) {
    text = text.split('\n').filter((line) => !line.includes(`| \`${item.id}\` –`)).join('\n');
  }
  const note = `Batch 36 (2026-07-20) gjenåpner konkrete needs_review-saker med objekt-type-først-metoden. Bare kandidater med ett entydig navngitt OSM-objekt etter dokumentert adresse-/identitetskontroll promoteres; øvrige kandidater forblir uendret.`;
  if (!text.includes(note)) text = text.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${note}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);
  fs.writeFileSync(abs(rel), text);
}

async function main() {
  fs.mkdirSync(abs(`${REPORT_DIR}/nominatim-results`), { recursive: true });
  const outcomes = [];

  for (const config of candidates) {
    const queryResults = [];
    for (const query of config.queries) {
      const results = await nominatimSearch(query);
      queryResults.push(results);
      writeJson(`${REPORT_DIR}/nominatim-results/${config.id}-${normalize(query).replace(/ /g, '-')}.json`, { query, results });
      await delay(1100);
    }
    const choice = chooseUniqueResult(config, queryResults);
    if (choice.selected) {
      outcomes.push(applyCandidate(config, choice.selected));
    } else {
      outcomes.push({
        id: config.id,
        result: 'unchanged_needs_review',
        reason: choice.reason,
        exactCandidates: choice.exact.map((result) => ({
          name: resultName(result),
          osm_type: result.osm_type,
          osm_id: result.osm_id,
          lat: result.lat,
          lon: result.lon,
          display_name: result.display_name
        }))
      });
    }
  }

  const applied = outcomes.filter((item) => item.result === 'applied');
  updateProtocol(applied);

  writeJson(`${REPORT_DIR}/batch-36-results.json`, {
    date: VERIFIED_AT,
    method: 'object-type-first; address-first history preserved; exact named OSM geometry only when one preferred physical object is unambiguous',
    outcomes
  });

  const readme = `# Oslo koordinatkontroll – batch 36\n\nDato: ${VERIFIED_AT}\n\nBatchen gjenåpner fire konkrete needs_review-saker. Adressepunkter brukes ikke som proxy når recorden representerer et monument, en plass, et skolebygg eller et sammensatt historisk anlegg.\n\n${outcomes.map((item) => item.result === 'applied'
    ? `- \`${item.id}\` → **applied** via ${item.geometryObjectId}; canonical kildekontrakt og evidens er oppdatert.`
    : `- \`${item.id}\` → **needs_review beholdt** (${item.reason}); ingen koordinat er gjettet.`).join('\n')}\n\nAlle Nominatim-svar er lagret i \`nominatim-results/\` i samme kjøring. Bare ett entydig navngitt fysisk objekt etter objekttypefiltrering kan bli anvendt.\n`;
  fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), readme);

  console.log(JSON.stringify({ ok: true, outcomes }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
