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
    newId: 'sofienbergparken', name: 'Sofienbergparken', category: 'by',
    newPlaceRel: 'data/places/by/oslo/sofienbergparken.json', expectedType: 'park',
    searchQuery: 'Sofienbergparken, Oslo, Norway', locatorType: 'park', coordType: 'park_center', r: 220,
    officialSourceName: 'Oslo kommune – Sofienbergparken',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/sofienbergparken/',
  },
  treningssted_torshovdalen: {
    newId: 'torshovdalen', name: 'Torshovdalen', category: 'by',
    newPlaceRel: 'data/places/by/oslo/torshovdalen.json', expectedType: 'park',
    searchQuery: 'Torshovdalen, Oslo, Norway', locatorType: 'park', coordType: 'park_center', r: 260,
    officialSourceName: 'Oslo kommune – Torshovdalen',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/torshovdalen/',
  },
  treningssted_sognsvann: {
    newId: 'sognsvann', name: 'Sognsvann', category: 'natur',
    newPlaceRel: 'data/places/natur/oslo/sognsvann.json', expectedType: 'water',
    searchQuery: 'Sognsvann, Oslo, Norway', locatorType: 'natural_area', coordType: 'lake_center', r: 280,
    officialSourceName: 'Oslo kommune – Sognsvann',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/sognsvann/',
  },
};
const replacements = Object.fromEntries(Object.entries(migrations).map(([oldId, cfg]) => [oldId, cfg.newId]));
const oldIds = new Set(Object.keys(replacements));
const newIds = new Set(Object.values(replacements));

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
function retargetText(text) {
  let out = text;
  for (const [oldId, newId] of Object.entries(replacements)) out = out.split(`\"${oldId}\"`).join(`\"${newId}\"`);
  return out;
}
function retargetFile(file) {
  const before = fs.readFileSync(file, 'utf8');
  const after = retargetText(before);
  if (after !== before) fs.writeFileSync(file, after);
  return after !== before;
}
async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}
function exactObjectFilter(row, cfg) {
  if (normalize(row?.namedetails?.name || row?.name) !== normalize(cfg.name)) return false;
  if (!['way', 'relation'].includes(String(row?.osm_type || '')) || !Number.isFinite(Number(row?.osm_id))) return false;
  if (!['Polygon', 'MultiPolygon'].includes(String(row?.geojson?.type || ''))) return false;
  const lat = Number(row?.lat); const lon = Number(row?.lon);
  if (!(lat > 59.80 && lat < 60.10 && lon > 10.45 && lon < 10.95)) return false;
  if (cfg.expectedType === 'park') return row?.category === 'leisure' && row?.type === 'park';
  const type = String(row?.type || '').toLowerCase();
  const category = String(row?.category || '').toLowerCase();
  return ['water', 'lake', 'reservoir'].includes(type) || category === 'natural';
}
async function resolveGeometry(oldId, cfg) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=' + encodeURIComponent(cfg.searchQuery) + '&limit=20&addressdetails=1&namedetails=1&extratags=1&polygon_geojson=1&countrycodes=no&bounded=1&viewbox=10.45%2C60.10%2C10.95%2C59.80';
  const rows = await fetchJson(url);
  writeJson(path.join(reportDir, `${cfg.newId}-nominatim-search.json`), rows);
  const exact = (Array.isArray(rows) ? rows : []).filter((row) => exactObjectFilter(row, cfg));
  if (exact.length !== 1) throw new Error(`${cfg.newId}: krever ett eksakt navngitt ${cfg.expectedType}-polygon; fant ${exact.length}`);
  const row = exact[0];
  return {
    lat: Number(row.lat), lon: Number(row.lon), geometry: row.geojson,
    sourceObjectId: `osm-${row.osm_type}:${row.osm_id}`,
    sourceUrl: `https://www.openstreetmap.org/${row.osm_type}/${row.osm_id}`,
    sourceLabel: `OpenStreetMap ${row.osm_type} ${row.osm_id} – ${cfg.name}`,
  };
}

// Closed scope decision must still match current migration targets.
const scope = readJson(scopeFile);
for (const [name, oldId, newId] of [
  ['Sofienbergparken', 'sofienbergparken_subkultur', 'sofienbergparken'],
  ['Sognsvann', 'treningssted_sognsvann', 'sognsvann'],
  ['Torshovdalen', 'treningssted_torshovdalen', 'torshovdalen'],
]) {
  const row = scope?.canonicalIdentityMigrations?.[name];
  if (row?.currentId !== oldId || row?.targetId !== newId) throw new Error(`Scope mismatch for ${name}`);
}

const currentRuntime = readJson(runtimeIndexFile);
const currentIds = new Set(currentRuntime.map((place) => place?.id).filter(Boolean));
for (const oldId of oldIds) if (!currentIds.has(oldId)) throw new Error(`Mangler current pseudo-place ${oldId}`);
for (const newId of newIds) if (currentIds.has(newId)) throw new Error(`Canonical target finnes allerede ${newId}`);

const geometry = {};
for (const [oldId, cfg] of Object.entries(migrations)) geometry[oldId] = await resolveGeometry(oldId, cfg);

const subPlaces = readJson(subAggregate);
const sportPlaces = readJson(sportAggregate);
const oldRecords = {
  sofienbergparken_subkultur: subPlaces.find((place) => place?.id === 'sofienbergparken_subkultur'),
  treningssted_torshovdalen: sportPlaces.find((place) => place?.id === 'treningssted_torshovdalen'),
  treningssted_sognsvann: sportPlaces.find((place) => place?.id === 'treningssted_sognsvann'),
};
for (const [id, record] of Object.entries(oldRecords)) if (!record) throw new Error(`Mangler source record ${id}`);

function coord(oldId) {
  const cfg = migrations[oldId]; const g = geometry[oldId];
  return {
    lat: g.lat, lon: g.lon, r: cfg.r, locatorType: cfg.locatorType, sourceProvider: 'osm', sourceObjectId: g.sourceObjectId,
    geocodeAccuracy: 'geometric_center', coordRole: 'area_anchor', coordStatus: 'verified_geometry',
    coordSource: `${g.sourceLabel}; scope cross-checked with ${cfg.officialSourceName}`, coordSourceId: g.sourceObjectId, coordSourceUrl: g.sourceUrl,
    coordType: cfg.coordType, coordVerifiedAt: date, geometry: g.geometry,
  };
}

const sofOld = oldRecords.sofienbergparken_subkultur;
const sof = {
  ...sofOld, id: 'sofienbergparken', name: 'Sofienbergparken', category: 'by',
  rounds: ['people', 'nature', 'badges', 'civication', 'brands', 'leksikon', 'routes', 'music', 'før_nå'],
  desc: 'Stor bypark på Sofienberg som fungerer både som grønt nabolagsrom, leke- og oppholdssted og lavterskel møteplass for ulike miljøer.',
  popupDesc: 'Sofienbergparken er et offentlig parkrom mellom Toftes gate, Helgesens gate, Trondheimsveien og Sofienberggata. Oslo kommune beskriver anlegget som park med blant annet hundepark og barnepark.\n\nI History Go er selve parken den canonical fysiske identiteten. Den tidligere subkultur-ID-en beskrev bruk av samme fysiske sted; ungdomskultur, musikk og uformell offentlighet beholdes derfor som innholdslag og sekundær subkulturkobling, ikke som en overlappende markør.',
  secondaryBadgeIds: Array.from(new Set([...(sofOld.secondaryBadgeIds || []), 'subkultur'])),
  emne_ids: Array.from(new Set([...(sofOld.emne_ids || []), 'em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang'])),
  ...coord('sofienbergparken_subkultur'),
};
sof.coordNote = `Batch 125 canonical migration: Oslo kommune definerer Sofienbergparken som det fysiske parkstedet. Ett eksakt navngitt OSM-parkpolygon (${sof.sourceObjectId}) er valgt etter objekt-type-først-filter. Punktet er area-anchor for parkgeometrien; subkultur beholdes som bruk-/innholdslag.`;
delete sof.coordPrecisionM;

const torOld = oldRecords.treningssted_torshovdalen;
const torshov = {
  ...torOld, id: 'torshovdalen', name: 'Torshovdalen', category: 'by', place_type: 'park',
  rounds: ['people', 'nature', 'badges', 'civication', 'leksikon', 'routes', 'før_nå'],
  desc: 'Langstrakt parkområde mellom Torshov og Sinsen med store gressflater, turveier, utsikt og helårs aktivitet.',
  popupDesc: 'Torshovdalen er et stort parkområde mellom Torshov og Sinsen. Oslo kommune beskriver dalen som et helårs tur- og rekreasjonsområde som strekker seg fra Mailundveien opp mot Sinsen t-banestasjon.\n\nDen tidligere trenings-ID-en beskrev aktivitet i dette større landskapet. I History Go er derfor selve Torshovdalen den canonical identiteten, mens løping, aking, ski og jibbepark er brukslag inne i parken.',
  emne_ids: Array.from(new Set([...(torOld.emne_ids || []), 'em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang'])),
  visual: { designCode: 'park_miniature' }, ...coord('treningssted_torshovdalen'),
};
torshov.coordNote = `Batch 125 canonical migration: Oslo kommune definerer Torshovdalen som hele parkområdet mellom Torshov og Sinsen. Ett eksakt navngitt OSM-parkpolygon (${torshov.sourceObjectId}) er valgt etter objekt-type-først-filter. Punktet er area-anchor for parken; trening og aktivitet er brukslag.`;

const sognOld = oldRecords.treningssted_sognsvann;
const sogn = {
  ...sognOld, id: 'sognsvann', name: 'Sognsvann', category: 'natur', place_type: 'innsjo_og_friluftsomrade',
  rounds: ['nature', 'people', 'badges', 'routes', 'leksikon', 'før_nå'],
  emne_ids: ['em_natur_vatmark_vannspeil_habitat', 'em_natur_naturopplevelse_folkehelse'],
  desc: 'Innsjø og stort friluftsområde ved markagrensa nord i Oslo, med turvei rundt vannet, bading og helårs rekreasjon.',
  popupDesc: 'Sognsvann er en innsjø ved markagrensa nord i Oslo og et stort frilufts- og rekreasjonsområde. Oslo kommune beskriver området rundt vannet som svært mye brukt til tur, løping, bading og vinteraktivitet.\n\nDen tidligere trenings-ID-en gjorde løperunden til hele identiteten. I History Go er derfor selve innsjøen og friluftslandskapet canonical place, mens den 3,3 kilometer lange runden og treningsbruken behandles som aktivitet og ruteinnhold.',
  visual: { designCode: 'waterfront_miniature' }, ...coord('treningssted_sognsvann'),
};
sogn.coordNote = `Batch 125 canonical migration: Oslo kommune og VisitOSLO-scopeauditen identifiserer Sognsvann som selve innsjø-/friluftsstedet. Ett eksakt navngitt OSM-vannpolygon (${sogn.sourceObjectId}) er valgt etter objekttypefilter. Punktet er area-anchor for vannobjektet; treningsrunden er bruk-/ruteinnhold.`;

const outputPlaces = {
  sofienbergparken_subkultur: sof,
  treningssted_torshovdalen: torshov,
  treningssted_sognsvann: sogn,
};
for (const [oldId, cfg] of Object.entries(migrations)) {
  const target = path.join(root, cfg.newPlaceRel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  writeJson(target, outputPlaces[oldId]);
}

// Remove old pseudo-places, then retarget cross-references that live inside the same aggregate files.
writeJson(subAggregate, subPlaces.filter((place) => place?.id !== 'sofienbergparken_subkultur'));
writeJson(sportAggregate, sportPlaces.filter((place) => !['treningssted_torshovdalen', 'treningssted_sognsvann'].includes(place?.id)));
retargetFile(subAggregate);
retargetFile(sportAggregate);

for (const file of [
  path.join(subSplitDir, 'sofienbergparken_subkultur.json'),
  path.join(sportSplitDir, 'treningssted_torshovdalen.json'),
  path.join(sportSplitDir, 'treningssted_sognsvann.json'),
]) {
  if (!fs.existsSync(file)) throw new Error(`Mangler split child ${rel(file)}`);
  fs.unlinkSync(file);
}

function syncSplit(aggregateFile, manifestPath, indexPath, removedIds) {
  const manifest = readJson(manifestPath);
  manifest.places = (manifest.places || []).filter((row) => !removedIds.includes(row?.id));
  manifest.places.forEach((row, index) => { row.order = index; });
  manifest.place_count = manifest.places.length;
  manifest.source_sha256 = sha256File(aggregateFile);
  manifest.generated_at = new Date().toISOString();
  for (const row of manifest.places) row.sha256 = sha256File(path.join(path.dirname(manifestPath), row.file));
  writeJson(manifestPath, manifest);
  writeJson(indexPath, readJson(indexPath).filter((row) => !removedIds.includes(row?.id)));
}
syncSplit(subAggregate, subManifest, subIndex, ['sofienbergparken_subkultur']);
syncSplit(sportAggregate, sportManifest, sportIndex, ['treningssted_torshovdalen', 'treningssted_sognsvann']);

const manifest = readJson(manifestFile);
for (const cfg of Object.values(migrations)) {
  const manifestRel = cfg.newPlaceRel.replace(/^data\//, '');
  if (!manifest.files.includes(manifestRel)) manifest.files.push(manifestRel);
}
writeJson(manifestFile, manifest);

// Remove obsolete Civication top-level mappings for old pseudo-place IDs.
const civicationChanges = [];
for (const file of walkJson(path.join(root, 'data/Civication'))) {
  const before = fs.readFileSync(file, 'utf8');
  if (![...oldIds].some((id) => before.includes(`\"${id}\"`))) continue;
  const payload = JSON.parse(before);
  let changed = false;
  function prune(value) {
    if (Array.isArray(value)) return value.map(prune).filter((item) => item !== undefined);
    if (!value || typeof value !== 'object') return value;
    if (typeof value.historyGoPlaceId === 'string' && oldIds.has(value.historyGoPlaceId)) { changed = true; return undefined; }
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      const next = prune(child);
      if (next !== undefined) out[key] = next;
    }
    return out;
  }
  const next = prune(payload);
  if (changed) { writeJson(file, next); civicationChanges.push(rel(file)); }
}

// Retarget all other active exact references byte-for-byte.
const handled = new Set([
  rel(subAggregate), rel(subManifest), rel(subIndex), rel(sportAggregate), rel(sportManifest), rel(sportIndex), rel(manifestFile),
  ...Object.values(migrations).map((cfg) => cfg.newPlaceRel), ...civicationChanges,
  'data/places/subkultur/oslo/places_subkultur/sofienbergparken_subkultur.json',
  'data/places/sport/europa/norway/places_oslo_lekeplasser_trening/treningssted_torshovdalen.json',
  'data/places/sport/europa/norway/places_oslo_lekeplasser_trening/treningssted_sognsvann.json',
]);
const referenceChanges = [];
for (const file of walkJson(path.join(root, 'data'))) {
  const relative = rel(file);
  if (handled.has(relative) || /(^|\/)(archive|arkiv)(\/|$)/i.test(relative)) continue;
  const before = fs.readFileSync(file, 'utf8');
  if (![...oldIds].some((id) => before.includes(`\"${id}\"`))) continue;
  if (retargetFile(file)) referenceChanges.push(relative);
}

// Replace old evidence with evidence for canonical IDs.
for (const file of walkJson(path.join(root, 'data/coordinate-evidence'))) {
  let payload;
  try { payload = readJson(file); } catch { continue; }
  if (oldIds.has(payload?.placeId)) fs.unlinkSync(file);
}
for (const [oldId, cfg] of Object.entries(migrations)) {
  const place = outputPlaces[oldId]; const g = geometry[oldId];
  const evidencePath = path.join(root, 'data/coordinate-evidence/oslo', cfg.category, `${cfg.newId}.json`);
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  writeJson(evidencePath, {
    schemaVersion: '1.0', placeId: cfg.newId, placeFile: cfg.newPlaceRel, evidenceStatus: 'applied_to_place', coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: place.name, resolvedIdentity: `${place.name} – canonical physical identity replacing ${oldId}`, identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: cfg.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['closed canonical migration scope', 'official physical-place definition', 'one exact named stable polygon'],
    evidence: [
      { sourceProvider: 'manual_research', sourceName: 'VisitOSLO parks/nature canonical scope audit', sourceUrl: 'reports/visitoslo-parks-nature-audit-20260721/SCOPE.md', sourceObjectId: `visitoslo-scope-migration:${oldId}:${cfg.newId}`, sourceQuality: 'closed_canonical_identity_decision', finding: `Scope audit requires ${oldId} → ${cfg.newId}.`, canVerifyCoordinate: false, reason: 'Resolves one-place/one-physical-identity before coordinate selection.' },
      { sourceProvider: 'municipality', sourceName: cfg.officialSourceName, sourceUrl: cfg.officialSourceUrl, sourceObjectId: `oslo-kommune:place:${cfg.newId}`, sourceQuality: 'official_physical_scope_definition', finding: `${cfg.officialSourceName} defines the physical place and public use.`, canVerifyCoordinate: false, reason: 'Defines physical scope before geometry selection.' },
      { sourceProvider: 'osm', sourceName: g.sourceLabel, sourceUrl: g.sourceUrl, sourceObjectId: g.sourceObjectId, sourceQuality: 'exact_named_polygon_after_object_type_filter', finding: 'One exact named polygon in predefined Oslo scope.', canVerifyCoordinate: true, reason: place.coordNote },
    ],
    addressCandidates: [], sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId: g.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: g.sourceObjectId, lat: place.lat, lon: place.lon, coordRole: 'area_anchor', canApplyToPlace: true }],
    coordinateCandidates: [{ sourceProvider: 'osm', sourceObjectId: g.sourceObjectId, lat: place.lat, lon: place.lon, coordRole: 'area_anchor', canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: `Canonical ${cfg.newId} applied; ${oldId} retired.` }, notes: [place.coordNote],
  });
}

let aliasTool = fs.readFileSync(aliasToolFile, 'utf8');
for (const [oldId, newId] of Object.entries(replacements)) {
  if (!aliasTool.includes(`${oldId}: '${newId}'`)) aliasTool = aliasTool.replace(/const aliases: AliasMap = \{([^\n]*)\};/, (_match, body) => `const aliases: AliasMap = {${body}, ${oldId}: '${newId}' };`);
}
writeText(aliasToolFile, aliasTool);

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 125 (2026-07-21)')) {
  const rows = [sof, torshov, sogn].map((place) => `| 125 | \`${place.id}\` | ${place.name} | ${place.coordStatus} | \`${place.sourceObjectId}\` |`).join('\n');
  const paragraph = 'Batch 125 (2026-07-21) gjennomfører den lukkede treveis canonical identity-migreringen fra VisitOSLO parker/natur-scopeauditen: `sofienbergparken_subkultur` → `sofienbergparken`, `treningssted_torshovdalen` → `torshovdalen` og `treningssted_sognsvann` → `sognsvann`. Selve fysiske stedet er canonical identitet; subkultur, trening og aktivitet beholdes som bruk-/innholdslag. Hvert sted bruker ett eksakt navngitt OSM-polygon med riktig objekttype, kryssjekket mot Oslo kommunes stedsbeskrivelse. De gamle pseudo-place-ID-ene fjernes og beskyttes med alias-gaten.';
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 125');
  protocol = protocol.replace(marker, `${rows}\n\n${paragraph}\n\n${marker}`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(), batch,
  migrations: Object.entries(migrations).map(([oldId, cfg]) => ({ oldId, newId: cfg.newId, sourceObjectId: geometry[oldId].sourceObjectId, lat: geometry[oldId].lat, lon: geometry[oldId].lon })),
  referenceChanges, civicationMappingsRemovedFrom: civicationChanges,
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 125 – canonical park/nature identity migrations', '',
  '- `sofienbergparken_subkultur` → `sofienbergparken`',
  '- `treningssted_torshovdalen` → `torshovdalen`',
  '- `treningssted_sognsvann` → `sognsvann`', '',
  'All three migrations were already required by the closed VisitOSLO parks/nature scope audit. Exact named geometry is resolved at production time and old purpose-specific IDs are retired rather than duplicated.',
].join('\n'));

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/check_place_id_aliases.mjs'], { cwd: root, stdio: 'inherit' });

const rebuiltIds = new Set(readJson(runtimeIndexFile).map((place) => place?.id).filter(Boolean));
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
