#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const text = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(text(rel));

const profile = text('docs/civication-symposium/lager-og-driftsmedarbeider.md');
const index = text('docs/CIVICATION_JOBBGRUNNLAG.md');
const retailProfile = text('docs/civication-symposium/ekspeditor.md');
const role = json('data/Civication/roles/naer_lager_og_driftsmedarbeider.json');
const model = json('data/Civication/roleModels/naeringsliv/lager_og_driftsmedarbeider.json');
const world = json('data/Civication/roleWorlds/naeringsliv/lager_og_driftsmedarbeider.json');
const plan = json('data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json');
const mail = json('data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json');

assert.equal(role.role_id, 'naer_lager_og_driftsmedarbeider');
assert.equal(model.role_scope, 'lager_og_driftsmedarbeider');
assert.equal(world.role_scope, 'lager_og_driftsmedarbeider');
assert.equal(plan.role_scope, 'lager_og_driftsmedarbeider');
assert.equal(mail.role_scope, 'lager_og_driftsmedarbeider');
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.equal(plan.sequence.length, 20);

assert.ok(index.includes('(civication-symposium/lager-og-driftsmedarbeider.md)'), 'role profile is listed in Symposium');
assert.ok(retailProfile.includes('(lager-og-driftsmedarbeider.md)'), 'retailer and warehouse profiles link bidirectionally');
assert.ok(profile.includes('(ekspeditor.md)'), 'warehouse links back to retail');
for (const heading of [
  'Rollen og arbeidsbeskrivelsen',
  'Titler, synonymer, lokalt språk og fagord',
  'Verktøy, klær, steder og faktisk dokumentasjon',
  'Klasse, vilkår, arbeidsrytme og kropp',
  'Oppgave- og dokumentmatrise – etablerte Civication-forløp',
  'Konflikter og faktisk handlingsrom',
  'Symposiums dokumentnett og kontinuitet'
]) assert.ok(profile.includes('## ' + heading), 'professional documentation layer: ' + heading);

const canonical = [
  'job_lager_og_driftsmedarbeider_week1_receiving_almost_matched',
  'job_lager_og_driftsmedarbeider_week1_pick_list_pressure',
  'job_lager_og_driftsmedarbeider_week1_wrong_location',
  'job_lager_og_driftsmedarbeider_week1_pallet_in_the_way',
  'job_lager_og_driftsmedarbeider_week2_late_missing_colli',
  'job_lager_og_driftsmedarbeider_week2_store_waits_wrong_item',
  'job_lager_og_driftsmedarbeider_week2_count_mismatch',
  'job_lager_og_driftsmedarbeider_week2_near_miss_everyone_passed'
];
const mailIds = new Set((mail.families || []).flatMap(f => (f.mails || []).map(m => m.id)));
assert.equal(canonical.length, 8);
for (const id of canonical) {
  assert.ok(mailIds.has(id), 'source catalog must contain documented playable job mail: ' + id);
  assert.ok(profile.includes(id), 'profile references the same already-playable job mail: ' + id);
}
assert.equal((profile.match(/\bjob_lager_og_driftsmedarbeider_week[12]_[a-z_]+/g) || []).length, 8, 'matrix is eight existing mail situations, not invented ones');

for (const source of [
  'https://utdanning.no/yrker/beskrivelse/logistikkoperator',
  'https://www.udir.no/lk20/log03-02',
  'https://www.arbeidstilsynet.no/arbeidstid-og-organisering/opplaring/',
  'https://www.arbeidstilsynet.no/arbeidsmiljo/ergonomi/'
]) assert.ok(profile.includes(source), 'traceable education or workplace source: ' + source);

for (const concept of ['truck', 'sertifisert', 'utstyrsspesifikk', 'HMS', 'avvik', 'system', 'skift']) {
  assert.ok(profile.toLowerCase().includes(concept.toLowerCase()), 'missing occupation-specific concept: ' + concept);
}
assert.match(profile, /ingen automatisk trucktilgang|Ingen automatisk trucktilgang/i);
assert.match(profile, /ikke egenhendig regnskapskorreksjon/i);
assert.match(profile, /ikke.*ny.*spillscene|ikke.*nye scener|ikke åtte nye scener/i);

const refs = [...profile.matchAll(/\]\((\.\.\/[^)#]+)\)/g)].map(match => match[1]);
assert.ok(refs.length >= 8, 'references are connected to existing Symposium and role assets');
for (const href of refs) {
  const target = path.resolve(root, 'docs/civication-symposium', href);
  assert.ok(fs.existsSync(target), 'broken document network reference: ' + href);
}

console.log('Symposium warehouse: existing role, eight job cases, safety, evidence and links verified');
