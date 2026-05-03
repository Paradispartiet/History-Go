#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const category = 'naeringsliv';

const roles = [
  {
    roleScope: 'controller',
    roleId: 'naer_controller',
    title: 'Controller',
    requiredFamilies: [
      'controller_intro_v2',
      'avstemming_og_rapport',
      'prognose_og_budsjett',
      'avvik_og_forklaring',
      'etikk_og_presisjon',
      'tall_og_tillit',
      'controller_identitet',
      'rapportfrist_og_revisjon'
    ],
    requiredCompetenceAxes: [
      'avviksanalyse',
      'internkontroll',
      'driftsforstaelse',
      'prognosearbeid',
      'rapportetikk'
    ],
    requiredProblems: [
      'det_pene_tallet',
      'den_tomme_kommentaren',
      'den_muntlige_forklaringen',
      'kontroll_som_frykt'
    ]
  },
  {
    roleScope: 'finansanalytiker',
    roleId: 'naer_finansanalytiker',
    title: 'Finansanalytiker',
    requiredFamilies: [
      'finansanalytiker_intro_v2',
      'modell_og_antakelser',
      'marked_og_sammenligning',
      'scenario_og_risiko',
      'anbefaling_og_usikkerhet',
      'konklusjon_og_integritet',
      'kapitalfortelling',
      'analytiker_identitet',
      'markedsnyhet_og_presentasjon'
    ],
    requiredCompetenceAxes: [
      'datakritikk',
      'finansiell_modellering',
      'verdsettelse',
      'risikoformidling',
      'metodeintegritet'
    ],
    requiredProblems: [
      'den_umerkede_antakelsen',
      'det_for_pene_basecaset',
      'peergruppen_som_pynt',
      'nedsiden_som_fotnote',
      'modellen_som_salg'
    ]
  },
  {
    roleScope: 'okonomi_og_finanssjef',
    roleId: 'naer_okonomi_og_finanssjef',
    title: 'Økonomi- og finanssjef',
    requiredFamilies: [
      'okonomi_og_finanssjef_intro_v2',
      'budsjett_og_prioritering',
      'likviditet_og_kapital',
      'styre_og_rapportering',
      'team_og_kontroll',
      'finanssjef_identitet',
      'bank_og_covenant'
    ],
    requiredCompetenceAxes: [
      'budsjettledelse',
      'likviditetsstyring',
      'kapitalprioritering',
      'styrekommunikasjon',
      'okonomiledelse'
    ],
    requiredProblems: [
      'det_offensive_budsjettet',
      'den_pene_resultatfortellingen',
      'styrepakken_uten_risiko',
      'teamet_som_blir_skviset'
    ]
  },
  {
    roleScope: 'finansdirektor',
    roleId: 'naer_finansdirektor',
    title: 'Finansdirektør',
    requiredFamilies: [
      'finansdirektor_intro_v2',
      'kapitalstruktur_og_finansiering',
      'styre_og_eiere',
      'bank_og_refinansiering',
      'oppkjop_og_investering',
      'finansdirektor_identitet'
    ],
    requiredCompetenceAxes: [
      'kapitalstruktur',
      'finansiering_og_bank',
      'styre_og_eierkommunikasjon',
      'strategisk_risiko',
      'm_a_og_investering'
    ],
    requiredProblems: [
      'den_finansierte_overmodigheten',
      'covenant_som_fotnote',
      'styrepakken_som_salgsdokument',
      'oppkjopets_prestisje'
    ]
  }
];

function readJson(relativePath) {
  const full = path.join(root, relativePath);
  assert(fs.existsSync(full), `Missing file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function ids(list) {
  return new Set((Array.isArray(list) ? list : []).map(item => String(item?.id || '').trim()).filter(Boolean));
}

function nonEmptyArray(value, label) {
  assert(Array.isArray(value) && value.length > 0, `${label} must be a non-empty array`);
}

function collectMailFamilyIds(roleScope) {
  const base = `data/Civication/mailFamilies/${category}`;
  const files = [
    `${base}/job/${roleScope}_intro_v2.json`,
    `${base}/job/${roleScope}_job.json`,
    `${base}/conflict/${roleScope}_conflict.json`,
    `${base}/story/${roleScope}_story.json`,
    `${base}/event/${roleScope}_event.json`
  ];

  const familyIds = new Set();
  for (const file of files) {
    const catalog = readJson(file);
    assert.strictEqual(catalog.category, category, `Wrong category in ${file}`);
    assert.strictEqual(catalog.role_scope, roleScope, `Wrong role_scope in ${file}`);
    nonEmptyArray(catalog.families, `${file}.families`);
    for (const family of catalog.families) {
      assert(family.id, `Family without id in ${file}`);
      familyIds.add(family.id);
    }
  }
  return familyIds;
}

function assertSetContainsAll(actualSet, expected, label) {
  const missing = expected.filter(id => !actualSet.has(id));
  assert.strictEqual(missing.length, 0, `${label} missing: ${missing.join(', ')}`);
}

for (const role of roles) {
  const roleModelPath = `data/Civication/roleModels/${category}/${role.roleScope}.json`;
  const planPath = `data/Civication/mailPlans/${category}/${role.roleScope}_plan.json`;

  const roleModel = readJson(roleModelPath);
  const plan = readJson(planPath);
  const actualFamilies = collectMailFamilyIds(role.roleScope);

  assert.strictEqual(roleModel.schema, 'civication_role_model_v1', `Wrong roleModel schema for ${role.roleScope}`);
  assert(Number(roleModel.version || 0) >= 2, `Expected version >=2 for enriched roleModel ${role.roleScope}`);
  assert.strictEqual(roleModel.category, category, `Wrong roleModel category for ${role.roleScope}`);
  assert.strictEqual(roleModel.role_scope, role.roleScope, `Wrong roleModel role_scope for ${role.roleScope}`);
  assert.strictEqual(roleModel.role_id, role.roleId, `Wrong roleModel role_id for ${role.roleScope}`);
  assert.strictEqual(roleModel.title, role.title, `Wrong title for ${role.roleScope}`);

  nonEmptyArray(roleModel.core_narrative, `${role.roleScope}.core_narrative`);
  nonEmptyArray(roleModel.education_basis, `${role.roleScope}.education_basis`);
  nonEmptyArray(roleModel.professional_description, `${role.roleScope}.professional_description`);
  nonEmptyArray(roleModel.challenges, `${role.roleScope}.challenges`);
  nonEmptyArray(roleModel.dilemmas, `${role.roleScope}.dilemmas`);
  nonEmptyArray(roleModel.competence_axes, `${role.roleScope}.competence_axes`);
  nonEmptyArray(roleModel.ideal_type_problems, `${role.roleScope}.ideal_type_problems`);
  nonEmptyArray(roleModel.mail_integration?.recommended_mail_families, `${role.roleScope}.mail_integration.recommended_mail_families`);

  assert.strictEqual(roleModel.mail_integration.role_scope, role.roleScope, `Wrong mail_integration.role_scope for ${role.roleScope}`);
  assert.strictEqual(roleModel.mail_integration.mail_profile, role.roleId, `Wrong mail_integration.mail_profile for ${role.roleScope}`);
  assert.strictEqual(roleModel.mail_integration.role_model_refs_supported, true, `role_model_refs_supported must be true for ${role.roleScope}`);

  const competenceAxisIds = ids(roleModel.competence_axes);
  const problemIds = ids(roleModel.ideal_type_problems);
  const recommendedFamilies = new Set(roleModel.mail_integration.recommended_mail_families);

  assertSetContainsAll(competenceAxisIds, role.requiredCompetenceAxes, `${role.roleScope}.competence_axes`);
  assertSetContainsAll(problemIds, role.requiredProblems, `${role.roleScope}.ideal_type_problems`);
  assertSetContainsAll(recommendedFamilies, role.requiredFamilies, `${role.roleScope}.recommended_mail_families`);
  assertSetContainsAll(actualFamilies, roleModel.mail_integration.recommended_mail_families, `${role.roleScope}.actual mailFamilies`);

  assert.strictEqual(plan.schema, 'civication_mail_plan_v1', `Wrong plan schema for ${role.roleScope}`);
  assert.strictEqual(plan.category, category, `Wrong plan category for ${role.roleScope}`);
  assert.strictEqual(plan.role_scope, role.roleScope, `Wrong plan role_scope for ${role.roleScope}`);

  const planFamilies = new Set();
  for (const step of plan.sequence || []) {
    for (const family of step.allowed_families || []) planFamilies.add(family);
  }
  assertSetContainsAll(recommendedFamilies, [...planFamilies], `${role.roleScope}.recommended families vs plan allowed_families`);
}

console.log('Finance Civication roleModel validation OK: controller, finansanalytiker, okonomi_og_finanssjef and finansdirektor roleModels match plans and mailFamilies.');
