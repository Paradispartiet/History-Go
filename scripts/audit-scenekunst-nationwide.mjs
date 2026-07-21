import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, 'data/places/places_index.json');
const REPORT_JSON = path.join(ROOT, 'reports/scenekunst-nationwide-candidates-2026-07-21.json');
const REPORT_MD = path.join(ROOT, 'reports/scenekunst-nationwide-candidates-2026-07-21.md');

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
if (!Array.isArray(index)) throw new Error('places_index.json must be an array');

const nameTerms = [
  ['teater', /\b(teater|teatret|theatre|theater|teatro)\b/i],
  ['scene', /\b(scene|scenen)\b/i],
  ['opera', /\b(opera|operahus|operaen)\b/i],
  ['revy', /\b(revy|revyteater)\b/i],
  ['standup', /\b(standup|stand-up)\b/i],
  ['kabaret', /\b(kabaret|cabaret)\b/i],
  ['dans', /\b(dansens hus|danseteater|dansekompani|dansescene)\b/i],
  ['performance', /\b(performance|performancekunst)\b/i],
  ['scenekunst', /\bscenekunst\b/i],
  ['musikal', /\b(musikal|musikkteater)\b/i]
];

const contentTerms = [
  ['teaterinstitusjon', /\bteaterinstitusjon\b/i],
  ['teaterbygning', /\bteaterbygning\b/i],
  ['teaterscene', /\bteaterscene\b/i],
  ['scenekunst', /\bscenekunst\b/i],
  ['levende fremføring', /\blevende fremføring\b/i],
  ['sceneproduksjon', /\bsceneproduksjon\b/i],
  ['dansescene', /\bdansescene\b/i],
  ['musikkteater', /\bmusikkteater\b/i],
  ['revyteater', /\brevyteater\b/i],
  ['standup-scene', /\bstandup[- ]scene\b/i],
  ['operahus', /\boperahus\b/i],
  ['kabaretteater', /\bkabaretteater\b/i]
];

const currentScenekunst = index.filter((p) => p?.category === 'scenekunst');
const candidates = [];

for (const place of index) {
  if (!place || typeof place !== 'object') continue;
  if (place.category === 'scenekunst') continue;

  const name = String(place.name || '');
  const full = JSON.stringify(place);
  const signals = [];
  let score = 0;

  for (const [label, rx] of nameTerms) {
    if (rx.test(name)) {
      signals.push(`navn:${label}`);
      score += label === 'teater' || label === 'opera' ? 8 : 5;
    }
  }

  for (const [label, rx] of contentTerms) {
    if (rx.test(full)) {
      signals.push(`innhold:${label}`);
      score += 3;
    }
  }

  if (!signals.length) continue;

  const sourceFile = String(place.sourceFile || '');
  const region = sourceFile.includes('/oslo/') ? 'oslo'
    : sourceFile.includes('/vestland/') ? 'vestland'
    : sourceFile.includes('/ostfold/') ? 'ostfold'
    : sourceFile.includes('/agder/') ? 'agder'
    : sourceFile.includes('/telemark/') ? 'telemark'
    : sourceFile.includes('/lisbon/') ? 'lisbon'
    : 'other';

  candidates.push({
    id: place.id,
    name,
    category: place.category,
    sourceFile,
    region,
    score,
    signals: [...new Set(signals)],
    desc: String(place.desc || place.popupDesc || '').slice(0, 500)
  });
}

candidates.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'nb'));

const categoryCounts = Object.fromEntries(
  [...new Set(candidates.map((c) => c.category))]
    .sort()
    .map((category) => [category, candidates.filter((c) => c.category === category).length])
);

const report = {
  generatedAt: new Date().toISOString(),
  scope: 'all active places in data/places/places_index.json outside scenekunst',
  currentScenekunstCount: currentScenekunst.length,
  currentScenekunstIds: currentScenekunst.map((p) => p.id),
  candidateCount: candidates.length,
  categoryCounts,
  candidates
};

fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);

const lines = [
  '# Scenekunst – landsdekkende teatreaudit',
  '',
  `Generert: ${report.generatedAt}`,
  '',
  `- Aktive Scenekunst-steder: ${report.currentScenekunstCount}`,
  `- Kandidater utenfor Scenekunst: ${report.candidateCount}`,
  '',
  '## Kandidater per nåværende kategori',
  ''
];
for (const [category, count] of Object.entries(categoryCounts)) lines.push(`- ${category}: ${count}`);
lines.push('', '## Kandidater', '');
for (const c of candidates) {
  lines.push(`### ${c.name} (\`${c.id}\`)`);
  lines.push('');
  lines.push(`- Nåværende kategori: \`${c.category}\``);
  lines.push(`- Region: \`${c.region}\``);
  lines.push(`- Kilde: \`${c.sourceFile}\``);
  lines.push(`- Score: ${c.score}`);
  lines.push(`- Signaler: ${c.signals.join('; ')}`);
  if (c.desc) lines.push(`- Kort innhold: ${c.desc}`);
  lines.push('');
}
fs.writeFileSync(REPORT_MD, `${lines.join('\n')}\n`);

console.log(`Scenekunst candidates: ${candidates.length}`);
console.log(`Current scenekunst places: ${currentScenekunst.length}`);
