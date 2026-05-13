import fs from 'fs';
import path from 'path';

const root = process.cwd();
const legacyPath = path.join(root, 'data/people.json');
const peopleDir = path.join(root, 'data/people');
const relationsPath = path.join(root, 'data/relations.json');
const bootPath = path.join(root, 'js/boot.js');
const reportJsonPath = path.join(root, 'reports/people-split-vs-legacy.json');
const reportMdPath = path.join(root, 'reports/people-split-vs-legacy.md');
const relationOnlyLegacyStubExclusions = new Set(['per_petterson']);

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function toPeopleArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.people)) return data.people;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function normalizeRepoPath(filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'nb'));
}

function personSummary(person, sourceFile) {
  return {
    id: person?.id || null,
    name: person?.name || null,
    category: person?.category || null,
    year: person?.year ?? null,
    desc: person?.desc ?? null,
    popupDesc: person?.popupDesc ?? null,
    image: person?.image ?? null,
    cardImage: person?.cardImage ?? null,
    tags: Array.isArray(person?.tags) ? person.tags : [],
    placeId: person?.placeId || person?.place_id || person?.place || null,
    places: Array.isArray(person?.places) ? person.places : [],
    stub: !!person?.stub,
    sourceFile,
  };
}

function indexPeople(rows, sourceFile) {
  const byId = new Map();
  const missingId = [];
  const duplicates = [];

  for (const person of rows) {
    const summary = personSummary(person, sourceFile);
    if (!summary.id) {
      missingId.push(summary);
      continue;
    }
    if (!byId.has(summary.id)) byId.set(summary.id, []);
    byId.get(summary.id).push(summary);
  }

  for (const [id, entries] of byId.entries()) {
    if (entries.length > 1) duplicates.push({ id, entries });
  }

  return { byId, missingId, duplicates };
}

function collectPeopleFiles() {
  if (!fs.existsSync(peopleDir)) return [];
  return fs.readdirSync(peopleDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /^people_.*\.json$/i.test(name))
    .sort((a, b) => a.localeCompare(b, 'nb'))
    .map((name) => path.join(peopleDir, name));
}

function extractBootPeopleFileList() {
  if (!fs.existsSync(bootPath)) return [];
  const boot = readText(bootPath);
  const match = boot.match(/const\s+PEOPLE_FILE_LIST\s*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  const body = match[1];
  const files = [];
  const re = /["']([^"']*data\/people\/people_[^"']+\.json)["']/g;
  let item;
  while ((item = re.exec(body))) files.push(item[1]);
  return uniqueSorted(files);
}

function compareSimpleFields(legacyEntry, splitEntry) {
  const fields = ['name', 'category', 'placeId', 'year', 'desc', 'popupDesc', 'image', 'cardImage'];
  const changed = [];
  for (const field of fields) {
    const a = legacyEntry?.[field];
    const b = splitEntry?.[field];
    if (JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)) changed.push(field);
  }
  return changed;
}

function extractRelationPersonIds() {
  if (!fs.existsSync(relationsPath)) return new Set();
  const relationRows = readJson(relationsPath);
  if (!Array.isArray(relationRows)) return new Set();
  const personIds = relationRows
    .map((row) => row?.person || null)
    .filter(Boolean);
  return new Set(personIds);
}

function mdEscape(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}

const generatedAt = new Date().toISOString();
const legacyRows = fs.existsSync(legacyPath) ? toPeopleArray(readJson(legacyPath)) : [];
const legacyIndex = indexPeople(legacyRows, 'data/people.json');

const peopleFiles = collectPeopleFiles();
const runtimeFiles = extractBootPeopleFileList();
const runtimeSet = new Set(runtimeFiles);

const splitRows = [];
const fileSummaries = [];
const splitMissingId = [];
const invalidJsonFiles = [];

for (const filePath of peopleFiles) {
  const sourceFile = normalizeRepoPath(filePath);
  try {
    const rows = toPeopleArray(readJson(filePath));
    const indexed = indexPeople(rows, sourceFile);
    splitRows.push(...rows.map((person) => personSummary(person, sourceFile)));
    splitMissingId.push(...indexed.missingId);
    fileSummaries.push({
      file: sourceFile,
      loadedByBoot: runtimeSet.has(sourceFile),
      peopleCount: rows.length,
      missingIdCount: indexed.missingId.length,
      duplicateIdsInsideFile: indexed.duplicates.map((row) => row.id),
    });
  } catch (error) {
    invalidJsonFiles.push({ file: sourceFile, error: String(error?.message || error) });
  }
}

const splitById = new Map();
for (const row of splitRows) {
  if (!row.id) continue;
  if (!splitById.has(row.id)) splitById.set(row.id, []);
  splitById.get(row.id).push(row);
}

const legacyIds = new Set(legacyIndex.byId.keys());
const splitIds = new Set(splitById.keys());
const relationPersonIds = extractRelationPersonIds();

const onlyInLegacyCandidates = [...legacyIds]
  .filter((id) => !splitIds.has(id))
  .sort((a, b) => a.localeCompare(b, 'nb'))
  .map((id) => legacyIndex.byId.get(id)[0]);

const relationOnlyLegacyStubs = onlyInLegacyCandidates.filter((person) => (
  person.stub
  && !person.category
  && relationPersonIds.has(person.id)
  && !relationOnlyLegacyStubExclusions.has(person.id)
));

const relationOnlyLegacyStubIds = new Set(relationOnlyLegacyStubs.map((person) => person.id));
const onlyInLegacy = onlyInLegacyCandidates
  .filter((person) => !relationOnlyLegacyStubIds.has(person.id));

const onlyInSplit = [...splitIds]
  .filter((id) => !legacyIds.has(id))
  .sort((a, b) => a.localeCompare(b, 'nb'))
  .map((id) => splitById.get(id));

const inBoth = [...legacyIds]
  .filter((id) => splitIds.has(id))
  .sort((a, b) => a.localeCompare(b, 'nb'));

const duplicateIdsAcrossSplitFiles = [...splitById.entries()]
  .filter(([, entries]) => (new Set(entries.map((entry) => entry.sourceFile))).size > 1)
  .map(([id, entries]) => ({ id, entries }))
  .sort((a, b) => a.id.localeCompare(b.id, 'nb'));

const duplicateIdsInLegacy = legacyIndex.duplicates.sort((a, b) => a.id.localeCompare(b.id, 'nb'));

const splitFilesNotLoadedByBoot = fileSummaries
  .filter((row) => !row.loadedByBoot)
  .map((row) => row.file);

const bootFilesMissingOnDisk = runtimeFiles
  .filter((file) => !fs.existsSync(path.join(root, file)));

const fieldDifferences = [];
for (const id of inBoth) {
  const legacyEntry = legacyIndex.byId.get(id)[0];
  const splitEntries = splitById.get(id);
  const primarySplit = splitEntries[0];
  const changedFields = compareSimpleFields(legacyEntry, primarySplit);
  if (changedFields.length) {
    fieldDifferences.push({
      id,
      name: primarySplit.name || legacyEntry.name,
      splitFiles: splitEntries.map((entry) => entry.sourceFile),
      changedFields,
    });
  }
}

const report = {
  generatedAt,
  sourceFiles: {
    legacy: fs.existsSync(legacyPath) ? 'data/people.json' : null,
    peopleDir: fs.existsSync(peopleDir) ? 'data/people' : null,
    boot: fs.existsSync(bootPath) ? 'js/boot.js' : null,
    relations: fs.existsSync(relationsPath) ? 'data/relations.json' : null,
  },
  totals: {
    legacyPeople: legacyRows.length,
    legacyUniqueIds: legacyIds.size,
    splitPeople: splitRows.length,
    splitUniqueIds: splitIds.size,
    splitFiles: peopleFiles.length,
    bootRuntimeFiles: runtimeFiles.length,
    inBoth: inBoth.length,
    onlyInLegacy: onlyInLegacy.length,
    relationOnlyLegacyStubs: relationOnlyLegacyStubs.length,
    onlyInSplit: onlyInSplit.length,
    duplicateIdsAcrossSplitFiles: duplicateIdsAcrossSplitFiles.length,
    duplicateIdsInLegacy: duplicateIdsInLegacy.length,
    splitFilesNotLoadedByBoot: splitFilesNotLoadedByBoot.length,
    bootFilesMissingOnDisk: bootFilesMissingOnDisk.length,
    invalidJsonFiles: invalidJsonFiles.length,
    fieldDifferences: fieldDifferences.length,
  },
  files: fileSummaries,
  runtimeFiles,
  splitFilesNotLoadedByBoot,
  bootFilesMissingOnDisk,
  invalidJsonFiles,
  onlyInLegacy,
  relationOnlyLegacyStubs,
  onlyInSplit,
  inBoth,
  duplicateIdsAcrossSplitFiles,
  duplicateIdsInLegacy,
  missingId: {
    legacy: legacyIndex.missingId,
    split: splitMissingId,
  },
  fieldDifferences,
};

let md = '# People split vs legacy audit\n\n';
md += `Generert: ${generatedAt}\n\n`;
md += '## Sammendrag\n\n';
md += `- Legacy people-fil: ${report.sourceFiles.legacy || 'mangler'}\n`;
md += `- People-mappe: ${report.sourceFiles.peopleDir || 'mangler'}\n`;
md += `- Runtime-liste lest fra: ${report.sourceFiles.boot || 'mangler'}\n`;
md += `- Relasjoner lest fra: ${report.sourceFiles.relations || 'mangler'}\n`;
md += `- Legacy people: **${report.totals.legacyPeople}**\n`;
md += `- Legacy unike ID-er: **${report.totals.legacyUniqueIds}**\n`;
md += `- Split people: **${report.totals.splitPeople}**\n`;
md += `- Split unike ID-er: **${report.totals.splitUniqueIds}**\n`;
md += `- Split-filer: **${report.totals.splitFiles}**\n`;
md += `- Runtime-filer i boot.js: **${report.totals.bootRuntimeFiles}**\n`;
md += `- ID-er i begge: **${report.totals.inBoth}**\n`;
md += `- ID-er bare i legacy: **${report.totals.onlyInLegacy}**\n`;
md += `- Legacy relation-only stubs: **${report.totals.relationOnlyLegacyStubs}**\n`;
md += `- ID-er bare i split: **${report.totals.onlyInSplit}**\n`;
md += `- Duplikate ID-er på tvers av split-filer: **${report.totals.duplicateIdsAcrossSplitFiles}**\n`;
md += `- Split-filer ikke lastet av boot.js: **${report.totals.splitFilesNotLoadedByBoot}**\n`;
md += `- Runtime-filer i boot.js som mangler på disk: **${report.totals.bootFilesMissingOnDisk}**\n`;
md += `- JSON-filer med feil: **${report.totals.invalidJsonFiles}**\n\n`;

md += '## Split-filer\n\n';
md += '| Fil | Lastes av boot.js | People | Mangler ID | Duplikate ID-er i fil |\n';
md += '|---|---:|---:|---:|---|\n';
for (const file of fileSummaries) {
  md += `| ${mdEscape(file.file)} | ${file.loadedByBoot ? 'ja' : 'nei'} | ${file.peopleCount} | ${file.missingIdCount} | ${mdEscape(file.duplicateIdsInsideFile.join(', '))} |\n`;
}
md += '\n';

md += '## Split-filer som ikke lastes av boot.js\n\n';
if (!splitFilesNotLoadedByBoot.length) md += '- Ingen.\n\n';
else {
  for (const file of splitFilesNotLoadedByBoot) md += `- ${file}\n`;
  md += '\n';
}

md += '## Boot-filer som mangler på disk\n\n';
if (!bootFilesMissingOnDisk.length) md += '- Ingen.\n\n';
else {
  for (const file of bootFilesMissingOnDisk) md += `- ${file}\n`;
  md += '\n';
}

md += '## ID-er bare i legacy `data/people.json`\n\n';
if (!onlyInLegacy.length) md += '- Ingen.\n\n';
else {
  for (const person of onlyInLegacy) {
    md += `- ${person.id} | ${person.name || ''} | ${person.category || ''} | ${person.stub ? 'stub' : 'ikke-stub'}\n`;
  }
  md += '\n';
}

md += '## Legacy relation-only stubs (skal ikke flyttes)\n\n';
if (!relationOnlyLegacyStubs.length) md += '- Ingen.\n\n';
else {
  for (const person of relationOnlyLegacyStubs) {
    md += `- ${person.id} | ${person.name || ''} | ${person.stub ? 'stub' : 'ikke-stub'}\n`;
  }
  md += '\n';
}

md += '## ID-er bare i split-filene\n\n';
if (!onlyInSplit.length) md += '- Ingen.\n\n';
else {
  for (const entries of onlyInSplit) {
    const first = entries[0];
    md += `- ${first.id} | ${first.name || ''} | ${entries.map((entry) => entry.sourceFile).join(', ')}\n`;
  }
  md += '\n';
}

md += '## Duplikate ID-er på tvers av split-filer\n\n';
if (!duplicateIdsAcrossSplitFiles.length) md += '- Ingen.\n\n';
else {
  for (const row of duplicateIdsAcrossSplitFiles) {
    md += `- ${row.id}: ${row.entries.map((entry) => entry.sourceFile).join(', ')}\n`;
  }
  md += '\n';
}

md += '## Feltforskjeller for ID-er som finnes begge steder\n\n';
if (!fieldDifferences.length) md += '- Ingen feltforskjeller funnet for kontrollerte felt.\n\n';
else {
  for (const row of fieldDifferences.slice(0, 100)) {
    md += `- ${row.id} | ${row.name || ''} | ${row.changedFields.join(', ')} | ${row.splitFiles.join(', ')}\n`;
  }
  if (fieldDifferences.length > 100) md += `- ... ${fieldDifferences.length - 100} flere\n`;
  md += '\n';
}

md += '## Anbefalt bruk\n\n';
md += '- Bruk rapporten til å avgjøre om `data/people.json` kan fjernes som manuell kilde, eller om manglende ID-er først må flyttes til `data/people/*.json`.\n';
md += '- Ikke slett `data/people.json` før `onlyInLegacy` er tom eller bevisst markert som legacy/stub.\n';
md += '- Ikke legg nye people i `data/people.json`; legg dem i riktig mappefil.\n';

fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
fs.writeFileSync(reportMdPath, md, 'utf8');

console.log(`People split vs legacy audit complete: ${normalizeRepoPath(reportJsonPath)}`);
console.log(`People split vs legacy report complete: ${normalizeRepoPath(reportMdPath)}`);
