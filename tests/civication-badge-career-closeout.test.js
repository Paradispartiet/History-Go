#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const walk = (rel) => {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(rel, entry.name).replaceAll(path.sep, '/');
    return entry.isDirectory() ? walk(next) : [next];
  });
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const contractFor = (tier) => tier?.career_unlock || tier?.career_offer || null;
const setEq = (a, b) => {
  const aa = new Set(Array.isArray(a) ? a : []);
  const bb = new Set(Array.isArray(b) ? b : []);
  return aa.size === bb.size && [...aa].every((value) => bb.has(value));
};

const index = readJson('data/badges/index.json');
const policy = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careersRaw = readJson('data/Civication/hg_careers.json');
const careers = new Map((Array.isArray(careersRaw) ? careersRaw : careersRaw.careers || [])
  .map((career) => [String(career.career_id || ''), career]));
const overlayIndex = readJson('data/Civication/badgeCareerContracts/index.json');
const overlays = new Map((overlayIndex.files || []).map((rel) => {
  const overlay = readJson(rel);
  return [String(overlay.badge_id || ''), overlay];
}));

const roleModels = walk('data/Civication/roleModels')
  .filter((rel) => rel.endsWith('.json') && !rel.endsWith('/manifest.json'))
  .map((rel) => ({ rel, json: readJson(rel) }));
const grammars = walk('data/Civication/workGrammars')
  .filter((rel) => rel.endsWith('.json'))
  .map((rel) => ({ rel, json: readJson(rel) }));

function applyOverlay(badge) {
  const out = clone(badge);
  const overlay = overlays.get(String(out.id || ''));
  if (!overlay) return out;
  for (const patch of overlay.tiers || []) {
    const tier = out.tiers.find((candidate) => candidate.label === patch.label);
    assert.ok(tier, `${out.id}: overlay peker på ukjent tier ${patch.label}`);
    for (const key of ['life_position', 'career_offer', 'career_unlock']) {
      if (patch[key]) tier[key] = clone(patch[key]);
    }
  }
  if (overlay.evidence_ref) out.career_life_evidence = overlay.evidence_ref;
  return out;
}

const debts = [];
let tierCount = 0;
let replaceCount = 0;
let careerContractCount = 0;

for (const badgePath of index.files || []) {
  const badge = applyOverlay(readJson(badgePath));
  const badgeId = String(badge.id || '');
  const policyRows = policy.badges?.[badgeId] || [];
  const byTitle = new Map(policyRows.map((row) => [String(row[0]), row]));
  assert.strictEqual(byTitle.size, badge.tiers.length, `${badgeId}: policy coverage`);
  const salaryByTier = careers.get(badgeId)?.economy?.salary_by_tier || {};

  badge.tiers.forEach((tier, indexInBadge) => {
    tierCount += 1;
    const row = byTitle.get(String(tier.label));
    assert.ok(row, `${badgeId}/${tier.label}: mangler audit-policy`);
    const [, kind, offerPolicy, action, qualificationIds = []] = row;
    const contract = contractFor(tier);

    if (action === 'review' || offerPolicy === 'review_required') {
      debts.push(`${badgeId}/${tier.label}: editorial review står fortsatt åpen`);
    }

    if (action === 'replace') {
      replaceCount += 1;
      if (!tier.life_position || tier.life_position.employment_independent !== true) {
        debts.push(`${badgeId}/${tier.label}: replace er ikke materialisert som employment-independent life_position`);
      }
      if (tier.career_offer) {
        debts.push(`${badgeId}/${tier.label}: replace-tier må ikke materialiseres som career_offer`);
      }
    }

    if (action === 'keep' || action === 'keep_with_gate') {
      if (!contract) {
        debts.push(`${badgeId}/${tier.label}: ${action} mangler faktisk career contract`);
        return;
      }
      if (action === 'keep' && String(contract.policy || 'direct') !== 'direct') {
        debts.push(`${badgeId}/${tier.label}: keep må være direct i runtime`);
      }
      if (action === 'keep_with_gate') {
        if (String(contract.policy || '') !== String(offerPolicy || '')) {
          debts.push(`${badgeId}/${tier.label}: runtime gate ${contract.policy} avviker fra policy ${offerPolicy}`);
        }
        if (!setEq(contract.qualification_ids, qualificationIds)) {
          debts.push(`${badgeId}/${tier.label}: qualification_ids avviker fra policy`);
        }
      }
    }

    if (!contract) return;
    careerContractCount += 1;

    const explicitSalaryTier = Number(contract.salary_tier);
    const salaryKey = String(Number.isInteger(explicitSalaryTier) && explicitSalaryTier >= 1
      ? explicitSalaryTier
      : indexInBadge + 1);
    if (!Object.prototype.hasOwnProperty.call(salaryByTier, salaryKey)) {
      debts.push(`${badgeId}/${tier.label}: mangler lønn for salary tier ${salaryKey}`);
    }

    const title = String(contract.title || tier.label || '');
    const scope = String(contract.role_scope || Resolver.resolveCareerRoleScope({
      career_id: badgeId,
      title,
      badge_tier_label: tier.label
    }) || '');
    if (!scope || scope === 'unknown') {
      debts.push(`${badgeId}/${tier.label}: jobb ${title} mangler canonical role_scope`);
      return;
    }

    const model = roleModels.find(({ json }) => String(json.category || '') === badgeId && (
      String(json.role_scope || '') === scope || String(json.title || '') === title
    ));
    if (!model) debts.push(`${badgeId}/${tier.label}: ${title} mangler roleModel for ${scope}`);

    const grammar = grammars.find(({ json }) => String(json.category || '') === badgeId &&
      String(json.role_scope || '') === scope);
    if (!grammar) debts.push(`${badgeId}/${tier.label}: ${title} mangler FWG for ${scope}`);
  });
}

assert.strictEqual(index.files.length, 19, 'closeout skal dekke 19 canonical badges');
assert.strictEqual(tierCount, 274, 'closeout skal dekke alle 274 canonical tiers');

const generatorOutput = execFileSync(
  process.execPath,
  [path.join(ROOT, 'scripts/civication-badge-career-matrix.mjs'), '--check'],
  { cwd: ROOT, encoding: 'utf8' }
);
assert.match(generatorOutput, /0 unresolved career-label replacements/,
  `matrix-generator rapporterer fortsatt uavklart replace-gjeld: ${generatorOutput.trim()}`);
assert.match(generatorOutput, /0 gated runtime gates remain audit debt/,
  `matrix-generator rapporterer fortsatt gate-gjeld: ${generatorOutput.trim()}`);

assert.deepStrictEqual(debts, [], `Badge Career closeout har ${debts.length} gjeldspunkter:\n${debts.join('\n')}`);
console.log(`civication badge career closeout ok: ${tierCount} tiers / 19 badges / ${replaceCount} resolved life-position rows / ${careerContractCount} career contracts / 0 debt`);
