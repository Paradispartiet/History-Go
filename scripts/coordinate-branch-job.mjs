import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataRoot = path.join(root, 'data');
const retiredId = 'bygdoy_kongsgard_salamanderdam';
const hostId = 'bygdoy_kongsgard';
const reportRel = 'reports/oslo-coordinate-retire-bygdoy-kongsgard-salamanderdam-post-195';
const reportDir = path.join(root, reportRel);
const placeManifestRel = 'data/places/manifest.json';
const exclusionsRel = 'data/places/place_exclusions.json';
const globalIndexRel = 'data/places/places_index.json';
const evidenceRel = 'data/coordinate-evidence/oslo/natur/bygdoy_kongsgard_salamanderdam.json';
const evidenceManifestRel = 'data/coordinate-evidence/manifest.json';
const knownRetiredSplitRel = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer/bygdoy_kongsgard_salamanderdam.json';
const knownHostSplitRel = 'data/places/historie/oslo/places_historie/bygdoy_kongsgard.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const rel = (fullPath) => path.relative(root, fullPath).split(path.sep).join('/');
const exists = async (relativePath) => {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
};
const readText = async (relativePath) => fs.readFile(path.join(root, relativePath), 'utf8');
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));
const writeJson = async (relativePath, value) => {
  await fs.mkdir(path.dirname(path.join(root, relativePath)), { recursive: true });
  await fs.writeFile(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const sha256File = async (relativePath) => crypto
  .createHash('sha256')
  .update(await fs.readFile(path.join(root, relativePath)))
  .digest('hex');
const asDataRel = (entry) => {
  const normalized = String(entry).trim().replaceAll('\\', '/');
  return normalized.startsWith('data/') ? normalized : `data/${normalized}`;
};
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const placesFrom = (value) => {
  if (Array.isArray(value)) return value.filter(isObject);
  if (isObject(value) && Array.isArray(value.places)) return value.places.filter(isObject);
  if (isObject(value) && typeof value.id === 'string') return [value];
  return [];
};
const unique = (values) => [...new Set(values)];
const appendUnique = (values, additions) => unique([...(Array.isArray(values) ? values : []), ...additions]);

const walkJson = async (directory) => {
  const output = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walkJson(full));
    else if (entry.name.endsWith('.json')) output.push(full);
  }
  return output;
};

const identityFields = ['id', 'placeId', 'place_id', 'historyGoPlaceId', 'history_go_place_id', 'targetId'];
const hasRetiredIdentity = (value) => isObject(value) && identityFields.some((field) => value[field] === retiredId);
const pruneRetiredReference = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== retiredId && !hasRetiredIdentity(item))
      .map(pruneRetiredReference);
  }
  if (!isObject(value)) return value;
  const output = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === retiredId || key === `map_${retiredId}`) continue;
    if (child === retiredId || hasRetiredIdentity(child)) continue;
    output[key] = pruneRetiredReference(child);
  }
  return output;
};
const pruneSourceButPreserveRetiredRecord = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => hasRetiredIdentity(item) ? item : pruneRetiredReference(item));
  }
  if (isObject(value) && Array.isArray(value.places)) {
    return {
      ...value,
      places: value.places.map((item) => hasRetiredIdentity(item) ? item : pruneRetiredReference(item)),
    };
  }
  return value;
};

const replacePlace = (value, placeId, replacement) => {
  let replacements = 0;
  if (Array.isArray(value)) {
    const output = value.map((item) => {
      if (isObject(item) && item.id === placeId) {
        replacements += 1;
        return replacement;
      }
      return item;
    });
    return { value: output, replacements };
  }
  if (isObject(value) && Array.isArray(value.places)) {
    const output = {
      ...value,
      places: value.places.map((item) => {
        if (isObject(item) && item.id === placeId) {
          replacements += 1;
          return replacement;
        }
        return item;
      }),
    };
    return { value: output, replacements };
  }
  if (isObject(value) && value.id === placeId) return { value: replacement, replacements: 1 };
  return { value, replacements: 0 };
};

const protocolBefore = await readText(protocolRel);
const protocolBatches = [...protocolBefore.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...protocolBatches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocolBefore), 'Batch 196 already exists; rerun this migration from the new state.');

const audit = await readJson('reports/oslo-coordinate-bygdoy-kongsgard-salamander-model-audit-post-195/summary.json');
assert(audit.placeId === retiredId, 'Model audit has the wrong place ID.');
assert(audit.hostPlaceId === hostId, 'Model audit has the wrong host place ID.');
assert(audit.decision === 'model_as_thematic_relation_retire_separate_marker', `Unexpected model decision: ${audit.decision}`);
assert(audit.canonicalChanged === false, 'Research audit unexpectedly changed canonical data.');
assert(audit.findings?.sourceHasPublicCoordinates === false, 'A public source coordinate now exists; automatic retirement must stop.');
assert(audit.findings?.kartverketOsloExactCandidates === 0, 'An exact Kartverket candidate now exists; automatic retirement must stop.');
assert(audit.findings?.overpassExactNamedWaterElements === 0, 'An exact named water object now exists; automatic retirement must stop.');

const runtimeIndexBefore = await readJson(globalIndexRel);
const runtimePlacesBefore = placesFrom(runtimeIndexBefore);
assert(runtimePlacesBefore.some((place) => place.id === retiredId), 'Separate salamander marker is already absent from the runtime index.');
const runtimeHostBefore = runtimePlacesBefore.find((place) => place.id === hostId);
assert(runtimeHostBefore, 'Verified Bygdø Kongsgård host is absent from the runtime index.');

const placesManifest = await readJson(placeManifestRel);
const manifestFiles = (placesManifest.files ?? []).map(asDataRel);
const activeRetiredSources = [];
const activeHostSources = [];
for (const sourceRel of manifestFiles) {
  if (!(await exists(sourceRel))) continue;
  let data;
  try {
    data = await readJson(sourceRel);
  } catch {
    continue;
  }
  const ids = new Set(placesFrom(data).map((place) => place.id));
  if (ids.has(retiredId)) activeRetiredSources.push(sourceRel);
  if (ids.has(hostId)) activeHostSources.push(sourceRel);
}
assert(activeRetiredSources.length >= 1, 'No manifest-loaded source contains the salamander marker.');
assert(activeHostSources.length >= 1, 'No manifest-loaded source contains Bygdø Kongsgård.');

const hostSourceRecords = [];
for (const sourceRel of activeHostSources) {
  const data = await readJson(sourceRel);
  hostSourceRecords.push(...placesFrom(data).filter((place) => place.id === hostId).map((place) => ({ sourceRel, place })));
}
assert(hostSourceRecords.length >= 1, 'Could not load the active host record.');
const hostBefore = hostSourceRecords[0].place;
assert(hostBefore.coordStatus === 'verified_geometry', 'Host place is not verified geometry.');
const lockedHostCoordinate = { lat: hostBefore.lat, lon: hostBefore.lon, r: hostBefore.r };

const hostPopupDesc = `Bygdø Kongsgård er en av de eldste eiendommene i Norge med sammenhengende tilknytning til kongemakten. Kongsgårdens historie kan følges tilbake til middelalderen, mens dagens hovedbygning ble reist på 1730-tallet og ble sentrum i et større gårds- og hageanlegg.\n\nStedet er historisk viktig fordi det forbinder middelalderens krongods, 1700-tallets lystgårdskultur, unionstid og det moderne norske kongehuset i ett fysisk anlegg. Christian Frederik bodde her i 1814, og senere kongelige familier brukte gården som sommersted. Etter restaurering ble tradisjonen med kongelig sommerresidens tatt opp igjen i 2007.\n\nKongsgårdens park- og kulturlandskap rommer også en dokumentert fiskeløs dam med både storsalamander og småsalamander. History Go bruker fortsatt det verifiserte besøksankeret ved Kongsgården og publiserer ikke en presis posisjon for det sårbare ynglehabitatet. Naturinnholdet handler derfor om hvordan dam, eng, park og andre landarealer virker sammen gjennom salamandernes livssyklus, og om skånsom observasjon uten fangst eller forstyrrelse.`;

const migrateHost = (source) => {
  const quiz = isObject(source.quiz_profile) ? structuredClone(source.quiz_profile) : {};
  quiz.signature_features = appendUnique(quiz.signature_features, [
    'kulturlandskap med dokumentert fiskeløs salamanderdam',
  ]);
  quiz.primary_angles = appendUnique(quiz.primary_angles, [
    'kulturlandskap_og_amfibiehabitat',
  ]);
  quiz.avoid_angles = appendUnique(
    (Array.isArray(quiz.avoid_angles) ? quiz.avoid_angles : []).filter((value) => value !== 'forveksle_med_bygdoy_kongsgard_salamanderdam'),
    ['presis_lokalisering_av_salamanderhabitat'],
  );
  quiz.must_include = appendUnique(quiz.must_include, [
    'at kongsgårdens kulturlandskap rommer dokumentert salamanderhabitat uten at den presise damposisjonen publiseres',
  ]);
  quiz.contrast_targets = (Array.isArray(quiz.contrast_targets) ? quiz.contrast_targets : []).filter((value) => value !== retiredId);
  quiz.notes = 'Spør om det konkrete kongsgårdsanlegget, den lange kongelige brukshistorien og hvordan park- og kulturlandskapet samtidig fungerer som salamanderhabitat. Ikke be om presis damlokalisering eller artsjakt.';

  const badgeRefs = isObject(source.badge_refs) ? structuredClone(source.badge_refs) : {
    primary: 'historie',
    subs: [],
    also: [],
  };
  badgeRefs.primary ??= 'historie';
  badgeRefs.subs = Array.isArray(badgeRefs.subs) ? badgeRefs.subs : [];
  badgeRefs.also = appendUnique(badgeRefs.also, ['natur']);

  const externalLinks = Array.isArray(source.externalLinks) ? structuredClone(source.externalLinks) : [];
  const natureSourceUrl = 'https://www.naturarv.no/dam-paa-kongsgaarden-bygdoey-oslo.323262-36137.html';
  if (!externalLinks.some((link) => link?.url === natureSourceUrl)) {
    externalLinks.push({
      type: 'nature_source',
      label: 'Norsk Naturarv – dam på Bygdøy Kongsgård',
      url: natureSourceUrl,
      lang: 'no',
      verifiedAt: '2026-07-24',
    });
  }

  return {
    ...source,
    popupDesc: hostPopupDesc,
    rounds: appendUnique(source.rounds, ['nature', 'leksikon', 'routes']),
    badge_refs: badgeRefs,
    tags: appendUnique(source.tags, ['salamander', 'amfibier', 'fiskeløs dam', 'kulturlandskap', 'vern']),
    routeId: 'oslo_salamanderdammer',
    sourceHint: 'Norsk Naturarv dokumenterer både storsalamander og småsalamander i en fiskeløs dam i Kongsgårdens kulturlandskap. History Go bruker Kongsgårdens verifiserte besøksanker og publiserer ikke den presise habitatposisjonen.',
    nature_profile: {
      type: 'kongsgårdslandskap / fiskeløs salamanderdam / amfibiehabitat',
      title: 'Salamanderhabitatet i kongsgårdens kulturlandskap',
      summary: 'I park- og kulturlandskapet ved Bygdø Kongsgård finnes en dokumentert fiskeløs dam med både storsalamander og småsalamander. Naturverdien ligger ikke bare i vannspeilet, men også i eng, park, jord og skjulesteder som dyrene bruker utenfor yngletiden. History Go formidler habitatet fra Kongsgårdens offentlige besøksanker og oppgir ikke en presis damposisjon.',
      themes: [
        'fiskeløs yngledam',
        'storsalamander og småsalamander',
        'kulturlandskap som landhabitat',
        'vann og land i samme livssyklus',
        'skånsom observasjon uten håndtering',
        'vern uten presis habitatpublisering',
      ],
      nearby_place_ids: [
        'tjernsmyr_salamanderlokalitet',
        'blindern_forskningsparken_salamanderdam',
      ],
    },
    quiz_profile: quiz,
    externalLinks,
  };
};

const migratedHost = migrateHost(hostBefore);
assert(migratedHost.lat === lockedHostCoordinate.lat && migratedHost.lon === lockedHostCoordinate.lon && migratedHost.r === lockedHostCoordinate.r,
  'Host coordinate changed during thematic migration.');
assert(migratedHost.coordStatus === 'verified_geometry', 'Host verification status changed during thematic migration.');

const modified = new Set();
const writeIfChanged = async (relativePath, before, after) => {
  if (JSON.stringify(before) === JSON.stringify(after)) return false;
  await writeJson(relativePath, after);
  modified.add(relativePath);
  return true;
};

const hostPlacePaths = new Set();
for (const sourceRel of activeHostSources) {
  const before = await readJson(sourceRel);
  const replaced = replacePlace(before, hostId, migratedHost);
  assert(replaced.replacements >= 1, `Host record disappeared from ${sourceRel}.`);
  await writeIfChanged(sourceRel, before, replaced.value);
  hostPlacePaths.add(sourceRel);
}
if (await exists(knownHostSplitRel)) {
  const before = await readJson(knownHostSplitRel);
  const replaced = replacePlace(before, hostId, migratedHost);
  assert(replaced.replacements === 1, 'Known Bygdø Kongsgård split file has the wrong shape.');
  await writeIfChanged(knownHostSplitRel, before, replaced.value);
  hostPlacePaths.add(knownHostSplitRel);
}

const exclusions = await readJson(exclusionsRel);
assert(Array.isArray(exclusions.disabledPlaceIds), 'place_exclusions.json has no disabledPlaceIds array.');
assert(!exclusions.disabledPlaceIds.includes(retiredId), 'Separate salamander marker is already disabled.');
exclusions.disabledPlaceIds.push(retiredId);
exclusions.reason = 'Hybrid-/akse-/vegg-/undergang-/passasje-objekter, pensjonerte duplikatposter og tematiske/sensitive lokaliteter uten publiserbar egen geometri skal ikke være aktive History Go-steder. Kildedata kan beholdes for historikk eller migrering, men ID-ene filtreres ut av aktiv place-index og runtime.';
await writeJson(exclusionsRel, exclusions);
modified.add(exclusionsRel);

const allDataJson = await walkJson(dataRoot);
const targetSourcePaths = new Set(activeRetiredSources);
if (await exists(knownRetiredSplitRel)) targetSourcePaths.add(knownRetiredSplitRel);

const targetSplitMetadataPaths = new Set();
for (const fullPath of allDataJson) {
  const relativePath = rel(fullPath);
  if (!relativePath.startsWith('data/places/') || !relativePath.endsWith('_manifest.json')) continue;
  let manifest;
  try { manifest = JSON.parse(await fs.readFile(fullPath, 'utf8')); } catch { continue; }
  const row = Array.isArray(manifest.places) ? manifest.places.find((item) => item?.id === retiredId) : null;
  if (!row) continue;
  targetSplitMetadataPaths.add(relativePath);
  if (typeof row.file === 'string') {
    const childRel = rel(path.join(path.dirname(fullPath), row.file));
    targetSourcePaths.add(childRel);
  }
  const indexRel = relativePath.replace(/_manifest\.json$/, '_index.json');
  if (await exists(indexRel)) targetSplitMetadataPaths.add(indexRel);
}

for (const sourceRel of targetSourcePaths) {
  if (!(await exists(sourceRel))) continue;
  const before = await readJson(sourceRel);
  const after = pruneSourceButPreserveRetiredRecord(before);
  await writeIfChanged(sourceRel, before, after);
}

const protectedReferences = new Set([
  ...targetSourcePaths,
  ...targetSplitMetadataPaths,
  exclusionsRel,
  evidenceRel,
  evidenceManifestRel,
  globalIndexRel,
  placeManifestRel,
  ...hostPlacePaths,
]);

const derivativeFilesChanged = [];
for (const fullPath of allDataJson) {
  const relativePath = rel(fullPath);
  if (protectedReferences.has(relativePath)) continue;
  const text = await fs.readFile(fullPath, 'utf8');
  if (!text.includes(`"${retiredId}"`)) continue;
  let before;
  try { before = JSON.parse(text); } catch { continue; }
  const after = pruneRetiredReference(before);
  if (await writeIfChanged(relativePath, before, after)) derivativeFilesChanged.push(relativePath);
}

const refreshManifest = async (manifestRel) => {
  const manifest = await readJson(manifestRel);
  if (!isObject(manifest) || !Array.isArray(manifest.places)) return false;
  const baseDir = path.dirname(manifestRel);
  const sourceRel = manifest.source_path ? asDataRel(manifest.source_path) : path.join(baseDir, String(manifest.source_file ?? '')).replaceAll('\\', '/');
  const childPaths = manifest.places
    .filter((row) => typeof row.file === 'string')
    .map((row) => path.join(baseDir, row.file).replaceAll('\\', '/'));
  const touchesManifest = modified.has(sourceRel) || childPaths.some((childRel) => modified.has(childRel));
  if (!touchesManifest) return false;
  if (await exists(sourceRel)) manifest.source_sha256 = await sha256File(sourceRel);
  manifest.generated_at = new Date().toISOString();
  manifest.place_count = manifest.places.length;
  for (const row of manifest.places) {
    if (typeof row.file !== 'string') continue;
    const childRel = path.join(baseDir, row.file).replaceAll('\\', '/');
    if (await exists(childRel)) row.sha256 = await sha256File(childRel);
  }
  await writeJson(manifestRel, manifest);
  modified.add(manifestRel);
  return true;
};

for (const fullPath of allDataJson) {
  const relativePath = rel(fullPath);
  if (relativePath.startsWith('data/places/') && relativePath.endsWith('_manifest.json')) {
    await refreshManifest(relativePath);
  }
}

const protocolRow = `| \`${retiredId}\` | Separat kartmarkør avviklet; naturkunnskapen er flyttet til \`${hostId}\` | \`reports/oslo-coordinate-bygdoy-kongsgard-salamander-model-audit-post-195/summary.json\` | Verifisert offentlig Kongsgård-anker brukes til formidling; presis habitatposisjon publiseres ikke |`;
assert(!protocolBefore.includes(protocolRow), 'Protocol already contains the salamander retirement row.');
const protocolAfter = `${protocolBefore.trimEnd()}\n${protocolRow}\n`;
await fs.writeFile(path.join(root, protocolRel), protocolAfter, 'utf8');
modified.add(protocolRel);

const hostAfterRecords = [];
for (const sourceRel of activeHostSources) {
  const data = await readJson(sourceRel);
  hostAfterRecords.push(...placesFrom(data).filter((place) => place.id === hostId));
}
assert(hostAfterRecords.length >= 1, 'Migrated host disappeared from active sources.');
for (const hostAfter of hostAfterRecords) {
  assert(hostAfter.coordStatus === 'verified_geometry', 'Migrated host lost verified status.');
  assert(hostAfter.lat === lockedHostCoordinate.lat && hostAfter.lon === lockedHostCoordinate.lon && hostAfter.r === lockedHostCoordinate.r,
    'Migrated host coordinate changed.');
  assert(hostAfter.routeId === 'oslo_salamanderdammer', 'Salamander route was not attached to the host.');
  assert(hostAfter.nature_profile?.title === 'Salamanderhabitatet i kongsgårdens kulturlandskap', 'Nature profile was not attached to the host.');
  assert(!JSON.stringify(hostAfter).includes(retiredId), 'Host still references the disabled marker ID.');
}

const exclusionsAfter = await readJson(exclusionsRel);
assert(exclusionsAfter.disabledPlaceIds.includes(retiredId), 'Disabled marker ID was not persisted.');
assert(await exists(evidenceRel), 'Coordinate evidence was deleted; source history must be preserved.');
assert(await exists(knownRetiredSplitRel), 'The source-led salamander record was deleted; it must remain as disabled history.');

const allowedReferencePaths = new Set([
  ...targetSourcePaths,
  ...targetSplitMetadataPaths,
  exclusionsRel,
  evidenceRel,
  evidenceManifestRel,
  globalIndexRel,
]);
const remainingUnexpectedReferences = [];
const generatedReferencesPendingRebuild = [];
for (const fullPath of await walkJson(dataRoot)) {
  const relativePath = rel(fullPath);
  const text = await fs.readFile(fullPath, 'utf8');
  if (!text.includes(`"${retiredId}"`)) continue;
  if (relativePath === globalIndexRel) generatedReferencesPendingRebuild.push(relativePath);
  else if (!allowedReferencePaths.has(relativePath)) remainingUnexpectedReferences.push(relativePath);
}
assert(remainingUnexpectedReferences.length === 0,
  `Disabled marker remains in active derivative JSON: ${remainingUnexpectedReferences.join(', ')}`);

await fs.mkdir(reportDir, { recursive: true });
const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  placeId: retiredId,
  hostPlaceId: hostId,
  decision: 'disabled_separate_marker_migrated_to_verified_host',
  canonicalChanged: true,
  coordinatePromoted: false,
  sourceRecordPreserved: true,
  coordinateEvidencePreserved: true,
  hostCoordinateChanged: false,
  reason: 'The salamander locality is documented, but no public named geometry or source coordinate supports a separate map marker. The broad proxy is disabled, while source-led habitat knowledge is attached to the verified public Bygdø Kongsgård anchor without publishing a precise sensitive locality.',
  sourceAudit: 'reports/oslo-coordinate-bygdoy-kongsgard-salamander-model-audit-post-195/summary.json',
  activeRetiredSources,
  activeHostSources,
  targetSourcePaths: [...targetSourcePaths].sort(),
  derivativeFilesChanged: derivativeFilesChanged.sort(),
  modifiedFiles: [...modified].sort(),
  remainingUnexpectedReferences,
  generatedReferencesPendingRebuild,
  nextQueueCandidate: 'ostensjovannet_sivbelte',
};
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Retire Bygdøy Kongsgård salamander marker after batch 195\n\n- Disabled marker: **\`${retiredId}\`**\n- Verified host: **\`${hostId}\`**\n- Coordinate promoted: **no**\n- Source record preserved: **yes**\n- Coordinate evidence preserved: **yes**\n- Host coordinate changed: **no**\n- Unexpected active derivative references: **${remainingUnexpectedReferences.length}**\n- Next queue candidate: **\`ostensjovannet_sivbelte\`**\n\nThe separate broad proxy is filtered from runtime. The documented salamander habitat is now presented through the verified public Kongsgård anchor as a nature profile and salamander-route stop, with explicit protection against precise habitat publication or animal handling.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'thematic_migration_applied',
  reportDir: reportRel,
  placeId: retiredId,
  hostPlaceId: hostId,
  derivativeFilesChanged: derivativeFilesChanged.length,
  modifiedFiles: modified.size,
  remainingUnexpectedReferences: remainingUnexpectedReferences.length,
  generatedReferencesPendingRebuild: generatedReferencesPendingRebuild.length,
  nextQueueCandidate: 'ostensjovannet_sivbelte',
}, null, 2));
