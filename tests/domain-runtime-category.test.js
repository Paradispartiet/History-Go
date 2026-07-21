const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function runBrowserScript(file, windowOverrides = {}) {
  const source = fs.readFileSync(file, "utf8");
  const window = { DEBUG: false, ...windowOverrides };
  const context = vm.createContext({ window, console });
  vm.runInContext(source, context, { filename: file });
  return window;
}

const contract = JSON.parse(fs.readFileSync("data/categories/category_contract.json", "utf8"));
const registryWindow = runBrowserScript("js/DomainRegistry.js");
const registry = registryWindow.DomainRegistry;

assert.equal(registry.toFagSubjectId("populaerkultur"), "popkultur");
assert.equal(registry.toFagSubjectId("popkultur"), "popkultur");
assert.equal(registry.toRuntimeCategoryId("popkultur"), "populaerkultur");
assert.equal(registry.toRuntimeCategoryId("populaerkultur"), "populaerkultur");
assert.equal(registry.toFagSubjectId("teater"), "scenekunst");
assert.equal(registry.toRuntimeCategoryId("teater"), "scenekunst");
assert.equal(registry.toFagSubjectId("film"), "film_tv");
assert.equal(registry.toRuntimeCategoryId("film"), "film_tv");
assert.equal(registry.toFagSubjectId("journalistikk"), "media");
assert.equal(registry.toRuntimeCategoryId("journalistikk"), "media");
assert.deepEqual(registry.list().slice().sort(), contract.fagSubjects.slice().sort());
assert.deepEqual(registry.listRuntimeCategories().slice().sort(), contract.runtimeCategories.slice().sort());

assert.equal(
  registry.file("quiz", "popkultur"),
  "data/quiz/quiz_populaerkultur.json"
);
assert.equal(
  registry.file("quiz", "populaerkultur"),
  "data/quiz/quiz_populaerkultur.json"
);
assert.equal(
  registry.file("quiz", "teater"),
  "data/quiz/quiz_scenekunst.json"
);

const runtimeWindow = runBrowserScript("js/core/domainRuntime.js", {
  DomainRegistry: registry
});
assert.equal(runtimeWindow.HGDomainRuntime.toRuntimeCategoryId("popkultur"), "populaerkultur");
assert.equal(runtimeWindow.HGDomainRuntime.toRuntimeCategoryId("teater"), "scenekunst");
assert.deepEqual(
  JSON.parse(JSON.stringify(runtimeWindow.HGDomainRuntime.normalizeCategoryMap({
    popkultur: { points: 2 }
  }))),
  { populaerkultur: { points: 2 } }
);
assert.deepEqual(
  JSON.parse(JSON.stringify(runtimeWindow.HGDomainRuntime.normalizeCategoryMap({
    popkultur: { points: 2 },
    populaerkultur: { points: 3 }
  }))),
  { populaerkultur: { points: 5 } }
);
assert.deepEqual(Object.keys(runtimeWindow.HGDomainRuntime).sort(), [
  "normalizeCategoryMap",
  "toFagSubjectId",
  "toRuntimeCategoryId"
]);

const domainRuntimeSource = fs.readFileSync("js/core/domainRuntime.js", "utf8");
assert.doesNotMatch(domainRuntimeSource, /Storage\.prototype/);
assert.doesNotMatch(domainRuntimeSource, /installStorageGuard|normalizeStoragePayload/);

const quizSource = fs.readFileSync("js/quizzes.js", "utf8");
assert.match(quizSource, /function runtimeCategoryId\(value\)/);
assert.match(quizSource, /function getQuizCategoryId\(questions\) \{\s*return runtimeCategoryId\(/);
assert.match(quizSource, /const cat = runtimeCategoryId\(categoryId\)/);
assert.match(quizSource, /const key = runtimeCategoryId\(categoryId\)/);
assert.doesNotMatch(quizSource, /merits\[s\(categoryId\)\]/);

const obsoleteQuizPath = `data/quiz/quiz_${"pop" + "kultur"}.json`;
for (const testFile of fs.readdirSync("tests").filter(file => file.endsWith(".test.js"))) {
  assert.equal(
    fs.readFileSync(`tests/${testFile}`, "utf8").includes(obsoleteQuizPath),
    false,
    `${testFile} must not expect the obsolete popkultur quiz path`
  );
}

console.log("domain runtime category contract: ok");
