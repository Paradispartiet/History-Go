const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const source = id => load(`data/Civication/lifestory/continuations/${id}.json`);
const chapters = [
  { id: 'musikk_med_mira', start: 8, end: 10, scenes: 10, endings: 3 },
  { id: 'musikk_foresporselen', start: 11, end: 13, scenes: 10, endings: 4 },
  { id: 'musikk_etter_foresporselen', start: 14, end: 16, scenes: 11, endings: 5 },
].map(ch => ({ ...ch, data: source(ch.id) }));
const scene = id => chapters.flatMap(ch => ch.data.scenes).find(s => s.id === id);
const choice = (sceneId, choiceId) => {
  const s = scene(sceneId);
  assert.ok(s, sceneId);
  const found = s.valg.find(v => v.id === choiceId);
  assert.ok(found, `${sceneId}.${choiceId}`);
  return found;
};
const condition = (sceneId, flag) => scene(sceneId).conditions?.flagg?.[flag];

test('Music pilot retains three legacy chapters, 31 scenes and 12 endings across days 8–16', () => {
  assert.equal(chapters.reduce((n, ch) => n + ch.scenes, 0), 31);
  assert.equal(chapters.reduce((n, ch) => n + ch.endings, 0), 12);
  for (const ch of chapters) {
    assert.equal(ch.data.id, ch.id);
    assert.equal(ch.data.role_scope, 'musikk_frilansmusiker');
    assert.equal(ch.data.scenes.length, ch.scenes);
    assert.equal(ch.data.endings.length, ch.endings);
    for (const s of ch.data.scenes) {
      assert.ok(s.dag >= ch.start && s.dag <= ch.end, s.id);
      assert.ok(s.valg.length >= 1, s.id);
      assert.equal(new Set(s.valg.map(v => v.id)).size, s.valg.length, s.id);
    }
  }
});

test('Both first-week outcomes allow an explicit new music choice rather than assuming a meeting', () => {
  assert.equal(condition('d8_mira_etter_settet', 'sett_gjennomfort'), true);
  assert.deepEqual(condition('d8_mira_uten_sett', 'sett_gjennomfort'), { finnes: false });
  for (const id of ['d8_mira_etter_settet', 'd8_mira_uten_sett']) {
    assert.deepEqual(scene(id).valg.map(v => v.id), ['prove', 'hjemme', 'pause']);
    assert.equal(choice(id, 'prove').effekter.flagg.mira_ny_prove_avtalt, true);
    assert.equal(choice(id, 'hjemme').effekter.flagg.musikk_videre_valg, 'hjemme');
    assert.equal(choice(id, 'pause').effekter.flagg.musikk_videre_valg, 'pause');
  }
});

test('Agreement, cancellation and performed rehearsal remain distinct source events', () => {
  assert.equal(condition('d9_mira_forberedelse', 'musikk_videre_valg'), 'prove');
  assert.equal(choice('d9_mira_forberedelse', 'avlys').effekter.flagg.mira_ny_prove_avbrutt, true);
  assert.equal(condition('d10_mira_proven', 'mira_ny_prove_avtalt'), true);
  assert.deepEqual(condition('d10_mira_proven', 'mira_ny_prove_avbrutt'), { finnes: false });
  assert.equal(condition('d10_mira_avlyst', 'mira_ny_prove_avbrutt'), true);
  for (const id of ['spill', 'snakk']) {
    assert.equal(choice('d10_mira_proven', id).effekter.flagg.mira_ny_prove_gjennomfort, true);
  }
  assert.equal(condition('d11_musikk_etter_proven', 'mira_ny_prove_gjennomfort'), true);
  assert.equal(condition('d11_musikk_etter_avlysningen', 'mira_ny_prove_avbrutt'), true);
  assert.deepEqual(condition('d11_musikk_uten_avtale', 'mira_ny_prove_avtalt'), { finnes: false });
});

test('A booker inquiry, tentative hold, rejection and unresolved answer do not collapse into booking', () => {
  for (const id of ['d11_musikk_etter_proven', 'd11_musikk_etter_avlysningen', 'd11_musikk_uten_avtale']) {
    assert.equal(scene(id).avsender, 'booker');
    assert.deepEqual(scene(id).valg.map(v => v.id), ['avklar', 'avsta', 'vent']);
  }
  assert.equal(condition('d12_musikk_omfang', 'musikk_foresporsel_valg'), 'avklar');
  assert.equal(choice('d12_musikk_omfang', 'hold').effekter.flagg.musikk_foresporsel_status, 'hold');
  assert.equal(choice('d12_musikk_omfang', 'hold').effekter.flagg.musikk_foresporsel_dato_holdt, true);
  assert.equal(choice('d13_musikk_holdt_dato', 'behold').effekter.flagg.musikk_foresporsel_beholdt_hold, true);
  assert.equal(choice('d13_musikk_holdt_dato', 'frigjor').effekter.flagg.musikk_foresporsel_avslatt, true);
  assert.equal(condition('d14_mira_hold', 'musikk_foresporsel_beholdt_hold'), true);
  assert.equal(condition('d14_mira_nei', 'musikk_foresporsel_avslatt'), true);
  assert.equal(condition('d14_mira_uavklart', 'musikk_foresporsel_uavklart'), true);
});

test('Legacy identity keys are not silently converted to canonical People relationships', () => {
  const people = load('data/Civication/lifestory/editorial/peopleScenarioCandidatesV1.json').candidates;
  const musicPeople = people.filter(p => p.role_scope === 'musikk_frilansmusiker');
  assert.equal(musicPeople.length, 2);
  assert.deepEqual(musicPeople.map(p => p.canonical_person_id).sort(), ['bugge_wesseltoft', 'mari_boine']);
  assert.notEqual(musicPeople[0].player_centered_conflict, musicPeople[1].player_centered_conflict);
  for (const p of musicPeople) {
    assert.equal(p.status, 'authoring_candidate_not_runtime');
    assert.equal(p.real_person_actor_mode, 'historical_knowledge_reference_only_until_policy_approved');
  }
  for (const ch of chapters) {
    for (const s of ch.data.scenes) {
      for (const v of s.valg) {
        for (const key of Object.keys(v.effekter?.relasjoner || {})) {
          assert.notEqual(key, 'bugge_wesseltoft', s.id);
          assert.notEqual(key, 'mari_boine', s.id);
        }
      }
    }
  }
});
