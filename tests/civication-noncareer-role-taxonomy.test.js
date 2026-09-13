#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const clone = (value) => JSON.parse(JSON.stringify(value));

const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const badgeIndex = readJson('data/badges/index.json');
const overlayIndex = readJson('data/Civication/badgeCareerContracts/index.json');
const catalog = readJson('data/Civication/lifePositionCatalog.json');
const badgeAudit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerPolicy = readJson('data/Civication/careerGameplayPolicy.json');
const careerMatrix = readJson('data/Civication/careerGameplayMatrix.json');
const roleWorldIndex = readJson('data/Civication/roleWorlds/index.json');
const roleModelManifest = readJson('data/Civication/roleModels/manifest.json');
const scenarioPeople = readJson('data/Civication/scenarioPeople_index.json');

assert.equal(taxonomy.schema, 'civication_noncareer_role_taxonomy_v1');
assert.equal(taxonomy.status, 'canonical_classification_boundary');
assert.equal(badgeIndex.files.length, 19);

const overlays = new Map((overlayIndex.files || []).map((rel) => {
  const overlay = readJson(rel);
  return [String(overlay.badge_id || ''), overlay];
}));

function applyOverlay(rawBadge) {
  const badge = clone(rawBadge);
  const overlay = overlays.get(String(badge.id || ''));
  if (!overlay) return badge;

  for (const patch of overlay.tiers || []) {
    const tier = badge.tiers.find((candidate) => candidate.label === patch.label);
    assert.ok(tier, `${badge.id}: overlay peker på ukjent tier ${patch.label}`);
    for (const key of ['life_position', 'life_positions', 'career_offer', 'career_unlock']) {
      if (patch[key] != null) tier[key] = clone(patch[key]);
    }
  }
  return badge;
}

const badges = badgeIndex.files.map((rel) => applyOverlay(readJson(rel)));
const tierCount = badges.reduce((sum, badge) => sum + (badge.tiers || []).length, 0);
assert.equal(tierCount, 274, 'canonical Badge-register må fortsatt ha 274 tiers');

function tierLifePositions(badge) {
  return (badge.tiers || []).flatMap((tier) => {
    const rows = [];
    if (tier.life_position && typeof tier.life_position === 'object') rows.push(tier.life_position);
    if (Array.isArray(tier.life_positions)) rows.push(...tier.life_positions);
    return rows.map((position) => ({
      badge_id: String(badge.id),
      badge_name: String(badge.name || badge.id),
      id: String(position.id || '').trim() || null,
      label: String(position.label || tier.label || ''),
      threshold: Number(tier.threshold),
      kind: String(position.kind || 'life_position'),
      employment_independent: position.employment_independent !== false,
      source: 'badge_tier'
    }));
  });
}

const tierPositions = badges.flatMap(tierLifePositions);
assert.equal(tierPositions.length, 118,
  'effective Badge tiers, inkludert obligatoriske overlays, skal gi 118 life_position-deskriptorer');
assert.ok(tierPositions.every((position) => position.employment_independent === true),
  'alle tier-livsposisjoner skal være employment-independent');

const auditRows = Object.values(badgeAudit.badges || {}).flat();
assert.equal(auditRows.length, 274);
const notJobReplace = auditRows.filter((row) => row[2] === 'not_job' && row[3] === 'replace');
assert.equal(notJobReplace.length, 117,
  '117 Badge-tiers skal fortsatt være eksplisitt not_job/replace');

const phd = badges.find((badge) => badge.id === 'historie').tiers
  .find((tier) => tier.label === 'Doktorgradsstudent');
assert.equal(phd.life_position?.employment_independent, true);
assert.equal(phd.life_position?.kind, 'doctoral_study_stage');
assert.equal(phd.career_unlock?.policy, 'qualification_required');
assert.deepEqual(phd.career_unlock?.qualification_ids, ['academic_phd_admission_or_employment']);
assert.deepEqual(
  badgeAudit.badges.historie.find((row) => row[0] === 'Doktorgradsstudent'),
  ['Doktorgradsstudent', 'education_employment', 'qualification_required', 'keep_with_gate',
    ['academic_phd_admission_or_employment']]
);

const catalogPositions = (catalog.badges || []).flatMap((profile) =>
  (profile.positions || []).map((position) => ({
    badge_id: String(profile.badge_id),
    label: String(position.label || ''),
    id: String(position.id || ''),
    source: 'catalog'
  }))
);
assert.equal(catalogPositions.length, 84, 'Life Position Catalog skal ha 84 posisjoner etter canonical opprydding');

const keyOf = (position) => `${position.badge_id}::${position.label}`;
const tierKeys = new Set(tierPositions.map(keyOf));
const duplicateKeys = catalogPositions.filter((position) => tierKeys.has(keyOf(position))).map(keyOf);
assert.equal(new Set(duplicateKeys).size, 8,
  'Helse/Utdanning skal fortsatt gi åtte tier+katalog-duplikater som runtime dedupliserer');

const uniqueBadgeScoped = new Set([...tierPositions, ...catalogPositions].map(keyOf));
assert.equal(uniqueBadgeScoped.size, 194,
  'tier + katalog skal materialisere 194 unike Badge-scopede livsposisjoner');

const merits = Object.fromEntries(badges.map((badge) => [
  badge.id,
  { points: Math.max(...badge.tiers.map((tier) => Number(tier.threshold))) }
]));
const storage = new Map([['merits_by_category', JSON.stringify(merits)]]);
const lifeSandbox = {
  console,
  Date,
  Event: function Event(type) { this.type = type; },
  localStorage: {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value))
  },
  window: {
    BADGES: badges,
    CIVI_LIFE_POSITION_CATALOG: catalog,
    CivicationState: { getActivePosition: () => null },
    dispatchEvent: () => {}
  },
  module: { exports: {} }
};
lifeSandbox.window.window = lifeSandbox.window;
vm.createContext(lifeSandbox);
vm.runInContext(
  fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationLifePositionRuntime.js'), 'utf8'),
  lifeSandbox,
  { filename: 'civicationLifePositionRuntime.js' }
);
const lifeApi = lifeSandbox.window.CivicationLifePositions;

const openPositions = lifeApi.getOpenPositions();
assert.equal(openPositions.length, 5, 'det skal fortsatt finnes fem alltid åpne livsbaner');
assert.deepEqual(
  new Set(openPositions.map((position) => position.label)),
  new Set(['Uteligger', 'Boms', 'Kriminell', 'Bohem', 'Nomade'])
);

const unlocked = lifeApi.getAllUnlockedPositions();
assert.equal(unlocked.length, 199,
  'canonical runtime skal materialisere 199 unike valgbare livsposisjoner ved full Badge-progresjon');
assert.equal(new Set(unlocked.map(keyOf)).size, 199,
  'runtime-resultatet skal være deduplisert på badge_id + label');

const circumstanceOptions = lifeApi.getCircumstanceOptions();
assert.deepEqual(Object.keys(circumstanceOptions).sort(),
  ['activity_status', 'benefit_status', 'housing_choice', 'housing_status']);
assert.equal(Object.values(circumstanceOptions).flat().length, 18,
  'life circumstances skal fortsatt ha 18 eksplisitte option values over fire akser');

const relationshipSandbox = { window: {} };
relationshipSandbox.window.window = relationshipSandbox.window;
vm.createContext(relationshipSandbox);
vm.runInContext(
  fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationRelationshipEngine.js'), 'utf8'),
  relationshipSandbox,
  { filename: 'civicationRelationshipEngine.js' }
);
assert.equal(relationshipSandbox.window.CivicationRelationshipEngine.STAGE_BY_LEVEL.length, 6,
  'relasjonssystemet skal fortsatt eie seks vennskapsstadier separat fra livsposisjoner');

assert.equal(roleWorldIndex.roles.length, 100, 'Role World-indeksen skal ha 85 karriereverdener + femten life-position worlds');
assert.ok(roleWorldIndex.roles.every((role) => role.status === 'role_world_complete'));
const careerRoleWorlds = roleWorldIndex.roles.filter((role) => role.subject_type !== 'life_position');
const lifePositionWorlds = roleWorldIndex.roles.filter((role) => role.subject_type === 'life_position');
assert.equal(careerRoleWorlds.length, 85, 'karriereverdener skal fortsatt være nøyaktig 85');
assert.equal(lifePositionWorlds.length, 15, 'femten canonical life-position worlds skal være materialisert, inkludert Gangster');
const lifeWorldByKey = new Map(lifePositionWorlds.map((row) => [row.life_position_key, row]));
assert.deepEqual(lifeWorldByKey.get('subkultur/gangster').life_position_ref, { badge_id: 'subkultur', id: null, label: 'Gangster' });
assert.deepEqual(lifeWorldByKey.get('sport/supporter').life_position_ref, { badge_id: 'sport', id: 'supporter', label: 'Supporter' });
assert.equal(lifeWorldByKey.get('sport/supporter').role_scope, 'sport_supporter');
assert.deepEqual(lifeWorldByKey.get('by/nabolagskjenner').life_position_ref, { badge_id: 'by', id: 'nabolagskjenner', label: 'Nabolagskjenner' });
assert.equal(lifeWorldByKey.get('by/nabolagskjenner').role_scope, 'by_nabolagskjenner');
assert.deepEqual(lifeWorldByKey.get('film_tv/filmklubbmenneske').life_position_ref, { badge_id: 'film_tv', id: 'filmklubbmenneske', label: 'Filmklubbmenneske' });
assert.equal(lifeWorldByKey.get('film_tv/filmklubbmenneske').role_scope, 'film_tv_filmklubbmenneske');
assert.deepEqual(lifeWorldByKey.get('filosofi/sofafilosof').life_position_ref, { badge_id: 'filosofi', id: 'sofafilosof', label: 'Sofafilosof' });
assert.equal(lifeWorldByKey.get('filosofi/sofafilosof').role_scope, 'filosofi_sofafilosof');
assert.deepEqual(lifeWorldByKey.get('historie/historievandrer').life_position_ref, { badge_id: 'historie', id: 'historievandrer', label: 'Historievandrer' });
assert.equal(lifeWorldByKey.get('historie/historievandrer').role_scope, 'historie_historievandrer');
assert.deepEqual(lifeWorldByKey.get('kunst/gallerivanker').life_position_ref, { badge_id: 'kunst', id: 'gallerivanker', label: 'Gallerivanker' });
assert.equal(lifeWorldByKey.get('kunst/gallerivanker').role_scope, 'kunst_gallerivanker');
assert.deepEqual(lifeWorldByKey.get('by/byflanor').life_position_ref, { badge_id: 'by', id: 'byflanor', label: 'Flanør' });
assert.equal(lifeWorldByKey.get('by/byflanor').role_scope, 'by_flanor');
assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 100, career_role_worlds: 85, life_position_role_worlds: 15 });
assert.equal(roleModelManifest.files.length, 293,
  'roleModel-manifestet er authored inventory og skal ikke forveksles med spillerrolle-antallet');
assert.equal(scenarioPeople.summary.role_model_file_count, 293);
assert.equal(scenarioPeople.summary.canonical_role_count, 287);
assert.equal(scenarioPeople.summary.shadowed_role_model_count, 6);

assert.equal((careerPolicy.career_exclusions || []).length, 3);
assert.equal(careerMatrix.summary.noncareer_worlds, 3);
assert.ok((careerPolicy.career_exclusions || []).every((row) =>
  careerMatrix.noncareer_worlds.some((world) => world.key === `${row.category}/${row.role_scope}`)
), 'Career explicit noncareer rows skal være audit exclusions, ikke den samlede life-position-listen');

const expectedCounts = {
  badge_count: 19,
  badge_tier_count: 274,
  effective_badge_tier_life_position_descriptors: 118,
  badge_audit_not_job_replace_tiers: 117,
  catalog_life_positions: 84,
  tier_catalog_duplicate_positions: 8,
  unique_badge_scoped_life_positions: 194,
  always_open_life_paths: 5,
  selectable_life_positions_total: 199,
  life_circumstance_axes: 4,
  life_circumstance_option_values: 18,
  relationship_stages: 6,
  career_role_worlds: 85,
  life_position_role_worlds: 15,
  total_role_worlds: 100,
  role_model_manifest_files: 293,
  canonical_scenario_role_models: 287,
  shadowed_role_models: 6,
  career_matrix_explicit_noncareer_worlds: 3
};
assert.deepEqual(taxonomy.canonical_counts, expectedCounts,
  'maskinlesbar taxonomy-summary må følge de canonicale kildene eksakt');

assert.equal(taxonomy.classes.life_position.runtime_owner, 'CivicationLifePositions');
assert.equal(taxonomy.classes.life_position.role_world_subject, true);
assert.equal(taxonomy.classes.life_circumstance.role_world_subject, false);
assert.equal(taxonomy.classes.relationship_state.role_world_subject, false);
assert.equal(taxonomy.classes.livelihood.role_world_subject, false);
assert.equal(taxonomy.classes.role_model.role_world_subject, false);
assert.deepEqual(taxonomy.role_world_rollout_boundary.allowed_subject_classes,
  ['career_role', 'life_position']);
assert.equal(taxonomy.role_world_rollout_boundary.mass_materialization_allowed, false);

console.log('civication non-career role taxonomy ok: 199 selectable life positions / 85 career Role Worlds + 14 life-position worlds / layers remain separate');
