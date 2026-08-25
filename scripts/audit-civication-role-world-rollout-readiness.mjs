#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MATRIX_PATH = 'data/Civication/careerGameplayMatrix.json';
const REALISM_PATH = 'data/Civication/roleWorldRealismMatrix.json';
const POLICY_PATH = 'data/Civication/roleWorldPolicy.json';
const ROLE_WORLD_INDEX_PATH = 'data/Civication/roleWorlds/index.json';
const OUTPUT_PATH = 'data/Civication/roleWorldRolloutReadiness.json';
const REPORT_PATH = 'reports/civication-role-world-rollout-readiness.md';
const CAREER_STATUSES = new Set(['reference_complete', 'playable', 'partial', 'architecture_only']);
const DIMENSION_IDS = [
  'persistent_work_object',
  'institution_authority',
  'rhythm_waiting_handoff_rework',
  'history_go_affordance',
  'situated_reputation',
  'people_places_integrity',
  'provenance'
];
const ROLE_CLASSIFICATIONS = new Set(['rollout_ready', 'needs_role_authored_work', 'blocked']);
const TARGET_FIRST_WAVE_FAMILIES = [
  'economy_business',
  'creative_production',
  'care_professional',
  'event_operational'
];

function abs(rel) { return path.join(ROOT, rel); }
function exists(rel) { return Boolean(rel) && fs.existsSync(abs(rel)); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
const textCache = new Map();
function readText(rel) {
  if (!exists(rel)) return '';
  if (!textCache.has(rel)) textCache.set(rel, fs.readFileSync(abs(rel), 'utf8'));
  return textCache.get(rel);
}
function uniq(values) {
  return [...new Set(values.filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b, 'nb'));
}
function collectPathStrings(value, out = []) {
  if (Array.isArray(value)) value.forEach((item) => collectPathStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectPathStrings(item, out));
  else if (typeof value === 'string' && /^(data|tests|reports|docs|js)\//.test(value)) out.push(value.split('#')[0]);
  return out;
}
function component(world, id) {
  return world?.audit?.components?.[id] || { level: 'missing', evidence: [], note: 'No component evidence.' };
}
function componentEvidence(world, id) {
  return uniq(component(world, id).evidence || []).filter(exists).slice(0, 6);
}
function dimension(status, evidence, rationale) {
  return { status, evidence: uniq(evidence).filter(exists).slice(0, 8), rationale };
}
function hasAny(text, regexes) { return regexes.some((regex) => regex.test(text)); }
function scopeKey(world) { return `${world.category}/${world.role_scope}`; }

const career = readJson(MATRIX_PATH);
const realism = readJson(REALISM_PATH);
const policy = readJson(POLICY_PATH);
const roleWorldIndex = readJson(ROLE_WORLD_INDEX_PATH);

const worlds = (career.worlds || []).filter((world) => CAREER_STATUSES.has(world.status));
if (worlds.length !== career.summary?.career_worlds) {
  throw new Error(`Career world count drift: summary=${career.summary?.career_worlds}, discovered=${worlds.length}`);
}

const roleWorldByKey = new Map((roleWorldIndex.roles || []).map((row) => [`${row.category}/${row.role_scope}`, row]));
const pilotByKey = new Map((realism.pilot_set || []).map((pilot) => [`${pilot.category}/${pilot.role_scope}`, pilot]));
const pilotIdsByDimension = new Map((realism.locked_cross_role_dimensions || []).map((entry) => [entry.id, new Set(entry.evidence_pilots || [])]));
const sharedProof = realism.cross_role_shared_world_proof || {};
const sharedProofKeys = new Set([
  sharedProof.owner ? `${sharedProof.owner.category}/${sharedProof.owner.role_scope}` : null,
  sharedProof.second_role ? `${sharedProof.second_role.category}/${sharedProof.second_role.role_scope}` : null
].filter(Boolean));

function structuralFamily(world) {
  const hay = `${world.category} ${world.role_scope} ${(world.badge_titles || []).join(' ')}`.toLowerCase();
  if (world.category === 'naeringsliv' || /(økonomi|okonomi|controller|regnskap|finans|analyt|administrasjon|virksomhet|handel|butikk)/.test(hay)) return 'economy_business';
  if (/(film|regiss|producer|produksjon|manus|serieskaper|scenekunst|kunstner|design|fotograf|kreativ|redaksjon)/.test(hay)) return 'creative_production';
  if (/(psykolog|klinisk|helse|omsorg|terapeut|sykeple|lege|behandling|sosialarbeid)/.test(hay)) return 'care_professional';
  if (/(arrangement|event|kamp|arena|drift|logistikk|operativ|crew|tekniker|scene|festival|sportsledelse)/.test(hay)) return 'event_operational';
  if (world.category === 'by' || world.category === 'politikk' || /(saksbehandler|plan|forvaltning|offentlig|rådgiver|radgiver)/.test(hay)) return 'public_administration';
  if (world.category === 'sport' || /(trener|utøver|utover|kaptein|idrett)/.test(hay)) return 'sport_performance';
  if (world.category === 'media' || /(journalist|reporter|redaktør|redaktor|nyhets)/.test(hay)) return 'media_editorial';
  if (/(lærer|laerer|undervis|forsk|akadem|vitenskap|filosofi|pedagog)/.test(hay)) return 'research_education';
  return 'other';
}

function crossRoleAssessment(world, allWorlds) {
  const key = scopeKey(world);
  if (sharedProofKeys.has(key)) {
    return {
      need: 'proven_when_shared_work_is_material',
      companion_keys: [...sharedProofKeys].filter((candidate) => candidate !== key).sort(),
      rationale: 'Existing cross-role proof demonstrates a shared work object with distinct lenses and authority without privilege leakage.'
    };
  }
  const hay = `${world.role_scope} ${(world.badge_titles || []).join(' ')}`.toLowerCase();
  const candidatePattern = /(leder|sjef|redakt|redaksjon|prosjektleder|saksbehandler|assistent|produksjon|regiss|controller|analyt|trener|kaptein|koordinator)/;
  if (!candidatePattern.test(hay)) {
    return {
      need: 'not_required_for_rollout',
      companion_keys: [],
      rationale: 'Cross-role linkage is optional and must only be authored where the work itself is genuinely shared.'
    };
  }
  const companions = allWorlds
    .filter((other) => other.category === world.category && scopeKey(other) !== key)
    .filter((other) => candidatePattern.test(`${other.role_scope} ${(other.badge_titles || []).join(' ')}`.toLowerCase()))
    .map(scopeKey)
    .slice(0, 5);
  return {
    need: companions.length ? 'candidate_when_shared_work_is_real' : 'not_required_for_rollout',
    companion_keys: companions,
    rationale: companions.length
      ? 'This role has plausible same-domain handoff or leadership counterparts; a shared object is a design candidate, not a mandatory gate.'
      : 'No credible same-domain shared-work counterpart was found; do not force a cross-role link.'
  };
}

function auditWorld(world) {
  const key = scopeKey(world);
  const pilot = pilotByKey.get(key) || null;
  const roleWorld = roleWorldByKey.get(key) || null;
  const artifactPaths = uniq([
    ...collectPathStrings(world.artifacts || {}),
    roleWorld?.path
  ]).filter(exists);
  const corpusPaths = artifactPaths.filter((rel) =>
    rel === roleWorld?.path ||
    /\/roleModels\//.test(rel) ||
    /\/workGrammars\//.test(rel) ||
    /\/mailPlans\//.test(rel) ||
    /\/mailFamilies\/[^/]+\/(job|people|knowledge|followup|consequence)\//.test(rel) ||
    /^tests\/civication-/.test(rel)
  );
  const corpus = corpusPaths.map(readText).join('\n');
  const roleTests = uniq(world.artifacts?.role_tests || []).filter(exists);
  const hasPlan = exists(world.artifacts?.mail_plan);
  const grammarPaths = uniq([world.artifacts?.work_grammar, ...(world.artifacts?.shared_work_grammars || [])]).filter(exists);
  const jobPath = world.artifacts?.mail_families?.job?.path;
  const hasJob = exists(jobPath) && Number(world.artifacts?.mail_families?.job?.count || 0) > 0;
  const evidenceForPilotDimension = (matrixDimensionId) => Boolean(
    pilot && pilotIdsByDimension.get(matrixDimensionId)?.has(pilot.id)
  );

  const persistentEvidence = uniq([roleWorld?.path, ...grammarPaths, hasJob ? jobPath : null]);
  const persistentSignal = hasAny(corpus, [
    /work_object/i,
    /object_ids/i,
    /work_object_ops/i,
    /persistent/i,
    /rework_of_scene_id/i,
    /case[_ -]/i,
    /sak[_ -]/i,
    /oppdrag/i,
    /prosjekt/i
  ]);
  const persistent = evidenceForPilotDimension('persistent_work_object')
    ? dimension('proven', [...persistentEvidence, ...(pilot?.evidence_refs || [])], 'Matrix pilot evidence proves persistent work identity for this role.')
    : persistentSignal && component(world, 'workday_loop').level === 'complete'
      ? dimension('foundation_ready', persistentEvidence, 'Existing work content carries stable object/case/project signals and a complete workday loop; the rollout PR must bind them explicitly to the locked persistent-work contract.')
      : dimension('needs_role_authored_work', persistentEvidence, 'The current career foundation does not yet prove a stable persistent work object across later scenes.');

  const authorityLevel = component(world, 'authority').level;
  const authoritySignal = hasAny(corpus, [
    /authority_context/i,
    /authority_rules/i,
    /institution_id/i,
    /reporting_line/i,
    /approval_points/i,
    /escalation_paths/i,
    /mandat/i
  ]);
  let authority;
  if (authorityLevel !== 'complete') {
    authority = dimension('blocked', componentEvidence(world, 'authority'), `Career authority component is ${authorityLevel}; broad rollout must not weaken or infer formal authority.`);
  } else if (evidenceForPilotDimension('institution_authority')) {
    authority = dimension('proven', [...componentEvidence(world, 'authority'), ...(pilot?.evidence_refs || [])], 'Matrix pilot evidence proves institution and authority boundaries for this role.');
  } else {
    authority = dimension(authoritySignal ? 'foundation_ready' : 'foundation_ready', componentEvidence(world, 'authority'), authoritySignal
      ? 'Existing authored sources already expose institutional/authority language; rollout must preserve direct, approval, escalation and forbidden-action boundaries.'
      : 'Career Matrix already proves an explicit authority boundary; rollout must author the richer institution/approval/escalation surface without changing the authority contract.');
  }

  const rhythmSignal = hasAny(corpus, [
    /rework/i,
    /handoff/i,
    /awaiting/i,
    /waiting/i,
    /deadline/i,
    /rework_of_scene_id/i,
    /interruption/i,
    /avbrudd/i,
    /venting/i,
    /overlever/i
  ]);
  const rhythmEvidence = uniq([roleWorld?.path, world.artifacts?.mail_plan, ...grammarPaths, jobPath]);
  const rhythm = evidenceForPilotDimension('rhythm_waiting_handoff_rework')
    ? dimension('proven', [...rhythmEvidence, ...(pilot?.evidence_refs || [])], 'Matrix pilot evidence proves role rhythm, waiting, handoff and rework through the existing Scene Pipeline.')
    : rhythmSignal && world.audit?.runtime_gate
      ? dimension('foundation_ready', rhythmEvidence, 'The current runtime-authored role already exposes deadline/rework/handoff signals; rollout must make the rhythm role-specific and persistent.')
      : dimension('needs_role_authored_work', rhythmEvidence, 'Waiting, handoff, interruption or rework is not yet explicit enough to prove a distinct role rhythm.');

  const knowledgeLevel = component(world, 'knowledge').level;
  const historySignal = hasAny(corpus, [
    /history[ _-]?go/i,
    /knowledge[_ -]?requirement/i,
    /knowledge[_ -]?unlock/i,
    /knowledge[_ -]?gate/i,
    /requires[^\n]{0,40}knowledge/i,
    /quiz/i
  ]);
  const historyEvidence = uniq([roleWorld?.path, ...componentEvidence(world, 'knowledge'), world.artifacts?.mail_families?.knowledge?.path]);
  const historyGo = evidenceForPilotDimension('history_go_affordance')
    ? dimension('proven', [...historyEvidence, ...(pilot?.evidence_refs || [])], 'Matrix pilot evidence proves that History Go knowledge can unlock a better professional affordance without granting formal authority.')
    : knowledgeLevel === 'complete'
      ? dimension(historySignal ? 'foundation_ready' : 'foundation_ready', historyEvidence, 'Career knowledge integration is complete; the rollout PR must author a concrete better-choice affordance while keeping authority independent from knowledge.')
      : dimension('needs_role_authored_work', historyEvidence, `Knowledge bridge is ${knowledgeLevel}; a concrete History Go affordance must be authored before this role is considered realism-ready.`);

  const situatedSignal = hasAny(corpus, [
    /(manager|team|professional|public|source):[a-z0-9_-]+/i,
    /situated[_ -]?(reputation|standing|audience)/i,
    /audience[_ -]?id/i
  ]);
  const situatedPilot = pilot && pilotIdsByDimension.get('situated_audience_types')?.has(pilot.id);
  const situatedEvidence = uniq([roleWorld?.path, world.artifacts?.mail_plan, jobPath]);
  const situated = situatedPilot
    ? dimension('proven', [...situatedEvidence, ...(pilot?.evidence_refs || [])], 'Matrix pilot evidence proves bounded audience-specific standing for this role.')
    : situatedSignal
      ? dimension('foundation_ready', situatedEvidence, 'Role-authored sources already contain situated audience/standing signals; rollout must bind only bounded authored audience IDs.')
      : dimension('needs_role_authored_work', situatedEvidence, 'Situated reputation audiences are not yet explicit for this role; do not substitute the legacy/global reputation summary.');

  const peopleLevel = component(world, 'people').level;
  const placesLevel = component(world, 'places').level;
  const peoplePlacesEvidence = uniq([
    roleWorld?.path,
    ...componentEvidence(world, 'people'),
    ...componentEvidence(world, 'places')
  ]);
  const peoplePlaces = evidenceForPilotDimension('people_places_integrity')
    ? dimension('proven', [...peoplePlacesEvidence, ...(pilot?.evidence_refs || [])], 'Matrix pilot evidence proves canonical People/Places integrity and explicit fictional scenario actors where needed.')
    : peopleLevel === 'complete' && placesLevel === 'complete'
      ? dimension('foundation_ready', peoplePlacesEvidence, 'Career People and Places coverage is complete; rollout still must verify factual canonical references and keep invented workplace drama explicitly fictional.')
      : dimension('needs_role_authored_work', peoplePlacesEvidence, `People=${peopleLevel}, Places=${placesLevel}; role-authored integration is incomplete.`);

  const provenanceEvidence = uniq([roleWorld?.path, ...roleTests, world.artifacts?.mail_plan, ...grammarPaths, jobPath]);
  let provenance;
  if (evidenceForPilotDimension('provenance')) {
    provenance = dimension('proven', [...provenanceEvidence, ...(pilot?.evidence_refs || [])], 'Matrix pilot evidence proves stable authored provenance and compiled-registry parity for this role.');
  } else if (roleTests.length && (hasPlan || grammarPaths.length || roleWorld)) {
    provenance = dimension('foundation_ready', provenanceEvidence, 'Role-specific tests and authored source paths exist; rollout must add strict scene-registry parity and source provenance for new realism scenes.');
  } else if (world.audit?.runtime_gate) {
    provenance = dimension('blocked', provenanceEvidence, 'This runtime-gated role lacks sufficient role-specific test/source provenance for a safe realism rollout.');
  } else {
    provenance = dimension('needs_role_authored_work', provenanceEvidence, 'Architecture exists, but role-specific provenance/test coverage must be authored before rollout.');
  }

  const dimensions = {
    persistent_work_object: persistent,
    institution_authority: authority,
    rhythm_waiting_handoff_rework: rhythm,
    history_go_affordance: historyGo,
    situated_reputation: situated,
    people_places_integrity: peoplePlaces,
    provenance
  };

  const blockers = [];
  for (const [id, row] of Object.entries(dimensions)) {
    if (row.status === 'blocked') blockers.push({ id, reason: row.rationale, evidence: row.evidence });
  }

  const coreForEntry = ['day_one', 'workday_loop', 'people', 'places', 'mail', 'knowledge', 'authority'];
  const incompleteCore = coreForEntry.filter((id) => component(world, id).level !== 'complete');
  const hasRuntimeFoundation = Boolean(world.audit?.runtime_gate) && incompleteCore.length === 0;
  const classification = blockers.length
    ? 'blocked'
    : hasRuntimeFoundation
      ? 'rollout_ready'
      : 'needs_role_authored_work';

  if (!ROLE_CLASSIFICATIONS.has(classification)) throw new Error(`${key}: invalid classification ${classification}`);
  const authoredWork = DIMENSION_IDS.filter((id) => dimensions[id].status === 'needs_role_authored_work');
  for (const id of incompleteCore) if (!authoredWork.includes(`career:${id}`)) authoredWork.push(`career:${id}`);

  let priorityScore = classification === 'rollout_ready' ? 1000 : classification === 'needs_role_authored_work' ? 500 : 0;
  priorityScore += world.status === 'reference_complete' ? 90 : world.status === 'playable' ? 70 : world.status === 'partial' ? 30 : 10;
  if (world.audit?.runtime_gate) priorityScore += 120;
  for (const id of coreForEntry) if (component(world, id).level === 'complete') priorityScore += 10;
  const family = structuralFamily(world);
  if (TARGET_FIRST_WAVE_FAMILIES.includes(family)) priorityScore += 25;
  if (roleWorld) priorityScore -= 350;
  if (pilot) priorityScore -= 250;

  return {
    key,
    category: world.category,
    role_scope: world.role_scope,
    badge_titles: world.badge_titles || [],
    career_status: world.status,
    runtime_gate: Boolean(world.audit?.runtime_gate),
    role_world_status: roleWorld?.status || 'role_world_not_started',
    structural_family: family,
    classification,
    priority_score: priorityScore,
    dimensions,
    cross_role: crossRoleAssessment(world, worlds),
    blockers,
    authored_work_required: uniq(authoredWork),
    source_refs: provenanceEvidence,
    already_reference_or_pilot: Boolean(roleWorld || pilot)
  };
}

const roles = worlds.map(auditWorld).sort((a, b) => a.key.localeCompare(b.key, 'nb'));
const roleKeySet = new Set(roles.map((role) => role.key));
if (roleKeySet.size !== roles.length) throw new Error('Readiness audit produced duplicate canonical role keys.');

const classificationCounts = Object.fromEntries([...ROLE_CLASSIFICATIONS].map((status) => [status, roles.filter((role) => role.classification === status).length]));
const roleLevelBlocked = roles.filter((role) => role.classification === 'blocked');
const queue = roles
  .filter((role) => !role.already_reference_or_pilot)
  .sort((a, b) => b.priority_score - a.priority_score || a.key.localeCompare(b.key, 'nb'))
  .map((role, index) => ({
    rank: index + 1,
    key: role.key,
    classification: role.classification,
    structural_family: role.structural_family,
    priority_score: role.priority_score,
    blockers: role.blockers.map((item) => item.id),
    authored_work_required: role.authored_work_required,
    cross_role_need: role.cross_role.need
  }));

const firstWave = [];
const usedKeys = new Set();
for (const family of TARGET_FIRST_WAVE_FAMILIES) {
  const candidate = queue.find((row) => row.classification === 'rollout_ready' && row.structural_family === family && !usedKeys.has(row.key));
  if (candidate) {
    firstWave.push(candidate);
    usedKeys.add(candidate.key);
  }
}
if (firstWave.length < 3) {
  for (const candidate of queue) {
    if (firstWave.length >= 4) break;
    if (candidate.classification !== 'rollout_ready' || usedKeys.has(candidate.key)) continue;
    if (firstWave.some((row) => row.structural_family === candidate.structural_family)) continue;
    firstWave.push(candidate);
    usedKeys.add(candidate.key);
  }
}

const lockedDimensionsReady = (realism.locked_cross_role_dimensions || []).every((entry) => entry.status === 'reference_proven');
const crossRoleProgramReady = realism.program_level_proofs?.cross_role_links?.status === 'runtime_proven';
const currentPolicyStillClosed = realism.semantics?.broad_rollout_allowed === false && policy.realism_matrix_gate?.broad_rollout_allowed === false;
const roleCoverageComplete = roles.length === career.summary?.career_worlds && roles.every((role) => ROLE_CLASSIFICATIONS.has(role.classification));
const roleBlockersDocumented = roleLevelBlocked.every((role) => role.blockers.length > 0);
const gatePass = lockedDimensionsReady && crossRoleProgramReady && currentPolicyStillClosed && roleCoverageComplete && roleBlockersDocumented;

const output = {
  schema: 'civication_role_world_rollout_readiness_v1',
  version: 1,
  effective_date: realism.effective_date || policy.effective_date || '2026-08-25',
  generated_by: 'scripts/audit-civication-role-world-rollout-readiness.mjs',
  source_contracts: {
    career_gameplay_matrix: MATRIX_PATH,
    role_world_realism_matrix: REALISM_PATH,
    role_world_policy: POLICY_PATH,
    role_world_index: ROLE_WORLD_INDEX_PATH
  },
  semantics: {
    audit_only_no_new_runtime: true,
    existing_scene_pipeline_remains_canonical: true,
    role_world_completion_semantics_unchanged: true,
    authority_contract_must_not_be_weakened: true,
    one_role_per_rollout_pr: true,
    cross_role_links_only_when_work_is_genuinely_shared: true,
    employment_conditions_remain_role_owned_editorial_content: true,
    professional_culture_remains_role_owned_editorial_content: true,
    blocked_roles_are_quarantined_from_rollout: true,
    this_pr_does_not_open_broad_rollout: true
  },
  classification_contract: {
    rollout_ready: 'Core career runtime gate, People, Places, knowledge, workday loop, mail and authority are complete enough to enter a dedicated one-role realism rollout PR; any remaining realism dimensions are authored inside that PR.',
    needs_role_authored_work: 'The role is canonical but its current career foundation is incomplete for immediate realism rollout; the listed authored work must be completed before or as a prerequisite to entering the rollout queue.',
    blocked: 'A safety-critical boundary such as authority or provenance is not sufficiently proved. The role is quarantined until the blocker is repaired; broad rollout policy must not waive it.'
  },
  summary: {
    canonical_career_roles: roles.length,
    classifications: classificationCounts,
    role_world_complete_or_pilot: roles.filter((role) => role.already_reference_or_pilot).length,
    rollout_queue_roles: queue.length,
    first_wave_candidate_count: firstWave.length,
    role_level_blocked_count: roleLevelBlocked.length,
    structural_families_in_queue: uniq(queue.map((row) => row.structural_family)).length
  },
  gate: {
    locked_matrix_dimensions_reference_proven: lockedDimensionsReady,
    cross_role_program_proof_runtime_proven: crossRoleProgramReady,
    role_coverage_complete: roleCoverageComplete,
    role_blockers_documented: roleBlockersDocumented,
    current_policy_still_closed: currentPolicyStillClosed,
    gate_pass: gatePass,
    broad_rollout_allowed_now: false,
    policy_recommendation: gatePass ? 'open_with_role_level_gates_in_separate_policy_pr' : 'keep_broad_rollout_blocked',
    next_required_pr: gatePass ? 'Civication Role World broad-rollout policy' : 'Repair readiness gate blockers before policy change',
    rule: 'A green readiness gate proves the program can safely begin controlled rollout. It does not make every role rollout_ready and it does not itself flip broad_rollout_allowed.'
  },
  first_wave_candidates: firstWave,
  rollout_queue: queue,
  blocked_roles: roleLevelBlocked.map((role) => ({ key: role.key, blockers: role.blockers })),
  roles
};

function renderReport(data) {
  const lines = [];
  lines.push('# Civication Role World broad-rollout readiness gate', '');
  lines.push(`**Status:** ${data.gate.gate_pass ? 'GREEN — policy opening may be proposed in a separate PR' : 'BLOCKED — broad rollout policy must remain closed'}`);
  lines.push(`**Canonical career roles audited:** ${data.summary.canonical_career_roles}`);
  lines.push(`**Classification:** ${data.summary.classifications.rollout_ready} rollout_ready / ${data.summary.classifications.needs_role_authored_work} needs_role_authored_work / ${data.summary.classifications.blocked} blocked`);
  lines.push(`**Current broad_rollout_allowed:** false (unchanged in this PR)`, '');
  lines.push('## Gate decision', '');
  lines.push(`- Locked Realism Matrix dimensions reference-proven: **${data.gate.locked_matrix_dimensions_reference_proven}**`);
  lines.push(`- Cross-role shared-world program proof runtime-proven: **${data.gate.cross_role_program_proof_runtime_proven}**`);
  lines.push(`- Every canonical career role classified: **${data.gate.role_coverage_complete}**`);
  lines.push(`- Every blocked role has explicit blockers: **${data.gate.role_blockers_documented}**`);
  lines.push(`- Existing policy remains closed: **${data.gate.current_policy_still_closed}**`);
  lines.push(`- Readiness gate: **${data.gate.gate_pass ? 'PASS' : 'FAIL'}**`);
  lines.push(`- Recommendation: **${data.gate.policy_recommendation}**`, '');
  lines.push('A PASS here means the program-level pilot proof is sufficient to begin controlled role-by-role rollout under a separate policy change. It does **not** certify every role as realism-complete, does not create runtime, and does not waive role-level blockers.', '');
  lines.push('## Classification contract', '');
  lines.push(`- **rollout_ready:** ${data.classification_contract.rollout_ready}`);
  lines.push(`- **needs_role_authored_work:** ${data.classification_contract.needs_role_authored_work}`);
  lines.push(`- **blocked:** ${data.classification_contract.blocked}`, '');
  lines.push('## First structurally varied wave candidates', '');
  if (!data.first_wave_candidates.length) lines.push('_No safe first-wave set is available yet._');
  else for (const row of data.first_wave_candidates) lines.push(`- **${row.key}** — ${row.structural_family}; ${row.classification}; queue #${row.rank}`);
  lines.push('', 'The first wave is a recommendation, not a batch PR: every role still gets its own PR. Cross-role linkage is optional and only used when the work object is genuinely shared.', '');
  lines.push('## Priority queue — top 25', '');
  lines.push('| Rank | Role | Class | Structural family | Cross-role | Main authored debt |');
  lines.push('| ---: | --- | --- | --- | --- | --- |');
  for (const row of data.rollout_queue.slice(0, 25)) {
    lines.push(`| ${row.rank} | \`${row.key}\` | ${row.classification} | ${row.structural_family} | ${row.cross_role_need} | ${row.authored_work_required.slice(0, 4).join(', ') || '—'} |`);
  }
  lines.push('', '## Blocked roles', '');
  if (!data.blocked_roles.length) lines.push('_No role-level hard blockers. Roles with authored debt remain gated individually by their classification._');
  else for (const role of data.blocked_roles) {
    lines.push(`### ${role.key}`, '');
    for (const blocker of role.blockers) lines.push(`- **${blocker.id}:** ${blocker.reason}`);
    lines.push('');
  }
  lines.push('## Locked rollout boundaries', '');
  lines.push('- Existing Civication Scene Pipeline remains canonical; no parallel engine or scene format is introduced.');
  lines.push('- Authority remains a hard contract. Knowledge, reputation, seniority or cross-role sharing cannot manufacture decision rights.');
  lines.push('- New realism work is one canonical role per PR, with full Civication suite, compiled-registry parity, Realism Matrix gate and provenance.');
  lines.push('- `employment_conditions` and `professional_culture` remain role-owned editorial content, not new global runtime fields.');
  lines.push('- Cross-role shared objects are used only where the work is materially shared; the newsroom proof remains the authority/integrity reference pattern.');
  lines.push('', '## Machine-readable source', '');
  lines.push('See `data/Civication/roleWorldRolloutReadiness.json`. Regenerate with `node scripts/audit-civication-role-world-rollout-readiness.mjs --write`; verify drift with `--check`.', '');
  return `${lines.join('\n')}\n`;
}

const jsonText = `${JSON.stringify(output, null, 2)}\n`;
const reportText = renderReport(output);
const writeMode = process.argv.includes('--write');
const checkMode = process.argv.includes('--check') || !writeMode;

if (writeMode) {
  fs.writeFileSync(abs(OUTPUT_PATH), jsonText);
  fs.writeFileSync(abs(REPORT_PATH), reportText);
  console.log(`WROTE: ${OUTPUT_PATH}`);
  console.log(`WROTE: ${REPORT_PATH}`);
}

if (checkMode) {
  if (!exists(OUTPUT_PATH) || !exists(REPORT_PATH)) throw new Error('Readiness outputs are missing; run with --write.');
  const committedJson = fs.readFileSync(abs(OUTPUT_PATH), 'utf8');
  const committedReport = fs.readFileSync(abs(REPORT_PATH), 'utf8');
  if (committedJson !== jsonText) throw new Error(`${OUTPUT_PATH} is stale; run readiness audit with --write.`);
  if (committedReport !== reportText) throw new Error(`${REPORT_PATH} is stale; run readiness audit with --write.`);
  if (!output.gate.gate_pass) throw new Error('Role World broad-rollout readiness gate is not green.');
  console.log(`PASS: audited ${roles.length} canonical career roles; ${classificationCounts.rollout_ready} rollout_ready, ${classificationCounts.needs_role_authored_work} needs_role_authored_work, ${classificationCounts.blocked} blocked; policy remains closed pending a separate PR.`);
}
