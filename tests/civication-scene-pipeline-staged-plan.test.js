const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const root = path.resolve(__dirname, '..');
  const { auditRepository } = await import(pathToFileURL(path.join(root, 'scripts/audit-civication-scene-pipeline.mjs')).href);
  const audit = auditRepository(root);
  const planPath = 'data/Civication/mailPlans/naeringsliv/kapital_og_eierskap_plan.json';
  const capital = audit.plan_reachability.plans.find((row) => row.path === planPath);

  assert(capital, 'staged kapital/eierskap plan must remain visible in the audit');
  assert.equal(capital.activation_status, 'staged_future_split');
  assert.equal(capital.blocking_reachability, false);
  assert.equal(capital.total_steps, 8);
  assert.equal(capital.direct_steps, 0, 'staged plan is intentionally not materialized yet');
  assert.ok(capital.missing_family_steps > 0, 'staged plan debt must stay observable');
  assert.equal(
    audit.blocking_issues.some((issue) => issue.plan === planPath),
    false,
    'inactive future-split plan must not make production scene-pipeline reachability fail'
  );

  console.log('Civication staged future-split scene-pipeline audit gate: OK');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
