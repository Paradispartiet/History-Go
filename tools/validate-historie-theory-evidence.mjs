#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-theory-evidence');
const contractPath = path.join(historyDir, 'theory_evidence_historie_contract_v1.json');
const registryPath = path.join(historyDir, 'theory_evidence_historie_canonical_v1.json');
const theoriesPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const claimsPath = path.join(historyDir, 'claims_historie_canonical_v1.json');
const sourcesPath = path.join(historyDir, 'sources_historie_canonical_v1.json');
const placeEvidencePath = path.join(historyDir, 'place_evidence_historie_v1.json');
const jsonReportPath = path.join(reportDir, 'history-theory-evidence-foundation-v1.json');
const markdownReportPath = path.join(reportDir, 'history-theory-evidence-foundation-v1.md');
const checkMode = process.argv.includes('--check');

const A = (value) => Array.isArray(value) ? value : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const unique = (values) => [...new Set(values)];
const sorted = (values) => unique(values).sort((a, b) => String(a).localeCompare(String(b), 'nb'));
const relative = (file) => path.relative(root, file).split(path.sep).join('/');
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function sameSet(actual, expected) {
  return JSON.stringify(sorted(actual)) === JSON.stringify(sorted(expected));
}

function asTemporalAnchors(claims) {
  return sorted(claims.flatMap((claim) => {
    const temporal = claim.scope?.temporal || {};
    return [temporal.from, temporal.to].filter((value) => value !== null && value !== undefined).map(String);
  }));
}

function renderMarkdown(report) {
  const lines = [];
  lines.push('# Historie — teori-evidensgrunnlag V1');
  lines.push('');
  lines.push(`Status: **${report.status}**`);
  lines.push('');
  lines.push('Dette er en streng geografisk pilot for å dokumentere hvordan teoriobjekter brukes mot validerte claims, kilder og cases. `evidence_ready` betyr at objektet består pilotkontrakten; det betyr ikke at teorien er universelt bevist eller uttømmende dokumentert.');
  lines.push('');
  lines.push('## Resultat');
  lines.push('');
  lines.push(`- Teoriobjekter totalt: **${report.summary.total_theories}**`);
  lines.push(`- Validerte pilotobjekter: **${report.summary.qualifying_entries}**`);
  lines.push(`- Andel med dokumentert evidensgrunnlag: **${Math.round(report.summary.ratio * 1000) / 10} %**`);
  lines.push(`- Pilotmål: **${report.summary.pilot_target}**`);
  lines.push(`- Universelt mål: **${report.summary.universal_target}**`);
  lines.push(`- Valideringsfeil: **${report.summary.errors}**`);
  lines.push('');
  lines.push('| Teori | Claims | Cases | Kilder | Claim-typer | Pilotstatus |');
  lines.push('|---|---:|---:|---:|---:|---|');
  for (const entry of report.entries) {
    lines.push(`| ${entry.label} | ${entry.counts.claims} | ${entry.counts.cases} | ${entry.counts.sources} | ${entry.counts.claim_types} | ${entry.status} |`);
  }
  lines.push('');
  lines.push('## Kontraktsgrense');
  lines.push('');
  lines.push('- V5.5-teoriobjektene forblir frosne og står fortsatt med `evidence_ready: false`.');
  lines.push('- V6-evidensstatus eies av det separate canonical registeret.');
  lines.push('- Hvert pilotobjekt må bruke minst tre validerte claims, to cases, to kilder og to claim-typer.');
  lines.push('- Alle claims må ha eksplisitt usikkerhet, alternativ fortolkning og en validert sted–claim–kildekobling.');
  lines.push('- Ett sted eller én kilde kan aldri alene gjøre et teoriobjekt kvalifisert.');
  lines.push('');
  if (report.errors.length) {
    lines.push('## Feil');
    lines.push('');
    for (const error of report.errors) lines.push(`- ${error}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

for (const file of [contractPath, registryPath, theoriesPath, claimsPath, sourcesPath, placeEvidencePath]) {
  if (!fs.existsSync(file)) throw new Error(`Missing required file: ${relative(file)}`);
}

const contract = readJson(contractPath);
const registry = readJson(registryPath);
const theories = readJson(theoriesPath);
const claimsFile = readJson(claimsPath);
const sourcesFile = readJson(sourcesPath);
const placeEvidenceFile = readJson(placeEvidencePath);

const theoryById = new Map(A(theories).map((item) => [item.theory_id, item]));
const claimById = new Map(A(claimsFile.claims).map((item) => [item.claim_id, item]));
const sourceById = new Map(A(sourcesFile.sources).map((item) => [item.source_id, item]));
const evidenceByClaim = new Map();
for (const item of A(placeEvidenceFile.evidence_links)) {
  const links = evidenceByClaim.get(item.claim_id) || [];
  links.push(item);
  evidenceByClaim.set(item.claim_id, links);
}
const errors = [];
const seenTheoryIds = new Set();
const seenClaimBundles = new Set();
const thresholds = contract.qualification_thresholds || {};

if (contract.contract_id !== 'theory_evidence_historie_v1') errors.push('Unexpected theory evidence contract_id.');
if (registry.registry_id !== 'theory_evidence_historie_canonical_v1') errors.push('Unexpected theory evidence registry_id.');
if (registry.subject_id !== 'historie') errors.push('Theory evidence registry subject_id must be historie.');
if (!Array.isArray(registry.entries)) errors.push('Theory evidence registry entries must be an array.');

const entryReports = [];
for (const entry of A(registry.entries)) {
  const prefix = entry.theory_id || '(missing theory_id)';
  if (!entry.theory_id || seenTheoryIds.has(entry.theory_id)) errors.push(`${prefix}: missing or duplicate theory_id.`);
  seenTheoryIds.add(entry.theory_id);

  const theory = theoryById.get(entry.theory_id);
  if (!theory) errors.push(`${prefix}: theory_id does not exist in the frozen V5.5 registry.`);
  if (theory?.evidence_ready !== false) errors.push(`${prefix}: frozen V5.5 theory object must remain evidence_ready=false.`);
  if (entry.status !== 'evidence_ready') errors.push(`${prefix}: status must be evidence_ready.`);
  if (entry.scope_status !== 'multi_case_geographic_pilot') errors.push(`${prefix}: scope_status must be multi_case_geographic_pilot.`);
  if (entry.universalization_status !== 'provisional_not_universal') errors.push(`${prefix}: universalization_status must be provisional_not_universal.`);

  const claims = A(entry.claim_ids).map((id) => claimById.get(id)).filter(Boolean);
  const missingClaims = A(entry.claim_ids).filter((id) => !claimById.has(id));
  if (missingClaims.length) errors.push(`${prefix}: unknown claim_ids: ${missingClaims.join(', ')}.`);
  const derivedSources = sorted(claims.flatMap((claim) => A(claim.source_ids)));
  const derivedCases = sorted(claims.flatMap((claim) => A(claim.scope?.case_ids)));
  const derivedPlaces = sorted(claims.flatMap((claim) => A(claim.scope?.place_ids)));
  const derivedEmner = sorted(claims.flatMap((claim) => A(claim.emne_ids)));
  const derivedEvidenceLinks = sorted(claims.flatMap((claim) => A(evidenceByClaim.get(claim.claim_id)).map((link) => link.evidence_id).filter(Boolean)));
  const claimTypes = sorted(claims.map((claim) => claim.claim_type).filter(Boolean));
  const temporalAnchors = asTemporalAnchors(claims);
  const topicSpecificCaseDomains = new Set([
    'his_vitenskap_teknologi_kunnskap',
    'his_forste_verdenskrig_mellomkrig',
    'his_global_kolonial_transnasjonal',
  ]);
  const requiresTopicSpecificCases = A(theory?.explanatory_scope)
    .some((domainId) => topicSpecificCaseDomains.has(domainId));
  const targetEmneId = requiresTopicSpecificCases && theory?.source_hook_id ? `em_${theory.source_hook_id}` : null;
  const topicSpecificCases = targetEmneId
    ? sorted(claims
      .filter((claim) => A(claim.emne_ids).includes(targetEmneId))
      .flatMap((claim) => A(claim.scope?.case_ids)))
    : [];

  if (!sameSet(entry.source_ids, derivedSources)) errors.push(`${prefix}: source_ids must exactly match the selected claims.`);
  if (!sameSet(entry.case_ids, derivedCases)) errors.push(`${prefix}: case_ids must exactly match the selected claims.`);
  if (!sameSet(entry.place_ids, derivedPlaces)) errors.push(`${prefix}: place_ids must exactly match the selected claims.`);
  if (!sameSet(entry.emne_ids, derivedEmner)) errors.push(`${prefix}: emne_ids must exactly match the selected claims.`);
  if (!sameSet(entry.evidence_link_ids, derivedEvidenceLinks)) errors.push(`${prefix}: evidence_link_ids must exactly match the selected claims.`);

  if (claims.length < thresholds.minimum_claims) errors.push(`${prefix}: requires at least ${thresholds.minimum_claims} claims.`);
  if (derivedSources.length < thresholds.minimum_sources) errors.push(`${prefix}: requires at least ${thresholds.minimum_sources} sources.`);
  if (derivedCases.length < thresholds.minimum_cases) errors.push(`${prefix}: requires at least ${thresholds.minimum_cases} cases.`);
  if (derivedPlaces.length < thresholds.minimum_places) errors.push(`${prefix}: requires at least ${thresholds.minimum_places} places.`);
  if (claimTypes.length < thresholds.minimum_claim_types) errors.push(`${prefix}: requires at least ${thresholds.minimum_claim_types} claim types.`);
  if (temporalAnchors.length < thresholds.minimum_temporal_anchors) errors.push(`${prefix}: requires at least ${thresholds.minimum_temporal_anchors} temporal anchors.`);
  if (requiresTopicSpecificCases && topicSpecificCases.length < thresholds.minimum_cases) {
    errors.push(`${prefix}: requires at least ${thresholds.minimum_cases} cases linked to its own emne ${targetEmneId}; found ${topicSpecificCases.length}.`);
  }

  for (const claim of claims) {
    if (!claim.uncertainty?.level || !String(claim.uncertainty?.note || '').trim()) errors.push(`${prefix}: claim ${claim.claim_id} lacks explicit uncertainty.`);
    if (!A(claim.alternative_interpretations).length) errors.push(`${prefix}: claim ${claim.claim_id} lacks an alternative interpretation.`);
    const links = A(evidenceByClaim.get(claim.claim_id));
    if (!links.length) errors.push(`${prefix}: claim ${claim.claim_id} lacks a place-evidence link.`);
    for (const link of links) {
      if (!['validated_case', 'validated_pilot'].includes(link.validation_status)) errors.push(`${prefix}: claim ${claim.claim_id} has non-validating evidence status ${link.validation_status}.`);
      if (!A(link.source_ids).every((id) => A(claim.source_ids).includes(id))) errors.push(`${prefix}: evidence sources for ${claim.claim_id} are not contained in the claim source set.`);
    }
  }

  for (const sourceId of derivedSources) {
    const source = sourceById.get(sourceId);
    if (!source) errors.push(`${prefix}: unknown source_id ${sourceId}.`);
    if (source && A(source.limitations).length < thresholds.minimum_source_limitations) errors.push(`${prefix}: source ${sourceId} needs at least ${thresholds.minimum_source_limitations} limitations.`);
    if (source && !source.provenance?.repository_source) errors.push(`${prefix}: source ${sourceId} lacks repository provenance.`);
  }

  if (String(entry.rationale || '').trim().length < thresholds.minimum_rationale_characters) errors.push(`${prefix}: rationale is too short.`);
  if (A(entry.limitations).length < thresholds.minimum_entry_limitations) errors.push(`${prefix}: entry needs at least ${thresholds.minimum_entry_limitations} limitations.`);
  if (A(entry.alternative_interpretations).length < thresholds.minimum_alternative_interpretations) errors.push(`${prefix}: entry needs at least ${thresholds.minimum_alternative_interpretations} alternative interpretations.`);
  if (A(entry.disconfirmation_conditions).length < thresholds.minimum_disconfirmation_conditions) errors.push(`${prefix}: entry needs at least ${thresholds.minimum_disconfirmation_conditions} disconfirmation conditions.`);
  if (!String(entry.scope_note || '').toLowerCase().includes('ikke universelt')) errors.push(`${prefix}: scope_note must explicitly state that the pilot is not universal proof.`);

  const bundleKey = sorted(entry.claim_ids).join('|');
  if (seenClaimBundles.has(bundleKey)) errors.push(`${prefix}: duplicates another theory's complete claim bundle.`);
  seenClaimBundles.add(bundleKey);

  entryReports.push({
    theory_id: entry.theory_id,
    label: theory?.label || entry.theory_id,
    status: entry.status,
    scope_status: entry.scope_status,
    universalization_status: entry.universalization_status,
    counts: {
      claims: claims.length,
      cases: derivedCases.length,
      places: derivedPlaces.length,
      sources: derivedSources.length,
      claim_types: claimTypes.length,
      temporal_anchors: temporalAnchors.length,
      evidence_links: derivedEvidenceLinks.length,
    },
  });
}

const qualifyingEntries = entryReports.filter((entry) => entry.status === 'evidence_ready').length;
if (qualifyingEntries < contract.pilot_completion.minimum_qualifying_theories) {
  errors.push(`Pilot requires at least ${contract.pilot_completion.minimum_qualifying_theories} qualifying theories; found ${qualifyingEntries}.`);
}
if (A(registry.entries).length !== qualifyingEntries) errors.push('Every registry entry must qualify; partial or placeholder entries are forbidden.');

const report = {
  schema_version: '1.0',
  report_id: 'history_theory_evidence_foundation_v1',
  subject_id: 'historie',
  status: errors.length ? 'FAILED' : 'PASSED',
  source_fingerprints: Object.fromEntries([contractPath, registryPath, theoriesPath, claimsPath, sourcesPath, placeEvidencePath].map((file) => [relative(file), sha256(file)])),
  summary: {
    total_theories: theoryById.size,
    registry_entries: A(registry.entries).length,
    qualifying_entries: qualifyingEntries,
    ratio: theoryById.size ? Math.round((qualifyingEntries / theoryById.size) * 1000) / 1000 : 0,
    pilot_target: contract.pilot_completion.minimum_qualifying_theories,
    universal_target: theoryById.size,
    errors: errors.length,
  },
  entries: entryReports,
  errors,
};

fs.mkdirSync(reportDir, { recursive: true });
const jsonOutput = stableJson(report);
const markdownOutput = renderMarkdown(report);

if (checkMode) {
  const stale = [[jsonReportPath, jsonOutput], [markdownReportPath, markdownOutput]]
    .filter(([file, expected]) => !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== expected);
  if (stale.length) {
    console.error('Historie theory evidence reports are missing or stale:');
    for (const [file] of stale) console.error(`- ${relative(file)}`);
    console.error('Run: node tools/validate-historie-theory-evidence.mjs');
    process.exit(1);
  }
} else {
  fs.writeFileSync(jsonReportPath, jsonOutput);
  fs.writeFileSync(markdownReportPath, markdownOutput);
}

console.log(`Historie theory evidence foundation: ${report.status}`);
console.log(`Qualifying theory entries: ${qualifyingEntries}/${theoryById.size}.`);
console.log(`Validation errors: ${errors.length}.`);
if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
