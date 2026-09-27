#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const p = path.resolve(__dirname, 'audit-civication-scene-pipeline.mjs');
let s = fs.readFileSync(p, 'utf8');

function replaceOnce(from, to, label) {
  if (!s.includes(from)) throw new Error(`missing patch anchor: ${label}`);
  s = s.replace(from, to);
}

replaceOnce(
  '  contract: "data/Civication/sceneContractV1.schema.json",\n  plans: "data/Civication/mailPlans",',
  '  contract: "data/Civication/sceneContractV1.schema.json",\n  badgeRoleMappings: "data/Civication/badgeRoleMappings.json",\n  plans: "data/Civication/mailPlans",',
  'PATHS.badgeRoleMappings'
);

replaceOnce(
`function sorted(values) {
  return uniq(values).sort((a, b) => a.localeCompare(b, "nb"));
}
`,
`function sorted(values) {
  return uniq(values).sort((a, b) => a.localeCompare(b, "nb"));
}

function collectStagedFutureSplitKeys(mappings) {
  const staged = new Set();
  for (const [category, career] of Object.entries(mappings?.careers || {})) {
    const activeScopes = new Set([
      ...Object.keys(career?.roles || {}),
      ...Object.values(career?.title_to_role_scope || {}).map(norm).filter(Boolean)
    ]);
    for (const candidate of asArray(career?.future_split_candidates)) {
      const roleScope = norm(candidate?.role_scope);
      if (roleScope && !activeScopes.has(roleScope)) staged.add(\`${'${category}/${roleScope}'}\`);
    }
  }
  return staged;
}
`,
  'collectStagedFutureSplitKeys'
);

replaceOnce(
  'function auditPlanReachability(root, plans, runtimeMailTypes, allCatalogs) {',
  'function auditPlanReachability(root, plans, runtimeMailTypes, allCatalogs, stagedFutureSplitKeys = new Set()) {',
  'auditPlanReachability signature'
);

replaceOnce(
  '    const roleScope = norm(plan?.role_scope || path.basename(planRow.path, ".json").replace(/_plan$/, ""));\n    const familyRoot = `${PATHS.families}/${category}`;',
  '    const roleScope = norm(plan?.role_scope || path.basename(planRow.path, ".json").replace(/_plan$/, ""));\n    const planKey = `${category}/${roleScope}`;\n    const activationStatus = stagedFutureSplitKeys.has(planKey) ? "staged_future_split" : "active_or_unclassified";\n    const blockingReachability = activationStatus !== "staged_future_split";\n    const familyRoot = `${PATHS.families}/${category}`;',
  'plan activation status'
);

replaceOnce(
  '      role_scope: roleScope,\n      runtime_paths: runtimePaths,',
  '      role_scope: roleScope,\n      activation_status: activationStatus,\n      blocking_reachability: blockingReachability,\n      runtime_paths: runtimePaths,',
  'plan report activation fields'
);

replaceOnce(
`  const policyResult = readJsonResult(root, PATHS.policy);
  const contractResult = readJsonResult(root, PATHS.contract);
  if (!policyResult.ok) parseErrors.push({ path: PATHS.policy, error: policyResult.error });
  if (!contractResult.ok) parseErrors.push({ path: PATHS.contract, error: contractResult.error });
  const policy = policyResult.value || {};
  const contract = contractResult.value || {};
`,
`  const policyResult = readJsonResult(root, PATHS.policy);
  const contractResult = readJsonResult(root, PATHS.contract);
  const badgeRoleMappingsResult = fileExists(root, PATHS.badgeRoleMappings)
    ? readJsonResult(root, PATHS.badgeRoleMappings)
    : { ok: true, value: {} };
  if (!policyResult.ok) parseErrors.push({ path: PATHS.policy, error: policyResult.error });
  if (!contractResult.ok) parseErrors.push({ path: PATHS.contract, error: contractResult.error });
  if (!badgeRoleMappingsResult.ok) parseErrors.push({ path: PATHS.badgeRoleMappings, error: badgeRoleMappingsResult.error });
  const policy = policyResult.value || {};
  const contract = contractResult.value || {};
  const stagedFutureSplitKeys = collectStagedFutureSplitKeys(badgeRoleMappingsResult.value || {});
`,
  'badge role mapping read'
);

replaceOnce(
  '  const planReachability = auditPlanReachability(root, planRows, runtimeMailTypes, allCatalogs);',
  '  const planReachability = auditPlanReachability(root, planRows, runtimeMailTypes, allCatalogs, stagedFutureSplitKeys);',
  'reachability activation input'
);

replaceOnce(
`  const knownContentNotLoaded = planReachability.flatMap((plan) => plan.steps
    .filter((step) => step.content_exists && !step.content_loaded)
`,
`  const knownContentNotLoaded = planReachability.filter((plan) => plan.blocking_reachability).flatMap((plan) => plan.steps
    .filter((step) => step.content_exists && !step.content_loaded)
`,
  'knownContentNotLoaded filter'
);
replaceOnce(
`  const semanticSubstitutions = planReachability.flatMap((plan) => plan.steps
    .filter((step) => step.semantic_substitution)
`,
`  const semanticSubstitutions = planReachability.filter((plan) => plan.blocking_reachability).flatMap((plan) => plan.steps
    .filter((step) => step.semantic_substitution)
`,
  'semanticSubstitutions filter'
);
replaceOnce(
`  const missingPlanFamilies = planReachability.flatMap((plan) => plan.steps
    .filter((step) => step.missing_allowed_families.length)
`,
`  const missingPlanFamilies = planReachability.filter((plan) => plan.blocking_reachability).flatMap((plan) => plan.steps
    .filter((step) => step.missing_allowed_families.length)
`,
  'missingPlanFamilies filter'
);

replaceOnce(
  '      missing_plan_families: missingPlanFamilies\n    },',
  '      missing_plan_families: missingPlanFamilies,\n      staged_future_split_plans: planReachability.filter((plan) => plan.activation_status === "staged_future_split").map((plan) => plan.path)\n    },',
  'staged plan summary'
);

fs.writeFileSync(p, s);
console.log('patched scene-pipeline audit to keep inactive future splits observable but non-blocking');
