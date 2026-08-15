import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const runtimeFiles = [
  'js/Civication/systems/civicationDailyMailBuilder.js',
  'js/Civication/systems/civicationWorkdayMailBuilder.js'
];

const forbidden = [
  '__civi_fallback_choice',
  'Gjør dette ryddig og dokumenter det',
  'Løs det raskt og gå videre'
];

function removeSyntheticFallback(path) {
  let text = fs.readFileSync(path, 'utf8');
  const firstLabel = 'label: "Gjør dette ryddig og dokumenter det"';
  const secondLabel = 'label: "Løs det raskt og gå videre"';
  const first = text.indexOf(firstLabel);
  const second = text.indexOf(secondLabel);

  if (first < 0 && second < 0) {
    for (const value of forbidden) {
      if (text.includes(value)) throw new Error(`${path}: forbidden fallback residue without recognized pair: ${value}`);
    }
    return;
  }
  if (first < 0 || second < 0 || second < first) {
    throw new Error(`${path}: synthetic fallback pair is incomplete`);
  }

  const statement = 'if (normalized.length >= 2) return normalized;';
  const start = text.lastIndexOf(statement, first);
  if (start < 0) throw new Error(`${path}: normalizeChoices fallback start not found`);
  const lineStart = text.lastIndexOf('\n', start) + 1;
  const indent = text.slice(lineStart, start);
  const tail = text.slice(second);
  const close = tail.match(/\n(\s*)\];/);
  if (!close || close.index == null) throw new Error(`${path}: normalizeChoices fallback end not found`);
  const end = second + close.index + close[0].length;

  text = text.slice(0, lineStart) + `${indent}return normalized;` + text.slice(end);
  for (const value of forbidden) {
    if (text.includes(value)) throw new Error(`${path}: forbidden fallback remains: ${value}`);
  }
  fs.writeFileSync(path, text, 'utf8');
}

for (const path of runtimeFiles) removeSyntheticFallback(path);

const docPath = 'data/Civication/SCENE_PIPELINE_V1.md';
let doc = fs.readFileSync(docPath, 'utf8');
const section = `\n## Scene Interaction 4D: ingen syntetiske runtimevalg\n\nRuntime genererer ikke lenger standardvalgene «Gjør dette ryddig og dokumenter det» / «Løs det raskt og gå videre» når kildeinnholdet har færre enn to valg. Både legacy-Daily-normaliseringen og \`CivicationSceneCatalog\` bevarer nå bare kildeeide valg: null valg forblir null, ett eksplisitt valg forblir ett, og to eller flere reelle valg normaliseres uten semantisk erstatning.\n\nDette lukker bare den syntetiske fallbacken. Neste interaksjonsport skal klassifisere \`decision\`, \`task\`, \`info\` og \`ack\` eksplisitt og blokkere mangelfulle beslutningsscener i stedet for å dikte gameplay. Den globale Scene Pipeline-auditen forblir derfor i \`observe\` inntil svarpipeline, interaksjonsklassifisering, dagsbudsjett og compiled registry er migrert.\n`;
if (!doc.includes('## Scene Interaction 4D: ingen syntetiske runtimevalg')) {
  doc = doc.trimEnd() + '\n' + section;
  fs.writeFileSync(docPath, doc, 'utf8');
}

const testPath = 'tests/civication-scene-interaction-no-fallback.test.js';
fs.writeFileSync(testPath, `const assert = require("node:assert/strict");\nconst fs = require("node:fs");\nconst path = require("node:path");\nconst vm = require("node:vm");\n\nconst repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");\nconst workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");\nconst dailyPath = path.join(repoRoot, "js/Civication/systems/civicationDailyMailBuilder.js");\nconst workdaySource = fs.readFileSync(workdayPath, "utf8");\nconst dailySource = fs.readFileSync(dailyPath, "utf8");\n\nfor (const source of [workdaySource, dailySource]) {\n  assert(!source.includes("__civi_fallback_choice"));\n  assert(!source.includes("Gjør dette ryddig og dokumenter det"));\n  assert(!source.includes("Løs det raskt og gå videre"));\n}\n\nconst windowObject = {\n  DEBUG: false,\n  CivicationState: {\n    getState: () => ({}),\n    getActivePosition: () => null\n  },\n  CivicationMailRuntime: {\n    makeCandidateMailsForActiveRole: async () => []\n  }\n};\nwindowObject.window = windowObject;\nwindowObject.addEventListener = () => {};\nconst documentObject = { readyState: "loading", addEventListener: () => {} };\nconst context = vm.createContext({\n  window: windowObject,\n  document: documentObject,\n  console,\n  Date,\n  Array,\n  Object,\n  String,\n  Number,\n  Promise,\n  Set,\n  Map,\n  Math,\n  Event: function Event(type) { this.type = type; }\n});\nvm.runInContext(workdaySource, context, { filename: workdayPath });\n\nconst normalize = windowObject.CivicationSceneCatalog?.normalizeChoices;\nassert.equal(typeof normalize, "function");\nassert.deepEqual(Array.from(normalize([])), []);\nconst one = Array.from(normalize([{ id: "ack", label: "Bekreft" }]));\nassert.equal(one.length, 1);\nassert.equal(one[0].id, "ack");\nassert.equal(one[0].label, "Bekreft");\nconst two = Array.from(normalize([\n  { id: "A", label: "Undersøk" },\n  { id: "B", label: "Eskaler" }\n]));\nassert.equal(two.length, 2);\nassert.deepEqual(two.map((choice) => choice.id), ["A", "B"]);\nassert(two.every((choice) => choice.__civi_fallback_choice !== true));\n\nconsole.log("civication-scene-interaction-no-fallback.test.js: PASS");\n`, 'utf8');

const reachabilityPath = 'tests/civication-scene-pipeline-reachability.test.js';
let reachability = fs.readFileSync(reachabilityPath, 'utf8');
const legacyFallbackAssertion = '    assert(actual.runtime.generic_fallback_choice_sources.some((file) => file.endsWith("civicationDailyMailBuilder.js")));';
const migratedFallbackAssertions = [
  '    assert(!actual.runtime.generic_fallback_choice_sources.some((file) => file.endsWith("civicationDailyMailBuilder.js")), "Daily-builder skal ikke lenger generere fallbackvalg");',
  '    assert(!actual.runtime.generic_fallback_choice_sources.some((file) => file.endsWith("civicationWorkdayMailBuilder.js")), "Workday-builder skal ikke lenger generere fallbackvalg");'
].join('\n');
if (reachability.includes(legacyFallbackAssertion)) {
  reachability = reachability.replace(legacyFallbackAssertion, migratedFallbackAssertions);
  fs.writeFileSync(reachabilityPath, reachability, 'utf8');
} else if (!reachability.includes('Daily-builder skal ikke lenger generere fallbackvalg') || !reachability.includes('Workday-builder skal ikke lenger generere fallbackvalg')) {
  throw new Error(`${reachabilityPath}: expected legacy or migrated fallback assertion not found`);
}

fs.rmSync('.github/workflows/civication-scene-interaction-4d-temp.yml', { force: true });
fs.rmSync('.github/civication-scene-interaction-4d-trigger', { force: true });

const checks = [
  ['tests/civication-scene-interaction-no-fallback.test.js'],
  ['tests/civication-scene-director-daily-catalog.test.js'],
  ['tests/civication-scene-director-ownership.test.js'],
  ['tests/civication-scene-pipeline-reachability.test.js'],
  ['scripts/audit-civication-scene-pipeline.mjs']
];
for (const args of checks) {
  execFileSync(process.execPath, args, { stdio: 'inherit' });
}

console.log('Civication Scene Interaction 4D materialized and validated.');