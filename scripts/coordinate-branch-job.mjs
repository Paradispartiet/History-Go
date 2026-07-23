import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-23';
const LEGACY_ID = 'akerselva_industri';
const CANONICAL_ID = 'akerselva';
const REPORT_DIR = 'reports/oslo-coordinate-akerselva-industri-model-audit-post-190';
mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const protocol = readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((m) => Number(m[1])));
if (maxBatch !== 190) throw new Error(`Expected coordinate max batch 190, got ${maxBatch}`);

const runtime = readJson('data/places/places_index.json');
const runtimePlaces = [];
const collectRuntime = (value) => {
  if (Array.isArray(value)) return value.forEach(collectRuntime);
  if (!value || typeof value !== 'object') return;
  if (typeof value.id === 'string' && typeof value.name === 'string' && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
    runtimePlaces.push(value);
    return;
  }
  Object.values(value).forEach(collectRuntime);
};
collectRuntime(runtime);
const canonicalRuntime = runtimePlaces.filter((place) => place.id === CANONICAL_ID);
const legacyRuntime = runtimePlaces.filter((place) => place.id === LEGACY_ID);
if (canonicalRuntime.length !== 1) throw new Error(`Expected one runtime ${CANONICAL_ID}, got ${canonicalRuntime.length}`);
if (legacyRuntime.length !== 1) throw new Error(`Expected one runtime ${LEGACY_ID}, got ${legacyRuntime.length}`);

const tracked = spawnSync('git', ['ls-files', 'data/places', 'data/coordinate-evidence', 'data/quiz', 'data/routes', 'data/people', 'data/lesespor', 'data/stories', 'data/wonderkammer', 'data/Civication', 'data/i18n'], { encoding: 'utf8' });
if (tracked.status !== 0) throw new Error(`git ls-files failed: ${tracked.stderr}`);
const files = String(tracked.stdout || '').split('\n').filter(Boolean);

const sourceOccurrences = { canonical: [], legacy: [] };
for (const file of files.filter((file) => file.endsWith('.json') && file.startsWith('data/places/'))) {
  let parsed;
  try { parsed = readJson(file); } catch { continue; }
  const visit = (value, path = []) => {
    if (Array.isArray(value)) return value.forEach((item, index) => visit(item, [...path, index]));
    if (!value || typeof value !== 'object') return;
    if (value.id === CANONICAL_ID) sourceOccurrences.canonical.push({ file, path, snapshot: value });
    if (value.id === LEGACY_ID) sourceOccurrences.legacy.push({ file, path, snapshot: value });
    Object.entries(value).forEach(([key, child]) => visit(child, [...path, key]));
  };
  visit(parsed);
}

const grepExact = (id) => {
  const result = spawnSync('git', ['grep', '-n', '-F', `"${id}"`, '--', 'data'], { encoding: 'utf8' });
  if (![0, 1].includes(result.status)) throw new Error(`git grep failed for ${id}: ${result.stderr}`);
  return String(result.stdout || '').trim().split('\n').filter(Boolean).map((line) => {
    const first = line.indexOf(':');
    const second = line.indexOf(':', first + 1);
    return { file: line.slice(0, first), line: Number(line.slice(first + 1, second)), text: line.slice(second + 1).trim() };
  });
};
const canonicalRefs = grepExact(CANONICAL_ID);
const legacyRefs = grepExact(LEGACY_ID);

const classify = (refs) => {
  const groups = {};
  for (const ref of refs) {
    const key = ref.file.startsWith('data/places/') ? 'places'
      : ref.file.startsWith('data/coordinate-evidence/') ? 'coordinateEvidence'
      : ref.file.startsWith('data/quiz/') ? 'quiz'
      : ref.file.startsWith('data/routes') || ref.file.startsWith('data/natur/routes') ? 'routes'
      : ref.file.startsWith('data/people/') ? 'people'
      : ref.file.startsWith('data/lesespor/') ? 'lesespor'
      : ref.file.startsWith('data/stories/') ? 'stories'
      : ref.file.startsWith('data/wonderkammer/') ? 'wonderkammer'
      : ref.file.startsWith('data/Civication/') ? 'civication'
      : ref.file.startsWith('data/i18n/') ? 'i18n'
      : 'other';
    (groups[key] ||= []).push(ref);
  }
  return groups;
};

const canonical = canonicalRuntime[0];
const legacy = legacyRuntime[0];
const canonicalEmner = new Set(Array.isArray(canonical.emne_ids) ? canonical.emne_ids : []);
const legacyEmner = new Set(Array.isArray(legacy.emne_ids) ? legacy.emne_ids : []);
const sharedEmner = [...legacyEmner].filter((id) => canonicalEmner.has(id));
const legacyOnlyEmner = [...legacyEmner].filter((id) => !canonicalEmner.has(id));

const industrialIds = [
  'glads_molle', 'ovre_foss', 'myrens_verksted', 'lilleborg_fabrikker', 'nydalen', 'vulkan_energisentral',
  'oslo_gassverk', 'ringnes_bryggeri', 'schous_bryggeri'
];
const industrialCoverage = industrialIds.map((id) => {
  const matches = runtimePlaces.filter((place) => place.id === id);
  return matches.length === 1 ? { id, name: matches[0].name, lat: matches[0].lat, lon: matches[0].lon, coordStatus: matches[0].coordStatus || null } : { id, missing: true };
});

const evidencePath = 'data/coordinate-evidence/oslo/naeringsliv/akerselva_industri.json';
const legacyEvidence = readJson(evidencePath);
if (legacyEvidence.placeId !== LEGACY_ID || legacyEvidence.coordinateDecision !== 'needs_geometry') throw new Error('Unexpected Akerselva industri evidence state');

const quizFiles = [...new Set(legacyRefs.filter((ref) => ref.file.startsWith('data/quiz/')).map((ref) => ref.file))];
const quizSnapshots = quizFiles.map((file) => ({ file, content: readJson(file) }));

const decisionSignals = {
  canonicalAlreadyRepresentsPhysicalRiver: canonical.coordStatus?.startsWith('verified') || false,
  legacyExplicitlyOverlapsCanonical: legacyEvidence.identity?.identityProblem?.includes('overlapper canonical `akerselva`') || false,
  legacyIsLongThematicCorridor: legacyEvidence.identity?.resolvedIdentity?.includes('korridor') || false,
  concreteIndustrialPlacesPresent: industrialCoverage.filter((item) => !item.missing).length,
  legacyHasUniqueEmneIds: legacyOnlyEmner.length > 0,
  legacyReferenceFileCount: new Set(legacyRefs.map((ref) => ref.file)).size,
  legacyQuizFileCount: quizFiles.length
};

const conclusion = decisionSignals.canonicalAlreadyRepresentsPhysicalRiver && decisionSignals.legacyExplicitlyOverlapsCanonical && decisionSignals.legacyIsLongThematicCorridor
  ? 'Prefer thematic migration/retirement over inventing a second physical corridor marker. Preserve industrial learning content by attaching it to canonical Akerselva and/or concrete industrial places after a reference-by-reference migration audit.'
  : 'Insufficient evidence to retire; continue geometry research.';

const summary = {
  version: DATE,
  purpose: 'Determine whether akerselva_industri is a real separate physical place requiring line geometry, or a thematic duplicate of canonical Akerselva plus concrete industrial places.',
  runtime: { canonical, legacy },
  sourceOccurrences,
  referenceInventory: {
    canonical: { count: canonicalRefs.length, fileCount: new Set(canonicalRefs.map((ref) => ref.file)).size, groups: classify(canonicalRefs) },
    legacy: { count: legacyRefs.length, fileCount: new Set(legacyRefs.map((ref) => ref.file)).size, groups: classify(legacyRefs) }
  },
  topicOverlap: { canonicalEmneIds: [...canonicalEmner], legacyEmneIds: [...legacyEmner], sharedEmner, legacyOnlyEmner },
  concreteIndustrialCoverage: industrialCoverage,
  legacyEvidence,
  quizFiles,
  quizSnapshots,
  decisionSignals,
  conclusion
};
writeJson(`${REPORT_DIR}/summary.json`, summary);
writeFileSync(`${REPORT_DIR}/sources.md`, `# Akerselva industri model audit\n\nDate: ${DATE}\n\nThis research-only pass compares the unresolved \`${LEGACY_ID}\` corridor proxy with canonical \`${CANONICAL_ID}\` and the already canonical industrial places along the river.\n\n## Result\n\n${conclusion}\n\n- Legacy exact references: ${legacyRefs.length} across ${new Set(legacyRefs.map((ref) => ref.file)).size} files.\n- Canonical Akerselva exact references: ${canonicalRefs.length} across ${new Set(canonicalRefs.map((ref) => ref.file)).size} files.\n- Concrete industrial canonical places found in the bounded coverage list: ${industrialCoverage.filter((item) => !item.missing).length}/${industrialCoverage.length}.\n- Legacy-only emne IDs: ${legacyOnlyEmner.join(', ') || 'none'}.\n\nNo canonical place or coordinate data is changed by this audit.\n`, 'utf8');

console.log(JSON.stringify({ legacyId: LEGACY_ID, canonicalId: CANONICAL_ID, legacyRefCount: legacyRefs.length, legacyFileCount: new Set(legacyRefs.map((ref) => ref.file)).size, canonicalRefCount: canonicalRefs.length, concreteIndustrialPlacesPresent: industrialCoverage.filter((item) => !item.missing).length, conclusion }, null, 2));
