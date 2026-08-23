#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const affordance = require(path.join(ROOT, 'js/Civication/core/civicationChoiceAffordance.js'));
const compilerPath = path.join(ROOT, 'scripts/build-civication-scene-registry.mjs');
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/Civication/sceneContractV1.schema.json'), 'utf8'));
const eventEngineSource = fs.readFileSync(path.join(ROOT, 'js/Civication/core/civicationEventEngine.js'), 'utf8');
const shellLoaderSource = fs.readFileSync(path.join(ROOT, 'js/Civication/civicationShellLoader.js'), 'utf8');

function taskEngineWith(task) {
  return {
    getTaskByMailId(mailId) {
      return task && task.mail_id === mailId ? JSON.parse(JSON.stringify(task)) : null;
    }
  };
}

function proveRuntimeProjection() {
  const gatedChoice = {
    id: 'C',
    label: 'Use learned professional method',
    affordance: {
      history_go: {
        task_mail_ids: ['knowledge_scene'],
        require_task_completed: true,
        require_history_go_correct: true,
        min_effect: 1
      }
    }
  };
  const event = { id: 'work_scene', choices: [{ id: 'A' }, { id: 'B' }, gatedChoice] };

  assert.deepEqual(affordance.availableChoices(event, taskEngineWith(null)).map((c) => c.id), ['A', 'B']);

  const historyOnly = {
    id: 'task_knowledge_scene',
    mail_id: 'knowledge_scene',
    status: 'open',
    history_go: { completed_at: '2026-08-23T12:00:00.000Z', correct: true },
    result: null
  };
  assert.deepEqual(affordance.availableChoices(event, taskEngineWith(historyOnly)).map((c) => c.id), ['A', 'B'], 'History Go evidence alone is not completed learning');

  const completedWrongApplication = {
    ...historyOnly,
    status: 'completed',
    result: { effect: 0 }
  };
  assert.deepEqual(affordance.availableChoices(event, taskEngineWith(completedWrongApplication)).map((c) => c.id), ['A', 'B'], 'non-positive professional application must not unlock the better choice');

  const learned = {
    ...historyOnly,
    status: 'completed',
    result: { effect: 1 }
  };
  const projected = affordance.projectEvent(event, { task_engine: taskEngineWith(learned) });
  assert.deepEqual(projected.choices.map((c) => c.id), ['A', 'B', 'C']);
  assert.notEqual(projected, event, 'projection must not mutate the persisted/source event');
  assert.equal(event.choices.length, 3);

  const bad = { id: 'D', affordance: { history_go: { task_mail_ids: [] } } };
  assert.equal(affordance.evaluateChoice(bad, taskEngineWith(learned)).available, false, 'malformed gates fail closed');
}

async function proveCompilerContract() {
  assert.equal(schema.$defs.choice.properties.affordance.$ref, '#/$defs/choiceAffordance');
  assert.equal(schema.$defs.choiceAffordance.additionalProperties, false);
  assert.equal(schema.$defs.historyGoChoiceAffordance.additionalProperties, false);

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'civi-choice-affordance-'));
  const knowledgeDir = path.join(tempRoot, 'data/Civication/mailFamilies/foundation/knowledge');
  const consequenceDir = path.join(tempRoot, 'data/Civication/mailFamilies/foundation/consequence');
  fs.mkdirSync(knowledgeDir, { recursive: true });
  fs.mkdirSync(consequenceDir, { recursive: true });

  const knowledgePath = path.join(knowledgeDir, 'foundation_role_knowledge.json');
  const consequencePath = path.join(consequenceDir, 'foundation_role_consequence.json');

  const knowledge = {
    schema: 'civication_mail_family_catalog_v1', version: 1, category: 'foundation', role_scope: 'foundation_role', mail_type: 'knowledge',
    families: [{ id: 'learning', mails: [{
      id: 'knowledge_scene', subject: 'Learn', summary: 'Do the History Go learning task.', situation: ['Open History Go and learn.'],
      interaction_mode: 'task',
      task_contract: { task_id: 'history_go_learning', completion_rule: 'history_go_payload_completed' },
      task_payload: { task_kind: 'history_go_place', target_type: 'place', place_id: 'foundation_place', completion_mode: 'open_place' },
      choices: [{ id: 'A', label: 'Apply correctly', effect: 1 }]
    }]}]
  };
  const consequence = {
    schema: 'civication_mail_family_catalog_v1', version: 1, category: 'foundation', role_scope: 'foundation_role', mail_type: 'consequence',
    families: [{ id: 'return_to_case', mails: [{
      id: 'work_scene', subject: 'Return to case', summary: 'Use what you learned.', situation: ['The same case returns.'], interaction_mode: 'decision',
      choices: [
        { id: 'A', label: 'Baseline safe option', effect: 1 },
        { id: 'B', label: 'Bad shortcut', effect: -1 },
        { id: 'C', label: 'Learned better option', effect: 2, affordance: { history_go: { task_mail_ids: ['knowledge_scene'], require_task_completed: true, require_history_go_correct: true, min_effect: 1 } } }
      ]
    }]}]
  };
  fs.writeFileSync(knowledgePath, JSON.stringify(knowledge, null, 2));
  fs.writeFileSync(consequencePath, JSON.stringify(consequence, null, 2));

  const compiler = await import(`${pathToFileURL(compilerPath).href}?affordance=${Date.now()}`);
  const registry = await compiler.compileRegistryFromRepo(tempRoot);
  const entry = registry.entries.find((row) => row.id === 'work_scene');
  assert(entry, 'compiled work scene missing');
  assert.deepEqual(entry.scene.choices[2].affordance.history_go.task_mail_ids, ['knowledge_scene']);
  assert.deepEqual(entry.compatibility_projection.choices[2].affordance.history_go.task_mail_ids, ['knowledge_scene']);

  consequence.families[0].mails[0].choices[2].affordance.history_go.task_mail_ids = ['missing_learning_scene'];
  fs.writeFileSync(consequencePath, JSON.stringify(consequence, null, 2));
  await assert.rejects(() => compiler.compileRegistryFromRepo(tempRoot), /missing_learning_scene|ukjent.*task|affordance/i, 'compiler must reject dangling learning references');

  consequence.families[0].mails[0].choices = [consequence.families[0].mails[0].choices[2], { id: 'B', label: 'Only one baseline choice', effect: -1 }];
  consequence.families[0].mails[0].choices[0].affordance.history_go.task_mail_ids = ['knowledge_scene'];
  fs.writeFileSync(consequencePath, JSON.stringify(consequence, null, 2));
  await assert.rejects(() => compiler.compileRegistryFromRepo(tempRoot), /to.*ungated|baseline|affordance/i, 'decision scenes must retain two ungated choices to avoid deadlock');

  fs.rmSync(tempRoot, { recursive: true, force: true });
}

function proveRuntimeOwnerHook() {
  assert.match(eventEngineSource, /CivicationChoiceAffordance/);
  assert.match(eventEngineSource, /projectInboxItem/);
  assert.match(eventEngineSource, /affordance/);
  assert.match(shellLoaderSource, /js\/Civication\/core\/civicationChoiceAffordance\.js/);
}

function proveArchiveVerticalSlice() {
  const knowledge = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/Civication/mailFamilies/historie/knowledge/historie_arkiv_og_dokumentasjon_knowledge.json'), 'utf8'));
  const consequence = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/Civication/mailFamilies/historie/consequence/historie_arkiv_og_dokumentasjon_consequence.json'), 'utf8'));
  const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/Civication/mailPlans/historie/historie_arkiv_og_dokumentasjon_plan.json'), 'utf8'));

  const knowledgeMail = knowledge.families.flatMap((f) => f.mails || []).find((m) => m.id === 'historie_arkiv_knowledge_akershus_001');
  const consequenceMail = consequence.families.flatMap((f) => f.mails || []).find((m) => m.id === 'historie_arkiv_consequence_migrering_001');
  assert(knowledgeMail && consequenceMail);
  assert.equal(knowledgeMail.task_contract.completion_rule, 'history_go_payload_completed');

  const learnedChoice = consequenceMail.choices.find((c) => c.id === 'C');
  const baselineGood = consequenceMail.choices.find((c) => c.id === 'A');
  assert(learnedChoice?.affordance?.history_go);
  assert.deepEqual(learnedChoice.affordance.history_go.task_mail_ids, ['historie_arkiv_knowledge_akershus_001']);
  assert.equal(learnedChoice.affordance.history_go.require_task_completed, true);
  assert.equal(learnedChoice.affordance.history_go.require_history_go_correct, true);
  assert.equal(learnedChoice.affordance.history_go.min_effect, 1);
  assert(Number(learnedChoice.effect) > Number(baselineGood.effect), 'learned option must be materially better than the baseline good option');
  assert(consequenceMail.work_context.object_ids.includes('historie_arkiv_sak_digital_bevaring_001'));

  const knowledgeStep = plan.sequence.find((row) => row.type === 'knowledge');
  const consequenceStep = plan.sequence.find((row) => row.type === 'consequence');
  assert(knowledgeStep && consequenceStep && knowledgeStep.step < consequenceStep.step, 'learning must happen before the improved professional choice can appear');
}

(async () => {
  proveRuntimeProjection();
  await proveCompilerContract();
  proveRuntimeOwnerHook();
  proveArchiveVerticalSlice();
  console.log('Civication History Go knowledge -> choice affordance: OK');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
