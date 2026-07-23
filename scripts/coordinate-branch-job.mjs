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
const targetSourceFile = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer/bantjern_salamanderlokalitet.json';

const refs = [
  {
    id: 'maerradalen',
    child: 'data/places/natur/oslo/places_oslo_natur_hovedsteder/maerradalen.json',
    aggregate: 'data/places/natur/oslo/places_oslo_natur_hovedsteder.json',
  },
  {
    id: 'maridalsvannet',
    child: 'data/places/natur/oslo/places_oslo_natur_hovedsteder/maridalsvannet.json',
    aggregate: 'data/places/natur/oslo/places_oslo_natur_hovedsteder.json',
  },
  {
    id: 'blindern_forskningsparken_salamanderdam',
    child: 'data/places/natur/oslo/places_oslo_natur_salamanderdammer/blindern_forskningsparken_salamanderdam.json',
    aggregate: 'data/places/natur/oslo/places_oslo_natur_salamanderdammer.json',
  },
  {
    id: 'bygdoy_kongsgard_salamanderdam',
    child: 'data/places/natur/oslo/places_oslo_natur_salamanderdammer/bygdoy_kongsgard_salamanderdam.json',
    aggregate: 'data/places/natur/oslo/places_oslo_natur_salamanderdammer.json',
  },
  {
    id: 'tjernsmyr_salamanderlokalitet',
    child: 'data/places/natur/oslo/places_oslo_natur_salamanderdammer/tjernsmyr_salamanderlokalitet.json',
    aggregate: 'data/places/natur/oslo/places_oslo_natur_salamanderdammer.json',
  },
];

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');

function removeNearbyTarget(place, context) {
  const nearby = place?.nature_profile?.nearby_place_ids;
  if (!Array.isArray(nearby) || !nearby.includes(targetId)) {
    throw new Error(`${context} no longer contains expected nearby reference ${targetId}`);
  }
  place.nature_profile.nearby_place_ids = nearby.filter((id) => id !== targetId);
}

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
for (const ref of refs) {
  const child = readJson(ref.child);
  if (child.id !== ref.id) throw new Error(`Unexpected child ID in ${ref.child}`);
  const childBefore = [...(child.nature_profile?.nearby_place_ids || [])];
  removeNearbyTarget(child, ref.child);
  writeJson(ref.child, child);

  const aggregate = readJson(ref.aggregate);
  const matches = aggregate.filter((entry) => entry?.id === ref.id);
  if (matches.length !== 1) throw new Error(`${ref.id} must exist exactly once in ${ref.aggregate}`);
  const aggregatePlace = matches[0];
  const aggregateBefore = [...(aggregatePlace.nature_profile?.nearby_place_ids || [])];
  removeNearbyTarget(aggregatePlace, `${ref.aggregate}:${ref.id}`);
  writeJson(ref.aggregate, aggregate);

  changedReferences.push({
    placeId: ref.id,
    childFile: ref.child,
    aggregateFile: ref.aggregate,
    childBefore,
    childAfter: child.nature_profile.nearby_place_ids,
    aggregateBefore,
    aggregateAfter: aggregatePlace.nature_profile.nearby_place_ids,
  });
}

for (const aggregateFile of [...new Set(refs.map((ref) => ref.aggregate))]) {
  const manifestFile = `${aggregateFile.replace(/\.json$/, '')}_manifest.json`;
  const manifest = readJson(manifestFile);
  manifest.source_sha256 = sha256File(aggregateFile);
  manifest.generated_at = new Date().toISOString();
  for (const ref of refs.filter((item) => item.aggregate === aggregateFile)) {
    const row = (manifest.places || []).find((entry) => entry?.id === ref.id);
    if (!row) throw new Error(`${ref.id} missing from ${manifestFile}`);
    row.sha256 = sha256File(ref.child);
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
