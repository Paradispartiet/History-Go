#!/usr/bin/env node
// tests/civication-arealplanlegger-episode-script.test.js
//
// Episodekontrakten for Arealplanlegger dag 1 (Lillebekk-planen):
// «Narrativ først, mail som kanal. En rolle-dag er en episode, ikke en
// inbox-feed.» Når et episode-script finnes for aktiv rolle/dag skal
// CivicationDailyMailBuilder bygge dagskøen KUN fra scriptets beats — den
// generelle pool/slot-generatoren skal ikke røre dagen. Testen feiler hvis
// dag 1:
//   - har mer enn 1 aktiv beslutningsmail per fase
//   - har mer enn 7 totale hovedmailer
//   - har mer enn én aktiv mail fra samme story_node_id
//   - har flere aktive mailer om samme Lillebekk-case (nabomail/varelevering/
//     gangvei) samme dag
//   - bruker generell fallback-/slot-generator når episode-script finnes
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function makeStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); }
  };
}

function makeFetch(rootDir) {
  return async function fetchMock(url) {
    const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
    const fullPath = path.resolve(rootDir, clean);
    if (!fullPath.startsWith(rootDir)) return { ok: false, status: 400, async json() { return null; } };
    try {
      const body = await fs.promises.readFile(fullPath, 'utf8');
      return { ok: true, status: 200, async json() { return JSON.parse(body); } };
    } catch {
      return { ok: false, status: 404, async json() { return null; } };
    }
  };
}

function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'));
}

async function run() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);
  global.CivicationCalendar = { getPhase: () => 'morning', setPhase: () => {}, advanceByMinutes: () => {}, getClock: () => ({ dayIndex: 1 }) };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationMailEngine.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');

  const builder = global.CivicationDailyMailBuilder;
  const active = { career_id: 'by', title: 'Arealplanlegger', role_key: 'by_radgiver_plan', role_id: 'by_radgiver_plan' };
  global.CivicationState.setActivePosition(active);

  // --- selve episode-scriptet er gyldig og strammer inn dagen ----------------
  const manifest = readJson('data/Civication/roleEpisodes/manifest.json');
  const entry = (manifest.episodes || []).find(row => row.role_scope === 'by_radgiver_plan' && row.day === 1);
  assert(entry, 'roleEpisodes/manifest.json should register by_radgiver_plan day 1');
  const episode = readJson(entry.path);
  assert.strictEqual(episode.schema, 'civication_role_episode_v1', 'episode should use civication_role_episode_v1 schema');
  assert.strictEqual(episode.role_scope, 'by_radgiver_plan', 'episode should target by_radgiver_plan');
  assert.strictEqual(episode.day, 1, 'episode should be day 1');
  assert(Array.isArray(episode.beats) && episode.beats.length >= 5 && episode.beats.length <= 7, 'episode should hold 5-7 beats');
  const beatPhases = episode.beats.map(beat => beat.phase);
  assert.strictEqual(new Set(beatPhases).size, beatPhases.length, 'episode should have at most one beat per phase');
  const storyNodes = episode.beats.map(beat => beat.story_node_id).filter(Boolean);
  assert.strictEqual(new Set(storyNodes).size, storyNodes.length, 'episode beats should use unique story_node_ids');

  // Alle mail-refs i scriptet skal finnes i rollens mailFamilies (ingen gjetting).
  const familyTypes = ['job', 'people', 'story', 'conflict', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
  const knownMailIds = new Set(familyTypes
    .map(type => readJson(`data/Civication/mailFamilies/by/${type}/by_radgiver_plan_${type}.json`))
    .flatMap(catalog => (catalog.families || []).flatMap(family => (family.mails || []).map(mail => mail.id))));
  for (const beat of episode.beats) {
    if (!beat.mail_id) continue;
    assert(knownMailIds.has(beat.mail_id), `episode beat ${beat.id} should reference an existing mail: ${beat.mail_id}`);
  }

  // --- hard guard: scriptet eier dag 1, generatoren eier den IKKE ------------
  const day1 = await builder.buildQueue(active, { date: '2026-06-22' });
  assert.strictEqual(day1.episode_mode, true, 'day 1 should be built from the episode script');
  assert.strictEqual(day1.episode_id, 'by_radgiver_plan_day1_lillebekk', 'day 1 should carry the episode id');
  assert(day1.items.length >= 5 && day1.items.length <= 7, `day 1 should hold at most 7 main mails, got ${day1.items.length}`);

  for (const row of day1.items) {
    assert(row.event?.episode_meta?.episode_id === 'by_radgiver_plan_day1_lillebekk',
      `every day 1 item must come from the episode script (no slot/pool fallback): ${row.event?.id}`);
    assert(Number(row.episode_beat) >= 1, `every day 1 row should be a scripted beat: ${row.slot}`);
  }
  const genericSlots = ['morning_brief', 'first_message', 'primary_work_mail', 'operational_mail', 'people_ping', 'main_delivery', 'conflict_or_event', 'analysis_followup', 'operational_batch', 'informal_people_mail', 'family_or_practical', 'learning_or_hobby', 'consequence_mail', 'carryover'];
  for (const row of day1.items) {
    assert(!genericSlots.includes(row.slot), `day 1 must not contain generic program slots: ${row.slot}`);
  }
  // Generert innhold er kun lov for eksplisitte generator-beats (dagslutt).
  for (const row of day1.items) {
    if (row.event?.source_type === 'daily_generated') {
      assert(row.phase_generator, `generated day 1 content must be a declared generator beat: ${row.event?.id}`);
    }
  }

  // --- maks én aktiv beslutningsmail per fase --------------------------------
  const decisionByPhase = new Map();
  for (const row of day1.items) {
    const choices = Array.isArray(row.event?.choices) ? row.event.choices : [];
    if (choices.length < 2) continue;
    decisionByPhase.set(row.phase, (decisionByPhase.get(row.phase) || 0) + 1);
  }
  for (const [phase, count] of decisionByPhase) {
    assert(count <= 1, `phase ${phase} should hold at most one active decision mail, got ${count}`);
  }

  // --- én aktiv mail per story-node, én hovedkonflikt om gangen --------------
  const nodeCounts = new Map();
  for (const row of day1.items) {
    const node = String(row.event?.story_node_id || row.event?.episode_meta?.story_node_id || '');
    if (!node) continue;
    nodeCounts.set(node, (nodeCounts.get(node) || 0) + 1);
  }
  for (const [node, count] of nodeCounts) {
    assert.strictEqual(count, 1, `story node ${node} should appear exactly once on day 1`);
  }

  // --- kun ÉN Lillebekk-case aktiv samme dag ---------------------------------
  const caseRows = day1.items.filter(row => String(row.event?.thread_key || '').includes('.case.'));
  assert.strictEqual(caseRows.length, 1, 'day 1 should hold exactly one case-thread mail');
  const nabomailRows = day1.items.filter(row => /varelevering|gangvei/i.test(JSON.stringify(row.event || {})));
  assert.strictEqual(nabomailRows.length, 1, 'day 1 should hold exactly one varelevering/gangvei case mail');
  const nabomail = nabomailRows[0].event;
  assert.strictEqual(nabomail.source_mail_id || nabomail.id, 'by_areal_micro_009', 'the neighbour case should be the varelevering variant');
  assert.strictEqual(nabomail.thread_key, 'by_radgiver_plan.case.den_irriterende_nabomailen_har_ett_sant_punkt', 'the neighbour case should keep the shared case thread key');
  const nabomailCount = day1.items.filter(row => String(row.event?.subject || '').includes('nabomail')).length;
  assert(nabomailCount <= 1, 'day 1 should not repeat the nabomail situation');

  // thread_key-dedupen består som sikkerhetsnett: unike tråder hele dagen.
  const threadKeys = day1.items.map(row => row.event?.thread_key).filter(Boolean);
  assert.strictEqual(threadKeys.length, day1.items.length, 'every day 1 event should carry a thread_key');
  assert.strictEqual(new Set(threadKeys).size, threadKeys.length, 'day 1 must not queue the same thread twice');

  // --- dramaturgien følger de seks beats-ene ---------------------------------
  const anchors = day1.items.map(row => ({ beat: row.episode_beat, phase: row.phase, id: row.event?.source_mail_id || row.event?.id }));
  const byBeat = new Map(anchors.map(row => [row.beat, row]));
  assert.strictEqual(byBeat.get(1)?.id, 'by_areal_job_plankart_001', 'beat 1 should open the Lillebekk plan assignment');
  assert.strictEqual(byBeat.get(1)?.phase, 'morning', 'beat 1 should land in the morning');
  assert.strictEqual(byBeat.get(2)?.id, 'by_areal_people_skolevei_005', 'beat 2 should raise the school-route concern');
  assert.strictEqual(byBeat.get(3)?.id, 'by_areal_micro_009', 'beat 3 should be the neighbour mail with the one real problem');
  assert.strictEqual(byBeat.get(4)?.id, 'by_areal_people_plansjef_004', 'beat 4 should be the planning chief asking for a usable formulation');
  assert.strictEqual(byBeat.get(5)?.id, 'by_areal_people_utbygger_001', 'beat 5 should surface developer/political pressure');
  assert.strictEqual(day1.items[day1.items.length - 1].phase, 'day_end', 'the day should close with a day_end beat');
  assert.strictEqual(day1.items[day1.items.length - 1].phase_generator, 'day_end', 'the closing beat should use the day_end summary generator');

  // Rolleplanen flyttes fortsatt: beat 1 er dagens planlagte planmail.
  const plannedRows = day1.items.filter(row => row.event?.source_type === 'planned');
  assert.strictEqual(plannedRows.length, 1, 'exactly one day 1 beat should advance the role plan');
  assert.strictEqual(plannedRows[0].episode_beat, 1, 'the plan-advancing beat should be beat 1');

  // Fasene kommer i dagsorden.
  const phaseOrder = ['morning', 'forenoon', 'workday', 'lunch', 'afternoon', 'dinner', 'evening', 'day_end'];
  const seen = day1.items.map(row => phaseOrder.indexOf(row.phase));
  assert(seen.every(index => index >= 0), 'all day 1 phases should be known day phases');
  assert.deepStrictEqual([...seen].sort((a, b) => a - b), seen, 'day 1 beats should follow the day phase order');

  // --- dag 2 uten script: generatoren får fylle hull -------------------------
  const day2 = await builder.buildQueue(active, { date: '2026-06-22', dayIndex: 2 });
  assert(!day2.episode_mode, 'day 2 (no script) should fall back to the generic day builder');
  assert(day2.items.length > day1.items.length, 'the generic day builder should remain available for unscripted days');

  console.log('civication-arealplanlegger-episode-script.test.js passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
