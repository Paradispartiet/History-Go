import fs from 'node:fs';
import path from 'node:path';

type PersonRecord = Record<string, unknown>;

const candidates = [
  { key: 'johan_garmann', names: ['Johan Garmann', 'Johann Garmann'] },
  { key: 'hans_nielsen_hauge', names: ['Hans Nielsen Hauge'] },
  { key: 'oscar_ii', names: ['Oscar II', 'Kong Oscar II', 'Oskar II'] },
  { key: 'torolf_prytz', names: ['Torolf Prytz', 'T. Prytz'] },
  { key: 'waldemar_hansteen', names: ['Waldemar Hansteen', 'Albert Waldemar Hansteen', 'W. Hansteen'] },
  { key: 'henrik_bull', names: ['Henrik Bull', 'Henrik B. Bull'] },
  { key: 'christian_brinch', names: ['Christian Brinch', 'Christian Brynch'] },
  { key: 'henrik_wergeland', names: ['Henrik Wergeland', 'Henrik Arnold Wergeland'] },
  { key: 'amalie_sofie_bekkevold', names: ['Amalie Sofie Bekkevold', 'Amalie Sophie Bekkevold', 'Amalie Wergeland'] },
  { key: 'gerhard_treschow', names: ['Gerhard Treschow'] },
  { key: 'karen_toller', names: ['Karen Toller', 'Karen Hausmann', 'Karen Nielsdatter'] },
  { key: 'caspar_herman_von_storm', names: ['Caspar Herman von Storm', 'Caspar Herman Storm'] }
];

const targetPlaceIds = [
  'garmanngarden',
  'gol_stavkirke_bygdoy',
  'centralbanken_kirkegata',
  'kafe_grei',
  'treschowgarden',
  'oslo_ladegard'
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

const files = walk('data/people').filter(file => file !== 'data/people/manifest.json');
const records: Array<{ file: string; record: PersonRecord }> = [];
const parseErrors: Array<{ file: string; error: string }> = [];

for (const file of files) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const value of (Array.isArray(parsed) ? parsed : [parsed])) {
      if (value && typeof value === 'object') records.push({ file, record: value as PersonRecord });
    }
  } catch (error) {
    parseErrors.push({ file, error: error instanceof Error ? error.message : String(error) });
  }
}

const candidateResults = candidates.map(candidate => {
  const keys = new Set([candidate.key, ...candidate.names].map(normalize));
  const matches = records.filter(({ record }) => keys.has(normalize(record.id)) || keys.has(normalize(record.name)))
    .map(({ file, record }) => ({
      file,
      id: record.id ?? null,
      name: record.name ?? null,
      placeId: record.placeId ?? null,
      places: Array.isArray(record.places) ? record.places : []
    }));
  return { ...candidate, matches };
});

const placeResults = targetPlaceIds.map(placeId => ({
  placeId,
  matches: records.filter(({ record }) => record.placeId === placeId || (Array.isArray(record.places) && record.places.includes(placeId)))
    .map(({ file, record }) => ({ file, id: record.id ?? null, name: record.name ?? null, placeId: record.placeId ?? null }))
}));

const report = {
  generatedAt: new Date().toISOString(),
  scannedPeopleJsonFiles: files.length,
  scannedRecords: records.length,
  parseErrors,
  candidates: candidateResults,
  targetPlaces: placeResults
};

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/oslo-people-batch5-candidate-audit.json', `${JSON.stringify(report, null, 2)}\n`);
const lines = [
  '# Oslo People zero-gap batch 5 – candidate audit',
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
fs.writeFileSync('reports/oslo-people-batch5-candidate-audit.md', `${lines.join('\n')}\n`);

if (parseErrors.length) throw new Error(`People candidate audit found ${parseErrors.length} JSON parse errors`);
console.log(JSON.stringify({
  scannedPeopleJsonFiles: files.length,
  scannedRecords: records.length,
  candidates: candidateResults.map(result => ({ key: result.key, matches: result.matches.length })),
  targetPlaces: placeResults.map(result => ({ placeId: result.placeId, matches: result.matches.length }))
}, null, 2));
