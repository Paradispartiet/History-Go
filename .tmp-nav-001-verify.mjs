import { auditRepository, DEFAULT_REPO_ROOT } from './scripts/audit-civication-scene-pipeline.mjs';

const audit = auditRepository(DEFAULT_REPO_ROOT);
const duplicates = audit.inventory.duplicate_scene_ids || [];
const blockers = audit.blocking_issues || [];
console.log('SUMMARY ' + JSON.stringify(audit.summary));
console.log('DUPLICATES ' + JSON.stringify(duplicates));
console.log('BLOCKERS ' + JSON.stringify(blockers));

if (duplicates.length !== 0) {
  throw new Error(`Expected 0 duplicates, got ${JSON.stringify(duplicates)}`);
}
if (audit.summary.missing_internal_references !== 0) {
  throw new Error(`Expected 0 missing refs, got ${audit.summary.missing_internal_references}`);
}
if (blockers.length !== 1 || blockers[0]?.category !== 'daily_work_situation_budget_conflict') {
  throw new Error(`Expected only daily_work_situation_budget_conflict, got ${JSON.stringify(blockers)}`);
}
