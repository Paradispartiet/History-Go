import fs from 'fs';
import path from 'path';
import { PLACE_REF_KEYS, buildActivePlaceIdSet, collectRefsByKeys, manifestFilesToPaths, readJson, toArray } from './lib/placeRefAuditUtils.mjs';

const root = process.cwd();
const placesManifestPath = path.join(root, 'data/places/manifest.json');
const peopleManifestPath = path.join(root, 'data/people/manifest.json');
const reportJsonPath = path.join(root, 'reports/people-invalid-place-refs.json');
const reportMdPath = path.join(root, 'reports/people-invalid-place-refs.md');

function normalizeId(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.85;
  const at = new Set(a.split('-').filter(Boolean));
  const bt = new Set(b.split('-').filter(Boolean));
  if (!at.size || !bt.size) return 0;
  const inter = [...at].filter((t) => bt.has(t)).length;
  return inter / Math.max(at.size, bt.size);
}

const peopleManifest = readJson(peopleManifestPath);
const placeIds = buildActivePlaceIdSet(root, placesManifestPath);

const validPlaceIds = [...placeIds].sort((a, b) => a.localeCompare(b, 'nb'));
const validNormToIds = new Map();
for (const pid of validPlaceIds) {
  const n = normalizeId(pid);
  if (!validNormToIds.has(n)) validNormToIds.set(n, []);
  validNormToIds.get(n).push(pid);
}

const invalidByFile = new Map();
const invalidByPlaceId = new Map();
const peopleWithoutValidPlace = [];
const duplicatePlaceRefs = [];
let peopleCount = 0;

for (const filePath of manifestFilesToPaths(root, peopleManifestPath)) {
  const sourceFile = path.relative(root, filePath).replace(/\\/g, '/');
  const people = toArray(readJson(filePath));

  for (const person of people) {
    peopleCount += 1;
    const personId = person?.id || '(missing-id)';
    const personName = person?.name || '(missing-name)';
    const refs = collectRefsByKeys(person, PLACE_REF_KEYS).map((ref) => ({ placeId: String(ref.value).trim(), field: ref.key })).filter((ref) => ref.placeId);

    const refValues = refs.map((r) => r.placeId);
    const validRefs = [...new Set(refValues.filter((pid) => placeIds.has(pid)))];
    const counts = new Map();
    for (const pid of refValues) counts.set(pid, (counts.get(pid) || 0) + 1);
    const duplicates = [...counts.entries()].filter(([, c]) => c > 1);

    if (validRefs.length === 0) {
      peopleWithoutValidPlace.push({ sourceFile, personId, personName, totalRefs: refs.length, refs: refValues });
    }

    for (const [placeId, count] of duplicates) {
      duplicatePlaceRefs.push({ sourceFile, personId, personName, placeId, count, fields: refs.filter((r) => r.placeId === placeId).map((r) => r.field) });
    }

    for (const ref of refs) {
      if (placeIds.has(ref.placeId)) continue;
      const row = { sourceFile, personId, personName, field: ref.field, invalidPlaceId: ref.placeId };

      if (!invalidByFile.has(sourceFile)) invalidByFile.set(sourceFile, new Map());
      const personMap = invalidByFile.get(sourceFile);
      if (!personMap.has(personId)) personMap.set(personId, []);
      personMap.get(personId).push(row);

      if (!invalidByPlaceId.has(ref.placeId)) invalidByPlaceId.set(ref.placeId, []);
      invalidByPlaceId.get(ref.placeId).push(row);
    }
  }
}

function suggestCandidates(invalidPlaceId) {
  const norm = normalizeId(invalidPlaceId);
  const exact = validNormToIds.get(norm) || [];
  if (exact.length) {
    return {
      status: 'likely_rename_to_existing_place',
      suggestions: exact.slice(0, 5).map((id) => ({ placeId: id, confidence: 'high' })),
    };
  }

  const scored = validPlaceIds
    .map((pid) => ({ placeId: pid, score: similarity(norm, normalizeId(pid)) }))
    .filter((r) => r.score >= 0.45)
    .sort((a, b) => b.score - a.score || a.placeId.localeCompare(b.placeId, 'nb'))
    .slice(0, 5)
    .map((r) => ({ placeId: r.placeId, confidence: r.score >= 0.75 ? 'medium' : 'low' }));

  if (!scored.length) return { status: 'missing_place_candidate', suggestions: [] };
  const onlyLow = scored.every((s) => s.confidence === 'low');
  return { status: onlyLow ? 'needs_manual_review' : 'likely_rename_to_existing_place', suggestions: scored };
}

const invalidGroups = [...invalidByFile.entries()].map(([sourceFile, peopleMap]) => ({
  sourceFile,
  people: [...peopleMap.entries()].map(([personId, refs]) => ({
    personId,
    personName: refs[0]?.personName || '(missing-name)',
    invalidPlaceIds: [...new Set(refs.map((r) => r.invalidPlaceId))].sort((a, b) => a.localeCompare(b, 'nb')),
    invalidRefs: refs.sort((a, b) => a.invalidPlaceId.localeCompare(b.invalidPlaceId, 'nb') || a.field.localeCompare(b.field, 'nb')),
  })),
})).sort((a, b) => a.sourceFile.localeCompare(b.sourceFile, 'nb'));

const uniqueInvalidPlaceIds = [...invalidByPlaceId.keys()].sort((a, b) => a.localeCompare(b, 'nb')).map((invalidPlaceId) => {
  const suggestion = suggestCandidates(invalidPlaceId);
  const refs = invalidByPlaceId.get(invalidPlaceId);
  return {
    invalidPlaceId,
    occurrences: refs.length,
    peopleCount: new Set(refs.map((r) => r.personId)).size,
    sourceFiles: [...new Set(refs.map((r) => r.sourceFile))],
    classification: suggestion.status,
    suggestions: suggestion.suggestions,
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  input: {
    placesManifest: 'data/places/manifest.json',
    peopleManifest: 'data/people/manifest.json',
    peopleJsonUsed: false,
  },
  summary: {
    peopleFilesRead: (peopleManifest.files || []).length,
    peopleRead: peopleCount,
    peopleWithInvalidRefs: new Set([].concat(...[...invalidByPlaceId.values()].map((arr) => arr.map((r) => `${r.sourceFile}::${r.personId}`)))).size,
    invalidRefs: [...invalidByPlaceId.values()].reduce((n, arr) => n + arr.length, 0),
    uniqueInvalidPlaceIds: uniqueInvalidPlaceIds.length,
    peopleWithoutValidPlace: peopleWithoutValidPlace.length,
    duplicateInternalPlaceRefs: duplicatePlaceRefs.length,
  },
  invalidRefsGrouped: invalidGroups,
  uniqueInvalidPlaceIds,
  peopleWithoutValidPlace,
  duplicateInternalPlaceRefs: duplicatePlaceRefs,
  recommendedNextBatch: uniqueInvalidPlaceIds
    .sort((a, b) => b.occurrences - a.occurrences || a.invalidPlaceId.localeCompare(b.invalidPlaceId, 'nb'))
    .slice(0, 15)
    .map((row) => ({ invalidPlaceId: row.invalidPlaceId, classification: row.classification, occurrences: row.occurrences, suggestions: row.suggestions })),
};

fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

const md = [];
md.push('# People invalid place refs audit');
md.push('');
md.push(`Generated: ${report.generatedAt}`);
md.push('');
md.push('## Sammendrag');
md.push(`- People-filer lest: **${report.summary.peopleFilesRead}**`);
md.push(`- People lest: **${report.summary.peopleRead}**`);
md.push(`- People med ugyldige refs: **${report.summary.peopleWithInvalidRefs}**`);
md.push(`- Ugyldige refs: **${report.summary.invalidRefs}**`);
md.push(`- Unike ugyldige placeId-er: **${report.summary.uniqueInvalidPlaceIds}**`);
md.push(`- People uten gyldig sted: **${report.summary.peopleWithoutValidPlace}**`);
md.push(`- Duplikate interne place-referanser: **${report.summary.duplicateInternalPlaceRefs}**`);
md.push('');
md.push('## Ugyldige refs gruppert per fil/person');
for (const fileGroup of report.invalidRefsGrouped) {
  md.push(`### ${fileGroup.sourceFile}`);
  for (const person of fileGroup.people) {
    md.push(`- **${person.personId}** (${person.personName})`);
    for (const ref of person.invalidRefs) {
      md.push(`  - ${ref.invalidPlaceId} @ \`${ref.field}\``);
    }
  }
}
md.push('');
md.push('## Unike ugyldige placeId-er og kandidatforslag');
for (const item of report.uniqueInvalidPlaceIds) {
  md.push(`- **${item.invalidPlaceId}** (${item.classification}, ${item.occurrences} treff)`);
  if (!item.suggestions.length) {
    md.push('  - missing_place_candidate');
  } else {
    for (const s of item.suggestions) md.push(`  - ${s.placeId} (confidence: ${s.confidence})`);
  }
}
md.push('');
md.push('## People uten gyldig sted');
for (const p of report.peopleWithoutValidPlace) {
  md.push(`- ${p.sourceFile} :: ${p.personId} (${p.personName})`);
}
md.push('');
md.push('## Duplikate place-referanser inne i people');
for (const d of report.duplicateInternalPlaceRefs) {
  md.push(`- ${d.sourceFile} :: ${d.personId} (${d.personName}) -> ${d.placeId} x${d.count}`);
}
md.push('');
md.push('## Anbefalt neste ryddebatch');
for (const r of report.recommendedNextBatch) {
  md.push(`- ${r.invalidPlaceId} (${r.classification}, ${r.occurrences} treff)`);
}

fs.writeFileSync(reportMdPath, `${md.join('\n')}\n`, 'utf8');
console.log(`Wrote ${path.relative(root, reportJsonPath)} and ${path.relative(root, reportMdPath)}`);
