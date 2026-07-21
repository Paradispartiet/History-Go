#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, 'data');
const manifestPath = path.join(DATA_ROOT, 'places', 'manifest.json');
const outJson = path.join(ROOT, 'reports', 'scenekunst-oslo-candidates-batch-2-2026-07-21.json');
const outMd = path.join(ROOT, 'reports', 'scenekunst-oslo-candidates-batch-2-2026-07-21.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function placesFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.places)) return data.places;
  if (data && typeof data === 'object' && typeof data.id === 'string') return [data];
  return [];
}

function flattenStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) flattenStrings(item, out);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) flattenStrings(item, out);
  return out;
}

const strongName = /\b(teater|theatre|scene|opera|ballett|dansens hus|danseteater|kabaret|revy|standup|impro(?:visasjon)?)\b/i;
const strongContent = /\b(teater|scenekunst|sceneproduksjon|levende fremføring|skuespill|dramatikk|dans|ballett|kabaret|revy|standup|improvisasjon|performance)\b/i;
const multiUse = /\b(museum|kino|konserthus|kulturhus|hotell|kirke|bibliotek|stadion|arena|studenthus|festival|galleri)\b/i;

const manifest = readJson(manifestPath);
const files = Array.isArray(manifest.files) ? manifest.files : [];
const candidates = [];

for (const entry of files) {
  const sourcePath = path.join(DATA_ROOT, entry);
  if (!fs.existsSync(sourcePath)) continue;
  if (!String(entry).includes('/oslo/')) continue;

  for (const place of placesFrom(readJson(sourcePath))) {
    if (!place || typeof place !== 'object') continue;
    const id = String(place.id || '').trim();
    const name = String(place.name || place.title || '').trim();
    const category = String(place.category || entry.split('/')[1] || '').trim();
    if (!id || !name || category === 'scenekunst') continue;

    const strings = flattenStrings(place);
    const joined = strings.join(' | ');
    const signals = [];
    let score = 0;

    if (strongName.test(name)) {
      score += 8;
      signals.push('sterkt navn');
    }
    const contentMatches = [...new Set((joined.match(new RegExp(strongContent.source, 'ig')) || []).map(s => s.toLowerCase()))];
    if (contentMatches.length) {
      score += Math.min(6, contentMatches.length * 2);
      signals.push(`innhold: ${contentMatches.join(', ')}`);
    }

    const typed = [place.place_type, place.subtype, place.type, place.quiz_profile?.place_type, place.quiz_profile?.subtype]
      .filter(Boolean)
      .join(' | ');
    if (strongContent.test(typed)) {
      score += 5;
      signals.push(`typefelt: ${typed}`);
    }

    const hasMultiUse = multiUse.test(name) || multiUse.test(typed) || multiUse.test(String(place.desc || ''));
    if (hasMultiUse) {
      score -= 3;
      signals.push('flerbrukssignal');
    }

    if (score < 4) continue;

    let recommendation = 'review';
    if (score >= 10 && !hasMultiUse) recommendation = 'safe_candidate';
    if (hasMultiUse || /opera/i.test(name) || /ibsen museum/i.test(name)) recommendation = 'hold_multifunction';

    candidates.push({
      id,
      name,
      category,
      sourceFile: entry,
      score,
      recommendation,
      signals,
      desc: String(place.desc || place.popupDesc || '').slice(0, 360)
    });
  }
}

candidates.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'nb'));

const result = {
  generatedAt: new Date().toISOString(),
  scope: 'aktive Oslo-steder utenfor scenekunst',
  candidateCount: candidates.length,
  safeCandidateCount: candidates.filter(c => c.recommendation === 'safe_candidate').length,
  holdCount: candidates.filter(c => c.recommendation === 'hold_multifunction').length,
  candidates
};

fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.writeFileSync(outJson, `${JSON.stringify(result, null, 2)}\n`);

const lines = [
  '# Scenekunst – Oslo kandidataudit batch 2',
  '',
  `Generert: ${result.generatedAt}`,
  '',
  `- Kandidater totalt: ${result.candidateCount}`,
  `- Sikre maskinkandidater: ${result.safeCandidateCount}`,
  `- Flerbrukssteder holdt tilbake: ${result.holdCount}`,
  '',
  '## Kandidater',
  ''
];
for (const c of candidates) {
  lines.push(`### ${c.name} (\`${c.id}\`)`);
  lines.push('');
  lines.push(`- Nåværende kategori: \`${c.category}\``);
  lines.push(`- Kilde: \`${c.sourceFile}\``);
  lines.push(`- Score: ${c.score}`);
  lines.push(`- Anbefaling: **${c.recommendation}**`);
  lines.push(`- Signaler: ${c.signals.join('; ')}`);
  if (c.desc) lines.push(`- Kort innhold: ${c.desc}`);
  lines.push('');
}
fs.writeFileSync(outMd, `${lines.join('\n')}\n`);

console.log(JSON.stringify({ status: 'ok', ...result }, null, 2));
