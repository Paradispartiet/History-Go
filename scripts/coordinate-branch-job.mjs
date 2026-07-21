#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 128;
const date = '2026-07-21';
const oldId = 'lekeplass_kirsebarlunden';
const newId = 'kirsebarlunden';
const expectedOsmId = 'W1097943191';
const sourceObjectId = 'osm-way:1097943191';
const officialSourceName = 'Oslo kommune – Kirsebærlunden lekeplass';
const officialSourceUrl = 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/kirsebarlunden-lekeplass/';
const projectSourceUrl = 'https://storymaps.arcgis.com/stories/93fdf18da35442ba85367b2d3550fa61';

const sourceFile = path.join(root, 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json');
const sourceDir = path.dirname(sourceFile);
const splitDir = path.join(sourceDir, 'places_oslo_lekeplasser_trening');
const splitManifestFile = path.join(sourceDir, 'places_oslo_lekeplasser_trening_manifest.json');
const splitIndexFile = path.join(sourceDir, 'places_oslo_lekeplasser_trening_index.json');
const newPlaceRel = 'data/places/by/oslo/kirsebarlunden.json';
const newPlaceFile = path.join(root, newPlaceRel);
const manifestFile = path.join(root, 'data/places/manifest.json');
const runtimeIndexFile = path.join(root, 'data/places/places_index.json');
const aliasToolFile = path.join(root, 'tools/check_place_id_aliases.mts');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceEntry = 'oslo/by/kirsebarlunden.json';
const evidenceFile = path.join(root, 'data/coordinate-evidence', evidenceEntry);
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-128-kirsebarlunden');
fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(path.dirname(evidenceFile), { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const rel = (file) => path.relative(root, file).replace(/\\/g, '/');
const norm = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

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

// Direct stable-ID lookup of the exact intake candidate. The broader identity decision comes
// from municipal/project scope; OSM supplies the exact geometry of the named built site.
const lookupUrl = `https://nominatim.openstreetmap.org/lookup?osm_ids=${expectedOsmId}&format=jsonv2&polygon_geojson=1&namedetails=1&extratags=1`;
const rows = await fetchJson(lookupUrl);
writeJson(path.join(reportDir, 'kirsebarlunden-osm-way-1097943191.json'), rows);
if (!Array.isArray(rows) || rows.length !== 1) throw new Error(`Kirsebærlunden direct lookup ga ${Array.isArray(rows) ? rows.length : 'ikke-array'} treff`);
const osm = rows[0];
if (osm?.osm_type !== 'way' || Number(osm?.osm_id) !== 1097943191) throw new Error('Kirsebærlunden direct lookup returnerte feil stable object');
if (norm(osm?.namedetails?.name || osm?.name) !== norm('Kirsebærlunden lekeplass')) throw new Error(`Uventet OSM-navn: ${osm?.namedetails?.name || osm?.name}`);
if (osm?.category !== 'leisure' || osm?.type !== 'playground') throw new Error(`Uventet OSM-objekttype: ${osm?.category}/${osm?.type}`);
if (!['Polygon', 'MultiPolygon'].includes(String(osm?.geojson?.type || ''))) throw new Error('Kirsebærlunden mangler polygongeometri');
const lat = Number(osm.lat);
const lon = Number(osm.lon);
if (!(lat > 59.88 && lat < 59.95 && lon > 10.65 && lon < 10.85)) throw new Error('Kirsebærlunden stable object ligger utenfor forhåndsdefinert Oslo-scope');

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
  name: 'Kirsebærlunden',
  category: 'by',
  place_type: 'lekepark_og_byrom',
  visual: { designCode: 'park_miniature' },
  rounds: ['people', 'nature', 'badges', 'civication', 'leksikon', 'før_nå'],
  desc: 'Navngitt park- og lekeområde på Tøyen med kirsebærtrær, lange sklier, fabeldyr, balansesti og sitteplasser i et grønt byrom nedenfor Tøyenparken.',
  popupDesc: 'Kirsebærlunden er et oppgradert park- og lekeområde på Tøyen. Oslo kommune omtaler området som parken og lekeplassen på Kirsebærlunden, og plasserer det nedenfor Tøyenparken, mellom Tøyen torg og Gamle Munch. En prosjektbeskrivelse av oppgraderingen klassifiserer området som lekeplass/park og oppgir et areal på om lag 7700 kvadratmeter.\n\nI History Go er derfor `kirsebarlunden` den canonical fysiske identiteten for det navngitte byrommet. Den tidligere ID-en `lekeplass_kirsebarlunden` beskrev hovedfunksjonen, men det finnes ingen dokumentert overordnet parent i Tøyenparken, Tøyen torg eller Botanisk hage. Lekeapparatene, kirsebærtrærne og aktivitetsprofilen beholdes som innhold i samme sted.',
  emne_ids: Array.from(new Set([...(oldRecord.emne_ids || []), 'em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang'])),
  lat,
  lon,
  r: 150,
  locatorType: 'current_place',
  sourceProvider: 'osm',
  sourceObjectId,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap way 1097943191 – Kirsebærlunden lekeplass; canonical site scope cross-checked with Oslo kommune and the Kirsebærlunden project description',
  coordSourceId: sourceObjectId,
  coordSourceUrl: 'https://www.openstreetmap.org/way/1097943191',
  coordType: 'playground_park_center',
  coordVerifiedAt: date,
  coordNote: 'Batch 128 canonical closure: Oslo kommune omtaler området som parken og lekeplassen på Kirsebærlunden, sier at det ligger nedenfor Tøyenparken og mellom Tøyen torg og Gamle Munch, og oppgir besøksadresse Økernveien 7. Prosjektbeskrivelsen klassifiserer det oppgraderte området som lekeplass/park. Ingen av de nærliggende stedene kan derfor brukes som dokumentert parent. Det eksakte navngitte OSM-polygonet osm-way:1097943191 for Kirsebærlunden lekeplass, allerede identifisert i intake-kontrollen, brukes som geometrisk area-anchor for det canonical navngitte byrommet. Ingen nearest/first-hit-logikk brukes.',
  geometry: osm.geojson,
  externalLinks: [
    { type: 'official', label: officialSourceName, url: officialSourceUrl, lang: 'nb', verifiedAt: date },
    { type: 'reference', label: 'Kirsebærlunden – prosjektbeskrivelse', url: projectSourceUrl, lang: 'nb', verifiedAt: date },
  ],
};
delete newPlace.coordPrecisionM;
writeJson(newPlaceFile, newPlace);

// Retire the old purpose-specific place from source and split artifacts.
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

// Remove obsolete Civication mapping for the old ID.
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

// Retarget Wonderkammer to the canonical identity.
const wonderkammerChanges = [];
for (const file of walkJson(path.join(root, 'data/wonderkammer'))) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(`\"${oldId}\"`)) continue;
  fs.writeFileSync(file, before.split(`\"${oldId}\"`).join(`\"${newId}\"`));
  wonderkammerChanges.push(rel(file));
}

// Remove obsolete old-place translation keys.
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

// Retarget all remaining exact references byte-for-byte.
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
  fs.writeFileSync(file, before.split(`\"${oldId}\"`).join(`\"${newId}\"`));
  referenceChanges.push(relative);
}

// Replace evidence and register it.
for (const file of walkJson(path.join(root, 'data/coordinate-evidence'))) {
  let payload;
  try { payload = readJson(file); } catch { continue; }
  if (payload?.placeId === oldId) fs.unlinkSync(file);
}
const evidenceManifest = readJson(evidenceManifestFile);
evidenceManifest.files = (evidenceManifest.files || []).filter((entry) => entry !== 'oslo/sport/lekeplass_kirsebarlunden.json');
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
  identity: { currentName: newPlace.name, resolvedIdentity: 'Kirsebærlunden – selvstendig navngitt park-/lekeområde nedenfor Tøyenparken', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'current_place', requiresSplit: false, splitReason: '' },
  requiredEvidence: ['explicit rejection of nearby parent candidates', 'official park/playground site scope', 'exact named stable polygon'],
  evidence: [
    { sourceProvider: 'municipality', sourceName: officialSourceName, sourceUrl: officialSourceUrl, sourceObjectId: 'oslo-kommune:place:kirsebarlunden', sourceQuality: 'official_physical_scope_definition', finding: 'Oslo kommune calls the site the park and the playground at Kirsebærlunden, places it below Tøyenparken and between Tøyen torg and Gamle Munch.', canVerifyCoordinate: false, reason: 'Rejects Tøyenparken, Tøyen torg and Botanisk hage as undocumented parents.' },
    { sourceProvider: 'manual_research', sourceName: 'Kirsebærlunden project description', sourceUrl: projectSourceUrl, sourceObjectId: 'project:kirsebarlunden-2024-nomination', sourceQuality: 'project_scope_description', finding: 'The upgraded Kirsebærlunden site is classified as Lekeplass/park with an area of about 7700 m².', canVerifyCoordinate: false, reason: 'Supports broader named site identity rather than a child of a neighboring canonical place.' },
    { sourceProvider: 'osm', sourceName: newPlace.coordSource, sourceUrl: newPlace.coordSourceUrl, sourceObjectId, sourceQuality: 'direct_stable_id_exact_named_playground_polygon', finding: 'Direct stable-ID lookup of the exact named Kirsebærlunden lekeplass polygon found in the intake audit.', canVerifyCoordinate: true, reason: newPlace.coordNote },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId, lat, lon, coordRole: 'area_anchor', canApplyToPlace: true }],
  coordinateCandidates: [{ sourceProvider: 'osm', sourceObjectId, lat, lon, coordRole: 'area_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Canonical Kirsebærlunden applied; old purpose-specific ID retired and the source queue is closed except already-controlled Korketrekkeren.' },
  notes: [newPlace.coordNote],
});

let aliasTool = fs.readFileSync(aliasToolFile, 'utf8');
if (!aliasTool.includes(`${oldId}: '${newId}'`)) aliasTool = aliasTool.replace(/const aliases: AliasMap = \{([^\n]*)\};/, (_match, body) => `const aliases: AliasMap = {${body}, ${oldId}: '${newId}' };`);
writeText(aliasToolFile, aliasTool);

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 128 (2026-07-21)')) {
  const row = `| 128 | \`${newId}\` | Kirsebærlunden | verified_geometry | \`${sourceObjectId}\` |`;
  const paragraph = 'Batch 128 (2026-07-21) lukker siste ukontrollerte record i `places_oslo_lekeplasser_trening.json`. Oslo kommune omtaler området både som parken og lekeplassen på Kirsebærlunden, plasserer det nedenfor Tøyenparken og mellom Tøyen torg og Gamle Munch, mens prosjektbeskrivelsen klassifiserer det oppgraderte området som lekeplass/park. Ingen av de nærliggende canonical stedene er derfor dokumentert parent. `lekeplass_kirsebarlunden` normaliseres til canonical `kirsebarlunden`, med direkte stable-ID-oppslag av det eksakt navngitte polygonet `osm-way:1097943191` som geometrisk area-anchor. `korketrekkeren` var allerede kontrollert, så denne gamle kilden har etter batch 128 ingen ukontrollerte place-records.';
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 128');
  protocol = protocol.replace(marker, `${row}\n\n${paragraph}\n\n${marker}`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(), batch,
  migration: { oldId, newId, sourceObjectId, lat, lon },
  rejectedParents: ['toyenparken', 'toyen_torg', 'botanisk_hage'],
  civicationChanges, wonderkammerChanges, i18nChanges, referenceChanges,
  remainingSourceIds: remaining.map((place) => place.id),
  uncontrolledRemaining: [],
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 128 – Kirsebærlunden canonical closure', '',
  `- \`${oldId}\` → \`${newId}\``,
  `- geometry: \`${sourceObjectId}\``,
  '- Tøyenparken, Tøyen torg and Botanisk hage are rejected as undocumented parents.',
  '- The old playground/training source is fully controlled after this batch; only already-controlled Korketrekkeren remains in it.',
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
if (changedFiles.length > 45) throw new Error(`Batch 128 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, oldId, newId, sourceObjectId, changedFileCount: changedFiles.length }, null, 2));
