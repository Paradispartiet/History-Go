import fs from 'node:fs';
import path from 'node:path';

type PersonRecord = Record<string, unknown>;

const peopleRoot = 'data/people';
const reportJson = 'reports/oslo-people-batch3-candidate-audit.json';
const reportMd = 'reports/oslo-people-batch3-candidate-audit.md';

const candidates = [
  { key: 'claus_tullin', names: ['Claus Tullin'] },
  { key: 'alexander_kielland', names: ['Alexander Kielland', 'Alexander L. Kielland', 'Alexander Lange Kielland'] },
  { key: 'oskar_braaten', names: ['Oskar Braaten', 'Oskar Bråten'] },
  { key: 'katie_paterson', names: ['Katie Paterson'] },
  { key: 'vebjorn_sand', names: ['Vebjørn Sand', 'Vebjorn Sand'] },
  { key: 'eimund_sand', names: ['Eimund Sand'] },
  { key: 'fridtjof_nansen', names: ['Fridtjof Nansen'] },
  { key: 'otto_sverdrup', names: ['Otto Sverdrup'] },
  { key: 'roald_amundsen', names: ['Roald Amundsen'] },
  { key: 'colin_archer', names: ['Colin Archer'] }
];

const targetPlaceIds = [
  'tullin',
  'alexander_kiellands_plass',
  'honse_lovisas_hus',
  'framtidsbiblioteket_nordmarka',
  'roseslottet',
  'frammuseet'
];

const normalize = (value: unknown) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) return walk(full);
  return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
});

const files = walk(peopleRoot).filter(file => file !== 'data/people/manifest.json');
const records: Array<{ file: string; record: PersonRecord }> = [];
const parseErrors: Array<{ file: string; error: string }> = [];

for (const file of files) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    const values = Array.isArray(parsed) ? parsed : [parsed];
    for (const value of values) {
      if (value && typeof value === 'object') records.push({ file, record: value as PersonRecord });
    }
  } catch (error) {
    parseErrors.push({ file, error: error instanceof Error ? error.message : String(error) });
  }
}

const candidateResults = candidates.map(candidate => {
  const keys = new Set([candidate.key, ...candidate.names].map(normalize));
  const matches = records.filter(({ record }) => {
    const id = normalize(record.id);
    const name = normalize(record.name);
    return keys.has(id) || keys.has(name);
  }).map(({ file, record }) => ({
    file,
    id: record.id ?? null,
    name: record.name ?? null,
    placeId: record.placeId ?? null,
    places: Array.isArray(record.places) ? record.places : []
  }));
  return { ...candidate, matches };
});

const placeResults = targetPlaceIds.map(placeId => {
  const matches = records.filter(({ record }) => {
    const primary = record.placeId === placeId;
    const secondary = Array.isArray(record.places) && record.places.includes(placeId);
    return primary || secondary;
  }).map(({ file, record }) => ({ file, id: record.id ?? null, name: record.name ?? null, placeId: record.placeId ?? null }));
  return { placeId, matches };
});

const report = {
  generatedAt: new Date().toISOString(),
  scannedPeopleJsonFiles: files.length,
  scannedRecords: records.length,
  parseErrors,
  candidates: candidateResults,
  targetPlaces: placeResults
};

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync(reportJson, `${JSON.stringify(report, null, 2)}\n`);

const lines = [
  '# Oslo People zero-gap batch 3 – candidate audit',
  '',
  `- People JSON-filer skannet: **${files.length}**`,
  `- ID-/navnerecords skannet: **${records.length}**`,
  `- Parsefeil: **${parseErrors.length}**`,
  '',
  '## Kandidater',
  '',
  '| Kandidat | Treff | Filer / canonical anker |',
  '|---|---:|---|',
  ...candidateResults.map(result => `| ${result.names[0]} | ${result.matches.length} | ${result.matches.length ? result.matches.map(match => `\`${match.file}\` → \`${String(match.id)}\` / \`${String(match.placeId)}\``).join('<br>') : 'Ingen treff'} |`),
  '',
  '## Målsteder',
  '',
  '| Place ID | Eksisterende People-lenker |',
  '|---|---:|',
  ...placeResults.map(result => `| \`${result.placeId}\` | ${result.matches.length}${result.matches.length ? ` – ${result.matches.map(match => `\`${String(match.id)}\``).join(', ')}` : ''} |`),
  ''
];
fs.writeFileSync(reportMd, `${lines.join('\n')}\n`);

if (parseErrors.length) {
  throw new Error(`People candidate audit found ${parseErrors.length} JSON parse errors`);
}

console.log(JSON.stringify({
  scannedPeopleJsonFiles: files.length,
  scannedRecords: records.length,
  candidates: candidateResults.map(result => ({ key: result.key, matches: result.matches.length })),
  targetPlaces: placeResults.map(result => ({ placeId: result.placeId, matches: result.matches.length }))
}, null, 2));
