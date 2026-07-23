#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 166;
const date = '2026-07-23';
const targetId = 'bantjern_salamanderlokalitet';
const exclusionsFile = 'data/places/place_exclusions.json';
const mappingFile = 'data/Civication/map/historyGoPlaceMapping.natur_salamanderdammer.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-166-bantjern-private-proxy-retirement';
const splitFiles = [
  'data/places/natur/oslo/places_oslo_natur_hovedsteder/maerradalen.json',
  'data/places/natur/oslo/places_oslo_natur_hovedsteder/maridalsvannet.json',
  'data/places/natur/oslo/places_oslo_natur_salamanderdammer/blindern_forskningsparken_salamanderdam.json',
  'data/places/natur/oslo/places_oslo_natur_salamanderdammer/bygdoy_kongsgard_salamanderdam.json',
  'data/places/natur/oslo/places_oslo_natur_salamanderdammer/tjernsmyr_salamanderlokalitet.json',
];

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');

const targetSourceFile = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer/bantjern_salamanderlokalitet.json';
const target = readJson(targetSourceFile);
if (target.id !== targetId) throw new Error('Unexpected target source record');
if (target.coordStatus !== 'needs_source' || target.coordType !== 'legacy_unverified') {
  throw new Error(`${targetId} is no longer the unresolved private-proxy record expected by batch 166`);
}
if (!String(target.sourceHint || '').includes('privat tomt') || !String(target.coordNote || '').includes('offentlig Båntjern-næranker')) {
  throw new Error('Target no longer documents the private-location/public-proxy distinction');
}
if (!(target.quiz_profile?.avoid_angles || []).includes('privat_tomtebesok')) {
  throw new Error('Target no longer explicitly forbids private-property visits');
}

const exclusions = readJson(exclusionsFile);
exclusions.disabledPlaceIds ||= [];
if (exclusions.disabledPlaceIds.includes(targetId)) throw new Error(`${targetId} is already disabled`);
exclusions.disabledPlaceIds.push(targetId);
writeJson(exclusionsFile, exclusions);

const mapping = readJson(mappingFile);
const mappingKey = 'map_bantjern_salamanderlokalitet';
if (mapping.mappings?.[mappingKey]?.historyGoPlaceId !== targetId) {
  throw new Error(`Expected Civication mapping ${mappingKey} for ${targetId}`);
}
delete mapping.mappings[mappingKey];
writeJson(mappingFile, mapping);

const changedReferences = [];
const aggregateGroups = new Map();
for (const splitFile of splitFiles) {
  const place = readJson(splitFile);
  const before = [...(place.nature_profile?.nearby_place_ids || [])];
  if (!before.includes(targetId)) throw new Error(`Expected ${splitFile} to reference ${targetId}`);
  place.nature_profile.nearby_place_ids = before.filter((id) => id !== targetId);
  writeJson(splitFile, place);
  changedReferences.push({ placeId: place.id, splitFile, before, after: place.nature_profile.nearby_place_ids });

  const aggregateFile = `${path.dirname(splitFile)}.json`;
  if (!aggregateGroups.has(aggregateFile)) aggregateGroups.set(aggregateFile, []);
  aggregateGroups.get(aggregateFile).push({ splitFile, place });
}

for (const [aggregateFile, changes] of aggregateGroups) {
  const aggregate = readJson(aggregateFile);
  for (const { place } of changes) {
    const matches = aggregate.filter((entry) => entry?.id === place.id);
    if (matches.length !== 1) throw new Error(`${place.id} must exist exactly once in ${aggregateFile}`);
    const index = aggregate.findIndex((entry) => entry?.id === place.id);
    aggregate[index] = place;
  }
  writeJson(aggregateFile, aggregate);

  const manifestFile = `${aggregateFile.replace(/\.json$/, '')}_manifest.json`;
  const manifest = readJson(manifestFile);
  manifest.source_sha256 = sha256File(aggregateFile);
  manifest.generated_at = new Date().toISOString();
  for (const { splitFile, place } of changes) {
    const row = (manifest.places || []).find((entry) => entry?.id === place.id);
    if (!row) throw new Error(`${place.id} missing from ${manifestFile}`);
    row.sha256 = sha256File(splitFile);
  }
  writeJson(manifestFile, manifest);
}

let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${date}`);
if (!protocol.includes(`Batch ${batch} (${date}) faser ut \`${targetId}\``)) {
  const note = `Batch ${batch} (${date}) faser ut \`${targetId}\` fra aktiv runtime i stedet for å promotere et falskt koordinatanker. Kilderecorden dokumenterer en privat salamanderdam ved Bånntjernveien, mens den eksisterende app-koordinaten uttrykkelig er et offentlig næranker ved det separate skogstjernet Båntjern. Et offentlig proxy-punkt kan derfor ikke verifiseres som selve salamanderlokaliteten, og History Go skal heller ikke publisere et presist besøksmål på privat tomt. ID-en legges i \`disabledPlaceIds\`, Civication-mappingen fjernes, og aktive \`nearby_place_ids\` ryddes. Kilde- og evidensrecorden beholdes som historikk; ingen verified-telling økes.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex < 0) throw new Error('Could not find protocol insertion marker');
  protocol = `${protocol.slice(0, markerIndex)}${note}${protocol.slice(markerIndex)}`;
}
protocol = protocol.split('\n').filter((line) => !(line.includes(`\`${targetId}\``) && line.includes('needs_review'))).join('\n');
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
writeJson(`${reportDir}/batch-166-result.json`, {
  generatedAt: new Date().toISOString(),
  batch,
  targetId,
  action: 'retired_private_proxy',
  disabledPlaceIdsAdded: [targetId],
  civicationMappingRemoved: mappingKey,
  nearbyReferencesRemoved: changedReferences,
  sourceRecordPreserved: targetSourceFile,
  coordinatePromotionPerformed: false,
  reason: 'The documented salamander pond is private, while the active coordinate was only a public near-anchor at the separate Båntjern lake. The proxy cannot be promoted to verified geometry and a precise private habitat coordinate is not an appropriate History Go destination.',
});
fs.writeFileSync(abs(`${reportDir}/sources.md`), `# Batch 166 source decision\n\n- Norsk Naturarv documents the Bånntjernveien 5 salamander pond as privately owned: https://www.naturarv.no/baantjernveien-5.371982-72064.html\n- Oslo kommune documents Båntjern as a separate public forest lake/bathing destination: https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/bantjern/\n- The canonical source record itself explicitly states that the app point is a public pedagogical near-anchor and not the private pond.\n`);

console.log(JSON.stringify({
  batch,
  targetId,
  action: 'retired_private_proxy',
  disabled: true,
  civicationMappingRemoved: mappingKey,
  nearbyReferenceCount: changedReferences.length,
  coordinatePromotionPerformed: false,
}, null, 2));
