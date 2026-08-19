#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POLICY_PATH = 'data/Civication/careerGameplayPolicy.json';
const MATRIX_PATH = 'data/Civication/careerGameplayMatrix.json';
const REPORT_PATH = 'reports/civication-career-gameplay-matrix.md';
const MAIL_TYPES = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const LEVEL_SCORE = { missing: 0, partial: 1, complete: 2 };

const roleAliases = new Map([
  ['by/arealplanlegger', 'by_radgiver_plan'],
  ['by/arkitekt', 'by_arkitekt'],
  ['by/prosjektleder_byutvikling', 'by_prosjektleder'],
  ['by/saksbehandler_plan_bygg', 'by_saksbehandler'],
  ['by/studentassistent', 'by_assistent'],
  ['naeringsliv/ekspeditor_butikkmedarbeider', 'ekspeditor'],
  ['naeringsliv/fagarbeider', 'arbeider'],
  ['naeringsliv/formann_arbeidsleder', 'formann'],
  ['naeringsliv/kapitalforvalter', 'mellomleder'],
  ['naeringsliv/okonomi_og_administrasjonsmedarbeider', 'administrasjonsmedarbeider'],
  ['sport/aktiv_utover', 'sport_utover'],
  ['sport/idrettslegende', 'sport_legende'],
  ['sport/kaptein', 'sport_kaptein'],
  ['sport/sportssjef', 'sport_sportsledelse'],
  ['sport/trener', 'sport_trener']
]);
const planAliases = new Map([
  ['naeringsliv/kapital_og_eierskap', 'mellomleder']
]);

function abs(rel) { return path.join(repoRoot, rel); }
function exists(rel) { return fs.existsSync(abs(rel)); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function walk(rel) {
  if (!exists(rel)) return [];
  return fs.readdirSync(abs(rel), { withFileTypes: true }).flatMap((entry) => {
    const next = path.posix.join(rel, entry.name);
    return entry.isDirectory() ? walk(next) : [next];
  });
}
function uniq(values) { return [...new Set(values.filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b, 'nb')); }
function asArray(value) { return Array.isArray(value) ? value : (value ? [value] : []); }
function nonEmpty(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value && typeof value === 'object' && Object.keys(value).length);
}
function flattenObjects(value, out = []) {
  if (Array.isArray(value)) value.forEach((item) => flattenObjects(item, out));
  else if (value && typeof value === 'object') {
    out.push(value);
    Object.values(value).forEach((item) => flattenObjects(item, out));
  }
  return out;
}
function mailCount(rel) {
  if (!exists(rel)) return 0;
  const objects = flattenObjects(readJson(rel));
  return objects.filter((item) => item && item.id && (Array.isArray(item.choices) || item.subject || item.title)).length;
}
function evidence(level, paths = [], note = '') {
  return { level, evidence: uniq(paths), note };
}
function component(level, paths, note) {
  if (!Object.hasOwn(LEVEL_SCORE, level)) throw new Error(`Unknown component level: ${level}`);
  return evidence(level, paths, note);
}
function matchesRoleText(text, values) {
  const lower = text.toLowerCase();
  return values.some((value) => {
    const needle = String(value || '').toLowerCase();
    if (!needle) return false;
    return lower.includes(`'${needle}'`) || lower.includes(`"${needle}"`) || lower.includes(`/${needle}`) || lower.includes(`${needle}_`);
  });
}
function normalizeCareerRules(raw) {
  return Array.isArray(raw) ? { careers: raw, global_rules: {} } : raw;
}
function applyOverlays(badges) {
  const indexPath = 'data/Civication/badgeCareerContracts/index.json';
  if (!exists(indexPath)) return;
  for (const rel of readJson(indexPath).files || []) {
    if (!exists(rel)) continue;
    const overlay = readJson(rel);
    const badge = badges.get(String(overlay.badge_id || ''));
    if (!badge) continue;
    for (const patch of overlay.tiers || []) {
      const tier = (badge.tiers || []).find((candidate) => candidate.label === patch.label);
      if (!tier) continue;
      for (const key of ['life_position', 'career_offer', 'career_unlock']) if (patch[key]) tier[key] = patch[key];
    }
  }
}

const policy = readJson(POLICY_PATH);
const contractComponents = policy.contract_components || [];
const worlds = new Map();
function upsert(category, roleScope, source, extra = {}) {
  category = String(category || '').trim();
  roleScope = String(roleScope || '').trim();
  if (!category || !roleScope) return null;
  const key = `${category}/${roleScope}`;
  if (!worlds.has(key)) worlds.set(key, { key, category, role_scope: roleScope, declared_by: [], badge_titles: [], role_ids: [] });
  const world = worlds.get(key);
  if (source) world.declared_by.push(source);
  world.badge_titles.push(...(extra.badge_titles || []));
  world.role_ids.push(...(extra.role_ids || []));
  return world;
}

const mappingData = readJson('data/Civication/badgeRoleMappings.json');
for (const [category, career] of Object.entries(mappingData.careers || {})) {
  for (const [scope, role] of Object.entries(career.roles || {})) {
    upsert(category, scope, 'badgeRoleMappings', { badge_titles: role.badge_titles, role_ids: [role.role_id] });
  }
}

const grammarFiles = walk('data/Civication/workGrammars').filter((rel) => rel.endsWith('.json'));
const grammars = new Map();
const grammarRows = [];
for (const rel of grammarFiles) {
  const json = readJson(rel);
  const category = String(json.category || rel.split('/').at(-2));
  const scope = String(json.role_scope || path.basename(rel, '.json'));
  const binding = json.badge_binding || {};
  grammarRows.push({
    key: `${category}/${scope}`,
    category,
    scope,
    rel,
    json,
    badge_titles: [...(binding.badge_titles || []), binding.tier_label],
    role_ids: [json.role_id].filter(Boolean)
  });
}

const plans = new Map();
for (const rel of walk('data/Civication/mailPlans').filter((file) => file.endsWith('.json'))) {
  const json = readJson(rel);
  const category = String(json.category || rel.split('/').at(-2));
  const rawScope = String(json.role_scope || path.basename(rel, '.json').replace(/_plan$/, ''));
  const scope = planAliases.get(`${category}/${rawScope}`) || rawScope;
  const key = `${category}/${scope}`;
  plans.set(key, { rel, json });
  upsert(category, scope, 'mailPlan', { role_ids: [json.role_id] });
}

const practiceRegistry = readJson('data/Civication/praksisfortellinger_registry.json');
const practiceByKey = new Map();
for (const role of practiceRegistry.roles || []) {
  const category = String(role.domain || role.category || '');
  const scope = String(role.role_scope || role.role_id || '');
  const key = `${category}/${scope}`;
  practiceByKey.set(key, role);
  upsert(category, scope, 'practiceRegistry', { role_ids: [role.role_id] });
}

const lifeManifest = readJson('data/Civication/lifestory/manifest.json');
const lifeByKey = new Map();
for (const [lifeId, role] of Object.entries(lifeManifest.roles || {})) {
  if (role.system_role === true) continue;
  const category = String(role.badge_id || role.legacy_namespace || '');
  const scope = String(role.role_scope || lifeId);
  const key = `${category}/${scope}`;
  lifeByKey.set(key, { id: lifeId, ...role });
  upsert(category, scope, role.content_only ? 'lifeStoryContentOnly' : 'lifeStory', { badge_titles: role.badge_titles, role_ids: [lifeId] });
}

// FWG scopes can be broader production blueprints than the runtime scopes that
// already own mail plans. Attach those blueprints to matching runtime worlds by
// exact Badge-title overlap instead of counting the same work twice.
const sharedGrammarsByKey = new Map();
for (const row of grammarRows) {
  if (worlds.has(row.key)) {
    grammars.set(row.key, row);
    const world = worlds.get(row.key);
    world.declared_by.push('workGrammar');
    world.badge_titles.push(...row.badge_titles);
    world.role_ids.push(...row.role_ids);
    continue;
  }
  const rowTitles = new Set(row.badge_titles.filter(Boolean).map(String));
  const matches = [...worlds.values()].filter((world) => world.category === row.category && world.badge_titles.some((title) => rowTitles.has(String(title))));
  if (matches.length) {
    for (const world of matches) {
      if (!sharedGrammarsByKey.has(world.key)) sharedGrammarsByKey.set(world.key, []);
      sharedGrammarsByKey.get(world.key).push(row);
      world.declared_by.push('sharedWorkGrammar');
    }
    continue;
  }
  grammars.set(row.key, row);
  upsert(row.category, row.scope, 'workGrammar', { badge_titles: row.badge_titles, role_ids: row.role_ids });
}

const modelManifest = readJson('data/Civication/roleModels/manifest.json');
const missingModelFiles = (modelManifest.files || []).filter((rel) => !exists(rel));
if (missingModelFiles.length) throw new Error(`roleModels manifest has missing files: ${missingModelFiles.join(', ')}`);
const models = (modelManifest.files || []).map((rel) => ({ rel, json: readJson(rel) }));

const testFiles = walk('tests').filter((rel) => /^tests\/civication-.*\.test\.js$/.test(rel));
const testTexts = testFiles.map((rel) => ({ rel, text: fs.readFileSync(abs(rel), 'utf8') }));
const globalRuntimeTests = [
  'tests/civication-job-offer-eligibility-ui.test.js',
  'tests/civication-daily-gameplay-loop.test.js',
  'tests/civication-day-roll-new-day.test.js',
  'tests/civication-day-progression-day-end.test.js',
  'tests/civication-economy-snapshot.test.js',
  'tests/civication-career-outcomes.test.js'
].filter(exists);

const badgeIndex = readJson('data/badges/index.json');
const badges = new Map();
for (const rel of badgeIndex.files || []) {
  const badge = readJson(rel);
  badges.set(String(badge.id || ''), badge);
}
applyOverlays(badges);
const careerAuditPolicy = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerPolicies = new Map();
for (const [badgeId, rows] of Object.entries(careerAuditPolicy.badges || {})) {
  for (const raw of rows || []) {
    const [title, kind, offer_policy, action, qualification_ids = []] = raw;
    careerPolicies.set(`${badgeId}/${title}`, { kind, offer_policy, action, qualification_ids });
  }
}
const careerRulesRaw = normalizeCareerRules(readJson('data/Civication/hg_careers.json'));
const careerRules = new Map((careerRulesRaw.careers || []).map((career) => [String(career.career_id || ''), career]));
const knowledgeRequirements = readJson('data/Civication/jobKnowledgeRequirements.json');

for (const world of worlds.values()) {
  world.declared_by = uniq(world.declared_by);
  world.badge_titles = uniq(world.badge_titles);
  world.role_ids = uniq(world.role_ids);
  const grammar = grammars.get(world.key) || null;
  const sharedGrammars = sharedGrammarsByKey.get(world.key) || [];
  const grammarEvidence = grammar ? [grammar] : sharedGrammars;
  const grammarPaths = grammarEvidence.map((item) => item.rel);
  const plan = plans.get(world.key) || null;
  const practice = practiceByKey.get(world.key) || null;
  const life = lifeByKey.get(world.key) || null;
  const lifePaths = life ? uniq([life.role, life.threads, life.scenes]).filter(exists) : [];
  const lifeObjects = lifePaths.flatMap((rel) => flattenObjects(readJson(rel)));

  const matchingModels = models.filter(({ rel, json }) => {
    const category = String(json.category || rel.split('/').at(-2));
    if (category !== world.category) return false;
    const slug = path.basename(rel, '.json');
    const scope = roleAliases.get(`${category}/${slug}`) || String(json.role_scope || slug);
    return scope === world.role_scope || world.role_ids.includes(String(json.role_id || ''));
  });
  for (const model of matchingModels) {
    world.role_ids.push(model.json.role_id);
    const title = String(model.json.title || '');
    if ((badges.get(world.category)?.tiers || []).some((tier) => tier.label === title)) world.badge_titles.push(title);
  }
  world.role_ids = uniq(world.role_ids);
  world.badge_titles = uniq(world.badge_titles);
  const roleTests = testTexts.filter(({ rel, text }) => {
    const fileSlug = path.basename(rel).toLowerCase();
    const values = [world.role_scope, ...world.role_ids];
    return values.some((value) => value && fileSlug.includes(String(value).toLowerCase())) || matchesRoleText(text, values);
  }).map(({ rel }) => rel);

  const mailFamilies = {};
  for (const type of MAIL_TYPES) {
    const rel = `data/Civication/mailFamilies/${world.category}/${type}/${world.role_scope}_${type}.json`;
    const count = mailCount(rel);
    mailFamilies[type] = { path: exists(rel) ? rel : null, count };
  }
  const availableMailTypes = MAIL_TYPES.filter((type) => mailFamilies[type].count > 0);
  const grammarJson = grammar?.json || sharedGrammars[0]?.json || {};
  const planJson = plan?.json || {};
  const modelJsons = matchingModels.map((model) => model.json);
  const modelPaths = matchingModels.map((model) => model.rel);
  const practiceWeeks = uniq((practice?.packages || []).map((item) => item.week).filter(Number.isFinite));
  const practiceTests = uniq([...(practice?.flow_tests || []), ...(practice?.packages || []).map((item) => item.test_file)]).filter(exists);
  const allRoleTests = uniq([...roleTests, ...practiceTests]);
  const allObjects = flattenObjects({ grammar: grammarJson, plan: planJson, models: modelJsons });
  const hasChoiceAxes = allObjects.some((item) => item.choice_axis || item.consequence_axis || item.required_axes || item.quality_axes || item.competence_axes);
  const storyCount = Array.isArray(grammarJson.practice_stories) ? grammarJson.practice_stories.length : 0;
  const storyWorld = grammarJson.story_world || grammarJson.work_world || {};
  const relatedPeople = [
    ...(grammarJson.actor_grammar || []),
    ...(storyWorld.relationship_web || []),
    ...modelJsons.flatMap((model) => model.related_people || model.person_map || []),
    ...lifeObjects.filter((item) => item.person_id || item.personer || item.people || item.npc_id)
  ];
  const relatedPlaces = [
    ...(grammarJson.place_grammar || []),
    ...modelJsons.flatMap((model) => model.related_places || []),
    ...modelJsons.flatMap((model) => asArray(model.work_life?.workplaces || model.work_life?.workplace_types || model.work_life?.places)),
    ...(grammarJson.practice_stories || []).filter((story) => story.place_id),
    ...lifeObjects.filter((item) => item.place_id || item.workplace || item.location_id || item.sted)
  ];
  const knowledgeContent = nonEmpty(grammarJson.knowledge_dependencies) || nonEmpty(grammarJson.fag_bindings) || modelJsons.some((model) => nonEmpty(model.required_knowledge));
  const qualityContent = nonEmpty(grammarJson.quality_axes) || nonEmpty(grammarJson.mail_generation_contract?.required_axes) || modelJsons.some((model) => nonEmpty(model.competence_axes)) || nonEmpty(practice?.expected_signals);
  const authorityContent = nonEmpty(grammarJson.authority_boundary) || modelJsons.some((model) => nonEmpty(model.authority_boundary));
  const careerPaths = modelJsons.map((model) => model.career_path).filter(Boolean);
  const hasProgressionContent = nonEmpty(grammarJson.badge_binding?.progression_to) || careerPaths.some((item) => nonEmpty(item.progression_to) || nonEmpty(item.possible_promotions));
  const hasExitContent = careerPaths.some((item) => nonEmpty(item.possible_exits)) || nonEmpty(grammarJson.badge_binding?.exit_to);
  const outcomes = planJson.outcome_rules || {};
  const outcomeKeys = Object.keys(outcomes);
  const hasPositiveOutcome = outcomeKeys.some((key) => /promot|master|success|advance/i.test(key));
  const hasNegativeOutcome = outcomeKeys.some((key) => /fire|risk|stagn|fail|collapse/i.test(key));

  const badge = badges.get(world.category);
  const badgeTiers = badge?.tiers || [];
  const tierRows = world.badge_titles.map((title) => {
    let index = badgeTiers.findIndex((tier) => String(tier.label || '') === title);
    if (index < 0) {
      index = badgeTiers.findIndex((tier) => {
        const candidate = tier?.career_unlock || tier?.career_offer || null;
        return String(candidate?.title || '') === title &&
          (!candidate?.role_scope || String(candidate.role_scope) === world.role_scope);
      });
    }
    const tier = index >= 0 ? badgeTiers[index] : null;
    const contract = tier?.career_unlock || tier?.career_offer || null;
    const audit = careerPolicies.get(`${world.category}/${title}`) || null;
    const policyName = String(contract?.policy || audit?.offer_policy || '');
    const salaryBand = Number(contract?.salary_tier);
    const salaryKey = String(Number.isInteger(salaryBand) && salaryBand > 0 ? salaryBand : index + 1);
    const salaryMap = careerRules.get(world.category)?.economy?.salary_by_tier || {};
    return {
      title,
      tier_index: index >= 0 ? index + 1 : null,
      offer_policy: policyName || null,
      entry_valid: index >= 0 && !['not_job', 'review_required'].includes(policyName),
      gate_explicit: ['direct', ''].includes(policyName) || Boolean(contract && contract.policy === policyName),
      salary_key: index >= 0 ? salaryKey : null,
      salary_defined: index >= 0 && Object.hasOwn(salaryMap, salaryKey)
    };
  });
  const validEntryRows = tierRows.filter((row) => row.entry_valid);
  const exactSalaryRows = validEntryRows.filter((row) => row.salary_defined);
  const categorySalary = nonEmpty(careerRules.get(world.category)?.economy?.salary_by_tier);
  const categoryKnowledge = knowledgeRequirements.categories?.[world.category] || null;
  const hasPlan = Boolean(plan && Array.isArray(planJson.sequence) && planJson.sequence.length);
  const hasJobMails = mailFamilies.job.count > 0;
  const hasRoleRuntimeTest = allRoleTests.length > 0;
  const twoWeek = practiceWeeks.includes('1') && practiceWeeks.includes('2');

  const components = {};
  components.entry = validEntryRows.length && validEntryRows.every((row) => row.gate_explicit)
    ? component('complete', ['data/Civication/badgeCareerAuditPolicy.json', 'data/Civication/badgeRoleMappings.json', ...globalRuntimeTests.slice(0, 1)], `${validEntryRows.length} linked career title(s) have an offer policy and gate.`)
    : (world.badge_titles.length ? component('partial', ['data/Civication/badgeCareerAuditPolicy.json'], 'Badge binding exists, but a complete offer/gate path is not proven for every linked title.') : component('missing', [], 'No canonical career title binding.'));
  components.day_one = hasPlan && hasRoleRuntimeTest && (nonEmpty(grammarJson.day_one_contract) || planJson.sequence.length >= 4)
    ? component('complete', [plan.rel, ...allRoleTests], 'Role plan and role-specific test prove a first playable day.')
    : (hasPlan || nonEmpty(grammarJson.day_one_contract) ? component('partial', [plan?.rel, ...grammarPaths], 'Day-one structure exists without a complete role-specific runtime proof.') : component('missing', [], 'No day-one structure.'));
  const loopContent = nonEmpty(grammarJson.work_loops) || nonEmpty(grammarJson.task_grammar) || nonEmpty(grammarJson.task_families);
  components.workday_loop = hasPlan && hasJobMails && hasRoleRuntimeTest && (loopContent || twoWeek)
    ? component('complete', [...grammarPaths, plan?.rel, mailFamilies.job.path, ...allRoleTests], 'Repeatable work content is connected to a tested plan.')
    : (hasPlan || hasJobMails || loopContent ? component('partial', [...grammarPaths, plan?.rel, mailFamilies.job.path], 'Work-loop content exists, but the complete repeatable runtime path is not proven.') : component('missing', [], 'No repeatable work loop.'));
  components.practice_stories = twoWeek
    ? component('complete', ['data/Civication/praksisfortellinger_registry.json', ...practiceTests], `${practiceWeeks.length} registered and tested practice weeks.`)
    : (storyCount || practiceWeeks.length ? component('partial', [...grammarPaths, 'data/Civication/praksisfortellinger_registry.json'], `${storyCount} FWG stories and ${practiceWeeks.length} registered practice week(s).`) : component('missing', [], 'No structured practice stories.'));
  components.people = relatedPeople.length && mailFamilies.people.count
    ? component('complete', [...grammarPaths, ...modelPaths, ...lifePaths, mailFamilies.people.path], 'Named/typed work relationships are used by people mails.')
    : (relatedPeople.length || mailFamilies.people.count ? component('partial', [...grammarPaths, ...modelPaths, ...lifePaths, mailFamilies.people.path], 'People content exists on only one side of the content/runtime boundary.') : component('missing', [], 'No work-world people layer.'));
  components.places = relatedPlaces.length
    ? component('complete', [...grammarPaths, ...modelPaths, ...lifePaths], `${relatedPlaces.length} place/working-surface declarations.`)
    : component('missing', [], 'No concrete workplace or work surface declaration.');
  const requiredTypes = grammarJson.mail_generation_contract?.required_mail_types || MAIL_TYPES;
  const requiredMailComplete = hasPlan && requiredTypes.every((type) => mailFamilies[type]?.count > 0);
  const practiceMailComplete = hasPlan && twoWeek && ['job', 'people', 'conflict', 'story', 'event'].every((type) => mailFamilies[type]?.count > 0);
  components.mail = requiredMailComplete || practiceMailComplete
    ? component('complete', [plan?.rel, ...availableMailTypes.map((type) => mailFamilies[type].path), ...practiceTests], `${availableMailTypes.length}/${MAIL_TYPES.length} standard mail types plus tested plan/practice coverage.`)
    : (hasPlan || availableMailTypes.length ? component('partial', [plan?.rel, ...availableMailTypes.map((type) => mailFamilies[type].path)], `${availableMailTypes.length}/${MAIL_TYPES.length} standard mail types.`) : component('missing', [], 'No role mail/event generation.'));
  components.knowledge = knowledgeContent && (mailFamilies.knowledge.count || categoryKnowledge)
    ? component('complete', [...grammarPaths, ...modelPaths, mailFamilies.knowledge.path, categoryKnowledge ? 'data/Civication/jobKnowledgeRequirements.json' : null], 'Knowledge content is connected to a mail or job-gate surface.')
    : (knowledgeContent || mailFamilies.knowledge.count || categoryKnowledge ? component('partial', [...grammarPaths, ...modelPaths, mailFamilies.knowledge.path, categoryKnowledge ? 'data/Civication/jobKnowledgeRequirements.json' : null], 'Knowledge exists, but its gameplay application is incomplete.') : component('missing', [], 'No functional knowledge layer.'));
  components.quality_axes = qualityContent && hasChoiceAxes
    ? component('complete', [...grammarPaths, ...modelPaths, practice ? 'data/Civication/praksisfortellinger_registry.json' : null], 'Quality/competence axes are declared and connected to choice/consequence fields.')
    : (qualityContent || hasChoiceAxes ? component('partial', [...grammarPaths, ...modelPaths], 'Quality axes exist without a complete choice/consequence binding.') : component('missing', [], 'No quality axes.'));
  components.authority = authorityContent
    ? component('complete', [...grammarPaths, ...modelPaths], 'Explicit authority boundary exists.')
    : (grammarEvidence.length || matchingModels.length ? component('partial', [...grammarPaths, ...modelPaths], 'Role content exists, but authority is not an explicit machine-auditable boundary.') : component('missing', [], 'No authority/mandate model.'));
  const consequenceRuntime = (mailFamilies.consequence.count && mailFamilies.followup.count) || (twoWeek && practiceTests.length);
  components.consequences = consequenceRuntime && hasRoleRuntimeTest
    ? component('complete', [mailFamilies.consequence.path, mailFamilies.followup.path, ...allRoleTests], 'Later consequence/follow-up path is role-tested.')
    : (mailFamilies.consequence.count || mailFamilies.followup.count || twoWeek || outcomeKeys.length ? component('partial', [mailFamilies.consequence.path, mailFamilies.followup.path, plan?.rel, ...practiceTests], 'Consequence content exists without the full role-specific follow-up proof.') : component('missing', [], 'No consequence model.'));
  components.performance = hasPositiveOutcome && hasNegativeOutcome && hasRoleRuntimeTest
    ? component('complete', [plan?.rel, ...allRoleTests, 'tests/civication-career-outcomes.test.js'], 'Positive and negative outcomes are defined and role-tested.')
    : (outcomeKeys.length || nonEmpty(practice?.expected_signals) ? component('partial', [plan?.rel, practice ? 'data/Civication/praksisfortellinger_registry.json' : null], 'Performance signals/outcomes exist without a complete tested evaluation.') : component('missing', [], 'No performance evaluation.'));
  components.economy = validEntryRows.length && exactSalaryRows.length === validEntryRows.length
    ? component('complete', ['data/Civication/hg_careers.json', 'data/badges/index.json', 'tests/civication-economy-snapshot.test.js'], `Exact salary exists for all ${validEntryRows.length} linked career title(s).`)
    : (categorySalary ? component('partial', ['data/Civication/hg_careers.json'], `Category salary exists, but ${validEntryRows.length - exactSalaryRows.length} linked title(s) lack an exact salary entry.`) : component('missing', [], 'No salary rule.'));
  components.progression = hasProgressionContent && hasPositiveOutcome && hasRoleRuntimeTest
    ? component('complete', [...grammarPaths, ...modelPaths, plan?.rel, 'tests/civication-career-outcomes.test.js'], 'Career path and positive runtime outcome are both present.')
    : (hasProgressionContent || hasPositiveOutcome ? component('partial', [...grammarPaths, ...modelPaths, plan?.rel], 'Progression exists as content or outcome, not a complete transition path.') : component('missing', [], 'No progression path.'));
  components.exit = hasExitContent && hasNegativeOutcome && hasRoleRuntimeTest
    ? component('complete', [...modelPaths, plan?.rel, 'tests/civication-career-outcomes.test.js'], 'Exit destinations and negative runtime outcome are both present.')
    : (hasExitContent || hasNegativeOutcome ? component('partial', [...modelPaths, plan?.rel], 'Exit exists as content or outcome, not a complete transition path.') : component('missing', [], 'No exit/job-change path.'));

  const runtimeRequirements = policy.playable_requirements.runtime_gate_components || [];
  const runtimeGate = runtimeRequirements.every((name) => components[name]?.level === 'complete');
  const missingComponents = contractComponents.filter((name) => components[name]?.level === 'missing');
  const allComplete = contractComponents.every((name) => components[name]?.level === 'complete');
  const lifeComplete = Boolean(life && life.content_only !== true);
  const referenceDepth = Math.max(storyCount, twoWeek ? (practice?.packages || []).reduce((sum, item) => sum + Number(item.expected_job_threads || 0) + Number(item.expected_private_threads || 0), 0) : 0);
  let status;
  if (!hasPlan && !availableMailTypes.length) status = 'architecture_only';
  else if (runtimeGate && !missingComponents.length) status = 'playable';
  else status = 'partial';
  if (allComplete && lifeComplete && twoWeek && referenceDepth >= Number(policy.reference_requirements.minimum_practice_story_count || 12)) status = 'reference_complete';

  world.status = status;
  world.role_ids = uniq(world.role_ids);
  world.badge_titles = uniq(world.badge_titles);
  world.artifacts = {
    role_models: modelPaths,
    work_grammar: grammar?.rel || null,
    shared_work_grammars: sharedGrammars.map((item) => item.rel),
    mail_plan: plan?.rel || null,
    mail_families: Object.fromEntries(MAIL_TYPES.map((type) => [type, mailFamilies[type]])),
    role_tests: allRoleTests,
    life_story: life ? { id: life.id, content_only: life.content_only === true, paths: lifePaths } : null
  };
  world.audit = {
    components,
    runtime_gate: runtimeGate,
    missing_components: missingComponents,
    complete_components: contractComponents.filter((name) => components[name]?.level === 'complete'),
    practice_story_count: storyCount,
    practice_weeks: practiceWeeks,
    reference_depth: referenceDepth,
    life_story_complete: lifeComplete,
    salary: { linked_titles: validEntryRows.length, exact_titles: exactSalaryRows.length, rows: tierRows }
  };
}

const sortedWorlds = [...worlds.values()].sort((a, b) => a.category.localeCompare(b.category) || a.role_scope.localeCompare(b.role_scope));
const duplicateKeys = sortedWorlds.map((world) => world.key).filter((key, index, all) => all.indexOf(key) !== index);
if (duplicateKeys.length) throw new Error(`Duplicate work worlds: ${uniq(duplicateKeys).join(', ')}`);
for (const world of sortedWorlds) {
  if (world.status === 'playable' && !world.audit.runtime_gate) throw new Error(`${world.key}: playable without runtime gate`);
  if (world.status === 'reference_complete' && (!world.audit.runtime_gate || !world.audit.life_story_complete || world.audit.complete_components.length !== contractComponents.length)) throw new Error(`${world.key}: invalid reference_complete classification`);
}

const counts = Object.fromEntries((policy.status_order || []).map((status) => [status, sortedWorlds.filter((world) => world.status === status).length]));
const componentDebt = Object.fromEntries(contractComponents.map((name) => [name, {
  complete: sortedWorlds.filter((world) => world.audit.components[name].level === 'complete').length,
  partial: sortedWorlds.filter((world) => world.audit.components[name].level === 'partial').length,
  missing: sortedWorlds.filter((world) => world.audit.components[name].level === 'missing').length
}]));
const matrix = {
  schema: 'civication_career_gameplay_matrix_v1',
  version: 1,
  generated_by: 'scripts/audit-civication-career-gameplay.mjs',
  policy: POLICY_PATH,
  summary: {
    work_worlds: sortedWorlds.length,
    statuses: counts,
    runtime_gate_pass: sortedWorlds.filter((world) => world.audit.runtime_gate).length,
    life_story_complete: sortedWorlds.filter((world) => world.audit.life_story_complete).length,
    component_debt: componentDebt
  },
  worlds: sortedWorlds
};

function esc(value) { return String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', '<br>'); }
function mdReport() {
  const lines = ['# Civication Career Gameplay Matrix', '', 'Generated by `node scripts/audit-civication-career-gameplay.mjs --write`. Canonical intent lives in `data/Civication/careerGameplayPolicy.json`.', '', '## Summary', ''];
  lines.push(`- Work worlds: **${matrix.summary.work_worlds}**`);
  for (const status of policy.status_order || []) lines.push(`- ${status}: **${counts[status] || 0}**`);
  lines.push(`- Runtime gameplay gate passed: **${matrix.summary.runtime_gate_pass}**`);
  lines.push(`- Active Life Story bindings: **${matrix.summary.life_story_complete}**`);
  lines.push('', '## Component debt', '', '| component | complete | partial | missing |', '| --- | ---: | ---: | ---: |');
  for (const name of contractComponents) {
    const debt = componentDebt[name];
    lines.push(`| ${name} | ${debt.complete} | ${debt.partial} | ${debt.missing} |`);
  }
  lines.push('', '## Pilot wave', '', '| work world | work type | current status | missing components |', '| --- | --- | --- | --- |');
  for (const pilot of policy.pilot_worlds || []) {
    const key = `${pilot.category}/${pilot.role_scope}`;
    const world = worlds.get(key);
    lines.push(`| ${esc(key)} | ${esc(pilot.work_type)} | ${esc(world?.status || 'missing_from_matrix')} | ${esc(world?.audit?.missing_components?.join(', ') || '—')} |`);
  }
  lines.push('', '## Reference-role audit', '', '| work world | status | runtime gate | components | practice weeks | Life Story |', '| --- | --- | --- | ---: | --- | --- |');
  for (const ref of policy.reference_roles || []) {
    const key = `${ref.category}/${ref.role_scope}`;
    const world = worlds.get(key);
    lines.push(`| ${esc(key)} | ${esc(world?.status || 'missing')} | ${world?.audit?.runtime_gate ? 'pass' : 'fail'} | ${world?.audit?.complete_components?.length || 0}/${contractComponents.length} | ${esc(world?.audit?.practice_weeks?.join(', ') || '—')} | ${world?.audit?.life_story_complete ? 'ja' : 'nei'} |`);
  }
  lines.push('', '## Global matrix', '', '| category | role_scope | status | gate | roleModel | FWG | plan | mail types | complete | partial | missing | Life Story |', '| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |');
  for (const world of sortedWorlds) {
    const levels = contractComponents.map((name) => world.audit.components[name].level);
    lines.push(`| ${esc(world.category)} | ${esc(world.role_scope)} | ${world.status} | ${world.audit.runtime_gate ? 'pass' : 'fail'} | ${world.artifacts.role_models.length ? 'ja' : 'nei'} | ${world.artifacts.work_grammar || world.artifacts.shared_work_grammars.length ? 'ja' : 'nei'} | ${world.artifacts.mail_plan ? 'ja' : 'nei'} | ${Object.values(world.artifacts.mail_families).filter((item) => item.count > 0).length}/${MAIL_TYPES.length} | ${levels.filter((level) => level === 'complete').length} | ${levels.filter((level) => level === 'partial').length} | ${esc(world.audit.missing_components.join(', ') || '—')} | ${world.audit.life_story_complete ? 'ja' : 'nei'} |`);
  }
  lines.push('', '## Interpretation', '', '- `architecture_only` is not an error: it names work worlds that have been designed but cannot yet drive a workday.', '- `partial` is intentionally broad and includes strong content packages whose full offer/day/consequence/salary path is not yet proven.', '- Only the generated status may be used in planning. A Badge tier, roleModel or FWG must not be called playable on its own.', '');
  return lines.join('\n');
}

const matrixText = `${JSON.stringify(matrix, null, 2)}\n`;
const reportText = mdReport();
const write = process.argv.includes('--write');
const check = process.argv.includes('--check');
if (write && check) throw new Error('Choose either --write or --check.');
if (write) {
  fs.writeFileSync(abs(MATRIX_PATH), matrixText);
  fs.writeFileSync(abs(REPORT_PATH), reportText);
  console.log(`Wrote ${sortedWorlds.length} work worlds to ${MATRIX_PATH} and ${REPORT_PATH}.`);
} else if (check) {
  for (const [rel, expected] of [[MATRIX_PATH, matrixText], [REPORT_PATH, reportText]]) {
    if (!exists(rel) || fs.readFileSync(abs(rel), 'utf8') !== expected) {
      console.error(`${rel} is stale. Run node scripts/audit-civication-career-gameplay.mjs --write.`);
      process.exit(1);
    }
  }
  console.log(`Career Gameplay Matrix check passed: ${sortedWorlds.length} work worlds; ${counts.reference_complete || 0} reference_complete; ${counts.playable || 0} playable; ${counts.partial || 0} partial; ${counts.architecture_only || 0} architecture_only.`);
} else {
  console.log(JSON.stringify(matrix.summary, null, 2));
}
