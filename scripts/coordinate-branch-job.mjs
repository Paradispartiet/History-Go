import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_HEAD = '6ab17b16a624ea61d3310da2333338ac0394754d';
const SOURCE_BASE = 'b0e4227557591cec48f53dcdd4eb98a0d61af072';
const BATCH = 121;
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-121-sport-main';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';

const verified = [
  ['bislett_stadion', 'Bislett Stadion', 'osm-way:115277337'],
  ['ullevaal_stadion', 'Ullevaal Stadion', 'osm-way:43222619'],
  ['intility_arena', 'Intility Arena', 'osm-way:443983964'],
  ['jordal_amfi', 'Jordal Amfi', 'osm-way:760875553'],
  ['holmenkollen_nasjonalanlegg', 'Holmenkollen nasjonalanlegg', 'osm-way:81300521'],
  ['frogner_stadion', 'Frogner stadion', 'osm-way:4272321'],
  ['valle_hovin_stadion', 'Valle Hovin stadion', 'osm-way:1528387076'],
  ['ekebergsletta', 'Ekebergsletta', 'osm-relation:15951742'],
  ['vallhall_arena', 'Vallhall Arena', 'osm-way:50634101'],
  ['manglerudhallen', 'Manglerudhallen', 'osm-way:176303011'],
  ['furuset_forum', 'Furuset Forum', 'osm-way:131269106']
];
const needsReview = [
  ['daelenenga_idrettspark', 'Dælenenga idrettspark', 'Kontrollen ga ikke én legitim samlet eksakt navngitt områdegeometri for hele canonical anlegget (no_exact_semantic_candidate). En enkelt bakke, bane eller delarena kan ikke brukes som proxy for hele området.', 'Dokumenter én samlet navngitt områdegeometri eller eksplisitt sammensatt canonical modell for hele anlegget.'],
  ['gressbanen', 'Gressbanen', 'Den avgrensede kontrollen ga ikke ett entydig eksakt navngitt fysisk sportsobjekt med godkjent objekttype (no_exact_semantic_candidate). Legacy-punktet beholdes kun som uverifisert kartanker.', 'Dokumenter ett entydig eksakt fysisk sportsobjekt eller en offisiell adresse/geometri som matcher canonical identiteten.'],
  ['kfum_arena', 'KFUM Arena', 'Den avgrensede kontrollen ga ikke ett entydig eksakt navngitt fysisk sportsobjekt med godkjent objekttype (no_exact_semantic_candidate). Legacy-punktet beholdes kun som uverifisert kartanker.', 'Dokumenter ett entydig eksakt fysisk sportsobjekt eller en offisiell adresse/geometri som matcher canonical identiteten.'],
  ['nordre_aasen_idrettspark', 'Nordre Åsen idrettspark', 'Kontrollen ga ikke én legitim samlet eksakt navngitt områdegeometri for hele canonical anlegget (no_exact_semantic_candidate). En enkelt bakke, bane eller delarena kan ikke brukes som proxy for hele området.', 'Dokumenter én samlet navngitt områdegeometri eller eksplisitt sammensatt canonical modell for hele anlegget.']
];
const allIds = [...verified.map(([id]) => id), ...needsReview.map(([id]) => id)];

const placeFiles = [
  'data/places/sport/europa/norway/oslo_sport.json',
  'data/places/sport/europa/norway/oslo_sport_index.json',
  'data/places/sport/europa/norway/oslo_sport_manifest.json',
  ...allIds.map((id) => `data/places/sport/europa/norway/oslo_sport/${id}.json`)
];
const evidenceFiles = allIds.map((id) => `data/coordinate-evidence/oslo/sport/${id}.json`);

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const copyFromSource = (rel, target = rel) => {
  const content = execFileSync('git', ['show', `${SOURCE_HEAD}:${rel}`], { cwd: ROOT, encoding: 'utf8' });
  fs.mkdirSync(path.dirname(abs(target)), { recursive: true });
  fs.writeFileSync(abs(target), content);
};

// Fresh-main safety: all pre-existing sport files must still equal the source branch base.
for (const rel of placeFiles) {
  const baseline = execFileSync('git', ['show', `${SOURCE_BASE}:${rel}`], { cwd: ROOT, encoding: 'utf8' });
  const current = fs.readFileSync(abs(rel), 'utf8');
  if (baseline !== current) throw new Error(`Replay blocked: sport file changed on main since source validation: ${rel}`);
}
// These evidence records were new in the validated sport run and must still not exist on main.
for (const rel of evidenceFiles) {
  if (fs.existsSync(abs(rel))) throw new Error(`Replay blocked: sport evidence path already exists on main: ${rel}`);
}

for (const rel of [...placeFiles, ...evidenceFiles]) copyFromSource(rel);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const rel of evidenceFiles) {
  const entry = rel.replace(/^data\/coordinate-evidence\//, '');
  if (!evidenceManifest.files.includes(entry)) evidenceManifest.files.push(entry);
}
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

// Copy the already validated canonical-batch report from #3158 head.
const reportPaths = execFileSync('git', ['ls-tree', '-r', '--name-only', SOURCE_HEAD, REPORT_DIR], {
  cwd: ROOT,
  encoding: 'utf8'
}).trim().split('\n').filter(Boolean);
if (!reportPaths.length) throw new Error(`Validated report directory missing from source head: ${REPORT_DIR}`);
for (const rel of reportPaths) copyFromSource(rel);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
let lines = protocol.split('\n');
const osloIndex = lines.findIndex((line) => line === '## Oslo');
const osloEnd = lines.findIndex((line, index) => index > osloIndex && line.startsWith('## Vestland'));
const summaryIndex = lines.findIndex((line, index) => index > osloIndex && index < osloEnd && line.startsWith('Oslo-tabellen inneholder nå '));
const nextWorkIndex = lines.findIndex((line, index) => index > osloIndex && line.startsWith('- Neste nye Oslo-kontroll er batch '));
const queueSourceIndex = lines.findIndex((line, index) => index > osloIndex && line.includes('Neste aktive manifestkilde er `places/sport/europa/norway/oslo_sport.json`'));
if (osloIndex < 0 || osloEnd < 0 || summaryIndex < 0 || nextWorkIndex < 0 || queueSourceIndex < 0) {
  throw new Error('Could not resolve live Oslo protocol structure');
}
const pointer = Number(lines[nextWorkIndex].match(/batch (\d+)/)?.[1]);
if (pointer !== BATCH) throw new Error(`Expected next Oslo batch ${BATCH}, got ${pointer}`);
const controlledBefore = Number(lines[summaryIndex].match(/Oslo-tabellen inneholder nå (\d+) dokumenterte/)?.[1]);
if (!Number.isFinite(controlledBefore)) throw new Error('Could not parse live Oslo controlled total');

const existingNumericIds = new Set();
const existingNeedsIds = new Set();
for (const line of lines.slice(osloIndex, osloEnd)) {
  const numeric = line.match(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|/);
  if (numeric) existingNumericIds.add(numeric[1]);
  if (line.startsWith('| ') && line.includes('| needs_review |')) {
    const match = line.match(/`([^`]+)`/);
    if (match) existingNeedsIds.add(match[1]);
  }
}
for (const id of allIds) {
  if (existingNumericIds.has(id) || existingNeedsIds.has(id)) {
    throw new Error(`Protocol already contains completed sport decision for ${id}`);
  }
}
if (lines.slice(osloIndex, osloEnd).some((line) => line.match(new RegExp(`^\\|\\s*${BATCH}\\s*\\|`)))) {
  throw new Error(`Batch ${BATCH} is already occupied in the Oslo protocol`);
}

// Append verified rows after the last existing numeric Oslo row.
const numericRowIndices = [];
for (let i = osloIndex; i < osloEnd; i += 1) {
  if (/^\|\s*\d+\s*\|\s*`/.test(lines[i])) numericRowIndices.push(i);
}
const lastNumericIndex = Math.max(...numericRowIndices);
const verifiedRows = verified.map(([id, name, source]) => `| ${BATCH} | \`${id}\` | ${name} | verified_geometry | \`${source}\` |`);
lines.splice(lastNumericIndex + 1, 0, ...verifiedRows);

// Append completed unresolved controls to the dedicated needs_review table.
const refreshedOsloEnd = lines.findIndex((line, index) => index > osloIndex && line.startsWith('## Vestland'));
const needsHeadingIndex = lines.findIndex((line, index) => index > osloIndex && index < refreshedOsloEnd && line === '### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const needsHeaderIndex = lines.findIndex((line, index) => index > needsHeadingIndex && index < refreshedOsloEnd && line.startsWith('| kandidat | status |'));
const notCountedIndex = lines.findIndex((line, index) => index > needsHeadingIndex && index < refreshedOsloEnd && line.startsWith('Disse kontrollene er fullført, men teller ikke blant de '));
if (needsHeadingIndex < 0 || needsHeaderIndex < 0 || notCountedIndex < 0) throw new Error('Could not resolve needs_review table');
let needsEnd = needsHeaderIndex + 2;
while (needsEnd < lines.length && lines[needsEnd].startsWith('| ')) needsEnd += 1;
const needsRows = needsReview.map(([id, name, conflict, followup]) => `| \`${id}\` – ${name} | needs_review | ${conflict} | ${followup} |`);
lines.splice(needsEnd, 0, ...needsRows);

const controlledAfter = controlledBefore + allIds.length;
lines[summaryIndex] = `Oslo-tabellen inneholder nå ${controlledAfter} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${BATCH} fullfører \`places/sport/europa/norway/oslo_sport.json\`: elleve steder får eksakt navngitt sportsgeometri, mens fire brede eller uavklarte arenaidentiteter avsluttes som needs_review uten proxy-gjetting.`;

const finalNeedsHeader = lines.findIndex((line, index) => index > osloIndex && line.startsWith('| kandidat | status |'));
const finalNeedsIds = new Set();
for (let i = finalNeedsHeader + 2; i < lines.length && lines[i].startsWith('| '); i += 1) {
  const match = lines[i].match(/`([^`]+)`/);
  if (match) finalNeedsIds.add(match[1]);
}
const verifiedTotalAfter = controlledAfter - finalNeedsIds.size;
lines[notCountedIndex] = `Disse kontrollene er fullført, men teller ikke blant de ${verifiedTotalAfter} verifiserte eller kildekontrollerte canonical Oslo-stedene.`;
lines[nextWorkIndex] = `- Neste nye Oslo-kontroll er batch ${BATCH + 1}.`;
lines[queueSourceIndex] = '- `places/sport/europa/norway/oslo_sport.json` er nå fullt kontrollert i manifestrekkefølge. Neste aktive manifestkilde er `places/sport/europa/norway/places_oslo_lekeplasser_trening.json`; tidligere kontrollerte placeId-er skal hoppes over.';

const narrative = `Batch ${BATCH} (2026-07-21) reviderer Oslo-sport-manifestet med den fullt gate-validerte payloaden fra #3158. Fresh-main-finalizeren kopierer bare sport- og evidence-filer etter å ha bevist at alle pre-eksisterende sportfiler fortsatt er byte-identiske med source-base \`${SOURCE_BASE}\`, og at de nye evidence-filene fortsatt er fraværende på main. Stadioner og haller bruker eksakt navngitte fysiske sportsobjekter; Holmenkollen nasjonalanlegg og Ekebergsletta bruker legitime samlede områdegeometrier. \`daelenenga_idrettspark\`, \`gressbanen\`, \`kfum_arena\` og \`nordre_aasen_idrettspark\` forblir needs_review fordi kontrollen ikke ga ett entydig kildeobjekt som representerer hele canonical identiteten. Ingen nearest/first-hit-logikk brukes.`;
const vestlandIndex = lines.findIndex((line) => line.startsWith('## Vestland'));
if (!lines.includes(narrative)) lines.splice(vestlandIndex, 0, '', narrative, '');
fs.writeFileSync(abs(PROTOCOL), lines.join('\n'));

writeJson(`${REPORT_DIR}/fresh-main-finalization.json`, {
  version: '2026-07-21',
  batch: BATCH,
  sourceHead: SOURCE_HEAD,
  sourceBase: SOURCE_BASE,
  verifiedIds: verified.map(([id]) => id),
  needsReviewIds: needsReview.map(([id]) => id),
  controlledTotalBefore: controlledBefore,
  controlledTotalAfter: controlledAfter,
  verifiedTotalAfter,
  needsReviewTotalAfter: finalNeedsIds.size,
  nextBatch: BATCH + 1,
  nextSource: 'places/sport/europa/norway/places_oslo_lekeplasser_trening.json'
});

console.log(JSON.stringify({
  ok: true,
  batch: BATCH,
  sourceHead: SOURCE_HEAD,
  verified: verified.length,
  needsReview: needsReview.length,
  controlledTotal: controlledAfter,
  verifiedTotal: verifiedTotalAfter,
  nextBatch: BATCH + 1
}, null, 2));
