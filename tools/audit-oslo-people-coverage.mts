import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const placesManifestPath = path.join(root, 'data/places/manifest.json');
const peopleManifestPath = path.join(root, 'data/people/manifest.json');
const reportJsonPath = path.join(root, 'reports/oslo-people-coverage.json');
const reportMdPath = path.join(root, 'reports/oslo-people-coverage.md');

function readJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toPlaceArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data === 'object' && typeof data.id === 'string' && data.id.trim()) return [data];
  return [];
}

function toPersonArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.people)) return data.people;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data === 'object' && typeof data.id === 'string' && data.id.trim()) return [data];
  return [];
}

function norm(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function safeStrings(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function collectPersonRefs(person: any): string[] {
  const refs: string[] = [];
  for (const key of ['placeId', 'place_id', 'place']) {
    if (typeof person?.[key] === 'string' && person[key].trim()) refs.push(person[key].trim());
  }
  for (const key of ['places', 'placeIds', 'place_ids', 'related_places']) refs.push(...safeStrings(person?.[key]));
  return [...new Set(refs)];
}

function sourceLooksOslo(sourceFile: string): boolean {
  return sourceFile.split('/').some((segment) => norm(segment) === 'oslo');
}

function recordHasExplicitOslo(place: any): boolean {
  return [place?.fylke, place?.county, place?.kommune, place?.municipality, place?.city]
    .some((value) => norm(value) === 'oslo');
}

function recordHasExplicitNonOslo(place: any): boolean {
  const values = [place?.fylke, place?.county, place?.kommune, place?.municipality, place?.city]
    .map(norm)
    .filter(Boolean);
  return values.length > 0 && values.every((value) => value !== 'oslo');
}

function pickCategory(versions: any[]): string {
  const counts = new Map<string, number>();
  for (const version of versions) {
    const category = typeof version.category === 'string' && version.category.trim() ? version.category.trim() : '(mangler category)';
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'nb'))[0]?.[0] ?? '(mangler category)';
}

function pickName(versions: any[], fallback: string): string {
  const candidates = versions
    .map((version) => (typeof version.name === 'string' ? version.name.trim() : ''))
    .filter(Boolean);
  return candidates.sort((a, b) => b.length - a.length || a.localeCompare(b, 'nb'))[0] ?? fallback;
}

const placesManifest = readJson(placesManifestPath);
const logicalPlaces = new Map<string, any[]>();
for (const relPath of placesManifest.files ?? []) {
  const filePath = path.join(root, 'data', relPath);
  const sourceFile = path.relative(root, filePath).replace(/\\/g, '/');
  for (const place of toPlaceArray(readJson(filePath))) {
    if (!place || typeof place.id !== 'string' || !place.id.trim()) continue;
    const id = place.id.trim();
    if (!logicalPlaces.has(id)) logicalPlaces.set(id, []);
    logicalPlaces.get(id)!.push({ ...place, sourceFile });
  }
}

const peopleManifest = readJson(peopleManifestPath);
const logicalPeople = new Map<string, { id: string; name: string; refs: Set<string>; sourceFiles: Set<string> }>();
for (const relPath of peopleManifest.files ?? []) {
  const filePath = path.join(root, 'data', relPath);
  const sourceFile = path.relative(root, filePath).replace(/\\/g, '/');
  for (const person of toPersonArray(readJson(filePath))) {
    if (!person || typeof person.id !== 'string' || !person.id.trim()) continue;
    const id = person.id.trim();
    const current = logicalPeople.get(id) ?? {
      id,
      name: typeof person.name === 'string' && person.name.trim() ? person.name.trim() : id,
      refs: new Set<string>(),
      sourceFiles: new Set<string>(),
    };
    if (typeof person.name === 'string' && person.name.trim()) current.name = person.name.trim();
    for (const ref of collectPersonRefs(person)) current.refs.add(ref);
    current.sourceFiles.add(sourceFile);
    logicalPeople.set(id, current);
  }
}

const peopleByPlace = new Map<string, Set<string>>();
const invalidPeopleRefs: Array<{ personId: string; name: string; placeId: string }> = [];
for (const person of logicalPeople.values()) {
  for (const ref of person.refs) {
    if (!logicalPlaces.has(ref)) {
      invalidPeopleRefs.push({ personId: person.id, name: person.name, placeId: ref });
      continue;
    }
    if (!peopleByPlace.has(ref)) peopleByPlace.set(ref, new Set<string>());
    peopleByPlace.get(ref)!.add(person.id);
  }
}

const geographyConflicts: any[] = [];
const osloRows: any[] = [];
for (const [placeId, versions] of logicalPlaces) {
  const explicitOslo = versions.some(recordHasExplicitOslo);
  const explicitNonOslo = versions.some(recordHasExplicitNonOslo);
  const pathOslo = versions.some((version) => sourceLooksOslo(version.sourceFile));
  const conflicting = explicitOslo && explicitNonOslo;

  if (conflicting) {
    geographyConflicts.push({
      placeId,
      name: pickName(versions, placeId),
      sources: versions.map((version) => version.sourceFile).sort(),
      geography: versions.map((version) => ({
        fylke: version.fylke ?? null,
        kommune: version.kommune ?? null,
        city: version.city ?? null,
        sourceFile: version.sourceFile,
      })),
    });
  }

  const isOslo = explicitOslo || (!explicitNonOslo && pathOslo);
  if (!isOslo || conflicting) continue;

  const category = pickCategory(versions);
  const peopleIds = [...(peopleByPlace.get(placeId) ?? new Set<string>())].sort();
  osloRows.push({
    placeId,
    name: pickName(versions, placeId),
    category,
    hasPeople: peopleIds.length > 0,
    peopleCount: peopleIds.length,
    people: peopleIds.map((id) => ({ id, name: logicalPeople.get(id)?.name ?? id })),
    sourceFiles: [...new Set(versions.map((version) => version.sourceFile))].sort(),
    duplicatePlaceDefinitions: versions.length,
  });
}

osloRows.sort((a, b) => a.category.localeCompare(b.category, 'nb') || a.name.localeCompare(b.name, 'nb'));
const natureRows = osloRows.filter((row) => norm(row.category) === 'natur');
const requiredRows = osloRows.filter((row) => norm(row.category) !== 'natur');
const uncoveredRequired = requiredRows.filter((row) => !row.hasPeople);
const coveredRequired = requiredRows.filter((row) => row.hasPeople);
const uncoveredNature = natureRows.filter((row) => !row.hasPeople);

const categoryMap = new Map<string, any>();
for (const row of osloRows) {
  const current = categoryMap.get(row.category) ?? { category: row.category, total: 0, covered: 0, uncovered: 0, peopleLinks: 0 };
  current.total += 1;
  current.covered += row.hasPeople ? 1 : 0;
  current.uncovered += row.hasPeople ? 0 : 1;
  current.peopleLinks += row.peopleCount;
  categoryMap.set(row.category, current);
}
const categories = [...categoryMap.values()].sort((a, b) => a.category.localeCompare(b.category, 'nb'));

const report = {
  generatedAt: new Date().toISOString(),
  policy: {
    jurisdiction: 'Oslo',
    requirement: 'Alle canonical Oslo-steder utenfor natur skal ha minst én gyldig People-kobling.',
    natureTreatment: 'Natursteder rapporteres separat og er foreløpig ikke del av null-hull-gaten.',
    counting: 'Logical placeId and personId are deduplicated across manifest-listed aggregate and split files.',
  },
  totals: {
    osloPlaces: osloRows.length,
    requiredNonNaturePlaces: requiredRows.length,
    coveredRequiredPlaces: coveredRequired.length,
    uncoveredRequiredPlaces: uncoveredRequired.length,
    requiredCoveragePercent: requiredRows.length ? Number(((coveredRequired.length / requiredRows.length) * 100).toFixed(2)) : 100,
    naturePlaces: natureRows.length,
    coveredNaturePlaces: natureRows.length - uncoveredNature.length,
    uncoveredNaturePlaces: uncoveredNature.length,
    logicalPeople: logicalPeople.size,
    invalidPeopleRefs: invalidPeopleRefs.length,
    geographyConflicts: geographyConflicts.length,
  },
  categories,
  uncoveredRequired,
  coveredRequired,
  nature: natureRows,
  geographyConflicts,
  invalidPeopleRefs,
};

fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);

function esc(value: unknown): string {
  return String(value ?? '').replace(/\|/g, '\\|');
}

let md = '# Oslo People of Places coverage\n\n';
md += `Generert: ${report.generatedAt}\n\n`;
md += '## Policy\n\n';
md += '- Alle canonical Oslo-steder utenfor natur skal ha minst én gyldig People-kobling.\n';
md += '- Natursteder rapporteres separat og inngår foreløpig ikke i null-hull-gaten.\n';
md += '- Telling er deduplisert på `placeId` og `personId` på tvers av aggregate- og split-filer.\n\n';
md += '## Sammendrag\n\n';
md += `- Oslo-steder totalt: **${report.totals.osloPlaces}**\n`;
md += `- Kravpliktige steder utenom natur: **${report.totals.requiredNonNaturePlaces}**\n`;
md += `- Dekket: **${report.totals.coveredRequiredPlaces}**\n`;
md += `- Uten People: **${report.totals.uncoveredRequiredPlaces}**\n`;
md += `- Dekningsgrad: **${report.totals.requiredCoveragePercent}%**\n`;
md += `- Natursteder: **${report.totals.naturePlaces}** (${report.totals.uncoveredNaturePlaces} uten People)\n`;
md += `- Geografikonflikter holdt utenfor Oslo-tellingen: **${report.totals.geographyConflicts}**\n`;
md += `- Ugyldige People→place-referanser globalt: **${report.totals.invalidPeopleRefs}**\n\n`;
md += '## Dekning per kategori\n\n';
md += '| Kategori | Totalt | Dekket | Uten People | People-lenker |\n';
md += '|---|---:|---:|---:|---:|\n';
for (const row of categories) md += `| ${esc(row.category)} | ${row.total} | ${row.covered} | ${row.uncovered} | ${row.peopleLinks} |\n`;
md += '\n## Arbeidskø: Oslo uten natur og uten People\n\n';
if (uncoveredRequired.length === 0) {
  md += 'Ingen hull. Null-hull-målet er nådd.\n';
} else {
  md += '| Kategori | Place ID | Navn | Canonical kilde |\n';
  md += '|---|---|---|---|\n';
  for (const row of uncoveredRequired) md += `| ${esc(row.category)} | \`${esc(row.placeId)}\` | ${esc(row.name)} | ${esc(row.sourceFiles.join('<br>'))} |\n`;
}
md += '\n## Natursteder uten People (separat)\n\n';
if (uncoveredNature.length === 0) {
  md += 'Ingen udekkede natursteder.\n';
} else {
  md += '| Place ID | Navn | Canonical kilde |\n';
  md += '|---|---|---|\n';
  for (const row of uncoveredNature) md += `| \`${esc(row.placeId)}\` | ${esc(row.name)} | ${esc(row.sourceFiles.join('<br>'))} |\n`;
}
if (geographyConflicts.length > 0) {
  md += '\n## Geografikonflikter\n\n';
  for (const row of geographyConflicts) md += `- \`${esc(row.placeId)}\` — ${esc(row.name)}\n`;
}
fs.writeFileSync(reportMdPath, md);
console.log(JSON.stringify(report.totals, null, 2));
