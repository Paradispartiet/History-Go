#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT = 'data/fag/fagverk_theory_quality_contract_v1.json';
const MANIFEST = 'data/fag/fag_manifest.json';
const STATUS = 'data/fagverk/subject_status.json';
const REPORT = 'reports/fagverk/fagverk-theory-integrity-audit.json';
const ARCHIVE = /(^|\/)(arkiv|archive)(\/|$)/i;
const EXCLUDED = new Set(['data/fag/musikk/emnergvb_musikk.json']);
const SUBJECT_ROOT_ALIASES = {
  film_tv: ['data/fag/TV_og_Film'],
  teknologi: ['data/fag/teknologi']
};

const arr = (v) => Array.isArray(v) ? v : [];
const clean = (v) => String(v ?? '').trim();
const abs = (p) => path.join(ROOT, p);
const exists = (p) => fs.existsSync(abs(p));
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const uniq = (xs) => [...new Set(xs.filter(Boolean))];
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

function resolveManifestFile(relative) {
  if (!relative) return null;
  if (relative.startsWith('data/')) return relative;
  return path.posix.join('data/fag', relative);
}

function manifestEntry(manifest, id) {
  if (id === 'teknologi') return manifest.vitenskap?.specializations?.teknologi ?? null;
  return manifest[id] ?? null;
}

function walk(rel) {
  if (!exists(rel) || ARCHIVE.test(rel) || EXCLUDED.has(rel)) return [];
  const stat = fs.statSync(abs(rel));
  if (stat.isFile()) return rel.endsWith('.json') ? [rel] : [];
  return fs.readdirSync(abs(rel), { withFileTypes: true })
    .flatMap((entry) => walk(path.posix.join(rel, entry.name)));
}

function subjectFiles(id, entry) {
  const manifestFiles = Object.values(entry ?? {})
    .filter((v) => typeof v === 'string' && v.endsWith('.json'))
    .map(resolveManifestFile)
    .filter(Boolean);
  const roots = [
    `data/fag/${id}`,
    `data/fagverk/${id}`,
    ...(SUBJECT_ROOT_ALIASES[id] ?? [])
  ];
  return uniq([...manifestFiles, ...roots.flatMap(walk)]).filter((p) => exists(p)).sort();
}

function emneItems(doc) {
  if (Array.isArray(doc)) return doc;
  for (const key of ['emner', 'topics', 'items', 'entries']) {
    if (Array.isArray(doc?.[key])) return doc[key];
  }
  return [];
}

function fieldId(item) {
  return clean(item?.domain_id || item?.area_id || item?.category_id || item?.field_id || item?.id || item?.module_id);
}

function fieldLabel(item, id) {
  return clean(item?.label || item?.title || item?.name || id);
}

function fieldEmneIds(item, emner, id) {
  const direct = uniq([
    ...arr(item?.emne_ids),
    ...arr(item?.emner).map((x) => typeof x === 'string' ? x : x?.emne_id),
    ...arr(item?.topic_ids)
  ].map(clean));
  if (direct.length) return direct;
  return uniq(emner
    .filter((e) => clean(e?.domain_id || e?.area_id || e?.category_id || e?.field_id) === id)
    .map((e) => clean(e?.emne_id || e?.topic_id || e?.id)));
}

function extractMajorFields(pensum, fagkart, emner) {
  let source = null;
  let items = [];
  if (Array.isArray(pensum?.domains) && pensum.domains.length) {
    source = 'pensum.domains';
    items = pensum.domains;
  } else if (Array.isArray(fagkart?.categories) && fagkart.categories.length) {
    source = 'fagkart.categories';
    items = fagkart.categories;
  } else if (Array.isArray(pensum?.areas) && pensum.areas.length) {
    source = 'pensum.areas';
    items = pensum.areas;
  } else if (Array.isArray(pensum?.major_fields) && pensum.major_fields.length) {
    source = 'pensum.major_fields';
    items = pensum.major_fields;
  } else if (Array.isArray(pensum?.modules) && pensum.modules.length) {
    source = 'pensum.modules_fallback';
    items = pensum.modules;
  }

  const fields = items.map((item) => {
    const id = fieldId(item);
    return {
      id,
      label: fieldLabel(item, id),
      emneIds: fieldEmneIds(item, emners, id)
    };
  }).filter((field) => field.id);

  return {
    resolved: Boolean(source && fields.length),
    source,
    fields,
    duplicateFieldIds: fields.length - new Set(fields.map((field) => field.id)).size
  };
}

const BINDING_KEYS = new Set([
  'emne_id','emne_ids','topic_id','topic_ids','claim_id','claim_ids','used_in',
  'paragraphClaimIds','paragraph_claim_ids','theory_ref','theory_refs','scholarly_refs',
  'domain_id','domain_ids','area_id','area_ids','field_id','field_ids'
]);
const SOURCE_KEYS = new Set(['scholarly_source_ids','scholarly_sources','scholarly_refs','source_ids','sources','references']);
const PEOPLE_KEYS = new Set(['thinkers','theorists','teoretikere','researchers','forskere','scholars','debate_thinkers']);
const CORE_KEYS = new Set(['core_claim_or_mechanism','core_claim','mechanism','mekanisme','theory','teori','model','modell','framework','rammeverk','paradigm','paradigme','law','lov']);
const LIMIT_KEYS = new Set(['limitations','limitation','begrensninger','validity_domain','gyldighetsomrade','assumptions','forutsetninger','caveats','forbehold']);
const RIVAL_KEYS = new Set(['rival_or_alternative','rival','alternative','alternativ','competing_position','competing_positions','motperspektiv']);
const PROSE_BINDING_KEYS = new Set(['claim_id','claim_ids','paragraphClaimIds','paragraph_claim_ids','used_in','prose_usage','prose_bindings','claim_source_ids']);

function idsFromValue(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(idsFromValue);
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, nested]) => {
      if (['id','emne_id','topic_id','claim_id','domain_id','area_id','field_id'].includes(key) && typeof nested === 'string') return [nested];
      return [];
    });
  }
  return [];
}

function collectDirect(obj, keySet) {
  return uniq(Object.entries(obj ?? {})
    .filter(([key]) => keySet.has(key))
    .flatMap(([, value]) => idsFromValue(value))
    .map(clean));
}

function hasAnyKey(obj, keySet) {
  return Object.keys(obj ?? {}).some((key) => keySet.has(key));
}

function peopleWorkStats(obj) {
  let named = 0;
  let withWork = 0;
  for (const [key, value] of Object.entries(obj ?? {})) {
    if (!PEOPLE_KEYS.has(key)) continue;
    for (const person of arr(value)) {
      if (typeof person === 'string') {
        if (clean(person)) named += 1;
      } else if (person && typeof person === 'object') {
        const name = clean(person.name || person.label || person.id);
        if (!name) continue;
        named += 1;
        if (arr(person.works).some((work) => clean(typeof work === 'string' ? work : work?.title || work?.id)) || clean(person.work || person.contribution || person.research_contribution)) withWork += 1;
      }
    }
  }
  return { named, withWork };
}

function theoryCandidate(obj, file, objectPath) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  const bindings = collectDirect(obj, BINDING_KEYS);
  const sources = collectDirect(obj, SOURCE_KEYS);
  const proseBindings = collectDirect(obj, PROSE_BINDING_KEYS);
  const people = peopleWorkStats(obj);
  const hasScope = Boolean(clean(obj.scope));
  const hasCore = hasAnyKey(obj, CORE_KEYS);
  const hasLimits = hasAnyKey(obj, LIMIT_KEYS);
  const hasRival = hasAnyKey(obj, RIVAL_KEYS);
  const hasIdentity = Boolean(clean(obj.id || obj.theory_id || obj.model_id || obj.label || obj.name));
  const theoryShaped = (hasScope && hasCore) || (hasCore && (hasLimits || hasRival)) || (hasIdentity && bindings.length && (hasLimits || hasRival));
  if (!theoryShaped) return null;
  return {
    file,
    objectPath,
    id: clean(obj.id || obj.theory_id || obj.model_id || obj.label || obj.name) || objectPath,
    bindings,
    sources,
    proseBindings,
    hasScope,
    hasCore,
    hasLimits,
    hasRival,
    namedPeople: people.named,
    namedPeopleWithWork: people.withWork
  };
}

function collectCandidates(value, file, objectPath = '$', out = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectCandidates(item, file, `${objectPath}[${index}]`, out));
    return out;
  }
  if (!value || typeof value !== 'object') return out;
  const candidate = theoryCandidate(value, file, objectPath);
  if (candidate) out.push(candidate);
  for (const [key, nested] of Object.entries(value)) collectCandidates(nested, file, `${objectPath}.${key}`, out);
  return out;
}

function candidateMatchesField(candidate, field) {
  const ids = new Set([field.id, ...field.emneIds]);
  return candidate.bindings.some((id) => ids.has(id));
}

function summarizeField(field, candidates) {
  const matches = candidates.filter((candidate) => candidateMatchesField(candidate, field));
  const fullyStructured = matches.filter((candidate) => candidate.hasScope && candidate.hasCore && candidate.hasLimits);
  const withSources = matches.filter((candidate) => candidate.sources.length > 0);
  const withProseBinding = matches.filter((candidate) => candidate.proseBindings.length > 0);
  const namedPeople = matches.reduce((sum, candidate) => sum + candidate.namedPeople, 0);
  const namedPeopleWithWork = matches.reduce((sum, candidate) => sum + candidate.namedPeopleWithWork, 0);
  const namedPeopleWithoutWork = Math.max(0, namedPeople - namedPeopleWithWork);
  const withRival = matches.filter((candidate) => candidate.hasRival);

  const missingSignals = [];
  if (!matches.length) missingSignals.push('bearing_theory_or_model');
  if (matches.length && !fullyStructured.length) missingSignals.push('scope_core_limit_integrity');
  if (matches.length && !withSources.length) missingSignals.push('scholarly_source_binding');
  if (matches.length && !withProseBinding.length) missingSignals.push('explicit_prose_or_claim_binding');
  if (namedPeopleWithoutWork > 0) missingSignals.push('named_people_without_concrete_work');
  if (matches.length && !withRival.length) missingSignals.push('rival_or_alternative_not_explicitly_resolved');

  let status = 'red';
  if (matches.length) status = missingSignals.length ? 'yellow' : 'green';

  return {
    id: field.id,
    label: field.label,
    emneCount: field.emneIds.length,
    status,
    candidateCount: matches.length,
    fullyStructuredCandidateCount: fullyStructured.length,
    scholarlySourceBoundCandidateCount: withSources.length,
    explicitProseOrClaimBoundCandidateCount: withProseBinding.length,
    rivalOrAlternativeCandidateCount: withRival.length,
    namedPeople,
    namedPeopleWithConcreteWork: namedPeopleWithWork,
    missingSignals,
    evidence: matches.slice(0, 20).map((candidate) => ({
      id: candidate.id,
      file: candidate.file,
      objectPath: candidate.objectPath,
      bindings: candidate.bindings,
      sources: candidate.sources,
      proseBindings: candidate.proseBindings,
      hasScope: candidate.hasScope,
      hasCore: candidate.hasCore,
      hasLimits: candidate.hasLimits,
      hasRival: candidate.hasRival,
      namedPeople: candidate.namedPeople,
      namedPeopleWithWork: candidate.namedPeopleWithWork
    }))
  };
}

function auditSubject(contractEntry, manifest, statusById) {
  const entry = manifestEntry(manifest, contractEntry.id);
  if (!entry) return {
    id: contractEntry.id,
    profile: contractEntry.profile,
    editorialStatus: statusById.get(contractEntry.id)?.editorialStatus || (contractEntry.top_level ? 'unknown' : 'nested_specialization'),
    fieldInventoryResolved: false,
    fieldInventorySource: null,
    fields: [],
    status: 'red',
    blockers: ['manifest_entry_missing'],
    parseFailures: []
  };

  const pensumPath = resolveManifestFile(entry.pensum);
  const fagkartPath = resolveManifestFile(entry.fagkart);
  const emnerPath = resolveManifestFile(entry.emner);
  const parseFailures = [];
  let pensum = {}, fagkart = {}, emnerDoc = {};
  for (const [kind, file] of [['pensum', pensumPath], ['fagkart', fagkartPath], ['emner', emnersPath]]) {
    try {
      if (!file || !exists(file)) throw new Error(`${file || '<missing path>'} finnes ikke`);
      const value = json(file);
      if (kind === 'pensum') pensum = value;
      if (kind === 'fagkart') fagkart = value;
      if (kind === 'emner') emnersDoc = value;
    } catch (error) {
      parseFailures.push({ kind, file, error: String(error.message || error) });
    }
  }
  const emners = emneItems(emnersDoc);
  const inventory = extractMajorFields(pensum, fagkart, emners);
  const files = subjectFiles(contractEntry.id, entry);
  const candidates = [];
  for (const file of files) {
    try {
      collectCandidates(json(file), file, '$', candidates);
    } catch (error) {
      parseFailures.push({ kind: 'scan', file, error: String(error.message || error) });
    }
  }
  const fields = inventory.fields.map((field) => summarizeField(field, candidates));
  const blockers = [];
  if (!inventory.resolved) blockers.push('canonical_major_field_inventory_unresolved');
  if (inventory.duplicateFieldIds) blockers.push('duplicate_major_field_ids');
  if (parseFailures.length) blockers.push('parse_failures');
  if (fields.some((field) => field.status === 'red')) blockers.push('major_fields_without_bearing_theory_or_model');
  if (fields.some((field) => field.status === 'yellow')) blockers.push('major_fields_need_integrity_reconciliation');

  const status = blockers.length ? (fields.some((field) => field.status === 'red') || !inventory.resolved || parseFailures.length ? 'red' : 'yellow') : 'green';
  return {
    id: contractEntry.id,
    topLevel: contractEntry.top_level,
    parentSubject: contractEntry.parent_subject || null,
    profile: contractEntry.profile,
    editorialStatus: statusById.get(contractEntry.id)?.editorialStatus || (contractEntry.top_level ? 'unknown' : 'nested_specialization'),
    fieldInventoryResolved: inventory.resolved,
    fieldInventorySource: inventory.source,
    fieldCount: fields.length,
    theoryCandidateCount: candidates.length,
    filesScanned: files.length,
    status,
    blockers,
    parseFailures,
    fields
  };
}

export function auditFagverkTheoryIntegrity({ writeReport = false, checkReport = false } = {}) {
  const contract = json(CONTRACT);
  const manifest = json(MANIFEST);
  const status = json(STATUS);
  assert(contract.schema === 'history_go_fagverk_theory_quality_contract_v1', 'Ugyldig theory quality contract');
  assert(contract.status === 'integrity_gate_contract', 'Theory quality contract er ikke løftet til integrity gate contract');
  assert(contract.final_gate?.mode === 'per_major_field_not_aggregate', 'Final gate må være per_major_field_not_aggregate');
  assert(contract.subjects.length === 18, 'Integrity audit skal dekke 17 toppfag + Teknologi nested');

  const statusById = new Map(arr(status.subjects).map((subject) => [subject.id, subject]));
  const subjects = contract.subjects.map((entry) => auditSubject(entry, manifest, statusById));
  const fieldTotal = subjects.reduce((sum, subject) => sum + subject.fieldCount, 0);
  const fields = subjects.flatMap((subject) => subject.fields);
  const summary = {
    subjectsGreen: subjects.filter((subject) => subject.status === 'green').length,
    subjectsYellow: subjects.filter((subject) => subject.status === 'yellow').length,
    subjectsRed: subjects.filter((subject) => subject.status === 'red').length,
    fieldsTotal: fieldTotal,
    fieldsGreen: fields.filter((field) => field.status === 'green').length,
    fieldsYellow: fields.filter((field) => field.status === 'yellow').length,
    fieldsRed: fields.filter((field) => field.status === 'red').length,
    unresolvedFieldInventories: subjects.filter((subject) => !subject.fieldInventoryResolved).map((subject) => subject.id),
    parseFailureSubjects: subjects.filter((subject) => subject.parseFailures.length).map((subject) => subject.id)
  };
  const repairQueue = subjects.filter((subject) => subject.status !== 'green').map((subject) => subject.id);
  const report = {
    schema: 'history_go_fagverk_theory_integrity_audit_v1',
    version: '1.0.0',
    status: repairQueue.length ? 'field_integrity_reconciliation_in_progress' : 'final_integrity_candidate',
    mode: 'read_only',
    completionStatusChangesAllowed: false,
    finalReady: false,
    finalReadyRule: 'finalReady kan først settes true i en separat reconciliation når alle hovedfelt er konkret validert, subject-spesifikke strengere porter er koblet inn, rapporten er permanent og grønn på main.',
    scope: { topLevelSubjects: 17, nestedSpecializations: 1, totalAudited: 18, canonicalMajorFields: fieldTotal },
    summary,
    repairQueue,
    subjects
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
    fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) {
    assert(exists(REPORT), `${REPORT} mangler`);
    assert(JSON.stringify(json(REPORT)) === JSON.stringify(report), `${REPORT} er utdatert`);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    console.log(JSON.stringify(auditFagverkTheoryIntegrity({
      writeReport: args.has('--write-report'),
      checkReport: args.has('--check-report')
    }), null, 2));
  } catch (error) {
    console.error(`Fagverk theory integrity FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
