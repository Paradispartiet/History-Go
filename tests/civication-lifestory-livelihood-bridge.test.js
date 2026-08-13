#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const SOURCE = fs.readFileSync('js/Civication/lifestory/lifestoryShellBridge.js', 'utf8');
const OVERLAYS = JSON.parse(fs.readFileSync('data/Civication/lifestory/livelihoodOpportunityOverlays.json', 'utf8'));

function makeStorage() {
  const store = {};
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    dump() { return { ...store }; }
  };
}

function setup({ livelihoodReady = true, testMode = false } = {}) {
  const localStorage = makeStorage();
  const created = [];
  const calls = [];
  const context = {
    console,
    JSON,
    Date,
    Promise,
    setTimeout,
    clearTimeout,
    localStorage,
    CIVICATION_TEST_MODE: testMode,
    Event: function Event(type) { this.type = type; },
    dispatchEvent() {},
    addEventListener() {},
    fetch: async (path) => {
      calls.push(['fetch', path]);
      return { ok: true, json: async () => OVERLAYS };
    },
    CivicationLifestoryRunner: {
      applyChoice(state, content, sceneId, choiceId) {
        const scene = content.scenes.find((entry) => entry.id === sceneId);
        const choice = scene?.valg?.find((entry) => entry.id === choiceId);
        if (!scene || !choice) throw new Error('invalid lifestory choice');
        state.applied = (state.applied || 0) + 1;
        return { consequence: 'base-result', sceneId, choiceId };
      }
    }
  };
  context.window = context;
  context.globalThis = context;
  if (livelihoodReady) {
    context.CivicationLivelihoods = {
      async ensureCatalogLoaded() { calls.push(['catalog']); },
      createOpportunity(input) {
        created.push(input);
        return { ok: true, opportunity: input };
      }
    };
  }
  vm.createContext(context);
  vm.runInContext(SOURCE, context, { filename: 'lifestoryShellBridge.js' });
  return { context, localStorage, created, calls };
}

const content = {
  role: { id: 'arbeidsledig' },
  scenes: [
    {
      id: 'rytme_01_dagen_flyter',
      valg: [
        { id: 'ta_en_oel_paa_puben', tekst: 'Gå ned på puben' },
        { id: 'bygg_ramme', tekst: 'Bygg ramme' }
      ]
    },
    {
      id: 'inline_scene',
      valg: [
        {
          id: 'inline_choice',
          livelihood_opportunity: {
            kind_id: 'gig_honorarium',
            label: 'Et eksplisitt sceneoppdrag',
            source: { type: 'lifestory_person', id: 'jonas_1', label: 'Jonas' },
            income: { model: 'fixed', amount: 3 }
          }
        }
      ]
    }
  ]
};

assert.strictEqual(OVERLAYS.schema, 'civication_lifestory_livelihood_overlays_v1');
assert(OVERLAYS.overlays.length >= 1, 'at least one authored Life Story livelihood overlay exists');
const pubOverlay = OVERLAYS.overlays.find((entry) => entry.id === 'arbeidsledig_pub_bekjent_ekstravakt');
assert(pubOverlay, 'arbeidsledig pub/network overlay exists');
assert.strictEqual(pubOverlay.role_id, 'arbeidsledig');
assert.strictEqual(pubOverlay.scene_id, 'rytme_01_dagen_flyter');
assert.strictEqual(pubOverlay.choice_id, 'ta_en_oel_paa_puben');
assert.strictEqual(pubOverlay.opportunity.kind_id, 'casual_shift');
assert(/tilbud, ikke en jobb/i.test(pubOverlay.opportunity.description), 'overlay keeps opportunity separate from formal employment');

(async () => {
  // 1. Runner is wrapped statically and original result/state semantics survive unchanged.
  let env = setup({ livelihoodReady: true });
  assert.strictEqual(env.context.CivicationLifestoryRunner.__livelihoodChoiceBridgeAttached, true,
    'bridge attaches before Life Story UI becomes interactive');
  const state = {};
  const baseResult = env.context.CivicationLifestoryRunner.applyChoice(
    state,
    content,
    'rytme_01_dagen_flyter',
    'ta_en_oel_paa_puben'
  );
  assert.deepStrictEqual(JSON.parse(JSON.stringify(baseResult)), {
    consequence: 'base-result',
    sceneId: 'rytme_01_dagen_flyter',
    choiceId: 'ta_en_oel_paa_puben'
  }, 'wrapper returns the original Life Story result shape');
  assert.strictEqual(state.applied, 1, 'canonical Life Story runner still applies choice first');
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.strictEqual(env.created.length, 1, 'authored overlay becomes exactly one livelihood opportunity');
  assert.strictEqual(env.created[0].id, 'lifestory_arbeidsledig_pub_bekjent_ekstravakt');
  assert.strictEqual(env.created[0].source.type, 'lifestory_network');
  assert.strictEqual(env.created[0].metadata.producer, 'lifestory_choice');
  assert.strictEqual(env.created[0].metadata.lifestory_role_id, 'arbeidsledig');
  assert.strictEqual(env.created[0].metadata.lifestory_scene_id, 'rytme_01_dagen_flyter');
  assert.strictEqual(env.created[0].metadata.lifestory_choice_id, 'ta_en_oel_paa_puben');

  // 2. Other choices in the same scene cannot leak the pub/network opportunity.
  env = setup({ livelihoodReady: true });
  env.context.CivicationLifestoryRunner.applyChoice({}, content, 'rytme_01_dagen_flyter', 'bygg_ramme');
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.strictEqual(env.created.length, 0, 'non-matching Life Story choice creates no offer');

  // 3. Inline choice metadata uses the same canonical pipeline.
  env = setup({ livelihoodReady: true });
  env.context.CivicationLifestoryRunner.applyChoice({}, content, 'inline_scene', 'inline_choice');
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.strictEqual(env.created.length, 1, 'inline authored opportunity materializes');
  assert.strictEqual(env.created[0].kind_id, 'gig_honorarium');
  assert.strictEqual(env.created[0].source.label, 'Jonas');
  assert.strictEqual(env.created[0].id, 'lifestory_arbeidsledig_inline_scene_inline_choice_0');

  // 4. If shell/livelihood is not ready yet, choice goes to persistent outbox and is not lost.
  env = setup({ livelihoodReady: false });
  env.context.CivicationLifestoryRunner.applyChoice({}, content, 'rytme_01_dagen_flyter', 'ta_en_oel_paa_puben');
  await new Promise((resolve) => setTimeout(resolve, 0));
  const queued = JSON.parse(env.localStorage.getItem('hg_civi_lifestory_livelihood_outbox_v1') || '[]');
  assert.strictEqual(queued.length, 1, 'pre-shell Life Story opportunity is queued');
  assert.strictEqual(queued[0].id, 'lifestory_arbeidsledig_pub_bekjent_ekstravakt');
  env.context.CivicationLivelihoods = {
    async ensureCatalogLoaded() {},
    createOpportunity(input) { env.created.push(input); return { ok: true, opportunity: input }; }
  };
  const flushed = await env.context.CivicationLifestoryShellBridge.flushLivelihoodOutbox();
  assert.strictEqual(flushed.materialized, 1, 'queued opportunity flushes when livelihood becomes available');
  assert.strictEqual(JSON.parse(env.localStorage.getItem('hg_civi_lifestory_livelihood_outbox_v1') || '[]').length, 0,
    'successful flush removes outbox entry');

  // 5. Invalid Life Story choice throws before any economic offer is queued.
  env = setup({ livelihoodReady: true });
  assert.throws(() => env.context.CivicationLifestoryRunner.applyChoice({}, content, 'missing', 'missing'), /invalid lifestory choice/);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.strictEqual(env.created.length, 0, 'failed canonical runner choice cannot leak livelihood');

  // 6. Test/debug session never writes livelihood progression.
  env = setup({ livelihoodReady: true, testMode: true });
  env.context.CivicationLifestoryRunner.applyChoice({}, content, 'rytme_01_dagen_flyter', 'ta_en_oel_paa_puben');
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.strictEqual(env.created.length, 0, 'test mode materializes no livelihood opportunities');
  assert.strictEqual(env.localStorage.getItem('hg_civi_lifestory_livelihood_outbox_v1'), null,
    'test mode writes no livelihood outbox');

  // 7. Static contract: Life Story money meter is still explicitly excluded from PC bridge.
  assert(/Pengemåleren i Life Story[\s\S]*aldri direkte[\s\S]*PC-wallet/i.test(SOURCE),
    'bridge documents that narrative Life Story money never maps directly to PC wallet');
  assert(!/updateWallet\s*\(/.test(SOURCE), 'Life Story bridge never writes wallet directly');

  console.log('civication Life Story livelihood bridge ok (runner-first, outbox, overlays, no direct wallet)');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
