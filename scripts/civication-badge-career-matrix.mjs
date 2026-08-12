#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT_PATH = 'reports/civication-badge-career-matrix.generated.md';
const POLICY_PATH = 'data/Civication/badgeCareerAuditPolicy.json';

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
}
function exists(rel) {
  return fs.existsSync(path.join(repoRoot, rel));
}
function walk(rel) {
  const full = path.join(repoRoot, rel);
  if (!fs.existsSync(full)) return [];
  const out = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const next = path.join(rel, entry.name).replaceAll(path.sep, '/');
    if (entry.isDirectory()) out.push(...walk(next));
    else out.push(next);
  }
  return out;
}
function cell(value) {
  return String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', '<br>');
}
function yesNo(value) {
  return value ? 'ja' : 'nei';
}
function normalizeCareerRules(raw) {
  if (Array.isArray(raw)) return { careers: raw, global_rules: {} };
  return {
    careers: Array.isArray(raw?.careers) ? raw.careers : [],
    global_rules: raw?.global_rules || {}
  };
}
function isRuntimeGateActivated(tier, policyRow) {
  if (policyRow.offer_policy === 'direct') return true;
  const gate = tier?.career_offer;
  if (!gate || typeof gate !== 'object') return false;
  if (String(gate.policy || '') !== String(policyRow.offer_policy || '')) return false;
  const expected = new Set(policyRow.qualification_ids || []);
  const actual = new Set(Array.isArray(gate.qualification_ids) ? gate.qualification_ids : []);
  return expected.size === actual.size && [...expected].every((id) => actual.has(id));
}

const badgeIndex = readJson('data/badges/index.json');
const policy = readJson(POLICY_PATH);
const mappings = readJson('data/Civication/badgeRoleMappings.json');
const roleModelsManifest = readJson('data/Civication/roleModels/manifest.json');
const rolePackIndex = readJson('data/Civication/rolePackIndex.json');
const lifeStory = readJson('data/Civication/lifestory/manifest.json');
const careerRulesRaw = normalizeCareerRules(readJson('data/Civication/hg_careers.json'));

const roleModels = [];
for (const rel of roleModelsManifest.files || []) {
  if (!exists(rel)) continue;
  const model = readJson(rel);
  roleModels.push({
    path: rel,
    category: String(model.category || rel.split('/').at(-2) || ''),
    title: String(model.title || ''),
    role_scope: String(model.role_scope || ''),
    role_id: String(model.role_id || '')
  });
}

const workGrammars = walk('data/Civication/workGrammars')
  .filter((rel) => rel.endsWith('.json'))
  .map((rel) => {
    const grammar = readJson(rel);
    return {
      path: rel,
      category: String(grammar.category || rel.split('/').at(-2) || ''),
      role_scope: String(grammar.role_scope || path.basename(rel, '.json')),
      role_id: String(grammar.role_id || '')
    };
  });

const lifeBindings = [];
for (const [lifeId, entry] of Object.entries(lifeStory.roles || {})) {
  if (entry?.system_role === true || entry?.content_only === true) continue;
  for (const title of entry?.badge_titles || []) {
    lifeBindings.push({
      lifeId,
      badge_id: String(entry.badge_id || ''),
      title: String(title),
      role_scope: String(entry.role_scope || '')
    });
  }
}

const packRows = Array.isArray(rolePackIndex?.roles) ? rolePackIndex.roles : [];
const careerRules = new Map((careerRulesRaw.careers || []).map((entry) => [String(entry.career_id || ''), entry]));
const salaryPeriod = String(careerRulesRaw.global_rules?.salary?.period || 'weekly');
const salarySource = String(careerRulesRaw.global_rules?.salary?.source || 'badge_tier');

const rows = [];
const coverageErrors = [];
for (const badgePath of badgeIndex.files || []) {
  const badge = readJson(badgePath);
  const badgeId = String(badge.id || '');
  const policyRowsRaw = policy.badges?.[badgeId];
  if (!Array.isArray(policyRowsRaw)) {
    coverageErrors.push(`${badgeId}: mangler policy-rader`);
    continue;
  }
  const policyRows = new Map(policyRowsRaw.map((raw) => {
    const [label, kind, offer_policy, action, qualification_ids = []] = raw;
    return [String(label), { label: String(label), kind, offer_policy, action, qualification_ids }];
  }));

  const actualTitles = new Set((badge.tiers || []).map((tier) => String(tier.label || '')));
  const policyTitles = new Set(policyRows.keys());
  for (const title of actualTitles) if (!policyTitles.has(title)) coverageErrors.push(`${badgeId}: mangler klassifisering for «${title}»`);
  for (const title of policyTitles) if (!actualTitles.has(title)) coverageErrors.push(`${badgeId}: policy har foreldet tittel «${title}»`);

  const careerMapping = mappings?.careers?.[badgeId] || {};
  const titleToScope = careerMapping?.title_to_role_scope || {};
  const careerRule = careerRules.get(badgeId) || null;
  const salaryByTier = careerRule?.economy?.salary_by_tier || {};

  (badge.tiers || []).forEach((tier, tierIndex) => {
    const title = String(tier.label || '');
    const policyRow = policyRows.get(title);
    if (!policyRow) return;

    const exactModel = roleModels.find((model) => model.category === badgeId && model.title === title) || null;
    const mappedScope = String(titleToScope?.[title] || exactModel?.role_scope || '');
    const runtimePack = mappedScope
      ? packRows.find((pack) => String(pack.category || '') === badgeId && String(pack.role_scope || '') === mappedScope)
      : null;
    const exactPack = packRows.find((pack) => String(pack.category || '') === badgeId && String(pack.title || '') === title) || null;
    const pack = runtimePack || exactPack || null;
    const workGrammar = workGrammars.find((grammar) => grammar.category === badgeId && (
      (mappedScope && grammar.role_scope === mappedScope) ||
      (pack?.role_id && grammar.role_id === pack.role_id)
    )) || null;
    const life = lifeBindings.find((binding) => binding.badge_id === badgeId && binding.title === title) || null;
    const salaryKey = String(tierIndex + 1);
    const salaryDefined = Object.prototype.hasOwnProperty.call(salaryByTier, salaryKey);
    const salary = salaryDefined ? Number(salaryByTier[salaryKey]) : null;
    const gateActivated = isRuntimeGateActivated(tier, policyRow);

    rows.push({
      badgeId,
      badgeName: badge.name || badgeId,
      badgePath,
      tierIndex: tierIndex + 1,
      threshold: Number(tier.threshold),
      title,
      ...policyRow,
      role_scope: mappedScope || null,
      roleModel: Boolean(exactModel),
      roleModelPath: exactModel?.path || null,
      workGrammar: Boolean(workGrammar),
      workGrammarPath: workGrammar?.path || null,
      rolePackStatus: String(pack?.status || 'missing'),
      lifeStory: life?.lifeId || null,
      salaryDefined,
      salary,
      salaryPeriod,
      salarySource,
      gateActivated
    });
  });
}

if (coverageErrors.length) {
  console.error('Badge Career Matrix policy coverage failed:');
  for (const error of coverageErrors) console.error(`- ${error}`);
  process.exit(1);
}

const count = (predicate) => rows.filter(predicate).length;
const replaceCount = count((row) => row.action === 'replace');
const reviewCount = count((row) => row.action === 'review');
const keepCount = count((row) => row.action === 'keep');
const gatedCount = count((row) => row.action === 'keep_with_gate');
const salaryGapCount = count((row) => !row.salaryDefined);
const lifeStoryCount = count((row) => Boolean(row.lifeStory));
const fwgCount = count((row) => row.workGrammar);
const gateDebtCount = count((row) => row.offer_policy !== 'direct' && !row.gateActivated);

const badgeSummary = [...new Set(rows.map((row) => row.badgeId))].map((badgeId) => {
  const own = rows.filter((row) => row.badgeId === badgeId);
  return {
    badgeId,
    total: own.length,
    replace: own.filter((row) => row.action === 'replace').length,
    review: own.filter((row) => row.action === 'review').length,
    gated: own.filter((row) => row.action === 'keep_with_gate').length,
    salaryGaps: own.filter((row) => !row.salaryDefined).length,
    life: own.filter((row) => row.lifeStory).length,
    fwg: own.filter((row) => row.workGrammar).length
  };
});

const lines = [];
lines.push('# Civication Badge Career Matrix');
lines.push('');
lines.push('Generated by `node scripts/civication-badge-career-matrix.mjs`. Canonical badge titles and thresholds come from `data/badges/index.json` + `data/badges/*.json`; editorial classification comes from `data/Civication/badgeCareerAuditPolicy.json`. Role scope, roleModel/FWG, Life Story and salary are derived from existing Civication data so the report does not become a parallel career registry.');
lines.push('');
lines.push('## Contract');
lines.push('');
lines.push('- Badge progression is knowledge progression. A reached tier may still be celebrated even when it is not a valid job offer.');
lines.push('- `direct` means History Go progression may create a Civication job offer directly.');
lines.push('- `qualification_required`, `authorization_required` and `appointment_required` require a separate gate before a job offer may be created.');
lines.push('- `not_job` may never create a job offer. `review_required` is blocked until the title is deliberately resolved.');
lines.push('- A roleModel is evidence that content exists, not evidence that the title is a real job. FWG/Life Story depth is reported separately.');
lines.push('- Salary is audited against the exact badge tier index used by `calculateWeeklySalary`; missing exact entries are shown as `MISSING`, never silently interpolated.');
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`- Canonical badges: **${badgeSummary.length}**`);
lines.push(`- Canonical tiers: **${rows.length}**`);
lines.push(`- Keep/direct: **${keepCount}**`);
lines.push(`- Keep with qualification/authorization/appointment gate: **${gatedCount}**`);
lines.push(`- Must replace: **${replaceCount}**`);
lines.push(`- Needs editorial review: **${reviewCount}**`);
lines.push(`- Active Life Story bindings: **${lifeStoryCount} tier bindings**`);
lines.push(`- FWG-backed tier/runtime bindings: **${fwgCount}**`);
lines.push(`- Missing exact salary entries: **${salaryGapCount}**`);
lines.push(`- Non-direct tiers without activated runtime gate: **${gateDebtCount}**`);
lines.push('');
lines.push('## Badge-level worklist');
lines.push('');
lines.push('| badge | tiers | replace | review | gated | Life Story bindings | FWG bindings | salary gaps |');
lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for (const item of badgeSummary) {
  lines.push(`| ${cell(item.badgeId)} | ${item.total} | ${item.replace} | ${item.review} | ${item.gated} | ${item.life} | ${item.fwg} | ${item.salaryGaps} |`);
}
lines.push('');
lines.push('## Priority');
lines.push('');
lines.push('**Psykologi is first remediation priority** because the current ladder combines non-jobs with a legally protected health profession. The first remediation activates explicit runtime blocking/gating without inventing replacement jobs. Replacement titles should only be chosen in a later, evidence-backed Psychology career design pass.');
lines.push('');
lines.push('## Complete tier matrix');
lines.push('');
for (const badgeId of badgeSummary.map((item) => item.badgeId)) {
  lines.push(`### ${badgeId}`);
  lines.push('');
  lines.push('| tier | points | title | classification | action | offer policy | role_scope | roleModel | FWG | role pack | Life Story | salary | runtime gate | qualifications |');
  lines.push('| ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const row of rows.filter((entry) => entry.badgeId === badgeId)) {
    const salaryText = row.salaryDefined ? `${row.salary} / ${row.salaryPeriod}` : 'MISSING';
    const qualifications = row.qualification_ids?.length ? row.qualification_ids.join(', ') : '—';
    lines.push(`| ${row.tierIndex} | ${row.threshold} | ${cell(row.title)} | ${cell(row.kind)} | ${cell(row.action)} | ${cell(row.offer_policy)} | ${cell(row.role_scope || '—')} | ${yesNo(row.roleModel)} | ${yesNo(row.workGrammar)} | ${cell(row.rolePackStatus)} | ${cell(row.lifeStory || '—')} | ${cell(salaryText)} | ${row.gateActivated ? 'aktiv' : (row.offer_policy === 'direct' ? 'ikke nødvendig' : 'MANGLER')} | ${cell(qualifications)} |`);
  }
  lines.push('');
}

lines.push('## Qualification source registry');
lines.push('');
for (const [sourceId, source] of Object.entries(policy.source_registry || {})) {
  lines.push(`- **${sourceId}** — ${source.publisher}: ${source.title}. Checked ${source.checked_at}. ${source.url}`);
}
lines.push('');
lines.push('## Generated-data sources');
lines.push('');
for (const source of [
  'data/badges/index.json',
  'data/Civication/badgeCareerAuditPolicy.json',
  'data/Civication/badgeRoleMappings.json',
  'data/Civication/roleModels/manifest.json',
  'data/Civication/workGrammars/',
  'data/Civication/rolePackIndex.json',
  'data/Civication/lifestory/manifest.json',
  'data/Civication/hg_careers.json'
]) lines.push(`- \`${source}\``);
lines.push('');

const report = `${lines.join('\n')}\n`;
const check = process.argv.includes('--check');
if (check) {
  console.log(`Badge Career Matrix source check passed: ${rows.length} tiers across ${badgeSummary.length} badges; ${gateDebtCount} non-direct runtime gates remain audit debt.`);
} else {
  const reportFullPath = path.join(repoRoot, REPORT_PATH);
  fs.mkdirSync(path.dirname(reportFullPath), { recursive: true });
  fs.writeFileSync(reportFullPath, report, 'utf8');
  console.log(`Wrote ${rows.length} tiers across ${badgeSummary.length} badges to ${REPORT_PATH}.`);
}
