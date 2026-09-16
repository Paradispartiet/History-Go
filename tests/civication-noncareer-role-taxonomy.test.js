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

assert.equal(roleWorldIndex.roles.length, 150, 'Role World-indeksen skal ha 85 karriereverdener + sekstifem life-position worlds');
assert.ok(roleWorldIndex.roles.every((role) => role.status === 'role_world_complete'));
const careerRoleWorlds = roleWorldIndex.roles.filter((role) => role.subject_type !== 'life_position');
const lifePositionWorlds = roleWorldIndex.roles.filter((role) => role.subject_type === 'life_position');
assert.equal(careerRoleWorlds.length, 85, 'karriereverdener skal fortsatt være nøyaktig 85');
assert.equal(lifePositionWorlds.length, 65, 'sekstifem canonical life-position worlds skal være materialisert, inkludert Relasjonsbygger');
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
assert.deepEqual(lifeWorldByKey.get('naeringsliv/frilanser').life_position_ref, { badge_id: 'naeringsliv', id: 'frilanser', label: 'Frilanser' });
assert.equal(lifeWorldByKey.get('naeringsliv/frilanser').role_scope, 'naeringsliv_frilanser');
assert.deepEqual(lifeWorldByKey.get('by/byvandrer').life_position_ref, { badge_id: 'by', id: 'byvandrer', label: 'Byvandrer' });
assert.equal(lifeWorldByKey.get('by/byvandrer').role_scope, 'by_byvandrer');
assert.deepEqual(lifeWorldByKey.get('by/urbanist').life_position_ref, { badge_id: 'by', id: 'urbanist', label: 'Urbanist' });
assert.equal(lifeWorldByKey.get('by/urbanist').role_scope, 'by_urbanist');
assert.deepEqual(lifeWorldByKey.get('film_tv/festivalgjenger').life_position_ref, { badge_id: 'film_tv', id: 'festivalgjenger', label: 'Festivalgjenger' });
assert.equal(lifeWorldByKey.get('film_tv/festivalgjenger').role_scope, 'film_tv_festivalgjenger');
assert.deepEqual(lifeWorldByKey.get('film_tv/filmfantast').life_position_ref, { badge_id: 'film_tv', id: 'filmfantast', label: 'Filmfantast' });
assert.deepEqual(lifeWorldByKey.get('film_tv/filminteressert').life_position_ref, { badge_id: 'film_tv', id: 'filminteressert', label: 'Filminteressert' });
assert.equal(lifeWorldByKey.get('film_tv/filminteressert').role_scope, 'film_tv_filminteressert');
assert.equal(lifeWorldByKey.get('film_tv/filmfantast').role_scope, 'film_tv_filmfantast');
assert.deepEqual(lifeWorldByKey.get('film_tv/kinogjenger').life_position_ref, { badge_id: 'film_tv', id: 'kinogjenger', label: 'Kinogjenger' });
assert.equal(lifeWorldByKey.get('film_tv/kinogjenger').role_scope, 'film_tv_kinogjenger');
assert.deepEqual(lifeWorldByKey.get('film_tv/kjenner').life_position_ref, { badge_id: 'film_tv', id: 'kjenner', label: 'Kjenner' });
assert.equal(lifeWorldByKey.get('film_tv/kjenner').role_scope, 'film_tv_kjenner');
assert.deepEqual(lifeWorldByKey.get('film_tv/seer').life_position_ref, { badge_id: 'film_tv', id: 'seer', label: 'Seer' });
assert.equal(lifeWorldByKey.get('film_tv/seer').role_scope, 'film_tv_seer');
assert.deepEqual(lifeWorldByKey.get('film_tv/seriesluker').life_position_ref, { badge_id: 'film_tv', id: 'seriesluker', label: 'Seriesluker' });
assert.equal(lifeWorldByKey.get('film_tv/seriesluker').role_scope, 'film_tv_seriesluker');
assert.deepEqual(lifeWorldByKey.get('filosofi/lesesirkelmenneske').life_position_ref, { badge_id: 'filosofi', id: 'lesesirkelmenneske', label: 'Lesesirkelmenneske' });
assert.equal(lifeWorldByKey.get('filosofi/lesesirkelmenneske').role_scope, 'filosofi_lesesirkelmenneske');
assert.deepEqual(lifeWorldByKey.get('filosofi/livsgrubler').life_position_ref, { badge_id: 'filosofi', id: 'livsgrubler', label: 'Livsgrubler' });
assert.equal(lifeWorldByKey.get('filosofi/livsgrubler').role_scope, 'filosofi_livsgrubler');
assert.deepEqual(lifeWorldByKey.get('helse/evidensleser').life_position_ref, { badge_id: 'helse', id: 'evidensleser', label: 'Evidensleser' });
assert.equal(lifeWorldByKey.get('helse/evidensleser').role_scope, 'helse_evidensleser');
assert.deepEqual(lifeWorldByKey.get('helse/folkehelseblikk').life_position_ref, { badge_id: 'helse', id: 'folkehelseblikk', label: 'Folkehelseblikk' });
assert.equal(lifeWorldByKey.get('helse/folkehelseblikk').role_scope, 'helse_folkehelseblikk');
assert.deepEqual(lifeWorldByKey.get('helse/helseutforsker').life_position_ref, { badge_id: 'helse', id: 'helseutforsker', label: 'Helseutforsker' });
assert.equal(lifeWorldByKey.get('helse/helseutforsker').role_scope, 'helse_helseutforsker');
assert.deepEqual(lifeWorldByKey.get('helse/omsorgsetiker').life_position_ref, { badge_id: 'helse', id: 'omsorgsetiker', label: 'Omsorgsetiker' });
assert.equal(lifeWorldByKey.get('helse/omsorgsetiker').role_scope, 'helse_omsorgsetiker');
assert.deepEqual(lifeWorldByKey.get('historie/arkivrotte').life_position_ref, { badge_id: 'historie', id: 'arkivrotte', label: 'Arkivrotte' });
assert.equal(lifeWorldByKey.get('historie/arkivrotte').role_scope, 'historie_arkivrotte');
assert.deepEqual(lifeWorldByKey.get('historie/lokalhistoriker').life_position_ref, { badge_id: 'historie', id: 'lokalhistoriker', label: 'Lokalhistoriker' });
assert.equal(lifeWorldByKey.get('historie/lokalhistoriker').role_scope, 'historie_lokalhistoriker');
assert.deepEqual(lifeWorldByKey.get('kunst/ateliermenneske').life_position_ref, { badge_id: 'kunst', id: 'ateliermenneske', label: 'Ateliermenneske' });
assert.equal(lifeWorldByKey.get('kunst/ateliermenneske').role_scope, 'kunst_ateliermenneske');
assert.deepEqual(lifeWorldByKey.get('kunst/gatekunstjeger').life_position_ref, { badge_id: 'kunst', id: 'gatekunstjeger', label: 'Gatekunstjeger' });
assert.equal(lifeWorldByKey.get('kunst/gatekunstjeger').role_scope, 'kunst_gatekunstjeger');
assert.deepEqual(lifeWorldByKey.get('kunst/vernissagegjenger').life_position_ref, { badge_id: 'kunst', id: 'vernissagegjenger', label: 'Vernissagegjenger' });
assert.equal(lifeWorldByKey.get('kunst/vernissagegjenger').role_scope, 'kunst_vernissagegjenger');
assert.deepEqual(lifeWorldByKey.get('litteratur/biblioteksvanker').life_position_ref, { badge_id: 'litteratur', id: 'biblioteksvanker', label: 'Biblioteksvanker' });
assert.equal(lifeWorldByKey.get('litteratur/biblioteksvanker').role_scope, 'litteratur_biblioteksvanker');
assert.deepEqual(lifeWorldByKey.get('litteratur/bokklubbmenneske').life_position_ref, { badge_id: 'litteratur', id: 'bokklubbmenneske', label: 'Bokklubbmenneske' });
assert.equal(lifeWorldByKey.get('litteratur/bokklubbmenneske').role_scope, 'litteratur_bokklubbmenneske');
assert.deepEqual(lifeWorldByKey.get('litteratur/bokorm').life_position_ref, { badge_id: 'litteratur', id: 'bokorm', label: 'Bokorm' });
assert.equal(lifeWorldByKey.get('litteratur/bokorm').role_scope, 'litteratur_bokorm');
assert.deepEqual(lifeWorldByKey.get('litteratur/smaforlagsnerd').life_position_ref, { badge_id: 'litteratur', id: 'smaforlagsnerd', label: 'Småforlagsnerd' });
assert.equal(lifeWorldByKey.get('litteratur/smaforlagsnerd').role_scope, 'litteratur_smaforlagsnerd');
assert.deepEqual(lifeWorldByKey.get('media/kommentarfeltveteran').life_position_ref, { badge_id: 'media', id: 'kommentarfeltveteran', label: 'Kommentarfeltveteran' });
assert.equal(lifeWorldByKey.get('media/kommentarfeltveteran').role_scope, 'media_kommentarfeltveteran');
assert.deepEqual(lifeWorldByKey.get('media/nyhetsjunkie').life_position_ref, { badge_id: 'media', id: 'nyhetsjunkie', label: 'Nyhetsjunkie' });
assert.equal(lifeWorldByKey.get('media/nyhetsjunkie').role_scope, 'media_nyhetsjunkie');
assert.deepEqual(lifeWorldByKey.get('media/podkastsluker').life_position_ref, { badge_id: 'media', id: 'podkastsluker', label: 'Podkastsluker' });
assert.equal(lifeWorldByKey.get('media/podkastsluker').role_scope, 'media_podkastsluker');
assert.deepEqual(lifeWorldByKey.get('musikk/konsertgjenger').life_position_ref, { badge_id: 'musikk', id: 'konsertgjenger', label: 'Konsertgjenger' });
assert.equal(lifeWorldByKey.get('musikk/konsertgjenger').role_scope, 'musikk_konsertgjenger');
assert.deepEqual(lifeWorldByKey.get('musikk/musikknerd').life_position_ref, { badge_id: 'musikk', id: 'musikknerd', label: 'Musikknerd' });
assert.equal(lifeWorldByKey.get('musikk/musikknerd').role_scope, 'musikk_musikknerd');
assert.deepEqual(lifeWorldByKey.get('musikk/plategraver').life_position_ref, { badge_id: 'musikk', id: 'plategraver', label: 'Plategraver' });
assert.equal(lifeWorldByKey.get('musikk/plategraver').role_scope, 'musikk_plategraver');
assert.deepEqual(lifeWorldByKey.get('naeringsliv/grunderdrommer').life_position_ref, { badge_id: 'naeringsliv', id: 'grunderdrommer', label: 'Gründerdrømmer' });
assert.equal(lifeWorldByKey.get('naeringsliv/grunderdrommer').role_scope, 'naeringsliv_grunderdrommer');
assert.deepEqual(lifeWorldByKey.get('naeringsliv/pendler').life_position_ref, { badge_id: 'naeringsliv', id: 'pendler', label: 'Pendler' });
assert.equal(lifeWorldByKey.get('naeringsliv/pendler').role_scope, 'naeringsliv_pendler');
assert.deepEqual(lifeWorldByKey.get('naeringsliv/smasparer').life_position_ref, { badge_id: 'naeringsliv', id: 'smasparer', label: 'Småsparer' });
assert.equal(lifeWorldByKey.get('naeringsliv/smasparer').role_scope, 'naeringsliv_smasparer');
assert.deepEqual(lifeWorldByKey.get('natur/fuglekikker').life_position_ref, { badge_id: 'natur', id: 'fuglekikker', label: 'Fuglekikker' });
assert.equal(lifeWorldByKey.get('natur/fuglekikker').role_scope, 'natur_fuglekikker');
assert.deepEqual(lifeWorldByKey.get('natur/sanker').life_position_ref, { badge_id: 'natur', id: 'sanker', label: 'Sanker' });
assert.equal(lifeWorldByKey.get('natur/sanker').role_scope, 'natur_sanker');
assert.deepEqual(lifeWorldByKey.get('natur/turgaer').life_position_ref, { badge_id: 'natur', id: 'turgaer', label: 'Turgåer' });
assert.equal(lifeWorldByKey.get('natur/turgaer').role_scope, 'natur_turgaer');
assert.deepEqual(lifeWorldByKey.get('politikk/grasrotbygger').life_position_ref, { badge_id: 'politikk', id: 'grasrotbygger', label: 'Grasrotbygger' });
assert.equal(lifeWorldByKey.get('politikk/grasrotbygger').role_scope, 'politikk_grasrotbygger');
assert.deepEqual(lifeWorldByKey.get('politikk/kampanjemenneske').life_position_ref, { badge_id: 'politikk', id: 'kampanjemenneske', label: 'Kampanjemenneske' });
assert.equal(lifeWorldByKey.get('politikk/kampanjemenneske').role_scope, 'politikk_kampanjemenneske');
assert.deepEqual(lifeWorldByKey.get('politikk/motesliter').life_position_ref, { badge_id: 'politikk', id: 'motesliter', label: 'Møtesliter' });
assert.equal(lifeWorldByKey.get('politikk/motesliter').role_scope, 'politikk_motesliter');
assert.deepEqual(lifeWorldByKey.get('politikk/organisasjonsmenneske').life_position_ref, { badge_id: 'politikk', id: 'organisasjonsmenneske', label: 'Organisasjonsmenneske' });
assert.equal(lifeWorldByKey.get('politikk/organisasjonsmenneske').role_scope, 'politikk_organisasjonsmenneske');
assert.deepEqual(lifeWorldByKey.get('psykologi/monsterjeger').life_position_ref, { badge_id: 'psykologi', id: 'monsterjeger', label: 'Mønsterjeger' });
assert.equal(lifeWorldByKey.get('psykologi/monsterjeger').role_scope, 'psykologi_monsterjeger');
assert.deepEqual(lifeWorldByKey.get('psykologi/psykologientusiast').life_position_ref, { badge_id: 'psykologi', id: 'psykologientusiast', label: 'Psykologientusiast' });
assert.equal(lifeWorldByKey.get('psykologi/psykologientusiast').role_scope, 'psykologi_psykologientusiast');
assert.deepEqual(lifeWorldByKey.get('psykologi/relasjonsbygger').life_position_ref, { badge_id: 'psykologi', id: 'relasjonsbygger', label: 'Relasjonsbygger' });
assert.equal(lifeWorldByKey.get('psykologi/relasjonsbygger').role_scope, 'psykologi_relasjonsbygger');
assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 150, career_role_worlds: 85, life_position_role_worlds: 65 });
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
  life_position_role_worlds: 65,
  total_role_worlds: 150,
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

console.log('civication non-career role taxonomy ok: 199 selectable life positions / 85 career Role Worlds + 65 life-position worlds / layers remain separate');
