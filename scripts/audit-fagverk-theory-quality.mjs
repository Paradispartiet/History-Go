#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT = 'data/fag/fagverk_theory_quality_contract_v1.json';
const STATUS = 'data/fagverk/subject_status.json';
const REPORT = 'reports/fagverk/fagverk-theory-quality-audit.json';

const abs = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const exists = (p) => fs.existsSync(abs(p));
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const THEORY_KEYS = new Set([
  'theories','teorier','theory_hooks','theoryHooks','topic_hooks','topicHooks',
  'theory_lane','theory_lanes','theoryLane','theoryLanes','theory_objects','theoryObjects',
  'models','modeller','frameworks','rammeverk','paradigms','paradigmer','laws','lover','principles','prinsipper'
]);
const PEOPLE_KEYS = new Set([
  'thinkers','theorists','theoreticians','teoretikere','debate_thinkers','debateThinkers',
  'researchers','forskere','scholars'
]);
const WORK_KEYS = new Set(['works','verk','work_refs','workRefs','primary_works','primaryWorks','key_works','keyWorks']);
const BINDING_KEYS = new Set([
  'emne_id','emne_ids','claim_id','claim_ids','used_in','topic_hook_id','topic_hook_ids',
  'theory_ref','theory_refs','paragraphClaimIds','paragraph_claim_ids'
]);
const RIVAL_KEY = /(rival|alternativ|competing|debate|motperspektiv|counter|contested)/i;
const LIMIT_KEY = /(limitation|begrens|assumption|forutset|validity|gyldighet|scope|misuse|caveat|forbehold)/i;
const THEORY_TEXT = /\b(teori|theory|modell|model|paradigm|rammeverk|framework|skole|school|retning|perspektiv)\b/gi;
const ARCHIVE_SEGMENT = /(^|\/)(arkiv|archive)(\/|$)/i;

function filesUnder(rel) {
  if (!exists(rel) || ARCHIVE_SEGMENT.test(rel)) return [];
  const full = abs(rel);
  const stat = fs.statSync(full);
  if (stat.isFile()) return full.endsWith('.json') ? [rel] : [];
  const out = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const child = path.posix.join(rel, entry.name);
    if (ARCHIVE_SEGMENT.test(child)) continue;
    if (entry.isDirectory()) out.push(...filesUnder(child));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(child);
  }
  return out;
}

function unitCount(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) return 0;
    const objectMap = keys.every((k) => value[k] && typeof value[k] === 'object');
    return objectMap ? keys.length : 1;
  }
  return value == null || value === '' ? 0 : 1;
}

function inspect(value, metrics, key = '') {
  if (THEORY_KEYS.has(key)) metrics.structuredUnits += unitCount(value);
  if (PEOPLE_KEYS.has(key)) metrics.namedPeople += unitCount(value);
  if (WORK_KEYS.has(key)) metrics.works += unitCount(value);
  if (BINDING_KEYS.has(key)) metrics.contentBindings += unitCount(value);
  if (RIVAL_KEY.test(key)) metrics.rivalSignals += Math.max(1, unitCount(value));
  if (LIMIT_KEY.test(key)) metrics.limitSignals += Math.max(1, unitCount(value));

  if (typeof value === 'string') {
    const hits = value.match(THEORY_TEXT);
    if (hits) metrics.theoryTextMentions += hits.length;
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) inspect(item, metrics, key);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) inspect(v, metrics, k);
  }
}

function scanSubject(subjectId) {
  const roots = [
    `data/fag/${subjectId}`,
    `data/fag/${subjectId}.json`,
    `data/fagverk/${subjectId}`,
    `data/fagverk/${subjectId}.json`
  ];
  const files = [...new Set(roots.flatMap(filesUnder))].sort();
  const metrics = {
    filesScanned: files.length,
    structuredUnits: 0,
    namedPeople: 0,
    works: 0,
    contentBindings: 0,
    rivalSignals: 0,
    limitSignals: 0,
    theoryTextMentions: 0
  };
  const parseFailures = [];
  for (const file of files) {
    try { inspect(readJson(file), metrics); }
    catch (error) { parseFailures.push({ file, error: String(error.message || error) }); }
  }
  metrics.namedPeopleOrWorks = metrics.namedPeople + metrics.works;
  metrics.rivalOrLimitSignals = metrics.rivalSignals + metrics.limitSignals;
  return { files, metrics, parseFailures };
}

function classify(metrics, profile) {
  const min = profile.minimum;
  const strong = metrics.structuredUnits >= min.structured_units &&
    metrics.namedPeopleOrWorks >= min.named_people_or_works &&
    metrics.rivalOrLimitSignals >= min.rival_or_limit_signals &&
    metrics.contentBindings >= min.content_bindings;
  if (strong) return 'strong_structured_evidence';
  const partialStructured = metrics.structuredUnits >= Math.max(1, Math.ceil(min.structured_units / 2));
  const partialPeople = min.named_people_or_works === 0 || metrics.namedPeopleOrWorks >= 1;
  if (partialStructured && partialPeople && metrics.contentBindings >= 1) return 'partial_structured_evidence';
  if (metrics.theoryTextMentions >= 10 && metrics.contentBindings >= 1) return 'unstructured_theory_evidence';
  return 'theory_quality_gap';
}

function missingSignals(metrics, profile) {
  const min = profile.minimum;
  const missing = [];
  if (metrics.structuredUnits < min.structured_units) missing.push('structured_units');
  if (metrics.namedPeopleOrWorks < min.named_people_or_works) missing.push('named_people_or_works');
  if (metrics.rivalOrLimitSignals < min.rival_or_limit_signals) missing.push('rival_or_limit_signals');
  if (metrics.contentBindings < min.content_bindings) missing.push('content_bindings');
  return missing;
}

function stableSubject(entry, statusById, scan, profile) {
  const baseline = classify(scan.metrics, profile);
  const editorialStatus = statusById.get(entry.id)?.editorialStatus || 'nested_specialization';
  return {
    id: entry.id,
    topLevel: entry.top_level,
    parentSubject: entry.parent_subject || null,
    profile: entry.profile,
    editorialStatus,
    baseline,
    repairPriority: baseline === 'strong_structured_evidence' ? 'none' : (editorialStatus === 'complete' || editorialStatus === 'expanded_and_audited' ? 'high' : 'medium'),
    missingSignals: missingSignals(scan.metrics, profile),
    parseFailureCount: scan.parseFailures.length
  };
}

export function auditFagverkTheoryQuality({ writeReport = false, checkReport = true, includeDiagnostics = false } = {}) {
  const contract = readJson(CONTRACT);
  const status = readJson(STATUS);
  assert(contract.schema === 'history_go_fagverk_theory_quality_contract_v1', 'Ugyldig theory-quality contract');
  assert(contract.subjects.length === 18, 'Theory-quality contract skal dekke 17 toppfag + Teknologi nested');
  const topIds = status.subjects.map((s) => s.id).sort();
  const contractTopIds = contract.subjects.filter((s) => s.top_level).map((s) => s.id).sort();
  assert(JSON.stringify(topIds) === JSON.stringify(contractTopIds), 'Theory-quality contract matcher ikke canonical subject_status');

  const statusById = new Map(status.subjects.map((s) => [s.id, s]));
  const diagnostics = {};
  const subjects = contract.subjects.map((entry) => {
    const profile = contract.profiles[entry.profile];
    assert(profile, `Ukjent theory-quality profile: ${entry.profile}`);
    const scan = scanSubject(entry.id);
    diagnostics[entry.id] = { metrics: scan.metrics, parseFailures: scan.parseFailures };
    return stableSubject(entry, statusById, scan, profile);
  });

  const statuses = ['strong_structured_evidence','partial_structured_evidence','unstructured_theory_evidence','theory_quality_gap'];
  const counts = Object.fromEntries(statuses.map((k) => [k, subjects.filter((s) => s.baseline === k).length]));
  const report = {
    schema: 'history_go_fagverk_theory_quality_audit_v1',
    version: '1.0.0',
    status: 'baseline_only_not_completion_gate',
    scope: { topLevelSubjects: 17, nestedSpecializations: 1, totalAudited: 18 },
    rules: {
      noCompletionStatusChanges: true,
      strongRequiresStructuredTheoryOrModels: true,
      contestedFieldsRequireRivalOrLimitSignals: true,
      namedPeopleRequiredOnlyByProfile: true,
      actualContentBindingRequired: true,
      archivedCopiesExcluded: true,
      genericContributorsDoNotCountAsTheorists: true
    },
    summary: counts,
    repairQueue: subjects.filter((s) => s.baseline !== 'strong_structured_evidence').map((s) => s.id),
    subjects
  };

  assert(subjects.every((s) => s.parseFailureCount === 0), `Aktive theory-quality inputs har parsefeil: ${subjects.filter((s) => s.parseFailureCount).map((s) => s.id).join(', ')}`);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
    fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) {
    assert(exists(REPORT), `${REPORT} mangler`);
    assert(JSON.stringify(readJson(REPORT)) === JSON.stringify(report), `${REPORT} er utdatert; kjør audit med --write-report`);
  }
  return includeDiagnostics ? { ...report, diagnostics } : report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditFagverkTheoryQuality({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report'),
      includeDiagnostics: args.has('--diagnostic')
    });
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(`Fagverk theory quality FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
