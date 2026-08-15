#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const loader = fs.readFileSync(path.join(repoRoot, "js/Civication/civicationShellLoader.js"), "utf8");
const match = loader.match(/const DAY_SCRIPTS = \[([\s\S]*?)\n\s*\];/);
assert(match, "civicationShellLoader skal ha en lesbar DAY_SCRIPTS-liste");
const dayScripts = Array.from(match[1].matchAll(/"([^"]+\.js)"/g), (row) => row[1]);
const dayPatchesPath = "js/Civication/systems/day/dayPatches.js";
const directorPath = "js/Civication/systems/day/dayChoiceDirector.js";
assert(dayScripts.includes(dayPatchesPath));
assert(dayScripts.includes(directorPath));
assert(dayScripts.indexOf(dayPatchesPath) < dayScripts.indexOf(directorPath));

const owners = [];
for (const script of dayScripts) {
  const source = fs.readFileSync(path.join(repoRoot, script), "utf8");
  if (/(?:CivicationEventEngine\.prototype|proto)\.answer\s*=/.test(source)) owners.push(script);
}
assert.deepEqual(owners, [directorPath], `ChoiceDirector skal være eneste aktive answer-eier; fant: ${owners.join(", ") || "ingen"}`);

const dayPatches = fs.readFileSync(path.join(repoRoot, dayPatchesPath), "utf8");
assert.match(dayPatches, /ANSWER_MIDDLEWARE_PRIORITY\s*=\s*90/);
assert.match(dayPatches, /name:\s*ANSWER_MIDDLEWARE_NAME/);
assert.match(dayPatches, /priority:\s*ANSWER_MIDDLEWARE_PRIORITY/);
console.log("civication-choice-director-answer-ownership.test.js: PASS");
