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
function getTierCareerContract(tier) {
  if (tier?.career_unlock && typeof tier.career_unlock === 'object') {
    return { ...tier.career_unlock, contract_source: 'career_unlock' };
  }
  if (tier?.career_offer && typeof tier.career_offer === 'object') {
    return { ...tier.career_offer, contract_source: 'career_offer' };
  }
  return null;
}
function isRuntimeGateActivated(tier, offerPolicy, qualificationIds) {
  if (offerPolicy === 'direct') return true;
  const contract = getTierCareerContract(tier);
  if (!contract || typeof contract !== 'object') return false;
  if (String(contract.policy || '') !== String(offerPolicy || '')) return false;
  const expected = new Set(qualificationIds || []);
  const actual = new Set(Array.isArray(contract.qualification_ids) ? contract.qualification_ids : []);
  return expected.size === actual.size && [...expected].every((id) => actual.has(id));
}
function salaryAuditForTier(tier, tierIndex, salaryByTier) {
  const contract = getTierCareerContract(tier);
  if (!contract) {
    return { applicable: false, key: null, defined: true, value: null, source: 'not_applicable' };
  }
  const explicitBand = Number(contract.salary_tier);
  const key = String(Number.isInteger(explicitBand) && explicitBand >= 1 ? explicitBand : tierIndex + 1);
  const defined = Object.prototype.hasOwnProperty.call(salaryByTier, key);
  return {
    applicable: true,
    key,
    defined,
    value: defined ? Number(salaryByTier[key]) : null,
    source: Number.isInteger(explicitBand) && explicitBand >= 1 ? 'career_salary_band' : 'badge_tier'
  };
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
  const careerTitleToScope = careerMapping?.career_title_to_role_scope || {};
  const careerRule = careerRules.get(badgeId) || null;
  const salaryByTier = careerRule?.economy?.salary_by_tier || {};

  (badge.tiers || []).forEach((tier, tierIndex) => {
    const title = String(tier.label || '');
    const policyRow = policyRows.get(title);
    if (!policyRow) return;

    const careerContract = getTierCareerContract(tier);
    const lifePosition = Boolean(tier?.life_position);
    const pureLifePosition = Boolean(lifePosition && !careerContract);
    const careerTitle = String(careerContract?.title || title);
    const splitResolved = Boolean(lifePosition && (tier?.career_unlock?.title || pureLifePosition));
    const effectiveOfferPolicy = String(careerContract?.policy || policyRow.offer_policy || 'direct');
    const effectiveQualificationIds = Array.isArray(careerContract?.qualification_ids)
      ? careerContract.qualification_ids
      : (policyRow.qualification_ids || []);

    const exactModel = careerContract
      ? roleModels.find((model) => model.category === badgeId && model.title === careerTitle) || null
      : null;
    const mappedScope = careerContract ? String(
      titleToScope?.[title] ||
      careerTitleToScope?.[careerTitle] ||
      titleToScope?.[careerTitle] ||
      exactModel?.role_scope ||
      ''
    ) : '';
    const runtimePack = mappedScope
      ? packRows.find((pack) => String(pack.category || '') === badgeId && String(pack.role_scope || '') === mappedScope)
      : null;
    const exactPack = careerContract
      ? packRows.find((pack) => String(pack.category || '') === badgeId && String(pack.title || '') === careerTitle) || null
      : null;
    const pack = runtimePack || exactPack || null;
    const workGrammar = workGrammars.find((grammar) => grammar.category === badgeId && (
      (mappedScope && grammar.role_scope === mappedScope) ||
      (pack?.role_id && grammar.role_id === pack.role_id)
    )) || null;
    const life = lifeBindings.find((binding) => binding.badge_id === badgeId && (
      binding.title === title || binding.title === careerTitle
    )) || null;
    const salaryAudit = salaryAuditForTier(tier, tierIndex, salaryByTier);
    const gateActivated = isRuntimeGateActivated(tier, effectiveOfferPolicy, effectiveQualificationIds);

    rows.push({
      badgeId,
      badgeName: badge.name || badgeId,
      badgePath,
      tierIndex: tierIndex + 1,
      threshold: Number(tier.threshold),
      title,
      ...policyRow,
      lifePosition,
      pureLifePosition,
      lifePositionKind: String(tier?.life_position?.kind || ''),
      splitResolved,
      careerTitle,
      effectiveOfferPolicy,
      effectiveQualificationIds,
      careerContractSource: String(careerContract?.contract_source || ''),
      role_scope: mappedScope || null,
      roleModel: Boolean(exactModel),
      roleModelPath: exactModel?.path || null,
      workGrammar: Boolean(workGrammar),
      workGrammarPath: workGrammar?.path || null,
      rolePackStatus: String(pack?.status || 'missing'),
      lifeStory: life?.lifeId || null,
      salaryApplicable: salaryAudit.applicable,
      salaryKey: salaryAudit.key,
      salaryDefined: salaryAudit.defined,
      salary: salaryAudit.value,
      salaryPeriod,
      salarySource: salaryAudit.source,
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
const unresolvedReplaceCount = count((row) => row.action === 'replace' && !row.splitResolved);
const resolvedSplitCount = count((row) => row.splitResolved);
const reviewCount = count((row) => row.action === 'review');
const keepCount = count((row) => row.action === 'keep');
const gatedCount = count((row) => row.action === 'keep_with_gate');
const salaryGapCount = count((row) => row.salaryApplicable && !row.salaryDefined);
const lifeStoryCount = count((row) => Boolean(row.lifeStory));
const fwgCount = count((row) => row.workGrammar);
const gateDebtCount = count((row) => row.effectiveOfferPolicy !== 'direct' && !row.gateActivated && !['not_job','review_required'].includes(row.effectiveOfferPolicy));

const badgeSummary = [...new Set(rows.map((row) => row.badgeId))].map((badgeId) => {
  const own = rows.filter((row) => row.badgeId === badgeId);
  return {
    badgeId,
    total: own.length,
    replace: own.filter((row) => row.action === 'replace').length,
    unresolvedReplace: own.filter((row) => row.action === 'replace' && !row.splitResolved).length,
    resolvedSplit: own.filter((row) => row.splitResolved).length,
    review: own.filter((row) => row.action === 'review').length,
    gated: own.filter((row) => row.action === 'keep_with_gate').length,
    salaryGaps: own.filter((row) => row.salaryApplicable && !row.salaryDefined).length,
    life: own.filter((row) => row.lifeStory).length,
    fwg: own.filter((row) => row.workGrammar).length
  };
});

const lines = [];
lines.push('# Civication Badge Career Matrix');
lines.push('');
lines.push('Generated by `node scripts/civication-badge-career-matrix.mjs`. Badge tiers may be jobs, knowledge milestones or employment-independent life positions. `career_unlock` is the explicit bridge when a life position also unlocks a separate real job.');
lines.push('');
lines.push('## Contract');
lines.push('');
lines.push('- Badge progression is knowledge/life progression, not automatically an employment hierarchy.');
lines.push('- A pure `life_position` without `career_offer`/`career_unlock` is complete as a non-job state and must never be counted as unresolved career-label debt.');
lines.push('- `career_unlock.title` is the separate real job opportunity unlocked at the same threshold; accepting/rejecting that job does not erase the life position.');
lines.push('- Formal employment continues to live in Civication active-position/job state. No active job still means formally unemployed even when a life position is active.');
lines.push('- `direct` means the mapped career opportunity may be offered directly. Qualification/authorization/appointment policies still fail closed.');
lines.push('- Salary applies only to tiers with a career contract. Explicit `salary_tier` selects the accepted job salary band; pure life positions are N/A, not salary gaps.');
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`- Canonical badges: **${badgeSummary.length}**`);
lines.push(`- Canonical tiers: **${rows.length}**`);
lines.push(`- Policy rows marked replace: **${replaceCount}**`);
lines.push(`- Replace rows resolved by life-position/career separation: **${resolvedSplitCount}**`);
lines.push(`- Unresolved career-label replacements: **${unresolvedReplaceCount}**`);
lines.push(`- Keep/direct policy rows: **${keepCount}**`);
lines.push(`- Keep with qualification/authorization/appointment gate: **${gatedCount}**`);
lines.push(`- Needs editorial review: **${reviewCount}**`);
lines.push(`- Active Life Story bindings: **${lifeStoryCount} tier/job bindings**`);
lines.push(`- FWG-backed tier/runtime bindings: **${fwgCount}**`);
lines.push(`- Missing applicable salary entries: **${salaryGapCount}**`);
lines.push(`- Gated career unlocks without activated runtime gate: **${gateDebtCount}**`);
lines.push('');
lines.push('## Badge-level worklist');
lines.push('');
lines.push('| badge | tiers | policy replace | resolved split | unresolved replace | review | Life Story | FWG | salary gaps |');
lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for (const item of badgeSummary) {
  lines.push(`| ${cell(item.badgeId)} | ${item.total} | ${item.replace} | ${item.resolvedSplit} | ${item.unresolvedReplace} | ${item.review} | ${item.life} | ${item.fwg} | ${item.salaryGaps} |`);
}
lines.push('');
lines.push('## Architecture priority');
lines.push('');
lines.push('Do not erase fun status tiers merely because they are not jobs. Keep useful life positions as life positions. Add `career_unlock` only when that milestone genuinely unlocks a separate real job; otherwise no job contract is required.');
lines.push('');
lines.push('## Complete tier matrix');
lines.push('');
for (const badgeId of badgeSummary.map((item) => item.badgeId)) {
  lines.push(`### ${badgeId}`);
  lines.push('');
  lines.push('| tier | points | badge/life title | label class | audit action | life position | career title | career policy | role_scope | roleModel | FWG | role pack | Life Story | salary | runtime gate | qualifications |');
  lines.push('| ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const row of rows.filter((entry) => entry.badgeId === badgeId)) {
    const salaryText = !row.salaryApplicable
      ? 'N/A (life position)'
      : (row.salaryDefined ? `${row.salary} / ${row.salaryPeriod} [${row.salarySource}:${row.salaryKey}]` : 'MISSING');
    const qualifications = row.effectiveQualificationIds?.length ? row.effectiveQualificationIds.join(', ') : '—';
    const careerTitle = row.pureLifePosition ? '—' : row.careerTitle;
    lines.push(`| ${row.tierIndex} | ${row.threshold} | ${cell(row.title)} | ${cell(row.kind)} | ${cell(row.action)} | ${row.lifePosition ? `ja (${cell(row.lifePositionKind || 'life_position')})` : 'nei'} | ${cell(careerTitle)} | ${cell(row.effectiveOfferPolicy)} | ${cell(row.role_scope || '—')} | ${yesNo(row.roleModel)} | ${yesNo(row.workGrammar)} | ${cell(row.rolePackStatus)} | ${cell(row.lifeStory || '—')} | ${cell(salaryText)} | ${row.gateActivated ? 'aktiv' : (['direct','not_job','review_required'].includes(row.effectiveOfferPolicy) ? 'ikke nødvendig' : 'MANGLER')} | ${cell(qualifications)} |`);
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
  console.log(`Badge Career Matrix source check passed: ${rows.length} tiers across ${badgeSummary.length} badges; ${unresolvedReplaceCount} unresolved career-label replacements; ${resolvedSplitCount} life-position splits resolved; ${gateDebtCount} gated runtime gates remain audit debt.`);
} else {
  const reportFullPath = path.join(repoRoot, REPORT_PATH);
  fs.mkdirSync(path.dirname(reportFullPath), { recursive: true });
  fs.writeFileSync(reportFullPath, report, 'utf8');
  console.log(`Wrote ${rows.length} tiers across ${badgeSummary.length} badges to ${REPORT_PATH}.`);
}
