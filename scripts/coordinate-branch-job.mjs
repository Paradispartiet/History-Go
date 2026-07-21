#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 127;
const date = '2026-07-21';
const oldId = 'lekeplass_snippen';
const newId = 'snippen_lekepark';
const expectedSourceObjectId = 'osm-way:761333023';
const officialSourceName = 'Oslo kommune – Snippen lekepark';
const officialSourceUrl = 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/snippen-lekepark/';
const newPlaceRel = 'data/places/by/oslo/snippen_lekepark.json';
const newPlaceFile = path.join(root, newPlaceRel);
const sourceFile = path.join(root, 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json');
const sourceDir = path.dirname(sourceFile);
const splitDir = path.join(sourceDir, 'places_oslo_lekeplasser_trening');
const splitManifestFile = path.join(sourceDir, 'places_oslo_lekeplasser_trening_manifest.json');
const splitIndexFile = path.join(sourceDir, 'places_oslo_lekeplasser_trening_index.json');
const manifestFile = path.join(root, 'data/places/manifest.json');
const runtimeIndexFile = path.join(root, 'data/places/places_index.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const aliasToolFile = path.join(root, 'tools/check_place_id_aliases.mts');
const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceEntry = 'oslo/by/snippen_lekepark.json';
const evidenceFile = path.join(root, 'data/coordinate-evidence', evidenceEntry);
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-127-snippen-lekepark');
fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(path.dirname(evidenceFile), { recursive: true });

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

// Resolve the physical identity as a named park, not as a child of Botanisk hage.
const searchUrl = 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=' + encodeURIComponent('Snippen lekepark, Oslo, Norway') + '&limit=20&addressdetails=1&namedetails=1&extratags=1&polygon_geojson=1&countrycodes=no&bounded=1&viewbox=10.65%2C59.95%2C10.85%2C59.88';
const rows = await fetchJson(searchUrl);
writeJson(path.join(reportDir, 'snippen-lekepark-nominatim-search.json'), rows);
const exact = (Array.isArray(rows) ? rows : []).filter((row) => {
  const exactName = normalize(row?.namedetails?.name || row?.name) === normalize('Snippen lekepark');
  const correctType = row?.category === 'leisure' && row?.type === 'park';
  const geometry = ['way', 'relation'].includes(String(row?.osm_type || '')) && ['Polygon', 'MultiPolygon'].includes(String(row?.geojson?.type || ''));
  const scope = Number(row?.lat) > 59.88 && Number(row?.lat) < 59.95 && Number(row?.lon) > 10.65 && Number(row?.lon) < 10.85;
  return exactName && correctType && geometry && scope;
});
if (exact.length !== 1) throw new Error(`Snippen lekepark krever ett eksakt navngitt parkpolygon; fant ${exact.length}`);
const osm = exact[0];
const sourceObjectId = `osm-${osm.osm_type}:${osm.osm_id}`;
if (sourceObjectId !== expectedSourceObjectId) throw new Error(`Snippen stable object drift: forventet ${expectedSourceObjectId}, fikk ${sourceObjectId}`);
const lat = Number(osm.lat);
const lon = Number(osm.lon);
const sourceUrl = `https://www.openstreetmap.org/${osm.osm_type}/${osm.osm_id}`;

const runtimeBefore = readJson(runtimeIndexFile);
const idsBefore = new Set(runtimeBefore.map((place) => place?.id).filter(Boolean));
if (!idsBefore.has(oldId)) throw new Error(`Runtime mangler ${oldId}`);
if (idsBefore.has(newId)) throw new Error(`Runtime har allerede ${newId}`);

const sourcePlaces = readJson(sourceFile);
if (!Array.isArray(sourcePlaces)) throw new Error('Lekeplass/trening source må være array');
const oldRecord = sourcePlaces.find((place) => place?.id === oldId);
if (!oldRecord) throw new Error(`Source mangler ${oldId}`);

const newPlace = {
  ...oldRecord,
  id: newId,
  name: 'Snippen lekepark',
  category: 'by',
  place_type: 'lekepark',
  visual: { designCode: 'park_miniature' },
  rounds: ['people', 'nature', 'badges', 'civication', 'leksikon', 'før_nå'],
  desc: 'Selvstendig navngitt lekepark på Tøyen med kunstneriske klatreskulpturer, store hengekøyer, sandkasse og et solfylt amfi.',
  popupDesc: 'Snippen lekepark er et eget, navngitt park- og lekeområde på Tøyen. Oslo kommune beskriver lekeparken som liggende rett utenfor sørsiden av Botanisk hage, med kunstneriske klatrestativer, store hengekøyer, sandkasse og et amfi.\n\nDen eldre migreringsauditen vurderte Botanisk hage som mulig parent, men kommunens stedsbeskrivelse avklarer at Snippen ligger utenfor hagen. I History Go er derfor `snippen_lekepark` den canonical fysiske identiteten for selve den navngitte lekeparken. Lekefunksjonene er innhold i dette parkstedet, ikke en separat markør inne i Botanisk hage.',
  emne_ids: Array.from(new Set([...(oldRecord.emne_ids || []), 'em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang'])),
  lat,
  lon,
  r: 150,
  locatorType: 'park',
  sourceProvider: 'osm',
  sourceObjectId,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `OpenStreetMap ${osm.osm_type} ${osm.osm_id} – Snippen lekepark; scope cross-checked with Oslo kommune`,
  coordSourceId: sourceObjectId,
  coordSourceUrl: sourceUrl,
  coordType: 'park_center',
  coordVerifiedAt: date,
  coordNote: `Batch 127 canonical migration: Oslo kommune beskriver Snippen lekepark som et eget navngitt lekeparksted rett utenfor sørsiden av Botanisk hage, så botanisk_hage avvises som parent. Ett eksakt navngitt OSM-parkpolygon (${sourceObjectId}) er valgt etter objekt-type-først-filter og matcher den lagrede intake-kandidaten. Punktet er area-anchor for hele lekeparken.`,
  geometry: osm.geojson,
  externalLinks: [
    { type: 'official', label: officialSourceName, url: officialSourceUrl, lang: 'nb', verifiedAt: date },
  ],
};
delete newPlace.coordPrecisionM;
writeJson(newPlaceFile, newPlace);

// Remove old pseudo-place from source and split artifacts.
const remaining = sourcePlaces.filter((place) => place?.id !== oldId);
writeJson(sourceFile, remaining);
const oldChild = path.join(splitDir, `${oldId}.json`);
if (!fs.existsSync(oldChild)) throw new Error(`Mangler split child ${oldId}`);
fs.unlinkSync(oldChild);

const splitManifest = readJson(splitManifestFile);
splitManifest.places = (splitManifest.places || []).filter((row) => row?.id !== oldId);
splitManifest.places.forEach((row, index) => { row.order = index; });
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256File(sourceFile);
splitManifest.generated_at = new Date().toISOString();
for (const row of splitManifest.places) row.sha256 = sha256File(path.join(sourceDir, row.file));
writeJson(splitManifestFile, splitManifest);
writeJson(splitIndexFile, readJson(splitIndexFile).filter((row) => row?.id !== oldId));

const manifest = readJson(manifestFile);
const manifestRel = newPlaceRel.replace(/^data\//, '');
if (!manifest.files.includes(manifestRel)) manifest.files.push(manifestRel);
writeJson(manifestFile, manifest);

// Remove obsolete Civication top-level mapping for old pseudo-place.
const civicationChanges = [];
for (const file of walkJson(path.join(root, 'data/Civication'))) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(`\"${oldId}\"`)) continue;
  const payload = JSON.parse(before);
  let changed = false;
  function prune(value) {
    if (Array.isArray(value)) return value.map(prune).filter((item) => item !== undefined);
    if (!value || typeof value !== 'object') return value;
    if (value.historyGoPlaceId === oldId) { changed = true; return undefined; }
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
    civicationChanges.push(rel(file));
  }
}

// Retarget Wonderkammer structurally to the canonical park identity.
const wonderkammerChanges = [];
for (const file of walkJson(path.join(root, 'data/wonderkammer'))) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(`\"${oldId}\"`)) continue;
  const after = before.split(`\"${oldId}\"`).join(`\"${newId}\"`);
  fs.writeFileSync(file, after);
  wonderkammerChanges.push(rel(file));
}

// Remove old place-i18n key; canonical translation can be generated from the new source later.
const i18nChanges = [];
for (const file of walkJson(path.join(root, 'data/i18n/content/places'))) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(`\"${oldId}\"`)) continue;
  const payload = JSON.parse(before);
  if (Object.prototype.hasOwnProperty.call(payload, oldId)) {
    delete payload[oldId];
    writeJson(file, payload);
    i18nChanges.push(rel(file));
  }
}

// Retarget all remaining exact active references byte-for-byte.
const handled = new Set([
  rel(sourceFile), rel(splitManifestFile), rel(splitIndexFile), rel(manifestFile), rel(newPlaceFile), rel(oldChild),
  ...civicationChanges, ...wonderkammerChanges, ...i18nChanges,
]);
const referenceChanges = [];
for (const file of walkJson(path.join(root, 'data'))) {
  const relative = rel(file);
  if (handled.has(relative) || /(^|\/)(archive|arkiv)(\/|$)/i.test(relative)) continue;
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(`\"${oldId}\"`)) continue;
  const after = before.split(`\"${oldId}\"`).join(`\"${newId}\"`);
  fs.writeFileSync(file, after);
  referenceChanges.push(relative);
}

// Evidence replacement and manifest registration.
for (const file of walkJson(path.join(root, 'data/coordinate-evidence'))) {
  let payload;
  try { payload = readJson(file); } catch { continue; }
  if (payload?.placeId === oldId) fs.unlinkSync(file);
}
const evidenceManifest = readJson(evidenceManifestFile);
evidenceManifest.files = (evidenceManifest.files || []).filter((entry) => entry !== 'oslo/sport/lekeplass_snippen.json');
if (!evidenceManifest.files.includes(evidenceEntry)) evidenceManifest.files.push(evidenceEntry);
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'nb'));
writeJson(evidenceManifestFile, evidenceManifest);
writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId: newId,
  placeFile: newPlaceRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: newPlace.lat, lon: newPlace.lon, r: newPlace.r, coordStatus: newPlace.coordStatus, coordSource: newPlace.coordSource, coordType: newPlace.coordType, coordNote: newPlace.coordNote },
  identity: { currentName: newPlace.name, resolvedIdentity: 'Snippen lekepark – selvstendig navngitt parksted utenfor Botanisk hage', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'park', requiresSplit: false, splitReason: '' },
  requiredEvidence: ['official parent rejection', 'exact named stable park polygon', 'one-place/one-physical-identity'],
  evidence: [
    { sourceProvider: 'municipality', sourceName: officialSourceName, sourceUrl: officialSourceUrl, sourceObjectId: 'oslo-kommune:park:snippen-lekepark', sourceQuality: 'official_physical_scope_definition', finding: 'Oslo kommune states that Snippen lekepark lies immediately outside the south side of Botanisk hage.', canVerifyCoordinate: false, reason: 'Rejects Botanisk hage as parent and establishes independent physical identity.' },
    { sourceProvider: 'osm', sourceName: newPlace.coordSource, sourceUrl, sourceObjectId, sourceQuality: 'exact_named_polygon_after_object_type_filter', finding: 'One exact named park polygon in predefined Oslo scope, matching the saved intake candidate.', canVerifyCoordinate: true, reason: newPlace.coordNote },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId, lat, lon, coordRole: 'area_anchor', canApplyToPlace: true }],
  coordinateCandidates: [{ sourceProvider: 'osm', sourceObjectId, lat, lon, coordRole: 'area_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Canonical Snippen lekepark applied; old purpose-specific ID retired.' },
  notes: [newPlace.coordNote],
});

let aliasTool = fs.readFileSync(aliasToolFile, 'utf8');
if (!aliasTool.includes(`${oldId}: '${newId}'`)) aliasTool = aliasTool.replace(/const aliases: AliasMap = \{([^\n]*)\};/, (_match, body) => `const aliases: AliasMap = {${body}, ${oldId}: '${newId}' };`);
writeText(aliasToolFile, aliasTool);

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 127 (2026-07-21)')) {
  const row = `| 127 | \`${newId}\` | Snippen lekepark | verified_geometry | \`${sourceObjectId}\` |`;
  const paragraph = 'Batch 127 (2026-07-21) løser den tidligere manuelle parent-konflikten for `lekeplass_snippen`. Oslo kommune beskriver Snippen lekepark som et eget navngitt lekeparksted rett utenfor sørsiden av Botanisk hage; `botanisk_hage` avvises derfor som parent. `lekeplass_snippen` normaliseres til canonical `snippen_lekepark`, basert på det eksakt navngitte OSM-parkpolygonet `osm-way:761333023` som allerede ble funnet i intake-kontrollen. Ingen nearest/first-hit-logikk brukes.';
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 127');
  protocol = protocol.replace(marker, `${row}\n\n${paragraph}\n\n${marker}`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(), batch,
  migration: { oldId, newId, sourceObjectId, lat, lon },
  parentRejected: 'botanisk_hage',
  civicationChanges, wonderkammerChanges, i18nChanges, referenceChanges,
  remainingSourceIds: remaining.map((place) => place.id),
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 127 – Snippen lekepark canonical identity', '',
  `- \`${oldId}\` → \`${newId}\``,
  `- geometry: \`${sourceObjectId}\``,
  '- Botanisk hage is rejected as parent because Oslo kommune places Snippen immediately outside the garden.',
  '- Snippen is represented by the exact named park polygon, not by a nearby proxy.',
].join('\n'));

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/check_place_id_aliases.mjs'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });

const rebuiltIds = new Set(readJson(runtimeIndexFile).map((place) => place?.id).filter(Boolean));
if (rebuiltIds.has(oldId)) throw new Error(`Runtime inneholder fortsatt ${oldId}`);
if (!rebuiltIds.has(newId)) throw new Error(`Runtime mangler ${newId}`);

const residuals = [];
for (const file of walkJson(path.join(root, 'data'))) {
  const relative = rel(file);
  if (/(^|\/)(archive|arkiv)(\/|$)/i.test(relative)) continue;
  if (fs.readFileSync(file, 'utf8').includes(`\"${oldId}\"`)) residuals.push(relative);
}
if (residuals.length) throw new Error(`Legacy-ID står igjen i aktiv data: ${JSON.stringify(residuals)}`);

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (changedFiles.length > 45) throw new Error(`Batch 127 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, oldId, newId, sourceObjectId, changedFileCount: changedFiles.length }, null, 2));
