import fs from 'node:fs';

const fallbackPattern = /(?<indent>\s*)if \(normalized\.length >= 2\) return normalized;\n\k<indent>\n\k<indent>return \[\n[\s\S]*?label: "Gjør dette ryddig og dokumenter det"[\s\S]*?label: "Løs det raskt og gå videre"[\s\S]*?\n\k<indent>\];/;

for (const file of [
  'js/Civication/systems/civicationDailyMailBuilder.js',
  'js/Civication/systems/civicationWorkdayMailBuilder.js'
]) {
  const source = fs.readFileSync(file, 'utf8');
  const matches = source.match(fallbackPattern);
  if (!matches) throw new Error(`Expected synthetic choice block in ${file}`);
  const next = source.replace(fallbackPattern, `${matches.groups.indent}return normalized;`);
  if (next.includes('__civi_fallback_choice') || next.includes('Gjør dette ryddig og dokumenter det') || next.includes('Løs det raskt og gå videre')) {
    throw new Error(`Synthetic choice marker/text remains in ${file}`);
  }
  fs.writeFileSync(file, next);
}

const docPath = 'data/Civication/SCENE_PIPELINE_V1.md';
let doc = fs.readFileSync(docPath, 'utf8');
const replacements = [
  [
    'Den globale auditten står fortsatt i `observe`. Generiske standardvalg, svarwrappere, gammel dagskvote og manglende compiled registry er separate, synlige porter som ennå ikke er lukket.',
    'Den globale auditten står fortsatt i `observe`. Generiske standardvalg er nå fjernet fra både legacy-Daily og `CivicationSceneCatalog`; svarwrappere, interaksjonsklassifisering, gammel dagskvote og manglende compiled registry er separate, synlige porter som ennå ikke er lukket.'
  ],
  [
    '1. `CivicationSceneCatalog` bevarer foreløpig de eksisterende generiske standardvalgene når en kilde har færre enn to valg. Det er forbudt i målkontrakten og lukkes i neste interaksjonsport.',
    '1. Generiske standardvalg er fjernet fra både legacy-Daily og `CivicationSceneCatalog`. Neste interaksjonsport skal klassifisere `decision`, `task`, `info` og `ack` eksplisitt og blokkere semantisk erstatning av mangelfullt innhold.'
  ],
  [
    'Global `enforcement_mode` forblir `observe` til generiske fallbackvalg, svarpipeline, dagsbudsjett og compiled registry er migrert.',
    'Global `enforcement_mode` forblir `observe` til interaksjonsklassifisering, svarpipeline, dagsbudsjett og compiled registry er migrert.'
  ],
  [
    '5. **Neste:** Fjern generiske runtimevalg og krev korrekt `decision`, `task`, `info` eller `ack`.',
    '5. **Pågår:** Lås interaksjonskontrakten.\n   - **Fullført 4D:** Fjern generiske runtimevalg; runtime bevarer bare kildeeide valg.\n   - **Neste 5A:** Krev korrekt `decision`, `task`, `info` eller `ack` og eksplisitt blokkering av mangelfullt innhold.'
  ]
];
for (const [before, after] of replacements) {
  if (!doc.includes(before)) throw new Error(`Expected pipeline text not found: ${before.slice(0, 90)}`);
  doc = doc.replace(before, after);
}
fs.writeFileSync(docPath, doc);

const testPath = 'tests/civication-scene-interaction-no-fallback.test.js';
fs.writeFileSync(testPath, `const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");
const dailyPath = path.join(repoRoot, "js/Civication/systems/civicationDailyMailBuilder.js");
const workdaySource = fs.readFileSync(workdayPath, "utf8");
const dailySource = fs.readFileSync(dailyPath, "utf8");

for (const source of [workdaySource, dailySource]) {
  assert(!source.includes("__civi_fallback_choice"));
  assert(!source.includes("Gjør dette ryddig og dokumenter det"));
  assert(!source.includes("Løs det raskt og gå videre"));
}

const windowObject = {
  DEBUG: false,
  CivicationState: {
    getState: () => ({}),
    getActivePosition: () => null
  },
  CivicationMailRuntime: {
    makeCandidateMailsForActiveRole: async () => []
  }
};
windowObject.window = windowObject;
vm.runInContext(workdaySource, vm.createContext({
  window: windowObject,
  console,
  Date,
  Array,
  Object,
  String,
  Number,
  Promise,
  Set,
  Map,
  Math
}), { filename: workdayPath });

const normalize = windowObject.CivicationSceneCatalog.normalizeChoices;
assert.equal(typeof normalize, "function");
assert.deepEqual(Array.from(normalize([])), []);
const one = Array.from(normalize([{ id: "ack", label: "Bekreft" }]));
assert.equal(one.length, 1);
assert.equal(one[0].id, "ack");
assert.equal(one[0].label, "Bekreft");
const two = Array.from(normalize([
  { id: "A", label: "Undersøk" },
  { id: "B", label: "Eskaler" }
]));
assert.equal(two.length, 2);
assert.deepEqual(two.map((choice) => choice.id), ["A", "B"]);
assert(two.every((choice) => choice.__civi_fallback_choice !== true));

console.log("civication-scene-interaction-no-fallback.test.js: PASS");
`);

console.log('Scene Interaction 4D migration prepared');
