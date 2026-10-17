#!/usr/bin/env node
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const json = p => JSON.parse(read(p));
const arcs = json('data/Civication/narratives/editorial/wholeLifeStoryBatchV1.json').arcs;
const sources = [
  'js/Civication/core/civicationCalendar.js',
  'js/Civication/systems/day/dayCalendarBridge.js',
  'js/Civication/systems/civicationEventChannels.js',
  'js/Civication/systems/civicationMailEngine.js',
  'js/Civication/systems/civicationActorRoleContract.js',
  'js/Civication/systems/civicationNPCs.js',
  'js/Civication/systems/civicationSceneInteraction.js',
  'js/Civication/systems/day/dayChoiceDirector.js',
  'js/Civication/systems/day/dayNpcCharacterThreads.js',
  'js/Civication/systems/civicationWorkdayMailBuilder.js',
  'js/Civication/systems/civicationNarrativeSceneSource.js',
  'js/Civication/systems/civicationPrivatePhaseMailBuilder.js',
  'js/Civication/systems/civicationDailyMailBuilder.js',
  'js/Civication/systems/day/dayProgressionController.js'
];

async function harness({ state = {}, backing = new Map(), active = null } = {}) {
  let position = active;
  let rejected = false;
  let legacyCalls = 0;
  let completedWorkdays = 20;
  const win = {
    DEBUG: false, addEventListener() {}, dispatchEvent() {},
    CivicationState: {
      getState: () => state,
      setState(patch) { Object.assign(state, patch); return state; },
      getActivePosition: () => position,
      getInbox: () => win.CivicationMailEngine.getInbox()
    },
    CivicationCareerRoleResolver: { resolveCareerRoleScope: a => a?.role_key || '' },
    CivicationWorkdayRuntime: {
      hasActiveJob: a => !!a,
      getWorkdayDayIndex: () => completedWorkdays,
      isWorkdayCompletedToday: () => false,
      completeWorkday() { completedWorkdays += 1; }
    }
  };
  function Engine() {}
  Engine.prototype.getInbox = () => win.CivicationMailEngine.getInbox();
  Engine.prototype.getPendingEvent = function() {
    return this.getInbox().find(x => x.status === 'pending' && !x.resolved) || null;
  };
  Engine.prototype.onAppOpen = async () => { legacyCalls += 1; return { enqueued: false, reason: 'existing_life_owner' }; };
  Engine.prototype.answer = async function(id, choice) {
    const event = this.getPendingEvent()?.event;
    return { ok: !rejected && event?.id === id && event.choices.some(c => c.id === choice) };
  };
  win.CivicationEventEngine = Engine;
  win.window = win;
  win.fetch = async url => {
    const p = String(url).split('?')[0];
    if (!p.startsWith('data/') || p.includes('..') || !fs.existsSync(path.join(root, p))) return { ok: false };
    return { ok: true, json: async () => json(p) };
  };
  const context = vm.createContext({ window: win, fetch: (...args) => win.fetch(...args),
    document: { readyState: 'complete', addEventListener() {} },
    localStorage: {
      getItem: key => backing.get(key) ?? null,
      setItem: (key, value) => backing.set(key, String(value)),
      removeItem: key => backing.delete(key)
    }, Event: class { constructor(type) { this.type = type; } }, console, setTimeout, clearTimeout });
  for (const filename of sources) vm.runInContext(read(filename), context, { filename });
  await Promise.resolve(); // Let the real SceneDirector install its Daily entry wrapper.
  const engine = new Engine();
  win.HG_CiviEngine = engine;
  const builder = win.CivicationDailyMailBuilder;
  async function establish(arc) {
    const [category, role_scope] = arc.required_actor_role.split('/');
    const work = json('data/Civication/narratives/work/naeringsliv/' + arc.npc_id.split('_')[0] + '_role_change.json');
    const transition = work.storylets.find(s => s.npc_story.role_transition).npc_story.role_transition;
    await win.CivicationNpcCharacterThreads.recordRoleTransition(arc.npc_id, { category, role_scope }, transition.event_id);
    const ns = state.narrative_state_v1 ||= { flags: [], stream_progress: {}, active_streams: [], choice_history: [] };
    ns.flags.push(arc.entry_flag);
    for (const s of work.storylets) ns.stream_progress[work.id + '::' + s.id] = {
      stream_id: work.id, storylet_id: s.id, answered: true, answered_workday_day: 10
    };
  }
  return { win, engine, builder, state, backing, establish,
    setPosition(p) { position = p; }, reject(value = true) { rejected = value; },
    legacyCalls: () => legacyCalls, workdays: () => completedWorkdays,
    async query(arc) {
      return win.CivicationSceneCatalog.getSourceScenes('narrative', {
        mode: 'slot', phaseId: 'evening', active: position, state,
        candidate_stream_ids: [arc.stream_id], used_storylet_keys: []
      });
    }
  };
}

for (const arc of arcs) {
  test(arc.stream_id + ': unemployed calendar days deliver real private inbox chapters and survive reload', async () => {
    let h = await harness();
    await h.establish(arc);
    const history = JSON.stringify(h.win.CivicationNpcCharacterThreads.getRoleHistory(arc.npc_id));
    const visited = [];
    for (let chapter = 0; chapter < 4; chapter++) {
      const day = h.win.CivicationCalendar.getClock().dayIndex;
      // DayProgression may already have delivered the next day's first chapter.
      const pending = h.engine.getPendingEvent();
      const delivered = pending ? { enqueued: true, event: pending.event } : await h.engine.onAppOpen();
      assert.equal(delivered.enqueued, true, 'Private NPC correspondence must work without a job');
      const event = delivered.event;
      assert.equal(event.narrative_stream_id, arc.stream_id);
      assert.equal(event.scene_source_adapter, 'narrative');
      assert.equal(event.scene_catalog_owner, 'CivicationSceneCatalog');
      assert.equal(h.win.CivicationEventChannels.getMessageChannel(event), 'private');
      assert.equal(event.workday_related, false);
      assert(!event.employer_id && !event.career_id && !event.role_scope);
      assert(h.state.mail_day_runtime_v1.items.every(r => !['forenoon', 'workday'].includes(r.phase)), 'No fabricated workday for unemployed actors');
      assert.equal(h.engine.getInbox().filter(x => !x.resolved).length, 1);
      assert.equal((await h.engine.onAppOpen()).enqueued, false, 'No second pending envelope');
      visited.push(event.narrative_storylet_id);
      const answer = await h.engine.answer(event.id, event.choices[0].id);
      assert.equal(answer.ok, true);
      assert.equal(answer.dailyRuntimeAnswered, true);
      assert.equal(h.engine.getPendingEvent(), null, 'Real inbox copy must be resolved');
      assert.equal(h.state.narrative_state_v1.stream_progress[arc.stream_id + '::' + event.narrative_storylet_id].answered_calendar_day, day);
      assert.equal((await h.query(arc)).length, 0, 'Private daily quota survives a rebuild');
      assert.equal(h.workdays(), 20, 'Private answers must not complete a job day');
      assert.equal(JSON.stringify(h.win.CivicationNpcCharacterThreads.getRoleHistory(arc.npc_id)), history);
      h = await harness({ state: JSON.parse(JSON.stringify(h.state)), backing: new Map(h.backing) });
      assert.equal((await h.query(arc)).length, 0, 'Reload must retain the private day gate');
      h.win.CivicationCalendar.setPhase('day_end');
      assert.equal((await h.win.CivicationDayProgression.advancePhaseIfReady()).advanced, true);
      assert.equal(h.win.CivicationCalendar.getClock().dayIndex, day + 1);
    }
    assert.equal(new Set(visited).size, 4);
    assert(h.state.narrative_state_v1.flags.includes(arc.terminal_flag));
    assert.equal((await h.query(arc)).length, 0);
  });
}

test('Normal private adapter delivers an NPC chapter beside the work chapter; role loss does not stop its continuation', async () => {
  const active = { career_id: 'naeringsliv', role_key: 'fagarbeider', title: 'Fagarbeider' };
  const h = await harness({ active });
  const arc = arcs[0];
  await h.establish(arc);
  const q = await h.builder.buildQueue(active);
  const npc = q.items.filter(r => r.event?.npc_story);
  assert.equal(npc.filter(r => r.event.channel === 'job').length, 1);
  assert.equal(npc.filter(r => r.event.channel === 'private').length, 1);
  assert(q.items.some(r => r.event.source_type === 'daily_private_phase'), 'Ordinary private phase source remains loaded and used');
  const row = npc.find(r => r.event.channel === 'private');
  h.state.mail_day_runtime_v1 = q;
  h.win.CivicationCalendar.setPhase(row.phase);
  await h.builder.enqueuePhaseBundle(h.engine, { phase: row.phase });
  assert.equal(h.engine.getPendingEvent().event.id, row.event.id);
  assert.equal((await h.engine.answer(row.event.id, 'ja')).ok, true);
  h.setPosition(null);
  assert.equal((await h.query(arc)).length, 0);
  h.win.CivicationCalendar.resetForNewDay();
  const next = await h.engine.onAppOpen();
  assert.equal(next.event?.narrative_storylet_id, 'stein_rw_kamp');
  assert.equal(next.event.channel, 'private');
});

test('Rejected private answer and missing calendar stamp cannot unlock another chapter', async () => {
  const h = await harness();
  const arc = arcs[0];
  await h.establish(arc);
  const { event } = await h.engine.onAppOpen();
  const before = JSON.stringify(h.state.narrative_state_v1);
  h.reject();
  assert.equal((await h.engine.answer(event.id, 'ja')).ok, false);
  assert.equal(JSON.stringify(h.state.narrative_state_v1), before);
  assert.equal(h.engine.getPendingEvent().event.id, event.id);
  h.reject(false);
  assert.equal((await h.engine.answer(event.id, 'nei')).ok, true);
  const progress = h.state.narrative_state_v1.stream_progress[arc.stream_id + '::' + event.narrative_storylet_id];
  delete progress.answered_calendar_day;
  h.win.CivicationCalendar.resetForNewDay();
  assert.equal((await h.query(arc)).length, 0, 'An old workday timestamp is not a calendar timestamp');
});

test('No established NPC keeps the existing unemployed life owner in control', async () => {
  const h = await harness();
  assert.equal((await h.engine.onAppOpen()).reason, 'existing_life_owner');
  assert.equal(h.legacyCalls(), 1);
  assert.equal(h.engine.getInbox().length, 0);
  assert.equal(h.state.mail_day_runtime_v1.items.length, 0);
  assert.equal(h.workdays(), 20);
});

test('Three private NPC threads share one calendar-day turn and rotate without moving the workday counter', async () => {
  const h = await harness();
  for (const arc of arcs) await h.establish(arc);
  const ids = [];
  for (let day = 0; day < 12; day++) {
    const pending = h.engine.getPendingEvent();
    const event = pending?.event || (await h.engine.onAppOpen()).event;
    assert(event?.npc_story);
    ids.push(event.npc_story.npc_id);
    assert.equal(h.state.mail_day_runtime_v1.items.filter(r => r.event?.npc_story).length, 1);
    assert.equal((await h.engine.answer(event.id, event.choices[0].id)).ok, true);
    for (const arc of arcs) assert.equal((await h.query(arc)).length, 0);
    const rebuilt = await h.builder.buildQueue(null, { forceNew: true });
    assert.equal(rebuilt.items.filter(r => r.event?.npc_story).length, 0, 'A fresh queue cannot bypass the private daily quota');
    h.win.CivicationCalendar.setPhase('day_end');
    assert.equal((await h.win.CivicationDayProgression.advancePhaseIfReady()).advanced, true);
  }
  assert.deepEqual(ids, [...arcs, ...arcs, ...arcs, ...arcs].map(a => a.npc_id));
  assert.equal(h.workdays(), 20);
  for (const arc of arcs) assert(h.state.narrative_state_v1.flags.includes(arc.terminal_flag));
});
