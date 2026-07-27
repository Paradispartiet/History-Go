#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-universal-coverage');
const coverageContractPath = path.join(historyDir, 'historie_universal_coverage_contract_v1.json');
const historyContractPath = path.join(historyDir, 'historie_v5_contract.json');
const jsonReportPath = path.join(reportDir, 'historie-universal-coverage.json');
const markdownReportPath = path.join(reportDir, 'historie-universal-coverage.md');
const checkMode = process.argv.includes('--check');
const requireComplete = process.argv.includes('--require-complete');

const A = (value) => Array.isArray(value) ? value : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const normalize = (value) => String(value ?? '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9æøå]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const unique = (values) => [...new Set(values)];
const relative = (file) => path.relative(root, file).split(path.sep).join('/');

function getPath(value, fieldPath) {
  return String(fieldPath).split('.').reduce((current, key) => current == null ? undefined : current[key], value);
}

function flattenText(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(flattenText);
  if (typeof value === 'object') return Object.values(value).flatMap(flattenText);
  return [String(value)];
}

function collectFieldText(item, fields) {
  return fields.flatMap((field) => flattenText(getPath(item, field))).join(' | ');
}

function matchesAnchor(normalizedText, anchor) {
  const normalizedAnchor = normalize(anchor);
  if (!normalizedAnchor) return false;
  if (normalizedAnchor.length <= 3 && !normalizedAnchor.includes(' ')) {
    return normalizedText.split(' ').includes(normalizedAnchor);
  }
  return normalizedText.includes(normalizedAnchor);
}

function matchedAnchors(text, anchors) {
  const normalizedText = normalize(text);
  return A(anchors).filter((anchor) => matchesAnchor(normalizedText, anchor));
}

function ratio(count, total) {
  return total === 0 ? 0 : count / total;
}

function roundRatio(value) {
  return Math.round(value * 1000) / 1000;
}

function pct(value) {
  return `${Math.round(value * 100)} %`;
}

function statusIcon(status) {
  if (status === 'COVERED' || status === 'PASS') return '✅';
  if (status === 'PARTIAL') return '⚠️';
  return '❌';
}

function validateContract(contract) {
  const errors = [];
  const seen = new Set();
  const requiredAxes = ['time', 'theme', 'geography', 'actors'];
  for (const axisId of requiredAxes) {
    if (!contract.axes?.[axisId]) errors.push(`Missing required axis: ${axisId}`);
  }
  for (const [axisId, axis] of Object.entries(contract.axes || {})) {
    if (!A(axis.cells).length) errors.push(`Axis has no cells: ${axisId}`);
    for (const cell of A(axis.cells)) {
      if (!cell.id || seen.has(cell.id)) errors.push(`Missing or duplicate coverage cell id: ${cell.id || '(missing)'}`);
      seen.add(cell.id);
      if (!A(cell.anchors).length) errors.push(`Coverage cell has no anchors: ${cell.id}`);
      for (const key of ['minimum_dedicated_emner', 'minimum_supporting_emner', 'minimum_distinct_areas']) {
        if (!Number.isFinite(cell[key])) errors.push(`Coverage cell lacks numeric ${key}: ${cell.id}`);
      }
    }
  }
  const productionIds = new Set();
  for (const check of A(contract.production_checks)) {
    if (!check.id || productionIds.has(check.id)) errors.push(`Missing or duplicate production check id: ${check.id || '(missing)'}`);
    productionIds.add(check.id);
  }
  return errors;
}

function evaluateCell(cell, emner, matchingPolicy) {
  const dedicatedMatches = [];
  const supportingMatches = [];
  for (const emne of emner) {
    const dedicatedText = collectFieldText(emne, matchingPolicy.dedicated_fields);
    const supportingText = `${dedicatedText} | ${collectFieldText(emne, matchingPolicy.supporting_fields)}`;
    const dedicatedAnchors = matchedAnchors(dedicatedText, cell.anchors);
    const supportAnchors = matchedAnchors(supportingText, cell.anchors);
    if (dedicatedAnchors.length) {
      dedicatedMatches.push({
        emne_id: emne.emne_id,
        title: emne.title,
        area_id: emne.area_id,
        area_label: emne.area_label,
        anchors: dedicatedAnchors,
      });
    }
    if (supportAnchors.length) {
      supportingMatches.push({
        emne_id: emne.emne_id,
        title: emne.title,
        area_id: emne.area_id,
        area_label: emne.area_label,
        anchors: supportAnchors,
      });
    }
  }
  const distinctAreas = unique(supportingMatches.map((match) => match.area_id).filter(Boolean));
  const covered = dedicatedMatches.length >= cell.minimum_dedicated_emner
    && supportingMatches.length >= cell.minimum_supporting_emner
    && distinctAreas.length >= cell.minimum_distinct_areas;
  const status = covered ? 'COVERED' : (dedicatedMatches.length || supportingMatches.length ? 'PARTIAL' : 'MISSING');
  const combinedSamples = [...dedicatedMatches, ...supportingMatches]
    .filter((match, index, all) => all.findIndex((candidate) => candidate.emne_id === match.emne_id) === index)
    .slice(0, 8);
  return {
    id: cell.id,
    label: cell.label,
    status,
    thresholds: {
      minimum_dedicated_emner: cell.minimum_dedicated_emner,
      minimum_supporting_emner: cell.minimum_supporting_emner,
      minimum_distinct_areas: cell.minimum_distinct_areas,
    },
    counts: {
      dedicated_emner: dedicatedMatches.length,
      supporting_emner: supportingMatches.length,
      distinct_areas: distinctAreas.length,
    },
    distinct_area_ids: distinctAreas,
    sample_matches: combinedSamples,
    gap_action: cell.gap_action,
  };
}

function evaluateProductionCheck(check, emner, theories, theoryEvidenceRegistry) {
  let measured = {};
  let passed = false;

  if (check.type === 'emne_any_array_ratio') {
    const qualifying = emner.filter((emne) => A(check.fields).some((field) => A(getPath(emne, field)).length >= check.minimum_items));
    const measuredRatio = ratio(qualifying.length, emner.length);
    measured = { qualifying: qualifying.length, total: emner.length, ratio: roundRatio(measuredRatio) };
    passed = measuredRatio >= check.minimum_ratio;
  } else if (check.type === 'emne_boolean_any_ratio') {
    const qualifying = emner.filter((emne) => A(check.fields).some((field) => getPath(emne, field) === check.expected));
    const measuredRatio = ratio(qualifying.length, emner.length);
    measured = { qualifying: qualifying.length, total: emner.length, ratio: roundRatio(measuredRatio) };
    passed = measuredRatio >= check.minimum_ratio;
  } else if (check.type === 'emne_boolean_all_ratio') {
    const qualifying = emner.filter((emne) => A(check.fields).every((field) => getPath(emne, field) === check.expected));
    const measuredRatio = ratio(qualifying.length, emner.length);
    measured = { qualifying: qualifying.length, total: emner.length, ratio: roundRatio(measuredRatio) };
    passed = measuredRatio >= check.minimum_ratio;
  } else if (check.type === 'forbidden_emne_field_ratio') {
    const violating = emner.filter((emne) => A(check.fields).some((field) => {
      const value = getPath(emne, field);
      return Array.isArray(value) ? value.length > 0 : value != null;
    }));
    const measuredRatio = ratio(violating.length, emner.length);
    measured = { violating: violating.length, total: emner.length, ratio: roundRatio(measuredRatio) };
    passed = measuredRatio <= check.maximum_ratio;
  } else if (check.type === 'candidate_file_exists') {
    const existing = A(check.paths).filter((candidate) => fs.existsSync(path.join(root, candidate)));
    measured = { existing_paths: existing, checked_paths: A(check.paths) };
    passed = existing.length > 0;
  } else if (check.type === 'theory_evidence_registry_ratio') {
    const validTheoryIds = new Set(theories.map((theory) => theory.theory_id));
    const qualifyingIds = unique(A(theoryEvidenceRegistry?.entries)
      .filter((entry) => entry.status === check.expected_status && validTheoryIds.has(entry.theory_id))
      .map((entry) => entry.theory_id));
    const measuredRatio = ratio(qualifyingIds.length, theories.length);
    measured = { qualifying: qualifyingIds.length, total: theories.length, ratio: roundRatio(measuredRatio), registry_entries: A(theoryEvidenceRegistry?.entries).length };
    passed = measuredRatio >= check.minimum_ratio;
  } else if (check.type === 'theory_boolean_ratio') {
    const qualifying = theories.filter((theory) => getPath(theory, check.field) === check.expected);
    const measuredRatio = ratio(qualifying.length, theories.length);
    measured = { qualifying: qualifying.length, total: theories.length, ratio: roundRatio(measuredRatio) };
    passed = measuredRatio >= check.minimum_ratio;
  } else {
    throw new Error(`Unknown production check type: ${check.type}`);
  }

  return {
    id: check.id,
    label: check.label,
    type: check.type,
    status: passed ? 'PASS' : 'GAP',
    measured,
    threshold: Object.fromEntries(Object.entries(check).filter(([key]) => key.startsWith('minimum_') || key.startsWith('maximum_') || key === 'expected' || key === 'expected_status')),
    gap_action: check.gap_action,
  };
}

function renderMarkdown(report) {
  const lines = [];
  lines.push('# Historie — universell heldekningsaudit');
  lines.push('');
  lines.push(`Status: **${report.status}**`);
  lines.push('');
  lines.push('Denne rapporten tester om den universelle historiefagmodellen dekker selve faget. Den tester ikke bare om den aktive faglisten er fylt ut. Frysing og eksakte objekttall er derfor registrert som intern strukturstatus, ikke som bevis på heldekning.');
  lines.push('');
  lines.push('## Hovedresultat');
  lines.push('');
  lines.push(`- Universell heldekning: **${report.status}**`);
  lines.push(`- Aktiv intern readiness: **${report.legacy_internal_readiness.status || 'ukjent'}**`);
  lines.push(`- Interne domenetall: **${report.legacy_internal_readiness.covered_domains}/${report.legacy_internal_readiness.total_domains}** markert komplette internt`);
  lines.push(`- Dekningsceller: **${report.summary.covered_cells} dekket**, **${report.summary.partial_cells} delvis**, **${report.summary.missing_cells} mangler**`);
  lines.push(`- Produksjonskrav: **${report.summary.production_passes} bestått**, **${report.summary.production_gaps} åpne gap**`);
  if (report.legacy_internal_readiness.false_complete_conflict) {
    lines.push('- **Konflikt:** den gamle rapporten sier at alle valgte domener er komplette, mens den uavhengige fagmatrisen fortsatt er ufullstendig.');
  }
  lines.push('');
  lines.push('## Akseoversikt');
  lines.push('');
  lines.push('| Akse | Status | Dekket | Delvis | Mangler |');
  lines.push('|---|---:|---:|---:|---:|');
  for (const axis of Object.values(report.axes)) {
    lines.push(`| ${axis.label} | ${statusIcon(axis.status)} ${axis.status} | ${axis.counts.covered} | ${axis.counts.partial} | ${axis.counts.missing} |`);
  }
  lines.push(`| Historiefaglig produksjon | ${statusIcon(report.production.status)} ${report.production.status} | ${report.production.counts.passed} | – | ${report.production.counts.gaps} |`);

  for (const [axisId, axis] of Object.entries(report.axes)) {
    lines.push('');
    lines.push(`## ${axis.label}`);
    lines.push('');
    lines.push(axis.requirement);
    lines.push('');
    lines.push('| Dekningscelle | Status | Dedikerte emner | Støttende emner | Områder | Eksempler |');
    lines.push('|---|---:|---:|---:|---:|---|');
    for (const cell of axis.cells) {
      const examples = cell.sample_matches.slice(0, 4).map((match) => match.title).filter(Boolean).join('; ') || 'Ingen';
      lines.push(`| ${cell.label} | ${statusIcon(cell.status)} ${cell.status} | ${cell.counts.dedicated_emner}/${cell.thresholds.minimum_dedicated_emner} | ${cell.counts.supporting_emner}/${cell.thresholds.minimum_supporting_emner} | ${cell.counts.distinct_areas}/${cell.thresholds.minimum_distinct_areas} | ${examples} |`);
    }
  }

  lines.push('');
  lines.push('## Historiefaglig produksjon');
  lines.push('');
  lines.push('| Krav | Status | Måling |');
  lines.push('|---|---:|---|');
  for (const check of report.production.checks) {
    let measurement = '';
    if ('ratio' in check.measured) measurement = `${pct(check.measured.ratio)} (${check.measured.qualifying ?? check.measured.violating}/${check.measured.total})`;
    else if ('existing_paths' in check.measured) measurement = check.measured.existing_paths.length ? check.measured.existing_paths.join(', ') : 'Ingen av kandidatfilene finnes';
    lines.push(`| ${check.label} | ${statusIcon(check.status)} ${check.status} | ${measurement} |`);
  }

  lines.push('');
  lines.push('## Prioriterte faglige gap');
  lines.push('');
  const gaps = Object.values(report.axes).flatMap((axis) => axis.cells.filter((cell) => cell.status !== 'COVERED').map((cell) => ({...cell, axis: axis.label})))
    .sort((a, b) => (a.status === 'MISSING' ? 0 : 1) - (b.status === 'MISSING' ? 0 : 1) || a.label.localeCompare(b.label, 'nb'));
  if (!gaps.length) lines.push('Ingen åpne fagceller.');
  for (const gap of gaps) {
    lines.push(`- **${gap.axis} — ${gap.label} (${gap.status}):** ${gap.gap_action}`);
  }
  for (const check of report.production.checks.filter((item) => item.status === 'GAP')) {
    lines.push(`- **Produksjon — ${check.label}:** ${check.gap_action}`);
  }

  lines.push('');
  lines.push('## Tolkningsregel');
  lines.push('');
  lines.push('Auditen er bevisst streng og diagnostisk. Et ordtreff i en beskrivelse gir bare støtte; kjernedekning krever dedikerte emner eller områder. `COVERED` betyr at strukturen har eksplisitt nok plass til feltet, ikke at alle claims, kilder, steder eller fortolkninger allerede er faglig dokumentert. Produksjonskravene må også bestås før status kan bli `COMPLETE`.');
  lines.push('');
  lines.push('Rapporten er deterministisk og bindes til SHA-256-fingeravtrykkene under `source_fingerprints` i JSON-rapporten.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

fs.mkdirSync(reportDir, { recursive: true });
const coverageContract = readJson(coverageContractPath);
const contractErrors = validateContract(coverageContract);
if (contractErrors.length) {
  console.error('Historie universal coverage contract is invalid:');
  for (const error of contractErrors) console.error(`- ${error}`);
  process.exit(1);
}

const historyContract = readJson(historyContractPath);
const authoritative = historyContract.authoritative_files || {};
const resolveHistoryFile = (key) => {
  if (!authoritative[key]) throw new Error(`historie_v5_contract.json lacks authoritative file: ${key}`);
  return path.join(historyDir, authoritative[key]);
};
const emnerPath = resolveHistoryFile('emner');
const pensumPath = resolveHistoryFile('pensum');
const methodsPath = resolveHistoryFile('methods');
const conceptsPath = resolveHistoryFile('concepts');
const theoriesPath = resolveHistoryFile('theories');
const fagkartPath = resolveHistoryFile('fagkart');
const readinessPath = path.join(root, coverageContract.source_model.readiness_report);

const emner = readJson(emnerPath);
const pensum = readJson(pensumPath);
const methodsFile = readJson(methodsPath);
const concepts = readJson(conceptsPath);
const theories = readJson(theoriesPath);
const theoryEvidenceCheck = coverageContract.production_checks.find((check) => check.type === 'theory_evidence_registry_ratio');
const theoryEvidenceRegistryPath = theoryEvidenceCheck?.registry_path ? path.join(root, theoryEvidenceCheck.registry_path) : null;
const theoryEvidenceRegistry = theoryEvidenceRegistryPath && fs.existsSync(theoryEvidenceRegistryPath) ? readJson(theoryEvidenceRegistryPath) : { entries: [] };
const readiness = fs.existsSync(readinessPath) ? readJson(readinessPath) : {};

if (!Array.isArray(emner) || !Array.isArray(concepts) || !Array.isArray(theories)) {
  throw new Error('Expected emner, concepts and theories to be arrays.');
}

const axes = {};
for (const [axisId, axisContract] of Object.entries(coverageContract.axes)) {
  const cells = axisContract.cells.map((cell) => evaluateCell(cell, emner, coverageContract.matching_policy));
  const counts = {
    covered: cells.filter((cell) => cell.status === 'COVERED').length,
    partial: cells.filter((cell) => cell.status === 'PARTIAL').length,
    missing: cells.filter((cell) => cell.status === 'MISSING').length,
  };
  axes[axisId] = {
    id: axisId,
    label: axisContract.label,
    requirement: axisContract.requirement,
    status: counts.covered === cells.length ? 'COMPLETE' : 'INCOMPLETE',
    counts,
    cells,
  };
}

const productionChecks = coverageContract.production_checks.map((check) => evaluateProductionCheck(check, emner, theories, theoryEvidenceRegistry));
const production = {
  status: productionChecks.every((check) => check.status === 'PASS') ? 'COMPLETE' : 'INCOMPLETE',
  counts: {
    passed: productionChecks.filter((check) => check.status === 'PASS').length,
    gaps: productionChecks.filter((check) => check.status === 'GAP').length,
  },
  checks: productionChecks,
};

const allCells = Object.values(axes).flatMap((axis) => axis.cells);
const universalComplete = allCells.every((cell) => cell.status === 'COVERED') && production.status === 'COMPLETE';
const totalDomains = A(readiness.domains).length || A(pensum.domains).length;
const coveredDomains = A(readiness.domains).filter((domain) => domain.coverage_complete === true).length;
const legacyAllComplete = readiness.global_gates?.all_domains_coverage_complete === true;

const fingerprintFiles = [
  coverageContractPath,
  historyContractPath,
  emnerPath,
  pensumPath,
  methodsPath,
  conceptsPath,
  theoriesPath,
  fagkartPath,
];
if (fs.existsSync(readinessPath)) fingerprintFiles.push(readinessPath);
for (const check of coverageContract.production_checks.filter((item) => item.type === 'candidate_file_exists')) {
  for (const candidate of A(check.paths)) {
    const file = path.join(root, candidate);
    if (fs.existsSync(file)) fingerprintFiles.push(file);
  }
}
if (theoryEvidenceRegistryPath && fs.existsSync(theoryEvidenceRegistryPath)) fingerprintFiles.push(theoryEvidenceRegistryPath);
for (const key of ['case_requirements', 'profiles_manifest', 'oslo_akershus_profile']) {
  if (!authoritative[key]) continue;
  const file = path.join(historyDir, authoritative[key]);
  if (fs.existsSync(file)) fingerprintFiles.push(file);
}
const sourceFingerprints = Object.fromEntries(unique(fingerprintFiles).map((file) => [relative(file), sha256(file)]));

const report = {
  schema_version: '1.0',
  report_id: 'historie_universal_coverage_v1',
  subject_id: 'historie',
  status: universalComplete ? 'COMPLETE' : 'INCOMPLETE',
  completion_definition: coverageContract.completion_policy,
  source_fingerprints: sourceFingerprints,
  inventory: {
    domains: A(pensum.domains).length,
    emner: emner.length,
    methods: A(methodsFile.methods).length,
    concepts: concepts.length,
    theories: theories.length,
  },
  legacy_internal_readiness: {
    status: readiness.status || null,
    total_domains: totalDomains,
    covered_domains: coveredDomains,
    all_domains_coverage_complete: legacyAllComplete,
    false_complete_conflict: legacyAllComplete && !universalComplete,
    interpretation: 'The legacy readiness report verifies the selected V5.5 inventory. It does not independently establish universal subject coverage.',
  },
  summary: {
    total_cells: allCells.length,
    covered_cells: allCells.filter((cell) => cell.status === 'COVERED').length,
    partial_cells: allCells.filter((cell) => cell.status === 'PARTIAL').length,
    missing_cells: allCells.filter((cell) => cell.status === 'MISSING').length,
    production_passes: production.counts.passed,
    production_gaps: production.counts.gaps,
  },
  axes,
  production,
};

const jsonOutput = stableJson(report);
const markdownOutput = renderMarkdown(report);

if (checkMode) {
  const checks = [
    [jsonReportPath, jsonOutput],
    [markdownReportPath, markdownOutput],
  ];
  const stale = checks.filter(([file, expected]) => !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== expected);
  if (stale.length) {
    console.error('Historie universal coverage reports are missing or stale:');
    for (const [file] of stale) console.error(`- ${relative(file)}`);
    console.error('Run: node tools/audit-historie-universal-coverage.mjs');
    process.exit(1);
  }
} else {
  fs.writeFileSync(jsonReportPath, jsonOutput);
  fs.writeFileSync(markdownReportPath, markdownOutput);
}

console.log(`Historie universal coverage: ${report.status}`);
console.log(`Coverage cells: ${report.summary.covered_cells} covered, ${report.summary.partial_cells} partial, ${report.summary.missing_cells} missing.`);
console.log(`Production: ${report.summary.production_passes} passed, ${report.summary.production_gaps} gaps.`);
console.log(`Legacy internal readiness: ${report.legacy_internal_readiness.status}; false-complete conflict=${report.legacy_internal_readiness.false_complete_conflict}.`);

if (requireComplete && report.status !== 'COMPLETE') process.exit(2);
