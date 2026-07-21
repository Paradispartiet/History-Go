import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const validatedRef = '541a191505d62eac90759db0ace205dd70674b47';
const repoRaw = `https://raw.githubusercontent.com/Paradispartiet/History-Go/${validatedRef}`;
const aggregatePath = 'data/places/politikk/oslo/places_politikk.json';
const splitDir = 'data/places/politikk/oslo/places_politikk';
const splitManifestPath = 'data/places/politikk/oslo/places_politikk_manifest.json';
const splitIndexPath = 'data/places/politikk/oslo/places_politikk_index.json';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const targetIds = ['stortinget','youngstorget','oslo_radhus','eidsvolls_plass','regjeringskvartalet','hoyesteretts_hus','politihuset_gronland','folkets_hus_oslo'];
const verifiedIds = ['stortinget','youngstorget','oslo_radhus','eidsvolls_plass','hoyesteretts_hus','politihuset_gronland','folkets_hus_oslo'];
const reviewId = 'regjeringskvartalet';
const candidateFiles = targetIds.map((id) => `nominatim-${id}.json`);

const run = (args) => execFileSync('git', args, { stdio: 'inherit' });
const selfPath = path.resolve('scripts/coordinate-branch-job.mjs');
const selfSource = fs.readFileSync(selfPath, 'utf8');
const branchName = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
if (!branchName) throw new Error('Kunne ikke identifisere feature-branchen.');
run(['config', 'user.name', 'github-actions[bot]']);
run(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run(['fetch', 'origin', 'main']);
run(['reset', '--hard', 'origin/main']);
fs.writeFileSync(selfPath, selfSource);
run(['add', selfPath]);
run(['commit', '-m', 'Rebase validated politics batch onto latest main']);
run(['push', '--force-with-lease', 'origin', `HEAD:${branchName}`]);

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (relativePath, text) => {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text.endsWith('\n') ? text : `${text}\n`);
};
const fetchText = async (relativePath) => {
  const response = await fetch(`${repoRaw}/${relativePath}`);
  if (!response.ok) throw new Error(`Kunne ikke hente ${relativePath} fra validert ref: ${response.status}`);
  return response.text();
};
const fetchJson = async (relativePath) => JSON.parse(await fetchText(relativePath));
const sha256Text = (text) => crypto.createHash('sha256').update(text).digest('hex');

let protocol = fs.readFileSync(path.join(root, protocolPath), 'utf8');
const nextBatchMatch = protocol.match(/Neste nye Oslo-kontroll er batch (\d+)\./);
if (!nextBatchMatch) throw new Error('Fant ikke neste Oslo-batch i protokollen.');
const batch = Number(nextBatchMatch[1]);

const osloStart = protocol.indexOf('## Oslo');
const correctionsMarker = protocol.indexOf('\nRelevante korrigerende merger for de første Oslo-batchene:', osloStart);
const reviewStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const reviewEnd = protocol.indexOf('\n## ', reviewStart + 4);
if (osloStart < 0 || correctionsMarker < 0 || reviewStart < 0 || reviewEnd < 0) throw new Error('Fant ikke canonical Oslo-tabellseksjonene.');
const primaryIds = new Set([...protocol.slice(osloStart, correctionsMarker).matchAll(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|/gm)].map((m) => m[1]));
const reviewIds = new Set([...protocol.slice(reviewStart, reviewEnd).matchAll(/^\| `([^`]+)`/gm)].map((m) => m[1]));
const controlled = new Set([...primaryIds, ...reviewIds]);
const collisions = targetIds.filter((id) => controlled.has(id));
if (collisions.length) throw new Error(`Politikk-placeId allerede kontrollert på fersk main: ${collisions.join(', ')}`);

const validatedAggregate = await fetchJson(aggregatePath);
const validatedById = new Map(validatedAggregate.map((place) => [place.id, place]));
const aggregate = readJson(aggregatePath);
const currentById = new Map(aggregate.map((place) => [place.id, place]));
for (const id of targetIds) {
  const validated = validatedById.get(id);
  if (!validated || !currentById.has(id)) throw new Error(`Mangler ${id} i validert eller fersk politikk-kilde.`);
  const index = aggregate.findIndex((place) => place.id === id);
  aggregate[index] = validated;
}
writeJson(aggregatePath, aggregate);

for (const id of targetIds) {
  const splitPath = `${splitDir}/${id}.json`;
  writeText(splitPath, await fetchText(splitPath));
  const evidencePath = `data/coordinate-evidence/oslo/politikk/${id}.json`;
  writeText(evidencePath, await fetchText(evidencePath));
}

const splitManifest = readJson(splitManifestPath);
splitManifest.source_sha256 = sha256Text(fs.readFileSync(path.join(root, aggregatePath), 'utf8'));
splitManifest.generated_at = new Date().toISOString();
const splitIndex = [];
for (const row of [...splitManifest.places].sort((a,b) => a.order - b.order)) {
  const childPath = `data/places/politikk/oslo/${row.file}`;
  const childText = fs.readFileSync(path.join(root, childPath), 'utf8');
  row.sha256 = sha256Text(childText);
  const place = JSON.parse(childText);
  splitIndex.push({
    id: place.id, name: place.name ?? null, category: place.category ?? null, lat: place.lat ?? null, lon: place.lon ?? null,
    r: place.r ?? null, year: place.year ?? null, coordStatus: place.coordStatus ?? null, coordType: place.coordType ?? null,
    locatorType: place.locatorType ?? null, sourceProvider: place.sourceProvider ?? null, sourceObjectId: place.sourceObjectId ?? null,
    geocodeAccuracy: place.geocodeAccuracy ?? null, coordRole: place.coordRole ?? null, coordSource: place.coordSource ?? null,
    coordSourceId: place.coordSourceId ?? null, coordSourceUrl: place.coordSourceUrl ?? null, coordVerifiedAt: place.coordVerifiedAt ?? null,
    coordNote: place.coordNote ?? null, file: row.file
  });
}
writeJson(splitManifestPath, splitManifest);
writeJson(splitIndexPath, splitIndex);

const evidenceManifest = readJson(evidenceManifestPath);
for (const id of targetIds) {
  const relative = `oslo/politikk/${id}.json`;
  if (!evidenceManifest.files.includes(relative)) evidenceManifest.files.push(relative);
}
writeJson(evidenceManifestPath, evidenceManifest);

const validatedResults = await fetchJson('reports/oslo-coordinate-control-batch-116-politikk/results.json');
validatedResults.batch = batch;
validatedResults.generatedAt = new Date().toISOString();
const reportDir = `reports/oslo-coordinate-control-batch-${batch}-politikk`;
writeJson(`${reportDir}/results.json`, validatedResults);
let readme = await fetchText('reports/oslo-coordinate-control-batch-116-politikk/README.md');
readme = readme.replace(/batch 116/g, `batch ${batch}`);
writeText(`${reportDir}/README.md`, readme);
for (const file of candidateFiles) {
  writeText(`${reportDir}/${file}`, await fetchText(`reports/oslo-coordinate-control-batch-116-politikk/${file}`));
}

const finalById = new Map(aggregate.map((place) => [place.id, place]));
const rows = verifiedIds.map((id) => {
  const place = finalById.get(id);
  return `| ${batch} | \`${id}\` | ${place.name} | verified_geometry | \`${place.sourceObjectId}\` |`;
});
protocol = protocol.replace('\nRelevante korrigerende merger for de første Oslo-batchene:', `\n${rows.join('\n')}\n\nBatch ${batch} (2026-07-21) fullfører politikk-manifestet. Sju records har eksakte navngitte fysiske OSM-objekter i lokal scope. Regjeringskvartalet forblir needs_review fordi eneste eksakte samlede kandidat er en midlertidig landuse=construction-geometri, ikke en stabil canonical institusjonsgrense. Ingen nearest/first-hit-logikk brukes.\nRelevante korrigerende merger for de første Oslo-batchene:`);

const reviewEvidence = await fetchJson(`data/coordinate-evidence/oslo/politikk/${reviewId}.json`);
const reviewPlace = finalById.get(reviewId);
const reviewRow = `| \`${reviewId}\` – ${reviewPlace.name} | needs_review | ${reviewEvidence.decision.blockedReason} | ${reviewEvidence.decision.nextAction} |`;
const lines = protocol.split('\n');
const reviewHeader = lines.findIndex((line) => line.startsWith('### Dokumenterte Oslo-kontroller uten godkjent koordinat'));
let tableStarted = false; let insertAt = -1;
for (let i = reviewHeader + 1; i < lines.length; i += 1) {
  if (lines[i].startsWith('| kandidat |')) tableStarted = true;
  if (tableStarted && lines[i] === '') { insertAt = i; break; }
}
if (insertAt < 0) throw new Error('Fant ikke slutten av needs_review-tabellen.');
lines.splice(insertAt, 0, reviewRow);
protocol = lines.join('\n');

const newTotal = controlled.size + targetIds.length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${newTotal} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${batch} fullfører de åtte tidligere ukontrollerte recordene i \`places/politikk/oslo/places_politikk.json\`: sju med verified_geometry og Regjeringskvartalet som dokumentert needs_review.`);
protocol = protocol.replace(
  /## Neste arbeid\n\n(?:- .*\n){3,6}/,
  `## Neste arbeid\n\n- Neste nye Oslo-kontroll er batch ${batch + 1}.\n- \`places/politikk/oslo/places_politikk.json\` er nå fullt kontrollert i manifestrekkefølge. Neste aktive manifestkilde er \`places/popkultur/oslo/places_oslo_populaerkultur.json\`; tidligere kontrollerte placeId-er skal hoppes over.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.\n- Før alle fullførte \`needs_review\`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.\n`
);
fs.writeFileSync(path.join(root, protocolPath), protocol);

console.log(JSON.stringify({ batch, verified: verifiedIds, needsReview: [reviewId], newTotal, nextBatch: batch + 1, reportDir }, null, 2));
