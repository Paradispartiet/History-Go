import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const TOOL_PATH = 'tools/build_nature_place_candidates.mts';
const TEMP_PATH = 'scripts/langfoss-nature-candidates.mts';
const OUT_PATH = 'reports/etne-natur-batch-6-langfoss-artskart-candidates.json';
const REPORT_PATH = 'reports/etne-natur-batch-6-langfoss.md';

let source = fs.readFileSync(TOOL_PATH, 'utf8');
source = source.replace(
  'outPath: "data/natur/nature_place_map_candidates.json"',
  `outPath: "${OUT_PATH}"`
);
source = source.replace(/maxDebugSamples:\s*\d+/, 'maxDebugSamples: 1000');
source = source.replace(
  /includeCategories:\s*new Set\(\[[^\]]*\]\),\s*priorityPlaceIds:\s*new Set\(\[[\s\S]*?\]\)/,
  'includeCategories: new Set([]),\n  priorityPlaceIds: new Set(["langfoss_etne"])'
);
if (!source.includes('priorityPlaceIds: new Set(["langfoss_etne"])')) {
  throw new Error('Could not specialize nature candidate tool for Langfoss');
}
fs.writeFileSync(TEMP_PATH, source, 'utf8');

const result = spawnSync('npx', ['tsx', TEMP_PATH], { stdio: 'inherit' });
fs.rmSync(TEMP_PATH, { force: true });
if (result.status !== 0) throw new Error(`Langfoss candidate run failed with ${result.status}`);

const output = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
const place = output.places?.langfoss_etne;
if (!place || place.status !== 'candidate_from_artskart') {
  throw new Error(`Langfoss candidate output missing or invalid: ${JSON.stringify(place)}`);
}
const matched = [...(place.flora || []), ...(place.fauna || [])];
const unmatched = place.diagnostic?.unmatchedNameSamples || [];
const report = `# Etne natur batch 6 – Langfoss artsrevisjon\n\n## Analyseflate\n\nArtskart-spørringen bruker en kvadratisk lokal analyseflate rundt History GO-stedets kanoniske områdeanker \`${place.lat}, ${place.lon}\`, med radius \`${place.radiusM}\` meter. Flaten representerer spillstedet Langfoss og det nærmeste fosseområdet. Den er ikke en offisiell vernegrense eller et uttrykk for hele Vaulaelvas 31 km² store nedbørfelt.\n\n## Filtre\n\n- observasjonsår: 2000 eller nyere\n- oppgitt presisjon: høyst 250 meter\n- Artskart-endepunkt: ${place.diagnostic?.requestUrl || ''}\n- nyttige observasjoner: ${place.diagnostic?.usefulObservationCount ?? 0}\n- observasjoner matchet til eksisterende kort: ${place.diagnostic?.matchedObservationCount ?? 0}\n\n## Eksisterende kanoniske kort funnet\n\n${matched.length ? matched.map(item => `- ${item.title || item.id} – *${item.latin || ''}* (\`${item.id}\`): ${item.count} funn, siste ${item.latestYear || 'ukjent'}`).join('\n') : '- Ingen'}\n\n## Artskart-navn uten kortmatch\n\n${unmatched.length ? unmatched.map(name => `- ${name}`).join('\n') : '- Ingen'}\n\n## Videre regel\n\nNavnene må grupperes til faktiske taxa før publisering. Høyere taksoner, dubletter, usikre navn og observasjoner som ikke gjelder selve fosseområdet skal ikke automatisk bli artskort.\n\n## Stedskilder\n\n- https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/042-1-vaulaelva-m-langfossen/\n- https://www.ietne.no/aktuelt/langfoss---fra-vill-natur-til-verdskjent-turmal\n`;
fs.writeFileSync(REPORT_PATH, report, 'utf8');
console.log(`Langfoss audit: ${matched.length} matched cards, ${unmatched.length} unmatched names`);
