#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (rel) => path.join(ROOT, rel);
const read = (rel) => fs.readFileSync(abs(rel), 'utf8');
const write = (rel, text) => fs.writeFileSync(abs(rel), text);
const readJson = (rel) => JSON.parse(read(rel));
const writeJson = (rel, value) => write(rel, `${JSON.stringify(value, null, 2)}\n`);

function replaceOne(rel, before, after) {
  const source = read(rel);
  const pieces = source.split(before);
  if (pieces.length !== 2) {
    throw new Error(`${rel}: expected exactly one policy-transition match, found ${pieces.length - 1}`);
  }
  write(rel, `${pieces[0]}${after}${pieces[1]}`);
}

const matrixPath = 'data/Civication/roleWorldRealismMatrix.json';
const policyPath = 'data/Civication/roleWorldPolicy.json';
const auditPath = 'scripts/audit-civication-role-world-rollout-readiness.mjs';
const readinessTestPath = 'tests/civication-role-world-rollout-readiness.test.js';
const matrixTestPath = 'tests/civication-role-world-realism-matrix.test.js';
const crossRoleTestPath = 'tests/civication-cross-role-shared-world.test.js';
const matrixReportPath = 'reports/civication-role-world-realism-matrix-v1.md';
const policyTestPath = 'tests/civication-role-world-broad-rollout-policy.test.js';

const matrix = readJson(matrixPath);
matrix.status = 'gate_green_controlled_rollout_open';
matrix.semantics.broad_rollout_allowed = true;
matrix.semantics.rollout_mode = 'controlled_role_by_role';
matrix.semantics.readiness_gate = 'data/Civication/roleWorldRolloutReadiness.json';
matrix.semantics.rollout_rule = 'Bred rollout er åpnet som kontrollert rolle-for-rolle rollout. Hver rolle må fortsatt passere sin egen readiness-, authority- og provenance-gate, full Civication-suite og compiled-registry-paritet; blokkerte roller forblir karantenesatt.';
writeJson(matrixPath, matrix);

const policy = readJson(policyPath);
policy.realism_matrix_gate.status = 'gate_green_controlled_rollout_open';
policy.realism_matrix_gate.broad_rollout_allowed = true;
policy.realism_matrix_gate.readiness_path = 'data/Civication/roleWorldRolloutReadiness.json';
policy.realism_matrix_gate.rule = 'Matrixen og readiness-auditen åpner bare kontrollert rolle-for-rolle rollout. De kan ikke omskrive reference_complete, role_world_complete, Scene Pipeline-eierskap, authority-grenser eller rolle-nivå blockers.';
policy.broad_rollout_governance = {
  mode: 'controlled_role_by_role',
  one_role_per_pr: true,
  blocked_roles_may_roll_out: false,
  authority_must_not_be_inferred: true,
  cross_role_links_only_when_genuinely_shared: true,
  full_civication_suite_required: true,
  compiled_registry_parity_required: true,
  realism_matrix_gate_required: true,
  provenance_required: true,
  existing_scene_pipeline_remains_canonical: true,
  parallel_scene_engine_allowed: false,
  employment_conditions_global_runtime_field: false,
  professional_culture_global_runtime_field: false,
  rollout_queue_path: 'data/Civication/roleWorldRolloutReadiness.json',
  rule: 'Bred rollout betyr ikke masse-materialisering: hver canonical rolle leveres i egen PR, må være rollout_ready eller få eksplisitt authored debt lukket, og kan ikke omgå blockers, authority, provenance eller registry-paritet.'
};
writeJson(policyPath, policy);

replaceOne(
  auditPath,
  `const lockedDimensionsReady = (realism.locked_cross_role_dimensions || []).every((entry) => entry.status === 'reference_proven');\nconst crossRoleProgramReady = realism.program_level_proofs?.cross_role_links?.status === 'runtime_proven';\nconst currentPolicyStillClosed = realism.semantics?.broad_rollout_allowed === false && policy.realism_matrix_gate?.broad_rollout_allowed === false;\nconst roleCoverageComplete = roles.length === career.summary?.career_worlds && roles.every((role) => ROLE_CLASSIFICATIONS.has(role.classification));\nconst roleBlockersDocumented = roleLevelBlocked.every((role) => role.blockers.length > 0);\nconst gatePass = lockedDimensionsReady && crossRoleProgramReady && currentPolicyStillClosed && roleCoverageComplete && roleBlockersDocumented;`,
  `const lockedDimensionsReady = (realism.locked_cross_role_dimensions || []).every((entry) => entry.status === 'reference_proven');\nconst crossRoleProgramReady = realism.program_level_proofs?.cross_role_links?.status === 'runtime_proven';\nconst matrixBroadRolloutAllowed = realism.semantics?.broad_rollout_allowed === true;\nconst policyBroadRolloutAllowed = policy.realism_matrix_gate?.broad_rollout_allowed === true;\nconst policyStateConsistent = matrixBroadRolloutAllowed === policyBroadRolloutAllowed;\nconst currentPolicyStillClosed = policyStateConsistent && !matrixBroadRolloutAllowed;\nconst roleCoverageComplete = roles.length === career.summary?.career_worlds && roles.every((role) => ROLE_CLASSIFICATIONS.has(role.classification));\nconst roleBlockersDocumented = roleLevelBlocked.every((role) => role.blockers.length > 0);\nconst gatePass = lockedDimensionsReady && crossRoleProgramReady && policyStateConsistent && roleCoverageComplete && roleBlockersDocumented;\nconst broadRolloutAllowedNow = gatePass && matrixBroadRolloutAllowed && policyBroadRolloutAllowed;\nconst policyRecommendation = !gatePass\n  ? 'keep_broad_rollout_blocked'\n  : broadRolloutAllowedNow\n    ? 'controlled_rollout_open_with_role_level_gates'\n    : 'open_with_role_level_gates_in_separate_policy_pr';\nconst nextRequiredPr = !gatePass\n  ? 'Repair readiness gate blockers before policy change'\n  : broadRolloutAllowedNow\n    ? (firstWave[0]?.key ? \`Role World rollout: \${firstWave[0].key}\` : 'Select next rollout_ready role')\n    : 'Civication Role World broad-rollout policy';`
);

replaceOne(
  auditPath,
  `    this_pr_does_not_open_broad_rollout: true`,
  `    readiness_audit_does_not_mutate_broad_rollout_policy: true`
);

replaceOne(
  auditPath,
  `    current_policy_still_closed: currentPolicyStillClosed,\n    gate_pass: gatePass,\n    broad_rollout_allowed_now: false,\n    policy_recommendation: gatePass ? 'open_with_role_level_gates_in_separate_policy_pr' : 'keep_broad_rollout_blocked',\n    next_required_pr: gatePass ? 'Civication Role World broad-rollout policy' : 'Repair readiness gate blockers before policy change',`,
  `    current_policy_still_closed: currentPolicyStillClosed,\n    policy_state_consistent: policyStateConsistent,\n    matrix_broad_rollout_allowed: matrixBroadRolloutAllowed,\n    policy_broad_rollout_allowed: policyBroadRolloutAllowed,\n    gate_pass: gatePass,\n    broad_rollout_allowed_now: broadRolloutAllowedNow,\n    policy_recommendation: policyRecommendation,\n    next_required_pr: nextRequiredPr,`
);

replaceOne(
  auditPath,
  `  lines.push(\`**Status:** \${data.gate.gate_pass ? 'GREEN — policy opening may be proposed in a separate PR' : 'BLOCKED — broad rollout policy must remain closed'}\`);`,
  `  lines.push(\`**Status:** \${!data.gate.gate_pass ? 'BLOCKED — broad rollout policy must remain closed' : data.gate.broad_rollout_allowed_now ? 'GREEN — controlled role-by-role rollout open' : 'GREEN — policy opening may be proposed in a separate PR'}\`);`
);
replaceOne(
  auditPath,
  `  lines.push(\`**Current broad_rollout_allowed:** false (unchanged in this PR)\`, '');`,
  `  lines.push(\`**Current broad_rollout_allowed:** \${data.gate.broad_rollout_allowed_now} (\${data.gate.broad_rollout_allowed_now ? 'controlled rollout open' : 'policy remains closed'})\`, '');`
);
replaceOne(
  auditPath,
  `  lines.push(\`- Existing policy remains closed: **\${data.gate.current_policy_still_closed}**\`);`,
  `  lines.push(\`- Matrix/policy rollout state consistent: **\${data.gate.policy_state_consistent}**\`);\n  lines.push(\`- Existing policy remains closed: **\${data.gate.current_policy_still_closed}**\`);\n  lines.push(\`- Controlled broad rollout allowed now: **\${data.gate.broad_rollout_allowed_now}**\`);`
);
replaceOne(
  auditPath,
  `  lines.push('A PASS here means the program-level pilot proof is sufficient to begin controlled role-by-role rollout under a separate policy change. It does **not** certify every role as realism-complete, does not create runtime, and does not waive role-level blockers.', '');`,
  `  lines.push(data.gate.broad_rollout_allowed_now\n    ? 'A PASS with policy open means controlled role-by-role rollout may proceed. It does **not** certify every role as realism-complete, does not create runtime, and does not waive role-level blockers.'\n    : 'A PASS while policy is closed means the program-level pilot proof is sufficient to propose the separate policy change. It does **not** certify every role as realism-complete, does not create runtime, and does not waive role-level blockers.', '');`
);
replaceOne(
  auditPath,
  `  console.log(\`PASS: audited \${roles.length} canonical career roles; \${classificationCounts.rollout_ready} rollout_ready, \${classificationCounts.needs_role_authored_work} needs_role_authored_work, \${classificationCounts.blocked} blocked; policy remains closed pending a separate PR.\`);`,
  `  console.log(\`PASS: audited \${roles.length} canonical career roles; \${classificationCounts.rollout_ready} rollout_ready, \${classificationCounts.needs_role_authored_work} needs_role_authored_work, \${classificationCounts.blocked} blocked; broad rollout \${broadRolloutAllowedNow ? 'open under controlled role-level gates' : 'remains policy-gated'}.\`);`
);

replaceOne(
  readinessTestPath,
  `assert.equal(readiness.semantics.this_pr_does_not_open_broad_rollout, true);`,
  `assert.equal(readiness.semantics.readiness_audit_does_not_mutate_broad_rollout_policy, true);`
);
replaceOne(
  readinessTestPath,
  `assert.equal(realism.semantics.broad_rollout_allowed, false, 'Readiness PR must not open broad rollout in the Realism Matrix');\nassert.equal(policy.realism_matrix_gate.broad_rollout_allowed, false, 'Readiness PR must not open broad rollout in policy');\nassert.equal(readiness.gate.current_policy_still_closed, true);\nassert.equal(readiness.gate.locked_matrix_dimensions_reference_proven, true);\nassert.equal(readiness.gate.cross_role_program_proof_runtime_proven, true);\nassert.equal(readiness.gate.role_coverage_complete, true);\nassert.equal(readiness.gate.role_blockers_documented, true);\nassert.equal(readiness.gate.gate_pass, true, 'Program-level readiness gate must be green before the separate policy PR');\nassert.equal(readiness.gate.broad_rollout_allowed_now, false);\nassert.equal(readiness.gate.policy_recommendation, 'open_with_role_level_gates_in_separate_policy_pr');\nassert.equal(readiness.gate.next_required_pr, 'Civication Role World broad-rollout policy');`,
  `assert.equal(realism.semantics.broad_rollout_allowed, true, 'Realism Matrix must explicitly open only controlled broad rollout after the readiness gate');\nassert.equal(policy.realism_matrix_gate.broad_rollout_allowed, true, 'Policy must agree with the Realism Matrix after the dedicated policy PR');\nassert.equal(readiness.gate.policy_state_consistent, true);\nassert.equal(readiness.gate.current_policy_still_closed, false);\nassert.equal(readiness.gate.locked_matrix_dimensions_reference_proven, true);\nassert.equal(readiness.gate.cross_role_program_proof_runtime_proven, true);\nassert.equal(readiness.gate.role_coverage_complete, true);\nassert.equal(readiness.gate.role_blockers_documented, true);\nassert.equal(readiness.gate.gate_pass, true, 'Program-level readiness gate must remain green after policy opening');\nassert.equal(readiness.gate.broad_rollout_allowed_now, true);\nassert.equal(readiness.gate.policy_recommendation, 'controlled_rollout_open_with_role_level_gates');\nassert.match(readiness.gate.next_required_pr, /^Role World rollout: /);`
);

replaceOne(matrixTestPath, `assert.equal(matrix.status, 'gate_active_broad_rollout_blocked');`, `assert.equal(matrix.status, 'gate_green_controlled_rollout_open');`);
replaceOne(matrixTestPath, `assert.equal(matrix.semantics.broad_rollout_allowed, false);`, `assert.equal(matrix.semantics.broad_rollout_allowed, true);\nassert.equal(matrix.semantics.rollout_mode, 'controlled_role_by_role');\nassert.equal(matrix.semantics.readiness_gate, 'data/Civication/roleWorldRolloutReadiness.json');`);
replaceOne(matrixTestPath, `assert.equal(policy.realism_matrix_gate.status, 'gate_active');`, `assert.equal(policy.realism_matrix_gate.status, 'gate_green_controlled_rollout_open');`);
replaceOne(matrixTestPath, `assert.equal(policy.realism_matrix_gate.broad_rollout_allowed, false);`, `assert.equal(policy.realism_matrix_gate.broad_rollout_allowed, true);`);
replaceOne(matrixTestPath, `console.log('PASS: Role World Realism Matrix v1 keeps seven cross-role fields locked, proves shared-world role boundaries, and leaves broad rollout policy-gated.');`, `console.log('PASS: Role World Realism Matrix v1 keeps seven cross-role fields locked, proves shared-world role boundaries, and opens only controlled role-by-role rollout.');`);

replaceOne(
  crossRoleTestPath,
  `assert.equal(realism.semantics.broad_rollout_allowed, false, 'cross-role proof does not silently open broad rollout');`,
  `assert.equal(realism.semantics.broad_rollout_allowed, true, 'dedicated policy opening may follow the cross-role proof, but the proof itself still grants no authority');`
);

replaceOne(matrixReportPath, `Status: **separat Matrix/gate aktiv; bred rollout fortsatt blokkert**`, `Status: **Matrix/gate grønn; kontrollert rolle-for-rolle rollout åpnet**`);
replaceOne(matrixReportPath, `- bred rollout er eksplisitt \`false\` til en senere policyendring kan vise at gjenstående programkrav er oppfylt.`, `- bred rollout er nå eksplisitt \`true\`, men bare som kontrollert rolle-for-rolle rollout under readiness-, authority-, provenance-, full-suite- og registry-paritetsgater.`);
replaceOne(
  matrixReportPath,
  `### Cross-role links — \`not_started\`\n\nProgrammets Definition of Done krever fortsatt minst ett faktisk shared object som kan oppleves fra to roller med samme stabile objekt-ID, ulikt handlingsrom og uten privilege leakage. Matrixen markerer dette som synlig gjeld i stedet for å late som pilotene allerede har bevist det.`,
  `### Cross-role links — \`runtime_proven\`\n\nNewsroom-piloten beviser nå ett faktisk shared object med stabil objekt-ID på tvers av to canonicale roller, ulike lenses og egne authority-grenser. Den andre rollen kan påvirke arbeidsflyt innen eget mandat, men kan ikke arve første rolles myndighet, overskrive evidens eller overta objektets canonical role_scope.`
);
replaceOne(matrixReportPath, `- at \`employment_conditions\`, \`professional_culture\` eller \`cross_role_links\` blir fremstilt som ferdigbevist;`, `- at \`employment_conditions\` eller \`professional_culture\` blir fremstilt som globale runtimefelt, eller at cross-role proof brukes til privilege leakage;`);
replaceOne(
  matrixReportPath,
  `Det betyr **ikke** at Role World Realism-programmet er ferdig eller at masse-rollout skal starte automatisk. Den tydeligste gjenværende tekniske realismeprøven er cross-role shared world: ett faktisk arbeidsobjekt må overleve perspektivskifte mellom to roller uten å lekke myndighet, sensitive data eller rolleprivilegier. Først etter et slikt bevis og en eksplisitt rollout-policy kan \`broad_rollout_allowed\` vurderes endret.`,
  `Det betyr **ikke** masse-rollout. Cross-role shared world er nå runtime-bevist, readiness-gaten er grønn og den eksplisitte policyen åpner derfor \`broad_rollout_allowed\` som kontrollert rolle-for-rolle rollout. Hver rolle må fortsatt leveres i egen PR og passere sine egne blockers, authority-, provenance-, full-suite- og registry-paritetskrav.`
);
replaceOne(matrixReportPath, `**Total: 30/30 innen Matrix/gate-scope.** Bred rollout og hele realism-programmet er fortsatt uferdig til gjenstående gates faktisk er bevist.`, `**Total: 30/30 innen Matrix/gate-scope.** Kontrollert bred rollout er åpnet; individuelle roller forblir gated og blir ikke realism-complete av policyendringen alene.`);

const policyTest = `const assert = require('node:assert/strict');\nconst fs = require('node:fs');\nconst path = require('node:path');\n\nconst ROOT = path.resolve(__dirname, '..');\nconst read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));\nconst matrix = read('data/Civication/roleWorldRealismMatrix.json');\nconst policy = read('data/Civication/roleWorldPolicy.json');\nconst readiness = read('data/Civication/roleWorldRolloutReadiness.json');\n\nassert.equal(matrix.status, 'gate_green_controlled_rollout_open');\nassert.equal(matrix.semantics.broad_rollout_allowed, true);\nassert.equal(matrix.semantics.rollout_mode, 'controlled_role_by_role');\nassert.equal(matrix.semantics.no_new_runtime, true);\nassert.equal(matrix.semantics.new_parallel_scene_format_allowed, false);\nassert.equal(matrix.semantics.completion_statuses_unchanged, true);\nassert.equal(matrix.program_level_proofs.cross_role_links.status, 'runtime_proven');\n\nassert.equal(policy.realism_matrix_gate.status, 'gate_green_controlled_rollout_open');\nassert.equal(policy.realism_matrix_gate.broad_rollout_allowed, true);\nassert.equal(policy.realism_matrix_gate.readiness_path, 'data/Civication/roleWorldRolloutReadiness.json');\nassert.equal(policy.realism_matrix_gate.completion_statuses_unchanged, true);\nassert.equal(policy.realism_matrix_gate.new_runtime_allowed, false);\n\nconst runtime = policy.runtime_boundary;\nassert.equal(runtime.editorial_layer_only, true);\nassert.equal(runtime.new_runtime_allowed, false);\nassert.equal(runtime.new_parallel_scene_format_allowed, false);\nassert.equal(runtime.role_world_declared_runtime_capabilities_allowed, false);\nassert.equal(runtime.canonical_scene_schema, 'data/Civication/sceneContractV1.schema.json');\nassert.equal(runtime.compiled_registry, 'data/Civication/compiledSceneRegistryV1.json');\nassert.ok(new Set(runtime.governed_capability_requirements || []).has('existing_scene_pipeline_remains_canonical'));\n\nconst rollout = policy.broad_rollout_governance;\nassert.equal(rollout.mode, 'controlled_role_by_role');\nassert.equal(rollout.one_role_per_pr, true);\nassert.equal(rollout.blocked_roles_may_roll_out, false);\nassert.equal(rollout.authority_must_not_be_inferred, true);\nassert.equal(rollout.cross_role_links_only_when_genuinely_shared, true);\nassert.equal(rollout.full_civication_suite_required, true);\nassert.equal(rollout.compiled_registry_parity_required, true);\nassert.equal(rollout.realism_matrix_gate_required, true);\nassert.equal(rollout.provenance_required, true);\nassert.equal(rollout.existing_scene_pipeline_remains_canonical, true);\nassert.equal(rollout.parallel_scene_engine_allowed, false);\nassert.equal(rollout.employment_conditions_global_runtime_field, false);\nassert.equal(rollout.professional_culture_global_runtime_field, false);\n\nassert.equal(readiness.gate.gate_pass, true);\nassert.equal(readiness.gate.policy_state_consistent, true);\nassert.equal(readiness.gate.broad_rollout_allowed_now, true);\nassert.equal(readiness.gate.policy_recommendation, 'controlled_rollout_open_with_role_level_gates');\nassert.ok(readiness.blocked_roles.length > 0, 'Policy opening must not erase role-level blockers');\nconst blocked = new Set(readiness.blocked_roles.map((row) => row.key));\nassert.ok(readiness.first_wave_candidates.every((row) => !blocked.has(row.key)), 'Blocked roles cannot enter the first controlled wave');\nassert.ok(readiness.first_wave_candidates.every((row) => row.classification === 'rollout_ready'));\nassert.ok(readiness.first_wave_candidates.length >= 3 && readiness.first_wave_candidates.length <= 4);\nassert.equal(new Set(readiness.first_wave_candidates.map((row) => row.structural_family)).size, readiness.first_wave_candidates.length);\n\nconst roleOwned = new Set(matrix.role_owned_not_global || []);\nassert.ok(roleOwned.has('role_specific_employment_conditions'));\nassert.ok(roleOwned.has('role_specific_professional_culture'));\nconst deferred = new Map((matrix.deferred_dimensions || []).map((row) => [row.id, row.status]));\nassert.equal(deferred.get('employment_conditions'), 'editorial_only');\nassert.equal(deferred.get('professional_culture'), 'editorial_only');\n\nconsole.log('PASS: broad Role World rollout is open only as controlled one-role-per-PR delivery with authority, provenance, registry and blocker gates intact.');\n`;
if (fs.existsSync(abs(policyTestPath))) throw new Error(`${policyTestPath} already exists`);
write(policyTestPath, policyTest);

const broadReferences = [];
for (const name of fs.readdirSync(abs('tests')).filter((name) => /^civication-.*\\.test\\.js$/.test(name))) {
  const rel = `tests/${name}`;
  if (read(rel).includes('broad_rollout_allowed')) broadReferences.push(rel);
}
const expectedBroadRefs = new Set([readinessTestPath, matrixTestPath, crossRoleTestPath, policyTestPath]);
for (const rel of broadReferences) {
  if (!expectedBroadRefs.has(rel)) throw new Error(`Unexpected broad_rollout_allowed test contract requires review: ${rel}`);
}
for (const rel of expectedBroadRefs) {
  if (!broadReferences.includes(rel)) throw new Error(`Expected broad rollout test contract missing: ${rel}`);
}

console.log('MATERIALIZED: controlled Role World broad-rollout policy transition');
