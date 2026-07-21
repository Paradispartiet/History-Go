import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_COMMIT = '4a05cc98487c19215670d5f13d50285bd15f09d7';
const SOURCE_BASE = 'b0e4227557591cec48f53dcdd4eb98a0d61af072';
const EXPECTED_BATCH = 121;
const OLD_REPORT_DIR = 'reports/oslo-coordinate-control-batch-120-sport-main';
const NEW_REPORT_DIR = 'reports/oslo-coordinate-control-batch-121-sport-main';
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
  {
    id: 'daelenenga_idrettspark',
    name: 'Dælenenga idrettspark',
    conflict: 'Kontrollen ga ikke én legitim samlet eksakt navngitt områdegeometri for hele canonical anlegget (no_exact_semantic_candidate). En enkelt bakke, bane eller delarena kan ikke brukes som proxy for hele området.',
    followup: 'Dokumenter én samlet navngitt områdegeometri eller eksplisitt sammensatt canonical modell for hele anlegget.'
  },
  {
    id: 'gressbanen',
    name: 'Gressbanen',
    conflict: 'Den avgrensede kontrollen ga ikke ett entydig eksakt navngitt fysisk sportsobjekt med godkjent objekttype (no_exact_semantic_candidate). Legacy-punktet beholdes kun som uverifisert kartanker.',
    followup: 'Dokumenter ett entydig eksakt fysisk sportsobjekt eller en offisiell adresse/geometri som matcher canonical identiteten.'
  },
  {
    id: 'kfum_arena',
    name: 'KFUM Arena',
    conflict: 'Den avgrensede kontrollen ga ikke ett entydig eksakt navngitt fysisk sportsobjekt med godkjent objekttype (no_exact_semantic_candidate). Legacy-punktet beholdes kun som uverifisert kartanker.',
    followup: 'Dokumenter ett entydig eksakt fysisk sportsobjekt eller en offisiell adresse/geometri som matcher canonical identiteten.'
  },
  {
    id: 'nordre_aasen_idrettspark',
    name: 'Nordre Åsen idrettspark',
    conflict: 'Kontrollen ga ikke én legitim samlet eksakt navngitt områdegeometri for hele canonical anlegget (no_exact_semantic_candidate). En enkelt bakke, bane eller delarena kan ikke brukes som proxy for hele området.',
    followup: 'Dokumenter én samlet navngitt områdegeometri eller eksplisitt sammensatt canonical modell for hele anlegget.'
  }
];

const targetPlaceFiles = [
  'data/places/sport/europa/norway/oslo_sport.json',
  'data/places/sport/europa/norway/oslo_sport_index.json',
  'data/places/sport/europa/norway/oslo_sport_manifest.json',
  ...[...verified.map(([id]) => id), ...needsReview.map(({ id }) => id)].map((id) => `data/places/sport/europa/norway/oslo_sport/${id}.json`)
];
const targetEvidenceFiles = [...verified.map(([id]) => id), ...needsReview.map(({ id }) => id)]
  .map((id) => `data/coordinate-evidence/oslo/sport/${id}.json`);
const targetFiles = [...targetPlaceFiles, ...targetEvidenceFiles];

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const copyFromCommit = (sourcePath, targetPath = sourcePath) => {
  const content = execFileSync('git', ['show', `${SOURCE_COMMIT}:${sourcePath}`], { cwd: ROOT, encoding: 'utf8' });
  fs.mkdirSync(path.dirname(abs(targetPath)), { recursive: true });
  fs.writeFileSync(abs(targetPath), content);
};

// Strong replay gate: none of the sport source/split/evidence files may have changed on current main
// since the validated source branch started. Shared runtime/protocol/report files are intentionally excluded.
for (const rel of targetFiles) {
  const oldContent = execFileSync('git', ['show', `${SOURCE_BASE}:${rel}`], { cwd: ROOT, encoding: 'utf8' });
  const currentContent = fs.readFileSync(abs(rel), 'utf8');
  if (oldContent !== currentContent) {
    throw new Error(`Fresh-main replay blocked: ${rel} changed since validated source base ${SOURCE_BASE}`);
  }
}

for (const rel of targetFiles) copyFromCommit(rel);

// All evidence files already existed before the validated run; ensure the live manifest still registers them.
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const rel of targetEvidenceFiles) {
  const entry = rel.replace(/^data\/coordinate-evidence\//, '');
  if (!evidenceManifest.files.includes(entry)) {
    throw new Error(`Coordinate evidence manifest unexpectedly lacks existing entry ${entry}`);
  }
}

// Preserve the complete raw candidate audit under the correct canonical batch number.
const reportPaths = execFileSync('git', ['ls-tree', '-r', '--name-only', SOURCE_COMMIT, OLD_REPORT_DIR], {
  cwd: ROOT,
  encoding: 'utf8'
}).trim().split('\n').filter(Boolean);
for (const oldPath of reportPaths) {
  const newPath = oldPath.replace(OLD_REPORT_DIR, NEW_REPORT_DIR);
  copyFromCommit(oldPath, newPath);
}
const replayResultsPath = `${NEW_REPORT_DIR}/results.json`;
const replayResults = readJson(replayResultsPath);
replayResults.batch = EXPECTED_BATCH;
replayResults.replayedFrom = {
  sourceCommit: SOURCE_COMMIT,
  sourceBase: SOURCE_BASE,
  originalBatch: 120,
  reason: 'Skimuseet i Holmenkollen concurrently became canonical batch 120 before the validated sport queue could merge; sport payload replayed only after proving all target sport/evidence files were unchanged on current main.'
};
writeJson(replayResultsPath, replayResults);

const readmePath = `${NEW_REPORT_DIR}/README.md`;
let readme = fs.readFileSync(abs(readmePath), 'utf8');
readme = readme.replace('batch 120', 'batch 121').replace('Batch 120', 'Batch 121');
readme += `\nReplay note: validated payload copied from commit \`${SOURCE_COMMIT}\` after a byte-for-byte fresh-main guard against source base \`${SOURCE_BASE}\`. Shared runtime and protocol outputs are regenerated on current main.\n`;
fs.writeFileSync(abs(readmePath), readme);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
let lines = protocol.split('\n');
const osloIndex = lines.findIndex((line) => line === '## Oslo');
const nextSectionIndex = lines.findIndex((line, index) => index > osloIndex && line.startsWith('## Vestland'));
const osloEnd = nextSectionIndex > osloIndex ? nextSectionIndex : lines.length;
const summaryIndex = lines.findIndex((line, index) => index > osloIndex && index < osloEnd && line.startsWith('Oslo-tabellen inneholder nå '));
const nextWorkIndex = lines.findIndex((line, index) => index > osloIndex && index < lines.length && line.startsWith('- Neste nye Oslo-kontroll er batch '));
const queueSourceIndex = lines.findIndex((line, index) => index > osloIndex && index < lines.length && line.includes('Neste aktive manifestkilde er `places/sport/europa/norway/oslo_sport.json`'));
if (summaryIndex < 0 || nextWorkIndex < 0 || queueSourceIndex < 0) throw new Error('Could not resolve current Oslo protocol queue structure');
const pointerMatch = lines[nextWorkIndex].match(/batch (\d+)/);
if (!pointerMatch || Number(pointerMatch[1]) !== EXPECTED_BATCH) {
  throw new Error(`Expected live next-work batch ${EXPECTED_BATCH}, found ${pointerMatch?.[1] ?? 'unknown'}`);
}

const controlledMatch = lines[summaryIndex].match(/Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\./);
if (!controlledMatch) throw new Error('Could not parse canonical controlled total');
const controlledBefore = Number(controlledMatch[1]);
const controlledAfter = controlledBefore + verified.length + needsReview.length;

// Guard against duplicate protocol decisions anywhere inside the Oslo section.
for (const id of [...verified.map(([id]) => id), ...needsReview.map(({ id }) => id)]) {
  const token = `\`${id}\``;
  if (lines.slice(osloIndex, osloEnd).some((line) => line.includes(token) && (line.startsWith('| ') || line.includes('needs_review')))) {
    throw new Error(`Protocol already contains completed decision for ${id}; replay must be re-audited`);
  }
}

// Insert verified rows directly after the last existing numeric Oslo batch row.
const numericRows = [];
for (let i = osloIndex; i < osloEnd; i += 1) {
  const match = lines[i].match(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/);
  if (match) numericRows.push({ index: i, batch: Number(match[1]), id: match[2] });
}
if (!numericRows.length) throw new Error('Could not find Oslo numeric coordinate rows');
if (numericRows.some(({ batch }) => batch === EXPECTED_BATCH)) throw new Error(`Batch ${EXPECTED_BATCH} already exists in Oslo protocol`);
const lastNumericIndex = Math.max(...numericRows.map(({ index }) => index));
const verifiedRows = verified.map(([id, name, source]) => `| ${EXPECTED_BATCH} | \`${id}\` | ${name} | verified_geometry | \`${source}\` |`);
lines.splice(lastNumericIndex + 1, 0, ...verifiedRows);

// Re-resolve needs_review table after insertion and append the four completed unresolved controls.
const refreshedOsloEnd = lines.findIndex((line, index) => index > osloIndex && line.startsWith('## Vestland'));
const needsHeadingIndex = lines.findIndex((line, index) => index > osloIndex && index < refreshedOsloEnd && line === '### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const needsHeaderIndex = lines.findIndex((line, index) => index > needsHeadingIndex && index < refreshedOsloEnd && line.startsWith('| kandidat | status |'));
const notCountedIndex = lines.findIndex((line, index) => index > needsHeadingIndex && index < refreshedOsloEnd && line.startsWith('Disse kontrollene er fullført, men teller ikke blant de '));
if (needsHeadingIndex < 0 || needsHeaderIndex < 0 || notCountedIndex < 0) throw new Error('Could not resolve Oslo needs_review table');
let needsEnd = needsHeaderIndex + 2;
while (needsEnd < lines.length && lines[needsEnd].startsWith('| ')) needsEnd += 1;
const needsRows = needsReview.map(({ id, name, conflict, followup }) => `| \`${id}\` – ${name} | needs_review | ${conflict} | ${followup} |`);
lines.splice(needsEnd, 0, ...needsRows);

// Update top summary and verified-count explanation from canonical total + complete needs table.
lines[summaryIndex] = `Oslo-tabellen inneholder nå ${controlledAfter} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${EXPECTED_BATCH} fullfører \`places/sport/europa/norway/oslo_sport.json\`: elleve steder får eksakt navngitt sportsgeometri, mens fire brede eller uavklarte arenaidentiteter avsluttes som needs_review uten proxy-gjetting.`;
const finalNeedsIds = new Set();
const finalNeedsHeader = lines.findIndex((line, index) => index > osloIndex && line.startsWith('| kandidat | status |'));
for (let i = finalNeedsHeader + 2; i < lines.length && lines[i].startsWith('| '); i += 1) {
  const match = lines[i].match(/`([^`]+)`/);
  if (match) finalNeedsIds.add(match[1]);
}
const verifiedTotalAfter = controlledAfter - finalNeedsIds.size;
lines[notCountedIndex] = `Disse kontrollene er fullført, men teller ikke blant de ${verifiedTotalAfter} verifiserte eller kildekontrollerte canonical Oslo-stedene.`;

// Advance queue and active source.
lines[nextWorkIndex] = `- Neste nye Oslo-kontroll er batch ${EXPECTED_BATCH + 1}.`;
lines[queueSourceIndex] = '- `places/sport/europa/norway/oslo_sport.json` er nå fullt kontrollert i manifestrekkefølge. Neste aktive manifestkilde er `places/sport/europa/norway/places_oslo_lekeplasser_trening.json`; tidligere kontrollerte placeId-er skal hoppes over.';

const narrative = `Batch ${EXPECTED_BATCH} (2026-07-21) reviderer Oslo-sport-manifestet på fersk main med den tidligere fullt gate-validerte payloaden fra commit \`${SOURCE_COMMIT}\`. Replayen ble bare tillatt etter byte-for-byte-kontroll av at aggregate sport-kilden, split-filene, sport-index/manifest og alle 15 evidence-recordene var uendret siden source-base \`${SOURCE_BASE}\`. Stadioner og haller bruker ett eksakt navngitt fysisk sportsobjekt; Holmenkollen nasjonalanlegg og Ekebergsletta bruker legitime samlede områdegeometrier. \`daelenenga_idrettspark\`, \`gressbanen\`, \`kfum_arena\` og \`nordre_aasen_idrettspark\` forblir needs_review fordi kontrollen ikke ga ett entydig fysisk kildeobjekt som matcher hele canonical identiteten. Ingen nearest/first-hit-logikk brukes.`;
const vestlandIndex = lines.findIndex((line) => line.startsWith('## Vestland'));
if (!lines.includes(narrative)) lines.splice(vestlandIndex, 0, '', narrative, '');

fs.writeFileSync(abs(PROTOCOL), lines.join('\n'));

writeJson(`${NEW_REPORT_DIR}/replay-validation.json`, {
  version: '2026-07-21',
  batch: EXPECTED_BATCH,
  sourceCommit: SOURCE_COMMIT,
  sourceBase: SOURCE_BASE,
  guardedTargetFileCount: targetFiles.length,
  verifiedIds: verified.map(([id]) => id),
  needsReviewIds: needsReview.map(({ id }) => id),
  controlledTotalBefore: controlledBefore,
  controlledTotalAfter: controlledAfter,
  verifiedTotalAfter,
  needsReviewTotalAfter: finalNeedsIds.size,
  nextBatch: EXPECTED_BATCH + 1,
  nextSource: 'places/sport/europa/norway/places_oslo_lekeplasser_trening.json'
});

console.log(JSON.stringify({
  ok: true,
  batch: EXPECTED_BATCH,
  replayedFrom: SOURCE_COMMIT,
  verified: verified.length,
  needsReview: needsReview.length,
  controlledTotal: controlledAfter,
  verifiedTotal: verifiedTotalAfter,
  nextBatch: EXPECTED_BATCH + 1
}, null, 2));
