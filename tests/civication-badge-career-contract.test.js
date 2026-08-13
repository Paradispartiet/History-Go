#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');

const badgeIndex = readJson('data/badges/index.json');
const categoryContract = readJson('data/categories/category_contract.json');
const badges = new Map();
for (const rel of badgeIndex.files || []) {
  const payload = readJson(rel);
  const list = Array.isArray(payload?.badges) ? payload.badges : [payload];
  for (const badge of list) {
    if (badge?.id) badges.set(badge.id, badge);
  }
}

function assertStrictTierOrder(badgeId) {
  const badge = badges.get(badgeId);
  assert.ok(badge, `mangler badge ${badgeId}`);
  let previous = -Infinity;
  const labels = new Set();
  for (const tier of badge.tiers || []) {
    assert.ok(typeof tier.label === 'string' && tier.label.trim(), `${badgeId}: tier uten label`);
    assert.ok(Number.isFinite(Number(tier.threshold)), `${badgeId}/${tier.label}: ugyldig threshold`);
    assert.ok(Number(tier.threshold) > previous, `${badgeId}: thresholds må være strengt stigende`);
    assert.ok(!labels.has(tier.label), `${badgeId}: duplikat stillingstittel ${tier.label}`);
    labels.add(tier.label);
    previous = Number(tier.threshold);
  }
}

// Sosial læring var en historisk HG Social-progresjonsbadge, ikke et canonical
// fag eller en bevisst Civication-karriere. Den skal derfor ikke kunne snike seg
// tilbake som badge bare fordi legacy-innhold fortsatt bruker namespace-navnet.
assert.ok(!(badgeIndex.files || []).includes('data/badges/sosial_laering.json'),
  'Sosial læring skal ikke være registrert i badgeindeksen');
assert.ok(!fs.existsSync(path.join(ROOT, 'data/badges/sosial_laering.json')),
  'data/badges/sosial_laering.json skal være slettet');
assert.ok(!badges.has('sosial_laering'), 'Sosial læring skal ikke finnes som lastet badge');
assert.ok(!(categoryContract.nonPlaceBadges || []).includes('sosial_laering'),
  'Sosial læring skal ikke være registrert som non-place badge');
assert.ok(!(categoryContract.runtimeCategories || []).includes('sosial_laering'),
  'Sosial læring skal ikke være runtimekategori');
assert.ok(!(categoryContract.fagSubjects || []).includes('sosial_laering'),
  'Sosial læring skal ikke være fag');

assertStrictTierOrder('naeringsliv');

const naering = badges.get('naeringsliv');
assert.ok(naering.tiers.some((tier) => tier.label === 'Renholder' && tier.threshold === 8),
  'Renholder skal være en ekte Næringsliv-tier, ikke en skjult Civication-rolle');

const manifest = readJson('data/Civication/lifestory/manifest.json');
for (const [roleId, entry] of Object.entries(manifest.roles || {})) {
  if (entry.system_role === true) {
    assert.strictEqual(roleId, 'arbeidsledig', 'kun eksplisitte systemroller kan stå uten Badge-binding');
    continue;
  }

  if (entry.content_only === true) {
    assert.ok(!entry.badge_id, `${roleId}: content-only-pakke skal ikke late som den har Badge-binding`);
    assert.ok(!entry.badge_titles, `${roleId}: content-only-pakke skal ikke ha badge_titles`);
    assert.ok(entry.role_scope, `${roleId}: content-only-pakke skal beholde role_scope for innhold/runtime`);
    continue;
  }

  assert.ok(entry.badge_id, `${roleId}: aktiv opptjent Life Story-rolle mangler badge_id`);
  assert.ok(Array.isArray(entry.badge_titles) && entry.badge_titles.length,
    `${roleId}: aktiv opptjent Life Story-rolle mangler badge_titles`);
  assert.ok(entry.role_scope, `${roleId}: aktiv Life Story-rolle mangler role_scope`);

  const badge = badges.get(entry.badge_id);
  assert.ok(badge, `${roleId}: badge_id ${entry.badge_id} finnes ikke i data/badges/index.json`);
  const tierTitles = new Set((badge.tiers || []).map((tier) => tier.label));

  for (const title of entry.badge_titles) {
    assert.ok(tierTitles.has(title), `${roleId}: Badge-tittelen «${title}» finnes ikke i ${entry.badge_id}`);
    const resolved = Resolver.resolveCareerRoleScope({ career_id: entry.badge_id, title });
    assert.strictEqual(resolved, entry.role_scope,
      `${roleId}: resolver mapper «${title}» til ${resolved}, forventet ${entry.role_scope}`);
  }
}

const barnehageassistent = manifest.roles?.barnehageassistent;
assert.ok(barnehageassistent, 'Barnehageassistent-innholdet skal bevares');
assert.strictEqual(barnehageassistent.content_only, true,
  'Barnehageassistent skal være content-only inntil en bevisst canonical Badge-plassering er valgt');
assert.strictEqual(barnehageassistent.legacy_namespace, 'sosial_laering',
  'legacy namespace skal være eksplisitt og ikke forveksles med Badge-identitet');
assert.ok(!barnehageassistent.badge_id && !barnehageassistent.badge_titles,
  'Barnehageassistent skal ikke fortsatt være bundet til den slettede badgen');

console.log('civication badge career contract ok');
