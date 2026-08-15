import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function replaceOnce(path, before, after, label) {
  let text = fs.readFileSync(path, 'utf8');
  if (text.includes(after)) return;
  const count = text.split(before).length - 1;
  if (count !== 1) throw new Error(`${path}: expected one ${label || 'replacement'} target, found ${count}`);
  text = text.replace(before, after);
  fs.writeFileSync(path, text, 'utf8');
}

const loaderPath = 'js/Civication/civicationShellLoader.js';
{
  let text = fs.readFileSync(loaderPath, 'utf8');
  const runtimeLine = '    "js/Civication/systems/civicationMailRuntime.js",';
  const interactionLine = '    "js/Civication/systems/civicationSceneInteraction.js",';
  if (!text.includes(interactionLine)) {
    const count = text.split(runtimeLine).length - 1;
    if (count !== 2) throw new Error(`${loaderPath}: expected two MailRuntime loader entries, found ${count}`);
    text = text.replaceAll(runtimeLine, `${interactionLine}\n${runtimeLine}`);
    fs.writeFileSync(loaderPath, text, 'utf8');
  }
}

const globalsPath = 'schemas/app-globals.d.ts';
replaceOnce(
  globalsPath,
  '    CivicationChoiceDirector?: any;\n',
  '    CivicationChoiceDirector?: any;\n    CivicationSceneInteraction?: any;\n',
  'SceneInteraction global declaration'
);

const workdayPath = 'js/Civication/systems/civicationWorkdayMailBuilder.js';
replaceOnce(
  workdayPath,
  `  function uniqueStrings(values) {\n    return [...new Set((Array.isArray(values) ? values : []).map(norm).filter(Boolean))];\n  }\n`,
  `  function uniqueStrings(values) {\n    return [...new Set((Array.isArray(values) ? values : []).map(norm).filter(Boolean))];\n  }\n  function getSceneInteraction() {\n    return window.CivicationSceneInteraction || null;\n  }\n  function decorateSceneInteraction(scene) {\n    const interaction = getSceneInteraction();\n    return typeof interaction?.decorate === "function" ? interaction.decorate(scene) : scene;\n  }\n  function isActionableSceneCandidate(scene) {\n    const interaction = getSceneInteraction();\n    return typeof interaction?.isActionable === "function" ? interaction.isActionable(scene) : true;\n  }\n  function filterActionableSceneCandidates(candidates) {\n    const interaction = getSceneInteraction();\n    if (typeof interaction?.filterActionable !== "function") return Array.isArray(candidates) ? candidates : [];\n    return interaction.filterActionable(candidates);\n  }\n`,
  'SceneInteraction helpers'
);

replaceOnce(
  workdayPath,
  `          out.push({\n            ...mail,\n            id,\n            category: norm(catalog?.category),\n            role_scope: norm(mail?.role_scope || catalog?.role_scope),\n            mail_type: norm(mail?.mail_type || catalogType || "job"),\n            mail_family: norm(mail?.mail_family || familyId),\n            choices: normalizeChoices(mail?.choices),\n            situation: Array.isArray(mail?.situation)\n              ? mail.situation.map(norm).filter(Boolean)\n              : [norm(mail?.summary)].filter(Boolean),\n            scene_catalog_source_path: norm(sourcePath),\n            scene_catalog_version: SCENE_CATALOG_VERSION\n          });`,
  `          out.push(decorateSceneInteraction({\n            ...mail,\n            id,\n            category: norm(catalog?.category),\n            role_scope: norm(mail?.role_scope || catalog?.role_scope),\n            mail_type: norm(mail?.mail_type || catalogType || "job"),\n            mail_family: norm(mail?.mail_family || familyId),\n            choices: normalizeChoices(mail?.choices),\n            situation: Array.isArray(mail?.situation)\n              ? mail.situation.map(norm).filter(Boolean)\n              : [norm(mail?.summary)].filter(Boolean),\n            scene_catalog_source_path: norm(sourcePath),\n            scene_catalog_version: SCENE_CATALOG_VERSION\n          }));`,
  'SceneCatalog interaction decoration'
);

replaceOnce(
  workdayPath,
  '      const mails = await decorateMails(flattened);\n',
  '      const mails = (await decorateMails(flattened)).map(decorateSceneInteraction);\n',
  'decorated catalog interaction refresh'
);

replaceOnce(
  workdayPath,
  '    const safe = (Array.isArray(pool) ? pool : []).filter((mail) => mailMatchesDailyProgression(mail, context));\n',
  '    const safe = (Array.isArray(pool) ? pool : [])\n      .filter((mail) => mailMatchesDailyProgression(mail, context))\n      .filter(isActionableSceneCandidate);\n',
  'Daily actionable candidate filter'
);

replaceOnce(
  workdayPath,
  `    const candidates = await director.getWorkCandidates(active, state, {\n      consumer: "event_engine_build_mail_pool"\n    });\n    const suppressFallback = candidates?.__career_outcome_terminal_closed === true;`,
  `    const candidates = await director.getWorkCandidates(active, state, {\n      consumer: "event_engine_build_mail_pool"\n    });\n    const terminalClosed = candidates?.__career_outcome_terminal_closed === true;\n    const interactionSuppressed = candidates?.__scene_interaction_suppress_legacy_fallback === true;\n    const suppressFallback = terminalClosed || interactionSuppressed;`,
  'EventEngine interaction fallback suppression'
);

replaceOnce(
  workdayPath,
  `        __runtime_candidate_count: taggedRuntimeMails.length,\n        __legacy_fallback: false,\n        __terminal_closed: suppressFallback`,
  `        __runtime_candidate_count: taggedRuntimeMails.length,\n        __legacy_fallback: false,\n        __terminal_closed: terminalClosed,\n        __interaction_suppressed: interactionSuppressed`,
  'EventEngine interaction metadata'
);

replaceOnce(
  workdayPath,
  `        selected_family: norm(first?.mail_family) || null,\n        terminal_closed: candidates?.__career_outcome_terminal_closed === true`,
  `        selected_family: norm(first?.mail_family) || null,\n        terminal_closed: candidates?.__career_outcome_terminal_closed === true,\n        interaction_input_count: Number(candidates?.__scene_interaction_input_count || 0),\n        interaction_blocked_count: Number(candidates?.__scene_interaction_blocked_count || 0),\n        interaction_passive_count: Number(candidates?.__scene_interaction_passive_count || 0)`,
  'SceneDirector interaction trace metadata'
);

replaceOnce(
  workdayPath,
  `    async function getWorkCandidates(active, state = getState(), options = {}) {\n      const candidates = await boundSourceSelector(active, state);\n      const normalized = Array.isArray(candidates) ? candidates : [];\n      recordSelection(active, normalized, options);\n      return normalized;\n    }`,
  `    async function getWorkCandidates(active, state = getState(), options = {}) {\n      const candidates = await boundSourceSelector(active, state);\n      const normalized = filterActionableSceneCandidates(candidates);\n      recordSelection(active, normalized, options);\n      return normalized;\n    }`,
  'SceneDirector interaction filter'
);

const taskGatePath = 'js/Civication/systems/civicationDailyTaskGates.js';
replaceOnce(
  taskGatePath,
  '    return {\n      id: `${roleScope}_${gateId}_${date}`,\n',
  '    const event = {\n      id: `${roleScope}_${gateId}_${date}`,\n',
  'task gate event capture'
);
replaceOnce(
  taskGatePath,
  `      }\n    };\n  }\n\n  function defaultGates() {`,
  `      }\n    };\n    const interaction = window.CivicationSceneInteraction;\n    return typeof interaction?.decorate === "function" ? interaction.decorate(event) : event;\n  }\n\n  function defaultGates() {`,
  'task gate shared interaction decoration'
);

const docPath = 'data/Civication/SCENE_PIPELINE_V1.md';
{
  let text = fs.readFileSync(docPath, 'utf8');
  if (!text.includes('## Scene Interaction 4E: eksplisitt interaksjonskontrakt')) {
    text = text.trimEnd() + `\n\n## Scene Interaction 4E: eksplisitt interaksjonskontrakt\n\n\`CivicationSceneInteraction\` er nå én delt runtime-adapter for Scene Contract v1-modusene \`decision\`, \`task\`, \`ack\` og \`info\`. Legacy-scener uten eksplisitt modus klassifiseres deterministisk fra kildeeide strukturer: oppgavekontrakt/-signal → \`task\`, minst to valg → \`decision\`, ett valg → \`ack\`, ingen valg → \`info\`. En eksplisitt modus blir aldri nedgradert for å få scenen til å passe.\n\nSceneDirector sender bare gyldige, handlingskrevende scener inn i den eksisterende svarsløyfen. En eksplisitt \`decision\` med færre enn to reelle valg blokkeres som \`decision_requires_two_choices\`; passive \`info\`-scener beholdes som gyldig semantikk i katalogen, men materialiseres ikke som åpne dagsrader før en egen passiv leveringsport finnes. Når canonical-kilden finnes men bare består av blokkert/passivt innhold, er legacy-gameplay-fallback også sperret slik at runtime ikke erstatter semantikken med et annet spillvalg. Daily task gates bruker samme kontrakt og mapper eksisterende \`task_gate_id\` + \`expected_output\` til canonical \`task_contract\` uten å dikte ny oppgavelogikk. ChoiceDirector-eierskap er fortsatt uendret i denne porten.\n`;
    fs.writeFileSync(docPath, text, 'utf8');
  }
}

const checks = [
  ['--check', 'js/Civication/systems/civicationSceneInteraction.js'],
  ['--check', 'js/Civication/systems/civicationWorkdayMailBuilder.js'],
  ['--check', 'js/Civication/systems/civicationDailyTaskGates.js'],
  ['tests/civication-scene-interaction-contract.test.js'],
  ['tests/civication-scene-interaction-no-fallback.test.js'],
  ['tests/civication-scene-director-ownership.test.js'],
  ['tests/civication-scene-director-daily-catalog.test.js'],
  ['tests/civication-task-gate-inline.test.js'],
  ['tests/civication-scene-pipeline-reachability.test.js'],
  ['scripts/audit-civication-scene-pipeline.mjs']
];
for (const args of checks) {
  execFileSync(process.execPath, args, { stdio: 'inherit' });
}

console.log('Civication Scene Interaction 4E materialized and validated.');