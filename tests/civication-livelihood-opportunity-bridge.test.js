const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const BRIDGE = fs.readFileSync('js/Civication/systems/civicationLivelihoodOpportunityBridge.js', 'utf8');
const TEMPLATES = JSON.parse(fs.readFileSync('data/Civication/livelihoodOpportunityTemplates.json', 'utf8'));

function setup({ activeByBadge = {}, createResult = null } = {}) {
  global.window = global;
  global.Event = function Event(type) { this.type = type; };
  global.addEventListener = () => {};
  global.fetch = undefined;
  global.weekKey = () => '2026-W33';
  global.CIVI_LIVELIHOOD_OPPORTUNITY_TEMPLATES = TEMPLATES;

  const created = [];
  let state = { opportunities: [], streams: [], ledger: [] };
  global.CivicationLivelihoods = {
    async ensureCatalogLoaded() { return {}; },
    getState() { return state; },
    createOpportunity(input) {
      created.push(input);
      const result = createResult || { ok: true, opportunity: input };
      if (result.ok) state = { ...state, opportunities: [input].concat(state.opportunities) };
      return result;
    }
  };
  global.CivicationLifePositions = {
    getState() {
      return { primary: null, active_by_badge: activeByBadge, history: [] };
    }
  };

  delete global.CivicationLivelihoodOpportunityBridge;
  vm.runInThisContext(BRIDGE, { filename: 'civicationLivelihoodOpportunityBridge.js' });
  return { api: global.CivicationLivelihoodOpportunityBridge, created, getState: () => state };
}

assert.strictEqual(TEMPLATES.schema, 'civication_livelihood_opportunity_templates_v1');
assert(TEMPLATES.templates.length >= 12, 'starter catalog covers many different life worlds');
assert(TEMPLATES.principles.some((line) => /aldri penger direkte/i.test(line)), 'template contract forbids direct life-position money');
assert(TEMPLATES.templates.every((entry) => /^[a-z0-9][a-z0-9_-]*$/.test(entry.id)), 'template IDs are strict canonical ASCII');
assert(TEMPLATES.templates.every((entry) => Number(entry.weekly_chance) > 0 && Number(entry.weekly_chance) < 1), 'network opportunities are possible, not guaranteed');
assert(TEMPLATES.templates.every((entry) => Number(entry.income?.min ?? entry.income?.amount ?? 0) >= 0), 'templates never encode negative income as fake costs');

// Resolved choice metadata becomes an opportunity only after a successful answer.
let env = setup();
const event = {
  id: 'event_1',
  source_type: 'life_story',
  source: 'Jonas',
  subject: 'Kan du ta et lite oppdrag?',
  choices: [
    {
      id: 'A',
      label: 'Hør mer',
      livelihood_opportunity: {
        kind_id: 'gig_honorarium',
        label: 'Hjelp til på kvelden',
        income: { model: 'fixed', amount: 4 }
      }
    },
    { id: 'B', label: 'Nei' }
  ]
};
let inbox = [{ status: 'pending', event }];
const engine = {
  getInbox() { return inbox; },
  async answer(eventId, choiceId) {
    const item = inbox.find((entry) => entry.status === 'pending' && entry.event.id === eventId);
    if (!item) return { ok: false, reason: 'not_found' };
    const choice = item.event.choices.find((entry) => entry.id === choiceId);
    if (!choice) return { ok: false, reason: 'bad_choice' };
    item.status = 'resolved';
    return { ok: true, effect: 0 };
  }
};
assert.strictEqual(env.api.attachToEngine(engine), true);
(async () => {
  const answer = await engine.answer('event_1', 'A');
  assert.strictEqual(answer.ok, true);
  assert.strictEqual(env.created.length, 1, 'successful selected choice materializes one opportunity');
  assert.strictEqual(env.created[0].kind_id, 'gig_honorarium');
  assert.strictEqual(env.created[0].source.type, 'life_story');
  assert.strictEqual(env.created[0].source.id, 'event_1');
  assert.strictEqual(env.created[0].source.label, 'Jonas');
  assert.strictEqual(env.created[0].metadata.event_id, 'event_1');
  assert.strictEqual(env.created[0].metadata.choice_id, 'A');
  assert.strictEqual(answer.livelihoodOpportunities.length, 1);

  // Wrong/unselected choice cannot leak the other choice's opportunity.
  env = setup();
  inbox = [{ status: 'pending', event: JSON.parse(JSON.stringify(event)) }];
  const engineB = {
    getInbox() { return inbox; },
    async answer(eventId, choiceId) {
      const item = inbox[0];
      if (!item || item.event.id !== eventId) return { ok: false };
      if (!item.event.choices.some((entry) => entry.id === choiceId)) return { ok: false };
      item.status = 'resolved';
      return { ok: true };
    }
  };
  env.api.attachToEngine(engineB);
  await engineB.answer('event_1', 'B');
  assert.strictEqual(env.created.length, 0, 'choosing B does not materialize A opportunity');

  // Failed answers cannot materialize offers.
  env = setup();
  const failingEngine = {
    getInbox() { return [{ status: 'pending', event }]; },
    async answer() { return { ok: false, reason: 'failed' }; }
  };
  env.api.attachToEngine(failingEngine);
  await failingEngine.answer('event_1', 'A');
  assert.strictEqual(env.created.length, 0, 'failed answer creates no opportunity');

  // Event-level offers can be choice-gated.
  env = setup();
  const gatedEvent = {
    id: 'event_2',
    source: 'Festivalen',
    livelihood_opportunity: {
      choice_ids: ['YES'],
      kind_id: 'casual_shift',
      label: 'Ta en ekstravakt',
      income: { model: 'fixed', amount: 3 }
    },
    choices: [{ id: 'YES' }, { id: 'NO' }]
  };
  let res = await env.api.materializeFromResolvedChoice(gatedEvent, gatedEvent.choices[1], { ok: true });
  assert.strictEqual(res.length, 0, 'event-level choice gate blocks other choices');
  res = await env.api.materializeFromResolvedChoice(gatedEvent, gatedEvent.choices[0], { ok: true });
  assert.strictEqual(res.length, 1, 'matching event choice produces offer');

  // Weekly life-position network production is deterministic and relation-only.
  const frilanserTemplate = TEMPLATES.templates.find((entry) => entry.id === 'frilanser_kortoppdrag');
  const originalChance = frilanserTemplate.weekly_chance;
  frilanserTemplate.weekly_chance = 1;
  env = setup({ activeByBadge: { naeringsliv: { badge_id: 'naeringsliv', label: 'Frilanser' } } });
  let produced = await env.api.produceWeeklyLifePositionOpportunities();
  assert.strictEqual(produced.produced, 1, 'active life position can surface a source-bound weekly opportunity');
  assert.strictEqual(env.created[0].source.type, 'life_position_network');
  assert.deepStrictEqual(env.created[0].related_life_positions, [{ badge_id: 'naeringsliv', label: 'Frilanser' }]);
  assert.strictEqual(env.created[0].requires_life_positions, undefined, 'offer stays valid after it has reached the player; life position is provenance, not permanent gate');
  assert.strictEqual(env.created[0].metadata.week, '2026-W33');
  assert.strictEqual(env.created[0].income.min, 4);
  assert.strictEqual(env.created[0].income.max, 9);

  produced = await env.api.produceWeeklyLifePositionOpportunities();
  assert.strictEqual(produced.produced, 0, 'same position+template+week is deduplicated');
  assert.strictEqual(env.created.length, 1, 'reload cannot spam duplicate weekly offers');
  frilanserTemplate.weekly_chance = originalChance;

  // Gangster gets a legal underground-network opportunity, never criminal-income semantics.
  const gangster = TEMPLATES.templates.find((entry) => entry.badge_id === 'subkultur' && entry.life_position_label === 'Gangster');
  assert(gangster, 'Gangster has an alternative-life opportunity template');
  assert.strictEqual(gangster.kind_id, 'gig_honorarium');
  assert(/lovlig/i.test(gangster.description), 'Gangster opportunity explicitly stays legal');
  assert(!/narko|stjel|ran|svart arbeid/i.test(JSON.stringify(gangster)), 'Gangster template contains no criminal earning mechanic');

  // Psychology remains deliberately absent from paid life-position templates: interest is not clinical authority.
  assert(!TEMPLATES.templates.some((entry) => entry.badge_id === 'psykologi'), 'psychology life identity does not unlock quasi-clinical paid work');

  console.log('civication livelihood opportunity bridge tests passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
