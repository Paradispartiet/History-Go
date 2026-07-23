import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-23';
const BATCH = 188;
const LEGACY_ID = 'sagene_kvernhus';
const CANONICAL_ID = 'glads_molle';
const CANONICAL_SOURCE = 'geonorge-adresser-v1:0301:16161:10A';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-188-sagene-kvernhus-duplicate-migration';

const AGGREGATE_FILE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const SPLIT_FILE = 'data/places/naeringsliv/oslo/places_naeringsliv/sagene_kvernhus.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/naeringsliv/sagene_kvernhus.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const EVIDENCE_ENTRY = 'oslo/naeringsliv/sagene_kvernhus.json';
const CANONICAL_FILE = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/glads_molle.json';
const ALIAS_TOOL = 'tools/check_place_id_aliases.mts';
const CIVICATION_FILE = 'data/Civication/map/historyGoPlaceMapping.naeringsliv.json';
const LESESPOR_FILE = 'data/lesespor/lesespor_oslo_batch2.json';
const NATURE_ROUTE_FILE = 'data/natur/routes_patched_akerselva_knagger_baseline_v0_2_patched_groft.json';
const PEOPLE_FILE = 'data/people/by/oslo/people_by_oslo.json';
const ARBEIDERMUSEET_FILE = 'data/places/historie/oslo/places_historie/arbeidermuseet.json';
const QUIZ_SET_FILE = 'data/quiz/naeringsliv/sagene_kvernhus_sets_merged.json';
const QUIZ_FLAT_FILE = 'data/quiz/quiz_naeringsliv.json';
const QUIZ_MANIFEST = 'data/quiz/manifest.json';
const ROUTES_FILE = 'data/routes.json';
const HISTORICAL_ROUTES_FILE = 'data/routes/historical/routes_historical_oslo.json';
const I18N_FILES = [
  'data/i18n/content/places/en.json',
  'data/i18n/content/places/es.json',
  'data/i18n/content/places/pt.json'
];

mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const dedupe = (items) => [...new Set(items)];

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = readFileSync(protocolPath, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1])));
if (maxBatch !== 187) throw new Error(`Expected coordinate max batch 187, got ${maxBatch}`);

const canonical = readJson(CANONICAL_FILE);
if (canonical.id !== CANONICAL_ID || canonical.coordStatus !== 'verified' || canonical.sourceObjectId !== CANONICAL_SOURCE) {
  throw new Error('Canonical glads_molle does not match the locked verified identity');
}
if (Math.abs(canonical.lat - 59.931850362845985) > 1e-10 || Math.abs(canonical.lon - 10.757873019733754) > 1e-10) {
  throw new Error('Canonical glads_molle coordinate changed');
}

const duplicateAudit = readJson('reports/oslo-coordinate-sagene-kvernhus-duplicate-audit-post-187/summary.json');
if (!duplicateAudit.duplicateDecision?.isDuplicatePhysicalPlace || duplicateAudit.duplicateDecision?.canonicalId !== CANONICAL_ID) {
  throw new Error('Merged duplicate audit is missing or no longer resolves to glads_molle');
}

const aggregate = readJson(AGGREGATE_FILE);
if (!Array.isArray(aggregate)) throw new Error(`${AGGREGATE_FILE} is not an array`);
const duplicatePlaces = aggregate.filter((place) => place?.id === LEGACY_ID);
if (duplicatePlaces.length !== 1) throw new Error(`Expected one ${LEGACY_ID} aggregate record, got ${duplicatePlaces.length}`);
const legacyPlace = duplicatePlaces[0];
if (legacyPlace.coordStatus || legacyPlace.sourceObjectId || legacyPlace.locatorType) throw new Error('Legacy duplicate unexpectedly acquired coordinate metadata');

const oldEvidence = readJson(EVIDENCE_FILE);
if (oldEvidence.placeId !== LEGACY_ID || oldEvidence.coordinateDecision !== 'needs_identity_split') {
  throw new Error('Unexpected legacy evidence state');
}

const preGrep = spawnSync('git', ['grep', '-n', '-F', `"${LEGACY_ID}"`, '--', 'data'], { encoding: 'utf8' });
if (![0, 1].includes(preGrep.status)) throw new Error(`Pre-migration grep failed: ${preGrep.stderr}`);
const preOccurrences = String(preGrep.stdout || '').trim().split('\n').filter(Boolean);
if (preOccurrences.length !== 83) throw new Error(`Expected 83 exact legacy-id occurrences from merged audit, got ${preOccurrences.length}`);

// 1. Retire duplicate canonical place source and split artifacts.
const remainingAggregate = aggregate.filter((place) => place?.id !== LEGACY_ID);
if (remainingAggregate.length !== aggregate.length - 1) throw new Error('Failed to remove duplicate aggregate place');
writeJson(AGGREGATE_FILE, remainingAggregate);

if (!existsSync(SPLIT_FILE)) throw new Error(`Missing duplicate split file ${SPLIT_FILE}`);
rmSync(SPLIT_FILE);

const splitManifest = readJson(SPLIT_MANIFEST);
if (!Array.isArray(splitManifest.places)) throw new Error(`${SPLIT_MANIFEST} missing places[]`);
const oldManifestRows = splitManifest.places.filter((row) => row?.id === LEGACY_ID);
if (oldManifestRows.length !== 1) throw new Error(`Expected one split-manifest row, got ${oldManifestRows.length}`);
splitManifest.places = splitManifest.places
  .filter((row) => row?.id !== LEGACY_ID)
  .map((row, order) => ({ ...row, order }));
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256(AGGREGATE_FILE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

const splitIndex = readJson(SPLIT_INDEX);
if (!Array.isArray(splitIndex) || splitIndex.filter((row) => row?.id === LEGACY_ID).length !== 1) {
  throw new Error('Unexpected split index state');
}
writeJson(SPLIT_INDEX, splitIndex.filter((row) => row?.id !== LEGACY_ID));

// 2. Retire duplicate coordinate evidence and manifest registration.
rmSync(EVIDENCE_FILE);
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (!Array.isArray(evidenceManifest.files) || !evidenceManifest.files.includes(EVIDENCE_ENTRY)) {
  throw new Error('Legacy evidence manifest entry missing');
}
evidenceManifest.files = evidenceManifest.files.filter((entry) => entry !== EVIDENCE_ENTRY);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

// 3. Remove duplicate Civication mapping. Canonical Glads mølle remains a History Go place independently.
const civi = readJson(CIVICATION_FILE);
let removedCivicationMappings = 0;
const pruneCivication = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => {
      if (item && typeof item === 'object' && item.historyGoPlaceId === LEGACY_ID) {
        removedCivicationMappings += 1;
        return false;
      }
      return true;
    }).map(pruneCivication);
  }
  if (!value || typeof value !== 'object') return value;
  for (const key of Object.keys(value)) {
    const child = value[key];
    if (child && typeof child === 'object' && !Array.isArray(child) && child.historyGoPlaceId === LEGACY_ID) {
      delete value[key];
      removedCivicationMappings += 1;
    } else {
      value[key] = pruneCivication(child);
    }
  }
  return value;
};
pruneCivication(civi);
if (removedCivicationMappings !== 1) throw new Error(`Expected to remove one Civication mapping, removed ${removedCivicationMappings}`);
writeJson(CIVICATION_FILE, civi);

// 4. Remove stale localized legacy-place entries. Never overwrite canonical Glads mølle translations.
const i18nResult = [];
for (const file of I18N_FILES) {
  const data = readJson(file);
  const hadLegacy = Object.prototype.hasOwnProperty.call(data, LEGACY_ID);
  const hasCanonical = Object.prototype.hasOwnProperty.call(data, CANONICAL_ID);
  if (!hadLegacy) throw new Error(`Expected legacy i18n key in ${file}`);
  delete data[LEGACY_ID];
  writeJson(file, data);
  i18nResult.push({ file, removedLegacyKey: true, canonicalKeyAlreadyPresent: hasCanonical });
}

// 5. Preserve relevant reading-track context by pointing the Akerselva essay at the real Glads mølle place.
const lesespor = readJson(LESESPOR_FILE);
let lesesporReplacements = 0;
for (const item of lesespor) {
  if (!Array.isArray(item?.place_ids)) continue;
  if (item.place_ids.includes(LEGACY_ID)) {
    item.place_ids = dedupe(item.place_ids.map((id) => id === LEGACY_ID ? CANONICAL_ID : id));
    lesesporReplacements += 1;
  }
}
if (lesesporReplacements !== 1) throw new Error(`Expected one lesespor replacement, got ${lesesporReplacements}`);
writeJson(LESESPOR_FILE, lesespor);

// 6. Retarget route stops to the existing physical Glads mølle and correct the old grain-mill wording.
const routeStopText = {
  title: 'Glads mølle',
  info: 'Bevart papirmølle fra 1736 – et tidlig fysisk spor etter vannkraftdrevet produksjon langs Akerselva.'
};
const updateRouteStops = (value) => {
  let count = 0;
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== 'object') return;
    if (node.placeId === LEGACY_ID) {
      node.placeId = CANONICAL_ID;
      if ('title' in node) node.title = routeStopText.title;
      if ('info' in node) node.info = routeStopText.info;
      count += 1;
    }
    Object.values(node).forEach(visit);
  };
  visit(value);
  return count;
};

const natureRoutes = readJson(NATURE_ROUTE_FILE);
const natureRouteReplacements = updateRouteStops(natureRoutes);
if (natureRouteReplacements !== 1) throw new Error(`Expected one nature route stop replacement, got ${natureRouteReplacements}`);
writeJson(NATURE_ROUTE_FILE, natureRoutes);

const routes = readJson(ROUTES_FILE);
const routeReplacements = updateRouteStops(routes);
if (routeReplacements !== 1) throw new Error(`Expected one routes.json stop replacement, got ${routeReplacements}`);
writeJson(ROUTES_FILE, routes);

const historicalRoutes = readJson(HISTORICAL_ROUTES_FILE);
let historicalChapter = null;
const findHistorical = (value) => {
  if (Array.isArray(value)) return value.forEach(findHistorical);
  if (!value || typeof value !== 'object') return;
  if (value.id === 'akerselva_industri_02_sagene') historicalChapter = value;
  Object.values(value).forEach(findHistorical);
};
findHistorical(historicalRoutes);
if (!historicalChapter || historicalChapter.placeId !== LEGACY_ID || historicalChapter.physical?.placeId !== LEGACY_ID) {
  throw new Error('Expected legacy historical route chapter was not found in locked state');
}
historicalChapter.chapterTitle = 'Glads mølle – Nedre Papirmølle';
historicalChapter.year = '1736';
historicalChapter.era = 'Papir, vannkraft og tidlig fabrikk';
historicalChapter.narrativeText = 'Ved Nedre Papirmølle ble vannkraft fra Akerselva brukt til papirproduksjon allerede fra 1736. Den bevarte Glads mølle viser hvordan elva bar fram tidlig fabrikkvirksomhet lenge før den store tekstilindustrien tok over landskapet.';
historicalChapter.tasks = [{
  type: 'reflection',
  prompt: 'Hva forteller Glads mølle om hvordan vannkraft kunne drive tidlig fabrikkproduksjon før den store industrialiseringen?',
  placeholder: true
}];
historicalChapter.physical.placeId = CANONICAL_ID;
historicalChapter.physical.gpsRadius = canonical.r;
historicalChapter.placeId = CANONICAL_ID;
writeJson(HISTORICAL_ROUTES_FILE, historicalRoutes);

// 7. The Harald Aars legacy relation was to the vague Sagene proxy, not directly sourced to Glads mølle. Remove it rather than invent a new person-place claim.
const people = readJson(PEOPLE_FILE);
let removedPersonRelations = 0;
for (const person of people) {
  if (person?.placeId === LEGACY_ID) throw new Error(`Unexpected primary person relation to ${LEGACY_ID}: ${person.id}`);
  if (Array.isArray(person?.places) && person.places.includes(LEGACY_ID)) {
    person.places = person.places.filter((id) => id !== LEGACY_ID);
    removedPersonRelations += 1;
  }
}
if (removedPersonRelations !== 1) throw new Error(`Expected one secondary person relation removal, got ${removedPersonRelations}`);
writeJson(PEOPLE_FILE, people);

// 8. Keep the Workermuseum contrast, but point it at the real preserved mill building.
const arbeidermuseet = readJson(ARBEIDERMUSEET_FILE);
if (!Array.isArray(arbeidermuseet.quiz_profile?.contrast_targets) || !arbeidermuseet.quiz_profile.contrast_targets.includes(LEGACY_ID)) {
  throw new Error('Expected arbeidermuseet contrast target missing');
}
arbeidermuseet.quiz_profile.contrast_targets = dedupe(arbeidermuseet.quiz_profile.contrast_targets.map((id) => id === LEGACY_ID ? CANONICAL_ID : id));
writeJson(ARBEIDERMUSEET_FILE, arbeidermuseet);

// 9. Retire the quiz package built for the invalid composite place. Canonical Glads mølle already has its own source-first quiz package.
if (!existsSync(QUIZ_SET_FILE)) throw new Error(`Missing legacy quiz package ${QUIZ_SET_FILE}`);
rmSync(QUIZ_SET_FILE);

const flatQuiz = readJson(QUIZ_FLAT_FILE);
if (!Array.isArray(flatQuiz)) throw new Error(`${QUIZ_FLAT_FILE} is not an array`);
const removedFlatQuiz = flatQuiz.filter((question) => question?.placeId === LEGACY_ID);
if (removedFlatQuiz.length !== 5) throw new Error(`Expected five flat legacy quiz questions, got ${removedFlatQuiz.length}`);
writeJson(QUIZ_FLAT_FILE, flatQuiz.filter((question) => question?.placeId !== LEGACY_ID));

const containsLegacyQuizFile = (value) => {
  if (typeof value === 'string') return value.includes('sagene_kvernhus_sets_merged.json');
  if (Array.isArray(value)) return value.some(containsLegacyQuizFile);
  if (value && typeof value === 'object') return Object.values(value).some(containsLegacyQuizFile);
  return false;
};
const pruneLegacyQuizManifest = (value) => {
  if (Array.isArray(value)) return value.filter((item) => !containsLegacyQuizFile(item)).map(pruneLegacyQuizManifest);
  if (!value || typeof value !== 'object') return value;
  for (const key of Object.keys(value)) {
    if (containsLegacyQuizFile(value[key]) && typeof value[key] === 'string') delete value[key];
    else value[key] = pruneLegacyQuizManifest(value[key]);
  }
  return value;
};
const quizManifest = readJson(QUIZ_MANIFEST);
const quizManifestHadLegacy = containsLegacyQuizFile(quizManifest);
writeJson(QUIZ_MANIFEST, pruneLegacyQuizManifest(quizManifest));

// 10. Register a legacy-ID alias guard so the retired duplicate cannot re-enter active JSON data.
let aliasTool = readFileSync(ALIAS_TOOL, 'utf8');
if (aliasTool.includes(`${LEGACY_ID}: '${CANONICAL_ID}'`) || aliasTool.includes(`'${LEGACY_ID}': '${CANONICAL_ID}'`)) {
  throw new Error('Legacy alias already registered unexpectedly');
}
const aliasNeedle = 'const aliases: AliasMap = {';
if (!aliasTool.includes(aliasNeedle)) throw new Error('Could not locate alias registry');
aliasTool = aliasTool.replace(aliasNeedle, `${aliasNeedle} ${LEGACY_ID}: '${CANONICAL_ID}',`);
writeFileSync(ALIAS_TOOL, aliasTool, 'utf8');

// 11. Remove the unresolved control row and record this as a duplicate-retirement batch, with no new coordinate.
const protocolLines = protocol.split('\n');
const legacyProtocolRows = protocolLines.map((line, index) => line.includes(`\`${LEGACY_ID}\``) ? index : -1).filter((index) => index >= 0);
if (legacyProtocolRows.length !== 1) throw new Error(`Expected one unresolved protocol row for ${LEGACY_ID}, got ${legacyProtocolRows.length}`);
protocol = protocolLines.filter((_, index) => !legacyProtocolRows.includes(index)).join('\n');
protocol = `${protocol.trimEnd()}\n\n| ${BATCH} | \`${LEGACY_ID}\` | retired duplicate → \`${CANONICAL_ID}\` | no new coordinate | \`${CANONICAL_SOURCE}\` |\n\nBatch ${BATCH} (${DATE}) løser \`${LEGACY_ID}\` som en legacy-duplikat av det allerede canonical og verifiserte stedet \`${CANONICAL_ID}\` (Glads mølle). Den tidligere næringslivsrecorden var en sammenblandet Sagene-mølleproxy og fikk aldri egen kildeverifisert koordinat. Et forsøk på å avgrense den til Glads mølle traff korrekt canonical kollisjonsgate fordi \`${CANONICAL_ID}\` allerede står på det eksakte Geonorge-objektet \`${CANONICAL_SOURCE}\`. Duplikatplassen, split-artefakten, coordinate-evidensen og Civication-kopien fjernes. Fysiske rutehenvisninger flyttes til \`${CANONICAL_ID}\`; den uspesifikke Harald Aars-relasjonen fjernes uten å konstruere en ny Glads-relasjon; quizpakken som eksplisitt modellerte et ikke-eksisterende sammensatt «Sagene mølle og kvernhus»-sted pensjoneres. Legacy-ID-en låses som alias til \`${CANONICAL_ID}\`. Ingen ny fysisk koordinat opprettes.\n`;
writeFileSync(protocolPath, protocol, 'utf8');

// 12. Hard post-migration guards.
const postExact = spawnSync('git', ['grep', '-n', '-F', `"${LEGACY_ID}"`, '--', 'data'], { encoding: 'utf8' });
if (postExact.status === 0 && String(postExact.stdout || '').trim()) {
  throw new Error(`Exact legacy place-id references remain:\n${postExact.stdout}`);
}
if (![0, 1].includes(postExact.status)) throw new Error(`Post-migration exact grep failed: ${postExact.stderr}`);

const quizPathGrep = spawnSync('git', ['grep', '-n', '-F', 'sagene_kvernhus_sets_merged.json', '--', 'data/quiz'], { encoding: 'utf8' });
if (quizPathGrep.status === 0 && String(quizPathGrep.stdout || '').trim()) {
  throw new Error(`Legacy quiz package references remain:\n${quizPathGrep.stdout}`);
}
if (![0, 1].includes(quizPathGrep.status)) throw new Error(`Quiz path grep failed: ${quizPathGrep.stderr}`);

const aliasCheck = spawnSync('npx', ['tsx', ALIAS_TOOL], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/place-id-alias-check.log`, `${aliasCheck.stdout ?? ''}${aliasCheck.stderr ?? ''}`, 'utf8');
if (aliasCheck.status !== 0) throw new Error(`Place ID alias check failed with ${aliasCheck.status}`);

const peopleCheck = spawnSync('node', ['tools/audit-people-invalid-place-refs.mjs'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/people-invalid-place-refs.log`, `${peopleCheck.stdout ?? ''}${peopleCheck.stderr ?? ''}`, 'utf8');
if (peopleCheck.status !== 0) throw new Error(`People place-ref audit failed with ${peopleCheck.status}`);

const report = {
  version: DATE,
  batch: BATCH,
  legacyId: LEGACY_ID,
  canonicalId: CANONICAL_ID,
  status: 'retired_duplicate_migrated_to_existing_canonical',
  canonical: {
    file: CANONICAL_FILE,
    name: canonical.name,
    coordinate: { lat: canonical.lat, lon: canonical.lon, r: canonical.r },
    sourceObjectId: canonical.sourceObjectId,
    coordStatus: canonical.coordStatus
  },
  retired: {
    aggregateFile: AGGREGATE_FILE,
    splitFile: SPLIT_FILE,
    evidenceFile: EVIDENCE_FILE,
    oldName: legacyPlace.name,
    oldCoordinate: { lat: legacyPlace.lat, lon: legacyPlace.lon, r: legacyPlace.r }
  },
  migrations: {
    preExactReferenceCount: preOccurrences.length,
    removedCivicationMappings,
    i18nResult,
    lesesporReplacements,
    natureRouteReplacements,
    routeReplacements,
    historicalRouteChapterRetargeted: true,
    removedPersonRelations,
    arbeidermuseetContrastRetargeted: true,
    retiredQuizPackage: QUIZ_SET_FILE,
    removedFlatQuizQuestions: removedFlatQuiz.length,
    quizManifestHadLegacy,
    aliasRegistered: `${LEGACY_ID} -> ${CANONICAL_ID}`
  },
  decision: 'No second Glads mølle coordinate is created. The duplicate legacy place is retired and context-specific references are either retargeted to the existing canonical place or removed when the old relationship was not source-supported.'
};
writeJson(`${REPORT_DIR}/batch-188-result.json`, report);

console.log(JSON.stringify(report, null, 2));
