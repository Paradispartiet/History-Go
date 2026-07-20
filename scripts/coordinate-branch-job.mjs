import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const TOOL_PATH = 'tools/build_nature_place_candidates.mts';
const TEMP_PATH = 'scripts/jettegrytene-nature-candidates.mts';
const OUT_PATH = 'reports/etne-natur-batch-7-jettegrytene-artskart-candidates.json';
const REPORT_PATH = 'reports/etne-natur-batch-7-jettegrytene.md';

let source = fs.readFileSync(TOOL_PATH, 'utf8');
source = source.replace(
  'outPath: "data/natur/nature_place_map_candidates.json"',
  `outPath: "${OUT_PATH}"`
);
source = source.replace(/maxDebugSamples:\s*\d+/, 'maxDebugSamples: 1000');
source = source.replace(
  /includeCategories:\s*new Set\(\[[^\]]*\]\),\s*priorityPlaceIds:\s*new Set\(\[[\s\S]*?\]\)/,
  'includeCategories: new Set([]),\n  priorityPlaceIds: new Set(["jettegrytene_rullestad"])'
);
if (!source.includes('priorityPlaceIds: new Set(["jettegrytene_rullestad"])')) {
  throw new Error('Could not specialize nature candidate tool for Jettegrytene');
}
fs.writeFileSync(TEMP_PATH, source, 'utf8');

const result = spawnSync('npx', ['tsx', TEMP_PATH], { stdio: 'inherit' });
fs.rmSync(TEMP_PATH, { force: true });
if (result.status !== 0) throw new Error(`Jettegrytene candidate run failed with ${result.status}`);

const output = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
const place = output.places?.jettegrytene_rullestad;
if (!place || place.status !== 'candidate_from_artskart') {
  throw new Error(`Jettegrytene candidate output missing or invalid: ${JSON.stringify(place)}`);
}
const matched = [...(place.flora || []), ...(place.fauna || [])];
const unmatched = place.diagnostic?.unmatchedNameSamples || [];
const report = `# Etne natur batch 7 – Jettegrytene på Rullestad artsrevisjon\n\n## Analyseflate\n\nArtskart-spørringen bruker en kvadratisk lokal analyseflate rundt History GO-stedets kanoniske områdeanker \`${place.lat}, ${place.lon}\`, med radius \`${place.radiusM}\` meter. Flaten representerer den konsentrerte jettegryte-lokaliteten. Den er ikke en offisiell natur- eller vernegrense.\n\n## Filtre\n\n- observasjonsår: 2000 eller nyere\n- oppgitt presisjon: høyst 250 meter\n- Artskart-endepunkt: ${place.diagnostic?.requestUrl || ''}\n- rå observasjoner: ${place.diagnostic?.extractedObservationCount ?? 0}\n- nyttige observasjoner: ${place.diagnostic?.usefulObservationCount ?? 0}\n- observasjoner matchet til eksisterende kort: ${place.diagnostic?.matchedObservationCount ?? 0}\n\n## Eksisterende kanoniske kort funnet\n\n${matched.length ? matched.map(item => `- ${item.title || item.id} – *${item.latin || ''}* (\`${item.id}\`): ${item.count} funn, siste ${item.latestYear || 'ukjent'}`).join('\n') : '- Ingen'}\n\n## Artskart-navn uten kortmatch\n\n${unmatched.length ? unmatched.map(name => `- ${name}`).join('\n') : '- Ingen'}\n\n## Kurateringsregel\n\nStedets hovedtema forblir kvartærgeologi. Arter kan bare kobles til rundingen når de har aksepterte, presise observasjoner i den lokale flaten. Høyere taksoner, navnfragmenter og dubletter skal ikke bli egne kort.\n\n## Stedskilder\n\n- Geopark Sunnhordland / Etne kommune for identiteten til jettegryte-lokaliteten\n- Artskart public API for observasjonene\n`;
fs.writeFileSync(REPORT_PATH, report, 'utf8');
console.log(`Jettegrytene audit: ${matched.length} matched cards, ${unmatched.length} unmatched names`);
