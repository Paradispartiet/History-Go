import fs from 'node:fs';
import path from 'node:path';

const root = 'data/people';
const candidates = [
  { key: 'johan_herman_wessel', names: ['Johan Herman Wessel'] },
  { key: 'herman_eger', names: ['Herman Eger'] },
  { key: 'thorvald_eger', names: ['Thorvald Eger'] },
  { key: 'herman_wedel_jarlsberg', names: ['Herman Wedel Jarlsberg', 'Herman Wedel-Jarlsberg', 'Johan Caspar Herman Wedel Jarlsberg'] },
  { key: 'jacob_wilhelm_nordan', names: ['Jacob Wilhelm Nordan'] },
  { key: 'georg_bull', names: ['Georg Bull', 'Georg Andreas Bull'] }
];

const normalize = (value: unknown) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const files: string[] = [];
const walk = (dir: string) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(full);
  }
};
walk(root);

const records: Array<{ file: string; id: string; name: string; placeId?: string; places?: unknown }> = [];
const collect = (value: unknown, file: string) => {
  if (Array.isArray(value)) {
    for (const item of value) collect(item, file);
    return;
  }
  if (!value || typeof value !== 'object') return;
  const obj = value as Record<string, unknown>;
  if (typeof obj.id === 'string' && typeof obj.name === 'string') {
    records.push({
      file,
      id: obj.id,
      name: obj.name,
      placeId: typeof obj.placeId === 'string' ? obj.placeId : undefined,
      places: obj.places
    });
  }
};

for (const file of files) {
  try {
    collect(JSON.parse(fs.readFileSync(file, 'utf8')), file);
  } catch (error) {
    console.error(`Could not parse ${file}:`, error);
  }
}

const result = candidates.map(candidate => {
  const keys = new Set([normalize(candidate.key), ...candidate.names.map(normalize)]);
  const matches = records.filter(record => keys.has(normalize(record.id)) || keys.has(normalize(record.name)));
  return { ...candidate, matches };
});

const targetPlaceIds = [
  'wessels_plass',
  'egertorget',
  'grev_wedels_plass',
  'kampen_kirke',
  'sofienberg_kirke',
  'ostbanestasjonen'
];
const existingTargetLinks = records.filter(record => {
  const places = Array.isArray(record.places) ? record.places : [];
  return targetPlaceIds.includes(record.placeId ?? '') || places.some(place => targetPlaceIds.includes(String(place)));
});

const output = {
  generatedAt: new Date().toISOString(),
  scannedFiles: files.length,
  scannedRecords: records.length,
  candidates: result,
  existingTargetLinks
};
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/oslo-people-batch2-candidate-audit.json', `${JSON.stringify(output, null, 2)}\n`);

const lines = [
  '# Oslo People zero-gap batch 2 – candidate audit',
  '',
  `Scanned ${files.length} JSON files and ${records.length} id/name records under data/people.`,
  '',
  ...result.flatMap(item => [
    `## ${item.names[0]} (${item.key})`,
    '',
    item.matches.length
      ? item.matches.map(match => `- MATCH: ${match.id} — ${match.name} — ${match.file} — primary ${match.placeId ?? 'none'} — places ${JSON.stringify(match.places ?? [])}`).join('\n')
      : '- No canonical or legacy id/name match found.',
    ''
  ]),
  '## Existing links to target places',
  '',
  existingTargetLinks.length
    ? existingTargetLinks.map(match => `- ${match.id} — ${match.name} — ${match.file}`).join('\n')
    : '- No existing People links found for the six target place IDs.',
  ''
];
fs.writeFileSync('reports/oslo-people-batch2-candidate-audit.md', `${lines.join('\n')}\n`);
console.log(JSON.stringify(output, null, 2));
