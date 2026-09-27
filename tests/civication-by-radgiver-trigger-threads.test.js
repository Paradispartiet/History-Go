#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const peoplePath = path.join(ROOT, 'data/Civication/mailFamilies/by/people/by_radgiver_plan_people.json');
const runtimePath = path.join(ROOT, 'js/Civication/systems/civicationMailRuntime.js');
const auditPath = path.join(ROOT, 'scripts/audit-civication-scene-pipeline.mjs');

const data = JSON.parse(fs.readFileSync(peoplePath, 'utf8'));
const family = (data.families || []).find((row) => row.id === 'aktorer_og_press');
assert(family, 'aktorer_og_press family must exist');

const expected = {
  by_areal_people_plansjef_004: {
    A: 'by_areal_people_plansjef_004_presisjon',
    B: 'by_areal_people_plansjef_004_tempo_risiko',
    channel: 'job'
  },
  by_areal_people_skolevei_005: {
    A: 'by_areal_people_skolevei_005_presisjon',
    B: 'by_areal_people_skolevei_005_tempo_risiko',
    channel: 'job'
  },
  by_areal_people_juridisk_006: {
    A: 'by_areal_people_juridisk_006_presisjon',
    B: 'by_areal_people_juridisk_006_tempo_risiko',
    channel: 'job'
  },
  by_areal_people_politisk_007: {
    A: 'by_areal_people_politisk_007_presisjon',
    B: 'by_areal_people_politisk_007_tempo_risiko',
    channel: 'job'
  },
  by_areal_people_arkitekt_008: {
    A: 'by_areal_people_arkitekt_008_presisjon',
    B: 'by_areal_people_arkitekt_008_tempo_risiko',
    channel: 'private'
  }
};

const threadById = new Map((family.threads || []).map((thread) => [thread.id, thread]));
const expectedThreadIds = new Set();

for (const [sourceId, spec] of Object.entries(expected)) {
  const mail = (family.mails || []).find((row) => row.id === sourceId);
  assert(mail, `${sourceId}: source mail must exist`);
  assert.equal(mail.channel, spec.channel, `${sourceId}: source channel drift`);
  assert.equal(mail.messageChannel, spec.channel, `${sourceId}: source messageChannel drift`);

  for (const choiceId of ['A', 'B']) {
    const targetId = spec[choiceId];
    expectedThreadIds.add(targetId);
    assert.deepEqual(mail.triggers_on_choice?.[choiceId], [targetId], `${sourceId}/${choiceId}: top-level trigger map must preserve the authored target`);

    const choice = (mail.choices || []).find((row) => row.id === choiceId);
    assert(choice, `${sourceId}: choice ${choiceId} must exist`);
    assert.equal(choice.triggers_on_choice, targetId, `${sourceId}/${choiceId}: runtime-readable trigger must match authored map`);

    const thread = threadById.get(targetId);
    assert(thread, `${targetId}: triggered consequence thread must exist`);
    assert.equal(thread.id, targetId);
    assert.equal(thread.role_scope, 'by_radgiver_plan');
    assert.equal(thread.mail_type, 'people');
    assert.equal(thread.mail_family, 'aktorer_og_press');
    assert.equal(thread.repeatable, false);
    assert.equal(thread.channel, spec.channel);
    assert.equal(thread.messageChannel, spec.channel);
    assert.equal(thread.mail_class, spec.channel === 'private' ? 'private_message' : 'job_message');
    assert.equal(thread.from, mail.from, `${targetId}: consequence should return from the source actor`);
    assert.equal(thread.person_id, mail.person_id, `${targetId}: consequence should preserve the source actor identity`);
    assert.equal(thread.place_id, mail.place_id, `${targetId}: consequence should preserve the source place`);
    assert.ok(String(thread.subject || '').trim().length >= 12, `${targetId}: subject too thin`);
    assert.ok(String(thread.summary || '').trim().length >= 60, `${targetId}: summary too thin`);
    assert.ok(Array.isArray(thread.situation) && thread.situation.length >= 2, `${targetId}: consequence situation must show the later effect`);
    assert.ok((thread.situation || []).every((line) => String(line).trim().length >= 45), `${targetId}: consequence situation line too thin`);
    assert.ok(Array.isArray(thread.choices) && thread.choices.length === 1, `${targetId}: consequence should use one acknowledgement choice`);
    assert.equal(thread.choices[0].id, 'A');
    assert.equal(thread.choices[0].label, 'Lest');
  }
}

assert.equal(expectedThreadIds.size, 10, 'the five source mails must have ten distinct consequence targets');
assert.equal(new Set([...expectedThreadIds]).size, expectedThreadIds.size, 'trigger thread ids must be unique');
for (const id of expectedThreadIds) assert(threadById.has(id), `${id}: expected thread missing`);

const runtimeSource = fs.readFileSync(runtimePath, 'utf8');
assert.match(runtimeSource, /family\?\.threads/, 'mail runtime must index family.threads');
assert.match(runtimeSource, /choice\?\.triggers_on_choice/, 'mail runtime must read choice-level triggers_on_choice');
assert.match(runtimeSource, /threadIndex\.get\(key\)/, 'mail runtime must resolve the triggered thread id from its thread index');

const rawAudit = execFileSync(process.execPath, [auditPath, '--json'], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024
});
const audit = JSON.parse(rawAudit);
assert.equal(audit.summary.missing_internal_references, 0, 'scene-pipeline audit must have no dangling internal references');
assert.equal((audit.blocking_issues || []).filter((issue) => issue.category === 'missing_internal_reference').length, 0);

execFileSync(process.execPath, [path.join(ROOT, 'tests/civication-by-radgiver-role-world.test.js')], { cwd: ROOT, stdio: 'pipe' });
console.log('civication-by-radgiver-trigger-threads.test.js: PASS');
