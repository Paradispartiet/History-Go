import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const peopleRoot = path.join(root, 'data/people');
const manifestPath = path.join(peopleRoot, 'manifest.json');
const baselinePath = path.join(root, 'reports/oslo-people-coverage.json');
const jsonOut = path.join(root, 'reports/oslo-people-latent-coverage.json');
const mdOut = path.join(root, 'reports/oslo-people-latent-coverage.md');

function readJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toPersonArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.people)) return data.people;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data === 'object' && typeof data.id === 'string' && data.id.trim()) return [data];
  return [];
}

function safeStrings(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function collectRefs(person: any): string[] {
  const refs: string[] = [];
  for (const key of ['placeId', 'place_id', 'place']) {
    if (typeof person?.[key] === 'string' && person[key].trim()) refs.push(person[key].trim());
  }
  for (const key of ['places', 'placeIds', 'place_ids', 'related_places']) refs.push(...safeStrings(person?.[key]));
  return [...new Set(refs)];
}

function walkJson(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJson(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function rel(filePath: string): string {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function esc(value: unknown): string {
  return String(value ?? '').replace(/\|/g, '\\|');
}

const manifest = readJson(manifestPath);
const listedFiles = new Set<string>((manifest.files ?? []).map((item: string) => `data/${item}`.replace(/\\/g, '/')));
const baseline = readJson(baselinePath);
const uncoveredRows = Array.isArray(baseline.uncoveredRequired) ? baseline.uncoveredRequired : [];
const uncoveredById = new Map(uncoveredRows.map((row: any) => [row.placeId, row]));
const uncoveredIds = new Set(uncoveredById.keys());

const manifestPeopleById = new Map<string, Array<{ name: string; sourceFile: string; refs: string[] }>>();
for (const sourceFile of listedFiles) {
  const filePath = path.join(root, sourceFile);
  if (!fs.existsSync(filePath)) continue;
  let data: any;
  try { data = readJson(filePath); } catch { continue; }
  for (const person of toPersonArray(data)) {
    if (!person || typeof person.id !== 'string' || !person.id.trim()) continue;
    const id = person.id.trim();
    const rows = manifestPeopleById.get(id) ?? [];
    rows.push({
      name: typeof person.name === 'string' && person.name.trim() ? person.name.trim() : id,
      sourceFile,
      refs: collectRefs(person),
    });
    manifestPeopleById.set(id, rows);
  }
}

const allJsonFiles = walkJson(peopleRoot).map(rel).sort();
const ignoredNames = new Set(['data/people/manifest.json']);
const unlistedFiles = allJsonFiles.filter((sourceFile) => !listedFiles.has(sourceFile) && !ignoredNames.has(sourceFile));

const latentByPlace = new Map<string, any[]>();
const fileSummaries: any[] = [];
const parseFailures: any[] = [];

for (const sourceFile of unlistedFiles) {
  const filePath = path.join(root, sourceFile);
  let data: any;
  try {
    data = readJson(filePath);
  } catch (error) {
    parseFailures.push({ sourceFile, error: String(error) });
    continue;
  }

  const people = toPersonArray(data).filter((person) => person && typeof person.id === 'string' && person.id.trim());
  if (people.length === 0) continue;

  let existingIds = 0;
  let newIds = 0;
  const latentPlaces = new Set<string>();
  const ids = new Set<string>();

  for (const person of people) {
    const id = person.id.trim();
    ids.add(id);
    const existingRows = manifestPeopleById.get(id) ?? [];
    if (existingRows.length > 0) existingIds += 1;
    else newIds += 1;

    const refs = collectRefs(person);
    for (const placeId of refs) {
      if (!uncoveredIds.has(placeId)) continue;
      latentPlaces.add(placeId);
      const candidates = latentByPlace.get(placeId) ?? [];
      candidates.push({
        personId: id,
        name: typeof person.name === 'string' && person.name.trim() ? person.name.trim() : id,
        sourceFile,
        refs,
        alreadyManifested: existingRows.length > 0,
        canonicalSources: existingRows.map((row) => row.sourceFile),
        canonicalAlreadyHasPlace: existingRows.some((row) => row.refs.includes(placeId)),
      });
      latentByPlace.set(placeId, candidates);
    }
  }

  fileSummaries.push({
    sourceFile,
    peopleCount: people.length,
    uniqueIds: ids.size,
    existingManifestIds: existingIds,
    newIds,
    latentUncoveredOsloPlaces: [...latentPlaces].sort(),
  });
}

const latentPlaces = [...latentByPlace.entries()].map(([placeId, candidates]) => {
  const baselineRow = uncoveredById.get(placeId) ?? {};
  const hasCanonicalExisting = candidates.some((candidate) => candidate.alreadyManifested);
  const hasUnmanifestedNew = candidates.some((candidate) => !candidate.alreadyManifested);
  let recommendedAction = 'canonical audit before migration';
  if (hasCanonicalExisting && !hasUnmanifestedNew) recommendedAction = 'update existing canonical record or repair its manifest loading';
  else if (!hasCanonicalExisting && hasUnmanifestedNew) recommendedAction = 'migrate one unlisted record into canonical manifest after duplicate audit';
  else if (hasCanonicalExisting && hasUnmanifestedNew) recommendedAction = 'resolve mixed existing/new identity candidates before materialization';
  return {
    placeId,
    name: baselineRow.name ?? placeId,
    category: baselineRow.category ?? null,
    recommendedAction,
    candidates: candidates.sort((a, b) => a.name.localeCompare(b.name, 'nb')),
  };
}).sort((a, b) => String(a.category).localeCompare(String(b.category), 'nb') || a.name.localeCompare(b.name, 'nb'));

const latentIds = new Set(latentPlaces.map((row) => row.placeId));
const trueResearchGaps = uncoveredRows.filter((row: any) => !latentIds.has(row.placeId));
const report = {
  generatedAt: new Date().toISOString(),
  baselineGeneratedAt: baseline.generatedAt ?? null,
  totals: {
    baselineUncoveredRequired: uncoveredRows.length,
    unlistedJsonFilesScanned: unlistedFiles.length,
    unlistedPeopleFiles: fileSummaries.length,
    latentCoveredPlaces: latentPlaces.length,
    remainingWithoutAnyManifestOrUnlistedCandidate: trueResearchGaps.length,
    parseFailures: parseFailures.length,
  },
  latentPlaces,
  trueResearchGaps,
  unlistedFiles: fileSummaries.sort((a, b) => b.latentUncoveredOsloPlaces.length - a.latentUncoveredOsloPlaces.length || a.sourceFile.localeCompare(b.sourceFile)),
  parseFailures,
};

fs.writeFileSync(jsonOut, `${JSON.stringify(report, null, 2)}\n`);
let md = '# Oslo latent People coverage audit\n\n';
md += `Generert: ${report.generatedAt}\n\n`;
md += '## Sammendrag\n\n';
md += `- Kravpliktige Oslo-hull i baseline: **${report.totals.baselineUncoveredRequired}**\n`;
md += `- Ulistede JSON-filer skannet: **${report.totals.unlistedJsonFilesScanned}**\n`;
md += `- Ulistede filer med People-records: **${report.totals.unlistedPeopleFiles}**\n`;
md += `- Hull med minst én latent eksisterende kandidat: **${report.totals.latentCoveredPlaces}**\n`;
md += `- Hull uten noen kandidat i manifest eller ulistede People-filer: **${report.totals.remainingWithoutAnyManifestOrUnlistedCandidate}**\n`;
md += `- Parse-feil: **${report.totals.parseFailures}**\n\n`;
md += '## Latente Oslo-koblinger\n\n';
if (latentPlaces.length === 0) {
  md += 'Ingen latente koblinger funnet.\n';
} else {
  md += '| Kategori | Place ID | Navn | Kandidater | Tiltak |\n';
  md += '|---|---|---|---|---|\n';
  for (const row of latentPlaces) {
    const candidates = row.candidates.map((candidate: any) => `${candidate.name} (\`${candidate.personId}\`, ${candidate.alreadyManifested ? 'allerede canonical' : 'ulistet ID'}, ${candidate.sourceFile})`).join('<br>');
    md += `| ${esc(row.category)} | \`${esc(row.placeId)}\` | ${esc(row.name)} | ${esc(candidates)} | ${esc(row.recommendedAction)} |\n`;
  }
}
md += '\n## Ulistede People-filer med Oslo-hull\n\n';
md += '| Fil | People | Eksisterende IDs | Nye IDs | Latente Oslo-steder |\n';
md += '|---|---:|---:|---:|---|\n';
for (const row of report.unlistedFiles.filter((item: any) => item.latentUncoveredOsloPlaces.length > 0)) {
  md += `| ${esc(row.sourceFile)} | ${row.peopleCount} | ${row.existingManifestIds} | ${row.newIds} | ${esc(row.latentUncoveredOsloPlaces.join(', '))} |\n`;
}
fs.writeFileSync(mdOut, md);
console.log(JSON.stringify(report.totals, null, 2));
