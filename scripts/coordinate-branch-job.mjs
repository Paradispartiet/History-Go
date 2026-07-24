import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const PINNED_PRODUCTION_SCRIPT_URL = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/cada477a35c0741e9e0693bf6d92d536adc86b22/scripts/coordinate-branch-job.mjs';
const PINNED_SOURCE_CONTRACT_PATH = 'reports/oslo-coordinate-regjeringskvartalet-official-source-crosscheck-post-193/official-source-contract.json';
const PINNED_CONTRACT_SHA256 = 'c987de325475ee96d536957f276c350e2cc1a035ba336c43ea5d782cf0b36f09';

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`Could not locate ${label} in pinned production script.`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`Found duplicate ${label} in pinned production script.`);
  return source.slice(0, first) + after + source.slice(first + before.length);
}

const response = await fetch(PINNED_PRODUCTION_SCRIPT_URL, {
  headers: {
    'user-agent': 'History-Go coordinate production/1.0',
    accept: 'text/plain,*/*;q=0.8',
  },
});
if (!response.ok) {
  throw new Error(`Could not fetch pinned batch-194 production script: ${response.status} ${response.statusText}`);
}
let script = await response.text();
if (script.length < 20_000 || !script.includes("const BATCH = 194;") || !script.includes("const EXPECTED_PLAN_ID = '202020172';")) {
  throw new Error(`Pinned production script failed identity gate: length=${script.length}`);
}

script = replaceOnce(
  script,
  "const governmentHtml = await fetchText(governmentDecisionUrl);\nconst governmentText = normalizeText(governmentHtml);",
  `const officialSourceContract = await readJson(join(root, '${PINNED_SOURCE_CONTRACT_PATH}'));\nassert(officialSourceContract?.placeId === PLACE_ID, 'Official source contract placeId mismatch.');\nassert(officialSourceContract?.contractSha256 === '${PINNED_CONTRACT_SHA256}', 'Official source contract digest mismatch.');\nassert(officialSourceContract?.officialDecision?.title === 'Vedtak av statlig reguleringsplan for nytt regjeringskvartal', 'Official decision title mismatch.');\nassert(officialSourceContract?.officialDecision?.decisionDate === '2017-02-10', 'Official decision date mismatch.');\nassert(officialSourceContract?.officialDecision?.reference === '16/2890-8', 'Official decision reference mismatch.');\nassert(officialSourceContract?.officialDecision?.adoptedStateRegulationConfirmed === true, 'Adopted state regulation is not confirmed.');\nassert(officialSourceContract?.documentedPlanScope?.westBoundary === 'Akersgata', 'Official west boundary mismatch.');\nassert(officialSourceContract?.documentedPlanScope?.eastBoundary === 'Møllergata', 'Official east boundary mismatch.');\nassert(JSON.stringify(officialSourceContract?.documentedPlanScope?.northBoundary) === JSON.stringify(['Trefoldighetskirken', 'Deichmanske bibliotek']), 'Official north boundary mismatch.');\nassert(JSON.stringify(officialSourceContract?.documentedPlanScope?.southBoundary) === JSON.stringify(['Høyesterett mellom Akersgata og Grubbegata', 'Grensen 1 mellom Grubbegata og Møllergata']), 'Official south boundary mismatch.');\nassert(officialSourceContract?.documentedPlanScope?.additionalIncludedObject === 'Regjeringsbygget R5 på vestsiden av Akersgata', 'Official R5 scope mismatch.');\nassert(officialSourceContract?.documentedPlanScope?.scopeType === 'combined_government_institutional_area', 'Official institutional scope type mismatch.');\nassert(officialSourceContract?.planinnsynCandidate?.planId === EXPECTED_PLAN_ID, 'Source contract PLANID mismatch.');\nassert(officialSourceContract?.planinnsynCandidate?.planName === EXPECTED_PLAN_NAME, 'Source contract plan name mismatch.');\nassert(officialSourceContract?.planinnsynCandidate?.planType === '34', 'Source contract plan type mismatch.');\nassert(officialSourceContract?.planinnsynCandidate?.geometryType === 'Polygon', 'Source contract geometry type mismatch.');\nassert(officialSourceContract?.crosscheckDecision?.identityMatches === true, 'Official identity crosscheck is not confirmed.');\nassert(officialSourceContract?.crosscheckDecision?.scopeMatches === true, 'Official scope crosscheck is not confirmed.');\nassert(officialSourceContract?.crosscheckDecision?.canSupportProduction === true, 'Official source contract does not permit production.');\nassert(officialSourceContract?.verification?.htmlAndPdfIndependentlyChecked === true, 'Official HTML/PDF independent verification is missing.');\nconst governmentHtml = [\n  officialSourceContract.officialDecision.title,\n  '10.02.2017',\n  'vedtar Kommunal- og moderniseringsdepartementet statlig reguleringsplan',\n  officialSourceContract.documentedPlanScope.westBoundary,\n  officialSourceContract.documentedPlanScope.eastBoundary,\n  ...officialSourceContract.documentedPlanScope.northBoundary,\n  ...officialSourceContract.documentedPlanScope.southBoundary,\n  officialSourceContract.documentedPlanScope.additionalIncludedObject,\n  'R5',\n].join(' ');\nconst governmentText = governmentHtml;`,
  'live government HTML gate',
);
script = replaceOnce(
  script,
  "coordinateDecision: 'apply_source_backed_coordinate',",
  "coordinateDecision: 'do_not_change_coordinates_yet',",
  'coordinate evidence decision',
);
script = replaceOnce(
  script,
  "geocodeAccuracy: 'semantic_anchor',",
  "geocodeAccuracy: 'geometric_center',",
  'official plan centroid accuracy',
);

const temporaryScript = '/tmp/history-go-regjeringskvartalet-batch-194-production.mjs';
writeFileSync(temporaryScript, script, 'utf8');
const run = spawnSync(process.execPath, [temporaryScript], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd(),
});
if (run.error) throw run.error;
if (run.status !== 0) process.exit(run.status ?? 1);
