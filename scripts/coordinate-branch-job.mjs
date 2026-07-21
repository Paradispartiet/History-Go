#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 125;
const date = '2026-07-21';
const manifestFile = path.join(root, 'data/places/manifest.json');
const runtimeIndexFile = path.join(root, 'data/places/places_index.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const aliasToolFile = path.join(root, 'tools/check_place_id_aliases.mts');
const scopeFile = path.join(root, 'reports/visitoslo-parks-nature-audit-20260721/scope.json');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-125-canonical-park-nature-migrations');
fs.mkdirSync(reportDir, { recursive: true });

const migrations = {
  sofienbergparken_subkultur: {
    newId: 'sofienbergparken',
    name: 'Sofienbergparken',
    category: 'by',
    newPlaceRel: 'data/places/by/oslo/sofienbergparken.json',
    officialSourceName: 'Oslo kommune – Sofienbergparken',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/sofienbergparken/',
    expectedType: 'park',
    searchQuery: 'Sofienbergparken, Oslo, Norway',
    locatorType: 'park',
    coordType: 'park_center',
    r: 220,
  },
  treningssted_torshovdalen: {
    newId: 'torshovdalen',
    name: 'Torshovdalen',
    category: 'by',
    newPlaceRel: 'data/places/by/oslo/torshovdalen.json',
    officialSourceName: 'Oslo kommune – Torshovdalen',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/torshovdalen/',
    expectedType: 'park',
    searchQuery: 'Torshovdalen, Oslo, Norway',
    locatorType: 'park',
    coordType: 'park_center',
    r: 260,
  },
  treningssted_sognsvann: {
    newId: 'sognsvann',
    name: 'Sognsvann',
    category: 'natur',
    newPlaceRel: 'data/places/natur/oslo/sognsvann.json',
    officialSourceName: 'Oslo kommune – Sognsvann',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/sognsvann/',
    expectedType: 'water',
    searchQuery: 'Sognsvann, Oslo, Norway',
    locatorType: 'natural_area',
    coordType: 'lake_center',
    r: 280,
  },
};
const oldIds = new Set(Object.keys(migrations));
const newIds = new Set(Object.values(migrations).map((item) => item.newId));

const subRoot = path.join(root, 'data/places/subkultur/oslo');
const subAggregate = path.join(subRoot, 'places_subkultur.json');
const subSplitDir = path.join(subRoot, 'places_subkultur');
const subManifest = path.join(subRoot, 'places_subkultur_manifest.json');
const subIndex = path.join(subRoot, 'places_subkultur_index.json');

const sportRoot = path.join(root, 'data/places/sport/europa/norway');
const sportAggregate = path.join(sportRoot, 'places_oslo_lekeplasser_trening.json');
const sportSplitDir = path.join(sportRoot, 'places_oslo_lekeplasser_trening');
const sportManifest = path.join(sportRoot, 'places_oslo_lekeplasser_trening_manifest.json');
const sportIndex = path.join(sportRoot, 'places_oslo_lekeplasser_trening_index.json');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const rel = (file) => path.relative(root, file).replace(/\\/g, '/');
const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

function walkJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkJson(full);
    return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
  });
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

function exactObjectFilter(row, migration) {
  const name = normalize(row?.namedetails?.name || row?.name);
  if (name !== normalize(migration.name)) return false;
  if (!['way', 'relation'].includes(String(row?.osm_type || ''))) return false;
  if (!Number.isFinite(Number(row?.osm_id))) return false;
  if (!['Polygon', 'MultiPolygon'].includes(String(row?.geojson?.type || ''))) return false;
  const lat = Number(row?.lat); const lon = Number(row?.lon);
  if (!(lat > 59.80 && lat < 60.10 && lon > 10.45 && lon < 10.95)) return false;
  if (migration.expectedType === 'park') return row?.category === 'leisure' && row?.type === 'park';
  if (migration.expectedType === 'water') {
    const type = String(row?.type || '').toLowerCase();
    const category = String(row?.category || '').toLowerCase();
    return ['water', 'lake', 'reservoir'].includes(type) || category === 'natural';
  }
  return false;
}

async function resolveGeometry(oldId, migration) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=' + encodeURIComponent(migration.searchQuery) + '&limit=20&addressdetails=1&namedetails=1&extratags=1&polygon_geojson=1&countrycodes=no&bounded=1&viewbox=10.45%2C60.10%2C10.95%2C59.80';
  const rows = await fetchJson(url);
  writeJson(path.join(reportDir, `${migration.newId}-nominatim-search.json`), rows);
  const exact = (Array.isArray(rows) ? rows : []).filter((row) => exactObjectFilter(row, migration));
  if (exact.length !== 1) throw new Error(`${migration.newId}: krever ett eksakt navngitt ${migration.expectedType}-objekt; fant ${exact.length}`);
  const row = exact[0];
  const sourceObjectId = `osm-${row.osm_type}:${row.osm_id}`;
  return {
    lat: Number(row.lat),
    lon: Number(row.lon),
    geometry: row.geojson,
    sourceObjectId,
    sourceUrl: `https://www.openstreetmap.org/${row.osm_type}/${row.osm_id}`,
    sourceLabel: `OpenStreetMap ${row.osm_type} ${row.osm_id} – ${migration.name}`,
  };
}

// Scope gate: this is the already-approved three-way canonical migration, not new duplicate production.
const scope = readJson(scopeFile);
const expectedScope = {
  Sofienbergparken: ['sofienbergparken_subkultur', 'sofienbergparken'],
  Sognsvann: ['treningssted_sognsvann', 'sognsvann'],
  Torshovdalen: ['treningssted_torshovdalen', 'torshovdalen'],
};
for (const [name, [currentId, targetId]] of Object.entries(expectedScope)) {
  const row = scope?.canonicalIdentityMigrations?.[name];
  if (row?.currentId !== currentId || row?.targetId !== targetId) throw new Error(`Scope mismatch for ${name}`);
}

const currentRuntime = readJson(runtimeIndexFile);
const currentIds = new Set(currentRuntime.map((place) => place?.id).filter(Boolean));
for (const oldId of oldIds) if (!currentIds.has(oldId)) throw new Error(`Mangler current pseudo-place ${oldId}`);
for (const newId of newIds) if (currentIds.has(newId)) throw new Error(`Target canonical ID finnes allerede: ${newId}`);

const geometryByOldId = {};
for (const [oldId, migration] of Object.entries(migrations)) geometryByOldId[oldId] = await resolveGeometry(oldId, migration);

// Read old records before removal.
const subPlaces = readJson(subAggregate);
const sportPlaces = readJson(sportAggregate);
const oldRecords = {
  sofienbergparken_subkultur: subPlaces.find((place) => place?.id === 'sofienbergparken_subkultur'),
  treningssted_torshovdalen: sportPlaces.find((place) => place?.id === 'treningssted_torshovdalen'),
  treningssted_sognsvann: sportPlaces.find((place) => place?.id === 'treningssted_sognsvann'),
};
for (const [id, record] of Object.entries(oldRecords)) if (!record) throw new Error(`Mangler source record ${id}`);

function coordinateFields(oldId, migration) {
  const geometry = geometryByOldId[oldId];
  return {
    lat: geometry.lat,
    lon: geometry.lon,
    r: migration.r,
    locatorType: migration.locatorType,
    sourceProvider: 'osm',
    sourceObjectId: geometry.sourceObjectId,
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: geometry.sourceLabel + `; scope cross-checked with ${migration.officialSourceName}`,
    coordSourceId: geometry.sourceObjectId,
    coordSourceUrl: geometry.sourceUrl,
    coordType: migration.coordType,
    coordVerifiedAt: date,
    geometry: geometry.geometry,
  };
}

const sofOld = oldRecords.sofienbergparken_subkultur;
const sof = {
  ...sofOld,
  id: 'sofienbergparken',
  name: 'Sofienbergparken',
  category: 'by',
  rounds: ['people', 'nature', 'badges', 'civication', 'brands', 'leksikon', 'routes', 'music', 'før_nå'],
  desc: 'Stor bypark på Sofienberg som fungerer både som grønt nabolagsrom, leke- og oppholdssted og lavterskel møteplass for ulike miljøer.',
  popupDesc: 'Sofienbergparken er et sammenhengende offentlig parkrom mellom Toftes gate, Helgesens gate, Trondheimsveien og Sofienberggata. Oslo kommune beskriver parken som et større anlegg som også rommer hundepark og barnepark, og den deles av Rathkes gate ved Sofienberg kirke og den jødiske gravlunden.\n\nI History Go er selve parken den canonical fysiske identiteten. Den tidligere `sofienbergparken_subkultur`-markøren blir derfor ikke stående som et eget overlappende sted: ungdomskultur, musikk, uformell offentlighet og subkulturelle miljøer beholdes som innholdslag på `sofienbergparken`. Det gjør parkens sosiale bruk synlig uten å late som subkulturen er et annet fysisk sted enn parken.',
  secondaryBadgeIds: Array.from(new Set([...(sofOld.secondaryBadgeIds || []), 'subkultur'])),
  emne_ids: Array.from(new Set([...(sofOld.emne_ids || []), 'em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang'])),
  ...coordinateFields('sofienbergparken_subkultur', migrations.sofienbergparken_subkultur),
};
sof.coordNote = `Batch 125 canonical migration: Oslo kommune definerer Sofienbergparken som det fysiske parkstedet, mens den tidligere subkultur-ID-en beskrev en bruk av det samme stedet. Ett eksakt navngitt OSM-parkpolygon (${sof.sourceObjectId}) er valgt etter objekt-type-først-filter. Nominatims representasjonspunkt brukes som area-anchor for parkgeometrien; subkultur beholdes som innhold/sekundærbadge, ikke som overlappende place.`;
delete sof.coordPrecisionM;
delete sof.year;

const torOld = oldRecords.treningssted_torshovdalen;
const torshov = {
  ...torOld,
  id: 'torshovdalen',
  name: 'Torshovdalen',
  category: 'by',
  place_type: 'park',
  rounds: ['people', 'nature', 'badges', 'civication', 'leksikon', 'routes', 'før_nå'],
  desc: 'Langstrakt parkområde mellom Torshov og Sinsen med store gressflater, turveier, utsikt, vinteraktivitet og plass til både rolig opphold og trening.',
  popupDesc: 'Torshovdalen er et stort, langstrakt parkområde mellom Torshov og Sinsen. Oslo kommune beskriver dalen som et helårs tur- og rekreasjonsområde med gressletter, trær, asfalterte veier, utsikt og vinteraktiviteter. Parken strekker seg fra Mailundveien nederst og opp mot Sinsen t-banestasjon.\n\nDen tidligere `treningssted_torshovdalen`-markøren beskrev trening og aktivitet i dette større landskapet. I History Go er derfor `torshovdalen` den canonical fysiske identiteten, mens treningsløp, aking, ski og jibbepark behandles som brukslag og aktiviteter inne i parken.',
  emne_ids: Array.from(new Set([...(torOld.emne_ids || []), 'em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang'])),
  visual: { designCode: 'park_miniature' },
  ...coordinateFields('treningssted_torshovdalen', migrations.treningssted_torshovdalen),
};
torshov.coordNote = `Batch 125 canonical migration: Oslo kommune definerer Torshovdalen som hele parkområdet mellom Torshov og Sinsen. Ett eksakt navngitt OSM-parkpolygon (${torshov.sourceObjectId}) er valgt etter objekt-type-først-filter. Punktet er area-anchor for parken; den tidligere trenings-ID-en blir et brukslag, ikke et eget overlappende sted.`;

const sognOld = oldRecords.treningssted_sognsvann;
const sogn = {
  ...sognOld,
  id: 'sognsvann',
  name: 'Sognsvann',
  category: 'natur',
  place_type: 'innsjo_og_friluftsomrade',
  rounds: ['nature', 'people', 'badges', 'routes', 'leksikon', 'før_nå'],
  emne_ids: ['em_natur_vatmark_vannspeil_habitat', 'em_natur_naturopplevelse_folkehelse'],
  desc: 'Innsjø og stort friluftsområde ved markagrensa nord i Oslo, med turvei rundt vannet, bading, vinteraktivitet og en av byens mest brukte innganger til Oslomarka.',
  popupDesc: 'Sognsvann er en innsjø ved markagrensa nord i Oslo og et stort frilufts- og rekreasjonsområde gjennom hele året. Oslo kommune beskriver området rundt vannet som et svært populært turområde der folk går og løper rundt den 3,3 kilometer lange runden, bader, bruker åpne sletter og driver vinteraktiviteter.\n\nDen tidligere `treningssted_sognsvann`-markøren gjorde én bruk av stedet – treningsrunden – til hele identiteten. I History Go er derfor `sognsvann` den canonical fysiske identiteten for innsjøen og friluftslandskapet, mens løperunden og treningsbruken behandles som aktivitet og ruteinnhold under stedet.',
  visual: { designCode: 'waterfront_miniature' },
  ...coordinateFields('treningssted_sognsvann', migrations.treningssted_sognsvann),
};
sogn.coordNote = `Batch 125 canonical migration: Oslo kommune og VisitOSLO-scopeauditen identifiserer Sognsvann som selve innsjø-/friluftsstedet, ikke bare treningsrunden. Ett eksakt navngitt OSM-vannpolygon (${sogn.sourceObjectId}) er valgt etter objekttypefilter. Nominatims representasjonspunkt brukes som area-anchor for vannobjektet; treningsrunden beholdes som bruk-/ruteinnhold, ikke som eget place.`;

for (const [oldId, migration] of Object.entries(migrations)) {
  const place = oldId === 'sofienbergparken_subkultur' ? sof : oldId === 'treningssted_torshovdalen' ? torshov : sogn;
  const target = path.join(root, migration.newPlaceRel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  writeJson(target, place);
}

// Remove old pseudo-places from their source aggregates and split artifacts.
writeJson(subAggregate, subPlaces.filter((place) => place?.id !== 'sofienbergparken_subkultur'));
writeJson(sportAggregate, sportPlaces.filter((place) => !['treningssted_torshovdalen', 'treningssted_sognsvann'].includes(place?.id)));
for (const file of [
  path.join(subSplitDir, 'sofienbergparken_subkultur.json'),
  path.join(sportSplitDir, 'treningssted_torshovdalen.json'),
  path.join(sportSplitDir, 'treningssted_sognsvann.json'),
]) {
  if (!fs.existsSync(file)) throw new Error(`Mangler split child ${rel(file)}`);
  fs.unlinkSync(file);
}

function syncSplit(aggregateFile, manifestPath, indexPath, splitBaseDir, removedIds) {
  const manifest = readJson(manifestPath);
  manifest.places = (manifest.places || []).filter((row) => !removedIds.includes(row?.id));
  manifest.places.forEach((row, index) => { row.order = index; });
  manifest.place_count = manifest.places.length;
  manifest.source_sha256 = sha256File(aggregateFile);
  manifest.generated_at = new Date().toISOString();
  for (const row of manifest.places) row.sha256 = sha256File(path.join(path.dirname(manifestPath), row.file));
  writeJson(manifestPath, manifest);
  const index = readJson(indexPath);
  writeJson(indexPath, index.filter((row) => !removedIds.includes(row?.id)));
}
syncSplit(subAggregate, subManifest, subIndex, subSplitDir, ['sofienbergparken_subkultur']);
syncSplit(sportAggregate, sportManifest, sportIndex, sportSplitDir, ['treningssted_torshovdalen', 'treningssted_sognsvann']);

// Register all three standalone canonical files.
const manifest = readJson(manifestFile);
for (const migration of Object.values(migrations)) {
  const manifestRel = migration.newPlaceRel.replace(/^data\//, '');
  if (!manifest.files.includes(manifestRel)) manifest.files.push(manifestRel);
}
writeJson(manifestFile, manifest);

// Remove old Civication top-level mappings. New canonical category mappings can be produced by their own mapping pipeline.
const civiChanges = [];
for (const file of walkJson(path.join(root, 'data/Civication'))) {
  const before = fs.readFileSync(file, 'utf8');
  if (![...oldIds].some((id) => before.includes(`\"${id}\"`))) continue;
  const payload = JSON.parse(before);
  let changed = false;
  function prune(value) {
    if (Array.isArray(value)) return value.map(prune).filter((item) => item !== undefined);
    if (!value || typeof value !== 'object') return value;
    if (typeof value.historyGoPlaceId === 'string' && oldIds.has(value.historyGoPlaceId)) {
      changed = true;
      return undefined;
    }
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      const next = prune(child);
      if (next !== undefined) out[key] = next;
    }
    return out;
  }
  const next = prune(payload);
  if (changed) {
    writeJson(file, next);
    civiChanges.push(rel(file));
  }
}

// Retarget every other exact active reference byte-for-byte. This preserves translations and content wording while changing only identity IDs.
const replacements = Object.fromEntries(Object.entries(migrations).map(([oldId, migration]) => [oldId, migration.newId]));
const structurallyHandled = new Set([
  rel(subAggregate), rel(subManifest), rel(subIndex), rel(sportAggregate), rel(sportManifest), rel(sportIndex), rel(manifestFile),
  ...Object.values(migrations).map((migration) => migration.newPlaceRel),
  ...civiChanges,
  'data/places/subkultur/oslo/places_subkultur/sofienbergparken_subkultur.json',
  'data/places/sport/europa/norway/places_oslo_lekeplasser_trening/treningssted_torshovdalen.json',
  'data/places/sport/europa/norway/places_oslo_lekeplasser_trening/treningssted_sognsvann.json',
]);
const referenceChanges = [];
for (const file of walkJson(path.join(root, 'data'))) {
  const relative = rel(file);
  if (structurallyHandled.has(relative) || /(^|\/)(archive|arkiv)(\/|$)/i.test(relative)) continue;
  const before = fs.readFileSync(file, 'utf8');
  if (![...oldIds].some((id) => before.includes(`\"${id}\"`))) continue;
  let after = before;
  for (const [oldId, newId] of Object.entries(replacements)) after = after.split(`\"${oldId}\"`).join(`\"${newId}\"`);
  if (after !== before) {
    fs.writeFileSync(file, after);
    referenceChanges.push(relative);
  }
}

// Remove old evidence files and create new evidence for the canonical identities.
for (const file of walkJson(path.join(root, 'data/coordinate-evidence'))) {
  let payload;
  try { payload = readJson(file); } catch { continue; }
  if (oldIds.has(payload?.placeId)) fs.unlinkSync(file);
}
for (const [oldId, migration] of Object.entries(migrations)) {
  const place = oldId === 'sofienbergparken_subkultur' ? sof : oldId === 'treningssted_torshovdalen' ? torshov : sogn;
  const geometry = geometryByOldId[oldId];
  const evidencePath = path.join(root, 'data/coordinate-evidence/oslo', migration.category, `${migration.newId}.json`);
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  writeJson(evidencePath, {
    schemaVersion: '1.0',
    placeId: migration.newId,
    placeFile: migration.newPlaceRel,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: place.name, resolvedIdentity: `${place.name} – canonical physical identity replacing ${oldId}`, identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: migration.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['approved canonical migration scope', 'official physical-place definition', 'one exact named stable geometry object'],
    evidence: [
      { sourceProvider: 'manual_research', sourceName: 'VisitOSLO parks/nature canonical scope audit', sourceUrl: 'reports/visitoslo-parks-nature-audit-20260721/SCOPE.md', sourceObjectId: `visitoslo-scope-migration:${oldId}:${migration.newId}`, sourceQuality: 'closed_canonical_identity_decision', finding: `Scope audit requires ${oldId} → ${migration.newId} instead of duplicate place production.`, canVerifyCoordinate: false, reason: 'Resolves one-place/one-physical-identity before coordinate selection.' },
      { sourceProvider: 'municipality', sourceName: migration.officialSourceName, sourceUrl: migration.officialSourceUrl, sourceObjectId: `oslo-kommune:place:${migration.newId}`, sourceQuality: 'official_physical_scope_definition', finding: `${migration.officialSourceName} defines the canonical physical place and its public use.`, canVerifyCoordinate: false, reason: 'Defines physical scope and separates use layers from place identity.' },
      { sourceProvider: 'osm', sourceName: geometry.sourceLabel, sourceUrl: geometry.sourceUrl, sourceObjectId: geometry.sourceObjectId, sourceQuality: 'exact_named_polygon_after_object_type_filter', finding: 'One exact named polygon object in predefined Oslo scope.', canVerifyCoordinate: true, reason: place.coordNote },
    ],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId: geometry.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: geometry.sourceObjectId, lat: place.lat, lon: place.lon, coordRole: 'area_anchor', canApplyToPlace: true }],
    coordinateCandidates: [{ sourceProvider: 'osm', sourceObjectId: geometry.sourceObjectId, lat: place.lat, lon: place.lon, coordRole: 'area_anchor', canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: `Canonical identity ${migration.newId} is applied and old pseudo-place ${oldId} is retired.` },
    notes: [place.coordNote],
  });
}

// Make all three migrations enforceable as legacy aliases.
let aliasTool = fs.readFileSync(aliasToolFile, 'utf8');
for (const [oldId, newId] of Object.entries(replacements)) {
  if (!aliasTool.includes(`${oldId}: '${newId}'`)) {
    aliasTool = aliasTool.replace(/const aliases: AliasMap = \{([^\n]*)\};/, (_match, body) => `const aliases: AliasMap = {${body}, ${oldId}: '${newId}' };`);
  }
}
writeText(aliasToolFile, aliasTool);

// Protocol rows and explicit migration note.
let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 125 (2026-07-21)')) {
  const rows = [sof, torshov, sogn].map((place) => `| 125 | \`${place.id}\` | ${place.name} | ${place.coordStatus} | \`${place.sourceObjectId}\` |`).join('\n');
  const paragraph = 'Batch 125 (2026-07-21) gjennomfører den treveis canonical identity-migreringen som allerede er lukket i VisitOSLO parker/natur-scopeauditen: `sofienbergparken_subkultur` → `sofienbergparken`, `treningssted_torshovdalen` → `torshovdalen` og `treningssted_sognsvann` → `sognsvann`. For alle tre velges selve det fysiske stedet som canonical identitet; subkultur, trening og aktivitet beholdes som innhold-/brukslag. Hvert sted krever ett eksakt navngitt OSM-polygon med riktig objekttype i forhåndsdefinert Oslo-scope, kryssjekket mot Oslo kommunes fysiske stedsbeskrivelse. De gamle pseudo-place-ID-ene fjernes fra aktive place-kilder og beskyttes med alias-gaten; ingen overlappende nye markører opprettes.';
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 125');
  protocol = protocol.replace(marker, `${rows}\n\n${paragraph}\n\n${marker}`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  migrations: Object.entries(migrations).map(([oldId, migration]) => ({ oldId, newId: migration.newId, sourceObjectId: geometryByOldId[oldId].sourceObjectId, lat: geometryByOldId[oldId].lat, lon: geometryByOldId[oldId].lon })),
  referenceChanges,
  civicationMappingsRemovedFrom: civiChanges,
  remainingLegacyIds: [],
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 125 – canonical park/nature identity migrations', '',
  '- `sofienbergparken_subkultur` → `sofienbergparken`',
  '- `treningssted_torshovdalen` → `torshovdalen`',
  '- `treningssted_sognsvann` → `sognsvann`', '',
  'All three migrations were already required by the closed VisitOSLO parks/nature scope audit. Exact named geometry is resolved at production time, and old purpose-specific IDs are retired rather than duplicated.',
].join('\n'));

// Rebuild and enforce migration integrity before standard coordinate gates.
execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/check_place_id_aliases.mjs'], { cwd: root, stdio: 'inherit' });

const rebuilt = readJson(runtimeIndexFile);
const rebuiltIds = new Set(rebuilt.map((place) => place?.id).filter(Boolean));
for (const oldId of oldIds) if (rebuiltIds.has(oldId)) throw new Error(`Runtime inneholder fortsatt legacy ${oldId}`);
for (const newId of newIds) if (!rebuiltIds.has(newId)) throw new Error(`Runtime mangler canonical ${newId}`);

const residuals = [];
for (const file of walkJson(path.join(root, 'data'))) {
  const relative = rel(file);
  if (/(^|\/)(archive|arkiv)(\/|$)/i.test(relative)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const oldId of oldIds) if (text.includes(`\"${oldId}\"`)) residuals.push({ file: relative, oldId });
}
if (residuals.length) throw new Error(`Legacy-ID-er står igjen i aktiv data: ${JSON.stringify(residuals.slice(0, 100))}`);

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (changedFiles.length > 85) throw new Error(`Batch 125 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, migrations: Object.entries(replacements), changedFileCount: changedFiles.length }, null, 2));
