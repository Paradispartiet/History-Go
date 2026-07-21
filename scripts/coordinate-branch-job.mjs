import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const protocolPath = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const oldReportDir = path.join(root, 'reports/oslo-coordinate-control-batch-108-ljanselva-route');
const newReportDir = path.join(root, 'reports/oslo-coordinate-control-batch-112-ljanselva-route');

let protocol = fs.readFileSync(protocolPath, 'utf8');
const oldSummary = 'Oslo-tabellen inneholder nå 308 dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 108–111 produserer fire stabile fysiske steder fra den avgrensede VisitOSLO Bjørvika-auditen etter ferdig duplicate-, scope- og coordinate-intake.';
const newSummary = 'Oslo-tabellen inneholder nå 309 dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 108–111 produserer fire stabile fysiske steder fra den avgrensede VisitOSLO Bjørvika-auditen etter ferdig duplicate-, scope- og coordinate-intake. Batch 112 etterfører den fullførte Ljanselva-rutekontrollen og legger til ett verifisert canonical sted; seks lokale rutepunkter er dokumentert separat som needs_review.';
if (!protocol.includes(oldSummary)) throw new Error('Fant ikke forventet Oslo-oppsummering for 308 steder.');
protocol = protocol.replace(oldSummary, newSummary);

const row111 = '| 111 | `operastranda` | Operastranda | verified_geometry | `osm-way:936040800` |';
const row112 = '| 112 | `skraperudtjern` | Skraperudtjern | verified_geometry | `osm-way:23761672` |';
if (!protocol.includes(row111)) throw new Error('Fant ikke batch 111-raden.');
if (!protocol.includes(row112)) protocol = protocol.replace(row111, `${row111}\n${row112}`);

const batch111Text = 'Batch 111 (2026-07-21) produserer `operastranda`. Eksakt navngitt kommunal badestrand som eget fysisk badested; ikke en erstatning for det brede Bjørvika-ankeret og ikke samme anlegg som Sørenga sjøbad.';
const batch112Text = 'Batch 112 (2026-07-21) etterfører den allerede validerte Ljanselva-rutekontrollen etter at parallelle VisitOSLO-batcher tok numrene 108–111 før Ljanselva-PR-en ble merget. `skraperudtjern` bruker det eksakt navngitte OSM-vannobjektet way 23761672 som `pond_center`. `noklevann_ljanselva_start`, `ljanselva_skullerud`, `ljanselva_hauketo`, `ljanselva_ljan`, `ljanselva_fiskevollen` og `ljanselva_bunnefjorden` er fullførte kontroller uten godkjent koordinat og står derfor i needs_review-tabellen. Den opprinnelige build-rapporten ble generert som batch 108 før den parallelle køen landet; rapportstien og resultatmetadataen er i denne reparasjonen canonical-renummerert til batch 112.';
if (!protocol.includes(batch111Text)) throw new Error('Fant ikke batch 111-beskrivelsen.');
if (!protocol.includes(batch112Text)) protocol = protocol.replace(batch111Text, `${batch111Text}\n\n${batch112Text}`);

for (const id of ['noklevann_ljanselva_start','ljanselva_skullerud','ljanselva_hauketo','ljanselva_ljan','ljanselva_fiskevollen','ljanselva_bunnefjorden']) {
  if (!protocol.includes(`\`${id}\``)) throw new Error(`Mangler needs_review-dokumentasjon for ${id}.`);
}
fs.writeFileSync(protocolPath, protocol);

if (fs.existsSync(oldReportDir) && !fs.existsSync(newReportDir)) fs.renameSync(oldReportDir, newReportDir);
if (!fs.existsSync(newReportDir)) throw new Error('Fant ikke Ljanselva-rapportmappen etter canonical rename.');

const readmePath = path.join(newReportDir, 'README.md');
let readme = fs.readFileSync(readmePath, 'utf8');
readme = readme.replace('batch 108', 'batch 112');
fs.writeFileSync(readmePath, readme);

const resultsPath = path.join(newReportDir, 'results.json');
const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
results.batch = 112;
fs.writeFileSync(resultsPath, `${JSON.stringify(results, null, 2)}\n`);

console.log('Ljanselva-kontrollen er canonical-renummerert til batch 112 og protokollen er synkronisert.');
