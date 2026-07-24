import { execFileSync } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE_COMMIT = 'cada477a35c0741e9e0693bf6d92d536adc86b22';
const BASE_PATH = 'scripts/coordinate-branch-job.mjs';
const EXPECTED_CONTRACT_SHA = 'c987de325475ee96d536957f276c350e2cc1a035ba336c43ea5d782cf0b36f09';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let source = execFileSync('git', ['show', `${BASE_COMMIT}:${BASE_PATH}`], { encoding: 'utf8' });
assert(source.includes("const BATCH = 194;"), 'Pinned batch-194 production base is missing.');
assert(source.includes("const governmentHtml = await fetchText(governmentDecisionUrl);"), 'Pinned production base has unexpected government-source block.');
assert(source.includes("const liveCollection = JSON.parse(await fetchText(wfsUrl));"), 'Pinned production base has unexpected WFS block.');

source = source.replace(
  "  researchGeoJson: join(root, 'reports/oslo-coordinate-regjeringskvartalet-wfs-area-research-post-193/omraadeplan-native.geojson'),\n",
  "  researchGeoJson: join(root, 'reports/oslo-coordinate-regjeringskvartalet-wfs-area-research-post-193/omraadeplan-native.geojson'),\n  sourceContract: join(root, 'reports/oslo-coordinate-regjeringskvartalet-official-source-crosscheck-post-193/official-source-contract.json'),\n",
);

source = source.replace(
  "const [aggregate, splitChild, evidence, civication, protocol, researchSummary, researchGeoJson, globalIndex] = await Promise.all([\n",
  "const [aggregate, splitChild, evidence, civication, protocol, researchSummary, researchGeoJson, sourceContract, globalIndex] = await Promise.all([\n",
);
source = source.replace(
  "  readJson(paths.researchGeoJson),\n  readJson(paths.globalIndex),\n",
  "  readJson(paths.researchGeoJson),\n  readJson(paths.sourceContract),\n  readJson(paths.globalIndex),\n",
);

const newGovernmentBlock = `assert(sourceContract?.placeId === PLACE_ID, 'Merged official source contract has unexpected placeId.');
assert(sourceContract?.contractSha256 === '${EXPECTED_CONTRACT_SHA}', 'Merged official source contract hash marker changed.');
assert(sourceContract?.officialDecision?.title === 'Vedtak av statlig reguleringsplan for nytt regjeringskvartal', 'Official decision title changed.');
assert(sourceContract?.officialDecision?.decisionDate === '2017-02-10', 'Official decision date changed.');
assert(sourceContract?.officialDecision?.reference === '16/2890-8', 'Official decision reference changed.');
assert(sourceContract?.officialDecision?.legalBasis === 'plan- og bygningsloven § 6-4', 'Official decision legal basis changed.');
assert(sourceContract?.officialDecision?.htmlUrl === governmentDecisionUrl, 'Official decision URL changed.');
assert(sourceContract?.officialDecision?.adoptedStateRegulationConfirmed === true, 'Official state regulation confirmation is missing.');
assert(sourceContract?.documentedPlanScope?.westBoundary === 'Akersgata', 'Official west boundary changed.');
assert(sourceContract?.documentedPlanScope?.eastBoundary === 'Møllergata', 'Official east boundary changed.');
assert(JSON.stringify(sourceContract?.documentedPlanScope?.northBoundary) === JSON.stringify(['Trefoldighetskirken', 'Deichmanske bibliotek']), 'Official north boundary changed.');
assert(JSON.stringify(sourceContract?.documentedPlanScope?.southBoundary) === JSON.stringify(['Høyesterett mellom Akersgata og Grubbegata', 'Grensen 1 mellom Grubbegata og Møllergata']), 'Official south boundary changed.');
assert(sourceContract?.documentedPlanScope?.additionalIncludedObject === 'Regjeringsbygget R5 på vestsiden av Akersgata', 'Official R5 scope changed.');
assert(sourceContract?.planinnsynCandidate?.planId === EXPECTED_PLAN_ID, 'Source-contract planId changed.');
assert(sourceContract?.planinnsynCandidate?.planName === EXPECTED_PLAN_NAME, 'Source-contract planName changed.');
assert(sourceContract?.planinnsynCandidate?.planType === '34', 'Source-contract planType changed.');
assert(sourceContract?.planinnsynCandidate?.geometryType === 'Polygon', 'Source-contract geometry type changed.');
assert(sourceContract?.crosscheckDecision?.identityMatches === true && sourceContract?.crosscheckDecision?.scopeMatches === true && sourceContract?.crosscheckDecision?.canSupportProduction === true, 'Merged source contract no longer supports production.');
assert(sourceContract?.verification?.htmlAndPdfIndependentlyChecked === true, 'Official source was not independently checked.');
assert(sourceContract?.verification?.githubActionsOriginReachability === 'blocked_http_403', 'GitHub Actions reachability contract changed.');
const governmentChecks = {
  mergedContractHashMarker: true,
  adoptedStateRegulation: true,
  decisionDate: true,
  decisionReference: true,
  legalBasis: true,
  westBoundary: true,
  eastBoundary: true,
  northBoundary: true,
  southBoundary: true,
  r5Included: true,
  independentHtmlAndPdfCheck: true,
  githubActions403Documented: true,
};`;

const governmentPattern = /const governmentHtml = await fetchText\(governmentDecisionUrl\);[\s\S]*?\nconst liveCollection = JSON\.parse\(await fetchText\(wfsUrl\)\);/;
assert(governmentPattern.test(source), 'Could not locate exact government live-fetch block in pinned production base.');
source = source.replace(governmentPattern, `${newGovernmentBlock}\n\nconst liveCollection = JSON.parse(await fetchText(wfsUrl));`);

const reportPattern = /  decisionDateConfirmed: governmentText\.includes\('10\.02\.2017'\),\n  adoptedStatePlanConfirmed: governmentText\.includes\('vedtar Kommunal- og moderniseringsdepartementet statlig reguleringsplan'\),/;
assert(reportPattern.test(source), 'Could not locate government report block in pinned production base.');
source = source.replace(
  reportPattern,
  "  decisionDateConfirmed: sourceContract.officialDecision.decisionDate === '2017-02-10',\n  adoptedStatePlanConfirmed: sourceContract.officialDecision.adoptedStateRegulationConfirmed === true,\n  sourceContractPath: 'reports/oslo-coordinate-regjeringskvartalet-official-source-crosscheck-post-193/official-source-contract.json',\n  sourceContractSha256: sourceContract.contractSha256,\n  githubActionsOriginReachability: sourceContract.verification.githubActionsOriginReachability,",
);

assert(source.includes("sourceContract: join(root, 'reports/oslo-coordinate-regjeringskvartalet-official-source-crosscheck-post-193/official-source-contract.json')"), 'Source-contract path patch failed.');
assert(!source.includes('const governmentHtml = await fetchText(governmentDecisionUrl);'), 'Blocked government HTML fetch remains in generated production script.');
assert(source.includes('const liveCollection = JSON.parse(await fetchText(wfsUrl));'), 'Live WFS validation was removed unexpectedly.');

const tempDir = await mkdtemp(join(tmpdir(), 'history-go-batch-194-'));
const generatedPath = join(tempDir, 'coordinate-branch-job.generated.mjs');
await writeFile(generatedPath, source, 'utf8');
await import(pathToFileURL(generatedPath).href);
