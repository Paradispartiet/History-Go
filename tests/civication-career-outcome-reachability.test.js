#!/usr/bin/env node
// tests/civication-career-outcome-reachability.test.js
//
// End-to-end reachability test for the existing Civication Jobbmail outcome-flow.
//
// Unlike tests/civication-career-outcomes.test.js (which feeds decideOutcome an
// artificial score), this test reconstructs the *real* score scale that
// CivicationEventEngine.answer() can ever persist, drives it through a faithful
// simulator over the actual naeringsliv mailPlans, and asserts that PROMOTED,
// STAGNATED and FIRED are all reachable in real play.
//
// The score constants are parsed directly from civicationEventEngine.js so that
// if the engine's clamp ever changes, this test tracks it instead of hard-coding
// a magic number.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const code = fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function loadPlan(name) {
  const full = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv', name);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

// --- Derive the real persistable score scale from the EventEngine source. ------
// The relevant lines in answer():
//   let score = Number(state.score || 0) + effect;
//   if (score > 2) score = 2;
//   if (score < -5) score = -5;
//   if (score <= -2) { strikes += 1; score = 0; if (strikes === 1) stability = "WARNING"; else if (strikes >= 2) stability = "FIRED"; }
function deriveScoreScale() {
  const src = fs.readFileSync(
    path.join(repoRoot, 'js/Civication/core/civicationEventEngine.js'),
    'utf8'
  );

  const ceil = src.match(/if \(score > (-?\d+)\) score = (-?\d+);/);
  const floor = src.match(/if \(score < (-?\d+)\) score = (-?\d+);/);
  const strikeGate = src.match(/if \(score <= (-?\d+)\) \{/);

  assert(ceil, 'Could not parse score ceiling clamp from EventEngine');
  assert(floor, 'Could not parse score floor clamp from EventEngine');
  assert(strikeGate, 'Could not parse strike threshold from EventEngine');

  return {
    ceiling: Number(ceil[2]),       // 2 — highest persistable score
    floor: Number(floor[2]),        // -5
    strikeThreshold: Number(strikeGate[1]) // -2 — resets score to 0 and adds a strike
  };
}

const SCALE = deriveScoreScale();

// Faithful mirror of the EventEngine score/strike/stability update for one answer.
function applyAnswer(state, effect) {
  let score = Number(state.score || 0) + effect;
  if (score > SCALE.ceiling) score = SCALE.ceiling;
  if (score < SCALE.floor) score = SCALE.floor;

  let strikes = Number(state.strikes || 0);
  let stability = state.stability || 'STABLE';

  if (score <= SCALE.strikeThreshold) {
    strikes += 1;
    score = 0;
    if (strikes === 1) stability = 'WARNING';
    else if (strikes >= 2) stability = 'FIRED';
  } else if (stability === 'WARNING' && effect > 0) {
    stability = 'STABLE';
  }

  return { score, strikes, stability, warning_used: strikes >= 1 };
}

// Play every step of the plan with a fixed per-step effect and report final state.
function playthrough(plan, effectPerStep) {
  let state = { score: 0, strikes: 0, stability: 'STABLE', warning_used: false };
  const steps = Array.isArray(plan.sequence) ? plan.sequence.length : 0;
  for (let i = 0; i < steps; i += 1) {
    state = applyAnswer(state, effectPerStep);
  }
  return state;
}

function completedRuntime(plan) {
  const steps = Array.isArray(plan.sequence) ? plan.sequence.length : 0;
  return {
    role_plan_id: plan.id,
    step_index: steps,
    history: Array.from({ length: steps }, (_row, index) => ({
      id: `planned_${index + 1}`,
      source_type: 'planned',
      choice_id: 'A'
    }))
  };
}

function makeActive() {
  return {
    career_id: 'naeringsliv',
    role_id: 'naer_reach',
    role_key: 'reachrolle',
    title: 'Reachrolle'
  };
}

async function run() {
  // --- Minimal browser-ish globals so the runtime module can load. ------------
  let state = {};
  let activePosition = makeActive();
  let autonomy = 60;
  let loadedPlan = null;

  global.window = global;
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.weekKey = () => '2026-W23';

  global.CivicationState = {
    getState() { return state; },
    setState(patch) { state = { ...state, ...patch }; return patch; },
    getActivePosition() { return activePosition; },
    setActivePosition(next) { activePosition = next; },
    appendJobHistoryEnded(job, reason) { state.job_history_ended = { job, reason }; }
  };

  global.CivicationPsyche = {
    getAutonomy() { return autonomy; },
    setAutonomyOverride(next) { autonomy = next; },
    registerCollapse(careerId, reason) { state.psyche_collapse = { careerId, reason }; }
  };

  class CivicationEventEngine {
    constructor(pending) { this.pending = pending; }
    getPendingEvent() { return this.pending; }
    async answer() { return { ok: true, feedback: 'answered' }; }
    async buildMailPool() { return { mails: [{ id: 'legacy_mail', source_type: 'legacy_pack' }] }; }
  }
  global.CivicationEventEngine = CivicationEventEngine;

  global.CivicationMailRuntime = {
    getPlanPath() { return 'data/Civication/mailPlans/naeringsliv/active.json'; },
    async loadJson() { return loadedPlan; },
    async makeCandidateMailsForActiveRole() {
      return [{ id: 'legacy_fallback', source_type: 'legacy_pack' }];
    },
    async debugCandidates() { return []; },
    inspect() { return {}; }
  };

  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerOutcomeRuntime.js');

  const Runtime = global.CivicationCareerOutcomeRuntime;
  const Channels = global.CivicationEventChannels;
  const active = makeActive();

  // The whole point: max persistable score is the engine ceiling.
  assert.strictEqual(SCALE.ceiling, 2, 'EventEngine still clamps persistable score to 2');
  const perfect = playthrough({ sequence: new Array(12).fill({}) }, SCALE.ceiling);
  assert.strictEqual(
    perfect.score,
    SCALE.ceiling,
    'A flawless playthrough can never exceed the engine score ceiling'
  );

  const targetPlans = [
    'arbeider_plan.json',
    'ekspeditor_plan.json',
    'formann_plan.json',
    'fagarbeider_plan.json'
  ];

  for (const file of targetPlans) {
    const plan = loadPlan(file);

    // (A) Reachability invariant: promotion threshold must sit within the scale
    // that EventEngine.answer() can actually persist.
    const rules = Runtime.getOutcomeRules(plan);
    assert(
      Number(rules.promoted.score_gte) <= SCALE.ceiling,
      `${file}: promoted.score_gte (${rules.promoted.score_gte}) is unreachable; engine ceiling is ${SCALE.ceiling}`
    );

    const runtime = completedRuntime(plan);

    // (B) Reachable PROMOTED — clean playthrough to the score ceiling.
    const clean = playthrough(plan, SCALE.ceiling);
    const promoted = Runtime.decideOutcome(active, plan, runtime, {
      score: clean.score,
      strikes: clean.strikes,
      warning_used: clean.warning_used,
      stability: clean.stability,
      mail_runtime_v1: runtime
    });
    assert.strictEqual(
      promoted.status,
      'PROMOTED',
      `${file}: a flawless playthrough must reach PROMOTED`
    );

    // (C) Reachable STAGNATED — neutral playthrough completes the plan with a
    // weak score, no strikes, no warning.
    const neutral = playthrough(plan, 0);
    assert.strictEqual(neutral.strikes, 0, `${file}: neutral run keeps strikes at 0`);
    const stagnated = Runtime.decideOutcome(active, plan, runtime, {
      score: neutral.score,
      strikes: neutral.strikes,
      warning_used: neutral.warning_used,
      stability: neutral.stability,
      mail_runtime_v1: runtime
    });
    assert.strictEqual(
      stagnated.status,
      'STAGNATED',
      `${file}: a neutral playthrough must reach STAGNATED`
    );

    // (D) Reachable FIRED — repeated negative answers drive the engine's own
    // stability to FIRED (strikes >= 2), which the fired.stability_values path
    // recognises even though raw score never dips below the strike reset.
    const negative = playthrough(plan, SCALE.floor);
    assert.strictEqual(
      negative.stability,
      'FIRED',
      `${file}: repeated negative answers must drive engine stability to FIRED`
    );
    const fired = Runtime.decideOutcome(active, plan, runtime, {
      score: negative.score,
      strikes: negative.strikes,
      warning_used: negative.warning_used,
      stability: negative.stability,
      mail_runtime_v1: runtime
    });
    assert.strictEqual(
      fired.status,
      'FIRED',
      `${file}: an engine-fired playthrough must resolve to FIRED`
    );
  }

  // --- Closed terminal plan suppresses fallback to legacy mails. --------------
  loadedPlan = loadPlan('arbeider_plan.json');
  const closedState = {
    mail_runtime_v1: completedRuntime(loadedPlan),
    career_outcome_state: { status: 'PROMOTED', role_plan_id: loadedPlan.id }
  };
  const closed = await Runtime.getTerminalPlanState(active, closedState);
  assert.strictEqual(closed.done, true, 'Closed plan stays done');
  assert.strictEqual(closed.closed, true, 'Closed plan must report closed');
  assert.strictEqual(closed.mail, null, 'Closed plan must not emit another outcome mail');

  // patchMailRuntime() wraps makeCandidateMailsForActiveRole during boot, so the
  // public build path is what real play hits. A closed terminal plan must return
  // the suppression marker instead of legacy fallback candidates.
  const fallback = await global.CivicationMailRuntime.makeCandidateMailsForActiveRole(active, closedState);
  assert(Array.isArray(fallback), 'fallback candidate path returns an array');
  assert(
    fallback.__career_outcome_terminal_closed === true || fallback.length === 0,
    'Closed terminal plan must suppress legacy fallback candidates'
  );

  // --- Fresh terminal plan emits exactly one Jobbmail outcome mail. -----------
  loadedPlan = loadPlan('ekspeditor_plan.json');
  const freshState = { mail_runtime_v1: completedRuntime(loadedPlan), score: 0, strikes: 0, stability: 'STABLE' };
  const fresh = await Runtime.getTerminalPlanState(active, freshState);
  assert.strictEqual(fresh.done, true, 'Completed plan is terminal');
  assert.strictEqual(fresh.closed, false, 'Fresh terminal plan is not yet closed');
  assert.strictEqual(fresh.mail.source_type, 'role_outcome', 'Outcome mail uses role_outcome source_type');
  assert.strictEqual(fresh.mail.mail_type, 'job_outcome', 'Outcome mail uses job_outcome mail_type');
  assert.strictEqual(fresh.mail.mail_class, 'career_outcome', 'Outcome mail uses career_outcome mail_class');

  // --- role_outcome / job_outcome classified as Jobbmail, not personlig. ------
  assert.strictEqual(
    Channels.getMessageChannel(fresh.mail),
    'job',
    'Career outcome mail must be classified as Jobbmail'
  );
  assert.strictEqual(Channels.isJobMail(fresh.mail), true, 'isJobMail recognises career outcome mail');
  assert.strictEqual(
    Channels.isPrivateMessage(fresh.mail),
    false,
    'Career outcome mail must not land in Personlige meldinger'
  );
  assert.strictEqual(Channels.classifyEvent(fresh.mail), 'milestone', 'Career outcome mail classifies as milestone');

  // --- Personal/life message must not receive career-outcome handling, even
  //     when it wrongly carries career_outcome_meta. ---------------------------
  state = {};
  const personalEvent = {
    id: 'personal_001',
    source_type: 'life',
    mail_type: 'personal',
    mail_class: 'private_message',
    choices: [{ id: 'A' }],
    career_outcome_meta: {
      status: 'FIRED',
      outcome: 'fired',
      role_scope: 'reachrolle',
      role_plan_id: loadedPlan.id
    }
  };
  await new global.CivicationEventEngine({ status: 'pending', event: personalEvent }).answer('personal_001', 'A');
  assert.strictEqual(
    state.career_outcome_state,
    undefined,
    'Personal/life messages must not receive career outcome handling'
  );
  assert.strictEqual(
    Channels.getMessageChannel(personalEvent),
    'private',
    'Mislabeled life message stays a private message'
  );

  console.log('PASS: Civication career outcome reachability tests completed.');
  console.log(`  Engine score scale: floor=${SCALE.floor} ceiling=${SCALE.ceiling} strike<=${SCALE.strikeThreshold}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
