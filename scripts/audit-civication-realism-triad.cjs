'use strict';
'use strict';

// A narrow evidence audit, not a claim that all Role Worlds are playable.
// Keep gaps visible without weakening any existing career or role-world gate.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const roleConfigs = [
  { category: 'naeringsliv', role: 'renholder', minMail: 81, minPersistent: 0,
    professionalTerms: /berøringspunkt|smitte|dosering|romstandard|kjemikal|ergonomi/i },
  { category: 'film_tv', role: 'produksjonsassistent', minMail: 14, minPersistent: 7,
    professionalTerms: /call sheet|call_sheet|lokasjon|transport|adgang|avdelings/i },
  { category: 'by', role: 'by_radgiver_plan', minMail: 87, minPersistent: 9,
    professionalTerms: /plansak|plankart|skolevei|utbygger|planjur|medvirkning|rådhus/i }
];
const mailTypes = ['job', 'people', 'conflict', 'event', 'followup', 'knowledge', 'consequence'];
const evidence = [];

for (const { category, role, minMail, minPersistent, professionalTerms } of roleConfigs) {
  const world = read('data/Civication/roleWorlds/' + category + '/' + role + '.json');
  const grammar = read('data/Civication/workGrammars/' + category + '/' + role + '.json');
  const plan = read('data/Civication/mailPlans/' + category + '/' + role + '_plan.json');
  assert.equal(world.category, category, role + ': role world domain');
  assert.equal(world.role_scope, role, role + ': canonical scope');
  assert.equal(world.status, 'role_world_complete', role + ': redaksjonelt fullført');
  assert.equal(world.season?.coverage?.length, 56, role + ': 14 x 4 season beats');
  assert.equal(new Set(world.season.coverage.map(b => b.day + ':' + b.phase)).size, 56);
  assert.ok(world.sociological_core?.main_problem, role + ': eget sosialt problem');
  assert.ok(world.primary_threads?.length >= 3, role + ': relasjonelle tråder');
  assert.ok(world.recurring_people_archetypes?.length >= 3, role + ': folk på arbeidsplassen');
  assert.equal(grammar.role_scope, role, role + ': work grammar canonical scope');
  assert.ok(grammar.authority_boundary && Object.keys(grammar.authority_boundary).length,
    role + ': authority, escalation and prohibited actions');
  assert.ok((grammar.task_grammar || grammar.task_families || []).length >= 3,
    role + ': yrkesspesifikke oppgaver, ikke jobbtittel');
  assert.ok(plan.sequence?.length >= 5, role + ': faktisk jobbplan');

  const all = [];
  for (const type of mailTypes) {
    const rel = 'data/Civication/mailFamilies/' + category + '/' + type +
      '/' + role + '_' + type + '.json';
    const catalog = read(rel);
    assert.equal(catalog.role_scope, role, role + ': mail role');
    assert.equal(catalog.mail_type, type, role + ': mail type');
    const mails = (catalog.families || []).flatMap(f => f.mails || []);
    assert.ok(mails.length >= 1, role + '/' + type + ': minst én forfattet hendelse');
    all.push(...mails);
  }
  assert.ok(all.length >= minMail, role + ': arbeidsdagens kildeinnhold er redusert');
  assert.equal(new Set(all.map(m => m.id)).size, all.length, role + ': dupliserte mail-ID-er');
  const places = new Set(all.map(m => m.place_id).filter(Boolean));
  assert.ok(places.size >= 4, role + ': konkrete arbeidsflater');
  const roleText = JSON.stringify({ grammar, workWorld: world.sociological_core, sample: all.map(m => [m.subject, m.summary, m.task_domain]) });
  assert.ok(professionalTerms.test(roleText), role + ': ingen yrkesspesifikke arbeidsbegreper');
  const persistent = all.filter(m =>
    (m.work_context?.object_ids || []).length ||
    (m.effects?.work_object_ops || []).length ||
    (m.choices || []).some(c => (c.effects?.work_object_ops || []).length)
  );
  assert.ok(persistent.length >= minPersistent, role + ': arbeidscase/provenance-regresjon');
  evidence.push({ role: category + '/' + role, authored_mails: all.length,
    work_object_mails: persistent.length, distinct_places: places.size });
}

const inventory = read('data/Civication/lifestory/editorial/inspiration/storyCoverageInventoryV1.json');
assert.equal(inventory.types?.length, 24, 'de 24 litterære/filmatiske historietypene skal fortsatt spores');
const filmAwaitingCloseRead = inventory.types.filter(t => t.film_analysis === 'not_reviewed').length;
const bookVerified = inventory.types.filter(t => t.book_selection === 'read_four_plus_verified').length;
assert.equal(bookVerified, 24, 'de 24 kuraterte bokmatchene skal ikke forsvinne');
const manifest = read('data/Civication/lifestory/manifest.json');
const rolePaths = Object.values(manifest.roles || {}).map(r => r.role);
const withSymposium = rolePaths.filter(p => !!read(p).symposium);
assert.ok(withSymposium.length >= 1, 'bevar fungerende Symposium i Life Story');
const roleWorldIndex = read('data/Civication/roleWorlds/index.json');
assert.ok(roleWorldIndex.roles?.length >= 244, 'rolleverdener må ikke forsvinne');

// The numbers are provenance/status indicators, NOT editorial approval.
// In particular: zero work objects for renholder and not_reviewed films remain
// work to be done; this audit must never silently label those cases complete.
console.log('Civication realism evidence audit: ' + JSON.stringify({
  roles: evidence, film_close_read_pending: filmAwaitingCloseRead,
  verified_book_matches: bookVerified, manifest_roles: rolePaths.length,
  roles_with_symposium: withSymposium.length,
  role_worlds: roleWorldIndex.roles.length,
  release_claim: 'not_verified_by_this_test'
}));
