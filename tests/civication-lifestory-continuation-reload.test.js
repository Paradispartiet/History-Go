const assert = require('node:assert/strict');
const fs = require('node:fs');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const E = require('../js/Civication/lifestory/lifestoryEndings');
const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const manifest = read(C.MANIFEST_PATH), role = manifest.roles.arbeidsledig;
const base = C.buildContent({ role: read(role.role), roleThreads: read(role.threads),
  roleScenes: read(role.scenes), phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes) });

// Use real authored choices and the same selectRole -> restore content ->
// reconcile boundary as loadRole. JSON parsing alone misses reload mutations.
const cases = [
  { id: 'mira_spilt', route: 'musikk', badge: 'musikk', label: 'Frilansmusiker', pack: 'musikk_med_mira' },
  { id: 'mira_avlyst', route: 'musikk', badge: 'musikk', label: 'Frilansmusiker', pack: 'musikk_med_mira', choices: { d5_booker: 'avsta', d9_mira_forberedelse: 'avlys' } },
  { id: 'lea_sideprosjekt', route: 'prosjekt', badge: 'naeringsliv', label: 'Sideprosjektbygger', pack: 'sideprosjekt_med_lea', choices: { d3_prosjekt_invitasjon: 'egen_tid', d7_prosjekt_videre: 'naeringsliv_sideprosjektbygger', d8_sideprosjekt_uten_mote: 'egen_tid' } },
  { id: 'lea_frilans', route: 'prosjekt', badge: 'naeringsliv', label: 'Frilanser', pack: 'frilans_med_lea', choices: { d3_prosjekt_invitasjon: 'dag6', d6_prosjekt_moetet: 'avgrens', d7_prosjekt_videre: 'naeringsliv_frilanser', d9_frilans_forberedelse: 'avlys' } },
  { id: 'lea_grunder', route: 'prosjekt', badge: 'naeringsliv', label: 'Gründerdrømmer', pack: 'grunder_med_lea', choices: { d7_prosjekt_videre: 'naeringsliv_grunderdrommer' } },
  { id: 'arvid_gjennomfort', route: 'miljo', badge: 'subkultur', label: 'Gangster', pack: 'miljo_med_arvid', choices: { d9_arvid_praten: 'lov', d10_arvid_loftet: 'rett' } },
  { id: 'arvid_avbrutt', route: 'miljo', badge: 'subkultur', label: 'Gangster', pack: 'miljo_med_arvid', choices: { d5_amir_oppmotet: 'ga_hjem', d9_arvid_praten: 'ga', d10_arvid_etter_praten: 'avstand' } },
  { id: 'arvid_avstand', route: 'miljo', badge: 'subkultur', label: 'Gangster', pack: 'miljo_med_arvid', choices: { d4_amir_rammen: 'trekk_deg', d5_amir_uten_oppmote: 'avstand', d8_arvid_etter_avstanden: 'avstand', d10_arvid_uten_prat: 'avstand' } }
];
let checkedChoices = 0;
try {
  for (const scenario of cases) {
    globalThis.CivicationLifePositions = { getLifeContext: () => ({
      primary_life_position: { badge_id: scenario.badge, label: scenario.label }
    }) };
    let state = S.createInitialState(base);
    const choices = { d2_en_retning: scenario.route, ...scenario.choices };
    function choose(content) {
      const scene = R.selectNextScene(state, content);
      assert.ok(scene, scenario.id + ': current scene exists');
      const choice = choices[scene.id]
        ? scene.valg.find(row => row.id === choices[scene.id]) : scene.valg[0];
      assert.ok(choice, scenario.id + ': authored choice exists in ' + scene.id);
      R.applyChoice(state, content, scene.id, choice.id);
      return scene.id;
    }
    while (state.dag < 7 || !state.dagFerdig) {
      if (state.dagFerdig) R.startNextDay(state, base);
      else choose(base);
      state = S.selectRole(clone(state), base);
      S.reconcileContent(state, base);
    }
    const content = C.appendContinuation(base,
      read('data/Civication/lifestory/continuations/' + scenario.pack + '.json'));
    R.startContinuation(state, base, content, scenario.pack, E.resolveEnding(state, base));
    const ending = clone(state.kapittelArkiv);
    while (true) {
      while (!state.dagFerdig) {
        const sceneId = choose(content);
        const before = clone(state);
        state = S.selectRole(clone(state), base);
        S.reconcileContent(state, content);
        assert.deepEqual(state, before, scenario.id + ': reload after ' + sceneId + ' preserves every saved value');
        assert.deepEqual(state.kapittelArkiv, ending, 'completed chapter remains frozen');
        checkedChoices++;
      }
      if (state.dag === content.role.symposium.sisteDag) break;
      R.startNextDay(state, content);
    }
  }
} finally {
  delete globalThis.CivicationLifePositions;
}
console.log('Continuation reload: ' + cases.length + ' paths, ' + checkedChoices + ' saved choices unchanged');
